---
layer: L6
sub_doc: function-spec
status: confirmed
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
plan: docs/plans/PLAN-L6-60-specific-parent-design-binding.md
---

> **L6 contract marker**: `analyzeSpecificParentDesignBinding(docs, parentDocs, baseline) => SpecificParentDesignBindingResult` は
> 単体テスト粒度の contract。pre: 対象は `kind=impl/add-impl` の PLAN。post: L7 PLAN が汎用 parent design だけで
> 新機能・新 capability の設計判断を保持する場合、baseline 外では ok=false。invariant: L7 は実装/テスト slice であり、
> 採用候補の要件・境界・契約は L3-L6 の design/add-design PLAN へ降下させる。

# plan-descent specific parent binding — 機能設計

## §1 範囲

`PLAN-L6-54-plan-descent-gate` / `PLAN-L7-347-plan-descent-gate-impl` は、L7 PLAN に L6 parent design と
L8 単体テスト設計 pair を要求する。しかし今回の外部 agent catalog 監査で、`docs/design/helix/L6-function-design/pillar-function-design.md`
のような汎用 L6 doc を親にして、実質的には新 capability の採用判断・境界・受入条件を L7 PLAN 本文へ置く経路が残った。

これは V-model の左腕を使わず、L7 を設計棚卸し doc として使う穴である。本設計はこの穴を追加 gate として塞ぐ。

## §2 Contract

対象は `kind=impl` / `kind=add-impl` の L7 PLAN。以下を検査する。

| item | contract |
|---|---|
| 汎用親 design 検出 | `parent_design` が `pillar-function-design.md`、`orchestration-memory.md`、その他 hub / umbrella / master / generic catalog と判定される場合、機能固有親ではない。 |
| feature binding | L7 PLAN は `parent_design` だけでなく、機能固有の L3-L6 design/add-design PLAN または design doc を `dependencies.requires` に持つ。draft の採用候補同士は `requires` ではなく `references` に置く。 |
| design debt route | 外部 source 監査などで採用候補だけを棚卸しする場合は、L7 impl PLAN として実装 ready を名乗らず、`research` / `add-design` / audit finding / backlog のいずれかへ置く。L7 に残す場合は `forward_descent_debt` を明示し、実装着手前に L3-L6 降下 PLAN を要求する。 |
| generates substance | L7 impl PLAN の `generates` は将来 test file 名だけでなく、実装対象 source/module または command surface を少なくとも 1 件持つ。採用候補棚卸しだけなら L7 impl ではない。 |
| test design layer | L7 impl PLAN の単体テスト設計 pair は L8 とする。結合テスト設計は L9 に置き、L7 起票 gate の unit pair と混同しない。 |

## §3 判定 reason

- `generic_parent_design`: parent design が汎用 hub で、機能固有 contract へ bound されていない。
- `design_decision_in_l7`: 目的・スコープ・受入条件が新 capability の要件/契約を定義しているのに、L3-L6 design PLAN が無い。
- `missing_source_generate`: L7 impl PLAN の `generates` が markdown/test_code だけで、実装 surface が無い。
- `missing_forward_descent_debt_record`: 採用候補棚卸しを L7 に一時置きする理由・降下先・実装禁止条件が無い。

## §4 テスト oracle

将来の `tests/plan-descent-specific-parent-binding.test.ts` で被覆する:

| ID | oracle |
|---|---|
| U-PSPB-001 | 汎用 parent design + source/test 実装 generate あり + 機能固有 requires あり → ok |
| U-PSPB-002 | 汎用 parent design + L7 本文で新 capability 契約を定義 + 機能固有 design なし → `design_decision_in_l7` |
| U-PSPB-003 | L7 impl PLAN の generates が markdown_doc と test_code のみ → `missing_source_generate` |
| U-PSPB-004 | 外部 catalog 採用候補を L7 に一時置きし、`forward_descent_debt` と降下先 PLAN がある → advisory only |
| U-PSPB-005 | 機能固有 L6 design doc を parent に持ち、source/test surface が明示される通常 L7 impl → ok |

## §5 PLAN固有Vペア4点binding（PLAN-L6-65追補）

`analyzePlanSpecificVpairBindings(input) => PlanSpecificVpairBindingResult` は、L7実装PLANが単にL6/L8/testの
pathを持つだけでなく、同一の検証意図へ結合されていることを判定する純粋contractとする。

### §5.1 入力schema

実装PLANはfrontmatterに次を持つ。

```yaml
verification_bindings:
  - parent_design: docs/design/harness/L6-function-design/example.md
    oracle_id: U-EXAMPLE-001
    test_path: tests/example.test.ts
```

4点tupleはtop-level `plan_id`とentryの3 fieldで構成する。entryの`parent_design`はtop-level値と完全一致、
`oracle_id`は`U-<FAMILY>-<3桁>[小文字suffix任意]`のexact単一token、`test_path`はcanonicalな
repo-relative `tests/**` pathとする。重複tuple、未知field、絶対path、`..`、backslash、range/shorthandを拒否する。

### §5.2 結合invariant

1. 本analyzerのpreconditionは既存`plan-descent`がgreenであることとし、parent/pairの実在・層・confirmed判定は
   重複実装しない。lint/doctorは常にplan-descentの後に本gateを実行する。
2. oracle IDはpair L8の機械可読oracle表にexact 1回だけ宣言され、同じrowのtest citationがtest pathと一致する。
3. test pathは実在regular fileで、PLAN `generates`の同一pathが`artifact_type: test_code`である。
4. test本文はexact PLAN IDを持ち、TypeScript AST上の実CallExpressionでcalleeがbare identifier
   `it`または`test`、第1引数がstatic string `"<oracle_id>: ..."`であるcase titleを一意に持つ。
   comment、dead string、computed name、`.skip/.todo/.skipIf`、dynamic templateは充足に数えない。
5. 1 test fileへの複数oracleは許容する。oracle ownershipはL6 designが持ち、non-archived PLAN履歴での再利用を
   許容するが、同時にactiveな複数test pathへ分岐させない。add-implの挙動deltaは新oracle IDを追加する。
6. binding 0件、ambiguous row、family要約だけの宣言、部分文字列一致はfail-closeする。

### §5.3 ratchet

authority正本は`config/plan-specific-vpair-binding-authority.json`、schemaは
`plan-specific-vpair-binding-authority.v2`とする。既存debtはimmutable `initialAuthority[]`へexact
`{fingerprint, plan_id, reason, detail, plan_path, plan_semantic_digest}`をfingerprint昇順で固定する。fingerprintはUTF-8/LF、key順
`plan_id,reason,detail`、detail欠落は`null`としたJSONのSHA-256。codeはinitial集合digestをconstantでpinし、
導入時の機械生成後は追記・置換を許さない。initial集合digestはfingerprintだけでなくentry全体をhashし、semantic pinの
改竄もcode-side pinで検出する。v1/未知schemaの黙示upgradeやdowngradeはfail-closeする。
さらにv1導入時のfingerprint集合digestを独立constantで保持し、v2 full-entry pinを更新しても移行前286 identityの
置換・欠落・別集合へのすり替えを許さない。

`plan_semantic_digest`は、mutableな`updated` / `owner` / `review_evidence` /
`verification_bindings`を除く全frontmatter（未知fieldを含む）とMarkdown本文をcanonical JSONへ正規化してSHA-256化する。
`agent_slots`はrole/model/実行分担を表す実装意味なので除外しない。
object keyは再帰sort、`generates`とdependency path集合はcanonical sort、文字列はNFC、本文はLF・行末空白除去・末尾LF 1個とする。
active exemption適用時に`plan_path`またはdigestが不一致なら`baseline_plan_semantic_drift`として非免除failとし、
意味変更したlegacy PLANは固有bindingを補修してtombstone化するまで通さない。

`resolvedTombstones[]`は `{fingerprint,resolved_at,resolution_plan_id,previous_digest,entry_digest}` のappend-only
hash chainとする。genesis `previous_digest`はinitial集合digest、各`entry_digest`は
`sha256(previous_digest + "\n" + fingerprint + "\n" + resolved_at + "\n" + resolution_plan_id)`。
codeはterminal digestをpinし、正当な追加はresolution PLAN、cross-review、constant更新を同一commitで要求する。
chainの削除・置換・並べ替えは次entry/terminal digest不一致となる。active exemptionは`initial - resolved`、
resolved finding再出現はhard failする。initial外tombstone、重複、非UTC時刻、non-terminal resolution PLANも拒否する。

### §5.3.1 L8 検査対象table

oracle宣言として数えるのはheaderがexact `U-ID | 対象 | 反例と期待結果 | test citation`で、U-ID cellが
単一exact token、test citation cellが単一以上のbacktick付きcanonical `tests/**` pathを持つMarkdown tableだけ。
family summary、range/shorthand、prose、code fence、別header tableは宣言に数えない。row全体をparseできない
oracle-like行はschema findingとする。

### §5.4 reason

`verification_bindings_absent` / `binding_schema_invalid` / `binding_parent_mismatch` /
`oracle_not_declared` / `oracle_ambiguous` / `oracle_table_schema_invalid` / `oracle_test_citation_mismatch` / `test_not_generated` /
`test_path_missing` / `plan_citation_missing` / `oracle_citation_missing` / `oracle_owned_by_multiple_plans` /
`duplicate_binding` / `baseline_authority_invalid` / `resolved_finding_reappeared` をtyped reasonとする。
`generated_test_unbound` / `baseline_plan_semantic_drift`もtyped reasonとする。non-empty bindingを持つPLANでは、
`generates`の全`artifact_type: test_code` pathが少なくとも1件のbinding `test_path`に含まれることを要求する。
binding側からgenerates側への既存`test_not_generated`と合わせてpath集合を双方向に拘束する。legacyのbinding 0件は
従来の`verification_bindings_absent`だけを出し、新reasonを事前許可へ追加しない。

### §5.4.1 schema/path境界

`verificationBindingSchema.strict()`を`src/schema/frontmatter.ts`からexportし、frontmatter baseへ追加する。
非array/null entry/未知fieldは通常schema違反で先にfailし、raw loaderは例外をgreenへ倒さず
`binding_schema_invalid`へ正規化する。test pathはNFC正規化後に空segment、`.`、`..`、backslash、絶対pathを拒否し、
`lstat`でsymlinkを拒否、`realpath`がrepo root内のregular fileであることをadapterで検査する。case titleは
TypeScript compiler ASTで抽出し、regexによるcomment/dead-string誤認を禁止する。

### §5.5 oracle

詳細はL8正本 `U-PSPB-006..024`。各oracleはparameterized反例を含めて1 case titleへ束縛する。実装testは
`tests/plan-descent-specific-parent-binding.test.ts`へ1:1 citationし、plan lint単一/全走査とdoctor hard ANDも含む。
