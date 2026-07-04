---
title: "HELIX L3 要件補完 — upstream A-146 substance-gap 採用"
layer: L3
kind: add-design
status: confirmed
created: 2026-06-30
updated: 2026-06-30
owner: AIM + TL (Codex)
plan: PLAN-L3-06-helix-pillar-descent
pair_artifact: docs/test-design/helix/upstream-substance-gap.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
source_upstream_repo: unison-ai-product/UT-TDD_AGENT-HARNESS
source_upstream_commit: 7f83ca8
source_upstream_commit_full: 7f83ca811353ed90b3e981178a1b0c9977dd5863
source_upstream_artifact: .ut-tdd/audit/A-146-substance-gap-consolidated-remediation.md
---

# HELIX L3 要件補完 — upstream A-146 substance-gap 採用

先行 `unison-ai-product/UT-TDD_AGENT-HARNESS` の `7f83ca8`
(`7f83ca811353ed90b3e981178a1b0c9977dd5863`) に含まれる
`.ut-tdd/audit/A-146-substance-gap-consolidated-remediation.md` を、HELIX 側へ採用するための
L3 要件 back-fill。A-146 は「presence / projection は強いが、substance / runtime provenance が弱い」
という監査結論を持つ。本書はその 8 findings を HELIX の L3 要件として受ける。

既存 `pillar-functional-requirements.md` の 43 件には二重計上しない。A-146 由来の要件は
`HU-FR-*` として別枠で追跡し、L4/L5/L6 の upstream-substance-gap 系 doc へ降ろす。

## §0 量閉じ

| upstream finding | HELIX L3 | 状態 |
|------------------|----------|------|
| A146-1 distribution guard governance | HU-FR-01 | L3 採用済 |
| A146-2 consumer PATH resolution | HU-FR-02 | L3 採用済 |
| A146-3 green evidence integrity | HU-FR-03 | L3 採用済 |
| A146-4 DB telemetry provenance | HU-FR-04 | L3 採用済 |
| A146-5 distribution curation | HU-FR-05 | L3 採用済 |
| A146-6 FE design substance | HU-FR-06 | L3 採用済 |
| A146-7 drive entry enforcement | HU-FR-07 | L3 採用済 |
| A146-8 runtime matcher compatibility | HU-FR-08 | L3 採用済 |

## §1 L3 要件

| ID | upstream | 要件 | acceptance |
|----|----------|------|------------|
| HU-FR-01 | A146-1 | consumer adapter は roster / command 定義だけでなく、Claude/Codex の guard governance を配布物として持つ。Codex agent-guard など runtime semantics が未確定の surface は「未配線なのに配線済」と主張せず deferred surface として露出する | HU-AC-01a / HU-AC-01b |
| HU-FR-02 | A146-2 | adapter hook / template が `ut-tdd` を呼ぶ場合、consumer install 後に PATH 上で解決できること、または wrapper / absolute resolver / preflight が解決不能を fail-close することを要求する | HU-AC-02a / HU-AC-02b |
| HU-FR-03 | A146-3 | green command digest は hash restamp ではなく、該当 green command の再実行結果と digest 更新が同じ evidence batch に結びつく場合だけ integrity closed とする | HU-AC-03a / HU-AC-03b |
| HU-FR-04 | A146-4 | DB telemetry は projected plan evidence と runtime provenance を区別し、model/token/skill/guardrail/test run の由来を facade table ではなく provenance 付き event として説明できる | HU-AC-04a / HU-AC-04b |
| HU-FR-05 | A146-5 | clean distribution package は `docs/governance/` の blanket allowlist に依存せず、dogfood audit / internal process material を consumer package へ混入させない curation policy を持つ | HU-AC-05a / HU-AC-05b |
| HU-FR-06 | A146-6 | FE design coverage は存在/drift だけでなく、L3/L5/L6 の frontend body が populated / intentionally deferred / out-of-scope のいずれかを substance として説明できる | HU-AC-06a / HU-AC-06b |
| HU-FR-07 | A146-7 | drive-model entry は advisory 表示だけでなく、`signal -> mode` と `kind x drive` matrix を machine-readable contract とし、未知組合せを fail-close または明示 defer にする | HU-AC-07a / HU-AC-07b |
| HU-FR-08 | A146-8 | runtime matcher compatibility は設計上の期待ではなく、対象 Claude/Codex runtime で tool matcher が実際に発火する evidence を要求する。未確認 matcher は guard covered と主張しない | HU-AC-08a / HU-AC-08b |

## §2 Acceptance Criteria（受入基準）

| AC-ID | 前提 | 操作 | 期待結果 |
|-------|-------|------|------|
| HU-AC-01a | consumer adapter template を生成する | distribution readiness を評価 | Claude/Codex guard entrypoint と未配線 Codex surface の deferred marker が同時に出る |
| HU-AC-01b | 未配線 surface を検出する | completion claim を評価 | guard covered ではなく deferred / human review / follow-up として扱う |
| HU-AC-02a | consumer repo で hook が `ut-tdd` を呼ぶ | install preflight を実行 | PATH 解決可、wrapper 解決可、または fail-close のいずれかを evidence に残す |
| HU-AC-02b | PATH 解決不能 | hook / setup を評価 | silent pass せず actionable remediation を出す |
| HU-AC-03a | digest mismatch を直す | green command evidence を更新 | 対応 command の再実行ログ、exit status、digest が同じ batch に残る |
| HU-AC-03b | hash だけが更新される | evidence gate を評価 | integrity closed としない |
| HU-AC-04a | runtime event と projected evidence が混在する | DB projection を rebuild | provenance field で runtime/projected/derived を区別できる |
| HU-AC-04b | provenance 不明の telemetry row がある | close claim を評価 | facade/hollow telemetry として blocker または warning にする |
| HU-AC-05a | clean package manifest を作る | curation policy を適用 | consumer 向け docs と dogfood/internal audit docs が分類される |
| HU-AC-05b | blanket governance allowlist が残る | distribution gate を評価 | dogfood leakage risk として fail または explicit defer にする |
| HU-AC-06a | frontend design coverage が green | substance gate を評価 | L3/L5/L6 body の populated/deferred/out-of-scope 理由が確認できる |
| HU-AC-06b | presence だけで body が空 | close claim を評価 | full FE design population とは扱わない |
| HU-AC-07a | task signal / plan kind / drive model がある | route selection を評価 | `signal -> mode` と `kind x drive` matrix に一致する |
| HU-AC-07b | 未知または矛盾する組合せ | route selection を評価 | 自動適用せず fail-close / defer / human review に送る |
| HU-AC-08a | runtime hook matcher を guard covered と主張する | target runtime evidence を確認 | 実 CLI/IDE の tool event 名と matcher 発火 evidence が揃う |
| HU-AC-08b | evidence が無い matcher | guard coverage を評価 | compatibility unverified として扱い、covered claim にしない |

## §3 降下先

- L4: `docs/design/helix/L4-basic-design/upstream-substance-gap.md`
- L5: `docs/design/helix/L5-detail/upstream-substance-gap.md`
- L6: `docs/design/helix/L6-function-design/upstream-substance-gap.md`
- test-design: `docs/test-design/helix/upstream-substance-gap.md`
