---
title: "GitHub PLAN予約 bounded fetch L8単体テスト設計"
layer: L8
artifact_type: test_design
sub_doc: unit-test-design
status: confirmed
created: 2026-09-01
updated: 2026-09-01
owner: QA / Codex TL
plan: docs/plans/PLAN-L7-726-github-plan-reservation-bounded-fetch.md
pair_artifact: docs/design/helix/L6-function-design/github-plan-reservation-bounded-fetch.md
---

# L8単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-OBPRGH-001 | main／open PR material | exact HEAD、ancestor、PLAN material、二重 read が欠ける | `tests/github-open-branch-plan-reservation-provider.test.ts` |
| U-OBPRGH-002 | open PR exact-set read-after | list race を available として受理する | `tests/github-open-branch-plan-reservation-provider.test.ts` |
| U-OBPRGH-003 | main ref／tree 完全性 | ref race または truncated tree を local green へ縮退する | `tests/github-open-branch-plan-reservation-provider.test.ts` |
| U-OBPRGH-004 | pagination／identity | 終端 page を読まない、または duplicate PR を受理する | `tests/github-open-branch-plan-reservation-provider.test.ts` |
| U-OBPRGH-005 | terminal lifecycle | list 後の merge／close を evidence なしで消失させる | `tests/github-open-branch-plan-reservation-provider.test.ts` |
| U-OBPRGH-006 | unavailable reason | provider raw error／endpoint／response body の差を digest material に入れる | `tests/github-open-branch-plan-reservation-provider.test.ts` |
| U-OBPRGH-007 | adapter／schema boundary | effect provider が projection adapter を直接 import する | `tests/github-open-branch-plan-reservation-provider.test.ts` |
| U-OBPRGH-008 | SHA cache／changed exact set | 同じ blob を再取得、changed PLAN 以外を fetch、batch 上限を無視する | `tests/github-open-branch-plan-reservation-provider.test.ts` |
| U-OBPRGH-009 | call／process／rate-limit budget | 各 budget 超過後に追加 call、success material、receipt 欠落を許す | `tests/github-open-branch-plan-reservation-provider.test.ts` |
| U-OBPRGH-010 | partial cache | partial cache から PLAN material を推測する | `tests/github-open-branch-plan-reservation-provider.test.ts` |
| U-OBPRGH-011 | archive tree mismatch | PLAN path が tree entry、または archive tree と SHA 不一致でも blob を読む | `tests/github-open-branch-plan-reservation-provider.test.ts` |
| U-OBPRGH-012 | repository-scale performance | 1,200 PLAN 規模で同一 blob を tree 数だけ fetch し、API call budget を越える | `tests/github-open-branch-plan-reservation-provider.test.ts` |
| U-OBPRGH-013 | cross-capture cache | complete cache を再利用せず同じ blob を再 fetch する | `tests/github-open-branch-plan-reservation-provider.test.ts` |
| U-OBPRGH-014 | threshold／archive fail-close | PLAN threshold 超過または archive mismatch の部分 material を公開する | `tests/github-open-branch-plan-reservation-provider.test.ts` |
| U-OBPRGH-015 | cache publication | 後続surface失敗時に部分cacheをcallerへ公開する | `tests/github-open-branch-plan-reservation-provider.test.ts` |
| U-OBPRGH-016 | projection parity | cache最適化によってcanonical reservation projection digestが変わる | `tests/github-open-branch-plan-reservation-provider.test.ts` |

## oracle 方針

performance oracle は wall-clock の flaky な値ではなく、1,200 PLAN tree に対する unique blob call 数、cache hit 数、
receipt の API call 使用量、surface status を検査する。これは local repository の PLAN 1,118 件を上回る固定規模であり、
同じ tree を main／PR の二面から読む実測である。

mutation は少なくとも operation cache reuse、`max_plan_entries` threshold、archive tree mismatch、process／call budget
guard の各一箇所を一時除去し、該当 U-ID が failed になることを確認する。別 guard が同じ failure code を返すだけの
偽 kill を避けるため、API call 数、surface、receipt counters を同時に assert する。
