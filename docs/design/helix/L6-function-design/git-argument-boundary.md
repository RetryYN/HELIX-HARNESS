---
title: "Git引数境界関数設計"
layer: L6
artifact_type: design_doc
status: confirmed
created: 2026-09-02
updated: 2026-09-02
owner: Codex / TL
plan: docs/plans/PLAN-RECOVERY-85-git-argument-boundary.md
pair_artifact: docs/test-design/helix/L8-git-argument-boundary-unit-test-design.md
behavior_contract_id: GIT-ARGUMENT-BOUNDARY-001
responsibility_owner: git-argument-boundary
---

# Git引数境界関数設計

## 責務

外部入力をGit processへ渡す前に、remote identityとrevision rangeを別々のtyped境界で検証する。

## 契約

- remoteは`https://`、`ssh://`、`git@host:path`だけを許可する。
- 大小文字を問わずtransport helperを拒否し、option形、HTTPS埋込credential、query、fragment、制御文字を拒否する。
- revisionは単一atomまたは`..`／`...`で結んだ二点rangeだけを許可する。
- `git log`はpathspec終端`--`を付ける。
- `git ls-remote`はremote option終端`--`を付け、検証を主防御とする。
- quality auditはGit／GitHub processへ未境界の入力名を直結する退行をfail-closeする。

## 非対象

checkout pathspec分類、hosted runner preflight、runner attestationは変更しない。
