# Release Module／Bundle段階導入roadmap

## authority

L3正本は`docs/design/helix/L3-requirements/release-module-bundle-composition-requirements.md`、L10 pairは
`docs/test-design/helix/release-module-bundle-composition-acceptance.md`である。本書は実装順projectionであり意味正本ではない。

## Functional Release Slice candidate（未承認projection）

`PLAN-L3-83-functional-release-slice-composition` と Issue #1494 は、既存のModule／Bundle要件を置き換えず、
`Capability / Behavior Contract → Functional Release Slice → Release Module → Bundle` の中間昇格単位を提案する。
候補の意味authorityは `docs/governance/candidates/functional-release-slice-requests.md`、
`docs/governance/candidates/functional-release-slice-requirements.md`、
`docs/governance/candidates/functional-release-slice-acceptance.md` である。
L3承認、L10対、#397 Requirement IR admissionまでは、runtime、DB、CLI、generated catalog、tag、publish、cutoverへ投影しない。
SliceはModule／Bundle、workflow、route、drive、execution mode、provider、repositoryとは別軸であり、既存11 Module／8 Bundleの
意味を変更しない。承認後の差分対象はRLS-02／03／05／09／11／12／13に限定する。

## Issue依存グラフ

| 順序 | Issue | 責務 | 前提 |
|---:|---:|---|---|
| 1 | #1074 | RLS-01 棚卸し／authority map | #1073 |
| 1.5 | #1494 | Functional Release Slice candidate／昇格単位のL1・L3・L10候補 | #1073、#1074（L3承認・#397 IR admission後に#1075へ接続） |
| 2 | #1075 | RLS-02 schema／lifecycle | #1074 |
| 3 | #1076 | RLS-03 path ownership | #1075 |
| 4 | #1077 | RLS-04 dependency／compatibility | #1076 |
| 5 | #1078 | RLS-05 Bundle resolver | #1077 |
| 6 | #1079 | RLS-06 deterministic builder | #1078 |
| 7 | #1080 | RLS-07 static verification | #1079 |
| 8 | #1081 | RLS-08 DevOS promotion | #1080 |
| 9 | #1082 | RLS-09 clean consumer／rollback検証 | #1081 |
| 10 | #1083 | RLS-10 旧Liteとのparity検証 | #1082 |
| 11 | #1084 | RLS-11 CI composition | #1083 |
| 12 | #1085 | RLS-12 channel／SemVer／wave管理 | #1084 |
| 13 | #1086 | RLS-13 feedback／retirement | #1085 |

依存は意味成立の正規順である。実装はownership確定後に、相互にfile ownershipが重ならないstatic verifier、consumer runner、
CI planner等を並行化できる。新規module repositoryや別builderを先行作成しない。

### Candidate Wave 0.x（#1494承認後のみ）

1. Wave 0.1: #1074のcurrent release path／Module inventoryを確定する。
2. Wave 0.2: `FunctionalReleaseSliceV1` registry、channel、qualification packet、Module／Bundle差分をshadowで生成する。
3. Wave 0.3: Slice exact setのshadow builder、CI impact closure、clean consumer parityを検証する。

この0.xは既存Wave 0の意味を変更せず、candidateがcanonical promotionされた場合にだけRLS-02以降へ接続する。
Sliceのpreview／stableをBundleへ暗黙包含せず、unknown／ambiguous／staleはfullまたはfail-closeへ送る。

## release wave計画

1. Wave 0: 全Module shadow、ownership／cycle／reproducibility測定。公開しない。
2. Wave 1: `helix-core`、`helix-verification`、`helix-github-ops` RC。
3. Wave 2: `helix-workflow`、`helix-ci`、`helix-reverse-recovery`。
4. Wave 3: frozen baselineとのparity後に`helix-lite` RC。
5. Wave 4: #292／#1017／#176／#290後にRequirements／Design Preview。
6. Wave 5: System Synthesisと3実案件dogfood後にRefactoring Preview。
7. Wave 6: Resident Lane、security、72時間soak後にRuntime／Autonomous／Full。
8. Wave 7: #1161〜#1166後にDeployment／Operations／Maintenance／Diagnosis shadow、#1167のHELIX dogfoodと
   rollback／redeployment／health observation成立後に`helix-lifecycle-ops` Preview。

各waveのrequirements正本化とlocal shadow buildはremote publish許可ではない。tag、release、cutoverは現行release policyと
credential target authorityへ従う。

## Release後ライフサイクル拡張

| 順序 | Issue | 責務 | 前提 |
|---:|---:|---|---|
| 14 | #1160 | OPS L3↔L10正本／release統合 | #1073 |
| 15 | #1161 | 型付きlifecycle schema／状態機械 | #1160 |
| 16 | #1162 | provider中立の配備／rollback planner | #1161 |
| 17 | #1163 | 観測／incident／SLO projection | #1162 |
| 18 | #1164 | 保守義務scheduler | #1163 |
| 19 | #1165 | 症状から変更箇所への診断trace | #1164 |
| 20 | #1166 | environment adapter／secret正本 | #1165、#679 |
| 21 | #1167 | Module所有権／Bundle／HELIX lifecycle E2E | #1166、#1079〜#1086 |

OPS系はRLS implementationへ便乗させない。RLSはartifact compositionとpromotionを所有し、OPSはenvironment state、operation、
maintenance、diagnosisを所有する。#1167だけが両者のcontractをE2Eで接続する。
