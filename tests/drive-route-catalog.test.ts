import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  analyzeDriveRouteCatalog,
  driveRouteCatalogMessages,
  LEGACY_DRIVE_ROUTE_INVENTORY_DIGEST,
  loadDriveRouteCatalog,
} from "../src/lint/drive-route-catalog";

function validCatalog(): Record<string, unknown> {
  return structuredClone(
    loadDriveRouteCatalog(process.cwd()).catalog as unknown as Record<string, unknown>,
  );
}

describe("drive route catalog", () => {
  it("U-DRCAT-001: [PLAN-L7-476-drive-route-catalog-gate] frozen compatibility inventoryを受理する", () => {
    const result = loadDriveRouteCatalog(process.cwd());
    expect(result.ok).toBe(true);
    expect(result.routes).toBe(15);
    expect(result.specialists).toBe(2);
    expect(driveRouteCatalogMessages(result)[0]).toContain("compatibility_input_only");
    expect(result.catalog).toMatchObject({
      authority_role: "compatibility_inventory",
      current_authority: "config/workflow-classification-catalog.v1.json",
    });
  });

  it("U-DRCAT-002: [PLAN-L7-476-drive-route-catalog-gate] route欠落、孤児遷移、文書欠落をfail-closeする", () => {
    const raw = validCatalog();
    const routes = raw.routes as Array<Record<string, unknown>>;
    routes.pop();
    routes[0].next_routes = ["missing_route"];
    routes[0].document = "docs/process/missing.md";
    const result = analyzeDriveRouteCatalog(raw, () => false);
    expect(result.ok).toBe(false);
    expect(result.findings.map((finding) => finding.reason)).toEqual(
      expect.arrayContaining(["next_route_missing", "document_missing"]),
    );
  });

  it("U-DRCAT-003: [PLAN-L7-476-drive-route-catalog-gate] compatibility inventory内部の重複を拒否する", () => {
    const raw = validCatalog();
    const routes = raw.routes as Array<Record<string, unknown>>;
    const discovery = routes.find((route) => route.route_id === "discovery");
    if (!discovery) throw new Error("fixture route missing");
    discovery.allowed_kinds = ["poc", "impl", "impl"];
    discovery.entry_signals = ["requirement_undefined", "requirement_undefined"];
    const result = analyzeDriveRouteCatalog(raw, () => true);
    expect(result.findings.map((finding) => finding.reason)).toEqual(
      expect.arrayContaining(["kind_duplicate_within_route", "signal_duplicate_within_route"]),
    );
  });

  it("U-DRCAT-005: [PLAN-L7-476-drive-route-catalog-gate] legacy signalをcurrent runtime正本へ照合しない", () => {
    const raw = validCatalog();
    const routes = raw.routes as Array<Record<string, unknown>>;
    const research = routes.find((route) => route.route_id === "research");
    if (!research) throw new Error("fixture route missing");
    research.entry_signals = ["unknown_research_signal", "production_incident"];
    const result = analyzeDriveRouteCatalog(raw, () => true);
    expect(result.findings).toEqual([]);
    const source = readFileSync("src/lint/drive-route-catalog.ts", "utf8");
    expect(source).not.toContain('from "../schema/mode-catalog"');
    expect(source).not.toContain('from "../schema/route-map"');
  });

  it("U-DRCAT-004: [PLAN-L7-476-drive-route-catalog-gate] historical route variantをcompatibility snapshotとして保持する", () => {
    const routes = loadDriveRouteCatalog(process.cwd()).catalog?.routes ?? [];
    const bottomUp = routes.find((route) => route.route_id === "add_feature_bottom_up");
    const forward = routes.find((route) => route.route_id === "forward_full_v");
    expect(bottomUp?.phases).toEqual(
      expect.arrayContaining(["add-design", "add-impl", "R0", "R4"]),
    );
    expect(bottomUp?.next_routes).toContain("reverse");
    expect(forward?.allowed_kinds).toEqual(["design", "impl"]);
  });

  it("U-DRCAT-006: [PLAN-L7-476-drive-route-catalog-gate] historical approval fieldsをcompatibility snapshotとして保持する", () => {
    const routes = loadDriveRouteCatalog(process.cwd()).catalog?.routes ?? [];
    const recovery = routes.find((route) => route.route_id === "recovery");
    const incident = routes.find((route) => route.route_id === "incident");
    expect(recovery?.approval_requirements).toEqual([
      expect.objectContaining({ trigger: "repair_scope_and_reopen_point" }),
    ]);
    expect(incident?.approval_requirements[0]?.approvers).toEqual(["on_call", "tl", "pm"]);
  });

  it("U-DRCAT-007: [PLAN-L7-476-drive-route-catalog-gate] historical specialist fieldsをcompatibility snapshotとして保持する", () => {
    const catalog = loadDriveRouteCatalog(process.cwd()).catalog;
    const screen = catalog?.specialist_workflows.find(
      (workflow) => workflow.workflow_id === "screen_design",
    );
    const frontend = catalog?.specialist_workflows.find(
      (workflow) => workflow.workflow_id === "frontend_design",
    );
    expect(screen).toEqual(expect.objectContaining({ layer: "L2", pair_layer: "L11" }));
    expect(frontend).toEqual(expect.objectContaining({ layer: "L10", pair_layer: "L3" }));
  });

  it("U-DRCAT-008: [PLAN-L7-479-drive-route-convergence] 全非Forward routeがForwardへ有限収束する", () => {
    const raw = validCatalog();
    const routes = raw.routes as Array<Record<string, unknown>>;
    const discovery = routes.find((route) => route.route_id === "discovery");
    const reverse = routes.find((route) => route.route_id === "reverse");
    if (!discovery || !reverse) throw new Error("fixture route missing");
    discovery.next_routes = ["reverse"];
    reverse.next_routes = ["discovery"];

    const result = analyzeDriveRouteCatalog(raw, () => true);
    expect(result.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          reason: "route_cycle_detected",
          subject: "discovery",
        }),
        expect.objectContaining({
          reason: "route_cycle_detected",
          subject: "reverse",
        }),
        expect.objectContaining({
          reason: "forward_spine_unreachable",
          subject: "discovery",
        }),
        expect.objectContaining({
          reason: "forward_spine_unreachable",
          subject: "reverse",
        }),
      ]),
    );

    discovery.next_routes = ["reverse", "forward_full_v"];
    reverse.next_routes = ["discovery", "forward_full_v"];
    const escapedCycle = analyzeDriveRouteCatalog(raw, () => true);
    expect(escapedCycle.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          reason: "route_cycle_detected",
          subject: "discovery",
        }),
        expect.objectContaining({
          reason: "route_cycle_detected",
          subject: "reverse",
        }),
      ]),
    );
  });

  it("U-DRCAT-009: [PLAN-L7-479-drive-route-convergence] route内部重複とForward終端違反を拒否する", () => {
    const raw = validCatalog();
    const routes = raw.routes as Array<Record<string, unknown>>;
    const forward = routes.find((route) => route.route_id === "forward_full_v");
    const recovery = routes.find((route) => route.route_id === "recovery");
    if (!forward || !recovery) throw new Error("fixture route missing");
    forward.next_routes = ["recovery"];
    recovery.start_layers = ["cross", "cross"];
    recovery.phases = ["diagnose", "diagnose"];
    recovery.exit_conditions = ["failure_removed", "failure_removed"];
    recovery.next_routes = ["reverse", "reverse"];

    const result = analyzeDriveRouteCatalog(raw, () => true);
    expect(result.findings.map((finding) => finding.reason)).toEqual(
      expect.arrayContaining([
        "forward_spine_not_terminal",
        "start_layer_duplicate_within_route",
        "phase_duplicate_within_route",
        "exit_condition_duplicate_within_route",
        "next_route_duplicate_within_route",
      ]),
    );
  });

  it("U-DRCAT-010: [PLAN-L7-479-drive-route-convergence] compatibility専門workflowの重複を拒否する", () => {
    const raw = validCatalog();
    const workflows = raw.specialist_workflows as Array<Record<string, unknown>>;
    workflows[0].workflow_id = workflows[1].workflow_id;

    const result = analyzeDriveRouteCatalog(raw, () => true);
    expect(result.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          reason: "specialist_duplicate",
        }),
      ]),
    );
  });

  it("U-DRCAT-011: [PLAN-L7-482-drive-model-closure] historical constructをcompatibility snapshotとして保持する", () => {
    const constructs = loadDriveRouteCatalog(process.cwd()).catalog?.classified_constructs ?? [];
    expect(constructs.map((construct) => construct.construct_id).sort()).toEqual([
      "design_refactor",
      "measurement_finding",
      "nfr_failure",
      "performance_refactor",
      "redesign",
      "scrum_reverse",
      "security_finding",
    ]);
  });

  it("U-DRCAT-012: [PLAN-L7-482-drive-model-closure] classified construct欠落・重複・孤児parentを拒否する", () => {
    const raw = validCatalog();
    const constructs = raw.classified_constructs as Array<Record<string, unknown>>;
    constructs.pop();
    constructs.push({
      ...constructs[0],
      parent_routes: ["missing_route"],
    });

    const result = analyzeDriveRouteCatalog(raw, () => true);
    expect(result.findings.map((finding) => finding.reason)).toEqual(
      expect.arrayContaining([
        "classified_construct_duplicate",
        "classified_construct_parent_missing",
      ]),
    );
  });

  it("U-DRCAT-013: [PLAN-L7-482-drive-model-closure] Issueから右腕までのprojection exact setを拘束する", () => {
    const raw = validCatalog();
    const contract = raw.projection_contract as Record<string, string[]>;
    contract.surfaces = ["issue", "plan", "branch", "pr", "db"];
    contract.identity_fields = ["catalog_route_id", "catalog_route_id"];
    const routes = raw.routes as Array<Record<string, unknown>>;
    routes[0].branch_prefixes = ["feature/", "feature/"];

    const result = analyzeDriveRouteCatalog(raw, () => true);
    expect(result.findings.map((finding) => finding.reason)).toEqual(
      expect.arrayContaining(["projection_contract_duplicate"]),
    );
  });

  it("U-DRCAT-014: [PLAN-L7-482-drive-model-closure] compatibility inventory bytesを凍結する", () => {
    const bytes = readFileSync("config/drive-route-catalog.json");
    expect(`sha256:${createHash("sha256").update(bytes).digest("hex")}`).toBe(
      LEGACY_DRIVE_ROUTE_INVENTORY_DIGEST,
    );
  });

  it("U-DRCAT-015: [PLAN-L7-482-drive-model-closure] historical branch fieldsをcompatibility snapshotとして保持する", () => {
    const routes = new Map(
      loadDriveRouteCatalog(process.cwd()).catalog?.routes.map((route) => [
        route.route_id,
        route,
      ]) ?? [],
    );
    expect(routes.get("production_scrum")?.branch_prefixes).toEqual(["design/", "feature/"]);
    expect(routes.get("v_design_scrum_impl_hybrid")?.branch_prefixes).toEqual([
      "design/",
      "feature/",
    ]);
    expect(routes.get("discovery")?.branch_prefixes).toEqual(["poc/"]);
  });

  it("U-DRCAT-016: [PLAN-L7-482-drive-model-closure] route別kindをcurrent typed axisへ再解釈しない", () => {
    const raw = validCatalog();
    const routes = raw.routes as Array<Record<string, unknown>>;
    const scrum = routes.find((route) => route.route_id === "production_scrum");
    const hybrid = routes.find((route) => route.route_id === "v_design_scrum_impl_hybrid");
    if (!scrum || !hybrid) throw new Error("fixture route missing");
    scrum.allowed_kinds = ["design", "impl"];
    hybrid.allowed_kinds = ["design", "impl", "poc"];

    const result = analyzeDriveRouteCatalog(raw, () => true);
    expect(result.findings).toEqual([]);
  });
});
