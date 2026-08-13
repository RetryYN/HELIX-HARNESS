---
title: "multi-project配布packageと段階release L10 system test設計"
layer: L10
artifact_type: test_design
status: draft
created: 2026-08-14
updated: 2026-08-14
owner: Codex / QA
plan: docs/plans/PLAN-L3-54-distribution-package-release.md
pair_artifact: docs/design/helix/L3-requirements/distribution-package-release-requirements.md
---

# multi-project配布packageと段階release L10 system test設計

## 1. 対象と境界

requirements §4.6.1の`HR-FR-HYB-008`をsystem境界で検証する。local package plan／dry-run／consumer
fixtureを対象とし、remote sync apply、tag、release publish、channel promotion、PLAN-M-02 cutoverは実行しない。

## 2. oracle完全集合

| oracle | 対応AC | system入力 | pass条件 | negative oracle |
|---|---|---|---|---|
| `ST-DIST-001` | `HR-AC-HYB-008-01` | source HEADとcandidate manifest | include／exclude exact set、source／requirements／artifact digest、version一致 | manifest外file、duplicate、digest driftを拒否 |
| `ST-DIST-002` | `HR-AC-HYB-008-02` | dogfood混入mutation群 | project PLAN／design／DB／state／memory／credential／PII／absolute pathが0 | 各mutationを独立kill |
| `ST-DIST-003` | `HR-AC-HYB-008-03` | clean／既存／monorepo consumerへsetupを2回 | 2回目no-op、managed marker外とconsumer bytes不変 | overwrite、delete、marker外変更を拒否 |
| `ST-DIST-004` | `HR-AC-HYB-008-04` | package contents | README／LICENSE／attribution／provenance／免責がexact存在 | 1件ずつ欠落させて拒否 |
| `ST-DIST-005` | `HR-AC-HYB-008-05` | clean Linux fresh process | install→setup→status→consumer doctor→minimal workflow dry-run green | bare CLI／package script／Node不足をtyped red |
| `ST-DIST-006` | `HR-AC-HYB-008-06` | Windows fresh process | Linuxと同一artifact digest、PowerShell entrypoint smoke green |別artifact、Bun依存、POSIX専用pathを拒否 |
| `ST-DIST-007` | `HR-AC-HYB-008-07` | canary／preview／stable receipt列 | 同一artifact digest、一方向、entry／window／stop条件充足 | stage skip、rebuild差替え、stale receiptを拒否 |
| `ST-DIST-008` | `HR-AC-HYB-008-08` | failed canaryとrollback rehearsal | engine pinだけ直前tagへ戻りconsumer所有bytes不変 | consumer repository rollback／state wipeを拒否 |
| `ST-DIST-009` | `HR-AC-HYB-008-09` | remote action plan | actor／tool／target／params／snapshot／期限／rollback／monitoring承認が揃うまでblocked | approval欠落／drift／expiryを拒否 |

## 3. evidence schema定義

各oracleはsource HEAD、requirements digest、package version、artifact digest、OS／Node version、command、
exit code、output digest、consumer before／after digest、started／completed時刻を持つ。promotion／rollbackはchannel、
previous／candidate tag、観測window、stop reason、approval snapshotを追加する。path、credential、PIIを記録しない。

## 4. release判定

`ST-DIST-001..009`の設計・実装・current evidenceを別stateで扱う。本書のconfirmやlocal smoke greenを
stable publish済みと読み替えず、remote actionはaction-binding approvalへ停止する。
