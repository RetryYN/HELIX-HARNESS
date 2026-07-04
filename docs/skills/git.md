---
schema_version: skill.v1
name: git
skill_type: process
applies_to:
  layers:
    - L7
    - L8
    - L10
    - L12
    - L14
  drive_models:
    - Forward
    - Add-feature
    - Reverse
    - Recovery
    - Refactor
    - Retrofit
---

# Git 運用

HELIX の Conventional Commits discipline、harness-check CI requirements、
branch / PR rules、commit-msg hook を扱う（FR-L1-17 version control）。

## この skill を読む条件

- PLAN の実装または review 後に commit を準備する。
- `commit-msg` hook rejection の診断が必要。
- push が `.github/workflows/` に触れ、workflow-scoped token が必要。
- gate clearance 前に CI `harness-check` failure を解消する必要がある。

## Conventional Commits の format

すべての commit message は Conventional Commits に従う。従わない場合、`commit-msg` hook が reject する:

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

Allowed types は `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `style`,
`ci`, `perf`。Scope は PLAN ID または module name（例: `PLAN-L7-44`,
`projection-writer`）。short description は imperative mood、末尾 period なし。

multi-line commit message では **Bash heredoc が必須**。
PowerShell here-string は hook に受理されない:

```bash
git commit -F - <<'EOF'
feat(PLAN-L7-44): add harness.db projection for model_runs

Implements FR-L1-38 cost telemetry capture.
EOF
```

## Staging discipline（staging 規律）

stage は explicit files のみ。`git add -A` や `git add .` は使わない。
これらは repository に入れてはいけない `.ut-tdd/` runtime state、`.env` file、
generated artifact を含める可能性がある。

staging 前に確認する:

```
git status
git diff --stat
```

diff が current PLAN 用の file だけを含むことを確認する。

## harness-check の CI gate

CI は every push で `harness-check` を実行する。push 前に次の 4 つをすべて green にする:

| 確認項目 | Command | よくある failure |
|---|---|---|
| Type check | `bun run typecheck` | type declaration 欠落 |
| Vitest | `bun run test` | bare `bun test` は使わない。sync-timeout flakiness がある |
| Biome | `bun run lint` | `biome check` なしの `biome lint` による format violation 見落とし |
| Doctor | `ut-tdd doctor` | governance violation、PLAN dependency 欠落 |

push 前に 4 つすべてを local で実行する。`biome lint` だけでは formatting を検査しない。
両方を捕捉するため、`biome check` を呼ぶ `bun run lint` を実行する。

## Branch strategy（branch 戦略）

- `main` は integration branch。solo maintainer flow では `main` への direct commit を許容する。
- work が複数 session にまたがる、または PR review gate（hybrid mode judgement）が必要な場合は
  feature branch を使う。
- Branch name は `<type>/<slug>` に従う（例: `feat/plan-l7-44-projection`）。

## workflow 変更を含む push

`.github/workflows/` に触れる commit には workflow-scoped PAT が必要。
通常の GCM OAuth token は GitHub により workflow-file push で reject される。
temporary credential override を使い、push 後すぐ削除する。
workflow-scoped token を config file や environment variable に永続化しない。

## Pre-push checklist（push 前 checklist）

- [ ] `bun run typecheck` が 0 で終了する。
- [ ] `bun run lint`（Biome check + format）が 0 で終了する。
- [ ] `bun run test`（Vitest）が 0 で終了し、PLAN scope 内に skipped test が無い。
- [ ] `ut-tdd doctor` が 0 で終了する。
- [ ] `git diff --stat HEAD` が PLAN-scoped files だけを示す。
- [ ] commit message が `commit-msg` hook（Conventional Commits）に受理される。
- [ ] `.github/workflows/` に触れた場合: workflow-scoped PAT を使用中で、push 後に削除する。
