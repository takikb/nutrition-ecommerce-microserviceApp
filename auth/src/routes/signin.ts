import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { User, UserRole } from '../models/user';
import { BadRequestError, validateRequest } from '@d-ziet/common-lib';
import { Password } from '../services/password';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/api/users/signin',
    [
        body('email')   
            .isEmail()
            .withMessage('Email must be valid'),
        body('password')
            .trim()
            .notEmpty() 
            .withMessage('You must supply a password'),
        body('role')
            .isIn([UserRole.CUSTOMER, UserRole.VENDOR])
            .withMessage('Invalid role specified')
    ], 
    validateRequest,
    async (req: Request, res: Response) => {

    const { email, password, role } = req.body;
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
        throw new BadRequestError('Invalid credentials');
    }

    const passwordsMatch = await Password.compare(existingUser.password, password);

    if (!passwordsMatch || existingUser.role !== role) {
        throw new BadRequestError('Invalid credentials');
    }

    const userJWT = jwt.sign({
        id: existingUser._id,
        email: existingUser.email,
        role: existingUser.role
    }, process.env.JWT_KEY!)

    req.session = {
        jwt: userJWT
    }

    res.status(200).send({
        id: existingUser._id,
        email: existingUser.email,
        fullName: existingUser.fullName,
        role: existingUser.role
    });
});

export { router as signinRouter };