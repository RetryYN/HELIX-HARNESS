# WR259 HARNESS-048 L9 oracle allowlist整理

status: scaffold（静的な文書整理。要求・承認・実行結果を生成しない）
authority_effect: none

## 保持した内容

固定base `fe79e0004d8164bffc4be7c8c31dd9e14da2ead3` のL9 `concrete_cases` 59件を、QAのL4契約と番号付きsystem oracleを参照する短い実行境界allowlistへ整理した。case IDと順序、既存L3/L4/L10参照、元`basis`が示す性質、未実行状態、短い条件・期待観測・元sourceに明記された返却先を行ごとに照合する。

元の59 caseにはtop-level `code`、`condition`、`axis`、`state`、`backflow_owner`が存在しない。従って、これらのsource fieldの差分保持は主張しない。新しいcode/axis/state/backflow ownerも生成していない。各行の日本語`condition`は差分対象と欠落・競合・role/consumer/edgeの意味だけを示し、raw値やbefore/after値を含めない。正常行も意味のある基準条件を示す。F01ではOBJ-PのQueryとOBJ-RのRepositoryを分けて保持する。`expected_observation`は行固有の判定だけとし、共通の非生成・無影響範囲はobligationの`shared_oracle_boundary`へ一度記録する。F02の共通返却記述とF03の共通作成側返却もobligation単位に置く。validatorは固定L9のraw packetと`expected_material`から59行の日本語要約・共有境界を再導出し、英語の説明文、raw before/after、全projectionが残っていないことを検査する。L3/L4契約・固定L10 oracleとの参照と返却意味も照合する。`oracle_property`は元`basis`を保持し、L8はID・requirement・oracle参照の照合だけに用いる。

各branchに重複していた承認済みL10オブジェクト5件は削除し、既存`system_oracle_ref`と数値JSON Pointerへ置換した。validatorはpointer先がbase固定L10の対象ID、requirement、`not_executed`に一致することを確認する。10件のauthority `source_pins`、legacy comparison、goal scopeは固定baseと値一致する。

59件の`independent_source_packet`（raw UTF-8 fixture・hashを含む）と`expected_material`の詳細な返却・副作用構造を削除した。`removed_materials`は固定baseのold materialを6 keyで指し、DT-VT-105の用途、撤去内容、sourceにないfieldを明示する。現行L9は194,059 bytesから72,568 bytes（62.61%）へ縮小している。

## consumerと固定参照

L5の37個のL9 literal/output pointerは全て調査した。各pointerは既存の`source_revision=b52ad0e1e954790ebe57b2d87da46ea6712a07d9`で解決し、canonical value hashが固定revisionの値に一致する。これらの意味と固定source参照は保持した。L8に直接のL9 pointerはない。

WR251の`SCF-B-0211`は過去の時点証拠を変更せず、現行L9 upstream hashへのrebind情報を追記した。SCF-B-0222には各追補証拠を登録する。過去の監査・測定snapshotを上書きせず、今回の追補を別ファイルに記録する。証拠ファイルのSHA-256、作成commit、同一hashの重複名、git履歴からの復元手順は`evidence-history-index-r2.json`で追跡する。初回check-child名とr2はSHA-256が同一。旧名のfileは削除せず、正規artifactをr2に固定して旧名はbinding一覧から外す。ハッシュと復元コマンドは同indexに記録した。

## 旧sourceと失敗起点

旧sourceは`LEGACY-ASSET-719D5EC9C06FC4AAD0FF`、`archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:130,204`（HIL-FR-40、HIL-NFR-24）である。object identity・role・consumer・canonical term・symbol/oracleの独立edge、文字列類似だけでrenameしないこと、signature・behavior・rollbackの照合を保持する。旧のlayer/gateや実行材料は移していない。現行`legacy_comparison`の17 clause spanは固定source bytesとの比較記録として変更していない。

失敗起点は#4005 R1 F1（hash field撤去だけではfixture本体が残り、L9が0.5%しか縮まらなかった）と、その解消内容を独立確認したR2 no_findingsである。fixture/raw/full return/hash・変異のbefore/after残留と参照切れを確認する。

## 検証と境界

`validate_l9_slim.py`は固定baseの元caseから59件を行別に再導出し、ID・順序・basis・差分対象・状態判定・返却先・source field不在、要約文の日本語、raw値/before-after/full projectionの不在、L3/L4/L10参照、L10数値pointer、L8の限定的crosscheck、L5の37固定revision pointerを検査する。最新merge overlayの測定は`validation-results-r9.json`と`merge-overlay-check-child-r7.json`に記録した。対象は`origin/main=6a7fbfbe134e9163976fa67319044fa0bc03973f`とbranch commit `f940563edbc38f46cc3575527aaed9189c9563bf`の合成tree `4a9de7061c6c9482e874c0d71701de0a93611722`。

`scfctl validate`、`scfctl stale`、`design_verification_checker.py check-child`はmerge overlayで実測する。check-childの`not_evaluated`や既存negative結果を成功へ読み替えない。上流整理の静的照合だけを行い、旧runtime/test/CI、L4/L5 algorithm、製品testは実行しない。実fixture、実観測、formal verification、承認、実装ready、完了状態を生成しない。
