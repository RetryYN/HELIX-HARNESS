# HELIX-HARNESS L3 非機能要件候補（部分草稿）

status: draft_for_l3_review
approval: not_approved
scope: HARNESS-L2-010, 011, 022, 023 and Stage 2b HARNESS-L2-012..020, 024, Stage 2c HARNESS-L2-030..032; Stage 3 HARNESS-L2-034,036,038,039,040,041,042,043,044,046,047,049,054; Stage 4 HARNESS-L2-026..029 / version_class 1.0
paired_l10: ../L10-verification/nfr-verification.md

これは現在の部分scopeの採択済みL2親から再導出した測定可能な技術候補である。候補はL2の意味・範囲・owner・版を変更せず、候補値を個別にPOへ照会しない。候補のL3採否と実装は未確定であり、対応する総合検証方法は[L10 NFR検証](../L10-verification/nfr-verification.md)に記す。

## 候補値

| 候補ID／親 | 候補値・条件 | 根拠と比較案 | 適用限界 |
|---|---|---|---|
| `NFR-C-HARNESS-010-01` / `HARNESS-L2-010` | 同一の宣言inputとpack版に対する宣言成果物の予期しない差分は **0件**。比較基準はartifact bytes digest一致。 | 固定L2の「同じ入力と版から同じ成果物」をそのまま観測可能にした候補。案Bのsemantic digestは、宣言artifact contractが特定metadataを非意味項目として明記した場合だけ、その項目を除外してよい。contractに除外がなければ案Bは不採用で、bytes比較を緩めない。旧FR-03の4 artifact／12 edgeはこの値の根拠にしない。 | contractが宣言する成果物だけを比較し、上位release／製品の昇格は判定しない。digest algorithmや生成実装方式はここで固定しない。 |
| `NFR-C-HARNESS-010-02` / `HARNESS-L2-010` | 単一pack差し替えで、対象外packのversion/evidence変更は **0件**。 | L2/L11の「一つのpack差替えで他のpackの版と証拠が保たれる」を直接数える。案B（dependency closure由来なら対象外の変更を許容）はこの不変条件に反するため不採用比較案。複数packを同時に更新する操作は別scopeであり、このAC／候補値に混ぜない。 | 対象pack自身の明示された更新は比較対象。複数pack更新の意味や許可をこの要件で追加しない。 |
| `NFR-C-HARNESS-011-01` / `HARNESS-L2-011` | 同一logical operationのresumeは **同一冪等key**を保持し、同じkeyの重複送達による追加処理効果は **0件**（効果は高々1回）。 | 固定L2/L11が要求する停止・再開、記録済state、同じ冪等keyを候補へ結ぶ。retryごとに新keyを作る案は重複防止と再開同一性を弱めるため不採用比較案。 | 冪等keyの生成方式、保持期間、全runtime共通の実装方式は指定しない。処理authorityとdata scopeは既存ownerに従う。 |
| `NFR-C-HARNESS-011-02` / `HARNESS-L2-011` | expiry経過後にsuccessと返るoperationは **0件**。dispatchおよび停止後resumeの各開始境界でexpiryを評価する。等号境界は既存contractに定義があればその値に従う。未定義の場合の比較候補は案A `now >= expiry`をexpired（有効区間 `[issued_at, expiry)`）、案B `now > expiry`をexpired（有効区間 `[issued_at, expiry]`）とする。 | expiry後をsuccessにしないL2/L11を観測する。等号で失効する案Aは期限ちょうどの曖昧な成功窓を作らない保守的候補であり、案Bは境界を含むため呼出し側とのtimestamp定義一致を要する。両案ともdispatchおよびresume開始時に評価し、直前／境界／直後fixtureで結果を比較する。 | TTLや時計skew許容値はL2にないため設定しない。expiry authorityは呼出し側／SECURITYに残し、HARNESSは延長しない。 |
| `NFR-C-HARNESS-023-01` / `HARNESS-L2-023` | 同一pack revision・同一入力条件の繰返し評価で、closureと理由の差分は **0件**。 | L2/L11が要求する同一input/revisionの有効closure再現と理由一致に対応。下記12行の有限fixture行列を全件確認する案と、条件数増加時のpairwise案を比べ、この固定行列を候補とする。分類能力自身は全依存実装を要求せず、missing/unknown状態を分類できる。 | closure件数上限や処理時間はこの親から導かない。未選択sourceの存在／成功を補完しない。 |
| `NFR-C-HARNESS-012-01` / `HARNESS-L2-012` | PrototypeとPoCの適用性判定を別欄・別resultで追跡し、片方の記録が他方を充足する件数 **0**。適用した工程の未backflow結果から要件化／production昇格する件数 **0**。 | 固定L2の独立判定・backflow・Decide前非昇格を直接数える候補。単一のcombined statusへ縮約する案と比較し、縮約案は一方のN/Aが他方へ漏れるため不採用とする。 | 適用頻度や試作完了時間のSLOは追加しない。 |
| `NFR-C-HARNESS-013-01` / `HARNESS-L2-013` | 形成結果中、親にtraceされない追加要件・承認状態への自動昇格は **0件**。各指摘に入力箇所とbackflow先を持たせる。 | 固定L2の企画外追加検出、pair形成と未承認境界を観測する候補。全内容を機械的に承認可能とする案は人の承認境界と衝突するため不採用。 | 意味の妥当性を単一accuracy閾値へ還元しない。 |
| `NFR-C-HARNESS-014-01` / `HARNESS-L2-014` | 各単体設計義務について対応するL3根拠とL9/L8/L7検証設計の欠落数 **0件**。Template適用不足・source不明の未表示数 **0件**。 | Templateに基づく設計義務とpaired verificationを親から追跡する完全性候補。単なる下位文書数の充足と比較し、件数だけでは義務を証明しないため不採用。 | template選択の性能や固定template数はこの親で定めない。 |
| `NFR-C-HARNESS-015-01` / `HARNESS-L2-015` | 同一変更revision内でL6契約からRed/Green/refactor/原子CIへのtrace欠落 **0件**。Provisionalを超える不適格昇格 **0件**。 | 固定親の開発sequenceとProvisional境界を候補化する。CI green単独を合格材料とする案は明記された非保証を破るため不採用。 | CI時間・coverage割合・suite数は親の値でなく、根拠付き候補として測定する場合も要求値へ確定しない。 |
| `NFR-C-HARNESS-016-01` / `HARNESS-L2-016` | performance比較候補: 事前baseline/workload/profile/統計条件下で対象metricの改善を測り、回帰oracle違反 **0件**。 | 固定親は測定入力を要求するが改善幅は固定しない。候補案Aは代表workloadの中央値をbaseline比で比較、案Bは分布全体と上側quantileも併記する。中央値だけでは見えない尾部回帰を比較できるためBを推奨候補とする。分布・上側quantileの併記は小標本やworkload偏りを解消しないため、実測数・標本数・環境・ばらつき・confidence intervalとともに、標本不足やworkload偏りを別途未評価または測定制約として記録してから閾値案を判断する。 | 固定thresholdや旧IPA/旧runtime数値を流用しない。計測入力を揃えないPerformance Refactorは未評価。 |
| `NFR-C-HARNESS-017-01` / `HARNESS-L2-017` | Release Port必須条件の未充足をeligibleにする件数 **0**、同一input/revisionからのartifact identity/digest不一致 **0**。 | 固定親のeligible条件、同一入力からの再現、未回収検査の停止を観測する候補。例外昇格案は条件を弱めるため不採用。 | release rateやdeployment durationを加えず、eligible候補を実配備へ読み替えない。 |
| `NFR-C-HARNESS-018-01` / `HARNESS-L2-018` | designed/implemented/verified/observed/operated間の誤状態遷移 **0件**。各観測recordに対象revision・時点・要求ownerの欠落 **0件**。 | 固定親の状態分離と観測・再要求経路の完全性を測る候補。stage存在を後続stage証明とする案は明示的に不採用。 | 可用性、信頼性、性能、容量、費用、retention等の数値は製品ownerの要求があるときだけその範囲で測定する。 |
| `NFR-C-HARNESS-019-01` / `HARNESS-L2-019` | 入力sourceの変換可能範囲・unknown・不整合の未分類数 **0件**。変換候補からの承認／release自動生成 **0件**。 | 逆方向形成のtrace保全とauthority非生成を候補化する。全部成功/全部拒否のbinary案より、変換可能部分とunknownを分ける候補が部分入力に忠実。 | 入力stageごとの時間・変換率を要求閾値化しない。 |
| `NFR-C-HARNESS-020-01` / `HARNESS-L2-020` | handoff対象の全必須fieldと契約版の対応欠落 **0件**、不整合入力の暗黙受理 **0件**、handoffによるupstream state変更 **0件**。 | 固定親のproducer/consumer契約一致と状態非書換えを直接観測する。汎用warningだけ返す案は個別不整合を隠すため不採用。 | 関係のない隣接stageへの一律依存や、handoff成功率を新しい業務目標にしない。 |
| `NFR-C-HARNESS-024-01` / `HARNESS-L2-024` | 同一engine/pack/target revision・scope・既回答から、質問順・理由・状態の差分 **0件**。候補スコア単独による必須不足の見逃し・人間合意への昇格 **0件**。 | 固定親が同じ入力から同じ質問順序・理由・状態を要求し、score・質問数・iteration数だけで収束しないことを観測する。固定質問数や数値weightを足す案は不採用。 | 意味評価を単一accuracy閾値へ還元しない。履歴の最低件数や質問件数SLOを設けない。適用Prototype／非UIの合意状態は別々に検査する。 |
| `NFR-C-HARNESS-034-01` / `HARNESS-L2-034` | 適用metricについてidentity/condition/baseline/target(or N/A)/sampling/probe/evidence/oracle/owner/execution layerの対応欠落0件。 | L2-034が列挙するcontract fieldとfailure conditionに各々一対一でtraceする候補。旧NFR grade・KPI率の継承でなく、項目欠落を測る。 | 対象scopeに選択されたmetricのみ。baseline/target値自体を自動補完しない。 |
| `NFR-C-HARNESS-036-01` / `HARNESS-L2-036` | selected profile内のunmatched required observation、duplicate level coverage、local/CI gate contract mismatchを個別集計し、誤ったsame-condition passは0件。 | 固定L2の抜け/重複・二面contract条件を直接観測する。全ticket全suite実行率を候補にしない。 | L2-005が選択したprofileとscopeに限定。実行回数SLOを追加しない。 |
| `NFR-C-HARNESS-038-01` / `HARNESS-L2-038` | selected scope内の適用obligationの片方向relation、aggregate-only coverage、未根拠N/A/no-findingは0件を候補oracleとする。 | HIL-FR-22の両方向edgeとHIL-FR-35の段階内容閉包に根拠。後段未作成はunresolved obligationとして数え、失敗扱いと区別する。 | 全旧source走査率や全機構一括closure率にしない。 |
| `NFR-C-HARNESS-039-01` / `HARNESS-L2-039` | 選択scopeのrequired Experience/UI/Frontend relation・target identityに対するuntraced/stale relation 0件。 | L2の三契約、screen-to-acceptance、pairwise/drift関係を照合する完全性候補。旧211 file inventoryを分母にしない。 | FE実測精度は049/036の選択scopeで扱い、039が実測結果を生成しない。 |
| `NFR-C-HARNESS-040-01` / `HARNESS-L2-040` | canonical 12 layer、6 pair、独立L0 anchorの必要catalog relation欠落0件。片edgeを双方向成立へ数える件数0。 | HIL-FR-46のledger/pair/anchor契約から直接導出。 | 未作成ledgerはmissing obligationとして記録し、全ledgerの実装率やregistrationを主張しない。 |
| `NFR-C-HARNESS-041-01` / `HARNESS-L2-041` | 同一active template/extractor revisionでsource obligation→個別atom-or-gap対応欠落0件、誤ったatomic semantic digest一致0件。 | L2-041と最新L11-041のatomic individual obligation・same input/extractor version semantic digest条件に対応する。 | 決まっていないextractor方式/件数/処理時間をthresholdにしない。 |
| `NFR-C-HARNESS-042-01` / `HARNESS-L2-042` | successful Design Refactor candidateのうちsemantic/consumer/oracle/dependency evidence不足件数0、mixed feature episodeの成立件数0。 | L2-042のroute根拠と同一episode禁止を数える候補。 | refactor量、削減率、性能改善幅は要求しない。 |
| `NFR-C-HARNESS-043-01` / `HARNESS-L2-043` | 各適用rule/branchでpositiveおよびboundary-negative例へのtrace欠落0件（coverage matrixの分母が確定したscopeに限る）。 | HIL-FR-55が各rule/branchの最小例対を要求し、risk追加を分析で限定している。 | 例の総数、未選択template、未確定分母に数値閾値を追加しない。 |
| `NFR-C-HARNESS-044-01` / `HARNESS-L2-044` | selected obligation classのuncovered classとunexplained duplicate semantic contractを個別に表示。candidate closure時のuncovered/duplicateは各0件。 | HIL-FR-54のclass assignment・uncovered/duplicate findingに対応。 | minimum portfolioは意味上の重複判定で評価し、単純な文書件数最小化にしない。 |
| `NFR-C-HARNESS-046-01` / `HARNESS-L2-046` | 適用workflow obligationのunmapped relation 0件を候補oracleとし、非Scrum scopeでScrum-only dutyを誤適用する件数0。 | L2-046 workflow全面性と選択条件付きScrum delta/backfillへ対応。 | Scrum非選択は欠落に数えず、style applicability不明は未評価。 |
| `NFR-C-HARNESS-047-01` / `HARNESS-L2-047` | muster候補のうち適用比較根拠欠落0件、single-worker-sufficientを専門化した誤route0件、worker/verifier authority conflation 0件。 | HIL-BR-30/HIL-FR-60の測定利益・既存role十分性・分離条件に対応。 | 固定benefit score、worker count、provider/model quality thresholdを新設しない。 |
| `NFR-C-HARNESS-049-01` / `HARNESS-L2-049` | 5 check別のTP/FP/FN/TN件数とprecision=TP/(TP+FP)、recall=TP/(TP+FN)を数値で報告し、分母0・適用不明・fixture不足は未評価とする。 | fixed L11-049の既知positive/negative fixture精度評価と未評価warningを観測する。案Aは事前のprecision/recall合格閾値を置かず、数値結果と混同行列を報告し、現在の草稿ではこれを推奨する。案Bは代表性のあるcalibration後に候補閾値を比較し、別holdoutで検証するが、初回実測前に数値を固定しない。案Aは閾値を指定しないL2/L11とwarning要求に忠実で、検査精度候補を毎回の人間gateへ変えない。 | prototype生成・Pattern/ID要件は追加しない。誤検出/見逃しの実測を保ち、閾値案はL3候補として比較する。 |
| `NFR-C-HARNESS-054-01` / `HARNESS-L2-054` | handoffとOS assignmentのtask/scope/revision mismatch、未解決axisを成功扱いする件数各0。 | L2-054と固定L11のcontract/assignment identity対応から導出。 | assignment実行数/成功率やlifecycle方式をHARNESS NFRにしない。 |

## 4分類の有限fixture行列候補

NFR-C-HARNESS-023-01の「全件」は、次の12個の明示fixtureを指す。closureを状態別に確認し、同じinput・pack revisionで各fixtureを2回評価してclosureと理由の意味digest差分0件を候補oracleとする。ここでのdigestは試験比較用で、正本JSON schemaや実装方式を新設しない。

| fixture | 4分類／条件 | 期待state・closure oracle |
|---|---|---|
| D1 | 常時必須・依存が有効 | closureに含む |
| D2 | 常時必須・依存missing | 該当利用を保留、missing理由を出す |
| D3 | 常時必須・版stale／range不一致 | 該当利用を保留し、staleと互換range不一致を区別した理由を出す |
| D4 | operation条件true・依存有効 | closureに含む |
| D5 | operation条件false | 当該operationを含まない要求に限りclosure外、条件不成立を記録 |
| D6 | operation条件unknown | falseへ読み替えず保留 |
| D7 | sourceを明示選択・依存有効 | 選択sourceのdependency closureに含む |
| D8 | sourceを明示選択・依存missing／stale | 該当利用を保留、別sourceへ暗黙fallbackしない |
| D9 | source未選択 | 未観測を記録し、存在・適格性・成功を推測しない |
| D10 | D8で選択したsourceに失敗後、同一inputのまま別sourceへ自動変更を試行 | 暗黙fallbackを拒否し保留 |
| D11 | 利用者がsourceを明示再選択した新input/revision | 新しい選択条件でclosureを再評価し、新sourceの根拠を記録 |
| D12 | 参照資料のみ | 実行closure外。実行条件・成果・authority・oracle・安全制約に影響する資料をこの区分へ偽装した場合は保留 |

D8/D10は無断fallback拒否、D11は明示入力変更後の再評価を別caseにする。人による代行も通常呼出しと同一の権限・隔離・版・検証・記録・受領義務を持ち、receiptが欠ければclosure evidenceとして不合格。分類器は依存が未実装でもD2/D3/D6/D8等をmissing/unknownとして返す。

## expiry境界候補の比較と測定

HARNESS-L2-011/L11は期限切れをsuccessにしないが、expiry時刻と比較演算子の等号扱いを明示していない。既存契約で定義済みならその比較規則を使う。定義が見つからない場合は値を未解決のまま止めず、案A `now >= expiry`（expiry時刻ちょうどから期限切れ）を安全側の起草候補、案B `now > expiry`（expiry時刻ちょうどを含む）を比較候補として同じclock/scopeの合成fixtureで測る。expiry直前・ちょうど・直後のdispatchとresumeを各々与え、result stateと相関IDを記録し、どの比較でも期限切れをsuccessとしないことを確認する。採用した比較演算子・timestamp precision・clock sourceをL3/L4契約に記録する。これは運用上のTTLやclock skew許容値を捏造しない候補であり、L2の意味変更が必要と分かった場合のみ上流へ戻す。

## 値の選び方と責務

候補の0差分・同一key・高々1回の効果は、性能目標や可用性SLOでなく、採択L2/L11に明記された再現性・隔離・冪等性を観測する完全性条件である。測定対象は固定revisionの宣言scopeに限る。candidate resultはL3承認、検証済状態、release eligibilityを生成しない。

時間予算、retry count、TTL、保持期間、closure上限、通信latencyの具体値は固定親および照合した旧sourceで根拠を得ていない。これらを曖昧なままにして検証を止めず、L3は親が定めたexpiry・retry contractを利用し、定量値が実現可能性判断に必要となる場合はL4設計へ根拠付き候補を渡す。候補選定で要求意味・scope・owner・version_targetが変わる場合だけL2へ戻す。

## 旧NFR資産との照合

`LEGACY-ASSET-DB669724249A14A665F0`（`archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/nfr-grade.md`、全文SHA-256 `2197b4d2f4118aae83202f9f886056fd9de360f21667e25fe9c9d906f76c832d`、行21–34・58–81）から、候補値・測定方法・判定材料を一組で書く骨格のみ再導出する。旧IPA grade、CLI／CI実行手順、server/OS条件、旧割合・timeout等の閾値は対象L2の根拠でないため再利用せず置換する。旧NFR-08の4-artifact trace率や閾値を現行pack値へ流用しない。


## H022 technical candidate

| NFR候補ID／親 | 候補値 | 根拠・比較案 | L10測定・適用限界 |
|---|---|---|---|
| `NFR-C-HARNESS-022-01` / `HARNESS-L2-022` | 段階間の誤昇格0件。各昇格は同一revision/scopeの当該stage証拠一式を要し、L10 passのみからAcceptedへ進む件数0。 | 4状態と3遷移を個別に確認する固定L2を観測可能にした候補。単一green/progressへの縮約は不採択。 | L10で段階別positiveと必要evidenceを一つ欠いたnegativeを比較し、誤昇格件数を数える。利用者受入やreleaseの実施は対象外。実測値ではなく候補。 |

## Stage 2c — HARNESS-L2-030／031／032技術候補

| 候補ID／親 | 候補値・条件 | 根拠と比較案 | 適用限界 |
|---|---|---|---|
| `NFR-C-HARNESS-030-01` / `HARNESS-L2-030` | 固定入力・source版・scopeから生成したcase意味の予期しない差分 **0件**。 | L2-030の再現可能な生成条件を試験可能にする候補。比較案としてbytes digestだけの比較と、contractで非意味metadataを明示除外した意味比較を区別する。contractが除外項目を宣言しない限りbytes差は差分である。 | 生成物の実行・品質・coverage充足を測らない。旧生成値/閾値を根拠にしない。 |
| `NFR-C-HARNESS-031-01` / `HARNESS-L2-031` | original failure identityの欠落、別oracle failureとの誤同一視、raw secret/PII露出 **各0件**。 | 元failure保持・同一oracle確認・sanitizationを個別に測れる完全性候補。case生成件数や縮小率を合否値にする案はfailure意味を測らないため採らない。 | 最小ケースのサイズ、再現時間、成功率の未指定閾値は追加しない。 |
| `NFR-C-HARNESS-032-01` / `HARNESS-L2-032` | packet内のcase/oracle/source-version/target-revision/scope/consumer-schema対応不一致 **0件**。 | L2-032のartifact意図と選択consumerとの結合をidentity単位で観測可能にする候補。受渡しreceiptからexecution passを導く比較案は責務境界を壊すため不採用。 | 対象は選択した宣言済みconsumer/versionだけ。実行結果・CI成功・consumer availability SLOは測らない。 |

旧NFRの測定値・閾値を流用せず、比較対象と計測範囲を限定する。

## Stage 4 technical candidates

| 候補ID／親 | 候補値・測定条件 | 根拠と比較 | 適用限界 |
|---|---|---|---|
| NFR-C-HARNESS-026-01 / HARNESS-L2-026 | 選択scopeの要求→設計artifact→oracle trace欠落0件、必須CORE contract欠落の誤確定0件 | L2列挙fieldを全件照合する案Aと、artifact単位sampling案Bを比較し、samplingは一つの未trace義務を隠すためAを候補とする。 | 対象は選択済み設計scope。Template数・生成時間SLOなし。 |
| NFR-C-HARNESS-027-01 / HARNESS-L2-027 | 静的source spanへの未trace observation 0件、実行・実顧客dataへの誤アクセス0件 | 静的code/schema/API/configのsource/revision/digest/scopeを全観測と照合する。file-levelのみのtrace案は誤source混入を検出しにくいためspan trace案を比較候補にする。 | coverage分母は親が選択した静的scope。実行性能SLAは導かない。 |
| NFR-C-HARNESS-028-01 / HARNESS-L2-028 | affected requirement/design exact setの欠落0件、unknownをknownとする誤分類0件 | 全affected setを列挙する案とtop-N表示案を比較し、top-Nでは親要求の未表示が残るため全件closureを候補とする。 | 意味変更の承認や自動変更は測定対象外。 |
| NFR-C-HARNESS-029-01 / HARNESS-L2-029 | proposalの根拠/対象/custom logic保持対応欠落0件、未選択operation dependencyの誤必須化0件 | operation別closureで候補を分離する案と常時全依存案を比較し、固定親の条件付き依存を保持する前者を推奨。 | migration成功率、API品質SLA、実行時間は固定しない。必要な数値は根拠・比較・測定方法を備えた候補にできる。 |
