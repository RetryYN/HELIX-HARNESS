# SECURITY Stage 1 parent 009/012 review01 correction addendum (2026-10-08)

## 対象と根拠

本追補はPR #2676 formal comment `6044054667` のM1と、承認条件ではないm1、および既存時点監査のlocator・用語帰属の訂正だけを記録する。formal bodyはUTF-8 5,090 bytes、SHA-256 `ed299e5022feaefb3cd8759b31fa4f780a16502595373c058c5738ec71b40d23`。対象branchは `codex/security-stage1-trigger-matrix`、修正前HEADは `b61cc0aa1541a951c0aefc37e4d52392e495d32b`。既存監査 `security-stage1-parent009-trigger-matrix-012-scope-audit-2026-10-08.md` は時点記録として変更していない。

固定L2/L11の本文revisionは `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2全体SHA-256は `027e6d25c8665e8aca006f23660c4ecfcc0ec0a92946be871e935ec5aa7a774c`、L11全体SHA-256は `25635649f87c0e805a5d1cf35b5c1201144c851533808770cd4f9ac6ba067c01`。

| 固定source | 正確なlocator | raw span SHA-256 |
|---|---|---|
| L2-009 | `security-requirements.md:150–159`（末尾空行を含む） | `1e0f47fdc6cdce52f324d178b6c927b4519ab9412f51f7bfb1def0a33df9abca` |
| L11-009 | `security-acceptance.md:33` | `749fcd644ce86f164a511fcef1381bbfd9aba301fccd6c6ce4d8f01e7fd7324e` |
| L2-012 | `security-requirements.md:180–189`（末尾空行を含む） | `6d2afeee0c6f60a332265c1196c447f47b578e6e72700b8216d03d4e00f49a27` |
| L11-012 | `security-acceptance.md:36` | `1663d911bb3c1800f17b00172f4e1ec8234cdc7605cb6d0dae2760bc3ed3c114` |

L2-009:152の原語は「失効」「不明な外部副作用」であり、L11-009:33は `revoke` と `unknown` を用いる。6項目の対応はL11-009:33が列挙するため、旧監査の「L2-009がrevoke/unknown各triggerを明記」という記載を本追補で訂正する。これは語の帰属の訂正であり、trigger集合や意味の変更ではない。旧監査のL2 locator `150–158` と `180–188` は、対応するraw span SHAが実際に覆う `150–159` と `180–189` へ訂正する。過去の監査本文自体は変更しない。

PO採択記録は本文sourceと別revisionの `49318f1f1de5810dfc61fdfe3a2565b86509009d`、decision rows 47/50である。今回の修正は親、採択、要求意味、owner、scope、versionを変えない。

## 旧sourceとの対応

`LEGACY-ASSET-B62E49D2E156232B8C63` の `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/security-capability-broker-authority.md`（全体SHA-256 `161722d80e7b0199310b1401992c3737bef2014b19b2776c0df4b15f833fe0a7`、CAP-001–007、lines 160–166）と `LEGACY-ASSET-170112AB2FA2FFDBFEE9` の `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/security-capability-broker-acceptance.md`（全体SHA-256 `b6f926f39cd824fc102cf82bd1625d14d298f666c931786fdc6c8117d06af1c4`、冒頭の受入表・各mutation行）を実読した。旧sourceはfail-close、独立negative、値を含まないreceipt等の近接根拠として保持する。現行の6 triggerとrecipient集合の関係は固定L2/L11から導出し、旧契約を現行親へそのまま帰属させない。旧workflow/test/runtime/CLI/CIは実行していない。

## 修正内容

- M1: L10 FV `SECURITY-CASE-012-01` の「固定L11受入oracle」を、固定L11-012:36の原文bytesへ戻した。Agent packageとL2-010のAgent definitionを区別する説明は固定L11引用から外し、既存のfixture/oracle・未見正常例に置いたままにした。L3の導出文は変更しない。
- m1: L10 FV `SECURITY-CASE-009-01` のfixtureに、fixture側が期待recipient集合を持ち、SUTのrecipient列挙と照合することを明記した。各trigger×recipientの「未達」と「未観測」を別々のnegativeにし、いずれかのnegativeを別triggerの成功で満たさないことを明確化した。6 trigger、該当recipient、停止動作、scope、owner、unknown条件は増減していない。
- 既存の親009/012追補は上記の訂正以外を維持し、以前の監査記録を改変していない。

## 6本文のSHA-256

全hashは修正後同一作業HEADのbytesから計算した。前値は修正前HEAD `b61cc0aa1541a951c0aefc37e4d52392e495d32b` から取得した。

| 本文 | 修正前 | 修正後 |
|---|---|---|
| L3-BR `docs/helix-security/L3-requirements/business-requirements.md` | `30a0456a17c4c65e9427cc8931905cb7c1adf54c207514f948a7b179dcdb7019` | `30a0456a17c4c65e9427cc8931905cb7c1adf54c207514f948a7b179dcdb7019` |
| L3-FR `docs/helix-security/L3-requirements/functional-requirements.md` | `817fcfb01339151047f6688276cc66bc341b3e1b8b1396eee9f2cd0f403bda6e` | `817fcfb01339151047f6688276cc66bc341b3e1b8b1396eee9f2cd0f403bda6e` |
| L3-NFR `docs/helix-security/L3-requirements/nfr-grade.md` | `5b4a647220bea4192788ac937f9ee889574abb49639493f5e78edadc2950f66e` | `5b4a647220bea4192788ac937f9ee889574abb49639493f5e78edadc2950f66e` |
| L10-BV `docs/helix-security/L10-verification/business-verification.md` | `7da2a3b88c866c276065c793036708a633109b176b0381829c8d3c8293ff70a4` | `7da2a3b88c866c276065c793036708a633109b176b0381829c8d3c8293ff70a4` |
| L10-FV `docs/helix-security/L10-verification/functional-verification.md` | `39b06b8363abce0f2027e23387c076c76fbc81236c2a79d41abce9431afd13b9` | `21b774e5c59aa0355bcc2de3569c82549e25278a4abd997a6d39570fdceb5079` |
| L10-NFRV `docs/helix-security/L10-verification/nfr-verification.md` | `444560c4ffe00c4a330d6b8a76ad2c86798be1bd4ab506886c96ce0cc4a40e43` | `444560c4ffe00c4a330d6b8a76ad2c86798be1bd4ab506886c96ce0cc4a40e43` |

## 静的確認と限界

静的確認では、CASE-009 trigger列が固定L2/L11の6項目と一致すること、各trigger fixtureの期待recipient集合とSUT列挙照合、各trigger×recipientに独立した未達・未観測negativeがあること、CASE-012の固定L11引用bytesがL11:36と一致すること、Agent packageの区別がfixture/未見正常例に残ることを確認する。`git diff --check`とFR/AC/CASE参照も確認する。

fixtureは実行していない。これは009/012の既存L3/L10 scopeに限定した修正であり、全Stage 1・全文書の意味再監査、全旧consumerの読了、承認、実行、merge admissionを主張しない。独立reviewと後続条件確認はこの監査から生成しない。
