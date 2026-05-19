import express from 'express';
import { requireAuth, requireRole } from '@d-ziet/common-lib';
import { User } from '../models/user';

const router = express.Router();

router.get('/api/users/admin/all', requireAuth, requireRole(['admin']), async (req, res) => {
    const users = await User.find({}).populate('vendorProfile').populate('customerProfile');
    
    res.json(users);
});