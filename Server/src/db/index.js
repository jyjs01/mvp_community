import { JSONFilePreset } from 'lowdb/node';

export const db = await JSONFilePreset('db.json', {
  users: [],       // {id,email,name,passwordHash,createdAt}
  posts: [],       // {id,authorId,title,content,images[],createdAt}
  comments: []     // {id,postId,authorId,content,createdAt}
});

await db.write(); // 파일 생성 보장
