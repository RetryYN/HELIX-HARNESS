---
title: "DevOps外部一次資料調査 — GitHub Deployments / AWS reference"
status: draft
confirmed_at: 2026-07-23
owner: Codex / TL
plan: PLAN-L3-24-github-environment-promotion
update_issue: "github:RetryYN/HELIX-HARNESS#91"
---

# DevOps外部一次資料調査

## 1. 調査範囲

GitHubをdeployment操作・監査面、AWSを最初のcloud reference adapterとする要件について、GitHubとAWSの公式資料を
2026-07-23に再確認した。外部code実行、credential使用、cloud writeは行っていない。

## 2. 採否とworkflow影響

| 論点 | 一次資料 | 採否 | HELIXへの影響 |
|---|---|---|---|
| GitHub Environment protection | https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments | 採用 | required reviewer、self-review禁止、branch/tag制限、environment secret遅延公開をproduction gateへ使い、plan/visibility差をpreflightする |
| GitHub deployment操作面 | https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/control-deployments | 採用 | workflow、Environment、deployment history、concurrencyを正式面とし、HELIX CLIは同じworkflowだけを起動・監視する |
| GitHub deployment承認 | https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/review-deployments | 採用 | production job開始前の承認とself-approval禁止を要求し、機能非対応時はproductionを開かない |
| AWS OIDC federation | https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_create_for-idp_oidc.html | 採用 | 長期access keyを保存せず、organization/repository/environment/refへtrust conditionを限定する |
| ECS deployment strategy | https://docs.aws.amazon.com/AmazonECS/latest/developerguide/deployment-type-blue-green.html | reference採用 | ECS blue/greenをreference fixtureにするが、ECS固有語を正本schemaへ入れない |
| RDS blue/green | https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/blue-green-deployments-overview.html | 条件付き採用 | providerが保証しないzero-downtimeを主張せず、停止見積りとswitchover条件を承認receiptへ入れる |
| schema互換性 | https://docs.aws.amazon.com/whitepapers/latest/blue-green-deployments/best-practices-for-managing-data-synchronization-and-schema-changes.html | 採用 | backward-compatible expand→deploy→contractを標準にする |

## 3. 今回と将来scope

今回の`GH-FR-021`は操作面、環境分離、AWS reference、OIDC、promotion/migration receiptまでを対象とする。
自動rollback判断、SLO、alert、Incident/Recovery統合はUpdate Issue #91へ接続し、このL3 sliceで実装済みとしない。
