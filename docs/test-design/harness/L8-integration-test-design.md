---
layer: L5
executed_at_layer: L8
artifact_type: test_design
status: confirmed
pair_artifact: docs/design/harness/L5-detailed-design/
parent_doc: docs/plans/PLAN-L5-00-master.md
related_l0: docs/governance/helix-harness-concept_v3.1.md
related_l5_physical_data: docs/design/harness/L5-detailed-design/physical-data.md
related_l5_module: docs/design/harness/L5-detailed-design/module-decomposition.md
related_l5_internal: docs/design/harness/L5-detailed-design/internal-processing.md
related_l5_if_detail: docs/design/harness/L5-detailed-design/if-detail.md
next_pair_freeze: L5
v2_import: docs/migration/v2-import-ledger.md
created: 2026-05-29
updated: 2026-06-09
---

# HELIX-HARNESS — L8 結合テスト設計 (④ / IT-*)

> **layer（作成層 = V-pair key）**: L5 (詳細設計) / **executed_at_layer（実施層）**: L8 (結合テスト) / **artifact（成果物）**: ④ テスト設計 (V-model 右、② L5 詳細設計 全 sub-doc と対)
> **pair（V-model L5↔L8）**: `docs/design/harness/L5-detailed-design/{physical-data,module-decomposition,internal-processing,if-detail}.md` 4 sub-doc 全体 ↔ 本書 1 doc
> **status（状態）**: confirmed (L5↔L8 pair freeze。§5 が全 IT-* に GWT 粒度の confirmed IT case 設計を提供)
> **granularity correction（粒度是正、2026-06-08）**: resolved。各 IT-* は §5 で GWT、fixture、module boundary setup、mock/adapter 条件、期待 assertion、negative/edge coverage を備える。§1/§2 は §5 が upgrade する candidate skeleton として残す。
> **encoding fix（文字化け是正、2026-06-09）**: G5 freeze commit (14792e3) で本書本文 (§0-§4 / Appendix A) が UTF-8→CP932 誤読により文字化けしていたため、直前の clean 版 (7d6449c) から日本語本文を復元。§5 / Appendix B は英語で無傷のため現行を保持。
> **PLAN**: `docs/plans/PLAN-L5-{01..04}-*.md` の pair_artifact / DoD で本書参照

## §0 量閉じ原則 (L5 ↔ L8)

L5 詳細設計の各契約 (DbC) が L8 結合テスト (IT-*) で被覆されること (孤児 = 0)。

- **internal-processing**: 各操作の DbC pre/post/invariant (§3/§4/§5) + edge docstring (§7) → 契約遵守 IT 必須
- **if-detail**: adapter 詳細契約 (§1-§5) + エラー分類→fail-close (§4) → 境界統合 IT 必須
- **module-decomposition**: module 間の公開 IF 呼び出し (依存方向) → module 結合 IT 必須
- **physical-data**: state file ↔ zod の読込/書込整合 (§5) → 永続化結合 IT 必須
- 孤児 = 0 (L7 で `ut-tdd vmodel lint` の edge 5-8 照合に接続)

## §1 結合テスト (IT-*) — candidate skeleton（候補骨子）

> L8 = module 間 / 内外境界の **結合**を対象 (L9 system test より下位、L12 受入 AT より実装寄り)。個別 IT ケースは §5 (Confirmed IT Case Design / 確定済み IT ケース設計) で GWT 粒度に展開済み。本節は §5 が upgrade する前段の candidate mapping（候補対応表）として残す。

### §1.1 IT-CONTRACT (internal-processing DbC 由来)
| IT-ID（候補） | 検証対象 | シナリオ |
|---|---|---|
| IT-CONTRACT-01 | `plan draft` の pre/post (§3/§4) | precondition 違反入力 → fail-close / 正常入力 → file+registry postcondition 成立 |
| IT-CONTRACT-02 | `gate` の post + invariant (§4/§5) | gate pass → phase.yaml + gate_runs 証跡 / V-model 順序 invariant |
| IT-CONTRACT-03 | edge docstring (§7、edge 5-8) ↔ 実装関数 | @edge-normal/error/boundary/throws が AT と双方向 trace |

### §1.2 IT-ADAPTER (if-detail D-CONTRACT 由来)
| IT-ID（候補） | 検証対象 | シナリオ |
|---|---|---|
| IT-ADAPTER-01 | adapter intent → 結果型 (§1/§2) | invokeWorker intent → InvokeResult (mock provider) |
| IT-ADAPTER-02 | エラー分類 → fail-close (§4) | absent→degradation / auth→fail-close / timeout→skip |
| IT-ADAPTER-03 | D-CONTRACT DSL (§5) | mode-routing.yaml / gate-checks.yaml の zod 読込 validate |

### §1.3 IT-MODULE (module-decomposition 由来)
| IT-ID（候補） | 検証対象 | シナリオ |
|---|---|---|
| IT-MODULE-01 | 依存方向 (schema 一方向・循環禁止) | module 間 import グラフに循環なし |
| IT-MODULE-02 | lint 共通様式 (loadX→analyzeX) | loadX (fs) + analyzeX (pure) の結合動作 |

### §1.4 IT-STATE (physical-data 由来)
| IT-ID（候補） | 検証対象 | シナリオ |
|---|---|---|
| IT-STATE-01 | state file ↔ zod 読込/書込 (§5) | 書込→読込で zod parse 成立 / 不正 state → fail-close |
| IT-STATE-02 | drive 別区画 (§6) | 区画隔離 + 跨ぎ汚染検出 |

### §1.5 IT-ASSET (内部資産 roster 由来、PLAN-L5-05 / PLAN-DISCOVERY-02 Discovery confirmed)
| IT-ID（候補） | 検証対象 | シナリオ |
|---|---|---|
| IT-ASSET-01 | `roster list` scan→registry (module-decomp §1/§5) | `.claude/agents/*.md` 全件が registry (id=filename stem) に入る (PLAN-DISCOVERY-02 spike = 19 件実証) / capability class ⊥ model family に決定論解決 |
| IT-ASSET-02 | `roster check` ↔ guard allowlist 整合 (internal-proc §4 post) | allowlist 突合 = missingFromRoster=0 ∧ nameMismatches=0 で ok/exit 0 / 乖離 (allowlist にあり .md 無し、filename↔name 不一致) 注入 → **fail-close**/exit 1。nonAllowlisted (be-* / db-schema / devops-deploy) は乖離でなく既知集合 |
| IT-ASSET-03 | `runtime(guard) → roster` 依存方向 (module-decomp §4) | 実装済み L7 evidence: `src/runtime/agent-slots.ts#resolveRosterCapability` は `runtime/agent-guard` を import せずに roster capability を解決する。integration check は dependency-lint / module-boundary scope として残す。 |

## §2 量閉じ一覧 (L5 契約 → IT 被覆、孤児チェック)

- internal-processing §3/§4/§5/§7 DbC → IT-CONTRACT-01〜03 + roster D-API (`roster list/check`) → IT-ASSET-01〜02 (`ut-tdd asset` FR-L1-48 は L6 carry `waiting_layer:L6` で IT 被覆も L6 後追い、孤児でなく carry 明示)
- if-detail §1-§5 → IT-ADAPTER-01〜03
- module-decomposition §4 依存方向 / §6 lint 様式 → IT-MODULE-01〜02 + roster module (§1/§5) → IT-ASSET-01/03
- physical-data §5/§6 → IT-STATE-01〜02
- **孤児 (契約で IT 候補未対応) = 0** を §5 confirmed case 設計で機械確認の対象とする。本節の candidate mapping（候補対応表）は §5 で GWT 粒度に展開済み。

## §3 trace (④ → ②)

本書の各 IT-* は `docs/design/harness/L5-detailed-design/` の 4 sub-doc の契約と相互 reference。**G5 (詳細設計ゲート = DbC freeze 点)** で 4 sub-doc 全体 ⇔ 本書 1 doc の pair 宣言を確定し、双方向 trace freeze は G7 で実施 (L3↔L12 / L4↔L9 と同型)。

## §4 carry / 次工程

- **L7 実装**: 全 IT-* を vitest 結合テストに変換 (TDD 強制 FR-02、Red 先行)。DbC docstring (internal-processing §7) の @edge-* ↔ AT 照合
- **G7 trace freeze**: 4 artifact 双方向 12 edge 凍結時に本書 IT ↔ L5 契約の trace 確定
- **外部ツーリング IT の明示 carry (A-128 F-2 / IMP-128、2026-06-10)**: **IT-RELGRAPH-01..04 / IT-DOCEXPORT-01..03 (計 7 件) は現時点で対応する実結合テスト未着手の正規 defer** であり、**PLAN-L7-32 (relation graph) / PLAN-L7-35 (doc export) の TDD Red entry 待ち** (A-127 implementation-pending boundary と同一)。L7 の U-RELGRAPH / U-DOCEXPORT carry (L7-unit-test-design §4) と対で管理する。本宣言により「明示 defer なき未実装」(under-design) には該当しない。

## Appendix A: L5 back-fill IT coverage 候補 map (PLAN-L5-06 / PLAN-L5-07)

### A.1 skill / drift 向け IT-ASSET 追加

| IT-ID | Source contract（source 契約） | Scenario（シナリオ） |
|---|---|---|
| IT-ASSET-04 | skill catalog integration (module-decomposition Appendix A.1 / internal-processing Appendix A.1) | `docs/skills/**/*.md` scan で in-memory catalog を生成する。任意 root の欠落は empty-with-evidence として報告し、`.ut-tdd` 永続 state は作成しない。 |
| IT-ASSET-05 | skill recommender/injector integration (PLAN-L5-06) | catalog と task/layer/drive context から決定論的な recommendation と layer-scoped injection set を生成する。scoring と injector signature は L6 carry (`waiting_layer:L6`) のまま扱う。 |
| IT-ASSET-06 | `asset-drift` rule integration (module-decomposition Appendix A.2 / internal-processing Appendix A.2) | rule registry に `asset-drift` を含め、登録済み agent/skill docs を検査する。未解決 drift は doctor/gate の non-green validation として表面化する。 |
| IT-ASSET-07 | placeholder dependency gap integration (physical-data §7 + PLAN-L5-07) | 未解決 placeholder dependency は waiting layer まで可視 carry として残す。該当 layer 到達時に未具現化なら、黙って pass せず validation failure とする。 |

### A.2 被覆対応の記述

- PLAN-L5-06 skill contracts -> IT-ASSET-04 / IT-ASSET-05 で被覆する。
- PLAN-L5-07 asset-drift contracts -> IT-ASSET-06 / IT-ASSET-07 で被覆する。
- 既存 roster contracts は引き続き IT-ASSET-01〜IT-ASSET-03 で被覆する。

## §5 確定済み IT ケース設計 (G5 Freeze)

本節は前段の candidate skeleton（候補骨子）を confirmed integration-test design（確定済み結合テスト設計）粒度へ引き上げる。すべての IT-* 行は GWT、fixture、module boundary setup、assertion、negative/edge coverage を持つ。L6/L7 carry items は implementation-detail carry（実装詳細の持ち越し）に限り、本節では integration boundary（結合境界）と期待 behavior を凍結する。

DDD/TDD strictness automation (`src/lint/ddd-tdd-rules.ts` / `integration-gwt`) は本節を機械検査する。明示的な GWT を欠く `IT-*` 行は freeze evidence として confirm 不可とする。この定量 check は qualitative review より前に実行し、gate-significant integration evidence は両方を要求する。

| IT-ID | Given（前提） | When（操作） | Then（期待結果） | Fixture / Boundary（境界） | Assertions（検証） | Negative / Edge（異常・境界） |
|---|---|---|---|---|---|---|
| IT-CONTRACT-01 | valid / invalid な `plan draft` request、temp `docs/plans` workspace、空の plan registry。 | plan draft flow が frontmatter を validate し、PLAN を write し、registry evidence を update する。 | valid input は PLAN と registry entry を作成し、invalid input は write 前に fail する。 | CLI -> plan module -> schema -> fs boundary。temp fs fixture。 | file+registry postcondition 付き Exit 0、または partial write なしの exit 1。 | `plan_id` 欠落、invalid layer、duplicate ID、readonly target。 |
| IT-CONTRACT-02 | prior phase state と gate-design ledger fixture を持つ gate request。 | gate flow が pass/fail evidence を記録し、phase state を update する。 | gate pass は gate_runs evidence を作成し、V-model order invariant を保持する。 | gate module -> phase state -> audit ledger boundary。 | gate status、audit record、phase transition が一致する。 | out-of-order な gate skip、evidence 欠落、stale park state。 |
| IT-CONTRACT-03 | edge annotation と mapped AT references を持つ functions / docs。 | edge docstring scan を L5 DbC と AT trace と比較する。 | 各 edge 5-8 class は AT または explicit carry に map される。 | code/doc parser -> trace map boundary。 | orphan `@edge-*` がなく、source contract なしの AT もない。 | unknown edge tag、normal/error classification の衝突。 |
| IT-ADAPTER-01 | mock provider adapter と provider-independent worker intent。 | adapter が worker/reviewer intent を invoke し、result を normalize する。 | result は provider-independent `InvokeResult` として返る。 | core -> adapter -> mock provider boundary。 | intent fields が保持され、result/error union が valid。 | provider が malformed payload または missing output を返す。 |
| IT-ADAPTER-02 | absent provider、auth failure、rate limit、timeout の adapter error fixtures。 | adapter が各 error を fail-close/degradation/skip policy へ map する。 | auth は fail close、absent provider は許可箇所だけ degrade、timeout は bounded。 | adapter -> policy mapper -> CLI exit boundary。 | error class、exit code、next_action が D-CONTRACT と一致する。 | retry exhaustion、mixed partial success、unknown provider error。 |
| IT-ADAPTER-03 | `mode-routing.yaml` と `gate-checks.yaml` fixtures。 | D-CONTRACT DSL を load して validate する。 | valid DSL は parse され、invalid routing/gate definitions は execution 前に fail する。 | config loader -> zod schema -> workflow boundary。 | schema parse の success/failure が deterministic。 | unknown mode、missing gate、circular routing。 |
| IT-MODULE-01 | 期待する schema-first dependency direction を含む module import graph。 | import graph check が public / internal module imports を walk する。 | cycle は存在せず、schema は one-way dependency root のまま維持される。 | src module graph -> dependency analyzer boundary。 | cycle count 0、forbidden reverse import count 0。 | injected cycle、helper importing CLI、lint importing doctor。 |
| IT-MODULE-02 | `loadX` と pure `analyzeX` を持つ lint module fixture。 | loader が fixtures を read し、与えられた docs で analyzer を実行する。 | I/O は loader に留まり、analyzer は deterministic かつ side-effect free。 | fs loader -> pure analyzer -> message boundary。 | 同一 input は同一 result を返し、messages は violation set と一致する。 | analyzer reading fs、loader hiding parse failure、unstable message order。 |
| IT-STATE-01 | valid / invalid な `.ut-tdd` state files と schema fixtures。 | state を write し、read back し、zod で parse する。 | valid state は round-trip し、invalid state は use 前に fail closed する。 | state fs -> zod schema -> doctor boundary。 | parse result は schema と一致し、IDs を保持する。 | missing required field、unknown enum、corrupt JSON/YAML。 |
| IT-STATE-02 | artifact ID が重複する 2 つの drive partitions。 | drive-scoped state を read し、cross-drive contamination を check する。 | explicit trace edge が linkage を許可しない限り、各 drive は isolated のまま残る。 | `.ut-tdd/drive/<drive>` -> state loader boundary。 | declared edge なしの cross-drive read がない。 | same ID in two drives、missing drive、invalid skip_sub_doc。 |
| IT-ASSET-01 | `.claude/agents/*.md` fixture set と roster registry fixture。 | `roster list` が markdown を scan し、registry を build する。 | すべての file が deterministic な registry row になる。 | markdown source -> roster module -> registry boundary。 | ID は filename stem と等しく、capability class は model family から独立する。 | duplicate filename stem、missing name、unsupported metadata。 |
| IT-ASSET-02 | roster registry と guard allowlist fixtures。 | `roster check` が registry names と allowlist entries を compare する。 | matching sets は pass し、missing roster または name mismatch は fail closed する。 | roster module -> guard allowlist boundary。 | pass 時は `missingFromRoster=0` かつ `nameMismatches=0`。 | non-allowlisted known agents は failure ではなく informational に留まる。 |
| IT-ASSET-03 | runtime、guard、roster modules の import graph fixture。 | dependency-direction check が `runtime -> roster` のみを verify する。 | roster は runtime/guard を import せず、L7 resolver は `src/runtime/agent-slots.ts` に実装される。 | runtime/guard/roster import boundary。 | cycle count 0、reverse dependency count 0。 | hidden transitive import、capabilities を捏造する resolver。 |
| IT-ASSET-04 | `docs/skills/**/*.md` fixture と空の optional roots。 | skill catalog scan が in-memory catalog を生成する。 | 存在する skills は cataloged され、missing optional roots は empty-with-evidence を返す。 | docs/skills -> skills catalog boundary。 | persistent `.ut-tdd` state は作成されない。 | malformed skill metadata、duplicate skill ID、missing root evidence。 |
| IT-ASSET-05 | skill catalog と task/layer/drive context。 | recommender/injector が recommendations と layer-scoped injection set を compute する。 | recommendations は deterministic で、injection set は requested layer に scoped される。 | catalog -> recommender -> injector boundary。 | 同一 input は同一 ordered set を生成し、unsupported layer は fail closed する。 | tie score、unknown drive、missing required skill。 |
| IT-ASSET-06 | `asset-drift` を含む rule registry と enrolled doc fixtures。 | asset-drift rule が agent/skill docs に対して run する。 | drift は doctor/gate の non-green validation として表面化する。 | rule registry -> doc scan -> doctor/gate boundary。 | rule registration が存在し、violation count が non-green output へ map される。 | legacy absolute path、legacy runtime command、empty docs/skills。 |
| IT-ASSET-07 | `waiting_layer` と current layer を持つ placeholder dependency records。 | placeholder check が unresolved dependency と current layer を compare する。 | waiting layer 前は visible carry として残り、waiting layer 以後の unresolved state は fail する。 | physical-data placeholder registry -> vmodel/doctor boundary。 | carry は explicit で、threshold 到達時に failure へ変わる。 | missing waiting layer、materialization 後の stale placeholder、orphan edge。 |
## Appendix B: DB reference-feedback IT 追加 (PLAN-L5-08)

| IT-ID | Given（前提） | When（操作） | Then（期待結果） | Fixture / Boundary（境界） | Assertions（検証） | Negative / Edge（異常・境界） |
|---|---|---|---|---|---|---|
| IT-DB-01 | valid な PLAN/artifact/gate/finding fixtures と空の `.ut-tdd/harness.db`。 | projection writer が normalized events を SQLite へ record する。 | plan/artifact/gate/finding projections に rows が存在し、`plan_id` で join できる。 | docs/state loaders -> projection-writer -> SQLite boundary。 | orphan projection rows がなく、duplicate replay は idempotent。 | missing `plan_id` / `session_id`、corrupt DB、duplicate key replay。 |
| IT-DB-02 | Forward、Add-feature、Reverse、Recovery modes をまたぐ drive/model/session fixtures。 | `drive_runs`、`hook_events`、`model_runs` を project して join する。 | 各 run は drive/mode/layer/kind を持ち、PLAN/session evidence と join する。 | runtime/session log -> state-db boundary。 | cross-drive contamination count は 0、unresolved join は finding になる。 | unknown drive、mode-kind mismatch、dangling session。 |
| IT-DB-03 | 同一 PLAN/session に対する skill recommendation rows と skill invocation rows。 | skill metrics を layer/drive/plan 別に compute する。 | firing rate と acceptance rate を quality signals として materialize する。 | skill recommender/invocation log -> feedback-engine boundary。 | denominator は recommendations、numerator は実際に fired した invocations。 | recommendation without invocation、invocation without recommendation、zero denominator。 |
| IT-SEARCH-01 | PLAN/artifact/finding/skill/model/session fixtures から構築した search index。 | `ut-tdd find` が exact IDs と fuzzy terms を query する。 | ranked references は subject type、ID、path、reason、evidence path を含む。 | search-index -> SQLite -> CLI boundary。 | exact ID が優先され、stale index は detect / rebuild 可能。 | deleted source doc、ambiguous query、redacted content query。 |
| IT-FEEDBACK-01 | repeated stale approval、orphan trace、schedule lint patterns を持つ open findings と quality signals。 | feedback engine が signals を group し、feedback events を emit する。 | repeated gaps は next_action references 付きの visible feedback events になる。 | findings/quality_signals -> feedback-engine boundary。 | event は source findings を参照し、auto event は PLAN を approve / edit しない。 | conflicting severity、closed finding、missing evidence path。 |
| IT-AUTOMATION-01 | ready、blocked、human-required plans 向け workflow/gate/doctor/CI projection fixtures。 | automation readiness を evaluate する。 | 各 workflow row は classify され、ready でない場合は blocking evidence を含む。 | workflow_runs/gate_runs/findings -> automation-readiness boundary。 | missing evidence から ready は生成できず、blocked rows は open findings を参照する。 | stale gate pass、skipped doctor check、human-required without signoff。 |
| IT-GUARDRAIL-01 | agent-guard、review_evidence、same-model、tests-before-review、escalation fixtures。 | guardrail decisions を `guardrail_decisions` へ normalize する。 | allowed/blocked/human-required decisions は plan/session 別に query できる。 | guardrail policy/evidence -> guardrail-ledger -> SQLite boundary。 | same-model cross-agent approval と missing human signoff は block decisions になる。 | naive self-review、PII scope、missing evidence path。 |
| IT-ASSET-DB-01 | valid、empty、legacy-runtime drift cases を持つ skill/roster/command markdown fixtures。 | automation assets を catalog し、index する。 | valid assets は catalog/search に現れ、drift と empty catalog は findings になる。 | docs/.claude sources -> asset-catalog -> search-index boundary。 | prompt bodies は copy せず、trigger/capability metadata は searchable。 | duplicate asset ID、legacy runtime command、malformed metadata。 |
| IT-RELGRAPH-01 | source/design/test/PLAN/audit fixtures と空の graph projection DB。 | relation graph projection を repository artifacts から rebuild する。 | requirements、PLANs、design docs、test-design docs、source files、tests、DB tables、verification profiles、diagrams、findings の nodes/edges が存在する。 | repository artifact loaders -> relation graph projection -> SQLite/search boundary。 | orphan graph rows がなく、duplicate rebuild は idempotent。graph rows は rebuildable projections のまま残る。 | missing artifact path、duplicate node ID、stale source doc、unsupported artifact kind。 |
| IT-RELGRAPH-02 | changed `src/**` file fixture と、paired test/design/PLAN/reverse nodes への graph edges。 | impact analysis が changed node を graph 経由で expand する。 | required actions は必要に応じて sibling test、L6 design contract、L7 oracle、PLAN DoD、reverse/backprop guard を含む。 | changed-files loader -> relation impact analyzer -> finding/workflow boundary。 | missing paired artifact は finding になる。docs-only changes は behavioral edge がない限り source tests を要求しない。 | untracked file、rename、deleted source、missing graph projection。 |
| IT-RELGRAPH-03 | physical-data DB projection fixtures と verification-profile evidence records。 | evidence projection collector が verification records を normalize し、graph nodes へ link する。 | `verification_profiles`、`verification_recommendations`、`mcp_server_runs`、`external_tool_findings` rows は evidence path/profile ID で graph nodes と join する。 | `.ut-tdd/evidence` -> verification evidence projection -> relation graph / SQLite boundary。 | raw MCP/browser/provider payloads は除外し、redacted summaries と counts は query 可能。 | malformed evidence schema、secret-like field、external run without opt-in、missing evidence path。 |
| IT-RELGRAPH-04 | relation graph snapshot と Mermaid/DOT/D2 export requests。 | review/handover 用の diagram export を generate する。 | Mermaid output は deterministic。optional DOT/D2 adapters は installed tooling を要求し、無い場合は implicit installation せず findings を返す。 | relation graph snapshot -> diagram exporter -> evidence artifact boundary。 | stable node order と edge labels。export 中に DB/source docs を mutate しない。 | adapter missing、stale graph snapshot、diagram text 内の raw evidence payload。 |
| IT-DOCEXPORT-01 | headings、tables、IDs、evidence links を持つ concept、requirements、detailed design、PLAN、ADR、test-design fixtures。 | canonical document export projection を build する。 | source paths、section IDs、FR/AC/AT IDs、PLAN IDs、ADR IDs、status fields、evidence links が deterministic dataset rows に現れる。 | markdown docs -> document parser -> export dataset boundary。 | ID loss がなく、unsupported document family は finding になる。 | missing source path、malformed table、duplicate section ID、unsupported family。 |
| IT-DOCEXPORT-02 | document export dataset と CSV/Markdown/XLSX/PPTX profile requests。 | export renderer boundary を invoke する。 | CSV と Markdown は built-in outputs として render する。XLSX/PPTX/D2 requests は renderer readiness を要求し、無い場合は findings を返す。 | export dataset -> renderer profile -> artifact metadata boundary。 | implicit package install は行わず、redaction は renderer より前に run する。 | missing ExcelJS/SheetJS/PptxGenJS/D2、secret-like field、oversized document。 |
| IT-DOCEXPORT-03 | generated document export artifact metadata と changed source document digest。 | export artifact freshness を check する。 | `document_export_artifacts` rows は source snapshot hash に基づき current / stale として mark される。 | document export projection -> stale checker -> review/handover boundary。 | stale Office/spreadsheet artifacts は current evidence として扱えない。 | source digest mismatch、deleted source doc、manually edited export file。 |

## Appendix C: proposal document coverage integration 追補

Pair = `src/task/classify.ts#classifyProposalDocumentCoverage` と
`docs/design/harness/L3-functional/functional-requirements.md`
FR-L1-39 addendum.

これらの integration cases は、proposal text が required design/test-design document set へ変換される境界を検証する。rule は意図的に additive であり、match した各 pattern は自身の documents、evidence、gates を追加する。後続の LLM summary が rationale を足してもよいが、ここで生成した deterministic requirements を削除してはならない。

| IT-ID | Given（前提） | When（操作） | Then（期待結果） | Fixture / Boundary（境界） | Assertions（検証） | Negative / Edge（異常・境界） |
|---|---|---|---|---|---|---|
| IT-DOCCOV-01 | screen UI、API、DB、batch/report、async job、notification、security/privacy、observability/audit、release、NFR terms に言及する proposal text。 | `ut-tdd task classify --design-docs --json` を run する。 | `document_coverage.patterns` は matching pack をすべて含み、`granularity` は match した最高 level になる。 | CLI -> task classifier -> JSON serializer boundary。 | required design docs、test docs、evidence、gates は duplicates なしで union される。 | overlapping keywords、repeated words、mixed English/Japanese terms。 |
| IT-DOCCOV-02 | work が minor/simple で design skip を求める proposal text。 | document coverage classification を evaluate する。 | shrinkage wording は finding のみに留まり、required documents は削除されず granularity も下がらない。 | proposal parser -> guardrail evaluator boundary。 | `llm-shrinkage-ignored` が emit され、required-doc count は additive のまま残る。 | "not needed"、"skip"、Japanese minor/omit terms、low drive confidence。 |
| IT-DOCCOV-03 | discovery/research proposal text と candidate external templates。 | research adoption mapping を produce する。 | adoptable templates は `incorporate`、`reference`、`exclude`、`ut-tdd-specific` に分割される。 | research mapping -> coverage output boundary。 | marketing/vendor templates は reject し、HELIX workflow/agent templates は HELIX-specific のまま残す。 | vendor-specific formats、generic marketing templates、untestable checklist prose。 |
| IT-DOCCOV-04 | security/privacy、migration、その他 escalation-sensitive terms で classify された proposal。 | coverage classification が `classifyTask` findings と document packs を combine する。 | granularity は少なくとも G4 に到達し、human/risk evidence を要求する。 | task risk classifier -> document coverage boundary。 | `nfr`、`technical-requirements`、`system-test-design`、approval evidence が存在する。 | low confidence drive、multiple risk terms、missing affected files。 |

## §6 G8-WORKFLOW: 結合検証 workflow

本節は L8/G8 を close するための executable workflow（実行可能 workflow）粒度を定義する。上記の confirmed IT-* case design（確定済み IT case design）は維持しつつ、case rows を repeatable verification process（反復可能な検証 process）へ変換する不足 layer を追加する。model は一般的な test strategy -> test plan -> test condition / coverage item -> test procedure -> evidence -> exit gate chain に従い、HELIX artifacts へ map する。

| Workflow key（workflow key） | G8 contract（G8 契約） |
|---|---|
| `test_strategy` | L5 contracts 向け risk-based integration verification（リスクベース結合検証）。changed module、state、adapter、asset、DB、search、feedback、automation、guardrail、relation graph、document export、proposal coverage boundaries を優先する。 |
| `test_plan` | 各 L8 slice について impacted IT-* rows を select し、mandatory / optional / deferred status を宣言し、execution 前に selected row を test files、doctor checks、verification profiles へ bind する。 |
| `test_conditions` | selected IT-* row はすべて GWT、fixture または boundary setup、assertions、negative / edge coverage を保持する。GWT 粒度の欠落は execution skip ではなく design failure とする。 |
| `coverage_items` | coverage は selected IT-* IDs、source boundary、paired L5 contract、executable evidence path、該当する場合の explicit defer reason で測定する。 |
| `test_procedures` | procedures は targeted `vitest`、`bun run src/cli.ts doctor`、DB rebuild/projection checks、verification-profile commands などの concrete commands とする。slice が明示的に gated されない限り、procedures は external production mutation なしで runnable でなければならない。 |
| `execution_evidence` | integration evidence manifest は command、exit code、IT-* IDs、evidence path、selected/deferred counts、failure routing を記録する。green unit tests だけでは G8 を close できず、manifest が IT-* coverage へ map する必要がある。 |
| `exit_criteria` | G8 は、mandatory selected IT-* rows がすべて passing evidence を持ち、defers がすべて explicit で waiting layer を過ぎておらず、blocking doctor lint が残らず、gate-significant changes の review evidence が記録されている場合だけ pass する。 |
| `defect_routing` | test/evidence が誤りなら L8 correction、L5/L6 contract が誤りなら Reverse、integration structure が弱いなら Refactor、regression なら Recovery、production-impacting failures なら Incident へ route する。 |

初回 L8 ascent 向けの最小 G8 close profile:

| Profile item（項目） | Mandatory evidence（必須 evidence） |
|---|---|
| Strategy and plan | 本 `G8-WORKFLOW` section と concrete child PLAN scope。 |
| Selection | IT-MODULE + IT-STATE など少なくとも 1 つの coherent boundary family、または IT-ADAPTER / IT-DB など根拠付きの higher-risk family。 |
| Procedure | targeted test command(s) と wiring 後の `doctor`。 |
| Evidence | `.ut-tdd/evidence/g8-integration/*.json` 配下の integration evidence manifest、または selected IT-* IDs を明記する PLAN `review_evidence.green_commands`。 |
| Exit | `g8-integration-workflow` doctor check OK、かつ selected mandatory IT-* failure なし。 |
