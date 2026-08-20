---
title: "multi-project配布packageと段階release L10 system test設計"
layer: L10
artifact_type: test_design
status: draft
created: 2026-08-14
updated: 2026-08-21
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
| `ST-DIST-001` | `HR-AC-HYB-008-01` | source HEAD、`consumer_core_v1`、candidate manifest | profile／include／exclude exact set、source／requirements／profile／artifact digest、version一致 | unknown profile、manifest外file、duplicate、手編集allowlist、digest driftを拒否 |
| `ST-DIST-002` | `HR-AC-HYB-008-02` | dogfood混入mutation群 | project PLAN／design／DB／state／memory／credential／PII／absolute pathが0 | 各mutationを独立kill |
| `ST-DIST-003` | `HR-AC-HYB-008-03` | clean／既存／monorepo consumerへsetupを2回 | 2回目no-op、managed marker外とconsumer bytes不変 | overwrite、delete、marker外変更を拒否 |
| `ST-DIST-004` | `HR-AC-HYB-008-04` | package contents | README／LICENSE／attribution／provenance／免責がexact存在 | 1件ずつ欠落させて拒否 |
| `ST-DIST-005` | `HR-AC-HYB-008-05` | `consumer_core_v1` clean Linux fresh process | install→build→setup→status→consumer doctor→minimal workflow→CI→completion evidence green | bare CLI／package script／Node不足／除外capability到達をtyped red |
| `ST-DIST-006` | `HR-AC-HYB-008-06` | Windows fresh process | Linuxと同一artifact digest、PowerShell entrypoint smoke green |別artifact、Bun依存、POSIX専用pathを拒否 |
| `ST-DIST-007` | `HR-AC-HYB-008-07` | canary／preview／stable receipt列 | 同一artifact digest、一方向、entry／window／stop条件充足 | stage skip、rebuild差替え、stale receiptを拒否 |
| `ST-DIST-008` | `HR-AC-HYB-008-08` | failed canaryとrollback rehearsal | engine pinだけ直前tagへ戻りconsumer所有bytes不変 | consumer repository rollback／state wipeを拒否 |
| `ST-DIST-009` | `HR-AC-HYB-008-09` | safe release policyとremote action plan | 既定配布先、HEAD／profile／artifact、review、smoke、rollback、monitoring、expiryがstanding authorizationと一致するcanary／preview／stableだけ自走 | target／params／digest drift、stage skip、期限切れ、policy外cutoverのaction-binding approval欠落を拒否 |

### 2.1 Requirement IR詳細化の受入条件

| AC ID | 対応requirement | 入力／操作 | 合格条件 | negative mutation |
|---|---|---|---|---|
| `DIST-LITE-AC-001` | `DIST-LITE-R-01` | profile identityとsource／distribution repositoryを読む | `HELIX-HARNESS-LITE`／`consumer_core_v1`／HELIX-HARNESS authority／HELIX-HARNESS-OS targetがexact一致する | Lite fork、別authority、別targetを拒否する |
| `DIST-LITE-AC-002` | `DIST-LITE-R-02` | initial capability allowlistを生成する | typed capability exact setだけがmanifestへ入る | path一致、unknown capability、手編集allowlistを拒否する |
| `DIST-LITE-AC-003` | `DIST-LITE-R-02` | 除外capabilityを各consumer surfaceから探索する | file、CLI help、setup、schema、doctor、generated docsで到達0件になる | #188、#819、未終端security brokerのいずれかを到達可能にしたら拒否する |
| `DIST-LITE-AC-004` | `DIST-LITE-R-03` | 同一authority inputでpackageを2回buildする | tarball、checksum、manifest、artifact digestが一致する | timestamp、entry order、absolute path、別build差替えを拒否する |
| `DIST-LITE-AC-005` | `DIST-LITE-R-03` | canaryからpreview、stableへpromotionする | 同一artifact digestを一方向にpromotionする | stage skip、rebuild、digest driftを拒否する |
| `DIST-LITE-AC-006` | `DIST-LITE-R-04` | clean Linux fresh processでconsumer flowを実行する | install→build→setup→status→doctor→minimal workflow→CI→completion evidenceがgreenになる | bare CLI、missing script、dogfood state、credential前提を拒否する |
| `DIST-LITE-AC-007` | `DIST-LITE-R-04` | Windows smokeとrollback／uninstall rehearsalを実行する | 同一Node artifactを使いconsumer所有bytesとevidenceを保全する | OS別artifact、consumer rollback、state wipeを拒否する |
| `DIST-LITE-AC-008` | `DIST-LITE-R-05` | standing authorizationとsafe release actionを照合する | target、HEAD、profile、artifact、review、smoke、rollback、monitoring、expiryの完全一致時だけ自走する | field欠落、drift、expiry、credential authority不一致を拒否する |
| `DIST-LITE-AC-009` | `DIST-LITE-R-05` | policy外targetまたは不可逆cutoverを要求する | action-binding approvalへ停止する | standing authorizationをrepository切替、identifier／state cutover、consumer data破壊へ流用したら拒否する |

## 3. evidence schema定義

各oracleはsource HEAD、requirements digest、package version、artifact digest、OS／Node version、command、
exit code、output digest、consumer before／after digest、started／completed時刻を持つ。profileはID／version／digest／
capability exact setを持つ。promotion／rollbackはchannel、
previous／candidate tag、観測window、stop reason、approval snapshotを追加する。path、credential、PIIを記録しない。

## 4. release判定

`ST-DIST-001..009`の設計・実装・current evidenceを別stateで扱う。本書のconfirmやlocal smoke greenを
stable publish済みと読み替えず、remote actionはaction-binding approvalへ停止する。
