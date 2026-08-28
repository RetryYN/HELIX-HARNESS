---
title: "HELIX L10 受入テスト設計 — 製品ライフサイクル運用"
canonical_layer_scheme: L1-L12
layer: L10
paired_requirement_layer: L3
artifact_type: test_design
status: confirmed
created: 2026-08-29
updated: 2026-08-29
owner: QA / Codex TL
plan: PLAN-L3-71-product-lifecycle-operations
pair_artifact: docs/design/helix/L3-requirements/product-lifecycle-operations-requirements.md
---

# HELIX L10 受入テスト設計 — 製品ライフサイクル運用

## §0 合否境界

schemaの存在、command success、deployment API successだけでは合格にしない。Release／Deployment state分離、physical target、artifact、
actor、approval、receipt、health observation、diagnosis trace、rollback、Module ownership、HELIX dogfoodを実測する。

## §1 oracle完全集合

| AC ID | 対応要件 | 合格条件 | negative mutation |
|---|---|---|---|
| `OPS-AC-001` | `OPS-FR-001`, `OPS-R-01` | environment identity、provider adapter、resource、permission、credential referenceがexact | ambiguous／logical-only target、secret値保存を拒否 |
| `OPS-AC-002` | `OPS-FR-001`, `OPS-R-02` | Manifest／Plan／Receiptが別schemaとstateを持つ | Release＝Deployment、plan＝receiptを拒否 |
| `OPS-AC-003` | `OPS-FR-001`, `OPS-R-03` | rollback plan／receipt、backup、consumer bytes保全が成立 | irreversible／unbound rollback、health未確認を拒否 |
| `OPS-AC-004` | `OPS-FR-002`, `OPS-R-04` | 同一入力から同一Deployment Planを生成 | provider command埋込み、unknown capability、digest欠落を拒否 |
| `OPS-AC-005` | `OPS-FR-002`, `OPS-R-05` | 同一artifactがstaging→canary→productionへ昇格 | stage skip、OS別rebuild、artifact差替えを拒否 |
| `OPS-AC-006` | `OPS-FR-002`, `OPS-R-05` | destructive／credential operationがapprovalとtargetへ束縛 | PAT／host fallback、wrong target、expired approvalを拒否 |
| `OPS-AC-007` | `OPS-FR-003`, `OPS-R-06` | SLO／resource／connection／credential／cost observationをpolicyへ照合 | policy version、window、source quality欠落を拒否 |
| `OPS-AC-008` | `OPS-FR-003`, `OPS-R-07` | IncidentがRelease／Deployment／Requirement／diffへ相関 | stale／duplicate／out-of-orderをroot causeへ誤昇格しない |
| `OPS-AC-009` | `OPS-FR-003`, `OPS-R-07` | bounded Runbook内だけ自動復旧 | Runbook外、権限外、rollback不能の自動操作を拒否 |
| `OPS-AC-010` | `OPS-FR-004`, `OPS-R-08` | obligationの期限、周期、owner、Evidence、overdue effectを再現 | duplicate schedule、timezone／clock drift、missed cycleを検出 |
| `OPS-AC-011` | `OPS-FR-004`, `OPS-R-09` | 構造原因をdefinition、価値変更をrequirementへ根拠付き昇格 | local patchによる構造findingの隠蔽を拒否 |
| `OPS-AC-012` | `OPS-FR-005`, `OPS-R-10` | symptomから全authority／artifact層へtraceできる | file文字列一致、最新commitだけの確定を拒否 |
| `OPS-AC-013` | `OPS-FR-005`, `OPS-R-10` | candidate順位、根拠、反証、confidence、blast radiusを出力 | ambiguityを単一修正先へ推測確定しない |
| `OPS-AC-014` | `OPS-FR-005`, `OPS-R-11` | health window、SLO、regression、review、read-after後にcompletion | command／API successだけのcloseを拒否 |
| `OPS-AC-015` | `OPS-FR-006`, `OPS-R-12` | 4 Moduleのprimary ownershipとdependency closureがexact | owner重複、orphan、route／providerとのidentity混同を拒否 |
| `OPS-AC-016` | `OPS-FR-006`, `OPS-R-12` | lifecycle-ops Bundleがexact lockとrollback profileを持つ | preview moduleのstable暗黙包含を拒否 |
| `OPS-AC-017` | `OPS-FR-006`, `OPS-R-12` | HELIX dogfoodがfull lifecycleを同一traceで完走 | self-host例外、手編集receipt、観測省略を拒否 |
| `OPS-AC-018` | `OPS-FR-006` | raw telemetryはartifact、state／decisionはDB projection | log／notification／DevOSを意味正本にしない |
| `OPS-AC-019` | `OPS-FR-004`, `OPS-R-09` | system change classとcapability expansion kindを別fieldで同時保持 | Skill／Template／Workflowを`requirement_change`または`ADD_FEATURE`へ畳み込む出力を拒否 |
| `OPS-AC-020` | `OPS-FR-005`, `OPS-R-13` | diagnosisからchange class、既存route、最小return layer、stale targetを一意に導出 | troubleshooting新route、固定return layer、曖昧route／非連続layerを拒否 |
| `OPS-AC-021` | `OPS-FR-005`, `OPS-R-13` | Requirement変更はL1/L2再整理、human decision、L3 recompile／re-freeze後だけForward再入 | rollback成功、旧freeze receipt、stale残存、Scrum ReverseだけによるFull V終端を拒否 |

## §2 量閉じ

- feature contract: `OPS-FR-001..006` exact 6件。
- supporting requirement: `OPS-R-01..13` exact 13件。
- acceptance: `OPS-AC-001..021` exact 21件。
- Issue分解: 親 #1160、責務slice #1161〜#1167。
