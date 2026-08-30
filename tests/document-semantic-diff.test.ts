import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  buildSemanticDocumentSnapshot,
  diffSemanticDocuments,
  semanticSnapshotDigest,
} from "../src/runtime/document-semantic-diff";

function document(id: string, body: string, history = ""): string {
  return `---
spec:
  defines:
    - id: ${id}
      kind: requirement
---

# ${id}

| ID | 内容 |
| --- | --- |
| ${id} | 定義 |

${body}
${history}`;
}

describe("semantic document diff (U-DOCDIFF)", () => {
  // PLAN-L7-712-document-semantic-diff-node-authority
  it("U-DOCDIFF-009: current設計をNode transactional boundaryとPython semantic coreへ固定する", () => {
    const l6 = readFileSync(
      "docs/design/helix/L6-function-design/document-semantic-diff.md",
      "utf8",
    );
    const l8 = readFileSync(
      "docs/test-design/helix/L8-document-semantic-diff-contracts.md",
      "utf8",
    );
    const authority = `${l6}\n${l8}`;

    expect(l6).toContain("TypeScript/Node transactional boundary");
    expect(l6).toContain("Python semantic core");
    expect(l6).toContain("strict JSONL");
    expect(l6).toContain("Nodeは入力schemaとPython出力を再検証し");
    expect(l6).toContain("artifact writeを含む副作用を単一transactional boundaryからだけ実行する");
    expect(l6).toContain("DB path、credential、repository、`.helix/`");
    expect(l6).toContain("Git/GitHub write authorityを渡さず");
    expect(l8).toContain("U-DOCDIFF-009");
    expect(authority).not.toMatch(/TypeScript\/Bun|TS\/Bun|Bun runtime/i);
    expect(authority).not.toMatch(/\bbun(?:x|\s+(?:run|test|install|build|x))\b/i);
  });

  it("U-DOCDIFF-001 / U-DOCDIFF-007: 同一内容と入力順でstable snapshotを返す", () => {
    const first = buildSemanticDocumentSnapshot([
      { path: "docs/b.md", content: document("B-001", "本文") },
      { path: "docs/a.md", content: document("A-001", "本文") },
    ]);
    const second = buildSemanticDocumentSnapshot(
      [...first.documents]
        .map((item) => ({
          path: item.path,
          content: item.path.endsWith("a.md")
            ? document("A-001", "本文")
            : document("B-001", "本文"),
        }))
        .reverse(),
    );
    expect(diffSemanticDocuments(first.documents, first.documents)).toMatchObject({
      ok: true,
      added_documents: [],
      changed_sections: [],
    });
    expect(semanticSnapshotDigest(first.documents)).toBe(semanticSnapshotDigest(second.documents));
  });

  it("U-DOCDIFF-002 / U-DOCDIFF-003: document/ID/section/historyの差分を分離する", () => {
    const base = buildSemanticDocumentSnapshot([
      { path: "docs/a.md", content: document("A-001", "旧本文") },
    ]);
    const current = buildSemanticDocumentSnapshot([
      { path: "docs/a.md", content: document("A-002", "新本文", "## 改版履歴\n- 2026-07-14 更新") },
      { path: "docs/b.md", content: document("B-001", "追加") },
    ]);
    expect(diffSemanticDocuments(base.documents, current.documents)).toMatchObject({
      added_documents: ["docs/b.md"],
      added_ids: ["A-002"],
      removed_ids: ["A-001"],
      history_added: [expect.objectContaining({ path: "docs/a.md" })],
    });
  });

  it("U-DOCDIFF-004 / U-DOCDIFF-006: 記録なき変更と不正path/duplicateをfail-close可視化する", () => {
    const base = buildSemanticDocumentSnapshot([
      { path: "docs/a.md", content: document("A-001", "旧本文") },
    ]);
    const changed = buildSemanticDocumentSnapshot([
      { path: "docs/a.md", content: document("A-001", "新本文") },
    ]);
    expect(diffSemanticDocuments(base.documents, changed.documents).findings).toContainEqual(
      expect.objectContaining({ code: "unrecorded_change", severity: "warning" }),
    );
    expect(
      buildSemanticDocumentSnapshot([
        { path: "../escape.md", content: "x" },
        { path: "docs/a.md", content: "x" },
        { path: "docs/a.md", content: "x" },
      ]),
    ).toMatchObject({
      ok: false,
      findings: expect.arrayContaining([
        expect.objectContaining({ code: "invalid_path" }),
        expect.objectContaining({ code: "duplicate_path" }),
      ]),
    });
  });
});
