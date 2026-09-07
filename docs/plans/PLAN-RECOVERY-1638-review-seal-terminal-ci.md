---
plan_id: PLAN-RECOVERY-1638-review-seal-terminal-ci
title: "PLAN-RECOVERY-1638: 封緘用CI世代とmerge許可の分離"
kind: recovery
layer: cross
drive: agent
status: draft
completion_claim_allowed: false
created: 2026-09-08
updated: 2026-09-08
owner: Codex / TL
github_issue_id: 1638
behavior_contract_id: REVIEW-SEAL-TERMINAL-CI-001
responsibility_owner: independent-review-admission
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
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: value_object
contract_preconditions: "対象PRのHEAD・workflow・event・run・attempt・結論・時刻を読み取れる"
contract_postconditions: "封緘では失敗結果も真正に記録でき、mergeでは成功CIを引き続き要求する"
contract_invariants: "独立review・DB・PLAN接合・current HEAD・通知用成功世代の意味を維持する"
contract_failures: "未終端・異なるHEADやworkflow・世代不一致・取得不能を拒否し成功を捏造しない"
tdd_red_required: true
red_test: "修正前の封緘CLIでterminal failureを記録できない反例の再現証拠を採取する"
red_at: null
green_at: null
mutation_oracle_required: true
mutation_oracle_evidence: null
complexity_effect: net_negative
complexity_justification: "既存世代選択を共有し、手動の証拠書換えと封緘待ち循環を減らす"
removal_trigger: "なし。観測結果とmerge許可の分離を既存review経路で維持する"
backprop_decision: not_required
backprop_decision_reason: "既存review経路の停止循環修復であり、新しい自動承認やmerge権限を追加しない"
parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md
pair_artifact: docs/test-design/helix/L8-github-cross-review-admission-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md, oracle_id: U-SEALCI-001, test_path: tests/github-review-ci-generation.test.ts }
  - { parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md, oracle_id: U-SEALCI-002, test_path: tests/github-review-ci-generation.test.ts }
  - { parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md, oracle_id: U-SEALCI-004, test_path: tests/claude-pr-convergence.test.ts }
  - { parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md, oracle_id: IT-SEALCI-006, test_path: tests/github-review-ci-generation.test.ts }
  - { parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md, oracle_id: IT-SEALCI-007, test_path: tests/github-review-ci-generation.test.ts }
dependencies:
  parent: null
  requires: []
  references:
    - "issue:1638"
    - "issue:1634"
    - "issue:1625"
    - "issue:1609"
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-1638-review-seal-terminal-ci.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-wrapper-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L5-detail/github-cross-review-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-github-cross-review-admission-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: tests/claude-pr-convergence.test.ts, artifact_type: test_code }
  - { artifact_path: src/runtime/github-review-ci-generation.ts, artifact_type: source_module }
  - { artifact_path: tests/github-review-ci-generation.test.ts, artifact_type: test_code }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
agent_slots:
  - { role: aim, slot_label: "AIM — 封緘とmerge成立条件の境界確認" }
  - { role: se, slot_label: "SE — 封緘用terminal世代取得" }
  - { role: qa, slot_label: "QA — 赤証拠保存とmerge拒否の分離検証" }
  - { role: tl, slot_label: "TL — 既存収束レーンとの接合" }
review_evidence: []
---

# 封緘用CI取得のRecovery

## Postmortem

#1634等では新規成果物を持つdraft PLANがCIで拒否され、terminal化の証拠を封緘する入口も
成功CIのみを取得するため、正規の収束順を組めない。直接箇所はCLIのCI世代取得であり、
`evaluateClaudePrMerge`の`required_checks_not_green`を削除して解決しない。

## 修復境界

封緘で観測するCI結果とmerge許可を分離する。通知・mergeの既存成功世代選択は維持する。
封緘用取得は同一HEADの終端結果を実際のconclusionで束縛し、pendingや実行中を証拠化しない。
HEAD、run、attempt、時刻、workflowの照合を維持し、未観測の成功を生成しない。
DB証拠、reviewer独立性、PLAN接合、最終mergeの成功CI条件を変更しない。

## 検証予定と未完了

- 失敗terminal結果をそのまま取得し、成功へ変換しない。
- pending、実行中、無効ID、無効時刻、wrong HEAD/generationを拒否する。
- 通知用成功世代選択は失敗runで置き換わらない。
- 赤receiptはmerge不可。green再検収後だけ正規admissionが成立する。
- 設計pair、workflow identity、scope、独立review、実CLI統合検証を揃えるまで完了しない。

本PLANは修復候補の作業記録であり、封緘契約の正本昇格や実装完了を意味しない。

## 局所検証の到達範囲

worker-wrapper-admissionのCLI参照3件は、`src/cli.ts`全体のbytesへ束縛されている。
本差分は封緘用世代選択とそのimport/callsiteのみであり、codex/claude/teamのwrapper
処理は変更しない。参照digestのみ実bytesへ追従し、旧team経路の新規利用許可にはしない。

`tests/github-review-ci-generation.test.ts` の `IT-SEALCI-006` は、隔離したPOSIX
fixtureでbundle済み実CLIの `github pr-review-receipt --apply` を起動する。
GitHubの読み取り応答だけをfixture化し、wrong HEAD、wrong event、wrong workflow、
未終端run、最新の失敗runに対する古い成功世代の申告をそれぞれ拒否する。
fixtureには実credentialを渡さず、想定外のGitHub操作を拒否する。

これは封緘前の再照合を検証するものであり、receipt投稿・DB記録・PLAN終端化・
green再封緘・mergeまでの統合成功を証明しない。その正経路とWindows実CLIは未検証である。

`IT-SEALCI-007` は既存のレビューコメントを隔離応答で返し、実CLIの `--apply` により
失敗CIのblock receiptをread-afterしてローカルへ保存する正経路を検査する。
出力receiptと保存bytesのJSONが一致し、`failure` と `block` が保持されることを確認する。
外部GitHubへの実投稿、approveに必要なDB/PLAN接合、green再封緘・mergeの証明には代用しない。
