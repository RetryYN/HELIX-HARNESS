---
title: "GitHub Update lifecycle システムテスト設計"
layer: L10
artifact_type: test_design
status: draft
created: 2026-07-23
updated: 2026-07-23
owner: QA
pair_artifact: docs/design/helix/L3-requirements/github-update-lifecycle-requirements.md
---

# GitHub Update lifecycle システムテスト設計

- pair: `docs/design/helix/L3-requirements/github-update-lifecycle-requirements.md`
- status: draft
- 実行層: L10

## テスト束

| Test ID | 対応AC | 入力 | 期待結果 |
|---|---|---|---|
| GH-T-029 | GH-AC-029 | 正常future Update、label欠落、矛盾lifecycle、trace欠落、期限超過、active化、closureを個別投入する | 正常openをbacklog表示し、異常だけfinding化し、active/closed遷移をreceiptで追跡する |
| GH-T-030 | GH-AC-030 | 同じ事象をUpdate/Feature/Recovery/Incidentへ重複分類し、priorityと依存根拠を交差させる | Update identityを維持し、事象をexactly oneへ分類して、根拠のないpriority繰上げを拒否する |

## 証跡要件

各fixtureはIssue identity/type、label set、lifecycle、priority、area、trace、dependency、activation/closure receipt、観測時刻を持つ。
GitHub UI表示だけでなく、GitHub read-only観測とharness.db projectionの一致で判定する。
