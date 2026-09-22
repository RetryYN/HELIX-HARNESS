# Wave36 direct semantic review method（2026-09-22）

## 目的と境界

Wave36は、旧HELIX要求をHELIX-HARNESS、HELIX-OS、HELIX-Web、HELIX-Web-OSの四製品候補へ分類するdirect semantic reviewの第36波である。分母は218 product-unit候補であり、`legacy-requirement-atomization-review-queue.jsonl`の721 review unit（A1 queue）とは別系列で、進捗へ合算しない。

作業treeはfresh isolated worktree `/home/tenni/HELIX-HARNESS-wave36`、parent/current/stacked PR parentはWave35 exact HEAD `19f5febe6af7fe8455aeb5b8fba03be41a4d3d38`に固定した。このrebaseline commitの親は旧Wave35 HEAD `0729fe14016e639f07ccdac038d8ce34a3aab639` である。`origin/main`は #1990 merge後の `2ff4f888249b350afb624e359eaa8e3f3ea6defb`へ進み、exact parentのancestorではないため、main driftとして記録した。Wave35 RH-2000-J01修正を親へ反映し、Wave36の意味・asset・edge差分は変更していない。

stacked stop conditionは、parent/current/stacked parentのいずれかが指定exact HEADと一致しない場合、または既存waveのdigest／edge／asset lineageが再計算と一致しない場合に停止し、rebaseline後もその不一致を報告することである。source chain、shared atom、authority状態に未解決が残る場合も、下流実装へ進めない。commit、push、PR、merge、Issue操作は行わない。

## 選定方法

FR56以降のsource chainを走査し、既レビュー重複を除いた未レビューの7 product unitを選んだ。FR56〜59はworkflow binding、judgment pack、改善loop、agent contractへ続き、FR63はeffort routing、FR68〜69はdelegation wire／audit evidenceへ続く。FR60〜62、FR64〜67は既レビューunitのため、source chain上の境界を確認したうえでWave36の新規edgeには再掲しなかった。未レビューunitを10件に合わせるため別chainを混在させていない。

選定unitは次の7件である。

`IRUNIT-HIL-FR-56-HELIX-HARNESS`、`IRUNIT-HIL-FR-57-HELIX-HARNESS`、`IRUNIT-HIL-FR-58-HELIX-OS`、`IRUNIT-HIL-FR-59-HELIX-OS`、`IRUNIT-HIL-FR-63-HELIX-OS`、`IRUNIT-HIL-FR-68-HELIX-OS`、`IRUNIT-HIL-FR-69-HELIX-OS`。

各unitはrequirement、design、implementation_sourceの3 edge、合計21 edgeとした。requirement edgeだけを同一要求IDのexact source contractとしてconfirmedにし、design／implementation_sourceはbounded static candidate evidenceのままunresolvedとした。source path本文を候補検索とcatalog identityで照合し、candidate集合、未選定集合、phase poolのdigestをmetaへ固定した。asset選定はWave1〜35のnon-requirement assetと重複させていない。

要求sourceのexact anchorは旧archiveの`requirements-ir/requirements.json`と旧原文 `docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:146-159`である。候補product_scopeはrowの候補値を保持し、要求assetのcandidate_product_targetsに含まれるHELIX-Web／HELIX-Web-OSを消去しない。product boundary、atom split、successor assignmentは人手判断待ちである。

## 実装・degradation・phaseの扱い

旧archiveのruntime、test、CIは実行していない。candidate assetの存在、source hash、catalog classification、phase poolからimplementation成立、degradation、failure closure、consumer closure、authority承認、successor割当を推論しない。全rowでauthority effectは`none`、phase authorityは`candidate_unchanged`、current implementationは`not_established`、legacy executionは`not_run`、new buildは`false`、consumer closureは`pending`とした。unit aggregateのdegradationは`not_assessed_at_requirement_unit_level`である。

## 検証

`python3 docs/governance/tools/verify_legacy_requirement_direct_semantic_review_wave36.py`を実行し、schema10、exact source spans、catalog identity、candidate subset、phase pool、Wave1〜35のedge／asset重複、累積件数、role別必須欄・許容空値・語彙契約、意味反転／空化／bogus注入を含むnegative checksを静的に検査する。旧runtime、旧test、旧CIは検証経路に含めない。

今回、人手で確認した検証幅は7 unit（21 edge）である。これはFR56以降で残った未レビューunitをsource chain単位で確認した幅であり、10件未満となったことは安全な拡大上限を意味しない。manual選定の負荷とchain境界を確認し、次batchはsource chainごとに独立確認する。
