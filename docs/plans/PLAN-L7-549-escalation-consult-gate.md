---
plan_id: PLAN-L7-549-escalation-consult-gate
title: "PLAN-L7-549 (impl): PO エスカレーション前 Sol 壁打ち前置強制 Stop hook gate"
kind: impl
layer: L7
drive: agent
status: confirmed
review_evidence:
  - reviewer: codex-tl
    review_kind: cross_agent
    worker_model: claude-fable-5
    reviewer_model: codex-gpt-5
    reviewed_at: "2026-08-12T08:20:00Z"
    tests_green_at: "2026-08-12T08:16:14Z"
    verdict: approve_after_fixes
    scope: "cross-review 4 巡 (reject×3→pass、Codex thread resume)。B-1 receipt の gate 側 role/provider/task_digest 検証、B-2 override の harness.db digest-only audit (guardKind=escalation_consult)、B-3 tri-state (ENOENT のみ missing=fail-close、他 stat/read エラーは fail-open+WARN)、H-2 否定文脈抑制を確認。残 Medium: session/content/model binding 未実装 (PO 認知の既知境界)、block 専用 audit event (M-1 follow-up)。"
    green_commands:
      - { kind: unit_test, command: "npx vitest run tests/escalation-consult-gate.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-12T08:16:14Z", evidence_path: tests/escalation-consult-gate.test.ts, output_digest: "sha256:37e2195af5eba7d5fa27f6e45980d7cd737a6a4e038499ce93fc714c1daa244b" }
      - { kind: typecheck, command: "npx tsc --noEmit", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-12T08:16:14Z", evidence_path: tests/escalation-consult-gate.test.ts, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" }
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-12T08:20:00Z"
  review_binding:
    reviewer: codex-tl
    reviewed_at: "2026-08-12T08:20:00Z"
    evidence_digest: "sha256:87580d19d69221fe71804d96272d7bcf155cfafd6ecbaf4f44922e4d2d4232da"
  entries: []
route_mode: forward
entry_signals:
  - "po_directive:2026-08-12 メモリだけでなく hook で強制。エスカレーションと言い出したら先に Sol 壁打ちしてから進める (Issue #587)"
created: 2026-08-12
updated: 2026-08-12
owner: Claude / TL
github_issue_id: 587
dependencies:
  parent: null
  requires: []
  blocks: []
  references: []
engineering_discipline_required: true
behavior_contract_id: U-ESC-001
responsibility_owner: escalation-consult-gate
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: not_applicable
no_code_decision: add_code
ddd_modeling_decision: domain_service
contract_preconditions: "Stop hook stdin が transcript_path を持ち、最終 assistant text が抽出できる"
contract_postconditions: "escalation 検知時、検証済み fresh receipt か audit 済み one-shot override が無ければ exit 2 で停止をブロックする"
contract_invariants: "escalation 非検知・transcript 欠落・receipt unreadable は既存 Stop 挙動を変えない (fail-open)。override は DB audit なしに消費されない"
contract_failures: "DB open/migrate/commit 失敗は blocked_audit_failure (fail-close)。receipt 記録失敗は委譲を落とさない"
tdd_red_required: false
complexity_effect: justified_positive
complexity_justification: "PO 指示の前置強制 (エスカレーション前 Sol 壁打ち) を prose から機械 gate へ移すための最小 module 追加。検出 SSoT・receipt・override を 1 module に閉じる"
removal_trigger: "escalation intent が DB projection ベースの構造化判定へ移行し文言 gate が冗長になった時点"
parent_design: docs/design/harness/L6-function-design/governance-enforcement.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-ESC-001, test_path: tests/escalation-consult-gate.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-ESC-002, test_path: tests/escalation-consult-gate.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-ESC-003, test_path: tests/escalation-consult-gate.test.ts }
agent_slots:
  - role: se
    slot_label: "SE — escalation-consult-gate module、Stop hook 配線、receipt writer"
  - role: tl
    slot_label: "TL — charter §3 エスカレーション境界と override/audit 設計のレビュー"
generates:
  - { artifact_path: docs/plans/PLAN-L7-549-escalation-consult-gate.md, artifact_type: markdown_doc }
  - { artifact_path: src/runtime/escalation-consult-gate.ts, artifact_type: source_module }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: tests/escalation-consult-gate.test.ts, artifact_type: test_code }
schedule:
  - step: 1
    mode: serial
    description: "gate module (検出 SSoT / receipt / override / 評価) + 単体テスト"
  - step: 2
    mode: serial
    description: "Stop hook (session summary) 配線 + runtimeCommand read-only 委譲成功時の receipt writer"
  - step: 3
    mode: serial
    description: "cross-runtime review → review_evidence 記録 → PR"
---

# PLAN-L7-549: PO エスカレーション前 Sol 壁打ち前置強制 Stop hook gate

## 背景

運用ルール強制ギャップ監査（`docs/governance/rule-enforcement-gap-audit-2026-08-12.md`）と
Sol T0 壁打ち（2026-08-12）で、技術判断まで PO へエスカレーションする過剰傾向が確認された
（ISSUE-03/04 は PO 介入不要と確定）。PO 指示によりメモリ（prose）ではなく hook で機械強制する。

## 要求（Issue #587）

- Claude セッションの最終 assistant 応答がエスカレーション文言を含む場合、Sol 壁打ち receipt が
  無ければ Stop hook（`helix session summary`）が exit 2 で停止をブロックする。
- エスカレーション自体は禁止しない（charter §3 の不可逆操作・L3 承認等は正当）。前置（T0 壁打ち）を
  強制するだけ。receipt があれば通す。
- fail 方針: escalation 検知時のみ fail-close。transcript 欠落・parse 失敗は fail-open
  （session-log と同方針）。
- override は既存 guard と同型の one-shot marker（`.helix/state/escalation-consult-override`、
  non-empty reason 必須、消費される）。

## 設計（cross-review 2 巡反映）

- 検出 SSoT: `src/runtime/escalation-consult-gate.ts` の `ESCALATION_INTENT_PATTERNS` ＋
  否定文脈抑制 `ESCALATION_NEGATION_PATTERNS`（「エスカレーション不要」等は検出しない）。
- receipt 正本 writer: `helix codex --role tl --execute` 成功時のみ（`CONSULT_RECEIPT_ROLES`、
  qa/reviewer 等の一般 read-only role には発行しない）。`.helix/state/sol-consult-receipt` へ
  `{ts, provider, role, session_id, task_digest}` を記録。TTL = 6h（`CONSULT_RECEIPT_TTL_MS`）。
- gate 側 receipt 検証（4 状態）: missing → block 継続 / unreadable（JSON 破損・IO エラー・
  ts 解析不能）→ fail-open + WARN / unauthorized（role ∉ consult roles、provider・task_digest 欠落
  = 偽造/旧形式）→ block / ok + fresh → pass。
- override: one-shot marker を `commitOverrideUse` 経由で harness.db `guard_override_transactions`
  （guardKind=escalation_consult）へ digest-only audit してから消費。生 reason は表示せず
  reason_digest のみ surface。DB open/migrate 失敗は blocked_audit_failure へ正規化（fail-close）。
- Stop hook 配線: `session summary` action が stdin の `transcript_path` から最終 assistant text を
  抽出し、block=true で exit 2（dispatch はスキップ = block した Stop を session_end として閉じない）。

## AC

- AC-1: escalation 文言 + receipt 無し/unauthorized → block（テスト green で裏付け:
  `npx vitest run tests/escalation-consult-gate.test.ts`、24 pass、2026-08-12）。
- AC-2: fresh な検証済み receipt / audit 済み one-shot override → pass。stale・未来時刻 receipt /
  empty marker / transaction 拒否（nonce 再利用等）→ block。
- AC-3: escalation 非検知・transcript 欠落・receipt unreadable → fail-open
  （既存 Stop hook 挙動を変えない）。

## 既知の境界（PO 認知事項）

- 検出は文言パターンベースであり、言い換えによるすり抜けは検知しない（judgment-core prose と併用）。
- receipt の session/内容 binding は記録のみ（writer は別プロセス session のため gate 照合しない）。
  同一 repo 内の直近 6h の tl 壁打ちを有効とみなす。model（gpt-5.6-sol）の実体検証も未実装。
  厳密な per-escalation binding は follow-up。
- block 専用の構造化 audit event は未実装（follow-up、M-1）。override のみ DB audit あり。
- ローカル marker/receipt ファイルの偽造は既存 guard 群（work-guard 等）と同水準の残余リスク。
- Codex 側 Stop hook surface への同等配線は Issue #580（delegation contract surface parity）の
  スコープで扱う。
