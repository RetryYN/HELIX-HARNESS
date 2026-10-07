# SECURITY Stage 1 parent 028 verification-scope correction audit (2026-10-08)

## 対象と所見

対象はSECURITY Stage 1の固定親 `HELIXSECURITY-L2-028`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。作業基点はremote mainのexact revision `0d8fcb67ef64e17e0e3529715011d6140652f017`（#2683 merge後）である。

固定L2の `security-requirements.md:342–350` は、共通descriptorに機能identity、契約版、成果物版、dependency identity/version、互換範囲、検証範囲を含め、検証対象と更新後artifactのintegrity一致を受入条件にする。対L11 `security-acceptance.md:52` は既存のidentity/version/digest、互換範囲、provenance、SECURITY条件を保つ。固定span SHAはJSONに記録した。

現行FR-028/AC-028とCASE-028はidentity/artifact version/digest/dependency/provenanceを扱っていたが、descriptor contract version・verification scopeの入力/欠落、実検証scopeだけの不一致、verification targetと更新artifactのintegrity対応を独立に拒否するoracleがなかった。これにより、通常metadataが一致しても別scopeまたは別targetを検証したcandidateを受け入れる偽成功が可能だった。

## 変更と保持

FR/AC-028に固定descriptor fieldとscope、実際に宣言scopeを検証したこと、検証targetと更新artifactのidentity/version/digest一致を明記した。L10 CASE-028正常fixtureを一致条件で定義し、contract version欠落、scope欠落、scope単独不一致、およびtarget/artifactのidentity/version/digestの各単独不一致をnegativeに追加した。既存のL11 oracle、SECURITY固有acceptance、HARNESSの共通contract/lifecycle owner、SECURITY L1-010/013への戻し先を保持した。変更はFR/FVとNFR候補/traceのみに限定し、BR/BVは不変。

NFRは有限の明記済みfixture集合に対するcoverage/false-acceptanceの静的候補として追補した。これは運用SLAでも実測値でもない。contract versionの許容値や互換政策は固定L2にないため定義していない。

## 旧HELIX source照合

旧pillar FR（`LEGACY-ASSET-EE5DBACC7F28F7D1F605`）、security broker authority（`LEGACY-ASSET-B62E49D2E156232B8C63`）、security broker acceptance（`LEGACY-ASSET-170112AB2FA2FFDBFEE9`）、HARNESS business detail（`LEGACY-ASSET-A6E2C7F0565E5F804F06`）、pillar acceptance test design（`LEGACY-ASSET-44DD86E3DEC09E65EF51`）の該当spanを読んだ。filter/trust-boundary/target identity/integrityには隣接する考えがある一方、SECURITY-HARNESS pack descriptorの検証scope/target-artifact対応を直接規定する旧CASEは確認できなかった。したがって旧CASEの完全一致再利用はせず、意味を固定L2から再導出した。full-file SHAと読んだ行はJSONにある。旧資産は参照のみで実行していない。

## SECURITY parent 020 watchpoint

親020の固定L2 `security-requirements.md:260–268`、L11:44、現FR:282–294、FV:204–211、NFR grade row 25、NFR verification row 12を読み直した。8 Guardは正常fixtureに列挙され、Secret/Egress/Permissionのdefer境界は分離されている。定義なし・不適用・観測欠落はgeneric unknown/holdへ送る。固定L2は各Guard個別のapplicability schemaを与えないため、そのschemaを推測で足す修正はしていない。個別Guard条件の網羅的独立fixtureまで閉じたとの主張はせず、watchpointとして記録する。

## 静的検証と限界

JSONの静的チェックはすべてPASS。`git diff --check`も実施する。これは要求本文・ID・trace・CASEの構造確認であり、runtime、CI、実更新処理を動かした証拠ではない。承認、実装許可、L10実行、PO事後確認は生成していない。

6本文のbefore/after full SHA、固定source span SHA、旧source full SHA、CASEの確認結果は隣接JSONを参照。
