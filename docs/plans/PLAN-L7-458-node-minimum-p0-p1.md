---
plan_id: PLAN-L7-458-node-minimum-p0-p1
title: "PLAN-L7-458 (impl): Node Minimum P0–P1 isolated evidence"
kind: impl
layer: L7
drive: fullstack
status: draft
route_mode: forward
entry_signals:
  - "po_directive:2026-07-16 PLAN-L1-07 / HDS-HIL-13 Node Minimum P0-P1 pair-freeze implementation"
created: 2026-07-16
updated: 2026-07-16
owner: Codex / TL
irreversible_impact: none
backprop_decision: not_required
backprop_decision_reason: "HDS-HIL-13のconfirmed scopeを変更せず、P0–P1のisolated evidenceだけをL7へ降下する。"
parent_design: docs/design/helix/L6-function-design/node-runtime-cutover.md
pair_artifact: docs/test-design/helix/L6-node-runtime-cutover-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/node-runtime-cutover.md, oracle_id: U-NCUT-006, test_path: tests/node-runtime-cutover-toolchain.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/node-runtime-cutover.md, oracle_id: U-NCUT-007, test_path: tests/node-runtime-cutover-toolchain.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/node-runtime-cutover.md, oracle_id: U-NCUT-008, test_path: tests/node-runtime-cutover-toolchain.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/node-runtime-cutover.md, oracle_id: U-NCUT-009, test_path: tests/node-runtime-cutover-toolchain.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/node-runtime-cutover.md, oracle_id: U-NCUT-010, test_path: tests/node-runtime-cutover-toolchain.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/node-runtime-cutover.md, oracle_id: U-NCUT-011, test_path: tests/node-runtime-cutover-gate.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/node-runtime-cutover.md, oracle_id: IT-NCUT-001, test_path: tests/node-runtime-cutover-integration.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/node-runtime-cutover.md, oracle_id: IT-NCUT-002, test_path: tests/node-runtime-cutover-integration.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/node-runtime-cutover.md, oracle_id: IT-NCUT-003, test_path: tests/cli-surface.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/node-runtime-cutover.md, oracle_id: IT-NCUT-004, test_path: tests/distribution-acceptance.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/node-runtime-cutover.md, oracle_id: IT-NCUT-005, test_path: tests/state-db.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-458-node-minimum-p0-p1.md, artifact_type: markdown_doc }
  - { artifact_path: tests/node-runtime-cutover-toolchain.test.ts, artifact_type: test_code }
  - { artifact_path: tests/node-runtime-cutover-gate.test.ts, artifact_type: test_code }
  - { artifact_path: tests/node-runtime-cutover-integration.test.ts, artifact_type: test_code }
  - { artifact_path: tests/cli-surface.test.ts, artifact_type: test_code }
  - { artifact_path: tests/distribution-acceptance.test.ts, artifact_type: test_code }
  - { artifact_path: tests/state-db.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L1-07-infinity-loop-platform-requirements.md
  requires:
    - docs/adr/ADR-009-node-python-linux-runtime.md
    - docs/design/helix/L5-detail/node-runtime-cutover.md
    - docs/design/helix/L6-function-design/node-runtime-cutover.md
    - docs/test-design/helix/L6-node-runtime-cutover-unit-test-design.md
    - docs/test-design/helix/L5-node-runtime-cutover-integration-test-design.md
agent_slots:
  - { role: se, slot_label: "SE - Node Minimum P0-P1実装" }
  - { role: qa, slot_label: "QA - Red/Greenとisolated evidence監査" }
---

# PLAN-L7-458: Node Minimum P0–P1 isolated evidence

## 1. 目的と固定境界

親PLAN `PLAN-L1-07`、design slice `HDS-HIL-13`のうち、Node Minimum P0–P1だけを実装する。
実装contractはTypeScript strict、`Node >=24.15.0 <25`、Node/npm、canonical lockを`package-lock.json`一つ、
frozen installを`npm ci`、SQLite driverを`node:sqlite`、実行環境をLinux-primaryへexactに固定する。

本PLANが発行できるのは`helix-node-minimum-receipt.v1`だけであり、常に`terminal=false`である。
開始時と完了時のactive execution authorityは既存Bun経路のまま変えない。Node Minimum greenをBun cutover、
terminal activation、配布切替、Bun撤去完了へ読み替えてはならない。

## 2. pair-freeze対象

| 層 | exact oracle | 実装対象 |
|---|---|---|
| L7 unit | `U-NCUT-006` | `validateNodeRuntime`: `>=24.15.0 <25`、LTS、required featureを決定的に評価する |
| L7 unit | `U-NCUT-007` | `validateNodeLock`: npm + `package-lock.json` + `npm ci`のfrozen tree一致を検証する |
| L7 unit | `U-NCUT-008` | `planNodeSourceExecution`: Node source graphを解決しBun loader/command 0、write 0を保証する |
| L7 unit | `U-NCUT-009` | `planNodeBuild`: ESM/bin/target/externalを固定しBun build commandを拒否する |
| L7 unit | `U-NCUT-010` | `verifyNodeArtifact`: digest、shebang/bin、source parity、embedded Bun marker 0を検証する |
| L7 unit | `U-NCUT-011` | `evaluateNodeMinimum`: P0–P1 workflowだけを評価し`terminal=false`を固定する |
| L8 integration | `IT-NCUT-001` | Bunなしclean LinuxでNode/npmを固定し`npm ci`を実行する |
| L8 integration | `IT-NCUT-002` | clean install後にNode runnerでtypecheck、lint、targeted/full testを実行する |
| L8 integration | `IT-NCUT-003` | Node source runnerでread-only CLI smokeを行いBun loader 0を証明する |
| L8 integration | `IT-NCUT-004` | source→ESM build→binのversion、schema、exit、主要command parityを証明する |
| L8 integration | `IT-NCUT-005` | `node:sqlite`でmigration、transaction、rebuild、queueを検証する |

## 3. Red → Green実行順

1. **Red**: `U-NCUT-006..011`と`IT-NCUT-001..005`を先に追加し、未実装API、非対応Node、lock drift、
   Bun loader混入、artifact不一致、workflow欠落、`terminal=true`、`node:sqlite`非互換が期待するfailure codeで落ちる証拠を保存する。
2. **Green / unit**: pure validator/planner/verifier/gateを最小実装し、`U-NCUT-006..011`だけをgreenにする。
3. **Green / integration**: Bunなしclean Linux、Node/npm、`npm ci`、Node source CLI、ESM artifact、`node:sqlite`の順に
   `IT-NCUT-001..005`をgreenにする。
4. **Receipt**: fixed HEAD、exact Node version、npm version、`package-lock.json` digest、installed tree digest、
   `node:sqlite` API・組込SQLite version・compile options、artifact/workflow digestを限定receiptへbindする。

Red evidenceなしのGreen、mock exit 0だけのGreen、開発端末の既存install tree流用、Bunが存在するLinux evidenceは
pair-freeze成立として扱わない。

## 4. 非対象

- `U-NCUT-001..005`の全surface inventory/Bun finding/historical allowlist実装
- `U-NCUT-012..015`および`IT-NCUT-006`以降のBun cutover、activation、terminal、rollback実装
- active execution authority、current pointer、hook、distribution、CI authorityの切替
- Bun経路、Bun lock、known-good rollback経路の削除
- Python worker、Python toolchain、旧Python runtimeのbulk port

## 5. 完了条件

- `U-NCUT-006..011`と`IT-NCUT-001..005`がRed evidenceからGreenへ遷移し、各oracle citationと実test pathが一致する。
- Linux-primaryのBunなしclean環境で`Node >=24.15.0 <25`、npm、`package-lock.json`、`npm ci`、`node:sqlite`を使用した
  isolated evidenceが再現可能である。
- Node Minimum receiptは`terminal=false`で、P0–P1以外のworkflowをPASS分母へ混入させない。
- 完了後もactive execution authorityは既存Bun経路であり、Node artifactをcurrentへ切り替えるwriteは0である。
- Bun cutover、terminal completion、HAC-HIL-13a達成を主張するreceiptや文言を生成しない。
