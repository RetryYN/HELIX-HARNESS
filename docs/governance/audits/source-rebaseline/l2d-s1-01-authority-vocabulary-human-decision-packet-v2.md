# L2D-S1-01 authority語彙分離 人間判断packet v2（再baseline）

prepared_at: 2026-09-18
status: input_denominator_incomplete_not_decision_ready
decision_unit: L2D-S1-01
authority_effect: none
proposed_disposition: split
supersedes: `docs/governance/audits/source-rebaseline/l2d-s1-01-authority-vocabulary-human-decision-packet.md`
supersedes_sha256: `9c18c0831f57ab93dc7bec3dffcbd5ec57f396167a584e073790fa7c9641d294`（`base_repository_revision`時点のv1。本PRはv1のheaderに3行を足すため、適用後のv1のdigestはこれと異なる）
base_repository_revision: `646893e815ace111dbfa233b6cc375be9ee687d8`

## なぜ作り直したか

v1 packetの基準revisionは`edf87f61b11b8eedee106c17df26c9396875c1e7`（2026-09-17）である。その後、次の2つが成立した。

- 旧ルール群から規則atom 7,622件を回収し、管理層のsource holding `MPR-SH-LEGACY-RULE-004`として登録した（PR #1869／#1870）。
  生存中のsource holdingは13件、registerは32 revisionである。
- 回収した要求候補57本を、既存L2・既存候補・旧要求と関係付けた57 cluster（RDP-002）をmainへ入れた（PR #1872）。

v1 packetの入力分母は旧`authority-vocabulary`系列（AVS）の3文書だけであり、上の2つを計上していない。
`MPR-SH-LEGACY-RULE-004`にはauthorityの語彙・生成禁止・介入点に直接触れる規則atomがあるため、v1のまま承認すると
「判断時に生存していたholdingを落とさない」というRDP-001の無損失条件を満たさない。本v2はその分母を取り直す。

v1が計上したAVSの意味（L1 atom 6件、L3 atom 20件、L10 oracle 20件）は本v2でもすべて生存する。v1は削除せず、
本v2をsuccessorとして参照する。

**本v2の結論は「まだ人間判断へ送れない」である。** 分母を取り直した結果、生存中13 holdingのうち計上できたのは1件、
atom本文を持たず対象外にできるのは3件、全件確認して該当なしとできるのは1件で、**残る8件は未評価**である。
そのうち`MPR-SH-CANDIDATE-003`は旧AVSの3文書そのものを内包しており、AVSが独立のholdingではなかったことも判明した。
v1は「分母が古い」問題だったが、v2の作成過程で「分母がそもそも数えられていない」ことが分かった。
この8件を評価するまで、S1-01は`decision_ready`にしない。

## 判断対象revision

基準repository revisionは`646893e815ace111dbfa233b6cc375be9ee687d8`である。

| role | path | SHA-256 |
|---|---|---|
| 旧L1意味source | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/authority-vocabulary-requests.md` | `5c29cba6331dff96082f74612ceaf755fe4a30a10e75be62797e8073de7fec99` |
| 旧L3具体化source | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/authority-vocabulary-requirements.md` | `cb97e7594b38cfada7d4fedb948937bab9e9d8f3e7c7123eca82a7ce6e8f8eb4` |
| 旧L10 oracle source | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/authority-vocabulary-acceptance.md` | `0641ced495a545ca4820eec457caecb6cdf53531a112e00024e8f7c6ce6179d0` |
| 旧ルール群 規則atom台帳 | `docs/governance/legacy-rule-atom-inventory.jsonl` | `97a9e0a4cfd5999f5178ec13f758ef71c334191aac51ed43c3bb9570bd762784` |
| 旧ルール群 要求候補 | `docs/governance/candidates/legacy-rule-derived-requirements.md` | `386e4083f1a47c2d09ea75ea774772421a44b6f5dd9eaa331d6ea773cd683ffa` |
| 重複候補cluster（RDP-002） | `docs/governance/audits/source-rebaseline/legacy-rule-requirement-overlap-clusters.jsonl` | `0670391ed6ef287d0c0105064e2f99e0bc0048d5a2adc39211b8325c03658537` |
| 同領域の既存候補 | `docs/governance/candidates/requirement-engine-python-core-requirements.md` | `3516e26747ec2c97586f0b0324033144a46b3351629422c9079f59a919b74425` |
| 同領域の既存候補 | `docs/governance/candidates/ai-readable-authority-requirements.md` | `5b81d1498af275eba03ea20bbe8893a1d4180078af7da3cf1800a559b907dcc9` |
| HARNESS L2比較対象 | `docs/helix-harness/L2-requirements/product-requirements.md` | `a844c18a1c9e963093b8808bca1c70c7dce2ebd7bf1b1f00ca468a4a82700c77` |
| OS L2比較対象 | `docs/helix-os/L2-requirements/governance-requirements.md` | `78467562f0eb6270bf552a5c10880e83e3a237d3d24eae281d658e6b454909be` |
| HARNESS L11比較対象 | `docs/helix-harness/L11-acceptance/product-acceptance.md` | `11ff00b74f2b7e0286ed115ae35d62f34b9f65f72a19fb8b7265eda1b795e40b` |
| OS L11比較対象 | `docs/helix-os/L11-acceptance/governance-acceptance.md` | `db691bb55ab1079eeee70bc7cf86c61f197bf13d95455b9ad375f60fe3356a19` |

HARNESS／OSのL2・L11 4文書のSHA-256はv1と同一であり、基準revisionが動いても比較対象は変わっていない。

## 入力分母

生存中のsource holdingは13件である（registerは32 revision）。本判断に対する処分は次のとおり。
機械screenの結果と根拠は[`l2d-s1-01-input-holding-screen.jsonl`](l2d-s1-01-input-holding-screen.jsonl)
（SHA-256 `9036b6153d502888509a6a586eeaa2be37e166e4e775f64eb92a4fbae31af637`）に13行で記録した。

| holding | atom数 | screen一致 | 処分 |
|---|---:|---:|---|
| `MPR-SH-LEGACY-RULE-004` | 7,622 | 929 | **計上済み**。要求候補57本すべてに処分を付けた（下節） |
| `MPR-SH-CANDIDATE-003` | 4,755 | 622 | **一部計上・残り未評価**。旧AVS 3文書の行123件を内包する（requests 36、requirements 48、acceptance 39）。AVS由来の46 atomは計上済みだが、残る行のS1-01該当は未評価 |
| `MPR-SH-SEMANTIC-LINE-003` | 2,386 | 276 | **未評価** |
| `MPR-SH-SUPPLEMENTARY-003` | 655 | 110 | **未評価** |
| `MPR-SH-IR-003` | 153 | 60 | **未評価**。RDP-002は57要求と旧IRの関係を付けたが、S1-01の分母としての評価は未了 |
| `MPR-SH-CONFIRMED-003` | 175 | 29 | **未評価** |
| `MPR-SH-HEADING-002` | 317 | 9 | **未評価** |
| `MPR-SH-SCRUM-REVERSE-001` | 300 | 6 | **未評価** |
| `MPR-SH-WORKFLOW-003` | 108 | 5 | **未評価** |
| `MPR-SH-PREISOLATION-002` | 333 | — | **対象外**。file revisionの差分索引であり、atom本文のfieldを持たない（path、commit、blob OID、sha256のみ） |
| `MPR-SH-DELEGATED-DOC-003` | 114 | — | **対象外**。文書単位のholdingであり、atom本文のfieldを持たない |
| `MPR-SH-DELEGATED-REF-001` | 788 | — | **対象外**。文書間参照の索引であり、atom本文のfieldを持たない |
| `MPR-SH-PO-GOALS-PRINCIPLES-001` | 12 | 0 | **該当なし**。12件は全件目視できる規模であり、authority語彙の定義・生成禁止を持たないことを確認した |

**旧AVS 3文書は独立のsource holdingではない。** registerにAVSの登録は無く、AVSの行は`MPR-SH-CANDIDATE-003`に
内包されている。v1と本v2の前半がAVSをholdingと並べて書いていたのは誤りであり、ここで訂正する。

「取り込まない理由は各holdingのscopeに記録済み」とは書けない。registerのfieldは`source_collection_scope`であり、
**何を集めたか**の記述しか持たない。S1-01に取り込まない理由は、本節と上のjsonlが初めて記録するものである。

未評価8件は、[要求処分review program](../../requirement-disposition-review-program.md)が求める
「生存中の全source holdingについて無損失なatom集合へ展開する」条件を満たしていない。
S1-01を人間判断へ送る前に、この8件へ同じ処分を付ける。

## 旧ルール群holdingからの計上

### 選別の方法

規則atom 7,622件の`rule_text`に対して、次の正規表現のいずれかが一致するatomを一次screenとした。
同じ台帳digestに対して同じ結果が出る。

```
人間の(承認|判断|決定) / 人間が(承認|判断|決定) / 承認(者|なし|を要|が要|を得|前|済) / 自己承認
PO(の)?(判断|承認|決定|指示) / 指示(だけ|のみ|を理由|は|が) / directive / authority
エスカレ / escalat / 介入点 / 人間(へ|に)(質問|確認|返|戻) / 権限(の|が|を) / 許可(を要|が要|なし|scope)
provenance / 来歴 / 出典 / memory / 記憶 / 引き継ぎ / 委譲 / 委任
(から|だけで).*(承認|authority|判断)を(生成|作|導) / decision / disposition / selection
```

照合はPythonの`re.search`、**大文字小文字を区別する**、集約キーは`requirement_primary`である。
`re.IGNORECASE`を付けると936 atomになり、差分7件には`RC01-118`（`RUL-OSM-03`、settingsの`autoMemory`Enabled検査）のように
`in_scope`要求に属するものが含まれる。この7件は現在の集合に入っていない。

一次screenは929 atom、53要求である。要求候補は57本あり、**残る4本（`RUL-OSM-05`、`RUL-OSA-07`、`RUL-OSM-09`、`RUL-OPS-02`）は
screenの語に1件も一致しない**。うち`RUL-OSM-05`（破壊的な操作の既定拒否）と`RUL-OSA-07`（未分類licenseと重大な指摘を承認要求へ回す）は、
`RUL-OSM-01`が列挙する介入点「取り消せない操作」「license」「安全の緩和」の実体であり、screenの限界の実例である。
4本とも要求本文の判定で処分を付け、計上台帳は57行にした。

screenは範囲の確定ではなく候補の抽出であり、要求単位の処分は要求本文の意味で判定した。screenの結果と処分は
[`l2d-s1-01-authority-rule-atom-accounting.jsonl`](l2d-s1-01-authority-rule-atom-accounting.jsonl)
（SHA-256 `a92f2a535a9c6ed1e2e6c60874d3510aedf5f35011a1397ffac3d12a6f5ef62a`）に、対象atom IDまで含めて57行で記録した。

### 処分の内訳

| 処分 | 要求 | screen atom |
|---|---:|---:|
| `in_scope_adds`（S1-01の範囲を広げる） | 5 | 181 |
| `in_scope_partial`（一部だけ広げる） | 2 | 45 |
| `in_scope_covered_by_avs`（AVSで計上済み） | 4 | 171 |
| `route_to_other_unit`（別decision unitで扱う） | 6 | 92 |
| `screen_only_no_authority_semantics`（語が現れるだけ） | 39 | 440 |
| `not_screened_no_authority_semantics`（screen非一致かつ範囲外） | 1 | 0 |
| 合計 | 57 | 929 |

`in_scope`の7要求が持つ**primary atomは772件**であり、そのうちscreenに一致したのは226件である。
残る546件はscreenの語に一致しなかったatomであり、内容は未確認である。

さらに、**primaryが別の要求でありながら`requirement_secondary`に`in_scope`の7要求を持つatomが502件ある**。
本screenは`requirement_primary`だけで集約しており、この502件は処分を持たない。

### S1-01の範囲に追加される意味

| 要求 | atom（screen／全体） | AVSに無い意味 | RDP-002が示す既存の受け皿 |
|---|---|---|---|
| `RUL-OSM-01`（OS） | 122／277 | 人間の判断が必要な事項を**限定列挙し、その定義を所有する**こと。暫定の判断が期限と確定条件を持つこと | `HELIXOS-L2-001`／`010`はpartial_overlap、`HARNESS-L2-003`はresponsibility_split、既存候補`REQENG-HARNESS-007` |
| `RUL-OSP-04`（OS） | 10／25 | AIが介入点以外を自走すること。人間へ質問する**前に**AI側で解決できる情報が残っていないかを確かめ、質問時に判断材料を揃えること | `HELIXOS-L2-010`／`004`はpartial_overlap、既存候補`REQENG-HARNESS-007`（connection）、`REQENG-OS-002` |
| `RUL-FRM-02`（HARNESS） | 43／233 | 人間が承認する層とAIが進める層の**工程上の分担**そのもの | `HARNESS-L2-003`／`002`はpartial_overlap、既存候補`AIDOC-HARNESS-001` |
| `RUL-COR-07`（HARNESS／OS） | 6／19 | 指示の原文を**来歴付きで追記のみ**保全すること。設計判断の後継と廃止を管理すること | `HELIXOS-L2-001`／`007`、`HARNESS-L2-004`はresponsibility_split、既存候補`LAR-OS-001`／`006`、`DST-HARNESS-002` |
| `RUL-OSM-03`（OS、一部） | 45／76 | providerの記憶を混入させないこと。memoryの**期限と保持**を管理すること（正本にしない点はAVS計上済み） | `HELIXOS-L2-007`／`001`はpartial_overlap、既存候補`REQENG-OS-005` |
| `RUL-OSM-05`（OS） | 0／102 | 破壊的な操作を既定で拒否し、例外を**理由付き・一回限り**とし監査に残すこと。`RUL-OSM-01`の介入点「取り消せない操作」の実体 | `OVC-RUL-RUL-OSM-05` |
| `RUL-OSA-07`（OS、一部） | 0／40 | 未分類のlicenseと未解消の重大な指摘を**承認要求へ回す**接続（介入点「license」「安全の緩和」への送出）。安全検証の本体は範囲外 | `OVC-RUL-RUL-OSA-07` |

`RUL-OSM-05`と`RUL-OSA-07`はscreen一致0件であり、要求本文の判定だけで計上している。

`RUL-OSM-01`の旧atomには、`RA-104`（認証・認可・決済・PII・secrets・license・本番基盤・破壊的操作・外部API前提の変更前にescalateする）
のように介入点を具体で列挙するものがある。v1のAVS-BR-001/003/004は「directiveに実行意図・対象・許可scopeが要る」までで、
**何が人間の判断を要するかの列挙を誰が所有するか**を持たない。ここが最大の差分である。

### 別decision unitへ送るもの

| 要求 | screen atom | 送り先の性格 | S1-01との接続 |
|---|---|---|---|
| `RUL-OSA-01` | 15 | 検収（作成と検証の分離、自己承認の禁止、別model系統での審査） | AVS-AC-012（片側runtimeだけでauthority分類規則を変更しない） |
| `RUL-OSA-04` | 8 | 統合・CI（統合の許可、自動mergeの禁止） | 承認の束縛条件（AVS-AC-006） |
| `RUL-REL-01` | 7 | リリース（環境ごとの承認者、自己承認の禁止） | 同上 |
| `RUL-OSP-02` | 17 | 推進（model割当、上位modelの使用許可） | AVS-AC-012 |
| `RUL-OSP-03` | 45 | 推進（委譲の必須markerと起動の許可） | AVS-BR-001（許可scope） |
| `RUL-OPS-02` | 0 | 体制・運用（参加者の受入れと権限付与、退場時の失効） | 人のaccess権限であり判断authorityの語彙ではない |

送り先を持たせたうえで送るのであって、不採用にしない。送り先のdecision unitは、`l2-source-adoption-sequence.md`の
S2以降の該当unitで確定する。

### AVSで計上済みのもの

| 要求 | AVSで計上済みの意味 | S1-01の範囲外に残る部分と行き先 |
|---|---|---|
| `RUL-COR-01` | 正本の単一性、会話・projection・生成物を第二の正本にしない（AVS-BR-005、AVS-AC-004／010） | 「作業者は状態DBへ直接書かない」。v1が「schemaとDB identityはL3で再導出」として繰り延べた領域で扱う |
| `RUL-COR-02` | 判断を対象revisionとdigestへ束縛し、対象が変わったらstaleにする（AVS-AC-006） | 「digestの計算方法を版で固定する」。L3の実現方式で扱う |
| `RUL-OSM-07` | 旧の識別子・旧の成果を現行の根拠へ再昇格させない（AVS-AC-014／016、旧`po_directive`の扱い） | 「旧の参照を0にしてから退出する」退役管理。旧資産退役系unit（`LAR-OS-*`）で扱う |
| `RUL-OSM-08` | GitHubの状態から要求や承認を作らない（AVS-AC-004） | 「Issue／PR／templateの形式とownerの単一性」。GitHub projection系unitで扱う |

S1-01の範囲は広がらないが、旧ルール群側のatomがAVS側のどのatomに対応するかは、L2適用PRで対応表にする。

## 未評価のまま残すもの

本v2は、`MPR-SH-LEGACY-RULE-004`に対する要求単位の処分までである。次はすべて`unassessed`であり、
S1-01を人間判断へ送る前に解消する。

**分母**

1. 生存中holdingのうち8件（`MPR-SH-CANDIDATE-003`の残り、`SEMANTIC-LINE-003`、`SUPPLEMENTARY-003`、`IR-003`、
   `CONFIRMED-003`、`HEADING-002`、`SCRUM-REVERSE-001`、`WORKFLOW-003`）のS1-01該当。
2. `MPR-SH-LEGACY-RULE-004`の`source_collection_scope`が自ら記すとおり、7,622件は**発見済みの規則atomであり
   旧HELIXの全規則ではない**。三巡目で増える可能性が残る。母集合そのものが非網羅である。

**規則holding内部**

3. `in_scope`7要求のprimary atom 772件のうち、screenに一致しなかった546件の内容。
4. primaryが別でsecondaryに`in_scope`7要求を持つatom 502件の処分。本screenは`requirement_primary`だけで集約している。
5. 一次screenに掛からなかった6,693 atomのうち、authorityの意味を持つものが無いことの確認。
   screenは語に依存するため、語を使わずに同じ意味を述べたatomを取りこぼす。`RUL-OSM-05`と`RUL-OSA-07`が実例である。
6. `re.IGNORECASE`で増える7 atom（`RC01-118`ほか）を集合に入れるかどうか。
7. `screen_only`とした39要求、`not_screened`とした1要求について、個々のatom本文を1件ずつ見た確認。
   現在の根拠は要求本文の意味であり、atom単位ではない。
8. 各要求の`common_atoms`、`distinct_atoms_by_source`、`acceptance_differences`、`consumer_differences`、
   `unaccounted_atom_refs`（RDP-002 clusterの未評価fieldと同じ）。

**対応表の相手側**

9. RDP-002の`OVC-RUL-RUL-FRM-02`は、`AVS-BR-001`との関係を`unresolved`（「参照ID AVS-BR-001は比較対象の台帳に存在しない。
   判定側の誤参照」）と記録している。`RUL-FRM-02`は本v2で`in_scope_adds`に置いたため、L2適用PRの対応表は
   この未解決を先に片づける必要がある。

L2／L11適用PRの合格条件は、旧AVSの46 atomと、`in_scope`7要求に属する**772 atom**（screen一致226件だけではない）
について対応表を作り、未対応0とすることである。本packetの承認は、この対応表の完成を意味しない。

## v1から変わらない部分

v1の次の節は本v2でもそのまま生存する。内容は複製せず、v1を参照する。

- 「親と接続案」（HARNESS／OSのL2・L11 target）
- 「旧L1 atomの無損失対応」（AVS-BR-001〜006の6件）
- 「旧L3 atomの無損失対応」（AVS-R-01〜16の20件）
- 「L11 negative oracleの保持」（AVS-AC-001〜016の20件）
- 「変更・棄却する旧拘束」

判断者はv1を開かないとAVS 46 atomの本文を読めない。v1は`status: superseded_by_v2`であるため、
v1を開くときは本v2が現行の判断材料であることを前提に、当該5節だけを読む。v1の「人間判断」節は選択しない。

本v2は、これらに旧ルール群holdingからの計上を足すものであり、v1の計上を減らさない。

## 判断後にも残る未決

v1の未決（exact enum、schema、record形式、DB要否、adapter、CLI表示、prompt、rule marker、doctor検査、
memoryのTTLとLearning admission、workflow signalのexact token、compatibility adapterの要否）はそのまま残る。
本v2で加わる未決は次のとおり。

- `RUL-OSM-01`が所有する介入点の**具体の列挙**を、L2で確定するか、L3の運転規則へ降ろすか。
- 既存候補`REQENG-HARNESS-007`、`REQENG-OS-002`／`005`、`AIDOC-HARNESS-001`／`OS-002`と本decision unitの統合・分離。
  RDP-002は関係を付けただけで、統合の可否は判断していない。
- `route_to_other_unit`の5要求について、送り先unitの確定。

## 人間判断

**本v2は、この時点では人間判断へ送れない。** 「未評価のまま残すもの」の分母2項目（生存中holding 8件の未評価、
母集合の非網羅）が解消していないため、AVSの46 atomと旧ルール群の772 atomを落とさないという主張が、分母側で
成立していない。

送れる状態にするために必要な作業は次のとおりで、いずれも別PRで行う。

1. 未評価8 holdingへ、本v2と同じ形式の処分を付ける（`l2d-s1-01-input-holding-screen.jsonl`を更新する）。
2. `in_scope`7要求のprimary atom 772件と、secondaryで流入する502件を、atom単位で処分する。
3. `OVC-RUL-RUL-FRM-02`の`AVS-BR-001` `unresolved`を解消する。

そのうえで問う判断は、v1から変えていない。AVSの全46 atomと旧ルール群`in_scope`7要求の意味を落とさず、
HARNESSの規範責務とOSの記録・執行責務へ`split`する方針の可否である。

- `approve_split`: 上記責務分割と処分を採用し、L2／L11適用PRの作成へ進む。**上の1〜3が終わるまで選べない。**
- `changes_requested`: 変更するatom、要求、target、境界、理由を指定し、本packetを改訂する。
- `defer`: sourceを生存中仮登録のまま保持し、後続採否を進めない。
- `reject`: 不採用にするatomとその影響を明示した別decisionを要求する。黙って削除しない。

判断recordにはdecision unit、選択、actor、判断時刻、本packetのcommit SHA、本packet SHA-256、判断対象revision表12文書の
SHA-256、計上台帳と holding screen のSHA-256を記録する。判断前は`authority_effect: none`を維持する。

本packetは要求の採否、承認、完了、旧資産のretireを生成しない。
