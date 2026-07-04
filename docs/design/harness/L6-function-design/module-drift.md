---
layer: L6
artifact_type: design_doc
status: confirmed
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
related_l0: docs/governance/helix-harness-concept_v3.1.md
next_pair_freeze: L7
created: 2026-06-08
plan: docs/plans/PLAN-L6-15-module-drift.md
---

> **L6 contract marker**: `parseListedModules`、`scanActualModules`、`analyzeModuleDrift`、`loadModuleDocs`、`moduleDriftMessages` を unit-test 粒度の契約とする。DbC の pre/post は §2-§3 に置く。L7 oracle family は U-MDRIFT-001..005。

# module-drift lint — 機能設計 (① / PLAN-L6-15、IMP-075)

> **V-pair**: `pair_artifact = L7-unit-test-design.md §1.16` (L6↔L7)。DbC 契約から単体テスト oracle (U-MDRIFT-*) を導出。

## §0 スコープ

**「architecture §3.1 building block 集合 ⊇ `src/` 実在 module」の包含 drift を機械検査** (IMP-075)。

背景: A-103 (L4 見直し) で handover/setup/web/lint が「実装済かつ設計 doc が将来扱い」の back-fill 漏れ (= harness 自身が [[feedback_impl_must_backfill_to_design]] を L4 で破った) を **手動監査**で発見した。柱 2「doc×機械厳格化」「柱 3 自動化で state 管理」に照らすと、impl→design back-fill 漏れ (meta-drift) を手動 audit に頼るのは under-design。本設計は **`src/` 実在 module がすべて architecture §3.1 に列挙されているか** (actual ⊆ listed) を doctor hard gate で検査する純関数 lint を定義する。

**スコープ外**:
- **逆向き (listed ⊋ actual = 将来 module)**: 設計が web/roster/skills 等を「将来」列挙し src 未実在は drift ではない (宣言済 carry)。検査しない。
- **asset-drift (internal asset cutover / FR-L1-49)**: 現在の slice は、登録済み internal asset (`.claude/agents`, `.claude/agent-memory`, `docs/skills`, `docs/templates/prompts`) 向けの独立した doctor hard gate として実装する。roster/skills の依存意味論全体は、この module-drift lint の外側にある将来作業とする。
- **import グラフ drift (循環/逆依存)**: ADR-002/IMP-032 (knip/madge) の別 PLAN。本 lint は module **集合の包含**のみ。

## §1 入力 (設計 listed / 実在 actual)

- **listed**: `docs/design/harness/L4-basic-design/architecture.md` の §3.1 表 1 列目 `**name**` building block 名。
- **actual**: `src/` top-level の **dir 名** + **top-level `*.ts` の basename** (`cli.ts` → `cli`)。

## §2 純関数 (parse / analyze)

```text
parseListedModules(architectureText: string) -> string[]
scanActualModules(srcDir: string) -> string[]
analyzeModuleDrift(docs: { listed, actual }) -> { orphans, listedCount, actualCount, ok }
```

- **parseListedModules**:
  - **Precondition**: architecture.md 全文。
  - **対象切り出し**: `§3.1` 見出し〜次見出し (`§3.2` 等) に限定 (§3.2 代表 module の太字を巻き込まない、過検知回避)。
  - **抽出**: 表行 1 列目 `^\|\s*\*\*([a-z][a-z0-9_-]*)\*\*` のみ。重複排除。
  - **Postcondition**: §3.1 不在 → `[]` (パース失敗を空虚 ok にしない、§3 で listedCount 0 検出可)。
- **scanActualModules**:
  - dir + top-level `*.ts` を module 名に正規化、sort + 重複排除。
- **analyzeModuleDrift**:
  - **Postcondition**: `orphans = actual \ listed` (実在だが未列挙)。`ok = orphans.length===0`。`listedCount/actualCount` は非空虚ガード用。

## §3 I/O loader と messages

- `loadModuleDocs(repoRoot)`: architecture.md を読み `parseListedModules`、`src/` を `scanActualModules` → `{ listed, actual }`。
- `moduleDriftMessages(result)`: orphan 0 → `"OK (… 孤児 0)"` / orphan あり → 件数 + module 列 + 「設計 doc へ back-fill (impl→design)」+ `[[feedback_impl_must_backfill_to_design]]`。

### §3.1 FR asset-drift 別名

| 関数 | シグネチャ | 事前条件 | 事後条件 | 不変条件 | oracle |
|---|---|---|---|---|---|
| `analyzeAssetDrift` | `analyzeAssetDrift(input: AssetDriftInput) => AssetDriftResult` | 登録済み agent/agent-memory/skill/prompt docs と guard allowlist が供給される。isolated fixture で root が無い場合は、無関係な検査を失敗させず skip する。 | legacy source path residue、legacy runtime delegation command residue、legacy runtime name residue、legacy product prose residue、空の docs-skills、対応する agent docs が無い guard allowlist entry を violation として返す。 | asset-drift は module-drift とは別検査だが、同じ finding/back-fill feedback loop に流し込む。prompt body と secrets は永続化しない。 | U-FR-L1-49 / U-ASSETDRIFT-001..008 |
| `analyzeChangeImpact` | `analyzeChangeImpact(input: ChangeImpactInput) => ChangeImpactResult` | 現在の change set file path が供給される。 | `src/**` 差分が同一 change set 内の design PLAN/doc 更新または test/test-design 更新を伴わない場合、`missingDesign` または `missingTest` を返す。 | source 変更は design back-fill や test evidence を静かに迂回できない。docs-only 変更は source tests を要求しない。 | U-CHGIMPACT-001..004 |
| `analyzeCodingRules` | analyzeCodingRules(docs: CodingRulesDoc[], policy?: CodingRulesPolicy, workflowDocs?: CodingWorkflowDoc[]) => CodingRulesResult | TypeScript source/test docs、coding-rule SSoT、workflow placement docs が供給される。 | explicit `any`、TS/lint suppression comment、TS file name drift、source 関数の 4 params 以上、空/rethrow-only catch、module-boundary drift、machine-surface language drift、SSoT policy drift、workflow anchor 欠落を返す。 | coding rules は requirements-level SSoT と workflow artifact である。no-any/suppression/naming は source/test、max-params / structured-error / module-boundary は `src/**` に適用する。CLI/doctor/lint/gate decision token は日本語 prose 中でも ASCII English を保つ。 | U-CODE-001..011 |
| `analyzeDddTddRules` | analyzeDddTddRules(input: DddTddInputs) => DddTddResult | DDD/TDD rule SSoT、workflow docs、source/test docs、PLAN docs、L7/L8 test-design docs が供給される。 | policy drift、workflow anchor drift、domain-boundary imports、invariant oracle gap、Red-first evidence 欠落、weak test oracle、integration GWT 欠落を返す。 | 定量 check と定性 review は分離するが、freeze-significant point では test evidence と reviewer evidence の両方を要求する。`domain-boundary` は `module-boundary` と同じ canonical source-boundary matrix を使い、DDD/TDD strictness 側の rule id として報告する。 | U-DDDTDD-001..010 / U-FR-L1-50 |

### Cross-Artifact Relation Graph 追補 (A-124/A-125 / PLAN-L6-31)

この追補は、cross-artifact graph と verification-profile projection に対する L6 function-design entry である。PLAN-RECOVERY-03 で露出した design gap を塞ぐため、これらの契約が L7 unit oracle と L7 implementation PLAN で被覆されるまでは relation graph source code を許可しない。

| 関数 | シグネチャ | 事前条件 | 事後条件 | 不変条件 | oracle |
|---|---|---|---|---|---|
| `collectRelationGraphProjection` | `collectRelationGraphProjection(input: RelationGraphSourceSet) => RelationGraphProjection` | docs、source paths、tests、PLAN metadata、audit records、verification evidence paths が text/metadata fixture として供給される。欠落した optional roots は明示的な空集合とする。 | requirements、PLANs、design docs、test-design docs、source files、tests、DB tables、verification profiles、external tools、diagrams、findings の正規化済み nodes と edges を返す。 | graph は authoring source ではなく再構築可能な projection である。projection rows は raw MCP responses、browser traces、screenshots、provider transcripts、secrets、credentials を copy しない。 | U-RELGRAPH-001..003 |
| `analyzeRelationImpact` | `analyzeRelationImpact(input: RelationImpactInput) => RelationImpactResult` | changed paths と graph projection が供給される。changed paths は repo-relative かつ正規化済みである。 | 直接変更された nodes、影響を受ける upstream/downstream nodes、必要な follow-up actions、design/test/DB/evidence coverage 欠落の findings を返す。 | lower-layer 変更は reverse/backprop actions を要求し得る。docs-only 変更は、graph が behavioral contract を示す場合を除き source tests を要求しない。 | U-RELGRAPH-004..006 |
| `exportRelationDiagram` | `exportRelationDiagram(snapshot: RelationGraphSnapshot, format: "mermaid" \| "dot" \| "d2") => DiagramArtifact` | graph snapshot と要求 format が供給される。Mermaid は常に利用可能で、DOT/D2 は installed tooling で gate される optional adapter とする。 | 安定した node IDs と edge labels を持つ deterministic diagram text を返す。利用不能な optional adapter は、暗黙に tool を起動せず finding を返す。 | Diagram export は review/handover の evidence であり、source docs や DB state を mutate してはならない。 | U-RELGRAPH-007..008 |
| `collectVerificationEvidenceProjection` | `collectVerificationEvidenceProjection(input: VerificationEvidenceRecord[]) => VerificationProfileProjection` | `.ut-tdd/evidence/verification-profiles/*.json` から保存済み A-125 evidence records を schema validation 後に供給する。 | `verification_profiles`、`verification_recommendations`、`mcp_server_runs`、`external_tool_findings` の projection rows を evidence paths 付きで返す。 | External execution は opt-in のままとする。projection は raw external payloads ではなく summaries と classification を保存する。 | U-RELGRAPH-009..010 |

**必須 impact class**:

- `source` 変更時の影響先: `sibling test`、L6 design contract、L7 oracle、PLAN、reverse/backprop guard。
- `design` / `test-design` 変更時の影響先: paired artifact、PLAN DoD、trace-freeze evidence。
- `physical-data` / DB projection docs 変更時の影響先: DB table nodes、rebuild contract、upstream requirement/ADR nodes。
- verification-profile evidence 変更時の影響先: external-tool profile、MCP server/tooling decision、evidence path、sanitized finding rows。
- diagram export -> stale-source detection 付きの review/handover artifact。

**Workflow guard**: PLAN-L6-31 に L7 oracle coverage があり、PLAN-L7-32 に TDD Red entry がある前に `src/**` の relation-graph source が作られた場合、その変更は妥当な implementation shortcut ではなく Recovery event として扱う。

### Tool Adapter Probe 追補 (A-124 / PLAN-L6-33)

この追補は、optional graph/diagram development-tool adapter に対する L6 contract を定義する。これは core relation graph collector とは別である。adapter は evidence quality を高められるが、gate-normalized truth の source は TypeScript/Bun collector と DB projection のままとする。

| 関数 | シグネチャ | 事前条件 | 事後条件 | 不変条件 | oracle |
|---|---|---|---|---|---|
| `catalogToolAdapters` | `catalogToolAdapters(input: ToolAdapterCatalogInput) => ToolAdapterCatalogResult` | 調査済み adapter metadata、package refs、executable names、trigger signals、output formats が供給される。 | dependency-cruiser、Knip、Madge、Graphviz DOT、Mermaid、D2 の deterministic adapter profiles を返す。 | adapters は optional であり、宣言・利用可能になるまでは disabled とし、authoring sources にはできない。 | U-TOOLADAPTER-001..002 |
| `probeToolAdapter` | `probeToolAdapter(input: ToolAdapterProbeInput, deps: ToolAdapterProbeDeps) => ToolAdapterProbeResult` | adapter profile、package metadata、executable check、workspace scope が供給される。 | install や destructive actions を実行せず、package/executable/config/scope の readiness checks を返す。 | adapter availability の欠落は finding であり、silent pass や無関係な check failure ではない。 | U-TOOLADAPTER-003..005 |
| `normalizeToolAdapterRun` | `normalizeToolAdapterRun(input: ToolAdapterRunEvidence) => ToolAdapterProjection` | raw adapter evidence path、command、exit code、version、scope、parsed output summary が供給される。 | 正規化済み `tool_runs`、`dependency_edges`、`diagram_artifacts`、`findings` rows を返す。 | raw DOT/JSON/SVG/Mermaid/D2 output は evidence のまま残す。gates は正規化済み projection rows のみを消費する。 | U-TOOLADAPTER-006..008 |
| `planDiagramRefresh` | `planDiagramRefresh(input: DiagramRefreshInput) => DiagramRefreshPlan` | graph snapshot digest、既存 diagram artifacts、要求 format、adapter readiness が供給される。 | Mermaid/DOT/D2 diagram artifacts に対する refresh/mark-stale/no-op actions を返す。 | stale diagrams を現在の review evidence として扱ってはならない。Optional renderer が無い場合は finding を返す。 | U-TOOLADAPTER-009..010 |

### Coding Rules 追補

- **coding-rules**: requirements `Coding Rules SSoT` から `src/lint/coding-rules.ts` へ落とす TS core 規約。explicit `any`、TS/lint suppression comment、TS file-name drift、source max-params drift は doctor hard failure。
- **workflow placement**: Forward L6 と Add-feature `add-design` は、implementation freeze の前に `docs/governance/coding-rules.md` の確認または更新を必須とする。workflow docs は `CODING-RULE-WORKFLOW` anchors を持つため機械監査できる。
- **doctor contract**: `checkCodingRules(repoRoot)` は `docs/governance/coding-rules.md`、`docs/process/forward/L00-L06-design-phase.md`、`docs/process/modes/add-feature.md`、`docs/process/modes/README.md`、`src/**/*.ts`、`tests/**/*.ts` を load し、`analyzeCodingRules` を実行して `ok` を `runDoctor.ok` に連動させる。
- **error handling**: catch block が明示的な failure state を返す・記録する、または fail-open intent をその場で文書化する場合に限り、fail-open を許可する。未文書化の空 catch と rethrow-only catch block は `structured-error-handling` violations とする。
- **module boundary**: `lint` は runtime/doctor/CLI feature modules を import してはならない。`runtime` は governance checks を import してはならない。`schema` は feature modules の下位に留める。違反は `module-boundary` とする。
- **canonical source-boundary matrix**: IMP-105 により禁止 import matrix は `src/lint/shared.ts` の `violatesSourceBoundary` を正本にする。`module-boundary` と `domain-boundary` は同じ matrix を使い、前者は coding-rule SSoT、後者は DDD/TDD strictness gate の観測名として別 rule id を維持する。
- **machine-surface language**: machine-facing CLI/doctor/lint/gate/status message は日本語説明を含んでよいが、decision token は安定した ASCII English (`OK`, `violation`, `warning`, `skipped`, `note`, `error`, `ready`, `not ready`) でなければならない。machine message 行に日本語だけの decision word がある場合は `machine-surface-language` violation とする。**Impl (2026-06-19、A-141)**: `analyzeCodingRules` の `violatesMachineSurfaceLanguage` が machine-surface 行パターン × 非 ASCII 判定語 × ASCII token 不在で検出し、`describe`/`it`/`test` のタイトル literal は除外 (false-positive 回避)。`REQUIRED_RULE_IDS` + SSoT `coding-rules.md` に `machine-surface-language` を登録。oracle U-CODE-010。実 repo violations 0。
- **scope split**: no-any / no-suppression / file naming は source と tests に適用する。max-params / structured-error-handling / module-boundary は `src/**` のみに適用する。test helper arity は readability と local test design に従う。

### design-language lint 追補 (2026-07-02)

- **背景**: HELIX 目標は「ドキュメントは英語ではなく日本語で統一」。root adapter ルールだけでは、設計 / governance /
  ADR に英語 prose を新規追加しても doctor が検出できず、要求と成果物が乖離する穴が残る。
- **対象**: `docs/adr/`、`docs/design/`、`docs/governance/`、`docs/test-design/`、`docs/process/`、
  `docs/plans/`、`docs/handover/` と adapter ルール markdown。inline code、URL、frontmatter、開発用語、
  コマンド、識別子は除外し、見出し / 説明文が英語 prose のまま増えた場合を検出する。
- **baseline**: 2026-07-02 の拡張監査で残存する既存英語 prose debt を確認する。現時点では既存 debt を
  一括翻訳せず、`DESIGN_LANGUAGE_BASELINE_VIOLATIONS` と `DESIGN_LANGUAGE_BASELINE_FINGERPRINT` を固定する。
  件数増加だけでなく、同件数の英語 prose 差し替えも fingerprint drift として fail-close する。純粋な日本語化で
  debt 件数が下がる変更は許可し、後続 PLAN で baseline を段階的に引き下げる。
- **doctor contract**: `checkDesignLanguage(repoRoot)` は `loadDesignLanguageDocs` → `analyzeDesignLanguage` →
  `designLanguageMessages` を実行し、baseline 超過または fingerprint drift を `runDoctor.ok=false` に連動する。
  baseline は完了宣言ではなくラチェット対象であり、今後の日本語化 PLAN で段階的に引き下げる。

### DDD/TDD Strictness 追補 (FR-L1-50)

- **DDD/TDD rule SSoT**: `docs/governance/ddd-tdd-rules.md` は `domain-boundary`、`invariant-test-trace`、`red-first-evidence`、`test-oracle-strength`、`integration-gwt` の rule IDs を定義する。
- **domain-boundary relation**: `domain-boundary` は `module-boundary` の別コピーではなく、canonical source-boundary matrix を DDD/TDD strictness 側で消費する rule である。境界表の差分根拠を prose で管理せず、matrix 変更は `violatesSourceBoundary` と U-CODE / U-DDDTDD の両 oracle を同時に更新する。
- **workflow placement**: Forward L6、Add-feature、mode index docs は `DDD-TDD-WORKFLOW` anchors を持つため、rule placement を reviewer memory に委ねない。
- **quantitative/qualitative split**: `analyzeDddTddRules` は review 前に mechanical evidence を提供する。gate-significant な DDD/TDD decisions は引き続き reviewer evidence を要求するため、両者を一つの signal に潰さず freeze readiness として束ねる。
- **unit-oracle-substance (IMP-083 残差、2026-06-19)**: `integration-gwt` が L8 IT-* 行の Given/When/Then 非空を見るのと対に、`unitOracleSubstanceViolations` は **L7 unit test-design の `U-XXX-NNN` 行** (末尾数字必須 = `U-ID` ヘッダ除外) の expected-behavior セルが**実ケース**を持つ (空 / trivial < 6 字 / skeleton marker `-`/TODO/骨格 でない) ことを検査する。pair-freeze (link) / oracle-test-trace (citation) / test-oracle-strength (test コード assert) は U-* 行の**期待結果セル中身**を見ないため、freeze 時の骨格凍結を素通りさせていた穴 (IMP-083) を FR-L1-50 配下で塞ぐ。oracle U-DDDTDD-009。**IMP-082 (descent substance) は別途 IMP-090/092 の `l6-fr-coverage` (FR→L6 type body + pseudocode) で被覆済 = superseded**。
- **doctor contract**: `checkDddTddRules(repoRoot)` は SSoT、workflow docs、PLAN docs、L7/L8 test-design docs、TS source/test files を load する。DDD/TDD strictness violations がある場合は `runDoctor.ok` を fail させる。

### Impl-Plan-Trace 追補 (IMP-088 / FR-L1-18 descent / PLAN-REVERSE-40)

`module-drift` (src⇔architecture §3.1) と `pair-freeze` (design⇔test-design) はいずれも **PLAN を見ない**ため、「設計 doc に名前が載れば PLAN 無しでも通る」穴 (A-108 orphan の根因) が残る。本 addendum は FR-L1-18 (横断検出・**接続欠損**) の descent として impl→PLAN トレーサビリティを定義する。

| 関数 | シグネチャ | 事前条件 | 事後条件 | 不変条件 | oracle |
|---|---|---|---|---|---|
| `analyzeImplPlanTrace` | analyzeImplPlanTrace(input: ImplPlanTraceInput) => ImplPlanTraceResult | `src/**.ts` 集合 + PLAN generates/本文に出現した src パス集合 + baseline allowlist が供給される。 | traced でも baseline でもない src を `orphans` に返し、NEW orphan 有無で `ok` を決める。 | baseline は known-debt の段階導入であり**縮小のみ可**。IMP-087 の 4 orphan は baseline でなく PLAN generates への back-fill で trace 解消する。 | U-IPT-001..005 |

- **baseline 根拠**: 2026-06-10 実測 (`find src -name '*.ts'` vs PLAN generates) で 12 孤児。うち 4 (IMP-087: review-tier/rule-drift/team-run/provider-handover) は PLAN-REVERSE-40 generates へ back-fill、残 8 (asset-drift/change-impact/doc-consistency/entity-coverage/g3-trace/improvement-backlog/readability/shared) を baseline。
- **doctor 配線**: `checkImplPlanTrace(repoRoot)` を **hard/fail-close** で配線。CI 回帰網 `U-IPT-004` と doctor の両方で実 repo orphan 0 を維持する。

## §4 doctor 配線 (hard/fail-close)

`checkModuleDrift(repoRoot)` を `runDoctor` に **hard/fail-close** で配線。I/O 失敗は violation として `ok=false` を返し、module-drift があれば `ut-tdd doctor` は失敗する。

## §5 段階導入 / hard 化判断

- **hard 化完了**: A-103 back-fill 後、実 repo 孤児0 (handover/setup/web 列挙済) を確認し、CI 回帰網 (U-MDRIFT-005) と doctor.ok 連動の両方で fail-close する。

## §6 用語更新

- **module-drift**: architecture §3.1 設計 module 集合 ⊇ `src/` 実在 module の包含 drift (impl→design back-fill 漏れ)。asset-drift (内容整合) / dependency-drift (import グラフ) と別検査。
- **change-impact**: `src/**` の差分に対し、同一 change set 内の design PLAN/doc 更新と tests または test-design 更新を要求する修正漏れ検出。semantic な「変更不要」判断は将来の relation-graph/dependency-drift に委ねるが、コード変更が設計・テスト更新なしで通過する穴は doctor で塞ぐ。

## §7 carry

- **hard 化**: 完了。`checkModuleDrift.ok` / `checkImplPlanTrace.ok` は `runDoctor.ok` に連動する。
- **粒度の深化**: 現状 top-level module 集合のみ。Level 2 (代表 module 内部ファイル) 粒度の drift は対象外 (§3.2 は人手)。
- **asset-drift**: `analyzeAssetDrift` (FR-L1-49) は internal asset cutover 向けの現在の hard gate slice として実装済みである。`.claude/agents/*.md`、`.claude/agent-memory/**/*.md`、`docs/skills`、`docs/templates/prompts/*.md` assets を再帰 scan し、legacy source personal path residue、legacy runtime delegation command residue、legacy runtime name/env residue、legacy product prose residue、空の `docs/skills`、対応する agent docs が無い guard allowlist entries を failure とする。prompt bodies は意図的に persistent state へ parse しない。markdown assets が source of truth のままである。
