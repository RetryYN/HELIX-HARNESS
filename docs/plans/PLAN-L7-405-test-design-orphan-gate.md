---
plan_id: PLAN-L7-405-test-design-orphan-gate
title: "PLAN-L7-405 (impl): test-design起点のVペア孤児検出"
kind: impl
layer: L7
drive: be
status: completed
route_mode: forward
created: 2026-07-11
updated: 2026-07-11
owner: Codex / TL
parent_design: docs/design/harness/L6-function-design/vmodel-pair-freeze.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
entry_signals:
  - "po_directive:2026-07-11 設計とテスト設計/検証設計のVペアを作り、pair-freezeの未参照test-design見逃しを是正する"
backprop_decision: not_required
backprop_decision_reason: "既存の双方向Vペア・孤児0要件を実装どおりに強制する修正であり、上位要求の意味追加ではない。"
agent_slots:
  - role: tl
    slot_label: "TL - Vペア双方向契約とexemption境界"
  - role: se
    slot_label: "SE - test-design起点の孤児検出"
  - role: qa
    slot_label: "QA - fixtureとlive repo孤児0回帰"
generates:
  - artifact_path: docs/plans/PLAN-L7-405-test-design-orphan-gate.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L6-function-design/vmodel-pair-freeze.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: docs/test-design/harness/L8-unit-test-design.md
    artifact_type: test_design
  - artifact_path: docs/test-design/harness/L9-integration-test-design.md
    artifact_type: test_design
  - artifact_path: docs/test-design/harness/proposal-document-coverage-routing.md
    artifact_type: test_design
  - artifact_path: src/vmodel/lint.ts
    artifact_type: source_module
  - artifact_path: tests/vmodel-pair.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-11-vmodel-pair-lint.md
  requires:
    - docs/plans/PLAN-L7-11-vmodel-pair-lint.md
    - docs/design/harness/L6-function-design/vmodel-pair-freeze.md
  references:
    - ハイブリッド設計ドキュメントv1-fixed.zip
    - docs/test-design/harness/L9-integration-test-design.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-11T02:49:00+09:00"
    tests_green_at: "2026-07-11T02:48:30+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex-intra-runtime
    scope: "test-design起点の孤児検出、typed exemption kind/reason/target、nested path、exemption chain/cycle拒否、L5↔L8正本維持、L9 staged migrationとcross-layer metaの明示exemptionをseverity-firstで再レビューし、blocker/high残存なし。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests/vmodel-pair.test.ts tests/gate-static.test.ts --testTimeout=300000"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-11T02:48:30+09:00"
        evidence_path: tests/vmodel-pair.test.ts
        output_digest: "sha256:e9ab4fb5fac9eec9938a4f4987ed733ab89a90487f44e06e9e494d0fb4c8783c"
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-11T02:48:30+09:00"
        evidence_path: src/vmodel/lint.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: lint
        command: "npm run lint"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-11T02:48:30+09:00"
        evidence_path: src/vmodel/lint.ts
        output_digest: "sha256:960f36080820659b3dd45e2663c4fe8096fad718de4983907ac1729f006aa330"
      - kind: lint
        command: "npx --no-install tsx src/cli.ts plan lint docs/plans/PLAN-L7-405-test-design-orphan-gate.md"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-11T02:48:30+09:00"
        evidence_path: docs/plans/PLAN-L7-405-test-design-orphan-gate.md
        output_digest: "sha256:50e6367027af4dba814786347b35e3713f5273aa3e0b528f87bd93d60ea6e862"
      - kind: smoke
        command: "git diff --check"
        runner: bash
        scope: changed-files
        exit_code: 0
        completed_at: "2026-07-11T02:48:30+09:00"
        evidence_path: docs/plans/PLAN-L7-405-test-design-orphan-gate.md
        output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
---

# PLAN-L7-405: test-design起点のVペア孤児検出

## §0 目的

design起点だけでgreenになるpair-freezeの検出穴を塞ぎ、未参照test-designと理由無しexemptionをfail-closeする。

## §1 工程表

1. [直列] L6設計とL7 test-designへtest-design起点契約を追加する。
2. [直列] orphan / valid exemption / invalid exemptionのRed fixtureを追加する。
3. [直列] `PairDoc` parserと`analyzePairFreeze`を実装する。
4. [直列] 現行L5↔L8正本を維持し、L9 staged migration/meta文書をtyped exemptionにする。
5. [直列] targeted test、typecheck、lint、PLAN lint、commit固定fast suiteで閉じる。

## §2 受入条件

- 未参照test-designが`test-design-orphan`になる。
- 理由無しexemptionが`pair-exemption-invalid`になる。
- 現行L5↔L8正本を維持し、L9 staged migrationとmeta文書だけがtyped exemptionになる。
- live repoのpair orphanが0件になる。
- `npx --no-install vitest run tests/vmodel-pair.test.ts tests/gate-static.test.ts`、typecheck、lint、PLAN lintがgreenになる。

## §3 対象外

- 設計ID→oracle ID→実テストのtyped trace closure。後続sliceで扱う。
- 人間承認待ちclosure、version-up activation、rename cutoverの実行。

## §4 検証結果

- Red: U-VPAIR-007/008追加時は未参照test-designと理由無しexemptionを検出できず2件failした。
- Green: orphan、typed exemption、nested path、meta→test、exempt chain/cycle、live exemption集合を含むtargeted 63件がpassした。
- L5↔L8の現行正本を維持し、L9はatomic layer migration前のstaged文書として明示した。
- severity-first再レビューでblocker/high残存なしを確認した。
