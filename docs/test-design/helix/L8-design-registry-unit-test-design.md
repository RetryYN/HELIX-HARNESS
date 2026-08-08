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

## 後続スライス（未登録）

public command（permission 不要）の RegistryPolicyV1 例外判断の oracle 行は実装 PLAN の起票時に本書へ追記する。
`screen_trace` の未登録 requirement family（BR / FR-L1 / UX）を registry ID 空間へどう写すかは
要求側 authority の判断を要するため、本 module の scope 外として `unmapped_requirements` に留める。
