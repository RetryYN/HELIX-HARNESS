---
plan_id: PLAN-RECOVERY-81-checkout-pathspec-guard
title: "PLAN-RECOVERY-81: checkout pathspec guard"
kind: recovery
layer: cross
drive: agent
status: confirmed
completion_claim_allowed: false
backfill_state: pending
created: 2026-09-02
updated: 2026-09-02
owner: Codex / TL
github_issue_id: 1389
behavior_contract_id: GIT-CHECKOUT-PATHSPEC-GUARD-001
responsibility_owner: git-command-guard
engineering_discipline_required: true
change_slice: atomic
refactor_step: strengthen_boundary
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: value_object
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - "po_directive:外部監査で検出したP0 git checkout pathspec bypassを正規Recoveryする"
contract_preconditions: "hookが実効cwdとrepositoryを解決できる"
contract_postconditions: "ref-only targetだけが許可され、path／曖昧／未解決targetはfail-closeする"
contract_invariants: "正規branch checkoutとbranch作成を維持し、文字列中のslashだけで判定しない"
contract_failures: "path、ref/path衝突、ref解決失敗をstable blockへ変換する"
tdd_red_required: true
red_test: "U-GITGUARD-015追加前はgit checkout .とgit checkout base.txtがexit 0"
red_at: "2026-09-02T07:43:00+09:00"
green_at: "2026-09-02T07:45:14+09:00"
mutation_oracle_required: true
mutation_oracle_evidence: "checkout target resolutionをrefs-onlyへ固定するとU-GITGUARD-015のpath／collision反例がfailedし、実cwdのpath存在とgit rev-parse照合へ復元後はtests/git-command-guard.test.ts 35 tests green／exit 0。"
complexity_effect: net_neutral
complexity_justification: "既存guardへ単一typed contextを追加し、別guardや禁止語一覧を作らない"
removal_trigger: "なし。destructive git境界の恒久不変条件"
backprop_decision: not_required
backprop_decision_reason: "PLAN-L7-230の破壊操作阻止意図を変えず、漏れていたcheckout pathspecを復旧する"
parent_design: docs/design/helix/L6-function-design/checkout-pathspec-guard.md
pair_artifact: docs/test-design/helix/L8-checkout-pathspec-guard-unit-test-design.md
dependencies:
  parent: PLAN-L7-230-destructive-git-command-guard
  requires:
    - docs/plans/PLAN-L7-230-destructive-git-command-guard.md
  references:
    - "issue:1389"
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-81-checkout-pathspec-guard.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/checkout-pathspec-guard.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-checkout-pathspec-guard-unit-test-design.md, artifact_type: test_design }
modifies:
  - { artifact_path: src/runtime/git-command-guard.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/git-command-guard-hook.ts, artifact_type: source_module }
  - { artifact_path: tests/git-command-guard.test.ts, artifact_type: test_code }
agent_slots:
  - { role: se, slot_label: "SE — ref/path identity境界" }
  - { role: qa, slot_label: "QA — pathspec／衝突／ref regression" }
  - { role: tl, slot_label: "TL — destructive boundary終端" }
review_evidence: []
---

# checkout pathspec guardの復旧

`git checkout`のtargetを実効cwd上のpath存在とGit ref解決で分類する。pathとrefが衝突する場合、
targetが解決不能な場合、複数targetでpathspecになり得る場合は推測せずblockする。
