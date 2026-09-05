---
plan_id: PLAN-RECOVERY-1548-review-evidence-projection-parity
title: "PLAN-RECOVERY-1548: review-evidence projection を untracked runtime locator の有無に依存させない"
kind: recovery
layer: cross
drive: agent
status: confirmed
completion_claim_allowed: false
backfill_state: pending
created: 2026-09-05
updated: 2026-09-05
owner: Claude / TL
github_issue_id: 1548
behavior_contract_id: REVIEW-EVIDENCE-PROJECTION-PARITY-001
responsibility_owner: state-db-projection
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: policy
complexity_effect: net_neutral
backprop_decision: not_required
backprop_decision_reason: "logical DB receipt の schema・policy・canonicalization は変えず、review-evidence projection の evidence_path 分類を HEAD tree 基準へ置き換えるだけ。過去 PLAN の provenance は書き換えない。"
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - regression_dev
contract_preconditions: "projectStructuredGreenCommandCaseEvidence は existsSync で evidence の有無を判定し、gitignore 済み runtime locator（.helix/harness.db）の有無で findings が変わる。workspace_attestation は ignore 済みファイルを見ないため clean=true のまま projection digest だけが環境依存になる。"
contract_postconditions: "evidence_path が HEAD tree に無い場合は存在確認も読込もせず green-command-evidence-untracked を記録する。同一 HEAD の clean clone と runtime DB ありの worktree で receipt の projection / checkpoint / receipt digest が一致する。"
contract_invariants: "tracked evidence の parse 結果、test_runs 行、receipt schema / policy / canonicalization contract を変更しない。過去 PLAN の evidence_path を書き換えない。git 管理外 root だけが従来判定へ fallback する。"
contract_failures: "untracked locator の有無で findings が変わる、staged-only を tracked と誤認する、git repo 内で HEAD tree 取得に失敗して filesystem 判定へ戻る、git 起動不能や dubious ownership を非 git と同一視する場合は fail-close する。"
tdd_red_required: true
red_test: "origin/main 版 projection-writer.ts で tests/review-evidence-projection-parity.test.ts を実行すると U-REVPAR-001/002/004/005/006 が red になる。"
red_at: "2026-09-05T03:14:16Z"
green_at: "2026-09-05T03:16:16Z"
mutation_oracle_required: true
mutation_oracle: "U-REVPAR-001/006 が環境依存の再発を、U-REVPAR-002/004 が index 正本化・存在判定回帰を、U-REVPAR-005/007 が暗黙 filesystem fallback を、U-REVPAR-003 が非 git fixture 経路の維持をそれぞれ検出する。"
mutation_oracle_evidence: "2026-09-05T03:08:48Z に初版 3 oracle で origin/main 版 projection-writer.ts が 2 failed／1 passed（出力 digest cef0d05c0d2d6b29…）、修正版で 3 passed（03:08:50Z）。Codex 途中確認（index/HEAD の区別、git 障害の暗黙 fallback、receipt 全体 parity）を受けて oracle を 7 件へ拡張し、2026-09-05T03:14:16Z に origin/main 版で 5 failed／1 passed（digest af6d758f1221ef54…）、修正版で 03:16:16Z に 7 passed を実測。実 repository でも同一 HEAD で .helix/harness.db の有無により logical DB receipt の projection_digest 6d24b2a4dc002288… が一致することを確認した。"
parent_design: docs/design/helix/L6-function-design/review-evidence-projection-parity.md
pair_artifact: docs/test-design/helix/L8-review-evidence-projection-parity-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/review-evidence-projection-parity.md, oracle_id: U-REVPAR-001, test_path: tests/review-evidence-projection-parity.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/review-evidence-projection-parity.md, oracle_id: U-REVPAR-002, test_path: tests/review-evidence-projection-parity.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/review-evidence-projection-parity.md, oracle_id: U-REVPAR-003, test_path: tests/review-evidence-projection-parity.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/review-evidence-projection-parity.md, oracle_id: U-REVPAR-004, test_path: tests/review-evidence-projection-parity.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/review-evidence-projection-parity.md, oracle_id: U-REVPAR-005, test_path: tests/review-evidence-projection-parity.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/review-evidence-projection-parity.md, oracle_id: U-REVPAR-006, test_path: tests/review-evidence-projection-parity.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/review-evidence-projection-parity.md, oracle_id: U-REVPAR-007, test_path: tests/review-evidence-projection-parity.test.ts }
dependencies:
  parent: docs/plans/PLAN-L7-44-harness-db-master.md
  requires: []
  references:
    - "issue:1548"
    - "issue:1522"
  blocks: []
agent_slots:
  - { role: aim, slot_label: "AIM — 過去 PLAN の provenance を書き換えていないことを監査" }
  - { role: tl, slot_label: "TL — HEAD tree 基準と fail-close 境界の責務を確認" }
  - { role: se, slot_label: "SE — tracked 集合判定と untracked finding を実装" }
  - { role: qa, slot_label: "QA — 別 root parity・index 誤認・暗黙 fallback の反例を検証" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-1548-review-evidence-projection-parity.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/review-evidence-projection-parity.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-review-evidence-projection-parity-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: tests/review-evidence-projection-parity.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: src/state-db/projection-writer.ts, artifact_type: source_module }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: yaml_config }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/feedback-refactor-disposition.json, artifact_type: json_config }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
review_evidence:
  - reviewer: Codex
    review_kind: cross_agent
    verdict: pass
    reviewed_at: "2026-09-05T03:36:39Z"
    tests_green_at: "2026-09-05T03:38:39Z"
    worker_model: claude-opus-5
    reviewer_model: codex
    reviewer_session_id: "019febe1-8983-7820-bee4-4cd62876f9b6"
    reviewed_head_sha: 43aa00ad8950f0c4a3b69612e2ee547c598e2d86
    receipt_url: "https://github.com/RetryYN/HELIX-HARNESS/pull/1550#issuecomment-5549087672"
    scope: "HEAD 43aa00ad8950f0c4a3b69612e2ee547c598e2d86 の L6/L8/PLAN 設計と U-REVPAR-001..007 の 7 反例、周辺 71 tests、現 HEAD の coding-rules + parity 19 tests、PR exact set 12 path と PLAN generates/modifies の一致、現 HEAD の logical DB receipt 収束（clean/converged）に対する Codex 独立技術 pass。reviewer_model は当該環境で確認できる codex の範囲であり Sol/Luna 等の推測を含まない。PR 最終 sealed approve、Ready 化、実装終端、全 CI、main read-after ではない。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests/review-evidence-projection-parity.test.ts tests/coding-rules.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-09-05T03:38:39Z"
        evidence_path: tests/review-evidence-projection-parity.test.ts
        output_digest: "sha256:ef4cab4310c0ff46a9c507437ca0cc72fbd07af3f82037a335fd458b74ac9e34"
---

# PLAN-RECOVERY-1548: review-evidence projection を untracked runtime locator の有無に依存させない

## 目的

PLAN は Codex の独立技術 pass に基づき confirmed とする。`completion_claim_allowed` は false を維持し、
PR 最終検収・全 CI・main read-after の未完了を PLAN freeze 成功で相殺しない。

Issue #1548 で観測された「同一 HEAD でも worktree と clean clone で logical DB receipt の projection digest が
割れ、独立 receipt が CI の admission で `review_receipt_invalid_or_stale` になる」状態を解消する。receipt の
schema や policy を緩めず、review-evidence projection の evidence_path 分類を **HEAD tree 基準**へ置き換える。

## 実測した欠陥

8 件の過去 PLAN（PLAN-L7-238 / 239 / 248 / 249 / 250 / 252 / 346 / 397）が `green_commands[].evidence_path`
に `.helix/harness.db` を引用している。`projectStructuredGreenCommandCaseEvidence` は `existsSync` で有無を
判定するため、gitignore 済みの同ファイルが存在する worktree では finding 0、存在しない clean clone（CI）では
`green-command-evidence-missing` が +8 となり、`findings` / `feedback_events` の行数と projection digest が変わる。

`workspace_attestation` は `git status --untracked-files=all` に基づくため ignore 済みファイルを見ず、
clean=true のまま projection だけが揺れる。Claude 側 receipt が通過していたのは、封緘用 worktree に
harness.db が無く偶然 CI と一致していたためである。

## 責務境界

- `src/state-db/projection-writer.ts`: `loadTrackedPathSet`（HEAD tree の path 集合、git 障害は fail-close）と
  `projectStructuredGreenCommandCaseEvidence` の分類。
- 過去 PLAN の `review_evidence` は **触らない**。runtime DB を測った証跡を別 artifact へ付け替えると provenance
  が偽装になる（Codex 合意条件）。
- receipt verifier（`src/doctor/l3-g3-logical-db-receipt.ts`）と policy は変更しない。

## 非対象

- 8 PLAN の `evidence_path` の書き換え。
- admission 失敗時に `candidate_diagnostics` を CI ログへ出す可観測性改善（Issue #1522 側で扱う）。
- `.helix/harness.db` 等を evidence として引用することを PLAN lint で拒否する新規 gate。
- `workspace_attestation` の ignore 済みファイル検出。

## 実装・検証

1. `loadTrackedPathSet(repoRoot, exec?)` を追加し、`git rev-parse --is-inside-work-tree` で repo を確認した後
   `git ls-tree -r -z --name-only HEAD` の集合を返す。stderr が `not a git repository` の場合だけ null。
2. `projectReviewEvidenceRegistry` で rebuild ごとに 1 回取得し、`projectStructuredGreenCommandCaseEvidence` へ渡す。
   集合に無い path は `green-command-evidence-untracked` を記録して返る。
3. `tests/review-evidence-projection-parity.test.ts` の `U-REVPAR-001` 〜 `U-REVPAR-007` で、locator 有無の
   決定性、index/HEAD の区別、暗黙 fallback 禁止、別 root の receipt 全体 parity を個別に束縛する。
4. Issue #1548 へ、実測 HEAD、RED/GREEN、実 repository の parity digest を read-after 記録する。
