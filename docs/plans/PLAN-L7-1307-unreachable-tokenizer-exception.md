---
plan_id: PLAN-L7-1307-unreachable-tokenizer-exception
title: "PLAN-L7-1307: 到達不能なtokenizer例外を除去する"
kind: refactor
layer: L7
drive: agent
status: draft
completion_claim_allowed: false
backfill_state: pending
created: 2026-09-08
updated: 2026-09-08
owner: Cursor Cloud / Codex Integration
github_issue_id: 1307
behavior_contract_id: UIL-SENSITIVE-FIELD-POLICY-001
responsibility_owner: universal-improvement-sensitive-field-policy
engineering_discipline_required: true
change_slice: atomic
refactor_step: remove_legacy
legacy_retirement_state: consumer_zero
no_code_decision: modify
ddd_modeling_decision: policy
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: REFACTOR
entry_signals:
  - code_smell
contract_preconditions: "Issue #1307のseeded mutationによりtokenizer例外が挙動へ到達しないことを確認できる"
contract_postconditions: "到達不能な特例を除去し、tokenizer／tokenizationを非機密として扱う既存挙動を維持する"
contract_invariants: "sensitive field family、policy version、raw値非漏洩、既存oracleを変更しない"
contract_failures: "benign fieldの誤拒否、sensitive fieldの見逃し、write-set逸脱を拒否する"
tdd_red_required: false
tdd_red_waiver_reason: "挙動不変のdead-code除去であり、Issue #1307のseeded mutationと既存U-UILSFP-001〜004で同値性を検証する"
mutation_oracle_required: false
complexity_effect: net_negative
complexity_justification: "到達不能な分岐条件を1件除去し、新しい判定・schema・依存を追加しない"
removal_trigger: "なし。誤解を招くdead pathを恒久的に除去する"
backprop_decision: not_required
backprop_decision_reason: "confirmed済みUIL sensitive-field policyの意味を変えない局所refactor"
parent_design: docs/design/helix/L6-function-design/universal-improvement-source-registry.md
pair_artifact: docs/test-design/helix/L8-universal-improvement-source-registry-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/universal-improvement-source-registry.md, oracle_id: U-UILSFP-001, test_path: tests/universal-improvement-source-registry.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/universal-improvement-source-registry.md, oracle_id: U-UILSFP-002, test_path: tests/universal-improvement-source-registry.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/universal-improvement-source-registry.md, oracle_id: U-UILSFP-004, test_path: tests/universal-improvement-source-registry.test.ts }
dependencies:
  parent: docs/design/helix/L6-function-design/universal-improvement-source-registry.md
  requires: []
  references:
    - issue:1307
    - docs/plans/PLAN-L7-718-universal-improvement-sensitive-field-policy.md
  blocks: []
generates:
  - { artifact_path: docs/plans/PLAN-L7-1307-unreachable-tokenizer-exception.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: src/runtime/universal-improvement-source-registry.ts, artifact_type: source_module }
---

# PLAN-L7-1307: 到達不能なtokenizer例外の除去

## 工程表

- [x] Issue #1307と既存policy／oracleを照合する。
- [x] Cursor Cloudへ単一source write-setで委譲する。
- [x] 到達不能な条件だけを除去する。
- [x] Cloud環境とclean local環境の検証結果を分離して記録する。
- [ ] exact HEADのCIと独立reviewを成立させる。
- [ ] 正規mergeとmain read-afterを成立させる。

## G.4 最小slice

変更対象は`classifySensitiveObservationField`内の到達不能条件1件だけとする。Cloud overlayで発生した
`PHYSICAL_TARGET_MOUNT_BOUNDARY`を判定緩和で隠さず、同一candidate HEADをclean localと通常CIで検証する。

## 実測

- Cursor run `run-efd4c0c6-0465-41e5-b4c9-00ad4a988edf`は633944 msで終了し、candidate
  `ac393da339ec1c098958a6b7618f527501dee236`を生成した。
- Cursor内では対象3 oracle、Biome、typecheckがgreen。全file testの残り9件はCloud overlayの
  device境界により`PHYSICAL_TARGET_MOUNT_BOUNDARY`となり、greenへ読み替えていない。
- clean detached localの同一HEADでは対象file 12 tests、typecheck、Biome、diff checkがgreen。
- Cursor API usage receiptはinput 228250、output 17177、cache read 3586176、total 3831603 tokens。
  金額換算はAPIから得られていないため未知として保持する。
