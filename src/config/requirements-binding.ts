import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import { z } from "zod";

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
    scanRoots: ["src"],
    thresholds: {
      splitModuleLines: 700,
      splitModuleExports: 24,
      extractHelperLines: 120,
      dedupeFunctionMinLines: 10,
      externalizeLiteralMinRepeats: 6,
      externalizeLiteralMinLength: 12,
      externalizePolicy: 5,
      externalizePolicyMaxBranchPoints: 40,
    },
    policyTerms: [
      "stage",
      "phase",
      "route",
      "approval",
      "policy",
      "model",
      "tier",
      "profile",
      "skill",
      "inject",
      "injection",
      "subagent",
      "agent",
    ],
  },
  l1L2GapCheck: {
    maxRounds: 3,
    viewpoints: [
      {
        id: "input",
        label: "入力",
        check: "画面の入力要素ごとに validation、必須/任意、型、上限の要求があるか。",
        authority: "human_decides_ai_surfaces",
      },
      {
        id: "output_display",
        label: "出力/表示",
        check: "表示データごとに出所となる FR またはデータ要件が L1 側に存在するか。",
        authority: "human_decides_ai_surfaces",
      },
      {
        id: "error_empty",
        label: "異常系",
        check: "エラー表示、空状態、タイムアウト、二重操作の要求があるか。",
        authority: "human_decides_ai_surfaces",
      },
      {
        id: "authority_safety",
        label: "権限/安全境界",
        check: "誰が操作できるか、action-binding approval 対象操作かが明示されているか。",
        authority: "human_decides_ai_surfaces",
      },
      {
        id: "state_transition",
        label: "状態遷移",
        check: "正常系以外を含む画面間遷移が screen-flow と L1 要求の双方に存在するか。",
        authority: "human_decides_ai_surfaces",
      },
      {
        id: "data_lifecycle",
        label: "データライフサイクル",
        check: "生成、更新、削除、保持期限の要求があるか。",
        authority: "human_decides_ai_surfaces",
      },
      {
        id: "nfr",
        label: "NFR",
        check: "応答時間、可用性などの数値要求が該当 NFR グレードに接地しているか。",
        authority: "human_decides_ai_surfaces",
      },
      {
        id: "external_dependency",
        label: "外部依存",
        check: "画面が前提とする外部 API、runtime 前提、ライブラリ依存が明示されているか。",
        authority: "human_decides_ai_surfaces",
      },
    ],
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
