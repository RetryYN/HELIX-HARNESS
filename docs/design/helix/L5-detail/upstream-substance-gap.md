---
title: "HELIX L5 詳細設計 — upstream A-146 substance-gap adoption（採用）"
layer: L5
kind: add-design
status: confirmed
created: 2026-06-30
updated: 2026-06-30
owner: AIM + TL (Codex)
plan: PLAN-L5-09-helix-pillar-detail-design
pair_artifact: docs/test-design/helix/upstream-substance-gap.md
related_l4: docs/design/helix/L4-basic-design/upstream-substance-gap.md
---

# HELIX L5 詳細設計 — upstream A-146 substance-gap adoption（採用）

L4 upstream boundary（上流境界）を integration contract（結合契約）に落とす。ここで固定するのは module / projection /
evidence 境界であり、実装完了 claim（完了主張）ではない。

## §1 L5 contract matrix（契約表）

| L3 ID | L5 contract（L5 契約） | 必須 input | Contract output（契約出力） | fail-close 条件 |
|-------|-------------|----------------|-----------------|------------|
| HU-FR-01 | HU-C01 guard-governance-pack | adapter template、runtime surface catalog、deferred surface registry | `GuardGovernancePack` | guard entrypoint 欠落、未追跡 deferred surface、未実装 guard の covered claim |
| HU-FR-02 | HU-C02 consumer-cli-resolution | install target、hook command、PATH/wrapper resolver result | `ConsumerCliResolution` | `helix` を解決できず、remediation も出さない |
| HU-FR-03 | HU-C03 green-evidence-binding | command、exit status、green command digest、evidence path、run timestamp | `GreenEvidenceBinding` | digest-only update（hash-only restamp）、stale evidence path、command 未再実行 |
| HU-FR-04 | HU-C04 telemetry-provenance | runtime provenance を示す telemetry row、source event、projection rule、runtime identity | `TelemetryProvenanceClass` | provenance unknown、facade row を runtime evidence として使用 |
| HU-FR-05 | HU-C05 distribution-curation | package manifest、doc path、audience、dogfood/internal marker | `DistributionCurationDecision` | deny/curation rule 無しの blanket `docs/governance/` allow、または blanket governance allowlist |
| HU-FR-06 | HU-C06 fe-design-substance | FE design coverage 対象 doc、layer、body section、defer marker、out-of-scope marker | `FeDesignSubstanceStatus` | presence-only coverage を populated design と主張 |
| HU-FR-07 | HU-C07 drive-entry-matrix | task signal、plan kind、drive model、route decision | `DriveEntryDecision` | unknown `signal -> mode` または invalid `kind x drive` の auto-run |
| HU-FR-08 | HU-C08 runtime-matcher-evidence | runtime name/version、target-runtime tool event evidence、matcher、guard result | `RuntimeMatcherCompatibility` | target-runtime evidence なしに runtime matcher compatibility coverage を主張 |

## §2 integration observation（統合観測）

| Contract（契約） | L8 observation（L8 観測） |
|----------|----------------|
| HU-C01 | generated adapter package が guard entrypoints と explicit deferred surfaces を含む |
| HU-C02 | clean install smoke が hook command resolution または fail-close remediation を証明する |
| HU-C03 | evidence batch が command execution と digest update を join する |
| HU-C04 | DB projection が runtime / projected / derived telemetry を区別できる |
| HU-C05 | package curation が consumer docs と internal dogfood audit/process docs を分離する |
| HU-C06 | FE design coverage が file presence だけでなく populated/deferred/out-of-scope を報告する |
| HU-C07 | route selection が signal/kind/drive を matrix に照らして検証する |
| HU-C08 | runtime matcher compatibility が actual target runtime events（実 target runtime event）に裏付けられる |

## §3 L6 carry（L6 持ち越し）

L6 design はすべての `HU-C*` contracts について function signatures と DbC を定義し、contract ごとに
1 つの oracle と upstream-audit completeness oracle（完全性オラクル）を 1 つ持たなければならない。
