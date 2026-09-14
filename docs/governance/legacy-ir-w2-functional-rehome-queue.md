# W2 機能要求の無損失再配置queue

status: queued_after_repository_foundation
parent: [IR再配置wave台帳](legacy-ir-rehome-wave-register.md)
authority: [旧要求carry-forward台帳](legacy-requirement-carry-forward.jsonl)

## 使い方

HIL-FR-01..69を原要求identity一件ごとの`requirement` PRで扱う。順序はsource順であり、優先順位、承認、意味変更を示さない。各項目の原要求identity、原文digest、原文を固定し、後続PRで対象product、successor、保持atom、未被覆atomを記録する。

対象候補は既存crosswalkの整理結果である。`HELIX-HARNESS／HELIX-OS`は二つの責務へ分割する候補であり、どちらか一方へ押し込まない。`判断要（未適用）`は変更済みではない。削除・縮退・統合・降格を意味せず、具体的な変更前後と影響を人へ提示するまで原文を保持する。

## 原要求queue

### 1. HIL-FR-01

- 対象候補: HELIX-OS
- 整理状態: 判断要（未適用）
- 原文digest: `sha256:bf1e51a051e81e130843ed584640fcc1df69d9b5d84f22f22aa29c261b03c3b7`
- 原要求:

> `InfinityLoopEvent`を受理し、`intake→reverse→redesign?→pair-freeze→implementation→local-prejoin-ci→forward-join→internal-postjoin-ci→github-pr→external-ci→audit→merge/issue`を状態遷移する。各段は入力commit/tree digestと前段receiptへbindする。 | append-only event、現在state、parent/cause ID

### 2. HIL-FR-02

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:022383e2542716540cf4fc42ef8d52b58606a03fdf50eb77de378a5d374236b7`
- 原要求:

> PR hook intakeはrepository/PR/head SHA/event delivery IDを正規化し、同一deliveryを一度だけ監査queueへ登録する。 | audit job、idempotency receipt

### 3. HIL-FR-03

- 対象候補: HELIX-HARNESS／HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:be8c55e18f6bd462e31eb805edfa5dd4e378c69b86753b7a2cbfb143e6ab068c`
- 原要求:

> Issue contractはobjective、acceptance oracle、development style、case-driven activation、specialist capabilities、runtime mode、affected layers、style target、risk、scope budget、digestを別fieldで保持する。 | versioned issue contract＋digest

### 4. HIL-FR-04

- 対象候補: HELIX-OS
- 整理状態: 判断要（未適用）
- 原文digest: `sha256:4d8c9fcc0db7c1e522c6e8b42f49521348381d44a6b9a53b01fb47c9f7e5d97b`
- 原要求:

> Universal Reverse Gateは全IssueのR0–R4を順序実行し、各phaseのobligation集合、input/output digest、stage固有schema、source coverage、R4 routing、双方向参照を検査する。R1を含むphase skipは認めず、該当契約なしも探索証拠付き結論として記録する。 | pass/fail receipt＋不足/空洞化code

### 5. HIL-FR-05

- 対象候補: HELIX-HARNESS／HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:e547dbc9b001e344da3953e672675621d353d69137f1e69c2b548c8c232a163d`
- 原要求:

> Redesign routerは設計欠陥をcanonical L1–L6の影響層へ割り当てる。L1企画変更はL12運用テストpairを、L2要求変更はL11受入テストpairとScreen Applicability/prototypeまたはskip receiptをstale化して再freezeし、Reverse→Redesign→pair-freeze→Forwardの順序を強制する。層外L0 charter変更はPOへescalateする。 | redesign PLAN、修正layer、stale edge、pair receipt

### 6. HIL-FR-06

- 対象候補: HELIX-HARNESS／HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:c0b849865dfce9615109e0be6c056ba548bcd5bc33c229abb50b8a7e669c300b`
- 原要求:

> Scope Gateはallowed changes、non-goals、PO-bound capability budget、requirement→symbol→test traceを実diffと照合する。derived HIL IDは自己正当化に使えず、chat/L0/PO-approved parent oracleへのderivationとminimum-necessary proofを要求する。子Issueも同じscope authorityを継承する。 | scope violation、unjustified capability一覧

### 7. HIL-FR-07

- 対象候補: HELIX-HARNESS／HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:a79c1994beaedc462b691f9b398bdd0ef9d64fb3b49678b5617c96bfa85dbbb0`
- 原要求:

> Closure GateはPR、CI、独立audit、選択済みstyleへのmerge、oracle、memory compaction、子Issue状態を検査する。 | closure receipt、close可否

### 8. HIL-FR-08

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:e0118fde6e7618d078d4eeb752a429a1618da24859d31be1b4b930ae168ccf05`
- 原要求:

> Codex実行器はready Issueだけをclaimし、Reverse/Redesign/pair-freeze未完了では実装toolを起動しない。 | claim lease、blocked reason

### 9. HIL-FR-09

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:5594aeaf9047a9dd14646c862da184acf810231d961af8cdadeebf2e54d407c3`
- 原要求:

> Claude監査器はDB relation/coverage/contract/impact viewとPR差分を突合し、findingを`current_pr_fix/successor_issue/duplicate/false_positive/accepted_risk/telemetry`へ証拠付きdispositionする。`current_pr_fix`と`successor_issue`はseverityではなくcurrent contract影響と責務境界で分ける。非actionable分類はfindingを削除/終端化せず、独立reviewとappeal routeを持つ。 | audit finding、affected layer、typed非終端disposition receipt

### 10. HIL-FR-10

- 対象候補: HELIX-OS
- 整理状態: 判断要（未適用）
- 原文digest: `sha256:1fbb80b64b2182063ff3a301d80e56bace634c8b9e362d61d860c6cbc54bcd65`
- 原要求:

> Memory CompactorはIssue admission時の問題・判断要約とCodex completion時の永続知識を別event種別で圧縮し、promote/supersede/no-promotionを記録する。進捗/raw logはmemoryへ複製しない。 | issue-summary、compressed memoryまたはno-promotion receipt

### 11. HIL-FR-11

- 対象候補: HELIX-OS
- 整理状態: 判断要（未適用）
- 原文digest: `sha256:2e149ad2069ec8f3a8e5c8138b31bf34bbd5ad2c6830dd4c35c4d19536b9ead6`
- 原要求:

> Agent Registryはlayer、drive、task-kind、context pack、skills、blind、generates、forbidden paths、verification patternsをHARNESS正本として持つ。 | runtime中立agent contract

### 12. HIL-FR-12

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:1062a9d636d153e32adcf815decbdc36a3d954c566f41fdeeaddd2266604c136`
- 原要求:

> Agent Sync/GuardはClaude/Codex定義を生成し、手編集drift、未登録agent、model/effort override、blind context漏洩、forbidden pathをfail-closeする。 | generated adapter、drift/guard receipt

### 13. HIL-FR-13

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:8472fdc576a52718f2d43f49e410565600d8fc3c0b374110dfad8886e37ccb50`
- 原要求:

> Musterはtask-kind→verification patterns→eligible agentsの2段引きでW-agent teamを決定論的に生成する。 | TeamDefinition、worker/verifier分離証拠

### 14. HIL-FR-14

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:32c9cca689abf14f1a6dba50ff9144ff11791ba29f625b5eb1e4d41abeffff35`
- 原要求:

> Learning Promotionはraw event→pattern→recipe→shadow→skill/detector/gateの昇格状態を管理する。 | promotion ledger、効果測定、rollback target

### 15. HIL-FR-15

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:73dfa183c290d8b7f4e9698e5933b93c4643d9347a6ef8256cdb4c9d95a33ed0`
- 原要求:

> Hybrid docgen ingestionはZIPのagent metadata、spec ID、trace、impact、consistency、assignment、schedule、detector結果をHELIX契約へ変換する。 | source digest、adoption decision、DB relation

### 16. HIL-FR-16

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:3f8059576753f54ac5cbc51a29d19afcc1189f6aee6403196ff3ac7540b0c574`
- 原要求:

> Asset Inventoryは現行HELIX、ZIP、前身repository exact 2件のA/B二重観測で一致した全advertised `refs/heads/*`、`refs/tags/*`、`refs/pull/*/{head,merge}`を機能単位で比較し、adopt/harden/redesign/rejectを記録する。symbolic `HEAD`とannotated tagの`^{}`はref分母に数えず、target/peel証拠として保持する。 | 完全性台帳、authority receipt、未判断0判定

### 17. HIL-FR-17

- 対象候補: HELIX-HARNESS／HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:6c714b85354c436aadad677cb1a379eb4f0ba007f847eec60391618fb07573c7`
- 原要求:

> Screen Applicability GateはL0 charter、scope、公開surfaceから画面／対話の有無を判定する。画面ありはDesign HARNESS specialist capabilityと必要時のcase-driven prototypeを別々に発動し、画面なしskipには理由、判定者、入力digest、再entry triggerを要求する。 | `prototype_required` taskまたは`not_applicable` receipt

### 18. HIL-FR-18

- 対象候補: HELIX-HARNESS／HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:113f62503959378764966ff837c8d5f4beffde5932618b47aee921e507535ab3`
- 原要求:

> 画面対象のPrototype Builderはscreen ID、主要操作、遷移、9状態fixture、仮データ境界を実行可能artifactへ材料化する。視覚忠実度とは独立に要求発見に必要な操作経路を再生可能にする。 | artifact manifest、digest、起動手順、screen/interaction/state trace

### 19. HIL-FR-19

- 対象候補: HELIX-HARNESS／HELIX-OS
- 整理状態: 判断要（未適用）
- 原文digest: `sha256:817dc126b7355e14109936f8f9c83edcd21fdc3d0afd9fad8a41508828306b35`
- 原要求:

> 画面対象のWalkthrough Loopはprototype版、ユーザー観測、発見要求deltaまたは`no_delta`、L1反映先、再作成判断を記録し、boundedに反復する。 | walkthrough receipt、requirements delta、iteration checkpoint

### 20. HIL-FR-20

- 対象候補: HELIX-HARNESS／HELIX-OS
- 整理状態: 判断要（未適用）
- 原文digest: `sha256:222133a9de644396f35972616f71b14d07b7f1c501c737366b9a56f8f5ff5643`
- 原要求:

> Screen Gateは画面対象ならartifact、walkthrough、要求反映、prototype agreementを検査し、画面非対象ならskip receiptのscope/digest/再entry条件を検査する。いずれも無い場合はL1 freezeとL3開始をfail-closeする。 | G2判定、agreementまたはskip receipt、不足code

### 21. HIL-FR-21

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:f25bd0492adc5256b7159de126ae2e70568b08d4bd420d640fa5bd804eddcb3c`
- 原要求:

> Source Snapshot ManifestはZIP entry、前身repository exact 2件のidentity、namespace policy、advertisement A/B digest、全ref→peeled object→commit/tree→entry edge、sealed mirror receipt、現行HELIX symbol/doc/testを固定し、観測時刻、source/tree digest、取得器・抽出器versionを記録する。ref/content/edge分母はreceiptから導出し、remote identity・advertisement・namespace・source集合が変われば既存snapshot、atomization、coverage receiptをstale化する。 | immutable manifest、Git authority receipt set、source digest、stale判定

### 22. HIL-FR-22

- 対象候補: HELIX-HARNESS／HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:9d401a7bd016ded7263eeb3c0546e1bcd15a7fb8acca13fd78bfabd2a80021ac`
- 原要求:

> Source Capability Coverage Gateは各抽出capabilityに一意IDを付け、`adopt/harden/redesign/reject/absorbed`、根拠、HIL要件、基本設計、test、detector/gateを双方向joinする。未判断、根拠なしreject、孤立capability、複合IDによる一括合格が1件でもあればpair-freezeを拒否する。 | capability ledger、coverage matrix、failure code

### 23. HIL-FR-23

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:641f78a72962e9343b37991cb298f1e64e0630659c312dc62c5515db81f5f5eb`
- 原要求:

> Product Data Connector Registryはsource種別、connector/schema version、credential reference、classification、read/write方針、sync方式、owner、enabled stateを保持する。credential値は保存しない。 | connector contract、digest、enable/disable receipt

### 24. HIL-FR-24

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:b021ff425efe0ba75863b33302ec3c41146b5c995ad9cfae41af926e80d152d2`
- 原要求:

> Product Data Ingestionはfull/incremental snapshotを冪等取得し、source record→canonical entity→requirement/design/Issue mapping、provenance、freshness、tombstone、schema driftをread projectionへ投影する。 | snapshot、watermark、mapping edge、stale/drift finding

### 25. HIL-FR-25

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:36c4ed5dec52d986c2fb907a3a77990ba8c37ca9f758659ea629bc5ad1a657f5`
- 原要求:

> Hybrid Document Core Engine RegistryはZIP由来のbuild、agent metadata、assignment、schedule、trace、impact等をversioned capabilityとして分離登録し、入力snapshotごとのrun/artifact/digest/exit statusを記録する。 | engine run、artifact manifest、version、input/output digest

### 26. HIL-FR-26

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:76c13e750973dfd41c71441213ec6b6d17594a8639712557e88a04ecc9e914d4`
- 原要求:

> Detector Registry/Runnerはspec、schema、trace、consistency、file、metadata detectorをcore engineから分離し、finding code、severity、location、subject、evidence、versionを永続化する。 | detector run/finding、dedupe key、provenance

### 27. HIL-FR-27

- 対象候補: 対象未解決
- 整理状態: 配置のみ
- 原文digest: `sha256:d07429d447a619e36123eef0eec84033d66bea379ac65c632db5de7794781ecb`
- 原要求:

> Node/Python Supervisorはworker起動、protocol handshake、request相関、progress、result、error、timeout、cancel、process終了を管理し、失効runのlate resultをcommitしない。 | run lease、protocol digest、terminal receipt、fenced result

### 28. HIL-FR-28

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:b3a1b86046b81e9410004e3f0cfd5c9beb54f88269636a2c287facea182d7ebc`
- 原要求:

> Three-stage CI Orchestratorは各段の必須check、対象SHA/tree digest、結果、artifactを記録し、`local_prejoin→internal_postjoin→github_external`の単調遷移を強制する。 | stage receipt、SHA binding、next-stage可否

### 29. HIL-FR-29

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:3d7362c048ba2b5b344ec3bba8846bc7c9ff89f918290278cb25480dc1292c0b`
- 原要求:

> CI Quarantine Managerは既知failureをcheck名、failure fingerprint、baseline SHAへ限定し、理由、是正Issue、owner、期限/iteration上限、代替minimum gateを必須化する。fingerprint変化は通常failureへ戻す。 | quarantine receipt、expiry/stale判定、remediation Issue

### 30. HIL-FR-30

- 対象候補: HELIX-OS
- 整理状態: 判断要（未適用）
- 原文digest: `sha256:d4fa1ac2785a9989d6e783094a89324f908a0eb20ab53d3138f51677e4e2cd7c`
- 原要求:

> Finding Dispositionはcurrent contract違反、correctness/security/data loss、必須oracle/main/evidenceへの影響と責務境界を評価し、同じ責務・既存scope内で安全かつ局所的に閉じるfindingを`current_pr_fix`、独立責務・別設計・lifecycle・性能改善を`successor_issue`へ分類する。Finding Promotion Pipelineは`successor_issue`だけから重複判定、Issue contract、Universal Reverse、memory issue-summary、Codex queue itemを同一causality IDで原子的に生成する。`current_pr_fix`はwriterへ一括返却し、途中欠落はreadyにしない。 | typed disposition、writer return、Issue/Reverse/memory/queue join

### 31. HIL-FR-31

- 対象候補: HELIX-HARNESS／HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:9982b94a7b289c1f852d5777f0cd06ee05058d272ef97d06bbc6c3acc720723d`
- 原要求:

> Upstream Redesign Re-entryはaffected layerがL1ならL1/L12 pairを、L2ならL2/L11 pairとscreen applicability/prototype agreementをstale化し、再承認前の実装claimとForward合流を拒否する。 | stale edge、re-entry task、re-freeze receipt

### 32. HIL-FR-32

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:cb12c2667ef17913c794742fa7602aa124852e6ee045b99cd037410fcf8349f6`
- 原要求:

> Agent Lifecycle Controllerは`registered→eligible→mustered→leased→running→checkpointed→completed/failed/cancelled→verified→released`を管理し、`quarantined/retired`を終端分岐として持つ。 | instance event、lease/heartbeat、context/result/verification receipt

### 33. HIL-FR-33

- 対象候補: 対象未解決
- 整理状態: 配置のみ
- 原文digest: `sha256:21cb2d593ce14771ea0675e9dd5e441eb2ffaa214c7e300437836f052a2b80dd`
- 原要求:

> Bun Dependency Coverage Gateはactive source/import/command/script/test/package/lockfile/CI/hook/template/setup/distributionからBun依存を抽出する。historical/archiveだけを理由付きallowlist可能とする。 | classified dependency ledger、active Bun count

### 34. HIL-FR-34

- 対象候補: 対象未解決
- 整理状態: 配置のみ
- 原文digest: `sha256:427b87551182dc6c28a31d4f9617b0625120b63e983b25663da667e3a404676a`
- 原要求:

> OS Contract Runnerは同一fixtureでpath separator/case/space/Unicode/permission/symlink/signal/process group/file lock/SQLite/executable discoveryをLinux/macOS/Windows adapterへ適用する。 | OS contract result、adapter violation

### 35. HIL-FR-35

- 対象候補: HELIX-HARNESS／HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:bafd3fc712208ecdea2816ae95128150f13f1b918197c309dcb3acae78b013cd`
- 原要求:

> Reverse Substance GateはR0 evidence map、R1 observed contracts、R2 as-is design/test、R3 intent hypothesis＋PO検証、R4 gap/routingをstage別schemaで検査し、空、placeholder、同文、同digest、対象obligation未被覆、根拠なし`no finding`を拒否する。 | phase assertion、coverage、content digest、substance failure code

### 36. HIL-FR-36

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:5a16d19ff108c767c18eac0db68f6af2c3f5400cf751e8e5b9d920cb33a67435`
- 原要求:

> Directive Custody Gateはuser directiveを受信直後に原文参照、source span、actor、received_at、digest、supersession chain付きで永続化する。duplicateは生存targetとoracle包含証拠、false-positiveは独立反証、accepted-risk/cancel/supersedeはPO receiptを要求する。 | durable intake、disposition challenge、appeal/reopen receipt

### 37. HIL-FR-37

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:34d1fde675a0d97523f479286326cfb162b2b897e5d76921a7dcae514bcb8482`
- 原要求:

> Source Capability Atomizerは各file/entry/symbolからatomic behaviorを抽出し、1 behaviorごとにsource span、extractor version、parent aggregate、入出力/副作用を付与する。aggregate親とfile分類はcoverage分母に数えず、atomic child未閉鎖を隠さない。 | atom manifest、parent-child count、unclassified/overlap finding

### 38. HIL-FR-38

- 対象候補: HELIX-HARNESS／HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:1e9fcc442e00d47b8e3a876bb7eb139356f9447fbce661f77c6cd5c9cd6a870b`
- 原要求:

> Scope Authority Gateは各capabilityの根拠をchat directive、L0、PO-approved scopeまたはそのderivation chainへ結び、acceptance寄与、最小性、代替案、budget消費を検査する。後付け要件だけの循環根拠を拒否する。 | authority edge、necessity proof、budget receipt

### 39. HIL-FR-39

- 対象候補: HELIX-HARNESS／HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:91cbf666593f3585f2d859baf3578b9075d7a92e9b3d936d2c9c4cd47b4f60fc`
- 原要求:

> Design Refactor Gateはdesign graph、重複contract/policy/schema、責務とstate invariant、consumer集合、before/after oracleを比較し、`externalize/commonize/objectize/semantic-rename`を独立変換として計画する。renameは名称の文字列類似だけで決めず、入出力、副作用、failure、state transition、call graph、consumer contractを含むsemantic signatureで、同義名の統一または同名異義の分離を判定する。behavior preservation、全consumer compatibility、Scope Authority、設計pair更新、rollbackが揃う場合だけ既存`Refactor`実装へ接続し、observable behavior、public surface、DB semantics、要求の差分を検出した場合は`Redesign/Retrofit`へrerouteする。 | design-refactor PLAN、変換種別、before/after graph digest、semantic/name collision evidence、behavior-preservation receipt、reroute receipt

### 40. HIL-FR-40

- 対象候補: HELIX-HARNESS／HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:3465949f7d44977d31e9087cf0637261068640d74c72dd1ce5b271fc84378948`
- 原要求:

> Domain Object/Naming Catalogは設計objectを`Entity/ValueObject/Aggregate/DomainService/Policy/Specification/Command/Query/DomainEvent/Receipt/Port/Adapter/Repository`へ分類し、identity、immutability、aggregate boundary、invariant、authority、lifecycle、consumer、canonical termを保持する。各objectとimplementation symbol、test oracle IDを別edgeで決定論的に結び、内部rename後もoracle identityを維持する。 | domain object catalog、naming decision、symbol edge、oracle edge、boundary/invariant finding

### 41. HIL-FR-41

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:aaddd9f6348808fe30657b87bdd014b99df774b3786d9502a7229e8b490008f7`
- 原要求:

> Design Template Registryは要求種別、service/capability種別、domain object roleごとに適用するversioned template schema、必須設計論点、関係edge、適用条件を保持する。 | template version、applicability rule、schema digest、supersession receipt

### 42. HIL-FR-42

- 対象候補: HELIX-HARNESS／HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:d6ac9d8a9b359a2a9860550bfcfdddac56f9414d9fc7483ac0566b76b4f36eda`
- 原要求:

> Design Obligation Graphは`source/directive→requirement atom→capability/service→domain object→API/data/state/event/failure/security/observability/lifecycle/operation/test oracle/gate`を双方向に結び、必須義務を生成する。未消込、孤児、placeholder、根拠のないN/A、aggregate一括消込が1件でもあればpair-freezeを拒否する。 | obligation graph、discharge receipt、coverage receipt、未消込finding

### 43. HIL-FR-43

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:e11d5d07d31444affd0213102ae60682f8777fde8f5e518e310b6b3cee842377`
- 原要求:

> Requirement Translatorは入力を1 acceptance outcomeまたは1 constraint単位のatomへ分解し、authority、source span、ambiguity、service候補、domain term、design obligation候補を出力する。複合要求、意味衝突、根拠欠落は自動確定せずchallenge queueへ送る。 | requirement atom、translation receipt、ambiguity/challenge finding

### 44. HIL-FR-44

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:49bee96c5bb5d35a05301d3c0c4c7c4f31eb842b5bad1d58028c4d0c72bdf4f6`
- 原要求:

> Template Improvement Loopは翻訳済み要求を現行templateへ照合し、表現不能な設計義務をTemplate Gap Issue化する。候補templateはshadow適用、既存要求への差分、false-positive/negative、migration、独立監査を経てversion昇格し、translator自身による即時強制を禁止する。 | template gap Issue、shadow coverage delta、review receipt、promotion/rollback receipt

### 45. HIL-FR-45

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:e13451d529dd90b9d37e1b42eb180f20b183ec7b20f5ece2e6b8b02acdd7acda`
- 原要求:

> Requirement Definition Ledgerはstable requirement IDとimmutable revisionを持ち、source atom、canonical statement、BR/FR/TR/NFR、modality、priority、scope/non-goal、authority/rationale、acceptance oracle、owner、risk、capability/service、template applicability、design obligationを型付きedgeで保存する。split/merge/rename/supersede/reject/N/Aはbefore/after semantic digest、全source atom disposition、downstream stale、review authorityを持つreceiptがある場合だけ適用する。 | requirement definition/revision、typed edge、change/applicability receipt、orphan/stale finding

### 46. HIL-FR-46

- 対象候補: HELIX-HARNESS／HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:0255c7c9107d749eee633f9b94612ee7da059e544021824a3fa65b299afae7b3`
- 原要求:

> Layer Ledger Registryはcanonical L1–L12ごとにledger type、粒度、必須node/edge、authority、input/output、entry/exit gate、template versionを登録する。L0 charterは層外authority anchorとして別登録する。各layer ledgerのrowはstable subject ID、revision、source span、semantic digest、status、owner、downstream/upstream edgeを持つ。 | layer ledger catalog、row revision、layer snapshot、coverage receipt

### 47. HIL-FR-47

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:b1a61c1eb5f24a741168801fed3b323578151edabb2f62d1d47e239861dc1dca`
- 原要求:

> Template Obligation Extractorは各layerのactive templateから章、field、table row、applicability rule、done-when、pair contractを原子的obligationとして機械抽出し、該当ledgerへ候補行を追加する。未対応template要素、空/TBD、抽出不能、同一obligation重複をfinding化し、LLM自由補完で埋めない。 | template atom、ledger proposal、extractor/version digest、gap finding

### 48. HIL-FR-48

- 対象候補: HELIX-HARNESS／HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:49d1f634eefe71ad7a79be172439935c1ba75c7bb889e05746c5c98fe28e9329`
- 原要求:

> Vertical Ledger Pair Gateは隣接layer間の`derived_from/downstream_to`と`backpropagates_to/supersedes`を双方向検査し、上位義務の未降下、下位発見の未逆伝播、粒度不整合、stale revision、aggregate一括pairを拒否する。 | vertical edge receipt、unresolved descent/backprop finding

### 49. HIL-FR-49

- 対象候補: HELIX-HARNESS／HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:3a7cb511eea1c36e2c2453e2416c1e80de7926d7a6bafbeea6a7da577e47516b`
- 原要求:

> Horizontal V-Pair Gateはcanonical正規pair `L1↔L12(企画/運用テスト)`、`L2↔L11(要求/受入テスト)`、`L3↔L10(要件/総合テスト)`、`L4↔L9(基本設計/結合テスト)`、`L5↔L8(詳細設計/単体テスト)`と、`L6実装↔L7 TDD closure`を原子的oracle単位で双方向joinする。L12運用feedbackはL1企画と層外L0 charterへ還流し、設計義務と検証証拠の片側欠落、異なるsnapshot、未実行oracleを拒否する。 | V-pair receipt、design/verification edge、snapshot/oracle finding

### 50. HIL-FR-50

- 対象候補: HELIX-HARNESS／HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:e0796eda6bbf620164e2082b7fcb3798f0f333ed3f992df83fb7484f56a00fd2`
- 原要求:

> Ledger Design Refactorはlayer ledgerの重複、責務混在、semantic/name collision、変更波及、孤立edgeを比較し、externalize/commonize/objectize/semantic-rename/split/merge候補を生成する。全上下・左右consumer、before/after oracle、pair保持、rollbackが揃うbehavior-preserving変更だけをDesignRefactorへ送り、要求/公開contract/永続state変更はRedesign/Retrofitへrerouteする。 | ledger diff、refactor candidate/plan、pair-preservation receipt、reroute receipt

### 51. HIL-FR-51

- 対象候補: HELIX-HARNESS／HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:45ecd93356f0be9761690994c8106e87d19e742f703f98d2966b6464f9f05459`
- 原要求:

> Authoring Admission EngineはProposalの意味差分、authority、revision、trace、pair、impact、安全境界、rollback routeを検査し、`auto_admit`、`auto_admit_with_stale_propagation`、`repair_then_retry`、`human_decision_required`、`reject`、`conflict`のいずれかを決定する。 | admission decision、検査finding、authority/impact/rollback receipt

### 52. HIL-FR-52

- 対象候補: HELIX-OS
- 整理状態: 判断要（未適用）
- 原文digest: `sha256:ef6f0368fe00cbc48d04ceec047b7d8fbfe6852cd0a570f098757631c9ccf24e`
- 原要求:

> Atomic Canonicalization TransactionはMarkdown、asset revision、event ledger、trace、impact、stale propagation、harness.db projection、receiptを単一operationで原子的に更新する。部分成功をCanonicalとして扱わず、command idempotencyとbase revision CASを強制する。 | canonicalization receipt、before/after revision、write count、rollback/conflict receipt

### 53. HIL-FR-53

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:7a0b93ba3bbb00c4a5e02f9ff62505e09c6b12c5943cbfd65defdd4c5e664d45`
- 原要求:

> Semantic Revision and Asset Identityはpath・名称から独立したimmutable asset IDを保持し、意味変更を新revisionとして保存する。rename、move、split、merge、supersedeは履歴、authority、oracle、typed edgeを失わず処理する。 | asset revision、identity/location history、split/merge disposition、semantic diff

### 54. HIL-FR-54

- 対象候補: HELIX-HARNESS／HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:1531ec84c2374a625e2d83e01b77513b0fc4cdcd963170fbc11148a9bdf5143a`
- 原要求:

> Contract Portfolio Plannerはrequirement atomとDesign Obligation Graphを、authority、lifecycle、interface/data/state/event/failure/security/observability/operation、V-pair oracleの同値classへ分ける。各classにnormative contractを原則1件割り当て、既存契約の再利用、delta追加、新規作成、根拠付きN/Aを判定し、未被覆0かつ意味重複0となる最小portfolioを提案する。 | obligation-to-contract matrix、portfolio manifest、reuse/delta/new/N/A receipt、uncovered/duplicate finding

### 55. HIL-FR-55

- 対象候補: HELIX-HARNESS／HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:a79393484c93dc7d7f6c107b0781583e9648f79111cabc74cd8058c695fcb801`
- 原要求:

> Template Example Calibratorはactive templateの各validation ruleとapplicability branchに対し、最低限canonical positive 1件と境界negative 1件を要求する。状態遷移、failure、security、migration、multi-runtime差異はrisk分析で未被覆の場合だけ例を追加し、例の個数ではなくrule/branch/risk coverageで十分性を判定する。 | example adequacy matrix、positive/negative fixture、risk追加理由、redundancy finding

### 56. HIL-FR-56

- 対象候補: HELIX-HARNESS／HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:50309a18a0fb01c0232964b13e339ff415ccc6a0d9c2472e279b393443b9e539`
- 原要求:

> Workflow Contract Routerはportfolio itemを選択済みdevelopment styleの対象layer input/output、entry/exit gate、下位task、right-arm V-pairへbindする。case-driven modelではS0 hypothesisにgapと親要求、S1 experiment planに契約snapshot・style返却先・budget、S2 pocに生成物、S3 verifyにoracle evidence、S4 decideにconfirmed/rejected/pivotとback-propagationを必須化し、S4未決定の成果をproduction currentへ昇格しない。 | workflow binding manifest、phase snapshot、style return edge、S4 decision/back-propagation receipt

### 57. HIL-FR-57

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:58171916df9edf46974d0241fc75879809fb314dd78d4ab24448b73442120065`
- 原要求:

> Judgment Pack Registryは工程別の判断目的、観点、反証質問、evidence要求、severity、escalation/停止条件、authority、適用domain/risk、model適性、versionを保持し、`judgment-core`、role judgment、task lens、専門skillを重複のないpackへ合成する。 | judgment pack、applicability/digest、source skill edge、conflict finding

### 58. HIL-FR-58

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:1f3226818758cf15d8d60ffe6f435b6c8e524203664bb3414b2bfd61b10f41fe`
- 原要求:

> Judgment Pack Improvement Loopはfinding、review reversal、retry、escaped defect、skill efficacyから不足観点を候補化し、with/without shadow比較、false-positive/negative、別runtime review、rollbackを経たversionだけをactive化する。判断結果そのものを自己教師として無監査昇格しない。 | candidate pack、shadow scorecard、independent review、promotion/rollback receipt

### 59. HIL-FR-59

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:62bab0d1ae5a31f495494d6a93047746ddb77d64e3830f194faeb9079f05289c`
- 原要求:

> Specialist Agent Contract Compilerはworkflow phase、task-kind、設計義務、domain object、risk、judgment packからobjective、成果物schema、tool guidance、task boundary、context selectors、allowed/denied tools/paths、model/effort class、budget、checkpoint、escalation、verification contractを持つruntime中立agent contractを生成する。 | generated agent contract、input/output digest、generation rationale、guard validation receipt

### 60. HIL-FR-60

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:8a788e970942b14fe2881c7db110db17b639b07b8a22475c46adf48663523c96`
- 原要求:

> Specialist Muster Gateは専門知識、独立context、並列性、blind verificationのいずれかに測定可能な利益がある場合だけ生成agentをmusterし、単一agentで十分なtaskは既存roleへ送る。生成agentをallowlist済みruntime型へ射影し、workerとverifierのprovider/model/authority分離、lease、fencing、retireを検査する。 | specialization decision、TeamDefinition、runtime projection、worker/verifier separation、lifecycle receipt

### 61. HIL-FR-61

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:a1efb53682d608e59e22ad36cb1de6e1b8555afabed752e2648c98a6b82b1f8f`
- 原要求:

> Worker Acceptance Benchは候補runtimeごとに短い機械判定smokeとblind judgeを含むfull benchを分離実行し、correctness、mutation kill、instruction/scope following、skill A/B、品質、簡潔性、security、第二diffによる拡張性を同一fixtureとversioned rubricで採点する。 | bench manifest、machine score、blind-judge score、fixture/rubric digest、admission decision

### 62. HIL-FR-62

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:9d4ccd014d684c5b92b402ce2372f4ff1679be84d48d76b07dccb8fd92e0cb20`
- 原要求:

> Task Performance ScorecardはHELIX実taskごとに`first_pass`、`retry_count`、`proposal_diff_size`、`lint_violation_count`、品質judge、実効costを記録する。実効costはAPI相当単価とretryを含め、用途別の採用、限定、quarantine、retire判断へ接続する。 | real-task scorecard、effective-cost breakdown、用途別decision、trend/failure finding

### 63. HIL-FR-63

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:868712720ee331daaafb3a3103e052e82e89ded6270aa48838349c38ea53b0e3`
- 原要求:

> Effort Routerはupper-tier modelをlow/medium effort既定、lightweight modelをhigh effort既定としてtask riskとbench/scorecardにより選択する。upper-tierの品質不足ではeffort引上げを先に固定せず、model/runtime escalationとの比較証拠を残して最小の有効構成を選ぶ。 | model/effort decision、比較receipt、retry/escalation lineage、policy exception

### 64. HIL-FR-64

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:d5f9b065edf670c29df4eab795c26f69f71c34640c8a42cba9d397528deb7043`
- 原要求:

> Worker Sandbox Contractはversioned templateで第三者CLI workerの実行環境を定義し、書込可能領域を払い出しworktree/scratchへ限定、networkを推論API endpointのみのhost+path allowlistへ制限、credential・`.helix/`・harness DBを非bind、第三者CLI設定変更をbackup付きmerge/appendのみとし、template逸脱とegress実測乖離をfail-close/quarantineする。 | sandbox template digest、egress計測、逸脱finding、quarantine receipt

### 65. HIL-FR-65

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:156f71a03fcc363a091532c75996110e6d1b1df07b0cf8ad78118ab878208231`
- 原要求:

> Delegation Environment Hygieneは入れ子CLI起動時の環境変数をallow-list方式で最小化し、promptをstdin渡し、stdin消費CLIの明示close、wall-clock timeoutを必須とする。timeoutなし委譲をlint/doctorで検出する。 | 浄化済みenv manifest、timeout設定、lint/doctor finding

### 66. HIL-FR-66

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:160da37ba993d250fc282aaaa3c5d5eb525068879da1d9c94b905c148534d38c`
- 原要求:

> Proposal Revalidation Gateは全第三者worker出力（ファイル成果物含む）をNodeがschema/digest/authority policyで再検証し、出力中のcommand/SQL/absolute path/codeを実行しない。検証levelはstrict既定の段階制とし、委譲完了時のFS差分検査で許可path外書込と指示外install/network取得/テスト実行痕跡をrejectする。 | revalidation receipt、FS diff finding、reject decision

### 67. HIL-FR-67

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:bfb0523cab8c446cf40744ba0d7af04d1e9400c9428e3274f63fa781265a243c`
- 原要求:

> Payload Minimizationはworkerへの払い出しをtask必要ファイルのみのsparse worktreeへ限定し、git履歴を含めず、払い出し前secret scan passを必須とし、払い出しmanifest（path+digest）をaudit evidenceへ記録する。 | payout manifest、secret scan receipt、履歴排除証跡

### 68. HIL-FR-68

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:c9a0c409d5b73089fea4e0868d95677f1f855ccc30e749b1960c3377a8e89845`
- 原要求:

> Delegation Wire Protocolは`helix <runtime>`委譲をプロセス起動+stdout回収から、承認要求・tool call・結果の構造化イベントを受けるadapter契約へ移行し、承認応答policyをNode制御面がコードで保持する。共通下層としてのACP互換採用を評価する。 | structured event log、承認応答policy digest、adapter契約version

### 69. HIL-FR-69

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:7ab8b55c8728190a18d93cc2aa6848fbb35c8233feb23e671163dd83f926bd9e`
- 原要求:

> Delegation Audit Evidenceは第三者runtime委譲1件ごとにruntime/model/effort、送信データ分類、sandbox template version、bypass有効化区間、FS差分検査結果、quota状態をharness.dbへdigest付きで記録し、Task Performance Scorecardと同一evidence面で共有する。 | delegation audit row、digest chain、scorecard連結

## 集計

- 全69件: HELIX-OS候補43、HELIX-HARNESS／HELIX-OS分割候補23、対象未解決3。
- 意味変更・照合の人間判断候補8件。適用済み0件。
- successor割当済み0件。全69件`preserved_pending_rehome`。

このqueueからIssue close、PR merge、CI、旧実装状態を理由に要求を削除・縮退しない。
