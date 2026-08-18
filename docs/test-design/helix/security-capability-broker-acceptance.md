---
title: "安全capability broker 受入テスト設計"
layer: L10
artifact_type: test_design
status: confirmed
created: 2026-08-18
updated: 2026-08-19
owner: QA / Security
pair_artifact: docs/design/helix/L3-requirements/security-capability-broker-authority.md
related_issue: 679
---

# 安全capability broker 受入テスト設計

本テスト設計は、requirements v1.3.12へ昇格した#679のL3要件をL10で判定可能にする。
この文書のgreenは各実装sliceの完了を意味せず、current guardのgreenで未実装要件を相殺しない。

| Test ID | 対応要件 | 入力fixture | 期待結果 |
|---|---|---|---|
| `SEC-AC-CAP-001` | `SEC-FR-CAP-001` | operation、impact、approvalを同一enumへ混在、未知値、欠落、複数候補 | 軸混同・未知・欠落をreason付き`unresolved`で拒否する |
| `SEC-AC-CAP-002` | `SEC-FR-CAP-002` | repo内literal、ancestor symlink、junction、bind mount、hardlink、repo外realpath、glob、TOCTOU変更 | exact physical identityとtarget setが一致するliteralだけ許可候補。その他は拒否する |
| `SEC-AC-CAP-003` | `SEC-FR-CAP-003` | direct literal、bounded wrapper、script digest、find/xargs、変数、dynamic interpreter、解析深度超過 | bounded以外の間接実行をhostへ渡さず、sandboxまたは拒否へ送る |
| `SEC-AC-CAP-004` | `SEC-FR-CAP-004` | public/repository/sensitive/PII/credential/unknownとlocal/GitHub/network/cloud sinkの直積 | credential、PII、archive、unknownはbroker外送信を拒否し、ログにも値を出さない |
| `SEC-AC-CAP-005` | `SEC-FR-CAP-005` | destructive external actionのtarget、dry-run、rollback、expiry、approval receiptの各欠落・drift | exact tupleが揃うまで`approval_required`または`unresolved`で実行を拒否する |
| `SEC-AC-CAP-006` | `SEC-FR-CAP-006` | Claude、Codex CLI/IDE、Cursor、hosted tool、workerのcovered/unsupported/trust drift/sandbox unavailable | unsupported、drift、sandbox unavailableはhost実行へfallbackせずfail-closeする |
| `SEC-AC-CAP-007` | `SEC-FR-CAP-007` | canonical failure、legacy guard green、別scanner green、値を含むraw error | AND admissionを維持し、legacy/別scannerのgreenで相殺せずredacted receiptだけを残す |
| `SEC-AC-CAP-008` | `SEC-FR-CAP-001..007` |同一targetを判定後に置換、permission変更、process停止、container root mount | 実行直前identity／policy再検証で拒否し、再試行を自動許可しない |
| `SEC-AC-CAP-009` | `SEC-FR-CAP-005` | postcondition成功、失敗、部分成功、rollback unavailable | 成功主張はpostcondition receiptがある場合だけ。部分成功はRecoveryへ送る |
| `SEC-AC-CAP-010` | `SEC-FR-CAP-007` | command、token、PII、absolute pathを含む失敗入力 | output、DB、PR、memory、CI logにsecret等が残らない |

## 実機・mutation条件

- lexical pathだけを検証してphysical target検証を削除するmutationは、symlink/junction/mount/
  hardlink fixtureで必ずredになる。
- `generated_indirect`を`direct_literal`へ変換するmutationは、find/xargs、shell variable、
  interpreter、package scriptのfixtureで必ずredになる。
- data classificationまたはsink authorityを`network_allowed`へ潰すmutationは、credential、
  PII、repository archiveのegress fixtureで必ずredになる。
- current canonical failureをlegacy guard greenで相殺するmutationはAND admissionでredになる。
- unsupported runtimeをhost実行へfallbackするmutationは、sandbox unavailable fixtureでredになる。
- 実機canaryはClaude Code、Codex CLI/IDE、Cursor、hosted toolごとに、covered、unsupported、
  trust drift、sandbox unavailableを個別receiptへ記録する。hook非強制surfaceの安全性を宣言しない。

## 証跡要件

各ケースはsource HEAD、requirements/policy version、target identity digest、provenance digest、
data/sink classification、decision、reason code、postcondition、rollback、expiry、runtime surfaceを
保存する。入力値、secret、PII、raw command、個人absolute pathは保存しない。
