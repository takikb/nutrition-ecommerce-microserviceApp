import express, { Request, Response } from 'express'
import { requireAuth, requireRole, validateRequest } from '@d-ziet/common-lib'
import { Conversation } from '../models/conversation'
import { Product } from '../models/product' 
import { User } from '../models/user'       
import { body } from 'express-validator'

const router = express.Router()

router.post('/api/chat/conversations', requireAuth, requireRole(['customer']), [
    body('productId').not().isEmpty().withMessage('productId must be provided'),
    body('vendorId').not().isEmpty().withMessage('vendorId must be provided'),
    body('productTitle').not().isEmpty().withMessage('productTitle must be provided'),
    body('productPrice').not().isEmpty().withMessage('productPrice must be provided')
], validateRequest, async (req: Request, res: Response) => {
    const { productId, vendorId, productTitle, productPrice } = req.body;
    const customerId = req.currentUser!.id;

    // Type variables as 'any' to bypass strict Mongoose internal document checks [4]
    let product: any = await Product.findById(productId);
    if (!product) {
        product = Product.build({
            id: productId,
            title: productTitle,
            priceDZD: productPrice,
            vendorId: vendorId
        });
        await product.save();
    }

    let customer: any = await User.findById(customerId);
    if (!customer) {
        customer = User.build({
            id: customerId,
            fullName: req.currentUser!.fullName || "Active Member",
            role: "customer"
        });
        await customer.save();
    }

    let vendor: any = await User.findById(vendorId);
    if (!vendor) {
        vendor = User.build({
            id: vendorId,
            fullName: "GhidhAI Merchant",
            role: "vendor"
        });
        await vendor.save();
    }

    const existingConversation = await Conversation.findOne({ productId, customerId, vendorId });

    if (existingConversation) {
        await existingConversation.populate('productId customerId vendorId');
        const json = existingConversation.toJSON() as any;
        
        // Dynamically resolve titles and prices from the populated product replica [4]
        json.productTitle = (existingConversation.productId as any)?.title || "Product Inquiry";
        json.productPrice = (existingConversation.productId as any)?.priceDZD || 0;
        return res.status(200).send(json);
    }

    // Build conversation using strict conversationAttrs [4]
    const conversation = Conversation.build({
        productId,
        customerId,
        vendorId
    });
    await conversation.save();

    await conversation.populate('productId customerId vendorId');
    const json = conversation.toJSON() as any;
    
    json.productTitle = (conversation.productId as any)?.title || "Product Inquiry";
    json.productPrice = (conversation.productId as any)?.priceDZD || 0;

    res.status(201).send(json);
});

export { router as newConversationRouter }