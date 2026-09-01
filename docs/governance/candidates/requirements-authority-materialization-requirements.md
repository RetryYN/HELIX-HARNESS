---
canonical_vmodel: L1-L12
candidate_layer: L3
canonical_pair: L10
title: "要求・要件authority materialization gate要件"
layer: L3
kind: redesign
status: draft_candidate
created: 2026-09-02
updated: 2026-09-02
owner: PO / Codex TL
plan: PLAN-L3-79-requirements-authority-materialization-gate
parent_design: docs/governance/candidates/requirements-authority-materialization-requests.md
pair_artifact: docs/governance/candidates/requirements-authority-materialization-acceptance.md
next_pair_freeze: L10_after_po_approval
---

# 要求・要件authority materialization gate要件

- 文書ID: `HELIX-RAMG-REQ-001`
- 状態: `draft_candidate / plan固有承認前`
- 主Issue: `#1364`

## Feature契約

### RAMG-FR-001 正本宣言

- `RAMG-R-01`: 新behaviorを宣言するIssueは、既存canonical requirement参照、Authority Slice owner、non-authoritative proposalのexactly oneを持つ。
- `RAMG-R-02`: Authority Sliceはsource L1、source L3、paired L10、approval、canonical main read-after、IR admissionの状態を別fieldで保持する。
- `RAMG-R-03`: proposalとcandidateはcurrent authority、runtime completion、IR sourceとして利用できない。

### RAMG-FR-002 runtime受入

- `RAMG-R-04`: runtime、schema、DB、CLI current output、generated current docsを所有するPLANはsource path、revision、digest、approval receipt、main merge SHAを提示する。
- `RAMG-R-05`: Issue本文、comment、unmerged branch、candidate文書だけを根拠にしたruntime変更を拒否する。

### RAMG-FR-003 Requirement IR受入

- `RAMG-R-06`: Requirement IRはsource authorityを投影し、新しい要求意味をIssue proseから生成しない。
- `RAMG-R-07`: source revision/digest、L1 parent、L3 requirement、L10 oracle、approval、merge SHAの欠落とstaleを個別failureにする。

### RAMG-FR-004 複合capabilityとslice依存

- `RAMG-R-08`: 複合Capabilityは自身のbehavior contract、目的、境界、FR、AC、人間判断をsource authorityへ持つ。
- `RAMG-R-09`: dependencyはIssue全体とslice単位を分離し、必要なsliceだけをhard-bindする。

### RAMG-FR-005 監査projection

- `RAMG-R-10`: Issue、PLAN、source authority、IR、runtime consumerをstable identityでjoinする。
- `RAMG-R-11`: dispositionを`materialized_current/authority_backlog_tracked/proposal_non_authoritative/runtime_ahead_of_authority/ir_ahead_of_source/trace_orphan/stale_source_revision/rejected_or_deferred`のexact setへ分類する。
- `RAMG-R-12`: PR admissionはchanged scope closure、scheduled auditはfull inventoryを検査し、外部取得不能時は推測せずfail-closeまたは明示DEGRADEDにする。

### RAMG-FR-006 authority epochとfreeze境界

- RAMG-R-13: JSON cutover後のcurrent semantic read authorityはcanonical Requirement IR JSONだけとし、L1/L3/L10 Markdownはsource-of-derivation、generated/reference、compatibility/historicalのexactly oneへ分類する。confirmed MarkdownやDB projectionを第二意味正本にしない。
- RAMG-R-14: proposal/auto_admitted/canonical_specified/frozenを別stateとして保持する。AIの可逆auto-admissionは人間のplan固有freeze approvalを代替せず、意味authority変更またはfrozen遷移はapproval receiptとmain read-afterを要求する。

## 初期owner

| Capability | Authority Slice owner | Runtime解放条件 |
|---|---|---|
| Requirement Re-entry | #1169 | source authorityのcanonical read-after後 |
| Upstream Validation First | #1017 | Authority SliceとRuntime Sliceの分離後 |
| Agile Prototype Triangle | #1292 | 複合Capability自身のsource authority成立後 |
| Responsibility System TDD | #1318 | RSTDD-01成立、RSTDD-07 dependency解決後 |

本candidateを承認前にruntime、DB current output、generated current docsへ投影しない。
