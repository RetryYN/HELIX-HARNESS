---
canonical_vmodel: L1-L12
canonical_layer: L3
canonical_pair: L10
title: "Universal Improvement Loop要件"
layer: L3
kind: add-design
status: draft
created: 2026-08-29
updated: 2026-08-29
owner: PO / TL
plan: PLAN-L3-74-universal-improvement-loop
parent_design: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
pair_artifact: docs/test-design/helix/universal-improvement-loop-acceptance.md
next_pair_freeze: L10
refines:
  - UTH-FR-030
  - HR-FR-P4-03
extends:
  - SYN-R-01
  - SYN-R-02
  - SYN-R-03
governed_by:
  - HR-NFR-P8-01
  - HR-NFR-P3-01
---

# Universal Improvement Loop要件

## 0. 目的とauthority境界

Universal Improvement Loopは、HELIX自身のruntime、CI、DB、Requirement、Definition、Design、dependency、
operation、provider environmentを決定的に観測し、baselineとの差分から改善候補を生成し、既存workflowへ戻して
修正後の効果と再発まで測る横断capabilityである。

本capabilityはAI間の作成・レビュー循環、resident lane、review orchestration、新しいworkflow route、
development style、execution mode、DB authorityではない。AIは説明、仮説、候補を提案できるが、detector evidence、
意味同一性、authority変更、merge、completionを確定しない。通知、生成文書、DB row、LLM出力を意味正本にしない。

## UIL-FR-001 観測sourceとbaseline比較

### UIL-R-01 改善source registry

観測sourceはstable ID、owner、schema version、detector version、input authority、revision、retention、redaction、
freshness、failure dispositionを持つversioned registryへ登録する。任意log文字列やAI感想をdetector evidenceとして
扱わず、unknown source、欠落revision、stale evidenceをfail-closeする。

初期sourceはCI wall-clock／queue／runner-minute／flake／retry、DB projection／replay／checkpoint、Requirement／
Definitionのduplicate／overlap／orphan／stale、dependency cycle／fan-out／change amplification、review／rework／
rollback／incident、provider／toolchain drift、distribution consumer、resource／cost／security findingとする。

### UIL-R-02 観測正規化とbaseline比較

source eventをstable event ID、baseline revision、observed revision、payload digest、correlation、causation、confidence、
counterevidenceへ正規化する。同一event集合とregistry versionから同一normalized exact setとdigestを生成し、
current baseline、観測値、欠測、予測を別fieldにする。

## UIL-FR-002 findingの適格化と改善候補

### UIL-R-03 finding適格化、dedupe、expiry

invariant violation、同種finding再発、metric budget超過、悪化傾向、duplicate／orphan／cycle増加、release boundary、
provider changeを発火条件とする。scheduled実行は長期間eventがない場合のsafety-netに限定する。同一原因・scope・
baselineの候補を重複生成せず、expiry、supersession、counterevidenceを保持する。

### UIL-R-04 UniversalImprovementCandidateV1

候補は少なくともcandidate ID、source event IDs、evidence snapshot digest、baseline／observed revision、detector ID／
version、invariant IDs、finding class、confidence／counterevidence、影響するRequirement／Design／Contract／Module／
V-pair、提案change set、期待効果、cost、risk、影響範囲、意味同一性、system change class、
capability expansion kind、workflow route、verification obligations、rollback、human decision、expiryを別fieldへ束縛する。

```yaml
required_fields:
  - candidate_id
  - source_event_ids
  - evidence_snapshot_digest
  - baseline_revision
  - observed_revision
  - detector_id
  - detector_version
  - invariant_ids
  - finding_class
  - confidence_and_counterevidence
  - affected_requirements
  - affected_designs
  - affected_contracts
  - affected_modules
  - affected_v_pairs
  - proposed_change_set
  - expected_benefit
  - expected_cost
  - risk_and_blast_radius
  - semantic_parity_status
  - system_change_class
  - capability_expansion_kind
  - workflow_route
  - verification_obligations
  - rollback_contract
  - human_decision_required
  - expiry
```

## UIL-FR-003 semantic impactと全体最適評価

### UIL-R-05 意味とsystem全体への影響

価値、挙動、受入、責務、ownership、公開境界、trace、結合度、変更増幅、
verification cost、defect escape、migration costへの影響をstable IDで算出する。意味変更を意味保存refactorとして
扱わず、影響不明は推測せずhuman decisionまたはfail-closeへ送る。

### UIL-R-06 反実仮想と全体最適評価

current baseline、提案後予測、反例、局所効果、他Module／V-pair／consumer／security／operationへの副作用、rollbackを
比較する。LOC、Issue数、test時間、file数など単一metricだけで採用せず、局所改善と全体悪化が同時に起きる候補を
`adopted`へ昇格しない。予測を実測完了証拠として扱わない。

## UIL-FR-004 既存workflowへのbackflow

### UIL-R-07 typed改善配車

`system_change_class`、`capability_expansion_kind`、`workflow_route`を同一enumへ畳み込まない。意味保存整理は
REFACTORING、要求・価値・挙動・AC変更はRequirement Re-entry／REDESIGN、実装・運用誤りはRECOVERY／REVERSE／
RETROFIT／REFACTOR、性能・CI・resourceはPERFORMANCE_REFACTOR、新能力はADD_FEATURE、外部技術driftは
Technology Environment Reconciliationへ送る。曖昧な候補を推測配車しない。

### UIL-R-08 authority書込guard

発火と候補生成はauthority write、Requirement／Definition変更、実装、merge、publish、cutoverを直接実行しない。
route先のPLAN、V-pair、approval、review、CI、rollback契約を再利用し、#1037 whole-system plannerのcurrent write parkingを
解除しない。

## UIL-FR-005 変更検証と効果測定

### UIL-R-09 change検証と効果測定

候補に束縛したverification obligations、before／after、cost、side effect、rollback readiness、観測windowを同一scope、
revision、artifact digestで比較する。局所green、件数減少、agent自己評価だけで効果を確定しない。

### UIL-R-10 terminal outcome管理

`adopted`、`rejected`、`superseded`、`no_action`、`escalated`を別々のterminal outcomeとして理由、counterevidence、
receipt digest付きで保持する。candidate生成、route決定、change mergeをterminalへ丸めず、rejected／no_actionも同一候補を
無限再生成しないためのdedupe evidenceにする。

## UIL-FR-006 recipe昇格と再発監視

### UIL-R-11 recipe昇格

改善recipeは複数episode、異なるscope、counterexample、mutation、benchmark、version、applicability、expiry、rollbackが
揃った場合だけcandidate化する。単一project成功やAI評価をgeneral ruleへ昇格しない。rule promotionは既存System
Synthesisのhuman review境界に従う。

### UIL-R-12 再発監視

adopted後も同一invariant、finding class、scope、release／operation windowを監視し、再発、効果消失、副作用、environment
driftを新しいevidenceとして元episodeへ因果接続する。再発時は過去の成功receiptで相殺せず、新baselineから再評価する。

## UIL-FR-007 決定性、再構築、AI非依存

### UIL-R-13 決定的projectionとreplay

同一repo authority、source registry、event journal、baseline revisionからcandidate、route、verification obligation、terminal
projectionの同一exact set／digestを再構築する。DB削除、event順序変更、retry、at-least-once deliveryで意味が変わらず、
欠落eventとdigest driftを拒否する。

### UIL-R-14 AI非依存control境界

AI proposalを除去してもobservation、qualification、candidate、route、verification、terminal stateが成立する。AI出力を
採用する場合もsource、model、session、prompt／context digest、candidate HEAD、scope authorityをreceiptへ束縛し、
決定的detector evidenceと区別する。

## 1. 正規state machine

```text
OBSERVED
→ NORMALIZED
→ BASELINE_COMPARED
→ FINDING_QUALIFIED
→ ROOT_AND_IMPACT_CLASSIFIED
→ IMPROVEMENT_CANDIDATE_PROPOSED
→ COUNTERFACTUAL_EVALUATED
→ ROUTED
→ CHANGE_VERIFIED
→ OUTCOME_MEASURED
→ RECIPE_CANDIDATE
→ RECURRENCE_MONITORED
→ TERMINAL
```

順序飛越、別baseline／HEAD／scopeの証拠混載、予測から効果確定、terminal outcomeの上書きを拒否する。

## 2. 責務分割

| Slice | 責務 |
|---|---|
| UIL-01 | L3／L10 authorityとsource registry |
| UIL-02 | 観測正規化／baseline比較 |
| UIL-03 | finding適格化／dedupe／expiry |
| UIL-04 | 意味影響／候補合成 |
| UIL-05 | 反実仮想／全体最適evaluator |
| UIL-06 | 既存routeへのbackflow接続 |
| UIL-07 | before-after／recipe／再発projection |
| UIL-08 | HELIX自身でのE2E dogfood |

実装はUIL-01→02→03→04→05→06→07→08の依存順とし、各sliceを別PLAN／原子的PRへ分ける。

## 3. 非対象

- 新しいUniversal Improvement routeの追加。
- AI間Infinity Loop、resident lane、review orchestrationの再実装。
- AIによるRequirement、Design、merge、completionの自己承認。
- #1037 whole-system plannerのcurrent write昇格。
- production変更、publish、cutoverのapproval代替。
