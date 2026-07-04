# 上流 UT-TDD_AGENT-HARNESS 突合 — completeness pass 追補 (2026-07-04)

本書は [`upstream-uttdd-reconciliation-audit-2026-07-04.md`](./upstream-uttdd-reconciliation-audit-2026-07-04.md)
の追補である。PO 問い「本当に漏れなく取り込めたか？」を受け、初回パスの盲点を洗い直した
**completeness pass** の追加所見と、**未検証として残る範囲（UNREVIEWED residual）** を明示する。

## 0. 正直な結論

初回パスは **網羅的ではなかった**。completeness pass で、初回が見落としていた実 gap
（adapter runtime、session-log skill_injection、route_mode first-class、relation-graph node、
adapter invoke/error policy）を追加検出した。二 fork（各 900〜1150 ファイル）の完全な逐語突合は
規模が大きく、本 pass でも **PR ブランチ変更 src の一部と PLAN-L7-202..362 全 skim は未検証**のまま残る。
未検証面は下記に**明示追跡**する（silent truncation にしない）。

## 1. completeness pass で確定した追加 gap（初回見落とし）

| 項目 | verdict | 根拠 | 起票 |
|---|---|---|---|
| adapter 安全 spawn（shell:false + windowsVerbatimArguments + ComSpec） | GENUINELY-MISSING | LOCAL adapter.ts:239 は `shell:true`。上流 pr2 は shell:false 化（commit 12f7c9e） | PLAN-L7-320 |
| adapter InvokeResult / normalizeInvokeResult（provider_error vs malformed_output 分類） | GENUINELY-MISSING（L7-176/177） | LOCAL adapter.ts に該当 0、adapter-policy.ts は定数のみ。2 agent が独立に確認 | PLAN-L7-320 |
| normalizeProviderEffort（effort alias 正規化 middle→medium / xhigh→high） | GENUINELY-MISSING | LOCAL src に `xhigh`/`middle` 0 hit | PLAN-L7-320 |
| session-log skill_injection 監査（recordSkillInjectionAttempt、L7-262） | GENUINELY-MISSING | LOCAL src に該当 0 | PLAN-L7-321 |
| route_mode first-class projection（L7-243） | 欠落濃厚 | LOCAL src に route_mode 実装 0（pillar-requirements.md 言及のみ） | PLAN-L7-321 |
| relation-graph 追加 node 投影（adr governance / document-system-map / root skills / codex hooks） | 部分欠落 | LOCAL relation-graph に該当 node source 投影なし | PLAN-L7-321 |

## 2. 再確認で「gap でない」と確定した項目

- **max_parallel 上限**: LOCAL team.ts に `.max(MAX_TEAM_PARALLEL)` 既存。
- **state-db runtime/skill projections**: LOCAL に superset（projectRuntimeVerificationEvents /
  projectSkillTelemetry / projectSkillMetrics / projectSkillEvaluations）。
- **shared harness memory（L7-189）**: LOCAL 稼働（`src/memory/*`、SessionStart で harness-memory 実証）。
- **route certificate**: LOCAL に certificate 機構あり（doctor/index.ts / drive-model-passage.ts）。部分 already-have。
- **secret / mode-catalog / advisor-policy 等**: 初回 audit の already-have を再確認。

## 3. adoptable な design / methodology 概念（code でなく方法論。設計層で採否判断）

上流 PR ブランチが追加した governance/設計 doc から、LOCAL に無い概念候補（要 PO/設計判断、L7 code ではない）:

1. **Evasion taxonomy ledger**（scope-integrity-and-evasion-taxonomy.md）— scope 回避パターンの分類台帳。
2. **Audit lens catalog**（LENS-* + 委譲プロンプト雛形）。
3. **Design-doc implementation-readiness 採点**（7 要素 S/A/B/C）。
4. **Screen 設計連鎖 L3→L5→L6**（screen-functional / ui-detail / screen-spec）— **LOCAL の画面設計は L2 mock で止まり testable な screen 契約が無い**。design-methodology の実 gap。
5. context tiering / probe harness / operational baseline sentinel / digest commit anchor（backlog 段階のアイデア）。
6. relation-graph の impact analysis + diagram export（LOCAL module-drift lint の上位互換候補）。

これらは L7 の一括起票対象にしない（粒度不一致）。設計層（L1/L3/L4）での採否判断を経て、
適合するものだけを都度 FR/PLAN 化する（no bulk import 原則）。

## 4. 未検証として残る範囲（UNREVIEWED residual — 明示追跡）

以下は本 pass で **未読/未確認**。silent に「網羅済み」としない。後続 pass で埋める。

- **PR ブランチ変更(M) src の約 20 ファイル**: `src/schema/{harness-db*,index,team}`,
  `src/state-db/{projection-writer,token-tracker,index}`, `src/workflow/routing-contracts`（D-CONTRACT 以外の
  route audit→recovery / route certificate 差分）, `src/team/*`, `src/task/classify`, `src/feedback/engine`,
  `src/graph/loader`, `src/cli.ts`, `src/doctor/index.ts`, `src/setup/*`, `src/plan/lint*` の逐語 diff。
  コミット subject からは既知 PLAN（L7-243/262/198/263 等）に概ね対応し、上記 §1/§3 で主要 gap は捕捉済みだが、
  細部の capability 差分は未確定。
- **PLAN-L7-202..362 のファイル名 skim**: 未実施。update-strategy.md §3 wave 表が主要候補を間接列挙しており、
  後続は主に裏取りの見込み。
- 初回調査の lint pass の best-effort 項目のうち、3 lints（github-ci-policy / personal-path / toolchain-pin）は
  本 pass で LOCAL hits=0 = 確定欠落（PLAN-L7-319 でカバー）。

## 5. 起票済み PLAN 一覧（2026-07-04、status=draft）

312 D-CONTRACT DSL / 313 G9-G10 gate / 314 L14 close-audit / 315 context doc-router /
316 telemetry provenance / 317 skill scaffold / 318 model-override injection（security）/
319 小項目 roundup / 320 adapter runtime hardening / 321 completeness-pass gaps。

実装は Codex in-flight 作業の着地後、harness workflow（plan→pair-freeze→implement→trace-freeze→review→accept）
で行う。基準点は HEAD。
</content>
