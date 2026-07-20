---
canonical_vmodel: L1-L12
canonical_layer: L10
canonical_pair: L3
legacy_physical_layer: L10
title: "前身UT-TDD全仕組みhardening受入テスト設計"
layer: L10
artifact_type: test_design
status: draft
created: 2026-07-20
updated: 2026-07-20
owner: QA
pair_artifact: docs/design/helix/L3-requirements/predecessor-harness-mechanism-hardening-requirements.md
---

# 前身UT-TDD全仕組みhardening受入テスト設計

## 1. 固定authority oracle

| AC | 検証 |
|---|---|
| UTH-AC-001 | canonical layerがL1〜L12 exactly once、pairが6組exact matchである |
| UTH-AC-002 | Full V / Production Scrum / Discovery・PoC routeとScrumの縮約V、TDD、Reverse、release、operation evidenceにdeltaがない |
| UTH-AC-003 | current/target/fallback/rollback/test authorityにBunが0件である |
| UTH-AC-004 | Python semantic coreとNode transactional boundaryの権限分離negative fixtureがDB/Git/GitHub writeを拒否する |

## 2. source・trace・state oracle

| AC | 対応要件 | 検証 |
|---|---|---|
| UTH-AC-005 | UTH-FR-001,014,023 | heads/tags/pull refsをfixture中のadvertised分母とexact照合し、ref drift、missing object、unclassified atomでfailする |
| UTH-AC-006 | UTH-FR-005,007 | canonical/compatibility/archive/runtime stateを混在させたfixtureを拒否する |
| UTH-AC-007 | UTH-FR-006,019 | event append後のprojection crashをreplayし、prose/CURRENTなしで同じnext actionへ復元する |
| UTH-AC-008 | UTH-FR-021 | DB rebuild fault injectionで全write rollback、再実行で同一digest/row countになる |
| UTH-AC-009 | UTH-FR-022,023 | HEAD/scope/command/artifact digest欠落、orphan edge、aggregate-only coverageを拒否する |

## 3. runtime・test・guard oracle

| AC | 対応要件 | 検証 |
|---|---|---|
| UTH-AC-010 | UTH-FR-008,009 | 全runtime surface matrixでedit/shell/spawn/destructive操作を試し、hook非適用面はpreflight欠落で拒否する |
| UTH-AC-011 | UTH-FR-010 | canonical/targeted/CI/doctor testが同一runner contractとHEAD snapshotを報告する |
| UTH-AC-012 | UTH-FR-011,026 | check DAG/profile/timingを取得し、budget超過checkだけを再現できる |
| UTH-AC-013 | UTH-FR-012 | Linux full、Windows/macOS compatibilityの必須matrixを走らせ、narrow legでLinux full失敗を相殺しない |
| UTH-AC-014 | UTH-NFR-001..005 | clean checkout再現性、latency budget、bounded context、module追加、structured warning channelを測定する |

## 4. GitHub・security・distribution oracle

| AC | 対応要件 | 検証 |
|---|---|---|
| UTH-AC-015 | UTH-FR-013,015,017 | stale branch、PR head更新、base更新、ruleset drift、bypass driftをlive-style fixtureでfail-closeする |
| UTH-AC-016 | UTH-FR-016,018 | webhook duplicate/crash/retryを与え、Issue→PLAN→PR→merge closureがexactly onceになる |
| UTH-AC-017 | UTH-FR-020 | push rangeの過去commitだけにsecret/PIIを置き、hookがwarnでもCIが拒否する |
| UTH-AC-018 | UTH-FR-024 |未登録・改ざん・過剰権限・network open・credential persistence profileを起動前に拒否する |
| UTH-AC-019 | UTH-FR-027 | source/consumer/distribution manifest差、SBOM/license欠落、unsigned release、Bun rollbackを拒否する |
| UTH-AC-020 | UTH-FR-028,029 | stale external receipt、snapshot/params/expiry driftでterminal判断とapprovalを無効化する |

## 5. 改善oracle

| AC | 対応要件 | 検証 |
|---|---|---|
| UTH-AC-021 | UTH-FR-025 | evidenceなしstatus昇格、prose-only implemented、verified後の再発未記録を拒否する |
| UTH-AC-022 | UTH-FR-030 | 同一fixtureのbefore/after metric、repair receipt、recipe、recurrence windowが揃うまでcloseしない |
| UTH-AC-023 | UTH-FR-031 | freeze後のartifact/trace変更で旧checkpointをstaleにし、影響pairのreverification完了までreopenを閉じない |
| UTH-AC-024 | UTH-FR-032 | PLAN revisionの各fault pointを注入し、preimage不一致・partial publish・tampered replayを拒否して旧状態へ復元する |
| UTH-AC-025 | UTH-FR-033 | agent definition/allowlist/model/verification axisのdigest driftでspawnを拒否し、検証team候補を返す |
| UTH-AC-026 | UTH-FR-034 | Stop hookのspawn error、timeout、worker crashを再現し、hook budget超過なしで次回reconcileされる |
| UTH-AC-027 | UTH-FR-035 | Forward escapeの必須Issue field、Reverse/fullback、reentry receiptのいずれかを欠くfixtureを拒否する |

## 6. 終端判定

### 6.1 要件pair完全性

| 要件 | AC |
|---|---|
| UTH-FR-001 | UTH-AC-005 |
| UTH-FR-002 | UTH-AC-001, UTH-AC-002 |
| UTH-FR-003 | UTH-AC-003, UTH-AC-019 |
| UTH-FR-004 | UTH-AC-004 |
| UTH-FR-005 | UTH-AC-006 |
| UTH-FR-006 | UTH-AC-007 |
| UTH-FR-007 | UTH-AC-006 |
| UTH-FR-008 | UTH-AC-010 |
| UTH-FR-009 | UTH-AC-010 |
| UTH-FR-010 | UTH-AC-011 |
| UTH-FR-011 | UTH-AC-012 |
| UTH-FR-012 | UTH-AC-013 |
| UTH-FR-013 | UTH-AC-015 |
| UTH-FR-014 | UTH-AC-005 |
| UTH-FR-015 | UTH-AC-015 |
| UTH-FR-016 | UTH-AC-016 |
| UTH-FR-017 | UTH-AC-015 |
| UTH-FR-018 | UTH-AC-016 |
| UTH-FR-019 | UTH-AC-007 |
| UTH-FR-020 | UTH-AC-017 |
| UTH-FR-021 | UTH-AC-008 |
| UTH-FR-022 | UTH-AC-009 |
| UTH-FR-023 | UTH-AC-005, UTH-AC-009 |
| UTH-FR-024 | UTH-AC-018 |
| UTH-FR-025 | UTH-AC-021 |
| UTH-FR-026 | UTH-AC-012 |
| UTH-FR-027 | UTH-AC-019 |
| UTH-FR-028 | UTH-AC-020 |
| UTH-FR-029 | UTH-AC-020 |
| UTH-FR-030 | UTH-AC-022 |
| UTH-FR-031 | UTH-AC-023 |
| UTH-FR-032 | UTH-AC-024 |
| UTH-FR-033 | UTH-AC-025 |
| UTH-FR-034 | UTH-AC-026 |
| UTH-FR-035 | UTH-AC-027 |
| UTH-NFR-001..005 | UTH-AC-014 |

本受入設計のdraft作成はruntime hardening完了を意味しない。L3 freezeには`UTH-AC-001..027`のoracle実装計画、
trace completeness、PO承認が必要である。L10実行では全oracleのgreen commandとHEAD-bound evidenceを要求する。
