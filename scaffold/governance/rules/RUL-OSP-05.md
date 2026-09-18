---
status: scaffold
authority_effect: none
generated_by: scaffold/governance/tools/gen_rulebook.py
source_candidate: docs/governance/candidates/legacy-rule-derived-requirements.md
source_candidate_sha256: 1c9891cbf76d7a28a6cf64b75e907e6ddad41c0aac5c9fa0a9196421211407a5
source_inventory: docs/governance/legacy-rule-atom-inventory.jsonl
source_inventory_sha256: e265b57e50d4c0f2f161c89a7dadbde12738bd84eab21de3fb5745d7741ef125
rule_id: RUL-OSP-05
group: OS推進
product: OS
atoms_primary: 36
atoms_secondary: 29
issue_projection: #1859
---

# RUL-OSP-05（OS推進／OS）

仮のルール。正本は[要求候補](../../../docs/governance/candidates/legacy-rule-derived-requirements.md)であり、本fileはその機械的な写しである。採否・承認・完了を生成しない。

## 要求

作業者の行動規律を定める。失敗の出力を全部読む、根因を確定してから直す、推測で進めない、他の正本と矛盾したら止まる。

## 主として対応づいた規則（36件）

| atom | 規則 | 種類 | 強制 | 出どころ |
|---|---|---|---|---|
| `RA-013` | Codexはセッション開始時にCore Readsの存在を確認する。 | memory_context | prose | AGENTS.md:133-135 |
| `RA-022` | 各専門agentは作業前に自身の必読節・設計・PLAN・委譲資料を読み、指定節がなければ省略せず親agentへ不一致を報告する。 | memory_context | prose | .claude/agents/be-api.md:19-24; .claude/agents/be-logic.md:19-25; .claude/agents/db-schema.md:19-25; .claude/agents/devops-deploy.md:20-24; .claude/agents/fe-lead.md:13-18; .claude/agents/fe-ui.md:14-19; .claude/agents/code-reviewer.md:14-19; .claude/agents/security-audit.md:13-19; .claude/agents/qa-test.md:13-19; .claude/agents/refactor-scout.md:25-31; .claude/agents/pmo-sonnet.md:32-38 |
| `RA-023` | PMO Sonnetは判断・提案の前にReadで全体像を再構築し、read→classify→evidence→recommendationの順を保持する。 | memory_context | prose | .claude/agents/pmo-sonnet.md:27-30; .claude/agents/pmo-sonnet.md:87-89 |
| `RA-094` | Claudeはnative tool-useだけを使い、XML風pseudo tool callを表示・修復・継続せず、native toolが使えない場合だけ人間向けcommandを示す。 | tooling_runtime | prose | CLAUDE.md:178-180; .claude/CLAUDE.md:128-136 |
| `RA-249` | 測定値が動いた場合、エージェントは他runtimeの退行と決め付ける前に自分のbaselineを確認する。 | evidence_claim | prose | AGENTS.md:311-312; CLAUDE.md:246-248 |
| `RA-251` | reviewerとPMOは根拠のない断定をせず、確信のない所見・影響を推測と明記する。 | evidence_claim | prose | .claude/agents/code-reviewer.md:35-36; .claude/agents/code-reviewer.md:107-108; .claude/agents/pmo-sonnet.md:17-17; .claude/agents/pmo-tech-news.md:17-17 |
| `RA-269` | PDM managerはscoutの結論を鵜呑みにせずconflictを先に調べ、missing evidenceを捏造せず不確実性を隠さない。 | evidence_claim | prose | .claude/agents/pdm-innovation-manager.md:15-15; .claude/agents/pdm-innovation-manager.md:24-24; .claude/agents/pdm-innovation-manager.md:30-30 |
| `RA-281` | エージェントは編集前に対象と関連fileを読む。 | behavior_discipline | prose | AGENTS.md:148-148; AGENTS.md:284-284; CLAUDE.md:172-172 |
| `RA-290` | エージェントは各層の設計・curationで旧HELIX repositoryの再利用可能機能を確認し、既存を見ずに新規案だけを起こさない。 | behavior_discipline | prose | AGENTS.md:117-120; CLAUDE.md:74-80 |
| `RB0-125` | agentは非自明な作業の前に仮定を明示し、PLAN・文書・codeまたは正本間の矛盾を見つけたら推測で継続せず表明して止まる。 | process_gate | prose | docs/skills/SKILL_MAP.md:81-81; docs/skills/judgment-core.md:51-52 |
| `RB04-103` | 作業者はpush前に設計・実装・テスト整合、未commit取り残し、認識ずれ記録、authored source・継続projection・memory整合を確認し、不備があれば停止する。 | process_gate | gate | docs/governance/helix-harness-concept_v3.1.md:916-923 |
| `RB04-188` | CI失敗修正の指示例では、AIは原因特定・修正・fix:原因のcommit・回帰テスト追加を行い、期待値や仕様を勝手に変えて通過させない。 | behavior_discipline | prose | docs/governance/ai-dev-team-operations_v1.1.md:431-446 |
| `RB04-203` | test失敗時はlog・再現・原因分類を確認し、対応方針を決めて修正PRまたは相談へ進む。 | behavior_discipline | prose | docs/governance/ai-dev-team-operations_v1.1.md:687-699 |
| `RB04-206` | Flaky testは原因調査と再現確認を行い、再実行や無視で済ませない。 | behavior_discipline | prose | docs/governance/ai-dev-team-operations_v1.1.md:707-707 |
| `RB04-207` | 環境問題はTLへ相談して再現条件を記録し、ローカル成功を理由にCI errorを放置しない。 | evidence_claim | prose | docs/governance/ai-dev-team-operations_v1.1.md:708-713 |
| `RB04-208` | 仕様変更時はtestを正しく更新し、原因未確認の失敗test削除・理由のないskip・内容未確認のAI test mergeを行わない。 | behavior_discipline | prose | docs/governance/ai-dev-team-operations_v1.1.md:709-713 |
| `RB05-101` | 旧内部CIの不具合を扱う担当者は現CIを一旦隔離し、旧UTの検証logicを参照して再構築する。 | tooling_runtime | prose | docs/governance/infinity-loop-source-capability-ledger.md:39-39 |
| `RB07-001` | 担当者は根因が確定してPLANが開いた後の修正にerror-fixを適用する。 | process_gate | prose | docs/skills/debugging-and-error-recovery.md:25-26 |
| `RB07-002` | 担当者は失敗したコマンドの出力を全文読み、headやtailで根本エラーを隠してはならない。 | behavior_discipline | prose | docs/skills/debugging-and-error-recovery.md:39-48 |
| `RB07-003` | 担当者は障害を環境・governance・実装・テストoracleに分類し、対応する検査で確認するまで次の手順へ進まない。 | process_gate | prose | docs/skills/debugging-and-error-recovery.md:52-65 |
| `RB07-009` | 担当者はPLANを開く前にcurrent HEADで障害を再現し、再現不能なら先にflakinessを診断する。 | process_gate | prose | docs/skills/debugging-and-error-recovery.md:78-96 |
| `RB07-011` | 担当者はコード変更前に根因調査を完了し、不正値を発生源まで追跡して具体的な仮説を一つ書く。 | process_gate | prose | docs/skills/debugging-and-error-recovery.md:107-111 |
| `RB07-012` | 担当者は一度に仮説と変更変数を一つに絞り、検証してから次へ進む。 | behavior_discipline | prose | docs/skills/debugging-and-error-recovery.md:108-109 |
| `RB07-013` | 同じ対象が3回連続失敗した場合、担当者は修正を停止して上位の設計・契約・基準点へ調査を戻すかRecovery PLANへエスカレーションする。対象の成功で連続回数をリセットする。 | escalation_authority | prose | docs/skills/debugging-and-error-recovery.md:113-122 |
| `RB07-037` | AI検証者は微小な位置・色・フォント差を画像だけで断定せず、DOM測定へ切り替えるか人間へ回す。 | escalation_authority | prose | docs/skills/browser-testing-and-screen-verification.md:118-121 |
| `RB07-161` | 検証者はdoctor、vmodel lint、plan lint、typecheck、lint、testの順に実行し、最初の失敗で止まって修正後に再開し、出力をtailで切らない。 | process_gate | prose | docs/skills/verification.md:49-62 |
| `RB07-195` | Windows hookはWSL2を前提にせずproject-relative経路を使い、status null時はコード退行と決める前にPATHのSystem32をdoctorで確認する。 | tooling_runtime | prose | docs/skills/security.md:86-89 |
| `RB07-252` | 監査者は検索結果をそのまま修正件数にせず、4区分に分類してregistryとの意味差分を記録してから対象化する。 | evidence_claim | prose | docs/governance/route-classification-surface-inventory-2026-08-15.md:109-110 |
| `RB08-121` | 依存分析担当者はgraphとdoctorの全出力を読み、循環・層横断依存・upstream ownerを追跡して宣言またはimportを修正し、両command成功まで確認する。 | process_gate | prose | docs/skills/dependency-map.md:47-56 |
| `RB08-143` | CI失敗担当者は全出力から失敗sub-gateを特定して根本原因を修正し、理由なしignore・skipを使わず、push前に全検査を再実行する。 | process_gate | prose | docs/skills/ci-gate-design.md:61-67 |
| `RB08-145` | hook運用者はCLAUDE_PROJECT_DIRをrepo rootへ向け、Windows PATHのSystem32欠落をcode回帰と判断する前にdoctorで確認する。 | tooling_runtime | prose | docs/skills/ci-gate-design.md:71-75 |
| `RC00-122` | 試行監視は、同一subjectの直近連続失敗が閾値以上ならSTOPと根本原因調査を求める警告を出す。成功で連続数をリセットし、未分類Bashは集計しない。 | behavior_discipline | gate | src/runtime/attempt-escalation.ts:32-71; src/runtime/attempt-escalation.ts:85-94; src/runtime/attempt-escalation.ts:131-150 |
| `RD02-131` | 作業preflightは、PLANまたはhandoverとの競合がある場合にblockerを返す。 | process_gate | gate | src/runtime/legacy-adoption.ts:263-267 |
| `RG17-002` | 移行担当者は、主観的な不安だけを理由にrollbackしてはならない。 | behavior_discipline | prose | docs/skills/data-migration.md:78-80 |
| `RG17-003` | 障害調査担当者は、CIのharness-checkが失敗した場合、CI logから失敗したsub-gateを最初に特定する。 | behavior_discipline | prose | docs/skills/debugging-and-error-recovery.md:39-42 |
| `RG17-006` | 設計者は、判断が規約準拠とarchitecture選択のどちらに属するか判別できない場合、既存方式を踏襲する。踏襲で問題が生じる証拠が揃ってから、architecture判断としてADRを起こす。 | behavior_discipline | prose | docs/skills/design-tailoring.md:88-93 |

## 副として対応づいた規則（29件）

`RA-007`、`RA-008`、`RA-128`、`RA-164`、`RA-303`、`RB0-133`、`RB04-171`、`RB04-204`、`RB04-260`、`RB05-116`、`RB05-213`、`RB05-299`、`RB06-298`、`RB07-016`、`RB07-033`、`RB07-198`、`RB07-247`、`RB07-328`、`RB08-024`、`RB08-031`、`RB08-041`、`RB08-078`、`RB08-105`、`RB08-238`、`RB08-269`、`RB08-324`、`RG16-017`、`RG17-004`、`RG18-006`
