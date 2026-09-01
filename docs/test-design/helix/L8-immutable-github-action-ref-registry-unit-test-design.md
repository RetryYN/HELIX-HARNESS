---
title: "immutable GitHub Action ref registry単体テスト設計"
layer: L8
kind: recovery
status: draft
created: 2026-09-01
updated: 2026-09-01
owner: QA / Security
parent_design: docs/design/helix/L6-function-design/immutable-github-action-ref-registry.md
pair_artifact: docs/design/helix/L6-function-design/immutable-github-action-ref-registry.md
---

# immutable GitHub Action ref registry単体テスト設計

| Oracle | 正常系 | 反例 |
|---|---|---|
| U-IAR-001 | registry内のfull SHA `uses:`を受理 | tag、branch、short SHA、SHAなしを拒否 |
| U-IAR-002 | action／SHA exact一致 | unknown action、wrong SHA、重複entryを拒否 |
| U-IAR-003 | workflow／template／setup生成物が同一registryへ収束 | surfaceごとの旧tag greenで相殺しない |
| U-IAR-004 | setup-node v7 exact SHAとNode 24.15を同時受理 | v4、wrong Node、registry metadata driftを拒否 |

mutationではfull SHAをtagへ戻す、registry SHAを一桁変更する、unknown actionを追加する、setup生成物だけ旧tagへ戻す操作を別々にkillする。
