# GitHub上流運用モデル

status: bootstrap_candidate
generation: new-generation-2026-09-14
local_authority: repository documents at exact revision
github_role: work_review_evidence_projection

## 目的

GitHubのIssue、PR、label、checkを追いかけて要求を推定する運用をやめ、ローカル上流からGitHub上の作業を
再生成できる状態を作る。本書は新世代repositoryを整理した後に要求を一件ずつ詰め、設計・検証・実装へ
順に降ろすための運用上流である。

## authority順序

1. 人間が示したConcept、Vision、企画、指示と対象revision。
2. 判断論点、前提確認research、known／assumption／unknown／conflict／staleを持つpremise packet。
3. 要求探索research、限定PoC、prototype、人間反応の比較結果と要求候補。
4. repo-owned対象別L2要求と対になるL11、および旧要求からの無損失carry-forward記録。
5. L3設計と対になるL10、以降の正規V-pair。
6. repo-owned Feature Ticketと変更契約。
7. GitHub Issue、PR、review、check、Project等のprojection。

下位projectionから上位の要求意味、採否、承認、完了を生成しない。GitHub上の状態が失われても、承認済みlocal sourceと
投影記録から未完作業を再構築できることを運用成立条件とする。

## PR classとscope

| PR class | 一つのPRが扱うもの | 必須入力 | mergeで成立するもの | mergeで成立しないもの |
|---|---|---|---|---|
| `repository_foundation` | 旧世代archive隔離、新世代物理構成、authority・GitHub運用規則 | archive manifest、対象構成、運用上流 | 新世代を整理・reviewするrepository基盤 | 個別要求の承認、L3、実装、CI、製品完成 |
| `research_premise` | 一つの判断論点に対する前提確認または要求探索research | 親Concept／Vision／企画revision、調査scope、必要証拠 | 出典・版・時点・適用条件・限界・反例付きpremise packet | 要求採用、技術採用、実装許可 |
| `requirement` | 一つの要求identityと対になるL11。分割が必要なら同じPR内で子identityを確定してから別PRへ分ける | 親Concept／L1 exact revision、source、対象product、要求kind | 判断記録に束縛した要求revision | 他要求、設計方式、実装、CI、受入pass |
| `design_verification` | 一つの承認要求に対するL3とL10、または後続の一つのV-pair | 承認要求revision、適用template、risk、未解決 | 対象pairのfreeze可能な設計・検証契約 | 実装完了、利用者受入、運用成立 |
| `implementation` | 一つの承認・freeze済みticketが指定する成果と必要検証 | Feature Ticket、親要求、設計、oracle、許可、HEAD | 対象成果と検証証拠 | 無関係な要求・設計の変更、release、deployment |
| `operation_change` | GitHub、CI、Worker、配布等の一つの外部運用変更 | HELIX-OS要求、操作authority、backup、rollback、read-after | 許可scope内の外部状態変更 | 要求意味、人間承認、別操作の許可 |

要求PRは原則として一つの要求identityだけを扱う。複数要求を一括変更しない。connection要求は接続そのもの、
composite要求は組合せ固有の全体条件を一つのidentityとして扱い、構成unitの要求PRと分ける。
`requirement` PRをReadyにする前に、親Concept／Vision／企画revisionから判断論点を特定し、premise packetまたは
`research_not_required`の理由・判断者・再評価条件を参照する。research結果は要求候補の根拠であり、採用authorityではない。

## IssueとFeature Ticket

- GitHubで人が読むtitle、見出し、目的、判断、状態説明、停止理由は日本語を原則とする。ID、path、command、schema語彙、
  label等の機械識別子と一般的な開発用語は原語を保てるが、英語見出しだけで意味を判断させない。
- GitHubの入力面は`.github/PULL_REQUEST_TEMPLATE.md`と`.github/ISSUE_TEMPLATE/feature-ticket-projection.yml`へ
  投影する。templateが欠けても本書のauthorityは失われず、template入力だけで上流承認を生成しない。
- Feature Ticketはlocal work authorityであり、親上流、対象product、scope、依存、停止条件、backflowを持つ。
- IssueはFeature Ticketの協調projectionであり、Issue番号を要求IDやticket IDにしない。
- 上流承認前に人間の明示指示から起票する場合は`proposed_upstream_waiting`に固定し、実装可能状態へ進めない。
- 推進機構がtag語彙とworkflow生成規則を所有し、管理から受けた目的・要求・制約をticket graphへ変換する。
- 管理層は生成物を登録・統制する。HARNESSは生成物が満たす開発・検証contractを規定し、tag語彙、生成規則、ticket発行を所有しない。
- PRは対応するlocal ticketとIssueを参照する。Issue closeやPR mergeだけでticket完了を生成しない。

## review、判断、merge admission

すべてのPRは対象HEADを固定してreviewする。作成側と意味判断側を分け、許可されたGitHub Claude通路を用いる。
reviewはfindingであり、人間判断を代替しない。旧CI、旧test、旧runtime、ローカルClaude CLIをfallbackにしない。

### PR #1797 `repository_foundation`

次をすべて満たした場合だけReady／merge候補にできる。

1. archive manifestが旧資産集合を完全に固定し、現行pathから旧workflow、runtime、AI instruction、testを実行できない。
2. active文書がConcept、HARNESS、HELIX-OS、HELIX-Web、HELIX-Web-OS、governanceへ物理分離されている。
3. 本運用モデル、authority入口、旧資産採否・copy・Issue／Project操作記録が相互参照できる。
4. 相対リンク、対象別L2↔L11、判断packet SHA等の静的整合が対象HEADで成立する。
5. GitHub Claudeの対象HEAD意味reviewで未解消Blocker／Majorが0である。
6. 人間がrepository構成と運用上流を確認する。

既存CodeQL、旧`harness-check`、旧testのgreenは条件に含めない。Concept／L1／L2個別要求の意味変更判断は#1797のmerge条件に含めず、後続の`requirement` PRへ分離する。#1797では旧要求本文とIRを同一byteで現行保持し、153件を原文・digest付き台帳へ固定する。37件の対象別L2は整理先を示すrouting containerであり、旧要求の代替、縮約、棄却ではない。

### 後続`requirement` PR

各PRは少なくとも次を満たす。

1. 一つの対象productと親Concept／L1 exact revisionへ束縛する。
2. 親Concept／Vision／企画から導いた判断論点と、premise packetまたはresearch非適用判断へ束縛する。
3. 一つの要求identity、`unit`／`connection`／`composite`、actor、目的、scope、non-goal、制約、失敗・回復を示す。
4. 対になるL11に正常系とnegative case、N/Aなら理由・判断者・再評価条件を持つ。
5. 旧要求を扱う場合は原要求ID、原文digest、successor ID、意味atomの被覆、未被覆atomを記録する。未被覆は`pending`として保持し、旧実装・旧CIをauthorityへ戻さない。
6. 影響する既存要求だけを示し、無関係な要求を同じPRへ混載しない。
7. GitHub Claudeの対象HEAD意味reviewで未解消Blocker／Majorが0である。
8. 意味変更またはretireがある場合だけ、人間の明示判断と対象revisionをdecision recordへ束縛する。保持と再配置を既定とする。

## 新世代CIへの接続

新世代CIは、承認済み要求とfreeze済み設計・検証から必要oracleを導出できる段階で、HELIX-OSの
`operation_change` PRとして設計する。それまではCIをmerge admissionの代替にせず、旧workflowとのparityやdual-greenを
要求しない。本運用モデルと後続要求PRの証拠構造が、新世代CIを上流から生成するための入力となる。
