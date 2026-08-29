---
plan_id: PLAN-RECOVERY-62-event-projection-checkpoint-replay-reachability
title: "PLAN-RECOVERY-62 (recovery): event projection／checkpoint replay failure reachability是正"
kind: recovery
layer: cross
drive: agent
status: draft
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - "po_directive:Issue #503で検出したevent projection／checkpoint replayの到達不能failure分岐をL6着手前に是正する"
created: 2026-08-10
updated: 2026-08-10
owner: Codex / TL
github_issue_id: 503
engineering_discipline_required: true
behavior_contract_id: EVENT-PROJECTION-CHECKPOINT-REPLAY-001
responsibility_owner: event-projection-checkpoint-replay
change_slice: atomic
refactor_step: not_applicable
legacy_retirement_state: not_applicable
no_code_decision: modify
ddd_modeling_decision: pure_function
contract_preconditions: "親PLAN-L5-98が#215のadd-design authorityとしてMIC-FR-001へtrace済みであり、L5/L8 pairだけを変更する。Issue #503の実装禁止境界を維持し、L6 runtime、DB、CLI、workflowを追加しない"
contract_postconditions: "payload_digest単独欠落と他のexact-set不一致を先着順序で分離し、snapshot内部lane不整合、未知lane membership、別のknown laneをそれぞれEVENT_PROJECTION_DRIFT／EVENT_ORPHAN_LANE／EVENT_PROJECTION_DRIFTへ一意に到達させる。L8 canonical oracleはU-EPR-001..102のexact setになる"
contract_invariants: "MIC-FR-001は親requirement traceとして保持する。PLAN-L5-98のkind、route_mode、github_issue_id、tdd_red_requiredを#503へ転用しない。knownLaneIdsは#213 work graph由来の入力であり第二registryを作らず、existing runtimeや実装完了を主張しない"
contract_failures: "payload_digest欠落がEVENT_ENVELOPE_INVALIDへ先着する、missing+unknownがEVENT_ENVELOPE_INCOMPLETEへ相殺される、snapshot内部lane不整合がorphanへ誤分類される、未知laneがdriftへ先着する、別known laneがorphanへ誤分類される、U-EPR exact setの欠落・重複をfail-closeする"
tdd_red_required: true
implementation_allowed: false
complexity_effect: net_negative
complexity_justification: "新しいruntime、schema、registry、gateを作らず、既存8 pure function契約の判定順序とL8 oracleだけを実装可能な形へ収束させる。到達不能な設計分岐による後続L6の手戻りを除去する"
removal_trigger: "not_applicable: 本PLANはIssue #503の設計Recovery履歴であり、親add-design PLANまたは後続L6実装PLANへ吸収して削除しない"
irreversible_impact: none
parent_design: docs/design/helix/L5-detail/event-projection-checkpoint-replay.md
pair_artifact: docs/test-design/helix/L8-event-projection-checkpoint-replay-unit-test-design.md
agent_slots:
  - { role: aim, slot_label: "AIM — payload／orphan failure判定順序と親requirement trace境界" }
  - { role: qa, slot_label: "QA — U-EPR-001..102 exact setと到達witness／ordering mutation" }
  - { role: tl, slot_label: "TL — #215 add-design authorityと#503 Recovery episodeの分離" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-62-event-projection-checkpoint-replay-reachability.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-L5-98-event-projection-checkpoint-replay.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L5-detail/event-projection-checkpoint-replay.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-event-projection-checkpoint-replay-unit-test-design.md, artifact_type: test_design }
dependencies:
  parent: docs/plans/PLAN-L5-98-event-projection-checkpoint-replay.md
  requires:
    - docs/plans/PLAN-L5-98-event-projection-checkpoint-replay.md
    - docs/design/helix/L4-basic-design/event-projection-checkpoint-replay.md
  blocks:
    - issue:215
---

# PLAN-RECOVERY-62: event projection／checkpoint replay failure reachability是正

## 1. authority境界

本PLANはIssue #503のRecovery episodeだけを所有する。親`PLAN-L5-98`はIssue #215からL5/L8 pairを
降下したadd-design authorityであり、`MIC-FR-001`を親requirement traceとして保持する。PRの原子契約は
本PLANの`EVENT-PROJECTION-CHECKPOINT-REPLAY-001`を使い、親PLANの`route_mode: add-feature`、
`github_issue_id: 215`、`tdd_red_required: false`をRecovery metadataへ書き換えない。

`implementation_allowed: false`を維持し、変更する意味成果物は次の3件に限定する。4件目の本PLANは
Recovery episodeとPR scopeを束縛する管理成果物であり、runtime実装ではない。

1. `docs/design/helix/L5-detail/event-projection-checkpoint-replay.md`
2. `docs/test-design/helix/L8-event-projection-checkpoint-replay-unit-test-design.md`
3. `docs/plans/PLAN-L5-98-event-projection-checkpoint-replay.md`

## 2. Redとなった設計反例

### 2.1 payload失敗理由の先着順序

旧順序は11 field exact set不一致を先に`EVENT_ENVELOPE_INVALID`へ分類したため、`payload_digest`の
キーだけを落とすU-EPR-012が`EVENT_ENVELOPE_INCOMPLETE`へ到達できなかった。反対に
`payload_digest`欠落とunknown field追加を同時に持つ入力を片肺へ先着させると、U-EPR-013／022の
exact-set相殺拒否が崩れる。

是正後は、object検査 → `payload_digest`だけを除いたexact 10 field → その他のkey set不一致 →
payload値形式、の順とする。これにより、単独key欠落は`EVENT_ENVELOPE_INCOMPLETE`、
missing+unknown substitutionは`EVENT_ENVELOPE_INVALID`へ一意に到達する。

### 2.2 orphan laneの実在集合照合

旧順序は`identity.lane_id`を含むidentity比較をorphan判定より先に置いたため、通常のlane不一致fixtureが
必ず`EVENT_PROJECTION_DRIFT`へ先着し、U-EPR-053の`EVENT_ORPHAN_LANE`が到達不能だった。

是正後は、各snapshotのtop-level／nested lane内部整合 → #213 work graph由来`knownLaneIds`への
membership → identity差分 → state差分、の順とする。内部不整合はdrift、内部整合した未知laneはorphan、
内部整合した別known laneはidentity driftとなり、壊れたsnapshotだけでorphanを成立させない。

## 3. L8 oracleの完全一致集合

canonical unit oracleは`U-EPR-001..102`の連続exact setとし、各IDをoracle一覧とeligible束縛表へ
exactly onceずつ置く。特に次を独立に固定する。

- U-EPR-012／013／015／016／022／088: key欠落、unknown相殺、empty／非sha、payload-onlyの
  判定順序が互いを相殺しない。
- U-EPR-053／101／102: 未知lane、snapshot内部不整合、別known laneの3境界を別reasonへ到達させる。
- U-EPR-089..100: 下流探索で採取したexact-set、時刻、scope、budget、correlation、replay端点の反例を
  既存8関数／19 failure code内へbackpropし、新しいownerやruntimeを追加しない。

## 4. 後続境界

本Recoveryの完了後にのみ、後続L6/L7 PLANをdispatchできる。本PRでは
`tests/event-projection-checkpoint-replay.test.ts`やruntime moduleを作らない。source mutantによる
failure branch killとDesign Reality Bindingの実装接続はIssue #504へ分離し、本PLANの設計greenを
runtime実装greenとして扱わない。

## 5. 完了条件

- payload／orphanの各failureへ、schemaを壊さない到達witnessが存在する。
- `knownLaneIds`は#213 work graph入力の再利用であり、第二registryを作らない。
- U-EPR-001..102が欠落・重複なく両表へexactly onceずつ現れる。
- changed semanticsは3文書、新規episode管理は本PLANの合計4 pathに限定される。
- targeted design tests、PLAN lint、PR scope分析、`git diff --check`がgreenである。
- authoring runtimeと異なる独立AI-Bがexact candidate HEADをreviewし、blocker 0になるまで
  `status: draft`を維持する。

## 6. 検証コマンド

- `npx --no-install vitest run --project fast tests/design-language.test.ts tests/design-reality-binding.test.ts tests/design-coverage.test.ts tests/sub-doc-section-structure.test.ts tests/doc-consistency.test.ts tests/plan-lint.test.ts tests/plan-entry-routing.test.ts`
- `npx --no-install tsx src/cli.ts plan lint docs/plans/PLAN-RECOVERY-62-event-projection-checkpoint-replay-reachability.md`
- `git diff --check origin/main...HEAD`
