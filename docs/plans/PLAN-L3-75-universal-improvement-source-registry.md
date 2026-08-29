---
plan_id: PLAN-L3-75-universal-improvement-source-registry
title: "PLAN-L3-75 (add-impl): Universal Improvement source registryをauthority admissionへ接続する"
kind: add-impl
layer: L7
drive: agent
status: draft
backfill_state: pending_reverse
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: ADD_FEATURE
entry_signals:
  - "po_directive:Issue #1231 Universal Improvement Loopの観測source registryとauthority admissionを実装する"
created: 2026-08-30
updated: 2026-08-30
owner: Codex / TL
github_issue_id: 1231
behavior_contract_id: UNIVERSAL-IMPROVEMENT-SOURCE-REGISTRY-001
responsibility_owner: universal-improvement-source-registry
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
backprop_decision: not_required
backprop_decision_reason: "UIL-01はconfirmed済みのUniversal Improvement Loop要求へ新しい観測sourceの入口を実装するsliceであり、既存sourceの意味authorityを変更しない。"
no_code_decision: add_code
ddd_modeling_decision: aggregate
contract_preconditions: "PLAN-L3-74、Universal Improvement Loop L3/L10要求、既存detectorとread-only doctorが利用可能である"
contract_postconditions: "10種類の観測sourceがrequirements-owned registry、実体digest、detector identity、evidence contractへ束縛され、doctorとruntime admissionが同じ結果を返す"
contract_invariants: "registryはread-only、AIはproposal-only、unknown／duplicate／digest drift／unsafe path／不正observationはfail-close、候補生成やauthority writeを実行しない"
contract_failures: "required source kind欠落、source／detector不在またはdigest不一致、schema／identity不一致、必須evidence欠落、invalid digest／timestampをgreenへ縮退しない"
tdd_red_required: true
red_test: "U-UILSRC-001..009でsource kind欠落、duplicate、source lifecycle metadata欠落、digest drift、unsafe path、observation identity、doctor未配線を個別に検出する"
red_at: null
green_at: 2026-08-30T07:09:05+09:00
mutation_oracle_evidence: "2026-08-30T07:09:05+09:00にU-UILSRC-002／003／005の実装内変異（source kind重複、evidence contractのsource_revision欠落、digest drift、unsafe path、malformed／null observation）を実行し、対応するfail-close oracleを通過させた。targeted 2 files／9 tests passed、output_digest=sha256:904d13f50b3c881792745dca332f21e6150cdc68828e00871d30f346633d3cca。"
complexity_effect: justified_positive
complexity_justification: "既存10 detectorを再実装せず、requirements-owned source registryと共通read-only admissionを一つのaggregateとして追加する。"
removal_trigger: "Universal Improvement Loopのsource／detector／evidence tupleが既存System Synthesis registryへ完全吸収され、UIL source registryの独立consumerがなくなった時"
parent_design: docs/design/helix/L6-function-design/universal-improvement-source-registry.md
pair_artifact: docs/test-design/helix/L8-universal-improvement-source-registry-unit-test-design.md
dependencies:
  parent: docs/plans/PLAN-L3-74-universal-improvement-loop.md
  requires:
    - docs/design/helix/L3-requirements/universal-improvement-loop-requirements.md
  blocks:
    - issue:1232
  references:
    - "issue:1210"
    - "issue:1231"
    - "issue:1035"
    - "issue:1036"
    - "issue:1174"
    - "issue:1204"
agent_slots:
  - { role: se, slot_label: "SE — requirements-owned registry、実体digest、detector tuple" }
  - { role: qa, slot_label: "QA — duplicate／missing／unsafe path／observation mutation" }
  - { role: tl, slot_label: "TL — read-only admissionと既存detector責務境界" }
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/universal-improvement-source-registry.md, oracle_id: U-UILSRC-001, test_path: tests/universal-improvement-source-registry.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/universal-improvement-source-registry.md, oracle_id: U-UILSRC-002, test_path: tests/universal-improvement-source-registry.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/universal-improvement-source-registry.md, oracle_id: U-UILSRC-003, test_path: tests/universal-improvement-source-registry.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/universal-improvement-source-registry.md, oracle_id: U-UILSRC-004, test_path: tests/universal-improvement-source-registry.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/universal-improvement-source-registry.md, oracle_id: U-UILSRC-005, test_path: tests/universal-improvement-source-registry.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/universal-improvement-source-registry.md, oracle_id: U-UILSRC-006, test_path: tests/universal-improvement-source-registry.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/universal-improvement-source-registry.md, oracle_id: U-UILSRC-007, test_path: tests/universal-improvement-source-registry-doctor.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/universal-improvement-source-registry.md, oracle_id: U-UILSRC-008, test_path: tests/universal-improvement-source-registry-doctor.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/universal-improvement-source-registry.md, oracle_id: U-UILSRC-009, test_path: tests/universal-improvement-source-registry-doctor.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L3-75-universal-improvement-source-registry.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/universal-improvement-source-registry.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-universal-improvement-source-registry-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: config/universal-improvement-source-registry.v1.json, artifact_type: json_config }
  - { artifact_path: src/runtime/universal-improvement-source-registry.ts, artifact_type: source_module }
  - { artifact_path: src/doctor/universal-improvement-source-registry-check.ts, artifact_type: source_module }
  - { artifact_path: tests/universal-improvement-source-registry.test.ts, artifact_type: test_code }
  - { artifact_path: tests/universal-improvement-source-registry-doctor.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: src/doctor/index.ts, artifact_type: source_module }
---

# PLAN-L3-75: Universal Improvement source registryのauthority admission実装

## 目的

Universal Improvement Loopの観測sourceを任意のログやAI出力から切り離し、requirements-ownedのversioned registryへ
登録する。各sourceの入力authority、detector実体、schema、freshness、evidence identityを一つのtyped tupleとして
admitし、後続の観測正規化・finding適格化・候補合成へ安全に渡せる入口を作る。

## 実装範囲

1. 10種類の初期source（CI、DB、requirements、definition、dependency、review、operations、provider、
   distribution、resource/security）をregistryへ登録し、revision、retention、redaction、failure dispositionを
   sourceごとに宣言する。
2. source／detectorのrepository-relative path、実体digest、重複ID、required kindを検証する。
3. observationのsource、schema、detector、revision、timestamp、payload／evidence digestをread-onlyで検証する。
4. helix doctorへ同じloader／analyzerを接続し、registry不在、JSON破損、digest driftをfail-closeする。
5. candidate生成、Issue／PLAN／DB書込み、detectorの再実装、後続UIL-02以降を本sliceへ混載しない。

## §3 工程表

### Step 1: requirements authorityとsource lifecycle metadataのschemaを固定 [直列]

UIL-R-01のsource_id、source_kind、revision、retention、redaction、freshness、failure dispositionと、
evidence contractのrequired／identity／digest fieldをrequirementsへ束縛する。後続のregistry entryはこの境界に
依存するため `downstream_dependency` とする。

### Step 2: registry entryとread-only admissionを実装し、red oracleをgreenへ戻す [直列]

10 source kindのexactly-one、実体digest、repository path、source lifecycle metadata、observation identityと
freshnessを一つのanalyzerで検査する。runtimeとdoctorが同じ判定を使うため `shared_state` とする。

### Step 3: doctorへのhard配線とmutation oracleを確定する [直列]

registry欠落、JSON破損、source／detector drift、duplicate kind、contract欠落、unsafe pathをwarningへ縮退させず
fail-closeする。doctorのstate／ok／message接続は実装確定後にのみ検証できるため `shared_state` とする。

### Step 4: targeted／typecheck／format／全回帰を同一HEADで実測する [直列]

U-UILSRC／IT-UILSRCのtargeted test、typecheck、Biome、PLAN lint、DB／doctorを実行し、output digest付きで記録する。
検証対象が同一HEADへ収束した後にだけ意味を持つため `shared_state` とする。

### Step 5: 独立review、current HEAD CI、main read-afterで次sliceを解放する [直列]

Claude exact-HEAD review、必要なruntime内subagent review、CI、DB replay、Reverse fullbackを順に確認する。reviewと
main着地後の判定は候補HEADを共有するため `shared_state` とする。

## §3.1 実装計画

- **source registry runtime**（情報源: Universal Improvement Loop L3要件 UIL-R-01、L6設計）: schema、requirements
  authority、10 source kind、source lifecycle metadata、observation admissionを実装する。
- **source registry doctor**（情報源: source registry runtimeのanalyzer、既存doctor contract）: loaderと同じ判定を
  hard gateとして接続し、registry欠落・破損・drift・unsafe pathをfail-closeする。
- **unit／doctor test**（情報源: L8テスト設計）: duplicate、欠落、contract退化、digest、identity、freshness、
  doctor wiringの反例をmutation oracleとして固定する。
- **完了境界**: 本PLANは観測sourceのadmissionまでとし、normalization、finding、candidate、counterfactual、route、
  Issue／PLAN／Requirement書込みはUIL-02以降へ残す。

## 検証順

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | registry schemaとrequirements authorityを固定 | 10 source kindとID／digest tuple、source lifecycle metadataが一意になる |
| 2 | runtime loader／analyzer／observation admissionを実装 | unknown、duplicate、drift、invalid evidenceが個別にredになる |
| 3 | doctorへ接続 | current registryがgreen、欠落／破損がredになる |
| 4 | targeted test、typecheck、Biome、PLAN lint | U-UILSRC／IT-UILSRC oracleがgreenになる |
| 5 | full CI、Claude exact-HEAD review、main read-after | current HEADの証拠でのみ次のUIL sliceを解放する |

## 非対象

- UIL-02以降の観測正規化、finding、candidate、counterfactual、route、recipe、E2E
- 既存detectorの内部挙動変更または重複実装
- source registryからの自動Issue／PLAN／Requirement変更
- AI provider、resident lane、Notification Fabric、#1037 whole-system plannerは非対象とする
- GitHubへの書込み、publish、tag、cutover
