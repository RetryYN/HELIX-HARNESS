import { describe, expect, it } from "vitest";
import {
  analyzeCodingRules,
  loadCodingRuleDocs,
  loadCodingRulePolicy,
  loadCodingWorkflowDocs,
  SOURCE_MODULE_CATALOG,
  SOURCE_MODULE_POLICY,
} from "../src/lint/coding-rules";
import { importedSourceModule, sourceModule } from "../src/lint/shared";
import { evaluateSourceBoundary } from "../src/lint/source-boundary-policy";
import type { SourceEdge } from "../src/lint/source-edge-extractor";
import { extractSourceEdges } from "../src/lint/source-edge-extractor";

describe("PLAN-L7-452-source-boundary-policy-ratchet integration", () => {
  it("IT-SBOUND-005: real repository graphをproduction policyで全域判定する", () => {
    const docs = loadCodingRuleDocs();
    const result = analyzeCodingRules(docs, loadCodingRulePolicy(), loadCodingWorkflowDocs());
    expect(result.violations.filter((violation) => violation.rule === "module-boundary")).toEqual(
      [],
    );
    const livePairs = new Set<string>();
    for (const doc of docs.filter((candidate) => candidate.scope === "source")) {
      for (const edge of extractSourceEdges([{ path: doc.path, source: doc.text }])) {
        if (!edge.specifier?.startsWith(".")) continue;
        const from = sourceModule(edge.from);
        const to = importedSourceModule(edge.from, edge.specifier);
        if (from && to) livePairs.add(`${from}->${to}`);
      }
    }
    const policyPairs = new Set(
      SOURCE_MODULE_POLICY.exceptions.map((exception) => `${exception.from}->${exception.to}`),
    );
    expect([...policyPairs].sort()).toEqual([...livePairs].sort());
  });

  it("IT-SBOUND-006: 各explicit direction除去mutationをdefault denyへ戻す", () => {
    for (const exception of SOURCE_MODULE_POLICY.exceptions) {
      const edge: SourceEdge = {
        from: `src/${exception.from}/fixture.ts`,
        specifier: `../${exception.to}/target`,
        kind: "import",
        line: 1,
        reason: "direction mutation fixture",
      };
      const mutated = {
        ...SOURCE_MODULE_POLICY,
        exceptions: SOURCE_MODULE_POLICY.exceptions.filter(
          (candidate) => candidate.from !== exception.from || candidate.to !== exception.to,
        ),
      };
      expect(evaluateSourceBoundary(edge, SOURCE_MODULE_CATALOG, mutated)).toEqual(
        expect.objectContaining({ decision: "deny", reason: "owner default deny" }),
      );
    }
  });
});
