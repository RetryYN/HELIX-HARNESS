# HARNESS-049 review05 postbody時点監査

候補v2とcanonical bodyのread-only照合記録。fixture実行、独立review、Fable判断、L3承認は未実施。workerによるcanonical/PR変更なし。

- PR #2647 body commit `78c5bc12e3ee37ec22f327e7ab727cdf52c622ea`（parent `dd60a50c2c6c1436a0f9be9e72b8fb93b53523c3`）、base `0acbed34bfda48e32092feb63db61d2eff6d5ec4`。merge-base一致、worktree clean。
- v2 JSON `/tmp/harness049-review05-M1-M3-nine-case-candidate-v2-2026-10-07.json` SHA-256 `667232a90f5eb7e7df80abd31f4f52f707cb00a8cfcb0c670c127330ed6e2a50`。v2 MD `/tmp/harness049-review05-M1-M3-nine-case-candidate-v2-2026-10-07.md` SHA-256 `b777184b910ba990266edae6e780a5e2f9d06d7e879d8cd69978e3389b45263d`。MD先頭の正式JSON SHA `e387661b72a1649b0e06418532f9f41b08a9ca41ea54317c57f95e8faad6c1ca` は正式raw SHA `e387661b72a1649b0e06418532f9f41b08a9ca41ea54317c57f95e8faad6c1ca` と一致。v1候補は保持。
- Rootはgovcheck 7622/57/58とdiff check PASSを報告。これはRoot実行結果として記録し、workerが再実行した値とは扱わない。

## 六文書actual blobとv2候補

| 文書 | actual bytes | actual SHA-256 | v2 proposed SHA-256 | 一致 | base prefix SHA-256 | suffix bytes |
|---|---:|---|---|---|---|---:|
| `docs/helix-harness/L3-requirements/business-requirements.md` | 14472 | `a723e04793b0ab4201308a8758c78b9ee49a342726554bedbcdbbed48a53d376` | `a723e04793b0ab4201308a8758c78b9ee49a342726554bedbcdbbed48a53d376` | True | `bd781ad052b14fdeadff8c4e3294ef6cf50ff921b7c202a148ed9c0780af1a24` | 946 |
| `docs/helix-harness/L3-requirements/functional-requirements.md` | 224124 | `7342eb80e94931385eb5c14f5d2e02231ba338ed5a6678b6e22a8b6aa467e136` | `7342eb80e94931385eb5c14f5d2e02231ba338ed5a6678b6e22a8b6aa467e136` | True | `a673be158e96dd92eb09f91432077244724a03d25bd4e0fd88482d6e42086f09` | 8767 |
| `docs/helix-harness/L3-requirements/nfr-grade.md` | 44980 | `0bd65031d65473713bbb73ad7b9ecf0ebecd24d7e61cc4ef127295fa4b39589f` | `0bd65031d65473713bbb73ad7b9ecf0ebecd24d7e61cc4ef127295fa4b39589f` | True | `4066acf1940761ef57fd781b878d933324f5d248465c44bb44f3e8abda235f7e` | 1152 |
| `docs/helix-harness/L10-verification/business-verification.md` | 10377 | `7449dd2be61c1c56faddc85cf7cfea5a8de83be7471512db4e250de934e88cb3` | `7449dd2be61c1c56faddc85cf7cfea5a8de83be7471512db4e250de934e88cb3` | True | `b756326334c652eec048e3ca34abc6a2a4df4638fa8eaa384c07a11801cfaa3e` | 1271 |
| `docs/helix-harness/L10-verification/functional-verification.md` | 782292 | `b6db7c9be8f6091cec9c1407b112272d8aab794cac7a5d9073fd85e2323d6e99` | `b6db7c9be8f6091cec9c1407b112272d8aab794cac7a5d9073fd85e2323d6e99` | True | `24d7f597211b05505876c25f0cbf403bece96dfa1a52854b8795e3a08cbb4a19` | 103402 |
| `docs/helix-harness/L10-verification/nfr-verification.md` | 38667 | `6ea59fedc18a6f3c58f6d0b5cccc1695c336fcdfee7650b5a133a8f14c31fda4` | `6ea59fedc18a6f3c58f6d0b5cccc1695c336fcdfee7650b5a133a8f14c31fda4` | True | `89d26dcd990b8bd6b8305a2a8c8a8017df1f8179c95edf0c838ab2d27a98c4d3` | 1285 |

六本文全てでactual full rawがv2 proposed rawとbyte一致し、各base prefixも一致。唯一の変更はFVへの9行追加。

## CASE inventory

049 FV表は旧155 unique IDを維持し164 unique IDとなった。追加9行は同じ6列で連続し、各row literalは候補v2とactual blobが一致する。

| ID | 物理行 | row SHA-256 |
|---|---:|---|
| `CASE-HARNESS-L10-049-r22-m1-device-condition-missing` | 1890 | `e31aa3a3c7f687a09c3af99f73df5ae367fecaff6312628aeaf82016c19b9595` |
| `CASE-HARNESS-L10-049-r22-m1-device-condition-unbound` | 1891 | `6ff6da46d46901e5d2e5c9f9144fec10d2339d2fd164448e4caa4d8f6bc61f3f` |
| `CASE-HARNESS-L10-049-r22-m1-view-condition-missing` | 1892 | `d705866e5775cbce42486741d5cc620e1828f2f26b2b90a82309edcd0a41dc32` |
| `CASE-HARNESS-L10-049-r22-m1-view-condition-unbound` | 1893 | `3a186902d8cffb61dfd90200a28761716608105c8b39ad4754dd415460f0aa9c` |
| `CASE-HARNESS-L10-049-r22-m2-prototype-authority-unknown` | 1894 | `e91505f4229141946897c1fd6d623b9933d704e022aa8b7299f6abe20c2719ef` |
| `CASE-HARNESS-L10-049-r22-m2-profile-authority-unknown` | 1895 | `9fbbf3bfa64113ffcc966350311db0885659c9840378b8cabe55b5577aa703e5` |
| `CASE-HARNESS-L10-049-r22-m2-oracle-authority-unknown` | 1896 | `9794f052a7f580b100f7d636745ad5aabc386316250c44c0ab99f6d91ffe11c5` |
| `CASE-HARNESS-L10-049-r22-m2-fixture-authority-unknown` | 1897 | `d9811ef2319edb3db154f5f300890c7e324063dfd12ddf59d207861ba329a8a5` |
| `CASE-HARNESS-L10-049-r22-m3-target-revision-missing` | 1898 | `0d477e32483d13ae75c1824a7e2687077dfeb7e8a591b34bcb4e2dbe42cebba1` |

旧review04時点監査の旧82 source literals、legacy/source/consumer pin構造は実blobから再読し、candidate記録と一致。旧監査ファイル自体は書換えず維持。

## 固定sourceとreview履歴

- L2 source `ea6f756f96a7370de78e412d737c7a7ed472114a` `product-requirements.md:1070–1092` raw SHA-256 `a5df1f7bdca708046ec9ad68e1eea0974884da63205b8995ad45dcd8f0bbc116`。L11 `product-acceptance.md:802–814` raw SHA-256 `f3fb47da21371084e9f8c7c7f7ca6dd945c8e98ae7c7b70597c3fc44e4e08ee7`。指定された全spanはphysical source bytesから切り出した。
- PO live26 `docs/governance/decisions/po-decision-2026-09-30-live26.md` at `0acbed34bfda48e32092feb63db61d2eff6d5ec4` rows 39/72 rawを保存し、採択-003/適用範囲の記録を現sourceから照合。
- 正式review JSON全10コメント raw、最新comment 6026807726全文を保存。review05 R1–R14記載を原文保持し、closure判定は作っていない。

## 限界

Root報告の静的検査を除き、ここではactual blob、source span、candidate byte equalityとID/row inventoryを照合した。fixtureの動作、意味完全性、独立review、Fable判断、承認、merge admissionはこの記録から成立しない。
