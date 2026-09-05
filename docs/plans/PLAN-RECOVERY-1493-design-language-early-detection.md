---
plan_id: PLAN-RECOVERY-1493-design-language-early-detection
title: "PLAN-RECOVERY-1493: design-language 違反の検出時点と位置表示を前倒しする"
kind: recovery
layer: cross
drive: agent
status: draft
completion_claim_allowed: false
backfill_state: pending
created: 2026-09-05
updated: 2026-09-05
owner: Claude / TL
github_issue_id: 1493
behavior_contract_id: DESIGN-LANGUAGE-EARLY-DETECTION-001
responsibility_owner: design-language-gate
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: policy
complexity_effect: net_neutral
backprop_decision: not_required
backprop_decision_reason: "既存 design-language gate の判定内容、baseline、fingerprint 意味を変えず、検出時点と message の位置表示だけを前倒しする。新しい lint、新しい gate、別 authority は追加しない。"
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - regression_dev
contract_preconditions: "design-language gate は full doctor からのみ実行され、CI では最終 job の full-regression-finalize で走る。baseline 件数は 0 で、violation が 1 件でも fingerprint drift が先に成立する。"
contract_postconditions: "fingerprint drift 側の message も violation の path:line:reason を含む。doctor --gate design-language は full doctor と同一の check 関数へ委譲する。CI は full-regression-preflight で shard 起動前に同 gate を実行する。"
contract_invariants: "analyzeDesignLanguage の判定、DESIGN_LANGUAGE_BASELINE_VIOLATIONS、DESIGN_LANGUAGE_BASELINE_FINGERPRINT の意味を変更しない。単体実行経路と full doctor で判定が割れない。既存英語 prose debt の一括日本語化は行わない。"
contract_failures: "drift message から位置表示が失われる、単体実行が full doctor と異なる判定を返す、unknown gate が ok を返す、preflight の gate が shard 起動より後ろへ移動した場合は fail-close する。"
tdd_red_required: true
red_test: "drift message から sample を除去する、runDoctorGate が check 結果を加工する、unknown gate が ok を返す、preflight の gate を repo-guards より後ろへ移す mutation が専用 oracle で red になる。"
red_at: "2026-09-05T03:04:00+09:00"
green_at: "2026-09-05T03:05:21+09:00"
mutation_oracle_required: true
mutation_oracle: "U-DESLANG-013/U-DESLANG-014/U-DESLANG-015 が message 位置表示、単体実行の配線 drift、CI 実行位置の退行を個別に検出する。"
mutation_oracle_evidence: "2026-09-05T03:04:00+09:00 に実装前の RED を実測し、U-DESLANG-013/014/015 が 3 failed／3 passed（出力 digest b7d6437876b72f032faaac25320e9290b26bfa44e0c958df475b2893a04eb255）となることを確認した。実装後 2026-09-05T03:05:21+09:00 に同 test が 15 passed（digest ff46f411b334bba675c5ea32fa8cac1d8546e5784e27118d7a76f4347e1ca159）へ遷移した。mutation は 4 件を実測している。M1（drift message から sample を除去）は 1 failed／14 passed（digest 9d0b8c1bfe4fcc1836fa0b8cc19565fa5f2c54fb782425394e5219c5a940b386）。M3（preflight の gate を repo-guards より後ろへ移動）は 1 failed／14 passed（digest e2051cfb7880b926e54c056f1d67e7aa658329e636f9cfa57cd9e2417712ce0d）。M2（runDoctorGate が check の message を加工）は初版 oracle では 15 passed（digest fb98799625732ce8c8b384287b619d5d90f0f25b032224823cd7aa048403e20b）で生き残った。実 repository の violation が 0 件で message に sample を含まず mutation が no-op になるためであり、U-DESLANG-014 へ violation を含む fixture 比較を追加した後の再実測で 1 failed／14 passed（digest 759d0a8280ef6276239867ceded257f7653f6cd7d17b22a7e12586247cd12ece）へ変わり kill を確認した。M4（unknown gate が ok を返す）は 1 failed／14 passed（digest 8c2a839c1f3f134486d51abc60a8bb0169b93ffd10e59b7c58c20e58ca4528da）。全 mutation 復元後に 15 passed へ戻ることを確認した。"
parent_design: docs/design/harness/L6-function-design/module-drift.md
pair_artifact: docs/test-design/helix/L8-design-language-early-detection-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/module-drift.md, oracle_id: U-DESLANG-013, test_path: tests/design-language.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/module-drift.md, oracle_id: U-DESLANG-014, test_path: tests/design-language.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/module-drift.md, oracle_id: U-DESLANG-015, test_path: tests/design-language.test.ts }
dependencies:
  parent: docs/plans/PLAN-L6-15-module-drift.md
  requires: []
  references:
    - "issue:1493"
  blocks: []
agent_slots:
  - { role: aim, slot_label: "AIM — 検出時点の前倒しが判定内容を変えないことを監査" }
  - { role: tl, slot_label: "TL — 単体実行経路と full doctor の責務境界を確認" }
  - { role: se, slot_label: "SE — message 位置表示、単体 gate 経路、CI 実行位置を実装" }
  - { role: qa, slot_label: "QA — 位置表示除去・配線 drift・実行位置退行の mutation を検証" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-1493-design-language-early-detection.md, artifact_type: markdown_doc }
  - { artifact_path: docs/test-design/helix/L8-design-language-early-detection-unit-test-design.md, artifact_type: test_design }
modifies:
  - { artifact_path: docs/design/harness/L6-function-design/module-drift.md, artifact_type: design_doc }
  - { artifact_path: src/lint/design-language.ts, artifact_type: source_module }
  - { artifact_path: src/doctor/index.ts, artifact_type: source_module }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: tests/design-language.test.ts, artifact_type: test_code }
  - { artifact_path: .github/workflows/harness-check.yml, artifact_type: workflow_config }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-wrapper-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
review_evidence: []
---

# PLAN-RECOVERY-1493: design-language 違反の検出時点と位置表示を前倒しする

## 目的

Issue #1493 で観測された「英語 prose 1 行の混入が push 前に検出されず、独立 review か CI で初めて red に
なる」状態を解消する。gate を増やさず、既存 `design-language` の**検出時点**と**message の可読性**だけを
前倒しする。

実測した構造は Issue 記載よりも不利であった。`doctor` は CI では最終 job の `full-regression-finalize` で
実行されるため、英語見出し 1 行のために preflight から全 shard を回し切ってから落ちていた。

## 実測した欠陥

`designLanguageMessages` は violation の位置を出す分岐を持つが、`fingerprintDrift` 分岐が先に return する。
`DESIGN_LANGUAGE_BASELINE_VIOLATIONS` は 0 であり、violation が 1 件でもあれば fingerprint は baseline と
必ず異なるため drift が成立する。結果として**位置を出す分岐は現行 baseline では到達不能**であった。

```
analyzeDesignLanguage([{ path: "docs/plans/PLAN-X.md", text: "…## Current Recovery V-pair oracle…" }])
  violations: 1  newViolations: 1  fingerprintDrift: true
  violation detail: docs/plans/PLAN-X.md:3 english-heading
  message: … fingerprint changed at frozen debt count (total=1, baseline=0, fingerprint=…)
  message contains path:line? -> false
```

analyzer は位置を保持しているのに message へ出していない。違反箇所の特定を review 側へ押し付けていた。

## 責務境界

- `src/lint/design-language.ts`: violation 判定と message 生成。判定内容と baseline 意味は不変。
- `src/doctor/index.ts`: `DOCTOR_SINGLE_GATES` と `runDoctorGate` による単体 gate 実行経路。
- `src/cli.ts`: `doctor --gate <id>` の入口。判定は持たず `runDoctorGate` へ委譲する。
- `.github/workflows/harness-check.yml`: `full-regression-preflight` での実行位置。

単体実行のためだけに判定を複製すること、baseline を緩めて green にすること、既存英語 prose debt を
一括翻訳することは禁止する。

## 非対象

- `analyzeDesignLanguage` の検出規則、閾値、除外 root の変更。
- `DESIGN_LANGUAGE_BASELINE_VIOLATIONS` / `DESIGN_LANGUAGE_BASELINE_FINGERPRINT` の引き下げ。
- 既存英語 prose debt の日本語化（baseline は 0 のまま維持する）。
- `design-language` 以外の doctor gate の単体実行対応。
- `full-regression-finalize` での `doctor` 実行の削除（前倒しであり置換ではない）。

## 実装・検証

1. `designLanguageMessages` の drift 分岐へ `path:line:reason` の抜粋を追加する。
2. `runDoctorGate` を追加し、`doctor --gate design-language` から full doctor と同一の check 関数を呼ぶ。
3. `full-regression-preflight` の `npm run test:repo-guards` より前へ同 gate を配置する。
4. 位置表示除去、配線 drift、unknown gate の fail-open、実行位置の退行を `tests/design-language.test.ts` の
   `U-DESLANG-013` / `U-DESLANG-014` / `U-DESLANG-015` で個別に束縛する。
5. Issue #1493 へ、実測した到達不能分岐、修正 HEAD、baseline を据え置いたことを read-after 記録する。
