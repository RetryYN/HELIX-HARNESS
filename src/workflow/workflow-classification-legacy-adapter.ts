import type { WorkflowClassificationRegistry } from "../schema/workflow-classification-registry.js";

type WorkflowClassificationAxis = WorkflowClassificationRegistry["entities"][number]["axis"];

export const WORKFLOW_CLASSIFICATION_LEGACY_FIELDS = ["mode", "model"] as const;

export type WorkflowClassificationLegacyField =
  (typeof WORKFLOW_CLASSIFICATION_LEGACY_FIELDS)[number];

export interface WorkflowClassificationLegacyInput {
  legacy_field: WorkflowClassificationLegacyField;
  legacy_value: string;
}

export interface WorkflowClassificationLegacyConversion {
  target_axis: WorkflowClassificationAxis;
  target_id: string;
}

export interface WorkflowClassificationLegacyReceipt {
  schema_version: "helix-workflow-classification-legacy-receipt.v1";
  disposition: "converted" | "ambiguous" | "unsupported";
  classification: WorkflowClassificationLegacyConversion | null;
  source: {
    field: WorkflowClassificationLegacyField;
    token: string;
  };
  warnings: Array<{
    code: "legacy-workflow-input" | "legacy-workflow-ambiguous" | "legacy-workflow-unsupported";
    message: string;
  }>;
  emit_legacy_identity: false;
  exit_code: 0 | 1;
}

const EXACT_CONVERSIONS = new Map<string, WorkflowClassificationLegacyConversion>([
  ["scrum", { target_axis: "development_style", target_id: "PRODUCTION_SCRUM" }],
  ["discovery", { target_axis: "case_driven_model", target_id: "DISCOVERY_POC" }],
  ["reverse", { target_axis: "workflow_model", target_id: "REVERSE" }],
  ["recovery", { target_axis: "workflow_model", target_id: "RECOVERY" }],
  ["incident", { target_axis: "workflow_model", target_id: "INCIDENT" }],
  ["refactor", { target_axis: "workflow_model", target_id: "REFACTOR" }],
  ["retrofit", { target_axis: "workflow_model", target_id: "RETROFIT" }],
  ["research", { target_axis: "workflow_model", target_id: "RESEARCH" }],
  ["add-feature", { target_axis: "workflow_model", target_id: "ADD_FEATURE" }],
  ["version-up", { target_axis: "workflow_model", target_id: "VERSION_UP" }],
]);

const AMBIGUOUS_LEGACY_VALUES = new Set(["forward", "design-bottomup"]);

function normalizeLegacyValue(value: string): string {
  return value.trim().toLocaleLowerCase("en-US").replaceAll("_", "-");
}

export function adaptLegacyWorkflowClassification(
  input: WorkflowClassificationLegacyInput,
): WorkflowClassificationLegacyReceipt {
  const token = normalizeLegacyValue(input.legacy_value);
  const source = { field: input.legacy_field, token };
  const classification = EXACT_CONVERSIONS.get(token) ?? null;

  if (classification) {
    return {
      schema_version: "helix-workflow-classification-legacy-receipt.v1",
      disposition: "converted",
      classification,
      source,
      warnings: [
        {
          code: "legacy-workflow-input",
          message: "deprecated mode/model input was converted to a current typed identity",
        },
      ],
      emit_legacy_identity: false,
      exit_code: 0,
    };
  }

  if (AMBIGUOUS_LEGACY_VALUES.has(token)) {
    return {
      schema_version: "helix-workflow-classification-legacy-receipt.v1",
      disposition: "ambiguous",
      classification: null,
      source,
      warnings: [
        {
          code: "legacy-workflow-ambiguous",
          message: "legacy input does not determine exactly one current typed identity",
        },
      ],
      emit_legacy_identity: false,
      exit_code: 1,
    };
  }

  return {
    schema_version: "helix-workflow-classification-legacy-receipt.v1",
    disposition: "unsupported",
    classification: null,
    source,
    warnings: [
      {
        code: "legacy-workflow-unsupported",
        message: "legacy input is not recognized by the bounded compatibility adapter",
      },
    ],
    emit_legacy_identity: false,
    exit_code: 1,
  };
}
