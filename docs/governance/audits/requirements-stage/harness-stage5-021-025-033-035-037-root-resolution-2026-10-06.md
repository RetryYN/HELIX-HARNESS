# HARNESS Stage5 Root検収補正監査

この追補は、Stage5 1.0対象の固定親 `HARNESS-L2-021/025/033/035/037` に対する初稿検収後の本文補正を記録する。L3/L10草稿であり、承認・実行・実装・利用者受入を表さない。

- 作業branch: `codex/harness-stage5-main-publication`
- 起点HEAD: `a00deb199b35f1a08aa4b29f7180d7c03947eb89`
- 固定対象main: `64086f7f03b283247d0cfd18a5b729420caadf29`
- 本文commit: `f9e76cc400114757c123b1753eada80de979f8ec`
- Root所見: `/tmp/harness-stage5-root-findings-20261006.md`、SHA-256 `b25396506ef0bc0781a8eb52147d9442f449ef7cc3aa800726073064c2f95e45`
- 旧監査: `docs/governance/audits/requirement-registration/harness-stage5-021-025-033-035-037-source-audit-2026-10-06.json`、SHA-256 `34f9c3a2590edb7872fca858551c3ed32324dfd4d0a8cf6a08f296cd25c35e64`。起点HEADにある原本とbyte-identicalであり、変更していない。新しい追補だけを `requirements-stage` に置く。
- 固定L2/L11、PO採択/G0、旧source、旧sourceの検索範囲と意味dispositionは、このJSONの `parent_source_evidence` として各親ごとにsource literal・全文SHA-256・raw-LF span SHA-256を保持した。

## 本文補正

固定親の意味と戻し先を照合し、6本文を同期した。元mainの6文書prefixは全てbyte単位で維持した。個別内容とcurrent full/suffix SHA-256はJSONの `six_document_prefix_proof`、本文追補literalは `six_document_other_appended_suffixes` に記録した。

- 021: 構成体trace、正常更新とrollback、L12観測から要求へのsource/receipt、LABO評価・OS提案・選択実行を別状態にした。unit/composite成功からrelease eligibility、実行、運用状態を生成しない。
- 025: 意味差はL2-008/上流、L3 authority/revision差は該当L3 owner、Pattern/relationはBRAIN owner、設計/pair/oracle不足はL2-026/022形成へ原因別に戻す。generic permission/DesignTemplate ownerは追加しない。
- 033: 通常candidateとreduction/回帰証拠を分け、source/oracle/revision/scope/consumerを項目単位で確認する。case、repro、run/pass、consumer、022受入を同じ結果に畳まない。
- 035: 原指示・上流revision/authority・non-goal/scope・受入寄与・必要性/代替・budgetを項目単位で照合する。根拠ある後続版候補を初版最小性だけで消さず、technical-only差分から新承認を作らない。
- 037: 各phaseのL2/L3 authority・対象scope/revision・設計・後段L9を分けた。**同じL2 identity単独は失敗条件ではない**。Phase1のapplicability/authority判断をPhase2のscope/revisionへ適用証拠なしに流用することを負例にした。戻し先は009形成、008/上流、022 oracle、OS/選択executor sourceに束縛した。

## CASEと静的照合

追加した単独CASEは107件で、全件のliteralとraw-LF SHA-256をJSONの `added_case_rows` に固定した。

| 固定親 | 追加CASE集合 | 件数 |
|---|---:|---:|
| `HARNESS-L2-021` | `CASE-HARNESS-L10-021-S5-007`–`S5-016` | 10 |
| `HARNESS-L2-025` | `CASE-HARNESS-L10-025-S5-007`–`S5-030` | 24 |
| `HARNESS-L2-033` | `CASE-HARNESS-L10-033-S5-008`–`S5-025` | 18 |
| `HARNESS-L2-035` | `CASE-HARNESS-L10-035-S5-007`–`S5-026` | 20 |
| `HARNESS-L2-037` | `CASE-HARNESS-L10-037-S5-008`–`S5-042` | 35 |

修正した既存 `CASE-HARNESS-L10-037-S5-005` は同JSON `corrected_prior_case_rows` に固定した。全20 AC行を `updated_ac_rows` に固定した。BR/BVでは独立business requirement/KPI/business CASEを0件に保ち、NG/NVではplanned denominatorとunknown/unobserved/missing等の分類を保持した。planned CASE集合の追補範囲は本文に対応づけた。

実行確認は行っていない。旧runtime、Bun、旧test、旧CIは使わず、`git diff --check` と文書revision、ID、参照、CASE集合、prefix、source/pinの静的照合に限定した。JSONを含む本追補自体のSHA-256は `9ba3e01a6a1a37a8a6ab39834f161368225b54777453f39921e44635ebf537d2`。

## 範囲と限界

fixtureは未実行設計候補であり、結果・性能・release・承認を示さない。旧sourceの意味照合は各親に記録したasset/source atomsおよび検索範囲に限り、archive全体の網羅は主張しない。旧sourceは役割ごとに再利用/再導出/比較限定を区別し、旧runtime/旧gateは取り込まない。独立reviewはRootが別途行う。
