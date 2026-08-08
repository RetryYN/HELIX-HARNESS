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

## 後続スライス（未登録）

Python 意味コア骨格・transaction consumer・sidecar/intake receipt・gate 配線の oracle 行は
各実装 PLAN の起票時に本書へ追記する。
