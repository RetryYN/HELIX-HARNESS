---
document_id: HELIX-FUNCTIONAL-RELEASE-SLICE-L1-CANDIDATE
version: 0.1.0
status: draft_candidate
canonical_layer: L1
plan: PLAN-L3-83-functional-release-slice-composition
github_issue_id: 1494
---

# 機能昇格単位の利用者要求候補

## 背景

現行のRelease Module／Bundle要件は、責務の所有単位をModule、利用目的のcompositionをBundleとして分離している。
一方、単一のbehavior contract、依存閉包、受入証拠、consumer証拠を独立して検証・昇格する中間単位がないため、
Moduleが大きくなるほど小さな機能の成熟度とBundleへの収載判断が混在する。この候補は、既存のModule／Bundle境界を
変更せず、機能を安全に昇格させる単位を追加する。

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

### FRS-BR-006 将来の責務分割への余地

利用者は、authority、quality、control、trust、operations、learning、assurance、synthesisのような横断機能を、
早期に新Moduleへ増殖させずSliceとして測定・shadow運用し、複数cycleの証拠が揃った場合だけModule候補へ昇格できなければならない。

## 軸の分離

`Functional Release Slice`はcapability family、workflow model、route、drive、execution mode、provider lane、
repository境界の別名ではない。SliceはModuleへ所有され、Bundleへ選択的に収載されるrelease promotion unitである。

## 非対象

- 現行11 Module候補、8 Bundle候補、RLS-01〜13の意味を本候補だけで変更すること。
- Module repository分割、別builder、別DB authority、別requirements authority。
- #188 routing／allocation、#819 resident lane、provider自動配車、whole-system plannerの実装。
- OPSのDeployment／Operation／Maintenance／Diagnosis、未完security brokerの再実装。
- 未承認candidateを根拠にしたruntime、current DB、CLI、generated release output、tag、publish、cutoverの変更。

本候補は、plan固有のL3承認とL10対となる受入、#397 Requirement IR admissionを経るまでcurrent authorityではない。
