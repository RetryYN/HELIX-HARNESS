---
plan_id: PLAN-L7-530-design-registry-public-command
title: "PLAN-L7-530 (add-impl): Design Registry の public command 例外判断（U-DRG-013）"
kind: add-impl
layer: L7
drive: agent
status: confirmed
route_mode: add-feature
backfill_state: pending_reverse
entry_signals:
  - "po_directive:2026-08-06 Design HARNESS未ブロックタスクとして#177 Design Registryを進める（slice7 = slice4 の申し送り第3項）"
created: 2026-08-09
updated: 2026-08-09
owner: Claude / TL
github_issue_id: 177
engineering_discipline_required: true
behavior_contract_id: U-DRG-013
responsibility_owner: design-registry
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: none
contract_preconditions: "slice1〜6 が着地済みであること。HR-FR-DHR-003 の直列 chain（interaction→permission→command→api）が DRG_UNGUARDED_INVOKE で強制されており、permission gate を持たない公開 command が現状は一律に違反となる"
contract_postconditions: "RegistryPolicyV1 に public_commands（entity_id / rationale / authority_ref）を追加し、validateRegistryGraph が policy を受け取る。明示宣言した command への interaction からの invokes 直結だけが許可され、既定 policy（宣言 0 件）では従来どおり fail-close する"
contract_invariants: "例外は entity_id の明示宣言に限る（permission edge の不在から public を推論しない。推論すると permission の張り忘れと public 設計が区別できなくなり gate が意味を失う）。例外が許すのは permission の省略だけであり、chain の段飛ばし（interaction→api、permission→api）・api→command の逆流・interaction 以外からの到達・invokes 以外の relation は許さない。allowlist は graph 実態と照合し、効かない例外が黙って残る状態を作らない。既定 policy は空であり後方互換（既存 caller の挙動は不変）"
contract_failures: "宣言 entity がグラフに無い / service[command] でない / rationale・authority_ref が空=DRG_STALE_INPUT、同一 entity の重複宣言=DRG_DUPLICATE_ID、policy schema_version 逸脱=DRG_ID_INVALID、例外の対象外経路=従来どおり DRG_UNGUARDED_INVOKE / DRG_RELATION_INVALID"
tdd_red_required: true
red_at: "2026-08-08T16:22:32Z"
green_at: "2026-08-08T16:23:16Z"
mutation_oracle_evidence: "tests/design-registry-public-command.test.ts が L8テスト設計スライス7表の反例を機械検査する。relation 判定・from.kind 判定・allowlist 参照・role 検査・根拠必須・重複検出の各 mutation は exit 非 0 で kill を実測済み。**stale 検出（node === undefined）だけは単独では独立に load-bearing でない**: 単独無効化では role 検査が同じ DRG_STALE_INPUT を返すため oracle は生存し、stale 検出と role 検査を同時に外す複合 mutation で初めて kill する（意図した多重防御であり欠陥ではない。素朴な無効化が TypeError で落ちるのを kill と数えないための区別。review round2 で reviewer が指摘）。初回の mutation 追試で from.kind / relation / allowlist 以外の clause が kill されず、原因が『テストが逆流経路（api→command）や別 relation 到達を持たないこと』であると特定できたため、真に冗長な clause（to.kind / to.service_role。allowlist 構築時に検証済み）は削除し、load-bearing な経路には反例を追加した"
complexity_effect: justified_positive
complexity_justification: "#177 の第7スライス。policy 型に 1 フィールド、validator に検査関数 1 本と分岐 1 つを足すのみ。既定値が空のため既存 caller の挙動は不変で、後方互換の optional 引数として導入する"
removal_trigger: "permission モデルが後継設計（capability ベース等）へ置換された時"
parent_design: docs/design/helix/L6-function-design/design-registry.md
pair_artifact: docs/test-design/helix/L8-design-registry-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/design-registry.md, oracle_id: U-DRG-013, test_path: tests/design-registry-public-command.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — #177 slice分割（public command 例外を第7スライスに）" }
  - { role: se, slot_label: "SE — RegistryPolicyV1 拡張と validator への配線" }
  - { role: qa, slot_label: "QA — U-DRG-013 oracle" }
  - { role: tl, slot_label: "TL — 例外の適用範囲（permission 省略だけを許す境界）の妥当性" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-530-design-registry-public-command.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L5-detail/design-registry.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L6-function-design/design-registry.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-design-registry-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/design/design-registry.ts, artifact_type: source_module }
  - { artifact_path: tests/design-registry-public-command.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L1-07-infinity-loop-platform-requirements.md
  requires:
    - docs/plans/PLAN-L7-529-design-registry-screen-intake.md
review_evidence:
  - reviewer: "Claude code-reviewer subagent (intra-runtime)"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-09T01:45:00Z"
    tests_green_at: "2026-08-09T01:45:00Z"
    verdict: approve
    worker_model: claude-fable-5
    reviewer_model: claude-sonnet-5
    scope: "Codex CLIがusage limit継続中のため規定代替のintra_runtime_subagentとして、Claude code-reviewer（claude-sonnet-5, read-only）が2ラウンドでレビューした。1回目request changes（Critical 0・Important 2・Minor 2）。Important-1=L8テスト設計末尾の段落重複（旧文を残したまま新文を挿入した編集残骸。CLAUDE.md実装規則のdevelopment residue禁止に抵触）。Important-2=REGISTRY_POLICY_V1が実行時freezeされておらず、全default callerが共有する単一fail-close既定値がpushで穴あきになりうる。Minor 2件=逆流経路のassertionがcodes.length>0のみで別codeへの化けを検知できない、「public宣言とpermission chainの共存を矛盾としない」非強制判断に回帰testが無い。是正: 重複段落削除、Object.freeze（isFrozen両true・pushがCannot add property 0で拒否をprobe実証）、期待codeの明示固定（DRG_UNGUARDED_INVOKE / DRG_RELATION_INVALID / DRG_UNGUARDED_INVOKE）、共存graphをgreenとして固定するcase追加。2回目approve（Critical/Important/Minor全て0）。**claim訂正**: reviewerはround2でstale検出（node === undefined）の単独無効化ではrole検査が同じDRG_STALE_INPUTを返すためoracleが生存することを実証した。実装側の素朴な無効化はTypeErrorで落ちるためkillに見えるが独立にload-bearingではない。意図した多重防御であり欠陥ではないため、PLANとL8のmutation claimを『7件すべて独立kill』から『6件は独立kill、stale検出はrole検査との複合mutationでkill』へ訂正した。reviewerが独立実証したのはrelation / from.kind / allowlist / role / stale（複合）の5件であり、根拠必須・重複検出の2件はreviewer側では未実証（実装側では実測済み）として区別のまま据え置く。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --configLoader runner --project fast tests/design-registry-public-command.test.ts tests/design-registry-graph.test.ts tests/design-registry-canonicalize.test.ts tests/design-registry-closure.test.ts tests/design-registry-trace.test.ts tests/design-registry-parents.test.ts tests/design-registry-screen-intake.test.ts tests/design-registry-authority-transition.test.ts tests/design-registry-cli.test.ts tests/digest.test.ts tests/coding-rules.test.ts tests/design-language.test.ts tests/vmodel-pair.test.ts tests/design-coverage.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-09T01:45:00Z", evidence_path: tests/design-registry-public-command.test.ts, output_digest: "sha256:3625c5f6a8710d2186340cfae9533b9148abd43ea0c570f8cb6273e3825cc7e5", result: "review是正後worktree: 14 files / 115 tests green（U-DRG-013 と registry 既存 8 suite・digest inventory・coding-rules・design-language・vmodel-pair を含む）" }
      - { kind: lint, command: "npx biome check src tests", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-09T01:45:00Z", evidence_path: biome.json, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0（error 0、既存 warning 17・純増 0）" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-09T01:45:00Z", evidence_path: tsconfig.json, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0" }
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-09T01:45:00Z"
  review_binding:
    reviewer: "Claude code-reviewer subagent (intra-runtime)"
    reviewed_at: "2026-08-09T01:45:00Z"
    evidence_digest: "sha256:c73865aa7f0481754c8e1c210e2d9bf86ecae32d2500061386fa696c516e003d"
  entries: []
---

# PLAN-L7-530: Design Registry の public command 例外判断

## 目的（Issue #177 第7スライス）

HR-FR-DHR-003 の直列 chain 強制により、`interaction → service[command]` の直結は一律
`DRG_UNGUARDED_INVOKE` となる。しかし permission gate を持たない公開 command は正当に存在しうる。
slice4 の申し送り第3項「public command（permission 不要）の RegistryPolicyV1 例外判断」の着地。

## 設計判断（レビュー対象）

- **推論しない**: 「permission edge が無いから public」と推論すると、permission の張り忘れ
  （本来の違反）と public 設計が区別できなくなり gate が意味を失う。例外は entity_id の
  明示宣言に限る。
- **根拠必須**: rationale と authority_ref を必須にし、無根拠な bypass を残さない。
- **既定 fail-close**: `public_commands` の既定は空。宣言しない限り挙動は従来どおりで、
  `validateRegistryGraph` の policy 引数は optional（既存 caller は無改変）。
- **許すのは permission の省略だけ**: chain の段飛ばし（interaction→api、permission→api）、
  api→command の逆流、interaction 以外からの到達、invokes 以外の relation は許さない。
- **allowlist の腐り検出**: 宣言先が実在しない / service[command] でない / 重複している場合は
  fail-close する。効かない例外が黙って残る状態を作らない。
- **非強制（意図的）**: 同一 command が public 宣言と permission chain の双方から到達可能でも
  矛盾としない。interaction ごとに公開/保護が分かれる設計は正当でありうる。

## §3 工程表

### Step 1: 例外の適用範囲確定と red oracle 作成 [直列]

根拠: downstream_dependency（許す範囲の確定が実装の前提）。

### Step 2: policy 拡張 + validator 配線 → green [直列]

根拠: downstream_dependency（契約確定後の実装）。

### Step 3: review Step（別runtime判定。Codex usage limit中は intra_runtime_subagent = code-reviewer を規定代替とする） [直列]

根拠: downstream_dependency（前段実装の完成に依存するレビュー）。

### Step 4: confirm → db rebuild → commit → PR → CI → merge → Issue #177 evidence [直列]

根拠: shared_state（outstanding snapshot / harness.db projection の単一owner収束）。

## §3.1 実装計画

情報源: `src/design/design-registry.ts` の `ADJACENCY` / `isServiceChainBreak`（chain 強制の正本）。
例外分岐は adjacency 判定の直後・`isServiceChainBreak` の直前に置き、adjacency で既に許される
経路には影響を与えない。

## 後続スライス（本PLAN非対象）

- `screen_trace` 未登録 requirement family（BR / FR-L1 / UX）の registry ID 空間への写像方針
  （要求側 authority の判断）
