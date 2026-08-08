---
title: "semantic contract 層（Node revalidator）単体テスト設計（L8実行正本）"
layer: L8
sub_doc: unit-test-design
artifact_type: test_design
executed_at_layer: L7
kind: add-design
status: draft
created: 2026-08-08
updated: 2026-08-08
owner: QA
pair_artifact: docs/design/helix/L6-function-design/semantic-contract-revalidator.md
pair_freeze_exempt: true
pair_freeze_exempt_kind: cross_layer_meta
pair_freeze_exempt_reason: "PLAN-L7-524 以降（#230）の実装スライス群が共有する L8 具体化正本。canonical な pair chain（L6 design ↔ L6-semantic-contract-revalidator-unit-test-design.md）が pair_artifact slot を専有しているため、本 doc は L6 設計への cross-layer 補助 binding として module 単位 1 件だけ pair-freeze 対象外とする（#175/#177/#209 の L8 共有正本と同型、PLAN 毎の exemption 増殖はしない）"
github_issue_id: 230
---

# semantic contract 層（Node revalidator）単体テスト設計（L8実行正本）

L6機能設計 `docs/design/helix/L6-function-design/semantic-contract-revalidator.md` §0-§2 と
L6単体テスト設計の U-PSC 行を L8 で具体化する。スライス構成は L4 §4（semantic contract 層 →
Python 意味コア骨格 → transaction consumer → sidecar/intake → gate 配線）に従い、
本書には着地済みスライスの oracle 行のみを登録する。

## スライス1（PLAN-L7-524: semantic contract 層）

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-PSC-001 | `canonicalizeSidecarDescriptor` | schema_version 不一致・unknown key・digest 形式不正・絶対 path / `..` / Windows path / percent-encode traversal（`%2e%2e`・`..%2f`・`..%5c`・多重 encode `%252e%252e`）を含む document_path を `PSC_SCHEMA_INVALID` で fail-close（正当な repo 相対 path は green のままで過剰検出なし）。field 書換 + 宣言 digest 据え置き（masked mutation）は `PSC_DIGEST_MISMATCH`。object key 順序を入れ替えた意味的同一入力は同 sidecar_digest。返却値は deep-copy で caller mutation が波及しない。digest 再計算・path 封じ込め・入口検査のいずれを外す mutation も red で kill する | `tests/semantic-contract-revalidator.test.ts` |
| U-PSC-002 | `revalidateSemanticEnvelope` | payload 改ざん + payload_digest 据え置き、および envelope field 書換 + envelope_digest 据え置きを `PSC_DIGEST_MISMATCH`。provenance（worker_id / worker_version / contract_digest）の欠落・形式不正は `PSC_PROVENANCE_INVALID`。sidecar との contract_id / contract_version / payload_schema_digest 不一致は `PSC_CONTRACT_UNBOUND`。複数違反の混在は全列挙。payload の key 順序入替は同 payload_digest で green、任意 JSON（深いネスト・null・配列）が意味検査なしで green（opaque 保証 = 意味判定重複 0）。digest 再計算・束縛検査・provenance 検査のいずれを外す mutation も red で kill する | `tests/semantic-contract-revalidator.test.ts` |

## スライス3（PLAN-L7-525: Node transaction consumer）

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-PSC-003 | `buildSemanticCommit` | 未再検証 envelope（revalidator を通していない raw）や sidecar 束縛不一致の入力を拒否。bundle の digest 群は入力宣言値を信用せず envelope（payload / envelope_digest）と sidecar（sidecar_digest）の双方から再計算（canonicalize 未経由で組み立てた masked sidecar を含め改ざん入力は `PSC_DIGEST_MISMATCH`）。after head は `sha256(before_head + operation_digest)` で決定的（同一入力 2 回で同一 bundle）。append 順は `result` → `receipt` → `head` 固定 | `tests/semantic-commit-store.test.ts` |
| U-PSC-004 | `commitSemanticResult` | expected head 不一致は `PSC_CAS_CONFLICT` で rollback し head/行とも不変。同一 `operation_id` の再実行は既存 receipt を冪等に返し行が増えない。同一 ID・異 digest は `PSC_OPERATION_CONFLICT`。append 途中の fault 注入で partial write 0（result 行だけ残らない）。同一 `(contract_id, contract_version, source_digest)` の別 envelope は unique 制約で `PSC_COMMIT_FAULT` へ rollback し head 不変。transaction 内で他 writer が head を進めた場合も CAS で検出し rollback。BEGIN IMMEDIATE 失敗も `PSC_COMMIT_FAULT` へ正規化し行/head 不変 | `tests/semantic-commit-store.test.ts` |

## スライス4（PLAN-L7-526: intake receipt / VDH-FR-001）

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-PSC-005 | `buildIntakeReceipt` | 宣言 `entry_count` と実 entries 数の不一致・entry path の重複・path 逸脱（絶対 path / `..` / percent-encode）・digest 形式不正・schema 不一致を `PSC_SCHEMA_INVALID` で全列挙 fail-close。宣言 `inventory_digest` が path 昇順正規化からの再計算値と不一致（masked mutation）は `PSC_DIGEST_MISMATCH`。canonical と intermediate の差異（canonical のみ / intermediate のみ / 同一 path の内容差異 content_mismatch）のうち裁定漏れがあるもの、および disposition を欠く atom は `PSC_INTAKE_UNRESOLVED` で全列挙。entries / dispositions の宣言順を入れ替えた意味的同一入力は同一 `receipt_digest`。intermediate を canonical へ昇格させる入力（同一 digest 宣言）は fail-close。差異検出・裁定要求・digest 再計算・決定性のいずれを外す mutation も red で kill する | `tests/semantic-intake-receipt.test.ts` |

## スライス5（PLAN-L7-527: gate 配線 / SA-PSC-03 の実 gate 面）

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-PSC-006 | `analyzeSemanticBoundary` / doctor `semantic-boundary` | 合成 fixture で 3 不変条件の各違反（`src/semantic` から DB path / credential / repository write / process 起動 / `.helix/` への到達、`semantic_result_*` への write を持つ別 source（リテラル・テンプレートリテラル・文字列連結・ORM 風。宣言と使用が離れた gap 0/2/5/10 も距離非依存で捕捉）、IMMUTABLE 登録漏れ）を種別ごとに全列挙して `ok=false`。違反なし fixture は `ok=true`。table 名の列挙だけの登録簿・無関係な同名変数の偶発一致・文字列中の `//` は誤検出しない（best-effort 静的検査であり、分割代入や property 経由の迂回は検出対象外＝L9 の責務）。**実 repo に対しても違反 0**（regression fence）かつ実 repo 入力への違反注入は必ず落ちる。doctor 経由でも同じ判定が得られ、違反時に fail-close する。各不変条件の検査を外す mutation も red で kill する | `tests/semantic-boundary.test.ts` |

## 後続スライス（未登録）

（supply-chain gate 着地後の）Python 意味コア骨格と L9 SA-PSC-01〜04 の oracle 行は
各実装 PLAN の起票時に本書へ追記する。
