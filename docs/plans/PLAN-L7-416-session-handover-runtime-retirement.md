---
plan_id: PLAN-L7-416-session-handover-runtime-retirement
title: "PLAN-L7-416: session handover runtime retirement — event-first continuation移管・旧surface撤去・復活防止"
kind: impl
layer: L7
drive: be
status: confirmed
route_mode: forward
entry_signals:
  - "po_directive:2026-07-11 /goal — PLAN-REVERSE-344 R4 + PLAN-L6-61 confirmed設計に従い、session/prose handoverをDB continuation projection、bounded memory、feedback lifecycleへ移管し、旧CLI/CURRENT/writer/readerを撤去する。"
created: 2026-07-11
updated: 2026-07-11
backprop_decision: not_required
backprop_decision_reason: "L0-L6とL8/L9/L12/L14はPLAN-REVERSE-344 R3/R4でfullback・freeze済み。本PLANはconfirmed L6 contractのTDD実装で意味変更を行わない。"
owner: Codex / TL
parent_design: docs/design/harness/L6-function-design/handover-retirement.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: se
    slot_label: "SE — retirement journal、continuation writer/replayer、delivery receipt、archive reconcile実装"
  - role: qa
    slot_label: "QA — U-HRET-002..014、IT-CONT-01..04、fresh/brownfield/resurrection負例"
  - role: tl
    slot_label: "TL — phase/rollback境界、provider/operations preserve、atomic surface撤去レビュー"
generates:
  - artifact_path: docs/plans/PLAN-L7-416-session-handover-runtime-retirement.md
    artifact_type: markdown_doc
  - artifact_path: src/runtime/continuation.ts
    artifact_type: source_module
  - artifact_path: src/runtime/retirement-preserve.ts
    artifact_type: source_module
  - artifact_path: src/lint/handover-resurrection.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
  - artifact_path: src/setup/index.ts
    artifact_type: source_module
  - artifact_path: tests/handover-retirement-runtime.test.ts
    artifact_type: test_code
  - artifact_path: tests/continuation-event-first.test.ts
    artifact_type: test_code
  - artifact_path: tests/retirement-preserve.test.ts
    artifact_type: test_code
  - artifact_path: tests/handover-resurrection.test.ts
    artifact_type: test_code
  - artifact_path: docs/test-design/harness/L8-unit-test-design.md
    artifact_type: test_design
  - artifact_path: docs/test-design/harness/L9-integration-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L6-61-handover-retirement.md
  requires:
    - docs/plans/PLAN-REVERSE-344-session-handover-retirement-backprop.md
    - docs/plans/PLAN-L6-61-handover-retirement.md
    - docs/plans/PLAN-L6-62-harness-memory-structure.md
    - docs/plans/PLAN-L6-63-feedback-lifecycle.md
    - docs/plans/PLAN-L6-64-memory-cross-runtime-surface.md
  references:
    - docs/governance/session-handover-retirement-disposition.md
    - docs/test-design/harness/L9-integration-test-design.md
    - docs/test-design/harness/L9-system-test-design.md
    - src/handover/index.ts
review_evidence:
  - reviewer: codex-tl-sprint4-audit
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-11T08:08:20+09:00"
    tests_green_at: "2026-07-11T08:08:03+09:00"
    verdict: approve
    scope: "Sprint 4のprovider real10、operations real4、archive real7、recursive inventory、canonical retention、query/export、target filesystem reconcile、phase fence/nonjoinを独立レビューしblocker 0を確認。Sprint 3/5とproduction orchestration配線は未達。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/retirement-preserve.test.ts tests/handover-retirement-runtime.test.ts tests/handover-retirement.test.ts tests/provider-handover.test.ts tests/continuation-event-first.test.ts tests/plan-lint.test.ts tests/vmodel-pair.test.ts tests/design-language.test.ts --reporter=dot && bun src/cli.ts plan lint && bun run typecheck && bunx biome check src/runtime/retirement-preserve.ts tests/retirement-preserve.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-11T08:08:03+09:00"
        evidence_path: tests/retirement-preserve.test.ts
        output_digest: "sha256:ad2e56fd5535811a045fdda5483fcf031aa7ae61a97f154125dda108452567df"
  - reviewer: codex-tl-sprint2-audit
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-11T07:31:57+09:00"
    tests_green_at: "2026-07-11T07:31:36+09:00"
    verdict: approve
    scope: "Sprint 2のevent-first/fsync/fencing、semantic UNIQUE、crash replay、DB precedence、memory/feedback lifecycle join、delivery journal/receipt/CASを独立レビューしblocker 0を確認。production route切替、Sprint 3以降、IT-CONT-04、retirement-readyは未達。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/continuation-event-first.test.ts tests/handover-retirement-runtime.test.ts tests/state-db.test.ts tests/memory/memory-v2.test.ts tests/feedback-lifecycle.test.ts tests/feedback-lifecycle-surface.test.ts tests/plan-lint.test.ts tests/vmodel-pair.test.ts tests/design-language.test.ts --reporter=dot && bun src/cli.ts plan lint && bun run typecheck && bunx biome check src/runtime/continuation.ts src/state-db/index.ts src/state-db/migration.ts src/schema/harness-db.ts src/schema/harness-db-types.ts src/schema/harness-db-tables-core.ts src/schema/harness-db-indexes.ts tests/continuation-event-first.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-11T07:31:36+09:00"
        evidence_path: tests/continuation-event-first.test.ts
        output_digest: "sha256:dd293d17b523cc7917d3d282fecdf44c5287dfcd5bc258323b5dc16753fb6f30"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-11T07:00:11+09:00"
    tests_green_at: "2026-07-11T06:59:32+09:00"
    verdict: approve
    scope: "Sprint 1のcheckpoint chain、phase edge、journal recovery、typed intent、manifest reconcile、rollback provenanceを独立レビューしfreeze blocker 0を確認。Sprint 2以降と旧surface撤去は未完。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run typecheck && bunx biome check src/runtime/continuation.ts tests/handover-retirement-runtime.test.ts && bun run vitest run tests/handover-retirement-runtime.test.ts tests/handover-retirement.test.ts tests/plan-lint.test.ts tests/vmodel-pair.test.ts tests/design-language.test.ts --reporter=dot && bun src/cli.ts plan lint"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-11T06:59:32+09:00"
        evidence_path: tests/handover-retirement-runtime.test.ts
        output_digest: "sha256:d5674058d93db328a75fb2d0e55a02d53ba4f2b81ea8376dc672e08adb6f0781"
---

# PLAN-L7-416: session handover実行面の廃止

## 0. 実装境界

本PLANはsession/prose handoverのruntime撤去を行う。provider delegation evidenceとoperations transitionは
削除・移動・continuation joinの対象外である。`.helix`識別子renameはPLAN-M-02承認前のため行わない。

R1 inventory gateのgreenをretirement完了証拠にしない。`retirement-ready=true`はU-HRET-002..014、
IT-CONT-01..04、fresh/brownfield consumer、distribution、resurrection detectorがすべてgreenになった後だけ許可する。

## 1. TDD slice

### Sprint 1 — 前提条件・journal・backup

- Red: canonical `intentDigest`、status値域、隣接phase edge、異intent replay、rollback window、backup digestの負例。
- Green: append-onlyのretirement journal、checkpoint loader、backup/preserve manifest、phase evaluatorを実装する。
- Oracle: U-HRET-002/004/009/010。

### Sprint 2 — event-first継続状態・delivery

- Red: append失敗、append後・projection前、projection後・memory前、DB消失、同sequence異payload、並行replay。
- Green: `appendContinuationEvent`→`projectContinuationEvent`→checkpoint公開、replayer/rebuilder、
  delivery receipt projectionとappend-only delivery event。
- JSONLとSQLiteを同一transactionと見なさない。DB precedenceを維持し、memoryでDBを上書きしない。
- Oracle: U-HRET-003/005/006/007、IT-CONT-01/02。

### Sprint 3 — 旧surfaceの無効化・撤去

- Red: `helix handover`、`handover status`、CURRENT writer/reader、Stop/plan complete生成、setup/template/task/CI生成。
- Green: status/completion/memory/feedback surfaceへ置換し、legacy CLI route/import/writer/readerを撤去する。
- `src/handover/`削除は全consumer import 0とrollback cutoff通過後に限定する。
- Oracle: U-HRET-007/011/013、IT-CONT-04。

### Sprint 4 — archive・保持完全性

- Red: archive件数・digest不一致、provider/operations count/digest/provenance/schema/query/export/retention drift。
- Green: reconcile済みarchiveとpreserve manifestを確定し、一致前のsource削除を拒否する。
- Oracle: U-HRET-008/009/010。

### Sprint 5 — 復活検出・残存検査・配布

- Red: command/module/schema/panel/CURRENT path/writerの再追加、provider/operations誤検出、allowlist外residual。
- Green: AST/symbol/path manifestを使うresurrection hard gateをdoctorへ配線し、fresh/brownfield/distributionを検証する。
- 対応oracle: `U-HRET-012/014`、`IT-CONT-03`、`ST-DATA-06`、`ST-ARCH-05`。

## 2. 工程表（schedule steps）

- step 1 (mode: serial): [直列] 依存PLAN terminal status・green command digest・R4 freezeを再検証する。理由: precondition未充足でmutationを開始しないため。
- step 2 (mode: serial): [直列] Sprint 1をRed→Green→Refactorで実装する。理由: 全後続mutationのjournal/rollback基盤になるため。
- step 3 (mode: serial): [直列] Sprint 2をRed→Green→Refactorで実装する。理由: 旧read/writeを止める前にcontinuation受け皿を実証するため。
- step 4 (mode: parallel): [並列] Sprint 3のconsumer inventoryとSprint 4のpreserve/archive fixtureを分離して作成する。
- step 5 (mode: serial): [直列] Sprint 3/4のGreenを統合しlegacy surfaceをdisable/removeする。理由: preserve照合前の削除を防ぐため。
- step 6 (mode: serial): [直列] Sprint 5、IT-CONT、fresh/brownfield/distribution回帰を実行する。理由: resurrectionと生成面を最終状態で測るため。
- step 7 (mode: serial): [直列] worker≠reviewerのレビュー、full doctor、R4 acceptance packetを記録する。理由: 自己評価でretirement完了を閉じないため。

## 3. 受入条件

- U-HRET-002..014とIT-CONT-01..04が実`test_code`へ1:1 citationされgreen。
- provider/operations preserve manifestがretirement前後でcount/digest/provenance/schema/query/export/retention一致。
- legacy CLI/path/import/writer/reader/CURRENT/prose generatorがactive sourceとgenerated consumer surfaceで0。
- resurrection detectorがcommand/module/schema/panel/path/writer再追加をhard failし、preserve型を誤検出しない。
- crash全window、同sequence異payload、DB全rebuild、delivery dedupe/receipt再構築がgreen。
- `retirement-ready=true`、doctor relevant gates、typecheck、Biome、targeted/full verificationがgreen。
- review_evidenceはworker≠reviewer、green_commandsのexit code・digest・evidence pathを保持する。

## 3.1 実装進捗

- Sprint 1: **freeze済み**。U-HRET-002/004/009/010を`src/runtime/continuation.ts`と
  `tests/handover-retirement-runtime.test.ts`へ実装した。
- Sprint 2: **freeze済み**。event-first writer、DB projection/rebuild、DB precedence、delivery receiptの
  U-HRET-003/005/006/007・IT-CONT-01/02 runtime sliceは、actual 2 process raceを含む177 testsと
  独立レビューblocker 0でfreezeした。production routeは未切替である。
- Sprint 4: **freeze済み**。provider実体10件 / operations実体4件 / archive実体7件を
  再帰inventory、正規retention、query/export、target filesystem照合、
  phase fence/nonjoinへ束縛し、159 testsと独立レビューblocker 0でfreezeした。
- Sprint 5: **shadow slice実装済み・Red再開**。TypeScript AST/symbol/path detector、typed
  provider/operations/archive allowlist、baseline digest、checkpoint由来mode、doctor負例を
  `src/lint/handover-resurrection.ts`、`src/doctor/index.ts`、`tests/handover-resurrection.test.ts`へ束縛した。
  pre-cutoverでは既知findingをtelemetry、新規findingだけをhard failする。独立レビューでscan root、
  TS generated token、subpath import、composed writer pathの盲点を検出し是正した。baselineはimmutable Git
  revision/blob/file/semantic digestとcode pinの二段ratchet、preserve allowlistはR4時点path/kind/digest authorityと
  real collector/strict validatorへ束縛し、同時digest更新・provider削除・caller boolean spoofをfail-closeした。
  production mode loaderはstrict retirement journal、unique complete scope、terminal line digest、preserve digest、
  approval authorityを束縛した。PO confirmation前はenforce authorityのcode pinを`null`固定し、complete journalが
  先行してもfail-closeする。実cutover pinとfresh/brownfield/distribution oracleはblockerとして未達であり、
  Sprint 5 freezeはrejectのままとする。
- Sprint 3: **未着手**。PO confirmation前に旧`helix handover` surfaceを削除しない。
- PLAN全体のretirement完了、`retirement-ready=true`、acceptは未達である。

## 4. rollback・escalation境界

- rollbackは`legacy_write_disabled`到達前だけ許可する。到達後は旧reader/writerを復活させずforward fixする。
- provider/operations evidenceのdigest不一致、backup/reconcile不成立、secret/PII検知、destructive data loss疑義は即停止する。
- 本PLANは認証・認可・決済・本番infra・外部API変更を含まない。scope拡大が必要ならPOへescalateする。
