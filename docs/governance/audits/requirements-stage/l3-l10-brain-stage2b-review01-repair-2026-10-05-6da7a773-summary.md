# BRAIN Stage 2b Opus review 01 修正記録

対象は #2600 の正式レビュー `5989425645`、exact reviewed HEAD `9b8160137dd218e8b63278d20ad00a754b33860c`、11採択親（001–006、009–012、029）です。作成側修正後の本文は `6da7a7733c9dbc5fcf08291c251a9cd00e840598`、修正追補監査は同名JSONに固定しました。6正本の承認済みprefix bytesを保持し、Stage 2b対象だけを修正しています。

Major 7件では、009のUnit根拠欠落とL2-025後の正の次状態を個別CASEへ追加しました。011は人の共有範囲判断へ送る経路と過度一般化のnegativeを追加し、012はrequest-side不足と返却field不足を分離してsourceにrelation/alternativeがない正常例を明記しました。029はscreen負例、relation未記録の非互換候補組合せ、固定親のL1/HARNESSへ限定した戻し先とL11:117からの根拠を記録しました。

Minor 19件はJSONの`formal_findings`に個別ID、severity、対応内容を記録しました。001/003/004の混合negativeを分割し、001の4操作を成功経路として明示しました。002 unknown state、003不充足/unknown、005逆方向/領域横断edge、010 success-only/Regression、011/012入力とauthority、029 stale観測を各自のCASE/NFRへ結びました。001–004 NFRは固定された全列挙を母集団に保持し、旧NFRのasset/full SHA、旧enum behaviorの置換、句→AC→CASE crosswalkを記録しました。旧F542/A6E2短縮spanは履歴記録を変えず、現行本文と新監査に正しいspanを固定しました。

固定source pinsは115件すべてのfull SHA/raw-LF spanをexact commit/pathから再検算し、不一致0件でした。6本文はmain `4729c34ec29c2c72f345993958bbc94e1ed6f131`のbytesをprefixとして保持し、6件の現在本文SHAとsuffixの601行pinを新記録に固定しました。CASEは201件で、完全修飾AC IDへの参照欠落・重複はありません。旧cutout監査SHA-256 `c6ebdc21515d1225f66dda204b70b564b51af0f712a664f9ffa0f59ec8e4a38e`を不変として確認しました。

静的検証は `scfctl validate` 147件/失敗0、`stale=0`、`residuals=0`、`govcheck` 7,622 atoms / 57 requirements / 58 files PASS、`git diff --check` PASSです。旧runtime、test、CIは実行していません。

この作成側修正記録は独立review closureを主張しません。L3/L10承認と独立reviewは未完了です。過去のC13/M12/minor/unreviewed identityと範囲外項目はopenのまま保持し、ここからclosureを生成していません。
