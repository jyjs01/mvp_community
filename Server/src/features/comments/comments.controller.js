import { HttpError } from '../../utils/httpError.js';
import * as svc from './comments.service.js';
import {
  createCommentSchema,
  updateCommentSchema,
  listCommentsQuerySchema
} from './comments.schema.js';


export async function getCommentsByPost(req, res, next) {
  try {
    const { postId } = req.params;
    const query = listCommentsQuerySchema.parse(req.query);

    const data = await svc.listByPost({
      postId,
      page: query.page,
      limit: query.limit
    });

    res.json(data); // { items: [...], page, limit, total ... }
  } catch (e) { next(e); }
}


export async function postCommentToPost(req, res, next) {
  try {
    const { postId } = req.params;
    const body = createCommentSchema.parse(req.body);

    const r = await svc.create({
      postId,
      authorId: req.user.sub,
      authorName: req.user.name,
      content: body.content,
    });

    if (r?.error === 'Post not found') {
      throw new HttpError(404, 'Post not found');
    }

    res.status(201).json(r);
  } catch (e) { next(e); }
}


export async function patchComment(req, res, next) {
  try {
    const { id } = req.params;
    const body = updateCommentSchema.parse(req.body);
    const r = await svc.update({
      id,
      editorUserId: req.user.sub,
      content: body.content
    });

    if (r?.error === 'Not found') throw new HttpError(404, 'Comment not found');
    if (r?.error === 'Forbidden') throw new HttpError(403, 'Forbidden');

    res.json(r);
  } catch (e) { next(e); }
}


export async function deleteComment(req, res, next) {
  try {
    const { id } = req.params;
    const r = await svc.remove({
      id,
      requesterUserId: req.user.sub
    });

    if (r?.error === 'Not found') throw new HttpError(404, 'Comment not found');
    if (r?.error === 'Forbidden') throw new HttpError(403, 'Forbidden');

    res.json({ ok: true });
  } catch (e) { next(e); }
}
