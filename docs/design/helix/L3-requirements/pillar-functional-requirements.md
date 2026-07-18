---
title: "HELIX L3 要件 — L1 pillar HBR/HNFR -> FR/AC descent"
layer: L3
kind: design
status: confirmed
created: 2026-06-28
updated: 2026-07-06
owner: AIM + TL (Codex) / PO承認必須
plan: PLAN-L3-06-helix-pillar-descent
pair_artifact: docs/test-design/helix/L3-pillar-acceptance-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
related_l1: docs/design/helix/L1-requirements/pillar-requirements.md
next_pair_freeze: L12
---

# HELIX L3 要件 — L1 pillar HBR/HNFR -> FR/AC descent

> 本書は 2026-06-28 の G-REQ.L1 re-freeze 時点の `pillar-requirements.md` HBR/HNFR 全件を
> L3 の機能要件・非機能要件・受入条件へ降ろした Forward L3 confirmed 正本である。2026-07-06 に
> PLAN-L3-10 / PLAN-L3-11 の add-design として P9 横断 FR 3 件を追加した。P2/P7 の実装済み back-fill
> (`orchestration-memory*.md`) は下位詳細として参照し、本書では L1 に残っていた GAP と pillar 横断 AC を閉じる。
> status は `confirmed`。charter §3 に基づく PO 承認を経て G-REQ.L3 の confirmed 正本へ昇格済み。
> 2026-06-30 に追加された L1 §2.8 asset/progress visualization 要求は、2026-07-06 の PO decision で
> S4 confirmed に戻した。L1/HOT-P9 と visualization read-model は採用済みだが、L3 confirmed 46 件とは
> 別の Forward descent / UI 実装 frontier として追跡する。

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
| HBR-P9 | HR-FR-P9-01 / HR-FR-P9-02 / HR-FR-P9-03 / HR-FR-P9-04 / HR-FR-P9-05 / HR-FR-P9-06 | 確定済 |
| HNFR-P3 | HR-NFR-P3-01 / HR-NFR-P3-02 / HR-NFR-P3-03 / HR-NFR-P3-04 | 確定済 |
| HNFR-P5 | HR-NFR-P5-01 / HR-NFR-P5-02 / HR-NFR-P5-03 | 確定済 |
| HNFR-P8 | HR-NFR-P8-01 / HR-NFR-P8-02 / HR-NFR-P8-03 | 確定済 |
| HNFR-AC | HR-NFR-AC-01 / HR-NFR-AC-02 / HR-NFR-AC-03 | 確定済 |

孤児 L1 pillar = 0。既存 P2/P7 back-fill に含まれる pure/runtime/bridge 要件は重複採番しない。

### §0.1 L1 要求修正の境界

2026-06-30 追補の L1 §2.8 asset/progress visualization は、既存 `HBR-P9` / `HBR-P4` /
`HBR-P7` / `HNFR-P3` / `HNFR-AC` / `HNFR-P8` を親にするが、意味内容は既存
`HR-FR-P9-01..03` の単なる言い換えではない。VSCode Tree View / Webview、deterministic graph IR、
evidence drill-down、read-only first の UI/data boundary を持つ新しい要求変更である。

この amendment は `PLAN-DISCOVERY-10-helix-asset-visualization` が S3 verify 済みで、2026-07-06 に
PO 指示で `decision_outcome=confirmed` / `status=confirmed` へ戻した。現行 L3 46 件の意味単位には
まだ混ぜず、以下を下流実装 frontier として追跡する。

- L3: visualization view の要件 / acceptance IDs。
- L4: VSCode extension adapter、Tree View / Webview 境界、CSP / localResourceRoots、read-only action 境界。
- L5: visualization read-model 契約、graph IR 契約、drill-down 契約。
- L6: layer tree、Mermaid-compatible graph IR、runtime evidence timeline、drill-down pointer の view-model function。
- L7: VSCode Tree View prototype、Webview graph/detail panel の要件。

したがって、本書の「量閉じ」は 2026-06-28 freeze の 43 件に、2026-07-06 add-design の P9 横断 FR
3 件を加えた 46 件に限定される。L1 §2.8 は confirmed decision として残し、下流の visualization
実装・受入は別 PLAN の frontier で追跡する。

### §0.2 意味ベース機能一覧と要求修正境界

本書の機能一覧は、ID 数だけでなく「要求が何を意味しているか」で管理する。したがって、confirmed
46 件に含まれる機能、S4 confirmed 後に下流実装が未完の要求修正、不可逆 cutover defer、将来版候補を
混ぜて「採用済み機能がすべて実装完了」とは言わない。

| 意味単位 | 要求根拠 | L3 状態 | 下流状態 / 完了境界 |
|----------|----------|---------|----------------------|
| 逸脱受け止めと Forward 収束 | HBR-P0 / HR-FR-P0-01..02 | confirmed 46 件に含む | L4-L6 へ降下済み。runtime/product 完了は各 L7/L14 evidence 別判定 |
| 連続自律走行 / Scrum 分割 / version-up | HBR-P1 / HR-FR-P1-01..04 | confirmed 46 件に含む | version-up mode は正本化済み。parked work は activation decision / parked review / action-binding approval / reapproval trigger / activation snapshot binding / version dry-run result digest を plan-only activation packet に出す。HEAD/scope/source/evidence/dry-run result drift があれば dry-run・activation packet・doctor・approval packet を再実行し、古い承認根拠を流用しない。GitHub Actions を activation/dry-run に使う場合は `GITHUB_TOKEN` 権限、least privilege、`pull_request_target` 未信頼コード実行、自動 PR 承認リスクを source ledger と external rehearsal に含める。`PLAN-L7-146` は archive では閉じず、外部公開・HMAC・access-control approval が必要な future backlog として残す |
| agent/tool/runtime guardrail + pair-agent TDD route | HR-FR-P2-01..04 / HAC-P2-01a..04b | confirmed 46 件に含む | tool contract registry、loop effort budget、Codex/Claude adapter parity、hosted API preflight、pair-agent TDD route を同じ P2 runtime guardrail family として扱う。L6 `validateToolContractSurface` / `tickLoopEffortBudget` / `validateAdapterParityMap` / `requireHostedSurfacePreflight` / `buildPairAgentTddPlan` / `runPairAgentTddPlan` へ降下済み。smart test/oracle -> light implementation/consultation -> smart review/instruction -> light fix の順序契約であり、consultation question が実装証跡と混在しても pending consultation を優先する。light agent は完了/承認権限を持たず、`VERDICT` / `FINAL_VERDICT` / `COMPLETION_CLAIM` / `CLOSE_PLAN` / `PLAN_STATUS` / `READY_FOR_REVIEW` / `APPROVAL` marker を出す light output は fail-close する。pair-agent plan は task difficulty と `maxFixCyclesSource` を保持し、未指定 max cycle は difficulty policy で決め、max 到達は `max-fix-cycles-exhausted` finding として残す。PLAN-L7-177 / PLAN-L7-221 / PLAN-L7-222 で plan/run evidence 保存・DB projection まで実装済みで、plan evidence は adapter plan / prompt digest / frontier guardrail を監査可能にし、run evidence は `loop_summary` / `transcript_digest` / phase `output_excerpt_digest` により consultation/fix/review loop を監査可能にする。保存済み `phase_spans` は `smart_test_author` 起点、`light_implementation` / `smart_review` 交互順序で DB rebuild 時に再検査し、違反 evidence は `pair-agent-run-evidence` gate を `blocked` にする。local verdict と pair-agent evidence は CI/merge gate の代替ではない |
| 強い検証 / test-first / 実装精度 | HBR-P3 / HNFR-P3 | confirmed 46 件に含む | L6 verification family へ降下済み。green command・review・runtime provenance の実証跡が無い runtime claim は閉じない |
| 自動修復 / 計測改善 | HBR-P4 | confirmed 46 件に含む | detector -> repair / recipe / metric の要求は降下済み。自動適用は high-impact approval 境界に従う |
| GitHub 自動化 / setup / release / rename | HBR-P6 | confirmed 46 件に含む | setup / release dry-run / gated push は設計済み。`helix setup project` は現行 `.helix` baseline と identifier cutover packet を同時に示す bootstrap である。`PLAN-M-02` は archive せず、旧 state path / CLI rename cutover の action-binding approval / dry-run / rollback evidence が揃うまで approval-gated cutover として扱う |
| 共有 memory / Glossary / DDD context | HBR-P7 | confirmed 46 件に含む | L6 knowledge family へ降下済み。Glossary SSoT と context-map の runtime 完了は下位実装・検証で別判定 |
| 外部検索 / skillify / security boundary | HBR-P8 / HNFR-P8 | confirmed 46 件に含む | source attribution / sandbox / approval / security filter を要求化済み。外部 API・infra・secret 変更は action-binding approval なしに apply しない |
| DB 収束 / relation graph / contract ledger | HBR-P9 | confirmed 46 件に含む | DB 未収束 artifact は完了扱いにしない。doctor green だけでは whole-program completion の代替にならない |
| 文言カタログ / 要件漏れガード | HBR-P9 / HNFR-AC | confirmed 46 件に含む | 人間向け prose の差し替え自由度、machine-surface 固定、中間層 FR 到達集計、inventory evidence を P9 横断検査として追加する。既存 gate の判定意味を変えず、カタログ外部化と起草前 inventory の証跡を fail-close oracle にする |
| context efficiency | HNFR-P5 | confirmed 46 件に含む | 独立した business-requirement の P5 ID ではなく HNFR-P5 として P1/P3 に吸収。`HB-P5` / `HC-P5` を期待しない |
| adapter/rule/memory 一貫性 | HNFR-AC | confirmed 46 件に含む | Claude/Codex/hosted API の surface 差分は adapter/preflight で扱う。repo hook 非強制 surface を hook-covered と主張しない |
| design-bottomup mode | PLAN-DISCOVERY-07 / PO design-bottomup request | S4 confirmed | backend から FE 要件を洗い出す elicitation engine と Discovery 合成は S3 verified 済み。2026-07-06 PO 指示で confirmed に戻し、Forward descent と中央 UI dogfood を未完 frontier として扱う |
| asset/progress visualization | L1 §2.8 / PLAN-DISCOVERY-10 | S4 confirmed | L1/HOT-P9 と `VisualizationSnapshot` first response は存在する。2026-07-06 PO 指示で confirmed に戻し、VSCode View/Webview visualization workflow は下流実装 frontier として扱う |
| L1-L2 elicitation cycle | PO 対話 / PLAN-DISCOVERY-11 / PLAN-REVERSE-329 | S4 confirmed / Reverse fullback pending | 画面 mock で要求を洗い出す greenfield 前段サイクルは S4 confirmed。Reverse fullback 完了までは A-40 G1-trace 再検証フック、L1/L2 consistency lint、gap-check read-only 結線を current completion に混ぜない |

この表は「機能一覧が合っているか」の現在の回答である。confirmed 46 件の設計降下は成立しているが、
要求修正後の revised request のうち、confirmed overlay の未登録 frontier は 0 件である。一方、現行 completion scope に残す live semantic frontier は 2 件である。

G-SF `semantic_feature_frontier_record` への写像:

- confirmed 46 件: `classification=confirmed_current`。L3/L12 pair は本書と
  `docs/test-design/helix/L3-pillar-acceptance-test-design.md`。live `outstanding.confirmedCurrentMeaningRecords[]`
  は 12 件の意味単位で 46 件全 ID を束ね、未対応 ID がある場合は `semantic-frontier-consistency` で fail する。
- current semantic frontier: confirmed 46 件の L3/L12 overlay は閉じており、`confirmed_overlay_frontier_count=0` として扱う。
  live completion frontier は `live_semantic_frontier_count=2` であり、`completion-decision-packet decisionCount=2` と同じ
  2 件を archive で隠さず別 packet で追跡する。
  - `PLAN-L7-146`: serverless readonly share は external publish / HMAC / access-control の承認が必要な
    future backlog として保持する。
  - `PLAN-M-02`: identifier rename は `.helix` state / CLI / hook / consumer template / distribution surface を
    またぐ `approval-gated cutover` であり、action-binding approval / dry-run / rollback evidence なしに実移行しない。
- frontier vocabulary: `frontier_pending_decision` / `parked_future_version` / `approval_gated_cutover` は将来再起票用に保持する。
  将来 `design-bottomup mode`、`asset/progress visualization`、`serverless readonly share`、`identifier rename`
  を再開する場合は新規 PLAN で再起票し、current snapshot / S4 decision / activation / cutover / action-binding
  evidence を取り直す。

この record が更新されていない要求修正は、doctor green や selected test green があっても G3/G7/accept の完了根拠にしない。
S4 / completion packet は意味証跡も同じ frontier 契約で扱う。S4 `verified_evidence` / `external_source_basis` は
test path、実行 command、repo doc path、PLAN ID、URL、hash などの具体 locator を持つ必要があり、`looks fine` / `ok`
のような prose-only review は完了・昇格材料にしない。pending S4 の `route_impact` は confirmed / rejected / pivot
の三分岐を同時に示し、confirmed 後の `forward_route` は L1/L3-L6、`PLAN-L*`、`PLAN-REVERSE-*`、
または `docs/design|test-design|process|plans/...` の具体 target を指す。`PLAN-DISCOVERY-*` は follow-up PoC /
pivot route としてのみ扱い、confirmed の Forward/Reverse 昇格先にしない。completion decision packet が S4
supporting summary を表示する場合は `decisionEvidenceChecklist`、`outcomeRouteMatrix`、
`semanticFeatureFrontierRecord`、`provenanceRequirements` をすべて review field として保持する。

## §1 FR/AC 一覧

| ID | 親 | 要件 | 主な AC |
|----|----|------|---------|
| HR-FR-P0-01 | HBR-P0 | 全駆動 workflow は `forward_return` を持ち、Reverse/Recovery/Incident/Discovery/Refactor/Retrofit/Research/Add-feature の出口が Forward 正本へ戻るか、明示 `gap-only` / `version_target` に隔離される | HAC-P0-01a / HAC-P0-01b |
| HR-FR-P0-02 | HBR-P0 | runaway guard は budget time-cap、iteration cap、lock、Recovery escalation を単一停止判定に集約し、停止理由をappend-only continuation eventへ先にdurable appendし、DBへ冪等投影してから公開する | HAC-P0-02a / HAC-P0-02b |
| HR-FR-P1-01 | HBR-P1 | continuous-run engine は resume 3 条件、job-queue、budget time-cap、fresh-session 再入をつなぎ、要件承認後の無人再開を成立させる | HAC-P1-01a / HAC-P1-01b |
| HR-FR-P1-02 | HBR-P1 | `version_target` / release tag / migration / rollback を持つ version-up lifecycle を提供し、今版外作業を失わない。parked work は activation decision、parked review、action-binding approval、reapproval trigger を `version-up-activation-packet.v1` として出せるが、packet は plan-only で apply surface を持たない。HEAD/scope/source/evidence drift がある場合は dry-run・doctor・approval packet を再実行し、古い承認根拠を流用しない。GitHub Actions を activation/dry-run workflow として採用する候補では、`GITHUB_TOKEN` 権限、least privilege、`pull_request_target` 未信頼コード実行、自動 PR 承認リスクを `approval_scope` / `dry_run_plan` / `external_rehearsal_plan` / provenance / audit の判断材料に含め、CI があることを安全証明にしない。同一 PLAN に複数判断境界がある場合は `relatedDecisionPackets[]` で primary/supporting packet route を保持し、S4 / version-up / rename / action-binding のどれか一つだけを見て完了扱いしない | HAC-P1-02a / HAC-P1-02b |
| HR-FR-P1-03 | HBR-P1 | 大きい要求は Scrum / PoC / sprint backlog に自動分割され、各 slice が Forward 返却先、budget、acceptance、DB-backed next_action を持つ | HAC-P1-03a / HAC-P1-03b |
| HR-FR-P1-04 | HBR-P1 / HBR-P3 | L2 を個別 slice で飛ばす場合でも、後続/導入時に L2 design template と mock workflow を生成・選択・back-propagation できるようにする | HAC-P1-04a / HAC-P1-04b |
| HR-FR-P2-01 | HBR-P2 | agent->tool request/response は typed contract registry で検証され、未登録 tool surface は fail-close または明示 deferred になる | HAC-P2-01a / HAC-P2-01b |
| HR-FR-P2-02 | HBR-P2 | loop 内 effort/budget は plan size、model role、iteration、tool use に紐づく上限を持ち、超過時は自己継続せず停止または version-up へ隔離する | HAC-P2-02a / HAC-P2-02b |
| HR-FR-P2-03 | HBR-P2 / HNFR-AC | Codex CLI/IDE/hosted API surface は Claude hook intent と同じ guard intent に正規化され、`apply_patch` / `write_file` / `exec_command` / `local_shell` を Claude `Edit` / `Write` / `MultiEdit` / `Bash` 相当の adapter map で扱い、repo hook 非強制 surface では編集前 git/status preflight を必須にする | HAC-P2-03a / HAC-P2-03b |
| HR-FR-P2-04 | HBR-P2 / HBR-P3 / HBR-P4 | agent loop は API/SDK 採用前提ではなく、外部 API/SDK 呼び出し前提でもなく、PLAN 駆動で動く。plan/tool/handoff/guardrail/eval outcome を harness DB の trace span として記録し、simple-composable workflow から eval green を確認してから multi-agent / long-running autonomy へ昇格する。TDD 実装では smart review agent が先に test/oracle を作り、light implementation agent が最小実装し、smart review agent が指示・テスト・レビューして fail 時に修正ループへ戻す pair programming route を持つ。light implementation は changed-files / targeted-test-command / implementation-notes の実装証跡、または consultation question を出し、consultation は pass ではなく smart review の implementation directive / fix response を経て次の light fix cycle に戻す。consultation question がある出力は、同時に implementation evidence を含んでも pending consultation として扱い、smart response 無しに pass へ進めない | HAC-P2-04a / HAC-P2-04b |
| HR-FR-P2-05 | HBR-P2 / HNFR-AC | 外部AI worker runtimeはversioned descriptorへ登録し、隔離worktree、secret task deny、non-authoritative output、provider別capabilityを宣言しない限り起動しない | HAC-P2-05a / HAC-P2-05b |
| HR-FR-P2-06 | HBR-P2 / HNFR-AC | delegation adapterはapproval request、tool call、result、errorをtyped eventとして受け、Node control planeだけがapproval policyとrepository／DB write transactionを決定する | HAC-P2-06a / HAC-P2-06b |
| HR-FR-P2-07 | HBR-P2 / HNFR-P8 | repository-level permanent bypass denyが有効な場合、one-shot override marker、runtime flag、provider optionのいずれもdenyを解除できない | HAC-P2-07a / HAC-P2-07b |
| HR-FR-P2-08 | HBR-P2 / HNFR-P3 | worker outputはstrict既定のschema／digest validation profileを通し、緩和profileはPLAN、理由、対象field、期限、再検証receiptを持つ | HAC-P2-08a / HAC-P2-08b |
| HR-FR-P3-01 | HBR-P3 | pair_closure / 片肺禁止 / 機械判定と AI 判定の境界を L3-L7 全 gate で formalize し、coverage 単独 pass を完了根拠にしない | HAC-P3-01a / HAC-P3-01b |
| HR-FR-P3-02 | HBR-P3 / HNFR-P3 | external-truth grounding は URL/公開日/版/引用対象 span を記録し、外部根拠なき外部事実 claim を未検証として reject する | HAC-P3-02a / HAC-P3-02b |
| HR-FR-P4-01 | HBR-P4 | drift/劣化/不整合 detector の event は repair candidate、route、owner、rollback を持つ修復 action へ変換される | HAC-P4-01a / HAC-P4-01b |
| HR-FR-P4-02 | HBR-P4 | 成功 repair recipe は harness memory に記録され、頻出時は gate/detector/backlog へ promote される | HAC-P4-02a / HAC-P4-02b |
| HR-FR-P4-03 | HBR-P4 / HBR-P9 | 実装精度、レビュー指摘、再作業、テスト時間、flake、デグレ検出を metric event として収集し、改善候補へ変換する | HAC-P4-03a / HAC-P4-03b |
| HR-FR-P6-01 | HBR-P6 | gated push は GitHub Rulesets / required checks / Merge Queue で raw push を deny し、authorized path のみ通す | HAC-P6-01a / HAC-P6-01b |
| HR-FR-P6-02 | HBR-P6 | PR cross-review と CI auto-fix-repush は worker≠verifier を維持し、信頼度閾値未満または反復上限超過時は Issue/escalation に止める | HAC-P6-02a / HAC-P6-02b |
| HR-FR-P6-03 | HBR-P6 / HBR-P9 | 配布 tag/release pin から現行 `helix setup project` で fresh/brownfield repo に hooks、Claude/Codex adapters、現行 `.helix` state/memory/evidence/feedback/teams baseline（session handover path/commandは生成しない）、GitHub rules/checks plan、consumer repo 用 doctor baseline を非破壊に bootstrap する。consumer repo の初回 health check は dogfood repo 用 full `helix doctor` ではなく、setup 投影済み adapter / VSCode task / `.helix` baseline / `.helix/teams/default-hybrid.yaml` だけを検査する `helix doctor --profile consumer` を使い、`docs/plans` / `docs/design/harness` / `docs/test-design` / runtime state を要求しない。`AGENTS.md` が案内する team run は配布済み YAML と `helix team run --definition .helix/teams/default-hybrid.yaml --mode hybrid --json` の dry-run 検証へ接続し、案内だけで実行対象が無い状態を許さない。`consumerReadiness` は Bun/git/CLI/runtime の環境確認だけでなく、投影済み `AGENTS.md` managed block、VSCode manual task、`.helix` memory/evidence/feedback/teams baseline、`default-hybrid` の Codex worker / TL reviewer 分離を `artifactReadiness` として検査し、artifact の意味ずれがあれば `ready` ではなく `fix_consumer_readiness` に戻す。monorepo consumer は `helix setup project --package-root <path>` で package root を明示でき、setup JSON は repo-root scoped adapter と packageRoot scoped CLI readiness (`consumerReadiness.workspace` / `cliResolution`) を分けて記録する。CLI readiness は projected hook / agent が呼ぶ bare `helix --version` の PATH 解決を必須にし、packageRoot の `package.json` に `scripts.helix` があり `bun run helix ...` で解決できる経路を `cliResolution.strategy=package-script` / `helix-package-script` の CI / VS Code task 証跡として記録する。bare PATH だけで `scripts.helix` が無い場合も、生成済み task / CI が `bun run helix ...` を実行できないため `ok=false` のまま `fix_consumer_readiness` に戻す。package script のみでは `bareCommandResolved=false` / `ok=false` のまま `fix_consumer_readiness` に戻し、VSCode task / CI / package-local smoke の成功を hook 自走性の証明にしない。brownfield では `importReport` に managed/preview/existing/written/skipped paths、managed-block merge 対象、`requiresReview`、`nextRoute=review_import_report` を出し、既存 non-mergeable config を黙って成功扱いにしない。setup 結果は `postSetupWorkflow` に `nextRoute=ready|review_import_report|fix_consumer_readiness`、未充足 gate、次 action、検証 command を構造化し、利用者が手作業で設計文書を探索しなくても初回 HELIX 稼働ルートを判定できるようにする。rename/cutover は PLAN-M-02 承認待ちとして明示し、setup 完了と cutover 完了を混同しない。`canonicalCommand=helix setup project` は現行 command であり、`commandAvailability.canonicalCommandAvailable` で環境上の解決性を出す | HAC-P6-03a / HAC-P6-03b |
| HR-FR-P6-04 | HBR-P1 / HBR-P6 / HBR-P9 | tag bump / release pin 更新は current/target を検出し、migration、compatibility warning、rollback point、idempotency evidence を出す。PLAN-M-02 identifier rename は `helix` / `.helix` / `area=helix` の hit 数だけでなく、source/test/runtime-state/adapter-config/consumer-template/plan/design/governance/distribution surface 別の blast-radius checklist を出し、cutover/action-binding approval 前に旧識別子残渣を apply 可能と誤認させない。rename cutover の approval 判定は `approve_cutover` / `approve_action_binding` と actor/tool/target だけでは足りず、approved params、current `cutoverSnapshot` sha256 binding、review evidence、expiry、audit、backup/rollback/monitoring evidence が揃うまで blocked にする | HAC-P6-04a / HAC-P6-04b |
| HR-FR-P6-05 | HBR-P6 | 自律 release tool 選定は semantic-release vs Release Please の ADR で決め、CI auto-fix repush は confidence 0.75 以上かつ iteration cap 内に限定する | HAC-P6-05a / HAC-P6-05b |
| HR-FR-P6-06 | HBR-P6 / HNFR-AC | distribution packageはcanonical index、機械生成index、first/third-party区分、source provenance、license、免責、artifact digestを持ち、generated index手編集と未承認cutoverを拒否する | HAC-P6-06a / HAC-P6-06b |
| HR-FR-P7-01 | HBR-P7 / HNFR-AC | Claude/Codex の SessionStart は同じDB continuation projectionと`.helix/memory`からbounded recallし、per-agent siloやprose continuationを正本にしない。provider delegation evidenceは監査専用に保持し、recall/continuation sourceへjoinしない | HAC-P7-01a / HAC-P7-01b |
| HR-FR-P7-02 | HBR-P7 | Glossary SSoT は memory entry、DDD bounded context、docs 用語の同義語/改名を結び、用語発散を検出する | HAC-P7-02a / HAC-P7-02b |
| HR-FR-P7-03 | HBR-P7 / HBR-P9 / HNFR-AC | DDD context map は bounded context、ubiquitous language、agent/tool/memory owner、published language / anti-corruption boundary を結び、context をまたぐ命令・用語・契約の混線を検出する | HAC-P7-03a / HAC-P7-03b |
| HR-FR-P8-01 | HBR-P8 / HNFR-P3 | 外部検索・公式 docs・OSS 参照は source attribution と span-level verification を持つ research artifact に保存される | HAC-P8-01a / HAC-P8-01b |
| HR-FR-P8-02 | HBR-P8 | 有益な外部知見は skillify candidate として抽出され、ライセンス/安全/適用範囲 review 後に skill registry へ入る | HAC-P8-02a / HAC-P8-02b |
| HR-FR-P8-03 | HBR-P8 / HNFR-P8 | 外部コード実行・外部 API/GitHub 操作は MicroVM default / low-risk gVisor などの sandbox/trust-boundary と short-lived/fine-grained token 前提で、無制限実行を禁止する | HAC-P8-03a / HAC-P8-03b |
| HR-FR-P8-04 | HBR-P8 / HNFR-P8 / HNFR-AC | 外部データは raw input、trusted metadata、executable instruction を分離する security filter を通し、未信頼 text を agent/system instruction として扱わない | HAC-P8-04a / HAC-P8-04b |
| HR-FR-P9-01 | HBR-P9 | DB 未収束 artifact は完了扱いにせず、plan/status/trace/doctor が未収束を fail-close または blocker として表示する | HAC-P9-01a / HAC-P9-01b |
| HR-FR-P9-02 | HBR-P9 | cross-artifact relation graph と contract ledger は doc/code/test/PR/check/state の関係を記録し、影響範囲分析に使える | HAC-P9-02a / HAC-P9-02b |
| HR-FR-P9-03 | HBR-P9 / HBR-P3 | L階層ごとの baseline snapshot、gate result、metric trend、regression owner を harness DB に収束し、層単位のデグレを比較できる | HAC-P9-03a / HAC-P9-03b |
| HR-FR-P9-04 | HBR-P9 / HNFR-AC | CLI、doctor、handover、completion packet、consumer guidance などの人間向け prose 文言は message catalog を正本にできる。`OK` / `warning` / `violation` / JSON key / env 名 / command 名などの machine-surface token は差し替え対象外として固定し、カタログ schema、欠落 key fail-close、未使用 key 検出、既存文言の baseline/grandfather を持つ | HAC-P9-04a / HAC-P9-04b |
| HR-FR-P9-05 | HBR-P9 / HBR-P3 | FR registry は L3→L4→L5→L6 の中間層到達状況を層別に集計し、途中層で止まった FR、層を飛ばした FR、新規停滞を可視化・fail-close できる。既存 `descent-obligation` / `l6-fr-coverage` の判定意味は変えず、chain データの横断集計だけを追加する | HAC-P9-05a / HAC-P9-05b |
| HR-FR-P9-06 | HBR-P9 / HNFR-AC | design / add-design PLAN は要件起草前 inventory evidence を構造化フィールドで持ち、既存資産、旧 HELIX repo、関連 gate/docs の照合先、照合日、採否結論、未採用理由を記録する。prose-only の「確認済み」は証跡にせず、baseline 対象外の新規 PLAN は evidence 欠落のまま confirmed に到達できない | HAC-P9-06a / HAC-P9-06b |
| HR-NFR-P3-01 | HNFR-P3 | 合格主張は green command evidence、review tier、external-truth grounding の有無を区別し、self-verification 単独を禁止する | HAC-N3-01a / HAC-N3-01b |
| HR-NFR-P3-02 | HNFR-P3 / HBR-P3 | 実装精度は design requirement ID、acceptance ID、code/test evidence、review finding の対応で計測し、未対応 claim を完了根拠にしない | HAC-N3-02a / HAC-N3-02b |
| HR-NFR-P3-03 | HNFR-P3 / HBR-P9 | canonical L1〜L12の層単位でregression fenceを持ち、変更影響層のgate/test/doctorが未実行ならpassを出さない。legacy L0〜L14はcanonical層へ写像して評価する | HAC-N3-03a / HAC-N3-03b |
| HR-NFR-P3-04 | HNFR-P3 / HBR-P3 | AI による実装作業は test-first を既定にし、Red evidence、expected failure、acceptance oracle、Green evidence、refactor safety を記録する。test-first 不適用は理由と代替 oracle を持たなければならない | HAC-N3-04a / HAC-N3-04b |
| HR-NFR-P5-01 | HNFR-P5 | injection budget は直近逐語 / rolling summary / stable constraints の 3 層と層境界数値を持ち、可逆圧縮に必要な artifact trail と raw/evidence pointer を汎用要約から分離して保持する | HAC-N5-01a / HAC-N5-01b |
| HR-NFR-P5-02 | HNFR-P5 | continuation checkpointはappend-only eventを先にdurable appendし、event idでDB projectionを冪等更新した後だけ公開する。append後/projection前crashからのrestart、bounded memory breadcrumbを保証する。session prose / `CURRENT.json` / handover CLIを生成せず、provider delegation evidenceは別契約として保持する | HAC-N5-02a / HAC-N5-02b |
| HR-NFR-P5-03 | HNFR-P5 / HBR-P3 | verification workload は fast/default/full の test/verification profile、並列度、CPU/IO/resource budget、timeout、p95 duration budget、実行時間記録を持ち、通常 loop で必要以上の full suite を強制しない。初期 budget は fast<=120s / default<=600s / full<=1800s を上限目安とし、超過時は continuation/blocker/improvement task に変換する | HAC-N5-03a / HAC-N5-03b |
| HR-NFR-P8-01 | HNFR-P8 | 認証/認可/決済/PII/secret/license/schema migration/destructive data/external API・infra 変更は action-binding approval なしに適用しない。version-up activation / rename cutover の action-binding approval は `reviewed_snapshot_binding` に packet field 名だけでなく current `sha256:` snapshotId を記録するまで pending とし、古い承認材料を実行許可に流用しない | HAC-N8-01a / HAC-N8-01b |
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
| HAC-P0-02a | loop が time/iteration/budget cap に到達 | tick が評価 | `blockedReason` / stop reasonをevent-firstで保存し、DB投影成功後だけcheckpointを公開して自己継続しない |
| HAC-P0-02b | lock 中に同一 plan の worker が再入 | claim を試行 | 二重実行せず retry/backoff または Recovery に送る |
| HAC-P1-01a | L3 承認済 plan が runnable かつ未 pass | scheduler が起動 | resume 3 条件、job availability、budget を満たす場合だけ worker/verifier を dispatch |
| HAC-P1-01b | context threshold 到達前 | continuation を判断 | eventをdurable appendしてDBへ冪等投影し、成功後にbounded memory breadcrumbを残す。crash後の次sessionはDB-backed next_actionから再開し、prose artifactを生成しない |
| HAC-P1-02a | 今版対象外の requirement がある | plan lint / `version-up-readiness` / activation packet surface を実行 | `version_target` と理由、activation 条件、要求・機能一覧との trace、plan-only activation packet が無ければ pending として fail。GitHub Actions activation/dry-run workflow を含む場合は secure-use source ledger、`GITHUB_TOKEN` 権限、least privilege、`pull_request_target`、自動 PR 承認リスクが approval / dry-run / external rehearsal / provenance / audit に接続していなければ fail。packet が apply command / activation permission を持つ場合も fail |
| HAC-P1-02b | tag bump を要求 | dry-run を実行 | migration/compatibility/rollback/idempotency plan を出し、破壊的操作は適用しない |
| HAC-P1-03a | L/M/Large 判定または長時間実行が必要な要求がある | planner が work breakdown を作る | Scrum / PoC / sprint backlog の slice に分解し、各 slice が parent、Forward 返却先、acceptance、budget を持つ |
| HAC-P1-03b | 分割済み slice から fresh session に再入する | status/continuation projectionを読む | 次slice、未充足gate、next_actionがDB projectionとcommand outputに残り、手作業のdoc探索やprose fileを前提にしない |
| HAC-P1-04a | project に L2 design/mock が無い、または今回は L2 を飛ばす | setup / planner が L2 availability を評価 | screen-list / screen-flow / screen-detail / ui-element / business-flow / wireframe の template pack と、`skip_sub_doc` / defer 理由 / 後続 gate を生成する |
| HAC-P1-04b | 外部 mock、Figma、Excalidraw、High-Fi design 等が後から戻る | back-propagation workflow を実行 | L1 screen/business/functional との不整合を検出し、必要なら L1/L2 修正と G1/G2/G3 再検証を起票する |
| HAC-P2-01a | tool call contract が registry にある | agent が tool を呼ぶ | request/response schema を検証し、結果を audit に残す |
| HAC-P2-01b | 未登録 tool surface (`spawn_agent` 等) を使う | dispatch 前 guard を実行 | fail-close または tracked deferred を要求し、自由委譲を許可しない |
| HAC-P2-02a | loop budget 上限内 | tick を実行 | iteration cost/effort を加算し、上限内なら継続可能 |
| HAC-P2-02b | loop budget 超過 | tick を実行 | stopped/escalated/version_target のいずれかに遷移し、同じ worker が pass を出さない |
| HAC-P2-03a | Codex direct CLI/IDE session | hook adapter doctor を実行 | `.codex/hooks.json` が Claude と同じ TS entrypoint を指し、Codex `apply_patch` / `write_file` / `exec_command` / `local_shell` が Claude `Edit` / `Write` / `MultiEdit` / `Bash` と同じ guard intent に map される |
| HAC-P2-03b | hosted API tool surface で編集する | 編集前 preflight を実行 | `git status` と対象 path 確認が記録され、repo hook 強制を僭称しない |
| HAC-P2-04a | single-agent workflow で解ける task がある | planner が orchestration strategy を選ぶ | simple workflow を既定にし、multi-agent 化には complexity、eval failure、parallel evidence need のいずれかの理由を要求する |
| HAC-P2-04b | loop が tool/handoff/guardrail/eval を実行する | trace collector / pair-agent planner を検査 | plan id、span id、tool contract id、handoff target、guardrail decision、eval outcome、duration/cost が replay 可能に残る。TDD pair route では smart review agent が `smart_test_author` で Red/oracle を先に作り、`RED_TEST_COMMAND` と非ゼロ `RED_EXIT_CODE` で Red 実行を証明してから、light implementation agent が `light_implementation` で実装し、smart review agent が `smart_review` でテスト・レビュー・VERDICT を出す。light agent は closing authority を持たず、`light_implementation` は changed-files / targeted-test-command / implementation-notes の実装証跡、または consultation question を出す。light output が `VERDICT` / `FINAL_VERDICT` / `COMPLETION_CLAIM` / `CLOSE_PLAN` / `PLAN_STATUS` / `READY_FOR_REVIEW` / `APPROVAL` marker を出した場合は、light agent が完了/承認を主張したものとして error にする。consultation question は pass ではなく、smart review の implementation directive / fix response を bounded transcript に残して次の light fix cycle へ戻す。consultation question が実装証跡と混在しても pending consultation を優先し、smart response を欠く場合は error にする。fail verdict は smart review の bounded transcript / fix instruction を次の light implementation prompt に渡して修正ループへ戻る。difficulty policy は `trivial/simple=1`, `standard=2`, `complex=3`, `critical=4` の fix-cycle 予算を導出し、明示上書きと区別して evidence に残す。max cycle 到達は `max-fix-cycles-exhausted` finding を返す。`helix pair-agent plan --save-evidence` は adapter plan / prompt digest / frontier guardrail decision を `.helix/evidence/pair-agent/` に永続化し、DB rebuild は plan phase agent を `model_runs`、plan gate を `gate_runs`、frontier approval を `guardrail_decisions` へ投影する。`helix pair-agent run --save-evidence` は plan/run/transcript と replay 用 trace fields（run/span/tool/handoff/guardrail/eval/duration/cost）、`loop_summary`、`transcript_digest`、phase `output_excerpt_digest` を永続化する。DB rebuild は保存済み `phase_spans` の `smart_test_author` -> `light_implementation` -> `smart_review` 順序を再検査し、順序違反を `pair-agent-run-evidence` gate blocked と finding に投影する。`quality_signals` は phase、smart test author、light implementation、smart review、consultation、pending consultation、failed review、fix cycle の count を投影し、stdout だけの一過性証跡にしない |
| HAC-P2-05a | 登録済み外部AI workerへ通常taskを委譲する | descriptor admissionを実行 | 隔離worktree、non-authoritative output、provider capabilityが固定され、repository／DB writer権限を渡さない |
| HAC-P2-05b | secret作業またはdescriptor未登録runtimeを委譲する | admissionを実行 | worker起動前にdenyし、秘密値やcredential pathをprompt／environmentへ渡さない |
| HAC-P2-06a | workerがapproval request／tool call／resultを返す | wire adapterで受信する | typed eventとしてschema検証し、Node control planeのpolicy decisionとtraceへ結合する |
| HAC-P2-06b | workerが未登録eventまたは直接write要求を返す | adapter境界を通す | 実行せずfindingへ変換し、repository／DB mutationを行わない |
| HAC-P2-07a | repository permanent bypass denyが有効 | one-shot marker／runtime bypass flagを指定する | 上位denyを維持し、起動またはtool dispatchを拒否する |
| HAC-P2-07b | permanent deny設定を変更する | config reviewを実行 | versioned diff、authority、監査証跡がなければ変更を受理しない |
| HAC-P2-08a | workerがstrict schemaに適合するproposalを返す | Node再検証を実行 | schema、digest、capability classが一致したproposalだけを次gateへ渡す |
| HAC-P2-08b | validationを緩和する | profile admissionを実行 | PLAN、対象field、理由、期限、再検証receiptが欠ければstrictのまま拒否する |
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
| HAC-P6-02a | PR が作成される | workflow が動く | PR 作成前に `gh auth status` または GitHub App connector の `pull_requests:write` 権限を preflight し、権限不足は `resource_not_accessible_by_integration` remediation と draft PR command に落とす。PR 上では worker と reviewer が別 runtime/model または明示 intra-runtime fallback として記録される |
| HAC-P6-02b | CI fail に auto-fix を試みる | confidence/iteration を評価 | 閾値未満または反復上限超過で Issue/escalation に止める |
| HAC-P6-03a | fresh repo | `helix setup project --dry-run` | hooks/adapters、現行 `.helix` state/memory/evidence/feedback/teams baseline（session handover pathなし）、GitHub rules/checks plan、consumer doctor baseline、`identifierTransition.status=blocked_pending_cutover_approval`、`mustNotApply=true`、`commandAvailability.canonicalCommandAvailable`、`importReport.mode=fresh`、`requiresReview=false`、`postSetupWorkflow.importReportRoute=ready` を返す。consumer readiness が未充足なら `postSetupWorkflow.nextRoute=fix_consumer_readiness` と未充足 gate/remediation を返し、ready なら `helix status --json` / `helix completion decision-packet --json` / `helix completion review-bundle --json` / `helix version-up dry-run --current v0.1.0 --target v0.1.4 --release-remote https://github.com/RetryYN/HELIX-HARNESS-OS.git --json` / `helix doctor --profile consumer` / `helix rename plan --json` / `helix memory list` / `helix feedback list` / `helix team run --definition .helix/teams/default-hybrid.yaml --mode hybrid --json` へ進める次 action を返す。`completion review-bundle` は `bundleDigest` と `semanticBundleDigest` を保存し、S4 / version-up / rename / action-binding の supporting packet 束を人間判断前に照合する。`consumerReadiness.artifactReadiness` は `AGENTS.md` の consumer doctor / default-hybrid dry-run 案内、`.vscode/tasks.json` の手動 task と automatic task 無効化、`.helix` baseline、default-hybrid team の worker/reviewer 分離、version-up dry-run の plan-only 境界を検査し、artifact 欠落や意味ずれがあれば環境 CLI が解決済みでも ready にしない。`--package-root packages/app` のような monorepo 指定時は `consumerReadiness.workspace.monorepo=true`、`packageRoot=<repo>/packages/app`、`cliResolution.checkedFrom=<packageRoot>` を返し、adapter path 自体は repo root scoped のままにする。PATH 上の bare `helix --version` と packageRoot `package.json` の `scripts.helix` が両方解決した場合だけ consumer readiness は ready へ進める。bare PATH だけなら `helix-package-script=false`、package script だけなら `bareCommandResolved=false` として、どちらも `ok=false` / `postSetupWorkflow.nextRoute=fix_consumer_readiness` を返す。dry-run は無変更で終了 |
| HAC-P6-03b | brownfield repo に既存 docs/code/config がある | `helix setup project --apply` | managed 区画のみ更新し、衝突は stop + diff/import report にし、`importReport.skippedExistingPaths` / `reviewRequiredReasons` / `nextRoute=review_import_report` と `postSetupWorkflow.nextRoute=review_import_report` を返す。未整備 sub-doc は `skip_sub_doc` / 段階移行として記録する。PLAN-M-02 承認なしに state dir rename / CLI rename / marker rewrite を適用しない |
| HAC-P6-04a | current tag と target tag がある | upgrade dry-run | migration/rollback/diff plan を出し、既存 state を壊さない |
| HAC-P6-04b | migration が destructive | apply を試行 | action-binding approval なしでは拒否し、rename cutover packet は category 別 hit と cutover action checklist を出すが apply command は提供しない |
| HAC-P6-05a | release automation を選ぶ | ADR lint / plan review を実行 | semantic-release と Release Please の比較、license、PR-gate 親和性、rollback、custom gate hook 可否が記録される |
| HAC-P6-05b | CI fail に auto-fix repush を試みる | confidence を評価 | confidence が 0.75 未満または iteration cap 超過なら repush せず Issue/escalation に止める |
| HAC-P6-06a | distribution catalogを生成する | package index builderを実行 | canonical indexからgenerated indexを再現し、first/third-party、provenance、license、免責、artifact digestを保持する |
| HAC-P6-06b | generated index手編集または未承認publish／cutoverを試行する | distribution gateを実行 | driftを拒否し、PLAN-M-02 action-binding approvalが揃うまでplan-onlyに止める |
| HAC-P7-01a | Claude/Codex どちらかで session start | memory surface を読む | 同じ `.helix/memory/*.jsonl` から直近 12 件/240 字上限で表示 |
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
| HAC-P9-04a | 人間向け prose 文言を追加・変更する | message catalog lint を実行 | catalog key、既定日本語 prose、owner、適用 surface、baseline/grandfather 区分が schema 検証され、欠落 key は fail-close になる |
| HAC-P9-04b | message catalog で文言を差し替える | CLI / doctor / completion packet の smoke を実行 | 人間向け prose だけが差し替わり、`OK` / `warning` / `violation` / JSON key / command 名などの machine-surface token は不変で、未使用 key は warning 以上で報告される |
| HAC-P9-05a | FR registry と L4-L6 design chain が存在する | mid-layer coverage を集計する | 各 FR の L3/L4/L5/L6 到達状態、停滞層、owner、defer 理由が一覧化され、層を飛ばした到達は別 finding になる |
| HAC-P9-05b | 新規または変更 FR が中間層で未降下のまま gate に入る | L3/L4/L5/L6 coverage gate を実行 | 既存 baseline で許容された停滞以外は fail-close し、`descent-obligation` / `l6-fr-coverage` の既存判定を上書きしない |
| HAC-P9-06a | design / add-design PLAN を confirmed に上げる | plan lint / review evidence gate を実行 | `inventory_evidence[]` が照合先、照合日、照合範囲、採否、未採用理由、旧 HELIX read-only 扱いを構造化して持ち、参照 path/URL が実在確認可能である |
| HAC-P9-06b | inventory evidence が prose のみ、または旧 HELIX / 既存資産 / 関連 gate の照合結論が欠落している | PLAN status 更新を試行 | confirmed 化を拒否し、必要な inventory 取り直しと review_evidence 追記を next action に出す。既存 confirmed PLAN への遡及適用は baseline/grandfather として別扱いにする |
| HAC-N3-01a | review_evidence が green command 無し | doctor を実行 | prose-only evidence として reject |
| HAC-N3-01b | self-review だけで gate pass を主張 | review-evidence を検査 | cross_agent ではないことを記録し、判断 gate の根拠にしない |
| HAC-N3-02a | 実装完了 claim がある | trace を検査 | design ID、AC ID、code path、test evidence、review finding status が揃わなければ fail |
| HAC-N3-02b | reviewer が精度欠陥を指摘する | close を試行 | finding が fixed/accepted-defer/escalated のいずれかに分類されるまで pass しない |
| HAC-N3-03a | 変更影響 layer がある | gate selection を実行 | 対象 L階層の gate/test/doctor profile が選ばれ、未選択理由がなければ fail |
| HAC-N3-03b | 過去 baseline と比較する | regression fence を実行 | metric/test/gate の悪化が許容閾値を超えた場合は blocker または improvement task に変換する |
| HAC-N3-04a | code behavior を変える task がある | implementation plan を検査 | failing test / Red evidence / acceptance oracle が無いまま implementation に進めない |
| HAC-N3-04b | test-first が適用不能な task がある | gate を実行 | 不適用理由、代替 oracle、review evidence、post-change regression profile が無ければ完了扱いにしない |
| HAC-N5-01a | context injection を作る | injector を実行 | 直近逐語 / rolling summary / stable constraints の層境界数値と 3 層 budget、artifact trail / raw-evidence pointer の別枠保存が守られ、summary から原証跡へ戻れる |
| HAC-N5-01b | artifact trail または raw/evidence pointer がbounded memoryにしか無い | continuation integrity lintを実行 | DB/eventから原証跡へ戻れないtrail欠落としてfail-close |
| HAC-N5-02a | continuation checkpointを更新する | event-first writerとprojectorを実行 | event append後にDB projectionが冪等確定し、同一event id再送は重複せず、投影成功前のcheckpointを公開せず、Next Actionを保持する |
| HAC-N5-02b | writerがevent append後またはprojection更新前にcrashする | restart/replayとresurrection detectorを実行 | 整合点から冪等回復し、`CURRENT.json`、session prose、handover CLIが生成・復活せず、provider delegation evidenceは保持される |
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
- 本書で新規に閉じる残 GAP: loop trace/eval 昇格規律、Glossary SSoT、DDD context map、P0/P1（continuous-run / version-up / Scrum 分割スケール / L2 design template + mock workflow）/P3/P4/P6（TDD test-first evidence / gated push / setup / release ADR / CI repush confidence）/P8（external grounding / skillify / MicroVM/gVisor sandbox / security filter / agentic AI staged adoption）/P9、HNFR-P3（実装精度・層別 regression fence）/P5（context/test workload budget / 層境界数値 / 可逆圧縮証跡）/P8（外部データ security filter / prompt injection 防御）/AC、計測・改善基盤。typed agent-tool request/response contract registry core は PLAN-L7-213 で `validateToolContractSurface` + doctor hard gate として、loop effort-budget core は PLAN-L7-214 で `tickLoopEffortBudget` + `tick` pre/post gate として、hosted/API preflight core は PLAN-L7-215 で `validateAdapterParityMap` / `requireHostedSurfacePreflight` + `helix guard preflight --json` evidence として先行実装済み。

## §4 L12 pair

Pair artifact: `docs/test-design/helix/L3-pillar-acceptance-test-design.md`。

G-REQ.L3 承認時に、全 `HAC-*` が `HAT-*` で被覆されていることを確認済み。本書は PO 承認後の
`status: confirmed` 正本である。
