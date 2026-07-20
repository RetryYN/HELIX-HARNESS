---
plan_id: PLAN-L7-461-requirements-doc-registry
title: "PLAN-L7-461 (impl): 要件正本パスの registry 外部化 — lint gate の v1.2 ハードコード除去"
kind: impl
layer: L7
drive: agent
status: confirmed
route_mode: forward
entry_signals:
  - "po_directive:2026-07-20 修正しなさい、ハードコード禁止の原則で外部化するように"
created: 2026-07-20
updated: 2026-07-20
owner: Claude / TL
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-07-20T14:22:46Z"
  review_binding:
    reviewer: Codex TL independent review
    reviewed_at: "2026-07-20T14:22:46Z"
    evidence_digest: "sha256:3b26d19102635f3b80cdb3c73711ad7e1dc54495316920e45523305baecb97cf"
  entries: []
parent_design: docs/design/harness/L6-function-design/governance-enforcement.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-RDOCREG-001, test_path: tests/requirements-doc-registry.test.ts }
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: se
    slot_label: "SE — requirements-doc-registry loader と 6 lint consumer の移行実装"
  - role: tl
    slot_label: "TL — canonical/compatibility 二役 anchor 設計と behavior 不変性のレビュー"
generates:
  - artifact_path: docs/plans/PLAN-L7-461-requirements-doc-registry.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/requirements-doc-registry.json
    artifact_type: config
  - artifact_path: src/lint/requirements-doc-registry.ts
    artifact_type: source_module
  - artifact_path: src/lint/propagation.ts
    artifact_type: source_module
  - artifact_path: src/lint/scrum-reverse.ts
    artifact_type: source_module
  - artifact_path: src/lint/sub-doc-catalog-drift.ts
    artifact_type: source_module
  - artifact_path: src/lint/handover-resurrection.ts
    artifact_type: source_module
  - artifact_path: src/lint/s4-decision-readiness.ts
    artifact_type: source_module
  - artifact_path: tests/requirements-doc-registry.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L3-15-requirements-authority-chain-remediation.md
  requires:
    - docs/governance/helix-harness-requirements_v1.3.md
  references:
    - docs/plans/PLAN-L3-15-requirements-authority-chain-remediation.md
  blocks: []
review_evidence:
  - reviewer: Codex TL independent review
    review_kind: cross_agent
    reviewed_at: "2026-07-20T14:22:46Z"
    tests_green_at: "2026-07-20T23:20:00+09:00"
    verdict: pass
    worker_model: claude-code
    reviewer_model: gpt-5-codex
    scope: "requirements doc registry、6 consumer、配布bundle root解決、canonical L6/L8 oracle、authority digestを独立レビュー。Blocker/High 0。CI run 29748642488で全回帰とBiome lintがgreen、doctorは本review evidence未記録のみを検出したため、本entryで是正する。"
    green_commands:
      - { kind: unit_test, command: "npx vitest run --project fast tests/vmodel-pair.test.ts tests/ci-governance-self-heal.test.ts tests/design-coverage.test.ts tests/l12-hybrid-recognition.test.ts tests/requirements-doc-registry.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-07-20T22:14:10+09:00", evidence_path: tests/requirements-doc-registry.test.ts, output_digest: "sha256:fb3f3e159e0190c8446eb9854f71ccc02b6165d308a2702200aba976b22688f8" }
      - { kind: unit_test, command: "npm test", runner: node, scope: full, exit_code: 0, completed_at: "2026-07-20T23:19:00+09:00", evidence_path: tests/requirements-doc-registry.test.ts, output_digest: "sha256:89199170b79d4b4fbdf700b1bf69265b783e4002882acdcdfd7854ac1a8fe737" }
---

# PLAN-L7-461: 要件正本パスの registry 外部化

## §0 位置づけ

ルール伝達監査 (2026-07-20、memory key=`lint-gates-still-anchor-v1-2`) で、prose 面は v1.3 へ切替済みなのに
src/lint の複数 gate が `helix-harness-requirements_v1.2.md` をハードコード参照している乖離を検出した。
PO 指示「ハードコード禁止の原則で外部化」に従い、要件文書パスを単一 registry
(`docs/governance/requirements-doc-registry.json`) へ外部化し、lint は loader
(`src/lint/requirements-doc-registry.ts`) 経由で解決する。以後の正本切替は registry 1 ファイルの更新で完結する。

設計判断 (behavior 不変):

- registry は `canonical` (現行正本 = v1.3) と `compatibility` (supersede 済み参照 = v1.2) の二役を持つ。
- **v1.2 の章構成に内容依存する gate** (propagation §7.8.1 / sub-doc-catalog / scrum-reverse seed /
  handover-resurrection 台帳) は `compatibility` を参照し、gate 挙動を変えない。内容の v1.3 移行は
  各 gate の anchor 節が v1.3 へ整備された時点で registry 参照先を切り替える後続作業とする。
- **メタデータ参照** (s4-decision-readiness の sourceUrl) は `canonical` を指す。
- **除外**: `l3-progression-reviewed-digests` / `l3-progression-authority` / `l12-hybrid-reviewed-safe-v2` の
  path+digest ペアは「レビュー済みスナップショットの pin (data)」であり設定ではないため外部化対象外。
  schema/doctor コメント内の `requirements_v1.2 §` 表記は歴史的 cite として残置し、実行経路に影響しない。

## §工程表

### Step 1: registry + loader 実装 [直列]
- 直列理由 = **downstream_dependency** (Step 2 の consumer 移行は loader が前提)。
- `requirements-doc-registry.json` (schema v1、canonical/compatibility) と fail-close loader を実装。

### Step 2: consumer 移行 [直列]
- 直列理由 = **file_conflict** (複数 lint module を同一意図で一括変更、部分適用を残さない)。
- 対象6モジュール (`propagation` / `scrum-reverse` / `sub-doc-catalog-drift` / `handover-resurrection` /
  `s4-decision-readiness` / `g3-trace` コメント) を registry 経由へ移行し、実行経路の直書き参照を 0 件にする。

### Step 3: test [直列]
- 直列理由 = **downstream_dependency** (Step 2 の成果物を検証)。
- `tests/requirements-doc-registry.test.ts` (registry 実在 / schema 検証 / consumer 一致 / fail-close) を新設。
  合成 fixture (scrum-reverse) へ registry を追加し、s4 の sourceUrl 期待値を canonical へ更新。

### Step 4: review 前置 [直列]
- 直列理由 = **downstream_dependency** (Step 3 green が前提)。
- branch + PR + CI `harness-check` green + auto-merge (PO 運用 2026-07-20)。cross-runtime review evidence を記録。

## §受入条件 (falsifiable AC)

- AC-1: `grep -rn "helix-harness-requirements_v1.2.md" src/ --include="*.ts"` の hit が digest pin
  (l3-progression-reviewed-digests / l3-progression-authority / l12-hybrid-reviewed-safe-v2) と
  plan lint-policy 台帳を除き 0 件である。
- AC-2: `npx vitest run tests/requirements-doc-registry.test.ts` green (4 case、fail-close 含む)。
- AC-3: 既存 gate の挙動不変 — propagation / scrum-reverse / sub-doc-catalog / handover-resurrection /
  s4 / g3-trace の既存テストが green のまま。
- AC-4: `helix doctor` exit 0、digest-inventory 再生成済み。

## §6 用語更新 (§G.9)

- 新規語: 「requirements-doc-registry (要件正本パス登録簿)」。
