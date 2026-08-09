# Kimi 独立レビュー lane — admission 束縛の是正記録（2026-08-09）

- 対象: issue #390 / KIMI-REVIEW-FALLBACK-001
- PLAN: `docs/plans/PLAN-RECOVERY-40-kimi-admission-lane-closure-digest.md`
- 先行: PLAN-RECOVERY-39（受け入れ試験の実装、PR #481 merge 済み）、PR #486（SOL 相談と決定記録）

## 1. 何が起きたか

PR #486 で決めた「通し稽古を先に 1 回通す」を実施しようとしたところ、その前段で admission が
main 上で成立しないことが分かった。

`admission_implementation_head` は 40 桁 git sha で、利用時に `git rev-parse HEAD` との完全一致を
要求していた。本 repository は merge commit 方式のため、受け入れ試験を実施した lane PR の head sha は
merge 後の main HEAD と決して一致しない。

実測: PR #481 の head sha は `27a15fa0`、merge commit は `5c77ba27`。

したがって admission が有効なのは「レビュー対象 lane PR の branch tip をそのまま checkout している
間」だけであり、main 上では決して有効にならなかった。加えて lane と無関係な merge のたびに失効した。

`.helix/runtime/claude-pr-convergence/receipts` = 0 件、`.helix/runtime/review-fallback/admission` = 0 件
という実測とも整合する。チェーンは一度も閉じていない。

## 2. 先行記録の訂正

issue #390 に書いた「Claude quota 枯渇対策なのに同一 HEAD の Claude review receipt が必須で循環している」
という所見は**言い過ぎだった**。SOL への相談もこの誤読を前提にしていた。

`--claude-receipt` が指す Claude レビュー receipt は、Kimi がこれからレビューする PR のものではなく、
**Kimi lane 実装そのものを Claude がレビューした** receipt である（L6 設計 §3 Bootstrap の自己 admit
禁止アンカー）。lane 実装 1 バージョンにつき 1 回の bootstrap であり、レビューのたびに Claude approve が
要るわけではない。quota 枯渇との循環は成立しない。

残る実際の欠陥は上記 1 点だけであり、目的側ではなく**束縛キーの選び方**にあった。

## 3. 是正の内容

| 項目 | 旧 | 新 |
|---|---|---|
| 利用時 gate | `admission_implementation_head` == `git rev-parse HEAD` | `admission_lane_closure_digest` == 実測 closure digest |
| 束縛対象 | repository 全体の commit id | lane 実装 source 固定集合 + provider material |
| 無関係な merge | 失効する | 失効しない |
| provider binary の差し替え | 捕まえられない | 失効する |
| negative mutation | 4 件 | 6 件（closure_member_drift / closure_member_removed を追加） |

24 時間上限、Claude review bootstrap、bench case exact set、proposal-only、risk 上限は不変。
HEAD 束縛の撤去は緩和ではなく是正であり、緩むのは lane と無関係な範囲だけである。

## 4. 実測

`npx --no-install tsx tests/tools/kimi-review-admission/run-admission-bench.ts docs/research/assets/kimi-review-lane-admission-2026-08-09`

- bench case: **5/5 pass**（`clean_approve` / `seeded_blocker` は bubblewrap 隔離下の実 Kimi 起動、
  `tool_request` / `schema_drift` / `quota_switch` は決定的 oracle）
- negative mutation: **6/6 kill**
- `lane_closure_digest` = `sha256:2240ebb8411da111a3a76c106c58478ff8245dd740e119530738fc5bb588e4c5`
- Kimi CLI 0.29.2 / binary sha256 `f9977d259ed36019793cadf04b1f0343f12aaebfa76f90fa26cd3b02be671231`

新規 mutation の観測値（`closure_member_drift.mutation.json`）:

```json
{
  "drifted_member": "src/cli/commands/review-fallback.ts",
  "killed": true,
  "observed": "kimi_review_admission_lane_closure_digest_mismatch"
}
```

closure から member を 1 件落とす `closure_member_removed` も同じ failure code で kill された。
これにより closure digest 束縛が名目でないこと、すなわち member の内容変更と member 削除の
どちらも実際に失効を起こすことが機械的に示されている。

## 5. SOL 指摘との対応

T0（`gpt-5.6-sol`）が「将来の安全な再検討余地」として挙げていた案が、まさにこの是正である。

> 単純な HEAD 非束縛や TTL 延長ではなく、Kimi lane 実装とその transitive policy/config closure の
> material digest へ束縛する案を別 PLAN・別 bench で比較する。少なくとも、現運用 telemetry が
> 「無関係な merge だけで再発行される」ことを示し、dependency closure の完全性を negative mutation で
> 証明するまでは採らない。

前提条件のうち「無関係な merge だけで再発行される」は telemetry を待つまでもなく構造から確定していた
（merge commit である限り常に失効する）。「closure の完全性を negative mutation で証明する」は
本 PLAN の `closure_member_drift` / `closure_member_removed` で満たした。

SOL が併せて指摘した「HEAD と 24 時間だけでは freshness key が不足する（CLI / model が変われば
同一実装とは言えない）」も、provider material を closure に含めることで併せて閉じた。

## 6. 残件

lane が実際に使えるかどうかは、Claude review receipt を 1 回発行して admission へ到達させる通し稽古で
測る。本 PLAN はその通し稽古を可能にするための前提是正であって、通し稽古そのものではない。
