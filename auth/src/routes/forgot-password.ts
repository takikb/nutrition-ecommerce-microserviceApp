import express, { Request, Response } from "express";
import { body } from "express-validator";
import { validateRequest } from "@d-ziet/common-lib";
import { User } from "../models/user";
import { sendResetEmail } from "../services/email-service";
import crypto from "crypto";

const router = express.Router();

router.post("/api/users/forgot-password", [
    body("email")
        .isEmail()
        .withMessage("Please provide a valid email address")
], validateRequest, async (req: Request, res: Response) => {
    const { email } = req.body;

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    // Mitigate Enumeration: If user not found, respond with 200 OK silently
    if (!user) {
        return res.status(200).send({
            message: "If an account with that email exists, we have sent a password reset link."
        });
    }

    // 1. Generate a raw, unhashed 32-byte hexadecimal token [4]
    const rawToken = crypto.randomBytes(32).toString('hex');

    // 2. Hash the token using SHA-256 to save securely in MongoDB [4]
    const hashedToken = crypto
        .createHash('sha256')
        .update(rawToken)
        .digest('hex');

    // 3. Set token expiry limit to exactly 10 minutes from now [4]
    const expiryDate = new Date(Date.now() + 10 * 60 * 1000);

    // 4. Construct the secure recovery URL
    const resetUrl = `https://nutrition.dev/auth/reset-password?token=${rawToken}`;

    try {
        // 5. FIXED: Executing raw MongoDB driver write to completely bypass Mongoose OCC [4]
        await User.collection.updateOne(
            { _id: user._id },
            {
                $set: {
                    passwordResetToken: hashedToken,
                    passwordResetExpires: expiryDate
                }
            }
        );

        // 6. Dispatch the styled email asynchronously
        await sendResetEmail(user.email, user.fullName, resetUrl);

    } catch (err) {
        console.error("Forgot Password Handshake Error:", err);

        // Safe fallback: If email delivery crashes, clear the token state directly in MongoDB [4]
        await User.collection.updateOne(
            { _id: user._id },
            {
                $unset: {
                    passwordResetToken: "",
                    passwordResetExpires: ""
                }
            }
        );
        return res.status(500).send({ message: "Internal error processing request." });
    }

    res.status(200).send({
        message: "If an account with that email exists, we have sent a password reset link."
    });
});

export { router as forgotPasswordRouter };