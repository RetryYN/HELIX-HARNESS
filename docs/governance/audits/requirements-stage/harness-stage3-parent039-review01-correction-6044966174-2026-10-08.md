# HARNESS Stage 3 親039 review01補正追補

この追補はPR #2679 review01（comment 6044966174）の指摘を、対象本文とCASE定義から反映した時点記録です。review01の旧処置監査は書き換えず、本文の改訂履歴と根拠はGitで辿れるように保持します。

正式コメント本文はAPIから読み、UTF-8本文 5887 bytes、SHA-256 `d1dfa6966d3ad0130df5dbda7dde560b0307a9351ce977c91f41630960280129`。対象review HEADは `9afad3c8b6016568f860f6f8e4faa0c82a48398a`、baseは `5857c0a396cb24a23d765e3079a18a2367b6d078`。

**M1**では、M5節を旧fixtureの時点限界としてラベル付けし、r19の21定義を、適用性unknown 7件、evidence scope mismatch 7件、evidence revision mismatch 7件に分けて個別照合します。21件はCASE-039-05を正常baselineとします。7件は該当軸の適用性だけをunknownへ変え、14件は該当軸のevidence scopeまたはrevision bindingだけを変えます。いずれも当該scope/revisionの`ux_verified`主張だけを拒否し、`implemented`、候補形成、設計開始を保持します。CASE定義数は正確に164（主表155＋境界fixture9）、IDも164 uniqueです。

Root再検収で、前版の「対象は全てevidence scope/revisionだけを変異」が適用性unknown 7件に当てはまらず、M5文の「該当軸のux_verified」が軸別stateを示唆する不正確な記述と判明したため、上記の内訳と全体scope/revision主張へ訂正しました。

**Minor 1–3**では、14行の軸名/evidence語結合を修正し、scope/revision変異の入力条件から全行共通のhuman-evaluation条件文を除去しました。AC-02は、人間評価が7軸の一つであることを保つ表現へ直しました。

**Minor 4–5**では、SHAを変更前revisionと変更後worktreeで別々に固定しました。旧監査の `/tmp` 参照は repository外の一時作業メモで、根拠ではなく再現不要です。旧監査ファイルは不変です。

六本文のbefore/after SHA-256:

| 文書 | before (`9afad3c`) | after worktree |
|---|---|---|
| `docs/helix-harness/L3-requirements/functional-requirements.md` | `43e4c188068d8d857b2309a4cd64b0033b7ebcc952e229cc21ef9a6f436fd33d` | `2180967f0075f467c99a553d34f688a1fdf434703803b1a34e7e147d6a7d2df5` |
| `docs/helix-harness/L3-requirements/business-requirements.md` | `9fb531a55c61c4836ae614cadbd850f3967119cb1f0f2eb36dad1e39ebab75e2` | `9fb531a55c61c4836ae614cadbd850f3967119cb1f0f2eb36dad1e39ebab75e2` |
| `docs/helix-harness/L3-requirements/nfr-grade.md` | `ee84bc87ff324eea929d266934c0debb856018aca25c0044f68b11c141c3263d` | `ee84bc87ff324eea929d266934c0debb856018aca25c0044f68b11c141c3263d` |
| `docs/helix-harness/L10-verification/functional-verification.md` | `61ac766ad331595dd25cf0fb4a90d63a3144a392aa51ba4798e22fc2cffb6777` | `d1c55ca4e6b432ccdc941d8d9813c88e5f33476ef2c2d55aa0bfafe549b6726f` |
| `docs/helix-harness/L10-verification/business-verification.md` | `864b0034aa84c4e9b29ec2ebb7bf2151a97dfdca0028c85ba2e0cee655d965ad` | `864b0034aa84c4e9b29ec2ebb7bf2151a97dfdca0028c85ba2e0cee655d965ad` |
| `docs/helix-harness/L10-verification/nfr-verification.md` | `17ee1dc8ab6786416680e496ba8fb83a714756dd8f853830afe036ddcc9b36e9` | `17ee1dc8ab6786416680e496ba8fb83a714756dd8f853830afe036ddcc9b36e9` |

変更spanのraw LF SHA-256:

| Span | before | after |
|---|---|---|
| `docs/helix-harness/L10-verification/functional-verification.md:1396–1417` (r19の21 CASE入力・変異・oracle) | `32dd0bb9dc3cbfb2a11462b92bd8327db4f329f4bfed66c0f7f5da06e33352b9` | `453b274f27f24b9d38ca5fd6e5e9accf22c629fd808bcbafad5c1597e7ad3ff6` |
| `docs/helix-harness/L10-verification/functional-verification.md:1549–1555` (M5当時残余の履歴化と164定義行の件数) | `74d49a59e96e37bce5c40dfe3f755e768c98dba55a62f510372a763b60c60a51` | `ad2e0c53180b81c0e8c9b9b9eac636df4fa9266d85022b28e0f51c348e88c3ae` |
| `docs/helix-harness/L3-requirements/functional-requirements.md:681–681` (AC-02の7軸表現) | `190f988652ccc8e5e506e0cacc2287cdd35a7f44873b37ba364be62a4a663f32` | `545a4a93537a68f020581ba64a17360e96eec65069769033877124c221da7a65` |

Root再検収補正：21件は適用性unknown 7件とevidence scope/revision mismatch 14件に分けます。前回追補の内訳の誤記とM5の「該当軸のux_verified」表現を改め、当該scope/revisionのux_verified主張を拒否する意味に限定しました。前回追補のsnapshot hashと旧span hashはJSONの`correction_history`と`previous_supplement_after_*`に残しています。

静的確認: 21 r19 CASEが7/7/7でunique、Stage 3親039の164定義/164 unique、JSON parse、`git diff --check` は成功。fixture、旧runtime、旧CIは実行していません。L2-005/022の詳細本文監査はこの補正作業に含めていません。
