---
description: 実装前に spec-first design を作成する（spec → test design → impl）
argument-hint: "<feature description>"
---

HELIX では、code より先に spec/design を書く。`spec-driven-development` と
`documentation-and-adrs` skill を使う。

Target: $ARGUMENTS

正しい V-model layer の `docs/design/` 配下に design doc を作る。内容には Objective/TL;DR、
Scope/Non-goals、Prerequisites（upstream layer docs、PLAN/ADR IDs）、unit-test-design 粒度の設計、
acceptance/verification criteria を含める。新しい用語は L0 glossary に入れる。

spec は V-model で pair される。L5/L6 design section は L6/L8 test design と 1:1 に対応する。
test case や code は design doc に埋め込まない。これらは reference で接続する別 artifact である。

Freeze readiness: pair-freeze 前に readability check（Objective あり、半角 kana / U+FFFD なし）、
`helix plan lint`、`helix doctor`（exit 0）を実行する。implementation は spec と paired test
design が frozen になった後だけ進める。
