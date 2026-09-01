---
title: "Claude Fable 5.1プロバイダーdrift復旧設計"
layer: L6
artifact_type: design
status: confirmed
created: 2026-09-02
updated: 2026-09-02
owner: Codex / TL
plan: docs/plans/PLAN-RECOVERY-80-claude-fable-5-1-provider-drift.md
pair_artifact: docs/test-design/helix/L8-claude-fable-5-1-provider-drift-unit-test-design.md
github_issue_id: 1386
behavior_contract_id: CLAUDE-FABLE51-PROVIDER-DRIFT-001
responsibility_owner: provider-configuration-attestation
---

# Claude Fable 5.1プロバイダーdrift復旧設計

## 境界

current model identityは`MODEL_IDS.claude.fable`を唯一のTypeScript正本とし、Claude agent frontmatterは`agent-model-ssot`で同期する。過去PLAN／review receiptの`claude-fable-5`は当時の実測identityなので変更しない。pricing lookupだけはhistorical usage再生のため旧IDを保持する。

HELIXはClaude Codeのnative CLI／subscription経路を維持し、API clientを追加しない。公式migration差分のforced tool choice、thinking履歴、refusal、retentionはProvider Configuration AttestationとHELIX-Benchの再検証対象へ送る。

## 不変条件

- current selectorとadvisor frontmatterは`claude-fable-5-1`。
- `claude-fable-5`をcurrent selectorへfallbackしない。
- Fable advisorはadvisory-only、read-onlyを維持する。
- provider/model/version更新後の旧qualificationを自動継承しない。
