---
title: "GitHub環境分離・promotion要件定義"
layer: L3
kind: add-design
status: draft
created: 2026-07-23
updated: 2026-07-23
owner: PO / TL
pair_artifact: docs/test-design/helix/github-environment-promotion-system-test-design.md
---

# GitHub環境分離・promotion要件定義

## 1. 目的と適用境界

本書は`vps_staging`から`cloud_production`へ同一artifactを昇格する環境境界、GitHub正式操作面、provider非依存contract、
AWS reference profile、DB migration安全性をL3要件として定義する。実deployment、credential発行、cloud resource作成は行わない。

## 2. 機能要件

### GH-FR-021 staging・production GitHub運用境界

環境を最低限`vps_staging`と`cloud_production`へ分離し、同一artifact digestだけをstagingからproductionへpromotionする。
GitHub Deployments、Environments、Actionsをeditor非依存の正式操作・監査面とし、`workflow_dispatch`を起動面、HELIX CLIを
同じworkflowの起動・監視を行う補助面とする。environment concurrencyは同時deploy一件へ制限する。

repository visibilityとGitHub planに応じてrequired reviewer、self-review禁止、custom protection、environment secret、branch/tag制限が
利用可能かsetup preflightする。不足時は代替保護を仮定してproductionを開かない。production昇格はstaging検証合格後だけ開始し、
対象artifact、環境、操作、window、backup、rollback target、health check、monitoringを束縛したユーザー承認receiptと
GitHub Environment protectionを通す。staging receiptなし、別artifact、承認scope外操作、environment secret混用を拒否する。

branch、preview、backup、rollback、health check、monitoringで可逆性を作り、「不可逆」という分類だけで通常作業を一律停止しない。
VPS stagingは承認済みworkflow内で自動deploy、検証、rollbackを反復できる。cloud productionだけをaction-binding approval境界とする。

VPS stagingはproductionと同じcontainer image、設定schema、migration、health checkを使い、規模と冗長性だけ縮小する。
production providerは固定せず、cloud固有APIをdeployment adapterへ隔離する。最初のreferenceはAWSとし、認証はGitHub OIDC短期credential、
trustはorganization、repository、environment、branch/tagへ限定する。長期access key、staging/production role共有を禁止する。

AWS reference標準profileはECS FargateとAWS CDK TypeScriptとする。DBはrelation、transaction、query要件がある場合だけproduct stackから選び、
reference fixtureをRDS PostgreSQLとする。production data、外部利用、認証・PII、高影響操作を含む場合はproduction/non-production AWS accountを
分離し、disposable PoCだけ同一account内のrole/VPC/tag分離を許可する。

DB migrationはbackward-compatibleなexpand→deploy→contractを標準とする。production適用にはbackup、restore rehearsal、旧version互換期間、
migration/rollback oracle、予測最大停止時間、replica lag、active transaction、復旧条件、個別承認を要求する。停止が必要なら停止時間、影響範囲、
復旧条件を束縛した追加承認を要求し、providerが保証しないzero-downtimeを主張しない。

自動rollback判断、SLO、alert、Incident/Recovery統合は運用ハーネスのUpdateへ接続する。本sliceではrollback targetと手順、health/monitoring evidenceまでを
必須にする。deployment監査ログは検索可能90日、改竄耐性archive 1年を既定とし、保存前redaction、correlation ID、environment/HEAD/artifact/actor/approval bindingを要求する。

## 3. 非機能要件

- `GH-NFR-013` Environment isolation: staging/productionのidentity、credential、secret scope、deployment history、rollback targetを分離し、production credentialをstaging jobへ渡さない。
- `GH-NFR-014` Provider portability: cloud固有APIはdeployment adapter内へ隔離し、要件、gate、receipt schemaをprovider非依存に保つ。

## 4. 受入条件

| AC | 合格条件 |
|---|---|
| GH-AC-023 | VPS stagingとcloud productionが別GitHub Environment、secret scope、receiptを持ち、同一artifact digestだけpromotionされる |
| GH-AC-024 | production deployは対象操作へ束縛したユーザー承認、staging green、backup、rollback、health/monitoring証拠が揃う場合だけ実行される |
| GH-AC-025 | production DB migrationはexpand→deploy→contract、backup、restore rehearsal、互換期間、migration/rollback oracle、停止見積り、個別承認が完全な場合だけ適用され、停止時は追加承認を要求する |
| GH-AC-026 | GitHub workflow/Environmentを正式面、HELIX CLIを同一workflowの補助面とし、production同一artifact/schema/migration/health contractのVPS staging検証後だけ昇格する |
| GH-AC-027 | GitHub plan/visibility preflight、environment concurrency、self-review禁止、OIDC trust/role分離がgreenでなければproduction environmentを有効化しない |
| GH-AC-028 | 要件から逸脱理由がない場合はECS Fargate/CDK TypeScript、要件駆動DB選択、risk駆動account分離、redacted 90日検索＋1年archiveをAWS reference標準profileとする |

## 5. freeze境界

本書はL3要件であり、L4/L9設計、L5/L8詳細設計、L6/L7実装、実cloud deploymentを先取りしない。production resource、credential、
secret、DNS、data migrationへのwriteは別のaction-binding approval境界とする。
