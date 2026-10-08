# HELIX-HARNESS 共通カーネル L7単体試験設計（K1/K2）

status: draft
owner: HELIX-HARNESS
scope: K1/K2 only
paired_l5: ../L5-detail-design/common-kernel.md
paired_l6: ../L6-function-design/common-kernel.md
paired_l8: ../L8-detail-verification/common-kernel-detail-verification.md
base: `main` at `33bbe8cd5f080be9e400e9259db22645bc620eda`

本書はL6のK1/K2 公開APIと内部関数を単体fixtureへ対応づける設計である。現行L4/L9の意味、失敗分類、fixture期待を変更せず、L5/L8とのtraceを追加する。fixtureは未実装・未実行であり、合格を主張しない。K3–K10は`not_designed`でfixtureを追加しない。

## 1. 固定入力とtrace規則

| 入力 | 対象revision / SHA |
|---|---|
| Common Kernel L4 | `docs/helix-harness/L4-basic-design/common-kernel.md`; content SHA-256 `7ee3a2e4bb820538ceab0dbf2ff2e8e44bf7cb113012ec16aba7484e70b6388b` (main `33bbe8cd5f080be9e400e9259db22645bc620eda`) |
| Repository Layout L4 | `docs/helix-harness/L4-basic-design/repository-layout.md`; content SHA-256 `6968876dad1760257686108064520e1e98783b6034ca19bac7d6c7df1a3385f1` (main `33bbe8cd5f080be9e400e9259db22645bc620eda`) |
| L5詳細設計 | `docs/helix-harness/L5-detail-design/common-kernel.md`; content SHA-256 `6020c07fbe4fa0be0585a3c924ff238c63e17cc9279ec12f580c415e0293cc31` (本PRのcontent HEAD) |
| L6関数設計草稿 | `docs/helix-harness/L6-function-design/common-kernel.md`; content SHA-256 `877f08520ea75306a6ff198ccebc74ff579b10a8a1e25c88e1fb80ba9321a756` |
| L9統合oracle | `docs/helix-harness/L9-integration-verification/common-kernel-integration-verification.md`; content SHA-256 `62617cee9af0bdc1efe253275ae97dea9b2368cd8ee77a818735c5f180e0ba1b` (main `33bbe8cd5f080be9e400e9259db22645bc620eda`) |
| HARNESS Stage 1 PO判断 | 承認済みcontent revision `a77672513325aa9e79f3780af40455361b5d19a8`; 判断記録SHA `efda65558a62b0d1caddd98d424704e60c5f827f6e9bf3eaadd861fd0259741e` |

L4/L9はbase `33bbe8cd5f080be9e400e9259db22645bc620eda`の固定本文、L5/L6はこのpair内の上流content SHAを参照する。L9 IV-K1-01–13、IV-K2-01–21dが期待値の根拠である。L7 UTはpure kernel境界とcodec vectorを検査し、K5の物理append/order recoveryやK6のsource実読をstub成功で代用しない。K5の順序付きsequence/K6 readerはstub境界で接続し、L9 K6 fixtureの期待値は別途固定する。K1 polarity mapping不在はL4/L5で定めるcaller準備境界をfixture化し、Observed classを増やさない。

各fixture表の関数ID列で、K1表の`FN-xx`は`CK-K1-FN-xx`、K2表およびcodec表の`FN-xx`は`CK-K2-FN-xx`を指す。明示した`K2 FN-xx`も`CK-K2-FN-xx`である。UT IDの波括弧・suffixは各行の展開規則で個別fixtureへ展開し、複数変異を一件へまとめない。

## 2. Fixture構成規約

- 各fixtureは新しいimmutable inputを作り、一回に変える意味要素を一つにする。入力順序が契約に属する場合、その順序自体を変異対象としない。
- 結果はclass、reason、key/evidence/position field、全component保持まで構造比較する。表示色、boolean shortcut、単一failureだけの比較で代用しない。
- K2 candidate fixtureでは、`records`がK5 restoreから完全復元され、append orderで渡されたsequenceというpreconditionをfixture builderに明示する。UTはK5 restoreを実装・検証したと主張しない。
- `canonical_json_bytes`のUTF-8 canonical bytes golden vectorと`sha256:` digest golden vectorは別々に照合する。source-content digest vectorはraw bytesを直接渡し、JSON decode/re-encodeしない。
- Codec入力がL4 canonical JSON domain外の場合、serializerがbytesを出さないことを検査する。内部例外のhost typeはL4 public result classではなく、`missing_key`、Unknown、Unobserved、Valueへ写さない。
- fixture runner候補はPython 3.11+標準ライブラリの`unittest`とする。K1/K2が同じPython標準ライブラリのpure semantic core候補に沿い、各caseを外部test packageなしで個別に記述・実行できるためである。これは試験器の技術選択であり、新しい要件、gate、L9合格主張ではない。

## 3. K1 fixture表

| UT ID | L6関数ID | L9 oracle | 基準fixture → 1変更fixture | 単一期待 |
|---|---|---|---|---|
| `CK-K1-UT-001` | FN-02/03/04 | IV-K1-01 | CONNECT compatibleとHARNESS passを各owner polarityに従って合成 | `Combined(Positive)`、`Admitted`。 |
| `CK-K1-UT-002a/b/c` | FN-02/03/04 | IV-K1-01 | 001基底からCONNECT成分だけUnknown(incomparable)、Stale、Unobserved(not_selected)へ一つずつ変更 | 各々`Undetermined`、`Withheld`。reasonはその成分の位置/classを保持する。各suffixは別fixture IDとする。 |
| `CK-K1-UT-003` | FN-03/04 | IV-K1-02 | `[Value(fail)]`基底へUnknown(unreadable)を一成分追加 | Negativeのまま、2成分を入力順保持、negative/non-valueの両方のindexを記録しWithheld理由2件。 |
| `CK-K1-UT-004` | FN-03/04 | IV-K1-03 | Value(pass)へUnknown(conflict)、Unobserved(pending_receipt)、Staleを加える | Undetermined、3つの非Value位置をすべて保持し、Withheld理由を3件記録する。 |
| `CK-K1-UT-005a/b` | FN-03/04 | IV-K1-04 | all-pass基底から1成分だけfailへ変更する。all-passのpositive baselineは別fixtureにする | fail側はNegative/Withheldでreasonが空でなく、baselineはPositive/Admitted。 |
| `CK-K1-UT-006` | FN-02/03 | IV-K1-05 | polarityありのValue成分を、mappingだけ不在の同値型入力へ変更 | callerはValueを渡さず、完全key付きUnknown(missing_input)を作り、combine結果でnon-valueとして保持する。 |
| `CK-K1-UT-007a/b/c` | FN-03/04 | IV-K1-06 | 有効成分0件 / 成立N/A 1件のみ / 成立N/A 3件のみ（個別fixture） | 各々Undeterminedとし、set_reasonはUnknown(missing_input)、whole reasonは1件。 |
| `CK-K1-UT-008a/b/c` | FN-05/03 | IV-K1-07 | 有効なdispositionからreason/authority/reentry_triggerを一つずつ個別に除去する | 各々Unknown(invalid_disposition)となり、non-valueとして扱う。 |
| `CK-K1-UT-009-ACCEPT-COMBINE-{CLASS}` | FN-02/03 | IV-K1-08 | `{CLASS}`=Value/Unknown/Unobserved/NotApplicable/Stale。完全key付き成分を各class一つずつ`combine`へ渡す | 5個別fixtureで各成分classを受理し、結果のcomponentに保持する。 |
| `CK-K1-UT-009-ACCEPT-RECORD-{CLASS}` | K2 FN-08 | IV-K1-08 | `{CLASS}`=Value/Unknown/Unobserved/NotApplicable。完全key付きrecord keyと各非Stale result classを`record`へ渡す | 4個別fixtureで各record classを受理する。Stale resultは`CK-K1-UT-009-STALE-RECORD`で別に扱う。 |
| `CK-K1-UT-009-LOOKUP-{CLASS}` | K2 FN-05 | IV-K1-08 | `{CLASS}`=Value/Unknown/Unobserved/NotApplicable。完全一致する保存record classからlookup queryを作る | 4個別fixtureで各record classをそのまま返す。`lookup`はObserved入力を受けない。 |
| `CK-K1-UT-009-STALE-LOOKUP` | K2 FN-05 | IV-K1-08 / IV-K2-02 | 完全keyの旧revision Value recordだけを置き、current queryでlookupする | lookupの返却値として`Stale`を導出する。`Stale`をlookup入力に渡さない。 |
| `CK-K1-UT-009-STALE-RECORD` | K2 FN-08 | IV-K1-08 / IV-K2-11 | 完全keyとStale resultを持つ基準からkey全体だけを欠落させる優先順位fixture | key欠落の有無にかかわらず、Stale判定を優先して`Rejected(stale_not_recordable)`。 |
| `CK-K1-UT-009-KEY-COMBINE-{CLASS}` | FN-01/03 | IV-K1-08 | `{CLASS}`=Value/Unknown/Unobserved/NotApplicable/Stale。各成分からkey全体だけ欠落させる | 5個別fixtureすべて`Rejected(missing_key)`。 |
| `CK-K1-UT-009-KEY-RECORD` | K2 FN-08 | IV-K1-08 | 非StaleのValue resultを保ち、record keyだけ欠落させる | `Rejected(missing_key)`。 |
| `CK-K1-UT-009-KEY-LOOKUP` | K2 FN-05 | IV-K1-08 | 完全なrecord集合を保ち、lookup query_keyだけ欠落させる | `Rejected(missing_key)`。lookupはObserved入力を受けない。 |
| `CK-K1-UT-010-COMPLETE` | FN-02/03 | IV-K1-09 | complete scan marker付き0件 | `Value(0件)`。 |
| `CK-K1-UT-010-PARTIAL` | FN-02/03 | IV-K1-09 | 完全走査基準から走査範囲だけpartialに変更 | `Value(0件)`にならない。 |
| `CK-K1-UT-010-READ-FAIL` | FN-02/03 | IV-K1-09 | 完全走査基準から読取結果だけ失敗に変更 | `Value(0件)`にならない。 |
| `CK-K1-UT-011` | FN-03/04 | IV-K1-10 | display-only projectionで非Valueを省略する経路をdecision inputへ接続する | projection outputからcombineへの経路は拒否される。 |
| `CK-K1-UT-012-MAP-{WORD}` | FN-02/03 | IV-K1-11 | `{WORD}`はL4 mapping tableの各語へ展開し、fixtureごとに一語だけ入力 | 各語をL4表の指定classへ対応づける。 |
| `CK-K1-UT-012-WRONG-MISMATCH` | FN-02/03 | IV-K1-11 | mismatch一語だけをUnknownへ誤写像 | 期待する否定Valueと異なるため不合格。 |
| `CK-K1-UT-012-WRONG-INCOMPATIBLE` | FN-02/03 | IV-K1-11 | incompatible一語だけをUnknownへ誤写像 | 期待する否定Valueと異なるため不合格。 |
| `CK-K1-UT-012-WRONG-NOT-OBSERVED` | FN-02/03 | IV-K1-11 | not_observed一語だけをValueへ誤写像 | 期待するUnobservedと異なるため不合格。 |
| `CK-K1-UT-012-UNREGISTERED` | FN-02/03 | IV-K1-11 | L4表にない語一つを入力 | `Unknown(unsupported)`。 |
| `CK-K1-UT-013-{FIELD}-{BOUNDARY}` | FN-01/03 / K2 FN-05/08 | IV-K1-12 | `{FIELD}`はResultKeyの5field、subject SubjectRefの4field、input SubjectRefの4fieldへ、`{BOUNDARY}`はcombine-component/record-key/lookup-queryへ展開し、field一つだけ除去 | 39個別fixtureすべて`Rejected(missing_key)`。 |
| `CK-K1-UT-014-KEY-WHOLE` | FN-01/04 | IV-K1-13 | `combine`を経ず作ったPositive Combinedからcomponent key全体だけ欠落 | `admit`が`Rejected(missing_key)`を返し、Admitted/通常Withheldにしない。 |
| `CK-K1-UT-014-KEY-{FIELD}` | FN-01/04 | IV-K1-13 | `{FIELD}`はIV-K1-12の13fieldへ展開し、各fixtureでcomponent keyのfield一つだけ欠落 | 13個別fixtureすべて`admit`で`Rejected(missing_key)`となり、Admitted/通常Withheldにしない。 |

波括弧表記はfixture IDの展開規則である。`CLASS`と`FIELD`は表に列挙したliteral tokenへ展開し、該当する各個別fixture IDを生成する。`WORD`はL4 mapping tableの各語へ展開する。`CK-K1-UT-009-ACCEPT-COMBINE-{CLASS}`は5 class、`CK-K1-UT-009-ACCEPT-RECORD-{CLASS}`と`CK-K1-UT-009-LOOKUP-{CLASS}`はStaleを除く4 class、`CK-K1-UT-009-KEY-COMBINE-{CLASS}`は5 classへそれぞれ展開する。record key欠落とlookup query_key欠落は各1件であり、classとの直積にしない。lookupのStaleは旧Value recordから導出し、Stale resultのrecord拒否はkey全体を欠いた優先順位fixtureとする。`BOUNDARY`はcombine-component/record-key/lookup-queryの3語へ展開する。採番済みL9 IV IDは変更しない。各caseは一つの期待分類だけを持つ。

## 4. K2 fixture表

| UT ID | L6関数ID | L9 oracle | 基準fixture → 1変更fixture | 単一期待 |
|---|---|---|---|---|
| `CK-K2-UT-001` | FN-03/05/06/07 | IV-K2-01 | 4 class（Value/Unknown/Unobserved/NotApplicable）についてrecord keyとquery keyを完全一致させる | 各classをそのまま返す。4個別fixtureとする。 |
| `CK-K2-UT-002a–d` | FN-05/07 | IV-K2-02 | subject/oracle/contract/configのいずれか一つについてrevisionとdigestをともに新値へ更新する | old Value candidateはStaleとなる。各入力位置を別fixtureにする。 |
| `CK-K2-UT-003a–c` | FN-05/07 | IV-K2-03 | old result classをUnknown/Unobserved/NotApplicableのいずれか一つにし、subject revisionだけ更新する | Unobserved(not_run, superseded=old key_digest)。 |
| `CK-K2-UT-004a–d` | FN-05/06 | IV-K2-04 | subject/oracle/contract/configの一つでrevision固定、digestだけ変更 | Unknown(conflict)。 |
| `CK-K2-UT-005` | FN-05/06 | IV-K2-05 | IV-K2-04のdigest conflictに、別入力のrevision updateを一つ追加するmulti-field oracle case | Unknown(conflict)でconflict stepがstale stepより優先。L9は複合集約順を明示するため例外的に二種類の差分を含む。 |
| `CK-K2-UT-006` | FN-05/07 | IV-K2-06 | revisionだけ変更、digest同一 | Old ValueはStaleとなる。 |
| `CK-K2-UT-007` | FN-05/07 | IV-K2-07 | text bodyの空白だけを変え、新しいrevision/digestにする | Stale。semantic backdatingを行わない。 |
| `CK-K2-UT-008a–c` | FN-03/05 | IV-K2-08 | operation / operation_version / scopeのいずれか一つだけ変更する | 候補0件でUnobserved(not_run)。 |
| `CK-K2-UT-009a/b` | FN-03/05 | IV-K2-09 | input identityを一つ追加 / 一つ除去する | 各々candidateから外れ、Unobserved(not_run)となる。 |
| `CK-K2-UT-010` | FN-05/07 | IV-K2-10 | lookup前後でimmutable record bytesを比較し、query revisionだけ更新する | record bytesは同一のままで、lookupだけStaleとなる。 |
| `CK-K2-UT-011a/b` | FN-08/06 | IV-K2-11 | same key+same result digestのrecordを再度与える / same key+different result digestを与える | NoOp / Conflictとなる。後者は両方を保持し、lookupはUnknown(conflict)となる。 |
| `CK-K2-UT-011c` | FN-08 | IV-K2-11 | record resultをStaleへ一箇所変更 | Rejected(stale_not_recordable)。 |
| `CK-K2-UT-012` | FN-05/07 | IV-K2-12 | query revisionをR2にし、唯一のcandidateをR1にする | R2 queryに対してR1 Valueをcurrent Valueとして返さない。IV-K2-02/03の結果に従う。 |
| `CK-K2-UT-013-NO-PREFIX` | FN-03 | IV-K2-13 | 有効なsubject.digestから`sha256:` prefixだけを除き、他fieldは固定する | `Rejected(invalid_digest)`。 |
| `CK-K2-UT-013-SHORT` | FN-03 | IV-K2-13a | 有効なsubject.digestのhex部分だけを64桁から63桁へ短縮し、他fieldは固定する | `Rejected(invalid_digest)`。 |
| `CK-K2-UT-013-GIT-REVISION` | FN-03 | IV-K2-13b | subject.digestだけを40桁GitRevision値へ置き換え、他fieldは固定する | `Rejected(invalid_digest)`。 |
| `CK-K2-UT-013-PRECEDENCE-MISSING` | FN-03 | L4 §3.4 priority; IV-K2-13/13a/13b | 必須key field欠落の基準fixtureからsubject.digestだけを不正形式へ変更する | 1 field mutationでも`Rejected(missing_key)`を維持する。`KeyOfResult`検査順でDigest拒否より必須欠落を優先する。 |
| `CK-K2-UT-013-PRECEDENCE-DIGEST` | FN-03 | L4 §3.4 priority; IV-K2-13/13a/13b/15 | 全必須fieldがあり、Digest有効な重複identity基準fixtureから、重複input一件のdigestだけを不正形式へ変更する | 1 field mutationで`Rejected(invalid_digest)`を返す。Digest拒否をduplicate identityより優先する。 |
| `CK-K2-UT-014` | FN-03/05 | IV-K2-14 | pack versionだけを昇格し、他層版は固定する | release unit/product/stage refsは昇格しない。 |
| `CK-K2-UT-015-ORDER` | FN-03/FN-01 | IV-K2-15 | same input setの順序だけを変更 | KeyDigestは同じ。 |
| `CK-K2-UT-015-DUP` | FN-03 | IV-K2-15 | 全Digest形式が有効なinputへ同一identityを一件だけ追加し、他fieldは固定する | `Rejected(duplicate_identity)`。 |
| `CK-K2-UT-016a/b` | FN-05/06 | IV-K2-16 | subject kindだけ変更 / input kindだけ変更（個別case） | 各々Unknown(conflict)となる。 |
| `CK-K2-UT-017a/b` | FN-05 | IV-K2-17 | subject identityだけ変更 / input identityを件数維持で置換（個別case） | 各々Unobserved(not_run)となる。 |
| `CK-K2-UT-018-OLD-VALUE` | FN-05/07 | IV-K2-18 | old R1 Value + exact R2 Value | R2 exact Valueを返す。append orderだけを優先しない。 |
| `CK-K2-UT-018-OLD-UNKNOWN` | FN-05/07 | IV-K2-18 | old R1 Unknown + exact R2 Value | R2 exact Valueを返す。append orderだけを優先しない。 |
| `CK-K2-UT-019` | FN-05/06 | IV-K2-19 | exact Valueへsame revision/different digest candidateを一件追加する | Unknown(conflict)。 |
| `CK-K2-UT-020a/b/c` | FN-05/07 | IV-K2-20 | old R0 Value + old R1 Valueをsequence順[R0,R1]/[R1,R0]にする2 case; 別caseではold R0 Value + old R1 Unknownを[R0,R1]にする | a/bはそれぞれsequence上最後のpriorによるStale、cはR1を指すsuperseded Unobserved。各caseでrecord orderはK5 restore precondition。 |
| `CK-K2-UT-021` | FN-01/02/04/09 | IV-K2-21 | owner/context/roleを持つ代表aliasでraw source digestとbinding bytesを照合する | alias digestはsource-content digestとする。full raw ref/role mappingは独立したbinding bytesへ固定し、K2 inputsにbinding+aliasを含める。source実読のpassはこのpure UTでは主張しない。 |
| `CK-K2-UT-021a` | FN-03/04 | IV-K2-21a | required RoleBoundInputBindingRefだけを除去する | Rejected(missing_key)。 |
| `CK-K2-UT-021b` | FN-04 | IV-K2-21b | same alias identityにraw revisionだけが異なるrefを1件追加し、kind/digestは基準値のままにする | Rejected(missing_key)。 |
| `CK-K2-UT-021c` | FN-09 / K6 stub | IV-K2-21c | resolver/bindingの固定値は保持し、alias raw bytes digestだけ不一致にする | K6 stub boundaryはUnknown(conflict)を返す。binding-only readをsource read扱いしない。これはproduction readの証拠ではない。 |
| `CK-K2-UT-021d` | FN-02/04/05/07 | IV-K2-21d | binding ownerがL4既存方式でrevisionを管理するaliasについて、raw revisionを一つ更新し、binding refとsource digestを対応させる | current key更新後のlookupはIV-K2-21d指定条件でStaleとなる。K2はowner-specific revision algorithmを再定義しない。 |

suffix展開はfixture identityの命名規則であり、L9 IDを再採番しない。各suffixを個別`unittest` caseとして作る候補であり、一つのfixtureが表中の複数変異を重ねない。precedence fixtureは基準状態を保った単一field mutationでL4 §3.4の検査順を確かめる。IV-K2-05はL9自身が二入力変化の優先順を期待する複合ケースであるため、契約を保つ明示的な例外とする。IV-K2-18–20も複数record集合を前提とするoracleであり、各record固有の変異を別caseで管理する。

## 5. Canonical codecのgolden vector

これらはL6 codec候補のbyte contractを固定する候補であり、Node/RFC8785互換性試験ではない。各行は独立したvector/testである。UTF-8 output bytesとsha256 digestを記録し、non-finite等の拒否vectorにはdigestを作らない。

| UT ID | L6関数ID | 入力vector / 1変更 | 期待値 |
|---|---|---|---|
| `CK-K2-UT-030` | FN-01/02 | `{"z":[2,1],"a":true}`（objectの挿入順は逆） | UTF-8 canonical bytes `{"a":true,"z":[2,1]}`（hex `7b2261223a747275652c227a223a5b322c315d7d`）、digest `sha256:8e87dbb341568585e9b4a19cde5bb906feb933c76013ab18e2025932db6a3105`。 |
| `CK-K2-UT-031` | FN-01 | UT-030のarray要素を`[1,2]`へ一箇所だけswap | UTF-8 canonical bytes `{"a":true,"z":[1,2]}`（hex `7b2261223a747275652c227a223a5b312c325d7d`)、digest `sha256:4c1ce63323c4813ce58cbc0b652e6782131793514687e3b93c1fc8e8f44675fc`。 |
| `CK-K2-UT-032` | FN-01 | finite float `1.0` | bytes `1.0`（hex `312e30`)、digest `sha256:d0ff5974b6aa52cf562bea5921840c032a860a91a3512f7fe8f768f6bbe005f6`。 |
| `CK-K2-UT-033` | FN-01 | finite float `-0.0` | bytes `-0.0`（hex `2d302e30`)、digest `sha256:c26617c7ccbcaa6631b45d851b8cf56e21d2ca624bdb1193afdbd4b560702cec`。候補固有の表記を固定し、JS/RFC互換は主張しない。 |
| `CK-K2-UT-034a/b` | FN-01 | `9007199254740993` / `1e+20` | bytesは順に `9007199254740993` (digest `sha256:a1c367c29158357e62a3ff5d3e800fb7698a22396439dbc0a9d4929322afd35d`) / `1e+20` (digest `sha256:7c18c9fbdcc8281573e9db9e04f04c3790b10696f3706f0f03fa87427d33e28b`). |
| `CK-K2-UT-035a/b` | FN-01 | 合成形`"é"` / 分解形`"é"`のJSON文字列scalar sequenceを個別fixtureにする | UTF-8 bytes `22c3a922` / `2265cc8122`、digest `sha256:f2886017e9c7abacf804b54d64787dce2b611c9544ba21f3affdd126a6e50086` / `sha256:3d68ce21f2899a475713cdbe7562ba9bdb6b1dfde8af1f221bdff4a0935b53b2`。Unicode normalizationなし。 |
| `CK-K2-UT-036` | FN-01 | non-string object keyを一つ持つmapping | canonical bytesを返さず、codec input failureとする。key missing/Unknown/positiveにしない。 |
| `CK-K2-UT-037` | FN-01 | nested NaN一つ | `allow_nan=False`でbytesを出さない。 |
| `CK-K2-UT-038` | FN-01 | cyclic container一つ | circular reference failureとし、digestは作らない。 |
| `CK-K2-UT-039` | FN-01 | lone surrogate一つ | strict UTF-8 encode failureとし、digestは作らない。 |
| `CK-K2-UT-040` | FN-02 | source bytes `b"x"`から`b"y"`へ1 byte mutation | raw-source digestは`sha256:2d711642b726b04401627ca9fbac32f5c8530fb1903cc4db02258717921a4881`から`sha256:a1fce4363854ff888cff4b8e7875d600c2682390412a8cf79b37d0b11148b0fa`へ変わる。JSON parsing、normalization、framing LFは行わない。 |
| `CK-K2-UT-041` | FN-01/02 | canonical JSON bytes digestと、同bytesにtrailing LFを追加したstorage-framed bytes digest | key/value canonical digestにはLFを含めない。K5 framing byteは別のdigest境界に属するため、両者を混同しない。 |

UT-030–041の各vectorのliteral/expected bytesとdigestはL7 fixture inventoryに固定する。実行時にruntime outputをgoldenとして採取してはならない。golden値はsource-controlled expected literalとしてreview対象にする。L4にない数値formatの性質をcross-runtime保証へ拡張しない。

UT-036〜039はprivate `canonical_json_bytes`補助関数へ範囲外値を直接与える単体検査である。公開`record`の失敗caseではない。record fixtureはL5 §3.4/L6 §3.1の前提どおり、ownerの宣言encodingに適合したcanonical JSON表現可能なResultBodyを使い、未解決encodingや非JSON生値を公開APIへ渡さない。K1の一般値型Tと、記録時のInline/FixedRef表現を同一視しない。

## 6. Unit suiteの配置と14関数の対応

正式配置候補は`helix/helix-harness/units/common-kernel/tests/`である。L7本文は`docs/`を唯一の検証設計正本とし、各test methodは以下の既存UT IDを識別子として参照する。`test_k1.py`/`test_k2.py`、`unittest`、合成fixture保存場所`fixtures/`は実装時の候補であり、suiteが存在することや実行済みであることを意味しない。suffix展開、各UTの変異と期待は§3–5の行が正本である。

| L6 function ID | L7 suite ID（§3–5の全行。suffixは各行の展開規則どおり） |
|---|---|
| `CK-K1-FN-01` | `CK-K1-UT-009-KEY-COMBINE-{CLASS}`, `CK-K1-UT-013-{FIELD}-{BOUNDARY}`, `CK-K1-UT-014-KEY-WHOLE`, `CK-K1-UT-014-KEY-{FIELD}` |
| `CK-K1-FN-02` | `CK-K1-UT-001`, `002a/b/c`, `006`, `009-ACCEPT-COMBINE-{CLASS}`, `010-*`, `012-*` |
| `CK-K1-FN-03` | `CK-K1-UT-001`, `002a/b/c`, `003`, `004`, `005a/b`, `006`, `007a/b/c`, `008a/b/c`, `009-ACCEPT-COMBINE-{CLASS}`, `009-KEY-COMBINE-{CLASS}`, `010-*`, `011`, `012-*`, `013-*` |
| `CK-K1-FN-04` | `CK-K1-UT-001`–`005a/b`, `007a/b/c`, `011`, `014-*` |
| `CK-K1-FN-05` | `CK-K1-UT-008-*` |
| `CK-K2-FN-01` | `CK-K2-UT-015-ORDER`, `CK-K2-UT-030`–`039`, `CK-K2-UT-041` |
| `CK-K2-FN-02` | `CK-K2-UT-021`, `CK-K2-UT-030`, `CK-K2-UT-040`–`041` |
| `CK-K2-FN-03` | `CK-K2-UT-008-*`, `013-*`, `014`, `015-*`, `021a` |
| `CK-K2-FN-04` | `CK-K2-UT-021`, `021a/b/d` |
| `CK-K2-FN-05` | `CK-K1-UT-009-LOOKUP-*`, `009-STALE-LOOKUP`, `009-KEY-LOOKUP`; `CK-K2-UT-001`–`010`, `012`, `014`, `016`–`020`, `021d` |
| `CK-K2-FN-06` | `CK-K2-UT-001`, `004`–`005`, `011a/b`, `016`, `019` |
| `CK-K2-FN-07` | `CK-K2-UT-001`–`007`, `010`, `012`, `018`, `020`, `021d` |
| `CK-K2-FN-08` | `CK-K1-UT-009-ACCEPT-RECORD-*`, `009-STALE-RECORD`, `009-KEY-RECORD`; `CK-K2-UT-011a/b/c` |
| `CK-K2-FN-09` | `CK-K2-UT-021`, `021c` (K6 stub boundary only) |

全テスト候補は§3–5のID行から導き、展開suffixを実fixture identityにする。L7のK1 rows 001–014、K2 rows 001–021dおよびcodec vectors 030–041は既存の意味と期待を保持する。pack外の`src/`実装、別test runner、repository root設定、K3–K10 suiteをこの表から追加しない。

## 7. 旧source traceと技術差分の記録

旧sourceのpathは`archive/legacy-generation-2026-09-14/root/`からの相対pathである。sourceは読み取ったが実行していない。

| 旧source / asset / SHA | 再利用または再導出 | 差分 / 理由 |
|---|---|---|
| `LEGACY-ASSET-5E2592D7BB50EC290C9B`; `docs/design/helix/L4-basic-design/measurement-evidence-evaluator.md:22-30,48-70`, SHA `d446588a1fe6999e458a41f2c4683d34459ff7b12b28a057642cc2f6e15e6898`; `src/requirements/measurement-evidence-evaluator.ts:18-105,109-158,163-184,407-435,437-555`, SHA `9289fd16738f152b7c40d562e67aa57cfa8369cda7aecbe3743249d9c87e2f8a`; tests `tests/measurement-evidence-evaluator.test.ts:157-185,258-279,323-355,404-448,507-517`, SHA `cfe1051a4a8b1a0634744837d704ab558f8a8295ffedf0df9d54f94923ce1f92` | 型付きobservation、finding全件保持、不明状態を非肯定とすること、決定的なpure evaluatorを現行K1契約へ再導出する。 | 計測専用のaxis/verdict/schemaを汎用L4 `Observed`/`Combined`/`Withheld`へ置き換える。旧shape validationで`missing_key`の意味を変えない。 |
| `LEGACY-ASSET-9A2C16ECB41E0E007EFF`; `docs/design/harness/L6-function-design/digest-canonicalization-authority.md:12-30`, SHA `ac0dd11655279e0653726d4eeb06a90663c65663f36fc33a78be237f93f36b89`; `src/shared/canonical-digest.ts:1-46`, SHA `c8f4c6eff75cf5bde2bd467ac647c1953168cbaa5ac5b913e8298fdaddd17000`; `tests/digest.test.ts:10-28,128-170`, SHA `fef9cfe82f280fb79ff35b4516ee0e847965b57d479014bca32ff7ac8043a390` | prefix付きDigest型、canonical bytes、範囲外値/nonfinite/cycleの拒否、golden bytesを比較する旧testの形を保持する。 | 旧Node bytesとfixture runnerは移植しない。`invalid_digest`/`duplicate_identity`および検査順は旧sourceにあるものとして扱わず、現L4 §3.4とL5 `KeyOfResult`の技術契約を個別caseで照合する。 |
| `LEGACY-ASSET-02319C2481B9E01698D5`; `docs/governance/helix-harness-requirements_v1.3.md:361`, SHA `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406` | 同一key・同一digestのidempotencyと異なるdigestのconflict保持をK2-I4 fixtureへ再導出する。 | 旧command receiptの範囲はResultKey candidate選択、stale方針、aliasを定義しない。 |
| K2 adjacent old sources already recorded in L4 §3.5: `LEGACY-ASSET-130EFBE7012012FF9281`, `LEGACY-ASSET-28B47108797C610AE0BC`, `LEGACY-ASSET-210D6B145CA997AE3CFA` | revision/head bindingの失敗例をstale/ref照合のnegative vectorへ反映する。 | pair-gate/engine/CIのschemaは移植せず、現行L4 ResultKeyとIV IDに従う。 |

旧JS helperとのcodec差は意図した技術的再導出である。L4はcanonical dataの基本意味を固定し、HARNESS Stage 1ではPython semantic coreが実装候補となっているため、serializer optionとgolden vectorで具体化する。旧golden resultはencoded bytesが異なり得るため、暗黙に再利用しない。parameterごとの個別判断は人に求めない。byte behaviorが現行L4の意味を変える場合は、実装へ採用する前に上流へ返す。

## 8. 静的coverageと対象外

- `CK-K1-UT-*`はL4 K1-I1–I8およびIV-K1-01–13を`CK-K1-FN-*`とL5公開signatureへ対応づける。
- `CK-K2-UT-001–021d`はK2 lookup/record/aliasのoracle IDへ対応づける。`key_of` rejection casesはL5 `KeyOfResult`とL4 §3.4の検査順に対応し、IV-K2-13/13a/13bは各invalid_digest条件、IV-K2-15はduplicate_identity条件を検証する。追加のpriority unit fixturesはL4既存順序を単一field mutationで確かめ、L9に新しいoracle IDを追加しない。`UT-030–041`はIV identityや期待契約の意味を変更せず、canonical bytesの技術vectorを追加する。
- K1のmissing keyは`Rejected(missing_key)`のままとする。variant shapeは型付き入力のpreconditionであり、新しいshape reasonやgateを設計しない。
- K5 recordの順序はsequenceのpreconditionであり、物理writer実装は設計しない。K6 source readはstub境界のままとし、production verifier/readは設計しない。
- fixtureは未実装・未実行である。L9の実合格、K5 append保証、K6 raw source観測、runtime/toolchain間の相互運用性を主張しない。
- K3–K10は`not_designed`のままであり、現行L4/L9の節はL6 §6を通じて参照する。
- L7 fixtureは設計草稿であり未実装・未実行である。`invalid_digest`/`duplicate_identity`はK2 `KeyOfResult`だけの境界結果で、K1 `ApiBoundaryResult`や`UnknownReason`への追加ではない。
