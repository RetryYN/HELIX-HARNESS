# HELIX全フェーズ Capability Inventory GitHub投影記録

status: projection_created_read_after
authority_effect: projection_only
repository: `RetryYN/HELIX-HARNESS`
source_commit: `04ca945a3`
source_sha256: `2aebd4e7824562328fc495cadc181841ee2741dd9723882af0df3ade49856bbb`

## 操作authority

POの指示「それぞれイシューを立てて、旧HELIXにあるか、どのLまであってを整理してどの製品に該当するのかを整理せよ」に基づき、親Issue 1件とフェーズ別Issue 20件を作成した。操作はIssue作成、既存label付与、親Issueへの子参照追記、read-afterに限定した。

## 投影境界

IssueはCapability Inventoryの作業projectionであり、要求採否、successor確定、L2／L11承認、L3／L10 freeze、実装開始、旧資産再利用許可、完了を生成しない。全taskは`new_build_allowed: false`で開始する。

## read-after

| 種別 | Task | Issue | state | label | remote body SHA-256 | updatedAt UTC |
|---|---|---:|---|---|---|---|
| 親program | `parent` | [#1888](https://github.com/RetryYN/HELIX-HARNESS/issues/1888) | `OPEN` | `state:proposed-upstream-waiting` | `a947cd8922e997b528bfc6865ec95f92f2dc03af1bdb4d6e40bbd5a9bd689dbd` | `2026-09-20T12:51:41Z` |
| phase task | `PHCAP-01` | [#1889](https://github.com/RetryYN/HELIX-HARNESS/issues/1889) | `OPEN` | `state:proposed-upstream-waiting` | `926362300cdb40f399ea4cb0d09d70c587ead853739ab8369e238912cfa3988f` | `2026-09-20T12:51:14Z` |
| phase task | `PHCAP-02` | [#1890](https://github.com/RetryYN/HELIX-HARNESS/issues/1890) | `OPEN` | `state:proposed-upstream-waiting` | `2807d347681fe0cab4ee1e694f0ebd099667d05ab375ed31dad1ee87a313535b` | `2026-09-20T12:51:16Z` |
| phase task | `PHCAP-03` | [#1891](https://github.com/RetryYN/HELIX-HARNESS/issues/1891) | `OPEN` | `state:proposed-upstream-waiting` | `1f05d54a9a048b00de178671dbff77753df6b58b404b5431f9b5de73bf5d647f` | `2026-09-20T12:51:17Z` |
| phase task | `PHCAP-04` | [#1892](https://github.com/RetryYN/HELIX-HARNESS/issues/1892) | `OPEN` | `state:proposed-upstream-waiting` | `579a117605ed85070ecd92c26ef18d7f505be90025c96550465e8d58c01b167b` | `2026-09-20T12:51:18Z` |
| phase task | `PHCAP-05` | [#1893](https://github.com/RetryYN/HELIX-HARNESS/issues/1893) | `OPEN` | `state:proposed-upstream-waiting` | `a47692c5e6746fcf73fff6978f636a82d6644ab3e12914c9a4d0dd6159d968a4` | `2026-09-20T12:51:20Z` |
| phase task | `PHCAP-06` | [#1894](https://github.com/RetryYN/HELIX-HARNESS/issues/1894) | `OPEN` | `state:proposed-upstream-waiting` | `fb891724912f10755c7241fd2e462d8aa37004936391489c232badbd72971cf6` | `2026-09-20T12:51:21Z` |
| phase task | `PHCAP-07` | [#1895](https://github.com/RetryYN/HELIX-HARNESS/issues/1895) | `OPEN` | `state:proposed-upstream-waiting` | `5f700f0c6fb1db19204bad9d50238512959eede9bd08fd395f1c94ad03010dc8` | `2026-09-20T12:51:23Z` |
| phase task | `PHCAP-08` | [#1896](https://github.com/RetryYN/HELIX-HARNESS/issues/1896) | `OPEN` | `state:proposed-upstream-waiting` | `1bd0ed1e4cd9e1bd94e0cd0d2399940b33006cf9f6a1e600530a316d68f22aa0` | `2026-09-20T12:51:24Z` |
| phase task | `PHCAP-09` | [#1897](https://github.com/RetryYN/HELIX-HARNESS/issues/1897) | `OPEN` | `state:proposed-upstream-waiting` | `25bcf4be2499a1692faa6e1d6e8423f8f0dc501f26cfa48f9c3007bdacaf828d` | `2026-09-20T12:51:26Z` |
| phase task | `PHCAP-10` | [#1898](https://github.com/RetryYN/HELIX-HARNESS/issues/1898) | `OPEN` | `state:proposed-upstream-waiting` | `756fd620e121f6caf9f0ef22c1f69f259af0338a24d7a8997840e34fdb32a1d5` | `2026-09-20T12:51:27Z` |
| phase task | `PHCAP-11` | [#1899](https://github.com/RetryYN/HELIX-HARNESS/issues/1899) | `OPEN` | `state:proposed-upstream-waiting` | `5a3d0fe25ff5ff0022a77a61a8e19ac2e0cf8a344f7160063bd787644a95f049` | `2026-09-20T12:51:28Z` |
| phase task | `PHCAP-12` | [#1900](https://github.com/RetryYN/HELIX-HARNESS/issues/1900) | `OPEN` | `state:proposed-upstream-waiting` | `67a171c66eb926bbfb3d6d28ddcaa1e37afe78fe2e108d439f3a5622cb54fe8f` | `2026-09-20T12:51:30Z` |
| phase task | `PHCAP-13` | [#1901](https://github.com/RetryYN/HELIX-HARNESS/issues/1901) | `OPEN` | `state:proposed-upstream-waiting` | `2ae431d9dae16f40f057ea4f6e2eb9ddf3435a9f06694890b809e4fc224b52b9` | `2026-09-20T12:51:31Z` |
| phase task | `PHCAP-14` | [#1902](https://github.com/RetryYN/HELIX-HARNESS/issues/1902) | `OPEN` | `state:proposed-upstream-waiting` | `a62206ce8a1d1cd48b26f697126a6e39994c34ad9a2fce2838e4b4b84428da53` | `2026-09-20T12:51:32Z` |
| phase task | `PHCAP-15` | [#1903](https://github.com/RetryYN/HELIX-HARNESS/issues/1903) | `OPEN` | `state:proposed-upstream-waiting` | `4850f44024cca67f977db0a3863425167136306b3cf709f9e41bfc4ecbd5b4ae` | `2026-09-20T12:51:34Z` |
| phase task | `PHCAP-16` | [#1904](https://github.com/RetryYN/HELIX-HARNESS/issues/1904) | `OPEN` | `state:proposed-upstream-waiting` | `0404eca1ce5ab324c1115fdad328f0b912ae2d1f597df574a690445377734f4c` | `2026-09-20T12:51:35Z` |
| phase task | `PHCAP-17` | [#1905](https://github.com/RetryYN/HELIX-HARNESS/issues/1905) | `OPEN` | `state:proposed-upstream-waiting` | `5e889f17b4959e460e0ca3ba8b75b6ba6c1089fe3f2e70fb2986f8dc8cbf7eea` | `2026-09-20T12:51:36Z` |
| phase task | `PHCAP-18` | [#1906](https://github.com/RetryYN/HELIX-HARNESS/issues/1906) | `OPEN` | `state:proposed-upstream-waiting` | `d6beff80f834c74bd65d8ffa43b089626d5b7b5dd028a59337e556dace57610c` | `2026-09-20T12:51:38Z` |
| phase task | `PHCAP-19` | [#1907](https://github.com/RetryYN/HELIX-HARNESS/issues/1907) | `OPEN` | `state:proposed-upstream-waiting` | `30585c0268c600eaad3b79791df3b6a97fef1845e7baa0527f5fac1c3eda9f06` | `2026-09-20T12:51:39Z` |
| phase task | `PHCAP-20` | [#1908](https://github.com/RetryYN/HELIX-HARNESS/issues/1908) | `OPEN` | `state:proposed-upstream-waiting` | `e709c147a85bf7a7d8033862d053543e39f88b85653ff09ac5b1bda99ecb78f5` | `2026-09-20T12:51:40Z` |

## 検査結果

- Issueは21件、番号は#1888〜#1908。
- 親#1888に20件すべての子Issue番号が存在する。
- 子Issueは`PHCAP-01`〜`PHCAP-20`のexact setで重複・欠番なし。
- 全IssueがOPENで`state:proposed-upstream-waiting`を持つ。
- 全子Issue本文がlocal source commit／digest、製品候補、現行状態、旧到達層、代表asset ID、縮退判定、`new_build_allowed: false`を持つ。
- remote body SHA-256はGitHub APIが返した本文文字列を末尾改行追加なしのUTF-8 bytesとして計算した。

## 残る作業

各Issueで代表assetから全関連assetとconsumer closureへ調査を広げ、製品分類とunit／connection／composite分割を確定する。Issue closeだけで台帳完了にせず、local inventory更新とread-afterを必要とする。
