# confirmed175 source condition comparison queue

- 読み取り専用の棚卸しであり、`authority_effect: none`。要求採択、正式successor割当、source disposition、実装、受入、Step 5完了を主張しない。
- queueの比較基準はPR #2395のbaseであるmain `2bbd889545cff238452701e5901ce56b67208fc8`。
- 6件の個別監査はPR #2393のcontent HEAD `1df39b731e43824f7388b0e88fe16403ba5eef3e`で確認し、同じbytesがmerge後mainにあることを確認。
- 固定対象revision: `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。175件の母集団は[`legacy-confirmed175-full-audit-2026-09-28.json`](legacy-confirmed175-full-audit-2026-09-28.json)から`source_qualified_identity`完全一致で結合。

## 集計

|項目|件数|
|---|---:|
|一意なconfirmed source identity|175|
|固定L2/L11との個別条件比較あり|30|
|固定L2/L11との個別条件比較なし|145|
|条件閉包／正式successor割当|0 / 0|

full auditの非residual 158件における分類:

|分類|件数|
|---|---:|
|`existing crosswalk reports rederived/retained; atom-by-atom carry-forward remains unassigned`|92|
|`部分再導出／旧固有条件・反例・数値・出力の一部が未確認`|58|
|`部分再導出＋後続本文/候補のauthority未成立または固定PO範囲外`|8|

full auditは17件を既知の5つのresidual caseとして別途記録する。17件を再照合すると、固定f6dad2a L2/L11 bytesとのidentity固有比較を持つのはFR-L1-16、FR-L1-45、3L-BR-008の3件だけである。6件（BR-06、UX-02、FR-L1-35、BR-08、D-02、3L-BR-007）は残差artifact内でidentity別に論じられるが、その比較先は別revisionのHEAD559である。D-01・D-03〜09の8件は§3のgrouped KPI dispositionで、identity固有の固定revision比較ではない。各recordの`classification_basis`に根拠artifact・SHA・revision・節と計数可否を記録した。したがって17件中3件を個別比較に数え、14件は数えない。いずれもsource identityの閉包ではない。

## 証拠ファイル

各証拠のSHA-256は記載revisionのファイルbytesに対する値。6件の詳細監査はmain merge commitで確認済み。#2393のcontent HEADは40桁の`1df39b731e43824f7388b0e88fe16403ba5eef3e`。

|証拠path|identity数|所在revision|SHA-256|
|---|---:|---|---|
|`docs/governance/audits/requirements-stage/confirmed175-dac-fr004-008-condition-crosswalk-2026-09-29.md`|5|main `942f2e985f3a`|`b3cdaf06e0d716a7acfd16befbf1d200f25bef242004cc5ee8f94aa7a42ca749`|
|`docs/governance/audits/requirements-stage/confirmed175-frl1-07-10-condition-audit-2026-09-30.json`|4|main `2bbd889545cf`|`4503c75aa0206bb8223cd975904b561ef1ec03a21b91c16ff8ae0b1d83bd2524`|
|`docs/governance/audits/requirements-stage/confirmed175-three-condition-meaning-delta-2026-09-28.md`|3|main `942f2e985f3a`|`03ba7d15916b1be42cd26822ff4c42606fb4e381a6990b54ada2c7073f907439`|
|`docs/governance/audits/requirements-stage/legacy-confirmed175-br02-br05-condition-audit-2026-09-30.json`|4|main `2bbd889545cf`|`8e1a9a5c2a56b222a2f03b20591b40c1126421899e3fb6b979f1d6fde0e2f79b`|
|`docs/governance/audits/requirements-stage/legacy-confirmed175-br07-ux01-ux03-condition-audit-2026-09-30.json`|3|main `2bbd889545cf`|`a2d0c855e35ccad17c037d7e14cedd796479d2252d713c43aa56a80f9068495c`|
|`docs/governance/audits/requirements-stage/legacy-confirmed175-dac-nfr-three-condition-audit-2026-09-30.json`|3|main `2bbd889545cf`|`372b7c8a6d992d621dc4f90378caf1828aa4d02bb2940bf23e6c8459556f69ca`|
|`docs/governance/audits/requirements-stage/legacy-confirmed175-fr-l1-01-02-04-06-fixed-l2l11-audit-2026-09-30.json`|4|main `2bbd889545cf`|`cdacd4ca968b4f8d5dfe103d8be3dc65bd86fbddfe3cb207a94a88eabe31edac`|
|`docs/governance/audits/requirements-stage/legacy-confirmed175-fr-l1-24-25-26-27-fixed-l2l11-audit-2026-09-30.json`|4|main `2bbd889545cf`|`1829666c2499c0df271c45280b0271d97e47da5e06ab47631cab89127ee59104`|
|`docs/governance/audits/requirements-stage/legacy-confirmed175-residual-disposition-2026-09-28.md`|17|main `942f2e985f3a`|`2a97bc3ae719ed68b7cffb2486ceeec8972ae4dc78654920a35d8f2ced932d82`|

6件の詳細監査は22 identityを照合する。元source path／line／line SHA-256は各queue recordに保持し、監査JSON内のsource line SHA-256と一致させた。successor requirement IDは全件空。

## 集計規則

identity固有のsource conditionと、`f6dad2a33e24f000b87d7f09b8d40288257e74cc`上の固定L2/L11 bytesをartifactが比較している場合だけ数える。別revision HEAD559上の個別比較も、この固定revision基準では数えない。grouped residualは個票条件比較として数えない。各残差個票の`classification_basis`が計数根拠を示す。
