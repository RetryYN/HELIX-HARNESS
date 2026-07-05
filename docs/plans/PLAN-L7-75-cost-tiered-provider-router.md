---
plan_id: PLAN-L7-75-cost-tiered-provider-router
title: "PLAN-L7-75 (impl): cost-tiered dual-provider role router (§7.8.7.1 / §1.8 / FR-L1-39)"
kind: impl
layer: L7
drive: agent
parent_design: docs/design/harness/L6-function-design/function-spec.md
status: confirmed
created: 2026-06-17
updated: 2026-06-17
owner: PM (Opus) / PO (人間)
review_evidence:
  - reviewer: claude-opus-4-8
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-17"
    tests_green_at: "2026-06-17"
    verdict: pass
    scope: "Cost-tiered dual-provider role router: 3 archetype (consult/worker/verify) × 3 tier (T0/T1/T2) × 2 provider (claude/codex). Hard invariants — archetype decides tier band, workers can never resolve to T0 (opus/gpt-5.5) fail-close, T0 is an explicit-permission gate (designated role + auth), primary provider (currentRuntime) drives cross-branch and GPT is symmetric to Claude. Composes existing classifyTask (FR-L1-39) + inferTaskDifficulty + detectMode. PM verified via tsc, Biome, 9 Vitest cases (archetype→tier, worker fail-close, T0 gate, difficulty T2↔T1, risk override, cross-branch, GPT symmetry), CLI smoke (task route/roster), and doctor."
    worker_model: claude-opus-4-8
    reviewer_model: claude-opus-4-8
agent_slots:
  - role: tl
    slot_label: "TL - cost-tiered provider router over existing classify/detect contracts"
generates:
  - artifact_path: docs/plans/PLAN-L7-75-cost-tiered-provider-router.md
    artifact_type: markdown_doc
  - artifact_path: src/task/tier-router.ts
    artifact_type: source_module
  - artifact_path: tests/tier-router.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-72-task-classify-cli.md
  requires:
    - docs/governance/helix-harness-requirements_v1.2.md
    - docs/adr/ADR-001-helix-harness-redesign-and-language.md
  references:
    - src/task/classify.ts
    - src/team/model-policy.ts
    - src/runtime/detect.ts
related_l0: docs/governance/helix-harness-concept_v3.1.md
related_l0_extra: docs/design/harness/L1-requirements/functional-requirements.md
---

# PLAN-L7-75 (impl): コスト階層型 dual-provider role router

## 0. 目的

PO 確認済みの routing model を実装し、provider model のコストを通常は低く保ちつつ、
frontier models は明示承認された judgement に限定する。roster（§1.8
VALID_ROLES）、hybrid runtime separation MUST（§7.8.7.1）、既存 task
classifier（FR-L1-39）を 1 つの router に結合する。

## 1. 問題

CLI/team-dispatch surface には tier discipline が無く、difficulty inference によって
model selection が opus/gpt-5.5 に到達できた（A-137 / HELIX
`BLOCKED_SELF_DELEGATION` reference に対して audit された gap）。対称な Codex
roster、worker→frontier fail-close、frontier models の explicit-permission gate が
存在しなかった。

## 2. スコープ

既存 contracts を合成する新規 `src/task/tier-router.ts` を追加する（`task→team`
import edge を one-directional / acyclic に保つため `src/task/` 配下に配置）。

- 3 archetype（`consult` / `worker` / `verify`）を role ごとに対応付ける。
  対応は `tl/uiux=consult`、`qa=verify`、`se/docs=worker` とする。
- 3 tier × 2 provider の対応表を持つ（T0 opus/gpt-5.5、T1 sonnet/gpt-5.4、
  T2 haiku/gpt-5.3-codex-spark）。Codex は Claude と対称に扱う。
- `tierFor`（archetype が band を決定し、worker band は difficulty + risk で
  T2↔T1）、`resolveModel`（worker→T0 は throw する fail-close invariant）、
  `route`（T0 explicit-permission gate を持つ difficulty router）、`assignCross`
  （primary→other cross-branch）、`roster`（10-binding の対称 view）。
- `helix task route` / `helix task roster` CLI surface を追加する。`route` は
  `assignCross` を decision（`cross` field）へ接続し、`currentRuntime` から
  cross-provider switch（hybrid では creation=primary / judgement=other、それ以外は
  intra_runtime_subagent）を自動導出する。CLI では `switch=<exec>>(<judge>)`
  として表示する。
- Role placement（cross connection）: `route` は worker roles を execution provider
  （primary）へ、consult/verify roles を judgement provider（hybrid では other）へ配置し、
  role の model が実際に稼働する provider 上で解決されるようにする。hybrid では
  `assignCross` が implementation≠review provider separation を明示的に強制する
  （fail-close、PO directive）。
- Decision→execution bridge: `routeToAdapterPlan(decision, task, mode)` は ready
  decision を配置先 provider の adapter invocation（command/args）へ変換し、blocked
  （T0-gated）decision では null を返す。`helix task route --execute`
  （dry-run command）で公開する。
- Team integration（`helix team run --route`）: `routeTeamMembers` は各 team member
  を router に通し、CLI は decisions を member ごとの `MemberPlacement`（provider /
  tier model / frontier-gate `blockedReason`）へ写して `buildTeamRunPlan` に注入する。
  この placement は YAML engine default を上書きするため、team の実際の member spawn は
  cross placement（worker=primary / consult-verify=other）と cost-tiered model によって
  駆動される。T0 reviewer members は fail-close する（`--allow-frontier` が必須）。
  `validateTeamRun` は placed providers を検証し、hybrid worker≠reviewer separation を
  維持する。router は `src/task/` 配下に置き、`team→task` import ではなく CLI
  composition root で接続するため、`task→team` edge は one-directional / acyclic に保たれる。
- 全 invariant を Vitest で covered にする。

Follow-up は 2026-06-17 に完了済み。`model-policy.ts` の frontier model id を
reconcile（codex `gpt-5.4` → `gpt-5.5`）し、legacy `selectTeamModel` の
"frontier" family が `TIER_TABLE.T0`（frontier ids の single source）と一致するようにした。
L6 function-spec back-fill も追加済み（function-spec.md "2026-06-17 Cost-Tiered
Dual-Provider Role Router Addendum"、U-TIER-001..015 contracts）。残る
out-of-scope item は無い。

Touched（新規 artifact ではなく既存 module の extension）: `src/team/run.ts`
（`MemberPlacement` と placement-aware `validateTeamRun`）、`src/cli.ts`
（`team run --route/--primary/--allow-frontier`）、`src/team/model-policy.ts`
（frontier id reconcile）、`tests/team-run.test.ts`（routing 済み cross-placement と
frontier の fail-close）、`tests/team-model-policy.test.ts`（frontier id）、
`docs/design/harness/L6-function-design/function-spec.md`（L6 back-fill）。

## 3. 受入条件

- `tierFor`: consult/verify は常に T0。worker は trivial/simple+no-risk なら T2、
  それ以外は T1。worker は T0 にならない。
- `resolveModel(worker, "T0", …)` は throw する（fail-close invariant）。
- `route` は、role が designated frontier role かつ `auth.explicit` 設定済みでない限り、
  T0 を block する（`model=null`、`blocked-needs-approval`）。
- Codex/GPT は Claude と対称である（全 role が両方の binding を持ち、同じ archetype）。
- `currentRuntime` が provider を選択する。`assignCross` は hybrid では judgement を
  other provider へ反転し、それ以外では intra_runtime_subagent にする。
- typecheck / Biome / Vitest / `helix doctor` は green を維持し、src はこの PLAN の
  `generates` に trace する。

## 4. 状態

Draft。2026-06-17 に実装・検証済み（Vitest U-TIER-001..015 + routed team-run cases +
CLI smoke）。`assignCross` は `route()` へ接続済みで、roles は cross provider
（worker=execution / consult-verify=judgement）へ配置される。hybrid は明示的な
impl≠review separation を強制し、`routeToAdapterPlan` は ready single-role decision を
provider adapter invocation（`helix task route --execute`）へ橋渡しする。team layer も接続済み。
`helix team run --route` は router から各 member の provider + tier model を導出し
（worker=primary / consult-verify=other）、`--allow-frontier` が無い T0 reviewers を
fail-close し、既存の slot-based member spawn を駆動する。2 件の follow-up は完了済みで、
model-policy frontier id は tier table と reconcile 済み、L6 function-spec は back-fill
済み（function-spec.md addendum）。残る out-of-scope item は無い。
