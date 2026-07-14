---
title: "HELIX L7 単体テスト設計 — Issue・scope・authority gate"
layer: L6
executed_at_layer: L7
artifact_type: test_design
status: draft
created: 2026-07-15
updated: 2026-07-15
owner: QA / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
design_slice: HDS-HIL-05
related_l3: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l4: docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
related_hst:
  - HST-HIL-019
  - HST-HIL-021
  - HST-HIL-023
pair_artifact: docs/design/helix/L6-function-design/issue-scope-authority-gates.md
next_pair_freeze: L6
requirements:
  - HR-FR-HIL-05
  - HAC-HIL-05a
  - HAC-HIL-05b
  - HAC-HIL-05c
---

# HELIX L7 単体テスト設計 — Issue・scope・authority gate

| ID | exact function | scenarioと期待結果 | HAC | exact HST disposition | test参照先 |
|---|---|---|---|---|---|
| `U-ISAG-001` | `captureDirectiveBeforeClassification` / `validateDirectiveClassificationAdmission` | append成功かつcurrentなdirective/revision/content digestのcustody bindingだけclassifiable。receipt欠落、port failure、stale revision、digest不一致では全classify/dedupe/disposition 0 | `HAC-HIL-05a`, `HAC-HIL-05b` | `HST-CASE-019-01` → `なし（正常系）`; `HST-CASE-019-02` → `HIL_DIRECTIVE_CUSTODY_MISSING` | `tests/directive-custody.test.ts` |
| `U-ISAG-002` | `validateDirectiveAppendOnly` | current custody binding下だけsuperseding appendを許可し、UPDATE/DELETE、receipt欠落、stale revisionを拒否 | `HAC-HIL-05b` | `HST-CASE-019-07` → `HIL_DIRECTIVE_APPEND_ONLY_VIOLATION` | `tests/directive-custody.test.ts` |
| `U-ISAG-003` | `resolveDirectiveDuplicate` | current custody欠落/stale、dead target、oracle非包含、appeal欠落でterminal 0 | `HAC-HIL-05b` | `HST-CASE-019-03` → `HIL_DIRECTIVE_DUPLICATE_TARGET_MISSING` | `tests/directive-disposition.test.ts` |
| `U-ISAG-004` | `validateDirectiveFalsePositive` | current custody欠落/stale、same provider/role、反証digest欠落で確定0 | `HAC-HIL-05b` | `HST-CASE-019-04` → `HIL_DIRECTIVE_FALSE_POSITIVE_UNVERIFIED` | `tests/directive-disposition.test.ts` |
| `U-ISAG-005` | `validatePoDirectiveDisposition` | current custody欠落/stale、receiptなしrisk、AI cancel、AI/PO/review matrixをcase別拒否 | `HAC-HIL-05b` | `HST-CASE-019-05` → `HIL_DIRECTIVE_RISK_APPROVAL_MISSING`; `HST-CASE-019-06` → `HIL_DIRECTIVE_CANCEL_UNAUTHORIZED`; `HST-CASE-019-09` → `HIL_DIRECTIVE_TERMINATED_BY_AI` | `tests/directive-disposition.test.ts` |
| `U-ISAG-006` | `preventAiDirectiveTermination` | AI reject/drop/cancel/closeは必ずcanonical `Err`、state/event増分0。非terminal proposalだけ別operationで`Ok`とし、元directiveをpendingのまま保持 | `HAC-HIL-05b` | `HST-CASE-019-08` → `HIL_DIRECTIVE_CUSTODY_VIOLATION` | `tests/directive-disposition.test.ts` |
| `U-ISAG-007` | `buildScopeAuthorityGraph` | custody chat receipt、L0 confirmed receipt、PO parent-scope approval receiptを検証し、node/edge入力全順列で同一graph/root digest | `HAC-HIL-05a` | `HST-CASE-021-01` → `なし（正常系）` | `tests/scope-authority.test.ts` |
| `U-ISAG-008` | `detectScopeAuthorityCycle` | self、同時HIL、複合cycleを全件列挙しreceipt 0 | `HAC-HIL-05b` | `HST-CASE-021-02` → `HIL_SCOPE_AUTHORITY_CYCLE`; `HST-CASE-021-08` → `HIL_SCOPE_AUTHORITY_CYCLE`; `HST-CASE-021-10` → `HIL_SCOPE_DERIVATION_CYCLE` | `tests/scope-authority.test.ts` |
| `U-ISAG-009` | `resolveScopeAuthorityRoot` | verifiedなchat/L0/PO rootだけstable path。forged kind、receipt欠落、stale revision、複数root競合、orphan/cycle/minimum欠落はreceipt 0 | `HAC-HIL-05a`, `HAC-HIL-05b` | `HST-CASE-021-01` → `なし（正常系）`; `HST-CASE-021-07` → `HIL_SCOPE_AUTHORITY_INVALID` | `tests/scope-authority.test.ts` |
| `U-ISAG-010` | `evaluateAcceptanceContribution` | oracle edgeなしとcomplexity/surface/debtだけの変更を拒否 | `HAC-HIL-05b` | `HST-CASE-021-03` → `HIL_SCOPE_MINIMUM_NECESSITY_MISSING`; `HST-CASE-021-09` → `HIL_SCOPE_NECESSITY_MISSING` | `tests/scope-minimality.test.ts` |
| `U-ISAG-011` | `evaluateMinimumNecessaryChange` | alternative空、比較不能、広い案だけでreceipt 0 | `HAC-HIL-05b` | `HST-CASE-021-04` → `HIL_SCOPE_ALTERNATIVE_MISSING` | `tests/scope-minimality.test.ts` |
| `U-ISAG-012` | `accountScopeCapabilityBudget` | 各budget境界直前/同値/超過を評価し超過claim 0 | `HAC-HIL-05b` | `HST-CASE-021-05` → `HIL_SCOPE_BUDGET_EXCEEDED` | `tests/scope-budget.test.ts` |
| `U-ISAG-013` | `compareScopeContractToDiff` | 要求外CLI/API/schema/dependencyと循環traceを拒否 | `HAC-HIL-05b` | `HST-CASE-021-06` → `HIL_UNJUSTIFIED_CAPABILITY`; `HST-CASE-021-07` → `HIL_SCOPE_AUTHORITY_INVALID` | `tests/scope-gate.test.ts` |
| `U-ISAG-014` | `inheritChildIssueScopeAuthority` | parent root/non-goal/budgetを維持しchildのscope拡張を拒否 | `HAC-HIL-05b` | `HST-CASE-021-06` → `HIL_UNJUSTIFIED_CAPABILITY` | `tests/scope-gate.test.ts` |
| `U-ISAG-015` | `classifyHighImpactAction` | high-impact語彙matrixを固定分類しAIのsafe自己申告を無視 | `HAC-HIL-05c` | `HST-CASE-017-08` → `HIL_ACTION_BINDING_APPROVAL_MISSING` | `tests/action-binding-gate.test.ts` |
| `U-ISAG-016` | `validateActionBindingApproval` | actor/tool/target/params/snapshot/scope/evidence/expiryを一つずつmutateしapply 0 | `HAC-HIL-05c` | `HST-CASE-017-08` → `HIL_ACTION_BINDING_APPROVAL_MISSING` | `tests/action-binding-gate.test.ts` |
| `U-ISAG-017` | `validateIssueEvidenceReceipt` | 別SHA/predecessor、source spanなし、同digestを拒否しcause保持 | `HAC-HIL-05a`, `HAC-HIL-05b` | `HST-CASE-003-13` → `HIL_CI_RECEIPT_LINEAGE_INVALID`; `HST-CASE-018-11` → `HIL_REVERSE_SEMANTIC_COVERAGE_INCOMPLETE` | `tests/issue-evidence-gate.test.ts` |
| `U-ISAG-018` | `evaluateIssueGateChain` | 各gate receiptを一件ずつ除き、固定順findingと全transition 0 | `HAC-HIL-05a`, `HAC-HIL-05b`, `HAC-HIL-05c` | `HST-CASE-002-08` → `HIL_ISSUE_GATE_BYPASS`; `HST-CASE-002-10` → `HIL_IMPLEMENTATION_NOT_READY`; `HST-CASE-003-05` → `HIL_CI_STAGE_BYPASS`; `HST-CASE-018-09` → `HIL_REVERSE_SUBSTANCE_HOLLOW` | `tests/issue-gate-chain.test.ts` |
| `U-ISAG-019` | `authorizeIssueTransition` | actor/authority欠落、AI close/cancel、stale bundle、別revision、CAS loser、同operation異digestはcanonical `Err`かつevent 0 | `HAC-HIL-05b` | `HST-CASE-002-08` → `HIL_ISSUE_GATE_BYPASS` | `tests/issue-transition-gate.test.ts` |
| `U-ISAG-020` | `evaluateIssueClosureEvidence` | PR、merge、三段CI lineage、audit、oracle、memory、child、current head、current snapshot、PO authorityを一件ずつ欠落・stale化・別head化してclose 0 | `HAC-HIL-05a`, `HAC-HIL-05b` | `HST-CASE-023-02` → `HIL_CLOSURE_AUDIT_MISSING`; `HST-CASE-023-03` → `HIL_CLOSURE_MEMORY_MISSING`; `HST-CASE-023-04` → `HIL_CLOSURE_CHILD_OPEN`; `HST-CASE-023-05` → `HIL_CLOSURE_ORACLE_MISSING`; `HST-CASE-023-07` → `HIL_CLOSURE_EVIDENCE_MISSING` | `tests/issue-closure.test.ts` |
| `U-ISAG-021` | `createIssueClosureReceipt` | 全evidenceが同一current head/snapshotかつnon-AI actor/PO authority一致時だけ一件発行。同operation再送増分0、actor欠落、AI actor、authority不一致はcanonical `Err`かつ発行0 | `HAC-HIL-05a` | `HST-CASE-023-01` → `なし（正常系）` | `tests/issue-closure.test.ts` |
| `U-ISAG-022` | `checkpointIssueGateContinuation` | budget到達でcloseせず未完obligation/next actionをdurable seal | `HAC-HIL-05a` | `HST-CASE-023-06` → `なし（正常系）` | `tests/issue-gate-checkpoint.test.ts` |
| `U-ISAG-023` | `buildIssueGovernanceCommitBundle` | write set順序差を同digestへ正規化し、pending proposalとterminal dispositionのoperation再利用を拒否 | `HAC-HIL-05a`, `HAC-HIL-05b` | supporting | `tests/issue-governance-transaction.test.ts` |
| `U-ISAG-024` | `commitIssueGovernanceBundle` | 各append faultでevent/projection/receipt/node/edgeが全て0。同operation同digestは一件、異digestとstale headはconflict | `HAC-HIL-05a`, `HAC-HIL-05b` | supporting | `tests/issue-governance-transaction.test.ts` |
| `U-ISAG-025` | `reconcileIssueGovernanceCommit` | immutable evidence一致時だけprojection/receiptを再構築し、authority/scopeを新規推論しない | `HAC-HIL-05a` | supporting | `tests/issue-governance-reconcile.test.ts` |

## §1 合否

22/22でRed/Green、HAC、exact HST/failure、Result、event/write/claim/apply/close count、digest、stable orderを保存する。
pure testは外部runtime/GitHubを起動せずport resultを注入する。

## atomic state tuple台帳

各caseを正本stateとU oracleへ一対一で結線する。

| HST case識別子 | `pre_state` | `expected_state` | 正本failure | U結線 |
|---|---|---|---|---|
| `HST-CASE-019-01` | `received` | `captured` | `なし（正常系）` | `U-ISAG-001` |
| `HST-CASE-019-02` | `received` | `received` | `HIL_DIRECTIVE_CUSTODY_MISSING` | `U-ISAG-001` |
| `HST-CASE-019-03` | `pending` | `pending` | `HIL_DIRECTIVE_DUPLICATE_TARGET_MISSING` | `U-ISAG-003` |
| `HST-CASE-019-04` | `pending` | `pending` | `HIL_DIRECTIVE_FALSE_POSITIVE_UNVERIFIED` | `U-ISAG-004` |
| `HST-CASE-019-05` | `pending` | `pending` | `HIL_DIRECTIVE_RISK_APPROVAL_MISSING` | `U-ISAG-005` |
| `HST-CASE-019-06` | `captured` | `captured` | `HIL_DIRECTIVE_CANCEL_UNAUTHORIZED` | `U-ISAG-005` |
| `HST-CASE-019-07` | `captured` | `captured` | `HIL_DIRECTIVE_APPEND_ONLY_VIOLATION` | `U-ISAG-002` |
| `HST-CASE-021-01` | `pending` | `verified` | `なし（正常系）` | `U-ISAG-007`, `U-ISAG-009` |
| `HST-CASE-021-02` | `pending` | `rejected` | `HIL_SCOPE_AUTHORITY_CYCLE` | `U-ISAG-008` |
| `HST-CASE-021-03` | `pending` | `rejected` | `HIL_SCOPE_MINIMUM_NECESSITY_MISSING` | `U-ISAG-010` |
| `HST-CASE-021-04` | `pending` | `rejected` | `HIL_SCOPE_ALTERNATIVE_MISSING` | `U-ISAG-011` |
| `HST-CASE-021-05` | `verified` | `rejected` | `HIL_SCOPE_BUDGET_EXCEEDED` | `U-ISAG-012` |
| `HST-CASE-023-01` | `closure_ready` | `merged_closed` | `なし（正常系）` | `U-ISAG-021` |
| `HST-CASE-023-02` | `closure_ready` | `closure_ready` | `HIL_CLOSURE_AUDIT_MISSING` | `U-ISAG-020` |
| `HST-CASE-023-03` | `closure_ready` | `closure_ready` | `HIL_CLOSURE_MEMORY_MISSING` | `U-ISAG-020` |
| `HST-CASE-023-04` | `closure_ready` | `closure_ready` | `HIL_CLOSURE_CHILD_OPEN` | `U-ISAG-020` |
| `HST-CASE-023-05` | `closure_ready` | `closure_ready` | `HIL_CLOSURE_ORACLE_MISSING` | `U-ISAG-020` |
| `HST-CASE-023-06` | `running` | `checkpointed` | `なし（正常系）` | `U-ISAG-022` |
| `HST-CASE-019-08` | `assertion_input_ready` | `assertion_pass` | `HIL_DIRECTIVE_CUSTODY_VIOLATION` | `U-ISAG-006` |
| `HST-CASE-021-06` | `assertion_input_ready` | `assertion_pass` | `HIL_UNJUSTIFIED_CAPABILITY` | `U-ISAG-013`, `U-ISAG-014` |
| `HST-CASE-021-07` | `assertion_input_ready` | `assertion_pass` | `HIL_SCOPE_AUTHORITY_INVALID` | `U-ISAG-009`, `U-ISAG-013` |
| `HST-CASE-023-07` | `assertion_input_ready` | `assertion_pass` | `HIL_CLOSURE_EVIDENCE_MISSING` | `U-ISAG-020` |
| `HST-CASE-021-08` | `assertion_input_ready` | `assertion_pass` | `HIL_SCOPE_AUTHORITY_CYCLE` | `U-ISAG-008` |
| `HST-CASE-021-09` | `assertion_input_ready` | `assertion_pass` | `HIL_SCOPE_NECESSITY_MISSING` | `U-ISAG-010` |
| `HST-CASE-019-09` | `assertion_input_ready` | `assertion_pass` | `HIL_DIRECTIVE_TERMINATED_BY_AI` | `U-ISAG-005` |
| `HST-CASE-021-10` | `assertion_input_ready` | `assertion_pass` | `HIL_SCOPE_DERIVATION_CYCLE` | `U-ISAG-008` |
