import { Router } from 'express';
import {loginUser, registerUser, refreshToken} from './../Controller/userController'



const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh', refreshToken);

export default router;