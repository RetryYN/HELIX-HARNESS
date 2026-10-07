# LABO-066 main接続・base監査

PR #2635 のworktreeに、Root指定main `03d9cd19dfb92dc7dda74c8cb50f85dc320c873c` をno-ff mergeした時点の親066専用監査記録。

- merge前HEAD: `3d378430760527a967188d863033930ef8f5fbb3`
- merge後HEAD: `5cefe16a1331d5a917b682725cfb1326e190167c`
- merge parents: `3d378430760527a967188d863033930ef8f5fbb3` + `03d9cd19dfb92dc7dda74c8cb50f85dc320c873c`
- merge前base: `0acbed34bfda48e32092feb63db61d2eff6d5ec4`
- 接続先main blobは六本文それぞれでmerge前base blobと一致。六本文の全blob/SHAおよびsuffix SHAはmerge前後で完全一致。
- merge前に存在した監査・decision 2366件のblob IDを保持。worktree clean。pushなし。
- govcheck PASS（7622 atoms / 57 requirements / 58 files）。`git diff --check`（main...HEAD）およびmerge commitの`git show --check`もPASS。
- 対応JSON: `labo-stage5-parent066-main-merge-base-audit-2026-10-07-5cefe16a.json`（7851 bytes / SHA-256 `1fd242723fdb64091f18974aa236b6d9e53a7c40a07757edf3712ee33d1d2bdb`）。
- 同親のpostbody監査JSON copy: `labo-stage5-parent066-review13-postbody-audit-2026-10-07-3d3784307.json`（149485 bytes / SHA-256 `b15991353e31e2284908191093d3537dcd443e993597c4080ae00d3f3bb5e676`）。
- 同親のpostbody監査Markdown copy: `labo-stage5-parent066-review13-postbody-audit-2026-10-07-3d3784307.md`（4045 bytes / SHA-256 `9d94ec1aed97829dc8b29d3ac2956bccc4ee14bcea80f21b4acb34a724bfc750`、末尾LF 1個）。tmp原本は変更していない。

| 文書 | 全bytes | 全SHA-256 | base prefix bytes / SHA-256 | suffix bytes / SHA-256 | 状態 |
|---|---:|---|---|---|---|
| `docs/helix-labo/L3-requirements/business-requirements.md` | 18159 | `4978e928ca6bc8dc42eafe4ee96d204f38428ff0ad5d650f3d76ea3c7dec4ee2` | 17356 / `6eb0e6094202a519d34b84670c7c9fa9143ced0c8e25883bddc22c9a395feae7` | 803 / `3dc759a6eb597cc46b0014dbedc2dc705810eebcc810e0bee891afbf3941fc3a` | merge前後同一 |
| `docs/helix-labo/L3-requirements/functional-requirements.md` | 323429 | `9892c96c4c88eeae1495d9a1ea363642cf2780f37845de8de7f2004a67c2a19a` | 314755 / `24dff56c5e90120360fe446c38e1e3b4b4b58db569fa8eb40d2be8b338161426` | 8674 / `0c05073fe701db5780ef3605cf21bb4694bcf2ad473c2d8d93928fa43d7562d5` | merge前後同一 |
| `docs/helix-labo/L3-requirements/nfr-grade.md` | 72262 | `d3686b98f7d9164fd079b43b70f8b5035051db14c1c52562a07d1f864d56128d` | 70949 / `e39aadaf35521a2c9c49001581c2d6e7770156749a0705666105b579b4387be7` | 1313 / `77be1f306c73a558daebba11ba608a02444940775b7695665c8e455f19932834` | merge前後同一 |
| `docs/helix-labo/L10-verification/business-verification.md` | 16319 | `6e40b71ea81fd98fa6aa0db9e7d7d026596c537e8a1edeb0c2bebd2d3177f595` | 15331 / `43115cad1beeeb4aa887c80206936d2ecec6ef507447a559b4544222f8ccb089` | 988 / `1d82064b50b3a3baa01dd013087966fa3202dd7f0e82b17ce512fcc2c2609553` | merge前後同一 |
| `docs/helix-labo/L10-verification/functional-verification.md` | 549958 | `8b2efd0bd2996915085c0dc6568776f7cb9f3346111bbf3ae878c0443e0044ea` | 487997 / `2d0d893deb6ce95836b5b1b1f3b6a01511db36ce956a881788b5de1c26f5783b` | 61961 / `84539c0de9f08a2b05584a245e02eb2b693019181040b4091ff122b1a83b0c52` | merge前後同一 |
| `docs/helix-labo/L10-verification/nfr-verification.md` | 62432 | `b9977b3eaecfa1ecdda8ddf3d90fdf747c80f763f622bae6148e08ae71595f67` | 60801 / `d2c9c508465305c3edf9af1f6d2d247cd19f07617aefeca25f320eeaba56ceca` | 1631 / `2da98c3255957ed95c0fb3ce9c51a85f84b97aabed6b90dcc8e87420556d72fd` | merge前後同一 |

本記録は対象親だけを抽出したbase接続監査であり、相手親の監査内容を含まない。既存postbody監査は当時点の記録として保持し、書き換えていない。PR review、L3承認、fixture実行、L10合格は主張しない。
