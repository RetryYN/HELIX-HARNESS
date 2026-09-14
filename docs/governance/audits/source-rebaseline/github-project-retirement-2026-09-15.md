# 旧GitHub Project退役記録

status: projection_retired
project: `RetryYN Project #1`
project_id: `PVT_kwHOB9M2Ns4BJ6E0`
url: `https://github.com/users/RetryYN/projects/1`
item_inventory: `github-project-1-item-inventory.jsonl`

## 理由

Project #1は旧HELIX-HARNESSのIssue／PR進捗を表示するread-side projectionである。旧Issue 488件のcloseにより組込みautomationが
166 itemを`Done`へ変更し、新世代では完了を意味しない表示が残った。GitHubを要求正本や完了判定へ使わないため、Projectを
削除せずcloseし、全itemをhistorical sourceとして保持する。

## 実行とread-after

| 項目 | 記録 |
|---|---|
| 実施runtime／account | Codex hosted chat runtime、GitHub CLI、`RetryYN` |
| authority basis | 上流再整理で旧Issue等を潰してクリーン出発する先行指示と、GitHubを要求正本にしない方針。Project closeは可逆なprojection退役 |
| read-before | `closed=false`、private、field 13、item 210、全item Status=`Done` |
| item構成 | Issue／PR等210件。item ID、content、body digest、label、Statusを明細へ固定 |
| operation | `gh project close 1 --owner RetryYN` |
| read-after | `closed=true`、field 13、item 210。Projectとitemを削除していない |
| semantic effect | なし。全itemを`semantic_disposition=unresolved`、`requirement_authority=false`として保持 |

Projectは`gh project close 1 --owner RetryYN --undo`でreopenできる。ただし新世代projectionの設計前に旧boardを再有効化しない。
Issue close時のStatus変更event、通知、失われた変更前Statusはreopenしても復元されない。新世代dashboard／Projectは、承認済み
HELIX-OS要求から別identityとして再導出する。
