# HELIX-BRAIN Stage 1（007/008/028）結合検証設計

status: draft_for_independent_review
owner: HELIX-BRAIN（L3/L10の要件oracleを結合照合）
paired_l4: ../L4-basic-design/stage1-brain.md
base: main `7d48e458fcff7e03df18abc4f768981410685cf7`
l4_sha256: `a981efc23ea0e85303a600f469d2d989b991b378a4b89ac94cf34bce004ccc9c`

本書は対のL4設計を一方向に固定して、Stage 1対象のsystem-level fixtureとoracleを定める。これは検証設計であり、実行結果、実装、承認、adoption、releaseを意味しない。PR #2738はmain `7d48e458fcff7e03df18abc4f768981410685cf7` に統合済みであり、現行共通カーネルK2の`KeyOfResult`と拒否順を§5で照合する。固定L3/L10対象revisionは後続bytesで差し替えない。

## 1. 対象とauthority

固定対象revision、6文書のSHA-256、承認chainは対L4 §1を参照する。007は対象revision `2919f7344f90ff8bde4db60ef7142b3c47bea0a8` に対するparent007専用の委任判断とformal #6040506426 → condition 3 #6040860539 → main read-after #6040960721を根拠とする。008/028は `debb4e3d682c5ad4835dafed7dbcbf33f24e9c8f` の6本文に対する2026-10-05直接PO判断 #5985291728を根拠とする。判断記録のfront matterやL3本文の旧statusだけをauthorityとして読まず、承認範囲はこの親別chainに限る。

functional ACは007/008/028各2件、計6件である。L3 functionalの適用行は007 lines 11–62、008 61–106、028 107–159。固定L10 functional case familyは007 C01–C10、008 C01–C09、028 C01–C08の計27件であり、各case名・入力・期待結果は固定L10 `functional-verification.md` に従う。

## 2. 結合fixtureと結果分類

各fixtureは固定L2/L11/L3/L10 revision、必要な依存revision、owner recordと入力を明示する。007ではPattern/Unit/Part候補と8必須group、LABO対象revision、LABO/OS/BRAIN/adoption各recordを別個に構成する。008ではProduct Coreのexact reference、BRAIN knowledge state/supersession、OS project-useを別記録で構成する。028ではdescriptor field群とBRAIN knowledge tupleに互いに異なる合成値を入れ、HARNESS-L2-010/011 pack/call境界依存を明示する。合成値はfixtureだけの値である。

| 観測結果 | oracle |
|---|---|
| 正常入力が全て解決し既存owner契約に一致 | L4が定める各軸・各owner recordを別々に返す。007はsourceから採否根拠までtrace、008は指定exact revision・BRAIN state・OS useを並行表示、028はrangeとfieldがowner契約で解決した場合のみexact knowledge revisionに適用可能を返す。 |
| 有効な反例を実際に評価し不一致を確認 | K1の否定`Value`または既存契約上の拒否をfield/ownerとともに返す。誤昇格、silent replacement、cross-axis substitution、owner間write-backは0件の候補として測るが、未実行である。 |
| 必須source/owner/revision/rangeが未登録・読取不能・比較不能 | `Unknown`（必要に応じて`Unobserved`/`Stale`）を保ち、該当ownerへ戻す。unknown/missingをNegativeやNotApplicable、成功へ丸めず、後続採用を行わない。 |

各caseのexpected resultが成立しなければ、そのcaseだけ未肯定とする。共通依存が未解決のときも影響するoperationだけをUnknownにし、Stage全体を止める新gateにしない。

## 3. Functional ACと全27 case family

以下の`IV-BRAIN-NNN`は本L9で定義する一意な検証oracle IDである。`L10-BRAIN-...`は上流L10の固定case参照であり、この文書内の検証IDとして再定義しない。

| L9 oracle ID | 親・AC | 固定L10 case | fixtureと期待oracle | 戻し先／非肯定結果 |
|---|---|---|---|---|
| `IV-BRAIN-001` | `BRAIN-007-AC-01/02` | `L10-BRAIN-007-C01` | 8group全てとcandidate revisionに一致するLABO targetを与え、由来と各owner stateを分離してtraceする。 | missing/stale等があればcandidate保持・promotion停止。 |
| `IV-BRAIN-002` | `BRAIN-007-AC-01/02` | `L10-BRAIN-007-C02` | 各provenance fieldをmissing/stale/danglingにし、LABO未評価なのに評価済みとする変異も独立に与える。candidateを維持し不足fieldを返す。 | 根拠不足は未採用candidateへ、LABO未評価はLABO契約へ戻す。 |
| `IV-BRAIN-003` | `BRAIN-007-AC-02` | `L10-BRAIN-007-C03` | evaluated scope、counterexample、limitation、adopted reasonを別々に欠落させ、accepted/matureへの移行を止める。 | 不足fieldを特定しcandidate保持。上流意味変更だけL1へ戻す。 |
| `IV-BRAIN-004` | `BRAIN-007-AC-01/02` | `L10-BRAIN-007-C04` | AI生成のみ、または実績一件のみでaccepted/matureを要求する。誤昇格を生じさせない。 | 採否state不変。新しいthresholdは導入しない。 |
| `IV-BRAIN-005` | `BRAIN-007-AC-01/02` | `L10-BRAIN-007-C05` | LABO target revisionをcandidateと不一致にする。LABO結果を不一致として保持しcandidate/adoptionを変更しない。 | LABOの既存評価契約へ返す。 |
| `IV-BRAIN-006` | `BRAIN-007-AC-01/02` | `L10-BRAIN-007-C06` | candidate revision更新後に旧evidenceを渡し、旧evidenceをstaleとして拒否する。 | 現candidate向けのsource/evidence不足を示しpromotion停止。 |
| `IV-BRAIN-007` | `BRAIN-007-AC-02` | `L10-BRAIN-007-C07` | LABO評価、OS登録、OS振分け、BRAIN独立検証を各々単独で採否根拠にする変異を与え、各stateだけを保持する。 | adoption stateを変更しない。owner間state代用なし。 |
| `IV-BRAIN-008` | `BRAIN-007-AC-01` | `L10-BRAIN-007-C08` | 現行契約を満たす既採用recordからsource/evidenceを経てLABO、OS、独立検証、adoption根拠まで遡れることを照合する。 | 既存採否根拠が足りなければ肯定traceにせず該当ownerへ戻す。 |
| `IV-BRAIN-009` | `BRAIN-007-AC-01` | `L10-BRAIN-007-C09` | 未見Pattern/Unit/Part組合せに全8groupとowner recordを与え、C01と同じtraceが成立することを確認する。 | required input不足なら正常例とせずAC-02のUnknown/hold。 |
| `IV-BRAIN-010` | `BRAIN-007-AC-02` | `L10-BRAIN-007-C10` | LABO evaluation target revisionを欠落させる。欠落を不一致や成功へ丸めない。 | LABOへ戻し、候補維持・promotion停止。 |
| `IV-BRAIN-011` | `BRAIN-008-AC-01/02` | `L10-BRAIN-008-C01` | Coreがexact Rを参照しRがsuperseded/R2追加となった後も、Core R参照、BRAIN state、OS usageを別々に照合する。 | R参照をR2へ置換しない。knowledgeはBRAIN、project useはOS。 |
| `IV-BRAIN-012` | `BRAIN-008-AC-01/02` | `L10-BRAIN-008-C02` | identity/revision/state unknown・conflict、actual version欠落、Core/OS参照変更を別々に与える。currentへの暗黙解決を止める。 | knowledge問題はBRAIN、project-use問題はOSへ。 |
| `IV-BRAIN-013` | `BRAIN-008-AC-01/02` | `L10-BRAIN-008-C03` | `version_target`をactual versionとして代入しても不明な実版が解決しないことを確認する。 | candidate use停止。actual version不明を維持。 |
| `IV-BRAIN-014` | `BRAIN-008-AC-01/02` | `L10-BRAIN-008-C04` | BRAINがRをcurrentからsupersededへ更新し、既存OS project-use recordが不変であることを確かめる。 | 正当なBRAIN state変更は反映し、OS historyは旧exact参照を保持。 |
| `IV-BRAIN-015` | `BRAIN-008-AC-01/02` | `L10-BRAIN-008-C05` | OSが利用中のexact Rを保ってproject-use recordを更新し、BRAIN lifecycle stateが不変であることを確かめる。 | 正当なOS更新は反映し、BRAIN stateへwrite-backしない。 |
| `IV-BRAIN-016` | `BRAIN-008-AC-01` | `L10-BRAIN-008-C06` | 未見の有効なexact identity/revision、列挙state、OS use recordを与え、C01と同じ分離traceを確認する。 | 列挙外/不明値は正常例でなくAC-02の停止。 |
| `IV-BRAIN-017` | `BRAIN-008-AC-01` | `L10-BRAIN-008-C07` | current/superseded/deprecated/experimental/retiredを個別に識別し、Core参照とOS usageを別recordに保つ。 | state遷移順や利用可否規則は追加しない。 |
| `IV-BRAIN-018` | `BRAIN-008-AC-02` | `L10-BRAIN-008-C08` | exact R参照にR2を返す変異を与え、置換を検出または拒否する。 | 利用停止しBRAINへ戻す。 |
| `IV-BRAIN-019` | `BRAIN-008-AC-02` | `L10-BRAIN-008-C09` | 同revision Rのbytesだけを書き換えた変異を与え、事前内容との差を検出する。 | 利用停止しBRAINへ戻す。製品digest方式は決めない。 |
| `IV-BRAIN-020` | `BRAIN-028-AC-01/02` | `L10-BRAIN-028-C01` | 全descriptor field、HARNESS L2-010/011依存、exact knowledge tupleを与え、fixture内宣言range内の適用可能結果を照合する。 | fixture値は製品値・range syntaxではない。 |
| `IV-BRAIN-021` | `BRAIN-028-AC-01/02` | `L10-BRAIN-028-C02` | unknown identity/revision、range外、field欠落、silent fallbackを個別投入し、fallback/replacementなしを確認する。 | knowledge側はBRAIN、descriptor/range側はHARNESS。range不明はUnknown。 |
| `IV-BRAIN-022` | `BRAIN-028-AC-01/02` | `L10-BRAIN-028-C03` | descriptor kind/dependency/scope/versionとknowledge version/stateをそれぞれ単独欠落・不一致にする。各fieldと所有軸を特定する。 | descriptor側HARNESS、knowledge側BRAINへ戻す。 |
| `IV-BRAIN-023` | `BRAIN-028-AC-02` | `L10-BRAIN-028-C04` | declared range外とrange欠落/解釈不能を別変異にする。前者は既存K1根拠がある場合だけNotApplicable、それ以外と後者はUnknown。 | 該当range fieldを示しHARNESSへ。 |
| `IV-BRAIN-024` | `BRAIN-028-AC-01/02` | `L10-BRAIN-028-C05` | `version_target`をactual contract/artifact/knowledge versionに代入し、未確定実版が解決しないことを確認する。 | unknownを維持し適用停止。 |
| `IV-BRAIN-025` | `BRAIN-028-AC-02` | `L10-BRAIN-028-C06` | BRAINへcommon exchange/update/rollback/unfinished-obligation義務を移す変異を個別に与える。 | BRAIN側で受理・再定義せずHARNESS共通契約へ戻す。 |
| `IV-BRAIN-026` | `BRAIN-028-AC-01` | `L10-BRAIN-028-C07` | 未見のdescriptor/knowledge組合せを、明示したfixture値と依存revisionで検査する。 | range/inputが不足すれば正常例とせずUnknown/未評価。 |
| `IV-BRAIN-027` | `BRAIN-028-AC-02` | `L10-BRAIN-028-C08` | descriptor/knowledge identity、contract/artifact/dependency/knowledge versionとknowledge revisionを異なる値で軸入替えする。誤受理せずfieldを示す。 | knowledge mismatchはBRAIN、descriptor mismatchはHARNESSへ。 |

全caseで次の観測を記録する：入力と各referenceのkind/identity/revision/digest、current owner declarationのreference、各軸の結果分類、否定fieldまたはunknown理由、BRAIN/LABO/OS/HARNESSの戻し先、owner間write-backの有無、採用/利用状態が変化したか。正規の合成fixture以外のsourceを補って正常例としない。

## 4. Business、NFR、L10総合検証

固定L3 businessの007/008/028各行と固定L10 businessの各行は、独立business outcomeがないと明記する。したがってbusiness AC、KPI、画面・集計条件、別business owner gateは作らず、同じfunctional AC traceを参照する。旧HARNESS business-detailの業務値はL4 §5のとおり適用しない。

固定L3 NFR候補と固定L10 NFR測定設計は§1の6本文pinに固定される。以下はその既存測定義務を測る手順であり、候補値の採択・実測合格ではない。

| L9 test ID | 親 | 測定用入力／独立変異 | 記録する分母と観測 | 制限 |
|---|---|---|---|---|
| `IV-BRAIN-001`–`010` | 007 | 8group正常fixture、各group/atomic fieldのmissing・stale・wrong revision、false promotion、LABO target欠落/不一致、owner receipt単独を個別投入。 | 各field/groupのsource trace、candidate維持、accepted/mature誤遷移、LABO/OS/BRAIN/adoption state。coverage 8/8・false promotion 0は測定候補。 | source identity/revisionは一group内の二つのatomic field。実績件数/verifier人数や新しいpromotion thresholdを加えない。 |
| `IV-BRAIN-001`–`010` | 007 | L10 NFRのfalse-promotion fixtureとしてAI生成のみ、成功一件のみ、counterexample/limitation欠落、LABO target mismatch、LABO/OS/BRAIN owner record単独を個別投入。 | 誤昇格とowner state代用を各変異別に記録し、欠落fieldとLABO target問題を区別する。 | 未実行の測定候補。新しいthresholdは加えない。 |
| `IV-BRAIN-011`–`019` | 008 | 5 state、Core R pin後のR superseded/R2追加、R→R2返却、同revision内容書換えを個別投入。 | 各state識別、既存Core exact R、OS use履歴の保持、silent replacementの変異別結果とowner戻し。 | 遷移順、保存期間、semver grammarや追加stateを決めない。 |
| `IV-BRAIN-011`–`019` | 008 | unknown identity/revision/state/conflict、actual version欠落、version_targetのactual代用を個別投入。 | currentへの暗黙解決なし、candidate use停止、BRAIN知識stateとOS project-useのwrite-backなし。 | 未知値を除外せず、未測定を成功扱いしない。 |
| `IV-BRAIN-020`–`027` | 028 | descriptor/knowledge fieldを独立変異し、range内/外/欠落/解釈不能、actual versionとversion_targetを個別投入。 | 全fieldの一致/不一致、該当axis、適用可否/Unknown、BRAIN/HARNESS戻し先。誤受理0は技術候補。 | range grammar/comparator未定義の枝はUnknown/未評価とし、実測合格に数えない。fixture値は製品値でない。 |
| `IV-BRAIN-020`–`027` | 028 | common exchange/update/rollback/unfinished-obligation義務をBRAINへ移す変異を個別投入。 | 共通lifecycle義務をHARNESSへ返し、BRAINで受理/再定義しないことを観測。 | BRAIN専用NFRを追加しない。 |
| `IV-BRAIN-020`–`027` | 028 | identity、contract/artifact/dependency/knowledge version、knowledge revisionの各軸を入替える。 | 変異ごとの誤受理と該当field/戻し先を記録する。 | version構文や実測値を決めない。 |

分母、valid/failed/missing/censored、未測定、fixture不足を区別し、missingや未選択を成功分母から消さない。候補のcoverage率・誤受理0・誤昇格0は測定候補であり、採択済SLA、承認条件、PO確認要求ではない。固定L3の意味・範囲・ownerを変えない数値候補ごとに追加承認を作らない。

## 5. 共通カーネル契約への検証trace

| 共通契約（現行main L4/L9） | 結合fixtureで確かめること | BRAIN固有oracleとの境界 |
|---|---|---|
| K1 | missing/unknown/staleをPositiveへ縮退しない。negative、non-value、empty required setを別々に観測する。 | 未解決source/rangeは対象fieldだけ非肯定。 |
| K2 | exact SubjectRef/keyでRを固定し、同revision bytes conflict、異revision stale、owner inputsの変更を分離する。共通L9の`IV-K2-13/13a/13b`（Digest形式）と`IV-K2-15`（duplicate identity）を参照し、`key_of`拒否順はmissing key→invalid digest→duplicate identityとする。 | state identityやactual versionの意味はBRAIN ownerに残す。API拒否はK1 `Observed`へ変換しない。 |
| K3 | 実際にauthorityを要する既存状態変更だけ、現行operation/permission bindingの肯定または診断を確認する。 | 照会やread-only comparisonへ新しいpermission gateを足さない。 |
| K4/G3 | declared obligationsがある場合にそのoracle closureと戻しを確認する。 | BRAIN親から新しいcommon obligationや採用gateを導入しない。 |
| K5 | owner記録の追記・lookup/reconstructionがcurrent keyと同じbytesを指すことを確認する。 | LABO/OS/BRAINの記録を混成しない。 |
| K6/E | receiptの固定key、producer、source read-set、oracle/evidenceの結合と非肯定時の保持を確認する。 | receipt存在だけでは中身の真実性、physical action、authority、adoptionを証明しない。 |
| K7/G5 | 共通generation/lifecycle操作を使う場合の現行fencing/unfinished obligation契約を参照する。 | BRAIN 5 stateをpointer generationやdeploy stateと同一視しない。 |
| K8 | SECURITY ownerが宣言した分類/明示経路を参照する場合、read-only observationとauthority effectが別であることを確認する。 | BRAIN stateはK8 labelではない。 |
| K9 | 独立reviewのidentity/context/authority/route記録と結果receiptの照合を設計対象にする。 | review結果からadoptionや上流承認を生成しない。 |
| K10 | 固定親の依存先をtyped identity/revisionでたどり、未登録依存をUnknownに保つ。 | dependency closureを推測で補わない。 |

旧HELIXのfailure類型は対L4 §5のasset/path/full SHAと台帳entryに対応する。test design/runtimeを起動せず、旧case ID・閾値・APIを実行oracleとして再利用しない。L9 caseは固定現行L10から再導出した期待を照合する。

## 6. 検証状態

- この文書とL4対は設計草稿であり、独立review待ちである。
- 27 case familyとNFR測定手順は未実行。実装・receipt・runtime・性能値は本書で主張しない。
- Stage 1 L4〜L7設計/実装unlockは、L9実行やL8検証を許可しない。別機構のCI/lifecycle検証をBRAIN製品義務の完了へ読み替えない。
- 未解決項目は影響caseだけをUnknown/未評価とし、要件の意味を変えない限り新しいPO gateを要求しない。
