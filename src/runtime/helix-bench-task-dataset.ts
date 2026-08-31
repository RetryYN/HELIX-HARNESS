import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { canonicalJson, type Sha256Digest, sha256Digest } from "./digest";

export const HELIX_BENCH_CATEGORIES = [
  "Requirement Binding",
  "Design Trace",
  "Controlled Implementation",
  "Review Convergence",
  "Cost & Capacity",
] as const;

export const HELIX_BENCH_TASK_FIELDS = [
  "task_id",
  "task_version",
  "fixture_digest",
  "requirement_ids",
  "acceptance_ids",
  "base_head",
  "allowed_paths",
  "forbidden_paths",
  "hidden_oracle_digest",
  "seed",
  "toolchain_versions",
  "timeout_policy",
  "retry_policy",
  "cache_policy",
  "hardware_class",
] as const;

type Category = (typeof HELIX_BENCH_CATEGORIES)[number];
type FailureCode =
  | "DATASET_INVALID"
  | "TASK_FIELD_SET_INVALID"
  | "TASK_CATEGORY_COVERAGE_INVALID"
  | "FIXTURE_MISSING"
  | "FIXTURE_DIGEST_DRIFT"
  | "HIDDEN_ORACLE_MISSING"
  | "HIDDEN_ORACLE_INVALID"
  | "HIDDEN_ORACLE_DIGEST_DRIFT"
  | "HIDDEN_ORACLE_LEAKAGE"
  | "HISTORICAL_RESULT_REUSE";

export interface HelixBenchTaskSnapshot {
  task_id: string;
  task_version: string;
  fixture_digest: Sha256Digest;
  requirement_ids: readonly string[];
  acceptance_ids: readonly string[];
  base_head: string;
  allowed_paths: readonly string[];
  forbidden_paths: readonly string[];
  hidden_oracle_digest: Sha256Digest;
  seed: number;
  toolchain_versions: Readonly<Record<string, string>>;
  timeout_policy: string;
  retry_policy: string;
  cache_policy: string;
  hardware_class: string;
}

export interface HelixBenchPublicTask {
  category: Category;
  external_worker_candidate: boolean;
  prompt: string;
  snapshot: HelixBenchTaskSnapshot;
}

interface FixtureRecord {
  task_id: string;
  payload: unknown;
}
interface HiddenOracleRecord {
  task_id: string;
  expected_failure_class: string;
  negative_mutations: readonly string[];
  historical_result_refs: readonly never[];
}
interface PublicRegistry {
  schema_version: "helix-bench-public-tasks.v1";
  dataset_version: string;
  tasks: unknown[];
}
interface FixtureRegistry {
  schema_version: "helix-bench-fixtures.v1";
  fixtures: FixtureRecord[];
}
interface HiddenRegistry {
  schema_version: "helix-bench-hidden-oracles.v1";
  oracles: HiddenOracleRecord[];
}

export type HelixBenchDatasetResult =
  | { ok: false; failure_code: FailureCode; task_id?: string }
  | {
      ok: true;
      dataset_version: string;
      dataset_digest: Sha256Digest;
      public_tasks: readonly HelixBenchPublicTask[];
      fixture_count: number;
      hidden_oracle_count: number;
    };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function exactKeys(value: Record<string, unknown>, expected: readonly string[]): boolean {
  const actual = Object.keys(value).sort();
  const sorted = [...expected].sort();
  return actual.length === sorted.length && actual.every((key, index) => key === sorted[index]);
}

function isDigest(value: unknown): value is Sha256Digest {
  return typeof value === "string" && /^sha256:[a-f0-9]{64}$/u.test(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === "string");
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return isRecord(value) && Object.values(value).every((entry) => typeof entry === "string");
}

function validateSnapshot(value: unknown): value is HelixBenchTaskSnapshot {
  if (!isRecord(value) || !exactKeys(value, HELIX_BENCH_TASK_FIELDS)) return false;
  return (
    typeof value.task_id === "string" &&
    typeof value.task_version === "string" &&
    isDigest(value.fixture_digest) &&
    isStringArray(value.requirement_ids) &&
    isStringArray(value.acceptance_ids) &&
    typeof value.base_head === "string" &&
    /^[a-f0-9]{40}$/u.test(value.base_head) &&
    isStringArray(value.allowed_paths) &&
    isStringArray(value.forbidden_paths) &&
    isDigest(value.hidden_oracle_digest) &&
    Number.isSafeInteger(value.seed) &&
    isStringRecord(value.toolchain_versions) &&
    typeof value.timeout_policy === "string" &&
    typeof value.retry_policy === "string" &&
    typeof value.cache_policy === "string" &&
    typeof value.hardware_class === "string"
  );
}

function containsHiddenMaterial(task: Record<string, unknown>): boolean {
  const serialized = canonicalJson(task).toLowerCase();
  return [
    "negative_mutations",
    "expected_failure_class",
    "historical_result_refs",
    "private_review_context",
  ].some((token) => serialized.includes(token));
}

export function validateHelixBenchDataset(input: {
  publicRegistry: unknown;
  fixtureRegistry: unknown;
  hiddenRegistry: unknown;
}): HelixBenchDatasetResult {
  if (
    !isRecord(input.publicRegistry) ||
    !isRecord(input.fixtureRegistry) ||
    !isRecord(input.hiddenRegistry)
  ) {
    return { ok: false, failure_code: "DATASET_INVALID" };
  }
  const publicRegistry = input.publicRegistry as unknown as PublicRegistry;
  const fixtureRegistry = input.fixtureRegistry as unknown as FixtureRegistry;
  const hiddenRegistry = input.hiddenRegistry as unknown as HiddenRegistry;
  if (
    !exactKeys(input.publicRegistry, ["schema_version", "dataset_version", "tasks"]) ||
    !exactKeys(input.fixtureRegistry, ["schema_version", "fixtures"]) ||
    !exactKeys(input.hiddenRegistry, ["schema_version", "oracles"]) ||
    publicRegistry.schema_version !== "helix-bench-public-tasks.v1" ||
    typeof publicRegistry.dataset_version !== "string" ||
    fixtureRegistry.schema_version !== "helix-bench-fixtures.v1" ||
    hiddenRegistry.schema_version !== "helix-bench-hidden-oracles.v1" ||
    !Array.isArray(publicRegistry.tasks) ||
    !Array.isArray(fixtureRegistry.fixtures) ||
    !Array.isArray(hiddenRegistry.oracles) ||
    publicRegistry.tasks.length !== 10 ||
    fixtureRegistry.fixtures.length > 10 ||
    hiddenRegistry.oracles.length > 10
  )
    return { ok: false, failure_code: "DATASET_INVALID" };

  const fixtures = new Map(fixtureRegistry.fixtures.map((entry) => [entry.task_id, entry]));
  const oracles = new Map(hiddenRegistry.oracles.map((entry) => [entry.task_id, entry]));
  const categories = new Set<Category>();
  const tasks: HelixBenchPublicTask[] = [];
  for (const raw of publicRegistry.tasks) {
    if (
      !isRecord(raw) ||
      !exactKeys(raw, ["category", "external_worker_candidate", "prompt", "snapshot"])
    ) {
      return { ok: false, failure_code: "TASK_FIELD_SET_INVALID" };
    }
    if (containsHiddenMaterial(raw)) return { ok: false, failure_code: "HIDDEN_ORACLE_LEAKAGE" };
    if (
      !HELIX_BENCH_CATEGORIES.includes(raw.category as Category) ||
      typeof raw.external_worker_candidate !== "boolean" ||
      typeof raw.prompt !== "string" ||
      !validateSnapshot(raw.snapshot)
    ) {
      return { ok: false, failure_code: "TASK_FIELD_SET_INVALID" };
    }
    const task = raw as unknown as HelixBenchPublicTask;
    const fixture = fixtures.get(task.snapshot.task_id);
    if (!fixture)
      return { ok: false, failure_code: "FIXTURE_MISSING", task_id: task.snapshot.task_id };
    if (sha256Digest(canonicalJson(fixture.payload)) !== task.snapshot.fixture_digest) {
      return { ok: false, failure_code: "FIXTURE_DIGEST_DRIFT", task_id: task.snapshot.task_id };
    }
    const oracle = oracles.get(task.snapshot.task_id);
    if (!oracle)
      return { ok: false, failure_code: "HIDDEN_ORACLE_MISSING", task_id: task.snapshot.task_id };
    if (
      !isRecord(oracle) ||
      !exactKeys(oracle, [
        "task_id",
        "expected_failure_class",
        "negative_mutations",
        "historical_result_refs",
      ]) ||
      typeof oracle.expected_failure_class !== "string" ||
      oracle.expected_failure_class.length === 0 ||
      !Array.isArray(oracle.negative_mutations) ||
      oracle.negative_mutations.length === 0 ||
      !oracle.negative_mutations.every(
        (mutation) => typeof mutation === "string" && mutation.length > 0,
      ) ||
      !Array.isArray(oracle.historical_result_refs)
    ) {
      return { ok: false, failure_code: "HIDDEN_ORACLE_INVALID", task_id: task.snapshot.task_id };
    }
    if (oracle.historical_result_refs.length !== 0) {
      return { ok: false, failure_code: "HISTORICAL_RESULT_REUSE", task_id: task.snapshot.task_id };
    }
    if (sha256Digest(canonicalJson(oracle)) !== task.snapshot.hidden_oracle_digest) {
      return {
        ok: false,
        failure_code: "HIDDEN_ORACLE_DIGEST_DRIFT",
        task_id: task.snapshot.task_id,
      };
    }
    categories.add(task.category);
    tasks.push(Object.freeze(task));
  }
  if (
    HELIX_BENCH_CATEGORIES.some(
      (category) => tasks.filter((task) => task.category === category).length !== 2,
    )
  ) {
    return { ok: false, failure_code: "TASK_CATEGORY_COVERAGE_INVALID" };
  }
  if (fixtures.size !== 10 || oracles.size !== 10) {
    return { ok: false, failure_code: "DATASET_INVALID" };
  }
  const digestInput = {
    dataset_version: publicRegistry.dataset_version,
    tasks: tasks.map((task) => task.snapshot),
  };
  return {
    ok: true,
    dataset_version: publicRegistry.dataset_version,
    dataset_digest: sha256Digest(canonicalJson(digestInput)),
    public_tasks: Object.freeze(tasks),
    fixture_count: fixtures.size,
    hidden_oracle_count: oracles.size,
  };
}

export function loadHelixBenchDataset(repoRoot = process.cwd()): HelixBenchDatasetResult {
  const read = (path: string): unknown => JSON.parse(readFileSync(resolve(repoRoot, path), "utf8"));
  return validateHelixBenchDataset({
    publicRegistry: read("config/helix-bench/public-tasks.v1.json"),
    fixtureRegistry: read("config/helix-bench/fixtures.v1.json"),
    hiddenRegistry: read("config/helix-bench/hidden/hidden-oracles.v1.json"),
  });
}
