---
plan_id: PLAN-RECOVERY-47-wrapper-admission-sink-fence
title: "PLAN-RECOVERY-47 (recovery): worker wrapper admission の実行 sink fence"
kind: recovery
layer: cross
drive: agent
status: confirmed
route_mode: recovery
entry_signals:
  - "po_directive:2026-07-11 GitHub 自走運用（通常 lane は明示依頼を待たず push→PR→merge まで継続する）に基づき、Issue #362 §1 の non-blocker『team 実行 sink の admission に regression fence が無い』を自走で解消する"
created: 2026-08-11
updated: 2026-08-11
owner: Claude / QA
github_issue_id: 362
engineering_discipline_required: true
behavior_contract_id: WCC-FR-02
responsibility_owner: worker-wrapper-admission
change_slice: atomic
refactor_step: not_applicable
legacy_retirement_state: retained
no_code_decision: no_change
ddd_modeling_decision: none
backprop_decision: not_required
backprop_decision_reason: "WCC-FR-02 の behavior contract『全 worker 起動を HELIX 所有 wrapper へ束縛する』自体は不変であり、本 PLAN は要件・設計契約を追加しない。既に確立済みの契約に対して、実行 sink 側の反例 oracle が欠落していた検証面の穴だけを塞ぐ。production source は 1 行も変更しない"
contract_preconditions: "PLAN-L7-498 は `admitWrapperLaunch` を pure function として実装し、U-WWA-001..007 が同関数の 4 failure を固定している。同 PLAN の generates は src/team/run.ts / src/orchestration/pair-agent.ts / src/orchestration/loop-bridge.ts / src/cli.ts の 4 sink を含むが、mutation_oracle_evidence は U-WWA-001..007（admission 関数側）に限定されており、pair_artifact も sink については『既存 adapter／team／pair／loop test も回帰 green を要求する』と述べるにとどまる。したがって sink から admission を外す回帰を検出する手段が存在しない"
contract_postconditions: "team / pair / loop の各 sink について、admission を外す source mutation が対応する test file を単独で Red にする。各 fence は『拒否が worker 起動より前に起きること』を起動側 spy（runCommand / executor / spawn marker）が一度も呼ばれないことで固定し、例外型や message 文字列だけに依存しない"
contract_invariants: "production source を変更しない（差分は tests/ と docs/ のみ）。`admitWrapperLaunch` の signature・failure code 集合・digest 計算は不変。既存 oracle U-WWA-001..007 と U-WCP-011 / U-WCP-012 / U-WCP-013 / U-ORCH-BRIDGE-01 / U-ORCH-BRIDGE-02 の意味は不変で、いずれも green のまま。新 workflow・DB table・required check 名を追加しない"
contract_failures: "U-TSAF-001（team sink が wrapper 未登録の生 plan を起動）、U-TSAF-002（team sink が worker context 無しの plan を起動）、U-PSAF-001（pair sink が worker context 無しで executor を起動）、U-LSAF-001（loop sink が worker context 無しで provider process を spawn）"
tdd_red_required: true
red_at: "2026-08-11T14:50:00+09:00"
green_at: "2026-08-11T15:02:00+09:00"
mutation_oracle_evidence: "fence 追加前に、各 sink から admission を外す source mutation を 1 件ずつ注入して対応 test file を実行し、mutant が生存することを実測した（M5 team-sink-unwired = admitWrapperLaunch 呼び出しと失敗 throw を削除し member.adapter の command / args / env / stdin を runCommand へ直接渡す → tests/team-run.test.ts 19/19 green SURVIVED。M8 team-sink-context-optional = `{ requireWorkerContext: true }` を削除 → 同 19/19 green SURVIVED。M9 pair-sink-context-optional → tests/pair-agent.test.ts 29/29 green SURVIVED。M10 loop-sink-context-optional → tests/orchestration/loop-bridge.test.ts + tests/vmodel-pair.test.ts 58/58 green SURVIVED）。fence 追加後、同一 mutant がすべて killed になることを実測した（M5 → 2 failed、M8 → 1 failed、M9 → 1 failed、M11 pair-sink-unwired → 2 failed、M10 → 1 failed）。M8 が U-TSAF-002 のみを、M5 が U-TSAF-001 と U-TSAF-002 の両方を落とすことから、2 つの team fence は互いに冗長ではなく個別に効いている。全 mutant 復元後の baseline は team 21/21・pair 30/30・loop 4/4 green"
complexity_effect: net_negative
complexity_justification: "production source は 1 行も増えない。追加は既存 3 test file への負例 4 件のみで、これまで『既存 test の回帰 green』という間接的な期待に委ねていた sink の不変条件を、実行可能な反例へ置き換える"
removal_trigger: "全 worker 起動経路が単一 sink へ統合され、sink が複数存在しなくなった場合"
parent_design: docs/design/helix/L6-function-design/worker-wrapper-admission.md
pair_artifact: docs/test-design/helix/L8-worker-wrapper-admission-runtime-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/worker-wrapper-admission.md, oracle_id: U-TSAF-001, test_path: tests/team-run.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-wrapper-admission.md, oracle_id: U-TSAF-002, test_path: tests/team-run.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-wrapper-admission.md, oracle_id: U-PSAF-001, test_path: tests/pair-agent.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-wrapper-admission.md, oracle_id: U-LSAF-001, test_path: tests/orchestration/loop-bridge.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — 検証面の穴（sink の不変条件が散文期待に委ねられていた点）の同定" }
  - { role: qa, slot_label: "QA — sink 別 mutant の生存実測と反例 oracle の Red-first 追加" }
  - { role: tl, slot_label: "TL — Claude 著のため Codex 独立レビュー必須の確認" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-47-wrapper-admission-sink-fence.md, artifact_type: markdown_doc }
  - { artifact_path: docs/test-design/helix/L8-worker-wrapper-admission-runtime-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: tests/team-run.test.ts, artifact_type: test_code }
  - { artifact_path: tests/pair-agent.test.ts, artifact_type: test_code }
  - { artifact_path: tests/orchestration/loop-bridge.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L7-498-worker-wrapper-admission.md
  requires:
    - docs/plans/PLAN-L7-498-worker-wrapper-admission.md
  blocks:
    - issue:362
review_evidence:
  - reviewer: "Codex TL independent cross-runtime reviewer"
    review_kind: cross_agent
    reviewed_at: "2026-08-11T08:42:45Z"
    tests_green_at: "2026-08-11T08:41:47Z"
    verdict: approve
    worker_model: claude-opus-5
    reviewer_model: codex-gpt-5
    scope: "PR #558 の current pre-confirm HEAD e49b8497ee66c8c7ad22b11fa57367d144d66404 に対する Codex TL の独立 cross-runtime review。verdict=approve、Critical 0 / Important 0 / Minor 0。receipt URL = https://github.com/RetryYN/HELIX-HARNESS/pull/558#pullrequestreview-4904412221。先行 round で指摘された enum 3 件の不整合は是正済みで、main 同期後も記録済み判断は変わらないことを確認された。production source の変更 0（差分は tests/ と docs/ のみ）であることも確認された。sink fence の技術判断について、『拒否が worker 起動より前に起きることを起動側 spy の未呼び出しで固定する設計は、例外型や message 文字列に依存する oracle より強い。team の 2 fence が M5 / M8 で個別に落ちることから冗長ではない』との評価を受けた。本 entry は技術承認であり、GitHub merge admission 用の canonical receipt（final terminal CI 後に別途 seal される）を代替しない"
    green_commands:
      - {
          kind: unit_test,
          command: "npx --no-install vitest run --project fast tests/team-run.test.ts tests/pair-agent.test.ts tests/orchestration/loop-bridge.test.ts --reporter=json",
          runner: node,
          scope: targeted,
          exit_code: 0,
          completed_at: "2026-08-11T08:41:47Z",
          evidence_path: tests/orchestration/loop-bridge.test.ts,
          output_digest: "sha256:14fdebf789b4aff9442bbae5c5db90f932180f70b3a82ae6b0136353850b00e3",
          result: "3 files / 55 tests passed",
        }
      - {
          kind: typecheck,
          command: "npx --no-install tsc --noEmit",
          runner: node,
          scope: full,
          exit_code: 0,
          completed_at: "2026-08-11T08:41:47Z",
          evidence_path: tsconfig.json,
          output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
          result: "exit 0、出力無し",
        }
---

# PLAN-RECOVERY-47：worker wrapper admission の実行 sink fence

## §1 なぜ recovery か

`WCC-FR-02` の中核不変条件は「全 worker 起動を HELIX 所有 wrapper へ束縛する」ことである。
PLAN-L7-498 はこれを `admitWrapperLaunch`（pure function）と 4 つの実行 sink の組で実装した。

検証面では、**admission 関数側だけ**に反例が置かれていた。U-WWA-001..007 は
`admitWrapperLaunch` へ raw plan / copy / provider drift / digest drift を直接渡す oracle であり、
「sink が admission を呼んでいること」は一切固定していない。sink 側の期待は
pair_artifact の散文「既存 adapter／team／pair／loop test も回帰 green を要求する」だけであり、
これは実行可能な反例ではない。

実測すると、この期待は成立していなかった。sink から admission を外しても、既存 test は
すべて green のまま通過する（§2）。つまり builder（`buildWrapperAdapterPlan`）と sink が
**対で**存在するときだけ守られており、sink 単独が外れた場合の検出手段が無い。

これは PLAN-L7-498 の claim の虚偽ではない。同 PLAN の `mutation_oracle_evidence` は
U-WWA-001..007 に明示的に限定されており、sink の mutation kill を主張していない。
本 PLAN は虚偽の訂正ではなく、宣言されていなかった検証面の穴を塞ぐ recovery である。
したがって `supersedes` は宣言しない。

## §2 実測（fence 追加前）

各 sink から admission を外す source mutation を 1 件ずつ注入し、対応する test file を実行した。

| mutant | 変異内容 | 実行 test | 結果 |
|---|---|---|---|
| M5 team-sink-unwired | `admitWrapperLaunch` 呼び出しと失敗 throw を削除し、`member.adapter` の command / args / env / stdin を `runCommand` へ直接渡す（PR #361 前の実装へ回帰） | `tests/team-run.test.ts` | 19/19 green **SURVIVED** |
| M8 team-sink-context-optional | `{ requireWorkerContext: true }` を削除 | `tests/team-run.test.ts` | 19/19 green **SURVIVED** |
| M9 pair-sink-context-optional | `{ requireWorkerContext: true }` を削除 | `tests/pair-agent.test.ts` | 29/29 green **SURVIVED** |
| M10 loop-sink-context-optional | `{ requireWorkerContext: true }` を削除 | `tests/orchestration/loop-bridge.test.ts` + `tests/vmodel-pair.test.ts` | 58/58 green **SURVIVED** |

M5 は Issue #362 §1 が報告した mutant の再現である。M8 / M9 / M10 は本 PLAN で追加測定した。

Issue #362 §1 は「`loop-bridge` には現状テストファイル自体が無い」と記録しているが、
その後 `tests/orchestration/loop-bridge.test.ts` が追加されている。同 file を含めて測り直しても
M10 は生存する。同 file の U-WCP-013 は CLI 段の `WORKER_CONTEXT_UNSEALED` で止まるため、
sink の admission には到達しない。

## §3 追加する fence

いずれも「**拒否が worker 起動より前に起きること**」を、起動側 spy が一度も呼ばれないことで固定する。
例外型や message 文字列だけに依存させない（sink が admission を経ずに別の理由で失敗しても
green になってしまうため）。

- **U-TSAF-001**（team）: `buildAdapterPlan` 由来の wrapper 未登録 plan を member へ差し込み、
  `runCommand` が一度も呼ばれず全 member が failed / exit_code null になることを固定する。
- **U-TSAF-002**（team）: `workerContext` を渡さずに plan を構築し、`admitWrapperLaunch` 単体では
  admitted になるが `{ requireWorkerContext: true }` 付きでは `WRAPPER_CONTEXT_REQUIRED` になることを
  明示した上で、sink 経由では `runCommand` が呼ばれないことを固定する。
- **U-PSAF-001**（pair）: `workerContext` 無しで `runPairAgentTddPlan` を実行し、`executor` が
  一度も呼ばれず、transcript に `WRAPPER_CONTEXT_REQUIRED` が出ることを固定する。
- **U-LSAF-001**（loop）: `workerContext` 無しで `nodeTickDeps(...).runWorker` を実行し、
  `WRAPPER_CONTEXT_REQUIRED` で reject されること、および provider process が spawn されないことを
  固定する。`PATH` と、adapter が `PATH` より優先する `HELIX_CODEX_BIN` の両方を marker 記録専用の
  偽 provider へ固定することで、admission が外れた mutant が実 provider を起動する事故も同時に防ぐ。

## §4 実測（fence 追加後）

| mutant | 実行 test | 結果 |
|---|---|---|
| M5 team-sink-unwired | `tests/team-run.test.ts` | 2 failed で **KILLED**（U-TSAF-001 と U-TSAF-002 の両方が落ちる） |
| M8 team-sink-context-optional | `tests/team-run.test.ts` | 1 failed で **KILLED**（U-TSAF-002 のみが落ちる） |
| M9 pair-sink-context-optional | `tests/pair-agent.test.ts` | 1 failed で **KILLED**（U-PSAF-001 が落ちる） |
| M11 pair-sink-unwired | `tests/pair-agent.test.ts` | 2 failed で **KILLED**（admission 呼び出しごと削除した追加 mutant） |
| M10 loop-sink-context-optional | `tests/orchestration/loop-bridge.test.ts` | 1 failed で **KILLED**（U-LSAF-001 が落ちる） |

M8 が U-TSAF-002 のみを、M5 が U-TSAF-001 と U-TSAF-002 の両方を落とすことから、
team の 2 つの fence は互いに冗長ではなく個別に効いている。

全 mutant 復元後の baseline は team 21/21・pair 30/30・loop 4/4 green。

## §5 本 PLAN が主張しないこと

- `src/cli.ts:11601` の sink には fence を追加していない。同 sink は CLI 経路であり、
  test seam が unit level に無いため、別 slice として残す。本 PLAN は「同型 sink すべてに
  fence がある」とは主張しない。閉じたのは team / pair / loop の 3 sink である。
- `admitWrapperLaunch` 自体の正しさは U-WWA-001..007 の担保範囲であり、本 PLAN は再主張しない。
- production source を変更しないため、実行時の振る舞いは一切変わらない。
