---
plan_id: PLAN-L7-522-ui-domain-consumer-trace
title: "PLAN-L7-522 (add-impl): UI Domain registry consumer trace（U-UDP-006 / IT-UDP-001-002）"
kind: add-impl
layer: L7
drive: agent
status: confirmed
route_mode: add-feature
backfill_state: pending_reverse
entry_signals:
  - "po_directive:2026-08-06 Design HARNESS未ブロックタスクとして#209 UI domain・Pattern Profileを進める（slice3）"
created: 2026-08-08
updated: 2026-08-08
owner: Claude / TL
github_issue_id: 209
engineering_discipline_required: true
behavior_contract_id: U-UDP-006
responsibility_owner: ui-domain-pattern-profile
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: none
contract_preconditions: "L5 §1 の prefix 再利用表（#177 共有 ID 空間 SCR-/FLW-/CMP-/TOK-/CNT-）と L6 §1 の buildUiConsumerTrace 契約を正本とする。本スライスは read-only consumer 検査のみを実装し、registry への write（#177 transaction 経路）・CLI 表面・L9 system assertion は対象外とする"
contract_postconditions: "buildUiConsumerTrace が共有 prefix entity ごとに registry graph の canonical node と entity_id + kind 対応を検査し、entity_id 昇順の決定的 trace entry 列 + trace_digest を返す。UI-local prefix（NAV-/RGN-/PTN-/FBK-/UST-）には registry binding を要求しない"
contract_invariants: "台帳の複製新設をしない（read-only consumer）。graph node 順序を入れ替えた意味的同一入力でも trace_digest は一致する。乱数・時刻に依存しない"
contract_failures: "registry node 欠落・kind 不対応・authority≠canonical（shadow/stale/retired、shadow は未成熟 node への binding を安全側で拒否）参照=UDP_TRACE_UNBOUND（全列挙 fail-close、fail-fast で潰さない）、graph 側の重複 entity_id・schema 不一致=UDP_STALE_INPUT を typed failure で返す"
tdd_red_required: true
red_at: "2026-08-08T04:34:23Z"
green_at: "2026-08-08T04:36:21Z"
mutation_oracle_evidence: "tests/ui-domain-consumer-trace.test.ts が L8テスト設計 U-UDP-006 行と L5結合テスト設計 IT-UDP-001 / IT-UDP-002 を機械検査する。binding 判定（欠落・kind 不対応・shadow/stale 参照・重複 entity_id・異種失敗の混在全列挙）・決定性（graph node 順序と domain entity 順序の双方の入替で trace_digest 一致）・UI-local 除外のいずれかを外す mutation は red で kill する"
complexity_effect: justified_positive
complexity_justification: "#209 の第3スライス。consumer trace 関数 1 本と結合 oracle test 1 本のみ"
removal_trigger: "L6設計 ui-domain-pattern-profile がsupersedeされ、後継設計へ置換された時"
parent_design: docs/design/helix/L6-function-design/ui-domain-pattern-profile.md
pair_artifact: docs/test-design/helix/L8-ui-domain-pattern-profile-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/ui-domain-pattern-profile.md, oracle_id: U-UDP-006, test_path: tests/ui-domain-consumer-trace.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — #209 slice分割（consumer traceを第3スライスに）" }
  - { role: se, slot_label: "SE — buildUiConsumerTrace 実装" }
  - { role: qa, slot_label: "QA — U-UDP-006 / IT-UDP-001-002 mutation oracle" }
  - { role: tl, slot_label: "TL — #177 共有 ID 空間と read-only consumer 境界" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-522-ui-domain-consumer-trace.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/ui-domain-pattern-profile.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-ui-domain-pattern-profile-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/test-design/helix/L5-ui-domain-pattern-profile-integration-test-design.md, artifact_type: test_design }
  - { artifact_path: src/design/ui-domain-pattern-profile.ts, artifact_type: source_module }
  - { artifact_path: tests/ui-domain-consumer-trace.test.ts, artifact_type: test_code }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: config }
dependencies:
  parent: docs/plans/PLAN-L1-07-infinity-loop-platform-requirements.md
  requires:
    - docs/plans/PLAN-L7-520-ui-domain-core.md
    - docs/plans/PLAN-L7-521-ui-domain-pairwise.md
    - docs/plans/PLAN-L7-516-design-registry-core.md
review_evidence:
  - reviewer: "Claude code-reviewer subagent (intra-runtime)"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-08T04:49:19Z"
    tests_green_at: "2026-08-08T04:49:19Z"
    verdict: approve
    worker_model: claude-fable-5
    reviewer_model: claude-sonnet-5
    scope: "Codex CLIがusage limit継続中のため規定代替のintra_runtime_subagentとして、Claude code-reviewer（claude-sonnet-5, read-only）が2ラウンドでレビューした。1回目request changes（Important 2件をprobe実証: (1) graph側の重複entity_idがMap構築の後勝ちでsilentに解決され、重複nodeの並び順だけでok/failが変わる非決定的挙動（probe522_3で実測）、(2) 実装のauthority≠canonical拒否（shadowも拒否）がL6/PLANの『stale|retired』記述より広くdoc乖離（probe522_4で実測）。Minor 2件: 欠落+kind不対応の混在列挙が未テスト、mutation claimの決定性範囲がgraph node順序のみ）。是正として重複entity_id検出をUDP_STALE_INPUTでfail-close（並び順どちらでも同一失敗の恒久oracle付き）、authority≠canonicalを安全側の意図的仕様としてL6 §1・PLAN contract_failures・L8 U-UDP-006行へ明文化しshadowテストを追加、混在全列挙とdomain.entities逆順決定性のテストを追加（reviewerのprobe522_1/2/3を全て恒久oracle化）。2回目approve（Critical/Important/Minor全て0）。reviewerはprobe522_3bでround1反例（誤kind nodeの先/後両順序）が同一のUDP_STALE_INPUT失敗へ転じたことを直接再検証し、round1の不確実点（#177 canonicalizer経由保証への依存）もfail-close追加により前提の真偽に依存しない防御になったと確認した。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --configLoader runner --project fast tests/ui-domain-consumer-trace.test.ts tests/ui-domain-canonicalize.test.ts tests/ui-domain-contract.test.ts tests/ui-domain-rulepack.test.ts tests/ui-domain-profile.test.ts tests/ui-domain-pairwise.test.ts tests/digest.test.ts tests/vmodel-pair.test.ts tests/plan-specific-vpair-binding.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-08T04:49:19Z", evidence_path: tests/ui-domain-consumer-trace.test.ts, output_digest: "sha256:567433f235721c7880a6d7317d431c22791cc90c73f542b245cc9e246203c9c3", result: "review是正後worktree: 8 files / 69 tests green（U-UDP-006 / IT-UDP-001-002 oracle・重複/shadow/混在/順序反例・digest/vmodel gate 群を含む）" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-08T04:49:19Z", evidence_path: tsconfig.json, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0" }
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-08T04:49:19Z"
  review_binding:
    reviewer: "Claude code-reviewer subagent (intra-runtime)"
    reviewed_at: "2026-08-08T04:49:19Z"
    evidence_digest: "sha256:f3e1c6a3af64adf6d0d0154187cbc01f32e460ae15a52c66d20ce50c29fddd87"
  entries: []
---

# PLAN-L7-522: UI Domain registry consumer trace の実装

## 目的（Issue #209 第3スライス）

L5 §1 の prefix 再利用表と L6 §1 の契約に基づき、#177 registry の typed consumer として
共有 ID 空間（SCR-/FLW-/CMP-/TOK-/CNT-）の binding を read-only 検査する
`buildUiConsumerTrace` を TDD で実装する。あわせて L5 結合テスト設計の
IT-UDP-001（canonicalize→contract→profile 連結 fail-close）と
IT-UDP-002（risk→fixture 選定→consumer trace の決定性と ID 空間整合）を同 test で結合検査する。

## §3 工程表

### Step 1: L5 §1 / L6 契約突き合わせとred oracle作成 [直列]

根拠: downstream_dependency（共有 ID 空間の対応表確定が実装の前提）。

### Step 2: buildUiConsumerTrace 実装 → green [直列]

根拠: file_conflict（同一module `src/design/ui-domain-pattern-profile.ts` への集中編集）。

### Step 3: review Step（別runtime判定。Codex usage limit中は intra_runtime_subagent = code-reviewer を規定代替とする） [直列]

根拠: downstream_dependency（前段実装の完成に依存するレビュー）。

### Step 4: confirm → db rebuild → commit → PR → CI → merge → Issue #209 evidence [直列]

根拠: shared_state（outstanding snapshot / harness.db projection の単一owner収束）。

## §3.1 実装計画

情報源: L5 §1（prefix 再利用表・consumer trace 規定）、L6 §1（buildUiConsumerTrace 契約）、
L8 スライス3表、L5 結合テスト設計。`UI_REGISTRY_KIND_MAP`（page→screen / user_flow→flow /
ui_component→component / design_token→design_token / content→content）を機械化し、
違反は UDP_TRACE_UNBOUND で全列挙 fail-close する。write authority を持たない
（#177 transaction 経路のみが registry writer）。

## 後続スライス（本PLAN非対象）

- CLI 表面（ui-domain 検査コマンド）
- L9 system assertion（SA-UDP-01〜03、実 L2 正本 end-to-end）
