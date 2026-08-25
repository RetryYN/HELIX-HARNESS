---
title: "typed skill applicability runtime routing詳細設計"
layer: L5
kind: redesign
status: draft
created: 2026-08-01
updated: 2026-08-26
owner: SE / TL
plan: PLAN-L5-83-development-model-runtime-routing
pair_artifact: docs/test-design/helix/L8-development-model-runtime-routing-unit-test-design.md
related_l4: docs/design/helix/L4-basic-design/pillar-basic-design.md
---

# typed skill applicability runtime routing詳細設計

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": [],
  "assets": [
    {
      "asset_id": "skill-applicability-value-object",
      "classification": "existing_runtime",
      "artifact_path": "src/schema/skill-applicability-registry.ts",
      "resource_kind": "typescript_export",
      "resource_name": "parseSkillApplicability",
      "source_digest": "sha256:c6ad8c561ad6308dd8e9ff15382eade4bf60474487c41f7999e7a1f43b71c6ee",
      "current_authority": true
    },
    {
      "asset_id": "skill-assignment-analyzer",
      "classification": "existing_runtime",
      "artifact_path": "src/lint/skill-assignment.ts",
      "resource_kind": "typescript_export",
      "resource_name": "analyzeSkillAssignments",
      "source_digest": "sha256:8dac5783e5f8eac45ca453c6fb3a3f1cdd74d9819ef666f1967697c3f545904c",
      "current_authority": true
    },
    {
      "asset_id": "skill-scaffold-generator",
      "classification": "existing_runtime",
      "artifact_path": "src/skill-engine/scaffold.ts",
      "resource_kind": "typescript_export",
      "resource_name": "scaffoldSkill",
      "source_digest": "sha256:f2b9d2c8d762db21b75328c241ad627ae5f6ed3d004b79201fc1b4b1a063f90a",
      "current_authority": true
    }
  ],
  "failure_reachability": []
}
```

## 0. authority変更

本設計は、旧4 field固定案の`development_styles`、`case_driven_models`、`change_routes`、
`specialist_processes`をcurrent authorityとして廃止する。current identityはL3
`skill-applicability-authority.md`と`skill-applicability-registry.v1.json`が定める
`target_axis`＋`target_id`参照であり、workflow classification registryへ存在するexact pairだけを扱う。

旧`drive_models`、`applies_drive_models`、`matched_drive_models`、4 field固定案、`scrum_type`は
compatibility inputまたはhistorical design sourceに限る。current DB、推薦理由、receipt、CLIへ再出力しない。

## 1. 値オブジェクト

```ts
type SkillApplicabilityIdentity = {
  target_axis: WorkflowClassificationAxis;
  target_id: WorkflowClassificationIdentityId;
};

type SkillApplicability = {
  applicable_identities: readonly SkillApplicabilityIdentity[];
  excluded_identities: readonly SkillApplicabilityIdentity[];
};
```

`applicable_identities`は1件以上を必須とし、暗黙のall／Forwardを持たない。
`excluded_identities`は0件以上で、positive集合と同一pairを持てない。各集合の重複、unknown identity、
axis mismatch、registryで許可されないaxisを個別にfail-closeする。

## 2. registry loader検証

`src/schema/skill-applicability-registry.ts`が次を一度に検証する。

1. skill applicability registryのschema versionとrequirements source digest。
2. workflow classification registryのversionとsource digest。
3. legacy conversion targetがcurrent classification registryの同一axisに実在すること。
4. current contractがlegacy identityを出力せず、default、重複、極性衝突をfail-closeすること。

片方のregistryだけがgreenでも受理しない。classification version-up時はskill applicability registryを
同一migration transactionで再束縛する。

## 3. authoringとcompatibility

current skill metadataは次だけを生成する。

```yaml
applies_to:
  layers: [L5, L8]
  applicable_identities:
    - { target_axis: development_style, target_id: PRODUCTION_SCRUM }
    - { target_axis: case_driven_model, target_id: DISCOVERY_POC }
  excluded_identities:
    - { target_axis: workflow_model, target_id: INCIDENT }
```

旧`drive_models`はcompatibility adapterだけが読む。一意変換可能tokenはtyped pairへ一方向変換し、
`source_field`、`normalized_token`、warningを残す。`Forward`、`Scrum`は曖昧として拒否し、unknown tokenも
推測しない。legacy-only skillは#322のbackfill完了までcurrent recommendation候補へ昇格しない。

`helix skill create`のcurrent入力は`--applicable target_axis:target_id`と任意の`--exclude`である。
`--drive-models`はcompatibility input-onlyとして一意tokenだけを変換し、typed入力との併記、`Forward`／`Scrum`、
unknown tokenをfail-closeする。scaffoldは変換元tokenをmetadataへ残さずtyped pairだけを生成する。

## 4. DB projection

`automation_assets`のcurrent projectionはregistry version／digestとpositive／negative identity集合を保持する。
identity集合は`target_axis`、`target_id`、polarityを行単位で正規化し、CSVや単一model fieldへ畳み込まない。
旧`applies_drive_models`列はmigration中に物理保持できるが、current query、search token、recommendation、
current-location、receiptの入力に使わない。

## 5. recommendation

task／PLAN側のtyped workflow identityとskill applicability pairをexact照合する。positive一致だけを候補理由にし、
negative一致は候補から除外する。別axis一致で不一致を相殺せず、legacy token一致は0点である。
receiptはclassification registry version／digest、matched typed pair、excluded typed pairだけを返す。

## 6. current-location／CLI出力

JSONとtextは`matched_identities`、`source_applicable_identities`、`source_excluded_identities`を返す。
各itemは`target_axis`と`target_id`を保持し、`matched_drive_models`、`source_drive_models`、
`selected_model`、`workflow_modes`をskill binding current responseへ出力しない。

## 7. 実装順

1. requirements-owned registry loaderとtyped value object。
2. skill assignment schema／scaffoldをtyped metadataへ切替。
3. normalized DB projectionとrebuild／replay。
4. recommendation、current-location、visualization、CLI／JSONをtyped pairへ切替。
5. compatibility adapterをinput-onlyへ隔離。
6. #322でcurrent skill metadataをexact backfill。
7. #243でauthoringからcompletionまでread-afterする。

## 8. 非対象

- #188 switching／routing／allocation。
- #635 workflow guide生成。
- HELIX-Benchによるtask適性推定。
- resident lane、provider selection、execution modeの再設計。
