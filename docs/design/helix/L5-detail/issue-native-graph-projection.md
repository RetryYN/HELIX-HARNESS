---
title: "Issue native graph projection 詳細設計"
canonical_layer_scheme: L1-L12
layer: L5
artifact_type: detail_design
status: confirmed
created: 2026-09-03
updated: 2026-09-03
owner: Codex / TL
plan: docs/plans/PLAN-RECOVERY-103-issue-native-graph-projection.md
pair_artifact: docs/test-design/helix/L8-issue-native-graph-projection-unit-test-design.md
---

# Issue native graph projection 詳細設計

## 1. 目的

Issue本文のversioned hierarchy／dependency contractを意味正本に保ったまま、GitHub nativeの
parent／sub-issue／dependencyをread-side projectionとして比較する。GitHub側の値から本文authorityを
補完推測せず、差分をtyped findingとして後続Recoveryへ渡す。

## 2. 入出力

入力は`IssueHierarchyNode[]`と、adapterが取得・正規化した`IssueNativeGraphSnapshot[]`である。
native snapshotはstable node ID、Issue番号、parent、sub-issue、blocked-by、blocksに加え、各ページ取得の
完了状態を必須とする。出力はschema、検査件数、graph digest、sorted finding exact setを持つ。

## 3. Authority境界

- desired graphは本文contractだけから構成する。
- child exact setは各Issueの`parent_issue`を逆引きして導出する。
- dependency exact setは本文の`blocked_by`／`blocks`を使用する。
- native graphは観測projectionであり、本文contractを書き換えない。
- native Issue欠落、stable ID欠落／衝突、pagination不完了時はfail-closeする。
- 入力順と重複edgeはcanonicalizationし、同じ意味graphへ同じdigestを返す。

## 4. Finding分類

parent、child、dependencyのmissing／extraを別codeに分ける。parentの両側不一致も、body parent欠落、
native-only parent、異なるparentへ分離する。取得不完全をedge欠落の成功として扱わず、
`native_snapshot_incomplete`を必ず残す。

## 5. 後続境界

本sliceはread-only比較までを所有する。GitHub write、read-after、部分成功receipt、DB projection、scheduled
repository-wide auditは後続sliceでこのreportを再利用して実装する。

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": [],
  "assets": [
    {
      "asset_id": "issue-native-graph-projection",
      "classification": "existing_runtime",
      "artifact_path": "src/runtime/issue-hierarchy.ts",
      "resource_kind": "typescript_export",
      "resource_name": "auditIssueNativeGraphProjection",
      "source_digest": "sha256:2792eb135bce4c22628317181ac028c99e2b538226b63fbd8bb198087a53670a",
      "current_authority": true
    }
  ],
  "failure_reachability": []
}
```
