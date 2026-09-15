---
plan_id: PLAN-M-00-verify-cutover
title: "PLAN-VERIFY-CUTOVER-00: L8-L14 verification band + legacy-source isolation backfill"
kind: design
layer: L14
drive: fullstack
status: completed
created: 2026-06-11
updated: 2026-06-11
owner: Codex TL / PO
master_hub: true
agent_slots:
  - role: tl
    slot_label: "TL - verification/cutover roadmap descent owner"
  - role: qa
    slot_label: "QA - L8-L14 verification band acceptance reviewer"
generates:
  - artifact_path: docs/plans/PLAN-M-00-verify-cutover.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-M-01-cutover-backfill.md
    artifact_type: markdown_doc
  - artifact_path: .helix/audit/A-132-l8-l14-verification-band-execution.md
    artifact_type: markdown_doc
roadmap:
  layer: L14
  gates:
    - id: G-VERIFY.A
      name: L8-L14 verification roadmap registration
      exit_criteria: "L8-L14 verification band is represented by a confirmed master roadmap; the roadmap registry covers the verification program band without relying on parked status."
    - id: G-VERIFY.B
      name: verification to cutover bridge
      exit_criteria: "Legacy-source isolation backfill is represented by a registered cutover roadmap and program rollup can surface 5/5 covered bands."
  spans:
    - plan_id: PLAN-M-00-verify-cutover
      after_gate: entry
      before_gate: G-VERIFY.A
    - plan_id: PLAN-M-01-cutover-backfill
      after_gate: G-VERIFY.A
      before_gate: G-VERIFY.B
dependencies:
  parent: null
  requires:
    - docs/plans/PLAN-REVERSE-44-roadmap-definition-design.md
    - docs/plans/PLAN-L7-44-harness-db-master.md
  references:
    - docs/governance/helix-harness-concept_v3.1.md
    - docs/governance/helix-harness-requirements_v1.2.md
    - docs/adr/ADR-001-helix-harness-redesign-and-language.md
    - .helix/audit/A-130-harness-db-segment-accept.md
    - .helix/audit/A-131-recovery-04-closure-accept.md
    - .helix/audit/A-132-l8-l14-verification-band-execution.md
review_evidence:
  - reviewer: codex-intra-runtime-review
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-11"
    tests_green_at: "2026-06-11"
    verdict: pass
    scope: "PLAN-VERIFY-CUTOVER-00 completion: verification band roadmap registration, cutover backfill route registration, roadmap rollup 5/5 coverage, harness.db L8-L14 local execution rows, and stale handover replacement. Production deploy, PO UAT signoff, and destructive cutover are not performed by this local verification band. Cross-agent review unavailable in current Codex-only execution; intra-runtime review used as documented fallback."
    worker_model: codex-gpt-5
    reviewer_model: codex-gpt-5-intra-runtime-review
---

# PLAN-VERIFY-CUTOVER-00: L8-L14 verification band と legacy-source isolation backfill

## 0. 位置づけ

この PLAN は、PLAN-REVERSE-44 で意図的に parked とされた次の 2 つの band を閉じる。

- verification: L8-L14 right-arm verification 作業は、Forward roadmap が存在しなかったため parked とされていた。
- cutover: legacy-source isolation は、ADR-001 と harness.db close の後に以前の strategy document が stale になったため parked とされていた。

ここでの completion は、これらの band が見えない parked work ではなくなり、local L8-L14 verification execution が `harness.db` に記録されることを意味する。production deploy、L8-L14 の PO final acceptance、destructive cutover を意味しない。それらは、この local band の外側にある human-signoff / prod-scope activity として残る。

## 1. 完了 contract

- `PROGRAM_BANDS.verification` は、この master roadmap (`roadmap.layer: L14`) で covered になる。
- `PROGRAM_BANDS.cutover` は、`PLAN-M-01-cutover-backfill` (`roadmap.layer: cutover`) で covered になる。
- `roadmap-rollup` は、5 つすべての program band が covered であり、parked または uncovered の band が残らないことを報告できる。
- cutover stale-doc problem は、audit carry のまま残さず、具体的な backfill artifact へ route される。
- Handover は、すでに closed の L6 frontier ではなく、この close 後の次の executable action を指す。
- `harness.db` は、7 件の L8-L14 `workflow_runs`、対応する 7 件の `gate_runs`、および program coverage / reached gates / review evidence の `coverage` row を記録する。
- `.helix/audit/A-132-l8-l14-verification-band-execution.md` は、local execution boundary を記録し、production deploy / post-deploy observation を明示的に out of scope とする。

## 3. 工程表

### Step 1: [直列] verification band roadmap 登録

直列理由: downstream_dependency。

この PLAN を L8-L14 verification band host として登録する。この band は、integration / system / UX / UAT / deployment acceptance / post-deploy verification / operational feedback にまたがる right-arm verification execution planning を表す。

### Step 2: [直列] cutover backfill route 登録

直列理由: downstream_dependency。

対になる cutover roadmap (`PLAN-M-01-cutover-backfill`) を作成し、この master が 2 番目の verification gate を通じてそれに依存するようにする。この route により、stale cutover strategy doc を free-form carry から registered roadmap item へ変換する。

### Step 3: [直列] machine verification

直列理由: downstream_dependency。

roadmap、doctor、review-evidence、DB projection の check を実行する。必要な evidence は次のとおり。

- `tests/roadmap.test.ts` は、実 repository rollup が verification と cutover を covered として持つことを証明する。
- `tests/projection-writer.test.ts` は、実 repository rebuild が L8-L14 execution row を `harness.db` へ出力することを証明する。
- `bun run src/cli.ts doctor` は、frontier なしの `roadmap-rollup` を表示する。
- `review-evidence` は、confirmed design plan に対して OK のままである。

### Step 4: [直列] review と handover

直列理由: shared_state。

intra-runtime review evidence を記録し、次の action がこの PLAN の先を指すように `.helix/handover/CURRENT.json` を更新する。

## 3.1 実装計画

- 既存 roadmap registry の test coverage 以外に、新しい TypeScript feature behavior は不要である。
- 実装は現在の `roadmap.layer` string matching を使う。`roadmap.layer` はすでに任意の string を受け取り、`PROGRAM_BANDS.cutover.layers` は `cutover` を含むため、schema migration は不要である。
- `PARKED_BANDS` は historical defer reason として残ってよい。covered band は parked classification より優先されるため、registered verification/cutover roadmap により `parkedBands=0` となる。
- Rollback は document-only とする。registration が時期尚早と判断された場合は、この 2 つの PLAN file と追加 test を削除する。

## 4. DoD

- [x] L8-L14 verification band は confirmed roadmap host を持つ。
- [x] Legacy-source isolation は confirmed backfill roadmap host を持つ。
- [x] Program rollup は、parked または uncovered の band が無い状態で 5/5 covered band を証明できる。
- [x] `harness.db` rebuild は L8-L14 verification execution row を記録する。
- [x] A-132 audit evidence は local execution result と production/PO boundary を記録する。
- [x] Stale handover next action は置き換え済みである。
- [x] vendor source または legacy runtime source は編集されていない。
