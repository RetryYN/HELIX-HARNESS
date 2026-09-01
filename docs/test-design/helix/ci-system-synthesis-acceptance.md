---
title: "HELIX L10受入テスト設計 — CI System Synthesis"
canonical_layer_scheme: L1-L12
layer: L10
paired_requirement_layer: L3
artifact_type: test_design
status: confirmed
created: 2026-08-29
updated: 2026-08-29
owner: QA / Codex TL
plan: PLAN-L3-73-ci-system-synthesis
pair_artifact: docs/design/helix/L3-requirements/ci-system-synthesis-requirements.md
---

# HELIX L10受入テスト設計 — CI System Synthesis

## §0 合否境界

job数、shard数、実行時間だけでは合格にしない。required obligation exact set、typed skip、deferred回収、
wrong-HEAD拒否、mutation detectionを維持した上でcritical pathが短縮したことを検証する。

## §1 oracle完全一致集合

| AC ID | 対応requirement | 入力／操作 | 合格条件 | negative mutation |
|---|---|---|---|---|
| `CIS-AC-001` | `CIS-R-01` | testをrename／別shardへ移動する | stable verification identityで履歴が連続する | filenameを意味主キーにしない |
| `CIS-AC-002` | `CIS-R-02` | failure後に同一HEADをrerunしてgreenにする | failure、retry、greenを別eventとして保持する | 最終greenで元failureを消さない |
| `CIS-AC-003` | `CIS-R-01`,`CIS-R-03` | wrong HEAD、時間逆転、secret-like log、別runner image／Node／npm／system dependency／Action registry digestを投入する | candidate/base/source HEADとeffective runner authorityのexact不一致を個別にrejectする | raw log／secretをprojectionへ保存せず、別environment greenをcurrent証拠にしない |
| `CIS-AC-004` | `CIS-R-04` | owner／oracle／environmentを一件ずつ除去する | registry admissionがfail-closeする | pathだけでcapabilityを補完しない |
| `CIS-AC-005` | `CIS-R-05` | shared coreと局所Moduleを変更する | consumer closureと局所ownerをそれぞれexact導出する | lexical similarityでedgeを増減しない |
| `CIS-AC-006` | `CIS-R-06` | orphan、循環、重複ownerを注入する | 各findingを個別拒否する | legacy ownerでcurrent欠落を相殺しない |
| `CIS-AC-007` | `CIS-R-07` | 同一authority入力を2回合成する | exact partitionとplan digestが一致する | duplicate／missing obligationを許可しない |
| `CIS-AC-008` | `CIS-R-08` | security、schema、selector変更をrisk downgradeする | full fallbackを維持する | LLMや平均scoreでfallbackを解除しない |
| `CIS-AC-009` | `CIS-R-09` | legacy path-only receiptを入力する | input-only変換後にtyped planだけを出力する | legacy identityをcurrent outputへ再出力しない |
| `CIS-AC-010` | `CIS-R-10` | schedulerからrequired obligationを一件除去する | aggregateがmissingでredになる | cost最適化でcoverageを縮退しない |
| `CIS-AC-011` | `CIS-R-11` | wrong HEAD／platform／lockfile artifactを再利用する | artifact admissionが個別拒否する | digest一致だけでplatform差を無視しない |
| `CIS-AC-012` | `CIS-R-12` | telemetry stale／quota不足／局所failureを注入する | safe DAGまたはbounded cancelへ遷移する | 未実行obligationをsuccessにしない |
| `CIS-AC-013` | `CIS-R-13` | deferred receiptをmissing／duplicate／wrong profileにする | exactly-one recoveryがfail-closeする | nightly greenでorigin link欠落を相殺しない |
| `CIS-AC-014` | `CIS-R-14` | nightly failureを発生させる | origin selector／edge／oracleへfindingが戻る | 観測からauthorityを直接変更しない |
| `CIS-AC-015` | `CIS-R-15` | testを省略してwall-clockだけ短縮する | escaped-defect／mutation指標により完了を拒否する | 時間短縮単独を成功にしない |

## §2 量閉じ

- behavior contract: `CIS-FR-001..005` exact 5件。
- supporting requirements: `CIS-R-01..15` exact 15件。
- acceptance: `CIS-AC-001..015` exact 15件。
