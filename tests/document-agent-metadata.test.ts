import { describe, expect, it } from "vitest";
import { loadDocumentAgentMetadataReport } from "../src/adapters/document-agent-metadata-fs";
import {
  buildDeclarationRegistry,
  validateDocumentAgentMetadata,
} from "../src/lint/document-agent-metadata";
import {
  type DocumentAgentMetadata,
  type DocumentAgentScopeManifest,
  parseDocumentAgentMetadata,
  parseDocumentAgentScopeManifest,
} from "../src/schema/document-agent-metadata";
import { parseDesignDeclarationDoc } from "../src/vmodel/design-declarations";

const manifest: DocumentAgentScopeManifest = {
  schema_version: 1,
  include_roots: ["docs/design/helix", "docs/test-design/helix"],
  exclude_roots: ["docs/archive", "docs/plans"],
  documents: ["docs/design/helix/a.md", "docs/test-design/helix/b.md"],
  required_gates: ["design-declarations", "vpair-binding"],
  phase: "check",
};

function metadata(input: Partial<DocumentAgentMetadata> = {}): DocumentAgentMetadata {
  return {
    defines: input.defines ?? ["A-001"],
    read_first: input.read_first ?? [],
    done_when: input.done_when ?? {
      required_declaration_ids: ["A-001"],
      required_read_first: [],
      required_pair_artifact: null,
      required_gates: ["design-declarations", "vpair-binding"],
    },
  };
}

function document(
  path: string,
  id: string,
  input: { refs?: string[]; agent?: unknown; pair?: string } = {},
) {
  const agent =
    input.agent === undefined
      ? metadata({
          defines: [id],
          done_when: { ...metadata().done_when, required_declaration_ids: [id] },
        })
      : input.agent;
  const pair = input.pair ? `pair_artifact: ${input.pair}\n` : "";
  const refs = (input.refs ?? [])
    .map((to) => `    - from: ${id}\n      to: ${to}\n      kind: derives`)
    .join("\n");
  return parseDesignDeclarationDoc(
    path,
    `---
document_agent:
  defines: ${JSON.stringify((agent as DocumentAgentMetadata).defines ?? [])}
  read_first: ${JSON.stringify((agent as DocumentAgentMetadata).read_first ?? [])}
  done_when:
    required_declaration_ids: ${JSON.stringify((agent as DocumentAgentMetadata).done_when?.required_declaration_ids ?? [])}
    required_read_first: ${JSON.stringify((agent as DocumentAgentMetadata).done_when?.required_read_first ?? [])}
    required_pair_artifact: ${(agent as DocumentAgentMetadata).done_when?.required_pair_artifact ?? "null"}
    required_gates: ${JSON.stringify((agent as DocumentAgentMetadata).done_when?.required_gates ?? [])}
${pair}spec:
  defines:
    - id: ${id}
      kind: requirement
${refs ? `  refs:\n${refs}\n` : ""}---

# ${id}

| ID | 内容 |
| --- | --- |
| ${id} | 定義 |
`,
  );
}

function report(documents: ReturnType<typeof document>[]) {
  return validateDocumentAgentMetadata(documents, buildDeclarationRegistry(documents), manifest);
}

describe("document agent metadata (HVM-AGMETA)", () => {
  it("IT-AGMETA-001: canonical manifest を read-only で実文書へ適用する", () => {
    expect(loadDocumentAgentMetadataReport(process.cwd())).toMatchObject({
      ok: true,
      checked_paths: ["docs/design/helix/L3-requirements/document-agent-metadata.md"],
    });
  });

  it("U-AGMETA-003: canonical な導出結果を入力順に依存せず返す", () => {
    const a = document("docs/design/helix/a.md", "A-001");
    const b = document("docs/test-design/helix/b.md", "B-001", { refs: ["A-001"] });
    const bWithExpectedMetadata = document("docs/test-design/helix/b.md", "B-001", {
      refs: ["A-001"],
      agent: {
        defines: ["B-001"],
        read_first: ["docs/design/helix/a.md"],
        done_when: {
          required_declaration_ids: ["B-001"],
          required_read_first: ["docs/design/helix/a.md"],
          required_pair_artifact: null,
          required_gates: ["design-declarations", "vpair-binding"],
        },
      },
    });

    expect(report([a, bWithExpectedMetadata])).toMatchObject({
      ok: true,
      proposed: { "docs/test-design/helix/b.md": { read_first: ["docs/design/helix/a.md"] } },
    });
    expect(report([bWithExpectedMetadata, a]).proposed).toEqual(
      report([a, bWithExpectedMetadata]).proposed,
    );
    expect(report([a, b]).findings.map((item) => item.code)).toContain("read_first_missing");
  });

  it("U-AGMETA-004: defines は許可リストであり、未使用の許可 ID は許す", () => {
    const allowed = document("docs/design/helix/a.md", "A-001", {
      agent: metadata({ defines: ["A-001", "RESERVED-001"] }),
    });
    const outside = document("docs/test-design/helix/b.md", "B-001", {
      agent: metadata({ defines: ["UNRELATED-001"] }),
    });

    expect(
      report([allowed, document("docs/test-design/helix/b.md", "B-001")]).findings,
    ).not.toContainEqual(
      expect.objectContaining({ code: "defines_extra", path: "docs/design/helix/a.md" }),
    );
    expect(report([document("docs/design/helix/a.md", "A-001"), outside]).findings).toContainEqual(
      expect.objectContaining({ code: "defines_extra", declaration_id: "B-001" }),
    );
  });

  it("U-AGMETA-005: unknown ID と自己参照を fail-close にする", () => {
    const unknown = document("docs/design/helix/a.md", "A-001", { refs: ["MISSING-001"] });
    const self = document("docs/test-design/helix/b.md", "B-001", { refs: ["B-001"] });
    const codes = report([unknown, self]).findings.map((item) => item.code);

    expect(codes).toContain("unknown_reference");
    expect(codes).toContain("cycle");
  });

  it("U-AGMETA-006: done_when の自由な完了主張を許さない", () => {
    const bad = document("docs/design/helix/a.md", "A-001", {
      agent: metadata({
        done_when: {
          required_declaration_ids: [],
          required_read_first: [],
          required_pair_artifact: null,
          required_gates: [],
        },
      }),
    });

    expect(report([bad, document("docs/test-design/helix/b.md", "B-001")]).findings).toContainEqual(
      expect.objectContaining({ code: "done_when_mismatch", path: "docs/design/helix/a.md" }),
    );
  });

  it("U-AGMETA-007: unknown key と無効 manifest は fail-close にする", () => {
    expect(parseDocumentAgentMetadata({ ...metadata(), unexpected: true })).toBeNull();
    expect(parseDocumentAgentScopeManifest({ ...manifest, unexpected: true })).toBeNull();
    expect(
      report([
        document("docs/design/helix/a.md", "A-001"),
        document("docs/test-design/helix/b.md", "B-001"),
      ]),
    ).toMatchObject({ ok: true });
    expect(
      validateDocumentAgentMetadata(
        [
          document("docs/design/helix/a.md", "A-001"),
          document("docs/test-design/helix/b.md", "B-001"),
        ],
        buildDeclarationRegistry([document("docs/design/helix/a.md", "A-001")]),
        { ...manifest, phase: "apply" },
      ).findings,
    ).toEqual([]);

    const duplicateA = document("docs/design/helix/a.md", "DUP-001");
    const duplicateB = document("docs/test-design/helix/b.md", "DUP-001");
    expect(report([duplicateA, duplicateB]).findings).toContainEqual(
      expect.objectContaining({ code: "duplicate_id", declaration_id: "DUP-001" }),
    );
  });
});
