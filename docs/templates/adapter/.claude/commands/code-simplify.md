---
description: 選択した code に対する最小で安全な単純化を特定する。
argument-hint: "<target>"
---

Command: code-simplify

対象: $ARGUMENTS

現行 `ut-tdd` CLI 経由で repository-local HELIX command を使う。最初に `ut-tdd status --json` を実行し、対象に必要な narrow verification を走らせ、workflow または gate behavior に影響する場合は `ut-tdd doctor --profile consumer` で閉じる。
