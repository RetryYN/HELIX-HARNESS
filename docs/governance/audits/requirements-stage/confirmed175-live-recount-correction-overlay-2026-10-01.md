# confirmed175 live recount correction overlay (2026-10-01)

Base: `50686b6762788574cb471967e8c24846d3dd56ae`
Historical recount: `08156a3b71ad97065cef34357dc37f6953b9a7f8`; SHA-256 `f406d89f20c5f78a4984097b03735cd6737569a4e49688e2534d58d2971b8adb`.

## Corrected strict counts

| Measure | Corrected value |
|---|---:|
| Confirmed population | 175 |
| Prior unique strict comparisons | 112 |
| Additional unique qualifying identities | 43 |
| Unique strict comparison evidence | 155 |
| Still unconfirmed under same threshold | 20 |
| Formal successor assignments | 0 |
| Source atom closure | 0 |
| Preserved pending rehome | 175 |

The original recount is preserved unchanged as a historical artifact at its source commit. This overlay applies the same strict threshold to existing identity-qualified audits omitted from its artifact index. The strict review adds 43 identities; 3L-BR-007 remains unconfirmed because its referenced HELIXINTELLIGENCE pair lacks exact F6 L2/L11 file SHA pins in the audit bytes. Source pins and residual evidence in separate identity records are not joined.

## Identity table

| Identity | Verdict | Evidence record or fail-closed reason |
|---|---|---|
| `BR-01` | Unconfirmed | source scope has a source pin, but no same-record identity-local F6 condition comparison/residual and exact target pair. |
| `BR-06` | Counted +1 | confirmed175-five-residual-condition-audit-2026-09-30.json /records/0 |
| `BR-08` | Counted +1 | confirmed175-five-residual-condition-audit-2026-09-30.json /records/3 |
| `D-01` | Counted +1 | confirmed175-kpi-d01-d09-condition-audit-2026-09-30.json /records/0 |
| `D-02` | Counted +1 | confirmed175-kpi-d01-d09-condition-audit-2026-09-30.json /records/1 |
| `D-03` | Counted +1 | confirmed175-kpi-d01-d09-condition-audit-2026-09-30.json /records/2 |
| `D-04` | Counted +1 | confirmed175-kpi-d01-d09-condition-audit-2026-09-30.json /records/3 |
| `D-05` | Counted +1 | confirmed175-kpi-d01-d09-condition-audit-2026-09-30.json /records/4 |
| `D-06` | Counted +1 | confirmed175-kpi-d01-d09-condition-audit-2026-09-30.json /records/5 |
| `D-07` | Counted +1 | confirmed175-kpi-d01-d09-condition-audit-2026-09-30.json /records/6 |
| `D-08` | Counted +1 | confirmed175-kpi-d01-d09-condition-audit-2026-09-30.json /records/7 |
| `D-09` | Counted +1 | confirmed175-kpi-d01-d09-condition-audit-2026-09-30.json /records/8 |
| `UX-02` | Counted +1 | confirmed175-five-residual-condition-audit-2026-09-30.json /records/1 |
| `FR-L1-05` | Unconfirmed | queue_fixed_target_refs is empty for this identity; generic F6 hashes and nearby references do not establish its fixed target pair. |
| `FR-L1-20` | Counted +1 | legacy-confirmed175-fr-l1-20-37-38-39-43-condition-audit-2026-09-30.json /records/0 |
| `FR-L1-21` | Unconfirmed | line SHA is in source.source_entries, separate from condition_comparison record; strict single-record rule forbids joining them. |
| `FR-L1-23` | Unconfirmed | line SHA is in source.source_entries, separate from condition_comparison record; strict single-record rule forbids joining them. |
| `FR-L1-35` | Counted +1 | confirmed175-five-residual-condition-audit-2026-09-30.json /records/2 |
| `FR-L1-37` | Counted +1 | legacy-confirmed175-fr-l1-20-37-38-39-43-condition-audit-2026-09-30.json /records/1 |
| `FR-L1-38` | Counted +1 | legacy-confirmed175-fr-l1-20-37-38-39-43-condition-audit-2026-09-30.json /records/2 |
| `FR-L1-39` | Counted +1 | legacy-confirmed175-fr-l1-20-37-38-39-43-condition-audit-2026-09-30.json /records/3 |
| `FR-L1-40` | Unconfirmed | source line pin rows and comparison are separated; no single identity-local record contains source pin plus residual. |
| `FR-L1-41` | Unconfirmed | source line pin rows and comparison are separated; no single identity-local record contains source pin plus residual. |
| `FR-L1-42` | Unconfirmed | source line pin rows and comparison are separated; no single identity-local record contains source pin plus residual. |
| `FR-L1-43` | Counted +1 | legacy-confirmed175-fr-l1-20-37-38-39-43-condition-audit-2026-09-30.json /records/4 |
| `FR-L1-44` | Unconfirmed | scope identity, line pin, and condition comparison are separate objects; fail-closed. |
| `FR-L1-51` | Unconfirmed | line SHA is in source.source_entries, separate from condition_comparison record; strict single-record rule forbids joining them. |
| `NFR-05` | Counted +1 | confirmed175-nfr-01-08-11-17-condition-audit-2026-09-30.json /records/4 |
| `PM-01` | Unconfirmed | source_assets pin is separate from condition_comparison; no same-record identity-local source pin plus residual. |
| `BBG-BR01` | Counted +1 | legacy-confirmed175-bbg-br01-br02-condition-audit-2026-10-01.json /source_qualified_identities/0 |
| `BBG-BR02` | Counted +1 | legacy-confirmed175-bbg-br01-br02-condition-audit-2026-10-01.json /source_qualified_identities/1 |
| `DAC-FR-001` | Unconfirmed | source pin record is separate from identity-local condition/residual record; strict join prohibited. |
| `DAC-FR-002` | Unconfirmed | source pin record is separate from identity-local condition/residual record; strict join prohibited. |
| `DAC-FR-003` | Unconfirmed | source pin record is separate from identity-local condition/residual record; strict join prohibited. |
| `DAC-FR-009` | Unconfirmed | record has source pin/residual and F6 revision, but lacks exact fixed L2/L11 file SHA values for its identity target pair. |
| `DAC-FR-010` | Unconfirmed | record has source pin/residual and F6 revision, but lacks exact fixed L2/L11 file SHA values for its identity target pair. |
| `DAC-NFR-002` | Unconfirmed | source pin record is separate from identity-local condition/residual record; strict join prohibited. |
| `DAC-NFR-003` | Unconfirmed | source pin record is separate from identity-local condition/residual record; strict join prohibited. |
| `HBR-P0` | Counted +1 | legacy-confirmed175-hbr-p0-p1-p2-hnfr-ac-p3-p5-fixed-f6-condition-audit-2026-10-01.json /records/0 |
| `HBR-P1` | Counted +1 | legacy-confirmed175-hbr-p0-p1-p2-hnfr-ac-p3-p5-fixed-f6-condition-audit-2026-10-01.json /records/1 |
| `HBR-P2` | Counted +1 | legacy-confirmed175-hbr-p0-p1-p2-hnfr-ac-p3-p5-fixed-f6-condition-audit-2026-10-01.json /records/2 |
| `HBR-P4` | Counted +1 | legacy-confirmed175-hbr-p4-p7-p8-p9-hnfr-p8-fixed-f6-condition-audit-2026-10-01.json /records/0 |
| `HBR-P6` | Unconfirmed | identity appears in population/aggregate condition matrix; no identity-specific record with line SHA and residual. |
| `HBR-P7` | Counted +1 | legacy-confirmed175-hbr-p4-p7-p8-p9-hnfr-p8-fixed-f6-condition-audit-2026-10-01.json /records/1 |
| `HBR-P8` | Counted +1 | legacy-confirmed175-hbr-p4-p7-p8-p9-hnfr-p8-fixed-f6-condition-audit-2026-10-01.json /records/2 |
| `HBR-P9` | Counted +1 | legacy-confirmed175-hbr-p4-p7-p8-p9-hnfr-p8-fixed-f6-condition-audit-2026-10-01.json /records/3 |
| `HNFR-AC` | Counted +1 | legacy-confirmed175-hbr-p0-p1-p2-hnfr-ac-p3-p5-fixed-f6-condition-audit-2026-10-01.json /records/3 |
| `HNFR-P3` | Counted +1 | legacy-confirmed175-hbr-p0-p1-p2-hnfr-ac-p3-p5-fixed-f6-condition-audit-2026-10-01.json /records/4 |
| `HNFR-P5` | Counted +1 | legacy-confirmed175-hbr-p0-p1-p2-hnfr-ac-p3-p5-fixed-f6-condition-audit-2026-10-01.json /records/5 |
| `HNFR-P8` | Counted +1 | legacy-confirmed175-hbr-p4-p7-p8-p9-hnfr-p8-fixed-f6-condition-audit-2026-10-01.json /records/4 |
| `SR-1` | Counted +1 | legacy-confirmed175-resident-lane-sr-1-11-condition-audit-2026-09-30.json /records/0 |
| `SR-10` | Counted +1 | legacy-confirmed175-resident-lane-sr-1-11-condition-audit-2026-09-30.json /records/9 |
| `SR-11` | Counted +1 | legacy-confirmed175-resident-lane-sr-1-11-condition-audit-2026-09-30.json /records/10 |
| `SR-2` | Counted +1 | legacy-confirmed175-resident-lane-sr-1-11-condition-audit-2026-09-30.json /records/1 |
| `SR-3` | Counted +1 | legacy-confirmed175-resident-lane-sr-1-11-condition-audit-2026-09-30.json /records/2 |
| `SR-4` | Counted +1 | legacy-confirmed175-resident-lane-sr-1-11-condition-audit-2026-09-30.json /records/3 |
| `SR-5` | Counted +1 | legacy-confirmed175-resident-lane-sr-1-11-condition-audit-2026-09-30.json /records/4 |
| `SR-6` | Counted +1 | legacy-confirmed175-resident-lane-sr-1-11-condition-audit-2026-09-30.json /records/5 |
| `SR-7` | Counted +1 | legacy-confirmed175-resident-lane-sr-1-11-condition-audit-2026-09-30.json /records/6 |
| `SR-8` | Counted +1 | legacy-confirmed175-resident-lane-sr-1-11-condition-audit-2026-09-30.json /records/7 |
| `SR-9` | Counted +1 | legacy-confirmed175-resident-lane-sr-1-11-condition-audit-2026-09-30.json /records/8 |
| `S-BR-001` | Unconfirmed | source_assets pin is separate from condition_comparison; no same-record identity-local source pin plus residual. |
| `3L-BR-007` | Unconfirmed | F6 L2/L11 file SHA values for HELIXINTELLIGENCE-L2-010 are absent from the audit bytes. |

## Decision status distinction

FR-L1-35 is counted only as a source-to-fixed-F6 condition comparison. The later PO record keeps HELIXOS-L2-045 / L11-045 **保留** pending the target set, `version_target`, and HARNESS-to-OS ownership scope. The comparison does not lift the hold, assign a successor, or close the legacy source identity.

## Recount index omission

The historical recount artifact index omits qualifying existing audits, including the D-01–09 KPI audit, BBG-BR01/02 audit, SR-1–11 audit, and identity-specific HBR/HNFR audits. FR-L1-51 has an existing audit outside the index but does not satisfy the strict single-record rule: its source line pin and comparison residual are separate. FR-L1-44 is also fail-closed because identity, source pin, and comparison evidence are separated.

All 63 archive file and exact line digests were recomputed from archive bytes. The JSON companion records every identity, exact source pin, evidence record or fail-closed reason, and audit artifact SHA-256.
