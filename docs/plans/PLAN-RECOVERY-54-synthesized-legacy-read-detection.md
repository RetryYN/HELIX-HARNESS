---
plan_id: PLAN-RECOVERY-54-synthesized-legacy-read-detection
title: "PLAN-RECOVERY-54 (recovery): 合成 path による legacy semantic read の回避経路を塞ぐ"
kind: recovery
layer: cross
drive: agent
status: confirmed
route_mode: recovery
entry_signals:
  - "po_directive:2026-07-11 GitHub 自走運用（通常 lane は明示依頼を待たず push→PR→merge まで継続する）に基づき、Issue #300（requirement-authority gate が合成 path の legacy semantic read を検出できない）を自走で解消する"
created: 2026-08-12
updated: 2026-08-12
owner: Claude / QA
github_issue_id: 300
engineering_discipline_required: true
behavior_contract_id: REQUIREMENT-JSON-AUTHORITY-CUTOVER
responsibility_owner: requirement-json-authority
change_slice: atomic
refactor_step: not_applicable
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: policy
backprop_decision: not_required
backprop_decision_reason: "契約（allowlist 外の legacy Markdown semantic read を禁じる）は PLAN-L6-91 のまま変更しない。変更するのはその契約を機械検出できる範囲であり、要件や設計契約の追加ではない"
contract_preconditions: "検出は source 本文が compatibility path の完全な文字列 literal を含み、かつ read API 名を含むことを条件にしている。したがって `readFileSync(join(root, \"docs\", AREA, NAME))` のように path を組み立てると、legacy Markdown を意味読取しながら gate を素通りできる。実測で確認済み（合成形 = ok true / literal 形 = ok false）"
contract_postconditions: "read API 呼び出しの第 1 引数を TypeScript AST 上で解決し、解決結果が compatibility path と一致（または末尾一致）する場合に fail-close する。解決は同一 file 内の const 束縛、`join` / `resolve`、template literal を対象とする。未解決の識別子は任意の 1 断片として扱い、解決できた末尾で判定する。既存の literal 一致検査は撤去せず union で残す"
contract_invariants: "canonical JSON read（`requirements-ir/manifest.json` 等）と generated view read（`docs/generated/requirements/requirement-definition.generated.md`）を violation にしない。MIGRATION_CONSUMER_ALLOWLIST の 4 file は従来どおり除外する。既存 U-RAC-001..007 の判定を変更しない。`typescript` を eager import しない（PLAN-RECOVERY-40 / #93 の lazy load 契約）"
contract_failures: "合成 path の legacy semantic read（未解決接頭辞あり／解決済み接頭辞あり）はいずれも `semantic legacy Markdown read is outside migration allowlist` で fail-close する"
tdd_red_required: true
red_at: "2026-08-12T07:19:00Z"
green_at: "2026-08-12T07:41:00Z"
mutation_oracle_evidence: "oracle は tests/requirement-authority.test.ts::U-RAC-008 に置き、実行は `npx --no-install vitest run tests/requirement-authority.test.ts`。fence が効くことを source mutation 3 件で実測し全件 killed を確認した。Q1（AST 検査の呼び出しを外し literal 一致だけへ戻す）→ killed。Q2（未解決 identifier を `[]` ではなく `null` にし、解決不能で判定を放棄させる）→ killed。Q3（末尾一致を完全一致だけへ狭める）→ **初回 survived**。原因は負例の接頭辞が未解決 identifier（`root`）だったため候補が compatibility path と完全一致してしまい、末尾一致の経路を一度も通っていなかったこと。解決済み接頭辞（`const BASE = \"/srv/helix\"`）の負例を追加して killed を確認した。なお Q4（`join`/`resolve` 以外の call を `null` ではなく `[]` で返す）は survived する。これは検出漏れではなく誤検知方向の緩和であり、現行 compatibility path が 4-5 断片あるため到達しない。独立に fence されているとは主張しない"
complexity_effect: justified_positive
complexity_justification: "検出条件が『本文に完全 path literal が現れる』から『read 呼び出しの引数として解決される path』へ変わる。AST 解決の分だけ実装は増えるが、literal を分割するだけで回避できる gate は安全 gate として成立していない"
removal_trigger: "requirement compatibility Markdown が全廃され compatibility_inputs が空になった場合"
parent_design: docs/design/helix/L6-function-design/requirement-json-authority-cutover.md
pair_artifact: docs/test-design/helix/L8-requirement-json-authority-cutover-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/requirement-json-authority-cutover.md, oracle_id: U-RAC-008, test_path: tests/requirement-authority.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — literal 一致に依存した検出の回避経路の同定" }
  - { role: se, slot_label: "SE — read 引数の AST 解決と suffix 一致" }
  - { role: qa, slot_label: "QA — 合成 path 負例と canonical/generated view の非誤検知" }
  - { role: tl, slot_label: "TL — module boundary 制約下での lazy loader 配置判断" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-54-synthesized-legacy-read-detection.md, artifact_type: markdown_doc }
  - { artifact_path: src/requirements/requirement-authority-gate.ts, artifact_type: source_module }
  - { artifact_path: tests/requirement-authority.test.ts, artifact_type: test_code }
  - { artifact_path: docs/test-design/helix/L8-requirement-json-authority-cutover-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: config }
dependencies:
  parent: docs/plans/PLAN-L6-91-requirement-json-authority-cutover.md
  requires: []
  blocks:
    - issue:300
review_evidence:
  - reviewer: "Codex / GPT-5"
    review_kind: cross_agent
    tests_green_at: "2026-08-11T22:56:07Z"
    reviewed_at: "2026-08-11T22:56:07Z"
    verdict: approve
    worker_model: claude-opus-5
    reviewer_model: gpt-5
    scope: "PR #575 HEAD 0fc50c5fbd28979ff86f8ad3b82bfeb816ba656 を clean isolated worktree で独立レビューした。readsCompatibilityPath の同一 file 内 const／join・resolve／template 解決、未解決 prefix の suffix 判定、既存 literal 検出との union、canonical JSON／generated view の非誤検知、module boundary 下の lazy TypeScript loader と明示された限界を照合した。Q4 を独立 fence と主張していない点も確認し、correctness・security・data-loss blocker 0 と判定した。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests/requirement-authority.test.ts tests/coding-rules.test.ts tests/digest.test.ts tests/typescript-lazy.test.ts --reporter=dot"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-11T22:56:07Z"
        evidence_path: tests/requirement-authority.test.ts
        output_digest: "sha256:47c156bb502f196b99ce7b3826f80f0429743c2f992380feaf794627bdaba769"
        result: "33 passed"
---

# PLAN-RECOVERY-54：合成 path による legacy semantic read の回避経路を塞ぐ

## §1 なぜ recovery か

`checkRequirementAuthority` は「allowlist 外の source が compatibility Markdown を意味読取していないか」を検査する安全 gate である。契約自体は PLAN-L6-91 のままだが、**検出が path の完全な文字列 literal に依存しており、literal を分割するだけで回避できる**。gate が守るべきものを守れていないため recovery とする。

## §2 実測した回避

同一 repository で両形を実行して確認した。

```ts
// 回避形: gate は ok = true（検出されない）
const AREA = "governance";
const NAME = "infinity-loop-requirement-definition-ledger.md";
readFileSync(join(root, "docs", AREA, NAME), "utf8");

// literal 形: gate は ok = false（検出される）
readFileSync("docs/governance/infinity-loop-requirement-definition-ledger.md", "utf8");
```

## §3 実装

`readsCompatibilityPath(filePath, text, compatibilityPaths)` を requirement-authority owner 内へ追加し、既存の literal 一致検査と **union** で判定する（既存検出を弱めない）。

1. 同一 file 内の `const <名前> = "<文字列>"` を収集する
2. read API（`readFileSync` / `readFile` / `createReadStream`）呼び出しの第 1 引数を解決する
   - 文字列 literal → そのまま
   - 識別子 → 収集した const。**未解決なら「任意の 1 断片」として空配列**にする
   - `join` / `resolve` → 各引数を解決して連結
   - template literal → cooked 部分と解決済み式を連結
   - それ以外 → `null`（この式からは path を組み立てない）
3. 解決結果を `/` で連結し、compatibility path と **完全一致または末尾一致**なら violation

### §3.1 なぜ suffix 一致か

`join(root, "docs", AREA, NAME)` の `root` は解決できない。ここで判定を放棄すると、実際に最も多い形（repoRoot を引数で受ける形）を丸ごと取り逃がす。未解決部分を「任意の接頭辞」とみなし、解決できた末尾で判定する。

### §3.2 lazy TypeScript loader を局所に持つ理由

`typescript` の実体 load は約 217ms かかるため eager import しない（PLAN-RECOVERY-40 / #93）。既存の共有 loader は `src/lint/typescript-lazy.ts` にあるが、**module boundary が `requirements -> lint` を deny** するため import できない（`coding-rules` の `ALLOWED_SOURCE_DIRECTIONS.requirements = ["requirements"]`）。

そのため本 module 内に最小の lazy accessor（`createRequire` + memo、6 行）を持つ。loader を `shared` へ移して `requirements -> shared` を許可する案は、既存 importer 9 file と policy を巻き込むため本 slice の範囲外とし、別 Issue で起票する。

## §4 検証

`U-RAC-008` で 4 分岐を押さえる。

1. 未解決接頭辞ありの合成 path（`join(root, "docs", AREA, NAME)`）→ violation
2. 解決済み接頭辞ありの合成 path（`join(BASE, "docs", AREA, NAME)`）→ violation（suffix 一致経路）
3. canonical JSON read（`join(root, "requirements-ir", "manifest.json")`）→ 非検出
4. generated view read → 非検出

**assertion は `ok === false` ではなく違反 message が当該 file を名指すことを要求する。** fixture root は無関係な refinement drift violation を常に持つため、`ok === false` だけでは本検査が効いた証拠にならない（既存 `U-RAC-006` の `ok === false` も同じ理由で load-bearing ではなく、その `toContain` 側だけが効いている）。

### §4.1 mutation

| mutant | 内容 | 結果 |
|---|---|---|
| Q1 | AST 検査の呼び出しを外し literal 一致だけへ戻す | **killed** |
| Q2 | 未解決 identifier を `null` にして判定を放棄させる | **killed** |
| Q3 | 末尾一致を完全一致だけへ狭める | 初回 **survived** → 負例追加後 **killed** |

**Q3 の初回 survive は oracle の穴だった。** 負例の接頭辞が未解決 identifier だったため候補が compatibility path と完全一致してしまい、suffix 一致の経路を一度も通っていなかった。解決済み接頭辞の負例（§4 の 2）を追加して killed を確認した。mutation を取らなければ「suffix 一致を固定済み」と誤って報告するところだった。

Q4（`join` / `resolve` 以外の call を `null` ではなく `[]` で返す）は survived する。これは検出漏れではなく**誤検知方向の緩和**であり、現行 compatibility path が 4-5 断片あるため到達しない。独立に fence されているとは主張しない。

## §5 範囲外

- **他 module から import した定数の追跡**。`NAME` が別 file の export const である場合は解決できない。TypeScript の型検査器を持ち込むコストに見合わないため、同一 file 内解決に閉じる。この限界は §3 の doc comment にも明記する
- lazy TypeScript loader の `shared` への移設（別 Issue）
- `U-RAC-007` が test design 表へ未登録である既存の欠落（本 slice で触らない）
