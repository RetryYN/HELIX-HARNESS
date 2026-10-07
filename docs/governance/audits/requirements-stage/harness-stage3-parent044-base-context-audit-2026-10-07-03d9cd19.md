# HARNESS Stage 3 親044 main文脈更新監査

- 対象worktree: `/home/tenni/.helix-worktrees/l3-harness-stage3-parent044`
- 旧base: `0acbed34bfda48e32092feb63db61d2eff6d5ec4`
- 新main: `03d9cd19dfb92dc7dda74c8cb50f85dc320c873c`
- 旧親HEAD: `05528d4727e073085bb5841d4ce6f2eed630683b`
- local merge commit: `64a0ca7ff6d55c6f8003517ca4e645589a14b607`
- 事前merge-base: `0acbed34bfda48e32092feb63db61d2eff6d5ec4`。pushなし。承認decision・独立reviewの継承なし。

JSON監査ファイル: `harness-stage3-parent044-base-context-audit-2026-10-07-03d9cd19.json`（117442 bytes、SHA-256 `a3a78cf5b5075b982bb9a4c696e1e948bf9966fb4ce83568d71c335562c1b6ac`）。

固定old main文書の完全prefixと、旧親HEADの親固有suffixをそれぞれGit実blobから取り出し、新main全文の後ろへsuffixを保持した。各結果blobは `new main full document + old parent suffix` とbyte-exact一致した。

| 文書 | 旧base bytes/SHA | 旧親suffix bytes/SHA | 新main全文 bytes/SHA | 合成後bytes/SHA | exact |
|---|---|---|---|---|---|
| `docs/helix-harness/L3-requirements/business-requirements.md` | 13526 / `bd781ad052b14fdeadff8c4e3294ef6cf50ff921b7c202a148ed9c0780af1a24` | 3571 / `73e6a1a20bd5cc91f4e09e0c425f25a99484016c2574efc9f39f4a39acdaab4f` | 13845 / `5f715ab4750f5aa1d58925b2fb2722268af5aaa58c44008b9e3b09cbe75b4feb` | 17416 / `045372f3441246a8169ce7b8755145e6746d02621950d3d41d3ec92eab950963` | True |
| `docs/helix-harness/L3-requirements/functional-requirements.md` | 215357 / `a673be158e96dd92eb09f91432077244724a03d25bd4e0fd88482d6e42086f09` | 8834 / `be61b7e6864457dda4fb640ac6a661ee106848307cb322e35bdf9ec5a989efda` | 224189 / `65339318ffe289dce0a9e7d60d284c541877a55ca6465601b95d91bc27d9c2ea` | 233023 / `dafc5df128292135037faee5ab209f826d1fd4c7b1b0a75895e93bc6c1f6dc39` | True |
| `docs/helix-harness/L3-requirements/nfr-grade.md` | 43828 / `4066acf1940761ef57fd781b878d933324f5d248465c44bb44f3e8abda235f7e` | 3496 / `aa8c65d49949c1eec9c8f1b7451c1011fd0491141275bee1d2a67f31fbef0094` | 44242 / `173674c46e77ee96bbded7b9b28e752f803ca09203813e9ca0cf19745d61ede1` | 47738 / `54e34ace8add6055a3b7de68aa02955b50fab1b70dae7493f700aa189d7d993d` | True |
| `docs/helix-harness/L10-verification/business-verification.md` | 9106 / `b756326334c652eec048e3ca34abc6a2a4df4638fa8eaa384c07a11801cfaa3e` | 4306 / `bf7a3634f3c695554746cf239536ae9b4da700ec6272453c4e3ed56fd0fc4026` | 9344 / `21bcc1ab6c1892424f491020c8316ae92f59b686aaa2a85327b17df3ff840fca` | 13650 / `24fd59b8c85048f54fbe83a96ca439239ee6e3c2c2c272586beef3f3fdfe26ae` | True |
| `docs/helix-harness/L10-verification/functional-verification.md` | 678890 / `24d7f597211b05505876c25f0cbf403bece96dfa1a52854b8795e3a08cbb4a19` | 81905 / `77f0c8484aaebfb7efe69ea4ce2918dda0cb5d706c7158f1203476a21a4298fe` | 756725 / `40bd4eab21fe2f384a389bc8a777664d621415d8b8f7377af47b5895239c538a` | 838630 / `036759ccb78158b0de580517596b1b0f4ae0c822ad3fb5462533f0a6bbdd2b6f` | True |
| `docs/helix-harness/L10-verification/nfr-verification.md` | 37382 / `89d26dcd990b8bd6b8305a2a8c8a8017df1f8179c95edf0c838ab2d27a98c4d3` | 4136 / `5e685ac22ad516e2f059cc45768b08b087192e1de80e0e98a5abb2e28b4c0332` | 37863 / `9c085802ae12334a9d8cb9fcbc69ee8172a6d7a0bf5ede5dd8e1a28772ce0d20` | 41999 / `ea577d3bdf09e32caf2896ae3a0fc80b9e53d43b15360f3cc531d9a9e3dcf769` | True |

前時点監査: `/tmp/harness044-review09-postbody-audit-2026-10-07.json`（1506579 bytes, SHA-256 `103ccc7e2f7e51a3ffc39d9016423e00a1b1c0326d1a1c9f9c3905c13a8825cf`）。旧監査を書き換えていない。

この監査は新base文脈の静的bytes確認であり、fixture実行・新本文の独立review・承認ではない。新baseへ更新したことで前回のreviewやFable結論を継承しない。
