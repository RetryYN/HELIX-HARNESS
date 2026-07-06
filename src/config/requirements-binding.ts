import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import { z } from "zod";
import {
  REQUIREMENTS_BINDING_L1_L2_MAX_ROUNDS,
  REQUIREMENTS_BINDING_L1_L2_VIEWPOINTS,
  REQUIREMENTS_BINDING_POLICY_TERMS,
  REQUIREMENTS_BINDING_REFACTOR_SCAN_ROOTS,
  REQUIREMENTS_BINDING_REFACTOR_THRESHOLDS,
} from "./requirements-binding-policy";

export const HELIX_REQUIREMENTS_BINDING_CONFIG_PATH = ".helix/config/requirements-binding.yaml";
export const HELIX_REQUIREMENTS_BINDING_SCHEMA_VERSION = "helix-requirements-binding.v1";

const refactorThresholdsSchema = z
  .object({
    splitModuleLines: z.number().int().positive(),
    splitModuleExports: z.number().int().positive(),
    extractHelperLines: z.number().int().positive(),
    dedupeFunctionMinLines: z.number().int().positive(),
    externalizeLiteralMinRepeats: z.number().int().positive(),
    externalizeLiteralMinLength: z.number().int().positive(),
    externalizePolicy: z.number().int().positive(),
    externalizePolicyMaxBranchPoints: z.number().int().positive(),
  })
  .strict();

const l1L2ViewpointSchema = z
  .object({
    id: z.string().min(1),
    label: z.string().min(1),
    check: z.string().min(1),
    authority: z.literal("human_decides_ai_surfaces"),
  })
  .strict();

export const requirementsBindingConfigSchema = z
  .object({
    schemaVersion: z.literal(HELIX_REQUIREMENTS_BINDING_SCHEMA_VERSION),
    refactorCandidates: z
      .object({
        scanRoots: z.array(z.string().min(1)).min(1),
        thresholds: refactorThresholdsSchema,
        policyTerms: z.array(z.string().min(1)).min(1),
      })
      .strict(),
    l1L2GapCheck: z
      .object({
        maxRounds: z.number().int().positive(),
        viewpoints: z.array(l1L2ViewpointSchema).min(1),
      })
      .strict(),
  })
  .strict();

export type RequirementsBindingConfig = z.infer<typeof requirementsBindingConfigSchema>;
export type RefactorCandidatePolicy = RequirementsBindingConfig["refactorCandidates"];
export type L1L2GapCheckPolicy = RequirementsBindingConfig["l1L2GapCheck"];

export const HELIX_REQUIREMENTS_BINDING_DEFAULTS: RequirementsBindingConfig = {
  schemaVersion: HELIX_REQUIREMENTS_BINDING_SCHEMA_VERSION,
  refactorCandidates: {
    scanRoots: [...REQUIREMENTS_BINDING_REFACTOR_SCAN_ROOTS],
    thresholds: { ...REQUIREMENTS_BINDING_REFACTOR_THRESHOLDS },
    policyTerms: [...REQUIREMENTS_BINDING_POLICY_TERMS],
  },
  l1L2GapCheck: {
    maxRounds: REQUIREMENTS_BINDING_L1_L2_MAX_ROUNDS,
    viewpoints: REQUIREMENTS_BINDING_L1_L2_VIEWPOINTS.map((viewpoint) => ({ ...viewpoint })),
  },
};

export interface RequirementsBindingConfigResult {
  ok: boolean;
  source: "file" | "default";
  path: string;
  config: RequirementsBindingConfig;
  messages: string[];
}

export function parseRequirementsBindingConfigText(
  text: string,
  path: string = HELIX_REQUIREMENTS_BINDING_CONFIG_PATH,
): RequirementsBindingConfigResult {
  try {
    const parsed = parseYaml(text) as unknown;
    const result = requirementsBindingConfigSchema.safeParse(parsed);
    if (!result.success) {
      return {
        ok: false,
        source: "file",
        path,
        config: HELIX_REQUIREMENTS_BINDING_DEFAULTS,
        messages: result.error.issues.map(
          (issue) =>
            `requirements-binding-config - violation ${issue.path.join(".")}: ${issue.message}`,
        ),
      };
    }
    return {
      ok: true,
      source: "file",
      path,
      config: result.data,
      messages: [
        `requirements-binding-config - OK (path=${path}, refactorThresholds=8, l1l2Viewpoints=${result.data.l1L2GapCheck.viewpoints.length})`,
      ],
    };
  } catch (error) {
    return {
      ok: false,
      source: "file",
      path,
      config: HELIX_REQUIREMENTS_BINDING_DEFAULTS,
      messages: [`requirements-binding-config - violation parse failed: ${String(error)}`],
    };
  }
}

export function loadRequirementsBindingConfig(
  repoRoot: string,
  opts: { requireFile?: boolean } = {},
): RequirementsBindingConfigResult {
  const path = join(repoRoot, HELIX_REQUIREMENTS_BINDING_CONFIG_PATH);
  if (!existsSync(path)) {
    const ok = opts.requireFile !== true;
    return {
      ok,
      source: "default",
      path: HELIX_REQUIREMENTS_BINDING_CONFIG_PATH,
      config: HELIX_REQUIREMENTS_BINDING_DEFAULTS,
      messages: [
        ok
          ? `requirements-binding-config - default (${HELIX_REQUIREMENTS_BINDING_CONFIG_PATH} なし)`
          : `requirements-binding-config - violation missing ${HELIX_REQUIREMENTS_BINDING_CONFIG_PATH}`,
      ],
    };
  }
  return parseRequirementsBindingConfigText(
    readFileSync(path, "utf8"),
    HELIX_REQUIREMENTS_BINDING_CONFIG_PATH,
  );
}
