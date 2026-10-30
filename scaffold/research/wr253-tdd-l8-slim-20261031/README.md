# WR253 HARNESS-015 L8 軽量化

## 範囲と状態

- Request: `WR253-TDD-L8L9-SLIM`。このbranchではHARNESS-015のL8だけを軽量化し、L9本文は変更しない。
- base/latest main: `46864fcaa2426a480dbd037040cd4c4332c61ddd`。baseはlatest mainの祖先。
- 対象は `docs/helix-harness/L8-unit-verification/tdd-development-flow.json`、L5内の旧L8節参照、Scaffold Binding、照合記録。
- Binding IDは全refs/worktree照合後に未使用だった`SCF-B-0215`を割り当てた。依頼時点で予約済みの0211/0212に加え、0213はWR233、0214はWR218の別branchで使用済みと判明した。選択根拠は`verification-summary.json`に記録した。
- 本文の`authority_effect`は`none`。設計候補、実行資格、要求意味、承認、完了を生成しない。

## 軽量化と保持

L8から35件の展開済み`unit_cases`、fixture/body・mutation/value・full return・typed projection/COPY/hash、承認済みL3/L10の写し、legacy comparison、一般trace/scope/completion snapshot、および`f03_head_connection_oracles`を除いた。L8はrootごとのU-ID集合（5 root、35 ID）、既存25 source pin、authority境界、5つの`candidate_unit_design`を保持する。candidate_unit_designの値はWR243（#3984/#3989/#3994/#3995相当の候補記録）から一切変えていない。全35 U-IDに対して短い識別的な反例・期待、RFC6901のnumeric配列indexで解決するL9 source/expected-source traceを`unit_case_rows`へ短く残し、各rootの対象・contract oracle・未実行状態・row oracle欠落・test citation欠落は`unit_case_contract`へまとめた。未作成のrow oracle/test citationはnullと明示し、候補designは値を変えていない。

L5の`f03_head_connection_detail`は設計関数とhash観測の技術的説明を持つ一方、旧L8節は独立比較用の3ケース、8 Findingの照合境界、候補binding等を持つ。両節の意味・field集合が同一とは確認できないため、意味上の別節へ付替えず、L5の`oracle_location`を撤去前L8の固定revision・pointerへ束縛した。撤去前L8 file SHAとsection canonical SHAを記録し、旧L8を実行・期待・algorithm生成へ使わない境界を付けた。

## 旧HELIXと失敗事例

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/ddd-tdd-rules.md`（`LEGACY-ASSET-5E22432B0A5A8F7CC8B3`）、および旧 `root/docs/design/harness/L5-detailed-design/design-reality-binding.md`（`LEGACY-ASSET-70DA9B8C03E54A629039`）。対応する旧資産はL8の`source_pins`と既存`legacy_comparison`で照合した。保持するのは契約と期待を分け、期待の意味を薄めない点。変更するのはL8から実行用fixtureを外し、L7が契約から独立に期待を記述する境界。理由はDT-VT-105と#3510 comment 6447665479の層別責務である。旧runtime/test/CIは参照・実行していない。
- 現行の同種失敗事例: #3510 comment 6447665479は、副材料をtreeから外し、撤去元を記録し、L8/L9本体をallowlistで軽くしつつ小さな反例・期待を残す判断を記録する。
- 形の先例: #3988、#3911/#3924/#3929/#3930。L8の具体的な候補designと全IDは保持し、実行材料だけを縮約する。

## 静的照合

`verification-summary.json`に、撤去前pointer文字列の固定revision保持、35件の短文意味監査、RFC6901 numeric pointerの35件解決、撤去前後の35 U-ID照合、全5 candidate designのcanonical値照合、L9への35件のsource/expected pointer比較、L5の旧L8節binding、check-childのbefore/after、`scfctl validate`と`stale`を記録する。4つのWR243/WR249 validatorとWR253 U-ID表validatorは静的に実行した。旧runtime/test/CI/algorithmは実行しない。check-childのpair/pin検査はPASS。legacy 4-way row比較35件とL9の禁止byte-hash key35件は残り、L9は対象外で編集していない。
