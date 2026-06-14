// @ts-ignore
import nodemailer from "nodemailer";

export const sendResetEmail = async (email: string, fullName: string, resetUrl: string): Promise<void> => {
    let transporter;

    // 1. If environment credentials are provided, use them (Production / Mailtrap / Gmail) 
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: parseInt(process.env.SMTP_PORT || "465", 10),
            secure: process.env.SMTP_SECURE === "true", // true for 465, false for 587
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    } else {
        // 2. Fallback: Auto-generate test SMTP credentials on-the-fly (Ethereal Sandbox)
        console.log("No SMTP environment variables detected. Auto-generating test SMTP sandbox credentials...");
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        });
    }

    // Responsive HTML Email template matching the GhidhAI theme
    const htmlContent = `
        <div style="font-family: 'Manrope', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #fdf8f3; border-radius: 24px; border: 1px solid #e4e1e5; color: #1b1b1e;">
            <div style="text-align: center; margin-bottom: 24px;">
                <h1 style="font-size: 24px; font-weight: 800; color: #3f6a00; margin: 8px 0 0 0;">GhidhAI Plan Recovery</h1>
            </div>
            <div style="background-color: #ffffff; padding: 32px; border-radius: 16px; border: 1px solid #f0edf1; box-shadow: 0 4px 12px rgba(0,0,0,0.02);">
                <p style="font-size: 16px; font-weight: 600; color: #1b1b1e; margin-top: 0;">Hi ${fullName},</p>
                <p style="font-size: 14px; line-height: 24px; color: #424938; margin-bottom: 24px;">
                    We received a request to reset the password for your GhidhAI account. Click the secure button below to configure your new credentials. This link is valid for exactly 10 minutes.
                </p>
                <div style="text-align: center; margin-bottom: 24px;">
                    <a href="${resetUrl}" style="background-color: #3f6a00; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 9999px; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 4px 14px rgba(63, 106, 0, 0.25);">
                        Reset Password
                    </a>
                </div>
                <p style="font-size: 12px; color: #727a66; line-height: 18px; margin-bottom: 0;">
                    If you did not request this recovery action, you can safely ignore this email. Your password will remain unchanged.
                </p>
            </div>
            <div style="text-align: center; margin-top: 24px; font-size: 11px; color: #727a66;">
                <p>© 2026 GhidhAI. All rights reserved.</p>
            </div>
        </div>
    `;

    const info = await transporter.sendMail({
        from: '"GhidhAI Security" <security@ghidhai.dev>',
        to: email,
        subject: "GhidhAI - Reset Your Password",
        text: `Reset your password by visiting this link: ${resetUrl}`,
        html: htmlContent
    });

    // If using the Ethereal sandbox, output the URL so you can view the fully styled email
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
        console.log(`\n📨 [SMTP SANDBOX] Real styled email dispatched! View rendering: ${previewUrl}\n`);
    } else {
        console.log(`📨 Email successfully dispatched to ${email}`);
    }
};