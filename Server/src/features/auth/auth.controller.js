import { registerSchema, loginSchema } from './auth.schema.js';
import * as svc from './auth.service.js';
import { HttpError } from '../../utils/httpError.js';


export async function postRegister(req, res, next) {
  try {
    const body = registerSchema.parse(req.body);
    const r = await svc.register(body);
    if (r?.error) throw new HttpError(400, r.error);
    res.status(201).json(r); // 새 유저(비번 제외)
  } catch (e) { next(e); }
}


export async function postLogin(req, res, next) {
  try {
    const body = loginSchema.parse(req.body);
    const r = await svc.login(body);
    if (!r) throw new HttpError(401, 'Invalid credentials');
    res.json(r); // { user, token }
  } catch (e) { next(e); }
}

export async function getMe(req, res) {
  res.json({ user: { id: req.user.sub, email: req.user.email, name: req.user.name } });
}
