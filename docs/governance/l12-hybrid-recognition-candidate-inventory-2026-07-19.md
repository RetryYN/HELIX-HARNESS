# L12・ハイブリッド認識リスク seed inventory（2026-07-19）

## 1. 対象と判定

旧L0-L14、旧pair（L1↔L14 / L2↔L10 / L3↔L12）、または旧runtime方針（Python proposal-only / TypeScript・Bun一律再実装）を狭いlexical条件で含む非archive・非migration文書を抽出したseed集合である。自己生成auditを除く重複除去後は175文書。

この175件は全候補の閉包ではない。空白・説明語・表行を挟むpair、L13/L14・G13/G14単独、Bun単独、Python worker/runtime同義表現は`src/lint/l12-hybrid-recognition.ts`の独立broad scannerで検出する。自己生成auditを除く現行broad queueは830 filesで、次のコマンドがpath・line・signal・excerpt・初期dispositionをJSON出力する。

```bash
npx --no-install tsx scripts/audit-l12-hybrid-recognition.ts
npx --no-install tsx scripts/audit-l12-hybrid-recognition.ts --summary
npx --no-install tsx scripts/audit-l12-hybrid-recognition.ts --status unresolved --disposition current_authority_review --paths
npx --no-install tsx scripts/audit-l12-hybrid-recognition.ts --status unresolved --disposition executable_surface_review --paths
npx --no-install tsx scripts/audit-l12-hybrid-recognition.ts --disposition plan_review --document-status confirmed --paths
```

このinventoryへの掲載は「誤り確定」ではなく「現行判断に使う場合はdispositionが必要」を意味する。分類は次の通り。

- `authority-review`: rules / governance / process / design / test-design / PLAN。現行契約、gate、実装判断へ到達し得るため確認必須
- `context-review`: ADR / research / skill / backlog。過去決定や引用が中心だが、supersede境界が不明なら認識事故になる
- `safe-current`: canonical/compatibilityの差を明示済み。文字列が残っても現行判断はcanonicalへ固定
- `historical`: 当時点記録として保持し、冒頭でcurrent authorityではないと明示する対象

再現コマンド:

```bash
rg -l '(L0-L14|L0.?L14|L1.?L14|L2.?L10|L3.?L12|proposal-only Python|proposal-only worker|Python code port|TypeScript/Bun|TS/Bun|reject.to.TS)' \
  docs AGENTS.md CLAUDE.md .claude/CLAUDE.md \
  --glob '*.md' --glob '!docs/archive/**' --glob '!docs/migration/**' \
  --glob '!docs/governance/l12-hybrid-recognition-candidate-inventory-2026-07-19.md' | sort -u
```

## 2. authority-review対象: rules（3）

- `.claude/CLAUDE.md`
- `AGENTS.md`
- `CLAUDE.md`

3件とも冒頭authorityは是正済み。旧記述がcompatibility以外の規範として残らないことをCIで継続監視する。

## 3. authority-review対象: governance（追加監査を含む）

- `docs/governance/README.md`
- `docs/governance/document-system-map.md`
- `docs/governance/downstream-canonical-reuse-authority-2026-07-19.md`
- `docs/governance/forward-convergence-legacy-debt-audit.md`
- `docs/governance/gate-design.md`
- `docs/governance/handover-retirement-memory-audit-2026-07-11.md`
- `docs/governance/harness-memory-reconciliation-audit-2026-07-19.md`
- `docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md`
- `docs/governance/helix-harness-concept_v3.1.md`
- `docs/governance/helix-harness-extraction-plan_v0.1.md`
- `docs/governance/helix-harness-requirements_v1.2.md`
- `docs/governance/helix-harness-requirements_v1.3.md`
- `docs/governance/helix-l0-l8-design-consistency-audit.md`
- `docs/governance/helix-objective-evidence-audit.md`
- `docs/governance/hybrid-rebaseline-v0.4.0-fullcheck-audit-2026-07-17.md`
- `docs/governance/hybrid-rebaseline-v0.5.1-verification-audit-2026-07-18.md`
- `docs/governance/infinity-loop-design-progress-ledger.md`
- `docs/governance/infinity-loop-requirements-definition-review-2026-07-19.md`
- `docs/governance/l12-canonical-vmodel-direction-directive_v0.1.md`
- `docs/governance/l12-scrum-requirements-completion-audit-2026-07-18.md`
- `docs/governance/l3-progression-authority-rebaseline-2026-07-19.md`
- `docs/governance/requirements-consistency-audit-2026-07-19.md`
- `docs/governance/runtime-parity-l0-l3-design-audit-2026-06-02.md`
- `docs/governance/upstream-helix-reconciliation-audit-2026-07-04.md`
- `docs/governance/predecessor-harness-full-weakness-audit-2026-07-20.md`

`l12-canonical-vmodel-direction-directive`と本監査は`safe-current`。日付付きauditは原則`historical`。README、coding-rules、document-system-map、gate-design、concept、requirements、extraction-plan、repository-structure、active ledgerは`authority-review`を維持する。

## 4. authority-review対象: process（11）

- `docs/process/README.md`
- `docs/process/forward/L00-L06-design-phase.md`
- `docs/process/forward/overview.md`
- `docs/process/modes/README.md`
- `docs/process/modes/add-feature.md`
- `docs/process/modes/incident.md`
- `docs/process/modes/recovery.md`
- `docs/process/modes/reverse.md`
- `docs/process/modes/scrum.md`

全件が運用導線に入るため`authority-review`。README、modes README、overviewの入口は是正済みだが、旧compatibility本文の隔離完了まではclosedにしない。

## 5. authority-review対象: design（追加要件を含む）

- `docs/design/harness/L1-requirements/business-requirements.md`
- `docs/design/harness/L1-requirements/functional-requirements.md`
- `docs/design/harness/L1-requirements/nfr.md`
- `docs/design/harness/L1-requirements/screen-requirements.md`
- `docs/design/harness/L1-requirements/technical-requirements.md`
- `docs/design/harness/L10-ux/visual-design.md`
- `docs/design/harness/L2-screen/README.md`
- `docs/design/harness/L2-screen/screen-detail.md`
- `docs/design/harness/L2-screen/screen-flow.md`
- `docs/design/harness/L2-screen/screen-list.md`
- `docs/design/harness/L2-screen/ui-element.md`
- `docs/design/harness/L2-screen/wireframe.md`
- `docs/design/harness/L3-functional/README.md`
- `docs/design/harness/L3-functional/functional-requirements.md`
- `docs/design/harness/L3-functional/nfr-grade.md`
- `docs/design/harness/L3-functional/roadmap.md`
- `docs/design/harness/L4-basic-design/architecture.md`
- `docs/design/harness/L4-basic-design/data.md`
- `docs/design/harness/L4-basic-design/ui-standard.md`
- `docs/design/harness/L5-detailed-design/physical-data.md`
- `docs/design/harness/L6-function-design/function-spec.md`
- `docs/design/harness/L6-function-design/handover-retirement.md`
- `docs/design/harness/L6-function-design/module-drift.md`
- `docs/design/harness/L6-function-design/vmodel-pair-freeze.md`
- `docs/design/helix/L1-requirements/hybrid-rebaseline-v0.5.0-intake.md`
- `docs/design/helix/L1-requirements/hybrid-rebaseline-v0.5.0-remediation-delta.md`
- `docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md`
- `docs/design/helix/L12-acceptance/acceptance-evidence-index.md`
- `docs/design/helix/L12-vmodel/vmodel-docgen-adoption-matrix.md`
- `docs/design/helix/L2-screen/screen-mock-boundary.md`
- `docs/design/helix/L3-requirements/ai-vision-design-harness-engine.md`
- `docs/design/helix/L3-requirements/hybrid-rebaseline-v0.5.0-collision.md`
- `docs/design/helix/L3-requirements/hybrid-rebaseline-v0.5.1-remediation-requirements.md`
- `docs/design/helix/L3-requirements/l12-scrum-rebaseline-requirements.md`
- `docs/design/helix/L3-requirements/pillar-functional-requirements.md`
- `docs/design/helix/L3-requirements/predecessor-harness-mechanism-hardening-requirements.md`
- `docs/design/helix/L3-requirements/vmodel-canonical-authority-cutover.md`
- `docs/design/helix/L3-requirements/vmodel-docgen-fit.md`
- `docs/design/helix/L4-basic-design/pillar-basic-design.md`
- `docs/design/helix/L5-detail/layer-ledger-pair-gate.md`
- `docs/design/helix/L5-detail/pillar-detail-design.md`
- `docs/design/helix/L5-detail/python-worker-runtime.md`
- `docs/design/helix/L6-function-design/document-semantic-diff.md`
- `docs/design/helix/L6-function-design/layer-ledger-pair-gate.md`
- `docs/design/helix/L6-function-design/orchestration-memory.md`
- `docs/design/helix/L6-function-design/pillar-function-design.md`
- `docs/design/helix/L6-function-design/universal-reverse-redesign.md`

`vmodel-canonical-authority-cutover`と`hybrid-rebaseline-v0.5.0-collision`は`safe-current`。L0 charterは層外anchorとして`safe-current`にできるが、旧pairを工程正本として再提示していないことが条件。他はdesign/test traceへ直接使われるため`authority-review`。

## 6. authority-review対象: test-design（15）

- `docs/test-design/harness/L1-operational-test-design.md`
- `docs/test-design/harness/L3-acceptance-test-design.md`
- `docs/test-design/harness/L7-unit-test-design.md`
- `docs/test-design/harness/L8-integration-test-design.md`
- `docs/test-design/harness/L8-unit-test-design.md`
- `docs/test-design/harness/L9-system-test-design.md`
- `docs/test-design/harness/proposal-document-coverage-routing.md`
- `docs/test-design/helix/L1-pillar-operational-test-design.md`
- `docs/test-design/helix/L2-screen-ux-test-design.md`
- `docs/test-design/helix/L5-layer-ledger-pair-gate-integration-test-design.md`
- `docs/test-design/helix/L5-universal-reverse-redesign-integration-test-design.md`
- `docs/test-design/helix/L6-layer-ledger-pair-gate-unit-test-design.md`
- `docs/test-design/helix/L6-universal-reverse-redesign-unit-test-design.md`
- `docs/test-design/helix/L9-infinity-loop-platform-system-test-design.md`
- `docs/test-design/helix/ai-vision-design-harness-engine-acceptance.md`
- `docs/test-design/helix/l12-scrum-rebaseline-acceptance.md`
- `docs/test-design/helix/vmodel-canonical-authority-cutover-acceptance.md`
- `docs/test-design/helix/vmodel-docgen-fit-acceptance.md`

canonical cutover acceptanceとdocgen fit acceptanceはdual-viewを明示しており`safe-current`。残りは旧pairをoracleとして固定していないか確認必須。

## 7. authority-review対象: PLAN（56）

- `docs/plans/PLAN-DISCOVERY-01-workflow-metamodel.md`
- `docs/plans/PLAN-DISCOVERY-04-process-workflows.md`
- `docs/plans/PLAN-DISCOVERY-07-design-bottomup-mode.md`
- `docs/plans/PLAN-DISCOVERY-08-forward-convergence-invariant.md`
- `docs/plans/PLAN-DISCOVERY-11-l1-l2-elicitation-cycle.md`
- `docs/plans/PLAN-L0-01-helix-charter.md`
- `docs/plans/PLAN-L1-01-business-requirements.md`
- `docs/plans/PLAN-L1-03-screen-requirements.md`
- `docs/plans/PLAN-L1-06-helix-solo-conversion.md`
- `docs/plans/PLAN-L1-07-infinity-loop-platform-requirements.md`
- `docs/plans/PLAN-L2-01-screen-list.md`
- `docs/plans/PLAN-L2-04-wireframe.md`
- `docs/plans/PLAN-L3-00-master.md`
- `docs/plans/PLAN-L3-06-helix-pillar-descent.md`
- `docs/plans/PLAN-L3-07-requirements-binding-enforcement.md`
- `docs/plans/PLAN-L3-08-message-catalog-externalization.md`
- `docs/plans/PLAN-L3-09-requirements-omission-guards.md`
- `docs/plans/PLAN-L3-10-message-catalog-externalization.md`
- `docs/plans/PLAN-L3-11-requirements-omission-guards.md`
- `docs/plans/PLAN-L3-13-vmodel-docgen-fit.md`
- `docs/plans/PLAN-L3-14-vmodel-canonical-authority-cutover.md`
- `docs/plans/PLAN-L4-01-data.md`
- `docs/plans/PLAN-L4-02-architecture.md`
- `docs/plans/PLAN-L4-05-workflow-orchestration.md`
- `docs/plans/PLAN-L4-10-internal-asset-master.md`
- `docs/plans/PLAN-L4-14-ui-standard.md`
- `docs/plans/PLAN-L4-50-orchestration-memory-hybrid.md`
- `docs/plans/PLAN-L5-00-master.md`
- `docs/plans/PLAN-L6-00-master.md`
- `docs/plans/PLAN-L6-23-coding-rules-workflow.md`
- `docs/plans/PLAN-L6-33-tool-adapter-probes.md`
- `docs/plans/PLAN-L6-50-helix-orchestration-memory.md`
- `docs/plans/PLAN-L6-63-feedback-lifecycle.md`
- `docs/plans/PLAN-L7-150-refactor-candidate-closure-sweep.md`
- `docs/plans/PLAN-L7-175-helix-orchestration-memory-impl.md`
- `docs/plans/PLAN-L7-209-objective-evidence-audit.md`
- `docs/plans/PLAN-L7-328-github-preflight-and-audit-hardening.md`
- `docs/plans/PLAN-L7-330-l1-l2-consistency-lint.md`
- `docs/plans/PLAN-L7-340-p6-release-automation-descent.md`
- `docs/plans/PLAN-L7-373-change-package-delta-archive.md`
- `docs/plans/PLAN-L7-397-vmodel-current-location-projection.md`
- `docs/plans/PLAN-L7-398-projection-lint-boundary-repair.md`
- `docs/plans/PLAN-L7-404-feedback-surface-diversity-port.md`
- `docs/plans/PLAN-L7-407-harness-memory-structure-v2.md`
- `docs/plans/PLAN-L7-410-docs-secret-scan-gate.md`
- `docs/plans/PLAN-L7-419-skill-mythos-uplift.md`
- `docs/plans/PLAN-L7-421-design-coverage-catalog.md`
- `docs/plans/PLAN-L7-458-harness-memory-canonical-retirement.md`
- `docs/plans/PLAN-L7-460-l12-dual-projection.md`
- `docs/plans/PLAN-L7-62-runtime-portability-guard.md`
- `docs/plans/PLAN-L7-70-skill-pack-curation.md`
- `docs/plans/PLAN-M-01-cutover-backfill.md`
- `docs/plans/PLAN-RECOVERY-01-internal-asset-recovery.md`
- `docs/plans/PLAN-RECOVERY-02-vmodel-canonical.md`
- `docs/plans/PLAN-REVERSE-01-process-docs.md`
- `docs/plans/PLAN-REVERSE-02-session-log.md`
- `docs/plans/PLAN-REVERSE-10-vmodel-pair-lint.md`
- `docs/plans/PLAN-REVERSE-220-l14-source-ledger-completion-hardening.md`
- `docs/plans/PLAN-REVERSE-458-harness-memory-retirement-contract-recovery.md`

PLANはcompleted/confirmedでも後続PLANのcopy sourceになり得る。本文を無言で改変せず、`superseded_by`、authority delta、または明示的compatibility注記のいずれかを要求する。

## 8. context-review対象（13）

### ADR（6）

- `docs/adr/ADR-001-helix-harness-redesign-and-language.md`
- `docs/adr/ADR-002-dependency-direction-and-auto-map.md`
- `docs/adr/ADR-004-internal-asset-ts-control-boundary.md`
- `docs/adr/ADR-006-cli-framework-commander.md`
- `docs/adr/ADR-007-harness-db-sqlite-projection.md`
- `docs/adr/ADR-009-node-python-linux-runtime.md`
- `docs/adr/ADR-010-python-semantic-core-node-commit-boundary.md`

ADR-010は`safe-current`。ADR-009はNode/Linuxとsecurity boundaryがcurrent、Python proposal-only部分だけADR-010でsuperseded。ADR-001は冒頭にsupersede範囲を明示済み。ADR-002/004/006/007はdecision historyを保持し、冒頭または該当decisionでADR-010 supersede範囲を明示する。

### research（3）

- `docs/research/cross-artifact-graph-tooling-research-2026-06-09.md`
- `docs/research/harness-improvement-from-grok-kimi-oss-2026-07-19.md`
- `docs/research/tabelog-ai-driven-requirements-research-2026-06-12.md`

researchは`historical/context`。要件へ採択した行だけcurrent authorityへ再記述し、research本文を実装契約にしない。

### skill（3）

- `docs/skills/browser-testing-and-screen-verification.md`
- `docs/skills/data-migration.md`
- `docs/skills/reverse-analysis.md`

skillは実行時に読まれるため`context-review`。旧layerを例として残す場合はcompatibilityラベルが必要。

### backlog（1）

- `docs/improvement-backlog.md`

完了済み・open itemの両方を含むため、旧authorityを前提にしたopen itemは再routeする。完了履歴は改変せずhistoricalとして保持する。

## 9. seed集合の閉包条件

174件のseedに加え、broad scanner queueすべてが次のいずれかを持つまで監査はcloseしない。

1. canonicalへ本文改訂済み
2. compatibility sectionへ隔離済み
3. historical/superseded表示済み
4. safe-currentとしてnegative CIで保証済み

単なる冒頭banner、ファイル名、物理L-directory、旧IDの存在だけでは違反にしない。一方、旧pair・旧runtimeをcurrent gate、acceptance、schema、implementation targetとして使う記述はblockerである。
