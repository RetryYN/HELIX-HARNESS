# WR211 L8/L5 hash参照整理の静的監査

status: scaffold research evidence（正式設計・承認・実装・受入ではない）
authority_effect: none
対象候補: `docs/helix-harness/L8-unit-verification/semantic-asset-lineage.json` と同書の`candidate_l5_binding`
確認したmain/base: `4bee77125480c578068aa0760d2f6b33c497d53a`

## 目的と境界

既存L8のownership-capで重複として数えられた13参照（body 3、freeze 6、L5 rule value 4）の削除後も、元のhash値を既存source pointerから再構成できることを静的に示す。case入力、期待値、oracle、case ID、Qualification typed input、owner意味は変更しない。値やcaseは追加せず、L8が保持していた重複参照の監査可能性だけを扱う。

`validate.py`は固定L8 revision `4bee77125480c578068aa0760d2f6b33c497d53a` のGit bytesから削除前のhashを読み、現行L8とL5候補の固定revision `572ad5be595b2f052c72199f5edcc52c92f82dda` を読み取り専用で照合する。入力はGit object・JSON pointer・埋込fixtureのbytesに限る。L4/L5 algorithm、旧HELIX runtime・test・CIは実行しない。

## 再構成根拠

| 削除した複製 | 元値の再構成先 | 確認 |
|---|---|---|
| ADD-22/23/24 `source_body_sha256` 3件 | 固定L8 revisionの各case `/source_whole_identity/reason_qualification_addresses/0`; 同caseの`source_ref.sha256`と`typed_input/non_applicability_sources/0`の`content_bytes` | 旧値＝source Ref SHA＝fixture contentのUTF-8 SHA-256を3件照合。入力とexpected comparisonは旧revision/currentで一致。 |
| ADD-25/26/27およびsummaryの`source_freeze_sha256` 6件 | 同じL8 revision内の3 case・3 summary pointersと、現行L8の`candidate_case_supplements/source_failure_freeze_provenance` | 6値すべて中央provenanceのpath/SHAに一致。中央pointerは保持。summaryのcase mappingも維持。 |
| L5 `value_canonical_sha256` 4件 | L8内の固定L5 revision・全file SHA・4つのrule JSON pointer/ID | 固定revisionの全file SHAと4つのcanonical rule SHAを再計算して一致。 |

監査は`python3 scaffold/research/wr211-hash-reference-reconciliation-20261031/validate.py`で再実行できる。固定revisionのGit objectsが利用できない場合はvalidatorが失敗する。validatorは全L8 JSONを比較し、上表の13個の指定pointer削除と、hash-reference監査記録およびL5 revision pinの2 metadata追補だけを差分として許す。他case、expected/oracle、未指定metadataなど任意の差分を無条件に正規化して隠す処理はしない。検査は固定値との再構成であり、SHA値が指すsource bodyやowner情報の実在性・正当性を追加認定しない。

## freeze sourceの所在限界

L8中央参照は`scaffold/review-handoff/local/root-h053-selected-source-failure-three-whole-freeze.json`、SHA-256 `3f4e2f58adad8c2fefba92e78400dc2377170923013e6fb0c55946b81cd37ee2`を保持する。調査時、隔離worktreeとfetched main tree/historyでは実体および配布可能なsource commitを解決できなかった。一方、共有checkoutには同名local fileがあり、内容SHA-256は記録値と一致した。ただしこれはGit追跡された配布sourceではなく、commitも特定できない。したがって監査資料へ複製せず、欠落を埋めた扱いにせず、L8のpath/hashだけを監査用referenceとして残す。

このfreezeはL8自身の記録どおり入力・期待値を読む唯一依存先ではない。ADD-25/26/27の全入力・全期待値は各case本文にある。local freezeの所在一致から独立oracle、承認、raw sourceの利用可能性を導かない。

## 残件と測定範囲

- rootが候補worktree `/tmp/helix-wr211-l8-hash-references` のbase `4bee77125480c578068aa0760d2f6b33c497d53a` と未commit L8で実施したcandidate child checkerの結果は、L8 ownership-cap 43→30、L4/L9およびL5/L8 pairがPASS、4-wayは76 failures、matched_case_count=0のまま変更前後不変。rebase先の最新main `fa3d2d515ce8df79c0a74d5360a4d1254863a6f1` とbaseの間でL8対象bytesに差分がないことを確認したが、最新main上の候補でも再測定し、両pair PASS、4-way 76 failures／matched 0、L8 cap 30を確認。本validatorはcheckerを実行せず、L4/L5 algorithmの結果も生成しない。
- 残る30件はADD-22..27のtyped Qualification `subject_sha256`値で、case inputとして保持する。新しいhash keyへ移さず、値も隠さない。追加のcap削減はこの範囲外。
- 元のL8にある`legacy_comparison`と`failure_basis`のsource参照・failure根拠はそのまま維持した。今回、旧source本文やruntimeを再解釈・実行していない。
- L9のcase/expectedを使った独立oracleの成立、削除以外の期待値／oracle変更、未指定のraw source・output・owner具体値、4-way結果の追加改善は本監査の対象外。

## 確認コマンド

```sh
python3 -m json.tool docs/helix-harness/L8-unit-verification/semantic-asset-lineage.json >/dev/null
python3 -m json.tool scaffold/bindings/SCF-B-0183.json >/dev/null
python3 scaffold/research/wr211-hash-reference-reconciliation-20261031/validate.py
git diff --check
```

これらはJSON構造・固定pointer/hash再構成・差分の静的確認であり、formal verification/受入ではない。
