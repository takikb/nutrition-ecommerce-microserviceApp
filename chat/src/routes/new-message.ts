import express, { Request, Response } from 'express'
import { NotAuthorizedError, NotFoundError, requireAuth } from '@d-ziet/common-lib'
import { Message } from '../models/message'
import { Conversation } from '../models/conversation'
import { body } from 'express-validator'
import { validateRequest } from '@d-ziet/common-lib'
import { io } from '../app'

const router = express.Router()

router.post('/api/messages', requireAuth, [
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

    if (conversation.customerId !== req.currentUser!.id && conversation.vendorId !== req.currentUser!.id) {
        throw new NotAuthorizedError();
    }
    
    const recieverId = req.currentUser!.id === conversation.customerId
        ? conversation.vendorId
        : conversation.customerId;

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

    //emit the message to the recipient's room
    io.to(recieverId).emit('newMessage', message);

    res.status(201).send(message);
})

export { router as newMessageRouter }