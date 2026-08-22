---
plan_id: PLAN-L7-582-bounded-probe-history
title: "PLAN-L7-582 (impl): bounded probe実行とappend-only測定履歴を実装する"
kind: impl
layer: L7
drive: agent
status: confirmed
completion_claim_allowed: true
backfill_state: complete
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: specialist_capability
  target_id: NFR_MEASUREMENT
entry_signals: ["po_directive:Issue #221 bounded probe/history"]
created: 2026-08-17
updated: 2026-08-19
owner: Codex / TL
github_issue_id: 221
behavior_contract_id: BOUNDED-PROBE-HISTORY-001
responsibility_owner: measurement-harness
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: aggregate
contract_preconditions: "Issue #219のNFR registryとIssue #220のpure evaluatorが受理済みであり、probe ID、registry digest、current HEAD、dataset digestを実行前に取得できる"
contract_postconditions: "allowlist probeだけをresource bound内で実行し、plan／result／event digestとcurrent headをappend-only historyへ一つのSQLite transactionで記録し、再送を同一bytesだけ冪等に扱う"
contract_invariants: "任意command、shell、network、credential、raw output、推測されたHEAD／datasetを受理しない。不足sample、timeout、failureはgreenへ縮退させない"
contract_failures: "schema、allowlist、registry／HEAD／dataset不一致、portのtimeout／deadline超過・例外、CPU／memory／output超過、sample不足、history head競合、同一run payload conflictをfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "隔離worktreeでcontract、SQLite schema、実行port、oracleを同一atomic sliceとして追加し、偽のRed時刻を記録せず、targeted test・schema authority・typecheck・Biomeで受入を閉じる"
complexity_effect: justified_positive
complexity_justification: "実測履歴のrun/event/headを分離してappend-only chainを保持するが、任意command adapterや別DBを追加せず既存Node SQLite boundaryへ束ねる"
removal_trigger: "measurement history schema major version更新時にversioned successorへ移管する"
parent_design: docs/design/helix/L6-function-design/bounded-probe-history.md
pair_artifact: docs/test-design/helix/L8-bounded-probe-history-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/bounded-probe-history.md, oracle_id: U-PH-001, test_path: tests/bounded-probe-history.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/bounded-probe-history.md, oracle_id: U-PH-002, test_path: tests/bounded-probe-history.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/bounded-probe-history.md, oracle_id: U-PH-003, test_path: tests/bounded-probe-history.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/bounded-probe-history.md, oracle_id: U-PH-004, test_path: tests/bounded-probe-history.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/bounded-probe-history.md, oracle_id: U-PH-005, test_path: tests/bounded-probe-history.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/bounded-probe-history.md, oracle_id: U-PH-006, test_path: tests/bounded-probe-history.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — bounded probe portとhistory store" }
  - { role: qa, slot_label: "QA — resource／chain／conflict negative oracle" }
  - { role: tl, slot_label: "TL — #219／#220境界とcurrent-head admission" }
generates:
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
  - { artifact_path: docs/governance/feedback-refactor-disposition.json, artifact_type: json_config }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: docs/plans/PLAN-L7-582-bounded-probe-history.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L4-basic-design/bounded-probe-history.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L5-detail/bounded-probe-history.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L6-function-design/bounded-probe-history.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-bounded-probe-history-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/test-design/helix/L9-bounded-probe-history-system-test-design.md, artifact_type: test_design }
  - { artifact_path: src/measurement/bounded-probe-history.ts, artifact_type: source_module }
  - { artifact_path: src/schema/harness-db-tables-evaluation.ts, artifact_type: source_module }
  - { artifact_path: src/schema/harness-db-indexes.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/migration.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/projection-writer.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/schema-authority.ts, artifact_type: source_module }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/bounded-probe-history.test.ts, artifact_type: test_code }
dependencies:
  parent: null
  requires:
    - docs/plans/PLAN-L7-550-nfr-typed-registry-quality-taxonomy.md
    - docs/plans/PLAN-L7-560-measurement-evidence-evaluator.md
  references:
    - docs/plans/PLAN-L7-581-github-workflow-identity-migration-bundle-admission.md
  blocks:
    - issue:193
    - issue:188
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-17T12:52:09Z"
    tests_green_at: "2026-08-17T12:52:04Z"
    verdict: approve
    scope: "#221 bounded probe/history の実装境界をCodex TLとして確認。allowlist、registry/current HEAD/dataset binding、resource/deadline再検証、append-only digest chain、同一bytes冪等性、payload conflict fail-closeを確認した。L4-L6の設計境界と実装差分を確認し、今回のsliceに追加の左腕差し戻しはないと判定した。これはClaudeの独立レビューを代替せず、completion_claim_allowed=falseを維持する。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --project fast tests/digest.test.ts tests/feedback-refactor-disposition.test.ts tests/bounded-probe-history.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-17T12:17:58Z"
        evidence_path: tests/bounded-probe-history.test.ts
        output_digest: "sha256:ce44f6259ff08ec6a6605d28a7ecb690b4cc7eba0dc45a02a56782b54222e6ff"
      - kind: typecheck
        command: "npx --no-install tsc --noEmit"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-08-17T12:17:58Z"
        evidence_path: src/measurement/bounded-probe-history.ts
        output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
      - kind: lint
        command: "npx --no-install biome check src/measurement/bounded-probe-history.ts src/schema/harness-db-tables-evaluation.ts src/schema/harness-db-indexes.ts src/state-db/migration.ts src/state-db/projection-writer.ts src/state-db/schema-authority.ts src/state-db/maintenance.ts src/lint/l3-progression-reviewed-digests.ts tests/bounded-probe-history.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-17T12:17:58Z"
        evidence_path: src/measurement/bounded-probe-history.ts
        output_digest: "sha256:f3d330c64bda19d9db20c9c246267e473d1ad8e713c5b942f3e3b71f1094a006"
      - kind: lint
        command: "npx --no-install tsx src/cli.ts plan lint docs/plans/PLAN-L7-582-bounded-probe-history.md"
        runner: node
        scope: gate
        exit_code: 0
        completed_at: "2026-08-17T12:17:58Z"
        evidence_path: docs/plans/PLAN-L7-582-bounded-probe-history.md
        output_digest: "sha256:dabd5ebcd304d05e0ad7b763127250f7d36c56504c0d97719638055ea845a44e"
      - kind: unit_test
        command: "npx --no-install vitest run --project fast tests/left-arm-carry-log.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-17T12:52:04Z"
        evidence_path: tests/left-arm-carry-log.test.ts
        output_digest: "sha256:843a5a16b1ed5bb7370765718b4317fe0711c1c6d3bd43425b6667bb227bafb1"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-17T13:18:36Z"
    tests_green_at: "2026-08-17T13:18:36Z"
    verdict: approve
    scope: "追加したAbortSignal付きtimeout／deadline enforcementとport例外fail-closeを確認した。U-PH-006、bounded probe targeted、typecheck、Biome、PLAN lintがgreenであり、Claude Codeの独立exact-HEADレビューは未実施のため本entryは代替レビューではない。completion_claim_allowed=falseを維持する。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --project fast tests/digest.test.ts tests/feedback-refactor-disposition.test.ts tests/bounded-probe-history.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-17T13:17:59Z"
        evidence_path: tests/bounded-probe-history.test.ts
        output_digest: "sha256:e2024a54ddd6e8f6a125e3e1cd0aa53495d4aad682b6bbf2ad83ab98ce503478"
      - kind: typecheck
        command: "npx --no-install tsc --noEmit"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-08-17T13:17:59Z"
        evidence_path: src/measurement/bounded-probe-history.ts
        output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
      - kind: lint
        command: "npx --no-install biome check src/measurement/bounded-probe-history.ts tests/bounded-probe-history.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-17T13:17:59Z"
        evidence_path: src/measurement/bounded-probe-history.ts
        output_digest: "sha256:bab5167f3509ac5b312968fdbc37c3c7f08507747f8faa05aa22e5f258706635"
      - kind: lint
        command: "npx --no-install tsx src/cli.ts plan lint docs/plans/PLAN-L7-582-bounded-probe-history.md"
        runner: node
        scope: gate
        exit_code: 0
        completed_at: "2026-08-17T13:18:36Z"
        evidence_path: docs/plans/PLAN-L7-582-bounded-probe-history.md
        output_digest: "sha256:dabd5ebcd304d05e0ad7b763127250f7d36c56504c0d97719638055ea845a44e"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-17T12:50:52Z"
  review_binding:
    reviewer: codex-tl
    reviewed_at: "2026-08-17T12:52:09Z"
    evidence_digest: "sha256:d3b21c122f1cb68e7054c31f3fbe369a21c86afea3f7b603672a0d56bad9207a"
  entries: []
---

# bounded probe実行と測定履歴

## 工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | L4〜L6で実行・保存境界を固定 | #219／#220との責務重複0、任意commandなし |
| 2 | allowlist portとresource admissionを実装 | U-PH-001〜003 green |
| 3 | SQLite append-only event／head／replayを実装 | U-PH-004〜005、schema authority green |
| 4 | L8／L9、mutation、current-head CI、Claude exact-HEAD review | blocker 0、completion_claim_allowed=trueへ遷移可能 |

## 責務境界

NFRの意味・threshold・freshness判定は#219／#220を再実装しない。本PLANは、受理済みdeclarationへ
束縛されたprobeを bounded に実行し、current HEAD・dataset digest・runner・resource boundsを
receiptへ残し、metric eventをappend-onlyで保存する。#188はこの履歴をconsumerとして利用し、
独自のmeasurement taxonomyやthreshold evaluatorを追加しない。

不足sample、timeout、probe failure、resource超過はunknownまたはfailedとして保存し、成功へ丸めない。

## Reverse終端化（R4）

本PLANは、PR #776で実装されたbounded probe/historyのReverse fullbackを兼ねる。実装HEADはmerge commit
`80a60220e8360ccb0a8f16b4ee959f84a636982d`としてmainへ統合済みであり、probe admission、allowlist port、
AbortSignal付きdeadline、failure quality、SQLiteのappend-only event／head／replay、immutability、同一payload
冪等性をこのPLANの完了主張へ接続する。

R0〜R3の照合結果は、L4／L5／L6設計、L7 runtime、L8／L9 verification、#219のNFR分類、#220のpure
evaluatorとの責務境界に意味差分がないため、全backpropを`preserve`とする。新しいruntime、DB、分類、任意command、
shell、network、credential、absolute pathの受理経路は追加しない。

Issue #221は、次の証拠を同一contractへ接続し、main read-afterを確認するまでclosedと扱わない。

- PR #776のmerge commitとcurrent-main targeted green
- DB convergence／replay一致
- Claude Codeのcurrent exact-HEAD独立review receipt
- main read-afterのterminal success

この終端判定は、現行requirements／workflow classification authority（registry `1.1.4`、source digest
`sha256:5023a820b8ae786b71c90edaea57812286f7a3091ab22b04f60d8fb2915f7b3f`）へ束縛し、compatibility-onlyの
旧catalogや旧mode identityを証拠として再利用しない。

#193、#223、#231はconsumerとして引き続きopenのままとし、#221の終端から自動closeしない。bounded probeの
新手法、#220のevaluator変更、#223のfinding disposition、#231のPerformance Refactor、distribution、host
resource admission、任意command実行、#193の全体完了宣言は本terminalizationの対象外とする。
---
