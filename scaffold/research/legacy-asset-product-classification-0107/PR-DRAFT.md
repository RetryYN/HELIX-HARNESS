# Wave1–50 unresolved legacy asset product classification research

Wave1–50で参照された355 unique旧assetとphase product classification unresolved 64件の交差を、固定BASE `5562f04da0f3205f9aa58205ec0d478419fc4f2e` から静的再導出する `SCF-B-0107` Scaffoldを追加する。

成果は単一製品候補の直接根拠56件、複数製品競合5件、根拠不足3件に分け、旧asset sourceのGit object/blob/bytes/digest、Wave semantic link、unit候補、四製品boundary/L1、旧decision／failure／consumer状態を記録する。対象assetのsemantic linkはunresolved-only 61件、rejected-only 3件、confirmedを含むassetは0件であり、rejected-onlyは隣接unitの製品scopeを観測counter-evidenceとして保持するが、asset `candidate_products=[]` として候補継承しない。semantic linkが未承認であること、旧asset台帳のdispositionがunresolvedであること、正式owner／authority／phase admission／successor／consumer closureが未決であることを各recordに保持する。

検証済み分母は598 Wave edge、355 unique旧asset、64 target asset、target edge 70である。対象asset単位のartifact evidence kindはimplementation_source 55、design 8、plan 1、対象edge単位のsemantic link statusはunresolved 65、rejected 5である。validatorは固定BASE祖先性、input path集合とdigest、64件exact set、edge欠落／重複、source line/blob/digest、candidate product導出、四製品境界行digest、record key集合、inventoryの権限・分類規則・各分母の導出をfail-closedに検査する。selfcheckは17 negative casesを期待error code照合付きでPASSした。

正式asset分類、既存phase台帳、product route、successor、new buildは変更しない。旧archive runtime／test／CIは実行していない。

Progress reference: Issue #1813（closeは行わない）。#2056のレビュー結果に依存する変更は含めない。
