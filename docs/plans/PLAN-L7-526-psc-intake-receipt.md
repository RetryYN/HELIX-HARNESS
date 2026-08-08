---
plan_id: PLAN-L7-526-psc-intake-receipt
title: "PLAN-L7-526 (add-impl): semantic contract 層 — intake receipt（U-PSC-005 / VDH-FR-001）"
kind: add-impl
layer: L7
drive: agent
status: confirmed
route_mode: add-feature
backfill_state: pending_reverse
entry_signals:
  - "po_directive:2026-08-06 Design HARNESS未ブロックタスクとして#230 Python意味コアとNode transaction境界を進める（slice4）"
created: 2026-08-08
updated: 2026-08-08
owner: Claude / TL
github_issue_id: 230
engineering_discipline_required: true
behavior_contract_id: U-PSC-005
responsibility_owner: semantic-contract-revalidator
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: none
contract_preconditions: "PLAN-L4-53 の L4 §1（VDH-FR-001 primary ownership）と L6 §4 の buildIntakeReceipt 契約を正本とする。本スライスは pure な receipt 構築のみを実装し、実 source package の読み取り（filesystem I/O）と永続化は対象外（永続化は §3 transaction consumer、実 inventory 突合は L9 SA-PSC-04）"
contract_postconditions: "buildIntakeReceipt が canonical source（filename / source_digest / entries {path,digest} / inventory_digest）と添付中間物の差異（path 存在の両方向 + 同一 path の内容差異）、atom disposition を 1 つの決定的 receipt へ固定する。inventory_digest は entries を path 昇順へ正規化して再計算し、receipt_digest は entries / rulings / dispositions の宣言順に依存しない"
contract_invariants: "宣言された添付中間物は非正本であり、canonical と同一 source_digest を名乗る昇格企図は fail-close する（保証範囲の限定: 本 API は pure であり「宣言された canonical が真の正本か」は検証できない。intermediate_source 未宣言の入力や中間物内容を canonical として宣言する入力の検出は L9 SA-PSC-04 の実 inventory 突合が担う）。filesystem / clock / DB を読まず write authority を持たない。entry path は §1 と同じ segment allowlist で封じ込める"
contract_failures: "schema 不一致・entry_count 不一致・entry path 重複・path 逸脱・closed set 外の ruling / decision・空 rationale=PSC_SCHEMA_INVALID、宣言 inventory_digest と再計算値の不一致=PSC_DIGEST_MISMATCH、差異の裁定漏れ・disposition を欠く atom・intermediate の canonical 昇格企図=PSC_INTAKE_UNRESOLVED を全列挙 fail-close する"
tdd_red_required: true
red_at: "2026-08-08T11:52:20Z"
green_at: "2026-08-08T11:53:24Z"
mutation_oracle_evidence: "tests/semantic-intake-receipt.test.ts が L8テスト設計スライス4表（U-PSC-005）を機械検査する。差異の全列挙（canonical のみ / intermediate のみ / 同一 path の内容差異 content_mismatch）と裁定要求・内容差異 receipt の digest 非衝突・disposition 欠落検出・inventory_digest の masked mutation 検出・path 封じ込め（絶対 path / `..` / percent-encode の 3 反例）・entry_count 不一致・entry 重複・closed set 外 decision・空 rationale・intermediate 昇格企図の拒否・宣言順を入れ替えた意味的同一入力での receipt_digest 一致のいずれを外す mutation も red で kill する"
complexity_effect: justified_positive
complexity_justification: "#230 の第4スライス。pure 関数 1 本と digest helper 1 本、oracle test 1 本のみ"
removal_trigger: "L6設計 semantic-contract-revalidator §4 がsupersedeされ、後継設計へ置換された時"
parent_design: docs/design/helix/L6-function-design/semantic-contract-revalidator.md
pair_artifact: docs/test-design/helix/L8-semantic-contract-revalidator-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/semantic-contract-revalidator.md, oracle_id: U-PSC-005, test_path: tests/semantic-intake-receipt.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — VDH-FR-001 の receipt 固定範囲の確定" }
  - { role: se, slot_label: "SE — buildIntakeReceipt 実装" }
  - { role: qa, slot_label: "QA — U-PSC-005 mutation oracle（差異裁定・disposition・決定性）" }
  - { role: tl, slot_label: "TL — 中間物の非正本境界（昇格禁止）のレビュー" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-526-psc-intake-receipt.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/semantic-contract-revalidator.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-semantic-contract-revalidator-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/semantic/semantic-intake-receipt.ts, artifact_type: source_module }
  - { artifact_path: src/semantic/semantic-contract-revalidator.ts, artifact_type: source_module }
  - { artifact_path: tests/semantic-intake-receipt.test.ts, artifact_type: test_code }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: config }
dependencies:
  parent: docs/plans/PLAN-L4-53-python-semantic-core-node-boundary.md
  requires:
    - docs/plans/PLAN-L7-524-psc-semantic-contract.md
    - docs/plans/PLAN-L7-525-psc-transaction-consumer.md
review_evidence:
  - reviewer: "Claude code-reviewer subagent (intra-runtime)"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-08T12:07:05Z"
    tests_green_at: "2026-08-08T12:07:05Z"
    verdict: approve
    worker_model: claude-fable-5
    reviewer_model: claude-sonnet-5
    scope: "Codex CLIがusage limit継続中のため規定代替のintra_runtime_subagentとして2ラウンドでレビューした。1回目request changes（Important 3件: (1) entriesがpath文字列のみでL3 §1が実施する同一pathのbyte digest照合（10対象）をreceiptが表現できず「同名で中身がすり替わる」差異を検出も記録もできない、(2) contract_invariantsとL6 §4が『中間物を昇格させる経路を持たない』と無条件断定していたがprobe526_1でintermediate_source未宣言なら素通りすることを実測（pure関数の限界に対する過大主張）、(3) path封じ込めロジックがslice1と2ファイルへverbatim複製されslice1側が非export のため共有不能でsecurity修正のdrift riskがある。Minor 2件: superseded/duplicateの意味未定義・未テスト、非nullアサーション2件によるwarning純増）。是正としてentriesを{path,digest}へ拡張しcontent_mismatch側を新設して3軸で全列挙（inventory_digestもpath+digestで再計算）、保証範囲の限定（真の正本との突合はL9 SA-PSC-04）をPLANとL6へ明記、path guardをslice1からexportして単一正本化、4種rulingの意味をJSDocとL6へ明記しsupersededを実テストで使用、非nullアサーションを解消した。2回目approve（Critical/Important/Minor全て0）。reviewerはprobe526_r2_aでcontent_mismatchの排他性（同一内容pathをfalse positiveしない、3差異のみ厳密列挙）とentries拡張後のmasked mutation/entry_count/percent-encode検査の非退行、export化によるslice1非退行を独立実測した。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --configLoader runner --project fast tests/semantic-intake-receipt.test.ts tests/semantic-contract-revalidator.test.ts tests/semantic-commit-store.test.ts tests/digest.test.ts tests/coding-rules.test.ts tests/l12-hybrid-recognition.test.ts tests/vmodel-pair.test.ts tests/design-language.test.ts tests/ddd-tdd-rules.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-08T12:07:05Z", evidence_path: tests/semantic-intake-receipt.test.ts, output_digest: "sha256:c3784e871cfc73c17805510bbb8d1c48bc8ae0d74c79503cec78806b995fb522", result: "review是正後worktree: 9 files / 130 tests green（U-PSC-005 oracle・content_mismatch裁定・masked mutation・path封じ込め・決定性を含む）" }
      - { kind: lint, command: "npx biome check src tests", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-08T12:07:05Z", evidence_path: biome.json, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0（error 0、既存 warning 17・純増 0）" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-08T12:07:05Z", evidence_path: tsconfig.json, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0" }
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-08T12:07:05Z"
  review_binding:
    reviewer: "Claude code-reviewer subagent (intra-runtime)"
    reviewed_at: "2026-08-08T12:07:05Z"
    evidence_digest: "sha256:3e0872c51adcbe60434133f9b5c84882a4d30e387774053b3635addb61d677fd"
  entries: []
---

# PLAN-L7-526: semantic contract 層 — intake receipt の実装

## 目的（Issue #230 第4スライス）

VDH-FR-001（source filename / digest / inventory / 添付中間物との差異 / atom disposition を
intake receipt へ固定する）を TDD で実装する。中間物が正本へ昇格しないことを機械化し、
差異と atom の裁定漏れを fail-close する。

## §3 工程表

### Step 1: L6 §4 契約追記と red oracle 作成 [直列]

根拠: downstream_dependency（receipt schema と裁定規則の確定が実装の前提）。

### Step 2: buildIntakeReceipt 実装 → green [直列]

根拠: file_conflict（新規 module `src/semantic/semantic-intake-receipt.ts` への集中編集）。

### Step 3: review Step（別runtime判定。Codex usage limit中は intra_runtime_subagent = code-reviewer を規定代替とする） [直列]

根拠: downstream_dependency（前段実装の完成に依存するレビュー）。

### Step 4: confirm → db rebuild → commit → PR → CI → merge → Issue #230 evidence [直列]

根拠: shared_state（outstanding snapshot / harness.db projection の単一owner収束）。

## §3.1 実装計画

情報源: L3 §1（canonical source / 211-file inventory / 中間物 208 entries の非昇格裁定）、
L6 §4。digest は宣言値を信用せず正規化 entries から再計算する。path 封じ込めは §1 の
segment allowlist を共有し、percent-encode traversal も decode 前に拒否する。

## 後続スライス（本PLAN非対象）

- gate 配線（SA-PSC-03、doctor/lint への接続）
- Python 意味コア骨格（L5 §0 の supply-chain freeze 着地後）
- 実 source package の読み取りと実 inventory 突合（L9 SA-PSC-04）
