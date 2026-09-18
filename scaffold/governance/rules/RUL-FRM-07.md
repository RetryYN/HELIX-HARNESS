---
status: scaffold
authority_effect: none
generated_by: scaffold/governance/tools/gen_rulebook.py
source_candidate: docs/governance/candidates/legacy-rule-derived-requirements.md
source_candidate_sha256: 386e4083f1a47c2d09ea75ea774772421a44b6f5dd9eaa331d6ea773cd683ffa
source_inventory: docs/governance/legacy-rule-atom-inventory.jsonl
source_inventory_sha256: 97a9e0a4cfd5999f5178ec13f758ef71c334191aac51ed43c3bb9570bd762784
rule_id: RUL-FRM-07
group: 枠
product: HARNESS
atoms_primary: 46
atoms_secondary: 18
issue_projection: #1858
---

# RUL-FRM-07（枠／HARNESS）

仮のルール。正本は[要求候補](../../../docs/governance/candidates/legacy-rule-derived-requirements.md)であり、本fileはその機械的な写しである。採否・承認・完了を生成しない。

## 要求

文書の言語と可読性を定める。人間向けの文は日本語、主語を明示、1文1主張、文字化けや不正な文字を検査する。

## 主として対応づいた規則（46件）

| atom | 規則 | 種類 | 強制 | 失敗時 | 旧実装固有の部分 | 副 | 出どころ | 由来 |
|---|---|---|---|---|---|---|---|---|
| `RA-001` | エージェントはPOへの報連相を日本語で行い、見出し・箇条書きラベルも日本語を優先する。 | doc_language | prose | n/a | — | — | AGENTS.md:29-32; CLAUDE.md:113-115; .claude/CLAUDE.md:18-19 | A／gpt-6-astra |
| `RA-002` | エージェントは人間向け成果物の説明・判断・受入条件・レビュー記録を日本語で書き、編集範囲の英語説明も段階的に日本語へ直す。 | doc_language | prose | n/a | — | — | AGENTS.md:39-42; CLAUDE.md:119-122; .claude/CLAUDE.md:19-19 | A／gpt-6-astra |
| `RA-004` | design-language検査は人間向け文書の英語prose debtがbaselineから増えていないことを検査する。 | doc_language | doctor／gate | n/a | helix doctor design-language、旧baseline | `RUL-OSA-06` | AGENTS.md:44-46; CLAUDE.md:124-126 | A／gpt-6-astra |
| `RB06-227` | 変更者は人間向けproseを日本語で維持し、機械識別子をcutover readiness前に部分改名しない。 | doc_language | prose／gate | fail_close | design-language、PLAN-M-02 | `RUL-OSM-07` | docs/governance/helix-objective-evidence-audit.md:52-52 | B06／gpt-6-astra |
| `RB06-282` | 作成者はPLAN・ADR・TS・test設計の指定命名規約に従い、ファイル名を英語にして日本語名を使わない。 | doc_language | prose | n/a | PLAN-NNN-slug、ADR-NNN-slug、*.test.ts | — | docs/governance/repository-structure.md:133-138 | B06／gpt-6-astra |
| `RB06-315` | 文書作成者は新規の人間向けproseを日本語で維持する。 | doc_language | prose／gate | n/a | design-language | — | docs/governance/helix-l0-l8-design-consistency-audit.md:140-141 | B06／gpt-6-astra |
| `RB07-014` | 担当者は文字化けを検出した場合、損失変換からの復元を試みず、文字化け導入前のGit履歴から復元する。 | doc_language | prose／doctor | n/a | doctor readability | — | docs/skills/debugging-and-error-recovery.md:135-136 | B07／gpt-6-astra |
| `RB07-103` | skill作成者は不要な背景説明を削って手順と規則を残し、本文を日本語で書く。 | doc_language | prose／gate | n/a | design-language gate | — | docs/skills/skill-authoring.md:85-87 | B07／gpt-6-astra |
| `RB07-237` | 設計者は一要件IDを一つの検証可能な文にし、複数挙動を含む要件を分割する。 | behavior_discipline | prose | n/a | — | `RUL-FRM-05` | docs/skills/design-tailoring.md:65-67 | B07／gpt-6-astra |
| `RB08-044` | 文書作成者はactorを明示して能動態で書く。 | doc_language | prose | n/a | — | — | docs/skills/documentation.md:49-50 | B08／gpt-6-astra |
| `RB08-045` | 文書作成者はcode blockを現行codebaseで動くcommand・outputにし、擬似コードにはその旨を表示する。 | doc_language | prose | n/a | — | — | docs/skills/documentation.md:51-52 | B08／gpt-6-astra |
| `RB08-047` | 文書作成者はUTF-8 BOMなしで保存し、外部editorを経た文書をcommit前に文字化けmarker検査する。破損時は非可逆な文字修復をせず最後の正常revisionから復元する。 | doc_language | prose | n/a | U+FF61-FF9F、U+FFFDの旧判定 | — | docs/skills/documentation.md:55-56; docs/skills/documentation.md:85-94 | B08／gpt-6-astra |
| `RB08-048` | README作成者は目的・前提条件・quick start・主要command・代表的failureと対処を最低限含める。 | doc_language | prose | n/a | Node.js/npm/helix | — | docs/skills/documentation.md:58-66 | B08／gpt-6-astra |
| `RB08-050` | 破壊的command変更の担当者は旧説明を黙って置換せず、Migration節に移行注記を追加する。 | doc_language | prose | n/a | — | — | docs/skills/documentation.md:82-83 | B08／gpt-6-astra |
| `RB08-065` | 設計書作成者は1文1主張でactorを明示し、gate条件を実行可能な契約として書く。 | doc_language | prose | n/a | — | `RUL-FRM-06` | docs/skills/documentation-and-adrs.md:51-53 | B08／gpt-6-astra |
| `RB08-066` | 設計書作成者は用語をglossary・doctor・rule-driftの表記へ揃え、参照先が不明な代名詞を使わない。 | doc_language | prose | n/a | L0 glossary、rule-drift | `RUL-FRM-06` | docs/skills/documentation-and-adrs.md:54-56; docs/skills/documentation-and-adrs.md:63-63 | B08／gpt-6-astra |
| `RB08-067` | freeze担当者は文字化けがなく、目的が5文以下で、Scope/Non-goalsが存在し、裸のTODOにPLAN参照があることを確認する。 | process_gate | prose | fail_close | 旧文字化けmarker | `RUL-FRM-02` | docs/skills/documentation-and-adrs.md:58-64; docs/skills/documentation-and-adrs.md:85-90 | B08／gpt-6-astra |
| `RB08-072` | 図の作成者は図を版管理成果物として扱い、本文と同じfreeze可読性確認を通す。 | doc_language | prose | n/a | — | `RUL-FRM-02` | docs/skills/design-doc.md:20-21 | B08／gpt-6-astra |
| `RB08-075` | 図の作成者はfreeze前にcaption・正常compile・用語一致を確認し、判断内容は本文にも記す。Reverse R2図にはas-is表示と日付を付ける。 | doc_language | prose | fail_close | L0 glossary、R2 | `RUL-FRM-06`、`RUL-REV-01` | docs/skills/design-doc.md:79-86 | B08／gpt-6-astra |
| `RC0-106` | design-languageは、除外規則適用後の英語見出し・proseの違反件数がbaselineを超える場合、または所定条件でfingerprintが変化した場合に失敗する。既定baselineは0件である。 | doc_language | lint／ci | fail_close | DESIGN_LANGUAGE_BASELINE／英語語数threshold | `RUL-OSA-06` | src/lint/design-language.ts:34-74; src/lint/design-language.ts:211-305; .github/workflows/harness-check.yml:218-221 | C／gpt-6-astra |
| `RC01-145` | readabilityは、対象文書にUnicode置換文字U+FFFDを検出した場合、不合格にする。 | doc_language | lint | fail_close | 文書・freeze・runtime向けloaderで同一analyzerを使用 | — | src/lint/readability.ts:22-24; src/lint/readability.ts:57-66 | C01／gpt-6-astra |
| `RC01-146` | readabilityは、対象文書にASCII英字の直前のU+2001を検出した場合、不合格にする。 | doc_language | lint | fail_close | em-space-before-ascii | — | src/lint/readability.ts:24-24; src/lint/readability.ts:57-66 | C01／gpt-6-astra |
| `RC01-147` | readabilityは、対象文書に半角カナまたは半角句読点のU+FF61〜U+FF9Fを検出した場合、不合格にする。 | doc_language | lint | fail_close | 半角日本語をCP932文字化け兆候として扱う | — | src/lint/readability.ts:25-29; src/lint/readability.ts:57-66 | C01／gpt-6-astra |
| `RC01-148` | readabilityは、対象文書に列挙されたCP932文字化け兆候の漢字patternを検出した場合、不合格にする。 | doc_language | lint | fail_close | MOJIBAKE_MARKERSの固定漢字集合 | — | src/lint/readability.ts:30-36; src/lint/readability.ts:57-66 | C01／gpt-6-astra |
| `RC02-056` | doctorのdesign-language checkは、既存言語lintの判定に加えて、検査対象が0件の場合や文書読込失敗の場合にも失敗する。 | doc_language | doctor | fail_close | r.checked > 0 && r.okというdoctor側追加条件 | `RUL-OSA-06`、`RUL-COR-04` | src/doctor/index.ts:1446-1465 | C02／gpt-6-astra |
| `RC02-121` | doctorのreadability checkは、文書可読性検査が不合格、検査対象0件、または文書読込不能の場合に失敗する。 | doc_language | doctor | fail_close | loadSystemReadabilityDocs、r.checked > 0 | `RUL-OSA-06`、`RUL-COR-04` | src/doctor/index.ts:5306-5322 | C02／gpt-6-astra |
| `RC02-122` | doctorのruntime-readability checkは、runtime成果物の文字化け検査が不合格、root不在、または読込不能の場合に失敗する。runtime成果物が存在しない場合は対象0件を理由に失敗させない。 | doc_language | doctor | fail_close | .helix/auditのMarkdownとhandoverのJSONを含むruntime成果物 | `RUL-OSA-06`、`RUL-COR-04` | src/doctor/index.ts:5324-5351 | C02／gpt-6-astra |
| `RD05-073` | completion-decision-packetは、requiredActionJaがrequiredActionの所定の日本語変換結果と一致しない場合、失敗させる。 | doc_language | lint | fail_close | workflowActionTextJa | `RUL-COR-04` | src/lint/completion-decision-packet.ts:585-591 | D05／gpt-6-astra |
| `RD05-074` | completion-decision-packetは、requiredActionsJaとrequiredActionsの件数が一致しない場合、失敗させる。 | doc_language | lint | fail_close | 日本語action配列 | `RUL-COR-04` | src/lint/completion-decision-packet.ts:592-599 | D05／gpt-6-astra |
| `RD05-075` | completion-decision-packetは、requiredActionsJaの各要素が対応actionの日本語変換結果に一致しない場合、失敗させる。 | doc_language | lint | fail_close | workflowActionTextJa | `RUL-COR-04` | src/lint/completion-decision-packet.ts:600-608 | D05／gpt-6-astra |
| `RD05-076` | completion-decision-packetは、requiredEvidenceJaとrequiredEvidenceの件数が一致しない場合、失敗させる。 | doc_language | lint | fail_close | 日本語evidence配列 | `RUL-COR-04` | src/lint/completion-decision-packet.ts:609-616 | D05／gpt-6-astra |
| `RD05-077` | completion-decision-packetは、requiredEvidenceJaの各要素が対応evidenceの日本語変換結果に一致しない場合、失敗させる。 | doc_language | lint | fail_close | workflowEvidenceTextJa | `RUL-COR-04` | src/lint/completion-decision-packet.ts:617-625 | D05／gpt-6-astra |
| `RD05-078` | completion-decision-packetは、requiredEvidenceJaの各要素に日本語文字が含まれない場合、失敗させる。 | doc_language | lint | fail_close | ひらがな・カタカナ・漢字の正規表現 | — | src/lint/completion-decision-packet.ts:25-25; src/lint/completion-decision-packet.ts:626-631 | D05／gpt-6-astra |
| `RD05-093` | completion-decision-packetは、補助summaryのreviewRouteJaがreviewRouteの所定の日本語変換結果と一致しない場合、失敗させる。 | doc_language | lint | fail_close | workflowReviewRouteTextJa | `RUL-COR-04` | src/lint/completion-decision-packet.ts:778-784 | D05／gpt-6-astra |
| `RD05-095` | completion-decision-packetは、decisionのnextWorkflowRouteJaがnextWorkflowRouteの日本語変換結果と一致しない場合、失敗させる。 | doc_language | lint | fail_close | workflowRouteTextJa | `RUL-COR-04` | src/lint/completion-decision-packet.ts:797-804 | D05／gpt-6-astra |
| `RD05-125` | completion-decision-packetは、templateのinsertionHintJaが空・placeholder、または日本語文字を含まない場合、失敗させる。 | doc_language | lint | fail_close | insertionHintJaの日本語正規表現 | `RUL-COR-04` | src/lint/completion-decision-packet.ts:1123-1132 | D05／gpt-6-astra |
| `RD05-127` | completion-decision-packetは、templateのyamlLinesJaが非配列または空の場合、失敗させる。 | doc_language | lint | fail_close | yamlLinesJa | `RUL-COR-04` | src/lint/completion-decision-packet.ts:1140-1145 | D05／gpt-6-astra |
| `RD05-130` | completion-decision-packetは、yamlLinesJaの本文に日本語文字がない場合、失敗させる。 | doc_language | lint | fail_close | 日本語文字の存在検査 | — | src/lint/completion-decision-packet.ts:1161-1166 | D05／gpt-6-astra |
| `RD05-140` | completion-review-bundleは、decision packetが要求する日本語actionのいずれかがrequiredOperatorActionsJaに欠ける場合、失敗させる。 | doc_language | lint | fail_close | requiredActionsJaの重複排除集合 | `RUL-COR-04` | src/lint/completion-decision-packet.ts:2015-2025 | D05／gpt-6-astra |
| `RG19-003` | doctorのreadability gateは、半角カナまたはU+FFFD置換文字を検出した場合にfail-closeする。 | doc_language | doctor | fail_close | helix doctor readability gate | `RUL-OSA-06` | docs/skills/security-and-hardening.md:88-90 | G19／claude-opus |
| `RG25-003` | design-languageは、README系ファイルと生成物扱いの文書（docs/archive/intake配下、日付付きsession-handover、docs/archive/handover配下）を人間向けdocsの検査対象から除外する。 | doc_language | doctor／lint | n/a | isReadmeLike / isGeneratedDoc と DESIGN_LANGUAGE_ROOTS | — | src/lint/design-language.ts:120-140 | G25／claude-opus |
| `RG25-004` | design-languageは、コード塊・frontmatter・構造化record・表区切り・日本語を含む行を除いたうえで、技術語allowlistを除く英語語が見出しで2語以上、本文で4語以上ある行を英語prose違反とする。 | doc_language | doctor／lint | fail_close | TECHNICAL_WORD_ALLOWLIST と 見出し2語／prose4語の閾値 | — | src/lint/design-language.ts:82-114; src/lint/design-language.ts:211-230; src/lint/design-language.ts:271-288 | G25／claude-opus |
| `RG25-005` | design-languageがbaseline件数据え置きでfingerprint変化を検出した場合、既存の英語proseを別の英語proseへ差し替えて回避してはならず、日本語化でdebtを減らすかbaseline fingerprint更新PLANを通さなければならない。 | doc_language | doctor／prose | fail_close | DESIGN_LANGUAGE_BASELINE_FINGERPRINT と fingerprintDrift 判定 | `RUL-OSA-06` | src/lint/design-language.ts:292-296; src/lint/design-language.ts:333-337 | G25／claude-opus |
| `RG32-009` | readabilityのシステム帯は、docs/配下全体とCLAUDE.md・AGENTS.md・.claude/CLAUDE.mdを対象とし、README系ファイル、vendor source snapshot、legacy local stateは対象外とする。 | doc_language | lint | n/a | ROOT_READABILITY_DOCS | — | src/lint/readability.ts:98-122 | G32／claude-opus |
| `RG32-010` | runtime readabilityは、.helix/audit配下のmarkdownと.helix/handover配下のJSONも文字化けmarker検査の対象とする。 | doc_language | lint | n/a | .helix/audit, .helix/handover | — | src/lint/readability.ts:137-166 | G32／claude-opus |
| `RG40-005` | 文書metadata整形器は、frontmatter内に既存のdocument_agent blockがあればそれを置換し、無ければfrontmatterの先頭へ挿入する。 | doc_language | prose | fail_close | document_agent: というYAML key | — | src/runtime/document-agent-metadata-apply.ts:82-93 | G40／claude-opus |

## 副として対応づいた規則（18件）

`RA-219`、`RA-233`、`RA-253`、`RB07-054`、`RB07-131`、`RB07-151`、`RB07-220`、`RB08-069`、`RB08-071`、`RB08-086`、`RB08-087`、`RC00-177`、`RC02-140`、`RC02-146`、`RC04-239`、`RG40-004`、`RG40-011`、`RG45-020`
