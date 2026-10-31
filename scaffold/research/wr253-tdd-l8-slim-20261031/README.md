# WR253 HARNESS-015 L8 軽量化

## 範囲と状態

- Request: `WR253-TDD-L8L9-SLIM`。このbranchではHARNESS-015のL8だけを軽量化し、L9本文は変更しない。
- base/latest main: `46864fcaa2426a480dbd037040cd4c4332c61ddd`。baseはlatest mainの祖先。
- 対象は `docs/helix-harness/L8-unit-verification/tdd-development-flow.json`、L5内の旧L8節参照、Scaffold Binding、照合記録。
- Binding IDは全refs/worktree照合後に未使用だった`SCF-B-0215`を割り当てた。依頼時点で予約済みの0211/0212に加え、0213はWR233、0214はWR218の別branchで使用済みと判明した。選択根拠は`verification-summary.json`に記録した。
- 本文の`authority_effect`は`none`。設計候補、実行資格、要求意味、承認、完了を生成しない。

## 軽量化と保持

L8から35件の展開済み`unit_cases`、fixture/body・mutation/value・full return・typed projection/COPY/hash、承認済みL3/L10の写し、legacy comparison、一般trace/scope/completion snapshot、および`f03_head_connection_oracles`の詳細payloadを除いた。L8はrootごとの既存35 U-ID、追加F03 head比較3件（計38比較、L9対応35件＋L8内の追加3件）、既存25 source pin、authority境界、5つの`candidate_unit_design`を保持する。candidate_unit_designの値はWR243（#3984/#3989/#3994/#3995相当の候補記録）から一切変えていない。既存35 U-IDには短い識別的な反例・期待と、numeric RFC6901配列indexで解決するL9 source/expected-source traceを残す。追加3件は、head一致／pre-body head不一致／Green head不一致と`order.source_status`だけを短く残し、fixture/full return/hashは戻さない。38比較の内訳はこの文書と`removed_materials`に明記する。`unit_case_contract`には追加3 IDの参照、3つの境界規則、absent/null/誤型の未検証状態、および既存の対象・contract oracle・実行・row oracle/test citation状態を置く。追加3件は未実行の合成case上の期待であり、実Red・実観測・TDD成功を示さない。row oracleとtest citationは未作成のnullであり、候補designは不変。

L5の`f03_head_connection_detail`は設計関数とhash観測の技術的説明を持ち、旧L8節は独立比較用の3ケースと境界を持つ。旧L8のfull returnやhashは戻さず、3 caseのhead関係とsource status、境界規則、未検証枝だけを現行F03 contract/tableへ短く追補した。L5の`oracle_location`は実際に解決可能な現行L8 F03 `unit_case_rows`へ戻し、撤去前L8の固定revision/pointer/hashは由来として保持する。3行のsource_trace_refは固定旧revisionのraw_source_recipeを由来として指し、expected_source_refも固定旧caseのstatus由来に限定する。現行の期待定義は3行だけに置く。旧snapshotを実行・期待・algorithm生成へ使わない。

## 旧HELIXと失敗事例

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/ddd-tdd-rules.md`（`LEGACY-ASSET-5E22432B0A5A8F7CC8B3`）、および旧 `root/docs/design/harness/L5-detailed-design/design-reality-binding.md`（`LEGACY-ASSET-70DA9B8C03E54A629039`）。対応する旧資産はL8の`source_pins`と既存`legacy_comparison`で照合した。保持するのは契約と期待を分け、期待の意味を薄めない点。変更するのはL8から実行用fixtureを外し、L7が契約から独立に期待を記述する境界。理由はDT-VT-105と#3510 comment 6447665479の層別責務である。旧runtime/test/CIは参照・実行していない。
- 現行の同種失敗事例: #3510 comment 6447665479は、副材料をtreeから外し、撤去元を記録し、L8/L9本体をallowlistで軽くしつつ小さな反例・期待を残す判断を記録する。
- 形の先例: #3988、#3911/#3924/#3929/#3930。L8の具体的な候補designと全IDは保持し、実行材料だけを縮約する。

## 静的照合

`verification-summary.json`は元の時点証拠として変更しない。R1追補と新しい静的検証artifactは別ファイルへ記録する。WR253共通validatorは既存35件のL9 pointer/意味を維持し、追加3件のID・簡潔な意味・boundary 3則・unverified 3枝・現行L5 pointer解決を別に検査する。全5 candidate designのcanonical値は不変。旧runtime/test/CI/algorithmは実行しない。L9は対象外で編集しない。

## F01/F02 validatorの追補

旧L8全文を現行bytesと等値比較していたWR206/WR223 validatorは、旧revisionのhash・展開行を履歴として検証し、現行35行表とcandidateはWR253 validatorで確認する。旧validator hashと旧L8 hashは`consumer-validator-followup.json`にrevision付きで保持した。旧summary/監査は変更しない。
