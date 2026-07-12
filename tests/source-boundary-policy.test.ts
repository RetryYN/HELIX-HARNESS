import { describe, expect, it } from "vitest";
import {
  evaluateSourceBoundary,
  type ModuleCatalog,
  validateBoundaryPolicyCoverage,
} from "../src/lint/source-boundary-policy";
import { extractSourceEdges } from "../src/lint/source-edge-extractor";

const catalog: ModuleCatalog = {
  owners: ["state-db", "vscode"],
  ownerOf: (path) =>
    path.includes("state-db") ? "state-db" : path.includes("vscode") ? "vscode" : null,
  resolve: (_from, specifier) =>
    specifier.includes("state-db") ? "state-db" : specifier.includes("vscode") ? "vscode" : null,
};
const policy = {
  defaults: { "state-db": "deny" as const, vscode: "deny" as const },
  exceptions: [
    {
      from: "state-db",
      to: "vscode",
      decision: "deny" as const,
      owner: "architecture",
      rationale: "persistence must not import presentation",
      review_trigger: "owner change",
    },
    {
      from: "vscode",
      to: "state-db",
      decision: "deny" as const,
      owner: "architecture",
      rationale: "presentation must use contracts",
      review_trigger: "owner change",
    },
  ],
};

describe("PLAN-L7-452-source-boundary-policy-ratchet behavior", () => {
  it("U-SBOUND-003: unknown owner/default/edge decisionをunspecifiedにする", () => {
    const [edge] = extractSourceEdges([
      { path: "src/unknown/a.ts", source: 'import "../vscode/x";' },
    ]);
    expect(edge).toBeDefined();
    if (!edge) throw new Error("fixture edge missing");
    expect(evaluateSourceBoundary(edge, catalog, policy).decision).toBe("unspecified");
    expect(
      validateBoundaryPolicyCoverage(catalog, [edge], { ...policy, defaults: { vscode: "deny" } }),
    ).toEqual(
      expect.arrayContaining([expect.objectContaining({ reason: "missing_owner_default" })]),
    );
    const [known] = extractSourceEdges([
      { path: "src/state-db/a.ts", source: 'import "../state-db/b";' },
    ]);
    expect(known).toBeDefined();
    if (!known) throw new Error("known fixture edge missing");
    expect(evaluateSourceBoundary(known, catalog, policy)).toEqual(
      expect.objectContaining({ decision: "deny", reason: "owner default deny" }),
    );
  });

  it("U-SBOUND-007: incomplete policy metadataを拒否する", () => {
    const exception = policy.exceptions[0];
    if (!exception) throw new Error("policy fixture missing");
    expect(
      validateBoundaryPolicyCoverage(catalog, [], {
        ...policy,
        exceptions: [{ ...exception, rationale: "" }],
      }),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ reason: "incomplete_exception_metadata" }),
      ]),
    );
    expect(
      validateBoundaryPolicyCoverage(catalog, [], {
        ...policy,
        exceptions: [exception, { ...exception }],
      }),
    ).toEqual(
      expect.arrayContaining([expect.objectContaining({ reason: "duplicate_exception_pair" })]),
    );
  });

  it("U-SBOUND-008: all supported syntaxを抽出しcomputed formをfail-closeする", () => {
    const edges = extractSourceEdges([
      {
        path: "src/state-db/a.ts",
        source: [
          'import value from "../vscode/a";',
          'import type { T } from "../vscode/t";',
          'export { x } from "../vscode/e";',
          'import x = require("../vscode/q");',
          'require("../vscode/r");',
          'import("../vscode/d");',
          "require(target);",
          "import(target);",
        ].join("\n"),
      },
    ]);
    expect(edges.map((edge) => edge.kind)).toEqual([
      "import",
      "type_import",
      "re_export",
      "import_equals",
      "literal_require",
      "dynamic_import",
      "unknown_edge_kind",
      "unknown_edge_kind",
    ]);
    expect(
      edges
        .filter((edge) => edge.kind === "unknown_edge_kind")
        .every((edge) => edge.specifier === null),
    ).toBe(true);
    expect(
      validateBoundaryPolicyCoverage(catalog, edges, policy).map((finding) => finding.reason),
    ).toContain("computed or nonliteral require");
  });

  it("U-SBOUND-011: allow、expiry、review triggerをfail-close評価する", () => {
    const [edge] = extractSourceEdges([
      { path: "src/state-db/a.ts", source: 'import "../vscode/b";' },
    ]);
    if (!edge) throw new Error("allow fixture edge missing");
    const allow = {
      from: "state-db",
      to: "vscode",
      decision: "allow" as const,
      owner: "architecture",
      rationale: "temporary migration",
      review_trigger: "owner change",
      expiry: "2026-08-01T00:00:00Z",
      successor_plan: "PLAN-L7-450-state-db-vscode-decoupling",
    };
    expect(
      evaluateSourceBoundary(edge, catalog, {
        defaults: policy.defaults,
        exceptions: [allow],
        evaluated_at: "2026-07-13T00:00:00Z",
      }).decision,
    ).toBe("allow");
    expect(
      evaluateSourceBoundary(edge, catalog, {
        defaults: policy.defaults,
        exceptions: [allow],
        evaluated_at: "2026-08-01T00:00:00Z",
      }),
    ).toEqual(expect.objectContaining({ decision: "deny", reason: "temporary exception expired" }));
    expect(
      evaluateSourceBoundary(edge, catalog, {
        defaults: policy.defaults,
        exceptions: [allow],
        evaluated_at: "2026-07-13T00:00:00Z",
        triggered_reviews: ["owner change"],
      }),
    ).toEqual(
      expect.objectContaining({ decision: "deny", reason: "exception review trigger fired" }),
    );
  });
});
