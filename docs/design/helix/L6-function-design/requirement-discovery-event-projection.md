---
title: "Requirement Discovery event／candidate projection機能設計"
layer: L6
kind: add-design
status: draft
created: 2026-07-30
updated: 2026-07-30
owner: Codex / TL
plan: docs/plans/PLAN-L6-88-requirement-discovery-event-projection.md
parent_design: docs/design/helix/L5-detail/requirement-translation-obligation.md
pair_artifact: docs/test-design/helix/L8-requirement-discovery-event-projection-unit-test-design.md
---

# Requirement Discovery event／candidate projection機能設計

## §0 位置づけ

本機能は`RequirementDefinitionLedger`と`RequirementTranslator`の前段にある移行用pure componentである。
L2 discovery eventを検証し、非canonicalなcandidate projectionを決定論的に再構築する。
DB、GitHub、filesystem、L3 canonical requirementへのwrite authorityを持たない。

`#185`のquestion class／unresolved契約を再利用するが、未実装のinterview engineを実装済みとは扱わない。
Production runtimeのRequirement Discovery EngineはG1/G3後に別のL4/L9→L5/L8→L6/L7降下で実装する。

## §1 public contract

| API | precondition | postcondition | failure |
|---|---|---|---|
| `parseRequirementDiscoveryEvent(raw)` | `raw`はuntrusted | 17 event種のstrict typed eventだけを返す | unknown field/type、空ID、digest形式不正をthrow |
| `createRequirementDiscoveryEvent(input)` | payloadと直前event digestが与えられる | canonical payload digestとevent digestを付与する | schema不一致をthrow |
| `rebuildRequirementCandidateProjection(events)` | 単一initiativeのevent列 | 同じ列から同じprojection digestを返す | sequence/digest/initiative/参照/authority/lifecycle不整合をthrow |

入力eventは`config/requirement-discovery-event-schema.json`のshadow schemaへ束縛する。
schemaはL1 human Markdown、L2 append-only/noncanonical、L3 cutover後strict JSONを分離し、
現段階の`write_authority`を`none`に固定する。

## §2 eventとprojection不変条件

- event IDは一意、sequenceは1始まりで連続、`previous_event_digest`は直前headと一致する。
- payload／event digestはkey順序を正規化したcanonical JSONのSHA-256で再計算する。
- eventの訂正は新eventで行い、上書き、途中削除、別initiative混入を拒否する。
- candidateは
  `hypothesis→elicited→prototyped→observed→accepted→specified→frozen`の順序を持つ。
- L2は`frozen`を生成できず、accept／reject／prototype agreementはhuman actorだけが行う。
- 質問は21 classと4 selection factorを持ち、同じ`semantic_key`の再質問を拒否する。
- prototypeはL3正本と同一の8 surface kind
  (`screen/cli/api/event/batch/notification/external_service/none`) と
  normal/cancel/failure/timeout flowを必須とする。`none`は理由と再評価条件を必須とし、
  それ以外のsurfaceで`none`専用fieldを持つ入力を拒否する。
- projectionはeventだけから再構築し、直接更新、numeric scoreによる収束、canonical claimを禁止する。

## §3 収束判定

`convergence.ready`は次の10条件の論理積である。

1. actor列挙
2. task列挙
3. normal/cancel/failure/timeout flow
4. P0/P1のsurface割当、または理由と再評価条件を持つ`none`
5. 全candidateのtyped disposition
6. contradiction 0またはowner/reentry付きtyped defer
7. 全unresolvedのowner/reentry
8. implicit requirement matrix完了
9. 直近2 iterationの新規P0/P1 0
10. human prototype agreement

不足条件は`blocking_reasons[]`へexact nameで残し、scoreで相殺しない。

## §4 非対象

- L3 Requirement Compiler、153件migration、JSON→Markdown generator、DB projection
- L3 canonical cutover、G1/G3 freeze receipt
- question ranking engine、prototype generator、Design Template JSON
