import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { checkDesignRealityBinding } from "../src/doctor/index";
import {
  analyzeDesignRealityBinding,
  evaluateFailureWitness,
  type FailureReachabilityWitness,
} from "../src/lint/design-reality-binding";
import { lintPlanGate } from "../src/plan/lint";
import { sha256Digest } from "../src/runtime/digest";

// PLAN-L7-500-worker-isolation-policy

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

function design(binding: unknown): string {
  return `---\ntitle: reality\nlayer: L4\nartifact_type: design\nstatus: confirmed\nupdated: 2026-08-03\n---\n\n<!-- HELIX:design-reality-binding:v1 -->\n\`\`\`json\n${JSON.stringify(binding, null, 2)}\n\`\`\`\n`;
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

describe("design reality binding", () => {
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
    const file = "docs/design/helix/L4-basic-design/reality.md";
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
    expect(analyzeDesignRealityBinding(root, [file])).toMatchObject({ ok: true, checked: 1 });
    const missing = readFileSync(join(root, file), "utf8").replace(
      '"resource_name": "claude"',
      '"resource_name": "kimi"',
    );
    writeFileSync(join(root, file), missing);
    expect(analyzeDesignRealityBinding(root, [file]).findings).toContainEqual(
      expect.objectContaining({ reason: "missing_cli_command" }),
    );
  });

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

  it("U-DRB-015: isolation policyの5 failure mutantを対応oracleがRedにする", () => {
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
  }, 120_000);
});
