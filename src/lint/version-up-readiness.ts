import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fmValue } from "./shared";

export interface VersionUpReadinessPlan {
  file: string;
  plan_id: string;
  status: string;
  versionTarget: string | null;
  text: string;
}

export interface VersionUpReadinessInput {
  charter: string;
  pillarRequirements: string;
  functionalDesign: string;
  modeCatalog: string;
  modeDoc: string;
  discoveryPlan: string;
  plans: VersionUpReadinessPlan[];
}

export interface VersionUpReadinessViolation {
  subject: string;
  reason: string;
}

export interface VersionUpReadinessResult {
  parkedPlanIds: string[];
  violations: VersionUpReadinessViolation[];
  ok: boolean;
}

const MODE_DOC_MARKERS = [
  "deferred-but-committed-future",
  "status=draft",
  "version_target",
  "VERSION_UP_ALLOWED_TARGETS",
  "action-binding approval",
  "escalation_boundaries",
] as const;

const CHARTER_MARKERS = ["version-up 定義", "今版に入れない作業を失わない"] as const;

const PILLAR_REQUIREMENT_MARKERS = [
  "HR-FR-P1-02",
  "HAC-P1-02a",
  "version-up-readiness",
  "`version_target`",
  "activation 条件",
  "今版外作業を失わない",
] as const;

const FUNCTIONAL_DESIGN_MARKERS = [
  "HB-P1 continuous-autonomy",
  "continuous-run、version-up",
  "signal → mode routing",
  "escalation_boundaries",
] as const;

const MODE_CATALOG_MARKERS = [
  "| **version-up** |",
  "[version-up.md](version-up.md)",
  "`version_deferral`",
  "将来版活性化時 → add-feature",
] as const;

const PARKED_PLAN_MARKERS = [
  "version-up parked",
  "mode=version-up",
  "activation",
  "version_target",
] as const;

const EXTERNAL_BOUNDARY_TERMS = [
  "Cloudflare",
  "HMAC",
  "webhook",
  "access control",
  "secret",
  "external",
] as const;

const EXTERNAL_ACTIVATION_MARKERS = [
  "action-binding approval",
  "escalation_boundaries",
  "exit 1",
] as const;

function parsePlan(file: string, content: string): VersionUpReadinessPlan {
  return {
    file,
    plan_id: fmValue(content, "plan_id") ?? file.replace(/\.md$/, ""),
    status: fmValue(content, "status") ?? "unknown",
    versionTarget: fmValue(content, "version_target") ?? null,
    text: content,
  };
}

export function loadVersionUpReadinessInput(
  repoRoot: string = process.cwd(),
): VersionUpReadinessInput {
  const plansDir = join(repoRoot, "docs", "plans");
  const plans = readdirSync(plansDir)
    .filter((f) => f.startsWith("PLAN-") && f.endsWith(".md"))
    .map((f) => parsePlan(f, readFileSync(join(plansDir, f), "utf8")));

  return {
    charter: readFileSync(
      join(repoRoot, "docs", "design", "helix", "L0-charter", "helix-charter_v0.1.md"),
      "utf8",
    ),
    pillarRequirements: readFileSync(
      join(
        repoRoot,
        "docs",
        "design",
        "helix",
        "L3-requirements",
        "pillar-functional-requirements.md",
      ),
      "utf8",
    ),
    functionalDesign: readFileSync(
      join(repoRoot, "docs", "design", "harness", "L4-basic-design", "function.md"),
      "utf8",
    ),
    modeCatalog: readFileSync(join(repoRoot, "docs", "process", "modes", "README.md"), "utf8"),
    modeDoc: readFileSync(join(repoRoot, "docs", "process", "modes", "version-up.md"), "utf8"),
    discoveryPlan: readFileSync(
      join(repoRoot, "docs", "plans", "PLAN-DISCOVERY-09-version-up-mode.md"),
      "utf8",
    ),
    plans,
  };
}

export function analyzeVersionUpReadiness(
  input: VersionUpReadinessInput,
): VersionUpReadinessResult {
  const violations: VersionUpReadinessViolation[] = [];

  for (const marker of CHARTER_MARKERS) {
    if (!input.charter.includes(marker)) {
      violations.push({ subject: "L0 helix charter", reason: `missing ${marker}` });
    }
  }

  for (const marker of PILLAR_REQUIREMENT_MARKERS) {
    if (!input.pillarRequirements.includes(marker)) {
      violations.push({ subject: "L3 pillar requirements", reason: `missing ${marker}` });
    }
  }

  for (const marker of FUNCTIONAL_DESIGN_MARKERS) {
    if (!input.functionalDesign.includes(marker)) {
      violations.push({ subject: "L4 functional design", reason: `missing ${marker}` });
    }
  }

  for (const marker of MODE_CATALOG_MARKERS) {
    if (!input.modeCatalog.includes(marker)) {
      violations.push({ subject: "docs/process/modes/README.md", reason: `missing ${marker}` });
    }
  }

  for (const marker of MODE_DOC_MARKERS) {
    if (!input.modeDoc.includes(marker)) {
      violations.push({ subject: "docs/process/modes/version-up.md", reason: `missing ${marker}` });
    }
  }

  if (!input.discoveryPlan.includes("decision_outcome: confirmed")) {
    violations.push({
      subject: "PLAN-DISCOVERY-09-version-up-mode",
      reason: "S4 confirmed decision missing",
    });
  }
  if (!input.discoveryPlan.includes("activation note (2026-06-30)")) {
    violations.push({
      subject: "PLAN-DISCOVERY-09-version-up-mode",
      reason: "current activation note missing",
    });
  }

  const parked = input.plans.filter((p) => p.versionTarget !== null);
  for (const plan of parked) {
    if (plan.status !== "draft") {
      violations.push({
        subject: plan.plan_id,
        reason: "version_target is only valid while status=draft",
      });
    }
    for (const marker of PARKED_PLAN_MARKERS) {
      if (!plan.text.includes(marker)) {
        violations.push({ subject: plan.plan_id, reason: `missing parked marker ${marker}` });
      }
    }
    const hasExternalBoundary = EXTERNAL_BOUNDARY_TERMS.some((term) =>
      plan.text.toLowerCase().includes(term.toLowerCase()),
    );
    if (hasExternalBoundary) {
      for (const marker of EXTERNAL_ACTIVATION_MARKERS) {
        if (!plan.text.includes(marker)) {
          violations.push({
            subject: plan.plan_id,
            reason: `external activation boundary missing ${marker}`,
          });
        }
      }
    }
  }

  return {
    parkedPlanIds: parked.map((p) => p.plan_id).sort(),
    violations,
    ok: violations.length === 0,
  };
}

export function versionUpReadinessMessages(result: VersionUpReadinessResult): string[] {
  if (result.ok) {
    const parked = result.parkedPlanIds.length > 0 ? result.parkedPlanIds.join(", ") : "none";
    return [`version-up-readiness - OK (parked=${result.parkedPlanIds.length}: ${parked})`];
  }
  const detail = result.violations
    .slice(0, 8)
    .map((v) => `${v.subject}:${v.reason}`)
    .join(", ");
  const more = result.violations.length > 8 ? ` (+${result.violations.length - 8} more)` : "";
  return [`version-up-readiness - violation: ${detail}${more}`];
}
