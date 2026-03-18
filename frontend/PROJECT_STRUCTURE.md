# 🗺 Project Structure Guide

이 문서는 S14P21A406 프로젝트의 전체적인 디렉토리 구조를 정의한 지도입니다.
**코딩 규칙 및 가이드라인**은 `frontend/.antigravityrules`를 참조하세요.

---

## 📁 Root Directories (모노레포 구조)
- `frontend/` : 프론트엔드 애플리케이션 (React 19, TypeScript, Vite 7). FSD 아키텍처를 따릅니다.
- `backend/` : 백엔드 애플리케이션 (Spring Boot 기반).
- `ai/` : AI 관련 서비스 및 스크립트.
- `infra/` : CI/CD 및 인프라 설정.
- `upload-agent/` : 로컬 폴더 감시 및 업로드 에이전트.
- `TIL/` : 개발 문서 및 학습 내용.

---

## 💻 Frontend Map (FSD 기반)
프론트엔드 레이어별 책임과 주요 파일 위치입니다.

### 📂 Layer별 책임
- `src/app/` : 앱 전역 설정 (Router, Store, Styles, Providers).
- `src/pages/` : 라우트 단위 화면 조립. (`pages/login`)
- `src/widgets/` : 페이지 내 독립적 UI 영역 (Header, Sidebar).
- `src/features/` : 사용자 행동 중심 로직. (`features/auth`)
- `src/entities/` : 도메인 객체 중심 모델 및 타입. (`entities/user`)
- `src/shared/` : 공통 UI 컴포넌트, 유틸리티, API Client.

### ⚙️ 설정 파일
- `eslint.config.js` : ESLint 9+ 설정.
- `.prettierrc` : 코드 포맷팅 설정.
- `postcss.config.js` : Tailwind v4용 PostCSS 설정.
- `vite.config.ts` : Vite 빌드 설정 및 프록시 설정.

---

## 🤖 AI Agent Protocol
- **Reference**: 새로운 폴더나 모듈을 생성할 때 이 지도를 즉시 업데이트한다.
- **Rule Check**: 작업 시작 전 반드시 `frontend/.antigravityrules`의 규칙을 완벽히 숙지한다.
