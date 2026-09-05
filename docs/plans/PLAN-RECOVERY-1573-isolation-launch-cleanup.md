---
plan_id: PLAN-RECOVERY-1573-isolation-launch-cleanup
title: "隔離起動capabilityの一度限り消費と例外資源回収"
kind: recovery
layer: cross
drive: agent
status: draft
completion_claim_allowed: false
created: 2026-09-06
updated: 2026-09-06
owner: Codex / TL
github_issue_id: 1543
behavior_contract_id: WCC-FR-03
responsibility_owner: worker-isolation-broker
entry_signals: [regression_dev]
agent_slots:
  - { role: aim, slot_label: "AIM — 既存隔離契約の資源寿命を照合" }
  - { role: tl, slot_label: "TL — ガードと隔離実行の責務境界を検収" }
  - { role: se, slot_label: "SE — 起動例外の資源回収を修復" }
  - { role: qa, slot_label: "QA — 再入・終了・継続可能性を反例検証" }
parent_design: docs/design/helix/L6-function-design/worker-isolation-broker.md
pair_artifact: docs/test-design/helix/L8-worker-isolation-broker-runtime-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/worker-isolation-broker.md, oracle_id: U-WIB-CLEANUP-001, test_path: tests/worker-isolation-broker.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-isolation-broker.md, oracle_id: U-WIB-CLEANUP-002, test_path: tests/worker-isolation-broker.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-isolation-broker.md, oracle_id: U-WIB-CLEANUP-003, test_path: tests/worker-isolation-broker.test.ts }
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
dependencies:
  requires: []
  references: ["issue:1543", "issue:226", PLAN-L7-499-worker-isolation-broker]
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-1573-isolation-launch-cleanup.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/design/helix/L4-basic-design/work-graph-receipt-acceptance.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-context-authority.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-independent-review.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-isolation-broker.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-lifecycle-receipt.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L5-detail/work-graph-receipt-acceptance.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L5-detail/worker-context-authority.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L5-detail/worker-independent-review.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L5-detail/worker-isolation-broker.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L5-detail/worker-lifecycle-receipt.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L6-function-design/worker-isolation-broker.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-worker-isolation-broker-runtime-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/runtime/worker-isolation-broker.ts, artifact_type: source_module }
  - { artifact_path: tests/worker-isolation-broker.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
review_evidence: []
---

# 隔離起動の資源寿命修復

agent_slotsは計画上の責務であり、agent起動実績や独立レビュー証拠ではない。
既存WCC-FR-03とL6 brokerのbounded executionを修復する。新しい配車・認証・
承認・sandbox engineは追加しない。既存の隔離policyや出力検査は緩和しない。

## 欠陥と修復境界

基準main `8f835e23c8d4110260d1eff97c9b167987bff37d`。
注入spawnが例外を投げた場合、既存実装はFDと内部mapを回収せず、同じlaunchの再利用も許した。
Issue #1543 comment 5554716261へ実測を記録した。実providerの障害・隔離突破実績とは区別する。

起動前にsealed identityを消費し、引数構築・spawnをfinallyで囲む。
終了状態にかかわらず内部mapを削除し、backend/runtimeの両FDを閉鎖する。
再入と同objectの再試行はspawn前に拒否する。再試行はadmissionを再検証するprepareから
新しいlaunchを生成する。起動例外は成功receiptに変換せず伝播する。

## 反例と局所実測

- 2026-09-06 05:55 JST、U-WIB-CLEANUP-001は既存実装でFDが閉じずRED（exit 1）。
- 05:56 JST、finally修正後に同testがGREEN。注入例外、FD閉鎖、再利用spawn 0を検証。
- U-WIB-CLEANUP-002は非zero/null終了、実行中再入、終了後再利用を検査する。
  null終了は注入値であり、実timeout試験ではない。
- U-WIB-CLEANUP-003は正当な出力の受理とFD閉鎖、同launch拒否、新launchの正常継続を検査する。
- 06:03:37 JSTのbroker回帰は27 passed / 1 skipped、4.41秒、exit 0。
  bubblewrap不足で実process試験U-WIB-007は未実施。実環境隔離完了とは主張しない。
- 型検査とgit diff --checkはexit 0。PLAN追加後の最終差分、CI、独立レビュー、
  main read-afterは別途検証し、これらの局所結果で代替しない。

## 残る親責務

#1543のガード再設計、全runtimeへの隔離接続、実Linux/Windows挙動、資源上限、
原稿削除の運用改善は本sliceだけでは終端しない。旧engine退役・外部配布も非対象。

## PLAN・設計bindingの最終追従

brokerの変更後SHA256をL4/L5の既存参照10件へ投影した。参照先・export・failure条件は不変。
PLAN lintは594件のbinding、findings 0、採番の新規衝突0でexit 0。
parameterized testを通常test内の二値loopへ変更し、PLAN oracle抽出へ対応させた。
検査条件の削除ではなく、非zero/nullと各々の再入・再利用・FD回収を維持する。

06:08:26開始のbroker＋design-reality-binding回帰は55 passed / 1 skipped、109.06秒。
途中でtest宣言形を変更したため、その結果だけを最終差分の証拠にしない。
06:10:58に最終brokerを再実行し26 passed / 1 skipped、4.58秒、exit 0。
型検査exit 0、Biomeはerror 0・既存unused import警告9件。DB再構築は80994行で成功。
mutationの一時testをDB走査と並列にするとENOENTが発生したため、同一worktreeでは直列化した。
実bubblewrap・現HEAD CI・独立レビュー・main read-afterは引き続き未完了。
