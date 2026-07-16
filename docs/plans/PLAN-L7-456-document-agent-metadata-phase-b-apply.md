---
plan_id: PLAN-L7-456-document-agent-metadata-phase-b-apply
title: "PLAN-L7-456 (impl): document agent metadata Phase B apply transaction"
kind: impl
layer: L7
drive: agent
status: confirmed
route_mode: forward
entry_signals: ["po_directive:2026-07-14 /goal『設計とテスト設計/検証設計でVペアを作る』に基づくhybrid-docgen GAP-01 apply parity"]
created: 2026-07-14
updated: 2026-07-14
owner: Codex
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-07-16T17:38:00Z"
  review_binding:
    reviewer: universal_atomization
    reviewed_at: "2026-07-16T17:38:00Z"
    evidence_digest: "sha256:03440589def7b0c344c19483a17233aee268473a2d25e231caea7787a846bd15"
  entries: []
review_evidence:
  - reviewer: universal_atomization
    review_kind: intra_runtime_subagent
    worker_model: codex
    reviewer_model: gpt-5
    reviewed_at: "2026-07-16T17:38:00Z"
    tests_green_at: "2026-07-16T17:37:28Z"
    verdict: pass
    scope: "batch preflight、publish後throw、逆順rollback、real-port restore fault、ancestor symlink、partial/ambiguous receiptを独立監査。指摘反例追加後Blocker/High 0。"
    green_commands:
      - { kind: integration_test, command: "bunx vitest run document-engine targeted set --reporter=dot", runner: bun, scope: targeted, exit_code: 0, evidence_path: docs/evidence/requirements-reseal-document-engine-green.md, output_digest: "sha256:68e2e3e9b9a9c353864c46a23c5a9c2990c2feba14a824bab106f2f0062dc5e8" }
agent_slots:
  - { role: se, slot_label: "SE — apply plan / source transaction" }
  - { role: qa, slot_label: "QA — digest / rollback mutation oracle" }
backprop_decision: not_required
backprop_decision_reason: "既存L3-L6のPhase B境界を具体的な安全トランザクションへ降下する。"
parent_design: docs/design/helix/L6-function-design/document-agent-metadata-contract.md
pair_artifact: docs/test-design/helix/L8-document-agent-metadata-contracts.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/document-agent-metadata-contract.md, oracle_id: U-AGMETA-008, test_path: tests/document-agent-metadata-apply.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/document-agent-metadata-contract.md, oracle_id: U-AGMETA-009, test_path: tests/document-agent-metadata-apply.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/document-agent-metadata-contract.md, oracle_id: U-AGMETA-010, test_path: tests/document-agent-metadata-apply.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/document-agent-metadata-contract.md, oracle_id: U-AGMETA-011, test_path: tests/document-agent-metadata-apply.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/document-agent-metadata-contract.md, oracle_id: U-AGMETA-012, test_path: tests/document-agent-metadata-apply.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/document-agent-metadata-contract.md, oracle_id: IT-AGMETA-004, test_path: tests/document-agent-metadata-integration.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/document-agent-metadata-contract.md, oracle_id: IT-AGMETA-005, test_path: tests/document-agent-metadata-integration.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-456-document-agent-metadata-phase-b-apply.md, artifact_type: markdown_doc }
  - { artifact_path: src/adapters/document-agent-metadata-fs.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/document-agent-metadata-apply.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/document-agent-metadata-write-port.ts, artifact_type: source_module }
  - { artifact_path: tests/document-agent-metadata-apply.test.ts, artifact_type: test_code }
  - { artifact_path: tests/document-agent-metadata-integration.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L3-13-vmodel-docgen-fit.md
  requires: []
  references:
    - docs/design/helix/L3-requirements/document-agent-metadata.md
    - docs/design/helix/L5-detail/document-agent-metadata-contract.md
    - src/lint/document-agent-metadata.ts
    - src/schema/document-agent-metadata.ts
---

# PLAN-L7-456: 文書 agent metadata の明示 apply

## 実装境界

既存source/testは本PLANが生成済みとclaimせず、publish後例外rollback、ancestor symlink、IT-AGMETA-005を
是正して独立reviewが閉じるまで検証対象として扱う。

ZIP正本の `agent_meta.py apply` 相当をTS/Nodeへ再実装する。選択したmanifest内文書だけを対象に、typed declarationから
導出済みmetadataをfrontmatterへ反映する。source writeは専用write portを通し、digest drift・path escape・symlinkを
fail-closeする。複数更新はreceiptを持つrollback transactionとし、DB、release、runtime state、role prompt、subprocessを
変更しない。

## 完了条件

U-AGMETA-008..012およびIT-AGMETA-004..005がgreenであること。apply成功後のcheckがgreen、失敗時のsource/DB/spawn
副作用が契約どおりであること。templates展開は本PLANに含めず、template catalogを正本とする後続L6/L7で扱う。
