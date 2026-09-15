---
title: "projection writerの黙示的欠落をfindingへ変換する機能設計"
layer: L6
artifact_type: design
status: draft
created: 2026-09-03
updated: 2026-09-03
owner: Codex / TL
plan: docs/plans/PLAN-RECOVERY-96-projection-finding-observability.md
pair_artifact: docs/test-design/helix/L8-projection-finding-observability-unit-test-design.md
related_l3: docs/design/helix/L3-requirements/system-synthesis-requirements.md
behavior_contract_id: PROJECTION-FINDING-OBSERVABILITY-001
responsibility_owner: projection-finding-observability
github_issue_id: 1440
---

# projection writerの黙示的欠落をfindingへ変換する機能設計

## 1. 位置付けと責務境界

本機能は、confirmedであるSystem Synthesis要求の決定的projection・stable identity・fail-close原則を、
既存projection writerの欠落経路へ適用するRecoveryである。source文書やDBの意味を新設せず、projection処理で
「読み取れなかった」「結合できなかった」「一意性を失った」事実をfindingとして可視化する。

既存の`harness.db` projection writer、rebuild、replay、finding storeを再利用する。新しいDB write authority、
別のcanonicalization、#1397のtransaction boundary変更、Issue自動起票は本設計の責務外である。

## 2. 対象となる黙示的欠落

次の各経路は、成功を返す前に typed finding または明示的な失敗として観測可能でなければならない。

- structured green-command evidenceのmalformed入力を`catch`して黙ってreturnしない。
- PLANの`plan_id`欠落を黙ってskipせず、対象pathと理由をfindingへ記録する。
- model-runの`span_id`を単独キーにせず、run IDとnamespaceしたstable identityで衝突を拒否する。
- JSON parse失敗を`null`だけで表さず、値とparse errorを分離して破損入力をactive projectionへ昇格させない。
- rebuildの依存順を暗黙の呼出順にせず、依存するrow count／join invariantを検査する。
- drive registrationの未初期化・入力不備・内部エラーを同じ`null`へ潰さず、typed reasonを残す。
- source digestが変わったrefactor candidate cacheを再利用せず、同一repo／policyのcache entryへsource digestを束縛して再計算する。
- metadata parse境界のエラーを、全rebuild中断か局所findingかの契約なしに伝播させない。
- rebuild入力のrelation graph（nodes／edges／findings等）をcanonical orderへ正規化し、入力配列の順序が
  graph snapshot／diagram artifact／下流viewのidentityを変えないようにする。

## 3. 機能契約

`PROJECTION-FINDING-OBSERVABILITY-001`は次を不変条件とする。

1. malformed evidence、missing `plan_id`、stable identity collision、parse error、dependency row mismatchを検出し、
   registration reason欠落、cache digest driftは、成功相当の空projectionとして扱わず、明示的に失敗またはfindingへ変換する。
2. findingは既存`findings` schemaの`kind`（failure code）、`subject_id`（projection stageと安定した対象identity）、
   `source`、`status`、`evidence_path`で失敗の種類・対象・source pathを再現可能にする。既存schema外の専用digest／原因本文／
   correlation列はこのRecoveryで追加せず、raw error、transcript、secret、PIIも格納しない。入力digestが必要な証跡は、既存の
   projection event／evidence rowが持つdigestへ別途joinするものとし、findingの空欄化で成功扱いにしない。
3. `stableId("pair-agent-model-run", \`${runId}:${spanId}\`)`相当のnamespaceを使用し、異なるrunの同名spanを
   同一rowへ上書きしない。
4. rebuildとreplayは同じsourceから同じ行集合・finding集合・digestを返し、順序変更mutationをgreenにしない。
   relation graphを含む同値な入力順変更は、canonicalization後の同一projectionとして扱う。
5. malformed metadataを局所findingにする境界は既存のprojection contractと整合させ、#1397のtransaction責務を変更しない。

## 4. 実装順

1. 現行projection writerの黙示的skip／catch／null経路をinventoryする。
2. failure codeとfinding payloadを既存finding schemaへ束縛する。
3. stable identity namespace、typed JSON parse result、cache source digestを実装する。
4. rebuild依存row countとregistration reasonのassertionを追加する。
5. L8 mutation oracle、determinism、replayを通し、current main上でのみRecoveryを終端する。

本設計がdraftの間は、実装済み・Issue終端済みとは主張しない。#1397に属するトランザクション境界の修正は別Recoveryへ分離する。
