---
plan_id: PLAN-RECOVERY-1591-compatibility-parent-trace
title: "PLAN-RECOVERY-1591: compatibility-only parent trace遮断の第一slice"
kind: recovery
layer: cross
drive: agent
status: draft
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals: ["po_directive:Issue #1591 compatibility-only parent traceの第一slice"]
created: 2026-09-10
updated: 2026-09-10
owner: Codex / TL
github_issue_id: 1591
behavior_contract_id: PLAN-COMPATIBILITY-PARENT-1591-S1
responsibility_owner: legacy-authority-migration
parent_design: docs/design/helix/L5-detail/plan-compatibility-parent-trace.md
pair_artifact: docs/test-design/helix/L8-plan-compatibility-parent-trace.md
verification_bindings:
  - { parent_design: docs/design/helix/L5-detail/plan-compatibility-parent-trace.md, oracle_id: U-CPP-001, test_path: tests/plan-compatibility-parent.test.ts }
  - { parent_design: docs/design/helix/L5-detail/plan-compatibility-parent-trace.md, oracle_id: U-CPP-002, test_path: tests/plan-compatibility-parent.test.ts }
  - { parent_design: docs/design/helix/L5-detail/plan-compatibility-parent-trace.md, oracle_id: U-CPP-003, test_path: tests/plan-compatibility-parent.test.ts }
  - { parent_design: docs/design/helix/L5-detail/plan-compatibility-parent-trace.md, oracle_id: U-CPP-004, test_path: tests/plan-compatibility-parent.test.ts }
  - { parent_design: docs/design/helix/L5-detail/plan-compatibility-parent-trace.md, oracle_id: U-CPP-005, test_path: tests/plan-compatibility-parent.test.ts }
  - { parent_design: docs/design/helix/L5-detail/plan-compatibility-parent-trace.md, oracle_id: U-CPP-006, test_path: tests/plan-compatibility-parent.test.ts }
  - { parent_design: docs/design/helix/L5-detail/plan-compatibility-parent-trace.md, oracle_id: U-CPP-007, test_path: tests/plan-compatibility-parent.test.ts }
  - { parent_design: docs/design/helix/L5-detail/plan-compatibility-parent-trace.md, oracle_id: U-CPP-008, test_path: tests/plan-compatibility-parent.test.ts }
  - { parent_design: docs/design/helix/L5-detail/plan-compatibility-parent-trace.md, oracle_id: U-CPP-009, test_path: tests/plan-compatibility-parent.test.ts }
  - { parent_design: docs/design/helix/L5-detail/plan-compatibility-parent-trace.md, oracle_id: U-CPP-010, test_path: tests/plan-compatibility-parent.test.ts }
  - { parent_design: docs/design/helix/L5-detail/plan-compatibility-parent-trace.md, oracle_id: U-CPP-011, test_path: tests/plan-compatibility-parent.test.ts }
  - { parent_design: docs/design/helix/L5-detail/plan-compatibility-parent-trace.md, oracle_id: U-CPP-012, test_path: tests/plan-compatibility-parent.test.ts }
  - { parent_design: docs/design/helix/L5-detail/plan-compatibility-parent-trace.md, oracle_id: U-CPP-013, test_path: tests/plan-compatibility-parent.test.ts }
  - { parent_design: docs/design/helix/L5-detail/plan-compatibility-parent-trace.md, oracle_id: U-CPP-014, test_path: tests/plan-compatibility-parent.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — Recovery実装と検証" }
  - { role: se, slot_label: "SE — schemaとauthority判定" }
  - { role: qa, slot_label: "QA — 反例とmutation oracle" }
  - { role: tl, slot_label: "TL — 正本境界と残義務" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-1591-compatibility-parent-trace.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L5-detail/plan-compatibility-parent-trace.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-plan-compatibility-parent-trace.md, artifact_type: test_design }
  - { artifact_path: src/lint/plan-compatibility-parent.ts, artifact_type: source_module }
  - { artifact_path: tests/plan-compatibility-parent.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: src/schema/frontmatter.ts, artifact_type: source_module }
  - { artifact_path: src/plan/lint.ts, artifact_type: source_module }
  - { artifact_path: docs/plans/PLAN-L3-36-atomic-development-contract.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-L3-52-github-security-admission.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-L3-70-windows-lite-canary-admission.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-L4-58-impact-ci-recovery.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-L6-81-drive-route-catalog.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-L7-462-issue-closure-contract.md, artifact_type: markdown_doc }
dependencies:
  parent: docs/design/helix/L6-function-design/typed-plan-workflow-identity.md
  requires: [docs/design/helix/L3-requirements/github-autonomous-operations-requirements.md]
  references: [issue:1591]
  blocks: []
---

# compatibility-only parent trace遮断

## §3 工程表

### Step 1: [直列] inventoryと設計

直列理由: downstream_dependency
Issue本文、951件inventory、schema／lint、6 PLANを読み、上流要件・型付き来歴契約と対案を固定する。

### Step 2: [直列] Red→Greenと実consumer移行

直列理由: downstream_dependency
parent mutationのREDを先に実測し、正規lint／doctorへ接続して6件を現行要件と来歴へ移す。

### Step 3: [直列] 検証と独立review

直列理由: downstream_dependency
targeted test、typecheck、PLAN lint、mutation結果を記録する。独立reviewは受入側の残義務とし、
自己承認・Ready化・mergeを行わない。Draft PRはRefs #1591のみとする。

## §3.1 実装計画

`src/schema/frontmatter.ts`、`src/lint/plan-compatibility-parent.ts`、`src/plan/lint.ts`を修正する。
inventory件数・digest、旧PLANの承認やstatus、実行用worker-contextは変更しない。

## 受入条件

設計／test-designのU-CPP-001..014を同sliceで照合する。current parent RED、typed history GREEN、
untyped／authority混同REDを必須とし、全体consumer 0・DB replay・独立reviewが揃うまで終端を主張しない。

## 残義務

6件以外のcurrent consumer除去、全体lint／doctor、DB projection／replay、全回帰、
main read-after consumer 0、独立AI-B reviewは後続の受入義務である。

## 検証実測（2026-09-10）

基準HEADは`282ec52199c876976db02267df56622eed62cc3d`と本sliceの13ファイルだけである。
Node 24.15.0、lockfileどおりの`npm ci --offline --ignore-scripts`を使った隔離copyで実行した。
実行用worker-contextとharness.dbは成果物に含めない。

| 検証 | exit | 結果 | output digest |
|---|---|---|---|
| targeted Vitest（plan-compatibility-parent／frontmatter／plan-lint／plan-entry-routing） | 0 | 4 files／121 tests成功。14 oracle内で各反例を検査 | `sha256:e8cfe0936bbd4dd7f3d7e7af34895520262204d40a0da79e1eb9a971832539c2` |
| npm run typecheck | 0 | tsc --noEmit成功 | `sha256:8aa23401265a522f6a9d04e6bdaaa1855432965d44e5721ea70b1c0e037d4011` |
| helix plan lint 対象PLAN | 0 | 既定gate成功、V-pair findings 0 | `sha256:eda563b69fcfe05506b55c6ed83b94427f8eb395eda1517d4fe95040f545cc5c` |
| helix plan lint 対象PLAN --gate governance | 0 | frontmatter／cross-recordとcompatibility判定成功 | `sha256:4b3b6d609fc7f969bfcd3c30232060b79a298ab3639e0e3cf963841316b123db` |
| parent拒否を無効化 | 1 | U-CPP-001 assertion失敗でkill | `sha256:38763d94b8c366e05b79bcf277789f26875c8c174f203a08615caa1f2b7b1886` |
| reference拒否を無効化 | 1 | U-CPP-003 assertion失敗でkill | `sha256:bf9b2be943c80b50b561c1ee5e6719795c80d32245b4bbc909f7b3c4e8934db7` |
| history scope literalをstringへ緩和 | 1 | U-CPP-004 assertion失敗でkill | `sha256:be78f6e8a47d0f7f67b84a2968121130ae49ad7144539d19f87c39870a8f18d5` |

Biomeは変更4 code/test filesを検査し、error／warningなし。`git diff --check`も成功。
未実装stubでは最初にparent表記5件のassertion失敗を実測した。

独立`intra_runtime_subagent`のread-onlyレビューと再確認で実証blocker 0。
工程表見出しの指摘を修正し、再確認では対象14 testsがexit 0。これは自己承認や
GitHubの最終HEAD受入receiptではない。

全体には954 PLANの2009 current依存違反（parent 775／requires・references 1234）が残る。
本sliceの6件は0であり、全体の違反をbaselineへ逃がしていない。全体gateはREDのため、
merge可能・全回帰成功・#1591完了を主張しない。
