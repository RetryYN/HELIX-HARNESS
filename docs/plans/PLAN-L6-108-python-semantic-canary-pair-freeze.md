---
plan_id: PLAN-L6-108-python-semantic-canary-pair-freeze
title: "Python意味コアfoundationとverification verb canaryのL6/L7ペア凍結"
kind: add-design
layer: L6
drive: agent
status: draft
completion_claim_allowed: false
entry_signals:
  - "po_directive:Issue #1734 ADR-009/010のPython semantic coreをfoundationとclassifyVerificationVerb canaryから段階移管する"
owner: Codex / TL
created: 2026-09-12
updated: 2026-09-12
github_issue_id: 1734
behavior_contract_id: PYTHON-SEMANTIC-FOUNDATION-CANARY-001
responsibility_owner: python-semantic-runtime
engineering_discipline_required: true
no_code_decision: no_change
ddd_modeling_decision: domain_service
runtime_responsibility: mixed_split_required
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
contract_preconditions: "ADR-009/010、PLAN-L6-1734-python-semantic-foundation-canary-boundary、HDS-HIL-12のcurrent L6/L7 pair、PYSEM-001 migration ledgerを入力とする"
contract_postconditions: "Python foundationとclassifyVerificationVerb canaryのAPI、failure、U-PYSEM-001..008、実装予定path、TS rollback境界がL6↔L7で一意に対応する。runtime実装やcanary成立は主張しない"
contract_invariants: "Pythonは意味結果だけを生成し、repository、DB path、credential、.helix、Git/GitHub writeを受け取らない。Nodeはschemaとdigestを再検証し、shadow期間はTS結果だけをactive authorityとする"
contract_failures: "provenance未固定、strict JSONL違反、余剰stdout、timeout、resource超過、network許可、schema/digest不一致、parity差、unknown強制分類、rollback不能をfail-closeする"
tdd_red_required: false
complexity_effect: net_neutral
complexity_justification: "既存HDS-HIL-12 pairへcanary固有の8 oracleを追加し、別worker基盤・別store・別gateを作らない"
removal_trigger: "PYSEM-001がPython active authorityへ昇格しTS rollback windowが閉じ、canary固有shadow comparatorのconsumerが0になった時"
backprop_decision: not_required
backprop_decision_reason: "ADR-009/010と承認済みR00境界の具体化であり、L3要求意味やauthority配分を変更しない"
parent_design: docs/design/helix/L6-function-design/python-worker-runtime.md
pair_artifact: docs/test-design/helix/L7-python-semantic-verification-verb-unit-test-design.md
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: ADD_FEATURE
dependencies:
  parent: docs/plans/PLAN-L6-1734-python-semantic-foundation-canary-boundary.md
  requires:
    - docs/plans/PLAN-L6-1734-python-semantic-foundation-canary-boundary.md
    - docs/governance/python-semantic-migration-ledger.v1.yaml
  references:
    - issue:1734
    - issue:230
generates:
  - { artifact_path: docs/plans/PLAN-L6-108-python-semantic-canary-pair-freeze.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/python-semantic-verification-verb-canary.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L7-python-semantic-verification-verb-unit-test-design.md, artifact_type: test_design }
modifies:
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: yaml_config }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l12-hybrid-recognition.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
agent_slots:
  - { role: aim, slot_label: "AIM — ADR-009/010とcurrent L6/L7 authority境界を照合" }
  - { role: se, slot_label: "SE — versioned contractとNode/Python責務を設計" }
  - { role: qa, slot_label: "QA — U-PYSEM-001..008の反例とrollbackを固定" }
  - { role: tl, slot_label: "TL — compatibility pair再利用とruntime先走りを拒否" }
review_evidence: []
---

# Python意味コアcanaryのL6/L7ペア凍結

## 目的

承認済みR00境界のStep 0として、Python worker foundationと最小atom
`classifyVerificationVerb`の実装前契約をcurrent L6↔L7 pairへ追加する。本PLANは設計deltaだけを所有し、
Python source、Node adapter、manifest／lock、activationを生成しない。

## inventory-first記録

- current source: `src/runtime/verb-classify.ts`、`src/runtime/session-log.ts`、`tests/verb-classify.test.ts`。
- 既存foundation: Issue #230由来のregistry、protocol、sandbox、ingestion、Node commit primitiveを再利用する。
- 旧HELIX source `RetryYN/ai-dev-kit-vscode` HEAD
  `1cb4c3e9e73e3d2933b353ccaa2b1f64fffa9f23`をread-only検索したが、同一のverification verb classifierは
  見つからなかった。doctor／test／eslint等のcommand vocabularyだけを入力資料とし、旧shell runtimeは移植しない。

## 工程表

### Step 0-A: L6 APIとfailure境界を固定 [直列]

versioned request/result、strict JSONL、sandbox、Node再検証、shadow comparator、TS rollback authorityを
`U-PYSEM-001..008`へ一意に対応させる。

### Step 0-B: L7反例を固定 [直列]

provenance drift、unknown key、余剰stdout、timeout、network／protected rootアクセス、rule順序逆転、
unknown強制分類、digest据置き改変、parity差、rollback不能を個別oracleへ割り当てる。

### Step 0-C: 別runtime pair review [直列]

L6各APIとL7各oracleのexact join、既存#230 primitive再利用、runtime未実装の非偽装を独立レビューする。
approve receiptを転記して初めて本PLANをconfirmedへ上げ、次のsupply-chain freezeへ進む。

## 非対象

- Python exact version、package manager、manifest／lock、SBOM／licenseの選定と導入。
- Python process起動、JSONL transport、Node adapter、DB projectionの実装。
- `session-log.ts`へのshadow接続、限定activation、旧TS authority削除。
- release、tag、distribution、credentialを伴う外部E2E。
