import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import { checkDriveRouteCatalog } from "../src/doctor/index";
import {
  admitWorkflowCatalogDoctorSurfaces,
  analyzeWorkflowClassificationCatalog,
  loadWorkflowClassificationCatalogLint,
  workflowClassificationCatalogMessages,
} from "../src/lint/workflow-classification-catalog";
import {
  loadWorkflowClassificationCatalog,
  type WorkflowClassificationCatalog,
} from "../src/schema/workflow-classification-catalog";

function currentCatalog(): WorkflowClassificationCatalog {
  return structuredClone(loadWorkflowClassificationCatalog(process.cwd()));
}

function doctorFixture(): string {
  const root = mkdtempSync(join(tmpdir(), "helix-workflow-catalog-doctor-"));
  const files = [
    "docs/design/helix/L3-requirements/workflow-classification-registry.v1.json",
    "docs/governance/helix-harness-requirements_v1.3.md",
    "config/workflow-classification-catalog.v1.json",
    "config/drive-route-catalog.json",
  ];
  for (const relative of files) {
    const target = join(root, relative);
    mkdirSync(dirname(target), { recursive: true });
    cpSync(relative, target);
  }
  const legacy = JSON.parse(readFileSync("config/drive-route-catalog.json", "utf8")) as {
    routes: Array<{ document: string }>;
    specialist_workflows: Array<{ document: string }>;
  };
  for (const relative of [
    ...legacy.routes.map((route) => route.document),
    ...legacy.specialist_workflows.map((workflow) => workflow.document),
  ]) {
    const target = join(root, relative);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, "# compatibility fixture\n");
  }
  return root;
}

describe("requirements-owned workflow classification catalog lint", () => {
  it("U-WFCATL-004: compatibility greenでcurrent authority failureを相殺しない", () => {
    expect(admitWorkflowCatalogDoctorSurfaces(false, true)).toBe(false);
    expect(admitWorkflowCatalogDoctorSurfaces(true, false)).toBe(false);
    expect(admitWorkflowCatalogDoctorSurfaces(true, true)).toBe(true);

    const root = doctorFixture();
    try {
      writeFileSync(join(root, "config/workflow-classification-catalog.v1.json"), "{}\n");
      const result = checkDriveRouteCatalog(root);
      expect(result.ok).toBe(false);
      expect(result.messages).toEqual(
        expect.arrayContaining([
          expect.stringContaining("workflow-classification-catalog - violation"),
          expect.stringContaining("legacy-drive-route-inventory - OK"),
        ]),
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("U-WFCATL-001: generated projectionのversion／digest／typed axisをcurrent authorityとして受理する", () => {
    const result = loadWorkflowClassificationCatalogLint(process.cwd());
    expect(result.ok).toBe(true);
    expect(result.registryVersion).toBe("1.1.6");
    expect(result.axes).toBeGreaterThan(1);
    expect(result.entities).toBeGreaterThan(15);
    expect(workflowClassificationCatalogMessages(result)[0]).toContain(
      "authority=generated_projection",
    );
  });

  it("U-WFCATL-002: typed identity重複とmissing parentをfail-closeする", () => {
    const catalog = currentCatalog();
    const first = catalog.entities[0];
    const child = catalog.entities.find((entity) => entity.parent_ids);
    if (!first || !child) throw new Error("typed catalog fixture missing");
    catalog.entities.push(structuredClone(first));
    child.parent_ids = ["MISSING_PARENT"];
    const result = analyzeWorkflowClassificationCatalog(catalog);
    expect(result.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ reason: "typed_identity_duplicate" }),
        expect.objectContaining({ reason: "typed_parent_missing" }),
      ]),
    );
  });

  it("U-WFCATL-003: signal target missing／axis mismatch／別identity重複を分離する", () => {
    const catalog = currentCatalog();
    const first = catalog.signal_bindings[0];
    const second = catalog.signal_bindings[1];
    if (!first || !second) throw new Error("signal binding fixture missing");
    first.target_id = "MISSING_TARGET";
    second.target_axis = "execution_mode";
    second.signals = [first.signals[0] ?? "duplicate_signal"];
    const result = analyzeWorkflowClassificationCatalog(catalog);
    expect(result.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ reason: "typed_signal_target_missing" }),
        expect.objectContaining({ reason: "typed_signal_target_axis_mismatch" }),
        expect.objectContaining({ reason: "typed_signal_duplicate" }),
      ]),
    );
  });
});
