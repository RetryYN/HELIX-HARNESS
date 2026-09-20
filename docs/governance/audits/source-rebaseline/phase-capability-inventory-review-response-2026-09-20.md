# HELIX全フェーズ Capability Inventory review対応記録

status: round_1_addressed
authority_effect: none
pr: 1909
review_request: `RH-1909-01`
reviewed_content_sha: `3ecda373c3c4b5688dcfa97a03199e54f9c32ae0`
review_result: incomplete
findings: Blocker 0 / Major 0 / Minor 3 / Info 0

## Minor m1 — 状態語彙の不一致

`status_vocabulary`を実際のrecordから独立した部分例として置くのをやめ、`current_status`、
`legacy_capability_status`、`transition_assessment`の三軸について使用値のexact setを列挙した。
静的検査では各配列を20 recordから再計算し、集合一致を確認する。

## Minor m2 — new build gateの射程

`new_build_gate_scope`を追加し、`new_build_allowed: false`でも継続できる作業を
inventory research、consumer closure、要求分類、要求判断準備、inventory更新とした。
停止対象は新しい設計artifact、Scaffold、実装である。Markdownの判定規則と共通完了条件も同じ境界へ揃えた。

## Minor m3 — PR classと規範変更の混載

AGENTS.md、CLAUDE.md、`new-generation-start-here.md`への規範変更を本PRから除外した。
本PRはCapability InventoryとGitHub projection receiptだけを扱う`research_premise`に限定する。
全作業へ適用する照会規則が必要なら、inventoryのreview後に別の`repository_foundation` PRとして扱う。

## 再確認

- JSON parse成功。
- 20 taskのID exact set、製品語彙、current ref、legacy asset ID／pathを確認。
- 三つの状態語彙がrecordで使う値の集合と一致。
- `new_build_gate_scope`のallowed／blocked集合を確認。
- `git diff --check`成功。
- `scfctl validate`: `bindings=3 fail=0`。
- `scfctl stale`: `stale=0`。
- `scfctl residuals`: `residuals=0`。

旧CI、旧runtime、旧testは実行していない。本記録は要求採否、設計freeze、実装許可を生成しない。
