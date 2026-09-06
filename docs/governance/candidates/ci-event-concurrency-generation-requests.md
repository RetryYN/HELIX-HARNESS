---
title: "CI event-class concurrency generation 要求候補"
status: draft_candidate
canonical_layer: L1
canonical_pair: L12
plan: PLAN-L3-93-ci-event-concurrency-generation
source_issue: 1336
---

# CI event-class concurrency generation 要求候補

## 利用者要求

main merge後の検収、定期監査、手動監査、PR検証を同じ`github.ref`だけで一つの実行世代へ畳み込まず、
それぞれの証明義務を失わずに待ち時間と重複実行を制御できなければならない。

特に、current main HEADのpost-main検収をscheduleまたはmanual safety-netがcancelしてはならない。
一方で、単に全runを並走させてqueue、費用、古い証拠を無制限化してはならない。

## 価値境界

- current canonical HEADのterminal証拠を安定して取得できる。
- stale PR HEADと重複scheduleは、別event classへ影響せずboundedに置換できる。
- cancel、supersede、handoffの理由と対象を後から再構築できる。
- required verificationの削減、cancelled runの成功扱い、別event classの結果流用を高速化として認めない。

本書はIssue #1336を要求候補へ整理したものであり、承認、canonical promotion、runtime有効化、GitHub上の
cancel権限を与えない。
