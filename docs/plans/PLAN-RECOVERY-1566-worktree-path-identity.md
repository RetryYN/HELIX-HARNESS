---
plan_id: PLAN-RECOVERY-1566-worktree-path-identity
title: "PLAN-RECOVERY-1566: worktreeとパスの所有権照合を是正"
kind: recovery
layer: cross
drive: agent
status: draft
completion_claim_allowed: false
created: 2026-09-06
updated: 2026-09-06
owner: Codex
github_issue_id: 1543
behavior_contract_id: HYBRID-WORKTREE-PATH-IDENTITY-001
responsibility_owner: worktree-state
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals: [regression_dev]
agent_slots:
  - { role: aim, slot_label: "AIM — 既存の他者成果保護契約を照合" }
  - { role: tl, slot_label: "TL — worktreeと対象identityの境界を検収" }
  - { role: se, slot_label: "SE — path照合を修正" }
  - { role: qa, slot_label: "QA — 正常系と誤許可・誤拒否の反例を検証" }
parent_design: docs/design/harness/L6-function-design/function-spec.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/function-spec.md, oracle_id: U-WORKPATH-001, test_path: tests/work-guard.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/function-spec.md, oracle_id: U-WORKPATH-002, test_path: tests/work-guard.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/function-spec.md, oracle_id: U-WORKPATH-003, test_path: tests/work-guard.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/function-spec.md, oracle_id: U-WORKPATH-004, test_path: tests/work-guard.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/function-spec.md, oracle_id: U-WORKPATH-005, test_path: tests/work-guard.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/function-spec.md, oracle_id: U-WORKPATH-006, test_path: tests/work-guard.test.ts }
backprop_decision: not_required
backprop_decision_reason: "HR-FR-HYB-004 / HR-AC-HYB-004の他者成果保護を実装へ反映する。新しい権限付与やsandbox engineは追加しない。"
dependencies:
  parent: docs/plans/PLAN-L7-114-work-guard.md
  requires: []
  references: ["issue:1543"]
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-1566-worktree-path-identity.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/governance/feedback-refactor-disposition.json, artifact_type: json_config }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-wrapper-admission.md, artifact_type: design_doc }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/worktree-state.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/work-guard.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/work-guard-hook.ts, artifact_type: source_module }
  - { artifact_path: tests/work-guard.test.ts, artifact_type: test_code }
  - { artifact_path: docs/design/harness/L6-function-design/function-spec.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/harness/L8-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
---

# 対象identityの復旧計画

## 契約と範囲

現行requirements v1.3.14のHR-FR-HYB-004 / HR-AC-HYB-004へ束縛する。
Gitのdirty集合、session touch、編集対象を同じworktreeと損失のないpath identityで比較する。
別対象のtouchでforeign変更を許可せず、別worktreeのdirtyを根拠に正常編集を拒否しない。
未知の所属先をcleanと推定せず、overrideの既存記録・消費条件を弱めない。

## 工程

1. Unicode、空白、改行、矢印、POSIX backslash、renameの実Git反例を固定する。
2. 任意部分一致によるroot取り違えと、文字正規化によるownership混同を拒否する。
3. 対象worktreeと実行cwdを解決し、そのworktreeのdirtyとtouchを照合する。
4. 既存Windows表記・consumer hook・overrideの回帰、型検査、PLAN、DBを検証する。
5. 独立レビュー、exact-HEAD CI、main read-afterで検収する。

## 非対象と現状

model設定、sandbox新設、guard解除、他レーンの成果変更、原稿一括削除は非対象。
role宣言は作業責務であり、subagent実行や独立レビューの証拠ではない。
着手時点では実装・検収とも未完了。全体goalやGuard再編の完了は主張しない。

## 局所検証記録

2026-09-06、専用worktreeのmain `231348f09` と本PLANの意図差分で検証した。
`U-WORKPATH-006` は修正前に拒否期待2に対して許可0となり失敗した。
対象成分のsymlink検査を字句正規化より前へ移した後、
`npm exec -- vitest run tests/work-guard.test.ts tests/hosted-preflight.test.ts`
は42件成功、exit 0。通常の親参照の許可とsymlink経由の拒否を同じ反例で検証する。
これは局所検証であり、独立レビュー、CI、main収束、sandbox隔離の証拠ではない。

追加で`tests/git-command-guard.test.ts`、`tests/guard-override-transaction.test.ts`、
`tests/consumer-hook-command.test.ts`を同時実行し、5ファイル85件成功、exit 0を確認した。
型検査とBiomeも成功。`helix db rebuild`は82147行を投影してexit 0、
`helix plan lint --gate governance`と`--gate post-merge-status`は違反なしだった。

CIのrepo-wide検査でCLIのdigest inventory行番号とfeedback dispositionのsource digest追従漏れを検出した。
検出集合・分類・検証条件を維持して現在コードへ再束縛し、
`npm run test:repo-guards`は37ファイル539件成功、exit 0（2026-09-06 03:39 JST開始、118.25秒）。
独立レビューとGitHub CIの最終成功は、この局所成功とは別に必要である。

### 独立検収後のroot alias是正

PR #1566 comment 5554260028のC-1 / I-2に対応する。
root外のsymlinkまで拒否していたため、正常なroot aliasの反例は修正前に期待0／実際2でRED。
物理rootの確定と生の成分列検査を分離し、正常aliasを許可、内部symlinkとforeign変更を拒否する。
2026-09-06 04:36 JSTの関連2ファイル42テスト、型検査は成功。
追加したalias経由の内部経路・foreign変更反例も04:37 JSTに成功し、Biomeとdiff checkも成功した。
これはLinux局所検証であり、Windows/macOS実機・新HEAD CI・独立再検収は未完了。
I-1の型付き失敗理由とI-3の旧集約関数・hosted検査の接合は#1543の残余として追跡し、
このC-1修正だけでGuard全体を完了扱いにしない。

### I-4 許可境界の反例補完

comment 5554358580に対応し、U-WORKPATH-006へrootの親を指すaliasの許可と、
root内srcを指すaliasの拒否を追加した。後者はclean・追跡済みファイルを使用し、
foreign dirty拒否による偽の成功を防ぐ。runtime条件は変更しない。
2026-09-06 05:15〜05:16 JST、within引数反転は親aliasでRED、境界検査除去は子aliasでRED。
元の条件へ復元後work-guard全31テスト成功（4.71秒）。Windows/macOS実機は未検証。
