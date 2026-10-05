# SECURITY Stage 3 追加照合・誤pin訂正記録

- 対象: HELIX-SECURITY Stage 3、親029/030/032/034/035。
- authority effect: none。PO判断・独立review・finding closureは生成しない。
- 元本文修正: `73cec60ee2a57534421f13896e796a6329006459`。今回本文: `95d7194ddeee444eae702557135ea3227ec40fba`。
- 固定親: `633bf12ea8f948db8ba3d6600179c4a9507377a7`。既存repair record `58b1703a2a156cdf7af8a6f2c5571cc14a71f03c` は不変。

## 今回の訂正

- 030のHR-NFR-P8-03/HAC-N8-03a,bのsourceを、誤っていたgovernance v1.3 locatorから `pillar-functional-requirements.md` の実在箇所へ訂正した。6fab baselineは181・290–291、2d499は187・299–300。2 revisionは別々のsourceとして保持した。
- crosswalkの032/034行を含む変更行は3列にそろえ、032の規範sourceとpillar/HAT補強、034のarchive sourceと6fab baselineを分けた。
- AC/CASE-029-04はL2-016分類記録のowner/source/revisionをasset identityへ束ねた。L2-005 credential tupleはcredential-use requestが存在する場合に照合し、未発生request fieldを通常操作へ捏造しない。
- CASE-035-02/03は実行時のcleanup強制（Worker）、assignment/未完義務（OS）、policy意味・owner不足（SECURITY）の既存戻し先を分けた。

## 根拠pin

固定L2-005/016/029、L11 acceptance、および旧sourceのfull SHAとraw LF span SHAは同名JSONの `fixed_source_pins` に記録した。特に6fab/2d499の030 source atomを誤ったgovernance pathへ結び直さず、両revisionの実Git path・物理行で再照合した。

| 文書 | SHA-256 | bytes | 承認済みprefix |
|---|---|---:|---|
| `docs/helix-security/L3-requirements/functional-requirements.md` | `113295a93b57021f73e61914f6783954f59b19756a71be1d782290d46a531321` | 100196 | `8e4c5064a0ab84345c31d6abf6a764c84eb34ad2c4ee41405c074507e175b165` (76904 bytes; byte-identical) |
| `docs/helix-security/L10-verification/functional-verification.md` | `b9fb7edeb791ffa666ea1695c8bd87750836b117e67e9fbaa1bbf91b6c72d275` | 74145 | `f679d21ad0b707ac450473f6b21d1d1feb29d8c2982ed83c6d67133dc2ffe507` (62505 bytes; byte-identical) |
| `docs/helix-security/L3-requirements/business-requirements.md` | `0b2894925bc80895ff61723377f27b14b4cca32289756747c566e35cba049dee` | 1958 | `e6cfb2b5abff73254f0f8d860ffbd0590085fed224cf8f2fb61a02271d780ff9` (1430 bytes; byte-identical) |
| `docs/helix-security/L10-verification/business-verification.md` | `8683764bb26d0d1f582828096c050c264df45a4f0fdc2c94e34bb4dbf9e1eb7a` | 1461 | `d136764cfef2b6eeca900c5046a1228764e414591cc58bd9b6e076fca62fc933` (933 bytes; byte-identical) |
| `docs/helix-security/L3-requirements/nfr-grade.md` | `e08bdd84397a11766a2828c66ceb56b7d8e9ec4f3b0071993ce8cac4a94ed4ed` | 12906 | `bc2476eafc5922b451a7c967e9d05aa477e6649c58b77427cd24ed1d4de12427` (9983 bytes; byte-identical) |
| `docs/helix-security/L10-verification/nfr-verification.md` | `0b808d2216e75cbd34905513139409a9b5d6f281f07c2767c890ff917cf883bc` | 9640 | `683fd29048418b6e8d1e78ab27bc727dc026d7c5555c7a63662d27da7746fd18` (7420 bytes; byte-identical) |

変更literalと現在行・raw LF hashはJSONの `current_changed_literal_line_pins` に記録した。

## 検証と限界

- body `git diff --check` はpass。旧runtime/test/CI/Bunは実行していない。
- 旧sourceは指定Git revision/pathから読み、意味上のsource atomと単なるhash一致を区別した。
- 本記録は作成側の追加訂正記録。root本文検収・独立review・PO判断は未了。pushしていない。
