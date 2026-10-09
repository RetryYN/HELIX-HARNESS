---
title: "HELIX-LABO Stage 1 L7単体テスト設計"
layer: L7
status: draft_for_independent_review
owner: HELIX-LABO
paired_l6: ../L6-function-design/stage1-labo.md
paired_l8: ../L8-detail-verification/stage1-labo-detail-verification.md
base: main `7f95f61fc1e1ae1dd790fa46581aba34921d73c0`
paired_l5_sha256: `0311794cd1fdb73673449de96bf3ea50d981ce6ed701443ff71292e266e4cc97`
paired_l6_sha256: `fd934bc04801e8dd9a9f0ec4c4df6756540cb80af691b6509b568795a52376ed`
---

# HELIX-LABO Stage 1（001／011）単体テスト設計

本書はL5/L6候補に対する単体fixtureの設計索引である。対象L8 bytesの88定義IDを全件保持する。内訳は83個のfunctional/status/scope variantと5個のNFR再利用索引であり、再利用索引は実fixtureでも測定実行でもない。L9の35 oracle ID（28 functional、5 NFR、2 scope）との対応は後段の表で全件列挙する。L8正式fixture・L9 oracle・source reader・接続は未実行であり、§6の合成private-helper検査だけを別に記録する。合格、実source read、実CONNECT通信、NFR実測を主張しない。

## 1. 固定本文と対応境界

| 文書 | 固定revision | SHA-256 | テスト設計で使う契約 |
|---|---|---|---|
| LABO L4 | main `7f95f61fc1e1ae1dd790fa46581aba34921d73c0` | `6ea7c6497e2349e63ed05a7a686e96e108a769a2ac864cf02295f174c00c6f1a` | L4 §1–5 |
| LABO L5 | main `7f95f61fc1e1ae1dd790fa46581aba34921d73c0` | `0311794cd1fdb73673449de96bf3ea50d981ce6ed701443ff71292e266e4cc97` | 3 API signatureとpayload |
| LABO L6（本pair） | 本PRのcontent HEAD | `58eb09d698b64f7e21230ae18e9f781ca53b223e2f0e525062e401d751943070` | 関数とprivate helper境界 |
| LABO L8 | main `7f95f61fc1e1ae1dd790fa46581aba34921d73c0` | `1d5d8e6b8046c8776493cf7ba0019efa1f33d8c2f14064557906d513f0e00d7a` | baseline・単一変異・期待の正本 |
| LABO L9 | main `7f95f61fc1e1ae1dd790fa46581aba34921d73c0` | `a19f842cd6fe9576a0984651cd4aff554bb9355304c9b1f619480cd9d7867973` | 35 verifier oracle |
| Common Kernel L4 | main `7f95f61fc1e1ae1dd790fa46581aba34921d73c0` | `3f7245e8fb548bab199107b1a020f0efea08713a5299076988326dae9feeb696` | K1/K2結果とkey境界 |
| Common Kernel L5 | main `7f95f61fc1e1ae1dd790fa46581aba34921d73c0` | `3f3867df4e04927fbf05615984654f2994dd76ac71fed0ee420d5edce36a2c69` | K1/K2 API/型 |

固定親はL4でpinされたL3/L10本文と`HELIXLABO-L2-001`/`HELIXLABO-L2-011`である。Common Kernel L4 crosswalkから返却されたK8 typo PR #2779の3 pinは、main `590054d60cddfefc9f709c3221ccc954c67b0e75`の固定snapshot（Common Kernel L4 SHA-256 `7d0d74ef75f4bf74ae50c2998b9d6d346ca01f4b14479d688e44aaeb8f10bd82`）で照合済みである。未照合と記したのは旧L7履歴revision `79013543184a6e47f99bc2ded1bb7a2e7f85737e`時点の記録であり、現時点の状態ではない。各fixtureのbaseline・一変異・expected class/reason・構造assertionはL8の同じfixture IDの行を唯一の正本とする。L7はそのcellを再解釈したり、fixture IDからexpectedを推測したりしない。

## 2. テスト境界と共通fixture規則

- 3公開APIはL5どおり `observe_source`, `aggregate_observations`, `correlate_observations` のみ。K2 complete key、`key_of`の`missing_key`→`invalid_digest`→`duplicate_identity`順、K1 result保持は現Common Kernel L4へ委譲し、LABO専用reasonを足さない。出力oracle自己検査はSUTへ変異済みinputを渡さず、Comparatorの誤projection検出だけを検査する。
- Source `source_status`の7値とK1 `Observed` classは別々にassertする。`unknown`をK1 `Unknown`へ、`not_observed`をK1 `Unobserved`へ写さない。non-success source recordを成功のみのprojectionで落とさず、source単位の破損は他sourceの有効recordと分離する。
- 20 observation fieldsはL5のfield名をそのまま使う。各欠落variantはその行の一fieldだけを変異させ、値を補完しない。K1 `Unknown` reasonがL8で未選択ならL7も具体reasonを追加しない。
- Aggregateは`Sequence<AggregateObservation>`で、sequence全体へsuccess wrapperを作らない。各recordの`lab_processing`をそのObserved typeとして確認する。K2 `key_of`の`Rejected`はkey構成境界だけであり、L5 aggregate公開戻り型へ拡張しない。C14のrecord-level hold／他source保持へのmappingは部分被覆として残す。
- Correlateでは元observation/source/contract/schema/provenance refs、missingness、`causal_assertion=false`を確認する。K2 Staleは完全current ResultKeyからの既存lookupのみ。nested relation/source revision差単独からStale/conflictを推測しない。
- L8 §5の7返却行は部分被覆・局所hold・未被覆として維持する。L8 C07の`Unobserved(not_run)`とsource-unselectedの既存明示状態という二状態を保持し、どちらかを新規の固定理由へしない。
- NFR再利用索引5件は索引参照の整合だけを示す。NFR測定、time/path-only因果判定、性能値、thresholdはこのL7にない。IV-LABO-NFR-011-02の時刻/path-only側はL8の未被覆状態を維持する。
- owner adapterは合成stub/fixture境界に留まる。未接続ownerからK1 class/reasonや接続成立を作らない。実source読取、permission、CONNECT transport、receipt、source writebackは検査・実行しない。

## 3. L8 fixture設計とowner返却区分

次の索引はL8の88定義を一件ずつ参照する。`input_api_case`はそのL8 rowの基準・入力変異またはpositive controlに従う設計呼出し、`output_oracle_self_test`はSUT入力を固定したL9 comparatorの自己検査、`nfr_reuse_index`は既存fixture参照リストの索引である。出力自己検査を製品APIのNegative/Unknown/Stale等として数えない。L8 §5の部分被覆・局所hold・未被覆は独立列に残し、L9 oracleの自己検査成功をowner mappingの解消としない。

| L7 ID | L8定義ID | 索引種別 | API / comparator / 索引先 | L8 §5 coverage境界 | baseline・mutation・expectedの正本 |
|---|---|---|---|---|---|
| `LABO-UT-001` | `L8-LABO-001-C01` | `input_api_case` | `observe_source` + `aggregate_observations` | L8個別期待。owner返却外のAPI接続を肯定しない | L8同ID行（行 35） |
| `LABO-UT-002` | `L8-LABO-001-C02-UNREADABLE` | `input_api_case` | `observe_source` | L8個別期待。owner返却外のAPI接続を肯定しない | L8同ID行（行 36） |
| `LABO-UT-003` | `L8-LABO-001-C02-CORRUPT` | `input_api_case` | `observe_source` | 部分被覆（L8 §5 owner返却） | L8同ID行（行 37） |
| `LABO-UT-004` | `L8-LABO-001-C03` | `output_oracle_self_test` | L9 comparator自己検査（製品API入力は固定） | L8個別期待。owner返却外のAPI接続を肯定しない | L8同ID行（行 38） |
| `LABO-UT-005` | `L8-LABO-001-C04-REVISION-MISSING` | `input_api_case` | `observe_source` | L8個別期待。owner返却外のAPI接続を肯定しない | L8同ID行（行 39） |
| `LABO-UT-006` | `L8-LABO-001-C04-OLD-AS-CURRENT` | `input_api_case` | `observe_source` | L8個別期待。owner返却外のAPI接続を肯定しない | L8同ID行（行 40） |
| `LABO-UT-007` | `L8-LABO-001-C04-HISTORICAL` | `input_api_case` | `observe_source` | L8個別期待。owner返却外のAPI接続を肯定しない | L8同ID行（行 41） |
| `LABO-UT-008` | `L8-LABO-001-C05-SECRET` | `input_api_case` | `observe_source` | L8個別期待。owner返却外のAPI接続を肯定しない | L8同ID行（行 42） |
| `LABO-UT-009` | `L8-LABO-001-C05-OUT-OF-SCOPE` | `input_api_case` | `observe_source` | L8個別期待。owner返却外のAPI接続を肯定しない | L8同ID行（行 43） |
| `LABO-UT-010` | `L8-LABO-001-C06` | `input_api_case` | `observe_source` read-only adapter境界 | L8個別期待。owner返却外のAPI接続を肯定しない | L8同ID行（行 44） |
| `LABO-UT-011` | `L8-LABO-001-C07` | `input_api_case` | `observe_source` | L8個別期待。owner返却外のAPI接続を肯定しない | L8同ID行（行 45） |
| `LABO-UT-012` | `L8-LABO-001-C08` | `input_api_case` | `aggregate_observations` | L8個別期待。owner返却外のAPI接続を肯定しない | L8同ID行（行 46） |
| `LABO-UT-013` | `L8-LABO-001-C10-FIELD-episode_id` | `input_api_case` | `aggregate_observations` | L8個別期待。owner返却外のAPI接続を肯定しない | L8同ID行（行 47） |
| `LABO-UT-014` | `L8-LABO-001-C10-FIELD-requirement_revision` | `input_api_case` | `aggregate_observations` | L8個別期待。owner返却外のAPI接続を肯定しない | L8同ID行（行 48） |
| `LABO-UT-015` | `L8-LABO-001-C10-FIELD-ticket_id` | `input_api_case` | `aggregate_observations` | L8個別期待。owner返却外のAPI接続を肯定しない | L8同ID行（行 49） |
| `LABO-UT-016` | `L8-LABO-001-C10-FIELD-responsibility_id` | `input_api_case` | `aggregate_observations` | L8個別期待。owner返却外のAPI接続を肯定しない | L8同ID行（行 50） |
| `LABO-UT-017` | `L8-LABO-001-C10-FIELD-product` | `input_api_case` | `aggregate_observations` | L8個別期待。owner返却外のAPI接続を肯定しない | L8同ID行（行 51） |
| `LABO-UT-018` | `L8-LABO-001-C10-FIELD-mechanism` | `input_api_case` | `aggregate_observations` | L8個別期待。owner返却外のAPI接続を肯定しない | L8同ID行（行 52） |
| `LABO-UT-019` | `L8-LABO-001-C10-FIELD-worker` | `input_api_case` | `aggregate_observations` | L8個別期待。owner返却外のAPI接続を肯定しない | L8同ID行（行 53） |
| `LABO-UT-020` | `L8-LABO-001-C10-FIELD-provider` | `input_api_case` | `aggregate_observations` | L8個別期待。owner返却外のAPI接続を肯定しない | L8同ID行（行 54） |
| `LABO-UT-021` | `L8-LABO-001-C10-FIELD-model` | `input_api_case` | `aggregate_observations` | L8個別期待。owner返却外のAPI接続を肯定しない | L8同ID行（行 55） |
| `LABO-UT-022` | `L8-LABO-001-C10-FIELD-configuration` | `input_api_case` | `aggregate_observations` | L8個別期待。owner返却外のAPI接続を肯定しない | L8同ID行（行 56） |
| `LABO-UT-023` | `L8-LABO-001-C10-FIELD-artifact` | `input_api_case` | `aggregate_observations` | L8個別期待。owner返却外のAPI接続を肯定しない | L8同ID行（行 57） |
| `LABO-UT-024` | `L8-LABO-001-C10-FIELD-CI-test` | `input_api_case` | `aggregate_observations` | L8個別期待。owner返却外のAPI接続を肯定しない | L8同ID行（行 58） |
| `LABO-UT-025` | `L8-LABO-001-C10-FIELD-release` | `input_api_case` | `aggregate_observations` | L8個別期待。owner返却外のAPI接続を肯定しない | L8同ID行（行 59） |
| `LABO-UT-026` | `L8-LABO-001-C10-FIELD-deployment` | `input_api_case` | `aggregate_observations` | L8個別期待。owner返却外のAPI接続を肯定しない | L8同ID行（行 60） |
| `LABO-UT-027` | `L8-LABO-001-C10-FIELD-runtime` | `input_api_case` | `aggregate_observations` | L8個別期待。owner返却外のAPI接続を肯定しない | L8同ID行（行 61） |
| `LABO-UT-028` | `L8-LABO-001-C10-FIELD-failure` | `input_api_case` | `aggregate_observations` | L8個別期待。owner返却外のAPI接続を肯定しない | L8同ID行（行 62） |
| `LABO-UT-029` | `L8-LABO-001-C10-FIELD-rework` | `input_api_case` | `aggregate_observations` | L8個別期待。owner返却外のAPI接続を肯定しない | L8同ID行（行 63） |
| `LABO-UT-030` | `L8-LABO-001-C10-FIELD-cost` | `input_api_case` | `aggregate_observations` | L8個別期待。owner返却外のAPI接続を肯定しない | L8同ID行（行 64） |
| `LABO-UT-031` | `L8-LABO-001-C10-FIELD-time` | `input_api_case` | `aggregate_observations` | L8個別期待。owner返却外のAPI接続を肯定しない | L8同ID行（行 65） |
| `LABO-UT-032` | `L8-LABO-001-C10-FIELD-result` | `input_api_case` | `aggregate_observations` | L8個別期待。owner返却外のAPI接続を肯定しない | L8同ID行（行 66） |
| `LABO-UT-033` | `L8-LABO-001-C11` | `input_api_case` | `observe_source` + `aggregate_observations` | L8個別期待。owner返却外のAPI接続を肯定しない | L8同ID行（行 67） |
| `LABO-UT-034` | `L8-LABO-001-C12-UNKNOWN-AS-SUCCESS` | `output_oracle_self_test` | L9 comparator自己検査（製品API入力は固定） | L8個別期待。owner返却外のAPI接続を肯定しない | L8同ID行（行 68） |
| `LABO-UT-035` | `L8-LABO-001-C13-NOT-OBSERVED-AS-SUCCESS` | `output_oracle_self_test` | L9 comparator自己検査（製品API入力は固定） | L8個別期待。owner返却外のAPI接続を肯定しない | L8同ID行（行 69） |
| `LABO-UT-036` | `L8-LABO-001-C14` | `input_api_case / partial_mapping` | K2 `key_of`境界（aggregate公開戻り型への写像は部分被覆） | 部分被覆（L8 §5 owner返却） | L8同ID行（行 70） |
| `LABO-UT-037` | `L8-LABO-001-C15-SCOPE-REF-MISSING` | `input_api_case` | `observe_source` | L8個別期待。owner返却外のAPI接続を肯定しない | L8同ID行（行 71） |
| `LABO-UT-038` | `L8-LABO-001-C15-SCOPE-DOMAIN-MISSING` | `input_api_case` | `observe_source` | L8個別期待。owner返却外のAPI接続を肯定しない | L8同ID行（行 72） |
| `LABO-UT-039` | `L8-LABO-001-C15-SCOPE-UNALLOWED` | `input_api_case` | `observe_source` | L8個別期待。owner返却外のAPI接続を肯定しない | L8同ID行（行 73） |
| `LABO-UT-040` | `L8-LABO-011-C01` | `input_api_case` | `correlate_observations` | L8個別期待。owner返却外のAPI接続を肯定しない | L8同ID行（行 74） |
| `LABO-UT-041` | `L8-LABO-011-C02-COMPOUND-SOURCE-REF-OMISSIONS` | `output_oracle_self_test` | L9 comparator自己検査（製品API入力は固定） | 部分被覆（L8 §5 owner返却） | L8同ID行（行 75） |
| `LABO-UT-042` | `L8-LABO-011-C02-OBS-ID-MISMATCH` | `output_oracle_self_test` | L9 comparator自己検査（製品API入力は固定） | 部分被覆（L8 §5 owner返却） | L8同ID行（行 76） |
| `LABO-UT-043` | `L8-LABO-011-C02-SOURCE-CONTRACT-ID-MISSING` | `output_oracle_self_test` | L9 comparator自己検査（製品API入力は固定） | 部分被覆（L8 §5 owner返却） | L8同ID行（行 77） |
| `LABO-UT-044` | `L8-LABO-011-C02-SOURCE-CONTRACT-ID-MISMATCH` | `output_oracle_self_test` | L9 comparator自己検査（製品API入力は固定） | 部分被覆（L8 §5 owner返却） | L8同ID行（行 78） |
| `LABO-UT-045` | `L8-LABO-011-C02-SOURCE-CONTRACT-REVISION-MISSING` | `input_api_case` | `correlate_observations` | L8個別期待。owner返却外のAPI接続を肯定しない | L8同ID行（行 79） |
| `LABO-UT-046` | `L8-LABO-011-C02-SOURCE-CONTRACT-REVISION-MISMATCH` | `input_api_case` | `correlate_observations` | L8個別期待。owner返却外のAPI接続を肯定しない | L8同ID行（行 80） |
| `LABO-UT-047` | `L8-LABO-011-C02-SOURCE-SCHEMA-MISSING` | `output_oracle_self_test` | L9 comparator自己検査（製品API入力は固定） | 部分被覆（L8 §5 owner返却） | L8同ID行（行 81） |
| `LABO-UT-048` | `L8-LABO-011-C02-SOURCE-SCHEMA-MISMATCH` | `output_oracle_self_test` | L9 comparator自己検査（製品API入力は固定） | 部分被覆（L8 §5 owner返却） | L8同ID行（行 82） |
| `LABO-UT-049` | `L8-LABO-011-C02-SOURCE-PROVENANCE-MISSING` | `output_oracle_self_test` | L9 comparator自己検査（製品API入力は固定） | 部分被覆（L8 §5 owner返却） | L8同ID行（行 83） |
| `LABO-UT-050` | `L8-LABO-011-C02-SOURCE-PROVENANCE-MISMATCH` | `output_oracle_self_test` | L9 comparator自己検査（製品API入力は固定） | 部分被覆（L8 §5 owner返却） | L8同ID行（行 84） |
| `LABO-UT-051` | `L8-LABO-011-C02-CONNECT-ID-MISSING` | `input_api_case` | `correlate_observations` | 局所hold（L8 §5 owner返却） | L8同ID行（行 85） |
| `LABO-UT-052` | `L8-LABO-011-C02-CONNECT-ID-MISMATCH` | `input_api_case` | `correlate_observations` | 局所hold（L8 §5 owner返却） | L8同ID行（行 86） |
| `LABO-UT-053` | `L8-LABO-011-C02-CONNECT-REVISION-MISSING` | `input_api_case` | `correlate_observations` | 局所hold（L8 §5 owner返却） | L8同ID行（行 87） |
| `LABO-UT-054` | `L8-LABO-011-C02-CONNECT-REVISION-MISMATCH` | `input_api_case` | `correlate_observations` | 局所hold（L8 §5 owner返却） | L8同ID行（行 88） |
| `LABO-UT-055` | `L8-LABO-011-C02-CONNECT-SCHEMA-MISSING` | `input_api_case` | `correlate_observations` | 局所hold（L8 §5 owner返却） | L8同ID行（行 89） |
| `LABO-UT-056` | `L8-LABO-011-C02-CONNECT-SCHEMA-MISMATCH` | `input_api_case` | `correlate_observations` | 局所hold（L8 §5 owner返却） | L8同ID行（行 90） |
| `LABO-UT-057` | `L8-LABO-011-C02-CONNECT-PROVENANCE-MISSING` | `input_api_case` | `correlate_observations` | 局所hold（L8 §5 owner返却） | L8同ID行（行 91） |
| `LABO-UT-058` | `L8-LABO-011-C02-CONNECT-PROVENANCE-MISMATCH` | `input_api_case` | `correlate_observations` | 局所hold（L8 §5 owner返却） | L8同ID行（行 92） |
| `LABO-UT-059` | `L8-LABO-011-C02-RECEIPT-SCOPE-MISMATCH` | `input_api_case` | `correlate_observations` | 局所hold（L8 §5 owner返却） | L8同ID行（行 93） |
| `LABO-UT-060` | `L8-LABO-011-C02-RECEIPT-OLD-REVISION` | `input_api_case` | `correlate_observations` | 局所hold（L8 §5 owner返却） | L8同ID行（行 94） |
| `LABO-UT-061` | `L8-LABO-011-C03` | `input_api_case` | `correlate_observations` | L8個別期待。owner返却外のAPI接続を肯定しない | L8同ID行（行 95） |
| `LABO-UT-062` | `L8-LABO-011-C04` | `input_api_case` | `correlate_observations` | L8個別期待。owner返却外のAPI接続を肯定しない | L8同ID行（行 96） |
| `LABO-UT-063` | `L8-LABO-011-C05` | `input_api_case` | `correlate_observations` | L8個別期待。owner返却外のAPI接続を肯定しない | L8同ID行（行 97） |
| `LABO-UT-064` | `L8-LABO-011-C06` | `input_api_case` | `correlate_observations` | 局所hold（L8 §5 owner返却） | L8同ID行（行 98） |
| `LABO-UT-065` | `L8-LABO-011-C07` | `input_api_case` | `correlate_observations` | L8個別期待。owner返却外のAPI接続を肯定しない | L8同ID行（行 99） |
| `LABO-UT-066` | `L8-LABO-011-C08` | `output_oracle_self_test` | L9 comparator自己検査（製品API入力は固定） | L8個別期待。owner返却外のAPI接続を肯定しない | L8同ID行（行 100） |
| `LABO-UT-067` | `L8-LABO-011-C09-MISSING-AS-SUCCESS` | `output_oracle_self_test` | L9 comparator自己検査（製品API入力は固定） | L8個別期待。owner返却外のAPI接続を肯定しない | L8同ID行（行 101） |
| `LABO-UT-068` | `L8-LABO-011-C09-MISSING-AS-DEFAULT` | `output_oracle_self_test` | L9 comparator自己検査（製品API入力は固定） | L8個別期待。owner返却外のAPI接続を肯定しない | L8同ID行（行 102） |
| `LABO-UT-069` | `L8-LABO-011-C10-OBS-ID-MISSING` | `input_api_case` | `correlate_observations` | L8個別期待。owner返却外のAPI接続を肯定しない | L8同ID行（行 103） |
| `LABO-UT-070` | `L8-LABO-011-C11-SOURCE-REVISION-MISSING` | `input_api_case` | `correlate_observations` | L8個別期待。owner返却外のAPI接続を肯定しない | L8同ID行（行 104） |
| `LABO-UT-071` | `L8-LABO-011-C12-SOURCE-REVISION-MISMATCH` | `input_api_case` | `correlate_observations` | 局所hold（L8 §5 owner返却） | L8同ID行（行 105） |
| `LABO-UT-072` | `L8-LABO-011-C13-PARENT-AS-CONNECTION` | `input_api_case` | `correlate_observations` | 局所hold（L8 §5 owner返却） | L8同ID行（行 106） |
| `LABO-UT-073` | `L8-LABO-011-C13-OTHER-CONNECTION` | `input_api_case` | `correlate_observations` | 局所hold（L8 §5 owner返却） | L8同ID行（行 107） |
| `LABO-UT-074` | `L8-LABO-011-C13-OTHER-RECEIPT` | `input_api_case` | `correlate_observations` | 局所hold（L8 §5 owner返却） | L8同ID行（行 108） |
| `LABO-UT-075` | `L8-LABO-NFR-001-01` | `nfr_reuse_index` | NFR索引（実行・測定なし） | L8個別期待。owner返却外のAPI接続を肯定しない | L8同ID行（行 116） |
| `LABO-UT-076` | `L8-LABO-NFR-001-02` | `nfr_reuse_index` | NFR索引（実行・測定なし） | L8個別期待。owner返却外のAPI接続を肯定しない | L8同ID行（行 117） |
| `LABO-UT-077` | `L8-LABO-NFR-001-03` | `nfr_reuse_index` | NFR索引（実行・測定なし） | L8個別期待。owner返却外のAPI接続を肯定しない | L8同ID行（行 118） |
| `LABO-UT-078` | `L8-LABO-NFR-011-01` | `nfr_reuse_index` | NFR索引（実行・測定なし） | L8個別期待。owner返却外のAPI接続を肯定しない | L8同ID行（行 119） |
| `LABO-UT-079` | `L8-LABO-NFR-011-02` | `nfr_reuse_index` | NFR索引（実行・測定なし） | 未被覆（time/path-only） | L8同ID行（行 120） |
| `LABO-UT-080` | `L8-LABO-NFR-001-02-STATUS-success` | `input_api_case` | `aggregate_observations` | L8個別期待。owner返却外のAPI接続を肯定しない | L8同ID行（行 126） |
| `LABO-UT-081` | `L8-LABO-NFR-001-02-STATUS-failure` | `input_api_case` | `aggregate_observations` | L8個別期待。owner返却外のAPI接続を肯定しない | L8同ID行（行 127） |
| `LABO-UT-082` | `L8-LABO-NFR-001-02-STATUS-rejected` | `input_api_case` | `aggregate_observations` | L8個別期待。owner返却外のAPI接続を肯定しない | L8同ID行（行 128） |
| `LABO-UT-083` | `L8-LABO-NFR-001-02-STATUS-cancelled` | `input_api_case` | `aggregate_observations` | L8個別期待。owner返却外のAPI接続を肯定しない | L8同ID行（行 129） |
| `LABO-UT-084` | `L8-LABO-NFR-001-02-STATUS-blocked` | `input_api_case` | `aggregate_observations` | L8個別期待。owner返却外のAPI接続を肯定しない | L8同ID行（行 130） |
| `LABO-UT-085` | `L8-LABO-NFR-001-02-STATUS-unknown` | `input_api_case` | `aggregate_observations` | L8個別期待。owner返却外のAPI接続を肯定しない | L8同ID行（行 131） |
| `LABO-UT-086` | `L8-LABO-NFR-001-02-STATUS-not-observed` | `input_api_case` | `aggregate_observations` | L8個別期待。owner返却外のAPI接続を肯定しない | L8同ID行（行 132） |
| `LABO-UT-087` | `L8-LABO-001-SCOPE-01` | `input_api_case` | `observe_source` | L8個別期待。owner返却外のAPI接続を肯定しない | L8同ID行（行 142） |
| `LABO-UT-088` | `L8-LABO-001-SCOPE-02` | `input_api_case` | `observe_source` | L8個別期待。owner返却外のAPI接続を肯定しない | L8同ID行（行 143） |

L7 IDは索引行であり実行済みUT数ではない。`output_oracle_self_test` 14行では、SUTへはL8記載どおりの不変baseline inputを与え、Comparator側の誤った返却projectionだけを差し替える。期待は「Comparatorが返却と元source/aggregateの相違を検出する」というoracle assertionであり、製品APIがNegative classやK1 resultを返す期待ではない。対象14件はL8 `001-C03`, `001-C12`, `001-C13`, `011-C02-COMPOUND-SOURCE-REF-OMISSIONS`, `011-C02-OBS-ID-MISMATCH`, `011-C02-SOURCE-CONTRACT-ID-MISSING/MISMATCH`, `011-C02-SOURCE-SCHEMA-MISSING/MISMATCH`, `011-C02-SOURCE-PROVENANCE-MISSING/MISMATCH`, `011-C08`, `011-C09-MISSING-AS-SUCCESS/DEFAULT`である。

L8 §5の7返却行は、索引のcoverage列で該当IDを`部分被覆`、`局所hold`、`未被覆`と表示した。K1 reason、K2 lookup class、source-unselected状態などを補完してowner返却を解消しない。

## 4. L9 oracle 35件の対応

L9 oracleごとにL8の明示参照を集約した。表のL8 ID集合はL8各行のL9参照cellから導出し、`同上` cellは直前の明示参照を適用した。oracleの意味や期待はL9本文から変更していない。複数のL8 caseが一つのoracleに対応する場合も、各caseは独立した単一変異のまま残す。

| L9 oracle ID | L7 case IDs / reuse index | L8定義ID |
|---|---|---|
| `IV-LABO-001-C01` | `LABO-UT-001` | `L8-LABO-001-C01` |
| `IV-LABO-001-C02` | `LABO-UT-002`, `LABO-UT-003` | `L8-LABO-001-C02-UNREADABLE`, `L8-LABO-001-C02-CORRUPT` |
| `IV-LABO-001-C03` | `LABO-UT-004` | `L8-LABO-001-C03` |
| `IV-LABO-001-C04` | `LABO-UT-005`, `LABO-UT-006`, `LABO-UT-007` | `L8-LABO-001-C04-REVISION-MISSING`, `L8-LABO-001-C04-OLD-AS-CURRENT`, `L8-LABO-001-C04-HISTORICAL` |
| `IV-LABO-001-C05` | `LABO-UT-008`, `LABO-UT-009` | `L8-LABO-001-C05-SECRET`, `L8-LABO-001-C05-OUT-OF-SCOPE` |
| `IV-LABO-001-C06` | `LABO-UT-010` | `L8-LABO-001-C06` |
| `IV-LABO-001-C07` | `LABO-UT-011` | `L8-LABO-001-C07` |
| `IV-LABO-001-C08` | `LABO-UT-012` | `L8-LABO-001-C08` |
| `IV-LABO-001-C09` | `LABO-UT-006`, `LABO-UT-007` | `L8-LABO-001-C04-OLD-AS-CURRENT`, `L8-LABO-001-C04-HISTORICAL` |
| `IV-LABO-001-C10` | `LABO-UT-013`, `LABO-UT-014`, `LABO-UT-015`, `LABO-UT-016`, `LABO-UT-017`, `LABO-UT-018`, `LABO-UT-019`, `LABO-UT-020`, `LABO-UT-021`, `LABO-UT-022`, `LABO-UT-023`, `LABO-UT-024`, `LABO-UT-025`, `LABO-UT-026`, `LABO-UT-027`, `LABO-UT-028`, `LABO-UT-029`, `LABO-UT-030`, `LABO-UT-031`, `LABO-UT-032` | `L8-LABO-001-C10-FIELD-episode_id`, `L8-LABO-001-C10-FIELD-requirement_revision`, `L8-LABO-001-C10-FIELD-ticket_id`, `L8-LABO-001-C10-FIELD-responsibility_id`, `L8-LABO-001-C10-FIELD-product`, `L8-LABO-001-C10-FIELD-mechanism`, `L8-LABO-001-C10-FIELD-worker`, `L8-LABO-001-C10-FIELD-provider`, `L8-LABO-001-C10-FIELD-model`, `L8-LABO-001-C10-FIELD-configuration`, `L8-LABO-001-C10-FIELD-artifact`, `L8-LABO-001-C10-FIELD-CI-test`, `L8-LABO-001-C10-FIELD-release`, `L8-LABO-001-C10-FIELD-deployment`, `L8-LABO-001-C10-FIELD-runtime`, `L8-LABO-001-C10-FIELD-failure`, `L8-LABO-001-C10-FIELD-rework`, `L8-LABO-001-C10-FIELD-cost`, `L8-LABO-001-C10-FIELD-time`, `L8-LABO-001-C10-FIELD-result` |
| `IV-LABO-001-C11` | `LABO-UT-033` | `L8-LABO-001-C11` |
| `IV-LABO-001-C12` | `LABO-UT-034` | `L8-LABO-001-C12-UNKNOWN-AS-SUCCESS` |
| `IV-LABO-001-C13` | `LABO-UT-035` | `L8-LABO-001-C13-NOT-OBSERVED-AS-SUCCESS` |
| `IV-LABO-001-C14` | `LABO-UT-036` | `L8-LABO-001-C14` |
| `IV-LABO-001-C15` | `LABO-UT-037`, `LABO-UT-038`, `LABO-UT-039` | `L8-LABO-001-C15-SCOPE-REF-MISSING`, `L8-LABO-001-C15-SCOPE-DOMAIN-MISSING`, `L8-LABO-001-C15-SCOPE-UNALLOWED` |
| `IV-LABO-011-C01` | `LABO-UT-040` | `L8-LABO-011-C01` |
| `IV-LABO-011-C02` | `LABO-UT-041`, `LABO-UT-042`, `LABO-UT-043`, `LABO-UT-044`, `LABO-UT-045`, `LABO-UT-046`, `LABO-UT-047`, `LABO-UT-048`, `LABO-UT-049`, `LABO-UT-050`, `LABO-UT-051`, `LABO-UT-052`, `LABO-UT-053`, `LABO-UT-054`, `LABO-UT-055`, `LABO-UT-056`, `LABO-UT-057`, `LABO-UT-058`, `LABO-UT-059`, `LABO-UT-060`, `LABO-UT-062`, `LABO-UT-064`, `LABO-UT-069`, `LABO-UT-070`, `LABO-UT-071` | `L8-LABO-011-C02-COMPOUND-SOURCE-REF-OMISSIONS`, `L8-LABO-011-C02-OBS-ID-MISMATCH`, `L8-LABO-011-C02-SOURCE-CONTRACT-ID-MISSING`, `L8-LABO-011-C02-SOURCE-CONTRACT-ID-MISMATCH`, `L8-LABO-011-C02-SOURCE-CONTRACT-REVISION-MISSING`, `L8-LABO-011-C02-SOURCE-CONTRACT-REVISION-MISMATCH`, `L8-LABO-011-C02-SOURCE-SCHEMA-MISSING`, `L8-LABO-011-C02-SOURCE-SCHEMA-MISMATCH`, `L8-LABO-011-C02-SOURCE-PROVENANCE-MISSING`, `L8-LABO-011-C02-SOURCE-PROVENANCE-MISMATCH`, `L8-LABO-011-C02-CONNECT-ID-MISSING`, `L8-LABO-011-C02-CONNECT-ID-MISMATCH`, `L8-LABO-011-C02-CONNECT-REVISION-MISSING`, `L8-LABO-011-C02-CONNECT-REVISION-MISMATCH`, `L8-LABO-011-C02-CONNECT-SCHEMA-MISSING`, `L8-LABO-011-C02-CONNECT-SCHEMA-MISMATCH`, `L8-LABO-011-C02-CONNECT-PROVENANCE-MISSING`, `L8-LABO-011-C02-CONNECT-PROVENANCE-MISMATCH`, `L8-LABO-011-C02-RECEIPT-SCOPE-MISMATCH`, `L8-LABO-011-C02-RECEIPT-OLD-REVISION`, `L8-LABO-011-C04`, `L8-LABO-011-C06`, `L8-LABO-011-C10-OBS-ID-MISSING`, `L8-LABO-011-C11-SOURCE-REVISION-MISSING`, `L8-LABO-011-C12-SOURCE-REVISION-MISMATCH` |
| `IV-LABO-011-C03` | `LABO-UT-061` | `L8-LABO-011-C03` |
| `IV-LABO-011-C04` | `LABO-UT-062` | `L8-LABO-011-C04` |
| `IV-LABO-011-C05` | `LABO-UT-063` | `L8-LABO-011-C05` |
| `IV-LABO-011-C06` | `LABO-UT-064` | `L8-LABO-011-C06` |
| `IV-LABO-011-C07` | `LABO-UT-065` | `L8-LABO-011-C07` |
| `IV-LABO-011-C08` | `LABO-UT-066` | `L8-LABO-011-C08` |
| `IV-LABO-011-C09` | `LABO-UT-067`, `LABO-UT-068` | `L8-LABO-011-C09-MISSING-AS-SUCCESS`, `L8-LABO-011-C09-MISSING-AS-DEFAULT` |
| `IV-LABO-011-C10` | `LABO-UT-069` | `L8-LABO-011-C10-OBS-ID-MISSING` |
| `IV-LABO-011-C11` | `LABO-UT-070` | `L8-LABO-011-C11-SOURCE-REVISION-MISSING` |
| `IV-LABO-011-C12` | `LABO-UT-071` | `L8-LABO-011-C12-SOURCE-REVISION-MISMATCH` |
| `IV-LABO-011-C13` | `LABO-UT-072`, `LABO-UT-073`, `LABO-UT-074` | `L8-LABO-011-C13-PARENT-AS-CONNECTION`, `L8-LABO-011-C13-OTHER-CONNECTION`, `L8-LABO-011-C13-OTHER-RECEIPT` |
| `IV-LABO-NFR-001-01` | `LABO-UT-013`, `LABO-UT-014`, `LABO-UT-015`, `LABO-UT-016`, `LABO-UT-017`, `LABO-UT-018`, `LABO-UT-019`, `LABO-UT-020`, `LABO-UT-021`, `LABO-UT-022`, `LABO-UT-023`, `LABO-UT-024`, `LABO-UT-025`, `LABO-UT-026`, `LABO-UT-027`, `LABO-UT-028`, `LABO-UT-029`, `LABO-UT-030`, `LABO-UT-031`, `LABO-UT-032`, `LABO-UT-075` | `L8-LABO-001-C10-FIELD-episode_id`, `L8-LABO-001-C10-FIELD-requirement_revision`, `L8-LABO-001-C10-FIELD-ticket_id`, `L8-LABO-001-C10-FIELD-responsibility_id`, `L8-LABO-001-C10-FIELD-product`, `L8-LABO-001-C10-FIELD-mechanism`, `L8-LABO-001-C10-FIELD-worker`, `L8-LABO-001-C10-FIELD-provider`, `L8-LABO-001-C10-FIELD-model`, `L8-LABO-001-C10-FIELD-configuration`, `L8-LABO-001-C10-FIELD-artifact`, `L8-LABO-001-C10-FIELD-CI-test`, `L8-LABO-001-C10-FIELD-release`, `L8-LABO-001-C10-FIELD-deployment`, `L8-LABO-001-C10-FIELD-runtime`, `L8-LABO-001-C10-FIELD-failure`, `L8-LABO-001-C10-FIELD-rework`, `L8-LABO-001-C10-FIELD-cost`, `L8-LABO-001-C10-FIELD-time`, `L8-LABO-001-C10-FIELD-result`, `L8-LABO-NFR-001-01` |
| `IV-LABO-NFR-001-02` | `LABO-UT-034`, `LABO-UT-035`, `LABO-UT-076`, `LABO-UT-080`, `LABO-UT-081`, `LABO-UT-082`, `LABO-UT-083`, `LABO-UT-084`, `LABO-UT-085`, `LABO-UT-086` | `L8-LABO-001-C12-UNKNOWN-AS-SUCCESS`, `L8-LABO-001-C13-NOT-OBSERVED-AS-SUCCESS`, `L8-LABO-NFR-001-02`, `L8-LABO-NFR-001-02-STATUS-success`, `L8-LABO-NFR-001-02-STATUS-failure`, `L8-LABO-NFR-001-02-STATUS-rejected`, `L8-LABO-NFR-001-02-STATUS-cancelled`, `L8-LABO-NFR-001-02-STATUS-blocked`, `L8-LABO-NFR-001-02-STATUS-unknown`, `L8-LABO-NFR-001-02-STATUS-not-observed` |
| `IV-LABO-NFR-001-03` | `LABO-UT-077` | `L8-LABO-NFR-001-03` |
| `IV-LABO-NFR-011-01` | `LABO-UT-067`, `LABO-UT-068`, `LABO-UT-078` | `L8-LABO-011-C09-MISSING-AS-SUCCESS`, `L8-LABO-011-C09-MISSING-AS-DEFAULT`, `L8-LABO-NFR-011-01` |
| `IV-LABO-NFR-011-02` | `LABO-UT-079` | `L8-LABO-NFR-011-02` |
| `IV-LABO-001-SCOPE-01` | `LABO-UT-087` | `L8-LABO-001-SCOPE-01` |
| `IV-LABO-001-SCOPE-02` | `LABO-UT-088` | `L8-LABO-001-SCOPE-02` |

この対応表のunique L9 ID数は35である。5 NFR oracleはL8の5 reuse indexおよび明示status variantsを指す。scope oracleはscope fixtureを指す。`IV-LABO-NFR-011-02`のtime/path-only条件はL8 §5で未被覆のままなので、対応行があることを測定済み・合格と解釈しない。

## 5. 実行状態・検証境界

L8正式fixtureは実行していない。L6/L8/L9と88定義ID/35 oracle IDの文書上の対応を静的に保持するものであり、L3/L10 acceptance、source permission、K2 store/lookupの実動作、CONNECT owner、NFR測定、production owner mappingを証明しない。§6の合成テストは当該private projection helperの局所shapeだけを検査する。K8 typo PR #2779 crosswalkの3 pinはmain `590054d60cddfefc9f709c3221ccc954c67b0e75`固定snapshotで照合済みであり、旧revision `79013543184a6e47f99bc2ded1bb7a2e7f85737e`時点の未照合記録を現在の未解決事項として扱わない。

## 6. Source-only private projection候補の補助単体検査

以下はmain `384c7411831649b9c4ed9db9b5922591c22286dc` 上の局所source-only helper候補に対する合成単体検査であり、L8の88定義IDやL9の35 oracleを実行・充足したものではない。入力はowner readerから得た観測ではなく、helper境界のshape保持だけを検査する合成値である。

| 補助検査 | 固定baseline | 単一変異／検査 | 期待する局所結果 | L8/L9上の範囲 |
|---|---|---|---|---|
| `test_all_twenty_fields_are_retained_without_value_interpretation` | L5の20 field名すべてに異なるopaque objectを割当て、別objectをsource statusにする | 値の型・truthinessを問わずhelperへ入力 | 20 fieldすべて`Present`相当として同一payload objectを保持し、source status objectも別fieldとしてそのまま保持 | helper shapeのみ。source validity、K1 result、L8-001-C10合格を主張しない |
| `test_each_single_missing_field_is_local_and_does_not_mutate_input` | 同じ20 field baselineをfieldごとに独立して作る | 各subtestで対象field keyを一つだけ除去 | 対象fieldだけ`Missing`相当、残る19値はidentity保持、入力mapping不変 | 20単独欠落のprivate projection検査。L8のAPI/result oracleは未実行 |
| `test_all_seven_declared_status_values_are_preserved_separately` | 空field mappingとL5列挙の各statusを個別に与える | statusを`success`、`failure`、`rejected`、`cancelled`、`blocked`、`unknown`、`not_observed`の間で一つずつ置換 | 各statusの同じ値を保持し、20 fieldの欠落表現と独立させる。K1 `Observed` classへの変換なし | L8 NFR-001-02のstatus候補をhelperに留めて確認するもの。L9/NFR測定は未実施 |
| `test_episode_candidate_shape_retains_refs_and_relation_only` | L5既存ref collectionとrelationへopaque valuesを渡す | 変異なしのpositive shape case | 各入力objectをidentity保持し、`causal_assertion=false`。未定義fieldを投影へ加えない | ref-retention helperのみ。connection解決、correlation、L8-011/L9合格は未実施 |

L6§6の候補コードは正式packではなく、L7本文上の88定義ID／35 oracle索引にも追加していない。補助検査の成功をowner/API接続や、L8/L9の実fixture実行証拠に数えない。現行sourceの欠落mapping、`lab_processing`、K2、CONNECT、因果性、NFR測定は既存L8§5のpartial/hold/uncovered区分を維持する。

### 実行記録

実行したのは上記4件のprivate-helper合成単体検査だけである。コマンドは`PYTHONDONTWRITEBYTECODE=1 python3 -B -m unittest discover -s helix/helix-labo/units/stage1-labo/tests -v`。結果は4 tests、4 pass、0 fail。実行対象source SHA-256は`5c61fe620c35eeb2786b740ccd37086e0e81bdf797a95cbf9588c585537ab60a`、test SHA-256は`a60abe0042543a6bceedbff4f284356dc2d2c347343ba6469423e1dd26b9613c`。この結果はL8正式fixtureやL9 oracleの実行ではない。実行時の入力文書はL4 `b55d062fbdbe39c3af7ae8364f4e84316518af80496687985952285b425977e6`、L5 `2619a557507258a79630c1bdc06aea72aad0c64aa27202dba04a4083080f5148`、L8 `b0ec0fa261b7899bda1384c75467bee4a3ea057b6fbffde380234ea31ffe1193`、L9 `1a17b42a96d53abfbc59c5b0f65805662234162d9bd0d12667238749c2d65d7e`。
