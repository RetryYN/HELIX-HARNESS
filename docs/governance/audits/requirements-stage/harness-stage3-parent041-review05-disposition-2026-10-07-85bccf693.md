# HARNESS-041 review05 postbody時点監査候補

> 修正本文の時点監査。対象PR #2637、body `85bccf693ea974f8e452001f085ef98a5659a18d`、parent `b21fb7665539b13748dfc1e82bada0bc3fc8b15e`。

## review05 M1とbody反映

正式comment 6023290224の全文・R1–R27 raw、詳細なR1–R25を含むreview04全文をJSONに保存した。AC-02、empty/TBD、ledger契約非互換CASEの各oracleへ未完状態とscope完了claim拒否を明示する4行の候補がbodyへ正確に反映された。根拠別return routeは保たれている。

CASE定義62件のID・順序集合はbefore/afterで同一。body commitの変更はfunctional-requirementsとfunctional-verificationの2文書だけで、追跡中の041 audit 8ファイルはbeforeと同一hash。

## 固定親pinの訂正

前候補で親L11 spanとして記録した699–709 / `259c3832…` は、review05の誤り例を支えるsubspanに限られる。PO採択 `-003` のexact L11 parentは699–714全体で、span SHA-256は `11759276200a6707762e76eeeefd901443e691bd1b0ff51b55cd3b6551fed58b`。監査JSONでは両者を別roleとして実blobから再計算して記録した。

- 固定L2: `5aa10031` `docs/helix-harness/L2-requirements/product-requirements.md:957-968`; full `45955ffba1293b603f3c513ec1e9e328dd7bcf24b038463eb20dd480d1dc2108`, span `d68926cf1d569478e86228065e9f4f2177f33be19166f48fbb31a167eb266260`.
- 固定L11 parent: `5aa10031` `docs/helix-harness/L11-acceptance/product-acceptance.md:699-714`; full `216a8dccfff723408fd4b54701933a8e257f29e5c775aaef2a4458d1f36d3cc7`, span `11759276200a6707762e76eeeefd901443e691bd1b0ff51b55cd3b6551fed58b`.
- M1 supporting L11 subspan only: lines `699-709`, SHA `259c383203d86b79c159395b64c0d03d88db665486d28f5fc2aea8f7556a73a8`.
- PO採択記録 `3c3c512c09320c0494904602b23e544a81206eed` line 27 adopts `MPR-RC-HARNESS-L2-041-003`; row SHA `3a8ce36e3ff309ba7a635a5f9b9469fd6cdbfe1da8e26d7a64ca4ab3fcf28a17`.

## 6文書のactual pin

| 文書 | before bytes / SHA-256 | after bytes / SHA-256 |
|---|---|---|
| `docs/helix-harness/L3-requirements/business-requirements.md` | 13526 / `bd781ad052b14fdeadff8c4e3294ef6cf50ff921b7c202a148ed9c0780af1a24` | 13526 / `bd781ad052b14fdeadff8c4e3294ef6cf50ff921b7c202a148ed9c0780af1a24` |
| `docs/helix-harness/L3-requirements/functional-requirements.md` | 215099 / `14fdde32ebef67b7e4d85a797b2742fe21e34810fedf227da8d67c378861d377` | 215338 / `672921d27b1253c719e0787390bb1f343fa01d2c8df42d6e74834e407a273b0f` |
| `docs/helix-harness/L3-requirements/nfr-grade.md` | 43828 / `4066acf1940761ef57fd781b878d933324f5d248465c44bb44f3e8abda235f7e` | 43828 / `4066acf1940761ef57fd781b878d933324f5d248465c44bb44f3e8abda235f7e` |
| `docs/helix-harness/L10-verification/business-verification.md` | 9106 / `b756326334c652eec048e3ca34abc6a2a4df4638fa8eaa384c07a11801cfaa3e` | 9106 / `b756326334c652eec048e3ca34abc6a2a4df4638fa8eaa384c07a11801cfaa3e` |
| `docs/helix-harness/L10-verification/functional-verification.md` | 671404 / `6383180b5c8a26fb8b7564be7ab47f67961c42191e4753755b38f42000938b9b` | 671638 / `9758d6f246dba08e93fd0245ebf41ace39ce8bfafe10d28ccbc34fbe86ca7218` |
| `docs/helix-harness/L10-verification/nfr-verification.md` | 37382 / `89d26dcd990b8bd6b8305a2a8c8a8017df1f8179c95edf0c838ab2d27a98c4d3` | 37382 / `89d26dcd990b8bd6b8305a2a8c8a8017df1f8179c95edf0c838ab2d27a98c4d3` |

Root報告のgovcheck/current diffcheck PASSは再実行していない。postbody independent review、Fable判断、fixture実行、意味完全性、merge admissionを主張しない。

## 証跡

- JSON: `/tmp/harness041-review05-postbody-audit-worker.json`
- JSON SHA-256: `a2d331736e6c33e6ca46a49ade8d2bdb599a54c47e86de00dc7202893faf8037`
