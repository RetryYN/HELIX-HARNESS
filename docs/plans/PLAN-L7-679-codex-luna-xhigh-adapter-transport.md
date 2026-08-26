---
plan_id: PLAN-L7-679-codex-luna-xhigh-adapter-transport
title: "PLAN-L7-679 (impl): policy-derived Luna xhighをCodex adapter transportへ保全する"
kind: impl
layer: L7
drive: agent
status: draft
completion_claim_allowed: false
created: 2026-08-26
updated: 2026-08-26
owner: Codex / TL
github_issue_id: 1054
behavior_contract_id: CODEX-NATIVE-WORKER-ADAPTER-001
responsibility_owner: codex-native-worker-adapter-transport
engineering_discipline_required: true
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: consumer_migration
no_code_decision: add_code
ddd_modeling_decision: port
contract_preconditions: "#624のrequirements／model registry／native spawn admissionがCodex native workerをgpt-5.6-luna・xhighへ導出している"
contract_postconditions: "Codex adapter planとprovider invocationのmodel_reasoning_effortがpolicy-derived xhighを保持し、Luna workerの実行identityをhighへ縮退させない"
contract_invariants: "Claudeの既存effort compatibility、#638 schema、#639 registry、#640 spawn admission、Sol parent、Terra historical evidenceを変更しない"
contract_failures: "Codex xhighがhighへ変換される、Claude compatibilityが変わる、provider間のeffort semanticsが混ざる場合はfail-closeする"
tdd_red_required: true
red_at: "2026-08-26T11:19:18+09:00"
green_at: "2026-08-26T11:20:42+09:00"
red_test: "U-CNWADAPTER-001と既存U-ADAPTER-010でCodex xhighのhigh縮退を先行検出する"
mutation_oracle_evidence: "src/runtime/adapter.ts の provider別 xhigh保持条件を一時的に無条件 high へ変異させ、2026-08-26T11:19:51+09:00 に tests/runtime-adapter.test.ts を実行した。U-ADAPTER-010 と U-CNWADAPTER-001 が expected xhigh / received high で2件red、他24件green（exit 1）となり、Codex xhighの縮退を検出した。条件を復元し、2026-08-26T11:20:42+09:00 に同suite 26件をexit 0で再確認した。"
complexity_effect: net_neutral
complexity_justification: "既存adapterのprovider無視の正規化をprovider別transport規則へ狭く分離する"
removal_trigger: "Codex adapterが署名済みpolicy execution packetを直接受理し、provider transportがそのprojectionへ吸収された時"
parent_design: docs/design/harness/L6-function-design/function-spec.md
pair_artifact: docs/test-design/helix/L8-xhigh-reasoning-effort-schema-unit-test-design.md
entry_signals:
  - "po_directive:Sol parentからLuna xhigh workerへ委譲する実経路を保全する"
dependencies:
  parent: PLAN-L7-640-luna-native-spawn-admission
  requires:
    - docs/design/helix/L3-requirements/codex-native-worker-routing-requirements.md
    - docs/plans/PLAN-L7-638-xhigh-reasoning-effort-schema.md
    - docs/plans/PLAN-L7-639-luna-worker-model-registry.md
    - docs/plans/PLAN-L7-640-luna-native-spawn-admission.md
  blocks:
    - issue:624-runtime-receipt
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/function-spec.md, oracle_id: U-CNWADAPTER-001, test_path: tests/runtime-adapter.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/function-spec.md, oracle_id: U-CNWADAPTER-002, test_path: tests/runtime-adapter.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-679-codex-luna-xhigh-adapter-transport.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
modifies:
  - { artifact_path: src/runtime/adapter.ts, artifact_type: source_module }
  - { artifact_path: tests/runtime-adapter.test.ts, artifact_type: test_code }
  - { artifact_path: docs/design/harness/L6-function-design/function-spec.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-xhigh-reasoning-effort-schema-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-context-authority.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-wrapper-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L5-detail/worker-context-authority.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L5-detail/worker-wrapper-admission.md, artifact_type: design_doc }
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: ADD_FEATURE
agent_slots:
  - { role: se, slot_label: "SE — Codex provider別effort transport" }
  - { role: qa, slot_label: "QA — Luna xhigh保持とClaude compatibilityのnegative oracle" }

---

# Codex adapter transportへのLuna xhigh保全

## 目的

Issue #624のCNW-R-02／CNW-R-03が導出した`gpt-5.6-luna`・`xhigh`を、実際のCodex adapter invocationまで一方向に運ぶ。現行adapterはprovider引数を受け取るが`xhigh`を無条件に`high`へ変換するため、policyのcurrent identityと実起動引数が一致しない。

## 工程

1. Codex／Claudeの既存effort transportと#624のcurrent identityを実測する。
2. Codexだけ`xhigh`を保持し、Claudeの既存`xhigh → high` compatibilityを維持する。
3. adapter planのmodel／effort／argvをtargeted testで束縛する。
4. source mutationでCodex xhighのhigh縮退を検出し、復元後に再実測する。
5. typecheck、Biome、PLAN lint、DB replay、doctor、current HEADのClaude exact-HEAD reviewへ渡す。

## 受入条件

- `normalizeProviderEffort("codex", "xhigh")`が`xhigh`を返す。
- Luna modelのCodex planが`-c model_reasoning_effort=xhigh`を出す。
- 同じplanが`model_reasoning_effort=high`を出さない。
- Claudeの`middle → medium`、`xhigh → high`、空値、case／whitespace compatibilityがgreenである。
- #638／#639／#640のschema・registry・spawn admissionを再実装せず、transportだけを修正する。
- historical PLAN／receiptへ記録済みの旧aliasを改変しない。

## 非対象

- Claude adapter仕様の変更。
- arbitrary model override、raw agent bypass、spawn admissionの緩和。
- Sol parentのsubagent化、Terraのcurrent復帰。
- resident lane、Notification Fabric、routing／allocation本体。
