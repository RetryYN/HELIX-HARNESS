# SECURITY固定L11引用訂正のmain統合追補

## 統合基点

先の引用訂正commit `aad4aba2d264725eecef006374460c06c956bf03` の後、SECURITY-028 PR #2689 merge commit `e77d62dcdbb422dda61517abd52163f76b98e39b` を含むmainが進み、最新 `origin/main` はOS-023 PR #2686 merge後の `d629e25254a7c1d505543a0ce6ca3183c3fc4d67` となった。作業branchへ両main更新を順に統合し、この追補前の統合HEADは `45e9116c91b0f268b677797cd44fe44bf3737a70`。以前の引用監査MD/JSONは `30133dc18b5dfe93e2f3c43693d2b96e1fce6411bd0656630b7b1d7915ad1898` / `43b6bd4851d0b0c56c58134759742672c15af075d74bd00bed8209ee33e378b2` から一切変更せず、本追補で更新基点とpinを追加記録する。

## 独自差分

統合HEADと最新mainとの差を全6 SECURITY L3/L10本文で確認した。独自の本文差分は `functional-verification.md` の002 line 50と007 line 98だけで、双方が固定L11 `f6dad2a33e24f000b87d7f09b8d40288257e74cc` の第3セルと完全一致する。L3-BR/FR/NFR、L10-BV/NFRVは最新mainとbyte-identical。033のFV line 225も最新mainとSHA一致し、L11 033本文/P0追補も変更していない。#2689のSEC028本文は最新mainから保持され、FR:296–309およびFV:213–221のSEC028 section bytesも統合後と一致する。

## 最終6本文SHA-256

次の6文書の統合後full SHAをJSONに固定した。002/007以外の意味・CASE・分母・責務は変更していない。

| 文書 | 統合後SHA-256 | 最新mainと一致 |
|---|---|---|
| L3-BR | `30a0456a17c4c65e9427cc8931905cb7c1adf54c207514f948a7b179dcdb7019` | 本文差分なし |
| L3-FR | `f6872a3ee941d63c80a9717bca7e81de832c043ad05cc9ac0c2db77eb264ee9e` | 本文差分なし |
| L3-NFR | `d2c1d93cf4fb142ba6abae13c7e640a7c9826f6c0ed5ce49de7991cb8f884c3b` | 本文差分なし |
| L10-BV | `7da2a3b88c866c276065c793036708a633109b176b0381829c8d3c8293ff70a4` | 本文差分なし |
| L10-FV | `0d81d49d2a16cb70b78b5ef7d0379e3b64632bbe18ac6fda9e3302f00c5bb40b` | 002/007の引用行2箇所のみ |
| L10-NFRV | `3675115f6d1b242a511651e627e8c46cfc71013ce9cf129c5045f1ce51e5f685` | 本文差分なし |


## 検証

- L11第3セルとFVの002/007 oracle句をUTF-8文字列で完全比較し、一致を確認した。
- #2689のSEC028本文と該当FR/FV sectionは最新mainとbyte-identical。6本文全体の独自差分は002/007引用2行以外にない。
- `python3 scaffold/tools/scfctl.py validate`: exit 0、`bindings=147 fail=0`。
- `python3 scaffold/tools/scfctl.py stale`: exit 0、`stale=0`。
- `git diff --check`: pass（追補をstaging後に再実行）。JSONはJSON parserで検証。

fixture/runtime/CI、archive内runtime/CIは実行していない。本追補は統合と静的pin検証を記録し、全SECURITY内容の意味再reviewやL10実行を主張しない。元の監査記録は不変のまま残す。
