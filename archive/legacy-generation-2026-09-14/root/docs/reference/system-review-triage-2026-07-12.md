# システム全体レビュー全件 triage（2026-07-12、PLAN-L7-425 annex）

PO 指示「全件チェック」に基づき、open のまま残る全項目を精査した結果の全件記録。
親 PLAN = `docs/plans/PLAN-L7-425-system-review-issue-handoff.md`。分類は Claude の
read-only 調査（pmo-sonnet ×3 並列）によるもので、**実処置（backlog 更新・catalog 修正・
PLAN 起票・バグ修正）は Codex が本 annex を根拠に実施する**。

## §1 improvement-backlog（open 137 件）

集計: (a) PLAN 既存・実装済 91 / (b) PLAN 起票要 30 / (c) PO 境界 1 / (d) close 候補 15。

### (b) PLAN 起票要・実害あり（30 件）

| ID | 要旨 | 根拠 |
|---|---|---|
| IMP-145 | FE設計docのbody未起票 | L6 screen-spec 等 body 起票 PLAN が未存在 |
| IMP-148 | 関係グラフ edge語彙残差 | pairs/upstream/visualizes 未同期、外部renderer未接続 |
| IMP-111 | test/review scope自動選定なし | graph から必要 test/review を自動選定する PLAN なし |
| IMP-112 | skill catalog未接続 | recommender/invocation 実装 PLAN なし |
| IMP-113 | multi-agent協調のquery不可 | team-run lifecycle 横断集計の実装なし |
| IMP-114 | CI/OS別evidence matrix無 | collector 未実装、matrix 化 PLAN なし |
| IMP-115 | guardrail DB invariants未接続 | secret/PII scan invariant 実装なし |
| IMP-116 | artifact_kind taxonomy不足 | meta-audit 分類 PLAN 未起票 |
| IMP-136 | MCP構造化launch spec欠如 | PROFILE_RUNNERS 拡張、本文で「future design PLAN」明記 |
| IMP-001 | doc-count汎用lint未実装 | 件数検証汎用化 lint なし |
| IMP-002 | 重複ID定義検出未実装 | 二重定義検出専用 lint なし |
| IMP-003 | PLAN path fs実在検証なし | parent_design 等の fs 存在チェック未実装 |
| IMP-005 | backlog→failure_log未連携 | FR-L1-19/20 未実装のまま |
| IMP-007 | pre-commit review hook未整備 | .claude hooks に code-reviewer 自動発火なし |
| IMP-008 | FR registry provenance列無 | 自由記述のまま |
| IMP-009 | subagent verdict途切れ未解消 | 機械緩和策なし、運用回避のみ |
| IMP-020 | L10 UX WCAG参照未追記 | L10 未着手（層未到達の順序待ち成分あり、要確認） |
| IMP-021 | L13検証ISO29119-2未接続 | L13 未着手（同上、要確認） |
| IMP-024 | テスト観点ISO29119-4未明記 | test-design 全般への反映 PLAN なし |
| IMP-027 | business↔L4 §番号ずれ未整合 | doctor §参照前の確定待ちのまま |
| IMP-030 | API key前提guard lint未実装 | 文言是正済も lint 化未 |
| IMP-032 | import graph drift本体未実装 | tool adapter のみ、循環/逆依存検出なし |
| IMP-033 | 自動クロスチェックengine未実装 | 5 lint 統合の大型 FR、専用 PLAN なし |
| IMP-036 | 検証roadmap§6 Reverse未起票 | back-fill PLAN 未起票のまま |
| IMP-040 | U-RULE-01粒度未細分化 | L7 TDD Red entry 待ちのまま |
| IMP-041 | ST-ASSET-04部分back-fill未 | 確定分の placeholder 解消が未着手 |
| IMP-072 | GateId形式lint未実装 | data.md §4 検証列空白のまま |
| IMP-073 | ST-EXT postcondition test不在 | L9 本起票時追加予定のまま未着手 |
| IMP-084 | 委譲成果物のcommit前review未強制 | cross_agent 順序の機械強制なし（IMP-076② と部分重複、要確認） |
| IMP-087 | orphan4件の三つ組back-fill未完 | 完了未確証（要確認） |

### (c) PO 境界（1 件）

- IMP-031: Web/DB 配置ネットワーク境界。production/external 依存拡大を伴う ADR-003 延長の判断。

### (d) 陳腐化・重複 close 候補（15 件）

IMP-004 / 013 / 014 / 017 / 018 / 019 / 022 / 023 / 025 / 026 / 029 / 035 / 086 / 088 / 118。
いずれも実装・文書の実在確認済み（詳細根拠は各 entry の trace と、
IMP-026=`src/schema/index.ts` VALID_SUB_DOCS、IMP-035=`src/plan/lint.ts` aim 必須検証、
IMP-088=`src/lint/impl-plan-trace.ts`、IMP-118=IMP-148 への統合を本文自認、等）。
close 処理は backlog の status 更新（observed/triaged → verified 等）として Codex が実施。

### 留保

(a) 91 件のうち未更新だった10件を再導出し、PLAN/source/testの三点証拠で実装済みと確認した。
対象は `IMP-034/120/121/122/123/124/126/133/134/135`。typed decision manifestへ証拠pathを固定し、
backlog statusを`implemented`へ更新した。(b) の IMP-020/021 は「実害」より「層未到達の順序待ち」の性格が強い。

### (b) 30件の起票判断（2026-07-12 Codex再監査）

| ID | 判断 | successor / 理由 |
|---|---|---|
| IMP-145 | new P0 | L6 screen-spec body Vペアを起票する |
| IMP-148 | existing-delta P1 | PLAN-L7-243/244/245 familyへedge/visualizes/renderer残差を分割接続 |
| IMP-111 | existing-delta P1 | relation-impact familyへtest/review scope oracleを追加 |
| IMP-112 | reverify P1 | L7-53/135/325/382のcatalog/recommend/injection/metricsで残差を再監査 |
| IMP-113 | existing-delta P1 | team-run familyへrun横断queryを追加 |
| IMP-114 | new P1 | CI/OS evidence matrix Vペアを起票する |
| IMP-115 | audit-then-delta P0 | secret-scan残差のPII/human downgrade/raw transcript invariantを監査後に起票 |
| IMP-116 | new P2 | artifact/review taxonomy meta-audit Vペアを起票する |
| IMP-136 | existing-delta P1 | verification-profile familyへstructured runner specを追加 |
| IMP-001 | new P2 | IMP-033 engineを使うdoc-count rule Vペアを起票する |
| IMP-002 | new P1 | duplicate-ID context rule Vペアを起票する |
| IMP-003 | existing-delta P1 | PLAN-L7-55のfrontmatter path実在scopeを拡張する |
| IMP-005 | new P2 | backlog→failure_log projection Vペアを起票する |
| IMP-007 | defer P2 | raw pre-commit hookは増やさずGitHub CI/review-bundle gateへ統合する |
| IMP-008 | new P2 | FR registry provenance列のdoc/schema Vペアを起票する |
| IMP-009 | existing-delta P1 | PLAN-L7-345へverdict先頭化/分割出力契約を追加する |
| IMP-020 | close P2 | PLAN-L4-14でWCAG 2.2 AAがui-standard/tokensへ着地済み |
| IMP-021 | defer P3 | L13到達時のsystem/acceptance verification設計へ結合する |
| IMP-024 | new P1 | ISO 29119-4観点のtest-design governance Vペアを起票する |
| IMP-027 | defer P3 | business↔L4 section binding確定後に起票する |
| IMP-030 | new P1 | API-key前提文言guard lint Vペアを起票する |
| IMP-032 | existing P0 | PLAN-REVERSE-42→Forward mergeへ結合する |
| IMP-033 | reverify P1 | L6-01/L7-95を実証し残差だけ個別起票する |
| IMP-036 | reverify P1 | PLAN-REVERSE-01/DISCOVERY-05/roadmap登録を実証する |
| IMP-040 | new P1 | U-RULE-01を10 rule型の個別oracleへ分割する |
| IMP-041 | existing-doc P2 | L6-05/06確定signatureをL9 ST-ASSET-04へbackfillする |
| IMP-072 | new P1 | GateId形式lint Vペアを起票する |
| IMP-073 | defer P2 | L9本起票時にST-EXT-05/06 postconditionへ結合する |
| IMP-084 | new P0 | delegated-freeze cross-agent-before-commit Vペアを起票する |
| IMP-087 | close P2 | PLAN-REVERSE-40で4 orphanとtest traceをbackfill済み |

最優先の新規起票はIMP-145、IMP-084、IMP-115残差の順とする。IMP-032は既存PLANへ結合し、
層未到達項目は先行孤立testを作らず明示triggerまで保留する。

## §2 design-coverage（todo 57 件）

catalog = `docs/design/design-catalog.yaml`（122 項目）。
集計: (a) status 更新漏れ 4 / (b) 未着手 53（うち na 化 6 は下記訂正で AI 判断可） / (c) 即 na 化 0。

- **(a) catalog 記述ミス 3 件（再監査で是正）**: unit-test-design / integration-test-design /
  acceptance-test-design は現行confirmed正本が実在するためdoneへ更新する。system-test-designは
  `L9-system-test-design.md`がlegacy shimであり、新規PLANの現行正本として扱えないためtodoを維持する。
- **na 化 6 件（訂正 2026-07-12: PO escalate 不要、AI 判断可）**: `server-infra` /
  `capacity-autoscale` / `identity-provisioning` / `compliance-mapping` / `api-portal-sdk` /
  `webhook-event-delivery` の各 design。当初 PO 境界として escalate したが、L0 charter
  （confirmed）が「超個人開発システム」の製品境界を定義済みであり、catalog の na 化は可逆な
  文書操作で charter §4 P8 の escalation 境界（本番影響/認証認可/決済/PII/secret/license/
  schema migration/破壊的操作/外部 API・infra 変更）のいずれにも該当しない。network-design
  （zip-25）等の既存 na と同型の根拠を記録して **Codex が na 化してよい**。
- **scrum 系 8 件の未配線検出ロジック**: `product-backlog` / `user-story-mapping` /
  `estimation-velocity` / `release-plan` / `daily-scrum-progress-record` /
  `sprint-review-record` / `retrospective-record` / `burndown-velocity-actuals` の 8 項目は、
  `src/state-db/current-location.ts`
  （SCRUM_OPERATION_SOURCES）に検出 sourcePath（`docs/112_`〜`docs/121_*.yaml`）と正規表現が
  定義済みだが対象ファイルが repo に実在しない。「検出機構だけあり成果物なし」の接続不足。
- 残る (b) は真正の未着手。必要性順の PLAN 起票は I4 の successor 判断で行い、
  全消化を claim しない。

## §3 l14-close-audit（A-144、全 10 item）

実表は closed=3（P0/P4/P9）/ blocked-human=2（P1/P8）/ partial=5（P2/P3/P5/P6/P7）。
（doctor 表示の「open=7」= blocked-human + partial の合算。）

- AI 側で進行可能: **P5-context-efficiency のみ**（router の runtime 接続残。着手前に
  `docs/plans/PLAN-L7-315-context-doc-router.md` の残スコープ裏取りが条件）。
- PO/human 境界: P1（version-up parked + PO decision）、P6 の一部（branch protection の
  external approval 範囲）、P8（PLAN-M-02 cutover signoff）。
- 別 PLAN で追跡中: P2（PLAN-L7-316）、P3（right-arm 子 gate）、P7（PLAN-L7-175/176/177）。

## §4 hook orphan（実測 4344 件）— 真因は live バグ

- orphan 定義 = `hook_events.plan_id` が `plan_registry` に解決しない行
  （`src/state-db/drive-registration.ts`）。実測: 全 6432 件中 4344 件。
- **全 4344 件の plan_id は截断 ID 5 種のみ**: `PLAN-L7-41`(3464) / `PLAN-L7-42`(342) /
  `PLAN-L7-39`(292) / `PLAN-L7-40`(231) / `PLAN-L7-37`(15)。正式 ID
  （例: `PLAN-L7-422-plan-specific-vpair-binding`）の先頭截断であり、legacy 残渣ではない。
- **真因**: `helix plan use <id>`（`src/cli.ts` → `src/runtime/session-log.ts` の
  `setActivePlan`）が `plan_registry` 照合なしで `.helix/state/current-plan` へ verbatim
  書き込みし、以後の全 hook event（tool_use/session_start/session_end/commit/memory_write/
  forced_stop）が `resolveActivePlan()` 経由で誤 ID を記録し続ける。current-plan の現在値も
  截断 ID `PLAN-L7-42` であり、監査当日まで増加継続を確認。
- 対応（PLAN-L7-425 I5 を実装項目へ格上げ）: (1) `plan use` に plan_registry 照合を追加し、
  未解決 ID は prefix 一致候補の提示 + 拒否（fail-close）。(2) 既存 orphan 4344 件は截断 ID →
  正式 ID の対応が一意に決まるなら remap、決まらないなら cleanup 判断を記録。
  (3) regression test（截断 ID 拒否 + 正常 ID 受理）を追加。
