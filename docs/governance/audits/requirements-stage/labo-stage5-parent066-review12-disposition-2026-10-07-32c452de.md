# HELIX-LABO-066 review12後の時点監査

- 対象PR: #2635
- 対象HEAD: `32c452dec9eee4f3c3e91bbb6e688d6b498eeb96`（親 `9f17ce8771710e1f3fd60e563cedc05f1f84d345`、base `0acbed34bfda48e32092feb63db61d2eff6d5ec4`）
- 作業tree: `/home/tenni/.helix-worktrees/l3-labo-stage5-parent066`（branch `l3-labo-stage5-parent066`、clean）
- 範囲: postbody静的照合。canonical編集、追加commit/push、fixture実行、独立review、承認はしていない。

## 確認した内容

正式review12の全25 comment objectをrawで保存した。対象comment `6026103289` の本文SHA-256は `1486c2628b6b8773e3866a77f6b0a9874fe491bea4b0a9d2227c482e36a3ea89`。本文にはR1–R42の履歴・残余、R26のMajor繰上げ、R38–R42を含む。M1はA version missingとunknownの個別fixture、および正常CASE-01でのA identity/version実値照合を求めている。

六本文のHEAD全blobはcheckpointと一致し、各candidate after blobはHEAD、before blobは親revisionと完全一致した。機能検証文書のunique IDは親76件・HEAD78件で、親IDはすべて保持しCASE-68/69を追加した。checkpoint ID集合とも一致。ID集合には過去r08 literal IDsも含む。CASE接頭辞の物理表行は73行、r08接頭辞の表行5行と合わせて78行あり、索引2行を除く定義は76行。CASE接頭辞73行はすべて6列。CASE-68はA version欠落、CASE-69はA version値unknownの単独変異。CASE-01にはA0/Av0の実値比較があり、AC-03にはrepair permission/actionの拒否がある。

固定revision `318ec4a04abb3c1cc17111b3d939f913facd5fd3` のL2-066/L11-066 spanはfile/spanのSHA-256とbyte数を再計算して保存pinと照合した。旧Bugbot historyでは旧requirement source line 75とpaired acceptance consumerの保存line群を物理raw/hashで再確認した。旧67 literal rowsはsource revision `a0f531a1db4f011d4169b4b67ea6aa99e869932b` の行raw/hashを再照合した。R1–42と旧sourceの履歴原文は、正式review12全文raw、過去監査history、旧Bugbot候補履歴とともにJSONに保持した。

## 六本文pin

| 本文 | SHA-256 | bytes |
|---|---|---:|
| `docs/helix-labo/L3-requirements/nfr-grade.md` | `d3686b98f7d9164fd079b43b70f8b5035051db14c1c52562a07d1f864d56128d` | 72262 |
| `docs/helix-labo/L3-requirements/business-requirements.md` | `4978e928ca6bc8dc42eafe4ee96d204f38428ff0ad5d650f3d76ea3c7dec4ee2` | 18159 |
| `docs/helix-labo/L3-requirements/functional-requirements.md` | `09e13edbd0c4ad2eb6db1c2827c669ed09c452e984a6149cf3c145a4074d4a2a` | 323174 |
| `docs/helix-labo/L10-verification/business-verification.md` | `6e40b71ea81fd98fa6aa0db9e7d7d026596c537e8a1edeb0c2bebd2d3177f595` | 16319 |
| `docs/helix-labo/L10-verification/nfr-verification.md` | `b9977b3eaecfa1ecdda8ddf3d90fdf747c80f763f622bae6148e08ae71595f67` | 62432 |
| `docs/helix-labo/L10-verification/functional-verification.md` | `0ebee2472f633da6fee93ac39c670af02bffbfb41c302a5ec60fa5595c050253` | 542921 |

Root報告のgovcheck/diffcheck PASSは受領値として記録し、再実行していない。本監査で確認したのは静的hash/byte、ID、行構成、文言、source literalの照合だけである。fixture/oracle/comparison実行、独立review、PO/L3承認は未実施・未確認。詳細rawと履歴は隣接JSONに収録した。
