---
plan_id: PLAN-L7-513-screen-stage-closure-store
title: "PLAN-L7-513 (add-impl): ScreenApplicabilityStore と stage closure gate（U-SAP-011）"
kind: add-impl
layer: L7
drive: agent
status: confirmed
route_mode: add-feature
backfill_state: pending_reverse
entry_signals:
  - "po_directive:2026-08-06 Design HARNESS未ブロックタスクとして#175 ScreenApplicabilityGateを進める（slice4）"
created: 2026-08-07
updated: 2026-08-07
owner: Claude / TL
github_issue_id: 175
engineering_discipline_required: true
behavior_contract_id: U-SAP-011
responsibility_owner: screen-applicability
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: none
contract_preconditions: "L6設計 docs/design/helix/L6-function-design/screen-applicability-prototype.md §2/§5 の ScreenApplicabilityStoreV1 契約と store DbC prose を正本とする。本スライスは in-memory reference store（決定的、DB/filesystem 非依存）として意味契約を実装し、harness.db projection への接続は後続スライスとする"
contract_postconditions: "commitStageClosureAndGate が current plan route 後に no-UI 三者identity/skip authority と UI agreement/backprop authority（receipt ID/digest/current head/canonical bytes/freshness）を検査し、固定分母の UI/no-UI disjoint exact set を再導出したうえで、stage closure と gate receipt を同一 operation・CAS・exact write-set で atomic commit する。gate row への write authority は store のみ（型 gate_write_authority を保持）"
contract_invariants: "stale/superseded authority・caller receipt swap・current plan route より先の gate commit・同 operation の二重 gate・順序逆転・CAS 不一致・各 append fault では stage/gate 増分 0。slice1-3 の pure evaluator の挙動を変えない"
contract_failures: "authority receipt ID/digest 不一致・current head 不一致・canonical bytes 改変・trustedNow freshness 超過・requirement revision 連鎖不整合・分母集合の欠落/余剰/重複・write_set/operation digest 改変・二重 commit を typed failure で fail-close する"
tdd_red_required: true
red_at: "2026-08-07T04:24:19Z"
green_at: "2026-08-07T04:27:13Z"
mutation_oracle_evidence: "tests/screen-stage-closure-gate.test.ts の it.each mutation が L6テスト設計 U-SAP-011 行を機械検査する。digest payload に含まれる field は build 前 tamper（self-consistent digest で不正な分母・gate 内容・authority swap を構築）で、含まれない field は build 後 tamper で、それぞれ意図した防御分岐へ到達させる（v8 coverage 実測で遮蔽ゼロを確認する方式、PLAN-L7-512 の masked-mutation 教訓の適用）"
complexity_effect: justified_positive
complexity_justification: "Design HARNESS の新規機能ユニット（#175）の第4スライス。store module 1本とtest 1本のみを追加し、harness.db projection・CLI 表面は後続スライスへ分離する"
removal_trigger: "L6設計 screen-applicability-prototype がsupersedeされ、後継設計のstoreへ置換された時"
parent_design: docs/design/helix/L6-function-design/screen-applicability-prototype.md
pair_artifact: docs/test-design/helix/L8-screen-applicability-prototype-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/screen-applicability-prototype.md, oracle_id: U-SAP-011, test_path: tests/screen-stage-closure-gate.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — #175 slice分割（store と stage closure gate を第4スライスに）" }
  - { role: se, slot_label: "SE — in-memory reference store 実装" }
  - { role: qa, slot_label: "QA — U-SAP-011 mutation oracle" }
  - { role: tl, slot_label: "TL — 唯一の gate write authority 境界" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-513-screen-stage-closure-store.md, artifact_type: markdown_doc }
  - { artifact_path: docs/test-design/helix/L8-screen-applicability-prototype-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/design/screen-applicability-store.ts, artifact_type: source_module }
  - { artifact_path: tests/screen-stage-closure-gate.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L3-20-infinity-loop-g3-freeze.md
  requires:
    - docs/design/helix/L6-function-design/screen-applicability-prototype.md
    - docs/test-design/helix/L6-screen-applicability-prototype-unit-test-design.md
    - docs/plans/PLAN-L7-512-screen-freeze-plan-route.md
review_evidence:
  - reviewer: "Claude code-reviewer subagent (intra-runtime)"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-07T04:49:30Z"
    tests_green_at: "2026-08-07T04:48:51Z"
    verdict: approve
    worker_model: claude-fable-5
    reviewer_model: claude-sonnet-5
    scope: "Codex CLIがusage limit継続中のため規定代替のintra_runtime_subagentとして、Claude code-reviewer（claude-sonnet-5, read-only）が2ラウンドでレビューした。1回目request changes（Critical 1件: gateオブジェクトの内容（verdict/route/snapshot/digest群）がoperation digestにも独立検証にも拘束されず、reviewerがprobeで自己矛盾gate（verdict=failed等）のcommit成功を実証。Important 5件: plan_route_swap・denominator再導出・agreement/backprop/ui capability swap・read系missing分岐がoperation_digestチェックに遮蔽され実質未検証（v8 coverage実測で0-hit）、PLANのmutation_oracle_evidence claimが実測と乖離）。是正としてstageOperationDigestへgate内容9 fieldをbind、commitStageClosureAndGateへgate_content_mismatch独立検証を追加、fixture builderをoverrides対応にしてdigest対象fieldはbuild前tamper・非対象fieldはbuild後tamperへ整理（gate偽装5・分母不整合4・authority swap 4・seed側差し替え2・read系直接検証を追加、20→36 cases）。2回目approve（Critical/Important 0件、Minor 2件=useOptionalChain warning是正済み・review_evidence記録=本entry）。reviewerはround 1のCritical probeを同一手順で再実行してfail-close（増分0）を直接確認し、branchMap全件照合でzero-hit branchがcanonicalizeRecordの配列path（型上実行不能な汎用helper分岐）1箇所のみ、Statements 99.35%/Branches 99.13%、48/48 green、tsc 0、biome exit 0、plan lint全OKを独立実測した。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --configLoader runner --project fast tests/screen-stage-closure-gate.test.ts tests/coding-rules.test.ts tests/review-evidence.test.ts tests/design-language.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-07T04:48:51Z", evidence_path: tests/screen-stage-closure-gate.test.ts, output_digest: "sha256:4b2c3920db638cf35aa47dddc16be24ca0de9795ee0f78d15c2d320261046598", result: "review是正後worktree: 4 files / 89 tests passed（U-SAP-011の36件を含む）" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-07T04:48:51Z", evidence_path: tsconfig.json, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0" }
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-07T04:49:30Z"
  review_binding:
    reviewer: "Claude code-reviewer subagent (intra-runtime)"
    reviewed_at: "2026-08-07T04:49:30Z"
    evidence_digest: "sha256:7e909283174bc662d8fc8e3ff1cdb0d7db5ffe1a39e07b318a85fdd986836ad3"
  entries: []
---

# PLAN-L7-513: ScreenApplicabilityStore と stage closure gate の実装

## 目的（Issue #175 第4スライス）

L6設計 §2/§5 の `ScreenApplicabilityStoreV1` を in-memory reference store として実装し、
唯一の gate write authority である `commitStageClosureAndGate`（U-SAP-011）を TDD で追加する。

- read 系 5 API（plan route receipt / skip receipt / skip authority / agreement authority /
  backprop authority）は expected head・trustedNow freshness・canonical bytes を fail-close 照合する。
- `validateAgreementBackpropPair` は agreement/backprop の authority pair を completion へ bind する。
- `commitStageClosureAndGate` は固定分母の UI/no-UI disjoint exact set を再導出し、stage closure と
  gate receipt を同一 operation・CAS・exact write-set（append 順
  `stage_completion -> stage_projection -> gate_receipt -> terminal_receipt`）で atomic commit する。
  stale/superseded/swap・二重 gate・順序逆転・CAS/append fault は stage/gate 増分 0。
- harness.db projection / CLI 表面への接続は後続スライス（本PLAN非対象）。

## §3 工程表

### Step 1: L6 §2/§5 突き合わせとred oracle作成 [直列]

根拠: downstream_dependency（store schema と DbC の確定が実装の前提）。

### Step 2: in-memory reference store 実装 → green [直列]

根拠: file_conflict（同一module `src/design/screen-applicability-store.ts` への集中編集）。

### Step 3: review Step（別runtime判定。Codex usage limit中は intra_runtime_subagent = code-reviewer を規定代替とする） [直列]

根拠: downstream_dependency（前段実装の完成に依存するレビュー）。
request changes → 是正 → approve の各ラウンドを review_evidence へ記録する。

### Step 4: confirm → db rebuild → commit → PR → CI → merge → Issue #175 evidence [直列]

根拠: shared_state（outstanding snapshot / harness.db projection の単一owner収束）。

## §3.1 実装計画

情報源: L6設計 §2（`ScreenApplicabilityStoreV1` / `ScreenStageClosureV1` / `ScreenStageClosureCommitV1` /
`ScreenStageReceiptV1` / authority schema 群）、§5（no-UI/UI completion schema）、store DbC prose、
L6テスト設計 U-SAP-011 行、slice1-3 実装。store は `Map` ベースの in-memory 実装とし、
head/revision の CAS・append 順・write-set digest を slice3 と同じ固定キー順 sha256 で決定化する。
trustedNow は文字列注入（slice1 の validateNoUiReceipt と同方式）。gate row への write は
`commitStageClosureAndGate` の成功経路のみが行い、他 API は読み取り専用とする。

## 後続スライス（本PLAN非対象）

- harness.db projection と CLI 表面（store の永続化接続）
- `WALKTHROUGH_ITERATION_LIMIT` の policy 化再検討（slice2 申し送り）
- 短縮 ID の衝突対策（DB unique 化時）
