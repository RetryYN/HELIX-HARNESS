---
status: scaffold
authority_effect: none
generated_by: scaffold/governance/tools/gen_rulebook.py
source_candidate: docs/governance/candidates/legacy-rule-derived-requirements.md
source_candidate_sha256: 1c9891cbf76d7a28a6cf64b75e907e6ddad41c0aac5c9fa0a9196421211407a5
source_inventory: docs/governance/legacy-rule-atom-inventory.jsonl
source_inventory_sha256: e265b57e50d4c0f2f161c89a7dadbde12738bd84eab21de3fb5745d7741ef125
rule_id: RUL-OSP-04
group: OS推進
product: OS
atoms_primary: 22
atoms_secondary: 19
issue_projection: #1859
---

# RUL-OSP-04（OS推進／OS）

仮のルール。正本は[要求候補](../../../docs/governance/candidates/legacy-rule-derived-requirements.md)であり、本fileはその機械的な写しである。採否・承認・完了を生成しない。

## 要求

AIは、RUL-OSM-01が定める人間の介入点に当たらない作業を自走する。人間へ質問する前に、AI側で解決できる情報が残っていないかを確かめ、質問するときは判断に必要な材料を揃える。介入点の定義そのものは持たず、RUL-OSM-01を参照する。

## 主として対応づいた規則（22件）

| atom | 規則 | 種類 | 強制 | 出どころ |
|---|---|---|---|---|
| `RA-154` | 通常GitHub laneはpush・Draft PR・CI監視・self-heal・AI-B最終review・明示mergeまで継続する。 | review_merge | prose | CLAUDE.md:193-193 |
| `RA-164` | 作成側は自分のpush・PRでharness-checkが失敗したらlog取得・修正・再pushまで自分で行う。 | review_merge | prose | AGENTS.md:333-334; CLAUDE.md:211-213 |
| `RA-284` | エージェントは不明点に妥当な仮定を明示して進み、本当に詰まった場合だけ確認する。 | behavior_discipline | prose | AGENTS.md:223-224 |
| `RB0-132` | agentはPO判断と自力で解決可能な判断を区別し、後者では妥当な仮定を明示して決定・記録・継続する。 | behavior_discipline | prose | docs/skills/judgment-core.md:60-63 |
| `RB04-171` | 質問者は事前にAGENTS.md/RUNBOOK.mdを確認し、実施内容・期待・結果・試行を記し、errorはテキスト、コードはcode blockで示す。 | behavior_discipline | prose | docs/governance/ai-dev-team-operations_v1.1.md:153-161 |
| `RB05-246` | L3承認済みIssueの実行・監査loopは不可逆境界以外を無人でForwardへ収束させ、自己監査にしない。 | lane_delegation | prose | docs/governance/infinity-loop-system-assertion-cases.md:335-335 |
| `RB06-026` | AIは修正可能なschema不整合を修復して再検査し、trace欠落時はcandidateを生成して再検査し、pair欠落時は作成taskを起票する。 | process_gate | prose | docs/governance/autonomous-authoring-admission-transaction-directive_v0.1.md:241-245 |
| `RB06-050` | NFR是正担当AIはregistry契約実装と一致oracleを自走で進め、dual-green期間は既存projectionを互換trace入力として扱う。 | process_gate | prose | docs/governance/rule-enforcement-gap-audit-2026-08-12.md:41-46 |
| `RB06-054` | 監査対象の是正担当AIは明示されたPO介入点以外を、実装PLAN起票から通常PR・CI・review経路で自走する。 | escalation_authority | prose | docs/governance/rule-enforcement-gap-audit-2026-08-12.md:205-206 |
| `RB06-094` | Infinity LoopはL3承認済みIssueとcurrent設計に対し、不可逆境界以外を無人でForwardへ収束させ、自己監査を行わない。 | lane_delegation | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:31-31 |
| `RB06-203` | AIはroute全体を承認待ちにせず、Recovery診断、Incident証拠収集、Retrofit inventory・impact・dry-runを自律継続し、production actionの承認を別管理する。 | escalation_authority | prose | docs/governance/workflow-and-specialist-harness-audit-2026-07-28.md:106-115 |
| `RB08-056` | 調査担当者はPOへ確認する前にweb researchとsubagent self-reviewを行う。 | behavior_discipline | prose | docs/skills/research.md:26-29 |
| `RC00-199` | 相談Stop gateは、escalationを検出しreceiptが存在せず、有効なone-shot overrideもなければ停止をblockする。 | escalation_authority | hook／gate | src/runtime/escalation-consult-gate.ts:167-184; src/runtime/escalation-consult-gate.ts:324-355 |
| `RC00-200` | 相談Stop gateは、receiptがtl・codex・有効task digestの条件を満たさず、有効なoverrideもなければ停止をblockする。 | escalation_authority | hook／gate | src/runtime/escalation-consult-gate.ts:195-205; src/runtime/escalation-consult-gate.ts:319-355 |
| `RC00-201` | 相談Stop gateは、receipt時刻が未来または6時間超過で、有効なoverrideもなければ停止をblockする。 | escalation_authority | hook／gate | src/runtime/escalation-consult-gate.ts:77-78; src/runtime/escalation-consult-gate.ts:208-212; src/runtime/escalation-consult-gate.ts:311-355 |
| `RD02-133` | 質問gateは、technical質問にTL advisor証拠がない場合に質問を拒否する。 | escalation_authority | gate | src/runtime/legacy-adoption.ts:271-283 |
| `RD02-134` | 質問gateは、preference質問にbypass理由がない場合に拒否する。 | escalation_authority | gate | src/runtime/legacy-adoption.ts:285-288 |
| `RD05-041` | completion-decision-packetは、autonomousWorkBlockersが人間判断とworkflow状態以外のblockerをsortした列に一致しない場合、失敗させる。 | process_gate | lint | src/lint/completion-decision-packet.ts:246-250; src/lint/completion-decision-packet.ts:294-302 |
| `RE01-115` | AIのPO支援roleは助言だけを行い、人間のPO判断を代行してはならない。 | escalation_authority | prose | docs/governance/helix-harness-requirements_v1.2.md:1555-1614 |
| `RE01-196` | AIは事実・候補・confidence・oracleを提案できるが、要求・authority・高影響操作・state・gateを自己承認してはならない。Nodeはcommit前にschema・authority・policy・HEAD・digestを再検証する。 | escalation_authority | gate | docs/governance/helix-harness-requirements_v1.3.md:257-257 |
| `RE01-221` | AIはpolicy内の可逆変更を自律実行できるが、L1の目的・安全・外部契約・不可逆操作・実質的trade-offは人間に委ねる。 | escalation_authority | prose／gate | docs/governance/helix-harness-requirements_v1.3.md:353-357 |
| `RE01-282` | AI判断の実行者は候補・根拠・confidence・fallback・dead-letter・再評価条件・oracleを揃え、欠けた判断を実行へ流さない。 | evidence_claim | gate | docs/governance/helix-harness-requirements_v1.3.md:637-664 |

## 副として対応づいた規則（19件）

`RA-138`、`RB04-007`、`RB05-050`、`RB05-346`、`RB05-350`、`RB05-356`、`RB05-358`、`RB05-360`、`RB06-006`、`RB06-022`、`RB06-120`、`RB07-241`、`RB08-225`、`RB08-226`、`RC00-025`、`RC00-197`、`RC00-198`、`RC00-202`、`RE01-201`
