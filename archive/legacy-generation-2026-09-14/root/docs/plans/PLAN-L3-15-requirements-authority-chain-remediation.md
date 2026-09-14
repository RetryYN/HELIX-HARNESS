---
plan_id: PLAN-L3-15-requirements-authority-chain-remediation
title: "PLAN-L3-15 (add-design): requirements v1.3 正本チェーン接続とねじれ是正 (L3 rebaseline successor)"
kind: add-design
layer: L3
drive: agent
status: draft
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-20 工程はL3まで戻して要件ねじれをすべて改修する (harness memory key=requirements-nejire-fix-pending)"
created: 2026-07-20
updated: 2026-07-20
owner: Claude / TL
supersedes:
  - PLAN-L3-14-vmodel-canonical-authority-cutover
parent_design: docs/design/helix/L3-requirements/vmodel-canonical-authority-cutover.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL — 正本チェーン接続 (Read Order / README / L3 manifest) と back-reference 設計のレビュー"
  - role: po
    slot_label: "PO — v1.3 採用と v1.2 降格の confirmation gate 承認"
generates:
  - artifact_path: docs/plans/PLAN-L3-15-requirements-authority-chain-remediation.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-requirements_v1.3.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-requirements_v1.2.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/README.md
    artifact_type: markdown_doc
  - artifact_path: CLAUDE.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/l3-progression-authority-rebaseline-2026-07-19.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/plans/PLAN-L3-14-vmodel-canonical-authority-cutover.md
  requires:
    - docs/plans/PLAN-L3-14-vmodel-canonical-authority-cutover.md
    - docs/governance/l12-canonical-vmodel-direction-directive_v0.1.md
    - docs/governance/l3-progression-authority-rebaseline-2026-07-19.md
  blocks: []
review_evidence: []
---

# PLAN-L3-15: requirements v1.3 正本チェーン接続とねじれ是正

## §0 位置づけ

2026-07-20 のねじれ監査で、`helix-harness-requirements_v1.3.md` が L1-L12 canonical contract を自称し
concept v3.1 / gate-design / document-system-map から層正本として参照される一方、CLAUDE.md Read Order・
`docs/governance/README.md`・L3 progression authority manifest に未接続である正本二重化 (high) を検出した。
本 PLAN は PLAN-L3-14 (ZIP canonical authority cutover freeze) の正本チェーン接続漏れを是正する successor で
あり、`supersedes` を宣言する (errata 規律 PLAN-L7-89。L3-14 の cutover 承認自体は有効のまま、チェーン接続
未了という完了範囲の訂正)。

改修対象 (PO 判断 2026-07-20 の項目 (1)):

1. v1.3 の正本チェーン接続: CLAUDE.md Read Order / 正本 Docs、`docs/governance/README.md` 現行正本リスト、
   `l3-progression-authority-rebaseline-2026-07-19.md` manifest へ v1.3 の位置づけを明記する。
2. v1.2 冒頭バナーへ v1.3 への supersession back-reference (correction note) を追記する (双方向化)。
3. Windows smoke の着地: v1.3 (v1.2 由来) の「Windows smoke を追加する」宣言に対する CI wiring
   (compatibility gate、non-required) の要件 AC を v1.3 へ明文化する。
4. ADR-009/010 の Python 制約 (network default deny / DB path・credential・`.helix/` 非付与) を v1.3 の
   機械検証要件 (AC) として明文化し、doctor/test への接続点を定義する。

## §工程表

### Step 1: v1.3 正本チェーン接続 [直列]
- 直列理由 = **downstream_dependency** (Step 2 以降の back-reference / AC 追記は v1.3 の正本採否確定が前提)。
- CLAUDE.md Read Order・正本 Docs 一覧・`docs/governance/README.md`・L3 manifest へ v1.3 を登録し、
  v1.2 を compatibility reference へ降格した読込順を確定する。

### Step 2: v1.2 back-reference 追記 [並列]
- v1.2 冒頭バナーへ「successor = v1.3」の correction note を追記し、supersession を双方向化する。

### Step 3: Windows smoke / Python 制約の AC 明文化 [並列]
- v1.3 へ Windows compatibility smoke の CI wiring 要件と、ADR-009/010 Python 制約の falsifiable AC を追記する。

### Step 4: 機械検証 [直列]
- 直列理由 = **downstream_dependency** (Step 1-3 の成果物を検証)。
- `helix plan lint docs/plans/PLAN-L3-15-requirements-authority-chain-remediation.md` と `helix doctor`
  (plan-supersession / rule-drift / design-language gate) を green にする。

### Step 5: review 前置 [直列]
- 直列理由 = **downstream_dependency** (Step 4 green が前提)。
- 判断 gate は別 runtime (Codex) または `intra_runtime_subagent` 代替で review し、review_evidence を記録する。
  confirmation gate (v1.3 正本採用) は PO 承認。

## §受入条件 (falsifiable AC)

- AC-1: CLAUDE.md Read Order と `docs/governance/README.md` に v1.3 が現行正本として存在し、v1.2 の行に
  compatibility reference 降格が明記される (`grep` で検証可能)。
- AC-2: v1.2 冒頭バナーに `helix-harness-requirements_v1.3.md` への back-reference が存在し、
  `helix doctor` の plan-supersession / governance 系 gate が exit 0。
- AC-3: v1.3 に Windows smoke CI wiring の AC と ADR-009/010 Python 制約 AC が存在する (該当節の実在検証)。
- AC-4: `helix plan lint` exit 0、`helix doctor` exit 0。

## §6 用語更新 (§G.9)

- 新規語なし。「compatibility reference 降格」「back-reference」は既存 errata 規律 (PLAN-L7-89) の語彙を使う。
