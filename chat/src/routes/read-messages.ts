import express, { Request, Response } from 'express';
import { requireAuth, NotFoundError, NotAuthorizedError } from '@d-ziet/common-lib';
import { Message } from '../models/message';
import { Conversation } from '../models/conversation';

const router = express.Router();

router.patch('/api/chat/conversations/:conversationId/read', requireAuth, async (req: Request, res: Response) => {
    const { conversationId } = req.params;
    const userId = req.currentUser!.id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
        throw new NotFoundError();
    }

    if (conversation.customerId.toString() !== userId && conversation.vendorId.toString() !== userId) {
        throw new NotAuthorizedError();
    }

    await Message.updateMany(
        { 
            conversationId, 
            recipientId: userId, 
            isRead: false 
        },
        { 
            $set: { isRead: true } 
        }
    );

    res.status(200).send({ success: true });
});

export { router as readMessagesRouter };