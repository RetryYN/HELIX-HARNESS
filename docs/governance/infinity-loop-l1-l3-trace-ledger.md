---
title: "HELIX Infinity Loop L1↔L3 trace ledger"
status: draft
created: 2026-07-16
updated: 2026-07-16
owner: PO / TL
schema: infinity-loop-l1-l3-trace.v1
l1: docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md
l3: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
---

# HELIX Infinity Loop L1↔L3 trace台帳

## §0 Contract

本台帳はL1の各requirementからL3 System FRへのreverse edge正本である。各L1 IDはprimary ownerをexactly 1件持つ。
工程authority、全要件freeze、UT採用の横断familyである`HR-FR-HIL-19`、`HR-FR-HIL-25`、
`HR-FR-HIL-26`は、より狭い機能ownerがある場合はsupporting edgeとする。supporting edgeは複数可だが、
primary completenessへ重複算入しない。L3 §1のforward edge集合と本表のprimary＋supporting集合が完全一致しなければfreezeを拒否する。

## §1 Reverse edge ledger（162/162）

| L1 requirement | primary L3 System FR | supporting L3 System FR | forward edge count | status |
|---|---|---|---:|---|
| HIL-BR-01 | HR-FR-HIL-02 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-BR-02 | HR-FR-HIL-03 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-BR-03 | HR-FR-HIL-07 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-BR-04 | HR-FR-HIL-04 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-BR-05 | HR-FR-HIL-04 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-BR-06 | HR-FR-HIL-05 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-BR-07 | HR-FR-HIL-05 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-BR-08 | HR-FR-HIL-05 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-BR-09 | HR-FR-HIL-08 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-BR-10 | HR-FR-HIL-02 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-BR-11 | HR-FR-HIL-07 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-BR-12 | HR-FR-HIL-01 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-BR-13 | HR-FR-HIL-15 | HR-FR-HIL-19 | 2 | draft-edge / definition-freeze-pending |
| HIL-BR-14 | HR-FR-HIL-09 | HR-FR-HIL-26 | 2 | draft-edge / definition-freeze-pending |
| HIL-BR-15 | HR-FR-HIL-11 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-BR-16 | HR-FR-HIL-06 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-BR-17 | HR-FR-HIL-03 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-BR-18 | HR-FR-HIL-08 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-BR-19 | HR-FR-HIL-13 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-BR-20 | HR-FR-HIL-06 | HR-FR-HIL-26 | 2 | draft-edge / definition-freeze-pending |
| HIL-BR-21 | HR-FR-HIL-16 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-BR-22 | HR-FR-HIL-17 | HR-FR-HIL-25 | 2 | draft-edge / definition-freeze-pending |
| HIL-BR-23 | HR-FR-HIL-17 | HR-FR-HIL-25 | 2 | draft-edge / definition-freeze-pending |
| HIL-BR-24 | HR-FR-HIL-17 | HR-FR-HIL-25 | 2 | draft-edge / definition-freeze-pending |
| HIL-BR-25 | HR-FR-HIL-18 | HR-FR-HIL-19 | 2 | draft-edge / definition-freeze-pending |
| HIL-BR-26 | HR-FR-HIL-20 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-BR-27 | HR-FR-HIL-20 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-BR-28 | HR-FR-HIL-21 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-BR-29 | HR-FR-HIL-22 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-BR-30 | HR-FR-HIL-23 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-01 | HR-FR-HIL-02 | HR-FR-HIL-19 | 2 | draft-edge / definition-freeze-pending |
| HIL-FR-02 | HR-FR-HIL-01 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-03 | HR-FR-HIL-01 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-04 | HR-FR-HIL-04 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-05 | HR-FR-HIL-04 | HR-FR-HIL-19 | 2 | draft-edge / definition-freeze-pending |
| HIL-FR-06 | HR-FR-HIL-05 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-07 | HR-FR-HIL-05 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-08 | HR-FR-HIL-04 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-09 | HR-FR-HIL-03 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-10 | HR-FR-HIL-07 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-11 | HR-FR-HIL-08 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-12 | HR-FR-HIL-08 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-13 | HR-FR-HIL-08 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-14 | HR-FR-HIL-07 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-15 | HR-FR-HIL-09 | HR-FR-HIL-10 | 2 | draft-edge / definition-freeze-pending |
| HIL-FR-16 | HR-FR-HIL-09 | HR-FR-HIL-26 | 2 | draft-edge / definition-freeze-pending |
| HIL-FR-17 | HR-FR-HIL-15 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-18 | HR-FR-HIL-15 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-19 | HR-FR-HIL-15 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-20 | HR-FR-HIL-15 | HR-FR-HIL-19 | 2 | draft-edge / definition-freeze-pending |
| HIL-FR-21 | HR-FR-HIL-09 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-22 | HR-FR-HIL-09 | HR-FR-HIL-26 | 2 | draft-edge / definition-freeze-pending |
| HIL-FR-23 | HR-FR-HIL-11 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-24 | HR-FR-HIL-11 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-25 | HR-FR-HIL-10 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-26 | HR-FR-HIL-10 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-27 | HR-FR-HIL-12 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-28 | HR-FR-HIL-06 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-29 | HR-FR-HIL-06 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-30 | HR-FR-HIL-03 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-31 | HR-FR-HIL-04 | HR-FR-HIL-19 | 2 | draft-edge / definition-freeze-pending |
| HIL-FR-32 | HR-FR-HIL-08 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-33 | HR-FR-HIL-13 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-34 | HR-FR-HIL-14 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-35 | HR-FR-HIL-04 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-36 | HR-FR-HIL-05 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-37 | HR-FR-HIL-09 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-38 | HR-FR-HIL-05 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-39 | HR-FR-HIL-16 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-40 | HR-FR-HIL-16 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-41 | HR-FR-HIL-17 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-42 | HR-FR-HIL-17 | HR-FR-HIL-25 | 2 | draft-edge / definition-freeze-pending |
| HIL-FR-43 | HR-FR-HIL-17 | HR-FR-HIL-25 | 2 | draft-edge / definition-freeze-pending |
| HIL-FR-44 | HR-FR-HIL-17 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-45 | HR-FR-HIL-17 | HR-FR-HIL-25 | 2 | draft-edge / definition-freeze-pending |
| HIL-FR-46 | HR-FR-HIL-18 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-47 | HR-FR-HIL-18 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-48 | HR-FR-HIL-18 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-49 | HR-FR-HIL-18 | HR-FR-HIL-19 | 2 | draft-edge / definition-freeze-pending |
| HIL-FR-50 | HR-FR-HIL-18 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-51 | HR-FR-HIL-20 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-52 | HR-FR-HIL-20 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-53 | HR-FR-HIL-20 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-54 | HR-FR-HIL-21 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-55 | HR-FR-HIL-21 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-56 | HR-FR-HIL-22 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-57 | HR-FR-HIL-23 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-58 | HR-FR-HIL-23 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-59 | HR-FR-HIL-24 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-60 | HR-FR-HIL-24 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-61 | HR-FR-HIL-27 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-62 | HR-FR-HIL-28 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-63 | HR-FR-HIL-29 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-64 | HR-FR-HIL-30 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-65 | HR-FR-HIL-31 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-66 | HR-FR-HIL-32 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-67 | HR-FR-HIL-33 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-68 | HR-FR-HIL-34 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-69 | HR-FR-HIL-35 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-70 | HR-FR-HIL-36 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-71 | HR-FR-HIL-37 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-72 | HR-FR-HIL-38 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-73 | HR-FR-HIL-39 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-74 | HR-FR-HIL-40 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-75 | HR-FR-HIL-41 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-76 | HR-FR-HIL-42 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-77 | HR-FR-HIL-43 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-78 | HR-FR-HIL-44 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-79 | HR-FR-HIL-45 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-80 | HR-FR-HIL-46 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-FR-81 | HR-FR-HIL-47 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-TR-01 | HR-FR-HIL-13 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-TR-02 | HR-FR-HIL-12 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-TR-03 | HR-FR-HIL-09 | HR-FR-HIL-10 | 2 | draft-edge / definition-freeze-pending |
| HIL-TR-04 | HR-FR-HIL-14 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-TR-05 | HR-FR-HIL-14 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-TR-06 | HR-FR-HIL-14 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-TR-07 | HR-FR-HIL-12 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-TR-08 | HR-FR-HIL-12 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-TR-09 | HR-FR-HIL-12 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-TR-10 | HR-FR-HIL-12 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-TR-11 | HR-FR-HIL-13 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-TR-12 | HR-FR-HIL-20 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-TR-13 | HR-FR-HIL-24 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-NFR-01 | HR-FR-HIL-01 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-NFR-02 | HR-FR-HIL-07 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-NFR-03 | HR-FR-HIL-04 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-NFR-04 | HR-FR-HIL-02 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-NFR-05 | HR-FR-HIL-01 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-NFR-06 | HR-FR-HIL-05 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-NFR-07 | HR-FR-HIL-05 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-NFR-08 | HR-FR-HIL-09 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-NFR-09 | HR-FR-HIL-14 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-NFR-10 | HR-FR-HIL-08 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-NFR-11 | HR-FR-HIL-15 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-NFR-12 | HR-FR-HIL-09 | HR-FR-HIL-26 | 2 | draft-edge / definition-freeze-pending |
| HIL-NFR-13 | HR-FR-HIL-10 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-NFR-14 | HR-FR-HIL-12 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-NFR-15 | HR-FR-HIL-06 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-NFR-16 | HR-FR-HIL-06 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-NFR-17 | HR-FR-HIL-11 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-NFR-18 | HR-FR-HIL-08 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-NFR-19 | HR-FR-HIL-14 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-NFR-20 | HR-FR-HIL-04 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-NFR-21 | HR-FR-HIL-05 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-NFR-22 | HR-FR-HIL-09 | HR-FR-HIL-26 | 2 | draft-edge / definition-freeze-pending |
| HIL-NFR-23 | HR-FR-HIL-05 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-NFR-24 | HR-FR-HIL-16 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-NFR-25 | HR-FR-HIL-16 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-NFR-26 | HR-FR-HIL-17 | HR-FR-HIL-25 | 2 | draft-edge / definition-freeze-pending |
| HIL-NFR-27 | HR-FR-HIL-17 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-NFR-28 | HR-FR-HIL-17 | HR-FR-HIL-25 | 2 | draft-edge / definition-freeze-pending |
| HIL-NFR-29 | HR-FR-HIL-18 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-NFR-30 | HR-FR-HIL-20 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-NFR-31 | HR-FR-HIL-21 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-NFR-32 | HR-FR-HIL-20 | HR-FR-HIL-21, HR-FR-HIL-25 | 3 | draft-edge / definition-freeze-pending |
| HIL-NFR-33 | HR-FR-HIL-22 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-NFR-34 | HR-FR-HIL-20 | HR-FR-HIL-22 | 2 | draft-edge / definition-freeze-pending |
| HIL-NFR-35 | HR-FR-HIL-23 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-NFR-36 | HR-FR-HIL-23 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-NFR-37 | HR-FR-HIL-24 | — | 1 | draft-edge / definition-freeze-pending |
| HIL-NFR-38 | HR-FR-HIL-24 | — | 1 | draft-edge / definition-freeze-pending |

## §2 Closure

| metric | count | verdict |
|---|---:|---|
| L1 unique requirements | 162/162 | PASS |
| primary owner exactly-one | 162/162 | PASS |
| L3 forward edges | 188 | PASS |
| reverse primary＋supporting edges | 188 | PASS |
| duplicate coverage IDs | 25 | supportingとして明示 |
| unassigned L1 IDs | 0 | PASS |
| active/frozen definitions | 0/162 | FAIL（別gate） |

本台帳のedge閉鎖はsource authority、template applicability、design obligation、test evidence、独立reviewの代替ではない。
