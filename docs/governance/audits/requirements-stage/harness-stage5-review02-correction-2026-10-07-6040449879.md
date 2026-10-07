# HARNESS Stage 5 review02 修正記録（#2655 / comment 6040449879）

対象HEAD `9add9f9c229c7ee0599768c5112e2129dfa1542d` の正式review commentを全文照合し、指摘3件とMinor 8件を固定L2/L11・旧sourceから再導出して、6本文へ修正候補を反映した。正式comment body SHA-256（UTF-8）: `fe82aa7f365093a5c49ce4acef78f8aa14ad7211b3265963ede20f62b73c83ce`。修正後の6本文SHAとsource full/span SHAは隣接JSONに固定した。

Major対応は、037 S5-059で根拠・適用限界のsource bindingと出力値一致をoracleに戻し、S5-060/061の単独欠落を維持したこと、037 AC-06/S5-059/063でL3要件承認とL2要求合意を区別したこと、025 S5-012を固定L2-026:542の「COREのBRAIN connector契約」に限定し、HELIXBRAIN-L2-030を正本としてowner責務カテゴリを明示したこと。connector identity自体の欠落はS5-002/014の別条件である。owner fixture値は合成値であり、実製品ownerを指定しない。

Minor対応は、025 AC-04へ要求採択・L2合意・L3承認の独立境界を反映しS5-065を追加、035 AC-10/11の実行許可と実装許可を分離、025 S5-012/013へ不適合分類を保持し、S5-013でL2-009 source-owner categoryを明示、S5-063でその既知categoryを保ったまま具体identity欠落だけをunknownとする。固定L2-037:787および対L11の契約owner返却を根拠化、AC参照をslash区切りに統一、business側へ025-S5-062/063/065と033-S5-043/044を追記、L11-035 locatorを492から491へ訂正した。既存CASE IDは維持し、欠番042–061を捏造・振替せず、明示グループと範囲表を照合した。

静的照合と `git diff --check` は通過した。fixture、test、旧CLI/runtime/CIは実行していない。独立reviewとOpus/Fable再照合、L3承認、commit/push/PR操作は未実施であり、authority effectはnone。


## Root追加検収の反映

FR-025不変条件も固定L2-025:552のCORE/Design Template/BRAIN connector三依存を別扱いし、今回のunknown変異は固定L2-026:542の「COREのBRAIN connector契約」だけを指すようAC-025-07/FV-S5-012と同期した。AC-037-06は設計承認・後続revisionのL3要件承認・実装許可の3出力状態だけを個別negative対象とし、L2要求合意との区別は説明にとどめた。

旧source pinを再照合した。025は旧multimodal design-authority文書と対応受入を近接比較例として実読したが、直接の旧汎用設計統合要求でもBRAIN connector owner根拠でもないため、その限界を明記した。037は旧FR-L1-28/画面・技術行/A-74、035は旧HIL-FR-38/HIL-NFR-07/23とHR/HAT/HSTの実際の根拠を再読・pinした。以前の旧L3 FR 574–610と旧test-design 121–126はRefactor範囲、HIL-FR-55はL2-043向けなので今回の旧source根拠から外した。正確なfile/span SHAと処置は追補JSONに記録した。
