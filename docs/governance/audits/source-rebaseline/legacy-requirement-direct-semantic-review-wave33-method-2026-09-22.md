# Wave33 direct semantic review method（2026-09-22）

## 目的と境界

Wave33は、旧HELIX要求を四製品（HELIX-HARNESS、HELIX-OS、HELIX-Web、HELIX-Web-OS）の候補product unitへ分類するdirect semantic reviewの第33波である。対象分母はdirect semantic reviewの218 product-unit候補であり、`legacy-requirement-atomization-review-queue.jsonl`の721 review unitとは別系列である。

作業treeは専用worktree `/home/tenni/.helix-worktrees/legacy-semantic-review-wave33`、stacked parentはWave32 Draft PRのexact HEAD `ed3d949cb6588454d7f98a768a3411a5186c93cd`に固定した。main merge revisionは既存Wave32 lineageの`fbeee47920ed8b2992ae123b00c224ff88987c50`を保持する。commit、push、PR、merge、Issue操作は行わない。

## 調査入力

Conceptと製品責務は[`docs/concept/product-boundary.md`](../../../concept/product-boundary.md)を正本とした。要求sourceは旧archiveの`requirements-ir/requirements.json`、旧要求原文は`archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md`、候補assetは`legacy-asset-phase-product-classification-bootstrap.jsonl`、unit境界とphase候補は`legacy-ir-product-unit-decomposition-bootstrap.jsonl`、phase evidenceは`legacy-requirement-implementation-crosswalk-bootstrap.jsonl`から静的に照合した。

FR38〜FR42の要求source行はそれぞれ3017–3059、3060–3102、3103–3145、3146–3188、3189–3231、要求原文行は128〜132である。要求IR全体のdigestは`80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`で、要求statement digestはledgerとverifierに固定した。

## 選定方法

未レビューのproduct unitから、要求原文の連続source spanと責務のまとまりが一致するFR38〜FR42の8 unitを選んだ。decompositionの`shared_source_overlaps`は全unitで空である。各unitについて、source path本文をanchorのいずれかでbounded global searchし、candidate集合、未選定集合、phase poolのdigestをmetaへ記録した。検索candidateであることは意味・採用・実装の証拠としない。

各unitはrequirement、design、implementation_sourceの3 edgeを持つ。requirement edgeだけを同一要求IDのsource contractとしてsemantic link confirmedとし、designとimplementation_sourceは候補 evidenceのままunresolvedとした。全edgeでauthority effectは`none`、consumer closureは`pending`、legacy executionは`not_run`、new buildは`false`である。

旧archiveのruntime、test、CIは実行していない。候補assetの存在からimplementation、degradation、failure closure、consumer closure、authority、successor assignmentを推論しない。product boundaryとsource atomizationはhuman decision pendingとして保持した。

## 検証

静的verifierは`python3 docs/governance/tools/verify_legacy_requirement_direct_semantic_review_wave33.py`で実行する。verifierはschema10、exact source span、catalog identity、candidate subset、phase pool、prior wave1〜32のedge／asset重複、累積値、negative stale-anchor／outside-candidate／extra-authority checksを検査する。
