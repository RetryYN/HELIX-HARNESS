---
plan_id: PLAN-RECOVERY-49-locale-independent-finding-order
title: "PLAN-RECOVERY-49 (recovery): finding 整列を locale 非依存の bytewise 全順序へ固定する"
kind: recovery
layer: cross
drive: agent
status: confirmed
route_mode: recovery
entry_signals:
  - "po_directive:2026-08-11 PO 指示「別途イシュー回収をしてくれ」。Issue #309（design-template-authority の finding 整列が localeCompare 依存で Design Template JSON の logical digest と Windows 互換検証の決定論性を保証できない）を自走で解消する"
created: 2026-08-11
updated: 2026-08-11
owner: Claude / TL
github_issue_id: 309
engineering_discipline_required: true
behavior_contract_id: DESIGN-TEMPLATE-JSON-AUTHORITY
responsibility_owner: design-template-json-authority
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: not_applicable
no_code_decision: modify
ddd_modeling_decision: policy
backprop_decision: not_required
backprop_decision_reason: "finding の集合・code 語彙・message・pointer はいずれも変更しない。変更するのは同一集合の整列順を決める comparator だけであり、要件・設計契約の追加ではない"
contract_preconditions: "design-template-authority の 2 箇所の finding 整列が `${code}\\0${pointer}\\0${message}` を localeCompare で比較する。localeCompare は ICU collation に依存し、(a) 既定 locale ですら code-point 順と符号が逆になる組が存在し、(b) U+0000 が completely-ignorable のため区切り文字として機能しない。(b) が起きた組では comparator が 0 を返し Array#sort の安定性で入力順が残るため、整列が入力順依存になる"
contract_postconditions: "両整列が bytewise 全順序 compareBytewise を使う。pointer が入力キー由来で大小混在する組（unknown property）でも、入力順に依らず同一のUTF-8 byte順を返す。UTF-8変換で同じbyte列になるlone surrogateはUTF-16 code unitでtie-breakし、異なる (code, pointer, message) 分割を等価と判定しない"
contract_invariants: "finding の集合・件数・code・pointer・message はいずれも不変。designTemplateSemanticDigest の計算対象（semantic_digest を除く normative 全体の canonicalJson）も不変。U-DTJ-001..U-DTJ-017 の既存 oracle はすべて維持する。新しい dependency / gate / writer を追加しない（Issue #309 の受入条件）"
contract_failures: "U-DTJ-015b が bytewise 期待順と不一致なら fail。U-DIGEST-010 が localeCompare の 2 誤動作条件を再現できなければ fail。U-DIGEST-011 が反対称性、lone surrogate の tie-break、または整列の入力順非依存性を満たさなければ fail"
tdd_red_required: true
red_at: "2026-08-11T14:40:01Z"
green_at: "2026-08-11T14:40:18Z"
mutation_oracle_evidence: "seeded defect を src/design/design-template-authority.ts と src/shared/string-utils.ts へ同時に注入し（git stash による旧実装＝localeCompare 版の完全復元）、tests/design-template-authority.test.ts::U-DTJ-015b が 1 failed / 17 passed で killed になることを実測した（2026-08-11T14:40:01Z）。復元後 tests/string-utils.test.ts と tests/design-template-authority.test.ts 合わせて 22 passed（2026-08-11T14:40:18Z）。旧実装での実出力は pointer 順 [\"/aExtra\",\"/BExtra\"]、新実装では [\"/BExtra\",\"/aExtra\"] であり、locale と code-point の符号が実際に逆転することを probe で直接確認済み"
complexity_effect: net_neutral
parent_design: docs/design/helix/L6-function-design/design-template-json-authority.md
pair_artifact: docs/test-design/helix/L8-design-template-json-authority-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/design-template-json-authority.md, oracle_id: U-DTJ-015b, test_path: tests/design-template-authority.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — localeCompare の 2 誤動作条件の同定と到達可能性の切り分け" }
  - { role: se, slot_label: "SE — compareBytewise の digest runtime 公開と 2 整列の差し替え" }
  - { role: qa, slot_label: "QA — 到達可能な負例（大小混在 pointer）と comparator 契約の直接 oracle" }
  - { role: tl, slot_label: "TL — 残り 233 箇所の localeCompare を本 PLAN の範囲外とする判断の妥当性" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-49-locale-independent-finding-order.md, artifact_type: markdown_doc }
  - { artifact_path: src/design/design-template-authority.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/digest.ts, artifact_type: source_module }
  - { artifact_path: tests/design-template-authority.test.ts, artifact_type: test_code }
  - { artifact_path: tests/digest.test.ts, artifact_type: test_code }
dependencies:
  parent: null
  requires: []
  blocks:
    - issue:309
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-11T17:36:54Z"
    tests_green_at: "2026-08-11T17:36:51Z"
    verdict: pass
    scope: "current HEAD の compareBytewise 実装、design-template-authority の2箇所の差し替え、U-DIGEST-010/011 と U-DTJ-015b、生成物manifestを確認。全回帰テストとBiomeはgreen、残ったdoctor failureは本PLANのmergedPlanStatus台帳不整合のみ。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests/digest.test.ts tests/design-template-authority.test.ts tests/plan-descent-specific-parent-binding.test.ts tests/plan-number-uniqueness.test.ts tests/design-reality-binding.test.ts --project fast"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-11T17:36:51Z"
        evidence_path: tests/digest.test.ts
        output_digest: "sha256:62b479d026785b4e2e5b5507d2099eadba1970ac2174fd4dff91a11dd5e1a7c1"
      - kind: typecheck
        command: "npx --no-install tsc --noEmit"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-08-11T17:34:00Z"
        evidence_path: tsconfig.json
        output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
      - kind: lint
        command: "npx --no-install biome check src/runtime/digest.ts src/design/design-template-authority.ts tests/digest.test.ts tests/design-template-authority.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-11T17:34:00Z"
        evidence_path: src/runtime/digest.ts
        output_digest: "sha256:7204a74622bc776e83cfffdb78c3d4836f12b852f4db046e08ab77af5805a67f"
---

# PLAN-RECOVERY-49：finding 整列を locale 非依存の bytewise 全順序へ固定する

## §1 なぜ recovery か

Issue #309 は「`localeCompare` を使うため ICU／locale 差で順序が**揺れる可能性がある**」として
起票された。実測した結果、**可能性ではなく既定 locale の時点で壊れている**ことが分かったため、
successor の設計課題ではなく recovery として扱う。

## §2 実測（推測ではなく計測）

`localeCompare` には別々の誤動作が 2 つある。Node v22.23.1 / 既定 locale `en-US` で計測した。

### §2.1 既定 locale で符号が逆転する

```
"aCode".localeCompare("BCode")            → -1   （a が先）
Buffer 比較 compareBytewise("aCode","BCode") → +1   （B が先）
```

「ICU 実装差で揺れうる」のではなく、**いま動いている環境で既に code-point 順と一致していない**。

### §2.2 `\0` が区切りとして機能しない

比較キーは `${code}\0${pointer}\0${message}` だが、U+0000 は ICU の照合で
completely-ignorable である。

```
"a\0b".localeCompare("ab")     → 0
"AB\0z".localeCompare("A\0Bz") → 0     （異なる 3 分割が等価）
compareBytewise("AB\0z","A\0Bz") → +1  （正しく区別）
```

comparator が 0 を返した要素は `Array.prototype.sort` の安定性により**入力順のまま**残る。
つまり §2.2 が起きた組では、locale を固定しても**入力順が変われば finding 順が変わり、
logical digest も変わる**。

## §3 到達可能性の切り分け（過大主張を避ける）

2 つの誤動作は現時点で到達可能性が異なる。ここを混ぜると受入条件の達成度を誤って報告することになる。

| 誤動作 | 公開 API から到達するか | 根拠 |
|---|---|---|
| §2.1 符号逆転 | **到達する** | `unknown property` finding の pointer は `` `/${key}` `` で入力オブジェクトのキー由来。大小混在のキーを与えれば順序が割れる |
| §2.2 NUL 無視 | **現時点では到達しない** | `code` は閉じた enum、`message` は各生成箇所の固定文字列であり、非 NUL 部分が一致する別分割を現在の語彙で構成できない |

したがって §2.2 は**潜在欠陥**である。comparator を差し替えれば消えるが、これを「いま digest が
壊れている」と報告するのは誤りになる。本 PLAN では §2.1 を到達可能な負例として oracle 化し、
§2.2 は comparator の契約テストとして直接固定する。

## §4 変更内容

### §4.1 bytewise comparator を digest runtime へ

`compareBytewise` を `src/runtime/digest.ts` へ追加し、digest経路で共有する。

```ts
export function compareBytewise(left: string, right: string): number {
  const utf8Order = Buffer.from(left, "utf8").compare(Buffer.from(right, "utf8"));
  if (utf8Order !== 0 || left === right) return utf8Order;
  for (let index = 0; index < Math.min(left.length, right.length); index += 1) {
    const unitOrder = left.charCodeAt(index) - right.charCodeAt(index);
    if (unitOrder !== 0) return unitOrder;
  }
  return left.length - right.length;
}
```

同等の実装は `src/runtime/atomic-slice-admission.ts:135` に既に存在するが module-private で
再利用できないため、本PLANではdigest runtime側に公開する。**新しい dependency は追加していない**（Issue #309 の受入条件）。

### §4.2 2 箇所の整列を差し替え

`src/design/design-template-authority.ts` の `evaluateTemplateApplicability` 内 finding 整列と
`sortedFailure` の 2 箇所。キーの構成（`${code}\0${pointer}\0${message}`）は変更しない。

## §5 検証

### §5.1 到達可能な負例 — `U-DTJ-015b`

大小混在の unknown property を 2 つ与え、**入力順を入れ替えても**同一の bytewise 順になることを
固定する。

```
新実装: ab → ["/BExtra","/aExtra"] , ba → ["/BExtra","/aExtra"]
旧実装: ab → ["/aExtra","/BExtra"] , ba → ["/aExtra","/BExtra"]
```

期待値を bytewise 順（`/BExtra` が先）に置いているため、旧実装では必ず fail する。

### §5.2 comparator 契約 — `U-DIGEST-010` / `U-DIGEST-011`

`U-DIGEST-010` は §2.1 と §2.2 を `localeCompare` の実挙動と対比して直接固定する。
`localeCompare` 側の期待値も書いてあるため、将来 ICU が変わればこの oracle 自体が知らせる。

`U-DIGEST-011` は反対称性と、逆順入力からの整列が同一結果になること（入力順非依存）を確認する。
さらにUTF-8変換でU+FFFDへ置換される `\uD800` / `\uD801` を含め、
byte比較が0になる異なる文字列をUTF-16 code unitで区別することも固定する。
0 と -0 を `Object.is` が区別するため、符号の比較は `===` で行っている。

### §5.3 mutation

旧実装（`localeCompare` 版）を完全復元する seeded defect で `U-DTJ-015b` が
**1 failed / 17 passed** となり killed。復元後 22 passed。

### §5.4 既存 oracle

`U-DTJ-001..U-DTJ-017` と `U-STRUTIL-001..002` はいずれも維持。`designTemplateSemanticDigest` は
`semantic_digest` を除いた normative 全体の `canonicalJson` から算出しており、finding 整列とは
独立であるため影響しない。

## §6 残る課題（本 PLAN の範囲外）

### §6.1 残り 233 箇所の `localeCompare`

`src/` 全体で `localeCompare` は **235 箇所 / 98 ファイル**に出現し、本 PLAN が触るのは 2 箇所のみ。
Issue #309 の受入条件は対象ファイルに限定されているが、**同じ欠陥が残り 233 箇所に残ったまま
「locale 非依存へ固定した」という状態表示が出る**点は明示しておく。

特に digest 経路に載る可能性があるものとして次を確認している（全数分類は未実施）。

```
src/design/design-registry-transaction.ts:702-703   nodeUpdates / edgeUpdates
src/design/design-registry-screen-intake.ts:286-290
src/assets/catalog.ts:208
```

digest / Windows 互換検証に載る整列の全数抽出と是正は独立 Issue へ分離する。本 PLAN で
`compareBytewise` を digest runtime に公開したことにより、後続はその呼び出しへの置換のみで済む。

### §6.2 `atomic-slice-admission.ts` の重複定義

同等実装が `src/runtime/atomic-slice-admission.ts:135` に module-private で残る。本 PLAN では
当該ファイルの behavior contract が別（`Issue #341` / `#342` が同ファイルの未決事項を保持）で
あるため触らない。§6.1 の一括置換と同時に単一正本化するのが妥当である。
