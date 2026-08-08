---
plan_id: PLAN-L5-96-python-worker-adr010-rebaseline
title: "PLAN-L5-96 (add-design): python-worker-runtime L5/L6 の ADR-010 呼称是正（#230 L5 フェーズ）"
kind: add-design
layer: L5
drive: agent
status: confirmed
route_mode: add-feature
entry_signals:
  - "po_directive:2026-08-06 Design HARNESS未ブロックタスクとして#230 Python意味コアとNode transaction境界を進める"
created: 2026-08-08
updated: 2026-08-08
backprop_decision: not_required
backprop_decision_reason: "PLAN-L4-53 confirmed（L4 §0 が旧proposal-only呼称をcompatibility debtと宣言）の forward route どおりの L5/L6 呼称是正。機能契約（JSON Lines envelope・digest検証・quarantine・API表・oracle群）は変更しない。"
owner: Claude / TL
github_issue_id: 230
engineering_discipline_required: true
behavior_contract_id: SA-PSC-01
responsibility_owner: python-semantic-core-node-boundary
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: no_change
ddd_modeling_decision: none
contract_preconditions: "PLAN-L4-53 confirmed の L4 §0 用語規約（Python意味コア／Node実行境界＝同格の層別権威、旧proposal-only呼称の廃止）を正本とする。schema 機械識別子（proposal_digest / proposal_only 等）は versioned contract として据え置く"
contract_postconditions: "L5/L6 python-worker-runtime の authority 主張 prose が ADR-010 呼称へ是正され、L4 §0 への呼称正本参照が両 doc に入る。機能契約（component 境界・API 表・oracle 群・failure union・state machine）は不変"
contract_invariants: "prose の呼称のみを変更し、schema field 名・API 名・oracle ID・failure code を変更しない。既存 L7 実装着手条件（supply-chain gate 等の未freeze 項目）を緩めない"
contract_failures: "設計ゲート（vmodel-pair / design-language / L12 recognition inventory / design-coverage）の違反は CI fail-close。呼称是正が機能契約を変えた場合は設計レビューで request changes とする"
tdd_red_required: false
complexity_effect: justified_positive
complexity_justification: "#230 L5 フェーズの呼称是正。既存 2 doc の prose 修正のみ"
removal_trigger: "L5/L6 python-worker-runtime がsupersedeされ、後継設計へ置換された時"
parent_design: docs/design/helix/L4-basic-design/python-semantic-core-node-boundary.md
pair_artifact: docs/test-design/helix/L4-python-semantic-core-node-boundary-system-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - { role: aim, slot_label: "AIM — 呼称是正の範囲確定（prose のみ、識別子据え置き）" }
  - { role: tl, slot_label: "TL — ADR-010 整合と機能契約不変のレビュー" }
generates:
  - { artifact_path: docs/plans/PLAN-L5-96-python-worker-adr010-rebaseline.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L5-detail/python-worker-runtime.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L6-function-design/python-worker-runtime.md, artifact_type: design_doc }
dependencies:
  parent: docs/plans/PLAN-L4-53-python-semantic-core-node-boundary.md
  requires:
    - docs/plans/PLAN-L4-53-python-semantic-core-node-boundary.md
    - docs/adr/ADR-010-python-semantic-core-node-commit-boundary.md
review_evidence:
  - reviewer: "Claude code-reviewer subagent (intra-runtime)"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-08T07:56:14Z"
    tests_green_at: "2026-08-08T07:56:14Z"
    verdict: approve
    worker_model: claude-fable-5
    reviewer_model: claude-sonnet-5
    scope: "Codex CLIがusage limit継続中のため規定代替のintra_runtime_subagentとして設計レビューを実施した。reviewerはgit diff origin/mainの4 hunk全行をL4 §0（PLAN-L4-53 merge済み）・ADR-010決定1〜4・ADR-009と突合し、prose-onlyであること（API表・schema interface・oracle ID・failure union・state machineの不変）、ADR-009改定注記の部分改定対応、L7実装着手条件（supply-chain gate等）の非緩和、旧呼称の残存0件（機械識別子の据え置きは正）を確認してapprove（Critical/Important 0、Minor 1件=読み替え規約の出典表現がL4 §0由来と誤読され得る）。Minorは同roundで是正済み（L4 §0の原則に基づく本書独自の詳細化として既存state result_stagedと関連付ける表現へ変更）。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --configLoader runner --project fast tests/vmodel-pair.test.ts tests/design-language.test.ts tests/design-coverage.test.ts tests/l12-hybrid-recognition.test.ts tests/l12-canonical-authority.test.ts tests/ddd-tdd-rules.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-08T07:56:14Z", evidence_path: docs/design/helix/L5-detail/python-worker-runtime.md, output_digest: "sha256:bec046330ed25ddec6dabdc15863eb9f56867cc5dcbb5d344a4364d7ef0c5cb5", result: "worktree: 6 files / 126 tests green（vmodel-pair・design-language・design-coverage・L12 recognition・ddd-tdd）" }
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-08T07:56:14Z"
  review_binding:
    reviewer: "Claude code-reviewer subagent (intra-runtime)"
    reviewed_at: "2026-08-08T07:56:14Z"
    evidence_digest: "sha256:326f7ef9959aac3cd7962b0db6848cb952c2ef3ed25e77561711417b037f1e34"
  entries: []
---

# PLAN-L5-96 (add-design): python-worker-runtime L5/L6 の ADR-010 呼称是正

## 0. 目的

PLAN-L4-53 の L4 §0 用語規約に従い、既存 L5/L6 python-worker-runtime 設計の旧
「proposal-only / 非authoritative proposal」authority 主張 prose を ADR-010 の
「Python 意味コア／Node 実行境界（同格の層別権威）」へ是正する。

## 1. スコープ

- L5 §0: 適用境界の authority 記述を是正し、L4 §0 への呼称正本参照と schema 機械識別子
  （`proposal_digest` / `proposal_only` = staged / Node 再検証待ち）の読み替え規約を明記。
  ADR-009 の proposal-only 記述へ ADR-010 改定注記を付与。
- L6 §1.1: 「Pythonはproposal-only」を「PythonはADR-010の意味コア」へ是正し、呼称正本参照を明記。
  §末尾の実装手順の「proposal-only authority検査」を「zero-authoritative-write検査
  （`proposal_only` receipt契約）」へ是正。
- 変更しないもの: schema field 名・API 名・oracle ID・failure code・state machine・
  L7 実装着手条件（supply-chain gate 等の未freeze 項目）。

## 2. 後続（本PLAN非対象）

- L5/L6 の実装詳細化（semantic contract 層 / sidecar / intake receipt の設計追記）
- L6 実装 ↔ L7 TDD closure（slice1 = Node revalidator から）
