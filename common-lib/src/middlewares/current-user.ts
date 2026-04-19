import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

enum UserRole {
    ADMIN = 'admin',
    CUSTOMER = 'customer',
    VENDOR = 'vendor'
}

interface userPayload {
    id: string
    email: string
    fullName: string
    role: UserRole
}

declare global {
    namespace Express {
        interface Request {
            currentUser?: userPayload
            session?: any
        }
    }
}

export const currentUser = (req: Request, res:Response, next: NextFunction) => {
    if (!req.session?.jwt) {
        return next();
    }

    try {
        const payload = jwt.verify(req.session.jwt, process.env.JWT_KEY!) as userPayload
        req.currentUser = payload 
    } catch (err) {}

    next();
}