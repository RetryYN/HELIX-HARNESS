# HELIX-HARNESS 共通カーネル L8詳細検証設計（K1/K2）

status: draft
owner: HELIX-HARNESS
parent_requirement: なし（要素別にCommon Kernel L4 §2.1／§3.1の直接crosswalkへtrace。HARNESS-L2-031を親にしない）
paired_l5: ../L5-detail-design/common-kernel.md
base: main `6ea16b1f45121c3171943cfee7057bfdf08fefcd`

本書はK1/K2のL5公開契約とL9 fixture oracleを詳細fixtureへtraceする設計草稿である。契約はCommon Kernel L4の意味を保ち、期待値はPair L9を展開したものとする。K3〜K10は`not_designed`でL9の現行参照のみとする。以下のfixtureはすべて未実行であり、pass、実装完成、L10成立を示さない。

## 1. 固定入力とtrace

| 入力 | revision・scope | SHA-256 |
|---|---|---|
| Common Kernel L4 | PR base `6ea16b1f45121c3171943cfee7057bfdf08fefcd`を基準に本PRのcontent HEADへ含める本文pin：`docs/helix-harness/L4-basic-design/common-kernel.md` §2/§3 | `7ee3a2e4bb820538ceab0dbf2ff2e8e44bf7cb113012ec16aba7484e70b6388b` |
| Common Kernel L9 | PR base `6ea16b1f45121c3171943cfee7057bfdf08fefcd`を基準に本PRのcontent HEADへ含める本文pin：`docs/helix-harness/L9-integration-verification/common-kernel-integration-verification.md` §2 K1/K2 | `62617cee9af0bdc1efe253275ae97dea9b2368cd8ee77a818735c5f180e0ba1b` |
| paired L5 | 本PRのcontent HEADへ含める本文pin：`docs/helix-harness/L5-detail-design/common-kernel.md` §3/§4 | SHA-256 `046d42e6a91e888f14b56805677185ce3452b3d0472b871fb7d3a7bfbd48b079` |

L9の各`IV-K1-*`/`IV-K2-*`は上流fixture要件であり、この文書のcaseをその下位観測へ対応させる。直接のL3 parentはL4 crosswalkに限定する。K1 §2.1のdirect parentはHARNESS AC-HARNESS-L3-022-02/030-02/032-02/032-03、CONNECT CONNECT-AC-002-01/006-02、LABO LABO-001-AC-02、INFRA INFRA-001-AC-01、SECURITY SECURITY-AC-001-01、BRAIN BRAIN-008-AC-02。K2 §3.1のdirect parentはHARNESS AC-HARNESS-L3-010-01/010-03/022-05/030-04/031-05/032-04、CONNECT CONNECT-AC-002-01、LABO LABO-001-AC-02、BRAIN BRAIN-008-AC-02、OS AC-OS-014-02、INTELLIGENCE AC-INT-010-06。K1-I6からK2 §3.1のHARNESS 030-04/032-04への参照はkey境界のcontract linkとして別記し、K1のdirect parentへ加えない。case表のtrace欄はdirect parentと、必要な場合だけ明示したboundary linkを区別する。

HARNESS Stage 1 PO decisionはHARNESS L3/L10の本文revision `a77672513325aa9e79f3780af40455361b5d19a8`、親HARNESS-L2-010/011/023だけを承認対象とする。本書はその判断を他機構・他親へ転用しない。K1/K2それぞれの複数L3親関係はL4 crosswalkに従い、HARNESS-L2-031をまとめ親として新設しない。

## 2. fixtureの共通規約

- 各fixtureは原則として1個の独立したL5 API呼出しを観測し、正常基準から変える条件は一つとする。K1-05だけはL4がmapping欠落時の`Unknown(missing_input)`を要求するため、値型owner/callerのmapping解決境界で完全key付きUnknownを準備し、その値を既存`combine`へ渡す前処理traceも同一fixtureで観測する。元のdomain Valueを`combine`へ渡さない。L9が明示的に相互作用・複数記録をoracleとするcase（IV-K2-05、18–20等）はその既定構造を保ち、個別単独変異へ誤分割しない。
- 入力のref、記録、expected outputをケースfixture内に固定する。alias fixtureではowner current resolverの完全mapping bytes、binding ref、raw source bytesを別々に示す。テストデータの準備は期待値を変える追加条件にしない。
- 期待結果は型、class、reason、index、鍵差分または記録不変性で検査する。fixtureの成功から要求承認、実行許可、外部状態を導かない。
- Fixture IDはこの詳細pair内だけの識別子で、L9 IDを改番しない。各IDからL5 API・L4 invariant・L9 oracle・L3 crosswalkへ双方向に戻れることを確認する。波括弧を含むIDは、直後に記すsuffix展開規則に従って個別fixture IDへ展開し、1 IDにつき1条件だけを変える。
- case欄の`prefix-A/B/C`はsuffixごとに独立したIDを定義する展開記法（例:`L8-K1-07-REASON`, `L8-K1-07-AUTHORITY`, `L8-K1-07-REENTRY`）であり、斜線を含む一つのIDではない。各展開caseは一つの正常または一つの変異だけを持つ。 `L8-K1-08-ACCEPT-COMBINE-{CLASS}`は5クラス、`L8-K1-08-ACCEPT-RECORD-{CLASS}`と`L8-K1-08-LOOKUP-{CLASS}`はStaleを除く4クラス、`L8-K1-08-KEY-COMBINE-{CLASS}`は5クラスへ展開する。record key欠落とlookup query_key欠落は各1件であり、keyにclassの直積を掛けない。`L8-K1-11-MAP-{WORD}`はL4 §2.4写像表の各語ごと、`L8-K1-12-KEY-{FIELD}-{BOUNDARY}`は13 field×3境界、`L8-K1-13-KEY-{FIELD}`は13 fieldへ展開する。各展開IDは独立fixtureである。

## 3. K1 fixtures

合成・admit結果を対象にするcaseは実際に`combine`から`admit`へ進む。`disposition`、mapping解決、owner observation、display projection、key field受入など個別API境界caseはそのAPIの返却値または拒否を直接観測し、L9が後続合成を要求する場合だけ次のAPIへ進む。IV-K1-13はL9が明示する`Combined`直接入力の`admit`境界を別に検査する。

| L8 case | L9 oracle | L5 API / L4 contract | trace parent | Fixtureと単一変異、期待 |
|---|---|---|---|---|
| `L8-K1-01-N` | IV-K1-01 | `combine`, `admit`; K1-I1/I2 | AC-HARNESS-L3-030-02、CONNECT-AC-002-01/006-02 | CONNECT compatibleとHARNESS passをそれぞれowner polarityで与える。`Admitted`, `verdict=Positive`。 |
| `L8-K1-01-U` | IV-K1-01 | 同上 | 同上 | 基準のCONNECT component一つだけを`Unknown(incomparable)`へ替える。`Undetermined`、`Withheld`にそのindex/class/reason。 |
| `L8-K1-01-S` | IV-K1-01 | 同上 | 同上 | 基準の同一componentだけを`Stale`へ替える。`Undetermined`、`Withheld`にそのindex/class/reason。 |
| `L8-K1-01-UNOBSERVED` | IV-K1-01 | 同上 | 同上 | 基準の同一componentだけを`Unobserved(not_selected)`へ替える。`Undetermined`、`Withheld`にそのindex/class/reason。 |
| `L8-K1-02` | IV-K1-02 | `combine`, `admit`; K1-I3 | AC-HARNESS-L3-030-02、CONNECT-AC-002-01 | L9の2成分を固定し、`Negative`、両componentを順序保持、negative/non-value indexと2 reasonsを全て返す。期待は相互作用oracleで、片方を単独に削らない。 |
| `L8-K1-03` | IV-K1-03 | 同上 | AC-HARNESS-L3-032-02/03、LABO-001-AC-02 | L9のValue+Unknown+Unobserved+Stale基準で全non-valueを保持し`Undetermined`。各classのindex/reasonを検査する。 |
| `L8-K1-04-P` | IV-K1-04 | `combine`, `admit`; K1-I2/I3 | AC-HARNESS-L3-022-02、SECURITY-AC-001-01 | 3 positive valueで`Admitted`。 |
| `L8-K1-04-N` | IV-K1-04 | 同上 | 同上 | 基準の2成分目のValueだけをpositiveからnegativeに替える。`Negative`、1件のnonempty reason。 |
| `L8-K1-05` | IV-K1-05 | owner/caller mapping resolution → `combine`; polarity ownership | CONNECT-AC-002-01、AC-HARNESS-L3-022-02 | 正常: owner/callerは各値型のmappingを解決してObservedを`combine`へ渡す。変異: 対象値型のmappingだけ解決不能にし、owner/callerが元のValueを渡さず、同Valueの完全keyを持つ既存`Unknown(missing_input)`を作って`combine`へ渡す。Combinedはその位置をnon-value indexに含め`Undetermined`。kernel内のdomain語推測は不合格。 |
| `L8-K1-06a` | IV-K1-06 | `combine`, `admit`; K1-I4 | AC-HARNESS-L3-032-03、LABO-001-AC-02 | 基準は1 positive required component。変異はcomponent listを空にするだけ。`Undetermined`, `set_reason=Unknown(missing_input)`, whole reason 1件。 |
| `L8-K1-06b` | IV-K1-06 | 同上 | 同上 | 基準から全成分をvalid NotApplicable 1件だけに置換。判定成分0として同じ期待。 |
| `L8-K1-06c` | IV-K1-06 | 同上 | 同上 | 基準から全成分をvalid NotApplicable 3件だけに置換。判定成分0として同じ期待。 |
| `L8-K1-07-REASON/AUTHORITY/REENTRY` | IV-K1-07 | `disposition`, `combine`; K1-I5 | direct: AC-HARNESS-L3-032-02、INFRA-001-AC-01 | 3つの個別fixture: reason、authority、reentry_triggerのうち一つずつ欠落。各々`Unknown(invalid_disposition)`でnon-value。3変異を一つのfixtureへ混在させない。 |
| `L8-K1-08-ACCEPT-COMBINE-{CLASS}` | IV-K1-08 | `combine`; K1-I6/K2-I6 | direct: BRAIN-008-AC-02; boundary: K2 §3.1 AC-HARNESS-L3-030-04 | CLASS=Value/Unknown/Unobserved/NotApplicable/Stale。各完全key付き成分をcombineが受理する5独立fixture。 |
| `L8-K1-08-ACCEPT-RECORD-{CLASS}` | IV-K1-08 | `record`; K1-I6/K2-I6 | direct: BRAIN-008-AC-02; boundary: K2 §3.1 AC-HARNESS-L3-030-04 | CLASS=Value/Unknown/Unobserved/NotApplicable。各完全keyとresultをrecordが受理する4独立fixture。 |
| `L8-K1-08-LOOKUP-{CLASS}` | IV-K1-08 | `lookup`; K1-I6/K2-I6 | direct: BRAIN-008-AC-02; boundary: K2 §3.1 AC-HARNESS-L3-030-04 | CLASS=Value/Unknown/Unobserved/NotApplicable。完全一致keyの保存recordからlookupが同classを返す4独立fixture。 |
| `L8-K1-08-STALE-LOOKUP` | IV-K1-08 / IV-K2-02 | `lookup`; K2-I2b | direct: BRAIN-008-AC-02; boundary: K2 §3.1 AC-HARNESS-L3-030-04 | 完全keyの旧revision Value recordだけを置きcurrent queryでlookupする。返却値としてStaleを導出する。Staleをlookup入力に渡さない。 |
| `L8-K1-08-STALE-RECORD` | IV-K1-08 / IV-K2-11 | `record`; K1-I6/K2-I4 | direct: BRAIN-008-AC-02; boundary: K2 §3.1 AC-HARNESS-L3-030-04 | 完全keyのrecord result classだけをStaleにする。`Rejected(stale_not_recordable)`。 |
| `L8-K1-08-KEY-COMBINE-{CLASS}` | IV-K1-08 | `combine`; K1-I6 | direct: BRAIN-008-AC-02 | CLASS=Value/Unknown/Unobserved/NotApplicable/Staleの各成分から鍵全体だけを欠かせる5独立fixture。`Rejected(missing_key)`。 |
| `L8-K1-08-KEY-RECORD` | IV-K1-08 | `record`; K2-I6 | boundary: K2 §3.1 AC-HARNESS-L3-030-04 | 非StaleのValue resultを保持しrecord.keyだけを欠かせ、`Rejected(missing_key)`。 |
| `L8-K1-08-KEY-LOOKUP` | IV-K1-08 | `lookup`; K2-I6 | boundary: K2 §3.1 AC-HARNESS-L3-030-04 | 完全record集合を保持しlookup.query_keyだけを欠かせ、`Rejected(missing_key)`。 |
| `L8-K1-09-COMPLETE` | IV-K1-09 | owner observation→`Observed`; K1-I7 | AC-HARNESS-L3-022-02、INFRA-001-AC-01 | complete-scan evidence付き0件を与え、`Value`（0件）を返す。 |
| `L8-K1-09-PARTIAL` | IV-K1-09 | owner observation→`Observed`; K1-I7 | 同上 | 走査範囲だけをpartialにする。`Value`（0件）を返さない。 |
| `L8-K1-09-READ-FAIL` | IV-K1-09 | owner observation→`Observed`; K1-I7 | 同上 | complete-scan evidenceを持つ基準から読取結果だけを失敗へ変える。`Value`（0件）を返さない。 |
| `L8-K1-10` | IV-K1-10 | display projection→`combine`; K1-I8 | AC-HARNESS-L3-030-02、SECURITY-AC-001-01 | 宣言済み表示projectionの正常表示を基準とする。変異はその省略projectionを判定APIの入力に接続する。受理しない。 |
| `L8-K1-11-MAP-{WORD}` | IV-K1-11 | mechanism mapping→`Observed`; §2.4 mapping table | CONNECT-AC-002-01、LABO-001-AC-02 | `{WORD}`はL4 §2.4の写像表の各語へ展開する。各fixtureは対象語一つだけを入力し、表で指定されたclassを返す。 |
| `L8-K1-11-WRONG-MISMATCH` | IV-K1-11 | mechanism mapping→`Observed`; §2.4 mapping table | 同上 | `mismatch`一語の写像だけを`Unknown`に誤る。期待する否定の`Value`と異なるため不合格。 |
| `L8-K1-11-WRONG-INCOMPATIBLE` | IV-K1-11 | mechanism mapping→`Observed`; §2.4 mapping table | 同上 | `incompatible`一語の写像だけを`Unknown`に誤る。期待する否定の`Value`と異なるため不合格。 |
| `L8-K1-11-WRONG-NOT-OBSERVED` | IV-K1-11 | mechanism mapping→`Observed`; §2.4 mapping table | 同上 | `not_observed`一語の写像だけを`Value`に誤る。期待する`Unobserved`と異なるため不合格。 |
| `L8-K1-11-UNREGISTERED` | IV-K1-11 | mechanism mapping→`Observed`; §2.4 mapping table | 同上 | 写像表にない語一つを入力し、`Unknown(unsupported)`を返す。 |
| `L8-K1-12-KEY-{FIELD}-{BOUNDARY}` | IV-K1-12 | `combine`, `record`, `lookup`; K1-I6 | direct: BRAIN-008-AC-02; boundary: K2 §3.1 AC-HARNESS-L3-030-04 | `{FIELD}`はResultKeyの5 field、subject refの4 field、input refの4 fieldを各一つずつ、`{BOUNDARY}`はcombine/record/lookupへ展開する。全39個の個別fixtureで指定field一つだけを欠き、`Rejected(missing_key)`。 |
| `L8-K1-13-KEY-WHOLE` | IV-K1-13 | `admit`; K1-I6 | direct: BRAIN-008-AC-02; boundary: K2 §3.1 AC-HARNESS-L3-030-04 | positive宣言のCombinedからcomponent key全体だけを欠かせ、`Rejected(missing_key)`を返す。`Admitted`/通常Withheldへ変換しない。 |
| `L8-K1-13-KEY-{FIELD}` | IV-K1-13 | `admit`; K1-I6 | 同上 | `{FIELD}`はIV-K1-12と同じ13 fieldへ展開する。各fixtureでcomponent keyの指定field一つだけを欠かせ、`Rejected(missing_key)`を返す。`Admitted`/通常Withheldへ変換しない。 |

K1逆trace: L5 K1-I1–I8の各API clauseは上表のL9 IDで検証される。L9 IV-K1-01–13はこの節のcaseへ一つ以上戻り、各caseは上記direct L3 parent ACとL4 §2 crosswalkを介して要求意味に戻る。boundary linkはK2 key contractへの接続であり、K1の別親要求ではない。

## 4. K2 fixtures

K2 expected classはL4 §3.3–3.4のlookup優先順と、L4 §3.4.1 alias binding boundaryに従う。Record fixtureはpure API inputであり、物理log write/read fixtureではない。

| L8 case | L9 oracle | L5 API / L4 contract | trace parent | Fixtureと単一変異、期待 |
|---|---|---|---|---|
| `L8-K2-01-V/U/N/A` | IV-K2-01 | `lookup`; K2-I1 | AC-HARNESS-L3-030-04、LABO-001-AC-02 | 完全一致したValue/Unknown/Unobserved/NotApplicableを4独立正常fixtureで同class返却。 |
| `L8-K2-02-S/O/C/D` | IV-K2-02 | `lookup`; K2-I2/I2b | AC-HARNESS-L3-010-01、CONNECT-AC-002-01 | subject/oracle/contract/config各々の一つのSubjectRefについて、revision+digestを新revision参照へ更新。他field固定、old Valueは`Stale`で差分fieldだけ変化。 |
| `L8-K2-03-U/N/A` | IV-K2-03 | `lookup`; K2-I2b | LABO-001-AC-02、AC-HARNESS-L3-032-04 | 旧記録class Unknown/Unobserved/NotApplicableごとの独立fixtureで対象subject revisionだけ更新。`Unobserved(not_run, superseded=old key)`。 |
| `L8-K2-04-S/O/C/D` | IV-K2-04 | `lookup`; K2-I2(2) | BRAIN-008-AC-02、AC-HARNESS-L3-030-04 | subject/oracle/contract/configのdigestだけを個別変更しrevisionは固定。各々`Unknown(conflict)`。 |
| `L8-K2-05` | IV-K2-05 | `lookup`; K2-I2 precedence | BRAIN-008-AC-02 | L9の2入力相互作用をそのまま固定: 1入力は同revision digest差、別入力はrevision差。`Unknown(conflict)`がstaleより優先。これは意図的な複合precedence oracle。 |
| `L8-K2-06` | IV-K2-06 | `lookup`; K2-I3 | CONNECT-AC-002-01、AC-HARNESS-L3-030-04 | digest固定でrevisionだけを新しくする。旧Valueに対し`Stale`、Value再利用は不合格。 |
| `L8-K2-07` | IV-K2-07 | `lookup`; K2-I3 | AC-HARNESS-L3-030-04 | 空白のみ変えた本文を別revisionとして扱う。旧Valueは`Stale`。意味差判定でbackdateしない。 |
| `L8-K2-08-op/ver/scope` | IV-K2-08 | `lookup`; K2-I2(1) | AC-HARNESS-L3-010-03、AC-INT-010-06 | `operation`、`operation_version`、`scope`をそれぞれ一つだけ変更する3 fixture。記録候補なし`Unobserved(not_run)`。 |
| `L8-K2-09-add/del` | IV-K2-09 | `lookup`; K2-I2(1) | AC-HARNESS-L3-010-01/03 | inputs identity集合に1件追加または1件削除する別fixture。各々`Unobserved(not_run)`。 |
| `L8-K2-10` | IV-K2-10 | `lookup`; K2-I2 | AC-HARNESS-L3-030-04 | stale前後のrecord bytesを同一に固定。query結果はStaleだがrecordは不変。 |
| `L8-K2-11-NOOP` | IV-K2-11 | `record`; K2-I4 | direct: AC-HARNESS-L3-010-01; boundary: K5 §9.3 record/event | 同key/resultを2回recordし2回目`NoOp`。K2-I4の記録意味をK5 eventへ接続するcase。 |
| `L8-K2-11-CONFLICT` | IV-K2-11 | `record`, `lookup`; K2-I4 | direct: AC-HARNESS-L3-010-01; boundary: K5 §9.3 record/event | 同key・別resultを2回目recordし、各resultのdigestを内容から求める。`Conflict`、双方保持、lookup `Unknown(conflict)`。 |
| `L8-K2-11-STALE` | IV-K2-11 | `record`; K2-I4 | direct: AC-HARNESS-L3-010-01; boundary: K5 §9.3 record/event | record入力のresult classだけをStaleへ変更。`Rejected(stale_not_recordable)`。 |
| `L8-K2-12` | IV-K2-12 | `lookup`; K2-I5 | BRAIN-008-AC-02、AC-HARNESS-L3-010-03 | 照会revision Rに対し同identity R2のValueだけを記録。R2の値をRへ返さない。 |
| `L8-K2-13-VALID` | IV-K2-13 | `key_of`; K2-I6 | AC-OS-014-02、AC-INT-010-06 | `sha256:` prefix付き64 lowercase hexをDigestとして受け入れる。 |
| `L8-K2-13-NO-PREFIX` | IV-K2-13 | `key_of`; K2-I6 | 同上 | 正常なDigestのprefixだけを除き、他fieldを固定する。`Rejected(invalid_digest)`。 |
| `L8-K2-13-SHORT` | IV-K2-13a | `key_of`; K2-I6 | 同上 | 正常な`subject.digest`のhex部分だけを64桁から63桁へ短縮する。`Rejected(invalid_digest)`。 |
| `L8-K2-13-GIT-REVISION` | IV-K2-13b | `key_of`; K2-I6 | 同上 | Digest fieldだけを40 lowercase hexの`GitRevision`値へ置き換える。`Rejected(invalid_digest)`。 |
| `L8-K2-14` | IV-K2-14 | `key_of`, `lookup`; K2-I7 | AC-HARNESS-L3-010-03、AC-OS-014-02 | pack版だけを更新したkeyでrelease unit/integrated product/stage版を不変に保つ。pack更新から他版を昇格させる出力は不合格。 |
| `L8-K2-15-ORDER` | IV-K2-15 | `key_of`; input canonicalization | AC-HARNESS-L3-010-01 | inputs順だけを変えた2 keyのKeyDigest一致。 |
| `L8-K2-15-DUP` | IV-K2-15 | `key_of`; input canonicalization | 同上 | 正常なDigestを持つinput refを基準に、そのrefと同じidentityのref一件だけを`inputs`へ複製する。`Rejected(duplicate_identity)`。 |
| `L8-K2-16-subject-kind/input-kind` | IV-K2-16 | `lookup`; K2-I2(2b) | BRAIN-008-AC-02 | subject.kindだけ変更、input.kindだけ変更を別fixtureにする。各々`Unknown(conflict)`。 |
| `L8-K2-17-subject-id/input-id` | IV-K2-17 | `lookup`; K2-I2(1) | AC-HARNESS-L3-010-01、AC-INT-010-06 | subject.identityだけ変更、input identity置換だけを別fixtureにする。各々候補なし`Unobserved(not_run)`。 |
| `L8-K2-18-OLD-VALUE` | IV-K2-18 | `lookup`; K2-I2(3) | AC-HARNESS-L3-030-04 | 旧R1のValueと照会一致R2のValueを記録し、R2のValueを返す。 |
| `L8-K2-18-OLD-UNKNOWN` | IV-K2-18 | `lookup`; K2-I2(3) | 同上 | 旧R1のUnknownと照会一致R2のValueを記録し、R2のValueを返す。 |
| `L8-K2-19` | IV-K2-19 | `lookup`; K2-I2(2) precedence | BRAIN-008-AC-02 | 完全一致Valueにsame identity/revision異digest記録を追加。単一追加recordによる競合で`Unknown(conflict)`。 |
| `L8-K2-20-value/nonvalue` | IV-K2-20 | `lookup`; K2-I2(4)/I2b | AC-HARNESS-L3-030-04、LABO-001-AC-02 | 旧R0/R1の複数記録、query R2。Value variantは追記順最後をStale prior。別variantは最後の旧記録classをUnknownにし、superseded付きUnobserved。 |
| `L8-K2-21-P` | IV-K2-21 | owner alias binding→`key_of`/K6 read identity; §3.4.1 | AC-HARNESS-L3-010-01/03、AC-OS-014-02、BRAIN-008-AC-02 | 2 role/side aliasに同じraw identity・別revisionを持たせる正常fixture。各aliasのdigestは各source bytesと一致し、両mappingを含むbinding bytes/refをkeyに含める。双方が別aliasとして共存し、read identityはsubject+non-verifier inputs集合に一致する。 |
| `L8-K2-21-DEDUP` | IV-K2-21 | alias normalization→`key_of`; §3.4.1 | 同上 | 同一aliasのraw ref全field完全一致の重複だけを追加し、key構築前にdeduplicateする。 |
| `L8-K2-21-CROSS-ROLE` | IV-K2-21 | alias normalization→`key_of`; §3.4.1 | 同上 | raw identityが一致する異なるrole/side aliasを一つだけ追加する。別aliasをK2 duplicate identityとして拒否せず、各alias identityでsourceを観測する。 |
| `L8-K2-21a` | IV-K2-21a | `key_of`; §3.4.1 | AC-HARNESS-L3-010-01/03、AC-OS-014-02 | 完全current owner binding+alias集合を基準としrequired binding refだけ欠落。`Rejected(missing_key)`。 |
| `L8-K2-21b` | IV-K2-21b | alias normalization→`key_of`; §3.4.1 | AC-HARNESS-L3-010-01/03、BRAIN-008-AC-02 | 同一alias identityへ異revision（他field固定）のraw refを一つ追加。`Rejected(missing_key)`。同alias完全一致重複dedupは正常側。 |
| `L8-K2-21c` | IV-K2-21c | K6 source-read observation; §3.4.1 | AC-HARNESS-L3-010-01、AC-OS-014-02 | binding ref/mappingは正常のまま、1 aliasのsource bytesだけがraw digestと不一致。期待K6 `Unknown(conflict)`。 |
| `L8-K2-21d-K3` | IV-K2-21d | alias revision→`lookup`; §3.4.1 | AC-HARNESS-L3-010-01/03 | K3 ownerの決定的revision規則の下、raw source revisionを一つ更新し、その更新に従うbytes/digest/bindingを供給。lookup `Stale`。 |
| `L8-K2-21d-K8/K9` | IV-K2-21d | alias revision→`lookup`; §3.4.1 | AC-HARNESS-L3-010-01/03、AC-OS-014-02 | 各owner-record revisionを一つ更新する独立fixture。その他同じでlookup `Stale`。 |

K2逆trace: L5 `key_of`, `lookup`, `record`, alias binding clausesは表のL9 IDsに対応する。IV-K2-01–21d（IV-K2-13a/bを含む）の各oracleからfixtureへ、さらにL5 API / K2-I invariantへ戻れる。L3 parentはこのpairの先頭に列挙したL4 §3.1 crosswalk要素に限る。

## 5. K3–K10と未実施範囲

K2 `key_of`拒否の返却型と順序はL4/L9で確定しており、L5 `KeyOfResult`へ対応する。Digest形式の不正は`Rejected(invalid_digest)`、inputs内identity重複は`Rejected(duplicate_identity)`であり、どちらもK1 `Unknown`ではない。K1 `ApiBoundaryResult<T>`、`UnknownReason`、`record`の返却unionは変更しない。

K3–K10はこのpairで`not_designed`。詳細API・fixtureを定義せず、L4本体§4–11、所有者補足§14（K10）、§15（K7）、§16（K3）、§17（K9）、§18（K8）およびL9の対応IV（K3 IV-K3-01–17とIV-K3-14a–j、K4 IV-K4-01–10、K5 IV-K5-01–26、K6 IV-K6-01–15、K7 IV-K7-01–15、K8 IV-K8-01–26、K9 IV-K9-01–15、K10 IV-K10-01–14）へ戻す。K1/K2 fixtureからK3–K10の実装・実行・合格を推測しない。

検証したのは文書内traceとfixture期待の静的整合のみである。fixture runner、旧HELIX test/CI、runtime、外部provider、永続化writerは起動していない。fixtureの実行結果、性能値、環境依存値、L10合格は未確認であり、本書はそれらを主張しない。
