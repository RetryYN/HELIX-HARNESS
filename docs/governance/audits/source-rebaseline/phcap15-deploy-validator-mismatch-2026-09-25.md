# PHCAP-15 Deploy研究検査とWeb-OSのauthority分類の食い違い

status: research audit（検査条件と既存候補の採否を変更しない）
comparison_base: `8e37e3c944765a830f88d59d5412cc10bf3e993d`
current_base: `286f6cb7b76fb19dc002e9e73653612c4e5f1a37`（#2131・#2134統合後）

## 対象と再実行結果

ゴール1で指定されたPHCAP-15 Deployの8研究束は、基準commitで失敗していた検査であり、現行mainでも失敗する。現行の`validate.py`だけを実行し、最初の失敗系列を確認した。旧archiveのsource、test、CI、runtime、toolは実行していない。

| 研究束 | 現行の失敗系列 | 意味上の固定前提 |
|---|---|---|
| `scaffold/phcap15-deploy-research/` | `E_CURRENT_REF_SHA`／`TEXT`／`LINE_SHA`ほか | `validate.py:294`がPHCAP-15を`draft_requirement`、`:355`がOS・Web-OSを直接根拠とする |
| `scaffold/phcap15-deploy-gap-research/` | `E_CURRENT_DIGEST`／`SPAN`ほか17件 | `validate.py:33-44`が旧4製品境界と`draft_requirement`を固定する |
| `scaffold/phcap15-deploy-followup-research/` | `PRODUCT_REF_DIGEST`／`SPAN`ほか | 現行Web-OS L1／L2／L11を要求境界として固定する |
| `scaffold/phcap15-deploy-pool12-research/` | `PRODUCT_REF_DIGEST`／`SPAN`ほか | 現行4対象のL1／L2／L11境界を固定する |
| `scaffold/phcap15-deploy-next12-research/` | `LEDGER_SHA`、`PRODUCT_REF` | `validate.py:240`がWeb-OSとOSの`draft_requirement`を固定する |
| `scaffold/phcap15-deploy-fifth12-research/` | `LEDGER_SHA`、`PRODUCT_REF` | 同じPHCAP-15 statusと旧4対象の製品参照を固定する |
| `scaffold/phcap15-deploy-sixth12-research/` | `LEDGER_SHA`、`PRODUCT_REF` | `validate.py:338`がWeb-OSとOSの`draft_requirement`を固定する |
| `scaffold/phcap15-deploy-final8-research/` | `LEDGER_SHA`、`PRODUCT_REF` | `validate.py:322`がWeb-OSとOSの`draft_requirement`を固定する |

`docs/governance/phase-capability-inventory.json`のPHCAP-15行は、現在も`status: draft_requirement`、`evidence_products: [HELIX-OS, HELIX-Web-OS]`、Web-OS L2とOS L2を`refs`に置く。このphase inventoryは研究の固定入力であり、現行のWeb-OS要求承認を示すものではない。8束のREADME、inventory、validatorはそれぞれ旧baseに対する当時の候補分類・証拠を保持する。

## 判断との照合

[2026-09-24のPO判断](../../decisions/concept-requirement-po-decisions-2026-09-24.md)は、WebとWeb-OSのL1・L2・L11を要求層から外してVision材料へ分類し直した。現行Web-OSのL1 frontmatterも`vision_material`である。したがって、Web-OS L2をPHCAP-15の現行`draft_requirement`根拠として照合する検査条件は、単なるpath・行・SHAの移動では閉じない。現行L1／L2／L11へdigestを付け直すだけなら、旧研究の前提を新しいPO判断へ黙って昇格させる。

旧HELIXのsourceは、各研究束README・inventoryに記録されたasset ID／path、特に`LEGACY-ASSET-54330A68064B58B22259`（旧HELIX L13 post-deploy evidence）、`LEGACY-ASSET-1251704E0BE627232E00`（旧HARNESS L13 post-deploy evidence）、`LEGACY-ASSET-189702B332643A3BFDAF`（旧post-deploy計画）を固定したものだった。旧L13の記述は現在のWeb-OS要求採否、実装、deployment結果を証明しない。旧`archive/legacy-generation-2026-09-14/root/CLAUDE.md:72-85`のinventory-firstと自律境界も静的に照合した。

## 扱い

この8検査は、ゴール1の「検査が確かめる意味と現行判断の食い違い」として一覧化する。`LEDGER_SHA`等に参照ずれもあるが、固定した`draft_requirement`／Web-OS要求境界の意味を変えずに全体をpassへ付け直せないため、validator・inventory・Bindingの値を機械的に更新しない。現在のPHCAP-15の要求化やDeploy責務は、この記録から決めない。将来の再導出は、現行Concept、対象L1、PO判断、旧sourceのfailure・consumerを改めて照合する作業とする。
