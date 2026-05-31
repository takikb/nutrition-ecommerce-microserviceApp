"""NATS Streaming Listener for the AI Service."""

import asyncio
import json
import logging
import os
from pydantic import ValidationError

# NATS and STAN (NATS Streaming)
from nats.aio.client import Client as NATS
from stan.aio.client import Client as STAN

# Database and Models
from src.database.database import SessionLocal
from src.database.models import LocalHealthProfile, LocalProduct

# Schemas for validation
from src.schemas.api_schemas import HealthProfileEventData, ProductEventData

# ML Services (To calculate cluster_id on the fly)
from src.services.stage2_cluster import predict_cluster

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def run_nats_listener():
    """Connects to NATS Streaming and listens for events in the background."""
    nc = NATS()
    sc = STAN()

      # 🐒 MONKEY PATCH: Fix modern nats-py (2.x) compatibility with stan.py
    # This dynamically injects the active asyncio loop that STAN is looking for!
    # =========================================================================
    # Patch 1: Inject the active asyncio loop
    nc._loop = asyncio.get_running_loop()

    # Patch 2: Map the legacy publish_request method to the modern publish method
    async def patched_publish_request(subject, reply, payload):
        await nc.publish(subject, payload, reply=reply)
    nc.publish_request = patched_publish_request
    # ==

    # 1. READ ENVIRONMENT VARIABLES INJECTED BY YOUR KUBERNETES MANIFEST
    # (The second argument is the fallback/default if running locally)
    nats_url = os.environ.get("NATS_URL", "nats://localhost:4222")
    cluster_id = os.environ.get("NATS_CLUSTER_ID", "nutrition")
    
    # We fallback to a generic name if running outside K8s
    client_id = os.environ.get("NATS_CLIENT_ID", "ai-service-listener-local")


    try:
        # 2. Connect to NATS
        logger.info(f"Connecting to NATS at URL: {nats_url}")
        await nc.connect(nats_url)
        
        # 3. Connect to the STAN Streaming server using your cluster configuration
        logger.info(f"Connecting to STAN Cluster: '{cluster_id}' with Client ID: '{client_id}'")
        await sc.connect(cluster_id, client_id, nats=nc)

        logger.info("Successfully connected to NATS Streaming!")
    
    except Exception as e:
        logger.error(f"Failed to connect to NATS: {e}")
        return

    # =================================================================
    # CALLBACK: When a HealthProfile is created or updated
    # =================================================================
    async def on_health_profile(msg):
        try:
            # 1. Parse and Validate the incoming JSON using Pydantic
            raw_data = json.loads(msg.data.decode())
            data = HealthProfileEventData(**raw_data)
            
            # 2. Open a Database Session
            db = SessionLocal()
            try:
                # 3. Upsert Logic (Check if user exists)
                profile = db.query(LocalHealthProfile).filter_by(user_id=data.userId).first()
                if not profile:
                    profile = LocalHealthProfile(user_id=data.userId)
                    db.add(profile)
                
                # 4. Update fields (Extracting exactly what the AI needs)
                profile.gender = data.gender
                profile.tdee = data.calculatedTDEE
                profile.primary_health_goal = data.primaryHealthGoal
                profile.medical_conditions = data.medicalCondition
                profile.allergies = data.allergy
                
                db.commit()
                logger.info(f"💾 Saved HealthProfile for User: {data.userId}")
                
                # 5. Manual Acknowledgment (Like msg.ack() in TS)
                await sc.ack(msg)
                
            except Exception as db_err:
                db.rollback()
                logger.error(f"Database error saving HealthProfile: {db_err}")
            finally:
                db.close()
                
        except ValidationError as e:
            logger.error(f"Data Validation Error for HealthProfile: {e}")
            # If data is completely invalid, we might want to ack it anyway 
            # so it doesn't get stuck in an infinite retry loop.
            await msg.ack()

    # =================================================================
    # CALLBACK: When a Product is created or updated
    # =================================================================
    async def on_product(msg):
        try:
            raw_data = json.loads(msg.data.decode())
            data = ProductEventData(**raw_data)
            
            db = SessionLocal()
            try:
                if data.verificationStatus != 'approved':
                # If a product was previously approved but has now been edited, 
                # rejected, or set back to pending, delete it from our local recommendations db.
                    existing_product = db.query(LocalProduct).filter_by(id=data.id).first()
                    if existing_product:
                        db.delete(existing_product)
                        db.commit()
                        logger.info(f"Removed non-approved product from recommendations: {data.title} (Status: {data.verificationStatus})")
                    else:
                        logger.info(f"Skipped non-approved product event: {data.title} (Status: {data.verificationStatus})")
                    
                    # Acknowledge message processing is complete
                    await sc.ack(msg)
                    return

            # 1. Prepare Macros for the ML Model
                macros = {
                    "target_calories": float(data.calories),
                    "target_protein": float(data.proteinGrams),
                    "target_carbs": float(data.carbsGrams),
                    "target_fats": float(data.fatGrams)
                }
                
                # 2. Assign the K-Means Cluster ID right now! (So the Read Path is super fast)
                assigned_cluster = predict_cluster(macros)
                
                # 3. Upsert Product
                product = db.query(LocalProduct).filter_by(id=data.id).first()
                if not product:
                    product = LocalProduct(id=data.id)
                    db.add(product)
                
                product.title = data.title
                product.price_dzd = data.priceDZD
                product.calories = data.calories
                product.protein_g = data.proteinGrams
                product.carbs_g = data.carbsGrams
                product.fats_g = data.fatGrams
                product.contains_allergens = data.containsAllergens
                product.medical_conditions = data.MedicalCondition
                product.is_available = data.isAvailable
                product.cluster_id = assigned_cluster
                product.images = data.images
                
                db.commit()
                logger.info(f"💾 Saved Product: {data.title} (Cluster {assigned_cluster})")
                
                # 5. Manual Acknowledgment (Like msg.ack() in TS)
                await sc.ack(msg)
                
            except Exception as db_err:
                db.rollback()
                logger.error(f"Database error saving Product: {db_err}")
            finally:
                db.close()
                
        except ValidationError as e:
            logger.error(f"Data Validation Error for Product: {e}")
            await sc.ack(msg)

    # =================================================================
    # SUBSCRIPTION CONFIGURATION (Mirroring your TS Listener)
    # =================================================================
    QUEUE_GROUP = "ai-service-queue-group"
    
    # Subscribe to Health Profiles
    for subject in ["healthProfile:created", "healthProfile:updated"]:
        await sc.subscribe(
            subject,
            queue=QUEUE_GROUP,
            cb=on_health_profile,
            deliver_all_available=True,
            durable_name="ai-health-durable",
            manual_acks=True,
            ack_wait=5 # 5 seconds
        )

    # Subscribe to Products
    for subject in ["product:created", "product:updated"]:
        await sc.subscribe(
            subject,
            queue=QUEUE_GROUP,
            cb=on_product,
            deliver_all_available=True,
            durable_name="ai-product-durable",
            manual_acks=True,
            ack_wait=5
        )