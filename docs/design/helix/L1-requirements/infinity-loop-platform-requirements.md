---
title: "HELIX L1 要件 — Infinity Loop platform / runtime再編 / Issue強制契約"
layer: L1
kind: add-design
status: draft
created: 2026-07-15
updated: 2026-07-16
owner: PO (人間 / RetryYN)
plan: PLAN-L1-07-infinity-loop-platform-requirements
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
pair_artifact: docs/test-design/helix/L1-infinity-loop-operational-test-design.md
definition_ledger: docs/governance/infinity-loop-requirement-definition-ledger.md
---

# HELIX L1 要件 — Infinity Loop platform

## §0 システム定義

HELIXは、縦軸にHybrid Design Documentが定めるL1→L12の **Forward spine**、横軸に
**監査・改善 ⇔ Gate ⇔ 自動走行** の `HELIX Infinity Loop` を持つ。
Forwardだけを完了正本とし、横軸は証拠生成、監査、設計訂正、自己改善を循環させてForwardへ収束する。

工程authorityは次の順に固定する。UT由来のL0–L14、旧9-mode、Scrum=PoCはHELIX工程の正本ではなく、
検出・証拠・台帳・合流機構を採取する詳細チーム版referenceである。

1. PO directive/chat custody
2. `ハイブリッド設計ドキュメントv1-fixed.zip`のL1–L12 V-model＋production Scrum
3. HELIX drive-model DB／Infinity Loopの強制状態機械
4. Universal Workflow packageの要求翻訳・ヒアリング・設計判断component
5. UTハーネスと旧HELIXからanti-corruption変換したbehavior atom

### §0.1 正規L1–L12 V-modelとTDD順序

| 左腕／谷 | 成果 | 右腕pair |
|---|---|---|
| L1 企画 | 価値、scope、成功条件 | L12 運用テスト／価値feedback |
| L2 要求 | 業務要求、画面要求、必要時prototype合意 | L11 受入テスト |
| L3 要件 | FR、NFR、AC freeze | L10 総合テスト |
| L4 基本設計 | 外部設計、architecture、境界contract | L9 結合テスト |
| L5 詳細設計＋テスト設計 | 内部設計、単体oracle、Red条件 | L8 単体テスト |
| L6 product code | Greenを作る実装 | L7 test implementation／Red・refactor・trace closure |

正規実行順は`L3 AC freeze→L5 test design→L7 Red→L6 Green→L7 refactor/trace closure→L8–L12 verification`とする。
L7を「L6実装後にテストを書く工程」と解釈してはならない。Scrumは外周の反復制御であり、各production vertical
sliceの内側でこの圧縮Vを完走する。Discovery/PoCは別駆動で、confirmed時はReverse／Redesignを経てproduction
Scrumへ戻す。

役割は非対称に固定する。

| 主体 | 第一責務 | 主入力 | 禁止 |
|---|---|---|---|
| Codex | G3承認後のUIデザインを除く設計・実装・検証・PR・CI self-heal | 凍結設計、PLAN、Issue、test-design | prototype/UIデザインの代行、自成果の最終監査、Issueの証拠なし破棄、memory最終昇格 |
| Claude Code | ユーザー指示、PR hook、DB横断監査、改善Issue、Codex完了時memory圧縮 | harness.db、relation graph、PR、実行evidence | Codexと同じ視点だけの追試、証拠なしgate昇格 |
| Gate | Issue契約、Reverse、scope、CI、closureの決定論判定 | repo/GitHub/DBの構造証拠 | LLM裁量によるbypass |

### §0.2 画面工程の適用判定

画面工程は任意に消せる工程ではない。対象ごとに、操作可能prototypeを用いる
`prototype_required`と、画面が存在しない`not_applicable`のどちらかを明示し、判定receiptを残す。
前者はL1企画からL2の粗要求とprototypeを作り、walkthroughで発見した潜在要求をL2へ反映した後にL3要件をfreezeする。
後者だけがprototypeを作らず進めるが、理由、判定者、入力digest、再entry条件を必須とする。

本要件sliceはHARNESS control/data planeと実行監査機構の構築で、ユーザー画面をscopeに含まないため
`not_applicable`とする。dashboard、GUI、対話画面を後続scopeへ追加した時点でこの判定は失効し、
`prototype_required`へ再entryする。暗黙skipや「画面が無さそう」というLLM推測によるskipは認めない。

### §0.3 要件定義freeze境界

本書の行数、ID連番、trace pointer、基本設計候補の存在だけを要件定義完了としない。全active requirementについて
source atom authority、ambiguity disposition、acceptance oracle、上下pair、左右pair、template applicability、
design obligation、L4 decision、独立reviewがcurrentとなり、未決定0のfreeze receiptが発行された場合だけ完了とする。

## §1 業務要求

| ID | 要求 |
|---|---|
| **HIL-BR-01** | Codex自動走行とClaude Code監査を、PRとharness.db eventで交互に接続し、人のL3承認後は不可逆境界以外を無人完走する。 |
| **HIL-BR-02** | Claude Code拡張hookはCodexのPR作成/更新/完了を検出し、監査jobを冪等生成する。全base branchのPRを対象とし、stacked PRを除外しない。 |
| **HIL-BR-03** | Claude CodeはCodex完了時にraw実行ログ、PR、test/CI、監査所見を圧縮し、永続知識だけをharness memoryへ昇格する。進捗はDB continuationへ残しmemoryへ混載しない。 |
| **HIL-BR-04** | 全Issueは主駆動モデルとReverse PLANを必ず持つ。Reverse R0–R4はForward実装前の先行タスクであり、省略値を持たない。 |
| **HIL-BR-05** | 監査で既存設計の欠陥または不足が判明し、設計修正後にForward実装する場合は第一級`Redesign`駆動モデルへroutingする。 |
| **HIL-BR-06** | IssueはAdmission、Reverse Evidence、Redesign、Scope、Implementation Entry、Closureの各gateを通過しない限りready/implement/merge/closeへ遷移しない。 |
| **HIL-BR-07** | user directiveとIssueは分類前にdurable intake receiptを持ち、AIが不要判断だけでreject/drop/close/cancelできない。AIの非actionable dispositionは非終端で、cancel/supersedeはPOだけが行える。closure receiptが無いcloseは拒否または再openする。 |
| **HIL-BR-08** | acceptance oracleに不要な機能拡張、公開API、CLI、schema、dependency、設定、汎用化をScope Gateで拒否する。必要性が新たに判明した場合は子Issue＋Reverseへ分離する。 |
| **HIL-BR-09** | 工程表のlayer×drive×task-kind×verification patternからHARNESS所有agent contractとW-agent teamを生成し、Claude/Codex固有定義へ決定論的に射影する。 |
| **HIL-BR-10** | Issue・Reverse・Redesign・Forward PLAN・commit・PR・CI・audit・memoryを同一causality chainとしてharness.dbへ収束する。join切れは未完了とする。 |
| **HIL-BR-11** | Issue/実行/監査履歴からrecipe候補を作り、再現性検証後だけskill、detector、gateへ段階昇格する。自動生成物の即時強制適用を禁止する。 |
| **HIL-BR-12** | GitHub由来のIssue/PR/CI eventとユーザー差し込みIssue/PLANを同じintake契約へ正規化し、駆動モデル、Reverse、Forward合流点を必ず決定する。 |
| **HIL-BR-13** | 全PLANは画面工程を`prototype_required`または`not_applicable`へ明示分類する。画面対象はprototype→walkthrough→要求back-propagation→agreement後に要件をfreezeし、画面非対象は証拠付きskip receiptでのみ通過する。 |
| **HIL-BR-14** | ZIP、前身repository exact 2件（`unison-ai-product/UT-TDD_AGENT-HARNESS`、`RetryYN/ai-dev-kit-vscode`）のcurrent advertised `heads/tags/pull` ref authority、現行HELIXのsourceをatomic behavior単位へ完全分解し、各項目を採否判断から要件・設計・テスト・Gateまで追跡する。file集合やaggregate親の列挙、source宣言、読了だけを採用済みとみなさない。ref件数、unique tree entry分母、全ref-entry edge分母はauthority receiptから導出し、観測時の件数を要件へ固定しない。 |
| **HIL-BR-15** | 将来のproduct-data sourceをversioned connectorで取り込み、由来・鮮度・schema・authorityを保持した正規projectionとして設計判断、coverage、impact、Issue routing、docgen/detectorへ供給する。 |
| **HIL-BR-16** | 検証をForward合流前の簡易CI、Forward合流後の内部CI、GitHub PR上の外部CIの3段に固定し、各段のSHA/treeと直前段からのlineageがgreenでなければ次段へ進めない。Forward joinによるSHA変更はpredecessor bindingで追跡する。 |
| **HIL-BR-17** | Claude監査findingを機械的にdispositionし、actionable findingをIssue、Universal Reverse、memory要約、Codex ready queueへ同一causality chainで接続する。AIの自由判断だけによるfinding破棄を認めない。 |
| **HIL-BR-18** | HARNESSはagent定義だけでなく、生成、lease、実行、checkpoint、検証、解放、quarantine、retireまでのinstance lifecycleを正本として保持する。 |
| **HIL-BR-19** | Bun撤去はNodeでも一部動く状態ではなく、activeな開発・実行・検証・配布surfaceがBunなしで再現可能となった時点だけを完了とする。 |
| **HIL-BR-20** | 既知の内部CI failureは証拠を保持した機械的quarantineで一時隔離できるが、対象外failure、新規fingerprint、最低代替gate失敗を無視してはならない。旧UTの検証契約を棚卸し後に再構築する。 |
| **HIL-BR-21** | 設計上の重複、責務混在、変更波及、埋込みpolicyを、外部仕様と受入挙動を維持したまま外部化・共通化・オブジェクト化する第一級`DesignRefactor`駆動モデルを持つ。要求・公開contract・永続state semanticsを変える場合は`Redesign`または`Retrofit`へrerouteする。 |
| **HIL-BR-22** | 要求系統とservice/capability系統をDesign Templateへ結び、各要求から生じる設計義務を原子的に生成・消込する。閉じた要求集合について説明のない設計漏れを0件にし、未知の要求まで網羅したとは主張しない。 |
| **HIL-BR-23** | HARNESS所有のRequirement Translator subagentはchat、product data、source capabilityを要求atomへ翻訳し、既存templateで表現不能な論点を黙って捨てずTemplate Gap Issueとして改善loopへ戻す。 |
| **HIL-BR-24** | 要件定義そのものを設計対象として台帳化し、原文、原子要求、authority、分類、scope、priority、acceptance oracle、capability/service、template適用、design obligation、revisionを一つの履歴へ結ぶ。trace行の存在だけを要件定義完了とみなさない。 |
| **HIL-BR-25** | L1からL12の各layerに粒度固有の設計・実行・検証台帳を置く`Layer Ledger Chain`を持つ。各台帳は上位/下位layerと双方向に導出・逆伝播し、正規V-modelの左右pairとも双方向に対応する。上下または左右の片edgeだけで工程完了を主張しない。 |
| **HIL-BR-26** | 業務、UI、API、data、agent処理を機能名から作らず、`current_state×trigger×condition→action→next_state`のworkflow-firstでelicitationし、各surfaceは正規workflowから派生する。 |
| **HIL-BR-27** | base/conditional interviewをtyped catalogで発火し、各質問を`answered/unresolved/not_applicable`へ理由付きdispositionする。不明点をAIが推測確定しない。 |
| **HIL-BR-28** | 各atomic transitionを最低1 requirement、acceptance condition、test scenarioへexact joinし、business/screen/API/data/permission/notification/audit surfaceを導出する。 |
| **HIL-BR-29** | candidate switching、routing、scheduling、resource allocation/reallocation、degradation、fallback、dead-letterを同じworkflow authorityと証拠鎖へ統合する。 |
| **HIL-BR-30** | project/repository内の通常操作と、HELIX前提として登録されたGitHub、Claude、Codex、CI、参照repository、distribution surfaceの通常操作はstanding authorizationで自走する。未登録scopeへの拡張と高影響action-binding境界は自動許可しない。 |

## §2 機能要求

| ID | 機能要求 | 観測可能な出力 |
|---|---|---|
| **HIL-FR-01** | `InfinityLoopEvent`を受理し、`intake→reverse→redesign?→L3 AC freeze→L4 basic-design freeze→L5 test-design→L7 Red→L6 Green→L7 refactor/trace closure→local-prejoin-ci→forward-join→internal-postjoin-ci→github-pr→external-ci→audit→merge/issue`を状態遷移する。production Scrumでは各vertical sliceがこの圧縮Vを内包する。各段は入力commit/tree digestと前段receiptへbindする。 | append-only event、現在state、parent/cause ID |
| **HIL-FR-02** | PR hook intakeはrepository/PR/head SHA/event delivery IDを正規化し、同一deliveryを一度だけ監査queueへ登録する。 | audit job、idempotency receipt |
| **HIL-FR-03** | Issue contractはobjective、acceptance oracle、primary mode、drive、affected layers、Reverse、Forward target、risk、scope budget、digestを保持する。 | versioned issue contract＋digest |
| **HIL-FR-04** | Universal Reverse Gateは全IssueのR0–R4を順序実行し、各phaseのobligation集合、input/output digest、stage固有schema、source coverage、R4 routing、双方向参照を検査する。R1を含むphase skipは認めず、該当契約なしも探索証拠付き結論として記録する。 | pass/fail receipt＋不足/空洞化code |
| **HIL-FR-05** | Redesign routerは設計欠陥をL1–L5の影響層へ割り当てる。L1変更はL12 pairを、L2変更はL11 pairとScreen Applicability/prototypeまたはskip receiptをstale化して再freezeし、Reverse→Redesign→pair-freeze→Forwardの順序を強制する。企画・scope変更はPOへescalateする。 | redesign PLAN、修正layer、stale edge、pair receipt |
| **HIL-FR-06** | Scope Gateはallowed changes、non-goals、PO-bound capability budget、requirement→symbol→test traceを実diffと照合する。derived HIL IDは自己正当化に使えず、chat/canonical L1企画/PO-approved parent oracleへのderivationとminimum-necessary proofを要求する。legacy L0 charterはL1へ由来を明示したcompatibility projectionとしてだけ参照する。子Issueも同じscope authorityを継承する。 | scope violation、unjustified capability一覧 |
| **HIL-FR-07** | Closure GateはPR、CI、Claude audit、Forward merge、oracle、memory compaction、子Issue状態を検査する。 | closure receipt、close可否 |
| **HIL-FR-08** | Codex実行器はready Issueだけをclaimし、Reverse/Redesign/pair-freeze未完了では実装toolを起動しない。 | claim lease、blocked reason |
| **HIL-FR-09** | Claude監査器はDB relation/coverage/contract/impact viewとPR差分を突合し、findingを`actionable_issue/duplicate/false_positive/accepted_risk/telemetry`へ証拠付きdispositionする。非actionable分類はfindingを削除/終端化せず、独立reviewとappeal routeを持つ。 | audit finding、affected layer、非終端disposition receipt |
| **HIL-FR-10** | Memory CompactorはIssue admission時の問題・判断要約とCodex completion時の永続知識を別event種別で圧縮し、promote/supersede/no-promotionを記録する。進捗/raw logはmemoryへ複製しない。 | issue-summary、compressed memoryまたはno-promotion receipt |
| **HIL-FR-11** | Agent Registryはlayer、drive、task-kind、context pack、skills、blind、generates、forbidden paths、verification patternsに加え、role別read/write/tool/delegation authority、escalation route、evidence custody policyをHARNESS正本として持つ。authorityまたはrole contract変更時は既存muster/lease/context/evidence receiptをstale化する。 | runtime中立agent contract、authority matrix、stale receipt |
| **HIL-FR-12** | Agent Sync/GuardはClaude/Codex定義を生成し、手編集drift、未登録agent、model/effort override、blind context漏洩、forbidden pathをfail-closeする。 | generated adapter、drift/guard receipt |
| **HIL-FR-13** | Musterはtask-kind→verification patterns→eligible agentsの2段引きでW-agent teamを決定論的に生成する。各musterは最大spawn depth、親ごとのfan-out/child count、全体active instance ceiling、再帰委譲可否、parent-child causality、budget/deadlineを固定し、上限超過や未登録recursive spawnを実行前に拒否する。 | TeamDefinition、worker/verifier分離証拠、bounded-spawn receipt |
| **HIL-FR-14** | Learning Promotionはraw event→pattern→recipe→shadow→skill/detector/gateの昇格状態を管理する。 | promotion ledger、効果測定、rollback target |
| **HIL-FR-15** | Hybrid docgen ingestionはZIPのPython engine/toolをbulk portせず、agent metadata、spec ID、trace、impact、consistency、assignment、schedule、detector結果を既存Python CLI/libraryからHELIX契約へ変換する。tool単位で`reuse-as-is/reuse-with-adapter/harden/redesign/reject`を記録する。 | source digest、tool adoption decision、adapter obligation、DB relation |
| **HIL-FR-16** | Asset Inventoryは現行HELIX、ZIP、前身repository exact 2件のA/B二重観測で一致した全advertised `refs/heads/*`、`refs/tags/*`、`refs/pull/*/{head,merge}`を機能単位で比較し、adopt/harden/redesign/rejectを記録する。symbolic `HEAD`とannotated tagの`^{}`はref分母に数えず、target/peel証拠として保持する。 | 完全性台帳、authority receipt、未判断0判定 |
| **HIL-FR-17** | Screen Applicability Gateはcanonical L1企画、scope、公開surfaceから画面/対話の有無を判定する。画面ありはL2 Prototype Discoveryへroutingし、画面なしskipには理由、判定者、入力digest、再entry triggerを要求する。legacy L0はL1へ由来を明示したcompatibility projectionとしてだけ参照する。 | `prototype_required` taskまたは`not_applicable` receipt |
| **HIL-FR-18** | 画面対象のPrototype Builderはscreen ID、主要操作、遷移、9状態fixture、仮データ境界を実行可能artifactへ材料化する。視覚忠実度とは独立に要求発見に必要な操作経路を再生可能にする。 | artifact manifest、digest、起動手順、screen/interaction/state trace |
| **HIL-FR-19** | 画面対象のWalkthrough Loopはprototype版、ユーザー観測、発見要求deltaまたは`no_delta`、L1反映先、再作成判断を記録し、boundedに反復する。 | walkthrough receipt、requirements delta、iteration checkpoint |
| **HIL-FR-20** | Screen Gateは画面対象ならartifact、walkthrough、要求反映、prototype agreementを検査し、画面非対象ならskip receiptのscope/digest/再entry条件を検査する。いずれも無い場合はL1 freezeとL3開始をfail-closeする。 | G2判定、agreementまたはskip receipt、不足code |
| **HIL-FR-21** | Source Snapshot ManifestはZIP entry、前身repository exact 2件のidentity、namespace policy、advertisement A/B digest、全ref→peeled object→commit/tree→entry edge、sealed mirror receipt、現行HELIX symbol/doc/testを固定し、観測時刻、source/tree digest、取得器・抽出器versionを記録する。Git bundleはproject-owned SHA-256 CASへwrite-onceでpromotionし、retention/access/revocation/fresh-until、bundle/ref/tree/edgeの独立receipt、network 0のoffline manifest、isolated restore drillが揃ったときだけcandidateからtrusted/currentへ原子昇格する。ref/content/edge分母はreceiptから導出し、remote identity・advertisement・namespace・source集合・CAS policyが変われば既存snapshot、atomization、coverage receiptをstale化する。 | immutable manifest、Git authority/custody receipt set、offline manifest、restore receipt、source digest、stale判定 |
| **HIL-FR-22** | Source Capability Coverage Gateは各抽出capabilityに一意IDを付け、`adopt/harden/redesign/reject/absorbed`、根拠、HIL要件、基本設計、test、detector/gateを双方向joinする。未判断、根拠なしreject、孤立capability、複合IDによる一括合格が1件でもあればpair-freezeを拒否する。 | capability ledger、coverage matrix、failure code |
| **HIL-FR-23** | Product Data Connector Registryはsource種別、connector/schema version、credential reference、classification、read/write方針、sync方式、owner、enabled stateを保持する。credential値は保存しない。 | connector contract、digest、enable/disable receipt |
| **HIL-FR-24** | Product Data Ingestionはfull/incremental snapshotを冪等取得し、source record→canonical entity→requirement/design/Issue mapping、provenance、freshness、tombstone、schema driftをread projectionへ投影する。 | snapshot、watermark、mapping edge、stale/drift finding |
| **HIL-FR-25** | Hybrid Document Core Engine RegistryはZIP由来のbuild、agent metadata、assignment、schedule、trace、impact等をversioned capabilityとして分離登録し、入力snapshotごとのrun/artifact/digest/exit statusを記録する。 | engine run、artifact manifest、version、input/output digest |
| **HIL-FR-26** | Detector Registry/Runnerはspec、schema、trace、consistency、file、metadata detectorをcore engineから分離し、finding code、severity、location、subject、evidence、versionを永続化する。 | detector run/finding、dedupe key、provenance |
| **HIL-FR-27** | Node/Python Supervisorはworker起動、protocol handshake、request相関、progress、result、error、timeout、cancel、process終了を管理し、失効runのlate resultをcommitしない。 | run lease、protocol digest、terminal receipt、fenced result |
| **HIL-FR-28** | Three-stage CI Orchestratorは各段の必須check、対象SHA/tree digest、結果、artifactを記録し、`local_prejoin→internal_postjoin→github_external`の単調遷移を強制する。 | stage receipt、SHA binding、next-stage可否 |
| **HIL-FR-29** | CI Quarantine Managerは既知failureをcheck名、failure fingerprint、baseline SHAへ限定し、理由、是正Issue、owner、期限/iteration上限、代替minimum gateを必須化する。fingerprint変化は通常failureへ戻す。 | quarantine receipt、expiry/stale判定、remediation Issue |
| **HIL-FR-30** | Finding Promotion Pipelineはactionable findingから重複判定、Issue contract、Universal Reverse、memory issue-summary、Codex queue itemを同一causality IDで原子的に生成する。途中欠落はreadyにしない。 | disposition、Issue/Reverse/memory/queue join |
| **HIL-FR-31** | Upstream Redesign Re-entryはaffected layerがL1ならL1/L12 pairを、L2ならL2/L11 pairとscreen applicability/prototype agreementをstale化し、再承認前の実装claimとForward合流を拒否する。 | stale edge、re-entry task、re-freeze receipt |
| **HIL-FR-32** | Agent Lifecycle Controllerは`registered→eligible→mustered→leased→running→checkpointed→completed/failed/cancelled/timed_out→verification_pending→verified→compacted→released`を管理し、`dead_lettered/quarantined/retired`を終端分岐として持つ。execution deadline、failure taxonomy、retry max/backoff/exhaustionをcontractで固定し、retryはparent causalityを保つ新instanceにする。verified completionはMemory Compactorの`promote/supersede/no-promotion` receiptと結ぶまでrelease不可とする。context/result/checkpoint/evidenceはcustodian、classification、redaction、retention、access、transfer、revocationとappend-only chain-of-custody receiptを持つ。 | instance event、lease/heartbeat、context/result/verification/compaction/custody receipt、dead-letter record |
| **HIL-FR-33** | Bun Dependency Coverage Gateはactive source/import/command/script/test/package/lockfile/CI/hook/template/setup/distributionからBun依存を抽出する。historical/archiveだけを理由付きallowlist可能とする。 | classified dependency ledger、active Bun count |
| **HIL-FR-34** | OS Contract Runnerは同一fixtureでpath separator/case/space/Unicode/permission/symlink/signal/process group/file lock/SQLite/executable discoveryをLinux/macOS/Windows adapterへ適用する。 | OS contract result、adapter violation |
| **HIL-FR-35** | Reverse Substance GateはR0 evidence map、R1 observed contracts、R2 as-is design/test、R3 intent hypothesis＋PO検証、R4 gap/routingをstage別schemaで検査し、空、placeholder、同文、同digest、対象obligation未被覆、根拠なし`no finding`を拒否する。 | phase assertion、coverage、content digest、substance failure code |
| **HIL-FR-36** | Directive Custody Gateはuser directiveを受信直後に原文参照、source span、actor、received_at、digest、supersession chain付きで永続化する。duplicateは生存targetとoracle包含証拠、false-positiveは独立反証、accepted-risk/cancel/supersedeはPO receiptを要求する。 | durable intake、disposition challenge、appeal/reopen receipt |
| **HIL-FR-37** | Source Capability Atomizerは各file/entry/symbolからatomic behaviorを抽出し、1 behaviorごとにsource span、extractor version、parent aggregate、入出力/副作用を付与する。aggregate親とfile分類はcoverage分母に数えず、atomic child未閉鎖を隠さない。 | atom manifest、parent-child count、unclassified/overlap finding |
| **HIL-FR-38** | Scope Authority Gateは各capabilityの根拠をchat directive、canonical L1企画、PO-approved scopeまたはそのderivation chainへ結び、acceptance寄与、最小性、代替案、budget消費を検査する。legacy L0 charter単独をauthority rootにせず、後付け要件だけの循環根拠を拒否する。 | authority edge、necessity proof、budget receipt |
| **HIL-FR-39** | Design Refactor Gateはdesign graph、重複contract/policy/schema、責務とstate invariant、consumer集合、before/after oracleを比較し、`externalize/commonize/objectize/semantic-rename`を独立変換として計画する。renameは名称の文字列類似だけで決めず、入出力、副作用、failure、state transition、call graph、consumer contractを含むsemantic signatureで、同義名の統一または同名異義の分離を判定する。behavior preservation、全consumer compatibility、Scope Authority、設計pair更新、rollbackが揃う場合だけ既存`Refactor`実装へ接続し、observable behavior、public surface、DB semantics、要求の差分を検出した場合は`Redesign/Retrofit`へrerouteする。 | design-refactor PLAN、変換種別、before/after graph digest、semantic/name collision evidence、behavior-preservation receipt、reroute receipt |
| **HIL-FR-40** | Domain Object/Naming Catalogは設計objectを`Entity/ValueObject/Aggregate/DomainService/Policy/Specification/Command/Query/DomainEvent/Receipt/Port/Adapter/Repository`へ分類し、identity、immutability、aggregate boundary、invariant、authority、lifecycle、consumer、canonical termを保持する。各objectとimplementation symbol、test oracle IDを別edgeで決定論的に結び、内部rename後もoracle identityを維持する。 | domain object catalog、naming decision、symbol edge、oracle edge、boundary/invariant finding |
| **HIL-FR-41** | Design Template Registryは要求種別、service/capability種別、domain object roleごとに適用するversioned template schema、必須設計論点、関係edge、適用条件を保持する。 | template version、applicability rule、schema digest、supersession receipt |
| **HIL-FR-42** | Design Obligation Graphは`source/directive→requirement atom→capability/service→domain object→API/data/state/event/failure/security/observability/lifecycle/operation/test oracle/gate`を双方向に結び、必須義務を生成する。未消込、孤児、placeholder、根拠のないN/A、aggregate一括消込が1件でもあればpair-freezeを拒否する。 | obligation graph、discharge receipt、coverage receipt、未消込finding |
| **HIL-FR-43** | Requirement Translatorは入力を1 acceptance outcomeまたは1 constraint単位のatomへ分解し、authority、source span、ambiguity、service候補、domain term、design obligation候補を出力する。複合要求、意味衝突、根拠欠落は自動確定せずchallenge queueへ送る。 | requirement atom、translation receipt、ambiguity/challenge finding |
| **HIL-FR-44** | Template Improvement Loopは翻訳済み要求を現行templateへ照合し、表現不能な設計義務をTemplate Gap Issue化する。候補templateはshadow適用、既存要求への差分、false-positive/negative、migration、独立監査を経てversion昇格し、translator自身による即時強制を禁止する。 | template gap Issue、shadow coverage delta、review receipt、promotion/rollback receipt |
| **HIL-FR-45** | Requirement Definition Ledgerはstable requirement IDとimmutable revisionを持ち、source atom、canonical statement、BR/FR/TR/NFR、modality、priority、scope/non-goal、authority/rationale、acceptance oracle、owner、risk、capability/service、template applicability、design obligationを型付きedgeで保存する。split/merge/rename/supersede/reject/N/Aはbefore/after semantic digest、全source atom disposition、downstream stale、review authorityを持つreceiptがある場合だけ適用する。 | requirement definition/revision、typed edge、change/applicability receipt、orphan/stale finding |
| **HIL-FR-46** | Layer Ledger RegistryはL1–L12ごとにledger type、粒度、必須node/edge、authority、input/output、entry/exit gate、template versionを登録する。各layer ledgerのrowはstable subject ID、revision、source span、semantic digest、status、owner、downstream/upstream edgeを持つ。 | layer ledger catalog、row revision、layer snapshot、coverage receipt |
| **HIL-FR-47** | Template Obligation Extractorは各layerのactive templateから章、field、table row、applicability rule、done-when、pair contractを原子的obligationとして機械抽出し、該当ledgerへ候補行を追加する。未対応template要素、空/TBD、抽出不能、同一obligation重複をfinding化し、LLM自由補完で埋めない。 | template atom、ledger proposal、extractor/version digest、gap finding |
| **HIL-FR-48** | Vertical Ledger Pair Gateは隣接layer間の`derived_from/downstream_to`と`backpropagates_to/supersedes`を双方向検査し、上位義務の未降下、下位発見の未逆伝播、粒度不整合、stale revision、aggregate一括pairを拒否する。 | vertical edge receipt、unresolved descent/backprop finding |
| **HIL-FR-49** | Horizontal V-Pair Gateは正規pair `L1↔L12(value/operation)`、`L2↔L11(requirement/acceptance)`、`L3↔L10(requirement/system)`、`L4↔L9(architecture/integration)`、`L5↔L8(detail/unit)`、`L6↔L7(product-code/test-implementation/TDD-closure)`を原子的oracle単位で双方向joinし、設計義務と検証証拠の片側欠落、異なるsnapshot、未実行oracleを拒否する。 | V-pair receipt、design/verification edge、snapshot/oracle finding |
| **HIL-FR-50** | Ledger Design Refactorはlayer ledgerの重複、責務混在、semantic/name collision、変更波及、孤立edgeを比較し、externalize/commonize/objectize/semantic-rename/split/merge候補を生成する。全上下・左右consumer、before/after oracle、pair保持、rollbackが揃うbehavior-preserving変更だけをDesignRefactorへ送り、要求/公開contract/永続state変更はRedesign/Retrofitへrerouteする。 | ledger diff、refactor candidate/plan、pair-preservation receipt、reroute receipt |
| **HIL-FR-51** | Universal Package RegistryはZIP entryを`contract/fixture/prompt/question_catalog/schema/skill_policy`へ分類し、entry digest、package version、authority、採否、hardening obligationを保持する。 | package manifest、entry disposition、未判断一覧 |
| **HIL-FR-52** | Workflow Interview Coordinatorはcore質問と検出語別drill-downを選択し、質問分母、回答、unresolved、N/A、理由、source spanを保存する。既回答・回答でmodelが変わらない質問を抑止する。 | interview plan、question/answer receipt、unresolved queue |
| **HIL-FR-53** | Workflow Model Normalizerはtarget、actor、state、trigger、condition、action、transition、loop、terminal、exception、permission、timeout、notification、audit、dataをstable IDと参照整合付きtyped modelへ正規化する。 | workflow model、ID/reference map、ambiguity finding |
| **HIL-FR-54** | Workflow Completeness Gateはundefined state、branch next欠落、loop return/continue/stop/limit、success/cancel/fail/expire terminal、exception retry/escalation、permission/data不足をatomicにfail-closeする。 | completeness verdict、atomic failure code、coverage denominator |
| **HIL-FR-55** | Workflow Requirement Deriverはtransition単位でtyped requirement、Given/When/Then AC、test scenario、8 derived surfaceを生成し、既存Requirement Translator、Design Obligation Graph、Layer Ledgerへexact joinする。 | derived requirement/AC/test、surface edge、source transition receipt |
| **HIL-FR-56** | Runtime Orchestration Plannerはcandidate switch、route、schedule、capability/capacity/concurrency/budget/deadline/cost、priority/preemption/fairness、reallocation、degradation/fallback/dead-letterを計画しAgent Muster/Lifecycleへ渡す。 | orchestration plan、allocation/schedule receipt、fallback/dead-letter route |
| **HIL-FR-57** | Canonical Action Intentはactor、objective、operation class、target identity、scope、expected mutation、risk class、authority profile、expiry、causality IDを実行前に正規化する。 | action intent、digest、authority query |
| **HIL-FR-58** | Standing Authorization Registryは許可されたrepository/service、operation class、target pattern、mutation上限、credential reference、expiry/revocation、ownerを型付きprofileとして保持する。 | authorization profile、revision、revocation receipt |
| **HIL-FR-59** | Execution Authorization GateはAction Intentをstanding profile、scope gate、Issue/PLAN state、high-impact境界へ照合し、coveredな通常操作だけを無質問で許可する。 | allow/deny/challenge verdict、matched rule、reason code |
| **HIL-FR-60** | Platform Permission Broker AdapterとBounded Action Executorはhost permission promptをauthorityとはみなさず、platform制約を露出しつつ許可済み操作をbounded retry・idempotency・audit付きで実行する。 | platform capability receipt、execution receipt、retry/deny evidence |
| **HIL-FR-61** | Prototype Agreementはscreen ID、目的、対象actor、主要task、状態、遷移、data境界、out-of-scope、agreement actor/revision/digestをtyped fieldで保持する。 | prototype agreement、schema receipt、L2/L11 pair edge |
| **HIL-FR-62** | Prototype artifactとL2要求はimplementation-neutralを維持し、framework、component symbol、DB/API実装、production credentialを要求発見契約へ混入させない。 | neutrality finding、forbidden-field receipt |
| **HIL-FR-63** | Screen Ledgerはdesign lifecycleとimplementation lifecycleを直交軸として保持し、片軸の状態から他軸の完了を推測しない。各遷移をevent、actor、revision、evidenceへbindする。 | dual-lifecycle event、illegal transition finding |
| **HIL-FR-64** | screen、region、slot、action、state、bindingのstable semantic IDをL2要求からL4/L5設計、L6 code、L7–L12 evidenceまで維持し、rename/split/mergeをreceipt化する。 | semantic ID graph、orphan/change receipt |
| **HIL-FR-65** | Experience、UI、Frontend contractを別schemaとauthorityで保持し、stable semantic ID edgeだけでjoinする。contract間のfield複製や暗黙変換を禁止する。 | three-contract registry、exact join receipt |
| **HIL-FR-66** | Pattern Contractはrequired/forbidden pattern、responsive rule、motion budget、accessibility constraintをversioned policyとして保持し、AIの自由生成をその境界内へ限定する。 | pattern policy、constraint verdict |
| **HIL-FR-67** | Product UI Profileはproduct token、layout、density、surface class、expression budgetをshared Rule Packから分離し、product差分が共通policyを汚染しないようにする。 | profile revision、contamination finding |
| **HIL-FR-68** | L8 Visual Binding Verificationは各Region/Slotについて`route→query→adapter→data→view-state→component`とaction/side-effect/permission/log/redactionの実境界を検証し、data、state、event、permission、logging、errorの6 dimensionへexact joinする。9状態、failure/stale/retry、role、focus復帰、responsive containerを原子的fixtureとし、未bindingまたは根拠のないN/Aを拒否する。 | binding/state/network/event trace、render/a11y artifact、six-dimension receipt |
| **HIL-FR-69** | UI-M0..M7 missionをL5のtest-first obligationとして登録し、L7 Red evidenceを先行させてL6実装し、L7 closureで全mission resultを独立検証する。 | mission ledger、ordering/coverage receipt |
| **HIL-FR-70** | `implemented`は全required UI missionに別worker/verifierのcurrent receiptがある場合だけprojectionとして導出し、人またはagentが直接authoringできない。 | implementation projection、independence receipt |
| **HIL-FR-71** | route数、screen数、placeholder、generic table、静的画像、起動成功だけをfrontend完成証拠として拒否し、adversarial fixtureでfalse completionを検出する。 | false-completion finding、negative oracle |
| **HIL-FR-72** | L9 Cross-screen Visual Integrationは全screenをadaptiveまたは証拠付きdesktop-only-safeへ分類し、screen×state×viewport×theme×locale×text-scaleの固定matrixでtoken、typography、spacing、geometry、overflow、clipping、navigation/focus、breakpoint変形を実render検証する。 | matrix denominator、baseline/candidate/diff、computed-style/token trace |
| **HIL-FR-73** | L9 Cross-screen Visual Integrationはmotion budget、目的、trigger、duration、cancel、repeat、layout shift、reduced-motion fallbackをscreen横断で検証し、未審査baseline更新やretryで隠したflakyをgreenにしない。 | motion/runtime measurement、baseline review、flaky history |
| **HIL-FR-74** | L9 Cross-screen Visual Integrationはsurfaceをoperational/expressive/mixedへ分類し、class別expression budget、pattern/token/asset variant、overlay/z-index、visual hierarchyの全画面一貫性をL4 policyからL6 codeへtraceする。 | surface/pattern integration graph、class/budget receipt |
| **HIL-FR-75** | visual accessibilityをL4 policy、L5 oracle、L7 Red、L6 implementation、L8 component evidence、L9 cross-screen evidence、L10 runtime measurementの連鎖で閉じる。contrast、focus visibility、zoom/reflow、motion preferenceを直接検証し、semantic ARIA/keyboard task successは別ownerのreceiptへjoinする。 | visual-a11y closure graph、runtime evidence、external semantic receipt |
| **HIL-FR-76** | L10 Browser/Data Visual System Gateはbrowser engine×OS profile×viewport/DPR×theme/preferences×representative product-data scenarioのmanifestを固定し、real render、empty/nominal/long/error/locale/role/slow/offline、responsive、motion、visual-a11y、semantic continuityを全Screen FR/AC/NFRへexact joinする。synthetic-only、stale product snapshot、aggregate screenshot、実browserなしをgreenにしない。 | matrix cell evidence、journey/lineage trace、L10 machine exit receipt |
| **HIL-FR-77** | late UI gapをtyped `UiChangeDelta`としてcandidate→observing→approved/rejectedへ遷移させ、behavior/design変更はRedesign、behavior-preserving設計整理はDesignRefactor、additive変更はadd-design/add-implへrouteする。 | UI delta event、authority/routing receipt |
| **HIL-FR-78** | Design作業用HARNESS Capsuleはprototype、Product UI Profile、Frontend Binding、mission、oracleの各digestとapplicabilityを保持し、silent omission、stale context、worker/verifier混同を拒否する。 | Design capsule、context/freshness receipt |
| **HIL-FR-79** | L11 Visual Acceptanceはcurrent L2 Prototype Agreement/visual intentとL8–L10 machine evidence packetを同一revisionで人間へ提示し、criteria別accept/reject/preference/dissentを記録する。AIは証拠収集と客観gateを自走できるが、視覚・体験・表現品質の人間receiptを代行・推測・自己承認しない。reject/uncertainはcloseせずRedesignへrouteする。 | authority matrix、revision-bound human judgment、Redesign receipt |
| **HIL-FR-80** | Repository Savepointはpush済みcommit、remote annotated tag、harness.db checkpoint、artifact/requirement/design/test/gate digest、authority model、CI/review stateを一つのimmutable receiptへ結合する。既存tag名の再利用・移動・削除、dirty tree、未push commit、digest不一致を拒否し、復元時はtagから新branchを生成してcheckpoint projectionを再構築・照合する。release tagとはnamespace/authorityを分離する。 | savepoint receipt、remote tag verification、restore/rebuild receipt、protected namespace |
| **HIL-FR-81** | Layer Freeze Tag GateはL1–L12各層のfreeze時だけversioned annotated tagを生成し、工程表/harness.dbの連続進捗とは分離する。Ln tagはL(n-1) current tagの子孫commit、同層旧versionのsupersession、layer gate/pair receipt、remote tag protectionを証明する。後続層tagの先行、tag移動、旧設計SHAへの実装tag、Sprint/release namespace混同、V-pair片肺tagを拒否する。 | layer tag receipt、ancestor proof、V-pair tag receipt、supersession edge、progress projection |

HIL-FR-80/81の追加不変条件として、左側layer freezeは`pending_pair`でremote immutable tagを先行作成できるが進捗を`frozen`へ算入せず、対向layer確定後のcurrent pair receiptでのみ`current`へ閉じる。remote tag成功後のDB crashはremote OIDとoperation/payload digestからreconcileし、工程表task-set/denominator digest、HEAD/index/tracked working-tree exclusion、GitHub API/UI visibilityとbypass expiryを同一receiptへ結合する。refreeze中は`live_progress`、`in_progress`、`last_frozen`を別投影とする。

## §3 runtime・データ・OS要件

| ID | 要求 |
|---|---|
| **HIL-TR-01** | HELIX control planeはTypeScript strict＋Node.jsを正規runtimeとし、Bun固有API・command・lockfile・CI・distribution契約を段階撤去する。 |
| **HIL-TR-02** | Pythonはproduct-data、document-engine、detector、analysis workerのdata/detection planeとして第一級化し、Node control planeとはversioned schema/event/CLI contractで接続する。 |
| **HIL-TR-03** | Hybrid ZIPのPython実装はdocument/data/detection engineの第一候補として保全し、TS/Nodeへ一括再実装しない。既存Node control/gate/authoritative commitもPythonへ複製・全面移植せず、runtime間logic forkを作らない。既存Python CLI/libraryを隔離working directoryで実行し、HELIX state/gateを迂回した正本write、repo path escape、任意commandを禁止する。Nodeが入力digest、出力schema、relative path、provenance、detector resultを再検証して単一transactionでDBへ投影する。 |
| **HIL-TR-04** | OS優先順位はLinuxをprimary、macOSをfirst-class portable、Windowsをcompatibility profileとする。WSL/Git Bash/PowerShellをcore前提にしない。 |
| **HIL-TR-05** | path、process、signal、file lock、SQLite、executable discoveryをOS adapterへ隔離し、Linux CIを基準、macOS/Windows smokeを互換性証拠とする。 |
| **HIL-TR-06** | Node/Python双方のdependency lock、runtime version、offline/clean install、SBOM/secret/license検査を再現可能にする。 |
| **HIL-TR-07** | SQLite/harness.dbはcontrol planeのevent/projection backboneを維持し、Python分析用read modelとNode write authorityを分離する。write authority変更はL4で決定する。 |
| **HIL-TR-08** | Node↔Pythonの初期正規IPCはchild process＋versioned JSON Lines over stdioとし、stdoutをprotocol、stderrを診断専用にする。envelopeはschema/run/request/type/sequence/deadline/payload digestを持つ。 |
| **HIL-TR-09** | Python workerはharness.dbへ直接writeせず、Nodeがschema検証済みresult/findingをtransactionalにcommitする。Pythonへは必要最小限のread snapshotだけを渡す。 |
| **HIL-TR-10** | harness.dbはproduct source/snapshot/mapping、engine registry/run/artifact、detector registry/run/finding、IPC run、CI stage/quarantine、agent instance/lifecycleを論理的に分離する。 |
| **HIL-TR-11** | Bun cutover完了時はNode clean install/build/test/CLI/hooks/package/distributionをBun binary/loader/API/lockfileなしで実行可能にする。 |
| **HIL-TR-12** | Universal Workflow componentはversioned typed IRをNode control planeで検証し、Pythonを用いる場合もproposal-only worker境界を越えてstate、Issue、PLAN、gateを直接変更しない。 |
| **HIL-TR-13** | GitHub/Claude/Codex/CI等の外部adapterはCanonical Action Intentを共通入力とし、hookが存在しないhosted/API surfaceで機械enforcementを過大主張しない。 |

## §4 非機能要求・強制不変条件

| ID | 非機能要求 |
|---|---|
| **HIL-NFR-01** | 同一GitHub delivery、Issue contract、job、PR headに対する副作用は冪等で、重複Issue/実装/memory昇格を作らない。 |
| **HIL-NFR-02** | worker≠verifier≠knowledge promoterを維持し、Codexは最終audit/close/memory昇格を自己承認しない。 |
| **HIL-NFR-03** | 全IssueのReverse処理量を省略しない。`none/not-required/exempt`とphase skipを禁止し、budget到達は未完obligationを免除せずcheckpoint＋未完了状態へ遷移する。 |
| **HIL-NFR-04** | 各loopはiteration/time/token/cost上限、停止理由、再開checkpointを持ち、無限再Issue化を防ぐ。 |
| **HIL-NFR-05** | Issue/PR/comment/ZIP/外部データはuntrusted inputとして扱い、実行命令、metadata、evidenceを分離する。 |
| **HIL-NFR-06** | 認証・認可・決済・PII・secret・license・schema migration・破壊的データ・本番/外部infraはaction-binding approvalを必要とする。 |
| **HIL-NFR-07** | Scope Gateは機能追加数だけでなくcomplexity、public surface、運用負債を測り、authoritative oracleへの寄与とminimum-necessary proofがない拡張を拒否する。 |
| **HIL-NFR-08** | PR監査、Issue Gate、agent registry、memory compaction、ZIP detectorはfailure codeとprovenanceを持ち、proseだけの合格を禁止する。 |
| **HIL-NFR-09** | Linux primaryで全core gateを実行し、macOS/Windows差異はadapter contract testで検出する。OS別logic forkを作らない。 |
| **HIL-NFR-10** | agent adapterを削除してもHARNESS registryから再生成でき、runtime固有agent memory/rule siloを正本にしない。 |
| **HIL-NFR-11** | 画面工程は暗黙skip不可とする。画面対象では静的wireframe/proseだけを操作可能prototypeの代替にせず、画面非対象ではLLMの自由文判断だけをskip evidenceにしない。 |
| **HIL-NFR-12** | source coverageは100%列挙を要求し、文書名の列挙、代表fixture、検索結果0件、単一包括要件を完全性証拠にしない。各判断はsource path/entry、digest、抽出時点へ再現可能に結ぶ。 |
| **HIL-NFR-13** | 同一source snapshot、engine/detector version、config digestから得るartifact/findingは決定的で、差異はnondeterminism findingにする。 |
| **HIL-NFR-14** | IPCは不正JSON、schema不一致、oversize、sequence欠落、worker crash、timeout、cancel、backpressure、親process消失をfail-closeし、partial resultを正本へ昇格しない。 |
| **HIL-NFR-15** | 3段CI receiptは各段自身のcommit/tree digestと直前段receiptへbindし、lineageのない別SHA greenを再利用しない。quarantine resultをgreen件数へ算入しない。 |
| **HIL-NFR-16** | quarantineはexact fingerprintだけに適用し、無期限、wildcard、directory単位、全check一括を禁止する。期限切れ、対象変更、fingerprint変化で失効する。 |
| **HIL-NFR-17** | product dataはclassification、最小取得、redaction、retention、freshness SLAを持ち、PII/secret/raw payloadを通常projectionやagent contextへ複製しない。 |
| **HIL-NFR-18** | agent lease失効後のtool call/artifact/completionはfencing token不一致で拒否し、crash後は最後のdurable checkpointからだけ再開する。deadline超過、retry上限到達、role/authority/custody policy変更後のlate writeはfail-closeし、未完task/evidenceをdropせずdead-letterまたは再計画へ送る。 |
| **HIL-NFR-19** | Linuxをcore completion platformとし、macOS portable suiteとWindows compatibility smokeの未実施は明示する。Windows wrapper成功をLinux互換証拠にしない。 |
| **HIL-NFR-20** | Reverse artifactは非空、stage間非同一、source span再現可能、obligation coverage 100%を満たす。文字数だけの下限を内容証拠にせず、stage固有fieldとsemantic assertionで検査する。 |
| **HIL-NFR-21** | user directive/findingの原記録はappend-onlyで、AI dispositionは原記録を削除・不可視化・終端化しない。PO以外のcancel/supersedeと、独立reviewなしのfalse-positive/accepted-riskを拒否する。 |
| **HIL-NFR-22** | source coverage分母はatomic behavior集合とし、aggregate parent、directory/file count、代表fixtureをcovered件数へ算入しない。extractor変更またはsource差分で全child receiptをstale化する。 |
| **HIL-NFR-23** | scope derivation graphはacyclicでauthoritative rootへ到達し、capability自身または同時追加HILだけを根拠にするcycleを拒否する。 |
| **HIL-NFR-24** | Design Refactorは「将来使えそう」「綺麗になる」という推測や名称の文字列類似だけでrename、共通層、base class、汎用object、設定surfaceを増やさない。実在するsemantic similarity/name collision、重複・変更波及・責務混在の証拠、全consumer、最小変換、behavior invariant、退行時rollbackを要求し、誤った名称統一、抽象化、scope creepを拒否する。 |
| **HIL-NFR-25** | Domain Objectはclass化自体を目的にせず、identity/invariant/lifecycle/authorityがないpayloadをEntity/Aggregateへ昇格しない。Value Objectはimmutable、Aggregate更新はroot境界内transaction、Queryはside-effectなし、Domain Eventは完了事実の過去形、domainはPortを介してAdapterへ依存する。`Manager/Helper/Util/Data`等の責務不明名を根拠なしで許さず、testはprivate実装名でなくdomain object＋operation＋oracle IDへbindする。 |
| **HIL-NFR-26** | 文書、template、見出し、入力欄の存在だけを設計完全性とみなさない。各義務は意味のある設計内容、双方向edge、test oracleまたはscope付きN/A receiptで個別消込し、`TBD`、空欄、範囲表記、1行での複数義務消込を拒否する。 |
| **HIL-NFR-27** | Requirement TranslatorとTemplate Improvement Loopは原文を保存し、翻訳の確信度と未解決ambiguityを露出する。subagentが要求を削除・統合・終端化したり、未監査templateをactive化したりしてはならない。 |
| **HIL-NFR-28** | requirement coverageの行数、ID連番、文書存在だけを要件定義の設計完全性としない。各active requirementはsource atom、authority、acceptance oracle、service/capabilityまたは根拠付き非該当、template applicability、design obligationへ個別に結び、未解決ambiguity、orphan、stale revisionをgreenにしない。 |
| **HIL-NFR-29** | Layer Ledger Chainはtemplate/file/章/aggregate親の存在をpair coverageに算入せず、原子的obligationとoracleを分母にする。上下・左右edgeは両方向、同一revision/snapshot、意味粒度一致を要求し、deferred、stale、未実行、片肺pairをgreenにしない。 |
| **HIL-NFR-30** | Universal packageのraw entry、prompt、fixtureを実行authorityにせず、全派生判断をentry digest、transform version、入力snapshotへ再現可能に結ぶ。 |
| **HIL-NFR-31** | field/file存在でなくatomic transition、branch、loop、terminal、derived edgeをcoverage分母にし、aggregate一括greenを禁止する。 |
| **HIL-NFR-32** | ambiguity、unresolved、未回答、unknown referenceを露出し、推測確定、silent skip、未回答のcomplete算入を禁止する。 |
| **HIL-NFR-33** | capacity/token/cost/budget到達はrequired work/evidenceを省略せず、checkpoint、queue、bounded fallbackへ遷移する。resource最適化を処理量削減の根拠にしない。 |
| **HIL-NFR-34** | 既存`judgment-core`を上位判断規律、Universal Workflowをdomain lens/proposal engine、Node deterministic gateをcommit authorityとし、package/LLM/skillのself-approvalを禁止する。 |
| **HIL-NFR-35** | standing authorizationでcoveredなproject内・登録外部serviceの通常操作は追加の人間permission質問を0件とする。ただしplatformが物理的に要求するpromptの存在をHELIX許可判断へ混同しない。 |
| **HIL-NFR-36** | executable、shell、Python等の過大なcommand prefix、自由文の包括許可、credential所持だけをstanding authorityにせず、targetとoperationを最小権限で束縛する。 |
| **HIL-NFR-37** | target、repository、service identity、operation class、risk、profile revision、expiry、revocationの不一致またはdrift時はfail-closeし、類似名や過去許可へfallbackしない。 |
| **HIL-NFR-38** | standing authorizationはScope、Reverse、Redesign、CI、closure、release/tag/cutover、本番、auth、payment、PII、secret、license等の他gateを上書きしない。 |

## §5 L4で確定する基本設計判断

1. Node package manager、Node LTS、build/package/distribution方式。
2. Python workerのprocess境界、schema、timeout、sandbox、dependency isolation。
3. Claude Code拡張hook event payloadとPR deliveryのidempotency key。
4. Infinity Loopのstate machine、lease、retry、stop、re-entry、causality schemaを確定する。
5. Universal ReverseとRedesignのmode/kind/layer/PLAN schema、既存`promotion_strategy=redesign`との名称衝突解消。
6. Issue contractのGitHub/DB/repo三面正本とdigest更新規則。
7. Scope/capability budgetの計測方式と子Issue分離規則。
8. agent registryの保存形式、Claude/Codex adapter生成、blind packet、muster preset。
9. memory compactionの入力packet、promote/supersede/no-promotion、secret/PII filter。
10. ZIP detector/data modelをNode/Pythonどちらへ置くかの採否台帳。
11. Screen Applicability receipt schema、prototype artifact/walkthrough schema、skip失効と再entry規則。
12. source snapshot/capability ledger schema、抽出粒度、coverage stale判定、freeze gateへの接続。
13. `DesignRefactor`のcandidate schema、設計graph metric、外部化・共通化・オブジェクト化の判定、既存L7 `Refactor`および`Redesign/Retrofit`へのrouting。
14. Domain Object/Naming Catalogの分類、canonical term、symbol→oracle mapping、DDD invariant、ambiguous naming detectorとtest配置規則。
15. Design Template RegistryとDesign Obligation Graphの適用規則、原子的消込、N/A/deferred/stale契約。
16. Requirement Translatorのatom schema、challenge route、Template Gap Issueとshadow昇格loop。
17. Requirement Definition Ledgerのstable ID/revision、split/merge/rename/supersede、typed edge、stale伝播、freeze条件。
18. L1–L12 Layer Ledger Registry、template obligation抽出、上下隣接pair、左右V-pair、ledger-based Design Refactorのschemaとgate。
19. Universal Workflow typed IR、elicitation dependency graph、judgment record、schedule state、package improvement lifecycle。
20. Canonical Action Intent、Standing Authorization Registry、Execution Authorization Gate、platform brokerの責務境界。
21. Hybrid Python 29 moduleの`reuse-as-is/reuse-with-adapter/harden/redesign/reject`、静的に確認したfilesystem mutation
    15 module以上、subprocess surface 4 module以上、network connector 1 module以上のsandbox/path/command/network境界。
    dynamic call/effect trace完了前の値を最終behavior分母またはactive adoption数にしない。

## §6 既存資産との接続

- P0/P1/P2/P4/P6/P7/P9を置換せず、Infinity Loopで結線する。
- 旧UT universal PR trigger、agent registry、plan-asset evidence trustはbranch固有資産として必ず採否するが、L0–L14工程authorityは持ち込まない。
- ZIPの`agent_meta.py`相当とcore detector群は、既存`vmodel-agent-contracts`/DB projectionだけで充足したと仮定せず、機能単位で比較する。
- 既存の`redesign`はDiscovery promotion strategyであり、本要件の第一級Redesign modeとは別概念。L4で識別子を確定するまで混同しない。
- Bun→Node移行中も既存green evidenceを捏造しない。legacy Bun CIは隔離可能だが、Node最小gateなしの無検証状態を許可しない。
- 既存L2 Low-FiとZIP diagram/visual検証資産は画面対象routeの材料にするが、今回のno-UI sliceへ架空の画面要求を作らない。
- L10はproduction実装後のUX/a11y/visual検証として維持し、実装前prototype作成工程をL10へ先送りしない。
- production Scrumは各vertical slice内でHybrid L1–L12の圧縮Vを実行する。現行`kind=poc` ScrumはDiscovery/PoC互換routeへ降格し、production Scrumの正本にしない。
- 既存`src/state-db/refactor-candidates.ts`と`docs/process/modes/refactor.md`はL7コードRefactorの土台として再利用するが、現行5 candidate種とTS source走査だけでDesign Refactorを充足したとみなさない。設計graph、document/schema/policy、consumer contractを対象に拡張する。

## §7 要件freeze判定

141件の採番、statement digest、L4 component候補、HIA pointerは閉じているが、次が未完了のため本書は`draft`である。

1. Core Reads、process、schema、gate、generator、test authorityに残る旧L0–L14/TS-Bun/Scrum=PoC前提のcutover。
2. Hybrid 703 entryのatomic behavior、fixture producer/assertion、design/test/gate joinの閉包。
3. UT current heads/tags/pull-head/pull-mergeのsealed authority receiptと全ref adoption disposition。
4. current HELIX HEADのsource snapshot再取得と、旧snapshot以降のatom/coverage stale再計算。
5. Universal Workflow hardening finding 6件、L5 test design、HST/system assertion case、独立reviewの閉鎖。
6. L1要件141件のprimary L3 ownerとsupporting edgeの分離、L1↔L3双方向edge生成。
7. source authority、template applicability、design obligation discharge、上下/左右pairの141件個別receipt。

進捗表示は次の分母を混同しない。

| metric | current | 判定 |
|---|---:|---|
| requirement ID registration | 162/162 | PASS |
| statement digest | 162/162 | PASS |
| L1/L3 coverage unique IDs | 162/162 | PASS（primary/supporting分離未完） |
| L3 FR/AC definition | 26/26 FR、78/78 AC | PASS（HST未閉鎖） |
| source authority current | 0/162 | FAIL |
| template applicability | 0/162 | FAIL |
| design obligation discharge | 0/162 | FAIL |
| active/frozen requirement | 0/162 | FAIL |

`162/162`の採番またはpointer閉鎖を要件定義freezeへ読み替えない。全blocking denominatorが0件となり、
別runtimeの独立reviewとPOのL3承認を得た時点だけfreezeできる。
