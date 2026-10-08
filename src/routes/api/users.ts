import { Router } from 'express';
import { retrieveLikes, handleNewLikes } from '../../controllers/usersController';
import requireKey from '../../middleware/requireKey';

const router = Router();

// Only the portfolio's server calls these: it knows the reader's real IP, while a browser could send any IP it liked.
router.use(requireKey('LIKES_API_KEY'));

router.route('/')
    .post(handleNewLikes)

router.route('/:ip/:uuidBlog')
    .get(retrieveLikes);

export default router;
