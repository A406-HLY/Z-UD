<div align="center">

# Zu.D AI

![Python][badge-python]
![PyTorch][badge-pytorch]
![Transformers][badge-transformers]
![vLLM][badge-vllm]
![Kafka][badge-kafka]
![PostgreSQL][badge-postgresql]

### 주택담보대출 서류 OCR · 내규 RAG · LLM 심사 자동화 모듈

> 고객 제출 서류를 OCR로 구조화하고, 상품별 대출 내규를 RAG로 검색한 뒤, LLM 기반 심사 결과와 설명 가능한 레포트를 생성합니다.

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

### 지원 문서

`OCR/registry/doc_registry.py` 기준으로 다음 서류를 처리합니다.

| 구분 | 문서 |
| --- | --- |
| 신분/가족 | 주민등록등본, 주민등록초본, 가족관계증명서 |
| 근로소득 | 재직증명서, 건강보험 자격득실 확인서, 근로소득 원천징수영수증, 급여통장거래내역서 |
| 사업소득 | 소득금액증명원, 사업자등록증명원, 부가가치세과세표준증명 |
| 세금 | 국세 납세증명서, 지방세 납세증명서, 지방세 세목별 과세증명 |
| 담보 | 등기사항전부증명서, 집합건축물대장, 매매계약서 |

### 추출 전략

- `crop_section`: 정형 서류의 특정 영역만 crop하여 필드 추출
- `full_document`: 양식이 다양한 문서 전체를 입력으로 추출
- `split_section`: 등기사항전부증명서의 표제부/갑구/을구를 분리하여 추출

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

### 입력

RAG 모듈이 생성한 상품별 필드 데이터가 LLM 심사 입력으로 들어갑니다.

- 필드명
- 입력값
- 검색 질의
- 관련 내규 조항 ID
- 상품 메타데이터

### 판단 방식

명확한 금융 조건은 코드 기반 결정론 룰로 처리하고, 내규 문맥 해석이 필요한 필드만 Qwen3 LLM에 위임합니다.

결정론 룰 예시:

- 입력값 누락: `검토`
- 신용등급 A: `승인`
- 신용등급 A 외: `반려`
- 대출 목적이 주택 구매가 아님: `반려`
- 보유주택 수 2채 이상: `반려`
- 위반건축물/신탁등기/권리침해 확인: `반려`

LLM 판단 대상 예시:

- 건물 종류 및 주용도의 담보 적격성
- 근무 유형 및 근무기간의 재직 안정성
- 소득 증빙의 인정 가능성
- 내규 조항 기반 보완/검토 사유 생성

### 출력

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
