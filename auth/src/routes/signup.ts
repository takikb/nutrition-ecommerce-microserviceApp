import express, {Request, Response} from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { UserRole } from '../models/user';
import { VendorProfile } from '../models/vendor-profile';
import { HealthProfile } from '../models/health-profile';
import { Gender, PrimaryHealthGoals, ActivityLevel } from '../models/health-profile';

import { User } from '../models/user';
import { BadRequestError } from '../errors/bad-request-error';
import { validateRequest } from '../middlewares/validate-request';
import mongoose from 'mongoose';

const router = express.Router();

router.post('/api/users/signup', [
    body('email')
        .isEmail()
        .withMessage('Email must be valid'),
    body('password')
        .trim()
        .isLength({ min: 4, max: 20 })
        .withMessage('Password must be between 4 and 20 characters'),
    body('fullName')
        .notEmpty()
        .withMessage('Full name is required'),
    body('role')
        .isIn([UserRole.CUSTOMER, UserRole.VENDOR])
        .withMessage('Invalid role specified'),

    // Optional fields for health profile
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
        .withMessage('Height must be a valid number in cm between 50 and 250'),

    body('healthData.weightKG')
        .if(body('role').equals(UserRole.CUSTOMER))
        .isFloat({ min: 30, max: 300 })
        .withMessage('Weight must be a valid number in kg between 30 and 300'),

    body('healthData.primaryHealthGoal')
        .if(body('role').equals(UserRole.CUSTOMER))
        .isIn(Object.values(PrimaryHealthGoals))
        .withMessage('Invalid primary health goal specified'),

    body('healthData.medicalConditions')
        .if(body('role').equals(UserRole.CUSTOMER))
        .optional()
        .isArray()
        .withMessage('Medical conditions must be an array of strings'),

    body('healthData.allergies')
        .if(body('role').equals(UserRole.CUSTOMER))
        .optional()
        .isArray()
        .withMessage('Allergies must be an array of strings'),

    body('healthData.activityLevel')
        .if(body('role').equals(UserRole.CUSTOMER))
        .isIn(Object.values(ActivityLevel))
        .withMessage('Invalid activity level specified'),

    // Optional fields for vendor profile
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
        .notEmpty()
        .withMessage('Phone number is required for vendors'),
    
    body('vendorData.whatsappNumber')
        .if(body('role').equals(UserRole.VENDOR))
        .optional()
        .notEmpty()
        .withMessage('WhatsApp number cannot be empty if provided'),
    
    body('vendorData.location.address')
        .if(body('role').equals(UserRole.VENDOR))
        .notEmpty()
        .withMessage('Address is required for vendors'),

    body('vendorData.location.city')
        .if(body('role').equals(UserRole.VENDOR))
        .notEmpty()
        .withMessage('City is required for vendors')
    
    ], 
    validateRequest,
    async (req: Request, res: Response) => {

    const { email, password, fullName, role, healthData, vendorData } = req.body

    const existingUser = await User.findOne({ email })

    if (existingUser) {
        throw new BadRequestError('Email in use')
    }


    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const user = User.build({ email, password, fullName, role })
        await user.save({ session })

        if (role === UserRole.CUSTOMER) {
            const healthProfile = HealthProfile.build({
                userId: user._id.toString(),
                gender: healthData.gender,
                dateOfBirth: healthData.dateOfBirth,
                heightCM: healthData.heightCM,
                weightKG: healthData.weightKG,
                primaryHealthGoal: healthData.primaryHealthGoal,
                medicalConditions: healthData.medicalConditions || [],
                allergies: healthData.allergies || [],
                activityLevel: healthData.activityLevel
            });
            await healthProfile.save({ session });
        }

        if (role === UserRole.VENDOR) {
            const vendorProfile = VendorProfile.build({
                userId: user._id.toString(),
                displayName: vendorData.displayName,
                bio: vendorData.bio || '',
                phoneNumber: vendorData.phoneNumber,
                whatsappNumber: vendorData.whatsappNumber,
                location: vendorData.location
            });
            await vendorProfile.save({ session });
        }

        await session.commitTransaction();

        const userJwt = jwt.sign({
            id: user._id,
            email: user.email,
            role: user.role,
        }, process.env.JWT_KEY! )
    
        // Store it on session object
        req.session = { 
            jwt: userJwt
        }

        res.status(201).send({
            id: user._id,
            email: user.email,
            fullName: user.fullName,
            role: user.role
        })
        
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }

});

export { router as signupRouter };


