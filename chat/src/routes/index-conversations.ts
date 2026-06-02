import express, { Request, Response } from 'express'
import { requireAuth } from '@d-ziet/common-lib'
import { Conversation } from '../models/conversation'

const router = express.Router()

router.get('/api/chat/conversations', requireAuth, async (req: Request, res: Response) => {
    const userId = req.currentUser!.id;

    const conversations = await Conversation.find({
        $or: [
            { customerId: userId },
            { vendorId: userId }
        ]
    })
    .populate('productId')  
    .populate('customerId') 
    .populate('vendorId')   
    .sort({ updatedAt: -1 });

    const formattedConversations = conversations.map(c => {
        const json = c.toJSON() as any;
        // Dynamically map from populated replicas to avoid storing flat attributes [4]
        json.productTitle = (c.productId as any)?.title || "Product Inquiry";
        json.productPrice = (c.productId as any)?.priceDZD || 0;
        return json;
    });

    res.send(formattedConversations);
});

export { router as indexConversationsRouter }