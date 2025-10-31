import { z } from 'zod';

// 댓글 작성
export const createCommentSchema = z.object({
  content: z.string().min(1, '내용을 입력하세요').max(1000)
});

// 댓글 수정
export const updateCommentSchema = z.object({
  content: z.string().min(1).max(1000)
});

// 목록 조회 쿼리 (확장 대비: 페이지네이션 등)
export const listCommentsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
});
