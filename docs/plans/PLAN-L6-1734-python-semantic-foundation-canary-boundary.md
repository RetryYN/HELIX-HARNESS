---
plan_id: PLAN-L6-1734-python-semantic-foundation-canary-boundary
title: "PLAN-L6-1734 (add-design): Python意味コアfoundationとverification verb dual-run canaryの実装境界"
kind: add-design
layer: L6
drive: agent
status: confirmed
backfill_state: pending_reverse
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: ADD_FEATURE
entry_signals:
  - "po_directive:2026-09-11 Issue #1734のruntime authority違反をfoundation firstで是正する"
created: 2026-09-11
updated: 2026-09-11
owner: Codex / TL
github_issue_id: 1734
engineering_discipline_required: true
behavior_contract_id: PYTHON-SEMANTIC-FOUNDATION-CANARY-001
responsibility_owner: python-semantic-runtime
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: no_change
ddd_modeling_decision: domain_service
runtime_responsibility: mixed_split_required
contract_preconditions: "ADR-009/010、既存HDS-HIL-12のL6設計とL7実行pair、#230の実装済みNode primitive、Issue #1734の12 module/13 behavior group分類を入力とする"
contract_postconditions: "12 module/13 behavior groupがowner、consumer、順序、rollback、authority state付きledgerへ固定され、foundationとclassifyVerificationVerb canaryの実装順、非対象、Step 0設計delta blockerが一意になる。runtime実装、test成立、activationは主張しない"
contract_invariants: "bulk port禁止、1 behavior atom・1 contractを維持する。既存#230 primitiveを再利用し、別envelope/store/intake/gateを作らない。canary成功だけで旧TS authorityを削除しない。#1732 canonical promotion解除条件とdelivery v1までの全atom移管・consumer 0義務を緩めない"
contract_failures: "toolchain/provenance/lock/SBOM/license未freeze、network deny未証明、stdio/schema/resource境界違反、Node再検証迂回、parity差、unknown verb誤分類、negative mutation生存、rollback不能、実consumer未接続をfail-closeする"
tdd_red_required: false
complexity_effect: justified_positive
complexity_justification: "第一PRは既存#230 primitiveを再利用するtyped ledgerと実装境界PLANだけを追加し、runtimeや重複contractを作らない"
removal_trigger: "全semantic atomが後継共通runtimeへ移管され、本canary固有dual-run adapterのconsumerが0になった時"
parent_design: docs/design/helix/L6-function-design/python-worker-runtime.md
dependencies:
  parent: docs/design/helix/L6-function-design/python-worker-runtime.md
  requires:
    - docs/governance/python-semantic-migration-ledger.v1.yaml
  blocks:
    - issue:1732
  references:
    - issue:230
    - issue:1734
review_evidence:
  - reviewer: "Claude Code / claude-fable-5-1"
    review_kind: cross_agent
    reviewed_at: "2026-09-11T14:46:51Z"
    tests_green_at: "2026-09-11T08:55:52.509Z"
    verdict: approve
    worker_model: codex-gpt-5
    reviewer_model: claude:claude-fable-5-1
    reviewer_session_id: fe061343-6172-4db5-8837-ef9aa5fd3af6
    reviewed_head_sha: ca5792db0dcc5a28d34c27a9fe5f38589195f18a
    receipt_url: "https://github.com/RetryYN/HELIX-HARNESS/pull/1739#issuecomment-5636233584"
    ci_evidence_generation: "run:34611398103:attempt:1:failure"
    scope: "PR #1739 exact HEAD ca5792db0のR00 ledger／foundation境界を独立レビュー。session再発行handshakeを現receiptへ束縛し、内容評価はc5222667b／0c078a1eaから不変。12 module／13 behavior group、既存Node primitive再利用、Python sandbox境界、bulk port禁止、classifyVerificationVerb canary、blocked pair非再利用、未実装義務の非偽装を確認し、blocker 0でapprove。"
    green_commands:
      - kind: lint
        command: "CI preflight aggregate: plan-lint, L1-L12 authority, typecheck and repository gates"
        runner: ci
        scope: gate
        exit_code: 0
        completed_at: "2026-09-11T08:55:52.509Z"
        evidence_path: .helix/evidence/review-1739/preflight-gate-results.json
        output_digest: "sha256:7e55a74f03e3fddd59c635ef928611655f1e9a4a6441287275469eee2a22ae86"
        result: "run 34580163083 attempt 2: 17 admitted gates, failures 0, unauthorized skips 0"
agent_slots:
  - { role: aim, slot_label: "AIM — ADR-009/010、HDS-HIL-12/14 freezeと既存#230 primitiveの接合" }
  - { role: se, slot_label: "SE — Python foundation、strict JSONL contract、Node adapter" }
  - { role: qa, slot_label: "QA — sandbox、dual-run parity、negative mutation、rollback、実consumer" }
  - { role: tl, slot_label: "TL — bulk port禁止と層別authorityの独立review" }
generates:
  - { artifact_path: docs/plans/PLAN-L6-1734-python-semantic-foundation-canary-boundary.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/python-semantic-migration-ledger.v1.yaml, artifact_type: yaml_config }
  - { artifact_path: .helix/evidence/review-1739/preflight-gate-results.json, artifact_type: json_config }
modifies:
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: tests/l12-hybrid-recognition.test.ts, artifact_type: test_code }
---

# PLAN-L6-1734: Python意味コアfoundationとverification verb canaryの実装境界

## 目的

ADR-009/010が要求するPython意味コアを、#230で実装済みのNode側revalidator、transaction consumer、intake
receipt、doctor gateへ接続する。新しい並行基盤は作らず、最小atom `classifyVerificationVerb`を用いて
foundationから実consumerまでの一経路を実証する。

#230の`PLAN-L7-524/525/526/527/531`はcurrent L1–L12の親authorityには使わず、実装済みprimitiveの
historical implementation evidenceとして再利用する。既存L6
`docs/design/helix/L6-function-design/python-worker-runtime.md`は実装境界の入力とする。一方、
`docs/test-design/helix/L6-python-worker-runtime-unit-test-design.md`はbehavior atom採取用の
compatibility sourceであり、current pair正本として再利用しない。Step 0でcurrent L7 pair deltaを作り、
review／pair-freeze後にだけ実装PLANから参照する。

本PLANとledgerを追加する第一PRは、foundation/canaryの実装順と責務境界を正本化する文書sliceである。
runtime、Python source、canary、test、activationは生成せず、実装完了を主張しない。

本PLANは#1732のpromotion解除条件を実装するための候補であり、起草やcanary greenだけでは解除しない。
残る12 atomのdependency frontier登録、最終consumer 0、旧TS authority削除はdelivery v1の必達義務として残す。

## 実装境界

### Python意味コア

- pair-freeze済みexact Python versionとinterpreter provenanceだけを許可する。
- 単一package manager、manifest／lock、worker root／entrypoint digest、wheel／sdist policyを固定する。
- strict JSONLをstdioで受け、request ID、contract ID/version、source digest、payload schema digestを必須にする。
- 入出力bytes、行数、処理時間、memory、同時run数を上限化し、超過はtyped failureで停止する。
- network default denyとし、repository、`.helix/`、DB path、credential、親processの環境変数を渡さない。
- Git、GitHub、filesystem正本、DBへ書かない。semantic envelopeの生成だけを行う。

### Node実行境界

- `semantic-contract-revalidator.ts`でschema、provenance、payload/envelope digestを再計算する。
- `semantic-commit-store.ts`の単一transaction writerとCAS／fenceを再利用する。
- `semantic-intake-receipt.ts`と`semantic-boundary.ts`を再利用し、別registry／store／gateを作らない。
- Python outputをcommand、SQL、path、codeとして実行しない。

## canary契約

`classifyVerificationVerb(command)`の閉じた出力集合を`vitest | tsc | doctor | lint | eslint | test | null`として
versioned contractへ固定する。`src/runtime/session-log.ts`を実consumerとし、shadow dual-run期間は同一入力をTSと
Pythonへ渡して結果を比較する。不一致時はcommit／escalation groupingへPython結果を使わず、typed parity findingと
redacted input digestだけを記録する。

negative mutationは少なくとも、規則順序逆転、case normalization除去、unknownの強制分類、`vitest`と`lint`の
誤併合、contract version不一致、digest据置きpayload改変、timeout、余剰stdoutを個別にkillする。rollbackはruntime
pointerをTS-onlyへ戻し、同じfixtureで再実行できることを実証する。

## planned exact set（将来L6/L7 deltaのStep 0 blocker）

将来の実装PRは、既存L6/L7 pairへfoundation/canary固有APIとoracleを追加する設計deltaを先に作る。
予定oracleは`U-PYSEM-001..008`と`IT-PYSEM-001..006`である。これらは本PLANの
`verification_bindings`へ登録せず、現時点で成立済みとも扱わない。L6 API行、L7 oracle表、実test pathの
exact joinが成立してから、別のL7 implementation PLANがbindingを所有する。

## 工程表

### Step 0: 既存L6/L7 pairへfoundation/canary設計deltaを追加 [直列]

既存L6 designとpairを正本として、予定oracleのAPI、failure、test path、mutation ownerを一意化する。
このdeltaがreview／pair-freezeされるまでruntime実装PLANを起票しない。

### Step 1: HDS-HIL-12/14 supply-chain pair-freeze [直列]

Python exact version、provenance、manager、manifest／lock、artifact、wheel／sdist、SBOM／license、offline再現、
network denyを固定する。未分類dependencyまたは複数authorityが残る場合はStep 2へ進まない。

### Step 2: foundationとstrict JSONL envelope generatorをTDDで実装 [直列]

U-PYSEM-001..004を先にred化し、bounded process、environment非付与、protocol、determinismを実装する。
Node側では#230 primitiveを呼ぶadapterだけを追加し、意味判定を再実装しない。

### Step 3: `classifyVerificationVerb` atomをshadow dual-runへ接続 [直列]

U-PYSEM-005..008を先にred化し、Python atomとNode adapterを実装する。既存TS実装はrollback authorityとして
保持し、Python結果をactive authorityへ即時昇格しない。

### Step 4: 実consumer canaryとnegative mutation [直列]

`session-log.ts`の実経路でIT-PYSEM-001..006を実行し、parity、timeout、malformed output、resource超過、
Node再検証、rollbackを実測する。fixtureだけの一致をconsumer接続完了へ読み替えない。

### Step 5: 独立review、限定activation、read-after [直列]

別runtimeがexact HEAD、Python artifact digest、SBOM/license、sandbox receipt、mutation結果、consumer receiptを
検証する。限定activation後もTS/Python差分を計測し、rollback windowを閉じるまでは旧TSを削除しない。

### Step 6: 残る12 atomをdependency frontierへ登録 [並列可]

台帳のPYSEM-002..013をowner、consumer、順序、rollback付きでdelivery v1 frontierへ登録する。登録は実装完了では
なく、ownerなし／期限なし／consumer不明で棚上げしないための未完了義務である。

## #1732 promotion解除のexact判定

解除には、台帳13件の完全性、foundation freeze、strict JSONLとsandbox、Node再検証、PYSEM-001の実consumer
canary、残12件のdependency frontier登録をすべて要求する。いずれか欠落時は`completion_claim_allowed: false`を
維持する。promotion後も全atomのconsumer 0と旧TS semantic authority削除をRelease admissionまで追跡し、
canonical化で相殺しない。
