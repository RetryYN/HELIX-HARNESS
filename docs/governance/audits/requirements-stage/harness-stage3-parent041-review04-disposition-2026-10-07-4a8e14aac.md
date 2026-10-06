# HARNESS-041 review04 post-body監査候補

- PR #2637、修正前HEAD `776189054d85307086cf576651ca55b78c9b33ca` → 修正後HEAD `4a8e14aac1d51f439543dcc3038167e77df650b1`
- base `3c3c512c09320c0494904602b23e544a81206eed`
- 状態: `/tmp`監査準備候補。canonical監査/本文はこのworkerによる変更なし。独立review・承認・Ready・mergeを主張しない。

## review04の処置範囲

正式comment `6023038403`を全文取得・照合した。M1はL10 `functional-verification.md` の「Stage 3 親041」宣言だけが採択親を`-002`と誤記していた点。Rootの修正は同じ一行で`-002`を`-003`に置換し、HEAD差分はそのファイルの1行だけ。

review04 raw body SHA-256: `ce6d2912c7511f224fe27627693090dc0f686f3a4608fa32a62b1e720be0bc54`。JSONにはreview01/02、review02訂正、review03、review04のfull raw bodyを保存し、R1–20とR21–25を原文で追跡可能にした。review04はR1–20を時点記録から外さず、-003を固定親として読み替え、R21–R25を残余として挙げている。本候補では残余の再判定やclosureを行わない。

## fixed PO -003

PO判断 `6b5de065c8bdf38b2ccf06d82bf2581824742e67` の `po-decision-2026-09-29-11candidates.md:27` は`MPR-RC-HARNESS-L2-041-003`を採択。decision file SHA-256 `6e10127a65a775b0a7554ccb359abdfc1221d17a2c48fb79321d59369df127c5`、line raw SHA-256 `3a8ce36e3ff309ba7a635a5f9b9469fd6cdbfe1da8e26d7a64ca4ab3fcf28a17`。固定L2は `5aa100319361b0cc86edd3c51815ec777d55410a` `product-requirements.md:957–968`、file SHA `45955ffba1293b603f3c513ec1e9e328dd7bcf24b038463eb20dd480d1dc2108`、span SHA `d68926cf1d569478e86228065e9f4f2177f33be19166f48fbb31a167eb266260`。固定L11は同revision `product-acceptance.md:699–714`、file SHA `216a8dccfff723408fd4b54701933a8e257f29e5c775aaef2a4458d1f36d3cc7`、span SHA `11759276200a6707762e76eeeefd901443e691bd1b0ff51b55cd3b6551fed58b`。L2 semantic digestは002時点と同一、L11には追加oracle 2件を含む。review04本文の可視行範囲（957–971 / 699–715）はraw formalにそのまま保持し、source pinはdecision row記載digestに対応する登録範囲を使った。

## 6本文post-body pins

| 文書 | base prefix SHA-256 | 修正後suffix SHA-256 | 修正後全文SHA-256 | review04変更 |
|---|---|---|---|---|
| `docs/helix-harness/L3-requirements/business-requirements.md` | `c51f0bc2b98ae5c6a77bfa354050ec70ee87a70641b5f0161b14d5a3afd33e8f` | `93f07196fc0ebe3a52892813247e28c9ac528d5854b57c5252212e2f5824dfcf` | `bd781ad052b14fdeadff8c4e3294ef6cf50ff921b7c202a148ed9c0780af1a24` | 不変 |
| `docs/helix-harness/L3-requirements/functional-requirements.md` | `4fce6bb6cd3af5938a11719866050bd729234adbebf70c4210398aa90cad5dff` | `e767c7f3c940cf5996e2ad7042a4ede5c40a7136086b3c671e75933366fd7b9c` | `14fdde32ebef67b7e4d85a797b2742fe21e34810fedf227da8d67c378861d377` | 不変 |
| `docs/helix-harness/L3-requirements/nfr-grade.md` | `b364e8c6dc92f4548df34638488fefec1533d13941a991de685a74bb64471fc9` | `1005f9081397006f61dc288a02ee13d4e6c74e07bbc6be411b1b5c6768ebb768` | `4066acf1940761ef57fd781b878d933324f5d248465c44bb44f3e8abda235f7e` | 不変 |
| `docs/helix-harness/L10-verification/business-verification.md` | `2faacacf78b835b5127e990b805adb97b079439c887a1ef2bd6d69f2478d53c9` | `a973d5d25f261671968a84d0c46fe0ecad3938556a336f97fb24292c704cc355` | `b756326334c652eec048e3ca34abc6a2a4df4638fa8eaa384c07a11801cfaa3e` | 不変 |
| `docs/helix-harness/L10-verification/functional-verification.md` | `bc63c3abbabd727dbb2cfa37a5c3741985181308ad93378ebf2e5846907770f0` | `bf7a06dfce692e839b8a20775617228baffd14b37364589dab7642b139f5415f` | `6383180b5c8a26fb8b7564be7ab47f67961c42191e4753755b38f42000938b9b` | 変化 |
| `docs/helix-harness/L10-verification/nfr-verification.md` | `bb319529b2c2e2af75067c36bf204d386816fb7e78d48f18043973be6290ccd1` | `7ce5bb4fadcae470b83b86046e92663e18c4148356524aea34714e40655cc99f` | `89d26dcd990b8bd6b8305a2a8c8a8017df1f8179c95edf0c838ab2d27a98c4d3` | 不変 |

6文書すべての3c3c prefixとsuffix/full hashを現物から計算した。変更はL10 FVの1行のみで、CASE IDは修正前後とも62行/62 unique、順序・ID一致。追跡audit pathのdiffは空で、前回`/tmp`監査候補2件のSHAもJSONに固定した。

## 検証限界

Root報告のgovcheck/diff PASSは記録し、再実行していない。実行fixture、独立post-body review、Opus/Fable一致、要件承認、Ready、merge admissionは未確認。監査候補以外のファイル変更なし。
