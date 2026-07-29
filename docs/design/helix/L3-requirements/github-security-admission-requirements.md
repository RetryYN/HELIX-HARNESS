---
title: "GitHub security evidence admission 要件定義"
layer: L3
kind: add-design
status: draft
created: 2026-07-30
updated: 2026-07-30
owner: Security / TL
pair_artifact: docs/test-design/helix/github-security-admission-system-test-design.md
---

# GitHub security evidence admission 要件定義

## 1. 目的と責務境界

本書はCodex Security、GitHub CodeQL、secret scanning／push protection、Dependabot、dependency review等を
個別の正本にせず、同一source HEAD／artifact digestへ束縛したsecurity evidenceから、開発slice、merge、
deploymentのadmissionをexactly onceで決定する。

scannerの追加そのものではなく、coverage、severity、finding disposition、waiver期限、実行境界を統合する
`GitHubSecurityAdmission`を単一responsibility ownerとする。各scannerの検出ロジック、脆弱性修正、
deployment実行、GitHub settings変更は本責務に含めない。

## 2. 機能要件

### GH-FR-029 セキュリティ証拠受入

`GitHubSecurityAdmission`は次の入力をversioned receiptとして受け取り、`pass`、`report_only`、
`recovery_required`、`human_action_required`、`reject`のexactly oneを返す。

- source/base/head SHA、merge base、対象path／artifact digest、scanner／schema／policy version
- finding ID、CWE等の分類、severity、fingerprint、affected path、disposition、waiver owner／期限
- coverage=`complete|partial|unknown`、延期対象、scan方式、終了code、run／artifact／SARIF digest
- secret scanning、push protection、Dependabot、CodeQL、Codex Securityのavailable／configured／executed状態
- GitHub Actions権限、credential露出時間、Action完全SHA固定、artifact保持期間

開発sliceではimpact selectorがsecurity-sensitive path、権限、secret、dependency、workflow、schema、
migration、deployment変更をcriticalへ分類する。Codex Securityを利用可能な場合、PRのexact merge baseから
candidate HEADまでを`--diff ... --head ...`でscanし、結果directoryをworktree外へ置く。`partial`／`unknown`
coverage、input/runtime error、HEAD driftをfinding 0と同一視しない。Codex Securityがbeta access、
費用上限、provider障害等で利用不能な場合、CodeQLや既存scannerの成功で「Codex Security実行済み」と偽装せず、
versioned capability policyに従い`report_only`または`human_action_required`へfail-closeする。

candidate固定後はfull repository／critical pathのdeep scanをrisk policyに従って実行し、PR scanを
repository全体の完全性証拠にしない。deploy admissionはpromotion対象artifactとsource HEADを一致させ、
未解決Critical／High、期限切れwaiver、coverage不完全、CodeQL/Codex Security/SARIF receipt drift、
secret／dependency alert未処理を拒否する。stagingで取得した同一artifact receiptだけをproductionへ再利用し、
production credentialをscannerへ渡さない。

Codex Securityは既定report-onlyで導入し、scan品質、coverage、runtime、費用baselineを確認後、
versioned severity policyで段階的にenforceする。severity gateを有効化してもcoverage不完全のexit codeを
findingなしへ変換しない。複数scannerの同一findingはfingerprintで関連付けるが、一方のPASSで他方のfindingを
相殺しない。

GitHub repository設定の期待状態は、secret scanning、push protection、Dependabot alerts/security updates、
CodeQLまたはadmitted code-scanning tool、code-scanning merge protection、default read permissions、
必要jobだけの`security-events: write`／`id-token: write`、`persist-credentials: false`、third-party Actionの
full-length commit SHA pinとする。設定変更はread-only drift receipt、dry-run、対象／rollbackを束縛した
action-binding human approvalなしにapplyしない。

## 3. 非機能要件

- `GH-NFR-019` Completeness: coverage不完全、scanner未設定、実行中、receipt staleをgreenにしない。
- `GH-NFR-020` Least privilege: scan credentialはscan stepだけへ注入し、checkout、repository executable、
  artifact upload、deploymentへ伝播させない。
- `GH-NFR-021` Cost and latency: PRはdiff standard、candidate／scheduledはrisk-based deepとし、
  `max-cost`、duration、coverageを別々に計測する。費用超過を検査削除で隠さない。
- `GH-NFR-022` Evidence privacy: scan artifactのsource snippet／remediation情報を機密として扱い、
  private worktree外directory、最小閲覧権限、短期retention、redactionを適用する。

## 4. 受入条件

| AC | 合格条件 |
|---|---|
| `GH-AC-041` | exact HEADのPR diff、candidate deep、deployment artifactを別profileで判定し、coverage partial/unknown、required scanner未設定、Critical/High、期限切れwaiver、HEAD/artifact drift、credential過剰露出、未pin Actionを個別にfail-closeする。report-onlyからenforceへの遷移とGitHub settings applyはversioned policy／action-binding approvalなしに行われない |

## 5. 外部仕様確認

- OpenAI Codex Manual「Run Codex Security in CI」「Codex Security CLI reference」（2026-07-30確認）
- GitHub公式文書「Code scanning merge protection」「Managing security and analysis settings」
- GitHub公式文書「Managing GitHub Actions settings」「Security hardening your deployments」

外部仕様は実装時に再確認し、beta availabilityやGitHub plan差を固定前提にしない。
