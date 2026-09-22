# SCF-B-0120: `src/schema/` 旧asset 製品責務候補研究

固定BASE `5562f04da0f3205f9aa58205ec0d478419fc4f2e` の phase-product bootstrap から、`product_classification_status=unresolved` かつ `source_path` が `src/schema/` の旧assetを再導出し、31件全件を研究用recordへ固定した。旧source本文はBASEのGit objectを静的に読み、四製品L1、`docs/concept/product-boundary.md`、phase、Wave1–50、旧disposition／decision／failure／consumerを照合した。archive内のruntime、test、CI、workflowは実行していない。

分類候補は、具体的なsource spanと対応L1、境界上の反証を伴うものだけを `direct_product_basis` とした。製品責務が二つにまたがるものは単一ownerへ寄せず `multi_product_conflict`、汎用DTO・共通builder・境界の証拠が不足するものは `insufficient_basis` とした。候補は正式asset分類、product route、phase authority、successor、implementation成立、consumer closureを変更せず、`authority_effect=none`、`new_build_allowed=false` のまま保持する。

分類結果は direct 17件（HARNESS 10、OS 7）、multi-product conflict 10件（HARNESS+OS 9、HARNESS+Web 1）、insufficient basis 4件である。phase候補は PHCAP-03 が3件、PHCAP-05 が1件、PHCAP-08 が1件、残り26件は空で、phase候補も正式phase admissionではない。全31件の旧asset dispositionは unresolved、implementation_status は unknown、decision/read-after は対象行なしである。各recordの `legacy_implementation_shrinkage_evidence` に、旧sourceが保持する legacy入力抑制、fail-close、adapter-neutral、未成立・未実行の意味をsource anchorとともに記録した。

Wave1–50は598 edge／355 unique assetで、対象schemaは Wave36 の1 edge／1 linked asset（`LEGACY-ASSET-C6CF7E1C334856500558`、semantic linkは unresolved、candidate productは空）だけである。Waveの `product_scope` は観測値として保存し、asset候補の継承には使っていない。

既存研究束との重複は、Wave unresolved-product 64件との交差が1件、lint unresolved `src/lint/` 95件との交差が0件、runtime unresolved `src/runtime/` 73件との交差が0件である。既知の交差（runtime–Wave 16、runtime–lint 0、Wave–lint 14）を合わせた4束のunionは232件で、分母を単純加算していない。

`generate.py` は固定BASEから入力・旧source blob・bytes・digest・line text digestを再導出する。`validate.py` はgeneratorをoracleとしてimportせず、31 asset ID、category、候補product、reason、source span、legacy縮退解釈、boundary/L1の固定期待値を独立に検査する。`PINNED_REVIEWS` は人間相当のsource semantic review pinとしてvalidator内に保持し、generator側の表と一致しないdriftを拒否する。category evidenceは direct=候補product/L1 evidence各1、conflict=各2以上、insufficient=各0を満たす必要があり、`failure_consumer_static_refs` と `unit_product_candidates` のnested key閉包、asset/unit IDの型もfail-closeで検査する。Wave64・lint95・runtime73・schema31の重複は、姉妹束をoracleにせず固定BASE phase/Waveの選択規則から再導出する。generator側のcategory/products pin改竄後再生成も独立validatorで拒否する。`selfcheck.py` は対象record・edge・source digest／anchor・候補・分類・縮退証拠・history／human judgment・input set・authority・inventory・BASE pin／ancestor・generator改竄を含む47負例を期待error codeで検査する。

成果物はすべて `scaffold/` 配下に置き、Binding `SCF-B-0120` に登録する。正式台帳やproduct authorityの更新、新build、merge、closeはこの束の操作範囲に含まれない。
