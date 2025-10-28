import { Router } from 'express';
import { postRegister, postLogin, getMe } from './auth.controller.js';
import { authGuard } from '../../middlewares/authGuard.js';

const r = Router();

r.post('/register', postRegister);
r.post('/login', postLogin);
r.get('/me', authGuard, getMe);

export default r;
