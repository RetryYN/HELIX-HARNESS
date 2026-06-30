---
title: "HELIX L3 要件 — L1 pillar HBR/HNFR -> FR/AC descent"
layer: L3
kind: design
status: confirmed
created: 2026-06-28
updated: 2026-06-30
owner: AIM + TL (Codex) / PO approval required
plan: PLAN-L3-06-helix-pillar-descent
pair_artifact: docs/test-design/helix/L3-pillar-acceptance-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
related_l1: docs/design/helix/L1-requirements/pillar-requirements.md
next_pair_freeze: L12
---

# HELIX L3 要件 — L1 pillar HBR/HNFR -> FR/AC descent

> 本書は 2026-06-28 の G-REQ.L1 re-freeze 時点の `pillar-requirements.md` HBR/HNFR 全件を
> L3 の機能要件・非機能要件・受入条件へ降ろした Forward L3 confirmed 正本である。P2/P7 の実装済み back-fill
> (`orchestration-memory*.md`) は下位詳細として参照し、本書では L1 に残っていた GAP と pillar 横断 AC を閉じる。
> status は `confirmed`。charter §3 に基づく PO 承認を経て G-REQ.L3 の confirmed 正本へ昇格済み。
> 2026-06-30 に追加された L1 §2.8 asset/progress visualization 要求は、`PLAN-DISCOVERY-10` の
> S4 PO decision 待ち amendment frontier であり、本 confirmed 43 件へ混ぜない。

## §0 量閉じ

| L1 要求 | L3 展開 | 状態 |
|---------|---------|------|
| HBR-P0 | HR-FR-P0-01 / HR-FR-P0-02 | 確定済 |
| HBR-P1 | HR-FR-P1-01 / HR-FR-P1-02 / HR-FR-P1-03 / HR-FR-P1-04 | 確定済 |
| HBR-P2 | HR-FR-P2-01 / HR-FR-P2-02 / HR-FR-P2-03 / HR-FR-P2-04 + 既存 HR-BR-07/07R/13R/14R | 確定済 |
| HBR-P3 | HR-FR-P3-01 / HR-FR-P3-02 + HR-NFR-P3-01 / HR-NFR-P3-04 | 確定済 |
| HBR-P4 | HR-FR-P4-01 / HR-FR-P4-02 / HR-FR-P4-03 | 確定済 |
| HBR-P6 | HR-FR-P6-01 / HR-FR-P6-02 / HR-FR-P6-03 / HR-FR-P6-04 / HR-FR-P6-05 | 確定済 |
| HBR-P7 | HR-FR-P7-01 / HR-FR-P7-02 / HR-FR-P7-03 + 既存 HR-BR-12/12R | 確定済 |
| HBR-P8 | HR-FR-P8-01 / HR-FR-P8-02 / HR-FR-P8-03 / HR-FR-P8-04 + HR-NFR-P8-01 / HR-NFR-P8-02 / HR-NFR-P8-03 | 確定済 |
| HBR-P9 | HR-FR-P9-01 / HR-FR-P9-02 / HR-FR-P9-03 | 確定済 |
| HNFR-P3 | HR-NFR-P3-01 / HR-NFR-P3-02 / HR-NFR-P3-03 / HR-NFR-P3-04 | 確定済 |
| HNFR-P5 | HR-NFR-P5-01 / HR-NFR-P5-02 / HR-NFR-P5-03 | 確定済 |
| HNFR-P8 | HR-NFR-P8-01 / HR-NFR-P8-02 / HR-NFR-P8-03 | 確定済 |
| HNFR-AC | HR-NFR-AC-01 / HR-NFR-AC-02 / HR-NFR-AC-03 | 確定済 |

孤児 L1 pillar = 0。既存 P2/P7 back-fill に含まれる pure/runtime/bridge 要件は重複採番しない。

### §0.1 L1 amendment frontier

2026-06-30 追補の L1 §2.8 asset/progress visualization は、既存 `HBR-P9` / `HBR-P4` /
`HBR-P7` / `HNFR-P3` / `HNFR-AC` / `HNFR-P8` を親にするが、意味内容は既存
`HR-FR-P9-01..03` の単なる言い換えではない。VSCode Tree View / Webview、deterministic graph IR、
evidence drill-down、read-only first の UI/data boundary を持つ新しい要求変更である。

この amendment は `PLAN-DISCOVERY-10-helix-asset-visualization` が S3 verify 済み、S4 PO decision
待ちのため、現時点では以下を未降下として扱う。

- L3: visualization view requirements / acceptance IDs。
- L4: VSCode extension adapter、Tree View / Webview boundary、CSP / localResourceRoots、read-only action boundary。
- L5: visualization read-model contract、graph IR contract、drill-down contract。
- L6: layer tree、Mermaid-compatible graph IR、runtime evidence timeline、drill-down pointer の view-model function。
- L7: VSCode Tree View prototype、Webview graph/detail panel。

したがって、本書の「量閉じ」は 2026-06-28 freeze の 43 件に限定される。L1 §2.8 を含む revised
request 全体について「L3/L4/L6/L7 fully descended」または「L14 全件達成」と主張してはならない。

### §0.2 意味ベース機能一覧と要求修正境界

本書の機能一覧は、ID 数だけでなく「要求が何を意味しているか」で管理する。したがって、confirmed
43 件に含まれる機能、要求修正で追加された frontier、不可逆承認待ちの cutover、将来版 parked work
を混ぜて「全部終わった」とは言わない。

| 意味単位 | 要求根拠 | L3 状態 | 下流状態 / 完了境界 |
|----------|----------|---------|----------------------|
| 逸脱受け止めと Forward 収束 | HBR-P0 / HR-FR-P0-01..02 | confirmed 43 件に含む | L4-L6 へ降下済み。runtime/product 完了は各 L7/L14 evidence 別判定 |
| 連続自律走行 / Scrum 分割 / version-up | HBR-P1 / HR-FR-P1-01..04 | confirmed 43 件に含む | version-up mode は正本化済み。ただし `PLAN-L7-146` は `version_target: future` の parked で、今版完了には数えない |
| pair-agent TDD route | HR-FR-P2-04 / HAC-P2-04b | confirmed 43 件に含む | L6 `buildPairAgentTddPlan` / `runPairAgentTddPlan` へ降下済み。PLAN-L7-177 で evidence 保存・DB projection まで実装済みだが、CI/merge gate の代替ではない |
| 強い検証 / test-first / 実装精度 | HBR-P3 / HNFR-P3 | confirmed 43 件に含む | L6 verification family へ降下済み。green command・review・runtime provenance の実証跡が無い runtime claim は閉じない |
| 自動修復 / 計測改善 | HBR-P4 | confirmed 43 件に含む | detector -> repair / recipe / metric の要求は降下済み。自動適用は high-impact approval 境界に従う |
| GitHub 自動化 / setup / release / rename | HBR-P6 | confirmed 43 件に含む | setup / release dry-run / gated push は設計済み。`.ut-tdd -> .helix` rename は PLAN-M-02 の cutover/action-binding approval が無い限り audit/plan までで、apply 完了にしない |
| 共有 memory / Glossary / DDD context | HBR-P7 | confirmed 43 件に含む | L6 knowledge family へ降下済み。Glossary SSoT と context-map の runtime 完了は下位実装・検証で別判定 |
| 外部検索 / skillify / security boundary | HBR-P8 / HNFR-P8 | confirmed 43 件に含む | source attribution / sandbox / approval / security filter を要求化済み。外部 API・infra・secret 変更は action-binding approval なしに apply しない |
| DB 収束 / relation graph / contract ledger | HBR-P9 | confirmed 43 件に含む | DB 未収束 artifact は完了扱いにしない。doctor green だけでは whole-program completion の代替にならない |
| context efficiency | HNFR-P5 | confirmed 43 件に含む | 独立した business-requirement の P5 ID ではなく HNFR-P5 として P1/P3 に吸収。`HB-P5` / `HC-P5` を期待しない |
| adapter/rule/memory 一貫性 | HNFR-AC | confirmed 43 件に含む | Claude/Codex/hosted API の surface 差分は adapter/preflight で扱う。repo hook 非強制 surface を hook-covered と主張しない |
| asset/progress visualization | L1 §2.8 / PLAN-DISCOVERY-10 | S3 verified / S4 PO decision pending | L1/HOT-P9 と `VisualizationSnapshot` first response は存在するが、L3 visualization requirements、L4 UI-data boundary、L5 graph/drill-down contract、L6 view-model function、L7 VSCode View/Webview は未 confirmed |

この表は「機能一覧が合っているか」の現在の回答である。confirmed 43 件の設計降下は成立しているが、
要求修正後の revised request 全体は `PLAN-DISCOVERY-10` S4 判断と PLAN-M-02 cutover 承認が残るため、
L14 全件完了とは扱わない。

## §1 FR/AC 一覧

| ID | 親 | 要件 | 主な AC |
|----|----|------|---------|
| HR-FR-P0-01 | HBR-P0 | 全駆動 workflow は `forward_return` を持ち、Reverse/Recovery/Incident/Discovery/Refactor/Retrofit/Research/Add-feature の出口が Forward 正本へ戻るか、明示 `gap-only` / `version_target` に隔離される | HAC-P0-01a / HAC-P0-01b |
| HR-FR-P0-02 | HBR-P0 | runaway guard は budget time-cap、iteration cap、lock、Recovery escalation を単一停止判定に集約し、停止理由を state/handover に記録する | HAC-P0-02a / HAC-P0-02b |
| HR-FR-P1-01 | HBR-P1 | continuous-run engine は resume 3 条件、job-queue、budget time-cap、fresh-session 再入をつなぎ、要件承認後の無人再開を成立させる | HAC-P1-01a / HAC-P1-01b |
| HR-FR-P1-02 | HBR-P1 | `version_target` / release tag / migration / rollback を持つ version-up lifecycle を提供し、今版外作業を失わない | HAC-P1-02a / HAC-P1-02b |
| HR-FR-P1-03 | HBR-P1 | 大きい要求は Scrum / PoC / sprint backlog に自動分割され、各 slice が Forward 返却先、budget、acceptance、handover next_action を持つ | HAC-P1-03a / HAC-P1-03b |
| HR-FR-P1-04 | HBR-P1 / HBR-P3 | L2 を個別 slice で飛ばす場合でも、後続/導入時に L2 design template と mock workflow を生成・選択・back-propagation できるようにする | HAC-P1-04a / HAC-P1-04b |
| HR-FR-P2-01 | HBR-P2 | agent->tool request/response は typed contract registry で検証され、未登録 tool surface は fail-close または明示 deferred になる | HAC-P2-01a / HAC-P2-01b |
| HR-FR-P2-02 | HBR-P2 | loop 内 effort/budget は plan size、model role、iteration、tool use に紐づく上限を持ち、超過時は自己継続せず停止または version-up へ隔離する | HAC-P2-02a / HAC-P2-02b |
| HR-FR-P2-03 | HBR-P2 / HNFR-AC | Codex CLI/IDE/hosted API surface は Claude hook intent と同じ guard intent に正規化され、`apply_patch` / `write_file` / `exec_command` / `local_shell` を Claude `Edit` / `Write` / `MultiEdit` / `Bash` 相当の adapter map で扱い、repo hook 非強制 surface では編集前 git/status preflight を必須にする | HAC-P2-03a / HAC-P2-03b |
| HR-FR-P2-04 | HBR-P2 / HBR-P3 / HBR-P4 | agent loop は API/SDK 採用前提ではなく、外部 API/SDK 呼び出し前提でもなく、PLAN 駆動で動く。plan/tool/handoff/guardrail/eval outcome を harness DB の trace span として記録し、simple-composable workflow から eval green を確認してから multi-agent / long-running autonomy へ昇格する。TDD 実装では smart review agent が先に test/oracle を作り、light implementation agent が最小実装し、smart review agent が指示・テスト・レビューして fail 時に修正ループへ戻す pair programming route を持つ | HAC-P2-04a / HAC-P2-04b |
| HR-FR-P3-01 | HBR-P3 | pair_closure / 片肺禁止 / 機械判定と AI 判定の境界を L3-L7 全 gate で formalize し、coverage 単独 pass を完了根拠にしない | HAC-P3-01a / HAC-P3-01b |
| HR-FR-P3-02 | HBR-P3 / HNFR-P3 | external-truth grounding は URL/公開日/版/引用対象 span を記録し、外部根拠なき外部事実 claim を未検証として reject する | HAC-P3-02a / HAC-P3-02b |
| HR-FR-P4-01 | HBR-P4 | drift/劣化/不整合 detector の event は repair candidate、route、owner、rollback を持つ修復 action へ変換される | HAC-P4-01a / HAC-P4-01b |
| HR-FR-P4-02 | HBR-P4 | 成功 repair recipe は harness memory に記録され、頻出時は gate/detector/backlog へ promote される | HAC-P4-02a / HAC-P4-02b |
| HR-FR-P4-03 | HBR-P4 / HBR-P9 | 実装精度、レビュー指摘、再作業、テスト時間、flake、デグレ検出を metric event として収集し、改善候補へ変換する | HAC-P4-03a / HAC-P4-03b |
| HR-FR-P6-01 | HBR-P6 | gated push は GitHub Rulesets / required checks / Merge Queue で raw push を deny し、authorized path のみ通す | HAC-P6-01a / HAC-P6-01b |
| HR-FR-P6-02 | HBR-P6 | PR cross-review と CI auto-fix-repush は worker≠verifier を維持し、信頼度閾値未満または反復上限超過時は Issue/escalation に止める | HAC-P6-02a / HAC-P6-02b |
| HR-FR-P6-03 | HBR-P6 / HBR-P9 | 配布 tag/release pin から `ut-tdd setup` (rename 後 `helix setup`) で fresh/brownfield repo に hooks、Claude/Codex adapters、`.ut-tdd` / `.helix` state、memory/handover、GitHub rules/checks plan、doctor baseline を非破壊に bootstrap する | HAC-P6-03a / HAC-P6-03b |
| HR-FR-P6-04 | HBR-P1 / HBR-P6 / HBR-P9 | tag bump / release pin 更新は current/target を検出し、migration、compatibility warning、rollback point、idempotency evidence を出す | HAC-P6-04a / HAC-P6-04b |
| HR-FR-P6-05 | HBR-P6 | 自律 release tool 選定は semantic-release vs Release Please の ADR で決め、CI auto-fix repush は confidence 0.75 以上かつ iteration cap 内に限定する | HAC-P6-05a / HAC-P6-05b |
| HR-FR-P7-01 | HBR-P7 / HNFR-AC | Claude/Codex の SessionStart は同じ `.ut-tdd/memory` と `.ut-tdd/handover/provider` から bounded recall し、per-agent silo を正本にしない | HAC-P7-01a / HAC-P7-01b |
| HR-FR-P7-02 | HBR-P7 | Glossary SSoT は memory entry、DDD bounded context、docs 用語の同義語/改名を結び、用語発散を検出する | HAC-P7-02a / HAC-P7-02b |
| HR-FR-P7-03 | HBR-P7 / HBR-P9 / HNFR-AC | DDD context map は bounded context、ubiquitous language、agent/tool/memory owner、published language / anti-corruption boundary を結び、context をまたぐ命令・用語・契約の混線を検出する | HAC-P7-03a / HAC-P7-03b |
| HR-FR-P8-01 | HBR-P8 / HNFR-P3 | 外部検索・公式 docs・OSS 参照は source attribution と span-level verification を持つ research artifact に保存される | HAC-P8-01a / HAC-P8-01b |
| HR-FR-P8-02 | HBR-P8 | 有益な外部知見は skillify candidate として抽出され、ライセンス/安全/適用範囲 review 後に skill registry へ入る | HAC-P8-02a / HAC-P8-02b |
| HR-FR-P8-03 | HBR-P8 / HNFR-P8 | 外部コード実行・外部 API/GitHub 操作は MicroVM default / low-risk gVisor などの sandbox/trust-boundary と short-lived/fine-grained token 前提で、無制限実行を禁止する | HAC-P8-03a / HAC-P8-03b |
| HR-FR-P8-04 | HBR-P8 / HNFR-P8 / HNFR-AC | 外部データは raw input、trusted metadata、executable instruction を分離する security filter を通し、未信頼 text を agent/system instruction として扱わない | HAC-P8-04a / HAC-P8-04b |
| HR-FR-P9-01 | HBR-P9 | DB 未収束 artifact は完了扱いにせず、plan/status/trace/doctor が未収束を fail-close または blocker として表示する | HAC-P9-01a / HAC-P9-01b |
| HR-FR-P9-02 | HBR-P9 | cross-artifact relation graph と contract ledger は doc/code/test/PR/check/state の関係を記録し、影響範囲分析に使える | HAC-P9-02a / HAC-P9-02b |
| HR-FR-P9-03 | HBR-P9 / HBR-P3 | L階層ごとの baseline snapshot、gate result、metric trend、regression owner を harness DB に収束し、層単位のデグレを比較できる | HAC-P9-03a / HAC-P9-03b |
| HR-NFR-P3-01 | HNFR-P3 | 合格主張は green command evidence、review tier、external-truth grounding の有無を区別し、self-verification 単独を禁止する | HAC-N3-01a / HAC-N3-01b |
| HR-NFR-P3-02 | HNFR-P3 / HBR-P3 | 実装精度は design requirement ID、acceptance ID、code/test evidence、review finding の対応で計測し、未対応 claim を完了根拠にしない | HAC-N3-02a / HAC-N3-02b |
| HR-NFR-P3-03 | HNFR-P3 / HBR-P9 | L0-L14 の層単位で regression fence を持ち、変更影響層の gate/test/doctor が未実行なら pass を出さない | HAC-N3-03a / HAC-N3-03b |
| HR-NFR-P3-04 | HNFR-P3 / HBR-P3 | AI による実装作業は test-first を既定にし、Red evidence、expected failure、acceptance oracle、Green evidence、refactor safety を記録する。test-first 不適用は理由と代替 oracle を持たなければならない | HAC-N3-04a / HAC-N3-04b |
| HR-NFR-P5-01 | HNFR-P5 | injection budget は直近逐語 / rolling summary / stable constraints の 3 層と層境界数値を持ち、可逆圧縮に必要な artifact trail と raw/evidence pointer を汎用要約から分離して保持する | HAC-N5-01a / HAC-N5-01b |
| HR-NFR-P5-02 | HNFR-P5 | handover は anchored iterative 方式で固定 section に差分追記し、全再生成で Next Action / artifact trail を落とさない | HAC-N5-02a / HAC-N5-02b |
| HR-NFR-P5-03 | HNFR-P5 / HBR-P3 | verification workload は fast/default/full の test/verification profile、並列度、CPU/IO/resource budget、timeout、p95 duration budget、実行時間記録を持ち、通常 loop で必要以上の full suite を強制しない。初期 budget は fast<=120s / default<=600s / full<=1800s を上限目安とし、超過時は continuation/blocker/improvement task に変換する | HAC-N5-03a / HAC-N5-03b |
| HR-NFR-P8-01 | HNFR-P8 | 認証/認可/決済/PII/secret/license/schema migration/destructive data/external API・infra 変更は action-binding approval なしに適用しない | HAC-N8-01a / HAC-N8-01b |
| HR-NFR-P8-02 | HNFR-P8 / HBR-P8 | prompt injection / tool injection / data exfiltration 誘導を検出・分類し、外部データ由来の命令を隔離、redaction、human review、deny のいずれかに送る | HAC-N8-02a / HAC-N8-02b |
| HR-NFR-P8-03 | HNFR-P8 / HBR-P8 | agentic AI 機能は段階導入を既定にし、task-scoped permission、least privilege、監査ログ、rollback/reversibility、risk owner、継続監視、threat model 更新を持たない限り自動適用範囲へ昇格しない | HAC-N8-03a / HAC-N8-03b |
| HR-NFR-AC-01 | HNFR-AC | rule-drift は Claude/Codex だけでなく agent/template/skill/runtime adapter へ一般化し、単一 core から逸脱する規則差分を検出する | HAC-NAC-01a / HAC-NAC-01b |
| HR-NFR-AC-02 | HNFR-AC | hosted API/developer tool surface は repo hook 非強制であることを明示し、作業前 preflight と監査ログを必須にする | HAC-NAC-02a / HAC-NAC-02b |
| HR-NFR-AC-03 | HNFR-AC / HBR-P2 / HBR-P8 | AI runtime は provider API 直叩きや SDK 常駐実行を前提にせず、PLAN artifact、repo-local CLI adapter、harness DB trace、dry-run plan を正本にする。外部 API / infra / GitHub 操作は plan emit と action-binding approval を経ない限り実適用しない | HAC-NAC-03a / HAC-NAC-03b |

**検証戦略 overlay (PLAN-L7-188 採用)**: HR-NFR-P3-01〜04 / HR-NFR-P5-03 / HR-NFR-AC-02〜03 は
テスト戦略だけで閉じない。`fired` / `used` / `works` / `blocked` / `recovered` / `observed` など runtime
behavior claim は L7.5 RUN & Debug で実 `session_id`、実 `source`、adapter/runtime surface、timestamp、
evidence path を捕捉し、projection-only telemetry を未検証として扱う。これにより右腕の検証戦略を
L3 要件の受入条件として固定する。

## §2 Acceptance Criteria 詳細

| AC-ID | Given | When | Then |
|-------|-------|------|------|
| HAC-P0-01a | Reverse/Recovery/Incident/Discovery/Refactor/Retrofit/Research/Add-feature の PLAN がある | `forward_return` lint を実行 | 各 PLAN が Forward 返却先、`gap-only`、または `version_target` を持ち、欠落は fail-close |
| HAC-P0-01b | 返却先が archived / 不存在 | gate を実行 | 完了宣言を拒否し、正しい Forward 返却先の起票を next_action に出す |
| HAC-P0-02a | loop が time/iteration/budget cap に到達 | tick が評価 | `blockedReason` / stop reason / handover note を記録し、自己継続しない |
| HAC-P0-02b | lock 中に同一 plan の worker が再入 | claim を試行 | 二重実行せず retry/backoff または Recovery に送る |
| HAC-P1-01a | L3 承認済 plan が runnable かつ未 pass | scheduler が起動 | resume 3 条件、job availability、budget を満たす場合だけ worker/verifier を dispatch |
| HAC-P1-01b | context threshold 到達前 | continuation を判断 | fresh-session handover を生成し、次 session が next_action から再開できる |
| HAC-P1-02a | 今版対象外の requirement がある | plan lint / `version-up-readiness` を実行 | `version_target` と理由、activation 条件、要求・機能一覧との trace が無ければ pending として fail |
| HAC-P1-02b | tag bump を要求 | dry-run を実行 | migration/compatibility/rollback/idempotency plan を出し、破壊的操作は適用しない |
| HAC-P1-03a | L/M/Large 判定または長時間実行が必要な要求がある | planner が work breakdown を作る | Scrum / PoC / sprint backlog の slice に分解し、各 slice が parent、Forward 返却先、acceptance、budget を持つ |
| HAC-P1-03b | 分割済み slice から fresh session に再入する | handover/status を読む | 次 slice、未充足 gate、next_action が command output または handover に残り、手作業の doc 探索を前提にしない |
| HAC-P1-04a | project に L2 design/mock が無い、または今回は L2 を飛ばす | setup / planner が L2 availability を評価 | screen-list / screen-flow / screen-detail / ui-element / business-flow / wireframe の template pack と、`skip_sub_doc` / defer 理由 / 後続 gate を生成する |
| HAC-P1-04b | 外部 mock、Figma、Excalidraw、High-Fi design 等が後から戻る | back-propagation workflow を実行 | L1 screen/business/functional との不整合を検出し、必要なら L1/L2 修正と G1/G2/G3 再検証を起票する |
| HAC-P2-01a | tool call contract が registry にある | agent が tool を呼ぶ | request/response schema を検証し、結果を audit に残す |
| HAC-P2-01b | 未登録 tool surface (`spawn_agent` 等) を使う | dispatch 前 guard を実行 | fail-close または tracked deferred を要求し、自由委譲を許可しない |
| HAC-P2-02a | loop budget 上限内 | tick を実行 | iteration cost/effort を加算し、上限内なら継続可能 |
| HAC-P2-02b | loop budget 超過 | tick を実行 | stopped/escalated/version_target のいずれかに遷移し、同じ worker が pass を出さない |
| HAC-P2-03a | Codex direct CLI/IDE session | hook adapter doctor を実行 | `.codex/hooks.json` が Claude と同じ TS entrypoint を指し、Codex `apply_patch` / `write_file` / `exec_command` / `local_shell` が Claude `Edit` / `Write` / `MultiEdit` / `Bash` と同じ guard intent に map される |
| HAC-P2-03b | hosted API tool surface で編集する | 編集前 preflight を実行 | `git status` と対象 path 確認が記録され、repo hook 強制を僭称しない |
| HAC-P2-04a | single-agent workflow で解ける task がある | planner が orchestration strategy を選ぶ | simple workflow を既定にし、multi-agent 化には complexity、eval failure、parallel evidence need のいずれかの理由を要求する |
| HAC-P2-04b | loop が tool/handoff/guardrail/eval を実行する | trace collector / pair-agent planner を検査 | plan id、span id、tool contract id、handoff target、guardrail decision、eval outcome、duration/cost が replay 可能に残る。TDD pair route では smart review agent が `smart_test_author` で Red/oracle を先に作り、light implementation agent が `light_implementation` で実装し、smart review agent が `smart_review` でテスト・レビュー・VERDICT を出す。light agent は closing authority を持たず、fail verdict は smart review の bounded transcript / fix instruction を次の light implementation prompt に渡して修正ループへ戻る。`ut-tdd pair-agent run --save-evidence` は plan/run/transcript と replay 用 trace fields（run/span/tool/handoff/guardrail/eval/duration/cost）を `.ut-tdd/evidence/pair-agent/` に永続化し、DB rebuild は `model_runs` / `gate_runs` / `guardrail_decisions` へ投影し、stdout だけの一過性証跡にしない |
| HAC-P3-01a | design doc だけがある | pair-freeze を実行 | pair test-design 欠落として fail-close |
| HAC-P3-01b | coverage 数値だけが pass | review/gate を実行 | substance / trace / acceptance evidence 欠落なら完了扱いにしない |
| HAC-P3-02a | 外部事実を含む claim がある | substance gate を実行 | URL + 公開日/版 + checked span が無ければ unverified として reject |
| HAC-P3-02b | worker 自身が外部検証も行った | review を実行 | verifier が別 runtime/model でなければ judgement evidence に数えない |
| HAC-P4-01a | detector が drift/flake/perf regression を出す | routing を実行 | repair candidate、rollback、owner、risk を持つ action に変換 |
| HAC-P4-01b | repair risk が destructive / auth / PII 等に触れる | action を評価 | 自動適用せず action-binding approval 待ちにする |
| HAC-P4-02a | repair が成功し再発防止が明確 | close を実行 | harness memory と improvement backlog に recipe を保存 |
| HAC-P4-02b | 同種 repair が閾値以上に反復 | doctor を実行 | gate/detector promote candidate を出し、放置を warning 以上にする |
| HAC-P4-03a | 実装・検証・レビューが完了する | metric collector が走る | test duration、failed/retry、review finding、rework、escaped regression が plan/layer に紐づく |
| HAC-P4-03b | metric が閾値を超えるか悪化傾向を示す | improvement routing を実行 | 改善候補、owner、対象 layer、期待効果、検証 profile が backlog/memory に残る |
| HAC-P6-01a | required checks 未通過 | push/merge を試行 | ruleset/merge queue が deny し、bypass actor 以外は通らない |
| HAC-P6-01b | bypass actor が使われる | audit を確認 | actor/reason/target/expiry が無ければ拒否 |
| HAC-P6-02a | PR が作成される | workflow が動く | worker と reviewer が別 runtime/model または明示 intra-runtime fallback として記録される |
| HAC-P6-02b | CI fail に auto-fix を試みる | confidence/iteration を評価 | 閾値未満または反復上限超過で Issue/escalation に止める |
| HAC-P6-03a | fresh repo | `ut-tdd setup --dry-run` | hooks/adapters、`.ut-tdd` / `.helix` state、memory/handover、GitHub rules/checks plan、doctor baseline を生成し、無変更で終了 |
| HAC-P6-03b | brownfield repo に既存 docs/code/config がある | `ut-tdd setup --apply` | managed 区画のみ更新し、衝突は stop + diff/import report にし、未整備 sub-doc は `skip_sub_doc` / 段階移行として記録する |
| HAC-P6-04a | current tag と target tag がある | upgrade dry-run | migration/rollback/diff plan を出し、既存 state を壊さない |
| HAC-P6-04b | migration が destructive | apply を試行 | action-binding approval なしでは拒否 |
| HAC-P6-05a | release automation を選ぶ | ADR lint / plan review を実行 | semantic-release と Release Please の比較、license、PR-gate 親和性、rollback、custom gate hook 可否が記録される |
| HAC-P6-05b | CI fail に auto-fix repush を試みる | confidence を評価 | confidence が 0.75 未満または iteration cap 超過なら repush せず Issue/escalation に止める |
| HAC-P7-01a | Claude/Codex どちらかで session start | memory surface を読む | 同じ `.ut-tdd/memory/*.jsonl` から直近 12 件/240 字上限で表示 |
| HAC-P7-01b | `.claude/agent-memory` にだけ情報がある | doctor を実行 | silo として検出し、正本 memory への移行を促す |
| HAC-P7-02a | Glossary term が rename される | docs/memory lint を実行 | old/new term、bounded context、supersedes relation が trace される |
| HAC-P7-02b | 同義語が複数 docs で発散 | doctor を実行 | SSoT 未接続として warning/fail を出す |
| HAC-P7-03a | 新 agent/tool/memory surface が追加される | context-map lint を実行 | bounded context、ubiquitous language owner、published language、allowed dependencies が無ければ fail |
| HAC-P7-03b | context をまたぐ tool call / memory recall / terminology translation がある | relation graph を検査 | anti-corruption boundary または translation rule が無ければ混線 risk として warning/fail |
| HAC-P8-01a | 外部 docs/web 由来の設計 claim がある | research artifact を検査 | source URL/公開日/版/span が揃う |
| HAC-P8-01b | 出典が不明または古い可能性が高い | L3 review を実行 | 採用を保留し、一次検証 task を要求 |
| HAC-P8-02a | 外部知見が再利用可能 | skillify を実行 | skill candidate に目的、適用条件、制約、ライセンス確認欄が入る |
| HAC-P8-02b | ライセンス/安全性が未確認 | skill registry 登録を試行 | 登録を拒否し、人間確認または別 PLAN にする |
| HAC-P8-03a | 外部コード実行が必要 | sandbox policy を評価 | MicroVM default、low-risk external call は gVisor 等の profile を選び、無制限 shell/http は拒否 |
| HAC-P8-03b | 外部 API/GitHub token が必要 | action を作る | action 単位 short-lived/fine-grained token 以外は拒否 |
| HAC-P8-04a | Web/docs/OSS/issue/PR/comment など外部 text を取り込む | security filter が入力を解析 | raw content、source metadata、trusted extraction、model instruction を別 field に分離する |
| HAC-P8-04b | 外部 text に命令・secret 要求・tool 実行誘導が含まれる | agent が利用しようとする | instruction として採用せず、引用/要約対象または threat finding として扱う |
| HAC-P9-01a | generated artifact が DB/projection 未収束、または `outstanding.completionReadiness.ok=false` | complete / L14 全件達成 claim を試行 | 完了扱いを拒否し、projection rebuild、未了 PLAN の requiredAction、または defer を要求 |
| HAC-P9-01b | setup/import/upgrade baseline が未登録 | doctor を実行 | consumer baseline 未収束として表示する |
| HAC-P9-02a | doc/code/test/check の依存がある | relation graph を rebuild | relation edge と owner が記録され、impact query に出る |
| HAC-P9-02b | contract が変わる | ledger を検査 | breaking/compatible/migration-needed の分類が無ければ fail |
| HAC-P9-03a | L階層 gate が実行される | DB projection を rebuild | layer、baseline hash、gate status、metric summary、evidence path が同一 key で再現可能に記録される |
| HAC-P9-03b | 変更が L階層をまたぐ | regression query を実行 | 影響 layer、未実行 gate、悪化 metric、owner を返し、未解決なら完了扱いにしない |
| HAC-N3-01a | review_evidence が green command 無し | doctor を実行 | prose-only evidence として reject |
| HAC-N3-01b | self-review だけで gate pass を主張 | review-evidence を検査 | cross_agent ではないことを記録し、判断 gate の根拠にしない |
| HAC-N3-02a | 実装完了 claim がある | trace を検査 | design ID、AC ID、code path、test evidence、review finding status が揃わなければ fail |
| HAC-N3-02b | reviewer が精度欠陥を指摘する | close を試行 | finding が fixed/accepted-defer/escalated のいずれかに分類されるまで pass しない |
| HAC-N3-03a | 変更影響 layer がある | gate selection を実行 | 対象 L階層の gate/test/doctor profile が選ばれ、未選択理由がなければ fail |
| HAC-N3-03b | 過去 baseline と比較する | regression fence を実行 | metric/test/gate の悪化が許容閾値を超えた場合は blocker または improvement task に変換する |
| HAC-N3-04a | code behavior を変える task がある | implementation plan を検査 | failing test / Red evidence / acceptance oracle が無いまま implementation に進めない |
| HAC-N3-04b | test-first が適用不能な task がある | gate を実行 | 不適用理由、代替 oracle、review evidence、post-change regression profile が無ければ完了扱いにしない |
| HAC-N5-01a | context injection を作る | injector を実行 | 直近逐語 / rolling summary / stable constraints の層境界数値と 3 層 budget、artifact trail / raw-evidence pointer の別枠保存が守られ、summary から原証跡へ戻れる |
| HAC-N5-01b | artifact trail または raw/evidence pointer が summary にしか無い | handover lint を実行 | 可逆圧縮不能な trail 欠落として fail/warn |
| HAC-N5-02a | handover を更新する | generator を実行 | 固定 section に差分 merge し、Next Action を保持する |
| HAC-N5-02b | 全再生成で prior blockers が落ちる | lint を実行 | drift として検出する |
| HAC-N5-03a | local verification を要求する loop がある | test/verification profile を選択 | 変更影響に応じて fast/default/full を選び、選択理由、timeout、p95 duration budget、実測 duration、実行 worker 数を evidence に残す。fast は 120s 以内、default は 600s 以内を既定上限にし、超過は改善候補または blocker に分類する |
| HAC-N5-03b | full suite または高負荷検証が必要 | scheduler が実行 | full profile は 1800s 以内の p95 duration budget、並列度、CPU/IO 負荷、timeout budget を持つ。超過時は silent retry せず continuation/blocker/improvement task として扱い、通常 loop に full suite を無条件で強制しない |
| HAC-N8-01a | irreversible/high-impact operation がある | apply を試行 | action-binding approval なしに止まる |
| HAC-N8-01b | approval がある | apply 前に検査 | actor/tool/target/params/timestamp/expiry が一致しない approval は無効 |
| HAC-N8-02a | prompt injection pattern または data exfiltration 誘導がある | filter policy を評価 | threat class、source、matched rule、decision、redacted span が audit に残る |
| HAC-N8-02b | filter が high-risk と判定する | downstream tool call を生成 | deny または human review に止め、外部データが tool args / system prompt へ直結しない |
| HAC-N8-03a | agentic AI 機能を自動適用範囲へ昇格する | risk gate を実行 | task scope、permission、least privilege、rollback、monitoring、risk owner、threat model 更新が揃うまで deny |
| HAC-N8-03b | agentic AI service が外部 API / data / code execution に触れる | monitoring を確認 | audit log、异常検知、失敗時 revert/disable 手順、継続 risk review が無ければ full-auto にしない |
| HAC-NAC-01a | adapter/template/skill が core と異なる規則を書く | rule-drift を実行 | divergence として fail/warn |
| HAC-NAC-01b | 新 agent が追加される | catalog lint を実行 | shared memory/rule access を宣言しない agent は無効 |
| HAC-NAC-02a | hosted API/developer tool が repo hook 外で動く | preflight を実行 | hook 非強制の明示、git status、target paths が記録される |
| HAC-NAC-02b | preflight なしで編集済 | review を実行 | evidence 不足として差し戻す |
| HAC-NAC-03a | AI worker/verifier/agent が実行される | runtime route を検査 | provider API direct call や SDK 常駐 daemon を必須条件にせず、PLAN ID、CLI adapter route、trace row、evidence path が正本として残る |
| HAC-NAC-03b | 外部 API / infra / GitHub 設定変更が必要 | apply を要求 | 先に dry-run plan / diff / rollback / approval scope を出し、action-binding approval なしの実適用を拒否する |

## §2.5 外部技術一次検証 overlay

L1 §2.5 の「個別ツール・数値・出典は一次未検証 -> L3 で検証」を満たすため、外部技術を採用する L7
PLAN は以下の一次出典を research artifact に記録し、URL、確認日、採用可否、制約、代替案を持たなければ
ならない。未記録のまま実装・設定・依存追加へ進むことは `HAC-P8-01a/b`、`HAC-P8-02b`、
`HAC-N8-01a/b` の fail 対象とする。

| 対象 | L3 で要求する一次検証 | primary source |
|------|----------------------|----------------|
| GitHub Rulesets / push rules | raw push deny / bypass actor / required checks plan が GitHub 現行仕様で成立すること | https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets |
| GitHub Merge Queue | required status checks と `merge_group` workflow が必要なこと、fail 時に queue から外れること | https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue |
| Release Please | Conventional Commit から release PR / changelog / version bump を作ること、publication は別機構であること | https://github.com/googleapis/release-please |
| semantic-release | commit message から version / changelog / publish を自動化すること、CI 実行前提と license を確認すること | https://semantic-release.gitbook.io/semantic-release |
| OWASP LLM01 Prompt Injection | 外部データ由来の命令、indirect prompt injection、retrieval/tool 経由注入を security filter の threat class に入れる根拠 | https://genai.owasp.org/llmrisk/llm01-prompt-injection/ |
| OWASP LLM06 Excessive Agency | 過剰権限・過剰自律・human approval 境界の security 根拠。page title/content が `LLM06:2025 Excessive Agency` であることを確認する | https://genai.owasp.org/llmrisk/llm062025-excessive-agency/ |
| Firecracker MicroVM | 外部コード実行 sandbox の security boundary と Bun/TS runner 統合可否 | https://github.com/firecracker-microvm/firecracker |
| gVisor | low-risk external call 用 container sandbox profile と compatibility 制約 | https://gvisor.dev/docs/ |
| GitHub fine-grained token | short-lived / fine-grained token、expiration、permission scope、GitHub App 代替判断 | https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens |

## §2.6 2026-06 best-practice web 照会 overlay

2026-06-28 時点の公式/一次情報を照会し、loop engineering / DDD / TDD / harness engineering /
AI-driven development の実務上の不変条件として以下を L3 に取り込む。個別 source の手法を bulk import
せず、外部 API / SDK 採用も前提にしない。HELIX/harness の PLAN 駆動、V-model・gate・DB 収束へ従属させる。

| best-practice | L3 への反映 | primary source |
|---------------|-------------|----------------|
| agent loop は単純な workflow から始め、複雑性が必要な時だけ multi-agent / long-running autonomy に昇格する。tool use / handoff / guardrail は trace 可能にする。ただし OpenAI Agents 等の source は observability 概念の照会に限定し、実行は PLAN/harness DB trace で担う | `HR-FR-P2-04` / `HAC-P2-04a/b` | https://www.anthropic.com/engineering/building-effective-agents / https://developers.openai.com/api/docs/guides/agents/integrations-observability |
| agentic AI は risk governance、段階導入、least privilege、監査ログ、継続監視、rollback を持つまで自動適用範囲に入れない | `HR-NFR-P8-03` / `HAC-N8-03a/b` | https://www.cisa.gov/resources-tools/resources/careful-adoption-agentic-ai-services / https://www.nist.gov/itl/ai-risk-management-framework |
| DDD は bounded context と ubiquitous language を境界の正本にし、context 間の翻訳/依存を明示する | `HR-FR-P7-03` / `HAC-P7-03a/b` | https://martinfowler.com/bliki/BoundedContext.html / https://martinfowler.com/bliki/UbiquitousLanguage.html |
| TDD は Red/Green/Refactor と acceptance oracle を実装順序に組み込み、AI 実装でも failing test または代替 oracle を evidence にする | `HR-NFR-P3-04` / `HAC-N3-04a/b` | https://martinfowler.com/bliki/TestDrivenDevelopment.html |
| regression は code/test/doc/requirement graph と実行 evidence で追跡し、AI 生成変更の影響範囲を層別に比較する | `HR-NFR-P3-03` / `HR-FR-P9-03` / `HAC-N3-03a/b` / `HAC-P9-03a/b` | https://arxiv.org/abs/2603.17973 |
| harness engineering は test isolation、parallel worker/resource budget、trace/metric/log observability を持つ。HELIX では UI 固有 runner の採用ではなく、fast/default/full profile、worker 数、timeout、p95 duration budget、duration、flake、metric trend、span を harness DB に収束する要求へ変換する | `HR-NFR-P5-03` / `HR-FR-P4-03` / `HR-FR-P9-03` / `HAC-N5-03a/b` / `HAC-P4-03a/b` / `HAC-P9-03a/b` | https://playwright.dev/docs/best-practices / https://playwright.dev/docs/test-parallel / https://opentelemetry.io/docs/what-is-opentelemetry/ |

## §3 既存 L3 back-fill との関係

- `orchestration-memory.md`: HR-BR-07 / HR-BR-12 / HR-NFR-03 は P2/P7 の pure function 詳細であり、本書の HR-FR-P2-* / HR-FR-P7-* の下位契約として扱う。
- `orchestration-memory-runtime.md`: HR-BR-07R / HR-BR-12R / HR-NFR-03R は runtime persistence/claim の下位契約。
- `orchestration-runtime-bridge.md`: HR-BR-13R / HR-BR-14R は real adapter bridge の下位契約。
- 本書で新規に閉じる残 GAP: typed agent-tool contract、loop effort-budget、Codex hosted/subagent parity、loop trace/eval 昇格規律、Glossary SSoT、DDD context map、P0/P1（continuous-run / version-up / Scrum 分割スケール / L2 design template + mock workflow）/P3/P4/P6（TDD test-first evidence / gated push / setup / release ADR / CI repush confidence）/P8（external grounding / skillify / MicroVM/gVisor sandbox / security filter / agentic AI staged adoption）/P9、HNFR-P3（実装精度・層別 regression fence）/P5（context/test workload budget / 層境界数値 / 可逆圧縮証跡）/P8（外部データ security filter / prompt injection 防御）/AC、計測・改善基盤。

## §4 L12 pair

Pair artifact: `docs/test-design/helix/L3-pillar-acceptance-test-design.md`。

G-REQ.L3 承認時に、全 `HAC-*` が `HAT-*` で被覆されていることを確認済み。本書は PO 承認後の
`status: confirmed` 正本である。
