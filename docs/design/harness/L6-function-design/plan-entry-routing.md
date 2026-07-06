---
layer: L6
sub_doc: function-spec
status: confirmed
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
plan: docs/plans/PLAN-L6-55-plan-entry-routing.md
---

> **L6 contract marker**: `analyzePlanEntryRouting(docs: PlanEntryRoutingDoc[], baseline: PlanEntryRoutingBaseline) => PlanEntryRoutingResult` は unit-test 粒度の contract。pre: docs は plan frontmatter 抽出結果。post: 決定論で、baseline 外の新規違反 > 0 のときのみ ok=false（ratchet、plan-descent と同型）。invariant: 既存 PLAN を遡及 fail させない。

# plan-entry routing gate（起票タイプの機械選定）— 機能設計

## §1 範囲 — PO 指摘（2026-07-06）「駆動モデルが正しく選ばれないのがそもそも穴」

signal→mode routing 表（`docs/process/modes/README.md` §4）と機械 contract
（`src/workflow/routing-contracts.ts` の `routeSignalToMode`、`helix task classify`）は存在するが、
**PLAN 起票経路に配線されておらず**、kind/mode/drive の選定がエージェントの手選びに依存している。
実証（2026-07-06）: (a) `helix task classify --text "テストと doctor が遅いので性能改善したい"` は
`kind=unknown` / low-drive-confidence を返す（性能系 signal を分類できない）。
(b) refactor/perf PLAN を Issue（signal）起点なしで直接起票しても何も fail しない
（§6.8 の signal → Issue → PLAN 一本道が機械強制されていない）。

上流見本（unison-ai-product/UT-TDD_AGENT-HARNESS-Pack、2026-07-06 調査）は同じ穴を
**route certificate** で解いている: PLAN frontmatter `route_mode` を宣言正本とし、
`workflowModeForPlan()`（`src/schema/mode-catalog.ts`）が `PLAN-M-*`/`PLAN-DISCOVERY-*` 等の
plan_id prefix → kind の順でフォールバック導出、`ROUTE_SIGNAL_MAP`（`src/schema/route-map.ts`）が
signal token → mode/command/preflight/requiresApproval を宣言的に列挙、mapping 漏れは
`unmappedModeCatalogDocs()` で fail-close 検出する。本設計はこの様式を採用し、
HELIX 既存 backlog `PLAN-L7-322`（route_mode-kind consistency lint + route certificate、
confirmed・未着手）の実行設計を兼ねる（constraint-first: エージェントが自由に mode を
名乗れない構造にする）。

要求仕様:

0. **route_mode 宣言正本（route certificate、上流様式）**: 新規 PLAN は frontmatter
   `route_mode:` を宣言する。mode↔kind 正本台帳（modes README §2）との整合を fail-close 検査し、
   未宣言 legacy PLAN は plan_id prefix → kind のフォールバック導出（上流
   `workflowModeForPlan` と同一連鎖）で mode を決定する。
1. **起点宣言の必須化**: 新規 PLAN は frontmatter `entry_signals:`（feedback `source_id` /
   issue-queue id / `po_directive:<日付+要旨>` のいずれか 1 件以上）を宣言する。
   起点なしの新規起票は fail-close（既存 PLAN は grandfather baseline + ratchet）。
2. **kind と signal の整合検査**: 宣言された signal 種別から `routeSignalToMode` が導く mode の
   許容 kind 集合（mode↔kind 正本 = `docs/process/modes/README.md` §2 台帳）と PLAN の kind が
   一致しない場合は violation（例: `refactor_candidate:*` signal → kind ∈ {refactor}、
   `regression_dev` → {troubleshoot, recovery}）。
3. **classifier の性能系 signal 対応**: `task classify` が性能劣化・速度・遅延の語彙で
   `kind=unknown` を返さないよう、分類 lexicon に perf 系 signal
   （`debt_degradation` → refactor 経路）を追加する。

## §2 関数 / データ contract（`src/lint/plan-entry-routing.ts` 新設）

検査対象スコープ（plan-descent と同形式）: 対象 = 全 kind の PLAN。除外 = `PLAN-DISCOVERY-*` /
`PLAN-M-*` prefix（bootstrap 起票・master hub は signal 起点なしを許容）と `status: archived`。
除外は oracle U-PROUTE-012 で凍結する。

| 対象 | contract |
|---|---|
| `entry_signals`（frontmatter、schema 追加） | `string[]`。値は (a) feedback `source_id`（`.helix/harness.db` feedback_events に実在すること）、(b) issue-queue id（`helix issue queue` の項目）、(c) `po_directive:` prefix の自由記述（PO 直接指示。日付を含む）。 |
| **signal 種別の確定アルゴリズム** | 宣言値ごとに決定論で確定する: (c) `po_directive:` prefix → 種別 `po_directive`（実在検査・kind 整合検査とも対象外）。(a)/(b) はまず値を id として DB / queue に照合し、hit した row の **category / signal フィールドの値**（例: `refactor_candidate:split-module`、`regression_dev`）を signal token とする。§1 の `refactor_candidate:*` は entry_signals の第 4 形式ではなく、**feedback row の category から導出される signal token** である。未 hit は `entry_signal_unresolvable`。 |
| `MODE_ALLOWED_KINDS`（`src/schema/mode-catalog.ts` 新設 export） | mode → 許容 kind 集合の機械表（modes README §2 台帳の machine 写し。SSoT はこの export とし README は prose 鏡）。`kind_signal_mismatch` / `kind_route_mode_mismatch` はいずれも `MODE_ALLOWED_KINDS[mode]` との照合で計算する（mode→kind 表はここ 1 箇所のみ。二重表禁止の対象）。 |
| `route_mode`（frontmatter、schema 追加） | mode 台帳（modes README §2）の mode 名。新規 PLAN で必須（未宣言は `route_mode_absent`、grandfather baseline）。kind との整合は `MODE_ALLOWED_KINDS` 照合で `kind_route_mode_mismatch` として fail-close。注記: frontmatter `route_mode` と harness-db の `route_modes` テーブル（PLAN-L7-321、drive mode projection）は**別概念**（混同注意）。 |
| `workflowModeForPlan(input)`（`src/schema/mode-catalog.ts` 新設、上流様式移植） | `PLAN-M-*` → verification、`route_mode` 宣言 → 表示名、`PLAN-DISCOVERY-*`/`PLAN-REVERSE-*`/`PLAN-RECOVERY-*` prefix → 各 mode、最後に kind フォールバック。純関数・決定論。 |
| `ROUTE_SIGNAL_MAP`（`src/schema/route-map.ts` 新設、上流様式移植） | signal token 配列 → {mode, command, preflight, requiresApproval} の宣言表。`requiresApproval: true`（agent_runaway 等）は承認強制と直結。`routeSignalToMode` はこの表を参照する形へ寄せ、二重表を作らない。**refactor エントリの token 集合に `refactor_candidate` を追加する**（現行 `routing-contracts.ts` の token 列は `debt_degradation` 等のみで、実在 feedback category `refactor_candidate:*` が no-route になるため。U-PROUTE-004 の前提）。 |
| `loadPlanEntryRoutingBaseline(root?)` | `docs/governance/plan-entry-routing-baseline.json`（gate 導入時の既存 PLAN grandfather 台帳、機械生成 1 回のみ）。 |
| `analyzePlanEntryRouting(docs, baseline)` | 純関数。violation reason **5 種**（enum `PlanEntryRoutingReason`、1 oracle = 1 reason）: `entry_signal_absent`（起点宣言なし）/ `entry_signal_unresolvable`（宣言 signal が DB/queue に実在しない、**または DB/queue が読めず実在を検証できない**。unverifiable state は fail-close。`po_directive:` のみ実在検査対象外）/ `kind_signal_mismatch`（signal token→mode→`MODE_ALLOWED_KINDS` の許容 kind と不一致）/ `route_mode_absent`（新規 PLAN で route_mode 未宣言）/ `kind_route_mode_mismatch`（宣言 route_mode の許容 kind と不一致）。baseline 記載 plan_id は grandfathered。`ok = 新規違反 0 かつ grandfathered ≤ baseline 件数`。 |
| `planEntryRoutingMessages(result)` | plan-descent と同形式の OK / violation 出力。 |
| classify lexicon 追加（`src/task/classify.ts`） | 「遅い / 性能 / パフォーマンス / latency / slow」系語彙 → `kind=refactor`（signal=debt_degradation）候補を返し、unknown を解消する。既存分類の優先順位は変更しない（追加のみ）。 |

## §3 Doctor / lint 配線

- `helix plan lint` 既定合成（schedule + descent）に `entry-routing` を追加（`--gate entry-routing`
  単独実行も可）。doctor に `plan-entry-routing` gate を hard/fail-close で追加。
- baseline は導入時に全既存 PLAN の違反 plan_id を機械生成して固定（手書き禁止。
  生成フラグは plan-descent の前例に揃え `--gate entry-routing --write-baseline` 系の一貫命名）。
- DB 参照経路は doctor（prebuilt in-memory projection 共有）と `plan lint` 単体実行で共通の
  read-only loader を使う（lint 単体時の stale DB による誤 block の正規リカバリ = `db rebuild`）。
- 運用: 起票フローは「signal（feedback/issue-queue/PO 指示）→ `helix task classify` で
  kind/drive 候補確認 → PLAN frontmatter に `entry_signals` 宣言 → lint が整合を fail-close」。

## §4 Test oracle 設計

Covered by `tests/plan-entry-routing.test.ts`:

| ID | oracle |
|---|---|
| U-PROUTE-001 | entry_signals に実在 feedback source_id + kind 整合 → ok |
| U-PROUTE-002 | 新規 PLAN で entry_signals なし（baseline 外）→ entry_signal_absent |
| U-PROUTE-003 | 宣言 signal が DB/queue に実在しない → entry_signal_unresolvable |
| U-PROUTE-004 | `refactor_candidate:*` signal に kind=impl を宣言すると kind_signal_mismatch になる |
| U-PROUTE-005 | `po_directive:2026-07-06 ...` は実在検査対象外で ok |
| U-PROUTE-006 | baseline 記載の既存 PLAN → grandfathered、ratchet 超過で ok=false |
| U-PROUTE-007 | classify: 「テストが遅い」系 text → kind=refactor（unknown でない） |
| U-PROUTE-008 | DB 不在で feedback source_id を宣言した PLAN は entry_signal_unresolvable（fail-close） |
| U-PROUTE-009 | 新規 PLAN で route_mode 未宣言（baseline 外）→ route_mode_absent |
| U-PROUTE-010 | route_mode 未宣言の legacy PLAN は plan_id prefix → kind の順でフォールバック導出される（上流 workflowModeForPlan と同一連鎖） |
| U-PROUTE-011 | kind と route_mode の不整合（MODE_ALLOWED_KINDS 照合）→ kind_route_mode_mismatch |
| U-PROUTE-012 | `PLAN-DISCOVERY-*` / `PLAN-M-*` prefix・`status: archived` は検査対象外（entry_signals なしでも violation を出さない） |
