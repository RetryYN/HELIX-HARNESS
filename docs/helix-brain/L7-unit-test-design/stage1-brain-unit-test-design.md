---
title: "HELIX-BRAIN Stage 1 単体検証設計"
canonical_vmodel: L1-L12
canonical_layer: L7
canonical_pair: L6
layer: L7
kind: unit_test_design
status: draft_candidate
authority_status: draft_candidate
stage: 1
paired_l6: ../L6-function-design/stage1-brain.md
paired_l6_sha256: 31e32f042f896dce387376cce7134690b32d1d77d92e1f8319ba5edce5587930
paired_l8: ../L8-detail-verification/stage1-brain-detail-verification.md
paired_l8_sha256: 7f1e074b5bd53f3bb41b8114a4d65265cf85e3bd47bb7bd8f23aa027951a8afa
---

# HELIX-BRAIN Stage 1 単体検証設計

本書はL8のfixture定義を単体関数候補のassertion境界へ写す。97 functional fixture IDと7 NFR定義ID、計104一意IDを各1 UT locatorへ対応させる。これは104個の独立変異や実行済みtest数を要求する意味ではない。L9 oracleは既存34個（functional 27、NFR 7）を維持する。列挙は設計候補であり、実装・テスト実行・L9合格・owner接続・承認を示さない。

## 1. 固定対象

| 入力 | SHA-256 |
|---|---|
| BRAIN L4 | `a981efc23ea0e85303a600f469d2d989b991b378a4b89ac94cf34bce004ccc9c` |
| BRAIN L5 | `bc6c79656b0d67235f85ff21b6b47beeafbc12edccf5ca819fdd8a7d7d824ead` |
| BRAIN L8 | `7f1e074b5bd53f3bb41b8114a4d65265cf85e3bd47bb7bd8f23aa027951a8afa` |
| BRAIN L9 | `2f61e7f4ff86db837b014f6500a143727df9611099106561aa74edca3e434787` |
| 対L6 | `b2c8d9d5a819bfa95638ef6fc838a3a189d5d3853de1f29c4c5f3ddd7f55dec7` |

Python 3.11+標準ライブラリと`unittest`をunit候補として選ぶ。typed in-memory projectionとSequence順序を外部依存なしに表せ、L6候補と型表現を揃えられるためである。製品toolchain、実reader、HARNESS comparatorは選定せず、実装・fixture実行もしていない。

L5の公開APIは`trace_source`、`read_knowledge`、`compare_compatibility`の3つ。007のcoverage対象は7 provenance group（source identity/revisionは同一group内の別atomic field）とLABO評価対象revisionの1 group、計8 groupである。これとは別にLABO、OS registration、BRAIN verification、adoptionの4 owner recordを別fieldで保持する。`trace_source`はfield別Observedの`BrainSourceTrace`を返し、外側Observedで包まない。`read_knowledge`はK2 `ResultKey`とK5 restore Value recordsをK2 `lookup`へ委譲する。K5 restore非Valueはcaller境界で短絡伝搬しlookupしない。comparator/result producerは未接続である。

## 2. L8定義とL9 oracleの一意trace

`UT-BRAIN-NNN`はL7 locatorであり、baseline・単一変異・期待は対応するL8定義行を参照する。NFRはfunctional fixtureへの測定traceで、独立mutationではない。

| UT ID | L8定義ID | 固定L9 oracle ID | assertion境界・局所状態 |
|---|---|---|---|
| `UT-BRAIN-001` | `L8-BRAIN-001` | `IV-BRAIN-001` | 純粋field projection候補。L8 baseline/単一field変異に対し、`trace_source`返値の対象fieldが入力Observedと一致し他fieldを保持する候補assertion。owner判定なし。 |
| `UT-BRAIN-002` | `L8-BRAIN-002-MISSING-SOURCE_IDENTITY` | `IV-BRAIN-002` | 局所hold：source member未定。L5 §3.6でsource identity/revision member名・encoding未定。materializeせず局所hold。 |
| `UT-BRAIN-003` | `L8-BRAIN-002-STALE-SOURCE_IDENTITY` | `IV-BRAIN-002` | 局所hold：source member未定。L5 §3.6でsource identity/revision member名・encoding未定。materializeせず局所hold。 |
| `UT-BRAIN-004` | `L8-BRAIN-002-DANGLING-SOURCE_IDENTITY` | `IV-BRAIN-002` | 局所hold：source member未定。L5 §3.6でsource identity/revision member名・encoding未定。materializeせず局所hold。 |
| `UT-BRAIN-005` | `L8-BRAIN-002-MISSING-SOURCE_REVISION` | `IV-BRAIN-002` | 局所hold：source member未定。L5 §3.6でsource identity/revision member名・encoding未定。materializeせず局所hold。 |
| `UT-BRAIN-006` | `L8-BRAIN-002-STALE-SOURCE_REVISION` | `IV-BRAIN-002` | 局所hold：source member未定。L5 §3.6でsource identity/revision member名・encoding未定。materializeせず局所hold。 |
| `UT-BRAIN-007` | `L8-BRAIN-002-DANGLING-SOURCE_REVISION` | `IV-BRAIN-002` | 局所hold：source member未定。L5 §3.6でsource identity/revision member名・encoding未定。materializeせず局所hold。 |
| `UT-BRAIN-008` | `L8-BRAIN-002-MISSING-PROVENANCE` | `IV-BRAIN-002` | 純粋field projection候補。L8 baseline/単一field変異に対し、`trace_source`返値の対象fieldが入力Observedと一致し他fieldを保持する候補assertion。owner判定なし。 |
| `UT-BRAIN-009` | `L8-BRAIN-002-STALE-PROVENANCE` | `IV-BRAIN-002` | 純粋field projection候補。L8 baseline/単一field変異に対し、`trace_source`返値の対象fieldが入力Observedと一致し他fieldを保持する候補assertion。owner判定なし。 |
| `UT-BRAIN-010` | `L8-BRAIN-002-DANGLING-PROVENANCE` | `IV-BRAIN-002` | 純粋field projection候補。L8 baseline/単一field変異に対し、`trace_source`返値の対象fieldが入力Observedと一致し他fieldを保持する候補assertion。owner判定なし。 |
| `UT-BRAIN-011` | `L8-BRAIN-002-MISSING-EVIDENCE` | `IV-BRAIN-002` | 純粋field projection候補。L8 baseline/単一field変異に対し、`trace_source`返値の対象fieldが入力Observedと一致し他fieldを保持する候補assertion。owner判定なし。 |
| `UT-BRAIN-012` | `L8-BRAIN-002-STALE-EVIDENCE` | `IV-BRAIN-002` | 純粋field projection候補。L8 baseline/単一field変異に対し、`trace_source`返値の対象fieldが入力Observedと一致し他fieldを保持する候補assertion。owner判定なし。 |
| `UT-BRAIN-013` | `L8-BRAIN-002-DANGLING-EVIDENCE` | `IV-BRAIN-002` | 純粋field projection候補。L8 baseline/単一field変異に対し、`trace_source`返値の対象fieldが入力Observedと一致し他fieldを保持する候補assertion。owner判定なし。 |
| `UT-BRAIN-014` | `L8-BRAIN-002-LABO-UNEVALUATED` | `IV-BRAIN-002` | 純粋field projection候補。L8 baseline/単一field変異に対し、`trace_source`返値の対象fieldが入力Observedと一致し他fieldを保持する候補assertion。owner判定なし。 |
| `UT-BRAIN-015` | `L8-BRAIN-003-MISSING-EVALUATED_SCOPE` | `IV-BRAIN-003` | 純粋field projection候補。L8 baseline/単一field変異に対し、`trace_source`返値の対象fieldが入力Observedと一致し他fieldを保持する候補assertion。owner判定なし。 |
| `UT-BRAIN-016` | `L8-BRAIN-003-MISSING-COUNTEREXAMPLE` | `IV-BRAIN-003` | 純粋field projection候補。L8 baseline/単一field変異に対し、`trace_source`返値の対象fieldが入力Observedと一致し他fieldを保持する候補assertion。owner判定なし。 |
| `UT-BRAIN-017` | `L8-BRAIN-003-MISSING-LIMITATION` | `IV-BRAIN-003` | 純粋field projection候補。L8 baseline/単一field変異に対し、`trace_source`返値の対象fieldが入力Observedと一致し他fieldを保持する候補assertion。owner判定なし。 |
| `UT-BRAIN-018` | `L8-BRAIN-003-MISSING-ADOPTED_REASON` | `IV-BRAIN-003` | 純粋field projection候補。L8 baseline/単一field変異に対し、`trace_source`返値の対象fieldが入力Observedと一致し他fieldを保持する候補assertion。owner判定なし。 |
| `UT-BRAIN-019` | `L8-BRAIN-004-AI-ONLY` | `IV-BRAIN-004` | 局所hold：adoption APIなし。adoption判定APIなし。snapshot境界のみ、BRAIN API/K1 resultを呼ばない。 |
| `UT-BRAIN-020` | `L8-BRAIN-004-SINGLE-RESULT` | `IV-BRAIN-004` | 局所hold：adoption APIなし。adoption判定APIなし。snapshot境界のみ、BRAIN API/K1 resultを呼ばない。 |
| `UT-BRAIN-021` | `L8-BRAIN-005` | `IV-BRAIN-005` | 純粋field projection候補。L8 baseline/単一field変異に対し、`trace_source`返値の対象fieldが入力Observedと一致し他fieldを保持する候補assertion。owner判定なし。 |
| `UT-BRAIN-022` | `L8-BRAIN-006` | `IV-BRAIN-006` | 純粋field projection候補。L8 baseline/単一field変異に対し、`trace_source`返値の対象fieldが入力Observedと一致し他fieldを保持する候補assertion。owner判定なし。 |
| `UT-BRAIN-023` | `L8-BRAIN-007-LABO` | `IV-BRAIN-007` | 純粋field projection候補。L8 baseline/単一field変異に対し、`trace_source`返値の対象fieldが入力Observedと一致し他fieldを保持する候補assertion。owner判定なし。 |
| `UT-BRAIN-024` | `L8-BRAIN-007-OS-REGISTRATION` | `IV-BRAIN-007` | 純粋field projection候補。L8 baseline/単一field変異に対し、`trace_source`返値の対象fieldが入力Observedと一致し他fieldを保持する候補assertion。owner判定なし。 |
| `UT-BRAIN-025` | `L8-BRAIN-007-BRAIN-VERIFICATION` | `IV-BRAIN-007` | 純粋field projection候補。L8 baseline/単一field変異に対し、`trace_source`返値の対象fieldが入力Observedと一致し他fieldを保持する候補assertion。owner判定なし。 |
| `UT-BRAIN-026` | `L8-BRAIN-007-ADOPTION` | `IV-BRAIN-007` | 純粋field projection候補。L8 baseline/単一field変異に対し、`trace_source`返値の対象fieldが入力Observedと一致し他fieldを保持する候補assertion。owner判定なし。 |
| `UT-BRAIN-027` | `L8-BRAIN-008` | `IV-BRAIN-008` | 純粋field projection候補。L8 baseline/単一field変異に対し、`trace_source`返値の対象fieldが入力Observedと一致し他fieldを保持する候補assertion。owner判定なし。 |
| `UT-BRAIN-028` | `L8-BRAIN-009` | `IV-BRAIN-009` | 純粋field projection候補。L8 baseline/単一field変異に対し、`trace_source`返値の対象fieldが入力Observedと一致し他fieldを保持する候補assertion。owner判定なし。 |
| `UT-BRAIN-029` | `L8-BRAIN-010` | `IV-BRAIN-010` | 純粋field projection候補。L8 baseline/単一field変異に対し、`trace_source`返値の対象fieldが入力Observedと一致し他fieldを保持する候補assertion。owner判定なし。 |
| `UT-BRAIN-030` | `L8-BRAIN-011` | `IV-BRAIN-011` | K2 lookup委譲候補。K2成功ResultKeyとK5 restore Value recordsで`read_knowledge`を呼び、L8記載のrecord/value/state/key保持をassert。 |
| `UT-BRAIN-031` | `L8-BRAIN-012-KEY-MISSING` | `IV-BRAIN-012` | 既存K2境界参照。既存K2 `key_of`/lookup境界の期待のみ。BRAIN `read_knowledge`へ不正keyを渡さない。 |
| `UT-BRAIN-032` | `L8-BRAIN-012-KEY-DIGEST` | `IV-BRAIN-012` | 既存K2境界参照。既存K2 `key_of`/lookup境界の期待のみ。BRAIN `read_knowledge`へ不正keyを渡さない。 |
| `UT-BRAIN-033` | `L8-BRAIN-012-KEY-DUPLICATE` | `IV-BRAIN-012` | 既存K2境界参照。既存K2 `key_of`/lookup境界の期待のみ。BRAIN `read_knowledge`へ不正keyを渡さない。 |
| `UT-BRAIN-034` | `L8-BRAIN-012-NO-MATCH` | `IV-BRAIN-012` | K2 lookup委譲候補。成功済みexact ResultKeyとK5 restore Value recordsで`read_knowledge`を呼び、一致recordなしの`Unobserved(not_run)`を確認。不正keyのcaseではない。 |
| `UT-BRAIN-035` | `L8-BRAIN-012-SAVED-UNKNOWN` | `IV-BRAIN-012` | K2 lookup委譲候補。成功済みexact ResultKeyとK5 restore Value recordsで`read_knowledge`を呼び、保存record結果の`Unknown(missing_input)`をそのまま確認。 |
| `UT-BRAIN-036` | `L8-BRAIN-012-VERSION-UNKNOWN` | `IV-BRAIN-012` | K2 lookup委譲候補。成功済みexact ResultKeyとK5 restore Value recordsで`read_knowledge`を呼び、`BrainKnowledgeRecord.version`の`Unknown(missing_input)`を保持する。 |
| `UT-BRAIN-037` | `L8-BRAIN-012-VERSION-MISSING` | `IV-BRAIN-012` | K5 caller短絡境界。K5 restore非Valueのcaller短絡境界。Observed保持・lookup未呼出しをtraceするがproduction caller未接続。 |
| `UT-BRAIN-038` | `L8-BRAIN-012-SAME-KEY-CONFLICT` | `IV-BRAIN-012` | K2 lookup委譲候補。成功済みexact queryとK5 Value recordsの同一ResultKeyに異なるresult bytesを与え、`read_knowledge`が`Unknown(conflict)`を返すことを確認。 |
| `UT-BRAIN-039` | `L8-BRAIN-012-OLD-VALUE` | `IV-BRAIN-012` | K2 lookup委譲候補。成功済みquery R2を固定し、recordだけをprior revision RのValueにする。`read_knowledge`の`Stale(prior=Value, recorded_key, current_key)`を確認。 |
| `UT-BRAIN-040` | `L8-BRAIN-012-OLD-NONVALUE` | `IV-BRAIN-012` | K5 caller短絡境界。K5 restore非Valueのcaller短絡境界。Observed保持・lookup未呼出しをtraceするがproduction caller未接続。 |
| `UT-BRAIN-041` | `L8-BRAIN-012-OLD-UNKNOWN-LOOKUP` | `IV-BRAIN-012` | K2 lookup委譲候補。K5 Value payload内のR2 record結果を`Unknown(missing_input)`に固定し、成功済みquery subject revisionだけR2からRへ変更する。`read_knowledge`が`Unobserved(not_run, superseded=prior.key_digest)`を返すことを確認する。 |
| `UT-BRAIN-042` | `L8-BRAIN-013` | `IV-BRAIN-013` | K2 lookup委譲候補。K2成功ResultKeyとK5 restore Value recordsで`read_knowledge`を呼び、L8記載のrecord/value/state/key保持をassert。 |
| `UT-BRAIN-043` | `L8-BRAIN-014` | `IV-BRAIN-014` | K2 lookup委譲候補。K2成功ResultKeyとK5 restore Value recordsで`read_knowledge`を呼び、L8記載のrecord/value/state/key保持をassert。 |
| `UT-BRAIN-044` | `L8-BRAIN-015` | `IV-BRAIN-015` | K2 lookup委譲候補。K2成功ResultKeyとK5 restore Value recordsで`read_knowledge`を呼び、L8記載のrecord/value/state/key保持をassert。 |
| `UT-BRAIN-045` | `L8-BRAIN-016` | `IV-BRAIN-016` | K2 lookup委譲候補。K2成功ResultKeyとK5 restore Value recordsで`read_knowledge`を呼び、L8記載のrecord/value/state/key保持をassert。 |
| `UT-BRAIN-046` | `L8-BRAIN-012-IDENTITY-MISSING` | `IV-BRAIN-012` | 既存K2境界参照。既存K2 `key_of`/lookup境界の期待のみ。BRAIN `read_knowledge`へ不正keyを渡さない。 |
| `UT-BRAIN-047` | `L8-BRAIN-012-REVISION-MISSING` | `IV-BRAIN-012` | 既存K2境界参照。既存K2 `key_of`/lookup境界の期待のみ。BRAIN `read_knowledge`へ不正keyを渡さない。 |
| `UT-BRAIN-048` | `L8-BRAIN-012-RECORD-STATE-UNKNOWN` | `IV-BRAIN-012` | K2 lookup委譲候補。K2成功ResultKeyとK5 restore Value recordsで`read_knowledge`を呼び、L8記載のrecord/value/state/key保持をassert。 |
| `UT-BRAIN-049` | `L8-BRAIN-016-UNKNOWN-STATE` | `IV-BRAIN-016` | K2 lookup委譲候補。K2成功ResultKeyとK5 restore Value recordsで`read_knowledge`を呼び、L8記載のrecord/value/state/key保持をassert。 |
| `UT-BRAIN-050` | `L8-BRAIN-017-CURRENT` | `IV-BRAIN-017` | K2 lookup委譲候補。K2成功ResultKeyとK5 restore Value recordsで`read_knowledge`を呼び、L8記載のrecord/value/state/key保持をassert。 |
| `UT-BRAIN-051` | `L8-BRAIN-017-SUPERSEDED` | `IV-BRAIN-017` | K2 lookup委譲候補。K2成功ResultKeyとK5 restore Value recordsで`read_knowledge`を呼び、L8記載のrecord/value/state/key保持をassert。 |
| `UT-BRAIN-052` | `L8-BRAIN-017-DEPRECATED` | `IV-BRAIN-017` | K2 lookup委譲候補。K2成功ResultKeyとK5 restore Value recordsで`read_knowledge`を呼び、L8記載のrecord/value/state/key保持をassert。 |
| `UT-BRAIN-053` | `L8-BRAIN-017-EXPERIMENTAL` | `IV-BRAIN-017` | K2 lookup委譲候補。K2成功ResultKeyとK5 restore Value recordsで`read_knowledge`を呼び、L8記載のrecord/value/state/key保持をassert。 |
| `UT-BRAIN-054` | `L8-BRAIN-017-RETIRED` | `IV-BRAIN-017` | K2 lookup委譲候補。K2成功ResultKeyとK5 restore Value recordsで`read_knowledge`を呼び、L8記載のrecord/value/state/key保持をassert。 |
| `UT-BRAIN-055` | `L8-BRAIN-018` | `IV-BRAIN-018` | K2 lookup委譲候補。K2成功ResultKeyとK5 restore Value recordsで`read_knowledge`を呼び、L8記載のrecord/value/state/key保持をassert。 |
| `UT-BRAIN-056` | `L8-BRAIN-019` | `IV-BRAIN-019` | K2 lookup委譲候補。K2成功ResultKeyとK5 restore Value recordsで`read_knowledge`を呼び、L8記載のrecord/value/state/key保持をassert。 |
| `UT-BRAIN-057` | `L8-BRAIN-020` | `IV-BRAIN-020` | 局所hold：comparator未接続。comparator/result producer未接続。Applicable等を作らずoracle充足に数えない。 |
| `UT-BRAIN-058` | `L8-BRAIN-021-IDENTITY-UNKNOWN` | `IV-BRAIN-021` | 局所hold：comparator未接続。comparator/result producer未接続。Applicable等を作らずoracle充足に数えない。 |
| `UT-BRAIN-059` | `L8-BRAIN-021-REVISION-UNKNOWN` | `IV-BRAIN-021` | 既存K2境界参照。既存K2 `key_of`/lookup境界の期待のみ。BRAIN `read_knowledge`へ不正keyを渡さない。 |
| `UT-BRAIN-060` | `L8-BRAIN-021-RANGE-OUTSIDE` | `IV-BRAIN-021` | 局所hold：comparator未接続。comparator/result producer未接続。Applicable等を作らずoracle充足に数えない。 |
| `UT-BRAIN-061` | `L8-BRAIN-021-FIELD-MISSING` | `IV-BRAIN-021` | 局所hold：comparator未接続。comparator/result producer未接続。Applicable等を作らずoracle充足に数えない。 |
| `UT-BRAIN-062` | `L8-BRAIN-021-NO-FALLBACK-SAME-IDENTITY-STALE` | `IV-BRAIN-021` | K2 lookup委譲候補。K2成功ResultKeyとK5 restore Value recordsで`read_knowledge`を呼び、L8記載のrecord/value/state/key保持をassert。 |
| `UT-BRAIN-063` | `L8-BRAIN-021-NO-FALLBACK-DIFFERENT-IDENTITY` | `IV-BRAIN-021` | K2 lookup委譲候補。K2成功ResultKeyとK5 restore Value recordsで`read_knowledge`を呼び、L8記載のrecord/value/state/key保持をassert。 |
| `UT-BRAIN-064` | `L8-BRAIN-022-M-DESCRIPTOR_KIND` | `IV-BRAIN-022` | 局所hold：descriptor member未定。descriptor member reader/encoding未定。L8 projection holdを維持しpublic resultへ写さない。 |
| `UT-BRAIN-065` | `L8-BRAIN-022-X-DESCRIPTOR_KIND` | `IV-BRAIN-022` | 局所hold：descriptor member未定。descriptor member reader/encoding未定。L8 projection holdを維持しpublic resultへ写さない。 |
| `UT-BRAIN-066` | `L8-BRAIN-022-M-DEPENDENCY_IDENTITY` | `IV-BRAIN-022` | 局所hold：descriptor member未定。descriptor member reader/encoding未定。L8 projection holdを維持しpublic resultへ写さない。 |
| `UT-BRAIN-067` | `L8-BRAIN-022-X-DEPENDENCY_IDENTITY` | `IV-BRAIN-022` | 局所hold：descriptor member未定。descriptor member reader/encoding未定。L8 projection holdを維持しpublic resultへ写さない。 |
| `UT-BRAIN-068` | `L8-BRAIN-022-M-VERIFICATION_SCOPE` | `IV-BRAIN-022` | 局所hold：descriptor member未定。descriptor member reader/encoding未定。L8 projection holdを維持しpublic resultへ写さない。 |
| `UT-BRAIN-069` | `L8-BRAIN-022-X-VERIFICATION_SCOPE` | `IV-BRAIN-022` | 局所hold：descriptor member未定。descriptor member reader/encoding未定。L8 projection holdを維持しpublic resultへ写さない。 |
| `UT-BRAIN-070` | `L8-BRAIN-022-M-KNOWLEDGE_VERSION` | `IV-BRAIN-022` | K2 lookup委譲候補。K2成功ResultKeyとK5 restore Value recordsで`read_knowledge`を呼び、L8記載のrecord/value/state/key保持をassert。 |
| `UT-BRAIN-071` | `L8-BRAIN-022-X-KNOWLEDGE_VERSION` | `IV-BRAIN-022` | K2 lookup委譲候補。K2成功ResultKeyとK5 restore Value recordsで`read_knowledge`を呼び、L8記載のrecord/value/state/key保持をassert。 |
| `UT-BRAIN-072` | `L8-BRAIN-022-M-CONTRACT-VERSION` | `IV-BRAIN-022` | 局所hold：descriptor member未定。descriptor member reader/encoding未定。L8 projection holdを維持しpublic resultへ写さない。 |
| `UT-BRAIN-073` | `L8-BRAIN-022-X-CONTRACT-VERSION` | `IV-BRAIN-022` | 局所hold：descriptor member未定。descriptor member reader/encoding未定。L8 projection holdを維持しpublic resultへ写さない。 |
| `UT-BRAIN-074` | `L8-BRAIN-022-M-ARTIFACT-VERSION` | `IV-BRAIN-022` | 局所hold：descriptor member未定。descriptor member reader/encoding未定。L8 projection holdを維持しpublic resultへ写さない。 |
| `UT-BRAIN-075` | `L8-BRAIN-022-X-ARTIFACT-VERSION` | `IV-BRAIN-022` | 局所hold：descriptor member未定。descriptor member reader/encoding未定。L8 projection holdを維持しpublic resultへ写さない。 |
| `UT-BRAIN-076` | `L8-BRAIN-022-M-DEPENDENCY-VERSION` | `IV-BRAIN-022` | 局所hold：descriptor member未定。descriptor member reader/encoding未定。L8 projection holdを維持しpublic resultへ写さない。 |
| `UT-BRAIN-077` | `L8-BRAIN-022-X-DEPENDENCY-VERSION` | `IV-BRAIN-022` | 局所hold：descriptor member未定。descriptor member reader/encoding未定。L8 projection holdを維持しpublic resultへ写さない。 |
| `UT-BRAIN-078` | `L8-BRAIN-022-M-KNOWLEDGE_STATE` | `IV-BRAIN-022` | 局所hold：comparator未接続。comparator/result producer未接続。Applicable等を作らずoracle充足に数えない。 |
| `UT-BRAIN-079` | `L8-BRAIN-022-X-KNOWLEDGE_STATE` | `IV-BRAIN-022` | 局所hold：comparator未接続。comparator/result producer未接続。Applicable等を作らずoracle充足に数えない。 |
| `UT-BRAIN-080` | `L8-BRAIN-023-OUTSIDE` | `IV-BRAIN-023` | 局所hold：comparator未接続。comparator/result producer未接続。Applicable等を作らずoracle充足に数えない。 |
| `UT-BRAIN-081` | `L8-BRAIN-023-MISSING` | `IV-BRAIN-023` | 局所hold：descriptor member未定。descriptor member reader/encoding未定。L8 projection holdを維持しpublic resultへ写さない。 |
| `UT-BRAIN-082` | `L8-BRAIN-023-UNINTERPRETABLE` | `IV-BRAIN-023` | 局所hold：descriptor member未定。descriptor member reader/encoding未定。L8 projection holdを維持しpublic resultへ写さない。 |
| `UT-BRAIN-083` | `L8-BRAIN-024-CONTRACT-VERSION-TARGET` | `IV-BRAIN-024` | 局所hold：descriptor member未定。descriptor member reader/encoding未定。L8 projection holdを維持しpublic resultへ写さない。 |
| `UT-BRAIN-084` | `L8-BRAIN-024-ARTIFACT-VERSION-TARGET` | `IV-BRAIN-024` | 局所hold：descriptor member未定。descriptor member reader/encoding未定。L8 projection holdを維持しpublic resultへ写さない。 |
| `UT-BRAIN-085` | `L8-BRAIN-024-KNOWLEDGE-VERSION-TARGET` | `IV-BRAIN-024` | K2 lookup委譲候補。K2成功ResultKeyとK5 restore Value recordsで`read_knowledge`を呼び、L8記載のrecord/value/state/key保持をassert。 |
| `UT-BRAIN-086` | `L8-BRAIN-025-EXCHANGE` | `IV-BRAIN-025` | 構造照合のみ。BRAINの3公開APIにoperationなし。構造traceのみでK1 classを主張しない。 |
| `UT-BRAIN-087` | `L8-BRAIN-025-UPDATE` | `IV-BRAIN-025` | 構造照合のみ。BRAINの3公開APIにoperationなし。構造traceのみでK1 classを主張しない。 |
| `UT-BRAIN-088` | `L8-BRAIN-025-ROLLBACK` | `IV-BRAIN-025` | 構造照合のみ。BRAINの3公開APIにoperationなし。構造traceのみでK1 classを主張しない。 |
| `UT-BRAIN-089` | `L8-BRAIN-025-UNFINISHED_OBLIGATION` | `IV-BRAIN-025` | 構造照合のみ。BRAINの3公開APIにoperationなし。構造traceのみでK1 classを主張しない。 |
| `UT-BRAIN-090` | `L8-BRAIN-026` | `IV-BRAIN-026` | 局所hold：comparator未接続。comparator/result producer未接続。Applicable等を作らずoracle充足に数えない。 |
| `UT-BRAIN-091` | `L8-BRAIN-027-DESCRIPTOR_IDENTITY` | `IV-BRAIN-027` | 局所hold：comparator未接続。comparator/result producer未接続。Applicable等を作らずoracle充足に数えない。 |
| `UT-BRAIN-092` | `L8-BRAIN-027-CONTRACT_VERSION` | `IV-BRAIN-027` | 局所hold：descriptor member未定。descriptor member reader/encoding未定。L8 projection holdを維持しpublic resultへ写さない。 |
| `UT-BRAIN-093` | `L8-BRAIN-027-ARTIFACT_VERSION` | `IV-BRAIN-027` | 局所hold：descriptor member未定。descriptor member reader/encoding未定。L8 projection holdを維持しpublic resultへ写さない。 |
| `UT-BRAIN-094` | `L8-BRAIN-027-DEPENDENCY_VERSION` | `IV-BRAIN-027` | 局所hold：descriptor member未定。descriptor member reader/encoding未定。L8 projection holdを維持しpublic resultへ写さない。 |
| `UT-BRAIN-095` | `L8-BRAIN-027-KNOWLEDGE_IDENTITY` | `IV-BRAIN-027` | 局所hold：comparator未接続。comparator/result producer未接続。Applicable等を作らずoracle充足に数えない。 |
| `UT-BRAIN-096` | `L8-BRAIN-027-KNOWLEDGE_VERSION` | `IV-BRAIN-027` | 局所hold：comparator未接続。comparator/result producer未接続。Applicable等を作らずoracle充足に数えない。 |
| `UT-BRAIN-097` | `L8-BRAIN-027-KNOWLEDGE_REVISION` | `IV-BRAIN-027` | 局所hold：comparator未接続。comparator/result producer未接続。Applicable等を作らずoracle充足に数えない。 |
| `UT-BRAIN-098` | `L8-BRAIN-NFR-007-01` | `IV-BRAIN-NFR-007-01` | NFR trace／未測定。functional fixtureを再利用するNFR trace。独立mutation/閾値なし、未測定。 |
| `UT-BRAIN-099` | `L8-BRAIN-NFR-007-02` | `IV-BRAIN-NFR-007-02` | NFR trace／未測定。functional fixtureを再利用するNFR trace。独立mutation/閾値なし、未測定。 |
| `UT-BRAIN-100` | `L8-BRAIN-NFR-008-01` | `IV-BRAIN-NFR-008-01` | NFR trace／未測定。functional fixtureを再利用するNFR trace。独立mutation/閾値なし、未測定。 |
| `UT-BRAIN-101` | `L8-BRAIN-NFR-008-02` | `IV-BRAIN-NFR-008-02` | NFR trace／未測定。functional fixtureを再利用するNFR trace。独立mutation/閾値なし、未測定。 |
| `UT-BRAIN-102` | `L8-BRAIN-NFR-028-01` | `IV-BRAIN-NFR-028-01` | NFR trace／未測定。functional fixtureを再利用するNFR trace。独立mutation/閾値なし、未測定。 |
| `UT-BRAIN-103` | `L8-BRAIN-NFR-028-02` | `IV-BRAIN-NFR-028-02` | NFR trace／未測定。functional fixtureを再利用するNFR trace。独立mutation/閾値なし、未測定。 |
| `UT-BRAIN-104` | `L8-BRAIN-NFR-028-03` | `IV-BRAIN-NFR-028-03` | NFR trace／未測定。functional fixtureを再利用するNFR trace。独立mutation/閾値なし、未測定。 |

## 3. 再利用traceと件数

L8 §2.1の3組は同一fixture mutationを複数L9 oracleへ参照する。104件は定義IDを参照するlocator indexであり、fixture・独立変異・実行test数として二重計上も強制もしない。

| 同一fixture定義 | L9 trace |
|---|---|
| `L8-BRAIN-002-LABO-UNEVALUATED` / `L8-BRAIN-010` | IV-002/IV-010。field保持だけでowner oracleを充足しない。 |
| `L8-BRAIN-012-RECORD-STATE-UNKNOWN` / `L8-BRAIN-016-UNKNOWN-STATE` | IV-012/IV-016。未知stateを正常対照に含めない。 |
| `L8-BRAIN-021-RANGE-OUTSIDE` / `L8-BRAIN-023-OUTSIDE` | IV-021/IV-023。comparator未接続のため判定未実施。 |

| 区分 | 件数 | 状態 |
|---|---:|---|
| Functional L8 ID | 97 | 27既存functional oracleへtrace |
| NFR L8 ID | 7 | 7既存NFR oracleへtrace、未測定 |
| 一意定義ID / UT locator | 104 / 104 | 各IDへのindex。独立変異数・実行数ではない |
| 一意L9 oracle ID | 34 | functional 27 + NFR 7 |
| 再利用ペア | 3 | 追加fixture/変異なし |

| assertion境界 | 件数 | 扱い |
|---|---:|---|
| `trace_source` pure projection | 21 | 入力Observedのfield保持候補 |
| source identity/revision member | 6 | member名/encoding未定でhold |
| adoption API不在 | 2 | API呼出しなし |
| `read_knowledge`/K2 lookup | 25 | exact successful key + K5 Value recordsからの委譲・結果保持候補 |
| K2 `key_of`拒否境界 | 6 | 不完全/不正keyのみ既存K2 oracle参照、BRAIN API未呼出 |
| K5 restore非Value短絡 | 2 | caller境界、production caller未接続 |
| comparator依存`compare_compatibility` | 12 | owner comparator未接続でhold |
| descriptor member projection | 19 | member reader/encoding未定でhold |
| BRAIN API不在の構造照合 | 4 | K1 classを作らない |
| NFR trace | 7 | 独立fixture/閾値なし、未測定 |
| 合計 | 104 | IDを一分類にのみ割当 |

## 4. Assertion境界

- `trace_source`: 対象fieldの入力Observed一致と他field保持を候補assertionとする。source authenticity、adoption、owner適合は判定しない。source identity/revision 6行はmember shape未定のためmaterializeしない。
- `read_knowledge`: L8の成功済み完全K2 keyとK5 restore Value recordsで既存lookup返値を確認する。NO-MATCH、保存Unknown、version Unknown、same-key conflict、prior Value、prior Unknown lookupの6行もこの委譲経路であり、K2の既存期待を使いつつ`read_knowledge`戻り値まで照合する。不完全/不正keyの6行だけをK2 `key_of`境界とし、L5 APIへ渡さない。
- K5非Value: 同一Observedの短絡とlookup未呼出しをcaller境界traceする。L5にproduction callerは定義されていないため、接続済みAPI testではない。
- `compare_compatibility`: comparator、descriptor member reader、range grammar、owner result producerが未固定。該当12比較行と19 member行をL9 oracle達成として数えない。
- NFR: denominator、missing、censored、未測定の計画を参照する。threshold/SLAやparameter承認は作らない。
- Business: 固定L4/L9に独立business oracleはない。business-specific unitや合否を追加しない。

## 5. 旧HELIX対応

旧資産はBRAIN L4 §5の14 source rows（functional 11 + phase/trace 3）を起点とし、L5 §3.5 crosswalkと同じ対応を保つ。archiveの対応spanはread-onlyで読み、full SHA-256を実bytesから再計算してL4表と照合した。asset ID/path/line/full SHA/ledger status/保持・変更理由は対L6 §5に全件記録し、ここでは同じcrosswalkを参照する。14件を現行consumerとして数え直さない。ledger全件は`Historical/unresolved/unknown/consumer_refs=[]`であり、旧test/runtime/CIの結果は現行証拠にしない。

## 6. 実行状態と未解決

104 locator行はL8定義への設計traceであり、104個の独立mutationや実行test数ではない。以下のsource-only候補について13件の`unittest` methodを実行したが、L8/L9 fixture全体、production reader、L9 oracleは実行していない。projection 21件とlookup保持候補25件の正式分類は変更しない。source member 6、adoption 2、comparator 12、descriptor member 19、API不在構造4は局所hold、NFR 7は未測定である。K2拒否とK1結果分類は既存CK契約へ戻し、BRAIN独自分類を作らない。新しい承認、gate、owner、API、reasonを追加しない。旧CLI、archive内runtime/test/CI、Bunは実行していない。

## 7. 局所source候補の実行trace

次の試験は`helix/helix-brain/units/stage1-brain/tests/test_brain.py`にあるsource-only候補の合成unit testである。正式UT locator IDはL8への既存traceであり、ここへの対応は当該L8 oracle全体の充足・L9 pass・owner接続を意味しない。1つのPython test内のsubTestはformal IDや独立実行数へ加算しない。

| 実行method | L7 formal locator / L8定義との部分trace | 実際にassertすること | formal oracleに残る未実施事項 |
|---|---|---|---|
| `test_trace_source_projects_each_declared_field_and_keeps_owner_roles` | `UT-BRAIN-001`。field保持の部分候補 | baselineの8 top-level fieldが一致し、4 owner observationがroleを保つ。 | L8正常条件全体、owner sourceのcurrentness/真正性、source truthやadoptionは未検査。 |
| `test_trace_source_preserves_k1_variants_without_reclassifying_other_fields` | `UT-BRAIN-008`–`018`、`UT-BRAIN-021`–`029`へのfield projection部分trace | 7 top-level Observed fieldごとにValue/Unknown/Unobserved/NotApplicable/Staleを入力し、対象fieldのobjectと他fieldが変わらず保持される。 | 各L8のdomain-specific mutation/owner判断、ProvenanceRef内source identity/revision member 6件、descriptor memberの意味比較は未検査。 |
| `test_trace_source_keeps_owner_observations_in_their_own_fields` | `UT-BRAIN-023`–`026`へのowner-field保持部分trace | 4 owner fieldそれぞれへK1 variantを与え、同名fieldに保持し他owner fieldを差し替えない。 | owner recordの実読、正当性、routing、採用判定は未検査。 |
| `test_read_knowledge_returns_exact_k2_lookup_value` / `test_read_knowledge_keeps_each_declared_state_payload` | `UT-BRAIN-030`、`042`–`045`、`048`–`056`へのlookup payload部分trace | exact K2 keyで保存Valueを得た場合のK2戻り値保持。列挙された5 stateはrecord payload内で不変である。 | OS project-use、BRAIN state遷移、current owner reader、および各L8の別要件は未検査。 |
| `test_read_knowledge_preserves_k2_no_match` | `UT-BRAIN-034` | K2の`Unobserved(not_run)`をそのまま返す。 | 保存sourceの完全読取やK5 caller接続は未検査。 |
| `test_read_knowledge_preserves_saved_unknown_observation` / `test_read_knowledge_keeps_nested_version_unknown_in_record_value` / `test_read_knowledge_keeps_nested_state_unknown_in_record_value` | `UT-BRAIN-035`–`036`、`048`–`049`への結果保持部分trace | 保存結果のUnknownとValue payload内のversion/state UnknownをK2 lookup経由で保持する。 | Unknownのsource別reason mappingやcurrent owner resolutionは未検査。 |
| `test_read_knowledge_preserves_same_key_content_conflict` | `UT-BRAIN-038` | exact同一keyで異なる結果digestを持つK2 recordsの`Unknown(conflict)`を保持する。 | BRAIN固有のconflict policyやsource内容の真正性は未検査。 |
| `test_read_knowledge_preserves_prior_value_as_k2_stale` / `test_read_knowledge_does_not_mutate_restored_records` | `UT-BRAIN-039` | prior revisionのValueに対するK2 `Stale`とrecord bytes不変を保持する。 | current reader、K5 restore、product-side更新動作は未検査。 |
| `test_read_knowledge_preserves_prior_nonvalue_as_k2_unobserved` | `UT-BRAIN-041` | prior revision r1の`Unknown(missing_input)` recordにcurrent query r2を与え、K2が返す`Unobserved(not_run, superseded=key_digest)`を保持する。正式locatorのquery R2→Rに対し、本testはrecord r1／query r2で同じrevision不一致境界だけを部分検査する。 | K5 restore非Valueを受けたcallerの短絡は未検査。 |

次のlocatorはこのsource候補から実行していない。K2 `key_of`拒否は既存K2所有のため重複実装しない（`UT-BRAIN-031`–`033`、`046`–`047`、`059`）。K5 restore非Valueのcaller短絡はBRAIN production call site未接続のためholdする（`UT-BRAIN-037`、`040`）。`compare_compatibility`、adoption、descriptor member、lifecycle no-call oracleは引き続きowner返却または構造hold（`UT-BRAIN-019`–`020`、`057`–`097`）。NFR locator `UT-BRAIN-098`–`104`は未測定である。

試験コマンドは`PYTHONDONTWRITEBYTECODE=1 python3 -B -m unittest discover -s helix/helix-brain/units/stage1-brain/tests -v`。実行時点で13 test methodsが通過した。source-only candidateの配置には`declaration.json`、型番、version、owner登録がなく、正式pack、登録済み依存、production接続として数えない。
