---
plan_id: PLAN-RECOVERY-1645-markdown-table-coverage
title: "正本Markdownの未収載表行を拒否する"
kind: recovery
layer: cross
drive: agent
status: draft
completion_claim_allowed: false
owner: Codex / TL
created: 2026-09-08
updated: 2026-09-08
github_issue_id: 1645
behavior_contract_id: REQUIREMENT-REFINEMENT-TABLE-COVERAGE
responsibility_owner: requirement-refinement-authority
entry_signals: [regression_dev]
engineering_discipline_required: true
change_slice: atomic
refactor_step: dual_green
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: aggregate
contract_preconditions: "現行refinement source・typed projectionと実際の呼出し先を照合する"
contract_postconditions: "IR sourceの表行取り落としを元path・行番号付きで拒否し、別表・コード例を誤拒否しない"
contract_invariants: "必須R/ACと意味を削らず、空行を跨ぐ推測結合・新しい要求authorityを追加しない"
contract_failures: "表から脱落した行、列数不一致をsource診断へ束縛し、成功projectionで相殺しない"
tdd_red_required: true
complexity_effect: net_neutral
complexity_justification: "既存Markdown projectionに被覆検査を追加し、独立parserや修復engineを新設しない"
removal_trigger: "同等の行被覆・診断契約を後継共通parserへ移しconsumer検証が成立した時"
parent_design: docs/design/helix/L5-detail/requirement-refinement-authority.md
pair_artifact: docs/test-design/helix/L8-requirement-refinement-authority-unit-test-design.md
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
dependencies:
  requires: []
  references: ["issue:397", "issue:1647", "issue:1634", "issue:1649"]
  blocks: []
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-1645-markdown-table-coverage.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: src/requirements/requirement-refinement-authority.ts, artifact_type: source_module }
  - { artifact_path: src/requirements/requirement-authority-gate.ts, artifact_type: source_module }
  - { artifact_path: tests/requirement-refinement-authority.test.ts, artifact_type: test_code }
  - { artifact_path: tests/requirement-authority.test.ts, artifact_type: test_code }
  - { artifact_path: docs/design/helix/L5-detail/requirement-refinement-authority.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L4-basic-design/requirement-refinement-authority.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-requirement-refinement-authority-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
verification_bindings:
  - { parent_design: docs/design/helix/L5-detail/requirement-refinement-authority.md, oracle_id: U-MTROW-001, test_path: tests/requirement-refinement-authority.test.ts }
  - { parent_design: docs/design/helix/L5-detail/requirement-refinement-authority.md, oracle_id: U-MTROW-002, test_path: tests/requirement-refinement-authority.test.ts }
  - { parent_design: docs/design/helix/L5-detail/requirement-refinement-authority.md, oracle_id: U-MTROW-003, test_path: tests/requirement-refinement-authority.test.ts }
  - { parent_design: docs/design/helix/L5-detail/requirement-refinement-authority.md, oracle_id: U-MTROW-004, test_path: tests/requirement-authority.test.ts }
  - { parent_design: docs/design/helix/L5-detail/requirement-refinement-authority.md, oracle_id: U-MTROW-005, test_path: tests/requirement-refinement-authority.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — 正本行とprojectionの被覆を照合" }
  - { role: se, slot_label: "SE — 既存parserへの被覆診断接合" }
  - { role: qa, slot_label: "QA — 脱落と正常な別表の反例" }
  - { role: tl, slot_label: "TL — consumer境界と独立検収" }
review_evidence: []
---

# Markdown表行取り落としの修復

## 収束範囲

#1647の表整形は三社sourceの一件を直す。本sliceはRequirement IRが読み込む正本sourceで、
表の外へ残った行を黙って捨てないようにする。IRがまだ列挙していないACの行も検出対象であり、
既存recordの個数を期待値として検査対象を縮めない。

検査するのはsource全体の表行被覆であり、各recordが同じsourceの全ACを所有することは要求しない。
他のrefinement recordが所有する正常な行を当該recordの未知IDとして拒否しない。
整形式の表からIR全record集合への意味被覆は、本sliceの表行脱落検出とは別の契約である。

調査では、L7のoracle抽出は別関数 `parseEligibleOracleTable` であると確認した。
#1634の同型事例を、Requirement IR parserの修正だけで解消済みとは扱わない。
本sliceからL7 gateへ無断で共通parserを移植せず、#1645全体の残義務として別consumerを追跡する。

空行を跨いで表を結合しない。別表はそれぞれheaderとseparatorを持つ場合に受理する。
コードfence中の例は非正本の例示として除外する。自動整形・自動書込みの権限は追加しない。
escaped pipeはcell内の文字として保持し、非escapeのpipeだけを区切りとする。

## 工程表

1. R0: sourceと実callsiteを確認し、未収載行を残したfixtureでRedを採取する。
2. R1/R2: L5/L8へ行被覆とpath/行番号診断を接合する。
3. R3: 既存projectionとauthority gateへ接続し、正常な別表・コード例・基準bundleを検証する。
4. R4: 検出分岐除去のmutation、exact HEAD CI・独立review・main read-after後に本sliceを検収する。

## 未完了

現在は局所修復の検証段階。実装の正式検収、L7 gate修復、三社IR凍結、runtime開始、#1645全体完了は主張しない。
CI修復 #1634の独立技術検収待ちの枠をこの直接の再発防止へ一時配分し、
統合可能な候補が揃えば統合を優先する。

## 局所実測

- 修復前にU-MTROW-001/002が失敗し、実validatorが未収載行を許可することを再現した。
- 表行検出を除去した隔離mutantではU-MTROW-001/002/004が失敗し、別表の正例は成功した。
  作業sourceを無効化せず、同じテストを別moduleへ解決して比較した。
- intra-runtimeのread-only点検がescaped pipeの誤拒否を指摘した。U-MTROW-005でRedを再現し、
  既存cell lexerへescape区別を追加した。これはClaude独立reviewの代替ではない。
- L4/L5の実在性digestは変更後validatorの実bytesへ追従した。source全体の表行診断を加えるだけで、
  正本のR/AC本文・所有・baseline・approval・required checkを変更しない。
- 最終局所実測は関連2 test files／35 tests、TypeScript型検査、変更4 TSのBiome、scoped PLAN lintが成功。
  最終sourceから作った検出分岐なしmutantは3反例が失敗し、正常な別表とescaped pipeの2正例は成功した。
  DB再構築はprojection ok、snapshotは当該PLANのみ追加した95件となった。
  これらは作成側の実測であり、未実施の独立review・CI・main read-afterの代用ではない。
