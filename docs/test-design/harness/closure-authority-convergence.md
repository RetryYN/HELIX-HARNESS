---
layer: L8
sub_doc: unit-test-design
status: draft
pair_artifact: docs/design/harness/L6-function-design/closure-authority-convergence.md
plan: docs/plans/PLAN-L6-77-closure-authority-convergence.md
---

# closure authority段階収束の検証設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-CAC-001 | apply CLI | proposal・review receipt・current HEAD欠落を拒否する | `tests/closure-authority-convergence.test.ts` |
| U-CAC-002 | bounded window | candidate列の欠落・重複・並べ替えを拒否する | `tests/closure-authority-convergence.test.ts` |
| U-CAC-003 | eligible apply | 独立approveの無いrowと非eligible rowを拒否する | `tests/closure-authority-convergence.test.ts` |
| U-CAC-004 | CAS | stale HEAD・registry digest・proposal digestを拒否する | `tests/closure-authority-convergence.test.ts` |
| U-CAC-005 | rollback | commit前failureはregistry不変かつledger非追記、commit後ledger失敗は同digest再生成しregistryを巻き戻さない | `tests/closure-authority-convergence.test.ts` |
| U-CAC-006 | cycle ledger | windowと未解決理由の改変・削除を拒否する | `tests/closure-authority-convergence.test.ts` |
| U-CAC-007 | resume | committed windowの再適用とoffset飛越を拒否する | `tests/closure-authority-convergence.test.ts` |
| U-CAC-008 | TTL更新 | candidate集合・authority generation driftを拒否する | `tests/closure-authority-convergence.test.ts` |
| U-CAC-009 | producer chain | proposal保存→非承認draft→独立task evidence→atomic receiptのpositive pathを通し、receipt欠落/self-approvalを拒否する | `tests/closure-authority-convergence-production.test.ts` |
| U-CAC-010 | human境界 | irreversible PLANの自動昇格を拒否する | `tests/closure-authority-convergence-production.test.ts` |
| U-CAC-011 | 保存則 | cycle中R=E⊎N⊎H⊎X、終端I0=A⊎H⊎X、N/E/nonhuman close_ready=0を証明する | `tests/closure-authority-convergence-production.test.ts` |
| U-CAC-012 | production E2E | real Git/persistent DB/crash restart/GitHub receipt fixtureでcurrent-locationを正常化する | `tests/closure-authority-convergence-production.test.ts` |
