# HELIX-BRAIN Stage 2b next-five revision summary

- 対象本文commit: `56b5356cd43dce21497be9979e06cb81d1a9bb9d`
- 対象: HELIXBRAIN-L2-009/010/011/012/029、各 `version_target: 1.0` / G0 Stage 2b。
- 状態: 候補草稿・未承認・未実行。POによるL3承認、独立review、root最終検収は未成立。
- authority effect: none。実装・実行・release許可、Web/後続版、hold/rejectの採択、新しいstage gateを含まない。
- Stage 2b trace: 009=11, 010=9, 011=9, 012=10, 029=52 functional CASE（計91）。Stage 1 prefixを含むL10 functional CASEは計113。
- 2026-10-05 root review M1–M3/m1–m4 の修正記録は対応するstatic-validation JSONに固定した。独立reviewの代替ではない。
- 固定/旧source pins: 18 records / 37 bounded spansをGit bytesから再照合。
- prefix `67c807c53ed4bcd3a132f07bf35b9f07424437de` の6本文bytesを保持。

## Canonical SHA-256

- `docs/helix-brain/L3-requirements/functional-requirements.md` — `5492d9b11eeeeb7f44a3ed013563403b46f20bbc4d12631367df6677bd4a0fbb`（312行）
- `docs/helix-brain/L3-requirements/business-requirements.md` — `955aa8bf343f72dd832ddf848e30e2eb0d286bc0bc731558c6c0387848d72ed1`（42行）
- `docs/helix-brain/L3-requirements/nfr-grade.md` — `41f7ca32c3944b3c2448a599c02cf695a7f428fd0b9b5a7d25f78476257eaaab`（71行）
- `docs/helix-brain/L10-verification/functional-verification.md` — `13e44f5b21dfb190fd7f2bf7f6a8310421ccc10fd06d366a738e8d9627ae3ab9`（337行）
- `docs/helix-brain/L10-verification/business-verification.md` — `f10b1513a777d65162e3ca430b426f5989c516de8bfe452dfd00eebe0786e310`（40行）
- `docs/helix-brain/L10-verification/nfr-verification.md` — `387ff7192cbbaa08868c914ec787fa405b2a63769e0d5c3705770f4f506d0068`（57行）

## 静的検証

`scfctl validate`: 147 bindings / fail 0; `scfctl residuals`: 0; `govcheck`: atoms 7622, requirements 57, files 58; Git diff check: pass. 旧runtime/test/CI/Bunは実行していない。
