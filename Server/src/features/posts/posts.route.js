// Server/src/features/posts/posts.route.js
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { authGuard } from '../../middlewares/authGuard.js';
import { getList, getDetail, postCreate, patchUpdate, deleteRemove } from './posts.controller.js';

const r = Router();

// 파일명 안전 처리 (공백/특수문자 정리)
function sanitizeBase(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_]/g, '')
    .slice(0, 60) || 'img';
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ''; // 원본 확장자 유지
    const base = sanitizeBase(path.basename(file.originalname, path.extname(file.originalname)));
    cb(null, `${Date.now()}_${base}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { files: 4, fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    // 이미지 파일만 허용 (HEIC 등은 필요 시 허용/변환 결정)
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('이미지 파일만 업로드할 수 있습니다.'));
  },
});

// 목록/상세
r.get('/', getList);
r.get('/:id', getDetail);

// 생성(로그인 필요) — 업로드 → 컨트롤러
r.post('/', authGuard, upload.array('images', 4), postCreate);

// 수정/삭제
r.patch('/:id', authGuard, patchUpdate);
r.delete('/:id', authGuard, deleteRemove);

export default r;
