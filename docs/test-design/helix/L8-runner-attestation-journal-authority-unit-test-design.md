---
title: "Runner attestation journal authority 単体テスト設計"
layer: L8
artifact_type: test_design
status: confirmed
created: 2026-09-02
updated: 2026-09-02
owner: Codex / TL
plan: docs/plans/PLAN-RECOVERY-83-runner-attestation-journal-authority.md
pair_artifact: docs/design/helix/L6-function-design/runner-attestation-journal-authority.md
github_issue_id: 1391
behavior_contract_id: RUNNER-ATTESTATION-JOURNAL-AUTHORITY-001
---

# Runner attestation journal authority 単体テスト設計

- U-CAUTO-019: DB attestationが存在しJSONLが欠落した場合、closureをfail-closeする。
- U-CMAT-011: prepared journal＋DB未commitは独立recoveryでJSONLとfilesをrollbackする。
- U-CMAT-012: committed marker＋manifest未完は独立recoveryでfinish-forwardする。
- U-CMAT-013: production writer以外のrunner attestation exportが残らない。
