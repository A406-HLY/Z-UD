# 📝 프론트엔드 대출 서류 검증(Verification) 교차 검증 최적화 구현 명세서

이 문서는 대출 서류 검수 과정에서 서버로부터 전달받은 `validationResult`를 활용하여, 프론트엔드 내에서 실시간 교차 검증(정합성 평가)을 수행하기 위한 데이터 전처리 및 상태 관리 최적화, 그리고 UI/UX 보완 계획의 구현 단계와 세부 명세를 정의합니다. 이 명세서는 프로젝트의 `frontend/.antigravityrules`를 철저히 준수하여 작성되었습니다.

---

## 🏗️ 1단계: 도메인 데이터 모델 확장 및 서버 응답 타입 정의
**목표**: `validationResult` (누락, 위반, 위험 요소)를 포함하는 서버 응답 구조를 프론트엔드 엔티티 모델에 반영하고, 이를 UI에서 사용할 수 있는 구조로 매핑하기 위한 타입을 정의합니다.

**작업 위치**: `frontend/src/entities/verification/model/types.ts`
**규칙 준수**: 
- `snake_case` -> `camelCase` 매핑을 위한 기반 타입 정의.
- `any` 사용 금지. 명확한 인터페이스 활용.

**상세 내용**:
1. **서버 응답 원본 인터페이스 정의**: `VerificationServerResponse` 등 서버 구조(`documentMissings`, `violations`, `risks`)에 맞는 타입 작성.
2. **UI 상태 인터페이스 확장**: 
   - `DocumentStatus`를 4가지 상태(`MISSING`, `REVIEW_NEEDED`, `RISK`, `APPROVED`)로 세분화.
   - `DocItem`에 `isRisk?: boolean`, `status: DocumentStatus` 반영.
   - `ExtractedField` 상태 확장 (수정 가능/불가능 여부를 판별하기 위한 플래그 등).

---

## ⚙️ 2단계: 최적화된 교차 검증 딕셔너리 생성 로직 구현 (Two-pass 전략)
**목표**: 서버에서 받은 응답을 바탕으로 렌더링 전(Pass 1)에 교차 검증을 위한 O(1) 조회용 Set과 딕셔너리를 구성합니다.

**작업 위치**: 
- `frontend/src/entities/verification/model/verification.mapper.ts` (신규 생성: 도메인 가공 로직 분리) 또는 
- `frontend/src/features/verification/api/use-verification-query.ts` 내부의 `select` 옵션.

**규칙 준수**:
- 컴포넌트 렌더링 내부에서 상태 변이(Mutation)를 발생시키지 않음. (Two-pass 전략 준수)
- 파생 상태는 `useMemo`나 TanStack Query의 `select`를 활용하여 계산.

**상세 내용**:
1. **Set 생성 (조회 최적화)**: `violations`에 포함된 타겟 `fields` 값들을 추출하여 `Set<string>` 생성.
2. **딕셔너리 구축 (Pass 1)**: `documents` 배열을 순회하며 추출된 `Set`에 포함된 키(`field`)를 발견하면, 해당 값을 딕셔너리(예: `Record<string, Set<string>>`)에 수집.
3. **가공된 데이터 반환**: 원본 문서 데이터와 함께 `crossValidationDict`, `missingMap`, `riskMap` 등을 포함한 가공 객체를 반환.

---

## 🎨 3단계: UI/UX 디자인 가이드 적용 및 상태 우선순위 렌더링
**목표**: 명세된 4가지 상태와 디자인 가이드라인에 따라 `VerificationRepository`와 `OcrFieldEditor`를 업데이트합니다.

**작업 위치**:
- `frontend/src/widgets/verification-repository/ui/VerificationRepository.tsx`
- `frontend/src/widgets/ocr-field-editor/ui/OcrFieldEditor.tsx`

**규칙 준수**:
- 컴포넌트 단일 책임 원칙 준수 (복잡해지면 분리).
- Tailwind CSS를 활용한 상태별 스타일링.

**상세 내용**:
1. **`VerificationRepository` (좌측 트리)**:
   - **우선순위 적용**: 컴포넌트 내부에서 `MISSING` > `REVIEW_NEEDED` > `RISK` > `APPROVED` 순으로 상태 판별.
   - `MISSING`: `opacity-50`, `pointer-events-none`, 회색 텍스트 처리.
   - `REVIEW_NEEDED`: 빨간색 텍스트(`text-red-600`), 폴더에 빨간색 ⚠️(Alert) 아이콘 표시.
   - `RISK`: 어두운 노란색 텍스트(`text-yellow-600`), 폴더에 노란색 ⚠️ 아이콘 표시.
2. **`OcrFieldEditor` (중앙 에디터)**:
   - 선택된 문서가 `MISSING`인 경우 방어 로직 (렌더링 안 함 또는 안내 문구).
   - 필드 렌더링 시 타겟 필드(`violationMap` 포함 여부) 확인:
     - **포함 안됨 (`isMatch: true`)**: `disabled`, 배경 회색(수정 불가).
     - **포함됨 (`isMatch: false`)**: 입력 가능, 상태에 따른 강조.
       - `REVIEW_NEEDED`: 빨간색 테두리, "정합성 오류" 배지.
       - `RISK`: 노란색 테두리(`border-yellow-500`), 상단에 "⚠️ 위험 문서 배너" 노출.

---

## 🔄 4단계: 실시간 컴포넌트 간 상태 관리 및 onChange 교차 검증 연동
**목표**: 사용자의 실시간 입력(`onChange`)에 즉각적으로 반응하여 해당 필드의 정합성 상태(UI)를 업데이트합니다.

**작업 위치**:
- `frontend/src/pages/verification-result/ui/VerificationResultPage.tsx`
- `frontend/src/widgets/ocr-field-editor/ui/OcrFieldEditor.tsx`

**규칙 준수**:
- 전역 상태(Redux) 남용 방지. 로컬 UI 상태(`useState`, `useReducer`)로 페이지 최상단에서 상태를 중앙 집중화하여 하위 위젯에 Prop으로 전달 (또는 Context API 사용).

**상세 내용**:
1. **로컬 편집 상태 초기화**: `use-verification-query`로 받아온 가공 데이터(딕셔너리 및 문서 초기값)를 `VerificationResultPage`의 로컬 `useState`로 복사.
2. **`onChange` 핸들러 구현**:
   - `OcrFieldEditor`에서 입력이 발생하면, 현재 키(key)와 입력 값(value)을 `handleChange` 함수로 부모에게 전달.
   - 부모에서 미리 구성해둔 **교차 검증 딕셔너리(`crossValidationDict`)**를 O(1) 속도로 조회.
   - 입력 값이 딕셔너리 내의 값 집합(`Set` 또는 배열)에 존재하면 해당 필드의 상태를 일시적으로 "통과" 모양(예: 녹색 체크마크, 빨간 테두리 제거)으로 업데이트. (실제 데이터 반영은 최종 저장 시 수행)
3. **Repository 색상 동기화**: 필드 상태가 변경되면 좌측 트리의 카테고리/문서 아이콘 상태도 우선순위 로직에 따라 재평가되어 렌더링되도록 연결.

---

## 🚀 구현 시작 준비 완료
위 명세서를 기반으로 작업을 진행할 수 있습니다. 1단계(`types.ts` 확장 및 Mock 데이터 구조화)부터 순차적으로 코드를 수정하는 것이 권장됩니다.
