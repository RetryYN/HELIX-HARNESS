---
plan_id: PLAN-L7-1612-merge-admission-terminal-diagnosis
title: "PLAN-L7-1612 (troubleshoot): merge admission の pr_not_open を「reviewed HEAD で既に merge 済み」と区別する"
kind: troubleshoot
layer: L7
drive: agent
status: draft
completion_claim_allowed: false
irreversible_impact: none
created: 2026-09-07
updated: 2026-09-07
owner: Claude 収束レーン / TL
github_issue_id: 1612
behavior_contract_id: MERGE-ADMISSION-DIAGNOSIS-1612
responsibility_owner: claude-pr-convergence
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: policy
complexity_effect: net_neutral
complexity_justification: "既存 admission の判定結果は変えず、terminal state の診断 reason を 1 件追加するだけで分岐構造を増やさない。"
removal_trigger: "reviewed-merge read-after receipt が全 executor で共有され、後着 executor が pr_not_open を観測しなくなった時"
backprop_decision: not_required
backprop_decision_reason: "Issue #1609 で観測した後着 executor の誤診（pr_not_open を raw merge と解釈）を、admission の判定を緩めずに診断 reason で区別する troubleshoot であり、要求・設計契約の意味を変更しない。"
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - regression_dev
contract_preconditions: "pr-merge-reviewed が current PR state（OPEN / CLOSED / MERGED）と merge commit の親を GitHub から取得できる。"
contract_postconditions: "state が MERGED かつ merge commit の第 2 親が receipt.headSha と一致する場合だけ reasons に pr_already_merged_at_reviewed_head を出し、それ以外の非 OPEN は従来どおり pr_not_open を出す。admission の ok:false 判定は不変。"
contract_invariants: "receipt の HEAD・CI generation・DB convergence・PLAN binding・runtime 独立性の各検査を緩和しない。merge を実行しない dry-run の観測にのみ影響する。"
contract_failures: "merge commit の親が取得できない場合は mergeCommit を未設定とし pr_not_open へ fail-close する。"
tdd_red_required: false
tdd_red_waiver_reason: "正規 worker canary（Issue #1612、team_run_id 94801232-fbed-4656-8697-de46eb39607c）で se worker が実装とテストを同一 turn で生成したため red 実測を持たない。oracle U-CPRCONV-043 は MERGED+一致 / MERGED+不一致 / CLOSED の 3 分岐を独立に固定する。"
mutation_oracle_required: false
agent_slots:
  - { role: se, slot_label: "SE — codex-se worker（gpt-5.6-sol）が clean clone 上で実装" }
  - { role: tl, slot_label: "TL — 独立 review は Codex レーンが exact HEAD receipt で実施" }
  - { role: aim, slot_label: "AIM — admission 判定を緩めず診断 reason のみ追加であることを監査" }
dependencies:
  parent: docs/plans/PLAN-L7-473-claude-pr-convergence.md
  requires: []
  references:
    - "issue:1612"
    - "issue:1609"
    - "issue:1616"
generates:
  - { artifact_path: docs/plans/PLAN-L7-1612-merge-admission-terminal-diagnosis.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: src/runtime/claude-pr-convergence.ts, artifact_type: source_module }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: tests/claude-pr-convergence.test.ts, artifact_type: test_code }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
  - { artifact_path: docs/governance/feedback-refactor-disposition.json, artifact_type: json_config }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-wrapper-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
review_evidence: []
---

# PLAN-L7-1612 (troubleshoot): merge admission の pr_not_open を「reviewed HEAD で既に merge 済み」と区別する

## 0. 目的

Issue #1609 で、同一 receipt に対し 2 つの executor が `pr-merge-reviewed` を並行起動した際、後着側の dry-run / apply が
`pr_not_open` を返し、これを「先着が raw merge した」と誤診した。実際は admission 経由で merge 済みであった。
本 PLAN は admission の判定（ok:false）を変えずに、terminal state の診断 reason を区別する。

## 1. 変更範囲

- `evaluateClaudePrMerge`（src/runtime/claude-pr-convergence.ts）: state が `MERGED` かつ `mergeCommit.parents[1] === receipt.headSha` のとき
  `pr_already_merged_at_reviewed_head`、それ以外の非 OPEN は `pr_not_open`。
- `pr-merge-reviewed`（src/cli.ts）: `gh pr view --json mergeCommit` と `gh api repos/{repo}/git/commits/{oid}` から parents を取得し、
  `ClaudePrMergeState.mergeCommit`（optional）へ渡す。取得失敗は未設定（pr_not_open へ fail-close）。
- oracle: tests/claude-pr-convergence.test.ts `U-CPRCONV-043`（MERGED+一致 / MERGED+不一致 / CLOSED の 3 分岐）。

## 2. 正規 worker canary としての位置づけ

本 PLAN の実装は `helix team run --execute --worker-context-file` による se worker（codex-se）が clean clone 上で生成し、
Claude 収束レーンが commit / push / PR 化した。worker 実行の所見（budget 未強制、nested `claude --print` の非終端、
`.helix/teams` / `.helix/worker-context` の gitignore と guide の乖離）は Issue #1616 に記録した。

## 3. 完了条件

- fresh CI green、Codex レーンの exact HEAD 独立 review receipt、admission 経由 merge。
- 本 PLAN は draft のまま merge し、review_evidence の転記と confirm は後続で行う（completion_claim_allowed: false）。
