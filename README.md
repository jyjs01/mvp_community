# mvp_community

> 회원가입 로그인 글 작성 이미지 첨부 댓글까지 갖춘 Expo React Native 기반 간단 커뮤니티 앱

---

## 소개

이 프로젝트는 회원가입 로그인, 글 목록 상세 작성, 이미지 업로드, 댓글 작성과 조회를 포함한
간단한 커뮤니티 앱입니다. 프론트는 Expo React Native, 백엔드는 Node Express로 구성했으며,
모바일 UX를 고려해 무한 스크롤, 업로드 진행률 표시, 키보드 가림 방지 등을 적용했습니다.

---

## 기술 스택 (Tech Stack)

- **Frontend:** Expo React Native, expo router, axios, SecureStore, react native safe area context ...

- **Backend:** Node.js, Express, multer, lowdb 스타일 파일 DB, zod, morgan, cors, bcryptjs, jsonwebtoken ...

---

## 주요 기능 (Features)

- 인증 이메일 회원가입 로그인 JWT 발급 SecureStore 보관 요청 인터셉터 자동 첨부

- 글 관리 목록 페이지네이션 최신순 정렬 상세 보기 홈에서 최신 3개 노출

- 글 작성 제목 내용 입력 이미지 최대 4장 멀티파트 업로드 업로드 진행률 표시

- 댓글 글 상세 화면에서 댓글 목록 최신순 표시 댓글 작성 즉시 반영

- 이미지 서버 업로드 후 상대 경로를 절대 경로로 변환하여 표시

---

## 주요 폴더 구조 (Structure)

```
mvp_community
├─ app
│  ├─ (auth)/sign-in.js         # 로그인 화면
│  ├─ (auth)/sign-up.js         # 회원가입 화면
│  ├─ (main)/home.js            # 홈 화면
│  ├─ (main)/post-new.js        # 새 글 작성 화면
│  ├─ (main)/post-list.js       # 글 목록 화면
│  └─ (main)/posts/[id].js      # 글 상세 페이지
│
├─ src
│  ├─ components                # Txt, Card, PrimaryButton, TextField 등 공용 컴포넌트
│  ├─ lib                       # api.js, url.js 등 유틸 함수
│  └─ ui                        # theme.js (색상, 폰트 스타일 등 UI 테마 정의)
│
└─ Server
   └─ src
      ├─ config                 # 환경변수 로드 및 서버 설정
      ├─ db                     # db.json 래퍼 및 로컬 데이터베이스 관리
      ├─ features
      │   ├─ auth               # 로그인/회원가입 관련 기능
      │   ├─ posts              # 글 목록, 상세, 작성, 수정, 삭제 API
      │   └─ comments           # 댓글 목록 및 작성 API
      ├─ middlewares            # 인증(authGuard), 에러(errorHandler) 미들웨어
      ├─ utils                  # 공통 유틸 (httpError, app, server 등)
      └─ uploads                # 이미지 저장소 및 정적 파일 제공
```