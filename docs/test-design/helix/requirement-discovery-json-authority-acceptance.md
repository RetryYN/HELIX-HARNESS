---
canonical_vmodel: L1-L12
canonical_layer: L10
canonical_pair: L3
title: "Requirement Discovery Loop・L3 JSON authority受入テスト設計"
layer: L10
artifact_type: test_design
status: draft
created: 2026-07-30
updated: 2026-07-30
owner: QA / TL
plan: PLAN-L3-53-requirement-discovery-json-authority
pair_artifact: docs/design/helix/L3-requirements/requirement-discovery-json-authority.md
---

# Requirement Discovery Loop・L3 JSON authority受入テスト設計

| AC | 正常系oracle | 拒否するmutation |
|---|---|---|
| `RDJ-AC-001` | initiativeの確定値と未確定質問候補を分離する | AIがactor/value/constraintを補完 |
| `RDJ-AC-002` | event replayから同じcandidate projectionを再構築する | event上書き、訂正履歴消失、未知event受理 |
| `RDJ-AC-003` | impact式と過去回答から次質問を一意選択する | 重複質問、矛盾理由なし、回答捏造 |
| `RDJ-AC-004` | 8 surface kindと全flow／AC／oracle edgeが閉じる | surface未割当、`none`理由なし、正常系だけ |
| `RDJ-AC-005` | reactionからunderlying needとcandidate deltaを導出する | UI表現をそのままcanonical requirement化、古いrevision reaction再利用 |
| `RDJ-AC-006` | 暗黙matrix findingをderived candidateとhuman decisionへ送る | security/privacy/課金/法務/権限をAIが自動accept |
| `RDJ-AC-007` | 全収束条件とhuman agreementがcurrent revisionで成立する | score単独、P0/P1新規発生、stale agreement |
| `RDJ-AC-008` | compiler resultがexactly oneで全IR familyとtraceを持つ | actor/state/failure/NFR measurement/AC欠落を自動補完 |
| `RDJ-AC-009` | stable-ID JSONがstrict schemaとsemantic digestを満たす | extra property、unknown enum、空owner/status、range-only ID |
| `RDJ-AC-010` | JSON→Markdown→parser→normalized JSONのdigestが一致しcutoverがatomic | generated Markdown直接編集、JSON-only semantic drift、dual authority |
| `RDJ-AC-011` | 153/24/72/24 parity、12要求owner exact set、downstream status全件を確認する | 1件削除、owner欠落/重複、GitHub 5責務への再配線 |
| `RDJ-AC-012` | 3 styleへ共通適用しcase/specialistを別fieldで維持する | `PRODUCTION_SCRUM_REDUCED_V`出力、PoCのScrum内包、Design HARNESSのstyle化 |

## PR-1受入境界

PR-1では文書契約、existing owner mapping、Issue #30 hold、completion partitionだけを検証する。
PR-2以降のruntime oracleは`design-defined / not-implemented`であり、実行済みと表示しない。
