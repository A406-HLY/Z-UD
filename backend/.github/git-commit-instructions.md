# Git Commit Convention

## Required: Use Unicode Gitmoji

**IMPORTANT**: Always use Unicode emoji characters (✨, ♻️, 🐛, etc.), NOT text codes (`:sparkles:`, `:recycle:`, `:bug:`).

### Gitmoji Reference Table

| **Emoji** | **Type** | **When to Use** |
| --- | --- | --- |
| 🎉 | init | Begin a project (initial commit) |
| ✨ | feat | Introduce new features |
| ♻️ | refactor | Refactor code |
| 🔥 | remove | Remove code or files |
| 🐛 | fix | Fix a bug |
| ✅ | test | Add or update tests |
| 📝 | docs | Add or update documentation |
| ➕ | deps | Add a dependency |
| ➖ | deps | Remove a dependency |
| 🔧 | config | Add or update configuration files |
| ⏪ | revert | Revert changes |
| 🚚 | rename | Move or rename resources (files, paths, routes) |
| 💡 | comment | Add or update comments in source code |

## Commit Message Format

```
<gitmoji> <type>: <subject>

<body>

Ref: #<jira-ticket>
```

### Structure Requirements

- **Line 1**: `<gitmoji> <type>: <subject>` (max 50 characters)
- **Line 2**: Empty line
- **Line 3+**: Body (bullet points with `-`)
- **Last section**: `Ref. #<ticket-number>` (separated by empty line)

## Examples

### Initial Commit Example

```
🎉 init: Spring Boot 애플리케이션 초기 설정

- Spring Boot 3.x 프로젝트 생성
- 기본 의존성 및 디렉토리 구조 설정
- application.yml 기본 설정 추가

Ref: #S14P21A406-1
```

### Backend Example

```
♻️ refactor: Spring AI 호환성 업데이트

- Spring AI 1.0.0 GA 버전 대응 의존성 업데이트
- 불필요한 로그 제거 및 메시지 포맷 개선

Ref: #S14P21A406-32
```

### Frontend Example

```
💡 style: 버튼 컴포넌트 스타일 수정

- Primary 버튼 hover 상태 색상 변경
- 버튼 패딩 및 border-radius 통일

Ref: #S14P21A406-45
```

## Subject Line Rules

### ✅ CORRECT Examples

```
🎉 init: Spring Boot 애플리케이션 초기 설정
✨ feat: 사용자 인증 추가
♻️ refactor: Spring AI 호환성 업데이트
🐛 fix: 로그인 리다이렉트 오류 해결
📝 docs: API 문서 업데이트
```

### ❌ INCORRECT Examples

```
✨ feat: 사용자 인증 추가.              // ❌ No period at end
✨ Feat: 사용자 인증 추가               // ❌ Type must be lowercase
✨ feat: 사용자 인증을 추가한다          // ❌ Use imperative mood (명령형), not verb endings
✨ feat: 사용자 인증을 추가했습니다       // ❌ Use imperative mood, not past tense
```

### Subject Line Requirements

1. **Max 50 characters** (한글 기준 약 25자 이내)
2. **Start with gitmoji** (Unicode character, not text)
3. **Type in lowercase** (feat, fix, refactor, etc.)
4. **Use imperative mood** (명령형): "추가" not "추가한다" or "추가했다"
5. **No period** at the end (마침표 금지)
6. **Write in Korean** (subject and body)

## Body Rules

### Format

- Use `-` (dash) to list changes
- Each bullet point on a new line
- Focus on **WHY** and **WHAT** changed
- Be specific and concise

### ✅ CORRECT Example

```
- Spring AI 1.0.0 GA 버전 대응 의존성 업데이트
- 불필요한 디버그 로그 제거
- 에러 메시지 포맷 개선
```

### ❌ INCORRECT Example

```
뭔가 업데이트하고 고침                   // ❌ Too vague
- 의존성 업데이트.                      // ❌ No period at end of bullets
- 로그를 제거했습니다                    // ❌ Use imperative mood, not past tense
```

## JIRA Ticket Rules

### ✅ CORRECT Format

```
Ref: #S14P21A406-32
Ref: #S14P21A406-32, #S14P21A406-45
```

### ❌ INCORRECT Format

```
Ref. #S14P21A406-32             // ❌ Use colon, not period
Ref S14P21A406-32               // ❌ Missing : and # symbol
#S14P21A406-32                  // ❌ Missing "Ref:" prefix
S14P21A406-32                   // ❌ Missing both "Ref:" and #
```

### Requirements

- **Must start with** `Ref: #`
- **Separate multiple tickets** with `, #`
- **Include accurate** JIRA issue number
- **Add empty line** before this section

## Quick Checklist

Before committing, verify:

- [ ] Unicode gitmoji used (not text code)
- [ ] Type is lowercase
- [ ] Subject is under 50 characters
- [ ] Subject uses imperative mood
- [ ] No period at end of subject
- [ ] Empty line after subject
- [ ] Body uses `-` for bullet points
- [ ] JIRA ticket format: `Ref: #TICKET-NUMBER`
- [ ] Empty line before JIRA ticket reference