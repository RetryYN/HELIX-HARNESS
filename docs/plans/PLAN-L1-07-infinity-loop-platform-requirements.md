---
canonical_vmodel: L1-L12
canonical_layer: L2
canonical_pair: L11
legacy_physical_layer: L1
l3_progression_marker: HELIX:L3-PROGRESSION-AUTHORITY:v1
l3_progression_authority: docs/governance/l3-progression-authority-rebaseline-2026-07-19.md
plan_id: PLAN-L1-07-infinity-loop-platform-requirements
title: "PLAN-L1-07: HELIX Infinity Loop platform 要件定義 — runtime再編・循環監査・Issue強制契約"
kind: design
layer: L1
drive: agent
status: draft
route_mode: forward
entry_signals:
  - "po_directive:2026-07-15 Python+TS/Node、Linux中心multi-OS、HARNESS-owned agent、Infinity Loop、ZIP/旧UT/現行全資産を見落としなく要件化し、必要な基本設計を並行する"
created: 2026-07-15
updated: 2026-07-15
owner: PO (人間 / RetryYN)
master_hub: true
parent_design: docs/design/helix/L0-charter/helix-charter_v0.1.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
pair_artifact: docs/test-design/helix/L1-infinity-loop-operational-test-design.md
next_pair_freeze: L14
screen_applicability:
  status: not_applicable
  reason_code: no_user_interface_in_plan_scope
  reason: "HARNESS control/data plane と実行監査機構の構築であり、このPLANの製品scopeにユーザー画面を含まない"
  decided_by: "PO (人間 / RetryYN), 2026-07-15"
  decided_at: "2026-07-15T01:23:41+09:00"
  decision_provenance: "PO chat directive: HARNESS構築だから画面要求はないが明示的skipが必要"
  canonical_scope: "HARNESS control/data plane and execution-audit mechanisms"
  scope_hash: "sha256:ffe6e9c5d64926142925790ccf64d6798a4c1ecbd39f9b9eaa1c1fc1a678d0b6"
  input_binding:
    - path: docs/design/helix/L0-charter/helix-charter_v0.1.md
      sha256: 9a120c630b98b420e8f967f527c5ac625264a6324b4b63e683251d067becc810
    - path: docs/design/helix/L1-requirements/pillar-requirements.md
      sha256: 4eadfe6f8d1368884163fa45ff1ba44c6fb9a18a4cdfb929bc576a6feac2f7a8
  reentry_trigger: "dashboard、GUI、対話画面を本PLANまたは子PLANのscopeへ追加した時点"
skip_sub_doc:
  - sub_doc: screen
    reason: "HARNESS構築の本PLANは no UI scope。画面追加時はPrototype Discoveryへ再entryする"
agent_slots:
  - role: po
    slot_label: "PO — Infinity Loop / Universal Reverse / Redesign / runtime再編のL1確定"
  - role: tl
    slot_label: "TL — ZIP・旧UT全branch・現行資産の採用境界とL4 carryレビュー"
generates:
  - artifact_path: docs/plans/PLAN-L1-07-infinity-loop-platform-requirements.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L1-infinity-loop-operational-test-design.md
    artifact_type: test_design
  - artifact_path: docs/governance/infinity-loop-source-capability-ledger.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/infinity-loop-requirement-coverage-ledger.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/infinity-loop-requirement-definition-ledger.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/infinity-loop-assertion-coverage-ledger.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/infinity-loop-source-atomization-contract.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/infinity-loop-source-snapshot-manifest.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/infinity-loop-design-progress-ledger.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/infinity-loop-design-slice-registry.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L9-infinity-loop-platform-system-test-design.md
    artifact_type: test_design
  - artifact_path: docs/governance/infinity-loop-system-assertion-cases.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md
    artifact_type: test_design
  - artifact_path: docs/design/helix/L5-detail/source-capability-capture.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L5-source-capability-capture-integration-test-design.md
    artifact_type: test_design
  - artifact_path: docs/design/helix/L6-function-design/source-capability-capture.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L6-source-capability-capture-unit-test-design.md
    artifact_type: test_design
  - artifact_path: docs/design/helix/L5-detail/source-capability-atomization-closure.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L5-source-capability-atomization-closure-integration-test-design.md
    artifact_type: test_design
  - artifact_path: docs/design/helix/L6-function-design/source-capability-atomization-closure.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L6-source-capability-atomization-closure-unit-test-design.md
    artifact_type: test_design
  - artifact_path: docs/design/helix/L5-detail/python-worker-runtime.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L5-python-worker-runtime-integration-test-design.md
    artifact_type: test_design
  - artifact_path: docs/design/helix/L6-function-design/python-worker-runtime.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L6-python-worker-runtime-unit-test-design.md
    artifact_type: test_design
  - artifact_path: docs/design/helix/L5-detail/node-runtime-cutover.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L5-node-runtime-cutover-integration-test-design.md
    artifact_type: test_design
  - artifact_path: docs/design/helix/L6-function-design/node-runtime-cutover.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L6-node-runtime-cutover-unit-test-design.md
    artifact_type: test_design
  - artifact_path: docs/design/helix/L5-detail/os-portability-supply-chain.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L5-os-portability-supply-chain-integration-test-design.md
    artifact_type: test_design
  - artifact_path: docs/design/helix/L6-function-design/os-portability-supply-chain.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L6-os-portability-supply-chain-unit-test-design.md
    artifact_type: test_design
  - artifact_path: docs/design/helix/L5-detail/engine-detector-execution.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L5-engine-detector-execution-integration-test-design.md
    artifact_type: test_design
  - artifact_path: docs/design/helix/L6-function-design/engine-detector-execution.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L6-engine-detector-execution-unit-test-design.md
    artifact_type: test_design
  - artifact_path: docs/design/helix/L5-detail/product-data-connector.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L5-product-data-connector-integration-test-design.md
    artifact_type: test_design
  - artifact_path: docs/design/helix/L6-function-design/product-data-connector.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L6-product-data-connector-unit-test-design.md
    artifact_type: test_design
  - artifact_path: docs/design/helix/L5-detail/harness-agent-lifecycle.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L5-harness-agent-lifecycle-integration-test-design.md
    artifact_type: test_design
  - artifact_path: docs/design/helix/L6-function-design/harness-agent-lifecycle.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L6-harness-agent-lifecycle-unit-test-design.md
    artifact_type: test_design
  - artifact_path: docs/design/helix/L5-detail/memory-learning-promotion.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L5-memory-learning-promotion-integration-test-design.md
    artifact_type: test_design
  - artifact_path: docs/design/helix/L6-function-design/memory-learning-promotion.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L6-memory-learning-promotion-unit-test-design.md
    artifact_type: test_design
  - artifact_path: docs/design/helix/L5-detail/three-stage-ci-quarantine.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L5-three-stage-ci-quarantine-integration-test-design.md
    artifact_type: test_design
  - artifact_path: docs/design/helix/L6-function-design/three-stage-ci-quarantine.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L6-three-stage-ci-quarantine-unit-test-design.md
    artifact_type: test_design
  - artifact_path: docs/design/helix/L5-detail/issue-scope-authority-gates.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L5-issue-scope-authority-gates-integration-test-design.md
    artifact_type: test_design
  - artifact_path: docs/design/helix/L6-function-design/issue-scope-authority-gates.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L6-issue-scope-authority-gates-unit-test-design.md
    artifact_type: test_design
  - artifact_path: docs/design/helix/L5-detail/universal-reverse-redesign.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L5-universal-reverse-redesign-integration-test-design.md
    artifact_type: test_design
  - artifact_path: docs/design/helix/L6-function-design/universal-reverse-redesign.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L6-universal-reverse-redesign-unit-test-design.md
    artifact_type: test_design
  - artifact_path: docs/design/helix/L5-detail/intake-contract-normalization.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L5-intake-contract-normalization-integration-test-design.md
    artifact_type: test_design
  - artifact_path: docs/design/helix/L6-function-design/intake-contract-normalization.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L6-intake-contract-normalization-unit-test-design.md
    artifact_type: test_design
  - artifact_path: docs/design/helix/L5-detail/forward-infinity-orchestration.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L5-forward-infinity-orchestration-integration-test-design.md
    artifact_type: test_design
  - artifact_path: docs/design/helix/L6-function-design/forward-infinity-orchestration.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L6-forward-infinity-orchestration-unit-test-design.md
    artifact_type: test_design
  - artifact_path: docs/design/helix/L5-detail/github-pr-audit-promotion.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L5-github-pr-audit-promotion-integration-test-design.md
    artifact_type: test_design
  - artifact_path: docs/design/helix/L6-function-design/github-pr-audit-promotion.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L6-github-pr-audit-promotion-unit-test-design.md
    artifact_type: test_design
  - artifact_path: docs/design/helix/L5-detail/screen-applicability-prototype.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L5-screen-applicability-prototype-integration-test-design.md
    artifact_type: test_design
  - artifact_path: docs/design/helix/L6-function-design/screen-applicability-prototype.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L6-screen-applicability-prototype-unit-test-design.md
    artifact_type: test_design
  - artifact_path: docs/design/helix/L5-detail/design-refactoring-domain-model.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L5-design-refactoring-domain-model-integration-test-design.md
    artifact_type: test_design
  - artifact_path: docs/design/helix/L6-function-design/design-refactoring-domain-model.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L6-design-refactoring-domain-model-unit-test-design.md
    artifact_type: test_design
  - artifact_path: docs/design/helix/L5-detail/requirement-translation-obligation.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L5-requirement-translation-obligation-integration-test-design.md
    artifact_type: test_design
  - artifact_path: docs/design/helix/L6-function-design/requirement-translation-obligation.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L6-requirement-translation-obligation-unit-test-design.md
    artifact_type: test_design
  - artifact_path: docs/design/helix/L5-detail/layer-ledger-pair-gate.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L5-layer-ledger-pair-gate-integration-test-design.md
    artifact_type: test_design
  - artifact_path: docs/design/helix/L6-function-design/layer-ledger-pair-gate.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L6-layer-ledger-pair-gate-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: PLAN-L0-01-helix-charter
  requires:
    - PLAN-L0-01-helix-charter
  references:
    - docs/design/helix/L1-requirements/pillar-requirements.md
    - docs/adr/ADR-001-helix-harness-redesign-and-language.md
    - docs/design/helix/L3-requirements/vmodel-docgen-fit.md
    - docs/governance/helix-harness-concept_v3.1.md
    - docs/governance/helix-harness-requirements_v1.2.md
    - docs/skills/screen-driven-requirements.md
    - docs/process/forward/L00-L06-design-phase.md
---

# PLAN-L1-07: HELIX Infinity Loop platform 要件定義

## §0 目的

HELIX を、Forward spine を正としながら、横軸に **監査・改善 ⇔ Gate ⇔ 自動走行** の
`HELIX Infinity Loop` を持つ循環型実行監査システムへ拡張する。本PLANはチャットで確定した方向を、
runtime再編、Issue強制契約、Universal Reverse、Redesign、HARNESS所有agent、Design Obligation Graph、
Requirement Translator、L0–L14 Layer Ledger Chain、ZIP/旧UT資産採用まで含めて
L1要件とL14運用テストへ固定する。

既存 `pillar-requirements.md` のP0–P9は維持し、本PLANは新しい実行責務と強制契約をadditive deltaとして足す。

## §1 正本入力inventory

| 入力 | 固定した事実 | 本PLANでの扱い |
|---|---|---|
| チャット要求 2026-07-14〜15 | Codex=実行、Claude Code=監査/改善/PR hook/memory圧縮、全IssueにReverse、Redesign追加、Issue/Scope Gate、画面工程の明示的な適用/skip判定 | HIL-*要件の一次入力 |
| `ハイブリッド設計ドキュメントv1-fixed.zip` | SHA-256 `9c547ba8bc9eaf3a12f27254fd3eb6d04b37fb8c899f13d56ceb0d2cff179fb3` | Python core/detector/文書DB機能をinventory-firstで採否 |
| ZIP core | `build.py`, `agent_meta.py`, `assign.py`, `schedule.py`, `derive_traces.py`, `impact.py`, `consistency.py`, `spec_*` | Python data/detection plane候補。bulk port禁止、契約単位で再実装/接続 |
| 旧UT `main` | routeFiling、issue_queue、memory promotion、team runner、agent contract、Reverse/backfill | 既存機構の強化元 |
| 旧UT `work/l6-82-universal-pr-trigger` | 全PR共通trigger + `github-ci-policy` fail-close | PR監査入口に採用 |
| 旧UT `work/l6-81-agent-registry-design` | HARNESS所有registry、runtime射影、blind review、muster | subagent標準化に採用 |
| 旧UT `work/l7-418-plan-asset-v2` | evidence producer認証、lease/custody、GitHub re-entry | Issue/evidence信頼境界に採用候補 |
| 旧UT `work/l7-421-test-hygiene-live-tree-fence` | branch固有commit 0、旧mainへ吸収済み。detached snapshot/live-tree fenceは現行HELIX未採用 | `absorbed`で落とさず現行gapをharden対象化 |
| 現行HELIX | P0–P9、harness.db、Reverse、job queue、memory、GitHub自走、Node SQLite fallback | 作り直さず強化する土台 |
| 旧系譜 `screen-driven-requirements` | rough requirement→prototype→walkthrough→潜在要求back-propagation→agreement後freeze | 画面対象へ適用する孤立契約。今回のno-UI判定でも工程自体は消さない |
| 現行L2/ZIP画面資産 | Low-Fi wireframe、静的diagram DSL、9状態/visual/a11y検証観点は存在。操作可能prototype作成task/gateは欠落 | 将来の画面対象routeで採用。今回PLANは明示skip |
| ZIP `docs/107_Vモデル・レベル定義.yaml` | L2 prototype合意、画面先行、evolutionary prototype、stub廃棄を宣言 | capability ledgerでHIL ID/Gate/testへ結線し、参照だけで採用済みにしない |
| ZIP `ハーネス導入ガイド.md` / `docs/wbs.yaml` | prototypeで要求を引き出すこと、合意なきL3 freeze禁止、assign証跡を要求 | source coverage gateの必須抽出対象 |
| ZIP `27_ドメインモデル設計書` / `30_用語集・データディクショナリ` / `31_共通部品・クラス設計書` / `94_ドメイン実装方針・値オブジェクト設計書` / `95_クラス・メソッド設計規約書` / `108_リファクタリング設計書` | ubiquitous language、domain object、責務、CQS、behavior-preserving refactorの設計材料を持つが、stable object/oracle IDと全consumer義務graphは持たない | Domain Model CatalogとDesign Refactorへ`adopt+harden`し、template存在だけをcoverageに数えない |
| 現行`design-coverage` / `entity-coverage` / `ddd-tdd-rules` | 文書種・artifact path・粗いentity数・module/test規律は検査するが、requirement→service→object→facet→test/gateの意味閉包を検査しない | Design Obligation Graph Gateで補完し、既存greenをsemantic coverageへ読み替えない |
| PO chat 2026-07-15 Requirement Translator | chat/product/sourceを原子的要求へ翻訳し、現行templateで表現不能ならtemplate改善loopへ戻す | Translatorはproposal専用。Template Gap Issue→shadow→独立監査→version昇格を要求化 |
| PO chat 2026-07-15 Layer Ledger Chain | 各Lの台帳をtemplate機械抽出・追加記載・設計refactorへ接続し、上下隣接pairと左右V-pairを必須にする | L0–L14 registry、obligation extractor、vertical/horizontal pair gate、ledger refactorを要求化 |

## §2 工程表

1. ZIP・旧UT全branch・現行資産を機能単位で棚卸しし、`adopt / harden / redesign / reject`を記録する。
2. チャット要求をHIL-BR/HIL-FR/HIL-NFRへ量閉じし、L14対を作る。
3. Screen Applicability Gateで今回scopeを`not_applicable`と判定し、理由・判定者・再entry条件をreceipt化する。画面工程を未実施のまま暗黙通過させない。
4. Node/Python境界、Linux中心OS profile、Infinity Loop状態機械、Issue/Reverse/Redesign Gate、agent registryをL4へ降ろす。
5. requirement/service/domain objectから原子的design obligationを導出するtemplate schemaと、semantic discharge/N/A/deferred/stale契約をL4へ降ろす。
6. HARNESS-owned Requirement Translator、challenge queue、Template Gap Issue、shadow評価、独立監査、promotion/rollbackをL4へ降ろす。
7. L0–L14のLayer Ledger Registry、template obligation抽出、上下隣接pair、左右V-pair、台帳ベースDesign RefactorをL4へ降ろす。
8. ADR-001をsupersedeするruntime ADRを起票し、Bun依存を移行PLANへ分離する。
9. L1/L14 pair lint、design-language、trace、旧前提残存を検証し、PO re-freezeへ出す。

## §3 非対象

- 本PLAN内でBun→Node cutoverを実行しない。
- GitHub権限、branch protection、token、外部API設定を変更しない。
- ZIPのPythonコードや旧UT branchをproduct runtimeへbulk importしない。
- `.helix`識別子cutoverをPLAN-M-02承認前に行わない。
- acceptance、承認済みscope、固定されたrequirement/design obligationに不要なAPI/CLI/schema/dependency/config、
  将来用途だけの一般化を本PLANへ追加しない。必要性を後から主張してScope Gateを迂回しない。
- Reverse R0–R4の処理量、stage固有obligation、探索証拠を省略・代表sample化・`not-required`扱いしない。
  budgetや現行CI不調をUniversal Reverseの免除根拠にしない。

## §4 完了条件

- [ ] チャットのproduct要求はHIL-*へ、当該作業だけのexecution指示はexecution contractへ対応し、raw chat sourceとの差分未確認が0件。
- [ ] ZIP core/detector/database機能と旧UT全branch固有差分の採否台帳がある。
- [ ] source snapshotの全capabilityが`source→decision→requirement→design→test→gate`へ結線され、未判断・未接続0件である。
- [ ] 全HIL-BR/FR/TR/NFRにL14対と原子的assertionがあり、system failure caseまで孤児0件。
- [ ] L4で決める事項とL1で凍結する能力境界が分離されている。
- [ ] Node/Python/Linux、Universal Reverse、Redesign、Issue/Scope/Closure Gate、agent registry、memory圧縮責務が要件化されている。
- [ ] 全115 HIL要件がrequirement definition ledgerを経てservice/domain object/design obligation/template section/test oracle/gateへ原子的に双方向joinされ、見出し・placeholder・aggregate一括消込・偽N/Aが0件である。
- [ ] Requirement Definition Ledgerが115 stable ID/revisionを個別登録し、source atom authority、acceptance oracle、service/template/obligation edge、split/merge/rename/supersede receiptを持つ。authority-pending/stale/deferredはfreezeへ算入しない。
- [ ] Requirement Translatorが原文を保持してatomic requirementまたはchallengeへ決定的にroutingし、表現不能義務がTemplate Gap Issueへ戻る。translator自己昇格、shadowなし強制、独立監査なしpromotionが0件である。
- [ ] L0–L14の各layer ledgerがactive templateから原子的obligationを抽出し、追加行のprovenanceを保持する。全上下隣接pairと正規左右V-pairが双方向・同一revision/snapshot/oracleで閉じ、台帳refactorが全pairを保存する。
- [ ] 画面工程はprototype evidenceまたは有効なskip receiptの二者択一で閉じ、今回はno-UI理由と再entry条件が記録されている。
- [ ] targeted lint/test/doctor相当のgreen evidenceと別runtime reviewが記録される。
- [ ] POがL1/L14 pairをre-freezeする。
