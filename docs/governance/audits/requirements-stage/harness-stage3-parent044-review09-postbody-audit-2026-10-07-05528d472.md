# HARNESS-L2-044 review09 postbody 時点監査

Root統合後の本文revisionをread-afterした/tmp証拠候補です。正本audit、worktree、PR metadataは変更していません。

- PR #2641、body commit/HEAD `05528d4727e073085bb5841d4ce6f2eed630683b`（parent `975cfa50fedf4b86c50cc5462e627e897921a6c4`）、base/merge-base `0acbed34bfda48e32092feb63db61d2eff6d5ec4`。
- Root報告: govcheck 7622/57/58、diff PASS。本Workerは再実行していません。独立checkpoint fileは確認できませんでした。
- 候補JSON `/tmp/harness044-review09-m1-candidate-2026-10-07.json` SHA `ca396a525154e75bb26d9b6b8b10545e4d149d3126093ca27b8c715c5f121ef0`。件数を修正したcandidate MD `/tmp/harness044-review09-m1-candidate-2026-10-07.md` SHA `a5ab4f5737fb7865429866dcc2acbcc24d0e0e2c709974789fbe597ae4c69335`。
- formal review09 comment `6026542146`、全18コメントraw SHA `bdb62cc8f507071dd042635c417ecde0014c15037ebcb32fdbffccfb626a9706` をJSONに保持。R1–R27、過去reviewer miss、X1の原文履歴もrawで保持。
- fixed L2-044 318ec4a L2:1002–1011 span SHA `690f2bfa866c778be47459baa99139905260d3ca569739a4d4707c61096212f2`。fixed L11-044 L11:735–745 span SHA `9c79b73100f4afa63abba7f79d47b8931a1c29983ac08a3e4ded95e56107bfc8`。
- 旧39 literalは旧revisionの物理行raw SHAを39/39再照合。過去review08 auditとhistoric X1 pinはimmutable参照として保持。

## 六本文のactual blob照合

| 文書 | base bytes/SHA | current bytes/SHA | base prefix | 追加suffix bytes/SHA | candidate after一致 |
|---|---|---|---|---|---|
| `docs/helix-harness/L3-requirements/business-requirements.md` | 13526 / `bd781ad052b14fdeadff8c4e3294ef6cf50ff921b7c202a148ed9c0780af1a24` | 17097 / `7639b2c94720e95b2ad1e0fa1805a374d51f9bd3561375b9f403f218f39a3310` | True | 3571 / `73e6a1a20bd5cc91f4e09e0c425f25a99484016c2574efc9f39f4a39acdaab4f` | True |
| `docs/helix-harness/L3-requirements/functional-requirements.md` | 215357 / `a673be158e96dd92eb09f91432077244724a03d25bd4e0fd88482d6e42086f09` | 224191 / `82e3ea0a8a54124e2a5ca9bca7dc0cf24022f78436ce2557caa35fb9be5ccfdf` | True | 8834 / `be61b7e6864457dda4fb640ac6a661ee106848307cb322e35bdf9ec5a989efda` | True |
| `docs/helix-harness/L3-requirements/nfr-grade.md` | 43828 / `4066acf1940761ef57fd781b878d933324f5d248465c44bb44f3e8abda235f7e` | 47324 / `4b5e3cf3e5d5b61f43b77a13bfb04f2a27ac66b305eb973f3435c7aca84420ee` | True | 3496 / `aa8c65d49949c1eec9c8f1b7451c1011fd0491141275bee1d2a67f31fbef0094` | True |
| `docs/helix-harness/L10-verification/business-verification.md` | 9106 / `b756326334c652eec048e3ca34abc6a2a4df4638fa8eaa384c07a11801cfaa3e` | 13412 / `5de19ba1be13027ae2177abe79d1f5ea875544a33d5c9dd6d05371a74a8ccc56` | True | 4306 / `bf7a3634f3c695554746cf239536ae9b4da700ec6272453c4e3ed56fd0fc4026` | True |
| `docs/helix-harness/L10-verification/functional-verification.md` | 678890 / `24d7f597211b05505876c25f0cbf403bece96dfa1a52854b8795e3a08cbb4a19` | 760795 / `ad7ef81d9256cf9db1eb948d72ef8fa25a33efd623985423b8dcbdf4e0ce5cf7` | True | 81905 / `77f0c8484aaebfb7efe69ea4ce2918dda0cb5d706c7158f1203476a21a4298fe` | True |
| `docs/helix-harness/L10-verification/nfr-verification.md` | 37382 / `89d26dcd990b8bd6b8305a2a8c8a8017df1f8179c95edf0c838ab2d27a98c4d3` | 41518 / `deba7efb4d59619ae028a2f87cecd8850a4e02ab65a015308903d2bd65492daf` | True | 4136 / `5e685ac22ad516e2f059cc45768b08b087192e1de80e0e98a5abb2e28b4c0332` | True |

各current全文と追加suffix rawはJSONへ保持。六本文はすべてbase blobを完全prefixとして持ち、候補after bytes/full SHAと一致しました。候補の実差分はL10 functional-verificationへの15行追補のみです。

## 44セル、既存IDと追加候補

- current 91 unique = 既存76 ID保持 + 15追加候補。形式的にreview09が指定した14件とRoot検収補足のcontract-version field-present unknown 1件を区別し、全IDとCASE行rawはJSONへ記録。
- 11項目×4状態の全44セルを、既存CASEの実baseline/mutation/oracle/returnまたは追加CASEへ対応付けた。unknownはfield-presentで、missingと区別。
- `r09-002`はformal表のunknown CASE分類をraw保持する一方、物理rowはcontract revisionを「隠す」と記載しfield-present unknownを明示しない。この差を埋める意味推定をせず、Root補足CASEを別計数した。
- class identityのunknown/conflict/staleは既存要求owner区分へ返し、relationの3状態は選択済みL2-026設計relation owner区分へ返す。個体owner identity unknownは責務区分と別記し、返却を停止しない。

## 検証範囲と限界

- HEAD/base、六本文full bytes/SHA/prefix、candidate after一致、44セル、76→91 unique IDs、15行六列、fixed318 spans、旧39 raw literals、source/consumer pins、worktree cleanをread-onlyで確認。
- Root報告のgovcheck/diff PASSは報告として記録し再実行していない。
- fixture未実行、独立review未実施、Opus/Fable判断・L3承認未成立。以前のauditは書き換えていない。
