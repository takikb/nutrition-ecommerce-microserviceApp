# =========================================================================
# 🐒 GLOBAL MONKEY PATCH: Python 3.10+ Compatibility with Legacy NATS STAN
# Modern Python removed the 'loop' argument from asyncio.Queue and Event.
# We strip it out globally so the legacy stan.py library runs perfectly!
# =========================================================================
import asyncio

# 1. Patch asyncio.Queue
original_queue_init = asyncio.Queue.__init__
def patched_queue_init(self, maxsize=0, *args, **kwargs):
    kwargs.pop('loop', None) # Safely drop the 'loop' argument
    original_queue_init(self, maxsize, *args, **kwargs)
asyncio.Queue.__init__ = patched_queue_init

# 2. Patch asyncio.Event (just in case)
original_event_init = asyncio.Event.__init__
def patched_event_init(self, *args, **kwargs):
    kwargs.pop('loop', None) # Safely drop the 'loop' argument
    original_event_init(self, *args, **kwargs)
asyncio.Event.__init__ = patched_event_init
# =========================================================================


from fastapi import FastAPI
from contextlib import asynccontextmanager

# Import NATS Listener and DB logic
from src.events.nats_listener import run_nats_listener
from src.database.database import Base, engine

# Import our new API Router!
from src.api.recommendations import router as recommendations_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 AI Service is starting up...")
    
    # Create SQLite tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    # Start NATS listener
    task = asyncio.create_task(run_nats_listener())
    
    yield
    
    print("🛑 AI Service is shutting down...")
    task.cancel()

app = FastAPI(
    title="AI Recommendation Service",
    lifespan=lifespan
)

# Register the routes!
app.include_router(recommendations_router)

@app.get("/api/v1/recommendations/health")
def health_check():
    return {"status": "healthy"}