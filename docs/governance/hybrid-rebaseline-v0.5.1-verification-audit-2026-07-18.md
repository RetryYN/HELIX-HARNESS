# REBASELINE v0.5.1 完了主張再検証（2026-07-18）

## 判定

初回受領物は既知findingの是正内容と主要oracleは有効だったが、以下の反証により一度FAILとした。その後、同日是正と独立再監査を完了し、最終packageをPASSへ遷移した。

## 実物検証で合格した証拠

- ZIP展開と全YAML/JSON parse: error 0。
- `scripts/verify-no-bulk-ts.py`: PASS、違反0、baseline採用24。
- `scripts/verify-adr-trace.py`: PASS、ADR source/edge 18/18。
- `scripts/regenerate-validation-report.py --check`: up-to-date、requirements 169、AC 119、edge 347。
- `validation/check-chat-trace-closure.py`: 154組、欠落0。
- chat provenance: 21/21、orphan 0。
- Python capability map: 29/29全単射。
- SQLite resolved-field CHECKとevidence/finding orphan拒否: PASS。

## 完了を拒否する反証

1. package内`20-v0.5.1-errata.md`はin-scope 36件と別枠棄却1件を「30件」「minor 11件のうち1件reject」と誤集計する。
2. package内`13-acceptance-criteria.md`は実体119件に対し118件と記載する。
3. `validation/verify-full-ref-adoption-status.py`は`inventory/ut-tdd-ref-enumeration.log`不在、`enumeration_log_present=False`でもexit 0/PASSを返す。これは`hybrid-rebaseline-v0.5.1-remediation-requirements.md`要件11とAC-V051-05に直接違反する。
4. live GitHub再観測（2026-07-18）でupstream mainは`487ccd318a7e27f56ea35764d6204f35300d91d4`へ進んでおり、package pin `1839fa71`はfreshness/current-ref completionの証拠にならない。

## 必須是正（実施済み）

- finding分母をin-scope 36、別枠棄却1へ統一する。
- AC proseを119件、trace edgeを347件へ統一する。
- full-ref validatorをenumeration log不在でfail-closeさせる。
- `git for-each-ref`相当のbranch/tag列挙とGitHub open/closed PR head・merge情報を固定snapshotとして保存し、audit対象と完全照合する。
- fresh packageに対する独立再監査でnew critical/major 0を実証してからL3/受入設計をconfirmedへ遷移する。

## 最終再監査

- package SHA-256: `1e14a8576715f5a249f270fb5472e02023400526e00866baa709befe9edb48fd`
- physical files: 211、CHECKSUMS対象: 209、digest mismatch: 0。
- finding: in-scope 36/36 resolved、別枠1件rejected_with_counterevidence、minor 11/11 independently verified。
- catalog集計: requirements 169、AC 119、trace edge 347、orphan/dangling 0。
- full-ref: branch 8、tag 0、open/closed PR 89、live branch 8/8・open PR head 3/3・SHA一致。
- negative fixture: enumeration snapshot不在をexit 1で拒否。positive snapshotはPASS。
- package oracle: no-bulk-TS、ADR trace 18/18、validation-report freshness、chat trace 154、chat provenance 21/21、capability 29/29、SQLite CHECK、evidence orphan拒否が全てPASS。
- 独立再監査のnew critical/major: 0/0。

これによりAC-V051-01〜06と完了式を充足し、L3要件・受入設計を`confirmed`へ遷移した。packageは引き続きmigration sourceとして保持し、canonical HELIX要件は`helix-harness-requirements_v1.3.md`とする。

## AI Vision Design HARNESS要件取込監査（2026-07-19追補）

### 取込前判定

**PARTIAL**。現行要件には「ビジュアルDesign HARNESSはUI/UX生成・評価であり一般検証基盤ではない」という境界だけが存在し、packageの三契約、semantic ID、typed artifact、gate sub-check、`implemented`／`ux_verified`分離、UX evidence、L1〜L12／Scrum Reverse配置は直接bindingされていなかった。

### 入力正本の同一性

- 正本package: SHA-256 `1e14a8576715f5a249f270fb5472e02023400526e00866baa709befe9edb48fd`、211 physical files。
- workspace添付同名package: SHA-256 `04e9c88a9214e77654787b9e1301eb35bc69a2f264d179d14211e849c58aca61`、208 entries。
- 後者は再監査是正前の中間物としてsuperseded扱いとし、同名だけで正本へ昇格しない。
- 両packageのDesign HARNESS主要10対象（統合章、主要契約7件、requirements／acceptance catalog）はbyte digestが全て一致し、添付版のDesign HARNESS意味内容が正本版へ保持されていることを確認した。
- harness memoryの`helix-not-ut-harness`、`adr-010-runtime-authority-ruling`、`v051-completion-claim-correction`、`v051-final-reverification`を照合し、HELIX名称、Python意味コア恒久正本、36 finding＋別枠1件、最終package digestを採用した。

### 取込裁定

三契約、semantic ID、prototype agreement、screen ledger、UI profile、frontend binding、mission/oracle、UX evidence、delta、既存gate sub-checkとPython意味コアを採用した。一方、package原文のL0〜L14と旧L6/L7配置は現行L1〜L12へremapし、既存Python pathは非authorityへ降格、UT/Bun前提はrejectした。ADR-010によりPythonを意味コア恒久正本、Nodeを単一transaction境界とする。詳細は`docs/design/helix/L3-requirements/ai-vision-design-harness-engine.md`と対の受入設計を正とする。

packageのHBR-DH-001〜029はcanonical VDH-FR-001〜019へ29/29 crosswalk済みである。Pattern Contract、profile隔離、UI-M0..M7、surface分類、projection-only DB、Node browser/VRT境界を暗黙採用にせず、個別の要件・受入oracleへ固定した。

### 取込後判定

要件bindingは **PASS**。runtime実装・engine activationの完了を意味しない。実装はL4以降の別PLAN、schema、negative fixture、evidence、gate receiptが揃うまで未着手／未完了として扱う。
