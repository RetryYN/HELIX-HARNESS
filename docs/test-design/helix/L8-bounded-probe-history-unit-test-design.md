---
title: "bounded probe履歴 L8 unit test設計"
layer: L8
sub_doc: unit-test-design
artifact_type: test_design
status: draft
created: 2026-08-17
updated: 2026-08-17
owner: Codex / TL
plan: docs/plans/PLAN-L7-582-bounded-probe-history.md
pair_group:
  schema_version: helix-pair-group.v1
  group_id: helix-bounded-probe-history-unit
  authority: docs/design/helix/
  members:
    - docs/design/helix/L5-detail/bounded-probe-history.md
    - docs/design/helix/L6-function-design/bounded-probe-history.md
---

# bounded probe履歴 L8 unit test設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-PH-001 | registry／HEAD／dataset admission | 不一致またはallowlist外をfail-closeする | `tests/bounded-probe-history.test.ts` |
| U-PH-002 | port boundary／resource bounds | command非受理、network／credential固定、deadline／resource／sample超過を拒否する | `tests/bounded-probe-history.test.ts` |
| U-PH-003 | failure quality | insufficient／timeout／failureをgreen観測へ変換しない | `tests/bounded-probe-history.test.ts` |
| U-PH-004 | append／idempotency／chain | 同一runの同一payloadだけ冪等、conflictとchain driftを拒否する | `tests/bounded-probe-history.test.ts` |
| U-PH-005 | immutability／replay | event UPDATE／DELETEとhead改ざんを検知する | `tests/bounded-probe-history.test.ts` |
| U-PH-006 | execution cancellation／fail-close | portのハングをtimeout／deadlineでabortし、port例外を履歴へ通さない | `tests/bounded-probe-history.test.ts` |

入力はimmutable fixtureとして扱い、raw output、credential、absolute pathをfixtureやfailure messageへ
入れない。DB storeは`:memory:`を使い、Node transaction、schema migration、immutability triggerを実測する。
---
