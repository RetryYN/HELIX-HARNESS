# handover 廃止 × harness memory 強化 追突 audit (2026-07-11)

本書は PO 指示 `/goal`（2026-07-11）「ハンドオーバーの課題を突き詰めてハンドオーバーを廃止して
ハーネスメモリを強化する方向で進めたい。ハーネスメモリの構造を強化して ClaudeCode と Codex 拡張
（チャット画面）両対応にし、`unison-ai-product/UT-TDD_AGENT-HARNESS` を branch 含めて全数追突して
取り込めるものを PLAN 起票する」に基づく監査記録である。

前提となる PO 判断の変遷: 2026-07-07 の PO 問い「ハーネスメモリがあるなら handover は不要では？」
に対し、当時は「廃止ではなく DB 導出化で縮小」で合意し PLAN-L6-57 / L7-355 / L7-396 として着地済み。
本 `/goal`（2026-07-11）はその判断を PO 自身が「廃止」へ方向転換したものであり、本書と起票 PLAN は
L6-57 の成果（DB 導出）を土台として廃止まで進める設計指示である（errata ではなく方向転換のため
plan-supersession の対象外。L6-61 の entry_signals に転換を明記）。

## 1. 突合範囲と基準点

- 前回監査: `upstream-helix-reconciliation-audit-2026-07-04.md`（+completeness）と
  `helix-harness-upstream-reconciliation-audit-2026-07-07.md`。カバー範囲 = 上流 `main@7f83ca81`
  （2026-06-29）+ PR#2 head `cbc66ea0`（`work/l10-l14-local-close`、2026-07-03）。
- 今回対象（未突合差分）:
  - `main`: `cbc66ea0..ef43caa0` の 202 commits（PR#22〜#50 相当。PR#2 は main へ merge 済みで
    ancestor 確認済み）。
  - 未 merge work branch 3 本（main 未含有 commit のみ）: `work/l7-context-efficiency-surface`（3）、
    `work/l7-419-quality-verification-audit-plans`（4）、`work/vmodel-engine-swap-wave2`（21）。
- 取得方法: `git clone --no-single-branch`（read-only、scratchpad 一時 clone、検査後破棄可能）。
- 突合実施: Claude（Fable）+ pmo-project-explorer（Sonnet）2 系統の read-only 調査。
  commit-subject + diff + 実ファイル読解 + local grep 突合（full line-by-line ではない）。

## 2. handover 課題台帳（証跡付き）

### 2.1 機構そのものの構造課題

| # | 課題 | 証跡 |
|---|---|---|
| H1 | 「ポインタ」の肥大。CURRENT.json が 311,927 bytes（2026-07-09 生成分の実測）。active PLAN 全列挙 + outstanding + feedback を抱え、pointer の名に反して session 冒頭 context を圧迫する | `.helix/handover/CURRENT.json`（wc -c 実測 2026-07-11） |
| H2 | drift の構造欠陥が確定済み。手書き系 marker drift は「敵対検証で patch 不可」と結論され、防衛側の機構（reconcile / stale 検知 / bypass 検知）を積み増しても根絶できない | PLAN-L7-145（marker-drift は patch 不可と確定）、PLAN-L7-83（reconcile 恒久対策）、PLAN-L6-16/L7-17（5 gap 機械担保） |
| H3 | prose 転記の腐敗。実在しない PO 判断が prose 転記で残る根因が確認され、機械 seed + fail-close anchor で塞ぐ対処療法を要した | PLAN-L7-98 |
| H4 | 累積。同日 markdown の線形累積（上限化で対処）、`docs/handover/` に session-handover md 14 本蓄積、§1/§2 の全 registry ダンプによる context 肥大（injection cap で対処） | PLAN-L7-83、PLAN-L7-88、`docs/handover/*.md` 14 本（実測） |
| H5 | 漏洩事故面。生成器の絶対パス漏洩と tracked 漏洩の除去を要した | PLAN-L7-145 |
| H6 | 維持コストの逆転。handover 系 PLAN は 18 本（L6-06/16/57、L7-04/06/07/17/83/88/98/131/145/173/253/287/288/355/396）に達し、防衛機構が本体価値を上回る | `docs/plans/` grep 実測 |
| H7 | 指示面 4 面分散と drift。CLAUDE.md / .claude/CLAUDE.md / AGENTS.md / ~/.codex/AGENTS.md に handover 指示が分散。~/.codex/AGENTS.md は実在しない識別子（`.ut-tdd/handover`、`ut-tdd handover`）を指して既に腐っている | `~/.codex/AGENTS.md:12`（実測 2026-07-11） |
| H8 | 正本性は既に DB へ移動済み。CLAUDE.md 自身が「stale 化する prose handover を現状把握の正本にしない」「引き継ぎ feedback は harness.db から受け取る」と明記（PLAN-L7-110）。DB 導出化（L6-57/L7-355/396）後の CURRENT.json は DB read-model の file キャッシュにすぎず、固有情報は takeover_note 1 欄のみ | CLAUDE.md、`src/handover/handover-derivation.ts` |

結論: handover の 3 責務のうち (a) 機械状態（active PLAN / outstanding / feedback / git 基準点）は
既に harness.db が正本で SessionStart が直接 surface しており、(b) 人間の申し送り（takeover note）
だけが file 固有、(c) provider 委譲 evidence（`.helix/handover/provider/*.json`）は audit evidence で
あって session 引き継ぎではない。(a) は file キャッシュ廃止で DB 直読へ、(b) は harness memory の
短寿命層へ、(c) は audit 系へ帰属整理する、が廃止の骨子である。

### 2.2 受け皿となる harness memory 側の gap（実測）

| # | gap | 証跡 |
|---|---|---|
| M1 | entry 構造が `layer/key/body/supersedes/createdAt` のみ。type（decision/constraint/state 等）、provenance（plan_id / session / runtime）、lifecycle（consumed/expired）、関連 link を持たない | `src/memory/memory-types.ts`、`src/memory/index.ts` |
| M2 | surface が「直近 12 件 + 240 chars 切詰め」の時系列 slice のみ。relevance / 多様性選定なし | `src/memory/index.ts:39-57` |
| M3 | Codex 側 surface ゼロ。`surfaceMemory` の消費は Claude SessionStart hook（`src/cli.ts:3107`）と `helix memory surface`（`src/cli.ts:1785`）のみ。`helix codex` 委譲 prompt・Codex 拡張チャットへは一切注入されない | grep 実測（`src/runtime/adapter.ts` に memory 参照なし）|
| M4 | feedback_events の飽和。SessionStart 実測 open=2010（telemetry=1929、missing-test-oracle-id=1434）。lifecycle（ack/consumed/TTL）が無く、actionable が telemetry に埋没する | SessionStart surface 実測（2026-07-11）|
| M5 | 短寿命の仕掛かり状態を受け止める層が無い（harness / project の 2 層のみ）。L6-57 が「時間スケールが異なるから handover と memory は両方必要」とした根拠はここにあり、廃止するなら memory 側に短寿命層（takeover）を新設する必要がある | `src/memory/memory-types.ts`、PLAN-L6-57 起点 signal |
| M6 | SessionStart feedback surface が単一クラスタ独占型。`items.filter(...).slice(0, limit)` の単純 slice で、大量発生した 1 signal_type が予算を独占し他種別が不可視化する（absence-blindness）。escalation surface には上限が無い | `src/feedback/surface.ts:228`、`src/runtime/attempt-escalation.ts:127`（実測）|

### 2.3 廃止対象の消費面 inventory（retirement 設計の対象）

1. `helix handover` / `handover status` CLI（`src/cli.ts:3509-` 一帯）と `src/handover/` module。
2. Stop hook（`session summary`）での snapshot 再生成配線（PLAN-L7-396）。
3. doctor の handover staleness warning surface（`src/doctor/index.ts:502-` 一帯）。
4. handover discipline / bypass 検知 lint（PLAN-L7-06/L6-16 系、`checkHandoverBypass` ほか）。
5. `.helix/handover/CURRENT.json`（廃止）と `.helix/handover/provider/*.json`（帰属整理: audit evidence として存置または `.helix/audit/` 配下へ移設。PLAN-M-02 の識別子凍結に抵触しない範囲で決定）。
6. `docs/handover/` の session-handover md 運用（停止 + 既存 14 本の archive 方針）。
7. 指示面 4 面の handover 記述と Adapter Rule Markers「引き継ぎ: `helix handover`」
   （rule-drift gate 対象のため全 adapter 同期変更が必須）。
8. `helix plan complete`（L7-131）の handover 記録連携。

## 3. 上流追突・採用台帳

粒度規則（L1=エリア / L3=FR / L4-L6=command・algorithm）、ADR-001（TS/Bun 再実装・Python/旧 runtime
不持込）、bulk import 禁止に従う。上流は read-only 参照・設計概念のみ採取。

### 3.1 採用（高）— 今回起票

| capability | 上流実体 | 解決すること | local 判定 | 起票 |
|---|---|---|---|---|
| feedback lifecycle 台帳 | `src/shared/feedback-lifecycle.ts`、`feedback_lifecycle` table、`reconcileFeedbackLifecycle`（commits `7d4db19f` `19b90537` `daf8d291` `4e871bc3`、上流 PLAN-L6-68 confirmed） | projection が open を再生成して close 済み feedback が復活する問題を `source_generation` 追跡の append-only 台帳で封じ、telemetry signal は open のまま 24h（TTL）で自動 ack して surface から退避（gate/actionable は TTL 対象外） | missing（`feedback_lifecycle` grep 0 件、open=2010 で飽和中） | PLAN-L6-63 |
| memory promotion nudge | `src/runtime/memory-promotion.ts`、session-log `memory_write` event（commits `65dcd9eb` `4e871bc3`、上流 PLAN-L7-392 confirmed） | session 内に commit/plan_switch があるのに memory_write が無い場合、Stop hook で 1 行 nudge（非 block・already_nudged 抑制）。「記録し忘れて手書き handover に頼る」根因を機械で塞ぐ | missing（local `SessionEventType` に `memory_write` なし） | PLAN-L6-63 |
| feedback surface group-first cap | `src/feedback/surface.ts` の `selectDisplayGroups()` / `feedbackGroupKey()`（branch `work/l7-context-efficiency-surface` commit `60fa4207`、上流 PLAN-L7-403 confirmed・tests green） | 単純 slice の absence-blindness を「bucket:severity:signal_type で group 化 → 上位 N 群」へ変更し、固定予算内で複数問題種別の可視性を保証 | missing（M6 実測） | PLAN-L7-404 |
| escalation surface 上限 | `src/runtime/attempt-escalation.ts` `DEFAULT_ESCALATION_SURFACE_LIMIT=10`（同 commit） | SessionStart surface 群で escalation だけ無制限の非一貫を是正 | missing（M6 実測） | PLAN-L7-404 |

### 3.2 採用（中）— 台帳登録のみ（今回の goal 軸外。後続判断で個別 PLAN 化）

- secret-scan 専用 lint（上流 `src/lint/secret-scan.ts`、PR#25、上流 PLAN-L6-62）: 「secrets を書かない」
  原則の機械強制。local に専用 scanner なし。価値高だが memory 軸外のため台帳登録に留める。
- agent-guard family rank / fable apex-tier（PR#44、`FAMILY_RANK`）: fable を quality gate 系 role に
  限定する機械強制。local は exact-match のみ。advisor-fable 境界（PLAN-L7-306）の自然な拡張。
- GPT-5.6 tier routing（PR#41）: local `src/team/model-policy.ts` は frontier=gpt-5.5 世代のまま。
  model-effort SSoT（PLAN-L7-310）側の世代更新として独立に差し替え可能。
- takeover surface の重複排除 / surface_count 畳み込み（PR#40 内）: L6-63 の設計範囲に概念として含める。
- 上流 draft 概念 3 件（test hygiene live-tree fence / gate minor hardening / agent allowlist
  drift doctor。branch `l7-419`・`l7-context-efficiency-surface`）: 上流でも未実証の設計仮説。概念のみ。

### 3.3 不採用・対象外

- vmodel engine-swap（YAML contract compiler、PR#45/#46）と `work/vmodel-engine-swap-wave2`
  （plan-asset immutability / disposition / profile resolver）: 上流固有の大規模アーキテクチャ刷新で、
  local の PLAN schema / lint 体系と非互換。bulk import 禁止に該当。概念（PLAN の不変性・identity
  binding）は将来 L4-L6 設計時の参照材料に留める。
- skills/ 大量資産（PR#48/#49/#50、90 file 超）: bulk import 禁止。各層降下時に粒度を合わせて個別採取。
- L7-424 git hooks ownership: local は `.git/hooks/` に sample のみ・`core.hooksPath` 未設定で該当事象なし（実測）。
- L7-425 setup templates model floor: local の templates 構造が別世代（model tier 列なし）で直接移植不可。
- distribution export integrity（PR#42/#43）: 前回 2026-07-07 監査の distribution 起票済み領域に包含。
- stable-id helper 統一 / spec-ir・gate-run projection 群: 依存土台が local に無い refactor / 構造差。
- 上流 `.ut-tdd/memory/*.md` 運用メモ: 上流固有の運用記録で移植対象外。

## 4. 方針: 廃止 → 責務移管マップ

| handover の責務 | 移管先 | 起票 |
|---|---|---|
| 機械状態（active PLAN / outstanding / feedback / git 基準点） | harness.db 直読（既に正本）。CURRENT.json file キャッシュは撤去し、必要 render は `helix status` / SessionStart surface に一本化 | PLAN-L6-61 |
| 人間の申し送り（takeover note） | harness memory 短寿命層（takeover layer、one-shot consumed lifecycle） | PLAN-L6-62（構造）+ L6-61（移管） |
| feedback の鮮度・可視性 | feedback lifecycle（TTL auto-ack / consumed 非表示 / promotion nudge） | PLAN-L6-63 |
| cross-runtime 到達（Claude Code / Codex 拡張チャット） | memory surface の cross-runtime 注入（SessionStart hook + Codex 側注入経路 + 委譲 prompt） | PLAN-L6-64 |
| surface の可視性保証 | group-first cap + escalation cap（即効 port） | PLAN-L7-404 |
| provider 委譲 evidence | audit evidence として帰属整理（session 引き継ぎ概念から分離） | PLAN-L6-61 |

移行順序は「受け皿先行」: L6-62/63/64（+L7 descent）が着地して初めて L6-61 の撤去 slice を実行する。
撤去は adapter rule marker（rule-drift gate 対象）を含むため全 adapter 同期・atomic に行い、
workflow 規約変更として PO の confirmation gate を必須とする（自律境界 charter §3）。

## 5. 起票 PLAN 一覧（本 audit 起点、いずれも status=draft）

- `PLAN-L6-61-handover-retirement`（add-design）: handover 廃止設計 — 消費面 retirement + 責務移管。
- `PLAN-L6-62-harness-memory-structure`（add-design）: memory 構造 v2 — type/provenance/lifecycle/takeover 層 + surface 多様性。
- `PLAN-L6-63-feedback-lifecycle`（add-design）: feedback lifecycle 台帳 + telemetry TTL auto-ack + memory promotion nudge（上流概念採取）。
- `PLAN-L6-64-memory-cross-runtime-surface`（add-design）: Codex 拡張チャット / 委譲 prompt への memory 注入。
- `PLAN-L7-404-feedback-surface-diversity-port`（troubleshoot）: group-first cap + escalation 上限の即効 port。

## 6. 制約の再確認

- precedence: 仕組み（V モデル工程・gate・state DB）が上。上流機能は仕組みに従属して差し込む。
- ADR-001: TS/Bun 再実装。上流 code の直接 copy ではなく契約・概念の採取。
- 識別子凍結: `.helix/` / CLI `helix` の rename は PLAN-M-02 の cutover 承認まで凍結。本廃止は
  handover サブシステムの撤去であり識別子 rename ではないが、`.helix/handover/` path の帰属整理は
  凍結に抵触しない範囲（サブディレクトリの用途変更）に限定する。
- 完了主張は tests / gate run で裏付ける（coding ≠ substance）。本書の実測値は 2026-07-11 時点。
