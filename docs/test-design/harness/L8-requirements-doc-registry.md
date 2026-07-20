---
layer: L8
sub_doc: unit-test-design
status: draft
pair_artifact: docs/design/harness/L6-function-design/requirements-doc-registry.md
plan: docs/plans/PLAN-L7-461-requirements-doc-registry.md
---

# requirements-doc-registry 単体テスト設計

要件正本パス registry (PLAN-L7-461) の単体 oracle。lint gate が要件文書パスをハードコードせず
`docs/governance/requirements-doc-registry.json` 経由で解決することを fail-close で保証する。

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-RDOCREG-001 | registry loader | registry 欠落・schema 不正・非 .md パスで throw (fail-close)。正常時は canonical=v1.3 / compatibility=v1.2 の実在パスを返し、consumer (`REQUIREMENTS_DOC_PATH`) が registry 値と一致する | `tests/requirements-doc-registry.test.ts` |

mutation 観点: registry の canonical/compatibility を入れ替えた場合・実在しないパスへ書き換えた場合に、
consumer 側 gate の anchor が黙って変わらず test が赤になること (パス直書きの再導入は
`grep "helix-harness-requirements_v1.2.md" src/` の hit 増加として AC-1 で検出する)。
