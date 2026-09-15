---
plan_id: PLAN-L7-340-p6-release-automation-descent
title: "PLAN-L7-340 (impl): P6 GitHub 運用の L7 降下 — PR レビュー経路検証 / CI auto-fix gate / release automation ADR"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-06
updated: 2026-07-06
backprop_decision: not_required
backprop_decision_reason: "HBR-P6 は L3 (HR-FR-P6-01〜05) から L6 (HC-P6 関数シグネチャ) まで降下済みであり、本 PLAN はその L7 実装のみを追加する。上位要件・設計の意味は変更しない。"
owner: Claude (Fable)
parent_design: docs/design/helix/L6-function-design/pillar-function-design.md
pair_artifact: tests/pr-review-route.test.ts
agent_slots:
  - role: tl
    slot_label: "TL - L6 関数契約 (HC-P6) との実装整合と不可逆操作境界の妥当性"
  - role: qa
    slot_label: "QA - dry-run 既定 / confidence 閾値 / fail-close 経路の oracle 設計"
generates:
  - artifact_path: docs/plans/PLAN-L7-340-p6-release-automation-descent.md
    artifact_type: markdown_doc
  - artifact_path: docs/adr/ADR-008-release-automation-selection.md
    artifact_type: markdown_doc
  - artifact_path: src/audit/pr-review-route.ts
    artifact_type: source_module
  - artifact_path: src/audit/ci-auto-fix-gate.ts
    artifact_type: source_module
  - artifact_path: src/audit/release-automation-decision.ts
    artifact_type: source_module
  - artifact_path: tests/pr-review-route.test.ts
    artifact_type: test_code
  - artifact_path: tests/ci-auto-fix-gate.test.ts
    artifact_type: test_code
  - artifact_path: tests/release-automation-decision.test.ts
    artifact_type: test_code
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L3-06-helix-pillar-descent.md
  requires:
    - docs/design/helix/L3-requirements/pillar-functional-requirements.md
    - docs/design/helix/L4-basic-design/pillar-basic-design.md
    - docs/design/helix/L6-function-design/pillar-function-design.md
    - src/audit/github-merge-readiness.ts
    - src/lint/github-guards.ts
  references:
    - docs/plans/PLAN-L7-339-p6-release-automation-descent.md
    - docs/plans/PLAN-L7-229-helix-setup-branch-protection-approval.md
    - docs/plans/PLAN-L7-259-action-binding-evidence-url-gate.md
    - docs/plans/PLAN-L7-328-github-preflight-and-audit-hardening.md
related_adr:
  - docs/adr/ADR-001-helix-harness-redesign-and-language.md
related_docs:
  - docs/design/helix/L0-charter/helix-charter_v0.1.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-06T06:18:00+09:00"
    tests_green_at: "2026-07-06T06:18:00+09:00"
    verdict: approve
    scope: "PLAN-L7-339 と同一生成物の version-up 保全 PLAN を、archive ではなく実装済み L7 descent として confirmed 化した。GitHub remote apply、tag push、release publish は未実行。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/pr-review-route.test.ts tests/ci-auto-fix-gate.test.ts tests/release-automation-decision.test.ts --timeout 300000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-06T06:18:00+09:00"
        evidence_path: tests/release-automation-decision.test.ts
        output_digest: "sha256:2851d6f97a6106dbea0c98dbe2040fc941a7c61fa43f975ef8ab1275c18eacea"
---

# PLAN-L7-340 (impl): P6 GitHub 運用の L7 降下

## 実装確認（PO 指示 2026-07-06）

本 PLAN は archive では閉じず、生成物が既に存在する事実に合わせて confirmed とする。
先行の PLAN-L7-339 と同じ L7 実装を確認し、PR review route、CI auto-fix gate、release automation
decision を plan-only / dry-run 境界で確定した。

## 目的（PO 要求 2026-07-06「GitHub 運用設計を AI エージェント安全開発基盤として見直す」）

charter は「PR→クロスレビュー→CI→（失敗なら自動改善）→マージ→タグ付けまで人の逐次承認なし」を
北極星とするが、HC-P6 で L6 関数契約まで規定された `validatePrReviewRoute` /
`gateCiAutoFixRepush` / `planReleaseAutomationDecision` は `src/` に実装が存在せず、
HR-FR-P6-05 が要件化した release automation ADR（semantic-release vs Release Please）も未起票である。
本 PLAN は P6（github-distribution ピラー）の design-only ギャップを L7 実装で埋め、
GitHub 運用を「設計だけある」状態から「機械検証つきで動く」状態へ降下させる。

## 設計方針（安全境界）

- **plan / dry-run / gate 関数のみを実装**する。GitHub remote への不可逆操作
  （branch protection apply、merge queue 有効化、実 tag push、実 release publish）は本 PLAN の
  対象外であり、既存の action-binding approval 経路（PLAN-L7-229 / PLAN-L7-259）の背後に留める。
- `gateCiAutoFixRepush` は confidence >= 0.75（HR-FR-P6-02）を閾値とし、閾値・上限リトライ回数は
  ハードコードせず policy 定数へ分離する（PLAN-L7-158 の policy sidecar 方式に従う）。
- `helix github merge-readiness` / `pr-create --dry-run` の既存パターン（読み取り優先・apply 明示）
  を踏襲し、新関数も既定 dry-run とする。

## スコープ

### Step 0 — inventory（serial、activation 後の着手前必須）
- 旧 HELIX repo（`RetryYN/ai-dev-kit-vscode`）に PR レビュー経路 / CI 自動修正 / release 自動化に
  相当する command / detector が無いか照合し、採否を本 PLAN に記録する（inventory-first）。
- 既存 `src/audit/github-merge-readiness.ts` / `src/lint/github-guards.ts` との責務境界を確定する。

実施記録（2026-07-06）:

- この workspace には旧 HELIX の local checkout が存在せず、旧 HELIX から採取できる command / detector は未確認。
  本 PLAN では旧 runtime を import せず、L6 契約に従って TypeScript/Bun の pure function として再実装する。
- `src/audit/github-merge-readiness.ts` は branch / auth / PR draft / CI status の readiness、
  `src/lint/github-guards.ts` は commitlint / PR context guard を担当する。本 PLAN の 3 関数は
  review route、CI auto-fix repush 可否、release tool 選定の plan-only 判定に責務を限定する。

### Step 1 — ADR-008 release automation 選定（serial）
- semantic-release vs Release Please を Conventional Commits 前提・Bun 互換・dry-run 可否・
  merge queue 相性で比較し ADR として確定する（HR-FR-P6-05）。

実施記録（2026-07-06）:

- `docs/adr/ADR-008-release-automation-selection.md` を追加し、Release Please を既定選定とした。
- 実 release publish / tag push は許可せず、decision result は `dryRun=true` / `applyAuthorized=false` を固定する。

### Step 2 — `validatePrReviewRoute`（serial、TDD Red 先行）
- PR のクロスレビュー経路（worker model ≠ reviewer model、review evidence 存在）を検証する純関数。
- `tests/pr-review-route.test.ts` に U-PRROUTE oracle を先に置く。

実施記録（2026-07-06）:

- `src/audit/pr-review-route.ts` と `tests/pr-review-route.test.ts` を追加。
- cross-agent review、same model/self review、intra-runtime fallback の oracle を固定した。

### Step 3 — `gateCiAutoFixRepush`（serial、TDD Red 先行）
- CI 失敗時の自動修正 re-push 可否を confidence・リトライ上限・失敗種別で判定する gate。
- `tests/ci-auto-fix-gate.test.ts` に U-CIFIX oracle を先に置く。

実施記録（2026-07-06）:

- `src/audit/ci-auto-fix-gate.ts` と `tests/ci-auto-fix-gate.test.ts` を追加。
- policy 定数 `DEFAULT_CI_AUTO_FIX_POLICY` に `minConfidence=0.75` / `maxAttempts=2` /
  auto-fixable failure kind を分離した。

### Step 4 — `planReleaseAutomationDecision` + CLI 配線（serial）
- ADR-008 の決定を機械可読な decision plan として出力し、`helix github` サブコマンドへ dry-run で配線する。

実施記録（2026-07-06）:

- `src/audit/release-automation-decision.ts` と `tests/release-automation-decision.test.ts` を追加。
- 本実装範囲では user 指示に従い CLI 配線と GitHub remote apply は行わず、pure function の plan-only 判定に限定した。

### OUT / 非対象
- GitHub Rulesets / Merge Queue の remote 実適用（action-binding approval 後の別 PLAN）。
- 本 repo への CODEOWNERS 実配備（solo 運用のため PO 判断待ち。§7 参照）。
- 実 release の publish（PLAN-M-02 identifier rename 境界と同様、承認証跡が揃うまで dry-run のみ）。

## 受入条件
- U-PRROUTE / U-CIFIX / U-RELDEC の各 oracle が green であること
  （検証コマンド: `bun test tests/pr-review-route.test.ts tests/ci-auto-fix-gate.test.ts tests/release-automation-decision.test.ts`）。
- `bun run typecheck` green、`bun run lint` green、`helix doctor` exit 0。
- ADR-008 が確定し、HR-FR-P6-05 から trace されること。
- confirmed 化の前に review evidence + green_commands（digest 付き）を記録する。

## スケジュール
- mode: serial。Step 0 inventory → Step 1 ADR → Step 2〜4 実装（TDD Red → Green）→ 検証 → レビュー → confirmed。

## 壊さない / 再発させない
- 既存の `helix github merge-readiness` / `pr-create` の dry-run 既定と exit code 契約を変えない。
- 不可逆操作を gate 関数の内側に混ぜない（plan と apply の分離を新関数でも維持する）。
- 閾値のハードコードを持ち込まない（外部化基準 = coding-rules.md §外部化基準に従う）。

## §6 用語更新 (living glossary delta)

| 用語 | 種別 (新規 / 精緻化) | 定義 / 変更点 | L0 §10 back-merge (導入層 / 更新層) |
|---|---|---|---|
| CI auto-fix gate | 精緻化 | HR-FR-P6-02 の confidence 閾値付き自動修正 re-push 判定の L7 実装名 | 導入層 L3、activation 時に L7 実装到達を追記 |

## §7 機能要求更新 (FR registry delta)

機能要求更新なし（HR-FR-P6-01〜05 の既存要件の L7 降下であり、新規 FR を追加しない）。
CODEOWNERS 実配備の要否は solo 運用前提に関わるため PO 判断事項として残す。
