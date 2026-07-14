import { existsSync, mkdtempSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { writeDocumentReportArtifact } from "../src/runtime/document-report-write-port";

// PLAN-L7-457-document-diff-local-artifact-output

describe("document report write port", () => {
  it("U-DOCDIFF-008: 専用rootへnew-file-onlyでpublishし、dry-runとpath escapeを拒否する", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-doc-report-"));
    try {
      expect(
        writeDocumentReportArtifact({ repoRoot: root, path: "report.md", content: "# レポート\n" }),
      ).toMatchObject({ durable: true, path: "report.md" });
      expect(() =>
        writeDocumentReportArtifact({ repoRoot: root, path: "report.md", content: "x" }),
      ).toThrow("target_exists");
      expect(() =>
        writeDocumentReportArtifact({ repoRoot: root, path: "../escape.md", content: "x" }),
      ).toThrow("path_escapes_root");
      expect(
        writeDocumentReportArtifact({ repoRoot: root, path: "dry.md", content: "x", dryRun: true }),
      ).toBeNull();
      expect(existsSync(join(root, ".helix", "artifacts", "document-diff", "dry.md"))).toBe(false);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
