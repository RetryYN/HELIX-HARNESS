# HELIX-HARNESS L3 非機能要件候補（部分草稿）

status: draft_for_l3_review
approval: not_approved
scope: HARNESS-L2-010, HARNESS-L2-011, HARNESS-L2-023 / version_class 1.0
paired_l10: ../L10-verification/nfr-verification.md

これは3つの採択済みL2親から再導出した測定可能な技術候補である。候補はL2の意味・範囲・owner・版を変更せず、数値値を個別にPOへ照会しない。候補のL3採否と実装は未確定であり、対応する総合検証方法は[L10 NFR検証](../L10-verification/nfr-verification.md)に記す。

## 候補値

| 候補ID／親 | 候補値・条件 | 根拠と比較案 | 適用限界 |
|---|---|---|---|
| `NFR-C-HARNESS-010-01` / `HARNESS-L2-010` | 同一の宣言inputとpack版に対する宣言成果物の予期しない差分は **0件**。比較基準はartifact bytes digest一致。 | 固定L2の「同じ入力と版から同じ成果物」をそのまま観測可能にした候補。案Bのsemantic digestは、宣言artifact contractが特定metadataを非意味項目として明記した場合だけ、その項目を除外してよい。contractに除外がなければ案Bは不採用で、bytes比較を緩めない。旧FR-03の4 artifact／12 edgeはこの値の根拠にしない。 | contractが宣言する成果物だけを比較し、上位release／製品の昇格は判定しない。digest algorithmや生成実装方式はここで固定しない。 |
| `NFR-C-HARNESS-010-02` / `HARNESS-L2-010` | 単一pack差し替えで、対象外packのversion/evidence変更は **0件**。 | L2/L11の「一つのpack差替えで他のpackの版と証拠が保たれる」を直接数える。案B（dependency closure由来なら対象外の変更を許容）はこの不変条件に反するため不採用比較案。複数packを同時に更新する操作は別scopeであり、このAC／候補値に混ぜない。 | 対象pack自身の明示された更新は比較対象。複数pack更新の意味や許可をこの要件で追加しない。 |
| `NFR-C-HARNESS-011-01` / `HARNESS-L2-011` | 同一logical operationのresumeは **同一冪等key**を保持し、同じkeyの重複送達による追加処理効果は **0件**（効果は高々1回）。 | 固定L2/L11が要求する停止・再開、記録済state、同じ冪等keyを候補へ結ぶ。retryごとに新keyを作る案は重複防止と再開同一性を弱めるため不採用比較案。 | 冪等keyの生成方式、保持期間、全runtime共通の実装方式は指定しない。処理authorityとdata scopeは既存ownerに従う。 |
| `NFR-C-HARNESS-011-02` / `HARNESS-L2-011` | expiry経過後にsuccessと返るoperationは **0件**。expiry評価はdispatchおよび停止後resumeの各開始境界で行う候補とする。 | expiry後をsuccessにしないL2/L11を観測する。案Aはdispatchとresume前に再評価、案Bは初回だけ評価。再開で期限が変化し得るためAを保守的候補とする。expiry前／境界／後の入力fixtureが比較可能。 | TTLや時計skew許容値はL2にないため設定しない。expiry authorityは呼出し側／SECURITYに残し、HARNESSは延長しない。 |
| `NFR-C-HARNESS-023-01` / `HARNESS-L2-023` | 同一pack revision・同一入力条件の繰返し評価で、closureと理由の差分は **0件**。 | L2/L11が要求する同一input/revisionの有効closure再現と理由一致に対応。有限の4分類状態行列を全件確認する案と、条件数増加時のpairwise案を比べ、固定基本行列を候補とする。 | closure件数上限や処理時間はこの親から導かない。未選択sourceの存在／成功を補完しない。 |

## 値の選び方と責務

候補の0差分・同一key・高々1回の効果は、性能目標や可用性SLOでなく、採択L2/L11に明記された再現性・隔離・冪等性を観測する完全性条件である。測定対象は固定revisionの宣言scopeに限る。candidate resultはL3承認、検証済状態、release eligibilityを生成しない。

時間予算、retry count、TTL、保持期間、closure上限、通信latencyの具体値は固定親および照合した旧sourceで根拠を得ていない。これらを曖昧なままにして検証を止めず、L3は親が定めたexpiry・retry contractを利用し、定量値が実現可能性判断に必要となる場合はL4設計へ根拠付き候補を渡す。候補選定で要求意味・scope・owner・version_targetが変わる場合だけL2へ戻す。

## 旧NFR資産との照合

`LEGACY-ASSET-DB669724249A14A665F0`（`archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/nfr-grade.md`、全文SHA-256 `2197b4d2f4118aae83202f9f886056fd9de360f21667e25fe9c9d906f76c832d`、行21–34・58–81）から、候補値・測定方法・判定材料を一組で書く骨格のみ再導出する。旧IPA grade、CLI／CI実行手順、server/OS条件、旧割合・timeout等の閾値は対象L2の根拠でないため再利用せず置換する。旧NFR-08の4-artifact trace率や閾値を現行pack値へ流用しない。
