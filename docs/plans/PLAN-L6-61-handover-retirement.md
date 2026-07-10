---
plan_id: PLAN-L6-61-handover-retirement
title: "PLAN-L6-61 (add-design): handover 機構の廃止設計 — CURRENT.json / helix handover の retirement と harness memory への責務移管"
kind: add-design
layer: L6
drive: be
status: draft
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-11 /goal「ハンドオーバーの課題を突き詰めてハンドオーバーを廃止してハーネスメモリを強化する方向で進めたい」（2026-07-07 の『廃止ではなく DB 導出化で縮小』judgment を PO 自身が廃止へ方向転換）"
created: 2026-07-11
updated: 2026-07-11
backprop_decision: required
backprop_decision_reason: "POがsession/prose handover廃止を再確定したため、handover必須・DB+log+handover 3層原則・CURRENT.json/CLI契約を保持するconfirmed L0-L5正本を、DB+memory継続状態へReverse backpropする必要がある。PLAN-REVERSE-344を先行し、旧契約を残したままL6だけでretirementしない。"
owner: Claude (Fable) / PO (人間)
parent_design: docs/design/harness/L6-function-design/handover-db-derivation.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: se
    slot_label: "SE — 消費面 retirement 手順と takeover note の memory 移管契約の設計"
  - role: tl
    slot_label: "TL — rule-drift marker 同期・移行順序・rollback・PO confirmation gate 境界のレビュー"
generates:
  - artifact_path: docs/plans/PLAN-L6-61-handover-retirement.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L6-function-design/handover-retirement.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L8-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L6-01-function-spec.md
  requires:
    - docs/plans/PLAN-L6-57-handover-db-derivation.md
    - docs/plans/PLAN-REVERSE-344-session-handover-retirement-backprop.md
  references:
    - docs/governance/handover-retirement-memory-audit-2026-07-11.md
    - docs/plans/PLAN-L6-62-harness-memory-structure.md
    - docs/plans/PLAN-L6-63-feedback-lifecycle.md
    - docs/plans/PLAN-L6-64-memory-cross-runtime-surface.md
    - docs/plans/PLAN-L7-396-handover-derivation-wiring.md
    - src/handover/index.ts
---

# PLAN-L6-61 (add-design): handover 機構の廃止設計

## 起点 signal

- PO 指示（2026-07-11 /goal）: handover の課題を突き詰め、**廃止**して harness memory を強化する。
  2026-07-07 時点の判断（PLAN-L6-57「メモリと handover は時間スケールが異なり両方必要、DB 導出化で
  縮小」）を PO 自身が方向転換した。L6-57 の成果（DB 導出 snapshot）は無効化ではなく本廃止の土台に
  なる（機械状態は既に DB 正本 = 廃止しても情報は失われない）。

## 0. 現状と gap（課題台帳の要約）

正本 = `docs/governance/handover-retirement-memory-audit-2026-07-11.md` §2。要点:

- CURRENT.json は 311,927 bytes（実測）の DB read-model file キャッシュと化しており、固有情報は
  takeover_note 1 欄のみ（H1/H8）。
- 手書き系 drift は「敵対検証で patch 不可」（PLAN-L7-145）が確定済みで、防衛 PLAN が 18 本まで
  積み上がった（H2/H6）。prose 転記は実在しない判断を残す（H3、PLAN-L7-98）。
- 指示面が 4 面に分散し、~/.codex/AGENTS.md は既に実在しない識別子を指して腐っている（H7）。

## 1. スコープ（L6 機能設計で確定する事項）

1. **消費面 retirement 契約**: audit §2.3 の 8 消費面（`helix handover` CLI・`src/handover/`・
   Stop hook 再生成・doctor staleness surface・handover discipline lint・CURRENT.json・
   `docs/handover/` 運用・`helix plan complete` 連携）それぞれの撤去 or 吸収先を確定する。
   機械状態の render が必要な箇所は `helix status` / SessionStart surface（DB 直読）へ一本化する。
2. **takeover note の移管契約**: CURRENT.json の takeover_note を harness memory の短寿命層
   （PLAN-L6-62 の takeover layer、one-shot consumed）へ移す書込・surface・消費規則を定義する。
3. **provider 委譲 evidence の帰属整理**: `.helix/handover/provider/*.json` を session 引き継ぎ概念から
   分離し audit evidence として帰属（存置 or `.helix/audit/` 配下移設）を決定する。PLAN-M-02 の
   識別子凍結（`.helix/` rename 禁止）に抵触しない範囲に限定する。
4. **指示面と rule-drift marker の同期設計**: CLAUDE.md / .claude/CLAUDE.md / AGENTS.md /
   ~/.codex/AGENTS.md の handover 記述と Adapter Rule Markers「引き継ぎ: `helix handover`」の
   置換内容（memory 参照規約への差し替え）を、rule-drift gate が green のまま atomic に行える
   変更セットとして設計する。
5. **移行順序と rollback**: 受け皿（L6-62/63/64 の L7 descent 着地）→ 並行期間（生成は継続・参照は
   memory へ）→ 撤去 slice、の段階設計。各段階の検証 oracle と rollback 手順を定義する。
6. **`docs/handover/` の archive 方針**: 既存 session-handover md 14 本の archive 先と、以後の
   session 引き継ぎ記録を memory + DB に限定する規約。

## 2. 対象外

- feedback_events の正本地位・schema 変更（PLAN-L7-110 の意味論は維持。lifecycle は PLAN-L6-63）。
- harness memory の構造変更そのもの（PLAN-L6-62）と cross-runtime 注入（PLAN-L6-64）。
- CLI `helix` / `.helix/` の識別子 rename（PLAN-M-02 の cutover 承認まで凍結）。
- 実装（後続 L7 PLAN。plan-descent gate に従い本 L6 pair 確定後に起票）。
- provider delegation evidence、開発から運用への引継ぎ成果物。これらはsession/prose handoverと別型であり、
  `provider_evidence` / `operations_transition`として保持する。

## 3. スケジュール（schedule steps）

- step 1 (mode: serial): PLAN-REVERSE-344でL0-L5のhandover必須意味をDB+memory継続状態へbackpropする。
- step 2 (mode: serial): 受け皿 3 PLAN（L6-62/63/64）の設計・実装証拠を確認する（依存順序）。
- step 3 (mode: serial): L6 機能設計 doc + L8 unit test design pair 追記（撤去 slice ごとの oracle）。
- step 4 (mode: serial): レビュー（別 runtime または intra_runtime_subagent）→ 是正。
- step 5 (mode: serial): PO confirmation（2026-07-11「ハンドオーバーは廃止した」）をdecision evidenceとして束縛→
  L7 実装 PLAN 起票。

## 4. 受入条件

- L6 設計 doc が §1 の 1..6 を撤去 slice 単位の oracle 付きで規定し、pair test-design と 1:1。
- rule-drift gate が設計した変更セット適用後も green であることを oracle として明記。
- `bun run src/cli.ts plan lint docs/plans/PLAN-L6-61-handover-retirement.md` green。
- 撤去実行は本 PLAN の範囲外（後続 L7 PLAN + PO 承認後）。
