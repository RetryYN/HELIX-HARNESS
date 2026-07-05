---
plan_id: PLAN-L7-74-task-risk-whole-word-match
title: "PLAN-L7-74 (troubleshoot): whole-word escalation-risk matching in task classify"
kind: troubleshoot
layer: L7
drive: agent
status: confirmed
created: 2026-06-17
updated: 2026-06-17
backprop_decision: not_required
backprop_decision_reason: "Internal harness self-application tooling (lint gate / runtime dispatch / guard / governance mechanism); hardens the harness's own enforcement and does not change the product's external requirement / design / test-design contract, so there is no upstream backprop target."
owner: PM (Opus) / PO (人間)
review_evidence:
  - reviewer: claude-opus-4-8
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-17"
    tests_green_at: "2026-06-17"
    verdict: pass
    scope: "Fix false-positive escalation-risk flags in classifyTask: substring matching flagged 'production' inside 'reproduction', 'schema' inside 'schematic', and 'secret' inside 'secretary'. Replaced with whole-word + optional-plural regex so the safety signal keeps plurals (credentials/payments/schemas) but stops over-flagging innocent words. PM verified via tsc, Biome, 2 new Vitest cases (false-positive guard + plural coverage), full regression, and doctor. Warn-only safety surface; no public signature change, no Reverse pairing required."
    worker_model: claude-opus-4-8
    reviewer_model: claude-opus-4-8
agent_slots:
  - role: tl
    slot_label: "TL - task risk whole-word matching"
generates:
  - artifact_path: docs/plans/PLAN-L7-74-task-risk-whole-word-match.md
    artifact_type: markdown_doc
  - artifact_path: src/task/classify.ts
    artifact_type: source_module
  - artifact_path: tests/task-classify.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-72-task-classify-cli.md
  requires:
    - docs/governance/helix-harness-requirements_v1.2.md
    - docs/adr/ADR-001-helix-harness-redesign-and-language.md
  references:
    - docs/design/harness/L6-function-design/function-spec.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
---

# PLAN-L7-74: task classify の escalation-risk を whole-word で一致判定する

## 0. 目的

リスク語が単なる部分文字列として含まれるだけの task text に対して、
`helix task classify` が誤った `escalation-risk` warning を出さないようにする。
これにより safety signal の信頼性を保つ。過剰検知は alert fatigue を生み、
escalation boundary を弱めるためである。

## 1. 問題

`riskFlags` は各 `RISK_TERMS` entry を `lower.includes(term)` で一致判定していた。
一部の canonical risk term は無害な単語の部分文字列でもあるため、次の false positive が発生していた。

- `production` matched inside `reproduction`;
- `schema` matched inside `schematic`;
- `secret` matched inside `secretary`.

これは bare-`auth`/`author` exclusion が既に防いでいる false-positive class と同種である。
ただし term を長くするだけでは修正できない。`production` / `schema` / `secret` は、
一致させたい単語そのものだからである。

## 2. 範囲

許可する変更:

- `src/task/classify.ts` の `riskFlags` にある substring matching を、
  precompiled whole-word regexes (`\b<term>s?\b`, 大文字小文字を区別しない) へ置き換える。
- safety-relevant plurals (credentials, payments, schemas, migrations) が引き続き flag されるよう、
  optional trailing plural を維持する。safety signal を false negative へ退行させてはならない。
- false-positive guard と plural coverage の Vitest coverage を追加する。

対象外:

- `inferKind` / drive / size heuristics。
- public `classifyTask` signature または CLI I/O。
- risk term の追加または削除。

## 3. 受入条件

- `reproduction` / `schematic` / `secretary` を含む text が `risk_flags` を発生させず、
  `escalation-risk` finding も発生させない。
- `authentication` / `payment` / `schema` と、それらの plurals である `credentials` /
  `payments` / `schemas` は引き続き flag される。
- classification は deterministic のままである。
- typecheck / Biome / Vitest / `helix doctor` は green のままである。
  src file はこの PLAN の `generates` へ trace される。

## 4. 検証

- `bunx vitest run tests/task-classify.test.ts`
- `bun run typecheck`
- `bun run lint`
- `bun run test`
- `bun run src\\cli.ts doctor`

## 5. 状態

Draft。2026-06-17 に実装および検証済み。warn-only safety surface であり contract change はないため、
Reverse back-fill は不要である。
