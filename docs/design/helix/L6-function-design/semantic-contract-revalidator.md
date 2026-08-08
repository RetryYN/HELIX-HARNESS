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

## §3 完了境界とスライス

U-PSC-001〜002 の typed failure・mutation 反例（digest 偽装・provenance 欠落・contract 束縛
不一致・unknown key・path 逸脱）が green になるまで draft とする。後続スライス:
Python 意味コア骨格（envelope の生成側）→ Node transaction consumer（`harness.db` projection）→
sidecar / intake receipt → gate 配線（L4 §4 の順）。

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
