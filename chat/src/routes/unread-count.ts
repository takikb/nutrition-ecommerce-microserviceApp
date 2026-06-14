import express, { Request, Response } from 'express';
import { requireAuth, requireRole } from '@d-ziet/common-lib';
import { Message } from '../models/message';

const router = express.Router();

router.get('/api/chat/conversations/unread-count', requireAuth, requireRole(['vendor', 'customer']), async (req: Request, res: Response) => {
    const userId = req.currentUser!.id;

    const count = await Message.countDocuments({
        recipientId: userId,
        isRead: false
    });

    res.send({ unreadCount: count });
});

export { router as unreadCountRouter };