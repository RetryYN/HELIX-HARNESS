---
title: "HELIX L5 詳細設計 — 文書 agent metadata 契約"
layer: L5
kind: add-design
status: draft
created: 2026-07-14
updated: 2026-07-14
owner: Codex / TL
plan: PLAN-L3-13-vmodel-docgen-fit
related_l4: docs/design/helix/L4-basic-design/document-agent-metadata.md
pair_artifact: docs/test-design/helix/L8-document-agent-metadata-contracts.md
---

# HELIX L5 詳細設計 — 文書 agent metadata 契約

## §1 契約表

| ID | 契約 | 入力 | 出力 | fail-close 条件 |
|---|---|---|---|---|
| HVM-AGMETA-C01 | source scope | canonical path と scope manifest | 対象文書集合 | archive / PLAN / role 文書の混入、非canonical path |
| HVM-AGMETA-C02 | declaration extraction | `spec.defines` / `spec.refs` | typed declaration graph | parse failure、重複 ID、unknown reference |
| HVM-AGMETA-C03 | metadata derivation | declaration graph と文書 registry | expected `document_agent` | 非決定順序、自己参照、定義元未解決 |
| HVM-AGMETA-C04 | conformance | expected と declared metadata | structured findings | missing / stale / unknown / mismatch を green に倒すこと |

## §2 `document_agent` schema

```ts
interface DocumentAgentMetadata {
  defines: string[];
  read_first: string[];
  done_when: {
    required_declaration_ids: string[];
    required_read_first: string[];
    required_pair_artifact: string | null;
    required_gates: string[];
  };
}

interface DocumentAgentMetadataFinding {
  code: "scope_invalid" | "declaration_invalid" | "unknown_reference" | "cycle" |
    "defines_extra" | "read_first_missing" | "read_first_stale" | "done_when_mismatch";
  path: string;
  declaration_id: string | null;
  severity: "error" | "warning";
}

interface DocumentAgentMetadataReport {
  schema_version: 1;
  manifest_digest: string;
  checked_paths: string[];
  proposed: Record<string, DocumentAgentMetadata>;
  findings: DocumentAgentMetadataFinding[];
  ok: boolean;
}
```

`defines` は許可リストであり、実際の定義が宣言集合の部分集合であることを要求する。`read_first` は
外部 `spec.refs` の定義元文書と完全一致し、missing と stale の双方を error とする。`done_when` は
導出結果と完全一致し、自由文だけで完了を主張できない。

`document_agent` は YAML frontmatter の top-level mapping にだけ置く。typed declaration の入力は既存 parser が
受理する frontmatter と fenced YAML の双方であり、両者の解釈を別実装しない。`required_pair_artifact` は
document frontmatter の `pair_artifact`、`required_gates` は scope manifest の canonical gate 名から導出する。

## §3 不変条件

- ID と path は NFC/canonical 化して辞書順に出力する。
- same-document reference は `read_first` へ入れない。
- source scan と check は read-only である。
- unknown gate、対象外 path、循環参照、宣言不能な metadata は error finding とする。
- apply は expected と declared が一致する文書だけを対象にせず、明示 selected path・write port・before/after digest・
  rollback receipt を要求する。自動 apply や scope外 apply は禁止する。
