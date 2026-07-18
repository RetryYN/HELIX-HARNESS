---
title: "HELIX L12運用 — REBASELINE v0.5.0追突監視"
layer: L12
kind: operation-design
status: draft
created: 2026-07-18
updated: 2026-07-18
owner: TL / QA
related_l3: docs/design/helix/L3-requirements/hybrid-rebaseline-v0.5.0-collision.md
related_l10: docs/test-design/helix/hybrid-rebaseline-v0.5.0-collision-acceptance.md
---

# HELIX L12運用 — REBASELINE v0.5.0追突監視

| operation ID | 監視対象 | trigger | recovery |
|---|---|---|---|
| OP-V050-01 | source digest/member set | ZIP又はmanifest変更 | deltaを全量再計算し旧receiptをstale化 |
| OP-V050-02 | requirement/AC/edge set | count、ID、statement変更 | L1/L3/L4/L10/L12 projectionを再生成・再監査 |
| OP-V050-03 | authority epoch | ADR、AGENTS、CLAUDE、Core Reads不一致 | canonical writeを停止しRedesignへ戻す |
| OP-V050-04 | delivery route | multiple/zero route、hard trigger誤分類 | 完全Vへfail-closeして再分類 |
| OP-V050-05 | capsule conformance | digest、brief、allowlist不一致 | subagent起動拒否、Issue＋audit event発行 |
| OP-V050-06 | source freshness | 30日、10 commit、要件freeze直前 | ref再列挙とdelta auditを実行 |
| OP-V050-07 | package consistency | version/count/authority claim不一致 | terminal PASSを撤回しsource candidateへ降格 |

Production Scrumでも各incrementに受入条件、test design、Reverse、migration、rollback、release evidence、
L12 feedbackを要求する。運用証拠がない状態を「小規模だから完了」と扱わない。
