---
title: "GitHub CI status exact HEAD／workflow束縛 単体テスト設計"
layer: L8
status: draft
created: 2026-09-08
updated: 2026-09-08
parent_design: docs/design/helix/L6-function-design/github-ci-status-head-binding.md
pair_artifact: docs/design/helix/L6-function-design/github-ci-status-head-binding.md
---

# 単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-GHCI-001 | HEAD束縛 | expected HEADにrunがなく旧HEAD successだけなら`window_miss`／`ok=false` | `tests/github-merge-readiness.test.ts` |
| U-GHCI-002 | HEAD分離 | expected HEAD successと旧HEAD failureが共存してもexpected HEADだけで`green` | `tests/github-merge-readiness.test.ts` |
| U-GHCI-003 | workflow分離 | expected HEADの別workflow failureとtarget successが共存してもtargetだけで`green` | `tests/github-merge-readiness.test.ts` |
| U-GHCI-004 | windowとfailure | exact pair不在は`window_miss`、exact pair failureは`red` | `tests/github-merge-readiness.test.ts` |

追加反例として、空query、短縮SHA、uppercase SHA、39桁SHA、空白付きSHA、空workflow、pending、cancelledを
個別に固定する。判定器からHEADまたはworkflow filterを除いたmutationではA/B/C/Wのいずれかがredになることを要求する。
