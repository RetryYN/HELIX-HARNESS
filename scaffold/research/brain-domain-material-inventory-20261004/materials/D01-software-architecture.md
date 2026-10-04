# D01 Software Architecture：知識素材の棚卸し

status: scaffold（調査材料。採否、要求、設計、実装、BRAINへの登録の決定ではない）
authority_effect: none
基準：`origin/main` `064a1cf5`（2026-10-04）。旧HELIXのpathは`archive/legacy-generation-2026-09-14/root/`からの相対で書く。
素材の状態：本書の素材はすべて「未評価の候補素材」である。採用済み・評価済みとして扱わない。

## この領域の範囲（本書での読み方）

HELIXBRAIN-L2-001（`docs/helix-brain/L2-requirements/brain-requirements.md` 90）が挙げる初期領域の一つ。領域の意味はL2に定義が無いため、本書では「system全体の構造の切り方、品質特性と方式の対応、依存の向き、判断の記録」を扱うと仮に読む。Application Architecture（D02、1つのapplication内部の層・責務・境界）との境目は未決であり、§5に書いた。

## 1. 旧HELIXの素材

| 素材ID | asset ID | path | 行 | 全体SHA-256 | 何の知識か | 知識recordにする場合の候補粒度（案） | 限界・古さ・HELIX固有か汎用か |
|---|---|---|---|---|---|---|---|
| D01-M01 | LEGACY-ASSET-99C939E249CAF40935CB | `docs/design/harness/L4-basic-design/architecture.md` | 22–34、35–51 | f4b9fcb98b4250879955f6eca0f2916dc1a27046820a8ad687e8f816b856bea2 | 制約（言語・配布・state・OS）を方式への影響へ写す表、ISO/IEC 25010の品質目標→技術決定→根拠の表（arc42 §4の形） | Pattern候補「品質目標から方式を導く対応表」（Design Unit：制約→影響、品質目標→決定→根拠） | 内容はHELIX-HARNESS自身（TS/Bun、zod、単一binary）の判断で固有。汎用にできるのは表の形と「制約→方式影響」の問い方だけ。TS/Bun等の技術名は持ち込まない |
| D01-M02 | 同上 | 同上 | 190–215 | 同上 | ADRの様式（状態、背景、決定、検討した代替案、影響）と、ADRをL4方式設計の必須成果物にする扱い | Part候補「architecture判断の記録の欄」 | 様式はarc42 §9・MADR準拠と自称。個々のADR一覧（ADR-001〜006）はHELIX固有 |
| D01-M03 | LEGACY-ASSET-4462A16C8BAD769BA2D4 | `docs/adr/ADR-002-dependency-direction-and-auto-map.md` | 8–41 | 8a3cbd01d70ba8fe5823b667339bc1d6517df843b07eac217c53e61b41d8072b | 依存は安定核（schema）へ一方向、循環禁止、副作用は端に隔離。設計が宣言する依存と実import graphの差（drift）を機械照合する決定と、代替案3件の却下理由 | Pattern候補「安定核への一方向依存」、Pattern候補「宣言した依存と実依存の差の検出」。却下案は比較の材料（L2-004） | 判断はHELIX固有（module名、D-03=0、knip/madge）。汎用の原理（依存の向き、循環禁止、宣言と実装の差を測る）とHELIXでの適用例を分けて記録する必要がある（L2-011）。49行以降のAddendum（A-124〜126）はtool選定でありこの領域の素材にしない |
| D01-M04 | LEGACY-ASSET-9D29ADBC1F8BAE1EB76F | `docs/skills/dependency-map.md` | 58–67、80–86 | 222f7eae61ff7fc74ed73ba4a01c74eabd7ba6e95fe3ef1b44dfdc412aa16591 | 依存を足すときに書く欄（名前、向き＝consumes／provides、結合の強さ＝interface-only／implementation detail、変更risk＝stable／internal）と、依存を隠す・宣言を消す等のAnti-Pattern | Part候補「依存の記述欄」、Anti-Pattern候補「暗黙の依存」「欠けた依存を宣言削除で直す」 | 本文の大半はPLANの`requires`と`helix graph`の運用でHELIX固有（20–56、69–78）。欄の4項目とAnti-Patternだけが汎用の候補 |
| D01-M05 | LEGACY-ASSET-E5858DF0B85B6C5CEB64 | `docs/skills/system-design-sizing.md` | 33–44、46–57 | f4061259c9314ed74e9ab6eff07c12fceb8b0445856f0d52e556688e7ceb46bf | AI agent層を含むsystemは外側のsystemと agent層を2段で設計・検証する（W-model）判断、L4で記録するsizing（module数、state面、外部依存、test複雑度、分割判断） | Pattern候補「agent層を持つsystemの二段設計」、Design Unit候補「sizingの記録欄」 | 「two-sprint estimate」（64）等の工数目安は数値・運用で持ち込まない。W-modelはHELIX用語。汎用性は未評価 |
| D01-M06 | LEGACY-ASSET-CCD44CF48D8238641AF6 | `docs/skills/tech-selection.md` | 30–55、57–67 | bf9ea80a953827965f25aa170f0e57eb943742330db94e1c3a761b173685eeed | 比較memoの欄（問題、測れる・反証できる評価軸、候補、軸×候補の表と各cellの根拠、却下理由、推薦）、人気度を単独の評価軸にしない規則、ADRの状態（Proposed／Accepted／Superseded／Deprecated） | Pattern候補「根拠付きの候補比較」（L2-004の比較材料の形） | 「候補は最小2、最大5」（38）は数値なので持ち込まない。評価軸に必ずHELIXの運用制約を入れる規則（54–55）はHELIX固有。BRAINは選択をしない（L2-004、L2-012）ので、推薦の欄は製品側の判断として扱う |
| D01-M07 | LEGACY-ASSET-C1F5640F641677178448 | `docs/skills/design-tailoring.md` | 43–67、83–93 | 5f77887317ab0473af43e626581889f49d44e95f56f339d8c93480eb0d9ae98e | 書くか対象外にするかの基準（関心事が構造的に無いときだけ対象外）、高信頼の対象（auth・payments・PII・不可逆）では脅威model・runbook・rollback設計を省かない、判断の自由度の高低（規約準拠と構造選択）を分ける | Pattern候補「設計の対象外判定」、Part候補「自由度の分類」 | 3つのdevelopment style等の語はHELIX固有。「Anthropic skill authoring best practicesのdegrees-of-freedom」（85–86）の出典は二次的で、原典は未確認 |
| D01-M08 | LEGACY-ASSET-D68CEADABCBECF13EFCB | `docs/skills/judgment-core.md` | 46–69、130–141 | e0c0fc7c3c813ba59e434ea19dad3f54e90f2b7bd8e1b5151c572a06b3d3c1e8 | 不可逆性と影響半径を先に見る、採用案に最低1つの対案と比較を付ける、スコープ規律。reviewの5軸（Correctness、Readability、Architecture、Security、Performance）とArchitecture軸の確認点（既存境界、依存方向、抽象化粒度、技術的負債） | Part候補「architecture判断の問い」「architecture reviewの確認点」 | AI agentの判断規律として書かれており、設計知識と運用規則が混在する。エスカレーション境界（51–55）はHELIXの運用規則でありBRAINの知識にしない |
| D01-M09 | LEGACY-ASSET-F917D3633DEB1097048E | `docs/skills/code-minimalism.md` | 73–82 | d4dd7517112f27462e5d081d787e5da3271b610b88f5b6a7fc5d15624f9e7a3c | 依存を足す判断（他人の負債の引受け）、採用前に答える4点（保守の継続、保守者の数、読めるか、撤退経路） | Pattern候補「外部依存の採用判断」 | 「最終リリースが1年以内」（79）は数値なので持ち込まない。既存DT-SDOP-005（外部依存の選択）と重なる。素材として参照し、重複recordにしない |
| D01-M10 | LEGACY-ASSET-DDEE27A6A7686A490CA5 | `docs/skills/design-doc.md` | 37–43 | 3a5950cce34b22f14df9deb738e8d3f0a51369dd9ae090be99bfaaeb4a43c9c1 | 層ごとに描く図（画面遷移、状態遷移、sequence、component、ER） | Part候補「architectureを表す図の種類と目的」 | 層番号は旧世代のもの。現行の層へ番号を写さない（AGENTS.md）。Mermaid／D2の選択（30–35）は表現toolの話で素材にしない |
| D01-M11 | LEGACY-ASSET-5429AA05B022E9F49B0A | `docs/design/harness/L1-requirements/nfr.md` | 100–129 | 4853a43c5ea12354dc2dab20dc3a52b15ff6be075e49fdaf1bff26280e992122 | 非機能要求をIPA非機能要求グレードの大項目とISO/IEC 25010の品質特性の2軸でtagする表、対象外にした特性とその理由 | Design Unit候補「非機能要求の2軸の分類」（INFRA-004の非機能→Patternの辿りとも関係） | 行はHELIX自身のNFR-01〜17で固有。台帳の分類は`RequirementSourceSnapshot`（r3）。分類の形だけが汎用候補 |
| D01-M12 | LEGACY-ASSET-EC07511FF3E241F15359 | `docs/design/design-catalog.yaml` | 915–919、1090–1096 | 4cf182ed5e983bb36cf0f61d69f2749c19b6612e5311aafbe2cb73dee6321864 | 旧HELIX自身が「性能設計書」を`todo`（cache・索引・N+1等の専用設計が無い）と記録していたこと。「設計原則（7つの柱）」の出典がL0 charterであること | gapの根拠（素材ではなく欠落の記録） | 旧の自己評価であり、現行の判断ではない |

旧の`.claude/agents/`は旧世代のAI設定であり、設計の観点の出典として読んだだけである（AGENTS.md）。本領域では直接の素材にしていない（D02〜D08で扱う）。

## 2. 既存scaffold素材のうちこの領域に当たるもの（参照のみ）

| 素材 | 当たる箇所 | 扱い |
|---|---|---|
| `scaffold/research/design-template-seed-minimum-gap-20261004/templates/DT-MSG-005-composite-architecture.md` | 構成体の境界、構成要素、依存の向き、end-to-endの流れ | 設計templateとして既にある。本書はその欄を知識recordとして再定義しない |
| `scaffold/research/design-template-seed-sdop-20260929/templates/DT-SDOP-002-nonfunctional.md` | 非機能（IPA大項目の枠） | 非機能の値の欄は既にある |
| `scaffold/research/design-template-seed-sdop-20260929/templates/DT-SDOP-005-dependencies.md` | 外部依存の選択と更新管理 | D01-M09と重なる |
| `scaffold/research/design-template-seed-sdop-20260929/templates/DT-SDOP-007-design-review-quickcheck.md` | 設計reviewの最低限の問い | D01-M08と重なる |
| `scaffold/research/design-pattern-inventory-20260925/README.md` | 候補束「システム構成・境界・外部接続」、設計パターン候補「依存関係を有向グラフで表す」「要求から型付き構造を導く」 | ZIP由来の候補。重ねて棚卸ししない |
| `scaffold/verification-test-template-seed-20261001/materials/reference-repositories.md` C2・C4、A6 | MADR／log4brains／adr-tools、dependency-cruiser／ArchUnit、ISO/IEC 25010 | 外部参考として既に挙がっている。本書では再掲しない |

## 3. 外部の一般的な参考（観点の名前のみ）

採用・技術選定ではない。BRAINへ外部情報を知識候補として入れる経路はHELIXBRAIN-L2-026・027（`version_target: 2.0`、LABO経由）であり、ここに名前を挙げることはその経路の代わりにならない。旧資産で欠けている観点を示すためだけに挙げる。

| 名前 | 出典の種別 | 埋める観点 | 留意点 |
|---|---|---|---|
| ISO/IEC/IEEE 42010（architecture description） | 国際規格 | 関心事（concern）、視点（viewpoint）、view、判断の根拠を分けて記述する枠。旧はarc42の章立てだけを使い、viewpointの定義を持たない | 規格本文は有償。本文を写さない。版は要確認 |
| C4 model | 公開されたmodeling手法（https://c4model.com/） | context／container／component／codeの段階で図の詳しさを揃える観点。旧D01-M10は層ごとの図の種類だけで、詳しさの段階を持たない | 文書の利用条件は要確認 |
| ATAM（Architecture Tradeoff Analysis Method） | 研究機関（CMU SEI）の技術報告 | 品質特性のscenario、感度点、trade-off点、riskの洗い出し。旧D01-M01は品質目標→決定の一方向の表で、trade-offの記述欄を持たない（L2-004の比較軸の材料） | 手法の全手順を持ち込むと重い。観点の名前に留める |

## 4. gap（旧にも既存素材にも無い観点）

| gap | 根拠 |
|---|---|
| 品質特性どうしのtrade-off（性能と整合性、可用性と費用等）を並べる知識 | 旧はD01-M01の一方向の表のみ。L2-004は比較を求めるが、比較軸の素材が無い |
| 性能の構造（cache、索引、N+1、負荷の集中点）をarchitectureの判断として扱う知識 | 旧の台帳自身が性能設計書を`todo`と記録（D01-M12、design-catalog 915–919）。DT-SDOP-002 Bは値の欄で、構造の知識ではない |
| architecture style（monolith、modular monolith、service分割、event駆動等）の適用条件・負の例 | 旧資産では、style名は語として出るだけで、比較やnegative caseの記述は見つからなかった（§5） |
| viewpoint／viewの定義（誰の関心事をどの図で示すか） | D01-M10は図の種類だけ |
| architectureの退化（境界の侵食、依存の逆流）を時間経過で見る知識 | D01-M03は設計と実装の差の検出だけで、退化のpatternの記述は無い |

## 5. 検索範囲と結果

- 範囲：`docs/skills/`（61件の見出し）、`.claude/agents/`（21件）、`docs/adr/`（ADR-001〜010）、`docs/design/harness/L1`〜`L5`、`docs/design/helix/L4-basic-design/`の見出し、`docs/design/design-catalog.yaml`の`basic`・`std`・`common`区分。
- 語：`architecture`、`アーキテクチャ`、`方式`、`依存`、`trade-off`、`monolith`、`microservice`、`modular`、`arc42`、`25010`。
- 結果：汎用の構造知識は少ない。旧の方式設計（D01-M01）とADR（D01-M03）はHELIX-HARNESS自身の判断で、汎用にできるのは問い方・欄・原理の部分に限られる。`microservice`（英語・日本語とも）は旧資産の本文に見つからなかった。`monolith`はHELIX自身のCLI・doctorのfile分割（`docs/design/harness/L5-detailed-design/module-decomposition.md` 112「CLI / doctor monolith分割方針」等）に語として出るだけで、architecture styleの知識ではなかった。`modular`はISO/IEC 25010の品質副特性名（D01-M11、nfr.md 114・118）として出るだけだった。ADR-001・004〜006・008〜010はHELIX自身の技術選定（言語、CLI framework、配布、release、runtime）で、architecture知識の素材にしなかった。
- D02との境目：依存の向き（D01-M03・M04）はsystem全体の構造としてD01に置き、1つのapplication内の層と責務（be-logic、source-boundary-architecture）はD02に置いた。この切り方は本書の仮置きで、領域の意味はHELIXBRAIN-L2-001で決める。

## 6. BRAIN L2の知識の属性を付けるときの未決事項

状態は全件「未評価の候補素材」とし、採用済みにしない（L2-007、L2-025）。

| 属性 | 未決事項 |
|---|---|
| 由来（L2-007 source／provenance） | 旧HELIXの文書を「内部の実績」（L1・L2版境界の1.0 seed）として扱うか、「旧世代の判断記録」として扱うかが未決。D01-M01・M03は実際にHELIX-HARNESSで採られた判断で、実装の成否（ADR-002 Follow-upの最小slice）とは別に扱う必要がある |
| 適用scope（L2-003 applicability、L2-011） | D01-M03の「安定核への一方向依存」をHELIXの単一binary・CLIの文脈から一般化してよいか。一般化はL2-011の「一般化を事実扱いしない」に当たるため、一般化の根拠をどこで確かめるか未決 |
| 評価根拠（L2-007 evidence） | 旧の判断は旧test・旧CIで確かめられていたが、それを証拠にしない（AGENTS.md）。新世代での評価はLABO（L2-020）を経る必要があり、評価の対象revisionが未決 |
| 限界・反例（L2-003 negative case、L2-010） | 旧資産は却下した代替案（D01-M03）は持つが、方式が失敗した例はほぼ無い。negative caseの供給元が未決 |
| 版（L2-008） | 旧資産は旧世代の一時点（`legacy-generation-2026-09-14`）。知識recordの版を旧の文書revisionに結ぶか、BRAINで新たに振るか未決 |
| 状態（L2-008、INFRA-017のmaturity） | 全件「未評価の候補素材」。experimental／observed等のどの状態から始めるかは本書で決めない |
| 領域の帰属（L2-001） | D01とD02の境目、D01-M11（非機能の分類）をD01に置くかD07等と共有するかは未決 |
