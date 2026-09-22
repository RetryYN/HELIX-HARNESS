# SCF-B-0108 `src/lint/` unresolved implementation-source product research

`legacy-asset-phase-product-classification-bootstrap.jsonl` から、`product_classification_status=unresolved`、`artifact_evidence_kind=implementation_source`、`source_path=src/lint/**` の95資産を固定BASE `5562f04da0f3205f9aa58205ec0d478419fc4f2e` で再導出する研究Scaffoldを追加する。

対象はWave1–50の598 edge／355 unique assetとは別のphase台帳起点の95件で、対象に接続するWave edgeは17、linked assetは14、全edgeのsemantic_link_statusはunresolvedである。旧archive sourceのblob／bytes／digest／実source行text digest、phase／asset disposition、decision／failure／consumer、unit候補、四製品boundary／L1を静的に照合する。

旧sourceを実読した14件（HARNESS 8、OS 6）は、source span・対応L1行・product-boundary counter-evidence・consumer pending boundaryを個別に固定し、直接候補根拠として提案する。残り81件は `source_semantic_review_pending`／`insufficient_basis` のまま保持し、filename／汎用語／宣言名／unresolved Wave unit scopeを製品候補へ昇格しない。全件 `authority_effect=none`、正式asset分類／product route／successor／implementation成立／consumer closure／new buildは変更しない。

validatorは固定BASE祖先性、input path集合／digest（Wave1–50、研究入力、95 archive source）、95件exact set、598／355分母、17 edge欠落／重複、source blob／bytes／digest／line_count／read_mode／実source line digest、14件manual evidence、81件pending、phase／disposition未変更、record／inventory全宣言、target asset artifact kind分母、四製品boundary／L1／failure／consumer行digest、authority昇格をfail-closedに検査する。selfcheckは23 negative casesを期待error code付きで検査する。

旧archive runtime／test／CI／workflow／hook／adapter／sourceは実行していない。Progress referenceはIssue #1813のみ（closeなし）。
