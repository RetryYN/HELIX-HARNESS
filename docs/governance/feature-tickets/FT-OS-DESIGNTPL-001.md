---
feature_ticket_id: FT-OS-DESIGNTPL-001
title: "HELIX-OS Design Template lifecycle管理"
product_target: HELIX-OS
state: proposed_upstream_waiting
priority_order: 6
created: 2026-09-15
authority_effect: work_projection_only
github_projection:
  issue: 1803
  url: https://github.com/RetryYN/HELIX-HARNESS/issues/1803
  projection_receipt_ref: docs/governance/audits/source-rebaseline/github-feature-ticket-projection-2026-09-15.md
  read_after_state: OPEN
parent_requirements:
  - HELIXOS-L2-001
  - HELIXOS-L2-002
  - HELIXOS-L2-005
  - HELIXOS-L2-007
  - HELIXOS-L2-013
acceptance_source: docs/helix-os/L11-acceptance/governance-acceptance.md
depends_on:
  - FT-OS-REQCLASS-001
  - FT-HARNESS-DESIGNTPL-001
---

# FT-OS-DESIGNTPL-001: HELIX-OS Design Template lifecycle管理

## 目的

HARNESS Design Templateの候補、承認済みseed、current、stale、retiredを管理し、projectごとの選定、適用、設計義務、
backflow、成果、finding、再作業、受入、運用結果から改善候補までを同じ因果関係で追跡する。

## 境界

- template意味とapplicability ruleはHARNESSが所有し、OSは独自に追加・削除しない。
- registry登録や選定はtemplate承認、要求合意、設計完成を意味しない。
- missing、stale、conflict、必要input欠落では任意templateや自由形式へfallbackしない。
- 利用回数、文書生成、AI自己評価だけでtemplateを昇格・変更しない。
- 改善候補は対象HARNESS要求へ戻し、採択・再検証・効果再観測を経る。

## 停止条件

- HARNESS template contractまたはOS分類projectionが未freeze。
- project、product、要求revision、template exact version、permissionが不明。
- supersession、rollback、stale、再構築、利用data境界が未定義。

現在はticket発行だけを行い、registry、DB、selection、Worker、学習、CIを起動しない。
