import express, { Request, Response } from 'express'
import { NotFoundError, NotAuthorizedError, requireRole, requireAuth } from '@d-ziet/common-lib'
import { Message } from '../models/message'
import { Conversation } from '../models/conversation';

const router = express.Router()

router.get('/api/chat/messages/:conversationId', requireAuth, requireRole(['vendor', 'customer']), async (req: Request, res: Response) => {
    const conversationId = req.params.conversationId;

    const limit = parseInt(req.query.limit as string) || 50; 
    const skip = parseInt(req.query.skip as string) || 0; 

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
        throw new NotFoundError();
    }

    if (conversation.customerId.toString() !== req.currentUser!.id && conversation.vendorId.toString() !== req.currentUser!.id) {
        throw new NotAuthorizedError();
    }

    const messages = await Message.find({ conversationId })
        .sort({ createdAt: -1 }) 
        .skip(skip)
        .limit(limit);

    res.send(messages);
});

export { router as showMessagesRouter }