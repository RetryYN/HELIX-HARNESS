# SECURITY Stage 2c L2-031 review01 M1 correction (2026-10-08)

## 対象・固定source

この時点監査はPR #2674のformal review comment `6043853781`（UTF-8 body 7,308 bytes、SHA-256 `7211f0a63a092859799c76eef420018778c5d15477cbfa5f231826b8dbee0ff1`）のM1だけを対象とする。作業baseは `786ee7c85c5454e3b2314c1d8ee3ca28f5178db1`、修正前HEADは `e7853ba7c76858a2acd4d9a9e43e94cd5b1eb822`。固定親sourceは `633bf12ea8f948db8ba3d6600179c4a9507377a7` のL2 `docs/helix-security/L2-requirements/security-requirements.md:427–446`（全体SHA-256 `aa9d6446e97d7027da6c15bbb315bdfa524edf0fa3e5252403f91e7cbac1abdf`、raw span SHA-256 `3ff72f9130d888213e2f3e5226a22bfedb965b9e80beebea810b8fec04cd964a`）とL11 `docs/helix-security/L11-acceptance/security-acceptance.md:104–115`（全体SHA-256 `e4d92364e3a8c88332ee48358ac6b08c2d8cdd51cd5e00b111fff4c3f43b68d0`、raw span SHA-256 `3b2700d511ea0feb8bbeb3dcedd7dd3eb9d1a26a2aeb9c79f57f835c045c0cd7`）である。

旧sourceは `LEGACY-ASSET-C7F0C3B79CBAA72960BF` の `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md`（全体SHA-256 `8a46a6a75f1c6159b45b09bd975298347f70997b7969231a0514c09db210dab6`）にあるHR-FR-HIL-23 line 57 / HAC-HIL-23a/b/c line 86を読み直した。隔離内委譲、proposal再検証、未許可egress/scope diff/機密委譲の拒否、quota/egress逸脱時fail-close/quarantineという旧保持点を確認した。 task固有sourceの選択、未選択・未許可sourceの推測複製禁止、別source fallback禁止の具体条件は旧sourceへ帰属させず、固定L2-031:434/440から再導出する。旧実装、test、runtime、CLI、CIは実行しない。

## M1と修正

Formal reviewはCASE-031-02に未選択/未許可sourceを推測複製するnegativeと、選択source欠落時に別sourceへfallbackするnegativeが独立していないと指摘した。固定L2-031:434は未選択/未許可sourceの推測複製を禁止し、:440は未選択sourceを未観測のまま保ち、別sourceへfallbackしないとする。既存AC/CASEの正常・適用条件は維持し、次の独立negativeを追加した。

- `SECURITY-CASE-031-02c`: 他の開始条件を正常に保ち、task固有sourceが未選択または未許可の状態で推測複製する単独変異。開始拒否、開始後に判明した場合の結果隔離、未選択sourceの未観測保持・未許可sourceの未許可保持、既存source/payload ownerへの返却、他ownerへの返却不合格を明記した。
- `SECURITY-CASE-031-02d`: source選択・許可と他条件を正常に保ち、選択source欠落だけから別sourceへfallbackする単独変異。同じく開始拒否/結果隔離、代替sourceの未観測保持、既存source/payload ownerへの返却と誤owner不合格を明記した。

`SECURITY-AC-031-02`にも両negativeと期待する境界を記した。L10のfixed-parent/FR/AC/CASE対応表へ031をStage 1とは別scopeとして追記し、Stage 1の19親/33 CASEの集計へ混ぜないことを明記した。SEC-NFR-031-01およびNFRVの測定対象・trace・分母では02c/02dを各々独立したrequired negativeとして扱い、file-needed applicabilityがunknownなら分母をunknownに保つ。新しい閾値、owner、承認者、runtime gateは追加していない。M1以外の未返却Minorから新blockerを導出していない。

## 6本文pin

SHA-256は同一修正HEADで計算した。BR/BVは変更していない。

| 本文 | 修正前 `e7853ba7c` | 修正後 |
|---|---|---|
| L3-BR `docs/helix-security/L3-requirements/business-requirements.md` | `30a0456a17c4c65e9427cc8931905cb7c1adf54c207514f948a7b179dcdb7019` | `30a0456a17c4c65e9427cc8931905cb7c1adf54c207514f948a7b179dcdb7019` |
| L3-FR `docs/helix-security/L3-requirements/functional-requirements.md` | `9a6a57a4b0b27329a1d9b6fe3eebb6ea52cfabae11b20ffa58c3e15a01512bba` | `ae9d5ec49d63f247eaa540961f22eae5071fe213c15b267722313764928d7b81` |
| L3-NFR `docs/helix-security/L3-requirements/nfr-grade.md` | `5b4a647220bea4192788ac937f9ee889574abb49639493f5e78edadc2950f66e` | `bd8533006ead1dacde26ad88733c88379bf7453d297211387564db053cbec59b` |
| L10-BV `docs/helix-security/L10-verification/business-verification.md` | `7da2a3b88c866c276065c793036708a633109b176b0381829c8d3c8293ff70a4` | `7da2a3b88c866c276065c793036708a633109b176b0381829c8d3c8293ff70a4` |
| L10-FV `docs/helix-security/L10-verification/functional-verification.md` | `82feb8065571f02c3ac2e55c373e86dc1ac86d6c205d8eaab0354286969096c4` | `307b9c10260319bd3f904c4695f1173853452233418c5517bbedd623b79ea929` |
| L10-NFRV `docs/helix-security/L10-verification/nfr-verification.md` | `444560c4ffe00c4a330d6b8a76ad2c86798be1bd4ab506886c96ce0cc4a40e43` | `a52d221d47f0ec92e1d14969ce322b7f1ff88200e8cdb574a63fd9fb06dcf2d7` |

## 検証と限界

`git diff --check` と静的ID/trace確認を行う。Stage 1修正commit `6a48249fd428db5cb0cb6d0d240211b54c305361` はこのbranchへ取り込んでいない。fixtureは未実行。修正後HEADの独立review、Opus/Fable見解一致、委任条件3、PR admissionは未成立であり、この監査から承認・実行・mergeを生成しない。既存review01監査その他の時点記録は変更していない。
