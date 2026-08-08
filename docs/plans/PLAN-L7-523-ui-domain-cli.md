---
plan_id: PLAN-L7-523-ui-domain-cli
title: "PLAN-L7-523 (add-impl): UI Domain CLI 検査表面（U-UDP-007）"
kind: add-impl
layer: L7
drive: agent
status: confirmed
route_mode: add-feature
backfill_state: pending_reverse
entry_signals:
  - "po_directive:2026-08-06 Design HARNESS未ブロックタスクとして#209 UI domain・Pattern Profileを進める（slice4）"
created: 2026-08-08
updated: 2026-08-08
owner: Claude / TL
github_issue_id: 209
engineering_discipline_required: true
behavior_contract_id: U-UDP-007
responsibility_owner: ui-domain-pattern-profile
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: none
contract_preconditions: "L6 §1 の evaluateUiDomainBundle 契約を正本とする。#177 slice4（PLAN-L7-519 registry CLI）と同じ規律（read-only・schema_version 付き JSON・typed error 経路）を踏襲する。L9 system assertion（SA-UDP-01〜03）は対象外"
contract_postconditions: "helix ui-domain check --input <file> が ui-domain-bundle.v1 を section 別（domain 必須、contract/profile/pack/trace/pairwise 任意）に評価し、section 名へ帰属した typed failure と決定的 report（report_digest 付き）を返す。全 section green で exit 0、fail-close 所見または typed error で exit 1"
contract_invariants: "read-only（DB / registry write なし）。依存 section（contract/trace→domain、pack→profile）の欠落・失敗は section-skipped の typed failure で fail-close し silent skip しない。同一入力 2 回で同一 report_digest"
contract_failures: "bundle schema 不一致・非 record・domain 欠落=UDP_STALE_INPUT。section 逸脱は各純関数の typed failure（UDP_CONTRACT_CONFLICT / UDP_PRODUCT_VALUE_IN_COMMON_PACK / UDP_PROFILE_INCOMPLETE / UDP_TRACE_UNBOUND / UDP_CARTESIAN_EXPLOSION 等）を section へ帰属して返す"
tdd_red_required: true
red_at: "2026-08-08T05:16:02Z"
green_at: "2026-08-08T05:17:15Z"
mutation_oracle_evidence: "tests/ui-domain-cli.test.ts が L8テスト設計スライス4表（U-UDP-007）を機械検査する。section 帰属（contract 競合 + pack 混入の同時並記で他 section の green を潰さない）・malformed fail-close（5 section 全ての必須ネスト field 欠落/null が section-malformed の UDP_STALE_INPUT になり domain green を保持）・report_digest 非衝突（中身の異なる green bundle は異なる digest）・決定性（同一入力 2 回で deep-equal）・exit 規約（green=0 / fail bundle=1 / file 欠落=1 typed error）・bundle 入口検査のいずれかを外す mutation は red で kill する"
complexity_effect: justified_positive
complexity_justification: "#209 の第4スライス。判定核 1 関数と CLI subcommand 1 本、oracle test 1 本のみ"
removal_trigger: "L6設計 ui-domain-pattern-profile がsupersedeされ、後継設計へ置換された時"
parent_design: docs/design/helix/L6-function-design/ui-domain-pattern-profile.md
pair_artifact: docs/test-design/helix/L8-ui-domain-pattern-profile-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/ui-domain-pattern-profile.md, oracle_id: U-UDP-007, test_path: tests/ui-domain-cli.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — #209 slice分割（CLI 表面を第4スライスに）" }
  - { role: se, slot_label: "SE — evaluateUiDomainBundle と ui-domain check 実装" }
  - { role: qa, slot_label: "QA — U-UDP-007 mutation oracle（section 帰属・exit 規約）" }
  - { role: tl, slot_label: "TL — read-only CLI 境界と #177 CLI 規律の踏襲" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-523-ui-domain-cli.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/ui-domain-pattern-profile.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-ui-domain-pattern-profile-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/design/ui-domain-pattern-profile.ts, artifact_type: source_module }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: tests/ui-domain-cli.test.ts, artifact_type: test_code }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: config }
  - { artifact_path: docs/governance/feedback-refactor-disposition.json, artifact_type: config }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-wrapper-admission.md, artifact_type: design_doc }
dependencies:
  parent: docs/plans/PLAN-L1-07-infinity-loop-platform-requirements.md
  requires:
    - docs/plans/PLAN-L7-520-ui-domain-core.md
    - docs/plans/PLAN-L7-521-ui-domain-pairwise.md
    - docs/plans/PLAN-L7-522-ui-domain-consumer-trace.md
    - docs/plans/PLAN-L7-519-design-registry-cli.md
review_evidence:
  - reviewer: "Claude code-reviewer subagent (intra-runtime)"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-08T05:35:31Z"
    tests_green_at: "2026-08-08T05:35:31Z"
    verdict: approve
    worker_model: claude-fable-5
    reviewer_model: claude-sonnet-5
    scope: "Codex CLIがusage limit継続中のため規定代替のintra_runtime_subagentとして、Claude code-reviewer（claude-sonnet-5, read-only）が2ラウンドでレビューした。1回目request changes（Important 2件をprobe実証: (1) section内容が構造不正（schema_version正・必須ネストfield欠落/null）のとき5/5 sectionで無捕捉TypeErrorとなり、typed failureでなく生エラーが返り評価済み他sectionの結果も握り潰される（probe523_2で全5種を実測、CLI経由でも再現）、(2) report_digestがsection名+ok+failure_codeのみで計算され、中身の異なるgreen bundle同士でdigestが完全衝突（probe523_3で実測）。Minor 2件: CLI catch節の形状、malformed反例テスト不在）。是正としてsectionOfをthunk受け取りのtry/catch wrapperへ変更し、section例外を当該sectionのUDP_STALE_INPUT（section-malformed）へfail-close（他sectionのgreenを保持）、probe523_2の5反例を恒久oracle化、UiBundleSectionReportV1へvalue_digest（各純関数の既存digestの引き上げ）を追加してreport_digestを実内容fingerprint化（非衝突oracle付き）、L6/L8/PLANの三者へ意味論を明文化した。2回目approve（Critical/Important/Minor全て0）。reviewerはround1と同一のbad-bundle.jsonをCLIへ再投入してstdoutに構造化report（domain green・contract failのsection別内訳）が出ることを実測し、probe523_3bでreport_digest非衝突への転化を直接再検証した。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --configLoader runner --project fast tests/ui-domain-cli.test.ts tests/ui-domain-canonicalize.test.ts tests/ui-domain-contract.test.ts tests/ui-domain-rulepack.test.ts tests/ui-domain-profile.test.ts tests/ui-domain-pairwise.test.ts tests/ui-domain-consumer-trace.test.ts tests/digest.test.ts tests/vmodel-pair.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-08T05:35:31Z", evidence_path: tests/ui-domain-cli.test.ts, output_digest: "sha256:4dc50aad4dd147a31476ee94e260bbec78b0323215962b12e007cb256014b487", result: "review是正後worktree: 9 files / 71 tests green（U-UDP-007 oracle・malformed 5反例・digest非衝突・digest/vmodel gate 群を含む）" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-08T05:35:31Z", evidence_path: tsconfig.json, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0" }
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-08T05:35:31Z"
  review_binding:
    reviewer: "Claude code-reviewer subagent (intra-runtime)"
    reviewed_at: "2026-08-08T05:35:31Z"
    evidence_digest: "sha256:cc7977649720785321111e0777e51651b45468bc00c04b874ccc44ba88594a03"
  entries: []
---

# PLAN-L7-523: UI Domain CLI 検査表面の実装

## 目的（Issue #209 第4スライス）

L6 §1 の `evaluateUiDomainBundle` を判定核として、`helix ui-domain check --input <file>` を
TDD で実装する。#209 の純関数群（slice1〜3）を 1 つの read-only 検査表面へ束ね、
section 別の typed failure 帰属と exit 規約（0=全 green / 1=fail-close）を提供する。
#177 slice4（PLAN-L7-519 registry CLI）と同じ規律を踏襲する。

## §3 工程表

### Step 1: L6 契約追記とred oracle作成 [直列]

根拠: downstream_dependency（bundle schema と section 帰属規則の確定が実装の前提）。

### Step 2: evaluateUiDomainBundle + ui-domain check 実装 → green [直列]

根拠: file_conflict（`src/design/ui-domain-pattern-profile.ts` / `src/cli.ts` への集中編集）。

### Step 3: review Step（別runtime判定。Codex usage limit中は intra_runtime_subagent = code-reviewer を規定代替とする） [直列]

根拠: downstream_dependency（前段実装の完成に依存するレビュー）。

### Step 4: confirm → db rebuild → commit → PR → CI → merge → Issue #209 evidence [直列]

根拠: shared_state（outstanding snapshot / harness.db projection の単一owner収束）。

## §3.1 実装計画

情報源: L6 §1（evaluateUiDomainBundle 行）、L8 スライス4表、PLAN-L7-519 の CLI 規律。
cli.ts 編集に伴う digest pin 3 系統（feedback-refactor-disposition 8 行 /
worker-wrapper-admission 3 digest / digest-canonicalization-inventory）を同時更新する。

## 後続スライス（本PLAN非対象）

- L9 system assertion（SA-UDP-01〜03、実 L2 正本 end-to-end）
