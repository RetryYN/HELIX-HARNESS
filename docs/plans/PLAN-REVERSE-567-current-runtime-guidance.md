---
plan_id: PLAN-REVERSE-567-current-runtime-guidance
title: "PLAN-REVERSE-567: current runtime command guidanceをNode/npmへ収束する"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: normalization
forward_routing: L3
promotion_strategy: reuse-with-hardening
drive: agent
status: confirmed
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: RETROFIT
entry_signals:
  - "po_directive:Issue #206の現行設計／process文書にBun実行コマンドが残っている"
created: 2026-08-18
updated: 2026-08-18
owner: Codex / TL
github_issue_id: 206
behavior_contract_id: CURRENT-RUNTIME-GUIDANCE-001
responsibility_owner: current-runtime-guidance
engineering_discipline_required: true
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: consumer_migration
no_code_decision: modify
ddd_modeling_decision: value_object
contract_preconditions: "Node.js 24＋npmがcurrent runtime authorityであり、対象文書がBunを実行経路として案内している"
contract_postconditions: "対象のcurrent guidanceがnpm scriptまたはNode dist artifactだけを案内し、Bunを実行経路として再出力しない"
contract_invariants: "runtime実装、CLI schema、requirements registry、legacy/historical inventoryの意味を変更せず、ADR-009とpackage.jsonのcurrent artifact authorityを一致させ、文書と専用oracleへ同じ定義を投影する"
contract_failures: "対象文書のいずれかがBun commandを含む、またはpackage.jsonに存在しないNode/npm commandを案内する場合はfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "既存文書の実行例をcurrent runtimeへ正規化するsliceであり、専用negative oracleを同一patchへ追加する"
complexity_effect: net_negative
complexity_justification: "BunとNodeの二重実行案内を除去し、source checkoutのnpm scriptとbuilt Node artifactへ統一する"
removal_trigger: "対象文書がrequirements-generated guidanceへ移行し、手書きruntime command surfaceが0になった時点"
parent_design: docs/design/helix/L6-function-design/current-runtime-guidance.md
pair_artifact: docs/test-design/helix/L8-current-runtime-guidance-test-design.md
agent_slots:
  - { role: se, slot_label: "SE — current runtime commandの文書再投影" }
  - { role: qa, slot_label: "QA — Bun再導入と未知commandのnegative oracle" }
  - { role: tl, slot_label: "TL — ADR-009／package.jsonとの実行経路一致" }
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-18T12:05:35Z"
    tests_green_at: "2026-08-18T12:01:45Z"
    verdict: approve
    worker_model: codex
    reviewer_model: codex-intra-runtime
    scope: "PR #793 HEAD 4d99fa1586503565e275b67b51c63375548eb277のcurrent-runtime-guidance sliceをread-only検収した。ADR-009／package.json／対象文書のNode/npmとdist/helix.js binding、PLAN generates 14件と変更14件のexact一致、requirements authority／runtime source非変更、completion_claim_allowed=falseを確認した。Vitestはread-only sandboxの一時directory制約で未実行扱い。Claude exact-HEAD review、PR Actions、DB convergence、main read-after、人間確認は別途必須である。"
    green_commands:
      - kind: typecheck
        command: "node /home/tenni/HELIX-HARNESS/node_modules/typescript/bin/tsc --noEmit"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-18T12:01:45Z"
        evidence_path: docs/plans/PLAN-REVERSE-567-current-runtime-guidance.md
        output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        result: "TypeScript typecheck green"
      - kind: lint
        command: "node --import /home/tenni/HELIX-HARNESS/node_modules/tsx/dist/loader.mjs src/cli.ts plan lint --gate governance"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-18T12:01:45Z"
        evidence_path: docs/plans/PLAN-REVERSE-567-current-runtime-guidance.md
        output_digest: "sha256:1ffd3d4996d775397f5c9878325244fe3c8b73cc1f86c2106daa42195aecad5f"
        result: "plan-governance - OK (frontmatter/cross-record checked=981)"
generates:
  - { artifact_path: docs/plans/PLAN-REVERSE-567-current-runtime-guidance.md, artifact_type: markdown_doc }
  - { artifact_path: docs/adr/ADR-009-node-python-linux-runtime.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/current-runtime-guidance.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-current-runtime-guidance-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/design/helix/L13-post-deploy/post-deploy-evidence-boundary.md, artifact_type: design_doc }
  - { artifact_path: docs/process/forward/L07-implementation.md, artifact_type: markdown_doc }
  - { artifact_path: tests/current-runtime-guidance.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l12-hybrid-recognition.test.ts, artifact_type: test_code }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: src/lint/l12-hybrid-reviewed-safe-v2.ts, artifact_type: source_module }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-REVERSE-566-root-readme-typed-authority.md
  requires:
    - docs/plans/PLAN-REVERSE-565-workflow-model-process-typed-authority.md
    - docs/plans/PLAN-REVERSE-566-root-readme-typed-authority.md
  references:
    - docs/governance/helix-harness-requirements_v1.3.md
    - docs/adr/ADR-009-node-python-linux-runtime.md
    - package.json
  blocks: []
---

# PLAN-REVERSE-567: current runtime command guidanceの正規化

## 目的

Issue #206のうち、現行のpost-deploy、Forward L7文書に残るBun実行例を、ADR-009と
`package.json`が定めるNode.js 24＋npmの実行経路へ再接着する。requirements、runtime実装、CLI、DB、
legacy inventoryはこのsliceの対象外とする。

## 是正契約

- source checkoutの検証は`npm run helix -- <command>`または`npm run <script>`を使う。
- built artifactのsmokeは、ADR-009と`package.json`が一致する`npm run build`後の`node ./dist/helix.js <command>`を使う。
- Bunはactive guidance、実行例、rollback経路へ再導入しない。
- `tests/current-runtime-guidance.test.ts`が対象2文書のBun不在と正規commandの実在を検査する。
- 新規文書がbroad scannerへ追加されるため、`tests/l12-hybrid-recognition.test.ts`の候補数・disposition集計を同じHEADへ更新する。

## 非対象

historical／archive／migration資料の監査文字列、Bun認識候補のinventory、runtimeコード、packageの
dependency変更、配布repoのtag／Release、PLAN-M-02 cutoverは後続sliceで扱う。

## 終端条件

対象ファイルの専用oracle、plan lint、design-language、全回帰、Claude exact-HEAD review、DB convergence、
main read-afterが揃うまでcompletion claimを許可しない。
