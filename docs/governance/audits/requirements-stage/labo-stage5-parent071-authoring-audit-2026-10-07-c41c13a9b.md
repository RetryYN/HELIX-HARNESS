# HELIXLABO-071 authoring時点監査（Worker候補）

- JSON: `/tmp/labo071-authoring-time-audit-worker.json` SHA-256 `8ff4cc40320a6f627f2e688a464077b7925cd109ef95638fa8e1b2f0fc521682`
- source candidate SHA-256: `7e140e8ac1b4b71b4a2f1fbe6c4c25d61fd28fca8517e6d2ae6775ca692cf72f` (183304 bytes)
- integration checkpoint SHA-256: `fb933eb254a0f5e3c41b6c9f30735c3c5927aa18eb7cc10f15fca3150681c5d4` (53003 bytes)
- actual target WT: `c41c13a9b2b2b70dca03016ec7b646f85eec7e90`; base/current main `ceda1c53b53c53fffb8c23f394add1f2b809deb1`; WT status clean.

## 固定親とPO

- 固定L2/L11の物理spanは `ea6f756f96a7370de78e412d737c7a7ed472114a` から抜き出し、full/span SHAを再計算してcandidate pinsと一致。
- origin/main PO row: | `HELIXLABO-L2-071` | 承認（通常採択22件に含む） | `MPR-RC-HELIXLABO-L2-071-001` | `sha256:3036e4c300ee6f78e74b819657d456c0bad08b8ccb483882cfc3b59fa5bbbe1f` | `sha256:029c6bcea5a206a15c8bbe9706ff25917fbf9a6496b3891288fc2660634f7bc0` | 最新main全体での同一ID検索は1件。
- 登録行 `MPR-RC-HELIXLABO-L2-071-001`: actual line SHA `cd4f7f18a099b768321d14b830a9871e50c576596b369b664b7ee4a869a57493`。登録はauthorityを生成しない。

## 旧source・旧ID

- 選択L1 source、歴史contextの旧L3とacceptanceのfull/span SHAを物理再計算して3 pin一致。context sourceは意味再導出の親ではなく歴史contextとして保持。
- 旧CASEはa4 source FVの物理行で24/24 literalとraw SHA一致（full file SHA `7a6c7dc1f88c77bbd628a1320c0393f0ad6c14b76d5a30db0c4cda27d22b9d16`）。
- root pin checkpoint: old/source 24 raw +10 fullspan errors 0; selected legacy source/context 6 fullspan errors 0。入力checkpoints自体のSHAもJSONに記録。

## 6文書とcurrent prefix

| path | ceda base SHA | integrated full body SHA | exact branch integration |
|---|---|---|---|
| `docs/helix-labo/L3-requirements/business-requirements.md` | `6eb0e6094202a519d34b84670c7c9fa9143ced0c8e25883bddc22c9a395feae7` | `f35be71a37c8138115dcd33c8a8e75d5613063b4fbf6eb9391c4dcc115829908` | 一致 |
| `docs/helix-labo/L3-requirements/functional-requirements.md` | `24dff56c5e90120360fe446c38e1e3b4b4b58db569fa8eb40d2be8b338161426` | `42f38c6753041202906cd287a09431f9bc0014e1fc22bf9006045dddfa91298b` | 一致 |
| `docs/helix-labo/L3-requirements/nfr-grade.md` | `e39aadaf35521a2c9c49001581c2d6e7770156749a0705666105b579b4387be7` | `1fe941bf8993b410d94b032db87d13b7e011683fc4fc3637420b6f345c1ae2f2` | 一致 |
| `docs/helix-labo/L10-verification/business-verification.md` | `43115cad1beeeb4aa887c80206936d2ecec6ef507447a559b4544222f8ccb089` | `4216eb7adc0215b34c3742a3eeb3eb435cc0236934e14521e6c1656b7b1cb1b2` | 一致 |
| `docs/helix-labo/L10-verification/functional-verification.md` | `2d0d893deb6ce95836b5b1b1f3b6a01511db36ce956a881788b5de1c26f5783b` | `77b6808ffc21d2bc0d59dffec5450a903773dbea25509407a8eee56ecde63d32` | 一致 |
| `docs/helix-labo/L10-verification/nfr-verification.md` | `d2c9c508465305c3edf9af1f6d2d247cd19f07617aefeca25f320eeaba56ceca` | `a5384004be82a63121b3289e0350b346a3c743f51ae82489dbb30e348972dde4` | 一致 |

- 全6件でcurrent ceda base full hashがintegration checkpointに一致し、`base bytes + separator + integration suffix` がtarget WT HEADの実ファイルbytesに完全一致。
- bounded source artifact（fa642 observed state）とintegration checkpoint（ceda base）は別時点として両方全文保持。候補afterと統合suffixの差はFV AC-03一行のみ。統合側は実行許可・採否・完了生成拒否を各個別に追加し、固定親の境界と整合。

## CASE構成

- 旧24 IDを維持しcurrent FVに28 unique row（新規CASE20–23の4件）。件数は網羅性・実行結果の証明ではない。
- CASE04aはthreshold生成のみ、CASE23はrequalification schedule生成のみ、CASE19はexpiry誤出力fieldのみ。CASE20/21/22はそれぞれ実行許可・採否・完了の生成拒否を別fixtureに分離。
- 6 suffixにowner individual identityを特定してから返却する条件は検出されず。既知責務区分は無条件返却し、個体identity unknownを別扱い。

## 制約

- 候補・本文は検収用。fixture/NFR実行、独立review、承認、PR/merge判断は行っていない。canonical repositoryは変更なし。
- before/after全文、source artifact、source pins、全integration suffixとbody hashesはJSON artifactに保存。
