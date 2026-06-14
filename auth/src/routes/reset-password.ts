import express, { Request, Response } from "express";
import { body } from "express-validator";
import { validateRequest } from "@d-ziet/common-lib";
import crypto from "crypto";
import { User } from "../models/user";
import { UserUpdatedPublisher } from "../events/publishers/user-updated-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

router.post("/api/users/reset-password", [
    body("token")
        .not()
        .isEmpty()
        .withMessage("Token is required"),
    body("password")
        .trim()
        .isLength({ min: 6, max: 20 })
        .withMessage("Password must be between 6 and 20 characters")
], validateRequest, async (req: Request, res: Response) => {
    const { token, password } = req.body;

    // 1. Re-hash the raw incoming token to search MongoDB securely
    const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    // 2. Find user where hashed token matches and expiry date is in the future ($gt)
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: new Date() }
    });

    if (!user) {
        return res.status(400).send({
            errors: [{ message: "Token is invalid or has expired." }]
        });
    }

    // 3. Update the password (automatically hashed by our Mongoose pre('save') middleware)
    user.password = password;

    // 4. Invalidate the reset token states immediately
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    await new UserUpdatedPublisher(natsWrapper.client).publish({
        id: user.id,
        version: user.version,
        email: user.email,
        fullName: user.fullName,
        role: user.role as any,
        isActive: user.isActive
    });
    

    res.status(200).send({ success: true, message: "Password updated successfully!" });
});

export { router as resetPasswordRouter };