---
title: "worker descriptor admission L9 system test設計"
layer: L9
artifact_type: test_design
status: confirmed
created: 2026-08-02
updated: 2026-08-02
owner: QA
plan: docs/plans/PLAN-L4-60-worker-descriptor-admission.md
pair_artifact: docs/design/helix/L4-basic-design/worker-descriptor-admission.md
related_l3: docs/test-design/helix/worker-common-contract-acceptance.md
github_issue_id: 225
behavior_contract_id: WCC-FR-01
responsibility_owner: worker-descriptor-admission
---

# worker descriptor admission L9 system test設計

| oracle | scenario | 合格条件 |
|---|---|---|
| `ST-WDA-001` | Claude、Codex、Kimi相当の異なるproviderを同一descriptor schemaで登録して解決 | provider固有I/Oに依存せず、各requestがexactly-one active descriptorへ解決される |
| `ST-WDA-002` | 必須field欠落、unknown key、schema／contract version不正を個別投入 | `WORKER_DESCRIPTOR_INVALID`、registry write 0、spawn 0 |
| `ST-WDA-003` | descriptor 0件、同じexact keyの2件、inactive 1件を投入 | NOT_FOUND／AMBIGUOUS／INACTIVEを区別し、いずれもspawn 0 |
| `ST-WDA-004` | requested capabilityとdescriptor capabilityをずらす | `WORKER_DESCRIPTOR_CAPABILITY_MISMATCH`、別capabilityやprovider既定値へfallback 0 |
| `ST-WDA-005` | descriptor bytesまたはregistry snapshotをdecision後に変更 | digest driftでreceiptをstale化し、再解決前のspawn 0 |
| `ST-WDA-006` | raw CLI成功、provider allowlist、過去smoke greenだけをdescriptor代替として投入 | descriptor admissionを補完せずNOT_FOUNDで拒否する |
| `ST-WDA-007` | Python worker descriptorを既存adapterから共通projectionへ渡す | Python固有registryを複製せず、同じidentity/version/capability/digest判定を通る |
| `ST-WDA-008` | 新registry案と既存owner合成案を同じ7 oracleで比較 | oracle coverage 100%を維持し、new component/state/persistence/production LOCが小さい既存owner合成案を採用する |
| `ST-WDA-009` | wrapper、sandbox、receipt、blind benchmark、context packetの完了claimを本pairへ混入 | WCC-FR-01以外の完了claimを拒否し、後続原子契約として残す |

全oracleはcandidate HEAD、registry revision/digest、descriptor digest、spawn countを同じevidenceへ束縛する。
L9ではsystem observableな起動前decisionを検証し、parser関数とtransactionのunit／integration oracleはL5/L8へ委ねる。
