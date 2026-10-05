# #2613 review04 修正追補監査

- Formal comment `6001590184`: `/tmp/pr2613-review04-formal.md`, SHA-256 `f7257fd77722b063a6c0c91b17adf7db704a9ff98b259a6f427aed6f70a4e11f`.
- Base `5acae384305b01d10e88eeb2e6406f847baf66df`、本文修正 commit `68fa51342090e314a6613525dff3c218a0848dbc`。
- Findings: Major 1、Minor 4、Blocker 0。6本文はbase prefixを完全保持。

## 所見

- **M1（major）— addressed**: PoC Backflowのfailure/timeout欠落とowner/re-entry欠落を独立単変異CASEとして追加。前者はPoC結果state unknown/holdで要求ownerへ戻し、後者は形成根拠不足として要求ownerへ戻す。補完しない。 根拠: `CASE-HARNESS-L10-024-R087`, `CASE-HARNESS-L10-024-R088`, `AC-HARNESS-L3-024-06`.
- **m1（minor）— addressed**: R050–R055で変異対象をother owner-defined fieldsから除外し、他値を保持する単変異として修正。 根拠: `CASE-HARNESS-L10-018-R50`, `CASE-HARNESS-L10-018-R51`, `CASE-HARNESS-L10-018-R52`, `CASE-HARNESS-L10-018-R53`, `CASE-HARNESS-L10-018-R54`, `CASE-HARNESS-L10-018-R55`.
- **m2（minor）— addressed**: 020見出しを固定L2の接続・受渡し意味に合わせ「隣接リリース単位間の接続契約」へ修正。 根拠: `FR-HARNESS-L3-020 heading`.
- **m3（minor）— addressed**: L2-010のパラフレーズを原文引用と誤認させないよう、要約であり原文引用ではないと明記。 根拠: `AC-HARNESS-L3-020-02`.
- **m4（minor）— addressed**: 意味のない行番号由来fixture labelを、authority誤認の対象を説明するlabelへ変更。 根拠: `CASE-HARNESS-L10-024-R64`, `CASE-HARNESS-L10-024-R65`, `CASE-HARNESS-L10-024-R66`.

## 根拠と静的検証

固定L2/L11 revisionは `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2-024 lines 499–521 と L11-024 lines 235–260 をfull-file SHA、raw-LF span SHA、literalでJSONへ固定した。旧sourceは台帳の該当行もfull-file/line SHAとliteralで固定し、asset `LEGACY-ASSET-E78B8D68CC327AA00991`（RDJ-FR-004/007 lines 48–52）と `LEGACY-ASSET-AD746F4F3487103519F9`（RDJ-AC-004/007 lines 22–26）をbase archive revisionから固定した。旧runtime等は移植・実行していない。

5親017/018/019/020/024のFV CASE定義は208行、重複0。親別件数は `017=19, 018=55, 019=23, 020=23, 024=88`。参照ACはFRに存在しdangling 0。6本文のfull/prefix/suffix SHAと各CASE literal/raw-LF SHAをJSONに記録。git diff --checkは本文commit前にpass。

## 未確認範囲

L2-013の独立service例適合性、020のreturn destinationに関する追加の旧source根拠、追加Reverse source familyの網羅、最新main統合木のstale確認は本追補で解消していない。既存の限定read範囲を継承し、Rootの検収・統合検証へ残す。既存監査12件は再hash一致し、変更していない。

旧CLI/runtime/test/CI/Bunとrepository CI、push/PR/Ready/mergeは実施していない。
