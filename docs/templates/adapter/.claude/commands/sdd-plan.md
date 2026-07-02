---
description: 実装前に HELIX の spec-driven planning document を作成する。
argument-hint: "<target>"
---

Command: sdd-plan

対象: $ARGUMENTS

現行 `ut-tdd` CLI 経由で repository-local HELIX command を使う。最初に `ut-tdd status --json` と `ut-tdd completion decision-packet --json` を実行し、対象に必要な narrow verification を走らせ、workflow または gate behavior に影響する場合は `ut-tdd doctor --profile consumer` で閉じる。
