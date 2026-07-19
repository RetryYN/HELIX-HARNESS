---
plan_id: PLAN-L6-65-plan-specific-vpair-binding
title: "PLAN-L6-65 (add-design): PLAN固有Vペア4点結合 — L6設計・L8 oracle・生成testを同一traceへ拘束する"
kind: add-design
layer: L6
drive: agent
status: confirmed
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-11 /goal『設計とテスト設計/検証設計でVペアを作る。抜け漏れ絶対許さない』の再監査で、plan-descent greenでもPLAN-L7-419に固有L8 oracleが存在しない検出穴を確認"
created: 2026-07-11
updated: 2026-07-12
backprop_decision: not_required
backprop_decision_reason: "FR-L1-03のV字双方向traceを既存plan-descent gateへ追加降下する。新規product要求ではなく、path存在だけでVペアを名乗れる検出穴の是正。"
owner: Codex
parent_design: docs/design/harness/L6-function-design/plan-descent-specific-parent-binding.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
related_l0: docs/governance/helix-harness-concept_v3.1.md
agent_slots:
  - role: se
    slot_label: "SE — 4点binding schema・pure analyzer・fingerprint ratchet設計"
  - role: tl
    slot_label: "TL — 共有L8許容条件・grandfather境界・誤検知レビュー"
generates:
  - artifact_path: docs/plans/PLAN-L6-65-plan-specific-vpair-binding.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L6-function-design/plan-descent-specific-parent-binding.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L6-function-design/skill-pack-uplift.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L8-unit-test-design.md
    artifact_type: test_design
  - artifact_path: docs/design/design-catalog.yaml
    artifact_type: design_doc
dependencies:
  parent: docs/plans/PLAN-L6-60-specific-parent-design-binding.md
  requires:
    - docs/plans/PLAN-L6-60-specific-parent-design-binding.md
    - docs/plans/PLAN-L7-347-plan-descent-gate-impl.md
  references:
    - docs/plans/PLAN-L7-419-skill-mythos-uplift.md
review_evidence:
  - reviewer: codex-vpair-gate-design
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-11T23:16:38+09:00"
    tests_green_at: "2026-07-11T23:16:38+09:00"
    verdict: approve
    worker_model: codex-gpt-5
    reviewer_model: codex-gpt-5-subagent
    scope: "PLAN固有4点binding、immutable initial authority + resolved hash-chain tombstone、eligible L8 table、TypeScript AST case title、canonical path/symlink、ownership、PLAN-L7-419固有L6/U-SKUP補修経路を3 round独立レビューし、blocker/Important 0を確認。"
    green_commands:
      - kind: lint
        command: "npx --no-install tsx src/cli.ts plan lint docs/plans/PLAN-L6-65-plan-specific-vpair-binding.md && npx --no-install vitest run tests/design-coverage.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-11T23:16:38+09:00"
        evidence_path: docs/design/harness/L6-function-design/plan-descent-specific-parent-binding.md
        output_digest: "sha256:e03ab9a83dc1359058e13bddd06a7834212b4d733e27ea84198e853708d27310"
  - reviewer: codex-vpair-resolution-proof-reviewers
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-11T17:30:02Z"
    tests_green_at: "2026-07-11T17:29:31Z"
    verdict: approve_after_fixes
    worker_model: gpt-5
    reviewer_model: gpt-5.6
    scope: "authority v3 resolution proof設計を3系統で敵対レビュー。completed typed resolution PLAN、target/resolution両Vペア、full frontmatter schema、canonical review/green command、valid instant順序、semantic hash chain、non-zero loader統合、U-PSPB-025..027を確認しblocker/high 0。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests/plan-descent-specific-parent-binding.test.ts tests/frontmatter.test.ts tests/review-evidence.test.ts tests/coding-rules.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-11T17:29:31Z"
        evidence_path: tests/plan-descent-specific-parent-binding.test.ts
        output_digest: "sha256:79d2228999080bd9ca5f450bda6afade5a320b5cdef7580a307eb37449a20cff"
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-11T17:29:31Z"
        evidence_path: src/lint/plan-specific-vpair-binding.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: lint
        command: "npm run lint"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-11T17:29:31Z"
        evidence_path: src/lint/plan-specific-vpair-binding.ts
        output_digest: "sha256:6e3acf5b9d043bd54add82ba11e8403b5eb20e29061d53d859dc1cb4ea6ea01c"
      - kind: lint
        command: "npx --no-install tsx src/cli.ts plan lint --gate governance"
        runner: node
        scope: gate
        exit_code: 0
        completed_at: "2026-07-11T17:29:31Z"
        evidence_path: docs/plans/PLAN-L6-65-plan-specific-vpair-binding.md
        output_digest: "sha256:99d676c690d1aa9b18328d9ac11fc5ee8040b9f8ecf0368f0af886e88bfc9ee5"
---

# PLAN-L6-65: PLAN固有Vペア4点結合

## 0. 発見した欠陥

現行 `plan-descent` は、L7実装PLANに実在するL6 `parent_design`、共有L8
`pair_artifact`、`generates[].artifact_type=test_code` があればgreenになる。しかし、L8内のどのoracleを
どの生成testが検証するかは結合しない。このため `PLAN-L7-419` はL8にPLAN IDも固有oracleも無いまま
confirmedになっており、Vペアがpath存在証明へ退化している。

## 1. 設計delta

- L7 `impl/add-impl` はfrontmatter `verification_bindings[]` に
  `parent_design` / `oracle_id` / `test_path` を宣言する。`plan_id` と合わせた4点tupleをtrace正本とする。
- bindingのparentはtop-level `parent_design`と完全一致し、oracleはtop-level `pair_artifact` のL8表で
  exact 1回宣言され、同じrowがexact `test_path` をcitationする。
- testは実在するrepo-relative `tests/**` regular fileで、PLANの`generates`に`test_code`として存在する。
  PLAN IDはfile内exact token、oracle IDは実行可能な`it/test` case titleでexactに持つ。
- 共有L8自体は許容するが、family要約・range・別PLANのtest citationはbinding根拠にしない。
- grandfatherはPLAN ID単位ではなく `{plan_id, reason, detail}` fingerprint単位とし、同じPLANへの
  新reasonを免除しない。immutable initial authorityとresolved tombstoneを分離し、解消済みfindingの再追加をfail-closeする。
- tombstoneの解消証拠はcompleted resolution PLANのtyped対象metadata、authority/対象PLAN生成宣言、
  distinct-model green review、PLAN意味digestへ結合し、無関係PLAN流用と事後改変をfail-closeする。

## 2. 検出と移行

導入時点の既存PLANはexact finding baselineでratchetする。ただし代表反例 `PLAN-L7-419` と本gate自身は
同じsliceで固有oracle/bindingを補修し、永久免除しない。新規PLANはdraft起票時からbinding必須とする。
oracle expression parserのsuffix/range/shorthand完全展開は別deltaとし、本gateのbinding値はexact単一IDだけを許す。

## 3. 受入条件

- L6設計正本の§5とL8 `U-PSPB-006..027` が1:1で対応する。
- 後続 `PLAN-L7-422-plan-specific-vpair-binding` は本PLAN confirmed後だけ起票する。
- pure analyzer、loader、plan lint、doctor hard gate、real-repo regressionをtest_codeで固定する。
- 本PLANでskill uplift固有L6契約とL8 `U-SKUP-001..011`を先にconfirmed化し、後続L7で
  `PLAN-L7-419` のparent/test citation/verification bindingだけを補修する。

## 4. スケジュール

- step 1 (serial): L6 contractとL8 oracleをレビューしconfirmed化する。
- step 2 (serial): L7実装PLANを起票し、red testからgateを実装する。
- step 3 (parallel): PLAN-L7-419補修とindependent reviewを行う。
