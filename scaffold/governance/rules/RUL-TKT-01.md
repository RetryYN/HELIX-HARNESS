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

| atom | 規則 | 種類 | 強制 | 出どころ |
|---|---|---|---|---|
| `RA-199` | PLAN作成・更新前には既存docs/plansを確認し、重複PLANの新設より既存PLANの延長を優先する。 | process_gate | prose | .claude/CLAUDE.md:47-48; .claude/commands/sdd-plan.md:13-13 |
| `RA-200` | PLAN作成者はplan_idを一意にし、filenameと一致させる。 | process_gate | prose／lint | .claude/CLAUDE.md:52-52 |
| `RA-209` | 確定PLANのclaimが誤りと判明した場合、黙って上書きせず、successorのsupersedesと旧PLANのcorrection noteで双方向に接続する。 | process_gate | prose | .claude/CLAUDE.md:71-73 |
| `RA-210` | plan-supersession検査はsupersede対象欠落または逆参照欠落でfail-closeする。 | process_gate | doctor | .claude/CLAUDE.md:73-75 |
| `RA-211` | PLAN作成者は設計文書が必要なrequirementごとに1 PLANとし、複数requirementをまとめない。 | process_gate | prose | .claude/commands/sdd-plan.md:14-14 |
| `RB0-090` | Issue起票者は事前に重複検索し、同じ問題が存在する場合は新規起票せず既存Issueへ証拠を追記する。 | process_gate | prose | docs/governance/github-issue-hierarchy-rules.md:33-33; docs/governance/management-scrum-product-forward.md:28-29 |
| `RB0-092` | Issueをduplicate扱いにする者はduplicate dispositionと実在するduplicate_ofを同時に設定する。 | process_gate | prose | docs/governance/github-issue-hierarchy-rules.md:35-35 |
| `RB0-099` | Issueにplan_idを付ける者はPLANのgithub_issue_idと相互一致させ、監査側はproseのRefsから関係を推測しない。 | evidence_claim | prose | docs/governance/github-issue-hierarchy-rules.md:66-67 |
| `RB0-133` | agentは既存要求・gate・command・skill・旧sourceのinventoryを確認せずに新規PLANや実装を起こしてはならない。 | behavior_discipline | prose | docs/skills/judgment-core.md:64-65; docs/skills/judgment-core.md:75-76 |
| `RB0-167` | confirmed PLANのclaimを訂正する者はsilent overwriteせず、supersedeで変更履歴を残す。 | evidence_claim | prose | docs/skills/acceptance-criteria-thinking.md:70-71 |
| `RB04-098` | 追加設計者は既存の設計docを改変せず、新規add-designへ差分を分離する。 | behavior_discipline | prose | docs/governance/helix-harness-concept_v3.1.md:869-873 |
| `RB04-100` | add-design/add-impl起票者はdependencies.parentを指定し、新規src/testsのみを追加する経路で差分pair/traceを凍結し、merge後に親との双方向参照を更新する。 | process_gate | prose／gate | docs/governance/helix-harness-concept_v3.1.md:877-897 |
| `RB04-146` | 同一PLAN familyのdigestは最も具体的な最長IDを正本としてunion集約する。 | memory_context | prose | docs/governance/helix-harness-concept_v3.1.md:1241-1241 |
| `RB06-040` | 変更者は旧authorityを含むPLANを無言で改変せず、superseded_by、authority delta、compatibility注記のいずれかを付ける。 | memory_context | prose | docs/governance/l12-hybrid-recognition-candidate-inventory-2026-07-19.md:222-222 |
| `RB06-271` | cross-check機構は既存FRの実現として設計し、POが独立FR追跡を求めた場合だけ空きIDでback-prop起票してG1-traceを再検証する。 | process_gate | prose | docs/governance/gate-design.md:178-188 |
| `RB06-278` | PLAN管理者はsupersededをarchiveで隠さず後継・errata・traceで扱い、archived遷移には人間承認とrejectionまたはretirement理由を要求する。 | escalation_authority | prose | docs/governance/repository-structure.md:116-116 |
| `RB06-290` | 突合担当者は独立fork間でPLAN番号が一致しても同一内容とみなさない。 | evidence_claim | prose | docs/governance/upstream-helix-reconciliation-audit-2026-07-04.md:19-21 |
| `RB07-017` | 監査担当者は前回監査で起票・実装済みの領域を新規起票へ重複させない。 | behavior_discipline | prose | docs/governance/helix-harness-upstream-reconciliation-audit-2026-07-07.md:32-47 |
| `RB07-168` | 管理者は設計artifactが必要なFRごとに1 PLANを作り、新FRは実装前にPLAN化する。複数FRの混載をlint違反、対応FRなしをorphanとする。 | process_gate | prose／lint／doctor | docs/skills/project-management.md:50-58 |
| `RB07-173` | 管理者は新規PLAN作成前にstatus・lint・graphで重複を確認し、既存generatesの50%超と重なるなら既存PLANを拡張する。 | process_gate | prose | docs/skills/project-management.md:85-96 |
| `RB07-319` | 担当者はconfirmed・active PLANでも旧authorityのまま再利用せず、無言書換えではなくsuperseded_byまたはauthority deltaを追記して未完ACだけを再採番する。 | memory_context | prose | docs/governance/l12-hybrid-requirements-recognition-risk-audit-2026-07-19.md:70-85 |
| `RB08-296` | 要件抽出是正担当者はclosure authorityをReverse backfillし、Scrum工程を要求ID化し、小粒FRは既存文書への追記を優先して重複PLANを避ける。GitHub運用要件のconfirmed化はPO承認境界とする。 | process_gate | prose | docs/governance/hybrid-engine-requirements-extraction-gap-audit-2026-07-19.md:47-52 |
| `RC01-072` | plan-number-uniquenessは、同じPLAN種別・番号を持つファイル数がbaselineの許容数を超える場合、不合格にする。未登録番号の許容数は1である。 | process_gate | lint | src/lint/plan-number-uniqueness.ts:15-41; src/lint/plan-number-uniqueness.ts:77-92 |
| `RC01-140` | plan-compatibility-parentは、historical_provenanceのPLAN IDとpathがinventoryに一致せず、その違反tupleがbaseline外の場合、不合格にする。 | memory_context | lint | src/lint/plan-compatibility-parent.ts:85-93; src/lint/plan-compatibility-parent.ts:132-142 |
| `RC02-030` | doctorのplan-supersession checkは、supersedes先が存在しない、原PLANに訂正back-referenceがない、または読込失敗の場合に失敗する。 | process_gate | doctor | src/doctor/index.ts:701-724 |
| `RC03-002` | active PLAN選択処理は、要求IDがcanonical PLAN ID集合に完全一致しない場合、選択を拒否する。前方一致の候補は選択成立として扱わない。 | process_gate | gate | src/policy/active-plan-selection.ts:21-27 |
| `RD01-150` | PLAN authoring処理は、callerがallocator receipt digest・allocation ID・Forward ID・Reverse IDをallocationへ持ち込むことを拒否する。 | escalation_authority | gate | src/runtime/forward-plan-authoring-transaction.ts:405-410 |
| `RD01-160` | PLAN authoring処理は、既存Forwardに対応するReverseが一意でない、または対応Reverseが複数なら拒否する。 | process_gate | gate | src/runtime/forward-plan-authoring-transaction.ts:452-464 |
| `RD01-161` | PLAN authoring処理は、Forward／Reverse予約が不成立または片側contract欠落なら拒否する。 | process_gate | gate | src/runtime/forward-plan-authoring-transaction.ts:522-532 |
| `RD01-174` | Forward／Reverse予約処理は、Forward PLAN IDがallocatorのForward IDと異なれば拒否する。 | escalation_authority | gate | src/runtime/forward-reverse-terminal-reservation.ts:97-98 |
| `RD01-175` | Forward／Reverse予約処理は、両PLAN IDの意味slugが異なれば拒否する。 | process_gate | gate | src/runtime/forward-reverse-terminal-reservation.ts:99-102 |
| `RD02-083` | native graph監査器は、同じIssue番号の重複、または別Issueによる同一node IDの共有を失敗とする。 | process_gate | gate | src/runtime/issue-hierarchy.ts:261-289 |
| `RD02-084` | native graph監査器は、安定したnode IDが空の場合に失敗とする。 | process_gate | gate | src/runtime/issue-hierarchy.ts:272-277 |
| `RD02-095` | 階層関係移行器は、role・親・重複検索状態・disposition・duplicate_ofを変更する候補を拒否する。 | process_gate | gate | src/runtime/issue-hierarchy.ts:499-509 |
| `RD02-110` | 依存監査器は、Issueが参照するPLANのgithubIssueIdがそのIssueと異なる場合に失敗とする。 | process_gate | gate | src/runtime/issue-hierarchy.ts:848-854 |
| `RD02-112` | 依存監査器は、PLANの参照先IssueがそのPLANを逆参照していない場合に失敗とする。 | process_gate | gate | src/runtime/issue-hierarchy.ts:866-872 |
| `RD02-116` | 階層契約解析器は、duplicate_searchがcompletedでない場合に拒否する。 | process_gate | gate | src/runtime/issue-hierarchy.ts:1024-1024 |
| `RD02-118` | 階層監査器は、Issue番号が重複する入力を失敗とする。 | process_gate | gate | src/runtime/issue-hierarchy.ts:1037-1046 |
| `RD02-124` | 階層監査器は、duplicate指定時のduplicate_ofが未指定・自己参照・不存在の場合に失敗とする。 | process_gate | gate | src/runtime/issue-hierarchy.ts:1102-1113 |
| `RD02-125` | 階層監査器は、duplicate以外のdispositionでduplicate_ofを指定した場合に失敗とする。 | process_gate | gate | src/runtime/issue-hierarchy.ts:1114-1120 |
| `RD02-211` | PLAN予約検証器は、plan_pathがdocs/plans/{plan_id}.mdと一致しない場合に拒否する。 | process_gate | gate | src/runtime/open-branch-plan-identity-reservation.ts:73-75 |
| `RD02-212` | PLAN予約検証器は、current_main由来予約のlifecycleがcurrentでない場合に拒否する。 | process_gate | gate | src/runtime/open-branch-plan-identity-reservation.ts:76-78 |
| `RD02-213` | PLAN予約検証器は、sourceに対応するactive状態でない予約にlifecycleと一致するterminal証拠がない場合に拒否する。 | process_gate | gate | src/runtime/open-branch-plan-identity-reservation.ts:69-72; src/runtime/open-branch-plan-identity-reservation.ts:79-85 |
| `RD02-214` | PLAN予約検証器は、active予約にterminal証拠が付いている場合に拒否する。 | process_gate | gate | src/runtime/open-branch-plan-identity-reservation.ts:86-91 |
| `RD02-218` | PLAN予約投影器は、current main証拠がavailableなのにactiveなcurrent_main予約がない場合にblockedとする。 | process_gate | gate | src/runtime/open-branch-plan-identity-reservation.ts:278-283 |
| `RD02-219` | PLAN予約投影器は、同一PLAN IDに複数予約があり、同一内容・所有者の祖先継承または同一branch/HEADのwriterとPRのmirrorに該当しない組がある場合にblockedとする。 | lane_delegation | gate | src/runtime/open-branch-plan-identity-reservation.ts:158-191; src/runtime/open-branch-plan-identity-reservation.ts:214-234; src/runtime/open-branch-plan-identity-reservation.ts:284-291 |
| `RD02-220` | PLAN予約投影器は、同一PLAN番号prefixに異なるPLAN IDの競合予約がある場合にblockedとする。 | lane_delegation | gate | src/runtime/open-branch-plan-identity-reservation.ts:292-305 |
| `RD03-033` | active PLAN更新は、canonical ID選択が不正と判定された場合、markerを書き換えない。commitから推定したIDが拒否された場合はwarning出力先があれば警告する。 | memory_context | hook | src/runtime/session-log.ts:244-248; src/runtime/session-log.ts:479-487 |
| `RD03-034` | session logは、canonical ID loaderがある場合、canonicalに一致しないPLAN IDをeventへ付与せずnullにする。loader未提供の旧adapterでは従来値を維持する。 | memory_context | hook | src/runtime/session-log.ts:256-267 |
| `RD08-072` | left-arm carry lintは、入力集合でplan_idが重複する場合、失敗させる。 | process_gate | lint | src/lint/left-arm-carry-log.ts:489-498 |
| `RD09-084` | plan-supersessionは、PLANがsupersedesで宣言するtargetのplan_idが検査集合に実在しない場合、失敗させる。 | evidence_claim | lint／doctor | src/lint/plan-supersession.ts:103-109; src/lint/plan-supersession.ts:117-121 |
| `RD09-085` | plan-supersessionは、supersedes先PLANのsuperseded_byに宣言元のexact plan_idがない場合、失敗させる。 | evidence_claim | lint／doctor | src/lint/plan-supersession.ts:110-121 |
| `RE01-017` | lintはPLAN IDの形式、ファイル名とfrontmatterの一致、IDの一意性を検査し、不一致や重複を拒否する。 | process_gate | lint | docs/governance/helix-harness-requirements_v1.2.md:372-389; docs/governance/helix-harness-requirements_v1.2.md:469-469 |
| `RE01-267` | 実装担当者は一つのatomic変更を一つの振る舞いと一人のownerへ対応づけ、同じHEADでoracle・DDD・CIを確認する。 | behavior_discipline | prose／gate | docs/governance/helix-harness-requirements_v1.3.md:534-539 |

## 副として対応づいた規則（36件）

`RB0-089`、`RB0-093`、`RB0-108`、`RB04-076`、`RB04-085`、`RB05-066`、`RB06-299`、`RB07-212`、`RB07-216`、`RB07-303`、`RB08-239`、`RB08-310`、`RB08-327`、`RB09-086`、`RC0-131`、`RC03-001`、`RC03-015`、`RC03-047`、`RC03-053`、`RD00-111`、`RD00-112`、`RD01-163`、`RD01-178`、`RD01-179`、`RD01-180`、`RD02-105`、`RD02-111`、`RD02-117`、`RD02-216`、`RD02-221`、`RD08-210`、`RE01-067`、`RE01-073`、`RE01-260`、`RG14-020`、`RG18-015`
