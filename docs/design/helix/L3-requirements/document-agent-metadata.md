---
title: "HELIX L3 要件 — 文書 agent metadata 契約"
layer: L3
kind: add-design
status: draft
created: 2026-07-14
updated: 2026-07-14
owner: Codex / TL
plan: PLAN-L3-13-vmodel-docgen-fit
related_l3: docs/design/helix/L3-requirements/vmodel-docgen-fit.md
related_l12: docs/design/helix/L12-vmodel/vmodel-docgen-adoption-matrix.md
pair_artifact: docs/test-design/helix/L8-document-agent-metadata-contracts.md
document_agent:
  defines:
    - HVM-FR-AGMETA-01
  read_first:
    - docs/design/helix/L3-requirements/vmodel-docgen-fit.md
  done_when:
    required_declaration_ids:
      - HVM-FR-AGMETA-01
    required_read_first:
      - docs/design/helix/L3-requirements/vmodel-docgen-fit.md
    required_pair_artifact: docs/test-design/helix/L8-document-agent-metadata-contracts.md
    required_gates:
      - design-declarations
      - vpair-binding
spec:
  defines:
    - id: HVM-FR-AGMETA-01
      kind: 機能要件
      title: 文書 agent metadata の導出・突合
      layer: L3
      owner: TL
      status: draft
  refs:
    - from: HVM-FR-AGMETA-01
      to: HR-FR-VMFIT-01
      kind: constrains
    - from: HVM-FR-AGMETA-01
      to: HR-FR-VMFIT-03
      kind: supports
---

# HELIX L3 要件 — 文書 agent metadata 契約

## §0 位置付け

本書は ZIP 正本の `tools/agent_meta.py` が持つ「文書ごとの作業契約を実態から導出し、宣言の乖離を検出する」
能力を、ADR-010のPython意味コアとして保持・接続する要件である。Nodeは検証済みfindingのcommit境界だけを担う。
対象は `.claude/agents/*.md` のロール定義ではない。
canonical な設計・テスト設計 Markdown に置く `document_agent` 従属宣言だけを扱う。

## §1 要件

| ID | 要件 | 受入条件 |
|---|---|---|
| HVM-FR-AGMETA-01 | `spec.defines` / `spec.refs` の typed declaration を正本として、文書の `defines`、上流文書 `read_first`、機械検証可能な `done_when` を決定論的に導出・突合する | 実態と宣言の missing / unknown / stale / mismatch は構造化 finding となり、検査は source を変更しない |

## §2 適用境界

- 初期対象は `docs/design/**` と `docs/test-design/**` の canonical Markdown である。
- `docs/archive/**`、`docs/plans/**`、生成物、`.claude/agents/**`、prompt と runtime state は対象外である。
- Python/Excel の導入、harness.db の正本化、role prompt の変更は本スライスの非目標である。
- 本文中の ID らしき文字列は pass 根拠に使わない。typed declaration を持たない文書を暗黙に covered と扱わない。

## §2.1 段階的な apply 境界

ZIP 正本の `apply` を不明確に捨てない。Phase A は read-only `check` と proposed metadata の出力までを実装し、
Phase B は L9 の write-port / rollback oracle が green になった後だけ、明示 `apply` により scope manifest 内の
Markdown frontmatter を更新できる。templates への展開は HELIX の template catalog と同時に別 L6/L7 で設計する。
Phase A 完了を HVM-GAP-01 全体の完了とは扱わない。

## §3 降下先

- L4: `docs/design/helix/L4-basic-design/document-agent-metadata.md`
- L5: `docs/design/helix/L5-detail/document-agent-metadata-contract.md`
- L6: `docs/design/helix/L6-function-design/document-agent-metadata-contract.md`
- L8: `docs/test-design/helix/L8-document-agent-metadata-contracts.md`
- L9: `docs/test-design/helix/L9-document-agent-metadata-integration.md`
