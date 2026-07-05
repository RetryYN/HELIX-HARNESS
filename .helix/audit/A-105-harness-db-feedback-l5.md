# A-105: G5 add-design 再承認 - harness.db reference-feedback と automation foundation

- Date: 2026-06-08
- Scope: PLAN-L5-08-harness-db-feedback
- Gate: G5 add-design 再承認
- Verdict: PASS

## 要約

ユーザーは `.helix/harness.db` が V-model state cache だけでなく feedback mechanism として機能する必要があると明確化した。追加 audit では、workflow automation、guardrail safety、skill/roster/command documentation assets が既に要求されていたが、1 つの automation foundation として認識されていなかったかも確認した。この add-design は要求を既存 FR-L1-05/06/07/09/12/13/17/18/19/20/33/37/39/40/41/45/46/47/48/49 に結びつけ、不足していた L5 detail を特定し、以下へ下降させる:

- L1 functional requirement bundle
- governance requirements の acceptance bundle
- L5 physical-data の projection schema、workflow readiness、guardrail decisions、asset catalog、indexes
- L5 module-decomposition の DB/search/feedback/automation/guardrail/asset module boundaries
- L5 internal-processing の D-API と DbC
- L5 if-detail の CLI/search/automation/guardrail/asset contracts
- L8 IT-DB / IT-SEARCH / IT-FEEDBACK / IT-AUTOMATION / IT-GUARDRAIL / IT-ASSET-DB の pair rows

## 使用した外部参照

- SQLite FTS5: rebuildable external/contentless full-text index pattern を参照
- OpenTelemetry semantic conventions: common trace/log/metric/event naming を参照
- W3C PROV: entity/activity/agent provenance framing を参照

## チェック

- PLAN-L5-08 `§工程表`: pass (`bun run src/cli.ts plan lint docs/plans/PLAN-L5-08-harness-db-feedback.md`)
- Review evidence: intra-runtime TL self-review を PLAN frontmatter に記録済み
- Safety: raw provider transcript、secrets、credentials、PII は DB persistence の scope 外として明示済み
- Automation foundation: workflow readiness は evidence なしに ready を報告できない。guardrail human-required decisions は projection によって downgrade できない。skill/roster/command prompt body は markdown source のままで、metadata のみ catalog 化する。

## Carry

- L6: function signatures、migration details、schema details を詰める
- L7: `bun:sqlite` implementation、fallback adapter、projection writer、search、feedback metrics、automation readiness、guardrail ledger、asset catalog、vitest を実装する
