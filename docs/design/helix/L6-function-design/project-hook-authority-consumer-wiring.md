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

# project-hook authority consumer wiring

## 責務

Control Plane transport envelopeを唯一のexpected authority sourceとして受け、hostの実測値を独立に採取し、既存のproject-hook authority resolverとsurface projectorを一度ずつ通して4つのconsumerへ共有するL6機能である。既存#895のresolver、physical adapter、assignment provider、projectorを再利用し、別のauthorityやlogic forkを作らない。

## データ境界

transport envelopeはexpected root identity、assignment binding、candidate/current HEAD、source material、lifecycle policyと、物理採取だけに使うloader／session／current authorityのlocatorを持つ。locatorをexpected identityやobserved evidenceとして扱わない。observed root、observed HEAD、observed source bytesをenvelopeへ混載しない。

host adapterはexecution rootを実行時のcwdから観測し、loader root、session project root、current authority rootを互いに独立した明示locatorとして解決する。locatorのroot identity、HEAD、source bytesはphysical adapterで独立採取する。request値をobservedへコピーしない。cwd、env、remote、default file、primary shared treeからauthorityを補完しない。

## 一回性と共有

`buildProjectHookAuthorityConsumerWiring`がtransport resolutionを一回、`projectProjectHookAuthoritySurfaces`を一回だけ呼ぶ。戻り値は同じreceiptまたはfailureを、次のexact 4 surfaceへcanonical bytesとして投影する。

- `session_start`
- `doctor`
- `status`
- `dispatch`

consumerはprojection済みbytesを読むだけで、resolver、capture、serialization、repair hint、surface固有のauthority fieldを追加しない。

## Dispatch admission

`admitted_receipt`が存在する場合だけdispatchを許可する。resolution failure、invalid envelope、stale root、HEAD差分、source差分、物理identity不一致はadmitted receiptなしで固定failure bytesへ閉じ、dispatchと全write side effectを0にする。

standaloneの`status`／`doctor`はread-onlyかつunavailableを明示する。standaloneのdispatchは`unavailable_no_dispatch`であり、既存providerや旧engineへ暗黙に送らない。

## Consumer wiring

CLI native adapterは明示されたenvelope fileを使い、SessionStartはhook inputのtransport envelopeを使う。実行前にconsumer wiringを構築し、provider process、team、pair-agent、loop等のdispatch開始前にadmissionを確認する。旧#1620のL7↔L8設計をコピーせず、本設計はcanonical L6、検証はL7 pairへ束縛する。

## 受入境界

本設計はconsumer接続のtargeted testまでを対象とする。Control Plane transport自体の新設、provider API変更、旧engineの物理削除、commit／push／PR／GitHub writeは対象外である。
