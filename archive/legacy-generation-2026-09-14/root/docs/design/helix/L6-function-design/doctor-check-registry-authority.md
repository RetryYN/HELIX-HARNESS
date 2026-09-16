---
title: "doctor check registry authority復旧設計"
layer: L6
artifact_type: design
status: confirmed
created: 2026-09-02
updated: 2026-09-02
owner: Codex / TL
plan: docs/plans/PLAN-RECOVERY-84-doctor-check-registry-authority.md
pair_artifact: docs/test-design/helix/L8-doctor-check-registry-authority-unit-test-design.md
github_issue_id: 1392
behavior_contract_id: DOCTOR-CHECK-REGISTRY-AUTHORITY-001
responsibility_owner: doctor-runtime
---

# doctor check registry authority復旧設計

## 責務境界

`src/doctor/check-registry.ts`は内部check resultを`id`、`severity`、`result`へ束縛する。`hard`だけがfull doctorの`ok`へ参加し、`advisory`はmessageだけを提供する。集計結果は登録hard数と評価hard数を返し、不一致を成功へ丸めない。

`runFullDoctor`は個別checkを従来順で評価し、そのresultをregistryへexactly once登録する。message順は既存配列を維持する。旧手書きANDは第二authorityなので撤去する。

共有projection DBは性能最適化であり、失敗時は既存の個別rebuildへfallbackする。ただしfallback reasonを`shared-projection-db - warning`として出力し、無言の縮退を禁止する。

## 不変条件

- 個別checkの判定基準とmessage順を変えない。
- hard entryの登録数とok集計参加数は一致する。
- advisory resultをfull doctor failureへ昇格させない。
- profile registry、timing、consumer setup-smokeの既存surfaceを維持する。
