---
plan_id: PLAN-RECOVERY-34-wib-context-digest-dead-path
title: "PLAN-RECOVERY-34 (recovery): worker isolation broker context_digest dead path除去"
kind: recovery
layer: cross
drive: agent
status: confirmed
route_mode: recovery
entry_signals:
  - "po_directive:2026-08-06 GitHub issue #375（prepareWorkerIsolationLaunchで非null確定済みのworker_contextに対する到達不能なfallbackが残存し、context無しでもlaunch recordが作れるという誤読を招く）の修復スライス"
created: 2026-08-06
updated: 2026-08-06
owner: Kimi / TL
github_issue_id: 375
engineering_discipline_required: true
behavior_contract_id: WIB-CONTEXT-DIGEST-001
responsibility_owner: worker-isolation-broker
change_slice: atomic
refactor_step: modify
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: none
contract_preconditions: "prepareWorkerIsolationLaunchは`if (!workerContext || workerContext.authority_root !== repoRoot) return failure(\"WORKER_CONTEXT_UNSEALED\")`を通過済みの地点で`request.wrapperLaunch.worker_context?.capability.packet_digest ?? sha256Digest(\"\")`を評価する。worker_contextは同関数前段で非nullが確定しており、`?.`と`?? sha256Digest(\"\")`は到達不能"
contract_postconditions: "launchExecutionBindingsのcontext_digestはTS narrowing済みの局所変数`workerContext.capability.packet_digest`への直接参照となり、fallback式を持たない。launch recordのcontext_digestは常にsealed worker context packetのpacket_digestと一致し、空文字列digest（sha256:のempty digest）がcontext_digestとして記録される経路は存在しない"
contract_invariants: "実行時behaviorは変更しない（除去したfallbackは到達不能でありobservableな差分を生じない）。WorkerIsolationExecutionOriginのschema・他bindingフィールド・fail-close判定列は一切変更しない"
contract_failures: "context_digestがsealed packetのpacket_digestと不一致、空文字列sha256 digestへのfallback復活（mutation）、worker_context未seal状態でのlaunch record生成をfail-closeする"
tdd_red_required: true
red_at: "2026-08-06T16:44:49Z"
green_at: "2026-08-06T16:45:13Z"
mutation_oracle_evidence: "tests/worker-isolation-broker.test.ts::U-WIB-018で、context_digestを`sha256Digest(\"\")`のみへ書き換えるmutation（fallback支配化）は`expected 'sha256:e3b0c44...' to be 'sha256:c97cde6...'`のAssertionErrorでkillされRedへ戻ることを実測（2026-08-06T16:44:49Z）。修正適用後は同テストを含む28件がgreen（2026-08-06T16:45:13Z）"
complexity_effect: net_negative
complexity_justification: "到達不能なfallback式1つを削除し直接参照へ置き換える。追加はoracle test 1件のみで、production codeは純減。「context無しでもlaunch recordが作られる」という誤読の余地を除去する"
removal_trigger: "worker_contextの非null性が型システム上の静的契約（WrapperLaunchExecution.worker_context必須化等）として表現され、本oracle testが冗長と同一基準で証明された時"
parent_design: docs/design/helix/L4-basic-design/worker-isolation-broker.md
pair_artifact: tests/worker-isolation-broker.test.ts
verification_bindings:
  - { parent_design: docs/design/helix/L4-basic-design/worker-isolation-broker.md, oracle_id: U-WIB-018, test_path: tests/worker-isolation-broker.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — issue #375の到達不能性根拠（前段guardによる非null確定）の確認" }
  - { role: se, slot_label: "SE — narrowing済み局所変数への直接参照化とdigest inventory再生成" }
  - { role: qa, slot_label: "QA — U-WIB-018 oracle追加とfallback支配化mutationのkill実測" }
  - { role: tl, slot_label: "TL — behavior非変更の境界確認と生成物（inventory/snapshot）同期" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-34-wib-context-digest-dead-path.md, artifact_type: markdown_doc }
  - { artifact_path: src/runtime/worker-isolation-broker.ts, artifact_type: source_module }
  - { artifact_path: tests/worker-isolation-broker.test.ts, artifact_type: test_code }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: config }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: config }
dependencies:
  parent: docs/plans/PLAN-L4-62-worker-isolation-broker.md
  requires:
    - docs/plans/PLAN-L4-62-worker-isolation-broker.md
review_evidence:
  - reviewer: "Kimi explore subagent (intra-runtime)"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-06T17:06:22Z"
    tests_green_at: "2026-08-06T17:05:43Z"
    verdict: approve
    worker_model: kimi-code/k3-256k
    reviewer_model: kimi-code/k3-256k
    scope: "単一runtimeのため規定代替のintra_runtime_subagentとして、read-only explore subagentがmaterial変更（git diff HEADの4ファイル＋新規PLAN文書）をadversarial reviewしverdict approve（Critical/Important 0件）。workerContext局所変数とrequest.wrapperLaunch.worker_contextの間にmutate経路が無くbehavior非変更であること、packet_digest→context_digestのSha256Digest型整合、U-WIB-018がfallback支配化mutationを確実にkillする二重固定（toBe(packetDigest)＋not.toBe(sha256Digest(\"\"))）であること、digest inventory diffが除去row＋後続6行の-1シフトのみで現ソース行番号と一致すること、outstanding snapshot diffがPLAN追加分のみでgenerator期待と完全一致することをコードトレースと再測で確認。Minor 3件（refactor_step: modifyが機械enum外だがlayer: crossはlint対象外でRECOVERY-11/14/15/17と同値の先例、commit前のgoal-evidence-audit 2件redはHEAD committed snapshot参照仕様による想定内ギャップでsnapshot+PLAN同commitで解消、mutation_oracle_evidenceのdigest引用がrun固有値）はいずれも非ブロッキングとして記録。本PLAN receiptを含むcandidate HEADは自己参照させず、merge admissionはGitHub Actions required checkの同一HEAD full CIを外部receiptとする。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --project fast tests/worker-isolation-broker.test.ts tests/digest.test.ts tests/feedback-refactor-disposition.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-06T17:05:43Z", evidence_path: tests/worker-isolation-broker.test.ts, output_digest: "sha256:04618ac534041d0e77e51e0d66ec525fd41cc9cc7e087608ab67a92fc19e99b2", result: "3 files / 39 tests passed, 1 skipped" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-06T17:05:50Z", evidence_path: tsconfig.json, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0" }
      - { kind: lint, command: "npx --no-install tsx src/cli.ts plan lint --gate governance", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-06T17:05:55Z", evidence_path: docs/plans/PLAN-RECOVERY-34-wib-context-digest-dead-path.md, output_digest: "sha256:89568cf8614a7a8f2a981b637097a95ddcf9af1c8acc51d36d5b2cd55bb1a894", result: "plan-governance OK (checked=839)" }
---

# PLAN-RECOVERY-34: worker isolation broker context_digest dead path 除去

## 根本原因

`src/runtime/worker-isolation-broker.ts` の `prepareWorkerIsolationLaunch` は、関数前段で
`if (!workerContext || workerContext.authority_root !== repoRoot) return failure("WORKER_CONTEXT_UNSEALED")`
により `worker_context` の非 null を確定させている。しかし launchExecutionBindings への登録箇所では
`request.wrapperLaunch.worker_context?.capability.packet_digest ?? sha256Digest("")` と optional chain +
空 digest fallback を残しており、この fallback は到達不能な dead path である（issue #375）。
空 digest への fallback が目に見える形で残ると、「context 無しでも launch record が作られる」という
誤読を招き、worker context seal の fail-close 契約の読み違いリスクになる。

## 修復

- `context_digest` を、TS narrowing 済みの局所変数 `workerContext.capability.packet_digest` への
  直接参照へ置き換え、`?.` / `?? sha256Digest("")` を削除する。behavior 変更なしの refactor。
- oracle test `U-WIB-018` を `tests/worker-isolation-broker.test.ts` に追加し、broker 実行 origin の
  `context_digest` が sealed worker context の `packet_digest` と一致し、空文字列 digest と不一致
  であることを固定する。
- digest 呼出行の変化に伴い `config/digest-canonicalization-inventory.json` を
  `scanDigestInventory` で再生成する（該当 row 除去 + 後続行番号シフト）。

## 検証

- red 実測: 修正前に mutation（`context_digest: sha256Digest("")` のみへ書換）を適用した状態で
  `U-WIB-018` が AssertionError で Red（2026-08-06T16:44:49Z）。これは fallback 支配化 mutation の
  kill 証跡でもある。
- green 実測: 修正適用後に `tests/worker-isolation-broker.test.ts` 全体で 28 passed / 1 skipped
  （2026-08-06T16:45:13Z）。
- なお旧コード（`?.` + `??` 残存）そのものは到達不能ゆえ本 oracle では検出不能であり、この性質は
  dead path 除去の本質的な限界として記録する。oracle は「context_digest が常に sealed packet digest
  と一致する」という behavioral contract を固定し、fallback が live 化する mutation を kill する。

## 非対象

- `WorkerIsolationExecutionOrigin` schema・他 binding フィールド・fail-close 判定列の変更
- `worker_context` の型契約そのものの必須化（別スライスの型表現テーマ）
- `docs/governance/feedback-refactor-disposition.json`（bindings に
  `src/runtime/worker-isolation-broker.ts` は含まれず、sha256 更新対象外であることを実測確認）
