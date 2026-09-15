---
title: "GitHub security evidence admission システムテスト設計"
layer: L10
artifact_type: test_design
status: draft
created: 2026-07-30
updated: 2026-07-30
owner: QA / Security
pair_artifact: docs/design/helix/L3-requirements/github-security-admission-requirements.md
---

# GitHub security evidence admission システムテスト設計

## テスト束

| Test ID | 対応AC | 入力 | 期待結果 |
|---|---|---|---|
| `GH-T-041` | `GH-AC-041` | PR diff standard、candidate deep、staging／production同一・別artifact、coverage complete／partial／unknown、scanner未設定／実行中、severity各値、waiver有効／期限切れ、HEAD drift、credentialをcheckout前後・scan step外へ露出、tag／full SHA Action、report-only／enforce、approval有無を直積する | exact HEAD／artifact、complete coverage、policy内finding、最小permission、full SHA、current waiver／approvalを持つprofileだけadmitし、他は`report_only`、`recovery_required`、`human_action_required`、`reject`へ理由付きでexactly once分類する |

## 証跡要件

receiptはsource/base/head SHA、merge base、artifact digest、scanner/schema/policy version、scan mode、
coverage、exit code、finding fingerprint／severity／disposition、waiver期限、SARIF digest、Actions permission、
credential exposure、action ref、run ID、duration、costを保持する。

finding件数0、SARIF upload成功、CodeQL単独green、Codex Security単独green、GitHub UIのenabled表示だけを
security admissionの十分条件にしない。negative fixtureは各failureを一件ずつ反転し、別scannerのPASSで
相殺されないことを検証する。
