---
plan_id: PLAN-RECOVERY-48-external-author-attestation
title: "PLAN-RECOVERY-48 (recovery): bot 著 PR を external として実測する attestation"
kind: recovery
layer: cross
drive: agent
status: draft
route_mode: recovery
entry_signals:
  - "po_directive:2026-07-11 GitHub 自走運用（通常 lane は明示依頼を待たず push→PR→merge まで継続する）に基づき、Issue #553『attestation が bot 著の PR を codex 著と誤帰属する』を自走で解消する"
created: 2026-08-11
updated: 2026-08-11
owner: Claude / QA
github_issue_id: 553
engineering_discipline_required: true
behavior_contract_id: GITHUB-CROSS-REVIEW-ADMISSION-001
responsibility_owner: github-cross-review-admission
change_slice: atomic
refactor_step: not_applicable
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: none
backprop_note: "measured authoring runtime の値域は現在 claude / codex / mixed の 3 値で、いずれも『HELIX が管理する 2 runtime のどちらかが書いた』という前提の上に立つ。bot 著という第 4 の状態は既存 3 値のいずれでも正しく表現できないため、値域そのものの拡張であり、code slice では L5 detail design（parent_design）の contract 記述を同一 slice で更新する。dispatch 許可判定の値域も同時に広がるため設計正本へ反映する"
contract_preconditions: "`measuredAuthorRuntimeFromCommits` は実装 commit（parentCount < 2）を母集団とし、Claude trailer を持つ件数が 0 なら `codex` を返す（PLAN-RECOVERY-42 / 43）。この規則は『trailer が無い = Codex が書いた』という推定に依存しており、trailer を付けない第三者 author（Dependabot 等の bot）を Codex 著と誤帰属する。evidence 取得は `AUTHOR_RUNTIME_EVIDENCE_QUERY` の `<parent 数>:<base64 message>` 形式で、commit author の identity を一切取得していない"
contract_postconditions: "実装 commit の母集団が全件 bot 著（GitHub API の `author.type == \"Bot\"`）かつ Claude trailer を 1 件も持たない場合、実測値は `codex` ではなく `external` になる。`external` は attestation で申告可能な値であり、admission では単一 receipt 経路（`mixed` の dual-receipt 経路ではない）で評価される。reviewer は claude / codex のどちらでもよく、bot 著 PR には保護すべき HELIX 著者 runtime が存在しないため自己レビューは成立しない"
contract_invariants: "bot commit と HELIX runtime commit が同居する母集団では `external` を返さない（従来どおり claude / codex / mixed へ落ちる）。既存 PR の測定結果を 1 件も変えない（`external` は全件 bot 著かつ trailer 皆無のときだけ返る）。`mixed` の exact-two 契約（PLAN-RECOVERY-44 / #550 / #552）は不変。merge parent 数による merge commit 除外（PLAN-RECOVERY-43）は不変。evidence 取得は引き続き `authorRuntimeEvidenceArgs` 経由の単一 call site に束縛する"
contract_failures: "author_runtime_attestation_mismatch（bot 著 PR に codex / claude / mixed を申告した、または非 bot PR に external を申告した）。author_runtime_evidence_unavailable（拡張後の wire format を parse できない）。runtime_identity_invalid（external 申告で reviewerRuntime が claude / codex 以外）"
tdd_red_required: true
red_at: ""
green_at: ""
mutation_oracle_evidence: ""
complexity_effect: justified_positive
complexity_justification: "測定値の値域が 3 値から 4 値へ増えるが、増分は『trailer 無し = codex』という誤った推定を、bot identity という観測可能な事実で分岐させるものであり、推定を 1 つ削る。wire format は 1 フィールド増える"
removal_trigger: "commit の runtime identity が cryptographic に検証可能になり、trailer 由来の推定そのものが不要になった場合（PLAN-RECOVERY-42 の removal_trigger と同一）"
parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md
pair_artifact: docs/test-design/helix/L8-github-cross-review-admission-unit-test-design.md
verification_bindings: []
agent_slots:
  - { role: aim, slot_label: "AIM — 『trailer 無し = codex』推定が bot 著を誤帰属する範囲の同定" }
  - { role: qa, slot_label: "QA — external 判定と既存 3 値の非回帰を反例 oracle で固定" }
  - { role: tl, slot_label: "TL — Claude 著のため Codex 独立レビュー必須の確認" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-48-external-author-attestation.md, artifact_type: markdown_doc }
dependencies:
  parent: docs/plans/PLAN-RECOVERY-42-author-runtime-attestation.md
  requires:
    - docs/plans/PLAN-RECOVERY-42-author-runtime-attestation.md
    - docs/plans/PLAN-RECOVERY-43-attestation-merge-parent-detection.md
    - docs/plans/PLAN-RECOVERY-44-mixed-authorship-dual-review.md
  blocks:
    - issue:553
review_evidence: []
---

# PLAN-RECOVERY-48 — bot 著 PR を external として実測する attestation

## 1. 問題

`measuredAuthorRuntimeFromCommits` は実装 commit の母集団に Claude trailer が 1 件も無ければ
`codex` を返す。この規則は **「trailer が無い」を「Codex が書いた」と読み替える推定**であり、
trailer を付けない第三者 author を Codex 著として誤帰属する。

Issue #553 が指摘した実例（PR #384、Dependabot）を実測した。

```
gh api repos/RetryYN/HELIX-HARNESS/pulls/384/commits

parents=1 login=dependabot[bot] type=Bot  trailer=no  chore(deps-dev): bump postcss ...
parents=2 login=RetryYN         type=User trailer=no  Merge branch 'main' into dependabot/...
```

実装 commit は Dependabot の 1 本だけで trailer 無し。よって実測値は `codex` になる。
Codex は 1 行も書いていない。

この誤帰属の実害は 2 つある。

1. **attestation が誤った事実を通す。** `authorRuntime: "codex"` を申告した receipt が
   attestation を通過してしまう。attestation は「申告を実測で裏付ける」ための機構なので、
   実測側が誤っていれば機構そのものが無意味になる。
2. **独立性判定の前提が崩れる。** `codex` 著と測られた PR は Claude がレビューすれば独立と
   判定されるが、実際には Codex 著ではないので、この「独立」は偶然成り立っているにすぎない。
   逆に Codex がレビューしようとすると `runtime_independence_missing` で不当に阻まれる。

## 2. 方針（案 A: external を第 4 の実測値として追加）

Issue #553 の案 A を採る。**bot 著は HELIX の 2 runtime のどちらでもない第 3 の状態**であり、
既存 3 値のいずれに寄せても嘘になるため、値域そのものを広げる。

```
MeasuredAuthorRuntime = "claude" | "codex" | "mixed" | "external"
```

### 2.1 判定規則

実装 commit（`parentCount < 2`）を母集団とし、既存規則の**手前**に 1 分岐だけ足す。

```
母集団が全件 bot 著 かつ Claude trailer が 0 件  ->  external
それ以外                                        ->  従来どおり claude / codex / mixed
```

**bot commit と HELIX runtime commit が同居する場合は `external` を返さない。** これは
意図的に保守側へ倒している。混在は「bot の変更に HELIX runtime が手を入れた」状態であり、
HELIX 側の寄与に対するレビュー独立性は依然として要求されるべきだからである。

この規則により **既存 PR の測定結果は 1 件も変わらない**。`external` が返るのは
「全実装 commit が bot 著」という、これまで存在しなかった条件のときだけである。

### 2.2 wire format の拡張

現行の evidence は commit author の identity を一切取っていない。

```
現行: .[] | "\(.parents | length):\(.commit.message | @base64)"
      -> "1:Y2hvcmUoZGVwcy1kZXYpOiA..."
```

GitHub API の commit payload には `author.type` があり、Dependabot では `"Bot"` になることを
実測で確認済みである。**追加取得は不要**で、query の射影を広げるだけでよい。

```
拡張: .[] | "\(.parents | length):\(if (.author.type? // "") == "Bot" then 1 else 0 end):\(.commit.message | @base64)"
      -> "1:1:Y2hvcmUoZGVwcy1kZXYpOiA..."
```

`.author` は API 上 null になりうる（GitHub アカウントに紐付かない commit）ため
`.author.type? // ""` で受ける。**null は bot ではなく非 bot 側へ倒す**（fail-close 方向）。

`parseAuthorRuntimeEvidence` は 2 番目のフィールドを `0` / `1` の厳密一致で読み、
それ以外は `null` を返して `author_runtime_evidence_unavailable` へ落とす。
**旧形式（2 フィールド）は受理しない。** dual-read にすると、query 側だけ巻き戻された場合に
全 commit が非 bot として静かに通り、誤帰属が復活するためである。

### 2.3 admission と独立性

`external` は **単一 receipt 経路**で評価する（`mixed` の dual-receipt 経路ではない）。
bot 著 PR には保護すべき HELIX 著者 runtime が存在しないため、両 runtime のレビューを
要求する理由が無い。

`reviewPairFailure` の扱いは次のとおり。

| 検査 | claude / codex | mixed | external |
|---|---|---|---|
| `reviewerRuntime ∈ {claude, codex}` | 要求 | 要求 | 要求 |
| `authorRuntime !== reviewerRuntime` | 要求 | 適用外 | 適用外（常に不一致） |
| `modelProviderFromId(authorModel) === authorRuntime` | 要求 | 適用外 | **適用外** |
| `modelProviderFromId(authorModel) !== reviewerRuntime` | — | 要求 | **適用外** |
| `checkCrossAgentModelPair(authorModel, reviewerModel)` | 要求 | 要求 | **適用外** |
| `modelProviderFromId(reviewerModel) === reviewerRuntime` | 要求 | 要求 | 要求 |

`external` で author 側の model 検査を適用外にするのは、**bot に model が存在しない**ためである。
`authorModel` には audit のため author identity（例 `dependabot[bot]`）を記録するが、
これを model id として解釈しない。空文字は許容しない。

### 2.4 dispatch 許可判定

`claudeReviewDispatchAllowed`（PLAN-RECOVERY-46 / PR #557 で導入）の allowlist へ
`"external"` を追加する。bot 著 PR は Claude 収束レーンで処理してよい。

これは #551 が塞いだ自己レビュー要求の境界を広げるものではない。**#551 が塞いだのは
「Claude 著 PR を Claude へ dispatch すること」**であり、bot 著 PR には守るべき
Claude 著者性が無いため自己レビューにならない。

型がこの判断を強制することを実測済みである。

```
main (2dfa0977) で MeasuredAuthorRuntime へ "external" を追加   -> tsc --noEmit exit 0
PR #557 の tree で同じ追加                                       -> tsc --noEmit exit 2
  claude-pr-convergence.ts(351,5)  TS2322  '"external"' is not assignable to DispatchAuthorRuntime
  claude-pr-convergence.ts(378,36) TS2345  同上
```

つまり #557 merge 後は、dispatch 側の判断を**黙って回避できない**設計になっている。

## 3. 実装順序と依存

**本 PLAN の code slice は PR #557 の merge 後に載せる。** #557 は測定ロジックを
`src/runtime/claude-pr-convergence.ts` から `src/runtime/author-runtime-evidence.ts` へ
移設しており、main 上で先に実装すると確実に衝突する。#557 merge 前に着手できるのは
本 PLAN と L8 test design（docs のみ）に限る。

## 4. 検証（oracle 予定）

いずれも Red-first で追加し、mutation で fence が効くことを実測する。

| oracle | 固定する事実 |
|---|---|
| U-CPRCONV-EXT-001 | 全実装 commit が bot 著かつ trailer 無し -> `external` |
| U-CPRCONV-EXT-002 | bot commit と codex commit の混在 -> `external` にならない（`codex`） |
| U-CPRCONV-EXT-003 | bot commit と claude 著 commit の混在 -> `mixed` |
| U-CPRCONV-EXT-004 | 既存 3 値の測定結果が不変（PLAN-RECOVERY-42 / 43 の全 fixture 再実行） |
| U-CPRCONV-EXT-005 | 拡張 wire format の exact 一致（query 定数と引数配列） |
| U-CPRCONV-EXT-006 | 旧形式 2 フィールドの evidence を parse 拒否する |
| U-CPRCONV-EXT-007 | bot flag が `0` / `1` 以外なら parse 拒否する |
| U-CPRCONV-EXT-008 | `.author` が null の commit を非 bot として扱う |
| U-CPRCONV-EXT-009 | `external` 申告 + 非 bot PR -> `author_runtime_attestation_mismatch` |
| U-CPRCONV-EXT-010 | bot PR + `codex` 申告 -> `author_runtime_attestation_mismatch`（#553 の回帰） |
| U-CPRCONV-EXT-011 | `external` receipt が単一 receipt 経路で admission を通る |
| U-CPRCONV-EXT-012 | `external` receipt が `mixed` の dual-receipt 経路へ入らない |
| U-MEMWAKE-EXT-001 | `claudeReviewDispatchAllowed("external")` が true |

`mutation_oracle_evidence` は実装時に実測して埋める。**本 PLAN は実測前のため
`status: draft` であり、oracle が green になるまで confirmed にしない。**

## 5. 本 PLAN が主張しないこと

- 本変更は runtime identity の証明ではない。`author.type == "Bot"` は GitHub の申告であり、
  PLAN-RECOVERY-42 が記した trailer と同じく cryptographic identity ではない。
  推定を 1 つ（trailer 無し = codex）減らすが、推定を全廃するものではない。
- bot 著 PR の**内容**の安全性については何も主張しない。依存更新の妥当性は
  レビューと CI が判断する事項であり、attestation の役割ではない。
- 既に merge 済みの bot 著 PR（誤帰属のまま通過したもの）を遡って訂正しない。
  必要なら別 PLAN で errata として扱う。
