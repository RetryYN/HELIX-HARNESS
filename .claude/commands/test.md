---
description: HELIX TDD discipline に従い test-first（Red → Green → Refactor）で進める
argument-hint: "<unit or behavior under test>"
judgment_core: v2
---

HELIX では test-first で実装する。`test-driven-development` skill を使い、level/fixture の選択には
`testing` も使う。oracle 強度の判断規律は `docs/skills/judgment-core.md`（判断コア SSoT）§4 に従う。
テストケースの中身（壊れ方の視点カタログ・深さ配分・止めどき）は `test-thinking` skill を使う:
書く前に「この機能はどう壊れるか」を最低 3 通り言語化し、全テストが一発で緑なら喜ばずに疑う。

Target: $ARGUMENTS

Discipline（FR-L1-02 — test-first order、implement-before-test 禁止）:

1. **Red** — L6 unit-test design（または spec の acceptance criteria）に対して failing test を書く。
   `npm test` を実行し、正しい理由で失敗することを確認する。failing test は Red evidence として commit する。
2. **Green** — pass するための最小 implementation を書く。`npm test` を実行する。
3. **Refactor** — tests green のまま clean up する。`npm run typecheck` と `npm run lint` を実行する。

Oracle strength: real behavior を assert する。complex object に `toBeTruthy()` を使わず、unit under test を
mock せず、integration path には real harness state を使う。Vitest（`npm test`）を使い、
sync timeout が flaky な `npx --no-install vitest run` は使わない。

trace-freeze 前に `npm run typecheck`、`npm run lint`、`npm test`、`helix doctor` がすべて green
であることを確認し、その後 `helix review --uncommitted` で evidence を残す。
