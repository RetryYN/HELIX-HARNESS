# HARNESS・HELIX-OS・HELIX-Web要求配置監査

確認日: 2026-09-14。対象revision: 本branch HEADへ収載する差分。

## 判定基準

| owner | 所有する意味 |
|---|---|
| HELIX-HARNESS | V-model、layer／pair、工程、検証義務、進行・完了・受入条件、外部提供物の契約 |
| HELIX-OS | authority管理、管理・推進・検収、Worker、ticket、state、log、CI実行、crawler、診断、学習、配布・運用統制 |
| HELIX-Web | Connector型AI開発SaaSの利用者操作、ダッシュボード、接続、進行表示、サービス固有の受入 |

`owner`と`reference`を区別した。他対象の語が文書に現れるだけでは配置ミスとせず、その文書が意味の変更権限、
実行責務、利用者受入のどれを所有すると記述しているかで判定した。

## 監査結果

| 観点 | 判定 | 根拠 |
|---|---|---|
| HARNESS内のWorker・CI・log・学習語 | 適正 | 実行方式を所有せず、provider非依存の検証義務、工程状態、外部提供条件として参照している。実行統制は明示的にOSへ渡す |
| OS内のV-model・HARNESS契約語 | 1件是正後に適正 | OSは承認済み契約を適用する。`HELIXOS-L2-011`の「必要検証を算出」を、HARNESS契約から検証実行計画を導出する表現へ是正した |
| OS内の管理・推進・検収 | 適正 | `HELIXOS-L2-010`で役割責務を分け、固定モデル数・中央中継・別authority化を禁止している |
| Worker・Patch Bot | 適正 | Agentic Workerは有界実行、Patch Botは既存契約で正解とwrite-setが一意な限定修復としてOSへ配置。最終検収を分離する |
| Semantic CI | 適正 | 検証義務はHARNESS、profile生成・runner配車・実行・回収・再計画はOSへ分離している |
| crawler | 適正 | 内部／外部のread-only観測と未信頼情報境界をOSへ配置し、要求正本化と外部命令実行を禁止している |
| 診断・改善 | 適正 | 因果診断、是正ticket化、再観測はOS。製品要求の意味変更は対象上流へ返す |
| Web内のOS・HARNESS語 | 適正 | Web固有体験だけを所有し、HARNESS能力とOS統制は参照関係としている |
| GitHub Issue／PR | 適正 | 全対象で作業・協調・証拠projectionに限定し、要求意味・採否・受入のauthorityにしていない |

## 配置ミスの結論

primary ownerの誤配置は検出しなかった。意味上の曖昧さ1件を是正した。今後L3へ導出するときも、
HARNESSのoracle・完了条件をOSのscheduler、CI profile、検収ロジックへ複製して別正本を作らず、参照revisionへ
束縛する。Webのダッシュボード表示をOSの実行事実やHARNESSの受入判定そのものとして扱わない。

本監査は候補文書の静的意味配置を確認したものであり、要求承認、L3凍結、実装、L11実行、旧資産退役を完了させない。
