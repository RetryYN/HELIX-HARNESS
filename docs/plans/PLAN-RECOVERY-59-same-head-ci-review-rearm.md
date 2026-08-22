---
plan_id: PLAN-RECOVERY-59-same-head-ci-review-rearm
title: "PLAN-RECOVERY-59 (recovery): same-HEAD CI attempt後のClaude review再arm"
kind: recovery
layer: cross
promotion_strategy: reuse-with-hardening
drive: agent
status: confirmed
completion_claim_allowed: false
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-16T19:51:01Z"
    tests_green_at: "2026-08-16T19:51:01Z"
    verdict: approve
    worker_model: codex
    reviewer_model: codex-intra-runtime
    scope: "Issue #735のsame-HEAD CI rerun incidentを現行cross-review dispatch、one-shot FSM、Claude receipt境界へ照合した。PR番号＋HEAD identityをCI run／attempt／conclusion generationから分離し、旧claim保持、新event再arm、同一generation冪等、非terminal fail-closeを確認した。Claude帰属は行っていない。"
    green_commands:
      - kind: unit_test
        command: "npm exec --offline -- vitest run tests/claude-memory-wake.test.ts tests/claude-pr-convergence.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        evidence_path: tests/claude-memory-wake.test.ts
        output_digest: "sha256:0b89d91379b3cfd90e55dca756378d16b6cbd7c87498866c3d17e62aa50e348b"
        result: "Claude memory wake／PR convergence 2 files、59 tests green"
      - kind: typecheck
        command: "npm exec --offline -- tsc --noEmit"
        runner: node
        scope: targeted
        exit_code: 0
        evidence_path: tsconfig.json
        output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        result: "TypeScript typecheck green"
      - kind: lint
        command: "npm exec --offline -- tsx src/cli.ts plan lint docs/plans/PLAN-RECOVERY-59-same-head-ci-review-rearm.md"
        runner: node
        scope: targeted
        exit_code: 0
        evidence_path: docs/plans/PLAN-RECOVERY-59-same-head-ci-review-rearm.md
        output_digest: "sha256:73da333f36332a8ce3d5451f427f690fe92d0cdb89d0bee7b36f6e62ffa95aed"
        result: "PLAN lint green"
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - "po_directive:Issue #735 same-HEAD CI rerun successが既存Claude claimへ再配送されずreview receiptが停滞する"
created: 2026-08-17
updated: 2026-08-19
owner: Codex / TL
github_issue_id: 735
behavior_contract_id: SAME-HEAD-CLAUDE-REARM-001
responsibility_owner: same-head-ci-review-rearm
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: consumer_migration
no_code_decision: modify
ddd_modeling_decision: value_object
contract_preconditions: "PR review requestがPR番号とHEADだけをidentityにし、CI attempt 1 failure後のattempt 2 successを新しいevidence generationとして表現できない"
contract_postconditions: "PR番号とHEADのreview identityを維持しながらterminal CI run／attemptをevidence generationへ束縛し、同一HEADの新attemptだけを新eventとして再armする"
contract_invariants: "旧claim・receipt・markerを上書きまたは削除せず、同一CI generationの再通知はidempotentにし、非terminal・stale・不在CIはfail-closeする"
contract_failures: "同一attemptの重複送信、queuedを偽装した再通知、CI attempt不在のreceipt生成、無制限rearm、旧HEADへの通知を拒否する"
tdd_red_required: false
tdd_red_waiver_reason: "既存のproduction finding #735を起点に、既存same-HEAD idempotence oracleを保持したままCI generation境界とclaim保持oracleを同一sliceで追加する"
mutation_oracle_evidence: "U-MEMWAKE-REARM-001がattempt 1 failure claim後のattempt 2 successを新eventへ再armし、同一attempt retryをalready_claimed／already_queuedへ分類する"
complexity_effect: justified_positive
complexity_justification: "PR identityとCI evidence generationを分離するためのtyped field、terminal run read-after、bounded statusを追加する"
removal_trigger: "GitHub review dispatchがCI evidence generationを共有canonical receiptへ直接投影し、旧legacy dispatchが0になった時点"
parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md
pair_artifact: docs/test-design/helix/L8-github-cross-review-admission-unit-test-design.md
dependencies:
  parent: docs/plans/PLAN-RECOVERY-40-github-cross-review-admission.md
  requires: []
  blocks: []
  references:
    - docs/governance/helix-harness-requirements_v1.3.md
    - docs/design/helix/L5-detail/github-cross-review-admission.md
    - docs/test-design/helix/L8-github-cross-review-admission-unit-test-design.md
    - src/runtime/claude-memory-wake.ts
    - src/runtime/claude-pr-convergence.ts
agent_slots:
  - { role: aim, slot_label: "AIM — #735 incident境界とCI generation identityの確定" }
  - { role: se, slot_label: "SE — CI evidence generationとPR review dispatch identityの分離" }
  - { role: qa, slot_label: "QA — same-HEAD attempt、非terminal、重複通知のnegative oracle" }
  - { role: tl, slot_label: "TL — #735 incident evidenceとClaude収束経路の照合" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-59-same-head-ci-review-rearm.md, artifact_type: markdown_doc }
  - { artifact_path: src/runtime/claude-memory-wake.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/claude-pr-convergence.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/github-cross-review-admission.ts, artifact_type: source_module }
  - { artifact_path: docs/design/helix/L5-detail/github-cross-review-admission.md, artifact_type: design_doc }
  - { artifact_path: src/runtime/independent-review-fallback.ts, artifact_type: source_module }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
  - { artifact_path: docs/governance/feedback-refactor-disposition.json, artifact_type: json_config }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-wrapper-admission.md, artifact_type: design_doc }
  - { artifact_path: tests/claude-memory-wake.test.ts, artifact_type: test_code }
  - { artifact_path: tests/claude-pr-convergence.test.ts, artifact_type: test_code }
  - { artifact_path: tests/github-cross-review-admission.test.ts, artifact_type: test_code }
  - { artifact_path: tests/github-issue-closure-graph-adapter.test.ts, artifact_type: test_code }
  - { artifact_path: tests/independent-review-fallback.test.ts, artifact_type: test_code }

---

# same-HEAD CI attempt後のClaude review再arm

## R0 現状採取

`pr-notify`とClaude inboxのdedup keyはPR番号とHEADだけであり、CI attempt 1 failure後に同じHEADのattempt 2
successが発生しても、既存claimを返して新しいClaude turnを作らなかった。senderはqueued successを返すため、
利用者からは通知成功に見えるが、review receiptはfailure generationのまま停滞した。

## R1 修復境界

PR review request identityとCI evidence generationを別軸に分離する。CI generationはGitHubのterminal
`harness-check` run ID、attempt、conclusionのtupleであり、PR番号やHEADの代用にはしない。

## R2 契約

```text
PR + HEAD
  → terminal harness-check run + attempt + conclusion
  → review evidence generation
  → Claude inbox event / one-shot marker / receipt
```

同一generationは冪等にし、新generationだけを`supersedes`付きの新eventとして発行する。旧eventのclaim、
marker、receiptは保存する。非terminal、CI不在、HEAD不一致、merge済みPRは通知を発行しない。

## R3 実装範囲

- `dispatchMeasuredPrToClaude`へtyped CI evidence generationを追加する。
- `pr-notify`はcurrent HEADに対するterminal `harness-check` runをGitHub read-afterする。
- same-HEADの新attemptでは最大8世代までbounded rearmし、同一attemptは`already_queued_no_new_evidence`または
  `already_claimed_no_new_evidence`を返す。
- 8世代の上限到達後は`claude_pr_evidence_generation_limit_reached`でfail-closeし、既存markerを削除せず、
  HEADを進めてCIを再実行してから新しい通知を開始する。
- `pr-notify`のCI evidence取得がunavailable、non-terminal、missingの場合は各専用failureでfail-closeし、
  Claude inbox eventを発行しない。
- PRをreadyへ移す前に、draft時に成功したcurrent HEADのCI generationで`pr-notify`を発行し、
  delivery/claimを確認する。ready後のreview admission failureを唯一のCI evidenceとして再通知しない。
- 既存のcross-runtime author attestation、one-shot FSM、receipt seal、merge gateを弱めない。

## R4 Forward再入

U-MEMWAKE-REARM-001〜003、U-CPRCONV-026、既存Claude convergence oracle、typecheck、Biome、PLAN lint、CI、
Claude exact-HEAD review、DB convergence、main read-afterが同一HEADでgreenになるまでcompletion claimを許可しない。

## #764 追補oracle

Issue #764では、実装済みのrearm上限と`pr-notify`のCI evidence境界を回帰oracleへ固定する。

- `U-MEMWAKE-REARM-003`: 8世代のrearmを許可し、9世代目をfail-closeしてinboxを増やさない。
- `U-CPRCONV-026`: CI evidenceのunavailable、non-terminal、missingの3分岐で外部通知を発行しない。
- bounded rearm上限へ到達した場合の運用復旧は、marker削除ではなくHEAD更新、CI再実行、再通知とする。

## #769 追補: review receipt generation identity

#735のrearmが発行する `ci_evidence_generation` と、receipt保存・comment seal・merge admissionのidentityを同一の
typed tupleへ束縛する。current receiptはv4とし、identityを次で固定する。

```text
repository + PR number + HEAD SHA + reviewer runtime +
run:<terminal harness-check run id>:attempt:<attempt>:<conclusion>
```

v3 receiptは `validateClaudePrReviewReceipt` で検証できるcompatibility read-only decoderとして残すが、
`loadClaudePrReviewReceipt`、comment read-after、current GitHub Ready admission、merge admissionの正本には昇格させない。
同一generationの保存は同一bytesを再利用して冪等にし、別generationは世代を含むimmutable filename／receiptIdへ分離し、
直前のcurrent receiptを `supersedesReceiptId` で参照する。stale generation、run／conclusion／attempt不一致、非terminal
またはworkflow／event不一致はfail-closeする。

追加した回帰oracleは `U-CPRCONV-028`（typed generationとidentity）、`U-CPRCONV-029`（v3 read-only）、
`U-CPRCONV-030`（supersedes／同一generationの冪等保存）、`U-CPRCONV-031`（stale merge admission）、
`U-GCRA-030`（v3 current admission拒否）である。`recordClaudePrReviewTerminal`も同一generationのinbox projectionだけを
REVIEWED／TERMINALへ進める。

#769のcompletion claimは、同一HEADでのattempt 1 failure → attempt 2 successのreceipt発行、同一generation再保存、
旧generationのmerge拒否、active Claude exact-HEAD review、全回帰、doctor、DB convergence、main read-afterをすべて
実測してから許可する。

## #769再発防止追補: 最新CI世代のadmission

同一HEADのReady化、CI rerun、workflow transitionで対象 `harness-check` が新世代へ進んだ場合、過去の成功runと
旧Claude receiptの組だけではcurrent admissionを成立させない。candidate HEAD、対象PR、workflow、event、run／attempt、
`updated_at`を照合して最新世代を一意に選び、receiptがその世代へ一致しない場合はfail-closeする。

最新世代がin progressまたはfailureの間は、過去世代のsuccessを再利用しない。最新世代のterminal successに対するClaude
current exact-HEAD receiptが発行され、comment、DB、receipt generationの因果順が成立した場合だけReady／merge admissionを
許可する。今回の回帰oracle `U-GCRA-003c` は、Ready後の新世代in progress、旧receiptのままの新世代success、最新世代receiptの
再発行成功を固定する。
