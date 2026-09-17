# 旧要求retirement判断 前提分類program

status: prerequisite_classification_draft_review_pending
program_id: RDP-002-RETIREMENT
parent_program: RDP-002
parent_issue: 1814
projection_issue: 1849
authority_effect: none

## 目的

旧要求をretire候補として人間へ提示する前に、要求が旧HELIXの何を対象にし、現行のどの製品・層へ移るか、比較する要求同士が重複・上位具体化・接続・受入のどの関係かを確定する。要求本文、identity、semantic atomは一件も削減しない。

## 訂正

以前のBatch 1は、旧HELIX v1.3全体の9要求をHARNESS／OSへ分割する前に、5件のretirement候補として提示した。これは判断順序が逆である。`Q-RET-001`〜`Q-RET-005`はすべて撤回し、回答surfaceとして使用しない。

- 9要求はすべて`preserved_pending_rehome`のまま保持する。
- 5比較群はすべて`retirement_ready: false`とする。
- successor、retire、削除、意味変更、L2／L11採用を生成しない。
- 旧質問への回答を求めず、既存回答もretirement判断へ適用しない。

## 現在の成果物

- [前提分類表](requirement-retirement-prerequisite-classification.md): 各要求の平易な対象、製品分割、現行L2候補、要求間関係、未解決前提
- [機械台帳](requirement-retirement-candidates.jsonl): 原文、revision、digest、71 atomを保持したまま判断不可状態を記録
- [撤回済み質問](requirement-retirement-question-batches.md)
- [撤回済み人間判断packet](requirement-retirement-batch-1-human-decision-packet.md)

## retirement候補へ進める条件

1. source atomをHARNESS意味契約とOS運転責務へ分ける。
2. 各sliceの現行L2／L11移管先候補と、上位要求からのtraceを示す。
3. 関係を完全重複、上位→具体化、接続、受入、技術bindingに分類する。
4. 完全重複でない意味を吸収対象へ入れない。
5. successorが全atomを覆うか、replacement不要の根拠を示す。
6. 以上をexact HEAD reviewし、初めて人間へ5件ずつ具体的な問いを提示する。

このprogram自体は分類案であり、要求authorityを持たない。
