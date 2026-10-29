# Contributing

기여해 주셔서 감사합니다. 이슈와 PR 모두 환영합니다.

## 개발 환경

- Node.js 20.19 이상 (`.nvmrc`는 22)
- pnpm (`corepack enable`을 실행하면 `package.json`에 고정된 버전이 자동으로 사용됩니다)

```bash
pnpm install
pnpm dev          # Storybook (http://localhost:6006)
```

PR을 올리기 전에 아래 명령이 모두 통과해야 합니다. CI도 같은 순서로 실행합니다.

```bash
pnpm lint
pnpm format:check   # 실패하면 pnpm format
pnpm typecheck
pnpm test
pnpm build
```

## 커밋 메시지

[Conventional Commits](https://www.conventionalcommits.org/ko/v1.0.0/)를 따릅니다.

```
feat(ui): add Switch component
fix(tokens): raise muted text contrast in dark theme
docs: explain theming in the introduction
chore: bump dependencies
ci: cache Playwright browsers
```

## 컴포넌트를 추가할 때

1. `packages/components/src/components/<Name>/` 아래에 `<Name>.tsx`, `<Name>.module.css`, `<Name>.test.tsx`, `index.ts`를 만듭니다.
2. 색상, 간격, 글꼴은 **토큰(`var(--maru-...)`)만** 사용합니다. 새 값이 필요하면 먼저 `packages/tokens`에 추가하고, 라이트와 다크 양쪽의 대비율 테스트를 함께 추가합니다.
3. 테스트에는 최소한 아래를 포함합니다.
   - 키보드 조작 (Tab, Enter, Space 등 해당 패턴에 맞는 키)
   - 비활성, 로딩 같은 상태 동작
   - `expectNoA11yViolations`를 이용한 axe 검사
4. `src/index.ts`에서 컴포넌트와 타입을 내보냅니다. 여기에 있는 것이 공개 API입니다.
5. `apps/docs/stories/<Name>.stories.tsx`에 스토리를 추가하고, 컴포넌트 설명에 **왜 이런 API인지**를 한두 문장으로 적습니다.
6. 사용자에게 영향이 있는 변경이면 `pnpm changeset`을 실행합니다.
7. 설계상 선택지가 있었다면 `docs/adr`에 기록합니다.

## 릴리스

릴리스는 [changesets](https://github.com/changesets/changesets)로 관리합니다.

1. 변경이 있는 PR에 changeset 파일을 포함합니다.
2. `main`에 병합되면 릴리스 워크플로가 "version packages" PR을 엽니다.
3. 그 PR을 병합하면 npm에 발행됩니다.

릴리스 워크플로는 기본적으로 꺼져 있습니다. 켜려면 아래를 설정하세요.

- 저장소 Secret `NPM_TOKEN` (npm automation 토큰)
- 저장소 Variable `NPM_RELEASE_ENABLED` = `true`
- Settings → Actions → General에서 "Allow GitHub Actions to create and approve pull requests" 허용
