import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// PLAN-L7-504-worker-blind-benchmark
import { checkDesignRealityBinding } from "../src/doctor/index";
import {
  analyzeDesignRealityBinding,
  classifyAddDesignRealityTargets,
  DESIGN_REALITY_EMPTY_FAILURE_BINDING_SCHEMA_VERSION,
  type DesignRealityEmptyFailureBindingBaseline,
  designRealityBindingMessages,
  evaluateFailureWitness,
  type FailureReachabilityWitness,
  INITIAL_DESIGN_REALITY_EMPTY_FAILURE_BINDING_BASELINE,
  isDesignRealityPlanLayer,
  isHelixDesignRealityTarget,
} from "../src/lint/design-reality-binding";

// PLAN-L7-505-worker-risk-admission
import { lintPlanGate } from "../src/plan/lint";
import { canonicalJson, sha256Digest } from "../src/runtime/digest";

// PLAN-L7-500-worker-isolation-policy
// PLAN-L7-501-worker-output-admission
// PLAN-L7-502-worker-independent-review
// PLAN-L7-503-worker-context-authority
// PLAN-RECOVERY-105-design-reality-binding-empty-failure-baseline

function fixtureRoot(): string {
  const root = mkdtempSync(join(tmpdir(), "helix-design-reality-"));
  for (const dir of [
    "docs/design/helix/L4-basic-design",
    "docs/design/helix/L5-detail",
    "docs/plans",
    "src/runtime",
    "tests",
  ]) {
    mkdirSync(join(root, dir), { recursive: true });
  }
  return root;
}

function witness(identityFields = ["agent_id", "contract_version"]): FailureReachabilityWitness {
  return {
    reason_code: "WORKER_DESCRIPTOR_CAPABILITY_MISMATCH",
    reachability_mode: "identity_post_check",
    source_path: "src/runtime/worker.ts",
    source_symbol: "resolveWorkerDescriptor",
    test_path: "tests/runtime.test.ts",
    oracle_id: "U-WDA-004",
    identity_fields: identityFields,
    post_resolution_checks: ["capability_class"],
    fixture: {
      registry: [
        { agent_id: "kimi", contract_version: "1.0.0", capability_class: "implementation" },
      ],
      request: { agent_id: "kimi", contract_version: "1.0.0", capability_class: "verification" },
    },
    expected_reason: "WORKER_DESCRIPTOR_CAPABILITY_MISMATCH",
    mutation: {
      remove_post_resolution_check: "capability_class",
      expected_reason_after_mutation: "OK",
    },
  };
}

function design(binding: unknown, body = ""): string {
  return `---\ntitle: reality\nlayer: L4\nartifact_type: design\nstatus: confirmed\nupdated: 2026-08-03\n---\n\n${body}\n\n<!-- HELIX:design-reality-binding:v1 -->\n\`\`\`json\n${JSON.stringify(binding, null, 2)}\n\`\`\`\n`;
}

function emptyFailureBindingBaseline(entries: string[]): DesignRealityEmptyFailureBindingBaseline {
  const sorted = [...entries].sort();
  return {
    schema_version: DESIGN_REALITY_EMPTY_FAILURE_BINDING_SCHEMA_VERSION,
    entries: sorted,
    baseline_digest: sha256Digest(canonicalJson(sorted)),
  };
}

function fixtureRootWithEmptyBinding(): { root: string } {
  const root = fixtureRoot();
  const file = join(root, "docs/design/helix/L5-detail/github-issue-native-graph-provider.md");
  writeFileSync(
    file,
    design(
      {
        schema_version: "helix-design-reality-binding.v1",
        assets: [],
        declared_failure_codes: [],
        failure_reachability: [],
      },
      "## 4. Fail-close方針\nrunner error、JSON不正、Issue欠落をfail-closeする。",
    ),
  );
  return { root };
}

function executeDesignRealityMutationOracle(
  target: string,
  replacement: string,
  oracle: string,
): boolean {
  const runtime = readFileSync("src/lint/design-reality-binding.ts", "utf8");
  const test = readFileSync("tests/design-reality-binding.test.ts", "utf8");
  if (!runtime.includes(target)) return false;
  const id = randomUUID();
  const moduleName = `design-reality-binding.mutant-${id}.ts`;
  const modulePath = `src/lint/${moduleName}`;
  const testPath = `tests/design-reality-binding.mutant-${id}.test.ts`;
  writeFileSync(modulePath, runtime.replace(target, replacement));
  writeFileSync(
    testPath,
    test.replace(
      'from "../src/lint/design-reality-binding"',
      `from "../src/lint/${moduleName.slice(0, -3)}"`,
    ),
  );
  try {
    execFileSync(
      "npx",
      ["--no-install", "vitest", "run", testPath, "-t", oracle, "--reporter=dot"],
      { cwd: process.cwd(), stdio: "pipe", timeout: 30_000 },
    );
    return false;
  } catch (error) {
    const failure = error as { stdout?: Buffer; stderr?: Buffer };
    const output = `${failure.stdout?.toString() ?? ""}\n${failure.stderr?.toString() ?? ""}`;
    return output.includes(oracle) && /FAIL|AssertionError|TypeError/.test(output);
  } finally {
    unlinkSync(testPath);
    unlinkSync(modulePath);
  }
}

function validFixture(): { root: string; binding: Record<string, unknown> } {
  const root = fixtureRoot();
  const runtime = `export function resolveWorkerDescriptor(request: Record<string, string>, entries: Record<string, string>[]): string {
  const matches = entries.filter((entry) => entry.agent_id === request.agent_id && entry.contract_version === request.contract_version);
  if (matches.length === 0) return "WORKER_DESCRIPTOR_NOT_FOUND";
  if (matches.length > 1) return "WORKER_DESCRIPTOR_AMBIGUOUS";
  if (matches[0].capability_class !== request.capability_class) return "WORKER_DESCRIPTOR_CAPABILITY_MISMATCH";
  return "OK";
}\n`;
  writeFileSync(join(root, "src/runtime/worker.ts"), runtime);
  writeFileSync(
    join(root, "tests/runtime.test.ts"),
    `import { expect, it } from "vitest";\nimport { resolveWorkerDescriptor } from "../src/runtime/worker";\nit("U-WDA-004: mismatch", () => { expect(resolveWorkerDescriptor({ agent_id: "kimi", contract_version: "1.0.0", capability_class: "verification" }, [{ agent_id: "kimi", contract_version: "1.0.0", capability_class: "implementation" }])).toBe("WORKER_DESCRIPTOR_CAPABILITY_MISMATCH"); });\n`,
  );
  const binding = {
    schema_version: "helix-design-reality-binding.v1",
    assets: [
      {
        asset_id: "worker-resolver",
        classification: "existing_runtime",
        artifact_path: "src/runtime/worker.ts",
        resource_kind: "typescript_export",
        resource_name: "resolveWorkerDescriptor",
        source_digest: sha256Digest(runtime),
        current_authority: true,
      },
    ],
    declared_failure_codes: ["WORKER_DESCRIPTOR_CAPABILITY_MISMATCH"],
    failure_reachability: [witness()],
  };
  return { root, binding };
}

function executeRuntimeMutationOracle(
  target: string,
  replacement: string,
  oracle: string,
): boolean {
  const runtime = readFileSync("src/runtime/worker-descriptor-admission.ts", "utf8");
  const test = readFileSync("tests/worker-descriptor-admission.test.ts", "utf8");
  if (!runtime.includes(target)) return false;
  const id = randomUUID();
  const moduleName = `worker-descriptor-admission.mutant-${id}.ts`;
  const modulePath = `src/runtime/${moduleName}`;
  const testPath = `tests/worker-descriptor-admission.mutant-${id}.test.ts`;
  writeFileSync(modulePath, runtime.replace(target, replacement));
  writeFileSync(
    testPath,
    test.replace(
      'from "../src/runtime/worker-descriptor-admission"',
      `from "../src/runtime/${moduleName.replace(/\.ts$/, "")}"`,
    ),
  );
  try {
    execFileSync(
      "npx",
      ["--no-install", "vitest", "run", testPath, "-t", oracle, "--reporter=dot"],
      { cwd: process.cwd(), stdio: "pipe", timeout: 30_000 },
    );
    return false;
  } catch (error) {
    const failure = error as { stdout?: Buffer; stderr?: Buffer };
    const output = `${failure.stdout?.toString() ?? ""}\n${failure.stderr?.toString() ?? ""}`;
    return output.includes(oracle) && /FAIL|AssertionError|TypeError/.test(output);
  } finally {
    unlinkSync(testPath);
    unlinkSync(modulePath);
  }
}

function executeGitHubCrossReviewMutationOracle(
  target: string,
  replacement: string,
  oracle: string,
): boolean {
  const runtime = readFileSync("src/runtime/github-cross-review-admission.ts", "utf8");
  const test = readFileSync("tests/github-cross-review-admission.test.ts", "utf8");
  if (!runtime.includes(target)) return false;
  const id = randomUUID();
  const moduleName = `github-cross-review-admission.mutant-${id}.ts`;
  const modulePath = `src/runtime/${moduleName}`;
  const testPath = `tests/github-cross-review-admission.mutant-${id}.test.ts`;
  writeFileSync(modulePath, runtime.replace(target, replacement));
  writeFileSync(
    testPath,
    test.replace(
      'from "../src/runtime/github-cross-review-admission"',
      `from "../src/runtime/${moduleName.replace(/\.ts$/, "")}"`,
    ),
  );
  try {
    execFileSync(
      "npx",
      ["--no-install", "vitest", "run", testPath, "-t", oracle, "--reporter=dot"],
      { cwd: process.cwd(), stdio: "pipe", timeout: 30_000 },
    );
    return false;
  } catch (error) {
    const failure = error as { stdout?: Buffer; stderr?: Buffer };
    const output = `${failure.stdout?.toString() ?? ""}\n${failure.stderr?.toString() ?? ""}`;
    return output.includes(oracle) && /FAIL|AssertionError|TypeError/.test(output);
  } finally {
    unlinkSync(testPath);
    unlinkSync(modulePath);
  }
}

function executeGitHubCrossReviewAdapterMutationOracle(
  target: string,
  replacement: string,
): boolean {
  const source = readFileSync("src/cli.ts", "utf8");
  if (!source.includes(target)) return false;
  const path = join(tmpdir(), `helix-gcra-cli-mutant-${randomUUID()}.ts`);
  writeFileSync(path, source.replace(target, replacement));
  try {
    execFileSync(
      "npx",
      [
        "--no-install",
        "vitest",
        "run",
        "tests/github-cross-review-admission.test.ts",
        "-t",
        "U-GCRA-005b",
        "--reporter=dot",
      ],
      {
        cwd: process.cwd(),
        env: { ...process.env, HELIX_GCRA_CLI_SOURCE: path },
        stdio: "pipe",
        timeout: 30_000,
      },
    );
    return false;
  } catch (error) {
    const failure = error as { stdout?: Buffer; stderr?: Buffer };
    const output = `${failure.stdout?.toString() ?? ""}\n${failure.stderr?.toString() ?? ""}`;
    return output.includes("U-GCRA-005b") && /FAIL|AssertionError|TypeError/.test(output);
  } finally {
    unlinkSync(path);
  }
}

function executeWrapperMutationOracle(
  target: string,
  replacement: string,
  oracle: string,
): boolean {
  const runtime = readFileSync("src/runtime/adapter.ts", "utf8");
  const test = readFileSync("tests/worker-wrapper-admission.test.ts", "utf8");
  if (!runtime.includes(target)) return false;
  const id = randomUUID();
  const moduleName = `adapter.mutant-${id}.ts`;
  const modulePath = `src/runtime/${moduleName}`;
  const testPath = `tests/worker-wrapper-admission.mutant-${id}.test.ts`;
  writeFileSync(modulePath, runtime.replace(target, replacement));
  writeFileSync(
    testPath,
    test.replace(
      'from "../src/runtime/adapter"',
      `from "../src/runtime/${moduleName.slice(0, -3)}"`,
    ),
  );
  try {
    execFileSync(
      "npx",
      ["--no-install", "vitest", "run", testPath, "-t", oracle, "--reporter=dot"],
      { cwd: process.cwd(), stdio: "pipe", timeout: 30_000 },
    );
    return false;
  } catch (error) {
    const failure = error as { stdout?: Buffer; stderr?: Buffer };
    const output = `${failure.stdout?.toString() ?? ""}\n${failure.stderr?.toString() ?? ""}`;
    return output.includes(oracle) && /FAIL|AssertionError|TypeError/.test(output);
  } finally {
    unlinkSync(testPath);
    unlinkSync(modulePath);
  }
}

function executeIsolationMutationOracle(
  target: string,
  replacement: string,
  oracle: string,
): boolean {
  const runtime = readFileSync("src/runtime/worker-isolation-broker.ts", "utf8");
  const test = readFileSync("tests/worker-isolation-broker.test.ts", "utf8");
  if (!runtime.includes(target)) return false;
  const id = randomUUID();
  const moduleName = `worker-isolation-broker.mutant-${id}.ts`;
  const modulePath = `src/runtime/${moduleName}`;
  const testPath = `tests/worker-isolation-broker.mutant-${id}.test.ts`;
  writeFileSync(modulePath, runtime.replace(target, replacement));
  writeFileSync(
    testPath,
    test.replace(
      'from "../src/runtime/worker-isolation-broker"',
      `from "../src/runtime/${moduleName.slice(0, -3)}"`,
    ),
  );
  try {
    execFileSync(
      "npx",
      ["--no-install", "vitest", "run", testPath, "-t", oracle, "--reporter=dot"],
      { cwd: process.cwd(), stdio: "pipe", timeout: 30_000 },
    );
    return false;
  } catch (error) {
    const failure = error as { stdout?: Buffer; stderr?: Buffer };
    const output = `${failure.stdout?.toString() ?? ""}\n${failure.stderr?.toString() ?? ""}`;
    return output.includes(oracle) && /FAIL|AssertionError|TypeError/.test(output);
  } finally {
    unlinkSync(testPath);
    unlinkSync(modulePath);
  }
}

function executeIsolationPolicyMutationOracle(
  target: string,
  replacement: string,
  oracle: string,
): boolean {
  const runtime = readFileSync("src/runtime/worker-isolation-policy.ts", "utf8");
  const test = readFileSync("tests/worker-isolation-policy.test.ts", "utf8");
  if (!runtime.includes(target)) return false;
  const id = randomUUID();
  const moduleName = `worker-isolation-policy.mutant-${id}.ts`;
  const modulePath = `src/runtime/${moduleName}`;
  const testPath = `tests/worker-isolation-policy.mutant-${id}.test.ts`;
  writeFileSync(modulePath, runtime.replace(target, replacement));
  writeFileSync(
    testPath,
    test.replace(
      'from "../src/runtime/worker-isolation-policy"',
      `from "../src/runtime/${moduleName.slice(0, -3)}"`,
    ),
  );
  try {
    execFileSync(
      "npx",
      ["--no-install", "vitest", "run", testPath, "-t", oracle, "--reporter=dot"],
      { cwd: process.cwd(), stdio: "pipe", timeout: 30_000 },
    );
    return false;
  } catch (error) {
    const failure = error as { stdout?: Buffer; stderr?: Buffer };
    const output = `${failure.stdout?.toString() ?? ""}\n${failure.stderr?.toString() ?? ""}`;
    return output.includes(oracle) && /FAIL|AssertionError|TypeError/.test(output);
  } finally {
    unlinkSync(testPath);
    unlinkSync(modulePath);
  }
}

function executeWorkerOutputMutationOracle(
  target: string,
  replacement: string,
  oracle: string,
): boolean {
  const runtime = readFileSync("src/runtime/worker-output-admission.ts", "utf8");
  const test = readFileSync("tests/worker-output-admission.test.ts", "utf8");
  if (!runtime.includes(target)) return false;
  const id = randomUUID();
  const moduleName = `worker-output-admission.mutant-${id}.ts`;
  const modulePath = `src/runtime/${moduleName}`;
  const testPath = `tests/worker-output-admission.mutant-${id}.test.ts`;
  writeFileSync(modulePath, runtime.replace(target, replacement));
  writeFileSync(
    testPath,
    test.replace(
      'from "../src/runtime/worker-output-admission"',
      `from "../src/runtime/${moduleName.slice(0, -3)}"`,
    ),
  );
  try {
    execFileSync(
      "npx",
      ["--no-install", "vitest", "run", testPath, "-t", oracle, "--reporter=dot"],
      { cwd: process.cwd(), stdio: "pipe", timeout: 30_000 },
    );
    return false;
  } catch (error) {
    const failure = error as { stdout?: Buffer; stderr?: Buffer };
    const output = `${failure.stdout?.toString() ?? ""}\n${failure.stderr?.toString() ?? ""}`;
    return output.includes(oracle) && /FAIL|AssertionError|TypeError/.test(output);
  } finally {
    unlinkSync(testPath);
    unlinkSync(modulePath);
  }
}

function executeWorkerReviewMutationOracle(
  target: string,
  replacement: string,
  oracle: string,
): boolean {
  const runtime = readFileSync("src/runtime/worker-review-receipt.ts", "utf8");
  const test = readFileSync("tests/worker-review-receipt.test.ts", "utf8");
  if (!runtime.includes(target)) return false;
  const id = randomUUID();
  const moduleName = `worker-review-receipt.mutant-${id}.ts`;
  const modulePath = `src/runtime/${moduleName}`;
  const testPath = `tests/worker-review-receipt.mutant-${id}.test.ts`;
  writeFileSync(modulePath, runtime.replace(target, replacement));
  writeFileSync(
    testPath,
    test.replace(
      'from "../src/runtime/worker-review-receipt"',
      `from "../src/runtime/${moduleName.slice(0, -3)}"`,
    ),
  );
  try {
    execFileSync(
      "npx",
      ["--no-install", "vitest", "run", testPath, "-t", oracle, "--reporter=dot"],
      { cwd: process.cwd(), stdio: "pipe", timeout: 30_000 },
    );
    return false;
  } catch (error) {
    const failure = error as { stdout?: Buffer; stderr?: Buffer };
    const output = `${failure.stdout?.toString() ?? ""}\n${failure.stderr?.toString() ?? ""}`;
    return output.includes(oracle) && /FAIL|AssertionError|TypeError/.test(output);
  } finally {
    unlinkSync(testPath);
    unlinkSync(modulePath);
  }
}

function executeWorkerLifecycleMutationOracle(
  target: string,
  replacement: string,
  oracle: string,
): boolean {
  const runtime = readFileSync("src/runtime/worker-lifecycle-receipt.ts", "utf8");
  const test = readFileSync("tests/worker-isolation-broker.test.ts", "utf8");
  if (!runtime.includes(target)) return false;
  const id = randomUUID();
  const moduleName = `worker-lifecycle-receipt.mutant-${id}.ts`;
  const modulePath = `src/runtime/${moduleName}`;
  const testPath = `tests/worker-lifecycle-receipt.mutant-${id}.test.ts`;
  writeFileSync(modulePath, runtime.replace(target, replacement));
  writeFileSync(
    testPath,
    test.replace(
      'from "../src/runtime/worker-lifecycle-receipt"',
      `from "../src/runtime/${moduleName.slice(0, -3)}"`,
    ),
  );
  try {
    execFileSync(
      "npx",
      ["--no-install", "vitest", "run", testPath, "-t", oracle, "--reporter=dot"],
      { cwd: process.cwd(), stdio: "pipe", timeout: 30_000 },
    );
    return false;
  } catch (error) {
    const failure = error as { stdout?: Buffer; stderr?: Buffer };
    const output = `${failure.stdout?.toString() ?? ""}\n${failure.stderr?.toString() ?? ""}`;
    return output.includes(oracle) && /FAIL|AssertionError|TypeError/.test(output);
  } finally {
    unlinkSync(testPath);
    unlinkSync(modulePath);
  }
}

function executeWorkerContextMutationOracle(
  target: string,
  replacement: string,
  oracle: string,
): boolean {
  const runtime = readFileSync("src/runtime/worker-context-packet.ts", "utf8");
  const test = readFileSync("tests/worker-context-packet.test.ts", "utf8");
  if (!runtime.includes(target)) return false;
  const id = randomUUID();
  const moduleName = `worker-context-packet.mutant-${id}.ts`;
  const modulePath = `src/runtime/${moduleName}`;
  const testPath = `tests/worker-context-packet.mutant-${id}.test.ts`;
  writeFileSync(modulePath, runtime.replace(target, replacement));
  writeFileSync(
    testPath,
    test.replace(
      'from "../src/runtime/worker-context-packet"',
      `from "../src/runtime/${moduleName.slice(0, -3)}"`,
    ),
  );
  try {
    execFileSync(
      "npx",
      ["--no-install", "vitest", "run", testPath, "-t", oracle, "--reporter=dot"],
      { cwd: process.cwd(), stdio: "pipe", timeout: 30_000 },
    );
    return false;
  } catch (error) {
    const failure = error as { stdout?: Buffer; stderr?: Buffer };
    const output = `${failure.stdout?.toString() ?? ""}\n${failure.stderr?.toString() ?? ""}`;
    return output.includes(oracle) && /FAIL|AssertionError|TypeError/.test(output);
  } finally {
    unlinkSync(testPath);
    unlinkSync(modulePath);
  }
}

function executeWorkerBlindBenchmarkMutationOracle(
  target: string,
  replacement: string,
  oracle: string,
): boolean {
  const runtime = readFileSync("src/runtime/worker-blind-benchmark.ts", "utf8");
  const definitionRuntime = readFileSync("src/runtime/worker-blind-definition.ts", "utf8");
  const integration = oracle === "U-WBB-003" || oracle === "U-WBB-004" || oracle === "U-WBB-005";
  const sourceTestPath = integration
    ? "tests/worker-isolation-broker.test.ts"
    : "tests/worker-blind-benchmark.test.ts";
  const test = readFileSync(sourceTestPath, "utf8");
  const targetIsDefinition = !runtime.includes(target) && definitionRuntime.includes(target);
  if (!runtime.includes(target) && !targetIsDefinition) return false;
  const id = randomUUID();
  const moduleName = `worker-blind-benchmark.mutant-${id}.ts`;
  const modulePath = `src/runtime/${moduleName}`;
  const definitionModuleName = `worker-blind-definition.mutant-${id}.ts`;
  const definitionModulePath = `src/runtime/${definitionModuleName}`;
  const testPath = `tests/worker-blind-benchmark.mutant-${id}.test.ts`;
  // integration oracle は tests/helpers/worker-isolation-fixture.ts 経由でも runtime を掴むため
  // (PLAN-RECOVERY-37 / issue #382)、helper 側の import も mutant へ差し替えないと mutation が
  // 一部経路へ届かない。helper も mutant コピーを作って両方の import を書き換える。
  const helperModuleName = `worker-isolation-fixture.mutant-${id}.ts`;
  const helperPath = `tests/helpers/${helperModuleName}`;
  if (integration) {
    const helper = readFileSync("tests/helpers/worker-isolation-fixture.ts", "utf8");
    writeFileSync(
      helperPath,
      helper.replaceAll(
        'from "../../src/runtime/worker-blind-benchmark"',
        `from "../../src/runtime/${moduleName.slice(0, -3)}"`,
      ),
    );
  }
  writeFileSync(
    modulePath,
    targetIsDefinition
      ? runtime.replace(
          'from "./worker-blind-definition"',
          `from "./${definitionModuleName.slice(0, -3)}"`,
        )
      : runtime.replace(target, replacement),
  );
  if (targetIsDefinition) {
    writeFileSync(definitionModulePath, definitionRuntime.replace(target, replacement));
  }
  writeFileSync(
    testPath,
    test
      .replaceAll(
        'from "../src/runtime/worker-blind-benchmark"',
        `from "../src/runtime/${moduleName.slice(0, -3)}"`,
      )
      .replaceAll(
        'from "./helpers/worker-isolation-fixture"',
        `from "./helpers/${helperModuleName.slice(0, -3)}"`,
      ),
  );
  try {
    execFileSync(
      "npx",
      ["--no-install", "vitest", "run", testPath, "-t", oracle, "--reporter=dot"],
      { cwd: process.cwd(), stdio: "pipe", timeout: 30_000 },
    );
    return false;
  } catch (error) {
    const failure = error as { stdout?: Buffer; stderr?: Buffer };
    const output = `${failure.stdout?.toString() ?? ""}\n${failure.stderr?.toString() ?? ""}`;
    return output.includes(oracle) && /FAIL|AssertionError|TypeError/.test(output);
  } finally {
    unlinkSync(testPath);
    unlinkSync(modulePath);
    if (integration) unlinkSync(helperPath);
    if (targetIsDefinition) unlinkSync(definitionModulePath);
  }
}

function executeWorkerRiskAdmissionMutationOracle(
  target: string,
  replacement: string,
  oracle: string,
): boolean {
  const runtime = readFileSync("src/runtime/worker-risk-admission.ts", "utf8");
  // U-WRA-* は PLAN-RECOVERY-37 で専用 test file へ分離済み (issue #382)。
  const test = readFileSync("tests/worker-risk-admission.test.ts", "utf8");
  if (!runtime.includes(target)) return false;
  const id = randomUUID();
  const moduleName = `worker-risk-admission.mutant-${id}.ts`;
  const modulePath = `src/runtime/${moduleName}`;
  const testPath = `tests/worker-risk-admission.mutant-${id}.test.ts`;
  writeFileSync(modulePath, runtime.replace(target, replacement));
  writeFileSync(
    testPath,
    test.replace(
      'from "../src/runtime/worker-risk-admission"',
      `from "../src/runtime/${moduleName.slice(0, -3)}"`,
    ),
  );
  try {
    execFileSync(
      "npx",
      ["--no-install", "vitest", "run", testPath, "-t", oracle, "--reporter=dot"],
      { cwd: process.cwd(), stdio: "pipe", timeout: 30_000 },
    );
    return false;
  } catch (error) {
    const failure = error as { stdout?: Buffer; stderr?: Buffer };
    const output = `${failure.stdout?.toString() ?? ""}\n${failure.stderr?.toString() ?? ""}`;
    return output.includes(oracle) && /FAIL|AssertionError|TypeError/.test(output);
  } finally {
    unlinkSync(testPath);
    unlinkSync(modulePath);
  }
}

describe("design reality binding", () => {
  it("U-DRB-020: add-design Reality Binding対象をL4/L5へ限定しL6を誤拒否しない", () => {
    expect(
      ["docs/design/helix/L4-basic-design/a.md", "docs/design/helix/L5-detail/a.md"].every(
        isHelixDesignRealityTarget,
      ),
    ).toBe(true);
    expect(isHelixDesignRealityTarget("docs/design/helix/L6-function-design/a.md")).toBe(false);
    expect(isHelixDesignRealityTarget("docs/design/helix/L3-requirements/a.md")).toBe(false);
    expect(isHelixDesignRealityTarget("docs/test-design/helix/L6-a.md")).toBe(false);
    expect(isDesignRealityPlanLayer("L4")).toBe(true);
    expect(isDesignRealityPlanLayer("L5")).toBe(true);
    expect(isDesignRealityPlanLayer("L6")).toBe(false);

    expect(
      classifyAddDesignRealityTargets("L6", [
        { artifact_path: "docs/design/helix/L4-basic-design/unbound.md" },
      ]),
    ).toEqual({
      generatedDesigns: ["docs/design/helix/L4-basic-design/unbound.md"],
      targetRequired: false,
    });
    expect(classifyAddDesignRealityTargets("L6", [])).toEqual({
      generatedDesigns: [],
      targetRequired: false,
    });

    const root = fixtureRoot();
    try {
      const designPath = "docs/design/helix/L4-basic-design/unbound.md";
      const planPath = "docs/plans/PLAN-L6-999-reality-routing.md";
      writeFileSync(join(root, designPath), "# markerなし\n");
      writeFileSync(
        join(root, planPath),
        `---\nplan_id: PLAN-L6-999-reality-routing\nkind: add-design\nlayer: L6\nstatus: confirmed\ngenerates:\n  - artifact_path: ${designPath}\n---\n`,
      );
      expect(
        analyzeDesignRealityBinding(root, undefined, {
          changedPaths: new Set([planPath]),
        }).findings,
      ).toEqual([
        expect.objectContaining({
          file: planPath,
          reason: "add_design_reality_binding_missing",
          detail: designPath,
        }),
      ]);

      writeFileSync(
        join(root, planPath),
        "---\nplan_id: PLAN-L6-999-reality-routing\nkind: add-design\nlayer: L6\nstatus: confirmed\ngenerates: []\n---\n",
      );
      expect(
        analyzeDesignRealityBinding(root, undefined, {
          changedPaths: new Set([planPath]),
        }).findings,
      ).toEqual([]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("U-DRB-001: exact HEADの実在exportとdigestをgreenにする", () => {
    const { root, binding } = validFixture();
    const file = "docs/design/helix/L4-basic-design/reality.md";
    writeFileSync(join(root, file), design(binding));
    expect(analyzeDesignRealityBinding(root, [file])).toMatchObject({ ok: true, checked: 1 });
  });

  it("U-DRB-002: 存在しないPythonWorkerRegistryを名称類似で代替せず拒否する", () => {
    const { root, binding } = validFixture();
    const assets = binding.assets as Record<string, unknown>[];
    assets[0] = { ...assets[0], resource_name: "PythonWorkerRegistry" };
    const file = "docs/design/helix/L4-basic-design/reality.md";
    writeFileSync(join(root, file), design(binding));
    expect(analyzeDesignRealityBinding(root, [file]).findings).toContainEqual(
      expect.objectContaining({ reason: "missing_runtime_symbol" }),
    );
  });

  it("U-DRB-003: planned資産のexisting昇格とcompatibilityのauthority昇格をfail-closeする", () => {
    const { root, binding } = validFixture();
    binding.assets = [
      {
        asset_id: "future",
        classification: "planned_new",
        behavior_contract_id: "DRB-002",
        responsibility_owner: "future-owner",
        planned_artifact: "src/runtime/future.ts",
        downstream_plan: "docs/plans/PLAN-L7-999-future.md",
        current_runtime: true,
      },
      {
        asset_id: "legacy",
        classification: "compatibility_only",
        artifact_path: "docs/archive/legacy.md",
        reason: "migration only",
        read_only: true,
        current_authority: true,
      },
    ];
    const file = "docs/design/helix/L4-basic-design/reality.md";
    writeFileSync(join(root, file), design(binding));
    expect(analyzeDesignRealityBinding(root, [file]).findings.map((item) => item.reason)).toEqual([
      "invalid_planned_new",
      "invalid_compatibility_only",
    ]);
  });

  it("U-DRB-004: capabilityをidentity keyへ混ぜた到達不能設計を拒否する", () => {
    const unreachable = witness(["agent_id", "contract_version", "capability_class"]);
    expect(evaluateFailureWitness(unreachable)).toBe("WORKER_DESCRIPTOR_NOT_FOUND");
    const { root, binding } = validFixture();
    binding.failure_reachability = [unreachable];
    const file = "docs/design/helix/L4-basic-design/reality.md";
    writeFileSync(join(root, file), design(binding));
    expect(analyzeDesignRealityBinding(root, [file]).findings).toContainEqual(
      expect.objectContaining({ reason: "implementation_identity_mismatch" }),
    );
  });

  it("U-DRB-005: identity解決後のcapability別検証とmutation Redを要求する", () => {
    const reachable = witness();
    expect(evaluateFailureWitness(reachable)).toBe("WORKER_DESCRIPTOR_CAPABILITY_MISMATCH");
    expect(evaluateFailureWitness(reachable, true)).toBe("OK");
  });

  it("U-DRB-006: 文言確認だけのoracleをreachability証拠にしない", () => {
    const { root, binding } = validFixture();
    writeFileSync(
      join(root, "tests/runtime.test.ts"),
      `import { expect, it } from "vitest";\nimport { resolveWorkerDescriptor } from "../src/runtime/worker";\nit("U-WDA-004: prose", () => { expect(resolveWorkerDescriptor).toContain("WORKER_DESCRIPTOR_CAPABILITY_MISMATCH"); });\n`,
    );
    const file = "docs/design/helix/L4-basic-design/reality.md";
    writeFileSync(join(root, file), design(binding));
    expect(analyzeDesignRealityBinding(root, [file]).findings).toContainEqual(
      expect.objectContaining({ reason: "prose_only_reachability" }),
    );
  });

  it("U-DRB-007: PLAN lintとdoctorが同じhard gateを共有する", () => {
    const { root, binding } = validFixture();
    const file = "docs/design/helix/L4-basic-design/reality.md";
    writeFileSync(join(root, file), design(binding));
    expect(lintPlanGate({ gate: "design-reality-binding", repoRoot: root }).ok).toBe(true);
    expect(checkDesignRealityBinding(root).ok).toBe(true);
    (binding.assets as Record<string, unknown>[])[0].source_digest = `sha256:${"0".repeat(64)}`;
    writeFileSync(join(root, file), design(binding));
    expect(lintPlanGate({ gate: "design-reality-binding", repoRoot: root }).ok).toBe(false);
    expect(checkDesignRealityBinding(root).ok).toBe(false);
  });

  it("U-DRB-008: plannedのstale分類とarchiveのcurrent昇格を拒否する", () => {
    const { root, binding } = validFixture();
    mkdirSync(join(root, "docs/archive"), { recursive: true });
    const legacy = "export function legacyResolver(): void {}\n";
    writeFileSync(join(root, "docs/archive/legacy.ts"), legacy);
    writeFileSync(join(root, "src/runtime/future.ts"), "export const future = true;\n");
    writeFileSync(
      join(root, "docs/plans/PLAN-L7-999-future.md"),
      "---\nbehavior_contract_id: DRB-002\nresponsibility_owner: future-owner\ngenerates:\n  - artifact_path: src/runtime/future.ts\n    artifact_type: source_module\n---\n",
    );
    binding.assets = [
      {
        asset_id: "future",
        classification: "planned_new",
        behavior_contract_id: "DRB-002",
        responsibility_owner: "future-owner",
        planned_artifact: "src/runtime/future.ts",
        downstream_plan: "docs/plans/PLAN-L7-999-future.md",
        current_runtime: false,
      },
      {
        asset_id: "legacy",
        classification: "existing_runtime",
        artifact_path: "docs/archive/legacy.ts",
        resource_kind: "typescript_export",
        resource_name: "legacyResolver",
        source_digest: sha256Digest(legacy),
        current_authority: true,
      },
    ];
    const file = "docs/design/helix/L4-basic-design/reality.md";
    writeFileSync(join(root, file), design(binding));
    expect(analyzeDesignRealityBinding(root, [file]).findings.map((item) => item.reason)).toEqual([
      "planned_asset_already_exists",
      "non_current_runtime_authority",
    ]);
  });

  it("U-DRB-009: 未使用symbol名とhardcoded reason assertionを実行証拠にしない", () => {
    const { root, binding } = validFixture();
    writeFileSync(
      join(root, "tests/runtime.test.ts"),
      `import { expect, it } from "vitest";\nconst resolveWorkerDescriptor = "unused";\nit("U-WDA-004: forged", () => { expect("WORKER_DESCRIPTOR_CAPABILITY_MISMATCH").toBe("WORKER_DESCRIPTOR_CAPABILITY_MISMATCH"); });\n`,
    );
    const file = "docs/design/helix/L4-basic-design/reality.md";
    writeFileSync(join(root, file), design(binding));
    expect(analyzeDesignRealityBinding(root, [file]).findings).toContainEqual(
      expect.objectContaining({ reason: "prose_only_reachability" }),
    );
  });

  it("U-DRB-010: declared failure exact setの未witnessと重複を拒否する", () => {
    const { root, binding } = validFixture();
    binding.declared_failure_codes = [
      "WORKER_DESCRIPTOR_CAPABILITY_MISMATCH",
      "WORKER_DESCRIPTOR_NOT_FOUND",
    ];
    const file = "docs/design/helix/L4-basic-design/reality.md";
    writeFileSync(join(root, file), design(binding));
    expect(analyzeDesignRealityBinding(root, [file]).findings).toContainEqual(
      expect.objectContaining({ reason: "failure_code_coverage_mismatch" }),
    );
  });

  it("U-DRB-011: 実runtimeの6 failure mutantを対応oracleがRedにする", () => {
    expect(
      executeRuntimeMutationOracle("if (!parsed.success) return", "if (false) return", "U-WDA-002"),
    ).toBe(true);
    expect(
      executeRuntimeMutationOracle("if (identityMatches.length === 0)", "if (false)", "U-WDA-004"),
    ).toBe(true);
    expect(
      executeRuntimeMutationOracle("if (identityMatches.length > 1)", "if (false)", "U-WDA-005"),
    ).toBe(true);
    expect(
      executeRuntimeMutationOracle('if (match.status !== "active")', "if (false)", "U-WDA-005"),
    ).toBe(true);
    expect(
      executeRuntimeMutationOracle(
        "if (match.descriptor.capability_class !== request.capability_class)",
        "if (false)",
        "U-WDA-004",
      ),
    ).toBe(true);
    expect(
      executeRuntimeMutationOracle(
        "const digestFailures = validateDescriptor(parsed.data);",
        "const digestFailures: WorkerDescriptorFailureCode[] = [];",
        "U-WDA-003",
      ),
    ).toBe(true);
  }, 120_000);

  it("U-DRB-012: runtimeCommand factoryのliteral CLI登録を実在commandとして解決する", () => {
    const root = fixtureRoot();
    const cli = `const program = { command: (name: string) => name };
function runtimeCommand(provider: "claude" | "codex") { return program.command(provider); }
runtimeCommand("codex");
runtimeCommand("claude");
`;
    writeFileSync(join(root, "src/cli.ts"), cli);
    const file = "docs/design/helix/L4-basic-design/worker-blind-benchmark.md";
    const emptyBaseline = emptyFailureBindingBaseline([file]);
    const base = {
      classification: "existing_runtime",
      artifact_path: "src/cli.ts",
      resource_kind: "cli_command",
      source_digest: sha256Digest(cli),
      current_authority: true,
    };
    writeFileSync(
      join(root, file),
      design({
        schema_version: "helix-design-reality-binding.v1",
        declared_failure_codes: [],
        assets: [
          { ...base, asset_id: "codex-wrapper", resource_name: "codex" },
          { ...base, asset_id: "claude-wrapper", resource_name: "claude" },
        ],
        failure_reachability: [],
      }),
    );
    expect(
      analyzeDesignRealityBinding(root, [file], {
        emptyFailureBindingBaseline: emptyBaseline,
      }),
    ).toMatchObject({ ok: true, checked: 1 });
    const missing = readFileSync(join(root, file), "utf8").replace(
      '"resource_name": "claude"',
      '"resource_name": "kimi"',
    );
    writeFileSync(join(root, file), missing);
    expect(
      analyzeDesignRealityBinding(root, [file], {
        emptyFailureBindingBaseline: emptyBaseline,
      }).findings,
    ).toContainEqual(expect.objectContaining({ reason: "missing_cli_command" }));
  });

  it("U-DRB-025: failure bindingを空へ変異させると新規負債としてRedになる", () => {
    const { root, binding } = validFixture();
    try {
      const file = "docs/design/helix/L4-basic-design/reality.md";
      const baseline = emptyFailureBindingBaseline([]);
      writeFileSync(join(root, file), design(binding));
      expect(
        analyzeDesignRealityBinding(root, [file], { emptyFailureBindingBaseline: baseline }).ok,
      ).toBe(true);

      binding.declared_failure_codes = [];
      binding.failure_reachability = [];
      writeFileSync(join(root, file), design(binding));
      const mutated = analyzeDesignRealityBinding(root, [file], {
        emptyFailureBindingBaseline: baseline,
      });
      expect(mutated.ok).toBe(false);
      expect(mutated.findings).toContainEqual(
        expect.objectContaining({ reason: "empty_failure_binding_not_in_baseline", file }),
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("U-DRB-026: 既知baselineと本文のfailure節をdoctor表示へ分離する", () => {
    const { root } = fixtureRootWithEmptyBinding();
    try {
      const file = "docs/design/helix/L5-detail/github-issue-native-graph-provider.md";
      const baseline = emptyFailureBindingBaseline([file]);
      const result = analyzeDesignRealityBinding(root, [file], {
        emptyFailureBindingBaseline: baseline,
      });
      expect(result).toMatchObject({
        ok: true,
        checked: 1,
        empty_failure_binding_count: 1,
        baseline_empty_failure_binding_count: 1,
        prose_failure_binding_gap_candidates: 1,
      });
      expect(result.advisories.map((item) => item.reason)).toEqual([
        "empty_failure_binding_baseline",
        "prose_failure_binding_gap_candidate",
      ]);
      expect(designRealityBindingMessages(result).join("\n")).toContain("empty=1, baseline=1");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("U-DRB-027: empty baselineの拡張をコード固定初期集合の外として拒否する", () => {
    const { root, binding } = validFixture();
    try {
      const file = "docs/design/helix/L4-basic-design/reality.md";
      writeFileSync(join(root, file), design(binding));
      const result = analyzeDesignRealityBinding(root, [file], {
        emptyFailureBindingBaseline: emptyFailureBindingBaseline([file]),
      });
      expect(result.ok).toBe(false);
      expect(result.findings).toContainEqual(
        expect.objectContaining({
          reason: "empty_failure_binding_baseline_expanded",
          detail: file,
        }),
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("U-DRB-028: current empty bindingは初期baseline件数と一致し、新規追加を許さない", () => {
    const result = analyzeDesignRealityBinding(process.cwd());
    expect(result.ok, designRealityBindingMessages(result).join("\n")).toBe(true);
    expect(result.empty_failure_binding_count).toBe(
      INITIAL_DESIGN_REALITY_EMPTY_FAILURE_BINDING_BASELINE.length,
    );
    expect(result.baseline_empty_failure_binding_count).toBe(
      INITIAL_DESIGN_REALITY_EMPTY_FAILURE_BINDING_BASELINE.length,
    );
    expect(result.findings).toEqual([]);
  });

  it("U-DRB-029: baseline外の空binding拒否分岐を除去するとこのoracleがRedになる", () => {
    expect(
      executeDesignRealityMutationOracle(
        "if (baselinePaths.has(file)) {",
        "if (true) {",
        "U-DRB-025",
      ),
    ).toBe(true);
  }, 120_000);

  it("U-DRB-013: wrapper admissionの4 failure mutantを対応oracleがRedにする", () => {
    expect(executeWrapperMutationOracle("if (!origin)", "if (false)", "U-WWA-002")).toBe(true);
    expect(
      executeWrapperMutationOracle(
        "if (origin.provider !== plan.provider)",
        "if (false)",
        "U-WWA-004",
      ),
    ).toBe(true);
    expect(
      executeWrapperMutationOracle(
        "witness.expected_adapter_plan_digest !== witness.actual_adapter_plan_digest",
        "false",
        "U-WWA-006",
      ),
    ).toBe(true);
    expect(
      executeWrapperMutationOracle(
        "witness.expected_invocation_digest !== witness.actual_invocation_digest",
        "false",
        "U-WWA-007",
      ),
    ).toBe(true);
  }, 120_000);

  it("U-DRB-014: isolation brokerの10 boundary mutantを対応oracleがRedにする", () => {
    expect(
      executeIsolationMutationOracle(
        'if ((request.platform ?? process.platform) !== "linux") {',
        "if (false) {",
        "U-WIB-003",
      ),
    ).toBe(true);
    expect(
      executeIsolationMutationOracle(
        "if (!isolationAuthorities.has(request.authority)) {",
        "if (false) {",
        "U-WIB-003",
      ),
    ).toBe(true);
    expect(
      executeIsolationMutationOracle(
        "if (!isWrapperLaunchExecution(request.wrapperLaunch)) {",
        "if (false) {",
        "U-WIB-004",
      ),
    ).toBe(true);
    expect(
      executeIsolationMutationOracle(
        "!isWorkerAdmissionCurrent(",
        "false && isWorkerAdmissionCurrent(",
        "U-WIB-008",
      ),
    ).toBe(true);
    expect(
      executeIsolationMutationOracle(
        "if (isWithin(repoRoot, scratchBase) || isWithin(scratchBase, repoRoot)) {",
        "if (false) {",
        "U-WIB-001",
      ),
    ).toBe(true);
    expect(
      executeIsolationMutationOracle(
        'if (!runtimeBytes) return failure("WORKER_ISOLATION_RUNTIME_INVALID");',
        'if (false) return failure("WORKER_ISOLATION_RUNTIME_INVALID");',
        "U-WIB-003",
      ),
    ).toBe(true);
    expect(
      executeIsolationMutationOracle(
        'if (!captured) return failure("WORKER_ISOLATION_SOURCE_REJECTED");',
        "if (!captured) continue;",
        "U-WIB-002",
      ),
    ).toBe(true);
    expect(
      executeIsolationMutationOracle(
        "if (!sealedLaunches.has(launch)) {",
        "if (false) {",
        "U-WIB-006",
      ),
    ).toBe(true);
    expect(
      executeIsolationMutationOracle(
        "!isWorkerIsolationPolicyCapability(request.policy) ||",
        "false ||",
        "U-WIB-010",
      ),
    ).toBe(true);
    expect(executeIsolationMutationOracle('    "--unshare-net",\n', "", "U-WIB-010")).toBe(true);
  }, 120_000);

  it("U-DRB-015: isolation policyの7 boundary mutantを対応oracleがRedにする", () => {
    expect(
      executeIsolationPolicyMutationOracle(
        "if (!isWrapperLaunchExecution(request.wrapperLaunch)) {",
        "if (false) {",
        "U-WIP-003",
      ),
    ).toBe(true);
    expect(
      executeIsolationPolicyMutationOracle(
        'request.task_sensitivity !== "non_secret" ||',
        "false ||",
        "U-WIP-002",
      ),
    ).toBe(true);
    expect(
      executeIsolationPolicyMutationOracle(
        "if (request.allowed_egress_hosts.length > 0) {",
        "if (false) {",
        "U-WIP-003",
      ),
    ).toBe(true);
    expect(
      executeIsolationPolicyMutationOracle(
        'if (!normalized) return policyFailure("WORKER_ISOLATION_SCOPE_INVALID");',
        'if (false) return policyFailure("WORKER_ISOLATION_SCOPE_INVALID");',
        "U-WIP-004",
      ),
    ).toBe(true);
    expect(
      executeIsolationPolicyMutationOracle(
        "if (changedPaths.some((path) => !pathIsWritable(path, writablePaths))) {",
        "if (false) {",
        "U-WIP-006",
      ),
    ).toBe(true);
    expect(
      executeIsolationPolicyMutationOracle(
        "if (entryCount > MAX_SCOPE_ENTRY_COUNT) return false;",
        "if (false) return false;",
        "U-WIP-007",
      ),
    ).toBe(true);
    expect(
      executeIsolationPolicyMutationOracle(
        "if (depth > MAX_SCOPE_DEPTH) return false;",
        "if (false) return false;",
        "U-WIP-007",
      ),
    ).toBe(true);
  }, 120_000);

  it("U-DRB-016: output admissionの10 boundary mutantを対応oracleがRedにする", () => {
    expect(
      executeWorkerOutputMutationOracle(
        'const schema = knownOutputSchemas.get(binding.output_schema_digest);\n  if (!schema || schemaDigest(schema) !== binding.output_schema_digest)\n    return failure("WORKER_OUTPUT_SCHEMA_UNRESOLVED");',
        'const schema = proposalSchema;\n  if (false) return failure("WORKER_OUTPUT_SCHEMA_UNRESOLVED");',
        "U-WOA-004",
      ),
    ).toBe(true);
    expect(
      executeWorkerOutputMutationOracle(
        "bytes.byteLength === 0 || bytes.byteLength > MAX_OUTPUT_BYTES",
        "false",
        "U-WOA-005",
      ),
    ).toBe(true);
    expect(
      executeWorkerOutputMutationOracle(
        'new TextDecoder("utf-8", { fatal: true })',
        'new TextDecoder("utf-8", { fatal: false })',
        "U-WOA-005",
      ),
    ).toBe(true);
    expect(
      executeWorkerOutputMutationOracle(
        "bytes.byteLength >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf",
        "false",
        "U-WOA-005",
      ),
    ).toBe(true);
    expect(
      executeWorkerOutputMutationOracle(
        "if (!boundedLexicalJson(text))",
        "if (false)",
        "U-WOA-006",
      ),
    ).toBe(true);
    expect(
      executeWorkerOutputMutationOracle(
        "if (canonicalJson(parsed) !== text)",
        "if (false)",
        "U-WOA-005",
      ),
    ).toBe(true);
    expect(
      executeWorkerOutputMutationOracle(
        "if (!validateValue(schema.envelope_ast, parsed))",
        "if (false)",
        "U-WOA-003",
      ),
    ).toBe(true);
    expect(
      executeWorkerOutputMutationOracle(
        "parsed.descriptor_digest !== binding.descriptor_digest ||",
        "false ||",
        "U-WOA-004",
      ),
    ).toBe(true);
    expect(
      executeWorkerOutputMutationOracle(
        "parsed.payload_digest !== payloadDigest",
        "false",
        "U-WOA-004",
      ),
    ).toBe(true);
    expect(
      executeWorkerOutputMutationOracle("validatedOutputs.add(output);", "", "U-WOA-002"),
    ).toBe(true);
  }, 120_000);

  it("U-DRB-017: broker output ingressの3 mandatory mutantを対応oracleがRedにする", () => {
    expect(
      executeIsolationMutationOracle(
        "!hasWorkerOutputContract(request.wrapperLaunch.stdin, {",
        "false && hasWorkerOutputContract(request.wrapperLaunch.stdin, {",
        "U-WIB-011",
      ),
    ).toBe(true);
    expect(
      executeIsolationMutationOracle("if (result.status !== 0) {", "if (false) {", "U-WIB-012"),
    ).toBe(true);
    expect(
      executeIsolationMutationOracle('encoding: "buffer",', 'encoding: "utf8",', "U-WIB-010"),
    ).toBe(true);
    expect(
      executeIsolationMutationOracle(
        "output: admittedOutput.output,",
        'output: admittedOutput.output, stdout: String(result.stdout ?? ""),',
        "U-WIB-010",
      ),
    ).toBe(true);
    expect(
      executeIsolationMutationOracle(
        "if (!admittedOutput.ok) {",
        "if (false && !admittedOutput.ok) {",
        "U-WIB-011",
      ),
    ).toBe(true);
  }, 120_000);

  it("U-DRB-018: independent reviewのseal、digest join、三軸分離mutantをRedにする", () => {
    expect(
      executeWorkerReviewMutationOracle(
        'if (!proposalDigest) return { ok: false, failure_code: "WORKER_REVIEW_PROPOSAL_UNSEALED" };',
        'if (false) return { ok: false, failure_code: "WORKER_REVIEW_PROPOSAL_UNSEALED" };',
        "U-WRR-002",
      ),
    ).toBe(true);
    expect(
      executeWorkerReviewMutationOracle(
        "if (!isWorkerValidatedOutput(reviewerOutput))",
        "if (false)",
        "U-WRR-009",
      ),
    ).toBe(true);
    expect(
      executeWorkerReviewMutationOracle(
        "if (!isRecord(input) || !exactKeys(input, RECEIPT_KEYS))",
        "if (false)",
        "U-WRR-003",
      ),
    ).toBe(true);
    expect(
      executeWorkerReviewMutationOracle(
        "if (input.finding_digest !== reviewerOutput.payload_digest)",
        "if (false)",
        "U-WRR-009",
      ),
    ).toBe(true);
    expect(
      executeWorkerReviewMutationOracle(
        "if (input.proposal_digest !== proposalDigest)",
        "if (false)",
        "U-WRR-002",
      ),
    ).toBe(true);
    expect(
      executeWorkerReviewMutationOracle(
        "if (!workerOrigin || !reviewerOrigin)",
        "if (false)",
        "U-WRR-008",
      ),
    ).toBe(true);
    expect(
      executeWorkerReviewMutationOracle(
        "if (worker.identity === reviewer.identity)",
        "if (false)",
        "U-WRR-004",
      ),
    ).toBe(true);
    expect(
      executeWorkerReviewMutationOracle(
        "if (worker.session === reviewer.session)",
        "if (false)",
        "U-WRR-006",
      ),
    ).toBe(true);
    expect(
      executeWorkerReviewMutationOracle(
        "if (worker.context_digest === reviewer.context_digest)",
        "if (false)",
        "U-WRR-007",
      ),
    ).toBe(true);
  }, 120_000);

  it("U-DRB-019: worker contextのHEAD・scope・budget・payload分岐mutantをRedにする", () => {
    expect(
      executeWorkerContextMutationOracle(
        "if (request.current_head !== actualHead)",
        "if (false)",
        "U-WCP-002",
      ),
    ).toBe(true);
    expect(
      executeWorkerContextMutationOracle(
        "request.authority_paths.some((path) => isCompatibilityPath(path))",
        "false",
        "U-WCP-002",
      ),
    ).toBe(true);
    expect(executeWorkerContextMutationOracle("if (!authorities)", "if (false)", "U-WCP-006")).toBe(
      true,
    );
    expect(executeWorkerContextMutationOracle("if (!rules)", "if (false)", "U-WCP-007")).toBe(true);
    expect(
      executeWorkerContextMutationOracle(
        "if (!validAxes(request.boundary))",
        "if (false)",
        "U-WCP-009",
      ),
    ).toBe(true);
    expect(
      executeWorkerContextMutationOracle(
        "if (!validScope(request.boundary))",
        "if (false)",
        "U-WCP-003",
      ),
    ).toBe(true);
    expect(
      executeWorkerContextMutationOracle(
        "!isSha(request.boundary.severity_policy_digest) ||",
        "false ||",
        "U-WCP-008",
      ),
    ).toBe(true);
    expect(
      executeWorkerContextMutationOracle(
        "seal.packet.required_output_schema !== input.required_output_schema",
        "false",
        "U-WCP-005",
      ),
    ).toBe(true);
    expect(
      executeWorkerContextMutationOracle(
        "seal.packet.role_judgment_digest !== sha256Digest(roleJudgmentBrief(input.role))",
        "false",
        "U-WCP-004",
      ),
    ).toBe(true);
    expect(
      executeWorkerContextMutationOracle(
        "seal.packet.task_lens_digest !== sha256Digest(taskLensBrief(input.task))",
        "false",
        "U-WCP-004",
      ),
    ).toBe(true);
    expect(
      executeWorkerContextMutationOracle(
        "if (!validBudget(request.boundary))",
        "if (false)",
        "U-WCP-003",
      ),
    ).toBe(true);
    expect(
      executeWorkerContextMutationOracle(
        "if (seal.envelope_digest !== sha256Digest(envelope))",
        "if (false)",
        "U-WCP-004",
      ),
    ).toBe(true);
    expect(
      executeWorkerContextMutationOracle(
        'if (!seal) return failure("WORKER_CONTEXT_UNSEALED");',
        "if (!seal) return { ok: true, packet: {} as never };",
        "U-WCP-005",
      ),
    ).toBe(true);
  }, 120_000);

  it("U-DRB-021: blind benchmarkのseal/provenance/judge/rubric分岐除去をRedにする", () => {
    expect(
      executeWorkerBlindBenchmarkMutationOracle(
        "if (!validDefinition(input))",
        "if (false)",
        "U-WBB-002",
      ),
    ).toBe(true);
    expect(
      executeWorkerBlindBenchmarkMutationOracle(
        'if (!definition) return failure("WORKER_BLIND_DEFINITION_UNSEALED");',
        'if (!definition) return failure("WORKER_BLIND_PACKET_INVALID");',
        "U-WBB-002",
      ),
    ).toBe(true);
    expect(
      executeWorkerBlindBenchmarkMutationOracle(
        'if (!isSafeId(candidate.candidate_id)) return failure("WORKER_BLIND_PACKET_INVALID");',
        'if (false) return failure("WORKER_BLIND_PACKET_INVALID");',
        "U-WBB-005",
      ),
    ).toBe(true);
    expect(
      executeWorkerBlindBenchmarkMutationOracle(
        'if (!packetSeal) return failure("WORKER_BLIND_PACKET_UNSEALED");',
        'if (false) return failure("WORKER_BLIND_PACKET_UNSEALED");',
        "U-WBB-005",
      ),
    ).toBe(true);
    expect(
      executeWorkerBlindBenchmarkMutationOracle(
        'if (!origin) return failure("WORKER_BLIND_EXECUTION_ORIGIN_UNSEALED");',
        "if (!origin) return { ok: true, capability: {} as never, packet: {} as never };",
        "U-WBB-005",
      ),
    ).toBe(true);
    expect(
      executeWorkerBlindBenchmarkMutationOracle(
        "if (!resolveWorkerBenchmarkExecution(candidate.output, candidate.execution)) {",
        "if (false) {",
        "U-WBB-005",
      ),
    ).toBe(true);
    expect(
      executeWorkerBlindBenchmarkMutationOracle(
        "if (!resolveWorkerBlindJudgeContext(evaluation.judge_output, evaluation.judge_context)) {",
        "if (false) {",
        "U-WBB-005",
      ),
    ).toBe(true);
    expect(
      executeWorkerBlindBenchmarkMutationOracle(
        'if (!observation) return failure("WORKER_BLIND_OBSERVATION_UNSEALED");',
        'if (!observation) return failure("WORKER_BLIND_PACKET_INVALID");',
        "U-WBB-005",
      ),
    ).toBe(true);
    expect(
      executeWorkerBlindBenchmarkMutationOracle(
        'if (input.admission_level === "smoke")',
        "if (false)",
        "U-WBB-002",
      ),
    ).toBe(true);
    expect(
      executeWorkerBlindBenchmarkMutationOracle(
        "if (candidateProvenance.has(provenance))",
        "if (false && candidateProvenance.has(provenance))",
        "U-WBB-005",
      ),
    ).toBe(true);
    expect(
      executeWorkerBlindBenchmarkMutationOracle(
        'if (!payload) return failure("WORKER_BLIND_EVALUATION_UNSEALED");',
        "if (!payload) return { ok: true, receipt: {} as never };",
        "U-WBB-005",
      ),
    ).toBe(true);
    expect(
      executeWorkerBlindBenchmarkMutationOracle(
        'if (!scored) return failure("WORKER_BLIND_SCORE_INVALID");',
        'if (false) return failure("WORKER_BLIND_SCORE_INVALID");',
        "U-WBB-005",
      ),
    ).toBe(true);
  }, 120_000);

  it("U-DRB-022: risk admissionのcritical/seal/effort分岐除去をRedにする", () => {
    expect(
      executeWorkerRiskAdmissionMutationOracle(
        "!hasExactKeys(input, [",
        "false && !hasExactKeys(input, [",
        "U-WRA-002",
      ),
    ).toBe(true);
    expect(
      executeWorkerRiskAdmissionMutationOracle(
        "const reasons = findings.map((finding) => criticalReason(finding.failure_class));",
        "const reasons: WorkerRiskAdmissionReasonCode[] = [];",
        "U-WRA-001",
      ),
    ).toBe(true);
    expect(
      executeWorkerRiskAdmissionMutationOracle(
        'if (!risk) return failure("WORKER_RISK_ADMISSION_RECEIPT_UNSEALED");',
        'if (false) return failure("WORKER_RISK_ADMISSION_RECEIPT_UNSEALED");',
        "U-WRA-003",
      ),
    ).toBe(true);
    expect(
      executeWorkerRiskAdmissionMutationOracle(
        'if (receiptsByRisk.has(risk)) return failure("WORKER_RISK_ADMISSION_RISK_DUPLICATE");',
        'if (false) return failure("WORKER_RISK_ADMISSION_RISK_DUPLICATE");',
        "U-WRA-003",
      ),
    ).toBe(true);
    expect(
      executeWorkerRiskAdmissionMutationOracle(
        "policy.fixed_effort !== null &&",
        "false && policy.fixed_effort !== null &&",
        "U-WRA-004",
      ),
    ).toBe(true);
  }, 90_000);

  // PLAN-L7-506-worker-lifecycle-receipt
  it("U-DRB-023: lifecycleのseal、proposal join、terminal、hash-chain分岐mutantをRedにする", () => {
    expect(
      executeWorkerLifecycleMutationOracle(
        'runId <= (request.child_run_ids[index - 1] ?? "")',
        "false",
        "U-WLIFE-003",
      ),
    ).toBe(true);
    expect(
      executeWorkerLifecycleMutationOracle(
        'if (!runReceipt) return { ok: false, failure_code: "WORKER_LIFECYCLE_RUN_RECEIPT_UNSEALED" };',
        'if (false) return { ok: false, failure_code: "WORKER_LIFECYCLE_RUN_RECEIPT_UNSEALED" };',
        "U-WLIFE-002",
      ),
    ).toBe(true);
    expect(
      executeWorkerLifecycleMutationOracle(
        "if (!isWorkerIndependentReview(request.review))",
        "if (false)",
        "U-WLIFE-002",
      ),
    ).toBe(true);
    expect(
      executeWorkerLifecycleMutationOracle(
        "if (!proposalDigest || request.review.proposal_digest !== proposalDigest)",
        "if (false)",
        "U-WLIFE-002",
      ),
    ).toBe(true);
    expect(
      executeWorkerLifecycleMutationOracle(
        '(request.review.verdict === "reject" && request.terminal_state === "accepted") ||',
        "false ||",
        "U-WLIFE-003",
      ),
    ).toBe(true);
    expect(
      executeWorkerLifecycleMutationOracle(
        "const previous = events.at(-1)?.event_digest ?? null;",
        "const previous = null;",
        "U-WLIFE-001",
      ),
    ).toBe(true);
    expect(
      executeWorkerLifecycleMutationOracle(
        "event.evidence_digest !== expectedEvidence[index]",
        "false",
        "U-WLIFE-001",
      ),
    ).toBe(true);
    expect(
      executeWorkerLifecycleMutationOracle(
        "return receiptDigest === sha256Digest(canonicalJson(payload));",
        "return true || receiptDigest === sha256Digest(canonicalJson(payload));",
        "U-WLIFE-001",
      ),
    ).toBe(true);
  }, 90_000);

  it("U-DRB-024: GitHub cross-review admissionのfailure分岐mutantをRedにする", () => {
    expect(
      executeGitHubCrossReviewMutationOracle(
        'if (input.state !== "OPEN") {',
        "if (false) {",
        "U-GCRA-004",
      ),
    ).toBe(true);
    expect(
      executeGitHubCrossReviewMutationOracle(
        "if (candidates.length === 0) {",
        "if (false) {",
        "U-GCRA-002",
      ),
    ).toBe(true);
    expect(
      executeGitHubCrossReviewMutationOracle(
        "if (valid.length !== 1) {",
        "if (false) {",
        "U-GCRA-003",
      ),
    ).toBe(true);
    expect(
      executeGitHubCrossReviewMutationOracle(
        "if (valid.length !== 1) {",
        "if (false) {",
        "U-GCRA-004",
      ),
    ).toBe(true);
    expect(
      executeGitHubCrossReviewMutationOracle(
        "    if (!complete) {",
        "    if (false) {",
        "U-GCRA-011",
      ),
    ).toBe(true);
    expect(
      executeGitHubCrossReviewMutationOracle(
        'if (input.pr_state !== "MERGED") reasons.push("merge_not_observed");',
        'if (false) reasons.push("merge_not_observed");',
        "U-GCRA-005",
      ),
    ).toBe(true);
    expect(
      executeGitHubCrossReviewMutationOracle(
        'reasons.push("merge_commit_mismatch");',
        "void 0;",
        "U-GCRA-005",
      ),
    ).toBe(true);
    expect(
      executeGitHubCrossReviewMutationOracle(
        'reasons.push("reviewed_head_not_merge_parent");',
        "void 0;",
        "U-GCRA-005",
      ),
    ).toBe(true);
    expect(
      executeGitHubCrossReviewMutationOracle(
        'reasons.push("reviewed_tree_not_merged_tree");',
        "void 0;",
        "U-GCRA-005",
      ),
    ).toBe(true);
    expect(
      executeGitHubCrossReviewMutationOracle(
        'if (!Number.isFinite(Date.parse(input.observed_at))) reasons.push("observed_at_invalid");',
        'if (false) reasons.push("observed_at_invalid");',
        "U-GCRA-005",
      ),
    ).toBe(true);
    expect(
      executeGitHubCrossReviewMutationOracle(
        'reasons.push("candidate_commit_read_after_failed");',
        "void 0;",
        "U-GCRA-005a",
      ),
    ).toBe(true);
    expect(
      executeGitHubCrossReviewMutationOracle(
        'reasons.push("candidate_commit_mismatch");',
        "void 0;",
        "U-GCRA-005",
      ),
    ).toBe(true);
    for (const target of [
      ["`repos/", "$", "{repository}/git/commits/", "$", "{current.headRefOid}`"].join(""),
      ["`repos/", "$", "{repository}/git/commits/", "$", "{mergeCommit}`"].join(""),
      "evaluateReviewedMergeReadAfter({",
      "persistReviewedMergeReadAfterReceipt(",
      'merged.status === 0 || parsed?.state === "MERGED"',
      "mergeResult.readAfterReceiptPath !== null",
    ]) {
      expect(executeGitHubCrossReviewAdapterMutationOracle(target, "MUTATED_ADAPTER_PATH")).toBe(
        true,
      );
    }
  }, 60_000);
});
