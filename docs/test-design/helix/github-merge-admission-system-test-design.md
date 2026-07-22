---
title: "GitHub merge admission システムテスト設計"
layer: L10
artifact_type: test_design
status: draft
created: 2026-07-23
updated: 2026-07-23
owner: QA
pair_artifact: docs/design/helix/L3-requirements/github-merge-admission-requirements.md
---

# GitHub merge admission システムテスト設計

- pair: `docs/design/helix/L3-requirements/github-merge-admission-requirements.md`
- status: draft
- 実行層: L10

## テスト束

| Test ID | 対応AC | 入力 | 期待結果 |
|---|---|---|---|
| GH-T-014 | GH-AC-014 | CI greenの同一diffへ、文脈入力欠落、AI-Aと同一identity/session、別HEADのreview receiptを個別投入する | 必須文脈を全て読んだAI-Bのcurrent HEAD receipt以外はmerge不可 |
| GH-T-015 | GH-AC-015 | current HEADから隔離DBを再構築し、event片肺、projection drift、checkpoint stale、schema不一致、orphan、旧receiptを個別投入する | source HEAD・event・projection・checkpoint・schemaが一致しstale/orphan 0の場合だけ受理する |
| GH-T-016 | GH-AC-016 | PR前内部CI、修正後クロスレビュー、内部CI、GitHub Actions、DB追従を一つずつ欠落または別HEAD化する | 全receiptが同じ修正HEADへ収束するまでmerge不可 |

## 証跡要件

文脈レビューは入力path/digest集合とreviewer identity/runtime/model/provider/sessionを保存する。DB追従検証はsource HEAD、
event head、projection/checkpoint digest、schema revision、stale/orphan件数、隔離rebuild結果を保存する。各実行はcommand、
exit code、output digest、HEAD、GitHub observation timestampを持ち、画面キャプチャ単体を合格根拠にしない。
