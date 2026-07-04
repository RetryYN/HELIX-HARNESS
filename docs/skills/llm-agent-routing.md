---
schema_version: skill.v1
name: llm-agent-routing
skill_type: design-contract
applies_to:
  layers:
    - L3
    - L4
    - L5
    - L6
    - L7
  drive_models:
    - Forward
    - Add-feature
    - Discovery
---

# LLM agent routing（LLM agent ルーティング）

HELIX で構築する機能の中で、LLM call、agent delegation、RAG、context injection を扱うための
設計・実装ガイド。PLAN が AI model call、agent slot、context-injection path を追加または変更する場合に適用する
（FR-L1-09 agent guard、FR-L1-12 injection、FR-L1-38 model evaluation）を支える。

## この skill を読むタイミング

- L4–L7 の PLAN が LLM call、agent delegation、skill/context injection path を追加する。
- 機能が複数 agent または model tier にまたがって作業を route する。

## Harness を迂回せず route する

HELIX は provider call を `ut-tdd claude --role <role>`、`ut-tdd codex --role <role>`、
`ut-tdd team run --definition .ut-tdd/teams/<team>.yaml` へ外出しする。source に raw provider call を追加する前に、
次を確認する。

1. 呼び出しが PLAN `agent_slots` で宣言された agent delegation なら、wrapper 経由で route し、session lifecycle、
   handover warning、cost telemetry を捕捉する。
2. `PreToolUse(Agent)` guard（`.claude/hooks/agent-guard.ts`）は、`subagent_type` が allowlist 外の agent call、
   または model が agent frontmatter family と一致しない call を block する。不一致 model を hard-code しない。
3. low-cost-first を適用する。機械的な subtask には成立する範囲で最軽量 model を使い、frontier model は judgement gate と
   design decision に残す（`agent-cost-design` skill 参照）。Model choice と outcome は `model_runs`
   （`ut-tdd telemetry`）へ記録される。

## Context injection の checklist（L4–L5 design gate）

pair-freeze 前に、design doc で次へ回答する。

- [ ] call ごとにどの context を injection するか（skill pack paths、`.ut-tdd/` state、特定の design docs）。
- [ ] call ごとの token budget と overflow strategy（truncate / chunk）。
- [ ] retrieval を使う場合: retrieval unit と、chunk を drop する relevance threshold（empty context を黙って渡さない）。
- [ ] injected context に PII、credentials、payload body を含めない。この 3 つは harness safety boundary で禁止されるため、
      injection 前に redact する。

## RAG / output-contract pattern（L5 で lock）

L6 unit test が contract に対して assert できるように、chunking boundary、similarity threshold、no-match fallback
（empty context を黙って渡さない）、typed output schema（free-form prose ではない）を lock する。

## L7 implementation gates（L7 実装 gate）

- `bun run typecheck` が clean。model-call path に `any` を残さない。
- Unit test は normal response、API error / timeout、context-overflow truncation を cover する。
- 実装後に `ut-tdd review --uncommitted` を実行し、`model_runs` telemetry を review evidence として捕捉する。

## 設計時に対策する failure mode

| Failure | Guard |
|---|---|
| model へ empty context が黙って渡る | call 前に throw し、その path を unit-test する |
| mis-routing による cost spike | model + token を `model_runs` に log し、slot で cap する |
| Agent slot model mismatch | `agent-guard.ts` が PreToolUse で block する |
| injected context に credential が混入 | injection 前に redact し、test で absence を assert する |
