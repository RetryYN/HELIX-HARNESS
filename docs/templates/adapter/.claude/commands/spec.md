---
description: 実装前に spec-first design を作成する。
argument-hint: "<target>"
---

Command: spec

対象: $ARGUMENTS

現行 `ut-tdd` CLI 経由で repository-local HELIX command を使う。最初に `ut-tdd status --json`、`ut-tdd completion decision-packet --json`、`ut-tdd completion review-bundle --json`、`ut-tdd version-up dry-run --current v0.1.0 --target v0.1.4 --release-remote https://github.com/RetryYN/HELIX-HARNESS-OS.git --json` を実行し、completion review-bundle の exact digest と semantic digest を確認する。対象に必要な narrow verification を走らせ、workflow または gate behavior に影響する場合は `ut-tdd doctor --profile consumer` で閉じる。
