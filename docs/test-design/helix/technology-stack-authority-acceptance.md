---
canonical_vmodel: L1-L12
canonical_layer: L10
canonical_pair: L3
title: "HELIX technology stack authority 受入テスト設計"
layer: L10
kind: test-design
status: draft
created: 2026-07-29
updated: 2026-07-29
owner: QA / 独立AI-B
plan: PLAN-L3-50-technology-stack-authority
parent_design: docs/design/helix/L3-requirements/technology-stack-authority.md
pair_artifact: docs/design/helix/L3-requirements/technology-stack-authority.md
---

# HELIX technology stack authority 受入テスト設計

## §0 oracle方針

version文字列の存在だけでなく、責務境界、互換期間、Bun禁止、native runtime採用証拠、
fast／full gate分離、未解決一覧の極性を検査する。

## §1 acceptance oracle

| AC ID | trace | positive oracle | negative oracle |
|---|---|---|---|
| `TECH-STACK-AC-001` | R-01 | 5 stack dispositionがexact setである | runtime欠落、別名化、Bunをoptionalにしたらfail |
| `TECH-STACK-AC-002` | R-01 | required stack field 14件がexact setである | owner、rollback、forbidden surface、unresolvedの欠落を許したらfail |
| `TECH-STACK-AC-003` | R-02 | TypeScript／Nodeがtransactional boundaryを単独所有する | Python、Rust、Go、BunへDB／Git commit authorityを与えたらfail |
| `TECH-STACK-AC-004` | R-02 | Node 24 LTSとTypeScript 7 target、6 API互換境界を区別する | Node Current自動採用、TS5.6から無検証cutover、TS6/7恒久二重authorityならfail |
| `TECH-STACK-AC-005` | R-03 | Python 3.14 semantic coreがstrict JSONL経由でNode commitへ接続する | DB path、credential、repository、network default allowを渡したらfail |
| `TECH-STACK-AC-006` | R-03 | Python exact patchとexperimental modeがL5未解決として残る | G3でfree-threaded／JITを暗黙production defaultにしたらfail |
| `TECH-STACK-AC-007` | R-04 | Rust／Go採用に11 evidence fieldがexactに必要である | Rust nightly、Go experimental feature、言語人気、期待性能、TS7のGo実装だけで採用したらfail |
| `TECH-STACK-AC-008` | R-04 | native componentがbounded owner、IPC／FFI、rollbackを持つ | repository全体のbulk rewriteまたはowner不在を許したらfail |
| `TECH-STACK-AC-009` | R-05 | active Bun surfaceが0でhistorical allowlistが非到達である | Bun command、fallback、rollback、current exampleを生成したらfail |
| `TECH-STACK-AC-010` | R-06 | fast preflightとfull admissionの責務、budget、実行時点が分離される | PR pushごとに無条件full、またはtargeted greenだけでmergeしたらfail |
| `TECH-STACK-AC-011` | R-06 | detector追加前に再発、検出不能、p95、complexity、owner、removalを要求する | 「速そう」を根拠にRust／Go detectorを追加したらfail |
| `TECH-STACK-AC-012` | §2 | 5 unresolved itemを明示し、`none`もdispositionとして保持する | 未測定項目を暗黙採用または完了として隠したらfail |

## §2 完了境界

本pairは採用境界をfreezeする。package更新、toolchain cutover、CI高速化、Bun skill退役、
Rust／Go component導入の完了を主張しない。
