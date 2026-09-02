---
title: "worker wrapper admission関数設計"
layer: L6
artifact_type: design
status: confirmed
created: 2026-08-03
updated: 2026-08-03
owner: SE
plan: docs/plans/PLAN-L6-95-worker-wrapper-admission.md
pair_artifact: docs/test-design/helix/L8-worker-wrapper-admission-runtime-unit-test-design.md
related_l5: docs/design/helix/L5-detail/worker-wrapper-admission.md
github_issue_id: 225
behavior_contract_id: WCC-FR-02
responsibility_owner: worker-wrapper-admission
---

# worker wrapper admission関数設計

`buildWrapperAdapterPlan`は既存`buildAdapterPlan`を再利用し、module-private originへ生成時digestを保存する。
`evaluateWrapperAdmissionWitness`は4 failureを固定順で評価するpure function、`admitWrapperLaunch`は同一object identity、
provider、plan digest、invocation digestを再検証して成功時だけcapabilityとexecutionを返す。

CLI、team、pair-agent、loopは実行planを`buildWrapperAdapterPlan`で生成する。実process sinkはadmission failure時に
spawn数0で終了する。provider output、DB、sandbox、receipt、benchmark scoreは本moduleで扱わない。

production fileを増やさず、既存adapter ownerへ約120 LOCのpolicyを統合する。永続state、新service、workflowは0である。

## Provider process環境境界（Issue #1412）

外部provider CLIへ渡す環境は`process.env`の複製ではなく、実行に必要なOS／locale／provider設定rootの
allowlistから構成する。credential、GitHub token、HELIX DB／state path、未登録の追加envは子processへ
渡さない。adapter planとinvocationのdigestはenvのkeyとvalue digestを含み、seal後のenv変更をspawn前に
拒否する。provider failureの例外にはstderr本文を含めず、digestとbyte lengthだけを記録する。

## 設計実在性projection

failure exact setとwitnessの正本はL5 §5とし、L6は実装symbolのsame-HEAD実在だけを重複判断なしで投影する。

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": [],
  "assets": [
    {
      "asset_id": "wrapper-route-admission-implementation",
      "classification": "existing_runtime",
      "artifact_path": "src/runtime/adapter.ts",
      "resource_kind": "typescript_export",
      "resource_name": "admitWrapperLaunch",
      "source_digest": "sha256:6b45058468e39490baedc3f209e03fbdc0643db3807775e23be8bd8a522ddc90",
      "current_authority": true
    }
  ],
  "failure_reachability": []
}
```
