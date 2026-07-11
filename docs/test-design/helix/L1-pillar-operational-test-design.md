---
title: "HELIX L1 柱要件 運用テスト設計 — HBR/HNFR ⇔ HOT-* (片肺禁止 pair)"
layer: L14
kind: test_design
status: confirmed
created: 2026-06-28
updated: 2026-07-01
owner: PO (人間 / RetryYN)
plan: PLAN-L1-06-helix-solo-conversion
pair_artifact: docs/design/helix/L1-requirements/pillar-requirements.md
---

# HELIX L1 柱要件 運用テスト設計 (HOT-*)

> `docs/design/helix/L1-requirements/pillar-requirements.md`（HBR/HNFR、charter P0–P9）の **L14 対**（片肺禁止）。
> OT-* ⇔ HBR/HNFR を **1:1** で立てる。ID は HELIX 名前空間 **HOT-** で harness の OT-01..47 と非衝突。
> **PO（charter §3: L1 は人間承認）により PLAN-L1-06 Step 6 G-REQ.L1 re-freeze で対凍結済み**。
> 実装状態は虚偽宣言を禁じる（NFR-08）: P2/P7 は **partial**（loop/memory architecture + 実 runtime bridge は green: PLAN-L7-175/176/177 で U-ORCH/U-MEM/BRIDGE oracle green。typed agent↔tool request/response registry core は PLAN-L7-213、loop effort-budget core は PLAN-L7-214、hosted/API preflight core は PLAN-L7-215 で green。ただし残 GAP: 全 agent rule/memory 一般化 / Glossary SSoT）。他柱を含む未実装/partial 能力は PLAN-L3-06 / PLAN-L4-51 で要求・block へ詳細化済みで、実装完了とは扱わない。
> 本書上の `not-implemented` は runtime 実装未完了の状態を指し、要求・設計・テスト設計が未定義であることを意味しない。

## §0 量閉じ原則 (L1↔L14)

- 全 HBR（P0/P1/P2/P3/P4/P6/P7/P8/P9 = 9 件）/ 全 HNFR（P3/P5/P8/AC = 4 件）に **HOT-* を 1:1 対応**（孤児柱 = 0）。
- 各 HOT は **運用シナリオ（L14 観測可能）＋ 合否条件（機械検証可能）** を持つ。具体数値しきい値は L3 AC で確定（charter 柱の能力境界はここで凍結）。
- precedence: 仕組み=harness 上 / 機能=旧 HELIX 上、機能は仕組みを超えない。
- L14 の外部根拠は `docs/process/forward/L08-L14-verification-phase.md` の right-arm verification source
  ledger と cutover source ledger を正本とする。ledger の `checked` が未来日、または現在日から 90 日超過なら
  stale とし、HOT-P8 / HOT-P9 / HOT-N8 / HOT-NAC の pass、S4 判定、version-up activation、
  cutover/action-binding approval、whole-program completion の根拠にしない。
- source ledger 更新は date-only refresh では足りない。L14 運用観測では `source_status_delta`、
  `adoption_decision_delta`、`workflow_route_impact` を evidence に残し、公式 source の状態・採用判断・
  workflow 影響が変わる場合は対象 gate / mode / PLAN へ差し戻す。
- `completionDecisionPacket` は `generatedFrom=outstanding.completionReadiness`、許可された
  `sourceCommand`、freshness policy、`expiresAt`、`stale=false`、判断数（decision count）、record template、
  許可 outcome、次 workflow route が一致している場合だけ L14 完了判断の入力にできる。期限切れ packet、
  chat から転記された packet、または `outstanding.completionReadiness.ok=false` の packetは完了根拠にしない。

## §1 運用テスト (HOT-*、業務柱 HBR)

| ID | 対応 | 運用シナリオ | 合否条件 | 実装状態 |
|----|------|--------------|----------|----------|
| **HOT-P0** | HBR-P0 | 逸脱・失敗・暴走を driver（Reverse/Recovery/Incident）で受け、`forward_return` 規律で Forward 正本へ収束。budget time-cap 到達で runaway を停止 | 逸脱試行が driver へ routing され forward_return で Forward へ戻る / time-cap 超過で停止が記録 / 未収束 0 | not-implemented（FR 接地厚いが forward_return first-class・runaway guard は net-new） |
| **HOT-P1** | HBR-P1 | 要件承認後、engine（resume 3 条件 / job-queue / budget time-cap / fresh-session）で無人完走、Scrum 分割でスケール、version-up で今版外作業を保全 | 承認後 human 介在 0 で完走 / job-queue 二重 claim 0 / time-cap で fresh-session 再入 / version_target 外作業が version-up へ隔離 | partial（loop/job-queue は PLAN-L7-176 実装、continuous-run engine 全体・version-up lifecycle は net-new） |
| **HOT-P2** | HBR-P2 | subagent を loop 単位（解釈→検証→計画→実行→検証→返却）で動かし orchestrator 統括、hybrid で worker≠verifier（自己評価禁止）、不在時 fail-close。Codex worker / Codex-only / hosted API surface でも同じ判定で動く | tick が canResume gate / hybrid 不在で stopped+cross_runtime_unavailable（自己評価せず）/ selectVerifier が反対 provider / Codex `spawn_agent` が agent-guard を通る / typed tool contract registry が request/response を検証し未登録 surface を deny/defer / loop effort-budget 超過時は same worker continue/pass を出さない / Codex hook 非強制 surface では編集前 preflight が要求される | **partial**（loop 構造 + 実 runtime bridge は green: PLAN-L7-175/176/177、Codex subagent guard parity は PLAN-L7-139 continuation green、typed tool contract registry は PLAN-L7-213 green、loop effort-budget は PLAN-L7-214 green、hosted/API preflight は PLAN-L7-215 green。**残 GAP**: L14 運用観測での全 agent rule/memory 一般化は HNFR-AC 側で扱う） |
| **HOT-P3** | HBR-P3 | design⇔test-design を pair 凍結（片肺禁止）、coverage 単独 pass 禁止、合格主張は green_commands 実証跡、成果を held-out 外部真実に照合 | 片肺 freeze 試行が block / prose-only 合格主張が substance gate で reject / held-out 照合無しの完了主張を検知 | partial（pair_closure/substance gate は既存、held-out external grounding は net-new） |
| **HOT-P4** | HBR-P4 | drift/劣化/不整合を自動検出→**自動修復**、検出→routing 循環、recipe 蓄積→予防 gate/detector へ昇格 | 検出 event が修復 action へ routing / recipe が gate/detector へ promote / 劣化（flake/perf）検出が発火 | not-implemented（検出は厚いが auto-repair/promote は net-new） |
| **HOT-P6** | HBR-P6 | 全 gate PASS で push authorized、raw push を fail-close deny、PR 自動 cross-review、CI 失敗で auto-fix-repush、tag で版管理。配布 tag/release pin から 1 コマンドで full setup baseline を生成し、既存プロジェクト途中導入と tag bump version-up に対応 | gate 未充足 push が deny / PR が cross-review 経路に乗る / CI fail で auto-fix commit が repush / tag lifecycle が成立 / fresh repo と既存 repo で `helix setup --solo --dry-run`（rename 後は `helix setup` 相当）が hooks・Claude/Codex adapters・state/memory/evidence/feedback・GitHub rules/checks plan を生成し、session handover path/commandを生成しない / 既存 docs/code/state は import report と段階移行で扱う / version-up は target tag 差分・migration・rollback plan を出す / apply は action-binding approval 必須 / 再実行 idempotent | **partial**（`helix setup project`、consumer doctor baseline、GitHub rules/checks plan-only、fresh/brownfield import report、PATH readiness、version-up dry-run / activation packet、rename/cutover plan-only packet は L3/L6/L7 で実装・検証済み。**残 GAP**: raw push deny の実 remote enforcement、PR 自動 cross-review、CI auto-fix repush、tag/release publish の実適用は action-binding / release gate 承認前で未完） |
| **HOT-P7** | HBR-P7 | harness/project 2層memoryを分離、全エージェント同一記憶共有（silo禁止）、SessionStart想起、GlossaryをSSoT連結。Claude内蔵memoryに寄せずCodexからも同一surfaceを読む | harness/project層分離 / Claude↔Codexが同じDB continuation projectionと`.helix/memory`を読む（silo 0）/ provider delegation evidenceとoperations transitionは監査専用でrecall sourceにしない / retirement前後のcount・digest・provenance・query/export可用性が不変 / secret reject / SessionStartで有界surface | **partial**（2層memory architecture + 有界surfaceはgreen: PLAN-L7-175/176、U-MEM-001..003 green。**残GAP**: Glossary SSoT連結 / Codex SessionStart surface同一性 / preserve integrityのL7 test_code → 親HBR-P7と整合） |
| **HOT-P8** | HBR-P8 | 外部（Web/docs/OSS/tool）を検索・参照し幻覚を外部照合で抑止、有益知見を skill 化して自己取込、sandbox/trust-boundary 下で実行 | 外部照合経路が成立 / skillify ループで skill が追加 / sandbox 外アクセスが escalation へ / source ledger が fresh で `source_status_delta`・`adoption_decision_delta`・`workflow_route_impact` を記録 | **partial**（右腕 / S4 / version-up / action-binding / cutover / completion の source ledger freshness、official URL、採用判断差分、route 影響の gate は実装済み。2026-07-03 時点で Cloudflare/GitHub 等の公式 source は activation 前 evidence として packet に束縛される。**残 GAP**: 汎用 Web research loop、skillify 自己取込、sandbox/trust-boundary 実行基盤の一般化は未完） |
| **HOT-P9** | HBR-P9 | 成果物を harness.db 台帳へ収束、**DB 未収束＝未完了** enforcement、cross-artifact relation graph で影響分析、contract ledger 整合。setup/import/upgrade 後の baseline も DB/doctor に収束。VSCode Webview / View / dashboard は docs・DB・relation graph 由来の deterministic read model として進捗・依存・未収束・skill/model/runtime evidence を可視化 | 未収束 artifact の完了主張を block / relation graph で impact 算出 / contract ledger が整合 / setup/import/upgrade baseline が doctor で可視化され未収束なら完了扱いにしない / 可視化 node-edge が DB source と一致 / projection-only evidence を runtime verified と誤表示しない / action surface は approval-bound / `completionDecisionPacket` が fresh かつ `outstanding.completionReadiness.ok=true` でなければ L14 全件達成を拒否 | partial（projection 厚いが「未収束＝未完了」enforcement gate・relation graph・contract ledger は net-new。可視化要求は PLAN-DISCOVERY-10 で起票） |

## §2 非機能 運用テスト (HOT-*、非機能柱 HNFR)

| ID | 対応 | 運用シナリオ | 合否条件 | 実装状態 |
|----|------|--------------|----------|----------|
| **HOT-N3** | HNFR-P3 | pair_closure/片肺禁止/自己評価禁止を fail-close 強制、合格主張は test/command green 裏付け必須（prose 主張禁止、coding≠substance）、外部照合水準 | prose-only 主張が substance gate で reject / hybrid 自己評価が block / external-truth 照合基準を充足 | partial（substance gate 既存、external-truth 厳格性基準は net-new） |
| **HOT-N5** | HNFR-P5 | 動的注入・可逆圧縮で「必要分だけ」渡し、注入予算上限を持つ。閾値到達前にevent-first checkpointをdurable化し、fresh sessionはDB-backed next actionから再入する | 注入がbudget上限内 / event append→冪等projection成功前はcheckpoint非公開 / crash replayでnext actionを重複なく復元 / session prose・CURRENT・旧CLIを生成しない / memory surfaceが有界（直近12件・各240字） | partial（surfaceMemory有界化は実装済。event-first writer/replayer・injection budget全体・可逆圧縮CCR・resurrection detectorは後続L7実装） |
| **HOT-N8** | HNFR-P8 | 外部連携は secret 漏洩防止/信頼境界/sandbox 下のみ、不可逆操作（本番/認証認可/決済/PII/secret/license/schema migration/破壊的データ/外部 API・infra）を人間へ escalate。setup/upgrade は silent overwrite/delete/reset をしない | secret パターンが reject / 不可逆操作が escalation 境界で停止→人間 / sandbox 外アクセスが deny / setup 衝突時は stop + diff plan + backup/merge 指示で止まり、既存ファイルを黙って破壊しない / action-binding approval は actor/tool/target/params/expiry と fresh source ledger に一致する場合だけ有効 | partial（SECRET_PATTERN/guard 既存、sandbox/trust-boundary・escalation の FR 化は net-new） |
| **HOT-NAC** | HNFR-AC | 全エージェントが単一規則セット ＋ 同一記憶（P7 2 層）を共有、per-agent 規則乖離/記憶サイロ禁止、`rule-drift` を全 agent へ一般化。Claude/Codex の tool 名・hook surface 差分は adapter map で吸収 | rule-drift が adapter 乖離を block / `.codex/hooks.json` と `.claude/settings.json` が同じ TS entrypoint を指す / hosted API tool surface の hook 非強制を明示 / 全 agent が同一 `.helix/memory` を共有（silo 0）/ stale completion packet や stale source ledger を runtime parity・completion evidence にしない | partial（rule-drift は 2 adapter + hosted/API preflight core まで green。残=全 agent 一般化 + 共有 memory access の機械強制） |

## §3 trace（孤児 0）

- HBR: HBR-P0→HOT-P0 / HBR-P1→HOT-P1 / HBR-P2→HOT-P2 / HBR-P3→HOT-P3 / HBR-P4→HOT-P4 / HBR-P6→HOT-P6 / HBR-P7→HOT-P7 / HBR-P8→HOT-P8 / HBR-P9→HOT-P9。**孤児 HBR = 0**（9/9）。
- HNFR: HNFR-P3→HOT-N3 / HNFR-P5→HOT-N5 / HNFR-P8→HOT-N8 / HNFR-AC→HOT-NAC。**孤児 HNFR = 0**（4/4）。
- 逆方向: 全 HOT-* が HBR/HNFR を親に持つ（孤児 OT = 0）。

## §4 後続（L3/L4 降下後）

- 各 HOT の **具体数値しきい値（time-cap 秒数 / gate 通過率 / injection budget トークン上限等）は PLAN-L3-06 の AC で確定済み**。本書は L1 能力境界の対凍結として残す。
- partial（HOT-P2/P7）は既存 oracle（U-ORCH-001..006 + BRIDGE-01/02 / U-MEM-001..003 / U-TOOLCONTRACT-001..006 / HU-PILLAR-P2-02 / HU-PILLAR-P2-03 / HU-PILLAR-NAC-02）が L7 単体側の被覆。本 OT は L14 運用観測側の対。残 GAP（全 agent rule/memory 一般化 / Glossary SSoT）は PLAN-L3-06 / PLAN-L4-51 で降下済みで、実装・下位詳細は後続 L5+ / L7+ の対象。
- Codex runtime parity overlay（pillar-requirements §2.6）は HOT-P2/HOT-P7/HOT-NAC の acceptance に含める。Claude だけで成立する実装は L3/L7 で reject する。
- Distribution / full setup overlay（pillar-requirements §2.7）は HOT-P6/HOT-P9/HOT-N8/HOT-NAC の acceptance に含める。手作業の doc 探索、暗黙のグローバル設定、既存ファイルの silent overwrite/delete/reset、途中導入不可、version-up 不可を前提にした導入は L3/L7 で reject する。
- 残 GAP の大きい柱（P6/P8 等）は PLAN-L3-06 / PLAN-L4-51 で優先設計済み（pillar-requirements §0/§3 の GAP 大の領域）。P6/P8 は下位実装・gate が進んだため本書では `partial` として扱うが、raw push/PR/CI/release の実 remote enforcement、汎用 Web research loop、skillify、sandbox/trust-boundary の一般化は未完であり、L14 全件達成 claim の根拠にはしない。
- Asset / progress visualization overlay（pillar-requirements §2.8）は HOT-P9/HOT-P4/HOT-P7/HOT-N3/HOT-NAC の acceptance に含める。合格条件は LLM 生成図ではなく、Markdown / harness.db / relation graph / runtime evidence から deterministic に再生成できる view と evidence drill-down で判定する。
- L14 completion overlay は HOT-P9/HOT-N8/HOT-NAC の acceptance に含める。`completion-decision-packet`
  hard gate と `objective-evidence-audit` が green でも、source ledger が stale、packet が stale、
  required record / route / outcome が drift、または `outstanding.completionReadiness.ok=false` の場合は
  L14 全件達成を拒否する。
