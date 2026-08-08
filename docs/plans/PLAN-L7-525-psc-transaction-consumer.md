---
plan_id: PLAN-L7-525-psc-transaction-consumer
title: "PLAN-L7-525 (add-impl): semantic contract 層 — Node transaction consumer（U-PSC-003/004）"
kind: add-impl
layer: L7
drive: agent
status: confirmed
route_mode: add-feature
backfill_state: pending_reverse
entry_signals:
  - "po_directive:2026-08-06 Design HARNESS未ブロックタスクとして#230 Python意味コアとNode transaction境界を進める（slice3）"
created: 2026-08-08
updated: 2026-08-08
owner: Claude / TL
github_issue_id: 230
engineering_discipline_required: true
behavior_contract_id: U-PSC-003
responsibility_owner: semantic-contract-revalidator
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: none
contract_preconditions: "PLAN-L7-524 confirmed の revalidator（U-PSC-001/002）が入口契約を固定済みであること、L4 §2 分離原則（Node 未再検証 commit 0 / Python authoritative write 0）と L6 §3 の store 契約を正本とする。Python 意味コア骨格は L5 §0 の supply-chain freeze（HDS-HIL-14）着地後のため本スライスの前提としない（envelope の生成元に依存しない設計）"
contract_postconditions: "buildSemanticCommit が再検証済み envelope + sidecar から固定順（result→receipt→head）の決定的 bundle を返し、commitSemanticResult が単一 transaction の in-lock CAS と operations 台帳で exactly-once commit を成立させる。harness.db の semantic_result_* 4 table は store だけが writer である"
contract_invariants: "Node 実行境界が唯一の transaction writer（Python へ DB path / credential を渡さない）。bundle の digest 群は宣言値を信用せず envelope（payload / envelope_digest）と sidecar（sidecar_digest）の双方から再計算する。冪等判定 SELECT の TOCTOU window では PK 制約が最終防御となり二重 commit を許さない。after head は sha256(before_head + operation_digest) の決定的連鎖。partial write 0（append 途中の fault は rollback）。semantic_result_* は rebuild の truncate 対象外（IMMUTABLE_RECEIPT_TABLES）"
contract_failures: "digest 再計算不一致=PSC_DIGEST_MISMATCH、sidecar 束縛不一致=PSC_CONTRACT_UNBOUND、operation_id / expected head の形式不正=PSC_SCHEMA_INVALID、CAS 不一致=PSC_CAS_CONFLICT、同一 operation_id・異 digest=PSC_OPERATION_CONFLICT、BEGIN/append fault および同一 (contract_id, contract_version, source_digest) の別 envelope による unique 違反=PSC_COMMIT_FAULT で fail-close する"
tdd_red_required: true
red_at: "2026-08-08T10:39:41Z"
green_at: "2026-08-08T10:42:08Z"
mutation_oracle_evidence: "tests/semantic-commit-store.test.ts が L8テスト設計スライス3表（U-PSC-003 / U-PSC-004）を機械検査する。bundle の決定性（同一入力 2 回で deep-equal）・after head の導出式・digest 再計算による改ざん検出・sidecar 束縛検査・CAS 不一致時の head と行数の不変・同一 operation_id の冪等 replay（行が増えない）・異 digest 再利用の拒否・receipt append fault 時の partial write 0・同一 source 別 envelope の unique 拒否（head 不変）・sidecar の masked mutation 検出・BEGIN 失敗時の typed 正規化・transaction 内 rival head 更新の CAS 検出のいずれを外す mutation も red で kill する"
complexity_effect: justified_positive
complexity_justification: "#230 の第3スライス。schema 4 table と store 1 本、pure builder 1 本、oracle test 1 本のみ"
removal_trigger: "L6設計 semantic-contract-revalidator §3 がsupersedeされ、後継設計へ置換された時"
parent_design: docs/design/helix/L6-function-design/semantic-contract-revalidator.md
pair_artifact: docs/test-design/helix/L8-semantic-contract-revalidator-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/semantic-contract-revalidator.md, oracle_id: U-PSC-003, test_path: tests/semantic-commit-store.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/semantic-contract-revalidator.md, oracle_id: U-PSC-004, test_path: tests/semantic-commit-store.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — slice2 ブロック判定と slice3 先行の順序決定" }
  - { role: se, slot_label: "SE — commit bundle builder と sqlite store 実装" }
  - { role: qa, slot_label: "QA — U-PSC-003/004 mutation oracle（CAS・冪等・partial write 0）" }
  - { role: tl, slot_label: "TL — Node 単一 writer 境界と IMMUTABLE table 規律のレビュー" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-525-psc-transaction-consumer.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/semantic-contract-revalidator.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-semantic-contract-revalidator-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/schema/harness-db-tables-semantic.ts, artifact_type: source_module }
  - { artifact_path: src/semantic/semantic-commit-store.ts, artifact_type: source_module }
  - { artifact_path: tests/semantic-commit-store.test.ts, artifact_type: test_code }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: config }
dependencies:
  parent: docs/plans/PLAN-L4-53-python-semantic-core-node-boundary.md
  requires:
    - docs/plans/PLAN-L7-524-psc-semantic-contract.md
  references:
    - docs/plans/PLAN-L7-518-design-registry-store.md
review_evidence:
  - reviewer: "Claude code-reviewer subagent (intra-runtime)"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-08T11:04:09Z"
    tests_green_at: "2026-08-08T11:04:09Z"
    verdict: approve
    worker_model: claude-fable-5
    reviewer_model: claude-sonnet-5
    scope: "Codex CLIがusage limit継続中のため規定代替のintra_runtime_subagentとして2ラウンドでレビューした。1回目request changes（Important 2件をprobe実証: (1) buildSemanticCommitがsidecar_digestを再計算せず、canonicalizeSidecarDescriptor未経由で組み立てたmasked sidecar（document_digest改ざん+digest据え置き）が素通りしL6 §3の明文契約と食い違う（probe525_3で実測）、(2) (contract_id, contract_version, source_digest) unique違反時の挙動が設計・テストとも未文書化のままPSC_COMMIT_FAULTへ落ちる（probe525_2で実測）。Minor 3件: 冪等判定SELECTのTOCTOU window、injectBeginFault経路の未exercise、#177 precedentにある事前head比較の欠落）。是正としてsidecar_digest再計算検査をenvelope側と対称に追加（反例を恒久oracle化）、unique制約の意図（同一sourceから複数意味結果の並立禁止）と集約理由をL6 §3.1・L8表・PLANへ明文化して恒久oracle追加、TOCTOU windowとPK制約による最終防御を実装コメントとL6へ明記、BEGIN失敗経路のoracle追加、早期head比較を追加（authorityはlock内CAS側と明記）した。2回目approve（Critical/Important/Minor全て0）。reviewerは最重点確認として、早期CAS追加がrival head割り込みテストを吸収・無効化していないことをonBeforeHeadUpdateフックへの計装probeで直接証明した（フック発火・head step直前までのINSERT到達・rollbackによる行消滅を実測）。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --configLoader runner --project fast tests/semantic-commit-store.test.ts tests/semantic-contract-revalidator.test.ts tests/state-db.test.ts tests/projection-writer.test.ts tests/digest.test.ts tests/coding-rules.test.ts tests/module-drift.test.ts tests/l12-hybrid-recognition.test.ts tests/vmodel-pair.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-08T11:04:09Z", evidence_path: tests/semantic-commit-store.test.ts, output_digest: "sha256:dca4dbbb7ac617fef686fc7c2b58784d3ab0c64b697f46e131eeb479477a7b99", result: "review是正後worktree: 9 files / 122 tests green（U-PSC-003/004 oracle・CAS/冪等/partial write 0・unique拒否・BEGIN fault・sidecar masked mutation を含む）" }
      - { kind: lint, command: "npx biome check src tests", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-08T11:04:09Z", evidence_path: biome.json, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0（error 0、既存 warning 17）" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-08T11:04:09Z", evidence_path: tsconfig.json, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0" }
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-08T11:04:09Z"
  review_binding:
    reviewer: "Claude code-reviewer subagent (intra-runtime)"
    reviewed_at: "2026-08-08T11:04:09Z"
    evidence_digest: "sha256:954aa4e5009ceb2f1af0340606b02c38dc500ca8ce83e906f81f82225a9933cb"
  entries: []
---

# PLAN-L7-525: semantic contract 層 — Node transaction consumer の実装

## 目的（Issue #230 第3スライス）

L4 §4 の transaction consumer を TDD で実装する。slice1 の revalidator を通った envelope
だけを `harness.db` へ atomic に projection し、「Node 未再検証 commit 0」を機械化する。

## §3 工程表

### Step 1: L6 §3 契約追記と red oracle 作成 [直列]

根拠: downstream_dependency（store 契約と永続 schema の確定が実装の前提）。

### Step 2: schema 4 table + store 実装 → green [直列]

根拠: file_conflict（schema catalog / index / IMMUTABLE list への集中編集）。

### Step 3: review Step（別runtime判定。Codex usage limit中は intra_runtime_subagent = code-reviewer を規定代替とする） [直列]

根拠: downstream_dependency（前段実装の完成に依存するレビュー）。

### Step 4: confirm → db rebuild → commit → PR → CI → merge → Issue #230 evidence [直列]

根拠: shared_state（outstanding snapshot / harness.db projection の単一owner収束）。

## §3.1 実装計画

情報源: L6 §3・§3.1、#177 の store idiom（PLAN-L7-518: BEGIN IMMEDIATE + in-lock CAS +
operations 台帳 + registry-generated DDL + IMMUTABLE_RECEIPT_TABLES）。
`src/semantic` の依存許可方向は `schema` / `state-db` のみ（coding-rules 登録済み）。

## スライス順序の変更（記録）

L4 §4 の順では slice2 = Python 意味コア骨格だが、L5 §0 が Python version / interpreter
provenance / package / lock / SBOM / license の未 freeze と HDS-HIL-14 supply-chain gate を
着手条件に課しているためブロックと判断し、依存のない本スライスを先行させた（Issue #230 に記録）。

## 後続スライス（本PLAN非対象）

- sidecar / intake receipt（VDH-FR-001）、gate 配線（SA-PSC-03）
- Python 意味コア骨格（supply-chain gate 着地後）
