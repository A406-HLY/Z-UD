# 🧪 목업 API 구현 및 고도화 계획서

## 1. 목적
- 실제 백엔드 응답 규격(`@응답예시.json`)을 100% 재현하여 프론트엔드 연동 테스트.
- FSD 아키텍처 규칙 및 가이드라인에 따른 데이터 매핑 로직 검증.

## 2. 구현 단계 및 명세

### 📂 Phase 1: 엔티티 타입 업데이트 (`entities/verification/model/types.ts`)
- **[규칙] any 절대 금지.**
- 서버 응답 규격의 상세 필드(`bbox`, `confidence`, `evidence`)를 모두 포함하도록 인터페이스 확장.
- 중첩 구조 지원을 위해 `ExtractedField`의 `value` 타입을 `unknown`으로 처리하거나, 하위 속성을 담을 수 있는 유니온 타입 정의.

### 📂 Phase 2: 매퍼(Mapper) 고도화 (`entities/verification/model/verification.mapper.ts`)
- **[규칙] snake_case -> camelCase 매핑.**
- **평면화(Flattening) 로직 추가**: `content` 내부의 중첩 객체 및 배열을 에디터에서 그리기 쉬운 Flat List로 변환.
- **예시**: `content.spouse.name` -> `{ key: "배우자_성명", value: ... }`

### 📂 Phase 3: 기능 구현 및 연동 (`features/verification/api/use-verification-query.ts`)
- **[규칙] TanStack Query v5 객체 인자 방식 사용.**
- `@응답예시.json` 데이터를 기반으로 한 대규모 Mock 데이터 구축 (20여 종 서류 반영).
- `onBlur`가 아닌 `onChange` 기반 실시간 정합성 평가 로직을 위한 전처리(Indexing) 성능 최적화.

### 📂 Phase 4: UI 위젯 반영 (`widgets/ocr-field-editor/ui/OcrFieldEditor.tsx`)
- **[규칙] Tailwind CSS 4.x 기반.**
- `ExtractedField`에 포함된 `bbox` 좌표 정보를 활용하여, 향후 이미지 뷰어 연동을 위한 `onHover` 이벤트 인터페이스 확보.

## 3. 테스트 시나리오
1. **정합성 오류 재현**: '주민등록등본'의 성명과 '가족관계증명서'의 성명을 다르게 설정하여 실시간 빨간색 강조 확인.
2. **위험 문서 재현**: `risks` 배열에 '매매계약서'를 포함시켜 어두운 노란색 배너 노출 확인.
3. **누락 서류 재현**: '근로소득 원천징수영수증'을 `documentMissings`에 넣어 목록에서 회색 비활성화 확인.
