# インフラ・運用品質要求の取込み・原稿退役記録

観測日: 2026-09-11。owner: #1728。

| root原稿 | SHA-256 | 移管先 |
|---|---|---|
| `01_HANDOFF_UNDER_4000.md` | `0e77630d44fff35d587b0577941a35ebd10429a20f2b00f3098486552ede60e2` | `docs/archive/intake/infrastructure-operations-handoff-under-4000-source_v0.1.md`へbyte同一保全し、intake候補へ正規化 |
| `02_REQUIREMENTS_AND_CONNECTIONS.md` | `4d94b4b887a356fb9b17eaddc4df7a9c6e0eaed955d151c48a6efba667be7344` | `docs/archive/intake/infrastructure-operations-requirements-and-connections-source_v0.1.md`へbyte同一保全し、L1、L3、L10候補へ正規化 |

## 取込み結果

- NIO-CAND-01〜09を全件保持した。
- 2入力の原文bytesを`docs/archive/intake/`へ保全し、SHA-256をtestで固定した。
- L1利用者要求、L3機能・非機能要求、L10反例受入を分離した。
- #219〜#223、#1160、#1169、#290、#1033、#1318、#282、#186、#1035へ接続した。
- closed Issue、設計文書、collector、backup、synthetic testの存在を統合完了へ読み替えない。
- candidateであり、canonical promotion・Requirement IR admission・実装・運用検証は後続とした。

Git取込み、検査、独立review、CI、main read-after成立後にroot原稿2件を削除する。

## 検証oracle

| U-ID | 対象 | 反例と期待結果 | test citation |
| --- | --- | --- | --- |
| U-NIO-001 | 9要求群とowner | ID欠落・重複または既存owner参照欠落をRED | `tests/infrastructure-operations-quality-intake.test.ts` |
| U-NIO-002 | L1/L3/L10分離 | 各層候補のexact set不足または混載をRED | `tests/infrastructure-operations-quality-intake.test.ts` |
| U-NIO-003 | authority・完了境界 | 未承認自動修復、欠測healthy化、候補からの運用完了昇格をRED | `tests/infrastructure-operations-quality-intake.test.ts` |
