# PLAN-L7-139 Codex hook adapter desk review 監査（cross-runtime judgement gate）

あなたは hybrid Claude+Codex setup の QA reviewer である。Claude が change を作成した。
あなた（Codex、別 model family）は independent judgement gate である。これは
**current UNCOMMITTED working tree のみを対象にした desk review** である。recent
commits、他 PLAN、無関係な foreign changes（例: PLAN-L2-05/06 は scope 外）を review してはならない。
ファイルを変更してはならない。written verdict のみを出力すること。

## Scope（以下の working-tree artifacts だけを review する）

- `hooks.json` (new) — repo-root Codex hook adapter の追加
- `src/lint/codex-hook-adapter.ts` (new) — parity / drift fail-close gate の実装
- `tests/codex-hook-adapter.test.ts` (new) — U-CXHOOK regression tests の追加
- `src/doctor/index.ts` (changed) — `checkCodexHookAdapter` wiring
- `src/lint/project-hook.ts` (changed) — `REQUIRED` / `FORBIDDEN_PATH_RE` を shared SSoT として export
- `docs/plans/PLAN-L7-139-codex-hook-adapter.md` (new) — 対象 PLAN
- `AGENTS.md`, `docs/governance/repository-structure.md`, `docs/test-design/harness/L7-unit-test-design.md` (changed) — docs

## Context（鵜呑みにせず verify する）

Goal: Codex CLI runtime に、Claude と同じ repo-local guardrails（foreign-edit
work-guard + session lifecycle）を与える。logic fork を作らず、同じ TypeScript entrypoints を再利用する。

Claude は real `codex.exe` (codex-cli 0.128.0) binary strings から以下を確認したと claim している。
そのまま受け入れず、reasoning を sanity-check すること:

- Codex hook payload field names は Claude と一致する: `tool_name` / `tool_input` / `file_path` /
  `hook_event_name`。Events は PreToolUse/PostToolUse/SessionStart/Stop (no SubagentStop)。
- Codex tool names は Claude と異なるため、matchers は copy ではなく map されている:
  `Edit|Write|MultiEdit` -> `apply_patch|write_file`; `Bash` -> `exec_command|local_shell`.
- Codex には subagent (Agent) tool も SubagentStop event もないため、`agent-guard` と
  `subagent-stop` は missing ではなく、意図的に omitted された N/A として documented されている。

## 回答すべき questions（adversarial に見る）

1. matcher mapping の correctness: `apply_patch|write_file` は file edits に対して Codex の
   PreToolUse を実際に fire するか。`work-guard.ts` の `tool_input.file_path ?? tool_input.path`
   extraction は Codex の `apply_patch` payload に対して valid か、それとも `file_path` を持たない
   multi-file patch により guard が silent no-op になり false parity となる real risk があるか。
   これは known open residual であるため、あなたの read を示すこと。
2. `agent-guard`/`subagent-stop` の "N/A" は justified か。それとも Codex には guard すべき
   spawn/subagent surface があるか。
3. `analyzeCodexHookAdapter` の fail-close completeness: parity に見えるが実際には違う
   `hooks.json` など、見逃す divergence cases はあるか。
4. ここに、既存の Claude `.claude/settings.json` hooks、`codex-wrapper-parity` gate (U-ADAPTER-009)、
   または global `~/.codex/` への write を degrade する risk はあるか。
5. PLAN classification（kind=troubleshoot, backprop_decision=not_required, PLAN-L7-114-work-guard の mirror）は
   appropriate か。それとも fuller L6->L7 descent にすべきだったか。

## 出力形式

- Verdict: approve / approve-with-changes / reject から選ぶ
- Findings: Critical / Important / Minor。各 finding は file:line と concrete fix を含める
- apply_patch payload risk (Q1) への explicit answer
