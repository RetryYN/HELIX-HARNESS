# HELIX-HARNESS 共通カーネル L8詳細検証設計（K1/K2/K3/K4/K5/K6/K7/K8/K9/K10/G3/G5）

status: draft
owner: HELIX-HARNESS
parent_requirement: なし（要素別にCommon Kernel L4 §2.1／§3.1／§9.2／§10.2／§13.1／§15.1／§16.1／§17.1／§18.1の直接crosswalkへtrace。HARNESS-L2-031を親にしない）
paired_l5: ../L5-detail-design/common-kernel.md
base: main `d5bb3455526c816b3af965db239c4b56207a884f`

本書はK1/K2/K3/K4/K5/K6/K7/K8/K9/K10/G3/G5のL5公開契約とL9 fixture oracleを詳細fixtureへtraceする設計草稿である。契約はCommon Kernel L4の意味を保ち、期待値はPair L9の既存項目を展開したものとする。K9は§9でL4 §17/L9 IV-K9-01–15を、K7/G5は§10で既存K7/G5 oracleを下位化する。K8は§11でL4 §18/L9 IV-K8-01–26を下位化する。K10は§12でL4 §14/L9 IV-K10-01–14を下位化する。すべて未実行であり、pass、実装完成、L10成立を示さない。

## 1. 固定入力とtrace

| 入力 | revision・scope | SHA-256 |
|---|---|---|
| Common Kernel L4 | main `3961daac08d032ad512026e8365fafd9eae831c5`の本文pin：`docs/helix-harness/L4-basic-design/common-kernel.md` §2/§3/§9/§10/§13/§15/§16/§17/§18 | `3f7245e8fb548bab199107b1a020f0efea08713a5299076988326dae9feeb696` |
| Repository Layout L4 | main `3961daac08d032ad512026e8365fafd9eae831c5`の本文pin：`docs/helix-harness/L4-basic-design/repository-layout.md` §2–3、RL-C/D/T/K、§6.1/§10 | `6968876dad1760257686108064520e1e98783b6034ca19bac7d6c7df1a3385f1` |
| Common Kernel L9 | main `3961daac08d032ad512026e8365fafd9eae831c5`の本文pin：`docs/helix-harness/L9-integration-verification/common-kernel-integration-verification.md` K1/K2、IV-K3全27識別子、IV-K4-01–10、IV-G3-01–05、IV-K5-01–26、IV-K6-01–15、IV-K7-01–15、IV-G5-01–10、IV-LDG関連行、IV-K9-01–15、IV-K8-01–26 | `77f81138f3e323d98c16c7ea6c3be38e66d2aa36fc5a6b79986b6826e3facf52` |
| paired L5 | 本PRのcontent HEADへ含める本文pin：`docs/helix-harness/L5-detail-design/common-kernel.md` §3/§4/§6/§7/§8/§9/§10/§11/§12/§13 | SHA-256 `1fb52363e169d6210b197b678e68881b49c87cecbf6e79e1767282996549b90a` |
| Paired L7 | `docs/helix-harness/L7-unit-test-design/common-kernel-unit-test-design.md`; content SHA-256 `1016a36f768f5c607f9841c3c06376a8af199db220d46ab38644e14f06468415` (本PRのcontent HEAD) | L7 suite IDs and function mapping |

L9の各`IV-K1-*`/`IV-K2-*`/`IV-K3-*`/`IV-K5-*`は上流fixture要件であり、この文書のcaseをその下位観測へ対応させる。直接のL3 parentはL4 crosswalkに限定する。K1 §2.1のdirect parentはHARNESS AC-HARNESS-L3-022-02/030-02/032-02/032-03、CONNECT CONNECT-AC-002-01/006-02、LABO LABO-001-AC-02、INFRA INFRA-001-AC-01、SECURITY SECURITY-AC-001-01、BRAIN BRAIN-008-AC-02。K2 §3.1のdirect parentはHARNESS AC-HARNESS-L3-010-01/010-03/022-05/030-04/031-05/032-04、CONNECT CONNECT-AC-002-01、LABO LABO-001-AC-02、BRAIN BRAIN-008-AC-02、OS AC-OS-014-02、INTELLIGENCE AC-INT-010-06。K1-I6からK2 §3.1のHARNESS 030-04/032-04への参照はkey境界のcontract linkとして別記し、K1のdirect parentへ加えない。case表のtrace欄はdirect parentと、必要な場合だけ明示したboundary linkを区別する。 K5 §9.2の直接由来はConcept、CONNECT-AC-005-01、INTELLIGENCE-078-06/078-04/INT-063-03、LABO-001-AC-02/002-AC-03/050-AC-02、HARNESS-024-05に限る。K3の直接L3 traceはL4 §16.1のSECURITY ACに限定し、OS-014-04/-06はK7との境界参照のまま扱う。K5を共通kernelとして配置すること自体から、単一親要求やHARNESS-L2-031を追加しない。

K4/G3の直接親はL4 §13.1のHARNESS AC-HARNESS-L3-014-01〜04、021-02、036-04、041-02、OS AC-OS-018-01/023-02、CONNECT CONNECT-AC-006-03、INFRASTRUCTURE INFRA-005-AC-04、HARNESS AC-HARNESS-L3-049-05/022-01/02、SECURITY SECURITY-AC-026-01/02に限る。K4からK5/K6への接続はboundary linkであり直接親を追加しない。K4/G3の固定入力は既存L4 §13全体とL9 IV-K4-01〜10/IV-G3-01〜05である。K6はL4 §10.2 crosswalk記載の直接親に限り、L9 IV-K6-01〜15へ対応する。直接親にはOS AC-OS-018-01、AC-OS-023-02、AC-OS-029-03も含む。後続owner/consumerは直接親へ加えない。

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

K3とK5のfixtureはL4/L9が定める既存oracleを個別caseへ展開する。各caseは未実行であり、L5/L8の設計だけから実装passや物理writer enforcementを主張しない。K7/G5は§10で既存L4/L9契約を下位化し、K10は§12で既存L4/L9契約を下位化する。K9は§9、K8は§11で設計する。K3の直接L3 traceはL4 §16.1のSECURITY ACに限り、OS-014-04/-06はK7境界参照のまま扱う。K5のwriter/assignment接続は既存K7/K5/Ledger oracleを再利用し、初回bootstrapを新設しない。K9の直接親はL4 §17.1のConcept:236、AC-OS-029-03、AC-INTELLIGENCE-L3-072-08である。K9 fixtureの設計はL7 mappingや実行を意味しない。

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

## 7. K4/G3 fixtures

K4/G3 casesはL4 §13のK4不変条件6件とG3不変条件5件を、既存L9のK4 oracle 10件・G3 oracle 5件から個別に展開する。既存72 fixture IDは維持し、IV-G3-04(9)後半に対する構造assertionを1件追加する（計73件: K4 51件、G3 22件）。各fixtureは固定`ObligationSet`とそれぞれのoperation ownerの`OperationDecl`を前提とし、基準では他義務を肯定にする。L9が複合oracleとして明示する優先・受渡し集合はその全内容を保ち、ケースをまとめて一つの期待値にしない。

K4 APIを通るfixtureは、`input_heads`が指す固定K5 prefix内の`ResultRecorded`と固定参照からK5 `restore`、K2 `lookup`、K6 `required`/`admit_receipt`を通す。`evaluate`へreceipt、`inner`、`required_for`のcaller-made resultを直接注入しない。`VerifierSet`と`OperationDecl`は各ownerが固定したcurrent declarationとして準備し、変異時もsource revision/digestを整合させる。test fixtureは境界の設計例であり、K5/K6の実読・実行やowner登録の証拠ではない。`HumanInterface`についてはL4で指定された既存authority sourceを読むadapterのexact source/ownerが未決であるため、caller製`HumanDecision`を使うcaseへ置き換えない。accepted、record-only、sourceの有無/field変異を扱う各G3-I4 fixtureは、既存owner adapter/sourceへのbindingが確認できる場合だけ実施する。binding未確定なら該当fixtureは未実施とし、その状態を記録不在の`Unobserved`へ読み替えない。これは新しいgateではなく、既存sourceへの読取境界が未確定な範囲の条件付けである。

K4 direct L3 parent: HARNESS AC-HARNESS-L3-014-01–04/021-02/036-04/041-02、OS AC-OS-018-01/023-02、CONNECT CONNECT-AC-006-03、INFRASTRUCTURE INFRA-005-AC-04。G3 direct L3 parent: HARNESS AC-HARNESS-L3-049-05/022-01/02、SECURITY SECURITY-AC-026-01/02。各行のL9 IDは既存IVだけを指し、新しいoracleやIDを作らない。

| L8 case | L9 oracle | L5 API / L4 invariant | Fixtureと単一変異、期待 |
|---|---|---|---|
| `L8-K4-01-COMPLETE` | IV-K4-01 | `check_view`; K4-I1 | 固定ObligationSetの全obligation_idに対応する成分だけを持つviewを照合し、集合を通過させる。 |
| `L8-K4-01-MISSING` | IV-K4-01 | `check_view`; K4-I1 | 完全なsetの1義務の成分だけをviewから除く。該当IDは`Unknown(missing_input)`。 |
| `L8-K4-01-EXTRA` | IV-K4-01 | `check_view`; K4-I1 | 正常viewへsetに無いobligation_id成分だけを足す。`Unknown(unregistered)`。 |
| `L8-K4-01-EMPTY-SET` | IV-K4-01 | `evaluate`; K4-I1 / K1-I4 | `obligations=[]`の有効なsetをrestoreする。空義務をpositive扱いせず`set_reason=Unknown(missing_input)`。 |
| `L8-K4-01-NO-CALLER-SET` | IV-K4-01 | `evaluate`; K4-I1 | 公開signatureがsetのobligationsをcaller引数に持たず、set_keyから復元することを照合する。set injectionの引数を加える実装は不適合。 |
| `L8-K4-02-EXACT` | IV-K4-02 | `evaluate`; K2-I1 | 同じsource/rule/set keyを照会し、復元した`ObligationSet`を`Value`として使う。 |
| `L8-K4-02-SOURCE-REV-VALUE` | IV-K4-02 | `evaluate`; K2-I2 | 同identity sourceのrevisionだけを更新し旧記録をValueのまま残す。`Stale`。 |
| `L8-K4-02-SOURCE-REV-NONVALUE` | IV-K4-02 | `evaluate`; K2-I2 | L8-K4-02-SOURCE-REV-VALUEの旧record classだけを非Valueへ替える。`Unobserved(not_run,superseded)`。 |
| `L8-K4-02-SOURCE-SAME-REV-DIGEST` | IV-K4-02 | `evaluate`; K2-I2 | source revisionを固定してbytes/digestだけを変える。`Unknown(conflict)`。 |
| `L8-K4-02-RULE-VERSION` | IV-K4-02 | `evaluate`; K2-I2 | rule identityを固定しversionだけを更新する。`Unobserved(not_run)`。 |
| `L8-K4-02-RULE-SAME-VERSION-DIGEST` | IV-K4-02 | `evaluate`; K2-I2 | rule versionを固定しdigestだけを変える。`Unknown(conflict)`。 |
| `L8-K4-02-SOURCE-IDENTITY-ADD` | IV-K4-02 | `evaluate`; K2-I2 | derived_fromへsource identityを一件追加する。候補なし`Unobserved(not_run)`。 |
| `L8-K4-02-SOURCE-IDENTITY-REMOVE` | IV-K4-02 | `evaluate`; K2-I2 | derived_fromからsource identityを一件除く。候補なし`Unobserved(not_run)`。 |
| `L8-K4-03-OPERATION-BASE-KEYS` | IV-K4-03 | `evaluate`; K4-I4 | inputsとscopeが異なる二つのoperationの義務へ、それぞれ所有者のdeclから作った基底keyを使う。 |
| `L8-K4-03-DECL-REVISION` | IV-K4-03 | `evaluate`; K4-I4 / K2-I2 | set/target固定でOperationDeclのdependency revisionだけ更新し旧receiptのみ残す。該当義務は`Stale`。receipt側inputsを採る実装は不適合。 |
| `L8-K4-03-MISSING-DECL` | IV-K4-03 | `evaluate`; K4-I4 | 義務operationのdeclだけをcurrent mappingから欠く。該当成分は`Unknown(missing_input)`。 |
| `L8-K4-04-UNIT-POSITIVE-COMPOSITE-MISSING` | IV-K4-04 | `evaluate`; K4-I2 | unit義務receiptをすべて肯定にしcomposite義務のreceiptだけ欠く。compositeは`Unobserved(not_run)`で、全体`Positive`ではない。 |
| `L8-K4-04-OWN-RECEIPTS` | IV-K4-04 | `evaluate`; K4-I2 | unitとcompositeそれぞれの義務に対応する肯定receiptを用意する。各成分はそれぞれの義務自身のoracleから評価される。 |
| `L8-K4-05-NA-VALID` | IV-K4-05 | `evaluate`; K4-I3 / K1-I5 | reason/authority/reentry_triggerの揃ったNotApplicable義務を除外する。 |
| `L8-K4-05-DEFERRED-VALID` | IV-K4-05 | `evaluate`; K4-I3 | target_point/owner/discharge_conditionの揃ったDeferred義務は`Unobserved(pending_receipt)`として残す。 |
| `L8-K4-05-NA-MISSING-REASON` | IV-K4-05 | `evaluate`; K4-I3 | NotApplicableのreasonだけ欠く。`Unknown(invalid_disposition)`。 |
| `L8-K4-05-NA-MISSING-AUTHORITY` | IV-K4-05 | `evaluate`; K4-I3 | NotApplicableのauthorityだけ欠く。`Unknown(invalid_disposition)`。 |
| `L8-K4-05-NA-MISSING-REENTRY` | IV-K4-05 | `evaluate`; K4-I3 | NotApplicableのreentry_triggerだけ欠く。`Unknown(invalid_disposition)`。 |
| `L8-K4-05-DEFERRED-MISSING-TARGET` | IV-K4-05 | `evaluate`; K4-I3 | Deferredのtarget_pointだけ欠く。`Unknown(invalid_disposition)`。 |
| `L8-K4-05-DEFERRED-MISSING-OWNER` | IV-K4-05 | `evaluate`; K4-I3 | Deferredのownerだけ欠く。`Unknown(invalid_disposition)`。 |
| `L8-K4-05-DEFERRED-MISSING-DISCHARGE` | IV-K4-05 | `evaluate`; K4-I3 | Deferredのdischarge_conditionだけ欠く。`Unknown(invalid_disposition)`。 |
| `L8-K4-05-DEFERRED-DROPPED` | IV-K4-05 | `evaluate`; K4-I3 | 基準のDeferred成分だけを合成前に除く実装変異。期待`Unobserved(pending_receipt)`が失われるため不合格。 |
| `L8-K4-06-VERIFIERS-MATCH` | IV-K4-06 | `evaluate`; K4-I4 | required_for[o]とRequired機械/LLM義務が参照するverifier集合が一致し、各義務をID別に展開する。 |
| `L8-K4-06-REQUIRED-FOR-EXTRA` | IV-K4-06 | `evaluate`; K4-I4 | required_forだけにverifier identityを一つ追加する。該当成分は`Unknown(conflict)`。 |
| `L8-K4-06-OBLIGATION-EXTRA` | IV-K4-06 | `evaluate`; K4-I4 | 義務側だけにverifier identityを一つ追加する。該当成分は`Unknown(conflict)`。 |
| `L8-K4-06-INNER-NEGATIVE` | IV-K4-06 | `evaluate`; K4-I4/K6-I6 | receipt内の一検査のresultだけをnegativeにする。`{obligation_id, verifier, check}`を保ちconsumerまで否定を残す。 |
| `L8-K4-06-INNER-UNKNOWN` | IV-K4-06 | `evaluate`; K4-I4/K6-I6 | receipt内の一検査のresultだけをUnknownにする。同識別でnon-Valueを残す。 |
| `L8-K4-06-INNER-SET-REASON` | IV-K4-06 | `evaluate`; K4-I4/K6-I6/K1-I4 | receipt innerにset_reasonがある基準を用い、それを検査識別とともに消費側へ保持する。 |
| `L8-K4-07-DETERMINISTIC-NOT-REVERIFIED` | IV-K4-07 | `evaluate`; K4-I4/G3-I2 | 同一fixtureで独立に2 fieldを確認する。evaluate直後の`assurance.reproduction=Unobserved(not_run)`、および`assurance.issuer_authenticity=Unknown(unsupported)`。 |
| `L8-K4-07-REVERIFY-MATCH` | IV-K4-07 | `reverify_view`; K4-I4/G3-I2 | 同じadmitted deterministic receiptを再検証し、reproductionは`Value`。assuranceをobligation/verifier別に保持する。 |
| `L8-K4-07-LLM-EVALUATE` | IV-K4-07 | `evaluate`; G3-I3 | non-deterministic LLM verifierのreceiptを受け入れ、reproductionは`Unknown(unsupported)`。 |
| `L8-K4-07-LLM-REVERIFY` | IV-K4-07 | `reverify_view`; G3-I3 | LLM receiptを対象に再検証を要求してもreproductionは`Unknown(unsupported)`。 |
| `L8-K4-07-REVERIFY-MISMATCH` | IV-K4-07 | `reverify_view`; K4-I4 | deterministic receipt再実行のinner digestだけを不一致にする。reproductionは`Unknown(conflict)`。 |
| `L8-K4-07-ASSURANCE-PRESERVED` | IV-K4-07 | `evaluate`/`reverify_view`; K4-I4/K6-I10 | IV-K4-07の複合oracleを保つ同一fixtureについて、`{obligation_id, verifier}`別assuranceと`combined`を独立assertionで確認する。combinedだけ返す変異は不適合。 |
| `L8-K4-08-INHERIT-UNOBSERVED` | IV-K4-08 | `inherit`; K4-I5 | 旧revisionのUnobserved義務をinheritedへ結び、新revision receipt無しで新成分を`Unobserved(not_run)`にする。 |
| `L8-K4-08-POSITIVE-NOT-INHERITED` | IV-K4-08 | `inherit`; K4-I5/K2-I2 | 旧Positive記録だけを与え、新revision receiptを欠く。旧Positiveを流用せず、新revision成分は`Unobserved(not_run)`。 |
| `L8-K4-08-OLD-ABSENT-UNFINISHED` | IV-K4-08 | `inherit`; K4-I5 | 同一fixtureから独立に2 fieldをassertする。新setに無い旧未完義務のIDを`new view.inherited`に保持し、同じIDを`Handoff.unfinished`にも保持する。 |
| `L8-K4-09-RECEIVE-MATCH` | IV-K4-09 | `receive`; K4-I5 | from_viewから再計算した全unfinished/inheritedと一致するhandoffを受理する。 |
| `L8-K4-09-MISSING-NEW-UNFINISHED` | IV-K4-09 | `receive`; K4-I5 | Handoff.unfinishedから新setに属する旧未完義務一件だけを落とす。該当義務は`Unknown(missing_input)`。 |
| `L8-K4-09-MISSING-OLD-UNFINISHED` | IV-K4-09 | `receive`; K4-I5 | Handoff.unfinishedから新setに無い旧未完義務一件だけを落とす。該当義務は`Unknown(missing_input)`。 |
| `L8-K4-09-EXTRA-UNFINISHED` | IV-K4-09 | `receive`; K4-I5 | Handoff.unfinishedへ完了済み義務一件だけを加える。`Unknown(unregistered)`。 |
| `L8-K4-09-MISSING-NEW-INHERITED` | IV-K4-09 | `receive`; K4-I5 | unfinishedを保ち、新setに属する一件のinherited recordだけを除く。`Unknown(missing_input)`。 |
| `L8-K4-09-MISSING-OLD-INHERITED` | IV-K4-09 | `receive`; K4-I5 | unfinishedを保ち、新setに無い旧一件のinherited recordだけを除く。`Unknown(missing_input)`。 |
| `L8-K4-09-MISMATCH-NEW-INHERITED` | IV-K4-09 | `receive`; K4-I5 | unfinishedを保ち、新setに属する一件のinherited recordだけをfrom_viewの別記録へ替える。`Unknown(conflict)`。 |
| `L8-K4-09-MISMATCH-OLD-INHERITED` | IV-K4-09 | `receive`; K4-I5 | unfinishedを保ち、新setに無い旧一件のinherited recordだけをfrom_viewの別記録へ替える。`Unknown(conflict)`。 |
| `L8-K4-10-UNKNOWN-RETAINED` | IV-K4-10 | `evaluate`; K4-I6 | 一義務のreceipt resultだけをUnknownにする。非Value成分を除外してPositiveへしない。 |
| `L8-G3-01-KIND-FIXED` | IV-G3-01 | `evaluate`; G3-I1 | 固定setのoracle.kindを評価時に変更できる引数が無いことを確認し、固定kindの義務を評価する。 |
| `L8-G3-01-NEW-REVISION` | IV-G3-01 | `evaluate`; G3-I1/K2-I2 | 同一の固定scenarioで新revision query時、保存済み旧revision `Value`を返さず`Stale`になることをassertする。`oracle.kind`を変えた新revisionのObligationSetをcurrent keyで照会し、評価呼出し中にkindを差し替える入力経路は設けない。 |
| `L8-G3-01-KIND-REVISION` | IV-G3-01 | `evaluate`; G3-I1/K2-I2 | `L8-G3-01-NEW-REVISION`と同じ一変異scenarioの独立assertion。復元されたcurrent setの`oracle.kind`が新revisionの宣言値であり、旧recordからkindを採らないことを確認する。新しいfixture変異は加えない。 |
| `L8-G3-02-MECHANICAL-DETERMINISTIC` | IV-G3-02 | `evaluate`; G3-I2 | Mechanical義務に固定VerifierSetでdeterministicと宣言された正しいreceiptを使い、所定の機械検査結果を得る。 |
| `L8-G3-02-MECHANICAL-NONDETERMINISTIC` | IV-G3-02 | `evaluate`; G3-I2 | 同じMechanical義務のreceiptをnondeterministic verifier由来にする。`Unknown(unsupported)`。 |
| `L8-G3-03-LLM-ASSURANCE` | IV-G3-03 | `evaluate`; G3-I3 | LlmJudgment義務にnondeterministic verifierのreceiptを使い、assurance.reproduction=`Unknown(unsupported)`を残す。 |
| `L8-G3-03-LLM-UNKNOWN` | IV-G3-03 | `evaluate`; G3-I3 | 固定入力のLLM inner resultを`Unknown`にし、その同一class/reason/key/evidenceを成分に保持する。該当義務を肯定にしない。 |
| `L8-G3-04-ACCEPTED-MATCH` | IV-G3-04 | `evaluate`; G3-I4 | 同target/revision/scope/decision_kindのaccepted source recordを既存adapterが対応づけた前提で、requires_positive義務を肯定する。人への追加依頼を行わない。 |
| `L8-G3-04-NO-RECORD` | IV-G3-04 | `evaluate`; G3-I4 | 対象HumanDecision source recordを一件除く。`Unobserved(pending_receipt)`。 |
| `L8-G3-04-TARGET-IDENTITY` | IV-G3-04 | `evaluate`; G3-I4 | source recordのtarget identityだけを別値にする。`Unobserved(pending_receipt)`。 |
| `L8-G3-04-SCOPE` | IV-G3-04 | `evaluate`; G3-I4 | source recordのscopeだけを別値にする。`Unobserved(pending_receipt)`。 |
| `L8-G3-04-DECISION-KIND` | IV-G3-04 | `evaluate`; G3-I4 | source recordのdecision_kindだけを別値にする。`Unobserved(pending_receipt)`。 |
| `L8-G3-04-PENDING` | IV-G3-04 | `evaluate`; G3-I4 | decisionだけをpendingへ変える。`Unobserved(pending_receipt)`。 |
| `L8-G3-04-OLD-REVISION` | IV-G3-04 | `evaluate`; G3-I4/K2-I2 | HumanDecision.target.identityを保ち、target.revisionだけを義務のtargetとは異なる旧値にする。record自身のrevisionとの混同なし。`Stale`。 |
| `L8-G3-04-SAME-REV-DIGEST` | IV-G3-04 | `evaluate`; G3-I4/K2-I2 | HumanDecision.targetのidentity/revisionを義務と同じに保ち、target.digestだけを義務のtarget.digestと異ならせる。record自身のdigestとの混同なし。`Unknown(conflict)`。 |
| `L8-G3-04-REJECTED-REQUIRES-POSITIVE` | IV-G3-04 | `evaluate`; G3-I4 | requires_positive=trueの義務でdecisionだけをrejectedにする。該当obligation componentはL4 polarityどおり`Negative`。 |
| `L8-G3-04-REJECTED-RECORD-ONLY` | IV-G3-04 | `evaluate`; G3-I4 | requires_positive=falseの記録存在義務でdecisionだけをrejectedにする。該当obligation componentはL4 polarityどおり`Positive`。これは義務componentのassertionで、受入状態のprojectionを主張しない。 |
| `L8-G3-04-RECORD-ONLY-NO-ACCEPTANCE-OUTPUT` | IV-G3-04 | `evaluate` / `ObligationView`構造 | `L8-G3-04-REJECTED-RECORD-ONLY`と同じ固定source scenarioで、record-only obligation componentの`Positive`と、L4 `ObligationView`にacceptance-state fieldが定義されない構造をassertする。L9はこの経路を`Rejected`とするが、L4に対応するconsumer API/return variantはなく、このstructural assertionはL9 oracleを満たさない。API/reasonを追加せずL4/L9 ownerへ返す。 |
| `L8-G3-04-MACHINE-NOT-HUMAN` | IV-G3-04 | `evaluate`; G3-I4 | HumanDecision source recordが無く`Unobserved(pending_receipt)`となる基準入力へ、machine Positive receipt一件だけを加える。人記録の欠落は`Unobserved(pending_receipt)`のまま。 |
| `L8-G3-04-UNAUTHORIZED-KIND` | IV-G3-04 | `derive`; G3-I4 | 人の記録を求めない固定source/ruleでHumanInterface義務を導出しようとする。L4どおり`Rejected`。 |
| `L8-G3-05-COUNTS-ONLY` | IV-G3-05 | `ObligationSet` count observation; G3-I5 | `ObligationSet`からoracle kind別の義務数を数える値は情報に限る。consumer projection APIやそのoutput typeはL4で定義されていないため、本fixtureは新しいAPI/output fieldを定義しない。 |
| `L8-G3-05-NO-THRESHOLD` | IV-G3-05 | L4 API-surface structural check; G3-I5 | L5で定義済みのreturn typeに割合由来の合否/承認fieldが存在しないことを文書構造で確認する。L9の`Rejected`経路を実行・満足したとは扱わず、consumer API/reasonを新設しない。 |

G3-I4のaccepted/mismatch fixtureは既存authority source recordを既存adapterが読む契約のcase分割であり、`HumanDecision`を公開APIへ直接渡す入力ではない。source/adapterの具体的identityが既存文書で未確定な部分は、本fixture設計から補わない。上表の正常source fixtureは設計入力例に留まり、製品sourceの実在を主張しない。K4/G3のfixture IDは現行`design-manifest.json`およびCI verifier inventoryへ未登録であり、本書はそれらのCI coverageや実行を主張しない。inventory登録は別のPRで扱う。

## K4/G3 fixture 範囲終端

この見出しは、manifestが定めるK4/G3 fixtureおよびtyped reference抽出範囲の終端であり、既存K4/G3行はここより前に置く。

## 8. K6 fixture表

次のfixtureはL4 §10の不変条件とL9 IV-K6-01〜15を単体・詳細検証できるcaseへ展開する。各IDは一意なfixture identityであり、L9 IDは変えない。正常基準から変える条件は一つとする。L9が複数の登録検査/recordを必須構造とするcaseはその構造だけを保持し、別の変異を混ぜない。全fixtureは設計のみで未実行であり、K6 fixture IDsは現行local CI inventoryへ未登録のため、本節からCI coverageを主張しない。

### 8.1 K6 fixture一覧

| Fixture ID | L5関数 / L4 invariant | L9 oracle | 基準→単一条件 | 単一期待 |
|---|---|---|---|---|
| `L8-K6-01-BASE` | K5 `restore`→K2 `lookup`（`derive_receipt_key`は前処理）/ I3 | IV-K6-01 | query key・record key・body keyが一致 | lookup `Value`。 |
| `L8-K6-01-SUBJECT-REV` | K5 `restore`→K2 `lookup`（`derive_receipt_key`は前処理）/ I3 | IV-K6-01 | 対象identityを維持しsubject revisionのみ更新。旧recordはValue | lookup `Stale`。 |
| `L8-K6-01-SUBJECT-DIGEST` | K5 `restore`→K2 `lookup`（`derive_receipt_key`は前処理）/ I3 | IV-K6-01 | subject revision固定でdigestだけ更新 | lookup `Unknown(conflict)`。 |
| `L8-K6-01-SET-REV` | K5 `restore`→K2 `lookup`（`derive_receipt_key`は前処理）/ I3 | IV-K6-01 | VerifierSet identity維持でset revisionのみ更新 | lookup `Stale`。 |
| `L8-K6-01-SET-DIGEST` | K5 `restore`→K2 `lookup`（`derive_receipt_key`は前処理）/ I3 | IV-K6-01 | set revision固定でset bytes/digestだけ更新 | lookup `Unknown(conflict)`。 |
| `L8-K6-01-VERIFIER-DIGEST` | K5 `restore`→K2 `lookup`（`derive_receipt_key`は前処理）/ I3 | IV-K6-01 | verifier version固定でcode/config digestだけ更新 | lookup `Unknown(conflict)`。 |
| `L8-K6-01-VERIFIER-VERSION` | K5 `restore`→K2 `lookup`（`derive_receipt_key`は前処理）/ I3 | IV-K6-01 | verifier versionだけ新値へしreceipt key operation_versionへ追随 | lookup `Unobserved(not_run)`。 |
| `L8-K6-01-INPUT-ADD` | K5 `restore`→K2 `lookup`（`derive_receipt_key`は前処理）/ I3 | IV-K6-01 | base key inputsへidentityを1件だけ追加 | lookup `Unobserved(not_run)`。 |
| `L8-K6-01-INPUT-REMOVE` | K5 `restore`→K2 `lookup`（`derive_receipt_key`は前処理）/ I3 | IV-K6-01 | base key inputsからidentityを1件だけ削除 | lookup `Unobserved(not_run)`。 |
| `L8-K6-02-BASE` | `run` / I1 | IV-K6-02 | 呼出し側はverifierとbase keyだけ渡す | verifier側が`ReceiptBody`を生成しK5 append境界へ渡す。実行の真正性は主張しない。 |
| `L8-K6-02-CALLER-RESULT` | `run` / I1 | IV-K6-02 | base key以外にcaller result fieldだけを渡すattempt | `Rejected`。 |
| `L8-K6-02-CALLER-EXIT` | `run` / I1 | IV-K6-02 | base key以外にcaller exit fieldだけを渡すattempt | `Rejected`。 |
| `L8-K6-02-CALLER-OUTPUT-DIGEST` | `run` / I1 | IV-K6-02 | base key以外にcaller output digestだけを渡すattempt | `Rejected`。 |
| `L8-K6-03-BASE` | `match_verifier_entry` / I2 | IV-K6-03 | receipt VerifierRefがregistered memberのidentity/version/digest全fieldと一致 | `Value`。 |
| `L8-K6-03-UNREGISTERED-IDENTITY` | `match_verifier_entry` / I2 | IV-K6-03 | identityだけを未登録値へ変更し、receipt keyとdigestは再計算 | `Unknown(unregistered)`。 |
| `L8-K6-03-UNREGISTERED-VERSION` | `match_verifier_entry` / I2 | IV-K6-03 | versionだけを登録値と異なる値へ変更しkeyを再計算 | `Unknown(unregistered)`。 |
| `L8-K6-03-UNREGISTERED-DIGEST` | `match_verifier_entry` / I2 | IV-K6-03 | digestだけを登録値と異なる値へ変更しkeyを再計算 | `Unknown(unregistered)`。 |
| `L8-K6-04-DETERMINISTIC-CLAIM` | `admit_receipt`→`match_verifier_entry` / I2 | IV-K6-04 | VerifierEntry.deterministic=falseの基準。ReceiptBodyにdeterministic fieldはないため、別のcaller claimを追加してもK6 typed inputにはならない。 | これは型外claimの構造fixtureであり、actual member entryから導く`reverifiable=false`を保持する確認に限る。新field/decoder policy/result classは定めず、L9 IV-K6-04(1)全体の充足とは数えない（§8.3）。 |
| `L8-K6-04-CHECK-MAPPING-CLAIM` | `admit_receipt`→`rebuild_inner` / I2/I6 | IV-K6-04 | ReceiptBodyにmapping fieldは無い。実在する`inner` componentsとowner `VerifierEntry.checks`を固定し、保存`inner.verdict`だけをreceipt側で誤った肯定mappingを使った場合の`Positive` claimへ変える。body bytes/result digestをその変更に整合させる。 | owner `VerifierEntry.checks`が各`PolarityOf`の出所であることを構造比較する。保存inner claimと再合成`Combined`が不一致なら、L4 K6-I6どおり`Unknown(conflict)`を保持する。ただしL9 IV-K6-04(2)が求めるmapping-source assertionの全範囲をfixtureで閉じたとはせず、部分被覆として扱う（§8.3）。新field・unknown-field parser policyを作らない。 |
| `L8-K6-05-OLD-QUERY-RECEIPT` | `validate_receipt_key_body` / I3 | IV-K6-05 | query keyを維持し、対象旧revisionのotherwise-valid receiptを渡す | `Unknown(conflict)`。 |
| `L8-K6-05-INPUT-BODY` | `validate_receipt_key_body` / I3 | IV-K6-05 | `ReceiptBody`に独立したinputs fieldは置かない。query keyは固定し、`body.key.inputs`のref一つだけを差し替える。record keyとbody keyの他fieldを固定し、変更後のbody bytesからFixedRefのdigest、記録のresult_digestとlog連鎖を再計算する | query keyとのkey/body不一致により`Unknown(conflict)`。 |
| `L8-K6-05-VERIFIER-SET-BODY` | `validate_receipt_key_body` / I3 | IV-K6-05 | body.verifier_setだけをkeyと異なるrefへ変更 | `Unknown(conflict)`。 |
| `L8-K6-06-BASE` | `validate_read_set` / I4 | IV-K6-06 | read identity集合がsubject＋non-verifier inputsと一致し、各digestも一致 | admission境界を通る。 |
| `L8-K6-06-SUBJECT-MISSING` | `validate_read_set` / I4 | IV-K6-06 | expected readからsubject identityだけ除去し派生digestを再計算 | `Unknown(missing_input)`。 |
| `L8-K6-06-INPUT-MISSING` | `validate_read_set` / I4 | IV-K6-06 | expected readからoracle input identityだけ除去し派生digestを再計算 | `Unknown(missing_input)`。 |
| `L8-K6-06-READ-EMPTY` | `validate_read_set` / I4 | IV-K6-06 | read集合だけ空にし派生digestを再計算 | `Unknown(missing_input)`。 |
| `L8-K6-06-EXTRA-IDENTITY` | `validate_read_set` / I4 | IV-K6-06 | expected set外のidentityを一つreadへ追加 | `Unknown(conflict)`。 |
| `L8-K6-06-DIGEST-MISMATCH` | `validate_read_set` / I4 | IV-K6-06 | read digest一つだけをexpected refと不一致にする | `Unknown(conflict)`。 |
| `L8-K6-07-BASE` | `verify_fixed_outputs` / I5 | IV-K6-07 | output FixedRef bytesを実読したdigestと記録digestが一致 | output integrityを通る。 |
| `L8-K6-07-BYTES-MUTATED` | `verify_fixed_outputs` / I5 | IV-K6-07 | bytesだけ変更し記録digestは維持 | `Unknown(conflict)`。 |
| `L8-K6-07-OUTPUT-UNREADABLE` | `verify_fixed_outputs` / I5 | IV-K6-07 | output FixedRefだけを読めない参照へ変更 | `Unknown(unreadable)`。 |
| `L8-K6-08-BASE` | `rebuild_inner` / I6 | IV-K6-08 | registered/evaluated checksとVerifierEntry mappingが一致し、各checkをK1で合成 | 再合成inner `Positive`。 |
| `L8-K6-08-STORED-INNER-VERDICT` | `rebuild_inner` / I6 | IV-K6-08 | registered/evaluated checksから正常に再合成されるinnerを`Negative`にした整合基準を作る。check結果・mapping・他body fieldを固定し、保存inner verdictだけ`Positive`へ変更してbody digestを新bytesから再計算する | 保存innerと再合成innerが異なるため`Unknown(conflict)`。 |
| `L8-K6-08-UNREGISTERED-CHECK` | `rebuild_inner` / I6 | IV-K6-08 | registered setに無いcheck result一つを含める | `Unknown(unregistered)` componentを保持する。 |
| `L8-K6-09-BASE` | `required` / I7 | IV-K6-09 | A/B各registered check全件が肯定 | `required`の`RequiredResult.combined.verdict=Positive`で、A/B全check成分を含む。A/Bごとの三assurance fieldは`RequiredResult.assurance`にidentity別で保持する。`admit_receipt`の`Observed<AdmittedReceipt>`はmember単位の中間結果であり、`RequiredResult`のfieldではない。 |
| `L8-K6-09-NEGATIVE-AND-UNKNOWN` | `required` / I7 | IV-K6-09 | Aの一検査をNegative、一検査をUnknownにするL9指定の複合状態 | outer `Negative`。A両成分をverifier/check ID付きでreasonsへ保持する。 |
| `L8-K6-09-UNEVALUATED` | `required` / I7 | IV-K6-09 | Aのregistered check一つを未評価にする | outer `Undetermined`、`Unobserved(not_run)` component。receipt存在で肯定しない。 |
| `L8-K6-09-REGISTERED-ZERO` | `required` / I7 | IV-K6-09 | Aのregistered checksを0件にする | outer `Unknown(missing_input)` component。 |
| `L8-K6-09-ALL-NOT-APPLICABLE` | `required` / I7 | IV-K6-09 | A全checksを根拠のあるNotApplicableにする | outer `Unknown(missing_input)` component。 |
| `L8-K6-10-A-RECEIPT-MISSING` | `required` / I7 | IV-K6-10 | Aのreceiptを記録集合から除く | A component `Unobserved(not_run)`。 |
| `L8-K6-10-A-OLD-REVISION` | `required` / I7 | IV-K6-10 | Aの旧対象revision receiptだけを残す | A component `Stale`。 |
| `L8-K6-10-EXACT-PLUS-DIGEST-CONFLICT` | `required` / I7 | IV-K6-10 | A exact receiptと同identity/revision異digest receiptを共存させる | A component `Unknown(conflict)`。 |
| `L8-K6-10-SAME-KEY-RESULT-CONFLICT` | `required` / I7 | IV-K6-10 | Aの同一keyに異なるreceipt resultを2件置く | A component `Unknown(conflict)`。 |
| `L8-K6-10-SEGMENT-MISSING` | `required` / I7 | IV-K6-10 | operation scopeのsegment refをinput_headsから除く | A/B各componentへK5 restoreが返した同一の`Unknown(missing_input)`を伝播する。部分record lookupは行わない。 |
| `L8-K6-10-VERIFIER-VERSIONS-DIFFER` | `required` / I7 | IV-K6-10 | A/Bのregistered verifier versionを異なる値にする | 各verifier固有receipt keyで独立照会する。 |
| `L8-K6-10-C-NOT-SUBSTITUTE` | `required` / I7 | IV-K6-10 | Aを欠落させCのreceiptだけを追加する | Aは`Unobserved(not_run)`のまま。CでAを埋めない。 |
| `L8-K6-11-REPRODUCTION-MATCH` | `reverify` / I8 | IV-K6-11 | deterministic verifier同一入力で再実行したinner digestが一致 | `reproduction=Value`。 |
| `L8-K6-11-FORGED-INNER` | `reverify` / I8 | IV-K6-11 | receiptの一検査結果だけを変更し、関連digestを整合させる | `reproduction=Unknown(conflict)`。 |
| `L8-K6-11-NONDETERMINISTIC` | `reverify` / I8 | IV-K6-11 | non-deterministic entryを再現確認へ渡す | `reproduction=Unknown(unsupported)`。 |
| `L8-K6-12-NO-PAST-EXECUTION` | `reverify`→consumer / I8 | IV-K6-12 | 過去実行なしに同じinnerと整合digestを持つreceipt | 再検証が`Value`を返す場合に限り、その`reproduction=Value`を記録する。どの結果でも`issuer_authenticity=Unknown(unsupported)`を保持し、過去実行/時刻は出力しない。 |
| `L8-K6-12-EXECUTION-FIELDS-REWRITTEN` | `reverify`→consumer / I8 | IV-K6-12 | execution欄だけを整合digestで書き換える | 再検証が`Value`を返す場合に限り、その`reproduction=Value`を記録する。どの結果でも`issuer_authenticity=Unknown(unsupported)`を保持し、execution欄から過去実行を出力しない。 |
| `L8-K6-13-CORRECTION` | K5 append boundary / I9 | IV-K6-13 | receipt bodyを保持する既存`ResultRecorded`を対象にCorrectionを要求 | `Rejected`（K5-I8）。 |
| `L8-K6-14-TIME-ORDER` | K5 `restore`→K2 `lookup` / I9 | IV-K6-14 | 同一subject identityの異なる旧revisionに対する有効なprior Value receiptsを複数記録し、各key/body/result_digestを整合する。timestamp順とK5 append sequence順を逆にする。 | prior選択はK5-I7 sequence order。timestampで選ばない。K2 same-key異body conflictは作らない。 |
| `L8-K6-15-NO-AUTHORITY` | `required` result structure / I10 | IV-K6-15 | 既存`RequiredResult`は`combined`と`assurance`だけを持つこと、各receipt bodyの`authority_effect="none"`、L4 §10 API surfaceにauthority effect/approval/merge/acceptance/completion outputが無いことを構造確認する。RequiredResultへauthority_effect fieldを追加しない。 | これは構造fixtureであり、L9のconsumer `Rejected`経路はL4にAPI/return typeがなく未接続。このassertionはIV-K6-15(1)を満たしたことにせず、L4/L9 ownerへ返す（§8.3）。新API/reasonを足さない。 |
| `L8-K6-15-ASSURANCE-SEPARATE` | `required` result structure / I10 | IV-K6-15 | same fixed `RequiredResult`でreproduction=`Unknown(unsupported)`のAとreproduction=`Value`のBをassurance identity別に保持する。 | combinedからassuranceを消さず、異なる値を同等化しない。consumer rejectionは別の未接続oracleであり、このcaseの期待ではない。 |

各fixtureは独立したIDであり、`A/B/C`はIV-K6-09/10で指定されたverifier identityを表す。IV-K6-02のcaller field variantsは`run(verifier, base_key)`に対する型付きsignature-incompatible attemptであり、動的validator/reasonの実装は期待しない。正常基準に必要な他verifier・registered checks・scope inputsは固定し、指定した変異以外を変えない。`Rejected`はL9が理由を指定していないため、新reasonを加えない。

### 8.2 K6 case→invariant→API trace

| L9 IV | L4 invariant | L5 function/API | L8 fixture IDs |
|---|---|---|---|
| IV-K6-01 | K6-I3 | `derive_receipt_key` (private preflight), K5 `restore`→K2 `lookup` | `L8-K6-01-*` |
| IV-K6-02 | K6-I1 | `run` | `L8-K6-02-*` |
| IV-K6-03 | K6-I2 | `match_verifier_entry`, `admit_receipt` | `L8-K6-03-*` |
| IV-K6-04 | K6-I2 | `match_verifier_entry`, `rebuild_inner` | `L8-K6-04-*`（L9の一部範囲は§8.3の部分被覆） |
| IV-K6-05 | K6-I3 | `validate_receipt_key_body` | `L8-K6-05-*` |
| IV-K6-06 | K6-I4 | `validate_read_set` | `L8-K6-06-*` |
| IV-K6-07 | K6-I5 | `verify_fixed_outputs` | `L8-K6-07-*` |
| IV-K6-08 | K6-I6 | `rebuild_inner` | `L8-K6-08-*` |
| IV-K6-09 | K6-I7 | `required`, K1 `combine` | `L8-K6-09-*` |
| IV-K6-10 | K6-I7 | `required`, K2 `lookup` | `L8-K6-10-*` |
| IV-K6-11 | K6-I8 | `reverify` | `L8-K6-11-*` |
| IV-K6-12 | K6-I8 / E authenticity limit | `reverify`, consumer handoff | `L8-K6-12-*` |
| IV-K6-13 | K6-I9 | K5 append/correction boundary | `L8-K6-13-*` |
| IV-K6-14 | K6-I9 / K5-I7 order | K5 `restore`, K2 `lookup` | `L8-K6-14-*` |
| IV-K6-15 | K6-I10 | consumer handoff | `L8-K6-15-*`（構造assertionのみ。consumer `Rejected`は未接続、§8.3） |

### 8.3 保証限界と未決事項

`reproduction`, `issuer_authenticity`, `evidence integrity`は別項目である。再実行一致は同じ入力で結果が再現することだけを確かめ、過去実行、実行時刻、receipt issuerの真正性を証明しない。署名・attestation・外部固定が無い間は`issuer_authenticity=Unknown(unsupported)`を維持する。再現はできないdeterministic=false entryなら`reproduction=Unknown(unsupported)`である。これらを同一のpositiveへ縮約しない。

K6の`required_for`値と義務に対する必要verifier集合はK4-I4 owner declarationから読む。L5/L8は検証器名・集合値・operation policyを新たに決めない。K4 declarationの読取失敗/未登録時の詳細reasonがL4/L9で特定されない箇所は、ownerから来る既存non-valueを保持し、分類を追加しない。IV-K6-04(1)は`ReceiptBody`に`deterministic` fieldが無いため、L8構造fixtureが確認する`VerifierEntry`由来の`reverifiable=false`までを部分被覆とし、型外claimのparser結果はL4/L9 ownerへ返す。IV-K6-04(2)はL9 oracleがいう再合成と保存claimの照合について、L4のK6-I6が明記する既存`Unknown(conflict)`の範囲を超えて分類を追加しない。IV-K6-15(1) consumer `Rejected`はL4 §10にconsumer API/返却型がないため未接続であり、`L8-K6-15-NO-AUTHORITY`の構造確認をoracle充足として数えずL4/L9 ownerへ返す。K3のpermissionやauthorityをK6へ追加しない。


## 9. K9 独立review fixture設計

この節はL9 IV-K9-01–15の既存oracleを下位fixtureへ展開する。各行は独立ID、特定した基準、API、単一変異または変異なしcontrol、期待型を持ち、fixtureは未実行である。owner metadataやsourceが複数不在の状態は専用baselineとして明記し、単一変異と偽らない。既存L9の複合条件を分ける場合も各条件のoracleを変えない。実owner/schema/readerが未定義の行は、必要な入力を現在sourceから取得できたと主張せず「局所未接続」として残す。実在しない契約をfixture専用に定義しない。

### 9.1 共通fixture基準

- `L8-K9-BASE-INVENTORY`は、固定targetに一致するOS assignment、selection records、actual content-producer graph、登録済みsource closureおよび全coverage evidenceを入力する正常基準である。resolverが完全性を観測した場合の期待は`Observed<Value<{complete:true,slots,selections}>>`。owner graph/schema未提供時の実行は局所未接続であり、この合成基準を現行owner登録の証明として扱わない。
- `L8-K9-BASE-INVENTORY-OPTIONAL-NOT-SELECTED`は、必須roleの選択は完全に記録し、optional roleはowner selectionが`not_selected`でactual graphにも存在しない状態を固定する。これは正常基準であり、選択状態の変異を加えない。結果はそのroleを除いた`Observed<Value<{complete:true,slots,selections}>>`。
- `L8-K9-BASE-INVENTORY-EMPTY`は、すべてのcurrent sourceが読め、選択状態・graph・closure・coverageが互いに一致したうえで、creator-side slotが0件である状態を固定する。これは単一変異で作らず、L4の空集合規則を直接確認する基準である。期待は`Observed<Unknown(missing_input)>`。
- `L8-K9-BASE-INVENTORY-METADATA-ONLY`は、APIの全必須refを形式上そろえた状態で、owner source closureにproducer identityを供給する登録済みsourceがなく、読めるsourceにはcommit/publisher/provider/model metadataだけがある状態を固定する。これは複数のowner-source欠落を一つの変異として扱わないための専用基準であり、期待は`Observed<Unknown(unregistered)>`。metadata値をAPI引数に追加しない。
- `L8-K9-BASE-CHECK`は、上記inventoryの固定refとcurrent exact ReviewTarget、review execution originおよびowner-resolvedな全slot×4軸identityが揃い、rosterがnonempty/completeで全軸distinctとなる合成正常基準である。期待は`ReviewIndependenceCheck.result=Value(Independent)`、全component positive、`combined.verdict=Positive`。K6 `issuer_authenticity=Unknown(unsupported)`とnon-deterministic verifier entryの`reproduction=Unknown(unsupported)`は別assurance fieldに保持する。owner契約未提供時はcheckを実行できたと数えない。
- `L8-K9-BASE-CHECK-UNKNOWN-ONLY`は、他の全入力を`BASE-CHECK`と同じに保ち、owner contractで一軸の比較identityだけが未解決`Unknown(unsupported)`となる状態を固定する。baselineの期待は`ReviewIndependenceCheck.result=Unknown(unsupported)`、そのaxis componentのnon-value保持、`combined.verdict=Undetermined`である。
- `L8-K9-BASE-CHECK-CONTEXT-SHARED-RAW`は、creator/reviewerのcontext role-bound aliasesが同じraw SubjectRefを指し、owner contractも同じcontext comparison identityへ解決する状態を固定する。identity/authority/routeとtargetは完全かつdistinct。共有refはalias identityがrole/sideで異なるためK2 inputsへ両方残り、これは変異なしcontrolである。期待はcontext collisionによるNegative。
- `L8-K9-BASE-CHECK-AUTHORITY-COLLISION`は、全API ref/owner current recordが完全でbytes/digest整合済み、他の3軸がdistinct、authority owner contractがcreator/reviewerを同じexecution-authority comparison identityへ解決する状態を固定する。authority relationはsame、resultは`NotIndependent(authority_collision)`、combinedはNegative。この基準からauthority record metadataだけを一項目変える。
- `L8-K9-BASE-CHECK-AUTHORITY-SCHEMA-UNDEFINED`は、API refsをすべて完全に保ち、SECURITY owner authority mapping schemaだけが未定義の状態を固定する。record/refを欠落させず、期待はauthority relation/result `Unknown(unsupported)`、combined `Undetermined`。
- `L8-K9-BASE-CHECK-ROUTE-SCHEMA-UNDEFINED-WITH-LABELS`は、API refsが完全でroute owner comparison schemaだけが未定義、review execution sourceにはprovider/runtime/model labelsが残る状態を固定する。labelsはroute owner schema/identityではない。これは変異なしcontrolで、期待はroute relation/result `Unknown(unsupported)`、combined `Undetermined`。
- `L8-K9-BASE-CHECK-INVENTORY-UNKNOWN`は、APIのtargetと`creator_inventory: SubjectRef`を完全に保ち、その固定refのowner-source read結果だけが`Unknown(conflict)`となる状態を固定する。値の代りにUnknownをAPI引数へ渡さない。期待はL4 §17.3のreview early-return。
- `L8-K9-BASE-REVIEW-RECEIPT-PRESENT`は、有効candidateと同一current keyに結ばれた既存review receipt/resultが存在する状態を固定する。review receiptが存在することだけが差分であり、receipt内容や他inputは変えない。
- fresh API観測とK2 saved lookupは別fixture経路である。freshなsource mismatchはL4の`Unknown(conflict)`、保存値の旧revisionはK2 `Stale`、同revision digest conflictは`Unknown(conflict)`、identity集合差は`Unobserved(not_run)`とする。
- 上記`BASE-CHECK`とaxis collision baselinesはfresh comparison用で、prior K9 result recordを含まない。K2 saved lookup行だけが明示的にprior recordを持つ。
- `Value(Negative)`はK1 combined verdictであり、K9の`ReviewIndependence.outcome=NotIndependent`とは区別して両方の型付きfieldをassertする。`Unknown`はK1 component/resultのnon-value、API key作成失敗の`Rejected(missing_key)`は外側診断である。

### 9.2 IV-K9-01 — source boundaryと呼出し入力

直接trace: Concept:236、AC-OS-029-03、AC-INTELLIGENCE-L3-072-08。baselineは`L8-K9-BASE-INVENTORY`。

| Fixture ID | API | 単一変異 | 期待 |
|---|---|---|---|
| `L8-K9-01-CALLER-SLOTS` | `resolve_creator_inventory` | callerが引数として`slots`/`creator_slots`/`reviewer_slot`を渡す試みを追加する | L4 signatureに引数が無い。型不一致構造として呼出し経路を持たず、K1値や未定義reasonを生成しない。 |
| `L8-K9-01-METADATA-ONLY` | `resolve_creator_inventory` | `BASE-INVENTORY-METADATA-ONLY`を変異なしで照会する。これは複数owner-source欠落を含む専用baselineであり、single mutation caseではない | `Observed<Unknown(unregistered)>`。metadataからcreator identityを作らない。 |
| `L8-K9-01-ASSIGNMENT-MISSING` | `resolve_creator_inventory` | `current_assignment`と他の全API参照/K2 key refsを完全な`SubjectRef`のまま固定し、owner current assignment source内の必要なassignment fieldだけを欠かす。具体field/schemaはL4で未定義のためfield名を作らない | `Observed<Unknown(missing_input)>`。完全API refを欠いた時の`Rejected`をこのAPIへ追加しない。 |
| `L8-K9-01-SELECTION-SOURCE-MISSING` | `resolve_creator_inventory` | APIへ渡す全SubjectRefは完全なまま固定する。owner current selection sourceが示す選択済sourceのrequired source-reference dataだけを読取入力から欠かす（API ref自体を省かない） | `Observed<Unknown(missing_input)>`。 |
| `L8-K9-01-ACTUAL-GRAPH-MISSING` | `resolve_creator_inventory` | APIの`actual_content_producer_graph`を含む全SubjectRefは完全なまま固定する。owner graph sourceのrequired graph dataだけを欠かす（API ref自体を省かない） | `Observed<Unknown(missing_input)>`。 |
| `L8-K9-01-CLOSURE-UNREGISTERED` | `resolve_creator_inventory` | source closureのschema登録だけを欠かす | `Observed<Unknown(unregistered)>`。 |

### 9.3 IV-K9-02 — rosterの全量性とsource間照合

直接trace: AC-OS-029-03、AC-INTELLIGENCE-L3-072-08。baselineは`L8-K9-BASE-INVENTORY`。

| Fixture ID | API | 単一変異 | 期待 |
|---|---|---|---|
| `L8-K9-02-SOURCE-REF-MISSING` | `resolve_creator_inventory` | closure内の必須source ref一つだけを欠かす | `Observed<Unknown(missing_input)>`。 |
| `L8-K9-02-SELECTION-UNKNOWN` | `resolve_creator_inventory` | 一つのowner selection stateだけをunknownにする | `Observed<Unknown(missing_input)>`。unknownを`not_selected`へ変えない。 |
| `L8-K9-02-GRAPH-COMPLETENESS-UNPROVEN` | `resolve_creator_inventory` | source refは保ちactual graph全量性evidenceだけを未証明にする | `Observed<Unknown(unsupported)>`。 |
| `L8-K9-02-COVERAGE-EVIDENCE-MISSING` | `resolve_creator_inventory` | coverage evidence ref一つだけを欠かす | `Observed<Unknown(missing_input)>`。`Unobserved(pending_receipt)`へ写さない。 |
| `L8-K9-02-ROLE-SET-CONFLICT` | `resolve_creator_inventory` | completeなOS/selection sourcesに対してactual graphのrole集合だけを一つ異ならせる | `Observed<Unknown(conflict)>`。不足/追加slotと全差分を保持し、`NotIndependent`を作らない。 |
| `L8-K9-02-CURRENT-SOURCE-CONFLICT` | `resolve_creator_inventory` | caller refとowner current refの確定不一致を一件だけ与える | `Observed<Unknown(conflict)>`。古いcaller refで肯定しない。 |

### 9.4 IV-K9-03 — owner選択状態

直接trace: AC-OS-029-03、AC-INTELLIGENCE-L3-072-08。baselineは`L8-K9-BASE-INVENTORY`。

| Fixture ID | API | 単一変異 | 期待 |
|---|---|---|---|
| `L8-K9-03-OPTIONAL-NOT-SELECTED` | `resolve_creator_inventory` | `BASE-INVENTORY-OPTIONAL-NOT-SELECTED`を変異なしで照会する | `Observed<Value<...>>`でnot_selectedのroleをrosterから外し、他selection/slotは保持する。 |
| `L8-K9-03-SELECTION-ABSENT` | `resolve_creator_inventory` | `BASE-INVENTORY-OPTIONAL-NOT-SELECTED`からoptional roleのselection record一件だけを欠かす | `Observed<Unknown(missing_input)>`。明示not_selectedとrecord欠落を混同しない。 |
| `L8-K9-03-SELECTED-GRAPH-OMISSION` | `resolve_creator_inventory` | 選択済みsourceは維持しcomplete actual graphから対応slot一件だけを除く | `Observed<Unknown(conflict)>`。 |
| `L8-K9-03-CALLER-OVERRIDE` | `resolve_creator_inventory` | `selected_source_records`の一つだけをowner current selectionと不一致の旧refへ差し替える | `Observed<Unknown(conflict)>`。APIにselection claim入力はなく、caller refはcurrent owner sourceを上書きしない。 |

### 9.5 IV-K9-04 — 空のcreator集合

直接trace: AC-OS-029-03。baselineは`L8-K9-BASE-INVENTORY`。

| Fixture ID | API | 単一変異 | 期待 |
|---|---|---|---|
| `L8-K9-04-EMPTY-CREATORS` | `resolve_creator_inventory` | `BASE-INVENTORY-EMPTY`を変異なしで照会する | `Observed<Unknown(missing_input)>`。空集合の全称を真としてIndependentにしない。 |

### 9.6 IV-K9-05 — role-bound source aliasesと実読

直接trace: AC-OS-029-03、AC-INTELLIGENCE-L3-072-08。baselineは`L8-K9-BASE-CHECK`。aliasの形はL4 §3.4.1 `source_content`、binding bytesとraw bytesの照合はK6既存境界を使う。

| Fixture ID | API | 単一変異 | 期待 |
|---|---|---|---|
| `L8-K9-05-SHARED-RAW-REF` | `check_review_independence` | `BASE-CHECK-CONTEXT-SHARED-RAW`を変異なしで照会する。raw ref共有とowner-resolved same relationは基準入力で固定し、一方だけを変えない | K2 alias/bindingは両役割を保持。`ReviewIndependenceCheck.result=Value(NotIndependent(context_collision))`、`combined.verdict=Negative`。raw ref重複を`duplicate_identity`へ送らない。 |
| `L8-K9-05-ROLE-BINDING-SWAP` | `check_review_independence` | 同じsource refsを保ち、binding内の二roleとの対応だけを入れ替える | ParticipantBindingSet canonical bytes/digestとK2 keyが変わる。旧keyのValueを再利用しない。 |
| `L8-K9-05-ALIAS-IDENTITY-CONFLICT` | `check_review_independence` | 同一alias identityへ異なるraw SubjectRefを一つ追加する | key作成前`Rejected(missing_key, diagnostic)`。K1 Unknownへ変換しない。 |
| `L8-K9-05-BINDING-BYTES-DRIFT` | K6 `admit_receipt(record, query_key, verifier_set)`境界（K9 `check_review_independence`への投影は未接続） | binding bytesだけを固定ref digestと不一致にする | K6 admissionは`Unknown(conflict)`。これはK9 `assurance`へ混ぜず、独立したK6 source診断として保持する。K9 `result`/`components`/`combined`へのprojectionはL4/L9で定義されないため局所holdとしてK9 ownerへ戻し、K9全体結果を捏造しない。 |
| `L8-K9-05-RAW-SOURCE-BYTES-DRIFT` | K6 `admit_receipt(record, query_key, verifier_set)`境界（K9 `check_review_independence`への投影は未接続） | alias原source bytesだけをそのraw digestと不一致にする | K6 admissionは`Unknown(conflict)`であり、binding読取をraw source読取へ代用しない。K6 conflictはK9 `assurance`ではない。K9 result/components/combinedへのprojectionはL4/L9で未定義のため局所holdとしてK9 ownerへ戻し、K9全体結果を捏造しない。 |

### 9.7 IV-K9-06 — identity collision

直接trace: AC-OS-029-03。baselineは`L8-K9-BASE-CHECK`。

| Fixture ID | API | 単一変異 | 期待 |
|---|---|---|---|
| `L8-K9-06-ORIGINAL-WORKER` | `check_review_independence` | reviewerのowner-resolved identityをoriginal workerと同一にする | 該当identity component=`Value(same)`、`result=Value(NotIndependent(identity_collision))`、combined Negative。 |
| `L8-K9-06-HELPER` | `check_review_independence` | reviewer identityだけをhelperと同一にする | 同上。 |
| `L8-K9-06-TEST-AUTHOR` | `check_review_independence` | reviewer identityだけをtest authorと同一にする | 同上。 |
| `L8-K9-06-CONSULTANT` | `check_review_independence` | reviewer identityだけをconsultantと同一にする | 同上。 |
| `L8-K9-06-SUBAGENT` | `check_review_independence` | reviewer identityだけをcreator-side subagentと同一にする | 同上。作成側が起用したsubagentを独立reviewerにしない。 |

### 9.8 IV-K9-07 — context collisionとReviewTarget exact binding

直接trace: AC-OS-029-03、AC-INTELLIGENCE-L3-072-08。collision基準は`L8-K9-BASE-CHECK`、target mutationのK2 saved-lookup基準は同一identity current targetに保存したprior Value。

| Fixture ID | API | 単一変異 | 期待 |
|---|---|---|---|
| `L8-K9-07-CONTEXT-COLLISION` | `check_review_independence` | reviewer context owner-resolved identityだけをcreator contextと同一にする | `Value(NotIndependent(context_collision))`、combined Negative。 |
| `L8-K9-07-TARGET-ARTIFACT-FRESH` | `check_review_independence` | fresh ReviewTargetのartifact identityだけをowner current targetと異ならせる | `ReviewIndependenceCheck.result=Unknown(conflict)`。target mismatchのcomponent/combined表現はL4に型が定義されていないため局所未接続とし、新componentを作らない。 |
| `L8-K9-07-TARGET-BASE-FRESH` | `check_review_independence` | base identityだけを確定不一致にする | `ReviewIndependenceCheck.result=Unknown(conflict)`。target mismatchのcomponent/combined表現はL4に型が定義されていないため局所未接続とし、新componentを作らない。 |
| `L8-K9-07-TARGET-SCOPE-FRESH` | `check_review_independence` | task_scope identityだけを確定不一致にする | `ReviewIndependenceCheck.result=Unknown(conflict)`。target mismatchのcomponent/combined表現はL4に型が定義されていないため局所未接続とし、新componentを作らない。 |
| `L8-K9-07-TARGET-ORACLE-FRESH` | `check_review_independence` | oracle identityだけを確定不一致にする | `ReviewIndependenceCheck.result=Unknown(conflict)`。target mismatchのcomponent/combined表現はL4に型が定義されていないため局所未接続とし、新componentを作らない。 |
| `L8-K9-07-TARGET-RESULT-FRESH` | `check_review_independence` | current_result identityだけを確定不一致にする | `ReviewIndependenceCheck.result=Unknown(conflict)`。target mismatchのcomponent/combined表現はL4に型が定義されていないため局所未接続とし、新componentを作らない。 |
| `L8-K9-07-TARGET-CASE-FRESH` | `check_review_independence` | case identityだけを確定不一致にする | `ReviewIndependenceCheck.result=Unknown(conflict)`。target mismatchのcomponent/combined表現はL4に型が定義されていないため局所未接続とし、新componentを作らない。 |
| `L8-K9-07-SAVED-OLD-REVISION` | K2 `lookup` | targetを同一identityの旧revisionへ保持し、current query revisionだけを進める | prior `Value`に対し`Stale`。fresh mismatchの代替にしない。 |
| `L8-K9-07-SAVED-SAME-REV-DIGEST` | K2 `lookup` | 保存済みcurrent keyのtarget digestだけをqueryと不一致にする | `Unknown(conflict)`。 |
| `L8-K9-07-SAVED-IDENTITY-SET` | K2 `lookup` | queryのtarget identity setだけをprior keyと異ならせる | `Unobserved(not_run)`。 |

### 9.9 IV-K9-08 — authority identityとowner record

直接trace: AC-OS-029-03、SECURITY owner boundaryはL4 §17.2/§17.3。baselineは`L8-K9-BASE-CHECK`。authority comparisonはpermission可否でなくowner contractがresolveした実行authority identityの比較。

| Fixture ID | API | 単一変異 | 期待 |
|---|---|---|---|
| `L8-K9-08-AUTHORITY-COLLISION` | `check_review_independence` | `BASE-CHECK-AUTHORITY-COLLISION`を変異なしで照会する | 該当`ReviewAxisCheck.relation=Value(same)`、`ReviewIndependenceCheck.result=Value(ReviewIndependence{outcome:NotIndependent(authority_collision)})`、`combined.verdict=Negative`。 |
| `L8-K9-08-REF-MISSING` | `check_review_independence` | `BASE-CHECK`からauthority owner record bytes内の必須source reference field一つだけを欠かす。API引数`authority_owner_record`と全K2 key refsは完全なSubjectRefのまま | authority relation=`Unknown(missing_input)`、`ReviewIndependenceCheck.result=Unknown(missing_input)`、`combined.verdict=Undetermined`。API key欠落の`Rejected(missing_key)`とは分離し、他axis componentsは保持する。 |
| `L8-K9-08-SCHEMA-UNDEFINED` | `check_review_independence` | `BASE-CHECK-AUTHORITY-SCHEMA-UNDEFINED`を変異なしで照会する。API refs/record refsは欠かさない | authority relation=`Unknown(unsupported)`、`ReviewIndependenceCheck.result=Unknown(unsupported)`、`combined.verdict=Undetermined`。 |
| `L8-K9-08-CURRENT-RECORD-UNREGISTERED` | `check_review_independence` | 定義済みschemaは保ちcurrent owner recordの登録だけを欠かす | authority relation=`Unknown(unregistered)`、`ReviewIndependenceCheck.result=Unknown(unregistered)`、`combined.verdict=Undetermined`。 |
| `L8-K9-08-MAPPING-UNSUPPORTED` | `check_review_independence` | recordは存在するがowner contractがrecord→authority identity対応を解決できない | authority relation=`Unknown(unsupported)`、`ReviewIndependenceCheck.result=Unknown(unsupported)`、`combined.verdict=Undetermined`。 |
| `L8-K9-08-RECORD-REVISION-ONLY` | `check_review_independence` | `BASE-CHECK-AUTHORITY-COLLISION`からvalid current owner recordのrevision fieldだけを更新し、owner-current SubjectRef revisionとbytes digestを新しいrecordに整合させる。raw bytes corruptionではない | owner-resolved authority identityはsameのまま、authority relation=`Value(same)`、`ReviewIndependenceCheck.result=Value(NotIndependent(authority_collision))`、`combined.verdict=Negative`。 |
| `L8-K9-08-OPERATION-ONLY` | `check_review_independence` | `BASE-CHECK-AUTHORITY-COLLISION`からvalid current owner recordのoperation fieldだけを更新し、current ref digestを新record bytesと整合させる。record revision/identityとauthority identityは維持 | authority relation=`Value(same)`、`ReviewIndependenceCheck.result=Value(NotIndependent(authority_collision))`、`combined.verdict=Negative`。 |
| `L8-K9-08-TARGET-ONLY` | `check_review_independence` | `BASE-CHECK-AUTHORITY-COLLISION`からvalid current owner recordのtarget fieldだけを更新し、current ref digestを新record bytesと整合させる。record revision/identityとauthority identityは維持 | authority relation=`Value(same)`、`ReviewIndependenceCheck.result=Value(NotIndependent(authority_collision))`、`combined.verdict=Negative`。 |
| `L8-K9-08-SOURCE-ONLY` | `check_review_independence` | `BASE-CHECK-AUTHORITY-COLLISION`からvalid current owner recordのsource fieldだけを更新し、current ref digestを新record bytesと整合させる。record revision/identityとauthority identityは維持 | authority relation=`Value(same)`、`ReviewIndependenceCheck.result=Value(NotIndependent(authority_collision))`、`combined.verdict=Negative`。 |
| `L8-K9-08-OWNER-RESOLVED-DISTINCT` | `check_review_independence` | `BASE-CHECK-AUTHORITY-COLLISION`からowner contractが解決するcomparison identityだけをdistinctへ更新し、current record/ref/bytesは整合させる。他軸・target・rosterは固定 | 該当authority relation=`Value(distinct)`。他axis・rosterもpositiveなら`ReviewIndependenceCheck.result=Value(Independent)`、`combined.verdict=Positive`。 |

### 9.10 IV-K9-09 — context/route owner contracts

直接trace: AC-OS-029-03、AC-INTELLIGENCE-L3-072-08。baselineは`L8-K9-BASE-CHECK`。

| Fixture ID | API | 単一変異 | 期待 |
|---|---|---|---|
| `L8-K9-09-CONTEXT-SCHEMA-UNDEFINED` | `check_review_independence` | context owner comparison schemaだけを未定義にする | context relation=`Unknown(unsupported)`、`ReviewIndependenceCheck.result=Unknown(unsupported)`、`combined.verdict=Undetermined`。 |
| `L8-K9-09-CONTEXT-CURRENT-UNREGISTERED` | `check_review_independence` | context schemaは既知だがcurrent declarationだけを未登録にする | context relation=`Unknown(unregistered)`、`ReviewIndependenceCheck.result=Unknown(unregistered)`、`combined.verdict=Undetermined`。 |
| `L8-K9-09-ROUTE-SCHEMA-UNDEFINED` | `check_review_independence` | route owner comparison schemaだけを未定義にする | route relation=`Unknown(unsupported)`、`ReviewIndependenceCheck.result=Unknown(unsupported)`、`combined.verdict=Undetermined`。 |
| `L8-K9-09-ROUTE-CURRENT-UNREGISTERED` | `check_review_independence` | route schemaは既知だがcurrent declarationだけを未登録にする | route relation=`Unknown(unregistered)`、`ReviewIndependenceCheck.result=Unknown(unregistered)`、`combined.verdict=Undetermined`。 |
| `L8-K9-09-ROUTE-COLLISION` | `check_review_independence` | reviewer owner-resolved route identityだけをcreator routeと同一にする | route relation=`Value(same)`、`ReviewIndependenceCheck.result=Value(NotIndependent(route_collision))`、`combined.verdict=Negative`。 |
| `L8-K9-09-PROVIDER-ONLY` | `check_review_independence` | `BASE-CHECK-ROUTE-SCHEMA-UNDEFINED-WITH-LABELS`を変異なしで照会する。route schema/sourceの欠落とlabels存在を専用baselineへ含め、複合状態を一変異と呼ばない | route relation=`Unknown(unsupported)`、`ReviewIndependenceCheck.result=Unknown(unsupported)`、`combined.verdict=Undetermined`。provider/runtime/model labelからrouteを作らない。 |

### 9.11 IV-K9-10 — 四軸合成と混在結果

直接trace: AC-OS-029-03。baselineは`L8-K9-BASE-CHECK`。各行は一軸だけをowner-resolved values上で変える。

| Fixture ID | API | 単一変異 | 期待 |
|---|---|---|---|
| `L8-K9-10-IDENTITY-SAME` | `check_review_independence` | identity axisだけsameにする | identity relation=`Value(same)`、`ReviewIndependenceCheck.result=Value(NotIndependent(identity_collision))`、`combined.verdict=Negative`。 |
| `L8-K9-10-CONTEXT-SAME` | `check_review_independence` | context axisだけsameにする | context relation=`Value(same)`、`ReviewIndependenceCheck.result=Value(NotIndependent(context_collision))`、`combined.verdict=Negative`。 |
| `L8-K9-10-AUTHORITY-SAME` | `check_review_independence` | authority axisだけsameにする | authority relation=`Value(same)`、`ReviewIndependenceCheck.result=Value(NotIndependent(authority_collision))`、`combined.verdict=Negative`。 |
| `L8-K9-10-ROUTE-SAME` | `check_review_independence` | route axisだけsameにする | route relation=`Value(same)`、`ReviewIndependenceCheck.result=Value(NotIndependent(route_collision))`、`combined.verdict=Negative`。 |
| `L8-K9-10-IDENTITY-REF-ONLY` | `check_review_independence` | `IDENTITY-SAME`のowner-resolved identityを保ったままidentity ref bytesだけを一つ差し替える | owner-resolved identity relation=`Value(same)`を維持し`ReviewIndependenceCheck.result=Value(NotIndependent(identity_collision))`、`combined.verdict=Negative`。ref差だけでdistinctにしない。 |
| `L8-K9-10-CONTEXT-REF-ONLY` | `check_review_independence` | `CONTEXT-SAME`のowner-resolved contextを保ったままcontext ref bytesだけを一つ差し替える | owner-resolved context relation=`Value(same)`を維持し`ReviewIndependenceCheck.result=Value(NotIndependent(context_collision))`、`combined.verdict=Negative`。 |
| `L8-K9-10-AUTHORITY-REF-ONLY` | `check_review_independence` | `AUTHORITY-SAME`のowner-resolved authorityを保ったままauthority ref bytesだけを一つ差し替える | owner-resolved authority relation=`Value(same)`を維持し`ReviewIndependenceCheck.result=Value(NotIndependent(authority_collision))`、`combined.verdict=Negative`。 |
| `L8-K9-10-ROUTE-REF-ONLY` | `check_review_independence` | `ROUTE-SAME`のowner-resolved routeを保ったままroute ref bytesだけを一つ差し替える | owner-resolved route relation=`Value(same)`を維持し`ReviewIndependenceCheck.result=Value(NotIndependent(route_collision))`、`combined.verdict=Negative`。 |
| `L8-K9-10-SAME-PLUS-UNKNOWN` | `check_review_independence` | `BASE-CHECK-UNKNOWN-ONLY`から、別の一軸だけをowner-resolved `Value(same)`へ変更する | 該当する既存軸理由（identity/context/authority/route_collision）の`ReviewIndependenceCheck.result=Value(NotIndependent(...))`と、基準から保持する別軸`Unknown(unsupported)`を残す。`combined.verdict=Negative`で全`non_values`を保持する。 |
| `L8-K9-10-UNKNOWN-ONLY` | `check_review_independence` | baselineの一軸だけをUnknown(unsupported)へ変更する | relation=`Unknown(unsupported)`、`ReviewIndependenceCheck.result=Unknown(unsupported)`、`combined.verdict=Undetermined`。 |
| `L8-K9-10-INVENTORY-PARTIAL-SAME` | `check_review_independence` | creator inventoryだけをUnknown(conflict)にし、読み取れた部分refにsameらしい値を残す | L4 early-returnどおり`ReviewIndependenceCheck.result=Unknown(conflict)`、roster completeness Unknown component一件、`combined.verdict=Undetermined`とそのnon_valuesを保持する。 |
| `L8-K9-10-EMPTY-INVENTORY` | `resolve_creator_inventory`（`L8-K9-04-EMPTY-CREATORS`のtrace alias） | `L8-K9-04-EMPTY-CREATORS`と同じ`BASE-INVENTORY-EMPTY`を変異なしで再利用する。これは独立した二つ目のfixtureやroster mutationではない | `Observed<Unknown(missing_input)>`。空集合をIndependentとせず、K9-04と同一の期待を再利用する。 |

### 9.12 IV-K9-11 — candidate/review段階分離

直接trace: AC-INTELLIGENCE-L3-072-08。baselineはvalid candidate/sourceがあり、review receiptだけを未観測にした状態。

| Fixture ID | API | 単一変異 | 期待 |
|---|---|---|---|
| `L8-K9-11-PENDING-REVIEW` | K4 `evaluate(set_key, decls, verifier_set, input_heads)`（既存`L8-K4-05-DEFERRED-VALID`のtrace alias。K9 APIからのprojectionではない） | `L8-K4-05-DEFERRED-VALID`と同じ有効な`ObligationSet`/decls/verifier set/input headsを変異なしで再利用する。Deferred義務に対応するreceipt未着はこの既存baselineに含まれ、新しい変異・独立fixtureは作らない | `Observed<Value<ObligationView>>`内の該当義務成分は`Unobserved(pending_receipt)`。これはK4の既存Deferred semanticsであり、K9 `ReviewIndependenceCheck`のresult/componentを表さない。L9 IV-K9-11のK9 candidate/sourceとreviewの段階を結ぶAPIはL4/L9にないため、そのprojectionは未接続のまま保持し、新gate・K9成功/negativeを生成しない。 |

### 9.13 IV-K9-12 — same-scope evidence再利用

直接trace: AC-INTELLIGENCE-L3-072-08。baselineはK2 current exact keyに結ばれたprior `Value` evidence。

| Fixture ID | API | 単一変異 | 期待 |
|---|---|---|---|
| `L8-K9-12-EXACT-REUSE` | K2 `lookup` | 変異なし、same current exact key evidenceを再照会する | prior `Value`を再利用し、新しいWorker実験を要求しない。 |
| `L8-K9-12-TARGET-REVISION` | K2 `lookup` | artifact targetの同一identity revisionだけを進める | prior `Value`に対し`Stale`。 |
| `L8-K9-12-ROLE-ALIAS-IDENTITY` | K2 `lookup` | 一つのrole-bound alias identityだけを別slot identityへ変え、raw source refsは保持する | K2 inputs identity集合が変わるため`Unobserved(not_run)`。prior positiveを再利用しない。 |
| `L8-K9-12-OWNER-CONTRACT-DIGEST` | K2 `lookup` | owner comparison contract refのdigestだけを同revisionで変える | `Unknown(conflict)`。 |
| `L8-K9-12-SCOPE` | K2 `lookup` | task scopeだけを変える | prior resultをcurrentへ流用せず`Unobserved(not_run)`。 |

### 9.14 IV-K9-13 — K2 conflictとnon-value

直接trace: Concept:236、AC-INTELLIGENCE-L3-072-08。基準は同一K2 keyに保存済みresult。

| Fixture ID | API | 単一変異 | 期待 |
|---|---|---|---|
| `L8-K9-13-SAME-KEY-SAME-DIGEST` | K2 `record` | 同じkey/result digestを再記録する | `NoOp`（冪等）。 |
| `L8-K9-13-SAME-KEY-DIFFERENT-DIGEST` | K2 `record` / `lookup` | 同一key result digestだけを異ならせる | 両recordを保持し`Conflict`、lookup `Unknown(conflict)`。 |
| `L8-K9-13-REQUIRED-INPUT-MISSING` | `check_review_independence` | API引数およびK2 keyに必要なSubjectRefはすべて完全に保ち、owner current source bytesから必須source reference field一つだけを欠かす | API結果componentに`Unknown(missing_input)`。API key field自体の欠落による`Rejected(missing_key)`ではない。 |
| `L8-K9-13-REVIEW-NOT-RUN` | K2 `lookup` | current key/inputsは固定し、matching recordだけを未作成にする | `Unobserved(not_run)`。positiveに丸めない。 |
| `L8-K9-13-KEY-UNAVAILABLE` | `check_review_independence` | 必須K2 identity/ref bindingを欠かしkeyを構成不能にする | 公開APIの外側`Rejected(missing_key, diagnostic)`。K1 UnknownやK2 resultへ流用しない。 |

### 9.15 IV-K9-14 — K6 assuranceとauthority境界

直接trace: AC-OS-029-03、AC-INTELLIGENCE-L3-072-08。baselineは`L8-K9-BASE-CHECK`のK6 assurance付き出力。

| Fixture ID | API | 単一変異 | 期待 |
|---|---|---|---|
| `L8-K9-14-ISSUER-UNSUPPORTED` | `check_review_independence` | `BASE-CHECK`を変異なしcontrolとして照会する。K6 `issuer_authenticity`は既存baselineどおり`Unknown(unsupported)` | assuranceの同fieldに保持し、K9 relation/combinedをそれだけで変えず、実actor authenticityを主張しない。 |
| `L8-K9-14-REPRODUCTION-UNKNOWN` | `check_review_independence` | `BASE-CHECK`に含む既存non-deterministic verifier entryを変異なしで照会する。K6既存mappingの`reproduction=Unknown(unsupported)`を基準とする | K6 assurance欄に`Unknown(unsupported)`を保持し、Verified/Acceptedを生成しない。新reasonを作らない。 |
| `L8-K9-14-AUTHORITY-EFFECT` | `check_review_independence` | 実装変異で`authority_effect`を`none`以外へ変更する | L4の固定出力shape不一致として構造negative。新しいK1 class/reasonやauthorityを作らない。 |
| `L8-K9-14-NO-COMPLETION` | `check_review_independence` | independent positiveだけを得る | 結果にfinding count/acceptance/completion outputを持たない。形式境界を確認し、外部作用を行わない。 |

### 9.16 IV-K9-15 — inventory keyとearly-return

直接trace: AC-OS-029-03、AC-INTELLIGENCE-L3-072-08。baselineは`L8-K9-BASE-INVENTORY`をK2 current recordとして保存し、check側で同じcurrent inventory ref/admissionを再照合する。

| Fixture ID | API | 単一変異 | 期待 |
|---|---|---|---|
| `L8-K9-15-OPERATION-VERSION` | K2 `lookup` / `check_review_independence` | inventory `operation_version`だけを変更する | `Unobserved(not_run)`。旧inventoryを再利用しない。 |
| `L8-K9-15-SUBJECT` | K2 `lookup` | current assignment subject identityだけを変更する | identity-set differenceとして`Unobserved(not_run)`。 |
| `L8-K9-15-TARGET-INPUT` | K2 `lookup` | ReviewTargetの一つのinput identityだけを変える | `Unobserved(not_run)`。他target refs固定。 |
| `L8-K9-15-OWNER-CLOSURE-INPUT` | K2 `lookup` | closure/coverage input ref一つだけを同revision異digestにする | `Unknown(conflict)`。 |
| `L8-K9-15-SCOPE` | K2 `lookup` | assignment task scopeだけを変更する | `Unobserved(not_run)`。 |
| `L8-K9-15-INVENTORY-EARLY-RETURN` | `check_review_independence` | 完全なAPI `creator_inventory` SubjectRefと他の全API refsを固定し、そのrefのresolver/read resultだけを`Unknown(conflict)`にする | L4 §17.3どおりreview operation自身の鍵付き`Unknown(conflict)`、roster completeness Unknown component一件、combined Undetermined、そのnon_valuesを保持。四軸checks/ReviewIndependence Valueを作らない。 |
| `L8-K9-15-EARLY-RETURN-KEY-MISSING` | `check_review_independence` | `BASE-CHECK-INVENTORY-UNKNOWN`を基準にし、早期return review keyに必要なReviewTarget ref一つだけをAPI入力から欠かす | `Rejected(missing_key, diagnostic)`。inventory resultやinventory keyをreview keyへ代用しない。 |

L9逆trace: 上記fixture IDの各々は列挙された一つの`IV-K9-*`へ戻り、各oracleはL4 §17のK9-I1–I8、§17.3 key/early-return規則および直接親Concept:236、AC-OS-029-03、AC-INTELLIGENCE-L3-072-08へ戻る。1 fixtureが複数IVを代用したとは数えない。

### 9.17 未接続・保証されない範囲

現L4/L9でowner schema/read adapterが定義されていないため、K9 actual source traversal、OS assignmentからのcomplete producer roster構築、context/route/SECURITY authority identityの実測比較は実行可能とは主張しない。 また、ReviewTarget六要素のfresh mismatchはL4が`Unknown(conflict)`を定めるが、`K9IndependenceComponent` unionにはtarget binding factがないため、結果class/reason以外のcomponent/combined投影を新設せず局所未接続にする。上表のValue baselineとnegative比較はL4の型付きoracleを個別化した合成設計であり、owner bindingの実在を示さない。該当sourceまたはcomparison identityが無い場合は固定したL4結果だけを返し、未定義mappingを新API/reason/ownerへ埋めず、当該caseだけを未接続とする。K6 issuer authenticity未証明、開発repository cross-runtime規則、要求採択、外部review/merge動作は本fixtureの対象外である。

K9 L4/L9 ownerへの追加返却事項は次のとおり。これは対象oracleの未達を記録し、K6/K4の既存診断をK9全体の結果へ昇格しない。

| 対象 | 未接続範囲 | 返却先と保持する期待 |
|---|---|---|
| `L8-K9-05-BINDING-BYTES-DRIFT` / `RAW-SOURCE-BYTES-DRIFT`、IV-K9-05 | K6 admissionの`Unknown(conflict)`からK9 result/components/combinedへの投影が未定義。 | K9 L4 §17 / L9 IV-K9-05 ownerへ返す。K6 source診断を独立して保持し、K9 assuranceへ混入せずK9 oracle充足を主張しない。 |
| `L8-K9-11-PENDING-REVIEW`、IV-K9-11 | K4 Deferred fixtureの再利用は既存義務成分だけを確認する。K9 candidate/sourceとreview段階を結ぶAPI・projectionは未接続。 | K9 L4 §17 / L9 IV-K9-11 ownerへ返す。IV-K9-11の期待全体をK4 aliasへ縮約せず、K9側の段階分離の未達を保持する。 |

## 10. K7/G5 fixture表

本節はL4 §15の既存9 APIとL9 IV-K7-01–15/IV-G5-01–10を、個別のbaseline・一条件変異・期待値へ展開する。全件が設計fixtureで未実行であり、K3 IV-K3-11/12/17、K5 writer、K6 receipt reader、K10 graph readerの製品接続や実作用を示さない。owner sourceやbindingがないfixtureはsynthetic input/port boundaryとしてだけ記述する。

### 10.1 K7 fixture

| Fixture ID | L9 / API | 固定baselineと単一変異 | 期待 |
|---|---|---|---|
| `L8-K7-01-BASE` | IV-K7-01 / `apply_move`,`ledger_view` | Z segment 0→1、Aへhandoff、A segment 1→2の二つのPointerMoved。handoffはAのPointerLog最初の行。 | current generation number `2`。並び替えやrequest記録をcurrentに混ぜない。 |
| `L8-K7-01-HANDOFF-GAP` | IV-K7-01 / `ledger_view` | BASEからWriterHandoff link一件だけを欠く。 | current `Unknown(missing_input)`。 |
| `L8-K7-01-HANDOFF-WRONG-LOG` | IV-K7-01 / `ledger_view` | BASEのhandoffをPointerLogからRequestLogだけへ移す。 | linkなしと同じ`Unknown(missing_input)`。 |
| `L8-K7-02-BASE` | IV-K7-02 / `append_if_head` | 期待headがcurrent tailである一件追記。 | `Appended`、pointer entry 1件。 |
| `L8-K7-02-CONCURRENT-LOSER` | IV-K7-02 / `append_if_head` | 同じpointer_headの2要求を準備し、1つ目の成功後に2つ目を呼ぶ。 | 2つ目`Rejected(stale_head)`、追記0。 |
| `L8-K7-02-OLD-PREFIX` | IV-K7-02 / `append_if_head` | BASEのexpected_headだけを現prefixより古いtailにする。 | `Rejected(stale_head)`、追記0。 |
| `L8-K7-03-BASE` | IV-K7-03 / `request_move` | current stage/build owner declarations、全RL-R2 refs/heads、required resultが肯定、ManifestRefをstage_key subjectにする。 | `Appended(MoveRequested)`。記録されたeligibilityはassurance込みRequiredResult。 |
| `L8-K7-03-DEPENDENCY-REV` | IV-K7-03 / `request_move` | BASEから宣言dependency revisionだけを更新し、他は固定。 | 旧receiptが当たらず`Rejected(not_eligible)`。内部照会の非肯定診断を保持。 |
| `L8-K7-03-SCOPE` | IV-K7-03 / `request_move` | BASEからcurrent declaration scopeだけを変える。 | `Rejected(not_eligible)`。 |
| `L8-K7-03-VERIFIER-VERSION` | IV-K7-03 / `request_move` | BASEからcurrent verifier versionだけを更新する。 | `Rejected(not_eligible)`。 |
| `L8-K7-03-SAME-REV-DIGEST` | IV-K7-03 / `request_move` | BASEの同一ref revisionへ異digest recordを一件追加する。 | 内部結果`Unknown(conflict)`を保持し、requestは`Rejected(not_eligible)`。 |
| `L8-K7-03-RECEIPT-HEAD-MISSING` | IV-K7-03 / `request_move` | BASEから必要receipt segment head一つだけをinput_heads期待値から欠落させる。 | 内部結果`Unknown(missing_input)`を保持し、requestは`Rejected(not_eligible)`。 |
| `L8-K7-04-PROMOTE-BASE` | IV-K7-04 / `request_move` | stagedの未現行generationへの合法promote。 | `Appended(MoveRequested)`。 |
| `L8-K7-04-REBUILD-BASE` | IV-K7-04 / `request_move` | fromと同compositionの新numberへの合法rebuild。 | `Appended(MoveRequested)`。 |
| `L8-K7-04-ROLLBACK-BASE` | IV-K7-04 / `request_move` | stagedかつ以前currentだった保持generationへの合法rollback。 | `Appended(MoveRequested)`。 |
| `L8-K7-04-REBUILD-COMPOSITION` | IV-K7-04 / `request_move` | REBUILD-BASEからto.compositionだけをfromと異ならせる。 | `Rejected(not_eligible)`。 |
| `L8-K7-04-PROMOTE-OLD-NUMBER` | IV-K7-04 / `request_move` | PROMOTE-BASEからto.numberだけを既current generationへする。 | `Rejected(not_eligible)`。 |
| `L8-K7-04-REBUILD-OLD-NUMBER` | IV-K7-04 / `request_move` | REBUILD-BASEからto.numberだけを既current generationへする。 | `Rejected(not_eligible)`。 |
| `L8-K7-04-ROLLBACK-UNHELD` | IV-K7-04 / `request_move` | ROLLBACK-BASEからtoだけを未保持/未staged generationへ変える。 | `Rejected(not_eligible)`。 |
| `L8-K7-11-BASE` | IV-K7-11 / `request_move`,`apply_move` | RequestLogだけを追記し、pointer prefixとowner inputsは不変。 | apply成功、request record自体はpointer headを変えない。 |
| `L8-K7-11-POINTER-ADVANCED` | IV-K7-11 / `apply_move` | BASE後に別PointerMovedをpointer segmentへ1件追記。 | 古いrequestは`Rejected(stale_head)`、追記0。再bindしない。 |
| `L8-K7-12-BASE` | IV-K7-12 / `request_move` | current=2、from=2、toはgeneration 2とgeneration 0の両方に同じcompositionを持つ合法new rebuild generation。 | `Appended(MoveRequested)`。 |
| `L8-K7-12-FROM-OLD` | IV-K7-12 / `request_move` | BASEからfromだけを保持generation 0へ変更し、to・全ほかの入力を固定する。 | `Rejected(stale_from)`。 |
| `L8-K7-13-BASE` | IV-K7-13 / `request_move`,`apply_move`,`verify_current` | request/apply間のowner declaration/ref/head/bytesを固定。 | apply成功、PointerMoved.checked_headsを保持。 |
| `L8-K7-13-STAGE-DEPENDENCY-REV` | IV-K7-13 / `apply_move` | BASEからstage OperationDecl dependency revisionだけを更新。 | `Rejected(stale_eligibility)`、追記0。 |
| `L8-K7-13-VERIFIER-REF` | IV-K7-13 / `apply_move` | BASEからVerifierSet refだけを更新。 | `Rejected(stale_eligibility)`、追記0。 |
| `L8-K7-13-BUILD-ARTIFACT-VERIFIER` | IV-K7-13 / `apply_move` | BASEからbuild owner OperationDeclへartifact verifier一件だけ追加。 | `Rejected(stale_eligibility)`、追記0。 |
| `L8-K7-13-POST-READ-DEPENDENCY-DRIFT` | IV-K7-13 / `apply_move`,`verify_current` | applyの全再読後・追記前にdependency headだけを更新する順序を注入。 | PointerMovedが成功し得る。verify_currentはfresh current refs/headsから再計算し、結果と診断を保持する。PositiveならRollbackRequiredを作らず、非Positiveなら観測+RollbackRequired・pointer不変。両分岐を固定しない範囲はowner fixture未接続。 |
| `L8-K7-13-POST-APPEND-RESULT-CONFLICT` | IV-K7-13 / `verify_current` | BASEの宣言を固定し、receipt segmentに同key・異digest ResultRecorded一件だけ追加。 | `Unknown(conflict)`を保持し、RollbackRequired追記、pointer不変。 |
| `L8-K7-13-NO-OLD-CHECKED-HEADS` | IV-K7-13 / `verify_current` | BASEからcurrent inputsだけを更新し、記録済checked_headsは固定する。 | current headsから再計算し、checked_headsの再利用で適格性を肯定しない。 |
| `L8-K7-13-REQUIRED-SEGMENT-MISSING` | IV-K7-13 / `verify_current` | BASEから必要segment head一つだけを欠落させる。 | `Unknown(missing_input)`を保持しPositiveにしない。 |
| `L8-K7-14-BASE` | IV-K7-14 / `stage_generation` | ReleaseEstablished済みmanifestとgeneration target/compositionがexact一致。 | `Appended(GenerationStaged)`、pointer/currentは不変。 |
| `L8-K7-14-TARGET-MISMATCH` | IV-K7-14 / `stage_generation` | BASEのmanifest.targetだけをgeneration.targetと異ならせる。 | `Rejected(not_eligible)`、GenerationStaged追記0。 |
| `L8-K7-15-BASE` | IV-K7-15 / `stage_generation` | IV-K7-14-BASEと同じ固定構造でtarget/composition exact一致。 | `Appended(GenerationStaged)`。 |
| `L8-K7-15-COMPOSITE-MISMATCH` | IV-K7-15 / `stage_generation` | BASEのmanifest.compositeだけをgeneration.compositionと異ならせる。 | `Rejected(not_eligible)`、GenerationStaged追記0。 |
| `L8-K7-05-BASE` | IV-K7-05 / `apply_move`,`ledger_view`,`propagate` | current K3 checkと他K7条件が肯定のsynthetic control。 | `Appended(PointerMoved)`。K3/owner実接続は主張しない。 |
| `L8-K7-05-AUTH-TARGET` | IV-K7-05 / `apply_move` | authorization targetだけを移動対象と異ならせる。 | `Rejected(authorization_unverified, check)`。pointer/current/G5 wait不変。 |
| `L8-K7-05-AUTH-KIND` | IV-K7-05 / `apply_move` | authorization kind/actionだけを要求kindと異ならせる。 | 同上。 |
| `L8-K7-05-AUTH-REVOKED` | IV-K7-05 / `apply_move` | BASEからcurrent authorizationのrevoke状態だけを有効にする。 | 同上。 |
| `L8-K7-05-AUTH-UNRESOLVABLE` | IV-K7-05 / `apply_move` | BASEからauthorization候補refの解決だけを失わせる。 | `Rejected(authorization_unverified, check)`でK3既存check/diagnosticを保持。 |
| `L8-K7-RECOVERY-BASE` | IV-K3-17 boundary / `recover_move_observation` | PointerMovedは記録済みだがimmediate観測が欠落。current permission sourceを再照合し、観測時点あり。 | `Appended(MoveAuthorizationObserved)` phase=`recovery`。欠落immediateを補わずG5待ちも遡及解除しない。K3 IV-K3-17自体の実行・充足は主張しない。 |
| `L8-K7-RECOVERY-NOT-A-MOVE` | IV-K3-17 boundary / `recover_move_observation` | RECOVERY-BASEからmove_refだけをPointerMovedでないrecordへ変える。 | `Rejected(not_a_move)`、追記0。 |
| `L8-K7-RECOVERY-ALREADY-IMMEDIATE` | IV-K3-17 boundary / `recover_move_observation` | RECOVERY-BASEのmoveへ同じpointer segment seq+1・same digestのimmediate observationだけを追加。 | `Rejected(already_immediate)`、recovery追記0。 |
| `L8-K7-RECOVERY-NONPOSITIVE` | IV-K3-17 boundary / `recover_move_observation` | RECOVERY-BASEからcurrent checkだけを既存non-Positiveに変える。 | `Appended` recovery診断にcheck全成分を保持。通常完了・immediate肯定へ変換しない。 |
| `L8-K7-RECOVERY-TIME-UNOBSERVED` | IV-K3-17 boundary / `recover_move_observation` | RECOVERY-BASEから観測時刻だけをnullにする。 | `Appended` recovery行で`observed_at=null`を保持する。完了肯定にしない。 |
| `L8-K7-06-BASE` | IV-K7-06 / failure observation | current generationの失敗を一件観測。 | RollbackRequiredを追記しpointer不変。 |
| `L8-K7-06-AUTO-MOVE` | IV-K7-06 / failure consumer invariant | BASEから失敗後に自動PointerMovedを行う欠陥だけを注入。 | fixture oracleはpointer不変を要求し、自動移動を不合格とする。API return classは追加しない。 |
| `L8-K7-06-RESTORE-CASE-STATE` | IV-K7-06 / rollback invariant | BASEのrollback試行で案件state/recordを戻す変異だけを加える。 | case state/recordは現行のまま、構成pointer以外の巻戻しなし。 |
| `L8-K7-06-CLOSE-INCIDENT` | IV-K7-06 / rollback invariant | BASEのrollback試行でincidentを閉じる変異だけを加える。 | incident未完を保持。 |
| `L8-K7-07-APPEND-BASE` | IV-K7-07 / `admit_effect` | current EpochTokenのscope/number/entry_digestが完全一致し、PropagationViewがPositiveで、取消しに代わる新しい許可記録もある状態でK5への追記を要求する。 | K7-I6の3段すべて成立して`Appended`。 |
| `L8-K7-07-APPEND-SCOPE` | IV-K7-07 / `admit_effect` | current tokenを保ち、K5 append作用のscopeだけを別にする。 | `Rejected(fenced)`、K5 append 0。 |
| `L8-K7-07-APPEND-NUMBER-LOW` | IV-K7-07 / `admit_effect` | current K5 tokenのnumberだけを一段小さくする。 | `Rejected(fenced)`、作用0。 |
| `L8-K7-07-APPEND-NUMBER-HIGH` | IV-K7-07 / `admit_effect` | current K5 tokenのnumberだけを一段大きくする。 | `Rejected(fenced)`、作用0。 |
| `L8-K7-07-APPEND-DIGEST` | IV-K7-07 / `admit_effect` | current K5 tokenとnumberを保ちentry_digestだけを変える。 | `Rejected(fenced)`、作用0。 |
| `L8-K7-07-ARTIFACT-BASE` | IV-K7-07 / `admit_effect` | current EpochTokenのscope/number/entry_digestが完全一致し、PropagationViewがPositiveで、取消しに代わる新しい許可記録もある状態でartifact書込みを要求する。 | K7-I6の3段すべて成立して`Appended`。 |
| `L8-K7-07-ARTIFACT-SCOPE` | IV-K7-07 / `admit_effect` | artifact writeのscopeだけを別にする。 | `Rejected(fenced)`、artifact write 0。 |
| `L8-K7-07-ARTIFACT-NUMBER-LOW` | IV-K7-07 / `admit_effect` | artifact write token numberだけを一段小さくする。 | `Rejected(fenced)`、作用0。 |
| `L8-K7-07-ARTIFACT-NUMBER-HIGH` | IV-K7-07 / `admit_effect` | artifact write token numberだけを一段大きくする。 | `Rejected(fenced)`、作用0。 |
| `L8-K7-07-ARTIFACT-DIGEST` | IV-K7-07 / `admit_effect` | artifact write token entry_digestだけを変える。 | `Rejected(fenced)`、作用0。 |
| `L8-K7-07-RECORD-BASE` | IV-K7-07 / `admit_effect` | current EpochTokenのscope/number/entry_digestが完全一致し、PropagationViewがPositiveで、取消しに代わる新しい許可記録もある状態でK2 `record`を要求する。 | K7-I6の3段すべて成立して`Appended`。 |
| `L8-K7-07-RECORD-SCOPE` | IV-K7-07 / `admit_effect` | result record作用のscopeだけを別にする。 | `Rejected(fenced)`、K2 record 0。 |
| `L8-K7-07-RECORD-NUMBER-LOW` | IV-K7-07 / `admit_effect` | result record token numberだけを一段小さくする。 | `Rejected(fenced)`、作用0。 |
| `L8-K7-07-RECORD-NUMBER-HIGH` | IV-K7-07 / `admit_effect` | result record token numberだけを一段大きくする。 | `Rejected(fenced)`、作用0。 |
| `L8-K7-07-RECORD-DIGEST` | IV-K7-07 / `admit_effect` | result record token entry_digestだけを変える。 | `Rejected(fenced)`、作用0。 |
| `L8-K7-08-BASE` | IV-K7-08 / `admit_effect` | current epoch token、PropagationView Positive、新許可あり。 | `Appended`。 |
| `L8-K7-08-PROPAGATION-NONPOSITIVE` | IV-K7-08 / `admit_effect` | BASEからPropagationViewだけを非Positiveにする。 | `Rejected(revocation_pending)`、作用0、view診断保持。 |
| `L8-K7-09-BASE` | IV-K7-09 / `admit_effect` | current epoch、Positive propagation、新しい許可recordあり。 | `Appended`。 |
| `L8-K7-09-AUTH-MISSING` | IV-K7-09 / `admit_effect` | BASEから新しい許可recordだけを除く。 | `Rejected(missing_authorization)`、作用0。 |
| `L8-K7-10-BASE` | IV-K7-10 / late observation | 旧EpochTokenに紐づくCI/review/cost observation。 | 元episodeの`LateObservation`として保持。 |
| `L8-K7-10-OLD-TOKEN-EFFECT` | IV-K7-10 / `admit_effect` | BASEの同一古いtokenをstate-changing effectとして扱う要求へ変える。 | `Rejected(fenced)`、effect適用0。late observationの原事実は保持。 |

### 10.2 G5 fixture

| Fixture ID | L9 / API | 固定baselineと単一変異 | 期待 |
|---|---|---|---|
| `L8-G5-01-BASE` | IV-G5-01 / `propagate` | current graph/impact/review_setで導く全recipientにapplied receipt。 | `Observed<PropagationView>`のcombined Positive。assuranceはidentity/verifier別。 |
| `L8-G5-01-RECIPIENT-RECEIPT-MISSING` | IV-G5-01 / `propagate` | BASEから導出recipient一件のreceiptだけを除く。 | そのcomponent `Unobserved(not_run)`、全combinedで肯定にしない。 |
| `L8-G5-01-EXTRA-RECIPIENT` | IV-G5-01 / `propagate` | BASEにgraphから導かれないidentityのapplied receipt一件だけ追加。 | extra receiptは集合に入らず、BASEのderived set結果を維持。 |
| `L8-G5-01-UNMAPPED-KIND` | IV-G5-01 / `propagate` | BASEからaffected node kind一つのRecipientMap mappingだけを除く。 | 該当graph成分`Unknown(unregistered)`。 |
| `L8-G5-01-EMPTY-RECIPIENT-SET` | IV-G5-01 / `propagate` | BASEからaffected/review_set recipient全件を除く。 | 既存Combined.set_reason=`Unknown(missing_input)`を保持、componentを捏造しない。 |
| `L8-G5-02-BASE` | IV-G5-02 / `propagate` | recipient A receipt applied、current graph/rulesで照会成功。 | A成分を保持。 |
| `L8-G5-02-UNRELATED-RELATION` | IV-G5-02 / `propagate` | BASEから無関係relation一つの語彙登録だけを外す。 | K10 check_graph非肯定成分を保持しcombined Positiveにしない。 |
| `L8-G5-02-DECL-INPUT-REVIEW-RECIPIENT` | IV-G5-02 / `propagate` | revoked recordへの依存が義務decl.inputsだけにある関係を追加する。 | review_set由来`approval_consumer`を受け手集合へ含める。 |
| `L8-G5-02-GRAPH-RULES-REV` | IV-G5-02 / `propagate` | BASEのGraphRules current revisionだけを更新する。 | old query resultを使わずcurrent照会結果を保持。 |
| `L8-G5-03-BASE` | IV-G5-03 / `propagate` | 一recipientのinnerに全check結果とset_reasonを含む正常applied状態。 | inner全成分とassuranceを識別付きで保持。 |
| `L8-G5-03-RECEIVED` | IV-G5-03 / `propagate` | BASEでinner check一つだけをreceivedに変える。 | そのcomponent `Unobserved(pending_receipt)`。 |
| `L8-G5-03-FAILED` | IV-G5-03 / `propagate` | BASEでinner check一つだけをfailedに変える。 | 該当componentを既存owner polarityによる`Negative`として保持しPositiveにしない。新payload/polarityを作らない。 |
| `L8-G5-03-MIXED-INNER` | IV-G5-03 / `propagate` | BASEのinnerへNegative一件と既存Unknown一件を置く相互作用scenario。 | 両方を`{r, verifier, check}`付きで保持。Unknown reasonは入力の既存値を保持。 |
| `L8-G5-03-EMPTY-INNER` | IV-G5-03 / `propagate` | BASEのinner checksだけを空にし、ほかの入力は固定する。 | innerの`set_reason={class:Unknown,reason:missing_input}`を保持し、componentを作らず空をPositiveにしない（K1-I4）。 |
| `L8-G5-04-BASE` | IV-G5-04 / `propagate` | current revocation/ref/scopeに一致するreceipt lookup。 | current receipt resultと各assuranceを`{identity, verifier}`で保持。 |
| `L8-G5-04-OTHER-REVOCATION` | IV-G5-04 / `propagate` | receipt inputのrevocation record identityだけを別にする。 | `Unobserved(not_run)`。 |
| `L8-G5-04-OLD-REVISION` | IV-G5-04 / `propagate` | 同identityのreceipt subject revisionだけを旧値にし、旧recordはValue。 | `Stale`。 |
| `L8-G5-04-SAME-REV-DIGEST` | IV-G5-04 / `propagate` | 同identity/revisionに異digest receipt record一件を加える。 | `Unknown(conflict)`。 |
| `L8-G5-04-OTHER-SCOPE` | IV-G5-04 / `propagate` | receipt key scopeだけをcurrent scopeと異ならせる。 | `Unobserved(not_run)`。 |
| `L8-G5-04-HEAD-MISSING` | IV-G5-04 / `propagate` | 必要recipient segment headだけを欠落させる。 | `Unknown(missing_input)`。 |
| `L8-G5-05-BASE` | IV-G5-05 / `admit_effect` | current token、PropagationView Positive、revoked recordに依存するscope。 | L4 K7-I6順でのみ作用を許す。 |
| `L8-G5-05-BEFORE-PROPAGATION` | IV-G5-05 / `admit_effect` | BASEからPropagationViewだけを非Positiveへ変える。 | `Rejected(revocation_pending)`、作用0。 |
| `L8-G5-06-BASE` | IV-G5-06 / `propagate` consumer boundary | 取消しの後に新しい許可を出さず、旧許可をcurrentへ戻さない構造。 | propagate projectionはauthorizationを生成しない。 |
| `L8-G5-06-ISSUE-AUTHORIZATION` | IV-G5-06 / API-surface assertion | BASEの結果へauthorization outputを追加する誤った構造だけを検査する。 | 既存L4/L5 API/return shapeにそのfield/operationが無いこと。動的API reasonは定義しない。 |
| `L8-G5-06-RESTORE-OLD-AUTH` | IV-G5-06 / API-surface assertion | BASEの出力へ取消し済み旧許可を復元する経路だけを検査する。 | restoration outputなし。 |
| `L8-G5-07-BASE` | IV-G5-07 / `propagate` + K5 boundary | old approval recordを入力し、取消しの新recordは別に追記される前提。 | old record/body不変、K10 re-review対象を保持。 |
| `L8-G5-07-MUTATE-OLD-ROW` | IV-G5-07 / K5 append boundary | BASEから既存取消対象record/bodyだけを書き換える誤操作を試す。 | append-only invariant違反として不合格。K5 APIの未指定reasonは付けない。 |
| `L8-G5-08-BASE` | IV-G5-08 / `ledger_view`,`propagate`,`apply_move` | 現行composition revoked recordへ依存し、RollbackRequired、current receipt、same move immediate seq+1 exact digest/check Positive、observed_atあり。 | `ledger_view.target`はgeneration/immediate_check/recovery_diagnosticsを個別に返す。`propagate`の`internal_deployment`受け手だけが、IV-G5-08の全条件成立時に既存receipt/stateに従い肯定となる。実deployは行わない。 |
| `L8-G5-08-NO-IMMEDIATE` | IV-G5-08 / `ledger_view`,`propagate` | BASEから同move immediate observation一件だけを除く。 | `ledger_view.target`は既存shapeのgeneration/immediate_check/recovery_diagnosticsだけを返し、generationによるpointer事実とRequestLog上の`RollbackRequired`はそれぞれのsourceで保持する。`propagate`の`internal_deployment`は`Unobserved(not_run)`。 |
| `L8-G5-08-IMMEDIATE-NONPOSITIVE` | IV-G5-08 / `ledger_view`,`propagate` | BASEのimmediate checkだけを既存non-Positiveに変える。 | `ledger_view.target.immediate_check`で元check全成分を保持し、RequestLog上の`RollbackRequired`は別に保持する。`propagate`の`internal_deployment`は待ち`Unobserved(not_run)`。 |
| `L8-G5-08-APPLIED-UNCERTAIN` | IV-G5-08 / `apply_move`,`ledger_view`,`propagate` | BASEの適用後結果だけをAppliedUncertainにする。 | `apply_move`結果のevent/check/unfinishedとRequestLog上の`RollbackRequired`をそれぞれ保持する。`ledger_view.target`は既存shapeのgeneration/immediate_check/recovery_diagnosticsだけ、actualは別fieldのまま返し、`propagate`の待ちは`Unobserved(not_run)`。 |
| `L8-G5-08-MOVE-REQUESTED-ONLY` | IV-G5-08 / `ledger_view`,`propagate` | BASEからPointerMoved/immediateだけを除きMoveRequestedを残す。 | `ledger_view`はrequestからtarget/actualを作らず、`propagate`の待ちは`Unobserved(not_run)`。 |
| `L8-G5-08-RECOVERY-ONLY` | IV-G5-08 / `ledger_view`,`propagate` | NO-IMMEDIATEからphase=recoveryの診断一件だけを追加し、即時成功は作らない。 | `ledger_view.target.recovery_diagnostics`だけを追加保持し、`propagate`の`internal_deployment`は`Unobserved(not_run)`。recoveryはimmediate待ちを解消しない。 |
| `L8-G5-08-AUTO-POINTER` | IV-G5-08 / pointer invariant | BASEのfailed deploy scenarioへ自動PointerMovedを加える欠陥だけを検出。 | pointerは動かさずRollbackRequired/unfinishedを保持。物理作用を行わない。 |
| `L8-G5-09-BASE` | IV-G5-09 / `propagate` | affected nodeとreview_setが同じidentityへworker_runとapproval_consumerを導く。 | 両classをrecipient mapとcombined成分に保持。 |
| `L8-G5-09-DROP-CLASS` | IV-G5-09 / `propagate` | BASEからaffected由来の一classだけを落とす。 | fixtureの全source-derived class集合との比較で不足を検出。 |
| `L8-G5-10-BASE` | IV-G5-10 / `propagate` | current RecipientDecl SubjectRefを基底key subjectとして一致receipt lookup。 | 現行receipt状態を保持。 |
| `L8-G5-10-REVISION-ONLY` | IV-G5-10 / `propagate` | BASEのdecl revisionだけを更新し旧結果はValue。 | lookup `Stale`。 |
| `L8-G5-10-SAME-REV-DIGEST` | IV-G5-10 / `propagate` | BASEでdecl identity/revisionを固定し異digest declaration一件を追加。 | `Unknown(conflict)`。 |
| `L8-G5-10-DECL-MISSING` | IV-G5-10 / `propagate` | BASEからRecipientDeclの対象identityだけを欠く。 | `Unknown(missing_input)`。 |
| `L8-G5-10-OLD-RECEIPT-SUBJECT` | IV-G5-10 / `propagate` | current RecipientDeclから作るquery keyを固定し、同じidentityの旧revisionに対するotherwise-valid Value receiptだけを記録集合へ置く。 | K2 lookup `Stale`。old receipt SubjectRefをcurrent declaration refへ置換・流用しない。 |

### 10.3 台帳projection接続fixture（既存IV-LDG-03）

| Fixture ID | L9 / API | 固定baselineと単一変異 | 期待 |
|---|---|---|---|
| `L8-K7-LEDGER-BASE` | IV-LDG-03 / `ledger_view` | 登録済みrows、ReleaseEstablished、PointerMovedと同move immediate check、RuntimeObservedを各正本から復元。 | `Observed<LedgerView>`の`rows/release/target/actual`を個別に保持。 targetはgeneration/immediate_check/recovery_diagnostics、actualはRuntimeLog由来。 |
| `L8-K7-LEDGER-REQUEST-ONLY` | IV-LDG-03 / `ledger_view` | BASEへMoveRequested一件だけを加え、PointerMoved/RuntimeObservedは不変。 | target/actualは変わらず、requestからcurrent/actualを作らない。 |
| `L8-K7-LEDGER-NO-RUNTIME` | IV-LDG-03 / `ledger_view` | RuntimeLog全体は完全復元できる状態のまま、BASEからRuntimeObservedの対象記録だけを除く。 | IV-LDG-03の「全量復元した該当証拠0件」に従い、`actual=Unobserved(not_run)`を保持しPointerMovedから補わない。RuntimeLog自体の欠落・損傷はこのfixtureに含めない。 |
| `L8-K7-LEDGER-RECOVERY-SEPARATE` | IV-LDG-03 / `ledger_view` | BASEからrecovery diagnosticだけを追加し、immediate entryを変えない。 | target.recovery_diagnosticsのみ変わり、target.immediate_checkおよびactualは不変。 |

### 10.4 K7/G5の保持点と未接続範囲

表のAPI/result型はL4 §15.6から変えない。`AppliedUncertain`は追記済みeventとcheck、unfinishedを失わず保持し、`recover_move_observation`の`phase=recovery`は即時成功の代替にならない。K7のexpected headはappend境界のhead比較であり、stage/build ownerの全current refs/headsを示すものではない。K3 current authorizationは候補refではなくcurrent owner sourceを照合し、K7はその既存checkを前後で消さず保持する。K6 assurance/receipt未接続、物理CAS未実装、K10 graph/SECURITY RecipientMap/recipient owner binding未接続の部分はsynthetic fixtureに留め、別reason/classや権限を創作しない。G5 failed/received/missing/mixed outcomesはinner/lookup側の既存classとpolarityをそのまま入力にし、L8で新しいdomain payloadやNegative constructorを作らない。

この節のfixture ID数は本文の表から機械再計数する対象である。L9 IV-K7 15件とIV-G5 10件の各行は少なくとも一つのbaseline/caseへtraceし、複数の反例は個別IDへ分ける。全fixtureは設計のみであり、実行、実装完成、承認、deploy、authority成立を示さない。

## 11. K8 fixtures（既存L9 IV-K8-01〜26）

本節はL4 §18 / SECURITY-AC-001-01 / 既存L9 IV-K8-01〜26のみをfixtureへ展開する。以下の`L8-K8-*`はL8 fixture IDであり、L9 oracle、K8 vocabulary、承認、実装、CI coverageを新設しない。5件のBASE、既存147 variant、L4のcomponent境界から具体化したIV-K8-16の10組合せ、計162件の設計fixture IDを記録する。これらは未実行であり、実装済み・構築済みの証拠ではない。各variantのbaselineを同一APIの既存L4正常例へ結び、独立caseの変異は指定fieldひとつだけとする。複合優先条件fixture（IV-K8-16/23）および二field列挙順fixture（IV-K8-15）はそのoracle目的に必要な組合せだけを保持し、単独変異caseと識別する。

| Baseline ID | API / 入力 | baseline結果 |
|---|---|---|
| `L8-K8-BASE-CLASSIFICATION` | `observe_input_label`; L4 §18.6正常例（source/project/revision/digest、分類definition/classifier current refs全て読取可能） | `ObservedLabel`。classificationは入力値どおり、trust=`untrusted`。 |
| `L8-K8-BASE-EFFECT` | `observe_authority_effect`; current case/effect-source/readerが解決し、原bytesから`EffectObservation`を読める | 原recordにある`none`または`occurred`、null、issuer/bindingを改変せず`Observed<EffectObservation>`。 |
| `L8-K8-BASE-VALIDATION` | `validate_label_transition`; selected input-only binding、saved/current classification一致、route/target/K3/K6/effect refsが完全一致 | `TransitionValidation.result=Value(Validated)`。`Observed` wrapperを重ねず、untrustedは維持。 |
| `L8-K8-BASE-PROJECTION-SELECTED` | `record_label_transition`; selected bindingと各operation current K2 key、pointer projectionがある | current key別lookup resultをfield別に保持する`LabelTransition`。fresh validationは呼ばない。 |
| `L8-K8-BASE-PROJECTION-NOT-SELECTED` | `record_label_transition`; owner input-only bindingがnot_selected | `validated_transition=NotSelected`。K1 result/keyを作らない。 |
| `K2-CURRENT-LOOKUP-BASE`（既存K2基準、K8 fixture IDではない） | L4 §3.3の完全なcurrent ResultKeyと、その完全一致keyで引ける単一の非Stale record | `lookup`はrecordの既存class/bodyをそのまま返す。 |
| `K8-API-SURFACE-BASE`（構造比較基準、K8 fixture IDではない） | L4 §18.5の宣言済み4 APIと戻り型 | API/型/vocabularyを追加しない現行surface。 |

以下の期待値はK1/K2/K3/K6 API return型を混成しない。API `Rejected(missing_key)`、projectionの`KeyUnavailable`/`NotSelected`、K1/K2 result、K3 `PermissionCheck`, K6 `RequiredResult`は別の型境界として記録する。K3/K6非肯定値とassuranceは原型・原理由のままcomponentsに残す。fixture案は未実行である。

| 既存L9 oracle | fixture ID（それぞれ独立fixture） | API / baseline | 単一変異・期待 |
|---|---|---|---|
| IV-K8-01 | `L8-K8-01-SOURCE-ID`, `L8-K8-01-PROJECT-ID` | `observe_input_label` / BASE-CLASSIFICATION | subject source identityのみ変更、またはproject identityのみ変更。別identity集合のcurrent lookupは`Unobserved(not_run)`。別fieldを同時変更しない。 |
| IV-K8-01 | `L8-K8-01-REVISION-DIGEST`, `L8-K8-01-DUP-SAME-IDENTITY`, `L8-K8-01-MISSING-KEY` | `observe_input_label` / BASE-CLASSIFICATION | 同一identityのrevision/digest更新後に旧ValueをlookupすればK2 `Stale`; 同一alias/key identityで異kind/revision/digest refが同居すればkey前`Rejected(missing_key)`; 1 required key fieldを欠かせばAPI `Rejected(missing_key)`。 |
| IV-K8-02 | `L8-K8-02-CLASSIFICATION-UNKNOWN`, `L8-K8-02-SOURCE-UNREADABLE`, `L8-K8-02-NOT-RUN` | `observe_input_label` / BASE-CLASSIFICATION | それぞれclassification=`Unknown(indeterminate)`、source read=`Unknown(unreadable)`、observation未実施=`Unobserved(not_run)`を個別に入力。返す各class/reasonを保持しtrust=`untrusted`のまま。 |
| IV-K8-03 | `L8-K8-03-CLASSIFIER-MISSING`, `L8-K8-03-CLASSIFIER-UNREGISTERED`, `L8-K8-03-EFFECT-SLICE-ABSENT`, `L8-K8-03-ROUTE-KEY-MISSING` | observe/classify, effect, validation | classifier required fieldだけ欠落→API `Rejected(missing_key)`。登録済みと宣言されたclassifier readerなし→`Unknown(unregistered)`。effect source slice absentだけ→effect API `Unknown(unregistered)`。selected route required refだけ欠落→`KeyUnavailable(Rejected(missing_key))`。classificationはroute/effect slice absentでも継続。 |
| IV-K8-04 | `L8-K8-04-MISMATCH-ONE`, `L8-K8-04-K3-NEGATIVE`, `L8-K8-04-K6-NEGATIVE`, `L8-K8-04-UNKNOWN-INPUT`, `L8-K8-04-STALE-DEPENDENCY`, `L8-K8-04-NA-COMPONENT`, `L8-K8-04-K3-DIAGNOSTIC`, `L8-K8-04-UNOBSERVED`, `L8-K8-04-VALIDATED` | `validate_label_transition` / BASE-VALIDATION | 各caseでそれぞれ確定した1 field不一致→`Value(Mismatch{fields})`; K3 combined Negative→`Value(Denied{source:permission_check})`; K6 combined Negative→`Value(Denied{source:route_verification})`;既存UnknownはL4優先順reason、K3/K6 Staleまたはrequired NAは`Unknown(missing_input)`、K3 `invalid_query` diagnosticはL4写像どおり`Unknown(missing_input)`、単独未実施は対応`Unobserved(why)`、完全一致のみValidated。record lookup Staleをfresh outcomeへ混ぜない。 |
| IV-K8-05 | `L8-K8-05-NOT-SELECTED-NULL`, `L8-K8-05-NOT-SELECTED-POINTER`, `L8-K8-05-SELECTED-NULL-POINTER`, `L8-K8-05-SELECTED-MISSING-POINTER`, `L8-K8-05-SELECTED-KEY-MISSING` | `record_label_transition` / BASE-PROJECTION-* | not_selectedはpointer null/non-null双方で`NotSelected`、非nullはselection mismatch diagnosticだけ。selectedはpointer不在でもcurrent lookupを実施し、pointer不在はdiagnosticに残す。selected required ref欠落はprojection内`KeyUnavailable`。read-only/K3/K6からeffectを作らない。 |
| IV-K8-06 | `L8-K8-06-OBSERVED-NONE`, `L8-K8-06-EVENT-NULL`, `L8-K8-06-BINDING-NULL`, `L8-K8-06-INNER-BINDING-NULL`, `L8-K8-06-READER-UNREGISTERED`, `L8-K8-06-SOURCE-UNREADABLE`, `L8-K8-06-NOT-ARRIVED`, `L8-K8-06-HEAD-DRIFT` | `observe_authority_effect` / BASE-EFFECT | 原sourceのoutcome/event/bindingを各1 fieldずつnone/nullにし、原値を`Observed<EffectObservation>`で保持。registration欠落=`Unknown(unregistered)`, bytes unreadable=`Unknown(unreadable)`, 未着=`Unobserved(not_run)`, caller input_headsとactual current headの不一致は現head keyでfresh観測しL4 fresh優先順の`Unknown(missing_input)`。record projectionではlookupを変換せずhead driftをdiagnosticへ。 |
| IV-K8-07 | `L8-K8-07-EFFECT-OCCURRED-RECORD`, `L8-K8-07-EFFECT-BINDING-NULL`, `L8-K8-07-VALIDATION-OLD-RECORD` | `validate_label_transition` / `record_label_transition` | `EFFECT-OCCURRED-RECORD`と`VALIDATION-OLD-RECORD`はBASE-PROJECTION-SELECTEDでrecord APIを照合し、effectのK2 resultとvalidation lookupを別fieldで保つ。`EFFECT-BINDING-NULL`はBASE-VALIDATIONでfresh APIを照合し、route ref・validation key等の必須refは完全なまま、EffectObservation.bindingだけnullにする。 |
| IV-K8-08 | `L8-K8-08-READ-INSTRUCTION`, `L8-K8-08-READ-REQUIREMENT`, `L8-K8-08-READ-AUTHORITY`, `L8-K8-08-READ-PERSISTENCE`, `L8-K8-08-READ-LEARNING`, `L8-K8-08-READ-AGENT-INSTRUCTION`, `L8-K8-08-READ-TOOL-AUTHORITY`, `L8-K8-08-READ-MEMORY`, `L8-K8-08-READ-BRAIN`, `L8-K8-08-READ-TRAINING-DATA`, `L8-K8-08-READ-SECURITY-POLICY` | consumer boundary / BASE-CLASSIFICATION | 各caseは対象ひとつだけをread-only入力に結ぶ。read-onlyから対象別昇格、effect=`occurred`、trusted化がないことをそれぞれ照合。 |
| IV-K8-09 | `L8-K8-09-K6-READSET-MISSING`, `L8-K8-09-K6-NEGATIVE`, `L8-K8-09-K6-UNDETERMINED` | `validate_label_transition` / BASE-VALIDATION | K6 receipt read setのrequired inputを1つ欠落→K6既存`Unknown(missing_input)`、K6 combined Negative→validation `Value(Denied{source:route_verification})`、K6 Undeterminedでset_reason=`Unknown(missing_input)`のみ→validation `Unknown(missing_input)`。K3/effectは別値保持しreceiptは`authority_effect="none"`。 |
| IV-K8-10 | `L8-K8-10-EXACT-DUP`, `L8-K8-10-ALIAS-CONFLICT`, `L8-K8-10-SAVED-R1-CURRENT-R2`, `L8-K8-10-SAME-REV-DIFF-DIGEST`, `L8-K8-10-IDENTITY-SET-CHANGE` | K2 `key_of`/`lookup`; K8 operation baseline | exact alias/ref重複は一つへdedup。side/roleが同じalias内でref revision/digestだけ異なる→API `Rejected(missing_key)`。別side/roleのsaved R1/current R2は共存しK3 current lookupのold Valueならcomponent `Stale`。同revision/異digestは`Unknown(conflict)`。identity集合変更は`Unobserved(not_run)`。 |
| IV-K8-11 | `L8-K8-11-TAINT-GRAPH`, `L8-K8-11-IMPLICIT-INHERITANCE`, `L8-K8-11-JOIN-MEET`, `L8-K8-11-DECLASSIFY-API`, `L8-K8-11-NEW-VOCABULARY` | API surface / declared four APIs | 各caseは禁止surface項目を一種類だけ設計へ追加した比較用negative。追加API/型/分類語彙/target語彙をK8契約へ導入しない。 |
| IV-K8-12 | `L8-K8-12-OTHER-CASE-POINTER`, `L8-K8-12-OTHER-SCOPE-POINTER`, `L8-K8-12-POINTER-FIELD-MISSING`, `L8-K8-12-NULL-POINTER-DENIED` | validate/record projection | case identity、scope、またはpointer fieldのうちひとつだけ不一致/欠落。current result/effectは失わずpointer diagnosticへ。selected complete input+null pointer+current DeniedはDeniedを維持する。 |
| IV-K8-13 | `L8-K8-13-VERSION-CHANGE`, `L8-K8-13-SCOPE-CHANGE`, `L8-K8-13-IDENTITY-SET-CHANGE`, `L8-K8-13-REV-DIGEST-CHANGE`, `L8-K8-13-SAME-REV-DIGEST-CHANGE`, `L8-K8-13-FRESH-REF-MISMATCH`, `L8-K8-13-REQUIRED-REF-MISSING` | four APIs → K2 | current operation version/scope/subject identity-set changeはlookup `Unobserved(not_run)`。同identityでrevision+digest更新しold Valueありは`Stale`、同revision異digestは`Unknown(conflict)`。fresh確定値ref不一致は`Value(Mismatch{fields})`。classification/effect missing keyはAPI `Rejected(missing_key)`、selected validation required ref欠落はprojection `KeyUnavailable(Rejected(missing_key))`。 |
| IV-K8-14 | `L8-K8-14-POINTER-ONLY-UPDATE`, `L8-K8-14-INPUT-LABEL-UPDATE` | owner input binding→K2 key | pointer keysだけ更新しinput-only bytes/ref/head固定ならK8CaseBindingRef不変。InputLabelRefだけ更新した場合はinput binding digest/refを更新。結果pointer/headはkey inputsへ入れない。 |
| IV-K8-15 | `L8-K8-15-INPUT-LABEL`, `L8-K8-15-ROUTE`, `L8-K8-15-TARGET`, `L8-K8-15-REVISION-SUBJECT`, `L8-K8-15-PERMISSION-CHECK`, `L8-K8-15-PERMISSION-QUERY`, `L8-K8-15-EFFECT-EVENT`, `L8-K8-15-BINDING-INPUT-LABEL`, `L8-K8-15-BINDING-ROUTE`, `L8-K8-15-BINDING-TARGET`, `L8-K8-15-BINDING-PERMISSION-QUERY`, `L8-K8-15-ISSUER`, `L8-K8-15-CURRENT-CLASSIFICATION-RECORD`, `L8-K8-15-NULL-COMPARISON`, `L8-K8-15-TWO-FIELDS-ORDER` | `validate_label_transition` / BASE-VALIDATION | 各単一fixtureはL4 `MismatchField`の該当field一つだけを返す。null比較不能はMismatchへ追加せずUnknown候補。`TWO-FIELDS-ORDER`のみL9が明示する2field同時不一致であり、返却はその二件をL4列挙順で重複なく保持。 |
| IV-K8-16 | `L8-K8-16-REJECTED-FIRST`, `L8-K8-16-KEY-UNAVAILABLE`, `L8-K8-16-NOT-SELECTED-QUERY`, `L8-K8-16-MISMATCH`, `L8-K8-16-K3-DENIED`, `L8-K8-16-K6-DENIED`, `L8-K8-16-UNKNOWN`, `L8-K8-16-UNOBSERVED`, `L8-K8-16-VALIDATED`, `L8-K8-16-RECORD-STALE-ISOLATED`, `L8-K8-16-PAIR-MISMATCH-K3`, `L8-K8-16-PAIR-MISMATCH-K6`, `L8-K8-16-PAIR-MISMATCH-UNKNOWN`, `L8-K8-16-PAIR-MISMATCH-UNOBSERVED`, `L8-K8-16-PAIR-K3-K6`, `L8-K8-16-PAIR-K3-UNKNOWN`, `L8-K8-16-PAIR-K3-UNOBSERVED`, `L8-K8-16-PAIR-K6-UNKNOWN`, `L8-K8-16-PAIR-K6-UNOBSERVED`, `L8-K8-16-PAIR-UNKNOWN-UNOBSERVED` | fresh `validate_label_transition` vs record API | 単独fixtureは各名の結果を一つずつ確認する。組合せfixtureは下の対応表どおり二条件だけを同時に成立させ、先行するL4 §18.4結果と残るcomponentを別々に検査する。`Rejected`はAPI境界、`NotSelected`は別projection、`Validated`は他の非肯定条件がない場合の終端結果であり、これらを他のfresh component条件とのpairとして合成しない。record Stale/non-Valueもfresh順位へ加えない。全components/assurance保持。 |
| IV-K8-17 | `L8-K8-17-ROLE-SOURCE-READ`, `L8-K8-17-SAVED-R1-CURRENT-R2`, `L8-K8-17-SAME-ALIAS-CONFLICT`, `L8-K8-17-BINDING-ONLY-NO-SOURCE-READ` | validation inputs / owner binding | 固定role bindingがraw SubjectRef一件を指しreaderがそのraw bytesを別途実読してdigest一致。保存/current refsはside/role別aliasに置き、source digestとrevisionはraw refと一致。同一alias内異refだけkey前`Rejected(missing_key)`、binding bytes読取のみはraw source readとして数えない。 |
| IV-K8-18 | `L8-K8-18-CASE-REF-MISSING`, `L8-K8-18-SAME-EFFECT-OTHER-CASE` | effect/validate APIs | case ref欠落/当該case binding unreadableはAPI `Rejected(missing_key)`。同じeffect refの別caseは逆引きせずそれぞれの明示case binding/keyに結ぶ。 |
| IV-K8-19 | `L8-K8-19-OPERATION-VERSION-CHANGE`, `L8-K8-19-SCOPE-CHANGE`, `L8-K8-19-IDENTITY-SET-CHANGE`, `L8-K8-19-REVISION-UPDATE`, `L8-K8-19-SAME-REV-DIGEST-CONFLICT`, `L8-K8-19-OLD-POINTER-ONLY` | `record_label_transition` → K2 `lookup` | operation/version/scope/identity set changeは`Unobserved(not_run)`、同identity revision+digest更新はold Value `Stale`、同revision異digestは`Unknown(conflict)`。pointerだけ旧refでもcurrent-key lookupを選びcurrent outcomeを消さない。 |
| IV-K8-20 | `L8-K8-20-K3-COMBINED-POSITIVE`, `L8-K8-20-K3-COMBINED-NEGATIVE`, `L8-K8-20-K3-COMBINED-UNDETERMINED`, `L8-K8-20-K3-DIAGNOSTIC-MISSING-KEY`, `L8-K8-20-K3-DIAGNOSTIC-INVALID-QUERY`, `L8-K8-20-K3-ASSURANCE-REVERIFIABLE`, `L8-K8-20-K3-ASSURANCE-REPRODUCTION`, `L8-K8-20-K3-ASSURANCE-ISSUER-AUTHENTICITY`, `L8-K8-20-K6-COMBINED-POSITIVE`, `L8-K8-20-K6-COMBINED-NEGATIVE`, `L8-K8-20-K6-COMBINED-UNDETERMINED`, `L8-K8-20-K6-ASSURANCE-REVERIFIABLE`, `L8-K8-20-K6-ASSURANCE-REPRODUCTION`, `L8-K8-20-K6-ASSURANCE-ISSUER-AUTHENTICITY`, `L8-K8-20-EVIDENCE-UNREADABLE`, `L8-K8-20-NO-SELF-REFERENCE`, `L8-K8-20-CURRENT-EFFECT-INDEPENDENT` | validation record / record projection | 各caseは保存evidence内の該当K3 `PermissionCheckResult`またはK6 `RequiredResult`の一fieldだけを変え、API返却の`validated_transition`内で元型・元reason・assuranceを復元する。evidence読取失敗はL4 `ValidationEvidenceUnavailable{state:evidence_unavailable,evidence_ref,reason:unreadable}`、lookup/evidence ref保持、assurance補完なし。ResultRecord唯一resultは`Observed<TransitionOutcome>`で、self key/pointerをevidenceに含めない。独立current effect lookupも保持。 |
| IV-K8-21 | `L8-K8-21-POINTERS-FIXED-LABEL-CHANGED`, `L8-K8-21-LABEL-FIXED-POINTERS-CHANGED` | K8CaseBindingRef canonical bytes / K2 inputs | pointer keysだけ変更してinput label固定ならbinding bytes/digest/revision/head不変。InputLabelRefだけを変えるとbinding ref更新。分類keyにcase bindingを含めない。 |
| IV-K8-22 | `L8-K8-22-CLASSIFIER-REVISION`, `L8-K8-22-SAME-REV-DIGEST`, `L8-K8-22-OPTIONAL-ROUTE-SLICE-ABSENT` | `observe_input_label` → K2 | classifier contract revision更新でoperation_version/key変更、old resultを流用せず`Unobserved(not_run)`。同revision異digestは`Unknown(conflict)`。route/effect-only declaration欠落はclassification required inputs/keyへ加えない。 |
| IV-K8-23 | `L8-K8-23-UNREGISTERED-AND-UNREADABLE`, `L8-K8-23-HEAD-DRIFT-AND-UNREADABLE`, `L8-K8-23-MISSING-KEY-AND-UNREADABLE` | classification/effect observers | L4 reason順で複合優先を各一組だけ照合：前二件`Unknown(unreadable)`、required key field欠落はAPI `Rejected(missing_key)`が先行。全候補を証拠へ残し、走査順に依存させない。 |
| IV-K8-24 | `L8-K8-24-NOT-SELECTED-EXPLICIT-QUERY`, `L8-K8-24-NOT-SELECTED-QUERY-MISSING-KEY`, `L8-K8-24-NOT-SELECTED-PROJECTION` | validate API / record API | explicit complete-key queryは鍵付き`Unobserved(not_selected)`。required ref欠落はAPI `Rejected(missing_key)`。record projectionは`NotSelected`でK1 key/resultなし。二つの結果経路を混ぜない。 |
| IV-K8-25 | `L8-K8-25-ISSUER-MATCH`, `L8-K8-25-ISSUER-MISMATCH`, `L8-K8-25-ISSUER-UNAVAILABLE`, `L8-K8-25-K6-UNSUPPORTED-AUTHENTICITY` | validation components | declared/observed issuer一致だけnon-K1 diagnostic match、不一致はL4 field mapping、未取得はeffect component既存non-Valueのまま。effect issuer authenticityはunproven diagnostic、K6 receipt authenticityは既存`Unknown(unsupported)`保持。 |
| IV-K8-26 | `L8-K8-26-POLARITY-ID-MISSING`, `L8-K8-26-POLARITY-REVISION`, `L8-K8-26-FOREIGN-OWNER`, `L8-K8-26-NEGATIVE-PROMOTED` | K1 combine consumer | L4 `k8_transition_polarity` mappingのidentity/versionを欠く、一つの別owner写像、またはMismatch/DeniedのPositive化を個別に構造比較し、各oracleを別assertする。これは写像契約の照合であり、API/K1分類結果や新polarity/reasonを作らない。 |

#### K8各fixture IDの1対1基準・変異・assertion索引

次表はfixture IDごとにbaseline、変更条件、主結果/component assertを一行へ対応させる。BASE fixtureは変異なしの正常基準であり、上表の各L9行が示す詳細入力条件を適用する。各variantはそのIDの一条件だけを変え、期待結果は既存L4/L9の型境界を保つ。

| fixture ID | baseline ID | ID固有の入力条件 | 主結果 / component assert |
|---|---|---|---|
| `L8-K8-BASE-CLASSIFICATION` | —（正常基準） | `observe_input_label`のL4正常入力をそのまま使う | ObservedLabel; trust=untrusted |
| `L8-K8-BASE-EFFECT` | —（正常基準） | `observe_authority_effect`のL4正常入力をそのまま使う | 原値を保つObserved<EffectObservation> |
| `L8-K8-BASE-VALIDATION` | —（正常基準） | `validate_label_transition`のselected L4正常入力をそのまま使う | TransitionValidation.result=Value(Validated); trust=untrusted |
| `L8-K8-BASE-PROJECTION-SELECTED` | —（正常基準） | `record_label_transition`のL4正常入力をそのまま使う | field別current K2 lookupを保持しfresh評価しない |
| `L8-K8-BASE-PROJECTION-NOT-SELECTED` | —（正常基準） | `record_label_transition`のL4正常入力をそのまま使う | NotSelected projection、K1 key/resultなし |
| `L8-K8-01-SOURCE-ID` | `L8-K8-BASE-CLASSIFICATION` | source identityだけ変更 | Unobserved(not_run) |
| `L8-K8-01-PROJECT-ID` | `L8-K8-BASE-CLASSIFICATION` | project identityだけ変更 | Unobserved(not_run) |
| `L8-K8-01-REVISION-DIGEST` | `L8-K8-BASE-CLASSIFICATION` | 同一identityのrevision/digestを更新 | 旧ValueはStale |
| `L8-K8-01-DUP-SAME-IDENTITY` | `L8-K8-BASE-CLASSIFICATION` | 同一alias内へ同identity異refを重ねる | key前Rejected(missing_key) |
| `L8-K8-01-MISSING-KEY` | `L8-K8-BASE-CLASSIFICATION` | required key fieldを一つ欠落 | API Rejected(missing_key) |
| `L8-K8-02-CLASSIFICATION-UNKNOWN` | `L8-K8-BASE-CLASSIFICATION` | classificationだけUnknown(indeterminate) | 同class/reason保持・trust untrusted |
| `L8-K8-02-SOURCE-UNREADABLE` | `L8-K8-BASE-CLASSIFICATION` | source readだけUnknown(unreadable) | 同class/reason保持・trust untrusted |
| `L8-K8-02-NOT-RUN` | `L8-K8-BASE-CLASSIFICATION` | observationだけ未実施 | Unobserved(not_run) |
| `L8-K8-03-CLASSIFIER-MISSING` | `L8-K8-BASE-CLASSIFICATION` | classifier required fieldを一つ欠落 | API Rejected(missing_key) |
| `L8-K8-03-CLASSIFIER-UNREGISTERED` | `L8-K8-BASE-CLASSIFICATION` | 宣言済classifier readerだけ未登録 | Unknown(unregistered) |
| `L8-K8-03-EFFECT-SLICE-ABSENT` | `L8-K8-BASE-EFFECT` | optional effect sliceだけ不在 | effect API Unknown(unregistered)、分類は継続 |
| `L8-K8-03-ROUTE-KEY-MISSING` | `L8-K8-BASE-VALIDATION` | selected validation route required refだけ欠落 | TransitionValidation.result=KeyUnavailable(Rejected(missing_key)) |
| `L8-K8-04-MISMATCH-ONE` | `L8-K8-BASE-VALIDATION` | `target`だけを確定不一致 | TransitionValidation.result=Value(Mismatch{fields:[target]}) |
| `L8-K8-04-K3-NEGATIVE` | `L8-K8-BASE-VALIDATION` | K3 combinedだけNegative | Value(Denied{source:permission_check}) |
| `L8-K8-04-K6-NEGATIVE` | `L8-K8-BASE-VALIDATION` | K6 combinedだけNegative | Value(Denied{source:route_verification}) |
| `L8-K8-04-UNKNOWN-INPUT` | `L8-K8-BASE-VALIDATION` | 一dependencyだけ`Unknown(unreadable)`へ変更 | TransitionValidation.result=Unknown(unreadable)、該当componentを保持 |
| `L8-K8-04-STALE-DEPENDENCY` | `L8-K8-BASE-VALIDATION` | K3/K6 dependencyだけStale | Unknown(missing_input)、Stale componentを保持 |
| `L8-K8-04-NA-COMPONENT` | `L8-K8-BASE-VALIDATION` | required componentだけNotApplicable | Unknown(missing_input) |
| `L8-K8-04-K3-DIAGNOSTIC` | `L8-K8-BASE-VALIDATION` | K3 diagnosticをinvalid_queryにする | Unknown(missing_input)、原diagnostic保持 |
| `L8-K8-04-UNOBSERVED` | `L8-K8-BASE-VALIDATION` | 一dependencyだけ`Unobserved(not_run)`へ変更 | TransitionValidation.result=Unobserved(not_run)、該当componentを保持 |
| `L8-K8-04-VALIDATED` | `L8-K8-BASE-VALIDATION` | 全値・bindingを一致させる正常確認 | Value(Validated) |
| `L8-K8-05-NOT-SELECTED-NULL` | `L8-K8-BASE-PROJECTION-NOT-SELECTED` | pointer fieldをnullにする | NotSelected |
| `L8-K8-05-NOT-SELECTED-POINTER` | `L8-K8-BASE-PROJECTION-NOT-SELECTED` | pointer fieldだけnonnullにする | NotSelected + selection mismatch diagnostic |
| `L8-K8-05-SELECTED-NULL-POINTER` | `L8-K8-BASE-PROJECTION-SELECTED` | pointer fieldだけnullにする | current lookup実施、pointer diagnostic保持 |
| `L8-K8-05-SELECTED-MISSING-POINTER` | `L8-K8-BASE-PROJECTION-SELECTED` | pointer fieldだけ欠落 | current lookup実施、pointer diagnostic保持 |
| `L8-K8-05-SELECTED-KEY-MISSING` | `L8-K8-BASE-PROJECTION-SELECTED` | selected owner input bindingのrequired route refを一つ欠落 | `validated_transition=KeyUnavailable(Rejected(missing_key))`; available lookups/componentsを保持 |
| `L8-K8-06-OBSERVED-NONE` | `L8-K8-BASE-EFFECT` | 原outcomeをnoneにする | 原値をObserved<EffectObservation>で保持 |
| `L8-K8-06-EVENT-NULL` | `L8-K8-BASE-EFFECT` | eventだけnull | Observed<EffectObservation>でnull保持 |
| `L8-K8-06-BINDING-NULL` | `L8-K8-BASE-EFFECT` | bindingだけnull | Observed<EffectObservation>でnull保持 |
| `L8-K8-06-INNER-BINDING-NULL` | `L8-K8-BASE-EFFECT` | binding内fieldをnull | Observed<EffectObservation>でnull保持 |
| `L8-K8-06-READER-UNREGISTERED` | `L8-K8-BASE-EFFECT` | reader登録だけ欠落 | Unknown(unregistered) |
| `L8-K8-06-SOURCE-UNREADABLE` | `L8-K8-BASE-EFFECT` | 原bytesだけ読取不能 | Unknown(unreadable) |
| `L8-K8-06-NOT-ARRIVED` | `L8-K8-BASE-EFFECT` | source記録未着 | Unobserved(not_run) |
| `L8-K8-06-HEAD-DRIFT` | `L8-K8-BASE-EFFECT` | expected headとcurrent headだけ不一致 | Unknown(missing_input)、actual current headを根拠に保持 |
| `L8-K8-07-EFFECT-OCCURRED-RECORD` | `L8-K8-BASE-PROJECTION-SELECTED` | current effect resultをoccurredにする | observed_effect result保持、validation lookup別保持 |
| `L8-K8-07-EFFECT-BINDING-NULL` | `L8-K8-BASE-VALIDATION` | `validate_label_transition`の完全keyを維持し、EffectObservation.bindingだけnull | `TransitionValidation.result=Unknown(missing_input)`、`components.effect=Value(EffectObservation{binding:null})`を保持 |
| `L8-K8-07-VALIDATION-OLD-RECORD` | `L8-K8-BASE-PROJECTION-SELECTED` | validation pointerだけ旧Value | K2 Staleをfreshで上書きしない |
| `L8-K8-08-READ-INSTRUCTION` | `L8-K8-BASE-CLASSIFICATION` | 対象1種類をread-only inputとして接続 | read-only由来の昇格・effect occurred・trusted化なし |
| `L8-K8-08-READ-REQUIREMENT` | `L8-K8-BASE-CLASSIFICATION` | 対象1種類をread-only inputとして接続 | read-only由来の昇格・effect occurred・trusted化なし |
| `L8-K8-08-READ-AUTHORITY` | `L8-K8-BASE-CLASSIFICATION` | 対象1種類をread-only inputとして接続 | read-only由来の昇格・effect occurred・trusted化なし |
| `L8-K8-08-READ-PERSISTENCE` | `L8-K8-BASE-CLASSIFICATION` | 対象1種類をread-only inputとして接続 | read-only由来の昇格・effect occurred・trusted化なし |
| `L8-K8-08-READ-LEARNING` | `L8-K8-BASE-CLASSIFICATION` | 対象1種類をread-only inputとして接続 | read-only由来の昇格・effect occurred・trusted化なし |
| `L8-K8-08-READ-AGENT-INSTRUCTION` | `L8-K8-BASE-CLASSIFICATION` | 対象1種類をread-only inputとして接続 | read-only由来の昇格・effect occurred・trusted化なし |
| `L8-K8-08-READ-TOOL-AUTHORITY` | `L8-K8-BASE-CLASSIFICATION` | 対象1種類をread-only inputとして接続 | read-only由来の昇格・effect occurred・trusted化なし |
| `L8-K8-08-READ-MEMORY` | `L8-K8-BASE-CLASSIFICATION` | 対象1種類をread-only inputとして接続 | read-only由来の昇格・effect occurred・trusted化なし |
| `L8-K8-08-READ-BRAIN` | `L8-K8-BASE-CLASSIFICATION` | 対象1種類をread-only inputとして接続 | read-only由来の昇格・effect occurred・trusted化なし |
| `L8-K8-08-READ-TRAINING-DATA` | `L8-K8-BASE-CLASSIFICATION` | 対象1種類をread-only inputとして接続 | read-only由来の昇格・effect occurred・trusted化なし |
| `L8-K8-08-READ-SECURITY-POLICY` | `L8-K8-BASE-CLASSIFICATION` | 対象1種類をread-only inputとして接続 | read-only由来の昇格・effect occurred・trusted化なし |
| `L8-K8-09-K6-READSET-MISSING` | `L8-K8-BASE-VALIDATION` | K6 required read-set refを1件欠落 | K6 Unknown(missing_input) |
| `L8-K8-09-K6-NEGATIVE` | `L8-K8-BASE-VALIDATION` | K6 combinedだけNegative | Value(Denied{source:route_verification}) |
| `L8-K8-09-K6-UNDETERMINED` | `L8-K8-BASE-VALIDATION` | K6 set_reasonだけUnknown(missing_input) | validation Unknown(missing_input)、K3/effect保持 |
| `L8-K8-10-EXACT-DUP` | `K2-CURRENT-LOOKUP-BASE` | exact alias/refを重複 | dedupして1件 |
| `L8-K8-10-ALIAS-CONFLICT` | `K2-CURRENT-LOOKUP-BASE` | 同alias内ref revision/digestを変える | key前Rejected(missing_key) |
| `L8-K8-10-SAVED-R1-CURRENT-R2` | `K2-CURRENT-LOOKUP-BASE` | saved/currentをrole別aliasでR1/R2にする | old K3 Valueならcomponent Stale |
| `L8-K8-10-SAME-REV-DIFF-DIGEST` | `K2-CURRENT-LOOKUP-BASE` | 同revisionでdigestだけ異なる | Unknown(conflict) |
| `L8-K8-10-IDENTITY-SET-CHANGE` | `K2-CURRENT-LOOKUP-BASE` | identity集合を変える | Unobserved(not_run) |
| `L8-K8-11-TAINT-GRAPH` | `K8-API-SURFACE-BASE` | 禁止surface `taint-graph` を一項目だけ候補へ加える | 追加API/型/vocabularyを契約へ導入しない |
| `L8-K8-11-IMPLICIT-INHERITANCE` | `K8-API-SURFACE-BASE` | 禁止surface `implicit-inheritance` を一項目だけ候補へ加える | 追加API/型/vocabularyを契約へ導入しない |
| `L8-K8-11-JOIN-MEET` | `K8-API-SURFACE-BASE` | 禁止surface `join-meet` を一項目だけ候補へ加える | 追加API/型/vocabularyを契約へ導入しない |
| `L8-K8-11-DECLASSIFY-API` | `K8-API-SURFACE-BASE` | 禁止surface `declassify-api` を一項目だけ候補へ加える | 追加API/型/vocabularyを契約へ導入しない |
| `L8-K8-11-NEW-VOCABULARY` | `K8-API-SURFACE-BASE` | 禁止surface `new-vocabulary` を一項目だけ候補へ加える | 追加API/型/vocabularyを契約へ導入しない |
| `L8-K8-12-OTHER-CASE-POINTER` | `L8-K8-BASE-PROJECTION-SELECTED` | pointer case identityだけ異なる | current result保持、pointer diagnostic |
| `L8-K8-12-OTHER-SCOPE-POINTER` | `L8-K8-BASE-PROJECTION-SELECTED` | pointer scopeだけ異なる | current result保持、pointer diagnostic |
| `L8-K8-12-POINTER-FIELD-MISSING` | `L8-K8-BASE-PROJECTION-SELECTED` | pointer fieldだけ欠落 | current result保持、missing_key diagnostic |
| `L8-K8-12-NULL-POINTER-DENIED` | `L8-K8-BASE-PROJECTION-SELECTED` | pointer null、current result Denied | Denied保持 |
| `L8-K8-13-VERSION-CHANGE` | `K2-CURRENT-LOOKUP-BASE` | operation versionだけ変更 | Unobserved(not_run) |
| `L8-K8-13-SCOPE-CHANGE` | `K2-CURRENT-LOOKUP-BASE` | scopeだけ変更 | Unobserved(not_run) |
| `L8-K8-13-IDENTITY-SET-CHANGE` | `K2-CURRENT-LOOKUP-BASE` | subject identity集合だけ変更 | Unobserved(not_run) |
| `L8-K8-13-REV-DIGEST-CHANGE` | `K2-CURRENT-LOOKUP-BASE` | 同identity revision+digest更新 | old Value Stale |
| `L8-K8-13-SAME-REV-DIGEST-CHANGE` | `K2-CURRENT-LOOKUP-BASE` | 同revisionのdigestだけ変更 | Unknown(conflict) |
| `L8-K8-13-FRESH-REF-MISMATCH` | `L8-K8-BASE-VALIDATION` | route targetの実読refだけ不一致 | Value(Mismatch{fields:[target]}) |
| `L8-K8-13-REQUIRED-REF-MISSING` | `L8-K8-BASE-PROJECTION-SELECTED` | selected owner bindingのvalidation required route refを一つ欠落 | `validated_transition=KeyUnavailable(Rejected(missing_key))`。利用可能な分類/effect/component lookupは保持 |
| `L8-K8-14-POINTER-ONLY-UPDATE` | `K2-CURRENT-LOOKUP-BASE` | pointer keysだけ更新、input label固定 | K8CaseBindingRef unchanged |
| `L8-K8-14-INPUT-LABEL-UPDATE` | `K2-CURRENT-LOOKUP-BASE` | InputLabelRefだけ更新 | binding digest/ref更新 |
| `L8-K8-15-INPUT-LABEL` | `L8-K8-BASE-VALIDATION` | `input_label`だけを確定不一致 | `Mismatch.fields=[input_label]`だけ |
| `L8-K8-15-ROUTE` | `L8-K8-BASE-VALIDATION` | `route`だけを確定不一致 | `Mismatch.fields=[route]`だけ |
| `L8-K8-15-TARGET` | `L8-K8-BASE-VALIDATION` | `target`だけを確定不一致 | `Mismatch.fields=[target]`だけ |
| `L8-K8-15-REVISION-SUBJECT` | `L8-K8-BASE-VALIDATION` | `revision_subject`だけを確定不一致 | `Mismatch.fields=[revision_subject]`だけ |
| `L8-K8-15-PERMISSION-CHECK` | `L8-K8-BASE-VALIDATION` | `permission_check`だけを確定不一致 | `Mismatch.fields=[permission_check]`だけ |
| `L8-K8-15-PERMISSION-QUERY` | `L8-K8-BASE-VALIDATION` | `permission_query`だけを確定不一致 | `Mismatch.fields=[permission_query]`だけ |
| `L8-K8-15-EFFECT-EVENT` | `L8-K8-BASE-VALIDATION` | `effect_event`だけを確定不一致 | `Mismatch.fields=[effect_event]`だけ |
| `L8-K8-15-BINDING-INPUT-LABEL` | `L8-K8-BASE-VALIDATION` | `binding.input_label`だけを確定不一致 | `Mismatch.fields=[binding.input_label]`だけ |
| `L8-K8-15-BINDING-ROUTE` | `L8-K8-BASE-VALIDATION` | `binding.route`だけを確定不一致 | `Mismatch.fields=[binding.route]`だけ |
| `L8-K8-15-BINDING-TARGET` | `L8-K8-BASE-VALIDATION` | `binding.target`だけを確定不一致 | `Mismatch.fields=[binding.target]`だけ |
| `L8-K8-15-BINDING-PERMISSION-QUERY` | `L8-K8-BASE-VALIDATION` | `binding.permission_query`だけを確定不一致 | `Mismatch.fields=[binding.permission_query]`だけ |
| `L8-K8-15-ISSUER` | `L8-K8-BASE-VALIDATION` | `issuer`だけを確定不一致 | `Mismatch.fields=[issuer]`だけ |
| `L8-K8-15-CURRENT-CLASSIFICATION-RECORD` | `L8-K8-BASE-VALIDATION` | `current_classification_record`だけを確定不一致 | `Mismatch.fields=[current_classification_record]`だけ |
| `L8-K8-15-NULL-COMPARISON` | `L8-K8-BASE-VALIDATION` | `route`比較値だけをnullにし比較不能 | `Unknown(missing_input)`、Mismatch.fieldsへ追加しない |
| `L8-K8-15-TWO-FIELDS-ORDER` | `L8-K8-BASE-VALIDATION` | `input_label`と`route`だけ不一致 | `Mismatch.fields=[input_label, route]`の順に各1回 |
| `L8-K8-16-REJECTED-FIRST` | `L8-K8-BASE-VALIDATION` | API required key field欠落 | API Rejected(missing_key)、K1結果なし |
| `L8-K8-16-KEY-UNAVAILABLE` | `L8-K8-BASE-VALIDATION` | selected required ref欠落 | KeyUnavailable(Rejected(missing_key)) |
| `L8-K8-16-NOT-SELECTED-QUERY` | `L8-K8-BASE-VALIDATION` | input-only owner selectionだけをnot_selectedへ変え、complete current keyで明示照会 | TransitionValidation.result=Unobserved(not_selected) |
| `L8-K8-16-MISMATCH` | `L8-K8-BASE-VALIDATION` | `target`だけを確定不一致 | TransitionValidation.result=Value(Mismatch{fields:[target]}) |
| `L8-K8-16-K3-DENIED` | `L8-K8-BASE-VALIDATION` | K3 combined Negative | Value(Denied{source:permission_check}) |
| `L8-K8-16-K6-DENIED` | `L8-K8-BASE-VALIDATION` | K6 combined Negative | Value(Denied{source:route_verification}) |
| `L8-K8-16-UNKNOWN` | `L8-K8-BASE-VALIDATION` | 一dependencyだけUnknown(unreadable) | TransitionValidation.result=Unknown(unreadable) |
| `L8-K8-16-UNOBSERVED` | `L8-K8-BASE-VALIDATION` | 一dependencyだけUnobserved(not_run) | TransitionValidation.result=Unobserved(not_run) |
| `L8-K8-16-VALIDATED` | `L8-K8-BASE-VALIDATION` | 完全一致・全依存肯定 | Value(Validated) |
| `L8-K8-16-RECORD-STALE-ISOLATED` | `L8-K8-BASE-PROJECTION-SELECTED` | `record_label_transition`のみを呼ぶ。current validation keyと同一identityの旧Value recordを用意し、current revision/digestを更新 | `validated_transition`のK2 lookup結果`Stale<TransitionOutcome>`を保持し、fresh validationを呼ばない |
| `L8-K8-17-ROLE-SOURCE-READ` | `L8-K8-BASE-VALIDATION` | binding roleのraw source bytesを実読 | ref digest一致 |
| `L8-K8-17-SAVED-R1-CURRENT-R2` | `L8-K8-BASE-VALIDATION` | 異revisionをside/role別aliasへ分離 | current K3 old Valueはcomponent Stale |
| `L8-K8-17-SAME-ALIAS-CONFLICT` | `L8-K8-BASE-VALIDATION` | 同alias内異ref | key前Rejected(missing_key) |
| `L8-K8-17-BINDING-ONLY-NO-SOURCE-READ` | `L8-K8-BASE-VALIDATION` | binding bytesのみ読取 | source read assertion不成立 |
| `L8-K8-18-CASE-REF-MISSING` | `L8-K8-BASE-EFFECT` | case_refを欠落 | API Rejected(missing_key) |
| `L8-K8-18-SAME-EFFECT-OTHER-CASE` | `L8-K8-BASE-EFFECT` | 同effect refを別caseへ置く | 各case明示binding/key、逆引きなし |
| `L8-K8-19-OPERATION-VERSION-CHANGE` | `K2-CURRENT-LOOKUP-BASE` | current operation versionだけ変更 | Unobserved(not_run) |
| `L8-K8-19-SCOPE-CHANGE` | `K2-CURRENT-LOOKUP-BASE` | scopeだけ変更 | Unobserved(not_run) |
| `L8-K8-19-IDENTITY-SET-CHANGE` | `K2-CURRENT-LOOKUP-BASE` | subject identity setだけ変更 | Unobserved(not_run) |
| `L8-K8-19-REVISION-UPDATE` | `K2-CURRENT-LOOKUP-BASE` | 同identity revision+digest更新 | old Value Stale |
| `L8-K8-19-SAME-REV-DIGEST-CONFLICT` | `K2-CURRENT-LOOKUP-BASE` | 同revision異digest | Unknown(conflict) |
| `L8-K8-19-OLD-POINTER-ONLY` | `K2-CURRENT-LOOKUP-BASE` | pointerだけ旧ref | current key lookup結果を維持 |
| `L8-K8-20-K3-COMBINED-POSITIVE` | `L8-K8-BASE-PROJECTION-SELECTED` | 保存evidence中のK3 `PermissionCheckResult.combined.verdict`だけを`Positive`にする | record APIの`validated_transition.components.permission_check`からK3 `PermissionCheckResult`を型どおり復元し、`combined.verdict=Positive`、他componentとassuranceはbaselineどおり保持 |
| `L8-K8-20-K3-COMBINED-NEGATIVE` | `L8-K8-BASE-PROJECTION-SELECTED` | 保存evidence中のK3 `PermissionCheckResult.combined.verdict`だけを`Negative`にする | record APIの`validated_transition.components.permission_check`からK3 `PermissionCheckResult`を型どおり復元し、`combined.verdict=Negative`、他componentとassuranceはbaselineどおり保持 |
| `L8-K8-20-K3-COMBINED-UNDETERMINED` | `L8-K8-BASE-PROJECTION-SELECTED` | 保存evidence中のK3 `PermissionCheckResult.combined.verdict`だけを`Undetermined`にする | record APIの`validated_transition.components.permission_check`からK3 `PermissionCheckResult`を型どおり復元し、`combined.verdict=Undetermined`と元のnon-value components/`set_reason`、assuranceを保持 |
| `L8-K8-20-K3-DIAGNOSTIC-MISSING-KEY` | `L8-K8-BASE-PROJECTION-SELECTED` | 保存evidence中のK3 componentを`PermissionCheckDiagnostic{reason:missing_key}`にする（K3 §16.2で定義済みのdiagnostic reason） | `validated_transition.components.permission_check`に`PermissionCheckDiagnostic`型と`reason=missing_key`をそのまま復元。これを`PermissionCheckResult`やK1 resultへ変換しない |
| `L8-K8-20-K3-DIAGNOSTIC-INVALID-QUERY` | `L8-K8-BASE-PROJECTION-SELECTED` | 保存evidence中のK3 componentを`PermissionCheckDiagnostic{reason:invalid_query}`にする | `validated_transition.components.permission_check`に`PermissionCheckDiagnostic`型と`reason=invalid_query`をそのまま復元。これを`PermissionCheckResult`やK1 resultへ変換しない |
| `L8-K8-20-K3-ASSURANCE-REVERIFIABLE` | `L8-K8-BASE-PROJECTION-SELECTED` | reverifiable assurance fieldだけ変える | 対象assurance fieldを元型で復元、他component不変 |
| `L8-K8-20-K3-ASSURANCE-REPRODUCTION` | `L8-K8-BASE-PROJECTION-SELECTED` | reproduction assurance fieldだけ変える | 対象assurance fieldを元型で復元、他component不変 |
| `L8-K8-20-K3-ASSURANCE-ISSUER-AUTHENTICITY` | `L8-K8-BASE-PROJECTION-SELECTED` | issuer-authenticity assurance fieldだけ変える | 対象assurance fieldを元型で復元、他component不変 |
| `L8-K8-20-K6-COMBINED-POSITIVE` | `L8-K8-BASE-PROJECTION-SELECTED` | 保存evidence中のK6 `RequiredResult.combined.verdict`だけを`Positive`にする | `validated_transition.components.route_verification`からK6 `RequiredResult`を型どおり復元し、`combined.verdict=Positive`、assuranceとK3 componentをbaselineどおり保持 |
| `L8-K8-20-K6-COMBINED-NEGATIVE` | `L8-K8-BASE-PROJECTION-SELECTED` | 保存evidence中のK6 `RequiredResult.combined.verdict`だけを`Negative`にする | `validated_transition.components.route_verification`からK6 `RequiredResult`を型どおり復元し、`combined.verdict=Negative`、assuranceとK3 componentをbaselineどおり保持 |
| `L8-K8-20-K6-COMBINED-UNDETERMINED` | `L8-K8-BASE-PROJECTION-SELECTED` | 保存evidence中のK6 `RequiredResult.combined.verdict`だけを`Undetermined`にする | `validated_transition.components.route_verification`からK6 `RequiredResult`を型どおり復元し、`combined.verdict=Undetermined`と元のnon-value components/`set_reason`、assuranceを保持 |
| `L8-K8-20-K6-ASSURANCE-REVERIFIABLE` | `L8-K8-BASE-PROJECTION-SELECTED` | reverifiable assurance fieldだけ変える | 対象assurance fieldを元型で復元、他component不変 |
| `L8-K8-20-K6-ASSURANCE-REPRODUCTION` | `L8-K8-BASE-PROJECTION-SELECTED` | reproduction assurance fieldだけ変える | 対象assurance fieldを元型で復元、他component不変 |
| `L8-K8-20-K6-ASSURANCE-ISSUER-AUTHENTICITY` | `L8-K8-BASE-PROJECTION-SELECTED` | issuer-authenticity assurance fieldだけ変える | 対象assurance fieldを元型で復元、他component不変 |
| `L8-K8-20-EVIDENCE-UNREADABLE` | `L8-K8-BASE-PROJECTION-SELECTED` | saved evidence bytesを読取不能 | ValidationEvidenceUnavailable(unreadable)、lookup/evidence ref維持、assurance補完なし |
| `L8-K8-20-NO-SELF-REFERENCE` | `L8-K8-BASE-PROJECTION-SELECTED` | evidenceにself key/pointerを含める | self referenceを拒否、唯一result=Observed<TransitionOutcome> |
| `L8-K8-20-CURRENT-EFFECT-INDEPENDENT` | `L8-K8-BASE-PROJECTION-SELECTED` | current effect lookupを独立に変える | current effect resultを別fieldで保持 |
| `L8-K8-21-POINTERS-FIXED-LABEL-CHANGED` | `K2-CURRENT-LOOKUP-BASE` | pointer keysを固定し、input-only bindingの`InputLabelRef`だけを変更 | `K8CaseBindingRef`のcanonical bytes/digest/revisionが更新。pointer/headは不変 |
| `L8-K8-21-LABEL-FIXED-POINTERS-CHANGED` | `K2-CURRENT-LOOKUP-BASE` | `InputLabelRef`を固定し、effect/validation result pointer keysだけを変更 | `K8CaseBindingRef`のcanonical bytes/digest/revisionとinput-only HeadInputRefは不変 |
| `L8-K8-22-CLASSIFIER-REVISION` | `K2-CURRENT-LOOKUP-BASE` | classifier contract revisionだけ更新 | operation_version/key更新、旧結果Unobserved(not_run) |
| `L8-K8-22-SAME-REV-DIGEST` | `K2-CURRENT-LOOKUP-BASE` | 同revision異digest | Unknown(conflict) |
| `L8-K8-22-OPTIONAL-ROUTE-SLICE-ABSENT` | `L8-K8-BASE-CLASSIFICATION` | optional route/effect sliceだけ欠落 | 同じObservedLabel/classificationを保持し分類keyを止めない |
| `L8-K8-23-UNREGISTERED-AND-UNREADABLE` | `L8-K8-BASE-CLASSIFICATION` | 未登録+read errorの複合 | Unknown(unreadable)、全candidate evidence保持 |
| `L8-K8-23-HEAD-DRIFT-AND-UNREADABLE` | `L8-K8-BASE-EFFECT` | head drift+read errorの複合 | Unknown(unreadable)、全candidate evidence保持 |
| `L8-K8-23-MISSING-KEY-AND-UNREADABLE` | `L8-K8-BASE-EFFECT` | required key欠落+read errorの複合 | API Rejected(missing_key)先行 |
| `L8-K8-24-NOT-SELECTED-EXPLICIT-QUERY` | `L8-K8-BASE-VALIDATION` | input-only owner selectionだけをnot_selectedへ変え、complete current keyで明示照会 | TransitionValidation.result=Unobserved(not_selected) |
| `L8-K8-24-NOT-SELECTED-QUERY-MISSING-KEY` | `L8-K8-24-NOT-SELECTED-EXPLICIT-QUERY` | not_selected explicit queryのrequired refを一つ欠落 | API Rejected(missing_key)、K1 resultなし |
| `L8-K8-24-NOT-SELECTED-PROJECTION` | `L8-K8-BASE-PROJECTION-NOT-SELECTED` | query未発行not_selected projection | NotSelected、K1 key/resultなし |
| `L8-K8-25-ISSUER-MATCH` | `L8-K8-BASE-VALIDATION` | declared/observed issuer一致 | non-K1 diagnostic match、authenticity未証明 |
| `L8-K8-25-ISSUER-MISMATCH` | `L8-K8-BASE-VALIDATION` | observed issuerだけdeclared issuerと不一致 | `Mismatch{fields:[issuer]}`。真正性を推論しない |
| `L8-K8-25-ISSUER-UNAVAILABLE` | `L8-K8-BASE-VALIDATION` | current issuer registrationだけ未取得 | 元effect component非Value維持 |
| `L8-K8-25-K6-UNSUPPORTED-AUTHENTICITY` | `L8-K8-BASE-VALIDATION` | K6 issuer_authenticityを入力 | Unknown(unsupported)保持 |
| `L8-K8-26-POLARITY-ID-MISSING` | `L8-K8-BASE-VALIDATION` | K1 `k8_transition_polarity` mapping構造の照合でidentityだけを欠落 | current mappingを特定できないことをassertし、K1 combine resultや新reasonは生成しない |
| `L8-K8-26-POLARITY-REVISION` | `L8-K8-BASE-VALIDATION` | K1 `k8_transition_polarity` mapping refのrevisionだけをcurrent K8 validation API contract refと異ならせる | 構造比較でcurrent contract revisionとの不一致をassertする。API/K1判定結果を推論しない |
| `L8-K8-26-FOREIGN-OWNER` | `L8-K8-BASE-VALIDATION` | mapping ownerだけをHARNESS以外へ変更 | 構造比較でowner mismatchをassertする。これは写像schemaの不適合であり、K1 returned classificationではない |
| `L8-K8-26-NEGATIVE-PROMOTED` | `L8-K8-BASE-VALIDATION` | mapping tableでMismatchまたはDeniedの一つだけをPositiveへ変更 | 構造比較で既存L4 polarity tableとの不一致をassertする。K1 runtime resultを返すfixtureではない |

#### IV-K8-16の具体的な二条件fixture

以下10組はいずれも`L8-K8-BASE-VALIDATION`から開始し、validation keyのrequired refs一式（case binding、saved InputLabelRef、route/target、K3 PermissionCheckRef、K6 verifier/receipt refs、effect ref、各current owner input head）を欠落させない。K3とK6はL4 §18.3の`components.permission_check`と`components.route_verification`で別々に保持し、K3 current PermissionCheckとK6 current RequiredResultの参照・読み取りを分ける（K3 `check_permission` / K6 `required`・`read`、L4 §§10.3, 16.4, 18.3–18.4）。二条件fixtureでは指定されたcomponent resultだけを変異し、他の参照・component・assuranceはbaselineのままにする。

| fixture ID | 正常基準と二条件 | L4 §18.4の優先比較 | 主結果 / component assertion |
|---|---|---|---|
| `L8-K8-16-PAIR-MISMATCH-K3` | `L8-K8-BASE-VALIDATION`からtargetだけ確定不一致、`TransitionValidation.components.permission_check`内のK3 `PermissionCheckResult.combined.verdict=Negative` | 条件3が条件4より先 | `result=Value(Mismatch{fields:[target]})`。K3 Negativeとassuranceをcomponentに保持。 |
| `L8-K8-16-PAIR-MISMATCH-K6` | `L8-K8-BASE-VALIDATION`からtargetだけ確定不一致、`TransitionValidation.components.route_verification`内のK6 `RequiredResult.combined.verdict=Negative` | 条件3が条件5より先 | `result=Value(Mismatch{fields:[target]})`。K6 Negativeとassuranceをcomponentに保持。 |
| `L8-K8-16-PAIR-MISMATCH-UNKNOWN` | `L8-K8-BASE-VALIDATION`からtargetだけ確定不一致、`TransitionValidation.components.current_classification=Unknown(unreadable)` | 条件3が条件6より先 | `result=Value(Mismatch{fields:[target]})`。Unknown component/evidenceを保持。 |
| `L8-K8-16-PAIR-MISMATCH-UNOBSERVED` | `L8-K8-BASE-VALIDATION`からtargetだけ確定不一致、`TransitionValidation.components.effect=Unobserved(not_run)` | 条件3が条件7より先 | `result=Value(Mismatch{fields:[target]})`。Unobserved component/evidenceを保持。 |
| `L8-K8-16-PAIR-K3-K6` | `L8-K8-BASE-VALIDATION`から`TransitionValidation.components.permission_check`のK3 `PermissionCheckResult.combined.verdict`と`TransitionValidation.components.route_verification`のK6 `RequiredResult.combined.verdict`だけをそれぞれNegative | 条件4が条件5より先 | `result=Value(Denied{source:permission_check})`。両Negativeとassuranceを個別componentに保持。 |
| `L8-K8-16-PAIR-K3-UNKNOWN` | `L8-K8-BASE-VALIDATION`から`TransitionValidation.components.permission_check`のK3 `PermissionCheckResult.combined.verdict=Negative`、`TransitionValidation.components.current_classification=Unknown(unreadable)` | 条件4が条件6より先 | `result=Value(Denied{source:permission_check})`。Unknown component/evidenceを保持。 |
| `L8-K8-16-PAIR-K3-UNOBSERVED` | `L8-K8-BASE-VALIDATION`から`TransitionValidation.components.permission_check`のK3 `PermissionCheckResult.combined.verdict=Negative`、`TransitionValidation.components.effect=Unobserved(not_run)` | 条件4が条件7より先 | `result=Value(Denied{source:permission_check})`。Unobserved component/evidenceを保持。 |
| `L8-K8-16-PAIR-K6-UNKNOWN` | `L8-K8-BASE-VALIDATION`から`TransitionValidation.components.route_verification`のK6 `RequiredResult.combined.verdict=Negative`、`TransitionValidation.components.current_classification=Unknown(unreadable)` | 条件5が条件6より先 | `result=Value(Denied{source:route_verification})`。Unknown component/evidenceを保持。 |
| `L8-K8-16-PAIR-K6-UNOBSERVED` | `L8-K8-BASE-VALIDATION`から`TransitionValidation.components.route_verification`のK6 `RequiredResult.combined.verdict=Negative`、`TransitionValidation.components.effect=Unobserved(not_run)` | 条件5が条件7より先 | `result=Value(Denied{source:route_verification})`。Unobserved component/evidenceを保持。 |
| `L8-K8-16-PAIR-UNKNOWN-UNOBSERVED` | `L8-K8-BASE-VALIDATION`から`TransitionValidation.components.current_classification=Unknown(unreadable)`、`TransitionValidation.components.effect=Unobserved(not_run)` | 条件6が条件7より先 | `result=Unknown(unreadable)`。両candidateと元componentを保持。 |

これら10組は、L4 §18.3が既に定義する`TransitionValidation.components`の別々のfield（`current_classification`、`effect`、`permission_check`、`route_verification`）に、完全なBASEのrequired refsを保ったまま値を与える純粋な複合入力である。reader/APIやowner sourceを追加せず、L4 §18.4の順序と既存component保持だけを比較する。

KeyUnavailableとMismatch/K3/K6/Unknown/Unobservedの同時条件はfixture化しない。L4 §18.4の判定順1–2は必須key ref欠落時のAPI `Rejected(missing_key)`またはprojection内`KeyUnavailable`を先に決める。欠落したrefがある状態で、K3/K6の別current sourceを独立取得してfresh componentとして合成することまでは明示していない。独立取得可能性を仮定しないため、この5組は構築可能性未確定としてfixture ID・件数・検証範囲へ算入しない。非欠落pairは`L8-K8-BASE-VALIDATION`を正常基準にし、K3 `PermissionCheckResult` refとK6 `RequiredResult` ref、effect/route/input refsを全て有効・currentに保つ。L4 §18.3の`TransitionValidation.components`がK3 `PermissionCheck`とK6 `RequiredResult`を別fieldで保持し、§18.4の条件3–8がそれらのfresh判定順を定めるため、各pairでは対応するcomponent値だけを変異できる。これらの根拠が明示された10組を構築可能なfixture設計として数える。いずれも未実行であり、構築可能性は実測・実装済みを意味しない。`Rejected`はAPI必須入力/基盤欠落によるAPI境界、`NotSelected`はquery未発行projection、`Validated`は全必須値がそろった終端条件、record Staleはlookup結果であり、fresh component同士の組合せとはしない。

### 11.1 traceの範囲と限界

上表の26 IVは既存L9 oracleへの対応fixtureであり、L9定義を再発行しない。特にIV-K8-08の11 target、IV-K8-15のfield語彙、IV-K8-16/23の優先順位、IV-K8-20の保存evidence保全を一つのまとめcaseへ潰さず、個別fixture IDへ分けた。K8のAPI field、reason、schema、route/authority、sink対象を新設していない。追加したfixture IDのmanifest登録、実装、実行、CI coverageは主張しない。

L4はK6 `RequiredResult`とK3 `PermissionCheck`をK8 result componentとして明示する。この文書はその既存型境界しか参照しない。起点baseで未統合だったK6/K7 L5/L8の詳細は借用せず、K7 AppliedUncertainをK8 API型として導入しない。起点baseのL4 §18.2本文末尾にあったWCA L4旧SHA typoはmain #2779で修正済みであり、このpairでは歴史snapshotを保持してL4を編集・再転記しない。

## 12. K10 fixture表

本節はL4 §14.1–14.8とL9 IV-K10-01–14を各fixtureへ展開する。全fixtureは未実行であり、設計上の期待値であってL10成立・実装pass・owner source接続を示さない。K10の直接L3 traceはL4 §14.1に限る。列挙ACは`AC-HARNESS-L3-023-02/-03`、`FR-HARNESS-L3-010`境界、`AC-HARNESS-L3-014-04`/`AC-HARNESS-L3-030-04`、`AC-INTELLIGENCE-L3-078-04`、`AC-OS-014-07`、`INFRA-006-AC-01`/`INFRA-001-AC-03`、`BRAIN-005-AC-01/-02`、`BRAIN-INFRA-014-AC-01/-02`、`BRAIN-INFRA-015-AC-02`であり、新しい親やgateを作らない。正常基準から各一条件だけ変える。複合oracleと明記するIV-K10-11は単一scenarioの中で指定された複数componentを全てassertし、caseを分割して期待の一部を失わない。

| L8 fixture ID | L9 / L4 trace | 対象API・入力変異 | 期待する単一結果・観測 |
|---|---|---|---|
| `L8-K10-01-BASE` | IV-K10-01 / K10-I1 | `check_graph`; registered relation、全node endpoint、非空edge | `Combined.verdict=Positive`、各edge componentを保持 |
| `L8-K10-01-UNREGISTERED-RELATION` | 同上 | baselineのedgeでrelationだけをvocab外へ | 該当edge component `Unknown(unregistered)` |
| `L8-K10-01-MISSING-ENDPOINT` | 同上 | `to` endpointだけをGraphDecl node集合から外す | 該当edge component `Unknown(missing_input)` |
| `L8-K10-01-EMPTY-EDGES` | 同上 | edge集合のみ空にする | `Combined.set_reason`を保持。新reasonを作らない |
| `L8-K10-02-BASE` | IV-K10-02 / K10-I2 | `build_graph`; 固定sourceが宣言するedge一つ | `state=confirmed`。肯定は宣言graph内に限る |
| `L8-K10-02-LLM-CANDIDATE` | 同上 | source一条件だけをLLM提案へ替える | `state=candidate`、confirmedにしない |
| `L8-K10-02-NAME-SIMILARITY-CANDIDATE` | 同上 | source一条件だけを名称類似根拠に替える | `state=candidate`、confirmedにしない |
| `L8-K10-02-CANDIDATE-PROMOTION-ATTEMPT` | 同上 | test projection候補では完全な`GraphDecl`/`GraphRules` refsとsource-owner宣言baselineを固定し、source宣言内のedge `state`だけを`candidate`から`confirmed`へ変える。`GraphDecl`へ`Edge`を直接注入しない。source→member mapping/readerは未定義のためfixtureは未接続・local hold | L9が定める`Rejected` classを期待するが、実reader未接続なので実行可能な判定境界ではない。reasonはL4で特定されないため追加しない。新APIや昇格APIを作らない |
| `L8-K10-02-CANDIDATE-NOT-EFFECTIVE` | 同上 | closure graphにcandidate dependencyのみを置く | candidate edgeは`effective`へ入らない |
| `L8-K10-03-BASE` | IV-K10-03 / K10-I3 | `check_graph`; declared propertiesを満たす複数edge | `Positive` |
| `L8-K10-03-SYMMETRIC-REVERSE-MISSING` | 同上 | symmetric edgeのreverse edgeだけを除く | 違反edge component `Negative` |
| `L8-K10-03-INVERSE-EDGE-MISSING` | 同上 | inverse型の対応reverse relation edgeだけを除く | 違反edge component `Negative` |
| `L8-K10-03-CONTRADICTS-PAIR` | 同上 | 同端点のcontradicts pairだけを成立させる | pair component `Negative` |
| `L8-K10-03-CYCLE-ONLY` | 同上 | property違反なしでcycleだけを加える | cycleを理由にNegative/Rejectedにしない。既存判定結果を保持 |
| `L8-K10-04-BASE` | IV-K10-04 / K10-I4 | `closure`; required effective edgeとnot_selected source edge | required node `effective`、source node `diagnostics=not_selected`、combined Positive |
| `L8-K10-04-SELECTION-UNKNOWN` | 同上 | selection stateのみunknownへ変更 | 当該node `held`、component `Unknown(missing_input)` |
| `L8-K10-04-CONDITION-FALSE` | 同上 | operation_conditionのみfalseへ変更 | `diagnostics=condition_false`、有効成分には入らない |
| `L8-K10-04-REFERENCE-ONLY` | 同上 | edge dep_classのみreference_onlyへ変更 | 先へ辿らずdiagnosticsに保持 |
| `L8-K10-04-TRANSITIVE-FALSE` | 同上 | 一段目edgeのtransitiveだけfalse、先に二段目edgeを置く | 直接到達先のみ処理し二段目へ進まない。訪問済み集合をcycle拒否へ流用しない |
| `L8-K10-05-BASE` | IV-K10-05 / K10-I4 | `closure`; 条件成立のsafety dependency | safety先はeffective |
| `L8-K10-05-SAFETY-DROPPED` | 同上 | mutant実装がeffective safety先を除外するケースを適用 | oracleはsafety先`effective`をassertし、除外された出力は不一致 |
| `L8-K10-06-DEPENDS-ON-AGAINST` | IV-K10-06 / K10-I5 | `impact`; A depends_on B、changed=[B] | Aがaffected |
| `L8-K10-06-AFFECTS-ALONG` | 同上 | A affects B、changed=[A] | Bがaffected |
| `L8-K10-06-UNIFORM-FORWARD-MUTATION` | 同上 | mutant実装でagainstもfrom→toとして扱う | oracleはdepends_onのAをaffectedにassertし、落ちた出力は不一致 |
| `L8-K10-06-UNIFORM-REVERSE-MUTATION` | 同上 | mutant実装でalongもto→fromとして扱う | oracleはaffectsのBをaffectedにassertし、落ちた出力は不一致 |
| `L8-K10-06-CANDIDATE-POSSIBLY` | 同上 | candidate edgeだけで到達可能なnodeを加える | nodeはpossiblyに入りaffectedには入らない |
| `L8-K10-06-HELD-BRANCH` | 同上 | traversed branch conditionをunknownへ変更 | branch先Unknown(missing_input)を保持し「影響なし」にしない |
| `L8-K10-07-OPERATION-TRUE` | IV-K10-07 / K10-I5 | `impact`; operation_condition=true | 到達nodeはaffected |
| `L8-K10-07-OPERATION-FALSE` | 同上 | true baselineからconditionだけfalseへ | nodeはaffectedから外れcondition_false diagnostic |
| `L8-K10-07-OPERATION-UNKNOWN` | 同上 | true baselineからconditionだけunknownへ | nodeはheldとなりUnknown(missing_input) |
| `L8-K10-08-BASE` | IV-K10-08 / K10-I7 | `impact`→`review_set`; records, obligations, declarationsを固定 | affected identityのK2/K4 exact setのみ返す |
| `L8-K10-08-OPERATION-INPUT-INCLUDES` | 同上 | affected node Dはobligation source/targetに無く、current OperationDecl.inputsにDだけ含める | 義務をexact setに含める |
| `L8-K10-08-OPERATION-INPUT-EXCLUDES` | 同上 | 同一操作のinputsからDだけを除く | 該当義務を含めない |
| `L8-K10-08-RECORD-NEW-REVISION` | 同上 | input identity集合を保ち一ref revisionだけ正当に更新 | 旧Value lookupはStale |
| `L8-K10-08-RECORD-SAME-REV-DIGEST` | 同上 | 同一identity/revision refのdigest/bytesだけ不整合へ | lookup `Unknown(conflict)` |
| `L8-K10-08-RECORD-INPUT-IDENTITY` | 同上 | input identity集合だけ変更 | lookup `Unobserved(not_run)` |
| `L8-K10-08-RECORD-PRIOR-NONVALUE` | 同上 | baselineの保存recordは旧revisionの非Value。exact queryのsubject/operation/input identity setを固定し、current queryの一つのSubjectRefだけを同identityの新revisionへ更新 | lookup `Unobserved(not_run, superseded=<prior.key_digest>)`。K2-I2bの旧non-Value扱いを照合 |
| `L8-K10-08-AFFECTED-OUTSIDE-RECORD` | 同上 | 変更対象をaffected外record一件だけにする | recordを見直し対象に含めない |
| `L8-K10-08-CLASS-PRESERVED` | 同上 | 入力変異なしのcontrol。baseline exact queryとrecordをそのまま用いる | `review_set`のrecord entryは保存済みclass/valueを保つ。stale/non-value lookup変異とは別のcontrol |
| `L8-K10-09-DECLARED-GRAPH-ONLY` | IV-K10-09 / K10-I6 | `independent`; graph整合、op node/CP宣言あり、CPへ到達しないdeclared closure | `Positive`はdeclared graph内だけの結果 |
| `L8-K10-10-UNREGISTERED-UNRELATED-EDGE` | IV-K10-10 / K10-I6 | CP非到達グラフで無関係edge relationだけvocab外 | `graph_check` componentが残りindependentはPositiveでない |
| `L8-K10-10-MISSING-UNRELATED-ENDPOINT` | 同上 | CP非到達グラフの無関係edge endpointだけ欠落 | `graph_check` Unknown(missing_input) componentを保持 |
| `L8-K10-10-EMPTY-GRAPH` | 同上 | edge集合のみ空 | `graph_check` set_reasonを保持しindependentをPositiveにしない |
| `L8-K10-10-CANDIDATE-ONLY` | 同上 | candidate edgeだけならCPへ届くdeclared graphを与え、candidate状態を維持 | L9 IV-K10-10のとおり`independent`は`Positive`でなく、`check_graph` componentsを`{graph_check, …}`識別付きで保持。candidate-only pathを有効到達にしない |
| `L8-K10-11-CONTROL-PLANE-AND-HELD` | IV-K10-11 / K10-I6 | `independent`; opからCPへのeffective pathに加え別branchをheldにする複合oracle | 同一scenarioの`combined.verdict=Negative`をassertし、`reasons`へCP到達のNegativeとheldの`Unknown(missing_input)`の両componentを識別付きで保持 |
| `L8-K10-11-OP-NODE-MISSING` | 同上 | op nodeだけgraphから欠落 | Unknown(missing_input) component |
| `L8-K10-11-CONTROL-PLANE-UNDECLARED` | 同上 | control_plane declarationだけ欠落 | Unknown(missing_input) component |
| `L8-K10-12-CONDITION-FALSE` | IV-K10-12 / K10-I6 | `op→R→control_plane`; final edge condition false | independent Positive |
| `L8-K10-12-CONDITION-TRUE` | 同上 | false baselineからconditionのみtrueへ | independent Negative |
| `L8-K10-12-CONDITION-UNKNOWN` | 同上 | false baselineからconditionのみunknownへ | independent Unknown(missing_input) |
| `L8-K10-13-TWO-STAGE-BASE` | IV-K10-13 / L4 §14.2 | lower query with same recorded refs | both graph-build and downstream query Value |
| `L8-K10-13-SEED-IDENTITY` | 同上 | graph固定、closure seed identityだけ変更 | downstream `Unobserved(not_run)` |
| `L8-K10-13-CONDITION-REVISION` | 同上 | graph固定、ConditionState same identity/new revision、prior Value | downstream `Stale` |
| `L8-K10-13-CHECK-REQUERY` | 同上 | check_graphのsame exact keyを再照会 | 記録のclassを保つ |
| `L8-K10-13-GRAPH-SAME-REV-DIGEST` | 同上 | GraphDecl identity/revisionを固定しbytes/digestだけ不一致 | 上流 `Unknown(conflict)`、下流lookupは起動しない |
| `L8-K10-13-SOURCE-NEW-REVISION` | 同上 | source identity固定で正当なrevisionを更新、prior Value | 上流 `Stale`、下流lookupは起動しない |
| `L8-K10-13-SOURCE-IDENTITY-ADD` | 同上 | GraphDecl.sourcesへ新identity一つ追加 | 上流 `Unobserved(not_run)`、下流lookupなし |
| `L8-K10-13-SOURCE-IDENTITY-REMOVE` | 同上 | GraphDecl.sourcesから一identityだけ除く | 上流 `Unobserved(not_run)`、下流lookupなし |
| `L8-K10-13-RULE-VERSION` | 同上 | build rule versionだけ更新 | 上流 `Unobserved(not_run)`、下流lookupなし |
| `L8-K10-13-NONVALUE-NO-GRAPHREF` | 同上 | 上流build resultを非Valueにする | 同じ非Valueを返しGraphRefを作らない |
| `L8-K10-13-NO-REVERSE-INPUT` | 同上 | edge/result側の情報からinputを逆算しようとする実装変異 | current declared inputsが元のままというoracleを保持 |
| `L8-K10-14-CHECK-RULE-CLOSURE-REVISION` | IV-K10-14 / L4 §14.2 | GraphRef/ConditionState/closure own rules固定、check_graph ruleは同identityの新revisionだけ更新 | old Valueを返さず`Stale` |
| `L8-K10-14-CHECK-RULE-CLOSURE-IDENTITY` | 同上 | それ以外を固定し、check_graph rule version updateでidentityだけ変える | old Valueを返さず`Unobserved(not_run)` |
| `L8-K10-14-CHECK-RULE-IMPACT-REVISION` | 同上 | GraphRef/ConditionState/impact own rules固定、check_graph ruleは同identityの新revisionだけ更新 | old Valueを返さず`Stale` |
| `L8-K10-14-CHECK-RULE-IMPACT-IDENTITY` | 同上 | それ以外を固定し、check_graph rule version updateでidentityだけ変える | old Valueを返さず`Unobserved(not_run)` |
| `L8-K10-14-CHECK-RULE-INDEPENDENT-REVISION` | 同上 | GraphRef/ConditionState/independent own rules固定、check_graph ruleは同identityの新revisionだけ更新 | old Valueを返さず`Stale` |
| `L8-K10-14-CHECK-RULE-INDEPENDENT-IDENTITY` | 同上 | それ以外を固定し、check_graph rule version updateでidentityだけ変える | old Valueを返さず`Unobserved(not_run)` |
| `L8-K10-14-CLOSURE-RULE-INDEPENDENT-REVISION` | 同上 | independent/graph inputs固定、closure ruleは同identityの新revisionだけ更新 | old Valueを返さず`Stale` |
| `L8-K10-14-CLOSURE-RULE-INDEPENDENT-IDENTITY` | 同上 | それ以外を固定し、closure rule version updateでidentityだけ変える | old Valueを返さず`Unobserved(not_run)` |
