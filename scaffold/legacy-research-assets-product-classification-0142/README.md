# SCF-B-0142 `docs/research/assets/**` 57件の四製品責務候補研究

`SCF-B-0142` は、現行main `a577a7cddd1405de27bf01d22b050eb2acaa9ba9` の旧資産台帳から、`docs/research/assets/` 配下の57件を抽出するresearch-only Scaffold Bindingです。対象はKimi review lane admissionの10件・12件、S4 benchの20件、smoke rerunの15件です。正確なID集合とsource path集合は `inventory.json` に固定しています。

`independent-source-audit.py` は生成済みclassification、generator、validatorを入力せず、固定BASEのdispositionから57件を独立に再導出します。全source blob 58,243 bytes／1,181 linesを静的に読み、mode `100644`、type `blob`、source SHA-256、`MANIFEST.sha256`、disposition digestを照合します。旧 `run-*.ts` はsource evidenceとして全文を静的に読むだけで、実行していません。

classificationはsemantic analysis済みのspanを主張しません。`source_exact.semantic_anchor` はsource先頭8行を機械抽出したexcerptであり、実semantic spanではありません。path groupは候補を整理するための根拠に限ります。35件を `direct_product_basis`、17件を `multi_product_conflict`、空sourceの5件を `insufficient_basis` と記録します。いずれも正式な製品所有を確定しません。fixture3-notesの原文は平日のstaging deploy、smoke suite通過条件、health check連続失敗時のon-call通知を述べますが、HELIX-OSのプロジェクト／CI運用かHELIX-Web-OSのサービス配備／監視かを特定しません。4製品の責務境界を照合し、bootstrapの両候補列挙は独立の比較証拠、smoke path groupのOS示唆は弱い候補根拠として分離して記録し、formal採択せずmulti_product_conflictにします。4製品すべての責務境界・L1・承認decision receiptを参照証拠として保持します。

dispositionは57件すべて `unresolved`、product targetも `unresolved`、implementation statusは `unknown` です。対象ID/pathに一致するdecision/read-after/failure/consumer/wave edgeは見つからず、consumer refsはすべて空です。これは間接consumerが存在しない証明ではなく、consumer closureは未解決のままです。

現行mainは609件、source SHA-256は608種類です。#2094のHEAD `862060c0` はmain `a577a7c` に統合済みのため、別PRとして二重計上しません。#2097は依頼時点のHEAD `d233e6e99f705439043a07f0a96bdd9e535a288a` を歴史的な固定比較点として8件照合し、対象57件およびmainとのID/path/SHA/identity重複は0件です。#2097の将来HEADへ自動追随しません。対象57件を加えた投影unionは674 ID/path/identity records、669 distinct source SHA-256です。対象sourceは53種類のSHAを持ち、空stderr 5件が同じempty-content SHAを共有します。これは研究分母の投影であり、正式採否や完了を示しません。

`research-union-snapshot.json` はmainと固定比較HEAD上の全 `classification-research.jsonl` についてrevision、path、Git blob、byte数、SHA-256、identity tupleをvendored snapshotとして固定します。Git objectが利用できるときはsnapshotと実byte/blobを比較し、一致しなければstaleとして停止します。Git objectが利用できないときはdigestで固定したidentity tupleへfail-closeで切り替えます。無効・欠落・不一致はtracebackでなく `E_INPUT_STALE` になります。

`generate.py` は固定BASEと固定比較点から `classification-research.jsonl`、`inventory.json`、Binding、snapshotを生成します。`validate.py` はrecord／inventory／Binding全体のkeysetと型込み期待値比較、bootstrapとの候補整合、source／archive／MANIFEST／ledger digest、四製品boundary/L1、phase、implementation、history/failure/consumer、wave edge、main／#2097 union overlap、input digest、audit digestをfail-closeで検査します。`selfcheck.py` は38件の負例をvalidatorへ実際に通します。

## 検証

```text
python3 -B scaffold/legacy-research-assets-product-classification-0142/independent-source-audit.py
python3 -B scaffold/legacy-research-assets-product-classification-0142/generate.py
python3 -B scaffold/legacy-research-assets-product-classification-0142/validate.py
python3 -B scaffold/legacy-research-assets-product-classification-0142/selfcheck.py
python3 -m py_compile scaffold/legacy-research-assets-product-classification-0142/*.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

旧archiveのruntime、test、CI、workflow、hook、adapter、sourceは実行していません。review依頼、merge、Issue close、formal authority付与はこの束の責務外です。
