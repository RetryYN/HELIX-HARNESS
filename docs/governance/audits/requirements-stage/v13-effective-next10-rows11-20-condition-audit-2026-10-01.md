# v1.3条件行の実効次10件比較監査（11–20番）

- 監査対象revision: `50686b6762788574cb471967e8c24846d3dd56ae`。
- 固定比較revision: `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。
- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md`、SHA-256 `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406`、asset `LEGACY-ASSET-02319C2481B9E01698D5`。
- 判定区分の件数: partial 10 / residual-only 0 / unknown 0。partialの10行には、それぞれ未被覆の残余条件がある。正式successor 0、source condition closure 0、authority effect none。L11本文は全件未実行であり、受入実行・実装・旧source全量no-loss closureを主張しない。

## 選定の再現

前回の1–10番監査（repo-relative artifact `docs/governance/audits/requirements-stage/v13-effective-next10-condition-audit-2026-10-01.json`、JSON SHA-256 `cad2863a7310ffa74d46bdb78cdc6f534210299750592ce87991a93b41b8b255`）のbytesは、到達可能なexact audit HEAD `71528979630922dd9683c345adb06d9b02790e70`に存在する。元のaudit HEAD `abe85bd88d8da28ba3c945bd1ed052ceb62b2259`はbranchに公開されていないprovenanceとしてJSONに残す。focused audit 32ファイルのSHA-256をすべて再検証し、基準queue `v13-condition-closure-work-queue-2026-09-30.json`（303行、SHA-256 `a61ec098a6bd714fcbbb706d0d9afb4e7f2777b114bf23c8056fc130e30f60d9`）へsource identityを再結合した。queue file bytesのcommitは`71659afc419c6378643652671775468d86ba4a3b`、監査基点は`50686b6762788574cb471967e8c24846d3dd56ae`。queue内の`basis_commit`/baseline source audit lineage `2bf484b1a84af346feaf8cf7b72e59f3889e6333`とは区別した。基準時点で`primary_residual`かつ`unresolved_for_closure_work`で、focused auditに同じsource identityのhitがない119行をsource物理行順に並べ、11–20番を選んだ。

選定IDは`REQSRC-SUP-00023`, `00024`, `00025`, `00026`, `00027`, `00028`, `00029`, `00046`, `00047`, `00051`。119はidentity参照filterの候補数であり、意味比較未実施の総数や残closure件数ではない。identity hitは意味被覆を証明せず、identity hitなしも他所で意味比較がない証明ではない。各source lineと前後の条項・継続文・例外を含む完全context、物理行SHA-256はJSONへ記録した。

## 比較のauthority

2026-09-28の`HDEC-HARNESS-REQUIREMENTS-2026-09-28`は、f6のHARNESS L2/L11本文と明示24候補を採択する。対象はその固定revisionであり、L3承認、実装許可、受入実行、旧source全量closureを含まない。f6の本文bytes SHA-256はL2 `aed75cb4bdd644eedd9d3eb408cf522af2c4fbf4272db7b775edc62fc383100a`、L11 `09b2963187f9aaddbb1ad189d77e517e91914bd5ccdf2499dd9c11855139bcd4`。

2026-09-25のPO判断は3方式のexclusive選択から4方式の合成可能へ意味を変えつつ、L1–L3、要件承認、V-pair、品質条件を保持した。2026-09-26のBRAIN L1 PO判断はVisual Design HARNESSを画面の見た目と体験の生成・評価、prototypeに結び、architecture/detail designと分け、BRAINからのpattern等の受渡しとLABO経由の還流を定めた。これら後続decisionは該当sourceの比較文脈として読み、固定HARNESS L2/L11に記されていない条件を採択済みL2/L11へ追加したとは扱わない。decision pinとSHAはJSONにある。

L11受入行は必ず対応する`HARNESS-L2-*`の親IDと対にして記録した。独立した`HARNESS-L11-*` IDは生成していない。

## 行単位の比較

| Source ID／行 | 判定 | 比較した親L2と対L11 | 主な保持点と残余 |
|---|---|---|---|
| `REQSRC-SUP-00023`／32 | partial | `HARNESS-L2-001` | 旧物理path名から現行層を推測しない境界は保持される。全旧pathと全consumerの誤判定を拒否する個別oracleは未展開。 |
| `REQSRC-SUP-00024`／33 | partial | `HARNESS-L2-001`, `HARNESS-L2-008` | sourceと採用状態を要求形成へ渡す枠はある。既存要求・追補・候補を全件列挙し、source欠落を拒否する受入oracleは未展開。 |
| `REQSRC-SUP-00025`／34 | partial | `HARNESS-L2-001`, `HARNESS-L2-008` | 上位Conceptと要求形成の境界、2026-09-28固定判断の候補範囲は明確。Concept承認・候補本文の正本化・runtime適用の個別判定は未展開。 |
| `REQSRC-SUP-00026`／35 | partial | `HARNESS-L2-001`, `HARNESS-L2-008` | draft候補から要求合意・操作許可を生成しない。特定のdraft sourceと追加条件のrevision別oracleは未展開。 |
| `REQSRC-SUP-00027`／36 | partial | `HARNESS-L2-001`, `HARNESS-L2-008` | 採択範囲は対象revisionと明示候補に限定される。追加条件ごとに承認対象revisionを照合する拒否シナリオは未展開。 |
| `REQSRC-SUP-00028`／38 | partial | `HARNESS-L2-008` | Issue/PRは要求意味・合意・操作許可のauthorityにならない。証跡参照から対象revision判断までの各遷移を網羅したoracleは未展開。 |
| `REQSRC-SUP-00029`／39 | partial | `HARNESS-L2-008` | Issue/PR/CI等から要求合意・操作許可を作らない。Issueの有無・close statusによる追加削除と、本文・出典・decisionの三点照合は独立oracleに未展開。 |
| `REQSRC-SUP-00046`／59 | partial | `HARNESS-L2-001`, `HARNESS-L2-007` | L11とL12を別層として扱い、Version 1評価で両方へtraceする。本番releaseをその間のmilestoneとし独立layerを増やさない条件は明示されない。 |
| `REQSRC-SUP-00047`／61 | partial | `HARNESS-L2-001` | 旧sourceの六つのV-pairはL2-001に同じ組で保持され、HARNESS-L2-001に対するL11受入は誤pairと片側欠落を拒否する。実artifact上のpair実行結果とsource condition closureは未成立。 |
| `REQSRC-SUP-00051`／67 | partial | `HARNESS-L2-001`, `HARNESS-L2-003` | L2.5画面prototypeの対象は関連するが、Visual Design HARNESSの生成・評価およびBRAIN/LABO接続は同義でない。L8–L10一般検証との非同一性を個別に受入する条件は残る。 |

各項目の完全source context、source row/line SHA、固定pairの参照行、保持内容、意味差分、残余、拒否すべき反例は隣接する[JSON証跡](v13-effective-next10-rows11-20-condition-audit-2026-10-01.json)を参照。状態`partial`は条件比較の一部が見つかったという分類であり、formal successor・source closure・実行済みを意味しない。

## 静的確認

基準queue・focused audit 32ファイル・旧source行本文とSHA・旧asset台帳行・固定f6 L2/L11 bytes・関連PO decisionの各pinを確認した。旧CLI、runtime、test、CIは実行していない。JSONの`static_validation`に検査結果を記録した。
