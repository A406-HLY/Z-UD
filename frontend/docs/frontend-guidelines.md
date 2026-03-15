프론트엔드 에이전트 작업 지침서

당신은 React + TypeScript 기반 업무형 프론트엔드 프로젝트를 구현하는 에이전트다.
이 프로젝트는 단순 홍보형 웹이 아니라, 기초정보 입력 → 서류 업로드 → OCR 결과 확인/보정 → 외부 데이터 조회 → 심사 레포트 확인의 흐름을 가지는 업무형 시스템이다.

아래 지침을 반드시 준수하여 코드, 파일 구조, 상태 관리, API 연동, 주석, 환경 변수 사용 방식을 일관되게 유지하라.
이 문서의 목적은 협업 시 구조가 무너지지 않도록 하고, 생성되는 코드가 바로 실무 수준의 기준을 만족하게 만드는 것이다.

1. 기술 스택

다음 기술 스택을 기준으로 구현한다.

언어 및 프레임워크

TypeScript

React

Vite

React Router

상태 관리 및 데이터 통신

TanStack Query: 서버 상태 관리

Redux Toolkit: 전역 클라이언트 상태 관리

Axios: API 통신

UI 및 스타일링

Tailwind CSS

공통 컴포넌트 기반 UI 설계

개발 환경 및 품질 관리

Node.js

ESLint

Prettier

Git / GitLab

2. 기술 스택 사용 원칙
   React

화면은 컴포넌트 기반으로 분리한다

페이지 컴포넌트는 조립 역할만 담당한다

복잡한 로직은 hooks, model, util, feature 단위로 분리한다

TypeScript

any는 사용하지 않는다

API 응답 타입, UI 모델 타입, props 타입을 명확히 선언한다

타입 단언은 최소화한다

객체 모델은 interface 또는 type을 일관된 기준으로 사용한다

확장 가능성이 큰 객체 모델은 interface, 유니온/조합/매핑 타입은 type을 우선 사용한다

TanStack Query

서버 상태는 반드시 TanStack Query로 관리한다

useQuery, useMutation 기반 hook으로 감싼다

컴포넌트에서 직접 HTTP 요청을 호출하지 않는다

query key는 도메인 기준으로 일관되게 관리한다

Redux Toolkit

전역 클라이언트 상태만 관리한다

서버 응답 데이터를 Redux에 캐시처럼 저장하지 않는다

slice는 도메인 또는 워크플로우 책임 기준으로 분리한다

reducer 이름은 동작 중심으로 작성한다

selector를 활용해 state 접근을 일관되게 유지한다

Axios

공통 axios 인스턴스는 shared/api/client.ts에서 생성한다

인증, 공통 헤더, 에러 처리 등은 interceptor로 공통 관리한다

개별 API 파일에서 axios 인스턴스를 새로 만들지 않는다

Tailwind CSS

반복되는 업무형 UI를 빠르고 일관되게 구현하는 데 사용한다

인라인 스타일 남용을 피한다

공통 컴포넌트와 조합 가능한 방식으로 작성한다

3. 프로젝트 구조

프로젝트는 페이지 중심이 아니라 기능(feature)과 도메인(entity) 중심으로 구성한다.

최상위 구조
src/
├─ app/
├─ pages/
├─ widgets/
├─ features/
├─ entities/
├─ shared/
└─ mocks/
app

애플리케이션 초기화 및 전역 설정 담당

Router 설정

QueryClient 설정

Redux Toolkit store 설정

Provider 설정

글로벌 스타일

앱 진입점

예시:

app/router/routes.tsx

app/providers/query-client.ts

app/store/index.ts

app/store/hooks.ts

app/store/slices/review-flow.slice.ts

pages

라우트 단위 화면

페이지는 조립만 담당

API 호출, 비즈니스 로직, 세부 UI를 몰아넣지 않는다

예시:

pages/basic-info/ui/BasicInfoPage.tsx

pages/document-upload/ui/DocumentUploadPage.tsx

widgets

페이지 안의 의미 있는 UI 영역

여러 feature/entity를 조합하는 중간 단위

초반부터 무조건 만들지 않고 필요할 때 도입

예시:

widgets/layout/ui/AppLayout.tsx

widgets/document-status-panel/ui/DocumentStatusPanel.tsx

features

사용자 행동 중심 기능

제출

업로드

수정

재조회

다운로드

예시:

features/upload-document/

features/correct-ocr-field/

features/request-external-data/

entities

도메인 객체 중심 구성

applicant

document

screening

external-data

포함 가능:

타입

mapper

selector

도메인 전용 UI

query key

도메인 가공 로직

shared

전역 공통 자원

공통 UI

공통 API client

범용 util

공통 상수

범용 hook

config

주의:

업무 문맥이 강한 요소는 shared에 두지 않는다

mocks

개발 및 테스트용 목 데이터, mock handler

4. 폴더 내부 구조 규칙

각 feature/entity 내부에서는 아래 구조를 기본으로 사용한다.

feature-or-entity/
├─ api/
├─ model/
├─ ui/
└─ index.ts
ui

렌더링 중심 컴포넌트

JSX 중심

가능한 한 로직 최소화

model

타입

hook

selector

mapper

도메인 가공 로직

query key

상태 가공 로직

api

HTTP 요청 함수

요청/응답 타입

query/mutation 연결 함수

5. 코드 컨벤션
   기본 원칙

이름만 보고 역할이 드러나야 한다

한 파일은 한 가지 책임만 가진다

읽기 쉬운 코드가 우선이다

불필요한 축약은 지양한다

중복 제거보다 명확한 구조를 우선한다

지향하는 코드

처음 보는 팀원도 흐름을 따라갈 수 있는 코드

로직과 UI가 과도하게 섞이지 않은 코드

타입이 명확하고 예측 가능한 코드

상태 관리 책임이 분리된 코드

6. 네이밍 컨벤션
   컴포넌트 파일

PascalCase

예: BasicInfoForm.tsx, DocumentStatusBadge.tsx

훅 파일

파일명: kebab-case

함수명: camelCase

예:

파일: use-upload-document.ts

함수: useUploadDocument

API 파일

역할 기준으로 kebab-case 또는 도메인명.api.ts

예:

fetch-applicant.ts

upload-document.ts

document.api.ts

타입 파일

도메인명.types.ts

예: applicant.types.ts

매퍼 파일

도메인명.mapper.ts

예: document.mapper.ts

상수 파일

도메인명.constants.ts 또는 역할 기반 파일명

예: document.constants.ts, routes.ts

Redux 관련 파일

slice: 도메인명.slice.ts

selector: 도메인명.selector.ts

7. 변수 및 함수명 규칙
   변수명

camelCase 사용

축약형보다 의미가 드러나는 이름 사용

예:

selectedDocumentId

screeningResult

externalDataList

boolean 변수

is, has, can, should 접두어 사용

예:

isLoading

hasUploadError

canSubmit

배열 변수

복수형 사용

예:

documents

reportItems

이벤트 핸들러

handle 접두어 사용

예:

handleSubmit

handleRetryClick

데이터 조회 함수

fetch: API 요청

get: 동기 계산/조회

load: 초기 로딩 흐름

데이터 변환 함수

map, parse, format 사용

예:

mapDocumentResponseToModel

parseCurrencyInput

formatDateTime

8. TypeScript 규칙
   any 금지

any 사용 금지

불가피할 경우 unknown 우선

타입 단언 최소화

API 응답 타입과 UI 타입 분리

백엔드 응답 타입을 그대로 화면에 사용하지 않는다

mapper를 통해 프론트 내부 모델로 변환한다

예:

ApplicantResponse

Applicant

enum 사용

TypeScript enum보다는 문자열 상수 객체 + 유니온 타입 조합 우선

외부 라이브러리 연동 등 특별한 경우만 enum 검토

9. import / export 규칙
   import 순서

외부 라이브러리

절대경로 import

상대경로 import

스타일 import

경로 규칙

@/ alias 기준 절대경로 import 사용

상대경로 남용 금지

export 규칙

일반 컴포넌트, hook, util, selector, mapper는 named export 우선

default export는 page 컴포넌트 수준에서 제한적으로 허용

Redux slice는 slice.reducer, slice.actions 구조를 따른다

10. 상수 및 매직 넘버 규칙
    상수명

UPPER_SNAKE_CASE 사용

예:

MAX_FILE_SIZE

DEFAULT_PAGE_SIZE

매직 넘버 금지

의미 있는 숫자/문자열은 상수로 분리

11. 컴포넌트 작성 규칙
    한 파일 한 책임

하나의 컴포넌트 파일은 하나의 화면 조각만 담당한다

작성 순서

import

props/interface/type

상수

component 선언

hook 호출 (useState, useMemo, useAppSelector, useAppDispatch, query hook 등)

파생 값 계산

이벤트 핸들러

early return

JSX return

props 규칙

props가 3개 이상이거나 의미가 분명해야 하면 interface 분리

data, item, info 같은 포괄적 이름 지양

boolean props 남발 금지

boolean props가 2개 이상 조합되기 시작하면 enum 또는 문자열 유니온 타입 검토

조건부 렌더링

중첩 삼항 연산자 금지

복잡한 분기는 early return 또는 별도 함수/컴포넌트로 분리

로직 분리 기준

아래 중 2개 이상 해당하면 hook 또는 별도 함수로 분리한다.

비즈니스 로직이 JSX보다 많다

API 호출 관련 처리 포함

조건 분기가 많다

재사용 가능하다

12. 주석 컨벤션
    기본 원칙

주석은 코드 설명서가 아니라 이유, 배경, 제약사항을 남기는 용도다

“무엇을 하는지”보다 “왜 이렇게 하는지”를 설명한다

코드만 봐도 알 수 있는 설명은 주석으로 쓰지 않는다

주석이 필요한 경우

일반적이지 않은 예외 처리

업무 규칙 때문에 생긴 분기

임시 우회 로직

백엔드 응답 특이사항

나중에 수정이 필요한 지점

정책성 로직

TODO / FIXME / NOTE 규칙

TODO: 추후 구현 필요

FIXME: 현재 문제 있음

NOTE: 반드시 알아야 할 배경

금지 주석 예시

변수명 반복 설명

함수명 그대로 풀어쓴 설명

단순 조건문/반복문 해설

JSX 구조 해설

13. 환경 변수 규칙
    기본 원칙

프론트 환경 변수는 VITE\_ prefix 사용

민감 정보 저장 금지

환경별 설정은 파일로 분리

컴포넌트에서 직접 import.meta.env를 참조하지 않는다

파일 구성 예시

.env

.env.local

.env.development

.env.production

사용 원칙

환경 변수 접근은 shared/config/env.ts 또는 app/config에서 일괄 관리

숫자/boolean은 변환해서 사용

기본값 또는 검증 로직을 둔다

예:

export const env = {
apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
appEnv: import.meta.env.VITE_APP_ENV,
fileMaxSize: Number(import.meta.env.VITE_FILE_MAX_SIZE ?? 10485760),
enableMock: import.meta.env.VITE_ENABLE_MOCK === 'true',
};
금지 사항

비밀키, 토큰, 인증정보를 프론트 env에 저장

각 파일에서 import.meta.env 직접 남발

14. API 연동 규칙
    기본 원칙

컴포넌트에서 직접 axios/fetch 호출 금지

API 호출 함수는 api/ 폴더에 분리

서버 상태는 TanStack Query로 관리

공통 에러 처리와 인증 처리는 공통 API client에서 관리

응답 타입과 UI 타입은 분리

snake_case 응답은 mapper를 통해 camelCase 모델로 변환

역할 분리
컴포넌트

화면 렌더링과 이벤트 처리만 담당

query hook / mutation hook 호출까지만 담당

API 함수

실제 HTTP 요청 수행

URL, method, params, body 구성 담당

Query / Mutation Hook

TanStack Query 기반 서버 상태 관리

로딩/에러/재요청/invalidate 처리

Mapper

응답 타입 → UI 모델 변환

공통 API client 규칙

shared/api/client.ts에서 axios 인스턴스 생성

interceptor 분리

인증/공통 헤더/에러 처리 공통화

Query Key 규칙

배열 형태 사용

첫 값은 도메인명

식별자와 필터를 뒤에 추가

예:

['applicant', applicantId]
['documents', caseId]
['ocr-result', documentId]
['screening-report', caseId]
파일 업로드 규칙

FormData 사용

업로드 API 별도 분리

파일 크기/확장자/개수는 호출 전 검증

금지 패턴

컴포넌트 내부 직접 HTTP 호출

Redux에 서버 응답 원문 중복 저장

any 기반 응답 처리

snake_case 응답을 화면에서 직접 사용

15. 상태 관리 규칙
    기본 원칙

서버 상태는 TanStack Query

전역 클라이언트 상태는 Redux Toolkit

단순 UI 상태는 local state

동일한 데이터를 여러 저장소에 중복 저장하지 않는다

상태는 “어디서 쓰이는가”보다 “무엇을 나타내는가” 기준으로 분류한다

서버 상태

예:

고객 정보 조회 결과

업로드된 서류 목록

OCR 처리 결과

외부 데이터 조회 결과

심사 레포트 조회 결과

도구:

TanStack Query

전역 클라이언트 상태

예:

현재 진행 단계

선택된 심사 케이스 ID

선택된 문서 ID

현재 열려 있는 패널/탭 상태

OCR 보정 중인 임시 편집 데이터

심사 화면 전역 필터

도구:

Redux Toolkit

로컬 UI 상태

예:

input 값

모달 열림/닫힘

hover 상태

드롭다운 열림 여부

도구:

useState, 필요 시 useReducer

Redux Toolkit 규칙

전역 클라이언트 상태만 관리

서버 응답 원문 저장 금지

slice는 워크플로우/도메인 책임 기준으로 분리

reducer는 동작 중심 이름 사용

selector 기반 접근

예시 slice:

review-flow.slice.ts

document-ui.slice.ts

screening-filter.slice.ts

TanStack Query 규칙

useQuery, useMutation 기반 hook 사용

query key는 도메인 기준으로 일관되게 작성

mutation 성공 후 필요한 query만 invalidate

컴포넌트는 API 세부 구현에 직접 의존하지 않음

중복 저장 금지

같은 서버 데이터를 Query와 Redux에 동시에 저장하지 않는다

같은 UI 상태를 local state와 Redux에 동시에 저장하지 않는다

파생 가능한 값은 상태로 저장하지 않는다

파생 상태

selector 또는 useMemo로 계산

원본 상태 최소화

16. 파일 배치 및 공통화 기준
    shared에 둘지 판단 기준

아래 질문에 모두 예일 때만 shared 후보로 본다.

특정 업무 문맥 없이 쓸 수 있는가?

2개 이상의 화면/기능에서 재사용되는가?

앞으로도 공통으로 유지될 가능성이 높은가?

feature와 entity 구분

feature: 사용자 행동 중심

entity: 시스템이 다루는 대상 중심

page와 widget 구분

page: 라우트 단위 전체 화면

widget: 페이지 안의 의미 있는 섹션 단위

app과 shared 구분

app: 앱 초기화, provider, store, router, 전역 설정

shared: 범용 UI, util, API client, 공통 상수/타입

17. 금지 패턴

아래 패턴은 사용하지 않는다.

컴포넌트 내부 직접 API 호출

Redux를 서버 캐시 저장소처럼 사용하는 방식

Query와 Redux에 같은 의미의 데이터 중복 저장

any 사용

중첩 삼항 연산자

의미 없는 이름 사용 (temp, test, data, item, box)

domain 성격이 강한 컴포넌트를 shared에 배치

한 번만 쓰는 코드를 무리하게 공통화

컴포넌트 내부에서 import.meta.env 직접 사용

snake_case 응답을 화면에서 직접 소비

전역 상태에 단순 input 값까지 과도하게 넣는 방식

18. 생성 코드 품질 기준

생성하는 모든 코드는 다음 기준을 만족해야 한다.

파일 구조가 위 규칙과 일치할 것

타입 선언이 명확할 것

UI, 상태, API 책임이 분리되어 있을 것

주석은 필요한 경우에만 작성할 것

네이밍이 역할 중심일 것

페이지가 과도하게 비대하지 않을 것

서버 상태와 전역 상태를 혼용하지 않을 것

실제 협업 가능한 수준의 가독성과 유지보수성을 가질 것

19. 작업 방식 지시

코드를 생성할 때는 항상 아래 순서를 따른다.

요구사항을 기준으로 필요한 page / widget / feature / entity / shared 계층을 먼저 판단한다

상태가 서버 상태인지, 전역 클라이언트 상태인지, local state인지 먼저 분류한다

API가 필요하면 API 함수, query hook, mapper, 타입을 분리 설계한다

컴포넌트는 최대한 얇게 유지한다

재사용 범위가 명확한 경우에만 shared로 올린다

구현 후 파일명, 네이밍, import 순서, 타입, 상태 책임이 규칙에 맞는지 점검한다

20. 최종 출력 규칙

당신이 코드를 생성할 때는 다음을 지켜라.

먼저 필요한 폴더/파일 구조를 제안한다

그 다음 각 파일의 역할을 짧게 설명한다

이후 실제 코드를 파일 단위로 나눠서 작성한다

가능한 경우 타입, API, hook, component를 분리해서 제시한다

임의로 규칙을 단순화하거나 생략하지 않는다

편의상 한 파일에 몰아넣지 않는다

이 문서의 규칙과 충돌하는 방식은 사용하지 않는다

21. 한 줄 요약

이 프로젝트의 프론트엔드는
React + TypeScript + Vite + React Router + TanStack Query + Redux Toolkit + Axios + Tailwind CSS 기반으로 작성하며,
feature/entity 중심 구조, 명확한 타입 분리, 서버 상태와 클라이언트 상태의 책임 분리, 업무형 화면에 적합한 유지보수 가능한 코드를 기본 원칙으로 구현해야 한다.
