import express, { Request, Response } from 'express'
import { requireAuth } from '@d-ziet/common-lib'

const router = express.Router()

router.post('/api/products', requireAuth, (req: Request, res: Response) => {
    res.sendStatus(200)
})

export { router as newProductRouter }