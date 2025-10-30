import { Router } from 'express';
import { authGuard } from '../../middlewares/authGuard.js';
import {
  getList,
  getDetail,
  postCreate,
  patchUpdate,
  deleteRemove
} from './posts.controller.js';

const r = Router();

// 목록/검색/페이지네이션
r.get('/', getList);

// 단건 조회
r.get('/:id', getDetail);

// 생성(로그인 필요)
r.post('/', authGuard, postCreate);

// 수정/삭제(작성자 본인만)
r.patch('/:id', authGuard, patchUpdate);
r.delete('/:id', authGuard, deleteRemove);

export default r;
