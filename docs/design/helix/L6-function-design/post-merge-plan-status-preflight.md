---
title: "post-merge PLAN status preflight機能設計"
layer: L6
artifact_type: design
status: draft
created: 2026-08-28
updated: 2026-08-28
owner: Codex / TL
plan: docs/plans/PLAN-RECOVERY-66-post-merge-plan-status-preflight.md
pair_artifact: docs/test-design/helix/L8-post-merge-plan-status-preflight-unit-test-design.md
github_issue_id: 1132
behavior_contract_id: POST-MERGE-PLAN-STATUS-PREFLIGHT-001
responsibility_owner: merged-plan-status
---

# post-merge PLAN status preflight機能設計

## 責務

`merged-plan-status`の既存analyzerへ渡すpublished path集合だけを、通常の公開baseまたはPR candidate HEADから
明示的に選ぶ。PR preflightはcandidate modeを指定し、branchで新規生成されたdeliverableをmerge後mainに
存在するものとして判定する。通常doctorの公開base判定は変更しない。

## DbC

- 前提: checkout済candidate HEADと完全履歴が存在する。
- 事後条件: candidate上のdraft PLANが生成する`src/`、`tests/`、`scripts/`、`.claude/` artifactはviolationになる。
- 不変条件: analyzer、terminal status、S3 PoC例外、`modifies`既存path判定をforkしない。
- 失敗: HEAD解決不能、PLAN parse不能、workflow step欠落はfail-closeする。

CLIは`helix plan lint --gate post-merge-status`を唯一のpreflight entrypointとし、workflow-local判定を作らない。
