---
title: "doctor check registry authority単体テスト設計"
layer: L8
artifact_type: test_design
sub_doc: unit-test-design
status: confirmed
created: 2026-09-02
updated: 2026-09-02
owner: Codex / QA
plan: docs/plans/PLAN-RECOVERY-84-doctor-check-registry-authority.md
parent_design: docs/design/helix/L6-function-design/doctor-check-registry-authority.md
pair_artifact: docs/design/helix/L6-function-design/doctor-check-registry-authority.md
---

# doctor check registry authority単体テスト設計

- U-DOCCHECKREG-001: hard/advisoryを混在させ、hard failureだけが`allOk=false`とfailing IDを返す。
- U-DOCCHECKREG-002: hard登録数と評価数が一致し、旧手書きANDが`runFullDoctor`から消えている。
- U-DOCCHECKREG-003: `checkRefactorCandidateTriage`の戻り型が`ok: true`に固定される。
- U-DOCCHECKREG-004: 共有projection構築failureを注入するとwarningが出る一方、fallback後の個別check判定は維持される。
- mutation: hard entryをadvisoryへ反転するとhard count oracleがRedになる。
