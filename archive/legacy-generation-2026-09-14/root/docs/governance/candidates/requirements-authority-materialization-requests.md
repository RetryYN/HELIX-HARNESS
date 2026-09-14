---
canonical_vmodel: L1-L12
candidate_layer: L1
canonical_pair: L12
title: "要求・要件authority materialization gate要求"
layer: L1
kind: redesign
status: draft_candidate
created: 2026-09-02
updated: 2026-09-05
owner: PO / Codex TL
plan: PLAN-L3-79-requirements-authority-materialization-gate
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
next_pair_freeze: L12_after_po_approval
---

# 要求・要件authority materialization gate要求

- 文書ID: `HELIX-RAMG-BRQ-001`
- 状態: `draft_candidate / plan固有human gate済み・独立review前`
- Behavior Contract: `REQUIREMENTS-AUTHORITY-MATERIALIZATION-GATE-001`

## 要求

### RAMG-BR-001 Issueから正本への順序を一方向にする

新しいbehavior、identity、複合Capability、state machine、policyをIssueで発見しても、Issue本文を要求・要件・runtimeの正本にしない。source authorityのcanonical mergeとread-afterを経てからRequirement IRとruntimeへ投影する。

### RAMG-BR-002 意味正本より先に実装を進めない

runtime、schema、DB、CLI current output、generated docsを変更する前に、その意味を所有する要求、要件、受入oracle、承認、source revisionを解決する。未解決時はfail-closeする。

### RAMG-BR-003 複合Capabilityを構成要素で相殺しない

既存Capabilityの組合せから新しいbehaviorが生じる場合、構成要素のcoverageを新Capability自身の要求・要件の代替にしない。

### RAMG-BR-004 slice単位の依存を正しく扱う

後段sliceだけが別authorityを要求するとき、前段を過剰blockせず、必要なslice開始時にexact dependencyを強制する。

### RAMG-BR-005 漏れを継続監査する

PRではchanged scopeとdependency closureを高速検査し、scheduled auditでは全Issue、PLAN、source authority、IR、runtime consumerを照合する。漏れを件数だけで隠さずtyped findingへする。

### RAMG-BR-006 source文書と意味正本を混同しない

L1/L3/L10 Markdownは要求意味の由来、レビュー対象、traceを保持するsource-of-derivationであり、JSON cutover後のcurrent semantic read authorityではない。
confirmed frontmatter、DB projection、generated viewだけでcurrent意味正本を主張せず、canonical Requirement IR JSONへのadmissionとread-afterを必須にする。

### RAMG-BR-007 AIの可逆admissionと人間freezeを別状態にする

AIが可逆proposalを検査・admitできる境界と、要求意味またはfrozen baselineを変更する人間承認境界を分離する。
auto_admitやcanonical/specifedをfrozenと同義にせず、plan固有approvalなしにfreeze済みとして下流を解放しない。

## 初期監査fixture

- #1169 Requirement Re-entry
- #1017 Upstream Validation First
- #1292 Agile Prototype Triangle
- #1318 Responsibility System TDD

#1358/#1363系列は初期fixtureへ含めない。authority collision監査のC-01/C-02を本gateのepoch／freeze oracleとして扱う。
本candidateは独立技術reviewとcanonical promotionが成立するまでcurrent authorityへ加算しない。
