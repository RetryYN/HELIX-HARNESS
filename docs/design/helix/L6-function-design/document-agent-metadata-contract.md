---
title: "HELIX L6 機能設計 — 文書 agent metadata 契約"
layer: L6
kind: add-design
status: draft
created: 2026-07-14
updated: 2026-07-14
owner: Codex / TL
plan: PLAN-L3-13-vmodel-docgen-fit
related_l5: docs/design/helix/L5-detail/document-agent-metadata-contract.md
pair_artifact: docs/test-design/helix/L8-document-agent-metadata-contracts.md
related_l9: docs/test-design/helix/L9-document-agent-metadata-integration.md
---

# HELIX L6 機能設計 — 文書 agent metadata 契約

## §1 関数契約

| 関数 | signature | DbC | oracle |
|---|---|---|---|
| `deriveDocumentAgentMetadata` | `(documents: DesignDeclarationDocument[], registry: DeclarationRegistry, manifest: DocumentAgentScopeManifest) => DocumentAgentMetadataReport` | typed declaration だけから決定論的に expected metadata を導出し、対象外 path を受理しない | U-AGMETA-001..003 |
| `validateDocumentAgentMetadata` | `(documents: DesignDeclarationDocument[], registry: DeclarationRegistry, manifest: DocumentAgentScopeManifest) => DocumentAgentMetadataReport` | declared と expected の missing / unknown / stale / mismatch を全件返し、partial success を green にしない | U-AGMETA-004..007 |
| `checkDocumentAgentMetadata` | `(repoRoot: string, manifest: DocumentAgentScopeManifest) => GateResult` | FS adapter の読み込み結果だけを analyzer に渡す。read-only で JSON result を返す | IT-AGMETA-001..003 |
| `applyDocumentAgentMetadata` | `(selection: CanonicalPath[], expected: DocumentAgentMetadataReport, port: ArtifactWritePort) => ApplyReceipt` | Phase B only。manifest内の明示選択、digest一致、write port、rollback receipt が揃う場合だけ更新する | IT-AGMETA-004 |

## §2 実装境界

| path | owner | 制約 |
|---|---|---|
| `src/schema/document-agent-metadata.ts` | schema | metadata/result の strict 型 |
| `src/lint/document-agent-metadata.ts` | pure policy | `src/schema/design-declarations.ts` を唯一の typed extractor として再利用 |
| `src/adapters/document-agent-metadata-fs.ts` | filesystem adapter | canonical scope の列挙・read のみ |
| CLI composition / doctor | adapter | `helix design agent-metadata check --json` と hard gate への接続だけ |

Phase A の初期実装範囲は check のみである。Phase B の `apply` は上記 DbC と L9 oracle を満たす後続 L7 でのみ
有効化する。role prompt 更新、DB write、subprocess spawn はいずれの phase でも範囲外である。

## §3 検証戦略

L7 実装 PLAN は本 L8 文書を `pair_artifact` に持ち、集中 L8 正本にも逆trace を追加する。個別 L8/L9 oracle と
実 test path を `verification_bindings` へ exact に結合する。L9 は CLI→FS adapter→pure analyzer→doctor の実配線と
read-only 性、Phase B では write port / rollback を別途検証する。
