# 旧orchestration surface退役ratchet 単体テスト設計

| Oracle | 検証 |
| --- | --- |
| U-LORET-001 | baseline以下への減少を許可し、債務量を可視化する |
| U-LORET-002 | inventory外pathへの旧surface追加を拒否する |
| U-LORET-003 | 同一path内の上限超過を拒否し、別pathの減少と相殺しない |
| U-LORET-004 | archiveとgate自己参照をcurrent consumerへ数えない |
| U-LORET-005 | schema、role、path、count、重複entryの退化値を拒否する |
| U-LORET-006 | live tracked repositoryをinventoryと照合する |

Phase 1は新規利用freezeの検証だけを所有する。compatibility adapter、consumer migration、
direct engine削除、resident lane E2Eは後続phaseで検証する。
