---
status: scaffold
authority_effect: none
generated_by: scaffold/governance/tools/gen_rulebook.py
source_candidate: docs/governance/candidates/legacy-rule-derived-requirements.md
source_candidate_sha256: 1467f96bd6068028e8950b1a4ae265fa2474c9cb3dfaf442b7ba2b43fe670c80
source_inventory: docs/governance/legacy-rule-atom-inventory.jsonl
source_inventory_sha256: 78d14197ae48bc7eefb6f8c6836902fde2c20842952c8e702654492efcde0b92
rule_id: RUL-OSP-01
group: OS推進
product: OS
atoms_primary: 70
atoms_secondary: 55
issue_projection: #1859
---

# RUL-OSP-01（OS推進／OS）

仮のルール。正本は[要求候補](../../../docs/governance/candidates/legacy-rule-derived-requirements.md)であり、本fileはその機械的な写しである。採否・承認・完了を生成しない。

## 要求

レーンと役割（技術lead、実装、QA、調査、審査）の責務と、各役割が返す成果の形式を定める。役割の不在時の代行を定める。

## 主として対応づいた規則（70件）

| atom | 規則 | 種類 | 強制 | 失敗時 | 旧実装固有の部分 | 副 | 出どころ | 由来 |
|---|---|---|---|---|---|---|---|---|
| `RA-109` | 非Codex agentはAGENTS.mdのTL役割・委譲レーン・hybrid協調・push/PR/merge権限を継承せず、共通ルールだけを適用する。 | escalation_authority | prose | n/a | Codex専用権限 | `RUL-OSM-02` | AGENTS.md:13-19 | A／gpt-6-astra |
| `RA-110` | Kimiを含む非正規runtimeはpush・merge・release・tagを行わない。 | escalation_authority | prose | n/a | Claude/Codex HELIX正規レーン | `RUL-REL-01` | AGENTS.md:20-23 | A／gpt-6-astra |
| `RA-112` | fe-uiは割当boundary外の設計変更・要件曖昧・破壊的変更・高影響境界を自己判断せずfe-leadへ返す。 | escalation_authority | prose | n/a | fe-ui→fe-lead | `RUL-OSP-03` | .claude/agents/fe-ui.md:25-25; .claude/agents/fe-ui.md:32-35 | A／gpt-6-astra |
| `RA-113` | PMO Haikuは広い設計review・architecture判断・複数fileリスク分析・高影響変更判断を行わず、曖昧さや証拠対立はPMO Sonnetへ返す。 | escalation_authority | prose | n/a | pmo-haiku→pmo-sonnet | `RUL-OSP-02` | .claude/agents/pmo-haiku.md:16-16; .claude/agents/pmo-haiku.md:29-33 | A／gpt-6-astra |
| `RA-114` | project explorerは高影響領域の決定を行わず、証拠対立やarchitecture境界に関わる最終設計判断をPMO Sonnetへ返す。 | escalation_authority | prose | n/a | pmo-project-explorer→pmo-sonnet | — | .claude/agents/pmo-project-explorer.md:27-27; .claude/agents/pmo-project-explorer.md:32-32 | A／gpt-6-astra |
| `RA-115` | project scoutは深い精読・設計整合・破壊変更判断を行わず、再利用可否や依存・実装整合の詳細調査をproject explorerへ渡す。 | escalation_authority | prose | n/a | pmo-project-scout→pmo-project-explorer | `RUL-OSP-02` | .claude/agents/pmo-project-scout.md:16-16; .claude/agents/pmo-project-scout.md:23-23; .claude/agents/pmo-project-scout.md:42-47 | A／gpt-6-astra |
| `RA-119` | tech-newsは深掘りを既定で行わず、精読・比較はtech-docs、license・保守性・依存の採否評価はtech-forkへ渡し、理由と対象を最終出力に残す。 | escalation_authority | prose | n/a | pmo-tech-news→pmo-tech-docs/pmo-tech-fork | `RUL-RSH-01` | .claude/agents/pmo-tech-news.md:23-23; .claude/agents/pmo-tech-news.md:57-61 | A／gpt-6-astra |
| `RA-120` | PDM技術scoutは最終architecture・license・security・infrastructure判断をせず、高影響の不確実性を人間または適切なreview roleへ返す。 | escalation_authority | prose | n/a | pdm-tech-innovation | `RUL-OSM-01`、`RUL-RSH-01` | .claude/agents/pdm-tech-innovation.md:29-32 | A／gpt-6-astra |
| `RA-121` | marketing scoutは技術成立性やarchitectureを決めず、技術採用の問いをPDM技術scoutまたはmanagerへ返す。 | escalation_authority | prose | n/a | PDM role分担 | — | .claude/agents/pdm-marketing-innovation.md:29-32 | A／gpt-6-astra |
| `RA-124` | 単独で稼働するCodexは現在sliceのtechnical leadとして、可能な範囲で設計から検証・gate判断まで担う。 | lane_delegation | prose | n/a | standalone、codex-only | — | AGENTS.md:141-147 | A／gpt-6-astra |
| `RA-139` | advisor-fableは実装・編集を行わず、Bashも読取検証だけに使う。 | lane_delegation | prose | n/a | advisor-fable | `RUL-OSP-03` | .claude/agents/advisor-fable.md:11-13; .claude/CLAUDE.md:184-184 | A／gpt-6-astra |
| `RA-140` | FE作業はfe-leadが設計・分割・reviewを主導し、fe-uiがleadの確定設計に従って実装する。 | lane_delegation | prose | n/a | Opus fe-lead、Sonnet fe-ui、PLAN-L7-309 | `RUL-DEV-02` | .claude/CLAUDE.md:199-204; .claude/agents/fe-lead.md:10-11; .claude/agents/fe-lead.md:28-31; .claude/agents/fe-ui.md:11-12 | A／gpt-6-astra |
| `RA-141` | FEのUX・usability判断ではfe-leadがadvisor-fableへ助言を求め、fe-uiはlead経由で相談し、Fableに実装させない。 | lane_delegation | prose | n/a | FE roster | `RUL-OSP-02` | .claude/CLAUDE.md:203-204; .claude/agents/fe-lead.md:33-36; .claude/agents/fe-ui.md:32-34; .claude/agents/advisor-fable.md:28-30 | A／gpt-6-astra |
| `RA-142` | repository調査はproject-focused agentを使い、source-snapshot探索をactive subagent通路にしない。 | lane_delegation | prose | n/a | project-focused agents | `RUL-OSM-07` | .claude/CLAUDE.md:218-219 | A／gpt-6-astra |
| `RA-143` | PMO SonnetはRead見込200行以上、Grep3回以上、複数観点review、長文全文読了のいずれかで委譲継続を判断し、該当時はPMO作業として続けて直接実装しない。 | lane_delegation | prose | n/a | PMO委譲閾値 | `RUL-TKT-02` | .claude/agents/pmo-sonnet.md:73-81 | A／gpt-6-astra |
| `RA-144` | PDM技術scoutは独立した技術判断passが明示的に必要な場合だけTL advisorをwrapper経由で呼ぶ。 | lane_delegation | prose | n/a | helix codex --role tl-advisor | `RUL-OSP-03` | .claude/agents/pdm-tech-innovation.md:25-25 | A／gpt-6-astra |
| `RA-252` | advisor-fableは根拠強度・正本整合・不可逆性と影響範囲・代替案・escalation適切性の5軸で毎回評価し、少なくとも1対案を比較する。 | evidence_claim | prose | n/a | Fable 5軸 | — | .claude/CLAUDE.md:196-196; .claude/agents/advisor-fable.md:40-46 | A／gpt-6-astra |
| `RA-253` | advisor-fableは日本語で結論・判断を分けた根拠・残risk・具体的な次action1つを返す。 | evidence_claim | prose | n/a | — | `RUL-FRM-07` | .claude/agents/advisor-fable.md:48-55 | A／gpt-6-astra |
| `RA-255` | Refactor Scoutは候補にfile・行や重複箇所対の証拠と確信度を付け、低確信候補をprecision notesへ分離する。 | evidence_claim | prose | n/a | precision notes | — | .claude/agents/refactor-scout.md:16-17 | A／gpt-6-astra |
| `RA-260` | PMO Haikuとproject scoutは確認事実・候補にfile pathまたはURLを付ける。 | evidence_claim | prose | n/a | — | — | .claude/agents/pmo-haiku.md:17-17; .claude/agents/pmo-project-scout.md:17-17 | A／gpt-6-astra |
| `RA-261` | project explorerは全文dumpせず、file pathと具体観測を持つ短いsummaryで発見を返す。 | evidence_claim | prose | n/a | — | — | .claude/agents/pmo-project-explorer.md:17-17; .claude/agents/pmo-project-explorer.md:33-33 | A／gpt-6-astra |
| `RA-270` | PDM managerはranked optionに捨てた案と理由を残す。 | evidence_claim | prose | n/a | — | — | .claude/agents/pdm-innovation-manager.md:16-16 | A／gpt-6-astra |
| `RA-273` | PMO SonnetはKeep→Problem→Try→evidence→risksの順で返し、仕様変更には破壊的変更flag、受入条件外提案にはTry区分を付ける。 | evidence_claim | prose | n/a | KPT report | `RUL-OSI-03` | .claude/agents/pmo-sonnet.md:49-57; .claude/agents/pmo-sonnet.md:85-89 | A／gpt-6-astra |
| `RA-274` | PMO Haikuは確認・変更path、短い所見、Sonnetまたは人間確認が必要な未解決riskを返す。 | evidence_claim | prose | n/a | — | — | .claude/agents/pmo-haiku.md:35-41 | A／gpt-6-astra |
| `RA-275` | project explorerはsummary・candidate_files・api_db_notes・design_alignment・risksを返す。 | evidence_claim | prose | n/a | explorer output fields | — | .claude/agents/pmo-project-explorer.md:36-44 | A／gpt-6-astra |
| `RA-276` | project scoutは候補fileを1file1行で列挙し、1行summaryと追加精査対象を返す。 | evidence_claim | prose | n/a | — | — | .claude/agents/pmo-project-scout.md:24-29; .claude/agents/pmo-project-scout.md:40-40; .claude/agents/pmo-project-scout.md:47-47 | A／gpt-6-astra |
| `RA-277` | Refactor Scoutは候補kind・file・subject・confidence・reason、保持behavior、PLAN入力案、precision notesをMarkdownで返す。 | evidence_claim | prose | n/a | Refactor PLAN入力 | — | .claude/agents/refactor-scout.md:42-49 | A／gpt-6-astra |
| `RA-300` | PMO Sonnetは明示指示がある場合だけWrite・Editを行い、提案を最小変更にして再実行可能性を優先する。 | behavior_discipline | prose | n/a | pmo-sonnet | `RUL-DEV-01` | .claude/agents/pmo-sonnet.md:59-63 | A／gpt-6-astra |
| `RA-301` | Refactor Scoutはfileを編集・rewriteせず、PLAN開始・継続判断用の短いtriageだけを返す。 | behavior_discipline | prose／config | n/a | Refactor Scout | — | .claude/agents/refactor-scout.md:4-4; .claude/agents/refactor-scout.md:22-23; .claude/agents/refactor-scout.md:53-53 | A／gpt-6-astra |
| `RA-302` | project explorerはcurrent repository treeとtracked contextだけを調べ、再利用候補を新規実装案より先に返し、探索だけのtaskでは実装変更を最小にする。 | behavior_discipline | prose | n/a | — | `RUL-OSP-03`、`RUL-DEV-01` | .claude/agents/pmo-project-explorer.md:16-16; .claude/agents/pmo-project-explorer.md:24-26; .claude/agents/pmo-project-explorer.md:34-34 | A／gpt-6-astra |
| `RA-312` | PDM各agentは定義されたoption・推奨・前提・risk・検証計画・L1入力・decision log等をYAML互換形式で返す。 | behavior_discipline | prose | n/a | 各PDM output schema、g0_5_mapping | — | .claude/agents/pdm-tech-innovation.md:34-44; .claude/agents/pdm-marketing-innovation.md:34-43; .claude/agents/pdm-innovation-manager.md:35-46 | A／gpt-6-astra |
| `RA-354` | QAはtest戦略・ID付きcase一覧・実装・coverage report・性能計測結果を返す。 | behavior_discipline | prose | n/a | — | `RUL-FRM-05` | .claude/agents/qa-test.md:80-85 | A／gpt-6-astra |
| `RB0-140` | Fableへの委譲者は実装を依頼せず判断だけを依頼し、結論・根拠・残リスク・次の一手を要求する。 | lane_delegation | prose | n/a | advisor-fable | `RUL-OSP-03` | docs/skills/judgment-core.md:96-96 | B／gpt-6-astra |
| `RB04-006` | HELIX soloの作業者は旧チームの役割をPO一名とAI rosterへ写像し、工程・gate・cross-review等の機構を変更しない。 | lane_delegation | prose | n/a | solo読み替え、旧5役割 | — | docs/governance/helix-harness-concept_v3.1.md:105-115 | B04／gpt-6-astra |
| `RB04-012` | hybrid運用者は判断系と実行系を別runtimeへ割り当て、同一作業を二重実行しない。 | lane_delegation | prose | n/a | hybrid、frontier-reviewer、worker | `RUL-OSA-01`、`RUL-OSP-06` | docs/governance/helix-harness-concept_v3.1.md:160-160 | B04／gpt-6-astra |
| `RB04-013` | CLIは片方のruntimeしかない環境でhybrid専用委譲を要求された場合、失敗扱いではなくnot-availableとfallback手順を返す。 | tooling_runtime | prose | n/a | helix、hybrid専用委譲 | `RUL-OSP-02` | docs/governance/helix-harness-concept_v3.1.md:175-175 | B04／gpt-6-astra |
| `RB04-024` | 必要agentが不在の場合、orchestratorはsilent fallbackせず、不在を記録して明示的に縮退するか人間へ委ねる。 | lane_delegation | prose | n/a | orchestration_mode、execution mode | `RUL-OSP-06` | docs/governance/helix-harness-concept_v3.1.md:219-219; docs/governance/helix-harness-concept_v3.1.md:497-497 | B04／gpt-6-astra |
| `RB04-115` | PRレビュー担当はAIによる規約・bug・脆弱性確認、aimによるテスト・運用・V-model確認、必要時TL判断、リリース前QA確認の段階を担う。 | review_merge | prose／config | n/a | 旧4段review、CODEOWNERS、aim/TL応答1営業日 | `RUL-OSA-02` | docs/governance/helix-harness-concept_v3.1.md:1064-1073 | B04／gpt-6-astra |
| `RB04-116` | incident発見者は状況・影響・時刻を投稿し、aimが初動、QAが指揮、TLが技術対応、POが必要な顧客対応判断を担う。 | escalation_authority | prose | n/a | #incident、旧役割 | `RUL-OSM-01` | docs/governance/helix-harness-concept_v3.1.md:1075-1090 | B04／gpt-6-astra |
| `RB04-118` | TL不在はQAが代行し、QA不在はaimが初動してリリースを保留し、PO不在では不可逆変更を保留する。 | escalation_authority | prose | fail_close | 旧役割不在時の代行 | `RUL-OSM-01`、`RUL-REL-01` | docs/governance/helix-harness-concept_v3.1.md:1097-1104 | B04／gpt-6-astra |
| `RB04-119` | 全員不在の場合、対応者は影響軽微なら翌朝対応とし、重大なら誰かへ連絡する。 | escalation_authority | prose | n/a | 旧チーム当番体制 | — | docs/governance/helix-harness-concept_v3.1.md:1104-1104 | B04／gpt-6-astra |
| `RB04-160` | 人間は作る内容・動作確認・リリースを判断し、コード作成はAIへ委譲して人間の直接入力を緊急時に限定する。 | lane_delegation | prose | n/a | 旧人間チームの実装禁止 | `RUL-FRM-02`、`RUL-REL-01` | docs/governance/ai-dev-team-operations_v1.1.md:77-83; docs/governance/ai-dev-team-operations_v1.1.md:380-382 | B04／gpt-6-astra |
| `RB04-169` | 仕様・技術選定はTL、品質gateはQA、リリースはQAと発注元、securityはTLとQA、designはUI/UXが責任を持ち、表の相談先へ確認する。 | lane_delegation | prose | n/a | 旧役割matrix | `RUL-REL-01` | docs/governance/ai-dev-team-operations_v1.1.md:129-138 | B04／gpt-6-astra |
| `RB04-186` | AI実装・保守担当は設計判断・技術選定を独断で行わず、迷ったらTLへ相談する。 | lane_delegation | prose | n/a | 旧AI実装・保守職 | `RUL-OSM-01` | docs/governance/ai-dev-team-operations_v1.1.md:380-382 | B04／gpt-6-astra |
| `RB04-218` | P0/P1では発見者が状況・影響・時刻を投稿し、AI実装・保守が初動、QAが指揮、TLが技術対応、発注元が必要な顧客判断を行う。 | escalation_authority | prose | n/a | #incident、旧役割 | `RUL-OSM-01` | docs/governance/ai-dev-team-operations_v1.1.md:853-867; docs/governance/ai-dev-team-operations_v1.1.md:944-956 | B04／gpt-6-astra |
| `RB04-223` | 通常相談は技術・仕様を#dev、品質を#qa、securityを#securityへ送り、それぞれTL・発注元・QA・TL/QAへ接続する。 | escalation_authority | prose | n/a | 旧Slack channelと相談先 | — | docs/governance/ai-dev-team-operations_v1.1.md:933-942 | B04／gpt-6-astra |
| `RB04-229` | TL不在はQAが代行し、QA不在は初動だけ行ってreleaseを保留し、発注元不在は不可逆変更を保留する。 | escalation_authority | prose | fail_close | 旧役割代行 | `RUL-OSM-01`、`RUL-REL-01` | docs/governance/ai-dev-team-operations_v1.1.md:1006-1014 | B04／gpt-6-astra |
| `RB04-240` | チーム設計者は判断を人間・実装をAIに分け、上流TLと下流QAを対称に配置し、実装をCIで自動検証する。 | lane_delegation | prose／ci | n/a | 旧人間TL/QA、solo読み替え対象 | `RUL-OSA-01`、`RUL-FRM-02` | docs/governance/ai-dev-team-concept_v1.1.md:36-38; docs/governance/ai-dev-team-concept_v1.1.md:49-53; docs/governance/ai-dev-team-concept_v1.1.md:183-190 | B04／gpt-6-astra |
| `RB04-241` | チーム設計者はコアを少人数で固定し、AI実装・保守を並列度に応じて増減する。 | lane_delegation | prose | n/a | 旧コア/変動/自動の3層構造 | `RUL-OSP-06` | docs/governance/ai-dev-team-concept_v1.1.md:28-34; docs/governance/ai-dev-team-concept_v1.1.md:55-55 | B04／gpt-6-astra |
| `RB04-244` | 役割設計者は責任範囲を一意にしてAGENTS.md・SKILL.md・ADRに境界を明文化し、実装作業はAIへの指示として実行する。 | lane_delegation | prose | n/a | 旧役割文書体系 | `RUL-OSP-03` | docs/governance/ai-dev-team-concept_v1.1.md:71-79 | B04／gpt-6-astra |
| `RB04-245` | TLは仕様化・architecture・技術選定・agent規則・harness・実装指示、QAはtest・運用・障害・文書・AI出力検証を担当する。 | lane_delegation | prose | n/a | 旧TL/QA職務 | — | docs/governance/ai-dev-team-concept_v1.1.md:142-158 | B04／gpt-6-astra |
| `RB04-246` | AI実装・保守はalert初動・修正指示・test不足発見・escalation・監視を担当し、UI/UXは画面設計・design system維持・TLへの仕様橋渡しを担当する。 | lane_delegation | prose | n/a | 旧人間職務、Figma | `RUL-DEV-02` | docs/governance/ai-dev-team-concept_v1.1.md:162-179 | B04／gpt-6-astra |
| `RB04-248` | securityではTLが設計と規則、QAがtest・監視・脆弱性対応、AI実装・保守が初動を担い、AI実装層は事前規約に従って独自判断しない。 | safety_security | prose | n/a | 旧security責任matrix | `RUL-OSM-01` | docs/governance/ai-dev-team-concept_v1.1.md:202-209 | B04／gpt-6-astra |
| `RB04-260` | incident対応者は初動をAI実装・保守からQA・TLへ上げ、logで影響を特定して封じ込め・根本分析・修正PR・回帰test・再発防止・正確な報告を行う。 | process_gate | prose | n/a | 旧incident責任系統 | `RUL-OSP-05`、`RUL-OSI-01` | docs/governance/ai-dev-team-concept_v1.1.md:305-321 | B04／gpt-6-astra |
| `RB04-270` | 組織構成は人数だけで判断せず、意思決定低下・技術判断困難・兼任限界・並列AI管理限界・product数を見て見直す。 | lane_delegation | prose | n/a | 旧solo→最小→専任→拡張、3/5 product目安 | `RUL-OSI-03` | docs/governance/ai-dev-team-concept_v1.1.md:498-506 | B04／gpt-6-astra |
| `RB05-102` | 要件確定後はCodexが設計文書に基づく自動実行を担い、Claude Codeがユーザー指示とDB依存・接続の監査・改善を担う。 | lane_delegation | prose | n/a | Codex／Claude固定W-agent編成 | `RUL-OSA-01` | docs/governance/infinity-loop-source-capability-ledger.md:40-43; docs/governance/infinity-loop-source-capability-ledger.md:123-128 | B05／gpt-6-astra |
| `RB05-104` | Claude側はユーザー指示をIssueまたはPLANにし、memoryまたはGitHub経由でCodex intakeへ渡す。 | lane_delegation | prose | n/a | Claude→Codex intake | `RUL-OSM-08` | docs/governance/infinity-loop-source-capability-ledger.md:44-44 | B05／gpt-6-astra |
| `RB05-110` | Codex完了時のmemory圧縮はClaude Codeが担当する。 | lane_delegation | prose | n/a | Codex／Claude compactor責務分離 | — | docs/governance/infinity-loop-source-capability-ledger.md:54-54 | B05／gpt-6-astra |
| `RB05-160` | musterはlayer・drive・task kind・verification patternから二段解決でworkerとverifierを決定し、同じ入力から同じteamとprojectionを再現する。 | lane_delegation | prose | fail_close | 未実装W-agent muster | `RUL-OSP-03` | docs/governance/infinity-loop-system-assertion-cases.md:343-343; docs/governance/infinity-loop-system-assertion-cases.md:371-371 | B05／gpt-6-astra |
| `RB06-084` | Kimiはgit push、PR merge、release、repo deleteを実行しない。 | lane_delegation | prose／hook | fail_open | push・merge・releaseはClaude/Codex正規レーン専用 | `RUL-REL-01`、`RUL-OSM-05` | docs/governance/kimi-code-extension-security-audit-2026-08-06.md:134-135 | B06／gpt-6-astra |
| `RC04-113` | pair-agentは、light_implementationが判定・完了・close・承認等のマーカーを出力した場合、errorにする。 | review_merge | gate | fail_close | VERDICT/FINAL_VERDICT/COMPLETION_CLAIM/CLOSE_PLAN/PLAN_STATUS/READY_FOR_REVIEW/APPROVAL | `RUL-OSA-01` | src/orchestration/pair-agent.ts:430-433; src/orchestration/pair-agent.ts:559-563 | C04／gpt-6-astra |
| `RC04-114` | pair-agentは、light_implementationが終了0かつ相談なしの場合、変更ファイル・targeted test command・実装説明のマーカーが欠ければerrorにする。 | evidence_claim | gate | fail_close | 出力マーカー検査 | `RUL-FRM-04` | src/orchestration/pair-agent.ts:414-423; src/orchestration/pair-agent.ts:564-571 | C04／gpt-6-astra |
| `RD02-278` | review返却判定器は、返却先worker laneが元の割当laneと異なる場合に拒否する。 | lane_delegation | gate | fail_close | RETURN_TO_ORIGINAL_WRITER | `RUL-TKT-03` | src/runtime/resident-lane-assignment.ts:250-252 | D02／gpt-6-astra |
| `RD03-078` | specialist registry検証は、verifierにverification axisが一つもない場合、拒否する。 | lane_delegation | gate | fail_close | authority=verifierのsuperRefine。 | `RUL-OSA-02` | src/runtime/specialist-agent-registry.ts:55-61 | D03／gpt-6-astra |
| `RD03-085` | specialist registry検証は、各specialist driveに少なくとも一つのworkerが登録されていない場合、不合格にする。 | lane_delegation | gate | fail_close | be/fe/fullstack/db/agentを対象。 | `RUL-OSM-02` | src/runtime/specialist-agent-registry.ts:9-9; src/runtime/specialist-agent-registry.ts:183-195 | D03／gpt-6-astra |
| `RD03-089` | specialist team選択は、要求された検証axisについて指定driveを担当できるverifierがいない場合、失敗する。 | lane_delegation | gate | fail_close | verifier_missing。 | `RUL-OSA-02`、`RUL-OSP-03` | src/runtime/specialist-agent-registry.ts:283-296 | D03／gpt-6-astra |
| `RD05-178` | cycle-p4-verificationは、automation ownerに許可された担当語が含まれない場合、違反にする。 | process_gate | lint | fail_close | doctor/db/projection/roadmap/handover/telemetry/fr-roadmap/test-design/verification/skill/source-isolation/migration | — | src/lint/cycle-p4-verification.ts:64-65; src/lint/cycle-p4-verification.ts:199-201 | D05／gpt-6-astra |
| `RE01-015` | PLAN作成者は、対象層・driveに応じて指定された専門roleをrequired_rolesへ含める。 | lane_delegation | lint | fail_close | 旧層別・drive別role必須表 | `RUL-TKT-02` | docs/governance/helix-harness-requirements_v1.2.md:329-341; docs/governance/helix-harness-requirements_v1.2.md:405-407 | E01／claude-opus |
| `RF01-019` | 通常の自動チーム生成器は、難易度がcriticalの場合、受入・回帰被覆を検証するqa memberを追加し、tlの後に実行する。 | lane_delegation | config | n/a | claude-qaとserialize_after=tl | `RUL-OSA-01` | src/team/launch-policy.ts:99-108 | F01／claude-opus |
| `RG12-002` | Codexは、要件定義以降の自動推進engineとしてL3以降の実行を担う際、UIデザインをその担当範囲から除外する。 | lane_delegation | prose | n/a | Codexを自動実行側とする旧W-agentの役割分担 | `RUL-OSP-02` | docs/governance/infinity-loop-source-capability-ledger.md:123-124 | G12／claude-opus |

## 副として対応づいた規則（55件）

`RA-117`、`RA-123`、`RA-136`、`RA-145`、`RA-146`、`RA-147`、`RA-159`、`RA-180`、`RA-278`、`RA-279`、`RA-280`、`RA-303`、`RA-344`、`RA-347`、`RB0-069`、`RB0-177`、`RB04-017`、`RB04-051`、`RB04-052`、`RB04-094`、`RB04-112`、`RB04-140`、`RB04-142`、`RB04-156`、`RB04-168`、`RB04-180`、`RB04-191`、`RB04-193`、`RB04-239`、`RB04-286`、`RB05-041`、`RB05-103`、`RB06-311`、`RB08-272`、`RB08-291`、`RC00-195`、`RC04-116`、`RC04-117`、`RC04-179`、`RC04-227`、`RD00-020`、`RD02-133`、`RD02-150`、`RD03-070`、`RD03-088`、`RD10-082`、`RE01-112`、`RE01-156`、`RF01-015`、`RF01-020`、`RG16-001`、`RG16-002`、`RG16-010`、`RG31-015`、`RG42-020`
