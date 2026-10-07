# HARNESS Stage 3 親043 main文脈更新監査

- 対象worktree: `/home/tenni/.helix-worktrees/l3-harness-stage3-parent043`
- 旧base: `0acbed34bfda48e32092feb63db61d2eff6d5ec4`
- 新main: `03d9cd19dfb92dc7dda74c8cb50f85dc320c873c`
- 旧親HEAD: `c700f8f9d3fb50f1f5a3b3a6d4e0b1430e7c5601`
- local merge commit: `f1f40a7c0d4799f542d5033162e59df98a17a173`
- 事前merge-base: `0acbed34bfda48e32092feb63db61d2eff6d5ec4`。pushなし。承認decision・独立reviewの継承なし。

JSON監査ファイル: `harness-stage3-parent043-base-context-audit-2026-10-07-03d9cd19.json`（51517 bytes、SHA-256 `15c32edcca1859241f6b27a075b9f33a88667d816ee779397926814d6f21e961`）。

固定old main文書の完全prefixと、旧親HEADの親固有suffixをそれぞれGit実blobから取り出し、新main全文の後ろへsuffixを保持した。各結果blobは `new main full document + old parent suffix` とbyte-exact一致した。

| 文書 | 旧base bytes/SHA | 旧親suffix bytes/SHA | 新main全文 bytes/SHA | 合成後bytes/SHA | exact |
|---|---|---|---|---|---|
| `docs/helix-harness/L3-requirements/business-requirements.md` | 13526 / `bd781ad052b14fdeadff8c4e3294ef6cf50ff921b7c202a148ed9c0780af1a24` | 283 / `8d806b285b554f895d1e3b8125b92e398db31ca5bcab68296d866a06c07e9129` | 13845 / `5f715ab4750f5aa1d58925b2fb2722268af5aaa58c44008b9e3b09cbe75b4feb` | 14128 / `2b503fd6f61175857a0ca632ba991a54dd638c5e2fb0192dba7d0a928ab437a0` | True |
| `docs/helix-harness/L3-requirements/functional-requirements.md` | 215357 / `a673be158e96dd92eb09f91432077244724a03d25bd4e0fd88482d6e42086f09` | 6839 / `2c74a1357f4fca2b59a3e0384f7d1843bcc7cd17a88022b8419a282f62b81fa4` | 224189 / `65339318ffe289dce0a9e7d60d284c541877a55ca6465601b95d91bc27d9c2ea` | 231028 / `8b11ce606da4883c13a991d80f9b27c7c5635eabb7d3dc278083b3c3d41a4e47` | True |
| `docs/helix-harness/L3-requirements/nfr-grade.md` | 43828 / `4066acf1940761ef57fd781b878d933324f5d248465c44bb44f3e8abda235f7e` | 434 / `be99bed2c7755145b8a0f1ae8703e398f42926d5c39721857ca780954022cdf3` | 44242 / `173674c46e77ee96bbded7b9b28e752f803ca09203813e9ca0cf19745d61ede1` | 44676 / `22ab15ccbf6d6f529f2f7cb81978b0f859bc494ff32caaa6218a7df8f4facb37` | True |
| `docs/helix-harness/L10-verification/business-verification.md` | 9106 / `b756326334c652eec048e3ca34abc6a2a4df4638fa8eaa384c07a11801cfaa3e` | 233 / `233f15d3911b5fe44c4b6041f9ed348e08d2cd6814fd27dcfd4c1cb12c0a1c9f` | 9344 / `21bcc1ab6c1892424f491020c8316ae92f59b686aaa2a85327b17df3ff840fca` | 9577 / `cb7d5cd5283a3b7dd3f20e378895cb562cd359b0057194693a3a4d8133d6a701` | True |
| `docs/helix-harness/L10-verification/functional-verification.md` | 678890 / `24d7f597211b05505876c25f0cbf403bece96dfa1a52854b8795e3a08cbb4a19` | 32133 / `9dae24c0a73554a1207c987aedcdd1abc060a2e50a2f30601941822f98638e11` | 756725 / `40bd4eab21fe2f384a389bc8a777664d621415d8b8f7377af47b5895239c538a` | 788858 / `75ab44b688ea8ea40e6c6caf96dbc889eaa6c747e8d2cdfb6d6e911db435ec6d` | True |
| `docs/helix-harness/L10-verification/nfr-verification.md` | 37382 / `89d26dcd990b8bd6b8305a2a8c8a8017df1f8179c95edf0c838ab2d27a98c4d3` | 392 / `047c937dc87c01fb22b44ce900e932a0e47d43e02609695d90eb6b55df576281` | 37863 / `9c085802ae12334a9d8cb9fcbc69ee8172a6d7a0bf5ede5dd8e1a28772ce0d20` | 38255 / `99258facf1ba3c200aa77c969aa3d27250c2f4adc3a4e6465888bfef657911b4` | True |

前時点監査: `docs/governance/audits/requirements-stage/harness-stage3-parent043-review06-disposition-2026-10-07-7b628347.json`（1209682 bytes, SHA-256 `8b8c8fcd1c12837afdcc54801fa3be4b7bde4cc5f8f529c77ae4636d64242bc5`）。旧監査を書き換えていない。

この監査は新base文脈の静的bytes確認であり、fixture実行・新本文の独立review・承認ではない。新baseへ更新したことで前回のreviewやFable結論を継承しない。
