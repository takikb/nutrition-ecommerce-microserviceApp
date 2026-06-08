import express, { Request, Response } from 'express';
import { BadRequestError, requireAuth } from '@d-ziet/common-lib';
import { User, UserRole } from '../models/user';
import { HealthProfile } from '../models/health-profile';
import { VendorProfile } from '../models/vendor-profile';

const router = express.Router();

router.get('/api/users/profile', requireAuth, async (req: Request, res: Response) => {
    const userId = req.currentUser!.id;

    // Fetch core user
    const user = await User.findById(userId);
    if (!user) {
        throw new BadRequestError('User not found');
    }

    let profileData = null;

    // Dynamically retrieve role-specific profile document
    if (user.role === UserRole.CUSTOMER) {
        profileData = await HealthProfile.findOne({ userId });
    } else if (user.role === UserRole.VENDOR) {
        profileData = await VendorProfile.findOne({ userId });
    }

    res.status(200).send({
        user,
        profile: profileData
    });
});

export { router as showProfileRouter };