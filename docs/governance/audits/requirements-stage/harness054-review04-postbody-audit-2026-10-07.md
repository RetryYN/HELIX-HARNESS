# HARNESS-L2-054 review04 postbody 時点監査

Root統合後の本文をread-afterした証拠候補です。正本audit、worktree、PR metadataは変更していません。

- PR #2646 body commit/HEAD `6f1d726d9b1865977c2b70d6b3df1c6e01272cf0`（parent `50e8292d6cd4156818940ea4904bdc9c1effb62f`）、base/merge-base `0acbed34bfda48e32092feb63db61d2eff6d5ec4`。
- Root報告: govcheck 7622/57/58、diff PASS。本Workerは再実行していません。
- v2候補 JSON SHA `1166482f708422413b0069d62d2e91890c98921b66da311c308540e3f734db91`、MD SHA `b65b0378be1509c59a48a1600ffd59f3d305845d5864b84c54885f7a76487ddf`。
- formal review04全8 comment raw SHA `3b36463989689e570af6b6a71b85d819aecd54122ae8ef940e1e3a2111a952ce`。formal全コメント間のR1–R16 rawと、最終comment `6026691451`のreviewer自身によるM1前半挙げ漏れ記載、およびprior review03 raw/historyをJSONへ保持。

## 六本文actual blob照合

| 文書 | base bytes/SHA | current bytes/SHA | exact prefix | v2 after全byte一致 | suffix bytes/SHA |
|---|---|---|---|---|---|
| `docs/helix-harness/L3-requirements/business-requirements.md` | 13526 / `bd781ad052b14fdeadff8c4e3294ef6cf50ff921b7c202a148ed9c0780af1a24` | 18798 / `aaa82b5aa92945748a3400b53b41b715dfe5c5348e27d7b15b3c4762fab3fec1` | True | True | 5272 / `90eb7c2b4e5f051dd81b0bd31012ed9c4efffdccdab2b592ceaf7b5f0bb8bc79` |
| `docs/helix-harness/L3-requirements/functional-requirements.md` | 215357 / `a673be158e96dd92eb09f91432077244724a03d25bd4e0fd88482d6e42086f09` | 219574 / `40cc6861f4f8e4435ae36c26262763ca793c382cb0e13b0683a47a2c5fae02d3` | True | True | 4217 / `e4ca11d6f6540268ece35d036f019dd453e8283111a0f203a4bc43a364262702` |
| `docs/helix-harness/L3-requirements/nfr-grade.md` | 43828 / `4066acf1940761ef57fd781b878d933324f5d248465c44bb44f3e8abda235f7e` | 50296 / `130188f764780cc46cb916dabfb66447a048f109cbcb4f5bd29ed60d4b59821c` | True | True | 6468 / `77e52a53b412d4892b7ac1e0b54b9238634429e44317d5cb1d93f58e571766a2` |
| `docs/helix-harness/L10-verification/business-verification.md` | 9106 / `b756326334c652eec048e3ca34abc6a2a4df4638fa8eaa384c07a11801cfaa3e` | 15287 / `c2dde24657b93375676efcb32e88afd1b5e72eebebb48877cc7e978c96988339` | True | True | 6181 / `b523f49aa64cb0a2abd4850acb5db93b3f63dc1dcb928afff34b04687b3a7a0f` |
| `docs/helix-harness/L10-verification/functional-verification.md` | 678890 / `24d7f597211b05505876c25f0cbf403bece96dfa1a52854b8795e3a08cbb4a19` | 796916 / `71aee18f69de302943c68a80d1b7a0f7aff9b5fe5239d37ac3c439ac382418c1` | True | True | 118026 / `83f7fdc64b0929850c306474615db1bc3814c903c3efc75e88e5943bc7ce8706` |
| `docs/helix-harness/L10-verification/nfr-verification.md` | 37382 / `89d26dcd990b8bd6b8305a2a8c8a8017df1f8179c95edf0c838ab2d27a98c4d3` | 43572 / `404b2c658e7f3f27d682687d0e3ae1bc387a3d2a0f47849802fcbc4b505018f8` | True | True | 6190 / `fe7c5672191ba2658e14bc9af91a8cf10bcc62dbe74af48091c5a90a049f18ca` |

## ID・表とsource pins

- FVは既存150 unique IDを維持し、追加12件を含む162 unique ID。追加rowはすべて6列でv2 candidateとraw一致。c50→c51–c62は空行なく連続し、matrix count前に空行を一つ置く。CASE-02は新規scope CASE参照をbaseline/index欄に持つ。
- c51–c53は仮登録だけ、c54はhandoffだけがcurrentである各別baseline。合成対象の全禁止outputはfalse/未発行。実PO row34採択は別source inputとして保持。
- c56/c60は旧source由来scope valueの再使用によるstale、c57/c61は同current source revisionの期待scope `scope/stage3` と `scope/other` の不一致によるconflictを一つのscope value fieldだけで表す。source/revision fieldはcurrentを維持。
- 旧source 100 literalは3fd snapshotのphysical lineからraw bytes/SHAを100/100照合。前候補から引き継いだ25 source/consumer pinsもfull file/span SHAが一致。
- fixed source revision `5aa100319361b0cc86edd3c51815ec777d55410a`: L2:1154–1162 span SHA `b76b7b1adec804a25bd9333663aa9b0d074f68518764c2874c994bcdf6ead193`、L11:865–875 span SHA `5d1ab0bad44ae305053932f0c82bcf472e145046125b638f5facab13eaaa2aa0`。PO row34 span SHA `5ad1167ad45d7f2befba1423f20dd5ffc0d9e4c2c5846f913b8174f836d17a7d`。

## 確認の限界

- HEAD/base、六本文full bytes/SHA/prefix、v2 after一致、162 ID、12行6列、表連続、固定親/PO、旧100 raw、25 source pins、formal履歴をread-onlyで確認。
- Root報告の静的check結果は報告値として分離し、worker側で再実行していない。
- fixture未実行、独立review未実施、Opus/Fable合意・L3承認未成立。過去auditは書き換えていない。
