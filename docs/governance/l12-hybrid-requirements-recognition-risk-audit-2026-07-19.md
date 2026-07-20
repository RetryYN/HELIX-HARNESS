# L12・ハイブリッド要件 認識事故監査（2026-07-19）

## 1. 結論

現状は、canonical定数・adapter rules・runtime injectionではL1-L12へ固定したが、PLAN frontmatter parserは既存成果物読込のためcompatibility schemaを使用している。また、要件定義から進行判断に使われる文書本文には旧L0-L14 pairと旧Python proposal-only方針が残る。したがって「要件定義まで不備なし」とは判定しない。新規判断は次のauthorityだけを使う。

狭い旧authority表現のseed集合は`l12-hybrid-recognition-candidate-inventory-2026-07-19.md`の167文書。これだけを全件とは扱わない。独立broad scannerは現行809 filesをreview queueへ出す。初期機械dispositionはcompatibility-labeled 6 / false-positive-execution-command 344 / needs-manual-review 459だが、最終判定には使わない。全文レビュー後のfinal dispositionはconflict 327 / compatibility-labeled 22 / false-positive 444 / historical 16で、safe 482件を本文digestへ束縛済みである。本書のP0/P1表は、直ちに進行判断を誤らせる確定所見と修正順序である。

- canonical layer: L1-L12
- canonical pair: L1↔L12 / L2↔L11 / L3↔L10 / L4↔L9 / L5↔L8 / L6↔L7
- L0 charter: 層外authority anchor
- L0-L14: 既存成果物を読むためのcompatibility projectionのみ
- runtime: ADR-010のPython semantic core / TypeScript・Node transactional boundary
- Python proposal-onlyおよびTypeScript/Bunへの一律再実装: superseded

## 2. 先行是正済み

- `AGENTS.md`: ADR-010責務境界を明記し、TS/Node一律再実装を撤回
- `CLAUDE.md` / `.claude/CLAUDE.md`: L1-L12 canonicalと旧体系への再固定禁止
- `docs/governance/README.md`: Core Readsの先頭authority、ADR-010境界、読み順を是正
- `docs/governance/helix-harness-extraction-plan_v0.1.md`: TypeScript/Bun一律再実装をADR-010責務境界へ是正
- `docs/process/README.md` / `docs/process/modes/README.md`: 工程入口と合流先をL1-L12へ是正
- `docs/process/forward/overview.md`: canonical pair表と概念gateをL1-L12へ是正。残る旧工程記述はcompatibility分離対象
- `src/schema/index.ts` / `src/vmodel/injection.ts`: canonical registryと新規runtime injectionをL1-L12へ固定。frontmatter compatibility parserの分離は未完了
- `.github/workflows/harness-check.yml`: 先行gateを追加済み。ただしbanner存在確認だけで通る範囲があり、semantic negative gateの拡張は未完了

## 3. 残存する現行衝突

### P0: Core Reads・運用正本

| 文書 | 衝突 | 必要な処置 |
|---|---|---|
| `docs/governance/helix-harness-concept_v3.1.md` | 本文でL0-L14を現行spine・旧pairを正規式と断定し、TypeScript/Bun coreも現行定義 | 全本文をcanonical/compatibilityの二層表現へ改訂。旧表は明示したcompatibility appendixへ隔離 |
| `docs/governance/helix-harness-requirements_v1.2.md` | `VALID_LAYERS`、pair、routing、G1-pair、TypeScript/Bun実装詳細が旧authority | canonical要件とcompatibility ingest要件を別section・別IDへ分離 |
| `docs/governance/gate-design.md` | 冒頭はcanonicalだが後段に旧pairが現行説明として残る | gateごとのcanonical pairへ統一し、旧gate番号はcompatibility mapping化 |
| `docs/process/gates.md` | **是正済み**: G1-pair=L1↔L14、G13/G14等を現行gateとしていた | G1-G12へ再定義し、旧G13/G14 evidenceはG12へ投影 |
| `docs/process/forward/L00-L06-design-phase.md` | 旧左腕を現行工程として定義 | L1-L6 canonical設計側へ改訂し、L0をanchorへ分離 |
| `docs/process/forward/L08-L14-verification-phase.md` | 旧右腕・旧pair・G14完了を現行定義 | L7-L12 canonical検証側へ改訂し、旧artifact path対応表を付ける |
| `docs/governance/document-system-map.md` | L0-L14標準mapをgrounding SSoTと宣言 | canonical mapをL1-L12へ更新 |
| `docs/governance/repository-structure.md` | docs/processのL0-L14をSSoTと宣言、Python proposal-only配置 | canonical工程とADR-010 runtime配置へ更新 |
| `src/schema/frontmatter.ts` | 新規PLANとlegacy artifactの読込が同じcompatibility `layerSchema`を共有 | current authoring parserをcanonicalへ、legacy loaderを明示APIへ分離 |
| `tests/l12-canonical-authority.test.ts` | authority tokenの存在確認中心で、旧本文の現行主張を一般拒否できない | process/gate/schema consumerのnegative fixtureを追加 |

### P1: active design・test-design

| 文書 | 主な衝突 |
|---|---|
| `docs/design/harness/L1-requirements/business-requirements.md` | Forward L0-L14、L1↔L14 backprop |
| `docs/design/harness/L1-requirements/screen-requirements.md` | 旧pair statusをUI要件として表示 |
| `docs/design/harness/L3-functional/functional-requirements.md` | Forward L0-L14 |
| `docs/design/harness/L3-functional/nfr-grade.md` | L0-L14実行前提 |
| `docs/design/harness/L4-basic-design/data.md` | Layer enum=L0-L14+cross |
| `docs/design/harness/L5-detailed-design/physical-data.md` | `layerSchema (L0-L14)`を現行契約化 |
| `docs/design/helix/L3-requirements/pillar-functional-requirements.md` | L3↔L12を現行semantic frontierとして使用 |
| `docs/design/helix/L5-detail/layer-ledger-pair-gate.md` | L0-L14 workflowをSSoTと宣言 |
| `docs/design/helix/L6-function-design/universal-reverse-redesign.md` | L1/L14 invalidationを現行関数契約化 |
| `docs/test-design/harness/L1-operational-test-design.md` | L3↔L12を正規pairとして使用 |
| `docs/test-design/harness/L7-unit-test-design.md` | L3↔L12・L14 semanticsを現行期待値として使用 |
| `docs/test-design/helix/L5-universal-reverse-redesign-integration-test-design.md` | 旧pairに基づく期待値 |
| `docs/test-design/helix/L6-universal-reverse-redesign-unit-test-design.md` | 旧pairに基づく期待値 |
| `docs/design/helix/L1-requirements/hybrid-rebaseline-v0.5.0-remediation-delta.md` | Python proposal-only / reject-to-TSを現行remediationとして使用 |
| `docs/design/helix/L3-requirements/vmodel-docgen-fit.md` | Python sourceをTypeScript/Bunへ再実装する前提 |
| `docs/design/helix/L12-vmodel/vmodel-docgen-adoption-matrix.md` | 同上 |
| `docs/design/helix/L5-detail/python-worker-runtime.md` | proposal-onlyをtargetとして定義 |
| `docs/design/harness/L1-requirements/functional-requirements.md` | TypeScript/Bun全面再実装 |
| `docs/design/harness/L6-function-design/backfill-pairing.md` | TypeScript/Bun全面再実装 |
| `docs/design/harness/L6-function-design/agent-slots.md` | TypeScript/Bun全面再実装 |
| `docs/design/helix/L5-detail/pillar-detail-design.md` | TypeScript/Bunを現行coreとして使用 |

### P1: confirmed / active PLANの是正

次のPLANはstatusにかかわらず、後続実装・受入の判断材料になるため、旧authorityを残したまま再利用してはならない。

- `docs/plans/PLAN-L3-00-master.md`
- `docs/plans/PLAN-L4-05-workflow-orchestration.md`
- `docs/plans/PLAN-L1-07-layer-scheme-migration.md`
- `docs/plans/PLAN-L3-13-vmodel-docgen-fit.md`
- `docs/plans/PLAN-L7-421-design-coverage-catalog.md`
- `docs/plans/PLAN-L1-04-technical-requirements.md`
- `docs/plans/PLAN-DISCOVERY-04-workflow-dogfood.md`
- `docs/plans/PLAN-DISCOVERY-07-vmodel-layer-ledger.md`
- `docs/plans/PLAN-DISCOVERY-08-vmodel-pair-gate.md`
- `docs/plans/PLAN-REVERSE-01-workflow-normalization.md`

処置は内容の無言書換えではなく、`superseded_by`またはauthority deltaを追記し、未完了ACだけをcanonical pairへ再採番する。

## 4. 非衝突として分離する資料

- `docs/archive/**`: historical material。現行判断へ引用しない限り修正対象外
- `docs/migration/**`: source inventory / compatibility mapping。runtime authorityとして使わない
- `docs/design/harness/L3-functional/roadmap.md`: V-model freeze時だけ読むdynamic roadmap。旧pairを使う箇所にはcompatibility表示が必要だがCore Readではない
- `docs/design/helix/L3-requirements/hybrid-rebaseline-v0.5.0-collision.md`: canonical/compatibility差を明示しており衝突ではない
- `docs/test-design/helix/vmodel-docgen-fit-acceptance.md`: dual-viewを明示しており衝突ではない
- `docs/governance/hybrid-rebaseline-v0.4.0-fullcheck-audit-*.md`およびintake audit: 当時点監査。先頭にhistorical/superseded表示を要求するが、当時の所見自体は改変しない

## 5. 修正順序と停止条件

1. P0 Core Reads・process・gateを修正する。
2. P1要件・設計・テスト設計をcanonical pairへ再traceする。
3. confirmed PLANへauthority deltaを付ける。
4. compatibility loaderとphysical pathを残したままcanonical CIをgreenにする。
5. canonicalとcompatibilityのどちらか一方でも失敗する間はcutover完了を宣言しない。

新規PLAN、gate、fixture、CI期待値が旧pairを正規値として追加した場合は即時blockする。旧path名が残ること自体はblockせず、そのpathの内容が現行authorityを主張した場合にblockする。
