---
feature_ticket_id: FT-OS-REQCLASS-001
title: "HELIX-OS要求分類projection"
product_target: HELIX-OS
state: proposed_upstream_waiting
priority_order: 3
created: 2026-09-15
authority_effect: work_projection_only
parent_requirements:
  - HELIXOS-L2-001
  - HELIXOS-L2-002
  - HELIXOS-L2-005
  - HELIXOS-L2-007
  - HELIXOS-L2-013
acceptance_source: docs/helix-os/L11-acceptance/governance-acceptance.md
depends_on:
  - FT-OS-REQREG-001
  - FT-HARNESS-REQENG-001
---

# FT-OS-REQCLASS-001: HELIX-OS要求分類projection

## 目的

FT-OS-REQREG-001が保持する意味未分類の原eventへ、HARNESS要求エンジンが生成した要求候補、分類、relation、
企画との齟齬をversioned projectionとして関連付ける。原eventを書き換えず、engine／schema／製品pack更新時に
旧分類を履歴として残して再分類できるようにする。

## 分類projection

分類結果は少なくとも次を持つ。

- source event ID、causal ID、対象project／product、Concept／L1 revision。
- engine version、semantic contract version、schema version、product pack version、実行時点。
- `unit`、`connection`、`composite`または`unresolved`のkind候補とconfidence／根拠。
- subject identity候補と`contains`、`connects`、`depends_on`、`constrains`、`verified_by`のrelation候補。
- 企画価値の要求化漏れ、企画外追加、対象違い、scope／non-goal逸脱、矛盾、質問。
- 人間の訂正・採否、supersede先、stale理由、再分類対象revision。

## 境界

- 分類projectionは要求正本、人間合意、L3承認、操作許可ではない。
- 原eventを分類結果で上書きせず、旧分類を削除して履歴を整合させない。
- unknownを既知kindへ補完せず、複数候補や分類不能を保持する。
- engine自己評価だけでconfidence、改善、正解を確定しない。
- 分類層は要求意味を独自実装せず、HARNESS semantic contractとengine出力を参照する。

## 降下順序

1. FT-OS-REQREG-001の原event identityと因果接続をfreezeする。
2. FT-HARNESS-REQENG-001のsemantic output contractをfreezeする。
3. L3でprojection identity、version join、stale／supersede／reclassification contractを定義する。
4. L10でengine版変更、schema変更、分類競合、wrong product、原event欠落、重複、部分投影を検証する。
5. Node／TypeScript境界で検証してprojectionをcommitし、原eventと分類結果をread-afterする。

現在はticket発行だけを行い、分類schema、DB、engine、runtime、CIを実装・起動しない。
