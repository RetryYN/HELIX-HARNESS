import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  applyDocumentAgentMetadata,
  planDocumentAgentMetadataApply,
} from "../src/runtime/document-agent-metadata-apply";
import { createDocumentAgentMetadataWritePort } from "../src/runtime/document-agent-metadata-write-port";
import type {
  DocumentAgentMetadata,
  DocumentAgentMetadataReport,
  DocumentAgentScopeManifest,
} from "../src/schema/document-agent-metadata";

// PLAN-L7-456-document-agent-metadata-phase-b-apply

const path = "docs/design/helix/a.md";
const metadata: DocumentAgentMetadata = {
  defines: ["A-001"],
  read_first: [],
  done_when: {
    required_declaration_ids: ["A-001"],
    required_read_first: [],
    required_pair_artifact: null,
    required_gates: ["design-declarations"],
  },
};
const manifest: DocumentAgentScopeManifest = {
  schema_version: 1,
  include_roots: ["docs/design/helix"],
  exclude_roots: [],
  documents: [path],
  required_gates: ["design-declarations"],
  phase: "apply",
};
const report: DocumentAgentMetadataReport = {
  schema_version: 1,
  manifest_digest: "sha256:fixture",
  checked_paths: [path],
  proposed: { [path]: metadata },
  findings: [],
  ok: true,
};

function fixture(): { root: string; absolute: string } {
  const root = mkdtempSync(join(tmpdir(), "helix-agent-metadata-"));
  const absolute = join(root, path);
  mkdirSync(join(root, "docs", "design", "helix"), { recursive: true });
  writeFileSync(absolute, "---\ntitle: fixture\nspec: {}\n---\n\n# 本文\n", "utf8");
  return { root, absolute };
}

describe("document agent metadata integration", () => {
  it("IT-AGMETA-004: write-port経由で明示selectionだけをdurableにapplyする", () => {
    const { root, absolute } = fixture();
    try {
      const plan = planDocumentAgentMetadataApply({
        manifest,
        report,
        selection: [path],
        source: {
          read: (candidate) => (candidate === path ? readFileSync(absolute, "utf8") : null),
        },
      });
      const receipt = applyDocumentAgentMetadata(plan, createDocumentAgentMetadataWritePort(root));

      expect(receipt).toMatchObject({ ok: true, partial: false });
      expect(readFileSync(absolute, "utf8")).toContain("document_agent:");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("IT-AGMETA-005: digest driftではsource writeをせずnon-green receiptを返す", () => {
    const { root, absolute } = fixture();
    try {
      const plan = planDocumentAgentMetadataApply({
        manifest,
        report,
        selection: [path],
        source: {
          read: (candidate) => (candidate === path ? readFileSync(absolute, "utf8") : null),
        },
      });
      writeFileSync(absolute, "drift\n", "utf8");
      const receipt = applyDocumentAgentMetadata(plan, createDocumentAgentMetadataWritePort(root));

      expect(receipt).toMatchObject({ ok: false, partial: false, changes: [] });
      expect(readFileSync(absolute, "utf8")).toBe("drift\n");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("IT-AGMETA-005: real portのpublish後faultで当該targetを含め逆順rollbackする", () => {
    const { root, absolute } = fixture();
    const secondPath = "docs/design/helix/b.md";
    const secondAbsolute = join(root, secondPath);
    writeFileSync(secondAbsolute, "---\ntitle: second\nspec: {}\n---\n\n# 本文\n", "utf8");
    const beforeFirst = readFileSync(absolute, "utf8");
    const beforeSecond = readFileSync(secondAbsolute, "utf8");
    try {
      const plan = planDocumentAgentMetadataApply({
        manifest: { ...manifest, documents: [path, secondPath] },
        report: { ...report, proposed: { [path]: metadata, [secondPath]: metadata } },
        selection: [path, secondPath],
        source: { read: (candidate) => readFileSync(join(root, candidate), "utf8") },
      });
      let forwardPublishes = 0;
      const receipt = applyDocumentAgentMetadata(
        plan,
        createDocumentAgentMetadataWritePort(root, {
          afterPublish: (_change, operation) => {
            if (operation === "write" && ++forwardPublishes === 2)
              throw new Error("fault after real rename/fsync");
          },
        }),
      );

      expect(receipt).toMatchObject({ ok: false, partial: false, ambiguous: false });
      expect(receipt.changes.map((change) => [change.path, change.rolledBack])).toEqual([
        [path, true],
        [secondPath, true],
      ]);
      expect(readFileSync(absolute, "utf8")).toBe(beforeFirst);
      expect(readFileSync(secondAbsolute, "utf8")).toBe(beforeSecond);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("U-AGMETA-011: targetまでの中間ancestor symlinkを拒否する", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-agent-metadata-symlink-"));
    const outside = mkdtempSync(join(tmpdir(), "helix-agent-metadata-outside-"));
    try {
      mkdirSync(join(root, "docs"));
      symlinkSync(outside, join(root, "docs", "design"), "dir");
      mkdirSync(join(outside, "helix"));
      const outsideTarget = join(outside, "helix", "a.md");
      writeFileSync(outsideTarget, "---\ntitle: outside\nspec: {}\n---\n", "utf8");
      const change = {
        path,
        beforeContent: readFileSync(outsideTarget, "utf8"),
        content: "changed\n",
        beforeDigest: "unused",
        afterDigest: "unused",
      };
      expect(() => createDocumentAgentMetadataWritePort(root).write(change)).toThrow(/symlink/);
      expect(readFileSync(outsideTarget, "utf8")).toBe(change.beforeContent);
    } finally {
      rmSync(root, { recursive: true, force: true });
      rmSync(outside, { recursive: true, force: true });
    }
  });
});
