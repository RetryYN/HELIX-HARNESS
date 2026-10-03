# HELIX-Web文書配置統合 PO判断記録（2026-10-03）

## 判断の出所と選択

POの指示：「L3のCodexのゴールを設定してくれ。」に基づくL3-D0の直下構成判断。受領した正本は`scaffold/review-handoff/local/codex-goals-2026-10-03-l3.md`（SHA-256 `b5030366fe27022695c9a51883e7cfe11656bc8ffce90c932598b85e9e9a79c4`）。この記録は配置の判断と移動対応を記録するもので、要求意味・分類・authority・versionや要求承認を変更しない。

## POの指摘と選択

POの指摘（goal原文）：「ディレクトリ構成の最適化してなくね？」

同goalに記録された追加の指摘（POが画面を示した場面）：「フォルダ最適化はいれたの？どう考えても構造おかしくね？」

Claudeの質問：「リポジトリ直下の構成をどうしますか？ 今は HELIX本体が docs/、Webが helix-web/docs/ と非対称です（2026-09-26にPOが「直下に helix-web/ を作る」を選んだ配置で、変えるにはPO判断が要ります）。」

POの選択：「docs/に統合 (Recommended)」

選択肢本文（原文）：「旧HELIXと同じく、本体もWebも1つのdocs/の下に機構ごとのフォルダで置く。Web分離は docs/helix-web*/ というフォルダ単位で保つ。直下は docs/ scaffold/ archive/ と設定類だけになる。」

## 以前の判断と旧HELIXからの保持点

2026-09-26のPO選択「直下に helix-web/ を作る」は当時の判断として保持する。[旧判断記録](helix-web-relocation-po-decisions-2026-09-26.md)はcommit `554aff0d3dd61e4e15bd261991af925d1e59baf7`の本文SHA-256 `6f689d117a0bb87338d6c6cc8b7796013965afe2364fddcf2c0c99a8f7cf4d0e`で固定され、書き換えない。

旧HELIXの資産 `LEGACY-ASSET-FDBA655B1CFF75DCDC0E`（`archive/legacy-generation-2026-09-14/root/docs/governance/repository-structure.md`、SHA-256 `6f8ee784049d03279641151714c3572656eb20c64cfb769853b6e885abf4f262`）では`repository-structure.md`自体はgenericな`docs/design/`を記載しており、対象別のHELIX/HARNESS構成の根拠には使わない。対象別の実在例は旧root `CLAUDE.md` 37–38行（`docs/design/harness/L3-functional/roadmap.md`）と53–55行（`docs/design/helix/L0-charter/helix-charter_v0.1.md`）で確認できる。旧asset disposition上の対応は `LEGACY-ASSET-CBF2D0F8889BC4C80AF4`（HARNESS roadmap、source SHA-256 `9a48ebdbc2d2ba984274961153b0131dd43fb19b871c42ed8e837758e0480a20`）と `LEGACY-ASSET-3B16BCFFAF353ADA813A`（HELIX charter、source SHA-256 `8eff96bf58e6bb2cca247acef18c4f6cf07e304f3f23fb4179ddd8e5b19b23d8`）である。旧構造台帳`LEGACY-ASSET-FDBA655B1CFF75DCDC0E`（SHA-256 `6f8ee784049d03279641151714c3572656eb20c64cfb769853b6e885abf4f262`）は配置検討の起点として読むが、ここに対象別の具体treeを帰属させない。保持するのは対象ごとのfolder分離。変更するのはWeb文書の親をrepository直下`helix-web/`から`docs/`へ移すこと。変更理由はPOの2026-10-03の明示選択である。

## 現行配置対応

以下は2026-10-03統合時の対応表である。移動元SHAは基準main `7b3001ea516dd880964480ec1082936723a5dd37`時点のsource bytes、移動先SHAは移動後に行った許可済み相対link/locator更新を含むcurrent bytesを示す。各destinationの現在SHAを記録する。source snapshotは原文外intro linkだけを移動先に合わせて更新した例外である。

| Source | Destination | Source SHA-256 | Destination SHA-256 | Note |
|---|---|---|---|---|
| `helix-web/README.md` | `docs/README.md`（HELIX-Web製品群の対象節へ統合） | `e3805eb0e17e568b1505061380a09ea3ccc9ed3ba5c2678eb7b33720387e8879` | `d66d7b19a78888f5dee933719f0e16aa5079d5b77fc03ea9881915014fee3eed` | 既存indexへ固有説明を統合 |
| `helix-web/docs/helix-web-connector/README.md` | `docs/helix-web-connector/README.md` | `5899f3eabf9b1f71bd9d00862088d72b16a15d563c50c12a62e0ffb31f7781b9` | `455d57d37cc779cbb10c40b1fe8b1f0f354f17dda667d19c94b12898e2e28fb2` | 移動。必要な相対link/locator追随 |
| `helix-web/docs/helix-web-connector/candidates/product-requirements.md` | `docs/helix-web-connector/candidates/product-requirements.md` | `e721e5c1ca529e40f36e9b376599f2f50fe962886eea8359ab82170814002016` | `a8dde20f54007e324ee451376dd7d326e7cca17b995429225b74615e30dec509` | 移動。必要な相対link/locator追随 |
| `helix-web/docs/helix-web-harness-core/README.md` | `docs/helix-web-harness-core/README.md` | `06ffcf8aa2da393e30f4248a3a3b10911b94280c6175b5bb8c4b776de0219231` | `8d5874ef7340d1ec44df6e5c922fd4209ef0fff8362b74f6096406797efac8ac` | 移動。必要な相対link/locator追随 |
| `helix-web/docs/helix-web-harness-core/candidates/core-requirements.md` | `docs/helix-web-harness-core/candidates/core-requirements.md` | `960b735eaee286a92034efe78d6ede8694197516c01621df241916cc27c8f9bd` | `711338f124a18e9af96b663007d89b70c0ad9571d65667b581c762d98cc9a754` | 移動。必要な相対link/locator追随 |
| `helix-web/docs/helix-web-harness-design/README.md` | `docs/helix-web-harness-design/README.md` | `3d2b5ddccf3b557ab6c9fbff6bdd1dd5e3ea94f9809d4fe0d41c6318d7cfdf5b` | `278aee2b7414e4f12358a5c3b9f762d21123f3203930949d702af7bf6712e01d` | 移動。必要な相対link/locator追随 |
| `helix-web/docs/helix-web-harness-design/candidates/product-requirements.md` | `docs/helix-web-harness-design/candidates/product-requirements.md` | `119cfe5cf9a2fba81ce7366ef7ef730b7e61c08231fa8a7e098a085e8826e6ee` | `19aae6b67adffaf77117701c2cdccb8f6458c5d1630342866b1f2c5c1b200076` | 移動。必要な相対link/locator追随 |
| `helix-web/docs/helix-web-harness-development/README.md` | `docs/helix-web-harness-development/README.md` | `900664fc85d78e19b24a8d64ca98ff8b00cfd4702d7d38d9dddf3ee06b3445f3` | `5db01a780558721b23bbefb9a5c064ba5c7348c495b6c2b04b0c9d371e355e90` | 移動。必要な相対link/locator追随 |
| `helix-web/docs/helix-web-harness-development/candidates/product-requirements.md` | `docs/helix-web-harness-development/candidates/product-requirements.md` | `5adeac4e1dfc4027b011e5f1dd521e642d69f3474c568828257293205d6f463f` | `c41b45604d7af0c92c3caeaa5a3414d2b6b693a1c00e17e50236f64e1fbeef54` | 移動。必要な相対link/locator追随 |
| `helix-web/docs/helix-web-harness-operations/README.md` | `docs/helix-web-harness-operations/README.md` | `536b17f5987490c3fa9de14ca7a76a8742c54b335231de21c4434830b5bb9e7b` | `dcb6998c07eeda2c980334c45758d019dfbae65af0fe12cf1fb50065d6da2deb` | 移動。必要な相対link/locator追随 |
| `helix-web/docs/helix-web-harness-operations/candidates/product-requirements.md` | `docs/helix-web-harness-operations/candidates/product-requirements.md` | `3617b197e01f6c53838751569e9ac7a28e11f7541c8df601a67b23bb84b29ce1` | `50e203ff4954446f68ec0baf96127ad72b6de9e5de5aab57f603be2b9a49add2` | 移動。必要な相対link/locator追随 |
| `helix-web/docs/helix-web-harness-prototype/README.md` | `docs/helix-web-harness-prototype/README.md` | `dfa26cd6eaaa3166dc1b969b4371579b12662a6a1ab0f3b1cb357534068249a5` | `381cb720edacadfd4a1b82eeb46c8b810237cbc73b195ae3700fa4e1e5460837` | 移動。必要な相対link/locator追随 |
| `helix-web/docs/helix-web-harness-prototype/candidates/product-requirements.md` | `docs/helix-web-harness-prototype/candidates/product-requirements.md` | `e1022811eec0e25798ca8934b487470789b2ad75cce1c00cb4ee5726ada868dc` | `534bb283da46fbfb0e84807473a6f78a36d10c5179a0e094d345a8eda0e6d7a5` | 移動。必要な相対link/locator追随 |
| `helix-web/docs/helix-web-harness-refactoring/README.md` | `docs/helix-web-harness-refactoring/README.md` | `f186beff0deeb2129b380c7c308334e1e54571592ce00a9d013bdf34c4e4167c` | `07000c3fd697beabb64ab250830b10a70ec3b340f92132c9625b0d499089ebef` | 移動。必要な相対link/locator追随 |
| `helix-web/docs/helix-web-harness-refactoring/candidates/product-requirements.md` | `docs/helix-web-harness-refactoring/candidates/product-requirements.md` | `966ddbebf7bb38ca9761c33fb0cd0f9a2cb1e185b18caf816ab3facb0dd7b239` | `0bb514641d3273c4acdfbf5274ff506ac72283b3370c8da677922be3608c5ba2` | 移動。必要な相対link/locator追随 |
| `helix-web/docs/helix-web-harness-release/README.md` | `docs/helix-web-harness-release/README.md` | `08f858ee9dcbb09edabf737dbbb2c6ed71020d2b4dfccf24df671871cc77e6a7` | `9ef3077ec480a72ea1e0186fedc027b8acd8029d19b2f277b5f8aeec76b9ee74` | 移動。必要な相対link/locator追随 |
| `helix-web/docs/helix-web-harness-release/candidates/product-requirements.md` | `docs/helix-web-harness-release/candidates/product-requirements.md` | `4098bbe1d54edb1750c5f0d4db03dbb224557513106f9430504049775630d529` | `efe4e2e0d75dcebb06647b330683fe8acbb72327720c000423d93dbf336e13f9` | 移動。必要な相対link/locator追随 |
| `helix-web/docs/helix-web-harness-requirements/README.md` | `docs/helix-web-harness-requirements/README.md` | `393553a43930abaca6ef0bd3e40f3c6b196d72563ec917a99abe3f07fbab1e70` | `c9a086b31d92da9b9f39f06977ec2a51c1d668944716dca8c31105b24c0ac381` | 移動。必要な相対link/locator追随 |
| `helix-web/docs/helix-web-harness-requirements/candidates/product-requirements.md` | `docs/helix-web-harness-requirements/candidates/product-requirements.md` | `bfce933d974f268b02f71f30962ae3380b6926ab17049ff2496a16cc1df2bbe2` | `7c6387769c57548f0102967430800ce242299377d7b89c4c43f76148236261cb` | 移動。必要な相対link/locator追随 |
| `helix-web/docs/helix-web-harness/README.md` | `docs/helix-web-harness/README.md` | `6a45525e1aa8d4880c5cbe72b919704c212cd7ca628fb623a2c2399143afa84c` | `6589c4e3999ced804b21e4728889ca6bbbfa29cd3d1b5fdb8570419a56e8286e` | 移動。必要な相対link/locator追随 |
| `helix-web/docs/helix-web-harness/candidates/product-requirements.md` | `docs/helix-web-harness/candidates/product-requirements.md` | `966312a275ffeb89a9c4225d8283158a16832b8853c99306345212b1bab61f06` | `e25af39955613cdec0f709a9f12fe18e6a2ed994c6bc14d9befd22e281fe3e51` | 移動。必要な相対link/locator追随 |
| `helix-web/docs/helix-web-os/L1-planning/system-intent.md` | `docs/helix-web-os/L1-planning/system-intent.md` | `f702ed0044b284d8c9b560c63f611ae54912141f91ff85f8b39bdd0d63512ef1` | `b0e757237e4872b8ea09d400fecb6bea1d0ebbddd29bb44856f154869e314765` | 移動。必要な相対link/locator追随 |
| `helix-web/docs/helix-web-os/L11-acceptance/service-acceptance.md` | `docs/helix-web-os/L11-acceptance/service-acceptance.md` | `4ff0e2c996d2af2cd08b4d4913357362a859a6f157df31138417db6e775bd96c` | `aed5518f2b2f2d2e4c7085d70caf3c8cda8cd78e5d558c3fddc44239f6f46efc` | 移動。必要な相対link/locator追随 |
| `helix-web/docs/helix-web-os/L2-requirements/service-governance-requirements.md` | `docs/helix-web-os/L2-requirements/service-governance-requirements.md` | `07d91c27b469db6b7467aef40b38c96e19f6e7eecd5f9be77fd22b0b28e1fd35` | `fc20446eb90bf3d89de941686a6d9c82889bf5bb753af7c0aa52946053a8cac5` | 移動。必要な相対link/locator追随 |
| `helix-web/docs/helix-web-os/README.md` | `docs/helix-web-os/README.md` | `7ababc4d27d66bd5939b50eba0ec3996c4d8d2c64e74ecd5fb76936f4496504e` | `dadd9839221f3422a37bd6d454bdad0f2c51d3148e726f35e10cc41037d97fd1` | 移動。必要な相対link/locator追随 |
| `helix-web/docs/helix-web-os/candidates/service-governance-requirements.md` | `docs/helix-web-os/candidates/service-governance-requirements.md` | `4039017ca6c5eba56f86a5277b433b4c33f2535239909cfa242983df2c190606` | `d7ceaf02fc0a62ec1c787e87adafc622a3a3e5824edf525b5fef9d21b0a91626` | 移動。必要な相対link/locator追随 |
| `helix-web/docs/helix-web/L1-planning/product-intent.md` | `docs/helix-web/L1-planning/product-intent.md` | `29fe8cbd1a61896852bab6aa636f2bc1d2386b57e69fab1249678fd64a9d3ee6` | `36ff3df63b2b5a6ddf09a56a892bdbec4b13c7edcddb68c6969fea6b6f1cf547` | 移動。必要な相対link/locator追随 |
| `helix-web/docs/helix-web/L11-acceptance/product-acceptance.md` | `docs/helix-web/L11-acceptance/product-acceptance.md` | `e81eb746caa2bf8ebd77dbcc81a13dd50f32adbbc98d8d853df30e98f0a5a399` | `6351d2a58481b37187d0d001774a5642a30da12360a1644deb96c9b6b1ac0c4a` | 移動。必要な相対link/locator追随 |
| `helix-web/docs/helix-web/L2-requirements/product-requirements.md` | `docs/helix-web/L2-requirements/product-requirements.md` | `f5f69a92eb3c9e23f1c1d13995aa9ad708d1e55b26764a38582760335838fc1a` | `8ae5baedb071995190e8553d23dad3cb55a4bde1cb0110f0b0c464859762c27c` | 移動。必要な相対link/locator追随 |
| `helix-web/docs/helix-web/README.md` | `docs/helix-web/README.md` | `4b8b8b6a266dec6c3702948a1abe37b2219e171a12cd2b448033773e70fd76fb` | `a2a561dde1a921180b339a691ad40b5f6818c1aa8c19a5a48304e03acb11dce4` | 移動。必要な相対link/locator追随 |
| `helix-web/docs/helix-web/candidates/product-requirements.md` | `docs/helix-web/candidates/product-requirements.md` | `a3365c6b0f2dc8ab6f8134c0c732b7287cad76fcd7b650cd30df5285c9c912c3` | `25304f1a15c66aa3df0d9f01d07af5264694a50fd32ac89d09b07bb1d509abb8` | 9/26旧配置を時点説明として保持し10/03配置を追記。下記のline-digest記録参照 |
| `helix-web/docs/helix-web/sources/helix-web-product-group-requirements-po-original-2026-09-26.md` | `docs/helix-web/sources/helix-web-product-group-requirements-po-original-2026-09-26.md` | `0762eecef2225f4a175bf8fa1cb668116a5526d87aac8071c15be92c545f7db1` | `56d05540b3ef00632f52d40477b1e8bb1415423124ae32cc5ac121bed54f5e3c` | 原文body不変。delimiter上のintro相対link targetのみ更新 |

### 配置説明paragraphの時点更新

31移動文書のうち30件は、Markdown link targetと`helix-web/docs/`から`docs/`へのpath正規化後に非link本文が一致した。`docs/helix-web/candidates/product-requirements.md`の23行目だけは、9/26時点の配置説明を現在の配置と混同させないよう旧配置を「当時」と明示し、10/03の選択を追記した。この文書は要求010以降の候補を保持し、L2要求ID・意味・分類状態は変更していない。旧line SHA-256は`53b8d9bbeeb7ab0b8c5eae9c8101be00fe129a57d44543f3498c2a551119f947`、更新後line SHA-256は`20939eacbdaf0268b26799053e707fde1c9f124622685df91b6a4f1089161f2c`。変更根拠はこの記録にある10/03 PO選択で、本文から新しい要求やauthorityを生成しない。PO snapshotのdelimiter下原文は全byte不変である。

## 参照と履歴の扱い

固定commitを読む監査・決定記録・receipt・source snapshotの本文やsource revisionは履歴証拠として保持する。過去のpath/SHAやread-after記述を書き換えず、current readerとmutable locatorのみを現行pathへ追随させた。PO原文snapshot `docs/helix-web/sources/helix-web-product-group-requirements-po-original-2026-09-26.md`は移動元full-file SHA-256 `0762eecef2225f4a175bf8fa1cb668116a5526d87aac8071c15be92c545f7db1`からcurrent SHA-256 `56d05540b3ef00632f52d40477b1e8bb1415423124ae32cc5ac121bed54f5e3c`へ変わった。`original_body_sha256`=`a61feb6941412c5a7e6677b814a9d4568a79cf92c0da0951b74db3a6e43cddbf`で示されるdelimiter下原文は不変であり、introの相対link targetだけを調整した。

Bindingの`upstream[].path`はcurrent参照として移動先へ更新し、対応するSHA-256をその参照先のexact current bytesへ合わせた。`note`やsource-revision、承認記録などのhistoryは変更していない。Current L2 classificationの15件は`source_path`のみ、phase-capability inventoryの9件は`current.refs`のみを更新し、status・分類・line digest・approval revision・snapshotを保持する。L2/L11の要求内容、ID、owner、version、approval parent revisionは変更しない。

## 検証対象と結果記録

この判断に伴う移動は31ファイル、`helix-web/README.md`固有説明の`docs/README.md`への統合、および現行参照/pinの更新からなる。current reader/link、mutable frontmatter、Binding upstream path/SHA、current classification/phase locators、研究用current pinを照合する。旧pathを持つ固定履歴はcurrent pointerではないことを区別する。

同一baseでの137個の静的validator実行結果は、変更前後を比較して実測値をここに記録する。追加failure diagnosticは0件を目標として変更前後の個別診断を比較する。新配置に関わるリンク切れとcurrent `helix-web/docs/`参照を検査し、L2意味・分類・authority・versionのfield不変を確認する。

最新base `148c03326f83d027dbeff27ef79f95ab3aeb4692`取り込み後は、同baseのregister/binding更新を保持したうえで同じ検査を再実施し、その統合後の結果を追記する。
