---
title: "HELIX L6 機能設計 — semantic contract 層（Node 実行境界 revalidator）"
layer: L6
kind: add-design
status: draft
created: 2026-08-08
updated: 2026-08-08
owner: Claude / TL
plan: PLAN-L4-53-python-semantic-core-node-boundary
design_slice: HDS-PSC-01
related_l3: docs/design/helix/L3-requirements/ai-vision-design-harness-engine.md
related_l4: docs/design/helix/L4-basic-design/python-semantic-core-node-boundary.md
related_l5: docs/design/helix/L5-detail/python-worker-runtime.md
pair_artifact: docs/test-design/helix/L6-semantic-contract-revalidator-unit-test-design.md
next_pair_freeze: L7
requirements:
  - VDH-FR-016
  - VDH-FR-017
github_issue_id: 230
---

# HELIX L6 機能設計 — semantic contract 層（Node 実行境界 revalidator）

L4 基本設計 §4 slice1 の具体化。Python 意味コアが返す semantic result envelope と、
hybrid document sidecar descriptor の versioned schema を Node 実行境界側で**形式再検証**する
純関数群を定める。ADR-010 の分離原則に従い、本層は意味判断を再実装せず、
schema / digest / provenance / authority policy の形式検証だけを行う（意味判定重複 0）。
filesystem / clock / DB を読まない pure API とし、write authority を持たない。

## §0 型と authority

```ts
type PscFailureCodeV1 =
  | "PSC_SCHEMA_INVALID"      // schema_version 不一致・必須 field 欠落・型不正・unknown key
  | "PSC_DIGEST_MISMATCH"     // payload/canonical bytes から再計算した digest と宣言値の不一致
  | "PSC_PROVENANCE_INVALID"  // contract/worker/source の provenance 束縛欠落・形式不正
  | "PSC_CONTRACT_UNBOUND";   // envelope が参照する contract と sidecar の束縛不一致
type PscFailureV1 = { code: PscFailureCodeV1; evidence_digest: string };
type PscResultV1<T> = { ok: true; value: T } | { ok: false; failures: readonly PscFailureV1[] };
```

失敗は全列挙 fail-close（fail-fast で潰さない）。検証済み値は input の deep-copy を返し、
caller の後続 mutation が検証結果へ波及しない（aliasing 禁止）。

## §1 public API／DbC の契約

| API | signature | DbC | L7 oracle |
|---|---|---|---|
| `canonicalizeSidecarDescriptor` | `(raw: unknown) => PscResultV1<SidecarDescriptorV1>` | `psc-sidecar.v1` の strict schema（document_path は repo 相対で、絶対 path・Windows path・`..`/空 segment に加え percent-encode traversal（`%2e%2e` / `..%2f` / 多重 encode）も segment allowlist `^[A-Za-z0-9._-]+$` で入口拒否。consumer 側 decode 後に外へ出る encode-then-decode バイパスを断つ、document_digest / contract_id / contract_version / payload_schema_digest の形式検査、unknown key 拒否）。`sidecar_digest` は宣言値を信用せず canonical field 列から再計算して一致検査（masked-mutation 防止）。順序違い同義入力は同 digest | `U-PSC-001` |
| `revalidateSemanticEnvelope` | `(raw: unknown, sidecar: SidecarDescriptorV1) => PscResultV1<SemanticResultEnvelopeV1>` | `psc-semantic-result.v1` の strict schema。payload は opaque JSON として意味解釈せず、canonical JSON bytes から `payload_digest` を再計算して一致検査。provenance（worker_id / worker_version / contract_digest / source_digest）の必須束縛。envelope の contract_id / contract_version / payload_schema_digest が sidecar と exact 一致しない場合は `PSC_CONTRACT_UNBOUND`。`envelope_digest` も再計算一致検査 | `U-PSC-002` |

いずれも決定的（乱数・時刻非依存）。Node は本層の green なしに semantic result を
`harness.db` / Git / GitHub へ commit しない（後続 slice3 transaction consumer の前提）。

## §2 schema

```ts
interface SidecarDescriptorV1 {
  schema_version: "psc-sidecar.v1";
  document_path: string;          // 既存 hybrid document slot への repo 相対 path
  document_digest: string;        // sha256:<64hex>
  contract_id: string;            // ^PSC-[a-z0-9][a-z0-9-]*$
  contract_version: number;       // 正整数
  payload_schema_digest: string;  // 意味コア出力 payload の schema digest
  sidecar_digest: string;         // canonical field 列の sha256（再計算一致必須）
}
interface SemanticResultEnvelopeV1 {
  schema_version: "psc-semantic-result.v1";
  contract_id: string;
  contract_version: number;
  payload_schema_digest: string;
  source_digest: string;          // 入力 source の sha256
  payload: unknown;               // opaque。Node は意味解釈しない
  payload_digest: string;         // canonical JSON bytes の sha256（再計算一致必須）
  provenance: { worker_id: string; worker_version: string; contract_digest: string };
  envelope_digest: string;        // canonical field 列の sha256（再計算一致必須）
}
```

canonical JSON は key 昇順・UTF-8・非 ASCII 非エスケープで直列化し、object key の
挿入順に依存しない（意味的同一入力 → 同一 digest）。

## §3 transaction consumer 契約（スライス3）

再検証済み envelope だけを `harness.db` へ atomic に projection する Node 側 store 契約。
Python 意味コアの実装有無に依存しない（入口契約は §1 の revalidator が固定済み）。

| API | signature | DbC | L7 oracle |
|---|---|---|---|
| `buildSemanticCommit` | `(input: SemanticCommitInputV1) => PscResultV1<SemanticCommitBundleV1>` | 再検証済み envelope + sidecar + `operation_id` + `expected_semantic_head` から、固定順（`result` → `receipt` → `head`）の commit bundle を組む。bundle の内容 digest は envelope（payload / envelope_digest）と sidecar（sidecar_digest）の双方を canonical field 列から再計算して一致検査し、宣言値を信用しない（`SidecarDescriptorV1` は構造的型付けのため canonicalize 未経由の組み立てを型で防げない）。after head は `sha256(before_head + operation_digest)` で決定的に導出 | `U-PSC-003` |
| `commitSemanticResult` | `(bundle: SemanticCommitBundleV1, store: SemanticCommitStoreV1) => Promise<PscResultV1<SemanticCommitReceiptV1>>` | transaction 前の早期 head 比較（最適化）と、単一 transaction（BEGIN IMMEDIATE）内の in-lock CAS（`UPDATE ... WHERE semantic_head = expected` の `changes === 1`）を要求し、不一致は rollback して `PSC_CAS_CONFLICT`。同一 `operation_id` の再実行は operations 台帳で冪等に既存 receipt を返し、同一 ID・異 digest は `PSC_OPERATION_CONFLICT`。append 失敗・head 更新失敗は partial write 0 で rollback | `U-PSC-004` |

失敗コードを `PSC_CAS_CONFLICT` / `PSC_OPERATION_CONFLICT` / `PSC_COMMIT_FAULT` へ拡張する。
冪等判定の SELECT は transaction 外にあり、真の並行 commit では判定通過後に相手が先に同一
`operation_id` を commit しうる（TOCTOU window）。この場合は operations の PK 制約違反で
`PSC_COMMIT_FAULT` へ落ち、データ破壊・二重 commit はしない（再試行で冪等判定へ到達する）。
authority は lock 内 CAS 側にあり、早期 head 比較は無駄な書き込みを避ける最適化に過ぎない。Node 実行境界だけが
writer であり、Python へ DB path / credential を渡さない（L4 §2-2）。

### §3.1 永続 schema

| table | 用途 | 主キー / unique |
|---|---|---|
| `semantic_result_records` | 再検証済み envelope 本体（canonical payload と digest 群） | `envelope_digest` PK、`(contract_id, contract_version, source_digest)` unique |

同一 `(contract_id, contract_version, source_digest)` に対する別 envelope の commit は、同一 source から
複数の意味結果が並立することを禁じる意図で unique 制約により拒否する（`PSC_COMMIT_FAULT` で rollback、
head と行数は不変）。source を改訂した結果を入れる場合は `source_digest` が変わるため衝突しない。
| `semantic_result_receipts` | commit ごとの receipt（before/after head、operation 参照） | `receipt_id` PK |
| `semantic_result_heads` | 単一行の head pointer | `head_id` PK |
| `semantic_result_operations` | 冪等性台帳 | `operation_id` PK、`operation_digest` unique |

いずれも store が書く runtime 証跡であり rebuild の truncate 対象外
（`IMMUTABLE_RECEIPT_TABLES`）とする。

## §4 完了境界とスライス

U-PSC-001〜004 の typed failure・mutation 反例（digest 偽装・provenance 欠落・contract 束縛
不一致・unknown key・path 逸脱）が green になるまで draft とする。後続スライス:
sidecar / intake receipt → gate 配線。Python 意味コア骨格（envelope の生成側）は
L5 §0 の supply-chain freeze 条件（HDS-HIL-14）着地後とする。

## Design Reality Binding 契約

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": [],
  "assets": [],
  "failure_reachability": []
}
```
