---
status: scaffold
authority_effect: none
generated_by: scaffold/governance/tools/gen_rulebook.py
source_candidate: docs/governance/candidates/legacy-rule-derived-requirements.md
source_candidate_sha256: fa4ac4b7a3e9e4f70e0dc4d83926036bc38b60b1920256405e48a51e0151834c
source_inventory: docs/governance/legacy-rule-atom-inventory.jsonl
source_inventory_sha256: e265b57e50d4c0f2f161c89a7dadbde12738bd84eab21de3fb5745d7741ef125
rule_id: RUL-FRM-08
group: 枠
product: HARNESS
atoms_primary: 29
atoms_secondary: 12
issue_projection: #1858
---

# RUL-FRM-08（枠／HARNESS）

仮のルール。正本は[要求候補](../../../docs/governance/candidates/legacy-rule-derived-requirements.md)であり、本fileはその機械的な写しである。採否・承認・完了を生成しない。

## 要求

要求の書き方を定める。機能要求の必須属性と受入条件、非機能要求の分類と等級、優先度、識別子の欠番の扱い、原子化しても利用者価値を失わないこと、画面設計で作る成果物。

## 主として対応づいた規則（29件）

| atom | 規則 | 種類 | 強制 | 失敗時 | 旧実装固有の部分 | 副 | 出どころ | 由来 |
|---|---|---|---|---|---|---|---|---|
| `RA-244` | L1/L2 gap検査は最大3roundとし、入力・表示・異常系・権限・状態遷移・データ生命周期・NFR・外部依存を確認する。 | process_gate | config | n/a | l1L2GapCheck.maxRounds=3 | `RUL-OSP-07` | .helix/config/requirements-binding.yaml:28-62 | A／gpt-6-astra |
| `RB04-055` | 企画者は社内システム・開発基盤の企画段階でROI/KGI/KPI定量化を強制せず、定量指標と受入条件を要求・要件層で定める。 | process_gate | prose | n/a | 旧L0/L1/L3 | `RUL-PLN-01` | docs/governance/helix-harness-concept_v3.1.md:552-552 | B04／gpt-6-astra |
| `RB04-059` | L1作成者は業務・機能・画面・技術・非機能の5 sub-docへ分割し、表で指定された必須節を満たす。 | process_gate | prose／lint | fail_close | 旧L1 sub-doc構造 | — | docs/governance/helix-harness-concept_v3.1.md:558-573 | B04／gpt-6-astra |
| `RB04-061` | 非機能要求作成者はIPAの6大項目に準拠し、全NFR-IDへIPA分類とISO 25010特性を付け、対象外特性の除外理由を記録する。 | process_gate | prose | n/a | IPA非機能要求グレード2018、旧L1構造 | — | docs/governance/helix-harness-concept_v3.1.md:568-568 | B04／gpt-6-astra |
| `RB04-091` | UIを持つBE/DBは画面一覧・遷移・UI要素を必須とし、wireframeだけを理由付きで省略できる。 | process_gate | prose | n/a | 旧L2、skip_sub_doc | `RUL-FRM-02` | docs/governance/helix-harness-concept_v3.1.md:798-808 | B04／claude_review |
| `RB05-002` | 開発担当は各機能をdocs/features配下の1機能1ファイルで管理し、frontmatterと本文を持たせる。 | process_gate | prose | n/a | docs/features/*.md | `RUL-OSM-09` | docs/governance/audit-framework.md:95-97 | B05／gpt-6-astra |
| `RB05-077` | Update identityとP0/P1/P2 priorityは直交させ、証拠によるpriority変更を認め、P3=Updateという固定対応を正本にしない。 | process_gate | prose | n/a | Update lifecycleのpriorityモデル | — | docs/governance/l3-rebaseline-g3-freeze-packet.md:381-382 | B05／gpt-6-astra |
| `RB08-236` | 要求原子化担当者は親の利用者目的・業務価値・scenario・前後文脈・成功結果・理由を残し、User Task/Business Outcomeの親graphを維持する。 | evidence_claim | prose | n/a | — | `RUL-COR-07` | docs/governance/design-harness-assessment-audit-2026-07-19.md:73-74 | B08／gpt-6-astra |
| `RC04-180` | screen-design検証器は、ia・screens・flow・wireframe・mock・componentsが揃わなければ失敗する。 | process_gate | gate | fail_close | 必須artifactのtruthy検査 | `RUL-OSA-06` | src/workflow/contracts.ts:801-817 | C04／gpt-6-astra |
| `RC04-181` | frontend-design検証器は、visual・tokens・a11y・vrt・uxが揃わなければ失敗する。 | process_gate | gate | fail_close | — | `RUL-OSA-06` | src/workflow/contracts.ts:801-809; src/workflow/contracts.ts:820-825 | C04／gpt-6-astra |
| `RD06-176` | FR registry監査lintは、登録済み最大番号までの1始まり連番に欠番があり、carry・forwardによる説明もない場合、未説明欠番として返す。 | process_gate | lint | n/a | FR-L1の連番 | `RUL-OSA-06` | src/lint/fr-registry-audit.ts:178-185 | D06／gpt-6-astra |
| `RD06-180` | FR registry監査lintは、機能要求の必要inputが空の場合、属性不足として返す。 | process_gate | lint | n/a | FrRow.input | `RUL-OSA-06` | src/lint/fr-registry-audit.ts:194-198 | D06／gpt-6-astra |
| `RD06-181` | FR registry監査lintは、機能要求のoutputが空の場合、属性不足として返す。 | process_gate | lint | n/a | FrRow.output | `RUL-OSA-06` | src/lint/fr-registry-audit.ts:195-198 | D06／gpt-6-astra |
| `RD06-182` | FR registry監査lintは、重要度がP0・P1・P2のいずれでもない場合、属性不正として返す。 | process_gate | lint | n/a | VALID_PRIORITIES | `RUL-OSA-06` | src/lint/fr-registry-audit.ts:23-23; src/lint/fr-registry-audit.ts:196-198 | D06／gpt-6-astra |
| `RD09-111` | proposal-document-coverageは、nfr-qualityを期待するシナリオでnfr_gradeがrequired_evidenceにない場合、失敗させる。 | evidence_claim | lint | fail_close | nfr_grade | `RUL-OSA-06` | src/lint/proposal-document-coverage-policy.ts:59-59; src/lint/proposal-document-coverage.ts:157-166 | D09／gpt-6-astra |
| `RD10-141` | frontier整合lintはcontext efficiencyについて禁止されたHBR-P5表行がL1文書に存在する場合に失敗させる。 | process_gate | lint | fail_close | \| **HBR-P5** \|を禁止しHNFR-P5を期待 | — | src/lint/semantic-frontier-consistency.ts:240-246; src/lint/semantic-frontier-consistency.ts:312-317 | D10／gpt-6-astra |
| `RE01-029` | UIを持つ対象の設計者はdriveにかかわらず規定の三つの画面文書を用意し、fe/fullstack/agentでL2と対応する検証側をskipしてはならない。 | process_gate | lint | fail_close | 旧L2・L10と画面文書分類 | `RUL-FRM-01` | docs/governance/helix-harness-requirements_v1.2.md:493-508 | E01／claude-opus |
| `RE01-037` | FR registryの検証器は参照欠落、説明のないID欠番、必須属性不足、不正priority、宣言件数不一致を失敗にする。 | process_gate | lint | fail_close | FR registry静的検査 | `RUL-OSA-06` | docs/governance/helix-harness-requirements_v1.2.md:591-600 | E01／claude-opus |
| `RE01-038` | 要求作成者は新しいFRを追加した場合、registryの行・trace・件数・ledgerを更新してから受入へ進む。 | process_gate | prose／gate | fail_close | FR registryとledger連動 | `RUL-COR-01` | docs/governance/helix-harness-requirements_v1.2.md:591-600 | E01／claude-opus |
| `RE01-040` | 文書検証器はcarry対象の不足、実在しない画面、宣言件数と実数の不一致を失敗にする。 | evidence_claim | lint | fail_close | doc-carryと画面件数検査 | `RUL-FRM-04` | docs/governance/helix-harness-requirements_v1.2.md:610-619 | E01／claude-opus |
| `RE01-045` | 画面設計者はBR・UXから画面、画面から要求へのtraceを用意する。P0のFRに必要な画面traceがなければ失敗とし、P1/P2の不足は警告する。 | process_gate | lint／gate | fail_close | BR/UX/FRと画面traceのpriority別判定 | `RUL-FRM-01` | docs/governance/helix-harness-requirements_v1.2.md:591-600; docs/governance/helix-harness-requirements_v1.2.md:656-714 | E01／claude-opus |
| `RE01-171` | UI対象の担当者は試作と人間との合意を反復してからL3をfreezeする。非UI対象でも理由・決定者・HEAD・影響・再評価条件を持つN/A receiptを残す。 | process_gate | gate | fail_close | UI/非UI receiptとL3 freeze | `RUL-FRM-02` | docs/governance/helix-harness-requirements_v1.3.md:65-67; docs/governance/helix-harness-requirements_v1.3.md:385-390 | E01／claude-opus |
| `RE01-199` | UX設計者はexperience・UI・frontendの三契約を共通semantic IDで結び、別の層体系・文書体系・汎用verifierを増設しない。 | process_gate | prose | n/a | experience/UI/frontend三契約 | `RUL-COR-07` | docs/governance/helix-harness-requirements_v1.3.md:269-269 | E01／claude-opus |
| `RE01-227` | NFR設計者はplaceholderをauthority registryにせず、L1能力・L3振る舞い・ADR技術方針・閾値・実行環境を別の責務として定義する。 | process_gate | prose | n/a | NFR authority registryの整理 | `RUL-COR-01` | docs/governance/helix-harness-requirements_v1.3.md:365-370 | E01／claude-opus |
| `RE01-230` | NFR計画者はauthorityとPO判断が揃わないdraft群を一括freezeしない。 | process_gate | gate | fail_close | 115件のNFR draft整理 | `RUL-FRM-02` | docs/governance/helix-harness-requirements_v1.3.md:377-377 | E01／claude-opus |
| `RE01-231` | UX設計者は画面からpermission・command・API・event・analytics・acceptanceまで共通semantic registryでtraceをつなぎ、端末・入力・role・locale・データ量・network・競合・破壊操作・undoをriskに応じて検証する。 | process_gate | gate | fail_close | UX semantic registryとrisk-based pairwise検証 | `RUL-FRM-05` | docs/governance/helix-harness-requirements_v1.3.md:385-390 | E01／claude-opus |
| `RE01-232` | UX検証者はprototype、DOM/token、E2E、content、analytics、accessibility間のdriftを検出し、要求atomには親task・outcome・scenario・context・成功条件・理由を保持する。意味を失う過分割をしない。 | evidence_claim | gate | fail_close | UX artifact driftと要求atom契約 | `RUL-FRM-04` | docs/governance/helix-harness-requirements_v1.3.md:385-390 | E01／claude-opus |
| `RE01-234` | 要求compilerの設計者はL1 Markdown、L2のappend-only discovery、L3 strict JSONの役割を分け、L2の観測を直接canonical要求にしない。 | process_gate | gate | fail_close | Markdown→discovery→strict JSON要求compiler | `RUL-COR-01` | docs/governance/helix-harness-requirements_v1.3.md:402-418 | E01／claude-opus |
| `RG08-001` | console設計者は、コントラスト基準をWCAG 2.1 AAとし、具体値をHigh-Fi層（canonical L11）で確定する。 | process_gate | config | n/a | 旧console profileとcanonical L11への具体値委譲 | `RUL-DEV-02` | config/ui-domain/harness-console-bundle.json:97-99 | G08／claude-opus |

## 副として対応づいた規則（12件）

`RE01-026`、`RE01-042`、`RE01-182`、`RE01-194`、`RE01-200`、`RE01-202`、`RE01-283`、`RG08-002`、`RG10-012`、`RG14-001`、`RG18-012`、`RG19-006`
