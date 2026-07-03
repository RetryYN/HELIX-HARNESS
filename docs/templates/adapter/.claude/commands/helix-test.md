---
description: 現在の変更に対して HELIX verification を実行する。
argument-hint: "<changed area or PLAN id>"
---

対象: $ARGUMENTS

最初に `ut-tdd status --json`、`ut-tdd completion decision-packet --json`、`ut-tdd completion review-bundle --json`、`ut-tdd version-up dry-run --current v0.1.0 --target v0.1.4 --release-remote https://github.com/unison-ai-product/UT-TDD_AGENT-HARNESS-Pack.git --json` を確認し、completion review-bundle の exact digest / semantic digest を照合する。narrow Vitest target、`bun run typecheck`、`bun run lint` を実行する。変更が HELIX workflow または gate に影響する場合は `ut-tdd doctor --profile consumer` で閉じる。
