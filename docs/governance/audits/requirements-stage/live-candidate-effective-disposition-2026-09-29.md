# MPR live candidateの実効処置inventory（2026-09-29）

## 対象と結論

基準は `origin/main` の `d0a58b1fa10456e5cf36d6d62a33a6117da9e1ae`。MPR全637行を読み、`requirement_identity`ごとの最後の候補登録339件を、2026-09-28の本体8機構PO判断記録、2026-09-29の57候補判断記録、同日の11候補判断記録へ照合した。採否は対象identityだけでなく最新registration IDを完全一致させて数えた。

| 実効処置 | 件数 |
|---|---:|
| 無条件採択 | 297 |
| 条件付き採択 | 13 |
| 採択合計 | 310 |
| 保留 | 4 |
| 不採択 | 0 |
| 未分類（live exact revisionへの判断なし） | 25 |
| 合計 | 339 |

「未分類」は採択・保留・不採択の判断を意味しない。MPRの`registered_proposal`や`authority_effect: none`から採否を補わない。HARNESS-L2-049は11候補判断（`po-decision-2026-09-29-11candidates.md`）が`MPR-RC-HARNESS-L2-049-002`を対象に現revisionを採択しないと明記する一方、live `-003`はそのexact registrationではないため未分類に置く。不採択件数は0。

## 未分類25件（PO review用一覧）

以下はPO判断を作成した表ではなく、live revisionを固定した判断記録が見つからなかったidentityの一覧である。各行はidentity、最新MPR registration、候補節digestを示し、このinventory自体は採否を付与しない。

| Identity | 最新MPR registration | Candidate section digest | Candidate source |
|---|---|---|---|
| `HARNESS-L2-049` | `MPR-RC-HARNESS-L2-049-003` | `sha256:a5df1f7bdca708046ec9ad68e1eea0974884da63205b8995ad45dcd8f0bbc116` | `docs/helix-harness/L2-requirements/product-requirements.md#harness-l2-049` |
| `HARNESS-L2-055` | `MPR-RC-HARNESS-L2-055-001` | `sha256:9f1e63176242d81d93a89a0c3823d3fbe689b8ebd0ae0de2f5a786b88e8787b5` | `docs/helix-harness/L2-requirements/product-requirements.md#harness-l2-055` |
| `HARNESS-L2-056` | `MPR-RC-HARNESS-L2-056-001` | `sha256:993283110e6faba06d7811df397179743b22a3f666e8a2e002da91c794eeade0` | `docs/helix-harness/L2-requirements/product-requirements.md#harness-l2-056` |
| `HARNESS-L2-057` | `MPR-RC-HARNESS-L2-057-001` | `sha256:2c487f5408d31f0f982ab210be3df4d1d824bd75169b96bd1321cb0edd2a23ac` | `docs/helix-harness/L2-requirements/product-requirements.md#harness-l2-057` |
| `HARNESS-L2-058` | `MPR-RC-HARNESS-L2-058-002` | `sha256:c50e2183bb1186bb585fbb80b924d628be74aaaf363515f047c74ef906d71bc3` | `docs/helix-harness/L2-requirements/product-requirements.md#harness-l2-058` |
| `HARNESS-L2-059` | `MPR-RC-HARNESS-L2-059-001` | `sha256:9ebafbcc5b738dbaccaa53bfaff0b5843b0dd5fba30cc68beb51fe1dbe2e267f` | `docs/helix-harness/L2-requirements/product-requirements.md#harness-l2-059` |
| `HARNESS-L2-060` | `MPR-RC-HARNESS-L2-060-001` | `sha256:d4f0419f2095828ac041a28ca906f45d4dd79b5bfa83000097111f5d13235c30` | `docs/helix-harness/L2-requirements/product-requirements.md#harness-l2-060` |
| `HARNESS-L2-061` | `MPR-RC-HARNESS-L2-061-001` | `sha256:c44ffb80fec07ed6c0fe68e95bbd68358d87632b28d77caad96d28f231badb1a` | `docs/helix-harness/L2-requirements/product-requirements.md#harness-l2-061` |
| `HARNESS-L2-062` | `MPR-RC-HARNESS-L2-062-001` | `sha256:e795e90ec1de20b94d81bf31fb083e8c4001363f88f1528d9833a67a01865f44` | `docs/helix-harness/L2-requirements/product-requirements.md#harness-l2-062` |
| `HELIXLABO-L2-070` | `MPR-RC-HELIXLABO-L2-070-001` | `sha256:07d9114fe55ed6bea2522756652cadec23f89397c619429360062256dc94e533` | `docs/helix-labo/L2-requirements/labo-requirements.md#helixlabo-l2-070` |
| `HELIXLABO-L2-071` | `MPR-RC-HELIXLABO-L2-071-001` | `sha256:3036e4c300ee6f78e74b819657d456c0bad08b8ccb483882cfc3b59fa5bbbe1f` | `docs/helix-labo/L2-requirements/labo-requirements.md#helixlabo-l2-071` |
| `HELIXOS-L2-034` | `MPR-RC-HELIXOS-L2-034-003` | `sha256:6b019294047fce2e1c8b5d1b5e8d379fa9111f5912274f6dca918ffd81c0e1e8` | `docs/helix-os/L2-requirements/governance-requirements.md#helixos-l2-034` |
| `HELIXOS-L2-054` | `MPR-RC-HELIXOS-L2-054-001` | `sha256:a9c1561ab310399fa27d5aca8bd9ebca8264176516357470157526df8c297eef` | `docs/helix-os/L2-requirements/governance-requirements.md#helixos-l2-054` |
| `HELIXOS-L2-055` | `MPR-RC-HELIXOS-L2-055-001` | `sha256:6d23a405ce2c0c6d56a65a4b02d9c39ead8533db3064058dcd7027b641fb9052` | `docs/helix-os/L2-requirements/governance-requirements.md#HELIXOS-L2-055` |
| `HELIXOS-L2-101` | `MPR-RC-HELIXOS-L2-101-002` | `sha256:03ee1bbc860f879b9362eccc024f1cfa056b8cc3e364c16b4683ed18fe9598b5` | `docs/helix-os/L2-requirements/governance-requirements.md#helixos-l2-101` |
| `HELIXOS-L2-102` | `MPR-RC-HELIXOS-L2-102-001` | `sha256:5d020c09b0e5686e01876e3c52d2ce10e8aded44a799a9f6374542d31de31218` | `docs/helix-os/L2-requirements/governance-requirements.md#helixos-l2-102` |
| `HELIXOS-L2-103` | `MPR-RC-HELIXOS-L2-103-001` | `sha256:6115a7190bad6a5ff449574a3150116dcdcd31e69f70e6a5b1625a59e171c7dc` | `docs/helix-os/L2-requirements/governance-requirements.md#helixos-l2-103` |
| `HELIXOS-L2-104` | `MPR-RC-HELIXOS-L2-104-001` | `sha256:a6346a95c796b0d1c2e72e5f24e150767ced6329b9f6137a9547370e82ad502d` | `docs/helix-os/L2-requirements/governance-requirements.md#helixos-l2-104` |
| `HELIXOS-L2-105` | `MPR-RC-HELIXOS-L2-105-001` | `sha256:81e6de13e8876410f69cf586f8aba014765864664d11ec68305d0fede366ad4c` | `docs/helix-os/L2-requirements/governance-requirements.md#helixos-l2-105` |
| `HELIXOS-L2-106` | `MPR-RC-HELIXOS-L2-106-001` | `sha256:b1f3d62a007f954a788602fbff45fa70d3b8bb4b2fec547113a0db30d9598fcc` | `docs/helix-os/L2-requirements/governance-requirements.md#helixos-l2-106` |
| `HELIXOS-L2-107` | `MPR-RC-HELIXOS-L2-107-001` | `sha256:a84e0711dc74d36aa31d283b254ebbc29b34e45b51e17805c24253b8cac17caf` | `docs/helix-os/L2-requirements/governance-requirements.md#helixos-l2-107` |
| `HELIXOS-L2-108` | `MPR-RC-HELIXOS-L2-108-001` | `sha256:c02375c00cf35908f37dd50c82d017a42c987282535852e34b28797671670a0d` | `docs/helix-os/L2-requirements/governance-requirements.md#helixos-l2-108` |
| `HELIXOS-L2-109` | `MPR-RC-HELIXOS-L2-109-001` | `sha256:29d7ec73b53e94e73e02f0303402ab40bf216dca36f9432280cc52b26fa96d80` | `docs/helix-os/L2-requirements/governance-requirements.md#helixos-l2-109` |
| `HELIXOS-L2-110` | `MPR-RC-HELIXOS-L2-110-001` | `sha256:fe250f3cb0be2fdd417904f59041c4c39535f2060394f569b2c9bea8d86e43be` | `docs/helix-os/L2-requirements/governance-requirements.md#helixos-l2-110` |
| `HELIXOS-L2-111` | `MPR-RC-HELIXOS-L2-111-001` | `sha256:265d5e7d1a8c06919b21691ddbf15354e51dbc204f310f07a448a7b33dc8173b` | `docs/helix-os/L2-requirements/governance-requirements.md#helixos-l2-111` |

## 算定方法と境界

- MPR registerの行順で各`requirement_identity`の最後のregistrationを選んだ。source_holding 67行は候補identityではないため339 live candidate identityの分母に含めない。
- 2026-09-28の各PO記録に結び付く固定確認packet commitから当時のMPR最新registrationを読み、250 identityすべてで現在のlatest registration IDと`candidate_semantic_digest`が一致することを確認した。packet commitごとの件数とSHAはJSONの`eight_mechanism_packet_exact_checks`に記録した。
- 8機構の2026-09-28判断記録の明示候補集合は計250 identity。2026-09-29の57候補判断は42無条件採択・11条件付き採択・4保留。後続11候補判断は8無条件採択・2条件付き採択で、HARNESS-041 `-003`とHELIXOS-038 `-002`について57候補判断より新しいlive revisionを明示する。
- 同じidentityに複数の判断記録がある場合、live registration IDに完全一致する記録だけを有効化する。11候補判断（`po-decision-2026-09-29-11candidates.md`）によりHARNESS-041 `-003`とHELIXOS-038 `-002`を扱い、それぞれ古い57候補判断のregistrationから判断を継承しない。
- 57候補判断とのregistration mismatchはHARNESS-041、HELIXOS-038、HELIXOS-034で確認した。前二者は11候補判断（`po-decision-2026-09-29-11candidates.md`）が最新registrationを明示して判断する。HELIXOS-L2-034は57候補判断（`po-decision-2026-09-29-57candidates.md`）が`-002`を採択したが、live `-003`はL2 digestが`b4b8…`から`6b019…`へ変わり、L11 section digestも`6809…`からJSON記録のlive値へ変わっている。MPR `correction_reason`はR2314-02の意味反転を記し、exact `-003`へのPO判断を要求する。後続PO判断は見つからず、live `-003`を未分類に残した。ただし57候補判断で採択された`-002`の意味は、HARNESS-L2-058／HELIXOS-L2-101と一体に行う`-003`のA／B判断まで有効である。HARNESS-049も11候補判断（`po-decision-2026-09-29-11candidates.md`）の非採択対象`-002`とlive `-003`が異なるため、未分類である。
- 暫定集計311採択／24未分類は行単位照合で再現しなかった。exact latest registrationの結果は310採択（297無条件、13条件付き）／4保留／0不採択／25未分類。差の1件はHELIXOS-L2-034 `-003`で、57候補判断（`po-decision-2026-09-29-57candidates.md`）で採択の`-002`とは意味digestが異なり、後続PO判断がない。
- MPRの`registered_proposal`、`authority_effect`、PR/CI等から判断を推定していない。Decision file bytesとMPR bytesのSHA-256は付属JSONの`source_pins`に記録した。
- これは候補revisionのL1/L2 authority censusであり、旧sourceの全coverage、formal successor、L3承認、実装・受入、配布許可、要求Stage完了を示さない。既存source-first監査に記載された旧source境界を越えていない。
- 旧HELIXの対応起点は旧`archive/legacy-generation-2026-09-14/root/CLAUDE.md:72-85`のinventory-first／自律境界。旧archiveは参照資料としてのみ扱い、旧CLI・runtime・test・CIは実行していない。

## 入力本文SHA-256

| Path | SHA-256 |
|---|---|
| `docs/governance/management-provisional-requirement-register.jsonl` | `79c1e5a609ee8d0b59f505ac6a480036b28fe6eb8de1e2642cfd818c9a70fbcd` |
| `docs/governance/decisions/helix-harness-requirements-po-decision-2026-09-28.md` | `c7a6d39ceb853fe6c00ccc336ffa7bbbd6c7e87a0aaba172f43f490dd0a7fd23` |
| `docs/governance/decisions/helix-os-requirements-po-decision-2026-09-28.md` | `5f54e68009fe291853d2d55df241e8220cfdd93eadd1b2a203bb126596b321da` |
| `docs/governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md` | `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a` |
| `docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md` | `b0b4a3fc514494ea2a3e7b435c3788bf1297743a02816245e63efe8115bcb4b0` |
| `docs/governance/decisions/helix-intelligence-requirements-po-decision-2026-09-28.md` | `8362ecb58921593b473ac85d277f0db36a7cbe0952268531913191e4eab260ad` |
| `docs/governance/decisions/helix-security-requirements-po-decision-2026-09-28.md` | `7ad58a3f7d7dd68806e6eeb2c4b6ec97f9b8f2145ae9aae7969f1eedf4a7baff` |
| `docs/governance/decisions/helix-infrastructure-requirements-po-decision-2026-09-28.md` | `0e52c250c6f1501c3ed9ae7d13ee1997632ba46ef168df50775488f268993c7f` |
| `docs/governance/decisions/helix-connect-requirements-po-decision-2026-09-28.md` | `82db2060dbaa77b5b9e6f38fa11219ec811b108b1870e6a86ca112810f9bae69` |
| `docs/governance/decisions/po-decision-2026-09-29-57candidates.md` | `c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad` |
| `docs/governance/decisions/po-decision-2026-09-29-11candidates.md` | `6e10127a65a775b0a7554ccb359abdfc1221d17a2c48fb79321d59369df127c5` |

## 機械可読データ

[live-candidate-effective-disposition-2026-09-29.json](live-candidate-effective-disposition-2026-09-29.json) contains all 339 identities exactly once, the effective disposition, exact latest registration ID and candidate section digest, and the applicable decision-record pin or `null`.
