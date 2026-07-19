---
plan_id: PLAN-L7-271-cutover-source-ledger-hardening
title: "PLAN-L7-271: L14 cutover source ledger 強化"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "不可逆 rename/cutover の承認前 source ledger 検査を強化する additive change。"
owner: TL (Codex)
parent_design: docs/test-design/harness/L7-unit-test-design.md
pair_artifact: tests/identifier-rename.test.ts
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - cutover source ledger hardening"
generates:
  - artifact_path: docs/plans/PLAN-L7-271-cutover-source-ledger-hardening.md
    artifact_type: markdown_doc
  - artifact_path: docs/process/forward/L08-L14-verification-phase.md
    artifact_type: markdown_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: docs/plans/PLAN-M-02-helix-identifier-rename.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/identifier-rename.ts
    artifact_type: source_module
  - artifact_path: tests/identifier-rename.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/test-design/harness/L7-unit-test-design.md
  requires:
    - src/lint/identifier-rename.ts
    - tests/identifier-rename.test.ts
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-03T16:45:00+09:00"
    tests_green_at: "2026-07-03T16:45:00+09:00"
    verdict: approve
    scope: "Cutover source ledger の expected URL / required field impact 検査と L14 承認前 source metadata の強化。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npm test tests/identifier-rename.test.ts --timeout 300000"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T16:45:00+09:00"
        evidence_path: tests/identifier-rename.test.ts
        output_digest: "sha256:589113ddd0e5a9a6d88748ce8fb89859d131c8101939c208189b9ffb4a101e7a"
      - kind: typecheck
        command: "npx --no-install tsc --noEmit"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T16:45:00+09:00"
        evidence_path: src/lint/identifier-rename.ts
        output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
      - kind: unit_test
        command: "npm test tests/design-language.test.ts tests/oracle-test-trace.test.ts --timeout 180000"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T16:45:00+09:00"
        evidence_path: tests/design-language.test.ts
        output_digest: "sha256:b6151b67799eb17f26419134bea8991b370f2ebac1a71242e71781e9ac1f674c"
---

# PLAN-L7-271: L14 cutover source ledger 強化

## 目的

`U-SOURCELEDGER-007` は Cutover source ledger の expected official URL と required field impact を固定検査すると定義していたが、
実装は必須 source 名の欠落検査に寄っていた。これでは source 名だけを残して URL や impact が古くなった ledger でも
不可逆 L14 cutover の承認材料に見えてしまう。

この PLAN は、Web で再確認した一次情報を Cutover source ledger と gate に束ね、rename/cutover の承認前証跡を
source 名だけの evidence に戻さない。

## 公式 source

- Google SRE Canarying Releases: <https://sre.google/workbook/canarying-releases/>。段階露出と監視で変更リスクを下げる根拠として参照する。
- Microsoft Safe Deployment Practices: <https://learn.microsoft.com/en-us/azure/well-architected/operational-excellence/safe-deployments>。段階展開、health model、rollback、blast radius 縮小の根拠として参照する。
- Microsoft Testing Strategy: <https://learn.microsoft.com/en-us/azure/well-architected/operational-excellence/testing>。不可逆変更前の security / regression / load evidence の根拠として参照する。
- GitHub Environments required reviewers: <https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments>。action-binding approval の reviewer evidence 根拠として参照する。

## 変更

- Cutover source ledger に Google SRE canarying、Microsoft safe deployment、Microsoft testing strategy を追加する。
- `REQUIRED_CUTOVER_SOURCE_LEDGER_ROWS` に同 row を追加する。
- 各 cutover source row の expected URL と required field impact を固定検査する。
- violation は `sourceLedgerFreshness.rowViolations[]` と `blockedReasons[]` に出す。
- `PLAN-M-02` と L7 test design の説明を同じ意味へ更新する。

## 境界

- `旧 state path -> .helix` の実 state move、CLI alias 有効化、package/bin rename は実行しない。
- `rename plan` は plan-only / mustNotApply のまま保持する。
- human/action-binding approval の代替判断はしない。

## 完了条件

- Cutover source ledger から該当 source row が欠けると blocked になる。
- URL または required field impact が欠けると `rowViolations[]` と `blockedReasons[]` に出る。
- targeted identifier-rename test、typecheck、design-language、plan governance、doctor が green。
