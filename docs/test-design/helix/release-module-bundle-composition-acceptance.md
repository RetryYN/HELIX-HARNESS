---
title: "HELIX L10 受入テスト設計 — Release Module／Bundle composition"
canonical_layer_scheme: L1-L12
layer: L10
paired_requirement_layer: L3
artifact_type: test_design
status: confirmed
created: 2026-08-27
updated: 2026-08-27
owner: QA / Codex TL
plan: PLAN-L3-68-release-module-bundle-composition
pair_artifact: docs/design/helix/L3-requirements/release-module-bundle-composition-requirements.md
---

# HELIX L10 受入テスト設計 — Release Module／Bundle composition

## §0 合否境界

文書上の分類やfile countだけでは合格にしない。既存authorityの再利用、exact ownership、dependency closure、再現可能artifact、
static-before-trusted順序、consumer behavior parity、rollback、actor分離、main／DevOS read-afterを検証する。

## §1 oracle exact set

| AC ID | 対応requirement | 合格条件 | negative mutation |
|---|---|---|---|
| `RLS-AC-001` | `RLS-R-01` | schema、独立SemVer、全digest、lifecycleがexact | lifecycle skip、field欠落を拒否 |
| `RLS-AC-002` | `RLS-R-02` | 11 Module候補とblockerがexact | 未完moduleをstable扱いしない |
| `RLS-AC-003` | `RLS-R-03` | 全release pathのprimary ownerがexactly one | orphan、duplicate、scope外、semantic copyを拒否 |
| `RLS-AC-004` | `RLS-R-04` | dependency DAGとcompatibility closureが再現可能 | cycle、欠落、unknown、authority mismatchを拒否 |
| `RLS-AC-005` | `RLS-R-05` | 8 Bundle候補のmodule／exclusion exact setが一致 | module意味変更、preview暗黙包含を拒否 |
| `RLS-AC-006` | `RLS-R-06` | frozen Liteとnew Liteのbehavior／setup／doctor／DB／OS／rollback parity | 先行削除、旧profile継ぎ足し、green相殺を拒否 |
| `RLS-AC-007` | `RLS-R-07` | 同一入力2 buildのartifact／manifest／checksum／semantic digest一致 | timestamp、entry order、手編集、builder forkを拒否 |
| `RLS-AC-008` | `RLS-R-08` | static検査後だけtrusted consumerを起動 | traversal、link、collision、bomb、secret、unexpected executableを個別kill |
| `RLS-AC-009` | `RLS-R-08` | Linux／Windows同一artifact、upgrade／rollback、consumer bytes保全 | OS別rebuild、state wipe、consumer rollbackを拒否 |
| `RLS-AC-010` | `RLS-R-09` | R0〜R11順序、exact candidate、producer／reviewer／verifier分離 | stale HEAD、actor兼任、source logic変更、stage skipを拒否 |
| `RLS-AC-011` | `RLS-R-10` | channel／SemVer／Wave gateがmachine-managed | deprecated default、retired install、preview stable混入を拒否 |
| `RLS-AC-012` | `RLS-R-11` | affected closureとinventory unionを満たすCI Plan | silent lane omission、unknown success、無関係直列fullを拒否 |
| `RLS-AC-013` | `RLS-R-12` | findingからReverse、release index、DB、GitHub、両repo read-afterが収束 | notification／DB／DevOSを意味正本にしない |
| `RLS-AC-014` | §0 | capability、workflow、Module、Bundle、repository軸が分離 | route／mode／drive enumへの吸収を拒否 |
| `RLS-AC-015` | §1 | 非対象ownerへ参照だけを張る | 未完機能、whole-system planner、repo splitを混載しない |

## §2 量閉じ

- feature contract: `RLS-FR-001..004` exact 4件。
- supporting requirement: `RLS-R-01..12` exact 12件。
- acceptance: `RLS-AC-001..015` exact 15件。
- issue decomposition: parent #1073、RLS-01〜13 = #1074〜#1086。
