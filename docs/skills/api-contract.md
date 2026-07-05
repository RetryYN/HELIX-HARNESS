---
schema_version: skill.v1
name: api-contract
skill_type: design-contract
applies_to:
  layers:
    - L3
    - L4
    - L5
    - L6
  drive_models:
    - Forward
    - Reverse
    - Add-feature
    - Retrofit
---

# API contract 設計

API provider と consumers の間の contract definition を扱う。対象は schema ownership、
compatibility guarantees、consumer-driven contract obligations、それらを HELIX gates でどう強制するか。
endpoint design（`api.md` 参照）とは別であり、この skill は individual routes の shape ではなく
*binding agreement* を govern する。

## この skill を読む条件

- PLAN が複数 module または agent に consume される shared API surface を変更する。
- Reverse R1 pass で implicit contract を machine-checkable schema へ formalise する必要がある。
- Retrofit PLAN が existing contract 変更前に backward-compatibility risk を評価する必要がある。
- L5 detailed-design doc が downstream callers の依存する serialisation、auth、
  error-code guarantees を定義する。

## layer 別 contract definition obligations

**L3 (functional):** provider と consumer roles を特定し、versions をまたいで維持すべき invariant を記載する
（例: "consumer must never receive a null `id` field"）。

**L4 (basic):** `docs/design/<product>/L4-basic/<resource>-contract.md` に contract document を作り、
次を含める。
- Provider: module path と version。
- Consumer list: 既知の caller と、それぞれが想定する schema version。
- Schema: field names、types、required/optional、enum values を記録する。
- Error contract: status codes と各 code が発火する条件。
- Compatibility class: `stable`、`beta`、`internal`。
  class ごとに change-without-notice policies が異なる。

**L5 (detailed):** serialisation format（JSON、MessagePack など）、
auth-token shape、idempotency guarantees を追加する。

## Reverse R1: existing code から contract を抽出する

1. provider source を読み、すべての exported field と status code を列挙する。
2. consumer call sites を grep し、assumed field access を探す（`helix find` または `grep`）。
3. step 1 から L4 contract doc を書く。各 field に step 2 の consumer count を annotate し、
   deletion risk を示す。
4. `helix review --uncommitted` を実行する。consumers があるのに contract entry が無い field は
   blocking finding。

## Compatibility gate rules（互換性 gate rule）

- **Stable contracts** では、fields の removal/rename 前に deprecation period が必要
  （L4 doc に sunset date を記録）。
- stable contract への **Breaking changes** は、PLAN `generates` list 内の version を bump し、
  pair-freeze 前にすべての consumer reference を更新しなければならない。
- contract changes 後、`helix doctor` は 0 で終了しなければならない。
  governance checks は old/new contract versions の artifact_registry entries が consistent であることを確認する。

## contract PLAN の pair-freeze checklist

- [ ] L4 contract doc が provider、consumer list、schema、error codes、compatibility class を持つ。
- [ ] all known consumers が列挙されている。breaking changes は non-breaking と確認済み、
      または同じ PLAN 内で consumers が更新済み。
- [ ] `helix plan lint` が exit 0（`generates` が contract doc を参照する）。
- [ ] `helix doctor` exits 0.
- [ ] L6 unit-test design が少なくとも 1 つの invalid-input と 1 つの schema-mismatch error path を覆っている。
