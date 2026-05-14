import express, { Request, Response } from 'express'
import { NotAuthorizedError, NotFoundError, requireAuth, requireRole } from '@d-ziet/common-lib'
import { Conversation } from '../models/conversation'
import { body } from 'express-validator'
import { validateRequest } from '@d-ziet/common-lib'

const router = express.Router()

router.post('/api/conversations', requireAuth, requireRole(['customer']), [
    body('productId')
        .not()
        .isEmpty()
        .withMessage('productId must be provided'),
    body('vendorId')
        .not()
        .isEmpty()
        .withMessage('vendorId must be provided'),
    body('productTitle')
        .not()
        .isEmpty()
        .withMessage('productTitle must be provided'),
    body('productPrice')
        .not()
        .isEmpty()
        .withMessage('productPrice must be provided')
], validateRequest, async (req: Request, res: Response) => {
    const { productId, vendorId, productTitle, productPrice } = req.body;
    const customerId = req.currentUser!.id;

    const existingConversation = await Conversation.findOne({ productId, customerId, vendorId });

    if (existingConversation) {
        return res.status(200).send(existingConversation);
    }

    const conversation = Conversation.build({
        productId,
        customerId,
        vendorId,
        productTitle,
        productPrice
    });
    await conversation.save();

    res.status(201).send(conversation);
});

export { router as newConversationRouter }