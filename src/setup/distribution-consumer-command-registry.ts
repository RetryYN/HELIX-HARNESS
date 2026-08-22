export const LITE_CONSUMER_COMMAND_REGISTRY_SCHEMA =
  "helix-lite-consumer-command-registry.v1" as const;

export type LiteConsumerCommandId =
  | "setup_project"
  | "status"
  | "consumer_doctor"
  | "completion_decision_packet"
  | "completion_review_bundle"
  | "minimal_delegated_workflow";

export type LiteConsumerCommandFailureCode =
  | "command_unknown"
  | "option_not_allowed"
  | "required_option_missing"
  | "option_value_invalid";

export interface LiteConsumerCommandAdmission {
  ok: true;
  schema_version: typeof LITE_CONSUMER_COMMAND_REGISTRY_SCHEMA;
  command_id: LiteConsumerCommandId;
  provider: "codex" | "claude" | null;
  argv: string[];
  dry_run: boolean;
}

export interface LiteConsumerCommandFailure {
  ok: false;
  schema_version: typeof LITE_CONSUMER_COMMAND_REGISTRY_SCHEMA;
  code: LiteConsumerCommandFailureCode;
  token: string | null;
}

export type LiteConsumerCommandResult = LiteConsumerCommandAdmission | LiteConsumerCommandFailure;

const flagOnly = new Set(["--dry-run", "--json"]);

function failure(
  code: LiteConsumerCommandFailureCode,
  token: string | null,
): LiteConsumerCommandFailure {
  return { ok: false, schema_version: LITE_CONSUMER_COMMAND_REGISTRY_SCHEMA, code, token };
}

function admitFlags(
  argv: readonly string[],
  allowedFlags: ReadonlySet<string>,
): LiteConsumerCommandFailure | null {
  for (const token of argv) {
    if (!allowedFlags.has(token)) return failure("option_not_allowed", token);
  }
  return null;
}

function admission(
  command_id: LiteConsumerCommandId,
  argv: readonly string[],
  provider: "codex" | "claude" | null = null,
): LiteConsumerCommandAdmission {
  return {
    ok: true,
    schema_version: LITE_CONSUMER_COMMAND_REGISTRY_SCHEMA,
    command_id,
    provider,
    argv: [...argv],
    dry_run: command_id === "minimal_delegated_workflow" || argv.includes("--dry-run"),
  };
}

function optionValue(argv: readonly string[], option: string): string | null {
  const index = argv.indexOf(option);
  if (index < 0) return null;
  return argv[index + 1] ?? null;
}

function admitDelegation(argv: readonly string[]): LiteConsumerCommandResult {
  const provider = argv[0] === "codex" || argv[0] === "claude" ? argv[0] : null;
  if (!provider) return failure("command_unknown", argv[0] ?? null);
  const tail = argv.slice(1);
  const valueOptions = new Set(["--role", "--task", "--task-file", "--plan"]);
  for (let index = 0; index < tail.length; index += 1) {
    const token = tail[index];
    if (token === "--json") continue;
    if (token === "--execute") return failure("option_not_allowed", token);
    if (!valueOptions.has(token)) return failure("option_not_allowed", token);
    const value = tail[index + 1];
    if (!value || value.startsWith("--")) return failure("option_value_invalid", token);
    index += 1;
  }
  if (!optionValue(tail, "--role")) return failure("required_option_missing", "--role");
  const task = optionValue(tail, "--task");
  const taskFile = optionValue(tail, "--task-file");
  if (Boolean(task) === Boolean(taskFile)) {
    return failure("required_option_missing", "--task|--task-file");
  }
  return admission("minimal_delegated_workflow", argv, provider);
}

export function admitLiteConsumerCommand(argv: readonly string[]): LiteConsumerCommandResult {
  const first = argv[0];
  if (first === "codex" || first === "claude") return admitDelegation(argv);
  if (first === "setup" && argv[1] === "project") {
    const blocked = admitFlags(argv.slice(2), flagOnly);
    return blocked ?? admission("setup_project", argv);
  }
  if (first === "status") {
    const blocked = admitFlags(argv.slice(1), new Set(["--json"]));
    return blocked ?? admission("status", argv);
  }
  if (first === "doctor") {
    const tail = argv.slice(1);
    const profile = optionValue(tail, "--profile");
    for (let index = 0; index < tail.length; index += 1) {
      const token = tail[index];
      if (token === "--json") continue;
      if (token !== "--profile") return failure("option_not_allowed", token);
      index += 1;
    }
    if (!profile) return failure("required_option_missing", "--profile");
    if (profile !== "consumer") return failure("option_value_invalid", profile);
    return admission("consumer_doctor", argv);
  }
  if (first === "completion" && argv[1] === "decision-packet") {
    const blocked = admitFlags(argv.slice(2), new Set(["--json"]));
    return blocked ?? admission("completion_decision_packet", argv);
  }
  if (first === "completion" && argv[1] === "review-bundle") {
    const blocked = admitFlags(argv.slice(2), new Set(["--json"]));
    return blocked ?? admission("completion_review_bundle", argv);
  }
  return failure("command_unknown", argv.join(" ") || null);
}
