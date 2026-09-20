---
title: "旧要求・旧asset直接semantic review wave 3状況"
status: candidate
authority_effect: none
source_revision: legacy-generation-2026-09-14
pr_class: research_premise
---

# 旧要求・旧asset直接semantic review wave 3状況

## 結果

218要求unitのうち新たに3 unit、候補edge 9件を直接照合した。結果は`confirmed` 3、`rejected` 2、
`unresolved` 4である。wave 1・2と合わせて8 unit、24 edgeをreview済みとし、全waveのedge集合は交差しない。

| # | unit | 製品 | 旧要求実装状態 | 現行要求実装状態 | 縮退評価 |
|---:|---|---|---|---|---|
| 1 | `IRUNIT-HIL-FR-33-HELIX-HARNESS` | HELIX-HARNESS | `unknown_pending_remaining_bounded_search_and_consumer_review` | `not_established` | `degraded_to_runtime_marker_and_sqlite_driver_checks` |
| 2 | `IRUNIT-HIL-NFR-02-HELIX-HARNESS` | HELIX-HARNESS | `unknown_pending_remaining_bounded_search_and_consumer_review` | `not_established` | `degraded_to_memory_write_nudge_without_role_separation` |
| 3 | `IRUNIT-HIL-NFR-03-HELIX-HARNESS` | HELIX-HARNESS | `unknown_pending_remaining_bounded_search_and_consumer_review` | `not_established` | `degraded_to_reverse_r0_candidate_query` |

`HIL-FR-33`はL5 designに全surface inventory、classifier、historical allowlist、JSONL artifact候補がある。
旧`runtime-portability.ts`はruntime markerとSQLite driverを検査するが、package、lockfile、CI、hook、template、
setup、distributionを含む全surface分類とclassified ledgerを成立させない。このためcoverage scopeの一部を
`unresolved`とし、実装完了にはしない。

`HIL-NFR-02`はL5 designにworker、knowledge promoter、independent reviewer、final verifierの全6組合せ分離がある。
旧`memory-promotion.ts`はcommit／plan switch後のmemory write忘れを警告するだけでrole分離を検査しないため、
隣接実装として`rejected`とした。

`HIL-NFR-03`はL5 designに全IssueのR0–R4 workload、免除禁止、phase skip禁止、budget checkpointがある。
旧`reverse-candidates.ts`は赤artifactとwarn findingからR0起票候補を返すquery-only機能であり、全Issue分母や
免除・skip・budget条件を検査しないため、隣接実装として`rejected`とした。

## atom被覆

| unit | atom総数 | 契約confirmed | 設計partial | 実装confirmed | 実装unresolved | 実装未被覆 | 設計・実装証拠なし |
|---|---:|---:|---:|---:|---:|---:|---:|
| `IRUNIT-HIL-FR-33-HELIX-HARNESS` | 3 | 3 | 3 | 0 | 1 | 2 | 0 |
| `IRUNIT-HIL-NFR-02-HELIX-HARNESS` | 1 | 1 | 1 | 0 | 0 | 1 | 0 |
| `IRUNIT-HIL-NFR-03-HELIX-HARNESS` | 4 | 4 | 4 | 0 | 0 | 4 | 0 |

## phaseと探索状態

3 unitともdirect phase candidateは空で、phase authorityは`unresolved_no_direct_phase_candidate`のままである。
bounded searchはcatalog 4,020件を全件照合し、FR-33は19件、NFR-02は22件、NFR-03は23件を候補にした。
各unitで3件だけを今回reviewし、残る16件、19件、20件は未reviewである。したがってlegacy implementationは
確定せず、consumer closureも`pending`、`new_build_allowed:false`である。

残る210 unitは未着手である。次waveは今回の未review集合からtest design、test source、L6 design、consumer
call chainを優先するか、通常phase pool側のCI／verification群を別batchで進める。いずれも製品unitのspan境界を
越えてatomを補わない。
