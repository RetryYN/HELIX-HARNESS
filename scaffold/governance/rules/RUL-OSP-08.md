---
status: scaffold
authority_effect: none
generated_by: scaffold/governance/tools/gen_rulebook.py
source_candidate: docs/governance/candidates/legacy-rule-derived-requirements.md
source_candidate_sha256: 1467f96bd6068028e8950b1a4ae265fa2474c9cb3dfaf442b7ba2b43fe670c80
source_inventory: docs/governance/legacy-rule-atom-inventory.jsonl
source_inventory_sha256: 78d14197ae48bc7eefb6f8c6836902fde2c20842952c8e702654492efcde0b92
rule_id: RUL-OSP-08
group: OS推進
product: OS
atoms_primary: 28
atoms_secondary: 7
issue_projection: #1859
---

# RUL-OSP-08（OS推進／OS）

仮のルール。正本は[要求候補](../../../docs/governance/candidates/legacy-rule-derived-requirements.md)であり、本fileはその機械的な写しである。採否・承認・完了を生成しない。

## 要求

作業に応じてskillと参照資料を選び、読み込む量を制限する。skillの起動条件、手順の厳密さ、検証loop、重複の排除を設計する。

## 主として対応づいた規則（28件）

| atom | 規則 | 種類 | 強制 | 失敗時 | 旧実装固有の部分 | 副 | 出どころ | 由来 |
|---|---|---|---|---|---|---|---|---|
| `RA-010` | エージェントはmigration資料を通常startupで読まず、移行・gap監査・退行源調査が必要な場合だけ読む。 | memory_context | prose | n/a | docs/migration/ | — | AGENTS.md:88-89; CLAUDE.md:34-35 | A／gpt-6-astra |
| `RA-016` | エージェントは関連するcontextとtriggerに合うSKILL.mdだけを読み、全skillsを一括読込しない。 | memory_context | prose | n/a | — | — | AGENTS.md:277-278; CLAUDE.md:107-107 | A／gpt-6-astra |
| `RA-017` | エージェントはskillのreferencesをskill directory相対で解決する。 | memory_context | prose | n/a | — | — | AGENTS.md:279-279 | A／gpt-6-astra |
| `RA-355` | /build実行者はincremental-implementationを、/code-simplifyはrefactoringを、/sdd-planはplanning-and-task-breakdownとgate-planningを使う。 | behavior_discipline | prose | n/a | 旧commandとskill対応 | — | .claude/commands/build.md:7-8; .claude/commands/code-simplify.md:7-8; .claude/commands/sdd-plan.md:7-9 | A／gpt-6-astra |
| `RA-356` | /spec実行者はspec-driven-developmentとdocumentation-and-adrs、/test実行者はTDD・testing・test-thinkingを使う。 | behavior_discipline | prose | n/a | 旧skill群 | — | .claude/commands/spec.md:7-8; .claude/commands/test.md:7-10 | A／gpt-6-astra |
| `RB0-123` | agentはtriggerがactiveな個別skill packだけを読み、全packを一括loadしない。 | memory_context | prose | n/a | helix skill suggest | — | docs/skills/SKILL_MAP.md:14-22 | B／gpt-6-astra |
| `RB0-124` | agentは作業開始時にstatusとskill推奨順位を確認して上位packを読み、PLANがない場合はtrigger表から選ぶ。 | tooling_runtime | prose | n/a | helix status、helix skill suggest --current-location --summary-json | — | docs/skills/SKILL_MAP.md:24-30 | B／gpt-6-astra |
| `RB07-026` | BE専用・DB専用で画面文書を正当に省略するPLANでは、担当者はこの画面検証skillを読まない。 | memory_context | prose | n/a | L2 screen sub-doc | — | docs/skills/browser-testing-and-screen-verification.md:32-32 | B07／gpt-6-astra |
| `RB07-094` | skill作成者は執筆前に裁量を決め、不可逆操作・gate・記録形式は厳密に指定し、探索・review・代替設計は原則と観点を示して手順を固定しない。 | lane_delegation | prose | n/a | — | — | docs/skills/skill-authoring.md:24-33 | B07／gpt-6-astra |
| `RB07-096` | skill作成者は新規packに適合する記述パターンを選び、判断基準・禁止事項・検証可能な証跡アンカーを具体的に示す。 | lane_delegation | prose | n/a | — | — | docs/skills/skill-authoring.md:40-55 | B07／gpt-6-astra |
| `RB07-097` | skill作成者は複雑な多段作業にchecklistと判断記録の出力形式を設け、検証が失敗したら修正・再実行しpassまで進まないloopを明記する。 | lane_delegation | prose | fail_close | — | — | docs/skills/skill-authoring.md:56-61 | B07／gpt-6-astra |
| `RB07-099` | 複雑タスクのskillは3〜5個の小問題へ分解して順に解かせ、判定系では起草から独立した検証質問への回答で結論を照合する。 | lane_delegation | prose | n/a | least-to-most／Chain-of-Verification | — | docs/skills/skill-authoring.md:65-69 | B07／gpt-6-astra |
| `RB07-102` | skill作成者はdescriptionを読む条件として書き、routing tagを実態へ合わせ、詳細参照を一階層に抑える。 | memory_context | prose | n/a | applies_to／drive_models | — | docs/skills/skill-authoring.md:80-84 | B07／gpt-6-astra |
| `RB08-175` | skill管理者は通常sessionの半分未満にしか適用しないskillをstatic read orderから外し、動的にloadする。 | memory_context | prose | n/a | helix skill suggest、50%基準 | — | docs/skills/context-engineering.md:78-82 | B08／gpt-6-astra |
| `RD00-021` | adapterは、taskに対応する思考レンズが得られた場合だけ、そのレンズをpromptへ追加する。 | memory_context | config | n/a | taskLensBrief | — | src/runtime/adapter.ts:810-811 | D00／gpt-6-astra |
| `RD03-091` | summary surface監査は、許可されたfull系field以外に、--summary-jsonを含まず--jsonを含む文字列がある場合、unexpected_raw_json_commandと判定する。 | tooling_runtime | gate | fail_close | full_source_command/full_view_command/full_review_bundle_command/full_inject_commandを除外。 | — | src/runtime/summary-surface-audit.ts:69-74; src/runtime/summary-surface-audit.ts:537-546; src/runtime/summary-surface-audit.ts:629-636 | D03／gpt-6-astra |
| `RD10-179` | skill quality lintは正規化本文の16文字shingle共有率が小さい側の集合に対して0.35を超える場合に失敗させる。 | tooling_runtime | lint | fail_close | 空白・記号・数字除去、閾値0.35 | `RUL-OSA-06` | src/lint/skill-quality.ts:103-126; src/lint/skill-quality.ts:187-200 | D10／gpt-6-astra |
| `RD10-182` | skill quality lintはfrontmatter除去後の本文が1200文字未満、または「## 」見出しが2節未満なら失敗させる。 | tooling_runtime | lint | fail_close | 1200文字・2節の固定下限 | `RUL-OSA-06` | src/lint/skill-quality.ts:230-239 | D10／gpt-6-astra |
| `RE01-127` | skill注入処理は関連するmanifest・path・推薦理由だけをstdinへ渡し、argvや全skill本文の一括注入を使用しない。 | memory_context | prose | n/a | skill prompt注入方式 | `RUL-OSP-03` | docs/governance/helix-harness-requirements_v1.2.md:1808-1812 | E01／claude-opus |
| `RF01-002` | pair-agentは、工程出力を前後の空白除去後に4000文字まで記録し、超過する場合は末尾を切り捨てて切詰めマーカーを付ける。 | memory_context | gate | n/a | 4000文字と[truncated]マーカー | `RUL-COR-08` | src/orchestration/pair-agent.ts:174-178; src/orchestration/pair-agent.ts:636-640 | F01／claude-opus |
| `RF01-003` | pair-agentは、後続工程のpromptへtranscriptを注入する場合、直近6件だけを含める。 | memory_context | gate | n/a | PAIR TRANSCRIPTと直近6件の固定上限 | — | src/orchestration/pair-agent.ts:180-200 | F01／claude-opus |
| `RF01-010` | context合成器は、required・optionalのskill pathがともに空で、呼出面policy適用後のmemoryLinesも空の場合、注入sectionを生成しない。 | memory_context | gate | n/a | AdapterContextInjectionの代わりにundefinedを返す方式 | — | src/runtime/memory-injection.ts:33-36 | F01／claude-opus |
| `RG01-013` | /shipのqa-test担当は、test-driven-development skillを参照する。 | tooling_runtime | prose | n/a | 旧test-driven-development skill | `RUL-FRM-05` | .claude/commands/ship.md:31-32 | G01／claude-opus |
| `RG15-001` | skill recommenderは各packの本文を読まず、frontmatterのapplies_to（layers／drive_models）だけを読んでPLANに対するscoreを算出する。 | tooling_runtime | config | n/a | helix skill suggest --plan <path> | — | docs/skills/SKILL_MAP.md:20-22 | G15／claude-opus |
| `RG18-004` | agent文書の作成者は普遍原則を判断コアへ集約し、個別agent本文には役割固有の差分だけを書く。「判断コア」節は5行以内とし、普遍原則やレビュー5軸節を再記述・全文コピーしてはならない。 | memory_context | prose | n/a | agent本文の「判断コア」節 | `RUL-OSI-02` | docs/skills/judgment-core.md:42-44; docs/skills/judgment-core.md:132-133; docs/skills/judgment-core.md:183-183 | G18／claude-opus |
| `RG19-004` | スキル作成者はself-consistencyによる多数決を低頻度で高stakesの判断に限定し、適用時は異なる根拠から3回独立に判定させる。 | behavior_discipline | prose | n/a | — | `RUL-OSP-02` | docs/skills/skill-authoring.md:70-71 | G19／claude-opus |
| `RG20-002` | 検証者はForward/Add-featureがlayer groupを完了してdescent verification cycleが発火した場合、doctorがdescent/orphan findingで非ゼロ終了した場合、vmodel lintが未充足obligationを報告した場合、Scrum S3が完全性証拠を要する場合、またはRecoveryでgap close証明が要る場合に、verification skillを読む。 | process_gate | prose | n/a | helix doctor / helix vmodel lint コマンド名 | `RUL-FRM-05` | docs/skills/verification.md:34-40 | G20／claude-opus |
| `RG45-007` | tool拡張registryは、task lensを1つも検出できない場合に絞り込みを行わず全toolを候補として返す。 | tooling_runtime | prose | fail_open | task-lens 検出器 | — | src/runtime/tool-augmentation-registry.ts:116-122 | G45／claude-opus |

## 副として対応づいた規則（7件）

`RE01-123`、`RE01-140`、`RE01-209`、`RG01-011`、`RG15-002`、`RG18-014`、`RG20-001`
