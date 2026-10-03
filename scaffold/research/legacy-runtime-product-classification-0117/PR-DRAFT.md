# SCF-B-0117 `src/runtime/` unresolved product classification research

`legacy-asset-phase-product-classification-bootstrap.jsonl` から、固定BASE `5562f04da0f3205f9aa58205ec0d478419fc4f2e` 上の `product_classification_status=unresolved`／`source_path=src/runtime/**` 73資産を再導出する静的研究Scaffoldを追加する。

対象はWave1–50の598 edge／355 unique assetとは別のphase台帳起点で、runtimeに接続するWave edgeは16、linked assetは16（unresolved 14、rejected 2）である。旧archive sourceのblob／bytes／digest／実source行text digest、phase／asset disposition、decision／read-after／failure／consumer、unit候補、四製品boundary／L1を固定BASEから静的に照合する。

source本文の意味spanを73件すべて読み、候補を direct_product_basis 54（HARNESS 17、OS 37）、multi_product_conflict 8（HARNESS＋OS）、insufficient_basis 11 に分類した。これは研究上のcandidate／競合／根拠不足であり、正式asset分類、単一owner、product route、phase authority、successor、implementation成立、consumer closure、new buildを変更しない。Waveのunit scopeやrejected edgeは正式製品根拠へ継承せず、反証・観測値として保持する。

#2059相当のWave-linked unresolved-product 64、#2063相当のsrc/lint unresolved implementation-source 95との重複は、runtime∩Wave 16、runtime∩lint 0、Wave∩lint 14、三束union 202。分母を加算していない。

validatorは固定BASE祖先性、140 input path/blob/bytes/digest、73件exact set、598／355分母、16 edge欠落／重複、source blob／line anchor、四製品boundary／L1／failure／consumer行digest、旧history、category／product／interpretation、authority境界、inventory宣言、重複束分母を独立に検査する。generatorのreview table／anchor／L1を改竄して再生成する負例を含むselfcheckは37件すべて期待error codeで拒否する。

旧archive runtime／test／CI／workflow／hook／adapter／sourceは実行していない。Issue #1813は進捗参照のみ（closeなし）。
