---
plan_id: PLAN-L1-06-helix-solo-conversion
title: "PLAN-L1-06: HELIX solo 化 — L0 vision 改訂 + L1 要求 re-freeze 駆動 hub"
kind: design
layer: L1
drive: agent
status: confirmed
created: 2026-06-28
updated: 2026-06-28
owner: PO (人間 / RetryYN)
master_hub: true   # G.3 単一 sub_doc 規則の例外: L0 concept + L1 5 sub-doc の solo 改訂を coordinate する駆動 hub (PLAN-L3-00-master 様式)
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-28T21:30:00+09:00"
    tests_green_at: "2026-06-28T21:29:00+09:00"
    verdict: approve
    worker_model: gpt-5.5
    reviewer_model: gpt-5.5
    scope: "PLAN-L1-06 close review: stale implemented claim removed, HBR/HNFR and HOT acceptance checked from Codex runtime perspective, Codex hook/tool surface + hosted API preflight + shared memory/provider handover requirements added, distribution/full-setup command end-state added, L1/L14 pair remains 1:1."
    green_commands:
      - kind: lint
        command: "bun run src/cli.ts plan lint docs/plans/PLAN-L1-06-helix-solo-conversion.md"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-28T21:29:00+09:00"
        evidence_path: .ut-tdd/audit/A-143-helix-l1-solo-refreeze.md
        output_digest: "sha256:94fd9fb55e9b6c654919798ba5d912cf3719a82a0387b24915f85b85a7ed3bc9"
      - kind: vmodel_lint
        command: "bun run src/cli.ts vmodel lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-28T21:29:00+09:00"
        evidence_path: docs/test-design/helix/L1-pillar-operational-test-design.md
        output_digest: "sha256:ce5ee57b2f2a1fade20705c15b0e7c8c881eac12bb7d9d335e5a244eb8b069cd"
agent_slots:
  - role: po
    slot_label: "PO — HELIX solo 化 (team→solo + P0–P9) の最終判断・G-REQ.L1 re-freeze 承認"
generates:
  - artifact_path: docs/plans/PLAN-L1-06-helix-solo-conversion.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L1-requirements/pillar-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L1-pillar-operational-test-design.md
    artifact_type: test_design
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
dependencies:
  parent: PLAN-L0-01-helix-charter
  requires:
    - PLAN-L0-01-helix-charter
  blocks: []
  references:
    - docs/governance/helix-harness-concept_v3.1.md
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
- 進捗: ✅ **core reframe 済**: business §1.1 WHY・§1.2 WHAT・BR-02（複数人→AI agent roster 責務境界、worker≠verifier）／nfr NFR-01（Windows 第一級→本人環境第一級 narrow）・NFR-07 成功条件②（複数人 team→solo+AI roster）を solo 化（doctor green）。**P0–P9 → net-new 要件 confirmed**: `docs/design/helix/L1-requirements/pillar-requirements.md`（HBR-P0/P1/P2/P3/P4/P6/P7/P8/P9 + HNFR-P3/P5/P8/AC、HELIX 名前空間で harness 件数非侵襲、P2/P7 は partial と trace）。**Codex runtime parity overlay 追加**: Codex hook/tool surface、codex-only fallback、hosted API hook 非強制 surface、共有 memory/provider handover を HBR-P2/P7/HNFR-AC の acceptance に明示。**Distribution/full setup overlay 追加**: 既存 harness L1 の GitHub-pull/tag-pin/FR-L1-44/setup 方針に接地しつつ、HELIX final end-state として tag/release pin から `ut-tdd setup`（rename 後 `helix setup` 相当）1 コマンドで hooks・Claude/Codex adapters・state/memory/handover・GitHub rules/checks baseline を bootstrap する要求を HBR-P6/P9 に明示。**functional/screen/technical の team 箇所 inventory→solo 差分修正済**（inventory-first: 5+3+5 hit を列挙 → 真の矛盾のみ修正: technical 開発者規模「2-5名+AIスロット3」→「1名(本人/PO)+AI roster, worker≠verifier」・ADR-005 team server→本人 server 読み替え／screen 案件横断 def「チーム全 project」→「本人の全 project」・BR-02 trace「複数人 gate」→「AI roster gate」・§6.1 ペルソナ solo 注記／functional multi-tenant carry を solo 対象外明示・「チーム共有 audit」→「本人/AI roster 共有」。§1.3 大域コンベンションで被覆済の単なる用語は非改変。doctor green、残存 team hit = solo 読み替え注記のみ）。**外部研究 delta 済**: pmo-tech-docs 委譲（2025–2026 ソース照合、recency 厳守）で P6（Rulesets gated-push + Merge Queue）/ P8（MicroVM sandbox + short-lived token + OWASP LLM06 escalation FR 化）/ HNFR-P3（external-truth grounding AC + source attribution）/ HNFR-P5（3 層 injection budget + anchored iterative handover + artifact-trail 専用記録）の delta を `pillar-requirements.md §2.5` に記録（verify-don't-blindly-adopt: 概念のみ採用候補、ツール/数値/出典は L3 一次検証、ADR-001 厳守）。

### Step 3: [直列] 既存 governance 検証 → 修正
> 直列理由: downstream_dependency — L1 修正と整合する governance（DDD/TDD・team 系）を揃えるため。
`ddd-tdd-rules.md` を外部研究（DDD/TDD best practice）と照合し検証→修正。team governance の solo 適用を整理。
- 進捗: ✅ **検証済**: `ddd-tdd-rules.md` は team 前提 hit=0（domain boundary/invariant/TDD red-first/oracle strength の機械強制 SSoT、`owner:` は code-owner で人間 role でない）→ **既に solo 中立、修正不要**。team governance 実体 = `ai-dev-team-concept_v1.1.md` / `ai-dev-team-operations_v1.1.md`（共に「Status: Reference only」非正本）→ **top-down 書換せず、§1.3 大域コンベンションと同方式で solo 読み替えバナーを冒頭付与**（「チーム/複数人/役割」→本人+AI roster、worker≠verifier、L3/L4 で roster/advisor 個別機能ソースとして取捨選択・harden する参照材料と位置づけ）。inventory-first 厳守。外部 DDD/TDD best-practice は L1 の追加必須差分なし、個別ツール/数値は L3 一次検証へ carry。

### Step 4: [直列] pair 更新 (L1↔L14 operational-test-design、片肺禁止)
> 直列理由: downstream_dependency — Step 2 の要求変更に test-design を対で追随させるため。
`docs/test-design/harness/L1-operational-test-design.md` を solo 要求へ追随更新（OT-* ⇔ BR-* 1:1 維持）。
- 進捗: ✅ **既存 harness L1 OT 対の追随済**（片肺禁止）: reframe した BR-02 → **OT-02**（複数人→AI roster, worker≠verifier 役割逸脱検知）、NFR-01 → **OT-09**（全 OS 第一級→本人環境第一級ネイティブ + 他 OS は移植性 goal）、§2 成功条件②シナリオを AI roster へ。併せて business-requirements.md の BR-02 二次言及残存（§整合注・リスク表・BR↔OT trace 表の「複数人チーム/team gate」）を AI roster へ一貫修正（前回 core reframe の取りこぼし回収）。doctor green、team-person 残存 0。**net-new HELIX pillar の L14 対も confirmed**: `docs/test-design/helix/L1-pillar-operational-test-design.md`（HOT-* ⇔ HBR/HNFR 1:1、HBR 9/9・HNFR 4/4 孤児 0、HOT-P2/P7=partial と trace、他柱=not-implemented/partial で L3 降下、Codex parity overlay は HOT-P2/P7/NAC に接続、distribution/full setup overlay は HOT-P6/P9/N8/NAC に接続）。pillar-requirements.md の pair_artifact 宣言を充足し片肺解消。

### Step 5: [直列] review (plan lint / doctor + review tier)
> 直列理由: downstream_dependency — Step 1–4 の成果物に対し定量検証→定性レビューを行うため。
`ut-tdd plan lint` / `ut-tdd doctor` green、cross-agent または intra_runtime_subagent review を記録（tests_green_at ≤ reviewed_at）。
- 進捗: ✅ **cross-runtime review 済**（作成=Claude / 判定=Codex、creation≠judgement・別ランタイム）。`ut-tdd codex --role tl --execute` で委譲、**VERDICT: approve_after_fixes**。**Codex 指摘を反映**: (Critical) business §3.3.2「人間主導+AI補助」+§4 権限表が TL human G4-6 signoff / AI commit 禁止 = charter §3 自律境界（L3 後 AI 自律で L4〜merge/tag、不可逆のみ escalate）と矛盾 → **AI 自律+人間 residue へ反転 reframe**（人間 = L0–L3 承認+escalation のみ、L4+ gate = AI verifier worker≠verifier、AI が commit/merge 自律）、対の OT-20/OT-42 も追随。(Important) HOT-P2/P7 を `implemented`→**`partial`**（親 HBR 残 GAP: typed contract/effort-budget/Glossary SSoT、NFR-08 真実性）/ harness OT の FR 量閉じ **47→48 件**（FR-L1-51 反映、L3 carry 36/38/43 のみ除外）。(Minor) ai-dev-team BOM は内容 OK で cosmetic 受容。doctor exit=0。review 委譲ログ = `tasks/b3411633k.output`。

### Step 6: [直列] G-REQ.L1 re-freeze + PO サインオフ
> 直列理由: downstream_dependency — Step 5 検証通過後に PO が re-freeze を確定するため。
G-REQ.L1 exit_criteria（L1 sub-doc confirmed・L1↔L14 pair 整合）を再充足し、PO 承認 → status=confirmed、audit A-NNN 記録。
- 進捗: ✅ PO 承認により G-REQ.L1 re-freeze 実施。`pillar-requirements.md` / `L1-pillar-operational-test-design.md` / 本 PLAN を `status: confirmed` に flip。Codex 視点の追加要求（runtime parity / hook surface / hosted API preflight / shared memory）を L1 confirmed scope に含めた。audit = `.ut-tdd/audit/A-143-helix-l1-solo-refreeze.md`。

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

- [x] concept vision が solo（超個人開発・P0–P9）に改訂され charter と矛盾なし。
- [x] L1 5 sub-doc が solo へ検証修正済（team/Windows 除去 + net-new 反映）、pair 整合。
- [x] Claude 視点だけでなく Codex runtime parity（Codex hook/tool surface、codex-only fallback、hosted API preflight、共有 memory/provider handover）が L1 要求と L14 acceptance に入っている。
- [x] 最終配布と 1 コマンド full setup（tag/release pin、repo-local hooks、Claude/Codex adapter、state/memory/handover、GitHub rules/checks baseline、非破壊 setup、既存プロジェクト途中導入、tag bump version-up/rollback plan）が L1 要求と L14 acceptance に入っている。
- [x] `ddd-tdd-rules.md` 等 governance を検証修正済。
- [x] `ut-tdd plan lint` / `ut-tdd doctor` green。
- [x] G-REQ.L1 re-freeze + PO サインオフ + audit 記録。

## §5 carry / 次工程への引き継ぎ

- L3 降下では P6/P8 を優先し、§2.5 外部研究 delta と §2.6 Codex runtime parity overlay を一次検証して FR+AC 化する。
- P6/P9 では §2.7 Distribution/full setup overlay を優先し、`ut-tdd setup`（PLAN-M-02 後は `helix setup`）の final one-command setup を FR+AC 化する。AC には非破壊（silent overwrite/delete/reset 禁止）、既存プロジェクト途中導入（import report + 段階移行）、version-up（tag bump + migration/rollback plan）を必ず含める。
- P2/P7 残 GAP は L3 で起票済み。typed agent↔tool contract は PLAN-L7-213、loop effort-budget は PLAN-L7-214、hosted/API preflight core は PLAN-L7-215 で L7 実装済み。残りは全 agent rule/memory 一般化と Glossary SSoT。Codex subagent guard parity は PLAN-L7-139 continuation で `spawn_agent|spawn_agents_on_csv` を agent-guard に配線済み。
