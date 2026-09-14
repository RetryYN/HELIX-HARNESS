# 旧要求の無損失carry-forward方針

status: active_foundation_rule
effective_instruction: 2026-09-15 PO「旧要求はそのまま使いたい」
machine_ledger: `legacy-requirement-carry-forward.jsonl`
document_ledger: `legacy-requirement-document-carry-forward.jsonl`

## 方針

新世代化で置き換える対象は、旧実装、旧CI、旧runtime、旧owner混在、旧物理配置、旧技術の自動採用である。
旧要求の意味は削減対象ではない。旧要求は原文・revision・digestを保持して新しい対象productと層へ配置し直す。

旧IRのBR 33、FR 69、NFR 40、TR 11、計153要求は全件`preserved_pending_rehome`とする。
現行のHARNESS 9、HELIX-OS 13、HELIX-Web 9、HELIX-Web-OS 6、計37件は責務別のrouting containerであり、
旧153要求の代替、縮約後分母、棄却結果ではない。

## 許可する整理

- 一つの旧要求をHARNESSの工程contractとHELIX-OSの実行・管理要求へ分割する。
- 対象product、layer、owner、source、acceptance、relationを明示する。
- `unit`、`connection`、`composite`へ分ける。
- 旧技術名や旧実装名を要求の目的・制約と分離し、新世代architectureで実現方式を選ぶ。
- 重複する要求を共通identityへ関連付ける。

いずれの場合も元要求IDから全successor IDへのone-to-many trace、保持した意味、表現を変えた理由、未移管条件を残す。
全successorの合成で元要求のactor、目的、正常系、失敗、回復、制約、受入を被覆できない限り移管完了にしない。

## 禁止する整理

- 37件のrouting containerに関連付けただけで、153要求を移管済みとする。
- 旧owner、旧mode、旧tool、旧CIと衝突することを理由に要求全文を削除する。
- `意味変更要`、`再採否`、`historical`、Issue closeから棄却を推定する。
- 複数要求を一文へ要約し、個別のfailure、制約、受入、traceを落とす。
- 実装がない、古い、重複して見える、現在のConceptに記載がないことを削除理由にする。
- AI、reviewer、GitHub、CIが要求の縮退・棄却を決定する。

## 状態語彙

| 状態 | 意味 |
|---|---|
| `preserved_pending_rehome` | 原要求をそのまま保持し、対象別successorへの配置が未完 |
| `split_with_full_coverage` | 複数successorに分割し、意味被覆とtraceを人間が対象revision付きで確認済み |
| `reworded_with_equivalence` | 表現を変えたが意味同値を人間が確認済み |
| `changed_by_human_decision` | 意味変更を人間が対象revision付きで明示した |
| `retired_by_human_decision` | 不要化を人間が理由・影響・後継付きで明示した |

既定は`preserved_pending_rehome`である。後ろ二つはexplicit human decisionなしに設定できない。

## 要求PRのmerge条件

旧要求を扱う各`requirement` PRは次を満たす。

1. `legacy-requirement-carry-forward.jsonl`の原要求ID、原文、digestを参照する。
2. successor要求IDと対象productを記録する。
3. 元要求の意味atomとsuccessorの被覆を示す。
4. 未被覆atomを削除せず`pending`として残す。
5. 保持・再配置を含むすべての要求PRで人間decisionの対象revisionを記録し、意味変更・retireでは理由と影響も記録する。
6. L11へ正常系・失敗・回復・制約の確認を接続する。

これらを満たしても実装・受入・運用成立は生成しない。

## 153件以外の旧要求源

153件は旧Infinity Loop IRの閉じた集合であり、HELIX全要求の総数ではない。HBR／HNFR、requirements v1.3、
refinement 14契約、旧HARNESS要求5文書、screen要求、candidate 97文書等は既存source inventoryの別集合として保持する。
採用済み要求は同じ`preserved_pending_rehome`規則へ追加し、candidateはcandidate状態を保つ。両者を混同して
採用済み要求を候補へ降格しない。追加集合の原文単位ledger化が終わるまで「旧要求すべて移管済み」と主張しない。

旧HARNESS要求5文書、旧画面要求7文書、旧HELIX要求9文書、画面境界1文書は、元のauthority状態を
再分類せず現行保持領域へ同一byteで配置する。文書に旧ownerや旧技術が混在する場合も、責務・実現方式の整理と
要求意味の保持を別判断にする。文書単位の保持だけでatom単位の再配置完了とはせず、原要求ID単位の台帳を順次追加する。
source metadataが`confirmed`の17文書は`source_confirmed_preserved`、`draft`／`proposed`／`placeholder`の
5文書は`source_state_preserved_without_promotion`とする。新世代側で承認を取り直していないことを理由に、前者を
後者へ変更しない。責務分離によって意味変更が必要な箇所だけを、人間decisionへ送る。

confirmed文書で明示宣言された要求、価値、KPI、画面、制約のidentityは
`legacy-confirmed-requirement-identity-carry-forward.jsonl`へsource-qualified IDとして保持する。同名IDをAIが
同一要求へ統合せず、重複候補として人間判断へ提示する。明示IDのない段落条件は文書保持だけで移管完了にせず、
原文atom台帳へ追加されるまで未完とする。

Requirement IRと人間向け要求文書の関係は`legacy-ir-document-source-relation.jsonl`で管理する。
双方のID・statementが一致しない場合は、片側を正しいものとして上書きせずconflictとして停止する。
対象別successorへの再配置後も、原IR、原文書、successorの三者traceを残す。

既存crosswalkの`target_assessment`は、対象product候補、意味変更判断、実装方式の論点が混在するため、
`legacy-ir-target-routing-queue.jsonl`で別fieldへ分ける。対象候補の記録だけでsuccessorを割り当てず、
`意味変更要`等の旧表現だけで意味を変更しない。判断対象は原要求ID・原文・変更案・影響を人間へ提示する。
