---
plan_id: PLAN-L7-508-wra-oracle-test-split
title: "PLAN-L7-508 (refactor): worker-risk-admission oracleを専用test fileへ分離"
kind: refactor
layer: L7
drive: agent
status: confirmed
route_mode: refactor
entry_signals:
  - "po_directive:2026-08-07 GitHub issue #382（新規production module src/runtime/worker-risk-admission.tsのoracle U-WRA-001〜005が専用test fileを持たずtests/worker-isolation-broker.test.tsへ同居しており、同格moduleの慣行とtest design citationに反する）の修復スライス"
created: 2026-08-07
updated: 2026-08-07
owner: Claude / TL
github_issue_id: 382
engineering_discipline_required: true
behavior_contract_id: WRA-ORACLE-PLACEMENT-001
responsibility_owner: worker-risk-admission
change_slice: atomic
refactor_step: not_applicable
legacy_retirement_state: not_applicable
no_code_decision: modify
ddd_modeling_decision: none
contract_preconditions: "src/runtime/worker-risk-admission.tsのoracle U-WRA-001〜005がtests/worker-isolation-broker.test.tsのdescribe(\"WCC-FR-07 worker blind benchmark provenance\")block内に同居する。同格のworker-context-packet／worker-blind-benchmark／worker-review-receiptはいずれも専用test fileを持つ。L8/L9 test designとPLAN-L7-505のtest citationはtests/worker-isolation-broker.test.tsを指し、責務境界とcitationが不一致"
contract_postconditions: "U-WRA-001〜005がtests/worker-risk-admission.test.tsへ移り、tests/worker-isolation-broker.test.tsにU-WRA参照は0件になる。両fileが共有するsealed capability chain fixture（admissionFixture／fixture／executeFixtureRun／benchmarkDefinition／evaluatedBenchmark等）はtests/helpers/worker-isolation-fixture.tsへ単一定義として抽出され、二重定義を持たない。L8/L9 test designとPLAN-L7-505のU-WRA citationは新pathを指す"
contract_invariants: "production sourceを一切変更しない。oracle ID・assertion本文・fixture挙動は不変で、test総数と各oracleの合否は移設前後で同一（broker 23件＋risk 5件＝移設前28件と一致、うち1件skip）。design-reality-bindingのU-WRA以外のcitation（U-WBB等）には触れない"
contract_failures: "U-WRA oracleが移設後に落ちる、broker側のoracle数が減る、fixtureの二重定義が残る、test design citationが実pathと不一致になる場合にredになる"
tdd_red_required: false
mutation_oracle_evidence: "behavior-invariantなtest移設のため新規mutationは設けない。回帰fenceは移設前後のoracle集合の同一性で、tests/worker-risk-admission.test.ts 5 passed（U-WRA-001〜005）＋tests/worker-isolation-broker.test.ts 22 passed/1 skipped＝28件が移設前のbroker単体28件（27 passed/1 skipped）＋新規0と一致することを実測した。移設したU-WRA-001〜005自体が、decideWorkerRiskAdmissionのcritical相殺・unknown field・copied receipt・fixed effort・reason境界という既存のmutation kill fenceをそのまま保持する"
complexity_effect: net_neutral
complexity_justification: "production code変更0。tests/worker-isolation-broker.test.tsから約340行のfixtureと約187行のU-WRA blockを外へ出し、共有fixtureを1 moduleへ単一化する。file数は+2（helper 1、test 1）だが、二重定義は増やさずbroker本体のtest fileは1733行から約900行へ減る"
removal_trigger: "worker-risk-admissionがsealed benchmark receiptに依存しない契約へ変わり、broker fixtureを共有する必要が無くなった時（helper依存を切って独立fixtureへ移す）"
backprop_decision: not_required
backprop_decision_reason: "oracleの置き場所とcitationのみを整える behavior-invariant な refactor であり、L3要件・L6機能設計・L8 oracle定義そのものは変更しない。上位要求へ返す意味差分が無いためbackprop不要"
parent_design: docs/design/helix/L6-function-design/worker-risk-admission.md
pair_artifact: docs/test-design/helix/L8-worker-risk-admission-unit-test-design.md
agent_slots:
  - { role: aim, slot_label: "AIM — issue #382のtest placement逸脱と共有fixture依存グラフの特定" }
  - { role: qa, slot_label: "QA — U-WRA移設とoracle集合の移設前後同一性の実測" }
  - { role: tl, slot_label: "TL — L8/L9 test designとPLAN-L7-505 citationの追随確認" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-508-wra-oracle-test-split.md, artifact_type: markdown_doc }
  - { artifact_path: tests/worker-risk-admission.test.ts, artifact_type: test_code }
  - { artifact_path: tests/helpers/worker-isolation-fixture.ts, artifact_type: test_code }
  - { artifact_path: tests/worker-isolation-broker.test.ts, artifact_type: test_code }
  - { artifact_path: docs/test-design/helix/L8-worker-risk-admission-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/test-design/helix/L9-worker-risk-admission-system-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/design/helix/L5-detail/worker-risk-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/plans/PLAN-L7-505-worker-risk-admission.md, artifact_type: markdown_doc }
  - { artifact_path: tests/design-reality-binding.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L7-505-worker-risk-admission.md
  requires:
    - docs/plans/PLAN-L7-505-worker-risk-admission.md
review_evidence:
  - reviewer: "Claude primary runtime (intra-runtime)"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-06T18:58:40Z"
    tests_green_at: "2026-08-06T18:58:11Z"
    verdict: approve
    worker_model: claude-opus-5
    reviewer_model: claude-opus-5
    scope: "単一runtimeのため規定代替のintra_runtime_subagentとして、material変更（新規tests/worker-risk-admission.test.ts、新規tests/helpers/worker-isolation-fixture.ts、tests/worker-isolation-broker.test.tsからの抽出、test design/design/PLAN citation 4件、新規PLAN文書）をadversarial reviewしverdict approve。(1) behavior非変更: git diffでsrc/配下の変更0を確認。移設したU-WRA blockはriskRequest helperとit本体をそのまま搬送しassertionを書き換えていない。(2) oracle集合の同一性: 移設前のtests/worker-isolation-broker.test.tsは27 passed/1 skipped。移設後はbroker 22 passed/1 skipped＋risk 5 passedで合計28件と一致し、U-WRA参照はbroker側0件（grep -c実測）。(3) fixture二重定義0: helper moduleを唯一の定義元とし、両test fileがimportする。temp root回収はcleanupWorkerIsolationFixturesへ集約し、各fileのafterEachが呼ぶ。(4) citation追随: L8（5行）、L9（3行）、L5-detail（U-WRA oracle_idを持つ4行のみ）、PLAN-L7-505のverification_bindings 5行とgenerates 1行を新pathへ更新。PLAN-L7-505のgreen_commands（2026-08-03実測の履歴証跡）は事実記録のため書き換えていない。(5) mutation harnessの追随: tests/design-reality-binding.test.tsのexecuteWorkerRiskAdmissionMutationOracleがtests/worker-isolation-broker.test.tsを読んでいたため移設でU-DRB-022がRedになることを実測（`expected false to be true`）。読み取り元を新pathへ更新して解消した。あわせてexecuteWorkerBlindBenchmarkMutationOracleのintegration経路が共有helper経由でruntimeを掴む潜在穴（helperが実moduleをimportし続けmutationが届かない）を、helperのmutantコピーとimport書き換えで塞いだ。(6) design-reality-binding OK (checked=22)、plan lint governance OK。merge admissionはGitHub Actions required checkの同一HEAD full CIを外部receiptとする。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --project fast tests/worker-risk-admission.test.ts tests/worker-isolation-broker.test.ts tests/worker-blind-benchmark.test.ts tests/design-reality-binding.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-06T18:43:07Z", evidence_path: tests/worker-risk-admission.test.ts, output_digest: "sha256:77afc5cd217fa5ba2a53acb0b3bfcb257cd97e0ac963d43ea17c06a0c182eafd", result: "4 files / 52 tests passed, 1 skipped" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-06T18:43:12Z", evidence_path: tsconfig.json, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0" }
      - { kind: lint, command: "npx --no-install biome check src tests", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-06T18:43:13Z", evidence_path: biome.json, output_digest: "sha256:191d247ea2475ee9e089aefc72b40e5a2d6ac97f9e85017504b083a3ebd55b5f", result: "0 error" }
      - { kind: lint, command: "npx --no-install tsx src/cli.ts plan lint --gate governance", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-06T18:58:11Z", evidence_path: docs/plans/PLAN-L7-508-wra-oracle-test-split.md, output_digest: "sha256:2b2244c3b02b9012a33ae53656fe6b900e846d88dd6c4f5deea18662f75207fc", result: "plan-governance OK" }
---

# PLAN-L7-508: worker-risk-admission oracle を専用 test file へ分離

## 根本原因

新規 production module `src/runtime/worker-risk-admission.ts` の oracle `U-WRA-001`〜`U-WRA-005` が、
専用 test file ではなく `tests/worker-isolation-broker.test.ts` の
`describe("WCC-FR-07 worker blind benchmark provenance")` block に同居していた（issue #382）。

| module | test file |
|---|---|
| `src/runtime/worker-context-packet.ts` | `tests/worker-context-packet.test.ts` |
| `src/runtime/worker-blind-benchmark.ts` | `tests/worker-blind-benchmark.test.ts` |
| `src/runtime/worker-review-receipt.ts` | `tests/worker-review-receipt.test.ts` |
| `src/runtime/worker-risk-admission.ts` | ❌ `tests/worker-isolation-broker.test.ts` に同居 |

`CLAUDE.md` の実装規則「local naming、structure、test placement に合わせる」に反し、
L8/L9 test design と PLAN-L7-505 の citation が実 path と責務境界の両方でずれていた。

## なぜ単純な移設で済まないか

`decideWorkerRiskAdmission` は **sealed** な `WorkerBlindBenchmarkReceiptV1` を要求する。
receipt の identity は WeakSet で封印されており、plain object を組み立てて渡すことはできない。
そのため U-WRA oracle は broker fixture の完全な capability chain
（`admissionFixture` → `admittedLaunch` → `fixture` → `executeFixtureRun` →
`benchmarkDefinition` → `evaluatedBenchmark`）を通す必要がある。これらは
`tests/worker-isolation-broker.test.ts` の module scope と describe scope に散在していた。

## 修復

- `tests/helpers/worker-isolation-fixture.ts` を新設し、両 test file が共有する fixture 群を
  **単一定義**として抽出する（`admissionFixture` / `temporaryRoot` / `admittedLaunch` /
  `uncontractedLaunch` / `isolationPolicy` / `authority` / `fixture` / `executeFixtureRun` /
  `executeFixture` / `benchmarkDefinition` / `evaluatedBenchmark` / `realBwrapPath`）。
  temp root の回収は `cleanupWorkerIsolationFixtures()` へ集約し、各 test file の `afterEach` が呼ぶ。
- `tests/worker-risk-admission.test.ts` を新設し、`riskRequest` helper と `U-WRA-001`〜`005` を
  assertion 無改変で移す。
- L8 / L9 test design、`docs/design/helix/L5-detail/worker-risk-admission.md` の
  `U-WRA-*` reachability 行、PLAN-L7-505 の `verification_bindings`（5 行）と `generates` を
  新 path へ更新する。

## 検証

- 移設前後の oracle 集合が同一であることを実測した。移設前
  `tests/worker-isolation-broker.test.ts` = 27 passed / 1 skipped。移設後は
  broker 22 passed / 1 skipped ＋ risk 5 passed = **28 件で一致**。
  broker 側の `U-WRA-00` 参照は `grep -c` で **0 件**。
- production source の変更 0（`git diff` で `src/` に差分なし）。
- mutation harness の追随を実測で確認した。`tests/design-reality-binding.test.ts` の
  `executeWorkerRiskAdmissionMutationOracle` は `tests/worker-isolation-broker.test.ts` を
  読み取り元にしていたため、移設だけを行うと `U-DRB-022` が
  `AssertionError: expected false to be true` で Red になる。読み取り元を
  `tests/worker-risk-admission.test.ts` へ更新して解消した。
- あわせて `executeWorkerBlindBenchmarkMutationOracle` の integration 経路
  （`U-WBB-003/004/005`）が共有 helper 経由で runtime を掴む**潜在穴**を塞いだ。helper は実 module を
  import し続けるため、mutant test だけを書き換えても `evaluatedBenchmark` 経由の mutation が
  届かない。helper の mutant コピーを作り両方の import を書き換えることで、helper 抽出前と
  同じ mutation 到達性を維持する。現状 `U-DRB` が駆動するのは `U-WBB-002` / `U-WBB-005` のみで
  実害は出ていなかったが、抽出で生じた fragility を残さない。
- `design-reality-binding — OK (checked=22)`、`plan-governance - OK`。

## branch prefix と PLAN kind の選定理由

`plan-specific-vpair-binding` は cited test file に oracle が実在するかを検査するため
（stale 化させると `oracle_citation_missing(U-WRA-001@tests/worker-isolation-broker.test.ts)` 等
10 件の violation を実測）、本移設では親 PLAN `PLAN-L7-505`（`kind: add-impl`）の
`verification_bindings` / `generates` 更新が**必須**になる。

一方 `branch-kind-check` は branch prefix ごとに許容 PLAN kind を固定しており、
`recovery/` は `recovery` のみ、`refactor/` は `refactor` / `retrofit` のみを許す。
`add-impl` と併存できる governed prefix は `feature` / `add` / `version-up` / `verify` に限られ、
そのうち `refactor` も併せて許すのは `verify` だけである
（`src/lint/branch-kind.ts` の `REQUIRED_KIND_BY_BRANCH`）。

本スライスは production behavior を変えず、verification artifact（oracle の置き場所と citation）
だけを整える verification-side の作業であるため、`kind: refactor` ＋ `verify/` prefix を選ぶ。
issue #382 自身も「PLAN は `kind: refactor` 相当の小さな slice で足ります」と記している。

## 非対象

- `U-WRA` oracle の assertion 追加・強化（behavior-invariant な移設に限定する）
- `docs/plans/PLAN-L7-505-worker-risk-admission.md` の `green_commands`
  （2026-08-03 に実際に実行された履歴証跡であり、事実として書き換えない）
- `tests/worker-isolation-broker.test.ts` に残る `U-WBB-*` / `U-WIB-*` / `U-WLR-*` の
  さらなる分割（責務ごとの追加分離は別スライスの主題）
