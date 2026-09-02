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
- `AVS-R-01A`: `request_directive`は実行意図、対象、許可scopeを解決できる場合だけ成立する。命令形、強い口調、叱責、緊急性、反復をdirective provenanceとして受理しない。
- `AVS-R-02`: consultation、feedback、叱責、質問、仮説、比喩、requestをapprovalまたはaccepted decisionへ自動昇格しない。
- `AVS-R-03`: directiveはtask boundaryを与え得るが、正本照合、代替案評価、安全確認、受入検証を免除しない。
- `AVS-R-03A`: directiveへの準拠と技術的rationaleを分離する。`指示された`、`POが言った`、`依頼された`を設計選択、review verdict、risk acceptance、completion claimの根拠として受理しない。
- `AVS-R-03B`: AIはdirectiveとcanonical authorityが矛盾する場合に矛盾をsurfaceし、可逆な範囲では目的を満たす適合案を導出する。不可逆・高影響・権限外の操作だけをexact approval境界へ送る。
- `AVS-R-03C`: AIはdirectiveから目的とscopeを受け取っても、手段選択、代替案比較、反証、risk評価、検収を自ら実行する。逐語実行、検討打切り、全件human escalationをdirective遵守として評価しない。

### AVS-FR-002 authority識別

- `AVS-R-04`: accepted `decision`はdecision ID、context、alternatives、selection、rationale、consequences、authority epoch、supersession path、ADR／versioned record pointerを必須とする。
- `AVS-R-05`: `selection`、`approval`、`disposition`、`runtime_judgment`をdecisionと別schema、別DB identity、別current outputで保持する。
- `AVS-R-06`: approvalは対象artifact/action、scope、revision、actor、provenance、expiry（必要時）へ束縛し、AIがhuman approvalを発明しない。

### AVS-FR-003 adapterと出力

- `AVS-R-07`: 既存`decision` fieldは意味inventoryを経てexact compatibility input-only adapterで一方向変換し、曖昧値を推測しない。
- `AVS-R-08`: current CLI、schema、DB、generated docs、Issue／PLAN template、Claude／Codex promptは新identityを出力し、legacy generic decisionを再出力しない。
- `AVS-R-09`: `PO判断`／`PO決定`／`PO指示`をcurrent identityとして出力しない。accepted ADRは`decision`、exact approval receiptは`approval`、明示的な作業入力は`request_directive`として出力し、包括的なPO attributionへ再集約しない。

### AVS-FR-004 memoryとprovider rule

- `AVS-R-10`: harness memoryはassignment、lease、candidate HEAD、review request、handover等のTTL付きcoordinationとtyped authority pointerだけを受理する。
- `AVS-R-11`: superseded／invalid memoryをSessionStart current guidanceへ再投影せず、project authority、personalization、decision本文、approval本文を拒否する。
- `AVS-R-12`: Claude/Codex共有brief、runtime adapter、repo rule marker、rule-drift、doctorが同じ分類表と禁止事項を検査する。

### AVS-FR-005 provenanceと移行

- `AVS-R-13`: AI解釈、GitHub actor名、memory authorだけからhuman provenanceを確定しない。
- `AVS-R-14`: historical evidenceは改竄せずcompatibility/historicalへ隔離し、新規出力・新規memory・current authorityへ再流入させない。
- `AVS-R-15`: reusable knowledgeはResponsibility-Centric Learning Systemのadmissionを経てSkill／Knowledge authorityへ置き、memoryから直接昇格しない。
- `AVS-R-16`: requirements-owned workflow classification authorityはauthority semantic drift／vocabulary separationを`REDESIGN`へ解決するcanonical signal bindingを定義する。current PLANはそのexact tokenを使用し、`po_directive`をcompatibility input-onlyへ隔離する。

本candidateを承認前にruntime、schema、DB current output、Claude/Codex managed ruleへ投影しない。
