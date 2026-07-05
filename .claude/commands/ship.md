---
description: 出荷前 fan-out — code-reviewer / security-audit / qa-test を並列実行し、rollback plan 付きで go/no-go を統合判断する
argument-hint: "[任意の scope note]"
judgment_core: v1
---

判断規律の正本は `docs/skills/judgment-core.md`（判断コア SSoT。委譲 4 点セットは §5、
レビュー規律は §4）。`/ship` は HELIX の fan-out orchestrator である。現在の change に対して allowlist 済みの
specialist subagent 3 体を並列実行し、それぞれの report を rollback plan 必須の単一 go/no-go
decision に統合する。trace-freeze→accept transition または L12 deploy の前に使う。

最初に change set と gate state を確定する。
- `helix review --uncommitted` — worktree 用の deterministic review packet。
- `helix status` — execution mode を確認する。judgement gate には cross-agent または
  intra_runtime_subagent review evidence が必要である。
- `helix doctor` — GO 前に structural governance が green でなければならない。

## Phase A — 並列 fan-out

3 つの Agent call は、並列実行されるように 1 turn でまとめて発行する。逐次 call にすると目的を失う。
各 `subagent_type` は `PreToolUse(Agent)` guard の allowlist に含まれ、各 call は agent frontmatter
family と一致する明示 `model` を渡さなければならない。各 prompt は委譲ブリーフ 4 marker
（【objective】【output format】【tool guidance】【task boundary】、judgment-core §5）を含める
（欠落は guard が block する）。

1. **code-reviewer** — staged/uncommitted change に対して five-axis review
   (correctness, readability, architecture, security, performance) を行う。
   `code-review-and-quality` skill を参照する。
2. **security-audit** — 脆弱性と threat の確認（input validation、secrets、auth/authz、dependency risk）
   を行う。`security-and-hardening` と `threat-model` skill を参照する。
3. **qa-test** — happy path、edge case、error path、concurrency の test-coverage analysis を行う。
   `test-driven-development` skill を参照する。

Subagent は subagent を spawn せず、この session へ report だけを返す。

## Phase B — main context で統合

main agent（subagent ではない）が統合する。code-reviewer の Critical/Important finding と
typecheck/lint/test failure を集約し、security-audit の Critical/High finding は blocker に昇格する。
qa-test 由来の coverage gap を突合し、infrastructure、migration、docs は main agent が直接確認する。

## Phase C — 判断

```markdown
## Ship Decision: GO | NO-GO
### Blockers (must fix)        — [persona: finding + file:line]
### Recommended fixes          — [persona: finding + file:line]
### Acknowledged risks         — [risk + mitigation]
### Rollback plan              — trigger conditions; rollback steps; recovery target
### Specialist reports (full)
```

rollback section では `ci-deploy-and-rollback` skill を参照する。

## ルール

1. 3 つの Phase A persona は並列実行し、逐次実行しない。
2. Persona 同士は呼び合わない。main agent が Phase B で統合する。
3. GO の前に rollback plan は必須である。
4. Critical finding がある場合、user が明示的に risk を受容しない限り verdict は NO-GO とする。
5. fan-out を skip できるのは、change が 2 files 以下、diff が 50 lines 未満、かつ auth / payments /
   data access / config/env に触れない場合だけである。それ以外は fan-out を既定とする。
6. accept gate 前に decision と specialist evidence を `.helix/audit/` へ記録する。
