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

## 9. 設計実在性束縛

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": [],
  "assets": [
    {
      "asset_id": "skill-applicability-registry-loader",
      "classification": "existing_runtime",
      "artifact_path": "src/schema/skill-applicability-registry.ts",
      "resource_kind": "typescript_export",
      "resource_name": "loadSkillApplicabilityRegistry",
      "source_digest": "sha256:1ba5227a54543cc3ffb0a5be39bcd729c9052f9f4293e7a783dc3001b2172ac6",
      "current_authority": true
    }
  ],
  "failure_reachability": []
}
```
