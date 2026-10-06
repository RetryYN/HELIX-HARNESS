# HELIX-LABO Stage 5 親064 作成監査候補

- 状態: `uncommitted_tmp_candidate_not_canonical`
- 対象本文commit: `8e0d03d8b61ad4b34f7a2d76486a8dc65ad68573`
- base: `286a938442f7ff9a05004478d7a25d0feedc34d8`
- Draft PR: #2632（review依頼前）
- この監査候補の作成ではcanonical文書を編集せず、commit/push/mergeもしていない。

## PO判断と固定親

PO判断は[docs/governance/decisions/po-decision-2026-09-29-57candidates.md:79](docs/governance/decisions/po-decision-2026-09-29-57candidates.md)にあり、064 / MPR-RC-HELIXLABO-L2-064-002を採択している。これはL3本文の承認や比較実行許可ではない。固定L2/L11は`0857205ecb7a18db9d8d926142e865776c1bf6e2`のL2:491–501、L11:233–239である。shaはJSONに保存した。

旧sourceのHIL-NFR-35（旧platform requirements:215）を起点に、候補名の遮蔽、比較条件の版固定、smoke/fullの区別、重大failureの平均相殺禁止を再導出した。HR-FR-HIL-22/HAC-HIL-22a/b/c、Bench R-04/R-08、HOT-HIL-54は対応consumer/関連sourceとして読んだ。旧runtime、旧test、旧CIは実行していない。

## review05所見と現本文の照合

review05はPR #2620、comment 6010745544、旧HEAD `a4a365dcdfe824ebb28d040c8bc3bc924556efad`を対象にしていた。次の原文を逐語で保存し、現本文にある処置候補を併記した。これは現本文の独立reviewでも承認でもない。

### M1 — 本文上の処置候補

原文:

````text
- **M1（064：review04 M8の残り）**：064-03bと064-26に「mapping source owner」が残っている。FRと064-14は「観測元」にそろっている。監査M8の処置は「固定親にないrouteを削除」と書いているが、本文と合わない。→守るべき行：L2-064「依存・戻し先」（元identityの追跡不能は観測元）。
````

現本文の照合候補: CASE-03b/26はmapping/sourceの未追跡を観測元へ返し、source ownerを新設しない。固定L2の「元identity追跡不能→観測元」と一致。原文の「mapping source owner」は否定文脈でのみ残る。
確認行: 3037, 3050（functional-requirements / functional-verification。case別raw/literal hashと全文literalはJSON）。

### M2 — 本文上の処置候補

原文:

````text
- **M2（064 FR AC-03：固定親が定める戻し先を、LABOの保持に置き換えた）**：FRは「可視scope条件不明はLABOで比較不能として保持し、固定親にない戻し先を追加しない」と書いている。同じ親のFV（064-06、07〜11、15、20、23、27〜32、04a）は「既存evaluation owner」のままで、FRと矛盾する。監査のM8処置も同じ誤りを記録している。→守るべき行：L2-064「依存・戻し先」（judge可視範囲・固定条件の不明は評価ownerへ）、「評価と権限」（再評価義務をtask/evaluation ownerへ）。
  - 補足：review04 M5で私が「evaluation ownerは064側の用語」と書いたのは、061から外す理由としてだった。064では「既存evaluation owner」が固定親の語である。
````

現本文の照合候補: FR AC-03は可視scope/固定条件不明を既存evaluation ownerへ、再評価義務をtask/evaluation ownerへ分ける。FV所定fixtureもevaluation ownerを示し、固定L2/L11の区分に沿う。原監査の誤記録を遡及上書きせず別時点で保持。
確認行: 1764, 1776（functional-requirements / functional-verification。case別raw/literal hashと全文literalはJSON）。

### m1 — 本文上の処置候補

原文:

````text
- **m1（表記の規定外。review04 m2の残り）**：
  - FV:3023のCASE-102/109に親IDがない。
  - 060-29「互換別名」、063-25/35「主索引」、064-16「集約索引」「互換index」が残っている。
  - 監査は「統一した」と記録している。
````

現本文の照合候補: 064 CASE-16は「索引（fixtureなし）」として記載され、review05が挙げた「集約索引」「互換index」の語は064 suffixに見当たらない。064範囲だけの照合。
確認行: 3066（functional-requirements / functional-verification。case別raw/literal hashと全文literalはJSON）。

### m5 — 本文上の処置候補

原文:

````text
- **m5（重複計上）**：新しく追加したCASEの多くが、既存の単独fixtureと同じ変異を持っている。
  - 063：54≒08、56/57≒49/50、58≒13、59≒12、61≒15、62≒16、64/65≒41/42
  - 065-45≒065-11
  - 066-43≒066-09
  - 064-38/39≒064-04a（04aは2変異の行のまま残っている）
  - NVとNGは、063の54〜62と64/65を独立したnegativeとして数えている。063-58には、063-13にある「観測提供主体へ返す」がない。
  - 補足：review04 M11が求めたのは、FRへの禁止句の追補だけだった。対応する既存CASEは、すでにAC-03をtraceしていた。
````

現本文の照合候補: CASE-04aはfixtureなし索引へ変更され、CASE-37/38/39の各異なるoracleを直接参照する。04a自身をnegativeとして数えず、旧IDを保持する。
確認行: 3040, 3073, 3074, 3075, 3077（functional-requirements / functional-verification。case別raw/literal hashと全文literalはJSON）。

### m6 — 原文と現本文の差を独立reviewへ引継ぐ

原文:

````text
- **m6（戻し先の併記漏れ）**：
  - 065-41〜44、069-31/32、070-63、066-42/43に戻し先がない。
  - 070-69は、対象fieldも特定していない。
  - 064-24/33/35/36から、evaluation ownerが削られた。064-33は「再評価義務を返す」を「当該scopeを再評価する」に変えている。
  - →守るべき行：L2-065/069/066「戻し先」、L11-064の未見例、L11-070の個別反例。
````

現本文の照合候補: 原文が求めたevaluation owner routeと、現行CASE-24/33/35/36のtask/evaluation owner再評価義務・原因別routeを併記する。固定L2/L11の条件不明・再評価の責務区分と見比べる。字句差だけで欠陥・解消を断定せず、独立reviewへ再分類を渡す。
確認行: 3048, 3069, 3071, 3072（functional-requirements / functional-verification。case別raw/literal hashと全文literalはJSON）。

### m7 — 本文上の処置候補

原文:

````text
- **m7（064：固定親にない禁止）**：FR AC-03と064-38が、qualificationの生成を禁じている。→守るべき行：L2-064「評価と権限」（禁じているのはassignmentとadmissionだけ）。
````

現本文の照合候補: FR AC-03でqualification一般の生成禁止を追加しないと明記し、CASE-38はsmoke-onlyから完全適格性をclaimする誤出力だけを検査する。
確認行: 1776, 3074（functional-requirements / functional-verification。case別raw/literal hashと全文literalはJSON）。

### m8 — 本文上の処置候補

原文:

````text
- **m8（英文の残存・表記の揺れ）**：
  - 069-29「clause」
  - 064-38/39「decision boundary」
  - 061-114「invalid state」
  - 070-73「co-present complete scorecard」（他の行では「complete co-present scorecard」）
````

現本文の照合候補: 064 CASE-39は「既存境界」とし、review05が引用した英語句 decision boundary は064 suffixに残らない。m8の他親ID/英語残余は今回対象外。
確認行: 3075（functional-requirements / functional-verification。case別raw/literal hashと全文literalはJSON）。

### m10 — 本文上の処置候補

原文:

````text
- **m10（064-04aが2つの変異を持ったまま）**：064-38/39に分割したのに、元の行が索引になっていない。→守るべき行：L2-064「評価と権限」。
````

現本文の照合候補: CASE-04aは索引となり、CASE-37/38/39を個別oracleとして列挙。多変異negative扱いをやめた。
確認行: 3040, 3077（functional-requirements / functional-verification。case別raw/literal hashと全文literalはJSON）。

### m12 — 原文と現本文の差を独立reviewへ引継ぐ

原文:

````text
- **m12（064-33の文言の変化）**：L11-064の未見例「再評価義務を既存evaluation ownerへ返す」が、「当該scopeを再評価する」になった。m6とあわせて直すこと。
````

現本文の照合候補: 現行固定064は再評価義務をtask/evaluation ownerへ引継ぐ。CASE-33もこの責務区分を記す。一方review05 rawは既存evaluation ownerと表現する。原文・現行literal・固定親を並べ、owner語句差だけで欠陥/解消を断定せず独立reviewへ渡す。
確認行: 3069, 1764（functional-requirements / functional-verification。case別raw/literal hashと全文literalはJSON）。

M6/M12は原文と現行文言の差を保存する。固定L2は、元identity追跡不能の観測元への返却、条件不明のevaluation ownerへの返却、再評価義務のtask/evaluation ownerへの引継ぎを分けている。語句差だけから欠陥・解消を決めず、修正後HEADの独立reviewへ渡す。

## 本文revisionと静的照合

現行本文commitは`8e0d03d8b61ad4b34f7a2d76486a8dc65ad68573`。6対象文書のbase prefixは286a938と一致し、全ファイル末尾にLFがある。旧a4 revisionのCASE定義42件（bullet定義を含む）と現行42定義のID集合が一致する。rootの初回table-only抽出はbullet定義2件を拾えなかったため、table/bullet双方を数える形で照合した。ID一致は意味完全性やfixture独立性の証明ではない。

| 文書 | 本文SHA-256 | base SHA-256 |
|---|---|---|
| `docs/helix-labo/L3-requirements/business-requirements.md` | `d87a7d8cd69f857311a08dd2c9f4cccfc9324b616fa21f330969affc97c243a4` | `2076362505fffdd21f0bac4d375743c5b2e22fb634999d9b0e42bcc3f8a56208` |
| `docs/helix-labo/L3-requirements/functional-requirements.md` | `8e4a09bf4112e7d62afdff5f9330e02ede29e509ac8cf9760d35d37f55de047d` | `2bef02dabb0f377d3f7cfc82854e7e26f3eee6b3d55f9e82e908c187c1fc93f1` |
| `docs/helix-labo/L3-requirements/nfr-grade.md` | `43a4000e5ec13d84166bd13f01ed4a0c4305b398e472b16971e96fe27f19ef24` | `72b46aae68bed2e5b359955b2f9cd9623d1d0bde69f9b4e42f792ee089ae7d62` |
| `docs/helix-labo/L10-verification/business-verification.md` | `a00c65684e376e067b99a961db51b16da147c7c1c51e47915ca472dc728fafb9` | `aa06437d9a26fc833a2bf15ca5d9f87df427b68fd7886499f1fb6c2f0176cec3` |
| `docs/helix-labo/L10-verification/functional-verification.md` | `35449d134850cd4fa76873619a54a520422d721aa2575158be284a435859222c` | `b6aba96d43818dd5a65b74c53700c62a5e4ee7795c2eaa73833f7322630d71f1` |
| `docs/helix-labo/L10-verification/nfr-verification.md` | `c44fca2716690432ea53a719de2a587776493bb6399e75af97127af01992dcc0` | `b8e6be1963b35ea6d90874f15e41b0b3a3cb7d7070a657be8a2b330a5e3730fb` |

## 作成経緯と読込限界

064追記は作成workerが既存FV 3,022行の全文を読み終える前に始まっていた。この経緯を記録し、遡って手順適合と認定しない。その後Root判断で、固定L2/L11、関連するL2-055/059/060/061/063/064のspan、063境界、対象suffix、6ファイルprefixのbyte一致へ検収を限定した。未読の他親本文を読了したとは主張しない。

CASE30はsource/run recordからの元identity追跡不能を観測元へ、比較scope・固定条件不明をevaluation ownerへ分け、再評価義務をtask/evaluation ownerへ引き継ぎ、個別owner identity不明をunknownに保つ。CASE36も検証不能と再評価義務を分けた。CASE07はfixture revision Fv0→Fv1だけを変えruntime revision V0を固定した。

作成側の検収は独立reviewではない。#2632のcurrent HEADに対する独立review、Opus/Fable一致、POの事後確認、比較または実装許可は未成立である。

JSON詳細: `/tmp/labo064-parent-authoring-audit-candidate-2026-10-07.json`

## Root公開時点の検収

Rootは候補MD全文を読み、125件のbody/base/source/span/旧現CASE/formal原文を照合した。govcheckとdiff check合格。旧42 IDを保持し、6suffix146行の作成側検収は独立reviewと区別する。原文m6/m12と固定親の再評価責務は併記し、字面差から新たな承認gateを作らない。

機械記録: [labo-stage5-parent064-authoring-audit-2026-10-07-8e0d03d8b.json](labo-stage5-parent064-authoring-audit-2026-10-07-8e0d03d8b.json)、SHA-256 `b81b8dc8305bae9ca7912b57bf269dd240d382c7e7f4d76af2163073e14aca8a`。
