# LABO Stage 4 review01 修正記録

本文revision `5665b273e1306b0a05db3040597244438ac828d4`、review対象HEAD `f860d247907a13f9feb1b1476557bc2f28c9835a`、固定L2/L11 `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、PO/register `633bf12ea8f948db8ba3d6600179c4a9507377a7`。対象は036/037/038/039/040/041/052/054のみ。旧監査は変更していない。

m10のpin所在：既存root correctionの [JSON](../../requirement-registration/labo-stage4-root-correction-2026-10-05.json)（SHA-256 `40811912cb363c14ffbfcbfc97afeedc1d8f060a2a75812ffebb5a8d7844048a`）にPO/registerと固定sourceのfull SHA/raw literal pinsがある。本追補JSONにも当該ファイルのSHA、固定L2/L11有界span、旧source full SHA/raw-LF span/literal、修正後Stage 4全行のcurrent physical line/raw-LF literalを収録した。prepublication JSON自体は不変。

## 20所見の対応

- **M1** — `FR-036/CASE-036-05, 036-07, 036-10`：固定L2のrouting候補に宛先を足さず、unknown targetはrouting候補へ戻す。
- **M2** — `AC-036-02/CASE-036-04`：実験結果を根拠にした工程contractの実変更自体を個数・表示形式にかかわらず拒否。
- **M3** — `AC-037-02/CASE-037-07`：ticket/operationの実行を独立negativeとして明示。
- **M4** — `AC-038-01/02/CASE-038-01,03,09`：restricted dataを通常packetと通常evidenceの双方から排除。合成markerのみ。
- **M5** — `共通Stage4意味境界、AC-036..039/CASE-036-11/12,037-12/13,038-08/10,039-10/11`：接続固有connector一意、代用不可、片側成功は全体成功でないことを個別fixture化。既存039 OS/SECURITY routing CASE-06/07は再利用。
- **M6** — `AC-040-02/CASE-040-11`：contract version欠落を独立negativeとして追加。
- **M7** — `AC-040-02/CASE-040-10`：scope unknownはunknown保持・candidate未確定とし架空ownerを除去。
- **M8** — `AC-052-02/CASE-052-02/03/11/12/13`：scope/version/receipt欠落・不一致の戻し先をLABO再評価に統一。identity欠落はsource/evidence ownerへ保持。
- **M9** — `AC-052-02/CASE-052-14/15/19/20`：trainingと調整の必須化、LABOによる実行を独立に拒否。
- **M10** — `AC-052-02/CASE-052-16/17/18`：current judgement、prediction、placement proposalのLABO所有を別CASE化。
- **m1** — `AC-054-01/02/CASE-054-17/18/19`：INTELLIGENCE案とOS指定/割当の別状態を正常fixtureで観測し、重複waterlineと別定義を分けて拒否。
- **m2** — `AC-054-02/CASE-054-08/21`：model指定とmodel変更を独立CASEへ分離。
- **m3** — `AC-054-01/CASE-054-10/11`：held-out正常は適用可能な既存055 outputありに限定し、unknown-jobを独立negativeに維持。
- **m4** — `AC-041-02/CASE-041-11`：Product Core正本のLABO直接書込みを拒否する独立CASE。
- **m5** — `FR old-source disposition table / audit pins`：Bench R-03 76–95とUIL FR001/003/004/005実在spanを追加。旧UIL paired acceptanceにないunauthorized oracleを持ち込まず、固定source由来と区別。
- **m6** — `nfr-grade Stage4 / nfr-verification Stage4 / AC-040/041-01/CASE-040/041-02`：036–041の具体CASE ID集合をNFRへ列挙。040/041未選択scope正常条件を対応AC-01に明記。
- **m7** — `FR-052/054 output declarations`：052は受領証跡と材料循環、054はINTELLIGENCE向け受渡しと固定L2 outputへ整合。
- **m8** — `FR-036..041`：他親052/054専用template句を削除。
- **m9** — `AC-039-02/CASE-039-06/07`：既存OS/SECURITY route failure CASEをAC bulletへ明示参照し、重複作成なし。
- **m10** — `new correction MD/JSON`：既存root-correction JSONの実path/full SHAを新MD/JSONに固定し、旧prepublication recordは不変。

## source検算

固定L2/L11は`f6dad2a33e24f000b87d7f09b8d40288257e74cc`から直接取得し、全spanが実在・非空であることを確認した。旧sourceは9 bounded spans（UIL FR-001/003/004/005とpaired acceptance、Bench R-03および関連L3/paired範囲）を実byteで確認し、資産台帳4行を`633bf12ea8f948db8ba3d6600179c4a9507377a7`からpinした。固定/旧/current pinsはJSON `l3-l10-labo-stage4-review01-repair-2026-10-05-5665b273.json` に全literalとSHAを収録。

## inventory / 検証

L10 functional CASEは108件、ID重複0。親別は `{"036": 11, "037": 13, "038": 10, "039": 11, "040": 11, "041": 11, "052": 20, "054": 21}`。CASE表は全行5列で、全AC参照が解決。NFR Stage 4は108 CASE IDを親別に列挙し、functional CASE集合と一致する。6 canonical文書はすべてmain `29e814a92af2aa52afcbcdd60549b32a2448513a` の全file bytesを先頭prefixとして保持する。

静的検証：`git diff --check` PASS、`scfctl validate` 147/0、`stale=0`、`residuals=0`、`govcheck` 7622 atoms / 57 requirements / 58 files PASS。旧runtime/test/CIおよびfixtureは実行していない。

これは作成側の修正記録であり、独立reviewおよびroot最終検収は未了。PO L3承認、実装、実行、releaseの許可を生成しない。
