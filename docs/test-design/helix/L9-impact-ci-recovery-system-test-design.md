---
title: "Impact CI Recovery L9 system test設計"
layer: L9
artifact_type: test_design
status: draft
created: 2026-08-01
updated: 2026-08-01
owner: QA
plan: docs/plans/PLAN-L4-58-impact-ci-recovery.md
pair_artifact: docs/design/helix/L4-basic-design/impact-ci-recovery.md
related_l3: docs/test-design/helix/github-ci-performance-system-test-design.md
queue_id: L3Q-PC-038
---

# Impact CI Recovery L9 system test設計

| oracle | scenario | 合格条件 |
|---|---|---|
| ST-IMPACTCI-001 | known-low変更をdraft preflightへ投入 | scope/PLAN/authority/typecheck/impact-selectedを選び、selected/deferredがinventoryをexact partitionする |
| ST-IMPACTCI-002 | selector、security、permission、schema、migration、DB checkpoint、authority rootの各変更を投入 | `fullAdmissionRequired=true`となりtargetedだけでcandidate terminalへ進まない |
| ST-IMPACTCI-003 | relation graphがunknown、base HEAD不明、current PR body取得失敗 | fail-closeしてfull admissionまたは明示block。推測selected集合を返さない |
| ST-IMPACTCI-004 | PRでdeferred itemを残してmerge | post-merge fullがexact deferred集合を実行し、各itemを最初のterminal receiptへexactly once接続する |
| ST-IMPACTCI-005 | post-merge回収欠落、nightly補完欠落、同item二重terminalを個別投入 | 欠落・重複をredにし、nightly成功で過去failureを消さない |
| ST-IMPACTCI-006 | stale event payloadのPR bodyとGitHub API current bodyを不一致にする | current bodyを採用し、旧execution plan/receiptをstale化する |
| ST-IMPACTCI-007 | correctness greenでp95 budgetだけ超過 | merge correctnessはgreen、完全なPerformance Recovery packetを同episodeで生成する |
| ST-IMPACTCI-008 | test除外、閾値緩和、timeout延長、`continue-on-error`で見かけ上短縮 | inventory非縮退digest不一致またはpolicy violationで改善を拒否する |
| ST-IMPACTCI-009 |別HEAD、別inventory digest、cold/warm混在母集団を集計 | receipt不一致を拒否し、profile/environment/cache class別p50/p95だけを採用する |

L9はplanning、workflow dispatch、receipt reconciliationまでを対象とする。個々のtest runner内部実装とDB物理schemaは
L5/L8、workflow変更はL6/L7へ降下し、本pairの完了証拠に数えない。
