import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { sha256Digest } from "../runtime/digest";
import {
  loadWorkflowClassificationCatalog,
  WORKFLOW_CLASSIFICATION_CATALOG_PATH,
} from "../schema/workflow-classification-catalog";
import {
  loadWorkflowClassificationRegistry,
  WORKFLOW_CLASSIFICATION_REGISTRY_PATH,
} from "../schema/workflow-classification-registry";
import {
  buildWorkflowGuide,
  type WorkflowGuide,
  workflowModelIds,
} from "../workflow/workflow-guide";

const LEGACY_GUIDE_KEYS = new Set(["mode", "model", "catalog_route_id", "route_class"]);

export type WorkflowGuideAuthorityFinding = {
  code:
    | "workflow_guide_generation_failed"
    | "workflow_guide_identity_mismatch"
    | "workflow_guide_authority_mismatch"
    | "workflow_guide_signal_projection_mismatch"
    | "workflow_guide_legacy_identity_emitted"
    | "workflow_guide_duplicate_digest";
  subject: string;
  detail: string;
};

export type WorkflowGuideAuthorityResult = {
  ok: boolean;
  workflowCount: number;
  generatedCount: number;
  findings: WorkflowGuideAuthorityFinding[];
};

function sorted(values: readonly string[]): string[] {
  return [...values].sort((left, right) => left.localeCompare(right));
}

function collectKeys(value: unknown, keys = new Set<string>()): Set<string> {
  if (Array.isArray(value)) {
    for (const item of value) collectKeys(item, keys);
  } else if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      keys.add(key);
      collectKeys(item, keys);
    }
  }
  return keys;
}

function guideAuthorityMatches(input: {
  guide: WorkflowGuide;
  repoRoot: string;
  registry: ReturnType<typeof loadWorkflowClassificationRegistry>;
  catalog: ReturnType<typeof loadWorkflowClassificationCatalog>;
}): boolean {
  const { guide, repoRoot, registry, catalog } = input;
  const registryBytes = readFileSync(resolve(repoRoot, WORKFLOW_CLASSIFICATION_REGISTRY_PATH));
  const catalogBytes = readFileSync(resolve(repoRoot, WORKFLOW_CLASSIFICATION_CATALOG_PATH));
  return (
    guide.authority.requirements_version === registry.requirements_version &&
    guide.authority.requirements_source_digest === registry.authority.source_digest &&
    guide.authority.registry_version === registry.registry_version &&
    guide.authority.registry_source_digest === sha256Digest(registryBytes) &&
    guide.authority.catalog_digest === sha256Digest(catalogBytes) &&
    catalog.source_registry.registry_version === registry.registry_version &&
    catalog.source_registry.requirements_version === registry.requirements_version
  );
}

export function analyzeWorkflowGuideAuthority(
  repoRoot: string = process.cwd(),
): WorkflowGuideAuthorityResult {
  const findings: WorkflowGuideAuthorityFinding[] = [];
  let registry: ReturnType<typeof loadWorkflowClassificationRegistry>;
  let catalog: ReturnType<typeof loadWorkflowClassificationCatalog>;
  try {
    registry = loadWorkflowClassificationRegistry(repoRoot);
    catalog = loadWorkflowClassificationCatalog(repoRoot);
  } catch (error) {
    return {
      ok: false,
      workflowCount: 0,
      generatedCount: 0,
      findings: [
        {
          code: "workflow_guide_generation_failed",
          subject: "authority",
          detail: String(error),
        },
      ],
    };
  }

  const workflowIds = workflowModelIds(repoRoot);
  const digests = new Map<string, string>();
  let generatedCount = 0;
  for (const workflowId of workflowIds) {
    const result = buildWorkflowGuide({ workflow: workflowId, repo_root: repoRoot });
    if (!result.ok || result.guide === null) {
      findings.push({
        code: "workflow_guide_generation_failed",
        subject: workflowId,
        detail: result.findings.map((item) => item.code).join(",") || "guide_missing",
      });
      continue;
    }
    generatedCount += 1;
    const guide = result.guide;
    if (
      guide.identity.target_axis !== "workflow_model" ||
      guide.identity.target_id !== workflowId
    ) {
      findings.push({
        code: "workflow_guide_identity_mismatch",
        subject: workflowId,
        detail: `${guide.identity.target_axis}:${guide.identity.target_id}`,
      });
    }
    if (!guideAuthorityMatches({ guide, repoRoot, registry, catalog })) {
      findings.push({
        code: "workflow_guide_authority_mismatch",
        subject: workflowId,
        detail: "guide authority tuple does not match current requirements/registry/catalog",
      });
    }
    const expectedSignals = sorted(
      catalog.signal_bindings
        .filter(
          (binding) => binding.target_axis === "workflow_model" && binding.target_id === workflowId,
        )
        .flatMap((binding) => binding.signals),
    );
    if (
      JSON.stringify(sorted(guide.entry.registered_signals)) !== JSON.stringify(expectedSignals)
    ) {
      findings.push({
        code: "workflow_guide_signal_projection_mismatch",
        subject: workflowId,
        detail: "guide signal projection differs from the current generated catalog",
      });
    }
    const legacyKeys = [...collectKeys(guide)].filter((key) => LEGACY_GUIDE_KEYS.has(key));
    if (legacyKeys.length > 0) {
      findings.push({
        code: "workflow_guide_legacy_identity_emitted",
        subject: workflowId,
        detail: sorted(legacyKeys).join(","),
      });
    }
    const previous = digests.get(guide.guide_digest);
    if (previous) {
      findings.push({
        code: "workflow_guide_duplicate_digest",
        subject: workflowId,
        detail: `same digest as ${previous}`,
      });
    } else {
      digests.set(guide.guide_digest, workflowId);
    }
  }

  return {
    ok: findings.length === 0 && generatedCount === workflowIds.length,
    workflowCount: workflowIds.length,
    generatedCount,
    findings,
  };
}

export function workflowGuideAuthorityMessages(result: WorkflowGuideAuthorityResult): string[] {
  return result.findings.map(
    (finding) =>
      `workflow-guide-authority - violation: ${finding.code} (${finding.subject}) ${finding.detail}`,
  );
}

export function checkWorkflowGuideAuthority(repoRoot: string = process.cwd()): {
  messages: string[];
  ok: boolean;
} {
  try {
    const result = analyzeWorkflowGuideAuthority(repoRoot);
    return { messages: workflowGuideAuthorityMessages(result), ok: result.ok };
  } catch (error) {
    return {
      messages: [`workflow-guide-authority - violation: read_failed ${String(error)}`],
      ok: false,
    };
  }
}
