---
layer: L6
sub_doc: function-spec
status: confirmed
pair_artifact: docs/test-design/harness/digest-canonicalization-authority.md
plan: docs/plans/PLAN-L6-76-digest-canonicalization-authority.md
---

# Digest canonicalization authority

## 目的

digest実装を、出力形式と入力能力が明示された共通utilityへ段階移行する。`sha256:`付きdigest、裸hex、短縮ID、JSON key整列、配列順序維持、循環拒否を別契約として扱い、意味差を一括置換しない。

## 契約

> **L6 contract marker**: `sha256Digest(value) => Sha256Digest` / `canonicalJson(value) => string`。
> pre: variantごとの入力型と既存consumerのbyte-level oracleが固定済みである。
> post: prefix、hex casing、canonical orderingを変更せず同一digestを返す。
> invariant: bare/truncated/domain-specific digestを混同せず、handover純lint境界を維持する。

- `sha256Digest`: `string | Uint8Array`を受け、`sha256:<64 lowercase hex>`を返す。
- `canonicalJson`: JSON値のobject keyだけを辞書順にし、配列順序を維持する。非finite number、`undefined`、function、symbolを拒否する。
- 裸hex、短縮digest、domain prefix付きIDは別typed variantなしに移行しない。
- `src/lint/handover-resurrection.ts`の純lint境界は維持し、runtime capability追加を伴う変更は禁止する。

## 移行inventory

`rg 'createHash\("sha256"|function canonicalJson' src`の各hitを、prefixed digest、bare hex、truncated identity、canonical JSON、file/stream digestに分類する。各consumerは既存fixtureのbyte一致を証明してから移行し、未分類hitを0にするまで完了を主張しない。
