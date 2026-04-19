import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

import { UserRole } from '../models/user';
import { User } from '../models/user';
import { VendorProfile } from '../models/vendor-profile';
import { HealthProfile, Gender, PrimaryHealthGoals, ActivityLevel } from '../models/health-profile';
import { BadRequestError, validateRequest } from '@d-ziet/common-lib';

const router = express.Router();

router.post(
  '/api/users/signup',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password')
      .trim()
      .isLength({ min: 6, max: 20 })
      .withMessage('Password must be between 6 and 20 characters'),
    body('fullName')
      .trim()
      .notEmpty()
      .withMessage('Full name is required'),
    body('role')
      .isIn([UserRole.CUSTOMER, UserRole.VENDOR])
      .withMessage('Invalid role specified'),

    // Customer-specific validations
    body('healthData')
      .if(body('role').equals(UserRole.CUSTOMER))
      .notEmpty()
      .withMessage('Health data is required for customers'),

    body('healthData.gender')
      .if(body('role').equals(UserRole.CUSTOMER))
      .isIn(Object.values(Gender))
      .withMessage('Invalid gender specified'),

    body('healthData.dateOfBirth')
      .if(body('role').equals(UserRole.CUSTOMER))
      .isISO8601()
      .withMessage('Date of birth must be a valid date'),

    body('healthData.heightCM')
      .if(body('role').equals(UserRole.CUSTOMER))
      .isFloat({ min: 50, max: 250 })
      .withMessage('Height must be between 50 and 250 cm'),

    body('healthData.weightKG')
      .if(body('role').equals(UserRole.CUSTOMER))
      .isFloat({ min: 30, max: 300 })
      .withMessage('Weight must be between 30 and 300 kg'),

    body('healthData.primaryHealthGoal')
      .if(body('role').equals(UserRole.CUSTOMER))
      .isIn(Object.values(PrimaryHealthGoals))
      .withMessage('Invalid primary health goal specified'),

    body('healthData.medicalConditions')
      .if(body('role').equals(UserRole.CUSTOMER))
      .optional()
      .isArray()
      .withMessage('Medical conditions must be an array'),

    body('healthData.allergies')
      .if(body('role').equals(UserRole.CUSTOMER))
      .optional()
      .isArray()
      .withMessage('Allergies must be an array'),

    body('healthData.activityLevel')
      .if(body('role').equals(UserRole.CUSTOMER))
      .isIn(Object.values(ActivityLevel))
      .withMessage('Invalid activity level specified'),

    // Vendor-specific validations
    body('vendorData')
      .if(body('role').equals(UserRole.VENDOR))
      .notEmpty()
      .withMessage('Vendor data is required for vendors'),

    body('vendorData.displayName')
      .if(body('role').equals(UserRole.VENDOR))
      .isLength({ min: 3, max: 20 })
      .withMessage('Display name must be between 3 and 20 characters'),

    body('vendorData.bio')
      .if(body('role').equals(UserRole.VENDOR))
      .optional()
      .isLength({ max: 500 })
      .withMessage('Bio must be less than 500 characters'),

    body('vendorData.phoneNumber')
      .if(body('role').equals(UserRole.VENDOR))
      .trim()
      .notEmpty()
      .isMobilePhone('any', { strictMode: true })
      .withMessage('Phone number is required, must be valid, and include country code (e.g. +213)'),

    body('vendorData.location.address')
      .if(body('role').equals(UserRole.VENDOR))
      .trim()
      .notEmpty()
      .withMessage('Address is required for vendors'),

    body('vendorData.location.wilaya')
      .if(body('role').equals(UserRole.VENDOR))
      .trim()
      .notEmpty()
      .withMessage('Wilaya is required for vendors'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password, fullName, role, healthData, vendorData } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new BadRequestError('Email in use');
    }

    // Create session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Create and save user
      const user = User.build({ email, password, fullName, role });
      await user.save({ session });

      // Create role-specific profiles
      if (role === UserRole.CUSTOMER) {
        const healthProfile = HealthProfile.build({
          userId: user._id.toString(),
          gender: healthData.gender,
          dateOfBirth: new Date(healthData.dateOfBirth),
          heightCM: healthData.heightCM,
          weightKG: healthData.weightKG,
          activityLevel: healthData.activityLevel,
          medicalCondition: healthData.medicalCondition,
          allergy: healthData.allergy,
          primaryHealthGoal: healthData.primaryHealthGoal,
        });

        await healthProfile.save({ session });
      }

      if (role === UserRole.VENDOR) {
        const vendorProfile = VendorProfile.build({
          userId: user._id.toString(),
          displayName: vendorData.displayName,
          bio: vendorData.bio || '',
          phoneNumber: vendorData.phoneNumber,
          location: vendorData.location,
        });

        await vendorProfile.save({ session });
      }

      // Commit transaction
      await session.commitTransaction();

      // Generate JWT
      const userJwt = jwt.sign(
        {
          id: user._id,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_KEY!
      );

      // Store JWT in session
      req.session = {
        jwt: userJwt,
      };

      res.status(201).send({
        message: 'User created successfully',
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
);

export { router as signupRouter };


