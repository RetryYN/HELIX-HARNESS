# 旧世代open Issue退役記録

status: projection_retired
repository: `RetryYN/HELIX-HARNESS`
source_count: 488
inventory: `github-open-issue-retirement-inventory.jsonl`
comment_count: 1330
comment_inventory: `github-issue-comment-retirement-inventory.jsonl`

## 目的

旧世代のIssue backlogを新世代要求へ自動継承せず、GitHubを要求正本にしない状態へ移す。Issue本文の意味を却下せず、
各Issueをhistorical source projectionとして追跡可能にした上でGitHub側のopen状態だけを閉じる。

## 閉鎖の意味

- GitHub Issueは`state=closed`、`state_reason=not_planned`へ変更する。
- `not_planned`は旧世代projectionを新世代backlogとして実行しない意味であり、要求候補の棄却、実装完了、受入完了ではない。
- 明細台帳の`semantic_disposition`は全件`unresolved`とし、対象別L2での採否まで維持する。
- Issue番号、title、URL、label、作成・更新時点、本文SHA-256をローカル明細へ固定する。1,330コメントもcomment ID、
  Issue番号、URL、作成・更新時点、本文SHA-256を別明細へ固定する。本文・comment自体はGitHubのclosed historical sourceとして保持する。
- 新世代の作業が必要になった場合は旧Issueをreopenせず、承認済み上流revisionから新しい作業契約を作り、
  `local_adoption_ref`で旧sourceへ接続する。

## 対象外

- Draft PR #1797と、そのGitHub Claude review comment。
- Concept／L1／L2／L11の採否、要求意味の変更、archive資産の物理削除。
- 新世代Issueの起票。新世代作業契約の形式は上流承認後にHELIX-OS要求から導出する。

## 完了条件

1. 事前open集合と明細台帳が488/488で一致する。
2. 各行のIssue番号が一意で、本文digestとGitHub read-beforeが一致する。
3. close後のopen Issueが0件である。
4. close後の各Issueが`closed / not_planned`である。
5. 明細台帳の`semantic_disposition=unresolved`と`requirement_authority=false`を維持する。

閉鎖操作はGitHub projectionだけを変更する。旧workflow、旧CI、旧runtimeは使用しなかった。GitHub Project #1の組込み
automationはIssue closeに反応し、166 itemのStatusを`Done`へ変更した。このprojection副作用は下記へ記録する。

## 実行結果

2026-09-15に事前open集合488件を`closed / not_planned`へ変更した。API mutationは488/488成功した。独立した
read-afterではopen Issue 0件、対象488/488件が`closed / not_planned`、`closed_at`ありだった。閉鎖前後の本文SHA-256は
488/488一致した。対象Issueに属するコメントは279 Issue、1,330件で、ID重複0件としてcomment明細へ固定した。

この結果はGitHub projectionの退役だけを閉じる。488件と1,330コメントの意味採否は全件`unresolved`であり、
対象別L2へ採択済み、不要、実装済み、受入済みとは扱わない。

## 外部操作記録

| 項目 | 記録 |
|---|---|
| 実施runtime | Codex hosted chat runtimeからGitHub CLIのREST APIを使用 |
| GitHub account | `RetryYN`。read-afterの`closed_by`も488/488件で一致 |
| authorization actor | PO `RetryYN` |
| authorization basis | 本sessionでread-before／mutationより前に示された2026-09-14 JSTの「イシューとかも潰してクリーン出発がいい」。chat transcriptはexact wall-clockを提供しないためsession順序で記録 |
| 直前の問いかけ | 2026-09-15 JSTの「イシューとかどうする？潰す？」は実行直前の確認の問いかけとして記録し、単独のaction-binding approvalとは扱わない。可逆な旧projection整理として先行指示のscope内で実行 |
| target／scope | `RetryYN/HELIX-HARNESS`でread-before時点にopenだった旧世代Issue 488件。Draft PR #1797、closed Issue、要求意味は対象外 |
| operation | 各番号へ`PATCH /repos/RetryYN/HELIX-HARNESS/issues/{number}`、`state=closed`、`state_reason=not_planned` |
| mutation time | `closed_at`のUTC範囲: `2026-09-14T16:10:16Z`〜`2026-09-14T16:11:19Z`。JSTでは2026-09-15 |
| mutation result | 488件実行、成功488、失敗0 |
| read-after | 各488件を個別GETし、state、state reason、closed_at、本文SHA-256、comment countを照合。open検索0件 |
| evidence | Issue明細488行、comment明細1,330行、本記録、GitHub各Issue timeline |

Issue closeと同じUTC時間帯に、actor `github-project-automation[bot]`がProject #1の166 itemを`Done`へ変更した。
対象166件はすべて退役Issue明細内で、別1件はclose前から`Done`だった。変更前StatusはGitHub eventにもローカルにも
記録されておらず復元不能である。Project上の`Done`は実装完了、受入、要求棄却、上流承認の証拠にしない。

操作はIssueごとに`PATCH ... state=open`でreopenできる。ただしreopenは旧backlogを再有効化する外部変更なので、現在の
上流方針から自動実行せず、新しい人間指示へ束縛する。close時に生成されたGitHub timeline eventとwatcher通知はreopenしても
消去・巻戻しできず、Project Statusも元の値へ自動復元されない。閉鎖中も本文、comment、添付URL、timelineはGitHub
historical sourceとして参照できる。
