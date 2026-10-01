# IR153 HIL-FR-02/04/05/06/08 現行条件照合

## 基準と範囲

基準commitは `2a6b1fdd49ffa74eb2075fd98f67daca316408f2`。旧L1は [infinity-loop-platform-requirements.md](../../../../archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md) の固定SHA `db31f424…f8c8fb`、旧IRは `requirements.json` の固定SHA `80e96573…457688`。各行の旧L1物理行、IR statement digest、HR/HAC/HAT識別子、現在のL2/L11位置・digest、実PO決定は[対応JSON](ir153-hil-fr02-04-05-06-08-current-condition-audit-2026-10-02.json)に記録した。

今回確認したのはFR02/04/05/06/08だけで、FR01〜60の索引・全行照合は未完。旧runtime、test、CIは実行していない。現在の見出しにある「候補」表示は採否根拠に使わず、対象revisionを固定したPO decisionから採否を読んだ。採択済み候補に旧source atomが正式移管されたとは推定しない。

## 照合結果

| 旧要求 | 現在の保持先と採否 | 残っている対応 |
|---|---|---|
| HIL-FR-02 | OS-035の現行L2/L11は2026-09-29 PO decision row 58で採択。選択PR-event scopeでrepo/PR/head/eventを結び、重複deliveryから監査job要求を一つだけ作る。全base branch・stacked PR・新headの分離をL11で確認する。 | OS-035の原source atomはHIL-BR-02でありFR-02ではない。監査jobの実行・所見処理は対象外。FR-02はformal successor未指定、pair descent pending。 |
| HIL-FR-04 | HARNESS-038の現行L2/L11はdecision row 43で採択。選択scope内の能力一覧、各件の根拠・適用範囲・処置・要求/design/test/gate関係・unknown・未完義務を個別に閉じ、双方向照合と具体的な内容oracleを要求する。 | 全Issueへ旧R0–R4を一律適用する意味は現行条件ではない。2026-09-24/26のPO判断がReverse対象をscopeで選ぶ。038の採択source atomsはFR-22/35。FR-04のformal successorは未指定。 |
| HIL-FR-05 | HARNESS-003/004のfreeze・Backflow・影響pair/再検証、L11のscope付きimpact・unknown保持・層別route、OS-017/023のticket依存とrevision/scope/未完義務付きhandoffに条件対応する。OS-017/023は固定PO revisionの本文と現在本文のsection bytes一致を確認。 | 旧L1→L12、L2→L11とscreen/prototype/skip receiptの具体的stale matrix、およびpair再freeze完了までForward不可という単一oracleは、今回読んだ採択本文では直接位置を確定できなかった。現行contractの合成で閉じるかを追加照合する。候補は起こしていない。 |
| HIL-FR-06 | HARNESS-035はdecision row 40で採択。上流source/revision/authorityからの導出、自己・同時候補だけによる正当化の拒否、scope/non-goal、必要性・代替・budget根拠を照合する。HARNESS-004/005とOS-017/018/023は変更範囲・ticket/assignment/handoffのscopeとauthorityを扱う。 | HARNESS-035のsource atomはFR-38/NFR-23で、FR-06のformal successorではない。条件対応は確認できたが、atom移管・retireは確認していない。 |
| HIL-FR-08 | OS-017/018/023は採択済み。ready ticket、lease/scope/authority/head不一致時の停止理由、期限切れ後の義務維持、handoffの受信未完義務を扱う。HARNESS-003/038は選択Reverseとpair-freeze内容を扱う。 | OS側のworker claim/tool startを、対象のReverse/Redesign/pair-freeze完了receiptに結び付ける横断oracleを今回の採択本文から特定できていない。FR-08 atomのformal successorも未指定。 |

## 読み取り上の注意

- OS-017/018/019/023の候補見出しは歴史的metadata。OSの2026-09-28 PO decisionが固定したL1/L2/L11 bytesと対象候補集合を採択正本とし、現在の全体ファイルSHAはその後の追記を含む。JSONには現在全体SHA、現在section SHA、decision固定版section一致を分けて記録した。
- HARNESS-038はPO decision row 43にあるL2/L11 section digestと現在のsection bytesが一致する。
- HARNESS-035 L2のPO表値は同decisionが定義するMPR `candidate_semantic_digest`。物理section byte hashとは別の値なので、JSONにはそのdigestと、現在のraw section SHAを別fieldで記録した。L11は物理section SHAでdecision値と一致。
- FR02/04/05/06/08のいずれにもformal successor IDや旧要求retireを割り当てていない。FR05/08の未解決点は条件の接続先が未確認であるという照合残差であり、この報告だけから新しい要求を発行しない。

## 静的確認

JSON parse、旧原文行・source/decision pin、採択pair section範囲とSHAの読後確認を行った。変更対象はこの監査JSON/MDのみ。tracked L1/L2/L11本文は変更していない。
