# LABO-068 main接続・base監査

PR #2638 のworktreeに、Root指定main `03d9cd19dfb92dc7dda74c8cb50f85dc320c873c` をno-ff mergeした時点の親068専用監査記録。

- merge前HEAD: `be9660ecdee7cb7458606388a0946576d7d3ef20`
- merge後HEAD: `88986c31dfb65e7614c55832b6a4c4692e3721a8`
- merge parents: `be9660ecdee7cb7458606388a0946576d7d3ef20` + `03d9cd19dfb92dc7dda74c8cb50f85dc320c873c`
- merge前base: `0acbed34bfda48e32092feb63db61d2eff6d5ec4`
- 接続先main blobは六本文それぞれでmerge前base blobと一致。六本文の全blob/SHAおよびsuffix SHAはmerge前後で完全一致。
- merge前に存在した監査・decision 2366件のblob IDを保持。worktree clean。pushなし。
- govcheck PASS（7622 atoms / 57 requirements / 58 files）。`git diff --check`（main...HEAD）およびmerge commitの`git show --check`もPASS。
- 対応JSON: `labo-stage5-parent068-main-merge-base-audit-2026-10-07-88986c31.json`（7850 bytes / SHA-256 `c2449b2efe571c1498a7afa0a70a2289e5c517c77c7aa445767aec6c5bf913b2`）。
- 同親のpostbody監査JSON copy: `labo-stage5-parent068-review13-postbody-audit-2026-10-07-be9660ec.json`（1203549 bytes / SHA-256 `ec7146d3d338075038ddd59463ac87b42a03463297d33cc66c80aca9f4a64386`）。
- 同親のpostbody監査Markdown copy: `labo-stage5-parent068-review13-postbody-audit-2026-10-07-be9660ec.md`（4603 bytes / SHA-256 `9e7fae540fc630ce424361e65fb971b4c2048f6702ab8505c91cc3991df01515`、末尾LF 1個）。tmp原本は変更していない。

| 文書 | 全bytes | 全SHA-256 | base prefix bytes / SHA-256 | suffix bytes / SHA-256 | 状態 |
|---|---:|---|---|---|---|
| `docs/helix-labo/L3-requirements/business-requirements.md` | 23944 | `5339b4a1fda5905f3e68713e997f0a552219b62a7ab209567042923bc30838ac` | 17356 / `6eb0e6094202a519d34b84670c7c9fa9143ced0c8e25883bddc22c9a395feae7` | 6588 / `cdce88ca74574c835e427e07bfb91b4120bcd1a1e4166f0aa9c9eaf06bc09bc3` | merge前後同一 |
| `docs/helix-labo/L3-requirements/functional-requirements.md` | 325290 | `f0ae56df44fe68a2860e24f52e2df742bb92e8146f3cd4de1378474f6ccd6cb6` | 314755 / `24dff56c5e90120360fe446c38e1e3b4b4b58db569fa8eb40d2be8b338161426` | 10535 / `a69ee20015755ab390d40f8b2623b0ccda5f7db020b5223b12430f0060225ee6` | merge前後同一 |
| `docs/helix-labo/L3-requirements/nfr-grade.md` | 78563 | `acabb4f7ec6c84fd2c530f22f4cf36118ae46f01d7418b28b6e5b36e1c712d14` | 70949 / `e39aadaf35521a2c9c49001581c2d6e7770156749a0705666105b579b4387be7` | 7614 / `f79a84116a8d327ba7ccf709d5f211b1074c55f8e0a5e8f692e3dd8a99203de5` | merge前後同一 |
| `docs/helix-labo/L10-verification/business-verification.md` | 21732 | `2b166aa8b0c7df3a6f9f50f84a66eaf34afc16b6f56cdecd4ad76babd6702200` | 15331 / `43115cad1beeeb4aa887c80206936d2ecec6ef507447a559b4544222f8ccb089` | 6401 / `47991ddef6762a5d4f6141a7381bbcf0822cac35dc814bcd4e24a3de51027234` | merge前後同一 |
| `docs/helix-labo/L10-verification/functional-verification.md` | 514388 | `409d24b38484bf70401777256560bb4518ca85528fb4d2ad5dc26cc3d205f53b` | 487997 / `2d0d893deb6ce95836b5b1b1f3b6a01511db36ce956a881788b5de1c26f5783b` | 26391 / `cc28a08b9721d8e8096e24dcbf420684717e6dfb82a191ef4738fa2c4f7ae8b5` | merge前後同一 |
| `docs/helix-labo/L10-verification/nfr-verification.md` | 68087 | `a2cc22543cd838ada62fe915396c8ff398dbd3e176a3aec5979dc2dea3373060` | 60801 / `d2c9c508465305c3edf9af1f6d2d247cd19f07617aefeca25f320eeaba56ceca` | 7286 / `76e9570984c22cd4d7663adbac61d1ba519dcb7b07ef9027ebfaf855be69b68d` | merge前後同一 |

本記録は対象親だけを抽出したbase接続監査であり、相手親の監査内容を含まない。既存postbody監査は当時点の記録として保持し、書き換えていない。PR review、L3承認、fixture実行、L10合格は主張しない。
