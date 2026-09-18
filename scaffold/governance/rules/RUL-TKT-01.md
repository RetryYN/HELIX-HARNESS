---
status: scaffold
authority_effect: none
generated_by: scaffold/governance/tools/gen_rulebook.py
source_candidate: docs/governance/candidates/legacy-rule-derived-requirements.md
source_candidate_sha256: 1c9891cbf76d7a28a6cf64b75e907e6ddad41c0aac5c9fa0a9196421211407a5
source_inventory: docs/governance/legacy-rule-atom-inventory.jsonl
source_inventory_sha256: e265b57e50d4c0f2f161c89a7dadbde12738bd84eab21de3fb5745d7741ef125
rule_id: RUL-TKT-01
group: チケット
product: OS
atoms_primary: 54
atoms_secondary: 36
issue_projection: none
---

# RUL-TKT-01（チケット／OS）

仮のルール。正本は[要求候補](../../../docs/governance/candidates/legacy-rule-derived-requirements.md)であり、本fileはその機械的な写しである。採否・承認・完了を生成しない。

## 要求

作業単位（旧PLAN）のidentityを一意にし、重複を作らず既存の延長を優先する。置き換えは後継と訂正を双方向に記録し、黙って上書きしない。

## 主として対応づいた規則（54件）

| atom | 規則 | 種類 | 強制 | 失敗時 | 旧実装固有の部分 | 副 | 出どころ | 由来 |
|---|---|---|---|---|---|---|---|---|
| `RA-199` | PLAN作成・更新前には既存docs/plansを確認し、重複PLANの新設より既存PLANの延長を優先する。 | process_gate | prose | n/a | docs/plans/ | — | .claude/CLAUDE.md:47-48; .claude/commands/sdd-plan.md:13-13 | A／gpt-6-astra |
| `RA-200` | PLAN作成者はplan_idを一意にし、filenameと一致させる。 | process_gate | prose／lint | n/a | PLAN schema | — | .claude/CLAUDE.md:52-52 | A／gpt-6-astra |
| `RA-209` | 確定PLANのclaimが誤りと判明した場合、黙って上書きせず、successorのsupersedesと旧PLANのcorrection noteで双方向に接続する。 | process_gate | prose | n/a | PLAN-L7-89、supersedes | — | .claude/CLAUDE.md:71-73 | A／gpt-6-astra |
| `RA-210` | plan-supersession検査はsupersede対象欠落または逆参照欠落でfail-closeする。 | process_gate | doctor | n/a | doctor plan-supersession | `RUL-OSA-06`、`RUL-COR-04` | .claude/CLAUDE.md:73-75 | A／gpt-6-astra |
| `RA-211` | PLAN作成者は設計文書が必要なrequirementごとに1 PLANとし、複数requirementをまとめない。 | process_gate | prose | n/a | — | `RUL-TKT-02` | .claude/commands/sdd-plan.md:14-14 | A／gpt-6-astra |
| `RB0-090` | Issue起票者は事前に重複検索し、同じ問題が存在する場合は新規起票せず既存Issueへ証拠を追記する。 | process_gate | prose | n/a | — | `RUL-OSM-08` | docs/governance/github-issue-hierarchy-rules.md:33-33; docs/governance/management-scrum-product-forward.md:28-29 | B／gpt-6-astra |
| `RB0-092` | Issueをduplicate扱いにする者はduplicate dispositionと実在するduplicate_ofを同時に設定する。 | process_gate | prose | n/a | disposition:duplicate、duplicate_of | `RUL-OSM-08` | docs/governance/github-issue-hierarchy-rules.md:35-35 | B／gpt-6-astra |
| `RB0-099` | Issueにplan_idを付ける者はPLANのgithub_issue_idと相互一致させ、監査側はproseのRefsから関係を推測しない。 | evidence_claim | prose | n/a | plan_id、github_issue_id | `RUL-OSM-08`、`RUL-FRM-04` | docs/governance/github-issue-hierarchy-rules.md:66-67 | B／gpt-6-astra |
| `RB0-133` | agentは既存要求・gate・command・skill・旧sourceのinventoryを確認せずに新規PLANや実装を起こしてはならない。 | behavior_discipline | prose | n/a | FR/BR、旧HELIX source | `RUL-OSP-05` | docs/skills/judgment-core.md:64-65; docs/skills/judgment-core.md:75-76 | B／gpt-6-astra |
| `RB0-167` | confirmed PLANのclaimを訂正する者はsilent overwriteせず、supersedeで変更履歴を残す。 | evidence_claim | prose | n/a | confirmed PLAN、supersede | — | docs/skills/acceptance-criteria-thinking.md:70-71 | B／gpt-6-astra |
| `RB04-098` | 追加設計者は既存の設計docを改変せず、新規add-designへ差分を分離する。 | behavior_discipline | prose | n/a | add-design、既存PLAN completed | `RUL-FRM-03` | docs/governance/helix-harness-concept_v3.1.md:869-873 | B04／gpt-6-astra |
| `RB04-100` | add-design/add-impl起票者はdependencies.parentを指定し、新規src/testsのみを追加する経路で差分pair/traceを凍結し、merge後に親との双方向参照を更新する。 | process_gate | prose／gate | n/a | 既存コード不変、旧G3-G7 | `RUL-FRM-01`、`RUL-FRM-03` | docs/governance/helix-harness-concept_v3.1.md:877-897 | B04／gpt-6-astra |
| `RB04-146` | 同一PLAN familyのdigestは最も具体的な最長IDを正本としてunion集約する。 | memory_context | prose | n/a | sameFamilyPlan、dedupeDigests | — | docs/governance/helix-harness-concept_v3.1.md:1241-1241 | B04／gpt-6-astra |
| `RB06-040` | 変更者は旧authorityを含むPLANを無言で改変せず、superseded_by、authority delta、compatibility注記のいずれかを付ける。 | memory_context | prose | n/a | — | `RUL-OSM-07` | docs/governance/l12-hybrid-recognition-candidate-inventory-2026-07-19.md:222-222 | B06／gpt-6-astra |
| `RB06-271` | cross-check機構は既存FRの実現として設計し、POが独立FR追跡を求めた場合だけ空きIDでback-prop起票してG1-traceを再検証する。 | process_gate | prose | n/a | FR-L1-18/05/03、採番済49まで | `RUL-FRM-01`、`RUL-OSM-01` | docs/governance/gate-design.md:178-188 | B06／gpt-6-astra |
| `RB06-278` | PLAN管理者はsupersededをarchiveで隠さず後継・errata・traceで扱い、archived遷移には人間承認とrejectionまたはretirement理由を要求する。 | escalation_authority | prose | fail_close | PLAN status: archived | `RUL-OSM-01` | docs/governance/repository-structure.md:116-116 | B06／gpt-6-astra |
| `RB06-290` | 突合担当者は独立fork間でPLAN番号が一致しても同一内容とみなさない。 | evidence_claim | prose | n/a | — | `RUL-FRM-04` | docs/governance/upstream-helix-reconciliation-audit-2026-07-04.md:19-21 | B06／gpt-6-astra |
| `RB07-017` | 監査担当者は前回監査で起票・実装済みの領域を新規起票へ重複させない。 | behavior_discipline | prose | n/a | 2026-07-04監査のPLAN群 | — | docs/governance/helix-harness-upstream-reconciliation-audit-2026-07-07.md:32-47 | B07／gpt-6-astra |
| `RB07-168` | 管理者は設計artifactが必要なFRごとに1 PLANを作り、新FRは実装前にPLAN化する。複数FRの混載をlint違反、対応FRなしをorphanとする。 | process_gate | prose／lint／doctor | fail_close | FR-L1-01 | `RUL-TKT-02`、`RUL-OSA-06` | docs/skills/project-management.md:50-58 | B07／gpt-6-astra |
| `RB07-173` | 管理者は新規PLAN作成前にstatus・lint・graphで重複を確認し、既存generatesの50%超と重なるなら既存PLANを拡張する。 | process_gate | prose | n/a | 50%基準 | — | docs/skills/project-management.md:85-96 | B07／gpt-6-astra |
| `RB07-319` | 担当者はconfirmed・active PLANでも旧authorityのまま再利用せず、無言書換えではなくsuperseded_byまたはauthority deltaを追記して未完ACだけを再採番する。 | memory_context | prose | fail_close | 列挙された旧PLAN群 | `RUL-OSM-07` | docs/governance/l12-hybrid-requirements-recognition-risk-audit-2026-07-19.md:70-85 | B07／gpt-6-astra |
| `RB08-296` | 要件抽出是正担当者はclosure authorityをReverse backfillし、Scrum工程を要求ID化し、小粒FRは既存文書への追記を優先して重複PLANを避ける。GitHub運用要件のconfirmed化はPO承認境界とする。 | process_gate | prose | n/a | 監査の推奨G-01/G-03/G-02等 | `RUL-REV-01`、`RUL-OSM-01` | docs/governance/hybrid-engine-requirements-extraction-gap-audit-2026-07-19.md:47-52 | B08／gpt-6-astra |
| `RC01-072` | plan-number-uniquenessは、同じPLAN種別・番号を持つファイル数がbaselineの許容数を超える場合、不合格にする。未登録番号の許容数は1である。 | process_gate | lint | fail_close | 15組の既知衝突baseline | — | src/lint/plan-number-uniqueness.ts:15-41; src/lint/plan-number-uniqueness.ts:77-92 | C01／gpt-6-astra |
| `RC01-140` | plan-compatibility-parentは、historical_provenanceのPLAN IDとpathがinventoryに一致せず、その違反tupleがbaseline外の場合、不合格にする。 | memory_context | lint | fail_close | inventory identity照合 | `RUL-OSM-07` | src/lint/plan-compatibility-parent.ts:85-93; src/lint/plan-compatibility-parent.ts:132-142 | C01／gpt-6-astra |
| `RC02-030` | doctorのplan-supersession checkは、supersedes先が存在しない、原PLANに訂正back-referenceがない、または読込失敗の場合に失敗する。 | process_gate | doctor | fail_close | PLAN supersessionの双方向参照 | — | src/doctor/index.ts:701-724 | C02／gpt-6-astra |
| `RC03-002` | active PLAN選択処理は、要求IDがcanonical PLAN ID集合に完全一致しない場合、選択を拒否する。前方一致の候補は選択成立として扱わない。 | process_gate | gate | fail_close | selectActivePlanId、reason=unknown、候補表示は最大10件 | `RUL-COR-04` | src/policy/active-plan-selection.ts:21-27 | C03／gpt-6-astra |
| `RD01-150` | PLAN authoring処理は、callerがallocator receipt digest・allocation ID・Forward ID・Reverse IDをallocationへ持ち込むことを拒否する。 | escalation_authority | gate | fail_close | caller_allocator_receipt_forbidden | `RUL-COR-03` | src/runtime/forward-plan-authoring-transaction.ts:405-410 | D01／gpt-6-astra |
| `RD01-160` | PLAN authoring処理は、既存Forwardに対応するReverseが一意でない、または対応Reverseが複数なら拒否する。 | process_gate | gate | fail_close | allocator_existing_pair_ambiguous | — | src/runtime/forward-plan-authoring-transaction.ts:452-464 | D01／gpt-6-astra |
| `RD01-161` | PLAN authoring処理は、Forward／Reverse予約が不成立または片側contract欠落なら拒否する。 | process_gate | gate | fail_close | reserveForwardReverseTerminalPair | `RUL-COR-03` | src/runtime/forward-plan-authoring-transaction.ts:522-532 | D01／gpt-6-astra |
| `RD01-174` | Forward／Reverse予約処理は、Forward PLAN IDがallocatorのForward IDと異なれば拒否する。 | escalation_authority | gate | fail_close | allocator_forward_identity_mismatch | `RUL-COR-04` | src/runtime/forward-reverse-terminal-reservation.ts:97-98 | D01／gpt-6-astra |
| `RD01-175` | Forward／Reverse予約処理は、両PLAN IDの意味slugが異なれば拒否する。 | process_gate | gate | fail_close | 番号・系列を除いたPLAN slug比較 | `RUL-COR-04` | src/runtime/forward-reverse-terminal-reservation.ts:99-102 | D01／gpt-6-astra |
| `RD02-083` | native graph監査器は、同じIssue番号の重複、または別Issueによる同一node IDの共有を失敗とする。 | process_gate | gate | fail_close | GitHub native snapshot | `RUL-OSM-08` | src/runtime/issue-hierarchy.ts:261-289 | D02／gpt-6-astra |
| `RD02-084` | native graph監査器は、安定したnode IDが空の場合に失敗とする。 | process_gate | gate | fail_close | issueId.trim() | `RUL-COR-04` | src/runtime/issue-hierarchy.ts:272-277 | D02／gpt-6-astra |
| `RD02-095` | 階層関係移行器は、role・親・重複検索状態・disposition・duplicate_ofを変更する候補を拒否する。 | process_gate | gate | fail_close | metadataChanged | `RUL-TKT-02` | src/runtime/issue-hierarchy.ts:499-509 | D02／gpt-6-astra |
| `RD02-110` | 依存監査器は、Issueが参照するPLANのgithubIssueIdがそのIssueと異なる場合に失敗とする。 | process_gate | gate | fail_close | issue_plan_binding_mismatch | `RUL-OSM-08` | src/runtime/issue-hierarchy.ts:848-854 | D02／gpt-6-astra |
| `RD02-112` | 依存監査器は、PLANの参照先IssueがそのPLANを逆参照していない場合に失敗とする。 | process_gate | gate | fail_close | plan_issue_binding_mismatch | `RUL-OSM-08` | src/runtime/issue-hierarchy.ts:866-872 | D02／gpt-6-astra |
| `RD02-116` | 階層契約解析器は、duplicate_searchがcompletedでない場合に拒否する。 | process_gate | gate | fail_close | duplicate_search | — | src/runtime/issue-hierarchy.ts:1024-1024 | D02／gpt-6-astra |
| `RD02-118` | 階層監査器は、Issue番号が重複する入力を失敗とする。 | process_gate | gate | fail_close | duplicate_issue_number | — | src/runtime/issue-hierarchy.ts:1037-1046 | D02／gpt-6-astra |
| `RD02-124` | 階層監査器は、duplicate指定時のduplicate_ofが未指定・自己参照・不存在の場合に失敗とする。 | process_gate | gate | fail_close | duplicate_target_invalid | — | src/runtime/issue-hierarchy.ts:1102-1113 | D02／gpt-6-astra |
| `RD02-125` | 階層監査器は、duplicate以外のdispositionでduplicate_ofを指定した場合に失敗とする。 | process_gate | gate | fail_close | duplicate_disposition_invalid | `RUL-COR-04` | src/runtime/issue-hierarchy.ts:1114-1120 | D02／gpt-6-astra |
| `RD02-211` | PLAN予約検証器は、plan_pathがdocs/plans/{plan_id}.mdと一致しない場合に拒否する。 | process_gate | gate | fail_close | docs/plans配置 | `RUL-COR-04` | src/runtime/open-branch-plan-identity-reservation.ts:73-75 | D02／gpt-6-astra |
| `RD02-212` | PLAN予約検証器は、current_main由来予約のlifecycleがcurrentでない場合に拒否する。 | process_gate | gate | fail_close | main予約は解放不可 | — | src/runtime/open-branch-plan-identity-reservation.ts:76-78 | D02／gpt-6-astra |
| `RD02-213` | PLAN予約検証器は、sourceに対応するactive状態でない予約にlifecycleと一致するterminal証拠がない場合に拒否する。 | process_gate | gate | fail_close | current_main/current、open_pr/open、active_writer/active | `RUL-FRM-04` | src/runtime/open-branch-plan-identity-reservation.ts:69-72; src/runtime/open-branch-plan-identity-reservation.ts:79-85 | D02／gpt-6-astra |
| `RD02-214` | PLAN予約検証器は、active予約にterminal証拠が付いている場合に拒否する。 | process_gate | gate | fail_close | terminal_evidence | `RUL-COR-04` | src/runtime/open-branch-plan-identity-reservation.ts:86-91 | D02／gpt-6-astra |
| `RD02-218` | PLAN予約投影器は、current main証拠がavailableなのにactiveなcurrent_main予約がない場合にblockedとする。 | process_gate | gate | fail_close | current_main_reservation_missing | `RUL-FRM-04` | src/runtime/open-branch-plan-identity-reservation.ts:278-283 | D02／gpt-6-astra |
| `RD02-219` | PLAN予約投影器は、同一PLAN IDに複数予約があり、同一内容・所有者の祖先継承または同一branch/HEADのwriterとPRのmirrorに該当しない組がある場合にblockedとする。 | lane_delegation | gate | fail_close | plan_id_conflict | `RUL-OSM-06` | src/runtime/open-branch-plan-identity-reservation.ts:158-191; src/runtime/open-branch-plan-identity-reservation.ts:214-234; src/runtime/open-branch-plan-identity-reservation.ts:284-291 | D02／gpt-6-astra |
| `RD02-220` | PLAN予約投影器は、同一PLAN番号prefixに異なるPLAN IDの競合予約がある場合にblockedとする。 | lane_delegation | gate | fail_close | suffixを除いたPLAN層・番号で比較 | — | src/runtime/open-branch-plan-identity-reservation.ts:292-305 | D02／gpt-6-astra |
| `RD03-033` | active PLAN更新は、canonical ID選択が不正と判定された場合、markerを書き換えない。commitから推定したIDが拒否された場合はwarning出力先があれば警告する。 | memory_context | hook | warn | selectActivePlanIdと.helix/state/current-plan。 | `RUL-COR-01`、`RUL-COR-04` | src/runtime/session-log.ts:244-248; src/runtime/session-log.ts:479-487 | D03／gpt-6-astra |
| `RD03-034` | session logは、canonical ID loaderがある場合、canonicalに一致しないPLAN IDをeventへ付与せずnullにする。loader未提供の旧adapterでは従来値を維持する。 | memory_context | hook | fail_open | resolveCanonicalEventPlanの互換fallback。 | `RUL-COR-01`、`RUL-COR-04` | src/runtime/session-log.ts:256-267 | D03／gpt-6-astra |
| `RD08-072` | left-arm carry lintは、入力集合でplan_idが重複する場合、失敗させる。 | process_gate | lint | fail_close | legacy-baseline-driftコード | `RUL-COR-04` | src/lint/left-arm-carry-log.ts:489-498 | D08／gpt-6-astra |
| `RD09-084` | plan-supersessionは、PLANがsupersedesで宣言するtargetのplan_idが検査集合に実在しない場合、失敗させる。 | evidence_claim | lint／doctor | fail_close | path/.mdを正規化した後のexact ID照合 | — | src/lint/plan-supersession.ts:103-109; src/lint/plan-supersession.ts:117-121 | D09／gpt-6-astra |
| `RD09-085` | plan-supersessionは、supersedes先PLANのsuperseded_byに宣言元のexact plan_idがない場合、失敗させる。 | evidence_claim | lint／doctor | fail_close | typed frontmatterの双方向edge | — | src/lint/plan-supersession.ts:110-121 | D09／gpt-6-astra |
| `RE01-017` | lintはPLAN IDの形式、ファイル名とfrontmatterの一致、IDの一意性を検査し、不一致や重複を拒否する。 | process_gate | lint | fail_close | PLAN ID正規表現と連番規約 | `RUL-COR-07` | docs/governance/helix-harness-requirements_v1.2.md:372-389; docs/governance/helix-harness-requirements_v1.2.md:469-469 | E01／claude-opus |
| `RE01-267` | 実装担当者は一つのatomic変更を一つの振る舞いと一人のownerへ対応づけ、同じHEADでoracle・DDD・CIを確認する。 | behavior_discipline | prose／gate | fail_close | atomic taskとsame-HEAD検証 | `RUL-FRM-06`、`RUL-COR-02` | docs/governance/helix-harness-requirements_v1.3.md:534-539 | E01／claude-opus |

## 副として対応づいた規則（36件）

`RB0-089`、`RB0-093`、`RB0-108`、`RB04-076`、`RB04-085`、`RB05-066`、`RB06-299`、`RB07-212`、`RB07-216`、`RB07-303`、`RB08-239`、`RB08-310`、`RB08-327`、`RB09-086`、`RC0-131`、`RC03-001`、`RC03-015`、`RC03-047`、`RC03-053`、`RD00-111`、`RD00-112`、`RD01-163`、`RD01-178`、`RD01-179`、`RD01-180`、`RD02-105`、`RD02-111`、`RD02-117`、`RD02-216`、`RD02-221`、`RD08-210`、`RE01-067`、`RE01-073`、`RE01-260`、`RG14-020`、`RG18-015`
