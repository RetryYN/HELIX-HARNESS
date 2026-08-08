---
title: "HELIX L5 詳細設計 — Design Registry と要求から受入までの trace"
layer: L5
kind: add-design
status: draft
created: 2026-08-07
updated: 2026-08-07
owner: Claude / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
design_slice: HDS-DRG-01
related_l3: docs/design/helix/L3-requirements/ai-vision-design-harness-engine.md
related_l4: docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
pair_artifact: docs/test-design/helix/L5-design-registry-integration-test-design.md
next_pair_freeze: L8
requirements:
  - VDH-FR-002
  - VDH-FR-008
  - HR-FR-DHR-001
  - HR-FR-DHR-006
github_issue_id: 177
---

# HELIX L5 詳細設計 — Design Registry と要求から受入までの trace

## §0 適用境界と工程順

Design Registry は requirement、screen、flow、interaction、state、component、design token、
content、analytics event、service、domain object、acceptance を stable ID で結ぶ単一 registry で
あり、`screen→interaction→permission→command→API→domain event→analytics event→acceptance` の
trace chain（終端は acceptance test）の orphan を 0 にする（primary: HR-FR-DHR-001/006、VDH-FR-002/008）。
semantic ID 原則 VDH-FR-003 は #209、chain 追跡 HR-FR-DHR-003 は #210 を primary owner とし、
本設計は relation 定義の consumer trace のみを保持する（primary 分母へ重複加算しない）。

- route: `forward_full_v` 上の `frontend_design`（L3↔L10）と `screen_design`（L2↔L11）が生成した
  成果物 entity を registry が束ね、backend 由来は `design_bottomup` の screen 抽出出力
  （`src/workflow/design-elicitation.ts` の screen 型）から同じ intake schema で合流する。
- 主キーは semantic ID であり、class 名や file path を主キーにしない（VDH-FR-003）。
  path/class 名だけの trace は fail-close する。
- owner 分離（#257）: Design Registry は node/edge/version/authority/stale の「結び」に専念する。
  drift 判定の実行は #211、evidence 保管は Evidence Ledger、modality intake は Canonical Design IR の
  owner とし、primary owner の重複を 0 にする。

## §1 componentとauthority

| component | 責務 | write authority |
|---|---|---|
| RegistryCanonicalizer | raw entity/edge 宣言を stable sort・dedup し typed node/edge へ正規化 | なし（pure） |
| RegistryGraphValidator | ID 形式・kind 整合・chain orphan・重複 ID・孤立 edge・revision 整合・親グラフ喪失を fail-close 判定 | なし（pure） |
| RegistryTraceQuery | requirement→…→acceptance の双方向 trace と orphan 集合の決定的算出 | なし（pure） |
| RegistryTransaction（Node） | node/edge/version の append と stale 遷移を単一 transaction で commit | 唯一の registry write authority |

既存資産の再利用（重複新設の禁止）:

- HIL family の requirement/acceptance ノードは `src/requirements/requirement-ir-shadow.ts` の
  既存 regex（`HIL-*` / `HAC-HIL-*`）を typed consumer として参照し、ID 空間を複製しない。
  VDH / DHR family（`VDH-FR-\d{3}` / `VDH-AC-\d{3}` / `HR-FR-DHR-\d{3}`）には既存 regex が
  存在しないため、registry 側で family 別 regex を新設して正本とする（shadow 側への逆輸入は
  後続 PLAN の判断とし、二重定義になった時点で shadow 側を正本へ昇格する）。
- screen ノードは `screens`/`screen_trace`（`src/schema/harness-db-tables-evaluation.ts`）を
  正本供給源として吸収し、別の screen 台帳を新設しない。
- projection rebuild・sanitization invariant は `src/lint/relation-graph.ts` のパターンを流用する
  （ただし relation graph は file 粒度、registry は entity 粒度であり、kind enum と table は分離する）。

## §2 永続schema

| table | PK | 制約 | 主要列 | 状態 |
|---|---|---|---|---|
| `design_registry_nodes` | `entity_id` | `kind,entity_id` unique、ID regex を kind 別に強制 | kind、atom_role、revision、status、semantic_digest、authority、source_pointer | `shadow,canonical,stale,retired` |
| `design_registry_edges` | `edge_id` | `from_entity_id,to_entity_id,relation` の組を unique 制約とする | relation、revision、semantic_digest、authority | 状態は `shadow,canonical,stale,retired` |
| `design_registry_versions` | `version_id` | `entity_id,revision` の組を unique 制約とする | semantic_digest、supersedes_revision、recorded_at | 追記専用（append-only） |
| `design_registry_heads` | `head_id`（=current） | 単一行 | registry_head、updated_at | CAS |
| `design_registry_operations` | `operation_id` | `operation_digest` unique、追記専用 | operation_digest、before/after head、receipt payload | idempotency / audit 正本 |

commit の idempotency は `design_registry_operations` を DB 正本とする（operation_id PK +
operation_digest unique。将来 revision 更新が UPDATE ベースになっても冪等性検出を失わない）。
node/edge の PK（entity_id / edge_id）は本 slice 時点では **genesis commit（entity ごとに 1 回）
のみを許容**し、revision 更新の write 経路（UPDATE + versions 追記 + stale 遷移）は
後続スライスで別途設計する（正当な revision-bump も現 store では fail-close される、
これは意図した暫定 scope である）。

stable ID 規約（kind 別 prefix、`^[A-Z]{3}-[a-z0-9][a-z0-9-]*$` を基本形とし kind と prefix の一致を強制）:
`SCR-`＝screen（画面）、`FLW-`＝flow（フロー）、`INT-`＝interaction（操作）、`STA-`＝state（状態）、
`CMP-`＝component（部品）、`TOK-`＝design_token、`CNT-`＝content（文言）、`AEV-`＝analytics_event（計測）、
`SVC-`＝service、`DOM-`＝domain_object（領域概念）。既存 `screens` 台帳の `screen_id`（`PM-01` 等）は `SCR-` 形式へ
`SCR-<screen_id を小文字化>`（例 `SCR-pm-01`）で決定的に採番し、元 ID を `source_pointer` へ保持する。
requirement/acceptance は family 別 regex
（HIL family = `requirement-ir-shadow.ts` の既存規約、VDH/DHR family = 本設計で新設する
`^VDH-FR-\d{3}$` / `^VDH-AC-\d{3}$` / `^HR-FR-DHR-\d{3}$`）で検査し、これ以外の新形式を発行しない。

relation enum（HR-FR-DHR-003 + VDH-FR-008 の chain を被覆する exact set）:
`decomposes_to`（要求→画面/フロー）、`presents`（画面→操作）、
`guarded_by`（操作→service[role=permission]）、`invokes`（service[permission]→service[command]、
service[command]→service[api] の直列 2 段）、`emits`（service[api]→domain_object）、
`measures`（domain_object/操作→analytics_event）、`accepted_by`（chain 終端→acceptance test）、
`binds`（component/token/content→画面/操作）、`parents`（要求原子の親グラフ、HR-FR-DHR-006）。
service ノードは `service_role`（`permission|command|api`）discriminator を持ち、
HR-FR-DHR-003 の permission→command→API 直列性を edge 型で強制する。permission を経ない
`invokes` 到達は `DRG_UNGUARDED_INVOKE` で fail-close する。

要求原子の親グラフ（HR-FR-DHR-006）: requirement kind のノードは `atom_role`
（`user_task | business_outcome | scenario | context | success_result | decision_rationale`、対象外は null）を
持ち、SCR/FLW/INT は `parents` edge で user_task と business_outcome の両原子へ到達しなければ
ならない。user_task 原子は scenario / context / success_result / decision_rationale の 4 原子を
`parents` edge（原子間）で保持し、いずれかを失うと `DRG_PARENT_LOST` とする（過剰原子化の拒否）。

## §3 state、transaction、再entry

- authority は `shadow`（宣言のみ）→ `canonical`（validator green + 昇格 commit）→
  `stale`（上流 revision/digest 差）→ `retired` の一方向とし、
  `src/requirements/requirement-authority.ts` の promotion パターンを踏襲する。
- registry commit は node/edge/version/head を単一 transaction・append 順
  `node -> edge -> version -> head` で書き、期待 head の CAS 不一致・append fault は
  rollback して増分 0 とする（ScreenApplicabilityStore と同じ lock 内 CAS 方式）。
- 再entry: 上流（requirement shadow / screen 台帳 / prototype）の semantic_digest が変わった entity は
  stale へ遷移し、依存 edge を同一 lineage で stale 化する。stale 状態の entity を含む trace は
  orphan 0 判定へ算入しない（fail-close）。

## §4 evidenceと非scope

- 検証 evidence（validator/query の実行結果 digest）は registry 自身に持たず Evidence Ledger 側へ
  委ねる（owner 分離）。registry は entity/edge の semantic_digest と revision 履歴だけを保持する。
- 非scope: drift 検出の実行（#211）、frontend binding の写像（#210）、capsule lifecycle（#212）、
  Canonical Design IR の modality intake（#257）。これらは registry の typed consumer である。

## §5 canonical assertion primary表

| HST正本 | 主API | 主U | pre_state | expected_state | failure正本 |
|---|---|---|---|---|---|
| `HST-DRG-001` | RegistryCanonicalizer | `U-DRG-001` | raw宣言 | typed node/edge | `DRG_ID_INVALID` |
| `HST-DRG-002` | RegistryGraphValidator | `U-DRG-002` | typed集合 | validated | `DRG_DUPLICATE_ID` / `DRG_EDGE_ORPHAN` / `DRG_RELATION_INVALID` / `DRG_UNGUARDED_INVOKE` |
| `HST-DRG-003` | RegistryGraphValidator | `U-DRG-003` | validated | chain閉包 | `DRG_CHAIN_ORPHAN` |
| `HST-DRG-004` | RegistryGraphValidator | `U-DRG-004` | validated | 親グラフ保持 | `DRG_PARENT_LOST` |
| `HST-DRG-005` | RegistryTraceQuery | `U-DRG-005` | canonical registry | trace set | `なし（正常系）` |
| `HST-DRG-006` | RegistryTransaction | `U-DRG-006` | shadow | canonical | `DRG_CAS_CONFLICT` |
| `HST-DRG-007` | RegistryTransaction（stale遷移） | `U-DRG-007` | canonical | stale系譜へ遷移 | `DRG_REVISION_MISMATCH` |

## §6 Design Reality Binding契約

本 doc は設計フェーズの正本であり、runtime asset（`src/design/design-registry.ts` 等）は
実装スライス（PLAN-L7-516〜）で生成する。typed failure（`DRG_*`、L6 §型参照）の
executable-oracle 到達性 witness は、実装スライスの test 着地時に本 binding へ追記する。
着地前に到達性を主張しない（空 witness = 未実装の宣言であり、緩和ではない）。

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": [],
  "assets": [],
  "failure_reachability": []
}
```

## §7 freeze条件

L5↔L8 pair は、U-DRG-001〜007 の単体 oracle と IT-DRG-001〜003（intake 合流・trace 閉包・
transaction 往復）の結合 oracle が typed failure・mutation 反例つきで green になるまで draft とする。
要求にない画面・操作の混入（requirement へ decomposes_to edge を持たない SCR/INT ノード）と、
親 User Task / Business Outcome を失う過剰原子化は freeze を block する。
