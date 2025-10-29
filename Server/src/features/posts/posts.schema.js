import { z } from 'zod';

export const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().default(''),
  images: z.array(z.object({
    url: z.string().url(),
  })).optional().default([])
});

export const updatePostSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().optional(),
  images: z.array(z.object({ url: z.string().url() })).optional()
});

// 목록/검색/페이지네이션 쿼리
export const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(50).optional().default(10),
  q: z.string().optional().default(''),
  author: z.string().optional(), // authorId 필터 (선택)
  sort: z.enum(['new', 'old', 'popular']).optional().default('new')
});
