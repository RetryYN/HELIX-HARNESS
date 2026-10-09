# HELIX-BRAIN Stage 1（007/008/028）詳細検証設計

status: draft_for_independent_review
owner: HELIX-BRAIN
paired_l5: ../L5-detail-design/stage1-brain.md
base: main `7d4ed840d96b43ea91f10c314b85dfdaf7a6242b`
current_main_observed: origin/main `7d4ed840d96b43ea91f10c314b85dfdaf7a6242b`（L5/L8先行分割時に観測）
source_pair_base_candidate_commit: `eb3b52444093f0de6491d4f1b707132670afb9e4`（編集開始時の候補。編集開始時の比較基準）
l5_sha256: `5ac1fa30b0aefad5c6e40720863e6a263de286b9b38fff3683520d1b38c03dd0`

本書は対L5の公開関数境界について、固定L9の27 functional oracleと7 NFR oracleをfixtureとして具体化する。ここに記すfixtureは設計上の合成入力であり、テスト実行、L9合格、実装、owner recordの実在、sourceの真正性、adoption、releaseを主張しない。期待値は固定L4/L9にある範囲だけを使う。

## 1. 固定入力・照合範囲

| 入力 | 固定対象 | SHA-256 |
|---|---|---|
| BRAIN L5 | `docs/helix-brain/L5-detail-design/stage1-brain.md`（本草稿HEAD bytes） | `5ac1fa30b0aefad5c6e40720863e6a263de286b9b38fff3683520d1b38c03dd0` |
| BRAIN L4 | `docs/helix-brain/L4-basic-design/stage1-brain.md` | `a981efc23ea0e85303a600f469d2d989b991b378a4b89ac94cf34bce004ccc9c` |
| BRAIN L9 | `docs/helix-brain/L9-integration-verification/stage1-brain-integration-verification.md` | `2f61e7f4ff86db837b014f6500a143727df9611099106561aa74edca3e434787` |
| L3/L10 authority | 007 revision `2919f7344f90ff8bde4db60ef7142b3c47bea0a8`; 008/028 revision `debb4e3d682c5ad4835dafed7dbcbf33f24e9c8f` | 6本文と承認chainはL4 §1の完全表を参照 |

本書L8から対L5のpathとSHAを一方向に固定する。L5からL8への逆pinは置かない。L9 oracle IDの集合は既存定義のままとし、本書のcase IDはfixture locatorである。6 ACに対応する27 functional oracleと、既存NFR項目を測る7 oracle、合計34件をすべて列挙する。

共通fixtureは完全なkind/identity/revision/digestを持つ合成`SubjectRef`、固定された結果/evidence参照、およびK5 `restore`で復元された形のK2 `ResultRecord`を含むowner別record snapshotから構成する。`ResultRecord`内のkey/key_digest/result/result_digest/producerは既存CK型のfieldであり、BRAIN側に複製しない。実データ・実source・人のdecisionをfixtureへ補わない。negativeは各行に示す一つの条件を変える。K2の`key_of`拒否、K1結果分類、owner境界を混同しない。

## 2. Functional oracle fixture（27 verifier ID、複数fixtureへ展開）

27個のfunctional L9 verifier IDに対し、個別fixtureは84件である。7個のNFR測定fixtureを加えた全fixture IDは91件。各negative行は単一変異で、各L9 oracle IDは従来どおり一つだけ保持する。K1/K2がclass/reasonを定める入力はその型をassertする。L4/L5がowner semanticsやcomparatorを定めないcaseは局所保留し、結果型を発明しない。 旧MLP unit/integration source（L4 §5 rows 3–4、asset `LEGACY-ASSET-1B990E15398E929D29BD` / `LEGACY-ASSET-B1F8D6CA3685EBF0F322`、full SHAは同表）にあるprovenance欠落・stale/danglingとowner混同の失敗類型を保持し、atomic fieldごとのfixtureへ分けた。旧memory schema、threshold、role型、runtimeは持ち込まない。ProvenanceRef内部のsource identity/revision member名がL5に定義されていないため、その2 memberに対するmissing/stale/danglingの6 mutationは各一行で局所保留とした。

| L8 fixture ID | 固定L9 oracle / L10 case | L5関数・stub入力 | Positive baseline | 一つだけの変異 | 具体的期待結果 |
|---|---|---|---|---|---|
| `L8-BRAIN-001` | `IV-BRAIN-001` / `L10-BRAIN-007-C01` | `trace_source` | 8 groupと4 owner recordを別fieldに置く完全入力。 | なし。 | 各入力Observedを同じfieldへ返す。trace全体のObserved wrapper/adoption判定なし。 |
| `L8-BRAIN-002-MISSING-SOURCE_IDENTITY` | `IV-BRAIN-002` / `L10-BRAIN-007-C02` | `trace_source` | L8-BRAIN-001の完全な合成入力。 | ProvenanceRef内の対応atomic member名/encodingがL5に無く、fixture materializationは局所保留。 | member shape未定義のため個別K1 class/reasonを主張しない。L5の型不足を補わない。 |
| `L8-BRAIN-002-STALE-SOURCE_IDENTITY` | `IV-BRAIN-002` / `L10-BRAIN-007-C02` | `trace_source` | L8-BRAIN-001の完全な合成入力。 | ProvenanceRef内の対応atomic member名/encodingがL5に無く、fixture materializationは局所保留。 | member shape未定義のため個別K1 class/reasonを主張しない。L5の型不足を補わない。 |
| `L8-BRAIN-002-DANGLING-SOURCE_IDENTITY` | `IV-BRAIN-002` / `L10-BRAIN-007-C02` | `trace_source` | L8-BRAIN-001の完全な合成入力。 | ProvenanceRef内の対応atomic member名/encodingがL5に無く、fixture materializationは局所保留。 | member shape未定義のため個別K1 class/reasonを主張しない。L5の型不足を補わない。 |
| `L8-BRAIN-002-MISSING-SOURCE_REVISION` | `IV-BRAIN-002` / `L10-BRAIN-007-C02` | `trace_source` | L8-BRAIN-001の完全な合成入力。 | ProvenanceRef内の対応atomic member名/encodingがL5に無く、fixture materializationは局所保留。 | member shape未定義のため個別K1 class/reasonを主張しない。L5の型不足を補わない。 |
| `L8-BRAIN-002-STALE-SOURCE_REVISION` | `IV-BRAIN-002` / `L10-BRAIN-007-C02` | `trace_source` | L8-BRAIN-001の完全な合成入力。 | ProvenanceRef内の対応atomic member名/encodingがL5に無く、fixture materializationは局所保留。 | member shape未定義のため個別K1 class/reasonを主張しない。L5の型不足を補わない。 |
| `L8-BRAIN-002-DANGLING-SOURCE_REVISION` | `IV-BRAIN-002` / `L10-BRAIN-007-C02` | `trace_source` | L8-BRAIN-001の完全な合成入力。 | ProvenanceRef内の対応atomic member名/encodingがL5に無く、fixture materializationは局所保留。 | member shape未定義のため個別K1 class/reasonを主張しない。L5の型不足を補わない。 |
| `L8-BRAIN-002-MISSING-PROVENANCE` | `IV-BRAIN-002` / `L10-BRAIN-007-C02` | `trace_source` | L8-BRAIN-001の完全な合成入力。 | top-level `provenance` groupだけを入力`Unknown(missing_input)`へ置換する。 | 当該fieldの`Unknown(missing_input)`を保持。 |
| `L8-BRAIN-002-STALE-PROVENANCE` | `IV-BRAIN-002` / `L10-BRAIN-007-C02` | `trace_source` | L8-BRAIN-001の完全な合成入力。 | top-level `provenance` groupだけを旧revisionの参照にし、priorはValue。 | 当該fieldだけ`Stale(prior=Value, recorded_key, current_key)`を保持。 |
| `L8-BRAIN-002-DANGLING-PROVENANCE` | `IV-BRAIN-002` / `L10-BRAIN-007-C02` | `trace_source` | L8-BRAIN-001の完全な合成入力。 | top-level `provenance` groupだけを参照先を読取不能にする。 | 当該fieldだけ`Unknown(unreadable)`を保持。 |
| `L8-BRAIN-002-MISSING-EVIDENCE` | `IV-BRAIN-002` / `L10-BRAIN-007-C02` | `trace_source` | L8-BRAIN-001の完全な合成入力。 | `evidence`だけを入力`Unknown(missing_input)`へ置換する。 | 当該fieldの`Unknown(missing_input)`を保持。 |
| `L8-BRAIN-002-STALE-EVIDENCE` | `IV-BRAIN-002` / `L10-BRAIN-007-C02` | `trace_source` | L8-BRAIN-001の完全な合成入力。 | `evidence`だけを旧revisionの参照にし、priorはValue。 | 当該fieldだけ`Stale(prior=Value, recorded_key, current_key)`を保持。 |
| `L8-BRAIN-002-DANGLING-EVIDENCE` | `IV-BRAIN-002` / `L10-BRAIN-007-C02` | `trace_source` | L8-BRAIN-001の完全な合成入力。 | `evidence`だけを参照先を読取不能にする。 | 当該fieldだけ`Unknown(unreadable)`を保持。 |
| `L8-BRAIN-002-LABO-UNEVALUATED` | `IV-BRAIN-002` / `L10-BRAIN-007-C02` | `trace_source` | L8-BRAIN-001の完全な合成入力。 | LABO評価未実施のまま評価済みrecordを与えない。 | `labo_evaluation_target`の`Unknown(missing_input)`を保持しcandidate/adoptionを変更しない。 |
| `L8-BRAIN-003-MISSING-EVALUATED_SCOPE` | `IV-BRAIN-003` / `L10-BRAIN-007-C03` | `trace_source` | L8-BRAIN-001の完全な合成入力。 | `evaluated_scope`だけを入力`Unknown(missing_input)`へ置換する。 | 当該fieldの`Unknown(missing_input)`を保持。 |
| `L8-BRAIN-003-MISSING-COUNTEREXAMPLE` | `IV-BRAIN-003` / `L10-BRAIN-007-C03` | `trace_source` | L8-BRAIN-001の完全な合成入力。 | `counterexample`だけを入力`Unknown(missing_input)`へ置換する。 | 当該fieldの`Unknown(missing_input)`を保持。 |
| `L8-BRAIN-003-MISSING-LIMITATION` | `IV-BRAIN-003` / `L10-BRAIN-007-C03` | `trace_source` | L8-BRAIN-001の完全な合成入力。 | `limitation`だけを入力`Unknown(missing_input)`へ置換する。 | 当該fieldの`Unknown(missing_input)`を保持。 |
| `L8-BRAIN-003-MISSING-ADOPTED_REASON` | `IV-BRAIN-003` / `L10-BRAIN-007-C03` | `trace_source` | L8-BRAIN-001の完全な合成入力。 | `adopted_reason`だけを入力`Unknown(missing_input)`へ置換する。 | 当該fieldの`Unknown(missing_input)`を保持。 |
| `L8-BRAIN-004-AI-ONLY` | `IV-BRAIN-004` / `L10-BRAIN-007-C04` | `trace_source` | L8-BRAIN-001の完全な合成入力。 | AI生成のみで検証実績なし。 | adoption判定APIはないためclassを生成せず、adoption/owner field不変。昇格条件のowner意味は局所保留。 |
| `L8-BRAIN-004-SINGLE-RESULT` | `IV-BRAIN-004` / `L10-BRAIN-007-C04` | `trace_source` | L8-BRAIN-001の完全な合成入力。 | 検証実績を一件だけに制限。 | adoption判定APIはないためclassを生成せず、adoption/owner field不変。昇格条件のowner意味は局所保留。 |
| `L8-BRAIN-005` | `IV-BRAIN-005` / `L10-BRAIN-007-C05` | `trace_source` | L8-BRAIN-001の完全な合成入力。 | LABO target revisionだけcandidateと不一致のValueにする。 | 不一致`Value(SubjectRef)`を同fieldに保持。adoption判定は作らない。 |
| `L8-BRAIN-006` | `IV-BRAIN-006` / `L10-BRAIN-007-C06` | `trace_source` | L8-BRAIN-001の完全な合成入力。 | candidateをR2にしevidenceだけRのprior Valueとする。 | evidenceだけ`Stale(prior=Value, recorded_key, current_key)`。 |
| `L8-BRAIN-007-LABO` | `IV-BRAIN-007` / `L10-BRAIN-007-C07` | `trace_source` | L8-BRAIN-001の完全な合成入力。 | `owner_records.labo`だけにOS registrationのSubjectRefを置く。 | 受信`Value(SubjectRef)`を`owner_records.labo`へ保持し他owner fieldを変えない。意味的代用判定は局所保留。 |
| `L8-BRAIN-007-OS-REGISTRATION` | `IV-BRAIN-007` / `L10-BRAIN-007-C07` | `trace_source` | L8-BRAIN-001の完全な合成入力。 | `owner_records.os_registration`だけにLABOのSubjectRefを置く。 | 受信`Value(SubjectRef)`を`owner_records.os_registration`へ保持し他owner fieldを変えない。意味的代用判定は局所保留。 |
| `L8-BRAIN-007-BRAIN-VERIFICATION` | `IV-BRAIN-007` / `L10-BRAIN-007-C07` | `trace_source` | L8-BRAIN-001の完全な合成入力。 | `owner_records.brain_verification`だけにOS registrationのSubjectRefを置く。 | 受信`Value(SubjectRef)`を`owner_records.brain_verification`へ保持し他owner fieldを変えない。意味的代用判定は局所保留。 |
| `L8-BRAIN-007-ADOPTION` | `IV-BRAIN-007` / `L10-BRAIN-007-C07` | `trace_source` | L8-BRAIN-001の完全な合成入力。 | `owner_records.adoption`だけにBRAIN verificationのSubjectRefを置く。 | 受信`Value(SubjectRef)`を`owner_records.adoption`へ保持し他owner fieldを変えない。意味的代用判定は局所保留。 |
| `L8-BRAIN-008` | `IV-BRAIN-008` / `L10-BRAIN-007-C08` | `trace_source` | 必要なsource/evidenceから全owner recordまで揃う完全入力。 | なし。 | 入力fieldをそのまま返し、採否・真正性は判定しない。 |
| `L8-BRAIN-009` | `IV-BRAIN-009` / `L10-BRAIN-007-C09` | `trace_source` | L8-BRAIN-001の完全な合成入力。 | Pattern/Unit/Part identity組合せだけを未見値にする。 | 全fieldがValueなら同一trace shape。required-input意味は追加しない。 |
| `L8-BRAIN-010` | `IV-BRAIN-010` / `L10-BRAIN-007-C10` | `trace_source` | L8-BRAIN-001の完全な合成入力。 | LABO targetだけ`Unknown(missing_input)`とする。 | 当該Unknownを保持しcandidate/adoption不変。 |
| `L8-BRAIN-011` | `IV-BRAIN-011` / `L10-BRAIN-008-C01` | `read_knowledge` | K2 key成功のexact R query、K5 restore由来records。 | BRAIN R=superseded/R2追加、queryはR固定。 | K2 lookupのR結果を返し、BRAIN stateとOS useを分離。 |
| `L8-BRAIN-012-KEY-MISSING` | `IV-BRAIN-012` / `L10-BRAIN-008-C02` | K2 `key_of`/`lookup`; `read_knowledge`は成功keyの場合のみ | K2 `key_of`成功する完全key。 | 必須key fieldを一つ欠く。 | `Rejected(missing_key)`、API未呼出。 |
| `L8-BRAIN-012-KEY-DIGEST` | `IV-BRAIN-012` / `L10-BRAIN-008-C02` | K2 `key_of`/`lookup`; `read_knowledge`は成功keyの場合のみ | K2 `key_of`成功する完全key。 | 存在するdigestを不正形式へ一つ変える。 | `Rejected(invalid_digest)`、API未呼出。 |
| `L8-BRAIN-012-KEY-DUPLICATE` | `IV-BRAIN-012` / `L10-BRAIN-008-C02` | K2 `key_of`/`lookup`; `read_knowledge`は成功keyの場合のみ | K2 `key_of`成功する完全key。 | inputs内に同一identityを一つ追加。 | `Rejected(duplicate_identity)`、API未呼出。 |
| `L8-BRAIN-012-NO-MATCH` | `IV-BRAIN-012` / `L10-BRAIN-008-C02` | K2 `key_of`/`lookup`; `read_knowledge`は成功keyの場合のみ | K2 key成功の完全R2 queryと一致するR2 Value record。 | 完全query keyに一致するrecordを除く。 | K2 `Unobserved(not_run)`。 |
| `L8-BRAIN-012-SAVED-UNKNOWN` | `IV-BRAIN-012` / `L10-BRAIN-008-C02` | K2 `key_of`/`lookup`; `read_knowledge`は成功keyの場合のみ | K2 key成功の完全R2 queryと一致するR2 Value record。 | 一致record resultだけを`Unknown(missing_input)`にする。 | 保存された`Unknown(missing_input)`を維持。 |
| `L8-BRAIN-012-VERSION-UNKNOWN` | `IV-BRAIN-012` / `L10-BRAIN-008-C02` | K2 `key_of`/`lookup`; `read_knowledge`は成功keyの場合のみ | K2 key成功の完全R2 queryと一致するR2 Value record。 | version fieldだけ`Unknown(missing_input)`にする。 | BrainKnowledgeRecord内version fieldの`Unknown(missing_input)`を維持。 |
| `L8-BRAIN-012-VERSION-MISSING` | `IV-BRAIN-012` / `L10-BRAIN-008-C02` | K2 `key_of`/`lookup`; `read_knowledge`は成功keyの場合のみ | K2 key成功の完全R2 queryと一致するR2 Value record。 | 必須version fieldをrecordから除去。 | typed record不正のK1 reason未定義。局所保留。 |
| `L8-BRAIN-012-SAME-KEY-CONFLICT` | `IV-BRAIN-012` / `L10-BRAIN-008-C02` | K2 `key_of`/`lookup`; `read_knowledge`は成功keyの場合のみ | K2 key成功の完全R2 queryと一致するR2 Value record。 | 同一query keyに異なるresult bytesのrecordを追加。 | K2 `Unknown(conflict)`。 |
| `L8-BRAIN-012-OLD-VALUE` | `IV-BRAIN-012` / `L10-BRAIN-008-C02` | K2 `key_of`/`lookup`; `read_knowledge`は成功keyの場合のみ | K2 key成功の完全R2 queryと一致するR2 Value record。 | queryはR2のまま、matching R2 recordをR prior Valueに置換。 | K2 `Stale(prior=Value, recorded_key, current_key)`。 |
| `L8-BRAIN-012-OLD-NONVALUE` | `IV-BRAIN-012` / `L10-BRAIN-008-C02` | K2 `key_of`/`lookup`; `read_knowledge`は成功keyの場合のみ | K2 key成功の完全R2 queryと一致するR2 Unknown(missing_input) record。 | queryはR2のまま、recordのsubject revisionだけRへ変更し、digest/key_digestの派生値を追随。resultは同じUnknownを保持。 | K2-I2b `Unobserved(not_run, superseded=prior.key_digest)`。 |
| `L8-BRAIN-013` | `IV-BRAIN-013` / `L10-BRAIN-008-C03` | `read_knowledge` | 完全exact query/record。 | actual version未観測のままversion_targetだけを代入。 | versionは`Unknown(missing_input)`。actual Valueを作らない。 |
| `L8-BRAIN-014` | `IV-BRAIN-014` / `L10-BRAIN-008-C04` | `read_knowledge` | BRAIN R=currentとOS use=Rを別recordにする。 | BRAIN stateだけ`Value(superseded)`へ。 | BRAIN stateを反映しOS record bytesは不変。 |
| `L8-BRAIN-015` | `IV-BRAIN-015` / `L10-BRAIN-008-C05` | `read_knowledge` | BRAIN record RとOS useを別々に用意。 | OS recordだけ更新。 | BRAIN lookup結果はbaseline同一、write-backなし。 |
| `L8-BRAIN-016` | `IV-BRAIN-016` / `L10-BRAIN-008-C06` | `read_knowledge` | L8-BRAIN-011と同じ完全record shape。 | exact identity/revisionだけ未見の有効な別値。 | K2 exact lookup結果を返しowner recordを混ぜない。 |
| `L8-BRAIN-017-CURRENT` | `IV-BRAIN-017` / `L10-BRAIN-008-C07` | `read_knowledge` | 完全exact query/recordと別OS use record。 | stateを`Value(current)`にする。 | `Value(current)`を正確に返す。 |
| `L8-BRAIN-017-SUPERSEDED` | `IV-BRAIN-017` / `L10-BRAIN-008-C07` | `read_knowledge` | 完全exact query/recordと別OS use record。 | stateを`Value(superseded)`にする。 | `Value(superseded)`を正確に返す。 |
| `L8-BRAIN-017-DEPRECATED` | `IV-BRAIN-017` / `L10-BRAIN-008-C07` | `read_knowledge` | 完全exact query/recordと別OS use record。 | stateを`Value(deprecated)`にする。 | `Value(deprecated)`を正確に返す。 |
| `L8-BRAIN-017-EXPERIMENTAL` | `IV-BRAIN-017` / `L10-BRAIN-008-C07` | `read_knowledge` | 完全exact query/recordと別OS use record。 | stateを`Value(experimental)`にする。 | `Value(experimental)`を正確に返す。 |
| `L8-BRAIN-017-RETIRED` | `IV-BRAIN-017` / `L10-BRAIN-008-C07` | `read_knowledge` | 完全exact query/recordと別OS use record。 | stateを`Value(retired)`にする。 | `Value(retired)`を正確に返す。 |
| `L8-BRAIN-018` | `IV-BRAIN-018` / `L10-BRAIN-008-C08` | `read_knowledge` | 完全なexact R query。 | operation/version/scope/inputs identity集合を保った同identity R2のValue recordだけを与える。 | exact key一致はないが同identity候補のpriorはValueなのでK2 `Stale(prior=Value, recorded_key, current_key)`。revision名の前後を推測せずR2をRのValueとして返さない。 |
| `L8-BRAIN-019` | `IV-BRAIN-019` / `L10-BRAIN-008-C09` | `read_knowledge` | 完全R queryとR record。 | revision Rを維持しbytesだけ異なる候補を追加。 | K2 `Unknown(conflict)`。 |
| `L8-BRAIN-020` | `IV-BRAIN-020` / `L10-BRAIN-028-C01` | `compare_compatibility` | 完全descriptor/knowledge tuple。 | 変更なし。 | HARNESS comparator供給元未定義。Applicable result class/reasonを創作せず局所保留。 |
| `L8-BRAIN-021-IDENTITY-UNKNOWN` | `IV-BRAIN-021` / `L10-BRAIN-028-C02` | `compare_compatibility` | 完全descriptor/knowledge tuple。 | descriptor identityを`Unknown(unregistered)`へ。 | 入力の当該Unknown/未解決を不変に保持し、Applicableを生成しない。戻りはObserved<Applicable>のみでfield projectionを追加せず、具体Unknown reasonのowner mappingは局所保留。 |
| `L8-BRAIN-021-REVISION-UNKNOWN` | `IV-BRAIN-021` / `L10-BRAIN-028-C02` | `compare_compatibility` | 完全descriptor/knowledge tuple。 | knowledge revisionを`Unknown(missing_input)`へ。 | 入力の当該Unknown/未解決を不変に保持し、Applicableを生成しない。戻りはObserved<Applicable>のみでfield projectionを追加せず、具体Unknown reasonのowner mappingは局所保留。 |
| `L8-BRAIN-021-RANGE-OUTSIDE` | `IV-BRAIN-021` / `L10-BRAIN-028-C02` | `compare_compatibility` | 完全descriptor/knowledge tuple。 | requested versionだけ宣言range外へ。 | 入力の当該Unknown/未解決を不変に保持し、Applicableを生成しない。戻りはObserved<Applicable>のみでfield projectionを追加せず、具体Unknown reasonのowner mappingは局所保留。 |
| `L8-BRAIN-021-FIELD-MISSING` | `IV-BRAIN-021` / `L10-BRAIN-028-C02` | `compare_compatibility` | 完全descriptor/knowledge tuple。 | descriptor_fieldsを`Unknown(missing_input)`へ。 | 入力の当該Unknown/未解決を不変に保持し、Applicableを生成しない。戻りはObserved<Applicable>のみでfield projectionを追加せず、具体Unknown reasonのowner mappingは局所保留。 |
| `L8-BRAIN-021-NO-FALLBACK-SAME-IDENTITY-STALE` | `IV-BRAIN-021` / `L10-BRAIN-028-C02` | `read_knowledge`; K2結果が非Valueなら`compare_compatibility`は呼ばない | `query_key`はsubject K@R、operation/version/scope/inputs identity集合を固定し、完全一致するK@Rのrecordがある。 | 唯一のbaseline recordのsubject revisionだけをRからR2へ変更し、subject identity Kは保つ。record resultはprior `Value(BrainKnowledgeRecord)`のままとし、key/digestは変更後のcanonical keyから再計算する。 | K2 `read_knowledge`結果は`Stale(prior=Value, recorded_key=K@R2, current_key=K@R)`。priorをcurrentへunwrapせず`compare_compatibility`を呼ばない。外側`Observed<Applicable>`への写像は局所未決。 |
| `L8-BRAIN-021-NO-FALLBACK-DIFFERENT-IDENTITY` | `IV-BRAIN-021` / `L10-BRAIN-028-C02` | `read_knowledge`; K2結果が非Valueなら`compare_compatibility`は呼ばない | `query_key`はsubject K@R、operation/version/scope/inputs identity集合を固定し、完全一致するK@Rのrecordがある。 | 唯一のbaseline recordのsubject identityだけをKからYへ変更し、revision Rは保つ。operation/version/scope/inputs identity集合とprior `Value(BrainKnowledgeRecord)`は維持し、key/digestは変更後のcanonical keyから再計算する。 | identityが異なるY@RはK2 candidateではないため、`read_knowledge`は`Unobserved(not_run)`。`compare_compatibility`を呼ばず、Y@RをK@Rとして返さない。外側`Observed<Applicable>`への写像は局所未決。 |
| `L8-BRAIN-022-M-DESCRIPTOR_KIND` | `IV-BRAIN-022` / `L10-BRAIN-028-C03` | `compare_compatibility` | L8-BRAIN-020の完全な二軸基準。 | descriptor_kind fieldだけ`Unknown(missing_input)`に。 | 入力の当該Unknown/未解決を不変に保持し、Applicableを生成しない。戻りはObserved<Applicable>のみでfield projectionを追加せず、具体Unknown reasonのowner mappingは局所保留。 |
| `L8-BRAIN-022-X-DESCRIPTOR_KIND` | `IV-BRAIN-022` / `L10-BRAIN-028-C03` | `compare_compatibility` | L8-BRAIN-020の完全な二軸基準。 | descriptor_kind valueだけを別値へ。 | comparator未定義のためmismatch class/reasonを創作せず局所保留。 |
| `L8-BRAIN-022-M-DEPENDENCY_IDENTITY` | `IV-BRAIN-022` / `L10-BRAIN-028-C03` | `compare_compatibility` | L8-BRAIN-020の完全な二軸基準。 | dependency_identity fieldだけ`Unknown(missing_input)`に。 | 入力の当該Unknown/未解決を不変に保持し、Applicableを生成しない。戻りはObserved<Applicable>のみでfield projectionを追加せず、具体Unknown reasonのowner mappingは局所保留。 |
| `L8-BRAIN-022-X-DEPENDENCY_IDENTITY` | `IV-BRAIN-022` / `L10-BRAIN-028-C03` | `compare_compatibility` | L8-BRAIN-020の完全な二軸基準。 | dependency_identity valueだけを別値へ。 | comparator未定義のためmismatch class/reasonを創作せず局所保留。 |
| `L8-BRAIN-022-M-VERIFICATION_SCOPE` | `IV-BRAIN-022` / `L10-BRAIN-028-C03` | `compare_compatibility` | L8-BRAIN-020の完全な二軸基準。 | verification_scope fieldだけ`Unknown(missing_input)`に。 | 入力の当該Unknown/未解決を不変に保持し、Applicableを生成しない。戻りはObserved<Applicable>のみでfield projectionを追加せず、具体Unknown reasonのowner mappingは局所保留。 |
| `L8-BRAIN-022-X-VERIFICATION_SCOPE` | `IV-BRAIN-022` / `L10-BRAIN-028-C03` | `compare_compatibility` | L8-BRAIN-020の完全な二軸基準。 | verification_scope valueだけを別値へ。 | comparator未定義のためmismatch class/reasonを創作せず局所保留。 |
| `L8-BRAIN-022-M-KNOWLEDGE_VERSION` | `IV-BRAIN-022` / `L10-BRAIN-028-C03` | `compare_compatibility` | L8-BRAIN-020の完全な二軸基準。 | knowledge_version fieldだけ`Unknown(missing_input)`に。 | 入力の当該Unknown/未解決を不変に保持し、Applicableを生成しない。戻りはObserved<Applicable>のみでfield projectionを追加せず、具体Unknown reasonのowner mappingは局所保留。 |
| `L8-BRAIN-022-X-KNOWLEDGE_VERSION` | `IV-BRAIN-022` / `L10-BRAIN-028-C03` | `compare_compatibility` | L8-BRAIN-020の完全な二軸基準。 | knowledge_version valueだけを別値へ。 | comparator未定義のためmismatch class/reasonを創作せず局所保留。 |
| `L8-BRAIN-022-M-KNOWLEDGE_STATE` | `IV-BRAIN-022` / `L10-BRAIN-028-C03` | `compare_compatibility` | L8-BRAIN-020の完全な二軸基準。 | knowledge_state fieldだけ`Unknown(missing_input)`に。 | 入力の当該Unknown/未解決を不変に保持し、Applicableを生成しない。戻りはObserved<Applicable>のみでfield projectionを追加せず、具体Unknown reasonのowner mappingは局所保留。 |
| `L8-BRAIN-022-X-KNOWLEDGE_STATE` | `IV-BRAIN-022` / `L10-BRAIN-028-C03` | `compare_compatibility` | L8-BRAIN-020の完全な二軸基準。 | knowledge_state valueだけを別値へ。 | comparator未定義のためmismatch class/reasonを創作せず局所保留。 |
| `L8-BRAIN-023-OUTSIDE` | `IV-BRAIN-023` / `L10-BRAIN-028-C04` | `compare_compatibility` | L8-BRAIN-020の完全な二軸基準。 | requested compatibilityだけrange外へ。 | 入力の当該Unknown/未解決を不変に保持し、Applicableを生成しない。戻りはObserved<Applicable>のみでfield projectionを追加せず、具体Unknown reasonのowner mappingは局所保留。 |
| `L8-BRAIN-023-MISSING` | `IV-BRAIN-023` / `L10-BRAIN-028-C04` | `compare_compatibility` | L8-BRAIN-020の完全な二軸基準。 | rangeを`Unknown(missing_input)`へ。 | 入力の当該Unknown/未解決を不変に保持し、Applicableを生成しない。戻りはObserved<Applicable>のみでfield projectionを追加せず、具体Unknown reasonのowner mappingは局所保留。 |
| `L8-BRAIN-023-UNINTERPRETABLE` | `IV-BRAIN-023` / `L10-BRAIN-028-C04` | `compare_compatibility` | L8-BRAIN-020の完全な二軸基準。 | rangeを`Unknown(unsupported)`へ。 | 入力の当該Unknown/未解決を不変に保持し、Applicableを生成しない。戻りはObserved<Applicable>のみでfield projectionを追加せず、具体Unknown reasonのowner mappingは局所保留。 |
| `L8-BRAIN-024` | `IV-BRAIN-024` / `L10-BRAIN-028-C05` | `compare_compatibility` | L8-BRAIN-020の完全な二軸基準。 | version_targetだけactual versionとして与える。 | 入力の当該Unknown/未解決を不変に保持し、Applicableを生成しない。戻りはObserved<Applicable>のみでfield projectionを追加せず、具体Unknown reasonのowner mappingは局所保留。 |
| `L8-BRAIN-025-EXCHANGE` | `IV-BRAIN-025` / `L10-BRAIN-028-C06` | `compare_compatibility` | L8-BRAIN-020の完全な二軸基準。 | exchange義務だけをBRAIN fieldへ移す。 | owner判定APIなし。結果classを創作せず局所保留。 |
| `L8-BRAIN-025-UPDATE` | `IV-BRAIN-025` / `L10-BRAIN-028-C06` | `compare_compatibility` | L8-BRAIN-020の完全な二軸基準。 | update義務だけをBRAIN fieldへ移す。 | owner判定APIなし。結果classを創作せず局所保留。 |
| `L8-BRAIN-025-ROLLBACK` | `IV-BRAIN-025` / `L10-BRAIN-028-C06` | `compare_compatibility` | L8-BRAIN-020の完全な二軸基準。 | rollback義務だけをBRAIN fieldへ移す。 | owner判定APIなし。結果classを創作せず局所保留。 |
| `L8-BRAIN-025-UNFINISHED_OBLIGATION` | `IV-BRAIN-025` / `L10-BRAIN-028-C06` | `compare_compatibility` | L8-BRAIN-020の完全な二軸基準。 | unfinished_obligation義務だけをBRAIN fieldへ移す。 | owner判定APIなし。結果classを創作せず局所保留。 |
| `L8-BRAIN-026` | `IV-BRAIN-026` / `L10-BRAIN-028-C07` | `compare_compatibility` | 未見の完全descriptor/knowledge tuple。 | identity組合せだけ未見値へ。 | owner comparator未登録。Applicable fixtureを作らず局所保留。 |
| `L8-BRAIN-027-DESCRIPTOR_IDENTITY` | `IV-BRAIN-027` / `L10-BRAIN-028-C08` | `compare_compatibility` | L8-BRAIN-020の完全な二軸基準。 | descriptor_identityだけを別軸値へ入替える。 | comparator未定義。mismatch class/reasonを創作せず当該軸を局所保留。 |
| `L8-BRAIN-027-CONTRACT_VERSION` | `IV-BRAIN-027` / `L10-BRAIN-028-C08` | `compare_compatibility` | L8-BRAIN-020の完全な二軸基準。 | contract_versionだけを別軸値へ入替える。 | comparator未定義。mismatch class/reasonを創作せず当該軸を局所保留。 |
| `L8-BRAIN-027-ARTIFACT_VERSION` | `IV-BRAIN-027` / `L10-BRAIN-028-C08` | `compare_compatibility` | L8-BRAIN-020の完全な二軸基準。 | artifact_versionだけを別軸値へ入替える。 | comparator未定義。mismatch class/reasonを創作せず当該軸を局所保留。 |
| `L8-BRAIN-027-DEPENDENCY_VERSION` | `IV-BRAIN-027` / `L10-BRAIN-028-C08` | `compare_compatibility` | L8-BRAIN-020の完全な二軸基準。 | dependency_versionだけを別軸値へ入替える。 | comparator未定義。mismatch class/reasonを創作せず当該軸を局所保留。 |
| `L8-BRAIN-027-KNOWLEDGE_IDENTITY` | `IV-BRAIN-027` / `L10-BRAIN-028-C08` | `compare_compatibility` | L8-BRAIN-020の完全な二軸基準。 | knowledge_identityだけを別軸値へ入替える。 | comparator未定義。mismatch class/reasonを創作せず当該軸を局所保留。 |
| `L8-BRAIN-027-KNOWLEDGE_VERSION` | `IV-BRAIN-027` / `L10-BRAIN-028-C08` | `compare_compatibility` | L8-BRAIN-020の完全な二軸基準。 | knowledge_versionだけを別軸値へ入替える。 | comparator未定義。mismatch class/reasonを創作せず当該軸を局所保留。 |
| `L8-BRAIN-027-KNOWLEDGE_REVISION` | `IV-BRAIN-027` / `L10-BRAIN-028-C08` | `compare_compatibility` | L8-BRAIN-020の完全な二軸基準。 | knowledge_revisionだけを別軸値へ入替える。 | comparator未定義。mismatch class/reasonを創作せず当該軸を局所保留。 |

## 3. NFR測定oracle fixture（7件）

NFRの数値・閾値は固定L3/L10の候補を測定する値であり、採択済みSLAや合格条件ではない。各NFR rowはfunctional oracleを参照するが、functional oracleを新しい親やNFRへ変換しない。Functional oracle参照は、該当IV IDを持つ全suffix fixtureを含む。局所保留は測定成功として数えない。

| L8 fixture ID | 固定L9 oracle / 固定L3測定項目 | L5関数・stub入力 | 単一条件または測定組 | 観測値と制限 |
|---|---|---|---|---|
| `L8-BRAIN-NFR-007-01` | `IV-BRAIN-NFR-007-01` / required provenance group coverage | `trace_source`; `IV-BRAIN-001`–`010`の対応fixture | 8 group fully resolved positiveを基準に、ProvenanceRef内source subgroupのidentity/revision各atomic field、同じProvenanceRef内の別provenance group、evidence/adopted reason/evaluated scope/counterexample/limitation、LABO target、個別field missing/stale/wrong-revision、owner receipt単独を測定母集団で別caseとして数える | 7 provenance groupとLABO targetのgroup別coverage、およびfield別coverage/候補trace/candidate維持を記録。source identity/revisionは一group内の2field。coverage 8/8は候補測定で閾値でない |
| `L8-BRAIN-NFR-007-02` | `IV-BRAIN-NFR-007-02` / false promotion | `trace_source`; 007 trace fixture群 | AI生成のみ、成功一件のみ、counterexample欠落、limitation欠落、LABO target mismatch、LABO/OS/BRAIN record単独の各一変異 | 誤昇格・owner代用件数を変異別に記録。0件候補は未測定であり新thresholdでない |
| `L8-BRAIN-NFR-008-01` | `IV-BRAIN-NFR-008-01` / named state distinction and pin stability | `read_knowledge`; `IV-BRAIN-011`–`019` | 5状態を個別positive fixtureで確認し、Core R pin後のR superseded/R2追加、R→R2返却、同revision bytes変更を個別変異 | state識別、exact R保持、silent replacementの件数を記録。追加state/遷移順/retentionを定めない |
| `L8-BRAIN-NFR-008-02` | `IV-BRAIN-NFR-008-02` / unknown handling | `read_knowledge`; `IV-BRAIN-011`–`019` | unknown identity/revision/state/conflict、actual version欠落、version_target代用を別fixtureにする | currentへの暗黙解決、candidate使用、owner間write-backの有無。unknownを成功分母から外さない |
| `L8-BRAIN-NFR-028-01` | `IV-BRAIN-NFR-028-01` / declared compatibility match | `compare_compatibility`; `IV-BRAIN-020`–`027` | descriptor/knowledge fieldごとの一致と単独不一致、range内/外/欠落/不能、actual version/version_targetを別入力で観測。owner comparator供給元が固定されるまでは比較positive未実施 | field/axis別の入力とUnknownを記録。Applicable/誤受理率の測定は未実施。range grammar/comparator未定義を測定成功と数えない |
| `L8-BRAIN-NFR-028-02` | `IV-BRAIN-NFR-028-02` / descriptor/knowledge axis separation | `compare_compatibility`; `IV-BRAIN-020`–`027` | exchange、update、rollback、unfinished-obligationをBRAIN ownerへ移したケースをそれぞれ独立に計測 | HARNESSへの戻し、BRAINでの受理/再定義の有無。NFR義務は増やさない |
| `L8-BRAIN-NFR-028-03` | `IV-BRAIN-NFR-028-03` / descriptor/knowledge axis separation | `compare_compatibility`; `IV-BRAIN-020`–`027` | descriptor identity、contract/artifact/dependency/knowledge version、knowledge revisionを一軸ずつ入替え | 軸ごとの誤受理・field・owner戻し先を記録。新しいversion syntax/valueを決めない |

## 4. trace、結果保持、未解決

| 確認対象 | 記録する内容 | 非肯定時の境界 |
|---|---|---|
| API入出力 | query/source/descriptorの完全なkind・identity・revision・digest、owner snapshot、呼出し関数、返却Observed field | `read_knowledge`へは`key_of`成功後の`ResultKey`とK5 `restore`由来のK2 `ResultRecord[]`を渡す。K2 `Rejected`はその境界から伝搬し、K1 `Observed`と混ぜない。 |
| source trace | 8 groupの解決状態、LABO target、LABO/OS/BRAIN/adoption各record、trace fieldごとの根拠 | 戻り値はfield別Observedを持つ`BrainSourceTrace`。source truth、実読、adoption、owner実在を設計から証明しない。 |
| knowledge | exact query/result revision、5 state、OS project-useの別record、R/R2の参照 | stale/conflictを最新currentへ置換しない。 |
| compatibility | HARNESS descriptor/range/dependencyとBRAIN knowledgeの別axis、固定owner contractからの比較結果供給元 | owner comparator供給元が未定義の間はApplicableをcaller注入せずUnknownのままにし、positive fixture/NFR測定を未実施とする。 |
| NFR candidate | denominator、valid/failed/missing/censored/未測定、候補coverage/誤昇格/誤受理値 | candidate値をSLA、PO条件、release条件に昇格しない。 |

固定L3/L10のbusiness行は独立business outcomeなしであり、business fixtureは作らない。実行時には現行L4/L9と親revisionを改めて照合する。本書はdraftで、全fixtureとNFR測定は未実行である。実装、承認、adoption、L3 efficacy、L10 pass、releaseを意味しない。
