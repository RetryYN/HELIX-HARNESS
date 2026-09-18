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
全件確認して該当なしとできるのは1件で、**残る11件は未評価**である。
そのうち`MPR-SH-CANDIDATE-003`は旧AVSの3文書そのものを内包しており、AVSが独立のholdingではなかったことも判明した。
v1は「分母が古い」問題だったが、v2の作成過程で「分母がそもそも数えられていない」ことが分かった。
この11件を評価するまで、S1-01は`decision_ready`にしない。

**さらに、評価済みとした57要求の側にも誤りがあった。** 2026-09-19の第2独立review（GPT-5.6-Sol）が、
`screen_only`とした`RUL-COR-08`・`RUL-OSA-03`にauthority語彙の意味があること、
`in_scope_covered_by_avs`とした`RUL-COR-01`・`RUL-COR-02`・`RUL-OSM-08`はAVS原文が一部しか被覆していないことを
指摘した。いずれもAVS原文とatom本文で確認し、処分を改めた。その結果`in_scope`は7要求772 atomから
**13要求1,799 atom**へ増えた（`RUL-OSM-07`を含む。後述のとおりAVS被覆の断定もやめた）。screenの語に依存する選別と、要求単位の一人判定の両方に取りこぼしがあることの実例である。

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
（SHA-256 `e54824545dc5aca9844ca86dcae30f396dba8b6f06504344a1ea13f385ad87fa`）に13行で記録した。各行は正本台帳の`source_atom_set_sha256`を持ち、この件数がどのrevisionの台帳から出たかを固定する。
atom展開が未了の3件はscreenを実行できないため、台帳の`screened_matches: 0`は「一致なし」ではなく未実行を意味する。

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
| `MPR-SH-PREISOLATION-002` | 333 | — | **未評価（atom展開未了）**。333行すべてが`revision_relation: changed_before_archive_pending_semantic_equivalence_review`、`meaning_change_applied: false`であり、台帳自身が意味等価reviewの未了を申告している。atom本文のfieldを持たずscreenを実行できない。対象pathに`docs/plans/PLAN-L3-82-authority-vocabulary-separation.md`を含む |
| `MPR-SH-DELEGATED-DOC-003` | 114 | — | **未評価（atom展開未了）**。114行すべてが`carry_status: preserved_pending_atomization`、`holding_granularity: file_blob`。`source_path`または`archive_path`にauthorityを含む文書が7件 |
| `MPR-SH-DELEGATED-REF-001` | 788 | — | **未評価（atom展開・分類未了）**。614行が`preserved_pending_atomization`、174行が`preserved_pending_classification`。`target_path`にauthorityを含むedgeが26行（いずれかのfieldにauthorityを含む行は96行） |
| `MPR-SH-PO-GOALS-PRINCIPLES-001` | 12 | 0 | **該当なし**。12件は全件目視できる規模であり、authority語彙の定義・生成禁止を持たないことを確認した |

**S1-01のsource自身の来歴が未reviewのまま残っている。** `MPR-SH-PREISOLATION-002`が保持する
`docs/plans/PLAN-L3-82-authority-vocabulary-separation.md`は、AVS候補のfrontmatter`plan:`が指す当のPLANである。
archive隔離前にblobが変更されており、意味等価reviewは未了である。S1-01の判断材料そのものの来歴であるため、
未評価11件のうち優先して処分する。

**旧AVS 3文書は独立のsource holdingではない。** registerにAVSの登録は無く、AVSの行は`MPR-SH-CANDIDATE-003`に
内包されている。v1と本v2の前半がAVSをholdingと並べて書いていたのは誤りであり、ここで訂正する。

「取り込まない理由は各holdingのscopeに記録済み」とは書けない。registerのfieldは`source_collection_scope`であり、
**何を集めたか**の記述しか持たない。S1-01に取り込まない理由は、本節と上のjsonlが初めて記録するものである。

未評価11件は、[要求処分review program](../../requirement-disposition-review-program.md)が求める
「生存中の全source holdingについて無損失なatom集合へ展開する」条件を満たしていない。
S1-01を人間判断へ送る前に、この11件へ同じ処分を付ける。

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
（SHA-256 `684dc3f95b2f5188b375f1c7db8acb8546e8934e002c1bcbe8286ce465d2806b`）に、対象atom IDまで含めて57行で記録した。

### 処分の内訳

| 処分 | 要求 | screen atom |
|---|---:|---:|
| `in_scope`（S1-01の範囲に入る） | 13 | 415 |
| `route_to_other_unit`（別decision unitで扱う） | 6 | 92 |
| `out_of_scope_requirement_holds_linked_atoms`（範囲外だが、台帳がin_scopeへlinkするatomを抱える） | 35 | 416 |
| `out_of_scope_requirement_no_linked_atoms`（範囲外で、linkするatomも無い） | 3 | 6 |
| 合計 | 57 | 929 |

**`in_scope`をAVSの被覆範囲で`adds`と`partial`に分ける区別は置かない。** その判定は、AVS 46 atomと
旧ルール群atomの対応表（本packetが未評価として L2適用PRの条件に送っているもの）そのものだからである。
対応表を作る前にこの区別を断定すると、判定が読む人ごとに動く。実際、本PRのreviewでは同じ要求について
`adds`と`partial`の判定が3回入れ替わった。各要求の`avs_coverage_assessment`は`unassessed`とし、
対応表で確定する。`avs_coverage_assessment`は、`in_scope` 13件が`unassessed`、S1-01へ意味を取らない
`route_to_other_unit` 6件と範囲外38件が`not_applicable`である。

同じ理由で、`RUL-OSM-07`を`in_scope_covered_by_avs`（全部被覆済み）としていたのもやめた。
全部被覆されているという断定も、一部被覆と同じく対応表を要する。`in_scope`へ移し、対応表の対象に含めた。
これにより`in_scope`は13要求1,799 atomになる。

要求本文のうちS1-01が取らない部分は、AVSの被覆と無関係に「S1-01の範囲外に残る部分と行き先」列に書く。

`in_scope`の13要求が持つ**primary atomは1,799件**であり、そのうちscreenに一致したのは415件である。
残る1,384件はscreenの語に一致しなかったatomであり、内容は未確認である。

さらに、primaryが別の要求でありながら`requirement_secondary`に`in_scope`13要求を持つatomが**964件**ある
（linkは1,009本。1 atomが複数のin_scope要求へlinkする場合があるため、atom数とlink数は一致しない）。
本screenは`requirement_primary`だけで集約しており、この964件は処分を持たない。
計上台帳の`secondary_links_from_other_primary`は、各要求へ入るlink数（合計1,009）である。

**この964件は41要求に分散している。** そのため、`in_scope`に取らなかった要求を
「authority語彙の意味を持たない」と一括で呼ぶことはできない。要求本文がS1-01の意味を定義していなくても、
その要求のatomが台帳自身によってS1-01の`in_scope`要求へlinkされている場合があるからである。
計上台帳では、この区別を`in_scope_linked_atoms`（各要求のprimary atomのうち、**primaryがin_scope外**でありながら`requirement_secondary`でin_scope要求へlinkしているatomの件数。in_scope要求自身は定義上0になる。primaryもsecondaryもin_scope内というatomは449件あり、これは1,799件に既に含まれる）と、
処分`out_of_scope_requirement_holds_linked_atoms`／`out_of_scope_requirement_no_linked_atoms`で記録した。
linkを抱える要求は35件、抱えない要求は3件である（`route_to_other_unit`の6件も`in_scope_linked_atoms`を持つ）。

実例として、第2独立reviewが指摘した`RUL-OSP-01`の`RB04-160`（人間は作る内容・動作確認・リリースを判断する）、
`RUL-TKT-03`の`RB04-053`（保留findingのcarryにPM承認を要する）、`RUL-TKT-01`の`RB06-278`（archived遷移に人間承認を要する）、
`RUL-FRM-09`の`RB07-122`（PO承認なしに特定の依存参照を使わない）、`RUL-OSI-03`の`RB04-157`（運用ルール変更にTL・QA承認を要する）は、
いずれもこの964件の内訳である。`RB04-053`、`RB06-278`、`RB07-122`、`RB04-157`は`requirement_secondary`に`RUL-OSM-01`を持ち、
`RB04-160`は`RUL-FRM-02`と`RUL-REL-01`を持つ（`RUL-FRM-02`が`in_scope`であるためlinkとして算入される）。

### S1-01の範囲に追加される意味

| 要求 | atom（screen／全体） | AVSに無い意味（S1-01が取る部分） | S1-01の範囲外に残る部分と行き先 | 処分 |
|---|---|---|---|---|
| `RUL-OSM-01`（OS） | 122／277 | 人間の判断が必要な事項を**限定列挙し、その定義を所有する**こと。暫定の判断が期限と確定条件を持つこと | — | in_scope |
| `RUL-OSP-04`（OS） | 10／25 | AIが介入点以外を自走すること。人間へ質問する**前に**AI側で解決できないかを確かめ、質問時に判断材料を揃えること | — | in_scope |
| `RUL-FRM-02`（HARNESS） | 43／233 | 人間が承認する層とAIが進める層の**工程上の分担** | 工程の開始・凍結・差戻し・再開・完了の条件。工程の枠系unit（`RUL-FRM-01`の送り先）で扱う | in_scope |
| `RUL-COR-07`（HARNESS／OS） | 6／19 | 指示の原文を**来歴付きで追記のみ**保全すること。設計判断の後継と廃止を管理すること | 成果物と判断への恒久識別子の付与と、改名・移動・分割・統合をしても義務と意味と履歴を保存すること。識別子とtraceability系unitで扱う | in_scope |
| `RUL-OSM-05`（OS） | 0／102 | 破壊的な操作を既定で拒否し、例外を**理由付き・一回限り**とし監査に残すこと。`RUL-OSM-01`の介入点「取り消せない操作」の実体 | — | in_scope |
| `RUL-OSM-03`（OS） | 45／76 | providerの記憶を混入させないこと。memoryの**期限と保持**を管理すること | memoryと引き継ぎを正本にしない点はAVS-BR-005／AVS-AC-010／011／015が被覆すると見ている（確定は対応表による）。「使う前に正本・履歴・診断と照合する」ことは`RUL-COR-01`の一般形が持つ | in_scope |
| `RUL-OSA-07`（OS） | 0／40 | 未分類のlicenseと未解消の重大な指摘を**承認要求へ回す**接続。AVSに同じ意味は無い | 「結果と証拠を対象revisionへ結ぶ」ことは`RUL-COR-02`の一般形が持つ。脅威modelの確認、脆弱性の審査、依存と供給網の検査の本体は安全・検収系unitで扱う | in_scope |
| `RUL-COR-08`（HARNESS／OS） | 11／45 | **正規の検証経路を、別の手軽な手段で代替しない**こと。AVS-AC-003は「指示だけを理由に検証を省略しない」までの隣接領域であり、手軽な手段による代替はAVSに無い | 要約・表示・引き継ぎの意味保存の本体。意味保存・提示の一貫性系unitで扱う（送り先は`l2-source-adoption-sequence.md`のS2以降で確定する） | in_scope |
| `RUL-OSA-03`（OS） | 7／35 | 指摘の**処分**（current fixで閉じるか後続へ分けるか）。AVS-BR-003の`disposition` identityに具体の意味を与える。審査のstale化は`RUL-COR-02`が一般形で持つため、そちらを参照する | blockerの一括返却と再判定の一巡規則。検収系unit（`RUL-OSA-01`の送り先）で扱う | in_scope |
| `RUL-COR-01`（HARNESS／OS） | 55／166 | **DB・projection・生成物**の全般を第二の正本にしないこと。「作業者は状態DBへ直接書かない」こと | memoryとIssue commentを正本にしない部分はAVS-BR-005／AVS-AC-004／010が、「会話を第二の正本にしない」ことはAVS-BR-001が被覆すると見ている（確定はいずれも対応表による）。DB schemaとidentityの実現方式はL3で再導出する（v1が繰り延べた領域。本要求が取るのは「直接書かない」という規律であり、schemaの決定ではない） | in_scope |
| `RUL-COR-02`（HARNESS／OS） | 66／438 | **成果物と判断の全般**をrevisionとdigestへ束縛し、対象が変わったらstaleにすること。AVS-AC-006が束縛するのは`approval`だけである | digestの計算方法の版固定。L3の実現方式で扱う | in_scope |
| `RUL-OSM-07`（OS） | 42／259 | 旧の識別子・旧の成果を**現行の根拠へ再昇格させない**こと。AVS-R-14／AVS-AC-014および旧`po_directive`の扱いと重なるが、被覆の程度は対応表で確定する | 「旧の参照を0にしてから退出する」退役管理。旧資産退役系unit（`LAR-OS-*`）で扱う | in_scope |
| `RUL-OSM-08`（OS） | 8／84 | **GitHubの状態一般**から要求や承認を作らないこと（Project Statusからの逆書込み禁止 atom`RB0-104`を含む）。AVS-AC-004はIssue commentとmemoryだけの`decision`拒否である | Issue／PR／templateの形式とownerの単一性。GitHub projection系unitで扱う | in_scope |

`RUL-OSM-05`、`RUL-OSA-07`、`RUL-COR-08`、`RUL-OSA-03`はscreen一致0件または少数であり、要求本文の判定で計上している。
各要求についてAVSがどこまで被覆しているかは`unassessed`である（上記のとおり対応表で確定する）。
`RUL-COR-08`と`RUL-OSA-03`は2026-09-19の第2独立reviewで、`RUL-COR-01`・`RUL-COR-02`・`RUL-OSM-08`は
同reviewの指摘により`in_scope_covered_by_avs`から変更した。`RUL-OSM-07`も後に同じ理由で`in_scope`へ移した。

`RUL-OSM-01`の旧atomには、`RA-104`（認証・認可・決済・PII・secrets・license・本番基盤・破壊的操作・外部API前提の変更前に
escalateする）のように介入点を具体で列挙するものがある。v1のAVS-BR-001/003/004は「directiveに実行意図・対象・許可scopeが要る」
までで、**何が人間の判断を要するかの列挙を誰が所有するか**を持たない。ここが最大の差分である。

### 別decision unitへ送るもの

| 要求 | screen atom | 送り先の性格 | S1-01との接続 |
|---|---:|---|---|
| `RUL-OSA-01` | 15 | 検収（作成と検証の分離、自己承認の禁止、別model系統での審査） | AVS-AC-012 |
| `RUL-OSA-04` | 8 | 統合・CI（統合の許可、自動mergeの禁止） | 承認の束縛条件（AVS-AC-006） |
| `RUL-REL-01` | 7 | リリース（環境ごとの承認者、自己承認の禁止） | 同上 |
| `RUL-OSP-02` | 17 | 推進（model割当、上位modelの使用許可） | AVS-AC-012 |
| `RUL-OSP-03` | 45 | 推進（委譲の必須markerと起動の許可） | AVS-BR-001（許可scope） |
| `RUL-OPS-02` | 0 | 体制・運用（参加者の受入れと権限付与、退場時の失効） | 人のaccess権限であり判断authorityの語彙ではない |

送り先を持たせたうえで送るのであって、不採用にしない。送り先のdecision unitは、`l2-source-adoption-sequence.md`の
S2以降の該当unitで確定する。

## 未評価のまま残すもの

本v2は、`MPR-SH-LEGACY-RULE-004`に対する要求単位の処分までである。次はすべて`unassessed`であり、
S1-01を人間判断へ送る前に解消する。

**分母**

1. 生存中holdingのうち11件のS1-01該当。内訳は、screenを実行できた8件（`MPR-SH-CANDIDATE-003`の残り、
   `SEMANTIC-LINE-003`、`SUPPLEMENTARY-003`、`IR-003`、`CONFIRMED-003`、`HEADING-002`、`SCRUM-REVERSE-001`、
   `WORKFLOW-003`）と、atom展開が未了でscreenを実行できない3件（`PREISOLATION-002`、`DELEGATED-DOC-003`、
   `DELEGATED-REF-001`）である。後者3件は「意味を持たない」ことの確認ではない。
2. `MPR-SH-LEGACY-RULE-004`の`source_collection_scope`が自ら記すとおり、7,622件は**発見済みの規則atomであり
   旧HELIXの全規則ではない**。三巡目で増える可能性が残る。母集合そのものが非網羅である。

**規則holding内部**

3. `in_scope`13要求のprimary atom 1,799件のうち、screenに一致しなかった1,384件の内容。
4. primaryが別でsecondaryに`in_scope`13要求を持つatom 964件（link 1,009本）の処分。本screenは`requirement_primary`だけで集約している。
5. 一次screenに掛からなかった6,693 atomのうち、authorityの意味を持つものが無いことの確認。
   screenは語に依存するため、語を使わずに同じ意味を述べたatomを取りこぼす。`RUL-OSM-05`と`RUL-OSA-07`が実例である。
6. `re.IGNORECASE`で増える7 atom（`RC01-118`ほか）を集合に入れるかどうか。
7. 範囲外とした38要求について、個々のatom本文を1件ずつ見た確認。とくに`in_scope_linked_atoms`を持つ35要求は、
   link済みatomの処分が項目4と重なる。
   現在の根拠は要求本文の意味であり、atom単位ではない。要求単位の根拠を個別に記録したのは5要求で、残る33要求の`basis`は定型文である（ただし`in_scope_linked_atoms`の件数と例示atomは要求ごとに実数を持つ）。
8. 各要求の`common_atoms`、`distinct_atoms_by_source`、`acceptance_differences`、`consumer_differences`、
   `unaccounted_atom_refs`（RDP-002 clusterの未評価fieldと同じ）。

**対応表の相手側**

9. RDP-002の`OVC-RUL-RUL-FRM-02`は、`AVS-BR-001`との関係を`unresolved`（「参照ID AVS-BR-001は比較対象の台帳に存在しない。
   判定側の誤参照」）と記録している。`RUL-FRM-02`は本v2で`in_scope`に置いたため、L2適用PRの対応表は
   この未解決を先に片づける必要がある。

L2／L11適用PRの合格条件は、旧AVSの46 atomと、`in_scope`13要求に属する**1,799 atom**（screen一致415件だけではない）
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
- `route_to_other_unit`の6要求について、送り先unitの確定。

## 人間判断

**本v2は、この時点では人間判断へ送れない。** 「未評価のまま残すもの」の分母2項目（生存中holding 11件の未評価、
母集合の非網羅）が解消していないため、AVSの46 atomと旧ルール群の1,799 atomを落とさないという主張が、分母側で
成立していない。

送れる状態にするために必要な作業は次のとおりで、いずれも別PRで行う。

1. 未評価11 holdingへ、本v2と同じ形式の処分を付ける（3件はatom展開が先に要る）（`l2d-s1-01-input-holding-screen.jsonl`を更新する）。`PLAN-L3-82-authority-vocabulary-separation.md`を優先する。
2. `in_scope`13要求のprimary atom 1,799件と、secondaryで流入する964件を、atom単位で処分する。
3. `OVC-RUL-RUL-FRM-02`の`AVS-BR-001` `unresolved`を解消する。

そのうえで問う判断は、v1から変えていない。AVSの全46 atomと旧ルール群`in_scope`13要求の意味を落とさず、
HARNESSの規範責務とOSの記録・執行責務へ`split`する方針の可否である。

- `approve_split`: 上記責務分割と処分を採用し、L2／L11適用PRの作成へ進む。**上の1〜3が終わるまで選べない。**
- `changes_requested`: 変更するatom、要求、target、境界、理由を指定し、本packetを改訂する。
- `defer`: sourceを生存中仮登録のまま保持し、後続採否を進めない。
- `reject`: 不採用にするatomとその影響を明示した別decisionを要求する。黙って削除しない。**上の1〜3が終わるまで選べない**（分母が未確定のまま不採用にすると、まだ数えていないatomを落とす）。

現時点で選べるのは`changes_requested`と`defer`だけである。

判断recordにはdecision unit、選択、actor、判断時刻、本packetのcommit SHA、本packet SHA-256、判断対象revision表12文書の
SHA-256、計上台帳と holding screen のSHA-256を記録する。判断前は`authority_effect: none`を維持する。

本packetは要求の採否、承認、完了、旧資産のretireを生成しない。
