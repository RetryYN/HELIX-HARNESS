# INTELLIGENCE Stage 3 review09 補正記録

対象本文commit `67ef7d435375cdb478145d1b1ee17e46f74f0361`（修正前 `42bd21eabf11fdc63e4c40ec66f34ee1c6143956`）、固定main `14dbdb6ae562d19d7fc49b33e36c18efcd3bafc0`。この記録は作成側補正の証跡であり、権限・要求採択・独立review・委任承認を生成しない。旧監査は変更していない。

正式review comment [#6003498249](https://github.com/RetryYN/HELIX-HARNESS/pull/2607#issuecomment-6003498249) のbody UTF-8 SHA-256は `a954e07b6c2b695ff728080d472e8276811ce88e3ee209fe0ad55a91b22149af`（4930 bytes、JSON envelopeを除く）。

## 指摘と補正

- **M1**（本文補正済・独立review待ち、docs/helix-intelligence/L10-verification/functional-verification.md:1213）：authority参照不一致の戻し先を既存authorityの対象ownerへ限定。SECURITY宛ての追加ルートを削除。
- **m1**（本文補正済・独立review待ち、docs/helix-intelligence/L10-verification/functional-verification.md:419）：L2 locator 143を142に訂正。旧root-review08監査の143 pinは不変のまま誤記として追補訂正。
- **m2**（本文補正済・独立review待ち、docs/helix-intelligence/L3-requirements/functional-requirements.md:449,450, docs/helix-intelligence/L10-verification/functional-verification.md:1205,1206）：067 evaluation packetのscope/revision欠落2CASEのtraceをAC-067-04へ修正。
- **m3**（本文補正済・独立review待ち、docs/helix-intelligence/L10-verification/functional-verification.md:1208,1209）：fixture文中の句点後余分空白を除去。1210も点検し、該当する文中空白なしのため変更なし。

## 固定source・旧source確認

固定L2/L11はmain revisionを明示してraw LF込みでpinした。L2-016の失敗時戻し先は142行であり、143行は空行。L2-072の戻し先は573行に列挙された既存責務（対象owner、BRAIN、LABO、HARNESS）に従い、authority不一致は既存authorityの対象ownerへ返す。L11-016:77およびL11-067:199も照合した。

旧sourceの親別crosswalkは `l3-l10-intelligence-stage3-main-publication-cutout-2026-10-05.json` を読み直した。016/067/072のasset identityとspanは同台帳に記録されたものを維持し、今回変更していない。

前回のRoot review08監査はimmutableとして保持する。
- Path: `docs/governance/audits/requirements-stage/intelligence-stage3-root-review08-correction-2026-10-06.json`
- SHA-256: `94555543cbb4add9108f1c8e896b978d4cf5aaaa2f2a128ab6d8ef61b99234d3`
- 旧L2 pin: line 143、raw SHA `01ba4719c80b6fe911b091a7c05124b64eeece964e09c058ef8f9805daca546b`、literalは空行。実際の戻し先文言はline 142。

## SHA・差分検査

- `docs/helix-intelligence/L10-verification/business-verification.md`: body `47ff208d647c176378da650821c91a176f5d232e3e044b63c6ce00aeaf2820a7`; 14555 bytes. main prefix (14dbdb6ae562d19d7fc49b33e36c18efcd3bafc0) exact `9f8049fd3e7bdfe6550f5de9a444d1f44449c1b61769bf79e85b47c2c5906e81`; 5680 bytes.
- `docs/helix-intelligence/L10-verification/functional-verification.md`: body `48177ad4fa3303981d59c0ed84031a8b8eaddfd47f3822d6a1618f5964e998d0`; 467014 bytes. main prefix (14dbdb6ae562d19d7fc49b33e36c18efcd3bafc0) exact `192e980c2b4c6c7a78d2651ae30e23c5072ee1ff4ae7366bd01be155bf88aac6`; 31138 bytes.
- `docs/helix-intelligence/L10-verification/nfr-verification.md`: body `38434b5da4b86657435ac4f8e5c3506bcabfa7b2b0184637d3af08e03117d3bf`; 29221 bytes. main prefix (14dbdb6ae562d19d7fc49b33e36c18efcd3bafc0) exact `a8f2e0c4bc1d482d6cfd68cd5f9638fcf8575104aafc7bdcb5214b162190f876`; 12464 bytes.
- `docs/helix-intelligence/L3-requirements/business-requirements.md`: body `d8815e2da610280764207379dd9ac94b50c9ac1b33ba4f2a6b170e137cf45c87`; 10260 bytes. main prefix (14dbdb6ae562d19d7fc49b33e36c18efcd3bafc0) exact `5839b4cd42af9d57b0e01e8da6014838097671738297e2a343bcc4739d67809d`; 5552 bytes.
- `docs/helix-intelligence/L3-requirements/functional-requirements.md`: body `13d332c30065f9f69e1191c17252573c5c24ad9a15fbca93fd8b07df0e735fef`; 109756 bytes. main prefix (14dbdb6ae562d19d7fc49b33e36c18efcd3bafc0) exact `cb9cc91c9f2646e2272fd18c6fd2b176285ba3b0f36409805e5a2879adad6017`; 33090 bytes.
- `docs/helix-intelligence/L3-requirements/nfr-grade.md`: body `52881cbca3596750d9ae6845e57e02c821ed628f0ec3de67ccb4fc1d3190811d`; 27764 bytes. main prefix (14dbdb6ae562d19d7fc49b33e36c18efcd3bafc0) exact `046a3b23b5070e339e579da2428d7773cb91da2b9ebad520971be3803e2e1a80`; 14314 bytes.

変更行（raw LF込みSHA-256）：

- `docs/helix-intelligence/L10-verification/functional-verification.md:419` `b4e8de52c4d67421efda5b6006877f3ae15e8d02d0a8980f23f7dc2b7bcd5302` — `| `CASE-INTELLIGENCE-L10-016-02r` | `FR-INTELLIGENCE-L3-016-01` | `AC-INTELLIGENCE-L3-016-02` | normal candidateからwrite-setだけを不一致/別版へ変える。 | write-set mismatchとしてcandidate該当fieldだけ未完にする。実結果/実行許可を生成しない。 | 固定L2:142/L11:77の該当source/SECURITY/OS ownerへ照合を戻さないまま確定したら不合格。 |`
- `docs/helix-intelligence/L10-verification/functional-verification.md:1205` `4b78cf5c5e72411534f16eef4036b4c3f8c49e8b1fa2f7fbb9e468fd7b323be0` — `| `CASE-INTELLIGENCE-L10-R08-067-evaluation-scope-missing` | `FR-INTELLIGENCE-L3-067-01` | `AC-INTELLIGENCE-L3-067-04` | 同scopeで有効なquality/order decisionとINT034経由LABO評価packetが正常な未見対照から、評価packetのscopeだけを欠落させる。source locator・同一結果receipt・他fieldは有効。 | 当該packetのscope不足を未受領/未評価として送信元LABOへ戻す。既決decisionと既知proposal入力は保持し、評価対象範囲を推測しない。 | 他sourceやdecisionの値で評価packetを補完、未評価を成功にする、無関係部分まで一括停止したら不合格。 |`
- `docs/helix-intelligence/L10-verification/functional-verification.md:1206` `e9b17980dd350f6c66cbfd7285f31cc6af7a42ee93295a90afd606cdb694bea6` — `| `CASE-INTELLIGENCE-L10-R08-067-evaluation-revision-missing` | `FR-INTELLIGENCE-L3-067-01` | `AC-INTELLIGENCE-L3-067-04` | 同scopeで有効なquality/order decisionとINT034経由LABO評価packetが正常な未見対照から、評価packetのrevisionだけを欠落させる。source locator・同一結果receipt・他fieldは有効。 | 当該packetのrevision不足を未受領/未評価として送信元LABOへ戻す。既決decisionと既知proposal入力は保持し、評価対象範囲を推測しない。 | 他sourceやdecisionの値で評価packetを補完、未評価を成功にする、無関係部分まで一括停止したら不合格。 |`
- `docs/helix-intelligence/L10-verification/functional-verification.md:1208` `45a80f1c8ea5be48bdc1972c8d4b612fd9325afc8d91ee6bf9e9f0c95afeec2d` — `| `CASE-INTELLIGENCE-L10-R08-072-invented-threshold-reject` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-07` | 同じ対象scope/revision/case集合/oracleでcandidateあり・なしのshadow結果を対にし、既知FP/FN/unknown/seeded counterexampleと各結果、既存rollback先・戻し条件・当該版evidenceを正常に束縛する。結果評価時の閾値だけを根拠のない新値へ変え、差を成功扱いする入力。 | 新閾値による成功化を拒否し、元oracleと両shadow結果を保持して当該比較を未評価としてLABOへ照合を戻す。 | 閾値創作で成功/優位を確定したら不合格。 |`
- `docs/helix-intelligence/L10-verification/functional-verification.md:1209` `9ace8f9c5faa000da2b09a4d71ab8150b4266427f541883ce697547b82c8dd63` — `| `CASE-INTELLIGENCE-L10-R08-072-added-case-success-reject` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-07` | 同じ対象scope/revision/case集合/oracleでcandidateあり・なしのshadow結果を対にし、既知FP/FN/unknown/seeded counterexampleと各結果、既存rollback先・戻し条件・当該版evidenceを正常に束縛する。成功判定のcase集合だけへcandidate側の成功caseを追加する入力。 | 同一case比較の不成立を検出し比較不能/未評価を保持してLABOへ戻す。元case集合と両側結果は消さない。 | case追加による差を同条件の成功として扱ったら不合格。 |`
- `docs/helix-intelligence/L10-verification/functional-verification.md:1213` `b7b608f6692778b271bb357b2176102f9fec6cc3a3830761eecb4f847dfc1c6b` — `| `CASE-INTELLIGENCE-L10-R08-072-applicability-authority-mismatch` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-02` | 正常な対象packのscope/version/sourceとshadow条件を保持し、authority参照だけを当該packの適用根拠と不一致にする。 | 不一致facetを適用可能とせずunknown/未評価として該当source ownerへ返す。authority参照の不一致は既存authorityの対象ownerへ戻し、追加許可・gate強制を生成しない。 | 不一致を互換として推測する、無関係なfieldを補完、又は実判断を変えたら不合格。 |`
- `docs/helix-intelligence/L3-requirements/functional-requirements.md:449` `0397be769a9b224d97f1466de9df3d428eac94f09ac96d4b34fda34a2acce10c` — `| `067` | `AC-INTELLIGENCE-L3-067-04` | `CASE-INTELLIGENCE-L10-R08-067-evaluation-scope-missing` |`
- `docs/helix-intelligence/L3-requirements/functional-requirements.md:450` `06ca4941c69375ad8dc51b3b85ba951168a8d7a5f9d4fb531e8d45e378189d91` — `| `067` | `AC-INTELLIGENCE-L3-067-04` | `CASE-INTELLIGENCE-L10-R08-067-evaluation-revision-missing` |`

FV table CASE IDは修正前後とも985行で、消失・追加はいずれも0。067のscope/revision欠落CASEはAC-067-04へ同期した。句点後の文中空白は1208/1209で除去し、1210も確認した。`git diff --check` はpass。

旧runtime/test/CI/Bunの実行はしていない。独立review、Opus/Fable見解、新revisionの委任承認、PO事後確認は未成立。
