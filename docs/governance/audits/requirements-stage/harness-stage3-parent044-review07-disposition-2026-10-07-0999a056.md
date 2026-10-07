# HARNESS-044 review07 M1 修正後の時点監査

- PR: #2641
- body commit: `0999a056c91299010732b8f6cf9a5d6f13879af1` (parent `d09a1007112b26dd0961e17e1b3e8726a1753937`)
- base / merge-base: `ceda1c53b53c53fffb8c23f394add1f2b809deb1` / `ceda1c53b53c53fffb8c23f394add1f2b809deb1`
- 対象worktree: `/home/tenni/.helix-worktrees/l3-harness-stage3-parent044`（clean=True）
- 修正候補: `/tmp/harness044-review07-M1-exact-candidate-2026-10-07.json` SHA-256 `7a3549a563f73cab1bbfbf1877391d9ded07102ad84308af1af24470006b5408`。Rootの追加補正はなく、候補afterと実bodyの6文書は全てbyte一致。

## 6文書の実物照合

| 文書 | SHA-256 | byte | base prefix | suffix byte | 末尾LF | 候補一致 |
|---|---|---:|---:|---:|---|---|
| `docs/helix-harness/L3-requirements/business-requirements.md` | `7c1d8c454867d5f87e356a5b1c3388a965d60678097a1aec5bea3bb9b07f3b6b` | 16811 | 13240 | 3571 | True | True |
| `docs/helix-harness/L3-requirements/functional-requirements.md` | `1796d0151a4311606f14949e29ea9ae8d2b7a79709e10bdf26015139decce00d` | 212949 | 204919 | 8030 | True | True |
| `docs/helix-harness/L3-requirements/nfr-grade.md` | `d27ede8b122ca15ef7035f9f40fe7e03a75b915cfce4265962983bd923028fec` | 46412 | 42916 | 3496 | True | True |
| `docs/helix-harness/L10-verification/business-verification.md` | `fd1eec8bc798670b6f970146a502e0d6d33ea25a43137b16558b8abbcd5ab3e5` | 13125 | 8819 | 4306 | True | True |
| `docs/helix-harness/L10-verification/functional-verification.md` | `81d476b789244fcce502ee67e6ed783fdc3c2f0f44bba1162e1602703cec705d` | 680531 | 636566 | 43965 | True | True |
| `docs/helix-harness/L10-verification/nfr-verification.md` | `18bb204d6057cb0b6f2c2dc7c9bec635408a9d2c148ac23eb36a21895c683ced` | 40600 | 36464 | 4136 | True | True |

全6文書でbase blobがbyte prefixとして一致し、suffixと末尾LFを実blobから確認した。現在のbaseからのPR差分は6文書、修正commitで親から変化した文書はFR/FVの2文書。Root報告のgovcheck・今回の修正差分検査はPASS。baseからのgit diff --checkは過去X1の行末空白を含むため失敗し、そのimmutable行は変更していない。

## fixture ID・raw保持

- FVは `64` 行・64 unique ID、全行6列。checkpointの64 ID集合と現行表が一致し、旧62 IDを保持。追加ID: `CASE-HARNESS-L10-044-r17-unselected-source-assumed-pass-closure, CASE-HARNESS-L10-044-r17-unselected-source-drops-established-class`。
- 旧39 literalは旧source revision `3fd20391f842310012d09c33f5383497898b3afe` のFunctional Verification blobから再照合し、39/39行の文字列・SHAが一致。rawをJSONに保存。
- 固定L2/L11、PO採択記録、旧HIL-FR-54とconsumer/pairの8 spanをrevision/path/行で実blob再hash。全11/11 source span check PASS。

## review・限界

- 正式review07 comment `6025129879` のraw本文とreview06以前の履歴・R1–24・X1をJSONに保持。X1 fileはHEAD blob `c7956182b162f3ff206564da0a1f5423ea7797b3e8b666e016e4ec7df10a67ae`（20176 bytes）で過去pinに一致。
- 新fixtureの実行、oracle、意味完全性、独立再review、PO承認、merge admissionは確認・主張していない。作成側の時点監査である。

- JSON: `/tmp/harness044-review07-postbody-audit-2026-10-07-0999a056.json`
