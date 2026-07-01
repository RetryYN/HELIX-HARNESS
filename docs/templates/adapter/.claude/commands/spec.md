---
description: 実装前に spec-first design を作成する。
argument-hint: "<target>"
---

Command: spec

対象: $ARGUMENTS

現行 `ut-tdd` CLI 経由で repository-local HELIX command を使う。最初に `ut-tdd status --json` を実行し、対象に必要な narrow verification を走らせ、workflow または gate behavior に影響する場合は `ut-tdd doctor` で閉じる。
