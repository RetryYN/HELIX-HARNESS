---
plan_id: PLAN-L3-30-design-registry-requirement-family-authority
title: "PLAN-L3-30 (add-design): Design Registry の要求 family authority を確定し screen intake を開通させる"
kind: add-design
layer: L3
drive: agent
status: draft
route_mode: add-feature
entry_signals:
  - "po_directive:2026-08-09 デザインハーネスを進めること（#177 の残論点 screen_trace family 写像）"
created: 2026-08-09
updated: 2026-08-09
owner: Claude / TL
github_issue_id: 177
behavior_contract_id: HR-FR-DHR-007
responsibility_owner: design-registry
parent_design: docs/design/helix/L3-requirements/design-registry-requirement-family-authority.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
pair_artifact: docs/test-design/helix/L3-design-registry-requirement-family-acceptance-test-design.md
agent_slots:
  - role: tl
    slot_label: "TL — 要求 ID authority の projection 方針と恒久／暫定の lifecycle 分離"
  - role: qa
    slot_label: "QA — 架空 ID・kind 偽装・stale catalog・parser 空集合の 4 経路を受入で塞ぐ"
review_evidence:
  - reviewer: "Claude code-reviewer subagent (intra-runtime)"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-09T10:15:45Z"
    tests_green_at: "2026-08-09T10:15:45Z"
    verdict: approve
    worker_model: claude-opus-5
    reviewer_model: claude-sonnet-5
    scope: "Codex CLI は cross-runtime advisory（gpt-5.6-sol、5 軸レビュー）として先に使用したため、起草物のレビューは規定代替の intra_runtime_subagent（claude-sonnet-5, read-only）が 2 ラウンドで実施した。round1 request_changes（Critical 0 / Important 1 / Minor 2）: Important は HR-FR-DHR-010 が parser 健全性の失敗モードを 5 種挙げているのに HR-AC-DHR-010 と HAT-DRF-04 が 4 種しか観測しておらず、『本文中の単なる参照の過剰受理』の受入が欠落していたこと。これは advisory で指摘された失敗モードの一つが受入に落ちていない空洞化であり、かつ catalog が過剰受理すれば架空 ID が『実在』になるため存在検証そのものを無効化する。AC・HAT・境界値表・§3『誤って green になる経路』の 4 箇所へ反映した。Minor-1 は HR-FR-DHR-007 の『既存 parser 資産を再利用』が過大な期待を招く点（実際には extractG1BusinessIds は Set<string> しか返さず source_pointer / source_digest を持たない。fr-registry-audit は FR-L1 専用で BR / UX 非対応）で、『抽出規則を揃える。catalog 構造の生成は新規実装になる』へ文言を訂正した。Minor-2 は HIL 桁数不整合を非対象にした帰結（非正準 ID 検査が HIL-* や HR-FR-DHR-* 自身には及ばない）の明示で、§6 へ追記した。round2 approve（Critical / Important / Minor すべて 0）。**reviewer による事実の独立検証**: REQUIREMENT_ID_PATTERNS の内容、screen-requirements.md §5.5 から parseScreenTraceRows 同等ロジックで再現した 85 行（unique 49 ID、先頭に BR-01 / UX-02 / FR-L1-01）、BR-21 の縦表形式、HR-FR-DHR-007〜012 の ID 衝突なし、HIL 桁数不整合の実在をいずれも実測で確認し、本 doc の事実主張と一致した。**status を draft のまま据え置く理由**: 工程表 Step 4（D-1 / D-2 / D-3 の PO disposition）が未了であり、AI 側の起草とレビューだけで confirmed を名乗らない。"
    green_commands:
      - { kind: lint, command: "npx --no-install tsx src/cli.ts plan lint", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-09T10:15:45Z", evidence_path: docs/plans/PLAN-L3-30-design-registry-requirement-family-authority.md, output_digest: "sha256:825f6a95fb3e4e9e490ed2cb66b936e25c009fc26b6dbc6e749130749b4f389a", result: "plan-schedule / plan-descent / plan-specific-vpair-binding / design-reality-binding / plan-entry-routing すべて OK" }
      - { kind: lint, command: "npx --no-install tsx src/cli.ts plan lint --gate governance", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-09T10:15:45Z", evidence_path: docs/design/helix/L3-requirements/design-registry-requirement-family-authority.md, output_digest: "sha256:59b310a998c40139584be2df6c0fda9119ca40a3d19eed4cf6b70d5d4720a0d1", result: "plan-governance OK (frontmatter/cross-record checked=881)" }
generates:
  - artifact_path: docs/plans/PLAN-L3-30-design-registry-requirement-family-authority.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L3-requirements/design-registry-requirement-family-authority.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L3-design-registry-requirement-family-acceptance-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L7-530-design-registry-public-command.md
  requires: []
  references:
    - docs/plans/PLAN-L7-529-design-registry-screen-intake.md
    - docs/design/helix/L5-detail/design-registry.md
    - docs/test-design/helix/L8-design-registry-unit-test-design.md
  blocks: []
---

# PLAN-L3-30: Design Registry 要求 family authority の確定

## §1 目的

Issue #177 の残論点「`screen_trace` の requirement family 写像方針」を L3 として確定する。
本 PLAN は**要件と受入の確定まで**であり、実装（L4 以降）は本 PLAN の対象外。

実 `screen_trace` 85 行の requirement_id（`BR-01` / `FR-L1-01` / `UX-02`）が registry の
requirement family と 1 件も一致せず、registry table が live row 0 件のまま止まっている。
これが Issue #209 の L9（SA-UDP-01〜03）をブロックしている。

## §2 決定（PO 承認対象は 3 点のみ）

| # | 決定 |
|---|---|
| D-1 | L1 の原 ID（BR / UX / FR-L1）を再採番せず、registry の requirement family として認識する |
| D-2 | 別名写像台帳（legacy family → registry ID）を作らない |
| D-3 | #257 到達後も family 認識は維持し、暫定 loader だけを置換する |

実装方式（parser 構造、digest 束縛、typed failure の分割、テスト分割）は承認後の AI 判断とする。

## §3 工程表

### Step 1: inventory（現行 intake・family 正本・L1 parser 資産の把握）[直列]

根拠: downstream_dependency（既存 parser 資産を再利用するか新設するかで要件が変わる）。

### Step 2: cross-runtime advisory による方針検証 [直列]

根拠: downstream_dependency（要求 ID authority の projection は registry 単独の判断ではない）。

### Step 3: L3 要件と対 L10 総合テスト設計の起草 [並列]

根拠: parallel（要件と受入は同一判断から同時に導ける。ただし ID 対応は 1:1 で固定する）。

### Step 4: PO 承認（D-1 / D-2 / D-3 の disposition）[直列]

根拠: shared_state（要求 ID authority は L1 owner と共有する正本）。

### Step 5: review（intra_runtime_subagent による要件・受入の妥当性検証）[直列]

根拠: downstream_dependency（承認依頼の前に、受入が「誤って green になる経路」を塞げているかを検証する）。

### Step 6: 承認後に L4 以降を別 PLAN で起票 [直列]

根拠: downstream_dependency（承認された family 方針の上にしか実装設計は載らない）。

## §3.1 実装計画

本 PLAN は add-design であり code を生成しない。生成物は L3 要件 doc、対 L10 総合テスト設計、本 PLAN の 3 点。
情報源は `src/design/design-registry-screen-intake.ts` / `src/design/design-registry.ts` の現行実装、
L1 要求正本（`business-requirements.md` / `functional-requirements.md` §1）、既存 parser 資産
（`src/lint/g1-trace.ts` / `src/lint/fr-registry-audit.ts`）、および cross-runtime advisory。
実装（catalog builder、intake signature 変更、typed failure 追加、lifecycle test）は承認後に
別 PLAN（L4 以降）で起票し、本 PLAN では行わない。

## §4 advisory 記録

Codex / gpt-5.6-sol による 5 軸レビュー（2026-08-09、HEAD `257cd0c5`、read-only）。

- **方向性は支持**。ただし「regex 追加 + 存在確認」では不足で、L1 正本から抽出した
  **versioned requirement catalog を pure な intake へ注入**する形へ強化すべき。
- 見落としていた失敗モード: kind spoofing、catalog の stale 再利用、parser の section 欠落による
  空集合→全件不存在の誤判定、本文中の参照までの過剰受理、graph 未投入の orphan endpoint。
- `REQUIREMENT_ID_PATTERNS` は registry 全体の grammar であり、**恒久（family 認識）と暫定
  （screen_trace reader / Markdown loader）を lifecycle として分離**すべき。`removal_trigger` 一文では不足。
- `HIL-*` の桁数不整合は**別 slice**（failure domain を混ぜない）。
- 第 4 案「screen intake 限定の catalog adapter」も提示されたが、共通 validator と二重基準になるため不採用。

いずれも本 L3 の HR-FR-DHR-007〜012 と受入 §3「誤って green になる経路」へ反映済み。

## §5 本 PLAN の非対象

- 実装（L4 以降）。承認後に別 PLAN で起票する。
- `HIL-*` の連番桁数不整合の是正（別 slice。先行 decision で桁数を確定してから別 commit）。
- BR / UX の ID 形式 lint の新設。
- #257 が異なる ID model を採用した場合の dual-green / 移行方針。
