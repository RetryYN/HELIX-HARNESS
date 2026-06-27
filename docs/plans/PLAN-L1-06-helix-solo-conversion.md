---
plan_id: PLAN-L1-06-helix-solo-conversion
title: "PLAN-L1-06: HELIX solo 化 — L0 vision 改訂 + L1 要求 re-freeze 駆動 hub"
kind: design
layer: L1
drive: agent
status: draft
created: 2026-06-28
updated: 2026-06-28
owner: PO (人間 / RetryYN)
master_hub: true   # G.3 単一 sub_doc 規則の例外: L0 concept + L1 5 sub-doc の solo 改訂を coordinate する駆動 hub (PLAN-L3-00-master 様式)
agent_slots:
  - role: po
    slot_label: "PO — HELIX solo 化 (team→solo + P0–P9) の最終判断・G-REQ.L1 re-freeze 承認"
generates:
  - artifact_path: docs/plans/PLAN-L1-06-helix-solo-conversion.md
    artifact_type: markdown_doc
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
dependencies:
  parent: PLAN-L0-01-helix-charter
  requires:
    - PLAN-L0-01-helix-charter
  blocks: []
  references:
    - docs/governance/ut-tdd-agent-harness-concept_v3.1.md
    - docs/plans/PLAN-L3-00-master.md
    - docs/design/harness/L1-requirements/business-requirements.md
    - docs/design/harness/L1-requirements/nfr.md
    - docs/governance/ddd-tdd-rules.md
---

# PLAN-L1-06: HELIX solo 化 — L0 vision 改訂 + L1 要求 re-freeze 駆動 hub

## §0 本 PLAN の役割

harness の L0 vision は **チーム開発向け**（concept_v3.1 changelog「工程・モードをチーム開発向けに取り込み」、business §1.2 「社内開発チーム」、BR-02「複数人チーム」、NFR-01 Windows 第一級）。HELIX charter（PLAN-L0-01、confirmed）は **超個人開発（solo）＋ P0–P9** へ vision を改訂する。本 hub は、その vision 改訂を harness の **Forward L0 再入 → G-REQ.L1 re-freeze** ワークフローに乗せ、**既存資産を検証して必要箇所を修正**（作り直しでも丸呑みでもない）する駆動台帳。A-100 L0-L3 refreeze の前例に倣う。

**原則（PO 確定）**: 仕組み = UT-TDD ハーネスが上 ／ 個別機能 = 旧 HELIX が上、ただし個別機能は仕組みを超えない。**あるものは検証して必要に応じ修正する**（既存 BR/NFR/governance を丸呑みも放置もしない）。

## §1 入力 (上流からの baton)

- `PLAN-L0-01-helix-charter`（confirmed）= HELIX vision（solo・3 層自律境界・P0–P9）。
- 既存 L0/L1 資産（検証→修正対象）: `concept_v3.1.md`、L1 5 sub-doc（business/functional/screen/technical/nfr）、`ddd-tdd-rules.md`、team governance（`ai-dev-team-*`）。
- 外部研究 delta（HELIX 向け検証済み）: held-out 検証層 / loop-engineering stop-rule / glossary-drift / context 可逆圧縮（headroom CCR）/ GitHub gated push・CI auto-fix・semantic-release / 最小権限 token。照合先 = 既存 P3/P5/P6/P7/P8。

## §2 出力 (本 hub で確定)

- L0: concept vision を team→solo に in-place 改訂（archive 不可: parent_doc/SSoT 参照多数）。charter と整合。
- L1: 5 sub-doc を solo 版へ検証→修正、pair（L1↔L14 operational-test-design）更新、**G-REQ.L1 re-freeze**。
- governance: `ddd-tdd-rules.md` 等を検証→修正（外部研究をここへ照合）。
- audit: solo refreeze 記録（A-NNN、A-100 様式）。

## §工程表 (Step + 進捗)

### Step 1: [直列] L0 vision 改訂 (concept team→solo + charter 整合)
> 直列理由: downstream_dependency — L0 vision が後続 L1 修正の基準になるため。
concept_v3.1 の WHY/WHAT/スコープを solo（超個人開発・無人自走・P0–P9）へ改訂。charter を L0 vision 正本として参照整合。
- 進捗: ✅ §1.1 WHY（4問題を AI 委譲/agent roster 枠へ）・§2.1 WHAT（team→solo）に加え、§1.3 に **HELIX solo 読み替えコンベンション**（mode owner / CODEOWNERS / 5 役割 / 「チーム共有」を charter §3 3 層自律境界で大域的に solo+AI-roster へ写像、仕組みは不変）を追加。companion docs 前提・team modes・CODEOWNERS・scope を大域注記で一括完了。doctor green。

### Step 2: [直列] L1 5 sub-doc 検証 → solo 修正
> 直列理由: downstream_dependency — Step 1 の vision を各 sub-doc へ降ろすため。
business（team→solo, BR-02 等）／nfr（NFR-01 Windows narrow + 外部 delta）／functional／screen／technical を 1 つずつ検証し必要箇所を修正。net-new（自律境界・無人完走・loop-eng・version-up・2層メモリ・外部検索・held-out）を追加。
- 進捗: 🔄 **core reframe 済**: business §1.1 WHY・§1.2 WHAT・BR-02（複数人→AI agent roster 責務境界、worker≠verifier）／nfr NFR-01（Windows 第一級→本人環境第一級 narrow）・NFR-07 成功条件②（複数人 team→solo+AI roster）を solo 化（doctor green）。**残**: functional/screen/technical の team 箇所検証修正、**P0–P9 charter pillars → net-new BR/NFR 起草**（最重要・要件設計）、外部研究 delta 照合。

### Step 3: [直列] 既存 governance 検証 → 修正
> 直列理由: downstream_dependency — L1 修正と整合する governance（DDD/TDD・team 系）を揃えるため。
`ddd-tdd-rules.md` を外部研究（DDD/TDD best practice）と照合し検証→修正。team governance の solo 適用を整理。
- 進捗: ⬜

### Step 4: [直列] pair 更新 (L1↔L14 operational-test-design、片肺禁止)
> 直列理由: downstream_dependency — Step 2 の要求変更に test-design を対で追随させるため。
`docs/test-design/harness/L1-operational-test-design.md` を solo 要求へ追随更新（OT-* ⇔ BR-* 1:1 維持）。
- 進捗: ⬜

### Step 5: [直列] review (plan lint / doctor + review tier)
> 直列理由: downstream_dependency — Step 1–4 の成果物に対し定量検証→定性レビューを行うため。
`ut-tdd plan lint` / `ut-tdd doctor` green、cross-agent または intra_runtime_subagent review を記録（tests_green_at ≤ reviewed_at）。
- 進捗: ⬜

### Step 6: [直列] G-REQ.L1 re-freeze + PO サインオフ
> 直列理由: downstream_dependency — Step 5 検証通過後に PO が re-freeze を確定するため。
G-REQ.L1 exit_criteria（L1 sub-doc confirmed・L1↔L14 pair 整合）を再充足し、PO 承認 → status=confirmed、audit A-NNN 記録。
- 進捗: ⬜

## §3.1 実装計画 (各 Step をどう埋めるか)

| Step | 対象 | 方法 |
|------|------|------|
| 1 | `concept_v3.1.md` | WHY/WHAT/スコープ節を solo へ in-place 改訂、charter 参照整合 |
| 2 | L1 5 sub-doc | 既存 BR/NFR を逐条検証 → team/Windows 等を修正 + net-new 追加（sub_doc 別 PLAN-L1-01〜05 の doc を改訂、review_evidence 更新） |
| 3 | `ddd-tdd-rules.md` 他 | 外部研究照合で検証 → 不足/不適合を修正 |
| 4 | `L1-operational-test-design.md` | BR 変更に OT を対で追随（片肺禁止） |
| 5 | lint/doctor + review | 定量 green → 定性 review、証跡構造化 |
| 6 | roadmap G-REQ.L1 | re-freeze 再充足 + PO サインオフ + audit |

## §4 DoD (Definition of Done)

- [ ] concept vision が solo（超個人開発・P0–P9）に改訂され charter と矛盾なし。
- [ ] L1 5 sub-doc が solo へ検証修正済（team/Windows 除去 + net-new 反映）、pair 整合。
- [ ] `ddd-tdd-rules.md` 等 governance を検証修正済。
- [ ] `ut-tdd plan lint` / `ut-tdd doctor` green。
- [ ] G-REQ.L1 re-freeze + PO サインオフ + audit 記録。

## §5 carry / 次工程への引き継ぎ

- L1 re-freeze 後、下流（L3 以降）への solo vision 波及（V-pair L1↔L14）を後続 PLAN で扱う。
- 外部研究の未採用 delta（mutation/PBT PoC、PRM 近似等）は improvement-backlog へ。
