---
plan_id: PLAN-RECOVERY-1500-cross-system-audit-intake
title: "PLAN-RECOVERY-1500: 横断監査入力を保全し既存是正責務へ束縛する"
kind: recovery
layer: cross
drive: agent
status: confirmed
completion_claim_allowed: false
created: 2026-09-05
updated: 2026-09-05
owner: Codex / TL
github_issue_id: 1538
behavior_contract_id: CROSS-SYSTEM-AUDIT-INTAKE-001
responsibility_owner: cross-system-audit-intake
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - regression_dev
engineering_discipline_required: true
change_slice: atomic
refactor_step: not_applicable
legacy_retirement_state: retained
no_code_decision: no_change
ddd_modeling_decision: none
tdd_red_required: false
tdd_red_waiver_reason: "原本保全と所見追跡の文書sliceであり、runtime変更は所有Issueごとの修復へ分離する。"
mutation_oracle_evidence: "2026-09-05、台帳F01をF00へ一時変更しU-XAUDIT-002が1 failed / 1 skipped、exit 1で検出。復元後2/2成功。"
complexity_effect: net_neutral
complexity_justification: "root入力を固定参照領域へ移し、既存Issueへ結ぶ。別の管理runtimeや意味正本を作らない。"
removal_trigger: "所見が後継監査へ引き継がれても固定証拠を保持し、current guidanceとして使用しない。"
backprop_decision: not_required
backprop_decision_reason: "新要件の導入ではなく既存Convergence Epochの監査入力整理。意味変更が必要な所見は別のAuthority Sliceで扱う。"
contract_preconditions: "外部監査MDとZIPが読め、固定HEADと既存所有Issueを特定できる"
contract_postconditions: "14入力の内容保全とF/C/Xの追跡を検査し、remote保全後に指定原本を削除できる"
contract_invariants: "外部所見は非authority。修復完了と原本整理を区別し、レビューや承認を発明しない"
contract_failures: "内容欠損、対応表欠落、出典欠落、未保全原本削除を拒否する"
parent_design: docs/design/helix/L6-function-design/cross-system-audit-intake.md
pair_artifact: docs/test-design/helix/cross-system-audit-intake.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/cross-system-audit-intake.md, oracle_id: U-XAUDIT-001, test_path: tests/cross-system-audit-intake.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/cross-system-audit-intake.md, oracle_id: U-XAUDIT-002, test_path: tests/cross-system-audit-intake.test.ts }
dependencies:
  parent: null
  requires: []
  references:
    - "issue:1500"
    - "issue:1411"
    - "issue:1430"
    - "issue:1431"
    - "issue:1336"
  blocks: []
agent_slots:
  - { role: aim, slot_label: "AIM — 所見の既存責務との対応確認（担当責務であり実行証跡ではない）" }
  - { role: docs, slot_label: "Docs — 入力保全と参照整理" }
  - { role: qa, slot_label: "QA — byte一致と所見対応検査" }
  - { role: tl, slot_label: "TL — 既存責務への接続" }
generates:
  - { artifact_path: docs/design/helix/L6-function-design/cross-system-audit-intake.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/cross-system-audit-intake.md, artifact_type: test_design }
  - { artifact_path: tests/cross-system-audit-intake.test.ts, artifact_type: test_code }
  - { artifact_path: docs/plans/PLAN-RECOVERY-1500-cross-system-audit-intake.md, artifact_type: markdown_doc }
  - { artifact_path: docs/reference/cross-system-audit-2026-09-05/README.md, artifact_type: markdown_doc }
  - { artifact_path: docs/reference/cross-system-audit-2026-09-05/intake.md, artifact_type: markdown_doc }
  - { artifact_path: docs/reference/cross-system-audit-2026-09-05/inputs.json, artifact_type: json_config }
  - { artifact_path: docs/reference/cross-system-audit-2026-09-05/source-map.json, artifact_type: json_config }
  - { artifact_path: docs/archive/cross-system-audit-2026-09-05/source/audit-report.md.txt, artifact_type: other }
  - { artifact_path: docs/archive/cross-system-audit-2026-09-05/source/upstream-readme.md.txt, artifact_type: other }
  - { artifact_path: docs/archive/cross-system-audit-2026-09-05/source/sha256sums.txt, artifact_type: other }
  - { artifact_path: docs/archive/cross-system-audit-2026-09-05/source/upstream_license.txt, artifact_type: other }
  - { artifact_path: docs/archive/cross-system-audit-2026-09-05/source/db_path_probe.mjs.txt, artifact_type: other }
  - { artifact_path: docs/archive/cross-system-audit-2026-09-05/source/db_path_results.json.txt, artifact_type: other }
  - { artifact_path: docs/archive/cross-system-audit-2026-09-05/source/findings.json.txt, artifact_type: other }
  - { artifact_path: docs/archive/cross-system-audit-2026-09-05/source/path_pattern_probe.mjs.txt, artifact_type: other }
  - { artifact_path: docs/archive/cross-system-audit-2026-09-05/source/path_pattern_results.json.txt, artifact_type: other }
  - { artifact_path: docs/archive/cross-system-audit-2026-09-05/source/probe_results.json.txt, artifact_type: other }
  - { artifact_path: docs/archive/cross-system-audit-2026-09-05/source/probes.mjs.txt, artifact_type: other }
  - { artifact_path: docs/archive/cross-system-audit-2026-09-05/source/readiness_probe.py.txt, artifact_type: other }
  - { artifact_path: docs/archive/cross-system-audit-2026-09-05/source/readiness_results.json.txt, artifact_type: other }
  - { artifact_path: docs/archive/cross-system-audit-2026-09-05/source/source_index.json.txt, artifact_type: other }
review_evidence:
  - reviewer: Claude Code
    review_kind: cross_agent
    verdict: pass
    reviewed_at: "2026-09-05T00:10:08Z"
    tests_green_at: "2026-09-05T00:09:37Z"
    worker_model: codex
    reviewer_model: claude:claude-opus-5
    reviewer_session_id: "9867601a-a3ad-4369-980c-11757d63a7de"
    reviewed_head_sha: bd1a426802663478468e60857d0a9e0f816db97b
    receipt_url: "https://github.com/RetryYN/HELIX-HARNESS/pull/1537#issuecomment-5547919852"
    scope: "HEAD bd1a426802663478468e60857d0a9e0f816db97bのPLAN/L6/L7・入力保全契約とcatalog追従差分に対する技術pass。主体情報は同レビュー連鎖のcomment 5547726938に明示。PR最終approve、Ready化、人間承認、監査所見の修復完了ではない。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests/cross-system-audit-intake.test.ts tests/l3-g3-freeze-packet-v2.test.ts --project fast"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-09-05T00:09:37Z"
        evidence_path: tests/cross-system-audit-intake.test.ts
        output_digest: "sha256:70796e142bdfed6bf69b108384008382b51617e4495f7f2f6103de683b23ea3f"
modifies:
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: yaml_config }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
---

# 横断監査入力の取り込み

## 対象と非対象

本PLANは#1500の既存収束域へ外部所見を接続する文書作業だけを所有する。
Portfolio runtime、新要求の正本化、F01〜F14のruntime修正を完了扱いにしない。
新しいallocator receiptやassignment／leaseを発行したという主張はしない。
#1297のadd-impl＋ADD_FEATURE専用Forward／Reverse予約契約を、この文書Recoveryへ転用しない。

## 手順と受入

1. MDとZIPのSHA-256、ZIP内14ファイルと同梱13チェックサムを照合する。
2. snapshotを非実行テキストとして保存し、元名→保存先のexact対応とbyte一致を検査する。
3. F14件／C11件／X5件のID集合を照合し、修正済み対照を欠陥へ再計上しない。
4. 元スクリプトを実行せず、本体再現と抽出probeの検証範囲を区別する。
5. PLAN lint、差分検査、current HEADの独立レビュー、CI、remote保全を確認する。
6. 元入力へのactive参照を更新した後、指定された原本だけを削除しread-afterする。

## 検証済みと残工程

ローカルでは14/14ファイルのサイズとSHA-256が一致し、F/C/XのID重複は0。
既知credential形式のパターン検査は0件だが、全secret/PII不存在の証明とはしない。
独立レビュー、CI、remote保全、元入力削除は未完了である。
PLANは独立技術passに基づきconfirmedとする。completion_claim_allowedはfalseを維持し、
PR最終検収・remote保全・元入力削除の未完了をPLAN freeze成功で相殺しない。

## 用語・機能要求更新

catalogの実変更は監査入力L6設計参照1件である。SHA-256を再計測し、freeze候補と
既存22箇所のpinへ同一digestを伝播する。過去承認証拠、要件本文、検証義務は変更しない。

用語更新なし。機能要求更新なし。新たな意味変更はこの取り込みPLANから自動昇格しない。
