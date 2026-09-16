# CLI typed workflow identity終端fullback証拠

## 対象

- Issue: `#1125`
- Forward PLAN: `PLAN-L7-698-cli-workflow-identity-projection`
- Reverse PLAN: `PLAN-REVERSE-698-cli-workflow-identity-terminal-fullback`
- 実装merge commit: `9c6bf0ae5bf01711aad4548576900c7555025e7c`
- 終端候補PR: `#1227`

## R4再接着

CLIのcurrent workflow identityは、requirements-owned registryの`registry_version`、
`registry_source_digest`、`target_axis`、`target_id`をprimary tupleとする。旧`selected_model`、
`default_model`、`available_models`、`drive_model`はcurrent outputへ再出力しない。

実装PR #1159と終端前PR #1224では、U-CLIWI-001〜005、typecheck、DB rebuild、doctor、required CI、
Claude Code独立reviewが同一候補へ接続済みである。PR #1227はForward／Reverse PLANのterminal stateを
同一transactionで確定し、canonical merge後のmain read-afterとIssue #1125 closeを残す。

本書はR4 fullbackが生成するgovernance evidenceであり、merge後read-afterの代替ではない。PR #1227の
current HEADに対するfresh required CIと独立reviewが不成立なら、終端claimを拒否する。
