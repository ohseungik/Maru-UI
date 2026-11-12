# 시각 회귀 테스트

스타일을 바꾸면 눈에 띄지 않는 곳이 깨지기 쉽습니다. 이 프로젝트는 Playwright로 Storybook을 캡처해 **기준 이미지와 픽셀 단위로 비교**합니다.
단위 테스트와 axe가 잡지 못하는 것(잘린 포커스 링, 다크 모드의 잘못된 색, 고대비 모드에서 사라지는 테두리)을 잡는 것이 목적입니다.

## 무엇을 비교하나

| 스펙                                                               | 대상                                                           | 변형                                    |
| ------------------------------------------------------------------ | -------------------------------------------------------------- | --------------------------------------- |
| [`stories.spec.ts`](../apps/docs/visual/stories.spec.ts)           | 모든 스토리 (`index.json`에서 읽음)                            | 라이트, 다크                            |
| [`interactions.spec.ts`](../apps/docs/visual/interactions.spec.ts) | 열린 Dialog, Tooltip, 입력 컨트롤의 키보드 포커스, Tabs 방향키 | 라이트, 다크, **고대비(forced colors)** |

스토리가 추가되면 자동으로 대상이 됩니다. 비교에서 빼려면 스토리에 `no-visual` 태그를 붙입니다.
상호작용 스펙은 실제로 한 번 깨졌던 상태를 고정한 것입니다. 예를 들어 `dialog-form-focus`는 스크롤 영역이 포커스 링을 잘라 먹던 문제를 막습니다.

## 기준 이미지는 CI에서 만듭니다

폰트와 안티앨리어싱이 운영체제마다 달라서, 내 컴퓨터(Windows, macOS)에서 만든 이미지는 CI와 항상 조금씩 다릅니다.
그래서 기준 이미지는 **GitHub Actions의 Linux에서만** 만들고, 저장소의 `apps/docs/visual/*-snapshots/`에 커밋합니다.

1. 처음 한 번, 또는 의도한 스타일 변경 뒤: Actions 탭 → **Update visual baselines** → 해당 브랜치에서 `Run workflow`.
   워크플로가 Storybook을 빌드하고 스크린샷을 다시 만든 뒤 `test(visual): update baselines`로 커밋합니다.
2. 이후 모든 pull request에서 **Visual regression** 워크플로가 같은 스크린샷을 만들어 비교합니다.
3. 기준 이미지가 아직 없으면 비교 단계는 건너뛰고 알림만 남깁니다. 실패하지 않습니다.

> 기준 이미지를 커밋하는 푸시는 `GITHUB_TOKEN`으로 이루어져서 다른 워크플로(CI 등)를 자동으로 다시 실행하지 않습니다. 필요하면 빈 커밋을 하나 더 푸시하세요.

## 실패했을 때

1. 실패한 워크플로의 **Artifacts → visual-report**를 내려받아 `playwright-report/index.html`을 엽니다. 실패마다 기준(expected), 실제(actual), 차이(diff) 이미지가 있습니다.
2. 의도한 변경이면 **Update visual baselines**를 그 브랜치에서 실행하고, 커밋된 이미지가 맞는지 pull request에서 눈으로 확인합니다.
3. 의도하지 않은 변경이면 코드를 고칩니다.

## 로컬에서 실행하기

Linux(또는 WSL, Docker)에서만 의미가 있습니다. 다른 운영체제에서는 기준 이미지 이름(`-linux`)이 달라서 비교 대상이 없습니다.

```bash
pnpm build                       # Storybook 정적 빌드
pnpm --filter @ohseungik/maru-docs exec playwright install chromium
pnpm test:visual                 # 비교
pnpm --filter @ohseungik/maru-docs test:visual:update   # 기준 이미지 다시 만들기
```

## 흔들리지 않게 하는 장치

- 애니메이션과 전환을 끄고(`animations: 'disabled'`, `reducedMotion: 'reduce'`), 입력 커서를 숨깁니다.
- 테마가 적용되고 폰트가 로드될 때까지 기다린 뒤 캡처합니다.
- `@playwright/test`를 **정확한 버전으로 고정**합니다. 브라우저 버전이 바뀌면 모든 이미지가 달라지기 때문입니다. 버전을 올릴 때는 기준 이미지를 함께 다시 만듭니다. (Dependabot은 이 패키지를 건너뜁니다.)
- 서브픽셀 수준의 안티앨리어싱 차이만 허용합니다(`maxDiffPixels: 24`). 포커스 링이 잘리는 정도의 작은 변화도 잡도록 일부러 빡빡하게 잡았습니다.

## 한계

- Chromium 하나만 비교합니다. Firefox와 Safari의 렌더링 차이는 잡지 못합니다.
- 열린 Select 목록처럼 브라우저가 직접 그리는 UI는 캡처되지 않습니다.
- 이미지가 늘면 저장소 크기도 늘어납니다. 기준 이미지를 다시 만들 때마다 변경된 PNG만 커밋됩니다.
