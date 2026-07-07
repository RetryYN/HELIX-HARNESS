---
layer: L6
sub_doc: function-spec
status: confirmed
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
plan: docs/plans/PLAN-L6-54-plan-descent-gate.md
---

> **L6 contract marker**: `analyzePlanDescent(docs: PlanDescentDoc[], baseline: PlanDescentBaseline) => PlanDescentResult` は unit-test 粒度の contract。pre: docs は plan frontmatter の抽出結果。post: 決定論で、baseline 外の新規違反 > 0 または違反件数が baseline を超過した場合のみ ok=false（ratchet）。invariant: baseline 内の既存 PLAN を遡及 fail させない。

# plan-descent gate — 機能設計

## §1 範囲 — なぜ descent-obligation では落ちないか

PO 指摘（2026-07-06）: kind=impl の PLAN が L5/L6 設計を経ずに L7 直行で起票できてしまい、
設計が実装からの後付けになる。既存ガードの盲点は 2 つ:

- `descent-obligation`（PLAN-L6-35）は **trace key（FR registry）駆動の freeze 時検査**であり、
  PLAN 起票経路（`helix plan lint`）では降下完全性を見ない。
- plan-governance の `parent_design` 検査（`src/plan/lint.ts` の `parent_design_missing`）は
  **path の存在のみ**を見る。別 PLAN（`docs/plans/*.md`）を parent_design に置いても、
  parent_design を省略しても通る（present かつ不在パスのときだけ violation）。

PO 規則（2026-07-06、本 gate の要求仕様）:

1. **L6（機能設計）と L8 単体テスト設計 pair ⇒ L7（実装）は必須**。kind=impl / add-impl の PLAN は
   L6 設計 doc への parent_design と `docs/test-design/harness/L8-unit-test-design.md` への pair_artifact を持たない限り起票できない。
2. **実装起点（bottom-up）の発見は kind=impl で直接起票しない**。DISCOVERY
   （`PLAN-DISCOVERY-*` / design-bottomup mode、PLAN-DISCOVERY-07）または reverse 系で起票し、
   そこから L6 → L7 へ降下する。
3. エージェントの注意力・自制に依存しない。**ガード外の起票手順そのものを機械的に不可能にする**。

本 lint は PLAN 起票時にこれを fail-close で強制する。実運用の実測（2026-07-06）:
kind=impl/add-impl 240 件のうち相当数が PLAN を parent_design にしており、遡及 fail は
運用を止めるため既存分のみ **grandfather baseline + ratchet**（PLAN-L7-341 の complexity
baseline と同型）を採る。**新規 PLAN に grandfather は適用しない**。

## §2 関数 / データ contract（`src/lint/plan-descent.ts` 新設）

| 対象 | contract |
|---|---|
| `DESIGN_PARENT_PREFIX = "docs/design/"` / `L6_DESIGN_SEGMENT = "L6-"` | 実装 PLAN の parent_design が満たすべき条件: `docs/design/` 配下（harness / helix 双方可）かつ path に L6 層 segment（例 `L6-function-design/`）を含む実在ファイル。 |
| `TEST_DESIGN_PREFIX = "docs/test-design/"` / `L8_UNIT_TEST_DESIGN_SEGMENT = "L8-unit-test-design"` | 実装 PLAN の pair_artifact が満たすべき条件（V-pair: L6↔L8 の単体テスト設計側）。 |
| `PLAN_DESCENT_RULE` | 対象 = `kind ∈ {impl, add-impl}`。要求 = (a) `parent_design` が L6 設計 doc（上記条件）であること、(b) `pair_artifact` が `TEST_DESIGN_PREFIX` 配下の実在ファイルであること。`kind ∈ {design, add-design, reverse, troubleshoot, poc, recovery, research, charter, refactor}` と `PLAN-DISCOVERY-*` は対象外（bottom-up の正規入口。refactor は挙動不変で設計正本が既存のため）。 |
| `loadPlanDescentBaseline(root?)` | `docs/governance/plan-descent-baseline.json`（grandfather 台帳: gate 導入時点の既存違反 plan_id の配列 + 記録日）を読む。無ければ空 baseline。**台帳への追記は gate 導入時の機械生成 1 回のみ**（以後の追記は plan-descent 自体が fail-close で拒否する前提の運用）。 |
| `analyzePlanDescent(docs, baseline)` | 純関数。違反を `{planId, reason, detail}` で列挙し、baseline 記載の plan_id は `grandfathered` に分類。`ok = 新規違反 0 かつ grandfathered 件数 ≤ baseline 件数`（ratchet: 減るのは可、増えるのは不可）。reason は 6 種: `parent_design_absent` / `parent_design_not_l6_design_doc` / `pair_artifact_not_test_design` / `pair_artifact_not_l8_unit_test_design` / `parent_design_not_confirmed`（status ∈ {confirmed, completed} の impl PLAN の親 L6 doc が `status: confirmed` でない — 実装が設計 confirm を追い越す「実装先行」を confirm 時点で fail-close）/ `generates_missing_test_code`（impl PLAN の `generates` に `artifact_type: test_code` が 1 件も無い — 検証資産・ドキュメント資産として残らない実装を起票時点で拒否。missing-test-plan-id 再発の根本遮断）。 |
| `planDescentMessages(result)` | OK / 違反 message（新規違反は plan_id と reason、grandfathered は件数のみ）。 |

## §3 Doctor / lint 配線

- `helix plan lint`（全 PLAN 走査時および単一 PLAN 指定時）に `plan-descent` 検査を追加し、
  違反時 `ok=false`。
- doctor に `plan-descent` gate を hard/fail-close で追加し、`runDoctor.ok` へ接続する
  （`plan-schedule` gate と同じ配線位置）。
- baseline 初期値は導入時点の全違反 plan_id を機械生成して固定する（生成コマンドを
  実装 PLAN の受入条件に含め、手書きしない）。以後、新規 impl PLAN は L4–L6 設計 doc へ
  親付けしない限り起票できない。

## §4 Test oracle 設計

Covered by `tests/plan-descent.test.ts`:

| ID | oracle |
|---|---|
| U-PDESC-001 | kind=impl + parent_design が L6 設計 doc + pair_artifact が test-design → ok |
| U-PDESC-002 | kind=impl + parent_design 省略（baseline 外）→ 新規違反 parent_design_absent |
| U-PDESC-003 | kind=impl + parent_design が docs/plans/ の PLAN や L6 以外の doc（baseline 外）→ parent_design_not_l6_design_doc |
| U-PDESC-004 | baseline 記載の既存違反 → grandfathered、ok に影響しない |
| U-PDESC-005 | baseline 件数超過（grandfather 外の追加違反）→ ok=false（ratchet） |
| U-PDESC-006 | kind=design / reverse / refactor / PLAN-DISCOVERY-* は検査対象外 |
| U-PDESC-007 | kind=impl + pair_artifact が docs/test-design/ 配下でない（baseline 外）→ pair_artifact_not_test_design |
| U-PDESC-007a | 2026-07-08 以降の kind=impl + pair_artifact が L8 単体テスト設計でない → pair_artifact_not_l8_unit_test_design |
| U-PDESC-007b | 2026-07-08 より前の legacy L7 unit pair は date grandfather で既存運用を壊さない |
| U-PDESC-008 | kind=add-impl も impl と同一検査 |
| U-PDESC-009 | kind=impl + status=confirmed + 親 L6 doc が status: draft → parent_design_not_confirmed（status=draft の impl PLAN は対象外） |
| U-PDESC-010 | kind=impl + generates に test_code なし（baseline 外）→ generates_missing_test_code |
