# Changesets

사용자에게 영향이 있는 변경(기능, 버그 수정, 호환성 깨짐)을 만들었다면 PR에 changeset을 포함해 주세요.

```bash
pnpm changeset
```

패키지와 버전 범위(patch / minor / major), 변경 요약을 입력하면 이 폴더에 마크다운 파일이 생성됩니다.
`main`에 병합되면 릴리스 워크플로가 이 파일들을 모아 버전과 CHANGELOG를 갱신하는 PR을 엽니다.

자세한 내용은 [changesets 문서](https://github.com/changesets/changesets)를 참고하세요.
