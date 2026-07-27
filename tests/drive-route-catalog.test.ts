import { describe, expect, it } from "vitest";
import {
  analyzeDriveRouteCatalog,
  driveRouteCatalogMessages,
  loadDriveRouteCatalog,
} from "../src/lint/drive-route-catalog";

function validCatalog(): Record<string, unknown> {
  return structuredClone(
    loadDriveRouteCatalog(process.cwd()).catalog as unknown as Record<string, unknown>,
  );
}

describe("drive route catalog", () => {
  it("U-DRCAT-001: [PLAN-L7-476-drive-route-catalog-gate] 全route exact setと工程専門workflowを受理する", () => {
    const result = loadDriveRouteCatalog(process.cwd());
    expect(result.ok).toBe(true);
    expect(result.routes).toBe(14);
    expect(result.specialists).toBe(2);
    expect(driveRouteCatalogMessages(result)[0]).toContain("OK");
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
      expect.arrayContaining([
        "route_exact_set_mismatch",
        "next_route_missing",
        "document_missing",
      ]),
    );
  });

  it("U-DRCAT-003: [PLAN-L7-476-drive-route-catalog-gate] modelに許可されないkindと重複を拒否する", () => {
    const raw = validCatalog();
    const routes = raw.routes as Array<Record<string, unknown>>;
    const discovery = routes.find((route) => route.route_id === "discovery");
    if (!discovery) throw new Error("fixture route missing");
    discovery.allowed_kinds = ["poc", "impl", "impl"];
    discovery.entry_signals = ["requirement_undefined", "requirement_undefined"];
    const result = analyzeDriveRouteCatalog(raw, () => true);
    expect(result.findings.map((finding) => finding.reason)).toEqual(
      expect.arrayContaining([
        "kind_duplicate_within_route",
        "signal_duplicate_within_route",
        "kind_not_allowed_for_model",
      ]),
    );
  });

  it("U-DRCAT-005: [PLAN-L7-476-drive-route-catalog-gate] catalog signalとruntime routingのdriftを拒否する", () => {
    const raw = validCatalog();
    const routes = raw.routes as Array<Record<string, unknown>>;
    const research = routes.find((route) => route.route_id === "research");
    if (!research) throw new Error("fixture route missing");
    research.entry_signals = ["unknown_research_signal", "production_incident"];
    const result = analyzeDriveRouteCatalog(raw, () => true);
    expect(result.findings.map((finding) => finding.reason)).toEqual(
      expect.arrayContaining(["signal_route_missing", "signal_route_mismatch"]),
    );
  });

  it("U-DRCAT-004: [PLAN-L7-476-drive-route-catalog-gate] Add-feature Bと通常Forwardを別routeとして保持する", () => {
    const result = loadDriveRouteCatalog(process.cwd());
    const routes = result.catalog?.routes ?? [];
    const bottomUp = routes.find((route) => route.route_id === "add_feature_bottom_up");
    const forward = routes.find((route) => route.route_id === "forward_full_v");
    expect(bottomUp?.phases).toEqual(
      expect.arrayContaining(["add-design", "add-impl", "R0", "R4"]),
    );
    expect(bottomUp?.next_routes).toContain("reverse");
    expect(forward?.allowed_kinds).toEqual(["design", "impl"]);
  });
});
