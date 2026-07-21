---
title: "DevOps外部一次資料調査 — GitHub Deployments / AWS reference"
status: draft
confirmed_at: 2026-07-22
owner: Codex / TL
plan: PLAN-L3-21-contextual-pr-review-db-convergence
update_issue: "github:RetryYN/HELIX-HARNESS#91"
---

# DevOps外部一次資料調査

## 1. 調査範囲

GitHubを正式なdeployment操作・監査面、AWSを最初のcloud reference adapterとする要件について、
GitHubとAWSの公式資料を2026-07-22に確認した。日付更新だけを証跡にせず、採否とworkflow影響を記録する。

## 2. 採否

| 論点 | 一次資料 | 採否 | HELIXへの影響 |
|---|---|---|---|
| GitHub Environment protection | https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments | 採用 | required reviewer、self-review禁止、branch/tag制限、environment secret遅延公開をproduction gateへ使う。plan/repository visibilityによる機能差をpreflightする |
| GitHub deployment操作面 | https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/control-deployments | 採用 | `workflow_dispatch`、Environment、deployment history、concurrency groupを正式面とし、HELIX CLIは同じworkflowだけを起動・監視する |
| GitHub deployment承認 | https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/review-deployments | 採用 | production承認はworkflow job開始前に行い、self-approval禁止を要求する。利用planでrequired reviewerが使えない場合は代替custom protectionの設計なしにproductionを開かない |
| AWS認証 | https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_create_for-idp_oidc.html | 採用 | 長期access keyをGitHub secretへ保存せずOIDC federationを使い、organization/repository/environment/branchまたはtagへtrust conditionを限定する |
| AWS application deployment | https://docs.aws.amazon.com/AmazonECS/latest/developerguide/deployment-type-blue-green.html | reference採用 | ECS blue/greenをAWS reference fixtureとし、test listener、CloudWatch alarm、traffic shift、rollback strategyをprovider receiptへ写像する。ECS固有語を正本schemaにしない |
| deployment strategy交換 | https://docs.aws.amazon.com/AmazonECS/latest/developerguide/migrate-deployment-strategies.html | 採用 | blue/greenを唯一方式に固定せず、provider capabilityに応じrolling/canary/linearをadapter capabilityとして宣言する |
| RDS blue/green | https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/blue-green-deployments-overview.html | 条件付き採用 | DB更新は同期staging、guard付きswitchover、旧環境保持をreferenceにする。公式値は通常1分未満の停止であり、絶対zero-downtimeを虚偽claimしない |
| RDS schema互換性 | https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/blue-green-deployments-best-practices.html | 採用 | replication-compatible変更、replica lag 0、green read-only原則をmigration oracleへ追加する |
| schema/code分離 | https://docs.aws.amazon.com/whitepapers/latest/blue-green-deployments/best-practices-for-managing-data-synchronization-and-schema-changes.html | 採用 | backward-compatible expand→deploy→contractを正本とし、codeとschemaの同時破壊変更を拒否する |

## 3. 要件補正

- 「zero-downtime」は設計目標とし、providerが保証しない停止時間を0と断定しない。
- production migrationは予測最大停止時間、replica lag、active transaction、復旧条件を承認receiptへ含める。
- GitHub Environment protectionはrepository visibilityとGitHub planによって利用可能機能が異なるため、
  setup preflightでrequired reviewer、custom protection、environment secretの可用性を検査する。
- environmentごとのconcurrency groupは同時deploymentを1件に制限する。
- production AWS roleはGitHub OIDCの短期credentialだけを受け付け、staging roleと分離する。

## 4. 今回と将来scope

今回のGH-FR-021では操作面、環境分離、AWS reference、OIDC、promotion/migration receiptまでを設計対象とする。
自動rollback判断、SLO、alert、Incident/Recovery統合、長期ログretention/redactionはUpdate Issue #91の
運用ハーネスへ接続する。

## 5. 質問なしで適用する標準profile

- container workloadはECS Fargateを既定とし、Kubernetes固有要件、host制御、特殊daemonがある場合だけEKS/EC2を選ぶ。
- DB不要を第一候補とし、relation/transaction/query要件がある場合だけproduct技術stackから選ぶ。AWS reference fixtureは
  RDS PostgreSQLだが、HELIX内部SQLiteを置換しない。
- production data、外部利用、認証・PII・高影響操作がある場合はproduction/non-productionを別accountへ分離する。
  disposable PoCだけ同一account＋別role/VPC/tagを許容する。
- 現行TypeScript/Node authorityと実装速度を優先し、AWS reference adapterのIaCはAWS CDK TypeScriptを使う。
  provider portabilityはprovider非依存deployment contractとreceipt schemaで担保する。
- audit logは90日を検索可能、1年を改竄耐性archiveの既定値とし、保存前redaction、correlation ID、
  environment/HEAD/artifact/actor/approval bindingを要求する。法令・契約が強ければ延長する。
