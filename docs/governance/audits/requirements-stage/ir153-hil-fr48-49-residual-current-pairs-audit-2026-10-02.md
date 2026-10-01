# IR153 HIL-FR-48/49 残差の現行pair再照合（2026-10-02）

## 対象と基準

基準は `f38bde044a7dfbf12aec0203b21a9384eef6ad8f`。旧保存資産 `LEGACY-ASSET-719D5EC9C06FC4AAD0FF` のL1 requirement file SHA-256は `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`。HIL-FR-48 line 138（SHA `e12937bb604330b7c3d1ad13f23bb3e60969b888cd16a311405e7a993e360d41`）とHIL-FR-49 line 139（SHA `58417554e28eff13d562e183533c1f76fbca3c27a29de9385d09e70b615ccf37`）、別identityのHIL-NFR-29 line 209（SHA `f30d5a844de9d622f8754b5b9ace72e74dc44886635095de76183d544678c9a3`）を原文から照合した。旧assertion casesは全体SHA `98d2f9c9721481e6b4363c0683c00b187ce789fd6a39723323eca72395102ea8`。該当physical line/hashはJSONに収録した。

## 採択済みpairと保証の行き先

| source residual | 採択済みpair | 読める保証と境界 |
|---|---|---|
| FR-48 stale revision | HARNESS-055-001（decision 9/30 live26 row40、L2 `9f1e6317…8787b5` / L11 `f1b9332d…3aa96a`） | 055の選択atomは隣接双方向trace、descent/backprop、granularity/aggregate。stale / semantic revision / snapshot cross-conditionは明示的に範囲外。040-002（L2 `c349606d…0757df` / L11 `366518f8…6fc212`）はcatalog/snapshot契約であり、そのものではstale pair拒否oracleにならない。 |
| FR-49 different snapshot | HARNESS-056-001（decision row41、L2 `99328311…eeade0` / L11 `9a8406bc…11a047`） | 056の選択atomは6 canonical V-pair、L12 feedback、片側欠落、oracle identity/実行条件。異snapshot/stale cross-conditionは明示的に範囲外。 |
| 両方のfreeze closure | HARNESS-063-001（decision row48、L2 `f0a1014c…d75b46` / L11 `fb545fc0…da2233`） | **別の採択済みguard**が、選択freeze scopeの固定source snapshot/authority revision、全required typed edge・L11 oracleの同scope/target revision closure、change/stale範囲、依存revision変更後の旧receiptを扱う。required closureが欠ける・staleなら対象revisionをeligibleにしない。row72は選択3条件だけの採択と限定し、全面的な旧IR closureを含めない。 |

040/055/056/063の採否は、候補frontmatterの「未採択」表示やMPRの古いreceipt metadataからでなく、対象revisionのPO decisionとexact paired digestから判定した。063の2026-09-29 source receiptは作成時点では`authority_effect: none`だが、後続2026-09-30 live26 row48が `MPR-RC-HARNESS-L2-063-001` のexact pairを採択している。古いreceiptの状態を現行採否と混同しない。

## 条件別判断

- **FR-48 stale revision**：現在の明示的な保証は、055の直接pair gate出力ではなく、063を使う選択freeze closureのeligibility境界である。stale/mismatched required edge/oracle revision、またはdependency revision変更後のreceiptでは対象closureをeligibleにしない。よって、選択scopeのfreeze closureがstale pairを通す現行要求欠落は確認できなかった。ただしFR-48 source atomはholdingのままで、formal successorや055の直接stale findingを主張しない。
- **FR-49 different snapshot**：同様に、056単体は異snapshot判定を持たない。一方、063の固定source snapshot/digest bindingと同一scope/target-revisionの全edge/oracle closureを使う対象freezeではsnapshot/digest不一致をeligibleにできない。別snapshotのdesign/verificationを同じpairとして通すfreeze closure欠落は確認できなかった。ただし063は056内の全snapshot組合せを直接比較するoracleではないため、pair単体の結果表示や旧sourceのformal rehomeを閉じたとは扱わない。
- 旧HST-CASE-031-04/07/08（assertion lines 304/307/308）と032-12（line 320）はstale/revision/snapshotの設計oracle例である。031-09/032-14（lines 399/400）も同一revision/snapshotのsummary条件だが `design-defined / not-implemented` で、実行結果ではない。

## Authorityと残るholding

055/056のsource coverage receiptは8 selected atomだけを割当て、FR-48 stale、FR-49異snapshot、NFR-29 cross-conditionをsource atom set外に保持する。`MPR-SH-IR-003` の旧IR rows 81/82は`preserved_pending_rehome`、`successor_requirement_ids: []`のまま。063採択はそのregisterを遡及変更しない。したがって、現在の選択freeze closureに対する保証はあるが、旧IR atomのformal successor割当や要求全体のno-lossはここでは主張しない。

HARNESS-022のrevision/pair/oracle contractはstage受入の一般契約で、pair間snapshot同一性の明示oracleとしては数えなかった。HELIXOS-033はengine/detectorの同一snapshot replayで対象機能が異なるためFR-48/49の保証に含めない。NFR-29も別の旧requirement identityで、直接FR48/49条件として二重計上しない。

## 結論と検証

現行freeze-eligibilityに対する別採択保証が063にあるため、この監査では新候補IDを作らず、既存L2/L11や採択本文も変更しない。055/056のpair gate単体にstale/snapshot findingを返す意味拡張が別途必要と判断される場合は、採択済み範囲の変更として扱い、候補IDを先に予約して対象の人間判断へ戻す。

JSON内で旧source physical line hash、current full file SHA、decision pair digests、receipt pins、individual condition destinationsを記録した。source line hashesは現行archiveから照合しJSONをparse確認した。旧archive/runtime/test/CI、新generation test、137、共通8 gateは実行していない。要求・decision・candidateのtracked本文は変更していない。
