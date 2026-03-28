# 📊 백엔드 OCR 응답 JSON 상세 분석

## 1. 데이터 계층 구조
- **Root**: `data` 객체 하위에 `documents` (배열)와 `validationResult` (객체)가 공존.
- **Documents**: 개별 파일의 메타데이터와 OCR 추출 결과(`extraction`)를 포함.
- **Extraction**: `content` 내부에 실제 비즈니스 데이터가 필드 단위 객체로 구성됨.

## 2. 주요 필드 데이터 규격 (Field Level)
모든 개별 필드는 단순 값이 아닌 아래와 같은 **객체 형태**로 구성됨:
- `value`: 실제 값 (string | number | boolean | null).
- `confidence`: 추출 신뢰도.
- `evidence`: 시각적 근거 (`pageNum`, `bbox` 좌표 배열, `rawText`).

## 3. 중첩 및 리스트 구조
- **배열 형태 필드**: `householdMembers` (세대원), `taxItems` (세목 목록) 등 리스트 데이터 존재.
- **계층형 필드**: `spouse.name`, `buyer.name` 처럼 객체 내부의 객체 구조 존재.

## 4. 검증 결과 연동 (Validation)
- `validationResult`의 `documentMissings`, `violations`, `risks` 배열의 `documentType`과 `fields` 값을 매칭하여 UI 상태(`DocumentStatus`)를 결정함.
