---
plan_id: PLAN-L7-564-pr-review-comment-seal
title: "PLAN-L7-564 (impl): PR review receiptの実comment seal強制"
kind: impl
layer: L7
drive: agent
status: confirmed
completion_claim_allowed: false
route_mode: forward
entry_signals:
  - "po_directive:Issue #712 null commentUrlでplaceholder review receiptがsealされる欠陥を是正する"
created: 2026-08-15
updated: 2026-08-17
owner: Codex / TL
github_issue_id: 712
engineering_discipline_required: true
behavior_contract_id: CLAUDE-PR-RECEIPT-COMMENT-SEAL-001
responsibility_owner: claude-pr-convergence
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: value_object
contract_preconditions: "review receipt inputのcommentUrlは省略、null、空文字、実GitHub comment URLのいずれかとして受信する"
contract_postconditions: "省略、null、空文字は同じ投稿必須状態へ正規化し、実comment URLを取得してread-afterでsealed bodyを確認してからだけreceiptをsealする"
contract_invariants: "placeholder URL、GitHubに存在しないURL、receipt bodyがdigest不一致のURLをcurrent receipt authorityへ保存せず、既存のGitHub comment slotとcanonical digest契約を維持する"
contract_failures: "非string commentUrlをcomment_url_invalidで拒否し、comment投稿失敗・read-after不成立時はreceiptをpersistせず、merge直前もfail-closeする"
tdd_red_required: true
red_at: "2026-08-15T06:10:00Z"
green_at: "2026-08-15T06:20:00Z"
mutation_oracle_evidence: "2026-08-15T07:41:27Zにsrc/runtime/claude-pr-convergence.tsのplaceholder分岐をrequiresPost:trueからfalseへ一時mutationし、U-CPRCONV-025単体が1 failed、exit 1となるkillを実測した。復元後はtests/claude-pr-convergence.test.tsの36 tests greenを確認した。2026-08-15T08:34:43Zに明示placeholder URL拒否条件を一時削除し、同oracleが1 failed、exit 1でmutationをkillすることも実測後に復元した。非stringと不正URL入力は同oracleのcomment_url_invalid期待がfail-close契約を固定する"
complexity_effect: net_neutral
complexity_justification: "placeholder生成と投稿要否を単一pure functionへ集約し、CLIに重複していたraw値判定を削除する"
removal_trigger: "receipt comment投稿とsealが単一transactional GitHub adapterへ統合された時点でhelperを同adapterへ移す"
parent_design: docs/design/helix/L6-function-design/orchestration-memory.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/orchestration-memory.md, oracle_id: U-CPRCONV-025, test_path: tests/claude-pr-convergence.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/orchestration-memory.md, oracle_id: U-CPRCONV-026, test_path: tests/claude-pr-convergence.test.ts }
agent_slots:
  - role: se
    slot_label: "SE — comment seal intentの単一正規化"
  - role: qa
    slot_label: "QA — null、空文字、非string反例"
  - role: tl
    slot_label: "TL — GitHub実commentとreceiptの照合"
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-15T07:34:40Z"
    tests_green_at: "2026-08-15T07:34:40Z"
    verdict: approve
    worker_model: codex-gpt-5
    reviewer_model: codex-intra-runtime
    scope: "Issue #712のatomic sliceについて、commentUrlの省略、null、空文字が全てrequiresPost=trueとなり、実URLだけがfalse、非stringがcomment_url_invalidでfail-closeすることをtargeted testで確認した。Claude Code Opus exact-HEAD独立reviewはPR terminal gateとして別途必須であり、本証跡はPLAN confirm用に限定する。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --project fast tests/claude-pr-convergence.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-15T07:34:40Z"
        evidence_path: tests/claude-pr-convergence.test.ts
        output_digest: "sha256:e4846992b68be8869d07ef4d2fbcf781d4f4ec74d3536cd550ab2e4902dffd61"
        result: "1 file / 36 tests passed"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-15T07:34:40Z"
  review_binding:
    reviewer: codex-intra-runtime
    reviewed_at: "2026-08-15T07:34:40Z"
    evidence_digest: "sha256:aa890cd863c08e6ee2bfbff2c303bb20a79c02348465249eb6be087a05bfbf80"
  entries: []
generates:
  - { artifact_path: docs/plans/PLAN-L7-564-pr-review-comment-seal.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-wrapper-admission.md, artifact_type: design_doc }
  - { artifact_path: src/runtime/claude-pr-convergence.ts, artifact_type: source_module }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: tests/claude-pr-convergence.test.ts, artifact_type: test_code }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: config }
dependencies:
  parent: docs/plans/PLAN-L7-474-claude-pr-db-receipt-binding.md
  requires:
    - src/runtime/claude-pr-convergence.ts
  references:
    - docs/design/helix/L4-basic-design/worker-wrapper-admission.md
  blocks: []
---

# PLAN-L7-564: PR review receiptの実comment seal強制

## 目的

`commentUrl: null`または空文字を投稿済みと誤認し、placeholder URLをcurrent receiptへ保存できる欠陥を閉じる。入力表現に依存せず、実GitHub commentの取得後だけcanonical receiptをsealする。

## 非対象

- review verdict、DB convergence、merge admissionの意味変更。
- GitHub comment slot数またはreview providerの変更。
- 分類registry、runtime route migrationへの便乗。

## 完了条件

- 省略、null、空文字がすべて実comment投稿必須になる。
- 実comment URLだけが投稿済み入力として扱われる。
- 非string入力をfail-closeする。
- CLIのslot検査と投稿分岐が同じ判定結果を使う。
- well-formedでもGitHubに存在しないcomment URLをread-afterで拒否する。
- URLが実在してもsealed receipt bodyとlocal receipt digestが一致しない場合は拒否する。
- `pr-review-receipt --apply`のpersist前と`pr-merge-reviewed --apply`のmerge前にread-afterを通す。
- targeted test、typecheck、full CI、Claude Code Opus exact-HEAD reviewがgreenになる。
