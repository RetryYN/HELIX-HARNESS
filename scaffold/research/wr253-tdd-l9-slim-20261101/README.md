# WR253 HARNESS-015 L9 R1 軽量化

status: scaffold（静的な文書整理。要求・承認・実行結果を生成しない）
authority_effect: none

## 変更

PR #4005 のR1 Majorを受け、L9をL4の5 branch契約と、L9のsystem oracle allowlistに再構成した。L9は577,084 bytesから47,794 bytesへ縮小した。残したoracleは、normal 5件、normal variant 2件、negative 30件の合計37件で、それぞれ連番oracle ID、case ID、要求参照、system oracle参照、性質、期待観測、`execution_state=not_executed`を持つ。

各negative oracleはcode（WR231の2件はcode unknownを明示）、condition、expected axis/state、backflow owner、side effect count、non-target preservationの要点を残した。L4 contract refとL4本文のsource pinは固定revisionを指す。branchの期待契約観測は短い期待値だけを維持する。

L9からfixture/raw source、`original_l10`、全返却payload、`fixture_preparation`、mutation before/afterを除いた。6-field `removed_materials`は旧材料の復元先commit/path、除去内容、DT-VT-105の境界を記録する。旧runtime、test、CI、algorithmは実行しない。

L8主文書の94個のL9参照をすべて調査し、撤去されたnormal/variant/negativeのpayload子node参照を対応する現行compact oracle rowへ付け替えた。rowそのものを指す参照は維持した。`candidate_unit_design`の値は固定HEADと完全一致する。

## 旧sourceと失敗起点

旧HELIXではFR-L1-02がRedからGreenへのtest-first順序（`archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/functional-requirements.md:33`）、FR-L1-50がoracle強度とtrace（同:81）を扱う。旧`ddd-tdd-rules.md:23-24, 117-119, 135-150`も、実欠陥を検出するRed、同一oracleのGreen、意味を変えないRefactor、設計とsystem oracleの対を記録している。保持するのはこれらの意味であり、旧runtime/test/CI/algorithmや実行payloadではない。

改訂の直接の失敗起点はPR #4005 R1 F1（hashだけでL9実行材料が残った）と、過去のPR #3999 R2 F2（fixture digest残留）である。cap 0やhash項目数だけを軽量化完了の根拠にせず、残存構造が許可allowlistに収まるかを検査する。

## 参照と履歴

- L9撤去直前の固定revisionは`22f14f1866948783a81a7eb665dc3d5da7d97daa`、SHA-256は`805ab74d9792775616e10af7b3da92a8be13002f66180e2a1862de17dbd597d3`。
- 先行する35件のsource hash撤去の固定revisionは`6c1ceb0172c0dcb95b843739bee2c15905dd735f`。既存のhash履歴照合はこのrevisionを使用する。
- L8主文書の94参照は全件現行解決する。別文書`L8-unit-verification/process-state-port.json`にはF03 fixtureへの78 pseudo-ID形式pointerがあるが、このファイルは作業前固定revisionと同じbytesであり、配列のsymbolic indexはRFC6901として作業前から解決不能だった。別pairの本文は今回変更しない。
- 元の`verification-summary.json`と旧validator履歴はその時点の記録として不変更。R1結果は`r1-followup.json`、check-child実測は`check-child-r1.json`、現行L9の厳密allowlist検査は`validate_l9_slim.py`に追補した。

## 確認結果

- 現行L9 allowlist validator、L8 U-ID validator、およびWR206 / WR223 / WR243-B01 / WR243-F03 / WR243-F04 / WR249の7 validatorがすべてPASS。
- `scfctl validate`: bindings=198, fail=0。`scfctl stale`: stale=0。
- 実測check-childはL4/L9 pair、L5/L8 pair、4層 ownership cap、pinをPASS。4way negativeは既存の35 failures・matched=0を再現する。詳細は`check-child-r1.json`。
- 旧runtime、旧test、旧CI、algorithm、製品testは実行していない。
