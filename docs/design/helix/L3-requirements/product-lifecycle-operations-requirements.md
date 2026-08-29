---
canonical_vmodel: L1-L12
canonical_layer: L3
canonical_pair: L10
title: "製品ライフサイクル運用要件"
layer: L3
kind: add-design
status: confirmed
created: 2026-08-29
updated: 2026-08-29
owner: PO / Codex TL
plan: PLAN-L3-71-product-lifecycle-operations
parent_design: docs/design/helix/L3-requirements/release-module-bundle-composition-requirements.md
pair_artifact: docs/test-design/helix/product-lifecycle-operations-acceptance.md
refines:
  - RLS-R-09
  - RLS-R-12
requirement_ir_refinement: OPS-FR-001
---

# 製品ライフサイクル運用要件

## §0 authorityと分類境界

HELIXの統制範囲を`Requirement → Definition → Design → Implementation → Verification → Release`から、
`Deployment → Operation → Maintenance → Diagnosis → Issue → 修正 → 再Deployment`まで拡張する。
Releaseは検証済みartifactの確定、Deploymentはそのartifactを一意なenvironmentへ反映する別の状態遷移である。

Requirement、Definition、Contract、Release、Deploymentの意味authorityはHELIX-HARNESSに置く。runtime observation、log、metric、
trace、notification、provider control plane、DevOS、`harness.db`は証拠またはprojectionであり、意味authorityとして手編集しない。
大容量log、dump、動画、traceはdigest付きartifact referenceへ分離し、state正本には構造化state、判断、参照だけを保存する。

本要件の上流関係は、単一の`refines`へ畳み込まず次のtyped relationとして固定する。

| relation | authority | 本要件での意味 |
|---|---|---|
| `extends` | `RLS-R-09`／`RLS-R-12` | Release promotion／feedbackの後段へDeployment以降のsystem lifecycleを追加する |
| `derives_from` | `HR-FR-HIL-07`／`HR-FR-HIL-10`／`HR-FR-VMFIT-07` | repair promotion、detector、運用後log／KPIの既存能力から運用・保守・診断義務を導く |
| `governed_by` | `HR-FR-HIL-02`／`HR-FR-HIL-04`／`HR-FR-HIL-24`／`SEC-FR-CAP-005` | Forward収束、Universal Reverse／Redesign re-entry、release package、安全な外部作用の既存authorityへ従う |

`HR-FR-VMFIT-07`は`docs/design/helix/L3-requirements/vmodel-docgen-fit.md`でconfirmedな運用後検証要件である。
ただし製品ライフサイクル全体の意味ownerではなく、本要件を導く既存観測契約としてだけ参照する。

system変更分類は次の独立軸を正本とする。

- `implementation_ops`: code、connection、CI、build、deployment、configuration、performance、monitoring、dependency、security patch、backup／restoreの日常改善。
- `definition_review`: responsibility、boundary、data ownership、contract、dependency direction、module structureの見直し。
- `requirement_change`: value、feature、behavior、usage condition、acceptanceの追加・変更。

能力増築はsystem変更分類へ混在させず、別の`capability_expansion_kind`軸で表す。

- `none`: 能力assetを追加しない。
- `skill`: 判断・作業skillを追加または昇格する。
- `template`: requirement／design／test等のtemplate表現能力を追加または昇格する。
- `workflow`: workflow model／specialist workflowの実行能力を追加または昇格する。
- `detector`: findingを生成する検出能力を追加または昇格する。
- `gate`: admission／completionを機械強制するgate能力を追加または昇格する。

`system_change_class`と`capability_expansion_kind`は直積として併記できる。`ADD_FEATURE`はworkflow modelであり、
能力種別やsystem変更分類へ再利用しない。新しい能力assetは既存HIL learning／template improvement authorityに従い、
shadow、独立review、効果測定、rollbackを経ずにcurrentへ昇格しない。

Evidenceを伴う`implementation_ops → definition_review → requirement_change`の上位昇格だけを許可し、観測から上位authorityを直接変更しない。
Reverse、Recovery、Incident等のworkflow routeと上記change classを同じenumへ畳み込まない。

## OPS-FR-001 型付きライフサイクルcontract

### OPS-R-01 環境contract（EnvironmentContract）

環境ごとにenvironment ID、class、provider adapter ID／version、current state digest、endpoint reference、resource constraint、permission、
credential reference、network sink、data classification、dependency resource、owner、expiryを保持する。secret値は保持しない。
targetを一意に物理同定できない場合、logical targetとphysical targetが不一致の場合、credentialが期限切れの場合はfail-closeする。

### OPS-R-02 配備contract（Deployment）

`DeploymentManifest`はRelease artifact full SHA／digest、configuration digest、target environment、migration、health check、
compatibility、required capabilityを保持する。`DeploymentPlan`はpreflight、staging、apply order、approval、stop condition、rollback、
observation windowを保持する。`DeploymentReceipt`はactor、assignment、target identity、before／after state、artifact、差分、時刻、結果、
evidence、provider receiptを束縛する。Plan、apply、receiptを同一状態へ畳み込まない。

### OPS-R-03 巻き戻しcontract（Rollback）

`RollbackPlan`と`RollbackReceipt`をDeploymentとは別contractとして保持する。irreversible migration、backup欠落、rollback target不明、
consumer-owned bytes破壊、rollback後health未確認を拒否する。rollback successをincident closureやforward fix completionとして扱わない。

## OPS-FR-002 配備計画と段階昇格

### OPS-R-04 provider中立planner

Requirement、Design、dependency、Release Artifact、Environment current stateからDeployment Planを決定的に生成する。
local、VPS、container、serverless、AWS、Azure、GCP等はtyped adapter portで接続し、provider固有schemaやcommandをCoreへ埋め込まない。
unknown capability、ambiguous target、artifact／config digest欠落、migration互換不明、health check欠落、権限不足をfail-closeする。

### OPS-R-05 段階的promotion

同一artifact digestを`staging／equivalent → canary → bounded exposure → production`へ昇格する。blue-green等のstrategyはrisk、
blast radius、health model、rollback latencyから決定する。stage skip、OS別rebuild、review前artifact差替え、observation window省略を拒否する。
production apply、cloud destructive operation、credential sinkは既存action-binding approvalとsecurity broker authorityへ従う。

## OPS-FR-003 運用とincident

### OPS-R-06 運用policyと観測（OperationPolicy／Observation）

`OperationPolicy`はSLO、availability、latency、error rate、process／job／queue、API／DB／MCP接続、CPU／memory／storage／network、
retry／timeout／circuit breaker、certificate／credential validity、post-deploy delta、cost、alert、Runbook、recovery authorityを保持する。
`OperationalObservation`はpolicy version、environment、window、source、quality、correlation、payload digest、findingを保持する。

### OPS-R-07 障害記録（IncidentRecord）

異常を関連Release、Deployment、Requirement、Contract、変更差分へ相関し、symptom、impact、start／detect／recover time、直前変更、
containment、rollback、root-cause state、recurrence preventionを記録する。duplicate／out-of-order observationは冪等処理し、stale correlation、
missing provenance、insufficient qualityからroot causeを推測確定しない。自動復旧はversioned Runbookとbounded authority内だけとする。

## OPS-FR-004 保守

### OPS-R-08 保守義務（MaintenanceObligation）

保守対象としてdependency／runtime update、vulnerability、secret／certificate rotation、backup／restore／migration rehearsal、configuration drift、deprecated
API／schema／workflow retirement、flaky test、CI／runner、retention、capacity／performance、Runbook、dead code／connectionを期限、周期、owner、
target、required evidence、risk、overdue effectへ束縛する。schedulerのduplicate、clock drift、timezone boundary、missed cycleを検出する。

### OPS-R-09 構造問題の上位昇格

保守中にresponsibility、contract、data ownership、dependency directionの構造原因を検出した場合、局所patchだけで閉じず
`definition_review`へ昇格する。value、behavior、acceptanceを変える必要がある場合だけ`requirement_change`へ昇格する。

## OPS-FR-005 診断と修正箇所特定

### OPS-R-10 変更診断（ChangeDiagnosis）

症状から修正箇所を特定するため、`symptom／user outcome → Runtime／Deployment／CI Evidence → Release／PR／Commit／diff → Requirement／Definition → Contract／dependency →
Module／Code／Test／Config／Infrastructure`を追跡する。診断はchange class、evidence refs、suspected IDs／modules／files／infrastructure、
affected component、confidence、blast radius、regression scope、migration／rollback／escalation decisionを持つ。

候補が複数なら順位、根拠、反証条件を示す。単純な文字列一致、最新commit、単一logだけで確定しない。confidence不足時は追加観測または
再現試験をPLANへ返し、ambiguousな修正対象を自動編集しない。

### OPS-R-11 終端証拠

commandやDeployment APIのsuccessだけで完了としない。実environment health check、observation window、SLO、rollback readiness、
regression、independent review、main／deployment target／GitHub／DB read-afterが一致して初めてcompletion evidenceを成立させる。
incident close後もMaintenanceObligationまたはReverse／Recovery findingが残る場合は終端差をsurfaceする。

### OPS-R-13 診断backflow／再入（BackflowDecision）

Troubleshootingを新しいworkflow routeにせず、`Observation + Incident／Recovery + Diagnosis + BackflowDecision`の横断能力とする。
`BackflowDecision`は最低限、diagnosis ID、system change class、capability expansion kind、workflow route、affected／return layer、
affected requirement／design ID、evidence reference、base revision、stale target、human decision要否、Forward再入条件を保持する。

| system change class | 既存route候補 | adaptive return／再入条件 |
|---|---|---|
| `implementation_ops` | `RECOVERY`／`REVERSE`／`REFACTOR`／`RETROFIT` | 原因が存在するL4〜L7へ戻し、該当pair、regression、receiptをcurrent化する |
| `definition_review` | `REDESIGN`／`DESIGN_REFACTOR`／`RETROFIT` | 影響するL3〜L5と全downstreamをstale化し、設計／contractを再freezeする |
| `requirement_change` | `REDESIGN`＋Requirement Discovery | L12 evidenceからL1価値またはL2要求へbackflowし、Proposal→Candidate→human decision→L3 recompile／re-freezeを閉じる |

戻り先をchange classだけで固定せず、原因、変更意味、affected authority、pair closureから最小の連続layer集合を決定する。
Full Vは`HR-FR-HIL-04`のUniversal Reverse／Redesign re-entryを使い、Production Scrum／Hybridだけが必要に応じて
`SCRUM_REVERSE` SR0〜SR4をsubrouteとして使う。rollback／containment成功はBackflowDecision、stale closure、re-freeze、
Forward再入、Release／Redeployment／再観測を代替しない。曖昧なroute、非連続return layer、旧revision receipt、
re-freeze前のForward joinをfail-closeする。

## OPS-FR-006 release責務と自己適用検証

### OPS-R-12 Module／Bundle統合

Release Module責務を`helix-deployment`、`helix-operations`、`helix-maintenance`、`helix-diagnosis`へ分離し、各release pathの
primary ownerをexactly oneにする。`helix-lifecycle-ops` Bundleは4 Moduleとrequired core／verification／security dependencyを
exact lockする。Module、Bundle、workflow route、change class、provider adapterを同一identityへ畳み込まない。

HELIX自身を通常consumerとして、`Release → Deployment → Observation → Incident → Diagnosis → Fix → Release → Redeployment → Close`を
実証する。self-host専用の例外contract、silent credential fallback、手編集receiptを作らない。

## §1 標準状態遷移

```text
RELEASED
  → DEPLOYMENT_PLANNED
  → PREFLIGHT_PASSED
  → STAGED
  → DEPLOYED
  → OBSERVING
  → HEALTHY

OBSERVING / HEALTHY
  → INCIDENT_OPEN
  → DIAGNOSING
  → CONTAINED / ROLLED_BACK
  → FIX_PLANNED
  → RE-RELEASED
  → REDEPLOYED
  → OBSERVING
  → INCIDENT_CLOSED
```

各transitionはactor、source／target state、artifact／environment digest、approval、evidence、time、correlationへ束縛する。
state skip、stale receipt、wrong environment、wrong artifact、lease失効を拒否する。

## §2 非対象

- 本要件だけを根拠にしたproduction deployment、cloud resource変更、secret rotation、tag／publish／cutover。
- provider固有control planeのCore再実装。
- raw telemetryの大量保存service、外部monitoring productの再実装。
- ObservationによるRequirement／Definitionの自動変更。
- #188 routing、#819 resident lane、#679 security broker本体の便乗実装。

## §3 実装owner

親Issue #1160配下の#1161〜#1167へ、schema、deployment、operation、maintenance、diagnosis、adapter、E2Eを依存順に割り当てる。
#1073／#659はrelease compositionとdistribution、#410はoperation evidence境界、#679はhost／credential／network安全境界のownerを維持する。
