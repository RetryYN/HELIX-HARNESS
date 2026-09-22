# Wave34 direct semantic review method（2026-09-22）

## 目的と境界

Wave34は、旧HELIX要求をHELIX-HARNESS、HELIX-OS、HELIX-Web、HELIX-Web-OSの四製品候補へ分類するdirect semantic reviewの第34波である。分母は218 product-unit候補であり、`legacy-requirement-atomization-review-queue.jsonl`の721 review unit（A1 queue）とは別系列で、進捗へ合算しない。

作業treeは専用worktree `/home/tenni/HELIX-HARNESS-wave34`、parent/current/stacked PR parentはWave33 exact HEAD `aee323a016315b0562f7d44e197df681c663cb2a`に固定した。既存lineageのmain merge revision `fbeee47920ed8b2992ae123b00c224ff88987c50`とその2 parentsはmetaへ保持した。commit、push、PR、merge、Issue操作は行わない。

## 選定方法

未レビューでsource spanが連続するFR37、FR44〜FR48から9 unitを選んだ。FR37はsource capability atomization、FR44〜48はtemplate improvement、requirement definition、layer ledger、template obligation、vertical pair gateへ続くため、source semanticsのまとまりと責務境界を保てる。既レビューunit（FR43-HARNESS、FR45-HARNESS）は除外した。選定unitは次の9件である。

`IRUNIT-HIL-FR-37-HELIX-OS`、`IRUNIT-HIL-FR-44-HELIX-HARNESS`、`IRUNIT-HIL-FR-44-HELIX-OS`、`IRUNIT-HIL-FR-45-HELIX-OS`、`IRUNIT-HIL-FR-46-HELIX-HARNESS`、`IRUNIT-HIL-FR-46-HELIX-OS`、`IRUNIT-HIL-FR-47-HELIX-HARNESS`、`IRUNIT-HIL-FR-48-HELIX-HARNESS`、`IRUNIT-HIL-FR-48-HELIX-OS`。

各unitはrequirement、design、implementation_sourceの3 edge、合計27 edgeとした。requirement edgeだけを同一要求IDのexact source contractとしてconfirmedにし、design／implementation_sourceはstatic candidate evidenceのままunresolvedとした。source path本文をbounded global searchで照合し、candidate集合、未選定集合、phase poolのdigestをmetaへ固定した。asset選定はWave1〜33のnon-requirement assetと重複させていない。

要求sourceのexact anchorsは旧archiveの`requirements-ir/requirements.json`と旧原文 `docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:133-138`である。候補product_scopeはHARNESS／OSを保持し、要求assetのcandidate_product_targetsに含まれるHELIX-Web／HELIX-Web-OSを消去しない。product boundary、atom split、successor assignmentは人手判断待ちである。

## 実装・degradation・phaseの扱い

旧archiveのruntime、test、CIは実行していない。candidate assetの存在、source hash、catalog classification、phase poolからimplementation成立、degradation、failure closure、consumer closure、authority承認、successor割当を推論しない。全rowでauthority effectは`none`、phase authorityは`candidate_unchanged`、current implementationは`not_established`、legacy executionは`not_run`、new buildは`false`、consumer closureは`pending`とした。unit aggregateのdegradationは`not_assessed_at_requirement_unit_level`である。

## 検証

`python3 docs/governance/tools/verify_legacy_requirement_direct_semantic_review_wave34.py`を実行し、schema10、exact source spans、catalog identity、candidate subset、phase pool、Wave1〜33のedge／asset重複、累積件数、stale-anchor／outside-candidate／extra-authorityのnegative checksを静的に検査する。旧runtime、旧test、旧CIは検証経路に含めない。

manual source/asset照合がbatch幅を律速することを、今回のFR37とFR44〜FR48の9 unit（27 edge）で観測した。今回の9 unitは各unitのsource span、role、catalog source、evidence bindingを個別に確認した検証幅であり、拡大上限は未確定である。次batchはsource chainごとに独立確認し、幅の拡大可否を改めて判断する。
