---
title: "project hook authority boundary L9 system test設計"
layer: L9
artifact_type: test_design
status: draft
created: 2026-08-22
updated: 2026-08-22
owner: QA / TL
plan: docs/plans/PLAN-L4-76-project-hook-authority-boundary.md
pair_artifact: docs/design/helix/L4-basic-design/project-hook-authority-boundary.md
---

# project hook authority boundary L9 system test設計

runtime未実装のためcitationは付けずdraftを維持する。後続system fixtureはprimary shared tree、assignment worktree、loader root、
hook child／parent process、terminal review result、notification workerを独立制御し、Git／DB／GitHub writeをspyする。

| ST-ID | system接合 | negative mutationと期待結果 |
|---|---|---|
| `ST-CNW-HOOK-001` | SessionStart／doctor／status／dispatch | 同一入力で4 surfaceのidentity receiptがbyte-equivalent。1 field欠落を拒否 |
| `ST-CNW-HOOK-002` | execution root↔loader root | lexical同一＋physical別、symlink、別worktree loaderをstale/foreignで拒否 |
| `ST-CNW-HOOK-003` | assignment selector↔primary root | current assignmentとstale primaryを併置しassignmentだけをauthorityにする |
| `ST-CNW-HOOK-004` | candidate/current authority | root、HEAD、hooks／guard／policy digestを個別変異し同じtyped failure、write 0 |
| `ST-CNW-HOOK-005` | deadline admission | 15秒既定、60秒境界pass、61秒／期限なしをlifecycle timeoutで拒否 |
| `ST-CNW-HOOK-006` | child↔parent process | timeout後に子停止＋親terminalを確認。親残留mutationを拒否 |
| `ST-CNW-HOOK-007` | terminal result↔post hook | timeout後もresult、session、HEAD、verdict、comment URLがbyte-equivalent |
| `ST-CNW-HOOK-008` | sync hook↔wake worker | lease／TTL／digest付きhandoffだけを許可し、同期長期待機とraw bypassを拒否 |

各caseはvalid baselineから一軸だけを変異し、failure優先順で後段oracleを隠さない。foreign fixtureへのwrite、reset、checkout、
install、dispatchは全て0をassertする。unsupported physical fieldをsameへ補完するadapterもnegative caseへ含める。
