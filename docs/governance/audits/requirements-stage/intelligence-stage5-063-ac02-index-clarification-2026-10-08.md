# INTELLIGENCE Stage 5 親063 AC-02の索引明確化

- 種別: 本文修正根拠の時点監査。authority effect: `none`。
- base: `4bc86c3a19652033ede35ddef118185fbb004649`。対象はStage 5 / `HELIXINTELLIGENCE-L2-063` / `AC-INT-063-02`のみ。
- 固定L2/L11、CASE定義、NFR分母は変更しない。CASEを追加しない。

## 確認した不整合

修正前のFR-INT-063は、CASE-INT-063-02a〜02gを「独立評価」とした後、同じ段落で旧02dを固定親に根拠がないため独立要件として扱わないと記していた。さらに、既存FVは02gを「複合旧index」とし、out-of-orderを04g、duplicateを04hで個別判定する。NFR-063-02/NFRV-063-02も04a–04hをfixture母集団としており02gを分母に加えていない。

修正後はAC-02の独立範囲を02a–02cと02e–02fに限定し、02dを既存どおり除外、02gを04g/04hへの索引と明示した。個々のnegative条件、固定親のowner返却、CASE ID、NFR分母は変えていない。

## 固定親・旧source

- 固定L2 `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:372–376` SHA-256 `592c9efe7a5e68c53d56de696080f286e4c926110775f49e46de979fe232537c`。過去評価、BRAIN一般知識、INT現在判断、OS実行、HARNESS工程contractのowner/時点分離と、効果結論をLABOへ残す条件を照合。
- 固定L11 `docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md:117,284` SHA-256 `98413d69444934e047c1bc6626257aeee95f3892c6ea53fa63b7e854878efe33`。遅着/重複結果は過去episodeへ結びcurrent judgmentを上書きしない境界を照合。
- 旧source: UIL requirement/acceptance、pillar FR/L10、UWJ FR/L10を起点に、episode/time/ownerの分離、重複・順序異常の個別oracle、unresolvedの保持を再導出した。旧recipe promotion、memory/runtime loop、interview/schemaを移植せず、旧test/runtimeは実行していない。path/line/asset IDはJSONの`legacy_source_review`。

## 6本文のSHA-256

変更前はbase `4bc86c3a19652033ede35ddef118185fbb004649`のGit blob、変更後は作業treeのbytesから計算した。

| 本文 | 変更前 | 変更後 |
|---|---|---|
| `docs/helix-intelligence/L3-requirements/business-requirements.md` | `026d95fbf023ef384834ebd3b215a469f2fea648190d15d45494b5ea4cc91959` | `026d95fbf023ef384834ebd3b215a469f2fea648190d15d45494b5ea4cc91959` |
| `docs/helix-intelligence/L3-requirements/functional-requirements.md` | `c4f7b0cc4b85f00e3ebbf20595ac457bcddd9b3855236e7f786a1eba30797cfe` | `a8181f7b6c1873d43c7917e7912a2da97e2a2dcb4985c1e432bce105fdfe27b3` |
| `docs/helix-intelligence/L3-requirements/nfr-grade.md` | `e117fa2b96fc37e8623485b7af4c31d830da4c705deff975fcff3937cbd29895` | `e117fa2b96fc37e8623485b7af4c31d830da4c705deff975fcff3937cbd29895` |
| `docs/helix-intelligence/L10-verification/business-verification.md` | `b476b0939b7da50cf75db66d235095f94e591ac929ef046721224b5112d04552` | `b476b0939b7da50cf75db66d235095f94e591ac929ef046721224b5112d04552` |
| `docs/helix-intelligence/L10-verification/functional-verification.md` | `361f5a6e40a3c34dc1b231298cae933dbbfe9cba95c3608067c23d660c194078` | `361f5a6e40a3c34dc1b231298cae933dbbfe9cba95c3608067c23d660c194078` |
| `docs/helix-intelligence/L10-verification/nfr-verification.md` | `92b7f8a4825a95398c8b7038b9be8cd77301feeef61bd517dd247669d4c6654d` | `92b7f8a4825a95398c8b7038b9be8cd77301feeef61bd517dd247669d4c6654d` |

既存069監査 `docs/governance/audits/requirements-stage/intelligence-stage5-069-ceiling-input-vs-ignored-correction-2026-10-08.md` はbase内SHA `434efa47e4c6b44cb3331621283e3a37a526429df80c6a115714337d120d4b2d` と一致し、変更していない。

## 検証と未実施

- 修正後のAC範囲、既存CASE索引、NFR/NFRV分母、固定L2/L11の不変を静的確認する。
- `git diff --check`、6本文SHAを検証する。旧test/runtime、L10実行、独立review、L3承認は未実施。本監査は承認や完了を生成しない。
