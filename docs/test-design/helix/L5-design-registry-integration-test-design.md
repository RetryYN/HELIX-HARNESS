---
title: "Design Registry L8結合テスト設計（L5 pair）"
layer: L5
sub_doc: integration-test-design
artifact_type: test_design
executed_at_layer: L8
kind: add-design
status: draft
created: 2026-08-07
updated: 2026-08-07
owner: QA
pair_artifact: docs/design/helix/L5-detail/design-registry.md
github_issue_id: 177
---

# Design Registry L8結合テスト設計（L5 pair）

L5詳細設計 `docs/design/helix/L5-detail/design-registry.md` §1-§3 を正本とし、
canonicalize → validate → transaction → trace query の結合経路を検査する。

| IT-ID | 対象 | oracle（反例と期待結果） |
|---|---|---|
| IT-DRG-001 | intake 合流 | screen_design/frontend_design 由来宣言と design_bottomup 由来宣言（design-elicitation の screen 型）が同一 intake schema で canonicalize され、既存 `screens`/`screen_trace` 由来 screen ノードと ID 空間が重複しない。file path を entity_id にした宣言は fail-close |
| IT-DRG-002 | trace 閉包 | requirement→screen→interaction→service[permission]→service[command]→service[api]→domain_object→analytics_event→acceptance の直列 chain が双方向に閉じ、1 edge を欠落させると `DRG_CHAIN_ORPHAN` で orphan 集合へ現れる。permission を経ずに command/API へ到達する宣言は `DRG_UNGUARDED_INVOKE` で拒否される。stale entity を含む chain は closed と判定しない |
| IT-DRG-003 | transaction 往復 | shadow→canonical 昇格 commit 後の registry から trace query が決定的同値を返し、期待 head 不一致の並行 commit は CAS で拒否され増分 0。上流 digest 変更で stale lineage が edge まで伝播する |

単体 oracle（U-DRG-001〜007）は L6 側の単体テスト設計
`docs/test-design/helix/L6-design-registry-unit-test-design.md` に置き、本設計は結合経路のみを持つ。
