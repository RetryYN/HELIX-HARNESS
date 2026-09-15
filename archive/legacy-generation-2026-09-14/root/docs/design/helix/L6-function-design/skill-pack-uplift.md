---
layer: L6
sub_doc: function-spec
status: confirmed
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
plan: docs/plans/PLAN-L6-65-plan-specific-vpair-binding.md
---

# skill pack uplift — 機能設計

## §1 Contract

`PLAN-L7-419`で実装済みのskill判断力アップリフトを、後付けのL7本文ではなくL6機能契約として抽出する。
対象は新規5 pack、既存pack brush-up、judgment-core marker同期、SKILL_MAP登録、CLI citation、
日本語prose、license attribution、敵対検証優先、垂直slice/progressive elaborationである。

| contract | postcondition |
|---|---|
| pack catalog | 新規5 packがskill.v1 routing metadataを持ち、SKILL_MAP trigger表へexact登録される |
| judgment frame | 各packが担当する判断frame anchorを保持し、generic stubへ退行しない |
| adversarial/browser | attacker/defender contractと9状態matrixを保持する |
| judgment SSoT | judgment-core versionと全agent/command markerが同期する |
| CLI reference | touched packが参照する`helix` command/subcommandは実在する |
| language/license | human-facing proseは日本語gateを満たし、外部採用箇所は必要なattributionを保持する |
| decision precedence | adversarial FLAGはself-consistency多数決で上書きされない |
| delivery substance | brushed packは垂直slice・progressive elaboration・oracle出所を保持する |

## §2 Vペア

L8 `U-SKUP-001..011`を正本oracleとし、`tests/skill-pack-uplift.test.ts`の各test case titleが
exact oracle IDを1件ずつ持つ。PLAN固有bindingは本書、各oracle ID、同test path、`PLAN-L7-419`を結合する。
本書は既存挙動のtrace補修であり、新しいskill機能や外部source採用を追加しない。
