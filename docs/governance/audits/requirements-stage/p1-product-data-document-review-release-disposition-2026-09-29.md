# P1 残余機能単位の処置：Product Data・文書review・incident/release

基準main: `e2888a51a6b673b7c44ee57e79bbdde910f6beb1`。旧HELIXの機能を現行の採択済みL2/L11、未採択候補、未決の意味選択へ照合する。ここでの「処置」は行き先を明示したことを指し、要求の採択、旧source holdingの解除、動作の受入、release許可を意味しない。旧実装・CLI・hook・test・CIは実行していない。

## 原文の範囲と照合単位

| 機能単位 | 旧source identityと固定箇所 | 原条件の核 |
|---|---|---|
| Product Data | `HIL-BR-15` [旧L1:67](../../../../archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md)、`HIL-FR-23/24` 同`:113-114`。asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`、file SHA `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`、行SHAは順に `880385839788ea49f14544ee9dd0f1ed5037bc84b1707a9ba55f4fa6a267c2f5`、`85a92638e7c8e010055e880609ea9c634e205df5c61f0e80bdea3fbc9be68c92`、`a61697f41088818ddbb852fe274453666708c8467ce3d60a538203140bbc91d4`。旧detail `archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/product-data-connector.md:33-57,86-109`（asset `LEGACY-ASSET-C3DE79BA9451172F3E43`、file SHA `2b42c26f7e4d387a6e2b178de05c2c27ac946646f266faee95aa08a65e803b04`）。 | version付きsource/connectorの列挙とread/write・credential参照、full/incremental冪等取得、canonical entity/mapping、provenance・鮮度・schema drift・tombstone・watermark、複数consumerへの供給。旧detailのNode/PythonやDB方式と機能保証は分ける。 |
| 文書専用review | `BR-08` [旧business:48](../../../../archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/business-requirements.md)、asset `LEGACY-ASSET-9F48ADEEB477DCA54039`、file SHA `09ad9a27afe25bd730f57319865d1f342e6b31729da2dd27f22ecd6cb753ac61`、行SHA `45c182bcd3eb0eb9261eb2de58c12dca8c1a4e1de60f4d4c0263fa4ccc631c2f`。`FR-L1-45` [旧functional:76](../../../../archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/functional-requirements.md)、asset `LEGACY-ASSET-6B6C5CB0E481BE01088B`、file SHA `a9c1064d359b0d9c7269a2253e416597de77fa91149c162f9a40467be3f1a008`、行SHA `c88465a7d0f5f2f881791256b0d45ba182573df4e1919f13d80b20ba1e0505d7`。 | 大規模doc改定・gate evidence・pair freeze前のread-only専用review、整合・網羅・一貫・明確の4軸、未召喚時のgate拒否。旧`.helix`記録先・環境変数bypassは旧方式。 |
| incidentとrelease | `FR-L1-16` [旧functional:47](../../../../archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/functional-requirements.md)、同asset/file SHA、行SHA `c68d0f29aaf2ad024f3a0ea37892eb84b7ffb54568e0726299f4b648115ddc7a`。 | 本番障害の検出→hotfix→即release→収束→現行L1–L12へのbackfill、troubleshoot/recovery plan・postmortem・feedback。即releaseは安全な通常Release Portと異なる意味条件。 |
| GitHub監査資格 | `3L-BR-007/008` [旧要求:63-69](../../../../archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/three-lane-cloud-governance-requests.md)、asset `LEGACY-ASSET-A6926200F28B26300432`、file SHA `e96a70f02c517f33d9cbdc43d92e6d7b36ded7bbf023226f1cc4f63b5f7c2765`、identity行SHA `170537a10b1df263fd6af5265bc2ee88ae2a618f35203f768695ff828d37dba9`、`d4d4e772fe334d81af99c5aa5856f07e0c2fd6d2107a01812264907941c9cfc0`。 | 決定規則とsemantic findingを分離したGitHub監査能力、task class×model revision評価、資格・権限・assignment roleの分離、重大miss/model更新時の資格失効。Node gate・特定providerは旧方式。 |

## 現行への処置

| 機能単位 | 採択済みで保持する一般契約 | 未採択候補・未処分条件 | 判定 |
|---|---|---|---|
| Product Data | BRAINのsource/knowledge versioned context、CONNECTの接続identity/compatibility、SECURITYの秘密値・権限境界、LABOの観測sourceは部分関係。 | Product Data専用registry、full/incremental取得、canonical entity/mappingとwatermark/cursor/tombstone、drift時の再取得、設計・coverage・impact・Issue routing・docgen/detectorへの同一projection配付は現行採択済み契約の出力と同値ではない。[旧HAT-11負例監査](legacy-system-acceptance-negative-oracle-audit-2026-09-28.md)も同じ不足を記録する。product scope、consumer集合、owner、導入版を決めずに採択済みと数えない。 | source 3 identityは`preserved_pending`。旧方式移植は不要だが、機能の保持/置換/retireのPO判断が未決。 |
| 文書専用review | HARNESS-L2/L11-005はriskから検証義務、OS-L2/L11-018は作成と独立reviewの分離、GitHub運用モデルはexact HEADのreviewを保持する。 | 専用read-only reviewer、三つのtrigger、4軸oracle、未召喚gate拒否は一般reviewだけでは等価にならない。旧role名・audit file・bypass変数は方式として保留。 | source 2 identityは`preserved_pending`。A＝専用能力としてL2/L11へ再導出、B＝一般reviewへの意味置換/retireを対象revision付きで判断。 |
| incidentとrelease | HARNESS-L2/L11-003のRelease Port、OS-L2/L11-017/019/020/023のcontinuity・ticket・検証・受渡しは保持する。 | hotfix後の「即release」を通常Portと同じとみなさない。例外を残すと安全条件とauthorityを別途定める必要がある。収束後backfill義務はrelease選択から独立して残す。 | source 1 identityは`meaning_decision_pending`。A＝限定例外＋backfill、B＝即時release意味をretireし通常Port＋backfill。人の選択前にreleaseを実施しない。 |
| GitHub監査資格 | LABOのtask class別Bench evidence、INTELLIGENCEの配置案、OSのassignment、SECURITYの操作権限は別責務として存在する。 | 未採択LABO-L2/L11-065の候補runtime資格証拠と、旧3L-BR-008の重大miss/model更新失効は同一の採択済み契約ではない。GitHub監査task class固有の資格と、決定的規則/semantic finding分離の境界、資格失効のownerと作用を保持する。 | source 2 identityは`preserved_pending`。LABO-065は候補関係に留め、資格/権限/assignmentをscoreから生成しない。 |

対象8 identityの処置先は8/8明示したが、採択済みで原機能全体の同値を立証した件数は0/8である。「処置済み」と「意味closure」を混同しない。Product Dataでは原要求3 identityにまたがる一つの能力の部分条件を、既存CONNECT登録だけで充足に数えない。文書reviewの2 identityも、一般reviewがあるだけでは4軸とtriggerを閉じない。上表は[IR108照合](legacy-ir108-disposition-summary-2026-09-28.md)、[confirmed175残差](legacy-confirmed175-residual-disposition-2026-09-28.md)、[legacy system負例](legacy-system-acceptance-negative-oracle-audit-2026-09-28.md)の詳細を機能単位に集約したものであり、旧source全件や全4,020資産の再調査ではない。

## POへ残す具体的な選択

1. **Product Data**：A＝version付きread-only取得・canonical projectionと必要consumerを候補化し、ownerと導入版を指定する。B＝この能力を後続版へ延期して旧source holdingを生かす。C＝対象revisionと影響を示して置換/retireを決める。推奨Bは無断の1.0追加を避ける暫定処置で、能力不要という判断ではない。影響先は旧BR-15/FR-23/24、CONNECT・BRAIN・SECURITY・LABO、設計判断等のconsumer。
2. **文書review**：A＝read-only専用review、三trigger、4軸と負例を候補化する。B＝一般の独立reviewへ意味置換し、旧専用条件を対象revision付きでretireする。推奨Aは原文条件を失わせない候補起草の方向であり、採用判断ではない。影響先はBR-08/FR-L1-45、HARNESS-005、OS-018。
3. **incident release**：A＝incident例外の最低安全条件・権限・backfillを要求化する。B＝即release例外をretireし、通常Portとbackfillを使う。推奨Bは現行安全境界と整合する暫定案であり、旧意味の変更はPO判断を要する。影響先はFR-L1-16、HARNESS-003、OS-017/019/020/023。
4. **GitHub監査資格**：A＝task class×model revision資格と重大miss/model更新失効を、LABO evidence→INTELLIGENCE案→OS assignment→SECURITY権限の分離を保って候補化する。B＝旧専用資格を保留してsource holdingを維持する。C＝対象revision付きで意味置換/retireを決める。推奨Bは現行LABO-065との重複範囲の精査を残す。影響先は3L-BR-007/008、LABO-065と上記機構。

選択肢と推奨は本監査からの提案であり、いずれも選択済みではない。後続の候補はConcept→対象L1→L2/L11の順で起こし、採択済み本文を黙って変更しない。
