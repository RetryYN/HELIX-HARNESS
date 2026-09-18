---
status: scaffold
authority_effect: none
generated_by: scaffold/governance/tools/gen_rulebook.py
source_candidate: docs/governance/candidates/legacy-rule-derived-requirements.md
source_candidate_sha256: 1c9891cbf76d7a28a6cf64b75e907e6ddad41c0aac5c9fa0a9196421211407a5
source_inventory: docs/governance/legacy-rule-atom-inventory.jsonl
source_inventory_sha256: e265b57e50d4c0f2f161c89a7dadbde12738bd84eab21de3fb5745d7741ef125
rule_id: RUL-COR-08
group: コア
product: HARNESS／OS
atoms_primary: 40
atoms_secondary: 8
issue_projection: none
---

# RUL-COR-08（コア／HARNESS／OS）

仮のルール。正本は[要求候補](../../../docs/governance/candidates/legacy-rule-derived-requirements.md)であり、本fileはその機械的な写しである。採否・承認・完了を生成しない。

## 要求

要約・表示・引き継ぎ・提示するcommandは、元の意味を落とさない。要約は工程、現在位置、適用中のskillや判断の根拠を保持し、提示するcommandや値は正規の導出結果と一致する。正規の検証経路を、別の手軽な手段で代替しない。

## 主として対応づいた規則（40件）

| atom | 規則 | 種類 | 強制 | 出どころ |
|---|---|---|---|---|
| `RA-065` | エージェントは未実装のtask estimateを正規コマンドとして扱わない。 | tooling_runtime | prose | AGENTS.md:185-185 |
| `RA-361` | test実行者はnpm test経由のVitestを使い、同期timeoutが不安定な直接vitest runを使わない。 | behavior_discipline | prose | .claude/commands/test.md:22-23 |
| `RB08-091` | 検証担当者はnpm run testとBiome checkを使い、native runner直実行やbiome lint単体で正規検証を代替しない。 | tooling_runtime | prose | docs/skills/gate-planning.md:83-85 |
| `RD03-095` | summary surface監査は、current-locationにcurrent_location_frontier.commands.workflow_routeが存在しない場合、semantic driftと判定する。 | memory_context | gate | src/runtime/summary-surface-audit.ts:76-81; src/runtime/summary-surface-audit.ts:618-638 |
| `RD03-096` | summary surface監査は、current-locationにoperation_scope.itemsが存在しない場合、semantic driftと判定する。 | memory_context | gate | src/runtime/summary-surface-audit.ts:82-86; src/runtime/summary-surface-audit.ts:618-638 |
| `RD03-097` | summary surface監査は、current-locationにskill_binding.top_itemsが存在しない場合、semantic driftと判定する。 | memory_context | gate | src/runtime/summary-surface-audit.ts:87-91; src/runtime/summary-surface-audit.ts:618-638 |
| `RD03-098` | summary surface監査は、drive-modelにcandidate_countが存在しない場合、semantic driftと判定する。 | tooling_runtime | gate | src/runtime/summary-surface-audit.ts:92-96; src/runtime/summary-surface-audit.ts:618-638 |
| `RD03-099` | summary surface監査は、drive-modelにforward_spine_modelが存在しない場合、semantic driftと判定する。 | process_gate | gate | src/runtime/summary-surface-audit.ts:97-101; src/runtime/summary-surface-audit.ts:618-638 |
| `RD03-100` | summary surface監査は、skill-bindingにfull_inject_commandが存在しない場合、semantic driftと判定する。 | tooling_runtime | gate | src/runtime/summary-surface-audit.ts:102-106; src/runtime/summary-surface-audit.ts:618-638 |
| `RD03-101` | summary surface監査は、skill-bindingにtop_itemsが存在しない場合、semantic driftと判定する。 | tooling_runtime | gate | src/runtime/summary-surface-audit.ts:107-111; src/runtime/summary-surface-audit.ts:618-638 |
| `RD03-102` | summary surface監査は、roadmap-currentにroadmap_position.frontierが存在しない場合、semantic driftと判定する。 | memory_context | gate | src/runtime/summary-surface-audit.ts:112-116; src/runtime/summary-surface-audit.ts:618-638 |
| `RD03-103` | summary surface監査は、roadmap-currentにsample_actionsが存在しない場合、semantic driftと判定する。 | memory_context | gate | src/runtime/summary-surface-audit.ts:117-121; src/runtime/summary-surface-audit.ts:618-638 |
| `RD03-104` | summary surface監査は、vmodel-fitにregression_guards.attention_boundaryが存在しない場合、semantic driftと判定する。 | escalation_authority | gate | src/runtime/summary-surface-audit.ts:122-126; src/runtime/summary-surface-audit.ts:618-638 |
| `RD03-105` | summary surface監査は、vmodel-fitにblockers.0.boundaryが存在しない場合、semantic driftと判定する。 | process_gate | gate | src/runtime/summary-surface-audit.ts:127-131; src/runtime/summary-surface-audit.ts:561-573; src/runtime/summary-surface-audit.ts:618-638 |
| `RD03-106` | summary surface監査は、vmodel-fitにsample_next_actionsが存在しない場合、semantic driftと判定する。 | memory_context | gate | src/runtime/summary-surface-audit.ts:132-136; src/runtime/summary-surface-audit.ts:618-638 |
| `RD03-107` | summary surface監査は、project-frontierにworkflow_identity.target_axisが存在しない場合、semantic driftと判定する。 | process_gate | gate | src/runtime/summary-surface-audit.ts:137-141; src/runtime/summary-surface-audit.ts:618-638 |
| `RD03-108` | summary surface監査は、project-frontierにworkflow_route.source_commandが存在しない場合、semantic driftと判定する。 | tooling_runtime | gate | src/runtime/summary-surface-audit.ts:142-146; src/runtime/summary-surface-audit.ts:618-638 |
| `RD03-109` | summary surface監査は、project-frontierにvmodel_fit.regression_guards.attention_boundaryが存在しない場合、semantic driftと判定する。 | escalation_authority | gate | src/runtime/summary-surface-audit.ts:147-151; src/runtime/summary-surface-audit.ts:618-638 |
| `RD03-110` | summary surface監査は、project-frontierにskill_binding.top_itemsが存在しない場合、semantic driftと判定する。 | memory_context | gate | src/runtime/summary-surface-audit.ts:152-157; src/runtime/summary-surface-audit.ts:618-638 |
| `RD05-071` | completion-decision-packetは、decisionの主packetコマンドがblockerReasonに対応する所定コマンドと一致しない場合、失敗させる。 | tooling_runtime | lint | src/lint/completion-decision-packet.ts:571-577; src/lint/completion-decision-packet.ts:1211-1223 |
| `RD05-072` | completion-decision-packetは、decisionのrunnable主コマンドが正規主コマンドをrunnablePacketCommandで変換した結果に一致しない場合、失敗させる。 | tooling_runtime | lint | src/lint/completion-decision-packet.ts:578-584 |
| `RD05-080` | completion-decision-packetは、runnablePacketCommandsが必要コマンド集合のrunnable変換結果に一致しない場合、失敗させる。 | tooling_runtime | lint | src/lint/completion-decision-packet.ts:645-652 |
| `RD05-082` | completion-decision-packetは、runnableScopedDecisionPacketCommandが正規scoped主コマンドのrunnable変換結果と一致しない場合、失敗させる。 | tooling_runtime | lint | src/lint/completion-decision-packet.ts:663-673 |
| `RD05-084` | completion-decision-packetは、runnableScopedPacketCommandsが必要scopedコマンド集合のrunnable変換結果に一致しない場合、失敗させる。 | tooling_runtime | lint | src/lint/completion-decision-packet.ts:684-698 |
| `RD05-087` | completion-decision-packetは、補助summaryのrunnableCommandが当該コマンドのrunnable変換結果に一致しない場合、失敗させる。 | tooling_runtime | lint | src/lint/completion-decision-packet.ts:730-736 |
| `RD05-089` | completion-decision-packetは、補助summaryのrunnableScopedCommandが正規scopedコマンドのrunnable変換結果に一致しない場合、失敗させる。 | tooling_runtime | lint | src/lint/completion-decision-packet.ts:747-755 |
| `RD05-132` | completion-review-bundleは、runnableSourceCommandが専用review-bundleコマンドのrunnable変換結果に一致しない場合、失敗させる。 | tooling_runtime | lint | src/lint/completion-decision-packet.ts:1910-1917 |
| `RD05-141` | completion-review-bundleは、completionDecisionPacketCommandが所定のdecision-packet JSONコマンドでない場合、失敗させる。 | tooling_runtime | lint | src/lint/completion-decision-packet.ts:2027-2032 |
| `RD05-142` | completion-review-bundleは、runnableCompletionDecisionPacketCommandが所定コマンドのrunnable変換結果に一致しない場合、失敗させる。 | tooling_runtime | lint | src/lint/completion-decision-packet.ts:2033-2041 |
| `RD06-087` | doc-consistency lintは、L6セットアップ設計で「期待 task 9 本」以降にcompletion review-bundleの記載がない場合、不足として返す。 | process_gate | lint | src/lint/doc-consistency.ts:178-182; src/lint/doc-consistency.ts:202-204 |
| `RD06-090` | doc-consistency lintは、L6セットアップ設計にdecision-packetとversion-up、またはpacket preflightとversion-upを直接並べる所定の旧記述が残る場合、review-bundle欠落の旧記述として返す。 | process_gate | lint | src/lint/doc-consistency.ts:195-204 |
| `RD06-096` | doc-consistency lintは、setup templateに所定のv0.1.0からv0.1.4へのversion-up dry-runコマンドがない場合、不足として返す。 | tooling_runtime | lint | src/lint/doc-consistency.ts:24-26; src/lint/doc-consistency.ts:242-246 |
| `RD06-097` | doc-consistency lintは、doctor実装に所定のv0.1.0からv0.1.4へのversion-up dry-runコマンドがない場合、不足として返す。 | tooling_runtime | lint | src/lint/doc-consistency.ts:24-26; src/lint/doc-consistency.ts:247-251 |
| `RD06-098` | doc-consistency lintは、対象6文書・実装内の所定version-up dry-run記述でtargetがv0.1.4以外の場合、古いtargetとして返す。 | tooling_runtime | lint | src/lint/doc-consistency.ts:27-28; src/lint/doc-consistency.ts:207-214; src/lint/doc-consistency.ts:253-259 |
| `RD10-157` | frontier整合lintはL3／L12文書にbare helix、package script限定、bareCommandResolved=false、fix_consumer_readiness等のsetup境界markerが欠ける場合に失敗させる。 | tooling_runtime | lint | src/lint/semantic-frontier-consistency.ts:105-111; src/lint/semantic-frontier-consistency.ts:432-440 |
| `RE01-102` | export実装者は追加依存のない組込みCSV出力と参照元リンク付きMarkdownを提供し、時刻などの例外を除いて決定的に生成する。 | tooling_runtime | prose | docs/governance/helix-harness-requirements_v1.2.md:1419-1419; docs/governance/helix-harness-requirements_v1.2.md:1438-1442 |
| `RE01-144` | CLI利用者は機械用JSONと表示用文字列を区別し、表示用command文字列を実行してはならない。 | safety_security | prose | docs/governance/helix-harness-requirements_v1.2.md:2035-2054 |
| `RG08-003` | consoleは、次の行動を表示するときにnext authorityを明示する。 | escalation_authority | config | config/ui-domain/harness-console-bundle.json:79-80 |
| `RG12-003` | ZIP snapshotの正規再生成commandは、path本文を表示せず、countとdigestだけを返す。 | tooling_runtime | prose | docs/governance/infinity-loop-source-snapshot-manifest.md:82-84 |
| `RG16-019` | CI担当者は、harness-checkのVitest実行をNode組込みtest runnerで代替しない。 | tooling_runtime | prose | docs/skills/ci-gate-design.md:33-39 |

## 副として対応づいた規則（8件）

`RE01-068`、`RE01-083`、`RE01-101`、`RE01-103`、`RE01-145`、`RF01-002`、`RG03-011`、`RG17-005`
