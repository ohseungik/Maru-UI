# ADR-004: SSR과 React Server Components에서 안전하게 쓰는 전략

- 상태: 채택됨
- 날짜: 2026-11-11

## 배경

Next.js 같은 프레임워크에서는 컴포넌트가 서버에서 먼저 렌더링되고, 브라우저에서 같은 결과로 hydrate 되어야 합니다.
디자인 시스템이 이를 어기면 소비하는 앱에서 hydration 경고, 깜빡임, 또는 빌드 오류가 납니다. 흔한 원인은 세 가지입니다.

- 렌더 중에 `window`/`document`를 읽거나, 서버와 클라이언트에서 다른 값을 만드는 id
- 서버와 클라이언트의 첫 렌더가 다른 DOM 구조
- React Server Components에서 훅과 이벤트 핸들러가 있는 컴포넌트를 import 하는 경우

## 결정

1. **렌더 중 브라우저 API를 쓰지 않습니다.** `window`, `document`, `matchMedia` 등은 이펙트와 이벤트 핸들러 안에서만 읽습니다.
   유일한 모듈 최상단 검사는 Tooltip의 `typeof document === 'undefined'`이고, 서버에서 `useLayoutEffect` 경고가 나지 않도록 `useEffect`로 대체하는 데만 씁니다.
2. **id는 `useId`로만 만듭니다.** `Field`, `Tabs`, `Dialog`, `Tooltip`이 `htmlFor`, `aria-labelledby`, `aria-describedby`로 연결할 id를 이렇게 만듭니다. 카운터나 난수는 쓰지 않습니다.
3. **첫 렌더는 항상 "닫힌/기본" 상태입니다.** 닫힌 Dialog는 아무것도 렌더링하지 않고(`keepMounted`이면 닫힌 `<dialog>`), Tooltip은 닫힌 상태의 요소와 연결된 `aria-describedby`를 렌더링합니다. 열림 여부는 이펙트 이후에만 바뀝니다.
4. **빌드 결과물 맨 위에 `"use client"`를 넣습니다.** 소비하는 앱은 Server Component에서도 라이브러리를 바로 import 할 수 있습니다. 번들러는 소스 파일의 모듈 수준 지시어를 지우기 때문에, 소스가 아니라 Vite 빌드의 `output.banner`로 넣고, `pnpm build` 끝에서 `scripts/verify-build.mjs`가 첫 줄에 있는지(그리고 peer 의존성이 아닌 import가 없는지) 검사합니다.
5. **테마는 CSS로만 결정합니다.** 서버에서도 `prefers-color-scheme`이 적용되고, `data-theme`는 소비하는 앱이 `<html>`에 서버에서 지정하면 깜빡임이 없습니다. 라이브러리는 자바스크립트로 테마를 바꾸지 않습니다.

## 검토한 대안

- **파일마다 `"use client"`**: 의미상 가장 정확하지만 번들링 과정에서 지시어가 제거되므로, 파일별로 출력하는 빌드가 필요합니다. 컴포넌트 수가 적은 지금은 비용이 더 큽니다.
- **지시어 없이 소비하는 쪽이 `"use client"` 래퍼를 직접 만들기**: 라이브러리는 단순해지지만, 모든 사용자가 같은 우회 코드를 만들어야 합니다.
- **서버에서 쓸 수 있는 컴포넌트(Text, Heading, Stack)를 별도 엔트리로 분리**: 클라이언트 번들 크기를 줄일 수 있습니다. 번들 크기 리포트에서 필요성이 확인되면 도입합니다.

## 결과

- 소비하는 앱은 Next.js App Router의 Server Component에서 `import { Button } from '@ohseungik/maru-ui'`를 바로 쓸 수 있도록 하는 것이 목표입니다.
- `renderToString` 테스트(`src/ssr.test.tsx`)가 `Field`/`Input`, `Checkbox`/`Switch`, `Tabs`, `Dialog`, `Tooltip`의 서버 출력에서 id 연결과 초기 상태를 확인합니다.

## 한계 (아직 검증하지 못한 것)

- 모든 컴포넌트가 하나의 클라이언트 경계 안에 있으므로, 서버에서 쓸 수 있는 Text, Heading, Stack도 클라이언트 번들에 포함됩니다. 렌더링 결과는 서버에서 만들어지지만 JavaScript 비용은 있습니다.
- 실제 Next.js 앱에서 hydration과 Server Component import를 확인한 적은 없습니다. 지금 검증은 `renderToString` 출력과 빌드 산출물 검사까지입니다. 데모 앱(로드맵)이 생기면 그 앱으로 확인합니다.
- `peerDependencies`는 `react >=18`이지만, 테스트는 React 19로만 실행합니다. React 18에서의 동작은 보장하지 않습니다.
