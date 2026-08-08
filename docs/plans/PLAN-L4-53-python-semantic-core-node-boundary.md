---
plan_id: PLAN-L4-53-python-semantic-core-node-boundary
title: "PLAN-L4-53 (add-design): Python 意味コアと Node 実行境界の L4 基本設計（Issue #230 foundation）"
kind: add-design
layer: L4
drive: agent
status: confirmed
route_mode: add-feature
entry_signals:
  - "po_directive:2026-08-06 Design HARNESS未ブロックタスクとして#230 Python意味コアとNode transaction境界を進める"
created: 2026-08-08
updated: 2026-08-08
backprop_decision: not_required
backprop_decision_reason: "VDH-FR-001/016/017（confirmed L3 要件）と ADR-010（accepted）の forward route どおりの L4 追加設計。L3 要件・ADR は変更しない。"
owner: Claude / TL
github_issue_id: 230
parent_design: docs/design/helix/L3-requirements/ai-vision-design-harness-engine.md
pair_artifact: docs/test-design/helix/L4-python-semantic-core-node-boundary-system-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - { role: aim, slot_label: "AIM — #230 foundation の capability 境界分割" }
  - { role: tl, slot_label: "TL — ADR-010 層別 authority と #194 別責務分離のレビュー" }
generates:
  - { artifact_path: docs/plans/PLAN-L4-53-python-semantic-core-node-boundary.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L4-basic-design/python-semantic-core-node-boundary.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L4-python-semantic-core-node-boundary-system-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: config }
dependencies:
  parent: docs/plans/PLAN-L1-07-infinity-loop-platform-requirements.md
  requires:
    - docs/adr/ADR-010-python-semantic-core-node-commit-boundary.md
  references:
    - docs/design/helix/L5-detail/python-worker-runtime.md
    - docs/design/helix/L6-function-design/python-worker-runtime.md
review_evidence:
  - reviewer: "Claude code-reviewer subagent (intra-runtime)"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-08T06:20:03Z"
    tests_green_at: "2026-08-08T06:20:03Z"
    verdict: approve
    worker_model: claude-fable-5
    reviewer_model: claude-sonnet-5
    scope: "Codex CLIがusage limit継続中のため規定代替のintra_runtime_subagentとして設計レビューを2ラウンド実施した。reviewerはgh issue view 230/257/212/180の実メタデータ・ADR-010・VDH-FR-001/016/017・既存L5/L6 python-worker-runtime・#209 L4 precedentと突合した。1回目request changes（Important 1件: VDH-FR-001をprimary owner宣言しながらSA-PSC-01〜03のいずれもintake receipt固有の検証面を持たず、requirements↔SAの1:1対応（#209 precedent）から欠落。Minor 1件: Completion条件のbrowser evidence偽装fail-closeが§2に現れない非対称）。是正としてSA-PSC-04（実211-file inventoryのintake receipt end-to-end、VDH-FR-001タグ付き）をL4 §3とpair L9テスト設計の両方へ追加し1:1対応を回復、§2へ項目6（証跡保全、全列挙の正本は§3 SA-PSC-03と併記）を追加した。2回目approve（Critical/Important 0。残Minor 1件=pair doc導入文のSA範囲表記が01〜03のまま、は同round内で01〜04へ是正済み）。#194 worker-descriptor-admissionとの別責務分離・#257/#212/#180のblocked_by整合・§0旧proposal-only呼称是正のADR-010整合・slice1 Node revalidatorの意味再実装なしdisclaimerは所見ゼロで確認された。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --configLoader runner --project fast tests/vmodel-pair.test.ts tests/design-coverage.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-08T06:20:03Z", evidence_path: docs/design/helix/L4-basic-design/python-semantic-core-node-boundary.md, output_digest: "sha256:f2c0370d735ff6e9f408831b305c4916bb49199825b63b64c02688d04d64f25b", result: "worktree: 2 files / 70 tests green（vmodel-pair・design-coverage、catalog登録とpair整合を含む）" }
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-08T06:20:03Z"
  review_binding:
    reviewer: "Claude code-reviewer subagent (intra-runtime)"
    reviewed_at: "2026-08-08T06:20:03Z"
    evidence_digest: "sha256:49a45b0bd4a69a6e4ca68429a1cc6babee7f7cc67c5ff034644de4863b72090d"
  entries: []
---

# PLAN-L4-53 (add-design): Python 意味コアと Node 実行境界の L4 基本設計

## 0. 目的

Issue #230（VDH-FR-001/016/017、ADR-010）の Design HARNESS foundation を L4 基本設計へ
降下させる。実装・関数契約は行わない（L5/L6 後続）。

## 1. スコープ

`docs/design/helix/L4-basic-design/python-semantic-core-node-boundary.md` を新設し、以下を確定する。

1. **用語規約（§0）**: ADR-010 準拠の「Python 意味コア／Node 実行境界＝同格の層別権威」。
   既存 L5/L6 python-worker-runtime の旧 proposal-only 呼称を compatibility debt と宣言し、
   L5 pair-freeze 時の是正対象とする（JSON Lines envelope・digest 検証・quarantine 構造は再利用）。
2. **capability 境界（§1）**: VDH-FR-001/016/017 の primary ownership、#194 admission との
   別責務分離、#257/#212/#180 の downstream/consumer 関係。
3. **分離原則（§2）**: 意味判定重複 0 / Python authoritative write 0 / Node 未再検証 commit 0 /
   別 authoring DB 禁止 / 決定性 / 証跡保全。
4. **system assertion（§3）**: SA-PSC-01〜04（L4↔L9、実物のみ・合成 fixture 不使用）。
   requirements 3 件と SA の 1:1 対応（VDH-FR-001↔SA-PSC-04、VDH-FR-016/017↔SA-PSC-01〜03）。
5. **実装スライス方針（§4）**: semantic contract 層（Node revalidator、意味の再実装なし）→
   Python 意味コア骨格 → Node transaction consumer → sidecar / intake receipt → gate 配線。

## 2. 後続（本PLAN非対象）

- L5 詳細設計（既存 python-worker-runtime L5/L6 の ADR-010 呼称是正を含む pair-freeze）
- L6 実装 ↔ L7 TDD closure（実装スライス群、各スライスで add-impl PLAN を起票）
