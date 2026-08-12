---
plan_id: PLAN-L7-551-setup-node-v7-dual-admission
title: "PLAN-L7-551 (recovery): setup-node v7 移行の限定dual admission"
kind: recovery
layer: cross
drive: agent
status: draft
route_mode: recovery
entry_signals:
  - "po_directive:2026-08-12 PR #596を含むopen PRを並列収束し、CI failureをself-healする"
created: 2026-08-12
updated: 2026-08-12
owner: Codex / TL
github_issue_id: 242
dependencies:
  parent: null
  requires: []
  blocks: []
  references: []
engineering_discipline_required: true
behavior_contract_id: U-TOOLCHAIN-PIN-005
responsibility_owner: toolchain-pin
change_slice: atomic
refactor_step: dual_green
legacy_retirement_state: dual_green
no_code_decision: modify
ddd_modeling_decision: policy
contract_preconditions: "source .github/workflows/harness-check.ymlがactions/setup-nodeとpackage.json engines.node floorを宣言する"
contract_postconditions: "#596移行中はactions/setup-node@v4と@v7だけを受理し、それ以外またはref未固定を明示failure codeで拒否する"
contract_invariants: "source workflow内の全setup-node stepを検査し、許可refでもnode-versionはengines.node floorと一致させる。workflow、package、lockfile自体は本sliceで変更しない"
contract_failures: "未許可refはsource-harness-check-setup-node-ref-unsupported、node-version欠落・不一致は既存のmissing/mismatch codeでfail-closeする"
tdd_red_required: true
complexity_effect: justified_positive
complexity_justification: "旧v4 literalを2値の明示allowlistと全step走査へ置換する最小policy追加であり、任意tag許可より検査強度を保てる"
removal_trigger: "PR #596がmainへmergeされ、merge後最初のmain harness-checkがgreenになった時点でv4 allowlistとdual-admission oracleを削除しv7単一へ固定する"
parent_design: docs/design/harness/L6-function-design/function-spec.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/function-spec.md, oracle_id: U-TOOLCHAIN-PIN-005, test_path: tests/toolchain-pin.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/function-spec.md, oracle_id: U-TOOLCHAIN-PIN-006, test_path: tests/toolchain-pin.test.ts }
agent_slots:
  - role: aim
    slot_label: "AIM — recovery境界とv4退役条件の確定"
  - role: se
    slot_label: "SE — setup-node ref policyと全step検査の実装"
  - role: qa
    slot_label: "QA — dual-green正例、unsupported/unpinned/mixed反例、削除条件のレビュー"
generates:
  - { artifact_path: docs/plans/PLAN-L7-551-setup-node-v7-dual-admission.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/harness/L6-function-design/function-spec.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/harness/L8-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/lint/toolchain-pin.ts, artifact_type: source_module }
  - { artifact_path: tests/toolchain-pin.test.ts, artifact_type: test_code }
schedule:
  - step: 1
    mode: serial
    description: "旧v4 literalを固定したREDと、未許可ref混在を見逃すREDを記録する"
  - step: 2
    mode: serial
    description: "v4/v7 exact allowlistと全setup-node step検査を実装する"
  - step: 3
    mode: parallel
    description: "targeted test、typecheck、toolchain doctor、独立レビューを収束させる"
---

# PLAN-L7-551: setup-node v7 移行の限定 dual admission

## 背景

Dependabot PR #596 は source `harness-check.yml` の `actions/setup-node` を v4 から v7へ更新する。
一方、`src/lint/toolchain-pin.ts` は `actions/setup-node@v4` のstepだけをnode-version検査対象としていたため、
v7への正規更新を「setup-nodeなし」と誤判定して`source-harness-check-node-version-missing`で落とした。

Issue #242のNode 24 version-up境界に従い、依存更新PR側でgateを迂回せず、gate側に期間限定の
dual admissionを先行させる。

## 変更範囲

- source workflowの`actions/setup-node` stepを全件抽出する。
- 許可refを`actions/setup-node@v4`と`actions/setup-node@v7`のexact 2値に限定する。
- v6、v8、branch名、refなし、および許可refと未許可refの混在を
  `source-harness-check-setup-node-ref-unsupported`で拒否する。
- 許可refに対する既存node-version欠落／Node engine floor不一致検査を維持する。

対象外はworkflow、`package.json`、`package-lock.json`、distribution surfaceの変更、および#596そのものの
branch更新・mergeである。本PRを先に収束させた後、Dependabot rebaseで#596を再評価する。

## RED / GREEN証拠

- RED 1: v7正例とunsupported ref反例を追加した時点で、v7が
  `source-harness-check-node-version-missing`となり2件失敗（exit 1）。
- RED 2: v4正例へv8 stepを混在させた反例が旧実装でpass（exit 1）。
- GREEN: `tests/toolchain-pin.test.ts`は6件pass、`tsc --noEmit`と変更pathのBiome checkはexit 0。

mutation_oracle_evidence: `tests/toolchain-pin.test.ts`のmixed v4+v8反例が旧first-match実装をredにし、全step未検査mutationをkillする。

## 退役条件

#596がmainへmergeされ、そのmerge後最初のmain `harness-check`がgreenになったことを確認したら、
v4をallowlistから除去する。`U-TOOLCHAIN-PIN-006`のunsupported/unpinned fail-closeは残し、
`U-TOOLCHAIN-PIN-005`をv7単一authorityへ更新する。
