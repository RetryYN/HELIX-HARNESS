import { createHash } from "node:crypto";
import { lstatSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
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

function readOwnedRegularFile(root: string, path: string): string | null {
  try {
    const logical = resolve(root, path);
    const rel = relative(root, logical);
    if (!rel || rel === ".." || rel.startsWith(`..${sep}`)) return null;
    const physicalParent = realpathSync(dirname(logical));
    const physical = realpathSync(logical);
    const stat = lstatSync(logical);
    if (
      physicalParent !== dirname(logical) ||
      physical !== logical ||
      !stat.isFile() ||
      stat.isSymbolicLink() ||
      stat.nlink !== 1
    ) {
      return null;
    }
    return readFileSync(physical, "utf8");
  } catch {
    return null;
  }
}

function pathEntryExists(path: string): boolean {
  try {
    lstatSync(path);
    return true;
  } catch {
    return false;
  }
}

function hasSafePhysicalParents(root: string, path: string): boolean {
  const logical = resolve(root, path);
  const rel = relative(root, logical);
  if (!rel || rel === ".." || rel.startsWith(`..${sep}`)) return false;
  try {
    if (realpathSync(root) !== root || lstatSync(root).isSymbolicLink()) return false;
    let current = root;
    for (const segment of rel.split(sep).slice(0, -1)) {
      current = join(current, segment);
      if (!pathEntryExists(current)) break;
      const stat = lstatSync(current);
      if (!stat.isDirectory() || stat.isSymbolicLink() || realpathSync(current) !== current) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

function readState(root: string): ConsumerState | null {
  try {
    const bytes = readOwnedRegularFile(root, STATE_PATH);
    if (!bytes) return null;
    const value = JSON.parse(bytes) as ConsumerState;
    const keys = Object.keys(value).sort();
    return JSON.stringify(keys) ===
      JSON.stringify(["installed", "managed_files", "schema_version"]) &&
      value.schema_version === STATE_SCHEMA &&
      value.installed === true &&
      JSON.stringify(value.managed_files) === JSON.stringify([CI_PATH])
      ? value
      : null;
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
  if (!hasSafePhysicalParents(root, path)) return "conflict";
  if (pathEntryExists(target)) {
    return readOwnedRegularFile(root, path) === content ? "unchanged" : "conflict";
  }
  mkdirSync(dirname(target), { recursive: true });
  if (!hasSafePhysicalParents(root, path) || pathEntryExists(target)) return "conflict";
  writeFileSync(target, content, { encoding: "utf8", flag: "wx" });
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
  const consumerFailures = (): string[] => {
    const failures: string[] = [];
    if (!readState(root)) failures.push("consumer_state_missing_or_invalid");
    if (readOwnedRegularFile(root, "package.json") === null) {
      failures.push("package_json_missing_or_unsafe");
    }
    if (readOwnedRegularFile(root, CI_PATH) !== ci) {
      failures.push("consumer_ci_missing_or_invalid");
    }
    return failures;
  };

  return {
    setup_project({ dry_run }) {
      const currentState = readState(root);
      const ciStatus = pathEntryExists(join(root, CI_PATH))
        ? readOwnedRegularFile(root, CI_PATH) === ci
          ? "unchanged"
          : "conflict"
        : "create";
      const stateStatus = pathEntryExists(join(root, STATE_PATH))
        ? readOwnedRegularFile(root, STATE_PATH) === stateBytes
          ? "unchanged"
          : "conflict"
        : "create";
      const changes = [
        ...(ciStatus === "create" ? [CI_PATH] : []),
        ...(stateStatus === "create" ? [STATE_PATH] : []),
      ];
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
        changes,
      });
    },
    status() {
      const installed = readState(root) !== null;
      return payload("status", { ok: installed, installed }, installed ? 0 : 1);
    },
    consumer_doctor() {
      const failures = consumerFailures();
      return payload(
        "consumer_doctor",
        { ok: failures.length === 0, failures },
        failures.length === 0 ? 0 : 1,
      );
    },
    completion_decision_packet() {
      const stateValue = readState(root);
      const failures = consumerFailures();
      return payload(
        "completion_decision_packet",
        {
          ok: failures.length === 0,
          failures,
          consumer_state_digest: stateValue ? digest(JSON.stringify(stateValue)) : null,
        },
        failures.length === 0 ? 0 : 1,
      );
    },
    completion_review_bundle() {
      const stateValue = readState(root);
      const failures = consumerFailures();
      return payload(
        "completion_review_bundle",
        {
          ok: failures.length === 0,
          failures,
          review_scope: "consumer-owned-repository",
          consumer_state_digest: stateValue ? digest(JSON.stringify(stateValue)) : null,
        },
        failures.length === 0 ? 0 : 1,
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
