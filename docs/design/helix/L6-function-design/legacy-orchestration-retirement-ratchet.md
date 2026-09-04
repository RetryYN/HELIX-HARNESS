---
title: 旧orchestration surface退役ratchet
layer: L6
artifact_type: design
status: draft
created: 2026-09-05
updated: 2026-09-05
owner: Codex / TL
plan: docs/plans/PLAN-L7-729-legacy-orchestration-new-use-freeze.md
pair_artifact: docs/test-design/helix/L8-legacy-orchestration-retirement-ratchet.md
related_l3: docs/design/helix/L3-requirements/resident-lane-orchestration-requirements.md
---

# 旧orchestration surface退役ratchet

## 責務

`team run`、`pair-agent`、旧loop bridge、team-owned slot、static capability routingを
current execution authorityとして新規拡張できないようにする。既存利用は
`compatibility_only_retirement_ratchet`としてpath単位の上限付きinventoryへ固定し、
後継へ移した利用の減少だけを許可する。

## 境界

- inventoryは旧surfaceの正当性を保証せず、退役までの既知債務だけを表す。
- historical archive、gate実装、gate test、当該PLAN／設計はcurrent consumerへ数えない。
- 別pathへの追加、同一path内の増加、重複・退化したentry、authority roleの変更を拒否する。
- 除外先は既知のarchiveと検査自身のファイルだけを許可し、空prefix、src全体、任意consumerの除外追加を拒否する。
- source HEADはinventory採取点であり、現在HEADと一致することを要求しない。
- Phase 1では既存engineを削除せず、実行挙動も変更しない。

## 後続

本検査が計測するのは既知markerの文字列出現数であり、実行consumer数ではない。
同一path内の同数置換、別名経由の呼出し、動的なcommand組立ては本検査だけでは判定できない。
したがって出現数0をconsumer 0の証拠として使ってはならない。後続phaseではCLI登録、
import／callsite、生成template、外部consumerを追跡し、successorへの移管証拠と合わせて退役を検収する。
inventory上限はcandidate自身から正当化しない。published baseから取得したinventoryと比較し、
上限増加、新規path登録、除外拡張、source HEAD差替えを拒否する。削減がpublishedされた後は
削減後の値を次の上限とし、元の上限への再増加も拒否する。
初回導入はpublished inventoryがないため、検証済み基準revisionからの採取と通常更新を区別する。
基準取得不能をcandidateへのfallbackで補わない。基準変更は別のauthority移行として扱う。
比較関数の単体greenだけでは完了しない。loader／doctorへのtrusted base接続と初回導入の
検証が成立するまでF07は未解消とする。

inventoryは#865のphaseごとに単調減少させる。consumer 0、successor parity、canary、rollback、
major-version gate成立後にのみdirect engineを削除する。read-only replayとhistorical evidenceは
write/control authorityと別に扱う。
