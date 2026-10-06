# HARNESS-L2-046 post-body authoring audit 候補

- 対象HEAD: `16f1dbdcc13f0fc73f7974821edfbb0a91c009bb`（parent `3c3c512c09320c0494904602b23e544a81206eed`）
- base: `3c3c512c09320c0494904602b23e544a81206eed`
- 状態: `/tmp`候補のみ。canonical変更・commit・pushなし。独立review、承認、Ready、mergeを主張しない。
- body checkpoint: `/tmp/root-harness046-body-checkpoint.json` SHA-256 `8b08e8102f4c252a8f0662695a2ced1df62ecc345754b4cafc645fd923adac9c`。checkpointのCASE数は66、post-body現物は66行。

## 六文書の現物pin

| 文書 | base prefix SHA-256 | 現行suffix SHA-256 | 現行全文SHA-256 | 候補suffix一致 | 末尾 |
|---|---|---|---|---|---|
| `docs/helix-harness/L3-requirements/business-requirements.md` | `c51f0bc2b98ae5c6a77bfa354050ec70ee87a70641b5f0161b14d5a3afd33e8f` | `841bdfab182dc727d8953b0b565b95fcd6d86379ad2c3aea5374b6fd807522af` | `8e38307abeb26cacbf82a415c401a7f8d8811458f54a394d56d39a4d9d66228a` | 一致 | LF |
| `docs/helix-harness/L3-requirements/functional-requirements.md` | `4fce6bb6cd3af5938a11719866050bd729234adbebf70c4210398aa90cad5dff` | `9f746a2ca87bddd3d5eddd2f27a4685c2d9ed41676918bd0739d513ef5cf37d0` | `2f2acb25e7b0970a9deaf0e966e473024f6f69062181751a86bd9f13779fcfc0` | 一致 | LF |
| `docs/helix-harness/L3-requirements/nfr-grade.md` | `b364e8c6dc92f4548df34638488fefec1533d13941a991de685a74bb64471fc9` | `6cf1fe68e0d0b1c51ff25c2dcebf75a567cb4948c06a6a5f9d4b819f9112b37b` | `5c8f283aa66c8a51f248cb06e1b954e34158ca4afe394202970eda9277c54a2f` | 一致 | LF |
| `docs/helix-harness/L10-verification/business-verification.md` | `2faacacf78b835b5127e990b805adb97b079439c887a1ef2bd6d69f2478d53c9` | `28e363f6e4694a3daedc10986945073c5600d4120136beea1fde4d4ed4e460ee` | `7883a3e7ee5fc7554936486e681ea5a757d747a7dca2ce175ca8b361bf575075` | 一致 | LF |
| `docs/helix-harness/L10-verification/functional-verification.md` | `bc63c3abbabd727dbb2cfa37a5c3741985181308ad93378ebf2e5846907770f0` | `3e22cc9c68df1e353dd986f66440c36011a35861b3fa6f82ee9fe824f661a7f9` | `c4940f797cc82f9da68e04e4af64dbf7c10e82700b788e41c08c9be9cf48e9e1` | 一致 | LF |
| `docs/helix-harness/L10-verification/nfr-verification.md` | `bb319529b2c2e2af75067c36bf204d386816fb7e78d48f18043973be6290ccd1` | `c8f9014477d7cd38bcfa92aa5938687830885843116349551ad53b5ff292e6f1` | `de63d165651b87724d4ebaace4b441592c27e19167fab6f2ca986216ee5cae18` | 一致 | LF |

六文書すべてでbase `3c3c512c09320c0494904602b23e544a81206eed` のbytesがprefixとして一致し、実suffixはcandidate markdown payloadの前に区切りLFがある形で一致する。実suffix/current full SHAはbody checkpointと一致し、末尾LFを保持する。

## 固定親・旧source・consumer

固定L2/L11とPO 046行51・方式定義行51/61はrevision `318ec4a04abb3c1cc17111b3d939f913facd5fd3`または候補が記録するdecision revisionから再取得してraw span SHAを再計算し、全pin一致を確認した。

| 旧source atom | source line | file SHA-256 | line SHA-256（LF除外） | 照合 |
|---|---|---|---|---|
| V13-ARCHIVE-L0259-S1 | `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md:259` | `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406` | `e4c0f143df26e2777e66ada84e1903a154519b42e9732eaa6f06f9d09c849db6` | 一致 |
| V13-ARCHIVE-L0259-S2 | `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md:259` | `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406` | `e4c0f143df26e2777e66ada84e1903a154519b42e9732eaa6f06f9d09c849db6` | 一致 |
| V13-ARCHIVE-L0647 | `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md:647` | `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406` | `6c616a3fb85f5affae79a701b3ac2accf0975373d3540e8738bdd2b3c0a9d41e` | 一致 |
| V13-BASE-6FAB-L0244-S1 | `docs/governance/requirements-source/helix-requirements-v1.3-baseline-6fabd125.txt:244` | `1eecfe3cbbbf1c61956b23ddbd2f28a5146233d0d0be15fddd8098998ed097e1` | `e4c0f143df26e2777e66ada84e1903a154519b42e9732eaa6f06f9d09c849db6` | 一致 |
| V13-BASE-6FAB-L0244-S2 | `docs/governance/requirements-source/helix-requirements-v1.3-baseline-6fabd125.txt:244` | `1eecfe3cbbbf1c61956b23ddbd2f28a5146233d0d0be15fddd8098998ed097e1` | `e4c0f143df26e2777e66ada84e1903a154519b42e9732eaa6f06f9d09c849db6` | 一致 |
| V13-BASE-6FAB-L0628 | `docs/governance/requirements-source/helix-requirements-v1.3-baseline-6fabd125.txt:628` | `1eecfe3cbbbf1c61956b23ddbd2f28a5146233d0d0be15fddd8098998ed097e1` | `6c616a3fb85f5affae79a701b3ac2accf0975373d3540e8738bdd2b3c0a9d41e` | 一致 |

L259の二条件（Full VとProduction Scrum）は別atomとして保持し、L647は独立した第三条件として重複計上しない要約atomとして保全する。6fab baseline companionは別revisionのsource atomとして残す。対象consumerは旧UWJ-FR-015とworkflow publication boundaryの指定2行だけで、consumer全体網羅は主張しない。

| 旧consumer line | file SHA-256 | raw LF line SHA-256 |
|---|---|---|
| `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/universal-workflow-ai-judgment-engine.md:59` | `e20f475a3d1d082842415c2b734233e33a59f1b0bb1046c41e4ff4ec9c700e5b` | `0e8a41b505c6ee6e49340d9eb767e1e733a4dacdf2dbf0e2b1fd6966473f0178` |
| `archive/legacy-generation-2026-09-14/root/docs/design/helix/L4-basic-design/workflow-switch-route-allocation-boundary.md:75` | `1a843c1d72caeef0782b1263c0c79b2f75ad83e47f2fbf104819646b62deae67` | `0afb182dd84a0c0dd54b187100b39a6bbd178badb23cc1890105a8f3b4b1f623` |

## CASEとreview所見の記録

旧FV revision `3fd20391`のfile SHA `94704ba448b00df43651ca1dfa01835472132ce3023d829ea5bb690926fa3f02`から旧48 literal行とIDを読み、全literalが旧source内にあることを照合した。現FVは66物理行・66 unique IDで旧48 IDをすべて保持する。単なる件数を完全性claimにしない。

- **M18**: 旧r05結合literalをraw保全し、同じIDの現行行を非計数indexとして扱う。Full Vと明示的に選択されたScrum scopeを分離し、Full V側のslice delta、Scrum Reverse、SR4 obligation生成拒否をそれぞれ単一出力の3 caseとして記録する。未実行fixtureの設計記録であり、独立closure判定ではない。
- **M21**: 任意の「選択source既存owner」を追加しない。workflow/style/triggerは固定L2-002/003、verification obligation/pair oracleはL2-004/022へcauseに沿って戻し、個体identityまたは原因が未知ならunknownを保つ。
- **共通FR参照group**: suffixなし`FR-HARNESS-L3-046`はFR-01〜04を束ねるtraceability groupで、独立要求・oracle・scopeを追加しない定義を記録する。

## 過去監査の不変性と検証限界

body commitで変更されたのはL3/L10六本文だけで、`docs/governance/audits/`は変更されていない。追跡済みの名前に046を含むaudit blobsはparent/current間で同一。入力readonly-audit JSON SHAも記録した。

Root報告のgovcheckとdiffcheck PASSは引継ぎ情報として記録し、ここでは再実行していない。runtime/fixture/test/CIの実行、独立review、L3承認、意味完全性、review findingの正式closureは未確認。
