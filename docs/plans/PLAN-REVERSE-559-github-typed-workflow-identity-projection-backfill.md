---
plan_id: PLAN-REVERSE-559-github-typed-workflow-identity-projection-backfill
title: "PLAN-REVERSE-559: GitHub typed workflow identity projectionの統合backfill"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: design
forward_routing: gap-only
promotion_strategy: reuse-as-is
drive: agent
status: confirmed
completion_claim_allowed: true
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-16T15:37:36Z"
    tests_green_at: "2026-08-16T15:37:18Z"
    verdict: approve
    worker_model: codex
    reviewer_model: codex-intra-runtime
    scope: "PLAN-L7-569およびPLAN-L7-575〜578の各canonical deliveryをPR #722／#736〜#739でexact-HEAD独立reviewし、最終slice #739 HEAD 20b1d6dafb94ef1283a8bed80a648844badccd13をblocker 0、CI 31928396213 success、DB projection／replay convergedとして承認した。各receiptとmerge commitはR0表へ固定し、本Reverseは新実装を作らず5契約をreuse-as-isで統合照合する。PR #751はHEAD 4eb04f278ca95913855be9106de03e5bae06c144でcanonical mergeされ、main read-after後のtargeted 134 testsとtypecheckもgreenである。2026-08-16時点ではForward 5 PLANの原子終端が未完了だったため、当時のcompletion false維持を承認した。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --project fast tests/state-db.test.ts tests/l3-g3-freeze-packet-v2.test.ts --project slow tests/slow/projection-writer.test.ts && npm run typecheck && npx --no-install tsx src/cli.ts plan lint docs/plans/PLAN-L7-575-plan-registry-workflow-identity-projection.md"
        runner: node
        scope: targeted
        exit_code: 0
        evidence_path: tests/slow/projection-writer.test.ts
        output_digest: "sha256:bdb511086b993743aaf3ab3f006efd3682633341da6e227b5e67e37090dd3a1c"
        result: "PLAN registry projection targeted tests、typecheck、PLAN lint green"
      - kind: unit_test
        command: "npm run typecheck && npx vitest run tests/github-execution-episode-state.test.ts tests/state-db-schema-authority.test.ts tests/state-db.test.ts tests/digest.test.ts tests/design-coverage.test.ts tests/ddd-tdd-rules.test.ts tests/l3-g3-freeze-packet-v2.test.ts && npx tsx src/cli.ts plan lint docs/plans/PLAN-L7-576-github-execution-episode-state.md"
        runner: node
        scope: targeted
        exit_code: 0
        evidence_path: tests/github-execution-episode-state.test.ts
        output_digest: "sha256:8ec282c3ec7874ddd86bec955f124d9a49745be82f7d3bc0ae9186f3796f4411"
        result: "execution episode targeted tests、typecheck、PLAN lint green"
      - kind: unit_test
        command: "npm run typecheck && npx vitest run tests/github-execution-episode-location.test.ts tests/github-execution-episode-state.test.ts tests/projection-writer.test.ts tests/state-db-schema-authority.test.ts tests/digest.test.ts && npx tsx src/cli.ts plan lint docs/plans/PLAN-L7-577-github-execution-episode-location-projection.md"
        runner: node
        scope: targeted
        exit_code: 0
        evidence_path: tests/github-execution-episode-location.test.ts
        output_digest: "sha256:aaac9047905a9997356b73fa004975244ebd4f268d5ac9d08703971e7006dc06"
        result: "current-location targeted tests、typecheck、PLAN lint green"
      - kind: unit_test
        command: "npx vitest run --project fast tests/github-execution-episode-right-arm.test.ts tests/l12-hybrid-recognition.test.ts tests/ddd-tdd-rules.test.ts tests/design-language.test.ts tests/plan-descent-specific-parent-binding.test.ts tests/fe-roster-orchestration.test.ts && npx --no-install tsx src/cli.ts plan lint docs/plans/PLAN-L7-578-github-execution-episode-right-arm-evidence.md"
        runner: node
        scope: targeted
        exit_code: 0
        evidence_path: tests/github-execution-episode-right-arm.test.ts
        output_digest: "sha256:387b8957495611a8f8a8cdb4c4e18a08b55a7e4a6cfae2cc02b1bb071d688265"
        result: "right-arm targeted tests、PLAN lint、recognition green"
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.4
  registry_source_digest: sha256:5023a820b8ae786b71c90edaea57812286f7a3091ab22b04f60d8fb2915f7b3f
  target_axis: workflow_model
  target_id: RETROFIT
entry_signals:
  - "po_directive:Issue #205のPLAN／episode／current-location／right-arm projectionをReverse R0から統合照合する"
created: 2026-08-16
updated: 2026-08-22
owner: Codex / TL
github_issue_id: 205
behavior_contract_id: GH-WORKFLOW-IDENTITY-BACKFILL-001
responsibility_owner: github-workflow-identity-convergence
engineering_discipline_required: true
change_slice: atomic
refactor_step: not_applicable
legacy_retirement_state: consumer_migration
no_code_decision: no_change
ddd_modeling_decision: none
contract_preconditions: "PLAN-L7-569およびPLAN-L7-575〜578の5契約が原子terminal PRでcanonical mergeされ、各exact-HEAD receiptとDB convergenceが成立している"
contract_postconditions: "requirements、PLAN registry、execution episode、current-location、right-arm evidenceのtyped tupleとHEAD束縛をR0〜R4で照合し、意味差分だけをForwardへ再入させる"
contract_invariants: "requirements registryが唯一の意味authorityであり、旧mode／model／route ID、別episode、旧HEAD、別owner／contractのgreenでcurrent failureを相殺しない"
contract_failures: "canonical merge、exact-HEAD review receipt、DB replay convergence、negative oracle、main read-afterの欠落をcompletionへ丸めない"
tdd_red_required: false
tdd_red_waiver_reason: "実装を変更しないReverse照合sliceであり、既存4契約のseeded mutationとmain横断回帰を再利用する。新しいRedを捏造しない"
mutation_oracle_evidence: "PLAN-L7-575〜578が記録したunknown identity、state遷移、stale location、G13 gateの各seeded mutation killをR2で再照合する。本Reverseは実装mutationを追加せず、参照欠落をPLAN lintとtargeted regressionでfail-closeする"
complexity_effect: net_neutral
complexity_justification: "新しいruntimeやDB表を増やさず、既存4契約の証拠を一つのReverse統合境界へ接続する"
removal_trigger: "Issue #205 terminal closureとForward再入先の完了後も監査証跡として保持する"
pair_artifact: docs/test-design/helix/L8-github-execution-episode-right-arm-evidence-unit-test-design.md
backprop_scope:
  - layer: L3-requirements
    decision: preserve
    evidence_path: docs/design/helix/L3-requirements/github-merge-admission-requirements.md
    reason: "GH-FR-020〜023とGH-AC-018〜021がtyped identity、episode、current-location、right-arm exact bindingを分離している。"
  - layer: L6-function-design
    decision: preserve
    evidence_path: docs/design/helix/L6-function-design/plan-registry-workflow-identity-projection.md
    reason: "PLAN source tupleのall-or-none DB projectionとlegacy NULL境界がPLAN-L7-575実装に一致する。"
  - layer: L6-function-design
    decision: preserve
    evidence_path: docs/design/helix/L6-function-design/github-execution-episode-state.md
    reason: "append-only event、transactional outbox、terminal再利用拒否がPLAN-L7-576実装に一致する。"
  - layer: L6-function-design
    decision: preserve
    evidence_path: docs/design/helix/L6-function-design/github-execution-episode-location-projection.md
    reason: "current-locationが同一episodeとresource revisionへ束縛される契約がPLAN-L7-577実装に一致する。"
  - layer: L6-function-design
    decision: preserve
    evidence_path: docs/design/helix/L6-function-design/github-execution-episode-right-arm-evidence.md
    reason: "G8〜G12 evidenceのepisode／HEAD／owner／contract exact bindingがPLAN-L7-578実装に一致する。"
agent_slots:
  - { role: se, slot_label: "SE — R0 canonical implementation／receipt採取" }
  - { role: qa, slot_label: "QA — R1/R2 negative oracleとDB replay反証" }
  - { role: tl, slot_label: "TL — R3 requirements意図とR4 Forward再入判断" }
generates:
  - { artifact_path: docs/plans/PLAN-REVERSE-559-github-typed-workflow-identity-projection-backfill.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: src/lint/l12-hybrid-reviewed-safe-v2.ts, artifact_type: source_module }
  - { artifact_path: tests/l12-hybrid-recognition.test.ts, artifact_type: test_code }
  - { artifact_path: tests/github-typed-workflow-identity-convergence.test.ts, artifact_type: test_code }
  - { artifact_path: docs/design/helix/L3-requirements/github-merge-admission-requirements.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L6-function-design/plan-registry-workflow-identity-projection.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L6-function-design/github-execution-episode-state.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L6-function-design/github-execution-episode-location-projection.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L6-function-design/github-execution-episode-right-arm-evidence.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-plan-registry-workflow-identity-projection-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/test-design/helix/L8-github-execution-episode-state-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/test-design/helix/L8-github-execution-episode-location-projection-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/test-design/helix/L8-github-execution-episode-right-arm-evidence-unit-test-design.md, artifact_type: test_design }
dependencies:
  parent: docs/plans/PLAN-L7-578-github-execution-episode-right-arm-evidence.md
  requires:
    - docs/plans/PLAN-L7-569-typed-plan-workflow-identity.md
    - docs/plans/PLAN-L7-575-plan-registry-workflow-identity-projection.md
    - docs/plans/PLAN-L7-576-github-execution-episode-state.md
    - docs/plans/PLAN-L7-577-github-execution-episode-location-projection.md
    - docs/plans/PLAN-L7-578-github-execution-episode-right-arm-evidence.md
  references:
    - docs/plans/PLAN-L7-569-typed-plan-workflow-identity.md
    - docs/plans/PLAN-L7-575-plan-registry-workflow-identity-projection.md
    - docs/plans/PLAN-L7-576-github-execution-episode-state.md
    - docs/plans/PLAN-L7-577-github-execution-episode-location-projection.md
    - docs/plans/PLAN-L7-578-github-execution-episode-right-arm-evidence.md
    - docs/design/helix/L3-requirements/github-merge-admission-requirements.md
    - docs/test-design/helix/L8-plan-registry-workflow-identity-projection-unit-test-design.md
    - docs/test-design/helix/L8-github-execution-episode-state-unit-test-design.md
    - docs/test-design/helix/L8-github-execution-episode-location-projection-unit-test-design.md
    - docs/test-design/helix/L8-github-execution-episode-right-arm-evidence-unit-test-design.md
---

# GitHub typed workflow identity projectionの統合backfill

## R0 現状採取

Issue #205の実装sliceをcanonical mainから採取した。

| 契約 | PR HEAD | canonical merge | Claude exact-HEAD receipt |
|---|---|---|---|
| typed PLAN identity | `3fae6b94ce5d6ae2c7f7bc610db63c107df994d1` | PR #722 / `e2d85c1c220641e0b87075a774da7f6f121e0669` | 承認、blocker 0、CI terminal success |
| PLAN registry投影 | `93a6b277180060e01b6e5c4f252d1816ed5a3dee` | PR #736 / `6768562f096a87cbb952f7eb3d94d3f96c3dc906` | 承認、blocker 0、CI `31916680844` |
| execution episode状態 | `d5add5421d35acf6ce7159a00d63de9f5889c590` | PR #737 / `5f030713407156e29f219c7cb2d3312a3388d62e` | 承認、blocker 0、CI `31920122149` |
| current-location投影 | `6bfa9f925cbe0d2f895c4d65400e1bfae6db6947` | PR #738 / `65647b3e519e4ec9545bf00bb75119761102f11e` | 承認、blocker 0、CI `31923167732` |
| right-arm evidence束縛 | `20b1d6dafb94ef1283a8bed80a648844badccd13` | PR #739 / `1a03bcf946c04ffc3e06157f3b8785cec18fb1c5` | 承認、blocker 0、CI `31928396213` |

2026-08-16のcurrent main `1b385853930d97bfda65223342c3da7a83720665`で、関連7 test filesの
124 testsと`tsc --noEmit`がgreenになった。各PR receiptはprojection digestとreplay digest、checkpoint digestと
replay checkpoint digestの一致、および`dbConverged=true`を記録している。

2026-08-22には、Forward 5 PLANをexact-one PLANの原子terminal PRへ分離し、各PLANの双方向接着、
current-HEAD CI、Claude Code Opus独立review、sealed receipt、canonical mergeを次のexact setで完了した。

| PLAN | 終端PR HEAD | canonical merge | sealed receipt／CI |
|---|---|---|---|
| PLAN-L7-569 | PR #914 / `1c9cf3a66aaed409aa126189df7ecad8f2a7e73a` | `df1a8e79c3d6262f352e6d9e526518928b6e1451` | `#issuecomment-5374240781` / `32517178310` success |
| PLAN-L7-575 | PR #916 / `17aacd482a196f12ab839dce5b5858c0a031ee02` | `c2143df0241fd43816320b60518e9472edbf27a4` | `#issuecomment-5374593145` / `32519753115` success |
| PLAN-L7-576 | PR #917 / `0d8c3c06f9112965b35adb4a84a3777598f9fa30` | `c321847e1793c4be27dce94dc5a8791f625d0f90` | `#issuecomment-5374973452` / `32522398606` success |
| PLAN-L7-577 | PR #920 / `095f39ad7437c38ae3acf0a726728f7c4adc5d34` | `08efb3bfaa1e53e19ddd1c3619f0e425f514c2e4` | `#issuecomment-5375493697` / `32526878597` success |
| PLAN-L7-578 | PR #922 / `7a6b5c5d89f3e1753d0ca286ad6a72d6fab7e8cc` | `647d83166c9d8a33c9775d8208bcdc7eadc1a3df` | `#issuecomment-5376147104` / `32532203458` success |

各receiptはauthor=`codex`、reviewer=`claude`、verdict=`approve`、blockers=0、
projection digest=replay digest、checkpoint digest=replay checkpoint digest、`dbConverged=true`を固定する。

## R1 skip判定

`confirmed_reverse_type: design`はrequirementsのR1 skip対象である。旧mode／modelの再出力、部分tuple、
順序飛越し、terminal再利用、別episode、旧HEAD、別owner／contract、unsafe artifact pathをR2の
negative oracle入力として扱い、R1を別phaseへ偽装しない。

## R2 As-Is照合

- PLAN-L7-569はPLAN frontmatterをregistry version／digest／axis／IDへexact束縛し、legacy `route_mode`のcurrent再出力を拒否する。
- PLAN-L7-575はregistry version／digest／axis／IDを独立列へall-or-noneで投影し、legacy PLANを全NULLに保つ。
- PLAN-L7-576はepisode event、outbox、current stateを単一transactionとreplayへ束縛する。
- PLAN-L7-577はactive episodeのcurrent-locationをresource revisionと同時に更新し、stale更新を拒否する。
- PLAN-L7-578はG8〜G12 evidenceを同一episode／HEAD／owner／contract／workflow tupleへ束縛する。

各L6設計とL8 oracleは実装責務を混在させず、PLAN-L7-569／575〜578のseeded mutationがauthority drift、
不正遷移、stale location、未定義gateをそれぞれkillしている。main横断回帰でもcanonical failureを
legacy greenで相殺する経路は観測されなかったため、backprop scopeは`preserve`とする。

## R3 意図照合

Issue #205の意図は、requirements-owned typed identityとexecution episode identityを別fieldで保持し、
Issue／PLAN／PR／DB／right-armを同一episode、HEAD、owner、contractへexact束縛することである。
実装は旧15-route IDをprimary identityへ昇格させず、unknownやlegacy入力からForwardを推測しない。
従って5契約の意味はIssueとrequirementsへ一致する。

## R4 Forward再入

R0〜R3で新しい実装gapは見つからなかった。5契約を`reuse-as-is`とし、Forward再入は#204配下の
全surface doctor／文書収束へ限定する。PR #914／#916／#917／#920／#922で各Forward PLANを
exact-one PLANの原子PRとして双方向接着し、current-head CI、Claude Code Opus exact-HEAD review、
sealed receipt、DB convergence、canonical mergeを完了した。従って本Reverse原子PRで
`completion_claim_allowed: true`へ遷移する。Issue #205のcloseは、本PR自身のcurrent-head CI、
Claude Code Opus exact-HEAD review、DB convergence、canonical merge、main read-afterを確認した後にのみ行う。
