---
adr_id: ADR-008
title: "HELIX GitHub 運用の release automation 選定"
status: accepted
date: 2026-07-06
deciders:
  - HELIX TL
related_requirements:
  - HR-FR-P6-05
  - HAC-P6-05a
  - HAC-P6-05b
related_plan: docs/plans/PLAN-L7-340-p6-release-automation-descent.md
---

# ADR-008: release automation 選定

## 文脈

HELIX の release automation は、人の逐次承認なしで GitHub PR、CI、release tag へ進む北極星を持つ。
ただし実 tag push / release publish / GitHub remote apply は high-impact operation であり、
action-binding approval と dry-run evidence が揃うまで実行しない。

候補は L1/L3 で固定済みの semantic-release と Release Please に限定する。2026-07-06 時点で一次情報を確認した。

- semantic-release: 公式 docs / GitHub は、commit message から version、release notes、publish を CI 上で自動化する
  tool と説明している。license は GitHub repository 上 MIT。
  参照: <https://semantic-release.gitbook.io/semantic-release> / <https://github.com/semantic-release/semantic-release>
- Release Please: GitHub repository / Action docs は、Conventional Commit を解析し release PR を作る tool と説明している。
  package manager publication は扱わない。license は Apache-2.0。
  参照: <https://github.com/googleapis/release-please> / <https://github.com/googleapis/release-please-action>

## 決定

HELIX の既定 release automation は **Release Please** とする。

採用理由:

- Release Please は release PR を中心に version bump / changelog / GitHub release を扱うため、HELIX の
  PR cross-review、required checks、merge queue、action-binding approval と接続しやすい。
- publish は別境界に残せるため、ADR 採用だけで tag publish / package publish が実行可能にならない。
- Conventional Commits 前提は既存 commitlint / PR gate と整合する。
- semantic-release は fully automated publish に強いが、HELIX の「release PR を gate とする」運用では
  publish 境界を追加で抑制する必要がある。

## 影響

- `planReleaseAutomationDecision` は `release-please` を既定選択として返す。
- decision result は常に `dryRun=true` / `applyAuthorized=false` とし、実 release publish command を許可しない。
- release automation を進めるには、`action_binding_approval_record`、release dry-run green command、
  cross-review evidence を要求する。
- CI auto-fix repush は release tool 選定とは別 gate とし、`gateCiAutoFixRepush` の confidence threshold
  0.75 以上かつ iteration cap 内だけで許可する。

## 却下した案

### semantic-release を既定にする

semantic-release は SemVer / changelog / publish 自動化として強いが、HELIX の初期運用では release PR を
review gate として観測できることを優先する。semantic-release は将来、承認済み publish stage の実装候補として
再評価できる。

### release automation tool を採用しない

手動 release は gated push / CI / tag の監査面を残せるが、HR-FR-P6-05 の release automation ADR 要件を満たさない。

## 検証

- Unit oracle: `tests/release-automation-decision.test.ts`
- CI auto-fix oracle: `tests/ci-auto-fix-gate.test.ts`
- PR review route oracle: `tests/pr-review-route.test.ts`
