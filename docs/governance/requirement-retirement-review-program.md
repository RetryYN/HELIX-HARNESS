# 旧要求retirement候補 review program

status: exact_human_decision_packet_draft_review_pending
program_id: RDP-002-RETIREMENT
parent_program: RDP-002
parent_issue: 1814
projection_issue: 1849
authority_effect: none

## 目的

[重複検索母集団](requirement-overlap-review-program.md)から、包含、統合、旧技術bindingの除去によってcurrent要求としての
旧identityをretireできる可能性があるものを抽出し、原要求を一件も落とさず人間へ5件ずつ提示する。本programは候補探索と
候補dispositionの記録までを扱う。旧要求のretire、物理削除、successor採用は扱わない。

## 入力と分離

- Issue #1814と親PR #1848は、25 clusterとsource coverageを所有する検索母集団である。
- Issue #1849と本Draft PRは、Batch 1の5候補、9 source identity、semantic atom accountingを所有する。
- cluster relation、Issue close、AI reviewからretireを生成しない。
- 親PRが未mergeの間、本PRは親branchをbaseとするstacked Draftとして扱う。親のsource bytesが変わればstale化する。

## 候補状態

| state | 意味 |
|---|---|
| `question_pending` | 人間へまだ候補dispositionを確認していない |
| `candidate_answer_recorded` | 候補分類の回答だけを記録した。retire未適用 |
| `successor_coverage_pending` | successorまたはreplacement不要根拠、consumer、L11が未完 |
| `retirement_decision_ready` | 原要求identity別の最終判断packetが揃った |
| `retired_by_human_decision` | 対象revision付き最終人間decisionがある |
| `retain` | 独立要求として残す人間decisionがある |
| `unresolved` | 判断材料不足で生存中保持する |

Batch質問へのA回答は`candidate_answer_recorded`までしか成立させない。`retirement_applied`はfalseのまま維持する。

## Batch 1 coverage

[候補台帳](requirement-retirement-candidates.jsonl)は5候補、9 source identityを扱う。全source原文、revision、semantic digest、
source clusterを保持し、意味をcommon、preserve unique、technical bindingへ分解する。
[旧質問要約](requirement-retirement-question-batches.md)は人間回答surfaceとして無効化した。
[人間判断packet](requirement-retirement-batch-1-human-decision-packet.md)が、同じ5候補について原要求全文、重複atom対応、
各要求だけの保持atom、候補処置、選択肢を提示する唯一の回答surfaceである。

初期multi-product母集団66件の残り57件、`single_product` 87件、confirmed identity 175件、その他holdingは未処理母集団として
生存中であり、retire候補なしと判定していない。Batch 1後も5候補ずつ探索する。

## 完了条件

- 5候補の全source meaningが一度ずつsemantic atom accountingへ入り、未計上0である。
- 要約fieldとatom accountingが一致する。
- 人間回答原文、対象HEAD、候補台帳digest、人間判断packet digestを記録する。
- 回答後も`retirement_applied: false`、successor空を維持する。
- exact HEAD reviewで要求欠落、勝手なretire、対象外回答が0である。

Issue #1849のcloseはBatch 1候補review完了だけを示す。旧要求のretire、物理削除、successor採用、親Issue #1814／#1813の
完了を意味しない。最終retireは原要求identity別の後続要求PRと対象revision付き人間decisionで扱う。
