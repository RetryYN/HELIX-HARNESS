---
title: "CLI typed workflow identity projection"
layer: L6
artifact_type: design
status: confirmed
created: 2026-08-28
updated: 2026-08-28
owner: Codex / TL
authority: docs/governance/helix-harness-requirements_v1.3.md
plan: docs/plans/PLAN-L7-698-cli-workflow-identity-projection.md
pair_artifact: docs/test-design/helix/L8-cli-workflow-identity-projection-unit-test-design.md
---

# CLI typed workflow identity投影設計

## 目的

`helix drive model`、`helix recovery plan`、completion frontier、Project frontier／tree viewのcurrent outputを、current-location composition boundaryで
検証済みのtyped workflow identityへ一方向投影する。旧`selected_model`、`default_model`、
`available_models`、`drive_model`をcurrent identityとして再出力しない。

## 入力契約

- 入力は`workflowIdentity`と`workflowIdentityReceipt`のexact pairとする。
- identityは`registry_version`、`registry_source_digest`、`target_axis`、`target_id`を必須とする。
- receiptのidentity、version、digest、axis、IDがpairと一致しなければfail-closeする。
- legacy modelからCLI内部でidentityを再推測しない。

## 出力契約

- JSONとsummary、およびそれらを包むfrontier／tree viewは`workflow_identity`をcurrent primary identityとして返す。
- textは`axis:id`とregistry versionを表示し、旧model名をidentity labelとして表示しない。
- candidate、availability、default等の旧workflow model集合をcurrent outputへ残さない。
- provider model、specialist drive、skill applicabilityは別schema／別ownerに保持し、本value objectへ入れない。

## 失敗契約

partial tuple、unknown axis／ID、stale digest、identity／receipt不一致は、空値やForwardへ丸めず
`cli_workflow_identity_invalid`としてfail-closeする。legacy outputのgreenでcanonical failureを相殺しない。

## 移行境界

本sliceはdrive-model reportの内部compatibility producerを即時削除しないが、CLI current outputからは完全に
隔離する。completion frontier／Project frontier／tree viewが旧producerを再包装する経路も同じcurrent-output
境界として閉じる。skill bindingは#1044/#1059、vmodel fit内部判定は#1125の後続sliceが所有する。

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": ["cli_workflow_identity_invalid"],
  "assets": [
    "src/workflow/cli-workflow-identity-projection.ts",
    "tests/cli-workflow-identity-projection.test.ts",
    "tests/cli-surface.test.ts"
  ],
  "failure_reachability": [
    {
      "failure_code": "cli_workflow_identity_invalid",
      "oracle_id": "U-CLIWI-004",
      "test_path": "tests/cli-workflow-identity-projection.test.ts"
    }
  ]
}
```
