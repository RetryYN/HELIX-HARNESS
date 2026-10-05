# HELIX-BRAIN Stage 2b 次の5親 — L3/L10確認資料

本文revision `02715b55d34536b528c75fe894bf6860b08d665e`。対象はHELIXBRAIN-L2-009/010/011/012/029の5親だけで、PO main `633bf12ea8f948db8ba3d6600179c4a9507377a7`の採択registrationにある1.0候補、G0 main `1880c422311a7f8321dbb0e2b98fa12c69449201`のStage 2b配属である。固定L2/L11はrevision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。この資料はL3承認、実装・実行・release許可を示さない。

旧L3定義と旧L3/paired testを起点に、各親で再利用・再導出・置換の範囲を記録した。調査範囲に専用BRAIN旧L3文書・対testは見つからず、旧HARNESS L3/ATと近接UI Pattern Profileは構造類例に限定した。旧HARNESS business KPI、旧IPA/NFR閾値、UI schema、旧runtime・gate・IDは移していない。詳細は隣接static-validation JSONの37 bounded source spanと親別dispositionにある。

FR 5件、AC 21件、機能CASE 51件、NFR候補と対測定5件、独立business成果0件。L2-010の列挙failure family、L2-011の製品固有要素、L2-012の各返却項目、L2-029の5 relation typeとrequired input/source条件をそれぞれ照合する。L2-029のL11-030 connection/receipt条件は本親へ移していない。

NFRは比較案と母集団・欠測・unknown・oracleの扱いを候補化し、測定実績、固定SLA、最低標本数を設定していない。business KPI/ownerも追加していない。候補は通常のL3承認で扱い、要求意味・scope・owner・版を変える場合だけL2へ戻す。

静的確認では6本文のprefix bytesをHEAD `67c807c53ed4bcd3a132f07bf35b9f07424437de`から保持し、21 AC参照に孤立・未参照なし、51 CASE ID重複なし。18 source pin record / 37 bounded spanを固定Git revisionから再計算した。`scfctl validate`: 147件, fail 0; `scfctl residuals`: 0; `govcheck`: atoms 7622 / requirements 57 / files 58; `git diff --check`: pass。

**独立review、POのこの本文revisionへのL3承認、L10実行・性能実測は未成立。** 前段Stageの完了gate、候補受領からの採用、実装準備・releaseの判断を生成しない。

| 正本 | SHA-256 | 行数 |
|---|---|---:|
| `docs/helix-brain/L3-requirements/functional-requirements.md` | `0b769c6feb6ea2e3dc801883079f2c9285ef4aa077e61fccc696db689b4fd5c9` | 312 |
| `docs/helix-brain/L3-requirements/business-requirements.md` | `20f74a63658999ab1689bb162f223625c416469c07ebcf4355eced776835da0d` | 42 |
| `docs/helix-brain/L3-requirements/nfr-grade.md` | `2bf404b40121ffa5688cfe4e4f61b89f6539ae4e771fc9d6af96dc9ae0c0aaa5` | 71 |
| `docs/helix-brain/L10-verification/functional-verification.md` | `16e5215e3d860c5b0b95304b34f244aa9915e68bc116071c19025a438bb75930` | 297 |
| `docs/helix-brain/L10-verification/business-verification.md` | `30ddbcf3693c0bd7f19ea5dd001fdb9cda91bc8da307af7ad5c6481cf7c47fce` | 40 |
| `docs/helix-brain/L10-verification/nfr-verification.md` | `d74789206aa015e020b8557601c42a9366bb6dd59d38156d3875177e5a791c44` | 57 |

静的監査: [l3-l10-brain-stage2b-next-five-static-validation-2026-10-05-02715b55.json](l3-l10-brain-stage2b-next-five-static-validation-2026-10-05-02715b55.json)。
