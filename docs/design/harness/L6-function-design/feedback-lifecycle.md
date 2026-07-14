---
layer: L6
sub_doc: function-spec
status: confirmed
freeze_blocking: false
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
plan: docs/plans/PLAN-L6-63-feedback-lifecycle.md
---

> **L6 contract marker**: feedback lifecycleはsource eventを消さず、canonical source identityと
> semantic generationに対するappend-only transitionで表示状態を導出する。同一generationのterminal
> 状態は再投影でopenへ戻らず、新generationだけが再openできる。§9のFLIFE-S1..S12とL8の
> `U-FLIFE-001..012`を1:1で対にし、後続L7が実装とtest codeへ降下させる。

# feedback lifecycle — 機能設計

## §1 目的と正本境界

`findings` / `quality_signals` / `feedback_events`のsource事実は削除・改変しない。lifecycleのdata SSoTは
`.helix/logs/feedback-lifecycle.jsonl`、harness.dbの`feedback_lifecycle`は再構築可能なprojectionとする。
SessionStart surfaceと`helix feedback`は同じlifecycle viewを必ず通り、`feedback_events`だけにfilterを
掛けてsource直読経路が迂回する実装を禁止する。

件数減少だけを品質証明にしない。gate/actionableが残ること、terminal化の根拠、hidden breadcrumb、
generation衝突diagnosticをgolden fixtureで反証可能にする。

## §2 event envelopeとsource generation

```ts
type FeedbackLifecycleState = "open" | "ack" | "closed" | "superseded";
type FeedbackLifecycleAction = "observed" | "refresh" | "ack" | "close" | "supersede" | "surface";

interface FeedbackLifecycleEventV1 {
  schemaVersion: 1;
  eventId: string;
  operationId: string;
  sourceTable: "findings" | "quality_signals" | "feedback_events";
  sourceId: string;
  activityEpoch: number;
  policyEpoch: number;
  sourceGeneration: string; // `${activityEpoch}.${policyEpoch}`
  sourcePayloadDigest: string;
  sourceBucket: "gate" | "actionable" | "telemetry";
  action: FeedbackLifecycleAction;
  fromState: FeedbackLifecycleState | null;
  toState: FeedbackLifecycleState;
  actor: string;
  reason: string;
  policyVersion: string;
  sessionId: string | null;
  occurredAt: string;
}
```

- source identityはcanonical `sourceTable + sourceId`とする。`feedback_events`は自身のIDを使わず、rowの
  `source_table/source_id`が有効ならupstream identityへalias正規化してからlifecycle lookupする。origin欠落時だけ
  `feedback_events + feedback_event_id`へfallbackしdiagnosticを出す。aliasはfilter前に束ね、一方のack/closeを
  全aliasへ適用する。
- generationは`activityEpoch.policyEpoch`の複合値とする。初回active観測をactivityEpoch 1、
  authoritative full scanでinactive/pass/closedを観測した後の再activeだけを次generationにする。同一active中の
  再投影や通常payload更新ではactivityEpochを増やさず、firstObservedAt/TTLをリセットしない。telemetryから
  gate/actionableへの安全側再分類、または分類policy version変更時だけpolicyEpochを増やして旧generationを
  supersedeする。降格は同generationのままとし、黙ったreopenは禁止する。
- payloadは分類に使うseverity/status/kind/metric/value/threshold/subjectのcanonical JSONをSHA-256化した
  `sourcePayloadDigest`として別保持し、投影時刻、表示順、presentation文言を除く。digest変化は同generationの
  意味driftとして監査するが自動reopenには使わない。`computed_at` / wall clock単独をgenerationに使わない。
- event codecはdigestが64桁hexであることを検証する。current sourceとの意味一致は
  `feedbackSourceIdentity(currentSource)`を再計算するreconcile/selectがstored digestと比較する。
- unknown schema version、不正UTC、空identity、digest不一致、遷移不整合はdamagedとしてfail-closeする。
  damaged lifecycle行をv1として救済せず、対象sourceは黙って隠さずopen表示とdiagnosticを返す。
- `eventId`はoperation intentから決定論生成し、同operationId+同intentは追記ゼロのreplay、異なるintentは拒否する。

## §3 状態機械と権限

| current | action | next | actor / 条件 |
|---|---|---|---|
| 未観測 | observed | open | reconciler。firstObservedAtをevent時刻として固定 |
| open | surface | open | session-log receipt。同一sessionの再表示だけ抑止しlifecycle stateは変更しない |
| open / ack | refresh | 同じstate | 通常payload driftのdigestを更新しack/TTLを無効化しない |
| open | ack | ack | explicit human、またはtelemetry TTL policy |
| open / ack | close | closed | full-source reconcileでsource解消を確認したsystem |
| open / ack | supersede | superseded | 同identityの新generation観測時のsystem |
| ack | surface / ack | ack | surfaceは非表示、ack replayは追記ゼロ |
| closed / superseded | その他 | 不変 | terminal replayは追記ゼロ。不正逆遷移は拒否 |

`surface`は解消・ackを意味しない。gate/actionableは1度表示しただけで次sessionから消してはならない。
同一session内だけsurface receiptで再表示を抑え、次sessionではack/closedまで再表示する。

terminalは`closed|superseded`だけで、ackは未解決だが通常表示から確認済みとして退避した状態である。
automationはgate/actionableをackできず、explicit human commandだけがactive generationをackできる。

同一generationが再投影されてもack/terminal状態を保持する。新generationを観測した場合だけ旧nonterminalを
superseded、新generationをopenにする。closedより古い遅延generation、generation順序を判定できない衝突は
open復活させずdiagnosticを出す。source消失によるcloseは`reconcileMode=full`かつsource scan completeness
markerがある場合だけ許可し、partial rebuildやread失敗でcloseしない。

| source table | 有効条件 | 無効条件 | 全走査marker |
|---|---|---|---|
| `findings` | `status=open` | `status!=open`またはfull scanで不在 | `findings_complete` |
| `quality_signals` | `status=warn|fail` | `status=pass`またはfull scanで不在 | `quality_signals_complete` |
| `feedback_events` fallback | `status=open` | `status!=open`またはfull scanで不在 | `feedback_events_complete` |

absence closeは対象identityのcanonical source table markerが揃う場合だけ行う。alias projectionの不在だけで
upstream identityをcloseしない。

## §4 公開関数契約

### §4.1 DbC / Vペア

| 関数 | 署名 | 事前条件 | 事後条件 | 不変条件 | 判定基準 |
|---|---|---|---|---|---|
| lifecycle journal | `reconcileFeedbackLifecycle(sources, mode, deps) => ReconcileResult` | source identity、scan completeness、operation intentを検証済み | 必要な遷移だけをappendし、同intent replayは追記0 | terminal generationを同世代の再投影でopenへ戻さない | `U-FLIFE-001..005` |
| lifecycle surface | `selectFeedbackWithLifecycle(sources, lifecycle, sessionId, budget) => FeedbackSurface` | sourceとjournalをcanonical aliasへ正規化可能 | lifecycle filter、dedupe、hidden理由を同時に返す | damaged時も未解決sourceを隠さない | `U-FLIFE-006..010` |
| promotion nudge | `memoryPromotionNudge(events) => PromotionNudgeResult` | session eventは有効行だけを入力 | 条件一致時だけdeterministic nudgeを最大1件返す | body、diff、secretを読まずStopをblockしない | `U-FLIFE-011..012` |

| 関数 | 契約 |
|---|---|
| `feedbackSourceIdentity(source)` | upstream aliasを正規化しcanonical identity/bucket/sanitized payload digestを決定論生成 |
| `resolveFeedbackLifecycle(events, now)` | append-only行を検証しidentity+generationごとのstate、firstObservedAt、surface receipt、damagedを返す |
| `reconcileFeedbackLifecycle(sources, mode, deps)` | lock内再読しobserved/supersede/closeを冪等append。partial modeはabsence close禁止 |
| `ackFeedback(input, deps)` | active generationだけack。operation replayは追記ゼロ、terminal/unknown/conflictは理由付きno-opまたは拒否 |
| `autoAckTelemetry(now, deps)` | §5対象だけをlock内で再読しTTL境界でack。失敗項目をack扱いしない |
| `recordFeedbackSurfaces(inputs, deps)` | 同一SessionStartで選択した全source receiptを入力順に依存しない決定論順で検証し、単一lock・単一journal snapshotから必要な`surface` eventだけをappendする。単発`recordFeedbackSurface`と観測可能な結果を一致させ、同一sessionの全refをreceipt化する。失敗は部分的greenにせずreasonをSessionStart diagnosticへ出し、同一operationのretryで不足receiptへ収束する |
| `selectFeedbackWithLifecycle(sources, lifecycle, sessionId, budget)` | source直読とfeedback_events表示の双方に同じfilter/dedupeを適用し、表示/hidden/diagnosticを返す |
| `memoryPromotionNudge(events)` | §7の純判定。session本文/diff/bodyを読まない |

node depsは`.helix/logs/feedback-lifecycle.coordination.sqlite`の`BEGIN IMMEDIATE`をcross-process mutexにし、
JSONL append全byte write+fsync後に成功とする。append後commit不明はoperationIdでJSONLを再読して回収する。
DB projection失敗はsource log成功を巻戻さず、次rebuildで回復する。

`feedback_lifecycle` projectionは`(source_identity,source_generation)`を主key、`last_event_id`をindex化し、
`state,bucket,first_observed_at,last_transition_at,actor,reason,policy_version,payload_digest`を保持し、
`state,bucket` indexを持つ。rebuild checkpointは最後に完全適用したJSONL byte offsetとeventIdを保持するが、
不一致時は先頭から再構築する。
`feedback_lifecycle_health`はdamaged countとcheckpointを保持し、欠落またはdamaged>0なら実surfaceは
非open projectionを信用せず未解決sourceを安全側表示する。

## §5 telemetry期限による自動確認

- lifecycle分類時のbucketが`telemetry`で、state=open、`now - firstObservedAt >= 24h`だけが対象。
- TTL、分類規則、auto actor/reasonを`policyVersion=feedback-lifecycle.v1`としてeventへ固定する。
- gate/actionableは時刻に関係なくauto-ack禁止。telemetry→gate/actionableの安全側再分類はpolicyEpochを
  増やした新generationとしてopenにし、過去のauto-ackを持ち越さない。
- `now`/occurredAtはcanonical UTC。invalid/future firstObservedAt、clock rollbackはackせずdiagnostic。
- 境界直前はopen、境界一致はack。同時sweepと再実行でもgeneration当たりauto-ack eventは最大1件。
- sweep mutationはfail-close、SessionStart表示はfail-open。sweep失敗時は元sourceを表示し続ける。

## §6 表示、重複排除、内訳表示

- lifecycleのack/closed/superseded generationを通常surfaceから除外する。openかつ同一session未surfaceだけ候補。
- source横断重複はcanonical finding fingerprintで畳む。衝突時は最も高いseverity/bucketを保持し、source identity
  全件をtraceに残す。異なる意味を文字列類似だけで統合しない。
- group-first budgetはPLAN-L7-404の契約を維持する。lifecycle filterはgrouping前に適用する。
- breadcrumbは`hiddenByLifecycle`、`hiddenBySessionReceipt`、`hiddenByBudget`をbucket別に分離し、
  actionable不在を偽装しない。damaged/unknown generationはdiagnostic件数を表示する。

## §7 memory昇格通知

session eventに`outcome=ok`の`commit`または`plan_switch`が1件以上あり、`outcome=ok`の`memory_write`が0件の
場合だけ、Stop surfaceへ1行のnon-blocking warningを返す。失敗/dry-run memory writeは抑止根拠にしない。

`memory_promotion_nudge`はsession-logの`SessionEventType`へ追加する。既存session JSONLと`withEventLock`を使い、
`memory-promotion-nudge:<sessionId>`をdeterministic event idとして記録し、
複数Stop・並行Stop・retryでも1件に収束させる。既存nudge eventがあれば再出力しない。壊れたsession行は
無視してfail-openするが、読めた有効eventから判定する。nudgeはmemoryへの自動書込みやsession停止を行わない。

## §8 retentionと可観測性

- lifecycle JSONLはappend-only。通常compactionはlatest stateとterminal根拠を失わない別設計なしに実施しない。
- projectionはevent id、source identity/generation、state、first/last時刻、actor/reason/policyVersionを保持する。
- metricsはopen/ack/closed/superseded、TTL ack、damaged、hidden理由、reopen/new generationをbucket別に出す。
- raw body、diff、credential、PII、provider transcriptをevent/projection/nudgeへ保存しない。
- `sourceId/actor/reason/sessionId`はsecret scannerを通し、sourceId/sessionIdは256、actorは64、reasonは512
  Unicode code point以内とする。超過・secret-like値はtruncateせずwriteを拒否する。
- production routeはSessionStartと`helix feedback list`で`DB source読取→full reconcile→TTL sweep→DB projection
  →lifecycle-aware surface`を同じ順序で通す。明示確認は`helix feedback ack`だけがhuman actorで実行できる。

## §9 Vペアシナリオ

| Scenario | 検証oracle |
|---|---|
| FLIFE-S1 | strict event envelope/UTC/versionと全許可・禁止遷移を検証。破損行は対象を隠さずdiagnostic |
| FLIFE-S2 | 同operation replayは追記ゼロ、異intent衝突は拒否。2 process terminal競合も1event |
| FLIFE-S3 | journal成功/DB projection失敗・commit不明をoperationId再読とrebuildで回復 |
| FLIFE-S4 | same generation terminalは再投影でopen復活しない |
| FLIFE-S5 | authoritative inactive→activeだけgeneration+1。同一active再投影/payload driftはfirstSeen/TTL不変、旧generation操作は新世代を隠さない |
| FLIFE-S6 | telemetryだけ24h-1ms/一致/+1ms境界でauto-ackし、gate/actionable/future clockは対象外 |
| FLIFE-S7 | findings/quality_signals直読とfeedback_events経路が同じlifecycle left join/filterを通る |
| FLIFE-S8 | lifecycle unavailable/破損時は未解決を隠さずruntime fail-open、mutationはfail-close |
| FLIFE-S9 | source横断dedupeでseverityを落とさずacked/TTL/dedupe/cap別breadcrumbを返す |
| FLIFE-S10 | surface receiptは同一sessionだけ抑止し、未ack actionableは次sessionで再表示 |
| FLIFE-S11 | commit/plan_switch成功かつmemory_write成功なしでnudge 1件。並行Stop/retry/破損行でもfail-open |
| FLIFE-S12 | lifecycle/nudgeにbody/diff/secret/PIIを保存せず、状態・hidden理由・damaged metricsを出す |
| FLIFE-S13 | group-firstで多数refを束ねても、receiptは全refへ記録する。batchはlock/journal read/lifecycle resolveを各1回に抑え、同一session replayは追記0、次sessionでは再表示する |
