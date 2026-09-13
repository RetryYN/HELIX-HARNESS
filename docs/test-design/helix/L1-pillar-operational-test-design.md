---
title: "HELIX L2 柱要求のL11受入対応 — HBR/HNFR ⇔ HOT-*"
canonical_vmodel: L1-L12
canonical_layer: L11
canonical_pair: L2
legacy_physical_layer: L14
layer: L14
kind: test_design
status: draft
freeze_blocking: true
created: 2026-06-28
updated: 2026-09-14
owner: PO (人間 / RetryYN)
plan: PLAN-L1-06-helix-solo-conversion
pair_artifact: docs/design/helix/L1-requirements/pillar-requirements.md
---

# HELIX L2 柱要求のL11受入対応 (HOT-*)

現行の対はL2要求／L11受入である。本revisionは旧運用テストの受入対応を整備するdraftであり、
旧revisionのconfirmed・対凍結を引き継がない。以下のHOT13件は要求との対応を調べる移管元として保持する。
旧L14運用観測、L7単体テストのgreen、PLANへの降下記録を現行L11受入の合格証拠にしない。

現行受入への移管では、各HOTの親要求の本文・追補・revisionと、適用する利用シナリオ、
期待結果、合意記録、独立した検証証跡を対応づける。HBR9件／HNFR4件にIDが対応することは、
全条件の被覆や要求合意を証明しない。特に§2.7配布／setupと§2.8可視化の追補を落とさない。
未確認の合意・実操作・外部適用を実施済みと記録しない。

`docs/governance/downstream-canonical-reuse-authority-2026-07-19.md`によるcanonical再利用禁止は維持する。
この分類訂正だけでは個別delta・oracle・独立review・digest更新の要件を充足しない。

旧承認の記録と未移管行は履歴である。HOT-P0／P1／P6／P7は現行要求に合わせた受入案へ訂正したが、実行結果は未取得である。現在の受入成功として読まない。

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
| **HOT-P0** | HBR-P0 | 逸脱・障害を処理した後、L3で選択したFull V／Production Scrum／Hybridへ戻る。Discovery／PoCはS4判断後だけ接続する | 選択styleと復帰先が一致 / signalだけのstyle変更を拒否 / 未解決routeを完了扱いしない / budget・time-cap超過で停止し、再開時も累積制約を保持 | 未実行（現行L11受入案） |
| **HOT-P1** | HBR-P1 | L2合意とL3凍結の範囲で作業・検証・復旧を継続し、今版外作業を保全する | 委任scope内の実行で不要な再承認を要求しない / 意味変更・利用者受入・release等の人間判断を自動承認しない / job-queue二重claimなし / session再開で累積予算・期限・未完義務を初期化しない / 今版外作業の移管先を追跡できる | 未実行（現行L11受入案） |
| **HOT-P2** | HBR-P2 | subagent を loop 単位（解釈→検証→計画→実行→検証→返却）で動かし orchestrator 統括、hybrid で worker≠verifier（自己評価禁止）、不在時 fail-close。Codex worker / Codex-only / hosted API surface でも同じ判定で動く | tick が canResume gate / hybrid 不在で stopped+cross_runtime_unavailable（自己評価せず）/ selectVerifier が反対 provider / Codex `spawn_agent` が agent-guard を通る / typed tool contract registry が request/response を検証し未登録 surface を deny/defer / loop effort-budget 超過時は same worker continue/pass を出さない / Codex hook 非強制 surface では編集前 preflight が要求される | **partial**（loop 構造 + 実 runtime bridge は green: PLAN-L7-175/176/177、Codex subagent guard parity は PLAN-L7-139 continuation green、typed tool contract registry は PLAN-L7-213 green、loop effort-budget は PLAN-L7-214 green、hosted/API preflight は PLAN-L7-215 green。**残 GAP**: L14 運用観測での全 agent rule/memory 一般化は HNFR-AC 側で扱う） |
| **HOT-P3** | HBR-P3 | design⇔test-design を pair 凍結（片肺禁止）、coverage 単独 pass 禁止、合格主張は green_commands 実証跡、成果を held-out 外部真実に照合 | 片肺 freeze 試行が block / prose-only 合格主張が substance gate で reject / held-out 照合無しの完了主張を検知 | partial（pair_closure/substance gate は既存、held-out external grounding は net-new） |
| **HOT-P4** | HBR-P4 | drift/劣化/不整合を自動検出→**自動修復**、検出→routing 循環、recipe 蓄積→予防 gate/detector へ昇格 | 検出 event が修復 action へ routing / recipe が gate/detector へ promote / 劣化（flake/perf）検出が発火 | not-implemented（検出は厚いが auto-repair/promote は net-new） |
| **HOT-P6** | HBR-P6 | development sourceから生成した配布artifactを固定し、fresh repoと既存repoへ導入・更新する。開発中のPR review・CI修復と公開操作の境界を確認する | source HEAD・requirements digest・artifact digestが対応 / tagやIssue状態を要求承認に転用しない / `helix setup project`で導入しconsumer doctorで確認 / 既存成果をsilent overwrite・deleteしない / hook・adapter・state・memory・evidence・feedbackとGitHub設定計画が揃う / 更新差分・migration・rollbackを確認でき再実行が冪等 / CI greenだけでmerge・publish・tag・cutoverを許可しない | 未実行（現行L11受入案。実remote適用と公開は対応する承認境界に従う） |
| **HOT-P7** | HBR-P7 | harness/project 2層memoryを分離、全エージェント同一記憶共有（silo禁止）、SessionStart想起、GlossaryをSSoT連結。Claude内蔵memoryに寄せずCodexからも同一surfaceを読む | harness/project層分離 / Claude↔Codexが同じDB continuation projectionと`.helix/memory`を読む（silo 0）/ provider delegation evidenceとoperations transitionは監査専用でrecall sourceにしない / retire前に内容が責務正本へ反映済みでread-after可能 / 原文provenance・訂正履歴・移管先へ追跡可能 / 未反映内容のretire、lost update、二重deliver、期限切れtakeover、terminal receiptのactive再表示を拒否 / 件数・保存形式・digestの変化だけを成功または失敗の根拠にしない / secret reject / SessionStartで有界surface | 未実行（現行L11受入案。旧memory実装のgreenを本条件の受入証拠に転用しない） |
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
