import { z } from "zod";

export const WORKFLOW_INTERVIEW_SCHEMA_VERSION = "helix-workflow-interview.v1" as const;
export const WORKFLOW_QUESTION_CATALOG_VERSION = "uwj-question-catalog.v1" as const;

export const WORKFLOW_CONDITIONAL_SIGNALS = [
  "approval", "amount", "deadline", "external_integration", "pii", "attachment",
  "notification", "automation", "ai_judgment", "multi_actor", "return", "retry",
  "delete", "publication", "billing",
] as const;

export type WorkflowConditionalSignal = (typeof WORKFLOW_CONDITIONAL_SIGNALS)[number];

const idSchema = z.string().min(1).regex(/^[A-Za-z0-9][A-Za-z0-9._:-]*$/);
const digestSchema = z.string().regex(/^sha256:[a-f0-9]{64}$/);
const textSchema = z.string().trim().min(1);
const signalSchema = z.object(
  Object.fromEntries(WORKFLOW_CONDITIONAL_SIGNALS.map((signal) => [signal, z.boolean()])) as Record<
    WorkflowConditionalSignal,
    z.ZodBoolean
  >,
).strict();

const answerSchema = z.object({
  question_id: idSchema,
  value: textSchema,
  source_digest: digestSchema,
  source_revision: idSchema,
  question_version: z.literal(WORKFLOW_QUESTION_CATALOG_VERSION),
  authority: z.enum(["owner", "delegated", "unknown"]),
  source_span: textSchema,
}).strict();

const interviewInputSchema = z.object({
  schema_version: z.literal(WORKFLOW_INTERVIEW_SCHEMA_VERSION),
  source: z.object({ source_id: idSchema, revision: idSchema, digest: digestSchema, text: textSchema }).strict(),
  signals: signalSchema,
  answers: z.array(answerSchema),
  ambiguities: z.array(z.object({ detail: textSchema, source_span: textSchema }).strict()),
  branch_gaps: z.array(z.object({ detail: textSchema, source_span: textSchema }).strict()),
}).strict();

export interface WorkflowInterviewUnresolvedItem {
  unresolved_id: string;
  kind: "ambiguity" | "contradiction" | "authority_missing" | "branch_missing";
  code: string;
  source_span: string;
  question_history: string[];
}

export interface WorkflowInterviewEvaluation {
  ok: boolean;
  freeze_allowed: boolean;
  selected_question_ids: string[];
  admitted_question_ids: string[];
  unresolved_items: WorkflowInterviewUnresolvedItem[];
  findings: Array<{ code: string; path: string }>;
}

const coreQuestionId = "core.workflow";
const conditionalQuestionId = (signal: WorkflowConditionalSignal) => `conditional.${signal}`;

export function evaluateWorkflowInterview(input: unknown): WorkflowInterviewEvaluation {
  const parsed = interviewInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      freeze_allowed: false,
      selected_question_ids: [],
      admitted_question_ids: [],
      unresolved_items: [],
      findings: [{ code: "schema_invalid", path: parsed.error.issues[0]?.path.join(".") ?? "input" }],
    };
  }
  const value = parsed.data;
  const selected = [
    coreQuestionId,
    ...WORKFLOW_CONDITIONAL_SIGNALS.filter((signal) => value.signals[signal]).map(conditionalQuestionId),
  ];
  const selectedSet = new Set(selected);
  const findings: WorkflowInterviewEvaluation["findings"] = [];
  const unresolved: WorkflowInterviewUnresolvedItem[] = [];
  const admitted = new Set<string>();

  for (const answer of value.answers) {
    if (!selectedSet.has(answer.question_id)) {
      findings.push({ code: "non_applicable_answer", path: `answers.${answer.question_id}` });
      continue;
    }
    const history = value.answers
      .filter((candidate) => candidate.question_id === answer.question_id)
      .map((candidate, index) => `${candidate.question_id}#${index + 1}`);
    if (answer.source_digest !== value.source.digest || answer.source_revision !== value.source.revision) {
      unresolved.push({
        unresolved_id: `stale:${answer.question_id}`,
        kind: "ambiguity",
        code: "stale_answer",
        source_span: answer.source_span,
        question_history: history,
      });
      continue;
    }
    if (answer.authority === "unknown") {
      unresolved.push({
        unresolved_id: `authority:${answer.question_id}`,
        kind: "authority_missing",
        code: "answer_authority_missing",
        source_span: answer.source_span,
        question_history: history,
      });
      continue;
    }
    const distinct = new Set(
      value.answers.filter((candidate) => candidate.question_id === answer.question_id).map((candidate) => candidate.value),
    );
    if (distinct.size > 1) {
      if (!unresolved.some((item) => item.unresolved_id === `contradiction:${answer.question_id}`)) {
        unresolved.push({
          unresolved_id: `contradiction:${answer.question_id}`,
          kind: "contradiction",
          code: "conflicting_answers",
          source_span: answer.source_span,
          question_history: history,
        });
      }
      continue;
    }
    admitted.add(answer.question_id);
  }

  for (const questionId of selected) {
    if (!value.answers.some((answer) => answer.question_id === questionId)) {
      unresolved.push({
        unresolved_id: `missing:${questionId}`,
        kind: "ambiguity",
        code: "answer_missing",
        source_span: `source:${value.source.source_id}`,
        question_history: [questionId],
      });
    }
  }
  value.ambiguities.forEach((item, index) => unresolved.push({
    unresolved_id: `ambiguity:${index + 1}`, kind: "ambiguity", code: "source_ambiguity",
    source_span: item.source_span, question_history: [item.detail],
  }));
  value.branch_gaps.forEach((item, index) => unresolved.push({
    unresolved_id: `branch:${index + 1}`, kind: "branch_missing", code: "branch_missing",
    source_span: item.source_span, question_history: [item.detail],
  }));

  const freezeAllowed = findings.length === 0 && unresolved.length === 0 && admitted.size === selected.length;
  return {
    ok: findings.length === 0,
    freeze_allowed: freezeAllowed,
    selected_question_ids: selected,
    admitted_question_ids: [...admitted].sort(),
    unresolved_items: unresolved,
    findings,
  };
}
