---
plan_id: PLAN-L7-79-mcp-launcher-argv-tokenization
title: "PLAN-L7-79 (troubleshoot): generated MCP launcher config carries a tokenized argv instead of the whole command string as one arg"
kind: troubleshoot
layer: L7
drive: agent
status: confirmed
created: 2026-06-19
updated: 2026-06-19
backprop_decision: not_required
backprop_decision_reason: "Internal harness self-application tooling (lint gate / runtime dispatch / guard / governance mechanism); hardens the harness's own enforcement and does not change the product's external requirement / design / test-design contract, so there is no upstream backprop target."
owner: Claude TL
parent_design: docs/design/harness/L6-function-design/function-spec.md
review_evidence:
  - reviewer: codex-gpt-5
    review_kind: cross_agent
    reviewed_at: "2026-06-19"
    tests_green_at: "2026-06-19"
    verdict: pass
    scope: "renderGeneratedMcpConfig no longer packs the whole profile command string into a single args element. A tokenizeCommand helper splits profile.command into command head + argv tail so the executable is never re-included in args (command=\"bun\", args=[\"run\",\"test\"], not args=[\"npm test\"]). The probe-hint executable is only a fallback for the command word, never for args. Codex cross-review (claude-opus-4-8 worker, codex-gpt-5 reviewer) verdict pass: args is derived only from command tokens after the head; wrapper commands whose head differs from executable resolve correctly; the plain whitespace tokenizer matches the profile-command contract. Regression oracle U-MCPPROFILE-013 asserts the tokenized argv and that args never equals the whole command string."
    worker_model: claude-opus-4-8
    reviewer_model: codex-gpt-5
  - reviewer: gpt-5.4-mini
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-19"
    tests_green_at: "2026-06-19"
    verdict: pass
    scope: "Follow-up: Codex design/implementation review of the tokenize fix found a probe false-confidence gap — probeVerificationProfile only checked the probe-hint executable (e.g. bun) while renderGeneratedMcpConfig launches the command head (e.g. helix for wrapper profiles), so probe readiness did not cover the generated launcher's launchability. Codex added profileCommandHead + a `launcher` readiness check (commandOk(head, [--help]) when head differs from executable) and oracle U-MCPPROFILE-014. gpt-5.4-mini qualitative subagent review was also run for design/implementation alignment and HELIX separation. Result: the launcher-readiness fix is covered by L6/L7 design/test updates and full regression is green; residual broader design issue is that single-runtime checklist enforcement is split between gate and doctor, to be handled by a separate review-evidence/gate unification PLAN."
    worker_model: codex-gpt-5
    reviewer_model: gpt-5.4-mini
  - reviewer: claude-opus-4-8
    review_kind: cross_agent
    reviewed_at: "2026-06-19"
    tests_green_at: "2026-06-19"
    verdict: pass
    scope: "Cross-provider review of the codex→claude provider handover for the launcher-readiness follow-up. Claude (reviewer) read the diff and verified: the new `launcher` probe check validates exactly the command head renderGeneratedMcpConfig emits (`profileCommandHead`), so probe readiness now covers the generated config's launchability (closes the false-confidence gap where probe only checked the `executable` hint while wrapper profiles launch a different head such as helix); the `head !== executable` guard avoids redundant checks for runner-backed profiles; existing probe tests (testcontainers docker-unavailable, mcp-inspector refusal) stay green; U-MCPPROFILE-014 cites the explicit oracle id. typecheck + biome + full Vitest + doctor (readability/review-evidence/trace) green. Deeper item — profile.command is a display/template string with placeholders for non-runner MCP-server profiles, so the generated config remains an approximate suggestion — is deferred to a separate design PLAN."
    worker_model: codex-gpt-5
    reviewer_model: claude-opus-4-8
  - reviewer: codex-tl-current-location-recovery
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T18:47:48+09:00"
    tests_green_at: "2026-07-09T18:47:48+09:00"
    verdict: pass
    scope: "current-location recovery collect_evidence: MCP launcher argv tokenization と launcher readiness probe が現HEADの fast suite で壊れていないことを再検証する。"
    worker_model: codex
    reviewer_model: codex
    green_commands:
      - kind: unit_test
        command: "npm test:fast"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T18:47:48+09:00"
        evidence_path: tests/verification-profile.test.ts
        output_digest: "sha256:0a56427fb56ec573beb58350c31ad8ef5b217ae5377bd190e4c3d670b5279403"
agent_slots:
  - role: tl
    slot_label: "TL - MCP launcher argv tokenization reliability fix"
generates:
  - artifact_path: docs/plans/PLAN-L7-79-mcp-launcher-argv-tokenization.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/verification-profile.ts
    artifact_type: source_module
  - artifact_path: tests/verification-profile.test.ts
    artifact_type: test_code
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: docs/design/harness/L6-function-design/function-spec.md
    artifact_type: design_doc
dependencies:
  parent: docs/plans/PLAN-L7-44-harness-db-master.md
  requires:
    - docs/plans/PLAN-L7-33-mcp-profile-config-safety.md
    - docs/governance/helix-harness-requirements_v1.2.md
    - docs/adr/ADR-001-helix-harness-redesign-and-language.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
related_l0: docs/governance/helix-harness-concept_v3.1.md
---

# PLAN-L7-79 (troubleshoot): MCP launcher argv tokenization の是正

## 0. 目的

`renderGeneratedMcpConfig` は `mcpServers.<id>` entry で `args` を `[profile.command]` とし、command string 全体を単一 argv element に詰めていた。一方で `command` は `profile.executable ?? profile.command.split(" ")[0]` だった。`bun-unit` のような profile（`command: "npm test:local"`、`executable: "bun"`）では、`command:"bun", args:["npm test:local"]` を出力し、executable を二重に含め、external MCP launcher に malformed argv を渡していた。さらに `command` head と `executable` が異なる wrapper profile（例: `mcp-inspector-smoke`、`command:"helix ..."`、`executable:"bun"`）では、`args` と一致しない `command` を出力し、実行不能になり得た。

## 1. Scope

対象範囲:

- profile command を whitespace-delimited argv array へ分割する `tokenizeCommand(command)` を追加する。empty token は捨てる。
- `renderGeneratedMcpConfig` は `command` を command head token、`args` を残り token にする。`executable` は command word の defensive fallback だけに使い、`args` には使わない。理由は `executable` が PATH-probe hint であり、command head と異なる場合があるためである。
- Regression test（U-MCPPROFILE-013）で tokenized argv と、command string 全体が単一 arg として出ないことを固定する。

対象外:

- external MCP client config schema の変更。`{command, args, env}` は standard MCP launcher shape のままで、今回は `args` の populate 方法だけを正す。
- shell-quoted command string。profile command は plain whitespace-separated words であり、現時点で quote を使う profile はない。

## 2. 受入条件

- `bun-unit` では generated server が `command:"bun"`、`args:["run","test:local"]` になる。
- command head が `executable` と異なる wrapper profile では、`command` は probe-hint executable ではなく command head になる。
- generated server が command string 全体を単一 `args` element として持たない。
- 既存 U-MCPPROFILE-004..006 は green を維持し、typecheck、lint、full Vitest、`helix doctor` も green を維持する。

## 3. Test design pairing（対応）

Unit test design entry は `docs/test-design/harness/L7-unit-test-design.md`（U-MCPPROFILE-013）である。Red->Green は、fix 前の `args` が `[profile.command]`（whole string）であり、fix 後は tokenized tail になり executable が再混入しないことを示す。

## 4. Status

Confirmed。2026-06-19 に実装し、cross-review 済み。Disposition（D#5）は実装前に TL-approved であり、具体 diff は caller-invariant risk を記録した上で Codex cross-review（verdict pass）を受けた。

Follow-up（2026-06-19、codex→claude provider handover）: tokenize fix の Codex review で probe false-confidence gap が見つかった。probe は executable hint だけを検査し、generated launcher command head を検査していなかった。Codex は `launcher` readiness check（oracle U-MCPPROFILE-014）を追加した。さらに gpt-5.4-mini qualitative subagent review を 2 回実行し、1 回は design/implementation alignment、もう 1 回は HELIX separation を確認した。現在の probe は generated config が launch するものと同じ command head を検証する。残る broader item、つまり single-runtime checklist enforcement が `gate` と `doctor` surface に分かれている点は、別の review-evidence/gate unification PLAN へ defer し、ここでは close しない。
