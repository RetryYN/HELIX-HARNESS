---
plan_id: PLAN-L7-69-encoding-corruption-expanded-guard
title: "PLAN-L7-69 (troubleshoot): expanded encoding-corruption guard"
kind: troubleshoot
layer: L7
drive: agent
status: confirmed
created: 2026-06-16
updated: 2026-06-19
backprop_decision: not_required
backprop_decision_reason: "Internal harness self-application tooling (lint gate / runtime dispatch / guard / governance mechanism); hardens the harness's own enforcement and does not change the product's external requirement / design / test-design contract, so there is no upstream backprop target."
owner: Codex TL (ticket) / PM (Opus) implementation 2026-06-19
review_evidence:
  - reviewer: claude-code-reviewer (intra_runtime_subagent)
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-19"
    tests_green_at: "2026-06-19"
    verdict: pass
    scope: "PLAN-L7-69 §2-3 残スコープ (.helix/audit/**/*.md + .helix/handover/**/*.json provider cross-agent payload) の mojibake guard 実装をレビュー。verdict=pass-with-nits・Critical 0・changes-required なし。4 設計論点を確認: ①raw JSON text を MOJIBAKE_MARKERS で走査 (parse でなく) は JSON.stringify 産物に対し健全 (mojibake 文字は stringify が出さない・clean ASCII/UTF-8 に false-positive なし) ②空/不在 .helix の fail-open (checked>0 不要) は generated state ゆえ妥当・prose band の checked>0 非対称は意図的で安全 ③walkFiles リファクタは walkMarkdown 既存呼出に behavior-preserving ④doctor hard-gate 配線は invocation/ok-chain/messages の 3 点完備。nit disposition: walkFiles の statSync skip は元 walkMarkdown 継承・read 経路は readFileSync→catch で fail-close 維持 (明確化コメント追記済); 残 nit (catch message の言語/live fixture/audit json 除外) は既存パターン整合 or PLAN scoping 意図ゆえ受容。typecheck/Biome/Vitest 785/doctor EXIT=0。"
    worker_model: claude-opus-4-8
    reviewer_model: claude-sonnet-4-6
agent_slots:
  - role: tl
    slot_label: "TL - encoding corruption guard expansion"
generates:
  - artifact_path: docs/plans/PLAN-L7-69-encoding-corruption-expanded-guard.md
    artifact_type: markdown_doc
  - artifact_path: docs/improvement-backlog.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/readability.ts
    artifact_type: source_module
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
  - artifact_path: tests/readability.test.ts
    artifact_type: test_code
  - artifact_path: tests/doctor.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-68-provider-dispatch-portability.md
  requires:
    - docs/improvement-backlog.md
    - .helix/audit/A-137-unusable-provider-dispatch-audit.md
---

# PLAN-L7-69: encoding-corruption guard の拡張

## 0. 目的

mojibake / encoding-corruption 検出を既存の freeze-readability slice から広げ、handover、audit、provider JSON、governance-facing document が読めない状態へ静かに壊れないようにする。

## 1. 問題

直近 session で、handover と skill/core text の unreadable 化が露出した。既存の readability check は selected freeze document に scope されており、generated handover や audit artifact が readable であることを証明できていなかった。

## 2. 範囲

今後の実装は次を対象にする。

- `docs/handover/**/*.md`
- `.helix/audit/**/*.md`
- `.helix/handover/**/*.json`
- `docs/plans/**/*.md`
- session-start Core Reads として使う governance docs

検出 signal:

- U+FFFD replacement characters;
- 既知の UTF-8/CP932 mojibake marker;
- 主に日本語の document に混在する suspicious marker density;
- 既知の mojibake marker を含む JSON string field。

## 3. 受入条件

- unreadable handover text を含む negative test fixture が fail する。
- mojibake を含む provider JSON の negative test fixture が fail する。
- clean ASCII の handover と audit file は pass する。
- `doctor` が expanded guard と actionable file path を表示する。
- historical vendor snapshot を product-owned failure として扱わないよう、guard scope が十分に限定されている。

## 4. 状態

2026-06-19 に実装済み。§2-3 の broader scope は dedicated runtime-artifact readability guard により close 済み。詳細は §6 実装を参照する。

## 5. 部分実装 note（2026-06-16、§6 で supersede）

2026-06-16 の cleanup では、active internal asset 向けにより狭い first slice を実装した。

- `src/lint/asset-drift.ts` は enrolled agent、skill、prompt asset に残る legacy runtime command/name residue を reject する。
- `src/assets/catalog.ts` は catalog finding に同じ drift signal を使う。
- `.claude/agents/*.md`、`docs/skills/*.md`、`docs/templates/prompts/effort-classify.md` を normalize し、active runtime asset を readable かつ current にした。
- `tests/asset-drift.test.ts`、`tests/asset-catalog.test.ts`、`tests/doctor.test.ts` は、この cleanup で触れた detector と doctor surface を cover する。

その後、2026-06-17 の readability expansion（`loadSystemReadabilityDocs`）で prose band を `docs/` tree 全体（handover、plans、governance `.md`）へ拡張した。これにより §2 の `docs/handover/**` と `docs/plans/**` の markdown coverage は close したが、§6 までは 2 つの surface が open のままだった。対象は `docs/` 外の `.helix/audit/**/*.md` と、JSON が未 scan だった `.helix/handover/**/*.json` provider cross-agent payload である。

## 6. 実装（2026-06-19）

dedicated runtime-artifact readability guard により、prose band を乱さずに残りの §2-3 scope を close した。

- `loadRuntimeArtifactReadabilityDocs`（`src/lint/readability.ts`）は `.helix/audit/**/*.md` と `.helix/handover/**/*.json`（provider cross-agent payload を含む）を shared `walkFiles(dir, ctx)` helper で収集する。同じ `MOJIBAKE_MARKERS`（U+FFFD / em-space-before-ASCII / halfwidth-katakana / curated CP932 token）を raw JSON text に対して走査するため、parse 不能な corrupted JSON も flag できる。`.helix/` は product-owned runtime state である。vendor source snapshot と `legacy local state/` は別の場所にあり、除外を維持する（§3 scoping AC）。
- `runtimeReadabilityMessages` は distinct な `runtime-readability` doctor line を出し、actionable な `path:line:marker` sample を含める。
- `checkRuntimeReadability`（`src/doctor/index.ts`）は hard gate として配線する。fresh repo には corrupt する runtime artifact が無いため absence は fail-open、marker 検出時は fail-close、repo root が読めない場合も fail-close とする。
- `tests/readability.test.ts` の negative fixture は、unreadable handover/audit markdown、mojibake marker を含む provider JSON、provider JSON 内の U+FFFD が fail することを証明する。clean ASCII JSON と fullwidth-only Japanese audit text は pass する。`tests/doctor.test.ts` は gate が hard-gate aggregation に配線され、missing repo root で fail-close することを assert する。

### 受入条件 — 達成

- [x] unreadable handover text を含む negative fixture が fail する。
- [x] mojibake を含む provider JSON の negative fixture が fail する。
- [x] clean ASCII の handover と audit file は pass する。
- [x] `doctor` が expanded guard（`runtime-readability`）と file path を表示する。
- [x] `.helix/` product state に scope し、vendor snapshot は除外する。
