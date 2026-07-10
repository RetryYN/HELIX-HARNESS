---
layer: L6
sub_doc: function-spec
status: confirmed
freeze_blocking: false
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
plan: docs/plans/PLAN-L6-62-harness-memory-structure.md
---

> **L6 contract marker**: memory v2 は v1 JSONL を無変更で読める拡張 schema とし、`takeover` の
> one-shot delivery、type 多様性を守る surface budget、既存 supersede / secret 拒否 / compaction
> 観測不変を同時に満たす。後続L7実装は§8のMEMV2-S1a..S8b（14 subcase）をunit oracleへ降下させる。

# harness memory structure v2 — 機能設計

## §1 目的と境界

handover file を廃止しても情報を失わない受け皿として、現行 memory に type、provenance、lifecycle、
link、短寿命 `takeover` layer を追加する。機械状態の正本は引き続き harness.db であり、memory は
判断・制約・申し送りを保持する補助正本である。feedback lifecycle、runtime への注入経路、handover
撤去そのものはそれぞれ PLAN-L6-63 / L6-64 / L6-61 に委ねる。

## §2 メモリエントリ schema v2

```ts
type MemoryLayer = "harness" | "project" | "takeover";
type MemoryType = "decision" | "constraint" | "feedback" | "state" | "reference";
type MemoryLifecycleState = "active" | "consumed" | "expired";
type MemoryRuntime = "claude" | "codex" | "human" | "system";

interface MemoryEntryV2 {
  schemaVersion: 2;
  id: string;
  layer: MemoryLayer;
  key: string;
  body: string;
  type: MemoryType;
  provenance: {
    planId: string | null;
    sessionId: string | null;
    runtime: MemoryRuntime;
    origin: string;
  };
  lifecycle: {
    state: MemoryLifecycleState;
    expiresAt: string | null;
    consumedAt: string | null;
    consumedBy: string | null;
  };
  links: string[];
  supersedes: string | null;
  createdAt: string;
}
```

### §2.1 公開関数契約

| 関数 | 入出力・副作用契約 |
|---|---|
| `normalizeMemoryEntry(raw, expectedLayer): NormalizeResult` | v1/v2一行をv2 viewへ変換する純関数。`{ok:true,entry}` または `{ok:false,reason:"parse_error"|"schema_invalid"|"layer_mismatch"}`。明示v2をv1へfallbackしない。 |
| `validateMemoryEntry(input, now): ValidationResult` | enum、lifecycle、expiry、link、secretを検査する純関数。失敗はfield付きreasonを返す。 |
| `resolveMemoryView(events, now): MemoryView` | supersede graphを解決し、`activeEntries`、latest terminal `tombstones`、damaged、unresolvedLinksを返す。cycle/未知supersedesはdamagedでfail-close。 |
| `writeMemoryV2(input, deps): WriteMemoryV2Result` | result=`{ok:true,entry,diagnostics}`または`{ok:false,reason}`。validate後、layer lock内で再読→stable id生成→fenced appendする。lock解放後、append成功時だけbody非包含の`memory_write` eventを記録する。event記録失敗はmemory appendをrollbackせず、ok entry + `session_event_persist_failed` diagnosticを返す。 |
| `consumeTakeover(ids, consumerId, deps): ConsumeResult[]` | active takeoverだけにdeterministic tombstoneをappend。reason=`consumed|already_consumed|unknown_id|expired|wrong_layer|persist_failed`。同じtargetへの再実行はappendしない。 |
| `expireMemory(layer, now, deps): ExpireResult[]` | cross-process lock内で再読し、期限到達active entryごとにdeterministic expired tombstoneを最大1件appendする。surface/delivery/compactionの前処理。 |
| `surfaceMemoryV2(input, deps): SurfaceResult` | normalized viewを§5の決定論で選び、render lines、selected ids、hidden/lifecycle集計を返す純選定。consumeは行わない。 |
| `deliverTakeover(input, deps): DeliveryResult` | `surfaceMemoryV2`→stdout writer成功→`consumeTakeover`の順。stdout失敗時はconsume禁止。consume append失敗時は`delivered_with_retry_required`としてidを返し、次回再表示を許す。 |
| `compactMemoryV2(input, deps): CompactMemoryV2Result` | layer lock内で再読→temp write→fsync→fenced atomic replaceまで保持し、v2 event fileをactive entry + latest terminal tombstoneへ整理する。前後のnormalized view/lifecycle集計deep equalを検証し、不一致なら置換しない。旧`compactMemory`は変更しない。 |

`MemoryDepsV2`は`now/readEvents/appendEvent/writeSessionEvent/writeOutput/replaceEvents`に加え
`withLayerLock(layer,{timeoutMs,owner},criticalSection)`を注入する。critical sectionは単調増加fencing tokenを受け、
`appendEvent`/`replaceEvents`はcommit直前にcurrent token一致を検証する。stale tokenは副作用ゼロで拒否する。
lockはcross-process exclusive、timeout時は副作用ゼロ、owner/token/取得/更新/解放をauditし、異常終了後はlease
timeoutで回収する。旧holderが回収後に再開しても古いtokenではcommitできない。write/consume/expire/compactの
全mutatorが同じlayer lockを使い、lock内で必ず再readしてからcheck→append/replaceする。

- `key` は layer 内の論理系列、`id` は immutable event identity。更新は新 entry が旧 `id` を
  `supersedes` する append-only 操作であり、in-place update を禁止する。
- `links` は `layer:key` 形式の soft reference。未解決 link は entry を捨てず diagnostics に数える。
- `expiresAt` は ISO-8601 UTC。期限判定は注入された clock の `now >= expiresAt` とし、期限到達時は
  読取 view で `expired` として扱う。物理書換えは compaction 時だけ行う。
- `consumedAt` / `consumedBy` は `state=consumed` のとき必須、それ以外は `null`。`expired` は
  `expiresAt` 必須。矛盾した組合せ、未知 enum、空 `origin`、重複 link は write 時に fail-close する。
- secret / credential / PII-like body の拒否規則は v1 と同じで、metadata に body を迂回して埋め込む
  ことも同じ scanner で拒否する。

## §3 v1 後方互換と正規化

物理 migration は行わず、read boundary で v1 を次の v2 view へ正規化する。

| v1 欠損 field | 既定値 |
|---|---|
| `schemaVersion` | `1` と解釈し、返却 view は `schemaVersion=2` |
| `type` | `reference` |
| `provenance` | `{ planId:null, sessionId:null, runtime:"system", origin:"legacy-v1" }` |
| `lifecycle` | `{ state:"active", expiresAt:null, consumedAt:null, consumedBy:null }` |
| `links` | `[]` |

物理正本は `.helix/memory/{harness,project,takeover}.jsonl` の append-only event file とする。
本 slice では harness.db に memory tableを新設せず、DB rebuildもこのfileを変更しない。statusの機械状態と
memoryが矛盾した場合は§7どおりDBを優先する。新規writeは常にv2とし、schema横断で`id`を解決する。
旧`compactMemory`はPLAN-L6-56とU-MEMC-001のactive-only契約を維持する。v2 event fileは別関数
`compactMemoryV2`だけがactive entry + latest terminal tombstoneへ整理し、前後の`listMemoryV2` /
`surfaceMemoryV2` / `findByKeyV2` / lifecycle集計がdeep equalでなければ適用しない。
破損 v2 を v1 として救済してはならず、明示 `schemaVersion=2` の不正行は damaged として隔離する。

ただし lifecycle terminal event は削除しない。各論理key/target idについてlatestの`consumed|expired`
tombstoneを1件保持し、bodyを空文字へredactしてもidentity、target、時刻、consumer、stateは保持する。
これによりcompaction前後のactive viewだけでなくlifecycle集計もdeep equalになる。audit logは補助証跡であり
read sourceにはせず、JSONL tombstoneを唯一の集計正本とする。

### §3.1 TypeScript API互換 adapter

- 既存 `writeMemory(input, deps)` / `listMemory(layer,deps)` / `surfaceMemory(deps,budget)` は存置し、
  v2 coreへのadapterとする。既存2 layer、返値`string[]`、既定`maxEntries=12`、entryごとの
  `maxBodyChars=240`を維持する。
- 新契約は `writeMemoryV2` / `listMemoryV2` / `surfaceMemoryV2` と別名で導入する。
  旧 `maxBodyChars` はentry body clip、新 `maxChars` はrender全体budgetで同時適用する。
  v2 APIに両方がある場合はbodyを`maxBodyChars`でclipした後、全体`maxChars`へ収める。
- `MemoryDeps` は破壊変更せず、`MemoryDepsV2 extends MemoryDeps` とする。旧depsはharness/projectの
  v1 adapterだけで利用可能、takeover/v2 lifecycle APIにはV2 depsを必須とする。

## §4 takeover layer と delivery lifecycle

- `takeover` へ書ける type は `decision | constraint | state`。`feedback | reference` は長寿命層か
  feedback lifecycle を使わせ、write を拒否する。
- `expiresAt` は必須で、policy 上限は作成時から 7 日。無期限・過去時刻・上限超過は拒否する。
- active takeover は surface の最優先 group とする。render 成功後、各 entry を supersede する
  `state=consumed` entry を append し、次回 surface から除く。
- JSONL append と stdout を単一 transaction にできないため delivery は **at-least-once** とする。
  append 失敗時は consumed と主張せず、次回再表示する。各表示に immutable `id` を含め、consumer は
  重複排除できる。情報消失を避けるため at-most-once を偽装しない。
- `consumeTakeover(ids, consumerId)` は active takeover だけを遷移できる。同じ id の再 consume は
  idempotent success、未知 id / takeover 外 / expired は結果理由付き no-op とし別 entry を壊さない。
- consumed tombstone id は `takeover-consumed:<target-id>` のstable idとし、`supersedes=target-id`を持つ。
  file lock下で「既存tombstone確認→append」を行い、同時consumeでもtargetあたり1件だけ残す。lock取得失敗は
  `persist_failed`で、consume済みと主張しない。再consumeは`already_consumed`かつ追記ゼロ。lease回収後の
  stale holderはfencing token不一致でappendを拒否される。
- expired tombstone idは`memory-expired:<target-id>`、`supersedes=target-id`、body空、state=expired、
  expiresAt=target値とする。`expireMemory`がlayer lock内の再読後に最大1件appendする。read viewは未materializeでも
  clockからexpiredと判定するが、deliveryと`compactMemoryV2`は先に`expireMemory`を実行して物理状態を収束させる。

## §5 surface v2

`surfaceMemory({ layers, maxEntries, maxChars, perTypeMin, now })` は次の固定順で決定する。

1. active かつ未期限の entry を normalized view で取得する。
2. layer priority は `takeover > harness > project`、type priority は
   `constraint > decision > state > feedback > reference` とする。
3. `(layer,type)` group ごとに `createdAt desc, id asc` で並べ、round-robin で1件ずつ選ぶ。
   `perTypeMin=1` の既定では、予算内に存在する異なる type を単一 type の大量 entry より先に選ぶ。
4. `maxEntries` と Unicode code point数基準の `maxChars` の両方を超えない。計測対象はheader、entry、
   lifecycle/hidden breadcrumbを含むrender結果全体。先にbreadcrumb用文字数を予約し、1 entryが残余budgetを
   超える場合はentry全体をskipしてhiddenへ数える。metadataを切断しない。0は明示unlimited、負数・非整数は拒否する。
5. hidden 件数を layer/type 別 breadcrumb として返す。期限切れ、consumed、superseded は hidden では
   なく lifecycle 集計へ分離し、active 情報が存在しないと誤認させない。

同一入力・clock・budget は同一選定結果を返す。LLM relevance scoring は使わない。

## §6 write / session event 契約

`helix memory write` は既存 `--layer/--key/--body` に `--type`、provenance、`--expires-at`、複数
`--link` を追加する。既存引数だけの呼出しは layer に応じた安全な既定値で v2 を書くが、`takeover`
だけは type と expiry の明示を必須とする。成功時のみ session log に `memory_write` event を1件記録し、
失敗・dry-run は success event を記録しない。event payload は entry id / layer / type / key のみで body
を含めない。

## §7 不変条件と失敗境界

- v1 の key-based supersede、secret 拒否、決定論 ordering を退行させない。
- `compactMemoryV2`はnormalized observable viewを変えない。takeoverのlatest consumed/expired tombstoneは
  identity/state/count保持のためJSONLに残し、古いbodyだけredactする。`.helix/logs/`は補助auditであり集計に使わない。
- parse / persist / consume の失敗は対象行と理由を diagnostics に残し、別 layer や別 key を巻き込まない。
- memory は harness.db の active PLAN / feedback state を複製しない。矛盾時は DB を優先し、memory の
  stale state は diagnostics として扱う。

## §8 V-pair scenario（L7 unit test-design への降下契約）

| Scenario | 検証 oracle |
|---|---|
| MEMV2-S1a | v1/v2混在JSONLをv2 viewへ正規化しschema横断supersedeを解決。明示不正v2はfallbackしない。 |
| MEMV2-S1b | 旧`surfaceMemory` signature/返値/12件/240文字がv1 fixtureと同値。旧depsでtakeover APIは呼べない。 |
| MEMV2-S2a | 未知enumとlifecycle矛盾をfield付きreasonで拒否。 |
| MEMV2-S2b | body/metadata secret、不正・重複linkを拒否しsoft unresolved linkはdiagnostic保持。 |
| MEMV2-S3 | consumed/expiredを含む`compactMemoryV2`前後でnormalized view/lifecycle集計がdeep equal。concurrent writeは同じlockで直列化され消失しない。旧`compactMemory`はv1 active-only。 |
| MEMV2-S4a | takeoverは許可type + 7日以内expiryのみ受理。`expireMemory`は期限境界でstable tombstoneを1件だけ生成。 |
| MEMV2-S4b | stdout成功後だけconsume。stdout/append各失敗とcrash pointで情報を失わず再表示可能。 |
| MEMV2-S5a | 再consumeは追記ゼロの`already_consumed`、未知/expired/他layerは理由付きno-op。 |
| MEMV2-S5b | 同時consumeでtombstoneがtargetあたり1件。lease回収後に旧holderが再開してもstale fencing tokenで追記ゼロ。 |
| MEMV2-S6 | 単一typeが100件でも別typeを選び、hidden/lifecycle breadcrumbが実数一致。 |
| MEMV2-S7a | entries/code-points境界、breadcrumb予約、oversize skip、0 unlimited、不正値を検証。 |
| MEMV2-S7b | 同一入力/clock/budgetの決定論と`maxBodyChars`→`maxChars` precedenceを検証。 |
| MEMV2-S8a | memory append成功時だけbody非包含の`memory_write` eventを1件記録。 |
| MEMV2-S8b | session event失敗はmemory成功を反転せずdiagnosticを返し、dry-run/validation失敗はeventゼロ。 |

後続 L7 実装 PLAN は上記14 subcaseを`U-MEMV2-*` oracleとtest citationへ同時に具体化する。
