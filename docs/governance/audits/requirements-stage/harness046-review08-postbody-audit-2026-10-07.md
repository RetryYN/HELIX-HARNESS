# HARNESS-046 review08 M1 postbody提案監査

状態: `/tmp`限定の提案後状態監査。対象はPR #2643 HEAD `c09c038db2240d31cb3e239e29226c9905515b8e` / base `03d9cd19dfb92dc7dda74c8cb50f85dc320c873c`。ここにあるafter SHAは差分から計算した投影値で、まだGit上の実HEAD本文ではない。
候補JSON `/tmp/harness046-review08-M1-correction-candidate-2026-10-07-v2.json` SHA-256 `18b276737b933fd8db987c297b45f8725f58a09c884d15bc84de05b7042d3b85` (779577 bytes)。正式review08 comment 6027594743 API objectは8648 bytes / SHA-256 `2c6adc95a0d6fd05cd0439fc2b71b9921d4fbe102ad26a5f46119a6e8a8de90f`、comment bodyは6976 UTF-8 bytes / SHA-256 `26ce68cdbdcd91e5eaa7f7e504731b3aff349952eb4d738ded90f80e8b7fb2e7`。

## 文書状態

| 文書 | path | actual current SHA | proposed after SHA | actual/proposed bytes | unchanged suffix / new suffix SHA |
|---|---|---|---|---:|---|
| business-requirements.md | `docs/helix-harness/L3-requirements/business-requirements.md` | `2f67c70006de9d053ec931d6256075edd4f9311b83ef6d2263b38256568fc3fc` | `2f67c70006de9d053ec931d6256075edd4f9311b83ef6d2263b38256568fc3fc` | 17244 / 17244 | `c8c4cd12e80b1e739f403df5ba844a543d20e6f183297712d27db6e680973c4c` / `c8c4cd12e80b1e739f403df5ba844a543d20e6f183297712d27db6e680973c4c` |
| functional-requirements.md | `docs/helix-harness/L3-requirements/functional-requirements.md` | `354331f0bcc518d89a0948ab0749a7b1b61b4c14fb8fdfe10cd5b38e24357942` | `a5a67f09d7d23ab6dc06450bd7b697a21af86d1e01c2a69df7e023ba2ce8f42f` | 232041 / 232742 | `10145d876aa4e21b1665a6a5cbb8c4fbe3fe1e083c0f7425501376798300724a` / `a6e31ea2ab75230f3f53e0170bcd9399b4cf56abdbca0649839629c36345995c` |
| nfr-grade.md | `docs/helix-harness/L3-requirements/nfr-grade.md` | `9a27747e561043e60434fcbc284a9d7f91585b5d600466a4cb3b07e525560b30` | `9a27747e561043e60434fcbc284a9d7f91585b5d600466a4cb3b07e525560b30` | 47923 / 47923 | `6902a025d6a8025590a2a33ff7ff6d18600058d412d1586e4f11e56a9b920778` / `6902a025d6a8025590a2a33ff7ff6d18600058d412d1586e4f11e56a9b920778` |
| business-verification.md | `docs/helix-harness/L10-verification/business-verification.md` | `61ea5c05c492ece600ff4a5a92e5291a22e9ef4db61169cf78bd32b051ef5bed` | `c3dcfa80213ffc3379a5a5376c5994130ddab40f4c093c153b6c801d413614b2` | 13292 / 13544 | `e2f2eaecfc1a5ea77b8b0cbeea4250881e3a922d4a87bef8111d04941a056815` / `49b828cca07f87c0f3e7f4c110843246c327769bc3d3c410ff5c37417dea0123` |
| functional-verification.md | `docs/helix-harness/L10-verification/functional-verification.md` | `003e4fbcbecfa9857b67606122fd36793475e79f6fe0e21ec6abdcaff6770d56` | `7367cd64d247012cb9c566670eec13fce537264cd749a0c47aa62e415f847b5e` | 807390 / 808583 | `9ccda36daddef6af11e04664fc641e6b971c63955f630dc3c3356325ed823b9a` / `47c73b15e1dd8968881720865d15702a60afe7bc7578f79f36e3d34a8da00c09` |
| nfr-verification.md | `docs/helix-harness/L10-verification/nfr-verification.md` | `1f58baf2ac2361776c46854b0e1687a5738d0753b6ef4cd06ae2a6fd3bfddac0` | `1f58baf2ac2361776c46854b0e1687a5738d0753b6ef4cd06ae2a6fd3bfddac0` | 41766 / 41766 | `d9959ab136d56f731c3cb2d6b2a1c6e112becb0cec9111b85fa5dab87c7a4d31` / `d9959ab136d56f731c3cb2d6b2a1c6e112becb0cec9111b85fa5dab87c7a4d31` |

実HEAD時点の6本文は全てbase03d9 prefix一致。提案変更はFR、BV、FVの3本文だけで、他3本文不変。FV direct first-cell CASE定義は現80→提案81、ID重複なし。

## 変更内容

- FR-02/AC-02とbusiness/functionalのprofile B正常oracleで、SR4 receipt identity、target scope/revision、source evidence値が同一scope/revisionの既存sourceと一致することを明記する。
- FR-04/AC-04の既存10 authority出力列挙は保持し、SR4 receipt生成・置換禁止を別の証拠境界として追加する。
- CASE `CASE-HARNESS-L10-046-r15-refuse-sr4-receipt-generation`を1件追加。profile B、正常な権威source receiptをbaselineとして固定し、候補自身のSR4 receipt出力fieldだけを生成/置換させる。出力を拒否し、release-readyとせず、004/022の既存責務区分へ無条件に証拠再照合を戻す。source不備への転嫁はしない。
- 旧CASE48 raw literal群、旧時点25 source-pin履歴（既存source packetへhash固定）、formal01–08のraw comment 17件とR1–37/X2、旧X1別履歴を保持した。review08 formalはL2:1031と記すが、固定318ec4a実blobではL2:1031はFull V、SR4 release-ready条件はL2:1032である。候補はL2:1032を引用する。固定L2/L11実pinと旧v1.3 §4.4 L259 / entity model §26–37 pinはJSONに含む。
- Fableは「承認してよい」としR30残余を支持。Opusは不支持でR30をM1へ確定した。両者不一致のため条件1/2は不成立。承認追補は起草していない。

## 検証範囲と限界

- 正本を編集していない。hash・base prefix・CASE first-cell definition countは静的に照合した。fixture実行、独立review、承認はない。
- X1は旧監査のimmutable記録、X2はreview08 formal原文の別finding。位置が同じでも同一記録として扱わない。

提案監査JSON `/tmp/harness046-review08-postbody-proposal-audit-2026-10-07-v3.json` SHA-256 `91312cb8cfdb212aa8099c364cecb1f1e00329f24b41534ba2a50d0b97048e7b` (1174939 bytes)。


候補原文bundleを監査JSON内にUTF-8 raw JSON textとして埋め込んだ。完全な17 comment / CASE48 literal / 旧pin packet / 7 exact replacementは`candidate_source_bundle.raw_json_text`から再現できる。
