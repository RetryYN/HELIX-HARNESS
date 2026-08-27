---
plan_id: PLAN-L7-691-shared-root-git-mutation-guard
title: "PLAN-L7-691: 共有rootのforeign dirtyに対するGit mutationをfail-closeする"
kind: add-impl
layer: L7
drive: agent
status: draft
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - "po_directive:Issue #1115 共有rootでのgit merge near-missを機械防止する"
created: 2026-08-28
updated: 2026-08-28
owner: Codex / TL
github_issue_id: 1115
behavior_contract_id: GIT-MUTATION-SHARED-ROOT-GUARD-001
responsibility_owner: destructive-command-guard
engineering_discipline_required: true
change_slice: atomic
refactor_step: extract_shared_state_source
legacy_retirement_state: retained
backprop_decision: not_required
backprop_decision_reason: "requirements v1.3.13のHR-FR-HYB-004がforeign worktree／stage／HEAD／work-guard／git-command-guardの同一episodeとdestructive git拒否を所有し、SEC-FR-CAP-002/003/006がrepository physical identity、provenance、hook coverageのfail-closeを所有する。本sliceはその既存正本を共有root Git mutationへ具体化するため、新FRを重複追加しない。"
no_code_decision: add_code
ddd_modeling_decision: pure_function
contract_preconditions: "shell command、実効cwd、repository common-dir／worktree identity、git status、同一session touched pathsを取得する"
contract_postconditions: "merge／rebase／cherry-pick／stash pop|apply／am／applyは、foreign dirtyを持つprimary shared rootでblockし、clean primary rootまたは同一repositoryのlinked worktreeではpassする"
contract_invariants: "既存reset／checkout等の無条件block、one-shot override transaction、Claude/Codex/consumer hook parityを維持し、raw path／command／理由を監査DBへ保存しない"
contract_failures: "cwd、repository identity、git status、session touched sourceを解決できないGit mutationをsafeへ推測せずfail-closeする"
tdd_red_required: true
red_test: "U-GITGUARD-011..015とIT-GITGUARD-005..007を先行追加し、旧classifierがmerge等をsafe扱いしshared root identityを見ない状態でRedを確認する"
red_at: "2026-08-28T03:37:38+09:00"
green_at: "2026-08-28T03:50:22+09:00"
mutation_oracle_evidence: "2026-08-28T03:48:57+09:00にmerge分類を除去してU-GITGUARD-011が1 failed、03:49:06にshared-root foreign count条件を反転してU-GITGUARD-012/013が1 failed、03:49:43にgit -C target解決を無効化してIT-GITGUARD-005/006が1 failed、03:50:09にsession touched除外を無効化してU-GITGUARD-014/015とU-GITGUARD-015が2 failedとなることをNode 24.15.0で個別実測した。全mutantをapply_patchで復元し、03:50:22開始のgit/work/override 3 suite 63 testsがgreenとなった。"
complexity_effect: justified_positive
complexity_justification: "既存work-guardのgit status／session touched収集を共有moduleへ抽出し、git-command-guardへcontextだけを注入する。別guard、別audit store、別overrideを増やさない。"
removal_trigger: "#679 capability brokerがrepository/worktree physical identityとGit mutation policyを同一以上のoracleで置換し、全hook consumer移行が完了した時"
parent_design: docs/design/harness/L6-function-design/destructive-command-guard.md
pair_artifact: docs/test-design/harness/L8-destructive-command-guard.md
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/destructive-command-guard.md, oracle_id: U-GITGUARD-011, test_path: tests/git-command-guard.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/destructive-command-guard.md, oracle_id: U-GITGUARD-012, test_path: tests/git-command-guard.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/destructive-command-guard.md, oracle_id: U-GITGUARD-013, test_path: tests/git-command-guard.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/destructive-command-guard.md, oracle_id: U-GITGUARD-014, test_path: tests/git-command-guard.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/destructive-command-guard.md, oracle_id: U-GITGUARD-015, test_path: tests/work-guard.test.ts }
refines:
  - PLAN-L7-443-destructive-command-guard-transaction
agent_slots:
  - { role: aim, slot_label: "AIM — #1115と#679/#632の責務境界を確認" }
  - { role: se, slot_label: "SE — worktree identityとforeign dirty共有source" }
  - { role: qa, slot_label: "QA — 非重複dirty／cwd reset／linked worktree／override反例" }
  - { role: tl, slot_label: "TL — fail-closeと誤検知境界" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-691-shared-root-git-mutation-guard.md, artifact_type: markdown_doc }
  - { artifact_path: src/runtime/worktree-state.ts, artifact_type: source_module }
modifies:
  - { artifact_path: .claude/hooks/git-command-guard.ts, artifact_type: source_module }
  - { artifact_path: docs/design/harness/L5-detailed-design/destructive-command-guard.md, artifact_type: design_doc }
  - { artifact_path: docs/design/harness/L6-function-design/destructive-command-guard.md, artifact_type: design_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: docs/test-design/harness/L8-destructive-command-guard.md, artifact_type: test_design }
  - { artifact_path: docs/test-design/harness/L9-destructive-command-guard-integration.md, artifact_type: test_design }
  - { artifact_path: src/runtime/git-command-guard-hook.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/git-command-guard.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/work-guard-hook.ts, artifact_type: source_module }
  - { artifact_path: tests/git-command-guard.test.ts, artifact_type: test_code }
  - { artifact_path: tests/work-guard.test.ts, artifact_type: test_code }
dependencies:
  parent: PLAN-L7-443-destructive-command-guard-transaction
  requires:
    - docs/plans/PLAN-L7-443-destructive-command-guard-transaction.md
  blocks: []
  references:
    - "issue:1115"
    - "issue:1110"
    - "issue:632"
    - "issue:679"
---

# PLAN-L7-691: 共有root Git mutation guard

## 目的

共有rootに別runtimeの未コミット作業がある状態で`git merge --no-commit`等が成功し、merge stateと
foreign dirtyが同一indexへ同居するnear-missを閉じる。path重複によるGit自身の偶発停止へ依存せず、
実効cwd、primary/linked worktree identity、同一sessionのtouch証拠から実行前に判定する。

## スコープ

- `merge`、`rebase`、`cherry-pick`、`stash pop|apply`、`am`、`apply`をcontextual Git mutationへ分類する。
- 実効cwdとGit common-dir／worktree listからprimary shared rootとlinked worktreeを物理同一性で区別する。
- work-guardと同じgit status／session touched sourceからforeign dirty件数を導出する。
- foreign dirtyがあるprimary rootだけをblockし、clean primary rootとlinked worktreeは通す。
- identity／status／session sourceが不明な場合はblockする。
- 既存destructive override marker／env／DB transactionをそのまま再利用する。

## 受入条件

- [ ] merge対象とforeign dirty pathが重ならない共有rootでも全対象operationをblockする。
- [ ] cleanな共有rootと同一repositoryのlinked worktreeでは同じoperationをpassする。
- [ ] cwd指定が無いhook呼出しは実際のhook process cwdを使い、共有root resetを検出する。
- [ ] session touched済みdirtyだけならforeignとして誤認しない。
- [ ] unknown repository／cwd／statusをsafeへ縮退しない。
- [ ] overrideは既存one-shot DB auditを使い、raw path／command／理由を保存しない。
- [ ] 既存destructive Git、work-guard、Claude/Codex/consumer hook oracleを退行させない。
- [ ] targeted、mutation、typecheck、Biome、PLAN lint、full CI、Claude exact-HEAD review、main read-afterがgreenとなる。

## 非対象

host破壊／secret egress拡張は#669/#679、dirty残置surfaceは#632、branch cleanupは#1110/#631が所有する。
shell runtimeのcwd reset挙動自体、Git commit author、release/cutover、全operationのcapability broker化は扱わない。
