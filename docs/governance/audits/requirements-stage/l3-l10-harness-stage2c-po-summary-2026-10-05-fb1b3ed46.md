# HARNESS Stage 2c L3/L10確認資料

本文revision `fb1b3ed4602c2bdd7a62749ba4ac3cfe492cbb7a`。採択済み1.0親HARNESS-L2-030/031/032の3件を、生成fixture、失敗からの修正test候補、選択consumerへのrun-input packetとして具体化しました。

FR 3件・AC 14件・機能CASE 14件、NFR候補3件・測定CASE3件、独立BR 0件です。固定L11の正常例ではdraftのsubmitとapproved更新拒否を照合し、境界・権限・cancel・順序・double等は入力契約で定義される範囲だけに束縛します。禁止data classは合成印で検証し、実secret/PIIを使いません。

失敗候補は同じstatusでもresponse/body症状が異なる反例を区別し、実際に依存するdesign revisionの変更時だけ候補を再検証します。選択operationに必要なsource binding不足は未解決として返し、不要未選択sourceやconsumerは未観測として当該runの条件へ加えません。

NFRは必須fieldの不足を分母から落とさず、観測状態と意味状態を別軸で照合します。旧test設計のAT-FR-02/03は実locator57–63へ固定し、旧監査の誤locatorを現行根拠として継承しません。旧L3・旧要件の再導出/置換と理由は本文と監査へ記録しました。

作成側静的検収は32 Git source pin（有界30/全文2）、C13外部comment span1、現行行pin295、6本文SHA/prefix一致、AC/CASE重複・孤立0。scf147 fail0/stale0/residuals0、govcheck7622/57/58、diff check合格です。

**独立Claude review・対象revisionのPO L3承認・L10実行・性能実測・C13所見の解消は未成立です。** Stage 1/2a prefixは未承認contextで、今回の判断へ継承しません。

| 正本 | SHA-256 |
|---|---|
| `docs/helix-harness/L3-requirements/functional-requirements.md` | `79069a6a2edfc2bb69a1b7aaed0eb9d465eb7ebd18e799358fbd7429853760ac` |
| `docs/helix-harness/L3-requirements/business-requirements.md` | `356788a8538f25e6275873df9b47c385db71aa5267b9f359abca5c25b7c10d81` |
| `docs/helix-harness/L3-requirements/nfr-grade.md` | `b931516aa4ec0e5d1b5decc768ef985729ef912ca0eb7061fa3bcca83643b12c` |
| `docs/helix-harness/L10-verification/functional-verification.md` | `f4cbec6657f261827f07e00e8dda692edbf74ca843899076b1bbdbf603af1c7b` |
| `docs/helix-harness/L10-verification/business-verification.md` | `6d7da79ffc566c65a4cc9070a0b82dbe79826f3b210e004c9f9a735dff58b3a3` |
| `docs/helix-harness/L10-verification/nfr-verification.md` | `53002f7284dba5d29bf8668b7c42bcd1cacb7c9ce4302b84b5de6125db8cb7e6` |

静的監査: [l3-l10-harness-stage2c-root-static-validation-2026-10-05-fb1b3ed46.json](l3-l10-harness-stage2c-root-static-validation-2026-10-05-fb1b3ed46.json)。
