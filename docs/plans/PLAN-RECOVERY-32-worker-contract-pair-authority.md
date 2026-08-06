---
plan_id: PLAN-RECOVERY-32-worker-contract-pair-authority
title: "PLAN-RECOVERY-32 (recovery): WCC L3/L10 pairのFR／AC／HAT exact graph authority機械検証"
kind: recovery
layer: cross
drive: agent
status: confirmed
route_mode: recovery
entry_signals:
  - "po_directive:2026-08-06 /goal順序指示 #416 WCC FR／AC／HAT pair authorityをexact graph化（parent #194, blocks #194）"
created: 2026-08-06
updated: 2026-08-06
owner: Claude / TL（PO承認必須）
engineering_discipline_required: true
behavior_contract_id: WCC-PAIR-AUTHORITY-001
responsibility_owner: worker-contract-pair-authority
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: policy
contract_preconditions: "worker-common-contract.md（L3）とworker-common-contract-acceptance.md（L10）がpair pathとして存在し、current WCC-FR-01..09／WCC-AC-01..07／HAT-WCC-01..09が両doc内に記述されている"
contract_postconditions: "FR↔AC↔HATのexact trace graphが機械抽出可能な記法で表現され、欠落・重複・extra・mistrace・allowlist stale・oracle/trace不一致をU-WCC-PAIR-001が全件fail-closeする"
contract_invariants: "FR/AC/HATの定義域（9/7/9）と既存のHIL-22 trace記述、§2 provider対応表のガバナンスAC/HAT（WCC-AC-06／HAT-WCC-05のFR無し）意味を変えない。JSON admissionやruntime実装を混載しない"
contract_failures: "AC→FR／HAT→FR／HAT→ACのedgeが未定義IDを指す、FRがACまたはHATに未被覆、ACがHATに未被覆、allowlist外のFR無しAC/HAT、§1 oracle表と§3 trace表のHAT集合不一致のいずれかでU-WCC-PAIR-001がredになる"
tdd_red_required: true
red_at: "2026-08-06T09:08:00Z"
green_at: "2026-08-06T09:11:36Z"
mutation_oracle_evidence: "tests/wcc-trace.test.ts の U-WCC-PAIR-001 とその周辺mutation-oracle 3本で検証。(1) HAT-WCC-09の対応FRを未定義WCC-FR-99へ差し替え→hatRefsUnknownFr／hatMistraceがred、(2) HAT-WCC-08のtrace行削除→acWithoutHat／frWithoutHat／hatOracleTraceMismatchがred、(3) HAT-WCC-08の対応FRを—へ→allowlist外unexpectedNoFrHatがred、をworktreeで実測（vitest 7 passed、mutation注入時fail）。"
complexity_effect: net_neutral
complexity_justification: "既存 g3-trace lint の範型を踏襲した pure抽出＋graph整合module 1本と test 1本を追加し、新runtime state/job/dependencyを増やさない。doc正規化はスラッシュ略記→明示IDの記法置換のみ"
removal_trigger: "WCC pairがJSON admission（#396／canonical Requirement JSON）へ正式接着され、trace authorityがJSON側で機械検証されるようになった時点で本md-graph検証を後継機構へ統合する"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-06T09:11:36Z"
  review_binding:
    reviewer: claude-intra-runtime
    reviewed_at: "2026-08-06T09:11:36Z"
    evidence_digest: "sha256:943a24fd2ad2b7877082057aa0f077b19da0d0fd8da575d5f5ea4aee8e1a576a"
  entries: []
parent_design: docs/design/helix/L3-requirements/worker-common-contract.md
pair_artifact: docs/test-design/helix/worker-common-contract-acceptance.md
verification_bindings:
  - { parent_design: docs/design/helix/L3-requirements/worker-common-contract.md, oracle_id: U-WCC-PAIR-001, test_path: tests/wcc-trace.test.ts }
agent_slots:
  - role: aim
    slot_label: "AIM — recovery route exact-graph authority実装"
  - role: tl
    slot_label: "TL — WCC pair exact-graph契約review"
  - role: qa
    slot_label: "QA — orphan/mistrace mutation-oracle回帰"
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-32-worker-contract-pair-authority.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/wcc-trace.ts, artifact_type: source_module }
  - { artifact_path: tests/wcc-trace.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L3-18-worker-contract-benchmark-promotion.md
  requires: []
  references:
    - docs/governance/l12-canonical-vmodel-direction-directive_v0.1.md
  blocks:
    - "issue:#194"
review_evidence:
  - reviewer: claude-intra-runtime
    review_kind: intra_runtime_subagent
    worker_model: claude-opus-4-8
    reviewer_model: claude-opus-4-8
    tests_green_at: "2026-08-06T09:11:36Z"
    reviewed_at: "2026-08-06T09:11:36Z"
    verdict: approve
    scope: "単一runtime運用時の代替証跡。exact-graph抽出のsection scoping・合成セル正規化・FR無しガバナンスallowlist・mutation-oracleのred実証をworktreeで検証。既存github-l3-trace-authority-hygiene（ID集合一致のみ）を退行させず graph edge検証を追加。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --project fast tests/wcc-trace.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-06T09:11:36Z", evidence_path: tests/wcc-trace.test.ts, output_digest: "sha256:6eddea9ba4ccdbde52425d5f0df7953a8142f5892bd5df05fcfcc566b6b8b3c7" }
---

# PLAN-RECOVERY-32: WCC L3/L10 pairのFR／AC／HAT exact graph authority機械検証

## 目的

Worker Common Contract（WCC）のL3要件 `docs/design/helix/L3-requirements/worker-common-contract.md` と
L10受入 `docs/test-design/helix/worker-common-contract-acceptance.md` の pair を、current
`WCC-FR-01..09`・`WCC-AC-01..07`・`HAT-WCC-01..09` の **exact trace graph** として機械検証可能にする。

既存 `tests/github-l3-trace-authority-hygiene.test.ts` は L3/L10 間の WCC-FR／WCC-AC の **ID集合一致**と
「HAT: 9件」文言だけを検査しており（件数と文言）、FR↔AC↔HAT の edge、欠落、重複、extra、mistrace は
証明していなかった。#194（外部worker共通admission）は本pairのclosureをblockするため、pair authorityを
exact graphとして固定する recovery を先行する。

本Issueでは JSON admission（#396）や runtime 実装（#213〜#215）を混載しない。

## 現状グラフ（HEAD確定・整合済み）

- AC→FR: AC-01→{FR-01,02} / AC-02→{FR-03,04} / AC-03→{FR-05,06} / AC-04→{FR-07} /
  AC-05→{FR-08} / **AC-06→{}（§2 provider対応表のガバナンスAC・FR無し）** / AC-07→{FR-09}
- HAT→FR/AC: H01,H02→FR-07/AC-04 / H03→FR-04/AC-02 / H04→{FR-01,02}/AC-01 /
  **H05→{}/AC-06（ガバナンスHAT・FR無し）** / H06→FR-03/AC-02 / H07→{FR-05,06}/AC-03 /
  H08→FR-08/AC-05 / H09→FR-09/AC-07
- 全FRが最低1つのAC・HATに、全ACが最低1つのHATに被覆され、orphan/mistrace 0。

グラフ自体はHEADで整合しているため、本recoveryは「整合をmmd記述からdriftさせない機械フェンス」を追加する
（将来のedit driftをfail-closeする）。

## 非対象

- WCC IDの定義域拡張・意味変更。
- 外部worker admissionのruntime実装（#194／#225〜#227）。
- canonical Requirement JSONへの接着（#396）。
- provider固有委譲面・sandbox実装。

## 変更

- `src/lint/wcc-trace.ts`（新規）: L3 §1 FR表・§3 AC表、L10 §1 oracle表・§3 trace表を section scoping で抽出し、
  AC→FR／HAT→FR／HAT→AC の edge を graph 化。重複・dangling ref・未被覆・allowlist外FR無し・
  allowlist stale・oracle/trace不一致を配列で返す（`analyzeWccTrace`）。
- `tests/wcc-trace.test.ts`（新規）: U-WCC-PAIR-001。全orphan/mistrace配列を空配列で厳密検証し、
  FR/AC/HAT定義域（9/7/9）と主要edgeをpin。加えて mutation-oracle 3本で red 実証。
- `docs/design/helix/L3-requirements/worker-common-contract.md`: §3 AC表の対応FRセルの
  スラッシュ略記（`WCC-FR-01/02` 等）を機械抽出可能な明示ID（`WCC-FR-01`, `WCC-FR-02`）へ正規化し、
  WCC-AC-06の対応FRセルをガバナンスAC（FR無し）と明示。ID定義域・意味は不変。
- `docs/governance/l3-rebaseline-g3-freeze-packet.md` / `tests/l3-g3-freeze-packet-v2.test.ts`:
  上記正規化に伴う worker-common-contract.md の reviewed digest を実ファイルへ同期。

## 完了条件

- U-WCC-PAIR-001 が green（fr=9, ac=7, hat=9, 全orphan/mistrace配列0）。
- seeded mutation（未定義FR参照／trace行削除／allowlist外FR無し）で U-WCC-PAIR-001 が red。
- 既存 `github-l3-trace-authority-hygiene` と `l3-g3-freeze-packet-v2` が green（退行なし）。
- targeted test・typecheck・harness-check が green。
