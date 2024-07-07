import { Router } from 'express';
import { getAllUsers, retrieveLikes, handleNewLikes } from '../../controllers/usersController';

const router = Router();

router.route('/')
    .get(getAllUsers)
    .post(handleNewLikes)

router.route('/:ip/:uuidBlog')
    .get(retrieveLikes);

export default router;

