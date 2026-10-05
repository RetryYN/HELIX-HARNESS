# SECURITY Stage 4 review02 修正記録

対象5親（021/022/023/024/026）のMajor 1件・Minor 11件を修正した作成側記録です。固定親、PO判断、採択register行、metadata successor、旧sourceを照合しました。上流意味・owner・版・追加gateは変更していません。

- 修正前本文: `8f54b94d2e9425b5b26b2e274e3f196b437ef1c1`
- 修正後本文commit: `280b5685dfbe62935b0b3580ff87c9d946e61fa8`
- 正式review: `/tmp/pr2610-review02-full.md` SHA-256 `c1f4dc94697842fc8c32d60c7034061cfec75894d2a5d166b5d7b89f9cbfd0d4`
- 固定L2/L11/PO/register/Concept/旧source: JSONの `source_pins` にphysical line、full-file SHA-256、LF-inclusive raw span SHA-256、原文を記録。
- 6正本: prefix byte保持と現行全文/suffix SHAをJSONに記録。本文は4文書に差分があり、BR/BVは未変更。
- fixture: 対象親CASE 67件。新設CASEは022-19、023-12、023-13。022のdeny/constrain上書きと023 HARNESS/OS receipt identity差を独立化。

## 指摘対応

- **M1 (Major)** — PO採択021-002 row92をcurrent pinとして追加し、旧row83/-001は旧誤pinの履歴に限定。固定親・監査の意味根拠を一致。
- **m1 (Minor)** — 021-003 row749、022-002 row743、023-002 row744の現metadata successorを、採択rowと同一semantic digestとして本文へ明記。
- **m2 (Minor)** — 022 deny/constrain allow上書きを独立CASEへ分離。023 HARNESS receipt identityとOS receipt identityを別CASEへ分離。
- **m3 (Minor)** — 023-09 fixtureでWorker/HARNESS/OS evidenceを未実行と明示し、unknownからのsuccess代替を拒否。
- **m4 (Minor)** — 021 trust policy戻し先をSECURITY L1-001/002へ固定。consumerは受領先に限定し戻し先から外した。
- **m5 (Minor)** — 023 FR/ACへcapability delta入力を追加し、独立欠落CASE-023-13を作成。
- **m6 (Minor)** — 021/022 NFR候補とNVへdeny/unknown/revoke/expiry未伝播・operation継続候補を追加。
- **m7 (Minor)** — 024のFRと各CASE戻し先をpolicy意味=SECURITY L1、resource/実適用=INFRASTRUCTURE L1/L2に統一。OS work stateは混入対象であり戻し先ではない。
- **m8 (Minor)** — 026 AC/CASEで欠落・混同inputは受理せずunknown/restrictを保持しINTELLIGENCE意味責務へ戻す結果へ統一。
- **m9 (Minor)** — 旧CAPの引用spanにline61を追加。line61 raw pinを新監査へ含めた。
- **m10 (Minor)** — 026 PO pinへline70を追加し、1.0 Guard/Bot境界と1.x semantic能力の意味を記録。
- **m11 (Minor)** — 024/026 FRからConcept責務を参照し、固定L2のowner境界を対応付け。

旧監査4件は元bytesを保持しSHAを照合した。旧CAP line61を含めて引用範囲を記録し、PO採択021-002 row92と022/023のmetadata-only successor行のsemantic digestをregister原文で再確認した。

静的確認は `git diff --check`、`scaffold/tools/scfctl.py validate`（147件、fail 0）、`scaffold/governance/tools/govcheck.py`（7622 atoms / 57 requirements / 58 files）。旧runtime、fixture実行、旧test/CI/Bunは実行していない。

これは作成側の補正記録であり、rootの最終検収および正式な独立reviewは未完了。
