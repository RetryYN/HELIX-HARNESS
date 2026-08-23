---
title: "distribution Lite artifact projection単体テスト設計"
layer: L8
executed_at_layer: L7
sub_doc: unit-test-design
artifact_type: test_design
status: confirmed
created: 2026-08-22
updated: 2026-08-23
owner: QA / TL
plan: docs/plans/PLAN-L7-652-distribution-lite-artifact-projection.md
pair_artifact: docs/design/helix/L6-function-design/distribution-lite-artifact-projection.md
---

# distribution Lite artifact projection単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-DISTART-001 | deterministic projection | source path入力順を反転しても昇順exact setとartifact set digestが一致する | `tests/distribution-artifact-projection.test.ts` |
| U-DISTART-002 | capability boundary | unknown、artifact 0件、excluded capability選択を個別failureで拒否する | `tests/distribution-artifact-projection.test.ts` |
| U-DISTART-003 | unsafe／duplicate path | capability間重複、absolute path、`.helix` state、credential pathを拒否する | `tests/distribution-artifact-projection.test.ts` |
| U-DISTART-003a | Windows absolute path | Linux実行でも`C:\\...`をportable absoluteとして単独拒否する | `tests/distribution-artifact-projection.test.ts` |
| U-DISTART-003b | credential filename | `token.json`、`private-key.pem`、`.env.production`を各入力単独で拒否する | `tests/distribution-artifact-projection.test.ts` |
| U-DISTART-003c | catalog全体path ownership | 非選択／excluded capabilityを含むentry間重複を単独拒否する | `tests/distribution-artifact-projection.test.ts` |
| U-DISTART-004 | catalog／source boundary | schema不正とsource tree欠落を別failureで拒否する | `tests/distribution-artifact-projection.test.ts` |
| U-DISTART-005 | freeze digest伝播 | projection設計を登録したdesign catalog実digestがG3 freeze packetとreviewed digestへ一致する | `tests/l3-g3-freeze-packet-v2.test.ts` |
| U-DISTART-006 | current catalog接合 | `consumer_core_v1`の11 allowlist全件が実在source pathへ解決し、10 exclusionを選択しない | `tests/distribution-artifact-projection.test.ts` |

文字列存在だけを合格条件にせず、pure projectionの戻り値、exact failure code、artifact set digestを実測する。
