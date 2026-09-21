# Wave21 旧HELIX要求直接semantic review method（schema10）

## 対象と固定系譜

Wave21は旧archiveを静的read-onlyで参照する research-premise candidate の下書きです。独立worktreeは `/home/tenni/.helix-worktrees/legacy-semantic-review-wave21`、最終baselineは origin/main `053943791ceda83366fca01d375308ba5f7deb28` です。main merge parentsは `2ec95d10d7233cbf64782f6120ffcb7ad150242a` と `1041f07d29a8cf8b55a55ee2ee11c378f683dd88` です。Wave20のcorrected exact HEADは `68ab10163fe0b6025dd56fa5d34cd476f6110494`、そのparentは `d9d1f3d8c9521314ba6ec73d9d877390defaf00c` です。

この下書きはWave1–20をprior batchとして、現行main上のファイルからdigestを再計算します。meta statusは `candidate_pending_independent_review` とし、Wave20 exact HEAD・parent、prior batch 20件、45 input path、現行main lineageを固定しました。

Wave19のROW_FIELDS、META_FIELDS、要求atom source grounding、候補atom完全一致、bounded receipt、meta.inputs閉包、row atomization hold接続を継承します。Wave20 corrected verifierで復元されたmissing receipt role closureの実呼出しと7つのfail-close陰性ケースも機械的に継承します。旧runtime、旧test、旧CIは実行しません。

## 選定と証拠の扱い

未reviewの連続要求 BR28–BR30から、BR28-HARNESS、BR29-HARNESS／OS、BR30-HARNESS／OSを選びます。Design Contract Portfolioのstyle／layer接続、judgment packのreview gate、専門agent contractの生成とruntime projectionが連続するため、この5 unitを一つの候補群にします。BR29のHARNESS／OS共有atomは両側に完全句で保持します。BR30-A02だけを共有atomとして保持し、BR30-HARNESS-A01末尾のruntime projectionとBR30-OS-A01の重複は、上流decompositionに明示connectorがないため未解決connector gapとして記録します。A01のowner、境界、lossless split、OS単独成立は主張しません。

各unitは要求asset 1、design candidate 1、implementation_source candidate 1の3 edgeです。candidate assetはcatalog role・phase候補・bounded anchor excerptの一致だけを記録し、現行設計、現行実装、実行完了、consumer closure、authorityを主張しません。要求rowのatom textは選択IR/raw excerptのliteral substringへ接地し、各source_fragmentsはunitのsource_text_spansへspan indexで固定します。BR30-HARNESS-A01はHARNESS側のbounded fragmentへ、BR30-OS-A01はruntime projectionのliteral fragmentへ切り分け、A01 connectorは未解決のまま保持します。

## 製品境界

評価集合は `HELIX-HARNESS`、`HELIX-OS`、`HELIX-Web`、`HELIX-Web-OS` です。旧decompositionで今回選定された候補はHARNESS／OSのみです。Web／Web-OSのunitやedgeは捏造せず、境界判断を未確定として保持します。

## 陰性検証

ROW_FIELDS未知key、stale anchor、anchor mapping欠落、参照外excerpt、row admission claim、要求atom grounding改竄、candidate atom本文改竄、forged missing receiptを拒否します。要求IR/raw、asset source SHA、crosswalk phase pool、bounded search、prior batch、meta.inputsを再計算します。BR30-A02の共有atom textは完全句で保持し、HARNESS／OS各側のsource_fragmentsは自身のunit spanへ限定します。未知row key、atom text改竄、source span外fragment、BR30 A01 connectorの欠落を拒否します。
