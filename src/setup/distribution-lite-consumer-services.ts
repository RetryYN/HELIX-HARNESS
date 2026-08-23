import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import type {
  LiteConsumerDelegationInput,
  LiteConsumerNodeServiceResult,
  LiteConsumerNodeServices,
} from "./distribution-consumer-node-adapter";

const STATE_PATH = ".helix/consumer-lite.json";
const CI_PATH = ".github/workflows/helix-consumer.yml";
const STATE_SCHEMA = "helix-lite-consumer-state.v1";

interface ConsumerState {
  schema_version: typeof STATE_SCHEMA;
  installed: true;
  managed_files: string[];
}

function digest(value: string): string {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

function payload(
  command: string,
  data: Record<string, unknown>,
  exitCode = 0,
): LiteConsumerNodeServiceResult {
  return {
    payload: { schema_version: "helix-lite-consumer-receipt.v1", command, ...data },
    exit_code: exitCode,
  };
}

function readState(root: string): ConsumerState | null {
  try {
    const value = JSON.parse(readFileSync(join(root, STATE_PATH), "utf8")) as ConsumerState;
    return value.schema_version === STATE_SCHEMA && value.installed === true ? value : null;
  } catch {
    return null;
  }
}

function writeOwnedFile(
  root: string,
  path: string,
  content: string,
): "created" | "unchanged" | "conflict" {
  const target = join(root, path);
  if (existsSync(target))
    return readFileSync(target, "utf8") === content ? "unchanged" : "conflict";
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content, "utf8");
  return "created";
}

export function createLiteConsumerServices(repoRoot: string): LiteConsumerNodeServices {
  const root = resolve(repoRoot);
  const ci = [
    "name: HELIX consumer",
    "on: [push, pull_request]",
    "jobs:",
    "  helix-consumer:",
    "    runs-on: ubuntu-latest",
    "    steps:",
    "      - uses: actions/checkout@v4",
    "      - uses: actions/setup-node@v4",
    "        with:",
    "          node-version: '24.15.0'",
    "      - run: npm ci --ignore-scripts",
    "      - run: npx --no-install helix doctor --profile consumer --json",
    "",
  ].join("\n");
  const state: ConsumerState = {
    schema_version: STATE_SCHEMA,
    installed: true,
    managed_files: [CI_PATH],
  };
  const stateBytes = `${JSON.stringify(state, null, 2)}\n`;

  return {
    setup_project({ dry_run }) {
      const currentState = readState(root);
      const ciStatus = existsSync(join(root, CI_PATH))
        ? readFileSync(join(root, CI_PATH), "utf8") === ci
          ? "unchanged"
          : "conflict"
        : "create";
      const stateStatus = existsSync(join(root, STATE_PATH))
        ? readFileSync(join(root, STATE_PATH), "utf8") === stateBytes
          ? "unchanged"
          : "conflict"
        : "create";
      if (ciStatus === "conflict" || stateStatus === "conflict") {
        return payload("setup_project", { ok: false, reason: "consumer_owned_file_conflict" }, 1);
      }
      if (!dry_run) {
        const ciWrite = writeOwnedFile(root, CI_PATH, ci);
        const stateWrite = writeOwnedFile(root, STATE_PATH, stateBytes);
        if (ciWrite === "conflict" || stateWrite === "conflict") {
          return payload("setup_project", { ok: false, reason: "consumer_owned_file_conflict" }, 1);
        }
      }
      return payload("setup_project", {
        ok: true,
        dry_run: dry_run,
        idempotent:
          currentState !== null && ciStatus === "unchanged" && stateStatus === "unchanged",
        changes: [CI_PATH, STATE_PATH].filter((path) => !existsSync(join(root, path))),
      });
    },
    status() {
      const installed = readState(root) !== null;
      return payload("status", { ok: installed, installed }, installed ? 0 : 1);
    },
    consumer_doctor() {
      const stateValue = readState(root);
      const failures: string[] = [];
      if (!stateValue) failures.push("consumer_state_missing_or_invalid");
      if (!existsSync(join(root, "package.json"))) failures.push("package_json_missing");
      if (!existsSync(join(root, CI_PATH))) failures.push("consumer_ci_missing");
      return payload(
        "consumer_doctor",
        { ok: failures.length === 0, failures },
        failures.length === 0 ? 0 : 1,
      );
    },
    completion_decision_packet() {
      const stateValue = readState(root);
      return payload(
        "completion_decision_packet",
        {
          ok: stateValue !== null,
          consumer_state_digest: stateValue ? digest(JSON.stringify(stateValue)) : null,
        },
        stateValue ? 0 : 1,
      );
    },
    completion_review_bundle() {
      const stateValue = readState(root);
      return payload(
        "completion_review_bundle",
        {
          ok: stateValue !== null,
          review_scope: "consumer-owned-repository",
          consumer_state_digest: stateValue ? digest(JSON.stringify(stateValue)) : null,
        },
        stateValue ? 0 : 1,
      );
    },
    minimal_delegated_workflow(input: LiteConsumerDelegationInput) {
      return payload("minimal_delegated_workflow", {
        ok: true,
        execute: false,
        provider: input.provider,
        role: input.role,
        plan_id: input.plan_id,
        task_digest: digest(input.task),
      });
    },
  };
}
