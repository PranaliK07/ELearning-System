# eLearning LMS

## Prerequisites
- Node.js 18+
- npm 9+

## 1) Configure environment
- Copy `server/.env.example` to `server/.env`
- Copy `client/.env.example` to `client/.env` (optional)

## 2) Install dependencies
```bash
cd server && npm install
cd ../client && npm install
```

## 3) Run in development
Backend:
```bash
cd server
npm start
```
Frontend:
```bash
cd client
npm run dev
```

App URL: `http://localhost:5173`
API URL: `http://localhost:5000`

## 4) Production build
Frontend build:
```bash
cd client
npm run build
```

Frontend preview:
```bash
cd client
npm run preview
```

Backend production start:
```bash
cd server
npm start
```

## Notes
- File uploads are served from `/uploads`.
- Core LMS hierarchy is: `Grade -> Subject -> Topic -> Content(video/reading/quiz)`.
- Assignment flow supports teacher create/review and student submission.
