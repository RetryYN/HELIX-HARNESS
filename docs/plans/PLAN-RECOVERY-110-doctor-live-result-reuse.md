---
plan_id: PLAN-RECOVERY-110-doctor-live-result-reuse
title: "doctor出力検証の重複全量実行を除去する"
kind: recovery
layer: cross
drive: agent
status: draft
completion_claim_allowed: false
created: 2026-09-05
updated: 2026-09-05
owner: Codex / TL
github_issue_id: 93
behavior_contract_id: CIS-R-10
responsibility_owner: ci-doctor-execution-reuse
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals: [regression_dev]
parent_design: docs/design/helix/L6-function-design/issue-scope-authority-gates.md
pair_artifact: docs/test-design/helix/L6-issue-scope-authority-gates-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/issue-scope-authority-gates.md, oracle_id: U-IHIER-004, test_path: tests/slow/doctor.test.ts }
dependencies:
  parent: null
  requires: []
  references:
    - docs/design/helix/L3-requirements/ci-system-synthesis-requirements.md
    - docs/plans/PLAN-L7-556-issue-dependency-doctor.md
  blocks: []
agent_slots:
  - { role: aim, slot_label: "AIM — 重複実行と状態境界の確認" }
  - { role: qa, slot_label: "QA — 同一assertionと反例の検証" }
  - { role: tl, slot_label: "TL — 検証義務非縮退の確認" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-110-doctor-live-result-reuse.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: tests/infinity-loop-strict-design-contract.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: tests/slow/doctor.test.ts, artifact_type: test_code }
  - { artifact_path: docs/test-design/helix/L6-issue-scope-authority-gates-unit-test-design.md, artifact_type: test_design }
review_evidence: []
---

# 対象と受入

CIS-R-10の検証義務不変、CIS-R-15の安全性測定に従い、既存のdoctor出力検査を削らず重複実行だけを除去する。
U-IHIER-004のassertionは変更せず、同じsuite内で既に用いているliveDoctorの結果を参照する。
runtimeのcache、doctorの判定、状態変更fixture、CI selector、timeoutは変更しない。
結果共有は単一テストプロセス内に限定し、別HEAD・別実行の証拠を再利用しない。

1. 修正前のasset-drift出力検査とU-IHIER-004を同時実行する。
2. U-IHIER-004の全量実行をliveDoctorへ統一する。
3. 同じ2テストの成功と時間を比較し、Issue依存出力欠落の反例が引き続き失敗することを検証する。
4. 全doctor suite、PLAN検査、独立レビュー、CIで確認する。

## 修正前実測

base HEADは0fde9ffa1f2c97e77d593b3788e676dcd9b9ca9f。
Node 24経路でvitest slowの2テストを実行し、2 passed / 92 skipped、tests 233.85秒、全体236.55秒。
これは対象2件のローカル単回値であり、全量CI時間やp95達成の証拠ではない。
修正後は同じ2テストが成功し、tests 118.73秒、全体121.48秒だった。単回比較でテスト時間は約49%減。
続いて実測出力からissue-dependency-wiring行を除く反例を一時注入し、U-IHIER-004がexpected false to be trueで失敗した。
1 failed / 1 passed / 92 skipped、exit 1を確認し、反例コードを除去した。
これは出力欠落への感度確認であり、production側の配線削除mutationの代替とはしない。
全量回帰・独立レビュー・main到達は未完了。

## CIで検出した分母の接合修正

run 33929640733のbulk-3は、今回明示した既存U-IHIER-004によりcurrent unit集合が
476件から477件へ増えたため失敗した。固定commitのmanifestは履歴証跡として変更しない。
current集合は基線476件とU-IHIER-004の和集合へexact照合し、欠落・余分なIDを引き続き拒否する。
過去manifestの件数・digest・receiptを現在の追加へ書き換えない。
