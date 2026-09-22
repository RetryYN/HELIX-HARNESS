# Wave36 status（2026-09-22）

Wave36の静的schema10 ledgerは7 product unit、21 edge（requirement 7、design 7、implementation_source 7）である。requirement edgeは7件confirmed、design／implementation_sourceは14件unresolved。Wave35までの138 unit／411 edgeに21 edgeを積み、累積は145 unit／432 edge、direct semantic reviewの残数候補は73 unitとなる。218 product-unit分母は維持し、721 review unitのA1 atomization queueはこの集計に含めない。

選定はFR56〜59、FR63、FR68〜69の未レビューsource semantic chainから行った。FR60〜62、FR64〜67は既レビューのため除外し、既レビューunit／edge／assetを再掲していない。HARNESS／OSのcandidateを記録したが、要求assetのcandidate_product_targetsにあるHELIX-Web／HELIX-Web-OSを保持し、四製品境界を確定していない。

検証結果:

```text
$ python3 docs/governance/tools/verify_legacy_requirement_direct_semantic_review_wave36.py
Wave36 static schema10 verification: PASS (role contracts and negative mutations included)
```

検証はledger、meta、catalog、crosswalk、decomposition、旧archive sourceの静的読み取りに限定した。旧runtime、旧test、旧CIは実行していない。current／parent／stacked parentは `19f5febe6af7fe8455aeb5b8fba03be41a4d3d38` に固定した。`origin/main`は #1990 merge後の `2ff4f888249b350afb624e359eaa8e3f3ea6defb`で、exact parentのancestorではないため、main driftとして記録した。Wave35 RH-2000-J01修正を親へ反映するrebaselineのみ行い、Wave36の意味・asset・edgeは変更していない。

stacked stop conditionは、exact parentの不一致、prior lineage digestの不一致、既レビューedge／asset重複、共有atomの未分離を検知した場合に停止して報告することである。今回の検証器ではstale-anchor、outside-candidate、extra-authorityのnegative caseも失敗を確認した。

全rowで次を保持する。

- authority effect: `none`
- phase authority: `candidate_unchanged`
- product alignment: `candidate_boundary_pending_human_decision`
- consumer closure: `pending`
- current implementation status: `not_established`
- legacy execution: `not_run`
- new build: `false`
- source atomization: `source_atomization_review_pending`
- degradation assessment: `not_assessed_at_requirement_unit_level`

したがって、今回の台帳は要求意味、製品境界候補、phase候補、design／implementation source候補のstatic evidenceを固定するもので、実装成立、実装品質、degradation、failure解消、consumer closure、authority承認を確定しない。今回手動で検収した幅は7 unit（21 edge）であり、これを安全なbatch上限とは扱わない。次batchはsource chainごとに独立確認する。

## 未解決の人手判断

- 四製品境界（特にHARNESS／OSからWeb／Web-OSへ跨ぐ責務）の確定
- source atomの分割、共有atomの所有、successor assignment
- phase candidateの採否とauthority
- design／implementation candidateの意味リンク、現行実装差分、degradation／failure closure
- consumer closureと受入oracleの確認
- origin/mainのbase driftを含む最新mainとの関係を、Wave35修正を含むexact stacked parentへどう積むか
