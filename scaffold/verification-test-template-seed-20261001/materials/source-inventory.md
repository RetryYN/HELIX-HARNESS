# 材料棚卸し 01：設計テンプレseed・検証／テスト手法の既存資産（現行scaffold・要求・旧HELIX）

status: scaffold（調査材料。採否、要求、設計、実装の決定ではない）
authority_effect: none
binding: [SCF-B-0153](../../bindings/SCF-B-0153.json)

> 本書は2026-10-01に`origin/main` `479d5f95`で作った。`6404579a`までの差分は監査記録2件だけで、本書が引く行番号は変わらない。

- 基準：`origin/main` = `479d5f95a0756a4a797a9ebaa4599352bf79790c`（2026-10-01 fetch）。`git show origin/main:<path>` で読んだ。
- 性質：read-only棚卸し。repositoryの変更、旧CLI・hook・runtime・test・CIの実行はしていない。本書は材料であり、採否・要求・設計の決定ではない。
- 行番号は `git show origin/main:<path> | cat -n` の行番号。旧HELIXのpathは `archive/legacy-generation-2026-09-14/root/` を省略して書く（表中「旧」）。
- 旧資産のasset IDは `docs/governance/legacy-asset-disposition.jsonl`（4020行）の `source_path` 完全一致で引いた。引いた全件が `asset_class: Historical`／`disposition: unresolved`（要求source snapshotの3件だけ `RequirementSourceSnapshot`／`source_snapshot_preservation`）である。つまり**旧資産の再利用はまだ一件も決まっていない**。

---

## 1. 現行scaffold seedの内容

### 1.1 `scaffold/design-template-seed-sdop-20260929/`（SCF-B-0152）

出典：README.md 1–75。PO提供のClaude skill「system-design-ops-playbook」（15ファイル）を、設計テンプレseed候補7件と、OS司会進行の材料1件に分けたもの。原本は `archive/reference-sources/system-design-ops-playbook-2026-09-29.zip`（SHA-256 `f8b34013…0d73`、README 6–7）。

- 状態：`status: scaffold`、`authority_effect: none`（README 3–4）。版は全件 `0.1.0-seed-candidate`（README 63）。
- 契約項目の根拠：DST-HARNESS-002・005（README 24）。旧 `design-template-json-authority.md` L4 §1・§4 の項目集合とfail-closeの考え方を**保持**し、JSON正本・閉じた式木は**変更**（Markdown表で持つ。schemaはL3以降で選ぶため。README 25）。
- 撤去条件：正式registryとseedが入ったら `scfctl check-replacement SCF-B-0152` → `retire`（README 75）。

#### 各templateの契約欄（全件「## 契約（seed候補）」表＋「不成立例（negative oracle）」＋「完了条件」の3部構成）

| ID | 対象 | 適用条件（行） | 必須入力（行） | negative oracle（行） | 完了条件（行） | 本体section |
|---|---|---|---|---|---|---|
| DT-SDOP-001 ログ設計 | 稼働中に動作記録を出す実行物 | 10 | 11（利用者・場面、機密区分、実行環境、保存法令） | 16–22（5件：利用者なし、相関ID伝搬未定、マスキング方式未定、本番level未定、保存期間空欄） | 24–26 | §1目的と利用者〜§9権限・費用（37–106） |
| DT-SDOP-002 非機能・運用 | 稼働・運用される対象 | 10 | 11（種別、重要度、規模、環境、法令・規格） | 16–23（6件：値のない記述、全項目最大、N/A理由なし、平均値だけ、RPO/RTOに復元テストなし、決定者なし） | 25–27（**値ごとに測定方法と合否閾値をL11受入へ結ぶ**） | A可用性〜F環境、IPA中項目表（39–103） |
| DT-SDOP-003 保守性・監視・ランブック | リリース後に稼働・保守される対象 | 10 | 11（SLO、運用体制、deploy/rollback手段、backup対象） | 16–22（5件：原因指標だけのalert、無人alert、runbookなし、復元未試験、rollback不可） | 24–26 | §1要素ごとの方式、§2アラート、§3ランブック（39–73） |
| DT-SDOP-004 ロジック設計 | 条件分岐規則・状態・外部副作用を持つunit／connection | 10 | 11（業務規則と状態、外部サービス、重要度） | 16–23（6件：「?」残し、状態×イベント空欄、異常系4問未回答、冪等方式なし、**表の行・マスがテストケースへ未対応**、AIが業務規則を補完） | 25–27（**§7で全行・全マスを検証へ結ぶ**） | §1ユースケース、§2デシジョンテーブル、§3状態×イベント、§4異常系4問、§5冪等性・排他、§6深さ、§7検証への対応（40–72） |
| DT-SDOP-005 依存関係 | 外部依存を持つ対象 | 10 | 11 | 16–22（5件） | 24–26 | §1〜§6（37–63） |
| DT-SDOP-006 AWS初期設計 | AWSを選んだ対象に限る | 10 | 11 | 16–24（7件） | 26–28（早く決めすぎないものは仮値＋見直し時点） | §1〜§7（40–87） |
| DT-SDOP-007 設計レビュー最低限確認 | 001〜006を横断するreview | 10 | 11 | 16–19（2件：問いだけで個別完了条件を飛ばす、根拠なし「はい」） | 21–23 | 判断の軸7項目（25–35）、問い（37–） |

各表の共通行：template ID／版（7）、状態（8）、想定する持ち主（9：汎用構造はHELIX-BRAIN、製品適用はHELIX-HARNESS-CORE／HARNESS-L2-009）、適用条件（10）、必須入力（11）、関係（12）、出典（13）、限界（14）。

#### DT-SDOP seedのgap（DST-HARNESS-002／005、HARNESS-L2-041／043との差）

| 要求された項目 | DT-SDOP seedの状態 |
|---|---|
| ID・version | あり（全件 `0.1.0-seed-candidate`） |
| applicability | 自由文。rule／branch単位のIDなし（L2-043のrule/branch分母が作れない）。旧の閉じた式木は意図的に未採用（README 25） |
| 必須input／section／field | input・sectionはある。**field単位の必須／任意・値型・cardinalityはない**（旧L5 §2 section/field契約との差） |
| relation | あり（「関係」行） |
| owner | あり（「想定する持ち主」行） |
| negative oracle | あり（全件）。ただし**canonical positive例がない**（L2-043は全rule/branchにpositive＋境界negative各1件以上を要求） |
| measurement | **明示欄なし**。002完了条件に「測定方法と合否閾値をL11へ結ぶ」、004 §7に「テストケースID」表があるだけ。metric ID・unit・threshold・N/A authority（旧L5 §2、HARNESS-L2-034の14項目）を持たない |
| completion | あり（自由文） |
| supersession | **欄なし** |
| 出典・採否・適用範囲・限界（DST-005） | 出典・限界・適用条件あり。採否は「状態」行で「採否なし」 |
| required／conditional／N/A／unresolvedの判定と理由・判断者・対象revision・再評価条件（DST-006） | N/Aに理由を求めるだけ。判断者・revision・再評価条件の欄なし |
| V-pair（layer／pair_layer、対検証template） | **欄なし**（旧L5 §2 `layer/pair_layer`、`verification.pair template ID`に当たる物がない） |
| unit／connection／compositeの別（DST-003） | 004だけが「unitまたはconnection」と書く。他は区分なし |
| 最小seedの4領域（requirements 79–82） | unit behavior/state/failure（004）、operation/observability（001・003）、external interface（005）、capacity/security（002・006）は部分的に被覆。**connection contract（direction、ordering、timeout、retry、partial failure）、data/permission/privacy/migration/rollback/testabilityの専用seedはない** |
| 検証手法・テスト手法のtemplate | **ない**。DT-SDOPは設計templateのみ。検証側は004 §7と002完了条件の「結ぶ」だけ |

### 1.2 `scaffold/design-template-seed-sdop-20260929/os-decision-facilitation-input.md`

- 材料の性質：OSの「決める事項の司会進行」の意味atom A〜F（22–76）。WBS台帳候補WBS-OS-001〜008、HELIXOS-L2-039、HARNESS-L2-045、HARNESS-L2-009／DST-HARNESS-001〜007との関係表（12–20）。
- 検証・テストに関係するatom：B1 STRIDE（36）、B2 FMEA（37）、B3リスク登録簿（38）、B4プレモーテム（39）、C4デシジョンマトリクス（48）、E1 PoC／スパイク（65）、E2 SLO設計（66）、**E3 性能試験・障害訓練で設計が要件を満たすかを実測（67、行き先の見立て「検証側（L11・受入）の手法」）**、E4 PoC・プロトへのログ差し込み（68）。
- 2026-09-30外部見解（85–99）：「手法ごとに適用条件、必要入力、確認する問い、期待する成果物、完了を示す証拠、責任者、参照資料の版を持たせる」＝templateと同じ契約で手法を持てる（91）。「SLO・PoC・性能試験・障害訓練 → 計測と合否の証拠」（92）。境界：手法の指摘を自動で新要求へ昇格させない、比較表の高得点で安全必須条件を相殺しない（99）。
- 未決（105–111）：未決事項リスト・リスク登録簿の置き場、ADRの置き場、D2深さの層対応、PoCログ差し込みの版。
- gap：手法（STRIDE、FMEA、性能試験、障害訓練等）は**名前と行き先の見立てだけ**で、template契約化されていない。

### 1.3 `scaffold/design-pattern-inventory-20260925/README.md`

- 性質：`research_scaffold`、`authority_effect: none`（3–4）。旧ZIP「ハイブリッド設計ドキュメントv1-fixed」（SHA-256 `9c547ba8…`、5–6）のcatalog 22区分・179項目、8 profile（PoC／Standard／Enterprise／Web／Mobile／Desktop／CLI／APIService）の調査（16–28）。
- 候補束（34–48）のうち検証関連：**「検証・受入・テスト」束（44）**＝`verification`・`test_tech`・`test_data`・`coverage_crit`・`contract_test` 28、`bdd` 29、UT/IT/ST/AT 06〜09、性能・security test 101/102。雛形がある番号は06〜09、28、29（62）。101・102は`docs/`の記述例だけ。
- 「運用・復旧・観測」束（45）、「AI agent・ガードレール」束の`ai_verification` 49（48）。
- 旧HELIX採用記録21 entryに `docs/29_受入基準・BDDシナリオ.yaml`（126）。旧matrix HVM-ADOPT-03（traceability/deps/impact）、HVM-REJECT-01〜03（Python generator移植・53文書一律必須化・Excelを完了証跡正本にすることを不採用、101–103）。
- 契約欄：なし（調査表）。ID体系・version・negative oracle・measurement・supersessionは持たない。
- gap：テスト技法カタログ（`test_tech` 28）と網羅基準（`coverage_crit`）の**中身はZIP内で未抽出**。ZIPはread-onlyで、内容の意味atom化は未実施。

### 1.4 `scaffold/external-references/`

- 中身は `SCF-B-0003.json` の1件のみ。GUI mailboxの現行loader（`~/.claude/CLAUDE.md`等のmanaged block、`scaffold/review-handoff/gui_mailbox.py`）のbindingであり、**設計template・検証・テストの材料ではない**。本棚卸しの対象外。

---

## 2. template契約の要求（新seedが持つべき欄）

### 2.1 `docs/helix-brain/candidates/design-template-system-requirements.md`

- 状態：`draft_candidate`／`awaiting_human_approval`（3–4）。BRAINのL1後に採否（40）。
- 担当（30–38）：DST-HARNESS-002・005はHELIX-BRAIN、001・003・004・006・007はHELIX-HARNESS-CORE（HARNESS-L2-009）。DST-OS-001は汎用版＝BRAIN、使用exact set＝OS。DST-OS-004の評価はLABO。
- DST-HARNESS-001（56）：requirement kind、subject、relation、risk、domain、layer／pairからexact setを選べる。
- **DST-HARNESS-002（57）：ID、version、applicability、必須input／section／field、relation、owner、negative oracle、measurement、completion、supersession。**
- DST-HARNESS-003（58）：unit／connection／compositeごとに異なる設計義務。要求identity → 義務 → 設計成果 → 対検証へ辿れる。
- DST-HARNESS-004（59）：必須inputの欠落を質問・矛盾・derived requirement candidate・N/A判断候補としてbackflow。
- **DST-HARNESS-005（60）：出典・採否・適用範囲・限界・negative caseを持つ最小seed pack。seedを普遍的正解としない。**
- DST-HARNESS-006（61）：required／conditional／N/A／unresolvedの判定と、理由・判断者・対象revision・再評価条件。
- DST-HARNESS-007（62）：更新時のsemantic impact、旧版利用をstaleとして識別。
- DST-OS-001〜005（66–72）：registryでcurrent／seed／候補／retiredを区別、unknown/conflict保持、同一因果での管理、利用結果から改善候補、未登録・stale等で任意templateへfallbackしない。
- seedの作り方（74–88）：空白から一人のAIで作らない。archive template・実成果・失敗事例・一般設計領域をsource inventoryへ入れ、意味atomごとに採択。最小seedの4領域（79–82）。templateの存在は要求充足・設計完成・検証成功を証明しない（84）。

### 2.2 `docs/helix-harness/L2-requirements/product-requirements.md`

- 「Design Templateと要求backflow」（62–68）：DST-HARNESS-001/003/004/006/007をHARNESS-L2-009の適用待ち具体化として保持。Forward＝合意要求から適用templateと設計義務、Backflow＝必須input欠落をHARNESS-L2-008へ。template本文・生成文書・旧schemaから要求意味・人間合意を生成しない。初期seedはarchiveと実例から意味を個別採否。
- 検証template・テスト手法に関わる隣接候補（いずれも未採択）：

| 候補 | 行 | 要点（検証・テスト材料として） |
|---|---|---|
| 新世代CIへ渡す検証契約（NCI-HARNESS-001..004） | 126–135 | layer・V-pair・artifact class・変更種別・riskから検証義務。上流意味review／設計検証／実装test／受入／運用評価を一つの`CI green`へ畳まない。旧CI job集合を分母にしない。NCI本体は `docs/helix-harness/candidates/next-generation-ci-requirements.md` 22–25（対象revision、入力、oracle、expected failure、証拠形式、有効期限、差戻し先；required/conditional/informational/N/A） |
| HARNESS-L2-022 検証と受入の契約 | 447–461 | Provisional→Integrated（L8↔L5、L9↔L4）、→Verified（L10↔L3）、→Accepted（L11の成功条件と反例）。L10合格でL11を合格にしない |
| HARNESS-L2-030 scenario・case・data・double生成 | 607–625 | case family＝boundary、permission、cancel、ordering。double＝選択外部契約の限定stub。生成case数・coverageを品質証拠にしない |
| HARNESS-L2-031 最小再現と回帰候補 | 627–645 | log/input縮小、同一oracle failure維持、再現不能の明示。test削除/skip、oracle弱化、coverage数値で修正成功を主張しない |
| HARNESS-L2-032／033 実行接続・failure-to-regression trace | 647–685 | 回帰成立＝縮小前後同一failure＋修正前fail＋修正後pass |
| 候補関係と1.0境界 | 687–689 | **必要case数、coverage率、mutation閾値、reduction上限は未採択** |
| HARNESS-L2-034 要求別の計測契約 | 693–717 | 14項目（metric ID、対象requirement/NFR、測定対象、workload/environment/data、baseline、target/SLO、許容差、sampling/window、tool/probe、evidence schema、判定oracle、owner、実行layer、再測定trigger）（698）。13品質領域（699）。**714：fault injection、race、soak、crash recovery、property-based、model-based state machine、differential、mutation、fuzz、snapshot compatibilityをriskから選び、選択/非適用の根拠を残す。手法追加を完成証拠にしない** |
| HARNESS-L2-036 検証観点の完全性とlocal/CI同一契約 | 730–775 | 観点抜け・レベル間重複0件、画面対象の5軸（mock-promotion、design-token-drift、a11y-regression、visual-regression、state-transition-drift）決定論判定（748）。旧FR-L1-21/22、NFR-06/13（770–773） |
| HARNESS-L2-040 全層ledger契約 | 946–955 | canonical pair＝L1↔L12、L2↔L11、L3↔L10、L4↔L9、L5↔L8、L6↔L7（949）。ledgerにentry/exit gate・適用template版 |
| HARNESS-L2-041 active templateのobligation抽出とgap | 957–966 | 章、field、table row、applicability rule、done-when、pair contractを原子的obligationとして抽出。空/TBD・抽出不能・重複はgap |
| HARNESS-L2-043 rule／branch別例coverage | 986–998 | **全適用rule/branchに canonical positive例と境界negative例を各1件以上**。example adequacy matrix |
| HARNESS-L2-044 design obligation portfolio | 1002–1011 | interface/data/state/event/failure/security/observability/operation、V-pair oracle等の義務class→normative contract 1件 |

### 2.3 新しいtemplate seed（設計・検証手法・テスト手法の共通）が持つべき欄の合成

DST-HARNESS-002・005・006を必須核とし、L2-034・041・043・NCI-002を検証側の追加として重ねると次になる（現行要求の文言からの合成であり、新しい規則の新設ではない）。

| 欄 | 根拠 | DT-SDOPにあるか |
|---|---|---|
| template ID／version | DST-002 | あり |
| 状態（seed候補／採否） | DST-005、DST-OS-001 | あり |
| owner（BRAIN汎用／HARNESS-CORE適用） | DST-002、requirements 30–34 | あり |
| applicability（rule/branch単位に識別可能） | DST-001・002、L2-043 | 自由文のみ |
| 適用判定（required／conditional／N/A／unresolved＋理由・判断者・対象revision・再評価条件） | DST-006、NCI-003 | N/A理由のみ |
| 必須input（欠落時のbackflow先） | DST-002・004 | inputのみ、backflow先は「未決事項リスト」 |
| 必須section／field（field単位） | DST-002、L2-041 | sectionのみ |
| relation | DST-002 | あり |
| layer／pair（対の検証template・対oracle） | L2-040、旧L5 §2 | なし |
| unit／connection／composite区分 | DST-003 | 004のみ |
| negative oracle（不成立例） | DST-002・005 | あり |
| canonical positive例＋境界negative例（rule/branchごと） | L2-043 | positiveなし |
| measurement（metric ID、unit、threshold、N/A authority。計測対象ならL2-034の14項目） | DST-002、L2-034 | なし |
| completion（done-when） | DST-002、L2-041 | あり |
| expected failure・証拠形式・有効期限・差戻し先（検証手法template） | NCI-002 | なし |
| supersession（旧版のstale識別） | DST-002・007 | なし |
| 出典・限界 | DST-005 | あり |

---

## 3. 旧HELIXの関連資産（archive/legacy-generation-2026-09-14/root）

V-pairは現行canonical（L1↔L12、L2↔L11、L3↔L10、L4↔L9、L5↔L8、L6↔L7）で示す。旧文書は層番号が混在する（下の注意を参照）。

### 3.1 設計template authority系

| 旧path | asset ID | 定義しているもの | V-pair | seed材料としての再利用性 | 持ち込まないもの |
|---|---|---|---|---|---|
| `docs/design/helix/L4-basic-design/design-template-json-authority.md` | LEGACY-ASSET-4F5A1F0739EC1111D91D | template／instance／graph JSON／generated view／supplementalの責務表（21–28）、6 component（Registry、ApplicabilityEvaluator、ShadowCompiler、ViewProjector、PortfolioPlanner、PairGraphBinder、34–41）、data flow（48–56）、閉じた式木applicability（63–81）、**completionのexact set 7項目（83–91：必須section/field coverage、trace、negative oracle、measurement/threshold or 根拠付きN/A、V-pair edge、unresolved 0 or owner付きdefer、revision digest一致）**、shadow移行（95–101）、設計Refactor gate（105–113） | L4↔L9（pair：`docs/test-design/helix/L4-design-template-json-authority-system-test-design.md`、10行目） | 高。契約項目集合とcompletion 7項目は、DT-SDOP READMEで既に「保持」と宣言済み（README 25）。completion exact setとN/A（reason・authority・re-evaluation trigger、81）はDST-006に直結 | JSON正本化の前提（新世代schemaはL3以降で選ぶ）、`docs/design/design-catalog.yaml`、shadow cutover手順、Requirement JSON connector前提 |
| `docs/design/helix/L5-detail/design-template-json-authority.md` | LEGACY-ASSET-98372FEE8A3AC8F9C299 | schema family 4種（20–25）、**template必須field 18個（33–51）**、identity/lifecycle（`candidate→verified→approved→canonical→deprecated`、56–63）、section/field契約（67–69）、trace／verification（pair template ID、required oracle class、negative oracle、stale条件）／measurement（metric ID、unit、threshold/operator or authority付きN/A）／completion（74–77）、predicate三値（`applicable｜not_applicable｜evaluation_error`、97–99）、registry exact set・latest暗黙解決禁止・deprecatedの要件（103–108）、shadow parity 5条件（138–147）、finding code 12種（151–164） | L5↔L8（pair：`L5-…-integration-test-design.md`、10行目） | 高。**supersession（`supersedes`、59）、deprecatedのreplacement/consumer/retention/removal trigger（108）、field単位契約、verification/measurement欄**がDT-SDOPの欠落欄をそのまま埋める材料 | `TPL-`接頭辞・整数版・`additionalProperties:false`等のJSON Schema実装指定、`helix-design-*.v1` schema ID |
| `docs/design/helix/L6-function-design/design-template-json-authority.md` | LEGACY-ASSET-EF18357A994D043719D5 | pure関数4本の型・DbC（`validateDesignTemplate`、`validateDesignTemplateRegistry`、`evaluateTemplateApplicability`、`compileTemplateShadowReport`、`verifyGeneratedDesignView`、36–145）、missing factをfalseへ丸めない（101）、depth 16／node 256（102）、容量上限（149–151） | L6↔L7（frontmatterのpairは旧番号 `L8-…-unit-test-design.md`、10行目） | 中。seed本文ではなく、後段のL5/L6設計時の参照。applicabilityの三値とunknown非丸めの考え方は検証template側でも使える | `src/design/design-template-authority.ts`、zod、`requirementIrSemanticDigest`再利用指定（155–157）等の実装・runtime指定 |
| `docs/test-design/helix/L4-design-template-json-authority-system-test-design.md` | LEGACY-ASSET-B69B18EBA9D1D21370D5 | ST-DTJ-001〜010（16–27）：exact selection、unknown fail-close、欠落field→completion false、normative owner重複、generated view直接編集拒否、legacy green/JSON red不成立等 | L4↔L9 | 高（**template system自体の検証case seed**）。「template contract template」の反例集に使える | 旧`executed_at_layer`等frontmatter、Markdown削除によるJSON再現の前提 |
| `docs/test-design/helix/L5-design-template-json-authority-integration-test-design.md` | LEGACY-ASSET-F68FCEF7D82C4F7FA1EB | IT-DTJ-001〜014（**mutation列を持つ表**、16–31）：field混入、ID重複、digestずれ、applicability不正、trace欠落、pair欠落、measurement欠落…を各1 oracleでkill（33–34） | L5↔L8 | 高。「1 mutation＝1 oracle、別fieldのgreenで相殺しない」形式は検証case templateの型に使える | finding codeの文字列そのもの（新schema未選定） |

### 3.2 UI domain・pattern profile系（画面系template・fixture選定）

| 旧path | asset ID | 定義しているもの | V-pair | 再利用性 | 持ち込まないもの |
|---|---|---|---|---|---|
| `docs/design/helix/L4-basic-design/ui-domain-pattern-profile.md` | LEGACY-ASSET-6CA69452C93A2DDBA42C | capability境界（27–35）、system assertion SA-UDP-01〜03（42–46：実L2 doc全件通し、実profile/contract/pack同時load、risk matrix→fixture→実行計画接続） | L4↔L9 | 中 | Issue番号（#177/#209/#211/#257）、`forward_full_v`／`screen_design` route名、design-reality-binding marker |
| `docs/design/helix/L5-detail/ui-domain-pattern-profile.md` | LEGACY-ASSET-7453222BF98E95199D46 | UI entity 10種とID接頭辞（42–53）、**Pattern Contract（required[]／forbidden[]、競合fail-close、70–75）**、**UI Profile（情報優先順位、許容pattern/token、responsive、motion＋reduced-motion代替、a11y制約、brand、surface分類、76–80）**、共通Rule Packとproduct値の隔離（81–86）、**risk-based pairwise fixture選定（8軸：device/input/role/locale/data_volume/network/concurrent_update/destructive_undo、全Cartesian禁止、2軸ペア被覆100%＋high risk全件包含＋決定的上限、88–105）**、typed failure 8種（109–116）、freeze条件（146–150：mutation反例つきgreen） | L5↔L8 | 高。UI／画面templateと**組合せテスト（pairwise）手法template**の直接材料 | `config/ui-domain/harness-console-bundle.json`等の実asset、L2 scope値（S9=a等、165–167）、`runFullDoctor`配線 |
| `docs/design/helix/L6-function-design/ui-domain-pattern-profile.md` | LEGACY-ASSET-274F3B01805E76EBA169 | 型（30–43）、API DbC表（47–55）、schema（59–81）、`mode:"pairwise"`以外を型で遮断（83–85）、完了境界＝mutation反例列挙（89–93） | L6↔L7 | 中 | `helix ui-domain check` CLI（54）、`src/design/ui-domain-gate.ts`、doctor |
| `docs/test-design/helix/L6-ui-domain-pattern-profile-unit-test-design.md` | LEGACY-ASSET-10FA01623CBA5F3FF7E0 | U-UDP-001〜005「反例と期待結果」表（21–27） | L6↔L7 | 中（反例表の型） | U-ID・test citationの旧path |

### 3.3 検証計画・検証工程・計測系

| 旧path | asset ID | 定義しているもの | V-pair | 再利用性 | 持ち込まないもの |
|---|---|---|---|---|---|
| `docs/process/forward/L08-L14-verification-phase.md` | LEGACY-ASSET-34DF3B535879CC73FA86 | **canonical pair・gate表（28–35：G7 L6↔L7 unit/TDD、G8 L5↔L8 integration、G9 L4↔L9 system、G10 L3↔L10 機能要件・UX受入、G11 L2↔L11 要求・人間受入、G12 L1↔L12 価値・運用品質）**、**右腕evidence profile（73–79：左腕test basis／右腕test condition／必須evidence）**、外部基準ledger（49–60：NIST SSDF、ISTQB Glossary、WCAG 2.2、Playwright、NASA V&V matrix等、90日stale規則62）、差し戻しルール（197–205）、**QA追加テスト設計の分離原則（213–220：凍結済みテスト設計を書き換えず独立docで追加）**、ペア未凍結のテスト設計の後付け禁止（39、207） | 全pair（L3↔L10〜L1↔L12中心） | 高。V-pairごとの「test basis→test condition→必須evidence」表は**検証方法case templateの骨格**そのもの | ファイル名のL08-L14、G13/G14、`g8-integration-evidence-v1`等のmanifest名、action-binding approval packetの`planOnly`等runtime field（96–104）、`aim`/`qa` role名、Sprint S3/S4 |
| `docs/design/helix/L6-function-design/ci-verification-plan.md` | LEGACY-ASSET-E9998EF887555DBB2751 | Verification Plan合成：local／boundary／global invariant／deferred obligation／execution DAG／full fallback reasonを別field（24）、unknown/high-riskはfull fallback（27–28）、延期obligationのexactly-once割当とreceipt（29–31）、required obligation exact set照合（32）、fail-close finding群（43–45） | L6↔L7（pairは旧番号L8） | 中。検証義務の「省略と回収」の形はHARNESS-L2-005/036と重なるので、手法templateでは参照のみ | CIS-R-07〜09 ID、`defer_targets`（main/nightly/release）、旧Impact CI map、Issue #1207 |
| `docs/design/helix/L3-requirements/scrum-reverse-verification-engine.md` | LEGACY-ASSET-08BD701EF2577835D9F7 | SRV-FR-001〜014（19–34）：**SRV-FR-008 設計エンジンはtest contractに加えverification/measurement contractを生成**、SRV-FR-009 metric contract必須項目、SRV-FR-010 13品質領域の全件適用判定、SRV-FR-011 green相殺禁止、SRV-FR-013 改善の同一条件比較・効果量・分散、完了式（36–40） | L3↔L10（pair：`scrum-reverse-verification-engine-acceptance.md`） | 高（計測・性能改善検証templateの材料）。既にHARNESS-L2-034がこの系譜を再導出済み（709、717） | SR0〜SR4 step名、L5→L7 probe→L8→L9→L10→L11→L12のmeasurement lineage（32、旧番号）、memoryへのrecipe昇格（34） |
| `docs/design/helix/L4-basic-design/measurement-evidence-evaluator.md` | LEGACY-ASSET-5E2592D7BB50EC290C9B | 計測evaluatorの**6独立軸（binding／freshness／representativeness／threshold／baseline／hard limit、48–60）**、green導出・unknown propagation（62–70）、**78–79：property、model-based state machine、differential、mutation、fuzz、snapshot compatibilityはriskに応じて反証へ使う。手法の存在だけでgreenにしない** | L4↔L9（pair：`L9-measurement-evidence-evaluator-system-test-design.md`） | 高（計測判定templateの材料） | `config/nfr-registry.json`、Issue #219/#220/#221、`IT-MEVAL-*` |
| `docs/governance/helix-harness-requirements_v1.3.md` | LEGACY-ASSET-02319C2481B9E01698D5（r3、RequirementSourceSnapshot） | §4.3 検証・計測基盤（245–251：verification_measurement_contractの14項目）、§4.8 HR-NFR-REG-001〜007（363–377：REG-005 fault injection/race/soak/crash recovery、**REG-006 property-based/model-based state machine/differential/mutation/fuzz/snapshot compatibilityをriskで選択、手法追加自体を完成証拠にしない**） | L3↔L10、L1↔L12 | 高。ただし**既にHARNESS-L2-034が意味再導出済み**（product-requirements 709・717）なので、手法templateは034を上流にして重複させない | 旧P4 metric event、NFR registry schema、`nfr-grade.md` placeholder、harness.db／SQLite／vacuum |
| `docs/plans/PLAN-L8-00〜L13-00-*-verification-master.md` | L8 C0856BECE631370BA064、L9 E5597FAC46EE3C54F4A7、L10 D0B1DC6B83D54BB9928E、L11 9C2981C5C85F256DA4D2、L12 E75C138570703C46F9D7、L13 189702B332643A3BFDAF（いずれも`LEGACY-ASSET-`接頭、`legacy_plan_or_work_contract`） | 各層の「coverage／evidence境界」だけ（例：L10 65–68「L2 screen mockの右腕としてUX/WCAG/render evidence」、L11 64–65「PO/S4 decisionを代行しない」、L12 65–66「completion=blockedの間は受入完了を主張しない」、L13 64–65「外部rolloutを別PLAN」） | L8〜L13は旧番号（L10=UX、L11=UAT、L12=受入、L13=デプロイ後）。現行ではL3↔L10／L2↔L11／L1↔L12へ投影（L08-L14 phase 33–35） | **低**。中身は「完了を主張しない」境界の宣言で、手法・case形式を持たない。「未完を隠さない」の根拠行として引用する程度 | frontmatterの`review_evidence`・`green_commands`（`./scripts/helix plan lint`、`bun run test:local`）、`g10-ux-evidence-v1`等 |

### 3.4 テスト設計の型（旧test-design）

- `docs/test-design/helix/`：328ファイル＋fixtures 3件。命名は「設計層-対象-種別」で、L6-*-unit（34件、実行L7）、L5-*-integration（26件、実行L8）、L4-*-system（6件、実行L9）、L3-*-acceptance（4件、実行L10）、L2-screen-ux（1件、L11）、L1-*-operational（2件）。L8-*（158件）は旧番号でL6の対（unit）を多く含む。
- 共通の形：frontmatterに`layer`／`executed_at_layer`／`pair_artifact`、本文は「oracle ID｜scenario（またはmutation）｜合格条件」または「U-ID｜対象｜反例と期待結果｜test citation」の表。

| 旧path | asset ID | 型として使える点 | V-pair |
|---|---|---|---|
| `docs/test-design/helix/L3-pillar-acceptance-test-design.md` | LEGACY-ASSET-44DD86E3DEC09E65EF51 | **量閉じ（§0、41–45：対象要件件数、AC件数、HAT件数、各HATが2 ACを束ね正常/異常または通常/境界を観測）**、pair_group（15–27） | L3↔L10 |
| `docs/test-design/helix/L2-screen-ux-test-design.md` | LEGACY-ASSET-73C1830CFD650CEFDCF3 | L11受入観点表（26–30：ID｜対応AC｜検証観点｜合格条件）、完了境界（32–35：要求整備・pair存在・旧テスト成功を受入完了の証拠にしない） | L2↔L11 |
| `docs/test-design/helix/L1-pillar-operational-test-design.md` | LEGACY-ASSET-A177ACE0F87CF894BA23 | 旧L14運用テストをL2↔L11受入へ移管する際の注意（20–27）、量閉じ1:1（40–44） | L2↔L11（旧L1↔L14） |
| `docs/test-design/harness/L7-unit-test-design.md` | LEGACY-ASSET-FAAFFA616A44F65911EB | 量閉じ（73–80：signature＋DbC＋edge 4観点`@edge-normal/error/boundary/throws`を孤児0で被覆）、**§0.1 テスト戦略と検証戦略の分離（82–91：`fired`/`used`/`works`等の実走claimは単体greenで完了しない）** | L6↔L7 |
| `docs/test-design/harness/L3-acceptance-test-design.md` | LEGACY-ASSET-1B92155F959D7905DD1E | AT表「AT-ID｜対応AC｜受入条件（GWTを変換）｜機械検証」（52）、量閉じ一覧（206–224）、trace（226） | 旧L3↔L12（現行はL3↔L10） |
| `docs/test-design/harness/L8-destructive-command-guard.md` | LEGACY-ASSET-2D3E26DB334327C5694A | 反例表に**grammar metamorphic（13）、failure injection（16）、adapter parity（17）、concurrent CAS（18）、crash point（19）**を名指し | L5↔L8 |
| `docs/templates/design/L6-function-spec-template.md` | LEGACY-ASSET-4CAC3EB72DAD353A64D7 | 旧の**機能仕様template**：対象function表（15–22）、pre/post/invariant（26–39）、error handling表（error｜分類｜期待動作｜test、43–48）、trace（52–58）、**test oracle表（oracle ID｜観点｜Red条件｜Green条件、62–65）**、review checklist（69–73） | L6↔L7 |
| `docs/templates/plan/impl/template.md`、`…/reverse/template.md` | 6720A4FA3E0DB35F9F7B（impl）、design版は9321263244E50124D628 | `pair_artifact`起票時必須、`mutation_oracle_evidence: "…U-<DOMAIN>-001 が seeded defect を kill（exit 1）"`（impl 12–14、reverse 14–15） | L6↔L7 |

### 3.5 規則・skill（検証・テストの考え方）

| 旧path | asset ID | 中身 | V-pair | 再利用性 | 持ち込まないもの |
|---|---|---|---|---|---|
| `docs/governance/ddd-tdd-rules.md` | LEGACY-ASSET-5E22432B0A5A8F7CC8B3 | rule：invariant-test-trace（43–46）、test-oracle-strength（51–54：truthinessだけの検査を禁止）、unit-oracle-substance（59）、**mutation-oracle（63–66：seeded defectをkillする証拠）**、oracle locator解決（77–83）、DDD-INV-001〜006（135–140）、層別配置（144–152：L4/L9＝bounded context境界とsystem/integration oracle、L5/L8＝pre/post/invariant/failure/rollback/edgeと単体・結合oracle） | L4↔L9、L5↔L8、L6↔L7 | 高（oracle強度の規則の出所） | `src/lint/ddd-tdd-rules.ts`、PLAN frontmatter field名、G3 |
| `docs/design/helix/L5-detail/design-reality-binding.md` | LEGACY-ASSET-70DA9B8C03E54A629039 | **failure到達可能性（26–36）**：reasonごとにfixture・expected reason・mutationを宣言し、post-check除去mutationが別結果になる場合だけ成立。`toContain()`だけのassertを拒否。空の`failure_reachability`は完了を表さない | L5↔L8 | 高（negative oracleが「本当に到達するか」の検証手法） | `helix-design-reality-binding.v1` marker、empty-baseline config、Vitest callback要件 |
| `docs/design/harness/L6-function-design/test-before-review.md` | LEGACY-ASSET-4B7E4E22580F0634EA04 | 定量テスト→定性レビューの順序（19、29–34）、GreenDefinition（59–95：profileごとのrequired command） | L6↔L7 | 低〜中（新世代は独立review運用が別にある） | `tests_green_at`・`green_commands`のfrontmatter、doctor配線 |
| `docs/plans/PLAN-L6-29-test-oracle-strength.md`／`PLAN-L6-27-invariant-test-trace.md` | ECEC20B5C2752C16461C／BC306FB27B81B6E4628E | weak oracle（truthiness）検出（50–51）／invariant→oracle trace（50–51） | L6↔L7 | 低（ddd-tdd-rulesに集約済み） | PLAN形式 |
| `docs/plans/PLAN-L3-01-functional-detail.md` | LEGACY-ASSET-E50CAA5FE87C680F7515 | **AC形式＝Given-When-Then、AC数下限＝正常1＋異常1＋境界1（100–101、ISTQB根拠）**、AC ID形式（102） | L3↔L10 | 中（AC template seedの材料。HARNESS-L2-043のpositive＋境界negativeと整合） | G3 lint、`AC-FR-L1-*` ID形式 |
| `docs/skills/test-thinking.md` | LEGACY-ASSET-12A39A2481B480E18FE2 | **壊れ方の視点6軸（44–65：入力ゼロ・一・多・境界・異物／時間と順序／状態遷移表の空欄／権限と境界IDOR／失敗系4パターン／オラクルの出所）**、リスクベース深さ配分（69–79）、探索的テストのチャーター（83–92）、止めどき（107–116）、アンチパターン（120–127） | L6↔L7〜L3↔L10 | **高**（テスト観点templateのほぼ完成した材料） | `helix doctor`、`.helix/audit/`への記録先、judgment-core参照 |
| `docs/skills/testing.md` | LEGACY-ASSET-567EEDD0A72F52B83C26 | test levels表（35–40）、fixture規律（69–76）、coverageとsubstance（78–88）、**characterisation test（99–108）** | L6↔L7〜L4↔L9 | 中 | Vitest、`npm run test`、`.helix/`、`harness.db`、`CLAUDE_PROJECT_DIR`（71–76） |
| `docs/skills/test-driven-development.md` | LEGACY-ASSET-29CB6E703D67926200C7 | Red-Green-Refactor（32–58）、oracle強度規則（70–77：exact値、mockはprocess境界だけ） | L6↔L7 | 中 | `helix doctor`、`helix review --uncommitted`、Vitest native runner注意 |
| `docs/skills/verification.md` | LEGACY-ASSET-B3E589D465867A5A1A1B | coverage≠substance（42–47）、**obligation absence rule（87–91：artifact欠落は中立でなく違反）**、**seeded violation fixtureでexit 1（85）** | 全層 | 中 | `helix vmodel lint`等の検証順序（53–60）、`.helix/audit/*.json` |
| `docs/skills/browser-testing-and-screen-verification.md` | LEGACY-ASSET-8B6EA6DFFE976FAD564A | **9状態マトリクス（53–70）**、違和感の言語化（72–82）、live検証手順（baseline／DOM・a11y／network contract／**visual regressionの差分分類 a/b/c**、84–102）、a11y 3体験＋機械測定値（104–114）、AIの画像判定の限界（116–125）、browser contentはuntrusted（127–133） | L3↔L10、L2↔L11 | **高**（画面検証template材料） | `helix status/doctor/review`（36–40）、`.helix/audit/`、`helix plan use`、`drive` |
| `docs/skills/acceptance-criteria-thinking.md` | LEGACY-ASSET-877A4CD3025063075BFE | ACのTestable条件（45–58：観測可能、GWT、1 AC＝1判定、裏付け手段）、**「Doneの偽装」カタログ（60–76）**、UNCERTAIN（75–76）、探索結果のAC昇格（78–85） | L3↔L10、L2↔L11 | **高**（受入template材料） | S3/S4、`helix doctor`、PLAN `review_evidence` |
| `docs/skills/SKILL_MAP.md` | LEGACY-ASSET-D680061DDE8346D91FE3 | skill索引・trigger表（34–73） | — | 低（索引のみ） | `helix skill suggest`（20–28） |
| `docs/design/helix/L3-requirements/skill-applicability-authority.md` | LEGACY-ASSET-C6052714FB506FB6271E | applicabilityをtyped identity（axis＋id）で持つ、positive/negative極性を別集合、未指定をallへ展開しない（36–49） | L3↔L10 | 中（template applicabilityの極性・非展開の考え方） | `workflow-classification-registry.v1.json`、`drive_models`互換、Issue番号 |
| `docs/design/harness/L1-requirements/functional-requirements.md`（FR-L1-21/22）、`nfr.md`（NFR-06/13） | 6B6C5CB0E481BE01088B（r3）、5429AA05B022E9F49B0A（r3） | テスト観点W字ゲート（抜け・重複）、FE detector 5軸 | L3↔L10、L2↔L11 | 既にHARNESS-L2-036が再導出済み（770–773） | `drive=fe`、hook・GHA名 |

### 3.6 旧資産を持ち込むときの共通の注意（持ち込まないもの）

1. **旧CLI・runtime名**：`helix doctor`、`helix vmodel lint`、`helix plan lint`、`helix skill suggest`、`helix ui-domain check`、`helix review --uncommitted`、`./scripts/helix`、`bun run test:local`、`npm run test`、`runFullDoctor`。
2. **旧状態置き場**：`.helix/`（audit、evidence、config）、`harness.db`、SQLite、`config/*.json`の実asset、`src/**`・`tests/**`のpath。
3. **旧層番号**：旧文書は3系統が混在する。(a) L0〜L14系（PLAN-L13-00、`L08-L14-verification-phase.md`のファイル名、`docs/test-design/harness/L3-acceptance`の「L3↔L12」）、(b) 旧L1–L12系（legacy後期の`canonical_vmodel: L1-L12`）、(c) frontmatterの`layer`と`executed_at_layer`・`legacy_physical_layer`のずれ（例：`L2-screen-ux-test-design.md`は`layer: L10`だが`canonical_pair: L2`、2–7行）。現行へは`L08-L14-verification-phase.md` 28–35の投影表を手掛かりに、現行canonical pair（product-requirements 949）へ読み替え、番号を転記しない（HARNESS-L2-034 701「旧L5／L7等の層番号を新世代へ転記せず」）。
4. **旧ID体系・workflow名**：G7〜G14、S0〜S4、SR0〜SR4、`drive=fe/fullstack`、`drive_models`、`forward_full_v`、PLAN frontmatter（`review_evidence`、`green_commands`、`mutation_oracle_evidence`のfield名）、Issue番号。
5. 旧test・旧CIの合格、旧`confirmed`状態を新世代の合格証拠や承認にしない（旧`L2-screen-ux-test-design.md` 21–22、`L1-pillar-operational-test-design.md` 20–22自身も同旨）。

---

## 4. 旧HELIXが既に名指ししている検証・テスト技法（file:line）

| 技法 | 旧source（行） | 現行で再導出済みの箇所 |
|---|---|---|
| mutation testing／seeded defect／mutation oracle | `docs/governance/ddd-tdd-rules.md` 63–66、140、152；`docs/templates/plan/impl/template.md` 13–14；`docs/test-design/helix/L5-design-template-json-authority-integration-test-design.md` 16–34（mutation列）；`docs/design/helix/L5-detail/design-reality-binding.md` 28–30；`docs/design/helix/L5-detail/ui-domain-pattern-profile.md` 146–150；`docs/skills/test-thinking.md` 37–38（手動mutation）；`docs/skills/acceptance-criteria-thinking.md` 40–41 | HARNESS-L2-034 714；mutation閾値は未採択（689） |
| property-based | `docs/governance/helix-harness-requirements_v1.3.md` 374（HR-NFR-REG-006）；`docs/design/helix/L4-basic-design/measurement-evidence-evaluator.md` 78；`docs/plans/PLAN-L7-683-lite-canary-fast-check-oracle.md` 2・21（fast-check） | L2-034 714 |
| model-based state machine | 同 v1.3 374；evaluator 78 | L2-034 714 |
| differential | 同 v1.3 374；evaluator 78 | L2-034 714 |
| fuzz | 同 v1.3 374；evaluator 78 | L2-034 714 |
| snapshot compatibility | 同 v1.3 374；evaluator 78 | L2-034 714 |
| fault injection／race／soak／crash recovery | v1.3 358（HIL-NFR-31）、373（HR-NFR-REG-005）；`docs/test-design/harness/L8-destructive-command-guard.md` 16（failure injection）、18（concurrent CAS）、19（crash point） | L2-034 714 |
| metamorphic | `docs/test-design/harness/L8-destructive-command-guard.md` 13（grammar metamorphic） | なし |
| golden master／golden fixture | `docs/design/harness/L4-basic-design/function.md` 160（Refactorの保護網）；`docs/design/harness/L6-function-design/feedback-lifecycle.md` 25；`docs/plans/PLAN-L5-100-state-db-schema-ddl-authority.md` 10、63 | なし |
| characterization test／dual-green | `docs/skills/testing.md` 99–108；`docs/design/helix/L3-requirements/github-atomic-development-requirements.md` 40、68、81、117 | なし（Refactor系はL2-042が別観点） |
| contract test（adapter contract、workflow contract） | `docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md` 189（HIL-NFR-09）；`docs/plans/PLAN-L7-133-refactor-brush-up-workflow.md` 85；ZIP catalog `contract_test` 28（design-pattern-inventory README 44） | L2-030 617（external-service double contract） |
| visual regression | `docs/skills/browser-testing-and-screen-verification.md` 95–103；`docs/design/harness/L1-requirements/functional-requirements.md` 53（FR-L1-22）；`docs/design/harness/L4-basic-design/function.md` 255 | L2-036 748（5軸） |
| accessibility（WCAG 2.2、axe、contrast 4.5:1、44px、200%） | `browser-testing-and-screen-verification.md` 88–90、104–114；`docs/process/forward/L08-L14-verification-phase.md` 56、78；`docs/design/harness/L10-ux/visual-design.md` 16–28、65；UI Profile a11y制約 `L5-detail/ui-domain-pattern-profile.md` 79 | L2-036 748（a11y-regression） |
| E2E／system（実repository全件通し） | `L4-basic-design/ui-domain-pattern-profile.md` 42–46（SA-UDP）；`docs/skills/testing.md` 39 | L2-022 454 |
| pairwise／risk-based組合せ | `L5-detail/ui-domain-pattern-profile.md` 88–105；`L6-function-design/ui-domain-pattern-profile.md` 53、83–85 | なし |
| 境界値・同値・正常/異常/境界の最低3件 | `docs/plans/PLAN-L3-01-functional-detail.md` 101；`docs/test-design/harness/L7-unit-test-design.md` 79（edge 4観点）；`docs/skills/test-thinking.md` 46–49 | L2-043（positive＋境界negative）、L2-030 617（boundary case family） |
| デシジョンテーブル・状態遷移の空欄 | `docs/skills/test-thinking.md` 53–54；`docs/design/harness/L5-detailed-design/if-detail.md` 69；現行seed DT-SDOP-004 47–59 | DT-SDOP-004 |
| 権限・IDOR | `docs/skills/test-thinking.md` 55–57 | L2-030 617（permission family） |
| 失敗系（遅い／落ちる／変な値／途中まで成功） | `docs/skills/test-thinking.md` 58–61；DT-SDOP-004 §4異常系4問 58 | L2-030、DT-SDOP-004 |
| 探索的テスト（チャーター・時間箱） | `docs/skills/test-thinking.md` 81–92 | なし |
| negative oracle／反例表 | 旧L4 design-template 23、87；`docs/test-design/helix/*`の「反例と期待結果」列（例：L6-ui-domain unit 21）；`docs/design/harness/L6-function-design/plan-descent-specific-parent-binding.md` 139 | DST-002、DT-SDOP全件 |
| failure到達可能性（negative oracleの実到達確認） | `docs/design/helix/L5-detail/design-reality-binding.md` 26–36 | なし |
| oracle強度（truthiness禁止、期待値の出所） | `ddd-tdd-rules.md` 51–54、138；`docs/skills/testing.md` 85–88；`test-driven-development.md` 70–77；`test-thinking.md` 62–65 | L2-030 625（根拠のない期待値を発明しない） |
| 計測evaluator（binding／freshness／代表性／threshold／baseline／hard limit） | `measurement-evidence-evaluator.md` 48–70；`scrum-reverse-verification-engine.md` 28–33 | L2-034 698–700 |
| 観点抜け・レベル間重複（W字） | 旧FR-L1-21（functional-requirements 52）、NFR-13（nfr 51） | L2-036 746 |
| flaky／quarantine | `docs/skills/test-thinking.md` 125；`docs/design/helix/L6-function-design/three-stage-ci-quarantine.md`（LEGACY-ASSET-3EA58A84F0A944151B36） | なし（CI運転はOS責務） |
| fixture戦略（決定的・隔離・teardown・live stateを使わない） | `docs/skills/testing.md` 69–76、92–97；pairwise決定的fixture `L5-detail/ui-domain-pattern-profile.md` 103–105；`docs/test-design/helix/fixtures/*.manifest`（3件） | L2-030 617（再現可能なtest data、seed記録） |
| テスト戦略と検証戦略（実走claim）の分離 | `docs/test-design/harness/L7-unit-test-design.md` 82–91 | L2-022（段階の区別） |
| QA追加テスト設計の分離（凍結テスト設計を書き換えない） | `L08-L14-verification-phase.md` 40、213–220 | なし |
| 外部基準（ISTQB、NIST SSDF、WCAG 2.2、NASA V&V matrix、Playwright） | `L08-L14-verification-phase.md` 47–60 | なし（出典ledgerとして参照可、90日stale規則62） |
| STRIDE、FMEA、プレモーテム、SLO、性能試験、障害訓練 | 現行 `os-decision-facilitation-input.md` 36–39、66–67（旧HELIXではなくPO提供playbook由来） | 未template化 |

---

## 5. 既存の範囲とgap（次の起草で重複させないため）

### 既にあるもの（重複して作らない）

- **設計template契約の要求**：DST-HARNESS-001〜007／DST-OS-001〜005（BRAIN候補）、HARNESS-L2-009・040・041・043・044。
- **設計template seed 7件**（DT-SDOP-001〜007：ログ、非機能、保守・監視、ロジック、依存、AWS、review）。
- **テスト生成能力の要求**：HARNESS-L2-030〜033（case family、double、最小再現、回帰trace）。
- **計測契約の要求**：HARNESS-L2-034（14項目、13品質領域、手法選択の根拠を残す）。
- **検証観点の完全性**：HARNESS-L2-036（W字抜け・重複、画面5軸、local/CI同一契約）。
- **検証段階の契約**：HARNESS-L2-022、NCI-HARNESS-001〜004。
- 現行audit：`docs/governance/audits/requirements-stage/legacy-system-acceptance-negative-oracle-audit-2026-09-28.md`（旧HIL 24契約・72 AC・24 HATのnegative oracle照合）、`docs/governance/decisions/test-reproduction-derivation-2026-09-27.md`、`docs/governance/audits/requirement-registration/harness-template-example-coverage-receipt-2026-09-28.json`、旧IR `docs/governance/requirements-source/requirements-ir/{system_contracts,acceptance_cases,system_tests}.json`。

### gap（材料が無い、または契約化されていない物）

1. **DT-SDOP seedの欠落欄**：measurement、supersession、layer/pair、canonical positive例、適用判定の判断者・対象revision・再評価条件、field単位の必須性。旧L5 `design-template-json-authority.md` 33–77・103–108で埋められる。
2. **検証方法（verification-method）template**が無い：V-pairごとの「test basis → test condition → 必須evidence → 差戻し先」の型。材料は旧 `L08-L14-verification-phase.md` 28–35・73–79・197–205と HARNESS-L2-022、NCI-HARNESS-002。
3. **テスト手法（test-method）template**が無い：手法ごとに「適用するrisk・対象・前提input・oracleの出所・fixture戦略・成立条件（kill／到達）・非適用の理由・完成証拠にしない境界」を持つ型。手法名はHR-NFR-REG-005/006とL2-034 714に並んでいるが、各手法の契約は無い。材料は `test-thinking.md`、`ddd-tdd-rules.md` 63–83、`design-reality-binding.md` 26–36、`ui-domain-pattern-profile.md` L5 88–105。
4. **最小seedの4領域の未被覆**：connection contract（direction、ordering、timeout、retry、idempotency、partial failure）、data/permission/privacy/migration/rollback/testabilityの専用seed（requirements 80–82）。
5. **受入（L2↔L11）・価値運用（L1↔L12）側のtemplate**：旧材料は「完了を主張しない」境界（PLAN-L11/L12/L13 master）と `acceptance-criteria-thinking.md`、`L2-screen-ux-test-design.md` 26–35しかない。
6. **画面検証template**：旧 `browser-testing-and-screen-verification.md`（9状態、VRT差分分類、a11y）と旧UI Profile（L5 76–80）はあるが、現行ではL2-036の5軸以外は契約化されていない。
7. **未採択の数値**：必要case数、coverage率、mutation閾値、reduction上限（L2 689）、NFR-13の≥90%の母集団（L2 750）。templateに数値を置かず、値はL3で導出する前提を守る必要がある。
8. **ZIP catalogの未抽出**：`test_tech`・`coverage_crit`・`contract_test`（28）、`bdd`（29）、UT/IT/ST/AT（06〜09）、101・102の中身は未読・未atom化（`archive/reference-sources/ハイブリッド設計ドキュメントv1-fixed.zip`、read-only）。
