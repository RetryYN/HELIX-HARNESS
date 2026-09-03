---
document_id: HELIX-FUNCTIONAL-RELEASE-SLICE-L3-CANDIDATE
version: 0.1.0
status: draft_candidate
canonical_vmodel: L1-L12
canonical_layer: L3
canonical_pair: L10
title: "Functional Release Slice composition要件候補"
layer: L3
kind: add-design
created: 2026-09-04
updated: 2026-09-04
owner: Codex / TL
plan: PLAN-L3-83-functional-release-slice-composition
github_issue_id: 1494
parent_design: docs/design/helix/L3-requirements/release-module-bundle-composition-requirements.md
pair_artifact: docs/governance/candidates/functional-release-slice-acceptance.md
refines:
  - RLS-R-01
  - RLS-R-03
  - RLS-R-05
  - RLS-R-07
  - RLS-R-09
  - RLS-R-10
  - RLS-R-11
  - RLS-R-12
---

# Functional Release Slice composition要件候補

## §0 承認境界と用語

本書は未承認のL3 candidateである。plan固有承認、L10受入の対形成、#397 Requirement IR admissionを完了するまで、
本書の意味をconfirmed requirements、runtime、schema、DB、CLI、generated catalog、DevOSへ直接投影してはならない。

既存のRLS正本が定めるModuleは責務所有、Bundleは利用目的別compositionを担う。本候補が追加するSliceは、その間に置く
機能昇格単位であり、Module、Bundle、capability family、workflow identity、route、drive、execution mode、provider、
repositoryのいずれも置換しない。

正規導出線は次とする。

```text
Capability / Behavior Contract
        ↓
Functional Release Slice
        ↓
Release Module
        ↓
Bundle
        ↓
channel / promotion / rollback
```

Issue本文は意味authorityではない。L1／L3／L10とRequirement IRからのみSliceの意味を導出し、GitHub、DB、manifest、
DevOSは再構築可能なprojectionとする。

## FRS-FR-001 Sliceの識別・正本・ライフサイクル

### FRS-R-01 Sliceスキーマ

`FunctionalReleaseSliceV1`は、`slice_id`、独立SemVer、`channel`、behavior contract exact set、primary module、
副Moduleとの関係、Bundleへの束縛、正本情報、依存関係、互換性、受入手順、成果物／manifest、復旧／置換、改訂、
digestを必須fieldとして持つ。unknown field、重複ID、欠落field、別軸identityの混入を受理しない。

### FRS-R-02 正本への束縛

source authorityはL1要求、L3要件、L10受入、Requirement IRのpath、revision、digestを保持する。Issue、README、Bundle名、
provider名、branch名からSliceの意味を推測しない。IR未admit、source digest不一致、stale revisionは候補または再観測へ戻す。

### FRS-R-03 channelのライフサイクル

Sliceのchannelは `shadow → preview → rc → stable → deprecated → retired` の一方向遷移を正本とする。遷移には対象Slice、
candidate HEAD、artifact digest、受入receipt、独立review、rollback、前channelとの差分を束縛する。failure、expiry、security、
provider driftはrevalidationまたは隔離へ戻し、channelを文字列だけで昇格させない。

## FRS-FR-002 Module所有とBundle構成

### FRS-R-04 primary Moduleの所有

各Sliceはexactly oneの`primary_module_id`を持つ。secondary moduleはconsumer、adapter、verification、compositionなどの
関係だけを表し、semantic ownerを複数化しない。orphan、primary重複、owner不明、Module scope外をfail-closeする。

### FRS-R-05 SliceとModuleの成熟度分離

Slice、Module、Bundleは独立したversion、channel、digestを保持する。Slice stableはModule stableを意味せず、Module stableは
未qualified Sliceを含む根拠にならない。Bundleのpromotion profileが要求する全Slice／Module条件を満たす場合だけ収載する。

### FRS-R-06 Bundleへの収載／除外

Bundleは`included_slices`と`excluded_slices`をexact setで保持する。excludedとincludedの重複、unknown Slice、required dependency
欠落、conflict、未指定Sliceの暗黙包含、preview／rc Sliceのstable Bundleへの混入を拒否する。

### FRS-R-07 横断機能のSlice化

`Requirement Authority`、`Effective Agent Startup`、`Human Authority`、`Claim／Evidence Substance`、`Agentic Audit`、
`Three-Lane policy`、`Quality`、`Trust`、`Operations`、`Learning`、`Assurance`、`Synthesis`等は、既存Module境界を直ちに
増やす理由にしない。まずSliceとして
shadowで測定し、複数cycleの責務所有、dependency、consumer、rollback、利用実績を確認してからModule候補へ提案する。

## FRS-FR-003 適格性確認・昇格・復旧

### FRS-R-08 適格性確認packet

Sliceのqualification packetは、target HEAD、source authority digest、slice／module／bundle registry digest、artifact digest、
targeted／mutation／full CI、DB replay、独立exact-HEAD review、clean Linux／Windows consumer、upgrade／rollback、security profile、
expiryを束縛する。greenの件数や文言だけでqualifiedにしない。

### FRS-R-09 昇格gate

`preview`はcandidate mainとtargeted／mutation、`rc`はcontract freeze、full CI、独立review、DB replay、clean consumer、
upgrade／rollback、`stable`はRC canary、soak、previous stable rollback、main／配布read-afterを要求する。各channelのprofileを
省略または下位channelのgreenで代用しない。

### FRS-R-10 復旧・置換・retirement

各Sliceは直前のqualified revisionまたは明示されたreplacementを持つ。rollbackはartifact、manifest、DB、consumer stateを同じ
revisionへ戻す証拠を残し、rollback成功だけでincident、release、Issue、PLANを終端にしない。deprecated／retired Sliceは新規
Bundleのdefaultから除外し、互換期間とreplacementを明示する。

### FRS-R-11 Implicit promotion禁止

Slice、Module、Bundleのいずれかが更新されても、他のidentity、channel、version、artifactを暗黙に書き換えない。previewの
新Sliceをstable Bundleへ取り込む場合は、Bundle側に対象Slice exact setとprofile evidenceが存在しなければならない。

## FRS-FR-004 変更影響とCI導出

### FRS-R-12 影響閉包

`changed path → primary Module → affected Slice → affected Bundle → required verification profile`を、authority／registry digestへ
束縛して決定的に導出する。secondary relationだけを理由にsemantic ownerを変更しない。

### FRS-R-13 局所最適と全体統制

Slice単位のtargeted／mutation／consumer検証を局所最適化しつつ、shared core、authority、cross-slice dependency、release、main
read-afterはdependent closureとcritical pathへ展開する。検証義務を減らすためにSliceを分割してはならない。

### FRS-R-14 Unknown、ambiguous、staleの安全側処理

影響Module、Slice、Bundle、dependency、profile、channelがunknown、ambiguous、staleの場合、成功扱い、空集合、局所greenへの
fallbackをしない。full verificationまたはfail-closeへ送る。inventory unionを根拠にしたsilent omissionを禁止する。

## FRS-FR-005 生成projection、将来合成、配布境界

### FRS-R-15 決定論的manifest

同一source HEAD、L1／L3／L10／IR、registry、profile、policyから同一Slice manifest、artifact、checksum、semantic digestを生成する。
時刻、entry order、作業者、provider名、absolute path、development state、credentialをartifact identityへ混入させない。

### FRS-R-16 Future／System Synthesis接続

Future SynthesisまたはSystem Synthesisの`release_future`は、既存Sliceの候補、channel、依存、qualification不足をproposalとして
返してよいが、Slice、Module、Bundle、Requirement、Assignment、releaseを直接変更しない。構造変更は別のAuthority／Design候補へ
戻し、承認とIR admissionを要求する。

### FRS-R-17 DevOSへの投影

DevOSまたは配布repositoryは、HELIX-HARNESSで生成・sealされたSlice／Module／Bundle manifest、artifact digest、受入receiptを
保存するprojectionである。DevOS側の手編集をsource authorityへ逆輸入せず、未承認Sliceをpublish、promotion、cutoverしない。

### FRS-R-18 収束とreplay

Slice registry、Module／Bundle registry、artifact manifest、GitHub、harness.db、consumer、rollback stateはevent／authorityから
再構築できる。main／DevOS／DB／consumerのread-afterが同一Slice revisionへ収束しない場合はstable claimを拒否する。

## §1 既存RLSへの原子的差分

既存RLSの意味を置き換えず、承認後に次の責務だけへ反映する。

| 既存RLS | Slice候補の差分 |
|---|---|
| RLS-02 | `FunctionalReleaseSliceV1` schema、channel、lifecycle、適格性確認packet |
| RLS-03 | Module path ownershipとSlice primary／secondary relationの分離 |
| RLS-05 | Bundle `included_slices`／`excluded_slices`、implicit inclusion拒否 |
| RLS-09 | Slice exact setのconsumer、upgrade、rollback、actor／receipt束縛 |
| RLS-11 | changed pathからSlice／Bundle／verification profileへの決定的導出 |
| RLS-12 | Slice channel、replacement、retirement、GitHub／DB／consumerのread-after |
| RLS-13 | OPSをRLSへ混載せず、lifecycle E2EでSlice revisionを束縛 |

## §2 非対象

- 既存RLS正本の11 Module、8 Bundle、RLS-R-01..13の初期意味の無承認変更。
- Module repository split、別のdistribution builder、別のRequirement／DB authority。
- #188、#819、provider自動配車、Notification Fabric、未完security broker、whole-system planner。
- tag、publish、DevOS cutover、production deployment、credential／secret変更。
