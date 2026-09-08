---
title: "Pin Chain Derivation L8単体テスト設計"
layer: L8
artifact_type: test_design
sub_doc: unit-test-design
status: draft
created: 2026-09-09
updated: 2026-09-09
owner: QA
plan: docs/plans/PLAN-RECOVERY-1670-pin-chain-derivation.md
pair_artifact: docs/design/helix/L6-function-design/pin-chain-derivation.md
---

# pin追従連鎖の単体テスト設計

親設計: `docs/design/helix/L6-function-design/pin-chain-derivation.md`

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-PINCHAIN-001 | deterministic pin | test bytesとcase数を変更しmanifestを更新しないと、exact dependent locationとrecorded/live差を2件導出 | `tests/pin-chain-derivation.test.ts` |
| U-PINCHAIN-002 | unknown surface | 未登録pin形式のchanged pathをsilent successせず`DEGRADED` | `tests/pin-chain-derivation.test.ts` |
| U-PINCHAIN-003 | semantic review pin | reviewed-safe対象のbytesを変更しても自動refreshせず`requires_reassessment` | `tests/pin-chain-derivation.test.ts` |
| U-PINCHAIN-004 | CLI | 実CLIへchanged pathを渡すとJSON schemaと実repository pinをread-after可能 | `tests/cli-surface.test.ts` |

件数だけでなく、deterministicとsemanticの取り違え、未対応surfaceの隠蔽、CLI未配線をそれぞれ独立して拘束する。

## U-PINCHAIN-001: 決定的pinの逆引き

## U-PINCHAIN-002: 未登録surfaceの可視化

## U-PINCHAIN-003: 意味レビューpinの分離

## U-PINCHAIN-004: CLI実読込
