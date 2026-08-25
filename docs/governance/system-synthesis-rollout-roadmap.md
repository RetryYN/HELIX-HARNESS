# System Synthesis段階導入roadmap

## authority

要求正本は`docs/design/helix/L3-requirements/system-synthesis-requirements.md`、受入正本は
`docs/test-design/helix/system-synthesis-acceptance.md`である。本書は実装順とparking条件だけを所有し、
独自のrequirement、route、DB authorityを追加しない。

## NOW依存順

| 順序 | Issue | capability | entry condition | terminal evidence |
|---:|---:|---|---|---|
| 1 | #1036 | semantic connection graph kernel | #204 typed identityを再利用可能 | deterministic replay、unknown edge mutation |
| 2 | #1039 | deterministic partial synthesis | #1036、#179、#188、#233のtyped input成立 | same-input same-digest、required omission拒否 |
| 3 | #1040 | REFACTORING specialist workflow | #204、#234、#235のaxis／lifecycle接続成立 | RF0〜RF6 exact set、route混同拒否 |
| 4 | #1038 | replacement lifecycle | #233／#235のportfolio／lifecycle接続成立 | parity、migration、rollback、no-degradation |
| 5 | #1041 | V-pair／Scrum DoD接続 | #1038 terminal | pair trace、separate PR admission |
| 6 | #1034 | Impact CI composition | #1036、#1039のimpact graph成立 | capability closure、full fallback |
| 7 | #1035 | observation／pattern promotion | NOW実装の実測が2 project以上 | counterexample、mutation、human approval |

## FUTURE保留条件

#1037は以下が全て揃うまでparkedとする。

- NOW childのmain read-afterが完了している。
- rule-based baselineと複数project datasetが固定されている。
- false positive／false negative、counterexample、rollbackを測定できる。
- shadow outputがcurrent authorityへwriteしないことをdoctorで検証できる。
- L3人間確認が別action-binding evidenceとして存在する。

## 原子性

各Issueは独立PLAN／branch／PRで進める。要求正本、semantic kernel、workflow registry、Impact CI、model実験を
同一PRへ混載しない。先行sliceのmain merge後に後続baseを再同期し、exact-HEAD reviewを取り直す。
