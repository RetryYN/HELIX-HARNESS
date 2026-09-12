---
title: "HELIX L8 結合テスト設計 — Python runtime toolchain freeze"
layer: L8
artifact_type: test_design
status: draft
created: 2026-09-12
updated: 2026-09-12
owner: QA / TL
plan: PLAN-L5-104-python-runtime-toolchain-freeze
parent_design: docs/design/helix/L5-detail/python-runtime-toolchain-freeze.md
pair_artifact: docs/design/helix/L5-detail/python-runtime-toolchain-freeze.md
behavior_contract_id: PYTHON-RUNTIME-TOOLCHAIN-FREEZE-001
---

# Python runtime toolchain freeze 結合テスト設計

## 責務境界

本書はPython worker runtime全体の既存L5↔L8 pairを再利用せず、CPython 3.14.7 toolchain authorityの
凍結だけを検証する。worker process、semantic canary、DB transaction、distribution publishは後続PLANの責務とする。

## 実装oracle

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-PYRT-001 | exact identityとexperimental modeの混同 | version／implementation解決後にfree-threaded／JIT driftを独立拒否する | `tests/python-runtime-toolchain-freeze.test.ts` |

## 結合oracle

| ID | 反証対象 | 合格条件 |
|---|---|---|
| IT-PYRT-001 | exact patch／implementation／build mode drift | CPython 3.14.7通常build、free-threaded無効、JIT無効のidentityが一致する |
| IT-PYRT-002 | source／binary artifact混同 | OS／arch別artifact URL、SHA-256、artifact kindがexact joinする |
| IT-PYRT-003 | signature／provenance欠落 | Sigstore identityとOIDC issuerをoffline検証できる |
| IT-PYRT-004 | lock producer drift／lock手編集 | attestation済みuv 0.12.0だけがpyproject.tomlからuv.lockを生成する |
| IT-PYRT-005 | online fallback | frozen offline syncがnetwork、index、Python downloadなしで完結する |
| IT-PYRT-006 | dependency／SBOM差 | direct/transitive package exact setとSPDX component setが一致する |
| IT-PYRT-007 | Linux／Windows identity fork | OS固有artifactを分離しつつsemantic fixture結果が一致する |
| IT-PYRT-008 | experimental mode暗黙有効化 | free-threaded／JITは別承認receiptなしでは起動前に拒否される |
| IT-PYRT-009 | rollback未実証 | 失敗時に3.14.7通常build identityへ戻り、旧runtimeを再有効化しない |

## 合否

9件を実artifactと実processで個別に実行し、command、exit code、artifact／lock／SBOM digest、
runtime identity、Linux／Windows結果、rollback receiptを残す。version文字列だけ、system Python、
online解決、mock process、代表dependencyだけのSBOMはgreen evidenceにしない。

source build、実lock生成、offline sync、Windows parity、rollback rehearsalが未実証であるため、
本書と親PLANはdraftを維持する。
