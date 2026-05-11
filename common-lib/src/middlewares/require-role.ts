import { Request, Response, NextFunction } from "express";
import { NotAuthorizedError } from "../errors/not-authorized-error";

export const requireRole = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.currentUser || !roles.includes(req.currentUser.role)) {
            throw new NotAuthorizedError();
        }
        next();
    }
}
