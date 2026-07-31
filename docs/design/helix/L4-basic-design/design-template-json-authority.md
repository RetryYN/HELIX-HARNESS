---
title: "Design Template JSON authority基本設計"
layer: L4
artifact_type: design
status: draft
created: 2026-07-31
updated: 2026-07-31
owner: SE
plan: docs/plans/PLAN-L4-55-design-template-json-authority.md
pair_artifact: docs/test-design/helix/L4-design-template-json-authority-system-test-design.md
related_l3: docs/design/helix/L3-requirements/requirement-discovery-json-authority.md
---

# Design Template JSON authority基本設計

## §1 目的とauthority境界

Requirement JSONから必要十分な設計成果物を選べるよう、templateの構造的意味をversioned JSONへ
集約する。文章をJSONへ詰め込むのではなく、機械判断に必要な契約だけをJSON正本とする。

| surface | 責務 | authority |
|---|---|---|
| Design Template JSON | template ID/version、layer/pair、適用条件、必須input/section/field、owner、trace、negative oracle、measurement、completion、downstream kind | canonical candidate。pair freeze後にcanonical |
| Design Instance JSON | 選択済みtemplateとrequirement/obligationを束縛した設計値 | 後続L5 episode |
| graph JSON | component、state transition、data flow、sequence、V-pair edge | 図の構造的意味 |
| generated Markdown/HTML/Mermaid | JSONを人間向けに投影 | derived、直接編集禁止 |
| supplemental Markdown | rationale、alternatives、trade-off、背景 | JSON IDへ束縛する説明。構造的意味の正本ではない |
| `docs/design/design-catalog.yaml` | 現行成果物の所在と分類 | inventory。template schemaではない |

画像、Markdown、tool node ID、file pathだけをtemplate identityや設計意味の主キーにしない。

## §2 component境界

| component | 入力 | 出力 | 責務 | failure |
|---|---|---|---|---|
| `DesignTemplateRegistry` | versioned template JSON | exact template set、registry digest | ID/version/supersessionとschema束縛 | duplicate、unknown version、digest drift |
| `ApplicabilityEvaluator` | requirement atom、obligation、risk、style/layer、typed predicate | applicable/non-applicable＋理由 | `all`/`any`/`not`のfail-close評価 | unknown operator/field/enum、自由文条件 |
| `TemplateShadowCompiler` | 既存template/canonical design inventory | shadow template候補、parity finding | 既存意味を新正本候補へ一方向変換 | 未分類、意味欠落、二重authority |
| `GeneratedViewProjector` | validated template/instance/graph JSON | Markdown/HTML/Mermaid＋source digest | 決定論表示 | source digest不一致、直接編集 |
| `DesignPortfolioPlanner` | Requirement JSON、Design Obligation Graph、registry | reuse/delta/new/N/A proposal | 最小portfolio提案 | uncovered、duplicate、fabricated ID |
| `PairGraphBinder` | selected template/instance、V-pair oracle | L4↔L9、L5↔L8 graph | pair exact setとcompletionを束縛 | missing pair、別revision、stale oracle |

本sliceはcomponent契約だけを定義する。schema/runtime、planner algorithm、instance生成、pair graph
freezeは後続L5/L6 episodeで実装する。

## §3 主要data flow

```text
Requirement JSON
  -> Design Obligation Graph
  -> DesignPortfolioPlanner
  -> selected Design Template JSON exact set
  -> Design Instance JSON
  -> pair graph / Test Design JSON
  -> generated Markdown / HTML / Mermaid
```

back-propagationはfindingまたはproposal eventとしてRequirement Engine／template revisionへ戻す。
generated viewや既存Markdownを読んでJSONを無断更新するreverse flowは禁止する。

## §4 applicabilityとcompletionの型境界

適用条件は自由文booleanでなく、次の閉じた式木を使う。

```json
{
  "all": [
    { "field": "layer", "op": "eq", "value": "L4" },
    {
      "any": [
        { "field": "risk.security", "op": "eq", "value": true },
        { "field": "artifact_kind", "op": "contains", "value": "interface" }
      ]
    },
    { "not": { "field": "disposition", "op": "eq", "value": "rejected" } }
  ]
}
```

field、operator、value type、enumはschema registryのallowlistで閉じる。unknownは`false`へ丸めず
evaluation errorとしてfail-closeする。N/Aはreason、authority、re-evaluation triggerを必須にする。

template completionは少なくとも次のexact setを持つ。

- 必須section／fieldのcoverage
- requirement/obligation trace
- negative oracle
- measurement/thresholdまたは根拠付きN/A
- V-pair edge
- unresolved item 0、またはowner/re-entryを持つ明示defer
- source/template/instance revision digest一致

## §5 shadow移行と旧定義境界

移行は`inventory -> shadow compile -> semantic parity -> consumer dual-read -> atomic cutover`の順とする。
shadow期間中のcurrent authorityは既存artifactであり、JSON候補は完成主張に使わない。cutover後はJSONを
current authorityとし、既存Markdownをgenerated/supplementalへ降格する。

canonicalとlegacyを同じenumや成功判定へ混在させない。legacy側greenでJSON側failureを相殺せず、
JSONから生成したviewと既存artifactの意味差分をfindingとして残す。`design-catalog.yaml`はcutover後も
artifact inventoryとして再利用できるが、template fieldやapplicabilityの判断正本にはしない。

## §6 設計リファクタリングゲート

L4 close前に、機能・性能・right-arm oracleを維持したまま次を減らせないか検査する。

- component、registry、schema、状態、正本の数
- 同義template、重複field、重複diagram、手書きview
- 新規code、adapter、DB table、detector

判定順は`no_change -> delete -> configure -> reuse -> modify -> add_code`とする。本設計では既存
Requirement JSON connectorと`design-catalog.yaml` inventoryを再利用し、新DB table、provider、
diagram engine、別Requirement Engineを追加しない。削減不能な追加だけを後続PLANで理由・削除条件付きにする。

## §7 episode境界

1. L4↔L9: 本component、authority、data flow、system反例
2. L5↔L8: schema field、predicate文法、state/error、shadow parityのalgorithm
3. L6↔L7: schema validatorとshadow compilerのTDD実装
4. 後続atomic slice: Portfolio Planner、Design Instance/view生成、pair graph freeze
