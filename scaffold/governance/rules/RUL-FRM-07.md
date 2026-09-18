---
status: scaffold
authority_effect: none
generated_by: scaffold/governance/tools/gen_rulebook.py
source_candidate: docs/governance/candidates/legacy-rule-derived-requirements.md
source_candidate_sha256: 1c9891cbf76d7a28a6cf64b75e907e6ddad41c0aac5c9fa0a9196421211407a5
source_inventory: docs/governance/legacy-rule-atom-inventory.jsonl
source_inventory_sha256: e265b57e50d4c0f2f161c89a7dadbde12738bd84eab21de3fb5745d7741ef125
rule_id: RUL-FRM-07
group: 枠
product: HARNESS
atoms_primary: 40
atoms_secondary: 15
issue_projection: #1858
---

# RUL-FRM-07（枠／HARNESS）

仮のルール。正本は[要求候補](../../../docs/governance/candidates/legacy-rule-derived-requirements.md)であり、本fileはその機械的な写しである。採否・承認・完了を生成しない。

## 要求

文書の言語と可読性を定める。人間向けの文は日本語、主語を明示、1文1主張、文字化けや不正な文字を検査する。

## 主として対応づいた規則（40件）

| atom | 規則 | 種類 | 強制 | 出どころ |
|---|---|---|---|---|
| `RA-001` | エージェントはPOへの報連相を日本語で行い、見出し・箇条書きラベルも日本語を優先する。 | doc_language | prose | AGENTS.md:29-32; CLAUDE.md:113-115; .claude/CLAUDE.md:18-19 |
| `RA-002` | エージェントは人間向け成果物の説明・判断・受入条件・レビュー記録を日本語で書き、編集範囲の英語説明も段階的に日本語へ直す。 | doc_language | prose | AGENTS.md:39-42; CLAUDE.md:119-122; .claude/CLAUDE.md:19-19 |
| `RA-004` | design-language検査は人間向け文書の英語prose debtがbaselineから増えていないことを検査する。 | doc_language | doctor／gate | AGENTS.md:44-46; CLAUDE.md:124-126 |
| `RB06-227` | 変更者は人間向けproseを日本語で維持し、機械識別子をcutover readiness前に部分改名しない。 | doc_language | prose／gate | docs/governance/helix-objective-evidence-audit.md:52-52 |
| `RB06-282` | 作成者はPLAN・ADR・TS・test設計の指定命名規約に従い、ファイル名を英語にして日本語名を使わない。 | doc_language | prose | docs/governance/repository-structure.md:133-138 |
| `RB06-315` | 文書作成者は新規の人間向けproseを日本語で維持する。 | doc_language | prose／gate | docs/governance/helix-l0-l8-design-consistency-audit.md:140-141 |
| `RB07-014` | 担当者は文字化けを検出した場合、損失変換からの復元を試みず、文字化け導入前のGit履歴から復元する。 | doc_language | prose／doctor | docs/skills/debugging-and-error-recovery.md:135-136 |
| `RB07-103` | skill作成者は不要な背景説明を削って手順と規則を残し、本文を日本語で書く。 | doc_language | prose／gate | docs/skills/skill-authoring.md:85-87 |
| `RB07-237` | 設計者は一要件IDを一つの検証可能な文にし、複数挙動を含む要件を分割する。 | behavior_discipline | prose | docs/skills/design-tailoring.md:65-67 |
| `RB08-044` | 文書作成者はactorを明示して能動態で書く。 | doc_language | prose | docs/skills/documentation.md:49-50 |
| `RB08-045` | 文書作成者はcode blockを現行codebaseで動くcommand・outputにし、擬似コードにはその旨を表示する。 | doc_language | prose | docs/skills/documentation.md:51-52 |
| `RB08-047` | 文書作成者はUTF-8 BOMなしで保存し、外部editorを経た文書をcommit前に文字化けmarker検査する。破損時は非可逆な文字修復をせず最後の正常revisionから復元する。 | doc_language | prose | docs/skills/documentation.md:55-56; docs/skills/documentation.md:85-94 |
| `RB08-048` | README作成者は目的・前提条件・quick start・主要command・代表的failureと対処を最低限含める。 | doc_language | prose | docs/skills/documentation.md:58-66 |
| `RB08-050` | 破壊的command変更の担当者は旧説明を黙って置換せず、Migration節に移行注記を追加する。 | doc_language | prose | docs/skills/documentation.md:82-83 |
| `RB08-065` | 設計書作成者は1文1主張でactorを明示し、gate条件を実行可能な契約として書く。 | doc_language | prose | docs/skills/documentation-and-adrs.md:51-53 |
| `RB08-066` | 設計書作成者は用語をglossary・doctor・rule-driftの表記へ揃え、参照先が不明な代名詞を使わない。 | doc_language | prose | docs/skills/documentation-and-adrs.md:54-56; docs/skills/documentation-and-adrs.md:63-63 |
| `RB08-067` | freeze担当者は文字化けがなく、目的が5文以下で、Scope/Non-goalsが存在し、裸のTODOにPLAN参照があることを確認する。 | process_gate | prose | docs/skills/documentation-and-adrs.md:58-64; docs/skills/documentation-and-adrs.md:85-90 |
| `RB08-072` | 図の作成者は図を版管理成果物として扱い、本文と同じfreeze可読性確認を通す。 | doc_language | prose | docs/skills/design-doc.md:20-21 |
| `RB08-075` | 図の作成者はfreeze前にcaption・正常compile・用語一致を確認し、判断内容は本文にも記す。Reverse R2図にはas-is表示と日付を付ける。 | doc_language | prose | docs/skills/design-doc.md:79-86 |
| `RC0-106` | design-languageは、除外規則適用後の英語見出し・proseの違反件数がbaselineを超える場合、または所定条件でfingerprintが変化した場合に失敗する。既定baselineは0件である。 | doc_language | lint／ci | src/lint/design-language.ts:34-74; src/lint/design-language.ts:211-305; .github/workflows/harness-check.yml:218-221 |
| `RC01-145` | readabilityは、対象文書にUnicode置換文字U+FFFDを検出した場合、不合格にする。 | doc_language | lint | src/lint/readability.ts:22-24; src/lint/readability.ts:57-66 |
| `RC01-146` | readabilityは、対象文書にASCII英字の直前のU+2001を検出した場合、不合格にする。 | doc_language | lint | src/lint/readability.ts:24-24; src/lint/readability.ts:57-66 |
| `RC01-147` | readabilityは、対象文書に半角カナまたは半角句読点のU+FF61〜U+FF9Fを検出した場合、不合格にする。 | doc_language | lint | src/lint/readability.ts:25-29; src/lint/readability.ts:57-66 |
| `RC01-148` | readabilityは、対象文書に列挙されたCP932文字化け兆候の漢字patternを検出した場合、不合格にする。 | doc_language | lint | src/lint/readability.ts:30-36; src/lint/readability.ts:57-66 |
| `RC02-056` | doctorのdesign-language checkは、既存言語lintの判定に加えて、検査対象が0件の場合や文書読込失敗の場合にも失敗する。 | doc_language | doctor | src/doctor/index.ts:1446-1465 |
| `RC02-121` | doctorのreadability checkは、文書可読性検査が不合格、検査対象0件、または文書読込不能の場合に失敗する。 | doc_language | doctor | src/doctor/index.ts:5306-5322 |
| `RC02-122` | doctorのruntime-readability checkは、runtime成果物の文字化け検査が不合格、root不在、または読込不能の場合に失敗する。runtime成果物が存在しない場合は対象0件を理由に失敗させない。 | doc_language | doctor | src/doctor/index.ts:5324-5351 |
| `RD05-073` | completion-decision-packetは、requiredActionJaがrequiredActionの所定の日本語変換結果と一致しない場合、失敗させる。 | doc_language | lint | src/lint/completion-decision-packet.ts:585-591 |
| `RD05-074` | completion-decision-packetは、requiredActionsJaとrequiredActionsの件数が一致しない場合、失敗させる。 | doc_language | lint | src/lint/completion-decision-packet.ts:592-599 |
| `RD05-075` | completion-decision-packetは、requiredActionsJaの各要素が対応actionの日本語変換結果に一致しない場合、失敗させる。 | doc_language | lint | src/lint/completion-decision-packet.ts:600-608 |
| `RD05-076` | completion-decision-packetは、requiredEvidenceJaとrequiredEvidenceの件数が一致しない場合、失敗させる。 | doc_language | lint | src/lint/completion-decision-packet.ts:609-616 |
| `RD05-077` | completion-decision-packetは、requiredEvidenceJaの各要素が対応evidenceの日本語変換結果に一致しない場合、失敗させる。 | doc_language | lint | src/lint/completion-decision-packet.ts:617-625 |
| `RD05-078` | completion-decision-packetは、requiredEvidenceJaの各要素に日本語文字が含まれない場合、失敗させる。 | doc_language | lint | src/lint/completion-decision-packet.ts:25-25; src/lint/completion-decision-packet.ts:626-631 |
| `RD05-093` | completion-decision-packetは、補助summaryのreviewRouteJaがreviewRouteの所定の日本語変換結果と一致しない場合、失敗させる。 | doc_language | lint | src/lint/completion-decision-packet.ts:778-784 |
| `RD05-095` | completion-decision-packetは、decisionのnextWorkflowRouteJaがnextWorkflowRouteの日本語変換結果と一致しない場合、失敗させる。 | doc_language | lint | src/lint/completion-decision-packet.ts:797-804 |
| `RD05-125` | completion-decision-packetは、templateのinsertionHintJaが空・placeholder、または日本語文字を含まない場合、失敗させる。 | doc_language | lint | src/lint/completion-decision-packet.ts:1123-1132 |
| `RD05-127` | completion-decision-packetは、templateのyamlLinesJaが非配列または空の場合、失敗させる。 | doc_language | lint | src/lint/completion-decision-packet.ts:1140-1145 |
| `RD05-130` | completion-decision-packetは、yamlLinesJaの本文に日本語文字がない場合、失敗させる。 | doc_language | lint | src/lint/completion-decision-packet.ts:1161-1166 |
| `RD05-140` | completion-review-bundleは、decision packetが要求する日本語actionのいずれかがrequiredOperatorActionsJaに欠ける場合、失敗させる。 | doc_language | lint | src/lint/completion-decision-packet.ts:2015-2025 |
| `RG19-003` | doctorのreadability gateは、半角カナまたはU+FFFD置換文字を検出した場合にfail-closeする。 | doc_language | doctor | docs/skills/security-and-hardening.md:88-90 |

## 副として対応づいた規則（15件）

`RA-219`、`RA-233`、`RA-253`、`RB07-054`、`RB07-131`、`RB07-151`、`RB07-220`、`RB08-069`、`RB08-071`、`RB08-086`、`RB08-087`、`RC00-177`、`RC02-140`、`RC02-146`、`RC04-239`
