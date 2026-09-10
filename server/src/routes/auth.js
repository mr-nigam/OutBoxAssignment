import { Router } from 'express';
import {
    login,
    getCurrentUser,
    logout
} from '../controllers/auth.js';
import authenticateUser from '../middlewares/authenticateUser.js';

const router = Router();

// Public Google login / auth routes
router.post('/google', login);
router.post('/login', login);

// Protected routes
app.use(authenticateUser);

router.get('/me', getCurrentUser);
router.post('/logout', logout);

export default router;
