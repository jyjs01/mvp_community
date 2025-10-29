import dotenv from 'dotenv';
import { z } from 'zod';
dotenv.config();

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  JWT_SECRET: z.string().min(10, 'JWT_SECRET은 10자 이상으로 설정하세요'),
  CORS_ORIGIN: z.string().optional(), // "a,b,c" 형식
  UPLOAD_DIR: z.string().default('uploads'),
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  // 서버 시작 전 환경값 오류를 명확히 보고
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = {
  ...parsed.data,
  // 문자열을 배열로 바꿔 쓰기 편하게
  CORS_ARRAY: parsed.data.CORS_ORIGIN
    ? parsed.data.CORS_ORIGIN.split(',').map(s => s.trim()).filter(Boolean)
    : undefined,
};
