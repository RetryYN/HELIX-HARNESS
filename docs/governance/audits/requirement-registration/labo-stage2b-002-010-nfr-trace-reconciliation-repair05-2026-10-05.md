# LABO Stage2b NFR trace列の照合補足

対象は `NFR-LABO-008-01` と `NFR-LABO-009-01` の2行です。L3 NFR gradeの全case列挙と、L10 NFR verificationの「L3 / L10 trace」セルを列単位で再比較し、L10側のtraceセルを完全一致に直しました。隣のoracleセルは変更していません。また、oracleセルをtrace照合の証拠には使っていません。

本文commit: `b6a7af2c07fbac209a1ae745a9a8c827b0b7a97c`

旧repair04監査 `docs/governance/audits/requirement-registration/labo-stage2b-002-010-review01-repair04-2026-10-05.json` は変更していません（SHA-256 `05d2b6978a81ef35b3943284a612f91ffa58886d759cd051bcaf3f21c1f5b943`）。本記録は修正時点の追補です。

## 検算

- 008: traceはCASE-01/02/03/09/10/13/14/15/16/17。L3列挙とL10 trace列の順序・内容が一致。
- 009: traceはCASE-01/06/07/08/09/10/11/12/13/14/15/16。L3列挙とL10 trace列の順序・内容が一致。
- 変更対象はL10 NFR verificationの上記2 traceセルだけです。機構、Stage、親、owner、version target、意味は変更していません。
- 独立review・PO承認・admissionはこの記録では成立しません。
