# 旧Worker実行・隔離・checkpoint・quota test design 13件の静的分類候補

## 範囲

BASE `b1578f4fda5d5ecd01c9565ee81f4ddf0cebfe1a` の `legacy-asset-phase-product-classification-bootstrap.jsonl` から、`docs/test-design/helix/` かつ `PHCAP-07` 候補の208件を再導出した。SCF-B-0148の52件をID・source path・source SHA-256の各集合で除き、残る156件のうち前回read-only `worker_next_batch` の13 IDを再照合した。13件はすべて残余集合にあり、三軸の重複は0。

13件すべての旧source本文とpair本文を静的に通読し、機能責務・境界・否定条件を確認した。旧sourceとpairはBASEのGit blob、archive MANIFEST、SHA-256、frontmatterを静的に照合した。source/pairはコピーしていない。長文4件（event projection L8/L9、slot scheduler/quota L8/L9）はrecordに主要義務とowner境界を支える正確なsource行を追加した。全て設計記述として読んだもので、archive test/runtime/CI/workflowは実行していない。

## 候補の読み方

分類recordは承認済みConcept v4.1と4対象L1のexact SHAを前提に、Worker・state・検証契約の責務接続候補を記す。製品owner、phase admission、要求採否、successorは決めない。複数候補phaseはbootstrapのまま保持する。`PHCAP-07`はVerification/L10、`PHCAP-10`はWorker実行、`PHCAP-20`はMemory/継続再構成の候補文脈である。phase inventoryの実装状況や縮退はphase全体の記述であり、個々のassetへ投影しない。

各assetはlegacy asset ledger上`unresolved`、implementation status `unknown`。frontmatterの`confirmed`、test oracleや引用test path、negative caseは実装、実行、pass、観測failure、consumer利用を証明しない。記録したfailureは設計上の反証条件であり、実行で観測したfailureではない。decision/read-after rowsは0、consumer closureは`pending`。crosswalk bootstrapのcandidate poolは探索候補で、direct semantic link/consumerではない。親pairのfrontmatter上のpair/group関係も歴史的対応であり、現在のconsumerや実装状態を意味しない。

4製品L1はdecision recordの各exact revisionを参照し、HARNESSの検証契約、OSのWorker/state統制、Webの利用者向け進行価値、Web-OSのtenant/service runtimeを分けて評価した。Web/Web-OSはこの旧test design群から直接scopeを導かない。

## 検証境界

このbundleはresearch-only Scaffoldである。archive source/runtime/test/CI/workflow/hook/adapterは実行しない。formal ledger、実装status、phase、requirements、successor、consumer closureを更新しない。

検証手順は `python3 scaffold/legacy-worker-execution-checkpoint-quota-0150/validate.py` と `python3 scaffold/legacy-worker-execution-checkpoint-quota-0150/validate.py --selfcheck` に加え、`python3 scaffold/tools/scfctl.py validate`、`stale`、`residuals`、`git diff --check`。selfcheckは一時copyで4つのnegative caseを変異させ、validatorが拒否することだけを確認する。

## main更新時の停止条件

BASE `b1578f4f`はこの調査の固定snapshotである。PRを作る場合は、公開前に最新`main`から208 cohort、SCF-B-0148除外集合、13件のsource/pair bytesとdigest、4 L1 approved digest、phase inventory、binding upstreamを全て再導出・再照合する。mainが進んでいればこのbundleの比較結果を最新mainに関する証拠として使わず、差分の意味を読み直すまで停止する。
