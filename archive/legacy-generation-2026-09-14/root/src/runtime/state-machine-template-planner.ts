import { detectTaskLenses, type TaskLens } from "./task-lens";

export const STATE_MACHINE_TEMPLATE_PLANNER_SCHEMA_VERSION = "state-machine-template-planner.v1";

export interface WorkflowTemplate {
  template_id: string;
  lenses: TaskLens[];
  allowed_tools: string[];
  transitions: string[];
  exit_criteria: string[];
}

export interface ExecutionTriple {
  task: string;
  template_id: string;
  outcome: "success" | "failure";
  evidence_digest: string;
}

export interface StateMachineTemplatePlan {
  schema_version: typeof STATE_MACHINE_TEMPLATE_PLANNER_SCHEMA_VERSION;
  ok: boolean;
  task_lenses: TaskLens[];
  selected_template_id: string | null;
  generated_workflow: WorkflowTemplate | null;
  validation: { valid: boolean; errors: string[] };
  executable: false;
  execution_triples: ExecutionTriple[];
  findings: Array<{ code: string; severity: "warning" | "error"; detail: string }>;
  source_command: string;
  read_only: true;
}

const SECRET_LIKE_RE =
  /\b[A-Za-z0-9_-]*(?:token|api[_-]?key|secret|password|passwd|pwd|bearer)[A-Za-z0-9_-]*\s*[=:]\s*\S+/i;

export const WORKFLOW_TEMPLATE_CATALOG: WorkflowTemplate[] = [
  {
    template_id: "workflow:design-verify",
    lenses: ["design", "verification"],
    allowed_tools: ["tool:lsp-readonly", "tool:agent-ready-search"],
    transitions: ["plan", "pair-freeze", "implement", "trace-freeze", "review"],
    exit_criteria: ["design binding present", "verification command recorded"],
  },
  {
    template_id: "workflow:troubleshoot-test",
    lenses: ["troubleshooting", "test-strategy"],
    allowed_tools: ["tool:lsp-readonly", "tool:runbook-compiler"],
    transitions: ["reproduce", "minimize", "fix", "regression-test"],
    exit_criteria: ["root cause recorded", "regression test green"],
  },
];

function validateTemplate(template: WorkflowTemplate | null): string[] {
  if (!template) return ["no template selected"];
  const errors: string[] = [];
  if (template.allowed_tools.length === 0) errors.push("allowed tools are required");
  if (template.transitions.length === 0) errors.push("transitions are required");
  if (template.exit_criteria.length === 0) errors.push("exit criteria are required");
  return errors;
}

export function buildStateMachineTemplatePlan(
  input: { task?: string | null; triples?: ExecutionTriple[]; sourceCommand?: string } = {},
): StateMachineTemplatePlan {
  const taskLenses = detectTaskLenses(input.task ?? "");
  const selected =
    WORKFLOW_TEMPLATE_CATALOG.find((template) =>
      template.lenses.some((lens) => taskLenses.includes(lens)),
    ) ?? null;
  const sanitizedTriples = (input.triples ?? []).filter(
    (triple) => !SECRET_LIKE_RE.test(JSON.stringify(triple)),
  );
  const droppedTripleCount = (input.triples ?? []).length - sanitizedTriples.length;
  const errors = validateTemplate(selected);
  const findings: StateMachineTemplatePlan["findings"] =
    droppedTripleCount > 0
      ? [
          {
            code: "execution_triple_secret_like_material_dropped",
            severity: "error",
            detail: `${droppedTripleCount} execution triples contained secret-like material`,
          },
        ]
      : [];
  return {
    schema_version: STATE_MACHINE_TEMPLATE_PLANNER_SCHEMA_VERSION,
    ok: errors.length === 0 && findings.length === 0,
    task_lenses: taskLenses,
    selected_template_id: selected?.template_id ?? null,
    generated_workflow: selected,
    validation: { valid: errors.length === 0, errors },
    executable: false,
    execution_triples: sanitizedTriples,
    findings,
    source_command: input.sourceCommand ?? "helix state-machine template --json",
    read_only: true,
  };
}
