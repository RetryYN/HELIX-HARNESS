# OS Stage 2c 親028/029 source binding 補強監査

## 対象と判断

基準は `0d8fcb67ef64e17e0e3529715011d6140652f017`。HELIXOS-L2-028/029のStage 2cだけを対象とし、固定L2/L11が既に要求する選択sourceのidentity等を、既存正常経路に対する個別negative oracleへ展開した。親の意味、owner、threshold、schema、gate、version targetは変更していない。

旧sourceでは、強いtest/oracleを作る役と軽量実装、consult、review/fixを巡るcycleを再利用し、現在のOS/INTELLIGENCE/SECURITYの責務とsource/context境界を再導出した。旧runtime/schema/CLI/testは置換対象として扱い、実行・移植していない。参照assetとSHAはJSONの `legacy_sources` に固定した。

## 固定親と不足箇所

固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc` の [`governance-requirements.md`](../../../helix-os/L2-requirements/governance-requirements.md) 028行847–862は、選択sourceのrevision/identity、permission、relevance、scope、constraintsとsource contextを要求する。対応する [`governance-acceptance.md`](../../../helix-os/L11-acceptance/governance-acceptance.md) 457–466は正常/失敗時のholdと既存return routeを定める。既存CASE-OS-028-03b/03o/03pはpermission、revision、scope等を個別に扱っていたが、identity、provenance、relevance、constraintsの独立変異が揃っていなかったため、03s–03vを追加した。各CASEは他のsource fieldを固定し、選択sourceを推測置換しない。

固定L2-029行863–877とL11行468–478では、supportを選んだ場合にsource identity/version/scope/provenance/permissionを結び、consultを選ばない作業前supportでもそのbindingを保つ。既存CASE-OS-029-01はsupport選択/no-consultの正常経路、029-07はsupport/consult双方を選ばない正常経路を示す。これらの間を分け、029-01と同じ正常基準から一fieldずつ変異する08a–08eを追加した。support未選択の029-07にsource fieldを要求しない。戻し先は固定親にあるsource owner/INTELLIGENCE/SECURITY/OSを維持する。

NFR-028 censusは選択sourceのprovenance/scope/constraintsも含むようにし、未選択sourceは分母・必須fieldへ混ぜない。NFR-029 censusは全started composite attemptsを従来どおり分母とし、support選択時の5 source fieldとstage support methodをno-consultにも含めた。未選択supportはsource/proposal field不要のまま。分母やthresholdは変えていない。

## 6文書の変更とpin

6文書の前後full SHAとStage 2c span SHA、行範囲はこの監査と同じbasenameのJSONにある。BR/BVは独立business outcomeを作らない固定境界のため不変。変更はFR/NFR/FV/NFRVの4文書に限定した。

- FR: AC-028-03とAC-029-01へのcase対応を追補。
- NFR: 選択sourceの条件付き必須fieldを明示。
- FV: 028の03s–03v、029の08a–08eとtrace matrixを追加。
- NFRV: source fieldを含む完結censusを追補し、既存分母・未選択時の扱いを維持。
- BR/BV: 不変。

PO採択registrationは028 `MPR-RC-HELIXOS-L2-028-001`、029 `MPR-RC-HELIXOS-L2-029-003`。採択revision `633bf12ea8f948db8ba3d6600179c4a9507377a7` と、固定親revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc` は別のpinとして記録した。採択cutout JSONのSHAもJSONに記録した。

## 検証と限界

静的検証は `git diff --check`、JSON parse、CASE ID重複とAC/trace参照、6文書pin再計算、014の無変更確認を行う。fixtureは実行していない。旧runtime/CLI/test/CIも実行していない。これは028/029の限定補強であり、全274親・48文書の意味監査や他Stageの承認を意味しない。
