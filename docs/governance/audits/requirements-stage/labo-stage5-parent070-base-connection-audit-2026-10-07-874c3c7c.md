# HELIX-LABO-070 base接続時点監査

- 記録日: 2026-10-07
- 対象branch: `l3-labo-stage5-parent070`
- merge前HEAD: `eed7918a2bf81952826f382af509bf0c446097dd`
- merge後HEAD: `874c3c7c7d64110af1484da5160ca0f4963a637c`
- merge commit parents: `eed7918a2bf81952826f382af509bf0c446097dd, 03d9cd19dfb92dc7dda74c8cb50f85dc320c873c`
- target base: `03d9cd19dfb92dc7dda74c8cb50f85dc320c873c`（GitHub APIのmain SHAとしてRootが共有した値。APIから独立再取得していない）
- merge-base: `03d9cd19dfb92dc7dda74c8cb50f85dc320c873c`
- worktree: clean=True
- 対応JSON: `labo070-base-connection-audit-2026-10-07-874c3c7c.json`（SHA-256 `07ccc2578cfa13b65b840081fdcc8d8695c96a1a92fb051415a2f002b94f1953`）

## 検証結果

指定baseを `git merge --no-ff 03d9cd19dfb92dc7dda74c8cb50f85dc320c873c` で取り込み、Laboの6本文がmerge前後で全byte一致することを確認した。`0acbed` と指定main `03d9` の6本文blobも全て同一であり、各本文の旧suffixはmerge後も同じbytes/SHA-256だった。

| 文書 | path | 実blob SHA-256（merge後） | bytes | suffix SHA-256（0acbed以降） | suffix一致 |
|---|---|---|---:|---|---|
| L3 business | `docs/helix-labo/L3-requirements/business-requirements.md` | `532d6eec38aa509dc7b0a830bb8bc24452b67a80abb778a70eb0c4cb2b9c0263` | 19207 | `b024185f2edda81a134a748e8a5eb8ae3f1c0ee17be5693659188b37a9dd25b4` | True |
| L3 functional | `docs/helix-labo/L3-requirements/functional-requirements.md` | `82e48300ecbfbf034a610cf23a90d1ae4839b5708440ae4823154b6fe71d2600` | 324054 | `414569837e7a633f7c946f58594660daf45d4d51ef279841d031383a26c25bca` | True |
| L3 NFR grade | `docs/helix-labo/L3-requirements/nfr-grade.md` | `6b253edcec8dfcc2057a30f19298b1fd1ce5251faf15758645339b813c161b29` | 74907 | `ce81933f6dc46f091bd95365f8a46e4644af315ef057529fb12ec09e30ed9938` | True |
| L10 business | `docs/helix-labo/L10-verification/business-verification.md` | `b2fab1b0d29357de15c8db368fadd0c0a5f9389230e3400e7360763b5b9e8a20` | 18009 | `02944f48239f672110b6bb6bb003334051ec6353dca91ea7ac44ee84f216daa6` | True |
| L10 functional | `docs/helix-labo/L10-verification/functional-verification.md` | `6cf32d195633f43eacb9ba2d909da450e505e1ef834d01ccb04e528f21402d18` | 565340 | `b15f797a1187a367d234b430ccf2b1c68a80587e12c0cdcff76f6618518acb83` | True |
| L10 NFR | `docs/helix-labo/L10-verification/nfr-verification.md` | `2c4164c87133454ce6ac0e5bb439398297cbd5db30584d96774a63659ae17c96` | 65667 | `336d7f7e1c96e7d56a7a72b8fec76868effbcc9af3649cdf9dc7bb363a3d25a5` | True |

### 既存の時点記録

merge前から存在する当該親のimmutable auditを読み、merge前後blob SHAとbytesを比較した。全て不変。

- `docs/governance/audits/requirements-stage/labo-stage5-parent070-authoring-audit-2026-10-07-395fee3c7.json` — SHA-256 `b4c28e3813f8d78ae5df5d36ebd941b8c0a961c42ef7d3a27d547a9b389bd487`、488756 bytes、merge前後同一=True
- `docs/governance/audits/requirements-stage/labo-stage5-parent070-authoring-audit-2026-10-07-395fee3c7.md` — SHA-256 `9460205e18fa729bb81538d59659d19925bac10dd4387fe012dffde6539b0ab1`、3091 bytes、merge前後同一=True
- `docs/governance/audits/requirements-stage/labo-stage5-parent070-review01-disposition-2026-10-07-8907d4db.json` — SHA-256 `3e04d2678e90b0e0d188d1dae16d71e8cbdb68d15bc67d08955c302dbe8913ea`、210303 bytes、merge前後同一=True
- `docs/governance/audits/requirements-stage/labo-stage5-parent070-review01-disposition-2026-10-07-8907d4db.md` — SHA-256 `f7ceea45afb34b87c6bfe9e7cd41884e13943b3a02d03dda9cd14909b84d3a95`、80295 bytes、merge前後同一=True
- `docs/governance/audits/requirements-stage/labo-stage5-parent070-review03-disposition-2026-10-07-d488b2cd.json` — SHA-256 `e5d1187e20cebe341114982250c4f667dde02462ce283eb4b79469cbadee3e26`、1298082 bytes、merge前後同一=True
- `docs/governance/audits/requirements-stage/labo-stage5-parent070-review03-disposition-2026-10-07-d488b2cd.md` — SHA-256 `070c854609b7ac1f5261b3188da72a12afa7fb25eabf344f225a33b656ea4f7c`、4065 bytes、merge前後同一=True
- `docs/governance/audits/requirements-stage/labo-stage5-parent070-review04-disposition-2026-10-07-700e198a.json` — SHA-256 `a99732b0e45c7f9493333e012b02906c29a39591ebaa3287e9452915db87bcac`、60958 bytes、merge前後同一=True
- `docs/governance/audits/requirements-stage/labo-stage5-parent070-review04-disposition-2026-10-07-700e198a.md` — SHA-256 `97e02d2d9a9141bbd505de95627124689c4fa21ba524bf9a6098275a52c7ba35`、2249 bytes、merge前後同一=True

### 静的検証

- `python3 -B scaffold/governance/tools/govcheck.py`: PASS — `govcheck: ok atoms=7622 requirements=57 files=58`。
- `git diff --check 03d9cd19dfb92dc7dda74c8cb50f85dc320c873c...874c3c7c7d64110af1484da5160ca0f4963a637c`: FAIL。既存immutable監査の末尾空行1件: docs/governance/audits/requirements-stage/labo-stage5-parent070-review01-disposition-2026-10-07-8907d4db.md:287。対象blobはmerge前後不変。

## 範囲と限界

この記録はbase接続後の物理的なrevision・blob・suffix検算であり、要件の意味承認、独立review、fixture実行を示さない。GitHub API上のmain SHAはRoot共有値を使い、この調査では再取得していない。canonical監査への配置・commitはRoot検収後に行う。

## 関連するreview05 postbody監査

既存候補 `/tmp/labo070-review05-postbody-audit-eed7918a.md` のSHA-256は `3f2145681543126ecdc7522d98c87e4ac7df0352646a0c0a95fef770a6bb19eb`、JSONは `9558381b2f5c2f6f7ca4db8b3d6997800aba8502bbdfa32823e5c69e1e532b11`。Root検収後、canonicalへ同一bytesで移す指示対象。
