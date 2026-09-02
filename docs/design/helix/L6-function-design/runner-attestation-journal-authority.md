---
title: "Runner attestation journal authority 詳細設計"
layer: L6
artifact_type: design
status: confirmed
created: 2026-09-02
updated: 2026-09-02
owner: Codex / TL
plan: docs/plans/PLAN-RECOVERY-83-runner-attestation-journal-authority.md
pair_artifact: docs/test-design/helix/L8-runner-attestation-journal-authority-unit-test-design.md
github_issue_id: 1391
behavior_contract_id: RUNNER-ATTESTATION-JOURNAL-AUTHORITY-001
responsibility_owner: closure-evidence-materialization
---

# Runner attestation journal authority 詳細設計

## 責務

`closure-evidence-materialization`をrunner attestationの唯一のproduction writerとし、prepared journal、
JSONL開始byte、DB committed marker、before imageからrollbackまたはfinish-forwardを決定する。

## 不変条件

- DB rowが存在するのにJSONLが無い場合は`runner attestation JSONL欠落`でfail-closeする。
- 未commit journalはJSONLを開始byteへ戻し、published fileをbefore imageへ復元する。
- committed markerがあるjournalはmanifestとfileをfinish-forwardしてcompleteへ封緘する。
- test-onlyの旧`appendRunnerAttestation`をproduction exportとして残さない。
- SQLite SAVEPOINTだけでfilesystemとのcrash atomicityを主張しない。
