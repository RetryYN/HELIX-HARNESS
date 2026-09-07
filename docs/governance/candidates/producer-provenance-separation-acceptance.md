---
title: "成果生成主体 provenance分離 L10受入候補"
status: draft_candidate
canonical_layer: L10
paired_requirement_layer: L3
plan: PLAN-L3-1622-producer-provenance-separation
pair_artifact: docs/governance/candidates/producer-provenance-separation-requirements.md
---

# 成果生成主体 provenance分離 L10受入候補

| AC ID | 対応要件 | fixture／mutation | 合格条件 |
|---|---|---|---|
| `PPS-AC-001` | `PPS-R-01` | 4役割を一件ずつ欠落・入替する | 欠落役割を特定し、別役割の値で補完せず拒否する |
| `PPS-AC-002` | `PPS-R-01`, `PPS-R-04` | producer A、executor B、publisher Cを実走しactor／commit metadataを入替する | 3役割を別identityとして再生しspoofを拒否する |
| `PPS-AC-003` | `PPS-R-02` | assignment、scope、成果digest、HEADを一件ずつ改変する | 全mutationを個別に拒否する |
| `PPS-AC-004` | `PPS-R-02`, `PPS-R-06` | producer receipt欠落と成果変更後の旧receipt再利用を注入する | `unknown/unattested`または新generationとなり旧証拠で昇格しない |
| `PPS-AC-005` | `PPS-R-03` | worker A生成→runtime B commit→actor C publish→reviewer Aを実行する | commit/publisher差にかかわらず非独立として拒否する |
| `PPS-AC-006` | `PPS-R-03` | worker A生成→runtime B commit→actor C publish→独立reviewer Dを実行する | exact HEADとsession/model照合後だけ受理する |
| `PPS-AC-007` | `PPS-R-04` | commit executorまたはGitHub actorをproducerとして偽装する | raw metadata推測を拒否し真正なproducer receiptを要求する |
| `PPS-AC-008` | `PPS-R-05` | receipt／PLAN／DB／GitHub／admissionの一面だけgraph digestを改変する | 全surfaceが不一致を検出する |
| `PPS-AC-009` | `PPS-R-05`, `PPS-R-06` | wrong assignment／HEAD／sessionと欠落projectionを個別注入する | replayを含む全consumerが同じfailureへ収束する |
| `PPS-AC-010` | `PPS-R-07` | direct author=committer旧receiptとproducer不明旧receiptをdual-readする | 前者はversioned互換条件で扱い、後者を推測backfillせず履歴保持する |

## 量閉じ

- business requests: `PPS-BR-01..04` exact 4件。
- supporting requirements: `PPS-R-01..07` exact 7件。
- acceptance: `PPS-AC-001..010` exact 10件。
- runtime、schema、DB migration、real-provider E2Eはcanonical promotion後の別PLANで検証する。
