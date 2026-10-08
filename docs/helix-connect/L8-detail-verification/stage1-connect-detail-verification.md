---
title: "HELIX-CONNECT Stage 1 L8 詳細検証設計"
layer: L8
status: design_pair_defined
owner: HELIX-CONNECT
paired_l5: ../L5-detail-design/stage1-connect.md
paired_l5_sha256: 5f0af32559f1aa370772f7d6246ea6b5d74f50a2f209b8dcc0dba2a08c74209b
base: main `13a2d6ec23e568edb35ffaa7532950fbfda3aafd`
---

# HELIX-CONNECT Stage 1 L8 詳細検証設計

本書はbase `13a2d6ec23e568edb35ffaa7532950fbfda3aafd`上のL4 `../L4-basic-design/stage1-connect.md`（SHA-256 `10711d9c3897f7351f6d8cc0535264d4b68f642a08177cf8373f030356741002`）と既存L9 `../L9-integration-verification/stage1-connect-integration-verification.md`（SHA-256 `0e956080febe084fdf4747b6d9bd3f86ea6400a65e3ecc179d59566dabefc92a`）を固定sourceとし、[L5](../L5-detail-design/stage1-connect.md)の設計境界に沿って既存L9 verifierのfixture案を詳述する。設計済みfixtureであり、実行・pass・通信結果・実装成立を表さない。各fixtureは合成descriptor/revision/receipt/eventだけを使い、外部通信、credential/provider、物理network path、旧runtime/test/CIを使わない。期待値は既存kernelのK1〜K10型・責務に従い、CONNECT固有のUnknown/reason/result vocabularyを追加しない。

## 1. 固定scopeとsource

対象はStage 1 `HELIXCONNECT-L2-001`〜`005`、`version_target: 1.0`のみ。CONNECT-001はrevision `617801a9e66fe6ff30bfddc8c1e72a3c43c2a722`、002〜005は`53fc2a1441b890b5bcd904e6d9805453c8c833d1`。L3/L10 six-document full SHA valuesとAC/case境界は[L4 §1](../L4-basic-design/stage1-connect.md#1-固定source)、[L5 §1](../L5-detail-design/stage1-connect.md#1-固定sourceと対象)および[Stage 1 obligation crosswalk](../../governance/crosswalks/stage1-l3-l10-obligation-crosswalk.md)に固定される。

12 functional source cases: 001-01〜001-08、002-01、003-01、004-01、005-01。5 NFR candidates: CON-NFR-001〜005。L3 businessに独立business ACはなく、L10 business boundaryは共有negative oracle一つ。この範囲で参照する既存L9 verifierは18個である。L10 case IDはsource識別子、`IV-CONNECT-*`は既存L9が定義したverifier IDであり、L8ではfixtureに結び付けるだけで再定義・再採番しない。

## 2. 旧sourceから保持する検証形

[L5 §2](../L5-detail-design/stage1-connect.md#2-旧helixを起点とする保持再導出)に記録した5旧assetの原文・台帳rowを再利用区分の根拠とする。旧L3のfunctional/business/NFR分離とFR→AC→対の検証trace、旧phase pair構造、旧testのinput/normal/negative/evidence対応、旧NFRの測定対象trace形式のみを意味再導出する。package release固有のprofile/allowlist/promotion/authority、old gate、threshold、CLI、runtime、test/CIは採用・実行しない。5台帳rowは`unresolved`で`consumer_refs=[]`であり、consumerの存在・挙動を推定しない。

## 3. 既存L9 functional verifier 12件

各行は一つの固定L10 functional source caseを主対象とし、normal/boundaryを別の合成fixtureとして扱う。負例は指定された一入力軸だけを変異させ、他入力は固定親の正常契約に合わせる。

| 既存L9 verifier ID | 固定親 / L3 AC / L10 case | Fixtureと一点oracle | 失敗を返す責務owner |
|---|---|---|---|
| `IV-CONNECT-S1-001-01` | L2-001 / AC-001-01 / CASE-001-01 | normal: 両端ownerが宣言した一意descriptorと全revision/適用識別子を純粋に照合し、登録候補の適合結果を返す。実記録/receipt発行はこのfixture/APIで行わない。negatives: 必須endpoint/contract欠落、unknown、同一identityの異宣言、未登録revisionを別fixtureにしusableにしない。異identityのendpoint共有はnormal対照で許容。既定identity/別接続へfallbackせず、承認や許可を作らない。 | 欠落・矛盾したsource/consumer declaration owner。 |
| `IV-CONNECT-S1-001-02` | L2-001 / AC-001-01 / CASE-001-02 | 両端ownerが「このregistration-only scopeには適用識別子なし」と明示したnormal。登録は成立可能だがsend eligibilityを発行せずattempt 0。識別子なしから適用性を推定しない。 | declarationの範囲は両端owner。 |
| `IV-CONNECT-S1-001-03` | L2-001 / AC-001-01 / CASE-001-03 | 他入力を固定し、適用対象の既存SECURITY permit identifierだけmissing。descriptorをusableにしない。permission validityは評価しない。 | source/consumer宣言owner。 |
| `IV-CONNECT-S1-001-04` | L2-001 / AC-001-01 / CASE-001-04 | 他入力を固定し、適用対象の既存SECURITY permit identifierだけUnknown。usableへ昇格しない。 | source/consumer宣言owner。 |
| `IV-CONNECT-S1-001-05` | L2-001 / AC-001-01 / CASE-001-05 | 他入力を固定し、適用data-use identifierだけmissing。usableにしない。 | source/consumer宣言owner。 |
| `IV-CONNECT-S1-001-06` | L2-001 / AC-001-01 / CASE-001-06 | 他入力を固定し、適用data-use identifierだけUnknown。usableにしない。 | source/consumer宣言owner。 |
| `IV-CONNECT-S1-001-07` | L2-001 / AC-001-01 / CASE-001-07 | 他入力を固定し、適用classification identifierだけmissing。usableにしない。 | source/consumer宣言owner。 |
| `IV-CONNECT-S1-001-08` | L2-001 / AC-001-01 / CASE-001-08 | 他入力を固定し、適用classification identifierだけUnknown。usableにしない。 | source/consumer宣言owner。 |
| `IV-CONNECT-S1-002-01` | L2-002 / AC-002-01 / CASE-002-01 | normalで登録時/current endpoint、semantic contract、adapter/transport、compatibility range revisionsを別々に記録し宣言scope内で比較。四軸をそれぞれ単変異するとstaleとなり、再照合までsend 0。compatible receiptがない限り不一致/unknown/staleは送信可能にしない。read-only lookupは`send_eligibility=not_evaluated`、attempt 0。既存authority問題はcompatibility結果を変えず別判定。未登録/out-of-scope pairはunknown。 | 契約差は両endpoint owner、read-scopeはその既存owner、send authorityはSECURITY。 |
| `IV-CONNECT-S1-003-01` | L2-003 / AC-003-01 / CASE-003-01 | normalで二端点のtechnical receiptを同一connection/op/contract revision/compatibility refへ束縛。個別negative: connection/op/revision/scope/correlation/idempotency/result/dependency mismatch、contract外envelope、異connection混載、片端receipt欠落、必要handoff欠落、両端が宣言するschema refの片側欠落/不一致。各々successにせず観測地点・未完義務を保持。receipt/statusからbusiness completeを作らない。authority/data-use非肯定はsend 0。 | 契約差は両端owner、許可はSECURITY、受信業務結果はreceiver business owner。 |
| `IV-CONNECT-S1-004-01` | L2-004 / AC-004-01 / CASE-004-01 | normalを二分する。応答欠落と明示retryable技術failureを別fixtureにし、同一operation ID+digest+単一contract revisionで既存limit内だけretry候補、効果一回。negativeは異digest衝突、limit超過、business result、nonretryable failure、failure classification missing/unknown、expiry/authority不成立を個別に変異し追加attempt 0。retry assessment自体はsend effectを起こさない。 | attempt/unfinishedはconnection operation owner、business resultは元business owner、authority/expiryはSECURITY。 |
| `IV-CONNECT-S1-005-01` | L2-005 / AC-005-01 / CASE-005-01 | trace fixture: 合成された既存event refsと提案eventのregister/check/send/receive/attempt/retry/stale/exchange/rollback/deny/terminal順をconnection/op/revision/attemptで純粋に照合する。訂正は新eventの提案refとし、L8 fixtureは実append/writeしない。K5 writerによる永続化が別途観測できない場合、記録済みtraceとして扱わない。negative: 過去event上書き/削除/順序逆転、event/証拠field欠落、terminal/片端観測欠落、data-use identifier欠落/置換をそれぞれ与えUnknown/unfinishedのまま。合成raw-payload/secret/credential marker保存反例は値を証拠へ出さず不適合。未完の技術traceからbusiness resultを作らない。 | traceはoperation owner、data-use/authorityはsource/SECURITY owner。 |

### 3.1 NFR verifier 5件

| 既存L9 verifier ID | 固定L3候補 / L10 | 測定fixtureと期待oracle | 戻し先 |
|---|---|---|---|
| `IV-CONNECT-S1-NFR-001` | CON-NFR-001 / AC-004-01 | 契約が宣言したNだけ用い、initial attemptとretryを区別してN−1/N/N+1を計測。total attemptsの意味は契約宣言に従う。N+1 retry 0、same ID/digest effect once、異digest拒否。classification missing/unknownはretry 0。N未宣言なら未評価。 | connection operation/contract owner。 |
| `IV-CONNECT-S1-NFR-002` | CON-NFR-002 / AC-004-01 | 同じoperation ID+digestを重ねてもreceiver effect countは1、異digestはconflict・effect増分0。重複抑止未観測を成功にしない。 | connection operation owner。 |
| `IV-CONNECT-S1-NFR-003` | CON-NFR-003 / AC-002-01 | endpoint、semantic contract、adapter/transport、compatibility rangeを各単変異。registered/current revision差でstale、current compatible再照合前send count 0。read-only eligibilityはnot_evaluated。 | 契約owner、authority差はSECURITY。 |
| `IV-CONNECT-S1-NFR-004` | CON-NFR-004 / AC-005-01 | 各宣言eventとevidence fieldの観測・順序を突合し欠落/不明数を記録。欠落/順序不明をUnknown/unfinished。合成raw payload/secret/credential markerの通常trace/receipt保存・複製件数は各0。値自体を保存/表示しない。 | operation/trace producer owner、data-useはsource/SECURITY owner。 |
| `IV-CONNECT-S1-NFR-005` | CON-NFR-005 / AC-005-01 | contract-declared valueまたは根拠・比較・測定方法・境界を伴う候補について条件/provenance/measurementを照合。未宣言または根拠不足は未評価であり達成扱いしない。common latency/retention SLAは作らない。 | connection contract owner。 |

## 4. 既存L9 business境界 verifier 1件

| 既存L9 verifier ID | 固定source | Negative fixture / oracle | owner |
|---|---|---|---|
| `IV-CONNECT-S1-BIZ-001` | L3 business `001–005`、L10 business verification、§3の全functional source | 各technical registration/compatibility/send/receive/retry/trace resultだけを与え、business success、business approval、SECURITY許可、save-completeを出力するfixtureを不適合とする。正常oracleは両端business ownerへ結果をhandoffし、authorityはSECURITYへ留め、CONNECT側のbusiness ACを生成しない。 | 両端business owner。既存authority/data-useはSECURITY。 |

## 5. Kernel結合と検証結果の型

- K1/K2: fixtureの入力identity、revision、dependency refsを完全に束縛し、current key一致時だけ既存result classを返す。異revision/欠落入力をcompatible/completeへ読み替えない。
- K3: send/retryに既に適用される既存permissionを照合するだけ。permission outcomeとcompatibility outcomeは別fixture field/oracleで維持。
- K4/K5/K6: unfinished obligation、append-only evidence、receipt/provenanceを分けて見る。receipt presenceだけでissuer/source authenticity、operation execution、business outcomeを証明しない。
- K7: current revisionとattempt fencingを既存境界で比較。CONNECTのlogical revisionからOS assignment/current stateを作らない。
- K8: input label observationはその既存契約で扱い、physical route、authority、sendを推論しない。
- K9/K10: reviewer状態や依存closureはその既存意味のまま参照し、設計IDからreview/pass/completeを生成しない。

Logical route fixtureはconnection identity、direction、scope、owner-declared endpointsだけで構成する。Physical path/ref、SECURITY authority ref、OS assignment refは別軸にし、実到達性/作用を合成しても実通信証拠とは主張しない。未知はそのfixtureで影響するoperationだけnon-positiveとし、他の接続や全Stageへ広げない。

## 6. 測定candidateと保留

固定NFRの5候補以外に数値要件を追加しない。候補値は根拠付きの設計値候補であり、承認済み実装値/実測値とは異なる。CON-NFR-001のNやCON-NFR-005のlatency/retentionは親契約が値を宣言しない限り未評価。L8設計上その値の不在は別の親や接続へ波及させない。

次層が物理adapter/transport、外部接続方式、wire format/schema、保存方式、operation runtimeの具体化を必要とする場合、L5の論理境界を維持してL6へ責務を渡す。ここではその具体化、実作用、provider条件、permissionの追加を行わない。L8は全18 verifierを定義するが、実行・coverage・合格は未確認である。
