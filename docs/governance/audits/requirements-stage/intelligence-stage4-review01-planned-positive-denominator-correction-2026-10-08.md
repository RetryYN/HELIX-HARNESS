# INTELLIGENCE Stage 4 review01 planned-positive denominator correction

- 種別: 時点監査・本文修正根拠。authority effect: `none`。
- 対象: PR #2678 review01、formal comment `6044673089`（[原文](https://github.com/RetryYN/HELIX-HARNESS/pull/2678#issuecomment-6044673089)）。API本文UTF-8は6,140 bytes、SHA-256 `6e337ab76d1b2ff734bad4a2a8f2243c832f1dfcb536a03638f2cf143c09ce24`。review対象HEAD `006f2f29b3c7b3bec8b534e2149e14cee36c956d`、base `5857c0a396cb24a23d765e3079a18a2367b6d078`。
- 固定要求: `633bf12ea8f948db8ba3d6600179c4a9507377a7`。対象はHELIX-INTELLIGENCE Stage 4のL3 `nfr-grade.md` と対のL10 `nfr-verification.md` の測定定義のみ。

## 修正

review01 M1の指摘どおり、L3から「未実行・観測不能は分母へ入れない」を除き、計画されたpositive fixture/runの適用required fieldをplanned positive分母として残す定義へ合わせた。実行済みかつ観測可能で、source/revision/scope/ownerが正しく束縛されたfieldだけをcoverage分子へ入れる。未実行と観測不能は分子・成功へ入れず、状態別の件数を併記する。したがって実行できたpositive runだけで100%とはならない。L10も同じplanned positive分母、分子、状態別件数へ同期し、「全positive fixture/run」の比較候補を保持した。

positiveとnegativeの期待oracleによる分離、正しい拒否をnormal coverageの成功・失敗に算入しないこと、missing/unknown/stale/conflict/mismatchをboundや成功へ変換しないことを維持した。wrong bind件数の範囲はpositive/negativeを問わず観測されたbind誤りと明記した。NFR-INT-045-01のL10参照行へ `CASE-INT-045-02a`、`CASE-INT-045-03`、`CASE-INT-045-04a` を補い、L3および直後の境界説明と同期した。

## 045の分類経緯

旧修正履歴は書き換えずに保持する。review04 correctionのM13（2026-10-06、:26）は「direct-route 02k remains measured」とし、review05 correctionのm8（同日、:18）は04bと02kの分母包含を維持していた。review01はこの履歴を明示した上で、両CASEをnormal denominatorから外した現行分類と理由を監査へ追記するよう指摘した。

- `CASE-INT-045-02k` はtarget、owner、revisionが正しく束縛されたpositive coverage入力だけでは直接routeを捕捉しない。target既知のまま候補を経ず直接routeする誤りは、L10 FV:1280のnegative oracleに置く。
- `CASE-INT-045-04b` はtarget既知・owner unknownのまま保留しownerへ照会するnegative oracleである。これをnormal denominatorへ入れると正しい保留が100% coverage候補を下げるため、normal coverageから分離する。
- 02a、03、04aはidentity missing/unknown/unseenの境界negativeとして既存どおりnormal denominator外とし、表にも参照を列挙した。

この修正はレビュー依頼に沿った計測定義の明確化であり、固定親の意味、owner、version、100%候補、wrong-bind 0候補、既存閾値、gate、functional CASEを変更しない。新しい閾値、SLA、minimum sample、L10実行、承認を追加しない。

## 旧source起点

旧HELIX `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/nfr-grade.md` のlines 21–34, 58–81を参照した。asset `LEGACY-ASSET-DB669724249A14A665F0`、source SHA-256 `2197b4d2f4118aae83202f9f886056fd9de360f21667e25fe9c9d906f76c832d`、disposition `docs/governance/legacy-asset-disposition.jsonl:350`。特性→測定方法→受入条件の構成だけを再利用し、IPA gradeや旧閾値、runtime/CIは再利用していない。normal source-bound coverageとnegative oracleの分離は固定L2/L11、現在のL3/L10 CASE oracleから再導出した。前段の不変監査 `intelligence-stage4-nfr-measurement-definition-repair-2026-10-08.md` に記録された起点と分類を引き継ぎ、この追補ではplanned denominatorとreview04/05分類履歴を追加照合した。

## 6本文SHA-256

beforeは対象HEAD `006f2f29b3c7b3bec8b534e2149e14cee36c956d` のGit blob bytes、afterは修正後working tree bytesから再計算した。

| 本文 | before | after |
|---|---|---|
| `docs/helix-intelligence/L3-requirements/business-requirements.md` | `026d95fbf023ef384834ebd3b215a469f2fea648190d15d45494b5ea4cc91959` | `026d95fbf023ef384834ebd3b215a469f2fea648190d15d45494b5ea4cc91959` |
| `docs/helix-intelligence/L3-requirements/functional-requirements.md` | `01ceffadc184ead3c5a73e4df4f308610394590630c222a53930e4857ee71c5a` | `01ceffadc184ead3c5a73e4df4f308610394590630c222a53930e4857ee71c5a` |
| `docs/helix-intelligence/L3-requirements/nfr-grade.md` | `c6407848a70cb4dc0c85fd24055f1f0726fe890b96d4608542a135ae8ba49ed5` | `b26a93177d8857cfe9dba92a37ccf6153d1fb5cdf08e5b808e0b3d94ef8b42c1` |
| `docs/helix-intelligence/L10-verification/business-verification.md` | `b476b0939b7da50cf75db66d235095f94e591ac929ef046721224b5112d04552` | `b476b0939b7da50cf75db66d235095f94e591ac929ef046721224b5112d04552` |
| `docs/helix-intelligence/L10-verification/functional-verification.md` | `aa6cb83a2eaeeaf0d4d0fd955698e5071e27c81232ba43a1c3af94918fbccc77` | `aa6cb83a2eaeeaf0d4d0fd955698e5071e27c81232ba43a1c3af94918fbccc77` |
| `docs/helix-intelligence/L10-verification/nfr-verification.md` | `9675fe8ee19a1f3e910b8f73fa37d0e767f7df1381b3a4f6a79a43542ad91851` | `a8008b4ed973d43ff20952a496db241da1dcb438cd79056a55ae24dd30ea1e5e` |

## 検証と限界

- `git diff --check` と文書/CASE参照の静的照合を行う。runtime、test、CI、旧CLI/hookは実行しない。
- L10 fixtureは実行していない。Opus/Fableの修正後独立再照合、PO事後確認、承認状態は未確認であり、この追補はそれらを生成しない。
- review01の未確認範囲（15親すべてのnegative CASEを全件意味照合していないこと）は前段監査と同じく維持する。
