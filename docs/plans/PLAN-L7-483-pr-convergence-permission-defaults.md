---
plan_id: PLAN-L7-483-pr-convergence-permission-defaults
title: "PLAN-L7-483 (impl): PR収束レーン2 commandのconsumer事前許可"
kind: impl
layer: L7
drive: agent
status: draft
route_mode: forward
entry_signals:
  - "po_directive:2026-07-30 PR収束レーンのreceipt／merge許可を配布templateにも入れる"
created: 2026-07-30
updated: 2026-07-30
owner: Claude Code / TL
engineering_discipline_required: true
behavior_contract_id: U-PRPERM-001
responsibility_owner: pr-convergence-permission-defaults
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: none
contract_preconditions: "consumerがadapter templateから`.claude/settings.json`を受け取り、`helix github pr-review-receipt`と`helix github pr-merge-reviewed`がCLI surfaceに実在する"
contract_postconditions: "consumer templateがPR収束レーンの2 commandだけをexact setで事前許可し、それ以外のcommandを許可しない"
contract_invariants: "receiptとmergeのfail-close契約を変更しない。許可が外すのは対話promptだけであり、同一HEAD CI green・DB convergence・current HEAD receipt再照合の要求は維持する"
contract_failures: "allow setから2 commandが欠落する、または宣言commandがCLI surfaceに存在しない場合にfail-closeする"
tdd_red_required: true
red_at: "2026-07-30T03:24:00+09:00"
green_at: "2026-07-30T03:26:13+09:00"
mutation_oracle_evidence: "tests/setup.test.ts の U-PRPERM-001 は allow set の exact 一致を要求するため、2 command のいずれかを削除する mutation でも無関係 command を追加する mutation でも fail する。U-PRPERM-002 は宣言 subcommand を `helix github --help` の実 surface と突合するため、存在しない command 名へ差し替える mutation で fail する。byte manifest pin (U-ICLOSE-003) は差分の有無しか検出しないため、意味を固定する oracle として両者を独立に置く"
complexity_effect: net_neutral
complexity_justification: "新しいgate、schema、runtime pathを追加せず、既存adapter templateへ宣言2行とexact-set oracleを足すだけに留める"
removal_trigger: "Claude Codeがharness側fail-close契約を認識して収束レーンcommandを既定許可するようになり、template側の宣言が重複になった時点"
parent_design: docs/design/helix/L6-function-design/orchestration-memory.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/orchestration-memory.md, oracle_id: U-PRPERM-001, test_path: tests/setup.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/orchestration-memory.md, oracle_id: U-PRPERM-002, test_path: tests/setup.test.ts }
agent_slots:
  - role: se
    slot_label: "SE — adapter templateとfile mirrorの同期"
  - role: qa
    slot_label: "QA — allow set exact一致とCLI surface突合"
  - role: tl
    slot_label: "TL — 事前許可境界のreview"
generates:
  - { artifact_path: docs/plans/PLAN-L7-483-pr-convergence-permission-defaults.md, artifact_type: markdown_doc }
  - { artifact_path: docs/templates/adapter/.claude/settings.json, artifact_type: config }
  - { artifact_path: docs/test-design/harness/L8-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/setup/templates.ts, artifact_type: source_module }
  - { artifact_path: tests/setup.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L7-473-claude-pr-convergence.md
  requires:
    - docs/design/helix/L6-function-design/orchestration-memory.md
  references:
    - docs/test-design/harness/L8-unit-test-design.md
  blocks: []
---

# PLAN-L7-483: PR収束レーン2 commandのconsumer事前許可

## 目的

Claude Code収束レーンが`helix github pr-review-receipt`と`helix github pr-merge-reviewed`を
対話prompt待ちで中断しないようにする。PR #268／#269の実運用では、CI greenを確認してから
receipt発行までの間に権限promptで停止し、その間にHEADが進んでreview receiptがstale化する
事象が繰り返し発生した（同一PRで6回のHEAD更新）。

事前許可が外すのは**対話promptだけ**である。receiptは同一HEADのCI greenとDB convergenceを、
mergeはcurrent HEADのreceipt再照合を、それぞれfail-closeで要求し続ける。実体のガードは
harness側の契約に残るため、prompt除去でmerge判断が緩むことはない。

## §工程表

### Step 1: adapter templateへ宣言追加 [直列]

- `src/setup/templates.ts`の`adapter/.claude/settings.json`へ`permissions.allow`を追加する。
- `docs/templates/adapter/.claude/settings.json`のfile mirrorを同一内容へ同期する。

### Step 2: exact-set oracle [直列]

- allow setのexact一致を要求するoracleを置き、command欠落と無関係command混入の双方をkillする。
- 宣言subcommandを`helix github --help`の実surfaceと突合し、存在しないcommand名をkillする。

### Step 3: digest pin追随 [直列]

- byte manifest pinとadapter entry digestを実測値へ更新する。

## §1 受入条件

- AC-1: consumer templateの`permissions.allow`が2 commandのexact setである。
- AC-2: 宣言した2 commandが`helix github --help`に実在する。
- AC-3: `src/setup/templates.ts`とfile mirrorの内容が一致する。
- AC-4: receipt／mergeのfail-close契約（CI green、DB convergence、current HEAD再照合）を変更しない。
- AC-5: 2 command以外を事前許可しない。

## §2 検証コマンド

- `npx --no-install vitest run --project fast tests/setup.test.ts`
- `npm run helix -- plan lint docs/plans/PLAN-L7-483-pr-convergence-permission-defaults.md`
- `npm run typecheck`

## 非対象

- この repository 自身の tracked `.claude/settings.json`（配布surfaceではない）。
- receipt／merge以外のcommandの事前許可。
- 権限モデルそのものの変更、新しいgate／schema／runtime pathの追加。
