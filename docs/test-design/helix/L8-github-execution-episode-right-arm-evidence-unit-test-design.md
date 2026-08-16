---
title: "GitHub execution episode right-arm evidence束縛単体テスト設計"
layer: L8
artifact_type: test_design
status: confirmed
created: 2026-08-16
updated: 2026-08-16
owner: Codex / QA
executed_at_layer: L7
sub_doc: unit-test-design
parent_design: docs/design/helix/L6-function-design/github-execution-episode-right-arm-evidence.md
pair_artifact: docs/design/helix/L6-function-design/github-execution-episode-right-arm-evidence.md
plan: docs/plans/PLAN-L7-578-github-execution-episode-right-arm-evidence.md
---

# GitHub execution episode right-arm evidence束縛単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-GHEPRE-001 | append-only record | current episode tupleのG8 recordだけをappendし、episode不在を拒否する | `tests/github-execution-episode-right-arm.test.ts` |
| U-GHEPRE-002 | exact identity | 旧HEAD、別owner／contract／workflow identityとcross-connection stale replayを拒否する | `tests/github-execution-episode-right-arm.test.ts` |
| U-GHEPRE-003 | immutable replay | exact retryだけをreplayし、同一IDのdigest改変を拒否する | `tests/github-execution-episode-right-arm.test.ts` |
| U-GHEPRE-004 | gate／artifact範囲 | G8〜G12とrelative artifactだけを受理し、G13、absolute path、parent traversalを拒否する | `tests/github-execution-episode-right-arm.test.ts` |
| U-GHEPRE-005 | schema integrity | immutable triggerと保存row digestを検証し、直接更新／削除／corruptionを拒否する | `tests/github-execution-episode-right-arm.test.ts` |
| U-GHEPRE-006 | pair／freeze | L6／L8 pairとPLANの相互参照欠落を拒否する | `tests/l3-g3-freeze-packet-v2.test.ts` |
| U-GHEPRE-007 | recognition再attest | G13拒否のnegative oracleを内容digest付きfalse positiveへ固定する | `tests/l12-hybrid-recognition.test.ts` |
