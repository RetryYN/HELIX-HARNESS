import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
// A-120 I-3: review_evidence の有無判定は review-evidence.ts を単一正本にする
// (旧 l6-completion 版は判定ロジックが乖離し review-evidence hard gate と齟齬を生む恐れがあった)。
import { hasReviewEvidence } from "./review-evidence";
import { hasDbcTable } from "./shared";

export interface L6CompletionDoc {
  path: string;
  text: string;
}

export interface L6CompletionInputs {
  l6Docs: L6CompletionDoc[];
  l6Plans: L6CompletionDoc[];
  l7Text: string;
  unitTestDesignStatuses: Record<string, string | null>;
  gateText: string;
}

export interface L6CompletionResult {
  totalDocs: number;
  draftDocs: string[];
  missingDocPlans: string[];
  unresolvedDocPlans: string[];
  missingDocPairArtifacts: string[];
  missingL7DocRefs: string[];
  weakContractDocs: string[];
  draftPlans: string[];
  missingReviewPlans: string[];
  l7Status: string | null;
  g6Status: string | null;
  freezeInputReady: boolean;
  ready: boolean;
}

const STATUS_RE = /^status:\s*([^\s#]+)/m;
const PLAN_ID_RE = /^plan_id:\s*([^\s#]+)/m;
const DOC_PLAN_RE = /^plan:\s*([^\s#]+)/m;
const PAIR_ARTIFACT_RE = /^pair_artifact:\s*(docs\/test-design\/harness\/[^\s#]+\.md)\s*$/m;
const DESIGN_KIND_RE = /^kind:\s*design$/m;
const UNIT_TEST_DESIGN_PATHS = [
  join("docs", "test-design", "harness", "L8-unit-test-design.md"),
  join("docs", "test-design", "harness", "L7-unit-test-design.md"),
];

function statusOf(text: string): string | null {
  return text.match(STATUS_RE)?.[1] ?? null;
}

function planIdOf(text: string, path: string): string {
  return text.match(PLAN_ID_RE)?.[1] ?? basename(path, ".md");
}

function docPlanOf(text: string): string | null {
  return text.match(DOC_PLAN_RE)?.[1] ?? null;
}

function pairArtifactOf(text: string): string | null {
  return text.match(PAIR_ARTIFACT_RE)?.[1] ?? null;
}

function hasUnitContractSubstance(text: string): boolean {
  const hasStructuredDbcTable = hasDbcTable(text);
  const signatureCount = (text.match(/\b[A-Za-z][A-Za-z0-9_]*\([^)]*\)\s*=>/g) ?? []).length;
  const oracleCount = (text.match(/\bU-[A-Z0-9-]+/g) ?? []).length;
  const dbcMarkerCount = (text.match(/\b(pre|post|invariant|oracle|DbC)\b/gi) ?? []).length;
  const hasLegacyExplicitMarker =
    /L6 contract marker/i.test(text) && signatureCount >= 1 && oracleCount >= 1;
  return (
    (hasStructuredDbcTable && signatureCount >= 1 && oracleCount >= 1) ||
    (signatureCount >= 1 && oracleCount >= 1 && dbcMarkerCount >= 3) ||
    hasLegacyExplicitMarker
  );
}

function gateG6Status(gateText: string): string | null {
  for (const line of gateText.split(/\r?\n/)) {
    if (!line.includes("| G6")) continue;
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((c) => c.trim());
    return cells[1] ?? null;
  }
  return null;
}

function isPassStatus(status: string | null): boolean {
  return status !== null && /PASS/.test(status);
}

export function analyzeL6Completion(inputs: L6CompletionInputs): L6CompletionResult {
  const l6PlanPaths = new Set(inputs.l6Plans.map((plan) => plan.path.replaceAll("\\", "/")));

  const draftDocs = inputs.l6Docs
    .filter((doc) => statusOf(doc.text) !== "confirmed")
    .map((doc) => doc.path)
    .sort();
  const missingDocPlans = inputs.l6Docs
    .filter((doc) => docPlanOf(doc.text) === null)
    .map((doc) => doc.path)
    .sort();
  const unresolvedDocPlans = inputs.l6Docs
    .filter((doc) => {
      const planPath = docPlanOf(doc.text);
      return planPath !== null && !l6PlanPaths.has(planPath.replaceAll("\\", "/"));
    })
    .map((doc) => `${doc.path} -> ${docPlanOf(doc.text)}`)
    .sort();
  const missingDocPairArtifacts = inputs.l6Docs
    .filter((doc) => {
      const pair = pairArtifactOf(doc.text);
      return (
        pair === null ||
        inputs.unitTestDesignStatuses[pair] !== "confirmed" ||
        (!UNIT_TEST_DESIGN_PATHS.includes(pair) && !inputs.l7Text.includes(`PAIR_PATH:${pair}`))
      );
    })
    .map((doc) => doc.path)
    .sort();
  const missingL7DocRefs = inputs.l6Docs
    .filter((doc) => !inputs.l7Text.includes(basename(doc.path)))
    .map((doc) => doc.path)
    .sort();
  const weakContractDocs = inputs.l6Docs
    .filter((doc) => !hasUnitContractSubstance(doc.text))
    .map((doc) => doc.path)
    .sort();

  const l6DesignPlans = inputs.l6Plans.filter((plan) => DESIGN_KIND_RE.test(plan.text));
  const draftPlans = l6DesignPlans
    .filter((plan) => statusOf(plan.text) !== "confirmed")
    .map((plan) => planIdOf(plan.text, plan.path))
    .sort();
  const missingReviewPlans = l6DesignPlans
    .filter((plan) => statusOf(plan.text) === "confirmed" && !hasReviewEvidence(plan.text))
    .map((plan) => planIdOf(plan.text, plan.path))
    .sort();
  const l7Status = statusOf(inputs.l7Text);
  const g6Status = gateG6Status(inputs.gateText);

  const freezeInputReady =
    inputs.l6Docs.length > 0 &&
    missingDocPlans.length === 0 &&
    unresolvedDocPlans.length === 0 &&
    missingDocPairArtifacts.length === 0 &&
    missingL7DocRefs.length === 0 &&
    weakContractDocs.length === 0;

  const ready =
    inputs.l6Docs.length > 0 &&
    draftDocs.length === 0 &&
    missingDocPlans.length === 0 &&
    unresolvedDocPlans.length === 0 &&
    missingDocPairArtifacts.length === 0 &&
    missingL7DocRefs.length === 0 &&
    weakContractDocs.length === 0 &&
    draftPlans.length === 0 &&
    missingReviewPlans.length === 0 &&
    l7Status === "confirmed" &&
    isPassStatus(g6Status);

  return {
    totalDocs: inputs.l6Docs.length,
    draftDocs,
    missingDocPlans,
    unresolvedDocPlans,
    missingDocPairArtifacts,
    missingL7DocRefs,
    weakContractDocs,
    draftPlans,
    missingReviewPlans,
    l7Status,
    g6Status,
    freezeInputReady,
    ready,
  };
}

export function loadL6CompletionInputs(repoRoot: string): L6CompletionInputs {
  const l6Dir = join(repoRoot, "docs", "design", "harness", "L6-function-design");
  const planDir = join(repoRoot, "docs", "plans");
  const l6Docs = readdirSync(l6Dir)
    .filter((name) => name.endsWith(".md"))
    .map((name) => {
      const path = join(l6Dir, name);
      return {
        path: `docs/design/harness/L6-function-design/${name}`,
        text: readFileSync(path, "utf8"),
      };
    });
  const l6Plans = readdirSync(planDir)
    .filter((name) => /^PLAN-L6-.*\.md$/.test(name))
    .map((name) => {
      const path = join(planDir, name);
      return { path: `docs/plans/${name}`, text: readFileSync(path, "utf8") };
    });
  const testDesignDir = join(repoRoot, "docs", "test-design", "harness");
  const unitDesignTexts = readdirSync(testDesignDir)
    .filter((name) => name.endsWith(".md"))
    .map((name) => {
      const path = join(testDesignDir, name);
      const text = readFileSync(path, "utf8");
      const canonical = name === "L8-unit-test-design.md" || name === "L7-unit-test-design.md";
      const dedicated =
        /^layer:\s*L8\s*$/m.test(text) && /^sub_doc:\s*unit-test-design\s*$/m.test(text);
      return canonical || dedicated ? `PAIR_PATH:docs/test-design/harness/${name}\n${text}` : null;
    })
    .filter((text): text is string => text !== null);
  const unitTestDesignStatuses = Object.fromEntries(
    unitDesignTexts.map((text) => {
      const pairPath = text.match(/^PAIR_PATH:(.+)$/m)?.[1];
      if (!pairPath) throw new Error("unit test design pair path marker missing");
      return [pairPath, statusOf(text)];
    }),
  );
  return {
    l6Docs,
    l6Plans,
    l7Text: unitDesignTexts.join("\n"),
    unitTestDesignStatuses,
    gateText: readFileSync(join(repoRoot, "docs", "governance", "gate-design.md"), "utf8"),
  };
}

export function canLoadL6CompletionInputs(repoRoot: string): boolean {
  return (
    existsSync(join(repoRoot, "docs", "design", "harness", "L6-function-design")) &&
    existsSync(join(repoRoot, "docs", "plans")) &&
    UNIT_TEST_DESIGN_PATHS.every((path) => existsSync(join(repoRoot, path))) &&
    existsSync(join(repoRoot, "docs", "governance", "gate-design.md"))
  );
}

export function l6CompletionMessages(result: L6CompletionResult): string[] {
  if (result.ready) {
    return [
      `l6-completion — OK (L6 docs ${result.totalDocs}件、L8 unit design confirmed、G6 PASS)`,
    ];
  }
  const messages = [
    `l6-completion — not ready (docs=${result.totalDocs}, draft_docs=${result.draftDocs.length}, draft_plans=${result.draftPlans.length}, unit_test_design=${result.l7Status ?? "missing"}, g6=${result.g6Status ?? "missing"})`,
  ];
  messages.push(
    `l6-completion — freeze-inputs ${result.freezeInputReady ? "OK" : "not ready"} (trace/substance before status flip)`,
  );
  messages.push(`l6-completion — unit-contract substance gaps: ${result.weakContractDocs.length}`);
  if (result.draftDocs.length > 0) {
    messages.push(`l6-completion — draft docs: ${result.draftDocs.join(", ")}`);
  }
  if (result.missingDocPlans.length > 0) {
    messages.push(
      `l6-completion — L6 docs without owning plan: ${result.missingDocPlans.join(", ")}`,
    );
  }
  if (result.unresolvedDocPlans.length > 0) {
    messages.push(
      `l6-completion — L6 docs with unresolved owning plan: ${result.unresolvedDocPlans.join(", ")}`,
    );
  }
  if (result.missingDocPairArtifacts.length > 0) {
    messages.push(
      `l6-completion — L6 docs without unit test design pair_artifact: ${result.missingDocPairArtifacts.join(", ")}`,
    );
  }
  if (result.missingL7DocRefs.length > 0) {
    messages.push(
      `l6-completion — L6 docs not referenced by unit test design: ${result.missingL7DocRefs.join(", ")}`,
    );
  }
  if (result.weakContractDocs.length > 0) {
    messages.push(
      `l6-completion — L6 docs without unit-contract substance: ${result.weakContractDocs.join(", ")}`,
    );
  }
  if (result.draftPlans.length > 0) {
    messages.push(`l6-completion — draft PLANs: ${result.draftPlans.join(", ")}`);
  }
  if (result.missingReviewPlans.length > 0) {
    messages.push(
      `l6-completion — confirmed PLANs without review_evidence: ${result.missingReviewPlans.join(", ")}`,
    );
  }
  return messages;
}
