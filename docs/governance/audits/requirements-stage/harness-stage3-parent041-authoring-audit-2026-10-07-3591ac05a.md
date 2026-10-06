# HARNESS-041 起草時点監査

状態: 指定worktreeのbody・source・候補JSONの物理pin照合。独立review、意味承認、完全性認定、公開は行っていない。canonical編集なし。

- 対象body: `3591ac05a5ca181bb582c812a4c3236dd7de681c`（parent/base `a1bcdba15b4c10271d80291dc6062cf31250cf3e`）。worktreeは `/home/tenni/.helix-worktrees/l3-harness-stage3-parent041`、状態は `## l3-harness-stage3-parent041...origin/l3-harness-stage3-parent041`。
- Root候補: `/tmp/root-harness041-six-suffixes-candidate.json` SHA-256 `29955ed37077e881c680c5a3288df1d4f55cb2789bcc9e2dd836f7e6f84f77ef`。
- 旧source inventory: `/tmp/harness-stage3-parent041-six-suffix-candidate-2026-10-07-e015c347.json` SHA-256 `b11697129409c18178da1e803c3383aaf0f5fbe3b89d4d60a1b3f74170bae300`。
- body checkpoint: `/tmp/root-harness041-body-checkpoint.json` SHA-256 `30acf836dac605e14b2d72d1055de9fdc93a89a5e2b6c37ee9be75e2881baf87`。

## 六文書のprefix / suffix / full照合

6ファイルすべてで、指定body commitのfull bytesはcheckpointと一致し、`a1bcdba...` のbase bytesにRoot候補suffixを連結した内容とも一致した。Root suffixのbytes/SHAもbody末尾の実bytesと一致する。

| 文書 | base SHA | suffix bytes / SHA | full SHA | 判定 |
|---|---|---|---|---|
| `business-requirements.md` | `87e3533a49f5284aed2535f9216683f9ef013ed7434c9816a73596b81a5e09fb` | 286 / `93f07196fc0ebe3a52892813247e28c9ac528d5854b57c5252212e2f5824dfcf` | `3d33e0ce83148d65e7762c5b56da5168356fe6e26a3bfdc3bff10430f70f0036` | PASS |
| `functional-requirements.md` | `ddc4288e77effd48553c1cf4ada66e74dffef39c5fc209c1d3038b0bc83a8ad8` | 7893 / `4174645252ed34adead3ed421160126a9b1e2d28b7e07f62c5cad33ba2bf75e1` | `1214092bf224ceba889ff3d9dd84ee8be0081d4c4eca21dc86e0d641030c3d26` | PASS |
| `nfr-grade.md` | `75cbdcc058aff99a9efd99b9d3344e6920e864b1bb603a1ac77a0e447f2f60af` | 912 / `1005f9081397006f61dc288a02ee13d4e6c74e07bbc6be411b1b5c6768ebb768` | `6a11a61b0b7ef516074dcbb6ed3589abd8b098a38741c75898b4d5a288748700` | PASS |
| `business-verification.md` | `a1ff88366ef98368fa8cbd628f499aa50a73cd05a75d54ff64e353a1626cd67c` | 287 / `a973d5d25f261671968a84d0c46fe0ecad3938556a336f97fb24292c704cc355` | `0a761e2889f28b88fe13acc6caca98a1dddcc7e122d2966a473b7716b5d59a83` | PASS |
| `functional-verification.md` | `4f87643397e4e1c2a94d07537770510f634c509eaeb1701c3159a0d143d98cc1` | 28611 / `7f654a35230008084da230b2683173372801827b9701635ca85bde6b27176260` | `2d21fceeefc0933c4ee6b611cd7fcfb1255e5168984879fda545f2ff5461919f` | PASS |
| `nfr-verification.md` | `e5b090ba97c6a5237b47b890d7a86453ed5f602ee09c9e531ab3b55698d13a7a` | 918 / `7ce5bb4fadcae470b83b86046e92663e18c4148356524aea34714e40655cc99f` | `18b7305354f26d8a6fa8c1e760ca45eeadec805fc6ece496ab0eb3ec687514ad` | PASS |

候補JSONの`main_authoring_base`は旧 `e015c347...` と記録されている一方、body checkpoint/target commitの親は `a1bcdba...` である。6候補suffixのbytesは同一で、実bodyは `a1bcdba... + suffix` と完全一致する。このrevision metadata差を監査記録に保持し、候補JSON自体は変更していない。

## 固定親とPO行

L2-041の実際の物理sliceは `ad8e344c318fd27275be9edf807c534912df52c11b786937fb1e7773b31358ec`、L11-041は `259c383203d86b79c159395b64c0d03d88db665486d28f5fc2aea8f7556a73a8` でRoot候補の補正pinと一致した。両full-file pinも固定revisionで一致。PO row 46 `MPR-RC-HARNESS-L2-041-002` はbody base `a1bcdba...` の実物理行とraw-LF hashが一致した（L2 fixed parent 318ec4...には同pathが存在しない）。

初期source inventoryのfixed raw literalにはL2/L11各1 byteの余分な末尾LFがあった。旧reported hashはL2 `c5411d1e…`、L11 `af2b1af9…`。実physical sliceはそれぞれ3967/2413 bytesで、補正後hashはL2 `ad8e344c…`、L11 `259c3832…`。Root候補は実physical sliceを採用し、旧値との差を保持した。

## 旧source・L3/consumer・旧CASE

旧主要source `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md` の全bytes/SHAと行136–137の実物理行を照合した。旧asset IDは `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`。source atom inventory、asset ledger row、旧L3資料3件のfull pinsも実objectで照合した。PO adoption rowとr05旧/新literalの対応をJSONに収録した。

旧FV source `docs/helix-harness/L10-verification/functional-verification.md`（revision `3fd20391f842310012d09c33f5383497898b3afe`）から38 literalを物理行ごとに照合し、38 unique IDすべて一致。concatは15042 bytes、SHA-256 `d61fa62a717162e0e7d4993b3112de11ea09aa71e533e123d597cf63d75d2386` でcheckpoint/candidate値に一致した。各行のraw-LF SHAとno-LF SHAを分けてJSONへ残した。

## r05 route correction

旧 `CASE-HARNESS-L10-041-r05-root-revision-hidden` のraw literal/hashは旧source行と一致する。改訂body literal/hashは実FV suffixに1回あり、選択input/applicability不備をHARNESS-L2-009へ戻すrouteと、valid input後の出力provenance不一致をHARNESS-L2-041抽出契約ownerへ戻すrouteを分けている。個別owner ID不明でも責務区分を残す。

## Root補正と現行CASE数

Root候補suffixを実物理行から数えると、FVは6列61行・61 unique ID。旧38 IDをすべて保持し、追加は23 ID。025/026の`{parentid}` 4行は実IDへ置換され、T0合成baselineが本文にあり、025 design-result / 026 inspection-result生成拒否の2行が個別に存在する。これら2行のraw literal/hashはJSONに収録した。

Root候補JSON内の`functional_verification_case_inventory`はLuna初版のhistorical metadataとしてラベル付けする。そこではbody definitions 59、新unique 21と記録され、現行suffixの61行・追加23 IDと合わない。差分2件はRoot correctionsに記録された025/026 result-generation拒否fixtureで、実body/checkpointの正本値は61。候補JSONの埋込inventoryは変更していない。

## 初期source inventoryとの差

初期source inventory `/tmp/harness-stage3-parent041-six-suffix-candidate-2026-10-07-e015c347.json`のFV suffixは26828 bytes / `95511368dfb0431d89d56d1a31e29e7561434863250caa225229a2012c15e439`。Root最終suffixは28611 bytes / `7f654a35230008084da230b2683173372801827b9701635ca85bde6b27176260`。他5 suffixは同一text/hash。FV差分はT0、4つのplaceholder置換、2つの新規出力拒否fixtureに限定される。

この監査は指定commit・tmp候補・checkpoint上のbytesと識別子を照合した記録であり、CASE数から意味網羅性やL3/L10承認を推定しない。
