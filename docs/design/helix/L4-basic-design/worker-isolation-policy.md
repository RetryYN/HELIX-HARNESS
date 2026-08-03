---
title: "worker isolation policy基本設計"
layer: L4
artifact_type: design
status: confirmed
created: 2026-08-03
updated: 2026-08-03
owner: SE
plan: docs/plans/PLAN-L4-63-worker-isolation-policy.md
pair_artifact: docs/test-design/helix/L9-worker-isolation-policy-system-test-design.md
related_l3: docs/design/helix/L3-requirements/worker-common-contract.md
github_issue_id: 226
behavior_contract_id: WCC-FR-04
responsibility_owner: worker-isolation-policy
---

# worker isolation policy基本設計

## 1. 境界

`WorkerIsolationPolicy`は、封印済みwrapper identityへtask sensitivity、write scope、egress policyを束縛する。
`secret`／`unknown` task、実tokenを含むpayload、非empty egress allowlist、曖昧scopeはprocess起動前に拒否する。
許可済みtaskもLinux network namespaceを必ず分離し、実行後はrepo外scratchのadd／modify／deleteだけを
exact pathまたは境界付きdirectory prefixと照合する。違反時はstdoutや変更内容を返さず失敗する。

```text
sealed wrapper + sensitivity + exact write scope + deny-all egress
  -> policy attest (failureならspawn 0)
  -> FR-03 broker launch + --unshare-net
  -> scratch post-state scan
  -> scope内だけsuccess / scope外はgeneric failure
```

## 2. component

| component | authority | fail-close |
|---|---|---|
| policy attestor | wrapper object identity＋`origin_digest` | copied wrapper、secret／unknown、実token |
| egress boundary | deny-all policy＋bubblewrap network namespace | host allowlist要求、`--unshare-net`欠落 |
| write scope | normalized repo-relative exact／directory prefix | absolute、`..`、git/state/DB、曖昧prefix |
| post-state auditor | bounded `O_NOFOLLOW` byte scan | scope外add/modify/delete、symlink、特殊file、上限超過 |

## 3. 設計リファクタリング

provider別policy service、firewall ledger、第二sandboxを作らず、policy module 1件を既存brokerへ接続する。
egress allowlistはproxy／namespace firewall authorityが存在しないため未実装を明示して拒否し、prose allowlistで代替しない。
FR-05/06のoutput schema再検証、lifecycle receipt、canonical promotionは本sliceへ含めない。

## 4. 設計実在性束縛

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": [],
  "assets": [
    {
      "asset_id": "worker-isolation-policy",
      "classification": "existing_runtime",
      "artifact_path": "src/runtime/worker-isolation-policy.ts",
      "resource_kind": "typescript_export",
      "resource_name": "attestWorkerIsolationPolicy",
      "source_digest": "sha256:adad070f800e3417cf3a5a3ff9c4978ecbc2b300a3279334cfb0876d8e3d4d4c",
      "current_authority": true
    }
  ],
  "failure_reachability": []
}
```
