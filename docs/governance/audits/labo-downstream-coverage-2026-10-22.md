---
audit_record_id: AUDIT-LABO-DOWNSTREAM-COVERAGE-20261022-C4
authority_effect: none
source_revision: ba4ac1cdd76fdd0d907e684c035b059e8029b9da
audit_input_sha256: 6ae8be6b586679e5ea9a79b80e95679bf9473ea37a89bb2dc028133e79b0396a
scope: HELIX-LABO 10 parents / 26 pairs / 40 source documents
---

# LABO下流設計の存在・凍結記録照合（#3545 C4）

入力監査は固定BASE `ba4ac1cdd76fdd0d907e684c035b059e8029b9da` の `docs/governance/audits/prerequisite-l3-l10-definition-audit-2026-10-12.json`。監査JSONのSHA-256は `6ae8be6b586679e5ea9a79b80e95679bf9473ea37a89bb2dc028133e79b0396a`。対象はL3/L10 pair index 265–290（26組）、親10件、L4/L9/L5/L8各10文書。入力監査の `authority_effect` は `none`。この表は設計artifactと記録の所在照合で、設計の意味適合、凍結承認、実装許可や全405組の完了を生成しない。

## 判定基準と検索境界

HARNESS A2・B1・B2、C1 R2、merge済みC2（CONNECT）・C3（INFRA）の基準を継承する。①は対象層の明示freeze記録、②は当該pair層のfreeze未完・未凍結の明示、③は今回の限定検索で対象層のfreeze記録を確認できない、④は該当artifactなし、⑤は根拠付きscope外。③は不存在の断定ではない。L3/L10の上流承認、status、fixtureや有限caseの一部固定、branch coverage限界、工程説明だけを①/②へ移さない。

②は「その対象層のfreeze自体が未成立」と明示され、scopeが当該childへ及ぶ場合に限る。工程・前提素材・実TDD/CI/L11の未成立、L6/L7だけのfreeze、単なるremaining/unclosedは②の根拠にならない。L4/L9 basicとL5/L8 detailは別々に1 pair 1分類とし、両方のsource文書に同じ話があっても重複計上しない。

固定BASEの40 source JSONで、全階層のremaining/pending/unclosed系、unfixed/unobserved系と、freeze/frozen/凍結を含むkey・親path、未固定/未凍結等を含む文字列値を走査した。fixture/approved snapshot内の一部期待値、合成case、L4/L9の下流予定記述をpair全体のfreeze証拠に昇格しない。未確認とartifact不存在を区別する。

旧source・失敗の起点は固定入力監査JSON `/legacy_basis`。同記録が示す旧sourceは `archive/legacy-generation-2026-09-14/root/CLAUDE.md:49-63,82-85`、`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-requests.md:23-67`、`archive/legacy-generation-2026-09-14/root/docs/design/helix/L4-basic-design/design-template-json-authority.md:16-60`、`archive/legacy-generation-2026-09-14/root/docs/governance/predecessor-harness-full-weakness-audit-2026-07-20.md:65-101`。保持点は仕組み先行、意味と外部作用の分離、局所/接続/構成体の証拠分離。変更点は固定revisionの限定的な存在・記録照合。UTW-005/014/021/024/029のexact revision・欠落検出・自己申告完了拒否・trace差・consumer差異を照合するが、新gateは作らない。

## 親別件数

| parent | pairs | basic ②/③ | detail ②/③ | ② child ids |
|---|---:|---:|---:|---|
| HELIXLABO-L2-001 | 4 | 0 / 4 | 0 / 4 | — |
| HELIXLABO-L2-002 | 2 | 0 / 2 | 0 / 2 | — |
| HELIXLABO-L2-011 | 1 | 0 / 1 | 0 / 1 | — |
| HELIXLABO-L2-026 | 1 | 0 / 1 | 0 / 1 | — |
| HELIXLABO-L2-028 | 2 | 0 / 2 | 0 / 2 | — |
| HELIXLABO-L2-054 | 2 | 0 / 2 | 0 / 2 | — |
| HELIXLABO-L2-055 | 4 | 0 / 4 | 0 / 4 | — |
| HELIXLABO-L2-056 | 4 | 0 / 4 | 0 / 4 | — |
| HELIXLABO-L2-057 | 3 | 0 / 3 | 0 / 3 | — |
| HELIXLABO-L2-058 | 3 | 0 / 3 | 0 / 3 | — |

計26組: basic ②0 / ③26、detail ②0 / ③26。①④⑤は基本・詳細とも0件。L5-011はartifact自体はあるが子ごとのactual function/contract参照を確認できず、そのpairは「参照未確認」と記す。これは④ではない。

## Source alias

alias行は固定source JSONの実値位置を示す。`parent`、存在する場合の実 `document_id` または `document_ids/{layer}`、および実 `pair`（objectなら `pair_id`）を併記する。省略されたmetadata keyは推定しない。

| alias | layer | fixed source path | actual metadata pointers and values |
|---|---|---|---|
| S1 | L4 | `docs/helix-labo/L4-basic-design/authorized-observation-aggregation.json` | S1:2 `/parent` = `HELIXLABO-L2-001`; S1:164 `/document_id` = `HELIXLABO-L4-001`; S1:166 `/pair` = `L9` |
| S2 | L9 | `docs/helix-labo/L9-integration-verification/authorized-observation-aggregation.json` | S2:2 `/parent` = `HELIXLABO-L2-001`; S2:164 `/document_id` = `HELIXLABO-L9-001`; S2:166 `/pair` = `L4` |
| S3 | L5 | `docs/helix-labo/L5-detail-design/authorized-observation-aggregation.json` | S3:2 `/parent` = `HELIXLABO-L2-001`; S3:6 `/document_ids/L5` = `HELIXLABO-L5-001`; S3:3 `/pair` = `HELIXLABO-L5/L8-001` |
| S4 | L8 | `docs/helix-labo/L8-unit-verification/authorized-observation-aggregation.json` | S4:2 `/parent` = `HELIXLABO-L2-001`; S4:7 `/document_ids/L8` = `HELIXLABO-L8-001`; S4:3 `/pair` = `HELIXLABO-L5/L8-001` |
| S5 | L4 | `docs/helix-labo/L4-basic-design/episode-correlation-correction.json` | S5:2 `/parent` = `HELIXLABO-L2-002`; S5:106 `/document_id` = `HELIXLABO-L4-002`; S5:108 `/pair` = `L9` |
| S6 | L9 | `docs/helix-labo/L9-integration-verification/episode-correlation-correction.json` | S6:2 `/parent` = `HELIXLABO-L2-002`; S6:106 `/document_id` = `HELIXLABO-L9-002`; S6:108 `/pair` = `L4` |
| S7 | L5 | `docs/helix-labo/L5-detail-design/episode-correlation-correction.json` | S7:2 `/parent` = `HELIXLABO-L2-002`; S7:6 `/document_id` = `HELIXLABO-L5-002`; S7:3 `/pair` = `HELIXLABO-L8-002` |
| S8 | L8 | `docs/helix-labo/L8-unit-verification/episode-correlation-correction.json` | S8:2 `/parent` = `HELIXLABO-L2-002`; S8:6 `/document_id` = `HELIXLABO-L8-002`; S8:3 `/pair` = `HELIXLABO-L5-002` |
| S9 | L4 | `docs/helix-labo/L4-basic-design/aggregate-correlate-connection.json` | S9:2 `/parent` = `HELIXLABO-L2-011`; S9:106 `/document_id` = `HELIXLABO-L4-011`; S9:108 `/pair` = `L9` |
| S10 | L9 | `docs/helix-labo/L9-integration-verification/aggregate-correlate-connection.json` | S10:2 `/parent` = `HELIXLABO-L2-011`; S10:106 `/document_id` = `HELIXLABO-L9-011`; S10:108 `/pair` = `L4` |
| S11 | L5 | `docs/helix-labo/L5-detail-design/aggregate-correlate-connection.json` | S11:2 `/parent` = `HELIXLABO-L2-011`; S11:204 `/document_id` = `HELIXLABO-L5-011`; S11:206 `/pair` = `HELIXLABO-L8-011` |
| S12 | L8 | `docs/helix-labo/L8-unit-verification/aggregate-correlate-connection.json` | S12:2 `/parent` = `HELIXLABO-L2-011`; S12:204 `/document_id` = `HELIXLABO-L8-011`; S12:206 `/pair` = `HELIXLABO-L5-011` |
| S13 | L4 | `docs/helix-labo/L4-basic-design/infrastructure-observation-connection.json` | S13:2 `/parent` = `HELIXLABO-L2-026`; S13:111 `/document_id` = `HELIXLABO-L4-026`; S13:113 `/pair` = `L9` |
| S14 | L9 | `docs/helix-labo/L9-integration-verification/infrastructure-observation-connection.json` | S14:2 `/parent` = `HELIXLABO-L2-026`; S14:111 `/document_id` = `HELIXLABO-L9-026`; S14:113 `/pair` = `L4` |
| S15 | L5 | `docs/helix-labo/L5-detail-design/infrastructure-observation-connection.json` | S15:2 `/parent` = `HELIXLABO-L2-026`; `document_id`なし; S15:3 `/pair` = `HELIXLABO-L8-026` |
| S16 | L8 | `docs/helix-labo/L8-unit-verification/infrastructure-observation-connection.json` | S16:2 `/parent` = `HELIXLABO-L2-026`; `document_id`なし; S16:3 `/pair` = `HELIXLABO-L5-026` |
| S17 | L4 | `docs/helix-labo/L4-basic-design/worker-result-observation-connection.json` | S17:2 `/parent` = `HELIXLABO-L2-028`; S17:191 `/document_id` = `HELIXLABO-L4-028`; S17:193 `/pair` = `HELIXLABO-L9-028` |
| S18 | L9 | `docs/helix-labo/L9-integration-verification/worker-result-observation-connection.json` | S18:2 `/parent` = `HELIXLABO-L2-028`; S18:191 `/document_id` = `HELIXLABO-L9-028`; S18:193 `/pair` = `HELIXLABO-L4-028` |
| S19 | L5 | `docs/helix-labo/L5-detail-design/worker-result-observation-connection.json` | S19:2 `/parent` = `HELIXLABO-L2-028`; `document_id`なし; S19:270 `/pair` = `HELIXLABO-L8-028` |
| S20 | L8 | `docs/helix-labo/L8-unit-verification/worker-result-observation-connection.json` | S20:2 `/parent` = `HELIXLABO-L2-028`; `document_id`なし; S20:282 `/pair` = `HELIXLABO-L5-028` |
| S21 | L4 | `docs/helix-labo/L4-basic-design/bench-level-intelligence-handoff.json` | S21:2 `/parent` = `HELIXLABO-L2-054`; S21:474 `/document_id` = `HELIXLABO-L4-054`; S21:473 `/pair` = `HELIXLABO-L9-054` |
| S22 | L9 | `docs/helix-labo/L9-integration-verification/bench-level-intelligence-handoff.json` | S22:2 `/parent` = `HELIXLABO-L2-054`; S22:474 `/document_id` = `HELIXLABO-L9-054`; S22:473 `/pair` = `HELIXLABO-L4-054` |
| S23 | L5 | `docs/helix-labo/L5-detail-design/bench-level-intelligence-handoff.json` | S23:2 `/parent` = `HELIXLABO-L2-054`; `document_id`なし; S23:3 `/pair` = `HELIXLABO-L8-054` |
| S24 | L8 | `docs/helix-labo/L8-unit-verification/bench-level-intelligence-handoff.json` | S24:2 `/parent` = `HELIXLABO-L2-054`; `document_id`なし; S24:3 `/pair` = `HELIXLABO-L5-054` |
| S25 | L4 | `docs/helix-labo/L4-basic-design/worker-level-evidence.json` | S25:2 `/parent` = `HELIXLABO-L2-055`; S25:405 `/document_id` = `HELIXLABO-L4-055`; S25:3 `/pair` = `HELIXLABO-L9-055` |
| S26 | L9 | `docs/helix-labo/L9-integration-verification/worker-level-evidence.json` | S26:2 `/parent` = `HELIXLABO-L2-055`; S26:405 `/document_id` = `HELIXLABO-L9-055`; S26:3 `/pair` = `HELIXLABO-L4-055` |
| S27 | L5 | `docs/helix-labo/L5-detail-design/worker-level-evidence.json` | S27:2 `/parent` = `HELIXLABO-L2-055`; `document_id`なし; S27:3 `/pair` = `HELIXLABO-L8-055` |
| S28 | L8 | `docs/helix-labo/L8-unit-verification/worker-level-evidence.json` | S28:2 `/parent` = `HELIXLABO-L2-055`; `document_id`なし; S28:3 `/pair` = `HELIXLABO-L5-055` |
| S29 | L4 | `docs/helix-labo/L4-basic-design/worker-initial-result-observation.json` | S29:2 `/parent` = `HELIXLABO-L2-056`; S29:567 `/document_id` = `HELIXLABO-L4-056-WORKER-INITIAL-RESULT-OBSERVATION`; S29:569 `/pair` = `L4-basic-design ↔ L9-integration-verification` |
| S30 | L9 | `docs/helix-labo/L9-integration-verification/worker-initial-result-observation.json` | S30:2 `/parent` = `HELIXLABO-L2-056`; S30:567 `/document_id` = `HELIXLABO-L9-056-WORKER-INITIAL-RESULT-OBSERVATION`; S30:569 `/pair` = `L4-basic-design ↔ L9-integration-verification` |
| S31 | L5 | `docs/helix-labo/L5-detail-design/worker-initial-result-observation.json` | S31:2 `/parent` = `HELIXLABO-L2-056`; `document_id`なし; S31:3 `/pair` = `HELIXLABO-L8-056` |
| S32 | L8 | `docs/helix-labo/L8-unit-verification/worker-initial-result-observation.json` | S32:2 `/parent` = `HELIXLABO-L2-056`; `document_id`なし; S32:3 `/pair` = `HELIXLABO-L5-056` |
| S33 | L4 | `docs/helix-labo/L4-basic-design/os-to-bench-result-handoff.json` | S33:2 `/parent` = `HELIXLABO-L2-057`; S33:550 `/document_id` = `HELIXLABO-L4-057-basic`; S33:553 `/pair/pair_id` = `HELIXLABO-L4L9-057` |
| S34 | L9 | `docs/helix-labo/L9-integration-verification/os-to-bench-result-handoff.json` | S34:2 `/parent` = `HELIXLABO-L2-057`; S34:550 `/document_id` = `HELIXLABO-L9-057-integration-verification`; S34:553 `/pair/pair_id` = `HELIXLABO-L4L9-057` |
| S35 | L5 | `docs/helix-labo/L5-detail-design/os-to-bench-result-handoff.json` | S35:2 `/parent` = `HELIXLABO-L2-057`; `document_id`なし; S35:3 `/pair` = `HELIXLABO-L8-057` |
| S36 | L8 | `docs/helix-labo/L8-unit-verification/os-to-bench-result-handoff.json` | S36:2 `/parent` = `HELIXLABO-L2-057`; `document_id`なし; S36:3 `/pair` = `HELIXLABO-L5-057` |
| S37 | L4 | `docs/helix-labo/L4-basic-design/selected-source-dependency-closure.json` | S37:244 `/parent` = `HELIXLABO-L2-058`; S37:2 `/document_id` = `HELIXLABO-L4-058`; S37:4 `/pair` = `HELIXLABO-L9-058` |
| S38 | L9 | `docs/helix-labo/L9-integration-verification/selected-source-dependency-closure.json` | S38:1075 `/parent` = `HELIXLABO-L2-058`; S38:2 `/document_id` = `HELIXLABO-L9-058`; S38:4 `/pair` = `HELIXLABO-L4-058` |
| S39 | L5 | `docs/helix-labo/L5-detail-design/selected-source-dependency-closure.json` | S39:2 `/parent` = `HELIXLABO-L2-058`; `document_id`なし; S39:3 `/pair` = `HELIXLABO-L5/L8-058` |
| S40 | L8 | `docs/helix-labo/L8-unit-verification/selected-source-dependency-closure.json` | S40:2 `/parent` = `HELIXLABO-L2-058`; `document_id`なし; S40:3 `/pair` = `HELIXLABO-L5/L8-058` |

## Pair参照と分類候補

L4/L5は実 `contracts/{i}/requirement_ref`、L9は実 `verification_obligations/{i}/requirement_ref` と同一entryの `system_oracle_ref`、L8は実 `cases/{i}/requirement_ref` またはL8-054の `verification_obligations` を示す。繰返しshapeは数値最小indexを代表にし、`(+N)`を同一source・同じcontainer/key形状の同じL3値の追加出現数として示す（独立case数や意味網羅数ではない）。L9の矢印は同じobligation entryの実L10参照。L5-058は下記の明示trace mapを使う。L5-011の `scope/requirement_ref` はscope metadataであり、child actual refに読み替えない。

| idx | parent / L3 → L10 | L4 basic ref | L9 ref → L10 | L5 detail ref | L8 detail ref | basic | detail | audit input positions |
|---:|---|---|---|---|---|---|---|---|
| 265 | HELIXLABO-L2-001; `HELIXLABO-L3-001-B01` → `HELIXLABO-L10-001-B01` | S1:365 `/contracts/3/requirement_ref` | S2:54720 `/verification_obligations/3/requirement_ref` → S2:54721 `/verification_obligations/3/system_oracle_ref` | S3:446 `/contracts/3/requirement_ref` | S4:9147 `/cases/76/requirement_ref` (+6) | ③ | ③ | AUDIT:13298 `/pairs/265/requirement/entry/id`; 13311 `/pairs/265/oracle/entry/id` |
| 266 | HELIXLABO-L2-001; `HELIXLABO-L3-001-F01` → `HELIXLABO-L10-001-F01` | S1:184 `/contracts/0/requirement_ref` | S2:171 `/verification_obligations/0/requirement_ref` → S2:172 `/verification_obligations/0/system_oracle_ref` | S3:400 `/contracts/0/requirement_ref` | S4:559 `/cases/0/requirement_ref` (+30) | ③ | ③ | AUDIT:13338 `/pairs/266/requirement/entry/id`; 13351 `/pairs/266/oracle/entry/id` |
| 267 | HELIXLABO-L2-001; `HELIXLABO-L3-001-F02` → `HELIXLABO-L10-001-F02` | S1:202 `/contracts/1/requirement_ref` | S2:22530 `/verification_obligations/1/requirement_ref` → S2:22531 `/verification_obligations/1/system_oracle_ref` | S3:416 `/contracts/1/requirement_ref` | S4:4062 `/cases/31/requirement_ref` (+30) | ③ | ③ | AUDIT:13378 `/pairs/267/requirement/entry/id`; 13391 `/pairs/267/oracle/entry/id` |
| 268 | HELIXLABO-L2-001; `HELIXLABO-L3-001-N01` → `HELIXLABO-L10-001-N01` | S1:348 `/contracts/2/requirement_ref` | S2:44636 `/verification_obligations/2/requirement_ref` → S2:44637 `/verification_obligations/2/system_oracle_ref` | S3:431 `/contracts/2/requirement_ref` | S4:7565 `/cases/62/requirement_ref` (+13) | ③ | ③ | AUDIT:13418 `/pairs/268/requirement/entry/id`; 13431 `/pairs/268/oracle/entry/id` |
| 269 | HELIXLABO-L2-002; `HELIXLABO-L3-002-F01` → `HELIXLABO-L10-002-F01` | S5:126 `/contracts/0/requirement_ref` | S6:113 `/verification_obligations/0/requirement_ref` → S6:114 `/verification_obligations/0/system_oracle_ref` | S7:374 `/contracts/0/requirement_ref` | S8:438 `/cases/0/requirement_ref` (+26) | ③ | ③ | AUDIT:13458 `/pairs/269/requirement/entry/id`; 13471 `/pairs/269/oracle/entry/id` |
| 270 | HELIXLABO-L2-002; `HELIXLABO-L3-002-F02` → `HELIXLABO-L10-002-F02` | S5:143 `/contracts/1/requirement_ref` | S6:16512 `/verification_obligations/1/requirement_ref` → S6:16513 `/verification_obligations/1/system_oracle_ref` | S7:381 `/contracts/1/requirement_ref` | S8:30152 `/cases/27/requirement_ref` (+12) | ③ | ③ | AUDIT:13498 `/pairs/270/requirement/entry/id`; 13511 `/pairs/270/oracle/entry/id` |
| 271 | HELIXLABO-L2-011; `HELIXLABO-L3-011-F01` → `HELIXLABO-L10-011-F01` | S9:127 `/contracts/0/requirement_ref` | S10:113 `/verification_obligations/0/requirement_ref` → S10:114 `/verification_obligations/0/system_oracle_ref` | S11:6 `/scope/requirement_ref` scope-only; child actual link unconfirmed | S12:313 `/cases/0/requirement_ref` (+46) | ③ | ③ | AUDIT:13538 `/pairs/271/requirement/entry/id`; 13551 `/pairs/271/oracle/entry/id` |
| 272 | HELIXLABO-L2-026; `HELIXLABO-L3-026-F01` → `HELIXLABO-L10-026-F01` | S13:132 `/contracts/0/requirement_ref` | S14:118 `/verification_obligations/0/requirement_ref` → S14:119 `/verification_obligations/0/system_oracle_ref` | S15:183 `/contracts/0/requirement_ref` | S16:217 `/cases/0/requirement_ref` (+33) | ③ | ③ | AUDIT:13578 `/pairs/272/requirement/entry/id`; 13591 `/pairs/272/oracle/entry/id` |
| 273 | HELIXLABO-L2-028; `HELIXLABO-L3-028-F01` → `HELIXLABO-L10-028-F01` | S17:212 `/contracts/0/requirement_ref` | S18:198 `/verification_obligations/0/requirement_ref` → S18:199 `/verification_obligations/0/system_oracle_ref` | S19:275 `/contracts/0/requirement_ref` | S20:289 `/cases/0/requirement_ref` (+3) | ③ | ③ | AUDIT:13618 `/pairs/273/requirement/entry/id`; 13631 `/pairs/273/oracle/entry/id` |
| 274 | HELIXLABO-L2-028; `HELIXLABO-L3-028-F02` → `HELIXLABO-L10-028-F02` | S17:258 `/contracts/1/requirement_ref` | S18:376 `/verification_obligations/1/requirement_ref` → S18:377 `/verification_obligations/1/system_oracle_ref` | S19:315 `/contracts/1/requirement_ref` | S20:458 `/cases/4/requirement_ref` (+4) | ③ | ③ | AUDIT:13658 `/pairs/274/requirement/entry/id`; 13671 `/pairs/274/oracle/entry/id` |
| 275 | HELIXLABO-L2-054; `HELIXLABO-L3-054-B01` → `HELIXLABO-L10-054-B01` | S21:495 `/contracts/0/requirement_ref` | S22:480 `/verification_obligations/0/requirement_ref` → S22:481 `/verification_obligations/0/system_oracle_ref` | S23:337 `/contracts/0/requirement_ref` | S24:361 `/verification_obligations/0/requirement_ref` | ③ | ③ | AUDIT:13698 `/pairs/275/requirement/entry/id`; 13711 `/pairs/275/oracle/entry/id` |
| 276 | HELIXLABO-L2-054; `HELIXLABO-L3-054-F01` → `HELIXLABO-L10-054-F01` | S21:526 `/contracts/1/requirement_ref` | S22:605 `/verification_obligations/1/requirement_ref` → S22:606 `/verification_obligations/1/system_oracle_ref` | S23:377 `/contracts/1/requirement_ref` | S24:2827 `/verification_obligations/1/requirement_ref` | ③ | ③ | AUDIT:13738 `/pairs/276/requirement/entry/id`; 13751 `/pairs/276/oracle/entry/id` |
| 277 | HELIXLABO-L2-055; `HELIXLABO-L3-055-B01` → `HELIXLABO-L10-055-B01` | S25:426 `/contracts/0/requirement_ref` | S26:411 `/verification_obligations/0/requirement_ref` → S26:412 `/verification_obligations/0/system_oracle_ref` | S27:288 `/contracts/0/requirement_ref` | S28:471 `/cases/0/requirement_ref` (+3) | ③ | ③ | AUDIT:13778 `/pairs/277/requirement/entry/id`; 13791 `/pairs/277/oracle/entry/id` |
| 278 | HELIXLABO-L2-055; `HELIXLABO-L3-055-F01` → `HELIXLABO-L10-055-F01` | S25:454 `/contracts/1/requirement_ref` | S26:497 `/verification_obligations/1/requirement_ref` → S26:498 `/verification_obligations/1/system_oracle_ref` | S27:318 `/contracts/1/requirement_ref` | S28:12859 `/cases/4/requirement_ref` (+3) | ③ | ③ | AUDIT:13818 `/pairs/278/requirement/entry/id`; 13831 `/pairs/278/oracle/entry/id` |
| 279 | HELIXLABO-L2-055; `HELIXLABO-L3-055-F02` → `HELIXLABO-L10-055-F02` | S25:482 `/contracts/2/requirement_ref` | S26:596 `/verification_obligations/2/requirement_ref` → S26:597 `/verification_obligations/2/system_oracle_ref` | S27:345 `/contracts/2/requirement_ref` | S28:52294 `/cases/8/requirement_ref` (+4) | ③ | ③ | AUDIT:13858 `/pairs/279/requirement/entry/id`; 13871 `/pairs/279/oracle/entry/id` |
| 280 | HELIXLABO-L2-055; `HELIXLABO-L3-055-F03` → `HELIXLABO-L10-055-F03` | S25:510 `/contracts/3/requirement_ref` | S26:704 `/verification_obligations/3/requirement_ref` → S26:705 `/verification_obligations/3/system_oracle_ref` | S27:372 `/contracts/3/requirement_ref` | S28:111220 `/cases/13/requirement_ref` (+3) | ③ | ③ | AUDIT:13898 `/pairs/280/requirement/entry/id`; 13911 `/pairs/280/oracle/entry/id` |
| 281 | HELIXLABO-L2-056; `HELIXLABO-L3-056-F01` → `HELIXLABO-L10-056-F01` | S29:584 `/contracts/0/requirement_ref` | S30:574 `/verification_obligations/0/requirement_ref` → S30:575 `/verification_obligations/0/system_oracle_ref` | S31:1039 `/contracts/0/requirement_ref` | S32:539 `/cases/0/requirement_ref` (+3) | ③ | ③ | AUDIT:13938 `/pairs/281/requirement/entry/id`; 13951 `/pairs/281/oracle/entry/id` |
| 282 | HELIXLABO-L2-056; `HELIXLABO-L3-056-F02` → `HELIXLABO-L10-056-F02` | S29:617 `/contracts/1/requirement_ref` | S30:847 `/verification_obligations/1/requirement_ref` → S30:848 `/verification_obligations/1/system_oracle_ref` | S31:1089 `/contracts/1/requirement_ref` | S32:10208 `/cases/4/requirement_ref` (+3) | ③ | ③ | AUDIT:13978 `/pairs/282/requirement/entry/id`; 13991 `/pairs/282/oracle/entry/id` |
| 283 | HELIXLABO-L2-056; `HELIXLABO-L3-056-F03` → `HELIXLABO-L10-056-F03` | S29:650 `/contracts/2/requirement_ref` | S30:1041 `/verification_obligations/2/requirement_ref` → S30:1042 `/verification_obligations/2/system_oracle_ref` | S31:1138 `/contracts/2/requirement_ref` | S32:16233 `/cases/8/requirement_ref` (+2) | ③ | ③ | AUDIT:14018 `/pairs/283/requirement/entry/id`; 14031 `/pairs/283/oracle/entry/id` |
| 284 | HELIXLABO-L2-056; `HELIXLABO-L3-056-F04` → `HELIXLABO-L10-056-F04` | S29:678 `/contracts/3/requirement_ref` | S30:1281 `/verification_obligations/3/requirement_ref` → S30:1282 `/verification_obligations/3/system_oracle_ref` | S31:1188 `/contracts/3/requirement_ref` | S32:28989 `/cases/11/requirement_ref` (+4) | ③ | ③ | AUDIT:14058 `/pairs/284/requirement/entry/id`; 14071 `/pairs/284/oracle/entry/id` |
| 285 | HELIXLABO-L2-057; `HELIXLABO-L3-057-B01` → `HELIXLABO-L10-057-B01` | S33:588 `/contracts/0/requirement_ref` | S34:574 `/verification_obligations/0/requirement_ref` → S34:575 `/verification_obligations/0/system_oracle_ref` | S35:963 `/contracts/0/requirement_ref` | S36:598 `/cases/0/requirement_ref` (+4) | ③ | ③ | AUDIT:14098 `/pairs/285/requirement/entry/id`; 14111 `/pairs/285/oracle/entry/id` |
| 286 | HELIXLABO-L2-057; `HELIXLABO-L3-057-F01` → `HELIXLABO-L10-057-F01` | S33:632 `/contracts/1/requirement_ref` | S34:692 `/verification_obligations/1/requirement_ref` → S34:693 `/verification_obligations/1/system_oracle_ref` | S35:1015 `/contracts/1/requirement_ref` | S36:6347 `/cases/2/requirement_ref` (+11) | ③ | ③ | AUDIT:14138 `/pairs/286/requirement/entry/id`; 14151 `/pairs/286/oracle/entry/id` |
| 287 | HELIXLABO-L2-057; `HELIXLABO-L3-057-F02` → `HELIXLABO-L10-057-F02` | S33:676 `/contracts/2/requirement_ref` | S34:992 `/verification_obligations/2/requirement_ref` → S34:993 `/verification_obligations/2/system_oracle_ref` | S35:1067 `/contracts/2/requirement_ref` | S36:30814 `/cases/10/requirement_ref` (+9) | ③ | ③ | AUDIT:14178 `/pairs/287/requirement/entry/id`; 14191 `/pairs/287/oracle/entry/id` |
| 288 | HELIXLABO-L2-058; `HELIXLABO-L3-058-B01` → `HELIXLABO-L10-058-B01` | S37:25 `/contracts/0/requirement_ref` | S38:9 `/verification_obligations/0/requirement_ref` → S38:10 `/verification_obligations/0/system_oracle_ref` | S39:1099 `/trace_matrix/0/requirement_ref` | S40:408 `/cases/0/requirement_ref` (+4) | ③ | ③ | AUDIT:14218 `/pairs/288/requirement/entry/id`; 14231 `/pairs/288/oracle/entry/id` |
| 289 | HELIXLABO-L2-058; `HELIXLABO-L3-058-F01` → `HELIXLABO-L10-058-F01` | S37:75 `/contracts/1/requirement_ref` | S38:300 `/verification_obligations/1/requirement_ref` → S38:301 `/verification_obligations/1/system_oracle_ref` | S39:1120 `/trace_matrix/1/requirement_ref` | S40:10273 `/cases/5/requirement_ref` (+4) | ③ | ③ | AUDIT:14258 `/pairs/289/requirement/entry/id`; 14271 `/pairs/289/oracle/entry/id` |
| 290 | HELIXLABO-L2-058; `HELIXLABO-L3-058-F02` → `HELIXLABO-L10-058-F02` | S37:186 `/contracts/2/requirement_ref` | S38:594 `/verification_obligations/2/requirement_ref` → S38:595 `/verification_obligations/2/system_oracle_ref` | S39:1141 `/trace_matrix/2/requirement_ref` | S40:25461 `/cases/10/requirement_ref` (+7) | ③ | ③ | AUDIT:14298 `/pairs/290/requirement/entry/id`; 14311 `/pairs/290/oracle/entry/id` |

## freeze候補と限定・部分記録

全40文書のkey/value候補を調べたが、当該basic/detail pair層でfreeze自体の未成立を明示する根拠は確認できなかったため、今回の全26組は③。L4/L9のremainingにある「L5/L8／詳細oracle freeze未完」は下流detail側の工程・未完記述で、basicへ移さない。L5/L8での一般的なremaining、source qualification、schema/codec、実TDD/CI/L11、全92/430範囲の未成立も、それだけではpair oracle freeze状態を表さない。

走査結果として、対象LABOのL5/L8に当該pairの凍結自体の未成立・未完を述べる文は0件。L5の10文書には凍結を表す語の出現もなく、L8の関連記録はfixtureや有限期待・履歴の範囲である。C1/C2の凍結自体未成立型にも、C3の工程素材型にも該当しない。

- **有限fixtureのoracle記録（親056）**: S32:35695 `/oracle_freeze` は `ORACLE-056-A` / `oracle-r3` の局所比較例。S32:35698 `/oracle_freeze/fixture_reason` は固定L9 sourceの照合例であり、正式oracle承認・source資格・実適用評価を成立させないと明記する。対象L3子を直接示すpointerがなく、F01–F04へ配賦しない。pair全体の①/②根拠ではない。
- **L4/L9下流記述の例（親001/002）**: S1:161 `/remaining/1`、S2:161 `/remaining/1`、S5:103 `/remaining/1`、S6:103 `/remaining/1` は対L5/L8やoracle freezeを未完とするが、L4/L9 basicの状態を述べない。
- **同型の下流記述（他の親）**: 011 S9:103 `/remaining/1`・S10:103 `/remaining/1`、026 S13:108 `/remaining/1`・S14:108 `/remaining/1`、028 S17:172 `/remaining/1`・S18:172 `/remaining/1`、058 S37:398 `/remaining/1`・S38:1229 `/remaining/1` にも対L5/L8・詳細oracle凍結の下流残件がある。055 S25:543 `/unclosed/4`・S26:820 `/unclosed/4` も「L5/L8詳細設計とfixture/oracle凍結」を記す。いずれも基本対自身やL5/L8自身のfreeze状態へ転用しない。
- **011 L9のexpected source**: S10:12466 `/scope_content_correction/expected_source` は「本document新caseのliteral expected_materialとL4原句。ignored local freezeに再構成を依存しない。」という新case期待の出典説明であり、pair全体のfreeze receipt/未成立ではない。
- **有限の期待履歴（親055）**: S28:345528 `/typed_return_derivation_history/expectation_corrections/13/prior_frozen_expected_sha256` とS28:345699 `/typed_return_derivation_history/expectation_corrections/14/verification_boundary` は有限fixture/probe照合の来歴。独立したpair-wide oracle freeze receiptとは扱わない。
- **artifact/子link未確認（親011）**: L5文書の `logical_contract/functions` は4関数（S11:511 `/logical_contract/functions`）で、FN-LABO011-01..04の関数定義はあるがL3 childへの結合はない。S11:6 `/scope/requirement_ref` のF01はscope記述でありchild edgeではない。L8側はF01 case refsを持つ。

### 親058の明示的L5 child trace

| L3 child | L5 trace row | L5 function refs | 同row L8 case refs |
|---|---|---|---|
| B01 | S39:1099 `/trace_matrix/0/requirement_ref`; L10 S39:1100 `/trace_matrix/0/oracle_ref` | S39:1102 `/trace_matrix/0/l5_function_refs` = F-058-01..06。定義はS39:621 `/function_signatures_and_decisions/0/id`、S39:724 `/function_signatures_and_decisions/1/id`、S39:763 `/function_signatures_and_decisions/2/id`、S39:827 `/function_signatures_and_decisions/3/id`、S39:900 `/function_signatures_and_decisions/4/id`、S39:992 `/function_signatures_and_decisions/5/id` | S39:1110 `/trace_matrix/0/l8_case_refs` = 5 case IDs |
| F01 | S39:1120 `/trace_matrix/1/requirement_ref`; L10 S39:1121 `/trace_matrix/1/oracle_ref` | S39:1123 `/trace_matrix/1/l5_function_refs` = F-058-01..06（同じ6定義） | S39:1131 `/trace_matrix/1/l8_case_refs` = 5 case IDs |
| F02 | S39:1141 `/trace_matrix/2/requirement_ref`; L10 S39:1142 `/trace_matrix/2/oracle_ref` | S39:1144 `/trace_matrix/2/l5_function_refs` = F-058-01..06（同じ6定義） | S39:1152 `/trace_matrix/2/l8_case_refs` = 8 case IDs |

## 未確認範囲

この照合は固定BASEの指定40 JSONと、実contracts/functions/verification_obligations/casesのchild reference、scope/metadata、freeze-related fields/textを対象にした。指定外のrepository/history/revisionsにfreeze receiptが存在しないとは主張しない。artifact presence、child reference, freeze record, semantic adequacyは別の事実である。C1/C2/C3および残るINTELLIGENCE scopeはこのC4記録で完了扱いしない。
