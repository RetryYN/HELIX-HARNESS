---
title: "hosted preflight override監査単体テスト設計"
layer: L8
artifact_type: test_design
sub_doc: unit-test-design
status: confirmed
created: 2026-09-02
updated: 2026-09-02
owner: Codex / QA
plan: docs/plans/PLAN-RECOVERY-82-hosted-preflight-override-audit.md
parent_design: docs/design/helix/L6-function-design/hosted-preflight-override-audit.md
pair_artifact: docs/design/helix/L6-function-design/hosted-preflight-override-audit.md
behavior_contract_id: HOSTED-PREFLIGHT-OVERRIDE-AUDIT-001
responsibility_owner: hosted-preflight
---

# hosted preflight override監査単体テスト設計

## Oracle

- reasonなしoverrideをexit 2で拒否する。
- hook非強制ackなしのpreflightを拒否する。
- 理由付きoverrideをDBへ一度だけ記録する。
- 同一session／reason／targetのnonce再利用を拒否する。
- 通常preflightはgit status digestをaudit evidenceとして出力する。
