---
plan_id: PLAN-RECOVERY-1633-ci-non-pr-base-authority
title: "non-PR CI eventのbranch base authority誤算出を復旧する"
kind: recovery
layer: cross
drive: agent
status: draft
completion_claim_allowed: false
created: 2026-09-08
updated: 2026-09-08
owner: Codex / TL
github_issue_id: 1633
responsibility_owner: branch-kind-authority-input
behavior_contract_id: CI-NON-PR-BASE-AUTHORITY-RECOVERY
entry_signals: [regression_dev]
agent_slots:
  - { role: aim, slot_label: "AIM — CI event別base authorityとfail-close境界を照合" }
  - { role: se, slot_label: "SE — 共通base resolverとworkflow接続を実装" }
  - { role: qa, slot_label: "QA — multi-commit・stale・ambiguous反例を検証" }
  - { role: tl, slot_label: "TL — branch policy非緩和と復帰条件を検収" }
parent_design: docs/design/helix/L6-function-design/branch-kind-authority-input.md
pair_artifact: docs/test-design/helix/L7-branch-kind-authority-input.md
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: "1.1.6"
  registry_source_digest: "sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89"
  target_axis: workflow_model
  target_id: RECOVERY
dependencies:
  requires: [PLAN-RECOVERY-935-branch-authority-input]
  references: ["issue:1336", "issue:1604", "issue:1614"]
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-1633-ci-non-pr-base-authority.md, artifact_type: markdown_doc }
  - { artifact_path: src/runtime/ci-branch-base.ts, artifact_type: source_module }
  - { artifact_path: tests/ci-branch-base-resolver.test.ts, artifact_type: test_code }
  - { artifact_path: .helix/evidence/review-1634/vitest-targeted.log, artifact_type: other }
  - { artifact_path: .helix/evidence/review-1634/tsc.log, artifact_type: other }
modifies:
  - { artifact_path: .github/workflows/harness-check.yml, artifact_type: yaml_config }
  - { artifact_path: docs/design/helix/L6-function-design/branch-kind-authority-input.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L7-branch-kind-authority-input.md, artifact_type: test_design }
  - { artifact_path: tests/harness-check-workflow.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/branch-kind-authority-input.md, oracle_id: U-CIBASE-010, test_path: tests/ci-branch-base-resolver.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/branch-kind-authority-input.md, oracle_id: U-CIBASE-011, test_path: tests/ci-branch-base-resolver.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/branch-kind-authority-input.md, oracle_id: U-CIBASE-009, test_path: tests/ci-branch-base-resolver.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/branch-kind-authority-input.md, oracle_id: U-CIBASE-006, test_path: tests/ci-branch-base-resolver.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/branch-kind-authority-input.md, oracle_id: U-CIBASE-007, test_path: tests/ci-branch-base-resolver.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/branch-kind-authority-input.md, oracle_id: U-CIBASE-008, test_path: tests/harness-check-workflow.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/branch-kind-authority-input.md, oracle_id: U-CIBASE-001, test_path: tests/ci-branch-base-resolver.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/branch-kind-authority-input.md, oracle_id: U-CIBASE-002, test_path: tests/ci-branch-base-resolver.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/branch-kind-authority-input.md, oracle_id: U-CIBASE-003, test_path: tests/ci-branch-base-resolver.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/branch-kind-authority-input.md, oracle_id: U-CIBASE-004, test_path: tests/ci-branch-base-resolver.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/branch-kind-authority-input.md, oracle_id: U-CIBASE-005, test_path: tests/ci-branch-base-resolver.test.ts }
review_evidence: []
---

# non-PR CI branch base authorityの復旧

run `34136409737`では、multi-commit PRのcurrent candidate HEADを
`workflow_dispatch`で検証した際、branch-kindだけが`candidate^`をbaseとしてPLANを見失った。
同じworkflowのimpact-planはcurrent PR baseを解決しており、同一run内でauthorityが分岐していた。

本Recoveryは、pull_requestではeventの明示baseを保持し、非PR eventではcandidate HEADに一致する
open PRをGitHubから一意に解決してread-afterする。該当PRがない場合だけrepository default branchの
remote refとのmerge-baseを使う。複数PR、head/base drift、取得不能、不正SHAはfail-closeする。

branch-kindのPLAN必須規則は緩和しない。第一親fallback、新しい意味正本、event concurrency規則、
PR #1628のruntime実装は非対象とする。#1638の正規修復後は、実測と独立技術reviewに基づく
PLAN confirmed化を先に行い、current HEADのfull CI成功・新世代の独立receipt・main read-afterを
mergeおよび完了主張の条件として分離する。completion_claim_allowedは引き続きfalseである。

## 証跡転記の出典と境界

元sealed receiptはrun 34161349785 attempt 1のfailureを真正に保存している。
receipt digest `sha256:f92d022981c0ca3eaded37be3c47278c93401f42dc9e7aa1a36d4328ebe3e9e5`、
reviewedAt `2026-09-07T21:06:30Z` は変更しない。その後同じ実装HEADで採取した79テストと
型検査の出力を、独立sessionがcomment 5575738122で追認した。追認の公開時刻は21:20:57Zであり、
元review時刻へ後発の検査を遡及させない。これは人間承認を追加する操作ではない。

以上はBash実装HEAD `2799eda2f92254b17dbaa97b5b4a2b477bca8dca` の履歴であり、
現行Node実装の検収には使用しない。旧PLAN・raw logはcommit
`cf0f471d07e2acc7b7f7cbaf6e4016a6c44c502e` で復元できる。
独立レーンはcomment 5576005963で旧approveを撤回し、comment 5576063304では
Node実装の新規検査後も旧confirmed根拠をblockerとしている。これを受け本PLANをdraftへ戻し、
Node実装への新しい独立verdictと実測を接合するまで技術confirmedを主張しない。

read-onlyの実GitHub resolver canaryもcandidate 2799eda2fに対しmain c67e2a010を返し、
PR APIのhead/baseと一致した。hosted workflow全体の成功・merge成立とは別の検証である。

## 全回帰で判明したNode実行境界への追従

run 34163311214 attempt 2のbulk-1は、追加したBash resolverを
`runtime-portability / script-wrapper-unapproved`で拒否した。他の3 shardは成功したが、
全体をgreenとは扱わない。ADR-009に従い取得処理を`src/runtime/ci-branch-base.ts`へ移し、
元のBash実装は削除する。既存portability gateのallowlist・検査範囲は変更しない。

Node入口、workflow三面、移植性、review generationの4ファイル88テストが成功した。
workflowの観測fixtureは最終CLIだけを代替し、Node resolver本体は実行する。
実GitHub読取では公開candidate `963197202`のbase `e674ffb56`を取得できた。
これは修正中の作成側検証であり、旧review_evidenceの対象HEADやraw logを書き換えない。
新HEADの全回帰・独立検収・main read-afterを残す。

追加所見I-2は既存L6「共通snapshot」の複数merge-base拒否をCI入口へ届けるものと照合し、
実criss-cross履歴のU-CIBASE-010を追加した。I-3/I-4/M-1にはPR一覧の必要欄投影、
GitHub取得60秒・Git読取10秒の分離、無関係な欠損headの不採用で対応する。
実GitHub canaryで`--slurp --jq`の併用不可を発見し、ページごとのJSON行取得へ修正した。
U-CIBASE-011はこの引数境界と後続ページの一致PRを検査する。4ファイル90テストと
公開candidate `cf0f471d0` に対するbase `e674ffb56` の実GitHub読取が成功した。
これらは作成側の実測であり、独立approveを補作しない。
