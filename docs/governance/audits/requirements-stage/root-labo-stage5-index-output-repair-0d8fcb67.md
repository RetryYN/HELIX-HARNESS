# LABO Stage 5 069/070/071の索引・単独反例追補

監査・修正基点は専用worktreeのexact main `0d8fcb67ef64e17e0e3529715011d6140652f017`。変更はL3/L10のfixture trace補強であり、L2/L11の意味、authority、版、閾値、gateを変えない。親068/069/070/071以外へ広げず、069の既存CASEは変えず、070/071のみ固有fixtureを追加した。旧監査は変更せず、誤ったmain pinは別の訂正記録に切り分けた。

## 固定親と旧source

- **069**：PO 2026-09-29 57候補行84。固定L2/L11は`318ec4a04abb3c1cc17111b3d939f913facd5fd3`のL2:552–559、L11:288–295。固定親はreason別傾向、counterexample、regression risk、revalidation conditionをAC-01 candidateに含める。旧起点は`execution-ticket-requirements.md:319`と`feedback-lifecycle.md:24`、旧acceptance consumer `execution-ticket-acceptance.md:92–140`。
- **070**：PO live26行49。固定L2/L11は`ea6f756f96a7370de78e412d737c7a7ed472114a`のL2:561–574、L11:297–307。9 atom、067/068の独立定義・receiptを同一scorecardへ別fieldで提示するscopeを保持。旧起点は`execution-ticket-requirements.md:399`と旧acceptance `execution-ticket-acceptance.md:92–140`。070の新2 negativeは、固定L2-068（`318ec4a04abb3c1cc17111b3d939f913facd5fd3` L2:541–550/L11:278–286）が生成を禁じる`task_success_rate`と`attempt_success_rate`をそれぞれ別に拒否する。定義・分母・oracle・閾値を新設しない。
- **071**：PO live26行50（境界行72も確認）。固定L2/L11は`ea6f756f96a7370de78e412d737c7a7ed472114a`のL2:576–584、L11:309–316。旧sourceは`three-lane-cloud-governance-requests.md:67–69`、旧L3 `three-lane-cloud-governance-requirements.md:77–79`、旧acceptance `three-lane-cloud-governance-acceptance.md:44–47`。旧要求のtitle/qualification/permission/assignment分離を意味再導出し、資格からtitleを補完しない既存境界を単独fixtureで照合する。

JSON sidecarに固定親のraw Git blob full/span SHA、旧sourceのローカルraw bytes/span SHA、6本文の前後SHAを記録した。

## 修正内容

069ではL3 NFRとL10 NFRVに既存CASE-44–47を4つのAC-01必須出力の各単独欠落として索引し、CASE-48を未評価結果からticket発行を生成する既存AC-04禁止例として索引した。本文CASEや件数は変更していない（52行維持）。

070では既存正常CASE-01と同条件の正常scorecard入力へ、`task_success_rate`だけを加えるCASE-131と`attempt_success_rate`だけを加えるCASE-132を追加した。他の入力・出力、source/result値は保持し、oracle/個体owner identityのunknown状態もそのままにする。生成された誤fieldを拒否し070自身の誤出力を訂正する。新たなoracle・owner・率定義・閾値・gateは加えない。BR/FR/NFR/BV/FV/NFRVのうちBRは対象の追加fixture traceを持たないため不変、残る5本文でCASE/AC/NFR traceを同期した。行数は130から132、重複なし。

071では`L10-LABO-071-CASE-r06-qualification-to-title`を新しい固有IDで追加した。C0/V0/S0、Q0、T0、P0、H0、A0は独立sourceの正常値をbaselineにし、単独でtitle outputだけをT1へ変える。期待oracleはT0へ訂正し、他fieldと個体owner identity unknownを保持する。正常入力からの出力誤りをmissing-ownerへ返さない。既存FR-03/AC-03、NFR-03、NFRV、BV traceに反映し、既存の要求意味・責務・authority境界を拡張しない。

## 検証

- FVの070 CASE表は132行、132 ID unique。新規IDはCASE-131/132の2件のみ。
- 071の追加IDは1箇所だけで、既存CASEとのID衝突なし。全CASE総数は45から46。
- 069既存CASEは52行、変更なし。44–48の該当NFR/NFRV traceを追加。
- `git diff --check` PASS。旧runtime/test/CI、archive実行、L10実行は行っていない。approvalや実行結果は主張しない。

6本文SHAはJSONに個別記録した（BRは未変更、FR/NFR/BV/FV/NFRVは更新）。実装commitは`04816106774ffff47f651acfb7742c697c256cf4`（未push）。作成側からの修正であり、独立Claude reviewとRoot検収は未実施である。
