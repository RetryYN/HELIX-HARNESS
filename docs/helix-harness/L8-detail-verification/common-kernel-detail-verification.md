# HELIX-HARNESS 共通カーネル L8詳細検証設計（K1/K2/K3/K5）

status: draft
owner: HELIX-HARNESS
parent_requirement: なし（要素別にCommon Kernel L4 §2.1／§3.1／§9.2／§16.1の直接crosswalkへtrace。HARNESS-L2-031を親にしない）
paired_l5: ../L5-detail-design/common-kernel.md
base: main `79f7c7186c4fa4bd7060b8991a26a1cf5676ab40`

本書はK1/K2/K3/K5のL5公開契約とL9 fixture oracleを詳細fixtureへtraceする設計草稿である。契約はCommon Kernel L4の意味を保ち、期待値はPair L9の既存項目を展開したものとする。K4/K6〜K10は`not_designed`でL9の現行参照のみとする。以下のfixtureはすべて未実行であり、pass、実装完成、L10成立を示さない。

## 1. 固定入力とtrace

| 入力 | revision・scope | SHA-256 |
|---|---|---|
| Common Kernel L4 | main `79f7c7186c4fa4bd7060b8991a26a1cf5676ab40`の本文pin：`docs/helix-harness/L4-basic-design/common-kernel.md` §2/§3/§9/§16 | `3f7245e8fb548bab199107b1a020f0efea08713a5299076988326dae9feeb696` |
| Repository Layout L4 | main `79f7c7186c4fa4bd7060b8991a26a1cf5676ab40`の本文pin：`docs/helix-harness/L4-basic-design/repository-layout.md` §2–3、RL-C/D/T/K、§6.1/§10 | `6968876dad1760257686108064520e1e98783b6034ca19bac7d6c7df1a3385f1` |
| Common Kernel L9 | main `79f7c7186c4fa4bd7060b8991a26a1cf5676ab40`の本文pin：`docs/helix-harness/L9-integration-verification/common-kernel-integration-verification.md` K1/K2、IV-K3全27識別子、IV-K5-01–26、IV-K7/IV-LDG関連行 | `77f81138f3e323d98c16c7ea6c3be38e66d2aa36fc5a6b79986b6826e3facf52` |
| paired L5 | current main `b6463f2b9baa7df72703758f4e02afff9cbfac78`の本文pin：`docs/helix-harness/L5-detail-design/common-kernel.md` §3/§4/§6/§7 | SHA-256 `ff24f1c74d17e3e5ed4aaedfc8163018891df6785de59e2de4fac3c33edf8ef4` |
| Paired L7 | `docs/helix-harness/L7-unit-test-design/common-kernel-unit-test-design.md`; content SHA-256 `f1f9c64d6a068e54b0fb743cb669a6f0d43bacea8c1fda6ff7c30e6123c1d239` (本PRのcontent HEAD) | L7 suite IDs and function mapping |

L9の各`IV-K1-*`/`IV-K2-*`/`IV-K3-*`/`IV-K5-*`は上流fixture要件であり、この文書のcaseをその下位観測へ対応させる。直接のL3 parentはL4 crosswalkに限定する。K1 §2.1のdirect parentはHARNESS AC-HARNESS-L3-022-02/030-02/032-02/032-03、CONNECT CONNECT-AC-002-01/006-02、LABO LABO-001-AC-02、INFRA INFRA-001-AC-01、SECURITY SECURITY-AC-001-01、BRAIN BRAIN-008-AC-02。K2 §3.1のdirect parentはHARNESS AC-HARNESS-L3-010-01/010-03/022-05/030-04/031-05/032-04、CONNECT CONNECT-AC-002-01、LABO LABO-001-AC-02、BRAIN BRAIN-008-AC-02、OS AC-OS-014-02、INTELLIGENCE AC-INT-010-06。K1-I6からK2 §3.1のHARNESS 030-04/032-04への参照はkey境界のcontract linkとして別記し、K1のdirect parentへ加えない。case表のtrace欄はdirect parentと、必要な場合だけ明示したboundary linkを区別する。 K5 §9.2の直接由来はConcept、CONNECT-AC-005-01、INTELLIGENCE-078-06/078-04/INT-063-03、LABO-001-AC-02/002-AC-03/050-AC-02、HARNESS-024-05に限る。K3の直接L3 traceはL4 §16.1のSECURITY ACに限定し、OS-014-04/-06はK7との境界参照のまま扱う。K5を共通kernelとして配置すること自体から、単一親要求やHARNESS-L2-031を追加しない。

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
| `L8-K1-01-U` | IV-K1-01 | `combine`, `admit`; K1-I1/I2 | 同上 | 基準のCONNECT component一つだけを`Unknown(incomparable)`へ替える。`Undetermined`、`Withheld`にそのindex/class/reason。 |
| `L8-K1-01-S` | IV-K1-01 | `combine`, `admit`; K1-I1/I2 | 同上 | 基準の同一componentだけを`Stale`へ替える。`Undetermined`、`Withheld`にそのindex/class/reason。 |
| `L8-K1-01-UNOBSERVED` | IV-K1-01 | `combine`, `admit`; K1-I1/I2 | 同上 | 基準の同一componentだけを`Unobserved(not_selected)`へ替える。`Undetermined`、`Withheld`にそのindex/class/reason。 |
| `L8-K1-02` | IV-K1-02 | `combine`, `admit`; K1-I3 | AC-HARNESS-L3-030-02、CONNECT-AC-002-01 | L9の2成分を固定し、`Negative`、両componentを順序保持、negative/non-value indexと2 reasonsを全て返す。期待は相互作用oracleで、片方を単独に削らない。 |
| `L8-K1-03` | IV-K1-03 | `combine`, `admit`; K1-I3 | AC-HARNESS-L3-032-02/03、LABO-001-AC-02 | L9のValue+Unknown+Unobserved+Stale基準で全non-valueを保持し`Undetermined`。各classのindex/reasonを検査する。 |
| `L8-K1-04-P` | IV-K1-04 | `combine`, `admit`; K1-I2/I3 | AC-HARNESS-L3-022-02、SECURITY-AC-001-01 | 3 positive valueで`Admitted`。 |
| `L8-K1-04-N` | IV-K1-04 | `combine`, `admit`; K1-I2/I3 | 同上 | 基準の2成分目のValueだけをpositiveからnegativeに替える。`Negative`、1件のnonempty reason。 |
| `L8-K1-05` | IV-K1-05 | owner/caller mapping resolution → `combine`; polarity ownership | CONNECT-AC-002-01、AC-HARNESS-L3-022-02 | 正常: owner/callerは各値型のmappingを解決してObservedを`combine`へ渡す。変異: 対象値型のmappingだけ解決不能にし、owner/callerが元のValueを渡さず、同Valueの完全keyを持つ既存`Unknown(missing_input)`を作って`combine`へ渡す。Combinedはその位置をnon-value indexに含め`Undetermined`。kernel内のdomain語推測は不合格。 |
| `L8-K1-06a` | IV-K1-06 | `combine`, `admit`; K1-I4 | AC-HARNESS-L3-032-03、LABO-001-AC-02 | 基準は1 positive required component。変異はcomponent listを空にするだけ。`Undetermined`, `set_reason=Unknown(missing_input)`, whole reason 1件。set_reasonはclass/reasonだけの集合診断であり、components追加・key生成・成分key流用はない。 |
| `L8-K1-06b` | IV-K1-06 | `combine`, `admit`; K1-I4 | 同上 | 基準から全成分をvalid NotApplicable 1件だけに置換。判定成分0として06aと同じ集合診断。N/A keyを集合診断へ流用しない。 |
| `L8-K1-06c` | IV-K1-06 | `combine`, `admit`; K1-I4 | 同上 | 基準から全成分をvalid NotApplicable 3件だけに置換。判定成分0として06aと同じ集合診断。N/A keyを集合診断へ流用しない。 |
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

K3とK5のfixtureはL4/L9が定める既存oracleを個別caseへ展開する。各caseは未実行であり、L5/L8の設計だけから実装passや物理writer enforcementを主張しない。K4/K6〜K10はこのpairで`not_designed`で、既存L4/L9の該当契約へ戻す。K3の直接L3 traceはL4 §16.1のSECURITY ACに限り、OS-014-04/-06はK7境界参照のまま扱う。K5のwriter/assignment接続は既存K7/K5/Ledger oracleを再利用し、初回bootstrapを新設しない。

### 5.1 K3 fixtures

K3ケースの直接L3 traceはL4 §16.1のSECURITY ACだけに限定し、OS-014-04/-06はK7との境界列へ分ける。L9のK3識別子は原文で27件（IV-K3-01–17とIV-K3-14a–j）あり、以下で全件を列挙する。IDの範囲・波括弧は直後の展開規則に従う個別fixtureを表し、L9 ID自体を改番しない。各変異fixtureは同じ節の明示した正常基準IDから一条件だけを変える。複数の異なる反例がL9に列挙される場合は、同一L9 oracleに複数の独立L8 caseを対応させる。scope、selector、required-inputの概要説明は直後の具体的case行と一意展開一覧へ統合し、重複する未展開templateをfixture definitionとして数えない。

| L8 case | L9 oracle | L5 API / L4 contract | direct L3 AC | 別契約境界 | Fixtureと単一変異、期待 |
|---|---|---|---|---|---|
| `L8-K3-01-BASE` | IV-K3-01 | `resolve_authority_context`, `check_permission`; K3-I1/I2 | SECURITY-AC-008-01 | — | current assignment・target/revision・environment・scopeが一致する基準を用意し、7軸それぞれの状態を保持する。 |
| `L8-K3-01-SCOPE-PROJECT` | IV-K3-01 | `check_permission`; K3-I1 | SECURITY-AC-008-01 | scope owner | project scopeだけを越境させ、他fieldを固定し`Value(Negative)`。 |
| `L8-K3-01-SCOPE-ENVIRONMENT` | IV-K3-01 | `check_permission`; K3-I1 | SECURITY-AC-008-01 | scope owner | environment scopeだけを越境させ、他fieldを固定し`Value(Negative)`。 |
| `L8-K3-01-SCOPE-WORKTREE` | IV-K3-01 | `check_permission`; K3-I1 | SECURITY-AC-008-01 | scope owner | worktree scopeだけを越境させ、他fieldを固定し`Value(Negative)`。 |
| `L8-K3-01-SCOPE-TENANT` | IV-K3-01 | `check_permission`; K3-I1 | SECURITY-AC-008-01 | scope owner | tenant scopeが既存にあるfixtureだけでtenant identityを越境させ、他fieldを固定し`Value(Negative)`。tenantのない環境へtenantを追加しない。 |
| `L8-K3-01-{AXIS}-{STATE}` | IV-K3-01 | 同上 | SECURITY-AC-008-01 | — | AXISの欠落またはunknownは`Unknown(missing_input)`、確定競合は`Unknown(conflict)`、確定不一致は`Value(Negative)`。source読取失敗はこの軸状態templateへ含めない。AXIS×STATEを一条件ずつ変える。 |
| `L8-K3-01-ASSIGNMENT` | IV-K3-01 | `resolve_authority_context`; K3-I1/I2 | SECURITY-AC-008-01 | OS assignment owner | owner current assignmentのactorだけをBへ変更し、query/contextはAに固定する。期待は`Value(Negative)`。 |
| `L8-K3-01-OWNER-{STATE}` | IV-K3-01 | `resolve_authority_context`; K3-I1/I2 | SECURITY-AC-008-01 | target/assignment owner | `{STATE}`=MISSING/UNREGISTERED/CONFLICTの各fixtureで、対応する`Unknown(missing_input)`/`Unknown(unregistered)`/`Unknown(conflict)`を返す。 |
| `L8-K3-01-KEY-MISSING` | IV-K3-01 | `resolve_authority_context`; K3-I1 | SECURITY-AC-008-01 | K2 key boundary | 必須identity/refを一つ欠き、既存`PermissionCheckDiagnostic(missing_key)`。K1/K2結果へ写さない。 |
| `L8-K3-02-ALLOW-{OP}` | IV-K3-02 | `check_permission`; K3-I2 | SECURITY-AC-008-01 | — | OPはL4の11 operation値それぞれへ展開。queryとrecordの同一operationだけを許可する11基準fixtureでありIV-K3-02のPositive control。 |
| `L8-K3-02-READ-AS-{OP}` | IV-K3-02 | `check_permission`; K3-I2 | SECURITY-AC-008-01 | — | read基準からoperationだけを他の10値へ一つずつ置換し拒否。Agent利用権のみからwrite/deployを導かない。 |
| `L8-K3-03-BASE` | IV-K3-03 | `check_permission`; K3-I2 | SECURITY-AC-008-01 | — | current sourceとPermissionRecordのrevisionが一致するfresh checkは`Value(Positive)`。 |
| `L8-K3-03-FRESH-REVISION` | IV-K3-03 | `check_permission`; K3-I2 | SECURITY-AC-008-01 | — | `L8-K3-03-BASE`からcurrent source revisionだけを更新し、fresh checkの確定revision不一致を`Value(Negative)`として返す。 |
| `L8-K3-03-LOOKUP-STALE` | IV-K3-03 | K2 `lookup`; K3-I4 | SECURITY-AC-008-01 | K2 lookup | 保存済みcheckのkeyだけ旧revisionにし、lookupは`Stale`を返す。fresh checkの不一致をStaleへ写さない。 |
| `L8-K3-03-DIGEST` | IV-K3-03 | K2 `lookup`; K3-I4 | SECURITY-AC-008-01 | K2 lookup | 同一identity/revisionのdigestだけを変更し`Unknown(conflict)`。 |
| `L8-K3-03-IDENTITY` | IV-K3-03 | K2 `lookup`; K3-I4 | SECURITY-AC-008-01 | K2 lookup | source identityだけを変更し別のinputs identity集合にする。該当keyのrecordが無いため`Unobserved(not_run)`。 |
| `L8-K3-04-BASE` | IV-K3-04 | `resolve_current_effective_decision`, `check_permission`; K3-I3 | SECURITY-AC-022-01 | source adapter/K6 | 登録source原記録から一意なcurrent allowを解決し、全binding一致なら`Value(Positive)`。 |
| `L8-K3-04-SELF-ISSUED` | IV-K3-04 | 同上 | SECURITY-AC-022-01 | source adapter/K6 | `L8-K3-04-BASE`からcandidateだけをcaller plain objectへ置換し`Unknown(unregistered)`。 |
| `L8-K3-04-UNREGISTERED-SOURCE` | IV-K3-04 | 同上 | SECURITY-AC-022-01 | source adapter/K6 | source identityだけを未登録値へ替え`Unknown(unregistered)`。 |
| `L8-K3-04-SAME-NAME-DIFFERENT-SOURCE` | IV-K3-04 | 同上 | SECURITY-AC-022-01 | source adapter/K6 | 同名の別source refだけを与え`Unknown(conflict)`。 |
| `L8-K3-04-ISSUER-MISMATCH` | IV-K3-04 | 同上 | SECURITY-AC-022-01 | source adapter/K6 | 登録sourceは保ち原記録issuerだけを宣言issuerと異ならせ、確定不一致として`Value(Negative)`。 |
| `L8-K3-04-SIGNATURE-INVALID` | IV-K3-04 | 同上 | SECURITY-AC-022-01 | source adapter/K6 | 登録adapterが署名検証を宣言するsourceに限り署名bytesだけを無効化する。期待class=`Unknown`、reasonは表5.1.2の未決行。 |
| `L8-K3-04-SIGNATURE-UNVERIFIABLE` | IV-K3-04 | 同上 | SECURITY-AC-022-01 | source adapter/K6 | 登録adapterが署名検証を宣言するsourceに限り検証入力だけを読めなくする。期待class=`Unknown`、reasonは表5.1.2の未決行。 |
| `L8-K3-04-SELECTION-UNKNOWN-RULE` | IV-K3-04 | `resolve_current_effective_decision`; K3-I3 | SECURITY-AC-022-01 | source selector owner | `L8-K3-04-BASE`から選択規則refだけを登録外へ替え、`Unknown(unregistered)`。current decisionを推測しない。 |
| `L8-K3-04-SELECTION-CONFLICTING-CANDIDATES` | IV-K3-04 | `resolve_current_effective_decision`; K3-I3 | SECURITY-AC-022-01 | source selector owner | `L8-K3-04-BASE`に同じqueryへ適用される相反candidateを一件追加し、`Unknown(conflict)`。順序で一件を選ばない。 |
| `L8-K3-04-CURRENT-{DECISION}` | IV-K3-04 | `resolve_current_effective_decision`; K3-I3 | SECURITY-AC-022-01 | source selector owner | current allow後に同tupleのdenyを追記するfixtureは`Value(Negative)`、constrainを追記するfixtureはcurrent constrain refを選び、その既存制約と前提のcomponentsを保持する。古いallow refを選ばない。 |
| `L8-K3-04-RECEIPT-SUBSTITUTE` | IV-K3-04 | `check_permission`; K3-I3 | SECURITY-AC-022-01 | K6 assurance | permission source recordを未観測にし、K6 receiptだけをPositiveに置換する。K3のcurrent decisionは`Unknown(missing_input)`を保ち、receiptからpermission decisionを補わない。 |
| `L8-K3-05-BASE` | IV-K3-05 | `check_permission`; K3-I3 | SECURITY-AC-022-01 | Worker/K6 effect evidence | 全既存制約が実行前に適用され前提証拠も肯定なら狭いcontextのcheckは`Value(Positive)`。 |
| `L8-K3-05-{PRECONDITION}` | IV-K3-05 | 同上 | SECURITY-AC-022-01 | Worker/K6 effect evidence | `L8-K3-05-BASE`から一条件ずつ変える。`DENY`と`CONSTRAINT-RELAXED`は別々の`Value(Negative)`。必須制約設定・前提証拠の欠落は各々`Unknown(missing_input)`、既存Unknownはclass/reasonを保持する。許可Positiveを実行成功と記録しない。 |
| `L8-K3-06-BASE` | IV-K3-06 | `check_permission`; K3-I3 | SECURITY-AC-022-01 | task/review/CI consumer | 既存current許可を再利用する通常checkは`Value(Positive)`、sourceは不変。 |
| `L8-K3-06-{TRIGGER}` | IV-K3-06 | `check_permission`; K3-I3 | SECURITY-AC-022-01 | task/review/CI consumer | request、ACK、review、CI green、照合成功を各一つだけ与え、`BASE`からtriggerだけを変える。`authority_effect="none"`と許可sourceの不変を確認し、新しい許可recordを作らない。 |
| `L8-K3-07-BASE` | IV-K3-07 | `check_permission`; K3-I4/I5 | SECURITY-AC-022-02、SECURITY-AC-009-01 | time observation owner | 有効期間内expiryと時刻の一致は`Value(Positive)`。 |
| `L8-K3-07-{EXPIRY}` | IV-K3-07 | `check_permission`; K3-I4/I5 | SECURITY-AC-022-02、SECURITY-AC-009-01 | time observation owner | `BASE`から時刻/expiryの一条件だけを変える。`EXPIRED`は`Value(Negative)`、`TIME-UNREADABLE`と`EXPIRY-UNPARSABLE`は`Unknown`（reasonは未決表）。新TTLや猶予値を追加しない。 |
| `L8-K3-08-BASE` | IV-K3-08 | `check_permission`; K3-I4/I5 | SECURITY-AC-022-02、SECURITY-AC-009-01 | G5/K7 | current authorityと取消しprefix一致、revokeなしのcheckは`Value(Positive)`。 |
| `L8-K3-08-{REVOCATION}` | IV-K3-08 | 同上 | SECURITY-AC-022-02、SECURITY-AC-009-01 | G5/K7 | revokeは`REVOKED`だけ`Value(Negative)`、必要segment欠落は`Unknown(missing_input)`、読取失敗は`Unknown(unreadable)`。`OLD-EPOCH-ACTION`ではK3 checkのPositiveを作用許可とせず、K7 `admit_effect`がIV-K7-07–10どおり`Rejected(fenced)`とする。scope外は停止しない。`OUT-OF-SCOPE-STOP`では無関係scopeのpermission checkは`Value(Positive)`。 |
| `L8-K3-09-BASE` | IV-K3-09 | `resolve_authority_context`; K3-I6 | SECURITY-AC-022-03、SECURITY-AC-003-01 | — | request→decision→assignment→effective scopeが同一tupleとowner refsで連結する基準。check Positiveは実適用済みを示さない。 |
| `L8-K3-09-{PHASE}-{AXIS}` | IV-K3-09 | `resolve_authority_context`; K3-I6 | SECURITY-AC-022-03、SECURITY-AC-003-01 | 各段のowner | PHASE=request/decision/assignment/effective_scope、AXIS=actor/target/operation/revision/environment/scope/expiryへ展開。各fixtureでその段の指定軸だけを異なる確定値へ変え、`Value(Negative)`を返す。 |
| `L8-K3-10-BASE` | IV-K3-10 | `compare_required_operation_inputs`; K3-I7 | SECURITY-AC-005-01、SECURITY-AC-006-01 | SECURITY required-input owner | query/record input identity集合とrefがowner-required setに一致し`Value(Positive)`。 |
| `L8-K3-10-{SET-CASE}` | IV-K3-10 | 同上 | SECURITY-AC-005-01、SECURITY-AC-006-01 | SECURITY required-input owner | `BASE`から一条件だけを変える。required key欠落は`Unknown(missing_input)`、余分keyとrecord binding mismatchは`Value(Negative)`。旧sink enum/risk要約を使わない。 |
| `L8-K3-11-BASE` | IV-K3-11 | K3 `check_permission` consumer boundary | SECURITY-AC-008-01、SECURITY-AC-022-01 | K7 `apply_move`/CAS | current authorization tupleとrequested target/composition/kindが一致しK3 checkは`Value(Positive)`。 |
| `L8-K3-11-{CASE}` | IV-K3-11 | 同上 | SECURITY-AC-008-01、SECURITY-AC-022-01 | K7 `apply_move`/CAS | `BASE`から一条件だけを変える。`TARGET-COMPOSITION`と`MOVE-ACTION-KIND`は別fixture。各確定不一致でK3は`Value(Negative)`、K7追記0。CAS/head変異を混ぜない。 |
| `L8-K3-12-BASE` | IV-K3-12 | K3 pre/post check consumer boundary | SECURITY-AC-022-02、SECURITY-AC-009-01 | K7 writer/G5 | pre/post current checkが肯定でauthorizationとeffect observationが束縛された正常control。 |
| `L8-K3-12-{CASE}` | IV-K3-12 | 同上 | SECURITY-AC-022-02、SECURITY-AC-009-01 | K7 writer/G5 | `BASE`から一条件だけを変える。`PRE-REVOKED`/`PRE-EXPIRED`は`Value(Negative)`から`Rejected(authorization_unverified, check)`・append 0。`PRE-DRIFT`も同じ拒否。append後のnegative/unknown/missing/null observationは各々`AppliedUncertain`でeventと`RollbackRequired`を保持する。自動rollbackしない。 |
| `L8-K3-13-BASE` | IV-K3-13 | `check_permission`; K3-I1/§16.4 | SECURITY-AC-008-01 | K6 assurance/consumer | 全判定成分肯定の`Combined.verdict=Positive`。 |
| `L8-K3-13-{DIAGNOSTIC}` | IV-K3-13 | 同上 | SECURITY-AC-008-01 | K6 assurance/consumer | 4 fixture: denyがあっても後続unknownを全て保持し`Negative`、空集合は`Undetermined`かつ`set_reason=Unknown(missing_input)`、未証明issuer authenticityは`Unknown(unsupported)`のまま保持、secret値はreasonに含めない。 |
| `L8-K3-14-BASE` | IV-K3-14 | `resolve_owner_mapping`, K2 `key_of`/`lookup`; K3-I4 | SECURITY-AC-022-02、SECURITY-AC-009-01 | K2 alias binding/K6 read | PermissionQueryRef、全operation input/constraint aliases、owner binding bytes/refとraw bytesを固定。K6 readはsubject＋non-verifier inputsと一致し余分readなし。 |
| `L8-K3-14-ROLE-ALIAS-COEXISTS` | IV-K3-14 | `resolve_owner_mapping`, K2 `key_of`; K3-I4 | SECURITY-AC-022-02、SECURITY-AC-009-01 | K2 alias binding/K6 read | 異roleの同raw identity・異revision二aliasをdistinct role-bound inputsとして保持し、`L8-K3-14-BASE`と同じPositive resultを返す。 |
| `L8-K3-14-CALLER-BINDING-REJECTED` | IV-K3-14 | `resolve_owner_mapping`; K3-I4 | SECURITY-AC-022-02、SECURITY-AC-009-01 | owner resolver | 公開API signatureにcaller mapping引数が存在しないことを確認する構造negative。追加引数を渡すAPI呼出しを構成せず、K1/K2診断・result classを期待しない。 |
| `L8-K3-14-EXTRA-RAW-READ` | IV-K3-14 | K6 source read; K3-I4 | SECURITY-AC-022-02、SECURITY-AC-009-01 | K6 read | baseのexact read setへ同一raw refの余分read一件を加え、K6 read identity mismatchとして`Unknown(conflict)`。 |
| `L8-K3-14a` | IV-K3-14a | owner mapping→K2 `key_of`; K3-I4 | SECURITY-AC-022-02、SECURITY-AC-009-01 | K2 key boundary | required binding refだけ欠落。`Rejected(missing_key)`。 |
| `L8-K3-14b` | IV-K3-14b | owner mapping→K2 `key_of`; K3-I4 | SECURITY-AC-022-02、SECURITY-AC-009-01 | K2 alias normalization | 同一alias identityへ異raw refを1件だけ追加。`Rejected(missing_key)`。 |
| `L8-K3-14c` | IV-K3-14c | K6 source read; K3-I4 | SECURITY-AC-022-02、SECURITY-AC-009-01 | K6 bytes/digest | 他を固定しsource bytesとraw ref digestだけ不一致にし、K6 `Unknown(conflict)`。 |
| `L8-K3-14d` | IV-K3-14d | K6 binding read; K3-I4 | SECURITY-AC-022-02、SECURITY-AC-009-01 | K6 bytes/digest | resolver bytes固定でclaimed mappingだけ改変し、claimed binding digest不一致からK6 `Unknown(conflict)`。 |
| `L8-K3-14e` | IV-K3-14e | K2 `lookup`; K3-I4 | SECURITY-AC-022-02、SECURITY-AC-009-01 | K2 lookup | raw revisionだけ更新し、他fieldはそのrevisionのbytes/digest/bindingに整合。保存旧Valueに対し`Stale`。 |
| `L8-K3-14i` | IV-K3-14i | K2 `lookup`; K3-I4 | SECURITY-AC-022-02、SECURITY-AC-009-01 | K2 lookup | raw revision固定で一sourceのdigestと対応bytesだけ変更、binding digestを再計算。binding revision不変、期待`Unknown(conflict)`。 |
| `L8-K3-14j` | IV-K3-14j | K2 `lookup`; K3-I4 | SECURITY-AC-022-02、SECURITY-AC-009-01 | K2 lookup | 一roleのraw identityだけを別identityへ替えてbindingを再導出。inputs identity集合変化により`Unobserved(not_run)`。 |
| `L8-K3-14f` | IV-K3-14f | K2 `lookup`; K3-I4 | SECURITY-AC-022-02、SECURITY-AC-009-01 | K2 lookup | PermissionQueryRef identityだけを変え、他query/refを固定。`Unobserved(not_run)`。 |
| `L8-K3-14g` | IV-K3-14g | K2 `lookup`; K3-I4 | SECURITY-AC-022-02、SECURITY-AC-009-01 | K2 lookup | PermissionQueryRef revisionだけを変更し、`Stale`。 |
| `L8-K3-14h` | IV-K3-14h | K2 `lookup`; K3-I4 | SECURITY-AC-022-02、SECURITY-AC-009-01 | K2 lookup | PermissionQueryRef digestだけを変更し、`Unknown(conflict)`。 |
| `L8-K3-15-BASE` | IV-K3-15 | K2 `lookup`; K3-I4 | SECURITY-AC-022-02、SECURITY-AC-009-01 | current context refs | current全ref/versionが一致する完全key lookupは`Value(Positive)`。 |
| `L8-K3-15-{REF}` | IV-K3-15 | K2 `lookup`; K3-I4 | SECURITY-AC-022-02、SECURITY-AC-009-01 | current context refs | REFは表の12 literal IDsへ展開する。各々`BASE`から一参照だけ変更。operation version変更は`Unobserved(not_run)`、同identityのrevision更新とbytes/digest整合は旧Valueへの`Stale`。 |
| `L8-K3-16-BASE` | IV-K3-16 | K2 `lookup`; K3-I4 | SECURITY-AC-022-02、SECURITY-AC-009-01 | K5 current head/K6 receipt | resolver current heads/time observationとcaller expected headsが一致するcheckは`Value(Positive)`。 |
| `L8-K3-16-{OBSERVATION}` | IV-K3-16 | K2 `lookup`; K3-I4 | SECURITY-AC-022-02、SECURITY-AC-009-01 | K5 current head/K6 receipt | `BASE`から一観測refだけ変える。caller input_headsだけがowner current_headと違う場合はL4所定の非Positive checkを保持し旧prefixを選ばない。record不在は`Unknown(missing_input)`、pending receiptは`Unobserved(pending_receipt)`。raw時刻値/SegmentHeadをinputsへ直入れしない。 |
| `L8-K3-17-BASE` | IV-K3-17 | K3 check consumer boundary | SECURITY-AC-022-03、SECURITY-AC-003-01 | K7 recovery/ledger/G5 | current K3 checkは`Value(Positive)`で、通常apply_move後に同move直後観測がありrecovery不要のcontrol。 |
| `L8-K3-17-{RECOVERY}` | IV-K3-17 | K3 check consumer boundary | SECURITY-AC-022-03、SECURITY-AC-003-01 | K7 recovery/ledger/G5 | `BASE`から指定された一条件だけを変える。`AFTER-LATER-MOVE`/`WRONG-SEGMENT`/`WRONG-MOVE`は`Unknown(conflict)`で待ちを解消しない。POSTSTOPは同moveへphase=recoveryの診断を追記して成功を作らない。SEQ-PLUS-ONE偽装、非move参照、有効immediate既存、自動moveも独立に検査する。停止注入の再起動control flowはlog単独判定と分離する。 |

#### 5.1.1 K3 fixture IDの一意展開一覧

表中のtemplateは、次の列挙済みIDに一対一で展開する。各IDは独立fixtureで、正常基準から変える条件は一つだけである。axis/state・phase・caseの組合せは下記194個の一意な実IDを全列挙し、実行時に新しいsuffixを生成しない。IV-K3-14a–jは各suffixを一件ずつ固定している。

- IV-K3-01: `L8-K3-01-BASE`, `L8-K3-01-SCOPE-PROJECT`, `L8-K3-01-SCOPE-ENVIRONMENT`, `L8-K3-01-SCOPE-WORKTREE`, `L8-K3-01-SCOPE-TENANT`, `L8-K3-01-actor-MISSING`, `L8-K3-01-actor-UNKNOWN`, `L8-K3-01-actor-CONFLICT`, `L8-K3-01-actor-MISMATCH`, `L8-K3-01-target-MISSING`, `L8-K3-01-target-UNKNOWN`, `L8-K3-01-target-CONFLICT`, `L8-K3-01-target-MISMATCH`, `L8-K3-01-operation-MISSING`, `L8-K3-01-operation-UNKNOWN`, `L8-K3-01-operation-CONFLICT`, `L8-K3-01-operation-MISMATCH`, `L8-K3-01-revision-MISSING`, `L8-K3-01-revision-UNKNOWN`, `L8-K3-01-revision-CONFLICT`, `L8-K3-01-revision-MISMATCH`, `L8-K3-01-environment-MISSING`, `L8-K3-01-environment-UNKNOWN`, `L8-K3-01-environment-CONFLICT`, `L8-K3-01-environment-MISMATCH`, `L8-K3-01-scope-MISSING`, `L8-K3-01-scope-UNKNOWN`, `L8-K3-01-scope-CONFLICT`, `L8-K3-01-scope-MISMATCH`, `L8-K3-01-expiry-MISSING`, `L8-K3-01-expiry-UNKNOWN`, `L8-K3-01-expiry-CONFLICT`, `L8-K3-01-expiry-MISMATCH`, `L8-K3-01-OWNER-MISSING`, `L8-K3-01-OWNER-UNREGISTERED`, `L8-K3-01-OWNER-CONFLICT`, `L8-K3-01-ASSIGNMENT`, `L8-K3-01-KEY-MISSING`.
- IV-K3-02: `L8-K3-02-ALLOW-read`, `L8-K3-02-ALLOW-write`, `L8-K3-02-ALLOW-execute`, `L8-K3-02-ALLOW-network`, `L8-K3-02-ALLOW-install`, `L8-K3-02-ALLOW-delete`, `L8-K3-02-ALLOW-merge`, `L8-K3-02-ALLOW-release`, `L8-K3-02-ALLOW-deploy`, `L8-K3-02-ALLOW-credential-use`, `L8-K3-02-ALLOW-security-change`, `L8-K3-02-READ-AS-write`, `L8-K3-02-READ-AS-execute`, `L8-K3-02-READ-AS-network`, `L8-K3-02-READ-AS-install`, `L8-K3-02-READ-AS-delete`, `L8-K3-02-READ-AS-merge`, `L8-K3-02-READ-AS-release`, `L8-K3-02-READ-AS-deploy`, `L8-K3-02-READ-AS-credential-use`, `L8-K3-02-READ-AS-security-change`.
- IV-K3-03: `L8-K3-03-BASE`, `L8-K3-03-FRESH-REVISION`, `L8-K3-03-LOOKUP-STALE`, `L8-K3-03-DIGEST`, `L8-K3-03-IDENTITY`.
- IV-K3-04: `L8-K3-04-BASE`, `L8-K3-04-SELF-ISSUED`, `L8-K3-04-UNREGISTERED-SOURCE`, `L8-K3-04-SAME-NAME-DIFFERENT-SOURCE`, `L8-K3-04-ISSUER-MISMATCH`, `L8-K3-04-SIGNATURE-INVALID`, `L8-K3-04-SIGNATURE-UNVERIFIABLE`, `L8-K3-04-CURRENT-DENY`, `L8-K3-04-CURRENT-CONSTRAIN`, `L8-K3-04-SELECTION-UNKNOWN-RULE`, `L8-K3-04-SELECTION-CONFLICTING-CANDIDATES`, `L8-K3-04-RECEIPT-SUBSTITUTE`.
- IV-K3-05: `L8-K3-05-BASE`, `L8-K3-05-DENY`, `L8-K3-05-CONSTRAINT-SETTING-MISSING`, `L8-K3-05-PRECONDITION-UNOBSERVED`, `L8-K3-05-CONSTRAINT-EVIDENCE-MISSING`, `L8-K3-05-CONSTRAINT-RELAXED`.
- IV-K3-06: `L8-K3-06-BASE`, `L8-K3-06-REQUEST`, `L8-K3-06-ACK`, `L8-K3-06-REVIEW`, `L8-K3-06-CI-GREEN`, `L8-K3-06-CHECK-SUCCESS`.
- IV-K3-07: `L8-K3-07-BASE`, `L8-K3-07-EXPIRED`, `L8-K3-07-TIME-UNREADABLE`, `L8-K3-07-EXPIRY-UNPARSABLE`.
- IV-K3-08: `L8-K3-08-BASE`, `L8-K3-08-REVOKED`, `L8-K3-08-SEGMENT-MISSING`, `L8-K3-08-SEGMENT-UNREADABLE`, `L8-K3-08-OLD-EPOCH-ACTION`, `L8-K3-08-OUT-OF-SCOPE-STOP`, `L8-K3-08-G5-ONLY`.
- IV-K3-09: `L8-K3-09-BASE`, `L8-K3-09-request-actor`, `L8-K3-09-request-target`, `L8-K3-09-request-operation`, `L8-K3-09-request-revision`, `L8-K3-09-request-environment`, `L8-K3-09-request-scope`, `L8-K3-09-request-expiry`, `L8-K3-09-decision-actor`, `L8-K3-09-decision-target`, `L8-K3-09-decision-operation`, `L8-K3-09-decision-revision`, `L8-K3-09-decision-environment`, `L8-K3-09-decision-scope`, `L8-K3-09-decision-expiry`, `L8-K3-09-assignment-actor`, `L8-K3-09-assignment-target`, `L8-K3-09-assignment-operation`, `L8-K3-09-assignment-revision`, `L8-K3-09-assignment-environment`, `L8-K3-09-assignment-scope`, `L8-K3-09-assignment-expiry`, `L8-K3-09-effective_scope-actor`, `L8-K3-09-effective_scope-target`, `L8-K3-09-effective_scope-operation`, `L8-K3-09-effective_scope-revision`, `L8-K3-09-effective_scope-environment`, `L8-K3-09-effective_scope-scope`, `L8-K3-09-effective_scope-expiry`.
- IV-K3-10: `L8-K3-10-BASE`, `L8-K3-10-purpose`, `L8-K3-10-classification`, `L8-K3-10-source`, `L8-K3-10-destination`, `L8-K3-10-REQUIRED-KEY-MISSING`, `L8-K3-10-EXTRA-KEY`, `L8-K3-10-RECORD-BINDING-MISMATCH`.
- IV-K3-11: `L8-K3-11-BASE`, `L8-K3-11-TARGET-COMPOSITION`, `L8-K3-11-MOVE-ACTION-KIND`.
- IV-K3-12: `L8-K3-12-BASE`, `L8-K3-12-PRE-REVOKED`, `L8-K3-12-PRE-EXPIRED`, `L8-K3-12-PRE-DRIFT`, `L8-K3-12-POST-NEGATIVE`, `L8-K3-12-POST-UNKNOWN`, `L8-K3-12-POST-OBSERVATION-MISSING`, `L8-K3-12-POST-OBSERVED-AT-NULL`.
- IV-K3-13: `L8-K3-13-BASE`, `L8-K3-13-DENY-DROPS-UNKNOWN`, `L8-K3-13-EMPTY-TRUTH`, `L8-K3-13-ISSUER-UNPROVEN`, `L8-K3-13-SECRET-IN-REASON`.
- IV-K3-14: `L8-K3-14-BASE`, `L8-K3-14-ROLE-ALIAS-COEXISTS`, `L8-K3-14-CALLER-BINDING-REJECTED`, `L8-K3-14-EXTRA-RAW-READ`, `L8-K3-14a`, `L8-K3-14b`, `L8-K3-14c`, `L8-K3-14d`, `L8-K3-14e`, `L8-K3-14f`, `L8-K3-14g`, `L8-K3-14h`, `L8-K3-14i`, `L8-K3-14j`.
- IV-K3-15: `L8-K3-15-BASE`, `L8-K3-15-OPERATION-VERSION`, `L8-K3-15-K3-CODE`, `L8-K3-15-K3-CONFIG`, `L8-K3-15-CURRENT-ASSIGNMENT`, `L8-K3-15-TARGET-DECL`, `L8-K3-15-ENVIRONMENT-DECL`, `L8-K3-15-OWNER-DECL`, `L8-K3-15-OPERATION-DECL`, `L8-K3-15-AUTHORITY-DECL`, `L8-K3-15-POLICY`, `L8-K3-15-SOURCE-CURRENT-REF`, `L8-K3-15-ADAPTER`.
- IV-K3-16: `L8-K3-16-BASE`, `L8-K3-16-TIME-OBSERVATION-REF`, `L8-K3-16-REVOCATION-HEAD-A`, `L8-K3-16-REVOCATION-HEAD-B`, `L8-K3-16-CALLER-HEAD-DRIFT`.
- IV-K3-17: `L8-K3-17-BASE`, `L8-K3-17-RECOVERY-POSTSTOP`, `L8-K3-17-RECOVERY-AFTER-LATER-MOVE`, `L8-K3-17-RECOVERY-WRONG-SEGMENT`, `L8-K3-17-RECOVERY-WRONG-MOVE`, `L8-K3-17-RECOVERY-SEQ-PLUS-ONE`, `L8-K3-17-RECOVERY-NOT-A-MOVE`, `L8-K3-17-RECOVERY-ALREADY-IMMEDIATE`, `L8-K3-17-RECOVERY-AUTO-MOVE`, `L8-K3-17-RECOVERY-RESTART-CONTROL-FLOW`.

#### 5.1.2 K3 reason mappingの未決

| 対象 | L4で固定された期待 | L4で特定されていない点 |
|---|---|---|
| K3-I1 missing / existing unknown | 欠落=`Unknown(missing_input)`、source read failure=`Unknown(unreadable)`、確定競合=`Unknown(conflict)`。既存Unknown componentはclass/reasonを保持する。 | ownerごとの任意観測失敗の分類。fixtureはこの3つの既定値を個別に用い、新reasonへ写さない。 |
| IV-K3-01 owner resolution | 未登録は`Unknown(unregistered)`、未充足refは`Unknown(missing_input)`、確定競合は`Unknown(conflict)`。 | 解決不能のowner artifactをどの状況で未登録/欠落/conflictと診断するか。3状態を別々に入力して混ぜない。 |
| IV-K3-04 source authenticity（`L8-K3-04-SIGNATURE-INVALID`／`...-SIGNATURE-UNVERIFIABLE`） | self-issued/未登録source=`Unknown(unregistered)`、同名別source=`Unknown(conflict)`、issuerの確定不一致=`Value(Negative)`、宣言adapterでのsignature invalid/unverifiable=`Unknown`。 | signature invalid/unverifiableのK1 reasonだけL4が固定していない。該当fixtureはreasonを発明せず既存adapter結果を保持する。 |
| IV-K3-05/07/08 evidence | 確定deny/expiry/revokeは`Value(Negative)`。必要入力欠落は`Unknown(missing_input)`、read failureは`Unknown(unreadable)`。 | expiryのparse failure等のreason対応。class `Unknown`までをfixture oracleにし、reason mappingを増やさない。 |
| IV-K3-10 required inputs | 確定ref mismatch/余分keyは`Value(Negative)`、必須入力欠落は`Unknown(missing_input)`。 | required-input schema未登録とrequired entry欠落のどちらを返すか。入力を別fixtureとしL4 existing owner statusをそのまま期待する。 |


| 追加oracle | L4確定の期待 | 局所的な未決・fixture限定 |
|---|---|---|
| IV-K3-03 identity change | 別inputs identity集合のlookupは`Unobserved(not_run)`。 | K3がfresh checkを実行した場合の別identity上のdecision結果は、そのcurrent source dataで決まる。旧queryの結果を流用しない。 |
| IV-K3-12 postcheck class | postcheckが`Negative`/`Unknown`なら`AppliedUncertain`、観測欠落または`observed_at=null`も同じ状態に保持する。 | `Unknown` reasonのowner-specific対応。原checkが持つclass/reasonを加工せず残す。 |
| IV-K3-12 pre/post cases | 使用前revoke/expiryはcheck `Value(Negative)`から`Rejected(authorization_unverified, check)`かつ追記0。使用前caller/current driftはcheckをPositiveにせず同じRejected。使用後negative/unknown/欠落/null時刻は`AppliedUncertain`でeventを保持し`RollbackRequired`を残す。 | driftのcheck class/reason mappingはL4/L9が指定しないため、原check診断を保持し新reasonへ写さない。 |
| IV-K3-13 empty components | 0判定成分は`Combined.verdict=Undetermined`かつ`set_reason=Unknown(missing_input)`。 | なし。 |
| IV-K3-15/16 key changes | `operation_version`変更は`Unobserved(not_run)`。他の同一identity refsはrevision更新とbytes/digest追随で`Stale`。time/head refも同じK2 revision規則で扱う。caller/current head mismatchは非Positive checkを保持するが、そのclass/reasonはL4/L9に指定がない。 | L9が列挙する各source roleの具体的ref数はowner declarationが決める。ここでは各listed roleを1 refとするfixture baselineで個々のmutationを定義し、実データ上の同role全量を証明したとは主張しない。取消しprefixのA/Bは異なる2つのsynthetic segment identityで、各headを一つずつ変える。 |
| IV-K3-17 recovery | `RECOVERY-NOT-A-MOVE`=`Rejected(not_a_move)`、`RECOVERY-ALREADY-IMMEDIATE`=`Rejected(already_immediate)`、wrong segment/move association=`Unknown(conflict)`。POSTSTOPは同一moveへのphase=recovery診断追記に留まり、success/通常完了/G5待ち解消を出さない。AFTER-LATER-MOVEは`Unknown(conflict)`で待ちを解消しない。 | 停止・再起動の注入はcontrol-flow fixtureであり、既存ログ型だけから停止を推定しない。SEQ-PLUS-ONEはrecovery pathを通り、immediate偽装をしない。AUTO-MOVEは追記/移動を行わない。 |

K3逆trace: L5 §6.1.4のK3-I1–I7各API clauseから本節の個別caseを経由し、L9 IV-K3-01–17および14a–jへ戻る。L3 direct parentはCommon Kernel L4 §16.1に列挙されたSECURITY ACに限定し、K7/OSのACは境界参照としてのみ扱う。fixtureは未実行である。


### 5.2 K5 fixtures

本節はL5 §6.2のK5受け口とL4 K5-I1–I13を、Pair L9の既存IV-K5-01–26へ91個の一意なL8 caseとして展開する。K5 fixtureは初期化済みの固定`LogDecl`/manifest/prefixを入力に使う。IV-K5-22の正常fixtureは既に存在するmanifestとcurrent OS assignment/runの対応を前提にした通常segment開設であり、初回manifestのgenesis作成や初回OS assignment/runの生成を検査・証明しない。未定義のbootstrap API/例外はfixtureへ足さない。すべて未実行である。

| L8 case | L9 oracle | L5 API / invariant | Fixtureと期待 |
|---|---|---|---|
| `L8-K5-01-MUTATE` | IV-K5-01 | `read`; K5-I1 | 固定headの既存1行のbytesだけを改変し、`Unknown(unreadable)`。 |
| `L8-K5-01-DELETE` | IV-K5-01 | `read`; K5-I1 | 固定head内の既存1行だけを削除し、`Unknown(unreadable)`。 |
| `L8-K5-01-REORDER` | IV-K5-01 | `read`; K5-I1 | 隣接2行だけを入れ替え、`Unknown(unreadable)`。 |
| `L8-K5-02-PARSE` | IV-K5-02 | `read`; K5-I3(a) | 1行だけJSON parse不能bytesにする。`Unknown(unreadable)`、evidence(a)。 |
| `L8-K5-03-SCHEMA` | IV-K5-03 | `read`; K5-I3(b) | schema_versionを未登録値に変え、entry/後続chainを再計算する。evidence(b)だけのunreadable。 |
| `L8-K5-04-SEQ-GAP` | IV-K5-04 | `read`; K5-I3(c) | 中間seqを一つ飛ばし、chainを再計算。evidence(c)だけ。 |
| `L8-K5-05-SEQ-DUP` | IV-K5-05 | `read`; K5-I3(d) | 2行へ同seqを付けchainを再計算。evidence(d)だけ。 |
| `L8-K5-06-PREV` | IV-K5-06 | `read`; K5-I3(e) | 1行のprev_digestだけ別の正形digestへ変え、その行のentry_digestと後続chainを再計算する。内部整合したchainでもevidence(e)だけの`Unknown(unreadable)`。 |
| `L8-K5-07-ENTRY` | IV-K5-07 | `read`; K5-I3(f) | entry_digestを変え、後続prev/chainをその値へ整合。evidence(f)だけ。 |
| `L8-K5-08-HEAD-SHORT` | IV-K5-08 | `read`; K5-I3(g) | 内部ではchainが整ったまま、指定head.seqより短いsegmentを渡す。evidence(g)だけの`Unknown(unreadable)`。 |
| `L8-K5-08-HEAD-OTHER-CHAIN` | IV-K5-08 | `read`; K5-I3(g) | 指定headと同じseqを持つが、その行のentry_digestが違う別の内部整合chainを作る。evidence(g)だけの`Unknown(unreadable)`。 |
| `L8-K5-09-FIXED-HEAD` | IV-K5-09 | `project`/`verify`; K5-I4 | seq1で保存しseq2追記後も固定seq1 prefixでverifyは`Value`。旧prefixへseq2を混ぜない。 |
| `L8-K5-09-CURRENT-HEAD` | IV-K5-09 | `lookup`; K5-I4 | current_head seq2を照会すると旧projectionは`Stale`。 |
| `L8-K5-10-NOOP` | IV-K5-10 | `append`; K5-I5 | 同key_digest・同result_digestの再記録は`NoOp`。 |
| `L8-K5-10-CONFLICT` | IV-K5-10 | `append`; K5-I5 | 同key_digest・異result_digestの再記録は双方とConflict eventを保持して`Conflict`。 |
| `L8-K5-10-PEER-UNREADABLE` | IV-K5-10 | `append`; K5-I5 | manifest列挙peer segmentの読取不能では`Rejected(peer_unreadable)`、write 0、bytes不変。 |
| `L8-K5-11-MISSING-KEY` | IV-K5-11 | `append`; K5-I5・L4 §9.5 | ResultKeyの必須fieldを1つ欠落。`Rejected`、bytes不変。 |
| `L8-K5-11-BAD-KEY-DIGEST` | IV-K5-11 | `append`; K5-I5・L4 §9.5 | key_digestだけ不一致。`Rejected`、bytes不変。 |
| `L8-K5-11-BAD-RESULT-DIGEST` | IV-K5-11 | `append`; K5-I5・L4 §9.5 | result_digestだけ不一致。`Rejected`、bytes不変。 |
| `L8-K5-11-STALE` | IV-K5-11 | `append`; K5-I5・L4 §9.5 | 結果classだけStaleへ変更。`Rejected`、bytes不変。 |
| `L8-K5-11-NA-REASON` | IV-K5-11 | `append`; K5-I5・L4 §9.5 | NotApplicableの`reason`だけ欠落。`Rejected`、bytes不変。 |
| `L8-K5-11-NA-AUTHORITY` | IV-K5-11 | `append`; K5-I5・L4 §9.5 | NotApplicableの`authority`だけ欠落。`Rejected`、bytes不変。 |
| `L8-K5-11-NA-REENTRY-TRIGGER` | IV-K5-11 | `append`; K5-I5・L4 §9.5 | NotApplicableの`reentry_trigger`だけ欠落。`Rejected`、bytes不変。 |
| `L8-K5-11-UNDECLARED-INLINE` | IV-K5-11 | `append`; K5-I5・L4 §9.5 | value type InlineをLogDeclに未宣言のまま入力。`Rejected`、bytes不変。 |
| `L8-K5-11-WRONG-LOG` | IV-K5-11 | `append`; K5-I6・L4 §9.5 | declared operationを別logへ記録。`Rejected`、bytes不変。 |
| `L8-K5-11-CONFLICT-ONE-DIGEST` | IV-K5-11 | `append`; K5-I5・L4 §9.5 | `result_digests`が1件だけのResultConflictDetected。`Rejected`、bytes不変。 |
| `L8-K5-11-CONFLICT-UNKNOWN-DIGEST` | IV-K5-11 | `append`; K5-I5・L4 §9.5 | logに無いresult_digestを含むResultConflictDetected。`Rejected`、bytes不変。 |
| `L8-K5-11-CORRECT-RESULT` | IV-K5-11 | `append`; K5-I8・L4 §9.5 | ResultRecordedを対象とするCorrection。`Rejected`、bytes不変。 |
| `L8-K5-11-SEGMENTOPENED-WRONG-WRITER` | IV-K5-11 | `append`; L4 §9.5 SegmentOpened writer precondition | manifest_writer以外がSegmentOpenedを記録。`Rejected`、bytes不変。 |
| `L8-K5-11-UNDECLARED-EVENT` | IV-K5-11 | `append`; L4 §9.5 LogDecl validation | LogDeclに無いevent_type。`Rejected`、bytes不変。 |
| `L8-K5-11-WRONG-WRITER` | IV-K5-11 | `append`; L4 §9.5 writer precondition | declared writerと異なるwriterで追記。`Rejected`、bytes不変。 |
| `L8-K5-11-UNREGISTERED-SEGMENT` | IV-K5-11 | `append`; L4 §9.5 manifest registration precondition | manifestに登録されていないsegmentへ追記。`Rejected`、bytes不変。 |
| `L8-K5-12-VALUE-INLINE` | IV-K5-12 | `restore`→`lookup` | Inline ValueをJSONLから復元し完全一致queryでValueのまま返す。 |
| `L8-K5-12-VALUE-FIXEDREF` | IV-K5-12 | `restore`→`lookup` | FixedRef Valueをbytesから復元し完全一致queryでValueのまま返す。 |
| `L8-K5-12-UNKNOWN` | IV-K5-12 | `restore`→`lookup` | Unknown resultを復元しUnknown classを保持する。 |
| `L8-K5-12-UNOBSERVED` | IV-K5-12 | `restore`→`lookup` | Unobserved resultを復元しUnobserved classを保持する。 |
| `L8-K5-12-NOT-APPLICABLE` | IV-K5-12 | `restore`→`lookup` | NotApplicable resultを復元しNotApplicable classを保持する。 |
| `L8-K5-12-FIXEDREF-MISSING` | IV-K5-12 | `restore` | FixedRef実体なしでは該当recordを`Unknown(unreadable)`として復元しValueにしない。 |
| `L8-K5-12-FIXEDREF-DIGEST` | IV-K5-12 | `restore` | FixedRef bytes digest不一致では該当recordを`Unknown(unreadable)`として復元しValueにしない。 |
| `L8-K5-13-NO-CORRECTION` | IV-K5-13 | `project`; K5-I8 | correctionなしでは元内容を投影する。 |
| `L8-K5-13-CHAIN` | IV-K5-13 | `append`/`project`; K5-I8 | A→C1→C2の一本鎖では末端replacement C2を採る。 |
| `L8-K5-13-RETRACTION` | IV-K5-13 | `append`/`project`; K5-I8 | replacementなしでは元eventを保持しつつ集計から撤回する。 |
| `L8-K5-13-BRANCH` | IV-K5-13 | `append`/`project`; K5-I8 | replacement branch 2件は順不同で`Unknown(conflict)`。 |
| `L8-K5-13-SAME-KEY` | IV-K5-13 | `append`/`lookup`; K2-I2/I4 | 同一key別resultは訂正でなくConflictとなり、lookupは`Unknown(conflict)`。 |
| `L8-K5-13-NEW-REVISION` | IV-K5-13 | `append`/`lookup`; K2-I2/I4 | 新revision keyでの新記録後、旧Valueは`Stale`。 |
| `L8-K5-14-NO-WRITEBACK` | IV-K5-14 | `project`/`append`; K5-I9 | projection outputをevent appendまたはrecord inputへ渡す経路はRejected。 |
| `L8-K5-15-ORDER-INDEPENDENT` | IV-K5-15 | `project`; K5-I10 | 同じevent集合を3通りのsegment/read順で渡しoutput_digestが一致。読み込み順で差が出る実装は不合格。 |
| `L8-K5-16-NUMERIC-ORDER` | IV-K5-16 | `restore`→`lookup`; K5-I7 | segment_no 2と10では数値最大10をpriorに選ぶ。辞書順・時刻・読込順を使わない。 |
| `L8-K5-16-NFC` | IV-K5-16 | `restore`→`lookup`; K5-I7 | writerのNFC/NFD同一表記は同writerとして扱う。 |
| `L8-K5-17-COMPLETE` | IV-K5-17 | `project`; K5-I11 | scope A/B両headの完全prefixで宣言scopeの0件・close済みをValueとして出す。 |
| `L8-K5-17-MISSING-HEAD` | IV-K5-17 | `project`; K5-I11 | Aを読めてもB headをinput_headsから落とすと`Unknown(missing_input)`。 |
| `L8-K5-17-EMPTY-SCOPE` | IV-K5-17 | `project`; K5-I11 | scope.segmentsが空なら`Unknown(missing_input)`。 |
| `L8-K5-17-DAMAGED-B` | IV-K5-17 | `project`; K5-I11 | B prefix損傷は`Unknown(unreadable)`。 |
| `L8-K5-17-SCOPE-A` | IV-K5-17 | `project`; K5-I11 | Aだけのscopeのprojectionは`Value`。 |
| `L8-K5-17-SCOPE-WHOLE-UNOBSERVED` | IV-K5-17 | `lookup`; K5-I11 | Aだけのscope keyをA/B log全体scopeで照会し、scope key不一致により`Unobserved(not_run)`。 |
| `L8-K5-17-CLOSED-PARTIAL-READ` | IV-K5-17 | `project`; K5-I11 | 既存closed eventを含む完全A/B fixed-scope基準から、必要なB prefix/headだけを欠かせる。`Unknown(missing_input)`を返し、既存closed原記録を変更せずopenを再生成しない。`MISSING-HEAD`と同じ欠落変異・classで、closed-state保全だけを追加assertする。 |
| `L8-K5-18-EXACT` | IV-K5-18 | `lookup`; K5-I12 | exact keyは保存projectionを返す。 |
| `L8-K5-18-APPEND` | IV-K5-18 | `lookup`; K5-I12 | input segment追記後、旧projectionは`Stale`。 |
| `L8-K5-18-VERSION` | IV-K5-18 | `lookup`; K5-I12 | projector version変更は`Unobserved(not_run)`。 |
| `L8-K5-18-DIGEST` | IV-K5-18 | `lookup`; K5-I12 | 同versionのprojector digestだけの変更は`Unknown(conflict)`。 |
| `L8-K5-18-UNAFFECTED` | IV-K5-18 | `lookup`; K5-I12 | 影響外segmentだけのscopeではValueを保つ。 |
| `L8-K5-19-EXTEND` | IV-K5-19 | `verify`; K5-I13 | same-scope forward head extension、anchor/state digest一致、incremental fold＝full rebuildの時だけcheckpointを使う。 |
| `L8-K5-19-SHORT` | IV-K5-19 | `verify`; K5-I13 | checkpointより短いheadでは`Unknown(conflict)`、checkpoint不使用。 |
| `L8-K5-19-ANCHOR` | IV-K5-19 | `verify`; K5-I13 | anchor digest違いでは`Unknown(conflict)`、checkpoint不使用。 |
| `L8-K5-19-STATE` | IV-K5-19 | `verify`; K5-I13 | state bytes改変・digest据置きでは`Unknown(conflict)`、checkpoint不使用。 |
| `L8-K5-19-DIFF` | IV-K5-19 | `verify`; K5-I13 | incremental foldとfull rebuild不一致では`Unknown(conflict)`、checkpoint不使用。 |
| `L8-K5-20-OUTPUT` | IV-K5-20 | `verify` | `output` fieldだけを改変し、`output_digest`は据え置く。再計算不一致として`Unknown(conflict)`。 |
| `L8-K5-20-OUTPUT-DIGEST` | IV-K5-20 | `verify` | output_digestだけを変更し、`Unknown(conflict)`。 |
| `L8-K5-20-SELF-CONSISTENT-ALTER` | IV-K5-20 | `verify` | outputとdigestを相互に整合する形で改変しても、入力からの再構築値と違えば`Unknown(conflict)`。 |
| `L8-K5-21-COMPLETE` | IV-K5-21 | `restore`→`lookup`; K5-I11 | 損傷なしのA/B両prefixをrestoreしlookupする。照会対象が一意なら`Value`。 |
| `L8-K5-21-CONFLICT-B` | IV-K5-21 | `restore`→`lookup`; K5-I11 | `COMPLETE`からB prefixだけ同key異resultにし、全体scope lookupは`Unknown(conflict)`。 |
| `L8-K5-21-SCOPE-A` | IV-K5-21 | `restore`→`lookup`; K5-I11 | Aだけを宣言したscopeのkeyに対するlookupは`Value`。 |
| `L8-K5-21-MISSING-HEAD` | IV-K5-21 | `restore`→`lookup`; K5-I11 | input_headsからBを落とすと`Unknown(missing_input)`、lookup未呼出し。 |
| `L8-K5-21-EMPTY-SCOPE` | IV-K5-21 | `restore`→`lookup`; K5-I11 | scope.segmentsが0件なら`Unknown(missing_input)`、lookup未呼出し。 |
| `L8-K5-21-DAMAGE-MANIFEST` | IV-K5-21 | `restore`→`lookup`; K5-I11 | manifest損傷は`Unknown(unreadable)`、lookup未呼出し。 |
| `L8-K5-21-DAMAGE-B` | IV-K5-21 | `restore`→`lookup`; K5-I11 | B prefix損傷は`Unknown(unreadable)`、lookup未呼出し。 |
| `L8-K5-21-MASKED-CONFLICT` | IV-K5-21 | `restore`→`lookup`; K5-I11 | Aに一致Value、Bに競合resultがある状態で全体scopeのB headを欠落させる。期待は`Unknown(missing_input)`であり、A Valueを返さない。 |
| `L8-K5-22-OPENED` | IV-K5-22 | `manifest_writer`→writer append | current assignment/runとwriterの対応を与え、manifest_writerがSegmentOpenedを登録してからwriterが追記する。 |
| `L8-K5-22-UNREGISTERED` | IV-K5-22 | `append` | 未登録segmentへの追記はwrite 0。 |
| `L8-K5-22-MANIFEST-UNREADABLE` | IV-K5-22 | `append` | manifest読取不能時は開始せずwrite 0。 |
| `L8-K5-22-WRONG-ASSIGNMENT` | IV-K5-22 | `append` | 異なるwriter/run assignmentではwrite 0。path名から登録を生成しない。初回genesisの正常化は主張しない。 |
| `L8-K5-23-CANCEL` | IV-K5-23 | K3/K7 fence→append | cancel後のold writer追記は0。既存prefixは読取可能な履歴として残る。 |
| `L8-K5-23-EXPIRED` | IV-K5-23 | K3/K7 fence→append | 失効後のold writer追記は0。 |
| `L8-K5-23-NEW-RUN` | IV-K5-23 | K3/K7 fence→append | 旧writer/segmentをnew runへ引き継いで追記しない。 |
| `L8-K5-23-FENCE` | IV-K5-23 | K3/K7 fence→append | current authority/fenceが非肯定なら追記0。 |
| `L8-K5-23-PEER` | IV-K5-23 | K3/K7 fence→append | peer_unreadableなら追記0。 |
| `L8-K5-23-COMPLETION` | IV-K5-23 | K3/K7 fence→append | 正常終了名だけからEpochIssued/revokeを生成しない。新SegmentClosed eventや時刻閾値を要求しない。 |
| `L8-K5-23-LATE` | IV-K5-23 | K3/K7 fence→append | 遅着観測はcurrent writerのLateObservationへ結び、old writerの作用としない。 |
| `L8-K5-24-CRLF` | IV-K5-24 | `read`; K5-I3(h) | canonical lineのLFをCRLFへ変更。他条件は有効のまま、evidence(h)のUnknown(unreadable)。 |
| `L8-K5-25-TRAILING-SPACE` | IV-K5-25 | `read`; K5-I3(h) | LF前にASCII space一つを追加。他条件は有効、evidence(h)のUnknown(unreadable)。 |
| `L8-K5-26-NONCANONICAL` | IV-K5-26 | `read`; K5-I3(h) | JSON key順等を非canonicalに変更し、解析値とentry digestは維持。他条件は有効、evidence(h)のUnknown(unreadable)。 |

K5 trace: L5 §6.2.3のI1–I13は上表のIV-K5 rowsへそれぞれ戻る。`ledger_view`（L5 §6.2.2 FN-20）は既存のIV-LDG/IV-K7接続だけを参照し、本書のIV-K5 fixtureで個別に検査したとはしない。writer/assignment・fenceはIV-K5-22/23とIV-K7-07–10、台帳はIV-LDG-01/02/04、physical path/storeはrepository-layout IV-RL-24–32へ参照する。これらの接続はK5 contractの再利用であり、K7/OSの初回assignment、physical enforcement、IV実行、L10 acceptanceを新設・主張しない。


## 6. K1/K2 unit範囲と登録oracleの境界

本書のK1/K2 fixture集合は既存のL9 IV-K1/IV-K2 oracleだけを展開する。unit suiteはpure semantic APIを対象とし、物理的な型番登録やK5 ledger appendを新しいfixtureやoracleとして定義しない。宣言項目・path・固定bytes・未登録版の配置照合は既存repository-layout RL-C1–7およびCommon Kernel L4/L9の`IV-LDG-01`/`IV-LDG-02`/`IV-LDG-04`へ、manifest segment開設後のwriter/run対応は既存`IV-K5-22`へ接続する。これらは別の統合境界にある既存oracleであり、このK1/K2 unit suiteがそれを実行・検証したとはしない。

空ledgerからの初回manifest作成は現K5で定められていないため、本書では操作、result class、fixtureを追加しない。登録の正否やwriter enforcementは既存oracleに委ね、L5 §7の候補値から登録済み状態を導かない。L6 §9/L7 §6はK1/K2 pure function suiteの配置範囲を示す。
