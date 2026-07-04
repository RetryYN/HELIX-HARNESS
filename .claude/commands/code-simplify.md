---
description: regression fence の下で behavior-invariant refactor / simplification を行う
argument-hint: "[optional file/scope]"
---

UT-TDD では behavior を変えずに simplify / refactor する。`refactoring` skill を使う。

Target: $ARGUMENTS

これは `kind=refactor` activity（FR-L1-25）である。behavior は invariant として保持し、
judgement ではなく regression で検証する。

1. **Fence** — target の observable behavior を守る test net が存在することを確認する。
   coverage が薄い場合、structural change の前に characterization tests を先に追加する（Green）。
2. **One structural change per commit** — extract、rename、inline、dedupe は分離して行う。
   refactor と feature change / bug fix を混ぜない。
3. **Verify after each step** — `bun run typecheck`、`bun run lint`、`bun run test` がすべて green、
   かつ `ut-tdd doctor` が exit 0 であることを確認する。
4. **No new behavior, no new tests of new behavior** — refactor step 中に新しい behavior を追加せず、
   新しい behavior の test も追加しない。既存 net は変更なく green を維持する。

refactor が影響する design doc（dependency map / module boundaries）を更新し、accept 前に
`ut-tdd review --uncommitted` で evidence を残す。
