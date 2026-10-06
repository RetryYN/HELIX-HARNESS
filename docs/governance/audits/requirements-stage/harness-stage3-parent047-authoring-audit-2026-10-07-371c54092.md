# HARNESS-047 postbody 実物検収記録（候補）

- 対象HEAD: `371c540929273bee4090ce41f53d26288c68b3a5`（parent `ceda1c53b53c53fffb8c23f394add1f2b809deb1`）
- worktree: `/home/tenni/.helix-worktrees/l3-harness-stage3-parent047`（clean=True）
- Root統合checkpoint: `/tmp/root-harness047-integration-checkpoint.json` / SHA-256 `73aee82b08becfd2c3491e7ec7278105d39fe5cf7031479c3cb5b779ec29b48a`
- 監査JSON: `/tmp/harness047-postbody-audit-371c5409.json` / SHA-256 `e97c2ca9e90befdd31eea0c95a9b6902ecfadefe25c38a1d1c7eefd51515a07e`
- 正本の編集・commit・push・PR操作、旧runtime/CLI/test/CIの実行は行っていない。
- 独立review、L3承認、fixture実行、意味完全性は主張しない。

## 結果

body commitはcedaを直接parentとし、差分pathは対象のL3/L10六文書だけ。各文書のceda bytesは実bodyのprefixに完全一致し、checkpoint suffix rawの前に区切りLFが一つあることをbyte単位で確認した。実末尾は単一LFで、余分な空行はない。6全文before/afterと実suffixをJSONへ保持した。

固定L2/L11は318 parentのphysical span SHAが一致。cedaのPO判断row 52はL2-047 A配置の条件付き採択で一意、line SHAも一致した。旧HIL-BR-09/30・HIL-FR-59/60の4行、旧L3とnamed consumer 7 span、および旧L10 FVの132 raw CASE lineを固定revision上で再照合し、全hashが一致した。preflightとformal review19のfile SHAも一致する。

L3 FRにはAC-01〜04の定義が一つずつあり、FVからの参照と一致。L10 FVは136 unique CASE行で各行6列。旧raw 132 IDsを保持し、新規4 IDsを追加。索引は対応する子fixtureを指し、独立fixtureとしての重複計数を拒否する。別NFR verification CASEは1行。

verification、independent review、adoption、completionは別々の出力拒否CASEに分かれている。Worker/verifier identity・context・authorityの単独軸CASEを保持し、同じprovider/modelだけでは独立性不成立にしない。r09-035はassignment隔離CASEとして明示され、中断/budget/期限CASEから区別される。known responsibility classへ個体identityが分からない場合も返し、個体unknownは別欄へ保持する旨をFRに明記。

## 6文書のphysical before/after hashes

| 文書 | ceda前body | HEAD後body | actual suffix | prefix一致 |
|---|---|---|---|---|
| `docs/helix-harness/L3-requirements/functional-requirements.md` | 204919 / `4fce6bb6cd3af5938a11719866050bd729234adbebf70c4210398aa90cad5dff` | 212090 / `432b332092d01f0af9cae0ec93e54146a9dcba1033d51dfb83070e936bfcef29` | 7171 / `4cf2c6c1bf978c36bbb460f33e0d0db3fb20599f6a061ce45ce07ad46d29a2c7` | yes |
| `docs/helix-harness/L3-requirements/business-requirements.md` | 13240 / `c51f0bc2b98ae5c6a77bfa354050ec70ee87a70641b5f0161b14d5a3afd33e8f` | 13559 / `4f90f571b8afc624c354c1f071313e77e4937fe41ac90b1b470142f37a593533` | 319 / `f1a55518ba71ae5328c35875ee0d4e0320f9a8fc63a31900cf3ac0ecebb0ca62` | yes |
| `docs/helix-harness/L3-requirements/nfr-grade.md` | 42916 / `b364e8c6dc92f4548df34638488fefec1533d13941a991de685a74bb64471fc9` | 43330 / `e8e07353768a580a497feefb61841f8f37f795cb88d09bd95ee0d526144011a3` | 414 / `a4c58bc492c56b186124aa14caf7297f9467794987cbcab144701591c7fc8c81` | yes |
| `docs/helix-harness/L10-verification/functional-verification.md` | 636566 / `bc63c3abbabd727dbb2cfa37a5c3741985181308ad93378ebf2e5846907770f0` | 700825 / `0ea11111ceb23ff9239ac8fd9242c835c65db8d8744113636b6ed8923695ac68` | 64259 / `8ce0a053921ffcd684166ec3ebb6a2e18a5b776b1487ae244b7123dccd238957` | yes |
| `docs/helix-harness/L10-verification/business-verification.md` | 8819 / `2faacacf78b835b5127e990b805adb97b079439c887a1ef2bd6d69f2478d53c9` | 9057 / `c8d62ec219fae6657d8509faa50509fd37c6334bdcfd5699401c0afec1703742` | 238 / `96a20ab0a5c90806912b46c579c56d42b314622b3b5365ee33f79fb3a61754e6` | yes |
| `docs/helix-harness/L10-verification/nfr-verification.md` | 36464 / `bb319529b2c2e2af75067c36bf204d386816fb7e78d48f18043973be6290ccd1` | 36945 / `18743da4dd6685306f5bfe70ce75e531d2c2f2cf07dabf797f1e506b3e4a47ee` | 481 / `53bdc7495d60ad5819f7c427db44bf78439feecb0f302aaeb7b862850c6e32bb` | yes |

## 未確認

- 実行、oracle期待値の挙動、出力の実効性、要求意味の全量妥当性、独立review、L3承認は未確認。
- 旧132 raw IDや136 CASE行の件数は完全性の証明として扱わない。
- 詳細なraw line hashes、full actual document bytes、source pins、review履歴・処置は上記JSONと固定source filesを参照。
