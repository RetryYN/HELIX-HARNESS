---
plan_id: PLAN-L7-524-psc-semantic-contract
title: "PLAN-L7-524 (add-impl): semantic contract 層 — Node 実行境界 revalidator（U-PSC-001/002）"
kind: add-impl
layer: L7
drive: agent
status: confirmed
route_mode: add-feature
backfill_state: pending_reverse
entry_signals:
  - "po_directive:2026-08-06 Design HARNESS未ブロックタスクとして#230 Python意味コアとNode transaction境界を進める（slice1）"
created: 2026-08-08
updated: 2026-08-08
owner: Claude / TL
github_issue_id: 230
engineering_discipline_required: true
behavior_contract_id: U-PSC-001
responsibility_owner: semantic-contract-revalidator
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: none
contract_preconditions: "PLAN-L4-53 confirmed の L4 §2 分離原則（意味判定重複 0 / Node 未再検証 commit 0）と §4 slice1 を正本とする。本スライスは pure な形式再検証のみを実装し、Python 意味コア本体・transaction consumer・sidecar intake・gate 配線は後続スライスとする"
contract_postconditions: "canonicalizeSidecarDescriptor が psc-sidecar.v1 の strict schema・repo 相対 path 封じ込め（percent-encode traversal を含む segment allowlist）・canonical field 列からの sidecar_digest 再計算一致を検査し、revalidateSemanticEnvelope が psc-semantic-result.v1 の schema・payload/envelope digest 再計算一致・provenance 必須束縛・sidecar との contract 束縛 exact 一致を検査して typed result を返す"
contract_invariants: "payload を opaque JSON として扱い意味を再実装しない（意味判定重複 0）。filesystem / clock / DB を読まず write authority を持たない。canonical JSON は key 昇順で object key 挿入順に依存しない。返却値は deep-copy で caller mutation が波及しない"
contract_failures: "schema 不一致・unknown key・path 逸脱=PSC_SCHEMA_INVALID、宣言 digest と再計算値の不一致（masked mutation）=PSC_DIGEST_MISMATCH、provenance 欠落・形式不正=PSC_PROVENANCE_INVALID、sidecar との contract 束縛不一致=PSC_CONTRACT_UNBOUND を全列挙 fail-close する"
tdd_red_required: true
red_at: "2026-08-08T09:01:25Z"
green_at: "2026-08-08T09:02:26Z"
mutation_oracle_evidence: "tests/semantic-contract-revalidator.test.ts が L6テスト設計の U-PSC-001 / U-PSC-002 行を機械検査する。digest 再計算（masked mutation = field 書換 + digest 据え置きを sidecar / payload / envelope の 3 面で検出）・path 封じ込め（絶対 path / `..` / Windows path / percent-encode traversal の 10 反例と正当 path 3 件の非退行）・provenance 必須束縛・contract 束縛 exact 一致・複数違反の全列挙・key 順序非依存の決定性・payload opaque 保証（任意 JSON が意味検査なしで green）のいずれを外す mutation も red で kill する"
complexity_effect: justified_positive
complexity_justification: "#230 の第1スライス。pure 関数 2 本と digest helper 3 本、oracle test 1 本のみ"
removal_trigger: "L6設計 semantic-contract-revalidator がsupersedeされ、後継設計へ置換された時"
parent_design: docs/design/helix/L6-function-design/semantic-contract-revalidator.md
pair_artifact: docs/test-design/helix/L8-semantic-contract-revalidator-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/semantic-contract-revalidator.md, oracle_id: U-PSC-001, test_path: tests/semantic-contract-revalidator.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/semantic-contract-revalidator.md, oracle_id: U-PSC-002, test_path: tests/semantic-contract-revalidator.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — #230 slice分割（semantic contract 層を第1スライスに）" }
  - { role: se, slot_label: "SE — sidecar/envelope revalidator 実装" }
  - { role: qa, slot_label: "QA — U-PSC-001/002 mutation oracle（digest 偽装・束縛・opaque）" }
  - { role: tl, slot_label: "TL — ADR-010 意味判定重複 0 境界のレビュー" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-524-psc-semantic-contract.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/semantic-contract-revalidator.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L6-semantic-contract-revalidator-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/test-design/helix/L8-semantic-contract-revalidator-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/semantic/semantic-contract-revalidator.ts, artifact_type: source_module }
  - { artifact_path: tests/semantic-contract-revalidator.test.ts, artifact_type: test_code }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: config }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
dependencies:
  parent: docs/plans/PLAN-L4-53-python-semantic-core-node-boundary.md
  requires:
    - docs/plans/PLAN-L4-53-python-semantic-core-node-boundary.md
    - docs/plans/PLAN-L5-96-python-worker-adr010-rebaseline.md
review_evidence:
  - reviewer: "Claude code-reviewer subagent (intra-runtime)"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-08T09:18:59Z"
    tests_green_at: "2026-08-08T09:18:59Z"
    verdict: approve
    worker_model: claude-fable-5
    reviewer_model: claude-sonnet-5
    scope: "Codex CLIがusage limit継続中のため規定代替のintra_runtime_subagentとして、Claude code-reviewer（claude-sonnet-5, read-only）が2ラウンドでレビューした。1回目request changes（Important 2件をprobe/コマンド実測: (1) tests側の`escape`変数がglobal escape()をshadowしBiome noShadowRestrictedNamesでlint error（worker側の「biome green」claimが実測と食い違うclaim discipline違反）、(2) isContainedRelativePathがpercent-encode traversal（%2e%2e / ..%2f / ..%5c）を素通りさせ、probe524_1で4件全てがok:trueになることを実測。encode-then-decodeバイパスに対しpath封じ込めcontractが字義的に未達）。是正として変数をtraversal/rejectedへリネームし`npx biome check src tests`（package.json lintと同一）をexit code付きで0実測、isContainedRelativePathをsegment allowlist（^[A-Za-z0-9._-]+$、絶対path/Windows path/バックスラッシュ/空segment/`.`/`..`拒否、%を含む表現はdecode前に拒否）へ強化し、round1反例4件にWindows pathと多重encode %252e%252eを加えた10反例と正当path 3件の非退行を恒久oracle化、L6設計/L6・L8テスト設計/PLANのcontract claimへallowlist方針を明文化した。2回目approve（Critical/Important 0、Minor 1件=重複コメント、同round削除）。reviewerはprobe524_r2で攻撃6パターンの全件拒否・正当path 3件のgreen・envelope_digest二重検出/opaque保証/canonical JSON決定性の非退行を独立再実行で確認し、実repo docs配下に`%`・非ASCII・空白を含む正当pathが0件であること（allowlistの過剰検出なし）も機械走査で確認した。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --configLoader runner --project fast tests/semantic-contract-revalidator.test.ts tests/digest.test.ts tests/vmodel-pair.test.ts tests/design-coverage.test.ts tests/design-language.test.ts tests/l12-hybrid-recognition.test.ts tests/l12-canonical-authority.test.ts tests/ddd-tdd-rules.test.ts tests/coding-rules.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-08T09:18:59Z", evidence_path: tests/semantic-contract-revalidator.test.ts, output_digest: "sha256:75a99dfca12cafacb97a1f7ff148749ad90ee1f156a74b0cc52b820079dc9816", result: "review是正後worktree: 9 files / 147 tests green（U-PSC-001/002 oracle・traversal 10反例・正当path 3件・digest/vmodel/L12 gate 群を含む）" }
      - { kind: lint, command: "npx biome check src tests", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-08T09:18:59Z", evidence_path: biome.json, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0（error 0、既存 warning 17）" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-08T09:18:59Z", evidence_path: tsconfig.json, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0" }
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-08T09:18:59Z"
  review_binding:
    reviewer: "Claude code-reviewer subagent (intra-runtime)"
    reviewed_at: "2026-08-08T09:18:59Z"
    evidence_digest: "sha256:dfe42588b73a285b8333d09034149692c994e29640cff9fdfd68ccd426264d40"
  entries: []
---

# PLAN-L7-524: semantic contract 層（Node 実行境界 revalidator）の実装

## 目的（Issue #230 第1スライス）

L4 §4 slice1 を TDD で実装する。Python 意味コアの semantic result envelope と
hybrid document sidecar descriptor を Node 実行境界側で**形式再検証**する pure 関数群を置き、
後続の transaction consumer が「未再検証 commit 0」を満たすための前提を作る。

## §3 工程表

### Step 1: L6 設計 + pair テスト設計の起草と red oracle 作成 [直列]

根拠: downstream_dependency（schema と検証規則の確定が実装の前提）。

### Step 2: revalidator 実装 → green [直列]

根拠: file_conflict（新規 module `src/semantic/semantic-contract-revalidator.ts` への集中編集）。

### Step 3: review Step（別runtime判定。Codex usage limit中は intra_runtime_subagent = code-reviewer を規定代替とする） [直列]

根拠: downstream_dependency（前段実装の完成に依存するレビュー）。

### Step 4: confirm → db rebuild → commit → PR → CI → merge → Issue #230 evidence [直列]

根拠: shared_state（outstanding snapshot / harness.db projection の単一owner収束）。

## §3.1 実装計画

情報源: L4 §2 分離原則・§4 slice1、L6 設計 §0-§2。digest は宣言値を信用せず canonical
field 列から再計算して一致を要求する（#177/#209 の masked-mutation 教訓）。canonical JSON は
key 昇順で object key 挿入順に依存させない（slice2 で顕在化した決定性教訓）。

## 後続スライス（本PLAN非対象）

- Python 意味コア骨格（envelope の生成側、versioned contract 配下）
- Node transaction consumer（`harness.db` projection と atomic promotion）
- sidecar / intake receipt（VDH-FR-001）、gate 配線（SA-PSC-03）
