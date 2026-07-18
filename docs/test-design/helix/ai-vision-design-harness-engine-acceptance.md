---
title: "AI Vision Design HARNESSエンジン受入テスト設計"
layer: L3
executed_at_layer: L12
artifact_type: test_design
status: confirmed
created: 2026-07-19
updated: 2026-07-19
owner: QA
pair_artifact: docs/design/helix/L3-requirements/ai-vision-design-harness-engine.md
---

# AI Vision Design HARNESSエンジン受入テスト設計

| AC | 合格条件 |
|---|---|
| VDH-AC-001 | canonical digest、211 files、添付中間物digest、主要10契約のcontent一致、harness memory裁定のいずれかが不一致ならsource bindingを拒否する |
| VDH-AC-002 | visionから三契約を復元でき、欠落・別revisionを拒否する |
| VDH-AC-003 | 全semantic IDが一意で、class/file pathだけのtraceを拒否する |
| VDH-AC-004 | UI対象のagreement/ledger必須field欠落、L2実装binding混入、非UIの暗黙skipを拒否する |
| VDH-AC-005 | Pattern required/forbidden、profile、surface分類、responsive、motion budget、reduced-motion、a11y、product固有値隔離の各違反を検出する |
| VDH-AC-006 | 全action/stateがdata/state/event/permission/log/errorへ閉じ、orphanを拒否する |
| VDH-AC-007 | workflowの正常、loop、取消、失敗、期限切れをvisual UXへ追跡できる |
| VDH-AC-008 | requirementからevidenceまでforward/reverse traceが閉じ、orphan 0である |
| VDH-AC-009 | 既存gateへのsub-check配置を検証し、L13/L14やDesign専用layerを拒否する |
| VDH-AC-010 | UI-M0..M7相当のmission/oracleまたは独立receiptが一つでも欠ければimplementedを拒否し、code greenでもUX evidenceが無ければ`implemented=true, ux_verified=false`となる |
| VDH-AC-011 | real-data/device/state/a11y/motion/performance evidenceのmissing/stale/failでUX完成を拒否する |
| VDH-AC-012 | delta status／期限／影響先／exactly-one drive routeの未更新と要求にない画面・操作・機能をblockする |
| VDH-AC-013 | AI自己承認fixtureを全て拒否し、人間authority receiptを要求する |
| VDH-AC-014 | Full V部分workstreamとScrumのSR backfill欠落をrelease-readyにしない |
| VDH-AC-015 | L1〜L12と6 pairへexactly-one配置され、旧L0〜L14出力を拒否する |
| VDH-AC-016 | typed sidecar以外の並行文書体系、独立engine、別authoring DB、DBからauthoring sourceへの逆書きを拒否する |
| VDH-AC-017 | Python主要9責務の未割当、Python direct DB/Git commit、Nodeへの意味判定複製、Node未再検証commitを拒否し、browser tool receiptをdigestで検証する |
| VDH-AC-018 | capsule digest欠落、producer自己検証、別HEAD evidenceを拒否する |
| VDH-AC-019 | Discovery PoCがS4判断前にproduction completionを主張するfixtureを拒否する |

## 実行層

- L8: component、state、schema、local responsive/a11yの局所検証。
- L9: service/data/auth/navigation/event境界。
- L10: end-to-end、VRT、responsive、motion、a11y、performanceの総合検証。
- L11: real-user acceptanceとprototype continuity。
- L12: telemetry、SLO、feedback、drift、改善効果。
