---
title: "GitHub環境分離・promotion システムテスト設計"
layer: L10
artifact_type: test_design
status: draft
created: 2026-07-23
updated: 2026-07-23
owner: QA
pair_artifact: docs/design/helix/L3-requirements/github-environment-promotion-requirements.md
---

# GitHub環境分離・promotion システムテスト設計

- pair: `docs/design/helix/L3-requirements/github-environment-promotion-requirements.md`
- status: draft
- 実行層: L10

## テスト束

| Test ID | 対応AC | 入力 | 期待結果 |
|---|---|---|---|
| GH-T-023 | GH-AC-023 | staging/productionのEnvironment、secret、role、artifact digestを交差させる | 環境分離と同一artifact promotion以外を拒否する |
| GH-T-024 | GH-AC-024 | production deployから承認、staging、backup、rollback、health/monitoringを一つずつ欠落または別HEAD化する | 完全なaction-bound receiptだけproduction実行を許可する |
| GH-T-025 | GH-AC-025 | production migrationからexpand/deploy/contract、backup、restore rehearsal、互換期間、停止見積り、oracle、個別承認を一つずつ欠落させる | staging反復と分離し、完全性receiptが揃うproduction migrationだけ許可する |
| GH-T-026 | GH-AC-026 | editor専用deploy、別workflow CLI、staging/production image・schema・migration・health差分、provider contract driftを投入する | GitHub正式面と同一workflow補助面、production同等staging、provider非依存contractだけを受理する |
| GH-T-027 | GH-AC-027 | required reviewer非対応plan、self-review許可、同時deploy二件、長期AWS key、広すぎるOIDC trust、role共有を投入する | setup preflightでproduction有効化を拒否する |
| GH-T-028 | GH-AC-028 | AWS referenceへ不要DB、production dataの同一account、監査ログsecret、retention欠落を投入する | Fargate/CDK、要件駆動DB、risk駆動account分離、redacted 90日/1年profileへ判定する |

## 証跡要件

fixtureはenvironment identity、artifact digest、workflow/run、OIDC claim、role、approval、backup/restore、migration phase、health、rollback、
log retention/redactionを持つ。実環境writeは行わず、L4以降でread-only preflightと承認付きdeployment verificationへ降下する。
