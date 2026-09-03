---
title: "GitHub Issue native graph provider 詳細設計"
canonical_layer_scheme: L1-L12
layer: L5
paired_layer: L8
status: draft
plan: docs/plans/PLAN-RECOVERY-104-issue-native-graph-provider.md
pair_artifact: docs/test-design/helix/L8-github-issue-native-graph-provider-unit-test-design.md
behavior_contract_id: ISSUE-NATIVE-GRAPH-PROVIDER-001
responsibility_owner: issue-hierarchy
---

# GitHub Issue native graph providerの詳細設計

## 1. 目的

GitHub nativeのparent、sub-issue、blocked-by、blockingをprovider adapter境界で取得し、
`IssueNativeGraphSnapshot`へ正規化する。本文authorityとの比較や判断はproviderへ持ち込まない。

## 2. Query契約

repositoryとIssue番号はGraphQL query本文へ埋め込まず、owner、name、numberのtyped variableとして渡す。
Issue stable node IDと4面graphを同じreadで取得する。repository identityとIssue番号は入口で検証する。

## 3. Pagination境界

各connectionは最大100件の最初のpageと`hasNextPage`を取得する。`hasNextPage=true`を空集合や
取得完了へ変換せず、対応する`*Complete=false`としてprojection auditへ渡す。後続bounded pagination
sliceが全pageを収集するまでconvergedにはできない。

## 4. Fail-close方針

runner非0、JSON不正、repository／Issue欠落、stable ID欠落、Issue番号不一致、connection／node／pageInfo
不正を個別errorとして拒否する。stderrやresponse本文をreceiptへ転記しない。

## 5. 設計実在性束縛

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": [],
  "assets": [
    {
      "asset_id": "github-issue-native-graph-provider",
      "classification": "existing_runtime",
      "artifact_path": "src/runtime/github-issue-native-graph-provider.ts",
      "resource_kind": "typescript_export",
      "resource_name": "loadGitHubIssueNativeGraphSnapshot",
      "source_digest": "sha256:6bff05d5266c4faa4630bcb62483e37a3a5de7d519357305d5b5ea0ff49e8c7e",
      "current_authority": true
    }
  ],
  "failure_reachability": []
}
```
