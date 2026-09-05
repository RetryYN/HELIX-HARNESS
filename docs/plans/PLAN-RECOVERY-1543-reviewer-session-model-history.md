---
plan_id: PLAN-RECOVERY-1543-reviewer-session-model-history
title: "PLAN-RECOVERY-1543: reviewer session × model を有効期間 registry で照合し、model 切替をまたぐ session を虚偽か衝突かの二択にしない"
kind: recovery
layer: cross
drive: agent
status: draft
completion_claim_allowed: false
backfill_state: pending
created: 2026-09-05
updated: 2026-09-05
owner: Claude / TL
github_issue_id: 1543
behavior_contract_id: REVIEWER-SESSION-MODEL-HISTORY-001
responsibility_owner: review-evidence
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: policy
complexity_effect: net_neutral
backprop_decision: not_required
backprop_decision_reason: "reviewer identity の主体（session × model）と構造化フィールド方針は不変。不変条件『同一 session は単一 model』を『宣言した有効期間の中で一貫』へ置き換えるだけで、schema・receipt・admission は変更しない。"
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - regression_dev
supersedes:
  - PLAN-L7-648-review-evidence-reviewer-identity
contract_preconditions: "reviewer_session_model_conflict は同一 reviewer_session_id の reviewer_model 文字列一致だけを見る。Codex の harness session は model 切替（gpt-5.6-sol → gpt-6-astra）をまたいで同一 id で継続し、真実を記録すると衝突・旧記録に合わせると虚偽になる。config 値や commit trailer は実効 model の attestation ではない（Codex 指摘 5549183053）。"
contract_postconditions: "docs/governance/reviewer-session-model-history.json に宣言した session は reviewed_at 時点の window と照合され、不一致・window 外は reviewer_session_model_history_mismatch、registry の runtime と reviewer_model の provider 不一致は reviewer_session_model_history_runtime_mismatch で fail-close。未登録 session は従来の衝突規則。registry の parse 失敗は違反として surface。gpt-6-astra を model registry の exact effort へ登録。"
contract_invariants: "旧記録（Sol）は書き換えない。registry は runtime 所有者の申告で attestation ではないことを basis に明記。履歴宣言は他 session の判定を緩めない。receipt / admission / SessionStart は変更しない。"
contract_failures: "未登録 session の異 model、登録 session の window 外・model 不一致、registry の schema / 時系列不整合、読込失敗の silent fallback は fail-close する。"
tdd_red_required: true
red_test: "tests/review-evidence.test.ts の U-RVIDENT-012..016 は origin/main では parse 関数不在で red。修正版へ registry 照合分岐の無効化・until 無視・重複区間検証の除去を注入すると 012/013/014 が red。 admission の例外を無効化すると U-GWIDADM-022 が red。"
red_at: "2026-09-05T06:07:20Z"
green_at: "2026-09-05T06:07:35Z"
mutation_oracle_required: true
mutation_oracle: "tests/review-evidence.test.ts（vitest）の U-RVIDENT-012/013 が履歴照合の退行と until 無視を、U-RVIDENT-014 が registry 検証の緩和を、U-RVIDENT-015 が他 session への波及を、U-RVIDENT-016 が実 repo との矛盾を、U-RVIDENT-017 が registry runtime と reviewer_model provider の食い違いを、それぞれ mutation を red にして検出する。 U-GWIDADM-022（tests/github-workflow-identity-admission.test.ts）が admission の supersession 例外の退行を検出する。"
mutation_oracle_evidence: "locator: tests/review-evidence.test.ts（vitest、U-RVIDENT-012..016）。2026-09-05T06:07:20Z M1（`if (declared)` 分岐を無効化）→ U-RVIDENT-012/013 が 2 failed。06:07:25Z M2（reviewerModelAt が until を無視）→ 012/013 が 2 failed。06:07:30Z M3（window 重複検証を外す）→ U-RVIDENT-014 が 1 failed。06:07:35Z に復元して 5 passed。tests/review-evidence.test.ts 全体 + model-registry / model-effort で 74 passed。 追加: 2026-09-05T06:40:07Z に admission + branch-kind 57 passed（GREEN）、06:40:09Z に M4（admission の metadata-only 例外を無効化）で U-GWIDADM-022 が 1 failed、同時刻に復元して 1 passed。 2026-09-05T06:49:04Z に U-RVIDENT-012..017 が 6 passed（GREEN）、06:49:09Z に M5（registry runtime と reviewer_model provider の照合を外す）で U-RVIDENT-017 が 1 failed、06:49:14Z に復元して 6 passed。"
parent_design: docs/design/helix/L6-function-design/review-evidence-reviewer-session-model-history.md
pair_artifact: docs/test-design/helix/L8-review-evidence-reviewer-session-model-history-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/review-evidence-reviewer-session-model-history.md, oracle_id: U-RVIDENT-012, test_path: tests/review-evidence.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/review-evidence-reviewer-session-model-history.md, oracle_id: U-RVIDENT-013, test_path: tests/review-evidence.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/review-evidence-reviewer-session-model-history.md, oracle_id: U-RVIDENT-014, test_path: tests/review-evidence.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/review-evidence-reviewer-session-model-history.md, oracle_id: U-RVIDENT-015, test_path: tests/review-evidence.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/review-evidence-reviewer-session-model-history.md, oracle_id: U-RVIDENT-016, test_path: tests/review-evidence.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/review-evidence-reviewer-session-model-history.md, oracle_id: U-RVIDENT-017, test_path: tests/review-evidence.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/review-evidence-reviewer-session-model-history.md, oracle_id: U-RVIDENT-018, test_path: tests/doctor-cause-digest-contract.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/review-evidence-reviewer-session-model-history.md, oracle_id: U-RVIDENT-019, test_path: tests/review-evidence.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/review-evidence-reviewer-session-model-history.md, oracle_id: U-GWIDADM-022, test_path: tests/github-workflow-identity-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/review-evidence-reviewer-session-model-history.md, oracle_id: U-GWIDADM-023, test_path: tests/github-workflow-identity-admission.test.ts }
dependencies:
  parent: docs/plans/PLAN-L7-648-review-evidence-reviewer-identity.md
  requires: []
  references:
    - "issue:1543"
    - "issue:923"
    - "issue:1548"
  blocks: []
agent_slots:
  - { role: aim, slot_label: "AIM — 旧記録を書き換えず、registry が attestation を僭称しないことを監査" }
  - { role: tl, slot_label: "TL — 有効期間契約と従来規則の責務境界を確認" }
  - { role: se, slot_label: "SE — registry parse / 照合 / doctor 配線を実装" }
  - { role: qa, slot_label: "QA — 履歴無効化・until 無視・重複区間の mutation を検証" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-1543-reviewer-session-model-history.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/review-evidence-reviewer-session-model-history.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-review-evidence-reviewer-session-model-history-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/governance/reviewer-session-model-history.json, artifact_type: json_config }
modifies:
  - { artifact_path: src/lint/review-evidence.ts, artifact_type: source_module }
  - { artifact_path: src/doctor/index.ts, artifact_type: source_module }
  - { artifact_path: src/schema/model-registry.ts, artifact_type: source_module }
  - { artifact_path: tests/review-evidence.test.ts, artifact_type: test_code }
  - { artifact_path: tests/doctor-cause-digest-contract.test.ts, artifact_type: test_code }
  - { artifact_path: src/adapters/github-workflow-identity-admission.ts, artifact_type: source_module }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: .github/workflows/harness-check.yml, artifact_type: yaml_config }
  - { artifact_path: tests/harness-check-workflow.test.ts, artifact_type: test_code }
  - { artifact_path: tests/github-workflow-identity-admission.test.ts, artifact_type: test_code }
  - { artifact_path: docs/plans/PLAN-L7-648-review-evidence-reviewer-identity.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: yaml_config }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: docs/governance/feedback-refactor-disposition.json, artifact_type: json_config }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
  - { artifact_path: config/universal-improvement-source-registry.v1.json, artifact_type: json_config }
  - { artifact_path: config/universal-improvement-source-registry.v1.integrity.json, artifact_type: json_config }
review_evidence: []
---

# PLAN-RECOVERY-1543: reviewer session × model を有効期間 registry で照合する

## 目的

Issue #1543 / PR #1550 で観測された「同一 harness session が model 切替をまたいで継続し、真実を記録すると
`reviewer_session_model_conflict`、旧記録に合わせると虚偽」という板挟みを、**tracked registry に宣言した
有効期間**で解消する。reviewer identity（PLAN-L7-648）の主体定義と構造化方針は維持し、不変条件だけを
現実に合わせて置き換える（errata として `supersedes` で双方向に束縛する）。

## 実測した欠陥

- Codex の harness session `019febe1-…` は `.helix/logs/session/` で 2026-08-10 13:37Z から同一 id で
  継続（session_start 995 回）。8 月の PLAN-L3-75 / L3-76 / L7-649 / L7-708 は `codex:gpt-5.6-sol` を記録。
- 2026-09-05 の `~/.codex/config.toml` は `model = "gpt-6-astra"`。Codex は現レビューで確認できる範囲を
  `codex` とし、config 値を attestation とは扱わない（comment 5549183053）。
- harness にも両 runtime にも実効 model を記録する attestation は存在しない（session log / harness.db に
  model 列なし）。Claude 側も commit trailer `Claude Fable 5.1` と harness 記録 `claude:claude-opus-5` が二重。
- confirmed L6 §4 は「offline lint は実効 model を判定できない」と明記しており、lint が求めるのは
  session 内一貫性である。したがって不変条件を「有効期間内で一貫」へ置き換えても検査軸は変わらない。

## 責務境界

- `src/lint/review-evidence.ts`: registry の schema / parse / 解決 / 照合。
- `src/doctor/index.ts`: registry 読込と失敗理由の surface。
- `docs/governance/reviewer-session-model-history.json`: runtime 所有者が自分の切替を申告する正本。
  他 runtime が代筆しない。本 PLAN では `019febe1-…` の Sol window（open）だけを seed し、切替後の window
  は Codex が申告時刻とともに追記する。
- `src/schema/model-registry.ts`: `gpt-6-astra` の標準 effort（medium、Codex config 由来）を登録。単価は
  未確認のため載せない。

## 非対象

- 旧記録（Sol）の書換や `superseded_by` 以外の PLAN-L7-648 変更（本文への訂正注記も branch-kind の metadata-only 契約を満たすため入れない）。
- SessionStart での申告 model 記録と、切替時の session 再発行（後続 slice。Issue #1543 に残す）。
- receipt / admission の `reviewerSessionId ↔ reviewer_session_id` exact 照合（L6 §4 の次 slice）。
- `claude-fable-5-1` の family 追加（`\bfable\b` 正規化で既に fable family に落ちるため変更不要）。

## 実装・検証

1. `parseReviewerSessionModelHistory` / `loadReviewerSessionModelHistory` / `reviewerModelAt` を追加し、
   `analyzeReviewEvidence(plans, options)` で登録 session を window 照合、未登録は従来規則。
2. doctor `review-evidence` check が registry を読み、失敗を違反として surface。
3. `U-RVIDENT-012` 〜 `016` で許容・mismatch・parse fail-close・非波及・実 repo ガードを束縛し、
   3 mutation の red を実測。
4. `github workflow-identity-admission` に「`superseded_by` だけを受け取る既存 PLAN は slice 所有者に数えない」例外を追加する（branch-kind の metadata-only 判定と同じ `isSupersessionMetadataOnly` を再利用、base を読めない場合は従来どおり fail-close。`U-GWIDADM-022`）。plan-supersession が同一 tree での双方向参照を要求する以上、successor と superseded を同じ PR で触るのは避けられないため。
5. PLAN-L7-648 の frontmatter に `superseded_by` だけを付け（recovery branch の metadata-only 移行として branch-kind-check が許容する範囲）、`doctor plan-supersession` の双方向性を満たす。訂正の経緯は本 PLAN と L6 に記載する。
5. Issue #1543 へ実測 HEAD と RED/GREEN を read-after 記録し、Codex へ window 追記を依頼する。
