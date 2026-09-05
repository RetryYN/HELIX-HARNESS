---
plan_id: PLAN-RECOVERY-935-branch-authority-input
title: "branch判定のbase／candidate入力と取得不能の扱いを復旧する"
kind: recovery
layer: cross
drive: agent
status: confirmed
completion_claim_allowed: false
created: 2026-09-05
updated: 2026-09-05
owner: Codex / TL
github_issue_id: 935
behavior_contract_id: GH-AC-003
responsibility_owner: branch-kind-authority-input
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals: [regression_dev]
parent_design: docs/design/helix/L6-function-design/branch-kind-authority-input.md
pair_artifact: docs/test-design/helix/L7-branch-kind-authority-input.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/branch-kind-authority-input.md, oracle_id: U-BRAUTH-010, test_path: tests/branch-kind-authority-input.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/branch-kind-authority-input.md, oracle_id: U-BRAUTH-011, test_path: tests/branch-kind-authority-input.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/branch-kind-authority-input.md, oracle_id: U-BRAUTH-004, test_path: tests/branch-kind-authority-input.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/branch-kind-authority-input.md, oracle_id: U-BRAUTH-009, test_path: tests/harness-check-workflow.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/branch-kind-authority-input.md, oracle_id: U-BRAUTH-008, test_path: tests/branch-kind-authority-input.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/branch-kind-authority-input.md, oracle_id: U-BRAUTH-007, test_path: tests/branch-kind-authority-input.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/branch-kind-authority-input.md, oracle_id: U-BRAUTH-001, test_path: tests/branch-kind-authority-input.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/branch-kind-authority-input.md, oracle_id: U-BRAUTH-002, test_path: tests/branch-kind-authority-input.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/branch-kind-authority-input.md, oracle_id: U-BRAUTH-003, test_path: tests/branch-kind-authority-input.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/branch-kind-authority-input.md, oracle_id: U-BRAUTH-005, test_path: tests/branch-kind-authority-input.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/branch-kind-authority-input.md, oracle_id: U-BRAUTH-006, test_path: tests/branch-kind-authority-input.test.ts }
dependencies:
  parent: null
  requires: []
  references:
    - docs/design/helix/L3-requirements/github-autonomous-operations-requirements.md
    - docs/design/helix/L3-requirements/github-merge-admission-requirements.md
    - docs/plans/PLAN-L7-121-branch-kind-check.md
  blocks: []
agent_slots:
  - { role: aim, slot_label: "AIM — 入力authorityの復旧設計" }
  - { role: qa, slot_label: "QA — 実Git fixtureとCLI／doctor同値検証" }
  - { role: tl, slot_label: "TL — 上位契約と復帰境界の確認" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-935-branch-authority-input.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/branch-kind-authority-input.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L7-branch-kind-authority-input.md, artifact_type: test_design }
  - { artifact_path: tests/branch-kind-authority-input.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: tests/slow/doctor.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/feedback-refactor-disposition.json, artifact_type: json_config }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: yaml_config }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
  - { artifact_path: tests/cli-surface.test.ts, artifact_type: test_code }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-wrapper-admission.md, artifact_type: design_doc }
  - { artifact_path: tests/harness-check-workflow.test.ts, artifact_type: test_code }
  - { artifact_path: .github/workflows/harness-check.yml, artifact_type: yaml_config }
  - { artifact_path: src/doctor/index.ts, artifact_type: source_module }
  - { artifact_path: src/lint/branch-kind.ts, artifact_type: source_module }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: tests/branch-kind.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
review_evidence: []
---

# branch入力authorityの復旧

## 1. 収集した事実

基準mainは`fb27791827f2ec300e62fa920596ebaa85e956fc`。
`loadBranchKindInput`は未commit差分だけを取得し、取得失敗を空集合へ変換する。
cleanなcommit済みbranchのPLANを見落とす一方、Git管理外では`branch:null / plans:[] / ok:true`となる。
CLIはpathを上書きしてPLANを再読込し、doctorとは異なる入力経路を通る。
既存36テストは成功したが、実Git loaderの正常性を証明していない。

## 2. スコープ

GH-FR-005、GH-AC-003、GH-NFR-001を修復根拠とする。
branch prefix、PLAN kindの許容集合、Issue警告の意味は変更しない。
旧PLANのrequirements v1.2参照は履歴であり、本変更の意味正本にしない。
新規provider、配車、予約allocator、DB schema、GitHub認証は非対象。

## 3. 再開ポイント

L6入力adapter設計へ戻り、対応するL7反例を確定してから実装する。
共通loader・CLI・doctor・CIの修復契約と実Git反例を技術的に確定する。
要件正本§4.7のHIL-BR-26／HIL-NFR-30と§6の既存契約内修復に従う可逆Authoringであり、
新規L3意味変更または人間承認の記録ではない。独立review・実装完了は未成立として保持する。

### 作成側の局所検証

検証対象HEADは`1aa5651d3719ac20c08e9d9a5c9ebbad9dd617ef`。
以下は作成側の実測であり、独立review receiptではない。

- `npm run test:repo-guards`: exit 0、37 files／534 tests（2026-09-05 16:34:54 JST開始）。
- `npm exec -- vitest run tests/branch-kind-authority-input.test.ts tests/branch-kind.test.ts tests/harness-check-workflow.test.ts`:
  exit 0、3 files／108 tests（2026-09-05 16:56:19 JST開始）。
- `npm exec -- vitest run tests/cli-surface.test.ts`: exit 0、1 file／95 tests、318.82秒
  （2026-09-05 17:19:21 JST開始）。

本PLAN状態変更後のlint／snapshot照合、current HEADの全CI・独立review・main read-afterは別途必要であり、
`completion_claim_allowed: false`を維持する。

### 接続検収の残件

- 通常のlocal doctor／review呼出しへ、誰がbase／candidate／branchを供給するかを確定する。
  引数なしで取得不能となるだけでは、既存の開発経路への接続完了としない。
  Issue #935の明示base契約に従い、本sliceの供給経路はCLIの明示3引数とする。
  assignment providerによる自動供給は別の接続責務であり、本sliceの必要条件へ追加しない。
  明示引数を持つ実doctor／reviewの検証と、欠落時の取得不能表示を必要条件とする。
- schedule／workflow_dispatchの検査対象を確定する。base=candidateの空差分を
  最新変更の検証証拠として扱わない。pushのzero-beforeも別途反例で扱う。
- 曖昧merge-baseと読込中HEAD変化は専用の実Git反例で局所検証した。
  前者は実criss-cross履歴、後者はdiff取得直後の実ref変更を用いる。
  current HEADの全CI・独立reviewによる検収は未完了である。
- CLI全回帰のoutstanding不一致は、未commit PLANとcommit済snapshotの差を検出した。
  同一commitへ収束後、期待値を緩めず再検証する。

## 4. 修復契約

- base／candidate／branchの明示snapshotを一度解決し、差分とbase PLAN本文で共有する。
- commit済み差分と未commit差分は重複のない集合へ統合する。
- 明示baseの不正を別baseへの暗黙fallbackで成功へ変換しない。
- 非Git consumerの明示的な適用対象外と、必要authorityの取得不能を分離する。
- detached HEAD、shallow clone、missing base、削除PLAN、改名pathを区別して検証する。
- CLIとdoctorは同じsnapshotに対して同じPLAN集合・findingを返す。
- superseded_by-only判定も同じbaseを使い、別revisionからの許可を混入させない。

## 5. 検証順

1. L6設計とL7検証条件へ正常系・反例を対応付ける。
2. 実Git fixtureでclean commit済みbranchの見落としをRedにする。
3. dirty union、取得不能、適用対象外、別base混入の反例を追加する。
4. 共通loaderとCLIを修復し、同じ反例・既存テスト・typecheckを実行する。
5. current HEADのCI、独立レビュー、main read-afterを確認する。

## 6. 再発防止と復帰

CI preflightで検出したrefactor dispositionのcurrent source digestを、変更済みCLIとdoctorへ
再束縛する。20件のsignal ID、9/6/5のfamily分母、successor obligationは変更しない。
これは新たなrefactor完了証拠ではなく、既存未解消obligationの現行source追従である。

テストの純関数入力だけでなく、実Git取得からCLI／doctorまでを検証境界とする。
L12へmain上の同値検証結果を返す。read-after成立前にIssueを閉じない。

## 7. rollback境界

repository内容、履歴、credentialを書き換える実装は追加しない。
修復を取り下げる場合も証跡を削除せず、PR内の明示修正として扱う。
