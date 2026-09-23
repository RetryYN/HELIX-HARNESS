# SCF-B-0146 既存218 evidence partitionの固定BASE横断再集計

既存のFR／NFR／BR／TR evidence partition 9束を、#2083／#2085の20 unit束へ依存せず、固定BASEのGit object bytesから再導出するresearch-only Scaffoldである。対象は218 recordで、内訳はproduct unit 217件と`IRCONN-HIL-BR-09-HARNESS-OS` 1件のconnectionである。product unitの分母へconnectionを混入させない。

固定BASEは`94d99ebb4c55c2edb0575ac2dc100af0d5b93b90`。入力は既存9 partition、crosswalk、product-unit decomposition、旧asset disposition／decision／copy-read-after ledgerだけであり、`git show BASE:path`のbytesから読む。#2083／#2085のbundleは入力oracleから除外している。

再集計結果は598 semantic review edge、355 unique old asset、asset reference 598件である。7状態fieldをunit単位へ再分類し、次を固定する。

- old implementation: `unknown` 218/218
- old degradation: `unknown` 218/218
- old failure: `unknown` 218/218
- consumer: `pending` 218/218
- current implementation: `unknown` 218/218
- acceptance: `unknown` 218/218
- unimplemented: `not_assessed` 218/218

各recordには、固定BASEのsource partition row、crosswalk row、decomposition candidateのpath／line／row digest、edge／asset集合、直接証拠の不在理由を記録する。直接証拠の不在は未実装・failure・縮退の断定へ変換しない。

## 解除に必要な証拠schema

7 fieldごとに、unknownを解除するための`artifact_keys`、`relation_keys`、`human_decision_keys`を`inventory.json`と各recordへ登録している。source存在、candidate pool、static coverage.failure、consumer ref、current requirement candidateだけではこのschemaを満たさない。

old implementationには固定revision source blob、実行／test／acceptance receipt、unit atomへの完全結合が必要である。degradationにはbefore／after、trigger、対象atom、revision付きtransition receipt、failureにはfailure codeとstatus／exit付きreceiptが必要である。consumerにはconsumer identity、closure/read-after、unit／requirement結合が必要である。current implementationとacceptanceには現行artifactと明示verdictが必要である。unimplementedにはunitを指定した明示的non-implementation decisionが必要で、receipt不在だけでは断定しない。

## 成果物

- `inventory.json`: 固定BASE、入力digest、217 product unit／1 connection、598 edge／355 asset、7 status分母、解除証拠schema、負例コード。
- `evidence.jsonl`: 218 recordの独立再導出結果。
- `common.py`: 固定BASE読込、record集合、edge／asset集合、status境界の共通処理。
- `build.py`: 固定BASEからbundleを再生成するgenerator。
- `validate.py`: generatorをimportせず固定BASEから期待値を再導出し、分母、集合、digest、schema、authority境界をfail-close検査するvalidator。
- `selfcheck.py`: 16件の改竄負例を期待error code付きで検査する。
- `PR-DRAFT.md`: Draft PR本文。
- `../bindings/SCF-B-0146.json`: bundle全成果物と入力責務を登録するBinding。

## 検証

```text
python3 scaffold/legacy-evidence-crosswalk-0146/build.py
python3 scaffold/legacy-evidence-crosswalk-0146/validate.py
python3 scaffold/legacy-evidence-crosswalk-0146/selfcheck.py
python3 -m py_compile scaffold/legacy-evidence-crosswalk-0146/*.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

旧archiveのsource／test／runtime／hook／CIは実行しない。validatorのPASS、候補asset、static source、failure coverage、consumer referenceから正式実装、未実装、縮退、failure、acceptance、authority、successorを生成しない。正式crosswalk、decomposition、product L1、authorityは変更しない。#1813へは進捗参照のみを付す。

この環境では `helix` CLIが不在のためwrapper経由のstatus／doctorは検証していない。記載した候補bundleのPython処理、`scfctl`、独立Git/object static checkを直接実行した範囲が検証証拠である。


## 移管記録と意味境界

作業ブランチ／残置worktreeの整理経過はIssue #2093へ接続する。これは作業管理の追跡だけであり、要求意味、採否、正式なunit判断、Bindingの置換・退役authorityを持たない。

この束は `/home/tenni/.helix-worktrees/legacy-evidence-crosswalk-0134` の未追跡8ファイルから移管した。元のSHA-256、source/destination branch、固定BASE、許可したidentity-only置換を `source-transfer-manifest.json` に記録する。`SCF-B-0134` は移管先BASEで別用途に割当済みのため、この束だけを `SCF-B-0146` へ変更した。bundle名も新しいBinding IDと一致させた。218 record／598 edge／355 assetの意味・値と除外境界はID変更の対象ではない。

#2083／#2085の20-unit bundleは入力partition、crosswalk、validator oracleのいずれにも含めない。#1813は進捗参照だけであり、要求承認やunit evidenceを生成しない。旧asset dispositionでは対象355 asset中348件がunresolved／historical／implementation unknown、残る7件だけが `source_snapshot_preservation` としてsource snapshotのread-only保存を示す。対応するdecision 14行（7件のrev2記録と7件のrev3 human-confirmation待ち訂正）とcopy/read-after 7行は、その物理保存のdigest／consumer対応を裏付ける。それらはunit implementation証明やconsumer closureではない。入力partitionには実装・縮退・failure・non-implementationをunitへ直接結合する明示receiptがなく、全218件でold implementation／old degradation／old failure／current implementation／acceptanceは `unknown`、consumerは `pending`、unimplementedは `not_assessed` を保つ。

source partition 9束は計218 row（29, 27, 37, 7, 23, 19, 31, 29, 16）。598 semantic review edgeと355 unique old assetは静的な対応・検討候補の集合であり、実装完了、障害、未実装、受入、authorityを意味しない。
