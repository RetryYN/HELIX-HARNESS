import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildAgentCatalogWatchReport,
  classifyAgentCatalogCandidate,
  parseAgentCatalogInventory,
} from "../src/runtime/agent-catalog-watch";

describe("agent catalog watch", () => {
  it("normalizes catalog rows to HELIX capability families", () => {
    expect(
      classifyAgentCatalogCandidate("agent-lsp", "https://github.com/example/agent-lsp"),
    ).toMatchObject({
      capability_family: "browser_lsp_tooling",
      adoption_status: "candidate",
    });
    expect(
      classifyAgentCatalogCandidate("Agent Sessions", "https://github.com/example/sessions"),
    ).toMatchObject({
      capability_family: "agent_session_control",
      adoption_status: "candidate",
    });
  });

  it("fails closed for rows that cannot be mapped", () => {
    const [candidate] = parseAgentCatalogInventory("opaque\tunknown");
    expect(candidate).toMatchObject({
      capability_family: "unclassified",
      adoption_status: "unclassified",
    });
  });

  it("emits inventory digest and unclassified findings", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-agent-catalog-"));
    try {
      const inventoryPath = "docs/governance/catalog.tsv";
      const auditPath = "docs/governance/audit.md";
      mkdirSync(join(root, "docs", "governance"), { recursive: true });
      writeFileSync(
        join(root, inventoryPath),
        ["agent-lsp\thttps://github.com/example/agent-lsp", "opaque\tunknown", ""].join("\n"),
      );
      writeFileSync(join(root, auditPath), "# audit\n");

      const report = buildAgentCatalogWatchReport(root, { inventoryPath, auditPath });
      expect(report.ok).toBe(false);
      expect(report.inventory_count).toBe(2);
      expect(report.inventory_sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(report.unclassified_count).toBe(1);
      expect(report.findings).toContainEqual(
        expect.objectContaining({ code: "unclassified_candidate", severity: "error" }),
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
