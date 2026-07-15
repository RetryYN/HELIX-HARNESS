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
| `deriveDocumentAgentMetadata` | `(documents: ParsedDesignDeclarationDoc[], registry: DeclarationRegistry, manifest: DocumentAgentScopeManifest) => DocumentAgentMetadataReport` | `src/schema/design-declarations.ts` の既存 parser 結果だけから決定論的に expected metadata を導出し、対象外 path を受理しない | U-AGMETA-001..003 |
| `validateDocumentAgentMetadata` | `(documents: ParsedDesignDeclarationDoc[], registry: DeclarationRegistry, manifest: DocumentAgentScopeManifest) => DocumentAgentMetadataReport` | declared と expected の missing / unknown / stale / mismatch を全件返し、partial success を green にしない | U-AGMETA-004..007 |
| `checkDocumentAgentMetadata` | `(repoRoot: string, manifest: DocumentAgentScopeManifest) => GateResult` | FS adapter の読み込み結果だけを analyzer に渡す。read-only で JSON result を返す | IT-AGMETA-001..003 |
| `planDocumentAgentMetadataApply` | `(selection: CanonicalPath[], report: DocumentAgentMetadataReport, source: DocumentAgentSource) => ApplyPlan` | Phase B only。manifest内の明示選択を重複なく正規化し、各 source の before digest と proposed metadata を固定する。scope / parse / graph finding は fail-close、metadata mismatch は修復対象として許可する | U-AGMETA-008..010 |
| `applyDocumentAgentMetadata` | `(plan: ApplyPlan, port: DocumentAgentMetadataWritePort) => ApplyReceipt` | plan 作成後の source digest が一致し、write port が全変更を durable に staging できる場合だけ更新する。途中失敗は既変更を逆順 rollback し、部分成功を green にしない | U-AGMETA-011..012, IT-AGMETA-004..005 |

## §2 実装境界

| path | owner | 制約 |
|---|---|---|
| `src/schema/document-agent-metadata.ts` | schema | metadata/result の strict 型 |
| `src/lint/document-agent-metadata.ts` | pure policy | `ParsedDesignDeclarationDoc` と同一parser由来の `DeclarationRegistry` を入力にし、`src/schema/design-declarations.ts` を唯一の typed extractor として再利用 |
| `src/adapters/document-agent-metadata-fs.ts` | filesystem adapter | canonical scope の列挙・read と、source content/digest の read-only snapshot |
| `src/runtime/document-agent-metadata-write-port.ts` | write adapter | 同一 directory の temp/fsync/rename と trusted path 検証。source root 外、symlink、digest drift を拒否 |
| CLI composition / doctor | adapter | `check` と、明示 `apply --select <canonical-path>` の配線。doctor は恒久的に read-only |

Phase A の初期実装範囲は check のみである。Phase B の `apply` は上記 DbC と L9 oracle を満たす後続 L7 でのみ
有効化する。apply は manifest の `phase: apply` と一致する manifest、1件以上の明示 `--select`、および apply plan
と同一 process 内の実行を要求する。role prompt 更新、DB write、subprocess spawn はいずれの phase でも範囲外である。

## §2.1 Applyの不可分transaction

`ApplyPlan` は `{ manifest_digest, selections, changes }` を持つ。各 change は canonical path、before content digest、
rendered after content digest、proposed `document_agent` を持つ。metadata の serialization は top-level frontmatter の
`document_agent` key だけを置換し、それ以外の source bytes を保持する。fenced YAML だけで declaration を持つ文書は
top-level metadata を安全に追加できないため fail-close とする。

write port は全 target を事前検証してから順に原子的 publish する。publish 後に失敗した場合は already-published target を
reverse order で before content へ戻し、receipt に rollback 成否を全件記録する。rollback 自体が失敗した receipt は
`ok: false`、`partial: true` とし、CLI は non-zero を返す。成功 receipt は before/after digest、durability、rollback不要を
記録するが、DB・release state・runtime state には書き込まない。

## §3 検証戦略

| oracle | 対象 | 受入条件 |
|---|---|---|
| IT-AGMETA-004 | CLI apply | 明示selection、digest一致、port拒否時write 0 |
| IT-AGMETA-005 | publish rollback | 途中失敗の逆順rollbackとpartial receipt |

L7 実装 PLAN は本 L8 文書を `pair_artifact` に持ち、集中 L8 正本にも逆trace を追加する。個別 L8/L9 oracle と
実 test path を `verification_bindings` へ exact に結合する。L9 は CLI→FS adapter→pure analyzer→doctor の実配線と
read-only 性、Phase B では write port / rollback を別途検証する。

Phase B の結合 oracle は `IT-AGMETA-004`（明示 selection、digest、port拒否の副作用 0）と
`IT-AGMETA-005`（複数 publish fault の逆順 rollback と partial receipt）である。
