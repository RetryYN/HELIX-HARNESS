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
- source HEADはinventory採取点であり、現在HEADと一致することを要求しない。
- Phase 1では既存engineを削除せず、実行挙動も変更しない。

## 後続

inventoryは#865のphaseごとに単調減少させる。consumer 0、successor parity、canary、rollback、
major-version gate成立後にのみdirect engineを削除する。read-only replayとhistorical evidenceは
write/control authorityと別に扱う。
