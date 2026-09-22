# SCF-B-0122: 旧 `non_executable_read_only_source` 29件の静的証拠分離

この束は、固定BASE `78e23a622bc9c40183269e22a59c566d22b93435` の旧資産明細台帳から、次の3条件を同時に満たす29行を全件選んだ研究用Scaffoldです。

- `implementation_status=non_executable_read_only_source`
- `asset_class=RequirementSourceSnapshot`
- `disposition=source_snapshot_preservation`

選択は台帳順で再導出し、`inventory.json` の `selected_asset_ids` に29件のexact setを保存しています。対象は旧HARNESS L1要求5件、旧画面L2要求7件、旧HELIX要求9件、画面境界1件、旧ガバナンス要求1件、Requirement IR 6件です。代表3件だけを採用する構成ではありません。

## 記録した証拠

`evidence.jsonl` は29行を持ち、各行で以下を分離しています。

- 旧archive sourceのGit blob、byte数、SHA-256、行数、原文anchor（path／line／line digest／preview）と、現行保存先のGit blob、byte数、SHA-256。
- phase/product classificationの正本行、旧decision 58行（各asset 2行）、copy read-after 29行、ledgerのconsumer refs。これは保存・carry-forward履歴であり、実装履歴ではありません。
- Wave1–50の598 edgeから対象に関係する222行、crosswalkのrepresentative asset 49行、candidate pool 868行を固定。direct legacy asset linkは0件です。
- 218 product unit、153 source ID、598 Wave edge、355 unique Wave asset、4,020 ledger rowを探索母集団として固定します。対象の222 edgeは7 assetに分布し、semantic requirement relationの記録であって実装成立を示しません。
- failure／consumer監査source 2件をasset IDまたはexact source pathで静的検索し、直接一致0件を記録します。検索ミスは旧failureやconsumerの不存在を意味しません。

## 判定境界

29件すべての旧実装、旧縮退、旧failure、旧未実装、現行実装は `unknown` です。明示的なunit実装証拠、unit failure/degradation receipt、現行実装証拠、または人間の未実装decisionは固定BASEのこの集合から確認できないためです。`candidate_product_targets`、`candidate_phase_targets`、Waveの `confirmed`、representative asset、source保存先のdigest一致を、実装・未実装・縮退・受入へ昇格していません。

`requirements-ir/acceptance_cases.json` と `requirements-ir/system_tests.json` は定義・テスト記述として `definition_only_no_verdict` と記録し、実行結果やacceptance verdictは生成していません。その他27件のacceptanceは直接結合なしです。consumer refsは資産保全側に存在しますが、unit consumer closureは `pending` のままです。

この束はsource／history／failure／consumerを読み取るだけで、旧runtime、旧test、旧CI、workflow、hook、adapter、sourceの実行をしていません。authority、formal implementation、degradation、unimplemented、acceptance、successorは変更しません。

## 生成・検証

```bash
python3 -B scaffold/legacy-nonexec-evidence-0122/generate.py
python3 -B scaffold/legacy-nonexec-evidence-0122/validate.py
python3 -B scaffold/legacy-nonexec-evidence-0122/selfcheck.py
```

validatorは固定BASE Git objectから入力とsource／target bytesを再読し、BASE祖先性、98 input digest、29 asset集合、nested ledger／phase／decision／read-after、source anchor、Wave／candidate／representative集合、status境界をfail-closeします。selfcheckにはconsumer改竄、history改竄、source／target digest改竄、unit／representative／candidate forgery、implementation／unimplemented／degradation／failure／acceptance promotion、重複・欠落、input／BASE／scope／authority改竄を含む24負例があります。

Bindingは `scaffold/bindings/SCF-B-0122.json`、差し替え台帳はIssue #1813を参照します。これは研究用Scaffoldであり、#1813のcloseや正式採否を生成しません。
