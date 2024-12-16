# 아무 말 대잔치

Node.js와 Express를 기반으로 한 웹 커뮤니티 프로젝트입니다. 

<br>

## 주요 기능
- 회원가입 및 로그인
  - 이메일 형식 검증 및 비밀번호 강도 체크
  - 닉네임 중복 방지
- 게시판 기능
  - 게시물 작성, 수정, 삭제
  - 게시물 조회수 증가
  - 게시물 좋아요 기능
  - 댓글 작성, 수정, 삭제
- 사용자 정보 수정 및 비밀번호 변경
- 인증/인가
  - 쿠키와 세션 기반 인증

<br>

## 기술 스택
- Backend: Node.js, Express
- Frontend: HTML, CSS, JavaScript
- Database: MySQL
- 인증/인가: 쿠키 및 세션

<br>

## 프로젝트 구조
```bash
2-jenny-kang-community-be
├── README.md
├── app.js
├── config.js
├── .env
├── package-lock.json
├── package.json
├── node_modules
│   └── (모듈 파일들)
├── controllers
│   └── (js 파일들)
├── data
│   └── (더미데이터 json 파일들)
├── middleware
│   └── (미들웨어 파일들)
├── models
│   └── (더미데이터 읽고 쓰는 js 파일들)
├── routes
│   └── (라우팅 js 파일들)
├── uploads
│   └── (이미지 파일들)
└── utils
    └── (util 파일들)
```

<br>

## 설치 및 실행 방법


### 1. 클론 및 디렉토리 이동
```bash
git clone https://github.com/100-hours-a-week/2-jenny-kang-community-be.git
cd 2-jenny-kang-community-be
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 서버 실행
```bash
node app.js
```
또는

```bash
npm start
```
`npm start`로 실행시 **nodemon**으로 실행됩니다.

### 4. 로컬 서버 접근
```
http://localhost:3000
```

<br>

## API 명세서 

<br><br><br>

---

_Last updated: 2024-12-16_

