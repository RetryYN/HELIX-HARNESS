# WR253 HARNESS-015 L9 軽量化

Issue #3510 の WR253 と comment 6447665479 に基づく静的な文書整理。L9 の35箇所の `source_packet.byte_sha256` を除去し、元packet、37 case（U-IDに対応する35件と既存の匿名2件）、期待値、要求・検証の意味を保持した。L8は変更せず、source/expectedの35件の numeric RFC6901 pointerを現行L9に解決する。除去値は `removed_materials` に固定commit・path・利用境界を記載した。撤去元は比較と由来確認に限り、L7 fixture/test/oracle/citationへ流用しない。

35個の旧hashは固定revisionのUTF-8原bytesと照合し、現行JSONは同35 fieldと追加の撤去記録以外が旧JSONと完全一致する。`validate_l9_slim.py` が再現する。L8の既存validatorは現行L9の残り全内容とpointerを確認し、除去されたhashは固定revisionから検証する。WR206/223/243/249 の旧時点全体比較も固定revisionで維持し、現行L9について上記検証を必須にする。`consumer-validator-followup.json`に7 validatorの変更前revision/hashと変更後hashを記録する。過去の検証結果そのものは変更しない。

SCF-B-0192/0193/0204/0208/0210/0215のcurrent L9 pinを更新し、旧hashとrevisionを記録した。SCF-B-0185/0192/0215は変更したvalidatorの新旧hashを保持する。既存のL8由来の候補設計や35 U-IDは変えない。未解消の4way 35件、L7実行・oracle・test citation、L11受入はこの静的整理から生成しない。

旧HELIX `LEGACY-ASSET-6B6C5CB0E481BE01088B`、archiveの `docs/design/harness/L1-requirements/functional-requirements.md` 33行・81行および `docs/governance/ddd-tdd-rules.md` 23–24行・117–125行を参照した。検証対象・oracleの追跡と意味保存を保持し、今回の差分は重複digestの撤去と由来の固定であり、旧runtime/test/CIを実行しない。失敗起点はPR #4003 R1の比較漏れとPR #3999 R2 F2のfixture digest残留で、削除数と全残存値を比較する。
