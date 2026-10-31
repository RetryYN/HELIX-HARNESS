# WR259 HARNESS-048 L9 oracle allowlist整理

status: scaffold（静的な文書整理。要求・承認・実行結果を生成しない）
authority_effect: none

## 変更

L9の59件の合成caseを、QAのL9責務である「L4契約に沿う実行境界と番号付きsystem oracle一覧」へ整理した。各行には、連番`L9-SYSTEM-ORACLE-01..59`、case IDと順序、元IDから機械導出したcode、条件、oracle property、期待観測、axis、state、戻し先、L3/L4/L10参照、`execution_state=not_executed`を残した。5件のL4契約と5件の承認済みL10 system oracle、親のsource pins 10件、legacy comparison、全goal scope、未検証範囲は維持した。

59個の`independent_source_packet`（raw UTF-8 fixture payload・hashを含む）と59個の`expected_material`全返却構造・副作用内訳を削除した。行別の短いconditionとexpected observationは、同一ID・同順序のL8 U-ID行と照合している。L9は194,059 bytesから83,557 bytesへ110,502 bytes（56.94%）縮小した。6-key `removed_materials`は撤去前のL9をbase commit `fe79e0004d8164bffc4be7c8c31dd9e14da2ead3`で固定し、用途境界にDT-VT-105を記録する。

`axis`はcase IDと元のexpected materialが示す対象軸（例：signature inputs、exception、authority boundary）を名前付けしたもの。`state`は元のexpected material内の結果状態を短く表したもの。`backflow_owner`は元のcaseまたは承認済みL10 oracleで明示された場合だけ記録し、F02のようにowner割当が明示されない場合は`null`を保つ。実行状態は全59件で未実行である。

## consumerと固定参照

L5の37個のL9 literal/output source pointerを全件調べた。これらはすでに`source_revision=b52ad0e1e954790ebe57b2d87da46ea6712a07d9`を持ち、その固定revisionの元L9で値canonical hashが一致する。現行のraw fixture nodeを参照するものは、撤去後のallowlistからfixtureが復元できるような誤解を生まないため、既存の固定revision参照を維持した。L8正本はL9へのJSON Pointerを持たず、現行L8行の条件・期待観測をL9 allowlistとの照合sourceにした。

WR251の`SCF-B-0211`は、過去の時点証拠を変更せずに保持しつつ、現行L9 upstream hashへrebindした。元のhashと固定baseをnoteへ追記した。監査本文やcheck-childの過去snapshotは上書きしていない。

## 旧sourceと失敗起点

旧sourceは`LEGACY-ASSET-719D5EC9C06FC4AAD0FF`、`archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:130,204`（HIL-FR-40、HIL-NFR-24）である。object identity・role・consumer・canonical term・symbol/oracleの独立edge、文字列類似だけでrenameしないこと、signature・behavior・rollbackの照合を保持する。旧のlayer/gateや実行材料は移していない。現行`legacy_comparison`の17 clause spanは固定source bytesとの比較記録として一切変更していない。

失敗起点は#4005 R1 F1（hash field撤去だけでfixture本体が残り、L9が0.5%しか縮まなかった）と、その解消内容を独立確認したR2 no_findingsである。cap/hash件数だけで完了を示さず、caseの本文、固定参照、consumer、禁止材料の残留を実測した。#4005のコメントは本PRのwork-requestに従い参照した。

## 検証

`validate_l9_slim.py`は固定baseの元bytesとのID・順序・参照・property・state・承認済みoracle一致、およびL5 37 pointerの固定revisionとcanonical hashを検査する。`scfctl validate`、`scfctl stale`、`design_verification_checker.py check-child`も実行する。check-childの未評価pairや既存の4way negative failureは成功へ読み替えず、測定snapshotとREADMEへ結果を記録する。

上流整理の静的照合のみを行い、旧runtime/test/CI、L4/L5 algorithm、製品testは実行しない。L7 test citation、fixture、実観測、formal verification、承認、実装ready、完了状態を生成しない。


`evidence/validation-results-r1.json`はoracle_number明示化前の作業時点を、`evidence/validation-results-r2.json`は連番01..59を入れた最終overlayを記録する。両方とも各時点のappend-only記録として残す。
