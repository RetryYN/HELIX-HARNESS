---
plan_id: PLAN-REVERSE-566-root-readme-typed-authority
title: "PLAN-REVERSE-566: root READMEをrequirements typed authorityへ再接着する"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: normalization
forward_routing: L3
promotion_strategy: reuse-with-hardening
drive: agent
status: confirmed
completion_claim_allowed: false
review_evidence:
  - reviewer: claude-convergence
    review_kind: cross_agent
    reviewed_at: "2026-08-18T01:25:58Z"
    tests_green_at: "2026-08-18T01:25:58Z"
    verdict: approve
    worker_model: gpt-5.4-codex
    reviewer_model: claude-opus-5
    scope: "PR #781 (head 81485cfa) をClaude収束レーンでcurrent HEAD独立レビューした。root READMEのcurrent guidanceがNode24 source checkout、L1-L12 canonical、typed registry／generated catalog、axis分離、execution mode境界へ再接着されていることを確認し、U-RRTA-001〜004へ旧identityを1件ずつ再注入するmutationで4/4がload-bearingであることを実測した。READMEが案内するnpm script (build/typecheck/lint/test:fast/test:node-fallback) と `helix route eval` の実在も確認した。receipt=claude-pr-review:RetryYN/HELIX-HARNESS#781:81485cfac6691c2b80c77f53f38c63813003963f:claude:run:32085834093:attempt:1:success"
    green_commands:
      - kind: unit_test
        command: "npm exec --offline -- vitest run --project fast tests/root-readme-typed-authority.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        evidence_path: tests/root-readme-typed-authority.test.ts
        output_digest: "sha256:87732a0641404344d3982aceb8e087d340be1545605ca2da7c2082f2533f8eda"
        result: "root README typed authority oracle 4 tests green (mutation 4/4 load-bearing)"
      - kind: typecheck
        command: "npm exec --offline -- tsc --noEmit"
        runner: node
        scope: targeted
        exit_code: 0
        evidence_path: tsconfig.json
        output_digest: "sha256:290e679c492d7c229373061b313ab332394da783b08c9eff85bbb81275f96afc"
        result: "TypeScript typecheck green"
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: RETROFIT
entry_signals:
  - "po_directive:Issue #206 root READMEが旧runtime、旧layer、旧分類をcurrent guidanceとして案内している"
created: 2026-08-18
updated: 2026-08-18
owner: Codex / TL
github_issue_id: 206
behavior_contract_id: ROOT-README-TYPED-AUTHORITY-001
responsibility_owner: root-readme-typed-authority
engineering_discipline_required: true
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: consumer_migration
no_code_decision: modify
ddd_modeling_decision: value_object
contract_preconditions: "root READMEが廃止runtime、旧layer span、旧workflow分類、旧mode/model identityをcurrent guidanceとして案内している"
contract_postconditions: "root READMEがrequirements v1.3.12、registry v1.1.4、generated catalog、L1-L12、typed axis、source checkoutをcurrent guidanceとして案内する"
contract_invariants: "development_style、case_driven_model、workflow_model、subroute、specialist drive、execution modeを別軸で保持し、catalogを意味正本にしない"
contract_failures: "廃止runtime active guidance、旧layer spanのcurrent guidance、旧workflow分類、旧mode/model field、workflowとexecution modeの混同を受理しない"
tdd_red_required: false
tdd_red_waiver_reason: "既存root READMEの旧current guidanceを同一sliceで是正し、U-RRTA-001〜004で再導入をfail-closeする"
mutation_oracle_evidence: "U-RRTA-001〜004がNode24／L1-L12／typed registry／axis分離／旧drive入力の再導入を独立assertする"
complexity_effect: net_negative
complexity_justification: "旧runtimeと共通分類の長い説明を除去し、requirementsからのtyped identity導線へ集約する"
removal_trigger: "READMEがregistryから完全生成され、手書きcurrent guidance consumerが0になった時点"
pair_artifact: docs/test-design/helix/github-autonomous-operations-acceptance.md
backprop_decision: not_required
backprop_decision_reason: "既存requirementsとregistryの意味を変更せず、root READMEのcurrent guidanceだけを再接着するため"
agent_slots:
  - { role: se, slot_label: "SE — root READMEのcurrent authority再投影" }
  - { role: qa, slot_label: "QA — 旧runtime／layer／axis再導入mutation" }
  - { role: tl, slot_label: "TL — requirements registryとの意味一致" }
dependencies:
  parent: docs/plans/PLAN-REVERSE-563-process-readme-typed-authority.md
  requires:
    - docs/plans/PLAN-REVERSE-563-process-readme-typed-authority.md
    - docs/plans/PLAN-REVERSE-565-workflow-model-process-typed-authority.md
  references:
    - docs/plans/PLAN-L3-61-github-workflow-guidance-authority.md
  blocks: []
generates:
  - { artifact_path: docs/plans/PLAN-REVERSE-566-root-readme-typed-authority.md, artifact_type: markdown_doc }
  - { artifact_path: README.md, artifact_type: markdown_doc }
  - { artifact_path: tests/root-readme-typed-authority.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
---

# PLAN-REVERSE-566: root READMEのtyped authority再接着

## 目的

Issue #206のうちroot READMEだけを対象に、旧runtime、旧Vモデル層、旧共通分類の説明をcurrent requirementsとtyped registryへ是正する。CLI／runtime／DB／labels／consumer templateは後続sliceへ残す。

## 観測した差分

- 廃止されたruntimeとsource checkoutの実行経路が混在していた。
- 旧layer spanがcurrent V-modelとして説明されていた。
- Production Scrum、Reverse、Recovery、Discoveryを同一の旧分類として案内していた。
- workflow identityとruntime execution modeの境界がREADME上で不明確だった。

## 是正契約

requirements v1.3.12とworkflow classification registry v1.1.4を意味authorityとし、catalogはgenerated projection、旧catalogはcompatibility inventoryと明記する。READMEは `signal → target_axis / target_id → execution policy` の導出線、L1–L12、Node24 source checkout、証拠で閉じるPR境界を案内する。

`--mode`はruntimeのexecution modeの説明に限定し、workflow分類の入力として扱わない。旧入力の互換adapterはREADMEのcurrent identityや生成物へ再出力しない。

## 検証

- `tests/root-readme-typed-authority.test.ts` で旧current guidanceをmutation oracle付きで検査する。
- `npm exec --offline -- vitest run --project fast tests/root-readme-typed-authority.test.ts`
- `npm exec --offline -- tsx src/cli.ts plan lint docs/plans/PLAN-REVERSE-566-root-readme-typed-authority.md`
- `npm exec --offline -- tsc --noEmit`
- Claude exact-HEAD review、PR CI、DB convergence、main read-afterはPR終端で実施する。

本PLANはdraftかつ`completion_claim_allowed: false`で開始し、独立レビューとmain read-afterが揃うまで完了扱いにしない。
