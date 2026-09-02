---
canonical_vmodel: L1-L12
candidate_layer: L3
canonical_pair: L10
title: "authority語彙分離要件"
layer: L3
kind: redesign
status: draft_candidate
created: 2026-09-02
updated: 2026-09-02
owner: PO / Codex TL
plan: PLAN-L3-82-authority-vocabulary-separation
parent_design: docs/governance/candidates/authority-vocabulary-requests.md
pair_artifact: docs/governance/candidates/authority-vocabulary-acceptance.md
next_pair_freeze: L10_after_plan_specific_approval
---

# authority語彙分離要件

- 文書ID: `HELIX-AVS-REQ-001`
- 状態: `draft_candidate / plan固有承認前`
- 主Issue: `#1449`

## Feature契約

### AVS-FR-001 入力分類

- `AVS-R-01`: 会話入力を`consultation_input/feedback_signal/request_directive/selection_candidate/approval_candidate/decision_candidate`のexact setへ分類し、分類根拠とsource revisionを保持する。
- `AVS-R-02`: consultation、feedback、叱責、質問、仮説、比喩、requestをapprovalまたはaccepted decisionへ自動昇格しない。
- `AVS-R-03`: directiveはtask boundaryを与え得るが、正本照合、代替案評価、安全確認、受入検証を免除しない。

### AVS-FR-002 authority identity

- `AVS-R-04`: accepted `decision`はdecision ID、context、alternatives、selection、rationale、consequences、authority epoch、supersession path、ADR／versioned record pointerを必須とする。
- `AVS-R-05`: `selection`、`approval`、`disposition`、`runtime_judgment`をdecisionと別schema、別DB identity、別current outputで保持する。
- `AVS-R-06`: approvalは対象artifact/action、scope、revision、actor、provenance、expiry（必要時）へ束縛し、AIがhuman approvalを発明しない。

### AVS-FR-003 adapterと出力

- `AVS-R-07`: 既存`decision` fieldは意味inventoryを経てexact compatibility input-only adapterで一方向変換し、曖昧値を推測しない。
- `AVS-R-08`: current CLI、schema、DB、generated docs、Issue／PLAN template、Claude／Codex promptは新identityを出力し、legacy generic decisionを再出力しない。
- `AVS-R-09`: `PO判断`／`PO決定`／`PO指示`のcurrent出力は、対応するaccepted ADR、exact approval receipt、または明示directive sourceの型に応じて限定し、包括ラベルとして使わない。

### AVS-FR-004 memoryとprovider rule

- `AVS-R-10`: harness memoryはassignment、lease、candidate HEAD、review request、handover等のTTL付きcoordinationとtyped authority pointerだけを受理する。
- `AVS-R-11`: superseded／invalid memoryをSessionStart current guidanceへ再投影せず、project authority、personalization、decision本文、approval本文を拒否する。
- `AVS-R-12`: Claude/Codex共有brief、runtime adapter、repo rule marker、rule-drift、doctorが同じ分類表と禁止事項を検査する。

### AVS-FR-005 provenanceと移行

- `AVS-R-13`: AI解釈、GitHub actor名、memory authorだけからhuman provenanceを確定しない。
- `AVS-R-14`: historical evidenceは改竄せずcompatibility/historicalへ隔離し、新規出力・新規memory・current authorityへ再流入させない。
- `AVS-R-15`: reusable knowledgeはResponsibility-Centric Learning Systemのadmissionを経てSkill／Knowledge authorityへ置き、memoryから直接昇格しない。

本candidateを承認前にruntime、schema、DB current output、Claude/Codex managed ruleへ投影しない。
