# 릴리스 가이드

Maru UI는 [changesets](https://github.com/changesets/changesets)로 버전과 CHANGELOG를 관리하고, GitHub Actions가 npm에 발행합니다.

발행하는 패키지는 두 개이고, 항상 **같은 버전**으로 함께 올라갑니다(`.changeset/config.json`의 `fixed`). 컴포넌트가 토큰의 CSS 변수에 의존하기 때문에, 짝이 맞지 않는 조합이 생기지 않게 하려는 선택입니다.

- `@ohseungik/maru-tokens`
- `@ohseungik/maru-ui`

`@ohseungik/maru-docs`(Storybook)는 발행하지 않으므로 changeset 대상에서 제외되어 있습니다.

## 전체 흐름

```text
PR + changeset ─▶ main 병합 ─▶ "chore: version packages" PR 자동 생성
                                         │ (버전, CHANGELOG 갱신)
                                         ▼
                        PR 병합 ─▶ 빌드, 발행물 검사 ─▶ npm 발행 + git 태그 + GitHub Release
```

## 처음 한 번만: 준비

### 1. npm 계정과 패키지 이름

- npm 계정에 **2단계 인증(2FA)**을 켭니다.
- `@ohseungik`는 **scope**입니다. 이 scope는 npm 사용자 이름(또는 조직 이름)과 같아야 발행할 수 있습니다. npm 사용자 이름이 다르다면 조직을 만들거나 패키지 이름을 바꿔야 합니다.
- 이름이 비어 있는지 확인합니다. `E404`가 나오면 아직 아무도 쓰지 않은 이름입니다.

```bash
npm view @ohseungik/maru-ui
npm view @ohseungik/maru-tokens
```

### 2. npm 토큰

npm 웹사이트의 Access Tokens에서 **Granular Access Token**을 만듭니다.

- 권한: `Read and write`
- 범위: `@ohseungik` scope의 패키지
- CI에서는 2FA 코드를 입력할 수 없으므로, 토큰 설정에서 2FA를 우회하는 옵션을 켜야 합니다.
- 토큰에는 만료일이 있으니 날짜를 적어 두고, 만료 전에 새로 만들어 교체하세요.

토큰 화면의 항목 이름은 npm이 바꿀 수 있으므로, 화면의 안내를 우선하세요.

### 3. GitHub 설정

| 위치                                                       | 설정                                                                           |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Settings → Secrets and variables → Actions → **Secrets**   | `NPM_TOKEN` = 위에서 만든 토큰                                                 |
| Settings → Secrets and variables → Actions → **Variables** | `NPM_RELEASE_ENABLED` = `true`                                                 |
| Settings → Actions → General → Workflow permissions        | "Allow GitHub Actions to create and approve pull requests" 체크                |
| Settings → Branches (`main`에 보호 규칙이 있다면)          | 릴리스 PR은 Actions가 만들므로, 필요한 검사가 통과하면 병합할 수 있어야 합니다 |

발행 때 npm **provenance**(어느 저장소의 어느 커밋에서 빌드됐는지 증명하는 서명)가 함께 붙습니다. 저장소가 public이어야 하고, 워크플로의 `id-token: write` 권한이 이미 설정되어 있습니다.

## 릴리스 전 점검

로컬에서 먼저 확인합니다. CI도 같은 검사를 합니다.

```bash
pnpm install
pnpm lint && pnpm typecheck && pnpm test
pnpm build
pnpm size          # 번들 크기 예산
pnpm verify:pack   # 발행물에 들어가는 파일 검사
```

`pnpm verify:pack`은 실제로 발행하지 않고 각 패키지의 tarball에 무엇이 들어가는지만 검사합니다.

- `README.md`, `LICENSE`, `package.json`이 있는지
- `exports`가 가리키는 파일(`dist/index.js`, `dist/index.d.ts`, CSS)이 모두 들어 있는지
- `dist/` 밖의 파일(소스, 테스트, 스토리)이 섞이지 않았는지
- 용량이 한도(200 kB)를 넘지 않는지

## 첫 릴리스 (`0.1.0`)

`.changeset/first-release.md`가 두 패키지의 `minor` 변경을 기록하고 있어서, 버전이 `0.0.0` → `0.1.0`이 됩니다.

1. 변경을 `main`에 push합니다. (또는 PR로 병합합니다.)
2. Actions 탭에서 **Release** 워크플로가 실행되고, `chore: version packages` PR이 열립니다.
3. PR의 변경 내용을 확인합니다.
   - 두 패키지의 `version`이 `0.1.0`인지
   - 각 패키지의 `CHANGELOG.md`가 생겼는지
   - `.changeset/first-release.md`가 삭제됐는지
4. PR을 병합합니다.
5. Release 워크플로가 한 번 더 실행되어 빌드, 발행물 검사, npm 발행, git 태그(`@ohseungik/maru-ui@0.1.0`), GitHub Release 생성까지 진행합니다.

### 발행 후 확인

```bash
npm view @ohseungik/maru-ui version        # 0.1.0
npm view @ohseungik/maru-tokens version    # 0.1.0
```

npm 패키지 페이지에 **Provenance** 표시가 있는지도 확인하세요.

**새 프로젝트에서 설치해 보는 것이 가장 확실합니다.**

```bash
npm create vite@latest maru-smoke -- --template react-ts
cd maru-smoke
npm install @ohseungik/maru-ui @ohseungik/maru-tokens
```

`src/main.tsx` 맨 위에 스타일을 불러오고, `App.tsx`에서 `Button`을 렌더링해 보세요.

```ts
import '@ohseungik/maru-tokens/css';
import '@ohseungik/maru-ui/styles.css';
```

`npm run build`까지 성공하면 타입, ESM, CSS 경로가 모두 정상입니다.

### 발행 후 문서 정리

- README의 npm 배지 주석을 해제합니다.
- README 로드맵에서 "changesets 첫 릴리스"를 체크합니다.
- GitHub 저장소 About의 Website에 문서 사이트를 넣고, Topics에 `design-system`, `react`, `accessibility`를 추가합니다.

## 이후 릴리스

변경이 있는 PR마다 changeset을 포함합니다.

```bash
pnpm changeset
```

버전 규칙은 `1.0` 이전까지 아래를 따릅니다.

| 변경                                           | 올리는 단위 |
| ---------------------------------------------- | ----------- |
| 호환성이 깨지는 변경 (prop 이름, 동작, 토큰명) | `minor`     |
| 새 컴포넌트, 새 prop, 버그 수정                | `patch`     |

`1.0.0`은 공개 API와 토큰 이름을 더 바꾸지 않겠다고 약속할 수 있을 때 올립니다.

두 패키지가 같은 버전으로 움직이므로, 하나만 바뀌어도 둘 다 새 버전으로 발행됩니다.

## 문제 해결

| 증상                                               | 확인할 것                                                                            |
| -------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Release 워크플로가 아예 실행되지 않음              | Variable `NPM_RELEASE_ENABLED`가 `true`인지                                          |
| "version packages" PR이 안 열림                    | Actions가 PR을 만들 수 있게 허용했는지, 대기 중인 changeset이 있는지                 |
| 발행 단계에서 `E403` 또는 `E404`                   | 토큰 권한과 범위, scope와 npm 사용자 이름이 같은지                                   |
| `E401`                                             | `NPM_TOKEN` Secret 이름 오타, 토큰 만료                                              |
| `You cannot publish over the previously published` | 이미 발행된 버전입니다. changeset을 추가해 새 버전을 만드세요                        |
| provenance 오류                                    | 저장소가 public인지, 워크플로 권한에 `id-token: write`가 있는지                      |
| `pnpm verify:pack` 실패                            | 메시지에 나온 파일이 `dist`에 있는지. `pnpm build`를 먼저 실행했는지                 |
| CI의 `pnpm install --frozen-lockfile` 실패         | `package.json`을 바꿨다면 `pnpm install`로 `pnpm-lock.yaml`을 갱신해 함께 커밋했는지 |

## 자동화를 쓰지 않고 직접 발행하기

워크플로를 켜기 전이거나 문제가 생겼을 때의 대안입니다.

```bash
pnpm changeset version    # 버전과 CHANGELOG 갱신
git add -A && git commit -m "chore: version packages"
npm login
pnpm release              # 빌드, 발행물 검사, 발행
git push --follow-tags
```

직접 발행한 버전에는 provenance가 붙지 않습니다.
