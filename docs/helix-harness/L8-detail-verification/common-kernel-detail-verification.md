# HELIX-HARNESS 共通カーネル L8詳細検証設計（K1/K2/K3/K4/K5/K6/G3/K10）

status: draft
owner: HELIX-HARNESS
parent_requirement: なし（要素別にCommon Kernel L4 §2.1／§3.1／§9.2／§10.2／§13.1／§14.1／§16.1の直接crosswalkへtrace。HARNESS-L2-031を親にしない）
paired_l5: ../L5-detail-design/common-kernel.md
base: main `d5bb3455526c816b3af965db239c4b56207a884f`

本書はK1/K2/K3/K4/K5/K6/G3/K10のL5公開契約とL9 fixture oracleを詳細fixtureへtraceする設計草稿である。契約はCommon Kernel L4の意味を保ち、期待値はPair L9の既存項目を展開したものとする。K7〜K9は`not_designed`でL9の現行参照のみとする。以下のfixtureはすべて未実行であり、pass、実装完成、L10成立を示さない。

## 1. 固定入力とtrace

| 入力 | revision・scope | SHA-256 |
|---|---|---|
| Common Kernel L4 | main `d5bb3455526c816b3af965db239c4b56207a884f`の本文pin：`docs/helix-harness/L4-basic-design/common-kernel.md` §2/§3/§9/§10/§13/§14/§16 | `3f7245e8fb548bab199107b1a020f0efea08713a5299076988326dae9feeb696` |
| Repository Layout L4 | main `3961daac08d032ad512026e8365fafd9eae831c5`の本文pin：`docs/helix-harness/L4-basic-design/repository-layout.md` §2–3、RL-C/D/T/K、§6.1/§10 | `6968876dad1760257686108064520e1e98783b6034ca19bac7d6c7df1a3385f1` |
| Common Kernel L9 | main `d5bb3455526c816b3af965db239c4b56207a884f`の本文pin：`docs/helix-harness/L9-integration-verification/common-kernel-integration-verification.md` K1/K2、IV-K3全27識別子、IV-K4-01–10、IV-G3-01–05、IV-K5-01–26、IV-K6-01–15、IV-K10-01–14、IV-K7/IV-LDG関連行 | `77f81138f3e323d98c16c7ea6c3be38e66d2aa36fc5a6b79986b6826e3facf52` |
| paired L5 | 本PRのcontent HEADへ含める本文pin：`docs/helix-harness/L5-detail-design/common-kernel.md` §3/§4/§6/§7/§8/§9/§10 | SHA-256 `2f9adfadcbf3f25dad81ae4a9c46a3676057c0efc002fcc15b167b892089f0cd` |
| Paired L7 | `docs/helix-harness/L7-unit-test-design/common-kernel-unit-test-design.md`; content SHA-256 `0a232dbb019d703b39941f920cbb561538b92bc977fa0f197c8560198708a9f5` (本PRのcontent HEAD) | L7 suite IDs and function mapping |

L9の各`IV-K1-*`/`IV-K2-*`/`IV-K3-*`/`IV-K5-*`は上流fixture要件であり、この文書のcaseをその下位観測へ対応させる。直接のL3 parentはL4 crosswalkに限定する。K1 §2.1のdirect parentはHARNESS AC-HARNESS-L3-022-02/030-02/032-02/032-03、CONNECT CONNECT-AC-002-01/006-02、LABO LABO-001-AC-02、INFRA INFRA-001-AC-01、SECURITY SECURITY-AC-001-01、BRAIN BRAIN-008-AC-02。K2 §3.1のdirect parentはHARNESS AC-HARNESS-L3-010-01/010-03/022-05/030-04/031-05/032-04、CONNECT CONNECT-AC-002-01、LABO LABO-001-AC-02、BRAIN BRAIN-008-AC-02、OS AC-OS-014-02、INTELLIGENCE AC-INT-010-06。K1-I6からK2 §3.1のHARNESS 030-04/032-04への参照はkey境界のcontract linkとして別記し、K1のdirect parentへ加えない。case表のtrace欄はdirect parentと、必要な場合だけ明示したboundary linkを区別する。K10はL4 §14.1で列記された各機構ACへの要素別traceに限り、HARNESS-023-02等を単一親へまとめない。 K5 §9.2の直接由来はConcept、CONNECT-AC-005-01、INTELLIGENCE-078-06/078-04/INT-063-03、LABO-001-AC-02/002-AC-03/050-AC-02、HARNESS-024-05に限る。K3の直接L3 traceはL4 §16.1のSECURITY ACに限定し、OS-014-04/-06はK7との境界参照のまま扱う。K5を共通kernelとして配置すること自体から、単一親要求やHARNESS-L2-031を追加しない。

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

## 5. K3–K9と未実施範囲

K3とK5のfixtureはL4/L9が定める既存oracleを個別caseへ展開する。各caseは未実行であり、L5/L8の設計だけから実装passや物理writer enforcementを主張しない。K7〜K9はこのpairで`not_designed`で、既存L4/L9の該当契約へ戻す。K10はこの文書§9でL4 §14とL9 IV-K10-01–14の既存oracleを詳細fixtureへ展開する。K3の直接L3 traceはL4 §16.1のSECURITY ACに限り、OS-014-04/-06はK7境界参照のまま扱う。K5のwriter/assignment接続は既存K7/K5/Ledger oracleを再利用し、初回bootstrapを新設しない。

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

## 9. K10 fixture表

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
