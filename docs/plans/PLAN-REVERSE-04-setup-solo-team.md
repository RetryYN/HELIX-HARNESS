---
plan_id: PLAN-REVERSE-04-setup-solo-team
title: "PLAN-REVERSE-04 (reverse/fullback): ut-tdd setup solo/team を上位整合へ back-fill — §6.5 Phase 0-A/0-B 整合 + L4 external-if GitHub 境界契約 (emit-only) + L0 §10 用語。新 FR 不要 (Phase 0 工程外)"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: fullback
drive: fullstack
status: confirmed
created: 2026-06-02
updated: 2026-07-01
owner: PM (Opus) / PO (人間)
forward_routing: L4
promotion_strategy: reuse-as-is
backprop_scope:
  - layer: requirements
    decision: not_impacted
    evidence_path: docs/governance/ut-tdd-agent-harness-requirements_v1.2.md
    reason: "ut-tdd setup project is a Phase 0 bootstrap entrypoint for already-defined setup/governance behavior; it does not add a new L1/L3 product requirement."
  - layer: L4-basic-design
    decision: not_impacted
    evidence_path: docs/design/harness/L4-basic-design/external-if.md
    reason: "GitHub/API boundary remains file emit plus branch-protection emit-only; no new external API contract is introduced."
  - layer: L5-detailed-design
    decision: not_impacted
    evidence_path: docs/design/harness/L5-detailed-design/internal-processing.md
    reason: "No DB schema, API payload, or state storage contract changes; .ut-tdd baseline directories are project-local setup artifacts."
  - layer: L6-function-design
    decision: updated
    evidence_path: docs/design/harness/L6-function-design/setup-solo-team.md
    reason: "HELIX project setup addendum registers VSCode tasks and project-local state baselines under the existing setup boundary."
  - layer: L7-unit-test-design
    decision: updated
    evidence_path: docs/test-design/harness/L7-unit-test-design.md
    reason: "U-SETUP-015 covers planHelixProjectSetup, runHelixProjectSetup, and ut-tdd setup project CLI semantics."
agent_slots:
  - role: tl
    slot_label: "TL — as-is 設計復元 / GitHub 境界契約 (emit-only) / 用語 back-merge のレビュー (claude-only は code-reviewer 代替)"
  - role: po
    slot_label: "PO — R3 intent (setup=Phase 0 工程外で新 FR 不要 / branch protection 人間サインオフ) 検証 (§1.8 R3 必須)"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-04-setup-solo-team.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/ut-tdd-agent-harness-requirements_v1.2.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L4-basic-design/external-if.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L5-detailed-design/internal-processing.md
    artifact_type: design_doc
  - artifact_path: docs/governance/ut-tdd-agent-harness-concept_v3.1.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L6-function-design/setup-solo-team.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: null
  requires:
    - docs/plans/PLAN-L7-03-setup-solo-team.md
  blocks: []
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T02:47:22+0900"
    tests_green_at: "2026-07-01T02:47:22+0900"
    verdict: approve
    scope: "R4 fullback for ut-tdd setup project: HELIX-ready VSCode bootstrap remains Phase 0 project setup, reuses setup solo/team and emit-only boundaries, and does not add new L1/L3 product requirements or irreversible identifier cutover."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/setup.test.ts tests/cli-surface.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T02:47:22+0900"
        evidence_path: tests/setup.test.ts
        output_digest: "sha256:489ffab05e118deb404f475310a65dd58650da75465bc3124ad007fa45f567f4"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T02:47:22+0900"
        evidence_path: src/setup/index.ts
        output_digest: "sha256:418c5f478cfccae091d9f1df63125e1979593fb1733d315daa0365b09b94ebf1"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T02:47:22+0900"
        evidence_path: src/cli.ts
        output_digest: "sha256:7961c43a561d23e29399061699265a57ea8bc6e747cbeb69a32c646445611660"
---

# PLAN-REVERSE-04 (reverse/fullback): ut-tdd setup solo/team を上位整合へ back-fill

## §0 位置づけ

Add-feature 標準ライフサイクル 経路 B の **収束段**。`PLAN-L6-05` (add-design) + `PLAN-L7-03` (add-impl) で **bottom-up build** した `ut-tdd setup` solo/team 機能の**上位整合 (§6.5 Phase 0-A/0-B / L4 external-if GitHub 境界契約 / L0 §10 用語) が空いている**ため、Reverse fullback で実装事実から back-fill し V-model 左腕の孤児化を解消する。`forward_routing=L4` / `promotion_strategy=reuse-as-is`。

> `forward_routing=L4` は **最前の design-layer 追記 = L4 external-if** を指す (REVERSE-03 の L3=FR 拡張に相当)。§6.5 (要件 governance) と §10.3 (L0 glossary) は同時に行う back-merge であり、design-layer の最前は L4。

2026-07-01 continuation: `ut-tdd setup project` は HELIX 導入済み VSCode で新規 project を始めるための bootstrap entrypoint であり、既存 `ut-tdd setup` の Phase 0 project setup 境界に属する。追加される `.vscode/tasks.json` / `.vscode/settings.json` / `.ut-tdd/memory|handover|evidence` baseline は adapter/runtime-state 投影の具体化であって、新しい L1/L3 product FR、DB/API contract、不可逆 `.ut-tdd -> .helix` cutover ではない。`identifierTransition` は現行 `.ut-tdd` baseline と将来 `.helix` 目標を同じ payload に出し、PLAN-M-02 cutover/action-binding approval までは `blocked_pending_cutover_approval` / `mustNotApply=true` を返す。`postSetupWorkflow` は fresh/brownfield/readiness の意味分岐を first-run route として構造化する設計補強であり、manual doc search なしに次 action を選べるようにするための上位整合である。

2026-07-02 continuation: L3 HR-FR-P6-03 / HAC-P6-03a が求める GitHub rules/checks plan と doctor baseline を
`HelixProjectSetupResult.githubPlan` / `doctorBaseline` として構造化した。`githubPlan` は plan-only、remote apply
なし、required check `harness-check`、branch protection `emit_only` / human approval 必須を返す。`doctorBaseline`
は setup dry-run / status / doctor / handover status と `.ut-tdd/memory|handover|evidence` baseline を返し、
`completionClaimAllowed=false` を固定する。これにより fresh setup の初回稼働証跡が path 文字列だけでなく、
GitHub gate と doctor baseline の意味単位として trace 可能になる。

## §1 R0-R4 (fullback)

| phase | 作業 | 結果 |
|-------|------|------|
| R0 evidence | 実装事実収集: `src/setup/index.ts` (契約関数 7 本) / `src/cli.ts` ut-tdd setup / `tests/setup.test.ts` U-SETUP-001〜007 (92 pass) / `docs/templates/github/{common,team}/` 8 テンプレ | evidence = 実装 + 92 pass + テンプレ |
| R0 continuation evidence | `planHelixProjectSetup` / `runHelixProjectSetup` / `ut-tdd setup project` が VSCode task と project-local `.ut-tdd` baseline を同じ setup 境界で生成し、dry-run と branch protection emit-only を維持する。JSON/text は `identifierTransition` として `futureCommand=helix setup project`、target `.helix`、PLAN-M-02 承認待ち blocker を返す。`postSetupWorkflow` は `importReport` と `consumerReadiness` を合成し、`ready` / `review_import_report` / `fix_consumer_readiness` の first-run route と verification commands を返す。`githubPlan` は rules/checks plan を plan-only で返し、`doctorBaseline` は初回 doctor/status/handover baseline を返す | evidence = U-SETUP-015..017/019 + CLI surface test + L3/L6/L7 design update |
| R1 (skip) | GitHub 設定は file emit (CODEOWNERS/workflow/templates) + gh-api 操作 (branch protection) の 2 種。外部契約 = gh CLI I/F + file 投影のみ (setup-solo-team.md §2.4) | observed = gh I/F + file 投影 |
| R2 as-is | `ut-tdd setup` は §6.5 Phase 0-A/0-B の **emission 実装**だが §6.5 側に setup 実装への参照なし。GitHub 境界 (file vs gh-api / emit-only 既定 / branch protection 人間サインオフ) が L4 external-if に未記載。Phase 0-A/0-B・参加規模検出・emit-only が L0 §10 用語に未 back-merge | as-is = 3 つの上位 gap |
| R3 intent (po 検証) | (a) **setup = Phase 0 bootstrap (リポジトリ初期化 / branch protection = concept §512 で「工程外」) → 新 FR を起こさない** / (b) GitHub 設定操作 (branch protection) は **emit-only 既定・適用は admin 人間サインオフ** (認可・本番影響境界) を L4 external-if に明記 / (c) Phase 0-A/0-B 出し分けが §6.5 2-stage と整合 — の 3 点が intent | **R3 PASS (2026-06-02)**: (a) は concept §512 (Phase 0 = 工程外) + scout 監査 (setup の FR-L1-NN 不在) に grounded、新 top-level 要件にしない / (b)(c) は L6 設計で PO 確定済 (emit-only / 非対話 apply 封鎖 / 数で自動確定しない)。よって R3 intent 充足。PO 認識ずれあれば再エスカレーション |
| R4 gap/routing | `forward_routing=L4`: ① §6.5 に `ut-tdd setup` solo/team が Phase 0-A/0-B emission の実装である旨を追記 / ② L4 external-if に setup GitHub 境界契約 (file emit + emit-only + 人間サインオフ + token 非保持) を追記 / ③ L0 §10.3 機構用語に Phase 0-A/0-B / 参加規模検出 / emit-only を back-merge。`reuse-as-is` (実装変更なし) | back-fill 完了 |

## §2 back-fill 内容 (新規 FR を起こさない)

- **要件 §6.5** (`docs/governance/ut-tdd-agent-harness-requirements_v1.2.md`): Phase 0-A/0-B の定義に「`ut-tdd setup --solo/--team` がこの 2-stage の emission を担う (検出→提案→確認→記録、PLAN-L6-05/L7-03)」を追記。branch protection は emit-only 既定で人間適用。
- **L4 external-if** (`docs/design/harness/L4-basic-design/external-if.md`): VCS・CI 境界に「`ut-tdd setup` の GitHub 設定境界 = ファイル emit (CODEOWNERS / workflow / ISSUE・PR テンプレ) は harness が書く / branch protection・Required 化は gh-api 操作で **emit-only 既定** (script 生成、適用は admin 人間サインオフ) / token は保持しない (gh 認証委譲)」の DbC 境界を追記。
- **L0 §10.3 機構用語** (`docs/governance/ut-tdd-agent-harness-concept_v3.1.md`): Phase 0-A (solo) / Phase 0-B (team) / 参加規模検出 / emit-only を back-merge (§G.9、機構用語)。
- **L6/L7 continuation** (`docs/design/harness/L6-function-design/setup-solo-team.md` / `docs/test-design/harness/L7-unit-test-design.md`): `ut-tdd setup project` は setup solo/team の extension として登録済み。VSCode task と `.ut-tdd` baseline は Phase 0 bootstrap の生成物であり、`identifierTransition` は `.helix` 目標と cutover blocker を示すだけで、branch protection / external API / secrets / identifier cutover を自動適用しない。`postSetupWorkflow` は consumer project の初回稼働ルートを first-run contract として出し、brownfield conflict と readiness 未充足を setup 成功と混同しない。`githubPlan` と `doctorBaseline` は L3/HAC-P6-03a の GitHub rules/checks plan / doctor baseline 要求に対応し、remote apply や completion claim を含まない。

> **なぜ新 FR でないか**: `ut-tdd setup` (リポジトリ初期化 + CODEOWNERS/branch protection bootstrap) は concept §512 が明示する **Phase 0 = V-model 工程外の基盤整備**であり、L1/L3 の機能要件 (FR-L1/FR) ではない。要件は §6.5/§9.1/§10 (Phase 0 governance) 側にあり、FR registry を増やさない。

## §工程表

### Step R4-1: 要件 §6.5 に ut-tdd setup solo/team emission を追記
### Step R4-2: L4 external-if に setup GitHub 境界契約 (file emit / emit-only / 人間サインオフ / token 非保持) を追記
### Step R4-3: L0 §10.3 機構用語に Phase 0-A/0-B / 参加規模検出 / emit-only を back-merge
### Step R4-3b: HELIX project setup continuation の L6/L7 back-fill
`ut-tdd setup project` を L6 setup design と L7 U-SETUP-015 に登録し、Phase 0 bootstrap の生成物であること、dry-run 副作用ゼロと emit-only 境界を維持すること、新 FR / irreversible cutover ではないことを明記。
### Step R-review: review 前置 (MUST)
`code-reviewer` で back-fill の妥当性 (新 FR 不要の判断 / GitHub 境界契約が impl と一致 / 用語定義) をレビュー。po (R3) intent 検証は escalation。
### Step R4-4: fr-registry-audit + 全回帰
`npx vitest run` (新 FR なし + 92 pass 維持)。

## §実装計画

| 項目 | 情報源 |
|------|--------|
| as-is 実装事実 | `src/setup/index.ts` / `tests/setup.test.ts` / `docs/templates/github/` (R0 evidence) |
| setup=Phase 0 工程外の判断 | concept §512 (Phase 0 = 基盤整備、工程外) + scout 監査 (FR-L1 不在) |
| GitHub 境界契約 (emit-only / token 非保持) | setup-solo-team.md §2.4 + external-if.md §5 (gh 認証委譲、harness core は token 非保持) |
| §6.5 整合 | 要件 §6.5 Phase 0-A/0-B 2-stage + §10.1/10.2 受入条件 |
| 用語 back-merge | PLAN-L6-05 §6 (Phase 0-A/0-B / 参加規模検出 / emit-only、導入層 L6) |

## §3 成否

- 要件 §6.5 + L4 external-if + L0 §10.3 が追記され、`ut-tdd setup` 実装が上位 (Phase 0 governance / GitHub 境界 / 用語) に trace 可能 (左腕孤児解消)
- **新 FR なし** + 全回帰 92 pass
- code-reviewer review APPROVE (L6/L7/Reverse 各段。Critical/Important 全解消)
- **R3 PASS**: (a) setup=Phase 0 工程外で新 FR 不要 は concept §512 + scout に grounded / (b)(c) emit-only・§6.5 整合 は L6 で PO 確定済。再エスカレーション不要でクローズ
- Add-feature 経路 B (L6→L7→Reverse→上位整合) の 1 サイクルが setup solo/team で完結 (session-log / forced-stop に続く dogfood 3 例目)。`status: confirmed`

## §4 carry

- **branch protection 適用の gh-api 実形 (`--apply-branch-protection`)** は opt-in path。実機 gh での PUT field 検証 (restrictions=null 等) は G7 後保守 (現状 emit-only script が主、CLI 直接適用は副)。
- **escalation-stale.yml テンプレの検出ロジック実装** (§6.8.4) は scaffold skeleton 止まり、利用者 repo 運用時に follow-up。
- **commitlint 配置** (standalone vs package.json) は対象 repo へ standalone emit で確定 (L7-03 Step 3)。
