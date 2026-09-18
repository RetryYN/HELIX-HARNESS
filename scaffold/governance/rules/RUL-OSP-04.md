---
status: scaffold
authority_effect: none
generated_by: scaffold/governance/tools/gen_rulebook.py
source_candidate: docs/governance/candidates/legacy-rule-derived-requirements.md
source_candidate_sha256: 1467f96bd6068028e8950b1a4ae265fa2474c9cb3dfaf442b7ba2b43fe670c80
source_inventory: docs/governance/legacy-rule-atom-inventory.jsonl
source_inventory_sha256: 78d14197ae48bc7eefb6f8c6836902fde2c20842952c8e702654492efcde0b92
rule_id: RUL-OSP-04
group: OS推進
product: OS
atoms_primary: 25
atoms_secondary: 22
issue_projection: #1859
---

# RUL-OSP-04（OS推進／OS）

仮のルール。正本は[要求候補](../../../docs/governance/candidates/legacy-rule-derived-requirements.md)であり、本fileはその機械的な写しである。採否・承認・完了を生成しない。

## 要求

AIは、RUL-OSM-01が定める人間の介入点に当たらない作業を自走する。人間へ質問する前に、AI側で解決できる情報が残っていないかを確かめ、質問するときは判断に必要な材料を揃える。介入点の定義そのものは持たず、RUL-OSM-01を参照する。

## 主として対応づいた規則（25件）

| atom | 規則 | 種類 | 強制 | 失敗時 | 旧実装固有の部分 | 副 | 出どころ | 由来 |
|---|---|---|---|---|---|---|---|---|
| `RA-154` | 通常GitHub laneはpush・Draft PR・CI監視・self-heal・AI-B最終review・明示mergeまで継続する。 | review_merge | prose | n/a | 旧GitHub自走lane | `RUL-OSA-04`、`RUL-OSM-08` | CLAUDE.md:193-193 | A／gpt-6-astra |
| `RA-164` | 作成側は自分のpush・PRでharness-checkが失敗したらlog取得・修正・再pushまで自分で行う。 | review_merge | prose | n/a | harness-check、gh run view --log-failed、helix github ci-status | `RUL-OSP-05` | AGENTS.md:333-334; CLAUDE.md:211-213 | A／gpt-6-astra |
| `RA-284` | エージェントは不明点に妥当な仮定を明示して進み、本当に詰まった場合だけ確認する。 | behavior_discipline | prose | n/a | — | — | AGENTS.md:223-224 | A／gpt-6-astra |
| `RB0-132` | agentはPO判断と自力で解決可能な判断を区別し、後者では妥当な仮定を明示して決定・記録・継続する。 | behavior_discipline | prose | n/a | decide-record-proceed | `RUL-OSM-01` | docs/skills/judgment-core.md:60-63 | B／gpt-6-astra |
| `RB04-171` | 質問者は事前にAGENTS.md/RUNBOOK.mdを確認し、実施内容・期待・結果・試行を記し、errorはテキスト、コードはcode blockで示す。 | behavior_discipline | prose | n/a | Slack code block | `RUL-OSP-05` | docs/governance/ai-dev-team-operations_v1.1.md:153-161 | B04／gpt-6-astra |
| `RB05-246` | L3承認済みIssueの実行・監査loopは不可逆境界以外を無人でForwardへ収束させ、自己監査にしない。 | lane_delegation | prose | fail_close | 未実装Codex→Claude loop | `RUL-OSA-01` | docs/governance/infinity-loop-system-assertion-cases.md:335-335 | B05／gpt-6-astra |
| `RB06-026` | AIは修正可能なschema不整合を修復して再検査し、trace欠落時はcandidateを生成して再検査し、pair欠落時は作成taskを起票する。 | process_gate | prose | fail_close | — | `RUL-FRM-01`、`RUL-TKT-03` | docs/governance/autonomous-authoring-admission-transaction-directive_v0.1.md:241-245 | B06／gpt-6-astra |
| `RB06-050` | NFR是正担当AIはregistry契約実装と一致oracleを自走で進め、dual-green期間は既存projectionを互換trace入力として扱う。 | process_gate | prose | n/a | ISSUE-03の是正方針 | `RUL-OSM-07` | docs/governance/rule-enforcement-gap-audit-2026-08-12.md:41-46 | B06／gpt-6-astra |
| `RB06-054` | 監査対象の是正担当AIは明示されたPO介入点以外を、実装PLAN起票から通常PR・CI・review経路で自走する。 | escalation_authority | prose | n/a | 本監査の是正scope | — | docs/governance/rule-enforcement-gap-audit-2026-08-12.md:205-206 | B06／gpt-6-astra |
| `RB06-094` | Infinity LoopはL3承認済みIssueとcurrent設計に対し、不可逆境界以外を無人でForwardへ収束させ、自己監査を行わない。 | lane_delegation | prose | fail_close | 未実装assertion、Codex実行・Claude監査 | `RUL-OSA-01`、`RUL-FRM-02` | docs/governance/infinity-loop-assertion-coverage-ledger.md:31-31 | B06／gpt-6-astra |
| `RB06-203` | AIはroute全体を承認待ちにせず、Recovery診断、Incident証拠収集、Retrofit inventory・impact・dry-runを自律継続し、production actionの承認を別管理する。 | escalation_authority | prose | n/a | route選択はproposal-only | `RUL-OSM-01` | docs/governance/workflow-and-specialist-harness-audit-2026-07-28.md:106-115 | B06／gpt-6-astra |
| `RB08-056` | 調査担当者はPOへ確認する前にweb researchとsubagent self-reviewを行う。 | behavior_discipline | prose | n/a | elicitation-AI-first | `RUL-RSH-01` | docs/skills/research.md:26-29 | B08／gpt-6-astra |
| `RC00-199` | 相談Stop gateは、escalationを検出しreceiptが存在せず、有効なone-shot overrideもなければ停止をblockする。 | escalation_authority | hook／gate | fail_close | .helix/state/sol-consult-receipt | — | src/runtime/escalation-consult-gate.ts:167-184; src/runtime/escalation-consult-gate.ts:324-355 | C00／gpt-6-astra |
| `RC00-200` | 相談Stop gateは、receiptがtl・codex・有効task digestの条件を満たさず、有効なoverrideもなければ停止をblockする。 | escalation_authority | hook／gate | fail_close | 旧receipt発行元とSHA-256形式の照合 | `RUL-OSP-03`、`RUL-COR-02` | src/runtime/escalation-consult-gate.ts:195-205; src/runtime/escalation-consult-gate.ts:319-355 | C00／gpt-6-astra |
| `RC00-201` | 相談Stop gateは、receipt時刻が未来または6時間超過で、有効なoverrideもなければ停止をblockする。 | escalation_authority | hook／gate | fail_close | CONSULT_RECEIPT_TTL_MS | `RUL-COR-04` | src/runtime/escalation-consult-gate.ts:77-78; src/runtime/escalation-consult-gate.ts:208-212; src/runtime/escalation-consult-gate.ts:311-355 | C00／gpt-6-astra |
| `RD02-133` | 質問gateは、technical質問にTL advisor証拠がない場合に質問を拒否する。 | escalation_authority | gate | fail_close | 明示classまたは英語keywordでtechnical判定 | `RUL-OSP-01` | src/runtime/legacy-adoption.ts:271-283 | D02／gpt-6-astra |
| `RD02-134` | 質問gateは、preference質問にbypass理由がない場合に拒否する。 | escalation_authority | gate | fail_close | bypass_reason | `RUL-OSM-01` | src/runtime/legacy-adoption.ts:285-288 | D02／gpt-6-astra |
| `RD05-041` | completion-decision-packetは、autonomousWorkBlockersが人間判断とworkflow状態以外のblockerをsortした列に一致しない場合、失敗させる。 | process_gate | lint | fail_close | 残余blockerをautomation作業へ分類 | `RUL-OSM-01`、`RUL-COR-04` | src/lint/completion-decision-packet.ts:246-250; src/lint/completion-decision-packet.ts:294-302 | D05／gpt-6-astra |
| `RE01-115` | AIのPO支援roleは助言だけを行い、人間のPO判断を代行してはならない。 | escalation_authority | prose | fail_close | PO支援role | `RUL-OSM-01` | docs/governance/helix-harness-requirements_v1.2.md:1555-1614 | E01／claude-opus |
| `RE01-196` | AIは事実・候補・confidence・oracleを提案できるが、要求・authority・高影響操作・state・gateを自己承認してはならない。Nodeはcommit前にschema・authority・policy・HEAD・digestを再検証する。 | escalation_authority | gate | fail_close | AI proposalとNode admission boundary | `RUL-OSM-01` | docs/governance/helix-harness-requirements_v1.3.md:257-257 | E01／claude-opus |
| `RE01-221` | AIはpolicy内の可逆変更を自律実行できるが、L1の目的・安全・外部契約・不可逆操作・実質的trade-offは人間に委ねる。 | escalation_authority | prose／gate | fail_close | authoring自律境界 | `RUL-OSM-01` | docs/governance/helix-harness-requirements_v1.3.md:353-357 | E01／claude-opus |
| `RE01-282` | AI判断の実行者は候補・根拠・confidence・fallback・dead-letter・再評価条件・oracleを揃え、欠けた判断を実行へ流さない。 | evidence_claim | gate | fail_close | AI decision acceptance contract | `RUL-FRM-04` | docs/governance/helix-harness-requirements_v1.3.md:637-664 | E01／claude-opus |
| `RG40-012` | AIは、POへのエスカレーションを言い出す前に、先にT0セカンドオピニオン（Sol壁打ち）を実行しなければならない。壁打ちの結果AI側で解決できるなら、エスカレーションせず通常ゲートで進める。 | escalation_authority | hook／gate | fail_close | helix codex --role tl --execute という具体コマンドとStop hook実装 | `RUL-OSM-01` | src/runtime/escalation-consult-gate.ts:1-19; src/runtime/escalation-consult-gate.ts:347-356 | G40／claude-opus |
| `RG40-013` | エスカレーション意図の検出は、fenced/inline codeとblockquote行、gate自体を指すmeta名詞句、否定・非該当表現を先に除去してから判定し、それらをエスカレーション宣言として扱ってはならない。 | escalation_authority | hook | fail_open | 日本語・英語の具体regex集合 | `RUL-OSM-01` | src/runtime/escalation-consult-gate.ts:35-61; src/runtime/escalation-consult-gate.ts:131-149 | G40／claude-opus |
| `RG42-020` | 質問の分類は、明示指定が無い場合、設計・契約・schema・migration・security・architecture・API・DB・認証・配置・構造といった語を含むかどうかでtechnicalと判定する。 | escalation_authority | gate | fail_close | 英語語彙の正規表現 | `RUL-OSP-01` | src/runtime/legacy-adoption.ts:221-222; src/runtime/legacy-adoption.ts:271-277 | G42／claude-opus |

## 副として対応づいた規則（22件）

`RA-138`、`RB04-007`、`RB05-050`、`RB05-346`、`RB05-350`、`RB05-356`、`RB05-358`、`RB05-360`、`RB06-006`、`RB06-022`、`RB06-120`、`RB07-241`、`RB08-225`、`RB08-226`、`RC00-025`、`RC00-197`、`RC00-198`、`RC00-202`、`RE01-201`、`RG28-004`、`RG47-001`、`RG47-002`
