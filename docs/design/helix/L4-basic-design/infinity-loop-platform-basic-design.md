---
title: "HELIX L4 基本設計 — Infinity Loop platform"
layer: L4
kind: add-design
status: draft
created: 2026-07-15
updated: 2026-07-15
owner: Codex / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
related_l3: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
requirement_source: docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md
pair_artifact: docs/test-design/helix/L9-infinity-loop-platform-system-test-design.md
next_pair_freeze: L9
---

# HELIX L4 基本設計 — Infinity Loop platform

## §0 設計目的と現在地

本書は、L2要求とL3 system要件draftの方向性を基本設計へ早期降下し、入力・出力・状態・失敗・証拠が不足している箇所を
発見するための並行設計である。L3/L10 pairがfreezeするまでは本書も`draft`とし、未確定値を実装契約として
扱わない。

Forward spineだけを完了正本とし、横軸のInfinity Loopは
`監査/改善 → Issue Gate → Reverse/Redesign → 自動走行 → PR/CI → 監査`を循環してForwardへ収束する。
source assetを読んだ事実、LLMの判断、proseのPASSはGate証拠にならない。

## §1 componentの責務境界

| component | runtime | 責務 | write authority | fail-close条件 |
|---|---|---|---|---|
| `IntakeNormalizer` | Node | user/GitHub/DB eventをIssue contractへ正規化 | event append API | source/cause/idempotency key欠落 |
| `DirectiveCustodyLedger` | Node | user directive/finding原記録を分類前にappend-only永続化 | harness.db | 原文参照/digest/source span欠落、AI終端化 |
| `IssueContractStore` | Node | objective/oracle/mode/Reverse/scope/digestをversion管理 | harness.db | digest不一致、必須field欠落 |
| `InfinityCoordinator` | Node | state遷移、lease、retry、checkpoint、Forward合流 | harness.db | gate receiptなしの遷移 |
| `GateEngine` | Node | Admission/Reverse/Redesign/Scope/Implementation/CI/Closure/Source Coverage判定 | gate eventのみ | prose-only evidence、bypass値 |
| `ReverseSubstanceAnalyzer` | Node | R0–R4のstage schema、obligation coverage、非空/非重複を検査 | finding/receiptのみ | skip、placeholder、同digest、対象漏れ |
| `DesignRefactorPlanner` | Node | design graphから外部化・共通化・オブジェクト化候補を計画し、behavior invariantとconsumer compatibilityを検証 | candidate/plan/receipt eventのみ | 構造証拠、oracle、rollback、Scope Authority欠落 |
| `DomainModelCatalog` | Node | domain object role、canonical term、symbol、oracle、relation、rename境界をversion管理 | catalog/decision eventのみ | role invariant、authority、symbol/oracle edge欠落 |
| `RequirementTranslator` | HARNESS subagent | directive/source/product inputを原子的要求とservice/domain/design候補へ翻訳 | proposal eventのみ | 原文消失、複合atom、曖昧性の無音確定 |
| `RequirementDefinitionLedger` | Node | 要求のstable ID/revision、設計判断、acceptance、service/template/obligation edge、変更receiptを正本化 | requirement event/projection | source/authority/oracle/edge欠落、無証拠merge/supersede |
| `DesignTemplateRegistry` | Node | template schema、適用条件、必須設計論点、versionを管理 | template eventのみ | active version不明、無監査promotion |
| `DesignObligationPlanner` | Node | requirement/service/domain objectから原子的設計義務graphを導出 | obligation eventのみ | orphan、aggregate discharge、根拠なしN/A |
| `TemplateImprovementCoordinator` | Node | template gapをIssue化しshadow評価・独立監査・昇格/rollbackする | promotion receiptのみ | translator自己昇格、coverage regression |
| `LayerLedgerRegistry` | Node | canonical L1–L12 ledger type、粒度、template、authority、entry/exit contractをversion管理（L0 charterは層外authority anchor） | catalog/eventのみ | layer未登録、in-place version変更 |
| `TemplateObligationExtractor` | Node/Python worker | active templateから原子的ledger obligation候補を決定的抽出 | proposal envelopeのみ | extractor不明、空/TBD、aggregate-only |
| `LedgerPairGate` | Node | 上下隣接pairと左右V-pairを双方向・同一snapshotで検査 | pair receiptのみ | 片edge、stale、粒度不一致、未実行oracle |
| `LedgerDesignRefactorPlanner` | Node | ledger diffから構造改善候補を作り全pair保持を検証 | candidate/plan/receiptのみ | consumer/pair/oracle/rollback欠落 |
| `ScopeAuthorityResolver` | Node | capability根拠をchat/L0/PO scope rootへ解決 | scope receiptのみ | 自己参照cycle、minimum-necessary欠落 |
| `GitHubEventBridge` | Node | 全PR lifecycle eventをdeduplicateしaudit job化 | intake port | branch filter、delivery重複、head不一致 |
| `ClaudeAuditAdapter` | Node adapter | PR/DB relationをClaude監査taskへ投影 | finding intakeのみ | workerと同一provider、finding provenance欠落 |
| `CodexExecutionAdapter` | Node adapter | ready IssueをCodex実行taskへ投影 | execution eventのみ | claim/Reverse/pair-freeze未完了 |
| `ContextualPrReviewRouter` | Node | authorと異なるproviderへL0/L2/L3/L4、Issue/PLAN、diff、trace、consumer、security・blast radiusのreview packetを投影 | review receipt eventのみ | 必須文脈digest欠落、同provider、HEAD不一致 |
| `PrDatabaseConvergenceGate` | Node / GateEngine facade | current PR HEADから隔離DBを再構築しevent、projection、checkpoint、schema revision、stale/orphanを照合 | DB追従receiptのみ | source HEAD不一致、片肺commit、stale checkpoint、rebuild差分、orphan |
| `LayerAwareAuditPlanner` | Node | version管理graphを走査しchanged Lから上下隣接、対応Vペア、trace consumer、必須検査を動的導出し、監査AI修正を別family HELIX subagentへクロスレビュー委譲 | audit plan/receipt eventのみ | 未知edge、cycle、未登録consumer、影響閉包欠落、自己承認、同family review、修正後HEAD drift |
| `CiPerformanceRecoveryRouter` | Node | 内部CI/GitHub Actionsの各60秒、Full verification 3分の計測を記録し、correctness greenの性能超過をRecoveryへ投影 | performance receipt/Recovery eventのみ | 検査省略、閾値緩和、計測証拠欠落、未起票超過 |
| `RequirementApprovalGate` | Node / GateEngine facade | 要求↔モック相互遷移、要件からの差し戻し、意味revisionをユーザー回答source、承認者、HEADへ束縛し、承認後PR化を許可 | approval receiptのみ | AI代行承認、遷移履歴欠落、revision/HEAD不一致、承認前PR |
| `MainRecoveryController` | Node | merge後Full失敗で通常mergeを停止し、Recovery修正Issue→修正PR→別family review→doctor→GitHub CI→Issue closeの解除closureを管理 | recovery/解除receiptのみ | Issue/PR/closure欠落、自動上書き、通常開発先行、doctor/CI/review欠落 |
| `EnvironmentPromotionController` | Node | VPS stagingからcloud productionへ同一artifactをpromotionし、GitHub Environment、secret scope、approval、backup/rollback、monitoringを統制 | deployment/promotion receiptのみ | environment混同、artifact drift、staging未検証、production承認scope外 |
| `MemoryCompactionCoordinator` | Node | completion packetをClaudeへ渡しpromotion receiptを受理 | memory port | secret/PII、self-promotion、raw log複製 |
| `LearningPromotionLedger` | Node | finding/実装logをrecipe→shadow→skill/detector/gateへ段階昇格 | harness.db | 再現fixture/効果/rollback/coverage delta欠落 |
| `AgentRegistry` | Node | HARNESS-owned agent contractとruntime projection | repo source | 未登録agent、manual drift、blind leak |
| `MusterPlanner` | Node | layer×drive×task-kind×verificationからteam生成 | team definition | eligible=0、worker=verifier、重複claim |
| `SourceSnapshotter` | Node | ZIP/remote refs/current HEADのimmutable manifest作成 | source manifest | entry/ref/symbol集合が未閉鎖 |
| `SourceCapabilityAtomizer` | Node | file/symbolからatomic behaviorとsource spanを抽出 | atom manifest | aggregate親のcovered算入、未分類/重複 |
| `CapabilityCoverageGate` | Node | source→decision→requirement→design→test→gate join | coverage receipt | pending/orphan/根拠なしrejectが1件以上 |
| `PythonWorkerBroker` | Node | Python processのversion negotiation、timeout/cancel、schema検査 | worker run event | unknown major、timeout、payload超過 |
| `DocumentBuildWorker` | Python | validate/derive/render/package候補を段階実行 | stdout/result dirだけ | harness.db/repo正本への直接write |
| `SpecGraphWorker` | Python | ID/trace/impact/consistency/assignment/schedule導出 | result envelopeだけ | provenance/input digest欠落 |
| `DetectorWorker` | Python | schema/spec/consistency/file/metadata detector実行 | result envelopeだけ | detector version/config不明 |
| `DetectorLedger` | Node | registry/run/finding/baseline/suppression/rerun永続化 | harness.db | evidenceなしsuppression、期限なしwaiver |
| `ProductDataConnectorRegistry` | Node | connector identity/schema/auth reference/read-write policy | harness.db | secret body保存、write authority不明 |
| `ProductDataProjectionWorker` | Python | snapshot/incremental dataをcanonical read modelへ変換 | quarantine/result only | schema drift、lineage/freshness欠落 |
| `OsAdapter` | Node | path/process/signal/lock/sqlite/executable差異を隔離 | なし | platform分岐がdomain層へ漏出 |
| `SupplyChainVerifier` | Node | Node/Python lock、SBOM、secret/license、clean/offline installを検証 | evidence event | unlocked dependency、未分類license、secret finding |
| `ActionBindingGate` | Node / GateEngine facade | 高影響操作のactor/tool/target/paramsとapproval scopeを照合 | approval gate receiptのみ | approval欠落、scope外、期限切れ、snapshot不一致 |
| `AgentLifecycleController` | Node | agent instanceの登録後からlease、checkpoint、verify、release、retireまでを制御 | lifecycle eventのみ | 不正遷移、lease/fencing不一致、未検証release |
| `AgentSyncGuard` | Node | HARNESS正本からruntime adapterを再生成しdriftを比較 | generated adapterとdrift finding | 手編集、未登録agent、projection digest不一致 |
| `AssetInventory` | Node | ZIP、旧UT全ref、現行HEADのsource snapshotと採否queueを統合 | inventory manifestのみ | source family/ref/entry未捕捉、分類なし |
| `BunCutoverGate` | Node / GateEngine facade | P0–P5 cutoverのentry/exitとactive Bun 0件を検査 | cutover receiptのみ | phase飛越、Node artifact未検証、quarantine残存 |
| `BunDependencyCoverageGate` | Node | source、command、CI、hook、package、lock、配布面のBun依存を分類 | dependency ledger/finding | active参照未分類、historical偽装、allowlist根拠欠落 |
| `CiQuarantineManager` | Node | 既知failureをcheck/fingerprint/baseline/期限/代替gateへ限定 | quarantine event/receipt | wildcard、期限なし、新fingerprint、代替gate欠落 |
| `ClosureGate` | Node / GateEngine facade | audit、CI、oracle、memory、child Issue、pairのclosure evidenceを集約 | closure receiptのみ | missing/stale evidence、未解決child、自己承認 |
| `DetectorRegistryRunner` | Node | detector version/configを解決してPython worker runへ結ぶ | detector run event | 未登録version、schema不一致、provenance欠落 |
| `DeterminismGate` | Node / GateEngine facade | 同一snapshot/version/configのartifact/finding digestを比較 | determinism receiptのみ | 再実行digest差、非固定時刻/random入力 |
| `DirectiveCustodyGate` | Node / GateEngine facade | directive dispositionのauthority、反証、appeal、終端可否を検査 | custody receiptのみ | 原記録欠落、AI単独終端、PO authority欠落 |
| `EvidenceProvenanceGate` | Node / GateEngine facade | command、exit、digest、source span、producer、snapshotを検査 | evidence receiptのみ | prose-only、producer不明、digest/source不一致 |
| `FindingPromotionPipeline` | Node | actionable findingをIssue、Reverse、memory、Codex queueへ原子的昇格 | promotion transaction | 部分生成、causality不一致、根拠なしdrop |
| `HarnessDbPort` | Node port | event append、projection transaction、checkpoint、queryを一元化 | harness.db authoritative write | Python直接write、event/projection片側commit |
| `HarnessDbProjection` | Node | product/engine/detector/CI/agent/ledgerのcurrent read modelを再構築 | projection rows | authority混在、event chain不一致、stale checkpoint |
| `HybridDocgenIngestion` | Node coordinator | ZIP engine/template/schemaをversioned capability入力へ正規化 | ingestion event/artifact manifest | provenance、source digest、engine mapping欠落 |
| `HybridDocumentCoreEngineRegistry` | Node | build、metadata、assignment、schedule、trace、impact engineをversion管理 | engine registry/run event | capability/version/schema/entrypoint不明 |
| `IdempotencyGate` | Node / GateEngine facade | operation IDとpayload digestによる副作用一回性を検査 | idempotency receiptのみ | 同一key異payload、重複副作用、receipt欠落 |
| `IntakeTrustGate` | Node / GateEngine facade | chat、Issue、PR、ZIP、product dataをuntrusted inputとして分離 | trust classification receipt | 外部命令実行、classification/provenance欠落 |
| `NodeControlPlane` | Node runtime boundary | CLI、state machine、DB authority、worker supervisionを保持 | Node ports経由のみ | Bun runtime必須、Python authority bypass、OS logic leak |
| `OsCompletionGate` | Node / GateEngine facade | Linux full、macOS portable、Windows compatibilityの完了条件を検査 | OS completion receiptのみ | Linux未実行、別contract、wrapper green代用 |
| `OsContractRunner` | Node | path/process/signal/lock/SQLite等の共通fixtureを各adapterへ実行 | OS test artifact | fixture差替え、domain分岐、platform結果欠落 |
| `ProductDataPolicyGate` | Node / GateEngine facade | classification、redaction、retention、freshness、credential参照を検査 | policy receiptのみ | PII/secret複製、期限超過、raw payload露出 |
| `PrototypeBuilder` | Node tooling / future UI route | 操作可能prototypeとscreen/interaction/state traceを生成 | prototype artifactのみ | 静的画像だけ、起動不能、状態/仮data境界欠落 |
| `RedesignRouter` | Node | findingのaffected layerを判定しRedesign/re-freezeへ戻す | redesign route event | L1/L2 stale化欠落、L0自動変更、Forward直行 |
| `ResultIngestionPort` | Node port | Python result envelopeをschema/digest検証後にDBへcommit | validated result transaction | invalid/late/partial result、直接DB write |
| `RoleSeparationGate` | Node / GateEngine facade | worker、reviewer、promoter、final verifierのprovider/role分離を検査 | separation receiptのみ | self-review、同provider最終判断、review evidence欠落 |
| `ScopeAuthorityGate` | Node / GateEngine facade | ScopeAuthorityResolverのroot/minimum/budget結果をblocking判定 | scope gate receiptのみ | cycle、oracle非寄与、不要surface、代替検討欠落 |
| `ScreenApplicabilityGate` | Node / GateEngine facade | `prototype_required/not_applicable`をscope digestとre-entryへ結ぶ | applicability receiptのみ | 暗黙skip、AI単独判断、空理由、再entry欠落 |
| `ScreenGate` | Node / GateEngine facade | prototype/walkthrough/agreementまたはno-UI receiptをG1/G3前に検査 | screen gate receiptのみ | 二経路とも欠落、stale skip、静的wireframe代用 |
| `ThreeStageCiOrchestrator` | Node | prejoin、postjoin、GitHub external CIをSHA lineage順に制御 | CI stage event/receipt | 段飛越、別SHA green、predecessor未結線 |
| `UniversalReverseGate` | Node / GateEngine facade | 全IssueのR0–R4、主駆動pair、substanceを実装前に検査 | Reverse receiptのみ | exemption、省略、順序違反、hollow artifact |
| `UpstreamRedesignReentry` | Node | L1/L2変更で下流pair、screen receipt、implementation claimをstale化 | re-entry/stale event | consumer未列挙、再freeze前進行、backprop欠落 |
| `WalkthroughLoop` | HARNESS workflow | prototype観測、要求delta/no-delta、再作成判断をbounded反復 | walkthrough receiptのみ | 観測/版/反映先欠落、無制限反復、agreement偽装 |

## §2 runtimeの責務境界

### §2.1 正規runtime

- control planeはTypeScript strictをNode.js LTS上で実行する。
- Pythonはdocument/data/detector/analysis workerに限定し、Node coordinatorを迂回しない。
- harness.dbへのauthoritative writeはNode portだけが持つ。Pythonはversioned result envelopeを返す。
- shell/PowerShellは薄いbootstrap互換層だけにし、業務判断を置かない。
- Linuxをfull gateと配布の基準にし、macOS/Windowsは同じcontractのcompatibility smokeを行う。

### §2.2 Node↔Python通信envelope

```json
{
  "schema_version": "helix-worker.v1",
  "run_id": "RUN-...",
  "request_id": "WRK-...",
  "type": "request",
  "sequence": 1,
  "capability_id": "HZ-TOOL-...",
  "worker_version": "...",
  "input_digest": "sha256:...",
  "config_digest": "sha256:...",
  "deadline_at": "RFC3339",
  "payload_digest": "sha256:...",
  "payload": {},
  "provenance": []
}
```

protocolはUTF-8 JSON Linesに固定し、`hello→accepted→progress*→result|error|cancelled`を同じ`run_id`、
単調増加`sequence`、payload digestで結ぶ。cancelはNodeが発行し、deadline超過はTERM→猶予→KILLの順で
process groupを停止する。stdoutはprotocol専用、stderrはsize制限付き診断専用とし、artifact本体は
一時directoryへ書いてmanifest/digestだけをresponseに載せる。responseは
`status=ok|finding|invalid_input|unsupported_version|timeout|cancelled|crashed`、`output_digest`、
`findings[]`、`artifacts[]`、`metrics`を持つ。
未知major、出力schema不正、input digest不一致は結果をDBへ昇格せずquarantineする。

### §2.3 harness.db共通commit契約

専門領域は`append-only event → current projection → checkpoint`を共通形とする。eventは`operation_id`を一意にし、
同じoperation IDと同じpayload digestはdeduplicate、異なるdigestはconflictとして拒否する。aggregate内の
`event_seq`は一意かつ単調増加とし、`previous_event_digest`と`event_digest`で鎖状に結ぶ。event rowには
UPDATE/DELETE拒否triggerを置く。

正規書込順はcanonical JSON Lines append＋fsync、`BEGIN IMMEDIATE`によるevent/current projection transaction、
checkpoint更新とする。projectionだけを一次正本にせず、再構築時はevent chainとcheckpointを照合する。
専門tableと既存`findings`、`test_runs`、`artifact_registry`、`issue_queue`等の横断projectionは同一DB transactionで
全件commitまたは全件rollbackし、片側だけの成功を禁止する。

event replay後のprojection照合は、次の共有semantic shapeを設計正本とする。これはL4時点の設計契約であり、
runtime schemaへの実装追加を意味しない。各L6は型閉包のため同一shapeをexact定義し、slice固有receiptを混在させない。

```ts
interface ProjectionDigestV1 {
  schema_version: "helix-projection-digest.v1";
  subject_kind: string;
  subject_id: string;
  subject_revision: number;
  event_head: string;
  projection_head: string;
  state_digest: string;
  row_count_digest: string;
}
```

この契約を実装するため、現行`TableDef`へnullable、default、`foreign_key`、`unique`、`check`、partial uniqueを
表現する`TableConstraint`を追加し、DDL生成とmigrationで`PRAGMA foreign_keys=ON`を強制する。新規tableを
free-form status列とapplication側の任意checkだけで実装完了にしない。

## §3 Infinity Loopの状態機械

```text
intake
  -> directive_captured
  -> admitted
  -> reverse_r0 -> reverse_r1 -> reverse_r2 -> reverse_r3 -> reverse_r4
  -> redesign? -> design_refactor? -> pair_freeze
  -> implementation_preflight
  -> implementation_claimed -> implemented
  -> local_prejoin_ci
  -> forward_join
  -> internal_postjoin_ci
  -> pr_open_or_updated
  -> github_external_ci
  -> contextual_pr_review
  -> database_convergence_verified
  -> claude_audit
       -> audit_fix -> cross_family_delta_review -> internal_ci -> github_external_ci -> database_convergence_verified
       -> finding_promoted -> child_issue -> intake
       -> audit_pass
  -> memory_compacted
  -> closure_ready
  -> merged_closed
```

不変条件:

1. Reverse R0–R4は全Issue必須で、`none/exempt/not-required`を持たない。
2. ReverseはForward実装より先に完了する。
3. design findingはL1/L2を含むaffected layerへRedesignを作り、L0変更だけPOへescalateする。
4. `local_prejoin_ci`、`internal_postjoin_ci`、`github_external_ci`は別receiptで、代替・順序逆転を許さない。
   各段は自段のSHA/tree digestと直前段のreceipt/lineageを持つ。Forward joinによるSHA変更は許容するが、
   predecessor relationが無い別SHA greenは再利用しない。
5. audit findingは候補proseで止めず、deduplicateされたIssue create/updateまたは明示reject receiptへ収束する。
6. closureはPR/CI/audit/oracle/memory/child Issueの全joinがcurrentである時だけ可能とする。
7. Design Refactorはobservable behavior、public contract、requirement、永続state semanticsを変更しない。差分検出時は
   現在routeを停止し、要求/contract変更はRedesign、runtime/dependency/schema移行はRetrofitへrerouteする。
8. merge readinessは同一HEADに束縛された別provider文脈レビュー、CI receipt、DB追従receiptのANDで判定する。
   push、base更新、CI self-heal、正本digest変更後は文脈レビューとDB追従を再実行し、旧receiptを流用しない。
9. 作成AIはPR作成前に内部CIをpassする。監査AIが修正した差分は別family HELIX subagentがクロスレビューし、
   修正後HEADで内部CIとGitHub Actionsを独立再実行する。監査AIの自己修正・自己承認を一つのreceiptへ畳み込まない。
10. 内部CIとGitHub Actionsの重要検査は各p95 60秒、Full verificationはp95 3分を性能予算とする。
    correctness greenの性能超過はmerge判定と分離し、同episodeのRecovery Issueで改善closureまで追跡する。
11. 要求↔モック相互遷移と要件からの差し戻しを保持し、意味revisionはユーザー承認後にPR化する。監査scopeはversion管理graphから動的導出する。
12. DB/GitHub再照合不一致と性能超過はRecoveryへ送り、性能Recoveryを最優先にする。main merge後Full失敗時は
    通常mergeを停止し、Recovery修正Issue、修正PR、別family review、doctor、GitHub Actions、Issue closure receiptが
    同一修正HEADへ収束するまで解除しない。
13. VPS stagingは自動検証面、cloud productionは承認付きpromotion面とし、同一artifact、環境分離、backup、rollback、
    health check、monitoringを必須にする。不可逆分類だけを理由にbranch内の安全な修正・検証を停止しない。

### §3.1 3段CIとquarantineの永続化

| table | PK | 論理FK・一意制約 | 必須field | 許可status |
|---|---|---|---|---|
| `ci_chains` | `ci_chain_id` | plan/Issueを参照、`causality_id`は一意 | prejoin SHA/tree、Forward join receipt、current stage、created/updated | `created`, `prejoin_running`, `prejoin_accepted`, `postjoin_running`, `postjoin_accepted`, `external_running`, `external_accepted`, `failed`, `stale`, `cancelled` |
| `ci_stage_runs` | `ci_stage_run_id` | chain→`ci_chains`、predecessor→自己参照、operation/idempotency keyは一意、chain＋stage＋attemptは一意 | ordinal、head SHA、tree/check-set/lineage digest、failure code、開始/終了 | `queued`, `running`, `passed`, `accepted_with_quarantine`, `failed`, `cancelled`, `stale` |
| `ci_check_runs` | `ci_check_run_id` | stage run→`ci_stage_runs`、stage＋check＋attemptは一意、provider delivery IDは一意 | required、provider conclusion、fingerprint、command/artifact/evidence digest | `reported`, `verified`, `quarantined`, `rejected` |
| `ci_stage_receipts` | `ci_stage_receipt_id` | stage run→`ci_stage_runs`を一意参照 | source SHA、tree/check-set/result/artifact/lineage/output digest、event digest、issued_at | `passed`, `accepted_with_quarantine`, `failed` |
| `ci_required_check_sets` | `ci_check_set_id` | profile＋versionは一意 | stage、required check名集合digest、green definition、source、effective_at | `draft`, `active`, `deprecated` |
| `ci_quarantine_rules` | `ci_quarantine_rule_id` | remediation Issueとminimum verification profileを必須参照、check＋fingerprint＋baseline SHA＋scopeは一意 | baseline tree、reason/evidence、owner、expires_at、max/applied iterations、approval receipt | `proposed`, `active`, `expired`, `revoked`, `stale`, `exhausted` |
| `ci_quarantine_applications` | `ci_quarantine_application_id` | rule→`ci_quarantine_rules`、check run→`ci_check_runs`を一意参照 | observed fingerprint/SHA/tree/scope、decision、minimum gate run、receipt digest | `matched`, `rejected` |
| `ci_chain_events` | `ci_chain_event_id` | chain→`ci_chains`、chain＋event sequenceとoperation IDは一意 | from/to state、stage run、previous/event digest、actor、occurred_at | append-only |

stage ordinalは`local_prejoin=1`、`internal_postjoin=2`、`github_external=3`に固定する。ordinalを飛び越える遷移、
前段が`passed`または`accepted_with_quarantine`以外の遷移、predecessor不一致をtransaction内で拒否する。
`accepted_with_quarantine`は`passed`ではなく、minimum gateがgreenでもchain集計のgreen件数へ入れない。
force-pushまたはhead変更で該当stage以降をstale化し、
古いreceiptを再利用しない。

`accepted_with_quarantine`だけはexact既知failureが全件rule一致し、代替minimum gateがpassした時に次段へ進めるが、
green件数へ算入しない。wildcard、無期限、remediation Issueなし、minimum gateなし、別scope/SHA/tree、iteration上限超過を
CHECKとwriterの両方で拒否する。minimum gate自身をquarantine対象にしない。GitHub deliveryはdelivery IDと
repository/PR/head/check-suite digestをbindし、同じdelivery IDへの異digestをconflictにする。

failure codeは、順序違反=`HIL_CI_STAGE_BYPASS`、lineage不一致=`HIL_CI_LINEAGE_MISMATCH`、
fingerprint不一致=`HIL_QUARANTINE_FINGERPRINT_MISMATCH`、期限切れ=`HIL_QUARANTINE_EXPIRED`、
代替gate失敗=`HIL_QUARANTINE_MINIMUM_GATE_FAILED`とする。

## §4 Issue Gate判定表

| gate | 必須入力 | PASS出力 | 代表failure code |
|---|---|---|---|
| Directive Custody | source span、actor、received_at、digest | 永続intake receipt | `HIL_DIRECTIVE_CUSTODY_MISSING` |
| Admission | objective、oracle、cause、primary mode、scope | version管理されたIssue contract | `HIL_ISSUE_CONTRACT_INCOMPLETE` |
| Screen Applicability | scope、surface、input digest、PO decision | prototype taskまたはno-UI receipt | `HIL_SCREEN_DECISION_MISSING` |
| Reverse | R0–R4 obligation/artifact/digestとR4 route | Universal Reverse receipt | `HIL_REVERSE_STAGE_MISSING` |
| Reverse Substance | stage schema、source span、coverage、content digest | 段階assertion receipt | `HIL_REVERSE_SUBSTANCE_HOLLOW` |
| Redesign | finding layer、design delta、pair | redesign receiptまたはnot-triggered条件 | `HIL_REDESIGN_REQUIRED` |
| Design Refactor | structure evidence、consumer、oracle、graph、rollback | behavior-preserving design-refactor receiptまたはreroute | `HIL_DESIGN_REFACTOR_INVARIANT_BROKEN` |
| Scope | allowed diff、non-goals、capability budget、trace | scope判定receipt | `HIL_UNJUSTIFIED_CAPABILITY` |
| Scope Authority | authoritative root、derivation、最小性、代替、budget | authority receipt | `HIL_SCOPE_AUTHORITY_CYCLE` |
| Implementation Entry | 上記receipt、lease、worker/verifier | claim | `HIL_IMPLEMENTATION_NOT_READY` |
| Source Coverage | manifest digest、全capability join | coverage receipt | `HIL_SOURCE_CAPABILITY_ORPHAN` |
| Source Atom | 原子的behavior、source span、parent/child count | 原子化receipt | `HIL_SOURCE_AGGREGATE_ONLY` |
| Staged CI | 3段CI receiptと同一source lineage | CI chain receipt | `HIL_CI_STAGE_BYPASS` |
| Contextual PR Review | L0/L2/L3/L4、Issue/PLAN、diff、trace、consumer、security・blast radiusのdigest集合、author/reviewer provider、current HEAD | current HEAD文脈レビューreceipt | `HIL_CONTEXT_REVIEW_INCOMPLETE` |
| PR Database Convergence | current PR HEAD、event head、projection/checkpoint digest、schema revision、隔離rebuild、stale/orphan count | DB追従receipt | `HIL_PR_DATABASE_NOT_CONVERGED` |
| Audit Fix Cross Review | changed L、上下影響、Vペア、author/auditor/cross-reviewer family、修正後HEAD | 差分クロスレビューreceipt | `HIL_AUDIT_FIX_SELF_APPROVED` |
| CI Performance Recovery | internal/GitHub各duration、Full duration、HEAD、環境、cache状態、区間計測、検査集合digest | 性能receiptまたはRecovery Issue receipt | `HIL_CI_PERFORMANCE_RECOVERY_MISSING` |
| Requirement Approval | L3 revision digest、回答source、user identity、current HEAD | user approval receipt | `HIL_REQUIREMENT_USER_APPROVAL_MISSING` |
| Main Recovery Release | failure HEAD、Recovery修正Issue、blocker、修正PR/HEAD、cross review、doctor、GitHub CI、Issue closure | merge-stop解除receipt | `HIL_MAIN_RECOVERY_INCOMPLETE` |
| 環境昇格 | staging/production環境、成果物digest、secret適用範囲、承認、backup、rollback、health/monitoring | promotion receipt | `HIL_PRODUCTION_PROMOTION_UNSAFE` |
| Closure | merge/oracle/audit/memory/child state | closure判定receipt | `HIL_CLOSURE_EVIDENCE_MISSING` |

Gate overrideはLLM判断やboolean flagで行わない。不可逆・高影響境界だけaction-binding approval packetを用い、
通常の不足証拠をapprovalでPASSへ変えない。

### §4.1 Reverse内容契約

| phase | 必須意味単位 | 空洞化を拒否するassertion |
|---|---|---|
| R0 Evidence Acquisition | 対象snapshot、evidence map、file/test inventory、`has_existing_tests`、negative evidence | source span 0、対象obligation漏れ、同一path重複を拒否 |
| R1 Observed Contracts | API/DB/type/compatibilityの観測結果 | skip禁止。契約なしは探索scope/digestと`no_observed_contracts`根拠を要求 |
| R2 As-Is Design | as-is design、DAG、impact、as-is testまたはmissing pair | R0 evidenceへ戻れないnode、DAG未接続、test状態不明を拒否 |
| R3 Intent Hypotheses | intent候補、代替、反証、gap、PO検証 | PO receiptなし、単一仮説で反証なし、R2非参照を拒否 |
| R4 Gap & Routing | gap register、forward routing、promotion、missing pair、backprop | 未閉鎖gap、routing不在、前段digest不一致を拒否 |

全phaseは`obligation_set_digest/input_digest/output_digest/source_spans/semantic_assertions`を持つ。
空、placeholder、stage間の同文/同digest、根拠なしno-findingを拒否する。time/token/cost上限到達時は
checkpointと未完obligationを保存して`incomplete`へ遷移し、Reverse完了receiptを発行しない。

### §4.2 directive custodyとdisposition

user directive/findingは分類前に原文参照、source span、actor、received_at、content digestをappend-only保存する。
AI dispositionは別eventであり原記録を終端化しない。`duplicate`は生存targetとacceptance oracle包含証拠、
`false_positive`は別verifierの反証、`accepted_risk/cancel/supersede`はPO receiptを要求する。
全非actionable分類はappeal/reopen routeを保持し、証拠不足なら`pending_disposition`のままIssue Gateを通さない。

### §4.3 Design Refactor契約

Design Refactorは既存L7 `Refactor`の上流にある設計変換であり、次の4種を第一級transformとして扱う。

| transform | 対象 | 必須構造証拠 | 禁止する誤用 |
|---|---|---|---|
| `externalize` | 埋込みpolicy、調整値、adapter contract、schema catalog | 複数consumerまたは運用変更点、現owner、authority、validation boundary | safety allowlistやfail-close policyを緩められる設定へ出す |
| `commonize` | 重複contract、同一policy、同一schema、同一relation rule | semantic equivalence、全consumer一覧、drift実績、差分吸収規則 | 似ているだけの2実装を早期抽象化しconsumer固有意味を失う |
| `objectize` | 責務、state、invariant、lifecycle、authority boundary | ownership混在、state transition、invariant、write authority、生成/破棄境界 | class数増加自体を改善とする、data holderやbase classを無目的に増やす |
| `semantic_rename` | function、component、contract、event、fieldの内部識別子 | 入出力、副作用、failure、state transition、call graph、consumer contractのsemantic signatureとname collision | 文字列距離だけで同義と決める、public identifierを互換migrationなしで変更する |

既存`analyzeRefactorCandidates`の`split-module`、`extract-helper`、`deduplicate-function`、
`externalize-literal`、`externalize-policy`はcandidate sourceとして再利用する。ただしTS codeのthreshold hitは
Design Refactor開始の十分条件ではない。document/schema/policy/DB relation graphからもcandidateを抽出し、
false-positive triage後だけPLANへ昇格する。

rename判定は二方向に行う。semantic signatureが同等なのに名称体系が分裂している場合はcanonical nameへの統一または
commonize候補とし、名称が同一/近似なのにsignatureが異なる場合は責務を表す識別名へ分離する。lexical similarityだけの
候補は`HIL_DESIGN_REFACTOR_NAME_ONLY`で拒否する。internal identifierはDesign Refactorで扱えるが、公開API/CLI、
永続DB field/event、consumerが直接参照する設定keyのrenameはobservable contract変更としてRedesignまたは
compatibility migrationを持つRetrofitへrerouteする。

| table | PK | 論理FK・一意制約 | 必須field | 許可status |
|---|---|---|---|---|
| `design_refactor_candidates` | `design_refactor_candidate_id` | source finding/quality signalを参照、subject＋evidence digestは一意 | transform kind、subject spans、duplication/coupling/change-impact evidence、detector version | `observed`, `triage_pending`, `accepted`, `rejected`, `superseded` |
| `design_refactor_plans` | `design_refactor_plan_id` | candidate/Issue/Reverse/Scope Authorityを参照、operation IDは一意 | baseline graph、observable boundary、oracle set、consumer set、scope budget、rollback digest | `draft`, `fenced`, `transforming`, `verification_pending`, `verified`, `rerouted`, `failed` |
| `design_refactor_steps` | `design_refactor_step_id` | plan→`design_refactor_plans`、plan＋ordinalは一意 | transform kind、input/output node、expected graph delta、design pair、step digest | `planned`, `applied`, `verified`, `rolled_back`, `failed` |
| `design_refactor_consumer_checks` | `design_refactor_consumer_check_id` | step/consumer/oracleを参照、step＋consumer＋oracleは一意 | before/after contract digest、fixture/evidence、compatibility verdict | `pending`, `passed`, `failed`, `stale` |
| `design_refactor_receipts` | `design_refactor_receipt_id` | planを一意参照 | before/after graph digest、behavior digest、consumer coverage、pair digest、rollback target、verdict | `passed`, `failed`, `rerouted`, `stale` |
| `design_refactor_events` | `design_refactor_event_id` | plan＋event sequenceとoperation IDは一意 | from/to state、previous/event digest、actor、failure/reroute code、occurred_at | append-only |

開始前にobservable boundaryとcharacterization/contract oracleをfreezeし、各stepは1 transformだけを適用する。
全consumerについてbefore/after observable digestとoracle resultを比較し、design relation graphのowner、cycle、coupling、
duplication、change-impact deltaを保存する。改善metricが無い、consumer未列挙、最小変換でない、rollback不能、Scope Authorityへ
到達しない候補は`HIL_DESIGN_REFACTOR_UNJUSTIFIED`で拒否する。

behavior/public surface/requirement差分は`HIL_DESIGN_REFACTOR_BEHAVIOR_CHANGED`でRedesignへ、DB state semantics、
runtime/dependency/schema migrationは`HIL_DESIGN_REFACTOR_RETROFIT_REQUIRED`でRetrofitへrerouteする。
全consumer pass、L4/L5/L6 design pair更新、既存L7 Refactor PLAN結線、rollback target currentの場合だけ
`HIL_DESIGN_REFACTOR_VERIFIED` receiptを発行する。将来利用を理由にした汎用base class、万能service、追加config surfaceは
Scope Gateのcapability budgetで拒否する。

### §4.4 Domain Object／命名catalog

`DomainModelCatalog`は`Entity/ValueObject/Aggregate/DomainService/Policy/Specification/Command/Query/DomainEvent/Receipt/Port/Adapter/Repository`を第一級roleとし、stable object IDをimplementation symbolやtest oracle IDから分離する。

| table | 主key | 必須field・不変条件 |
|---|---|---|
| `domain_objects` | object version ID | bounded context、role、canonical term、responsibility、authority、identity/equality、mutability、lifecycle、aggregate/root、invariant、I/O、副作用、failure、state、consumer、public/persisted分類、digest |
| `domain_object_relations` | relation ID | aggregate-member、emits、handles、depends-via-port、implements、persists。domain→concrete adapterを拒否 |
| `domain_object_symbols` | object＋operation＋symbol version | path/export/symbol/visibility/alias/deprecated。内部renameでもobject IDは不変 |
| `domain_object_oracles` | object＋operation/invariant＋oracle ID | `U-*`/`IT-*`、test path、oracle kind。private symbol名だけのoracleを拒否 |
| `naming_decisions` | decision ID | candidate/canonical、semantic signature、consumer、根拠、例外owner/expiry |
| `rename_receipts` | rename ID | before/after graph・consumer・oracle digest、route、rollback |

Entityはstable identity、Value Objectはimmutable/value equality、Aggregateはroot内transaction、Queryはside-effect 0、Domain Eventは完了事実の過去形、RepositoryはDB rowでなくAggregateを返す。`Manager/Helper/Util/Data/Item/Value/Handle/Process/Object/Thing/Misc/Common/Shared/Base`は無限定利用を拒否し、`Service/Handler/Processor/Factory/Provider/Client/Result/Context/Model/Component`はcatalog roleと責務がある場合だけ許可する。文字列類似は候補生成だけに使い、I/O、副作用、failure、state、call graph、consumer、oracleでsemantic同一性を証明する。

### §4.5 要件定義ledger

`RequirementDefinitionLedger`はcoverage表ではなく、要件定義を設計artifactとして管理するevent-sourced台帳である。原文からactive requirementまでの全判断と、下流設計への適用判断を再生可能にする。

| table | 主key | 必須field・不変条件 |
|---|---|---|
| `requirement_sources` | source ID＋revision | kind、custody/source span、raw/content digest、actor、authority class、freshness。原文の上書き禁止 |
| `requirement_atoms` | atom ID＋revision | source、subject/action/object/constraint/oracle、modality、ambiguity、semantic digest。1 acceptance outcomeまたは1 constraintのみ |
| `requirement_definitions` | 安定requirement ID | category、canonical statement、scope/non-goal、priority、owner、risk、status、current revision |
| `requirement_definition_revisions` | requirement＋revision | atom集合、authority/rationale、acceptance oracle、before/after semantic digest、reviewer、created_at |
| `requirement_definition_edges` | edge ID | atom、capability/service、domain object、template applicability、design obligation、test oracleへの型付き双方向edge |
| `requirement_change_receipts` | change ID | `split/merge/rename/supersede/reject`、before/after、全atom disposition、意味差分、downstream stale set、authority、rollback |
| `requirement_applicability_receipts` | requirement＋scope version | `required/not_applicable/deferred`、machine証拠、scope/input digest、actor、reentry、expiry/supersedes |
| `requirement_definition_findings` | finding ID | failure code、subject revision、evidence、fingerprint、status。proseだけの解消禁止 |
| `requirement_definition_events` | requirement＋event連番 | operation ID、previous/event digest、actor、from/to、occurred_at。append-only |

状態は`captured→atomized→challenged/defined→reviewed→active→superseded/rejected`とする。`challenged/deferred`はfreezeをblockする。renameで意味が不変ならstable IDを維持するが、意味変更は新revisionを発行して全downstream edgeをstale化する。splitは全source semanticsを子へ被覆し、mergeは全入力atomを個別dispositionしなければならない。coverage row、連番、見出しの存在はactive化証拠にならない。

### §4.6 Design Template／要求・service設計義務グラフ

設計templateはMarkdown雛形ではなく、要求とserviceから義務を導出するversioned schemaである。

```text
directive/source/product data
  -> requirement atom
  -> capability/service
  -> domain object
  -> design obligation
  -> design discharge
  -> test oracle
  -> freeze gate
```

| table | 主key | 必須field・不変条件 |
|---|---|---|
| `design_template_versions` | template＋version | 適用対象requirement/service/object role、schema digest、status、supersedes、review receipt |
| `design_template_rules` | rule ID | required-if predicate、obligation kind、cardinality、failure code。自由文だけのpredicate禁止 |
| `design_services` | service版ID | capability、responsibility、owner/authority、entry/exit、consumer、requirement edge |
| `design_obligations` | obligation識別子 | requirement/service/object、kind、applicability、source digest、status、stale reason |
| `design_obligation_edges` | edge ID | from/to/type/version。双方向逆引きとacyclic authority rootを要求 |
| `design_obligation_discharges` | obligation＋version | design span、semantic assertion、oracle/gate、またはN/A receipt。aggregate一括消込禁止 |
| `design_coverage_receipts` | scope＋snapshot | required/discharged/N/A/deferred/orphan/stale件数、template/source digest、reviewer |
| `template_gap_issues` | gap ID | requirement atom、表現不能obligation、current template、evidence、owner、status |

obligation kindは最低でもresponsibility、public contract/API、data/schema、state/lifecycle、event、dependency、failure/recovery、security/privacy、observability、operations、performance、compatibility/migration、test oracle、gateを持つ。`required/not_applicable/deferred`を明示し、`deferred`はfreezeをblockする。N/Aはscope、reason、actor、input digest、再entry条件を持つ。見出し、空欄、`TBD`、placeholder、範囲表記はdischargeにならない。

### §4.7 Requirement TranslatorとTemplate Improvement Loop

`RequirementTranslator`はHARNESS所有contractから生成し、原文/source span/digestを保存したまま1 acceptance outcomeまたは1 constraintへatom化する。出力はauthority、ambiguity、service候補、domain term、obligation候補であり、active requirementやtemplateへのwrite authorityを持たない。意味衝突、複合atom、authority欠落はchallenge queueへ送る。

現行templateでobligationを表現できない場合は`template_gap_issues`を生成する。候補templateは`draft→shadow→reviewed→active/deprecated/rolled_back`を遷移し、固定fixtureと全既存requirement snapshotへshadow適用してcoverage delta、false-positive/negative、migration、rollbackを測る。translatorとreviewerは別agent/runtimeとし、独立監査receiptなしのactive化を拒否する。template version変更は全downstream obligation/discharge/coverage receiptをstale化する。

### §4.8 Layer Ledger Chain（上下pair・左右V-pair）

各layerは文書一覧ではなく、その粒度で確定・保留・検証する原子的subject/obligationのledgerを持つ。

| layer | ledger subject | 下流出力 | 正規左右pair |
|---|---|---|---|
| L1 | 企画、価値仮説、planning intent | L2 requirement authority | L12 operations/value feedback |
| L2 | business/technical/NFR要求定義 | L3/L4 carry | L11 acceptance |
| L3 | system要求、FR、AC | L4 architecture/function/data obligation | L10 total/system verification |
| L4 | architecture、service、domain、external/data契約 | L5 module/API/DB contract | L9 system verification |
| L5 | module、internal processing、physical data、IF詳細 | L6 function/class/edge case | L8 integration verification |
| L6 | implementation unit、function/class signature、invariant、edge caseの定義 | L7 TDD closure | L7 unit/TDD evidence |
| L7 | TDD closure、code/test artifact、implementation判断 | L8 verification input | L6 implementation oracle |
| L8 | integration run/assertion記録 | L9 verification input、L5 backprop | L5 detail design |
| L9 | system run/assertion記録 | L10 input、L4 backprop | L4 basic design |
| L10 | total/system acceptance finding記録 | L11 input、L3 backprop | L3 requirement/AC |
| L11 | acceptance/review finding記録 | L12 input、L2 backprop | L2 requirement |
| L12 | operational/time/value evidence記録 | L1 feedback | L1 planning/value oracle |

正規V-pairは`L1↔L12`、`L2↔L11`、`L3↔L10`、`L4↔L9`、`L5↔L8`、`L6↔L7`である。L0 charterは層外authority anchorであり、L12からL1へのfeedbackを介して企画判断へ接続する。

| table | 主key | 必須field・不変条件 |
|---|---|---|
| `layer_ledger_types` | layer＋ledger種別＋version | subject kind、grain、authority、input/output、template version、entry/exit gate、status |
| `layer_ledger_snapshots` | layer＋scope＋snapshot | source/template/catalog digest、parent snapshot、status、created_at。current一意 |
| `layer_ledger_rows` | 安定subject ID＋revision | layer/type、source spans、semantic digest、authority、owner、status、applicability |
| `layer_ledger_obligations` | obligation識別子 | row、template atom/rule、required facet、cardinality、status、stale reason |
| `layer_ledger_edges` | edge識別子 | from/to row revision、`vertical_down/vertical_backprop/vpair_design/vpair_verification/supersedes`、reverse edge、snapshot digest |
| `layer_ledger_addition_receipts` | proposal＋target台帳 | extractor/actor、source/template digest、duplicate check、authority、review verdict |
| `layer_ledger_pair_receipts` | pair種別＋scope＋snapshot | expected/actual edge、granularity、oracle、execution evidence、unresolved count、verdict |
| `layer_ledger_refactor_receipts` | refactor計画 | before/after graph、all-consumer pair set、oracle、behavior digest、rollback、route |
| `layer_ledger_findings` | finding識別子 | failure code、layer/row/edge、evidence、fingerprint、status |
| `layer_ledger_events` | aggregate＋連番 | operation ID、previous/event digest、actor、from/to、occurred_at。append-only |

Template Obligation Extractorはactive templateの章、field、table row/column、applicability、done-when、pair contractを1 obligationずつ抽出する。Python workerはAST/YAML/Markdown解析候補だけを返し、Nodeがschema・digest・authorityを検証してledger proposalへcommitする。抽出不能は`HIL_LAYER_TEMPLATE_EXTRACTION_EMPTY`、未対応要素は`HIL_LAYER_TEMPLATE_ATOM_ORPHAN`としてfreezeをblockする。

上下pairは隣接layerの`vertical_down`と`vertical_backprop`を一組にし、上位obligationの未降下と下位findingの未逆伝播を別々に検出する。左右pairは上表のV-pairを`vpair_design`と`vpair_verification`で結び、同じoracle identityとsnapshot lineageを要求する。片側edge、aggregate親、未実行oracle、stale revisionはcovered weight 0とする。

`LedgerDesignRefactorPlanner`はledger graphの重複、責務混在、semantic/name collision、fan-in/out、change impact、orphanを候補化する。各stepは1 transformだけを適用し、全vertical/V-pair edgeとoracle identityがbefore/afterで保存される場合だけ既存DesignRefactorへ送る。requirement semantics/public contract変更はRedesign、persisted schema/state変更はRetrofitへrerouteする。

## §5 source capabilityのcoverage

`SourceSnapshot`は次を同一bundleに固定する。

- ZIP: archive digest、全entry path/size/digest、抽出器version。
- Git: remote URL、fetch時刻、全remote ref、commit SHA、merge-base、unique tree/diff digest。
- Current HELIX: commit SHA、tracked tree digest、symbol/doc/test manifest。foreign working treeはbaselineから分離。

SourceSnapshotterの次にAtomizerを実行し、file/directory/aggregateを合格単位にしない。各atomic behaviorは
入力、出力、副作用、failure、source span、extractor version、parent aggregateを持つ。aggregateは集計表示だけで、
covered分母へ算入しない。

各`SourceCapability`は`source_spans[]`、`decision`、`decision_reason`、`requirement_ids[]`、
`design_refs[]`、`test_ids[]`、`gate_ids[]`、`supersedes/absorbed_by`を持つ。source bundle digestが変わるか、
いずれかのedge先digestが変わればcoverage receiptをstaleにする。

完了判定は以下の積であり、代表行の存在ではない。

```text
source_set_closed
AND atomic_behavior_set_closed
AND aggregate_parent_counted_as_covered == 0
AND pending_count == 0
AND orphan_count == 0
AND unjustified_reject_count == 0
AND stale_edge_count == 0
```

## §6 detector database設計

| entity | 主key | 必須field | 不変条件 |
|---|---|---|---|
| `detector_registry` | detector ID + version | capability、schema、owner、severity policy | version不明のrun禁止 |
| `detector_runs` | run ID | detector version、input/config digest、worker、status、timestamps | 同一idempotency keyの副作用1回 |
| `detector_findings` | finding ID | run、rule、location、severity、evidence digest、fingerprint | proseだけのfinding禁止 |
| `detector_baselines` | baseline ID | source snapshot、accepted fingerprints、expiry | source変更でstale化 |
| `detector_suppressions` | suppression ID | fingerprint、reason、owner、expiry、approval | 無期限/根拠なし禁止 |
| `capability_coverage` | capability ID | source、decision、trace edges、status | orphanをPASSにしない |
| `source_capability_atoms` | atom ID | source span、extractor version、input/output/side-effect/failure、parent | aggregate親だけの登録を禁止 |
| `capability_applicability` | scope + capability + phase | `required/not_applicable/deferred`、reason code/rationale、evidence digest、actor/provenance、decided_at、scope hash、supersedes | 未判定/deferredをfreeze可にしない |
| `product_snapshots` | source + cursor | schema、lineage、freshness、digest、classification | PII/secret policy違反はquarantine |

Python workerはこれらのtableへ直接接続せず、Nodeのresult ingestion portがtransactionでevent appendとprojectionを行う。

### §6.1 core engineとdetectorの実装schema

| table | PK | 論理FK・一意制約 | 必須field | 許可status |
|---|---|---|---|---|
| `engine_versions` | `engine_version_id` | engine ID＋versionは一意 | capability、runtime、entrypoint、schema/package digest、owner | `draft`, `active`, `deprecated`, `retired` |
| `engine_runs` | `engine_run_id` | version→`engine_versions`、source/product snapshotを参照、operation/idempotency keyは一意 | input/config digest、worker run、fence token、exit/failure、開始/終了 | `queued`, `leased`, `running`, `result_staged`, `committed`, `failed`, `cancelled`, `quarantined` |
| `engine_artifacts` | `engine_artifact_id` | run→`engine_runs`、run＋artifact kind＋relative pathは一意 | size、output digest、schema version、artifact registry参照 | `staged`, `verified`, `committed`, `rejected`, `stale` |
| `engine_run_events` | `engine_run_event_id` | run→`engine_runs`、run＋event sequenceとoperation IDは一意 | from/to state、previous/event digest、failure code、occurred_at | append-only |
| `detector_versions` | `detector_version_id` | detector ID＋versionは一意 | capability、rule/config schema digest、severity policy、owner | `draft`, `active`, `deprecated`, `retired` |
| `detector_runs` | `detector_run_id` | version→`detector_versions`、input snapshot/runを参照、operation/idempotency keyは一意 | input/config digest、worker run、fence token、failure、開始/終了 | `queued`, `leased`, `running`, `result_staged`, `committed`, `failed`, `cancelled`, `quarantined` |
| `detector_findings` | `detector_finding_id` | run→`detector_runs`、既存`findings`へ同じIDで参照、run＋fingerprintは一意 | rule、canonical location、subject、severity、evidence digest、fingerprint | `open`, `triaged`, `promoted`, `suppressed`, `resolved` |
| `detector_finding_occurrences` | `detector_occurrence_id` | finding→`detector_findings`、run→`detector_runs`、finding＋runは一意 | observed_at、evidence digest | append-only |
| `detector_baselines` | `detector_baseline_id` | version＋source snapshot＋config digestは一意 | baseline digest、approval receipt、expiry | `proposed`, `active`, `stale`, `superseded` |
| `detector_baseline_fingerprints` | `detector_baseline_item_id` | baseline→`detector_baselines`、baseline＋fingerprintは一意 | fingerprint、subject、evidence digest | append-only |
| `detector_suppressions` | `detector_suppression_id` | version/baselineを参照、version＋fingerprint＋scopeは一意 | reason/evidence、owner、approval receipt、expires_at | `proposed`, `active`, `expired`, `revoked`, `stale` |
| `detector_run_events` | `detector_run_event_id` | run→`detector_runs`、run＋event sequenceとoperation IDは一意 | from/to state、previous/event digest、failure code、occurred_at | append-only |

engine artifactとdetector findingは同じrun tableへ混載しない。run完了transactionはterminal run、artifact/finding、
event、provenance edgeを全件commitまたは全件rollbackする。同じidempotency keyへ異なるinput/config digestが来た場合は
`HIL_RUN_IDEMPOTENCY_CONFLICT`、未登録versionは`HIL_REGISTRY_VERSION_UNKNOWN`、schema不一致またはpartial outputは
`HIL_WORKER_RESULT_QUARANTINED`として正本へ昇格しない。

finding fingerprintはdetector ID、major version、rule ID、subject kind/ID、canonical location、semantic evidence digestの
canonical serializationからSHA-256を計算する。path separatorとline endingの正規化versionも入力に含める。
source/extractor/config digest変更時はartifact、baseline、suppressionをstale化する。artifact relative pathの`..`、
absolute path、symlink escapeは`HIL_ARTIFACT_PATH_ESCAPE`で拒否する。

現行`TableDef`は単一PKと列だけを表現し、FK/CHECKを表現できない。L6では`foreignKeys`、`checks`、複合unique indexを
registry型へ追加し、既存SQLiteへ`PRAGMA foreign_keys=ON`を適用する。型拡張前にapplication checkだけで実装完了としない。

## §7 HARNESS所有agentのlifecycle

registry sourceはruntime中立YAML/JSON contractとし、Claude/Codex adapterは生成物にする。

必須field:

- stable agent identity、schema version、capability classの識別情報
- layer、drive、task-kind、verification patternsの適用条件
- context pack、skills、read set、generates、forbidden pathsの実行境界
- blind policy、worker/verifier archetype、model policy（直接model overrideは禁止）
- lifecycle status、compatibility、supersessionの更新規則

Musterは`task-kind → verification patterns → eligible agents`の二段解決を行う。工程開始時に生成し、
claim終了・停止・再設計時に破棄または再生成する。HARNESS registryに無いruntime-local agentは実行不可とする。

### §7.1 agent instance永続化

| table | PK | 論理FK・一意制約 | 必須field | 許可status |
|---|---|---|---|---|
| `agent_contract_versions` | `agent_contract_version_id` | agent ID＋versionは一意、supersedesは自己参照 | contract/schema digest、capability class、適用条件、blind/model/context policy digest、source path | `registered`, `eligible`, `quarantined`, `retired` |
| `agent_musters` | `agent_muster_id` | plan/Issueを参照、operation/idempotency keyは一意 | layer、drive、task kind、verification/team digest、created_at | `planned`, `ready`, `leased`, `running`, `completed`, `failed`, `cancelled` |
| `agent_muster_members` | `agent_muster_member_id` | muster/versionを参照、muster＋member indexは一意 | archetype、provider family、blind packet digest | `selected`, `leased`, `running`, `completed`, `failed`, `cancelled` |
| `agent_instances` | `agent_instance_id` | muster member/versionを参照、member＋attemptは一意 | causality/task digest、current fence/lease/checkpoint、result/failure、created/updated | `mustered`, `leased`, `running`, `checkpointed`, `completed`, `failed`, `cancelled`, `verification_pending`, `verified`, `released`, `quarantined`, `retired` |
| `agent_leases` | `agent_lease_id` | instance→`agent_instances`、instance＋fencing tokenは一意、active leaseは最大1件 | owner session/run、acquired/heartbeat/expires、release reason | `active`, `released`, `expired`, `revoked` |
| `agent_instance_events` | `agent_instance_event_id` | instance→`agent_instances`、instance＋event sequenceとoperation IDは一意 | from/to state、fence、context/result digest、previous/event digest、failure、occurred_at | append-only |
| `agent_checkpoints` | `agent_checkpoint_id` | instance/leaseを参照、instance＋checkpoint sequenceは一意 | fence、schema/context/state/artifact manifest digest、path、created_at | `staged`, `durable`, `invalid`, `superseded` |
| `agent_result_artifacts` | `agent_result_artifact_id` | instance/leaseを参照、instance＋relative path＋digestは一意 | fence、path、digest、kind、created_at | `staged`, `accepted`, `rejected`, `stale` |
| `agent_verification_receipts` | `agent_verification_receipt_id` | instance、worker run、verifier runを参照、instance＋result digest＋verifier runは一意 | worker/verifier provider、oracle/input/result/evidence digest、verdict=`pass|fail|inconclusive`、completed_at | `valid`, `stale`, `revoked` |

実行状態は`mustered→leased→running↔checkpointed→completed→verification_pending→verified→released`を許す。
`failed`と`cancelled`は検証済み扱いにせずreleaseし、retryは同じmuster memberの新attempt/new instanceを作る。
`quarantined`と`retired`から通常状態へ戻さない。heartbeat更新、checkpoint、artifact commit、completionは必ず
active leaseのfencing tokenをcompare-and-swapし、失効tokenは`HIL_AGENT_FENCING_REJECTED`で拒否する。
crash再開は最後の`durable` checkpointだけを使い、contract digestまたはinput digest変更時は再開せず新instanceをmusterする。
workerとverifierのprovider一致は`HIL_AGENT_VERIFIER_NOT_INDEPENDENT`、検証前releaseは
`HIL_AGENT_RELEASE_UNVERIFIED`としてfail-closeする。

### §7.2 永続skill改善

実装logとaudit findingを直接skillへ変換しない。`pattern candidate → recipe → reproducible fixture → shadow run →
effect measurement → skill → detector → blocking gate`の状態を`LearningPromotionLedger`で管理する。

各promotionはsupport count、source Issue/commit/finding、再現fixture、before/after成功率、false-positive率、
設計document coverage delta、適用scope、owner、rollback targetを持つ。設計coverageを改善しないrecipeは
implementation shortcutとしてgateへ昇格させない。shadowで既存workflowを退行させた場合は自動rollbackし、
同じevidenceの再昇格を禁止する。

## §8 product-data連携

connectorはproduct DBへ直接自由queryする機構ではない。登録時に次を固定する。

- source identity、connector type/version、credential **reference**、data classificationの登録値
- source schema/version、canonical mapping version、read-only/read-write policyの権限境界
- snapshot/cursor/event identity、freshness SLA、retention/redactionの更新規則
- lineage、schema drift policy、quarantine route、replay checkpointの復旧規則
- detector/docgenへ渡せるfieldと禁止field

既定はread-only snapshotであり、productへのwrite-backは別Issue、Reverse、security review、action-binding approvalを
要求する。schema drift、credential不在、PII classification不明は取り込みを止め、古いprojectionをcurrentとして返さない。

### §8.1 product-data実装schema

| table | PK | 論理FK・一意制約 | 必須field | 許可status |
|---|---|---|---|---|
| `product_sources` | `product_source_id` | source kind＋external identity digestは一意 | owner、classification、read/write policy、freshness SLA、retention、created/updated | `registered`, `enabled`, `disabled`, `quarantined`, `retired` |
| `product_connector_versions` | `product_connector_version_id` | source→`product_sources`、source＋connector versionは一意、activeはsourceごとに最大1件 | connector/schema/mapping version、credential reference、sync mode、config digest、effective_at | `draft`, `active`, `deprecated`, `revoked` |
| `product_ingestion_runs` | `product_ingestion_run_id` | connector versionを参照、operation/idempotency keyは一意 | mode、intent digest、cursor start/end、fence token、failure、開始/終了 | `received`, `claimed`, `fetching`, `staged`, `validating`, `committing`, `completed`, `failed`, `quarantined`, `cancelled` |
| `product_snapshots` | `product_snapshot_id` | source/runを参照、runは一意、source＋cursor＋schema/content digestは一意、supersedesは自己参照、sourceごとの`current`はpartial uniqueで最大1件 | classification、captured/fresh until、lineage/schema/content digest | `staged`, `current`, `stale`, `superseded`, `quarantined`, `purged` |
| `product_entity_versions` | `product_entity_version_id` | snapshot→`product_snapshots`、snapshot＋canonical entity IDは一意 | entity type、source record key digest、schema version、redacted artifact path/payload digest、tombstone | `staged`, `current`, `superseded`, `tombstoned`, `quarantined` |
| `product_mapping_edges` | `product_mapping_edge_id` | entity versionを参照、entity＋target kind/ID＋mapping versionは一意 | target kind、evidence digest、created_at | `active`, `stale`, `rejected` |
| `product_watermarks` | `product_source_id` | source/snapshot/connector versionを参照 | cursor、fence token、updated_at | current projection |
| `product_quarantine_items` | `product_quarantine_item_id` | source/run/snapshotを参照、source＋fingerprint＋scope digestは一意 | finding code、evidence digest、owner、expiry、release receipt | `open`, `released`, `expired`, `superseded` |
| `product_ingestion_events` | `product_ingestion_event_id` | run→`product_ingestion_runs`、run＋event sequenceとoperation IDは一意 | from/to state、previous/event digest、failure、occurred_at | append-only |

credentialはreferenceだけを保存し、raw secret、未redact PII、自由形式raw payloadをprojectionへ保存しない。
watermarkはsourceごとの最後の`current` snapshotからcompare-and-swapし、逆行を`HIL_PRODUCT_WATERMARK_REGRESSION`、
schema driftを`HIL_PRODUCT_SCHEMA_DRIFT`、freshness超過を`HIL_PRODUCT_SNAPSHOT_STALE`として旧entityをcurrentから外す。
同一idempotency keyの再送は副作用0件とし、異なるdigestなら`HIL_PRODUCT_IDEMPOTENCY_CONFLICT`で停止する。
entity/mapping insert、旧currentのsupersede、新snapshotのcurrent化、watermark CASは一transactionで行う。
crash時は`staged`を再検証し、watermarkだけを進めない。retention receiptなしのpurge、存在しないmapping target、
classification不明、未redact payloadをそれぞれfail-closeする。
write-backは本schemaに含めず、別のaction-binding approval付き契約が作られるまでNode/Python双方から拒否する。

## §9 画面工程の適用性判定

画面工程を持つ/持たないは必ずreceipt化する。本PLANはHARNESS control/data plane構築でno-UIのため、
L0/pillar input digest、PO判定、理由、再entry triggerへbindした`not_applicable` receiptでskipする。

applicabilityはdocument有無でなく`scope_id × capability_id × phase`で判定する。ZIPの`scope.py`のように
共有文書全体をexcludeして画面capabilityを落としたことにせず、各capabilityを`required/not_applicable/deferred`
のいずれかへ分類する。`not_applicable`はreason code、rationale、evidence digest、decision actor、detector provenance、
decided_at、scope hashを全て要求し、`deferred`はfreezeを許可しない。

将来dashboard/GUIをscopeへ追加した場合、旧receiptをstale化し、
`rough requirement → executable prototype → walkthrough → L1 back-propagation → agreement → L1/L3 freeze`
へroutingする。静的wireframeだけは操作可能prototypeの代替にせず、L10は実装後UX検証として維持する。

## §10 Bun→Node切替

| phase | blocking gate | Bunの扱い |
|---|---|---|
| P0 inventory | command/API/lock/CI/template/distribution/test参照を全件列挙 | baselineのみ |
| P1 Node minimum | Nodeだけでtypecheck、targeted test、CLI smoke、SQLiteをgreen化 | legacy gateを期限付きquarantine可 |
| P2 adapter migration | process/path/sqlite/package/test runnerをNodeへ切替 | fallbackを観測・削減 |
| P3 distribution | clean Linuxでinstall/build/test/CLI/package | 正規surfaceからBun撤去 |
| P4 compatibility | macOS/Windows smoke | Bun fallback禁止 |
| P5 removal | code/command/lockfile/CI/template/distributionのBun参照0 | archive/historical docsだけ除外 |

最終cutover条件は、Bun未導入のclean Linux環境で全core workflowがgreen、正規surfaceのBun API/command/lockfile/
CI/distribution/template/fallbackが0、quarantineが0であること。段階移行を恒久的なBun残存許可にしない。

### §10.1 dependency/supply-chain再現性

- NodeとPythonはそれぞれ単一のcanonical manifest/lockを持ち、transitive dependencyまでversion固定する。
- clean Linuxでnetworkありinstallと、事前取得cacheを使うoffline installを別receiptとして残す。
- Node packageとPython wheel/sdistを同一SBOMへcomponent identity付きで統合する。
- secret scanとlicense policyをsource、dependency、generated packageへ適用し、未分類licenseをgreenにしない。
- lock更新はsource diff、SBOM diff、license/secret結果、rollback pointを持つ独立Issue/Reverseで行う。
- macOS/WindowsはLinux canonical lockから解決し、OS別lock forkを正本にしない。

## §11 OS adapter契約

Linux full gateでpath separator/case/Unicode/symlink/permission/executable bit、process signal/cancel、atomic rename、
file lock、SQLite contentionを検証する。macOS/Windowsは同じfixtureをcompatibility smokeとして実行し、
期待差分だけをmanifestへ記録する。`process.platform`分岐は`OsAdapter`内部だけに置き、domain/gate logicをforkしない。

## §12 traceと未確定事項

| L1要求群 | L4 block | L14 evidence |
|---|---|---|
| HIL-BR-01..12 / HIL-FR-01..14 | Intake/Coordinator/Gate/Audit/Memoryの境界 | HOT-HIL-01..09/13..15 |
| HIL-FR-15/16/21/22 | Worker/SourceSnapshot/CapabilityCoverageの境界 | HOT-HIL-10/19/20 |
| HIL-FR-17..20 | Screen Applicability/Prototypeのrouting | HOT-HIL-16..18 |
| HIL-TR-01..07 | Runtime/Broker/OS/Cutoverの境界 | HOT-HIL-11/12 |

未確定でありL1 freeze前に閉じる事項:

1. Node LTS/package manager/build artifactの選定。
2. Python environment/lock/sandboxとpayload上限。
3. GitHub/Claude hookの実payloadとtrust境界。
4. detector DBの既存table再利用とmigration。
5. product-data canonical schemaと最初のconnector profile。
6. staged CIの具体command/profileとlegacy quarantine期限。
7. source capability ledgerの全semantic採否と現行HELIX symbol join。

本節の省略範囲表記は説明用であり、Gate入力には使用しない。全115要件の機械join正本は
`docs/governance/infinity-loop-requirement-coverage-ledger.md`とし、同台帳がL4 component/HST/failure code/assertionへ
逆参照できない行は`trace-only`としてfreeze対象外にする。
