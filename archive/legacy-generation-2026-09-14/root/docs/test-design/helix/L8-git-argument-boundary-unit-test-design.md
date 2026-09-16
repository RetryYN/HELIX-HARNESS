---
title: "Git引数境界単体テスト設計"
layer: L8
artifact_type: test_design
sub_doc: unit-test-design
status: confirmed
created: 2026-09-02
updated: 2026-09-02
owner: Codex / QA
plan: docs/plans/PLAN-RECOVERY-85-git-argument-boundary.md
parent_design: docs/design/helix/L6-function-design/git-argument-boundary.md
pair_artifact: docs/design/helix/L6-function-design/git-argument-boundary.md
behavior_contract_id: GIT-ARGUMENT-BOUNDARY-001
responsibility_owner: git-argument-boundary
---

# Git引数境界単体テスト設計

## Oracle

- 正規HTTPS／SSH／SCP形式remoteを受理する。
- `ext::`、option形、file scheme、credential、query付きremoteをprocess起動前に拒否する。
- 正規revisionと二点rangeを受理し、`--output`、空右辺、reflog式、空値を拒否する。
- marker fileを用い、悪性remote／rangeで副作用が発生しないことを実測する。
- quality auditのmutationが未境界の`range`直結を検出する。

## 回帰境界

version-up dry-runのremote tag検出とcommitlintの正常rangeを維持する。
