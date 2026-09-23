# Draft PR: SCF-B-0142 research assets product classification

## 目的

旧 `docs/research/assets/**` に残る57件を、現行main `7afee33ae892fe1a3cf1085fac4e02d923ece01d` から研究対象として固定する。Kimi review lane、S4 bench、smoke rerunにまたがる実験入力・出力・判定receiptを、source semantic span、四製品責務候補、phase候補、実装／縮退状態、failure／consumer closureに分離して記録する。

## 結果

- 対象57件。正確なID集合とsource path集合は `inventory.json` の `research_scope` に収録。
- `direct_product_basis=36`、`multi_product_conflict=16`、`insufficient_basis=5`。
- 50 wave入力を静的走査し、対象直接edgeは0件。
- `independent-source-audit.py` は固定BASE dispositionから対象を再導出し、57 source全体（58,243 bytes／1,181 lines）をblob／disposition／MANIFESTのSHAで照合。phase、decision/read-after、failure/consumer、wave、四製品L1/approvalとの独立joinも記録。
- current main 496件、#2090 `f075c91c...` 新規41件、#2094 `e5fc691c...` 新規72件とID／source path／source SHA／identity tripleを照合し、対象重複とPR新規間重複はすべて0件。今回を加えた投影unionは666 ID/path records。
- `authority_effect=none`、`formal_asset_classification_updated=false`、`new_build_allowed=false`。

## 検証

`independent-source-audit.py`、`generate.py`、`validate.py`、`selfcheck.py`、`py_compile`、`scfctl validate/stale/residuals`、`git diff --check` を実行する。旧archive内の実行可能資産は実行しない。

## 残る判断

product owner／boundary受入れ、phase admission、successor選定、実装・未実装・縮退の確定、consumer closure、正式asset分類は未解決のまま人間判断へ残す。
