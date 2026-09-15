---
layer: L6
sub_doc: function-spec
status: confirmed
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
plan: docs/plans/PLAN-L6-104-plan-number-uniqueness.md
---

> **L6 contract marker**: `analyzePlanNumberUniqueness(files: readonly string[], baseline: ReadonlyMap<string, number>) => PlanNumberUniquenessResult` は unit-test 粒度の contract。pre: files は `docs/plans/` の filename 集合。post: 決定論で、baseline が許容する本数を超える採番 key が 1 件でもあれば ok=false。invariant: baseline 内の既存衝突は遡及 fail させない（ratchet、plan-descent / plan-entry-routing と同型）。

# PLAN 採番の一意性 gate — 機能設計

## §1 何が起きていたか

PLAN は `PLAN-<layer>-<number>(-<slug>).md` という名前を持つ（現行schemaではslug省略も正規）。番号の払い出しは
「`docs/plans/` を見て次の空き番号を取る」という**観測して取る**方式であり、
並行レーン（Claude / Codex）が同時に払い出すと同じ番号を取る。

実 repository で **15 組**が衝突していた（うち `PLAN-L7-170` と `PLAN-RECOVERY-40` は 3 本）。
意味の異なる PLAN が同じ番号を名乗るため、prose 中の裸の `PLAN-L7-525` 参照が
どちらを指すか判別できない（実測で裸参照 12 件、`PLAN-L5-96` は 8 件）。

`plan_id` の一意性は slug を含むため保たれており、既存 gate はこれを検出しなかった。
**採番 key（layer + 番号）の一意性を見る gate が存在しなかった**ことが再発の原因である。

## §2 契約

判定単位は採番 key = `PLAN-<layer>-<number>`。slug は含めない。

| 状態 | 条件 | 結果 |
|---|---|---|
| ok | 各採番 key の本数が baseline の許容本数（未登録なら 1）以下 | `ok=true` |
| violation | 許容本数を超える key が存在 | `ok=false`。key・実本数・許容本数・該当 filename を報告 |
| resolved | baseline 登録済み key の本数が baseline を下回る | `ok=true` だが「baseline を下げよ」と報告 |

`PLAN_FILE_PATTERN` は現行 `planIdSchema` と同じくslug有無の両方を採番対象とする。
それ以外の filename は無視する（非 PLAN doc を巻き込まない）。

## §3 baseline の位置づけ

既存 15 組は **baseline として凍結**する。baseline は「許可」ではなく**既知の負債**である。

凍結する理由は、既存衝突の解消が confirmed PLAN の改番——`plan_id` と filename の変更、
および inbound 参照（設計 doc、テスト設計、他 PLAN の dependencies、review evidence、
`src/lint/l12-hybrid-reviewed-safe-v2.ts` の path pin、prose 中の裸参照）の一括追従——を
伴う migration であり、両ランタイムのレーンをまたぐ不可逆性を持つためである。
gate の導入と既存負債の返済は分離する。改番の是非は Issue #521 で owner 判断へ送る。

固定化を防ぐため、baseline を下回った key は `resolvedBaselineKeys` として報告し、
baseline 側を下げることを促す。oracle は baseline に stale な key が無いことも固定する。

## §3.1 oracle 対応（U-PLANNUM-001〜006）

| oracle | 固定する契約 |
|---|---|
| `U-PLANNUM-001` | baseline 外の採番 key が 2 本で fail-close（key・実本数・許容本数・filename を報告） |
| `U-PLANNUM-002` | baseline 登録済みは許容本数まで通し、1 本増で拒否 |
| `U-PLANNUM-003` | baseline を下回ったら `resolvedBaselineKeys` で報告 |
| `U-PLANNUM-004` | 採番 key 粒度（slug 非依存、slug省略形も対象、pattern 外は無視） |
| `U-PLANNUM-005` | 実 repo が baseline 超過 0、かつ baseline に stale key 無し |
| `U-PLANNUM-006` | `plan lint` 既定経路と専用 gate 双方への配線 |

## §4 配線

`helix plan lint`（gate 未指定の既定合成）と `helix plan lint --gate number-uniqueness` の
双方へ配線する。gate を書いても既定経路に載っていなければ CI では発火しないため、
oracle は**両方の経路**を固定する。
