---
canonical_vmodel: L1-L12
canonical_layer: L3
canonical_pair: L10
title: "Release Module／Bundle composition要件"
layer: L3
kind: add-design
status: confirmed
created: 2026-08-27
updated: 2026-08-29
owner: PO / Codex TL
plan: PLAN-L3-68-release-module-bundle-composition
parent_design: docs/design/helix/L3-requirements/distribution-package-release-requirements.md
pair_artifact: docs/test-design/helix/release-module-bundle-composition-acceptance.md
refines:
  - HR-FR-HYB-008
  - DIST-LITE-R-01
  - SYN-R-02
---

# Release Module／Bundle composition要件

## §0 authorityと非混同境界

HELIX-HARNESSをRequirement、Design、Workflow、Verification、runtime、release sourceの唯一の意味authorityとする。
Release Moduleは同一repository内の責務・version・artifact ownership単位、BundleはModuleの利用目的別compositionである。
capability family、workflow identity、route、drive、execution mode、repository boundaryと同一enumへ畳み込まない。

`RetryYN/HELIX-HARNESS-DevOS`はimmutable artifact、release index、compatibility、install／upgrade／rollback、
checksum／provenance／SBOM、acceptance receipt、release noteのrelease composition authorityに限定する。DevOSで意味契約を
手編集せず、DevOS artifactからHELIX-HARNESSへreverse importしない。repository分割は実測根拠を持つ将来判断へ分離する。

既存`consumer_core_v1`、distribution capability／profile catalog、deterministic builder、Lite canary、Windows smoke、
setup／status／doctor／DB、Requirement IR、Design／Workflow registry、Impact CI、exact-HEAD review、feedback／Reverseを再利用する。

## RLS-FR-001 Module identityと責務所有

### RLS-R-01 Module schemaとlifecycle

Moduleはstable ID、独立SemVer、source full SHA、tree／authority／semantic digest、責務／除外、public／internal surface、
artifact完全集合、required／optional／conflict依存、互換性、受入／security profile、移行／rollback、
replacementを保持する。lifecycleは`shadow → preview → rc → stable → deprecated → retired`の一方向を正本とする。

### RLS-R-02 初期Module完全集合

初期候補は次の11件とする。

`helix-core`、`helix-requirements`、`helix-design`、`helix-workflow`、`helix-verification`、`helix-ci`、
`helix-reverse-recovery`、`helix-refactoring`、`helix-context-memory`、`helix-agent-runtime`、`helix-github-ops`。

候補登録はstable到達を意味しない。Designは#290等、Workflowは#204／#206／#188、RefactoringはSystem Synthesis、
Agent RuntimeはResident Lane／security／72時間soakの既存ownerをrelease blockerとして参照し、未完機能をmodule実装へ混載しない。

### RLS-R-03 path所有権

全release pathはexactly-one `primary_module_id`を持ち、secondary consumer、artifact role、authority roleを記録する。
orphan、primary重複、scope外混入、required artifact欠落、shared semantic copy、generated view正本化をfail-closeする。
`src/cli.ts`はcommand registration／argument parsing／adapter呼出しだけのcomposition surfaceとし、domain ownerにしない。

## RLS-FR-002 DependencyとBundle composition

### RLS-R-04 dependency DAGとcompatibility

Module dependencyはrequired／optional／conflict、version range、authority digest、OS／Node／Python／feature compatibilityを持つ。
required cycle、欠落、unknown compatibility、異なるversionの同一authority同梱を拒否する。optional dependency absentを検証する。

### RLS-R-05 Bundle schemaとinitial exact set

Bundleは独立SemVer、source lock、module ID／version／digest exact set、excluded capability、intended use、install／acceptance／
compatibility／rollback profile、bundle digestを持つ。初期候補は`helix-requirements`、`helix-design`、`helix-dynamic-ci`、
`helix-quality`、`helix-refactoring`、`helix-autonomous-dev`、`helix-lite`、`helix-full`の8件とする。
Bundle固有責務はcomposition、installer、default configuration、acceptance profileに限定し、module sourceの意味を変更しない。

### RLS-R-06 Lite基準線の移行

現行`consumer_core_v1`はsource commit、artifact／file inventory／authority digest、Linux／Windows receiptを持つ
`frozen_baseline`とする。全path分類、shadow package、new `helix-lite` parity、1 stable cycle併存、supersede、retirement approvalの
順に移行する。旧Liteへ新Design／Refactoring／Runtimeを継ぎ足さず、先行削除やnew greenによるold failure相殺を禁止する。

## RLS-FR-003 Build、検証、昇格

### RLS-R-07 deterministic buildとrelease packet

既存builderを拡張し、同一source／registry／profile入力から同一Module／Bundle artifactを生成する。release packetはsource full SHA、
tree／module／bundle registry digest、artifact digest、checksums、SBOM、互換性、受入、独立review、rollback、
release noteを束縛する。Module別・Lite専用の重複builderを作らない。

### RLS-R-08 信頼実行前のstatic検証

未信頼artifactはcode実行前にmanifest exact set、hash、schema、source lock、secret、unexpected executable、permission、Action SHA、
path traversal、symlink／junction、duplicate／case collision、archive bombを検査する。static failureをtrusted executionのgreenで
相殺しない。clean consumerはLinuxと同一artifactのWindowsでinstall、setup、status、DB rebuild、doctor、module／bundle
acceptance、upgrade、uninstall／rollbackを行い、consumer所有bytesを保全する。

### RLS-R-09 DevOS promotionとactor separation

promotionは`R0 inventory → R1 ownership compile → R2 shadow package → R3 bundle composition → R4 packet seal →
R5 DevOS候補PR → R6 static検証 → R7 trusted consumer検証 → R8 独立検証 → R9 RC →
R10 canary → R11 stable／rollback`とする。producer、reviewer、verifier、final acceptance authorityを分離し、candidate HEADと
artifact digestへ束縛する。DevOS candidate PRはgenerated exact setだけを変更する。

## RLS-FR-004 Wave、CI、フィードバック

### RLS-R-10 channel、SemVer、release wave管理

ModuleとBundleのSemVerを独立管理する。Waveは全Module shadow、Foundation RC、Workflow／CI／Recovery、Lite RC、
Requirements／Design Preview、Refactoring Preview、Runtime／Autonomous／Fullの依存順とする。preview moduleをstable Fullへ
暗黙包含せず、deprecatedはreplacementを示し、retiredはinstaller defaultから除外する。

### RLS-R-11 Module Registry駆動CI

`changed paths → affected modules → affected bundles → required verification capabilities → CI Plan`を決定的に生成する。
module-static／unit／integration、bundle composition、consumer install、cross-platform、security、release-fullを選択し、shared coreは
dependent closureを展開する。unknown／ambiguousはfullへfallbackし、main／nightly／releaseはfullを維持する。selection mutation、
inventory union、LinuxからWindowsへのexact artifact handoffを必須にし、無関係fullの直列増殖を禁止する。

### RLS-R-12 フィードバック、置換、終端収束

release finding、rollback、compatibility、false positive／negative、consumer evidenceをSystem Synthesis observationとReverse／Recoveryへ
戻す。module／bundle registry、release index、Git、GitHub、`harness.db`を再構築可能なprojectionとして収束し、mainとDevOSの
read-after、supersede／retire evidenceまで閉じる。

### RLS-R-13 Release後ライフサイクル責務

`product-lifecycle-operations-requirements.md`を意味authorityとして、`helix-deployment`、`helix-operations`、
`helix-maintenance`、`helix-diagnosis`の4 Module候補と`helix-lifecycle-ops` Bundle候補を登録する。Release artifact確定と
environment Deploymentを別stateとし、provider adapter、change class、workflow routeをModule identityへ畳み込まない。

4 Moduleは#1161〜#1166のschema／runtime／security境界と#1167 E2Eがgreenになるまでshadowに固定する。既存11 Moduleの
stable判定やLite parityへ暗黙包含せず、Wave 7でHELIX dogfood、health observation、incident diagnosis、rollback／redeployment、
main／DevOS read-afterを閉じてからpreviewへ昇格する。

## §1 非対象

- HELIX-HARNESSのmodule repository分割。
- Whole-System Synthesis Planner、全工程一括自動合成、Development Model学習。
- #204、#206、#188、#290、#292、#1017、#176、Resident Lane、security broker本体の再実装。
- 本要件追加だけを根拠にしたtag、publish、cutover、consumer data破壊。
- 本要件追加だけを根拠にしたproduction deployment、cloud resource変更、secret rotation。

## §2 実装owner

親Issue #1073配下の#1074〜#1086へRLS-01〜13を原子的に割り当てる。Release後ライフサイクルは#1160〜#1167へ分離する。
#659／#856は配布baseline owner、#1033はpartial synthesis observation owner、#410はoperation evidence ownerとして維持し、
同義registryや別authorityを追加しない。
