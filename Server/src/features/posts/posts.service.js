import { db } from '../../db/index.js';

function now() { return Date.now(); }

function pick(obj, keys) {
  const out = {};
  for (const k of keys) if (obj[k] !== undefined) out[k] = obj[k];
  return out;
}

// 글 생성
export async function createPost({ authorId, title, content, images }) {
  const post = {
    id: crypto.randomUUID(),
    authorId,
    title,
    content: content ?? '',
    images: Array.isArray(images) ? images : [],
    likesCount: 0,
    commentsCount: 0,
    isDeleted: false,
    createdAt: now(),
    updatedAt: now()
  };

  db.data.posts.push(post);
  await db.write();
  return post;
}

// 글 id 가져오기
export async function getPostById(id) {
  const p = db.data.posts.find(v => v.id === id && !v.isDeleted);
  return p || null;
}

// 글 리스트
export async function listPosts({ page = 1, limit = 10, q = '', author, sort = 'new' }) {
  let items = db.data.posts.filter(p => !p.isDeleted);

  if (author) {
    items = items.filter(p => p.authorId === author);
  }

  if (q && q.trim()) {
    const needle = q.trim().toLowerCase();
    items = items.filter(p =>
      (p.title?.toLowerCase().includes(needle)) ||
      (p.content?.toLowerCase().includes(needle))
    );
  }

  // 정렬
  const sorters = {
    new: (a, b) => b.createdAt - a.createdAt,
    old: (a, b) => a.createdAt - b.createdAt,
    popular: (a, b) => (b.likesCount - a.likesCount) || (b.createdAt - a.createdAt)
  };
  items.sort(sorters[sort] || sorters.new);

  const total = items.length;
  const start = (page - 1) * limit;
  const paged = items.slice(start, start + limit);

  return {
    items: paged,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  };
}


// 글 수정
export async function updatePost({ id, editorUserId, data }) {
  const idx = db.data.posts.findIndex(p => p.id === id && !p.isDeleted);
  if (idx < 0) return { error: 'Not found' };

  const post = db.data.posts[idx];
  if (post.authorId !== editorUserId) return { error: 'Forbidden' };

  const allowed = pick(data, ['title', 'content', 'images']);
  db.data.posts[idx] = { ...post, ...allowed, updatedAt: now() };
  await db.write();
  return db.data.posts[idx];
}


// 글 삭제
export async function deletePost({ id, requesterUserId }) {
  const idx = db.data.posts.findIndex(p => p.id === id && !p.isDeleted);
  if (idx < 0) return { error: 'Not found' };

  const post = db.data.posts[idx];
  if (post.authorId !== requesterUserId) return { error: 'Forbidden' };

  db.data.posts[idx].isDeleted = true;
  db.data.posts[idx].updatedAt = now();
  await db.write();
  return { ok: true };
}
