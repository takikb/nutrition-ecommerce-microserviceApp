import express from 'express';
import { currentUser, requireAuth } from '@d-ziet/common-lib';

const router = express.Router();

router.get('/api/users/currentuser', currentUser, (req, res) => {
    res.status(200).send({ currentUser: req.currentUser || null });
});

export { router as currentUserRouter };