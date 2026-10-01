# v1.3条件行の実効次10件比較監査

- 監査対象revision: `50686b6762788574cb471967e8c24846d3dd56ae`。固定比較revision: `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。
- 範囲: 後続のfocused auditに完全identity一致がなく、基準queueで`condition / primary_residual / unresolved_for_closure_work`だった行をsource物理行順に10件。
- 結果: partial 6 / residual 2 / unknown 2。正式successor 0、source condition closure 0、authority effect none。受入実行・実装・全source無損失は主張しない。

## 選定とidentity再結合

303行queue artifact（SHA-256 `a61ec098a6bd714fcbbb706d0d9afb4e7f2777b114bf23c8056fc130e30f60d9`）はfile commit `71659afc419c6378643652671775468d86ba4a3b`に存在し、監査基点`50686b6762788574cb471967e8c24846d3dd56ae`にも同一bytesで存在する。queue内`basis_commit`とbaseline source auditのlineageは`2bf484b1a84af346feaf8cf7b72e59f3889e6333`であり、queueファイル自体の存在commitと区別する。255行が基準時のprimary residual。後続queueをそのまま採用せず、監査revision `50686b6762788574cb471967e8c24846d3dd56ae` 時点のfocused audit 32件と、各source行のIDおよび(path, file SHA, 物理行, line SHA)を再結合した。154行に後続auditのidentity参照があり、identity参照なし条件に該当するprimary residual候補は119行。以下はそのsource行順先頭10件を今回比較した結果である。119はidentity参照フィルターの候補数であり、意味比較なしの総数や残closure件数ではない。identity参照の存在だけでも意味被覆とはしない。

選定ID: `REQSRC-SUP-00004`, `REQSRC-SUP-00008`, `REQSRC-SUP-00009`, `REQSRC-SUP-00010`, `REQSRC-SUP-00015`, `REQSRC-SUP-00016`, `REQSRC-SUP-00017`, `REQSRC-SUP-00018`, `REQSRC-SUP-00019`, `REQSRC-SUP-00022`.

## 旧sourceと比較対象の判断revision

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md`、SHA-256 `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406`。asset `LEGACY-ASSET-02319C2481B9E01698D5`、明細台帳956行、状態`source_snapshot_preservation`。
- 旧v1.2要件、V-model authority cutover、process modes READMEをread-onlyで確認。file digestと参照範囲はJSONへ記録した。
- 固定PO判断: `HDEC-HARNESS-REQUIREMENTS-2026-09-28` がf6のHARNESS L2/L11 bytesと24候補を採択。L3承認・実装・受入・source closureは含まない。固定対象文書のSHAはJSONに記録。
- 関連PO判断: 2026-09-25に旧3-style exclusive条件を4方式の合成可能へ変更し、L3までの共通条件と品質条件を保持。

## 行単位の比較

### REQSRC-SUP-00004 — source line 4（partial）

- 行identity: file SHA `sha256:788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406`、line SHA `sha256:5127b3721675f320b609441c9c27067703fff6a6dd9aca21da9f8444f1e75cd3`。
- 原文行: > 同時に満たす。compatibility文書はL3 freeze条件へ使用しない。
- 完全文脈: 同一の規範文。対象行4は行2–3の完結条件の一部で、L3進行authority rebaselineと本書current contractを同時に満たす要件を続ける。
  - 2: > **L3進行authority**: 層・pair・runtime判断は
  - 3: > `docs/governance/l3-progression-authority-rebaseline-2026-07-19.md`と本書のcurrent contractを
  - 4: > 同時に満たす。compatibility文書はL3 freeze条件へ使用しない。
- 行先: route; 固定pair候補: HARNESS-L2-001
- 固定pairの行参照: `HARNESS-L2-001` `docs/helix-harness/L2-requirements/product-requirements.md:52`, `HARNESS-L2-001` `docs/helix-harness/L11-acceptance/product-acceptance.md:21`.
- 保持: 文脈2–4は旧L3 authorityのrebaselineとcurrent contractの双方を要する。固定HARNESS-L2-001と対になるL11受入（product-acceptance.md:21）は現行L2要求とL11受入、L3要件とL10検証を区別する。
- 意味差分: 文脈の参照先である旧rebaseline文書の正本順位やL3 freeze authorityは、f6固定L2/L11の範囲に含まれない。
- 残余:
  - 旧L3 authority rebaselineの現行採用範囲と、本書current contractとの競合時の解決。
- 拒否すべき反例: 旧compatibility文書だけでL3 freezeを成立させる、または旧rebaselineとの同時充足条件をL2/L11のpair区別だけで満たしたと扱う。

### REQSRC-SUP-00008 — source line 10（unknown）

- 行identity: file SHA `sha256:788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406`、line SHA `sha256:ee492519c73e6e137f6ade7a23a05e9a6e2a33f2b3d02ee8793ac4161952dc1f`。
- 原文行: - **設計コア**: `hybrid-vmodel-source.v1`、`universal-workflow-requirements-skill.v1.1.0`、`hybrid-core-rebaseline.v0.5.1`。旧archive filename、archive SHA、Git blobは`docs/migration/source-manifests/`のprovenance input-onlyであり、current source identityとして再出力しない。
- 行先: unknown; 固定L2/L11 targetなし。
- 保持: 固定HARNESS L2/L11内に設計コア名、旧archive SHA/Git blobのcurrent identity再出力禁止の同一conditionは特定できない。
- 意味差分: 該当する直接L2/L11比較対象がない。
- 残余:
  - 3つの設計コアの役割・意味・後継関係。
  - source-manifestをprovenance input-onlyとする条件。
  - archive filename/SHA/Git blobの再出力制約。
- 拒否すべき反例: 近い工程・要求engineの語彙だけでL2 successorを割り当てない。

### REQSRC-SUP-00009 — source line 11（residual）

- 行identity: file SHA `sha256:788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406`、line SHA `sha256:a15a0a4924347846b91686f1fd49cce67b5d75ed90ed8baa45c40e70219f240f`。
- 原文行: - **旧正本**: `helix-harness-requirements_v1.2.md`（L0〜L14部分はcompatibility referenceへ降格）
- 行先: governance_only; 固定L2/L11 targetなし。
- 保持: 旧v1.2を互換参照へ降格する記載はsource履歴として保持。現行carry-forward policyは旧要求の意味を削減せず対象別へ再配置する。
- 意味差分: 固定L2/L11 pairは旧v1.2のsource authorityやL0-L14全体のcompatibility扱いを定めない。
- 残余:
  - v1.2から引き継ぐ条件の同定とv1.3との衝突判定。
  - 旧v1.2内のL0-L14項目を現行targetへ対応づける条件。
- 拒否すべき反例: sourceの保持・互換参照を、全原子の再配置やL2/L11被覆完了と同一視しない。

### REQSRC-SUP-00010 — source line 12（residual）

- 行identity: file SHA `sha256:788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406`、line SHA `sha256:5c078f54881b806f01d63ee6a3388639b3cf3cde94f5d4230218f8572c42d521`。
- 原文行: - **継承**: v1.2のうち、本書と衝突しない安全・証跡・駆動モデル・agent・DB・GitHub要件は継承する。
- 行先: governance_only; 固定L2/L11 targetなし。
- 保持: 対象は設計core名ではなく、v1.2の安全・証跡・駆動モデル・agent・DB・GitHub要件を「本書と衝突しない範囲で」継承するという条件。現行carry-forward policyは旧要求の意味削減を禁じ、対象別再配置と意味変更を分けている。
- 意味差分: f6固定HARNESS L2/L11には、v1.2各要件のsource identity、v1.3との衝突判定、6領域ごとの継承可否を示す個別comparison/acceptanceはない。carry-forward policyは意味保持を求めるが、この旧文の6領域を一括で継承済みとは判定しない。
- 残余:
  - 安全・証跡・駆動モデル・agent・DB・GitHubのv1.2 source atom/requirement identityをそれぞれ特定する。
  - 各identityについてv1.3本文との衝突を条件単位で確かめ、保持・意味変更・対象別routeを記録する。
  - 各保持条件に対応するcurrent L2と対L11の個別比較が未了。
- 拒否すべき反例: 6領域のいずれかを旧sourceや実装があるだけでcurrent L2/L11に継承済みとみなす、または現行targetが未合意というだけでsource意味を候補へ降格・削除する。

### REQSRC-SUP-00015 — source line 19（partial）

- 行identity: file SHA `sha256:788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406`、line SHA `sha256:47f330e42c55fd31f6870a5d3d834d29294aa931552917b799f4aa05772cf176`。
- 原文行: 進捗表示、tagの判定入力にしない。
- 完全文脈: §1の正本・工程宣言全体。行19の否定条件は、旧layer体系の利用先をPLAN/template/generator/DB canonical projection/進捗/tagへ広げて禁止する。
  - 16: HELIXの工程正本は **L1〜L12**であり、`FULL_L1_L12_V`、`PRODUCTION_SCRUM`、
  - 17: `V_DESIGN_SCRUM_IMPLEMENTATION`を同列のdevelopment styleとして選択する。旧layer体系は既存成果物を
  - 18: 読み取る期限付きcompatibility inputであり、新規PLAN、template、generator、DB canonical projection、
  - 19: 進捗表示、tagの判定入力にしない。
- 行先: route; 固定pair候補: HARNESS-L2-001, HARNESS-L2-002
- 固定pairの行参照: `HARNESS-L2-001` `docs/helix-harness/L2-requirements/product-requirements.md:52`, `HARNESS-L2-002` `docs/helix-harness/L2-requirements/product-requirements.md:53`, `HARNESS-L2-001` `docs/helix-harness/L11-acceptance/product-acceptance.md:21`, `HARNESS-L2-002` `docs/helix-harness/L11-acceptance/product-acceptance.md:22`, `HARNESS-L2-001` `docs/helix-harness/L2-requirements/product-requirements.md:99`, `HARNESS-L2-001` `docs/helix-harness/L11-acceptance/product-acceptance.md:33`.
- 保持: 文脈16–19はcanonical L1–L12、旧layer体系を期限付きcompatibility inputに限定し、PLAN/template/generator/DB canonical projection/進捗/tagの判定入力から除外する。f6 HARNESS-L2-001と対になるL11受入（product-acceptance.md:21）は旧L0–L14 physical pathをcurrent pair判定へ混入させない条件を保持する。
- 意味差分: 固定pairは旧physical pathのpair誤認を検出するが、sourceが列挙する各surface（PLAN、template、generator、DB projection、進捗、tag）の独立禁止条件を再掲していない。
- 残余:
  - 列挙された6 surfaceごとの旧layer input禁止と拒否条件。
  - 旧compatibility inputから進捗/tagの判定値を作らない受入oracle。
- 拒否すべき反例: 旧path名やtagだけをcurrent layer/進捗の判定入力にする。

### REQSRC-SUP-00016 — source line 21（residual）

- 行identity: file SHA `sha256:788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406`、line SHA `sha256:f909d9a60872c17c00715c52e5b65b9d25836b1d56780aa3052e5e1f6931b343`。
- 原文行: 本書とv1.2、concept v3.1、旧process文書が衝突する場合、本書と`docs/design/helix/L3-requirements/vmodel-canonical-authority-cutover.md`を正とする。
- 行先: governance_only; 固定L2/L11 targetなし。
- 保持: source上の文書間precedence clauseと旧cutover文書への参照は記録した。
- 意味差分: 旧文書の三者衝突時順位は固定L2/L11では再掲されず、現行のConcept・authorityモデルを含む上流規則に属する。
- 残余:
  - v1.2/concept v3.1/旧processとの競合でv1.3と旧cutoverを優先する旧順位の保持・変更判断。
  - 本体Concept/L1・L2/L11・L3間の現行authority precedence。
- 拒否すべき反例: 旧cutoverファイルがarchiveに残ることから、それを現行L3 authorityとみなす。

### REQSRC-SUP-00017 — source line 23（partial）

- 行identity: file SHA `sha256:788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406`、line SHA `sha256:5c2822dfc64517b6196a848e15ad7e9fe640ea9dbffdb65cb1c074cba566b254`。
- 原文行: VモデルとProduction Scrumは、目的に応じて選択できる同格のdelivery engineである。Production Scrumを
- 完全文脈: 三行の連続したstyle条件。行23は行24へ続く未完文であり、行24の同格・非縮退・共通品質/evidence条件、行25のHybrid/Forward定義までを比較文脈に含める。
  - 23: VモデルとProduction Scrumは、目的に応じて選択できる同格のdelivery engineである。Production Scrumを
  - 24: 簡易版・縮退版として扱わず、両engineに同じ品質属性、二主体review、trace、DB追従、release evidenceを要求する。
  - 25: HybridはL5詳細設計までVモデルで凍結した後に実装をslice化し、Forwardはslice化せずL12まで進む。
- 行先: route; 固定pair候補: HARNESS-L2-002
- 固定pairの行参照: `HARNESS-L2-002` `docs/helix-harness/L2-requirements/product-requirements.md:53`, `HARNESS-L2-002` `docs/helix-harness/L2-requirements/product-requirements.md:100`, `HARNESS-L2-002` `docs/helix-harness/L2-requirements/product-requirements.md:102`, `HARNESS-L2-002` `docs/helix-harness/L11-acceptance/product-acceptance.md:22`, `HARNESS-L2-002` `docs/helix-harness/L11-acceptance/product-acceptance.md:34`.
- 保持: 文脈23–24のうち、目的に応じたstyleを選べること、Production Scrumを縮退版とせず共通品質/evidenceを保持することは、f6 HARNESS-L2-002と対になるL11受入（product-acceptance.md:22）の4方式・品質条件へ部分的に反映される。
- 意味差分: 2026-09-25 PO判断は旧style三つのexactly-oneから、V-model／Scrum／Hybrid／Release Kanban四方式の合成可能へ変更。L3までは一律共通とする。
- 残余:
  - 旧V-modelとProduction Scrumの「同格」条件を目的・適用範囲ごとに照合する。
  - 四方式の合成時に各styleの責務境界をどう保つか。
- 拒否すべき反例: Production Scrumを縮退版とする、または4方式の組合せでL1–L3・要件承認・V-pair・品質条件を落とす。

### REQSRC-SUP-00018 — source line 24（partial）

- 行identity: file SHA `sha256:788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406`、line SHA `sha256:e1fb760eca3881325203d63207eaa13fb130fa377298ca225659cc922de5855e`。
- 原文行: 簡易版・縮退版として扱わず、両engineに同じ品質属性、二主体review、trace、DB追従、release evidenceを要求する。
- 完全文脈: 三行の連続したstyle条件。対象行24の二engine quality/review/trace/DB/release条件を、前行の主体と次行の方式境界を含めて比較する。
  - 23: VモデルとProduction Scrumは、目的に応じて選択できる同格のdelivery engineである。Production Scrumを
  - 24: 簡易版・縮退版として扱わず、両engineに同じ品質属性、二主体review、trace、DB追従、release evidenceを要求する。
  - 25: HybridはL5詳細設計までVモデルで凍結した後に実装をslice化し、Forwardはslice化せずL12まで進む。
- 行先: route; 固定pair候補: HARNESS-L2-002, HARNESS-L2-003, HARNESS-L2-004
- 固定pairの行参照: `HARNESS-L2-002` `docs/helix-harness/L2-requirements/product-requirements.md:53`, `HARNESS-L2-003` `docs/helix-harness/L2-requirements/product-requirements.md:54`, `HARNESS-L2-004` `docs/helix-harness/L2-requirements/product-requirements.md:55`, `HARNESS-L2-002` `docs/helix-harness/L2-requirements/product-requirements.md:100`, `HARNESS-L2-002` `docs/helix-harness/L11-acceptance/product-acceptance.md:22`, `HARNESS-L2-003` `docs/helix-harness/L11-acceptance/product-acceptance.md:23`, `HARNESS-L2-004` `docs/helix-harness/L11-acceptance/product-acceptance.md:24`, `HARNESS-L2-005` `docs/helix-harness/L11-acceptance/product-acceptance.md:25`.
- 保持: 文脈23–25の共通品質/evidence境界は、固定L2-002が方式の組合せで品質条件を省略しないこと、L2-003/004と対L11が工程条件・trace/verification義務を定める範囲で部分的に保持される。
- 意味差分: 固定pairは四方式および合成を対象とし、旧二engine間の同等条件を共通要求へ展開している。旧sourceが列挙する二主体review、trace、DB追従、release evidenceがstyle横断で同じ条件として全部つながるかは、このsource rowの比較で閉じない。
- 残余:
  - 二主体review、DB追従、release evidenceを各style横断で確かめる個別pair受入。
  - source clauseの4条件と各L11 criterionとの一対一 trace。
- 拒否すべき反例: Production Scrumを簡易版として、列挙された品質/review/trace/DB/release条件の一つでも落とす。

### REQSRC-SUP-00019 — source line 25（partial）

- 行identity: file SHA `sha256:788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406`、line SHA `sha256:c111b97b46229b721999ae7a3d271676522c1ad6fe92f4a9996c373f5d785135`。
- 原文行: HybridはL5詳細設計までVモデルで凍結した後に実装をslice化し、Forwardはslice化せずL12まで進む。
- 完全文脈: 三行の連続したstyle条件。対象行25のHybrid/Forward定義は行23–24の二engine/style関係と一体で比較する。
  - 23: VモデルとProduction Scrumは、目的に応じて選択できる同格のdelivery engineである。Production Scrumを
  - 24: 簡易版・縮退版として扱わず、両engineに同じ品質属性、二主体review、trace、DB追従、release evidenceを要求する。
  - 25: HybridはL5詳細設計までVモデルで凍結した後に実装をslice化し、Forwardはslice化せずL12まで進む。
- 行先: route; 固定pair候補: HARNESS-L2-002
- 固定pairの行参照: `HARNESS-L2-002` `docs/helix-harness/L2-requirements/product-requirements.md:53`, `HARNESS-L2-002` `docs/helix-harness/L2-requirements/product-requirements.md:100`, `HARNESS-L2-002` `docs/helix-harness/L11-acceptance/product-acceptance.md:22`, `HARNESS-L2-002` `docs/helix-harness/L11-acceptance/product-acceptance.md:34`.
- 保持: 文脈23–25のうち、V-modelをslice化しないことはf6 L2-002で保持される。HybridはVを土台にunit拡張し最後に結合するという現在の定義で部分的に継承される。
- 意味差分: 2026-09-25 PO判断で旧「L5詳細設計までfreeze後に実装slice化」のHybridをunit拡張/最後の結合へ変更した。旧sourceのForward呼称はcurrent V-model identityにそのまま移さず、既存条件を個別対応づける必要がある。
- 残余:
  - 旧L5 freeze境界からcurrent unit expansion/最後の結合への全条件trace。
  - 旧Forwardの非slice/L12到達条件とcurrent V-model条件との正確な対応。
- 拒否すべき反例: 旧HybridのL5後slice化を現Hybridの定義と同一視する、または旧Forward labelだけでcurrent style/layer routeを決める。

### REQSRC-SUP-00022 — source line 31（partial）

- 行identity: file SHA `sha256:788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406`、line SHA `sha256:4e72106677d385ddc43b8dd6b84d2dfd1e60d894debed6b39f8778e4bcd1ff2a`。
- 原文行: 利用者要求はL2、FR／NFR／ACの定義・凍結はL3であり、利用者受入はL11である。
- 行先: route; 固定pair候補: HARNESS-L2-001
- 固定pairの行参照: `HARNESS-L2-001` `docs/helix-harness/L2-requirements/product-requirements.md:52`, `HARNESS-L2-001` `docs/helix-harness/L11-acceptance/product-acceptance.md:21`.
- 保持: 固定pairはL2要求/L11利用者受入とL3要件/L10総合検証の区別およびpair欠落検出を明示する。
- 意味差分: 旧文はFR/NFR/ACの定義・凍結主体をL3と表記するが、固定pairは「L3要件」と包括表現し、その要件内のFR/NFR/AC分類ごとのfreeze条件をここでは再掲しない。
- 残余:
  - FR、NFR、ACそれぞれの定義・freeze条件と対象revisionへのbinding。
  - L11利用者受入条件の個別結果・exception。
- 拒否すべき反例: L2要求をL3要件やL11受入と同一視する、またはL10結果だけでL11を成立させる。

## 主張境界

`partial`は記した限定関係の部分比較、`residual`は既知の旧条件に固定L2/L11の対応条件がない状態、`unknown`はこの監査で妥当な固定pair routeを特定できなかった状態。いずれもsource dispositionやsuccessor decisionではない。基準queueへstatusを書き戻していない。

## 静的確認

- 各source行の原文とline SHAをarchive bytesで照合し、選択したidentityを固定した。完全文脈行は比較用に加え、source row identityは変更していない。
- queue全303行をfocused auditとID＋完全tupleで再結合し、今回選んだ10件にidentity hitがないことを確認した。119はidentity-hitなしの候補pool件数であり、母集団全体の未比較・未closure件数とは主張しない。32件のfocused audit file SHAをJSONに固定。
- f6固定L2/L11と判断recordのSHAを確認した。
- archiveは読み取りのみ。archive runtime、CLI、test、hook、CIは実行していない。
