import { HttpError } from '../../utils/httpError.js';
import * as svc from './posts.service.js';
import { createPostSchema, updatePostSchema, listQuerySchema } from './posts.schema.js';

export async function getList(req, res, next) {
  try {
    const query = listQuerySchema.parse(req.query);
    const data = await svc.listPosts(query);
    res.json(data);
  } catch (e) { next(e); }
}

export async function getDetail(req, res, next) {
  try {
    const post = await svc.getPostById(req.params.id);
    if (!post) throw new HttpError(404, 'Post not found');
    res.json(post);
  } catch (e) { next(e); }
}

export async function postCreate(req, res, next) {
  try {
    const body = createPostSchema.parse(req.body);
    const post = await svc.createPost({
      authorId: req.user.sub,
      ...body
    });
    res.status(201).json(post);
  } catch (e) { next(e); }
}

export async function patchUpdate(req, res, next) {
  try {
    const body = updatePostSchema.parse(req.body);
    const r = await svc.updatePost({
      id: req.params.id,
      editorUserId: req.user.sub,
      data: body
    });
    if (r?.error === 'Not found') throw new HttpError(404, 'Post not found');
    if (r?.error === 'Forbidden') throw new HttpError(403, 'Forbidden');
    res.json(r);
  } catch (e) { next(e); }
}

export async function deleteRemove(req, res, next) {
  try {
    const r = await svc.deletePost({
      id: req.params.id,
      requesterUserId: req.user.sub
    });
    if (r?.error === 'Not found') throw new HttpError(404, 'Post not found');
    if (r?.error === 'Forbidden') throw new HttpError(403, 'Forbidden');
    res.json({ ok: true });
  } catch (e) { next(e); }
}
