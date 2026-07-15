import {
  existsSync,
  fsyncSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  rmSync,
  symlinkSync,
} from "node:fs";
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
      expect(() =>
        writeDocumentReportArtifact({
          repoRoot: root,
          path: "../dry-escape.md",
          content: "x",
          dryRun: true,
        }),
      ).toThrow("path_escapes_root");

      const outside = join(root, "outside");
      mkdirSync(outside);
      symlinkSync(outside, join(root, ".helix", "artifacts", "document-diff", "link"));
      expect(() =>
        writeDocumentReportArtifact({
          repoRoot: root,
          path: "link/nested/report.md",
          content: "x",
        }),
      ).toThrow("parent_untrusted");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("HELIX管理rootのancestor symlinkを辿らない", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-doc-report-root-link-"));
    try {
      const outside = join(root, "outside");
      mkdirSync(outside);
      symlinkSync(outside, join(root, ".helix"));
      expect(() =>
        writeDocumentReportArtifact({
          repoRoot: root,
          path: "nested/report.md",
          content: "x",
        }),
      ).toThrow("root_untrusted");
      expect(existsSync(join(outside, "artifacts", "document-diff", "nested", "report.md"))).toBe(
        false,
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("publish後のdurability failureをunlinkとdirectory fsyncで補償する", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-doc-report-fsync-"));
    let calls = 0;
    try {
      expect(() =>
        writeDocumentReportArtifact(
          { repoRoot: root, path: "report.md", content: "x" },
          {
            fsync: (fd) => {
              calls += 1;
              if (calls === 2) throw new Error("simulated_directory_fsync_failure");
              fsyncSync(fd);
            },
          },
        ),
      ).toThrow("simulated_directory_fsync_failure");
      expect(calls).toBe(3);
      expect(existsSync(join(root, ".helix", "artifacts", "document-diff", "report.md"))).toBe(
        false,
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("publish前のfile fsync failureでtempを残さない", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-doc-report-file-fsync-"));
    try {
      expect(() =>
        writeDocumentReportArtifact(
          { repoRoot: root, path: "report.md", content: "x" },
          {
            fsync: () => {
              throw new Error("simulated_file_fsync_failure");
            },
          },
        ),
      ).toThrow("simulated_file_fsync_failure");
      const artifactRoot = join(root, ".helix", "artifacts", "document-diff");
      expect(readdirSync(artifactRoot)).toEqual([]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
