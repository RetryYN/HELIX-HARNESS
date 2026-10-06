# HELIX-LABO-071 base接続時点監査

- 記録日: 2026-10-07
- 対象branch: `l3-labo-stage5-parent071`
- merge前HEAD: `72ecb125505a1bb06b06d7f4c5927b6ed8fc66e7`
- merge後HEAD: `fe1072294d3ee3681359613c9d49d37d3e3a510e`
- merge commit parents: `72ecb125505a1bb06b06d7f4c5927b6ed8fc66e7, 03d9cd19dfb92dc7dda74c8cb50f85dc320c873c`
- target base: `03d9cd19dfb92dc7dda74c8cb50f85dc320c873c`（GitHub APIのmain SHAとしてRootが共有した値。APIから独立再取得していない）
- merge-base: `03d9cd19dfb92dc7dda74c8cb50f85dc320c873c`
- worktree: clean=True
- 対応JSON: `labo071-base-connection-audit-2026-10-07-fe107229.json`（SHA-256 `42024270c15d39c4ddb28dbcc0f764e8fdbb9c3df02625a48a07014126b599e7`）

## 検証結果

指定baseを `git merge --no-ff 03d9cd19dfb92dc7dda74c8cb50f85dc320c873c` で取り込み、Laboの6本文がmerge前後で全byte一致することを確認した。`0acbed` と指定main `03d9` の6本文blobも全て同一であり、各本文の旧suffixはmerge後も同じbytes/SHA-256だった。

| 文書 | path | 実blob SHA-256（merge後） | bytes | suffix SHA-256（0acbed以降） | suffix一致 |
|---|---|---:|---|---|
| L3 business | `docs/helix-labo/L3-requirements/business-requirements.md` | `2dd7a80e980b398edd0c7c9aadfe3f7ddcf940e01d8a98019e2b87b29df0a68d` | 23554 | `f88cbd8bd1e5cf72569f158025c85dcf04d4af6c516d9f4a476fb7050eb22589` | True |
| L3 functional | `docs/helix-labo/L3-requirements/functional-requirements.md` | `b257cd28667e337282444e9454bed5f77be149ed970521f751b7addcf10b227d` | 322914 | `1c66432bf993e9e80c0ddf74cf109b752fc5c5329bb607bef12eeb03d07903e9` | True |
| L3 NFR grade | `docs/helix-labo/L3-requirements/nfr-grade.md` | `a74e197f67f7ab76743ee5dbab6495e1d6f871333b7294a33f3ad8103275b578` | 77681 | `fe29e9ae3cb0f070990d2afd2bb66d696cee7b5d0ea80ce289c4fa3075a43a62` | True |
| L10 business | `docs/helix-labo/L10-verification/business-verification.md` | `9dde43b0f457050a8eb0a7601651413d79642c2e844fef469108c0a6595157d4` | 21287 | `305754a89def7ef7570f70e08b6aca08b13de53bbc426a99a257bd1a145e77d7` | True |
| L10 functional | `docs/helix-labo/L10-verification/functional-verification.md` | `ce147450d150b5bffd936937e7e28aa7ad23543f10024aba9eed11fac2fde35c` | 518864 | `46aad77ed41e71a52e9d955bc5ade6f5a34ab614cd4b0ce50ea23eb66b995af2` | True |
| L10 NFR | `docs/helix-labo/L10-verification/nfr-verification.md` | `2c369556d4a5c4188fd8e4ddf857e0061a059c108b879883a3d737556a792960` | 67755 | `62ec5644b04f4e6e7b4846d43f39f42ae77da5315297c7713b718248a3f7005c` | True |

### 既存の時点記録

merge前から存在する当該親のimmutable auditを読み、merge前後blob SHAとbytesを比較した。全て不変。

- `docs/governance/audits/requirements-stage/labo-stage5-parent071-authoring-audit-2026-10-07-c41c13a9b.json` — SHA-256 `8ff4cc40320a6f627f2e688a464077b7925cd109ef95638fa8e1b2f0fc521682`、334419 bytes、merge前後同一=True
- `docs/governance/audits/requirements-stage/labo-stage5-parent071-authoring-audit-2026-10-07-c41c13a9b.md` — SHA-256 `5ce43afd04cbb09fbdb38a722485759a0f87199d37f9bc4d27a0ea7c76453f12`、4453 bytes、merge前後同一=True
- `docs/governance/audits/requirements-stage/labo-stage5-parent071-review01-disposition-2026-10-07-d055c3c0.json` — SHA-256 `b9db426b40e768e562e06cc8ab468492c00a5517ab882d2bfc05d3820ecf0611`、115279 bytes、merge前後同一=True
- `docs/governance/audits/requirements-stage/labo-stage5-parent071-review01-disposition-2026-10-07-d055c3c0.md` — SHA-256 `0bee934bde7c3c00a428c999a1a337344acb3dbab0755451829a312ebb5d98de`、3186 bytes、merge前後同一=True
- `docs/governance/audits/requirements-stage/labo-stage5-parent071-review02-disposition-2026-10-07-f6cc0497.json` — SHA-256 `d4942f22c1a232614618a8c03c89c4273f7de21b2b1590c58dde3eafff0e0772`、44335 bytes、merge前後同一=True
- `docs/governance/audits/requirements-stage/labo-stage5-parent071-review02-disposition-2026-10-07-f6cc0497.md` — SHA-256 `269e185336553fb19849749b8b0fd6938c511aa5c1ae1907defa8113e709e93d`、2666 bytes、merge前後同一=True
- `docs/governance/audits/requirements-stage/labo-stage5-parent071-review03-disposition-2026-10-07-9ba0ecf0.json` — SHA-256 `8d22ac22f369a8435c276ee107d6c1174b841616d8e80b91ceee9cce7256fdc0`、71760 bytes、merge前後同一=True
- `docs/governance/audits/requirements-stage/labo-stage5-parent071-review03-disposition-2026-10-07-9ba0ecf0.md` — SHA-256 `a997f1a78c806c07b027ac630d28f027854c59f2a41ba1f67597170e5fab0733`、4653 bytes、merge前後同一=True
- `docs/governance/audits/requirements-stage/labo-stage5-parent071-review05-disposition-2026-10-07-7320dbaa.json` — SHA-256 `dbef39c9401d207335b2520be231c12b71d7ca3424a529e275f018366265226d`、96534 bytes、merge前後同一=True
- `docs/governance/audits/requirements-stage/labo-stage5-parent071-review05-disposition-2026-10-07-7320dbaa.md` — SHA-256 `a7456f0717830dc0426287391f64a06afd60ddfb3e63684380b7803b213a0f97`、4787 bytes、merge前後同一=True

### 静的検証

- `python3 -B scaffold/governance/tools/govcheck.py`: PASS — `govcheck: ok atoms=7622 requirements=57 files=58`。
- `git diff --check 03d9cd19dfb92dc7dda74c8cb50f85dc320c873c...fe1072294d3ee3681359613c9d49d37d3e3a510e`: PASS（出力なし、終了コード0）。

## 範囲と限界

この記録はbase接続後の物理的なrevision・blob・suffix検算であり、要件の意味承認、独立review、fixture実行を示さない。GitHub API上のmain SHAはRoot共有値を使い、この調査では再取得していない。canonical監査への配置・commitはRoot検収後に行う。
