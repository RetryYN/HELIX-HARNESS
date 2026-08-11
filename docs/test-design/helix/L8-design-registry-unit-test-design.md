---
title: "Design Registry 単体テスト設計（L8実行正本）"
layer: L8
sub_doc: unit-test-design
artifact_type: test_design
executed_at_layer: L7
kind: add-design
status: draft
created: 2026-08-08
updated: 2026-08-08
owner: QA
pair_artifact: docs/design/helix/L6-function-design/design-registry.md
pair_freeze_exempt: true
pair_freeze_exempt_kind: cross_layer_meta
pair_freeze_exempt_reason: "PLAN-L7-516 以降（#177）の実装スライス群が共有する L8 具体化正本。canonical な pair chain（L6 design ↔ L6-design-registry-unit-test-design.md）が pair_artifact slot を専有しているため、本 doc は L6 設計への cross-layer 補助 binding として module 単位 1 件だけ pair-freeze 対象外とする（#175 の L8 共有正本と同型、PLAN 毎の exemption 増殖はしない）"
github_issue_id: 177
---

# Design Registry 単体テスト設計（L8実行正本）

L6機能設計 `docs/design/helix/L6-function-design/design-registry.md` §0-§2 と
L6単体テスト設計 `docs/test-design/helix/L6-design-registry-unit-test-design.md` の
U-DRG 行を L8 で具体化する。test citation は各実装 PLAN が確定する。
スライス構成は L6 §3（純関数群 → 取引系 → 永続化 → CLI/lint 表面）に従い、
本書には着地済みスライスの oracle 行のみを登録する（未着地 oracle の先行登録はしない）。

## スライス1（PLAN-L7-516: 純関数群）

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-DRG-001 | `canonicalizeRegistryDeclaration` | kind 別 ID regex 逸脱（prefix 不一致・大文字混入・path 主キー `src/x.ts`・class 名 `FooBar`）を `DRG_ID_INVALID` で fail-close。順序違い同義入力の semantic_digest 同値、同一要素 dedup。regex 判定・digest 正規化のいずれを外す mutation も red で kill する | `tests/design-registry-canonicalize.test.ts` |
| U-DRG-002 | `validateRegistryGraph` | 重複 entity_id=`DRG_DUPLICATE_ID`、片端欠落 edge=`DRG_EDGE_ORPHAN`、adjacency 表外の kind×relation=`DRG_RELATION_INVALID`、permission を経ない invokes（interaction→command 直結・段飛ばし）=`DRG_UNGUARDED_INVOKE`。判定分岐のいずれを外す mutation も該当 fixture が red で kill する | `tests/design-registry-graph.test.ts` |
| U-DRG-003 | `computeTraceClosure` | 完備 chain（requirement→screen→interaction→permission→command→api→domain_object→analytics_event→acceptance）は closed。1 edge 欠落で `DRG_CHAIN_ORPHAN` として break 点を全列挙し、stale entity を含む chain は closed へ算入しない。orphan 列挙・stale 遮断のいずれを外す mutation も red で kill する | `tests/design-registry-closure.test.ts` |
| U-DRG-004 | `validateParentGraph` | SCR/FLW/INT から user_task / business_outcome いずれかへの parents 到達欠落、user_task 原子の 4 原子（scenario/context/success_result/decision_rationale）欠落は `DRG_PARENT_LOST`（HR-FR-DHR-006 の 6 原子被覆）。到達判定・4 原子判定のいずれを外す mutation も red で kill する | `tests/design-registry-parents.test.ts` |
| U-DRG-005 | `queryTrace` | 起点からの双方向 trace が決定的同値（2 回実行で deep-equal）。stale/retired を経由する到達は stale mark つきで返り、未知 entity_id は `DRG_ID_INVALID`。方向・stale mark・決定性のいずれを壊す mutation も red で kill する | `tests/design-registry-trace.test.ts` |

## スライス2（PLAN-L7-517: 取引系）

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-DRG-006 | `buildRegistryCommit` → `commitRegistry` | append 順（node→edge→version→head）改変・write_set/operation digest 改変・期待 head CAS 不一致・同一 operation の二重 commit は増分 0 の typed failure。正常系は atomic commit で head 前進し receipt に before/after head と挿入件数を bind。build の同義入力は同 operation_digest。判定分岐（digest 再計算・CAS・二重 commit 検査・append fault rollback）のいずれを外す mutation も該当 fixture が red で kill する | `tests/design-registry-commit.test.ts` |
| U-DRG-007 | `markStaleLineage` | 上流 digest 差の entity と依存 edge が同一 lineage_id で stale 化され、下流到達 entity も lineage へ算入。同一入力再送は決定的同値（増分 0）。未知 entity_id は `DRG_ID_INVALID`。lineage 伝播・決定性のいずれを外す mutation も red で kill する | `tests/design-registry-stale.test.ts` |

## スライス3（PLAN-L7-518: SQLite store）

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-DRG-008 | `SqliteDesignRegistryStore` | in-memory 契約と同一の意味論を harness.db 上で満たす: 期待 head CAS 不一致・同一 write-set 再送（PK/unique 制約の DB 正本判定）・内容 tamper（commitRegistry 再検証）・append fault・BEGIN 失敗・lock 内 CAS 競合・未 seed heads はすべて typed failure で行増分 0、正常系は BEGIN IMMEDIATE 単一 transaction の append 順 commit で head 前進。CAS の WHERE 条件・ROLLBACK・fail-close のいずれを外す mutation も該当 fixture が red で kill する | `tests/design-registry-store-sqlite.test.ts` |

## スライス4（PLAN-L7-519: CLI 読み取り表面）

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-DRG-009 | `helix registry status` / `helix registry operations` | read helper（readDesignRegistryStatus / listDesignRegistryOperations）が store 書込内容（head / row counts / operations 台帳）と一致して返り、CLI は schema_version=registry-cli.v1 + source_command 付き JSON を exit 0 で返す。table 欠落 db は helper throw（CLI typed error 経路の入口）、空 DB は空状態（fail-safe read）、limit<=0/非整数は空。read 経路に write を混ぜる mutation・schema_version/source_command を欠く mutation は red で kill する | `tests/design-registry-cli.test.ts` |

## スライス5（PLAN-L7-528: authority 遷移の永続化）

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-DRG-010 | `buildAuthorityTransition` → `applyAuthorityTransition` | genesis 済み entity の revision bump（version 行 1:1 採番、`from_revision`/`to_revision` 束縛）と lineage 由来の stale 遷移（revision 据え置き・version 行なし）を決定的に組み立てる。未知 entity=`DRG_ID_INVALID`、revision が current+1 でない（据え置き・飛び越し）=`DRG_REVISION_MISMATCH`、entity identity（kind/atom_role/service_role）すり替え=`DRG_REVISION_MISMATCH`、`retired` からの離脱=`DRG_REVISION_MISMATCH`、semantic_digest の masked mutation=`DRG_STALE_INPUT`、next_nodes 内重複=`DRG_DUPLICATE_ID`、変化 0 の空遷移=`DRG_STALE_INPUT`、lineage が指す未知 entity/edge=`DRG_ID_INVALID`。in-memory store は期待 head CAS 不一致・二重 operation・bundle 改変・行 CAS 不一致で増分 0。digest 再導出・行 CAS・空遷移拒否のいずれを外す mutation も red で kill する | `tests/design-registry-authority-transition.test.ts` |
| U-DRG-010b | in-memory reference store の `commitAuthorityTransition` | slice2 store と同一の意味契約を遷移経路へ延長する: 正常系は node revision が前進し version 行が増え head が前進、期待 head CAS 不一致・同一 operation の二重適用・bundle の masked mutation（`to_revision` 改変）はすべて typed failure で増分 0。行 CAS（from_revision / from_authority）・二重 operation 検査のいずれを外す mutation も red で kill する | `tests/design-registry-authority-transition.test.ts` |
| U-DRG-011 | `SqliteDesignRegistryStore.commitAuthorityTransition` | UPDATE 経路で nodes の行数を増やさず revision が前進し versions が 1 行増える。stale 遷移は edges の authority まで永続化する。**行 CAS の反例は新規 seed 済み DB で 1 要因ずつ分離して当てる**（同一 DB 上で連続実行すると先行遷移が動かした authority/revision が別要因の CAS 不一致を生み、node 側と edge 側が互いを覆い隠して分岐を特定できない。旧 oracle は version_id の UNIQUE 制約違反が先に発火し行 CAS 分岐へ到達していなかった）: (a) DB 側 revision だけを外から進めた entity への revision bump = node 行 CAS、(b) edge の revision だけを外から進めた stale 遷移 = edge 行 CAS、(c) identity（kind）を変えた graph から**整合的に組み直した** bundle、(d) edge revision を偽装した bundle — (c)/(d) は bundle 内部が自己整合するため apply 層では判別できず、DB 実態との行 CAS だけが遮断する。加えて BEGIN 失敗・apply fault（versions / nodes / edges）・lock 内 head CAS 競合も typed failure で行増分 0。revision 列は TEXT affinity のため十進正準表現（`'1'`/`'2'`）で書込・比較を揃え、number 直 bind による `'1.0'` 分裂を作らない。`changed.changes !== 1` の node/edge 各判定、identity 列の WHERE、edge revision の WHERE、ROLLBACK、revision 正準化のいずれを外す mutation も red で kill する | `tests/design-registry-authority-transition.test.ts` |

## スライス6（PLAN-L7-529: SCR intake）

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-DRG-012 | `canonicalizeScreenEntityId` / `buildScreenIntake` / `assertScreenIntakeComplete` | 台帳 `screen_id`（`PM-01`）→ `SCR-pm-01` の決定的採番と、元 ID の `source_pointer`（`screens:PM-01`）保持による復元経路。生成ノードは `authority=shadow`（intake が canonical を名乗らない）で `validateRegistryGraph` を通過する（別 schema を新設していない担保）。**登録済み requirement family の trace だけが `decomposes_to` edge になり、未登録 family（`BR-01` / `FR-L1-01` / `UX-02` 等）は edge を捏造せず `unmapped_requirements` へ全件列挙して `trace_intake_complete=false` を宣言する**。反例: 重複 screen_id=`DRG_DUPLICATE_ID`、**大文字小文字違いで同一 `SCR-` id へ畳まれる screen_id**=`DRG_DUPLICATE_ID`（採番が畳む以上、衝突判定も畳んだ後の値で行う）、正準化不能 ID=`DRG_ID_INVALID`、台帳に無い screen を指す trace=`DRG_EDGE_ORPHAN`（silent drop しない）、**同一 (requirement, screen) 対の trace 二重登録**=`DRG_DUPLICATE_ID`（edge_id 衝突を silent に重複配列で返さない）、空台帳=`DRG_STALE_INPUT`、未知 relation=edge 0 かつ `relation_unmapped`。同義入力（順序違い）は同一 `intake_digest`。捏造防止・全件列挙・complete 判定のいずれを外す mutation も red で kill する | `tests/design-registry-screen-intake.test.ts` |
| U-DRG-012b | `loadScreenIntakeInputs` | 読み取りは既存台帳（`screens` / `screen_trace`）だけを source とし、registry 側 table へ write しない（複製台帳の新設なし。読み取り後 `design_registry_nodes` は 0 行）。列の型が台帳 schema と乖離した場合（例 `name` が NULL）は silent な空文字ではなく throw で顕在化する。write を混ぜる mutation・shape check を外す mutation は red で kill する | `tests/design-registry-screen-intake.test.ts` |
| U-DRG-012c | 実 repo 台帳に対する reality fence | 実 `harness.db` を read-only で当て、fixture では見えない現実の形を固定する。件数は台帳更新で動くため pin せず構造不変条件のみ検査する: 全 screen が SCR ノードへ写る、`trace_edges + unmapped == traces` 総数（silent drop 0）、reason は enum の値のみ、`trace_intake_complete` と `assertScreenIntakeComplete` の判定が常に一致する（片方だけ green になる経路を作らない）。台帳が無い / 空の環境では生の return ではなく **skip として可視化**する（「検査した green」と見分けが付かない経路を作らない） | `tests/design-registry-screen-intake.test.ts` |

## スライス7（PLAN-L7-530: public command 例外）

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-DRG-013 | `validateRegistryGraph(decl, policy)` の public command 例外 | 既定 policy（`public_commands: []`）では interaction→command 直結を従来どおり `DRG_UNGUARDED_INVOKE` で拒否する。明示宣言した command への **interaction からの invokes 直結だけ** が通り、api→command の逆流・screen からの直結・`guarded_by` での到達・interaction→api の段飛ばしはいずれも通らない。反例: 宣言 entity がグラフに無い（腐った allowlist）=`DRG_STALE_INPUT`、command 以外（permission / api / 非 service）の宣言=`DRG_STALE_INPUT`、重複宣言=`DRG_DUPLICATE_ID`、rationale / authority_ref が空の無根拠宣言=`DRG_STALE_INPUT`、policy schema_version 逸脱=`DRG_ID_INVALID`。permission 経由の正常 chain は宣言の有無に関わらず通る（例外が既存経路を壊さない）。relation 判定・from.kind 判定・allowlist 参照・role 検査・根拠必須・重複検出の各 mutation は red で kill する。stale 検出（宣言先が存在しない）は role 検査と同じ `DRG_STALE_INPUT` を返す多重防御のため単独無効化では生存し、両方を外す複合 mutation で kill する（意図した非独立性） | `tests/design-registry-public-command.test.ts` |

## requirement catalog の oracle（HR-FR-DHR-007 / 010、PLAN-L7-536）

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-DRC-001 | `buildRequirementCatalog` の正常系 | L1 正本の定義表から BR / UX / FR-L1 を kind つきで抽出し、`source_pointer` で元 doc・元 ID へ復元できる。入力順を変えても `catalog_version` / `source_digest` は同値（順序依存の catalog を作らない）。定義表 section の外にある同形行（`### §1.2` carry note、`### §1.3`、`## §2`）は入らない。section 範囲を広げる mutation は red で kill する | `tests/requirement-catalog.test.ts` |
| U-DRC-002 | 本文中の言及の過剰受理防止 | 定義行は**表セルの強調 ID**（行頭セルが `**BR-01**` の形）に限る。本文の `BR-77` は catalog へ入らない。過剰受理を許すと架空 ID が「実在」になり存在検証そのものが無効化されるため、強調要求を外す mutation は red で kill する | `tests/requirement-catalog.test.ts` |
| U-DRC-003 | section 欠落 | 定義表 section の見出しが無い doc は空集合ではなく `DRC_SECTION_MISSING`。null を空文字へ倒す mutation は red で kill する | `tests/requirement-catalog.test.ts` |
| U-DRC-004 | 抽出 0 件 | section はあるが定義行 0 件は `DRC_EMPTY_EXTRACTION`。判定は **doc 単位**であり、他 doc が非空でも検知する（全体件数だけを見る実装では片方の抽出漏れが silent に通る。mutation 追試で実際に生存した経路であり、反例を追加して塞いだ） | `tests/requirement-catalog.test.ts` |
| U-DRC-005 | 重複・非正準・入力空 | 同一 ID の重複定義=`DRC_DUPLICATE_ID`、`BR-9`（0 埋め欠落）=`DRC_ID_NONCANONICAL`、source 0 件=`DRC_SOURCE_EMPTY` をそれぞれ別 code で区別する。**未知 family（`FR-99` は `FR-L1-` ではない）は非正準ではなく無視**であり、prefix 判定を緩めると「registry が知らない family」と「書き損じ」が同じ失敗へ潰れる（review 是正で prefix 表を単一化した際に生存した mutation。反例を追加して kill 済み）。重複検査・正準形検査・prefix 判定のいずれを外す mutation も red で kill する | `tests/requirement-catalog.test.ts` |
| U-DRC-006 | 実 L1 正本に対する reality fence | 実 `business-requirements.md` / `functional-requirements.md` を読み、実 `screen_trace` が参照する `BR-01` / `UX-02` / `FR-L1-01` が kind つきで実在すること、架空 `BR-99` が入らないことを検査する。件数は正本更新で動くため pin せず、実在性と kind 一致だけを固定する。doc 内容を 1 バイト変えると `source_digest` が変わる（stale catalog の再利用を検知できる） | `tests/requirement-catalog.test.ts` |

## catalog 注入後の intake oracle（HR-FR-DHR-008 / 009、PLAN-L7-537）

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-DRG-014 | `buildScreenIntake` への catalog 注入 | catalog 実在かつ kind 一致の trace だけが `decomposes_to` edge になり、L1 の原 ID がそのまま端点になる（D-1 の着地、再採番なし）。既存 registry family（`VDH-FR-*`）は catalog を経由せず従来どおり通る（後方互換）。`intake_digest` は `catalog_version` / `source_digest` に依存し、edge 集合が同一でも catalog が入れ替われば変わる。既存 family bypass を外す mutation、digest から provenance を落とす mutation はいずれも red で kill する | `tests/design-registry-catalog-intake.test.ts` |
| U-DRG-014b | catalog 不在 | `BR-99` のような catalog 不在 ID は edge を捏造せず `requirement_not_in_catalog` で列挙し `trace_intake_complete=false`。catalog 照合を外す mutation は red で kill する | `tests/design-registry-catalog-intake.test.ts` |
| U-DRG-014c | kind spoofing | catalog に実在する `BR-01` を `requirement_kind="ux"` で参照する trace は edge 化せず `requirement_kind_mismatch`。実在確認だけでは通るため独立 reason で区別する。kind 一致検査を外す mutation は red で kill する | `tests/design-registry-catalog-intake.test.ts` |
| U-DRG-014d | 空 catalog | 空 catalog を「全件不存在」として `ok:true` で成立させない（catalog を空にするだけで fail-close を装える経路を塞ぐ）。`DRG_STALE_INPUT` で intake 自体を失敗させる。空 catalog 検査を外す mutation は red で kill する | `tests/design-registry-catalog-intake.test.ts` |
| U-DRG-014e | provenance 欠落 | `catalog_version` または `source_digest` が空の catalog を受理しない（digest 束縛が無意味になるため）。`DRG_STALE_INPUT`。provenance 検査を外す mutation は red で kill する | `tests/design-registry-catalog-intake.test.ts` |

U-DRG-012 系の既存 oracle は本スライスで挙動が変わる。`loadScreenIntakeInputs` は catalog も読むため、
実 L1 catalog に実在する `BR-01` は edge 化される（従来は unmapped）。捏造していないことの担保は
「catalog に無い ID は edge にならない」（U-DRG-014b）へ移した。

## requirement 端点実在の oracle（HR-FR-DHR-011、PLAN-L7-538）

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-DRG-015 | 端点 node の投入 | edge 化した requirement が `kind=requirement` / `authority=shadow` の node として投入され、`source_pointer` は catalog の値をそのまま持つ。intake 出力単体で `validateRegistryGraph` が ok になる（端点 orphan 0）。requirement node を落とすと `DRG_EDGE_ORPHAN` で fail-close する。node 投入を外す mutation、source_pointer を catalog 由来にしない mutation はいずれも red で kill する | `tests/design-registry-requirement-endpoint.test.ts` |
| U-DRG-015b | grammar と採用条件の分離 | `isRegistryRequirementId` は L1 family（`BR-01` / `UX-02` / `FR-L1-01`）と native family の双方に true。`isRegistryNativeRequirementId` は native のみ true で L1 family には false。intake の bypass に grammar 側を使う mutation、native 判定へ L1 family を混ぜる mutation はいずれも `BR-99` が素通りするため red で kill する（**本 slice で最も守るべき境界**） | `tests/design-registry-requirement-endpoint.test.ts` |
| U-DRG-015c | 未採用 ID を投入しない | catalog に居ても edge 化されていない requirement は node にしない（どの screen からも参照されない requirement を graph へ流し込まない）。catalog 全件を node 化する mutation は red で kill する | `tests/design-registry-requirement-endpoint.test.ts` |

U-DRG-012 系の期待値は本スライスでも動く。`nodes` に requirement 端点が加わるため、
screen ノードだけを期待していた assertion は `kind` で絞る形へ更新した。

## lifecycle fence の oracle（HR-FR-DHR-012、PLAN-L7-539）

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-DRG-016 | 実 repo に対する fence | #257 未到達では撤去対象・恒久要素とも実在して ok。到達後は撤去対象の残存が全件 `retire_target_still_present` になり、message に `#257` を含む。残存検知を外す mutation は red で kill する | `tests/requirement-intake-lifecycle.test.ts` |
| U-DRG-016b | 恒久要素の欠落 | 恒久要素を消した状態は #257 の到達可否によらず `permanent_target_missing`。恒久検査を外す mutation は red で kill する | `tests/requirement-intake-lifecycle.test.ts` |
| U-DRG-016c | 早すぎる撤去 | #257 未到達なのに撤去対象が消えている状態を `retire_target_missing_early` で検知する（片側だけの検査にしない）。同じ状態でも #257 到達後なら違反にならない。早期撤去検知を外す mutation、`replaceable` を `retire` として扱う mutation はいずれも red で kill する | `tests/requirement-intake-lifecycle.test.ts` |
| U-DRG-016d | message の実体 | 実 repo に対する gate が現状 green で、区分ごとの件数（撤去 4 / 置換可能 1 / 恒久 2）を message に含む | `tests/requirement-intake-lifecycle.test.ts` |
| U-DRG-016e | 宣言と言及の区別 | import 行やコメントの言及だけの symbol を実在に数えない（数えると撤去済みの残骸で「まだある」と誤判定し撤去し忘れ検査が空振りする）。宣言 regex を単なる部分一致へ緩める mutation は red で kill する。**この mutation は初回追試で生存した**（実 repo の symbol はすべて宣言済みのため差が出ない）ので、注入 source による反例を追加して塞いだ | `tests/requirement-intake-lifecycle.test.ts` |
| U-DRG-016g | 違反の順序と全件性 | 違反は `symbol` 昇順で全件返す（先頭 1 件で打ち切らない）。sort を外す mutation は red で kill する。**この oracle は reviewer の指摘で追加した**（sort に oracle が無く mutation が生存していた） | `tests/requirement-intake-lifecycle.test.ts` |
| U-DRG-016h | async 宣言 | `export async function` 形も実在として認識する。async 化しただけで「撤去済み」と誤判定しない。宣言 regex から async を落とす mutation は red で kill する。**これも reviewer の指摘で追加した** | `tests/requirement-intake-lifecycle.test.ts` |
| U-DRG-016f | activation probe | probe を実際に置いた一時 repo で `canonicalIrActive` が反転することを固定する。probe 判定を常に false へ倒す mutation は red で kill する。**この mutation も初回追試で生存した**（現状 probe が不在で結果が同じ）ので、一時 repo に probe を作る反例を追加して塞いだ | `tests/requirement-intake-lifecycle.test.ts` |

## 後続スライス（未登録）

HR-FR-DHR-007〜012 は本スライスで全数着地した。`BR-20` / `BR-21` の解決（Issue #530）は
L1 owner の判断であり Design Registry の scope 外。
