# O1/O2 作業依頼source snapshot（2026-09-29）

## provenanceと権威の限界

このsnapshotは `scaffold/review-handoff/local/codex-goals-2026-09-28-ops-loop.md` のO1/O2見出し下にあった「PO意図」欄を、要求候補作業の依頼入力として固定したもの。元ファイルはlocal review handoffで、mainの `1aa41a8ba6e750d23a46b832d1513738e84894bb` に含まれず、POが直接記した一次文言や対象revision付きdecision recordではない。元ファイルの冒頭はClaude review laneによる要約を「POの指示『それで入れてくれ。』」とするが、以下のO1/O2文はその要約である。したがって本snapshotは依頼スコープの来歴を残すだけで、要求意味の承認・候補採択・authority・PO選択を生成しない。ここから導いた追加の測定方法・責務分割・受入例は新規候補案として提示し、正確なPO一次意味の確定を主張しない。

## 依頼文書から固定したO1/O2テキスト

原典: `scaffold/review-handoff/local/codex-goals-2026-09-28-ops-loop.md`、local source line 38–52。

- O1 PO意図: 「チケットは原則として触らない。ミスは理由付きで発行元へ返し、再発行させる。」
- O2 PO意図: 「返却を学習に回して発行の精度を上げる。CI側で検証が成立しないときは、何が必要だったかをフィードバックする。」
- O2関連source/既存要求: HARNESS `:60,121,383`、OS `:296,562,699`、LABO `labo-requirements.md:269`、INTELLIGENCE `intelligence-requirements.md:106`。既存候補HARNESS-034/-036とOS-040との重複を避ける指示。
- O2候補差分の依頼要約: 返却理由と不足入力/oracleを発行元へ集約する。LABOは返却率・理由分類・再発行後成立率を観測する。INTELLIGENCEは次の発行/配置案へ反映する。LABOは割当/起動をしない。主担当OS・LABO・INTELLIGENCE、単体と接続を明示する。
