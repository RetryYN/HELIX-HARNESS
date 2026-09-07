---
title: "project-hook authority consumer wiring L7検証設計"
layer: L7
artifact_type: test_design
status: draft
created: 2026-09-07
updated: 2026-09-07
owner: Codex / QA
plan: docs/plans/PLAN-L7-1614-project-hook-authority-consumer-wiring.md
parent_design: docs/design/helix/L6-function-design/project-hook-authority-consumer-wiring.md
pair_artifact: docs/design/helix/L6-function-design/project-hook-authority-consumer-wiring.md
---

# project-hook authority consumer wiring L7検証設計

本書はcanonical L6設計のL7検証設計である。旧#1620のL7↔L8成果物を複製しない。resolver、capture、serializationの一回性、expected／observed境界、admitted receipt境界、4 surfaceの同一bytesを検証する。

| U-ID | 対象 | 反例と期待結果 | test citation |
| --- | --- | --- | --- |
| U-CNHOOKWIRE-001 | resolver 1回、projector 1回、4 surfaceが同じreceipt bytesを読む | surface読込ごとの再resolve・再capture・再serialize | `tests/project-hook-authority-envelope.test.ts` |
| U-CNHOOKWIRE-002 | failure bytesを4 surfaceで共有しdispatchを拒否する | admitted receiptなしのdispatch、failure時のprovider起動 | `tests/project-hook-authority-envelope.test.ts` |
| U-CNHOOKWIRE-003 | standalone status／doctorはread-only unavailableを表示する | standaloneからauthority推測、旧engineへのdispatch | `tests/project-hook-authority-envelope.test.ts` |
| U-CNHOOKWIRE-004 | SessionStartはhook input内のtransport envelopeだけを使う | cwd／env／default file／remoteへのfallback | `tests/project-hook-authority-envelope.test.ts` |
| U-CNHOOKWIRE-005 | 明示envelopeのschema／read failureは固定failureへ閉じる | 読込失敗後の暗黙envelope探索、provider起動 | `tests/project-hook-authority-envelope.test.ts` |
| U-CNHOOKWIRE-006 | current authority root、HEAD、source bytesをhostから独立採取して差分を拒否する | expected値をobservedへコピーしてstaleを相殺 | `tests/project-hook-authority-envelope.test.ts` |
| U-CNHOOKWIRE-007 | native dispatchはadmitted receipt後だけ実行可能になる | admission前のCodex／Claude／team／pair／loop起動 | `tests/project-hook-authority-envelope.test.ts` およびCLI smoke |
| U-CNHOOKWIRE-008 | current authority locatorだけをenvelopeから受け、identityは後段で採取する | envelopeのobserved object、request値の物理証拠化 | `tests/project-hook-authority-envelope.test.ts` |

## 検証方法

- pure consumer wiringはresolver／projectorのspyで一回性を確認する。
- physical adapterはfixtureのroot identity、HEAD、source bytesを個別に差し替え、stale／foreign failureを確認する。
- standaloneとinvalid transportはside effect 0、dispatch不可を確認する。
- CLI consumerは明示envelope fileまたはSessionStart hook input以外をsourceとして採用しないことを確認する。
- targeted Vitest、targeted TypeScript、Biomeを実行し、全体typecheckに既存失敗がある場合は別記する。

完了主張には、対象HEADに束縛した実行結果、failure反例、4 surface同一bytes、dispatch admissionの結果を含める。文書の存在だけでruntime配線完了とは扱わない。
