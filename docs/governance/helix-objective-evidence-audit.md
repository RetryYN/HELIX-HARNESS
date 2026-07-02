# HELIX 目標証跡監査

更新日: 2026-07-01

この監査は、現在のユーザー目標をリポジトリ上の証跡へ対応付ける。
設計書の代替ではなく、要求ごとに「意味がどの層へ降下済みか」「どこで実装済みか」
「どこを意図的に保留しているか」「全件完了がどこで block されているか」を示す索引である。

外部ソース HEAD 確認日: 2026-06-30

- `unison-ai-product/UT-TDD_AGENT-HARNESS` default branch `main`: `7f83ca811353ed90b3e981178a1b0c9977dd5863`
- `RetryYN/ai-dev-kit-vscode` default branch `main`: `1cb4c3e9e73e3d2933b353ccaa2b1f64fffa9f23`

検証 / 進捗 source basis 再確認日: 2026-07-01

- NIST SSDF SP 800-218: 検証証跡と provenance は chat-only ではなく、後から検査可能でなければならない。
- ISO/IEC/IEEE 29148: 要求証跡は実装ファイル数ではなく、要求情報と検証根拠で数える。
- ISTQB Glossary: test basis / test oracle の意味が進捗 claim を制約する。適切な oracle の無い green 実行は弱い証跡である。
- Scrum Guide 2020: Product Goal への進捗は inspect/adapt されるため、blocked decision work を完了済み increment の裏へ隠さない。

## 要求証跡マトリクス

| ID | 目標要求 | Status | 正本証跡 | 意味証明 |
|---|---|---|---|---|
| G-01 | upstream `unison-ai-product/UT-TDD_AGENT-HARNESS` の採用候補を確認し、HELIX L3-L6 へ降下している。L7 fork は採用可能な意味に限る。 | proved | `docs/design/helix/L3-requirements/upstream-substance-gap.md`<br>`docs/design/helix/L4-basic-design/upstream-substance-gap.md`<br>`docs/design/helix/L5-detail/upstream-substance-gap.md`<br>`docs/design/helix/L6-function-design/upstream-substance-gap.md`<br>`docs/test-design/helix/upstream-substance-gap.md`<br>`src/runtime/upstream-adoption.ts`<br>`tests/upstream-adoption.test.ts`<br>`tests/vmodel-pair.test.ts` | source commit は `7f83ca811353ed90b3e981178a1b0c9977dd5863` に固定。A146 findings は名前付きで HU-FR / HUT-SYS / HU-C / U-UPSTREAM へ写像済み。L7 helper は hollow coverage、projection-only telemetry、blanket governance allow、未検証 runtime matcher claim を拒否する。 |
| G-02 | 旧 HELIX `RetryYN/ai-dev-kit-vscode` を確認し、拡張前に HELIX L3-L6 へ降下している。 | proved | `docs/design/helix/L3-requirements/legacy-helix-extension.md`<br>`docs/design/helix/L4-basic-design/legacy-helix-extension.md`<br>`docs/design/helix/L5-detail/legacy-helix-extension.md`<br>`docs/design/helix/L6-function-design/legacy-helix-extension.md`<br>`docs/test-design/helix/legacy-helix-extension.md`<br>`src/runtime/legacy-adoption.ts`<br>`tests/legacy-adoption.test.ts`<br>`tests/vmodel-pair.test.ts` | source commit は `1cb4c3e9e73e3d2933b353ccaa2b1f64fffa9f23` に固定。旧 HELIX inventory は file count ではなく意味で分類し、個人/global path、raw legacy state、未知 workflow、advisory-only detector output を current truth から除外する。 |
| G-03 | L7 実装へ L7.5 RUN & Debug を追加し、L6 logging 設計の保守性を改善している。 | proved | `docs/design/harness/L6-function-design/function-spec.md`<br>`docs/design/harness/L6-function-design/session-log.md`<br>`docs/design/harness/L5-detailed-design/physical-data.md`<br>`src/runtime/run-debug.ts`<br>`tests/run-debug.test.ts`<br>`tests/cli-surface.test.ts`<br>`tests/projection-writer.test.ts` | runtime 挙動 claim は session / source / surface / timestamp / evidence と append-only `runtime-verification.jsonl` を必要とする。accepted runtime verification は projection-only evidence と分離済み。session-log は fail-open / sanitize を維持し、RUN & Debug closure は不完全 runtime claim を fail-close する。 |
| G-04 | VSCode Webview/View 用の asset / progress visualization を L1 に追加・起票し、UI より先に DB / Markdown の deterministic response を検証している。 | proved | `docs/design/helix/L1-requirements/pillar-requirements.md`<br>`docs/plans/PLAN-DISCOVERY-10-helix-asset-visualization.md`<br>`docs/plans/PLAN-L7-206-visualization-read-model-response.md`<br>`docs/plans/PLAN-REVERSE-206-visualization-read-model-response.md`<br>`src/state-db/visualization-read-model.ts`<br>`tests/visualization-read-model.test.ts`<br>`tests/cli-surface.test.ts` | L1 は DB / Markdown / relation graph 由来の deterministic visualization を要求する。最初の UI-facing response は `ut-tdd progress snapshot --json` の `visualization-snapshot.v1`。Webview / View 実装は後続 renderer であり、authoring source にならず、projection-only runtime evidence を受け入れない。 |
| G-05 | L7 roadmap を database / service / frontend / UI と supporting verification の feature pack で定義している。 | proved | `docs/plans/PLAN-L7-207-l7-feature-pack-roadmap-definition.md`<br>`docs/plans/PLAN-REVERSE-207-l7-feature-pack-roadmap-definition.md`<br>`docs/design/harness/L6-function-design/function-spec.md`<br>`src/schema/roadmap.ts`<br>`src/lint/roadmap-registry.ts`<br>`tests/roadmap.test.ts` | Roadmap schema は `feature_packs[]` と `span.feature_pack` を持つ。database / service / frontend / UI pack 欠落時は doctor が fail する。UI 実装は deferred feature-pack span として残るため、DB / read-model 作業だけで UI を閉じない。 |
| G-06 | test-design 側に test strategy だけでなく verification strategy を含めている。 | proved | `docs/test-design/helix/L3-pillar-acceptance-test-design.md`<br>`docs/test-design/helix/L4-pillar-system-test-design.md`<br>`docs/test-design/helix/L5-pillar-integration-test-design.md`<br>`docs/test-design/helix/L6-pillar-unit-test-design.md`<br>`docs/test-design/harness/L7-unit-test-design.md`<br>`tests/vmodel-pair.test.ts` | right-arm 文書は unit / system / integration / acceptance test と runtime verification claim を分離する。runtime parity、visualization、acceptance closure は、件数だけの test presence ではなく L7.5 evidence または明示 substitute oracle を必要とする。 |
| G-07 | 新規 HELIX 導入が内部 adapter 設定を取り込めるように、Claude Code / Codex plugin/config setup を事前実装している。 | proved | `.claude/settings.json`<br>`.codex/config.toml`<br>`.codex/hooks.json`<br>`src/setup/templates.ts`<br>`src/lint/codex-hook-adapter.ts`<br>`tests/setup.test.ts`<br>`tests/codex-hook-adapter.test.ts`<br>`tests/doctor.test.ts` | setup は Claude / Codex adapter template を出し、Codex hooks feature enablement も含む。doctor は `.codex/hooks.json` wiring と `.codex/config.toml` `[features].hooks=true` の両方を証明する。hosted / API tool は機械 hook coverage 外として明示する。 |
| G-08 | L3 に test / verification performance NFR を含め、UT-TDD naming を HELIX へ移行中である。 | proved | `docs/design/helix/L3-requirements/pillar-functional-requirements.md`<br>`docs/test-design/helix/L3-pillar-acceptance-test-design.md`<br>`docs/test-design/helix/L6-pillar-unit-test-design.md`<br>`tests/vmodel-pair.test.ts`<br>`tests/rule-drift.test.ts` | `HR-NFR-P5-03` は fast / default / full profile、worker / resource budget、timeout、p95 duration budget、evidence を定義する。prose 上の product 名は HELIX。`ut-tdd`、`.ut-tdd`、`UT-TDD:managed` などの機械識別子は unsafe partial rename を避けるため、`PLAN-M-02` まで意図的に deferred とする。 |
| G-09 | 完了 claim は数量だけでなく意味で判定する。 | proved | `docs/governance/helix-objective-evidence-audit.md`<br>`src/lint/objective-evidence-audit.ts`<br>`tests/goal-evidence-audit.test.ts`<br>`tests/upstream-adoption.test.ts`<br>`tests/legacy-adoption.test.ts`<br>`tests/roadmap.test.ts`<br>`tests/doctor.test.ts`<br>`bun run src/cli.ts status --json` | 証跡 row は current-source commit、L3-L6 descent、L7 decision / oracle coverage、doctor gate、明示 non-goal を要求する。file count、green test count、roadmap span count だけでは採用を証明しない。`objectiveProgress` は evidence-row 基準であり、現在の進捗は 90% (9/10 objective rows proved)。G-10 が block されているため `completionClaimAllowed=false` のままである。 |
| G-10 | L14 / whole-program completion は、未了 PLAN、version-up parked item、PO/S4 decision、人間承認、不可逆 migration、open defer が残っていない場合だけ claim できる。 | blocked | `bun run src/cli.ts status --json`<br>`src/lint/outstanding.ts`<br>`src/lint/completion-decision-packet.ts`<br>`tests/outstanding.test.ts`<br>`tests/completion-decision-packet.test.ts`<br>`tests/cli-surface.test.ts`<br>`docs/process/forward/L08-L14-verification-phase.md`<br>`docs/process/gates.md` | 現在は `outstanding.completionReadiness.ok=false`。blocker は `human_approval_pending`、`irreversible_migration_pending`、`non_terminal_plans`、`po_decision_pending`、`version_up_parked`。未了 PLAN は `PLAN-DISCOVERY-07-design-bottomup-mode`、`PLAN-DISCOVERY-10-helix-asset-visualization`、`PLAN-L7-146-serverless-readonly-share`、`PLAN-M-02-helix-identifier-rename`。したがって検証と workflow hardening の slice が green でも、active objective は未完了である。残作業は、promotion / rejection / Forward merge 前の PO/S4 decision 記録、high-impact action 前の human/action-binding approval 記録、future version-up activation decision までの parked 維持、active frontier completion への混入禁止、不可逆 migration/cutover 前の明示 PO signoff 取得、routine work として state move しないこと。機械照合用 `requiredActions`: `record the PO/S4 decision before promotion, rejection, or Forward merge`; `record required human/action-binding approval before executing the high-impact action`; `keep parked until a future version-up activation decision is recorded; do not count this as active frontier completion`; `obtain explicit PO signoff before irreversible migration/cutover; do not implement the state move as routine work`。 |

## 目標進捗

`objectiveProgress` は、同じ監査マトリクスと現在の `outstanding.completionReadiness` から
`ut-tdd status --json` が出す。percent は whole-program completion claim ではない。

- method: `objective-evidence-audit.v1`
- percent: 90
- provedRequirements: 9
- totalRequirements: 10
- blockedRequirements: 1
- completionClaimAllowed: false

G-10 が残る blocked requirement である。`outstanding.completionReadiness.ok=true` になるまで、
percent は `completionClaimAllowed=false` と結合したままにする。

## 既知の非ゴール

- この監査は VSCode extension や Webview renderer の実装完了を claim しない。ここでの要求は、
  L1 requirement、plan ticket、UI 前の verified deterministic response である。
- この監査は、Python、Bash、personal path、`.helix` state、global config を直接 port して旧 HELIX
  runtime parity を claim しない。
- この監査は機械識別子を in-place rename しない。安全な atomic rename は引き続き `PLAN-M-02`
  migration scope である。
- この監査は `outstanding.completionReadiness.ok=false` の間、L14 / whole-program completion を claim しない。
