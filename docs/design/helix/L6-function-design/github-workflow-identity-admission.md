---
title: "GitHub typed workflow identity admission機能設計"
layer: L6
artifact_type: design
status: confirmed
created: 2026-08-16
updated: 2026-08-16
owner: Codex / TL
plan: docs/plans/PLAN-L7-574-github-workflow-identity-admission.md
pair_artifact: docs/test-design/helix/L8-github-workflow-identity-admission-unit-test-design.md
---

# GitHub typed workflow identity admission機能設計

## Authority

要件正本`github-merge-admission-requirements.md`のGH-FR-020／GH-AC-018と、versioned workflow分類registryを
上位authorityとする。Issue／PRのprose、label、旧`mode`／`model`、旧15-route inventoryからidentityを推測しない。

## 責務

PRで変更されたtyped PLANを通常は一件だけ選び、その`github_issue_id`で指定されたIssueをGitHub APIから取得する。
Issue、PR、PLAN、requirements registryの`registry_version`、`registry_source_digest`、`target_axis`、
`target_id`がexact一致した場合だけadmissionを通す。typed identityを持たないlegacy PLANだけは明示的な非適用とする。

requirements registry version-upに限り、PR本文のmigration bundle contractを追加authorityとして読む。bundleは
sorted uniqueな全changed PLAN path、exactly oneの`VERSION_UP` owner、canonical registryとgenerated catalogの
同時変更、全PLANの同一current version／digestとcatalog存在性を要求する。通常PRの複数PLAN拒否は維持する。

## Contract

- `U-GWIDADM-001`: PLANの`github_issue_id`だけをIssue authorityにし、Issue／PR／PLAN tupleのexact一致を受理する。
- `U-GWIDADM-002`: typed PLANがないlegacy sliceは非適用とし、GitHub APIを呼ばない。
- `U-GWIDADM-003`: 複数typed PLANをatomic slice違反として拒否する。
- `U-GWIDADM-004`: IssueとPRのmissing／legacy／invalid contractをschema由来の別reasonでfail-closeする。
- `U-GWIDADM-005`: Issue／PRが一致してもPLAN tupleが異なる場合は拒否する。
- `U-GWIDADM-006`: PLAN read、GitHub API、classification authority loadの失敗を例外透過せず別reasonで閉じ、API失敗とinvalid Issue responseも分離する。
- `U-GWIDADM-007`: required `harness-check`のPR context snapshot内でadmission CLIを実行する。
- `U-GWIDADM-008`: L6/L8 pairをdesign catalogとG3 freeze digestへ伝播する。
- `U-GWIDADM-009`: `github_issue_id`がPR resourceまたは別番号へ解決された場合はIssue authorityとして拒否する。
- `U-GWIDADM-010`: PLAN identityのschema version、version／digest／ID形式、余剰legacy fieldをstrict拒否する。
- `U-GWIDADM-011`: requirements registry migrationのstrict bundleだけを複数typed PLANとして受理する。
- `U-GWIDADM-012`: manifest／owner／authority pathの不一致を専用reasonで拒否する。
- `U-GWIDADM-013`: bundle内の旧digest混在と未知identityを拒否する。
- `U-GWIDADM-014`: non-typed PLAN、marker構文、owner、stale version、authority片側欠落を拒否する。

## 境界

本sliceはGitHub admissionへの配線までを所有する。DB projection、execution episode、right-arm evidence、terminal
dispositionは#205の後続sliceへ渡す。canonical failureをlegacy greenで相殺しない。
