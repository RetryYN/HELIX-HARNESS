---
title: "HELIX L1 要件 — Infinity Loop platform / runtime再編 / Issue強制契約"
layer: L2
legacy_layer: L1
canonical_layer_scheme: L1-L12
kind: add-design
status: draft
created: 2026-07-15
updated: 2026-07-19
owner: PO (人間 / RetryYN)
plan: PLAN-L1-07-infinity-loop-platform-requirements
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
pair_artifact: docs/test-design/helix/L1-infinity-loop-operational-test-design.md
definition_ledger: docs/governance/infinity-loop-requirement-definition-ledger.md
---

# HELIX L1 要件 — Infinity Loop platform

## §0 システム定義

HELIXは、層外authority anchorであるL0 charterからcanonical L1企画へ投影し、縦軸にL1→L12の **Forward spine**、横軸に
**監査・改善 ⇔ Gate ⇔ 自動走行** の `HELIX Infinity Loop` を持つ。
Forwardだけを完了正本とし、横軸は証拠生成、監査、設計訂正、自己改善を循環させてForwardへ収束する。

役割は非対称に固定する。

| 主体 | 第一責務 | 主入力 | 禁止 |
|---|---|---|---|
| Codex | G3承認後のUIデザインを除く設計・実装・検証・PR・CI self-heal | 凍結設計、PLAN、Issue、test-design | prototype/UIデザインの代行、自成果の最終監査、Issueの証拠なし破棄、memory最終昇格 |
| Claude Code | ユーザー指示、PR hook、DB横断監査、改善Issue、Codex完了時memory圧縮 | harness.db、relation graph、PR、実行evidence | Codexと同じ視点だけの追試、証拠なしgate昇格 |
| Gate | Issue契約、Reverse、scope、CI、closureの決定論判定 | repo/GitHub/DBの構造証拠 | LLM裁量によるbypass |

### §0.1 画面工程の適用判定

画面工程は任意に消せる工程ではない。対象ごとに、操作可能prototypeを用いる
`prototype_required`と、画面が存在しない`not_applicable`のどちらかを明示し、判定receiptを残す。
前者はL0の粗要求からprototypeを先行し、walkthroughで発見した潜在要求をL1へ戻した後に要件をfreezeする。
後者だけがprototypeを作らず進めるが、理由、判定者、入力digest、再entry条件を必須とする。

本要件sliceはHARNESS control/data planeと実行監査機構の構築で、ユーザー画面をscopeに含まないため
`not_applicable`とする。dashboard、GUI、対話画面を後続scopeへ追加した時点でこの判定は失効し、
`prototype_required`へ再entryする。暗黙skipや「画面が無さそう」というLLM推測によるskipは認めない。

## §1 業務要求

| ID | 要求 |
|---|---|
| **HIL-BR-01** | Codex自動走行とClaude Code監査を、PRとharness.db eventで交互に接続し、人のL3承認後はgate赤または承認待ちの本番／高影響actionまで無人完走する。branch・staging・backup・rollbackで安全化できる診断と修正は自走する。 |
| **HIL-BR-02** | Claude Code拡張hookはCodexのPR作成/更新/完了を検出し、監査jobを冪等生成する。全base branchのPRを対象とし、stacked PRを除外しない。 |
| **HIL-BR-03** | Claude CodeはCodex完了時にraw実行ログ、PR、test/CI、監査所見を圧縮し、永続知識だけをharness memoryへ昇格する。進捗はDB continuationへ残しmemoryへ混載しない。 |
| **HIL-BR-04** | 実行へadmitされたIssueは主駆動モデルとReverse PLANを必ず持つ。Reverse R0–R4はForward実装前の先行タスクであり、省略値を持たない。future Update backlogはactive化まで実行Issueへ算入しない。 |
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
| **HIL-BR-25** | canonical L1からL12の各layerに粒度固有の設計・実行・検証台帳を置く`Layer Ledger Chain`を持つ。L0 charterは層外authority anchorとしてL1企画へ投影する。各台帳は上位/下位layerと双方向に導出・逆伝播し、正規V-modelの左右pairとも双方向に対応する。上下または左右の片edgeだけで工程完了を主張しない。 |
| **HIL-BR-26** | AIは要件・設計・PLAN・関連Markdownを自律的に起草、追加、修正、分割、統合、改名できる。Authoringの自由とCanonical化を分離し、正本化だけを`Authoring Admission Transaction`で制御する。可逆かつ既定policy内の変更は自動確定し、上位目的、安全境界、不可逆な外部契約を変更する場合だけ人間へescalateする。 |
| **HIL-BR-27** | 要求定義から下流を自動走行するための設計契約とtemplate見本は固定冊数で配布せず、要求atom、設計義務、risk、状態遷移、failure境界、適用工程から必要十分な`Design Contract Portfolio`を導出する。同じ意味契約の文書量産と、見本不足をLLM自由補完で埋めることの双方を拒否する。 |
| **HIL-BR-28** | `Design Contract Portfolio`をForwardのlayer entry/exitとScrum/PoCのS0–S4へ接続し、短いsprintでも上位要求・Forward返却先・V-pair oracleを失わない。ScrumをForward外の別正本にせず、発見deltaを要求とtemplate改善へ逆伝播してS4判断後にForwardへ収束する。 |
| **HIL-BR-29** | 判断系skillを汎用checklistの固定配布に限定せず、工程、domain、risk、failure mode、判断authorityに適合するversioned judgment packとして拡張する。候補skillはshadow評価と独立reviewを経るまで判断gateの強制規則へ昇格しない。 |
| **HIL-BR-30** | HARNESSは工程表、Design Contract Portfolio、判断pack、task分類から専門agent contractを必要時に自動生成し、runtime固有subagent定義へ射影する。専門化の根拠がないagent増殖を避け、worker/verifier/authority分離、最小context、tool/path権限、budget、停止条件を生成時に拘束する。 |
| **HIL-BR-31** | 第三者workerを価格や公称性能だけで採用せず、機械判定可能なacceptance bench、blind judgeを含むfull bench、HELIX実task scorecardで品質・安全・実効costを比較し、採用、用途限定、quarantine、retireを証拠付きで決定する。 |
| **HIL-BR-32** | Claude/Codex以外の定額worker runtime（Kimi/Grok等）をprecedenceを曲げずproposal-only workerとして接続し、実行を隔離worktree/sandbox内に限定してrepository本体、`.helix/` state、harness DB、credentialへ到達させない。秘密・機密を含む作業の第三者runtime委譲を禁止する。 |
| **HIL-BR-33** | 配布はmarketplace型パッケージ仕様（正本index、手編集禁止の生成index、first-party/third-party分離、免責記載）で定義し、配布surfaceの実切替は既存cutover承認境界に従う。 |

## §2 機能要求

| ID | 機能要求 | 観測可能な出力 |
|---|---|---|
| **HIL-FR-01** | `InfinityLoopEvent`を受理し、`intake→reverse→redesign?→pair-freeze→implementation→local-prejoin-ci→forward-join→internal-postjoin-ci→github-pr→external-ci→audit→merge/issue`を状態遷移する。各段は入力commit/tree digestと前段receiptへbindする。 | append-only event、現在state、parent/cause ID |
| **HIL-FR-02** | PR hook intakeはrepository/PR/head SHA/event delivery IDを正規化し、同一deliveryを一度だけ監査queueへ登録する。 | audit job、idempotency receipt |
| **HIL-FR-03** | Issue contractはobjective、acceptance oracle、primary mode、drive、affected layers、Reverse、Forward target、risk、scope budget、digestを保持する。 | versioned issue contract＋digest |
| **HIL-FR-04** | Universal Reverse Gateは実行へadmitされた全IssueのR0–R4を順序実行し、各phaseのobligation集合、input/output digest、stage固有schema、source coverage、R4 routing、双方向参照を検査する。R1を含むphase skipは認めず、該当契約なしも探索証拠付き結論として記録する。 | pass/fail receipt＋不足/空洞化code |
| **HIL-FR-05** | Redesign routerは設計欠陥をcanonical L1–L6の影響層へ割り当てる。L1企画変更はL12運用テストpairを、L2要求変更はL11受入テストpairとScreen Applicability/prototypeまたはskip receiptをstale化して再freezeし、Reverse→Redesign→pair-freeze→Forwardの順序を強制する。層外L0 charter変更はPOへescalateする。 | redesign PLAN、修正layer、stale edge、pair receipt |
| **HIL-FR-06** | Scope Gateはallowed changes、non-goals、PO-bound capability budget、requirement→symbol→test traceを実diffと照合する。derived HIL IDは自己正当化に使えず、chat/L0/PO-approved parent oracleへのderivationとminimum-necessary proofを要求する。子Issueも同じscope authorityを継承する。 | scope violation、unjustified capability一覧 |
| **HIL-FR-07** | Closure GateはPR、CI、Claude audit、Forward merge、oracle、memory compaction、子Issue状態を検査する。 | closure receipt、close可否 |
| **HIL-FR-08** | Codex実行器はready Issueだけをclaimし、Reverse/Redesign/pair-freeze未完了では実装toolを起動しない。 | claim lease、blocked reason |
| **HIL-FR-09** | Claude監査器はDB relation/coverage/contract/impact viewとPR差分を突合し、findingを`actionable_issue/duplicate/false_positive/accepted_risk/telemetry`へ証拠付きdispositionする。非actionable分類はfindingを削除/終端化せず、独立reviewとappeal routeを持つ。 | audit finding、affected layer、非終端disposition receipt |
| **HIL-FR-10** | Memory CompactorはIssue admission時の問題・判断要約とCodex completion時の永続知識を別event種別で圧縮し、promote/supersede/no-promotionを記録する。進捗/raw logはmemoryへ複製しない。 | issue-summary、compressed memoryまたはno-promotion receipt |
| **HIL-FR-11** | Agent Registryはlayer、drive、task-kind、context pack、skills、blind、generates、forbidden paths、verification patternsをHARNESS正本として持つ。 | runtime中立agent contract |
| **HIL-FR-12** | Agent Sync/GuardはClaude/Codex定義を生成し、手編集drift、未登録agent、model/effort override、blind context漏洩、forbidden pathをfail-closeする。 | generated adapter、drift/guard receipt |
| **HIL-FR-13** | Musterはtask-kind→verification patterns→eligible agentsの2段引きでW-agent teamを決定論的に生成する。 | TeamDefinition、worker/verifier分離証拠 |
| **HIL-FR-14** | Learning Promotionはraw event→pattern→recipe→shadow→skill/detector/gateの昇格状態を管理する。 | promotion ledger、効果測定、rollback target |
| **HIL-FR-15** | Hybrid docgen ingestionはZIPのagent metadata、spec ID、trace、impact、consistency、assignment、schedule、detector結果をHELIX契約へ変換する。 | source digest、adoption decision、DB relation |
| **HIL-FR-16** | Asset Inventoryは現行HELIX、ZIP、前身repository exact 2件のA/B二重観測で一致した全advertised `refs/heads/*`、`refs/tags/*`、`refs/pull/*/{head,merge}`を機能単位で比較し、adopt/harden/redesign/rejectを記録する。symbolic `HEAD`とannotated tagの`^{}`はref分母に数えず、target/peel証拠として保持する。 | 完全性台帳、authority receipt、未判断0判定 |
| **HIL-FR-17** | Screen Applicability GateはL0企画、scope、公開surfaceから画面/対話の有無を判定する。画面ありはPrototype Discoveryへroutingし、画面なしskipには理由、判定者、入力digest、再entry triggerを要求する。 | `prototype_required` taskまたは`not_applicable` receipt |
| **HIL-FR-18** | 画面対象のPrototype Builderはscreen ID、主要操作、遷移、9状態fixture、仮データ境界を実行可能artifactへ材料化する。視覚忠実度とは独立に要求発見に必要な操作経路を再生可能にする。 | artifact manifest、digest、起動手順、screen/interaction/state trace |
| **HIL-FR-19** | 画面対象のWalkthrough Loopはprototype版、ユーザー観測、発見要求deltaまたは`no_delta`、L1反映先、再作成判断を記録し、boundedに反復する。 | walkthrough receipt、requirements delta、iteration checkpoint |
| **HIL-FR-20** | Screen Gateは画面対象ならartifact、walkthrough、要求反映、prototype agreementを検査し、画面非対象ならskip receiptのscope/digest/再entry条件を検査する。いずれも無い場合はL1 freezeとL3開始をfail-closeする。 | G2判定、agreementまたはskip receipt、不足code |
| **HIL-FR-21** | Source Snapshot ManifestはZIP entry、前身repository exact 2件のidentity、namespace policy、advertisement A/B digest、全ref→peeled object→commit/tree→entry edge、sealed mirror receipt、現行HELIX symbol/doc/testを固定し、観測時刻、source/tree digest、取得器・抽出器versionを記録する。ref/content/edge分母はreceiptから導出し、remote identity・advertisement・namespace・source集合が変われば既存snapshot、atomization、coverage receiptをstale化する。 | immutable manifest、Git authority receipt set、source digest、stale判定 |
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
| **HIL-FR-32** | Agent Lifecycle Controllerは`registered→eligible→mustered→leased→running→checkpointed→completed/failed/cancelled→verified→released`を管理し、`quarantined/retired`を終端分岐として持つ。 | instance event、lease/heartbeat、context/result/verification receipt |
| **HIL-FR-33** | Bun Dependency Coverage Gateはactive source/import/command/script/test/package/lockfile/CI/hook/template/setup/distributionからBun依存を抽出する。historical/archiveだけを理由付きallowlist可能とする。 | classified dependency ledger、active Bun count |
| **HIL-FR-34** | OS Contract Runnerは同一fixtureでpath separator/case/space/Unicode/permission/symlink/signal/process group/file lock/SQLite/executable discoveryをLinux/macOS/Windows adapterへ適用する。 | OS contract result、adapter violation |
| **HIL-FR-35** | Reverse Substance GateはR0 evidence map、R1 observed contracts、R2 as-is design/test、R3 intent hypothesis＋PO検証、R4 gap/routingをstage別schemaで検査し、空、placeholder、同文、同digest、対象obligation未被覆、根拠なし`no finding`を拒否する。 | phase assertion、coverage、content digest、substance failure code |
| **HIL-FR-36** | Directive Custody Gateはuser directiveを受信直後に原文参照、source span、actor、received_at、digest、supersession chain付きで永続化する。duplicateは生存targetとoracle包含証拠、false-positiveは独立反証、accepted-risk/cancel/supersedeはPO receiptを要求する。 | durable intake、disposition challenge、appeal/reopen receipt |
| **HIL-FR-37** | Source Capability Atomizerは各file/entry/symbolからatomic behaviorを抽出し、1 behaviorごとにsource span、extractor version、parent aggregate、入出力/副作用を付与する。aggregate親とfile分類はcoverage分母に数えず、atomic child未閉鎖を隠さない。 | atom manifest、parent-child count、unclassified/overlap finding |
| **HIL-FR-38** | Scope Authority Gateは各capabilityの根拠をchat directive、L0、PO-approved scopeまたはそのderivation chainへ結び、acceptance寄与、最小性、代替案、budget消費を検査する。後付け要件だけの循環根拠を拒否する。 | authority edge、necessity proof、budget receipt |
| **HIL-FR-39** | Design Refactor Gateはdesign graph、重複contract/policy/schema、責務とstate invariant、consumer集合、before/after oracleを比較し、`externalize/commonize/objectize/semantic-rename`を独立変換として計画する。renameは名称の文字列類似だけで決めず、入出力、副作用、failure、state transition、call graph、consumer contractを含むsemantic signatureで、同義名の統一または同名異義の分離を判定する。behavior preservation、全consumer compatibility、Scope Authority、設計pair更新、rollbackが揃う場合だけ既存`Refactor`実装へ接続し、observable behavior、public surface、DB semantics、要求の差分を検出した場合は`Redesign/Retrofit`へrerouteする。 | design-refactor PLAN、変換種別、before/after graph digest、semantic/name collision evidence、behavior-preservation receipt、reroute receipt |
| **HIL-FR-40** | Domain Object/Naming Catalogは設計objectを`Entity/ValueObject/Aggregate/DomainService/Policy/Specification/Command/Query/DomainEvent/Receipt/Port/Adapter/Repository`へ分類し、identity、immutability、aggregate boundary、invariant、authority、lifecycle、consumer、canonical termを保持する。各objectとimplementation symbol、test oracle IDを別edgeで決定論的に結び、内部rename後もoracle identityを維持する。 | domain object catalog、naming decision、symbol edge、oracle edge、boundary/invariant finding |
| **HIL-FR-41** | Design Template Registryは要求種別、service/capability種別、domain object roleごとに適用するversioned template schema、必須設計論点、関係edge、適用条件を保持する。 | template version、applicability rule、schema digest、supersession receipt |
| **HIL-FR-42** | Design Obligation Graphは`source/directive→requirement atom→capability/service→domain object→API/data/state/event/failure/security/observability/lifecycle/operation/test oracle/gate`を双方向に結び、必須義務を生成する。未消込、孤児、placeholder、根拠のないN/A、aggregate一括消込が1件でもあればpair-freezeを拒否する。 | obligation graph、discharge receipt、coverage receipt、未消込finding |
| **HIL-FR-43** | Requirement Translatorは入力を1 acceptance outcomeまたは1 constraint単位のatomへ分解し、authority、source span、ambiguity、service候補、domain term、design obligation候補を出力する。複合要求、意味衝突、根拠欠落は自動確定せずchallenge queueへ送る。 | requirement atom、translation receipt、ambiguity/challenge finding |
| **HIL-FR-44** | Template Improvement Loopは翻訳済み要求を現行templateへ照合し、表現不能な設計義務をTemplate Gap Issue化する。候補templateはshadow適用、既存要求への差分、false-positive/negative、migration、独立監査を経てversion昇格し、translator自身による即時強制を禁止する。 | template gap Issue、shadow coverage delta、review receipt、promotion/rollback receipt |
| **HIL-FR-45** | Requirement Definition Ledgerはstable requirement IDとimmutable revisionを持ち、source atom、canonical statement、BR/FR/TR/NFR、modality、priority、scope/non-goal、authority/rationale、acceptance oracle、owner、risk、capability/service、template applicability、design obligationを型付きedgeで保存する。split/merge/rename/supersede/reject/N/Aはbefore/after semantic digest、全source atom disposition、downstream stale、review authorityを持つreceiptがある場合だけ適用する。 | requirement definition/revision、typed edge、change/applicability receipt、orphan/stale finding |
| **HIL-FR-46** | Layer Ledger Registryはcanonical L1–L12ごとにledger type、粒度、必須node/edge、authority、input/output、entry/exit gate、template versionを登録する。L0 charterは層外authority anchorとして別登録する。各layer ledgerのrowはstable subject ID、revision、source span、semantic digest、status、owner、downstream/upstream edgeを持つ。 | layer ledger catalog、row revision、layer snapshot、coverage receipt |
| **HIL-FR-47** | Template Obligation Extractorは各layerのactive templateから章、field、table row、applicability rule、done-when、pair contractを原子的obligationとして機械抽出し、該当ledgerへ候補行を追加する。未対応template要素、空/TBD、抽出不能、同一obligation重複をfinding化し、LLM自由補完で埋めない。 | template atom、ledger proposal、extractor/version digest、gap finding |
| **HIL-FR-48** | Vertical Ledger Pair Gateは隣接layer間の`derived_from/downstream_to`と`backpropagates_to/supersedes`を双方向検査し、上位義務の未降下、下位発見の未逆伝播、粒度不整合、stale revision、aggregate一括pairを拒否する。 | vertical edge receipt、unresolved descent/backprop finding |
| **HIL-FR-49** | Horizontal V-Pair Gateはcanonical正規pair `L1↔L12(企画/運用テスト)`、`L2↔L11(要求/受入テスト)`、`L3↔L10(要件/総合テスト)`、`L4↔L9(基本設計/結合テスト)`、`L5↔L8(詳細設計/単体テスト)`と、`L6実装↔L7 TDD closure`を原子的oracle単位で双方向joinする。L12運用feedbackはL1企画と層外L0 charterへ還流し、設計義務と検証証拠の片側欠落、異なるsnapshot、未実行oracleを拒否する。 | V-pair receipt、design/verification edge、snapshot/oracle finding |
| **HIL-FR-50** | Ledger Design Refactorはlayer ledgerの重複、責務混在、semantic/name collision、変更波及、孤立edgeを比較し、externalize/commonize/objectize/semantic-rename/split/merge候補を生成する。全上下・左右consumer、before/after oracle、pair保持、rollbackが揃うbehavior-preserving変更だけをDesignRefactorへ送り、要求/公開contract/永続state変更はRedesign/Retrofitへrerouteする。 | ledger diff、refactor candidate/plan、pair-preservation receipt、reroute receipt |
| **HIL-FR-51** | Authoring Admission EngineはProposalの意味差分、authority、revision、trace、pair、impact、安全境界、rollback routeを検査し、`auto_admit`、`auto_admit_with_stale_propagation`、`repair_then_retry`、`human_decision_required`、`reject`、`conflict`のいずれかを決定する。 | admission decision、検査finding、authority/impact/rollback receipt |
| **HIL-FR-52** | Atomic Canonicalization TransactionはMarkdown、asset revision、event ledger、trace、impact、stale propagation、harness.db projection、receiptを単一operationで原子的に更新する。部分成功をCanonicalとして扱わず、command idempotencyとbase revision CASを強制する。 | canonicalization receipt、before/after revision、write count、rollback/conflict receipt |
| **HIL-FR-53** | Semantic Revision and Asset Identityはpath・名称から独立したimmutable asset IDを保持し、意味変更を新revisionとして保存する。rename、move、split、merge、supersedeは履歴、authority、oracle、typed edgeを失わず処理する。 | asset revision、identity/location history、split/merge disposition、semantic diff |
| **HIL-FR-54** | Contract Portfolio Plannerはrequirement atomとDesign Obligation Graphを、authority、lifecycle、interface/data/state/event/failure/security/observability/operation、V-pair oracleの同値classへ分ける。各classにnormative contractを原則1件割り当て、既存契約の再利用、delta追加、新規作成、根拠付きN/Aを判定し、未被覆0かつ意味重複0となる最小portfolioを提案する。 | obligation-to-contract matrix、portfolio manifest、reuse/delta/new/N/A receipt、uncovered/duplicate finding |
| **HIL-FR-55** | Template Example Calibratorはactive templateの各validation ruleとapplicability branchに対し、最低限canonical positive 1件と境界negative 1件を要求する。状態遷移、failure、security、migration、multi-runtime差異はrisk分析で未被覆の場合だけ例を追加し、例の個数ではなくrule/branch/risk coverageで十分性を判定する。 | example adequacy matrix、positive/negative fixture、risk追加理由、redundancy finding |
| **HIL-FR-56** | Workflow Contract Routerはportfolio itemをForwardの対象layer input/output、entry/exit gate、下位task、右側V-pairへbindする。Scrum/PoCではS0 backlogにgapと親要求、S1 planに契約snapshot・Forward返却先・budget、S2 pocに生成物、S3 verifyにoracle evidence、S4 decideにadopt/rework/rejectとback-propagationを必須化し、S4未決定の成果をForward currentへ昇格しない。 | workflow binding manifest、phase snapshot、Forward return edge、S4 decision/back-propagation receipt |
| **HIL-FR-57** | Judgment Pack Registryは工程別の判断目的、観点、反証質問、evidence要求、severity、escalation/停止条件、authority、適用domain/risk、model適性、versionを保持し、`judgment-core`、role judgment、task lens、専門skillを重複のないpackへ合成する。 | judgment pack、applicability/digest、source skill edge、conflict finding |
| **HIL-FR-58** | Judgment Pack Improvement Loopはfinding、review reversal、retry、escaped defect、skill efficacyから不足観点を候補化し、with/without shadow比較、false-positive/negative、別runtime review、rollbackを経たversionだけをactive化する。判断結果そのものを自己教師として無監査昇格しない。 | candidate pack、shadow scorecard、independent review、promotion/rollback receipt |
| **HIL-FR-59** | Specialist Agent Contract Compilerはworkflow phase、task-kind、設計義務、domain object、risk、judgment packからobjective、成果物schema、tool guidance、task boundary、context selectors、allowed/denied tools/paths、model/effort class、budget、checkpoint、escalation、verification contractを持つruntime中立agent contractを生成する。 | generated agent contract、input/output digest、generation rationale、guard validation receipt |
| **HIL-FR-60** | Specialist Muster Gateは専門知識、独立context、並列性、blind verificationのいずれかに測定可能な利益がある場合だけ生成agentをmusterし、単一agentで十分なtaskは既存roleへ送る。生成agentをallowlist済みruntime型へ射影し、workerとverifierのprovider/model/authority分離、lease、fencing、retireを検査する。 | specialization decision、TeamDefinition、runtime projection、worker/verifier separation、lifecycle receipt |
| **HIL-FR-61** | Worker Acceptance Benchは候補runtimeごとに短い機械判定smokeとblind judgeを含むfull benchを分離実行し、correctness、mutation kill、instruction/scope following、skill A/B、品質、簡潔性、security、第二diffによる拡張性を同一fixtureとversioned rubricで採点する。 | bench manifest、machine score、blind-judge score、fixture/rubric digest、admission decision |
| **HIL-FR-62** | Task Performance ScorecardはHELIX実taskごとに`first_pass`、`retry_count`、`proposal_diff_size`、`lint_violation_count`、品質judge、実効costを記録する。実効costはAPI相当単価とretryを含め、用途別の採用、限定、quarantine、retire判断へ接続する。 | real-task scorecard、effective-cost breakdown、用途別decision、trend/failure finding |
| **HIL-FR-63** | Effort Routerはupper-tier modelをlow/medium effort既定、lightweight modelをhigh effort既定としてtask riskとbench/scorecardにより選択する。upper-tierの品質不足ではeffort引上げを先に固定せず、model/runtime escalationとの比較証拠を残して最小の有効構成を選ぶ。 | model/effort decision、比較receipt、retry/escalation lineage、policy exception |
| **HIL-FR-64** | Worker Sandbox Contractはversioned templateで第三者CLI workerの実行環境を定義し、書込可能領域を払い出しworktree/scratchへ限定、networkを推論API endpointのみのhost+path allowlistへ制限、credential・`.helix/`・harness DBを非bind、第三者CLI設定変更をbackup付きmerge/appendのみとし、template逸脱とegress実測乖離をfail-close/quarantineする。 | sandbox template digest、egress計測、逸脱finding、quarantine receipt |
| **HIL-FR-65** | Delegation Environment Hygieneは入れ子CLI起動時の環境変数をallow-list方式で最小化し、promptをstdin渡し、stdin消費CLIの明示close、wall-clock timeoutを必須とする。timeoutなし委譲をlint/doctorで検出する。 | 浄化済みenv manifest、timeout設定、lint/doctor finding |
| **HIL-FR-66** | Proposal Revalidation Gateは全第三者worker出力（ファイル成果物含む）をNodeがschema/digest/authority policyで再検証し、出力中のcommand/SQL/absolute path/codeを実行しない。検証levelはstrict既定の段階制とし、委譲完了時のFS差分検査で許可path外書込と指示外install/network取得/テスト実行痕跡をrejectする。 | revalidation receipt、FS diff finding、reject decision |
| **HIL-FR-67** | Payload Minimizationはworkerへの払い出しをtask必要ファイルのみのsparse worktreeへ限定し、git履歴を含めず、払い出し前secret scan passを必須とし、払い出しmanifest（path+digest）をaudit evidenceへ記録する。 | payout manifest、secret scan receipt、履歴排除証跡 |
| **HIL-FR-68** | Delegation Wire Protocolは`helix <runtime>`委譲をプロセス起動+stdout回収から、承認要求・tool call・結果の構造化イベントを受けるadapter契約へ移行し、承認応答policyをNode制御面がコードで保持する。共通下層としてのACP互換採用を評価する。 | structured event log、承認応答policy digest、adapter契約version |
| **HIL-FR-69** | Delegation Audit Evidenceは第三者runtime委譲1件ごとにruntime/model/effort、送信データ分類、sandbox template version、bypass有効化区間、FS差分検査結果、quota状態をharness.dbへdigest付きで記録し、Task Performance Scorecardと同一evidence面で共有する。 | delegation audit row、digest chain、scorecard連結 |

## §3 runtime・データ・OS要件

| ID | 要求 |
|---|---|
| **HIL-TR-01** | HELIX control planeはTypeScript strict＋Node.jsを正規runtimeとし、Bun固有API・command・lockfile・CI・distribution契約を段階撤去する。 |
| **HIL-TR-02** | Pythonはproduct-data、document-engine、detector、analysis workerのdata/detection planeとして第一級化し、Node control planeとはversioned schema/event/CLI contractで接続する。 |
| **HIL-TR-03** | ZIP Python実装は採用候補だが、HELIX state/gateを迂回して直接正本を書かない。入力digest、出力schema、provenance、detector resultをDBへ投影する。 |
| **HIL-TR-04** | OS優先順位はLinuxをprimary、macOSをfirst-class portable、Windowsをcompatibility profileとする。WSL/Git Bash/PowerShellをcore前提にしない。 |
| **HIL-TR-05** | path、process、signal、file lock、SQLite、executable discoveryをOS adapterへ隔離し、Linux CIを基準、macOS/Windows smokeを互換性証拠とする。 |
| **HIL-TR-06** | Node/Python双方のdependency lock、runtime version、offline/clean install、SBOM/secret/license検査を再現可能にする。 |
| **HIL-TR-07** | SQLite/harness.dbはcontrol planeのevent/projection backboneを維持し、Python分析用read modelとNode write authorityを分離する。write authority変更はL4で決定する。 |
| **HIL-TR-08** | Node↔Pythonの初期正規IPCはchild process＋versioned JSON Lines over stdioとし、stdoutをprotocol、stderrを診断専用にする。envelopeはschema/run/request/type/sequence/deadline/payload digestを持つ。 |
| **HIL-TR-09** | Python workerはharness.dbへ直接writeせず、Nodeがschema検証済みresult/findingをtransactionalにcommitする。Pythonへは必要最小限のread snapshotだけを渡す。 |
| **HIL-TR-10** | harness.dbはproduct source/snapshot/mapping、engine registry/run/artifact、detector registry/run/finding、IPC run、CI stage/quarantine、agent instance/lifecycleを論理的に分離する。 |
| **HIL-TR-11** | Bun cutover完了時はNode clean install/build/test/CLI/hooks/package/distributionをBun binary/loader/API/lockfileなしで実行可能にする。 |

## §4 非機能要求・強制不変条件

| ID | 非機能要求 |
|---|---|
| **HIL-NFR-01** | 同一GitHub delivery、Issue contract、job、PR headに対する副作用は冪等で、重複Issue/実装/memory昇格を作らない。 |
| **HIL-NFR-02** | worker≠verifier≠knowledge promoterを維持し、Codexは最終audit/close/memory昇格を自己承認しない。 |
| **HIL-NFR-03** | 実行へadmitされた全IssueのReverse処理量を省略しない。`none/not-required/exempt`とphase skipを禁止し、budget到達は未完obligationを免除せずcheckpoint＋未完了状態へ遷移する。future Update backlogはactive化時に本契約へ入る。 |
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
| **HIL-NFR-18** | agent lease失効後のtool call/artifact/completionはfencing token不一致で拒否し、crash後は最後のdurable checkpointからだけ再開する。 |
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
| **HIL-NFR-30** | 可逆かつ既定policy内のAuthoring変更では人間入力を要求せず、機械検証からCanonical化まで自動完走できる。確認待ちを安全策として乱発せず、真のauthority境界だけをescalateする。 |
| **HIL-NFR-31** | Authoring正本、ledger、trace、projection、receiptはall-or-nothingで更新し、fault injection後にも部分current状態を0件とする。 |
| **HIL-NFR-32** | 意味変更はauthority、impact、pair、oracle、rollback、downstream stale propagationが揃わない限りCanonical化しない。 |
| **HIL-NFR-33** | contract/templateの十分性はファイル数、ページ数、見本数、見出し数で判定しない。全applicable obligation、validation rule、branch、risk、V-pair oracleが一意にcoveredであることを要求し、過剰な重複contract/exampleもcontext costとdrift riskとしてfinding化する。 |
| **HIL-NFR-34** | 自動生成したjudgment packと専門agentは提案時点で権威を持たず、生成元snapshotとdigestへbindする。scope/requirement/template/skill/model catalog/allowlistの変更でstale化し、未監査pack、未許可tool、自己検証、無上限subagent生成、工程外のcompletion authorityをfail-closeする。 |
| **HIL-NFR-35** | worker評価は候補runtime名をblind化し、fixture、rubric、judge version、sample、再試行を固定して再現可能にする。smoke合格だけでfull admissionせず、security failure、scope逸脱、検証不能な出力を平均点で相殺しない。 |
| **HIL-NFR-36** | model/effort選択はtask、risk、runtime、model、effort、retry、品質、costへ追跡可能にし、既定値からの逸脱と品質問題へのescalation順序をreceipt化する。単価だけ又は単発成功だけで最適構成を主張しない。 |
| **HIL-NFR-37** | 委譲データを公開可能/機密/secret・PIIへ分類し、機密以上の第三者runtime委譲を機械ゲート（path allowlist+secret scan）で遮断する。訓練利用opt-outの完了を当該runtime採用の前提条件とし、未完了の間は公開可能コード以外を委譲しない。 |
| **HIL-NFR-38** | YOLO/bypass/auto-approve系設定は実行時のみ有効化し終了時に必ず除去する。repository設定でbypassを恒久禁止できるdenyスイッチを持ち、headless委譲の権限モデルはdeny既定+明示allowlistを理想形とし、YOLO許容はallowlist型を持たないruntimeへの経過措置に限定する。 |
| **HIL-NFR-39** | ベンダー側のプライバシー設定UI、修正宣言、リモートフラグを要件充足の根拠として認めない。セキュリティ要件の充足はHELIXがローカルで検証・強制できる機構（OS sandbox、network allowlist、egress実測、FS差分検査）だけで判定する。 |
| **HIL-NFR-40** | worker runtimeのquota枯渇・rate制限を予定された状態として扱い、laneはfail-closeで退避（キュー保留または代替runtimeへのrouting提案）する。枯渇を無視した継続や無計画retryを行わない。 |

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
18. canonical L1–L12 Layer Ledger Registry、層外L0 charter anchor、template obligation抽出、上下隣接pair、左右V-pair、ledger-based Design Refactorのschemaとgate。
19. Design Contract Portfolioの同値class、最小十分性、再利用/delta/new/N/A判定と、template exampleのrule/branch/risk coverage算定。
20. Forward layer entry/exit/V-pairとScrum S0–S4を結ぶworkflow contract、snapshot、back-propagation、S4昇格境界。
21. Judgment Pack Registry/Improvement Loopの合成、conflict解決、shadow efficacy、独立review、version昇格規則。
22. Specialist Agent Contract Compiler/Muster Gateの生成schema、専門化判定、runtime allowlist射影、権限・budget・lifecycle・worker/verifier分離。

## §6 既存資産との接続

- P0/P1/P2/P4/P6/P7/P9を置換せず、Infinity Loopで結線する。
- 旧UT universal PR trigger、agent registry、plan-asset evidence trustはbranch固有資産として必ず採否する。
- ZIPの`agent_meta.py`相当とcore detector群は、既存`vmodel-agent-contracts`/DB projectionだけで充足したと仮定せず、機能単位で比較する。
- 既存の`redesign`はDiscovery promotion strategyであり、本要件の第一級Redesign modeとは別概念。L4で識別子を確定するまで混同しない。
- Bun→Node移行中も既存green evidenceを捏造しない。legacy Bun CIは隔離可能だが、Node最小gateなしの無検証状態を許可しない。
- 既存L2 Low-FiとZIP diagram/visual検証資産は画面対象routeの材料にするが、今回のno-UI sliceへ架空の画面要求を作らない。
- L10はproduction実装後のUX/a11y/visual検証として維持し、実装前prototype作成工程をL10へ先送りしない。
- 既存`src/state-db/refactor-candidates.ts`と`docs/process/modes/refactor.md`はL7コードRefactorの土台として再利用するが、現行5 candidate種とTS source走査だけでDesign Refactorを充足したとみなさない。設計graph、document/schema/policy、consumer contractを対象に拡張する。
