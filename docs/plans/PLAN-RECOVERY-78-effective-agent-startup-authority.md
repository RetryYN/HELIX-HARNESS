---
plan_id: PLAN-RECOVERY-78-effective-agent-startup-authority
title: "PLAN-RECOVERY-78: Effective Agent Startup Authority の収束"
kind: recovery
layer: cross
drive: agent
status: draft
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: "1.1.6"
  registry_source_digest: "sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89"
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - "po_directive:Issue #1370 agent startup authority drift監査を恒久追従契約へ束縛する"
created: 2026-09-02
updated: 2026-09-02
owner: Codex TL
github_issue_id: 1370
engineering_discipline_required: true
behavior_contract_id: EFFECTIVE-AGENT-STARTUP-AUTHORITY-001
responsibility_owner: effective-agent-startup-authority
change_slice: atomic
refactor_step: inventory
legacy_retirement_state: retained
no_code_decision: document_only
ddd_modeling_decision: required
contract_preconditions: "Requirement IR、workflow registry、provider hook、agent roster、worker-context、setup templateは存在するが、agentが最初に読むeffective contractへ同一HEAD・digestで合成されていない"
contract_postconditions: "監査gap、既存owner、更新trigger、追従義務、終端条件がmachine-readable inventoryへ束縛され、後続authority/runtime sliceがexact partitionされる"
contract_invariants: "Issue本文やMarkdownをRequirement IRの代替正本にせず、既存Issueのruntime責務を重複実装せず、release/tag/cutover approval境界を変更しない"
contract_failures: "旧Requirement Markdown、旧V-pair、旧drive/mode、unsupported hook、blocked roster、未生成worker-context、既知の長時間hookがstartupまたはconsumerへ再注入される"
tdd_red_required: false
complexity_effect: net_neutral
complexity_justification: "本sliceは追跡authorityと責務分割のみを追加し、runtime実装は既存ownerと後続原子sliceへ委譲する"
removal_trigger: "Effective Agent Startup Contractがcanonical registry、compiler、doctor、consumer smokeへ実装され、本inventory全findingがterminal evidence付きでclosedになった時"
pair_artifact: docs/governance/effective-agent-startup-followup-registry.json
agent_slots:
  - { role: tl, slot_label: "TL — 横断authorityと責務分割" }
  - { role: aim, slot_label: "AIM — startup authority driftの原因分類と再発経路の同定" }
  - { role: qa, slot_label: "QA — startup/consumer再注入gapの反例設計" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-78-effective-agent-startup-authority.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/effective-agent-startup-followup-registry.json, artifact_type: json_config }
modifies:
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
dependencies:
  parent: null
  requires: []
  blocks: []
related_adr:
  - docs/adr/ADR-001-helix-harness-redesign-and-language.md
  - docs/adr/ADR-009-node-python-linux-runtime.md
related_docs:
  - requirements-ir/manifest.json
  - docs/governance/l12-canonical-vmodel-direction-directive_v0.1.md
  - docs/governance/effective-agent-startup-followup-registry.json
---

# PLAN-RECOVERY-78: Effective Agent Startup Authority の収束

## §0 PLAN

Issue #1370で確認した起動時authority driftを、個別文書の置換ではなく、Requirement IR・workflow・runtime policyから
決定的に合成されるEffective Agent Startup Contractへ収束する。

## §1 目的

agentが読むAGENTS/CLAUDE、subagent/command、hook、worker-context、setup/consumerを独立正本からprojectionへ降格し、
正しいauthorityが存在しても起動時に旧epochへ戻る経路を閉じる。

## §2 背景

2026-09-02の監査では、Markdown v1.3のfirst-read、旧L0-L14/drive model、旧V-pair、Codex hook version不一致、
7230秒memory wakeのconsumer再配布、roster/guard/API schema不一致、worker-context生成経路不在を実測した。

## §3 実装計画

1. inventoryを基準HEADとevidence pathへ束縛する。
2. startup read-order、semantic obligation、agent/command taxonomy、hook parity、worker-context、consumer propagationを分割する。
3. requirements/IR、workflow、provider、hook、roster、V-pair、review authority、distributionの変更を追従trigger化する。
4. 各既存Issueのterminal evidenceをaggregateし、未収束surfaceをdoctorでfail-closeする。
5. Issue #1372のDocument Authority Censusをauthority-firstで接続し、文書class、lifecycle、逆向きconsumer graph、
   generator propagationを別oracleとして追跡する。
6. Reverse fullbackとcurrent-main read-afterでinventoryを閉じる。

## §4 受入条件 / DoD

- [ ] inventoryの全findingにowner Issue、evidence path、trigger、terminal conditionがある
- [ ] first-read authorityがRequirement IR JSON-only rootへ収束する
- [ ] semantic obligation単位でsource digestとeffective valueを比較する
- [ ] provider API schemaとguard required payloadの不一致を起動前に拒否する
- [ ] 本体のblocked/degraded capabilityをconsumerへ再配布しない
- [ ] wrong root/worktree/HEAD/digestを個別にfail-closeする
- [ ] active consumerとgeneratorからstale/compatibility/historical文書へ到達するedgeをfail-closeする
- [ ] doctor、full regression、consumer smoke、独立exact-HEAD reviewがgreen
- [ ] Reverse fullbackとmain read-afterが完了する

## §5 関連 PLAN / ADR / docs

- 親Issue: #1370
- 既存owner: #581 / #248 / #322 / #1215 / #1098 / #895 / #206 / #863 / #864
- 要求authority連携: #825 / #1364 / #397
- 文書authority全数監査: #1372

## §6 用語更新

- `Effective Agent Startup Contract`: machine authorityから合成され、agentの起動時に実際に適用される契約。
- `startup obligation`: source authority、effective value、applicability、意図的差分、digestを持つ追従単位。

## §7 機能要求更新

本Recovery sliceではcanonical FRを追加しない。後続authority sliceでRequirement IRへmaterializeする。
