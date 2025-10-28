import { db } from '../../db/index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';

// 로그인
export async function login({ email, password }) {

  // 사용자 찾기
  const user = db.data.users.find(u => u.email === email);
  if (!user) return null;

  // 비밀번호 검증
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;

  // JWT 발급
  const token = jwt.sign(
    { sub: user.id, email: user.email, name: user.name },
    env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  // 비밀번호 해시 제거하고 반환
  const { passwordHash, ...safe } = user;
  return { user: safe, token };
}


// 회원가입
export async function register({ name, email, password }) {

  // 사용자 찾기
  const exists = db.data.users.find(u => u.email === email);
  if (exists) return { error: 'Email already used' };

  // 비밀번호 해시화
  const passwordHash = await bcrypt.hash(password, 10);

  // 사용자 정보 db에 저장
  const user = { id: crypto.randomUUID(), name, email, passwordHash, createdAt: Date.now() };
  db.data.users.push(user);

  await db.write();

  const { passwordHash: _, ...safe } = user;
  return safe;
}