# LABO Stage 5 review01 補正記録（作成側候補）

- PR: #2620 / comment 6004749682 / body SHA-256 `e8d66f7e9822733728e46ff9fc36f230578ce7265aabf7232562038da9e569fc`
- 固定basis: `633bf12ea8f948db8ba3d6600179c4a9507377a7`。旧本文HEAD: `e05bfbc6690497cc1e7016a40c280498530799ff`。補正文commit: `c704581e79f523d88e16b85f0c20f0f6f86b63e9`。
- authority effect: none。PO承認、独立review成立、実行合格、finding closureは生成していない。
- 最新main `8a763ce4211afa1ef2a7e54c209933a03e029243` は読取確認したが、この枝へmergeしていない。6 canonical full bytesは元d6基準と異なり、最新main integration/rechainはRootへ引き継ぐ。

## 実施と照合

- 固定親13件のL2 clause span、L11 identity行、PO decision行をmain633のGit bytesで照合。L2 span/full-file、L11 full-file/identity行、PO row/full-fileのraw LF SHAが一致。
- 旧source pins: full file 16件、bounded span 14件を固定revisionから再計算し一致。全spanで `1 ≤ start ≤ end ≤ 実ファイル行数` を確認。
- 071のA692 snapshotとL2-071:584をauthority/sourceとして区別し、A265のL3:78–79とE9D acceptance:44–47は比較専用として別pin。A265/E9Dを要求authorityとしていない。
- 6本文のmain prefix SHAは全件一致。補正文後の全bytes SHA・行数・prefix bytesはJSONに記録。
- 過去のroot-acceptance、body-supplement、root-followup、source-body auditとworker recordは作業開始HEADとbyte-identical。新しい行locator記録へ置換・追記し、既存監査は変更していない。

## CASE・traceの構造検査

- functional CASE表は 568行、CASE-01/02箇条書きは 26件、合計定義 594件。旧表412 IDを全て保持し、新表IDを156件追加。ID重複0。
- 表行のうち索引/aliasは64、非索引行は504。非索引行すべてが意味上独立fixtureだとは主張しない。索引参照先は全て解決。
- 表36ブロックを検査し、4列・header/separator不整合0。L10 case rowのAC ID参照はL3 FRに全て存在。NFR/BV/FR traceは物理行・LF込みSHAでJSONへ記録。
- 従来監査にあったCASE総数412（表のみ）と438（箇条書き込み）の差を明示した。今回の594は現在の表568＋箇条書き26の構造数であり、被覆・実行・承認数ではない。

## Finding disposition

Major 25件・Minor 20件それぞれの正式本文と対応候補領域をJSONへ保存した。全件のstatusは「作成側補正候補。Rootの意味/出典検収と独立review待ち」。解消済みとは扱わない。

## 静的検証

- `python3 scaffold/tools/scfctl.py validate`: bindings=147 fail=0
- `python3 scaffold/tools/scfctl.py stale`: stale=0
- `python3 scaffold/tools/scfctl.py residuals`: residuals=0
- `python3 scaffold/governance/tools/govcheck.py`: atoms=7622 requirements=57 files=58
- `git diff --check`: body correction commit has clean whitespace check

未実行: 旧runtime/test/CI/Bun。今回のCASEは設計記述であり、実fixtureを動かしていない。

## 未確認と限界

- source-body-auditの旧body_*_rows.lineは実ファイル行locatorとして使わず、全current CASE rowを現行物理行・LF込みSHAで固定し直した。
- 071の追加比較資料A265/E9Dは現行authorityではない。A692 source snapshotと固定L2-071:584を別に保ち、A265 L3:78–79・E9D acceptance:44–47は比較専用として実Git bytesをpinした。
- §24:785–800原文と固定L11:105–125を読み、063–066への適用は該当する既存親意味に限定。全§24項目を全13親の独立要件へ展開したとはしない。
- 旧full16/span14のbytes/boundsは再計算一致したが、旧source-use記録すべての用途説明を逐語的に再判定したとは主張しない。
- 追加CASEは未実行の設計であり、CASE/trace/referenceの静的接続は検査したが各oracleの実行成立や要求の独立review closureは確認していない。

push、PR更新、Ready、mergeは未実施。Rootがこの候補を全文検収する。
