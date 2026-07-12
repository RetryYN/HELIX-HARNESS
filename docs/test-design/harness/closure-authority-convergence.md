---
layer: L8
sub_doc: unit-test-design
status: confirmed
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
| U-CAC-013 | epoch境界 | dirty registry直行、旧HEAD artifact、registry以外dirty、epoch間既存PLAN削除/source変更を拒否し、merge済み新HEADとtyped追加PLANだけを再censusする | `tests/closure-authority-convergence-epoch.test.ts` |
| U-CAC-014 | terminal ledger | tracked H/X chainの改変・欠落・別HEAD replay・duplicate・DB-only row・projection失敗を拒否し、rebuildでexact再現する。open前/二重/別receipt/自己申告resolveを拒否し、正規approval/re-censusだけをfoldする。open H/Xが残る間はL14 claimを拒否する | `tests/closure-authority-convergence-epoch.test.ts` |
| U-CAC-015 | 共通target set | I_closure=E⊎N⊎H⊎X、N=0 gate、AUTO/H/X重複・欠落を検証し、materialize/auto-approveが同digestのAUTOだけを使う | `tests/closure-authority-convergence-epoch.test.ts` |
| U-CAC-016 | GitHub authority | 既存L6-71 adapterを再利用し、複数check attempt、HEAD/app/required/TTL/branch-protection/refetch driftとreceipt取得後HEAD前進を拒否する | `tests/closure-authority-convergence-epoch.test.ts` |
| U-CAC-017 | final partition | commit後DB rebuildとPLAN path/blobからI_closure=A⊎H'⊎X'、I_closure=I_authority⊎added、N'/E'/AUTO=0、H/X path/blob不変を導出し、削除/source変更/caller accepted注入を拒否する。open H/X残存時L14 claimはred | `tests/closure-authority-convergence-epoch.test.ts` |
| U-CAC-018 | epoch recovery | local publish前後crashをexactly-once、remote commit/push/PR/CI/mergeをidempotent reconcileし、merge済みlocal crash・CI pending・branch削除から再開する | `tests/closure-authority-convergence-epoch.test.ts` |
| U-CAC-019 | boundary chain | opened/resolvedのstrict hash chainとcurrent foldを再現する | `tests/closure-terminal-boundaries.test.ts` |
| U-CAC-020 | boundary authority | chain改変、open前resolve、二重open、classification別authority mismatch、H receipt exact join不一致、X Vペアre-census digest不一致を拒否する | `tests/closure-terminal-boundaries.test.ts` |
| U-CAC-021 | boundary projection | tracked exact setをDBへ再構築し、direct update/deleteを拒否する | `tests/closure-terminal-boundaries.test.ts` |
