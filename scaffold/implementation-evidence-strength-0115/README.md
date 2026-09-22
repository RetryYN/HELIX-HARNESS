# SCF-B-0115 旧実装証拠強度の追加研究 Scaffold

このbundleは、固定BASE `0d51a994f418450efc40438244f0552e428fc207` の正本crosswalk候補218 unit（BR 49、FR 93、TR 16、NFR 60、153 source ID）から、各family 5 unitを選んだ20 product unitを静的に調べる研究用Scaffoldである。選定は実装判定ではなく、旧source本文・test候補・判断史・failure finding／receipt・consumer参照を追加確認するための固定サンプルである。

対象は16 HELIX-OS unitと4 HELIX-HARNESS unit、60 Wave1〜50 semantic review edge、38 unique old asset、598 scan row、180 current context参照である。選定スコアは `implementation_source_asset_count*5 + test_evidence_asset_count*4 + coverage_failure_count*2 + observed_consumer_ref_count + ledger_consumer_ref_count + decision_record_count + read_after_record_count` とし、固定BASEの候補pool内でfamily quota、score降順、unit ID昇順を記録している。選定unitの完全な集合と単位別metricsは `inventory.json` に固定する。

成果物は次のとおりである。

- `inventory.json`: 固定BASE宣言、入力path／Git bytes digest、候補poolと選定規則、20 unit／60 edge／38 asset／598 scan row／180 current refの分母、anchor hash provenance、partition契約、禁止推論、未解決、負例codeを固定する。
- `evidence.jsonl`: unitごとのcrosswalk source snapshot、IR原文anchor、Wave edgeとedge別anchor resolution、旧assetのsource本文静的読了metadata（path／blob／bytes／lines／body digest）、ledger／判断史／read-after、failure finding／receipt、consumer参照、旧implementation／degradation／failure／consumer partition、代表asset完全record、現行context、反証、未解決を記録する。`novel_evidence`では、追加で読んだsource／test本文の具体的なanchor行、旧契約のnormal／recovery／constraint候補、failure findingとreceiptの有無、consumerのledger／decision／read-after行、unit成立判断に欠ける証拠と次の判断点をunit別に固定する。
- `build.py`: crosswalk、IR、decomposition、旧asset ledger、判断史、read-after、classification、Wave1〜50、現行contextを固定BASEのGit object bytesから読み、旧source／test／runtime／CIは実行しない。
- `validate.py`: 選定unit、unit別edge／assetの件数・多重集合・重複、source／edge anchor、旧asset source／body／ledger完全一致、representation、implementation／degradation／failure／consumer partition、strength assessment、current status、inventory宣言、BASE祖先性と全入力digestをfail-closedで検査する。
- `selfcheck.py`: source／asset／anchor、edge／asset欠落・重複、ledger、代表asset、partition、current／未実装、strength assessment、novel evidence、inventory宣言、input digest、BASEを改竄する26負例を期待error code付きで検査する。
- `scaffold/bindings/SCF-B-0115.json`: bundle全成果物をScaffold Bindingへ登録する。

## 既存bundleとの差分（novel evidence）

既存の218 unit bundleが保持するcandidate／Wave edge／catalog partitionを再包装するだけにせず、選定20 unitの38 asset本文を固定BASE bytesとして読み、body byte／line数・body digest・Git blobと、各review edgeが指す原文path／line／blobを独立に結んだ。さらに、各unitの旧source／test候補が旧契約のnormal／recovery／constraint／acceptanceのどの面を候補化するかを`possible_legacy_contract_surfaces`へ記録し、`legacy_requirement_implementation_contribution`とcounter-evidenceを同じ行へ保持した。

failureはcoverage findingの具体的な行／blobと、read-afterにfailure値があるかを分離し、consumerはedge参照、ledger／decision／read-afterの正本行・file digest・IDとclosure pendingを分離した。これにより、source本文の存在、旧契約の候補面、failure finding、consumer参照がそれぞれ確認できても、unit-level implementation／degradation／failure／closure／acceptanceを判定できない不足（実行・受入receipt、全atom wire-up、failure receipt、closure receipt）をunitごとに残す。今回の固定BASEではtest_sourceと旧実行receiptはなく、FR-23のtest_designは受入観点候補に留まる。

`implementation_source`または`test_design`の存在は、旧unitの実装成立を示さない。選定20 unitでは旧source本文を固定BASE bytesとして読み、source path、Git blob、body byte／line数、body digestを保存するが、unit-level implementation statusはunknownのままである。test evidenceは候補poolで確認できるtest_designを含む静的記録で、旧test_sourceは確認されていない。旧runtime／test／CIの実行や受入receiptはない。

`coverage.failure`、counter-evidence、phase transition、constraintは静的なreview finding／判断史であり、unit-level failureやdegradationを確定しない。旧failure receiptは固定BASEのread-after記録にfailure値がある場合だけ `receipt_present_static_unexecuted` として保持し、今回の分母では0件である。ledger／decision／read-after／observed consumer refは参照の存在を示すだけで、consumer closureはpendingである。代表assetとcatalog statusは検索候補であり、実装証拠へ昇格しない。

現行contextは参照digestのみで、現行実装、operation、acceptanceはunknownである。証拠不足やunknownから未実装を断定せず、未実装は`not_assessed`、formal phase／product authority、successor、consumer closure、受入、完了は生成しない。formal crosswalk／authority／successorは変更せず、#1813は進捗参照だけに用いる。

## 検証

```text
python3 scaffold/implementation-evidence-strength-0115/build.py
SCF-B-0115 bundle generated

python3 scaffold/implementation-evidence-strength-0115/validate.py
SCF-B-0115 validate: PASS (20 selected units; counts derived from fixed BASE; static-only)

python3 scaffold/implementation-evidence-strength-0115/selfcheck.py
SCF-B-0115 selfcheck: PASS (26 negative cases; expected error codes matched)

python3 scaffold/tools/scfctl.py validate
```

上記は固定BASEのbytes、validator、意味のある負例、Binding整合を確認する静的検証である。旧code／test／runtime／CI、新世代runtime／CI、merge、close、deploymentは実行しない。
