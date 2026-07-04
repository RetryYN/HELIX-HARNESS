---
description: five-axis code review — correctness, readability, architecture, security, performance
argument-hint: "[optional file/scope]"
---

UT-TDD の current change（uncommitted または recent commits）に対して five-axis review を行う。
`code-review-and-quality` skill を使い、security 観点は `security-and-hardening`、adversarial framing は
`adversarial-review` から取り込む。

deterministic packet である `ut-tdd review --uncommitted` から開始する。

5 つの axis すべてで review する。

1. **Correctness** — design/spec と一致しているか。edge case は扱われているか。test は十分で、
   real oracle を assert しているか（complex object に `toBeTruthy` を使っていないか）。
2. **Readability** — name は明確か。logic は straight-forward か。local style に合っているか。
3. **Architecture** — existing pattern に従い、boundary が clean で、abstraction が適切か。
   V-model descent obligation を満たしているか（impl が L5/L6 design へ trace するか）。
4. **Security** — input validation、code/docs への secrets/PII 混入なし、escalation boundary の遵守
   （auth/payments/PII を silent change していないこと）を確認する。
5. **Performance** — N+1 や hot path 上の unbounded operation がないか確認する。

finding は Critical / Important / Suggestion に分類し、具体的な `file:line` reference と fix recommendation を付ける。

Gate awareness: `ut-tdd gate <id>` は execution mode を `ut-tdd status` から読む。judgement gate には
cross-agent review evidence（hybrid）または `intra_runtime_subagent` evidence（single runtime）が必要である。
self-review だけでは accept gate を clear しない。承認前に `ut-tdd doctor` が exit 0 であることを確認する。
