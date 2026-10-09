# HELIX-HARNESS 共通カーネル L7単体試験設計（K1/K2/K3/K5）

status: draft
owner: HELIX-HARNESS
scope: K1/K2/K3/K5
paired_l5: ../L5-detail-design/common-kernel.md
paired_l6: ../L6-function-design/common-kernel.md
paired_l8: ../L8-detail-verification/common-kernel-detail-verification.md
base: `main` at `3961daac08d032ad512026e8365fafd9eae831c5` (current integration base; prior K5 candidate base `7715e7025212ea1a778ab9711e2f43241f7999c7` and intermediate base `f75199749888f7261772ba26e9feb58a33d9a04f` retained as history)

本書はL6のK1/K2/K3/K5公開APIと内部関数を単体fixtureへ対応づけ、現行L4/L9の意味、失敗分類、fixture期待を変更せずL5/L8とのtraceを追加する。K3は194 formal fixtureと26件の別ID回帰method、K5は91 formal IDと24件の補助IDを§9.2および§5/§8へ記録する。K5-22/23のowner未接続fixture 7件は、local private-boundary assertionだけを実行し、L8 coverageには含めない。これらのローカルunit結果はL9合格、owner source接続、製品動作を示さない。K4/K6–K10は`not_designed`でfixtureを追加しない。

## 1. 固定入力とtrace規則

| 入力 | 対象revision / SHA |
|---|---|
| Common Kernel L4 | `docs/helix-harness/L4-basic-design/common-kernel.md`; content SHA-256 `3f7245e8fb548bab199107b1a020f0efea08713a5299076988326dae9feeb696` (main `3961daac08d032ad512026e8365fafd9eae831c5`) |
| Repository Layout L4 | `docs/helix-harness/L4-basic-design/repository-layout.md`; content SHA-256 `6968876dad1760257686108064520e1e98783b6034ca19bac7d6c7df1a3385f1` (unchanged at main `3961daac08d032ad512026e8365fafd9eae831c5`; earlier pin `33bbe8cd5f080be9e400e9259db22645bc620eda`) |
| L5詳細設計 | `docs/helix-harness/L5-detail-design/common-kernel.md`; current main source at `3961daac08d032ad512026e8365fafd9eae831c5`, content SHA-256 `81193f9be03af312da7e87915691b06f7d3e1777843708abab6efb040df1d6c9`; historical PR #2751 source retained: commit `8d671541472f27a2d4d7b47992b6f428c0835eed`, content SHA-256 `ff24f1c74d17e3e5ed4aaedfc8163018891df6785de59e2de4fac3c33edf8ef4` (merge `dc803dacfbbe56f6daf7724832b1bfa238ff2087`) |
| L6関数設計草稿 | `docs/helix-harness/L6-function-design/common-kernel.md`; content SHA-256 `0576ed97e1d5bd63b9a89bad4377415f740b323fdfcd1d09e8634bdb488b561d`（L7→L6一方向。L6にL7 SHAは置かない） |
| L8詳細検証 | `docs/helix-harness/L8-detail-verification/common-kernel-detail-verification.md`; current main source at `3961daac08d032ad512026e8365fafd9eae831c5`, content SHA-256 `fefaa022cf64fae78552719a29def9155a3bbb93a8f3acb338cedc66d4c7c383`; historical PR #2751 source retained: commit `8d671541472f27a2d4d7b47992b6f428c0835eed`, content SHA-256 `3927337491a79f600d02a1b153628f556d267c954b79f4be90cc7c0743dec9ee` (merge `dc803dacfbbe56f6daf7724832b1bfa238ff2087`) |
| L9統合oracle | `docs/helix-harness/L9-integration-verification/common-kernel-integration-verification.md`; content SHA-256 `77f81138f3e323d98c16c7ea6c3be38e66d2aa36fc5a6b79986b6826e3facf52` (main `3961daac08d032ad512026e8365fafd9eae831c5`) |
| HARNESS Stage 1 PO判断 | 承認済みcontent revision `a77672513325aa9e79f3780af40455361b5d19a8`; 判断記録SHA `efda65558a62b0d1caddd98d424704e60c5f827f6e9bf3eaadd861fd0259741e` |

L4/L5/L8/L9のcurrent sourceは§1記載のmain `3961daac08d032ad512026e8365fafd9eae831c5`に固定したcontent SHAを参照する。L6はこのpair内の上流content SHAを参照する。K3/K5 fixtureの歴史的PR #2751 source pinは後続本文のcurrent pinと区別して保持する。mergeから上流の承認を生成しない。L9 IV-K1-01–13、IV-K2-01–21dが期待値の根拠である。L7 UTはpure kernel境界とcodec vectorを検査し、K5の物理append/order recoveryやK6のsource実読をstub成功で代用しない。K5の順序付きsequence/K6 readerはstub境界で接続し、L9 K6 fixtureの期待値は別途固定する。K1 polarity mapping不在はL4/L5で定めるcaller準備境界をfixture化し、Observed classを増やさない。

各fixture表の関数ID列で、K1表の`FN-xx`は`CK-K1-FN-xx`、K2表およびcodec表の`FN-xx`は`CK-K2-FN-xx`を指す。明示した`K2 FN-xx`も`CK-K2-FN-xx`である。UT IDの波括弧・suffixは各行の展開規則で個別fixtureへ展開し、複数変異を一件へまとめない。

K3/K5 fixtureのL8参照はPR #2751の固定commit/blobに対する歴史的source pinである。現在のL8本文のPaired L7 pinを参照する逆向きのcurrent SHAとして扱わない。K3/K5 §5.1/§5.2のfixture本文は現mainでも同一である。ここではL8を編集せず、L7→L6の一方向pinだけを固定する。

## 2. Fixture構成規約

- 各fixtureは新しいimmutable inputを作り、一回に変える意味要素を一つにする。入力順序が契約に属する場合、その順序自体を変異対象としない。
- 結果はclass、reason、key/evidence/position field、全component保持まで構造比較する。表示色、boolean shortcut、単一failureだけの比較で代用しない。
- K2 candidate fixtureでは、`records`がK5 restoreから完全復元され、append orderで渡されたsequenceというpreconditionをfixture builderに明示する。UTはK5 restoreを実装・検証したと主張しない。
- private `_canonical_json_bytes`のUTF-8 canonical bytes golden vectorとprivate `_sha256_digest`の`sha256:` digest golden vectorは別々に照合する。source-content digest vectorはraw bytesを直接渡し、JSON decode/re-encodeしない。
- Codec入力がL4 canonical JSON domain外の場合、serializerがbytesを出さないことを検査する。内部例外のhost typeはL4 public result classではなく、`missing_key`、Unknown、Unobserved、Valueへ写さない。
- fixture runner候補はPython 3.11+標準ライブラリの`unittest`とする。K1/K2が同じPython標準ライブラリのpure semantic core候補に沿い、各caseを外部test packageなしで個別に記述・実行できるためである。これは試験器の技術選択であり、新しい要件、gate、L9合格主張ではない。

## 3. K1 fixture表

| UT ID | L6関数ID | L9 oracle | 基準fixture → 1変更fixture | 単一期待 |
|---|---|---|---|---|
| `CK-K1-UT-001` | FN-02/03/04 | IV-K1-01 | CONNECT compatibleとHARNESS passを各owner polarityに従って合成し、別caseでValue(pass)+成立済みNotApplicableも与える | `Combined(Positive)`、`Admitted`。ownerが明示する各mapping identity/versionを成分対応どおり保持し、callableのqualnameや既定版で代用しない。混合caseもPositive/Admittedで成立済みNotApplicableのexcluded indexを保持する。 |
| `CK-K1-UT-002a/b/c` | FN-02/03/04 | IV-K1-01 | 001基底からCONNECT成分だけUnknown(incomparable)、Stale、Unobserved(not_selected)へ一つずつ変更 | 各々`Undetermined`、`Withheld`。reasonはその成分の位置/classを保持する。各suffixは別fixture IDとする。 |
| `CK-K1-UT-002-ADMIT-INCONSISTENT` | FN-04 | IV-K1-02 | `combine`を経ず直接構成したPositive Combinedを7形で与える: negative index / non-value index / set_reason / non-Value componentだが該当indexなし / 空components / 成立済みNotApplicableだけ / invalid NotApplicable | いずれもAdmittedにせずWithheld。位置付きreasonは既存reasonを保持し、index欠落のnon-Value、空components、成立済みNotApplicableだけの集合はwhole `Unknown(missing_input)`へfail-closed。invalid NotApplicableはその既存`invalid_disposition`理由を保持する。 |
| `CK-K1-UT-003` | FN-03/04 | IV-K1-02 | `[Value(fail)]`基底へUnknown(unreadable)を一成分追加 | Negativeのまま、2成分を入力順保持、negative/non-valueの両方のindexを記録しWithheld理由2件。 |
| `CK-K1-UT-004` | FN-03/04 | IV-K1-03 | Value(pass)へUnknown(conflict)、Unobserved(pending_receipt)、Staleを加える | Undetermined、3つの非Value位置をすべて保持し、Withheld理由を3件記録する。 |
| `CK-K1-UT-005a/b` | FN-03/04 | IV-K1-04 | all-pass基底から1成分だけfailへ変更する。all-passのpositive baselineは別fixtureにする | fail側はNegative/Withheldでreasonが空でなく、baselineはPositive/Admitted。 |
| `CK-K1-UT-006` | FN-02/03 | IV-K1-05 | polarityありのValue成分を、mappingだけ不在の同値型入力へ変更 | callerはValueを渡さず、完全key付きUnknown(missing_input)を作り、combine結果でnon-valueとして保持する。 |
| `CK-K1-UT-007a/b/c` | FN-03/04 | IV-K1-06 | 有効成分0件 / 成立N/A 1件のみ / 成立N/A 3件のみ（個別fixture） | 各々Undeterminedとし、set_reasonはL4 §2.2の集合診断`{class: Unknown, reason: missing_input}`（keyなし）、whole reasonは1件。componentsは入力件数0/1/3のままで、架空keyやN/A keyの流用・追加Observedなし。 |
| `CK-K1-UT-008a/b/c` | FN-05/03 | IV-K1-07 | 有効なdispositionからreason/authority/reentry_triggerを一つずつ個別に除去する | 各々Unknown(invalid_disposition)となり、combineで`non_values=(0,)`、admitでその理由を保持する。 |
| `CK-K1-UT-008-INVALID-NA` | FN-03/04 | IV-K1-07 | 完全keyを持つNotApplicableからauthorityだけを欠落させる | Undetermined、`non_values=(0,)`、`excluded=()`、Withheld理由は`NotApplicable/invalid_disposition`。 |
| `CK-K1-UT-009-ACCEPT-COMBINE-{CLASS}` | FN-02/03 | IV-K1-08 | `{CLASS}`=Value/Unknown/Unobserved/NotApplicable/Stale。完全key付き成分を各class一つずつ`combine`へ渡す | 5個別fixtureで各成分classを受理し、結果のcomponentに保持する。 |
| `CK-K1-UT-009-ACCEPT-RECORD-{CLASS}` | K2 FN-08 | IV-K1-08 | `{CLASS}`=Value/Unknown/Unobserved/NotApplicable。完全一致する外側record keyと各非Stale result classを`record`へ渡す | 4個別fixtureで`Recorded`とし、保存resultが入力class/fieldを保持する。Stale resultは`CK-K1-UT-009-STALE-RECORD`で別に扱う。 |
| `CK-K1-UT-009-LOOKUP-{CLASS}` | K2 FN-05 | IV-K1-08 | `{CLASS}`=Value/Unknown/Unobserved/NotApplicable。完全一致する保存record classからlookup queryを作る | 4個別fixtureで各record classをそのまま返す。`lookup`はObserved入力を受けない。 |
| `CK-K1-UT-009-STALE-LOOKUP` | K2 FN-05 | IV-K1-08 / IV-K2-02 | 完全keyの旧revision Value recordだけを置き、current queryでlookupする | lookupの返却値として`Stale`を導出する。`Stale`をlookup入力に渡さない。 |
| `CK-K1-UT-009-STALE-RECORD` | K2 FN-08 | IV-K1-08 / IV-K2-11 | 完全keyとStale resultを持つ基準からkey全体だけを欠落させる優先順位fixture | key欠落の有無にかかわらず、Stale判定を優先して`Rejected(stale_not_recordable)`。 |
| `CK-K1-UT-009-KEY-COMBINE-{CLASS}` | FN-01/03 | IV-K1-08 | `{CLASS}`=Value/Unknown/Unobserved/NotApplicable/Stale。各成分からkey全体だけ欠落させる | 5個別fixtureすべて`Rejected(missing_key)`。 |
| `CK-K1-UT-009-KEY-RECORD` | K2 FN-08 | IV-K1-08 | 2つの独立case: (1)完全Observed keyを保ちrecord引数keyだけ欠落、(2)完全record keyを保ちObserved内keyだけ欠落 | いずれも`Rejected(missing_key)`。Stale優先fixtureとは分離する。 |
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
| `CK-K2-UT-011a/b` | FN-08/06 | IV-K2-11 | a: same key+same result digestを再度与え、record後に呼出し側の元evidence dictを変更する / b: same keyでValue内容を変更する。bにはclassだけ違うcaseとevidenceだけ違うcaseを独立して含める | aはNoOpとなり、記録済snapshot/evidenceとresult_digestは呼出し側の元dict変更で変わらない。bは各caseでConflictとなり、2件のresult_digestを保持してlookupはUnknown(conflict)。 |
| `CK-K2-UT-011c` | FN-08 | IV-K2-11 | record resultをStaleへ一箇所変更 | Rejected(stale_not_recordable)。 |
| `CK-K2-UT-012` | FN-05/07 | IV-K2-12 | query revisionをR2にし、唯一のcandidateをR1にする | R2 queryに対してR1 Valueをcurrent Valueとして返さない。IV-K2-02/03の結果に従う。 |
| `CK-K2-UT-013-NO-PREFIX` | FN-03 | IV-K2-13 | 有効なsubject.digestから`sha256:` prefixだけを除き、他fieldは固定する | `Rejected(invalid_digest)`。 |
| `CK-K2-UT-013-SHORT` | FN-03 | IV-K2-13a | 有効なsubject.digestのhex部分だけを64桁から63桁へ短縮し、他fieldは固定する | `Rejected(invalid_digest)`。 |
| `CK-K2-UT-013-GIT-REVISION` | FN-03 | IV-K2-13b | subject.digestだけを40桁GitRevision値へ置き換え、他fieldは固定する | `Rejected(invalid_digest)`。 |
| `CK-K2-UT-013-UPPERCASE` | FN-03 | IV-K2-13 | subject.digestの64桁hexだけをuppercaseへ変更し、他fieldは固定する | `Rejected(invalid_digest)`。 |
| `CK-K2-UT-013-PRECEDENCE-MISSING` | FN-03 | L4 §3.4 priority; IV-K2-13/13a/13b | 意図的な複合priority fixture: operation欠落かつdigest有効の基準へ、subject.digestだけ不正形式を追加する | 追加した1 field変異後も`Rejected(missing_key)`。`KeyOfResult`検査順でDigest拒否より必須欠落を優先する。 |
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

## 5. K5 fixture表

本節はL8 §5の91個別K5 caseを、K5関数候補と観測点へ対応づける。case IDは`CK-K5-UT-001`から`CK-K5-UT-091`の連番で、各IDは対応するL8 IDを一件だけ参照する。read/current_head/restore/project/verifyの対応caseは公開関数を呼び、reader/FixedRef/current-assignment/K3/K7は明示stub boundaryとする。append caseはprivate preflight/handoff helperだけを検査し、未接続の公開append APIや書込み成功を主張しない。期待classificationはL8/L9の正本を参照し、ここでは複製しない。

| UT ID | L6関数ID | L8 fixture | L9 oracle | Stub入力 | 呼出し後に観測する戻りfield / 境界 |
|---|---|---|---|---|---|
| `CK-K5-UT-001` | CK-K5-FN-16 | `L8-K5-01-MUTATE` | IV-K5-01 | L8指定の固定segment prefix/headに単独変異したraw line。外部store/authorityはstubのみ。 | readのObserved variant/reason/evidence、Value時の指定headと全entries。L8期待を複製せず、実行passも主張しない。 |
| `CK-K5-UT-002` | CK-K5-FN-16 | `L8-K5-01-DELETE` | IV-K5-01 | L8指定の固定segment prefix/headに単独変異したraw line。外部store/authorityはstubのみ。 | readのObserved variant/reason/evidence、Value時の指定headと全entries。L8期待を複製せず、実行passも主張しない。 |
| `CK-K5-UT-003` | CK-K5-FN-16 | `L8-K5-01-REORDER` | IV-K5-01 | L8指定の固定segment prefix/headに単独変異したraw line。外部store/authorityはstubのみ。 | readのObserved variant/reason/evidence、Value時の指定headと全entries。L8期待を複製せず、実行passも主張しない。 |
| `CK-K5-UT-004` | CK-K5-FN-16 | `L8-K5-02-PARSE` | IV-K5-02 | L8指定の固定segment prefix/headに単独変異したraw line。外部store/authorityはstubのみ。 | readのObserved variant/reason/evidence、Value時の指定headと全entries。L8期待を複製せず、実行passも主張しない。 |
| `CK-K5-UT-005` | CK-K5-FN-16 | `L8-K5-03-SCHEMA` | IV-K5-03 | L8指定の固定segment prefix/headに単独変異したraw line。外部store/authorityはstubのみ。 | readのObserved variant/reason/evidence、Value時の指定headと全entries。L8期待を複製せず、実行passも主張しない。 |
| `CK-K5-UT-006` | CK-K5-FN-16 | `L8-K5-04-SEQ-GAP` | IV-K5-04 | L8指定の固定segment prefix/headに単独変異したraw line。外部store/authorityはstubのみ。 | readのObserved variant/reason/evidence、Value時の指定headと全entries。L8期待を複製せず、実行passも主張しない。 |
| `CK-K5-UT-007` | CK-K5-FN-16 | `L8-K5-05-SEQ-DUP` | IV-K5-05 | L8指定の固定segment prefix/headに単独変異したraw line。外部store/authorityはstubのみ。 | readのObserved variant/reason/evidence、Value時の指定headと全entries。L8期待を複製せず、実行passも主張しない。 |
| `CK-K5-UT-008` | CK-K5-FN-16 | `L8-K5-06-PREV` | IV-K5-06 | L8指定の固定segment prefix/headに単独変異したraw line。外部store/authorityはstubのみ。 | readのObserved variant/reason/evidence、Value時の指定headと全entries。L8期待を複製せず、実行passも主張しない。 |
| `CK-K5-UT-009` | CK-K5-FN-16 | `L8-K5-07-ENTRY` | IV-K5-07 | L8指定の固定segment prefix/headに単独変異したraw line。外部store/authorityはstubのみ。 | readのObserved variant/reason/evidence、Value時の指定headと全entries。L8期待を複製せず、実行passも主張しない。 |
| `CK-K5-UT-010` | CK-K5-FN-16 | `L8-K5-08-HEAD-SHORT` | IV-K5-08 | L8指定の固定segment prefix/headに単独変異したraw line。外部store/authorityはstubのみ。 | readのObserved variant/reason/evidence、Value時の指定headと全entries。L8期待を複製せず、実行passも主張しない。 |
| `CK-K5-UT-011` | CK-K5-FN-16 | `L8-K5-08-HEAD-OTHER-CHAIN` | IV-K5-08 | L8指定の固定segment prefix/headに単独変異したraw line。外部store/authorityはstubのみ。 | readのObserved variant/reason/evidence、Value時の指定headと全entries。L8期待を複製せず、実行passも主張しない。 |
| `CK-K5-UT-012` | CK-K5-FN-11/15/18/19 | `L8-K5-09-FIXED-HEAD` | IV-K5-09 | seq=1の保存Projectionとseq=2追記/current head、又は保存input_heads。外部store/authorityはstubのみ。 | Projection.input_heads/output/output_digestとverify/readのObserved variant/evidence。L8期待を複製せず、実行passも主張しない。 |
| `CK-K5-UT-013` | CK-K5-FN-11/15/18/19; CK-K2-FN-05/07 | `L8-K5-09-CURRENT-HEAD` | IV-K5-09 | seq=1の保存Projectionとseq=2追記/current head、又は保存input_heads。外部store/authorityはstubのみ。 | Projection.input_heads/output/output_digestとverify/readのObserved variant/evidence。L8期待を複製せず、実行passも主張しない。 |
| `CK-K5-UT-014` | CK-K5-FN-07/14 | `L8-K5-10-NOOP` | IV-K5-10 | 完全一致する既存ResultRecorded peerを復元済みstubとして与え、同じkey/resultの追記eventを`_event_valid`へ渡す。外部store/authorityはstubのみ。 | private preflightが`noop`判断を返すことを観測する。公開appendの永続化、adapter成功、外部作用は主張しない。 |
| `CK-K5-UT-015` | CK-K5-FN-07/14 | `L8-K5-10-CONFLICT` | IV-K5-10 | 同じkeyでresult digestだけ異なる既存peerを与え、追記eventは固定する。外部store/authorityはstubのみ。 | `_event_valid`がprivate `conflict` sentinelを返すことを観測する。K1 `Conflict` resultやappend後続portの動作は主張しない。 |
| `CK-K5-UT-016` | CK-K5-FN-07/14 | `L8-K5-10-PEER-UNREADABLE` | IV-K5-10 | 有効なResultRecorded eventを固定し、peer読み取り可否だけをunreadableへ変えた`_append_with_context`呼出し。外部store/authorityはstubのみ。 | `Rejected(peer_unreadable)`を返し、read/head/append portを呼ばない。これはK5-I5が定めるResultRecorded受口の理由であり、他eventへ一般化しない。 |
| `CK-K5-UT-017` | CK-K5-FN-07/08/14 | `L8-K5-11-MISSING-KEY` | IV-K5-11 | 完全なResultRecorded基準から`key` fieldだけを除く。 | private `_event_valid`は`missing_key`を返す。K5外側resultへの写像や公開append戻り値は検査しない。 |
| `CK-K5-UT-018` | CK-K5-FN-07/08/14 | `L8-K5-11-BAD-KEY-DIGEST` | IV-K5-11 | 完全なResultRecorded基準から`key_digest`だけを別値にする。 | private `_event_valid`は`_UNMAPPED_APPEND_VALIDATION`を返す。 |
| `CK-K5-UT-019` | CK-K5-FN-07/08/14 | `L8-K5-11-BAD-RESULT-DIGEST` | IV-K5-11 | 完全なResultRecorded基準から`result_digest`だけを別値にする。 | private `_event_valid`は`_UNMAPPED_APPEND_VALIDATION`を返す。 |
| `CK-K5-UT-020` | CK-K5-FN-07/08/14 | `L8-K5-11-STALE` | IV-K5-11 | ResultRecorded bodyのclassだけをStaleへ変え、digestはそのbodyに合わせて再計算する。 | private `_event_valid`は`stale_not_recordable`を返す。 |
| `CK-K5-UT-021` | CK-K5-FN-07/08/14 | `L8-K5-11-NA-REASON` | IV-K5-11 | NotApplicable ResultBodyから`reason`だけを除き、他の必須fieldは保つ。 | private `_event_valid`は`_UNMAPPED_APPEND_VALIDATION`を返す。 |
| `CK-K5-UT-022` | CK-K5-FN-07/08/14 | `L8-K5-11-NA-AUTHORITY` | IV-K5-11 | NotApplicable ResultBodyから`authority`だけを除き、他の必須fieldは保つ。 | private `_event_valid`は`_UNMAPPED_APPEND_VALIDATION`を返す。 |
| `CK-K5-UT-023` | CK-K5-FN-07/08/14 | `L8-K5-11-NA-REENTRY-TRIGGER` | IV-K5-11 | NotApplicable ResultBodyから`reentry_trigger`だけを除き、他の必須fieldは保つ。 | private `_event_valid`は`_UNMAPPED_APPEND_VALIDATION`を返す。 |
| `CK-K5-UT-024` | CK-K5-FN-07/08/14 | `L8-K5-11-UNDECLARED-INLINE` | IV-K5-11 | ResultRecorded valueのinline `type`だけを宣言外の文字列へ変える。 | private `_event_valid`は`_UNMAPPED_APPEND_VALIDATION`を返す。 |
| `CK-K5-UT-025` | CK-K5-FN-07/08/14 | `L8-K5-11-WRONG-LOG` (未実証) | IV-K5-11 | local testではResultKey.operationだけをLogDecl.operationsにない値へ変え、key digestを再計算する。これはlog identity mismatchではない。 | private `_event_valid`は`_UNMAPPED_APPEND_VALIDATION`を返す。L8のwrong-log受口は未検証。 |
| `CK-K5-UT-026` | CK-K5-FN-07/08/14 | `L8-K5-11-CONFLICT-ONE-DIGEST` | IV-K5-11 | ResultConflictDetectedの`result_digests`を一件にする。 | private `_event_valid`は`_UNMAPPED_APPEND_VALIDATION`を返す。 |
| `CK-K5-UT-027` | CK-K5-FN-07/08/14 | `L8-K5-11-CONFLICT-UNKNOWN-DIGEST` | IV-K5-11 | ResultConflictDetectedに異なる2 digestを与えるが、既存peer recordsは空に保つ。 | private `_event_valid`は`_UNMAPPED_APPEND_VALIDATION`を返す。 |
| `CK-K5-UT-028` | CK-K5-FN-07/08/14 | `L8-K5-11-CORRECT-RESULT` | IV-K5-11 | Correction targetを既存recordsに存在しないdigestにする。 | private `_event_valid`は`_UNMAPPED_APPEND_VALIDATION`を返す。 |
| `CK-K5-UT-029` | CK-K5-FN-07/08/14 | `L8-K5-11-SEGMENTOPENED-WRONG-WRITER` | IV-K5-11 | SegmentOpened payloadを固定し、manifest segmentでないappend destinationを使う。 | private `_event_valid`は`_UNMAPPED_APPEND_VALIDATION`を返す。 |
| `CK-K5-UT-030` | CK-K5-FN-07/08/14 | `L8-K5-11-UNDECLARED-EVENT` | IV-K5-11 | DeclaredEvent.event_typeだけをLogDecl.event_typesにない値へ変える。 | private `_event_valid`は`_UNMAPPED_APPEND_VALIDATION`を返す。 |
| `CK-K5-UT-031` | CK-K5-FN-07/08/14 | `L8-K5-11-WRONG-WRITER` | IV-K5-11 | event/manifestを保ち、caller writerだけをsegment.writerと異なる値にする。 | private `_event_valid`は`_UNMAPPED_APPEND_VALIDATION`を返す。 |
| `CK-K5-UT-032` | CK-K5-FN-07/08/14 | `L8-K5-11-UNREGISTERED-SEGMENT` | IV-K5-11 | 有効なResultRecorded event/segmentを固定し、manifest membershipだけからappend先segmentを除く。 | private `_event_valid`は`_UNMAPPED_APPEND_VALIDATION`を返す。 |

UT-017–032のL8欄は関連oracleを示すが、この表の多くはprivate `_event_valid`の戻りとlocal placeholder境界だけを照合する。`_UNMAPPED_APPEND_VALIDATION`はL8の外側`Rejected`期待を満たした証拠ではなく、L8 coverage/passへ数えない。UT-025はlog identity mismatchそのものを変異させていないため、L8 WRONG-LOGは未検証である。
| `CK-K5-UT-033` | CK-K5-FN-06/17; CK-K2-FN-05/07 | `L8-K5-12-VALUE-INLINE` | IV-K5-12 | fixed prefix内にInlineのResultRecordedを置く。restoreがValue recordsを返した後、同じ完全一致queryでlookupする。外部store/authorityはstubのみ。 | restoreのObserved variantとrecords全体、lookupのObserved variant/reason/evidence、照合したResultKey、および保存ResultBody.classを観測する。L8期待を複製せず、実行passも主張しない。 |
| `CK-K5-UT-034` | CK-K5-FN-06/17; CK-K2-FN-05/07 | `L8-K5-12-VALUE-FIXEDREF` | IV-K5-12 | fixed prefix内にFixedRefのResultRecordedを置き、bytes/digest一致のresolver stubを与える。restoreがValue recordsを返した後、同じ完全一致queryでlookupする。外部store/authorityはstubのみ。 | restoreのObserved variantとrecords全体、lookupのObserved variant/reason/evidence、照合したResultKey、および保存ResultBody.classを観測する。L8期待を複製せず、実行passも主張しない。 |
| `CK-K5-UT-035` | CK-K5-FN-06/17; CK-K2-FN-05/07 | `L8-K5-12-UNKNOWN` | IV-K5-12 | fixed prefix内にUnknown ResultRecordedを置く。restoreがValue recordsを返した後、同じ完全一致queryでlookupする。外部store/authorityはstubのみ。 | restoreのObserved variantとrecords全体、lookupのObserved variant/reason/evidence、照合したResultKey、および保存ResultBody.classを観測する。L8期待を複製せず、実行passも主張しない。 |
| `CK-K5-UT-036` | CK-K5-FN-06/17; CK-K2-FN-05/07 | `L8-K5-12-UNOBSERVED` | IV-K5-12 | fixed prefix内にUnobserved ResultRecordedを置く。restoreがValue recordsを返した後、同じ完全一致queryでlookupする。外部store/authorityはstubのみ。 | restoreのObserved variantとrecords全体、lookupのObserved variant/reason/evidence、照合したResultKey、および保存ResultBody.classを観測する。L8期待を複製せず、実行passも主張しない。 |
| `CK-K5-UT-037` | CK-K5-FN-06/17; CK-K2-FN-05/07 | `L8-K5-12-NOT-APPLICABLE` | IV-K5-12 | fixed prefix内にNotApplicable ResultRecordedを置く。restoreがValue recordsを返した後、同じ完全一致queryでlookupする。外部store/authorityはstubのみ。 | restoreのObserved variantとrecords全体、lookupのObserved variant/reason/evidence、照合したResultKey、および保存ResultBody.classを観測する。L8期待を複製せず、実行passも主張しない。 |
| `CK-K5-UT-038` | CK-K5-FN-06/17 | `L8-K5-12-FIXEDREF-MISSING` | IV-K5-12 | fixed prefix内のResultRecorded、Inline/FixedRef resolver stub、又は指定missing/digest mismatch。外部store/authorityはstubのみ。 | restoreのObserved variant/reason/evidenceとrecords全体。Value時はresult class/key_digest。L8期待を複製せず、実行passも主張しない。 |
| `CK-K5-UT-039` | CK-K5-FN-06/17 | `L8-K5-12-FIXEDREF-DIGEST` | IV-K5-12 | fixed prefix内のResultRecorded、Inline/FixedRef resolver stub、又は指定missing/digest mismatch。外部store/authorityはstubのみ。 | restoreのObserved variant/reason/evidenceとrecords全体。Value時はresult class/key_digest。L8期待を複製せず、実行passも主張しない。 |
| `CK-K5-UT-040` | CK-K5-FN-10/12/14/18 | `L8-K5-13-NO-CORRECTION` | IV-K5-13 | 固定DeclaredEvent/correction tree。append fixtureはappend stub、project fixtureは復元済みevent sequence。外部store/authorityはstubのみ。 | append既存結果、projection Observed variant/reasonとProjection.output/output_digest。L8期待を複製せず、実行passも主張しない。 |
| `CK-K5-UT-041` | CK-K5-FN-10/12/14/18 | `L8-K5-13-CHAIN` | IV-K5-13 | 固定DeclaredEvent/correction tree。append fixtureはappend stub、project fixtureは復元済みevent sequence。外部store/authorityはstubのみ。 | append既存結果、projection Observed variant/reasonとProjection.output/output_digest。L8期待を複製せず、実行passも主張しない。 |
| `CK-K5-UT-042` | CK-K5-FN-10/12/14/18 | `L8-K5-13-RETRACTION` | IV-K5-13 | 固定DeclaredEvent/correction tree。append fixtureはappend stub、project fixtureは復元済みevent sequence。外部store/authorityはstubのみ。 | append既存結果、projection Observed variant/reasonとProjection.output/output_digest。L8期待を複製せず、実行passも主張しない。 |
| `CK-K5-UT-043` | CK-K5-FN-10/12/14/18 | `L8-K5-13-BRANCH` | IV-K5-13 | 固定DeclaredEvent/correction tree。branch caseは複数segmentの整合prefixから公開`project`を呼ぶ。append fixtureはappend stub。外部store/authorityはstubのみ。 | branch時は`Unknown(conflict)`、`key`は公開`project`が構成した完全なK5 `ResultKey`と一致する。append既存結果も確認する。L8期待を複製せず、実行passも主張しない。 |
| `CK-K5-UT-044` | CK-K5-FN-10/12/14/18; CK-K2-FN-07/08 | `L8-K5-13-SAME-KEY` | IV-K5-13 | 固定DeclaredEvent/correction tree。append fixtureはappend stub、project fixtureは復元済みevent sequence。外部store/authorityはstubのみ。 | append既存結果、projection Observed variant/reasonとProjection.output/output_digest。L8期待を複製せず、実行passも主張しない。 |
| `CK-K5-UT-045` | CK-K5-FN-10/12/14/18; CK-K2-FN-07/08 | `L8-K5-13-NEW-REVISION` | IV-K5-13 | 固定DeclaredEvent/correction tree。append fixtureはappend stub、project fixtureは復元済みevent sequence。外部store/authorityはstubのみ。 | append既存結果、projection Observed variant/reasonとProjection.output/output_digest。L8期待を複製せず、実行passも主張しない。 |
| `CK-K5-UT-046` | CK-K5-FN-12/14/18 | `L8-K5-14-NO-WRITEBACK` | IV-K5-14 | 同一event集合の順序variant、又はProjectionからappend/recordへ接続しようとするstub。外部store/authorityはstubのみ。 | output_digest、write/append/record port呼出数、元event/record sequence不変。L8期待を複製せず、実行passも主張しない。 |
| `CK-K5-UT-047` | CK-K5-FN-09/12/18 | `L8-K5-15-ORDER-INDEPENDENT` | IV-K5-15 | 同じprojector、scope、固定input_heads、全event集合を使い、projectへ渡すsegment/read列の入力順だけを3 variantに変える。event/reader/storeはstub入力。 | 3回のpublic `project`を呼び、すべて`Value(Projection)`であり3つの`output`と`output_digest`が一致することを観測する。restoreやwriter NFC/NFD/segment numeric orderingの観測で代用しない。 |
| `CK-K5-UT-048` | CK-K5-FN-09/17; CK-K2-FN-05/07 | `L8-K5-16-NUMERIC-ORDER` | IV-K5-16 | 複数writer/segment prefixと単一のL8指定順序/表記変異。外部store/authorityはstubのみ。 | restore sequence上のwriter/segment_no/seq。L8期待を複製せず、実行passも主張しない。 |
| `CK-K5-UT-049` | CK-K5-FN-09/17 | `L8-K5-16-NFC` | IV-K5-16 | NFC `é` とNFD `é` のwriter表記を持つsegment_no 2/10へ異なるrevisionのValue recordを置き、入力順を逆にして`restore`し、そのrecordsを新revision queryで`lookup`する。外部store/authorityはstubのみ。 | `restore`がNFC/NFD表記を同一writerとして扱ってrecordsをnumeric segment_no順に返す。`lookup`は`Stale`を返し、segment_no=10側のkeyを`recorded_key`、queryを`current_key`として保持する。 |
| `CK-K5-UT-050` | CK-K5-FN-05/11/12/18 | `L8-K5-17-COMPLETE` | IV-K5-17 | manifest・scope・A/B headsとprefix全量、又はL8指定head/scope/readだけ欠落・損傷。外部store/authorityはstubのみ。 | project Observed variant/reason/evidence、input_heads。非Value時K2 lookup呼出数=0。L8期待を複製せず、実行passも主張しない。 |
| `CK-K5-UT-051` | CK-K5-FN-05/11/12/18 | `L8-K5-17-MISSING-HEAD` | IV-K5-17 | manifest・scope・A/B headsとprefix全量、又はL8指定head/scope/readだけ欠落・損傷。外部store/authorityはstubのみ。 | project Observed variant/reason/evidence、input_heads。非Value時K2 lookup呼出数=0。L8期待を複製せず、実行passも主張しない。 |
| `CK-K5-UT-052` | CK-K5-FN-05/11/12/18 | `L8-K5-17-EMPTY-SCOPE` | IV-K5-17 | manifest・scope・A/B headsとprefix全量、又はL8指定head/scope/readだけ欠落・損傷。外部store/authorityはstubのみ。 | project Observed variant/reason/evidence、input_heads。非Value時K2 lookup呼出数=0。L8期待を複製せず、実行passも主張しない。 |
| `CK-K5-UT-053` | CK-K5-FN-05/11/12/18 | `L8-K5-17-DAMAGED-B` | IV-K5-17 | manifest・scope・A/B headsとprefix全量、又はL8指定head/scope/readだけ欠落・損傷。外部store/authorityはstubのみ。 | project Observed variant/reason/evidence、input_heads。非Value時K2 lookup呼出数=0。L8期待を複製せず、実行passも主張しない。 |
| `CK-K5-UT-054` | CK-K5-FN-05/11/12/18; CK-K2-FN-05/07 | `L8-K5-17-SCOPE-A` | IV-K5-17 | manifest・scope・A/B headsとprefix全量、又はL8指定head/scope/readだけ欠落・損傷。外部store/authorityはstubのみ。 | project Observed variant/reason/evidence、input_heads。非Value時K2 lookup呼出数=0。L8期待を複製せず、実行passも主張しない。 |
| `CK-K5-UT-055` | CK-K5-FN-05/11/12/18 | `L8-K5-17-CLOSED-PARTIAL-READ` | IV-K5-17 | 既存closed eventを含む完全A/B fixed-scopeを基準に、必要なB prefix/headだけを欠かせる。外部store/authorityはstubのみ。 | public `project`は`Unknown(missing_input)`となり、非Value時K2 lookupを呼ばない。入力recordを変更せず、既存closed原記録を残し、openを再生成しないことを同時に観測する。 |
| `CK-K5-UT-056` | CK-K5-FN-05/11/18/19; CK-K2-FN-05/07 | `L8-K5-18-EXACT` | IV-K5-18 | 一致projector/scope/headの保存Projection recordとL8指定の一つのappend/version/digest差。外部store/authorityはstubのみ。 | lookup Observed variant/reasonとStored ResultRecord key/prior、およびProjection input_heads/output_digest。L8期待を複製せず、実行passも主張しない。 |
| `CK-K5-UT-057` | CK-K5-FN-05/11/18/19; CK-K2-FN-05/07 | `L8-K5-18-APPEND` | IV-K5-18 | 一致projector/scope/headの保存Projection recordとL8指定の一つのappend/version/digest差。外部store/authorityはstubのみ。 | lookup Observed variant/reason/key/priorとProjection input_heads/output_digest。L8期待を複製せず、実行passも主張しない。 |
| `CK-K5-UT-058` | CK-K5-FN-05/11/18/19; CK-K2-FN-05/07 | `L8-K5-18-VERSION` | IV-K5-18 | 一致projector/scope/headの保存Projection recordとL8指定の一つのappend/version/digest差。外部store/authorityはstubのみ。 | lookup Observed variant/reason/key/priorとProjection input_heads/output_digest。L8期待を複製せず、実行passも主張しない。 |
| `CK-K5-UT-059` | CK-K5-FN-05/11/18/19; CK-K2-FN-05/07 | `L8-K5-18-DIGEST` | IV-K5-18 | 一致projector/scope/headの保存Projection recordとL8指定の一つのappend/version/digest差。外部store/authorityはstubのみ。 | lookup Observed variant/reason/key/priorとProjection input_heads/output_digest。L8期待を複製せず、実行passも主張しない。 |
| `CK-K5-UT-060` | CK-K5-FN-05/11/18/19; CK-K2-FN-05/07 | `L8-K5-18-UNAFFECTED` | IV-K5-18 | 一致projector/scope/headの保存Projection recordとL8指定の一つのappend/version/digest差。外部store/authorityはstubのみ。 | lookup Observed variant/reason/key/priorとProjection input_heads/output_digest。L8期待を複製せず、実行passも主張しない。 |
| `CK-K5-UT-061` | CK-K5-FN-12/13/19 | `L8-K5-19-EXTEND` | IV-K5-19 | 完全なcheckpoint/full rebuild基準を保ち、current fixed headを前方へ拡張した正常projectionを`verify`へ渡す。外部store/authorityはstubのみ。 | public `verify`が`Value(Projection)`を返し、完全再構築値と保存projectionが一致することを観測する。 |
| `CK-K5-UT-062` | CK-K5-FN-12/13/19 | `L8-K5-19-SHORT` | IV-K5-19 | current projectionをold/shorter headのprojectionにし、checkpointのinput headはextended/longerのままにする。 | public `verify`は`Unknown(conflict)`となり、保存projectionを変えず保持する。 |
| `CK-K5-UT-063` | CK-K5-FN-12/13/19 | `L8-K5-19-ANCHOR` | IV-K5-19 | UT-061基準からcheckpoint anchor digestだけを現在のfull-rebuild anchorと不一致にする。 | public `verify`は`Unknown(conflict)`となり、保存projection bytesは不変である。 |
| `CK-K5-UT-064` | CK-K5-FN-12/13/19 | `L8-K5-19-STATE` | IV-K5-19 | UT-061基準からcheckpoint stateだけを変更し、digestは元のままにする。 | public `verify`は`Unknown(conflict)`となる。 |
| `CK-K5-UT-065` | CK-K5-FN-12/13/19 | `L8-K5-19-DIFF` (未実証) | IV-K5-19 | current projection/full rebuildを固定し、checkpoint stateとそのstate_digestを一組として変更する。 | 現候補の`verify`は`Unknown(conflict, evidence={checkpoint: mismatch})`となる。このcaseはcheckpoint state不一致だけを検査し、L8のincremental fold≠full rebuild条件を通るdelta入力がAPIにないため、IV-K5-19-DIFFの適合やcoverageを主張しない。 |
| `CK-K5-UT-066` | CK-K5-FN-13/19 | `L8-K5-20-OUTPUT` | IV-K5-20 | 保存output/output_digestと固定入力からのrebuild値、L8指定の一方だけ改変。外部store/authorityはstubのみ。 | verify Observed variant/reason/evidenceと再構築output_digest。L8期待を複製せず、実行passも主張しない。 |
| `CK-K5-UT-067` | CK-K5-FN-13/19 | `L8-K5-20-OUTPUT-DIGEST` | IV-K5-20 | 保存output/output_digestと固定入力からのrebuild値、L8指定の一方だけ改変。外部store/authorityはstubのみ。 | verify Observed variant/reason/evidenceと再構築output_digest。L8期待を複製せず、実行passも主張しない。 |
| `CK-K5-UT-068` | CK-K5-FN-13/19 | `L8-K5-20-SELF-CONSISTENT-ALTER` | IV-K5-20 | 保存outputとoutput_digestの両方を相互に整合する一つのsemantic条件として改変し、固定入力からのrebuild値は変えない。外部store/authorityはstubのみ。 | verify Observed variant/reason/evidenceと再構築output_digestを観測し、保存output/digest間の自己整合だけで再構築一致としないことを確認する。L8期待を複製せず、実行passも主張しない。 |
| `CK-K5-UT-069` | CK-K5-FN-04/05/06/17; CK-K2-FN-05/07 | `L8-K5-21-COMPLETE` | IV-K5-21 | manifestとscope A/Bの全head/prefix、又はL8指定で1 head/scope/manifest/prefixのみ欠落・破損。完全復元された2 caseだけL8指定のlookupを呼び、非Valueはlookupを呼ばない。外部store/authorityはstubのみ。 | restore Observed variant/reason/evidence。Value時records全件とL8指定のK2 lookup variant/keyを観測し、non-Value時lookup呼出数=0。L8期待を複製せず、実行passも主張しない。 |
| `CK-K5-UT-070` | CK-K5-FN-04/05/06/17; CK-K2-FN-05/07 | `L8-K5-21-SCOPE-A` | IV-K5-21 | manifestとscope Aの全head/prefixをrestoreし、L8が指定するA-scope keyを完全一致queryにする。外部store/authorityはstubのみ。 | restoreのObserved variant/reason/evidenceと全recordsを観測し、完全復元時はK2 lookupのObserved variant/reason/evidence、query ResultKey、保存ResultBody.classも観測する。L8期待を複製せず、実行passも主張しない。 |
| `CK-K5-UT-071` | CK-K5-FN-04/05/06/17 | `L8-K5-21-MISSING-HEAD` | IV-K5-21 | manifestとscope A/Bの全head/prefix、又はL8指定で1 head/scope/manifest/prefixのみ欠落・破損。外部store/authorityはstubのみ。 | restore Observed variant/reason/evidence。non-Value時lookup呼出数=0、Value時records全件。L8期待を複製せず、実行passも主張しない。 |
| `CK-K5-UT-072` | CK-K5-FN-04/05/06/17 | `L8-K5-21-EMPTY-SCOPE` | IV-K5-21 | manifestとscope A/Bの全head/prefix、又はL8指定で1 head/scope/manifest/prefixのみ欠落・破損。外部store/authorityはstubのみ。 | restore Observed variant/reason/evidence。non-Value時lookup呼出数=0、Value時records全件。L8期待を複製せず、実行passも主張しない。 |
| `CK-K5-UT-073` | CK-K5-FN-04/05/06/17 | `L8-K5-21-DAMAGE-MANIFEST` | IV-K5-21 | manifestとscope A/Bの全head/prefix、又はL8指定で1 head/scope/manifest/prefixのみ欠落・破損。外部store/authorityはstubのみ。 | restore Observed variant/reason/evidence。non-Value時lookup呼出数=0、Value時records全件。L8期待を複製せず、実行passも主張しない。 |
| `CK-K5-UT-074` | CK-K5-FN-04/05/06/17 | `L8-K5-21-DAMAGE-B` | IV-K5-21 | manifestとscope A/Bの全head/prefix、又はL8指定で1 head/scope/manifest/prefixのみ欠落・破損。外部store/authorityはstubのみ。 | restore Observed variant/reason/evidence。non-Value時lookup呼出数=0、Value時records全件。L8期待を複製せず、実行passも主張しない。 |
| `CK-K5-UT-075` | CK-K5-FN-04/05/06/17 | `L8-K5-21-MASKED-CONFLICT` | IV-K5-21 | manifestとscope A/Bの全head/prefix、又はL8指定で1 head/scope/manifest/prefixのみ欠落・破損。外部store/authorityはstubのみ。 | restore Observed variant/reason/evidence。non-Value時lookup呼出数=0、Value時records全件。L8期待を複製せず、実行passも主張しない。 |
| `CK-K5-UT-076` | CK-K5-FN-07/14 | `L8-K5-22-OPENED` | IV-K5-22 | owner-bound manifest segment/headと開設対象data segmentを与える。正常append先はmanifest segmentであり、Eventの`segment`が開設対象を指す。K3/K7はstub。 | private append preflightが既存条件を通しstub writerを一度呼ぶ。append先とEventの`segment`が別segmentであることを確認し、owner resolverや物理永続化の合格は主張しない。 |
| `CK-K5-UT-077` | CK-K5-FN-07/14 | `L8-K5-22-UNREGISTERED` | IV-K5-22 | `writer_seg`をmanifest登録集合から除く単一変異。owner registration resolverは未接続。 | private `_append_with_context`は既存未写像placeholder (`NotImplementedError`)で止まり、read/head/append portを呼ばない。これはローカル境界の実行であり、L8外側class/reasonとowner registration coverageを主張しない。 |
| `CK-K5-UT-078` | CK-K5-FN-07/14 | `L8-K5-22-MANIFEST-UNREADABLE` | IV-K5-22 | `DeclaredEvent`と登録済みmanifestを固定し、非ResultRecorded eventのpeer読取可否だけをunreadableにする。reader/owner binding接続は未実装。 | private helperは非ResultRecordedのpeer失敗を未写像として停止し、read/head/append portを呼ばない。ResultRecorded向け`Rejected(peer_unreadable)`を流用しない。L8外側resultとowner接続は未検証。 |
| `CK-K5-UT-079` | CK-K5-FN-07/14 | `L8-K5-22-WRONG-ASSIGNMENT` | IV-K5-22 | current assignment/runのowner条件はhelper入力に存在しない。assignmentが未肯定であるlocal sentinel `effect_ready=False`だけを与える。 | private helperは`None`を返し、append portを呼ばない。このsentinelはL8のassignment不一致を判定せず、L8 coverage外である。 |
| `CK-K5-UT-080` | CK-K5-FN-07/14 | `L8-K5-23-CANCEL` | IV-K5-23 | L8 cancel状態はprivate helper入力へ渡らない。同一の固定`DeclaredEvent`/contextと`effect_ready=False` sentinelを用いる。 | private helperは`None`を返しappend portを呼ばない。UT-080–083は同一のlocal sentinelだけを検査し、cancel/expiry/run/fence各owner条件の差を検証しない。 |
| `CK-K5-UT-081` | CK-K5-FN-07/14 | `L8-K5-23-EXPIRED` | IV-K5-23 | UT-080と同じlocal input。expiry条件はK3/K7 owner resolver未接続のためhelperに表現しない。 | private helperは`None`を返しappend portを呼ばない。L8のexpiry判定は未検証。 |
| `CK-K5-UT-082` | CK-K5-FN-07/14 | `L8-K5-23-NEW-RUN` | IV-K5-23 | UT-080と同じlocal input。new-run条件はK3/K7 owner resolver未接続のためhelperに表現しない。 | private helperは`None`を返しappend portを呼ばない。L8のrun binding判定は未検証。 |
| `CK-K5-UT-083` | CK-K5-FN-07/14 | `L8-K5-23-FENCE` | IV-K5-23 | UT-080と同じlocal input。fence条件はK3/K7 owner resolver未接続のためhelperに表現しない。 | private helperは`None`を返しappend portを呼ばない。L8のfence判定は未検証。 |
| `CK-K5-UT-084` | CK-K5-FN-07/14 | `L8-K5-23-PEER` | IV-K5-23 | ResultRecorded正常key/bodyを基準に、必須peer readだけをunreadableにする。 | L5 K5-I5の既存`Rejected(peer_unreadable)`となり、read/head/append portを呼ばない。これはK5-I5のpeer境界fixtureであり、K3/K7の他のIV-K5-23行を満たさない。 |
| `CK-K5-UT-085` | CK-K5-FN-07/14 | `L8-K5-23-COMPLETION` | IV-K5-23 | 既存manifest/current assignment-runとK3/K7 fence/peer stub、cancel/expiry/run/fence/lateの各L8個別条件。外部store/authorityはstubのみ。 | private `_append_with_context`の既存preflight/handoff結果、adapter呼出数、past prefix不変性。公開append adapter未接続のため、物理writeはstub。L8期待を複製せず、実行passも主張しない。 |
| `CK-K5-UT-086` | CK-K5-FN-07/14 | `L8-K5-23-LATE` | IV-K5-23 | 既存manifest/current assignment-runとK3/K7 fence/peer stub、cancel/expiry/run/fence/lateの各L8個別条件。外部store/authorityはstubのみ。 | private `_append_with_context`の既存preflight/handoff結果、adapter呼出数、past prefix不変性。公開append adapter未接続のため、物理writeはstub。L8期待を複製せず、実行passも主張しない。 |
| `CK-K5-UT-087` | CK-K5-FN-01/02/03/16 | `L8-K5-24-CRLF` | IV-K5-24 | 正規canonical JSON+LF prefixとL8指定のraw-line encoding単独変異。外部store/authorityはstubのみ。 | read Observed variant/reason/evidenceと指定head/entries。L8期待を複製せず、実行passも主張しない。 |
| `CK-K5-UT-088` | CK-K5-FN-01/02/03/16 | `L8-K5-25-TRAILING-SPACE` | IV-K5-25 | 正規canonical JSON+LF prefixとL8指定のraw-line encoding単独変異。外部store/authorityはstubのみ。 | read Observed variant/reason/evidenceと指定head/entries。L8期待を複製せず、実行passも主張しない。 |
| `CK-K5-UT-089` | CK-K5-FN-01/02/03/16 | `L8-K5-26-NONCANONICAL` | IV-K5-26 | 正規canonical JSON+LF prefixとL8指定のraw-line encoding単独変異。外部store/authorityはstubのみ。 | read Observed variant/reason/evidenceと指定head/entries。L8期待を複製せず、実行passも主張しない。 |
| `CK-K5-UT-090` | CK-K5-FN-11/12/18; CK-K2-FN-05/07 | `L8-K5-17-SCOPE-WHOLE-UNOBSERVED` | IV-K5-17 | A-only scope keyとA/B全体scope lookupを構成する固定records。store/authorityはstubのみ。 | K2 lookupの返却classは`Unobserved(not_run)`。scope mismatchのL8 fixtureだけを使い、K2結果を別classへ写さない。 |
| `CK-K5-UT-091` | CK-K5-FN-04/05/17; CK-K2-FN-05/07 | `L8-K5-21-CONFLICT-B` | IV-K5-21 | `COMPLETE`を基準にB prefixだけ同key異resultへ変更し、manifest/A prefixは固定する。store/authorityはstubのみ。 | restoreは完全なA/B recordsを返し、続く全体scope lookupは`Unknown(conflict)`となる。restoreが非Valueならlookupへ部分recordsを渡さない。 |
| `CK-K5-UT-092-LEDGER-ROWS` | CK-K5-FN-20 | `IV-LDG-01`補助 | IV-LDG-01 | 既に観測されたrows fieldの合成入力。FixedRefの実読はstub外。 | private pure assemblyがrowsの`Observed`と固定宣言参照を変更せず保持し、K5-I12 projection keyを付ける。固定bytesの実読・登録判定は検査しない。 |
| `CK-K5-UT-093-LEDGER-FIELDS` | CK-K5-FN-20 | `IV-LDG-03`補助 | IV-LDG-03 | rows/release/generation/immediate/recovery/actualへ異なる既存Observed値を与える。 | private pure assemblyで4 fieldとtarget内3 fieldを別位置に保持する。release/target/actual間の推定・集約を行わない。 |
| `CK-K5-UT-094-HEAD-REFS` | CK-K5-FN-11/18/20 | K5-I12 / IV-K5-09補助 | IV-K5-09 | 同一SegmentHead完全重複、または同SegmentIdでseq/digestが異なるinput refs。 | 完全重複だけをK2 input setで一件化する。異refはK2の実`Rejected(duplicate_identity)`がK5公開result unionへ漏れないことを確認し、公開API契約が未実装のため局所`NotImplementedError` placeholderで停止する。これはK5分類・API例外transportでもL7 coverage/passでもない。 |
| `CK-K5-UT-095-CURRENT-SEQ-ZERO-TAIL` | CK-K5-FN-02 | K5-I2/I3(c)(g); IV-K5-04/08補助 | IV-K5-04 / IV-K5-08 | 実bytesにseq=0かつentry_digest=`genesis`の行を1行だけ置く。 | `current_head`は`Unknown(unreadable)`とし、(c)の不連続sequence evidenceを保持する。物理行を空のgenesis headとして`Value`にしない。 |
| `CK-K5-UT-096-CURRENT-DUPLICATE-TAIL-SEQ` | CK-K5-FN-02 | K5-I2/I3(d)(g); IV-K5-05/08補助 | IV-K5-05 / IV-K5-08 | 内部chainの2行をともseq=1にし、2行目のdigestとprev_digestは整合させる。 | `current_head`は`Unknown(unreadable)`とし、(d)(g)を保持する。重複seqとphysical tail/head不一致から肯定しない。 |
| `CK-K5-UT-097-READ-FOREIGN-GENESIS-HEAD` | CK-K5-FN-01 | K5-I3(g); IV-K5-08補助 | IV-K5-08 | 空bytesのsegment Aに、segment Bを指すseq=0/genesis headを与える。 | `read`はheadの指定segmentが要求segmentに存在しないため`Unknown(unreadable)`、evidence `(g)`を返す。 |
| `CK-K5-UT-098-RESULT-BODY-CLASS-FIELDS` | CK-K5-FN-08/17 | K5 9.3/9.5; IV-K5-12補助 | IV-K5-12 | `restore`へ渡す`ResultRecorded`のResultBodyを、Unknown/Unobservedのreason/whyの欠落・null・未知語彙、NotApplicableの各必須field欠落/null、Valueのvalue/evidence欠落/null・不正encoding/未宣言・非文字列inline typeへ個別に変異する。 | 各変異を単独で与え、`restore`は部分recordを返さず`Unknown(unreadable)`、evidence `result_body`とする。nullとkey不存在を別subtestで確認する。 |
| `CK-K5-UT-099-SCOPE-LOG-IDENTITY` | CK-K5-FN-05/10/18 | K5-I6/9.3; IV-K5-12/17補助 | IV-K5-12 / IV-K5-17 | 正常log/scope/headを基準に、scope.log_id、manifest segment.log_id、scope segment.log_id、またはrestoreのLogDecl.log_idのいずれか一つを不一致にする。 | 既存L4/L5/L9に分類写像が固定されていないため、局所`NotImplementedError`で肯定値を止める。これは公開result分類・例外transport・L7 coverage/passではない。 |
| `CK-K5-UT-100-RESTORE-KEY-VALIDATION` | CK-K5-FN-08/17 | K5 9.3/9.5; IV-K5-12補助 | IV-K5-12 | `ResultRecorded.key`の5 top-level field、subject/input refの各4 field、digest形式、重複input identityを一項目ずつ変異する。 | 既存K2 `key_of`が`Rejected`となる保存keyはrecord化せず、restoreは`Unknown(unreadable)`、evidence `result_body`を返す。K5公開Rejectedを追加しない。 |
| `CK-K5-UT-101-APPEND-UNMAPPED-KEY-BODY` | CK-K5-FN-08/14 | IV-K5-11補助、L8個別fixtureのcoverageではない | IV-K5-11 | 正常ResultRecordedを基準に、K2 invalid_digest/duplicate_identity、Unknown reason欠落/未知語彙、Unobserved why未知語彙、Value evidence欠落、FixedRef digest不正、Inline typeの非文字列を個別変異。 | K5外側Rejected reasonがL5/L8で固定されない変異はprivate local `NotImplementedError`で止め、read/head/append/FixedRef portを0回とする。既存reasonが固定されたStale/NA条件は既存試験の期待を維持。これはL8の`Rejected`期待を満たす実装・coverage/passに数えない。 |
| `CK-K5-UT-102-CLOSED-EVENT-UNION` | CK-K5-FN-02/16 | K5-I2/I3; IV-K5-03補助 | IV-K5-03 | 一件ずつkind欠落、未知kindへ変えたraw event lineを読む。 | public `read`は両fixtureで`Unknown(unreadable)`と`event_shape` evidenceを保持し、行を読み飛ばさない。 |
| `CK-K5-UT-103-MALFORMED-NESTED-EVENT` | CK-K5-FN-02/14/16 | K5-I2/I3/I5補助 | IV-K5-03/11補助 | 別々の入力で、(a) raw LogEntryのevent objectをlistへ変えたbytesを`read`し、(b) append側へlist replacementを持つCorrectionを渡す。 | (a) `read`は`Unknown(unreadable)`と既存event-shape evidenceを返す。(b) appendはprivate placeholderで停止しread/head/append portを呼ばない。2条件を同じfixtureの変異として扱わない。 |
| `CK-K5-UT-104-GENESIS-HEAD` | CK-K5-FN-01/11/15/16/17/18/19 | K5-I3/I4; IV-K5-08/09/21補助 | IV-K5-08/09/21 | bytesが空でseq=0/genesisのheadを与える完全scopeを用いる。 | current_head/read/restore/project/verifyの公開経路がValueとなり、projection digestは空entry列の再構築値と一致する。owner/storeはstub。 |
| `CK-K5-UT-105-SEGMENT-OPENED-DESTINATION` | CK-K5-FN-07/14 | K5-I5/I6; IV-K5-22補助 | IV-K5-22 | 正常はmanifest append destinationと別のpayload target。負例はdestinationをdata segment又は別manifest segmentへ一件ずつ変更する。 | 正常はprivate preflightを通りstub appendを一回呼ぶ。負例は外側reason未定義のため局所placeholderでreader/writer前に止まり、`Rejected`を推測しない。 |
| `CK-K5-UT-106-APPEND-SHAPE-CONSTRAINTS` | CK-K5-FN-02/07/08/14 | K5-I2/I5; IV-K5-03/11補助 | IV-K5-03/11 | 既存基準から重複conflict digest、FixedRef.store不一致、Correction replacementのvariant違いを別々に与える。 | 各fixtureは`_UNMAPPED_APPEND_VALIDATION`から局所`NotImplementedError`で停止し、reader/writerを呼ばない。既存Rejected分類へ読み替えない。 |
| `CK-K5-UT-107-SCOPE-HEAD-DEDUP` | CK-K5-FN-05/11/18 | K5-I4/I12; IV-K5-09補助 | IV-K5-09 | manifestとscope内headだけを使い、完全一致headを重複させる。scope外headは含めない。 | public `project`はValueを返し、key inputsと`Projection.input_heads`は完全一致headを一件保持する。ScopeDecl外headの扱いはUT-109の局所placeholderであり、本行の正常経路に混ぜない。 |
| `CK-K5-UT-108-STALE-PRIORITY` | CK-K5-FN-08/14 | K5-I5; IV-K5-11補助 | IV-K5-11 | Stale ResultRecordedからkey field欠落を同時に与える既存優先順位fixture。 | private event preflightは`stale_not_recordable`を先に返し、missing-keyへ置き換えない。 |
| `CK-K5-UT-109-SCOPE-OUT-HEAD-UNMAPPED` | CK-K5-FN-11/18 | K5-I4/I12; IV-K5-09補助。L8 coverageではない | IV-K5-09 | UT-107の完全なmanifest/scope入力にScopeDecl外headを一件だけ追加する。 | `_scope_input_heads`は黙って除外せず局所`NotImplementedError` placeholderで止め、reader/writerを呼ばない。L4/L5が外側resultを定めていないため、これは公開result classificationでもL8 coverageでもない。 |
| `CK-K5-UT-110-APPEND-VALIDATOR-EXCEPTION-CONTAINMENT` | CK-K5-FN-02/07/08/14/16 | K5 §9.3/9.5補助。L8 coverageではない | IV-K5-03/11補助 | append validatorではkindがlist、ResultRecorded digest不正、`result_digests=null`/不正digest、SegmentOpenedのsegment欠落またはsegment_noのbool/小数/文字列、Correction target/replacement不正、ResultRecorded body内non-finite値を各々単独で与える。read側ではschema_versionがlist、seqがlist、DeclaredEvent.refs内non-finite数値、およびjson.loadsの再帰上限を超える深いtailを含むraw rowを各々単独で与える。 | append shape validatorはmalformed shapeをfalse、canonicalization exceptionは`_UNMAPPED_APPEND_VALIDATION`へ変換し、private placeholderで止めread/head/append/FixedRef portを呼ばない。read/current_headは`Unknown(unreadable)`と既存I3 evidence `(a)`または`(b)`を返す。decode/canonicalization例外をK5 class/reasonへ写さず、L8 coverage/passには数えない。 |
| `CK-K5-UT-111-APPEND-REASON-SCOPE` | CK-K5-FN-07/08/14 | K5-I5/9.5補助。L8 coverageではない | IV-K5-11補助 | DeclaredEvent + unreadable peer、ResultRecorded + unreadable peer、Stale ResultRecorded + unreadable peerを各々個別に与える。 | K5-I5で理由が固定されたResultRecordedだけ`Rejected(peer_unreadable)`、Staleは`Rejected(stale_not_recordable)`を優先する。別event種別のpeer失敗は局所placeholderに止め、新しいreasonや一般化を作らない。 |
| `CK-K5-UT-112-RESTORE-CLOSED-KEY` | CK-K5-FN-08/10/17/18 | K5-I8/§9.5補助。L8 coverageではない | IV-K5-12/13補助 | complete DeclaredEvent + well-formed ResultRecordedをbaselineとし、保存key未知field、key_digest、result_digest、ResultBody shapeを各々単独変異する。同じprefixを`restore`と`project`へ渡す。 | `restore`は各保存record変異で全体`Unknown(unreadable, evidence=result_body)`。`project`はDeclaredEvent/Correction projectionだけを作り、ResultRecorded bodyを復元せずDeclaredEvent出力を保つ。これはrestore decoderとdomain projectionの責務差であり、L8新oracle/実store接続ではない。 |
| `CK-K5-UT-113-READ-AND-CORRECTION-BRANCHES` | CK-K5-FN-02/03/10/16 | K5-I3/I8補助 | IV-K5-03/08/13補助 | seq=0 headに非genesis digest、foreign segment entry、Correction replacement kindを各々単独で与える。正常側はDeclaredEvent rootから二段のCorrection chainを作る。 | readは各不正prefixを`Unknown(unreadable)`とし、それぞれ既存(g)、(h)、`event_shape` evidenceを保持する。二段の有効Correction chainは末端replacementへ投影する。 |
| `CK-K5-UT-114-APPEND-SCOPE-CHECKS` | CK-K5-FN-04/07/14 | K5-I3/I5/I6/I11補助 | IV-K5-11/21/22補助 | SegmentOpenedのcaller writer違い、宣言`manifest_writer`と固定writerの不一致、開設先log違い、conflict eventのdigest一件、ResultKey必須fieldおよびsubject/input `SubjectRef`のkind/identity/revision/digest各欠落、scope manifest head欠落、未登録scope segment、初回未登録manifest appendを別々に与える。正常append no-opは同key/same digestの既存記録を与える。 | 不適合appendはprivate placeholderで停止しread/write portを呼ばない。ResultKey/SubjectRefの各field欠落は既存`Rejected(missing_key)`を返す。scopeのmanifest/head不足は既存`Unknown(missing_input)`と各既存evidenceを保持する。同じkey/digestは`NoOp`でappendしない。初回manifest bootstrapは成功扱いにせず局所未写像境界のままとする。 |
| `CK-K5-UT-115-CHECKPOINT-BRANCHES` | CK-K5-FN-13/19 | K5-I13補助 | IV-K5-19/20補助 | 完全rebuildをbaselineとし、checkpoint scope、projector、旧head集合包含、同seq digestを各々単独で変える。正例は旧head集合がcurrent集合のsubsetでstate/digestが再構築値と一致する。 | 正例`Value(Projection)`、各不一致は`Unknown(conflict, evidence={checkpoint: mismatch})`。L4はcheckpoint不一致の枝別診断を定めないため、同じ既存evidenceを維持する。 |

K5 fixtureはL8の初期化済みmanifest/assignment前提を守る。K5-22/23でK3/K7 authority・fenceの意味を再実装せず、stubが返したcurrent observationとappend境界の接続だけを扱う。genesis、物理永続性、atomic append、実読、実fenceの合格を示さない。`verify`のcheckpoint比較は完全な再構築値と関数境界の返却を比較し、公開Projectionにないfieldを追加しない。

### 5.1 Canonical codecのgolden vector

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

UT-036〜039はprivate `_canonical_json_bytes`補助関数へ範囲外値を直接与える単体検査である。公開`record`の失敗caseではない。record fixtureはL5 §3.4/L6 §3.1の前提どおり、ownerの宣言encodingに適合したcanonical JSON表現可能なResultBodyを使い、未解決encodingや非JSON生値を公開APIへ渡さない。K1の一般値型Tと、記録時のInline/FixedRef表現を同一視しない。

## 6. K1/K2 Unit suiteの配置と14関数の対応

正式配置候補は`helix/helix-harness/units/common-kernel/tests/`である。L7本文は`docs/`を唯一の検証設計正本とし、各test methodは以下の既存UT IDを識別子として参照する。`test_k1.py`/`test_k2.py`、`unittest`、合成fixture保存場所`fixtures/`は実装時の候補であり、suffix展開、各UTの変異と期待は§3–5の行が正本である。K5 candidate test fileの存在やローカル実行は、他unitのsuiteやL9検証の存在を意味しない。

| L6 function ID | L7 suite ID（§3–5の全行。suffixは各行の展開規則どおり） |
|---|---|
| `CK-K1-FN-01` | `CK-K1-UT-009-KEY-COMBINE-{CLASS}`, `CK-K1-UT-013-{FIELD}-{BOUNDARY}`, `CK-K1-UT-014-KEY-WHOLE`, `CK-K1-UT-014-KEY-{FIELD}` |
| `CK-K1-FN-02` | `CK-K1-UT-001`, `002a/b/c`, `006`, `009-ACCEPT-COMBINE-{CLASS}`, `010-*`, `012-*` |
| `CK-K1-FN-03` | `CK-K1-UT-001`, `002a/b/c`, `003`, `004`, `005a/b`, `006`, `007a/b/c`, `008a/b/c`, `009-ACCEPT-COMBINE-{CLASS}`, `009-KEY-COMBINE-{CLASS}`, `010-*`, `011`, `012-*`, `013-*` |
| `CK-K1-FN-04` | `CK-K1-UT-001`–`005a/b`, `007a/b/c`, `011`, `014-*` |
| `CK-K1-FN-05` | `CK-K1-UT-008-*` |
| `CK-K2-FN-01` | `CK-K2-UT-015-ORDER`, `CK-K2-UT-030`–`039`, `CK-K2-UT-041` |
| `CK-K2-FN-02` | `CK-K2-UT-021`, `CK-K2-UT-030`, `CK-K2-UT-040`–`041` |
| `CK-K2-FN-03` | `CK-K2-UT-008-*`, `013-*` (uppercaseを含む), `014`, `015-*`, `021a` |
| `CK-K2-FN-04` | `CK-K2-UT-021`, `021a/b/d` |
| `CK-K2-FN-05` | `CK-K1-UT-009-LOOKUP-*`, `009-STALE-LOOKUP`, `009-KEY-LOOKUP`; `CK-K2-UT-001`–`010`, `012`, `014`, `016`–`020`, `021d` |
| `CK-K2-FN-06` | `CK-K2-UT-001`, `004`–`005`, `011a/b`, `016`, `019` |
| `CK-K2-FN-07` | `CK-K2-UT-001`–`007`, `010`, `012`, `018`, `020`, `021d` |
| `CK-K2-FN-08` | `CK-K1-UT-009-ACCEPT-RECORD-*`, `009-STALE-RECORD`, `009-KEY-RECORD`; `CK-K2-UT-011a/b/c` |
| `CK-K2-FN-09` | `CK-K2-UT-021`, `021c` (K6 stub boundary only) |

全テスト候補は§3–5および§9のID行から導き、展開suffixを実fixture identityにする。owner/caller/K6境界fixtureはkernel primary callable coverageへ数えない。K1 UT-006/010はcaller/owner stub、UT-012はtest-only word classifierからcombineを呼ぶ境界fixtureである。K2 UT-021aはowner key-input stub、UT-021cはK6 binding/raw-source stubであり、K2 primary APIの実装やproduction K6 readを主張しない。L7のK1 rows 001–014、K2 rows 001–021dおよびcodec vectors 030–041は既存の意味と期待を保持する。pack外の`src/`実装、別test runner、repository root設定は追加しない。K3の194個別UTは§9で既存L8 IDへ一対一対応する。

## 7. 旧source traceと技術差分の記録

K5各fixtureはL6 §7.1の旧asset/path/line/full SHA一覧を起点とし、event追記・projection/checkpoint・full-scope failureの保持点を既存K5 oracleへ再導出する。旧SQLite/CLI/runtime/testや未承認候補をfixture authorityへ移さない。

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
- `CK-K5-UT-001–091`はK5 L8の91個別fixtureをL6 CK-K5-FN-01–20と戻り観測点へ一対一traceする。read/current_head/restore/project/verifyはpublic functionを直接呼ぶ。appendはprivate coreまでで、公開adapterは未実装。storage/FixedRef/current assignment/K3/K7はstubであり、物理reader/writer合格を主張しない。
- `CK-K5-UT-092/093`は既存IV-LDG-01/03のfield-preservationだけをprivate pure assemblyで補助確認する。owner declaration resolution、FixedRef bytes照合、実log read、L9全oracle合格は含まない。
- `CK-K5-UT-094-HEAD-REFS`はkey境界のplaceholder確認で、完全同一head refだけをdedupする。異なるrefを持つ同一identityのK5外側分類はL4/L5で固定されていない。テストはK2診断をK5 resultへ変換せず、公開分岐を未接続として停止する実装状態だけを確認するため、設計coverage/passに数えない。
- `CK-K5-UT-095/096`は`current_head`が物理tail全体を検査し、seq=0行やduplicate sequenceをgenesis/current `Value`へ昇格させないことを補助確認する。期待class/evidenceはK5-I2/I3既存規定を使う。
- `CK-K5-UT-097`は固定headのsegment identityと要求segmentの不一致をK5-I3(g)の指定head不成立として扱う。
- `CK-K5-UT-098`はL4 K5 9.3/9.5の4 classとclass別field/vocabularyを復元時にも検証し、不正recordを`Unknown(unreadable, evidence=result_body)`の既存経路へ送る。appendもFixedRef実読を行わない同じpure shape validatorを事前に使う。
- `CK-K5-UT-099`はScopeDecl/LogDecl/segment identityの不一致を検出するが、既存のK5外側分類が固定されていない分岐を局所placeholderで止めるため、設計coverage/passには数えない。
- `CK-K5-UT-100`は保存ResultKeyをK2 `key_of`で検証し、既存K2 rejectionがprivate decoderからrestoreの既存unreadable経路へ流れることを確認する。
- `CK-K5-UT-101`は型外append key/bodyが既存K5外側reason未定義のためprivate placeholderで停止し、adapter handoffをしない実装境界を補助確認する。L8個別fixtureが期待する`Rejected`を満たさず、設計coverage/passへ数えない。
- `CK-K5-UT-102–111`は閉event variant/read-shape、genesis、SegmentOpenedのowner-bound destination、append shape条件、scope内head dedup、Stale/peer rejection reasonの適用境界、scope外headのplaceholder、validator例外封じ込めを補助確認する。既存K5 API/classificationを越えるowner resolverや物理I/Oは含まない。
- `CK-K5-UT-112–115`は保存ResultKey shapeとrestore/project責務、read/correction branch、append/scope境界、checkpoint枝別の同一既存診断を補助確認する。owner binding、正式bootstrap、L8 coverageは含まない。
- K1のmissing keyは`Rejected(missing_key)`のままとする。variant shapeは型付き入力のpreconditionであり、新しいshape reasonやgateを設計しない。
- IV-LDG-02/04、IV-LDG-01のFixedRef/registration oracle全体はowner/source resolver未接続のため未被覆。補助UT-092/093は純projectionのfield保全だけを確認する。
- K5 recordの順序はsequenceのpreconditionであり、物理writer実装は設計しない。K6 source readはstub境界のままとし、production verifier/readは設計しない。
- UT-018/019/021–032はprivate preflightの未写像sentinelを検査するだけで、L8の公開append拒否結果は未検証でありformal coverageへ数えない。UT-065もcheckpoint state不一致の補助確認に限り、incremental foldのL8 oracle coverageから除外する。
- K5は`test_k5.py`に91 formal IDとUT-092–115の24補助IDを記録する。K5-22/23のowner未接続UT-077–083はskipせずlocal private-boundary assertionを実行するが、owner条件自体をhelperが受け取らないためL7 formal coverageへ含めない。UT-094/099/101/103/105/106/109/110/111/112–115の未接続placeholder確認もL7 formal coverageに含めない。今回のfollow-up実行で実際に確かめたmethod数は検証報告に記録し、これをL9結合oracle、公開append実装、K6 raw source観測、runtime/toolchain間の相互運用性と解釈しない。
- K3は§9.2に194 formal fixtureと26 regression methodの実行記録を限定する。K5の試験実行からK3以外のowner接続やL9合格を推定しない。
- K3は§9で固定L8 oracleを個別fixture IDへtraceする。L5/L8はPR #2751候補の固定commit/content SHAを歴史的source pinとして参照し、現在mainで更新されるL5/L8本文へのcurrent pinとして扱わない。K4/K6–K10は`not_designed`のままであり、現行L4/L9の節はL6 §6を通じて参照する。
- 先行統合確認ではK1/K2既存suite 199件（K1 117、K2 82）、K3 220件（194 formal + 26 regression）、K5 108件（91 formal + 17補助）を実行し、合計527件が成功した。前回追補時点のsuiteは530 method、523 pass・7 skipだった。現在の追補後suiteは534 method（K1/K2 199、K3 220、K5 115）で、実行結果は534 pass・0 skip。K1/K2 coreおよびtest sourceは変更していない。K3/K5の補助・回帰区分は上記各節に保ち、K5の補助placeholder確認はformal coverageへ加算しない。
- L7は設計草稿であり、この単体実行はL9統合oracle、owner/source接続、物理読書き、製品動作または外部作用の証明ではない。K3 194個別fixtureとformal mapping外の26回帰methodの候補実装・実行範囲は§9.2に限る。`invalid_digest`/`duplicate_identity`はK2 `KeyOfResult`だけの境界結果で、K1 `ApiBoundaryResult`や`UnknownReason`への追加ではない。


## 9. K3単体fixture

L8に固定済みの194 caseをL7で一つずつ追跡する。各`CK-K3-UT-NNN`は本節の当該行だけで一意に定義し、括弧展開・実行時suffix生成は行わない。各fixtureは対応するL8 IDの固定された変異と単一期待をそのまま使い、class/reason/key/component/fieldを構造比較する。L9 IDは新規採番せず、K3 L4 invariant traceはL6 §12.1を参照する。L5/L8はPR #2751の固定候補commit/content SHAを参照する。main統合済みの固定設計本文であり、mergeから上流承認・実行合格を生成しない。

| L9 family | 対応L8 case group | stubに渡す固定入力 | 呼ぶ関数・境界 | 観測する返却field | L7で証明しないもの |
|---|---|---|---|---|---|
| `IV-K3-01` | `L8-K3-01-*`全case | typed query、caller expected `input_heads`、current assignment/target/environment/operation/SECURITY declarationの合成owner観測。caseごとにL8指定の軸・scope・owner stateを一つだけ差し替える。 | `resolve_authority_context`、`check_permission`（FN-04/06/10/11） | context resolutionの状態・tuple/owner refs、`PermissionCheck`のdiagnosticまたは`components`/`combined`。 | owner readerの実読、runtime shape拒否分類。 |
| `IV-K3-02` | `L8-K3-02-*` | typed queryとsource adapter stubのmatching permission ref。L8指定のoperationだけを個別に変える。 | `check_permission`（FN-06/11） | `PermissionCheckResult.effective_decision`、operation軸component、`combined`、`authority_effect`。 | 未列挙operation policyや実作用。 |
| `IV-K3-03` | `L8-K3-03-*` | current source/context refs、完全K5 restore列のstub、query revision/digest/identityの各固定record/query pair。 | `check_permission`、K2 `lookup` stub（FN-01/03/11/12） | fresh checkは`components`/`combined`、lookupはK2 `Observed`のclassと`prior`/`recorded_key`/`current_key`等の既存field。 | fresh checkの不一致をlookup `Stale`へ写すこと、K5実読。 |
| `IV-K3-04` | `L8-K3-04-*` | 登録source adapterの合成current prefix、候補permission ref、adapterが返す既存`Observed`。source/issuer/selection各fixtureの差分はL8どおり。 | `resolve_current_effective_decision`、`check_permission`（FN-05/08/11） | `effective_decision`、`components`、`combined`、K6 assurance field。 | signature scheme、selector順、未決reason mapping。 |
| `IV-K3-05` | `L8-K3-05-*` | source decisionと既存constraint setting/precondition/effect observationを別stub inputとして渡す。deny、constraint evidence等は各caseで独立させる。 | `check_permission`（FN-08/09/11） | constraint/effect各`components`のclass/reason/index、`combined`。 | constraint適用の実行、許可から実行成功への変換。 |
| `IV-K3-06` | `L8-K3-06-*` | 同一current permission sourceを固定し、request/ACK/review/CI/check-successの各trigger markerを個別に入力するconsumer stub。 | `check_permission`（FN-11） | `PermissionCheckResult.authority_effect`とdecision source/refが不変であること。 | 新規許可発行や毎task human approvalの実装。 |
| `IV-K3-07` | `L8-K3-07-*` | owner既存expiry契約、固定time observation ref、および期限内/期限切れ/読取不能/解釈不能の各合成状態。 | `check_permission`（FN-08/11） | expiry componentと他component、`combined`。reasonがL8未確定の場合はclassまでを構造比較する。 | TTL/猶予値、expiry parser、時刻reader。 |
| `IV-K3-08` | `L8-K3-08-*` | revocation HeadInputRefsとownerのcurrent prefix stub。revoke、segment missing/unreadable、旧epoch、out-of-scope、G5-onlyを独立入力する。 | `resolve_authority_context`、`check_permission`（FN-04/08/10/11）とK7 consumer stub handoff | context `revocation_heads`、対応component、`combined`。`OLD-EPOCH-ACTION`ではK3 Positive checkと区別して、K7 `admit_effect`境界の`Rejected(fenced)`を別観測する。 | 実reader、実fencing、G5伝播、実停止や再開。 |
| `IV-K3-09` | `L8-K3-09-*` | request/decision/assignment/effective_scope各owner refを持つtyped queryとcurrent context stub。caseごとに一段の一軸だけ変える。 | `resolve_authority_context`、`compare_tuple_axes`（FN-04/06/10） | context tupleの各軸/ref、比較componentのfield、`PermissionCheck`へ進む場合の`combined`。 | 人/workerによる段階実適用。 |
| `IV-K3-10` | `L8-K3-10-*` | SECURITY ownerが宣言するrequired-input identity集合、query refs、PermissionRecord refs。各input/集合fixtureはL8の一差分を保つ。 | `compare_required_operation_inputs`、`check_permission`（FN-07/09/11） | identity別比較component、全component位置、`combined`。 | required-input policyやschemaの生成。 |
| `IV-K3-11` | `L8-K3-11-*` | typed permission query/candidateと、K7 `apply_move`へ渡すだけのconsumer stub引数。target compositionまたはaction kindを単独変更する。 | `check_permission`とK7 handoff（FN-11/12） | K3 `PermissionCheck`の`effective_decision`/`components`/`combined`と、stubが受け取った同じcheck参照。 | pointer/CAS writer、実append。 |
| `IV-K3-12` | `L8-K3-12-*` | K7 consumer stubにpre-check結果、必要時だけpost-check/observation状態を渡す。事前revoke/expiry/driftと事後negative/unknown/missing/null-timeはL8 case別入力。 | `check_permission`およびK7 consumer handoff（FN-11/12） | K3が返す`PermissionCheck` fields。K7 stub envelopeを使うcaseではL9が定める`Rejected`/`AppliedUncertain`/event/unfinished fieldsを受渡し境界で照合し、K3 return fieldと混同しない。 | K7 writer、post-action観測、rollback実行。 |
| `IV-K3-13` | `L8-K3-13-*` | ordered component列、K6 assurance三項目、issuer authenticity状態、合成secret sentinel。各fixtureはL8の単独条件。 | `check_permission`、既存K1 `combine`（FN-09/11） | `components`全量、`combined.verdict`/`set_reason`/non-values、assurance、redacted reasonにsentinelが無いこと。 | issuer真正性の実証やsecret処理runtime。 |
| `IV-K3-14`, `IV-K3-14a–j` | `L8-K3-14-*`全case | current resolverの固定mapping bytes、binding ref、各role aliasとraw source bytes/digest、query ref、K5 restore列。各枝番ではL8で指定するbinding/alias/query/raw-byteの一要素だけを変更する。 | `resolve_owner_mapping`、`construct_k3_key_inputs`、K2 `key_of`/`lookup`、K6 read stub（FN-02/03/12） | K3 alias/binding構成、K2 `KeyOfResult`またはK2 `Observed`、K6 stubが受けたbinding/raw bytesと対応alias identity。14a/bの既存key前拒否は`Rejected(missing_key)`。`CALLER-BINDING-REJECTED`は公開signatureにmapping引数がない構造確認のみで、K1/K2診断やresult classを期待しない。`EXTRA-RAW-READ`はK6 stubの`Unknown(conflict)`を観測する。 | K6実読、K3へのK2専用拒否変換。 |
| `IV-K3-15` | `L8-K3-15-*` | operation versionまたはcurrent declaration/ref集合、保存済check keyの完全record列。各refはrole別に一つずつstubし、個別変異はL8どおり。 | `construct_k3_key_inputs`、K2 `lookup` stub（FN-03/04/12） | current `ResultKey.inputs`のidentity集合とK2 `Observed` class/既存key fields。 | 実owner宣言の全量性や永続store。 |
| `IV-K3-16` | `L8-K3-16-*` | time-observation ref、取消しsegment HeadInputRefs、owner current headsとcaller expected heads。raw時刻やSegmentHead自体はkey inputにしない。 | `resolve_authority_context`、K2 `lookup` stub（FN-03/04/10/12） | `AuthorityContext.observed_at`参照/`revocation_heads`、key inputs、caller/current driftの既存non-Positive check fields。 | K5 head readerやdrift reasonの未定義mapping。 |
| `IV-K3-17` | `L8-K3-17-*` | K7 recovery consumer stubへ渡すK3 check refと、move/segment/sequence/restart control-flow用の合成入力。各回復反例はL8 caseの単独条件。 | `check_permission` consumer handoff（FN-11/12） | K3 checkの`authority_effect`/`components`/`combined`とK7 stubが受領した同一ref。K7回復出力はL9側のowner結果として区別する。 | K7 recovery実装、append、移動、自動rollback。 |

このfamily表はL8の期待値を複製しない。各期待class/reason/valueとcase固有の条件は、下の194行が指すL8 fixture IDを正本とする。stubは既存owner/consumerの合成境界であり、production reader/adapter/store/writerを表さない。

| UT ID | L6 function trace | L9 oracle | 対応L8 fixture ID | 期待値参照・境界 |
|---|---|---|---|---|
| `CK-K3-UT-001` | `CK-K3-FN-04/FN-06/FN-10/FN-11` | `IV-K3-01` | `L8-K3-01-BASE` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-002` | `CK-K3-FN-04/FN-06/FN-10/FN-11` | `IV-K3-01` | `L8-K3-01-actor-MISSING` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-003` | `CK-K3-FN-04/FN-06/FN-10/FN-11` | `IV-K3-01` | `L8-K3-01-actor-UNKNOWN` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-004` | `CK-K3-FN-04/FN-06/FN-10/FN-11` | `IV-K3-01` | `L8-K3-01-actor-CONFLICT` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-005` | `CK-K3-FN-04/FN-06/FN-10/FN-11` | `IV-K3-01` | `L8-K3-01-actor-MISMATCH` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-006` | `CK-K3-FN-04/FN-06/FN-10/FN-11` | `IV-K3-01` | `L8-K3-01-target-MISSING` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-007` | `CK-K3-FN-04/FN-06/FN-10/FN-11` | `IV-K3-01` | `L8-K3-01-target-UNKNOWN` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-008` | `CK-K3-FN-04/FN-06/FN-10/FN-11` | `IV-K3-01` | `L8-K3-01-target-CONFLICT` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-009` | `CK-K3-FN-04/FN-06/FN-10/FN-11` | `IV-K3-01` | `L8-K3-01-target-MISMATCH` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-010` | `CK-K3-FN-04/FN-06/FN-10/FN-11` | `IV-K3-01` | `L8-K3-01-operation-MISSING` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-011` | `CK-K3-FN-04/FN-06/FN-10/FN-11` | `IV-K3-01` | `L8-K3-01-operation-UNKNOWN` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-012` | `CK-K3-FN-04/FN-06/FN-10/FN-11` | `IV-K3-01` | `L8-K3-01-operation-CONFLICT` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-013` | `CK-K3-FN-04/FN-06/FN-10/FN-11` | `IV-K3-01` | `L8-K3-01-operation-MISMATCH` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-014` | `CK-K3-FN-04/FN-06/FN-10/FN-11` | `IV-K3-01` | `L8-K3-01-revision-MISSING` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-015` | `CK-K3-FN-04/FN-06/FN-10/FN-11` | `IV-K3-01` | `L8-K3-01-revision-UNKNOWN` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-016` | `CK-K3-FN-04/FN-06/FN-10/FN-11` | `IV-K3-01` | `L8-K3-01-revision-CONFLICT` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-017` | `CK-K3-FN-04/FN-06/FN-10/FN-11` | `IV-K3-01` | `L8-K3-01-revision-MISMATCH` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-018` | `CK-K3-FN-04/FN-06/FN-10/FN-11` | `IV-K3-01` | `L8-K3-01-environment-MISSING` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-019` | `CK-K3-FN-04/FN-06/FN-10/FN-11` | `IV-K3-01` | `L8-K3-01-environment-UNKNOWN` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-020` | `CK-K3-FN-04/FN-06/FN-10/FN-11` | `IV-K3-01` | `L8-K3-01-environment-CONFLICT` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-021` | `CK-K3-FN-04/FN-06/FN-10/FN-11` | `IV-K3-01` | `L8-K3-01-environment-MISMATCH` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-022` | `CK-K3-FN-04/FN-06/FN-10/FN-11` | `IV-K3-01` | `L8-K3-01-scope-MISSING` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-023` | `CK-K3-FN-04/FN-06/FN-10/FN-11` | `IV-K3-01` | `L8-K3-01-scope-UNKNOWN` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-024` | `CK-K3-FN-04/FN-06/FN-10/FN-11` | `IV-K3-01` | `L8-K3-01-scope-CONFLICT` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-025` | `CK-K3-FN-04/FN-06/FN-10/FN-11` | `IV-K3-01` | `L8-K3-01-scope-MISMATCH` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-026` | `CK-K3-FN-04/FN-06/FN-10/FN-11` | `IV-K3-01` | `L8-K3-01-expiry-MISSING` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-027` | `CK-K3-FN-04/FN-06/FN-10/FN-11` | `IV-K3-01` | `L8-K3-01-expiry-UNKNOWN` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-028` | `CK-K3-FN-04/FN-06/FN-10/FN-11` | `IV-K3-01` | `L8-K3-01-expiry-CONFLICT` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-029` | `CK-K3-FN-04/FN-06/FN-10/FN-11` | `IV-K3-01` | `L8-K3-01-expiry-MISMATCH` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-030` | `CK-K3-FN-04/FN-06/FN-10/FN-11` | `IV-K3-01` | `L8-K3-01-SCOPE-PROJECT` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-031` | `CK-K3-FN-04/FN-06/FN-10/FN-11` | `IV-K3-01` | `L8-K3-01-SCOPE-ENVIRONMENT` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-032` | `CK-K3-FN-04/FN-06/FN-10/FN-11` | `IV-K3-01` | `L8-K3-01-SCOPE-WORKTREE` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-033` | `CK-K3-FN-04/FN-06/FN-10/FN-11` | `IV-K3-01` | `L8-K3-01-SCOPE-TENANT` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-034` | `CK-K3-FN-04/FN-06/FN-10/FN-11` | `IV-K3-01` | `L8-K3-01-OWNER-MISSING` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-035` | `CK-K3-FN-04/FN-06/FN-10/FN-11` | `IV-K3-01` | `L8-K3-01-OWNER-UNREGISTERED` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-036` | `CK-K3-FN-04/FN-06/FN-10/FN-11` | `IV-K3-01` | `L8-K3-01-OWNER-CONFLICT` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-037` | `CK-K3-FN-04/FN-06/FN-10/FN-11` | `IV-K3-01` | `L8-K3-01-ASSIGNMENT` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-038` | `CK-K3-FN-04/FN-06/FN-10/FN-11` | `IV-K3-01` | `L8-K3-01-KEY-MISSING` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-039` | `CK-K3-FN-06/FN-11` | `IV-K3-02` | `L8-K3-02-ALLOW-read` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-040` | `CK-K3-FN-06/FN-11` | `IV-K3-02` | `L8-K3-02-ALLOW-write` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-041` | `CK-K3-FN-06/FN-11` | `IV-K3-02` | `L8-K3-02-ALLOW-execute` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-042` | `CK-K3-FN-06/FN-11` | `IV-K3-02` | `L8-K3-02-ALLOW-network` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-043` | `CK-K3-FN-06/FN-11` | `IV-K3-02` | `L8-K3-02-ALLOW-install` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-044` | `CK-K3-FN-06/FN-11` | `IV-K3-02` | `L8-K3-02-ALLOW-delete` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-045` | `CK-K3-FN-06/FN-11` | `IV-K3-02` | `L8-K3-02-ALLOW-merge` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-046` | `CK-K3-FN-06/FN-11` | `IV-K3-02` | `L8-K3-02-ALLOW-release` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-047` | `CK-K3-FN-06/FN-11` | `IV-K3-02` | `L8-K3-02-ALLOW-deploy` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-048` | `CK-K3-FN-06/FN-11` | `IV-K3-02` | `L8-K3-02-ALLOW-credential-use` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-049` | `CK-K3-FN-06/FN-11` | `IV-K3-02` | `L8-K3-02-ALLOW-security-change` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-050` | `CK-K3-FN-06/FN-11` | `IV-K3-02` | `L8-K3-02-READ-AS-write` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-051` | `CK-K3-FN-06/FN-11` | `IV-K3-02` | `L8-K3-02-READ-AS-execute` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-052` | `CK-K3-FN-06/FN-11` | `IV-K3-02` | `L8-K3-02-READ-AS-network` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-053` | `CK-K3-FN-06/FN-11` | `IV-K3-02` | `L8-K3-02-READ-AS-install` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-054` | `CK-K3-FN-06/FN-11` | `IV-K3-02` | `L8-K3-02-READ-AS-delete` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-055` | `CK-K3-FN-06/FN-11` | `IV-K3-02` | `L8-K3-02-READ-AS-merge` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-056` | `CK-K3-FN-06/FN-11` | `IV-K3-02` | `L8-K3-02-READ-AS-release` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-057` | `CK-K3-FN-06/FN-11` | `IV-K3-02` | `L8-K3-02-READ-AS-deploy` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-058` | `CK-K3-FN-06/FN-11` | `IV-K3-02` | `L8-K3-02-READ-AS-credential-use` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-059` | `CK-K3-FN-06/FN-11` | `IV-K3-02` | `L8-K3-02-READ-AS-security-change` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-060` | `CK-K3-FN-01/FN-03/FN-11/FN-12` | `IV-K3-03` | `L8-K3-03-FRESH-REVISION` | 対応するL8行の固定入力と期待class/reason/全fieldを構造比較する。K5/K6/K7はstub境界に留める。変異条件と期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-061` | `CK-K3-FN-01/FN-03/FN-11/FN-12` | `IV-K3-03` | `L8-K3-03-LOOKUP-STALE` | 対応するL8行の固定入力と期待class/reason/全fieldを構造比較する。K5/K6/K7はstub境界に留める。変異条件と期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-062` | `CK-K3-FN-01/FN-03/FN-11/FN-12` | `IV-K3-03` | `L8-K3-03-DIGEST` | 対応するL8行の固定入力と期待class/reason/全fieldを構造比較する。K5/K6/K7はstub境界に留める。変異条件と期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-063` | `CK-K3-FN-01/FN-03/FN-11/FN-12` | `IV-K3-03` | `L8-K3-03-IDENTITY` | 対応するL8行の固定入力と期待class/reason/全fieldを構造比較する。K5/K6/K7はstub境界に留める。変異条件と期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-064` | `CK-K3-FN-05/FN-08/FN-11` | `IV-K3-04` | `L8-K3-04-SELF-ISSUED` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-065` | `CK-K3-FN-05/FN-08/FN-11` | `IV-K3-04` | `L8-K3-04-UNREGISTERED-SOURCE` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-066` | `CK-K3-FN-05/FN-08/FN-11` | `IV-K3-04` | `L8-K3-04-SAME-NAME-DIFFERENT-SOURCE` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-067` | `CK-K3-FN-05/FN-08/FN-11` | `IV-K3-04` | `L8-K3-04-ISSUER-MISMATCH` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-068` | `CK-K3-FN-05/FN-08/FN-11` | `IV-K3-04` | `L8-K3-04-SIGNATURE-INVALID` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-069` | `CK-K3-FN-05/FN-08/FN-11` | `IV-K3-04` | `L8-K3-04-SIGNATURE-UNVERIFIABLE` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-070` | `CK-K3-FN-05/FN-08/FN-11` | `IV-K3-04` | `L8-K3-04-CURRENT-DENY` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-071` | `CK-K3-FN-05/FN-08/FN-11` | `IV-K3-04` | `L8-K3-04-CURRENT-CONSTRAIN` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-072` | `CK-K3-FN-05/FN-08/FN-11` | `IV-K3-04` | `L8-K3-04-SELECTION-UNKNOWN-RULE` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-073` | `CK-K3-FN-05/FN-08/FN-11` | `IV-K3-04` | `L8-K3-04-SELECTION-CONFLICTING-CANDIDATES` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-074` | `CK-K3-FN-05/FN-08/FN-11` | `IV-K3-04` | `L8-K3-04-RECEIPT-SUBSTITUTE` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-075` | `CK-K3-FN-08/FN-09/FN-11` | `IV-K3-05` | `L8-K3-05-DENY` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-076` | `CK-K3-FN-08/FN-09/FN-11` | `IV-K3-05` | `L8-K3-05-CONSTRAINT-SETTING-MISSING` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-077` | `CK-K3-FN-08/FN-09/FN-11` | `IV-K3-05` | `L8-K3-05-PRECONDITION-UNOBSERVED` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-078` | `CK-K3-FN-08/FN-09/FN-11` | `IV-K3-05` | `L8-K3-05-CONSTRAINT-EVIDENCE-MISSING` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-079` | `CK-K3-FN-08/FN-09/FN-11` | `IV-K3-05` | `L8-K3-05-CONSTRAINT-RELAXED` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-080` | `CK-K3-FN-08/FN-09/FN-11` | `IV-K3-06` | `L8-K3-06-REQUEST` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-081` | `CK-K3-FN-08/FN-09/FN-11` | `IV-K3-06` | `L8-K3-06-ACK` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-082` | `CK-K3-FN-08/FN-09/FN-11` | `IV-K3-06` | `L8-K3-06-REVIEW` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-083` | `CK-K3-FN-08/FN-09/FN-11` | `IV-K3-06` | `L8-K3-06-CI-GREEN` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-084` | `CK-K3-FN-08/FN-09/FN-11` | `IV-K3-06` | `L8-K3-06-CHECK-SUCCESS` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-085` | `CK-K3-FN-08/FN-11` | `IV-K3-07` | `L8-K3-07-EXPIRED` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-086` | `CK-K3-FN-08/FN-11` | `IV-K3-07` | `L8-K3-07-TIME-UNREADABLE` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-087` | `CK-K3-FN-08/FN-11` | `IV-K3-07` | `L8-K3-07-EXPIRY-UNPARSABLE` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-088` | `CK-K3-FN-08/FN-11` | `IV-K3-08` | `L8-K3-08-REVOKED` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-089` | `CK-K3-FN-08/FN-11` | `IV-K3-08` | `L8-K3-08-SEGMENT-MISSING` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-090` | `CK-K3-FN-08/FN-11` | `IV-K3-08` | `L8-K3-08-SEGMENT-UNREADABLE` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-091` | `CK-K3-FN-08/FN-11` | `IV-K3-08` | `L8-K3-08-OLD-EPOCH-ACTION` | K3 checkは`Value(Positive)`を保持し、同じcheck refを受け取るK7 `admit_effect` stub境界では`Rejected(fenced)`を別期待として照合する。K7拒否をK3 returnへ帰属させない。 |
| `CK-K3-UT-092` | `CK-K3-FN-08/FN-11` | `IV-K3-08` | `L8-K3-08-OUT-OF-SCOPE-STOP` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-093` | `CK-K3-FN-08/FN-11` | `IV-K3-08` | `L8-K3-08-G5-ONLY` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-094` | `CK-K3-FN-04/FN-06/FN-10` | `IV-K3-09` | `L8-K3-09-BASE` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-095` | `CK-K3-FN-04/FN-06/FN-10` | `IV-K3-09` | `L8-K3-09-request-actor` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-096` | `CK-K3-FN-04/FN-06/FN-10` | `IV-K3-09` | `L8-K3-09-request-target` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-097` | `CK-K3-FN-04/FN-06/FN-10` | `IV-K3-09` | `L8-K3-09-request-operation` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-098` | `CK-K3-FN-04/FN-06/FN-10` | `IV-K3-09` | `L8-K3-09-request-revision` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-099` | `CK-K3-FN-04/FN-06/FN-10` | `IV-K3-09` | `L8-K3-09-request-environment` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-100` | `CK-K3-FN-04/FN-06/FN-10` | `IV-K3-09` | `L8-K3-09-request-scope` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-101` | `CK-K3-FN-04/FN-06/FN-10` | `IV-K3-09` | `L8-K3-09-request-expiry` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-102` | `CK-K3-FN-04/FN-06/FN-10` | `IV-K3-09` | `L8-K3-09-decision-actor` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-103` | `CK-K3-FN-04/FN-06/FN-10` | `IV-K3-09` | `L8-K3-09-decision-target` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-104` | `CK-K3-FN-04/FN-06/FN-10` | `IV-K3-09` | `L8-K3-09-decision-operation` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-105` | `CK-K3-FN-04/FN-06/FN-10` | `IV-K3-09` | `L8-K3-09-decision-revision` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-106` | `CK-K3-FN-04/FN-06/FN-10` | `IV-K3-09` | `L8-K3-09-decision-environment` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-107` | `CK-K3-FN-04/FN-06/FN-10` | `IV-K3-09` | `L8-K3-09-decision-scope` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-108` | `CK-K3-FN-04/FN-06/FN-10` | `IV-K3-09` | `L8-K3-09-decision-expiry` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-109` | `CK-K3-FN-04/FN-06/FN-10` | `IV-K3-09` | `L8-K3-09-assignment-actor` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-110` | `CK-K3-FN-04/FN-06/FN-10` | `IV-K3-09` | `L8-K3-09-assignment-target` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-111` | `CK-K3-FN-04/FN-06/FN-10` | `IV-K3-09` | `L8-K3-09-assignment-operation` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-112` | `CK-K3-FN-04/FN-06/FN-10` | `IV-K3-09` | `L8-K3-09-assignment-revision` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-113` | `CK-K3-FN-04/FN-06/FN-10` | `IV-K3-09` | `L8-K3-09-assignment-environment` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-114` | `CK-K3-FN-04/FN-06/FN-10` | `IV-K3-09` | `L8-K3-09-assignment-scope` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-115` | `CK-K3-FN-04/FN-06/FN-10` | `IV-K3-09` | `L8-K3-09-assignment-expiry` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-116` | `CK-K3-FN-04/FN-06/FN-10` | `IV-K3-09` | `L8-K3-09-effective_scope-actor` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-117` | `CK-K3-FN-04/FN-06/FN-10` | `IV-K3-09` | `L8-K3-09-effective_scope-target` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-118` | `CK-K3-FN-04/FN-06/FN-10` | `IV-K3-09` | `L8-K3-09-effective_scope-operation` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-119` | `CK-K3-FN-04/FN-06/FN-10` | `IV-K3-09` | `L8-K3-09-effective_scope-revision` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-120` | `CK-K3-FN-04/FN-06/FN-10` | `IV-K3-09` | `L8-K3-09-effective_scope-environment` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-121` | `CK-K3-FN-04/FN-06/FN-10` | `IV-K3-09` | `L8-K3-09-effective_scope-scope` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-122` | `CK-K3-FN-04/FN-06/FN-10` | `IV-K3-09` | `L8-K3-09-effective_scope-expiry` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-123` | `CK-K3-FN-07/FN-09/FN-11` | `IV-K3-10` | `L8-K3-10-purpose` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-124` | `CK-K3-FN-07/FN-09/FN-11` | `IV-K3-10` | `L8-K3-10-classification` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-125` | `CK-K3-FN-07/FN-09/FN-11` | `IV-K3-10` | `L8-K3-10-source` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-126` | `CK-K3-FN-07/FN-09/FN-11` | `IV-K3-10` | `L8-K3-10-destination` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-127` | `CK-K3-FN-07/FN-09/FN-11` | `IV-K3-10` | `L8-K3-10-REQUIRED-KEY-MISSING` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-128` | `CK-K3-FN-07/FN-09/FN-11` | `IV-K3-10` | `L8-K3-10-EXTRA-KEY` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-129` | `CK-K3-FN-07/FN-09/FN-11` | `IV-K3-10` | `L8-K3-10-RECORD-BINDING-MISMATCH` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-130` | `CK-K3-FN-11/FN-12` | `IV-K3-11` | `L8-K3-11-TARGET-COMPOSITION` | 対応するL8行の固定入力と期待class/reason/全fieldを構造比較する。K5/K6/K7はstub境界に留める。変異条件と期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-131` | `CK-K3-FN-11/FN-12` | `IV-K3-11` | `L8-K3-11-MOVE-ACTION-KIND` | 対応するL8行の固定入力と期待class/reason/全fieldを構造比較する。K5/K6/K7はstub境界に留める。変異条件と期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-132` | `CK-K3-FN-11/FN-12` | `IV-K3-12` | `L8-K3-12-PRE-REVOKED` | 対応するL8行の固定入力と期待class/reason/全fieldを構造比較する。K5/K6/K7はstub境界に留める。変異条件と期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-133` | `CK-K3-FN-11/FN-12` | `IV-K3-12` | `L8-K3-12-PRE-EXPIRED` | 対応するL8行の固定入力と期待class/reason/全fieldを構造比較する。K5/K6/K7はstub境界に留める。変異条件と期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-134` | `CK-K3-FN-11/FN-12` | `IV-K3-12` | `L8-K3-12-PRE-DRIFT` | 対応するL8行の固定入力と期待class/reason/全fieldを構造比較する。K5/K6/K7はstub境界に留める。変異条件と期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-135` | `CK-K3-FN-11/FN-12` | `IV-K3-12` | `L8-K3-12-POST-NEGATIVE` | 対応するL8行の固定入力と期待class/reason/全fieldを構造比較する。K5/K6/K7はstub境界に留める。変異条件と期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-136` | `CK-K3-FN-11/FN-12` | `IV-K3-12` | `L8-K3-12-POST-UNKNOWN` | 対応するL8行の固定入力と期待class/reason/全fieldを構造比較する。K5/K6/K7はstub境界に留める。変異条件と期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-137` | `CK-K3-FN-11/FN-12` | `IV-K3-12` | `L8-K3-12-POST-OBSERVATION-MISSING` | 対応するL8行の固定入力と期待class/reason/全fieldを構造比較する。K5/K6/K7はstub境界に留める。変異条件と期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-138` | `CK-K3-FN-11/FN-12` | `IV-K3-12` | `L8-K3-12-POST-OBSERVED-AT-NULL` | 対応するL8行の固定入力と期待class/reason/全fieldを構造比較する。K5/K6/K7はstub境界に留める。変異条件と期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-139` | `CK-K3-FN-09/FN-11` | `IV-K3-13` | `L8-K3-13-DENY-DROPS-UNKNOWN` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-140` | `CK-K3-FN-09/FN-11` | `IV-K3-13` | `L8-K3-13-EMPTY-TRUTH` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-141` | `CK-K3-FN-09/FN-11` | `IV-K3-13` | `L8-K3-13-ISSUER-UNPROVEN` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-142` | `CK-K3-FN-09/FN-11` | `IV-K3-13` | `L8-K3-13-SECRET-IN-REASON` | 当該L8行の固定入力・期待class/reason/全fieldを構造比較。変異条件・期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-143` | `CK-K3-FN-02/FN-03/FN-12` | `IV-K3-14` | `L8-K3-14-BASE` | 対応するL8行の固定入力と期待class/reason/全fieldを構造比較する。K5/K6/K7はstub境界に留める。変異条件と期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-144` | `CK-K3-FN-02/FN-03/FN-12` | `IV-K3-14a` | `L8-K3-14a` | 対応するL8行の固定入力と期待class/reason/全fieldを構造比較する。K5/K6/K7はstub境界に留める。変異条件と期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-145` | `CK-K3-FN-02/FN-03/FN-12` | `IV-K3-14b` | `L8-K3-14b` | 対応するL8行の固定入力と期待class/reason/全fieldを構造比較する。K5/K6/K7はstub境界に留める。変異条件と期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-146` | `CK-K3-FN-02/FN-03/FN-12` | `IV-K3-14c` | `L8-K3-14c` | 対応するL8行の固定入力と期待class/reason/全fieldを構造比較する。K5/K6/K7はstub境界に留める。変異条件と期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-147` | `CK-K3-FN-02/FN-03/FN-12` | `IV-K3-14d` | `L8-K3-14d` | 対応するL8行の固定入力と期待class/reason/全fieldを構造比較する。K5/K6/K7はstub境界に留める。変異条件と期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-148` | `CK-K3-FN-02/FN-03/FN-12` | `IV-K3-14e` | `L8-K3-14e` | 対応するL8行の固定入力と期待class/reason/全fieldを構造比較する。K5/K6/K7はstub境界に留める。変異条件と期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-149` | `CK-K3-FN-02/FN-03/FN-12` | `IV-K3-14f` | `L8-K3-14f` | 対応するL8行の固定入力と期待class/reason/全fieldを構造比較する。K5/K6/K7はstub境界に留める。変異条件と期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-150` | `CK-K3-FN-02/FN-03/FN-12` | `IV-K3-14g` | `L8-K3-14g` | 対応するL8行の固定入力と期待class/reason/全fieldを構造比較する。K5/K6/K7はstub境界に留める。変異条件と期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-151` | `CK-K3-FN-02/FN-03/FN-12` | `IV-K3-14h` | `L8-K3-14h` | 対応するL8行の固定入力と期待class/reason/全fieldを構造比較する。K5/K6/K7はstub境界に留める。変異条件と期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-152` | `CK-K3-FN-02/FN-03/FN-12` | `IV-K3-14i` | `L8-K3-14i` | 対応するL8行の固定入力と期待class/reason/全fieldを構造比較する。K5/K6/K7はstub境界に留める。変異条件と期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-153` | `CK-K3-FN-02/FN-03/FN-12` | `IV-K3-14j` | `L8-K3-14j` | 対応するL8行の固定入力と期待class/reason/全fieldを構造比較する。K5/K6/K7はstub境界に留める。変異条件と期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-154` | `CK-K3-FN-03/FN-04/FN-12` | `IV-K3-15` | `L8-K3-15-OPERATION-VERSION` | 対応するL8行の固定入力と期待class/reason/全fieldを構造比較する。K5/K6/K7はstub境界に留める。変異条件と期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-155` | `CK-K3-FN-03/FN-04/FN-12` | `IV-K3-15` | `L8-K3-15-K3-CODE` | 対応するL8行の固定入力と期待class/reason/全fieldを構造比較する。K5/K6/K7はstub境界に留める。変異条件と期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-156` | `CK-K3-FN-03/FN-04/FN-12` | `IV-K3-15` | `L8-K3-15-K3-CONFIG` | 対応するL8行の固定入力と期待class/reason/全fieldを構造比較する。K5/K6/K7はstub境界に留める。変異条件と期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-157` | `CK-K3-FN-03/FN-04/FN-12` | `IV-K3-15` | `L8-K3-15-CURRENT-ASSIGNMENT` | 対応するL8行の固定入力と期待class/reason/全fieldを構造比較する。K5/K6/K7はstub境界に留める。変異条件と期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-158` | `CK-K3-FN-03/FN-04/FN-12` | `IV-K3-15` | `L8-K3-15-TARGET-DECL` | 対応するL8行の固定入力と期待class/reason/全fieldを構造比較する。K5/K6/K7はstub境界に留める。変異条件と期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-159` | `CK-K3-FN-03/FN-04/FN-12` | `IV-K3-15` | `L8-K3-15-ENVIRONMENT-DECL` | 対応するL8行の固定入力と期待class/reason/全fieldを構造比較する。K5/K6/K7はstub境界に留める。変異条件と期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-160` | `CK-K3-FN-03/FN-04/FN-12` | `IV-K3-15` | `L8-K3-15-OWNER-DECL` | 対応するL8行の固定入力と期待class/reason/全fieldを構造比較する。K5/K6/K7はstub境界に留める。変異条件と期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-161` | `CK-K3-FN-03/FN-04/FN-12` | `IV-K3-15` | `L8-K3-15-OPERATION-DECL` | 対応するL8行の固定入力と期待class/reason/全fieldを構造比較する。K5/K6/K7はstub境界に留める。変異条件と期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-162` | `CK-K3-FN-03/FN-04/FN-12` | `IV-K3-15` | `L8-K3-15-AUTHORITY-DECL` | 対応するL8行の固定入力と期待class/reason/全fieldを構造比較する。K5/K6/K7はstub境界に留める。変異条件と期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-163` | `CK-K3-FN-03/FN-04/FN-12` | `IV-K3-15` | `L8-K3-15-POLICY` | 対応するL8行の固定入力と期待class/reason/全fieldを構造比較する。K5/K6/K7はstub境界に留める。変異条件と期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-164` | `CK-K3-FN-03/FN-04/FN-12` | `IV-K3-15` | `L8-K3-15-SOURCE-CURRENT-REF` | 対応するL8行の固定入力と期待class/reason/全fieldを構造比較する。K5/K6/K7はstub境界に留める。変異条件と期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-165` | `CK-K3-FN-03/FN-04/FN-12` | `IV-K3-15` | `L8-K3-15-ADAPTER` | 対応するL8行の固定入力と期待class/reason/全fieldを構造比較する。K5/K6/K7はstub境界に留める。変異条件と期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-166` | `CK-K3-FN-03/FN-04/FN-12` | `IV-K3-16` | `L8-K3-16-TIME-OBSERVATION-REF` | 対応するL8行の固定入力と期待class/reason/全fieldを構造比較する。K5/K6/K7はstub境界に留める。変異条件と期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-167` | `CK-K3-FN-03/FN-04/FN-12` | `IV-K3-16` | `L8-K3-16-REVOCATION-HEAD-A` | 対応するL8行の固定入力と期待class/reason/全fieldを構造比較する。K5/K6/K7はstub境界に留める。変異条件と期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-168` | `CK-K3-FN-03/FN-04/FN-12` | `IV-K3-16` | `L8-K3-16-REVOCATION-HEAD-B` | 対応するL8行の固定入力と期待class/reason/全fieldを構造比較する。K5/K6/K7はstub境界に留める。変異条件と期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-169` | `CK-K3-FN-03/FN-04/FN-12` | `IV-K3-16` | `L8-K3-16-CALLER-HEAD-DRIFT` | 対応するL8行の固定入力と期待class/reason/全fieldを構造比較する。K5/K6/K7はstub境界に留める。変異条件と期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-170` | `CK-K3-FN-11/FN-12` | `IV-K3-17` | `L8-K3-17-RECOVERY-POSTSTOP` | 対応するL8行の固定入力と期待class/reason/全fieldを構造比較する。K5/K6/K7はstub境界に留める。変異条件と期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-171` | `CK-K3-FN-11/FN-12` | `IV-K3-17` | `L8-K3-17-RECOVERY-AFTER-LATER-MOVE` | 対応するL8行の固定入力と期待class/reason/全fieldを構造比較する。K5/K6/K7はstub境界に留める。変異条件と期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-172` | `CK-K3-FN-11/FN-12` | `IV-K3-17` | `L8-K3-17-RECOVERY-WRONG-SEGMENT` | 対応するL8行の固定入力と期待class/reason/全fieldを構造比較する。K5/K6/K7はstub境界に留める。変異条件と期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-173` | `CK-K3-FN-11/FN-12` | `IV-K3-17` | `L8-K3-17-RECOVERY-WRONG-MOVE` | 対応するL8行の固定入力と期待class/reason/全fieldを構造比較する。K5/K6/K7はstub境界に留める。変異条件と期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-174` | `CK-K3-FN-11/FN-12` | `IV-K3-17` | `L8-K3-17-RECOVERY-SEQ-PLUS-ONE` | 対応するL8行の固定入力と期待class/reason/全fieldを構造比較する。K5/K6/K7はstub境界に留める。変異条件と期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-175` | `CK-K3-FN-11/FN-12` | `IV-K3-17` | `L8-K3-17-RECOVERY-NOT-A-MOVE` | 対応するL8行の固定入力と期待class/reason/全fieldを構造比較する。K5/K6/K7はstub境界に留める。変異条件と期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-176` | `CK-K3-FN-11/FN-12` | `IV-K3-17` | `L8-K3-17-RECOVERY-ALREADY-IMMEDIATE` | 対応するL8行の固定入力と期待class/reason/全fieldを構造比較する。K5/K6/K7はstub境界に留める。変異条件と期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-177` | `CK-K3-FN-11/FN-12` | `IV-K3-17` | `L8-K3-17-RECOVERY-AUTO-MOVE` | 対応するL8行の固定入力と期待class/reason/全fieldを構造比較する。K5/K6/K7はstub境界に留める。変異条件と期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-178` | `CK-K3-FN-11/FN-12` | `IV-K3-17` | `L8-K3-17-RECOVERY-RESTART-CONTROL-FLOW` | 対応するL8行の固定入力と期待class/reason/全fieldを構造比較する。K5/K6/K7はstub境界に留める。変異条件と期待値の正本は固定したL8 fixture ID。 |
| `CK-K3-UT-179` | `CK-K3-FN-01/FN-06/FN-11` | `IV-K3-03` | `L8-K3-03-BASE` | current sourceとPermissionRecordのrevisionが一致するfresh checkの`Value(Positive)`と全fieldを比較する。 K5/K6/K7の実動作はstub境界とし、期待class/reasonは固定L8行に従う。 |
| `CK-K3-UT-180` | `CK-K3-FN-02/FN-05/FN-11` | `IV-K3-04` | `L8-K3-04-BASE` | 登録source adapterの基準current decisionを用い、L8が定めるPositive結果と全fieldを比較する。 K5/K6/K7の実動作はstub境界とし、L8候補の期待class/reasonを独立に増やさない。 |
| `CK-K3-UT-181` | `CK-K3-FN-05/FN-08/FN-11` | `IV-K3-05` | `L8-K3-05-BASE` | 既存制約と前提証拠が揃う基準でPositive checkと全componentを比較する。 K5/K6/K7の実動作はstub境界とし、L8候補の期待class/reasonを独立に増やさない。 |
| `CK-K3-UT-182` | `CK-K3-FN-05/FN-11` | `IV-K3-06` | `L8-K3-06-BASE` | current許可を再利用する基準でPositive check、source不変、authority_effect=noneを比較する。 K5/K6/K7の実動作はstub境界とし、L8候補の期待class/reasonを独立に増やさない。 |
| `CK-K3-UT-183` | `CK-K3-FN-08/FN-11` | `IV-K3-07` | `L8-K3-07-BASE` | 期限内のcurrent expiry/time観測でPositive checkとexpiry componentを比較する。 K5/K6/K7の実動作はstub境界とし、L8候補の期待class/reasonを独立に増やさない。 |
| `CK-K3-UT-184` | `CK-K3-FN-04/FN-08/FN-10/FN-11` | `IV-K3-08` | `L8-K3-08-BASE` | revokeなしのcurrent prefix基準でK3 Positive checkを比較する。 K5/K6/K7の実動作はstub境界とし、L8候補の期待class/reasonを独立に増やさない。 |
| `CK-K3-UT-185` | `CK-K3-FN-07/FN-09/FN-11` | `IV-K3-10` | `L8-K3-10-BASE` | owner-required input identity集合一致時のPositive componentを比較する。 K5/K6/K7の実動作はstub境界とし、L8候補の期待class/reasonを独立に増やさない。 |
| `CK-K3-UT-186` | `CK-K3-FN-11/FN-12` | `IV-K3-11` | `L8-K3-11-BASE` | authorization tupleとrequested target/composition/kind一致時のPositive K3 checkとhandoff refを比較する。 K5/K6/K7の実動作はstub境界とし、L8候補の期待class/reasonを独立に増やさない。 |
| `CK-K3-UT-187` | `CK-K3-FN-11/FN-12` | `IV-K3-12` | `L8-K3-12-BASE` | pre/post checkとeffect observationが束縛された正常controlのK3 checkを比較する。 K5/K6/K7の実動作はstub境界とし、L8候補の期待class/reasonを独立に増やさない。 |
| `CK-K3-UT-188` | `CK-K3-FN-09/FN-11` | `IV-K3-13` | `L8-K3-13-BASE` | 全component肯定のCombined.verdict=Positive、components全量、assuranceを比較する。 K5/K6/K7の実動作はstub境界とし、L8候補の期待class/reasonを独立に増やさない。 |
| `CK-K3-UT-189` | `CK-K3-FN-02` | `IV-K3-14` | `L8-K3-14-CALLER-BINDING-REJECTED` | 公開API signatureにcaller mapping引数がないことだけを構造確認し、API callやK1/K2診断/result classを構成しない。 K5/K6/K7の実動作はstub境界とし、L8候補の期待class/reasonを独立に増やさない。 |
| `CK-K3-UT-190` | `CK-K3-FN-02/FN-03/FN-12` | `IV-K3-14` | `L8-K3-14-EXTRA-RAW-READ` | K6 stub read setへ同一raw refの余分なreadを加え、K6境界の`Unknown(conflict)`を観測する。 K5/K6/K7の実動作はstub境界とし、L8候補の期待class/reasonを独立に増やさない。 |
| `CK-K3-UT-191` | `CK-K3-FN-02/FN-03` | `IV-K3-14` | `L8-K3-14-ROLE-ALIAS-COEXISTS` | 異roleの同raw identity・異revision aliasを別role-bound inputsとして保持し、BASEと同じPositive K3 resultを比較する。 K5/K6/K7の実動作はstub境界とし、L8候補の期待class/reasonを独立に増やさない。 |
| `CK-K3-UT-192` | `CK-K3-FN-01/FN-03/FN-12` | `IV-K3-15` | `L8-K3-15-BASE` | current refs/versionが一致する完全key lookupのValue(Positive)を比較する。 K5/K6/K7の実動作はstub境界とし、L8候補の期待class/reasonを独立に増やさない。 |
| `CK-K3-UT-193` | `CK-K3-FN-04/FN-10/FN-11/FN-12` | `IV-K3-16` | `L8-K3-16-BASE` | owner current heads/time観測とcaller expected heads一致時のPositive checkと全refsを比較する。 K5/K6/K7の実動作はstub境界とし、L8候補の期待class/reasonを独立に増やさない。 |
| `CK-K3-UT-194` | `CK-K3-FN-11/FN-12` | `IV-K3-17` | `L8-K3-17-BASE` | 通常apply_move後の同move直後観測を持つ基準controlでPositive K3 checkとhandoff refを比較する。 K5/K6/K7の実動作はstub境界とし、L8候補の期待class/reasonを独立に増やさない。 |

### 9.1 194 formal fixture外の回帰確認

既存17件に今回の9件を追加した下記26 method IDはformal K3 UT/L8 mappingへ加算しないfocused regression testである。case suffixを持つ行は各suffixを独立fixtureとして展開し、各入力では記載した一条件だけを変える。1行内のbaselineと変異は別subTestで実行する。owner/K5/K6境界はsynthetic stubのままとする。test methodとfixture IDは`CK-K3-REG-<ID>`から`test_CK_K3_REG_<ID>`へハイフンをunderscoreへ置換して対応させる。

| Test ID | 基準と一変異 | 呼出し | 固定する観測 |
|---|---|---|---|
| `CK-K3-REG-CURRENT-INPUT-REF` | queryとsaved recordは同一の旧`purpose` refを持つ。owner current `AuthorityContext.operation_inputs["purpose"]`だけrevisionと整合digestを更新する。 | `check_permission`（FN-07/09/11） | query/saved recordは一致しowner currentだけ異なるため`operation_input:purpose=Value(MISMATCH)`、全体`Negative`。 |
| `CK-K3-REG-PARTIAL-CONTEXT-OWNER-SCOPE` | context本文/permission current readだけ未取得。owner境界が別途current tuple scopeを解決済みで、読取結果は`unreadable`。 | `check_permission`（FN-03/04/11） | owner scopeから完全keyを作り、context=`Unresolved(unreadable)`、effective decision=`Unknown(unreadable)`、combined=`Undetermined`。query `requested_scope`でkeyを作らない。 |
| `CK-K3-REG-PARTIAL-CONTEXT-NO-SCOPE` | 同じcontext未取得だがowner current tuple scopeも未解決。 | `check_permission`（FN-03/04） | `PermissionCheckDiagnostic(missing_key)`と`current_tuple_scope`欠落を返し、caller scopeから補完しない。 |
| `CK-K3-REG-RECORD-REF-STALE` | Positive基準から保存済み`PermissionRecord.ref.revision`だけを旧revisionへ変える。 | `check_permission`（FN-05/11） | `permission_record_ref=Value(MISMATCH)`、combined=`Negative`。 |
| `CK-K3-REG-RECORD-SOURCE-UNREGISTERED` | Positive基準からrecord.source.identityだけを未登録identityへ変える。 | `check_permission`（FN-05/11） | `registered_source=Unknown(unregistered)`、combined=`Undetermined`。 |
| `CK-K3-REG-RECORD-SOURCE-DIGEST-CONFLICT` | source identity/revisionを固定し、record.source.digestだけcurrent registered source digestと異ならせる。 | `check_permission`（FN-05/11） | `registered_source=Unknown(conflict)`、combined=`Undetermined`。 |
| `CK-K3-REG-REVOCATION-HEAD-MISSING` | current revocation headを一つ持つ基準から、`RevocationSnapshot`だけを除く。 | `check_permission`（FN-04/08/11） | `revocation=Unknown(missing_input)`、combined=`Undetermined`。 |
| `CK-K3-REG-REVOCATION-HEAD-SET-CONFLICT` | current head tupleを固定し、snapshot.headsの一つだけ別headへ変える。 | `check_permission`（FN-04/08/11） | `revocation=Unknown(conflict)`、combined=`Undetermined`。 |
| `CK-K3-REG-REVOCATION-HEAD-SET-ORDER-AND-EXACT-DUPLICATES` | 同じ2-head集合でsnapshot順だけを逆転するcaseと、双方の集合に一方のheadの完全一致duplicateを含めて比較するcaseを別subTestにする。 | `check_permission`（FN-04/08/11） | 両caseで`revocation=Value(MATCH)`。比較は順序非依存で、完全一致refだけをdeduplicateする。 |
| `CK-K3-REG-REVOCATION-OBSERVATION-KEY-PRESERVED` | Positive基準のowner observationだけを同じvalue/evidenceのまま別の完全keyへ束縛し、context/head setは固定する。 | `check_permission`（FN-04/08/11） | `revocation` componentの`key`と`evidence`がowner観測と完全一致し、K3 result keyへ置換されない。 |
| `CK-K3-REG-ISSUER-DECL-MISSING` | Positive基準から`declared_issuer`だけを欠落させる。 | `check_permission`（FN-05/11） | `issuer=Unknown(missing_input)`、combined=`Undetermined`。 |
| `CK-K3-REG-RECORD-MISSING-SELECTOR-POSITIVE` | Positive selectorを保持し、source recordだけを欠落させる。 | `check_permission`（FN-05/11） | `effective_decision=Unknown(missing_input)`、combined=`Undetermined`。selector肯定を保存recordの代替にしない。 |
| `CK-K3-REG-OPERATION-INVALID` | 正常typed baselineではL4列挙の11 operationを一つずつ与えたsubTestを実行する。別の単独変異caseではbaselineのoperationだけをclosed union外の`frobnicate`へ変える。 | `check_permission`と`resolve_authority_context`（FN-10/11） | 11値は`invalid_query`にならずowner mapping境界へ進む。`frobnicate`は両APIで`PermissionCheckDiagnostic(invalid_query)`となりowner port呼出し数は0。 |
| `CK-K3-REG-OUTCOME-CASE-EXACT` | record outcome `allow`を大文字`ALLOW`へ一か所だけ変える。 | `check_permission`（FN-05/11） | `source_outcome=Unknown(unsupported)`、combined=`Undetermined`。casefoldしない。 |
| `CK-K3-REG-QUERY-REF-FIELDS` | 9個の独立subTest: `OPERATION`はoperationのみ、`TARGET`はtargetのみ、`REVISION-IDENTITY/REVISION-VERSION/REVISION-DIGEST`は該当revision fieldのみ、`SCOPE`はrequested_scopeのみ、`INPUT-IDENTITY`はoperation input keyのみ、`INPUT-REVISION/INPUT-DIGEST`は該当ref fieldのみ変更。 | `_query_ref`（FN-01） | 全caseでdigestが変わる。operation/target/revision identity/input identityではidentityも変わる。他caseではidentity不変。revision field変更caseだけrevisionも変わる。 |
| `CK-K3-REG-QUERY-CONTEXT-TARGET` | Positive基準からquery.targetだけを変え、他のquery-ref関連bindingは同じqueryに再束縛する。 | `check_permission`（FN-01/07/11） | `target=Value(MISMATCH)`、combined=`Negative`。 |
| `CK-K3-REG-RESOLVE-CONTEXT-OUTCOMES` | 同じbaselineからowner context観測を3つの個別subTestで返す: 完全context、expected input headだけのdrift、owner contextだけ`unreadable`。 | `resolve_authority_context`（FN-10） | それぞれ`Resolved`、`Unresolved(conflict)`、`Unresolved(unreadable)`。 |
| `CK-K3-REG-REVOCATION-ENTRY-DIGEST-ONLY-CONFLICT` | baselineのcurrent/snapshot headでsegmentとseqを同じにし、snapshot entry_digestだけを変更する。 | `check_permission`（FN-08/11） | `revocation=Unknown(conflict)`、combined=`Undetermined`。 |
| `CK-K3-REG-DECLARED-ISSUER-MISMATCH` | Positive基準からowner-declared issuerだけを別identityへ変える。record.issuerは固定する。 | `check_permission`（FN-05/11） | `issuer=Value(MISMATCH)`、combined=`Negative`。 |
| `CK-K3-REG-CURRENT-REF-DIFFERS-FROM-PERMISSION` | owner-selected current permission refを維持し、APIのrequested `permission` refだけ別refへ変える。派生observationsは新しいResultKeyへ再束縛する。 | `check_permission`（FN-05/11） | `effective_decision`はcurrent refをValueとして保持し、そのpolarityとcombinedが`Negative`になる。 |
| `CK-K3-REG-QUERY-SCOPE-MISMATCH` | Positive基準からquery.requested_scopeだけを変え、owner context/current record scopeは固定する。query-derived binding/keyは新queryから再構成する。 | `check_permission`（FN-06/11） | `scope=Value(MISMATCH)`、combined=`Negative`。 |
| `CK-K3-REG-CONSTRAINT-DECLARATION-MISMATCH` | matching `constrain` baselineからowner `pre_execution_constraints` declarationだけを別refへ変える。 | `check_permission`（FN-05/11） | `source_outcome=Unknown(missing_input)`、combined=`Undetermined`。 |
| `CK-K3-REG-EMPTY-CONSTRAINT-SET-IS-NONPOSITIVE` | valid nonempty `constrain` baselineからPermissionRecord.constraintsだけを空集合へ変える。 | `check_permission`（FN-05/11） | `source_outcome=Unknown(missing_input)`、combined=`Undetermined`。 |
| `CK-K3-REG-RESOLVE-WITH-EMPTY-CALLER-INPUT-HEADS` | 正常queryとowner-current contextを固定し、caller expected `input_heads`を空sequenceにする。 | `resolve_authority_context`（FN-10） | owner current contextから`Resolved`を返し、空caller期待値をcurrent authorityとして使わない。 |
| `CK-K3-REG-OPERATION-INPUT-SAME-REVISION-DIGEST-CONFLICT` | query/owner-current operation inputは同一refのまま、saved record refのdigestだけを変える（identity/revisionは固定）。 | `check_permission`（FN-07/11） | `operation_input:purpose=Unknown(conflict)`、combined=`Undetermined`。 |
| `CK-K3-REG-ALLOW-WITH-CONSTRAINTS-UNSUPPORTED` | allow baselineからPermissionRecord.constraintsだけを非空にし、他のcomponentとconstraint observationはpositiveに固定する。 | `check_permission`（FN-05/11） | `source_outcome=Unknown(unsupported)`、combined=`Undetermined`。 |

### 9.2 候補実装・実行記録

`helix/helix-harness/units/common-kernel/src/permission.py`と`tests/test_k3.py`にK3候補を置き、上表194 IDを個別の静的unittest methodで実行した。さらに§9.1の26 regression methodを別IDで実行した。query-ref field rowは一つのmethod内の9個の独立`subTest`として実行する。

| 検証 | 結果 |
|---|---|
| `python3 -m unittest discover -s helix/helix-harness/units/common-kernel/tests -p 'test_k3.py'` | 220 tests, OK（formal 194 + regression 26）。query-ref field rowは9独立subTestを含む。 |
| `python3 -m py_compile helix/helix-harness/units/common-kernel/src/permission.py helix/helix-harness/units/common-kernel/tests/test_k3.py` | 成功。 |

テストはowner mapping/context/source、K6 assuranceをprivate module境界の合成stubで与える。ownerの実読、K5/K6/K7実装、L9 oracle、CI登録、製品動作、外部作用を証明しない。実行時の変更理由・対象コード・境界はL6 §12.4に記録し、test fixtureから新しい要求や受入gateを作らない。

K3単体fixtureは純粋な関数境界と固定入力を対象とする。K5 prefix/read/restore、K6 binding/raw byte実読、owner source adapter、K7 apply/recoveryはstubまたはconsumer handoffであり、この単体fixtureから製品動作、外部作用、実読、合格を主張しない。L4 §16.2で列挙したoperation closed union外の入力は既存`invalid_query`で両API入口から返し、owner portを呼ばない。11個の列挙値は同じ入口検査で拒否されないことを個別subTestで確認する。これはruntimeのtyped-query境界であり、汎用shape validatorを追加しない。K2 `invalid_digest`/`duplicate_identity`はK2専用拒否であり、K3のkey構成境界ではL4 §16.4と固定L5 §6.1.3どおり`PermissionCheckDiagnostic(reason: missing_key)`へ写す。K1 Unknownへ変換せず、K1でcombine/K2へrecordしない。正しいnamespaceとalias構成を通る正常K3 keyではduplicate identityを作らない。`allow`と非空`constraints`の同時存在はL4/L5にmappingがなく、回帰fixtureは既存`Unknown(unsupported)`を保持して肯定を防ぐ。新しい拒否、reason、authority policyは加えず、domain mappingの未決は局所に残す。K3結果の保存ownerがL4で指定されない範囲では保存writerを作らず、保存callerの指定を待つ。旧source crosswalkと保持/変更理由はL6 §12.3に記録した。
