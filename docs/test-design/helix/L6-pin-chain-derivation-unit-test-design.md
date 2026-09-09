---
title: "Pin Chain Derivation L7単体テスト設計"
layer: L6
executed_at_layer: L7
artifact_type: test_design
sub_doc: unit-test-design
status: draft
created: 2026-09-09
updated: 2026-09-10
owner: QA
plan: docs/plans/PLAN-L6-1670-pin-chain-derivation-design.md
pair_artifact: docs/design/helix/L6-function-design/pin-chain-derivation.md
related_l6: docs/design/helix/L6-function-design/pin-chain-derivation.md
next_pair_freeze: L6
---

# pin追従連鎖の単体テスト設計

親設計: `docs/design/helix/L6-function-design/pin-chain-derivation.md`

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-PINCHAIN-001 | deterministic pin | test bytesとcase数を変更しmanifestを更新しないと、exact dependent locationとrecorded/live差を2件導出 | `tests/pin-chain-derivation.test.ts` |
| U-PINCHAIN-002 | unknown surface | 未登録pin形式のchanged pathをsilent successせず`DEGRADED` | `tests/pin-chain-derivation.test.ts` |
| U-PINCHAIN-003 | semantic review pin | reviewed-safe対象のbytesを変更しても自動refreshせず`requires_reassessment` | `tests/pin-chain-derivation.test.ts` |
| U-PINCHAIN-004 | CLI | 実CLIへchanged pathを渡すとJSON schemaと実repository pinをread-after可能 | `tests/cli-surface.test.ts` |
| U-PINCHAIN-005 | exact location | 同じcount値を持つ複数bindingでも対象binding内のfield行を返す | `tests/pin-chain-derivation.test.ts` |
| U-PINCHAIN-006 | registry欠落 | reviewed-safe registryが無い場合も例外やsilent skipにせず`DEGRADED` | `tests/pin-chain-derivation.test.ts` |
| U-PINCHAIN-007 | manifest網羅 | recognition manifestが同じtest pathをpinしていても追従先から消さない | `tests/pin-chain-derivation.test.ts` |
| U-PINCHAIN-008 | field欠落 | 登録済みbindingの必須field欠落をlocation 0のstale findingへ偽装せず`DEGRADED` | `tests/pin-chain-derivation.test.ts` |
| U-PINCHAIN-009 | CLI縮退 | 未登録surfaceを実CLIがJSON `DEGRADED`かつexit 2で返す | `tests/cli-surface.test.ts` |
| U-PINCHAIN-010 | digest inventory line | `src/lint/outstanding.ts`の`sha256Json`が移動しinventory lineがstaleな反例で、既存scanner由来live lineとの差を`deterministic_pin` / `refresh_candidate`として返す | `tests/pin-chain-derivation.test.ts` |
| U-PINCHAIN-011 | digest hit消失 | inventoryの`hit_id`に対応するscanner hitが消えた場合、findingを消さず`live_value: null` / staleとして返す | `tests/pin-chain-derivation.test.ts` |

件数だけでなく、deterministicとsemanticの取り違え、未対応surfaceの隠蔽、CLI未配線をそれぞれ独立して拘束する。

## U-PINCHAIN-001: 決定的pinの逆引き

## U-PINCHAIN-002: 未登録surfaceの可視化

## U-PINCHAIN-003: 意味レビューpinの分離

## U-PINCHAIN-004: CLI実読込

## U-PINCHAIN-005: binding内の正確な位置

## U-PINCHAIN-006: registry欠落の可視化

## U-PINCHAIN-007: manifest集合の網羅

## U-PINCHAIN-008: binding必須field欠落の可視化

## U-PINCHAIN-009: CLI縮退exitの拘束

## U-PINCHAIN-010: digest inventory行pinのscanner再利用

## U-PINCHAIN-011: digest scanner hit消失のfail-close
