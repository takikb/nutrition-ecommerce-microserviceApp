import express, { Request, Response } from 'express';
import { requireAuth } from '@d-ziet/common-lib';
import { Message } from '../models/message';

const router = express.Router();

router.get('/api/conversations/unread-count', requireAuth, async (req: Request, res: Response) => {
    const userId = req.currentUser!.id;

    // Count every single unread message directed to this user across all their chats
    const count = await Message.countDocuments({
        recipientId: userId,
        isRead: false
    });

    res.send({ unreadCount: count });
});

export { router as unreadCountRouter };