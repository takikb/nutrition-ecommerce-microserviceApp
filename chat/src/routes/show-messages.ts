import express, { Request, Response } from 'express'
import { NotFoundError, NotAuthorizedError } from '@d-ziet/common-lib'
import { Message } from '../models/message'
import { Conversation } from '../models/conversation';

const router = express.Router()

router.get('/api/messages/:conversationId', async (req: Request, res: Response) => {
    const conversationId = req.params.conversationId;

    // pagination params
    const limit = parseInt(req.query.limit as string) || 50; // default to 50 messages per page
    const skip = parseInt(req.query.skip as string) || 0; // default to no skipping

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
        throw new NotFoundError();
    }

    if (conversation.customerId !== req.currentUser!.id && conversation.vendorId !== req.currentUser!.id) {
        throw new NotAuthorizedError();
    }

    const messages = await Message.find({ conversationId })
        .sort({ createdAt: -1 }) // newest messages first
        .skip(skip)
        .limit(limit);

    res.send(messages);
});

export { router as showMessagesRouter }