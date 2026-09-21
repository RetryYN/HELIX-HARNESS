# Wave20 旧HELIX要求直接semantic review method（schema10）

## 対象と固定系譜

Wave20は旧archiveを静的read-onlyで参照する research-premise candidate の独立下書きです。worktreeは `/home/tenni/.helix-worktrees/legacy-semantic-review-wave20`、tree／parentは `9573119070cdf8f1f70e368bc310f575e8a3538c` です。main merge parentsは `4c6740f106e9d71c72c3b9888123335bc0482417` とWave19 exact HEAD `609338f19a6189b76f4e03a39fa0a2823ffadbf6` です。Wave1–19のledger/metaは固定入力としてdigestを再計算します。

Wave19のROW_FIELDS、META_FIELDS、要求atom source grounding、候補atom完全一致、bounded receipt、meta.inputs閉包、row atomization hold接続をそのまま継承し、Wave20の選定4 unitとWave19 prior batchを追加します。新しい判定機構、旧runtime、旧test、旧CIは使いません。

## 選定と証拠の扱い

旧要求product-unit decompositionから、未reviewかつ隣接した BR25、BR26、BR27 を選びます。BR26はHARNESS／OSの責務splitを保持します。各unitについて要求asset 1、design candidate 1、implementation_source candidate 1の3 edgeを作ります。candidate assetはcatalog role・phase候補・bounded anchor excerptの一致を記録するだけで、現行設計、現行実装、実行完了、consumer closureを主張しません。

要求rowは `requirements-ir/requirements.json` と raw markdown の同一要求IDを照合します。atomの `source_fragments` は選択IR/raw excerpt内に完全に存在させます。candidate rowのatom objectは対応する要求rowから完全一致で複製し、controlled term bindingは選択excerpt内の語彙に閉じます。

phaseはcrosswalkの `direct_phase_candidates` と `phase_capability_evidence` を投影します。phase採否、authority、implementation成立はここから生成しません。全rowの `authority_effect=none`、`consumer_closure_status=pending`、`legacy_execution_status=not_run`、`new_build_allowed=false` を保持します。

BR26のatomは接続語を含む完全句として保持します。HARNESSのAuthoring／Canonical admission、OSのpolicy内自動確定／escalationはそれぞれ1 atomに統合し、元source spanを複数fragmentとして検証します。

## 4製品境界

評価対象の製品集合は `HELIX-HARNESS`、`HELIX-OS`、`HELIX-Web`、`HELIX-Web-OS` です。今回の旧decompositionにはWeb／Web-OSのcandidate unitがないため、Web製品unitやedgeは捏造せず、境界判断を未確定として保持します。HARNESS／OSのBR26 splitも採否済み責務とは扱いません。

## 陰性検証

ROW_FIELDSへの未知key、要求atomのsource grounding欠落、候補atom本文の改変、stale anchor、anchor mapping欠落、candidate receiptの候補件数改竄を拒否します。JSONL/metaのdigest、prior batch、candidate search、crosswalk phase pool、archive source SHAも再計算します。
