import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { admitLiteConsumerCommand } from "../src/setup/distribution-consumer-command-registry";
import {
  buildLiteDistributionPackage,
  LITE_DOCUMENT_SOURCES,
  loadLiteDistributionDocuments,
  validateLiteDistributionDocumentBytes,
} from "../src/setup/distribution-lite-package";

// PLAN-L7-658-lite-consumer-distribution-docs
const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

const digest = (bytes: Buffer | string): string =>
  `sha256:${createHash("sha256").update(bytes).digest("hex")}`;

describe("PLAN-L7-658: Lite consumer distribution documents", () => {
  it("U-DISTDOC-001: README／LICENSE／attribution／provenance／免責をexact digestへ束縛する", () => {
    const docs = loadLiteDistributionDocuments(process.cwd());
    expect(docs?.map((doc) => doc.path).sort()).toEqual([
      "DISCLAIMER.md",
      "LICENSE",
      "PROVENANCE.md",
      "README.md",
      "THIRD_PARTY_NOTICES.md",
    ]);
    for (const doc of docs ?? []) {
      expect(doc.digest).toBe(digest(readFileSync(doc.source_path)));
    }
  });

  it("U-DISTDOC-002: artifactはdevelopment READMEをcurrent consumer guidanceへ再出力しない", () => {
    const out = mkdtempSync(join(tmpdir(), "helix-lite-docs-"));
    roots.push(out);
    const result = buildLiteDistributionPackage({
      repo_root: process.cwd(),
      out_dir: out,
      profile_id: "consumer_core_v1",
    });
    expect(result.ok).toBe(true);
    if (!result.ok || !("paths" in result)) return;
    expect(result.manifest.distribution_documents).toEqual(
      loadLiteDistributionDocuments(process.cwd()),
    );
    const extracted = mkdtempSync(join(tmpdir(), "helix-lite-docs-extracted-"));
    roots.push(extracted);
    const tar = spawnSync("tar", ["-xzf", result.paths.tarball, "-C", extracted], {
      encoding: "utf8",
      timeout: 10_000,
    });
    expect(tar.status, tar.stderr).toBe(0);
    const sourceReadme = readFileSync("README.md", "utf8");
    const consumerReadme = readFileSync("README-LITE.md", "utf8");
    const archivedReadme = readFileSync(join(extracted, "README.md"), "utf8");
    expect(sourceReadme).toContain("このリポジトリは開発用のsource checkoutです");
    expect(consumerReadme).not.toContain("development / private");
    expect(consumerReadme).not.toContain("node /path/to/HELIX-HARNESS");
    expect(archivedReadme).toBe(consumerReadme);
  });

  it("U-DISTDOC-003: READMEの正規Lite commandをregistryが全てadmitする", () => {
    const commands = [
      ["setup", "project", "--dry-run", "--json"],
      ["setup", "project", "--json"],
      ["status", "--json"],
      ["doctor", "--profile", "consumer", "--json"],
      ["codex", "--role", "se", "--task", "consumer task", "--json"],
      ["claude", "--role", "qa", "--task", "consumer review", "--json"],
      ["completion", "decision-packet", "--json"],
      ["completion", "review-bundle", "--json"],
    ];
    for (const argv of commands)
      expect(admitLiteConsumerCommand(argv).ok, argv.join(" ")).toBe(true);
  });

  it("U-DISTDOC-004: 各文書欠落をexact set violationとして拒否する", () => {
    const complete = Object.fromEntries(
      Object.entries(LITE_DOCUMENT_SOURCES).map(([path, source]) => [path, readFileSync(source)]),
    );
    for (const path of Object.keys(LITE_DOCUMENT_SOURCES)) {
      const missing = { ...complete };
      delete missing[path];
      expect(validateLiteDistributionDocumentBytes(missing), path).toContain(
        "document_exact_set_invalid",
      );
    }
  });

  it("U-DISTDOC-005: development guidance／absolute path／credential例を拒否する", () => {
    const complete = Object.fromEntries(
      Object.entries(LITE_DOCUMENT_SOURCES).map(([path, source]) => [path, readFileSync(source)]),
    );
    for (const mutation of [
      "development / private",
      "node /path/to/HELIX-HARNESS/dist/helix.js",
      "helix team run",
    ]) {
      expect(
        validateLiteDistributionDocumentBytes({ ...complete, "README.md": mutation }),
        mutation,
      ).toContain("consumer_readme_invalid");
    }
    for (const mutation of [
      "/home/alice/project",
      "C:\\Users\\alice\\project",
      "ghp_exampletoken",
    ]) {
      expect(
        validateLiteDistributionDocumentBytes({ ...complete, "DISCLAIMER.md": mutation }),
        mutation,
      ).toContain("document_sensitive_content");
    }
  });
});
