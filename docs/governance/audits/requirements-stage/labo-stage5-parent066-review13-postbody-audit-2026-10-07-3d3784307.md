# LABO-066 review13 post-body時点監査

対象PR #2635のbody commit `3d378430760527a967188d863033930ef8f5fbb3`（parent `e5565168e579c7747e192683c6686e5276833cfe`）を、base `0acbed34bfda48e32092feb63db61d2eff6d5ec4` に対する読み取り専用の時点監査として記録する。監査JSON: `/tmp/labo066-review13-postbody-audit-2026-10-07.json`、SHA-256 `b15991353e31e2284908191093d3537dcd443e993597c4080ae00d3f3bb5e676`。候補v2 `/tmp/labo066-review13-M1-M4-correction-candidate-2026-10-07-v2.json` のSHA-256は `6cc457f0118edd54b10aee402bb8b266f1b98b0a376c14a991085f93bead6f97`。

| 文書 | actual bytes | actual SHA-256 | base prefix bytes / SHA-256 | appended suffix bytes / SHA-256 |
|---|---:|---|---|---|
| `docs/helix-labo/L3-requirements/business-requirements.md` | 18159 | `4978e928ca6bc8dc42eafe4ee96d204f38428ff0ad5d650f3d76ea3c7dec4ee2` | 17356 / `6eb0e6094202a519d34b84670c7c9fa9143ced0c8e25883bddc22c9a395feae7` | 803 / `3dc759a6eb597cc46b0014dbedc2dc705810eebcc810e0bee891afbf3941fc3a` |
| `docs/helix-labo/L3-requirements/functional-requirements.md` | 323429 | `9892c96c4c88eeae1495d9a1ea363642cf2780f37845de8de7f2004a67c2a19a` | 314755 / `24dff56c5e90120360fe446c38e1e3b4b4b58db569fa8eb40d2be8b338161426` | 8674 / `0c05073fe701db5780ef3605cf21bb4694bcf2ad473c2d8d93928fa43d7562d5` |
| `docs/helix-labo/L3-requirements/nfr-grade.md` | 72262 | `d3686b98f7d9164fd079b43b70f8b5035051db14c1c52562a07d1f864d56128d` | 70949 / `e39aadaf35521a2c9c49001581c2d6e7770156749a0705666105b579b4387be7` | 1313 / `77be1f306c73a558daebba11ba608a02444940775b7695665c8e455f19932834` |
| `docs/helix-labo/L10-verification/business-verification.md` | 16319 | `6e40b71ea81fd98fa6aa0db9e7d7d026596c537e8a1edeb0c2bebd2d3177f595` | 15331 / `43115cad1beeeb4aa887c80206936d2ecec6ef507447a559b4544222f8ccb089` | 988 / `1d82064b50b3a3baa01dd013087966fa3202dd7f0e82b17ce512fcc2c2609553` |
| `docs/helix-labo/L10-verification/functional-verification.md` | 549958 | `8b2efd0bd2996915085c0dc6568776f7cb9f3346111bbf3ae878c0443e0044ea` | 487997 / `2d0d893deb6ce95836b5b1b1f3b6a01511db36ce956a881788b5de1c26f5783b` | 61961 / `84539c0de9f08a2b05584a245e02eb2b693019181040b4091ff122b1a83b0c52` |
| `docs/helix-labo/L10-verification/nfr-verification.md` | 62432 | `b9977b3eaecfa1ecdda8ddf3d90fdf747c80f763f622bae6148e08ae71595f67` | 60801 / `d2c9c508465305c3edf9af1f6d2d247cd19f07617aefeca25f320eeaba56ceca` | 1631 / `2da98c3255957ed95c0fb3ce9c51a85f84b97aabed6b90dcc8e87420556d72fd` |

六文書の現blobはGitから直接取得しSHA/byte数を再計算した。各base blobは現blobの正確な先頭prefixで、末尾LFを確認した。Root適用後bodyは候補v2の六本文と一致し、FV見出し1行だけが `/ 86 CASE` から `/ 87 CASE` に変わっている。他の5文書とFVの残り本文は候補v2とbyte一致する。worktreeはclean、merge-baseは指定baseと一致する。

FV表は87 unique物理行で、旧78 IDをすべて保持し、CASE-70..78の追加9行は候補v2とbyte一致した。CASE-07とCASE-22は本文内で索引と明記されるため定義数から除き、85定義・2索引である。旧67行はhistorical revisionの実blob・物理行・raw LF hashを再照合し、67行すべて一致した。旧78行もauthoring親commitのraw line hashを照合している。

固定親 `318ec4a04abb3c1cc17111b3d939f913facd5fd3` のL2-066 522–528、L2-059 420–429、L11-066 263–267について、source blobと行span SHAを再計算した。過去の正式review source fileのbytes/SHAも候補記録と一致した。R1–45の歴史raw根拠はreview07 R1–31、review08 R32–33、review09 R34–37、review13のR1–42継続とR43–45記録を含み、監査JSONに原文断片とsource pinを保持する。過去findingの解消や独立再reviewは主張しない。

この記録はstatic body/source/prefix/ID/hash照合のみである。fixture/oracle実行、実測、意味完全性、PO承認は検証していない。canonical文書・Git履歴は変更していない。
