---
title: "L8 Derived requirement trace 詳細単体テスト設計"
layer: L8
executed_at_layer: L7
sub_doc: detail-test-design
artifact_type: test_design
status: confirmed
created: 2026-08-14
updated: 2026-08-14
pair_artifact: docs/design/helix/L5-detail/derived-requirement-trace.md
---

# L8 Derived requirement trace 詳細単体テスト設計

transition、artifact、reverse index、placement、pair edgeのcardinalityを個別にmutationし、集合差が0でない
graphを拒否する。statusを`confirmed`へ変更した派生候補、revision/snapshotを1件だけ変更したedge、
重複placementと欠落pairをnegative fixtureにする。
