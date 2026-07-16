---
title: "HELIX Rebaseline v0.4.0 source trace audit"
status: draft
created: 2026-07-16
updated: 2026-07-16
owner: Codex / TL
source_digest: sha256:c0d839bd65a221bd9614b9820cd08d3f5c21cad057bbde03bb9b2e532d05a812
---

# HELIX Rebaseline v0.4.0 source trace監査

## §0 exact set差分

| metric | count |
|---|---:|
| requirements | 163 |
| catalog `sources` expected edges | 222 |
| trace `refined_into` edges | 123 |
| exact intersection | 122 |
| catalog field-only | 100 |
| trace graph-only | 1 |
| requirement exact set match | 89 |
| partial | 23 |
| inbound source edge 0 | 51 |
| `verified_by` requirement edge | 163/163 |
| AC ID | 111 unique / valid |

唯一のgraph-only edgeは`CHAT-019→HBR-DH-003`で、catalogは`CHAT-020/UT-REFERENCE`をsourceとするため余剰である。
source aliasは49種（CHAT 20＋非CHAT 29）だが、structured registryはCHAT 20だけである。`SRC-001..018` disposition IDと
catalog source aliasのintersectionは0で、採否から要求へjoinできない。

## §1 source edge 0 requirement（51/51）

Design HARNESS 19件:

`HBR-DH-004..020`、`HBR-DH-022`、`HBR-DH-023`。

その他32件:

- core: `HBR-CORE-003/004/005/006`
- architecture: `HBR-ARCH-003/004/006/007/011/012`
- platform: `HNFR-PLAT-006`
- elicitation: `HBR-ELICIT-003/005/006/007/009/014`
- workflow: `HBR-WF-014`
- database: `HBR-DB-002/004/007/011/012/014`
- infinity: `HBR-INF-012`
- inventory: `HBR-INV-004/006/007/008/010`
- security: `HNFR-SEC-005/009`

range表記は説明用であり、修復generatorはIDを展開して51個の個別edgeを作る。

### §1.1 candidate exact route artifact

51件は`docs/governance/generated/helix-rebaseline-v040-zero-edge-routes-51-v1.json`へ個別展開した。
artifact SHA-256は`c67f7000d22e28dbd5b0b8e847c2df3b544162ce60628894a799f062a02cf731`、candidate routeは
51/51（adopt 12、harden 3、redesign 4、defer 32）である。各行はpackage catalogのsource atom、candidate disposition、
現行target候補、evidence、reason、authority、`coverage=false`を保持する。

独立semantic reviewは
`docs/governance/generated/helix-rebaseline-v040-route51-design-ac18-review-v1.json`
（SHA-256 `cd2d5ac5fedf932a371c3fff8b9d047c973e332f0f5aef0d3a9c7a71e8f0bae2`）で51/51のcandidate分類、
Design AC closure 18/18の現行L1/L3/L4/HAT/Visual edgeを再検査し、誤分類・orphan・authority混入0となった。
ただしこれはsource edge修復完了ではない。immutable source registryが未成立なのでverified source edgeは0/51、
coverage creditは0/51、residual unverified source edgeは51/51のままとする。特にdefer 32件へ推測targetを補わず、
source registry repairと実行receiptをfreeze blockerとして維持する。

## §2 partial 23のmissing source

| requirement | missing source alias |
|---|---|
| HBR-CORE-001 / 002 | `HYBRID-README` |
| HBR-CORE-007 | `UT-ADR-001` |
| HBR-CORE-010 / 012 | `HYBRID-INVENTORY` / `HYBRID-SELFTEST` |
| HBR-ARCH-002 / 008 | `UT-PACKAGE` / `UT-STATE-DB` |
| HNFR-PLAT-008 | `UT-HANDOVER` |
| HBR-ELICIT-001 / 002 / 004 | `WF-V1.1` |
| HBR-INV-013 | `HYBRID-INVENTORY` |
| HNFR-SEC-010 | `UT-A187` |
| HBR-DH-001 / 002 | `DESIGN-HARNESS-BASE` |
| HBR-DH-003 | `UT-REFERENCE`欠落、`CHAT-019`余剰 |
| HBR-DH-021 | `CHAT-010/CHAT-018/HYBRID-PYTHON` |
| HBR-DH-024 | `CHAT-020/DESIGN-HARNESS-BASE` |
| HBR-DH-025 / 026 | `DESIGN-HARNESS-V0.1` |
| HBR-DH-027 | `UT-REFERENCE` |
| HBR-DH-028 | `CHAT-010/HYBRID-CATALOG` |
| HBR-DH-029 | `CHAT-010/CHAT-018/HYBRID-PYTHON` |

## §3 canonical repair schemaとgate

1. `source_registry(source_ref_id, kind, canonical_locator, immutable_revision_or_sha256, fragment_anchor,
   authority_role, availability)`を作る。
2. `requirement_source_edges(requirement_id, source_ref_id, relation_type, source_anchor)`を唯一のedge正本とし、catalog fieldと
   trace graphを同じedge集合から生成する。
3. `asset_dispositions`は`disposition_id`と`source_ref_id`を分離してFKで結ぶ。
4. source欄へHBR requirement IDを入れている4 edgeは`requirement_dependencies`へ移す。

blocking条件は、163/163 source edge 1件以上、field/graph set equality、registry orphan 0、余剰edge 0、immutable anchor 100%、
Design HARNESSは文書section anchor 29/29である。packageの`chat_trace_closure`はchat起点最低1 edgeだけなので、このgateの
代替にしない。
