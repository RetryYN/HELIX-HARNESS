import {
  loadWorkflowClassificationRegistry,
  type WorkflowClassificationRegistry,
} from "./workflow-classification-registry.js";

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

function normalizeLegacyValue(value: string): string {
  return value.trim().toLocaleLowerCase("en-US").replaceAll("_", "-");
}

export function adaptLegacyWorkflowClassification(
  input: WorkflowClassificationLegacyInput,
  registry: WorkflowClassificationRegistry = loadWorkflowClassificationRegistry(),
): WorkflowClassificationLegacyReceipt {
  const token = normalizeLegacyValue(input.legacy_value);
  const source = { field: input.legacy_field, token };
  const conversion = registry.legacy_input_adapter.conversions.find(
    (candidate) => candidate.token === token,
  );
  const classification = conversion
    ? { target_axis: conversion.target_axis, target_id: conversion.target_id }
    : null;

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

  if (registry.legacy_input_adapter.ambiguous_tokens.includes(token)) {
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
