import { describe, expect, it } from "vitest";
import {
  applyDocumentAgentMetadata,
  type DocumentAgentMetadataSource,
  type DocumentAgentMetadataWritePort,
  planDocumentAgentMetadataApply,
  renderDocumentAgentMetadata,
} from "../src/runtime/document-agent-metadata-apply";
import type {
  DocumentAgentMetadata,
  DocumentAgentMetadataReport,
  DocumentAgentScopeManifest,
} from "../src/schema/document-agent-metadata";

// PLAN-L7-456-document-agent-metadata-phase-b-apply

const path = "docs/design/helix/a.md";
const sourceText = "---\ntitle: テスト\nspec: {}\n---\n\n# 本文\n";
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
  manifest_digest: "sha256:test",
  checked_paths: [path],
  proposed: { [path]: metadata },
  findings: [],
  ok: true,
};
const source: DocumentAgentMetadataSource = {
  read: (candidate) => (candidate === path ? sourceText : null),
};

describe("document agent metadata Phase B apply", () => {
  it("U-AGMETA-008: 空・scope外 selectionをfail-closeする", () => {
    expect(() =>
      planDocumentAgentMetadataApply({ manifest, report, selection: [], source }),
    ).toThrow("selection_invalid");
    expect(() =>
      planDocumentAgentMetadataApply({ manifest, report, selection: ["docs/out.md"], source }),
    ).toThrow("selection_out_of_scope");
  });

  it("U-AGMETA-009: 構造findingはrejectし、repairable metadata findingはapply planを作る", () => {
    expect(() =>
      planDocumentAgentMetadataApply({
        manifest,
        report: {
          ...report,
          ok: false,
          findings: [
            { code: "scope_invalid", path, declaration_id: null, severity: "error", detail: "bad" },
          ],
        },
        selection: [path],
        source,
      }),
    ).toThrow("report_not_repairable");
    expect(
      planDocumentAgentMetadataApply({
        manifest,
        report: {
          ...report,
          ok: false,
          findings: [
            {
              code: "metadata_invalid",
              path,
              declaration_id: null,
              severity: "error",
              detail: "repair",
            },
          ],
        },
        selection: [path],
        source,
      }).changes,
    ).toHaveLength(1);
  });

  it("U-AGMETA-010: document_agentだけをdeterministicにupsertする", () => {
    const rendered = renderDocumentAgentMetadata(sourceText, metadata);
    expect(rendered).toContain("document_agent:\n  defines:\n    - A-001");
    expect(rendered).toContain("title: テスト\nspec: {}");
    expect(rendered).toContain("# 本文");
  });

  it("U-AGMETA-011: port拒否時はwrite後のsuccessを返さない", () => {
    const plan = planDocumentAgentMetadataApply({ manifest, report, selection: [path], source });
    const port: DocumentAgentMetadataWritePort = {
      write: () => {
        throw new Error("rejected");
      },
      restore: () => ({ durable: true }),
    };
    expect(applyDocumentAgentMetadata(plan, port)).toMatchObject({
      ok: false,
      partial: false,
      changes: [],
    });
  });

  it("U-AGMETA-012: publish途中失敗をreverse rollbackする", () => {
    const second = "docs/design/helix/b.md";
    const plan = planDocumentAgentMetadataApply({
      manifest: { ...manifest, documents: [path, second] },
      report: { ...report, proposed: { [path]: metadata, [second]: metadata } },
      selection: [path, second],
      source: { read: () => sourceText },
    });
    const restored: string[] = [];
    const port: DocumentAgentMetadataWritePort = {
      write: (change) => {
        if (change.path === second) throw new Error("fault");
        return { durable: true };
      },
      restore: (change) => {
        restored.push(change.path);
        return { durable: true };
      },
    };
    expect(applyDocumentAgentMetadata(plan, port)).toMatchObject({ ok: false, partial: false });
    expect(restored).toEqual([path]);
  });
});
