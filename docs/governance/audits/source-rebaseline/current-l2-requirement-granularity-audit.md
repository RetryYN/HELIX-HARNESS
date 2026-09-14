---
title: "新世代L2要求の単体・接続・構成体分類監査"
status: draft_audit
created: 2026-09-15
source_revision: 0e17dadf0bad6f8f3d1c594fab1dc4bef284a9f0
classification_authority: proposal_only
---

# 新世代L2要求の単体・接続・構成体分類監査

## 目的

対象別L2の37要求案を、`unit`、`connection`、`composite`へそのまま確定する前に、現在一行へ混在する意味を確認する。
本監査の分類は要求エンジン実装前の人間可読proposalであり、要求IDの採択・分割・改番を行わない。
現行IDはsource containerとして保持し、L2合意時に子要求とrelationへ分割する。

## 判定規則

- `unit`: 一つの機能または責務だけで成立を判定できる。
- `connection`: 二つ以上のidentity間の受渡し、順序、data意味、失敗・回復を所有する。
- `composite`: 複数のunit／connectionで成立する製品・subsystem・end-to-end価値を所有する。
- `mixed`: 現在の一行に複数kindまたは複数unitが混在し、分割が必要。

`mixed`は将来のrequirement kindではなく監査所見である。分割後の子だけに正規kindを与える。

## HARNESS 9件

| 現行ID | 現在形 | 再整理案 |
|---|---|---|
| HARNESS-L2-001 | composite | layer定義unit、pair接続、全工程構成体へ分ける |
| HARNESS-L2-002 | mixed | style選択unit、共通必須工程との接続、各styleの構成体条件へ分ける |
| HARNESS-L2-003 | mixed | 開始・freeze・差戻し・再開・完了を状態遷移unitと工程間connectionへ分ける |
| HARNESS-L2-004 | connection | 要求→設計→検証のtraceと変更影響接続として具体化する |
| HARNESS-L2-005 | mixed | verification obligation unit、oracle／evidence接続、対象全体の判定構成へ分ける |
| HARNESS-L2-006 | composite | 提供機能unit、artifact／dependency／version接続、consumer package構成体へ分ける |
| HARNESS-L2-007 | composite | 各product適用結果unit、HARNESS自己適用connection、Version 1構成体判定へ分ける |
| HARNESS-L2-008 | mixed | 抽出・質問・差分・影響の各unit、source→候補→合意connection、要求群構成体へ分ける |
| HARNESS-L2-009 | mixed | template適用・義務生成unit、要求→設計connection、missing inputのbackflow connection、seed pack構成体へ分ける |

## HELIX-OS 13件

| 現行ID | 現在形 | 再整理案 |
|---|---|---|
| HELIXOS-L2-001 | mixed | authority登録unit、企画／要求／採否relation、project authority view構成体へ分ける |
| HELIXOS-L2-002 | composite | 各trace unitとproject横断の欠落・競合構成体へ分ける |
| HELIXOS-L2-003 | connection | 共通統制、HARNESS契約、個別product方式の境界接続として具体化する |
| HELIXOS-L2-004 | mixed | assignment、lease、budget、dispatch、回収、review独立性をunit／connectionへ分ける |
| HELIXOS-L2-005 | composite | observation→candidate→採否→変更→再検証→再観測のloopをunitとconnectionへ分ける |
| HELIXOS-L2-006 | composite | package取得・導入・更新・復旧unitとproject接続、導入全体へ分ける |
| HELIXOS-L2-007 | mixed | event log、evidence、feedback、retentionのunitと要求revision接続へ分ける |
| HELIXOS-L2-008 | composite | profile生成、隔離実行、監視、回収、再開unitとCI run構成体へ分ける |
| HELIXOS-L2-009 | mixed | continuation、checkpoint、idempotency、recoveryをunitと状態接続へ分ける |
| HELIXOS-L2-010 | composite | 管理・推進・検収unit、typed communication connection、編成全体へ分ける |
| HELIXOS-L2-011 | composite | 統合順序、統合単位、検証計画、再計画unitとcandidate間依存構成へ分ける |
| HELIXOS-L2-012 | mixed | System Info CrawlerとTech Web Crawlerを別unitにし、依頼・結果接続を共通化する |
| HELIXOS-L2-013 | composite | work correlation、上向き欠落診断、下向き原因診断、是正・再観測loopへ分ける |

## HELIX-Web 9件

| 現行ID | 現在形 | 再整理案 |
|---|---|---|
| HELIXWEB-L2-001 | composite | 環境選択、project操作、進行表示unitとConnector接続、dashboard体験へ分ける |
| HELIXWEB-L2-002 | connection | HARNESS能力packageとConnectorの導入・更新・撤去接続として具体化する |
| HELIXWEB-L2-003 | composite | job受付・進行・取消・再開・終端unitと長時間job lifecycleへ分ける |
| HELIXWEB-L2-004 | mixed | provider route選択、利用条件、返送data scopeをunit／connectionへ分ける |
| HELIXWEB-L2-005 | mixed | 変更判断、操作許可、利用者受入、保守を別unitと状態遷移へ分ける |
| HELIXWEB-L2-006 | mixed | HDA利用unit、評価証拠connection、学習／分散推論の別構成へ分ける |
| HELIXWEB-L2-007 | composite | capability／Connector／model／contractの版unitとWeb構成体へ分ける |
| HELIXWEB-L2-008 | connection | Web-OS logからHELIX-OS改善入口までの同意付きexport接続として具体化する |
| HELIXWEB-L2-009 | connection | HARNESS Version 1成立からWeb展開判断への依存接続として具体化する |

## HELIX-Web-OS 6件

| 現行ID | 現在形 | 再整理案 |
|---|---|---|
| HELIXWEBOS-L2-001 | composite | tenant、利用者、project、environment隔離unitとscope構成体へ分ける |
| HELIXWEBOS-L2-002 | connection | HARNESS能力、Connector、Web版の導入・更新・撤去接続として具体化する |
| HELIXWEBOS-L2-003 | composite | queue、dispatch、取消、再開、終端、result-unknown unitとjob lifecycleへ分ける |
| HELIXWEBOS-L2-004 | mixed | auth、credential、provider route、network、data scopeを別unitと操作接続へ分ける |
| HELIXWEBOS-L2-005 | connection | 原event／evidenceからdashboard projectionへの接続として具体化する |
| HELIXWEBOS-L2-006 | mixed | release、deployment、monitoring、incident、backup、restore、rollback、maintenanceをunitへ分け、OS改善exportを別connectionにする |

## 監査結果

37件は製品別ownerの整理には使えるが、そのまま要求エンジンの原子要求集合にはできない。

| 判定 | 件数 | 意味 |
|---|---:|---|
| mixed | 15 | 複数unitまたはkindが一行に混在し、分割必須 |
| composite | 15 | 子unit／connectionと構成体固有acceptanceの明示が必要 |
| connection | 7 | 接続端、方向、contract、失敗・回復の具体化が必要 |
| unit | 0 | 現状のL2行だけで単一責務として閉じた要求は確認できない |

この結果は「36件を削除する」判断ではない。現行IDを親containerにして、次の順に再構成する。

1. 各行から単一actor／対象／結果で閉じるunit候補を抽出する。
2. unit間の受渡しだけをconnection要求へ分離する。
3. 製品・subsystem全体で初めて成立する価値と制約をcomposite要求へ残す。
4. 親L1、出典、元L2 IDを全子へ継承し、追加意味は別proposalにする。
5. unit、connection、compositeそれぞれへL11 negative caseを付ける。
6. 人間合意後だけ新IDを確定し、旧親IDをsupersedeする。

分類・分割はFT-HARNESS-REQENG-001のsemantic contract候補で行い、原event登録はFT-OS-REQREG-001、
分類結果の管理はFT-OS-REQCLASS-001へ分離する。要求エンジン未確定の現時点では本監査を初期fixture候補として保持する。
