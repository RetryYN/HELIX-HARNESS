import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { z } from "zod";
import {
  loadCanonicalRequirementIrFromShards,
  renderRequirementGeneratedView,
} from "./requirement-generated-view";
import { validateRequirementRefinement } from "./requirement-refinement-authority";

const DIGEST = /^sha256:[0-9a-f]{64}$/;
const authoritySchema = z
  .object({
    schema_version: z.literal("helix-requirement-authority.v1"),
    authority: z.literal("canonical"),
    canonical_schema: z.literal("config/requirement-ir-schema.json"),
    canonical_root: z.literal("requirements-ir/manifest.json"),
    generated_views: z
      .array(z.literal("docs/generated/requirements/requirement-definition.generated.md"))
      .length(1),
    compatibility_inputs: z.array(z.string().min(1)).length(4),
    compatibility_input_digests: z.record(z.string(), z.string().regex(DIGEST)),
    consumer_policy: z
      .object({
        semantic_read: z.literal("canonical_json_only"),
        legacy_markdown: z.literal("migration_and_compatibility_read_only"),
        generated_markdown: z.literal("read_only_view"),
        write: z.literal("json_transaction_only"),
        dual_authority: z.literal("forbidden"),
      })
      .strict(),
  })
  .strict();

const MIGRATION_CONSUMER_ALLOWLIST = new Set([
  "src/requirements/requirement-authority-gate.ts",
  "src/requirements/requirement-ir-authority-cutover.ts",
  "src/requirements/requirement-ir-shadow.ts",
  "src/requirements/requirement-ir-shadow-generator.ts",
]);

export interface RequirementAuthorityGateResult {
  ok: boolean;
  messages: string[];
}

function sha256(text: string): string {
  return `sha256:${createHash("sha256").update(text, "utf8").digest("hex")}`;
}

function sourceFiles(root: string, directory: string): string[] {
  const absolute = join(root, directory);
  if (!existsSync(absolute)) return [];
  const files: string[] = [];
  for (const entry of readdirSync(absolute)) {
    const path = join(absolute, entry);
    if (statSync(path).isDirectory()) files.push(...sourceFiles(root, relative(root, path)));
    else if (path.endsWith(".ts")) files.push(relative(root, path).replaceAll("\\", "/"));
  }
  return files;
}

export function checkRequirementAuthority(repoRoot: string): RequirementAuthorityGateResult {
  const violations: string[] = [];
  try {
    const configPath = join(repoRoot, "config/requirement-ir-authority.json");
    const config = authoritySchema.parse(JSON.parse(readFileSync(configPath, "utf8")));
    const schema = JSON.parse(readFileSync(join(repoRoot, config.canonical_schema), "utf8")) as {
      properties?: {
        schema_version?: { const?: string };
        authority?: { const?: string };
        source_authority?: { const?: string };
      };
      $defs?: {
        requirement?: { required?: string[] };
        refinementContract?: { required?: string[] };
      };
    };
    if (
      schema.properties?.schema_version?.const !== "helix-requirement-ir.v2" ||
      schema.properties?.authority?.const !== "canonical" ||
      schema.properties?.source_authority?.const !== "json_stable_id_shards"
    ) {
      violations.push("canonical schema authority constants differ");
    }
    for (const port of [
      "design_template_ids",
      "design_obligation_ids",
      "required_design_artifact_kinds",
    ]) {
      if (!schema.$defs?.requirement?.required?.includes(port)) {
        violations.push(`canonical schema design port is missing: ${port}`);
      }
    }
    for (const field of [
      "refinement_contract_id",
      "primary_system_contract_id",
      "supporting_requirements",
      "acceptance_cases",
      "approval",
      "semantic_digest",
    ]) {
      if (!schema.$defs?.refinementContract?.required?.includes(field)) {
        violations.push(`canonical refinement schema field is missing: ${field}`);
      }
    }
    const canonical = loadCanonicalRequirementIrFromShards(repoRoot, config.canonical_root);
    if (canonical.refinement_contracts.length > 0) {
      const candidateHead = execFileSync("git", ["rev-parse", "HEAD"], {
        cwd: repoRoot,
        encoding: "utf8",
      }).trim();
      const baselineOwners = new Set(
        canonical.system_contracts.map((record) => record.system_contract_id),
      );
      const baselineIds = new Set([
        ...canonical.requirements.map((record) => record.requirement_id),
        ...canonical.system_contracts.map((record) => record.system_contract_id),
        ...canonical.acceptance_cases.map((record) => record.acceptance_id),
        ...canonical.system_tests.map((record) => record.system_test_id),
      ]);
      const refinementIds = new Set<string>();
      for (const record of canonical.refinement_contracts) {
        const validation = validateRequirementRefinement(record, {
          repoRoot,
          baselineSystemContractIds: baselineOwners,
          candidateHead,
        });
        for (const failureCode of validation.failureCodes) {
          violations.push(`${record.refinement_contract_id}: ${failureCode}`);
        }
        for (const id of [
          record.refinement_contract_id,
          ...record.supporting_requirements.map((item) => item.requirement_id),
          ...record.acceptance_cases.map((item) => item.acceptance_id),
        ]) {
          if (baselineIds.has(id) || refinementIds.has(id)) {
            violations.push(`${id}: REFINEMENT_DUPLICATE_ID`);
          }
          refinementIds.add(id);
        }
      }
    }

    const expectedCompatibility = [...config.compatibility_inputs].sort();
    const digestKeys = Object.keys(config.compatibility_input_digests).sort();
    if (
      new Set(expectedCompatibility).size !== 4 ||
      expectedCompatibility.join("\n") !== digestKeys.join("\n")
    ) {
      violations.push("compatibility input exact set and digest keys differ");
    }
    for (const path of config.compatibility_inputs) {
      const text = readFileSync(join(repoRoot, path), "utf8");
      if (!/^authority_status: compatibility_read_only$/m.test(text)) {
        violations.push(`${path}: compatibility_read_only marker is missing`);
      }
      if (!/^canonical_requirement_ir: requirements-ir\/manifest\.json$/m.test(text)) {
        violations.push(`${path}: canonical requirement IR pointer is missing`);
      }
      if (sha256(text) !== config.compatibility_input_digests[path]) {
        violations.push(`${path}: pinned compatibility digest differs`);
      }
    }

    for (const path of config.generated_views) {
      const observed = readFileSync(join(repoRoot, path), "utf8");
      const expected = renderRequirementGeneratedView(canonical);
      if (observed !== expected)
        violations.push(`${path}: generated view differs from canonical JSON`);
    }

    const retiredShadowRoot = join(repoRoot, "generated/requirements-ir");
    if (existsSync(retiredShadowRoot) && readdirSync(retiredShadowRoot).length > 0) {
      violations.push("generated/requirements-ir: retired shadow artifacts remain");
    }

    const compatibilityPaths = config.compatibility_inputs;
    for (const path of [...sourceFiles(repoRoot, "src"), ...sourceFiles(repoRoot, "scripts")]) {
      if (MIGRATION_CONSUMER_ALLOWLIST.has(path)) continue;
      const text = readFileSync(join(repoRoot, path), "utf8");
      if (
        compatibilityPaths.some((compatibilityPath) => text.includes(compatibilityPath)) &&
        /(readFileSync|readFile|createReadStream)/.test(text)
      ) {
        violations.push(`${path}: semantic legacy Markdown read is outside migration allowlist`);
      }
    }
  } catch (error) {
    violations.push(`authority validation failed: ${String(error)}`);
  }
  return {
    ok: violations.length === 0,
    messages:
      violations.length === 0
        ? ["requirement-authority - OK (canonical JSON, generated view, compatibility=4)"]
        : violations.map((message) => `requirement-authority - violation ${message}`),
  };
}
