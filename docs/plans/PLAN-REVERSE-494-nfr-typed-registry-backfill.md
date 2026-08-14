---
plan_id: PLAN-REVERSE-494-nfr-typed-registry-backfill
title: "PLAN-REVERSE-494: NFR typed registryの設計backfill"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: design
route_mode: reverse
forward_routing: gap-only
promotion_strategy: reuse-as-is
drive: agent
status: confirmed
created: 2026-08-14
updated: 2026-08-14
owner: Codex / TL
github_issue_id: 219
behavior_contract_id: NFR-TYPED-REGISTRY-001
responsibility_owner: nfr-registry
change_slice: atomic
pair_artifact: docs/test-design/helix/L8-nfr-typed-registry-quality-taxonomy-unit-test-design.md
entry_signals:
  - "po_directive:2026-08-14 PR #621でmergeしたNFR typed registryをReverse R0から上位設計へ照合する"
backprop_scope:
  - layer: L3-requirements
    decision: preserve
    evidence_path: docs/governance/helix-harness-requirements_v1.3.md
    reason: "HR-NFR-REG-001..003のtyped registry要求を実装したsliceであり、要求の意味は変更しない。"
  - layer: L4-basic-design
    decision: preserve
    evidence_path: docs/design/helix/L4-basic-design/nfr-typed-registry-quality-taxonomy.md
    reason: "registry宣言、pure analyzer、migration admission、doctor adapterと#220／#221の責務境界がmerged implementationへ一致する。"
  - layer: L5-detailed-design
    decision: preserve
    evidence_path: docs/design/helix/L5-detail/nfr-typed-registry-quality-taxonomy.md
    reason: "24-field exact schema、authority path／digest境界、stable-ID revision migration契約が実装分岐へ一致する。"
  - layer: L6-function-design
    decision: preserve
    evidence_path: docs/design/helix/L6-function-design/nfr-typed-registry-quality-taxonomy.md
    reason: "analyzeNfrRegistry／parseNfrRegistry、admitNfrRegistryMigration、checkNfrRegistryの契約が実装exportへ一致する。"
  - layer: verification-design
    decision: preserve
    evidence_path: docs/test-design/helix/L8-nfr-typed-registry-quality-taxonomy-unit-test-design.md
    reason: "U-NFRREG-001..017とIT-NFRREG-001..003の正負oracleをtargeted 20/20 greenで実測した。"
agent_slots:
  - { role: se, slot_label: "SE — R0 implementation／trace採取" }
  - { role: qa, slot_label: "QA — R1 schema／migration／doctor反証" }
  - { role: tl, slot_label: "TL — R2設計照合、R3意図照合、R4再入判定" }
generates:
  - { artifact_path: docs/plans/PLAN-REVERSE-494-nfr-typed-registry-backfill.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-L7-550-nfr-typed-registry-quality-taxonomy.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/helix-harness-requirements_v1.3.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L4-basic-design/nfr-typed-registry-quality-taxonomy.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L5-detail/nfr-typed-registry-quality-taxonomy.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L6-function-design/nfr-typed-registry-quality-taxonomy.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-nfr-typed-registry-quality-taxonomy-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/test-design/helix/L9-nfr-typed-registry-quality-taxonomy-system-test-design.md, artifact_type: test_design }
dependencies:
  parent: docs/plans/PLAN-L7-550-nfr-typed-registry-quality-taxonomy.md
  requires:
    - docs/plans/PLAN-L7-550-nfr-typed-registry-quality-taxonomy.md
  references:
    - docs/plans/PLAN-L7-550-nfr-typed-registry-quality-taxonomy.md
    - docs/design/helix/L4-basic-design/nfr-typed-registry-quality-taxonomy.md
    - docs/design/helix/L5-detail/nfr-typed-registry-quality-taxonomy.md
    - docs/design/helix/L6-function-design/nfr-typed-registry-quality-taxonomy.md
    - docs/test-design/helix/L8-nfr-typed-registry-quality-taxonomy-unit-test-design.md
    - docs/test-design/helix/L9-nfr-typed-registry-quality-taxonomy-system-test-design.md
    - config/nfr-registry.json
    - src/requirements/nfr-registry.ts
    - src/doctor/nfr-registry-check.ts
    - tests/nfr-registry.test.ts
    - tests/nfr-registry-doctor.test.ts
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-08-14T09:36:02Z"
    tests_green_at: "2026-08-14T09:35:09Z"
    verdict: approve
    worker_model: codex:gpt-5.6-luna
    reviewer_model: claude:claude-opus-5
    reviewer_session_id: "74daf4bd-9f31-4784-be61-62bd67dc33a2"
    scope: "PR #687 final HEAD 0c93e28072d8a7d008c2a32bcfe9383d980e1e0d のR4 gap-only routing、全5 backprop scopeのpreserve判定、#220／#221／#223／#231との責務境界、forward PLAN非変更を独立reviewしblocker 0。draft Actions run 31787539137とready-head Actions run 31788889271はいずれもsuccess、HELIX reviewed merge 7c27e9915db484ba1818be5c9f66f7e8d05d5e63、read-after reasons 0。canonical receipt: pull/687#issuecomment-5291801020、receipt digest sha256:8e1e88d7fe61d48dcf4c77c7daa882a629304b1484dbce55f24ecc7eadd83bcb。"
    green_commands:
      - { kind: smoke, command: "gh run view 31787539137 --repo RetryYN/HELIX-HARNESS --json status,conclusion,headSha,updatedAt", runner: ci, scope: full, exit_code: 0, completed_at: "2026-08-14T09:35:09Z", evidence_path: tests/backfill-pairing.test.ts, output_digest: "sha256:935866ae34419b41c612e6eff2e5df4842bad0149f0ed12f728e661c7765a5be", result: "completed / success / HEAD 0c93e28072d8a7d008c2a32bcfe9383d980e1e0d" }
---

# PLAN-REVERSE-494: NFR typed registryの設計backfill

## R0 現状採取

PR #621のmerge commit `ba88d9df282e12fe77decf5fcf2b190a32e6c53d`を基準に、
`config/nfr-registry.json`、`analyzeNfrRegistry`、`parseNfrRegistry`、
`admitNfrRegistryMigration`、`checkNfrRegistry`、U-NFRREG-001..017、
IT-NFRREG-001..003を採取する。PR #621 final HEAD `728f6b4f47f90bf1495c5e82402abe25601b4c0f`は
current-head独立reviewとharness-check successを持つ。

観測した実装責務は、typed declarationのstrict構造検査、source digest／repository realpath境界、
stable-ID revision migration admission、read-only doctor reportingである。network、command execution、
DB mutation、threshold評価、probe実行、履歴保存は含まれない。

## R0 境界

- #219／HR-NFR-REG-001..003だけを対象にする。
- #220のmeasurement evaluation／threshold verdictを対象外とする。
- #221のprobe execution／history／DB保存を対象外とする。
- #223のfinding disposition／GitHub mutationを対象外とする。
- R0では設計をconfirmedへ昇格させず、R1の反証、R2のAs-Is設計、R3のIssue意図、R4のForward再入を未成立として維持する。

## R1 skip判定

`confirmed_reverse_type: design`はrequirements §3.3でR1 skip対象である。R0で採取した実装を
`workflow_phase: R1`へ偽装せず、schema、authority、digest、migration、doctorの正負oracleはR2の
As-Is照合入力として実測した。`npm exec vitest run tests/nfr-registry.test.ts
tests/nfr-registry-doctor.test.ts`は20/20 green、`npm exec tsc -- --noEmit`はexit 0だった。

## R2 As-Is設計

L4のdeclaration SSoT、pure analyzer、migration admission、read-only doctor adapterの4責務は、
`config/nfr-registry.json`、`src/requirements/nfr-registry.ts`、
`src/doctor/nfr-registry-check.ts`の実装境界と一致する。registryはthreshold verdictやprobe実行、
履歴保存、DB mutationを持たず、Issue #220／#221／#223の責務を取り込んでいない。

L5のroot 3 field、entry 24 field、quality taxonomy、authority role／layer、repo-relative realpath、
source digest、stable-ID revision migrationの契約は、U-NFRREG-001..017の反例へ到達する。
L6のpublic functionとdoctor exactly-once配線はIT-NFRREG-001..003へ一致し、missing config、invalid JSON、
required trace partialをgreenへ縮退しない。従ってL4〜L6とL8／L9は`preserve`と判定する。

## R3 意図照合

Issue #219のBehavior contractは、全NFRをstable ID、quality characteristic、source authority、
measurement context、limit、probe、oracle、owner、evidence、remeasure triggerへ正規化し、標準品質と
AI固有品質を分類することである。PR #621のproduction registryは`HR-NFR-REG-001..003`をexact required
traceとして持ち、unknown ID／quality、authority欠落、実装方式混入、context／owner／oracle欠落、
重複正本をstable findingで拒否するため、この意図と一致する。

Issue bodyが明示する後続責務は別Issueへ維持する。#220はfreshness／threshold verdict、#221はprobe
execution／metric history、#223はalertからIncident／Recoveryへのrouting、#231はmeasurement contract付き
Performance Refactorである。#219のregistryへこれらの実行・永続化・routing責務を先取りしない。

## R4 Forward再入

R0〜R3でrequirements、L4〜L6、L8／L9、merged implementation間に新しい意味差分は見つからなかった。
全backprop scopeを`preserve`、`promotion_strategy: reuse-as-is`、`forward_routing: gap-only`とする。
Forward再入先は依存順に#220→#221であり、#223／#231は#219完了後に独立routeとして進める。

本branchではR4観測結果だけをdraftでmergeする。独立review後の確認laneでのみ、本Reverse PLANを
`status: confirmed`へ遷移し、`PLAN-L7-550`の`backfill_state: complete`と本Reverseへの双方向linkを
同一原子変更で確定する。それまではIssue #219のterminal closureを主張しない。
