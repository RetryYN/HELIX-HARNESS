# 方法

1. #2039 の exact reviewed HEAD `ad11da4a854e1a25a1cb0663450d54cce0e8684c` が main merge HEAD `36accee66242338ded01dcc24d44148faadd3045` に含まれることを確認しました。SCF-B-0090 の 62 件を既済集合として照合し、最後の残余 5 件 048／049／050／051／053 を選び、ID と source path の exact overlap がないことを確認しました。parent lineageまたはmerged main HEADが変わった場合は停止してrebaselineします。
2. outside67 holding `MPR-SH-OUTSIDE67-001` の該当行を読み、source path、artifact kind、pre/archive blob／bytes／SHA、`not_started`、catalog count、human decision の各値を保持しました。`67/67` と残 0 は正式 holding admission と分離した provisional path research accounting です。
3. `2d4991042be55268bac30a8bbcdac45b3865030a`（pre-isolation）と `064280b5c1c5c98f949e6e3be5ef87cbe4a4b658`（archive）から git object を read-only で取得し、各 source 5 本、合計 25 本の exact line anchor と snapshot を保存しました。現行 counterpart は latest main の `docs/governance/audits/source-rebaseline/` 配下を read-only で照合しました。
4. pre/archive unified diff と current counterpart の hash／path relation を分け、048／050／051／053 の different、049 の same、および current relation を記録しました。これらを semantic equivalence、authority、successor、owner、phase、implementation、degradation、failure、consumer、decision へ昇格していません。
5. legacy asset／decision／copy-read-after／phase-product／implementation／IR decomposition の 7 ledger を、選定 ID と source path の exact substring で走査しました。ヒット 0 は不在・完了・承認の証拠にせず、failure／consumer／decision は unknown のまま保持しました。

検証は本 bundle の static validator、自動生成された snapshot／digest、negative selfcheck、`scfctl` の Scaffold Binding 検査、`git diff --check` に限定します。archive 内の旧実行系は使いません。
