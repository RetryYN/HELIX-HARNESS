# W3 非機能要求の無損失再配置queue

status: queued_after_repository_foundation
parent: [IR再配置wave台帳](legacy-ir-rehome-wave-register.md)
authority: [旧要求carry-forward台帳](legacy-requirement-carry-forward.jsonl)

## 使い方

HIL-NFR-01..40を原要求identity一件ごとの`requirement` PRで扱う。順序はsource順であり、優先順位、承認、意味変更を示さない。各項目の原要求identity、原文digest、原文を固定し、後続PRで対象product、successor、保持atom、未被覆atomを記録する。

対象候補は既存crosswalkの整理結果である。`HELIX-HARNESS／HELIX-OS`は二つの責務へ分割する候補であり、どちらか一方へ押し込まない。`判断要（未適用）`は変更済みではない。削除・縮退・統合・降格を意味せず、具体的な変更前後と影響を人へ提示するまで原文を保持する。

## 原要求queue

### 1. HIL-NFR-01

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:852893034ac1b3204a050db9be3cc506104f2a155ea9570f0ab09f26466fa041`
- 原要求:

> 同一GitHub delivery、Issue contract、job、PR headに対する副作用は冪等で、重複Issue/実装/memory昇格を作らない。

### 2. HIL-NFR-02

- 対象候補: HELIX-HARNESS／HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:61b1fa8add6eaec89b03d47e5ba4f2256cbe4ab316b4a325a2934bb123830fd7`
- 原要求:

> worker≠verifier≠knowledge promoterを維持し、Codexは最終audit/close/memory昇格を自己承認しない。

### 3. HIL-NFR-03

- 対象候補: HELIX-OS
- 整理状態: 判断要（未適用）
- 原文digest: `sha256:294163bef1e714afa828760f2d6ca8a77417abfa9b5a80eea30b0256c82b5057`
- 原要求:

> 全IssueのReverse処理量を省略しない。`none/not-required/exempt`とphase skipを禁止し、budget到達は未完obligationを免除せずcheckpoint＋未完了状態へ遷移する。

### 4. HIL-NFR-04

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:f90b7d3778b29257015bd30678a8f59c20fc0616c10454ca4febc804d943650f`
- 原要求:

> 各loopはiteration/time/token/cost上限、停止理由、再開checkpointを持ち、無限再Issue化を防ぐ。

### 5. HIL-NFR-05

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:bfbdefa59ad1ea92f81aaaa1a9a5e626055e7da54ab952d8fbd82fe5d4c71402`
- 原要求:

> Issue/PR/comment/ZIP/外部データはuntrusted inputとして扱い、実行命令、metadata、evidenceを分離する。

### 6. HIL-NFR-06

- 対象候補: HELIX-HARNESS／HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:fb3dadec4964b55ee41b0849950ab28bdcb8808e80d065d38c06bc9ca91bf279`
- 原要求:

> 認証・認可・決済・PII・secret・license・schema migration・破壊的データ・本番/外部infraはaction-binding approvalを必要とする。

### 7. HIL-NFR-07

- 対象候補: HELIX-HARNESS／HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:e3df2d68697433af977cfca1e4f63d83f2f9f9b7fa305e66734cd046fbad2058`
- 原要求:

> Scope Gateは機能追加数だけでなくcomplexity、public surface、運用負債を測り、authoritative oracleへの寄与とminimum-necessary proofがない拡張を拒否する。

### 8. HIL-NFR-08

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:8724cbf48e2e8c314888e5bb12ca828a87ff3abea6e434155031ca65c74d4110`
- 原要求:

> PR監査、Issue Gate、agent registry、memory compaction、ZIP detectorはfailure codeとprovenanceを持ち、proseだけの合格を禁止する。

### 9. HIL-NFR-09

- 対象候補: 対象未解決
- 整理状態: 配置のみ
- 原文digest: `sha256:bd7c0c8c513f62da48ab6a012a04c35431b32ae1623e880ad1a2c26c33b2350d`
- 原要求:

> Linux primaryで全core gateを実行し、macOS/Windows差異はadapter contract testで検出する。OS別logic forkを作らない。

### 10. HIL-NFR-10

- 対象候補: HELIX-OS
- 整理状態: 判断要（未適用）
- 原文digest: `sha256:da761c1a808418620dacdb8aa7a586ef28a33082df7ebed30b683218493bb093`
- 原要求:

> agent adapterを削除してもHARNESS registryから再生成でき、runtime固有agent memory/rule siloを正本にしない。

### 11. HIL-NFR-11

- 対象候補: HELIX-HARNESS／HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:5b24a2a3490b9e51b6ee169dbf9a2a97751f1848771fdb389f0d0b35482782a3`
- 原要求:

> 画面工程は暗黙skip不可とする。画面対象では静的wireframe/proseだけを操作可能prototypeの代替にせず、画面非対象ではLLMの自由文判断だけをskip evidenceにしない。

### 12. HIL-NFR-12

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:a85de817bf5698825a759488e16ad07868c18cfe03a62d7b6fe478e3e422391e`
- 原要求:

> source coverageは100%列挙を要求し、文書名の列挙、代表fixture、検索結果0件、単一包括要件を完全性証拠にしない。各判断はsource path/entry、digest、抽出時点へ再現可能に結ぶ。

### 13. HIL-NFR-13

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:2065b12446c1fae813cc2cb5d9e247b112edffd8ce515189b99a4a6161284df6`
- 原要求:

> 同一source snapshot、engine/detector version、config digestから得るartifact/findingは決定的で、差異はnondeterminism findingにする。

### 14. HIL-NFR-14

- 対象候補: 対象未解決
- 整理状態: 配置のみ
- 原文digest: `sha256:52fdf014fd081e0e7134b695d7bb4408868e1785f17f08c02d9479acd0e41ad0`
- 原要求:

> IPCは不正JSON、schema不一致、oversize、sequence欠落、worker crash、timeout、cancel、backpressure、親process消失をfail-closeし、partial resultを正本へ昇格しない。

### 15. HIL-NFR-15

- 対象候補: HELIX-HARNESS／HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:253e02566e21dcf8dd677f89aadee788839b6c7e4da49f4b86505eaf14b13819`
- 原要求:

> 3段CI receiptは各段自身のcommit/tree digestと直前段receiptへbindし、lineageのない別SHA greenを再利用しない。quarantine resultをgreen件数へ算入しない。

### 16. HIL-NFR-16

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:04c0a3f064456d079d0984c4dd1cb64238bade3e329b37611cea2a417630070b`
- 原要求:

> quarantineはexact fingerprintだけに適用し、無期限、wildcard、directory単位、全check一括を禁止する。期限切れ、対象変更、fingerprint変化で失効する。

### 17. HIL-NFR-17

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:476a1cc64e906c7341e251fc5396cefeab2bb0ce3bbcdb3e34d67c6c8600b8f7`
- 原要求:

> product dataはclassification、最小取得、redaction、retention、freshness SLAを持ち、PII/secret/raw payloadを通常projectionやagent contextへ複製しない。

### 18. HIL-NFR-18

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:09206374c8d11af21ebad0450f00c8205fe27d24ba055350a008a119cc49bd06`
- 原要求:

> agent lease失効後のtool call/artifact/completionはfencing token不一致で拒否し、crash後は最後のdurable checkpointからだけ再開する。

### 19. HIL-NFR-19

- 対象候補: 対象未解決
- 整理状態: 配置のみ
- 原文digest: `sha256:07cc796cd8d1ebc6ed1164f6c96551a811b4bca04caa94e51a451155df9fddc7`
- 原要求:

> Linuxをcore completion platformとし、macOS portable suiteとWindows compatibility smokeの未実施は明示する。Windows wrapper成功をLinux互換証拠にしない。

### 20. HIL-NFR-20

- 対象候補: HELIX-HARNESS／HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:a478ca26c7c97f063cf0a6d52358b9a0e35603ca1d8dac40c205b515fc18885a`
- 原要求:

> Reverse artifactは非空、stage間非同一、source span再現可能、obligation coverage 100%を満たす。文字数だけの下限を内容証拠にせず、stage固有fieldとsemantic assertionで検査する。

### 21. HIL-NFR-21

- 対象候補: HELIX-OS
- 整理状態: 判断要（未適用）
- 原文digest: `sha256:91fa0cf1803312552c129591509e87b6b6cb98a2c5abe24b33a48001ee2d027c`
- 原要求:

> user directive/findingの原記録はappend-onlyで、AI dispositionは原記録を削除・不可視化・終端化しない。PO以外のcancel/supersedeと、独立reviewなしのfalse-positive/accepted-riskを拒否する。

### 22. HIL-NFR-22

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:e0dcb185c615c632c93ff9df21f645e9293ed76f21317a5d1abe9a91123e84b9`
- 原要求:

> source coverage分母はatomic behavior集合とし、aggregate parent、directory/file count、代表fixtureをcovered件数へ算入しない。extractor変更またはsource差分で全child receiptをstale化する。

### 23. HIL-NFR-23

- 対象候補: HELIX-HARNESS／HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:27ea355917c7115610a257a83f695b750701e0a54201bc7aa790864490243861`
- 原要求:

> scope derivation graphはacyclicでauthoritative rootへ到達し、capability自身または同時追加HILだけを根拠にするcycleを拒否する。

### 24. HIL-NFR-24

- 対象候補: HELIX-HARNESS／HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:72284f7840fb26841527f2520d29ff0b64b473e136211bc0fc6099ed5d89ac24`
- 原要求:

> Design Refactorは「将来使えそう」「綺麗になる」という推測や名称の文字列類似だけでrename、共通層、base class、汎用object、設定surfaceを増やさない。実在するsemantic similarity/name collision、重複・変更波及・責務混在の証拠、全consumer、最小変換、behavior invariant、退行時rollbackを要求し、誤った名称統一、抽象化、scope creepを拒否する。

### 25. HIL-NFR-25

- 対象候補: 対象未解決
- 整理状態: 判断要（未適用）
- 原文digest: `sha256:a8e7e11e262e12aa53009f37e6c288213c1175b2853491cb0f998ac122c09b8d`
- 原要求:

> Domain Objectはclass化自体を目的にせず、identity/invariant/lifecycle/authorityがないpayloadをEntity/Aggregateへ昇格しない。Value Objectはimmutable、Aggregate更新はroot境界内transaction、Queryはside-effectなし、Domain Eventは完了事実の過去形、domainはPortを介してAdapterへ依存する。`Manager/Helper/Util/Data`等の責務不明名を根拠なしで許さず、testはprivate実装名でなくdomain object＋operation＋oracle IDへbindする。

### 26. HIL-NFR-26

- 対象候補: HELIX-HARNESS／HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:239e05f4a6d7453b7b5c6c966ded8acbf1ee6565a38518cc43f8869800cd839f`
- 原要求:

> 文書、template、見出し、入力欄の存在だけを設計完全性とみなさない。各義務は意味のある設計内容、双方向edge、test oracleまたはscope付きN/A receiptで個別消込し、`TBD`、空欄、範囲表記、1行での複数義務消込を拒否する。

### 27. HIL-NFR-27

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:9a56f576e707cda0a58668fd22baf775afde65ff1954474352c53dc53d17705c`
- 原要求:

> Requirement TranslatorとTemplate Improvement Loopは原文を保存し、翻訳の確信度と未解決ambiguityを露出する。subagentが要求を削除・統合・終端化したり、未監査templateをactive化したりしてはならない。

### 28. HIL-NFR-28

- 対象候補: HELIX-HARNESS／HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:dcd5e597e7ffda1290911e74f7eb29498f59a07062c94c76e44bfe8e87f31357`
- 原要求:

> requirement coverageの行数、ID連番、文書存在だけを要件定義の設計完全性としない。各active requirementはsource atom、authority、acceptance oracle、service/capabilityまたは根拠付き非該当、template applicability、design obligationへ個別に結び、未解決ambiguity、orphan、stale revisionをgreenにしない。

### 29. HIL-NFR-29

- 対象候補: HELIX-HARNESS／HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:0b2d77afcc8e27b10ff01daee83df176d72032108580db49f0ee06a6d8a48157`
- 原要求:

> Layer Ledger Chainはtemplate/file/章/aggregate親の存在をpair coverageに算入せず、原子的obligationとoracleを分母にする。上下・左右edgeは両方向、同一revision/snapshot、意味粒度一致を要求し、deferred、stale、未実行、片肺pairをgreenにしない。

### 30. HIL-NFR-30

- 対象候補: HELIX-HARNESS／HELIX-OS
- 整理状態: 判断要（未適用）
- 原文digest: `sha256:71d55577d7a320844846b00f7c6c2a05f631ba15c8c9fea2bd5267a0839c9354`
- 原要求:

> 可逆かつ既定policy内のAuthoring変更では人間入力を要求せず、機械検証からCanonical化まで自動完走できる。確認待ちを安全策として乱発せず、真のauthority境界だけをescalateする。

### 31. HIL-NFR-31

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:06dec99b881c94d8f5edb6aee5784f7604a03797238dc9ae070f2d74e8550182`
- 原要求:

> Authoring正本、ledger、trace、projection、receiptはall-or-nothingで更新し、fault injection後にも部分current状態を0件とする。

### 32. HIL-NFR-32

- 対象候補: HELIX-HARNESS／HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:1beba8953dbc66f4ebfc308995105ad2cf1a0545fa7dc700b526c89b7f1a6a5b`
- 原要求:

> 意味変更はauthority、impact、pair、oracle、rollback、downstream stale propagationが揃わない限りCanonical化しない。

### 33. HIL-NFR-33

- 対象候補: HELIX-HARNESS／HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:fd35b9d635312dc6f0e848c4bcbd28c70b5e8cd7da6aa1af4810053e9481fe35`
- 原要求:

> contract/templateの十分性はファイル数、ページ数、見本数、見出し数で判定しない。全applicable obligation、validation rule、branch、risk、V-pair oracleが一意にcoveredであることを要求し、過剰な重複contract/exampleもcontext costとdrift riskとしてfinding化する。

### 34. HIL-NFR-34

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:8c66fd80f98504563e3383bbca96dedd7f9ec43c2b82e969c841ea645b8c6f47`
- 原要求:

> 自動生成したjudgment packと専門agentは提案時点で権威を持たず、生成元snapshotとdigestへbindする。scope/requirement/template/skill/model catalog/allowlistの変更でstale化し、未監査pack、未許可tool、自己検証、無上限subagent生成、工程外のcompletion authorityをfail-closeする。

### 35. HIL-NFR-35

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:75bc063dbce9013c692f5a213d4974fccff2809c64b5f28137f8181723621364`
- 原要求:

> worker評価は候補runtime名をblind化し、fixture、rubric、judge version、sample、再試行を固定して再現可能にする。smoke合格だけでfull admissionせず、security failure、scope逸脱、検証不能な出力を平均点で相殺しない。

### 36. HIL-NFR-36

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:2224ab3bcd6e7974df0e119d9298a784abf86594399cfbe09c6d40b75620f8d3`
- 原要求:

> model/effort選択はtask、risk、runtime、model、effort、retry、品質、costへ追跡可能にし、既定値からの逸脱と品質問題へのescalation順序をreceipt化する。単価だけ又は単発成功だけで最適構成を主張しない。

### 37. HIL-NFR-37

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:c193885771e85f07857776dbce87ceac9cb91725d64aa68eddd53ff2aa4902db`
- 原要求:

> 委譲データを公開可能/機密/secret・PIIへ分類し、機密以上の第三者runtime委譲を機械ゲート（path allowlist+secret scan）で遮断する。訓練利用opt-outの完了を当該runtime採用の前提条件とし、未完了の間は公開可能コード以外を委譲しない。

### 38. HIL-NFR-38

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:623495c53d8e952d930ee57bc420714a8ed8e9749859fa4597543ff156e8fd9f`
- 原要求:

> YOLO/bypass/auto-approve系設定は実行時のみ有効化し終了時に必ず除去する。repository設定でbypassを恒久禁止できるdenyスイッチを持ち、headless委譲の権限モデルはdeny既定+明示allowlistを理想形とし、YOLO許容はallowlist型を持たないruntimeへの経過措置に限定する。

### 39. HIL-NFR-39

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:cf1a0879fbc1f7ca13a8fda0f6910ea0be3beedec24ec49e122f4e16d2212cfa`
- 原要求:

> ベンダー側のプライバシー設定UI、修正宣言、リモートフラグを要件充足の根拠として認めない。セキュリティ要件の充足はHELIXがローカルで検証・強制できる機構（OS sandbox、network allowlist、egress実測、FS差分検査）だけで判定する。

### 40. HIL-NFR-40

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:4171419553664d7150ffe9875c14b6bc5212f14635d339dafc2af08ddc656c54`
- 原要求:

> worker runtimeのquota枯渇・rate制限を予定された状態として扱い、laneはfail-closeで退避（キュー保留または代替runtimeへのrouting提案）する。枯渇を無視した継続や無計画retryを行わない。

## 集計

- 全40件: HELIX-OS候補22、HELIX-HARNESS／HELIX-OS分割候補14、対象未解決4。
- 意味変更・照合の人間判断候補5件。適用済み0件。
- successor割当済み0件。全40件`preserved_pending_rehome`。

このqueueからIssue close、PR merge、CI、旧実装状態を理由に要求を削除・縮退しない。
