# HARNESS Stage 2b 012–016 旧監査記録の収載記録

- 対象cutout本文: `df49281c8576207cf46b5651c05cf91ac13587c5`
- cutout監査: `93accb60e5b3319922ac1f5d16899da3aa2c57e0:docs/governance/audits/requirements-stage/l3-l10-harness-stage2b-public-cutout-2026-10-05-df49281c8.json`（SHA-256 `94eb7f7eb7adb02cfac55973cb0ae12c0e1b9d2eccc1832fb6ddb79b03d9d143`）
- cutout概要: `93accb60e5b3319922ac1f5d16899da3aa2c57e0:docs/governance/audits/requirements-stage/l3-l10-harness-stage2b-public-cutout-2026-10-05-df49281c8-summary.md`（SHA-256 `dee5cb8574b4d3fb5d444d0126442ad787c30b34487315bc2cf8be5620c66858`）
- source tree: `416c5351e33c218368dba86cccc0a3c8e2310a1a`

公開cutout treeには以下のStage 2b時点監査・summaryが存在しなかったため、元の監査commitからraw bytesを同じrepository-relative pathへ複写した。各source commitはlocal Git graph上でsource tree commitの祖先であり、各copyはsource blobとbyte一致する。remoteでの祖先到達性はなく、上記のとおりlocal-onlyである。過去記録本文は変更・正規化していない。

## remote到達性

2026-10-05時点のremote `main` は `72fa2f08ccd7a87733112f918659464d5f5cb6c5`。GitHub REST `GET /repos/RetryYN/HELIX-HARNESS/commits/{sha}` でaccepted source tree、各source/audit commit、各body revision、cutout本文revision、初回cutout監査commitを照合したところ、列挙した11 SHAすべてが `HTTP 422 No commit found for SHA` だった。したがって、それらのcommit objectはこのrepositoryからremote到達不能で、現時点ではlocal-onlyである。各旧監査・summaryのraw bytesはこの新しい追補と収載artifactを通して読める。照合結果は下のprovenance JSONにもSHAごとに記録した。

これらはdraftの作成側静的確認・receiptの履歴であり、PO承認、独立review、L10実行、実測を生成しない。今回のcutoutが各履歴revisionを再承認するものでもない。

## 012/013 初回草稿

- 元本文revision: `c9329194d37ec98a86ad05ddcaa99b3cb17ddcde`
- 対象scope: `HARNESS-L2-012`, `HARNESS-L2-013`
- 元監査記録commit: `47e816b62a6b1ba8f1862ab2b1de975a33f1ef33`
- [`l3-l10-harness-stage2b-po-summary-2026-10-05-c9329194d.md`](l3-l10-harness-stage2b-po-summary-2026-10-05-c9329194d.md) — blob SHA-256 `d3319a9e8bc73d4238740d28cca29cc403e174306ac6e7fdc89235000469b61b`, 2624 bytes.
- [`l3-l10-harness-stage2b-static-validation-2026-10-05-c9329194d.json`](l3-l10-harness-stage2b-static-validation-2026-10-05-c9329194d.json) — blob SHA-256 `91d48ca671deda83194075a30835636f70f3d73aec558124621e8a3766ab4503`, 2628116 bytes.

| 正本文書 | 元本文SHA-256 |
|---|---|
| `docs/helix-harness/L3-requirements/functional-requirements.md` | `e1a2c1b8e719e5e818b795d6ae7f67808691911bd8e065b41ac7da5576b9aa3f` |
| `docs/helix-harness/L3-requirements/business-requirements.md` | `375ee38f05d0fd6c527096116361d647cb57a80e8ff707637499a3190c62fa86` |
| `docs/helix-harness/L3-requirements/nfr-grade.md` | `99e406711c73b053c20c8dec44491ca6e6168c566af0ea1082ee86d3e3926e49` |
| `docs/helix-harness/L10-verification/functional-verification.md` | `fcaf483550ae6a62c60ed9634e2c30cb0e04583efc54f506a445d948943569f5` |
| `docs/helix-harness/L10-verification/business-verification.md` | `4d32df2b83ff46b85e5765bb69f7dea03f7391b81aac22f8ce6cc45b378d6449` |
| `docs/helix-harness/L10-verification/nfr-verification.md` | `01d85f42e48955561d0002c24a46db717b89b084027370235d2860272a3d4f8a` |

## 012/013 修正候補の静的監査

- 元本文revision: `6c787542372013aa63b9dd8c1ccc6a66f78e0752`
- 対象scope: `HARNESS-L2-012`, `HARNESS-L2-013`
- 元監査記録commit: `bac855383dfc24330b3fec35e8864358f7812315`
- [`l3-l10-harness-stage2b-po-summary-2026-10-05-6c7875423.md`](l3-l10-harness-stage2b-po-summary-2026-10-05-6c7875423.md) — blob SHA-256 `89bd17432af3771b27f33591d2285bc63be672410ce4954f063d26e7c05663fc`, 3111 bytes.
- [`l3-l10-harness-stage2b-static-validation-2026-10-05-6c7875423.json`](l3-l10-harness-stage2b-static-validation-2026-10-05-6c7875423.json) — blob SHA-256 `168ee56d5414472a0b6d99d5ac9646ce9919e1fd8c8a880f1d398856f3c893ed`, 2647536 bytes.

| 正本文書 | 元本文SHA-256 |
|---|---|
| `docs/helix-harness/L3-requirements/functional-requirements.md` | `c436e37935b4238f1d7c7f0cdd080206e202fbbb01b9e0001793c9202cce960b` |
| `docs/helix-harness/L3-requirements/business-requirements.md` | `375ee38f05d0fd6c527096116361d647cb57a80e8ff707637499a3190c62fa86` |
| `docs/helix-harness/L3-requirements/nfr-grade.md` | `01490f676993430c985c9345fe02223aa0023acb74a7d24251a73284d315dab8` |
| `docs/helix-harness/L10-verification/functional-verification.md` | `386355bfc8655cee84351e457cb1c4a61e022a75095f91428f8ef89d8101ca9c` |
| `docs/helix-harness/L10-verification/business-verification.md` | `4d32df2b83ff46b85e5765bb69f7dea03f7391b81aac22f8ce6cc45b378d6449` |
| `docs/helix-harness/L10-verification/nfr-verification.md` | `1c94cbf246a2f9811a3e03a5bd308b8401303eb89a7f2fe251b3f10df091e176` |

## 012/013 root確認後のWorker静的照合receipt

- 元本文revision: `aaaed8d53133be3d2d25cc82f51e62c2f44ac844`
- 対象scope: `HARNESS-L2-012`, `HARNESS-L2-013`
- 元監査記録commit: `a496e20ac375010cd82a19225e55b7a76cc1bb58`
- [`l3-l10-harness-stage2b-worker-validation-2026-10-05-aaaed8d.json`](l3-l10-harness-stage2b-worker-validation-2026-10-05-aaaed8d.json) — blob SHA-256 `c824f341926190d382d5d4857e3eff5d88d3110562736b0fcb098681cc6babac`, 2649797 bytes.
- [`l3-l10-harness-stage2b-worker-validation-summary-2026-10-05-aaaed8d.md`](l3-l10-harness-stage2b-worker-validation-summary-2026-10-05-aaaed8d.md) — blob SHA-256 `7335a39c03b9ca7d7f34a7c9537a9f6a2cb9b60b707d45276cc7cfdbcfada35b`, 1996 bytes.

| 正本文書 | 元本文SHA-256 |
|---|---|
| `docs/helix-harness/L3-requirements/functional-requirements.md` | `62df535b91587219992e3a84ceecfa8d875e98d2af38fa2e30ab82d3f8ba184e` |
| `docs/helix-harness/L3-requirements/business-requirements.md` | `375ee38f05d0fd6c527096116361d647cb57a80e8ff707637499a3190c62fa86` |
| `docs/helix-harness/L3-requirements/nfr-grade.md` | `01490f676993430c985c9345fe02223aa0023acb74a7d24251a73284d315dab8` |
| `docs/helix-harness/L10-verification/functional-verification.md` | `386355bfc8655cee84351e457cb1c4a61e022a75095f91428f8ef89d8101ca9c` |
| `docs/helix-harness/L10-verification/business-verification.md` | `4d32df2b83ff46b85e5765bb69f7dea03f7391b81aac22f8ce6cc45b378d6449` |
| `docs/helix-harness/L10-verification/nfr-verification.md` | `1c94cbf246a2f9811a3e03a5bd308b8401303eb89a7f2fe251b3f10df091e176` |

## 014/015/016 Worker静的照合receipt

- 元本文revision: `30637031b5e029f0b1b5efbc96ba7caeb794e7ca`
- 対象scope: `HARNESS-L2-014`, `HARNESS-L2-015`, `HARNESS-L2-016`
- 元監査記録commit: `0be485397928b3340076f3926d8747d074cfee8b`
- [`l3-l10-harness-stage2b-worker-validation-2026-10-05-30637031b.json`](l3-l10-harness-stage2b-worker-validation-2026-10-05-30637031b.json) — blob SHA-256 `cb813510498e9ce16e258712e520481d5d19f442e3445d13cd6bd6cb398c37f8`, 142285 bytes.
- [`l3-l10-harness-stage2b-worker-validation-summary-2026-10-05-30637031b.md`](l3-l10-harness-stage2b-worker-validation-summary-2026-10-05-30637031b.md) — blob SHA-256 `b6b2e6cf100f5c31e60fefd488a0b7d3f482cceb3431dfadf1d8a0041af7ec59`, 3094 bytes.

| 正本文書 | 元本文SHA-256 |
|---|---|
| `docs/helix-harness/L3-requirements/functional-requirements.md` | `f6afeae6575bd339a304dff3953709a0f6ed0021a4c1e249d9769379574f2251` |
| `docs/helix-harness/L3-requirements/business-requirements.md` | `6bf5ac300b21d04deacff58a64119c56f122c52c9fcdd1ad3120177967e2064f` |
| `docs/helix-harness/L3-requirements/nfr-grade.md` | `f32bc5ea8c2dfae3dea62a00f7056f40a71716f8eaa7570e02c078bbbe36f55e` |
| `docs/helix-harness/L10-verification/functional-verification.md` | `fa45c41519fb7c68882c05905b373ba7d8de00805b7a8827b32e3e448bb9c71e` |
| `docs/helix-harness/L10-verification/business-verification.md` | `98c665c66340a54a308dc3cee93a61c33ec43454f6fb4276e3184c6ab94faa1e` |
| `docs/helix-harness/L10-verification/nfr-verification.md` | `a3c21a79d941dccfd76de07b7cad752419ee1a7e54295586d8c6f009a5351fc0` |

## 現行cutout本文SHA-256

| 文書 | SHA-256 |
|---|---|
| `docs/helix-harness/L3-requirements/functional-requirements.md` | `b17ff76db4a0fe4c2672e815ca9c567b0021b8b5209f9aa3946957819504ac1b` |
| `docs/helix-harness/L3-requirements/business-requirements.md` | `ae00c0dda32ce2b95213a1be008339c569f892f4a0249a96e9b901cdb70a8f6f` |
| `docs/helix-harness/L3-requirements/nfr-grade.md` | `d6f10a26dd11b9bf8b6ceb1d3a4bab7ee2f5865949cb5708598c9283fc69ebd8` |
| `docs/helix-harness/L10-verification/functional-verification.md` | `303fbaa5075b140f0053d57ba162d2b26e6b6b958b336b55811ac59e7b7ad6e7` |
| `docs/helix-harness/L10-verification/business-verification.md` | `eeb40a6b192fdc8c29e9fb2913814b4f32d1c9b960c5f2cfcea1c9b91cc133da` |
| `docs/helix-harness/L10-verification/nfr-verification.md` | `6603ca923d28c22f9b68fdb401f2f1a26850a6966ce03a14776679bbfac8d8df` |

## 検証範囲

- 4組8ファイルについて、元commitのgit blob全体を読み、JSONは全体parse、Markdownは全体UTF-8 decodeを行った。
- 元blob SHA-256、byte数、source commit、body revisionを固定し、copy後に元blobとのbyte equalityとSHA-256を再検算した。
- 過去bodyのcanonical six-document full SHAは対応する旧static audit JSONから転記し、この記録へ保持した。cutout本文six SHAはcutout本文commitから再計算した。
- `git show`による静的読取のみ。旧runtime/test/CI/Bunは起動していない。
- このrecordは意味の再review、独立review、PO判断、merge admissionを代替しない。
