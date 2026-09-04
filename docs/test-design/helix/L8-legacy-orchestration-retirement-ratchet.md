---
title: 旧orchestration surface退役ratchet 単体テスト設計
layer: L8
artifact_type: test_design
sub_doc: unit-test-design
status: draft
created: 2026-09-05
updated: 2026-09-05
owner: Codex / TL
plan: docs/plans/PLAN-L7-729-legacy-orchestration-new-use-freeze.md
parent_design: docs/design/helix/L6-function-design/legacy-orchestration-retirement-ratchet.md
pair_artifact: docs/design/helix/L6-function-design/legacy-orchestration-retirement-ratchet.md
---

# 旧orchestration surface退役ratchet 単体テスト設計

| Oracle | 検証 |
| --- | --- |
| U-LORET-001 | baseline以下への減少を許可し、債務量を可視化する |
| U-LORET-002 | inventory外pathへの旧surface追加を拒否する |
| U-LORET-003 | 同一path内の上限超過を拒否し、別pathの減少と相殺しない |
| U-LORET-004 | archiveとgate自己参照をcurrent consumerへ数えない |
| U-LORET-005 | schema、role、path、count、重複entryの退化値と除外先拡張によるconsumer隠蔽を拒否する |
| U-LORET-006 | live tracked repositoryをinventoryと照合する |
| U-LORET-007 | published上限の引上げと新規pathの同時自己登録を拒否する |
| U-LORET-008 | 削減後の再増加とsource HEAD差替えを拒否し、単調減少を許可する |
| U-LORET-009 | 一時Git repositoryで公開base不在・初回の上限増加／path追加・架空revision・公開削減後の再増加をloaderとdoctorで拒否する |

U-LORET-007/008は比較関数の単体oracleであり、published base取得の真正性を証明しない。
loader／doctor統合では初回導入、基準取得失敗、架空revision、candidateへのfallback禁止を別途検証する。

Phase 1は新規利用freezeの検証だけを所有する。compatibility adapter、consumer migration、
direct engine削除、resident lane E2Eは後続phaseで検証する。
