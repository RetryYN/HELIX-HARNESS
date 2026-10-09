---
title: "HELIX-LABO Stage 1 L6関数設計"
layer: L6
status: draft_for_independent_review
owner: HELIX-LABO
paired_l5: ../L5-detail-design/stage1-labo.md
paired_l7: ../L7-unit-test-design/stage1-labo-unit-test-design.md
base: main `7f95f61fc1e1ae1dd790fa46581aba34921d73c0`
---

# HELIX-LABO Stage 1（001／011）関数設計

本書は固定Stage 1 L4契約とLABO L5 API候補を関数境界へ写す設計草稿である。L5公開API、owner/source接続、正式fixture実行、製品登録、業務完了は実装済みと主張しない。局所source-only private helper候補の実装記録は§6に限定して記す。

## 1. 固定入力と参照境界

| 文書 | 固定revision | SHA-256 | この設計で使う範囲 |
|---|---|---|---|
| LABO L4 | main `7f95f61fc1e1ae1dd790fa46581aba34921d73c0` | `6ea7c6497e2349e63ed05a7a686e96e108a769a2ac864cf02295f174c00c6f1a` | §1–5の親・型・authority・K1/K2境界 |
| LABO L5 | 同上 | `0311794cd1fdb73673449de96bf3ea50d981ce6ed701443ff71292e266e4cc97` | 3 API signature、value shape、key/source境界 |
| LABO L8 | 同上 | `1d5d8e6b8046c8776493cf7ba0019efa1f33d8c2f14064557906d513f0e00d7a` | 88定義IDの基準入力・単独変異・固定期待 |
| LABO L9 | 同上 | `a19f842cd6fe9576a0984651cd4aff554bb9355304c9b1f619480cd9d7867973` | 35 verifier oracle |
| Common Kernel L4 | 同上 | `3f7245e8fb548bab199107b1a020f0efea08713a5299076988326dae9feeb696` | K1/K2等の意味の正本。§3で必要な既存条件だけ参照 |
| Common Kernel L5 | 同上 | `3f3867df4e04927fbf05615984654f2994dd76ac71fed0ee420d5edce36a2c69` | K1 `Observed<T>`/K2 `ResultKey` API shape |
| Common Kernel L6 | 同上 | `340fc3b5f263d82bbc9c4d0b8e5a7d93ef4447781b8ef988a1e7e7919a04b7ae` | 既存K1/K2関数契約の実装設計参照 |
| Common Kernel L7 | 同上 | `0a232dbb019d703b39941f920cbb561538b92bc977fa0f197c8560198708a9f5` | 既存K1/K2テスト設計の型参照 |

固定親はL4 §1でpinされた`HELIXLABO-L2-001`と`HELIXLABO-L2-011`に限る。L3/L10の承認内容はL4 §1の対象revision・個別本文SHAを正本として参照し、後続revisionや別Stageの値を混ぜない。K8 typo PR #2779で返却されたCommon Kernel L4 crosswalk pin 3件は本作業で個別の旧revision照合をしていないため、その3件が現行本文と一致するとは主張しない。本書のK1/K2境界は上表の直接固定Common Kernel L4/L5 bytesを読む。

対象のoracle分母はL9の28 functional、5 NFR、2 scope、合計35 IDである。L8は88定義IDで、83個のfunctional/status/scope variantと5個のNFR再利用索引を持つ。NFR索引5件を追加fixture数・追加L9 oracle数として数えない。

## 2. 旧HELIX sourceとの対応

L4 §4とL9 §5、`docs/governance/legacy-asset-disposition.jsonl`を起点に旧9資産を再読した。以下のpath/span/full-file SHAはその固定記録を参照する。各資産の台帳状態は`Historical`、実装状態不明、`consumer_refs`空であり、旧runtime・CLI・test・CIは実行していない。

| Asset ID / source path:span | full-file SHA-256 | 旧consumer・failureから保持する点 | 変更・置換理由 |
|---|---|---|---|
| `LEGACY-ASSET-F542125805B777D8A56A` `archive/legacy-generation-2026-09-14/root/docs/process/forward/L00-L06-design-phase.md:13–21,101,148–168` | `9f8fc48a087fa9ba6e629518fb376630d7863491d2f85be96a8b3fd0c6d2efc3` | FR/ACと検証を対にし、failureを個別に扱う構造 | 現行L3/L10とpairの意味に再導出。旧layer/runtime/gateは置換 |
| `LEGACY-ASSET-B30F3C82B6B0FDC0D2A8` `archive/legacy-generation-2026-09-14/root/docs/process/gates.md:41,64` | `dcbc0009d6fd7576cd305f90cfbf47916f666ada0031711f1fa1f952b7014b08` | G3で要求・ACと検証を照合するtrace | 固定L9 oracleへのtraceに再導出。旧gate実行を持ち込まない |
| `LEGACY-ASSET-6EBDB617A8104A7756D0` `archive/legacy-generation-2026-09-14/root/CLAUDE.md:82–85` | `7bdfc0bc578359e42efae4242ee42b53abd6e2ec23874f1294d3ec0e278c8feb` | 人が持つ上流意味とAI下流作業の境界 | 現行Concept/L1–L3への対応を維持。旧層番号を移植しない |
| `LEGACY-ASSET-A6E2C7F0565E5F804F06` `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/business-detail.md:137–145` | `99a099d69cae60bd5d55c38221eb9ed814abf15ba59b3ac32f27d69fd0d6ad5d` | invocation log破損時に対象sourceを分離し、他sourceの有効結果を保持するfailure例 | source別failure isolationだけ再導出。dashboard、4 source、5 metric、30秒polling、token costは固定親にないため除く |
| `LEGACY-ASSET-B5B5E71B2AF1459D59A1` `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md:22–34` | `a90609ad8145d8b9c1be6a6870b6ecad4bc71f3708fc977edd14f926c074257a` | 旧HARNESS要件のfailure/source例 | 現行LABO source observationとの直接consumer一致なし。固定L2/L11から再導出 |
| `LEGACY-ASSET-EE5DBACC7F28F7D1F605` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md:134–153,178–190` | `7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544` | 旧pillar要件とfunctional trace | 固定LABO親から再導出。旧FR/runtimeを移さない |
| `LEGACY-ASSET-44DD86E3DEC09E65EF51` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md:43–50,67–90,91–120` | `df81469f13deb45e7da4c74d90c7f3d3b1be5f26ccf63b706e6e230bc5b4c3b6` | source/異常ごとのtest oracle分離 | failure別の構造のみ再導出。旧test ID/runner/runtimeは置換 |
| `LEGACY-ASSET-8CC5ABFC98C0D00183CA` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/nfr-grade.md:1–73` | `ba57990cf5343e9d4ad42ca8c2340d76c80e6e1c23085ba5e496d8014acf3fc3` | NFR gradeと測定項目を個別化する形 | 旧grade/閾値を置換し、固定L3/L10 NFRだけ再導出 |
| `LEGACY-ASSET-DB669724249A14A665F0` `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/nfr-grade.md:21–34,58–74` | `2197b4d2f4118aae83202f9f886056fd9de360f21667e25fe9c9d906f76c832d` | source状態・測定不能を分ける旧NFR例 | IPA grade、旧metric/threshold、旧CI consumerを持ち込まない |

## 3. 関数境界

公開APIはLABO L5の3 signatureをそのまま用いる。新しいAPI、K1 class/reason、source status、authority/owner、物理store、CONNECT transportを追加しない。

| Function | 公開境界 / 内部責務 | 固定条件と非肯定時の扱い | L9 trace |
|---|---|---|---|
| `observe_source(contract_ref, source_ref, scope_ref, input_heads) -> Observed<SourceObservation>` | accepted contractとsource refをowner側のread-only source observation境界へ渡し、L5 `SourceObservation` shapeの観測を受け取る。source registry/readerはここでは実装しない。 | `source_status`とK1 `Observed`は別field/type。raw identity/revision/digest・20 fieldをcaller claimから合成しない。current owner/refの完全性とK2 keyはK1/K2既存条件に従う。必須key field欠落時は共通K2 `key_of`が`Rejected(missing_key)`を返し、K1 resultへ写さない。これをL5の`Observed<SourceObservation>`へ追加outer unionとして読み替えない。source不達・未選択はL4/L5所定の非肯定状態を保持し、未選択は`Unobserved(not_run)`またはsource ownerが既に明示する状態のままとする。 | IV-LABO-001-C01–C09、C11–C15、IV-LABO-NFR-001-02/03、IV-LABO-001-SCOPE-01/02 |
| `aggregate_observations(selected_sources, input_heads) -> Sequence<AggregateObservation>` | 完全なsource observationsをsource identity/revisionごとにL5 `AggregateObservation` projectionへ写す。 | 元のsource statusとrecordを保ち、各20 fieldを`Present(value)`または`Missing`として表す。Missingはdefault/zero/successへ埋めず、当該recordの`lab_processing`でL4/L5の既存K1期待を保持する。非success recordを落とさない。sourceごとの部分失敗を他sourceへ混ぜない。K2 key inputs内にidentity重複が生じる場合は、K2 `key_of`の既存`Rejected(duplicate_identity)`境界を保つ。ただしL5の公開戻り型は`Sequence<AggregateObservation>`であり、このK2診断から公開aggregate結果へどう写すかはL4/L5で定義されていない。C14は局所部分被覆として残し、新しいAPI-level unionや部分Sequenceを作らない。 | IV-LABO-001-C01–C15、IV-LABO-NFR-001-01/02/03 |
| `correlate_observations(aggregate_refs, selected_connection, input_heads) -> Observed<EpisodeCandidate>` | Aggregateの完全なrefs、選択connection候補、L5で宣言された関連入力から、元参照を保つL5 `EpisodeCandidate` candidateを構成する。connection owner/resolverは未接続。 | `observation_refs`, `source_refs`, contract/schema/provenance refsを入力から往復比較し、欠測性と`causal_assertion=false`を保つ。K2 keyはoperation、version、subject、complete inputs、scope全fieldで構成する。K2の検査順はCommon Kernel L4 §3.4の`missing_key`→`invalid_digest`→`duplicate_identity`。同一identity/operation/scope/input identity集合のcurrent keyで旧Valueがあり、完全key revision+digestが進んだ場合に限りK2既存`Stale`候補を保つ。nested source relation/refの不一致だけからK2 `Stale`/`Unknown(conflict)`を作らない。 | IV-LABO-011-C01–C13、IV-LABO-NFR-011-01/02 |

`aggregate_observations`の外側返却はL5どおり`Sequence<AggregateObservation>`であり、Sequence自体を`Observed`や追加success envelopeで包まない。各recordの`lab_processing`は型どおり`Observed<LabProcessingDisposition>`を保持する。L4でreasonが定まらない入力に新reasonを補わない。K1 `Unknown`の具体reasonは実在する既存source/owner観測から来たものだけをそのまま保持する。K2 `Stale`はlookupで完全keyから導く読み取り結果であり、sourceのdomain revision差の別名ではない。

### 3.1 K1/K2との接続

- ResultKeyはCommon Kernel L4 §3.2–3.4に従う完全keyである。APIごとの`operation`, `operation_version`, `subject`, `inputs`, `scope`に必須refがなければkeyを作らずK2の`Rejected(missing_key)`を保つ。subject/input digestの形式違反とinputs identity重複はK2既存の後順位reasonであり、欠損へ読み替えない。
- API結果を保存・検索するときは既存K2 `key_of`/`lookup`/`record`の戻りunionと優先順を維持する。API resultにK1 variantを作る根拠がない場合、架空keyや合成Unknownを作らない。
- K2 lookupの`Unobserved(not_run)`、`Unknown(conflict)`、`Stale(prior Value, recorded_key, current_key)`は各々既存意味のままにする。source status enum `unknown`/`not_observed`はK1 `Unknown`/`Unobserved`へ変換しない。
- L8 owner返却欄で未確定とされたAPI class/reasonは局所holdのまま。固定L4/L5が示さないK2 operation-key composition、selected connection/receiptのbinding位置、relation correctionのowner mappingをこの関数設計で補わない。

### 3.2 未確定境界（L8 §5との対応）

| 固定L8/L9対象 | L6で実装可能な保持 | 部分被覆・hold・未被覆として返す点 |
|---|---|---|
| IV-LABO-001-C02 / L8 `L8-LABO-001-C02-CORRUPT` | 破損sourceを他sourceから分離し、API結果のK1 class `Unknown`を保つ。 | reason mapping未確定。LABO L4 ownerへreason対応を返し、破損記録から理由を推測しない。 |
| IV-LABO-011-C02 | compound fixtureを単独欠落fixtureと区別する。 | comparator自己検査を製品API結果やK1 classとして扱わない。K1/K2入力結果mappingは部分被覆としてLABO L4 ownerへ返す。 |
| IV-LABO-011-C06 | 初回/訂正後revisionを別入力にし、source recordを書き換えない。 | relation correctionとK2 mappingの結果は局所hold。Stale/Valueを予測しない。 |
| IV-LABO-011-C02/C12 | source revision mismatchのL9 route保持。 | subject/inputsへのrevision結合に依存するK2 classは局所hold。relation mismatchと混同しない。 |
| IV-LABO-001-C14 | 重複identityでK2 key構成が拒否される既存診断は保持する。 | record単位holdと他record保持はL5 return型で表せると主張しない。L4 ownerへAPI-level rejectとL9 record projectionの接続不足を返す。 |
| IV-LABO-011-C02/C13 | selected connection mismatchから接続成功を作らない。 | selected connection/receipt/schema/provenanceのK2 key placementとreturn mappingを局所holdとしてL4 ownerへ返す。 |
| IV-LABO-NFR-011-02 | causal-looking evidenceでも`causal_assertion=false`を保持。 | time/path-only型とsource mappingが未定義の範囲は未被覆。新field・fixture期待・NFR達成を作らない。 |

L8 C07の既存2状態（`Unobserved(not_run)`またはsource ownerが既に明示するsource-unselected state）は両方の選択肢を維持する。どちらかを新しい必須状態・reasonとして固定しない。L8で「局所hold」「部分被覆」「未被覆」と明記されたoracleを本書の型説明だけで解消しない。

## 4. L9 oracleからの関数trace

次表はL9の35 IDすべてを意味上の担当関数へ結び直す。L8の返却projection変異は製品API callではなくL9 oracle self-testであり、担当関数欄も変異済み返却をAPIへ渡す意味ではない。L8の個別fixture/期待はL7のtrace表が正本であり、この表はL9 IDの定義・数・意味を変更しない。

| Function | L9 oracle IDs | oracle数 |
|---|---|---:|
| `observe_source` | `IV-LABO-001-C01`–`C15`; `IV-LABO-NFR-001-02`, `IV-LABO-NFR-001-03`; `IV-LABO-001-SCOPE-01`, `SCOPE-02` | 19 |
| `aggregate_observations` | `IV-LABO-001-C01`–`C15`; `IV-LABO-NFR-001-01`, `NFR-001-02`, `NFR-001-03` | 18 |
| `correlate_observations` | `IV-LABO-011-C01`–`C13`; `IV-LABO-NFR-011-01`, `NFR-011-02` | 15 |

関数横断のtraceで同一L9 oracleを複数APIに結ぶことがある。これはoracle IDの複製ではない。合計unique oracleはL9固定の35件（28 functional + 5 NFR + 2 scope）のままである。L8のNFR索引は測定入力の再利用先で、独立実行・独立合格を表さない。

## 5. 状態

本書のL5公開APIとowner接続は未実装の技術設計候補である。source reader、source owner declaration、CONNECT resolver、K2 current key compositionの未接続部分はこの文書で実装済みにならない。§6のprivate helperに対する合成単体検査のみ実行し、L8正式fixture/L9 oracleは未実行である。L3/L10 acceptance、source read、connection、NFR測定、業務完了を主張しない。

## 6. Source-only private projection実装候補（384c741）

この節は上記設計本文を変更せず、main `384c7411831649b9c4ed9db9b5922591c22286dc` 上で作成した局所source-only候補の実装範囲を記録する。参照した現行入力はLABO L4 `b55d062fbdbe39c3af7ae8364f4e84316518af80496687985952285b425977e6`、L5 `2619a557507258a79630c1bdc06aea72aad0c64aa27202dba04a4083080f5148`、L8 `b0ec0fa261b7899bda1384c75467bee4a3ea057b6fbffde380234ea31ffe1193`、L9 `1a17b42a96d53abfbc59c5b0f65805662234162d9bd0d12667238749c2d65d7e` である。旧HELIXとの保持・変更根拠は本書§2の旧9資産表およびL4/L5のcrosswalkに限り、旧runtime等は実行していない。

`helix/helix-labo/units/stage1-labo/src/projection.py` は、L5既存20 fieldの存在／欠落と7種source宣言statusを、意味解釈せず保持するprivate projection候補を含む。また、既に与えられたEpisodeCandidate refs/relationを保持し、`causal_assertion=false`を保つprivate shape projectionを含む。候補はL5の3公開APIを実装せず、`__all__`も空である。source reader、current owner/sourceの解決、K1 `lab_processing`生成、K2保存/key、connection resolver、episode correlation、因果判定には接続しない。特に`AggregateObservation.lab_processing`を作らないため、完成したAggregateObservationや`aggregate_observations`の実装を主張しない。`observe_source`と`correlate_observations`も未実装である。

本候補はdeclaration、型番、版、owner登録、正式pack登録を持たない。正式packとして数えず、repository-layout RL-C3の成立、owner接続、L8/L9合格を主張しない。既存API境界とowner返却事項は変えず、L8§5に残る未解決を本実装で閉じない。

補助検査の対応表と合成検査実行記録は対のL7 §6にある。実装sourceは`helix/helix-labo/units/stage1-labo/src/projection.py`、合成testは`helix/helix-labo/units/stage1-labo/tests/test_projection.py`であり、いずれも本unit配下の未登録source-only候補である。
