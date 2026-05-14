import express, { Request, Response } from 'express'
import { NotFoundError, requireAuth } from '@d-ziet/common-lib'
import { Conversation } from '../models/conversation'

const router = express.Router()

router.get('/api/conversations', requireAuth, async (req: Request, res: Response) => {
    
    const userId = req.currentUser!.id;

   const conversations = await Conversation.find({
        $or: [
            { customerId: userId },
            { vendorId: userId }
        ]
    }).sort({ updatedAt: -1 }); // Newest activity at the top

    res.send(conversations);
})

export { router as indexConversationsRouter }