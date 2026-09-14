---
title: "ScreenApplicabilityGate L8単体テスト設計（PLAN-L7-510/511/512 共有正本）"
layer: L8
sub_doc: unit-test-design
artifact_type: test_design
executed_at_layer: L7
kind: add-design
status: draft
created: 2026-08-07
updated: 2026-08-07
owner: QA
pair_artifact: docs/design/helix/L6-function-design/screen-applicability-prototype.md
pair_freeze_exempt: true
pair_freeze_exempt_kind: cross_layer_meta
pair_freeze_exempt_reason: "PLAN-L7-510/511/512（#175）が共有する L8 具体化正本。canonical な pair chain（L6 design ↔ L6-screen-applicability-prototype-unit-test-design.md）は fixture manifest（layer-ledger-pair-gate-progress-s01）と design-catalog に pin 済みで pair_artifact slot を専有しているため、本 doc は L6 設計への cross-layer 補助 binding として module 単位 1 件だけ pair-freeze 対象外とする（PLAN 毎の exemption 増殖はしない）"
---

# ScreenApplicabilityGate L8単体テスト設計（共有正本）

Issue #175 の実装スライス群（PLAN-L7-510 / L7-511 / L7-512）が共有する L8 単体テスト設計。
L6テスト設計 `L6-screen-applicability-prototype-unit-test-design.md` の U-SAP 行を PLAN 単位で具体化する。
primary U / HST の分母は変更しない（canonical assertion primary 表は L6 テスト設計のまま）。

## §1 slice1（PLAN-L7-510）: 評価器コア（U-SAP-001〜005）

L6設計 `docs/design/helix/L6-function-design/screen-applicability-prototype.md` §0-§1 の型・signature・DbC を
正本とし、write authority を持たない pure evaluator 5 本を対象とする（Issue #175 第1スライス、
L6テスト設計 `L6-screen-applicability-prototype-unit-test-design.md` の U-SAP-001〜005 行の L8 具体化）。
fake clock（trustedNow 文字列注入）と fixed scope fixture を使い、filesystem / DB / browser には触れない。

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-SAP-001 | `canonicalizeScreenScope` | field欠落・unknown capability・absolute locator を typed failure で拒否し、capability 順序違いの同義入力は同一 scope_digest | `tests/screen-scope.test.ts` |
| U-SAP-002 | `evaluateScreenApplicability` | no-UI / UI / free-text / unknown reason を matrix 評価し、free-text・deferred pass・二route同時選択を拒否（route は exactly-one） | `tests/screen-applicability.test.ts` |
| U-SAP-003 | `validateNoUiReceipt` | reason / actor / evidence / reentry / scope / rule / expiry を一件ずつ欠落・改変して valid 0（HIL_SCREEN_SKIP_EVIDENCE_MISSING / HIL_SCREEN_RECEIPT_STALE） | `tests/no-ui-receipt.test.ts` |
| U-SAP-004 | `evaluateScreenReentry` | capability / rule / scope digest の 1 箇所改変で stale + 再判定 task exactly-one、同一入力再送は増分 0（決定的同値） | `tests/screen-reentry.test.ts` |
| U-SAP-005 | `planPrototypeDiscovery` | screen / interaction / state / data obligation の欠落と no-UI route を拒否（task 0）、prototype_required では task exactly-one で義務 digest を全保持 | `tests/prototype-discovery.test.ts` |

U-SAP-006〜012（prototype artifact・walkthrough・agreement・backprop・freeze・stage closure gate・
plan route composition）は後続スライスで L8 化する。本設計は canonical assertion primary 表の分母を
変更しない（primary U/HST は L6 テスト設計のまま）。

## §2 slice2（PLAN-L7-511）: prototype検証 evaluator（U-SAP-006〜009）

L6設計 `docs/design/helix/L6-function-design/screen-applicability-prototype.md` §1-§2 の型・signature・DbC を
正本とし、prototype 検証系 pure evaluator 4 本を対象とする（Issue #175 第2スライス、
L6テスト設計 `L6-screen-applicability-prototype-unit-test-design.md` の U-SAP-006〜009 行の L8 具体化）。
slice1（PLAN-L7-510、本doc §1）と同じく filesystem / clock / DB /
browser には触れず、fixed fixture のみを使う。

walkthrough の iteration 上限は L6/L5 に数値未規定のため、本スライスで module 定数
`WALKTHROUGH_ITERATION_LIMIT` として export し docstring に根拠を明記する（後続 transaction port /
store スライスで policy 化を再検討する申し送り）。

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-SAP-006 | `validatePrototypeArtifact` | static-only（executable_locator / build / startup_command / startup_receipt digest の欠落 = `HIL_PROTOTYPE_NOT_EXECUTABLE`）、screen / interaction / state / data trace の一件ずつ欠落（`HIL_PROTOTYPE_ARTIFACT_INCOMPLETE`）、9 状態を一件ずつ削除・重複（`HIL_PROTOTYPE_STATE_MISSING`）、task 側 field 不正（capability_id / obligation_digest 欠落・非整数 requirement_revision・status=complete への再発行）と manifest_digest 改変で ready 0（L6 §2 の `PrototypeManifestV1` に capability field は無く、receipt への capability bind は task 側検査が唯一の入口）。正常系は 9 状態完備で receipt exactly-one、同義入力は同 receipt_digest | `tests/prototype-artifact.test.ts` |
| U-SAP-007 | `recordWalkthroughIteration` | actor / observation / target（delta 時）の欠落、artifact_revision 不一致、iteration が `WALKTHROUGH_ITERATION_LIMIT` 超過、prior 列の非連続 iteration で receipt 0（`HIL_PROTOTYPE_DELTA_MISSING` / `HIL_WALKTHROUGH_RECEIPT_MISSING`）。rebuild は入力 field ではなく出力 bind（delta 時に rebuilt_artifact_revision = artifact.revision+1）を正常系で検査する。正常系は iteration = prior末尾+1 の receipt exactly-one（上限ちょうどの iteration も成功）、同一入力再送は決定的同値 | `tests/prototype-walkthrough.test.ts` |
| U-SAP-008 | `evaluatePrototypeAgreement` | walkthrough 空（`HIL_PROTOTYPE_WALKTHROUGH_MISSING`）、旧 artifact revision への review、人以外 reviewer（authority_receipt_id 欠落）、verdict=rejected、walkthrough set / review digest 不一致で agreement 0。正常系は latest artifact + 完結 walkthrough + approved review を同 digest へ bind した agreement exactly-one | `tests/prototype-agreement.test.ts` |
| U-SAP-009 | `validateRequirementsBackprop` | delta 未 disposition（artifact_revision>1 なのに revision が previous_revision+1 へ進んでいない）、wrong L1 revision（previous_revision 連鎖不整合）、no_delta 偽装（artifact_revision>1 なのに previous_revision null）で backprop 0（`HIL_PROTOTYPE_BACKPROP_MISSING`）。正常系は delta 経路（revision trace 完備）と純 no_delta 経路（artifact_revision=1 + previous_revision null）で receipt exactly-one | `tests/prototype-backprop.test.ts` |

U-SAP-010〜012（freeze / stage closure gate / plan route composition）と transaction port / store は
後続スライスで L8 化する。本設計は canonical assertion primary 表の分母を変更しない
（primary U / HST は L6 テスト設計のまま）。

## §3 slice3（PLAN-L7-512）: freeze候補生成とplan route合成（U-SAP-010, 012）

L6設計 `docs/design/helix/L6-function-design/screen-applicability-prototype.md` §1-§2 の型・signature・DbC を
正本とし、`evaluateScreenFreeze`（pure candidate 生成）と `aggregatePlanScreenRoute` →
`commitPlanScreenRoute`（composition、port 委譲）を対象とする（Issue #175 第3スライス、
L6テスト設計 U-SAP-010 / U-SAP-012 行の L8 具体化）。U-SAP-011（store / stage closure gate）は
後続スライスで L8 化する。

`ScreenGateReceiptV1` の operation / commit / head 系 field（operation_id 以外の commit_receipt_digest・
before/after_revision・event_head）は、pure candidate 生成の時点では commit 前 placeholder
（空文字列・0）とし、実値の採番は唯一の gate write authority（`commitStageClosureAndGate`、後続スライス）
だけが行う。candidate の operation_id は入力 digest から決定的に導出する。

`commitPlanScreenRoute` の unit テストは L6 §2 `ScreenTransactionPortV1` の in-memory fake（委譲回数と
受領 bundle を記録するだけの test double）を使い、DB / filesystem には触れない。

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-SAP-010 | `evaluateScreenFreeze` | skip/agreement 両欠落（`HIL_SCREEN_GATE_EVIDENCE_MISSING`）、両方同時（`HIL_SCREEN_IMPLICIT_SKIP`）、decision stale（`HIL_SCREEN_DECISION_MISSING`）、route deferred（`HIL_SCREEN_DEFERRED_NOT_CLOSED`）、partial transaction（agreement 有り backprop 無し等の片肺 = `HIL_SCREEN_GATE_EVIDENCE_MISSING`）、scope/decision digest 不一致で passed 0。正常系は no-UI+skip / UI+agreement+backprop の各 exactly-one route で verdict=passed の candidate を決定的生成（commit 系 field は placeholder） | `tests/screen-freeze.test.ts` |
| U-SAP-012 | `aggregatePlanScreenRoute` → `commitPlanScreenRoute` | aggregate 固有: capability ID 欠落/余剰/重複、decision stale/deferred、scope digest 不一致、UI 優先 route（1件でも prototype_required なら plan route も prototype_required）。commit 固有: append_order 改変、write_set_digest 改変、operation_digest 不一致、plan aggregate と decision 集合の不一致、prototype task の UI capability exact set 逸脱、port 受領 receipt の identity 不一致、port fault 透過。全反例で receipt 0・port 委譲 0 回（bundle 検査は委譲前）または fault 透過、正常系は port 委譲 exactly-one で `gate_write_count=0` の receipt | `tests/screen-plan-route.test.ts` |

いずれの API も write authority 0 を維持し、gate payload を bundle へ混入できない型（`PlanScreenRouteCommitBundleV1`
に gate field が存在しない）と `gate_write_count: 0` の型・実測 assert を両方置く。本設計は canonical assertion
primary 表の分母を変更しない（primary U / HST は L6 テスト設計のまま）。

## §4 slice4（PLAN-L7-513）: stage closure store と gate 発行（U-SAP-011）

L6設計 §2/§5 の `ScreenApplicabilityStoreV1` を in-memory reference store として具体化する。
trustedNow は文字列注入とし、head/revision の CAS・append 順
（`stage_completion -> stage_projection -> gate_receipt -> terminal_receipt`）・write-set digest を
決定的に検査する。gate row への write authority は `commitStageClosureAndGate` の成功経路のみ。

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-SAP-011 | `commitStageClosureAndGate` | current plan route 不在/head 不一致、no-UI 三者（decision/skip/completion）identity 不一致、skip authority の stale/superseded、UI agreement/backprop authority の receipt ID/digest/current head/canonical bytes 改変、trustedNow freshness 超過、requirement revision 連鎖不整合、分母集合の欠落/余剰/重複、write_set/operation digest 改変、同 operation の二重 gate、append 順逆転、CAS 不一致で stage/gate 増分 0（typed failure）。正常系は stage closure と gate receipt を同一 operation で atomic commit し、before/after head と write-set digest を receipt へ bind する | `tests/screen-stage-closure-gate.test.ts` |
## §5 永続化スライスA（PLAN-L7-514）: SQLite-backed store の共有 contract（U-SAP-011）

slice4 の U-SAP-011 oracle 36 件を store factory 差し替え（in-memory / SQLite）で共有し、
同一の build 前/後 tamper mutation を SQLite 経路でも機械検査する。SQLite 固有の反例として
append fault 注入時の transaction rollback（stage/gate/completion 全行の増分 0）を追加する。
schema 登録は既存 DSL（単一列 PK + unique index）に従い、FK / partial unique 相当の制約は
store 検証（アプリ層）で担保する。

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-SAPDB-001 | `SqliteScreenApplicabilityStore.commitStageClosureAndGate` | §4 の全 mutation を SQLite 実装へ適用（共有 contract）。加えて append fault 注入で transaction rollback し全行増分 0、再 open 後も head/rows が commit 前と同一 | `tests/screen-store-sqlite.test.ts` |
## §6 スライスB（PLAN-L7-515）: CLI 読み取り表面（U-SAPCLI-001）

`helix screen status` / `helix screen gates` の読み取り専用 CLI 表面。read helper
（`readScreenStatus` / `listScreenGateReceipts`）を unit oracle（seed 済み `:memory:` db、
空 DB の空状態、table 欠落 db の throw fail-close）で検査し、実 CLI spawn で JSON schema
（schema_version / source_command / exit 0）を固定する。CLI からの write は行わない。

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-SAPCLI-001 | `helix screen status` / `helix screen gates` | 空 DB → 空状態 JSON（exit 0）、seed+commit 済み db → heads/counts/一覧が store 書込内容と一致、table 欠落 db → helper throw（CLI は schema_version 付き stderr JSON + exit 非0 へ正規化）、limit<=0 → 空一覧、write 系 SQL の不使用（SELECT / CREATE IF NOT EXISTS のみ） | `tests/screen-cli.test.ts` |

## §7 キャリー改善（PLAN-L7-532）: 生成 identity の単射性（U-SAPID-001/002）

#175 の申し送り「短縮 ID 衝突対策」に対する oracle。L6 設計 §3.1 の invariant（identity は
source digest hex を全長で埋め込む単射導出）を固定する。

sha256 の実衝突は構成できないため、衝突事例ではなく**導出の単射性**を観測点にする。生成
identity から source digest を全長復元できれば、相異なる digest は相異なる identity になる。

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-SAPID-001 | `evaluateScreenReentry` / `planPrototypeDiscovery` / `buildPlanScreenRouteBundle` | 生成された `task_id` / `operation_id` が `<prefix>-<source digest hex 全長>` と厳密一致。切り詰め導出（例 `.slice(7, 19)`）を再導入すると復元に失敗して落ちる | `tests/screen-generated-identity.test.ts` |
| U-SAPID-002 | `src/design/screen-applicability.ts` 全体 | 同 module に digest 切り詰め導出が 1 箇所も残らない（`/\.slice\(7,\s*\d+\)/` が 0 件）。fence が空振りしていないことを module 内 export の存在で確認する | `tests/screen-generated-identity.test.ts` |

### 誤って green になる経路と、その封じ方

- **未カバー identity への切り詰め再導入**: U-SAPID-001 は 3 経路しか behavioral に見ない。
  decision / walkthrough / agreement / backprop / gate-candidate / screen-freeze の 6 経路は
  U-SAPID-002 の source backstop で塞ぐ。これは behavioral oracle の代用ではなく、未カバー分の
  backstop であると test 本文にも明記する。
- **fence の空振り**: module を読めていない・path が変わったのに 0 件で green になる経路を、
  `export function evaluateScreenReentry` の存在確認で塞ぐ。
- **prefix だけ一致**: `toContain` ではなく完全一致（`toBe`）で比較する。

## §8 キャリー改善（PLAN-L7-533）: rule digest 差での再入場（U-SAPRULE-001）

#175 の申し送り「rule digest 差分 reentry」に対する oracle。L6 設計 §3.2 の契約を固定する。

背景は宣言と実装の乖離である。decision と no-UI receipt は `reentry_trigger` に
`scope_or_rule_digest_change` を宣言し、L6 §1 も「scope/capability/rule 差で stale ＋ task 一件」と
規定していたが、実装は `scope_digest` 差だけを見ていた。`canonicalizeScreenScope` は rule set を
`scope_digest` に畳まないため、**適用ルールだけを変えても既存の no-UI skip receipt が再判定されない**。

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-SAPRULE-001 | `evaluateScreenReentry` | scope 不変 + rule 変更で stale ＋ task exactly-one / scope も rule も不変なら `HIL_SCREEN_RECEIPT_STALE`（task 0）/ scope 差 trigger と rule 差 trigger が別 `trigger_digest`・別 `task_id` / 同一入力再送は決定的同値 / `currentRuleDigest` が空・接頭辞なし・本体なしなら `HIL_SCREEN_APPLICABILITY_INVALID` で判定に進まない | `tests/screen-rule-reentry.test.ts` |

### 誤って green になる経路と、その封じ方

- **前提の崩れに気付かない**: 「rule を変えても scope_digest は不変」という前提が将来変われば
  この oracle の意味が変わる。前提そのものを test 冒頭で assert し、変化したら落ちるようにした。
- **下流 gate が捕まえていると誤認する**: `evaluateScreenFreeze`（`src/design/screen-applicability.ts:1028`）の
  `skip.rule_digest !== decision.rule_digest` と、store の `commitStageClosureAndGate`
  （`src/design/screen-applicability-store.ts:561`）が返す `no_ui_identity` は、skip と decision の
  双方が同じ古い rule digest を持つため一致してしまう。この oracle が唯一の観測点であることを
  test 本文と L6 §3.2 の双方に記録した。
- **trigger identity の潰れ**: scope 差と rule 差が同一 `trigger_digest` に潰れると、別の再判定要因が
  同じ task へ吸収される。`trigger_digest` が from/to の scope と rule を全て畳むことを不等号で固定した。
- **遷移元 rule の非束縛**: 上に加えて、同一 receipt・同一 scope・同一の遷移先 rule で**遷移元 rule だけ**が
  異なる 2 件が別 `trigger_digest` になることを固定する。to 側しか畳まない実装ではここが潰れる
  （mutation「`from_rule_digest` 除去」に対応する観測点であり、初回はこの mutation が survive したため
  本ケースを追加して killed にした）。U-SAPRULE-001 の一部であり別 oracle ID は採番しない。
- **不正 digest の素通り**: `currentRuleDigest` が空文字や `sha256:` だけでも「差がある」と見なされて
  再入場が発火しうるため、形式検査を差分判定より前に置き 3 種の不正値で固定した。

## §9 キャリー改善（PLAN-L7-534）: 読み取り CLI の read-only 境界（U-SAPCLI-002）

#175 の申し送り「破損 DB fixture の spawn 統合テスト / `openHarnessDbReadOnly` 二段構成」に対する
oracle。L6 設計 §3.3 の三状態を固定する。

観測は helper 単体ではなく **実 CLI を temp repository で spawn** して行う。「CLI がファイルや
table を作るか」は helper の戻り値からは見えないためである。

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-SAPCLI-002 | `helix screen status` / `helix screen gates` / `helix registry status` / `helix registry operations` | harness.db 不在の repo で 4 コマンドとも DB を作らず `initialized=false` を exit 0 で返す / DB はあるが対象 table が無い場合も table を作らない（`sqlite_master` を直接確認）/ 破損 DB は `schema_version` つき JSON error + 非 0 exit で stdout は空 | `tests/screen-cli-readonly.test.ts` |

### 誤って green になる経路と、その封じ方

- **中段（DB あり・table 無し）の未カバー**: 最初は「DB 不在」だけを見ていたため、
  `initialized` を常に true にする mutation が survive した。DB を作ってから対象 table 無しで
  読ませるケースを追加して killed にした。
- **ファイル作成を戻り値で判定してしまう**: 実ファイルの存在（`existsSync`）と `sqlite_master` を
  直接見る。CLI の応答だけを見ると「作ったが空を返した」経路を見逃す。
- **破損を空状態として飲み込む**: 非 0 exit と `stdout` が空であることの両方を固定する。
- **stderr の混入**: node の ExperimentalWarning が混じるため、`schema_version` 付きの JSON 行だけを
  取り出して検査する（stderr 全体を parse すると別要因で落ちる）。
