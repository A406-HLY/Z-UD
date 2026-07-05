<div align="center">

# Zu.D AI

![Python][badge-python]
![PyTorch][badge-pytorch]
![Qwen](https://img.shields.io/badge/Qwen-6950EF?style=for-the-badge&logo=qwen&logoColor=white)
![Transformers][badge-transformers]
![vLLM][badge-vllm]
![Kafka][badge-kafka]
![PostgreSQL][badge-postgresql]

### 주택담보대출 서류 OCR · 내규 RAG · LLM 심사 자동화 모듈

> 고객 제출 서류를 OCR로 구조화하고, 상품별 대출 내규를 RAG로 검색한 뒤, 
> <br>
> LLM 기반 심사 결과와 설명 가능한 레포트를 생성합니다.

</div>

---

## 목차

- [프로젝트 개요](#프로젝트-개요)
- [핵심 기능](#핵심-기능)
- [전체 처리 흐름](#전체-처리-흐름)
- [기술 스택](#기술-스택)
- [RAG 설계](#rag-설계)
- [OCR 설계](#ocr-설계)
- [LLM 심사 설계](#llm-심사-설계)
- [Kafka 연동](#kafka-연동)
- [설치 및 실행](#설치-및-실행)
- [폴더 구조](#폴더-구조)
- [주요 파일](#주요-파일)
- [주의사항](#주의사항)

---

## 프로젝트 개요

**Zu.D AI**는 주택담보대출 상담 및 사전심사 업무를 지원하기 위한 AI 모듈입니다. 고객이 제출한 금융 서류를 OCR로 읽고, 심사에 필요한 값을 구조화한 뒤, 상품별 대출 내규를 검색하여 승인/검토/반려 판단에 필요한 근거 조항을 제공합니다.

AI 모듈은 다음 세 영역으로 구성됩니다.

- **OCR**: 제출 서류 PDF를 이미지로 변환하고, 문서 유형 분류 및 핵심 필드 추출을 수행합니다.
- **RAG**: 상품별 내규 문서를 조항 단위로 chunking하고, 필드별 검색 질의에 맞는 관련 조항을 hybrid retrieval로 매칭합니다.
- **LLM**: RAG가 반환한 관련 조항과 OCR/Backend 정규화 값을 기반으로 상품별 심사 결과와 설명 가능한 레포트를 생성합니다.

이 모듈은 AI가 최종 심사권자를 대체하는 것이 아니라, 행원과 심사 담당자가 빠르게 사전 검토를 수행할 수 있도록 **서류 판독 자동화, 내규 근거 탐색, 판단 사유 정리**를 지원하는 것을 목표로 합니다.

---

## 핵심 기능

### OCR

- PDF 및 presigned URL 기반 서류 다운로드
- PDF 페이지 이미지 렌더링
- Qwen2.5-VL 기반 문서 유형 분류
- 문서별 crop/full document/section split 추출 전략 적용
- 추출값별 confidence 및 evidence 생성
- 상담 단위 OCR 결과 JSON 생성

### RAG

- 상품별 내규 원문 txt/docx 로드
- 조항 단위 chunking
- Kiwi 기반 형태소 분석 및 후보 키워드 추출
- 도메인 보호어, blacklist, relevance filter 기반 키워드 정제
- `dragonkue/bge-m3-ko` 임베딩 생성
- PostgreSQL + pgvector 저장 및 로드
- query vector 사전 캐싱으로 검색 지연 최소화
- semantic similarity + concept/title/body bonus 기반 hybrid retrieval
- 상품별/필드별 `matched_articles` 생성
- Kafka update topic을 통한 내규 문서 갱신

### LLM 심사

- RAG 결과와 고객 입력값을 상품별 심사 입력으로 구성
- 명확한 조건은 결정론 룰로 우선 판단
- 문맥 판단이 필요한 항목만 Qwen3 LLM에 위임
- vLLM structured output 기반 JSON 응답 강제
- LTV/DSR 계산용 파라미터 산출
- 최종 `승인`, `검토`, `반려` summary 생성

---

## 전체 처리 흐름

```text
고객 서류 업로드
        |
        v
[Kafka: OCR 요청]
        |
        v
OCR Engine
  1. PDF 다운로드
  2. PDF -> 이미지 렌더링
  3. Qwen2.5-VL 문서 분류
  4. 문서별 필드 추출
  5. OCR 결과 JSON 생성
        |
        v
[Backend]
  - OCR 결과 정규화
  - 고객 입력값 결합
        |
        v
[Kafka: RAG 검색 요청]
        |
        v
RAG Engine
  1. 상품별 내규 chunk 로드
  2. 필드별 search_query 임베딩
  3. pgvector 기반 문서 chunk 검색
  4. concept/title/body bonus 반영
  5. matched_articles 생성
        |
        v
[Kafka: RAG 검색 결과]
        |
        v
LLM Judge Engine
  1. 상품별 심사 필드 구성
  2. 관련 내규 조항 주입
  3. 결정론 룰 + Qwen3 판단
  4. 계산 파라미터 및 심사 레포트 생성
        |
        v
[Kafka: 심사 결과]
        |
        v
Backend / Frontend
```

---

## 기술 스택

### Language

- Python 3.10+

### OCR / Vision

- Qwen2.5-VL
- Hugging Face Transformers
- PyTorch
- PyMuPDF
- Pillow
- OpenCV

### RAG

- SentenceTransformers
- `dragonkue/bge-m3-ko`
- Kiwi / kiwipiepy
- PostgreSQL
- pgvector
- psycopg2

### LLM

- Qwen3-14B
- vLLM
- Pydantic
- Structured Output

### Messaging

- Apache Kafka
- confluent-kafka
- python-dotenv

---

## RAG 설계

RAG 모듈은 `RAG/` 디렉터리에 구현되어 있습니다. 상품별 대출 내규를 조항 단위로 나누고, 각 chunk를 임베딩하여 PostgreSQL pgvector에 저장합니다. 검색 시에는 단순 벡터 유사도만 사용하지 않고, 금융 도메인 개념 사전과 제목/본문 키워드 보너스를 함께 반영합니다.

### RAG 데이터

| 경로 | 설명 |
| --- | --- |
| `RAG/data/document/ssadimdol.txt` | 싸딤돌 내규 원문 |
| `RAG/data/document/ssageumjari.txt` | 싸금자리 내규 원문 |
| `RAG/data/chunks/*_chunks.json` | chunking 및 keyword extraction 결과 |
| `RAG/data/concept_dict.json` | 도메인 개념, 동의어, 값 사전 |
| `RAG/data/english_to_korean_map.json` | 영문 필드명-한글 필드명 매핑 |
| `RAG/data/loan_products.json` | 상품 메타데이터 |
| `RAG/data/template/unified_search_schema.json` | 검색 대상 필드, 기본값, 검색 질의 schema |

### Chunk 생성

`keyword_pipeline`은 내규 원문을 다음 순서로 처리합니다.

```text
내규 원문 txt/docx
  -> ArticleChunker: 제n조 기준 chunk 분리
  -> CandidateExtractor: 형태소 기반 후보 키워드 추출
  -> BlacklistFilter: 일반어 제거
  -> RelevanceFilter: 문맥 관련도 필터링
  -> protected terms / title / structure bonus 반영
  -> concept_dict 기반 개념 매칭
  -> chunk JSON 생성
```

chunk 예시:

```json
{
  "chunk_id": "chunk_10",
  "article_id": "제10조",
  "title": "제10조 LTV 기준",
  "original_text": "제10조 LTV 기준 ...",
  "final_keywords": ["제10조 LTV 기준", "LTV", "보유주택수"],
  "concepts": ["담보 시세", "채권최고액", "보유주택수"]
}
```

### Vector DB

`database.py`는 상품별 chunk를 `document_chunks_{product}` 테이블에 저장합니다.

```text
document_chunks_ssadimdol
document_chunks_ssageumjari
```

저장 컬럼:

- `chunk_id`
- `article_id`
- `title`
- `original_text`
- `final_keywords`
- `concepts`
- `details`
- `embedding vector(1024)`

### Hybrid Retrieval

`hybrid_retriever.py`는 다음 점수를 합산하여 관련 조항을 검색합니다.

```text
final_score
  = cosine_similarity(query_vector, chunk_vector)
  + concept_bonus
  + title_bonus
  + body_bonus
```

보너스 기준:

- `concept_bonus`: 검색 필드가 chunk의 concept과 일치하면 가산
- `title_bonus`: 필드명/동의어/값이 조항 제목에 포함되면 가산
- `body_bonus`: 필드명/동의어/값이 조항 본문에 포함되면 가산

검색 결과는 필드별 `matched_articles`로 변환됩니다.

```json
{
  "propertyAddress": {
    "name_ko": "소재지 주소",
    "value": "서울특별시 강남구 테헤란로 123",
    "search_query": "담보 부동산의 소재지 주소에 따른 금융 규제지역 적용 기준은?",
    "matched_articles": ["제8조", "제10조", "제7조"]
  }
}
```

### RAG 출력 구조

`search_rules()`는 상담 ID와 상품별 필드 검색 결과를 반환합니다.

```json
{
  "consultationId": "CONS-2026-EMP-001",
  "result": {
    "ssadimdol": {
      "productName": "싸딤돌",
      "creditRating": {
        "name_ko": "신용등급",
        "value": "A",
        "search_query": "고객의 신용등급에 따른 주택담보대출 취급 기준 및 자격 요건은 어떻게 되는가?",
        "matched_articles": ["제2조"]
      }
    }
  }
}
```

이 결과는 LLM 심사 엔진의 입력으로 사용됩니다.

---

## OCR 설계

OCR 모듈은 `OCR/` 디렉터리에 구현되어 있습니다.

OCR은 단순 텍스트 인식이 아니라 **문서 유형 분류 → 문서별 추출 계획 선택 → 영역 기반 추출 → evidence 포함 JSON 생성** 순서로 동작합니다. 금융 제출 서류는 양식이 일정한 공공문서와 양식 변동이 큰 민간 문서가 섞여 있기 때문에, 문서 타입별로 서로 다른 추출 전략을 사용합니다.

### OCR 처리 파이프라인

```text
PDF 입력 또는 문서 URL 입력
  -> StorageService: presigned URL / file URL 다운로드
  -> pdf_service: PyMuPDF로 PDF 페이지 이미지 렌더링
  -> QwenDocumentClassifier: 문서 유형 분류
  -> doc_registry: 문서별 schema 및 extraction plan 조회
  -> CropService: crop_section / full_document / split_section 대상 이미지 생성
  -> QwenVLClient: Qwen2.5-VL 필드 추출
  -> ExtractorService: parser/postprocess/evidence wrapping
  -> OutputBuilder: 상담 단위 output.json 생성
```

### 주요 구성 파일

| 경로 | 역할 |
| --- | --- |
| `OCR/main.py` | 로컬 PDF 단일/일괄 OCR 실행 진입점 |
| `OCR/batch_pipeline.py` | 상담 ID와 문서 URL 목록을 처리하는 batch pipeline |
| `OCR/pipeline.py` | 로컬 파일 기반 OCR pipeline |
| `OCR/qwen_client.py` | Qwen2.5-VL 추론 클라이언트 |
| `OCR/services/qwen_doc_classifier.py` | Qwen2.5-VL 기반 문서 분류기 |
| `OCR/services/classifier_service.py` | 페이지별 분류 결과를 문서 단위로 집계 |
| `OCR/services/extractor_service.py` | 추출 plan 실행, parser, postprocess, evidence wrapping |
| `OCR/services/crop_service.py` | crop, full document, 등기부 section split 소스 해석 |
| `OCR/services/pdf_service.py` | PDF 페이지 이미지 변환 |
| `OCR/services/storage_service.py` | URL 또는 로컬 파일 다운로드 |
| `OCR/services/output_builder.py` | 최종 OCR 응답 JSON 생성 |
| `OCR/registry/doc_registry.py` | 문서별 schema, 필드, prompt, parser, merge rule 정의 |
| `OCR/registry/crop_templates.py` | 정형 문서 crop 영역 비율 좌표 정의 |
| `OCR/registry/section_splitter.py` | 등기사항전부증명서 표제부/갑구/을구 분할 |

### 문서 분류

문서 분류는 `OCR/services/qwen_doc_classifier.py`에서 수행합니다.

분류 모델:

- 기본 모델: `Qwen/Qwen2.5-VL-3B-Instruct`
- 입력 방식: 문서 상단 header crop 우선
- 출력 방식: JSON only
- 후보 타입: 주민등록등본, 초본, 가족관계증명서, 재직증명서, 건강보험 자격득실 확인서, 원천징수영수증, 사업자/소득/세금 서류, 등기부, 건축물대장, 매매계약서 등

분류 전략:

1. **Header title extraction**
   - 문서 상단 일부를 crop하여 제목, 발급기관, 핵심 단서를 추출합니다.
   - `titleText`, `issuerText`, `keyClues`, `confidence`를 JSON으로 받습니다.

2. **Title pattern matching**
   - `주민등록등본`, `가족관계증명서`, `등기사항전부증명서`, `매매계약서` 같은 제목 패턴을 정규화해서 문서 타입으로 매핑합니다.
   - 제목으로 매칭되면 confidence를 보수적으로 0.92 이상으로 보정합니다.

3. **Clue-based inference**
   - 제목이 불명확할 때 `갑구`, `을구`, `등기목적`, `자격득실`, `결정세액`, `과세표준` 같은 단서를 기반으로 문서 타입을 추론합니다.
   - 단서 기반 매칭은 confidence를 0.78 이상으로 보정합니다.

4. **Fallback multiclass classification**
   - 제목/단서 기반 분류가 실패하면 전체 문맥을 보고 documentType 후보 중 하나를 선택합니다.
   - 잘못된 타입은 `OTHER`로 fallback합니다.

분류 결과 예시:

```json
{
  "documentGroup": "PROPERTY_HOUSING",
  "documentType": "TITLE_DEED",
  "documentTypeLabel": "등기사항전부증명서",
  "classificationConfidence": 0.92,
  "classificationModel": "Qwen/Qwen2.5-VL-3B-Instruct",
  "classificationCropMode": "header",
  "classificationStrategy": "title",
  "titleText": "등기사항전부증명서",
  "keyClues": ["갑구", "을구", "등기목적"]
}
```

### 지원 문서

`OCR/registry/doc_registry.py` 기준으로 다음 서류를 처리합니다.

| 구분 | documentType | 문서 | 주요 추출 정보 |
| --- | --- | --- | --- |
| 신분/가족 | `RESIDENT_REGISTRATION` | 주민등록등본 | 발급일자, 발행번호, 세대원 목록 |
| 신분/가족 | `RESIDENT_REGISTRATION_ABSTRACT` | 주민등록초본 | 이름, 주민번호, 현주소, 전입일자 |
| 신분/가족 | `FAMILY_RELATION_CERTIFICATE` | 가족관계증명서 | 이름, 주민번호, 배우자/가족관계 정보 |
| 근로소득 | `EMPLOYMENT_CERTIFICATE` | 재직증명서 | 이름, 주민번호, 대표자명, 회사 직인 여부 |
| 근로소득 | `HEALTH_INSURANCE_ELIGIBILITY` | 건강보험 자격득실 확인서 | 가입자 구분, 취득일, 상실일 |
| 근로소득 | `WITHHOLDING_TAX_CERTIFICATE` | 근로소득 원천징수영수증 | 근무기간, 연간 소득, 결정세액 |
| 근로소득 | `SALARY_ACCOUNT_STATEMENT` | 급여통장거래내역서 | 급여 입금 내역, 수기 검토 필요 여부 |
| 사업소득 | `INCOME_AMOUNT_CERTIFICATE` | 소득금액증명원 | 귀속년도, 소득금액 |
| 사업소득 | `BUSINESS_REGISTRATION_CERTIFICATE` | 사업자등록증명원 | 사업자명, 사업자등록번호, 대표자 |
| 사업소득 | `VAT_TAX_BASE_CERTIFICATE` | 부가가치세과세표준증명 | 과세기간, 과세표준 매출액 |
| 세금 | `NATIONAL_TAX_CERTIFICATE` | 국세 납세증명서 | 발행번호, 이름, 발급일 |
| 세금 | `LOCAL_TAX_CERTIFICATE` | 지방세 납세증명서 | 발행번호, 이름, 발급일 |
| 세금 | `LOCAL_TAX_ITEM_CERTIFICATE` | 지방세 세목별 과세증명 | 세목별 과세 내역 |
| 담보 | `TITLE_DEED` | 등기사항전부증명서 | 소유자, 신탁등기, 권리침해, 선순위채권 |
| 담보 | `BUILDING_REGISTER` | 집합건축물대장 | 위반건축물, 주용도, 층별 현황 |
| 담보 | `SALE_CONTRACT` | 매매계약서 | 목적물 주소, 매매대금, 매도인, 매수인 |

### 추출 전략

`doc_registry.py`의 extraction plan은 필드마다 `source`, `extractor`, `parser`, `postprocess`, `mergeSpec`을 정의합니다. `ExtractorService`는 이 plan을 읽어 필드 단위로 Qwen2.5-VL을 호출합니다.

#### 1. crop_section

주민등록등본, 가족관계증명서, 납세증명서처럼 발급 양식이 비교적 일정한 문서는 필요한 영역만 잘라서 추출합니다.

장점:

- 모델 입력 범위 축소
- 안내문/QR/기관명 등 불필요한 텍스트 영향 감소
- 필드별 prompt를 구체화 가능
- bbox evidence를 필드 단위로 보존 가능

예시 영역:

- `header`: 발급일자, 발행번호
- `personal_info`: 이름, 주민등록번호
- `member_table`: 세대원 목록
- `income_info`: 소득금액
- `tax_info`: 세목별 과세 내역

#### 2. full_document

재직증명서, 매매계약서처럼 회사/작성자마다 양식이 달라지는 문서는 전체 문서를 입력으로 사용합니다.

적용 예시:

- 재직증명서: 재직자 이름, 주민번호, 대표자명, 회사 직인 여부
- 매매계약서: 목적물 주소, 매매대금, 특약사항, 매도인, 매수인
- 급여거래내역서: 급여 입금 흐름과 수기 검토 필요 여부

#### 3. split_section

등기사항전부증명서는 내부 구조가 복잡하므로 `section_splitter.py`에서 OpenCV 기반으로 표제부/갑구/을구를 분리합니다.

처리 흐름:

```text
이미지 로드
  -> grayscale 변환
  -> adaptive threshold
  -> dilation으로 표/텍스트 영역 병합
  -> contour 기반 박스 탐지
  -> y축 정렬
  -> 표제부 / 갑구 / 을구 section 분리
  -> section별 Qwen2.5-VL 추출
```

등기사항전부증명서에서 추출하는 정보:

- 건물 종류
- 소재지 주소
- 현재 소유자
- 신탁등기 여부
- 토지 별도등기/대지권 관련 여부
- 소유권이전청구권 가등기 등 권리침해 여부
- 임차보증금 및 선순위 권리의 채권최고액 목록

### 추출 타입과 parser

`ExtractorService`는 추출 타입에 따라 다른 출력 규칙을 붙입니다.

| 타입 | 사용 목적 | 출력 |
| --- | --- | --- |
| `single` | 이름, 날짜, 금액, boolean 등 단일 값 | 최종 값만 출력 |
| `object` | 매도인/매수인처럼 여러 하위 필드를 가진 객체 | JSON object |
| `list` | 세대원 목록, 과세 내역, 권리 목록 같은 반복 행 | JSON array |

지원 parser:

- `text`, `name`, `address`, `date`, `rrn`, `biz_no`, `year`, `enum`, `text_block`
- `bool`: `있음`, `없음`, `true`, `false`, `O`, `X` 등을 boolean으로 정규화
- `amount`: 콤마/원/공백 제거 후 숫자 변환
- `int`: 문자열 내 숫자 추출
- `json`: JSON object/array 파싱

postprocess 예시:

- `trim`: 문자열 공백 제거
- `numeric_string`: 금액 문자열 정규화
- `dedup`: list row 중복 제거

### Evidence 구조

추출된 모든 필드는 아래 형식으로 감싸집니다.

```json
{
  "value": "김민수",
  "confidence": 0.9,
  "evidence": {
    "pageNum": 1,
    "bbox": [0.12, 0.31, 0.45, 0.37],
    "rawText": "김민수",
    "confidence": 0.9
  }
}
```

이 evidence는 후속 UI나 레포트에서 “AI가 어떤 문서의 어느 영역을 보고 이 값을 추출했는지”를 확인하는 데 사용됩니다.

### 페이지 병합

여러 페이지 문서의 경우 `merge_page_results()`가 문서별 `mergeSpec`에 따라 결과를 병합합니다.

- scalar field: confidence가 가장 높은 유효 값을 선택
- object field: 하위 필드별로 가장 신뢰도 높은 값을 선택
- list field: 모든 페이지 row를 합친 뒤 dedup key 기준 중복 제거

### OCR 실패 처리

문서 처리 중 예외가 발생하면 해당 문서는 `FAILED` 상태로 반환됩니다.

```json
{
  "status": "FAILED",
  "error": {
    "code": "OCR_PROCESSING_ERROR",
    "message": "문서 처리 중 발생한 오류 메시지"
  }
}
```

### OCR 결과

OCR 결과는 상담 단위 JSON으로 생성되며, 추출값마다 원문 근거를 포함합니다.

```json
{
  "value": "김민수",
  "confidence": 0.9,
  "evidence": {
    "pageNum": 1,
    "bbox": [74, 379, 1340, 589],
    "rawText": "김민수",
    "confidence": 0.9
  }
}
```

---

## LLM 심사 설계

LLM 모듈은 `LLM/` 디렉터리에 구현되어 있습니다.

LLM 심사 엔진은 RAG가 반환한 `matched_articles`를 기반으로 상품별 내규 조항을 읽고, 필드별 심사 결과와 상품별 summary를 생성합니다. 금융 도메인의 안정성을 위해 모든 판단을 LLM에 맡기지 않고, 명확한 하드 룰은 코드로 확정하고 문맥 해석이 필요한 항목만 Qwen3에 위임합니다.

### 주요 구성 파일

| 경로 | 역할 |
| --- | --- |
| `LLM/run/run_kafka_worker.py` | Kafka 기반 심사 worker, 모델 로딩, 판단 실행 |
| `LLM/metadata/metadata.json` | 계산 필드, 리포트 필드, 필수 필드, 상품 메타데이터, LTV/DSR 룰 |
| `LLM/metadata/field_metadata.json` | 필드 메타데이터 |
| `LLM/judge_rules/judge_criteria.txt` | 공통 심사 기준 및 산식 |
| `LLM/regulations/ssadimdol.txt` | 싸딤돌 상품 내규 |
| `LLM/regulations/ssageumjari.txt` | 싸금자리 상품 내규 |
| `LLM/regulations/RULE.json` | 조항 chunk 메타데이터 |
| `LLM/example_data/*.json` | 근로자/사업자 심사 입력 예시 |
| `LLM/prompt/qwen_llm_prompt.py` | 로컬 실험 및 프롬프트 검증용 코드 |

### 모델 및 추론 설정

- 모델: `Qwen/Qwen3-14B`
- 추론 엔진: `vLLM`
- tokenizer: `AutoTokenizer.from_pretrained(..., trust_remote_code=True)`
- `gpu_memory_utilization=0.6`
- `max_num_seqs=8`
- `max_model_len=16384`
- field 판단 `temperature=0.0`, `top_p=1.0`, `max_tokens=350`
- summary 생성 `temperature=0.0`, `top_p=1.0`, `max_tokens=350`
- 출력 제어: `StructuredOutputsParams(json=...)`

Qwen 계열 모델이 `<think>...</think>` 블록을 반환할 수 있으므로, 응답 후 `strip_thinking_content()`로 thinking block을 제거하고 첫 JSON object만 파싱합니다.

### 입력

RAG 모듈이 생성한 상품별 필드 데이터가 LLM 심사 입력으로 들어갑니다.

- 필드명
- 입력값
- 검색 질의
- 관련 내규 조항 ID
- 상품 메타데이터

입력 구조 예시:

```json
{
  "consultationId": "CONS-2026-EMP-001",
  "result": {
    "ssadimdol": {
      "productName": "싸딤돌",
      "creditRating": {
        "name_ko": "신용등급",
        "value": "A",
        "search_query": "고객의 신용등급에 따른 주택담보대출 취급 기준 및 자격 요건은 어떻게 되는가?",
        "matched_articles": ["제2조"]
      },
      "propertyAddress": {
        "name_ko": "소재지 주소",
        "value": "서울특별시 강남구 테헤란로 123",
        "search_query": "담보 부동산 소재지에 따른 규제지역 적용 기준은?",
        "matched_articles": ["제8조", "제10조", "제7조"]
      }
    }
  }
}
```

Worker는 `result` 내부의 상품 코드를 순회하며 `metadata.json`에 정의된 상품만 처리합니다. 과거 메시지 구조와 호환하기 위해 `products` 키도 일부 지원합니다.

### 내규 조항 로딩

`load_rule_index_from_txt()`는 상품별 내규 txt를 정규식으로 파싱합니다.

```text
제1조 ...
제2조 ...
제3조 ...
```

각 조항은 다음 구조로 index화됩니다.

```json
{
  "제2조": {
    "clauseId": "제2조",
    "title": "차주 자격 요건",
    "clauseText": "제2조 차주 자격 요건 ..."
  }
}
```

RAG가 반환한 `matched_articles`를 이 index에 매핑해 `matchedRules`를 만들고, 해당 조항 본문을 LLM 프롬프트에 주입합니다.

### 판단 방식

명확한 금융 조건은 코드 기반 결정론 룰로 처리하고, 내규 문맥 해석이 필요한 필드만 Qwen3 LLM에 위임합니다.

### 결정론 룰

`deterministic_for_report()`에서 확정 가능한 필드는 LLM 호출 없이 바로 판단합니다.

| fieldKey | 판단 기준 |
| --- | --- |
| 공통 | 값이 없거나 빈 값이면 `검토` |
| `creditRating` | `A`이면 `승인`, 그 외 `반려` |
| `loanPurpose` | `주택 구매`이면 `승인`, 그 외 `반려` |
| `ownedHouseCount` | 정수가 아니면 `검토`, 2채 이상이면 `반려`, 0~1채면 `승인` |
| `ownerName`, `buyer` | 값이 있으면 기본 인적 확인 정보로 `승인` |
| `isViolationBuilding` | 위반건축물이면 `반려`, 아니면 `승인` |
| `hasTrustRegistration` | 신탁등기가 있으면 `반려`, 아니면 `승인` |
| `hasLandRightCause` | 토지 권리 분리 사유가 있으면 `반려`, 아니면 `승인` |
| `hasOwnershipTransferClaim` | 권리침해가 있으면 `반려`, 아니면 `승인` |
| `floorStatusList` | 주택/아파트/공동주택/빌라/단독주택 용도 확인 시 `승인`, 아니면 `검토` |
| `deathConfirmed` | 싸딤돌에서 `0명`이면 `반려`, 그 외 사망자 요건 충족 시 `승인` |

### LLM 판단 대상

- 건물 종류 및 주용도의 담보 적격성
- 근무 유형 및 근무기간의 재직 안정성
- 소득 증빙의 인정 가능성
- 내규 조항 기반 보완/검토 사유 생성
- 담보 주소와 규제지역/내규 문맥 관련 설명
- 사업자 소득 및 과세표준의 심사상 의미

LLM으로 넘기는 대표 필드:

- `buildingType`
- `mainUsage`
- `employmentType`
- `workPeriod`
- `subscriberType`
- `annualIncomeTotal`
- `incomeAmount`
- `taxableSalesAmount`
- `propertyAddress`

### Field Prompt 구성

`build_field_prompt()`는 필드 하나만 판단하도록 프롬프트를 구성합니다.

프롬프트에 포함되는 정보:

- 상품 코드 및 상품명
- 현재 fieldKey
- 한글 필드명
- 입력값
- required 여부
- RAG `matched_articles`
- matched article 본문
- 상품 전체 내규 원문
- 공통 심사 기준

판단 규칙:

- 결과는 `승인`, `검토`, `반려` 중 하나
- 값이 없거나 null이면 `검토`
- 내규 위반이 명확하면 `반려`
- 충족이 명확하면 `승인`
- reason은 한 문장
- usedArticles에는 실제 사용 조항만 포함
- 싸금자리의 `deathConfirmed`는 평가 제외

### Structured Output

필드 판단 JSON schema:

```json
{
  "result": "승인 | 검토 | 반려",
  "reason": "판단 사유",
  "usedArticles": ["제n조"]
}
```

summary JSON schema:

```json
{
  "finalResult": "승인 | 검토 | 반려",
  "reason": "최종 판단 요약",
  "keyApprovalReasons": [],
  "keyRejectReasons": [],
  "keyReviewReasons": []
}
```

파싱 실패 시 처리:

- field 판단 실패: 해당 필드를 `검토` 처리
- summary 생성 실패: fieldResults를 기준으로 보수적 fallback summary 생성
- 반려가 하나라도 있으면 최종 `반려`
- 반려가 없고 검토가 하나라도 있으면 최종 `검토`
- 나머지는 최종 `승인`

### 계산 파라미터 산출

`run_for_calculate()`는 `metadata.json`의 `forCalculate.fields`에 정의된 항목을 생성합니다.

| 필드 | 산출 방식 |
| --- | --- |
| `collateralMarketPrice` | 담보 시세가 있으면 사용, 없으면 `salePrice` fallback |
| `maximumClaimAmount` | `seniorRights` 목록의 `maximumClaimAmount` 합산 |
| `totalRemainingLoanBalance` | 입력값 그대로 사용 |
| `LTVRatio` | 주소 기반 규제지역 여부 + 보유주택 수 기준 비율 적용 |
| `annualIncomeTotal` | 근로자는 `annualIncomeTotal`, 사업자는 `incomeAmount` 사용 |
| `annualPrincipalAndInterestRepayment` | 입력값 그대로 사용 |
| `DSRRatio` | 소득 데이터가 있으면 40%, 없으면 보수적으로 20% |

LTV 규제지역 판단:

- 주소에 `서울`, `경기`, `인천` 포함: 규제지역
- 그 외: 비규제지역

LTV 비율:

| 지역 | 보유주택 수 | 적용 비율 |
| --- | ---: | ---: |
| 규제지역 | 0채 | 40% |
| 규제지역 | 1채 | 30% |
| 규제지역 | 2채 이상 | 20% |
| 비규제지역 | 0채 | 70% |
| 비규제지역 | 1채 | 60% |
| 비규제지역 | 2채 이상 | 50% |

### 최종 출력

```json
{
  "productCode": "ssadimdol",
  "productName": "싸딤돌",
  "forCalculate": {
    "LTVRatio": {
      "value": 0.4,
      "reason": "규제지역이며 보유주택 수 0채 기준으로 LTV 비율을 적용했습니다.",
      "usedArticles": ["제8조", "제10조"]
    }
  },
  "forReport": {
    "fieldResults": [
      {
        "fieldKey": "creditRating",
        "name_ko": "신용등급",
        "inputValue": "A",
        "result": "승인",
        "reason": "신용등급이 A로 확인되어 자격 요건을 충족합니다.",
        "usedArticles": ["제2조"]
      }
    ],
    "summary": {
      "finalResult": "승인",
      "reason": "주요 필수 요건이 충족되어 승인으로 판단됩니다."
    }
  }
}
```

### Kafka Worker 처리 흐름

```text
review-request 수신
  -> JSON decode
  -> consultationId 추출
  -> 상품별 product_block 순회
  -> metadata에 없는 상품은 skip
  -> 상품별 내규 txt 로드
  -> forCalculate 생성
  -> forReport fieldResults 생성
  -> summary 생성
  -> report-response 발행
  -> CUDA cache 정리
```

---

## Kafka 연동

### RAG Worker

RAG worker는 `RAG/kafka_app.py`에서 실행됩니다.

환경 변수:

```env
KAFKA_BROKER_URL=localhost:9092
KAFKA_INPUT_TOPIC=rag-request
KAFKA_OUTPUT_TOPIC=rag-response
KAFKA_UPDATE_TOPIC=rag-update
KAFKA_GROUP_ID=rag-service-group

VECTOR_DB_HOST=localhost
VECTOR_DB_PORT=5432
VECTOR_DB_USER=zud
VECTOR_DB_PASSWORD=your-password
VECTOR_DB_NAME=zud
```

동작:

- `KAFKA_INPUT_TOPIC`: 고객/상담 입력값을 받아 필드별 관련 조항 검색
- `KAFKA_OUTPUT_TOPIC`: 상품별 `matched_articles` 검색 결과 발행
- `KAFKA_UPDATE_TOPIC`: 내규 파일 다운로드 후 chunk 재생성 및 vector DB 갱신

### OCR Worker

| 항목 | 값 |
| --- | --- |
| 실행 파일 | `OCR/run_kafka_worker.py` |
| 입력 토픽 | `ocr-request` |
| 출력 토픽 | `ocr-response` |

### LLM Worker

| 항목 | 값 |
| --- | --- |
| 실행 파일 | `LLM/run/run_kafka_worker.py` |
| 입력 토픽 | `review-request` |
| 출력 토픽 | `report-response` |

---

## 설치 및 실행

### 1. 공통 가상환경

```bash
cd ai

python -m venv .venv
source .venv/bin/activate
```

Windows PowerShell:

```powershell
cd ai

python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

### 2. RAG 의존성 설치

```bash
cd RAG

pip install -r requirements.txt
```

### 3. RAG 로컬 검색 테스트

```bash
cd RAG

python generate_check.py
```

실행 결과는 `../check.txt`에 저장됩니다.

### 4. RAG Kafka Worker 실행

```bash
cd RAG

python kafka_app.py
```

### 5. RAG Docker 실행

```bash
cd RAG

docker build -t zud-rag .
docker run --env-file .env zud-rag
```

### 6. OCR 로컬 실행

```bash
cd OCR

python main.py --input-dir ./data --recursive --debug
```

상담 단위 로컬 배치:

```bash
cd OCR

PYTHONPATH=. python test/run_local_batch.py --input-dir ./data --debug
```

Windows PowerShell:

```powershell
cd OCR

$env:PYTHONPATH="."
python .\test\run_local_batch.py --input-dir .\data --debug
```

### 7. OCR Kafka Worker 실행

```bash
cd OCR

python run_kafka_worker.py
```

### 8. LLM Kafka Worker 실행

```bash
cd LLM

python run/run_kafka_worker.py
```

---

## 폴더 구조

```text
ai/
├── README.md
├── OCR/
│   ├── main.py
│   ├── pipeline.py
│   ├── batch_pipeline.py
│   ├── qwen_client.py
│   ├── run_kafka_worker.py
│   ├── registry/
│   ├── services/
│   ├── crop/
│   └── test/
│
├── RAG/
│   ├── api.py
│   ├── kafka_app.py
│   ├── hybrid_retriever.py
│   ├── database.py
│   ├── schemas.py
│   ├── generate_check.py
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── data/
│   │   ├── chunks/
│   │   ├── document/
│   │   ├── template/
│   │   ├── concept_dict.json
│   │   ├── english_to_korean_map.json
│   │   └── loan_products.json
│   └── keyword_pipeline/
│       ├── chunker.py
│       ├── candidate_extractor.py
│       ├── morph_analyzer.py
│       ├── relevance_filter.py
│       ├── blacklist.py
│       ├── config.py
│       └── pipeline.py
│
└── LLM/
    ├── run/
    ├── prompt/
    ├── metadata/
    ├── judge_rules/
    ├── regulations/
    └── example_data/
```

---

## 주요 파일

| 경로 | 설명 |
| --- | --- |
| `RAG/api.py` | RAG AppState 초기화, vector DB 로드/갱신, 검색 실행 |
| `RAG/kafka_app.py` | Kafka 기반 RAG worker |
| `RAG/hybrid_retriever.py` | semantic similarity + concept/title/body bonus 검색 |
| `RAG/database.py` | PostgreSQL pgvector 저장 및 로드 |
| `RAG/keyword_pipeline/pipeline.py` | 내규 chunk keyword extraction pipeline |
| `RAG/keyword_pipeline/chunker.py` | 제n조 기준 조항 chunking |
| `RAG/data/template/unified_search_schema.json` | 필드별 검색 질의 및 기본값 schema |
| `OCR/main.py` | OCR 로컬 실행 진입점 |
| `OCR/batch_pipeline.py` | 상담 단위 OCR 배치 파이프라인 |
| `OCR/registry/doc_registry.py` | 문서별 추출 schema 및 prompt 정의 |
| `LLM/run/run_kafka_worker.py` | RAG 결과 기반 LLM 심사 worker |
| `LLM/metadata/metadata.json` | 심사 필드, 필수값, LTV/DSR 룰 |
| `LLM/regulations/*.txt` | LLM 심사용 상품별 내규 원문 |

---

## 주의사항

- RAG는 PostgreSQL의 `vector` extension을 사용하므로 DB에 pgvector가 설치되어 있어야 합니다.
- `database.py`는 `VECTOR_DB_*` 환경 변수를 사용합니다. `.env` 또는 실행 환경에 값을 반드시 설정해야 합니다.
- RAG worker는 시작 시 DB에서 chunk를 먼저 로드하고, DB가 비어 있으면 `RAG/data/document`의 내규 파일로 chunk와 embedding을 재생성합니다.
- `kafka_app.py`의 update topic은 txt/docx/doc 파일 다운로드 후 특정 상품 테이블을 갱신합니다.
- OCR/LLM 모델은 GPU 환경을 권장합니다. CPU 환경에서는 모델 로딩 및 추론 시간이 매우 길 수 있습니다.
- LLM 심사에서는 불확실한 값, 누락값, 파싱 실패를 보수적으로 `검토`로 처리합니다.

---

### Zu.D AI

OCR, RAG, LLM을 결합해 주택담보대출 사전심사 업무의 서류 판독과 내규 근거 탐색을 자동화하는 AI 모듈입니다.

<!-- Badges -->
[badge-python]: https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white
[badge-pytorch]: https://img.shields.io/badge/PyTorch-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white
[badge-transformers]: https://img.shields.io/badge/Hugging%20Face-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black
[badge-vllm]: https://img.shields.io/badge/vLLM-5B5FC7?style=for-the-badge
[badge-kafka]: https://img.shields.io/badge/Apache%20Kafka-231F20?style=for-the-badge&logo=apachekafka&logoColor=white
[badge-postgresql]: https://img.shields.io/badge/PostgreSQL%20%2B%20pgvector-4169E1?style=for-the-badge&logo=postgresql&logoColor=white
