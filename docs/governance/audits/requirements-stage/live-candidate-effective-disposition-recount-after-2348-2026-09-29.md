# MPR live candidate実効処置の全件再列挙（#2348後、2026-09-29）

## 対象と結果

対象は `origin/main` の `8b23be9cd996279617219fe06733c7e274b4bb0a` に固定したMPR registerである。638 JSONL行を最初から走査し、各 `requirement_identity` の最後の `requirement_candidate` 行を抽出した。source holding 67行は候補identityの分母に含めず、340 live identitiesを得た。

| 実効処置 | 件数 |
|---|---:|
| 無条件採択 | 297 |
| 条件付き採択 | 13 |
| 採択合計 | 310 |
| 保留 | 4 |
| 不採択 | 0 |
| 未分類（live exact revisionへのPO判断なし） | 26 |
| 合計 | 340 |

この集計は前回の339件へ単純加算した値ではない。最新register全638行からidentityとlive registrationを再構成し、各候補についてPO決定記録とexact registrationを照合した。前回snapshotに含まれる339 identityは全件、現registerのlive registration ID・candidate semantic digest・source pathと一致した。追加されたidentityは `HARNESS-L2-063` 一件である。

## 旧snapshotとの照合

比較対象は `d0a58b1fa10456e5cf36d6d62a33a6117da9e1ae` 時点の [旧inventory](live-candidate-effective-disposition-2026-09-29.md) および付属JSONである。旧値は637 register rows / 339 live identities / 未分類25。今回の全件再列挙では638 rows / 340 live identities / 未分類26となった。旧339件の登録revisionは全件不変で、各旧決定記録のfile digestも現行bytesと一致する。#2348で追加された対象外補足を含む最新mainを基準にした。

`HARNESS-L2-063` の登録は `MPR-RC-HARNESS-L2-063-001`、L2 digest `sha256:f0a1014c9514d70e8cbee63faca3ae6679c43240c89e095c4b484b161ed75b46`、管理状態 `registered_proposal` / `authority_effect: none`。063 worksheetは推奨案を示すが、POの選択を記録しない明示的な読み取り専用資料である。判断探索範囲 `docs/governance/decisions/*.md` 内にexact live registrationへのPO決定はなく、未分類に残した。worksheet、receipt、MPR管理状態から採択・保留・不採択を生成していない。

## 照合方法とrevision境界

- `management-provisional-requirement-register.jsonl` の全638行をJSON parseし、行順に最後の候補registrationをidentityごとに選択した。各identityの出力は付属JSONの `items` にちょうど一つずつ格納する。
- 2026-09-28の8機構判断は固定確認packet commitから対象候補を全件検査した。250 identityすべてについてpacket内のregistration IDが現registerのlive registrationと一致し、各decision recordの対象集合に含まれる。packet commit/path/blob SHA・照合件数はJSONの `eight_mechanism_packet_exact_checks` に列挙した。
- 2026-09-29の57候補・11候補判断は決定記録本文内のregistration IDを対象候補と照合した。各採択・条件付き採択・保留にはdecision path、file SHA、basis registration IDを各itemに残した。
- 判断探索範囲の `docs/governance/decisions/*.md` 45件を全て走査した。同じidentityの古い判断は新registrationへ自動継承しない。既知のrevision mismatchと処置はJSONの `revision_mismatch_review` に記録した。HARNESS-041とHELIXOS-038のlive revisionは後続11候補判断にexact一致する。HELIXOS-034 `-003` は57候補判断の `-002` と異なり、exact判断なしで未分類。HARNESS-049 `-003` も11候補判断の非採択対象 `-002` と異なるため未分類であり、不採択ではない。
- `stage-release-po-decisions-2026-09-27.md` は旧HELIXOS-014 `-001`をsource起点として挙げるが、その候補はsuperseded。現live `-002`の別個の採否根拠にはせず、後続の2026-09-28 HELIX-OS決定のexact対象として扱う。
- MPRの `registered_proposal` / `authority_effect`、worksheet recommendation、coverage receipt、issue、PR、CIから採否を推定していない。

## 対象外と残余

本inventoryはMPRに現在登録される候補revisionへのPO処置だけを数える。旧source全件の被覆、全source atomのclosure、formal successor割当、L3承認、下流要件完了、実装・受入・release許可は示さない。67 source holdingsの中身や残余はこの候補identity censusで採否を付けていない。

## 入力本文のSHA-256

register、全てのMPR registration IDを含むdecision文書、比較に使った旧inventory、063のworksheet/L2/L11/receipt/atom setのSHA-256は付属JSON `source_pins` を参照。旧8確認packetはcommitと取得したmarkdown blobのhashを別に記録した。

## 機械可読データ

[JSON全件inventory](live-candidate-effective-disposition-recount-after-2348-2026-09-29.json) は340件すべてのlive registration、candidate digest、source、状態、該当decision basisまたは未分類理由を保持する。
