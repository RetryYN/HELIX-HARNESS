# LABO Stage2b 先行4親の主査検収

本文 `4b111545f0658fe825cfbfab21924e41c5af2e6d`、002/003/004/005の1.0候補草稿です。

観測から部分episodeを作り、根拠付きの分類、七軸比較、12種の変更候補へつなぐ条件と対の検証を具体化しました。未発生stageを生成せず、不足・反証・依存版違いを元ownerへ返します。機構追加数を増やすことや減らすこと自体を改善尺度にしません。

主査8指摘の修正を読み、依存と各fieldの個別反例、元source非更新、候補の非自動採択を照合しました。技術候補は必須trace保持100%、分類9/9・比較7/7・operation12/12と、p50/p95・items/secondの測定案です。field存在だけの部分trace案との比較、計画分母を保持する集計を設計しています。可観測とoracle合格を分け、正の観測時間で処理件数0を真の0、欠測を算出不能とします。製品SLAではありません。

FR4/AC12/機能CASE40、NFR候補6行・測定6行、独立BR0。source28件と追加依存2spanの全文/raw SHA、6prefix不変、全573行pinを主査照合。Worker静的検証147/fail0・stale0・residuals0・govcheck7622/57/58、主査diff check合格。

Claude正式review・PO L3承認は未成立です。L10実行・実測・下流実装は行っていません。旧immutable監査を保存し、今回本文のSHAは[l3-l10-labo-stage2b-first-four-root-validation-2026-10-05-4b111545f.json](l3-l10-labo-stage2b-first-four-root-validation-2026-10-05-4b111545f.json)で固定しています。
