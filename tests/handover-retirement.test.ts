import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { checkHandoverRetirementInventory } from "../src/doctor/index";
import {
  analyzeHandoverRetirementInventory,
  classifyHandoverRetirementReferences,
  HANDOVER_RETIREMENT_RULES,
  type HandoverRetirementRule,
  handoverRetirementInventoryMessages,
} from "../src/lint/handover-retirement";

describe("session handover retirement inventory", () => {
  it("U-HRET-001: typed surfaceを5種類へ分類する", () => {
    const result = classifyHandoverRetirementReferences([
      { path: "src/cli.ts", line: 1, symbol: "runHandover() for helix handover" },
      {
        path: "src/runtime/provider-handover.ts",
        line: 1,
        symbol: "provider-handover audit evidence",
      },
      {
        path: "docs/design/harness/L14-operations/x.md",
        line: 1,
        symbol: "operations handover transition",
      },
      {
        path: "docs/archive/x.md",
        line: 1,
        symbol: "historical helix handover",
      },
      {
        path: "tests/handover.test.ts",
        line: 1,
        symbol: "CURRENT.json legacy writer",
      },
    ]);

    expect(result.ok).toBe(true);
    expect(result.retirementReady).toBe(false);
    expect(result.classified.map((reference) => reference.kind)).toEqual([
      "session_prose",
      "provider_evidence",
      "operations_transition",
      "legacy_archive",
      "compatibility_only",
    ]);
  });

  it("U-HRET-001: preserve型へのsession continuation混入を拒否する", () => {
    const result = classifyHandoverRetirementReferences([
      {
        path: "src/runtime/provider-handover.ts",
        line: 1,
        symbol: "runHandover writes CURRENT.json for provider delegation",
      },
    ]);

    expect(result.ok).toBe(false);
    expect(result.preserveBoundaryViolations).toHaveLength(1);
    expect(result.preserveBoundaryViolations[0]?.kind).toBe("provider_evidence");
  });

  it("U-HRET-001: provider型のreader/pointer混入と別節の否定語による免罪を拒否する", () => {
    const result = classifyHandoverRetirementReferences([
      {
        path: "src/runtime/provider-handover.ts",
        line: 1,
        symbol:
          "provider delegation must not be a continuation source; readHandover loads CURRENT.json pointer",
      },
      {
        path: "src/runtime/provider-handover.ts",
        line: 2,
        symbol: "provider delegation writes CURRENT.json for next action",
      },
    ]);

    expect(result.ok).toBe(false);
    expect(result.preserveBoundaryViolations).toHaveLength(2);
  });

  it("U-HRET-001: provider固有CURRENT操作だけをpreserve型として許可する", () => {
    const result = classifyHandoverRetirementReferences([
      {
        path: "src/runtime/provider-handover.ts",
        line: 1,
        symbol: "runProviderHandover writes .helix/handover/provider/CURRENT.json audit evidence",
      },
    ]);

    expect(result.ok).toBe(true);
    expect(result.preserveBoundaryViolations).toEqual([]);
  });

  it("U-HRET-001: tests/templates残存と空inventoryをretirement readyにしない", () => {
    const residual = classifyHandoverRetirementReferences([
      {
        path: "tests/new-continuation.test.ts",
        line: 1,
        symbol: "expect runHandover() and CURRENT.json writer to stay green",
      },
      {
        path: "docs/templates/AGENTS.md",
        line: 1,
        symbol: "helix handover writes CURRENT.json",
      },
    ]);

    expect(residual.ok).toBe(true);
    expect(residual.activeSessionProse).toHaveLength(2);
    expect(residual.retirementReady).toBe(false);
    expect(classifyHandoverRetirementReferences([]).retirementReady).toBe(false);
  });

  it("U-HRET-001: ADR/memory/archive/handover rootをinventory対象に固定する", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-hret-roots-"));
    try {
      const fixtures = [
        ["docs/adr/a.md", "session handover contract"],
        ["docs/memory/a.md", "session handover memory"],
        ["docs/archive/a.md", "historical handover"],
        ["docs/handover/a.md", "historical handover"],
      ] as const;
      for (const [path, text] of fixtures) {
        mkdirSync(join(root, path, ".."), { recursive: true });
        writeFileSync(join(root, path), `${text}\n`, "utf8");
      }

      const result = analyzeHandoverRetirementInventory(root);
      expect(result.scannedFiles).toBe(4);
      expect(result.referenceCount).toBe(4);
      expect(result.unclassified).toEqual([]);
      expect(result.byKind.session_prose).toBe(2);
      expect(result.byKind.legacy_archive).toBe(2);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("U-HRET-001: 未分類と異なるkindの重複分類をhard failする", () => {
    const providerRule = HANDOVER_RETIREMENT_RULES[0];
    expect(providerRule).toBeDefined();
    if (!providerRule) throw new Error("provider rule fixture is missing");
    const duplicateRule: HandoverRetirementRule = {
      ...providerRule,
      ruleId: "contradict-provider-as-session",
      kind: "session_prose",
    };
    const conflict = classifyHandoverRetirementReferences(
      [
        {
          path: "src/runtime/provider-handover.ts",
          line: 1,
          symbol: "provider-handover audit evidence",
        },
      ],
      [...HANDOVER_RETIREMENT_RULES, duplicateRule],
    );
    expect(conflict.ok).toBe(false);
    expect(conflict.conflicts).toHaveLength(1);

    const unclassified = classifyHandoverRetirementReferences([
      { path: "misc/x.txt", line: 1, symbol: "unknown handover vocabulary" },
    ]);
    expect(unclassified.ok).toBe(false);
    expect(unclassified.unclassified).toHaveLength(1);
  });

  it("U-HRET-001: real repoのlive参照を未分類0で束縛する", () => {
    const result = analyzeHandoverRetirementInventory(process.cwd());

    expect(result.scannedFiles).toBeGreaterThan(500);
    expect(result.referenceCount).toBeGreaterThan(100);
    expect(result.unclassified, handoverRetirementInventoryMessages(result).join("\n")).toEqual([]);
    expect(result.conflicts, handoverRetirementInventoryMessages(result).join("\n")).toEqual([]);
    expect(result.ok).toBe(true);
    expect(result.retirementReady).toBe(false);
    expect(result.activeSessionProse.length).toBeGreaterThan(0);
    expect(result.byKind.compatibility_only).toBeGreaterThan(0);
    const doctor = checkHandoverRetirementInventory(process.cwd());
    expect(doctor.ok).toBe(true);
    expect(doctor.messages[0]).toContain("handover-retirement-inventory - OK");
  });
});
