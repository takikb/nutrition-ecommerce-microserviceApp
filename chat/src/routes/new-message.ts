import express, { Request, Response } from 'express'
import { NotAuthorizedError, NotFoundError, requireAuth, validateRequest, requireRole } from '@d-ziet/common-lib'
import { Message } from '../models/message'
import { Conversation } from '../models/conversation'
import { body } from 'express-validator'
import { io } from '../app'

const router = express.Router()

router.post('/api/chat/messages', requireAuth, requireRole(['vendor', 'customer']), [
    body('conversationId')
        .not()
        .isEmpty()
        .withMessage('conversationId must be provided'),
    body('content')
        .not()
        .trim()
        .isEmpty()
        .withMessage('content must be provided')
], validateRequest, async (req: Request, res: Response) => {
    const { conversationId, content } = req.body;

    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
        throw new NotFoundError();
    }

    // Explicit string checks on referenced replica IDs [4]
    if (conversation.customerId.toString() !== req.currentUser!.id && conversation.vendorId.toString() !== req.currentUser!.id) {
        throw new NotAuthorizedError();
    }
    
    const recieverId = req.currentUser!.id === conversation.customerId.toString()
        ? conversation.vendorId.toString()
        : conversation.customerId.toString();

    const message = Message.build({
        conversationId,
        senderId: req.currentUser!.id,
        recipientId: recieverId,
        content
    });
    await message.save();

    conversation.set({ 
        lastMessage: content,
        lastMessageAt: new Date(),
        updatedAt: new Date()
    });
    await conversation.save();

    // Emit the message to the recipient's room
    io.to(recieverId).emit('newMessage', message);

    res.status(201).send(message);
});

export { router as newMessageRouter }