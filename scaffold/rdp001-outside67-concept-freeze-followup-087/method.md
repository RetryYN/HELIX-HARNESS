# 方法

1. `origin/main` を fetch して `3cdde5dfedfc51ff7c757a2f5fb2eb11a3c6b64c` を確認し、SCF-B-0085 の 52 件を既済集合として照合しました。残余 15 件から昇順の 017／021／025／026／027 を選び、ID と source path の exact overlap がないことを確認しました。
2. outside67 holding `MPR-SH-OUTSIDE67-001` の該当行を読み、source path、artifact kind、pre/archive blob／bytes／SHA、`not_started`、catalog count、human decision の各値を保持しました。`57/67` と残 10 は正式 holding admission と分離した provisional research accounting です。
3. `2d4991042be55268bac30a8bbcdac45b3865030a`（pre-isolation）と `064280b5c1c5c98f949e6e3be5ef87cbe4a4b658`（archive）から git object を read-only で取得し、各 source 5 本、合計 25 本の exact line anchor と snapshot を保存しました。現行 counterpart は latest main の `docs/governance/audits/source-rebaseline/` 配下を read-only で照合しました。
4. pre/archive unified diff と current counterpart の hash／path relation を分け、017／025／026／027 の byte equality と 021 の content drift を記録しました。これらを semantic equivalence、authority、successor、owner、phase、implementation、degradation、failure、consumer、decision へ昇格していません。
5. legacy asset／decision／copy-read-after／phase-product／implementation／IR decomposition の 7 ledger を、選定 ID と source path の exact substring で走査しました。ヒット 0 は不在・完了・承認の証拠にせず、failure／consumer／decision は unknown のまま保持しました。

検証は本 bundle の static validator、自動生成された snapshot／digest、negative selfcheck、`scfctl` の Scaffold Binding 検査、`git diff --check` に限定します。archive 内の旧実行系は使いません。
