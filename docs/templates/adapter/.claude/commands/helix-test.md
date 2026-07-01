---
description: 現在の変更に対して HELIX verification を実行する。
argument-hint: "<changed area or PLAN id>"
---

対象: $ARGUMENTS

最初に narrow Vitest target を実行し、続いて `bun run typecheck`、`bun run lint` を実行する。変更が HELIX workflow または gate に影響する場合は `ut-tdd doctor` で閉じる。
