# Maru UI

> React + TypeScript 디자인 시스템 · CSS 변수 토큰 · a11y 테스트 · Storybook

작지만 프로덕션 수준을 목표로 합니다.
컴포넌트 수보다 **접근성, 테스트, 문서, 릴리스의 완성도**에 집중합니다.

[![CI](https://github.com/ohseungik/Maru-UI/actions/workflows/ci.yml/badge.svg)](https://github.com/ohseungik/Maru-UI/actions/workflows/ci.yml)
[![license](https://img.shields.io/github/license/ohseungik/Maru-UI)](./LICENSE)

<!-- 첫 npm 릴리스 후 아래 배지의 주석을 해제하세요.
[![npm](https://img.shields.io/npm/v/@ohseungik/maru-ui)](https://www.npmjs.com/package/@ohseungik/maru-ui)
-->

**[📖 문서 / Storybook 보기](https://ohseungik.github.io/Maru-UI/)**

<!-- 데모 GIF 또는 스크린샷을 README 상단에 두면 효과적입니다.
![demo](./docs/assets/demo.gif)
-->

---

## 왜 만들었나

디자인 시스템을 "많이 만드는 것"보다 "제대로 운영 가능한 상태로 만드는 것"이 더 어렵다고 생각해서 시작했습니다.
이 프로젝트는 아래 질문에 대한 저의 답을 코드와 문서로 남기는 과정입니다.

- 토큰은 어떤 구조여야 테마 확장과 다크모드에 유리한가?
- 어디까지 직접 구현하고, 어디부터 검증된 headless 라이브러리에 맡길 것인가?
- 접근성과 SSR 호환을 컴포넌트 단위로 어떻게 보장할 것인가?
- 소비하는 쪽(앱)에서 쓰기 쉬운 API와 번들 크기는 어떤 모습인가?

## 설계 원칙

1. **접근성이 기본값입니다.** 키보드 조작, 포커스 관리, aria 연결을 컴포넌트마다 테스트하고, 색상 대비는 토큰 단계에서 검증합니다.
2. **런타임 비용을 만들지 않습니다.** CSS 변수 토큰 + CSS Modules로 zero-runtime 스타일링을 사용합니다.
3. **판단 근거를 기록합니다.** 주요 결정은 [`docs/adr`](./docs/adr)에 ADR로 남깁니다.
4. **작게, 끝까지.** 적은 수의 컴포넌트를 문서·테스트·릴리스까지 완성합니다.

## 패키지 구성

| 패키지                                        | 설명                                                           |
| --------------------------------------------- | -------------------------------------------------------------- |
| [`@ohseungik/maru-tokens`](./packages/tokens) | JSON 디자인 토큰 → CSS 변수 (light / dark) + 타입이 있는 JS 값 |
| [`@ohseungik/maru-ui`](./packages/components) | React 컴포넌트 (ESM, 타입 포함)                                |
| [`apps/docs`](./apps/docs)                    | Storybook 기반 문서 사이트 (GitHub Pages 배포)                 |

## 빠른 시작

> ⚠️ 첫 릴리스(`0.1.0`) 전까지는 아래 설치 방법이 동작하지 않을 수 있습니다.

```bash
pnpm add @ohseungik/maru-ui @ohseungik/maru-tokens
```

```tsx
// 앱 진입점에서 한 번만 불러옵니다.
import '@ohseungik/maru-tokens/css';
import '@ohseungik/maru-ui/styles.css';

import { Button, Stack } from '@ohseungik/maru-ui';

export function App() {
  return (
    <Stack direction="horizontal" gap={3}>
      <Button>저장</Button>
      <Button variant="secondary">취소</Button>
    </Stack>
  );
}
```

다크모드는 기본적으로 OS 설정을 따르고, 루트 요소의 `data-theme="light | dark"` 속성으로 고정할 수 있습니다.

## 토큰 구조

```
Palette                    →  Semantic                  →  Component (컴포넌트 CSS 내부)
--maru-palette-blue-600       --maru-color-action-bg       --button-bg
--maru-palette-gray-900       --maru-color-text-default    --button-fg

Scale: --maru-space-4, --maru-radius-md, --maru-font-size-md, --maru-motion-duration-fast
```

- **Palette**: 날 것의 값 (팔레트)
- **Scale**: 간격, 반경, 타이포그래피, 모션 스케일
- **Semantic**: 의도를 담은 이름. **테마는 이 계층에서만 교체**합니다.
- **Component**: 토큰 파일이 아니라 각 컴포넌트 CSS의 지역 변수로 둡니다.

자세한 배경은 [ADR-001](./docs/adr/001-token-architecture.md)을 참고하세요.

## 컴포넌트 현황

| 컴포넌트       | 구현 | 접근성 테스트 | 스토리/문서 | 비고                        |
| -------------- | :--: | :-----------: | :---------: | --------------------------- |
| Button         |  ✅  |      ✅       |     ✅      | 직접 구현                   |
| Text / Heading |  ✅  |      ✅       |     ✅      | level과 시각 크기를 분리    |
| Stack          |  ✅  |      ✅       |     ✅      | 레이아웃 프리미티브         |
| Input / Field  |  ☐   |       ☐       |      ☐      | 라벨·에러 연결              |
| Checkbox       |  ☐   |       ☐       |      ☐      | 직접 구현                   |
| Switch         |  ☐   |       ☐       |      ☐      | 직접 구현                   |
| Tabs           |  ☐   |       ☐       |      ☐      | 직접 구현 (roving tabindex) |
| Dialog         |  ☐   |       ☐       |      ☐      | headless 라이브러리 래핑    |
| Select         |  ☐   |       ☐       |      ☐      | headless 라이브러리 래핑    |
| Tooltip        |  ☐   |       ☐       |      ☐      |                             |
| Popover        |  ☐   |       ☐       |      ☐      |                             |
| Toast          |  ☐   |       ☐       |      ☐      |                             |
| Table          |  ☐   |       ☐       |      ☐      | 기본형                      |
| Skeleton       |  ☐   |       ☐       |      ☐      |                             |

## 직접 구현 vs 라이브러리 활용

| 구분      | 컴포넌트                          | 이유                                                                            |
| --------- | --------------------------------- | ------------------------------------------------------------------------------- |
| 직접 구현 | Button, Checkbox, Switch, Tabs 등 | 접근성 패턴이 명확하고, 설계 의도를 코드로 보여주기 좋음                        |
| 래핑      | Select, Dialog, Popover 등        | 포커스 트랩, 포지셔닝, 스크린리더 호환 등 엣지 케이스가 많아 검증된 구현을 사용 |

## 품질 관리

- **타입**: TypeScript strict (`noUncheckedIndexedAccess` 포함)
- **단위/인터랙션 테스트**: Vitest + Testing Library. 키보드 조작, 비활성·로딩 상태, 폼 연동을 검증합니다.
- **접근성**: axe-core 자동 검사, `eslint-plugin-jsx-a11y`, Storybook a11y 패널
- **색상 대비**: 토큰 테스트가 라이트·다크 양쪽에서 텍스트 4.5:1, 포커스 링·컨트롤 테두리 3:1(WCAG AA)을 검증합니다. jsdom은 대비를 계산할 수 없어서 컴포넌트 테스트에서는 이 규칙을 끄고 토큰 단계에서 보장합니다.
- **SSR**: 컴포넌트는 훅이나 브라우저 API를 쓰지 않고, `renderToString` 렌더링 테스트가 있습니다.
- **계획**: Playwright 시각 회귀 테스트, 번들 크기 리포트

## CI/CD (GitHub Actions)

| 워크플로                                         | 시점               | 하는 일                                                          |
| ------------------------------------------------ | ------------------ | ---------------------------------------------------------------- |
| [`ci.yml`](./.github/workflows/ci.yml)           | push, pull request | lint → 포맷 검사 → typecheck → test → build                      |
| [`pages.yml`](./.github/workflows/pages.yml)     | `main` push        | Storybook을 빌드해 GitHub Pages에 배포                           |
| [`release.yml`](./.github/workflows/release.yml) | `main` push        | changesets로 버전 PR 생성, 병합 시 npm 발행 (설정 전까지 비활성) |

문서 사이트를 처음 배포하려면 저장소 **Settings → Pages → Source**를 **GitHub Actions**로 바꿔야 합니다.

## 개발하기

```bash
# 요구사항: Node.js 20.19+ (.nvmrc는 22), pnpm (corepack enable)
pnpm install

pnpm dev          # Storybook 실행
pnpm build        # 전체 패키지 빌드
pnpm test         # 단위/인터랙션/토큰 테스트
pnpm lint         # ESLint
pnpm typecheck    # tsc --noEmit
pnpm format       # Prettier
pnpm changeset    # 변경사항 기록 (릴리스용)
```

## 저장소 구조

```
.
├─ packages/
│  ├─ tokens/        # 디자인 토큰 (JSON → CSS 변수, 대비율 테스트)
│  └─ components/    # React 컴포넌트 (Vite 라이브러리 빌드)
├─ apps/
│  └─ docs/          # Storybook 문서 사이트
├─ docs/adr/         # 설계 결정 기록
├─ .changeset/       # 릴리스 변경 기록
└─ .github/          # CI, Pages, 릴리스 워크플로
```

## 로드맵

### 1주차: 기반

- [x] pnpm workspace + Turborepo 구성
- [x] TypeScript / ESLint / Prettier, 커밋 규칙(Conventional Commits)
- [x] `tokens` 패키지 (light / dark 빌드, 대비율 테스트)
- [x] GitHub Actions CI (lint → 포맷 → typecheck → test → build)
- [x] Button, Text/Heading, Stack
- [x] Storybook + GitHub Pages 배포 워크플로
- [ ] GitHub Pages 첫 배포 확인
- [x] ADR 001~002

### 2주차: 인터랙션과 접근성

- [ ] Input/Field, Checkbox, Switch, Tabs
- [ ] Dialog, Select, Tooltip
- [ ] 컴포넌트별 키보드·axe 테스트
- [ ] 다크모드 토글 스토리 보강

### 3주차: 릴리스

- [ ] Popover, Toast, Table, Skeleton
- [ ] Playwright 시각 회귀
- [ ] 번들 크기 리포트
- [ ] changesets 첫 릴리스 `0.1.0` + npm 발행
- [ ] 문서 사이트 마무리 (시작하기, 접근성 원칙)

### 이후

- [ ] 이 디자인 시스템을 사용하는 AI 채팅 UI 데모 앱 (`apps/`)

## 설계 결정 기록 (ADR)

| #   | 제목                                                                                     | 상태   |
| --- | ---------------------------------------------------------------------------------------- | ------ |
| 001 | [토큰 3단 구조](./docs/adr/001-token-architecture.md)                                    | 채택됨 |
| 002 | [CSS Modules + `data-*` variant 방식](./docs/adr/002-css-modules-and-data-attributes.md) | 채택됨 |
| 003 | 직접 구현 vs headless 래핑 기준                                                          | 예정   |
| 004 | SSR 호환 전략 (`"use client"`, id 생성)                                                  | 예정   |

## 개발 방식에 대한 메모

이 프로젝트는 AI 도구(Claude)를 활용해 초안을 작성하고, 접근성·API 설계·SSR 호환 등 핵심 부분은 직접 검토하며 다듬어 갑니다.
리뷰에서 발견한 문제와 수정 이유는 커밋 메시지와 ADR에 기록합니다.

## 기여

이슈와 PR 환영합니다. 시작하기 전에 [CONTRIBUTING.md](./CONTRIBUTING.md)를 읽어주세요.

## 라이선스

MIT © ohseungik
