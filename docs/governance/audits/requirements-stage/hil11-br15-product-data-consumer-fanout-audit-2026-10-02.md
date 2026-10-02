# HIL-BR-15 Product Data consumer fanout監査

## 対象とauthority

本記録は、既存の`HELIXOS-L2-112`候補に含まれるHIL-BR-15の条件照合と、同候補への追補を記録する。予約されている`HELIXOS-L2-123`は使用せず、新しいsource atomも追加しない。fanout条件は、112の4 atomのうち既に入力済みの`HIL-BR-15` atomに含まれる。2026-09-28のHELIX-OS判断は親L1のexact revisionを固定し、OS L2/L11の明示候補集合（ID 001–029帯の判断対象）にも合意したが、`HELIXOS-L2-112`はその採択対象に含まれない。候補metadata、監査、receipt、MPR登録はすべて`authority_effect: none`である。

固定した旧sourceは、旧L1 `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:67`（file SHA-256 `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`、line SHA-256 `880385839788ea49f14544ee9dd0f1ed5037bc84b1707a9ba55f4fa6a267c2f5`）および旧IR `requirements.json#/HIL-BR-15/statement`（file SHA-256 `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`、statement semantic digest `sha256:5f5450b0a801f1f4c6650a0b4ddb87d5eee23400f2126332ed0038ed06f01115`）である。原文は、由来・鮮度・schema・authorityを保持する正規Product Data projectionを、設計判断、coverage、impact、Issue routing、docgen、detectorへ供給する条件を示す。原文行、IR identityとの同一性、6 roleとの対応は[補足source条件ledger](../requirement-registration/hil11-br15-consumer-fanout-source-lines-2026-10-02.jsonl)に記録した。

補助sourceも読み取り、実行していない。対象は`HR-FR-HIL-11`、`HAC-HIL-11a/b/c`、`HAT-HIL-11`（`designed_not_implemented`）、旧L5 `product-data-connector.md:33-57,86-109,193-238`、旧L6 `product-data-connector.md:27-57`である。HACはfull/incremental lineageの正常条件、drift/regression/PIIでcurrentを進めない負条件、stale/tombstone境界を示す。L5/L6はconsumerへ渡すprojectionとfailure境界の設計資料である。これらは現行実行やsuccessor authorityを証明しない。

## 原文条件と追補前の現行記録

| HIL-BR-15の条件 | 追補前の現行記録の所在 | 照合結果 |
|---|---|---|
| versioned Product Data source、由来・鮮度・schema・authority付き正規projection | `docs/helix-os/L2-requirements/governance-requirements.md#HELIXOS-L2-112`のsource registry/source key、projection、tombstone/freshness/schema、data-use/redaction節と、`docs/helix-os/L11-acceptance/governance-acceptance.md#HELIXOS-L2-112`の正常・負・境界oracle。採択OS 015/016/007/009とCONNECTは一般identity/provenance/transportを扱う。 | source/projectionの条件は112候補にあるが未採択で、BR15のconsumer fanout oracleまでは含まない。 |
| 設計判断 | L2-112のgenericな選択済みrequirement/design/Issue等のidentity/revision mapping。L11-112は明示選択refのみを対象とする。 | generic mappingの部分対応。設計判断role固有のcomplete/missing fixtureはなかった。 |
| coverage | 追補前のL2/L11-112にrole固有consumer identity/revision edgeとcoverage欠落fixtureなし。 | 未対応残差。 |
| impact | 追補前のL2/L11-112にrole固有consumer identity/revision edgeとimpact欠落fixtureなし。 | 未対応残差。 |
| Issue routing | Issue consumerへのgeneric mappingはあるが、routingを別roleとして追跡する条件や欠落・wrong revision oracleはない。 | Issue mappingのみ部分対応。 |
| docgen | 追補前のL2/L11-112にrole固有のdestination/oracleなし。 | 未対応残差。 |
| detector | 追補前のL2/L11-112にrole固有のdestination/oracleなし。 | 未対応残差。 |
| 名指しrole全体へのfanoutとcomplete判定 | 追補前のL11-112は選択consumer refだけに限定し、BR15の機能一覧全体が今回のconsumer集合に採択されたとは扱わない。roleごとの完全性oracleなし。 | 意図的に選択scopeへ限定していた。列挙roleの未記録を被覆済みまたは非適用とは推定できない。 |

追補では6 roleを独立に記録し、各適用consumerのidentity/revision、owner宣言のscope/canonical mapping、sourceからのlineageを結び、選択consumerの欠落・誤revision・mapping/lineage欠落を失敗とする。sourceが未選択ならunobserved、owner/scope/applicabilityが未確定ならunknownとし、文書参照だけを供給成功や非適用へ読み替えない。complete fanoutの主張には、6 role各々についてowner/scopeに基づく適用consumerとmapping、または非適用の明示根拠を求める。未解決roleはpartial/unknownのままとする。

この追補は、実際のsource、参加consumer、owner、role適用範囲、schema、業務mappingを決めない。OSへProduct Dataの業務意味を移さない。採択OS 015/016/007/009は一般identity/provenance/event/projection/durable reconstruction、HARNESS 019/027/038とCONNECTは各既存scopeの静的observation/reverse/transportを担うが、Product Data consumer role mappingを定義しない。SECURITYは既存authority/data-use、source/consumer ownerは業務意味を保持する。112の`version_target: 2.0 candidate`は維持し、1.0へ前倒ししない。

## 上流の意味選択肢

旧原文は6 roleを列挙するが、各selected sourceに6 roleすべてが適用されるか、sourceごとの該当role、consumer ownerを定めていない。候補ではこのscope判断を解決せず、次の具体的選択肢と影響を記録する。

- **A — 全selected sourceへ6 roleを適用**：各selected Product Data sourceについて6 roleすべてを必須とする。最も強いfanoutだが、sourceごとのowner選択で定まっていない一律適用を追加する。
- **B — sourceごとのowner宣言で適用性を決める（推奨）**：6 roleを独立の記録項目として保ち、source/consumer ownerが各sourceの適用範囲とidentity/revisionを明示する。選択済みroleのmapping欠落は失敗、未解決roleがあればcomplete claimをしない。原文の6 roleを保持しつつ、実source・consumer・owner・一律適用を創作しない。
- **C — 現行の明示選択refのみを継続**：roleごとのcomplete fanout claimをせず、6 roleを旧source参照にとどめる。これはBR15の供給条件を候補oracleに表現しない状態を残す。

推奨はBである。候補本文はBを未決案として記述し、人間decisionを生成していない。意味判断の影響はHIL-BR-15の適用性とfanout完全性にあり、関連するHIL-FR-23のsource登録、HIL-FR-24のmapping、HIL-NFR-17のaccess/data-use境界は既存112の記録を維持する。112の`version_target: 2.0`および他の条件は変えない。

## 静的fixtureと限界

L11-112には具体的な合成正常例A（6 roleすべて適用）、正常例B（owner宣言の非適用を含む）、6 edgeそれぞれの個別欠落負例、誤consumer revision、missing owner/scope、mapping欠落、source未選択例を記載した。例示ID・owner宣言はfixture専用で、実在consumer/owner、採否、業務意味を決めない。一roleのedgeを他roleの被覆に使わず、別selected sourceの独立projectionは一律失敗にしない。

runtime、外部source、旧HAT/test、CI、CLIは実行していない。候補fixtureは受入条件案であり、実際のfanout実行、候補採択、formal successor、owner移管、requirements-stage closureを主張しない。

## revision pin

- 初回起草baseは`26ce66202f7a57230093701fc90abb2f9f1c355f`、追補前のlocal commitは`51edcb3e8f304cef4ee00f41dd935adca4bd6840`。3ce時点の確認は作成時snapshotとして扱い、最新比較先と区別する。
- 最新比較先は`606bb1fa04eeb1512e665fb52a2a10c689056d64`（OS122を含む）。そのOS L2/L11全file SHA-256はそれぞれ`37712c030b27c2cfb8c73960680026fecdb44464d93d4996ad82423cad04cb05`、`adb3043bc06e4e534730ac08ab47cdd56b6c2931ac859ac8f09fe16fd6fd5ff4`。MPR registerの665行prefix SHA-256は`11c97569e7737a80f8e83a1420b801602048d3cbd3f99dbe99ca2dea79088afe`。
- 最新baseの112 section digestはL2 `6bfc4a3bef86e22a0ba044be7c8b1d5539b3f00e5445b76c9e690b7b02df0ba6`、L11 `3796ec774e093ee96d93d729b781c0980bb9eabc9339099e1ccb0f78857c6d99`。候補節は追補作成時から不変で、候補L2/L11 section digestはそれぞれ`ef06d3d78957a483d89249fe72b0c913fd08d78a60f9c42c2821988a0616f4a8`、`a93d6a2590560fd93572cdae326430081c93dd53c9c3b68165fb621eb2ad5c8f`。
- 作業treeの候補全file SHA-256はL2 `fb7c87ee05a15112af6849c3a759fa4b0c9deee7f5ababb8e925f7a31436c1fa`、L11 `c3ed3c30bf727f2054451d88a7d6f93f45d4ed96fa0ea8dfb9df658eb1a87b0a`。registerは最新mainの665行prefixの後に`MPR-RC-HELIXOS-L2-112-002`を1行だけ追加した全666行で、SHA-256 `0eaaebe840b3e281b6c05dc8bda01b636acb0d6164adaae8eade3e7ee31e1264`。r2 receiptにbase/currentのfile・section・register・source-ledger pinsを記録した。
- source atom setは4件・digest `0ea93e048acc41d5c5bf22dede0085a1208cf29c786016a164c326131219f1d4`のまま。補足source-condition ledger SHA-256は`938b9abec12996af63c4c4b56a86cdc61dc887aeb16c566607c5610f15cec4ea`。
- 親L1はdecision固定commit `f6dad2a33e24f000b87d7f09b8d40288257e74cc`のSHA-256 `2bb62571308aa1fde0351ca7242e961ddd25b9c4722196c7bb255cf3ad1cfe0e`。採択状態はdecision recordで確認し、候補metadataから推定しない。既merge済みreceipt/MPR-001、原source-lines ledger、旧source固定hash、過去監査は変更していない。追加MPR revisionやreceipt r3は作っていない。
