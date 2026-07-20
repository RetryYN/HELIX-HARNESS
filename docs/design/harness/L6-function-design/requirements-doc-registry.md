---
layer: L6
sub_doc: function-spec
status: draft
pair_artifact: docs/test-design/harness/L8-requirements-doc-registry.md
plan: docs/plans/PLAN-L7-461-requirements-doc-registry.md
---

# requirements-doc-registry 機能設計

要件正本パスの単一登録簿 (PLAN-L7-461、ハードコード禁止原則)。lint/gate は要件文書パスを本 loader 経由で
のみ解決し、正本切替 (例: v1.2→v1.3) は `docs/governance/requirements-doc-registry.json` の更新だけで完結する。

## 1. 公開 contract

| 関数 | Signature | pre | post | invariant | oracle |
|---|---|---|---|---|---|
| `loadRequirementsDocRegistry` | loadRequirementsDocRegistry(repoRoot?: string) => RequirementsDocRegistryV1 | `docs/governance/requirements-doc-registry.json` が schema v1 (canonical/compatibility の .md パス) で存在する。 | canonical (現行要件正本) と compatibility (supersede 済み参照) のパスを返し、consumer lint はこれ経由でのみ要件文書パスを解決する。 | registry 欠落・schema 不正・非 .md パスは fail-close で throw し、src/ への要件パスのハードコード再導入を許さない。 | U-RDOCREG-001 |

## 2. 責務境界

- `canonical` = 現行要件正本 (`helix-harness-requirements_v1.3.md`)。metadata 参照 (s4 sourceUrl 等) が使う。
- `compatibility` = supersede 済み参照 (`v1.2`)。旧章構成に内容依存する gate (propagation §7.8.1 /
  sub-doc-catalog / scrum-reverse seed / handover-resurrection 台帳) の anchor。挙動不変を保証する。
- digest pin 台帳 (`l12-hybrid-reviewed-safe-v2` と、進行 authority 側の
  `l3-progression-reviewed-digests`) は「レビュー済みスナップショットの記録 = data」であり、
  本 registry の外部化対象にしない。

## 3. 統合点

- consumer: `src/lint/propagation.ts` / `scrum-reverse.ts` / `sub-doc-catalog-drift.ts` /
  `handover-resurrection.ts` / `s4-decision-readiness.ts` (g3-trace はコメント cite のみ)。
- 単体 oracle は pair の `docs/test-design/harness/L8-requirements-doc-registry.md` を正本とする。
