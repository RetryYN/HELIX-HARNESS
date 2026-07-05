---
title: "Phase 3 workflow automation verification cycle"
date: 2026-06-11
status: completed
scope: "L7 Phase 3 workflow automation verification cycle"
active_plan: PLAN-L7-43
---

# Phase 3 workflow automation verification cycle（検証サイクル）

## 1. スコープ

本レポートは L7 workflow automation の Phase 3 verification cycle である。Phase 4 DB integration を開始する前に、workflow automation slice が実装済みかつ実行可能であることを検証する。

対象範囲:

- L7 automation roadmap spans in `PLAN-DISCOVERY-05-roadmap-registration.md`.
- `doctor`、`plan lint`、`vmodel lint`、runtime status、handover、review evidence、trace/drift/orphan gate を対象にする。
- relation graph、MCP profile safety、tool adapter probe、canonical document export pure core、dependency-drift、regression expansion、L0-L7 verification group surface を対象にする。
- roadmap / function-spec / test-design / PLAN evidence と current source/tests の design consistency。

対象外:

- `.ut-tdd/harness.db` / state DB projection implementation.
- DB-backed feedback、audit、search、quality-signal history、automatic state registration。これらは Phase 4 に残す。
- external MCP/tool execution。現 Phase 3 は catalog/config/safety/probe planning と normalized findings のみを検証する。
- runnable `ut-tdd export docs` CLI。現 Phase 3 は canonical document export library/projection core のみを検証する。

## 2. 派生要件

| Requirement | Evidence |
|---|---|
| L7 automation roadmap が全 gate に到達する | `doctor` reports `PLAN-DISCOVERY-05-roadmap-registration [L7]: gates 7/7 到達, spans 9, 孤児 span 0` |
| workflow automation command が実行可能 | `status --json`、`plan lint`、`vmodel lint`、`doctor`、CLI smoke tests が pass |
| design docs が implementation state と矛盾しない | roadmap、function-spec、PLAN-DISCOVERY-05 の stale items を本 cycle で修正 |
| regression expansion が CLI subprocess smoke coverage を考慮する | `U-REGEXP-003` を追加し、`src/cli.ts` 変更時の `doctor` regression-expansion が OK |
| L0-L7 verification gate が L7 automation evidence を検査する | `doctor` reports `L7 plans 9/9 confirmed, evidence 9/9`。required PLAN status/review/generates evidence が欠けると `U-VTRIG-006` が L0-L7 を fail |
| Phase 3 hard gates が `doctor.ok` で fail-close する | `dependency-drift`、`regression-expansion`、verification groups を `runDoctor.ok` に含める |
| full quantitative gate が green | `bun run test`、`bun run lint`、`bun run typecheck`、`bun run src/cli.ts doctor` が pass |
| Phase 4 boundary が明示される | state DB integration は roadmap/report 上で next cycle とし、Phase 3 completion には含めない |

## 3. 実行 command

```text
bun run src/cli.ts status --json
bun run src/cli.ts --help
bun run src/cli.ts plan lint
bun run src/cli.ts vmodel lint
bun run src/cli.ts doctor
bun run vitest run tests/dependency-drift.test.ts tests/doctor.test.ts tests/runtime-hook-entrypoints.test.ts
bun run vitest run tests/vmodel-pair.test.ts tests/doctor.test.ts tests/dependency-drift.test.ts
```

Phase 3 verification 修正後の full-suite evidence:

```text
bun run test
bun run lint
bun run typecheck
bun run src/cli.ts doctor
```

観測結果: 47 test files / 413 tests passed。lint、typecheck、doctor は exit 0。

## 4. 本 cycle で修正した finding

| Finding | Fix |
|---|---|
| `roadmap.md` が Phase 3 に `plan lint` stub と gate automation 欠落があると述べたままだった | Phase 3 current state を実装済み automation surface へ更新し、Phase 4 DB boundary を明確化 |
| `function-spec.md` が `L7.6 dependency-drift` を `未` のままにしていた | `src/lint/dependency-drift.ts`、`tests/dependency-drift.test.ts`、`PLAN-REVERSE-42` 付きの implemented 状態へ更新 |
| `PLAN-DISCOVERY-05` が古い GATE-B carry wording を使っていた | G-L7.E reached / implementation verification cycle gate landed へ更新 |
| CLI help が doctor/plan/vmodel を scaffold stubs と説明していた | `src/cli.ts` の command descriptions を更新 |
| subprocess CLI smoke tests があるのに `src/cli.ts` 変更で regression-expansion が warning になった | `U-REGEXP-003` と subprocess smoke coverage recognition を `dependency-drift` に追加 |
| L0-L7 verification group が L1-L6 design docs だけを検査していた | 必須 L7 automation PLAN status/review/generates evidence と `U-VTRIG-006` を追加し、`doctor` が `L7 plans 9/9 confirmed, evidence 9/9` を出すようにした |
| `doctor.ok` が dependency/regression/verification group failure を hard-fail していなかった | `dependency-drift`、`regression-expansion`、verification group readiness を `runDoctor.ok` に配線 |
| `PLAN-L7-35` が runnable `ut-tdd export docs` CLI surface を含意していた | Phase 3 は canonical document export pure core のみを扱い、CLI surface は follow-up scope と明確化 |
| cross-review で L0-L7 PLAN status-only evidence が弱いと判明 | `loadVerificationPlanEvidence` を強化し、L0-L7 は confirmed status に加えて `review_evidence` と `generates` metadata を要求 |

## 5. 現在の検証結果

本レポート時点:

- `doctor`: exit 0.
- L7 roadmap は 7/7 gates reached、9 spans、orphan span 0。
- L0-L7 implementation verification cycle gate: L7 plans 9/9 confirmed、evidence 9/9 として freeze complete / verification cycle triggerable を surface。
- `dependency-drift`: OK, no cycles.
- `regression-expansion`: CLI smoke coverage recognition 後 OK（当時の changed set に対する doctor output は `tests=35`）。
- `plan lint`: OK.
- `vmodel lint`: OK, pair-freeze orphan 0.

## 6. Cross-review notes（レビュー記録）

適用した review stance:

- green tests だけでなく stale design claim を確認した。
- workflow command を user-facing automation path として確認した。
- Phase 3 completion を Phase 4 DB completion として過剰主張していないことを確認した。
- external profiles/tools の security boundary が disabled-by-default のままで、implicit install/run が承認されていないことを確認した。

上記修正後、Phase 3 workflow automation slice には blocking implementation gap は見つからなかった。

残リスク / 次 cycle:

- Phase 4 DB integration は設計上まだ open: `.ut-tdd/harness.db`、projection rebuild、feedback/audit/search、automatic registration。
- external MCP/tool execution は opt-in のままで、現行 gate truth には含めない。
- `PLAN-L7-05-biome-debt` は `doctor` の conditional backfill note として残るが、Phase 3 は block しない。

## 6b. Round-2 cross-review（事前の実質確認）

PO request（"are there really no fixes? does it actually work?"）を受け、commit 前に 2 回目の cross-review を実行した。委譲した `code-reviewer`（Sonnet、cross-model）は独立調査を行ったが、2 回の試行で structured verdict は出さなかった。そのため `src/export/document-export.ts` と tests を直接 substance inspection し、finding を確認した。machine gates は green だったが、untested path を隠していた（coverage ≠ substance）。

| Finding | Severity | Fix |
|---|---|---|
| `rendererReady=true` の `xlsx`/`pptx` で `renderDocumentExport` が `renderMarkdown` へ fall through し、markdown bytes を `format:"xlsx"` かつ `ok:true` として誤表示していた（overclaim、PLAN-L7-35 の「Office renderer invocation なし / readiness まで disabled」に違反）。tests は `rendererReady:false` だけを covered。 | Important | xlsx/pptx は markdown へ fall through せず、常に `renderer-unavailable` + empty content。`rendererReady` は finding message だけを変える。`U-DOCEXPORT-013`。 |
| `maxRowsPerChunk: 0` で `chunkRows` が infinite loop した（`i += 0`）。`??` は `0` を捕捉しない。未テストだった。 | Important | `Math.max(1, ...)` lower bound を入れた。`U-DOCEXPORT-014`。 |
| Office-consumed export 向けに、`csvEscape` が CSV formula injection（`=`、`+`、`-`、`@` prefixes）を neutralize していなかった。 | Minor | risky cell に `'` prefix を付ける（OWASP）。`U-DOCEXPORT-015`。 |

修正後 evidence: `bun run test` 47 files / **416 tests** passed。`typecheck`、`lint`、`doctor` は exit 0。`dependency-drift` / `regression-expansion` は OK。この pass 後に既知の High/Important finding は残っていない。

## 7. Decision

Phase 3 workflow automation verification cycle は **pass**。

次の推奨 goal は Phase 4 HELIX-HARNESS DB integration である。automation evidence を DB projection へ ingest し、feedback/audit/state guarantee を完了させる。
