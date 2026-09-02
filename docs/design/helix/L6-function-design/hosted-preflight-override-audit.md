---
title: "hosted preflight override監査関数設計"
layer: L6
artifact_type: design_doc
status: confirmed
created: 2026-09-02
updated: 2026-09-02
owner: Codex / TL
plan: docs/plans/PLAN-RECOVERY-82-hosted-preflight-override-audit.md
pair_artifact: docs/test-design/helix/L8-hosted-preflight-override-audit-unit-test-design.md
behavior_contract_id: HOSTED-PREFLIGHT-OVERRIDE-AUDIT-001
responsibility_owner: hosted-preflight
---

# hosted preflight override監査関数設計

## 責務

hosted/API editの例外許可を`guard_override_transactions`へ束縛し、CLI自己申告booleanをauthorityにしない。

## 契約

- `--allow-foreign-edit`はboundedな`--reason`を必須とする。
- target集合、session、reasonからstable nonceとsubject digestを導出する。
- `commitOverrideUse`がDBへcommitした場合だけwork guardをbypassする。
- 同一nonceの再利用、DB障害、理由不正はfail-closeする。
- hook非強制は明示option、git status evidenceは実コマンド結果から導出する。

## 非対象

work-guard衝突判定とdirect hookの挙動は変更しない。
