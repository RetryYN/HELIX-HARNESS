# Web文書統合の独立レビュー指摘対応（2026-10-04）

Claudeの[exact HEAD 596独立レビュー](https://github.com/RetryYN/HELIX-HARNESS/pull/2558#issuecomment-5970429336)のMinor 2件に対応した。Blocker/Majorは0件だったが、修正後HEADを再レビューへ渡す。

R2558-01はJSONL 215行/37行の区切りを基準main148と同じ書式へ戻した。JSON値は修正前と全件一致し、baseとの差はsource_location 15行とsource_path 15行の移動参照だけになった。両ファイルへのcurrent Binding upstream参照は0件なのでpin更新は不要。

R2558-02は10/03配置判断記録の検証節を、実測済みの監査MD/JSONへ参照する記述に直した。後から判断記録へ結果を追記する前提を削除し、PO原文・配置判断・移動対応表は変えていない。まだDraftである新記録の記述修正であり、9/26の確定判断記録はbytes不変。旧137実測監査は検証時点の記録として不変に保ち、そこにある旧decision SHAをcurrent SHAへ書き換えない。

Binding143件fail0、stale0、JSON値一致、diff検査合格。研究Pythonと入力inventoryは無変更なので全137実行を繰り返していない。対象は書式と説明に限る。旧HELIX起点と保持・変更の理由は10/03配置判断の旧asset/path/行の記録を継承し、旧runtime/test/CIを実行していない。旧・新の全ファイルSHAは同梱JSONに記録した。
