---
title: "project-hook authority consumer wiring L6機能設計"
layer: L6
artifact_type: design
status: draft
created: 2026-09-07
updated: 2026-09-07
owner: Codex / TL
plan: docs/plans/PLAN-L7-1614-project-hook-authority-consumer-wiring.md
parent_design: docs/design/helix/L6-function-design/project-hook-authority-resolver.md
pair_artifact: docs/test-design/helix/L7-project-hook-authority-consumer-wiring-unit-test-design.md
---

# project-hook authority consumer接続

## 責務

Control Plane transport envelopeを唯一のexpected authority sourceとして受け、hostの実測値を独立に採取し、既存のproject-hook authority resolverとsurface projectorを一度ずつ通して4つのconsumerへ共有するL6機能である。既存#895のresolver、physical adapter、assignment provider、projectorを再利用し、別のauthorityやlogic forkを作らない。

## データ境界

transport envelopeはexpected root identity、assignment binding、candidate/current HEAD、source material、lifecycle policyと、物理採取だけに使うloader／session／current authorityのlocatorを持つ。locatorをexpected identityやobserved evidenceとして扱わない。observed root、observed HEAD、observed source bytesをenvelopeへ混載しない。

host adapterはexecution rootを実行時のcwdから観測し、loader root、session project root、current authority rootを互いに独立した明示locatorとして解決する。locatorのroot identity、HEAD、source bytesはphysical adapterで独立採取する。さらにexecution rootから実測したGit common dirと、git common dirが持つ一意なremote default symbolic refをhost-owned current authority anchorとし、loader／session／current authority rootのcommon dir不一致、およびcurrent authority HEADとhost anchorの不一致をexpected値との比較前に拒否する。request値をobservedへコピーしない。cwd、env、default file、primary shared treeからauthorityを補完しない。remote default refはauthority内容を補完するsourceではなく、同一repository内のcurrent authority locatorを検証するhost anchorとしてだけ使用する。

## 一回性と共有

`buildProjectHookAuthorityConsumerWiring`がtransport resolutionを一回、`projectProjectHookAuthoritySurfaces`を一回だけ呼ぶ。戻り値は同じreceiptまたはfailureを、次のexact 4 surfaceへcanonical bytesとして投影する。

- `session_start`
- `doctor`
- `status`
- `dispatch`

consumerはprojection済みbytesを読むだけで、resolver、capture、serialization、repair hint、surface固有のauthority fieldを追加しない。

## Dispatch受付判定

明示envelopeがある場合は`admitted_receipt`が存在するときだけdispatchを許可する。resolution failure、invalid envelope、stale root、HEAD差分、source差分、物理identity不一致はadmitted receiptなしで固定failure bytesへ閉じ、dispatchと全write side effectを0にする。

standaloneの`status`／`doctor`はproject-hook authorityについてread-onlyかつunavailableを明示する。standaloneの`session_start`はproject-hook authority executionを開始せず、既存のcoordination-only session event、memory recall、feedback lifecycle、DB projectionは維持する。project-hook authority不在を理由に既存の連絡経路まで停止してはならない。producer未接続のpre-activation期間は、envelope未指定のnative dispatchを従来どおり利用可能に保つが、project-hook authority admittedとは記録しない。transportが明示されresolutionが不成立の場合だけ、同じfailure bytesでprovider起動前に拒否する。

## Consumer接続

CLI native adapterは任意の明示envelope fileを使い、SessionStartはhook inputのtransport envelopeを使う。明示時はprovider process、team、pair-agent、loop等のdispatch開始前にadmissionを確認する。未指定時のrequired activationはproducer不在のため本sliceでは行わない。旧#1620のL7↔L8設計をコピーせず、本設計はcanonical L6、検証はL7 pairへ束縛する。

current authorityのhost anchorは特定の`origin/main`へ固定しない。実行repositoryのgit common dirが持つremote default symbolic refを独立観測し、一意な1件だけを採用する。default refが欠落または複数の場合は`project_hook_source_stale_or_foreign`の`/authority_input`・`authority_input_unavailable`、一意なanchor HEADとcurrent authority HEADが異なる場合は同codeの`/current_authority_anchor`として区別する。

## 受入境界

本設計はconsumer接続のpre-activationとtargeted testまでを対象とする。Control Plane producer、operator projection、required activation、provider API変更、旧engineの物理削除、commit／push／PR／GitHub writeは対象外である。producer E2Eなしに既存dispatchを停止しない。

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": [
    "schema_invalid",
    "project_hook_source_stale_or_foreign",
    "project_hook_authority_not_admitted"
  ],
  "assets": [
    "src/runtime/project-hook-authority-envelope.ts",
    "src/runtime/project-hook-authority-consumer.ts",
    "tests/project-hook-authority-envelope.test.ts",
    "tests/cli-surface.test.ts"
  ],
  "failure_reachability": [
    {
      "failure_code": "schema_invalid",
      "oracle_id": "U-CNWHOOKENV-007",
      "test_path": "tests/project-hook-authority-envelope.test.ts"
    },
    {
      "failure_code": "project_hook_source_stale_or_foreign",
      "oracle_id": "U-CNWHOOKENV-003c",
      "test_path": "tests/project-hook-authority-envelope.test.ts"
    },
    {
      "failure_code": "project_hook_authority_not_admitted",
      "oracle_id": "U-CNHOOKWIRE-002",
      "test_path": "tests/project-hook-authority-envelope.test.ts"
    }
  ]
}
```
