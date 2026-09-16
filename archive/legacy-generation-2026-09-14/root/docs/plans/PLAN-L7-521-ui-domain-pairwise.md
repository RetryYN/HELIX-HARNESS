---
plan_id: PLAN-L7-521-ui-domain-pairwise
title: "PLAN-L7-521 (add-impl): UI Domain risk-based pairwise selector（U-UDP-005）"
kind: add-impl
layer: L7
drive: agent
status: confirmed
route_mode: add-feature
backfill_state: pending_reverse
entry_signals:
  - "po_directive:2026-08-06 Design HARNESS未ブロックタスクとして#209 UI domain・Pattern Profileを進める（slice2）"
created: 2026-08-08
updated: 2026-08-08
owner: Claude / TL
github_issue_id: 209
engineering_discipline_required: true
behavior_contract_id: U-UDP-005
responsibility_owner: ui-domain-pattern-profile
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: none
contract_preconditions: "L6設計 §1-§2 の selectPairwiseFixtures 契約と L5 §3 の seeded-pairwise 展開規則（HR-FR-DHR-004）を正本とする。本スライスは pure selector のみを実装し、registry consumer 接続・CLI 表面・L9 system assertion は後続スライスとする"
contract_postconditions: "selectPairwiseFixtures が 8 軸の全 2 軸ペア被覆 100%（selector 内の独立検算 post-check で保証）・high risk entry 全件包含（部分指定 entry は指定軸を固定 seed に決定的生成、残余軸は greedy pairwise 補完で Cartesian 展開なし）・決定的順序（同一入力 → 同一 selection_digest）を同時に満たす fixture 列を返す"
contract_invariants: "fixture 数は全 Cartesian より大幅に小さい有限列。fixture_id は一意。乱数・時刻に依存しない（軸順・level 順・宣言順の決定的 tie-break）"
contract_failures: "mode 逸脱（全積要求）=UDP_CARTESIAN_EXPLOSION、被覆検算欠落=UDP_PAIRWISE_UNCOVERED、high risk 包含検算欠落=UDP_RISK_UNCOVERED、schema 不一致・空軸・未知 level 参照=UDP_STALE_INPUT を typed failure で fail-close する"
tdd_red_required: true
red_at: "2026-08-08T03:07:12Z"
green_at: "2026-08-08T03:07:52Z"
mutation_oracle_evidence: "tests/ui-domain-pairwise.test.ts が L8テスト設計スライス2表の反例を機械検査する。被覆はテスト側の全ペア独立検算で二重確認しており、被覆ロジック・seed 包含・決定性（同一入力 2 回 + object key 順序を入れ替えた意味的同一入力の selection_digest 一致）のいずれかを外す mutation は red で kill する。selector 内 post-check（UDP_PAIRWISE_UNCOVERED / UDP_RISK_UNCOVERED）は現行実装では到達不能な defense-in-depth であり、mutation kill の根拠にはテスト側独立検算を用いる（review round1 probe3 で到達不能性を実測確認）"
complexity_effect: justified_positive
complexity_justification: "#209 の第2スライス。selector 関数群の追記と oracle test 1本のみ"
removal_trigger: "L6設計 ui-domain-pattern-profile がsupersedeされ、後継設計へ置換された時"
parent_design: docs/design/helix/L6-function-design/ui-domain-pattern-profile.md
pair_artifact: docs/test-design/helix/L8-ui-domain-pattern-profile-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/ui-domain-pattern-profile.md, oracle_id: U-UDP-005, test_path: tests/ui-domain-pairwise.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — #209 slice分割（pairwise selectorを第2スライスに）" }
  - { role: se, slot_label: "SE — seeded-pairwise selector 実装" }
  - { role: qa, slot_label: "QA — U-UDP-005 mutation oracle（全ペア独立検算）" }
  - { role: tl, slot_label: "TL — 決定性と fail-close post-check 境界" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-521-ui-domain-pairwise.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/ui-domain-pattern-profile.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-ui-domain-pattern-profile-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/design/ui-domain-pattern-profile.ts, artifact_type: source_module }
  - { artifact_path: tests/ui-domain-pairwise.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L1-07-infinity-loop-platform-requirements.md
  requires:
    - docs/design/helix/L5-detail/ui-domain-pattern-profile.md
    - docs/plans/PLAN-L7-520-ui-domain-core.md
review_evidence:
  - reviewer: "Claude code-reviewer subagent (intra-runtime)"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-08T03:23:51Z"
    tests_green_at: "2026-08-08T03:23:51Z"
    verdict: approve
    worker_model: claude-fable-5
    reviewer_model: claude-sonnet-5
    scope: "Codex CLIがusage limit継続中のため規定代替のintra_runtime_subagentとして、Claude code-reviewer（claude-sonnet-5, read-only）が2ラウンドでレビューした。1回目request changes（Important 2件をprobe実証: (1) completeFixtureがcallerのobject key挿入順をlevelsへ引き継ぎ、意味的同一・キー順違い入力でselection_digestが不一致（probe1で実測）、(2) selector内post-check（UDP_PAIRWISE_UNCOVERED/UDP_RISK_UNCOVERED）が構造的に到達不能でPLANのmutation claimと不整合（probe3でpost-check無効化しても出力完全一致を実測）。Minor 4件: unsafe cast、high risk完全重複entryの非dedup、collectUncoveredPairsの全件再走査コスト、軸キー欠落テスト未検査）。是正としてcompleteFixtureをUDP_AXES固定順構築+runtime assertionへ変更、probe1反例を恒久oracle（キー順入替入力→digest一致）としてテストへ格上げ、mutation_oracle_evidenceからpost-check kill主張を撤回しdefense-in-depthと明記、high risk完全重複のdedup（digest不変+high_risk_included検証付き）、軸キー欠落のfail-closeテストを追加した。再走査コストは現規模許容（実測fixture 14-17件）としてPLAN外の将来留意点に記録。2回目approve（Critical/Important 0）。reviewerはprobe1bで round1反例（axes逆順+risk levelsキー順入替）のdigest一致への転化を直接再検証した。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --configLoader runner --project fast tests/ui-domain-pairwise.test.ts tests/ui-domain-canonicalize.test.ts tests/ui-domain-contract.test.ts tests/ui-domain-rulepack.test.ts tests/ui-domain-profile.test.ts tests/digest.test.ts tests/vmodel-pair.test.ts tests/plan-specific-vpair-binding.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-08T03:23:51Z", evidence_path: tests/ui-domain-pairwise.test.ts, output_digest: "sha256:987e506a1a0ba21caa366d7b42f4b5f31538af3b2b7534dedf1f37b82f22979f", result: "review是正後worktree: 8 files / 67 tests green（U-UDP-005 oracle・恒久キー順反例・vmodel-pair 群を含む）" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-08T03:23:51Z", evidence_path: tsconfig.json, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0" }
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-08T03:23:51Z"
  review_binding:
    reviewer: "Claude code-reviewer subagent (intra-runtime)"
    reviewed_at: "2026-08-08T03:23:51Z"
    evidence_digest: "sha256:4212edd45418a85fec729cb93ed370edd7f81f65dba11b7367466ed96a31f6b5"
  entries: []
---

# PLAN-L7-521: UI Domain risk-based pairwise selector の実装

## 目的（Issue #209 第2スライス）

L5 §3 / L6 §1 の `selectPairwiseFixtures`（HR-FR-DHR-004）を TDD で実装する。
high risk entry を seed に固定 → 残余軸を決定的 greedy で補完 → 未被覆ペアを greedy 消化 →
被覆と包含を selector 内 post-check で独立検算する構成。

## §3 工程表

### Step 1: L5 §3 / L6 契約突き合わせとred oracle作成 [直列]

根拠: downstream_dependency（展開規則と被覆定義の確定が実装の前提）。

### Step 2: seeded-pairwise selector 実装 → green [直列]

根拠: file_conflict（同一module `src/design/ui-domain-pattern-profile.ts` への集中編集）。

### Step 3: review Step（別runtime判定。Codex usage limit中は intra_runtime_subagent = code-reviewer を規定代替とする） [直列]

根拠: downstream_dependency（前段実装の完成に依存するレビュー）。

### Step 4: confirm → db rebuild → commit → PR → CI → merge → Issue #209 evidence [直列]

根拠: shared_state（outstanding snapshot / harness.db projection の単一owner収束）。

## §3.1 実装計画

情報源: L5 §3（seeded-pairwise 展開規則）、L6 §1-§2、L8 スライス2表。greedy の tie-break は
軸順（UDP_AXES 固定順）・level 順（axes 宣言順）・risk entry 宣言順で決定化し、乱数・時刻を
使わない。テスト側で全 2 軸ペアの被覆を selector と独立に検算する（機械的二重確認）。

## 後続スライス（本PLAN非対象）

- registry consumer 接続（#177 経路への consumer trace）と CLI 表面
- L9 system assertion（SA-UDP-01〜03、実 L2 正本 end-to-end）
