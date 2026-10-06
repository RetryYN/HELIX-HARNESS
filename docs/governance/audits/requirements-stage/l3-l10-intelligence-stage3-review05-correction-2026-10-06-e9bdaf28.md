# #2607 review05 補正記録 — 2026-10-06

正式指摘 comment `6001540479` の本文SHA-256は `d1be871000505a4b74a3109dd238b888dbe3d3bd2043c5330d7b813f20b5161b`。本文補正は `e9bdaf283569759e37a52ef57e34cc05ea4a2640` に固定した。これは作成側の修正候補であり、Rootの意味検収と独立reviewは未完了である。

## 本文・集合の確認

対象6文書はすべてbase `5acae384305b01d10e88eeb2e6406f847baf66df` の全bytesをprefixとして保持する。変更はFRとFVの2文書で、現行全6文書のSHA、本文追加行、変更fixtureの6列、raw-LF行SHAを同梱JSONへ記録した。

FVの `| ` 始まりの対象追補CASE行は `901` から `904`。これは表記を限定した対象集合であり、全CASE数ではない。空白形式を問わない全L10 table rowsは親HEADで FV/BV/NV `920/22/22`（計 `964`）、現在は `923/22/22`（計 `967`）。見出し形式のCASE宣言は0件。前回監査の959件と途中報告の961件は、901/904追補行集合とも全表定義数とも異なる不完全な集計として訂正し、正式review05のHEAD=964と本追補のcurrent=967を区別した。

CASE ID比較では前HEADから旧 `...005-brain-input-missing-provenance` を除き、data-use未提供normal、提供済みdata-use欠落、source trace到達不能を独立にした。よって正常なsource非提供と提供済みprovenance/source-trace異常のnegativeは両方別IDで残る。同様に014単独scope-outside fixtureと072新revision normalを追加した。CASE重複とdangling AC参照は0。072の同一版 `pack-P@r1` normalと新revision `pack-P@r2` normalはFV 1124–1125で別々に保持した。016-40の失敗先はoracleだけから推測せず、原因・既存責務を照合できない入力では戻し先unknownを保持する。R-07 receipt欠落は拒否fixtureとして明記した。

## 指摘の対応候補

Major 6件、Minor 20件を、各FR/AC、実際のFV CASE IDまたはsource disposition行へ結び付けた対応候補としてJSONの `finding_dispositions` に記録した。M1はBRAIN sourceがdata-use classを提供しない正常入力と、提供済み値・原source traceの個別不足を分離した。M2/M3は単独変異へ戻し、M4/M5は固定ownerへ戻し先を絞った。M6はL11 R-07 rejectionと一致させた。m16では同一版再評価と新revision再評価を統合・置換していない。

過去auditのm3/m4/m20にある誤ったsource用途・未pin主張・finding範囲説明は変更せず、本追補で訂正した。固定sourceと旧sourceのfull SHA、非空raw-LF span SHA、実literal、register row SHAはJSONに収録した。後継registerはmetadata-onlyで `registered_proposal` / `authority_effect:none` のまま扱い、採択や追加gateを推論していない。

## 限界

旧sourceの逐行未読範囲、078全218行の逐行意味review、残るregistration rows、最新mainとの統合後stale検査は未完として引き継ぐ。CASE identity比較は初期content HEAD `7e8c43a6d03b36f1ee36f7510c918413719cabdc` から最終本文commit `e9bdaf283569759e37a52ef57e34cc05ea4a2640` の全table rowを基準に行い、ID deltaと各変更fixtureをJSONへ記録した。旧CLI/runtime/test/CI、Bunは実行していない。独立review、Root acceptance、実行挙動の検証をこの記録は主張しない。
