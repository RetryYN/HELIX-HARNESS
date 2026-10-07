# HELIX-OS Stage 5 parent 025 複数project trace 補強記録

- 基準remote main / 専用worktree base: `4084ab11560dc19e5c7bf74ae6df7adcd0e2e9c0`
- branch: `codex/os-stage5-025-multiproject-repair`
- 対象: HELIXOS-L2-025 と対になるL3/L10 Stage 5だけ。
- 要求確定checkpoint `633bf12ea8f948db8ba3d6600179c4a9507377a7` と、個別親の採択本文revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc` を区別した。L3承認・L10実行は発生させていない。

## 根拠と旧source disposition

- 固定L2:025: `docs/helix-os/L2-requirements/governance-requirements.md:742–751` section SHA `b7166f6399db9a0f1d3a9db76977ec4ec0f1e7f708503ccc42beea0ec97121e1`。HELIX自身と性質の異なる複数project、各stage trace、単体/connection/composite区分、1.0全体7製品確認と個別成立を記載する。
- 固定L11:025: `docs/helix-os/L11-acceptance/governance-acceptance.md:394–400` section SHA `d21d7708fe09cbee17d37ad66444d99631f16e2c8198924da9b608a1117eda18`。複数projectを正常成功条件に含め、欠落時はunit/source/connectionへ戻し未完義務を保持する。
- PO固定判断: `docs/governance/decisions/helix-os-requirements-po-decision-2026-09-28.md` at `4084ab11560dc19e5c7bf74ae6df7adcd0e2e9c0` SHA `5f54e68009fe291853d2d55df241e8220cfdd93eadd1b2a203bb126596b321da`; lines 27, 48 identify f6dad fixed bytes and parent inclusion.
- 旧形式source: `archive/legacy-generation-2026-09-14/root/docs/process/forward/L00-L06-design-phase.md:148–169` SHA `b1875f9b1ba51be0d5f7509993c521b6db7ab4990612dbaf6f69111475c6fb52`. L3 three-subdocument + L10 paired acceptance structure is reused as format. Limited search over recorded paths for `統合運転`, `統合運転構成体`, `HELIX-OS統合` found no exact hits; that scoped search does not establish absence. The 025 semantic requirement was re-derived from fixed L2/L11.
- 起点read-only監査: `/tmp/os-stage5-parents-025-026-031-047-semantic-audit-2026-10-08.md` SHA `c54df0ab4ed15f6f25249d479a3867ba6b8d380b1f6f848e27f1b83a619d0ecc`; treated as starting note, not authority or approval.

## 補強と境界

元のfixtureでは、HELIXと異種projectのそれぞれが別例に分かれ、HELIX chainだけでstage単独欠落を試していた。したがってproject Bで一段だけ欠け、他のprojectとHELIXは正常というfalse-successを独立に拒むcaseがなかった。

CASE-OS-L10-025-050にHELIX-self@r3、project:campaign-site@r3、project:data-migration@r8の三traceを同じ正常fixtureとして定義した。各traceは要求authority→ticket→Worker→検収→提供/運用→LABO評価→OS還流の7段で、project/revision/scope/authority、直前段source referenceを一致させる。unit、connection、composite evidenceは別identityに保つ。IDはfixture値で実decisionを生成しない。

CASE-OS-L10-025-051〜057ではproject:data-migration@r8の7段のうち毎回一段だけを欠落させ、残る6段とHELIX/project Aの全値を正常に保持する。欠落は既存source/unit ownerへ返し、他の成立状態と未完義務を残す。owner、version、要求意味は変えず、新gate/閾値も設けない。

L3 AC-025-01/03、L10 FV、business/NFRのcase trace・分母記述を同期した。定義数は42から50（新規8件）で、実行数・合格率ではない。

## 変更文書のSHA-256

| 文書 | 変更前 full SHA-256 | 変更前 suffix SHA-256 | 変更後 full SHA-256 | 変更後 suffix開始行 / SHA-256 |
|---|---|---|---|---|
| L3-BR `docs/helix-os/L3-requirements/business-requirements.md` | `cbe1866df47503b17e8a11b786dee8da58cd8a2a0a99778b64bd4a669b2fa702` | `cab859b912e9a2b6a122322d879a55e0522ee4eb751c15ec335a6a5b356cce55` | `1e499ff0f6cd559fbff69639cd724cf50e66e9126f8e54eedc779a7410ad5ca9` | 93 / `54abdd4505d84e119ec3a66d90c85dc00f136b4f204371039fe771391f961bde` |
| L3-FR `docs/helix-os/L3-requirements/functional-requirements.md` | `c2a11a70ccc7ad5af41eae92b3c690869c6e7e35fc22d2019b9287c980901731` | `3114cf1855a7b13f3b8ff2ccb09f503ab0c0509ae51c8d50a743d4f8ce1c9ea3` | `6a64f55a156a40aa91c5804e27b882d61def85814e5bfea5b7a2c3c5da25aebf` | 538 / `204995cb08db7074397d9587a1cb3592643b0b19968309c16c429b5cbd8cd315` |
| L3-NFR `docs/helix-os/L3-requirements/nfr-grade.md` | `c815ea15001b7148a8b3257c36c2fb8a18cb19c035d0ef14f953ab9e993acacd` | `0cb416b0ed18cbb80f1a46786932e2ab56b59f46e86279727c22a784eb93607c` | `4977afcac4043c7913be6291268ffb7a46b66d03ecef4e637488ab4ec5a346af` | 117 / `e956885abd40abfc89e15d4ea19b746d7006d5845105722c271d31e8c37b4c1c` |
| L10-BV `docs/helix-os/L10-verification/business-verification.md` | `f785e13aa9a1ef8494154f03e20d0582418916281c51a6b729d385d5b66ef051` | `5ce544b45f4d70befc8af820dfe61ad60cd9e4909703474055c09bc6d3086885` | `bd136ea821f4619f89d93f5c460c80a046bad718b562340360301f715a7cdd16` | 82 / `acfe8deb93ae83afad4445a17607b055f948055fa51c3bce736a029b738c72ea` |
| L10-FV `docs/helix-os/L10-verification/functional-verification.md` | `784b314d8425a26551a37951f777531570f287c87aef326d6ef751b521ad1822` | `ca8e47306a682454d6d023835c5bced88a376caff652580e012a6a4d7d190b57` | `a5261b342714b6a3ec64fee64273c40f7f31d097c4b0b226ff732c3eece3f075` | 1007 / `6b1c03cb3055157bd3494e27504edd2fa2a8e5d132707414f2185e78e101b0b5` |
| L10-NFV `docs/helix-os/L10-verification/nfr-verification.md` | `bd98bf3265c74d5ddddd879b4f87d4eaec9343bf63ee377950c63f32fb47e868` | `bebc13f7a9e79e9f70af3e698c6b60d7730ec435216ee3ec125ceff6b8751ae3` | `0bf4c5d38a5b46888441a1f6f337413852df930dbac18c53814f9dc398a94aae` | 125 / `f078321e15fd0e5aec125a03bfb4dc0b9635ab232ccc234f62cbfb0687b68e1d` |

## 確認と未実施

- 静的に確認: CASE ID一意性、CASE-050正常fixture、051〜057の7種類の単独欠落、L3 AC mapping、business/NFR参照の057終端、50定義の分母表記。
- `git diff --cached --check` は本文6文書と監査MD/JSONをstageした後にclean。
- CASE実行、旧runtime/test/CI、実装、L3承認、PO事後確認、L10実行はしていない。
- 監査対象外: 他のOS親・Stage、別機構のconsumer、実運用上のcoverage。

機械可読pinは同名JSONを参照。
