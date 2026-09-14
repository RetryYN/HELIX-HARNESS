---
title: "semantic contract 層（Node revalidator）単体テスト設計（L6 pair）"
layer: L6
sub_doc: unit-test-design
artifact_type: test_design
executed_at_layer: L7
kind: add-design
status: draft
created: 2026-08-08
updated: 2026-08-08
owner: QA
pair_artifact: docs/design/helix/L6-function-design/semantic-contract-revalidator.md
github_issue_id: 230
---

# semantic contract 層（Node revalidator）単体テスト設計（L6 pair）

L6機能設計 `docs/design/helix/L6-function-design/semantic-contract-revalidator.md` §0-§2 を
L7 で機械検査する。

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-PSC-001 | `canonicalizeSidecarDescriptor` | schema_version 不一致・必須 field 欠落・unknown key・絶対 path / `..` / Windows path / percent-encode traversal を含む document_path・digest 形式不正を `PSC_SCHEMA_INVALID` で fail-close。宣言 `sidecar_digest` が canonical field 列からの再計算値と不一致（masked mutation）は `PSC_DIGEST_MISMATCH`。object key 順序を入れ替えた意味的同一入力は同 sidecar_digest。返却値は deep-copy で caller mutation が波及しない。digest 再計算・path 検査・入口検査のいずれを外す mutation も red で kill する | `tests/semantic-contract-revalidator.test.ts` |
| U-PSC-002 | `revalidateSemanticEnvelope` | payload の canonical JSON bytes から再計算した `payload_digest` と宣言値の不一致（payload 改ざん・digest 偽装）は `PSC_DIGEST_MISMATCH`。provenance の worker_id / worker_version / contract_digest / source_digest の欠落・形式不正は `PSC_PROVENANCE_INVALID`。envelope の contract_id / contract_version / payload_schema_digest が sidecar と不一致は `PSC_CONTRACT_UNBOUND`。複数違反の混在は全列挙。payload の key 順序入替（意味的同一）は同 payload_digest で green。envelope_digest の再計算一致。payload の意味内容は検査しない（opaque 保証 = 任意 JSON が schema 検査なしに通る）。digest 再計算・束縛検査・provenance 検査のいずれを外す mutation も red で kill する | `tests/semantic-contract-revalidator.test.ts` |
