---
plan_id: PLAN-L7-418-github-self-driving-ops
title: "PLAN-L7-418: GitHub 自走運用の実効化 — auto-merge/branch protection 適用・CI self-heal 規律"
kind: troubleshoot
layer: L7
drive: agent
status: confirmed
route_mode: incident
entry_signals:
  - "po_directive:2026-07-11 PO 指示「品質を守るガードはほしいが GitHub 運用は柔軟に。PR からのオートマージ等、AI エージェントが自走するために必要な状態に整備。要件定義以降はすべて自走」+ 追指示「CI が落ちたら自分で拾って直して入れ直す」。merge ゲート = CI green のみ (人間 approve 不要) は AskUserQuestion で PO が明示承認。"
created: 2026-07-11
updated: 2026-07-11
backprop_decision: not_required
backprop_decision_reason: "charter §3 (L4 以降〜GitHub PR/CI/merge/tag 完全自動) と §6.5 Phase 0-B の既定路線の実効化。判定機構 (pr-review-route / ci-auto-fix-gate / github-merge-readiness / github-ops-guard) は PLAN-L7-340/360 で実装済みであり、本 PLAN は承認境界で保留されていた GitHub 側 apply と運用規律の明文化のみを行う。要求・設計の意味変更はない。"
owner: Claude
agent_slots:
  - role: tl
    slot_label: "TL — branch protection 構成 (CI 集約 gate / approve 0) と自走 merge 境界の妥当性"
  - role: aim
    slot_label: "AIM — troubleshoot 分類 + PO 承認証跡 (merge ゲート = CI green のみ) の記録確認"
generates:
  - artifact_path: docs/plans/PLAN-L7-418-github-self-driving-ops.md
    artifact_type: markdown_doc
  - artifact_path: src/setup/templates.ts
    artifact_type: source_module
  - artifact_path: docs/templates/github/team/setup-branch-protection.sh
    artifact_type: source_module
  - artifact_path: tests/setup.test.ts
    artifact_type: test_code
  - artifact_path: src/lint/github-guards.ts
    artifact_type: source_module
  - artifact_path: tests/branch-kind.test.ts
    artifact_type: test_code
  - artifact_path: CLAUDE.md
    artifact_type: markdown_doc
  - artifact_path: AGENTS.md
    artifact_type: markdown_doc
dependencies:
  parent: null
  requires:
    - PLAN-L7-340-p6-release-automation-descent
    - PLAN-L7-360-github-ops-guard-parity
    - PLAN-L7-229-helix-setup-branch-protection-approval
review_evidence:
  - reviewer: po-direct
    review_kind: human
    reviewed_at: "2026-07-11T08:05:00+09:00"
    tests_green_at: "2026-07-11T08:05:00+09:00"
    verdict: approve
    scope: "PO が AskUserQuestion で「A: CI green のみ (人間レビュー必須なし)」を明示選択。auto-merge / delete-branch-on-merge / branch protection (harness-check required, strict, enforce_admins, approve 0) の適用を承認。"
    worker_model: claude-fable-5
    reviewer_model: human
  - reviewer: codex-independent-reviewer
    review_kind: cross_agent
    reviewed_at: "2026-07-11T15:35:48Z"
    tests_green_at: "2026-07-11T15:35:15Z"
    verdict: approve
    scope: "PLAN-L7-418のbranch protection/auto-merge/setup contractを独立技術レビューした。repo/builtin setup scriptがrequired check=harness-check(strict)、enforce_admins=true、approve既定0、force-push/deletion禁止を同一JSONで生成し、gh auth/admin preflight、dry-run no-write、consumer readinessのapply-capable検査へ接続されることを確認した。PR運用で生じるGit標準Merge/Revert subjectだけをcommitlint対象外とし、手書き非規約subjectは引き続きblockする。CLAUDE/AGENTSのauto-merge・CI self-heal規律とrelease/tag/cutoverのaction-binding境界にも退行なし。既存human entryはPOの外部適用承認として保持し、本entryは技術greenを独立に担う。"
    worker_model: claude-fable-5
    reviewer_model: gpt-5.6
    green_commands:
      - kind: unit_test
        command: "bunx vitest run --project fast tests/setup.test.ts tests/branch-kind.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-11T15:35:15Z"
        evidence_path: tests/setup.test.ts
        output_digest: "sha256:322d571b63f00370db08a5e3428f47d8a6f56a8922b271cee6666acfb633a832"
---

# PLAN-L7-418: GitHub 自走運用の実効化

## 背景

P6 GitHub 運用の判定機構（`pr-review-route` / `ci-auto-fix-gate` / `github-merge-readiness` /
`github-ops-guard`、`helix github pr-create` 等）は PLAN-L7-340/360 で実装済みだったが、
GitHub 側の実 apply は承認境界で保留され、main は protection 無し・PR 未運用・
長期 branch 直 push の状態だった。PO 指示 (2026-07-11) により実効化する。

## 適用した GitHub 設定（2026-07-11、gh api、全て可逆）

| 設定 | 値 | 根拠 |
|---|---|---|
| repo `allow_auto_merge` | true | PR からのオートマージ自走 |
| repo `delete_branch_on_merge` | true | merge 後の branch 掃除自動化 |
| main protection `required_status_checks` | `harness-check` (strict) | 品質ゲートは CI 1 本に集約 (§6.2) |
| main protection `enforce_admins` | true | admin/人間も CI を迂回しない |
| main protection `required_pull_request_reviews` | null (approve 0) | **PO 明示承認**。単一アカウント運用で AI 自走 merge を可能にする。レビュー品質は harness 内クロスランタイムレビュー証跡 (review_evidence) が担う |
| main protection `allow_force_pushes` / `allow_deletions` | false | push 済み履歴の破壊禁止 (既存 Git 規則の機械化) |

`setup-branch-protection.sh` template も同構成 (approve 既定 0、第 2 引数で team 運用の
approve 必須化可) へ同期し、旧 `-f restrictions=` の無効 API 形式を JSON input へ修正した。

## 自走運用規律（CLAUDE.md / AGENTS.md に明文化）

1. main への取り込みは PR 経由とし、`gh pr merge --auto --merge` で auto-merge を仕込む。
   CI (`harness-check`) green で自動 merge、red なら merge されない (品質ゲート)。
2. **CI self-heal（PO 指示）**: 自分の push / PR で harness-check が fail したら、
   人間へ渡さず自分で失敗 log を取得 (`gh run view --log-failed` / `helix github ci-status`) し、
   修正して再 push する。修正で再 red になったら繰り返す (Iron Law escalation の範囲内)。
3. 不可逆・外部公開系 (release publish / tag / cutover / 配布 repo) は従来どおり
   action-binding approval 境界に残す (本 PLAN は変更しない)。

## AC

- [x] repo auto-merge / delete-branch-on-merge 有効 (gh api 実適用、応答 JSON で確認)。
- [x] main branch protection 適用 (required check=harness-check strict / enforce_admins /
      approve 0 / force-push・deletion 禁止、応答 JSON で確認)。
- [x] merge ゲート = CI green のみ、を PO が明示承認 (AskUserQuestion 回答、review_evidence)。
- [x] template `setup-branch-protection.sh` が適用済み実構成と一致し `bash -n` green。
- [x] CLAUDE.md / AGENTS.md に PR/auto-merge/CI self-heal の自走規律を明文化。

## CI self-heal 実績 (dogfood、2026-07-11)

PR #2 の初回 harness-check が commitlint gate で red になった
(`Merge remote-tracking branch ...` という git 既定 merge subject を non-conventional 判定)。
self-heal 規律どおり `gh run view --log-failed` で原因を特定し、push 済み履歴は書き換えずに
gate 側を PR 運用へ追随させた: `analyzeCommitSubjects` に upstream commitlint 既定 ignores 相当の
機械生成 subject 除外 (`^Merge ` / `^Revert "`) を追加 (手書き非規約 subject は引き続き block、
正例・負例テストを tests/branch-kind.test.ts に追加)。

## 残課題（本 PLAN 外の follow-up）

- `helix github pr-merge --auto` wrapper（現状は `gh pr merge --auto` 直呼び。audit evidence を
  harness に残すため wrapper 化する価値あり — 次スライス候補）。
- 現行長期 branch `codex/helix-l3-pillar-descent` の PR 化と main への取り込み
  (behind 1 commit の統合と harness-check green が前提)。
