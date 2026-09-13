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
| 次期Concept候補 | 1系列 | `docs/governance/candidates/helix-concept-v4*` | v4.0 candidate承認済み。v4.1は最新境界で起草済み・人間確認待ち | v4.1の製品identityを確認し、L0／対象別L1へ投影 |
| HELIX柱要求 | HBR 9件、HNFR 4件 | `docs/design/helix/L1-requirements/pillar-requirements.md` | confirmed、工程と実行管理が混在 | [対象別対応](audits/l2-requirements/pillar-target-crosswalk.md)からL1を分冊 |
| 要件正本v1.3 | 1 | `docs/governance/helix-harness-requirements_v1.3.md` | Core Read、HARNESS／OS責務が混在 | [対象別対応](audits/l2-requirements/requirements-v1.3-target-crosswalk.md)からL2／L3を分冊 |
| 対象別L2 | 3文書、23要求案 | [L2要求入口](../design/helix/L2-requirements/README.md) | HARNESS 6、HELIX-OS 9、HELIX-Web 8。draft、未合意 | 出典・prototype／N/A・合意revisionを確定 |
| 対象別L11 | 3文書、23受入案 | HARNESS／HELIX-OS／HELIX-Webの各L11 | draft、未実行 | 対応L2合意後に利用者受入を実行 |
| Infinity Loop Requirement IR | 153要求 | `requirements-ir/requirements.json`と3 shard | canonical JSON、全HELIX分母ではない | [対象別crosswalk](audits/l2-requirements/infinity-business-target-crosswalk.md)群と意味差分を正規改訂 |
| refinement契約 | 14契約 | `requirements-ir/refinement_contracts.json` | frozen／specified混在 | [対象別対応](audits/l2-requirements/refinement-target-crosswalk.md)に従いrevision単位で扱う |
| authority候補 | 95文書 | `docs/governance/candidates/` | draft／承認待ち／正本化待ち混在 | [候補対象別台帳](audits/l2-requirements/candidate-source-target-inventory.md)から個別採否 |
| 新世代CI要求候補 | 1 | `docs/governance/candidates/next-generation-ci-requirements.md` | draft、要求整理のみ。既存CIはlegacy source | HARNESS検証契約とHELIX-OS実行統制を対象別L1／L2へ接続し、L3／L10以降は上流確定まで待つ |
| 現行CI資産 | workflow 4件、関連filename発見集合82件 | [現行CI・AI読取り資産inventory](audits/l2-requirements/legacy-ci-ai-runtime-source-inventory.md) | legacy、非実行、archive待ち。依存closure未完 | 要求整理完了後にsource inventoryと判断史を保全し、runtime入口から外す。新世代CIのbaseline・parity oracleにしない |
| AI可読文書 | 直接入口38件 | [現行CI・AI読取り資産inventory](audits/l2-requirements/legacy-ci-ai-runtime-source-inventory.md) | legacy runtime input、archive待ち。docs／template参照closure未完 | HARNESS工程契約とOS実行contextへ分解し、新世代manifestから再生成する。要求整理中は変更しない |
| CI・AI既存候補の新世代対応 | 3系列、22旧要件、25旧受入 | [新世代CI・AI source crosswalk](audits/l2-requirements/new-generation-ci-ai-source-crosswalk.md) | semantic atom照合済み、新世代で再承認待ち | Concept／対象別L1確定後、NCI／AIDOCのL2／L11で個別採否する |
| authority・全資産統制の新世代対応 | 3系列、30旧要件、44旧受入、4旧L12観測 | [新世代authority・asset crosswalk](audits/l2-requirements/new-generation-authority-asset-governance-crosswalk.md) | JSON-only／旧owner／旧実装再利用前提を分離済み、新世代で再承認待ち | Concept／対象別L1確定後、HELIX-OS L2／L11で個別採否する |
| 提供構成の新世代対応 | 1系列、9旧利用者要求、6旧feature contract、24旧要件、26旧受入 | [新世代提供構成source crosswalk](audits/l2-requirements/new-generation-release-composition-source-crosswalk.md) | HARNESS契約とOS実行を分離済み。旧CI先行利用は棄却、Cursor固有条件はWorkerへ移送、新世代で再承認待ち | Concept／対象別L1確定後、HARNESS／HELIX-OS L2／L11で個別採否する |
| 運用品質の新世代対応 | 1系列、9旧要求群、5旧L1要求、9旧L3要件、9旧L10受入 | [新世代運用品質source crosswalk](audits/l2-requirements/new-generation-operational-quality-source-crosswalk.md) | 工程契約・OS運用・製品固有品質へ分離済み。旧owner／engine再利用と候補からの操作認可を棄却、新世代で再承認待ち | Concept／対象別L1確定後、対象別L2／L11へ採否し、L3／L10はその後に再導出する |
| Concept・Package取込の新世代対応 | 2整理文書、受領原文10文書、旧PKG 13候補、長期Vision 5段階 | [新世代Concept・Package source crosswalk](audits/l2-requirements/new-generation-concept-package-source-crosswalk.md) | Concept・HARNESS・OS・個別製品へ分離済み。旧Package／Module／Bundle数、旧CI先行利用、旧main／Issue／PR authorityを棄却、新世代で再承認待ち | Concept v4.1確定後、対象別L1／L2／L11へ個別採否する |
| 管理変更入口の新世代対応 | 旧policy 1文書、旧受入4件 | [新世代管理変更source crosswalk](audits/l2-requirements/new-generation-management-change-source-crosswalk.md) | OS管理統制とHARNESS差戻し条件へ分離済み。Issue-first、PLANを含むGit一括authority、旧workflow／adapter／CIを棄却、新世代で再承認待ち | Concept／対象別L1確定後、HARNESS／HELIX-OS L2／L11へ個別採否する |
| 管理状態projectionの新世代対応 | 1系列、7旧要件、6旧受入、2旧PLAN oracle | [新世代管理状態projection crosswalk](audits/l2-requirements/new-generation-management-state-projection-crosswalk.md) | HARNESS工程条件とOS projectionへ分離済み。固定7 operation、旧layer、既存DB／roadmap／test／CIを棄却、新世代で再承認待ち | HELIX-OS L2確定後、管理状態をL3／L10へ再導出する |
| 限定修復の新世代対応 | 1系列、2旧利用要求、5旧要件、7旧受入、未提供別紙3件 | [新世代限定修復source crosswalk](audits/l2-requirements/new-generation-bounded-repair-source-crosswalk.md) | HARNESS検証契約とOS修復統制へ分離済み。旧GH-FR-011権限、既存CI／DB／transactionを棄却、新世代で再承認待ち | HELIX-OS L1／L2確定後、操作別authorityとL3／L10／L11を再導出する |
| 構造改善判断の新世代対応 | 1系列、L1要求なし、6旧L3要件、12旧L10受入 | [新世代構造改善trigger crosswalk](audits/l2-requirements/new-generation-refactoring-trigger-source-crosswalk.md) | HARNESS変更契約とOS改善統制へ分離済み。旧UIL／RF0／current 9 scope／既存CIを棄却、新世代L1から再承認待ち | Concept／L1で利用者価値を補い、対象別L2／L11からL3／L10／L12を再導出する |
| Worker capacityの新世代対応 | 1系列、1旧利用要求、6旧要件、6旧受入、1旧L12認識候補 | [新世代Worker capacity crosswalk](audits/l2-requirements/new-generation-worker-capacity-source-crosswalk.md) | HARNESS独立検証とOS capacity統制へ分離済み。三社・provider固定数・8-slot・既存CI／Merge Trainを棄却、新世代で再承認待ち | HELIX-OS L1／L2確定後、resource profileとL3／L10／L12を再導出する |
| Security engagementの新世代対応 | 1系列、旧価値5項目、12旧機能要件、6旧非機能要件、12旧受入 | [新世代Security engagement crosswalk](audits/l2-requirements/new-generation-security-engagement-source-crosswalk.md) | 個別製品security、HARNESS検証、OS操作統制へ分離済み。旧broker／provider／DB／CIを棄却し、実行権限なし、新世代で再承認待ち | 対象別L1／L2確定後、data・操作authorityとL3／L10／L11を再導出する |
| 旧HARNESS要求群 | 5文書 | `docs/design/harness/L1-requirements/`のbusiness／functional／screen／technical／nfr | compatibility debtを含む | HARNESS工程条件とOS運用条件へ分け、未移管条件を保持 |
| 旧screen要求・設計 | 7文書＋個別mock | `docs/design/helix/L2-screen/`と対応test-design | 旧layer／pair、個別mock未確認を含む | L2要求形成・prototype合意・L11受入へ再接続 |
| 適用待ち意味差分 | 7 JSON record＋authority語彙 | [L2 freeze IR是正差分](audits/l2-requirements/l2-freeze-ir-correction.md) | proposal、未適用 | 正規transaction、impact、rollback、全projection更新 |
| PLAN | 1252文書 | `docs/plans/` | 作業契約・履歴。要求意味の正本ではない | 上流ID・対象・revisionへ接続し、Issue状態から意味を補完しない |

## 母集団の閉じ方

現時点の要求源は次の入口で漏れを検査する。

1. Core ReadとL0／L1／L2のrepo-owned文書。
2. Requirement IR 153要求とrefinement 14契約。
3. candidates directoryのMarkdown 95文書。
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

[上流再整備の実行backlog](upstream-rebaseline-execution-backlog-2026-09-14.md)は、本台帳の各集合を
U0母集団固定からU7旧資産退役までのwork unitへ変換する。GitHub Issueを起票しなくても作業契約を保持できる。
