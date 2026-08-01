---
title: "Development model runtime routing 詳細設計"
layer: L5
kind: add-design
status: draft
created: 2026-08-01
updated: 2026-08-01
owner: SE / TL
plan: PLAN-L5-83-development-model-runtime-routing
pair_artifact: docs/test-design/helix/L8-development-model-runtime-routing-unit-test-design.md
related_l4: docs/design/helix/L4-basic-design/pillar-basic-design.md
---

# Development model runtime routing 詳細設計

## 1. 責務と境界

`development-model-runtime-routing`は、PLANとskill metadataの直交4軸を型検証し、DB、推薦、
current-location、CLIへ同じ意味で投影する。development styleをworkflow kind、case、変更経路、専門工程、
runtime modeから推定してはならない。

この責務はskill本文の意味backfill（Issue #322）とactive Bun command撤去（Issue #253）を行わない。
旧`drive_models`と`scrum_type`は既存artifactを読むcompatibility inputに限定し、current projectionを生成しない。

## 2. Value object

```ts
type DevelopmentStyle =
  | "FULL_L1_L12_V"
  | "PRODUCTION_SCRUM"
  | "V_DESIGN_SCRUM_IMPLEMENTATION";

type CaseDrivenModel = "Discovery" | "PoC";

type ChangeRoute =
  | "Reverse"
  | "Recovery"
  | "Incident"
  | "Refactor"
  | "Retrofit"
  | "Add-feature"
  | "version-up"
  | "Research";

type AdmittedSpecialistProcess = string & { readonly __specialistProcess: "admitted" };
type SpecialistProcess = "Design HARNESS" | AdmittedSpecialistProcess;

type ParsedRuntimeRoutingAxes = {
  developmentStyleCandidates: readonly DevelopmentStyle[];
  caseDrivenModel: CaseDrivenModel | null;
  changeRoute: ChangeRoute | null;
  specialistProcesses: readonly SpecialistProcess[];
  compatibilityInputs: readonly string[];
};

type RuntimeRoutingAxes = {
  developmentStyle: DevelopmentStyle;
  caseDrivenModel: CaseDrivenModel | null;
  changeRoute: ChangeRoute | null;
  specialistProcesses: readonly SpecialistProcess[];
  compatibilityInputs: readonly string[];
};

type SkillApplicability = {
  layers: readonly string[];
  developmentStyles: readonly DevelopmentStyle[];
  caseDrivenModels: readonly CaseDrivenModel[];
  changeRoutes: readonly ChangeRoute[];
  specialistProcesses: readonly string[];
};
```

`ParsedRuntimeRoutingAxes`はparse段だけの表現である。current projection／recommendationへ渡す前に、L6正本の
`projectWorkflowAxes(WorkflowAxisInput) => WorkflowAxisProjection`を呼び、`RuntimeRoutingAxes`へ解決する。
style候補はexactly oneへ解決し、unknown／複合／分類衝突は`FULL_L1_L12_V`へfail-closeする。
parse途中の未選択をcurrent projectionへ流してはならない。候補空集合はcurrent task packetとして
non-admitとし、`projectWorkflowAxes`へ渡さずaxis加点0でfail-closeする。候補空集合をFull Vへ補完しない。

projection cardinalityは`developmentStyle=exactly 1`、`caseDrivenModel=0..1`、`changeRoute=0..1`、
`specialistProcesses=0..N`とする。case／change routeの非発動はTypeScriptとcurrent JSONで`null`、
SQLite TEXT列で空文字を正本表現とし、文字列`"none"`をcurrent値として出力しない。skill metadataでは
`development_styles=1..3`をcurrent recommendation admissionの必須条件とする。
旧route／layer名は`compatibilityInputs`へ隔離し、L6 `projectWorkflowAxes`がcurrent fieldへ変換しない。
specialist processのregistry admissionとbrand付与もL6が解決し、L5 parseは未admitted文字列をcurrent projectionへ渡さない。
L4に残る文字列`none`は移行中のcompatibility inputとしてだけ読み、case／change routeのcurrent projectionでは
`null`へ正規化する。`none`をcurrent enum、DB token、CLI receiptへ再出力しない。

## 3. Authoring／parse契約

### 3.1 PLAN frontmatter

current fieldは`development_style`、`case_driven_model`、`change_route`、`specialist_processes`とする。
既存PLANの段階移行中はoptional parseを許すが、欠落をplan ID、`kind`、`route_mode`、`workflow_phase`から
補完しない。current task packetとしてadmitする場合だけL6 `projectWorkflowAxes`へ候補を渡し、styleを
exactly oneへfail-close解決する。compatibility-only PLANをcurrent recommendation入力へ昇格させない。
新規PLAN template／generatorは4 fieldを明示出力する。

`kind=poc`と`workflow_phase=S0..S4`はDiscovery／PoC case lifecycleでありScrum phaseではない。
currentの仮説分類は任意`case_type`へ置く。旧`scrum_type`はparseできるが、S3/S4の必須条件、
current receipt、DB projection、推薦理由へ使わない。

### 3.2 skill metadata

current `applies_to`は次を使う。

```yaml
applies_to:
  layers: [L5, L8]
  development_styles: [FULL_L1_L12_V, PRODUCTION_SCRUM, V_DESIGN_SCRUM_IMPLEMENTATION]
  case_driven_models: [Discovery, PoC]
  change_routes: [Add-feature]
  specialist_processes: []
```

旧`drive_models`はcompatibility parserが妥当性検査にだけ使用する。`development_styles`欠落skillは
`compatibility_only`であり、legacy値を変換してcurrent recommendationへ入れない。`SKILL_MAP.md`は
`compatibility_index`として非recommendableを維持する。

## 4. DB projection

`plan_registry`へ次の列を追加する。

- `development_style`
- `case_driven_model`
- `change_route`
- `specialist_processes`

`automation_assets`へ次の列を追加する。

- `applies_development_styles`
- `applies_case_driven_models`
- `applies_change_routes`
- `applies_specialist_processes`

配列はtrim、重複除去、lexicographic sort後のCSVとする。旧`applies_drive_models`列はmigration互換のため
物理schemaに残せるが、current rebuildでは空文字を記録し、current query、search token、recommendation、
current-location、CLI responseへ選択しない。schema revisionを1だけ進め、rebuild/replayの同一digestを要求する。

## 5. Recommendation契約

推薦入力は`RuntimeRoutingAxes + layer + technical drive + kind`である。technical `drive`は専門職選択であり、
skill applicability axisではない。

1. `applies_development_styles`が空のskillをcurrent candidateから除外する。
2. development style一致、case一致、change route一致、specialist intersection、layer一致を独立加点する。
3. 不一致fieldを別axis一致で相殺しない。特に旧`drive_models`一致は0点である。
4. reason／receiptは`development_style`、`case_driven_model`、`change_route`、
   `specialist_processes`、`layer`だけを出し、`drive_model`を出さない。
5. PLANに4軸が無ければ暗黙推定せず、axis加点0でfail-closeする。

## 6. Current-location／CLI契約

`ProjectSkillBinding`はL6 `WorkflowAxisProjection`と同型の`routingAxes`を持ち、itemは次を返す。

- `matchedDevelopmentStyles` / `sourceDevelopmentStyles`
- `matchedCaseDrivenModels` / `sourceCaseDrivenModels`
- `matchedChangeRoutes` / `sourceChangeRoutes`
- `matchedSpecialistProcesses` / `sourceSpecialistProcesses`
- `matchedLayers` / `sourceLayers`

JSONは対応するsnake_case fieldを返す。`selected_model`、`workflow_modes`、`matched_drive_models`、
`source_drive_models`をskill-binding current responseへ出力しない。projectのhistorical drive-model view自体は
別責務として残せるが、sourceはcompatibility parserが原artifactから得たread-only材料に限る。
空文字化したcurrent DB列をsourceにせず、skill選択のcurrent authorityにしてはならない。

## 7. 実装exact inventory

| owner | path | 変更責務 |
|---|---|---|
| field schema | `src/schema/index.ts` | 4軸とcase typeのenum |
| PLAN parser | `src/schema/frontmatter.ts` | current field parse、PoC／scrum_type分離 |
| skill lint | `src/lint/skill-assignment.ts` | current／compatibility disposition |
| authoring | `src/skill-engine/scaffold.ts` | current fieldだけ生成 |
| CLI authoring／receipt | `src/cli.ts` | current option／JSON field |
| asset projection | `src/assets/catalog.ts` | current metadata列 |
| recommendation | `src/skills/recommend.ts` | 4軸scoreとlegacy polarity |
| DB schema | `src/schema/harness-db.ts` | schema revision |
| DB tables | `src/schema/harness-db-tables-core.ts` | PLAN／asset current列 |
| rebuild | `src/state-db/projection-writer.ts` | current PLAN／asset／recommendation projection |
| current location | `src/state-db/current-location.ts` | current skill binding |
| view contract | `src/schema/visualization-current-location-contract.ts` | current JSON schema |
| view model | `src/state-db/visualization-view-model.ts` | current field mapping |
| tree view | `src/vmodel/visualization-tree-projector.ts` | current field label |
| oracle | existing matching tests | exact-set／polarity／legacy-output mutation |

この14 source外の責務が必要になった場合は現在PRへ混載せずsuccessor Issueへ送る。

## 8. 状態遷移とerror

| 入力 | disposition | current recommendation | error/finding |
|---|---|---:|---|
| current field valid | `current` | 可 | なし |
| current field unknown | `invalid_current` | 不可 | unknown field value |
| `development_styles`欠落、legacyあり | `compatibility_only` | 不可 | backfill pending (#322) |
| current/legacy両方欠落 | `invalid_current` | 不可 | missing current applicability |
| legacy unknown | `invalid_compatibility` | 不可 | unknown legacy value |
| `SKILL_MAP.md` | `compatibility_index` | 不可 | なし |

current DB／CLIにlegacy fieldが1件でも出た場合、またはlegacy-only skillが推薦された場合はfail-closeする。
