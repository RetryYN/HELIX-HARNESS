# 274親のfinding候補に関する追補

基準: `origin/main` d8ba018d74b05846e0eb489ed608c2881c9937cd。これは既存抽出に対する後続の対象範囲・親IDの追補であり、原indexと旧監査は変更しない。

## 対象20件の後続状況

「対象限定」はmerge済み変更で確認できる対象範囲を指し、親全体の意味完了を意味しない。原statusと監査参照は同梱JSONに保持した。

| 親ID | 原status | 後続の対象範囲 / 現状態 |
|---|---|---|
| `HARNESS-L2-035` | `finding_candidate_or_followup_reported` | #2683 merge済み。planned CASEの分母からtombstone S5-033を除外。親全体の完了を示すものではない。PR: #2683 merge済み |
| `HARNESS-L2-039` | `finding_candidate_or_followup_reported` | #2679 merge済み。適用可否がunknownの場合と、証拠の対象範囲・revisionが一致しない場合を扱う限定CASE。PR: #2679 merge済み |
| `HELIXCONNECT-L2-001` | `finding_reported_and_targeted_PR_identified` | #2677 merge済み。適用識別子の正常系とnegative caseの網羅に限定。PR: #2677 merge済み |
| `HELIXINTELLIGENCE-L2-063` | `finding_candidate_or_followup_reported` | #2681 merge済み。INTELLIGENCE Stage5の親063/069における複合indexの文言と判定範囲。PR: #2681 merge済み |
| `HELIXLABO-L2-060` | `finding_reported_and_targeted_PR_identified` | #2685 merge済み。既存BR/BV traceとNFR件数の同期。PR: #2685 merge済み |
| `HELIXLABO-L2-069` | `finding_candidate_or_followup_reported` | #2691 merge済み。LABO069のNFR/index同期に限定。#2681はINTELLIGENCE親069を対象とし、このLABO対象範囲には含まれない。PR: #2691 merge済み |
| `HELIXLABO-L2-070` | `finding_candidate_or_followup_reported` | #2661と#2691がmerge済み。task/attemptごとにrate出力とtraceを分離。PR: #2661、#2691ともにmerge済み |
| `HELIXLABO-L2-071` | `finding_candidate_or_followup_reported` | #2691 merge済み。qualificationからtitleへの逆方向negative case。PR: #2691 merge済み |
| `HELIXOS-L2-014` | `finding_candidate_or_followup_reported` | 修正PRなし。R1は解釈上の残余として維持する。合成テスト設計は実deployment/cutoverの許可を意味せず、新たなPO gateや許可も推定していない。実deployment cutoverには既存の明示的許可境界が引き続き適用される。PR: なし |
| `HELIXOS-L2-023` | `finding_candidate_or_followup_reported` | #2686 merge済み。4つのbinding fieldごとのnegative caseと返却動作。PR: #2686 merge済み |
| `HELIXOS-L2-025` | `finding_reported_or_followup_open` | #2665と#2692がmerge済み。複数project/stageにまたがるtraceと、stageごとに独立した欠落CASE。PR: #2665、#2692ともにmerge済み |
| `HELIXOS-L2-028` | `finding_reported_or_followup_open` | #2688 merge済み。OS Stage2cの選択sourceとのbindingとNFRの全数把握に限定。PR: #2688 merge済み |
| `HELIXOS-L2-029` | `finding_reported_or_followup_open` | #2688 merge済み。OS Stage2cのsupport/no-consult sourceとのbindingとNFRの全数把握に限定。PR: #2688 merge済み |
| `HELIXOS-L2-033` | `finding_reported_or_followup_open` | #2690 merge済み。detectorの適用可否・宣言・選択・receiptに関する失敗。PR: #2690 merge済み |
| `HELIXOS-L2-040` | `finding_candidate_or_followup_reported` | #2682 merge済み。retry counter、failure class、episodeの判定条件を明確化。PR: #2682 merge済み |
| `HELIXSECURITY-L2-009` | `finding_reported_and_targeted_PR_identified` | #2676 merge済み。triggerごとのrecipientと未達deliveryのcoverage。PR: #2676 merge済み |
| `HELIXSECURITY-L2-010` | `finding_candidate_or_followup_reported` | 修正PRなし。元A070は監視点のみであり、具体的な誤成功は確認されておらず、新たな網羅matrix/gateを設ける根拠もない。PR: なし |
| `HELIXSECURITY-L2-012` | `finding_reported_and_targeted_PR_identified` | #2676 merge済み。対象をAgent packageと明確に表記。PR: #2676 merge済み |
| `HELIXSECURITY-L2-028` | `finding_candidate_or_followup_reported` | #2689 merge済み。SECURITY Stage1親028の検証範囲と対象artifactのbinding。この対象はOS028ではなく、元A071に確定findingはない。PR: #2689 merge済み |
| `HELIXSECURITY-L2-031` | `finding_reported_and_targeted_PR_identified` | #2674 merge済み。SECURITY Stage2cのpayload適用可否の失敗判定。PR: #2674 merge済み |

OS014のR1は、合成設計と実cutover許可を区別する未解釈の残余として維持する。合成fixture案は実環境のdeploymentを許可せず、追加gateも設けない。SECURITY010は元A070の監視点のみという結論を維持し、新たな網羅matrix/gateを作らない。SECURITY028はSECURITY Stage1親028であり、OS028とは別である。元A071に確定findingはない。

## 関連する後続対象範囲の状態更新

- `HELIXLABO-L2-063` #2694: merge済み（merge `691afef75aeab0f315c937f91a14746802542c63`）。LABO063のAC/CASE定義とNFR/trace同期。この変更はLABO要件全体の完了を意味しない。
- `HELIXOS-L2-036` #2695: merge済み（merge `553227b0e6a3d32995208ebde9b3642f00469864`）。OS036のtuple形式の返却とpolicyの根拠source境界の追補に限定。
- `HELIXLABO-L2-061` #2696: merge済み（merge `d8ba018d74b05846e0eb489ed608c2881c9937cd`）。LABO061の限定修正。Rootはformal 6047576368のcondition 1/2、formal 6047643546のcondition 3、およびmerge後確認formal 6047658257を確認した。16ファイル・親・Git treeのmerge後確認は通過。Review01でMinor 6件が未返却であり、review02のcondition 3はMajor 0／Minor 0。検証用fixtureは実行しておらず、PO事後確認も記録されていない。

## 274親のID照合

元indexの274親IDを、4機構の対象範囲159件、HARNESS/OS/SECURITY/CONNECT側で原index上unknownだった79件、残余36件に重複なく照合した。20件のfinding/candidateはこれらと重複するため、別枠で加算しない。残余36件はJSONに原statusと監査参照を親ごとに保持する。

| 区分 | 件数 |
|---|---:|
| BRAIN / INFRASTRUCTURE / INTELLIGENCE / LABOの限定監査対象 | 159 |
| 他4機構側の原index上unknown行 | 79 |
| 元finding / 親別評価の残余 | 36 |
| 和集合 | 274（一意） |
| 欠落 / 重複所属 | 0 / 0 |

## 監査参照数の訂正

旧readscope一時報告の親→監査参照数302は誤りだった。実JSONを再計数した結果は334件（親固有locator 120件 + group単位の参照214件）。source側は参照項目77件、実source snapshot 71件であり、別の単位として保持する。旧一時記録は書き換えない。

## 検証限界

この追補は274親のID対応を閉じるが、全274親を同じ深度で意味監査したものではない。個別PRは限定された対象範囲を修正した記録であり、全要件・利用側の完了を証明しない。検証用fixture、旧runtime、旧test、旧CIは実行していない。PO事後確認が記録されたとも主張しない。

## 入力の固定

- `/tmp/root-274-finding-unknown-residual-extract-2026-10-08.json` — 448258 bytes, SHA-256 `5c63b6cc7ea1dd19871a87034b63ae55e322bc4efc408b0a08e1b79b80a8bd27`
- `/tmp/root-274-finding-unknown-residual-extract-2026-10-08.md` — 13427 bytes, SHA-256 `417a6c4c4110f29a8b4b0898ad9755e23a5c7ff853f1a14b4f59bcf157f12edc`
- `/tmp/root-4mechanism-semantic-audit-scope-d629e2525.json` — 527262 bytes, SHA-256 `8f820d2ac8b3e85ca2b9e2aeb03901cd5b240de7cbbdea3fe4bc27e0bd8564b7`
- `/tmp/root-274-audit-source-parent-readscope-followup-2026-10-08.json` — 1992927 bytes, SHA-256 `e1ab7b5bf97377145e559d7020accac11b6e824fd26764359e8a7700b5a9d531`
- `/tmp/root-os014-internal-deployment-synthetic-scope-2026-10-08.json` — 1910 bytes, SHA-256 `1ce5f0f8f32f8960ee3d3fc54ead6db76a6bae8e19f5baf3dee69a7f14e035ee`
- `/tmp/root-os014-internal-deployment-synthetic-scope-2026-10-08.md` — 1751 bytes, SHA-256 `285478c4ef7790f9db546e520c544c78e078221f14a943bfdb51d8ddc9adf9af`
