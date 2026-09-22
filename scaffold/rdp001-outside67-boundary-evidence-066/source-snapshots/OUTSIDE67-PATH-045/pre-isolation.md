# 新世代の提供構成と旧Functional Release Slice候補の対応

確認日: 2026-09-14

## 目的

`functional-release-slice-{requests,requirements,acceptance}.md`を、新世代のHARNESS提供契約と
HELIX-OS運用統制へ再分類する。旧候補はBR 9件、feature contract 6件、要件24件、受入26件である。
旧RLS、既存CI、DevOS、Cursor、GitHub／DB read-afterを前提に含むv0.2への過去承認は、現在の製品境界と
「要求整理完了前に既存CIを使わない」という方針を満たさないため継承しない。

本表はlegacy sourceから意味atomを採取するための照合である。旧IDを新世代の正規IDへ昇格せず、
L2合意、L3凍結、L10／L11受入、Requirement IR更新、CI・Worker・配布の実行を行わない。

## 利用者要求の再分類

| 旧ID | 保持候補の意味 | 新世代接続先 | 持ち込まない条件 | 状態 |
|---|---|---|---|---|
| FRS-BR-001／002／003 | 独立して適格性を確認できる機能単位、明示的な収載・除外、構成階層ごとの版と成熟度 | HARNESS-L2-006 | `Slice／Module／Bundle`という旧identity、旧schema、旧channel enumを固定しない | semantic_atom_candidate |
| FRS-BR-004／007 | 要求revisionと変更から、所有・構成・検証義務・未成立条件へ辿る | HARNESS-L2-004／005、HELIXOS-L2-002／007 | 既存registry、path mapper、旧CI profile、9群・17系統を再利用しない | split_reapproval_required |
| FRS-BR-005 | 同一入力からの提供物再現、clean consumerでの確認、適格な復旧先 | HARNESS-L2-006、HELIXOS-L2-006／007 | 旧builder、旧artifact、DevOS、GitHub／DB read-afterを方式として固定しない | split_reapproval_required |
| FRS-BR-006 | 全要求の所有・依存・検証・利用証拠から、維持・分割・統合・移管を判断する | HELIXOS-L2-002／005 | 旧横断機能名、旧Module境界、`shadow`状態名を新世代componentとして継承しない | scope_rewrite_required |
| FRS-BR-008 | CI改善の旧内部先行利用とCursor固有委譲 | 採用しない。CIはNCI再要求化、委譲はHELIXOS-L2-004のWorker源へ別照合 | 要求整理中の既存CI実行、旧比較baseline、provider／branch／Claude固有条件を禁止する | rejected_and_parked |
| FRS-BR-009 | 機能単位の安全依存閉包と、構成全体の受入を個別機能の受入から分ける | HARNESS-L2-005／006、HELIXOS-L2-006 | `Lite／Full`、旧L12番号、旧Bundle builderを固定しない | semantic_atom_candidate |

## 詳細要件と受入の再分類

| 旧ID | 保持候補の意味 | 新世代接続先 | 持ち込まない条件 | 状態 |
|---|---|---|---|---|
| FRS-R-01..06、AC-001..006 | 構成単位のidentity、明示的な依存・所有・収載、階層間の暗黙昇格禁止 | HARNESS-L2-006と対応L11 | `FunctionalReleaseSliceV1`、exact field、旧channel遷移をそのまま採用しない | schema_rederivation_required |
| FRS-R-07、AC-007 | 責務再編の根拠、旧新対応、consumer、復旧条件 | HELIXOS-L2-002／005 | 列挙された旧機能群、旧owner、未検証候補の旧状態名を固定しない | scope_rewrite_required |
| FRS-R-08／09、AC-008／009 | 昇格段階ごとに必要な証拠を省略せず、下位段階の成功で上位を代替しない | HARNESS-L2-003／005 | targeted／mutation／full CI、DB replay、特定OS、旧channel profileを必要集合として継承しない | verification_contract_rederivation |
| FRS-R-10／11、AC-010／011 | 復旧先と置換を明示し、別構成を暗黙更新しない | HARNESS-L2-006、HELIXOS-L2-006 | 旧artifact／manifest／DB state、旧retirement方式を固定しない | split_reapproval_required |
| FRS-R-12..14、AC-012..014 | 変更影響と検証義務を決定的に導出し、unknown／ambiguous／staleを隠さない | HARNESS-L2-004／005、HELIXOS-L2-002／008 | 既存CIを起動する導出、旧registry digest、`full verification`の旧job集合を継承しない | split_reapproval_required |
| FRS-R-15／16、AC-015／016 | 提供manifestの決定性と、将来提案からcurrent authorityへの直接書込み禁止 | HARNESS-L2-006、HELIXOS-L2-005／006 | 旧manifest schema、Future／System Synthesis component、既存writerを固定しない | semantic_atom_candidate |
| FRS-R-17／18、AC-017／018 | 配布側を上流から再構築可能なprojectionとし、sourceへ逆輸入しない | HELIXOS-L2-006／007 | `DevOS` identity、旧配布repository、GitHub／harness.db／consumerの旧read-afterを継承しない | product_boundary_rewrite |
| FRS-AC-019／020 | candidateからruntime／publishへ直接投影しない反例 | 上流変更管理、対象別L11／L10候補 | 既存RLS機構の再利用を合格条件にしない | oracle_rewrite_required |
| FRS-R-19／20、AC-021／022 | 全要求の配置と未成立状態を保持し、構成と作業順を依存・検収から導く | HARNESS-L2-004／006、HELIXOS-L2-002／005 | 既存RLS builder／registry、旧構成数、旧Waveを再利用しない | split_reapproval_required |
| FRS-R-21、AC-023 | 旧CIの内部先行投入 | 採用しない。NCI-HARNESS／NCI-OSとして上流から再導出 | 既存CIの実行・比較・効果測定を要求整理完了前に行わない | rejected_for_new_generation |
| FRS-R-22、AC-024 | 有界な外部Worker割当、単一writer、成果回収、独立検証 | HELIXOS-L2-004のWorker要求源へ移送 | Cursor、旧Issue、専用branch方式、Phase A/B、Claude固有reviewを提供構成要求へ混ぜない | moved_to_worker_reapproval |
| FRS-R-23／24、AC-025／026 | 必要な安全依存だけを閉包化し、個別機能と構成全体の受入を分離する | HARNESS-L2-005／006、HELIXOS-L2-006 | Lite／Full名、旧builder、旧L12運用検証を固定しない | split_reapproval_required |

## 新世代で固定する責務境界

1. HARNESSは、提供機能の構成、明示依存、適格性、変更影響、検証義務、組合せ受入の契約を所有する。
2. HELIX-OSは、承認済み契約から構成情報を投影し、対象プロジェクトへの導入・更新・復旧・配布操作と証拠を管理する。
3. HELIX-OSのCI／WorkerはHARNESS契約を実行するが、要求整理中には設計・実装・起動しない。
4. 個別製品と外部consumerは、選択した提供構成で目的を満たす利用者受入を所有する。
5. 旧Slice／Module／Bundleは概念候補の呼称に留める。対象別L1／L2で必要な役割が承認されるまで、新世代schemaやruntime identityにしない。

## 次工程

Concept v4.1と対象別L1の承認後、本表の`semantic_atom_candidate`と`split_reapproval_required`を
HARNESS／HELIX-OSの新しいL2 IDへ個別採否する。`rejected_for_new_generation`は採用対象から除外し、
Workerへ移した条件は提供構成と別の要求系列で再承認する。要求整理が閉じるまで既存CI、旧RLS、旧配布経路を実行しない。
