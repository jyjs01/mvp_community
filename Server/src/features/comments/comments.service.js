import { db } from '../../db/index.js';

function now() { return Date.now(); }

// postId에 해당하는 댓글 목록
export async function listByPost({ postId, page = 1, limit = 50 }) {
  const all = db.data.comments
    .filter(c => !c.isDeleted && c.postId === postId)
    .sort((a, b) => a.createdAt - b.createdAt); // 오래된 순서대로 보여주기

  const start = (page - 1) * limit;
  const items = all.slice(start, start + limit);

  return {
    items,
    page,
    limit,
    total: all.length,
    totalPages: Math.ceil(all.length / limit),
  };
}

// 댓글 생성
export async function create({ postId, authorId, authorName, content }) {
  // post 존재 여부 확인
  const post = db.data.posts.find(p => p.id === postId && !p.isDeleted);
  if (!post) {
    return { error: 'Post not found' };
  }

  const comment = {
    id: crypto.randomUUID(),
    postId,
    authorId,
    authorName: authorName || '', 
    content,
    isDeleted: false,
    createdAt: now(),
    updatedAt: now(),
  };

  db.data.comments.push(comment);

  // posts 테이블의 commentsCount 증가
  post.commentsCount = (post.commentsCount || 0) + 1;
  post.updatedAt = now();

  await db.write();

  return comment;
}

// 특정 댓글 하나 가져오기
export async function getById(id) {
  const c = db.data.comments.find(v => v.id === id && !v.isDeleted);
  return c || null;
}

// 댓글 수정
export async function update({ id, editorUserId, content }) {
  const idx = db.data.comments.findIndex(c => c.id === id && !c.isDeleted);
  if (idx < 0) return { error: 'Not found' };

  const comment = db.data.comments[idx];
  if (comment.authorId !== editorUserId) return { error: 'Forbidden' };

  db.data.comments[idx] = {
    ...comment,
    content,
    updatedAt: now(),
  };

  await db.write();
  return db.data.comments[idx];
}

// 댓글 삭제(soft delete)
export async function remove({ id, requesterUserId }) {
  const idx = db.data.comments.findIndex(c => c.id === id && !c.isDeleted);
  if (idx < 0) return { error: 'Not found' };

  const comment = db.data.comments[idx];
  if (comment.authorId !== requesterUserId) return { error: 'Forbidden' };

  // soft delete
  db.data.comments[idx].isDeleted = true;
  db.data.comments[idx].updatedAt = now();

  // post의 댓글 수 감소
  const post = db.data.posts.find(p => p.id === comment.postId && !p.isDeleted);
  if (post && post.commentsCount > 0) {
    post.commentsCount -= 1;
    post.updatedAt = now();
  }

  await db.write();
  return { ok: true };
}
