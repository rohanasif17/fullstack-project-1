import {Router} from 'express';
import { registerUser, loginUser, signupUser} from '../controllers/user.controller.js';

const router = Router()

router.route('/register').post(registerUser)
router.route('/login').post(loginUser)
router.route('/signup').post(signupUser)

export default router