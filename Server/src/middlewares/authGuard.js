import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

// 보호 라우트에서 토큰 검사
export function authGuard(req, res, next) {
  const raw = req.headers.authorization || '';
  const token = raw.startsWith('Bearer ') ? raw.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'No token' });
  }

  try {
    // 유효하면 payload를 req.user에 저장
    req.user = jwt.verify(token, env.JWT_SECRET);
    // req.user.sub, req.user.email, req.user.name 등 사용 가능
    next();
  } catch (e) {
    // 만료/위조 등 모두 401 처리(메시지는 과다 노출 지양)
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
