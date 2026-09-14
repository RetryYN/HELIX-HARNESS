---
plan_id: PLAN-RECOVERY-53-external-invariant-errata
title: "PLAN-RECOVERY-53 (recovery): external 実測の contract_invariants にある偽の claim を訂正する"
kind: recovery
layer: cross
drive: agent
status: confirmed
route_mode: recovery
entry_signals:
  - "po_directive:2026-07-11 GitHub 自走運用（通常 lane は明示依頼を待たず push→PR→merge まで継続する）に基づき、PR #569 の Claude 収束レビュー B-1（https://github.com/RetryYN/HELIX-HARNESS/pull/569#issuecomment-5258922628 ）で指摘したまま merge された偽 claim を successor で自走回収する"
created: 2026-08-12
updated: 2026-08-12
owner: Claude / TL
github_issue_id: 553
engineering_discipline_required: true
behavior_contract_id: GITHUB-CROSS-REVIEW-ADMISSION-001
responsibility_owner: github-cross-review-admission
change_slice: atomic
refactor_step: not_applicable
legacy_retirement_state: not_applicable
no_code_decision: modify
ddd_modeling_decision: none
backprop_decision: not_required
backprop_decision_reason: "契約の意味は PLAN-RECOVERY-51 の実装時点から変わらない。訂正するのは契約を記述した文であり、要件・設計契約そのものの追加や変更ではない"
contract_preconditions: "PLAN-RECOVERY-51 の contract_invariants は『既存 PR の測定結果を 1 件も変えない』と記述している。同文言は L5 detail design と L8 unit test design、および tests/claude-pr-convergence.test.ts の comment へも伝播している"
contract_postconditions: "同 4 箇所が『bot 著でない既存 PR の測定結果を変えない』へ限定される。PLAN-RECOVERY-51 は PLAN-RECOVERY-53 を指す訂正注記を持ち、双方向の errata リンクが成立する"
contract_invariants: "measuredAuthorRuntimeFromCommits の挙動を変更しない。oracle の assertion を変更しない。PLAN-RECOVERY-51 の他の契約記述（bot と HELIX runtime commit の混在で external を返さない、mixed の exact-two、merge parent 数による除外、単一 call site 束縛）は不変"
contract_failures: "訂正後も『1 件も変えない』相当の無限定な表現が残る場合、および PLAN-RECOVERY-51 側の back-reference が欠落する場合は doctor plan-supersession が fail-close する"
tdd_red_required: false
mutation_oracle_evidence: "本 PLAN は prose の訂正のみで挙動を変えないため新規 oracle を追加しない。訂正後の文が主張する範囲は既存 oracle U-CPRCONV-EXT-001（tests/claude-pr-convergence.test.ts）が既に両方向で固定している。すなわち (a) 全実装 commit が bot 著かつ trailer 皆無の母集団は external を返す（PR #384 の実 evidence 形状）、(b) bot flag を持たない claude / codex / mixed の母集団は従来どおりの値を返す。訂正前の文『既存 PR の測定結果を 1 件も変えない』は (a) と矛盾しており、oracle が (a) を要求している以上、この文は oracle によって既に反証されている。実測でも PR #384 は codex から external へ変わり（直近 30 PR の旧実装・新実装比較では差分 0、repository 内の bot 著 PR は #384 の 1 件のみ）、変更が意図どおり bot 著 PR に限局することを確認済みである"
complexity_effect: net_neutral
supersedes:
  - PLAN-RECOVERY-51-external-author-attestation
parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md
pair_artifact: docs/test-design/helix/L8-github-cross-review-admission-unit-test-design.md
verification_bindings: []
agent_slots:
  - { role: aim, slot_label: "AIM — 偽 claim の伝播先 exact set の同定" }
  - { role: tl, slot_label: "TL — errata として successor 分離が必要かの判定" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-53-external-invariant-errata.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-RECOVERY-51-external-author-attestation.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L5-detail/github-cross-review-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-github-cross-review-admission-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: tests/claude-pr-convergence.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-RECOVERY-51-external-author-attestation.md
  requires: []
  blocks: []
review_evidence:
  - reviewer: "Codex / GPT-5"
    review_kind: cross_agent
    tests_green_at: "2026-08-11T22:55:11Z"
    reviewed_at: "2026-08-11T22:56:07Z"
    verdict: approve
    worker_model: claude-opus-5
    reviewer_model: gpt-5
    scope: "PR #574 HEAD a3f5123457473b66ed7d2c5972030f9eb1b78d7e を clean isolated worktree で独立レビューした。PLAN-RECOVERY-51、L5/L8設計、U-CPRCONV-EXT-001 comment の exact prose 訂正、#384 の codex→external 変化との整合、双方向 supersedes/back-reference を照合した。src behavior と oracle assertion は不変で、correctness・security・data-loss blocker 0 と判定した。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests/claude-pr-convergence.test.ts --reporter=dot"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-11T22:55:11Z"
        evidence_path: tests/claude-pr-convergence.test.ts
        output_digest: "sha256:6773439336cb7c86c7b32e44f1e8fdbb3eb7fbbc72befe45278045352467c2b6"
        result: "34 passed"
---

# PLAN-RECOVERY-53：external 実測の contract_invariants にある偽の claim を訂正する

## §1 何が誤りか

PLAN-RECOVERY-51 の `contract_invariants` は次を含む。

```
既存 PR の測定結果を 1 件も変えない（external は全件 bot 著かつ trailer 皆無のときだけ返る）
```

**PR #384 は `codex` → `external` に変わる。** これは同 PLAN が解消しようとした Issue #553（「attestation が bot 著の PR を codex 著と誤帰属する」）そのものであり、`contract_invariants` は PLAN 自身の目的と矛盾している。

括弧書きから意図は「**bot 著でない**既存 PR の測定結果を変えない」だと読める。誤っているのは意味ではなく、無限定に書かれた文である。

## §2 なぜ silent に直さないか

`contract_invariants` は後続 PLAN が非回帰の基準として引く契約記述である。「1 件も変えない」を字義どおり残すと、#384 の測定が変わったことを後から regression と誤判定できてしまう。

一方で PLAN-RECOVERY-51 は既に confirmed であり merge 済みである。`CLAUDE.md` の PLAN claim discipline に従い、原 PLAN を黙って上書きせず successor で訂正し、双方向の errata リンクを残す（`doctor plan-supersession` が片肺 errata を fail-close する）。

## §3 訂正の exact set

| # | path | 訂正前 | 訂正後 |
|---|---|---|---|
| 1 | `docs/plans/PLAN-RECOVERY-51-external-author-attestation.md` | 既存 PR の測定結果を 1 件も変えない | bot 著でない既存 PR の測定結果を変えない |
| 2 | `docs/design/helix/L5-detail/github-cross-review-admission.md` | この条件はこれまで存在しなかったため既存PRの測定結果は変わらない | 同条件はbot著PRにしか当たらないため、bot著でない既存PRの測定結果は変わらない |
| 3 | `docs/test-design/helix/L8-github-cross-review-admission-unit-test-design.md`（`U-CPRCONV-EXT-001` 行） | 既存3値の測定結果は不変 | bot flagを持たない母集団の測定結果は不変 |
| 4 | `tests/claude-pr-convergence.test.ts`（`U-CPRCONV-EXT-001` 内 comment） | 既存 3 値は 1 件も変わらない | bot flag を持たない母集団は変わらない |

加えて PLAN-RECOVERY-51 へ本 PLAN を指す訂正注記を追記する。

## §4 何を変えないか

- `measuredAuthorRuntimeFromCommits` の実装
- `U-CPRCONV-EXT-001` の assertion（訂正するのは同 oracle 内の comment 1 行のみ）
- PLAN-RECOVERY-51 のその他の契約記述

## §5 検証

新規 oracle は追加しない。訂正後の文が主張する範囲は `U-CPRCONV-EXT-001` が既に両方向で固定している。

```ts
// (a) 全実装 commit が bot 著かつ trailer 皆無 -> external（PR #384 の実 evidence 形状）
expect(measuredAuthorRuntimeFromCommits([...botCommits(...), { ..., parentCount: 2 }])).toBe("external");

// (b) bot flag を持たない母集団 -> 従来どおり
expect(measuredAuthorRuntimeFromCommits(claudeAuthoredMessages)).toBe("claude");
expect(measuredAuthorRuntimeFromCommits(codexAuthoredMessages)).toBe("codex");
expect(measuredAuthorRuntimeFromCommits([...claudeAuthoredMessages, ...codexAuthoredMessages])).toBe("mixed");
```

**訂正前の文は (a) と矛盾する。** oracle が (a) を要求している以上、この文は既存 oracle によって既に反証されていた。つまり本件は「機械検証できない prose の誤り」ではなく、**oracle と prose が食い違ったまま confirmed になった**ケースである。

実測（PR #569 レビュー時に採取）も同じ結論を支持する。

- 直近 30 PR を旧実装・新実装の両方で測って差分 **0 件**
- repository 内の bot 著 PR は **#384 の 1 件のみ**
- その #384 が `codex` → `external` へ変わる

## §6 範囲外

- Issue #571（`external` と bot identity 詐称）は別 Issue で追跡する
- Issue #572（reviewer=claude receipt の実体欠落）は本 PLAN で扱わない
