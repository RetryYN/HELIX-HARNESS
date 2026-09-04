---
plan_id: PLAN-RECOVERY-105-design-reality-binding-empty-failure-baseline
title: "PLAN-RECOVERY-105: Design Reality Bindingの空failure baselineを固定する"
kind: recovery
layer: cross
drive: agent
status: confirmed
completion_claim_allowed: true
backfill_state: complete
created: 2026-09-04
updated: 2026-09-04
owner: Codex / TL
github_issue_id: 1501
behavior_contract_id: DRB-EMPTY-FAILURE-BASELINE-001
responsibility_owner: design-reality-binding
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: value_object
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - regression_dev
contract_preconditions: "Design Reality Bindingはfailureコードと到達可能性を検査するが、両配列が空の既存設計を新規退行と区別して観測できない"
contract_postconditions: "既知の空bindingを固定baselineとして可視化し、baseline外の新規空bindingとbaseline拡張をfail-closeし、failure方針を含む既知空bindingをadvisoryへ射影する"
contract_invariants: "既存空bindingを成功証拠へ昇格せず、baselineを設定ファイルだけで増やさず、解消時の縮小だけを許可し、既存failure reachability gateを緩和しない"
contract_failures: "baselineのschema／digest／path不正、baseline拡張、baseline外の空binding、空bindingのfailure契約への誤昇格を個別に拒否する"
tdd_red_required: true
red_test: "U-DRB-025の実装分岐を一時moduleでbaseline扱いへ置換すると、baseline外の空binding findingが欠落して同テストがRedになることをU-DRB-029から実測した"
red_at: "2026-09-03T20:21:26Z"
green_at: "2026-09-03T20:24:32Z"
mutation_oracle_required: true
mutation_oracle_evidence: "tests/design-reality-binding.test.ts の U-DRB-029で、2026-09-03T20:21:26Z〜20:21:32Zに `if (baselinePaths.has(file)) {` を `if (true) {` へ一時置換した。U-DRB-025の期待finding欠落をRed／exit 1として検出してmutationをkillし、復元後はU-DRB-025〜029がGreen／exit 0だった。"
complexity_effect: net_neutral
complexity_justification: "既存のDesign Reality解析器へ観測baselineとadvisoryを追加するだけで、新しいDB、scheduler、authority、実行経路を増やさない"
removal_trigger: "現行L4/L5設計のfailureコードとexecutable reachability witnessが全件materializeされ、空binding baselineが空になった時"
backprop_decision: not_required
backprop_decision_reason: "既存設計の実在性検査における空binding退行の可視化であり、新しい要求意味やPO判断を追加しない"
parent_design: docs/design/helix/L6-function-design/design-reality-binding.md
pair_artifact: docs/test-design/helix/L8-design-reality-binding-function-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/design-reality-binding.md, oracle_id: U-DRB-025, test_path: tests/design-reality-binding.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/design-reality-binding.md, oracle_id: U-DRB-026, test_path: tests/design-reality-binding.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/design-reality-binding.md, oracle_id: U-DRB-027, test_path: tests/design-reality-binding.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/design-reality-binding.md, oracle_id: U-DRB-028, test_path: tests/design-reality-binding.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/design-reality-binding.md, oracle_id: U-DRB-029, test_path: tests/design-reality-binding.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-105-design-reality-binding-empty-failure-baseline.md, artifact_type: markdown_doc }
  - { artifact_path: config/design-reality-binding-empty-baseline.json, artifact_type: json_config }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
modifies:
  - { artifact_path: src/lint/design-reality-binding.ts, artifact_type: source_module }
  - { artifact_path: tests/design-reality-binding.test.ts, artifact_type: test_code }
  - { artifact_path: docs/design/helix/L4-basic-design/design-reality-binding.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L5-detail/design-reality-binding.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L6-function-design/design-reality-binding.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-design-reality-binding-function-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/test-design/helix/L9-design-reality-binding-system-test-design.md, artifact_type: test_design }
agent_slots:
  - { role: aim, slot_label: "AIM — current empty bindingと本文failure方針の差分棚卸し" }
  - { role: se, slot_label: "SE — baseline schema／digestと解析器のtyped境界" }
  - { role: qa, slot_label: "QA — 新規空binding、baseline拡張、mutation oracle" }
  - { role: tl, slot_label: "TL — #1500 Epoch 1の既存設計実在性責務との接合" }
dependencies:
  parent: docs/plans/PLAN-RECOVERY-09-design-reality-binding.md
  requires:
    - docs/plans/PLAN-RECOVERY-09-design-reality-binding.md
  references:
    - "issue:1501"
    - "issue:1500"
    - "plan:PLAN-RECOVERY-09-design-reality-binding"
  blocks: []
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-09-03T22:17:59Z"
    tests_green_at: "2026-09-03T22:12:36Z"
    verdict: approve
    worker_model: codex:gpt-5.6-sol
    reviewer_model: claude:claude-opus-5
    reviewer_session_id: "9867601a-a3ad-4369-980c-11757d63a7de"
    reviewed_head_sha: 454ad27ad8e6f080ab024d0e7503238e6f6f254e
    receipt_url: "https://github.com/RetryYN/HELIX-HARNESS/pull/1504#issuecomment-5532881217"
    scope: "PR #1504のcurrent exact HEADで、空failure bindingの固定baseline、baseline外追加のfail-close、解消時の縮小、本文failure方針のadvisory表示、digest inventory、mutation oracle、DB projection／replay／checkpoint convergenceを確認し、blocker 0。"
    green_commands:
      - kind: smoke
        command: "gh run view 33809587559 --repo RetryYN/HELIX-HARNESS --json status,conclusion,headSha,url"
        runner: ci
        scope: full
        exit_code: 0
        completed_at: "2026-09-03T22:12:36Z"
        evidence_path: .github/workflows/harness-check.yml
        output_digest: "sha256:85eddc011eb3bddfe1a8930ca6530527bf4b3cf31ee33827516dfdcce3cff68a"
        result: "PR #1504 exact HEAD 454ad27ad8e6f080ab024d0e7503238e6f6f254eのharness-check run 33809587559がterminal success。"
---

# PLAN-RECOVERY-105: Design Reality Bindingの空failure baselineを固定する

## 目的

既存L4/L5設計に残る `declared_failure_codes: []` と `failure_reachability: []` を、実装完成の証拠として
扱わず、現在の未materialize負債として固定・可視化する。今後の設計追加や変更で空bindingが増えた場合は、
既知baselineによる相殺を許さず、同じDesign Reality gateで停止させる。

## 正本と判定境界

- Design Reality Bindingのschemaと到達可能性判定は既存のL4/L5設計・`src/lint/design-reality-binding.ts`を正本とする。
- `config/design-reality-binding-empty-baseline.json` は現在の観測集合を保持するprojectionであり、意味authorityではない。
- 初期baseline集合は実装にも固定し、設定ファイルだけでentryを追加できないようにする。
- baselineに残る空bindingはadvisoryであり、failure契約が存在するというgreen証拠ではない。
- 本文にfailure方針があるbaseline entryはmaterialize候補として表示するが、今回のsliceで自動的にfailure witnessを生成しない。
- 空bindingを解消したentryはbaselineから削除して集合を縮小する。削除以外のbaseline変更は拒否する。

## 非対象

- 47件の既存設計へfailure code／witnessを一括で発明・追加すること
- Design Reality Binding schema、既存failure reachability、DB、scheduler、CLIの新設
- 本文のfailure方針だけを根拠にした自動accept、PO判断、要求変更
- #1500 Epoch 1の別kernelやprovider設定の変更

## 完了条件

- [x] U-DRB-025〜029のRed→Greenとbaseline拡張mutation killを確認する。
- [x] current repositoryで空bindingが47件、baselineが47件、baseline digestが一致し、新規空bindingが0件である。
- [x] 本文failure方針を含む既知entryがhard failureではなくadvisoryとしてdoctor／PLAN lintへ表示される。
- [x] baseline schema、path、digest不正とコード固定初期集合外の追加がfail-closeする。
- [x] targeted/full test、typecheck、Biome、PLAN lint、doctor、Claude exact-HEAD reviewがgreenになる。
- [x] current HEADの証拠を束縛したうえでPRをmergeし、main read-afterでbaseline件数・digest・findingを再確認する。

## §5 終端収束

PR #1504 `454ad27ad8e6f080ab024d0e7503238e6f6f254e` は、Claude Code / `claude-opus-5` による
current exact-HEAD review、必須CI、DB projection／replay／checkpoint convergenceを満たしたうえで、
merge commit `21a607b2e517862a8a01e82b0c46ee7c2b58f572` としてmainへ統合された。

main read-afterでは、repo-wide guard preflightを含む `harness-check` run `33848385601` が、
main HEAD `eab5385cfce8c90a0a04a12932b1553965b1beed` に対して 2026-09-04T08:02:00Z に terminal successとなった。
Lite利用者環境、事前検査、Windows耐久性検査、bulk-1〜3、状態保持検査、最終処理（Biome、テスト後DB再構築、
doctor、typed lane status）は全てsuccessで完了し、空failure baseline 47件、baseline digest、advisory findingの
main側再検証を含む終端証拠を確認した。

```text
run: https://github.com/RetryYN/HELIX-HARNESS/actions/runs/33848385601
head: eab5385cfce8c90a0a04a12932b1553965b1beed
status: completed
conclusion: success
output_digest: sha256:64249470978a505bcbdba669eab71a2f0e7f2b5b5a231c939301ef941f610791
```

このmain read-afterをもって、PR #1504の実装責務と本PLANの空failure baseline責務が同一mainへ収束したことを確認する。
Issue #1501のterminal化は、本PLANをこの証拠付きclosure PRから参照して行う。
