# 41 group authority-chain snapshot のindex参照

このappend-only参照は、G0採択274親の判断連鎖を exact target main `ce70628e53ff5f78c1321accf57429c740ea585d` で機械投影した時点記録を、既存の274親意味監査indexへ接続する。既存indexとmapping correctionは変更していない。

| 成果物 | repo path | bytes | SHA-256 |
|---|---|---:|---|
| chain projection JSON | `l3-authority-chain-41groups-ce70628.json` | 15,440,560 | `f40140efaeaa1cc84067adbc77d189f79c56ba991cb54d751760343335ed23bb` |
| chain projection MD | `l3-authority-chain-41groups-ce70628.md` | 30,299 | `af37fecbba1b3ee382c418f7f9af2571c0c251972791f47c69ae0c455c36ef57` |

上記2ファイルは `/tmp/l3-authority-chain-41groups-ce70628.{json,md}` のbytesを変更せず複製した。

## 接続先と不変性

- 意味監査index: [`l3-stage-274-semantic-audit-index-d629e2525-2026-10-08.json`](l3-stage-274-semantic-audit-index-d629e2525-2026-10-08.json)、SHA-256 `95447df5f9f63e07e19cd884744a48328031f5cdc1dea2d22602871314b9458f`。
- 既存mapping correction: [`l3-stage-274-semantic-audit-index-mapping-correction-2026-10-08-main-dddab671b.json`](l3-stage-274-semantic-audit-index-mapping-correction-2026-10-08-main-dddab671b.json)、SHA-256 `d86a9fd272b5cfbd706fb20d57053e5d5a1425a4cf1adc9959b739ec3ec48096`。
- 上記のindex／mapping bytesは変更していない。chain projectionは別snapshotで、意味完了や承認を追加しない。
- #2678 INT Stage4 decisionはNFR計測定義だけの限定scopeとして記録し、親全体やFR/FVの既存chainを置換しない。
- ce706後のPR状態はtarget時点の連鎖と分離する。Rootの後続報告では#2694 LABO063は条件3 formal `6047432658`を経てReady／merge依頼、#2695 OS036は条件3 formal `6047419887`を経てReady／merge依頼。いずれもこのce706 snapshotには未admittedであり、本記録からmain admissionを推測しない。
