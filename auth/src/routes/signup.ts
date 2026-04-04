import mongoose from 'mongoose';
import express, {Request, Response} from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { UserRole } from '../models/user';

import { User } from '../models/user';
import { BadRequestError } from '../errors/bad-request-error';
import { validateRequest } from '../middlewares/validate-request';

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
    ], 
    validateRequest,
    async (req: Request, res: Response) => {

    const { email, password, fullName, role, healthData } = req.body

    const existingUser = await User.findOne({ email })

    if (existingUser) {
        throw new BadRequestError('Email in use')
    }

    const user = User.build({ email, password, fullName, role })
    await user.save()


    // Generate JWT
    const userJwt = jwt.sign({
        id: user._id,
        email: user.email,
        role: user.role,
        isProfileComplete: role === UserRole.CUSTOMER ? false : undefined
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
});

export { router as signupRouter };


