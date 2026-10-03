# 調査方法

1. `origin/main` を fetch し、`72b9f368a044709437841c5e862f01802b1a88ec` を固定baseとして独立worktreeを作成した。holdingの67行から PATH011–015だけを選び、残り62件を未選択残差として記録した。
2. holdingに記録された pre-isolation commit `2d4991042be55268bac30a8bbcdac45b3865030a` と archive commit `064280b5c1c5c98f949e6e3be5ef87cbe4a4b658` の同一source pathを `git show` で静的取得し、blob OID、bytes、SHA-256、行数、source snapshotを照合した。revision差分の意味同値は判定していない。
3. pre/archiveのSequenceMatcher対応を使い、各revision側の各行を一度だけcoverageへ記録した。冒頭marker・key形式・閉じmarkerを満たすfrontmatterは全PATHでmetadataとし、equalでsource行が非metadataなら候補へ、表の内容・複数責務・置換／挿入／削除行は `composite_unresolved` へ残した。両revision側の規範行をmetadataへ分類しない負例を固定した。
4. PATH011の既存束にある40 `atomized_candidate`は、元JSONのcanonical digestを再計算して参照行へ登録した。frontmatterとline 13を含むexcluded atomは再利用せず、PATH011のatomを新規ファイルへコピーしない。既存ID・source line・category・source bundle・digestの一致とcoverageのatomized_candidate↔atom_ids双方向整合をvalidatorで要求した。PATH012–015では同一pre/archive lineだけを185件の新規候補へ固定し、actor／condition／sequence等は推論せずunknownへ置いた。
5. `source-diffs.json`は10 snapshotのPRE／ARCH line列からstatus、hunks、hunk_count、unified diffを再導出し、meaning equivalenceの昇格を拒否する。validatorはsource snapshotと差分recordの一致を再計算し、selfcheckはstatus／hunks／meaning equivalenceの3負例を検査する。
6. current counterpartはbase時点で観測できる移設先だけを記録した。旧ledger 7ファイルはbase時点のdigestと、source item／path／blobのexact anchorを再導出し、hit/no-hitとimplementation／degradation／failure／consumer／decision unknownを分離した。
7. inventory・selected rows・snapshots・atoms・coverage・legacy evidenceのkeyset、digest、カテゴリ、四製品境界、authority none、未選択残差をvalidatorで検査し、独立coverage-auditとnegative selfcheckを実行する。
