---
plan_id: PLAN-RECOVERY-15-impact-ci-transition-reuse
title: "PLAN-RECOVERY-15 (recovery): 同一HEAD transition reuse"
kind: recovery
layer: cross
drive: agent
status: draft
route_mode: recovery
entry_signals:
  - "po_directive:2026-08-06 #93 CI高速化を継続する。同一HEADのDraft/Ready遷移が全量full admissionを再消費する重複を抑止する"
created: 2026-08-06
updated: 2026-08-06
owner: Claude / TL
github_issue_id: 93
engineering_discipline_required: true
behavior_contract_id: GH-AC-017
responsibility_owner: impact-ci-recovery
change_slice: atomic
refactor_step: modify
legacy_retirement_state: retained
no_code_decision: configure
ddd_modeling_decision: none
contract_preconditions: "ready_for_review／converted_to_draft eventはPR状態遷移のみでtreeを変えない。protected mainは前進のみでforce-push不可"
contract_postconditions: "full回帰をgreen完走したpull_request runだけがimpact-ci-full-receipt artifact（head/base SHA束縛）を発行し、transition eventはそのreceiptがhead SHAとbase SHAの両方に完全一致する場合だけ再利用してreused run idをreceiptに残す"
contract_invariants: "契約gate（PLAN lint・authority・typecheck・DB rebuild・Biome・doctor）は再利用時も毎回実行し、synchronize等の新commit eventでは再利用しない。照会失敗・receipt欠落・SHA不一致は全てfull実行へfail-closeし、再利用したrunはreceiptを再発行しない"
contract_failures: "transition event限定の欠落、prior run success絞り込みの欠落、full receipt照合の欠落、base SHA一致検査の欠落、照会失敗フォールバックの欠落、reuse run id検証の欠落、receipt発行のfull限定／reuse除外の欠落をworkflow oracleで拒否する"
tdd_red_required: true
red_at: "2026-08-06T05:28:53Z"
green_at: "2026-08-06T05:29:54Z"
mutation_oracle_evidence: "tests/harness-check-workflow.test.ts::U-IMPACTCI-WF-004でtransition event限定の除去、conclusion success絞り込みの除去、full receipt照合の除去、base SHA一致検査の除去、照会失敗フォールバックの除去、reuse run id検証の除去、reuse receiptの除去、receipt発行のreuse除外／full限定の除去の各mutation（9件）がtransition_reuse_invalidとなりRedへ戻る"
complexity_effect: net_neutral
complexity_justification: "読み取り専用のprior run/artifact照会とfail-close分岐、green時のみのreceipt artifact発行step 1つを足すだけで、workflow permission（read-only）とjob数を増やさない"
removal_trigger: "GitHub Actionsが同一head SHA・同一base tipのrequired check結果を状態遷移eventへnativeに引き継ぐようになり、同一oracleで重複full admissionが発生しないと証明された時"
parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md
pair_artifact: docs/test-design/helix/L8-impact-ci-recovery-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md, oracle_id: U-IMPACTCI-WF-004, test_path: tests/harness-check-workflow.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — 遷移event再実行の観測とmerge tree同一性条件の導出" }
  - { role: se, slot_label: "SE — selectorのprior run照会とfail-close reuse分岐" }
  - { role: qa, slot_label: "QA — 5 mutationと契約gate毎回実行の不変確認" }
  - { role: tl, slot_label: "TL — 再利用境界（body/契約gateは対象外）の分離" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-15-impact-ci-transition-reuse.md, artifact_type: markdown_doc }
  - { artifact_path: .github/workflows/harness-check.yml, artifact_type: workflow_config }
  - { artifact_path: tests/harness-check-workflow.test.ts, artifact_type: test_code }
  - { artifact_path: docs/test-design/helix/L8-impact-ci-recovery-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/design/helix/L6-function-design/impact-ci-recovery.md, artifact_type: design_doc }
  - { artifact_path: tests/impact-ci-recovery-detail-design.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L7-493-impact-ci-recovery.md
  requires:
    - docs/plans/PLAN-L7-493-impact-ci-recovery.md
    - docs/plans/PLAN-RECOVERY-14-impact-ci-cancel-propagation.md
review_evidence: []
---

# PLAN-RECOVERY-15: 同一HEAD transition reuse Recovery

## 根本原因

Issue #93の2026-08-02/08-04観測で、同一HEADのDraft→Ready遷移（run 30732975678 / 30738309724）と
Ready→Draft park（run 30880366602）が、tree・差分不変にもかかわらずfull admission全量（20分超）を
再実行していた。`ready_for_review`／`converted_to_draft`はPR状態遷移のみを表すeventであり、
検査対象treeは変わらない。

## 修復

full回帰をgreen完走したpull_request runだけが、最終stepでhead SHA・base SHAを束縛した
`impact-ci-full-receipt` artifactを発行する（Draftの選択実行greenはfull判定でないため発行されず、
再利用対象にならない。intra-runtime reviewのCritical指摘への是正）。selector stepは、full判定かつ
transition eventの場合に限り同一head SHAのprior green run（現run除外）を新しい順に照会し、
receiptの`head_sha`と`base_sha`が現在のcandidate head・base tipに完全一致する場合だけ`reuse=true`
とする（SHA直接比較のため、committer時刻ヒューリスティックに依存しない）。`gh api`／`jq`の失敗は
すべてfull実行へフォールバックし、required checkを外部API不調でredにしない。全回帰stepはreuse時に
reused run id・tested headをreceiptへ残し、run id欠落はexit 1にする。契約gate（PLAN lint・authority・
typecheck・DB rebuild・Biome・doctor）は再利用時も毎回実行し、timeout延長・test除外・retry・
permission昇格は行わない。再利用したrunはreceiptを再発行せず、receiptは常に実際にtestを実行した
runへ連鎖する。

## 検証

- `tests/harness-check-workflow.test.ts::U-IMPACTCI-WF-004`が正例と9 mutation反例を機械検査する。
- 選定ロジックの等価実装で、現run除外・failure除外・最新green優先を実測した（2026-08-06 JST）。
- 初回導入時はprior runにreceiptが無いため常にfull実行へフォールバックする（bootstrap安全）。

## 非対象

- body-only是正時のtest receipt再利用（#93別スライス）
- run間分散（同一scopeで15〜22分）の原因特定
- post-merge mainの三重実行回収（historical/nightly profile移行）
- contract gate群の再利用（毎回実行を維持）
