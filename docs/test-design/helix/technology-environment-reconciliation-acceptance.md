---
canonical_vmodel: L1-L12
canonical_layer: L10
canonical_pair: L3
title: "Technology Environment Reconciliation Authority受入テスト設計"
layer: L10
status: draft
created: 2026-08-29
updated: 2026-08-29
owner: QA / TL
parent_design: docs/design/helix/L3-requirements/technology-environment-reconciliation-requirements.md
plan: PLAN-L3-72-technology-environment-reconciliation
---

# Technology Environment Reconciliation受入テスト設計

| AC ID | 対応 | 合格条件 | Negative Oracle |
|---|---|---|---|
| TER-AC-001 | TER-R-01 | 全対象にowner、version、schema/artifact digest、support、triggerがある | unknown、ownerなし、range-onlyを拒否 |
| TER-AC-002 | TER-R-02 | declared/effective/runtime probeを区別する | repository設定の存在だけでgreenにしない |
| TER-AC-003 | TER-R-02 | HELIXとnative責務の競合を検出する | native memory等の二重authorityを黙認しない |
| TER-AC-004 | TER-R-05 | version不変のdefault変更もdriftになる | version比較だけで無影響判定しない |
| TER-AC-005 | TER-R-03/04 | eventと周期の双方でepisodeを起動する | changelog未取得を無変化扱いしない |
| TER-AC-006 | TER-R-06 | semantic diffからimpact graphとstale対象を導出する | 名称一致、単一logで確定しない |
| TER-AC-007 | TER-R-05/06 | unknown/high-riskをfail-closeまたはdeferする | silent fallbackしない |
| TER-AC-008 | TER-R-07 | shadow→canary→promotionが同一artifact/config digest | stage skip、途中差替えを拒否 |
| TER-AC-009 | TER-R-08 | adoption decisionに比較Evidenceがある | 最新版だけを理由に採用しない |
| TER-AC-010 | TER-R-09 | change classとworkflow routeが別field | 同一enumへ畳み込まない |
| TER-AC-011 | TER-R-09 | 構造原因をdefinition_reviewへ昇格する | local patchだけのcloseを拒否 |
| TER-AC-012 | TER-R-10 | requirement_changeがDiscoveryと再freezeへ戻る | L3直接手編集で意味変更しない |
| TER-AC-013 | TER-R-10 | stale下流成果をcompletionに使わない | 旧oracleのgreenで相殺しない |
| TER-AC-014 | TER-R-12 | effective configとruntime read-afterが一致する | file更新だけで完了しない |
| TER-AC-015 | TER-R-07/08 | rollback targetとrecovery手順が再現可能 | rollback不能なpromotionを拒否 |
| TER-AC-016 | TER-R-12 | secret/PII/個人pathがredactされる | raw値保存を拒否 |
| TER-AC-017 | TER-R-11 | provider version/schema driftがMaintenanceObligation化される | 期限切れattestationを黙認しない |
| TER-AC-018 | TER-R-12 | HELIX自身でprovider更新episodeをdogfoodする | self-host例外、手編集receiptを拒否 |

18件すべてを独立oracleとして保持し、単一happy-path testで複数failure classを相殺しない。
