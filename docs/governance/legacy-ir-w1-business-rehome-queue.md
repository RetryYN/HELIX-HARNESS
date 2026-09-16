# W1 業務価値要求の無損失再配置queue

status: queued_after_repository_foundation
parent: [IR再配置wave台帳](legacy-ir-rehome-wave-register.md)
authority: [旧要求carry-forward台帳](legacy-requirement-carry-forward.jsonl)

## 使い方

HIL-BR-01..33を原要求identity一件ごとの`requirement` PRで扱う。順序はsource順であり、優先順位、承認、意味変更を示さない。各項目の原要求identity、原文digest、原文を固定し、後続PRで対象product、successor、保持atom、未被覆atomを記録する。

対象候補は既存crosswalkの整理結果である。`HELIX-HARNESS／HELIX-OS`は二つの責務へ分割する候補であり、どちらか一方へ押し込まない。`判断要（未適用）`は変更済みではない。削除・縮退・統合・降格を意味せず、具体的な変更前後と影響を人へ提示するまで原文を保持する。

## 原要求queue

### 1. HIL-BR-01

- 対象候補: HELIX-HARNESS／HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:045567570721936eef9e431fb9bb2e61051f2b7332cca31cf1e750ac7971db85`
- 原要求:

> Codex自動走行とClaude Code監査を、PRとharness.db eventで交互に接続し、人のL3承認後は不可逆境界以外を無人完走する。

### 2. HIL-BR-02

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:7fa42e4ad34404d9b69757fe10fb50b5bfb9766c10dcd297b3eb9ac1a0b608ad`
- 原要求:

> Claude Code拡張hookはCodexのPR作成/更新/完了を検出し、監査jobを冪等生成する。全base branchのPRを対象とし、stacked PRを除外しない。

### 3. HIL-BR-03

- 対象候補: HELIX-OS
- 整理状態: 判断要（未適用）
- 原文digest: `sha256:b417efbef831936abb9089f4fbbcfa5c3b168a0a6238ccb4bcff5809905280ea`
- 原要求:

> Claude CodeはCodex完了時にraw実行ログ、PR、test/CI、監査所見を圧縮し、永続知識だけをharness memoryへ昇格する。進捗はDB continuationへ残しmemoryへ混載しない。

### 4. HIL-BR-04

- 対象候補: HELIX-HARNESS／HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:a92c409fb5da2522fa77bf9e59a20a782a3ecece5c33c0277f61fa8c059d1e42`
- 原要求:

> 全Issueはdevelopment style、case-driven activation、specialist capability、runtime modeを別fieldで持つ。Reverse R0–R4が適用されるIssueでは実装前の先行taskとし、省略値を持たない。

### 5. HIL-BR-05

- 対象候補: HELIX-HARNESS／HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:28a498afba5ee8a06d7a2d5277079b4f98db214464bcceed52a076027b2a12f0`
- 原要求:

> 監査で既存設計の欠陥または不足が判明した場合は、選択済みdevelopment style内の`Redesign` specialist routeへ割り当て、再freeze後に実装する。

### 6. HIL-BR-06

- 対象候補: HELIX-HARNESS／HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:f6ab74819ca1f464427b18bdb8894155ad89739aaf7d042c4413cde07ee56523`
- 原要求:

> IssueはAdmission、Reverse Evidence、Redesign、Scope、Implementation Entry、Closureの各gateを通過しない限りready/implement/merge/closeへ遷移しない。

### 7. HIL-BR-07

- 対象候補: HELIX-OS
- 整理状態: 判断要（未適用）
- 原文digest: `sha256:c814f4130d22699aef92e457ec388caf41178991e9f393c5eb9cebdb592c501d`
- 原要求:

> user directiveとIssueは分類前にdurable intake receiptを持ち、AIが不要判断だけでreject/drop/close/cancelできない。AIの非actionable dispositionは非終端で、cancel/supersedeはPOだけが行える。closure receiptが無いcloseは拒否または再openする。

### 8. HIL-BR-08

- 対象候補: HELIX-HARNESS／HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:ad9e7abcc56fed1c2a450795c10ae69bc932bb4c7257b3dbf7195b641f6d99b4`
- 原要求:

> acceptance oracleに不要な機能拡張、公開API、CLI、schema、dependency、設定、汎用化をScope Gateで拒否する。必要性が新たに判明した場合は子Issue＋Reverseへ分離する。

### 9. HIL-BR-09

- 対象候補: HELIX-OS
- 整理状態: 判断要（未適用）
- 原文digest: `sha256:060850964c4d0ccf5e287a4f39a5cbc6695a7673a0b68205e2c464d41332a456`
- 原要求:

> 工程表のlayer×drive×task-kind×verification patternからHARNESS所有agent contractとW-agent teamを生成し、Claude/Codex固有定義へ決定論的に射影する。

### 10. HIL-BR-10

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:fe4cf7eb921fc0cf7017f690b8e9d2a52f5c1c342e9390805892bd3499a6d3cc`
- 原要求:

> Issue・Reverse・Redesign・development-style PLAN・commit・PR・CI・audit・memoryを同一causality chainとしてharness.dbへ収束する。join切れは未完了とする。

### 11. HIL-BR-11

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:edc9d4682e47c47a8f3fbfbd644ad25160be2f76df1e1c9a0d5a6d6f003398ff`
- 原要求:

> Issue/実行/監査履歴からrecipe候補を作り、再現性検証後だけskill、detector、gateへ段階昇格する。自動生成物の即時強制適用を禁止する。

### 12. HIL-BR-12

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:8db32d18ea7e86ae89ded3b6b16e871cd2a40e9e2dc9a01c06532955857f39e4`
- 原要求:

> GitHub由来のIssue/PR/CI eventとユーザー差し込みIssue/PLANを同じintake契約へ正規化し、development style、case-driven activation、specialist capability、style再接続点を決定する。

### 13. HIL-BR-13

- 対象候補: HELIX-HARNESS／HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:6f646299f2f5dbee367cbd24fbe602871e140475f0e299224a2e1b97b8394e07`
- 原要求:

> 全PLANは画面工程を`prototype_required`または`not_applicable`へ明示分類する。画面対象はprototype→walkthrough→要求back-propagation→agreement後に要件をfreezeし、画面非対象は証拠付きskip receiptでのみ通過する。

### 14. HIL-BR-14

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:917252a5fad425980897510684f7ca3053711fe8c0541da3cb2eb2c84873fe5c`
- 原要求:

> ZIP、前身repository exact 2件（`unison-ai-product/UT-TDD_AGENT-HARNESS`、`RetryYN/ai-dev-kit-vscode`）のcurrent advertised `heads/tags/pull` ref authority、現行HELIXのsourceをatomic behavior単位へ完全分解し、各項目を採否判断から要件・設計・テスト・Gateまで追跡する。file集合やaggregate親の列挙、source宣言、読了だけを採用済みとみなさない。ref件数、unique tree entry分母、全ref-entry edge分母はauthority receiptから導出し、観測時の件数を要件へ固定しない。

### 15. HIL-BR-15

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:5f5450b0a801f1f4c6650a0b4ddb87d5eee23400f2126332ed0038ed06f01115`
- 原要求:

> 将来のproduct-data sourceをversioned connectorで取り込み、由来・鮮度・schema・authorityを保持した正規projectionとして設計判断、coverage、impact、Issue routing、docgen/detectorへ供給する。

### 16. HIL-BR-16

- 対象候補: HELIX-HARNESS／HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:8e9887486ff78af21e31dbed2c1c713928bc397fdfa50aa1703549511f9356df`
- 原要求:

> 検証をslice統合前のimpact CI、candidate固定後のfull CI、GitHub PR上の外部CIの3段に固定し、各段のSHA/treeと直前段からのlineageがgreenでなければ次段へ進めない。style内統合によるSHA変更はpredecessor bindingで追跡する。

### 17. HIL-BR-17

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:e55bdf0ac2daabc541038f11887fd2099993870993dc131097955ca9f817c1a1`
- 原要求:

> Claude監査findingをcurrent contract影響と責務境界で機械的にdispositionする。同じ責務・既存scope内で安全かつ局所的に閉じるfindingは`current_pr_fix`としてwriterへ返し、独立責務・別設計・lifecycle・性能改善だけを`successor_issue`としてIssue、Universal Reverse、memory要約、Codex ready queueへ同一causality chainで接続する。AIの自由判断だけによるfinding破棄と、後続Issueのcurrent PRへの再流入を認めない。

### 18. HIL-BR-18

- 対象候補: HELIX-OS
- 整理状態: 判断要（未適用）
- 原文digest: `sha256:e13f07c964cce52474bd87f8b2dc688e0c80e5c142260b32e2086886be523db8`
- 原要求:

> HARNESSはagent定義だけでなく、生成、lease、実行、checkpoint、検証、解放、quarantine、retireまでのinstance lifecycleを正本として保持する。

### 19. HIL-BR-19

- 対象候補: 対象未解決
- 整理状態: 配置のみ
- 原文digest: `sha256:95d7e1242d77cdba8ed1447e36382caf4e23413b6d5a3d40241feffa5a6521d1`
- 原要求:

> Bun撤去はNodeでも一部動く状態ではなく、activeな開発・実行・検証・配布surfaceがBunなしで再現可能となった時点だけを完了とする。

### 20. HIL-BR-20

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:0ca36b9296e24ed2386ed4170647831649a51d83dbac8b2efb37d6c5048f131c`
- 原要求:

> 既知の内部CI failureは証拠を保持した機械的quarantineで一時隔離できるが、対象外failure、新規fingerprint、最低代替gate失敗を無視してはならない。旧UTの検証契約を棚卸し後に再構築する。

### 21. HIL-BR-21

- 対象候補: HELIX-HARNESS／HELIX-OS
- 整理状態: 判断要（未適用）
- 原文digest: `sha256:a9dbe1d0cf46034f9770e95ec5f6681c9d4ffd1ae41ceb82e7c37692bb871938`
- 原要求:

> 設計上の重複、責務混在、変更波及、埋込みpolicyを、外部仕様と受入挙動を維持したまま外部化・共通化・オブジェクト化する第一級`DesignRefactor`駆動モデルを持つ。要求・公開contract・永続state semanticsを変える場合は`Redesign`または`Retrofit`へrerouteする。

### 22. HIL-BR-22

- 対象候補: HELIX-HARNESS／HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:24ce50660d20b2428339510ae9aa295ec5c905eaa95489c78e6b7af922eb180e`
- 原要求:

> 要求系統とservice/capability系統をDesign Templateへ結び、各要求から生じる設計義務を原子的に生成・消込する。閉じた要求集合について説明のない設計漏れを0件にし、未知の要求まで網羅したとは主張しない。

### 23. HIL-BR-23

- 対象候補: HELIX-OS
- 整理状態: 判断要（未適用）
- 原文digest: `sha256:271ec5381b718cce0fd8f0e3beacb9d0359059f88e8ea705fc7319edaa164c2d`
- 原要求:

> HARNESS所有のRequirement Translator subagentはchat、product data、source capabilityを要求atomへ翻訳し、既存templateで表現不能な論点を黙って捨てずTemplate Gap Issueとして改善loopへ戻す。

### 24. HIL-BR-24

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:9727fd0b427f18eb8b6839f2f2f97d1d13ed88059b0c05738b887ed127c9809d`
- 原要求:

> 要件定義そのものを設計対象として台帳化し、原文、原子要求、authority、分類、scope、priority、acceptance oracle、capability/service、template適用、design obligation、revisionを一つの履歴へ結ぶ。trace行の存在だけを要件定義完了とみなさない。

### 25. HIL-BR-25

- 対象候補: HELIX-HARNESS／HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:88a5d24aeea43da624d2906a94ab075ede9611451fcf3264abefa592655c454e`
- 原要求:

> canonical L1からL12の各layerに粒度固有の設計・実行・検証台帳を置く`Layer Ledger Chain`を持つ。L0 charterは層外authority anchorとしてL1企画へ投影する。各台帳は上位/下位layerと双方向に導出・逆伝播し、正規V-modelの左右pairとも双方向に対応する。上下または左右の片edgeだけで工程完了を主張しない。

### 26. HIL-BR-26

- 対象候補: HELIX-HARNESS／HELIX-OS
- 整理状態: 判断要（未適用）
- 原文digest: `sha256:93323e6ed35f5fe3a312d0d4965462586f1bb503c60f1f51013f18e8d48535be`
- 原要求:

> AIは要件・設計・PLAN・関連Markdownを自律的に起草、追加、修正、分割、統合、改名できる。Authoringの自由とCanonical化を分離し、正本化だけを`Authoring Admission Transaction`で制御する。可逆かつ既定policy内の変更は自動確定し、上位目的、安全境界、不可逆な外部契約を変更する場合だけ人間へescalateする。

### 27. HIL-BR-27

- 対象候補: HELIX-HARNESS／HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:514f5b65beee9eeb812dab45ef7665e514c11bbb549b102738338f097ca006e3`
- 原要求:

> 要求定義から下流を自動走行するための設計契約とtemplate見本は固定冊数で配布せず、要求atom、設計義務、risk、状態遷移、failure境界、適用工程から必要十分な`Design Contract Portfolio`を導出する。同じ意味契約の文書量産と、見本不足をLLM自由補完で埋めることの双方を拒否する。

### 28. HIL-BR-28

- 対象候補: HELIX-HARNESS／HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:d4e7f2d1a599e2d6e59fc913bfbe0d8006d6f60b251f02dd3b5c65c97025c653`
- 原要求:

> `Design Contract Portfolio`を選択済みdevelopment styleのlayer entry/exitへ接続し、短いsprintでも上位要求・style返却先・V-pair oracleを失わない。Discovery／PoCはScrum非内包のcase-driven S0–S4として別接続し、S4判断後だけ選択済みstyleへ収束する。

### 29. HIL-BR-29

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:05eba9d85097424f46afa0356b747e930077ff8b31b8264784eb54af709dc148`
- 原要求:

> 判断系skillを汎用checklistの固定配布に限定せず、工程、domain、risk、failure mode、判断authorityに適合するversioned judgment packとして拡張する。候補skillはshadow評価と独立reviewを経るまで判断gateの強制規則へ昇格しない。

### 30. HIL-BR-30

- 対象候補: HELIX-OS
- 整理状態: 判断要（未適用）
- 原文digest: `sha256:7805010c12510bd817953e2d115e50791e617dcbd627ed9d599762c277c72711`
- 原要求:

> HARNESSは工程表、Design Contract Portfolio、判断pack、task分類から専門agent contractを必要時に自動生成し、runtime固有subagent定義へ射影する。専門化の根拠がないagent増殖を避け、worker/verifier/authority分離、最小context、tool/path権限、budget、停止条件を生成時に拘束する。

### 31. HIL-BR-31

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:5de1a74038ae72cb30e6f61fa68bc6d3085dc88a57d6d1c778dc42c78aff7d20`
- 原要求:

> 第三者workerを価格や公称性能だけで採用せず、機械判定可能なacceptance bench、blind judgeを含むfull bench、HELIX実task scorecardで品質・安全・実効costを比較し、採用、用途限定、quarantine、retireを証拠付きで決定する。

### 32. HIL-BR-32

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:78f34c71dbf6c0d4ad87aaea5e2275eb3cc3401fd8fcf6c567000754603563ac`
- 原要求:

> Claude/Codex以外の定額worker runtime（Kimi/Grok等）をprecedenceを曲げずproposal-only workerとして接続し、実行を隔離worktree/sandbox内に限定してrepository本体、`.helix/` state、harness DB、credentialへ到達させない。秘密・機密を含む作業の第三者runtime委譲を禁止する。

### 33. HIL-BR-33

- 対象候補: HELIX-HARNESS／HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:758e2ea4f82c6c068d8c8ac633a7f092573c01c078a8293e81ded4bc70eaa5ef`
- 原要求:

> 配布はmarketplace型パッケージ仕様（正本index、手編集禁止の生成index、first-party/third-party分離、免責記載）で定義し、配布surfaceの実切替は既存cutover承認境界に従う。

## 集計

- 全33件: HELIX-OS候補18、HELIX-HARNESS／HELIX-OS分割候補14、対象未解決1。
- 意味変更・照合の人間判断候補8件。適用済み0件。
- successor割当済み0件。全33件`preserved_pending_rehome`。

このqueueからIssue close、PR merge、CI、旧実装状態を理由に要求を削除・縮退しない。

意味変更・照合候補8件について、原要求から保持する意味と責務上の整理箇所を[W1人間判断候補の意味分解](legacy-ir-w1-human-decision-candidates.md)へ分けた。同文書は判断を要求または適用するものではない。
