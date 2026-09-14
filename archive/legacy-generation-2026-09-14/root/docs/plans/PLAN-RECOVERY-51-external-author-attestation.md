---
plan_id: PLAN-RECOVERY-51-external-author-attestation
superseded_by: [PLAN-RECOVERY-53-external-invariant-errata]
title: "PLAN-RECOVERY-51 (recovery): bot 著 PR を external として実測する attestation"
kind: recovery
layer: cross
drive: agent
status: confirmed
route_mode: recovery
entry_signals:
  - "po_directive:2026-07-11 GitHub 自走運用（通常 lane は明示依頼を待たず push→PR→merge まで継続する）に基づき、Issue #553『attestation が bot 著の PR を codex 著と誤帰属する』を自走で解消する"
created: 2026-08-11
updated: 2026-08-12
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
contract_invariants: "bot commit と HELIX runtime commit が同居する母集団では `external` を返さない（従来どおり claude / codex / mixed へ落ちる）。bot 著でない既存 PR の測定結果を変えない（`external` は全件 bot 著かつ trailer 皆無のときだけ返る）。`mixed` の exact-two 契約（PLAN-RECOVERY-44 / #550 / #552）は不変。merge parent 数による merge commit 除外（PLAN-RECOVERY-43）は不変。evidence 取得は引き続き `authorRuntimeEvidenceArgs` 経由の単一 call site に束縛する"
contract_failures: "author_runtime_attestation_mismatch（bot 著 PR に codex / claude / mixed を申告した、または非 bot PR に external を申告した）。author_runtime_evidence_unavailable（拡張後の wire format を parse できない）。runtime_identity_invalid（external 申告で reviewerRuntime が claude / codex 以外）"
tdd_red_required: true
red_at: "2026-08-12T04:04:26+09:00"
green_at: "2026-08-12T04:04:29+09:00"
mutation_oracle_evidence: "oracle は tests/claude-pr-convergence.test.ts / tests/claude-memory-wake.test.ts / tests/github-cross-review-admission.test.ts に置き、実行は `npx --no-install vitest run tests/claude-pr-convergence.test.ts tests/claude-memory-wake.test.ts tests/github-cross-review-admission.test.ts`。設計側の対応は docs/test-design/helix/L8-github-cross-review-admission-unit-test-design.md に登録した。Red/Green は実装 3 file を HEAD 版へ差し戻して再観測した（原 TDD サイクルの再現であり、3 秒差は再観測の所要時間である）。Red = 3 files / 17 failed・53 passed（2026-08-12T04:04:26+09:00）、Green = 3 files / 70 passed（2026-08-12T04:04:29+09:00）。fence が効くことは source mutation 9 件で実測し、全件 killed を確認した: M1 external 判定分岐を削除 -> killed（#553 の誤帰属が復活し U-CPRCONV-EXT-001/004 が落ちる）。M2 bot 混在ガードを every から some へ緩める -> killed。M3 wire format を旧 2 フィールドへ戻す -> killed。M4 parse の bot flag 厳密検査（0/1）を削除 -> killed。M6 claudeReviewDispatchAllowed から external を削除 -> killed。M7 isCanonicalClaudePrReviewRequest の measured allowlist から external を削除 -> killed（初回は survived しており、受信側 canonical 判定の反例を U-MEMWAKE-003 へ追加して塞いだ）。M8 reviewPairFailure の external 分岐を削除 -> killed。M9 external の authorModel 空チェックを削除 -> killed。M10 external で reviewerModel provider 束縛を削除 -> killed。なお parse の `botSeparator <= 0` 検査は単独 mutation が survived する（bot flag 厳密検査で結果的に弾けるため冗長）。冗長であることを実測した上で、意図を面に出す多層防御として残しており、独立に fence されているとは主張しない"
complexity_effect: justified_positive
complexity_justification: "測定値の値域が 3 値から 4 値へ増えるが、増分は『trailer 無し = codex』という誤った推定を、bot identity という観測可能な事実で分岐させるものであり、推定を 1 つ削る。wire format は 1 フィールド増える"
removal_trigger: "commit の runtime identity が cryptographic に検証可能になり、trailer 由来の推定そのものが不要になった場合（PLAN-RECOVERY-42 の removal_trigger と同一）"
parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md
pair_artifact: docs/test-design/helix/L8-github-cross-review-admission-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md, oracle_id: U-CPRCONV-EXT-001, test_path: tests/claude-pr-convergence.test.ts }
  - { parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md, oracle_id: U-CPRCONV-EXT-002, test_path: tests/claude-pr-convergence.test.ts }
  - { parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md, oracle_id: U-CPRCONV-EXT-003, test_path: tests/claude-pr-convergence.test.ts }
  - { parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md, oracle_id: U-CPRCONV-EXT-004, test_path: tests/claude-pr-convergence.test.ts }
  - { parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md, oracle_id: U-CPRCONV-EXT-005, test_path: tests/claude-pr-convergence.test.ts }
  - { parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md, oracle_id: U-GCRA-EXT-001, test_path: tests/github-cross-review-admission.test.ts }
  - { parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md, oracle_id: U-MEMWAKE-002, test_path: tests/claude-memory-wake.test.ts }
  - { parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md, oracle_id: U-MEMWAKE-003, test_path: tests/claude-memory-wake.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — 『trailer 無し = codex』推定が bot 著を誤帰属する範囲の同定" }
  - { role: qa, slot_label: "QA — external 判定と既存 3 値の非回帰を反例 oracle で固定" }
  - { role: tl, slot_label: "TL — Claude 著のため Codex 独立レビュー必須の確認" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-51-external-author-attestation.md, artifact_type: markdown_doc }
  - { artifact_path: src/runtime/author-runtime-evidence.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/claude-pr-convergence.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/claude-memory-wake.ts, artifact_type: source_module }
  - { artifact_path: tests/claude-pr-convergence.test.ts, artifact_type: test_code }
  - { artifact_path: tests/claude-memory-wake.test.ts, artifact_type: test_code }
  - { artifact_path: tests/github-cross-review-admission.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-RECOVERY-42-author-runtime-attestation.md
  requires:
    - docs/plans/PLAN-RECOVERY-42-author-runtime-attestation.md
    - docs/plans/PLAN-RECOVERY-43-attestation-merge-parent-detection.md
    - docs/plans/PLAN-RECOVERY-44-mixed-authorship-dual-review.md
  blocks:
    - issue:553
review_evidence:
  - reviewer: "Codex independent cross-runtime reviewer"
    review_kind: cross_agent
    reviewed_at: "2026-08-11T20:23:31Z"
    tests_green_at: "2026-08-11T20:23:26Z"
    verdict: approve
    worker_model: claude-opus-5
    reviewer_model: codex-gpt-5
    scope: "PR #569 の implementation HEAD baa25a6f01584b59093be201a16b3ca0638161d8 を read-only で再監査した。external の判定条件（全 implementation commit が Bot かつ Claude trailer 無し）、3-field wire format、旧形式拒否、dispatch/admission の値域、external receipt の reviewer 側 model binding と既存 claude/codex/mixed 非回帰を確認した。GitHub API の Dependabot PR #384 実データでも bot flag=1 の wire 行を確認し、PR #569 の required scope と companion paths に逸脱は無かった。doctor の merged-plan-status failure は本 PLAN が draft のまま generated deliverable を持っていた metadata 不整合であり、実装 blocker ではない。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run tests/claude-pr-convergence.test.ts tests/claude-memory-wake.test.ts tests/github-cross-review-admission.test.ts --reporter=json", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-11T20:23:26Z", evidence_path: tests/claude-pr-convergence.test.ts, output_digest: "sha256:24a0e2bae6a79d4afb2368f2e7e3bcdeaff5c1f8289aa0ab356cd978c88aef26", result: "6 suites / 70 tests green" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-11T20:23:26Z", evidence_path: src/runtime/claude-pr-convergence.ts, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0（空出力）" }
---

# PLAN-RECOVERY-51 — bot 著 PR を external として実測する attestation

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

## 4. 検証（実測済み oracle）

| oracle | 固定する事実 | test |
|---|---|---|
| U-CPRCONV-EXT-001 | 全実装 commit が bot 著かつ trailer 無し -> `external`。bot と codex / claude の混在は `external` にしない。既存 3 値は不変。bot 著でも trailer があれば `claude` | `tests/claude-pr-convergence.test.ts` |
| U-CPRCONV-EXT-002 | 拡張 wire format の query 定数と `gh` 実引数配列の exact 一致 | 同上 |
| U-CPRCONV-EXT-003 | 3 フィールド形式だけを受理し、旧 2 フィールドと `0` / `1` 以外の bot flag を拒否する | 同上 |
| U-CPRCONV-EXT-004 | bot 著 PR への codex / claude / mixed 申告を `author_runtime_attestation_mismatch` で拒否し、非 bot PR への `external` 申告も拒否する | 同上 |
| U-CPRCONV-EXT-005 | `external` receipt は reviewer 側だけを束縛する（claude / codex 双方受理、reviewerModel の provider 一致は必須、authorModel 空は拒否） | 同上 |
| U-GCRA-EXT-001 | `external` receipt が単一 receipt 経路で受理され、2 通は従来どおり `review_receipt_conflict` になる（`mixed` の dual-receipt 経路へ入らない） | `tests/github-cross-review-admission.test.ts` |
| U-MEMWAKE-002 | `claudeReviewDispatchAllowed("external")` が true で、依頼本文が `measured_author_runtime: external` を持つ | `tests/claude-memory-wake.test.ts` |
| U-MEMWAKE-003 | 受信側の canonical 判定が `external` の依頼を選択する（dispatch 側と受信側の値域が一致する） | 同上 |

実測結果は frontmatter の `mutation_oracle_evidence` に記録した。

**status は `confirmed`。** Codex の独立 cross-runtime review evidence を frontmatter に記録済みであり、
current PR HEAD の Codex receipt・CI・DB convergence が揃うまで Ready / merge は行わない。

## 5. 本 PLAN が主張しないこと

- 本変更は runtime identity の証明ではない。`author.type == "Bot"` は GitHub の申告であり、
  PLAN-RECOVERY-42 が記した trailer と同じく cryptographic identity ではない。
  推定を 1 つ（trailer 無し = codex）減らすが、推定を全廃するものではない。
- bot 著 PR の**内容**の安全性については何も主張しない。依存更新の妥当性は
  レビューと CI が判断する事項であり、attestation の役割ではない。
- 既に merge 済みの bot 著 PR（誤帰属のまま通過したもの）を遡って訂正しない。
  必要なら別 PLAN で errata として扱う。

## 訂正注記（PLAN-RECOVERY-53 による errata）

本 PLAN の `contract_invariants` は当初「既存 PR の測定結果を 1 件も変えない」と記述していた。
これは **誤り** である。PR #384 は `codex` から `external` へ変わり、それこそが Issue #553 が
要求した是正そのものだった。

**PLAN-RECOVERY-53-external-invariant-errata** が同記述を「bot 著でない既存 PR の測定結果を
変えない」へ限定し、L5 detail design / L8 unit test design / `tests/claude-pr-convergence.test.ts`
の comment へ伝播していた同一文言も併せて訂正した。

この誤りは PR #569 の Claude 収束レビュー（B-1、
https://github.com/RetryYN/HELIX-HARNESS/pull/569#issuecomment-5258922628 ）で merge 前に
指摘されていたが、未対応のまま merge された。既存 oracle `U-CPRCONV-EXT-001` は当初から
「全実装 commit が bot 著なら `external`」を要求しており、**oracle と prose が食い違ったまま
confirmed になった**ケースである。

実装、oracle の assertion、その他の契約記述はいずれも変更していない。
