---
plan_id: PLAN-L7-132-green-command-digest-integrity
title: "PLAN-L7-132 (impl): green_command digest 実体検査 — fake substance hard gate"
kind: impl
layer: L7
drive: db
status: confirmed
created: 2026-06-23
updated: 2026-06-30
owner: PM (Opus) / PO (人間)
agent_slots:
  - role: se
    slot_label: "SE - green-command digest integrity hard gate"
  - role: tl
    slot_label: "TL - evidence integrity hard-gate review"
related_l0: docs/governance/ut-tdd-agent-harness-concept_v3.1.md
parent_design: docs/design/harness/L6-function-design/function-spec.md
generates:
  - artifact_path: docs/plans/PLAN-L7-132-green-command-digest-integrity.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/green-command-digest.ts
    artifact_type: source_module
  - artifact_path: tests/green-command-digest.test.ts
    artifact_type: test_code
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
dependencies:
  parent: null
  requires:
    - PLAN-L7-108-review-green-command-evidence
review_evidence:
  - reviewer: code-reviewer (intra_runtime_subagent)
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-23"
    tests_green_at: "2026-06-23"
    verdict: approve
    scope: "green-command digest integrity hard gate: pure auditGreenCommandDigests + node deps + fail-closed doctor aggregation after stale digest cleanup. code-reviewer (sonnet) VERDICT=pass, Critical 0; Important (actual==='' test, case-normalization comment) reflected. green_command digests below are REAL sha256 of evidence_path (this gate dogfoods its own rule — no fake placeholder digests)."
    worker_model: claude-opus-4-8
    reviewer_model: claude-sonnet-4-6
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/green-command-digest.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-23"
        evidence_path: tests/green-command-digest.test.ts
        output_digest: "sha256:0c2c2dd640f1908504899dd88b0f863377c4f94c743bd258b667862c3d606ff6"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-23"
        evidence_path: src/lint/green-command-digest.ts
        output_digest: "sha256:9e68209eead46fab25457e4ffee97d362a81d2c457120ebc3a88d301c97317d3"
---

# PLAN-L7-132 (impl): green_command digest 実体検査

## 0. Objective (PO 指示 2026-06-23「すべて」)

green-command-evidence gate (PLAN-L7-108) は `output_digest` の **形式** しか見ず、それが
`evidence_path` の **実ファイル hash** かを照合しない。よって `sha256:110feedbac000001` のような
fake/プレースホルダ digest が gate を通り、「substance を強制する gate」が fake substance で満たせる
穴がある (coverage ≠ substance のメタ再発、[[feedback_coverage_not_substance]])。本 PLAN はその穴を
**完了判定を止める hard gate** に変換する。

## 1. 実測 (実 repo)

`checkGreenCommandDigests(repoRoot)` を実 repo で実行 → **90 件 / 約 45 PLAN** の `output_digest` が
`evidence_path` の実 hash と不一致 (= 全 green_command digest が fake/stale) を検出。green-command
evidence 制度が実質ゼロ substance で稼働していたことを実証した。

2026-06-30 continuation: PLAN-L7-174 と後続是正で既存 fake/stale digest を実 hash に揃え、
`checkGreenCommandDigests(process.cwd()).ok === true` まで戻した。以後は不一致 1 件でも doctor を
fail-close し、green-command evidence を完了根拠として使わせない。

## 2. 実装 (本 PLAN で着地済)

- `src/lint/green-command-digest.ts`:
  - `auditGreenCommandDigests(plans, deps)` — 各 green_command の `output_digest` が `evidence_path`
    の実 sha256 と一致するか照合し不一致 (digest-mismatch / file-missing) を返す純関数 (I/O 注入)。
  - `nodeDigestAuditDeps` / `greenCommandDigestMessages` (cap 8 + breadcrumb) / `checkGreenCommandDigests`
    (fail-closed ラッパ、repo root / PLAN 読取不能も violation)。
- `src/doctor/index.ts`: **hard gate** として配線 (`greenCommandDigest.ok` を `runDoctor().ok` に含める)。

## 3. 昇格手順 (warn-first → hard gate)

初期導入時点では、既存 committed PLAN (L7-108〜131, REVERSE-*) が fake digest を持っていたため、
即時 hard-fail にすると doctor を一斉赤化させる状態だった。このため導入時は warn-first で実測し、
coordinated cleanup で fake/stale digest を実 hash へ揃えた。

cleanup 完了後の現在形は **hard gate**。`output_digest` が `evidence_path` の実 sha256 と一致しない、
または evidence file が存在しない場合は `green-command-digest — violation` を出し、doctor 全体を
`ok=false` にする。

## 4. AC (acceptance / substance)

- `tests/green-command-digest.test.ts` (6 ケース): 実 hash 一致=pass / fake=digest-mismatch /
  file 不在=file-missing / 空 skip / message 整形 / repo root 不可読時 fail-close。実証 =
  `bun run vitest run` green、`tsc` EXIT=0。
- 実 repo で 90 件検出 (§1) = prose でなく機械事実。
- `tests/doctor.test.ts` が `greenCommandDigest.ok` を hard-gate aggregation に含むことを検証する。

## 5. carry / 次工程

1. **本 PLAN 自身の confirm は実 sha256 で行う** (fake digest を使わない = 本 gate の趣旨を自ら遵守)。
2. **90 件の fake digest 是正** (coordinated): Codex の committed PLAN 群の digest を実 hash へ揃えた。
3. **hard-fail 昇格**: 2026-06-30 に `checkGreenCommandDigests` の `ok` を doctor aggregation に接続した。
4. **evidence_path の意味論確定** (source file か command-output capture か) は L6 設計で継続管理する。

## 6. 壊さない / 再発させない

- green_command の substance は **digest=evidence_path 実 hash** で機械照合する。形式 gate だけに頼らない。
- 是正後は hard gate から advisory へ戻さない。完了判定の根拠に fake/stale evidence を混ぜない。
