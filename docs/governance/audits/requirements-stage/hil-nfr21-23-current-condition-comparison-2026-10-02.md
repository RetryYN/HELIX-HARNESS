# HIL-NFR-21〜23 現行条件照合

- 比較基準: `91db17752d29c8bb8dd30a4b4bf693136bcd858f`（2026-10-02 main）
- 旧asset: `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`
- 旧requirements IR: `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`
- 旧L1 source: `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`
- 詳細pinと条件対応: [`hil-nfr21-23-current-condition-comparison-2026-10-02.json`](hil-nfr21-23-current-condition-comparison-2026-10-02.json)
- 旧consumer IR files: `system_contracts.json` `2a7df673138568526e714342679ce2982238966b42f2d1967b2da92e9dbf02ab`; `acceptance_cases.json` `4fabf58db6619ceaa5d0943fd295f5b0ec127be39f245428d203c6a3b366ae19`; `system_tests.json` `7ff2a798c120f7622d77dff2aba83992c03fb5a40cfa3b491572b4e8558c191a`。NFR-21/23のconsumerはHR/HAC/HAT-05、NFR-22はHR/HAC/HAT-09として照合した。
- 旧runtime、test、CI、CLIは実行していない。

## HIL-NFR-21

IR `#/HIL-NFR-21`と旧L1 line 201の四条件（append-only原記録、AIによる削除/不可視化/終端化禁止、PO以外のcancel/supersede禁止、false-positive/accepted-riskへの独立review）を、採択済みHARNESS-058、OS-034、OS-101のexact pairへ対応づけた。

9/30 live26 decision rows 43/51/54/70はこれらを一判断単位として採択する。decision対象のsection SHAと現在のsection SHAを照合し、四条件の行き先を確認した。OS-101のaccepted-riskには独立reviewに加えて対象operation-bound PO receiptがある。これはNFR-21の正式IR successor割当を意味しない。

## HIL-NFR-22

IR `#/HIL-NFR-22`と旧L1 line 202は、atomic behavior分母とaggregate parent・directory/file count・representative fixtureの除外に加えて、extractor変更またはsource差分時に「全child receipt」をstale化する。

採択HARNESS-038はcapability manifest/closureのscopeを扱う。HARNESS-067-001は未採択で、FR-37 line 127一atomの候補であり、stale条件はaffected atoms/child closureを対象にする。選択scopeの全prior child receiptを一律stale化するexact oracleは確認できなかった。残差をHARNESS-082の未採択候補に記録した。082はsource holdingを閉じず、NFR-22全体のsuccessor/adoptionを主張しない。

## HIL-NFR-23

IR `#/HIL-NFR-23`と旧L1 line 203の条件は、採択HARNESS-035-002に対応する。57-candidate decision row 40が指定するL2 composite digest（base section + scope appendix）とL11 section digestを現行bytesから再計算して一致確認した。pairはacyclic graphとauthoritative root、自己根拠/co-added-HIL cycle拒否、missing/unknown/wrong revision/unsupported root拒否、通常feedback loop許容を分けている。正式IR successor割当は示さない。

## authority境界

MPRの`registered_proposal`や`authority_effect: none`、固定時本文の候補metadataではなくdecision行と対象revisionを採否根拠に使った。NFR-21/23は採択済みpairへの意味対応、NFR-22は残差候補への対応であり、いずれもsource holding全体の完了を主張しない。
