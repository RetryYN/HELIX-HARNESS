---
title: "project-hook authority consumer wiring L7検証設計"
layer: L7
artifact_type: test_design
sub_doc: unit-test-design
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
| U-CNWHOOKENV-001 | transportはexpectedだけを持ちobservedを持たない | request内へobserved evidenceを混載する | `tests/project-hook-authority-envelope.test.ts` |
| U-CNWHOOKENV-002 | execution/current authorityのHEAD・source bytesを別rootから実測する | expected bytesをobservedへコピーする | `tests/project-hook-authority-envelope.test.ts` |
| U-CNWHOOKENV-003 | current authority HEADを独立照合する | locatorとexpected HEADを同じ値へ差し替える | `tests/project-hook-authority-envelope.test.ts` |
| U-CNWHOOKENV-003b | current authority source bytesを独立照合する | locatorとexpected sourceを同じ値へ差し替える | `tests/project-hook-authority-envelope.test.ts` |
| U-CNWHOOKENV-003c | Git common dirをhost anchorへ束縛する | foreign repository locatorへ差し替える | `tests/project-hook-authority-envelope.test.ts` |
| U-CNWHOOKENV-003d | current authority HEADをhost main anchorへ束縛する | foreign HEADに合わせてexpectedも改竄する | `tests/project-hook-authority-envelope.test.ts` |
| U-CNWHOOKENV-003e | remote default anchor欠落をinput unavailableへ分類する | `origin/main`等へ暗黙fallbackする | `tests/project-hook-authority-envelope.test.ts` |
| U-CNWHOOKENV-003f | remote default anchor複数時は推測しない | remote名またはbranch名の固定優先順位で選ぶ | `tests/project-hook-authority-envelope.test.ts` |
| U-CNWHOOKENV-004 | execution root mismatchをfallbackせず拒否する | cwd／env／default rootで差分を相殺する | `tests/project-hook-authority-envelope.test.ts` |
| U-CNWHOOKENV-005 | cwdをexecution root観測だけに使う | 他rootをcwdへ暗黙補完する | `tests/project-hook-authority-envelope.test.ts` |
| U-CNWHOOKENV-005b | loader／session／current authorityを個別locatorから観測する | 3 rootを単一locatorへ畳み込む | `tests/project-hook-authority-envelope.test.ts` |
| U-CNWHOOKENV-006 | standalone projectionはproject-hook authority実行とprovider dispatchを0とし、coordination SessionStart維持を宣言する | authority不在を一般DB write禁止へ拡大してmemory／feedback連絡経路を停止する | `tests/project-hook-authority-envelope.test.ts` |
| U-CNWHOOKENV-007 | invalid envelopeを固定schema failureへ閉じる | 不正入力後にauthorityを推測する | `tests/project-hook-authority-envelope.test.ts` |
| U-CNHOOKWIRE-001 | resolver 1回、projector 1回、4 surfaceが同じreceipt bytesを読む | surface読込ごとの再resolve・再capture・再serialize | `tests/project-hook-authority-envelope.test.ts` |
| U-CNHOOKWIRE-002 | failure bytesを4 surfaceで共有しdispatchを拒否する | admitted receiptなしのdispatch、failure時のprovider起動 | `tests/project-hook-authority-envelope.test.ts` |
| U-CNHOOKWIRE-003 | standalone status／doctorはread-only unavailableを表示する | standaloneからauthority推測、旧engineへのdispatch | `tests/project-hook-authority-envelope.test.ts` |
| U-CNHOOKWIRE-004 | SessionStartはhook input内のtransport envelopeだけを使う | cwd／env／default file／remoteへのfallback | `tests/project-hook-authority-envelope.test.ts` |
| U-CNHOOKWIRE-005 | 明示envelopeのschema／read failureは固定failureへ閉じる | 読込失敗後の暗黙envelope探索、provider起動 | `tests/project-hook-authority-envelope.test.ts` |
| U-CNHOOKWIRE-006 | current authority root、HEAD、source bytesをhostから独立採取して差分を拒否する | expected値をobservedへコピーしてstaleを相殺 | `tests/project-hook-authority-envelope.test.ts` |
| U-CNHOOKWIRE-007 | 明示envelope付きnative dispatchはadmitted receipt後だけ実行可能になる | 不正な明示envelopeでのCodex／Claude／team／pair／loop起動 | `tests/project-hook-authority-envelope.test.ts` およびCLI smoke |
| U-CNHOOKWIRE-007b | 全native dispatch surfaceが明示不正envelopeをprovider probe前に拒否する | loop／pair／provider／teamのいずれかが不正envelopeでprobeまたはdispatchする | `tests/cli-surface.test.ts` |
| U-CNHOOKWIRE-007c | 共通admission helperが全native dispatch surfaceへ配線される | loop／pair／provider／teamのいずれかが共通helperを除去する | `tests/project-hook-authority-envelope.test.ts` |
| U-CNHOOKWIRE-008 | current authority locatorだけをenvelopeから受け、identityは後段で採取する | envelopeのobserved object、request値の物理証拠化 | `tests/project-hook-authority-envelope.test.ts` |
| U-CNHOOKWIRE-009 | standalone SessionStartはproject-hook dispatchを行わず、既存memory recall、session log、feedback DBを維持する | authority不在を理由にcoordination surfaceまで停止する、またはproviderを暗黙dispatchする | `tests/cli-surface.test.ts` |
| U-CNHOOKWIRE-010 | producer未接続のpre-activationでは既存dispatch availabilityを維持する | envelope未指定だけで全worker経路を停止する | `tests/cli-surface.test.ts` |

## 検証方法

- pure consumer wiringはresolver／projectorのspyで一回性を確認する。
- physical adapterはfixtureのroot identity、HEAD、source bytesを個別に差し替え、stale／foreign failureを確認する。
- standaloneはproject-hook authority side effect 0とcoordination SessionStart維持を確認する。invalid transportは全side effect 0、dispatch不可を確認する。
- CLI consumerは明示envelope fileまたはSessionStart hook input以外をsourceとして採用しないことを確認する。
- targeted Vitest、targeted TypeScript、Biomeを実行し、全体typecheckに既存失敗がある場合は別記する。

完了主張には、対象HEADに束縛した実行結果、failure反例、4 surface同一bytes、dispatch admissionの結果を含める。文書の存在だけでruntime配線完了とは扱わない。
