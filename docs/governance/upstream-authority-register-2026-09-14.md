# 上流authority管理台帳

status: draft_register
as_of: 2026-09-14

## 台帳の役割

本台帳は、上流再整備で確認すべき母集団と正規入口を管理する。GitHub Issue／PR数を要求件数や進捗分母にしない。
件数は対象集合を特定するための観測値であり、採択・実装・受入・完了を示さない。

| 管理集合 | 現在の母集団 | authority／入口 | 現在状態 | 次の処置 |
|---|---:|---|---|---|
| 最新責務決定 | 1 | [HARNESS・HELIX-OS・個別製品の責務決定](product-governance-boundary-2026-09-14.md) | 本作業のPO決定を記録 | Concept／L1／L2の親境界として使う |
| 上流統制方針 | 1 | [上流再整備と既存資産統制方針](upstream-rebaseline-and-asset-governance-policy-2026-09-14.md) | draft policy | 対象別改訂と資産台帳の運用へ適用 |
| 現行L0 charter | 1 | `docs/design/helix/L0-charter/helix-charter_v0.1.md` | confirmed、HARNESS／OS責務が混在 | P0–P9を対象別L1へ再導出 |
| 現行Concept | 1 | `docs/governance/helix-harness-concept_v3.1.md` | Core Read、旧製品境界を含む | 最新責務決定を反映した後にcompatibilityへ降格 |
| 次期Concept候補 | 1系列 | `docs/governance/candidates/helix-concept-v4*` | candidate承認済み、canonical promotion待ち | Harness＝Kernel／Control Plane／DevOS区分を最新境界へ改訂 |
| HELIX柱要求 | HBR 9件、HNFR 4件 | `docs/design/helix/L1-requirements/pillar-requirements.md` | confirmed、工程と実行管理が混在 | [対象別対応](audits/l2-requirements/pillar-target-crosswalk.md)からL1を分冊 |
| 要件正本v1.3 | 1 | `docs/governance/helix-harness-requirements_v1.3.md` | Core Read、HARNESS／OS責務が混在 | [対象別対応](audits/l2-requirements/requirements-v1.3-target-crosswalk.md)からL2／L3を分冊 |
| 対象別L2 | 3文書、23要求案 | [L2要求入口](../design/helix/L2-requirements/README.md) | HARNESS 6、HELIX-OS 9、HELIX-Web 8。draft、未合意 | 出典・prototype／N/A・合意revisionを確定 |
| 対象別L11 | 3文書、23受入案 | HARNESS／HELIX-OS／HELIX-Webの各L11 | draft、未実行 | 対応L2合意後に利用者受入を実行 |
| Infinity Loop Requirement IR | 153要求 | `requirements-ir/requirements.json`と3 shard | canonical JSON、全HELIX分母ではない | [対象別crosswalk](audits/l2-requirements/infinity-business-target-crosswalk.md)群と意味差分を正規改訂 |
| refinement契約 | 14契約 | `requirements-ir/refinement_contracts.json` | frozen／specified混在 | [対象別対応](audits/l2-requirements/refinement-target-crosswalk.md)に従いrevision単位で扱う |
| authority候補 | 92文書 | `docs/governance/candidates/` | draft／承認待ち／正本化待ち混在 | [候補対象別台帳](audits/l2-requirements/candidate-source-target-inventory.md)から個別採否 |
| 旧HARNESS要求群 | 5文書 | `docs/design/harness/L1-requirements/`のbusiness／functional／screen／technical／nfr | compatibility debtを含む | HARNESS工程条件とOS運用条件へ分け、未移管条件を保持 |
| 旧screen要求・設計 | 7文書＋個別mock | `docs/design/helix/L2-screen/`と対応test-design | 旧layer／pair、個別mock未確認を含む | L2要求形成・prototype合意・L11受入へ再接続 |
| 適用待ち意味差分 | 7 JSON record＋authority語彙 | [L2 freeze IR是正差分](audits/l2-requirements/l2-freeze-ir-correction.md) | proposal、未適用 | 正規transaction、impact、rollback、全projection更新 |
| PLAN | 1252文書 | `docs/plans/` | 作業契約・履歴。要求意味の正本ではない | 上流ID・対象・revisionへ接続し、Issue状態から意味を補完しない |

## 母集団の閉じ方

現時点の要求源は次の入口で漏れを検査する。

1. Core ReadとL0／L1／L2のrepo-owned文書。
2. Requirement IR 153要求とrefinement 14契約。
3. candidates directoryのMarkdown 92文書。
4. 旧HARNESS要求5文書、旧screen文書、Concept／Vision intake。
5. 人間の新規決定と、出典付きの運用・外部変化candidate。

新しい要求源を発見した場合は、Issueを作る前でも本台帳へ追加できる。必須項目はsource、対象製品、authority状態、
親Concept／L1、L2要求、L3要件、pair、採否、revision、次の処置である。未分類のsourceは`unresolved`として残し、
既存集合へ暗黙算入しない。

## 完了判定

上流再整備の完了は、次をすべて満たしたときだけ主張する。

- 全sourceがexact targetとauthority状態を持ち、`unresolved`の意味が記録されている。
- HARNESS、HELIX-OS、個別製品の要求所有が分離されている。
- Concept→L1→L2→L3とL2↔L11／L3↔L10の接続が対象別に閉じている。
- canonical、candidate、compatibility、historical、projectionが混在していない。
- GitHub状態を要求意味・採否・受入・削除の根拠にしていない。
- 自動走行対象が上位要求、責務、scope、pair、oracle、停止・復旧条件を持つ。
- 旧資産のreuse／split／replace／retire／archive判断とreplacement evidenceがある。

現在は対象別整理と適用待ち差分までであり、この完了条件は未達である。
