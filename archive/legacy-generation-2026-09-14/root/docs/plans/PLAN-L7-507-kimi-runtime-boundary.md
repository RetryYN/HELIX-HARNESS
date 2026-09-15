---
plan_id: PLAN-L7-507-kimi-runtime-boundary
title: "PLAN-L7-507 (impl): 非Codexエージェント向けAGENTS.mdランタイム境界とdigest同期フェンス"
kind: impl
layer: L7
drive: agent
status: confirmed
route_mode: forward
entry_signals:
  - "po_directive:2026-08-06 Kimi Code拡張導入に伴いAGENTS.mdのCodex専用規定を他エージェントが継承しない境界を明文化する"
created: 2026-08-06
updated: 2026-08-06
owner: Claude / TL
engineering_discipline_required: true
behavior_contract_id: KIMI-RUNTIME-BOUNDARY-001
responsibility_owner: kimi-extension-security-boundary
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: policy
contract_preconditions: "AGENTS.mdがreviewed-safe digest登録済みであり、Kimi CodeがAGENTS.md規格準拠で本ファイルを読み込むことがバイナリ解析で確認されている"
contract_postconditions: "AGENTS.mdに非Codexエージェント向け境界節が存在し、reviewed-safe registryのAGENTS.md digestが実ファイルと一致し、boundary文書とguard実体ソースが監査記録付録に掲載される"
contract_invariants: "Adapter Rule Markers節・既存のCodex専用規定・L1-L12 authority・他のreviewed-safe登録を変更しない"
contract_failures: "AGENTS.md編集時にregistry digest未更新ならU-KIMIB-001がredになり、境界節削除はKimi向け権限継承遮断の喪失としてreviewでfail-closeする"
tdd_red_required: true
red_at: "2026-08-05T17:52:13Z"
green_at: "2026-08-05T18:03:36Z"
mutation_oracle_evidence: "tests/kimi-runtime-boundary.test.ts の U-KIMIB-001 で検証。registry digestを全zero値へ差し替えるseeded mutationを注入し vitest 実行で exit 1 の red になること (killed) をworktreeで実測 (2026-08-05T18:05Z、復元済み)。加えて CI run 31031918548 でAGENTS.md編集+registry未更新のdrift gate redを実観測"
complexity_effect: net_neutral
complexity_justification: "既存のreviewed-safe registryと既存test fileへ同期オラクル1本を追加し、新detector/job/dependency/runtime stateを増やさない"
removal_trigger: "AGENTS.mdのランタイム別セクション分離（エージェント別指示ファイル規格の確立）が完了した時点でdigest同期オラクルを機構側へ統合する"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-05T18:03:36Z"
  review_binding:
    reviewer: claude-intra-runtime
    reviewed_at: "2026-08-05T18:03:36Z"
    evidence_digest: "sha256:11530a20d471b596d2473122ac595a8b32bbf6ce4bafbd1674dd270941e4fbcb"
  entries: []
parent_design: docs/design/helix/L6-function-design/kimi-runtime-boundary.md
pair_artifact: docs/test-design/helix/L8-kimi-runtime-boundary-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/kimi-runtime-boundary.md, oracle_id: U-KIMIB-001, test_path: tests/kimi-runtime-boundary.test.ts }
agent_slots:
  - role: tl
    slot_label: "TL — 非Codexエージェント境界の契約review"
  - role: qa
    slot_label: "QA — digest同期オラクルとdrift gate回帰"
generates:
  - { artifact_path: docs/plans/PLAN-L7-507-kimi-runtime-boundary.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/kimi-code-extension-security-audit-2026-08-06.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/kimi-runtime-boundary.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-kimi-runtime-boundary-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: AGENTS.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l12-hybrid-reviewed-safe-v2.ts, artifact_type: source_module }
  - { artifact_path: tests/kimi-runtime-boundary.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L7-466-pr-scope-contract.md
  requires:
    - docs/governance/kimi-code-extension-security-audit-2026-08-06.md
  references:
    - docs/governance/l12-canonical-vmodel-direction-directive_v0.1.md
  blocks: []
review_evidence:
  - reviewer: claude-intra-runtime
    review_kind: intra_runtime_subagent
    worker_model: claude-fable-5
    reviewer_model: claude-fable-5
    tests_green_at: "2026-08-05T18:03:36Z"
    reviewed_at: "2026-08-05T18:03:36Z"
    verdict: approve_after_fixes
    scope: "単一runtime運用時の代替証跡。code-reviewer subagentがworktree read-onlyでdigest一致・U-KIMIB-001 mutation kill・PLAN虚偽claim有無を検証。Critical(digest placeholder)とImportant(AGENTS.md enforcement過大主張)を修正済み。receipt=https://github.com/RetryYN/HELIX-HARNESS/pull/417#issuecomment-5195531032"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --project fast tests/kimi-runtime-boundary.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-05T18:03:36Z", evidence_path: tests/kimi-runtime-boundary.test.ts, output_digest: "sha256:647ebbd922693604bb264d506aa3cd25233c3cfc24ffe4bfb62fce3fc529711f" }
---

# PLAN-L7-507: 非Codexエージェント向けAGENTS.mdランタイム境界とdigest同期フェンス

## 目的

Kimi Code（AGENTS.md オープン規格準拠）が本リポジトリの `AGENTS.md`（Codex CLI 専用 project rules）を
project 指示として読み込むことを確認したため、Codex 専用の role・権限規定（technical lead 役割、
`helix codex` 委譲レーン、push / merge 権限）を非 Codex エージェントが継承しない境界を AGENTS.md 本体に
明文化する。context compact で会話中ルールは失われるため、境界は会話・メモリではなくファイルに置く。

あわせて、AGENTS.md が reviewed-safe digest 登録（`src/lint/l12-hybrid-reviewed-safe-v2.ts`）から
編集時に静かに外れて drift gate が後段で崩れる事故（CI run 31031918548 で実観測）の再発フェンスとして、
registry digest と実ファイル sha256 の同期を直接検証するオラクル U-KIMIB-001 を追加する。

## 非対象

- AGENTS.md の Codex 専用規定・Adapter Rule Markers の変更。
- Kimi 側 hooks / ACP 配線の repo 機構化（user ローカル配備は governance 文書に記録のみ）。
- 他 reviewed-safe 登録エントリの digest 変更。

## 完了条件

- AGENTS.md に非 Codex エージェント向けランタイム境界節が存在する。
- `REVIEWED_SAFE_DISPOSITIONS` の AGENTS.md digest が実ファイルと一致し、U-KIMIB-001 が green。
- AGENTS.md 編集＋registry 未更新の mutation で U-KIMIB-001 が red になる。
- Kimi Code 拡張監査記録と guard 実体ソースが監査記録（付録）に掲載される。
- targeted test・typecheck・harness-check が green。
