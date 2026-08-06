---
plan_id: PLAN-RECOVERY-36-loop-run-positive-coverage
title: "PLAN-RECOVERY-36 (recovery): helix loop run 正例カバレッジ回復"
kind: recovery
layer: cross
drive: agent
status: confirmed
route_mode: recovery
entry_signals:
  - "po_directive:2026-08-07 GitHub issue #374（WCC-FR-09 の --worker-context-file 必須化で U-ORCH-BRIDGE-02 が U-WCP-013 に置換され、helix loop run の正例カバレッジが消失した）の修復スライス"
created: 2026-08-07
updated: 2026-08-07
owner: Claude / TL
github_issue_id: 374
engineering_discipline_required: true
behavior_contract_id: ORCH-BRIDGE-POSITIVE-001
responsibility_owner: orchestration-runtime-bridge
change_slice: atomic
refactor_step: modify
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: none
contract_preconditions: "tests/orchestration/loop-bridge.test.tsはU-ORCH-BRIDGE-01（nodeTickDepsのunit）とU-WCP-013（context無しdispatch拒否のnegative CLI）だけを持ち、helix loop runの正常dispatch経路を固定するoracleが存在しない。WCC-FR-09で--worker-context-fileが必須化された際に旧U-ORCH-BRIDGE-02が置換され、tick進行・durable epoch commit・provider dispatch回数・iteration/lastVerdict遷移の回帰検出力が失われている"
contract_postconditions: "U-ORCH-BRIDGE-02がtests/orchestration/loop-bridge.test.tsへ回復し、sealed worker context boundaryを--worker-context-fileで渡した実CLI spawnにより、--onceがticks=1/iteration=1で1 tickだけ進むこと、通常実行がcanResume falseになるまで進みiteration=2へ到達すること、durable loop epoch snapshotがcommittedになること、codex/claudeがそれぞれ2回dispatchされること、lastVerdictがfailへ遷移することを固定する"
contract_invariants: "runtime behaviorを一切変更しない。src変更はsrc/lint/l12-hybrid-reviewed-safe-v2.tsのreviewed digest 1件の再attestに限り、SIGNAL_PATTERNS・disposition値・判定ロジックには触れない。U-WCP-013のnegative契約（--dry-runの非dispatchとcontext無しのWORKER_CONTEXT_UNSEALED fail-close）にも触れず、正負を2 oracleで分担する"
contract_failures: "loop runがsealed context下でdispatchしない、tickが進まない、durable loop epochがcommittedにならない、provider dispatch回数が2回でない、iteration/lastVerdict遷移が期待と異なる場合にredになる"
tdd_red_required: true
red_at: "2026-08-06T18:14:06Z"
green_at: "2026-08-06T18:14:23Z"
mutation_oracle_evidence: "oracle=U-ORCH-BRIDGE-02 (tests/orchestration/loop-bridge.test.ts)。src/cli.tsのloop runでnodeTickDepsへのworkerContext受け渡し（`...(loadedContext?.ok ? { workerContext: {...} } : {})`）を削除するmutationを適用したところ、U-ORCH-BRIDGE-02が`expected 1 to be 0`（exitCode）のAssertionErrorでkillされRedになることを実測（2026-08-06T18:14:06Z）。mutation revert後は同file 3件がgreen（2026-08-06T18:14:23Z）。これは「context wiringが壊れてもnegative oracleだけでは検出できない」という issue #374 の回帰検出力低下を、正例oracleが実際に埋めていることの証跡である"
complexity_effect: net_neutral
complexity_justification: "production code変更0。test 1件（約60行）と test design 1 sectionの記述更新のみで、WCC-FR-09以前に存在した回帰検出力を回復する。新規helper・fixture・runtime stateは追加せず、既存のinstallTestWorkerContextBoundaryとreadLoopEpochFromFsを再利用する"
removal_trigger: "helix loop runのdispatch経路がCLI spawnを伴わない決定的なintegration harnessへ移行し、同等以上の回帰検出力が別oracleで恒常担保された時"
parent_design: docs/design/helix/L6-function-design/orchestration-memory.md
pair_artifact: docs/test-design/helix/orchestration-memory.md
agent_slots:
  - { role: aim, slot_label: "AIM — issue #374の消失範囲（旧U-ORCH-BRIDGE-02のassertion集合）の特定" }
  - { role: qa, slot_label: "QA — sealed context付き正例oracleの回復とcontext wiring mutationのkill実測" }
  - { role: tl, slot_label: "TL — U-WCP-013との正負分担境界とtest design citationの整合確認" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-36-loop-run-positive-coverage.md, artifact_type: markdown_doc }
  - { artifact_path: tests/orchestration/loop-bridge.test.ts, artifact_type: test_code }
  - { artifact_path: docs/test-design/helix/orchestration-memory.md, artifact_type: test_design }
  - { artifact_path: src/lint/l12-hybrid-reviewed-safe-v2.ts, artifact_type: source_module }
dependencies:
  parent: docs/plans/PLAN-L7-177-helix-orchestration-runtime-bridge.md
  requires:
    - docs/plans/PLAN-L7-177-helix-orchestration-runtime-bridge.md
review_evidence:
  - reviewer: "Claude primary runtime (intra-runtime)"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-06T18:28:40Z"
    tests_green_at: "2026-08-06T18:28:13Z"
    verdict: approve
    worker_model: claude-opus-5
    reviewer_model: claude-opus-5
    scope: "単一runtimeのため規定代替のintra_runtime_subagentとして、material変更（tests/orchestration/loop-bridge.test.ts 約60行追加、docs/test-design/helix/orchestration-memory.md 1 section更新、新規PLAN文書）をadversarial reviewしverdict approve。(1) 回復範囲の同一性: git show 438ef382^ で置換前のU-ORCH-BRIDGE-02本文を取り出し、ticks/iteration遷移・durable epoch committed・codex/claude各2回dispatch・lastVerdict failという assertion 集合が回復後も同一であることを突合した。--dry-run部分だけは U-WCP-013 が既に固定済みのため重複させず、test designの§境界に分担を明記した。(2) oracleの実効性: src/cli.tsのloop runからworkerContext受け渡しを削除するmutationでexitCode 1となりkillされることを実測しており、トートロジーではない。(3) production code変更0をgit diff --statで確認（tests/ と docs/ のみ）。(4) 波及gateの実測: design-reality-binding OK (checked=22)、l12-hybrid-recognition は test design 編集で一旦 needs_manual_review になったため編集前後のsignal集合がbit同一であることをdetectL12HybridRecognitionSignalsで突合してからdigestを再attestしOKへ復帰、ddd-tdd-rules は mutation_oracle_evidence の locator 要求を満たすようoracle test pathを明記して解消。doctorのfailing-checksは再実行後 codexHookTrust / teamReviewReceipts / memoryHandoverIsolation / greenCommandDigest のみとなり、これらは本変更前から存在するenvironment-local debtで同一（i379 worktreeでの同時点実測と一致）。Minor 1件（refactor_step: modifyが機械enum外だがlayer: crossはlint対象外でRECOVERY-11/14/15/17/34/35と同値の先例）は非ブロッキング。merge admissionはGitHub Actions required checkの同一HEAD full CIを外部receiptとする。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --project fast tests/orchestration/loop-bridge.test.ts tests/l12-hybrid-recognition.test.ts tests/design-reality-binding.test.ts tests/ddd-tdd-rules.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-06T18:27:53Z", evidence_path: tests/orchestration/loop-bridge.test.ts, output_digest: "sha256:7c6ca442dd3e026a4ad59fb487df05d221d7b39d8d8503587a7bd89a61f8b1eb", result: "4 files / 62 tests passed" }
      - { kind: lint, command: "npx --no-install biome check src tests", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-06T18:28:11Z", evidence_path: biome.json, output_digest: "sha256:a78bd95c27c0dea62ca22ae5cca46967b2efad39cc0e196802b385f8815c3907", result: "773 files checked, 0 error (既存 17 warnings)" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-06T18:26:40Z", evidence_path: tsconfig.json, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0" }
      - { kind: lint, command: "npx --no-install tsx src/cli.ts plan lint --gate governance", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-06T18:28:13Z", evidence_path: docs/plans/PLAN-RECOVERY-36-loop-run-positive-coverage.md, output_digest: "sha256:2b2244c3b02b9012a33ae53656fe6b900e846d88dd6c4f5deea18662f75207fc", result: "plan-governance OK" }
---

# PLAN-RECOVERY-36: `helix loop run` 正例カバレッジ回復

## 根本原因

WCC-FR-09 により `--execute` を伴う全 worker 起動経路が `--worker-context-file` を必須化した際、
`tests/orchestration/loop-bridge.test.ts` の `U-ORCH-BRIDGE-02` が `U-WCP-013`（context 無しで
exit 1）へ**置換**された。その結果、同 file に残るのは

- `U-ORCH-BRIDGE-01`: `nodeTickDeps` の unit（実 CLI を通らない）
- `U-WCP-013`: context 無しでの `WORKER_CONTEXT_UNSEALED` 拒否（negative のみ）

だけとなり、`helix loop run` が**実際に dispatch して tick を進める**正常経路の回帰検出力が消失した
（issue #374）。置換前に固定されていた以下の性質が無検査になっていた。

- `loop run` が `canResume` の間 tick を進めること
- durable loop epoch が `committed` になること
- `codex` / `claude` がそれぞれ 2 回 dispatch されること
- `iteration` / `lastVerdict` の遷移

## 修復

- `U-ORCH-BRIDGE-02` を `tests/orchestration/loop-bridge.test.ts` へ回復する。fixture は
  `tests/helpers/worker-context.ts` の `installTestWorkerContextBoundary` を再利用し、
  `--worker-context-file <path>` を渡した実 CLI spawn で `--once` と通常実行を検証する。
- `--dry-run` の非 dispatch と context 無しの fail-close は `U-WCP-013` が既に固定しているため
  重複させない。`docs/test-design/helix/orchestration-memory.md` の `U-ORCH-BRIDGE-02` section に
  「本 oracle は正例側、`U-WCP-013` は負例側」という**分担境界**を明記する。
- runtime behavior は変更しない。ただし `docs/test-design/helix/orchestration-memory.md` は
  `src/lint/l12-hybrid-reviewed-safe-v2.ts` の reviewed-safe registry に digest 付きで登録された
  文書であり、内容変更が review を無効化する（`classifyFinalRecognitionDisposition` は
  digest 不一致を `needs_manual_review` にする）。編集前後で検出 signal 集合が **bit 同一**
  （`U-ORCH-006` の `bun:sqlite` 3 件のみ、追記部に Bun / L0-L14 signal 無し）であることを
  実測したうえで、disposition `false_positive` 据え置きのまま digest を再 attest する。

## 検証

- red 実測: `src/cli.ts` の `loop run` で `nodeTickDeps` への `workerContext` 受け渡しを削除する
  mutation を適用すると、`U-ORCH-BRIDGE-02` が `expected 1 to be 0`（exitCode）で Red
  （2026-08-06T18:14:06Z）。context wiring の破壊は negative oracle だけでは検出できないため、
  これは失われていた回帰検出力を正例 oracle が実際に埋めている証跡である。
- green 実測: mutation revert 後に同 file 3 件が green（2026-08-06T18:14:23Z）。
- 回復範囲の同一性は `git show 438ef382^:tests/orchestration/loop-bridge.test.ts` で置換前本文を
  取り出して assertion 集合を突合し確認した。
- `design-reality-binding` は `doctor` で `OK (checked=22)`。変更した
  `src/lint/l12-hybrid-reviewed-safe-v2.ts` を `source_digest` として cite している design doc は
  無いため stale 化しない。
- `l12-hybrid-recognition` は test design 編集で一旦
  `docs/test-design/helix/orchestration-memory.md requires reviewed disposition` を返したため、
  編集前後の signal 集合が bit 同一であることを `detectL12HybridRecognitionSignals` で突合してから
  digest を `6a3f6505…` → `6c29db38…` へ再 attest し、`OK` へ復帰することを実測した。
- `ddd-tdd-rules` は `mutation_oracle_evidence` の locator 要求
  （`MUTATION_ORACLE_LOCATOR_PATTERN`）を満たすため oracle の test path を明記して解消した。

## verification_bindings を置かない理由

`verification_bindings.oracle_id` は `src/schema/frontmatter.ts:95` の
`PLAN_SPECIFIC_ORACLE_ID_PATTERN`（`/^(?:U|IT)-[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)*-\d{3}[a-z]?$/`）で
**3 桁連番**を要求する。本スライスが回復する oracle は WCC-FR-09 以前から存在する
`U-ORCH-BRIDGE-02`（2 桁）であり、この legacy ID を維持したまま binding へ載せると
`invalid_frontmatter(verification_bindings.0.oracle_id:invalid_string)` で lint が落ちる。
回帰カバレッジ回復という本スライスの目的に対して oracle ID の改番は無関係な blast radius を
持ち込むため、binding は置かず `parent_design` / `pair_artifact` と
`docs/test-design/helix/orchestration-memory.md` の citation で対応関係を固定する。
ID 正規化は `helix loop run` の oracle 体系を触る別スライスの主題とする。

## 非対象

- `U-WCP-013` の negative 契約（`--dry-run` 非 dispatch、`WORKER_CONTEXT_UNSEALED` fail-close）の変更
- `helix codex` / `helix claude` / `helix pair-agent` / `helix team` 各経路の正例カバレッジ
  （本スライスは `helix loop run` に限定する）
- issue #376（`--worker-context-file` 必須化に対する docs / Adapter Rule Markers 更新）— docs 面の
  別スライスとして分離する。
