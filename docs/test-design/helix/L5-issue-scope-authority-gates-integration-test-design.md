---
title: "HELIX L8 結合テスト設計 — Issue・scope・authority gate"
layer: L5
executed_at_layer: L8
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
pair_artifact: docs/design/helix/L5-detail/issue-scope-authority-gates.md
next_pair_freeze: L5
requirements:
  - HR-FR-HIL-05
  - HAC-HIL-05a
  - HAC-HIL-05b
  - HAC-HIL-05c
---

# HELIX L8 結合テスト設計 — Issue・scope・authority gate

## §0 共通oracle

固定clock/ID、chat fixture、isolated harness.db、versioned gate policy、diff/authority/evidence/approval fixtureを使う。
各caseでcustody/event/gate/transition/closure count、root/path/scope/minimality/evidence/approval digestを直接検査する。未実装である。

failure tokenとは独立に、主oracleは次のatomic tupleをcaseごとにexactly-once assertする。境界oracle `IT-ISAG-010/011`はprimary表へ混入させない。

| L8主oracle | HST case識別子 | `pre_state` | `expected_state` | 正本failure |
|---|---|---|---|---|
| ↳ `IT-ISAG-001` | `HST-CASE-019-01` | `received` | `captured` | `なし（正常系）` |
| ↳ `IT-ISAG-002` | `HST-CASE-019-02` | `received` | `received` | `HIL_DIRECTIVE_CUSTODY_MISSING` |
| ↳ `IT-ISAG-003` | `HST-CASE-019-03` | `pending` | `pending` | `HIL_DIRECTIVE_DUPLICATE_TARGET_MISSING` |
| ↳ `IT-ISAG-003` | `HST-CASE-019-04` | `pending` | `pending` | `HIL_DIRECTIVE_FALSE_POSITIVE_UNVERIFIED` |
| ↳ `IT-ISAG-004` | `HST-CASE-019-05` | `pending` | `pending` | `HIL_DIRECTIVE_RISK_APPROVAL_MISSING` |
| ↳ `IT-ISAG-004` | `HST-CASE-019-06` | `captured` | `captured` | `HIL_DIRECTIVE_CANCEL_UNAUTHORIZED` |
| ↳ `IT-ISAG-005` | `HST-CASE-019-07` | `captured` | `captured` | `HIL_DIRECTIVE_APPEND_ONLY_VIOLATION` |
| ↳ `IT-ISAG-005` | `HST-CASE-019-08` | `assertion_input_ready` | `assertion_pass` | `HIL_DIRECTIVE_CUSTODY_VIOLATION` |
| ↳ `IT-ISAG-005` | `HST-CASE-019-09` | `assertion_input_ready` | `assertion_pass` | `HIL_DIRECTIVE_TERMINATED_BY_AI` |
| ↳ `IT-ISAG-006` | `HST-CASE-021-01` | `pending` | `verified` | `なし（正常系）` |
| ↳ `IT-ISAG-007` | `HST-CASE-021-02` | `pending` | `rejected` | `HIL_SCOPE_AUTHORITY_CYCLE` |
| ↳ `IT-ISAG-008` | `HST-CASE-021-03` | `pending` | `rejected` | `HIL_SCOPE_MINIMUM_NECESSITY_MISSING` |
| ↳ `IT-ISAG-008` | `HST-CASE-021-04` | `pending` | `rejected` | `HIL_SCOPE_ALTERNATIVE_MISSING` |
| ↳ `IT-ISAG-009` | `HST-CASE-021-05` | `verified` | `rejected` | `HIL_SCOPE_BUDGET_EXCEEDED` |
| ↳ `IT-ISAG-009` | `HST-CASE-021-06` | `assertion_input_ready` | `assertion_pass` | `HIL_UNJUSTIFIED_CAPABILITY` |
| ↳ `IT-ISAG-009` | `HST-CASE-021-07` | `assertion_input_ready` | `assertion_pass` | `HIL_SCOPE_AUTHORITY_INVALID` |
| ↳ `IT-ISAG-007` | `HST-CASE-021-08` | `assertion_input_ready` | `assertion_pass` | `HIL_SCOPE_AUTHORITY_CYCLE` |
| ↳ `IT-ISAG-008` | `HST-CASE-021-09` | `assertion_input_ready` | `assertion_pass` | `HIL_SCOPE_NECESSITY_MISSING` |
| ↳ `IT-ISAG-007` | `HST-CASE-021-10` | `assertion_input_ready` | `assertion_pass` | `HIL_SCOPE_DERIVATION_CYCLE` |
| ↳ `IT-ISAG-012` | `HST-CASE-023-01` | `closure_ready` | `merged_closed` | `なし（正常系）` |
| ↳ `IT-ISAG-013` | `HST-CASE-023-02` | `closure_ready` | `closure_ready` | `HIL_CLOSURE_AUDIT_MISSING` |
| ↳ `IT-ISAG-013` | `HST-CASE-023-03` | `closure_ready` | `closure_ready` | `HIL_CLOSURE_MEMORY_MISSING` |
| ↳ `IT-ISAG-014` | `HST-CASE-023-04` | `closure_ready` | `closure_ready` | `HIL_CLOSURE_CHILD_OPEN` |
| ↳ `IT-ISAG-014` | `HST-CASE-023-05` | `closure_ready` | `closure_ready` | `HIL_CLOSURE_ORACLE_MISSING` |
| ↳ `IT-ISAG-015` | `HST-CASE-023-06` | `running` | `checkpointed` | `なし（正常系）` |
| ↳ `IT-ISAG-016` | `HST-CASE-023-07` | `assertion_input_ready` | `assertion_pass` | `HIL_CLOSURE_EVIDENCE_MISSING` |

| ID | 前提／操作 | 期待結果 | HAC | exact HST disposition | test参照先 |
|---|---|---|---|---|---|
| `IT-ISAG-001` | 未収載user directiveを受信 | 分類器呼出前にappend-only custody一件、digest/span/actor/current revision | `HAC-HIL-05a` | `HST-CASE-019-01` → `なし（正常系）` | `tests/directive-custody.integration.test.ts` |
| `IT-ISAG-002` | custody transaction失敗、receipt欠落、stale revision、content digest不一致のままclassify/dedupe/各disposition APIを個別実行 | 全経路でclassification/disposition/Issue/transition増分0、received維持 | `HAC-HIL-05b` | `HST-CASE-019-02` → `HIL_DIRECTIVE_CUSTODY_MISSING` | `tests/directive-custody.integration.test.ts` |
| `IT-ISAG-003` | dead duplicate target、独立反証なしfalse-positiveを確定 | terminal event 0、pending＋appeal route | `HAC-HIL-05b` | `HST-CASE-019-03` → `HIL_DIRECTIVE_DUPLICATE_TARGET_MISSING`; `HST-CASE-019-04` → `HIL_DIRECTIVE_FALSE_POSITIVE_UNVERIFIED` | `tests/directive-disposition.integration.test.ts` |
| `IT-ISAG-004` | PO receiptなしaccepted-risk、AI actorでcancel | 原記録current、risk/cancel event 0 | `HAC-HIL-05b` | `HST-CASE-019-05` → `HIL_DIRECTIVE_RISK_APPROVAL_MISSING`; `HST-CASE-019-06` → `HIL_DIRECTIVE_CANCEL_UNAUTHORIZED` | `tests/directive-disposition.integration.test.ts` |
| `IT-ISAG-005` | custody UPDATE、AI reject/drop/cancel/close、AI/PO/独立review matrixを投入 | AI terminalは必ずErr＋event増分0、原記録可視。pending proposalは別operationだけでappendし、Ok/Errを同時返却しない | `HAC-HIL-05b` | `HST-CASE-019-07` → `HIL_DIRECTIVE_APPEND_ONLY_VIOLATION`; `HST-CASE-019-08` → `HIL_DIRECTIVE_CUSTODY_VIOLATION`; `HST-CASE-019-09` → `HIL_DIRECTIVE_TERMINATED_BY_AI` | `tests/directive-disposition.integration.test.ts` |
| `IT-ISAG-006` | current custody済みchat、confirmed L0、PO-approved parent scopeの各root receiptと最小性証拠からscope graphを解決 | 種類別provenanceを検証したacyclic unique root pathとscope receipt一件、反復digest同一、pending→verified | `HAC-HIL-05a` | `HST-CASE-021-01` → `なし（正常系）` | `tests/scope-authority.integration.test.ts` |
| `IT-ISAG-007` | capability自己参照、同時追加HIL cycle、複合cycleを個別投入 | root到達/receipt/claim 0、全cycle path列挙 | `HAC-HIL-05b` | `HST-CASE-021-02` → `HIL_SCOPE_AUTHORITY_CYCLE`; `HST-CASE-021-08` → `HIL_SCOPE_AUTHORITY_CYCLE`; `HST-CASE-021-10` → `HIL_SCOPE_DERIVATION_CYCLE` | `tests/scope-authority.integration.test.ts` |
| `IT-ISAG-008` | oracle寄与なし、代替比較なし、complexity/public surface/運用負債だけ増加 | scope receipt/claim 0、change atom別finding | `HAC-HIL-05b` | `HST-CASE-021-03` → `HIL_SCOPE_MINIMUM_NECESSITY_MISSING`; `HST-CASE-021-04` → `HIL_SCOPE_ALTERNATIVE_MISSING`; `HST-CASE-021-09` → `HIL_SCOPE_NECESSITY_MISSING` | `tests/scope-minimality.integration.test.ts` |
| `IT-ISAG-009` | budget超過、要求外CLI、循環/minimum proof欠落に加え、forged root kind、custody/L0/PO receipt欠落、stale revision、multiple-root conflictを個別投入 | implementation claim 0、authority invalidはreceipt 0、child Issueもparent authorityへ拘束 | `HAC-HIL-05b` | `HST-CASE-021-05` → `HIL_SCOPE_BUDGET_EXCEEDED`; `HST-CASE-021-06` → `HIL_UNJUSTIFIED_CAPABILITY`; `HST-CASE-021-07` → `HIL_SCOPE_AUTHORITY_INVALID` | `tests/scope-gate.integration.test.ts` |
| `IT-ISAG-010` | high-impact actionへapprovalなし、別actor/tool/target/params/snapshot/expiry approvalを個別投入 | apply/claim/merge 0、exact tuple一致だけapproval receipt | `HAC-HIL-05c` | `HST-CASE-017-08` → `HIL_ACTION_BINDING_APPROVAL_MISSING` | `tests/action-binding-gate.integration.test.ts` |
| `IT-ISAG-011` | Reverse/pair、CI predecessor、substance receiptを一件ずつ欠落・stale化 | ready/implement/merge 0、原cause tokenを保持 | `HAC-HIL-05a`, `HAC-HIL-05b` | `HST-CASE-002-08` → `HIL_ISSUE_GATE_BYPASS`; `HST-CASE-002-10` → `HIL_IMPLEMENTATION_NOT_READY`; `HST-CASE-003-05` → `HIL_CI_STAGE_BYPASS`; `HST-CASE-003-13` → `HIL_CI_RECEIPT_LINEAGE_INVALID`; `HST-CASE-018-09` → `HIL_REVERSE_SUBSTANCE_HOLLOW`; `HST-CASE-018-11` → `HIL_REVERSE_SEMANTIC_COVERAGE_INCOMPLETE` | `tests/issue-gate-chain.integration.test.ts` |
| `IT-ISAG-012` | 同一current head/snapshotへbindしたPR、merge、三段CI lineage、audit、oracle、memory、child state、PO authorityと非AI actorでclose | closure receipt一件、closure_ready→merged_closed、再送増分0 | `HAC-HIL-05a` | `HST-CASE-023-01` → `なし（正常系）` | `tests/issue-closure.integration.test.ts` |
| `IT-ISAG-013` | audit、memory receiptを個別欠落 | close/closure receipt 0 | `HAC-HIL-05b` | `HST-CASE-023-02` → `HIL_CLOSURE_AUDIT_MISSING`; `HST-CASE-023-03` → `HIL_CLOSURE_MEMORY_MISSING` | `tests/issue-closure.integration.test.ts` |
| `IT-ISAG-014` | child Issue open、oracle receipt欠落 | close 0、parent closure_ready維持 | `HAC-HIL-05b` | `HST-CASE-023-04` → `HIL_CLOSURE_CHILD_OPEN`; `HST-CASE-023-05` → `HIL_CLOSURE_ORACLE_MISSING` | `tests/issue-closure.integration.test.ts` |
| `IT-ISAG-015` | loop budget到達時に未完gateがある | close 0、durable checkpoint一件、再開時freshness再検査 | `HAC-HIL-05a` | `HST-CASE-023-06` → `なし（正常系）` | `tests/issue-gate-checkpoint.integration.test.ts` |
| `IT-ISAG-016` | PR、merge、三段CI、audit、oracle、memory、child set、current head/snapshot、PO authorityを一種類ずつ欠落/stale/別head化し、AI actor closeも投入 | 全current＋非AI actor時だけclosure receipt、各反例でclose 0、assertion_input_ready→assertion_pass | `HAC-HIL-05b` | `HST-CASE-023-07` → `HIL_CLOSURE_EVIDENCE_MISSING` | `tests/issue-closure.integration.test.ts` |
| `IT-ISAG-017` | disposition/authority/scope/transition bundleのevent、projection、receipt/evidence、node/edge各appendへ順番にfaultを注入し、同operation同digest／異digest、stale headを再送 | fault/CAS conflictは全write 0。同operation同digestは既存receipt一件、異digestはconflict。pending proposalとterminal operationは混同されず、immutable evidence reconcile後も同じprojection digest | `HAC-HIL-05a`, `HAC-HIL-05b` | supporting transaction oracle | `tests/issue-governance-transaction.integration.test.ts` |

## §1 合否

### custody admissionのAPI→U→IT厳密結線

| stable exact function set | owner U | owner IT | 固有mutation |
|---|---|---|---|
| `captureDirectiveBeforeClassification` → `validateDirectiveClassificationAdmission` | `U-ISAG-001` | `IT-ISAG-001`, `IT-ISAG-002` | captureはappend durability／operation conflict／receipt発行、admissionはmissing/stale/mismatched receiptと下流副作用0 |

### 補助API→U→IT exact join

`IT-ISAG-017`は`U-ISAG-023`,`U-ISAG-024`,`U-ISAG-025`をexact joinし、bundle build、atomic commit、immutable reconcileを一つずつfault injectionする。

16/16、primary HST 26/26、approval/dependency oracle、HAC、failureと独立したexact pre/expected state、event/receipt/digest、write/claim/apply/close countをassertする。
正常caseは`なし（正常系）`を保持する。AI summary、Issue存在、approval boolean、単独CI greenで代替しない。
