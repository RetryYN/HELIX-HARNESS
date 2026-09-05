---
document_id: HELIX-FUNCTIONAL-RELEASE-SLICE-L1-CANDIDATE
version: 0.2.0
status: draft_candidate
canonical_layer: L1
plan: PLAN-L3-83-functional-release-slice-composition
github_issue_id: 1494
---

# 機能昇格単位の利用者要求候補

## 背景

現行のRelease Module／Bundle要件は、責務の所有単位をModule、利用目的のcompositionをBundleとして分離している。
一方、単一のbehavior contract、依存閉包、受入証拠、consumer証拠を独立して検証・昇格する中間単位がないため、
Moduleが大きくなるほど小さな機能の成熟度とBundleへの収載判断が混在する。この候補は、既存構成を移行元inventoryとして
利用目的・責務・依存から再評価し、機能を安全に昇格させる単位を定める。既存の個数・名前・所属を固定しない。
v0.2の再編差分は2026-09-05に明示承認された（[L3-PO-1494-002](https://github.com/RetryYN/HELIX-HARNESS/issues/1494#issuecomment-5548610640)）。
v0.1の承認履歴は維持する。本承認は正本化工程へ進む範囲であり、独立レビュー・正本昇格・IR admission・実装検収・publish／cutoverを代替しない。

## 利用者要求

### FRS-BR-001 機能単位の独立昇格

利用者は、単一または密結合したbehavior contractを `Functional Release Slice` として識別し、source authority、
依存、受入、artifact、rollbackの証拠を独立して確認したうえで、Moduleの一部として昇格できなければならない。

### FRS-BR-002 明示的な収載と除外

利用者は、Bundleへ収載するSliceと除外するSliceをexact setで確認できなければならない。未指定のSlice、未適格なSlice、
previewのSliceをstable Bundleへ暗黙に含めてはならない。

### FRS-BR-003 成熟度の独立管理

利用者は、Slice、Module、Bundleのchannelとversionを別々に追跡し、Sliceの昇格だけでModuleやBundleを自動昇格させず、
逆に大きなModuleの未完了部分で適格なSliceを不必要に隠さないようにできなければならない。

### FRS-BR-004 変更から検証までの追跡

利用者は、変更pathから影響Module、Slice、Bundle、必要verification profileを決定的に辿り、局所検証と全体critical pathを
分けて実行できなければならない。unknownまたはambiguousな影響は安全側へ送られなければならない。

### FRS-BR-005 配布とrollbackの再現性

利用者は、同一source／registry／profileから同一Slice manifestとartifactを再生成し、clean consumerで検証し、失敗時に
直前のqualified Sliceまたは明示されたreplacementへ戻せなければならない。

### FRS-BR-006 証拠に基づく責務再編

利用者は、authority、quality、control、trust、operations、learning、assurance、synthesisのような横断機能を、
要求全件の所有・依存・検証・利用実績に基づき、維持・分割・統合・移管の候補へ整理できなければならない。
現構成の維持も無条件のModule増殖も前提にせず、未検証の候補はshadowに留める。

### FRS-BR-007 全要求の配布先と依存順

利用者は、対象要求revisionごとに実装先、検証先、所有Module、Release Slice、収載Bundle、未成立条件を確認できなければならない。
未所属、二重所有、未実装、未接続、未検証を隠さず、Waveを依存と検収証拠から導出する。説明用の9群・17系統を固定分母にしない。

### FRS-BR-008 開発加速の限定先行投入

利用者は、必要な検証を維持したCI改善を正式配布前から内部利用し、待ち時間・再実行を実測できなければならない。
Cursor限定委譲は専用branch、隔離、予算、期限、成果回収、独立レビューを満たして利用でき、常駐レーン全体の完成を待たない。

### FRS-BR-009 安全閉包と組合せの検収

利用者は各Sliceに必要な安全依存閉包を確認し、無関係な基盤完成を待たず、必要な安全条件が欠ける場合は投入を止められなければならない。
Lite／Fullは検収済みSliceの組合せとし、その統合・更新・rollback・L12運用検証を個別Sliceの成功とは別に確認する。

## 軸の分離

`Functional Release Slice`はcapability family、workflow model、route、drive、execution mode、provider lane、
repository境界の別名ではない。SliceはModuleへ所有され、Bundleへ選択的に収載されるrelease promotion unitである。

## 非対象

- 承認と正本改訂を経ずに現行RLSの意味を変更すること。旧候補の個数は再編の固定条件にしない。
- Module repository分割、別builder、別DB authority、別requirements authority。
- #188 routing／allocation、#819 resident lane、provider自動配車、whole-system plannerの実装。
- OPSのDeployment／Operation／Maintenance／Diagnosis、未完security brokerの再実装。
- 未承認candidateを根拠にしたruntime、current DB、CLI、generated release output、tag、publish、cutoverの変更。

本候補は、plan固有のL3承認とL10対となる受入、#397 Requirement IR admissionを経るまでcurrent authorityではない。
