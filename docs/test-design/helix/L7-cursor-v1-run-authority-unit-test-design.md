---
title: "Cursor v1 run authority L7検証設計"
layer: L7
artifact_type: test_design
status: draft
created: 2026-09-10
updated: 2026-09-10
owner: Codex / QA
plan: docs/plans/PLAN-RECOVERY-1707-cursor-v1-run-authority.md
parent_design: docs/design/helix/L6-function-design/cursor-v1-run-authority.md
pair_artifact: docs/design/helix/L6-function-design/cursor-v1-run-authority.md
---

# Cursor v1 run authority L7検証設計

| U-ID | 対象 | 反例と期待結果 | test citation |
| --- | --- | --- | --- |
| U-CURSOR-RUN-001 | v1 runの型付き分類 | v0 summaryをauthorityへ混入、stale phantomをactive扱いした場合は分類が一致しない | `tests/cursor-cloud-run-authority.test.ts` |
| U-CURSOR-RUN-002 | 一意のcancel可能stale run | cancel前POST、cancel不能phantom削除を許可しない | `tests/cursor-cloud-run-authority.test.ts` |
| U-CURSOR-RUN-003 | active／複数cancel候補のadmission | ID選好で複数候補から恣意的に1件選択せずfollow-upを拒否する | `tests/cursor-cloud-run-authority.test.ts` |
| U-CURSOR-RUN-004 | POSTと409 response | 409の即時・無制限retryを拒否しv1再GETを要求する | `tests/cursor-cloud-run-authority.test.ts` |
| U-CURSOR-RUN-005 | POST後single-active read-after | 複数active、別run ID、terminal runを成功扱いしない | `tests/cursor-cloud-run-authority.test.ts` |
| U-CURSOR-RUN-006 | provider unavailable縮退 | Codex laneや共通実行系まで停止せず、silent fallbackも許可しない | `tests/cursor-cloud-run-authority.test.ts` |
| U-CURSOR-RUN-007 | unknown statusと不正timestamp | 未知値をactive／terminalへ推測せずfollow-upを拒否する | `tests/cursor-cloud-run-authority.test.ts` |
| U-CURSOR-RUN-008 | cancel後v1 read-after | cancel対象がterminal化する前、対象消失、別active存在時は再dispatchを許可しない | `tests/cursor-cloud-run-authority.test.ts` |

fixture testは外部Cursor API、credential、networkを使用しない。外部E2E、cancel→IDLE→同一agent・同一PR headへの
follow-up実証、receipt保存は本単体sliceの未実証範囲として明示する。
