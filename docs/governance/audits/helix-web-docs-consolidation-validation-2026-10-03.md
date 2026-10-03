# HELIX-Web文書配置統合の最終静的検証監査

検証HEAD: `1014ef9d0e39197dfa0e9d9cda77d58d3bc6c832`。統合base: `148c03326f83d027dbeff27ef79f95ab3aeb4692`。比較基準main: `148c03326f83d027dbeff27ef79f95ab3aeb4692`。

137個の静的validatorを実行し、失敗validator数は基準・検証後とも55件でした。新たに失敗したvalidatorはありません。診断行は追加19行、消失23行でした。追加19行は下表に示す既存のcurrent source locator driftが表面化したもので、要求意味上の新しいfailureではありません。全137件のexit code、stdout/stderr、validator SHA、output SHAは本監査JSONへ記録しました。checkout絶対pathは`<REPO>`へ正規化しています。

## 移動で可視化された既存source drift

PHCAP15の9識別子は、基準mainのrepository-root current pathが存在せず、既存validatorが`E_CURRENT_REF`を出していました。移動後、保存済み行範囲に対するvalidatorのUTF-8 raw bytes（`splitlines(keepends=True)`）検査が可能になり、以前から一致していなかったsource span metadataがtext/spanまたはdigest/span診断として現れました。旧/current source全bytesと同一spanは、Markdown link destinationおよび`helix-web/docs/` locatorの変更だけを正規化すると一致します。inventoryのidentity、meaning、line bounds、stored text/hash、validator意味は変更していません。

| Validator / consumer | identity | base診断 | 移動後診断 | base path | 旧source SHA-256 | 旧raw span SHA-256 | 現行raw span SHA-256 |
|---|---|---|---|---|---|---|---|
| phcap15-deploy-research | `CUR-WEB-L1-BOUNDARY` | `E_CURRENT_REF` | `E_CURRENT_REF_TEXT` + `E_CURRENT_REF_LINE_SHA` | 不存在 | `29fe8cbd1a61896852bab6aa636f2bc1d2386b57e69fab1249678fd64a9d3ee6` | `103ddea9910bc657d250e20315266fdb0dc1bd4030e3b1b48375ffcbe072ee23` | `103ddea9910bc657d250e20315266fdb0dc1bd4030e3b1b48375ffcbe072ee23` |
| phcap15-deploy-research | `CUR-WEB-L2-BOUNDARY` | `E_CURRENT_REF` | `E_CURRENT_REF_TEXT` + `E_CURRENT_REF_LINE_SHA` | 不存在 | `f5f69a92eb3c9e23f1c1d13995aa9ad708d1e55b26764a38582760335838fc1a` | `e33fd14eab31256a650c39cf9fbd2cc4c4515117344e13897dc8884160a7d8d0` | `e33fd14eab31256a650c39cf9fbd2cc4c4515117344e13897dc8884160a7d8d0` |
| phcap15-deploy-research | `CUR-WEBOS-L1-DEPLOY` | `E_CURRENT_REF` | `E_CURRENT_REF_TEXT` + `E_CURRENT_REF_LINE_SHA` | 不存在 | `f702ed0044b284d8c9b560c63f611ae54912141f91ff85f8b39bdd0d63512ef1` | `76fb35d6cd15b69f9950a680f3b30397a01a80d199ddcf39a5042d245e5e01be` | `fb5dff123132b179b1011a6f9ffc22c8e1def5af7c111a4c9b319ca3fb39f1fd` |
| phcap15-deploy-research | `CUR-WEBOS-L2-DEPLOY` | `E_CURRENT_REF` | `E_CURRENT_REF_TEXT` + `E_CURRENT_REF_LINE_SHA` | 不存在 | `07d91c27b469db6b7467aef40b38c96e19f6e7eecd5f9be77fd22b0b28e1fd35` | `6aec8de7137196a2510f78107c5f84e718a794ad51c7040a3d63f50939735381` | `6aec8de7137196a2510f78107c5f84e718a794ad51c7040a3d63f50939735381` |
| phcap15-deploy-research | `CUR-WEBOS-L11-UNEXECUTED` | `E_CURRENT_REF` | `E_CURRENT_REF_TEXT` + `E_CURRENT_REF_LINE_SHA` | 不存在 | `4ff0e2c996d2af2cd08b4d4913357362a859a6f157df31138417db6e775bd96c` | `485d41a54d230a8641008e7fab26cad0009b8a96a4af30c1b98dfb89ada7afc5` | `a783f4b7542bea9d4a7403e2ef8be3ab0005ae6f38d248b021a802acba83ef4e` |
| phcap15-deploy-gap-research | `HELIX-Web:docs/helix-web/L1-planning/product-intent.md:24-49` | `E_CURRENT_REF` | `E_CURRENT_DIGEST` + `E_CURRENT_SPAN` | 不存在 | `29fe8cbd1a61896852bab6aa636f2bc1d2386b57e69fab1249678fd64a9d3ee6` | `da3e949ff1f141abe73dae0677c48ae5622131b5c1b3ee9ecfd7d3c6bd0788fe` | `da3e949ff1f141abe73dae0677c48ae5622131b5c1b3ee9ecfd7d3c6bd0788fe` |
| phcap15-deploy-gap-research | `HELIX-Web-OS:docs/helix-web-os/L1-planning/system-intent.md:14-49` | `E_CURRENT_REF` | `E_CURRENT_DIGEST` + `E_CURRENT_SPAN` | 不存在 | `f702ed0044b284d8c9b560c63f611ae54912141f91ff85f8b39bdd0d63512ef1` | `a66b6d6ddbc86d9eb114adbfe03b3987f97c995c9a1e598bb60e25fe0941f78c` | `cdd1bd7dcf90ab77f3f5769532f10c2baa467f000c36f1a28b18fa7a17c39f55` |
| phcap15-deploy-gap-research | `HELIX-Web-OS:docs/helix-web-os/L2-requirements/service-governance-requirements.md:33-38` | `E_CURRENT_REF` | `E_CURRENT_DIGEST` + `E_CURRENT_SPAN` | 不存在 | `07d91c27b469db6b7467aef40b38c96e19f6e7eecd5f9be77fd22b0b28e1fd35` | `6aec8de7137196a2510f78107c5f84e718a794ad51c7040a3d63f50939735381` | `6aec8de7137196a2510f78107c5f84e718a794ad51c7040a3d63f50939735381` |
| phcap15-deploy-gap-research | `HELIX-Web-OS:docs/helix-web-os/L11-acceptance/service-acceptance.md:22-24` | `E_CURRENT_REF` | `E_CURRENT_DIGEST` + `E_CURRENT_SPAN` | 不存在 | `4ff0e2c996d2af2cd08b4d4913357362a859a6f157df31138417db6e775bd96c` | `e4b493c80d928f1f2a42d0caf9cb33a090f5453a11b7f2d1badd9e51a7ed6b16` | `e4b493c80d928f1f2a42d0caf9cb33a090f5453a11b7f2d1badd9e51a7ed6b16` |

RDP001 validatorは`git show HEAD:<current path>`を行います。基準148では両current pathがなく`FAIL E_GIT_SOURCE`でした。移動後はcurrent pathを読み、保存済みsource SHAとの差として`FAIL E_CURRENT_SOURCE`が出ています。保存済みの2 SHAは固定capture revision `ea771fb2c496d40fcc429877b0fcd8cff6999526`での実bytesと一致します。基準148時点の旧ファイルSHAは保存済みSHAとも一致せず、このsource driftは移動前から存在しました。line/span/source-relationsは修正していません。

| inventory field | source path | base148の旧source SHA | 保存値 / fixed capture SHA | 移動後current SHA |
|---|---|---|---|---|
| `current_web_l2_sha256` | `docs/helix-web/L2-requirements/product-requirements.md` | `f5f69a92eb3c9e23f1c1d13995aa9ad708d1e55b26764a38582760335838fc1a` | `e04cc88ac0b95870805ac9d8b6ffbc69b87b7b5917ded285305cee9c068ba2c0`（fixed revision一致） | `8ae5baedb071995190e8553d23dad3cb55a4bde1cb0110f0b0c464859762c27c` |
| `current_webos_l2_sha256` | `docs/helix-web-os/L2-requirements/service-governance-requirements.md` | `07d91c27b469db6b7467aef40b38c96e19f6e7eecd5f9be77fd22b0b28e1fd35` | `632c5b732346d10dbb113c89c9025ab0e6750635d90b2638892f71ed9a0ab248`（fixed revision一致） | `fc20446eb90bf3d89de941686a6d9c82889bf5bb753af7c0aa52946053a8cac5` |

## 消失診断、pin閉包、保持確認

消失した診断23行には、上表の旧missing 9行とRDP001の旧git-source 1行が含まれます。残る13行は、current source/file digest・phase/current referenceの以前からのpin不一致がcurrent pin closureで解消したものです。追加19診断行と新規validator failure 0件を区別して記録します。

`scfctl validate`は143/143 PASS、`stale=0`、`residuals=0`でした。`git diff --check`もPASSです。Web文書31件を移動し、destination SHA対応32件は実bytesと全一致しました。PO snapshot delimiter下本文SHA-256と2026-09-26固定判断record bytesを保持しています。classification source path 15件、phase inventory current refs 9件、Wave38–50 current meta pin 91件、phase record current refs 5件、current counterpart bytes/SHA 10件を追随し、fixed source/history captureを保持しました。Phase Capability Register 1075行の全bytesはmain148と同一です。Binding current pins 600件を閉包し、既存528 note本文を保持してcurrent read-afterを追記しました。Binding role/obligations/authority等の意味fieldは変更していません。

添付JSONに各validatorのexit、stdout/stderr、validator/output SHA、診断差分、9 identityのraw span SHA、RDP001固定source比較、current/history pin閉包数を保存しています。

## 検証後の監査追記

本監査を追加する変更は本MDと同名JSONだけです。検証HEAD `1014ef9d0e39197dfa0e9d9cda77d58d3bc6c832`以降、validator code、schema、main entry、scaffold inputs、Binding bytesは変更していません。再検証した結果の変更ではなく、凍結済みtreeの証拠を記録するaudit-only追補です。
