# Wave35 direct semantic review method（2026-09-22）

## 目的と境界

Wave35は、旧HELIX要求をHELIX-HARNESS、HELIX-OS、HELIX-Web、HELIX-Web-OSの四製品候補へ分類するdirect semantic reviewの第35波である。分母は218 product-unit候補であり、`legacy-requirement-atomization-review-queue.jsonl`の721 review unit（A1 queue）とは別系列で、進捗へ合算しない。

作業treeは専用worktree `/home/tenni/HELIX-HARNESS-wave35`、parent/current/stacked PR parentはPR #1998 Wave34 exact HEAD `2ee884951b279aa8b054c84efef7b24863874625`に固定した。このcommitの親は `aee323a016315b0562f7d44e197df681c663cb2a` であり、rebase、merge、rebaselineは行っていない。作業中に `origin/main` は #1990 merge後の `2ff4f888249b350afb624e359eaa8e3f3ea6defb`へ進んでいたが、stacked parentの代用にはしていない。既存のmain merge lineage `fbeee47920ed8b2992ae123b00c224ff88987c50` とその2 parentsはmetaへ保持した。commit、push、PR、merge、Issue操作は行わない。

## 選定方法

未レビューでsource chainが連続するFR49〜FR55から10 unitを選んだ。FR49のHorizontal V-Pair、FR50のledger refactor、FR51のauthoring admission、FR52〜53のcanonicalization／revision identity、FR54〜55のcontract／template calibrationへ続くため、source semanticsのまとまりと製品責務境界を保てる。既レビューunit、既レビューasset、既レビューedgeは除外した。選定unitは次の10件である。

`IRUNIT-HIL-FR-49-HELIX-HARNESS`、`IRUNIT-HIL-FR-49-HELIX-OS`、`IRUNIT-HIL-FR-50-HELIX-HARNESS`、`IRUNIT-HIL-FR-50-HELIX-OS`、`IRUNIT-HIL-FR-51-HELIX-HARNESS`、`IRUNIT-HIL-FR-51-HELIX-OS`、`IRUNIT-HIL-FR-52-HELIX-OS`、`IRUNIT-HIL-FR-53-HELIX-OS`、`IRUNIT-HIL-FR-54-HELIX-HARNESS`、`IRUNIT-HIL-FR-55-HELIX-HARNESS`。

各unitはrequirement、design、implementation_sourceの3 edge、合計30 edgeとした。requirement edgeだけを同一要求IDのexact source contractとしてconfirmedにし、design／implementation_sourceはbounded static candidate evidenceのままunresolvedとした。source path本文を候補検索とcatalog identityで照合し、candidate集合、未選定集合、phase poolのdigestをmetaへ固定した。asset選定はWave1〜34のnon-requirement assetと重複させていない。

要求sourceのexact anchorは旧archiveの`requirements-ir/requirements.json`と旧原文 `docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:139-145`である。候補product_scopeはrowの候補値を保持し、要求assetのcandidate_product_targetsに含まれるHELIX-Web／HELIX-Web-OSを消去しない。product boundary、atom split、successor assignmentは人手判断待ちである。

## 実装・degradation・phaseの扱い

旧archiveのruntime、test、CIは実行していない。candidate assetの存在、source hash、catalog classification、phase poolからimplementation成立、degradation、failure closure、consumer closure、authority承認、successor割当を推論しない。全rowでauthority effectは`none`、phase authorityは`candidate_unchanged`、current implementationは`not_established`、legacy executionは`not_run`、new buildは`false`、consumer closureは`pending`とした。unit aggregateのdegradationは`not_assessed_at_requirement_unit_level`である。

## 検証

`python3 docs/governance/tools/verify_legacy_requirement_direct_semantic_review_wave35.py`を実行し、schema10、exact source spans、catalog identity、candidate subset、phase pool、Wave1〜34のedge／asset重複、累積件数、stale-anchor／outside-candidate／extra-authorityのnegative checksを静的に検査する。旧runtime、旧test、旧CIは検証経路に含めない。

今回、人手で確認した検証幅は10 unit（30 edge）であり、各unitのsource span、role、catalog source、evidence bindingを個別に確認した。これは今回の検証幅の記録であり、10件以上の安全性や拡大上限を断定するものではない。manual選定が律速となることを観測したため、次batchはsource chainごとに独立確認し、幅の拡大可否を改めて判断する。
