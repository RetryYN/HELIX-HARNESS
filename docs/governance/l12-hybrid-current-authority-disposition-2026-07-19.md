# L12・ハイブリッド current authority disposition（2026-07-19）

## 1. 判定基準

`bun scripts/audit-l12-hybrid-recognition.ts --status unresolved --disposition current_authority_review --paths`の候補を人手確認する。第一段でrules / governance / process 38件、独立クロスレビューでdesign / test-design 118件を判定済み。判定は次の4値。

- `conflict`: 旧layer/pair/runtimeを現行手順・SSoT・gate・targetとして使う
- `compatibility-labeled`: 旧記述がcompatibility/superseded/rollbackとして明示され、canonical判断と分離済み
- `false-positive`: canonical pair、恒久Python semantic core、物理path、識別子、検査対象語の引用であり旧authority主張ではない
- `historical`: 当時点audit/cutover packetでありcurrent判断へ使わない

## 2. rules / Core Read entry（4件）

| path | disposition | 根拠 |
|---|---|---|
| `.claude/CLAUDE.md` | compatibility-labeled | L1-L12正規pairとL0-L14 compatibilityを明示。Bunはpre-cutover/rollback境界 |
| `AGENTS.md` | compatibility-labeled | L1-L12、ADR-010責務境界、Bun rollback限定を明示 |
| `CLAUDE.md` | compatibility-labeled | L1-L12 authorityとADR-009/010境界を明示 |
| `docs/governance/README.md` | compatibility-labeled | Core Read順、L12 directive優先、Python proposal-only supersedeを明示 |

## 3. governance（21件）

| path | disposition | 根拠・要修正箇所 |
|---|---|---|
| `docs/governance/audit-framework.md` | conflict | 冒頭でV-model phase gateをG0.5-G14として現行参照 |
| `docs/governance/coding-rules.md` | conflict | line 1で`TypeScript/Bun core`のSSoTと断定 |
| `docs/governance/document-system-map.md` | conflict | 旧pair・L0-L14 mapをDB収束対象/標準mapとして使用 |
| `docs/governance/gate-design.md` | conflict | 冒頭overrideはあるが後段のG13/G14、旧pair説明が現行gate本文に混在 |
| `docs/governance/helix-harness-concept_v3.1.md` | conflict | §3、用語表、coding-rulesで旧pair/L0-L14/TypeScript-Bunを現行定義 |
| `docs/governance/helix-harness-extraction-plan_v0.1.md` | conflict | line 63以降に`TS/Bun再実装`を実行方針として残す |
| `docs/governance/helix-harness-requirements_v1.2.md` | conflict | VALID_LAYERS、pair、gate、実装詳細本文が旧authority。冒頭overrideだけでは不十分 |
| `docs/governance/repository-structure.md` | conflict | ADR-009 proposal worker、L0-L14 process SSoT、proposal-only配置を現行規範化 |
| `docs/governance/infinity-loop-assertion-coverage-ledger.md` | false-positive | Python worker/component名はADR-010下の恒久semantic/data plane。旧proposal-only主張ではない |
| `docs/governance/infinity-loop-design-progress-ledger.md` | false-positive | L1-L12 pairを現行進捗として使用。Node/Bunは未完cutover slice名/互換進捗 |
| `docs/governance/infinity-loop-design-slice-registry.md` | false-positive | Python runtime sliceはADR-010 current design対象 |
| `docs/governance/infinity-loop-requirement-authority-binding.md` | false-positive | L2/L11・L3/L10をcanonical pairとして使用 |
| `docs/governance/infinity-loop-requirement-coverage-ledger.md` | false-positive | PythonWorkerBrokerはcurrent component名 |
| `docs/governance/infinity-loop-requirement-definition-ledger.md` | false-positive | L2/L11・L3/L10をcanonical pairとして使用 |
| `docs/governance/infinity-loop-requirements-definition-review-2026-07-19.md` | compatibility-labeled | L1-L12 canonical review。物理legacy pathを明示分離 |
| `docs/governance/infinity-loop-source-capability-ledger.md` | false-positive | Python worker/core capabilityのcurrent inventory |
| `docs/governance/infinity-loop-system-assertion-cases.md` | false-positive | Python semantic/data planeのcurrent assertion |
| `docs/governance/session-handover-atomic-cutover-packet.md` | historical | 物理L11/L14 evidence pathを列挙するcutover packet。canonical工程主張ではない |
| `docs/governance/session-handover-retirement-disposition.md` | historical | retention dispositionの当時点証跡 |
| `docs/governance/upstream-helix-reconciliation-completeness-2026-07-04.md` | historical | 2026-07-04時点の旧PLAN inventory |

## 4. process（14件）

| path | disposition | 根拠・要修正箇所 |
|---|---|---|
| `docs/process/README.md` | conflict | 冒頭は是正済みだが読む順序が`L08-L14`、layer-bound mode説明・右腕表記が旧工程へ誘導 |
| `docs/process/forward/L00-L06-design-phase.md` | conflict | L0を設計層、L14価値検証、L2-L10 mock pairとして現行手順化 |
| `docs/process/forward/L07-implementation.md` | conflict | current verification commandに`bun test`を無ラベル掲載 |
| `docs/process/forward/L08-L14-verification-phase.md` | conflict | 文書全体がG8-G14/L13/L14を現行右腕正本として定義 |
| `docs/process/forward/overview.md` | conflict | canonical表は是正済みだが冒頭diagramと旧正規式blockが現行overview内に残る |
| `docs/process/gates.md` | conflict | G1=L1↔L14、G13/G14を現行fail-close gateとして定義 |
| `docs/process/modes/README.md` | conflict | 合流先は是正済みだがmode台帳/右腕説明にL13/L14・旧physical gateを現行列として残す |
| `docs/process/modes/add-feature.md` | conflict | 影響範囲を`L1-L14 doc`と現行手順化 |
| `docs/process/modes/discovery.md` | conflict | 昇格先を`Forward L0-L14`、current command例を`bun`として記載 |
| `docs/process/modes/incident.md` | conflict | 恒久対策をForward L0-L14、運用改善をL13/L14へroute |
| `docs/process/modes/recovery.md` | conflict | 復帰先をL0-L14、再発防止をL14へroute |
| `docs/process/modes/reverse.md` | conflict | 接続先をForward L0-L14として定義 |
| `docs/process/modes/scrum.md` | conflict | fullback先をL0-L14、運用整合をL11-L14、command例をbunで定義 |
| `docs/process/modes/version-up.md` | conflict | review policyをL14 auditへ接続 |

## 5. 集計と進行判断

| disposition | 件数 |
|---|---:|
| conflict | 22 |
| compatibility-labeled | 5 |
| false-positive | 8 |
| historical | 3 |
| **合計** | **38** |

この38件について、進行を止める直接blockerは22件。特にconcept / requirements / repository-structure / coding-rules / process全体は、後続設計やPLANが参照するためP0である。false-positive/historicalはscanner allowlistへ直ちに埋め込まず、根拠が変化した場合に再検出できる状態を維持する。

## 6. design / test-design クロスレビュー（118件）

### 6.1 conflict（89件）

- `docs/design/harness/**`: scanner対象39件すべて。旧pair、L13/L14、Bun coreをconfirmed/draft契約として使用
- `docs/test-design/harness/**`: scanner対象8件すべて。旧pair/G13/G14をtest oracleとして使用
- `docs/design/helix/L1-requirements/{hybrid-rebaseline-v0.5.0-remediation-delta,pillar-requirements}.md`
- `docs/design/helix/L10-ux/ux-evidence-boundary.md`
- `docs/design/helix/L11-uat/uat-evidence-boundary.md`
- `docs/design/helix/L12-acceptance/acceptance-evidence-index.md`
- `docs/design/helix/L12-vmodel/{hybrid-rebaseline-v0.5.0-operation,vmodel-docgen-adoption-matrix,vmodel-layer-coverage}.md`
- `docs/design/helix/L13-post-deploy/post-deploy-evidence-boundary.md`
- `docs/design/helix/L14-operations/operations-feedback-boundary.md`
- `docs/design/helix/L3-requirements/{pillar-functional-requirements,vmodel-docgen-fit}.md`
- `docs/design/helix/L4-basic-design/pillar-basic-design.md`
- `docs/design/helix/L5-detail/{engine-detector-execution,layer-ledger-pair-gate,pillar-detail-design,python-worker-runtime,source-capability-atomization-closure,source-capability-capture,universal-reverse-redesign}.md`
- `docs/design/helix/L6-function-design/{engine-detector-execution,github-pr-audit-promotion,layer-ledger-pair-gate,pillar-function-design,python-worker-runtime,source-capability-atomization-closure,universal-reverse-redesign}.md`
- `docs/design/helix/L7-implementation/implementation-evidence-index.md`
- `docs/design/helix/L8-integration/integration-evidence-index.md`
- `docs/test-design/helix/{L1-pillar-operational-test-design,L2-screen-ux-test-design,L3-pillar-acceptance-test-design,L3-retention-purge-acceptance-test-design,L5-layer-ledger-pair-gate-integration-test-design,L5-python-worker-runtime-integration-test-design,L5-universal-reverse-redesign-integration-test-design,L6-layer-ledger-pair-gate-unit-test-design,L6-pillar-unit-test-design,L6-python-worker-runtime-unit-test-design,L6-universal-reverse-redesign-unit-test-design,L9-infinity-loop-platform-system-test-design,vmodel-docgen-fit-acceptance}.md`

代表根拠はbusiness requirementsの旧6 pair/G14、functional requirementsのL3↔L12、data designのL0-L14 enum、retention testのL3→L12、Python runtime testのproposal-only oracle。HELIX側L13/L14文書はpathだけでなくfrontmatter/statusと本文がcurrent layer authorityを主張するためconflictである。

### 6.2 compatibility-labeled（6件）

- `docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md`
- `docs/design/helix/L2-screen/screen-mock-boundary.md`
- `docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md`
- `docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md`
- `docs/test-design/helix/L1-infinity-loop-operational-test-design.md`
- `docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md`

canonical metadata/pairとlegacy物理path/layerを明示分離している。

### 6.3 false-positive（23件）

- Bunを除去対象、rollback、negative fixtureとして扱う8件: `docs/design/helix/L5-detail/{node-runtime-cutover,os-portability-supply-chain}.md`、`docs/design/helix/L6-function-design/{node-runtime-cutover,os-portability-supply-chain}.md`と各L5 integration / L6 unit test-design
- ADR-010のPython semantic処理＋Node commit/security境界またはsource言語記述14件: `docs/design/helix/L3-requirements/{document-agent-metadata,github-autonomous-operations-requirements,legacy-helix-extension,visualization-requirements}.md`、`docs/design/helix/L5-detail/{intake-contract-normalization,product-data-connector}.md`、`docs/design/helix/L6-function-design/{document-semantic-diff,product-data-connector,source-capability-capture}.md`、対応するengine/product/source/legacy test-design 5件
- `docs/test-design/helix/orchestration-memory.md`: pre-cutover Bun SQLite fixtureの観測で、target authority主張ではない

### 6.4 集計

| disposition | 件数 |
|---|---:|
| conflict | 89 |
| compatibility-labeled | 6 |
| false-positive | 23 |
| historical | 0 |
| **合計** | **118** |

rules/governance/processと合わせて156件を人手判定済み。内訳はconflict 111 / compatibility-labeled 11 / false-positive 31 / historical 3。

## 7. ADR / reference / skill / template / backlog（41件）

### conflict（36件）

- `docs/improvement-backlog.md`: open itemがL13/L14、旧pair、Bun targetを前提にrouteされ得る
- `docs/reference/setup-guide.md`: 必須runtimeをBunと断定
- `docs/skills/{adversarial-review,browser-testing-and-screen-verification,ci-deploy-and-rollback,ci-gate-design,code-review-and-quality,code-review,context-engineering,data-migration,db,debt-register,debugging-and-error-recovery,dependency-map,deprecation-cutover,documentation,error-fix,gate-planning,git,harness-observability,incident-runbook,incremental-implementation,judgment-core,llm-agent-routing,planning-and-task-breakdown,poc,refactoring,reverse-analysis,security-and-hardening,security,test-driven-development,testing,verification}.md`: 旧layer range/pairまたは無ラベルのBun commandを実行規範として提示
- `docs/templates/adapter/.claude/commands/helix-test.md`: Bun commandをcurrent adapter templateへ埋込み
- `docs/templates/github/common/recovery.md`: `L14 route`をcurrent issue templateとして提示
- `docs/templates/plan/impl/template.md`: runner enumをBun前提で固定

### compatibility-labeled（1件）

- `docs/adr/ADR-009-node-python-linux-runtime.md`: ADR-010の部分supersedeと脱Bun/残存security boundaryを明示

### false-positive（1件）

- `docs/adr/ADR-010-python-semantic-core-node-commit-boundary.md`: proposal-only/Bunをsupersede対象として引用するcurrent authority

### historical（3件）

- `docs/reference/quality-sweep4-2026-07-12.md`
- `docs/reference/system-review-sweep2-2026-07-12.md`
- `docs/reference/system-review-triage-2026-07-12.md`

## 8. executable surface（13件）

13件すべて`conflict`。実行・生成・template入力へ直接届くため、単なる文書debtより優先する。

- `.github/ISSUE_TEMPLATE/recovery.md`
- `.github/workflows/escalation-stale.yml`
- `.github/workflows/harness-check.yml`
- `docs/design/design-catalog.yaml`
- `docs/design/harness/L4-basic-design/tokens.yaml`
- `docs/governance/generated/v051-remediation-finding-ledger.yaml`
- `docs/governance/plan-descent-baseline.json`
- `docs/governance/plan-entry-routing-baseline.json`
- `docs/skills/review-checklist.yaml`
- `docs/templates/github/common/escalation-stale.yml`
- `docs/templates/github/common/harness-check.yml`
- `docs/templates/github/common/pack-harness-check.yml`
- `package.json`

## 9. context-labeled 8件とcurrent/executable完了集計

scannerがcontext labelを検出した8件も自動safeとはせず人手判定した。

- conflict 5: `docs/design/harness/L6-function-design/backfill-pairing.md`、`docs/design/helix/L0-charter/helix-charter_v0.1.md`、`docs/design/helix/L6-function-design/{legacy-helix-extension,orchestration-memory}.md`、`docs/skills/tech-selection.md`
- compatibility-labeled 1: `docs/design/helix/L1-requirements/hybrid-rebaseline-v0.5.0-intake.md`
- false-positive 1: `docs/design/helix/L5-detail/harness-agent-lifecycle.md`
- historical 1: `docs/templates/state/vmodel.json`

| disposition | current authority 205 | executable 14 | 合計219 |
|---|---:|---:|---:|
| conflict | 152 | 13 | 165 |
| compatibility-labeled | 14 | 0 | 14 |
| false-positive | 33 | 0 | 33 |
| historical | 6 | 1 | 7 |
| **合計** | **205** | **14** | **219** |

## 10. PLAN manual-review queue（558件）

frontmatter statusは全558件で取得できたが、statusだけでは意味dispositionを決めない。confirmedでも旧語を否定・rollback文脈で使う場合があり、completedでも現行hard gateを生成・拘束する場合がある。Bun signalだけを持ち、全出現が`bun run/test`等の実行証跡でtarget authorityを主張しない344件は独立fixture付きで`false_positive_execution_command`と判定した。残る214件は独立クロスレビューで本文を確認し、`conflict` 148件、`false-positive` 66件と確定した。

148件の内訳は、旧pair・L13/L14・G13/G14・旧Python worker境界を現行AC/gate/targetとして使う124件と、Bunを現行runtime/hard gateとして規範化する24件である。66件はBun-only候補90件のうち、検証command、runner名、過去のgreen evidenceに出現するだけのもの。`completed`や`draft`というstatusだけでは分類していない。

| status | 件数 |
|---|---:|
| confirmed | 515 |
| draft | 5 |
| completed | 38 |
| **合計** | **558** |

全pathは次で固定・再現する。

```bash
bun scripts/audit-l12-hybrid-recognition.ts --disposition plan_review --document-status confirmed --paths
bun scripts/audit-l12-hybrid-recognition.ts --disposition plan_review --document-status draft --paths
bun scripts/audit-l12-hybrid-recognition.ts --disposition plan_review --document-status completed --paths
```

`PLAN-L7-62-runtime-portability-guard.md`はcompletedでもcurrent doctor hard gateを生成する反例である。completedを自動historical化しない。

## 11. historical-context routing候補の本文レビュー（25件）

pathはcontext reviewのrouting hintにすぎず、最終historical判定ではない。本文とcurrent authorityへの接続を確認し、次の4値へ確定した。

### conflict（14件）

- ADR 6件: `ADR-001` / `ADR-002` / `ADR-004` / `ADR-005` / `ADR-006` / `ADR-007`。accepted decision本文がBun runtime、TS/Bun control、`bun:sqlite`、旧L13/L14を無ラベルの現行決定として残す
- governance audit 7件: `design-harness-assessment-audit-2026-07-19.md` / `forward-convergence-legacy-debt-audit.md` / `handover-retirement-memory-audit-2026-07-11.md` / `helix-adoption-design-completion-audit-2026-06-30.md` / `helix-l0-l8-design-consistency-audit.md` / `helix-objective-evidence-audit.md` / `requirements-consistency-audit-2026-07-19.md`。現行hard check、design instruction、現在目標の証跡索引として旧authorityを接続する
- active requirement input 1件: `docs/research/worker-runtime-security-requirements-instruction-2026-07-19.md`。進行中rebaselineへの差し込み指示で、ADR-009のproposal-only Python境界を現行前提にする

### compatibility-labeled（1件）

- `docs/governance/ut-tdd-github-operations-reference-audit-2026-07-18.md`: 「HELIX要件定義の参考。UTを実行権威にしない」と明示

### false-positive（1件）

- `docs/governance/nfr-consolidation-improvement-audit-2026-07-19.md`: BunはSessionStart障害の実測command/evidenceにのみ出現し、target runtimeを規範化しない

### historical（9件）

- source reconciliation / rejected package record 6件: `helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md` / `helix-harness-upstream-reconciliation-audit-2026-07-07.md` / `hybrid-rebaseline-v0.4.0-fullcheck-audit-2026-07-17.md` / `hybrid-rebaseline-v0.5.0-intake-audit-2026-07-18.md` / `runtime-parity-l0-l3-design-audit-2026-06-02.md` / `upstream-helix-reconciliation-audit-2026-07-04.md`
- source-of-truthではないresearch memo 3件: `cross-artifact-graph-tooling-research-2026-06-09.md` / `mcp-external-verification-profile-research-2026-06-09.md` / `tabelog-ai-driven-requirements-research-2026-06-12.md`

候補pathは次で再現する。

```bash
bun scripts/audit-l12-hybrid-recognition.ts --disposition historical_context_review --paths
```

## 12. compatibility authority（6件）

6件すべて`compatibility-labeled`。

- `docs/design/helix/L3-requirements/hybrid-rebaseline-v0.5.0-collision.md`
- `docs/design/helix/L3-requirements/vmodel-canonical-authority-cutover.md`
- `docs/governance/l12-canonical-vmodel-direction-directive_v0.1.md`
- `docs/plans/PLAN-L3-14-vmodel-canonical-authority-cutover.md`
- `docs/test-design/helix/hybrid-rebaseline-v0.5.0-collision-acceptance.md`
- `docs/test-design/helix/vmodel-canonical-authority-cutover-acceptance.md`

## 13. 全809件の最終disposition

| final disposition | 件数 | 意味 |
|---|---:|---|
| conflict | 327 | 現行authority、gate、target、生成契約へ旧基準を接続している |
| compatibility-labeled | 22 | compatibility/supersede/reference境界が本文で明示される |
| false-positive | 444 | command/evidence、canonical pair、現行Python semantic core等の語彙一致 |
| historical | 16 | 当時点記録・researchでありcurrent authorityにしない |
| **合計** | **809** | path重複なし |

内訳は、current authority/executable 219件 = 165 / 14 / 33 / 7、PLAN 558件 = 148 / 0 / 410 / 0、historical-context routing 25件 = 14 / 1 / 1 / 9、compatibility authority 6件 = 0 / 6 / 0 / 0（順に conflict / compatibility / false-positive / historical）。statusやpathだけで最終意味を決めず、本文確認とクロスレビューを通した。旧集計`conflict 685`は根拠不成立のため採用しない。

最終判定は`classifyFinalRecognitionDisposition`に固定し、次のコマンドで全件または各分類のexact pathを再現できる。`compatibility-labeled` / `false-positive` / `historical`のsafe全482件はpathだけでなくレビュー時の本文SHA-256へ束縛する。本文が変われば`needs_manual_review`へfail-closeし、未知文書はBun commandだけに見えてもsafeへ自動昇格させず`conflict`へ倒す。CIは現在の809件が排他的に1分類へ入り、routing別クロス表と上表の集計に一致し、review manifestに重複・死骸がないことを検査する。

```bash
bun scripts/audit-l12-hybrid-recognition.ts --summary
bun scripts/audit-l12-hybrid-recognition.ts --final-disposition conflict --paths
bun scripts/audit-l12-hybrid-recognition.ts --final-disposition compatibility_labeled --paths
bun scripts/audit-l12-hybrid-recognition.ts --final-disposition false_positive --paths
bun scripts/audit-l12-hybrid-recognition.ts --final-disposition historical --paths
bun scripts/audit-l12-hybrid-recognition.ts --final-disposition needs_manual_review --paths
```
