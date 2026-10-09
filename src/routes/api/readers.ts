import { Router } from 'express';
import { retrieveLikes, handleNewLikes } from '../../controllers/readersController';
import requireKey from '../../middleware/requireKey';
import asyncHandler from '../../middleware/asyncHandler';

const router = Router();

// Only the portfolio's server calls these: it knows the reader's real IP, while a browser could send any IP it liked.
router.use(requireKey('LIKES_API_KEY'));

router.route('/likes')
    .post(asyncHandler(handleNewLikes));

router.route('/:reader/likes/:uuidBlog')
    .get(asyncHandler(retrieveLikes));

export default router;
