# 🎨 Frontend

클라이언트 사이드 애플리케이션 코드를 관리하는 폴더입니다.

## 📌 기술 스택

- **언어 / 프레임워크:** TypeScript, React 18, Vite
- **상태 관리:** 
  - 서버 상태(API): TanStack Query (React Query) v4
  - 클라이언트 전역 상태: Redux Toolkit
- **스타일링:** Tailwind CSS
- **HTTP 클라이언트:** Axios
- **라우팅:** React Router v6

## 🚀 실행 방법

```bash
# 1. 패키지 설치
npm install

# 2. 개발 서버 실행 (localhost:3000)
npm run dev

# 3. 테스트 빌드
npm run build
```

## 📂 폴더 구조 (FSD 아키텍처)

```text
frontend/
├── src/
│   ├── app/                 # 애플리케이션 진입점 및 전역 설정 (Provider, Router, Store)
│   ├── pages/               # 라우트 단위 화면 조립 컴포넌트
│   ├── widgets/             # 여러 Feature를 조합하는 독립적인 UI 블록 (레이아웃 등)
│   ├── features/            # 사용자 행동 중심의 핵심 기능 단위 (서류 업로드, OCR 보정 등)
│   ├── entities/            # 도메인 객체 중심 모델 및 UI (신청자, 서류, 심사 등)
│   ├── shared/              # 전역에서 공통으로 재사용하는 자원 (API client, config, util, 공통 UI)
│   └── mocks/               # 개발/테스트용 API 모킹 데이터
├── public/                  # 정적 파일 (파비콘 등)
├── index.html               # Vite 진입점 HTML
├── package.json             # 의존성 및 스크립트 설정
├── tsconfig.json            # TypeScript 컴파일 설정
├── vite.config.ts           # Vite 빌드 설정
└── tailwind.config.js       # Tailwind CSS 테마/플러그인 설정
```

