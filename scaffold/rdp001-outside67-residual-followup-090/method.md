# 方法

1. `origin/main` を fetch して #2040 merge後の `a8f1ab1c7dce529cfb5293e1ddf4a23140877f22` を確認し、#2039 の旧base `44814977d9d9bf457b6be2184f38f25d4f9071ad` からrebaselineしました。SCF-B-0087 の 57 件を既済集合として照合し、残余 10 件から昇順の 028／039／040／042／044 を選び、ID と source path の exact overlap がないことを確認しました。
2. outside67 holding `MPR-SH-OUTSIDE67-001` の該当行を読み、source path、artifact kind、pre/archive blob／bytes／SHA、`not_started`、catalog count、human decision の各値を保持しました。`62/67` と残 5 は正式 holding admission と分離した provisional research accounting です。
3. `2d4991042be55268bac30a8bbcdac45b3865030a`（pre-isolation）と `064280b5c1c5c98f949e6e3be5ef87cbe4a4b658`（archive）から git object を read-only で取得し、各 source 5 本、合計 25 本の exact line anchor と snapshot を保存しました。現行 counterpart は latest main の `docs/governance/audits/source-rebaseline/` 配下を read-only で照合しました。
4. pre/archive unified diff と current counterpart の hash／path relation を分け、028／039／040／042／044 の byte equality と current relation を記録しました。これらを semantic equivalence、authority、successor、owner、phase、implementation、degradation、failure、consumer、decision へ昇格していません。
5. legacy asset／decision／copy-read-after／phase-product／implementation／IR decomposition の 7 ledger を、選定 ID と source path の exact substring で走査しました。ヒット 0 は不在・完了・承認の証拠にせず、failure／consumer／decision は unknown のまま保持しました。

検証は本 bundle の static validator、自動生成された snapshot／digest、negative selfcheck、`scfctl` の Scaffold Binding 検査、`git diff --check` に限定します。archive 内の旧実行系は使いません。
