import { existsSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";

export const MODE_ALLOWED_KINDS: Record<string, ReadonlySet<string>> = {
  forward: new Set(["design", "impl"]),
  verification: new Set(["design", "impl", "add-design", "add-impl", "refactor", "retrofit"]),
  discovery: new Set(["poc"]),
  scrum: new Set(["poc"]),
  reverse: new Set(["reverse"]),
  recovery: new Set(["recovery"]),
  incident: new Set(["troubleshoot", "recovery"]),
  refactor: new Set(["refactor"]),
  retrofit: new Set(["retrofit"]),
  "add-feature": new Set(["add-design", "add-impl"]),
  "version-up": new Set([
    "design",
    "impl",
    "add-design",
    "add-impl",
    "refactor",
    "retrofit",
    "research",
    "reverse",
    "recovery",
    "troubleshoot",
    "poc",
  ]),
  research: new Set(["research"]),
  "design-bottomup": new Set(["design", "add-design"]),
};

const MODE_DOC_FILES: Record<string, string | null> = {
  forward: null,
  verification: null,
  discovery: "discovery.md",
  scrum: "scrum.md",
  reverse: "reverse.md",
  recovery: "recovery.md",
  incident: "incident.md",
  refactor: "refactor.md",
  retrofit: "retrofit.md",
  "add-feature": "add-feature.md",
  "version-up": "version-up.md",
  research: "research.md",
  "design-bottomup": null,
};

export interface WorkflowModePlanInput {
  planId: string;
  kind?: string | null;
  routeMode?: string | null;
}

export function normalizeRouteMode(mode: string): string {
  return mode.trim().toLowerCase();
}

export function workflowModeForPlan(input: WorkflowModePlanInput): string {
  if (input.planId.startsWith("PLAN-M-")) return "verification";
  if (input.routeMode && input.routeMode.trim().length > 0) {
    return normalizeRouteMode(input.routeMode);
  }
  if (input.planId.startsWith("PLAN-DISCOVERY-")) return "discovery";
  if (input.planId.startsWith("PLAN-REVERSE-")) return "reverse";
  if (input.planId.startsWith("PLAN-RECOVERY-")) return "recovery";

  switch (input.kind) {
    case "poc":
      return "discovery";
    case "reverse":
      return "reverse";
    case "recovery":
      return "recovery";
    case "troubleshoot":
      return "incident";
    case "refactor":
      return "refactor";
    case "retrofit":
      return "retrofit";
    case "add-design":
    case "add-impl":
      return "add-feature";
    case "research":
      return "research";
    case "design":
    case "impl":
      return "forward";
    default:
      return "forward";
  }
}

export function unmappedModeCatalogDocs(repoRoot: string = process.cwd()): string[] {
  const modesDir = join(repoRoot, "docs", "process", "modes");
  if (!existsSync(modesDir)) return [];
  const mapped = new Set(
    Object.values(MODE_DOC_FILES).filter((file): file is string => typeof file === "string"),
  );
  return readdirSync(modesDir)
    .filter((file) => file.endsWith(".md") && file !== "README.md")
    .filter((file) => !mapped.has(file))
    .map((file) => join("docs", "process", "modes", basename(file)))
    .sort();
}
