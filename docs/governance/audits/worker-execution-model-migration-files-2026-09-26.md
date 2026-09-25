# Worker統合に伴う旧実行主体の分類監査：ファイルごとの台帳

status: audit_record
authority_effect: none
recorded_at: 2026-09-26（Asia/Tokyo）
base_commit: `578d335b3146bfe133d4b49684b7dcdceb818843`（origin/main）
ledger: [worker-execution-model-migration-2026-09-26-files.jsonl](worker-execution-model-migration-2026-09-26-files.jsonl)
decision_record: [Worker実行モデルのPO判断](../decisions/worker-execution-model-po-decisions-2026-09-26.md)

## 記録の範囲

[分類監査](worker-execution-model-migration-2026-09-26.md)は、代表の資産と群の規則で分類し、全数の件数を固定した。POの移行条件は全数の確認を求めるため、本書と台帳は、該当する全ファイルを1行ずつ分類した結果を残す。
本書と台帳はその時点の監査記録であり、書き換えない。本書から承認、要求の採否、Issueのclose、下流の完了は生じない。旧HELIXの資産は読むだけにし、旧CLI・hook・test・CIは実行していない。[資産明細台帳](../legacy-asset-disposition.jsonl)は変更していない。

- 対象：git管理下のファイルのうち、`runner`、`sandbox`、`subagent`、`sub-agent`、`サブエージェント`、`エージェントレーン`、`レーン`、`lane`（英字は大文字小文字を区別しない。`lane`はASCIIの語境界）を含むもの。`archive/legacy-generation-2026-09-14/`（legacy）、`docs/`（current_docs）、`scaffold/`（scaffold）。
- 台帳の1行は1ファイルであり、path、area、kind、該当数、該当語、区分、移管先、POの判断と食い違うか（conflict）、代表の行を示す根拠、分類の方法を持つ。
- current_docsの行は、本PRの作業ツリーで本文を改訂している途中に読んだものを含む。本PRの改訂後の本文は、[判断記録](../decisions/worker-execution-model-po-decisions-2026-09-26.md)の反映先を正とする。

## 分類の方法

- rule（1472件）：旧PLAN、`.helix`、旧docsのarchive・research・migration・reference、現行の判断記録・監査・source・台帳、研究用scaffoldを「記録（書き換えない）」とし、`runs-on`等のCIのrunnerだけを含むものを「別の意味」とする等の規則で分類した。
- reviewed（594件）：要求・設計・実装・テスト・設定・hook・scaffoldの規則とbinding、規則で決まらないもの、POの判断と食い違うものは、ファイルを読んで分類した。
- reviewed+po_clarification（103件）：分類の途中で、POが「レーンをcodex、Claudeとした場合、codexに推進、Claudeにレビューを割り当てるみたいな概念。WorkerはGUIのレーン主が仮にオーパスだった場合、Workerはサブエージェントで呼び出したsonnetが該当する」と説明した（[判断記録](../decisions/worker-execution-model-po-decisions-2026-09-26.md)「レーンとWorkerの定義」）。レーンを主に扱う行を、この説明で分類し直した。
  - レーンを役割の割当て先として扱う行は、「retain→レーン（OSの割当て）」とし、POの判断と食い違わないものとした。この区分は、原文の区分にない。POの説明でレーンが残るため加えた。
  - レーンをproviderや固定の数に固定する行（旧三社レーン等）は、replaceのまま、食い違うものとした（現行のHELIX-OSの要求案「provider名や固定レーン数をOS全体の恒久要件にしない」）。
- 独立性をproviderの違いで判定する旧テスト設計（`L8-github-cross-review-admission-unit-test-design.md`）は、POの回答「『別Workerか』『別providerか』で独立性を定義しない」により、食い違うものとした。

## 集計

| 区分 | legacy | current_docs | scaffold | 計 |
|---|---:|---:|---:|---:|
| retain→Worker | 179 | 12 | 15 | 206 |
| retain→SECURITY | 59 | 1 | 4 | 64 |
| retain→Runtime Infrastructure | 4 | 0 | 0 | 4 |
| retain→レーン（OSの割当て） | 68 | 2 | 5 | 75 |
| replace | 125 | 0 | 5 | 130 |
| retire | 0 | 0 | 0 | 0 |
| 未定（削除しない） | 0 | 0 | 0 | 0 |
| 記録（書き換えない） | 1214 | 118 | 203 | 1535 |
| 別の意味 | 136 | 6 | 13 | 155 |
| 計 | 1785 | 139 | 245 | 2169 |

retireと未定（削除しない）は0件である。移管先の決まらない能力（実際の資源と隔離の方式）は、「retain→Runtime Infrastructure」として今の場所に残す。移管先のHELIX-INFRASTRUCTUREはアイデアの段階である（未mergeのPR #2148）。

## POの判断と食い違うもの

117件である。すべてreplaceとし、今の場所に残す。旧資産を再利用するときに置き換える。

- Subagentや同じruntimeのreviewを独立reviewにする：82件
- providerや数に固定したレーン：29件
- その他（Runner／Sandboxを独立した部品とする等）：4件
- providerの違いで独立性を決める：2件

旧PLANの754件は、`review_kind: intra_runtime_subagent`を含むが、その時点の記録なので「記録（書き換えない）」とし、食い違うものに数えない。
