# HELIX-HARNESS L3 非機能要件候補（部分草稿）

status: draft_for_l3_review
approval: not_approved
scope: HARNESS-L2-010, HARNESS-L2-011, HARNESS-L2-022, HARNESS-L2-023, HARNESS-L2-030, HARNESS-L2-031, HARNESS-L2-032 / version_class 1.0
paired_l10: ../L10-verification/nfr-verification.md

これは4つの採択済みL2親から再導出した測定可能な技術候補である。候補はL2の意味・範囲・owner・版を変更せず、数値値を個別にPOへ照会しない。候補のL3採否と実装は未確定であり、対応する総合検証方法は[L10 NFR検証](../L10-verification/nfr-verification.md)に記す。

## 候補値

| 候補ID／親 | 候補値・条件 | 根拠と比較案 | 適用限界 |
|---|---|---|---|
| `NFR-C-HARNESS-010-01` / `HARNESS-L2-010` | 同一の宣言inputとpack版に対する宣言成果物の予期しない差分は **0件**。比較基準はartifact bytes digest一致。 | 固定L2の「同じ入力と版から同じ成果物」をそのまま観測可能にした候補。案Bのsemantic digestは、宣言artifact contractが特定metadataを非意味項目として明記した場合だけ、その項目を除外してよい。contractに除外がなければ案Bは不採用で、bytes比較を緩めない。旧FR-03の4 artifact／12 edgeはこの値の根拠にしない。 | contractが宣言する成果物だけを比較し、上位release／製品の昇格は判定しない。digest algorithmや生成実装方式はここで固定しない。 |
| `NFR-C-HARNESS-010-02` / `HARNESS-L2-010` | 単一pack差し替えで、対象外packのversion/evidence変更は **0件**。 | L2/L11の「一つのpack差替えで他のpackの版と証拠が保たれる」を直接数える。案B（dependency closure由来なら対象外の変更を許容）はこの不変条件に反するため不採用比較案。複数packを同時に更新する操作は別scopeであり、このAC／候補値に混ぜない。 | 対象pack自身の明示された更新は比較対象。複数pack更新の意味や許可をこの要件で追加しない。 |
| `NFR-C-HARNESS-011-01` / `HARNESS-L2-011` | 同一logical operationのresumeは **同一冪等key**を保持し、同じkeyの重複送達による追加処理効果は **0件**（効果は高々1回）。 | 固定L2/L11が要求する停止・再開、記録済state、同じ冪等keyを候補へ結ぶ。retryごとに新keyを作る案は重複防止と再開同一性を弱めるため不採用比較案。 | 冪等keyの生成方式、保持期間、全runtime共通の実装方式は指定しない。処理authorityとdata scopeは既存ownerに従う。 |
| `NFR-C-HARNESS-011-02` / `HARNESS-L2-011` | expiry経過後にsuccessと返るoperationは **0件**。dispatchおよび停止後resumeの各開始境界でexpiryを評価する。等号境界は既存contractに定義があればその値に従う。未定義の場合の比較候補は案A `now >= expiry`をexpired（有効区間 `[issued_at, expiry)`）、案B `now > expiry`をexpired（有効区間 `[issued_at, expiry]`）とする。 | expiry後をsuccessにしないL2/L11を観測する。等号で失効する案Aは期限ちょうどの曖昧な成功窓を作らない保守的候補であり、案Bは境界を含むため呼出し側とのtimestamp定義一致を要する。両案ともdispatchおよびresume開始時に評価し、直前／境界／直後fixtureで結果を比較する。 | TTLや時計skew許容値はL2にないため設定しない。expiry authorityは呼出し側／SECURITYに残し、HARNESSは延長しない。 |
| `NFR-C-HARNESS-023-01` / `HARNESS-L2-023` | 同一pack revision・同一入力条件の繰返し評価で、closureと理由の差分は **0件**。 | L2/L11が要求する同一input/revisionの有効closure再現と理由一致に対応。下記12行の有限fixture行列を全件確認する案と、条件数増加時のpairwise案を比べ、この固定行列を候補とする。分類能力自身は全依存実装を要求せず、missing/unknown状態を分類できる。 | closure件数上限や処理時間はこの親から導かない。未選択sourceの存在／成功を補完しない。 |

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
