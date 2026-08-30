---
title: "Universal Improvement finding適格化L8単体テスト設計"
layer: L8
artifact_type: test_design
sub_doc: unit-test-design
status: draft
created: 2026-08-30
updated: 2026-08-30
owner: QA / Codex TL
plan: docs/plans/PLAN-L7-706-universal-improvement-finding-qualification.md
pair_artifact: docs/design/helix/L6-function-design/universal-improvement-finding-qualification.md
---

# Universal Improvement finding適格化L8単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-UILFQ-001 | valid qualification | substantive triggerをdetector／baseline／event exact setへ束縛してqualified findingを返す | `tests/universal-improvement-finding-qualification.test.ts` |
| U-UILFQ-002 | determinism／dedupe | 入力順・retry・at-least-once重複に依存せず同じ一件とdigestを返す | `tests/universal-improvement-finding-qualification.test.ts` |
| U-UILFQ-003 | trigger separation | 8 trigger kindを別identityとして保持し、scheduled単独をqualifiedにしない | `tests/universal-improvement-finding-qualification.test.ts` |
| U-UILFQ-004 | admission | unknown event／detector、wrong baseline、event digest不一致を個別拒否する | `tests/universal-improvement-finding-qualification.test.ts` |
| U-UILFQ-005 | lifecycle | rejected／expired／superseded／counterevidence_requiredを混同しない | `tests/universal-improvement-finding-qualification.test.ts` |
| U-UILFQ-006 | conflicting duplicate | 同一identityのdetector／verdict／supersession矛盾をfail-closeする | `tests/universal-improvement-finding-qualification.test.ts` |
| U-UILFQ-007 | malformed boundary | 欠落invariant、未来時刻、無効expiry、構造破壊をthrowせずfail-closeする | `tests/universal-improvement-finding-qualification.test.ts` |

本設計はsemantic impact、candidate、route、Issue／PLAN／authority writeをgreenと主張しない。
