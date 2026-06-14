import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';

import { UserRole, User } from '../models/user';
import { VendorProfile } from '../models/vendor-profile';
import { HealthProfile, Gender, PrimaryHealthGoals, ActivityLevel } from '../models/health-profile';
import { BadRequestError, validateRequest, MedicalCondition, Allergy, requireAuth, requireRole } from '@d-ziet/common-lib';
import { natsWrapper } from '../nats-wrapper';

import { UserUpdatedPublisher } from '../events/publishers/user-updated-publisher';
import { HealthProfileUpdatedPublisher } from '../events/publishers/health-profile-updated-publisher';
import { VendorProfileUpdatedPublisher } from '../events/publishers/vendor-profile-updated-publisher';

const router = express.Router();

router.put(
  '/api/users/update',
  requireAuth, requireRole([UserRole.CUSTOMER, UserRole.VENDOR]),
  [
    body('fullName')
      .trim()
      .notEmpty()
      .withMessage('Full name is required'),

    // Customer-specific validations evaluated against the JWT role payload [4]
    body('healthData')
      .if((value, { req }) => req.currentUser?.role === UserRole.CUSTOMER)
      .notEmpty()
      .withMessage('Health data is required for customers'),

    body('healthData.gender')
      .if((value, { req }) => req.currentUser?.role === UserRole.CUSTOMER)
      .isIn(Object.values(Gender))
      .withMessage('Invalid gender specified'),

    body('healthData.dateOfBirth')
      .if((value, { req }) => req.currentUser?.role === UserRole.CUSTOMER)
      .isISO8601()
      .withMessage('Date of birth must be a valid ISO8601 date'),

    body('healthData.heightCM')
      .if((value, { req }) => req.currentUser?.role === UserRole.CUSTOMER)
      .isFloat({ min: 50, max: 250 })
      .withMessage('Height must be between 50 and 250 cm'),

    body('healthData.weightKG')
      .if((value, { req }) => req.currentUser?.role === UserRole.CUSTOMER)
      .isFloat({ min: 30, max: 300 })
      .withMessage('Weight must be between 30 and 300 kg'),

    body('healthData.primaryHealthGoal')
      .if((value, { req }) => req.currentUser?.role === UserRole.CUSTOMER)
      .isIn(Object.values(PrimaryHealthGoals))
      .withMessage('Invalid primary health goal specified'),

    body('healthData.medicalCondition')
      .if((value, { req }) => req.currentUser?.role === UserRole.CUSTOMER)
      .optional()
      .isArray()
      .withMessage('Medical conditions must be an array'),

    body('healthData.allergy')
      .if((value, { req }) => req.currentUser?.role === UserRole.CUSTOMER)
      .optional()
      .isArray()
      .withMessage('Allergies must be an array'),

    body('healthData.activityLevel')
      .if((value, { req }) => req.currentUser?.role === UserRole.CUSTOMER)
      .isIn(Object.values(ActivityLevel))
      .withMessage('Invalid activity level specified'),

    // Vendor-specific validations evaluated against the JWT role payload [4]
    body('vendorData')
      .if((value, { req }) => req.currentUser?.role === UserRole.VENDOR)
      .notEmpty()
      .withMessage('Vendor data is required for vendors'),

    body('vendorData.displayName')
      .if((value, { req }) => req.currentUser?.role === UserRole.VENDOR)
      .isLength({ min: 3, max: 20 })
      .withMessage('Display name must be between 3 and 20 characters'),

    body('vendorData.bio')
      .if((value, { req }) => req.currentUser?.role === UserRole.VENDOR)
      .optional()
      .isLength({ max: 500 })
      .withMessage('Bio must be less than 500 characters'),

    body('vendorData.phoneNumber')
      .if((value, { req }) => req.currentUser?.role === UserRole.VENDOR)
      .trim()
      .notEmpty()
      .isMobilePhone('any', { strictMode: true })
      .withMessage('Phone number is required, must be valid, and include country code (e.g. +213)'),

    body('vendorData.location.address')
      .if((value, { req }) => req.currentUser?.role === UserRole.VENDOR)
      .trim()
      .notEmpty()
      .withMessage('Address is required for vendors'),

    body('vendorData.location.wilaya')
      .if((value, { req }) => req.currentUser?.role === UserRole.VENDOR)
      .trim()
      .notEmpty()
      .withMessage('Wilaya is required for vendors'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { fullName, healthData, vendorData } = req.body;
    const { id, email, role } = req.currentUser!;

    // 1. Fetch and update core User database document
    const user = await User.findById(id);
    if (!user) {
      throw new BadRequestError('User does not exist');
    }

    user.set({ fullName });
    await user.save();

    let healthProfile = null;
    let vendorProfile = null;

    // 2. Fetch or dynamically build the profile record defensively [4]
    if (role === UserRole.CUSTOMER) {
      healthProfile = await HealthProfile.findOne({ userId: id });

      if (!healthProfile) {
        healthProfile = HealthProfile.build({
          userId: id,
          gender: healthData.gender,
          dateOfBirth: new Date(healthData.dateOfBirth),
          heightCM: healthData.heightCM,
          weightKG: healthData.weightKG,
          activityLevel: healthData.activityLevel,
          medicalCondition: healthData.medicalCondition,
          allergy: healthData.allergy,
          primaryHealthGoal: healthData.primaryHealthGoal,
        });
      } else {
        healthProfile.set({
          gender: healthData.gender,
          dateOfBirth: new Date(healthData.dateOfBirth),
          heightCM: healthData.heightCM,
          weightKG: healthData.weightKG,
          activityLevel: healthData.activityLevel,
          medicalCondition: healthData.medicalCondition,
          allergy: healthData.allergy,
          primaryHealthGoal: healthData.primaryHealthGoal,
        });
      }
      await healthProfile.save();
    }

    if (role === UserRole.VENDOR) {
      vendorProfile = await VendorProfile.findOne({ userId: id });

      if (!vendorProfile) {
        vendorProfile = VendorProfile.build({
          userId: id,
          displayName: vendorData.displayName,
          bio: vendorData.bio || '',
          phoneNumber: vendorData.phoneNumber,
          location: vendorData.location,
        });
      } else {
        vendorProfile.set({
          displayName: vendorData.displayName,
          bio: vendorData.bio || '',
          phoneNumber: vendorData.phoneNumber,
          location: vendorData.location,
        });
      }
      await vendorProfile.save();
    }

    // 3. Publish sequential NATS events across the cluster [4]
    await new UserUpdatedPublisher(natsWrapper.client).publish({
      id: user.id,
      version: user.version,
      email: user.email,
      fullName: user.fullName,
      role: user.role as any,
      isActive: user.isActive
    });

    if (role === UserRole.CUSTOMER && healthProfile) {
      await new HealthProfileUpdatedPublisher(natsWrapper.client).publish({
        id: healthProfile._id.toString(),
        userId: healthProfile.userId,
        version: healthProfile.version,
        gender: healthProfile.gender,
        dateOfBirth: healthProfile.dateOfBirth,
        heightCM: healthProfile.heightCM,
        weightKG: healthProfile.weightKG,
        calculatedBMI: healthProfile.calculatedBMI,
        calculatedBMR: healthProfile.calculatedBMR,
        calculatedTDEE: healthProfile.calculatedTDEE,
        activityLevel: healthProfile.activityLevel,
        primaryHealthGoal: healthProfile.primaryHealthGoal,
        medicalCondition: (healthProfile.medicalCondition || []) as MedicalCondition[],
        allergy: (healthProfile.allergy || []) as Allergy[]
      });
    }

    if (role === UserRole.VENDOR && vendorProfile) {
      await new VendorProfileUpdatedPublisher(natsWrapper.client).publish({
        id: vendorProfile._id.toString(),
        userId: vendorProfile.userId,
        version: vendorProfile.version,
        displayName: vendorProfile.displayName,
        phoneNumber: vendorProfile.phoneNumber,
        location: {
          address: vendorProfile.location.address,
          wilaya: vendorProfile.location.wilaya,
        }
      });
    }

    // 4. Regenerate JWT token
    const userJwt = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        isActive: user.isActive
      },
      process.env.JWT_KEY!
    );

    req.session = {
      jwt: userJwt,
    };

    res.status(200).send({
      message: 'User profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isActive: user.isActive
      },
      profile: healthProfile || vendorProfile
    });
  }
);

export { router as updateUserRouter };