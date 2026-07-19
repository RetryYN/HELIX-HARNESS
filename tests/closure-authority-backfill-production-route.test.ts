import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { ClosureAuthorityBackfillCandidate } from "../src/policy/closure-authority-backfill";
import { classifyHistoricalVpairMigration } from "../src/policy/historical-vpair-migration-authority";
import {
  CLOSURE_GATE_ALLOWLIST_PATH,
  loadRepoOwnedGateAllowlist,
  readVerifiedRepoFile,
} from "../src/state-db/closure-authority-backfill-loader";
import {
  buildCurrentClosureAuthorityBackfillRun,
  buildCurrentClosureAuthorityCandidate,
  type CurrentClosureAuthorityBackfillInput,
  decodeClosureAuthorityBackfillRun,
  loadCurrentClosureAuthorityBackfillInput,
  verifyTrackedHeadBlob,
} from "../src/state-db/closure-authority-backfill-production";
import { verifyClosureAuthorityBackfillProductionBundle } from "../src/state-db/closure-authority-backfill-verifier";
import {
  appendHistoricalAuthorityArtifact,
  loadHistoricalAuthority,
  loadHistoricalCandidatesFromAuthorityRun,
  sealHistoricalAuthorityGeneration,
} from "../src/state-db/historical-vpair-migration-authority";
import { openHarnessDb, openHarnessDbReadOnly } from "../src/state-db/index";
import { rebuildHarnessDb } from "../src/state-db/projection-writer";

const digest = (value: string | Buffer) =>
  `sha256:${createHash("sha256").update(value).digest("hex")}` as const;
const stable = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value !== null && typeof value === "object")
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => `${JSON.stringify(key)}:${stable(item)}`)
      .join(",")}}`;
  return JSON.stringify(value);
};
const HEAD = "a".repeat(40);
const cliPath = join(import.meta.dirname, "../src/cli.ts");

function productionFixture() {
  const root = mkdtempSync(join(tmpdir(), "closure-authority-route-"));
  const bare = mkdtempSync(join(tmpdir(), "closure-authority-origin-"));
  const planId = "PLAN-L7-990-route-e2e";
  const oracle = "U-ROUTE-001";
  const planPath = `docs/plans/${planId}.md`;
  const designPath = "docs/design/harness/L6-function-design/route-e2e.md";
  const testPath = "tests/route-e2e.test.ts";
  const l8Path = "docs/test-design/harness/L8-unit-test-design.md";
  for (const path of [
    planPath,
    designPath,
    testPath,
    l8Path,
    CLOSURE_GATE_ALLOWLIST_PATH,
    "docs/governance/closure-authority-registry.yaml",
  ])
    mkdirSync(join(root, path, ".."), { recursive: true });
  writeFileSync(join(root, ".gitignore"), ".helix/\n");
  writeFileSync(
    join(root, designPath),
    `---\nstatus: confirmed\nclosure_authority:\n  capabilities: [local_plan_status]\n  gates:\n    - { gate_id: g7, command_id: g7, command: "helix gate G7" }\n---\n${oracle}\n`,
  );
  writeFileSync(
    join(root, planPath),
    `---\nplan_id: ${planId}\ntitle: route e2e\nkind: impl\nlayer: L7\ndrive: agent\nstatus: confirmed\nparent_design: ${designPath}\npair_artifact: ${l8Path}\nverification_bindings:\n  - { oracle_id: ${oracle}, parent_design: ${designPath}, test_path: ${testPath} }\ngenerates:\n  - { artifact_path: ${planPath}, artifact_type: markdown_doc }\n  - { artifact_path: ${testPath}, artifact_type: test_code }\nreview_evidence:\n  - reviewer: reviewer-b\n    review_kind: cross_agent\n    reviewed_at: "2026-07-12T00:30:00.000Z"\n    tests_green_at: "2026-07-12T00:30:00.000Z"\n    verdict: approve\n    worker_model: worker-a\n    reviewer_model: reviewer-b\n    green_commands:\n      - { kind: unit_test, command: "npx --no-install vitest run ${testPath}", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-07-12T00:30:00.000Z", evidence_path: ${testPath}, output_digest: "${digest("green")}" }\n---\n`,
  );
  writeFileSync(join(root, testPath), `test("[${planId}/${oracle}] exact", () => {});\n`);
  writeFileSync(
    join(root, l8Path),
    `| U-ID | 対象 | 反例と期待結果 | test citation |\n| --- | --- | --- | --- |\n| ${oracle} | route | exact | \`${testPath}\` |\n`,
  );
  writeFileSync(
    join(root, "docs/governance/closure-authority-registry.yaml"),
    "schema_version: closure-authority-registry.v1\nauthorities: []\n",
  );
  writeFileSync(
    join(root, CLOSURE_GATE_ALLOWLIST_PATH),
    'schema_version: closure-gate-allowlist.v1\ngates:\n  g7: { command_id: g7, command: "helix gate G7" }\n',
  );
  execFileSync("git", ["init", "-q", "--bare", bare]);
  execFileSync("git", ["init", "-q", "-b", "main"], { cwd: root });
  execFileSync("git", ["config", "user.email", "fixture@example.invalid"], { cwd: root });
  execFileSync("git", ["config", "user.name", "fixture"], { cwd: root });
  execFileSync("git", ["add", "."], { cwd: root });
  execFileSync("git", ["commit", "-qm", "fixture"], { cwd: root });
  execFileSync("git", ["remote", "add", "origin", bare], { cwd: root });
  execFileSync("git", ["push", "-qu", "origin", "main"], { cwd: root });
  const head = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
  rebuildHarnessDb({ repoRoot: root });
  const db = openHarnessDb(join(root, ".helix/harness.db"), { repoRoot: root });
  const stdout = JSON.stringify({
    testResults: [
      { assertionResults: [{ fullName: `[${planId}/${oracle}] exact`, status: "passed" }] },
    ],
  });
  const key = digest("route-receipt");
  mkdirSync(join(root, ".helix/evidence/process-receipts"), { recursive: true });
  writeFileSync(join(root, `.helix/evidence/process-receipts/${key.slice(7)}.stdout`), stdout);
  writeFileSync(join(root, `.helix/evidence/process-receipts/${key.slice(7)}.stderr`), "");
  db.prepare(
    `INSERT INTO closure_process_receipts (process_receipt_key,schema_version,materialization_id,kind,repository_head,executable,argv_json,dedupe_key,exit_code,signal,timed_out,stdout_digest,stderr_digest,stdout_path,stderr_path,completed_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
  ).run(
    key,
    "closure-process-receipt.v1",
    "mat-route",
    "test",
    head,
    "npx",
    JSON.stringify(["--no-install", "vitest", "run", testPath, "--reporter=json"]),
    digest(
      `closure-command.v1\0${head}\0test\0npx\0--no-install\0vitest\0run\0${testPath}\0--reporter=json`,
    ),
    0,
    null,
    0,
    digest(stdout),
    digest(""),
    `.helix/evidence/process-receipts/${key.slice(7)}.stdout`,
    `.helix/evidence/process-receipts/${key.slice(7)}.stderr`,
    "2026-07-12T00:40:00.000Z",
  );
  db.close();
  return { root, bare, head, planId, planPath };
}

function runCli(root: string, head: string) {
  return spawnSync(
    "npx",
    [
      "--prefix",
      process.cwd(),
      "--no-install",
      "tsx",
      cliPath,
      "closure",
      "authority-backfill",
      "--dry-run",
      "--from-db",
      "--expected-head",
      head,
      "--json",
    ],
    {
      cwd: root,
      encoding: "utf8",
      env: { ...process.env, HELIX_SKIP_UPDATE_CHECK: "1", NODE_NO_WARNINGS: "1" },
    },
  );
}

function commitFixture(root: string, message: string): string {
  execFileSync("git", ["commit", "-qm", message], { cwd: root });
  execFileSync("git", ["push", "-q", "origin", "main"], { cwd: root });
  return execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
}

function state(root: string) {
  const dbPath = join(root, ".helix/harness.db");
  const db = openHarnessDb(dbPath, { repoRoot: root });
  const tables = db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
    )
    .all() as Array<{ name: string }>;
  const rows = Object.fromEntries(
    tables.map(({ name }) => [
      name,
      (db.prepare(`SELECT COUNT(*) AS n FROM "${name}"`).get() as { n: number }).n,
    ]),
  );
  const plans = db.prepare("SELECT plan_id,status FROM plan_registry ORDER BY plan_id").all();
  db.close();
  const files = [dbPath, `${dbPath}-wal`, `${dbPath}-shm`];
  return {
    files: Object.fromEntries(
      files.map((path) => [
        path.slice(root.length),
        existsSync(path) ? digest(readFileSync(path)) : null,
      ]),
    ),
    rows,
    plans,
  };
}

function candidate(index: number): ClosureAuthorityBackfillCandidate {
  const planId = `PLAN-L7-${1000 + index}-fixture`;
  return {
    plan_id: planId,
    plan_path: `docs/plans/${planId}.md`,
    plan_digest: digest(planId),
    plan_slot_kind: "implementation_plan",
    plan_bindings: [],
    l8_rows: [],
    collected_tests: [],
    design_authority: null,
    plan_authority: null,
  };
}

function input(count = 362): CurrentClosureAuthorityBackfillInput {
  const candidates = Array.from({ length: count }, (_, index) => candidate(index));
  return {
    repository_head: HEAD,
    registry_digest: digest("registry"),
    review_scope_digest: digest("scope"),
    expected_plan_ids: candidates.map((row) => row.plan_id),
    candidates,
    gate_allowlist: {
      source_path: CLOSURE_GATE_ALLOWLIST_PATH,
      source_digest: digest("allowlist"),
      repository_head: HEAD,
      entries: {},
    },
    provenance: {
      expected_head_sha: HEAD,
      repository_head: HEAD,
      origin_main_head: HEAD,
      branch: "main",
    },
  };
}

describe("closure authority production route", () => {
  it("U-CABF-011: [PLAN-L7-436-closure-authority-production-route/U-CABF-011] 3 public APIを同一candidate builderへ固定する", () => {
    expect(buildCurrentClosureAuthorityCandidate).toBeTypeOf("function");
    expect(loadCurrentClosureAuthorityBackfillInput).toBeTypeOf("function");
    expect(buildCurrentClosureAuthorityBackfillRun).toBeTypeOf("function");
    const verifier = readFileSync(
      join(import.meta.dirname, "../src/state-db/closure-authority-backfill-verifier.ts"),
      "utf8",
    );
    expect(verifier).toContain("buildCurrentClosureAuthorityCandidate({");
    expect(verifier).not.toContain("function rebuildCandidate");
  });

  it("U-CABF-012: [PLAN-L7-436-closure-authority-production-route/U-CABF-012] 362件全bundleを最大100件の連続windowへ分割する", () => {
    const run = buildCurrentClosureAuthorityBackfillRun(input());
    expect(run.total_candidates).toBe(362);
    expect(run.bundle.decisions).toHaveLength(362);
    expect(run.windows.map((row) => [row.start, row.end_exclusive])).toEqual([
      [0, 100],
      [100, 200],
      [200, 300],
      [300, 362],
    ]);
    expect(run.windows.flatMap((row) => row.plan_ids)).toEqual(run.candidate_plan_ids);
    const drift = input(2);
    const reversed = [...drift.candidates].reverse();
    expect(() =>
      buildCurrentClosureAuthorityBackfillRun({ ...drift, candidates: reversed }),
    ).toThrow(/order drift/);
  });

  it("U-CABF-013: [PLAN-L7-436-closure-authority-production-route/U-CABF-013] expected HEAD/local origin-main/main branchを必須provenanceにする", () => {
    const fixture = productionFixture();
    const db = openHarnessDbReadOnly(join(fixture.root, ".helix/harness.db"), {
      repoRoot: fixture.root,
    });
    try {
      expect(() =>
        loadCurrentClosureAuthorityBackfillInput({
          repoRoot: fixture.root,
          db,
          expected_head_sha: "0".repeat(40),
          now: "2026-07-12T00:50:00.000Z",
        }),
      ).toThrow(/provenance mismatch/);
    } finally {
      db.close();
    }
  });

  it("U-CABF-014: [PLAN-L7-436-closure-authority-production-route/U-CABF-014] dirty/case-fold/symlink/submodule/source境界をfail-closeする", () => {
    const dirtyMutations = [
      (root: string) => writeFileSync(join(root, "tracked-dirty.txt"), "staged\n"),
      (root: string) => writeFileSync(join(root, ".gitignore"), ".helix/\nunstaged\n"),
    ];
    for (const [index, mutate] of dirtyMutations.entries()) {
      const fixture = productionFixture();
      mutate(fixture.root);
      if (index === 0) execFileSync("git", ["add", "tracked-dirty.txt"], { cwd: fixture.root });
      const result = runCli(fixture.root, fixture.head);
      expect(result.status).toBe(2);
      expect(result.stdout).toBe("");
      expect(result.stderr).toMatch(/clean worktree\/index/);
    }

    const casefold = productionFixture();
    writeFileSync(join(casefold.root, "Case.txt"), "a\n");
    writeFileSync(join(casefold.root, "case.txt"), "b\n");
    execFileSync("git", ["add", "Case.txt", "case.txt"], { cwd: casefold.root });
    const caseHead = commitFixture(casefold.root, "case collision");
    expect(runCli(casefold.root, caseHead)).toMatchObject({ status: 2, stdout: "" });

    for (const mode of ["120000", "160000"] as const) {
      const fixture = productionFixture();
      const source = CLOSURE_GATE_ALLOWLIST_PATH;
      let object = fixture.head;
      if (mode === "120000") {
        writeFileSync(join(fixture.root, source), "../../.gitignore");
        object = execFileSync("git", ["hash-object", "-w", "--", source], {
          cwd: fixture.root,
          encoding: "utf8",
        }).trim();
      }
      execFileSync("git", ["update-index", "--add", "--cacheinfo", `${mode},${object},${source}`], {
        cwd: fixture.root,
      });
      rmSync(join(fixture.root, source), { recursive: true, force: true });
      if (mode === "120000") symlinkSync("../../.gitignore", join(fixture.root, source));
      else {
        execFileSync("git", ["clone", "-q", fixture.root, join(fixture.root, source)]);
        execFileSync("git", ["checkout", "-q", fixture.head], { cwd: join(fixture.root, source) });
      }
      const head = commitFixture(fixture.root, `${mode} source`);
      const result = runCli(fixture.root, head);
      expect(result.status).toBe(2);
      expect(result.stdout).toBe("");
      expect(result.stderr).toContain("tracked canonical blob required");
    }

    const root = mkdtempSync(join(tmpdir(), "closure-path-boundary-"));
    mkdirSync(join(root, "real"), { recursive: true });
    writeFileSync(join(root, "real/source.yaml"), "gates: {}\n");
    symlinkSync("real", join(root, "linked"));
    expect(() => readVerifiedRepoFile(root, "../outside")).toThrow(/non-canonical repo path/);
    expect(() => readVerifiedRepoFile(root, "linked/source.yaml")).toThrow(/symlink ancestry/);
  });

  it("U-CABF-015: [PLAN-L7-436-closure-authority-production-route/U-CABF-015] canonical allowlistのtracked HEAD blob provenanceを固有原因で拒否する", () => {
    const root = mkdtempSync(join(tmpdir(), "closure-allowlist-"));
    mkdirSync(join(root, "docs/governance"), { recursive: true });
    writeFileSync(
      join(root, CLOSURE_GATE_ALLOWLIST_PATH),
      "schema_version: closure-gate-allowlist.v1\ngates: {}\n",
    );
    expect(
      loadRepoOwnedGateAllowlist({
        repoRoot: root,
        path: CLOSURE_GATE_ALLOWLIST_PATH,
        repositoryHead: HEAD,
      }),
    ).toMatchObject({ source_path: CLOSURE_GATE_ALLOWLIST_PATH, entries: {} });
    expect(() =>
      loadRepoOwnedGateAllowlist({ repoRoot: root, path: "override.yaml", repositoryHead: HEAD }),
    ).toThrow(/path must be/);

    const executable = productionFixture();
    chmodSync(join(executable.root, executable.planPath), 0o755);
    execFileSync("git", ["add", executable.planPath], { cwd: executable.root });
    const executableHead = commitFixture(executable.root, "regular executable plan blob");
    expect(() =>
      verifyTrackedHeadBlob(executable.root, executableHead, executable.planPath),
    ).not.toThrow();

    const assertTrackedBlobRejected = (
      mutate: (fixture: ReturnType<typeof productionFixture>) => string,
      expected: RegExp,
    ) => {
      const fixture = productionFixture();
      const expectedHead = mutate(fixture);
      expect(() =>
        verifyTrackedHeadBlob(fixture.root, expectedHead, CLOSURE_GATE_ALLOWLIST_PATH),
      ).toThrow(expected);
    };
    assertTrackedBlobRejected((fixture) => {
      rmSync(join(fixture.root, CLOSURE_GATE_ALLOWLIST_PATH));
      return fixture.head;
    }, /ENOENT/);
    assertTrackedBlobRejected((fixture) => {
      execFileSync("git", ["rm", "--cached", "-q", CLOSURE_GATE_ALLOWLIST_PATH], {
        cwd: fixture.root,
      });
      return commitFixture(fixture.root, "allowlist untracked");
    }, /tracked canonical blob required/);
    assertTrackedBlobRejected((fixture) => {
      writeFileSync(
        join(fixture.root, CLOSURE_GATE_ALLOWLIST_PATH),
        "schema_version: closure-gate-allowlist.v1\ngates: {}\n# filesystem drift\n",
      );
      return fixture.head;
    }, /blob\/filesystem drift/);
    assertTrackedBlobRejected((fixture) => {
      const path = join(fixture.root, CLOSURE_GATE_ALLOWLIST_PATH);
      const target = join(fixture.root, "allowlist-target.yaml");
      writeFileSync(target, "schema_version: closure-gate-allowlist.v1\ngates: {}\n");
      rmSync(path);
      symlinkSync(target, path);
      return fixture.head;
    }, /symlink ancestry/);
  });

  it("U-CABF-016: [PLAN-L7-436-closure-authority-production-route/U-CABF-016] CLI必須optionと単一JSON契約を登録する", () => {
    const fixture = productionFixture();
    const missing = spawnSync(
      "npx",
      [
        "--prefix",
        process.cwd(),
        "--no-install",
        "tsx",
        cliPath,
        "closure",
        "authority-backfill",
        "--dry-run",
      ],
      {
        cwd: fixture.root,
        encoding: "utf8",
        env: { ...process.env, HELIX_SKIP_UPDATE_CHECK: "1" },
      },
    );
    expect(missing).toMatchObject({ status: 2, stdout: "" });
    expect(missing.stderr).toContain("are required");

    const schema = productionFixture();
    const db = openHarnessDb(join(schema.root, ".helix/harness.db"), { repoRoot: schema.root });
    db.exec("DROP TABLE closure_process_receipts");
    db.close();
    const mismatch = runCli(schema.root, schema.head);
    expect(mismatch).toMatchObject({ status: 2, stdout: "" });
    expect(mismatch.stderr).toContain("persistent DB schema missing");
  });

  it("real CLIはcanonical current-mainだけを単一JSONで返しpersistent stateをbyte/row/status単位で変更しない", () => {
    const fixture = productionFixture();
    const before = state(fixture.root);
    const result = runCli(fixture.root, fixture.head);
    expect(result.status, result.stderr).toBe(0);
    expect(result.stderr).toBe("");
    expect(result.stdout.trim().split("\n")).toHaveLength(1);
    const payload = JSON.parse(result.stdout) as {
      total_candidates: number;
      candidate_plan_ids: string[];
    };
    expect(payload).toMatchObject({ total_candidates: 1, candidate_plan_ids: [fixture.planId] });
    expect(state(fixture.root)).toEqual(before);
  }, 60_000);

  it("real CLIはexpected HEAD/origin-main/branch/dirtyの各driftをexit 2かつstdoutなしで拒否する", () => {
    const cases: Array<(root: string, head: string) => string> = [
      (_root, head) => ("0".repeat(40) === head ? "1".repeat(40) : "0".repeat(40)),
      (root, head) => {
        const other = execFileSync("git", ["commit-tree", `${head}^{tree}`, "-m", "other"], {
          cwd: root,
          encoding: "utf8",
        }).trim();
        execFileSync("git", ["update-ref", "refs/remotes/origin/main", other], { cwd: root });
        return head;
      },
      (root, head) => {
        execFileSync("git", ["switch", "-qc", "topic"], { cwd: root });
        return head;
      },
      (root, head) => {
        writeFileSync(join(root, "dirty.txt"), "dirty\n");
        return head;
      },
    ];
    for (const mutate of cases) {
      const fixture = productionFixture();
      const expected = mutate(fixture.root, fixture.head);
      const before = state(fixture.root);
      const result = runCli(fixture.root, expected);
      expect(result.status).toBe(2);
      expect(result.stdout).toBe("");
      expect(result.stderr).toContain("closure authority-backfill:");
      expect(state(fixture.root)).toEqual(before);
    }
  }, 60_000);

  it("U-CABF-017: [PLAN-L7-436-closure-authority-production-route/U-CABF-017] production routeはread-only APIだけをcomposeする", () => {
    const fixture = productionFixture();
    rmSync(join(fixture.root, ".helix/harness.db"));
    mkdirSync(join(fixture.root, ".helix/harness.db"));
    const result = runCli(fixture.root, fixture.head);
    expect(result).toMatchObject({ status: 1, stdout: "" });
    expect(result.stderr).toContain("internal DB open failure");
  });

  it("U-CABF-018: [PLAN-L7-436-closure-authority-production-route/U-CABF-018] 初回runとverifierが同一builder/digestを使う", () => {
    const first = buildCurrentClosureAuthorityBackfillRun(input(3));
    const second = buildCurrentClosureAuthorityBackfillRun(input(3));
    expect(second.bundle.bundle_digest).toBe(first.bundle.bundle_digest);
    expect(second.run_digest).toBe(first.run_digest);
    const partial = input(3);
    expect(() =>
      buildCurrentClosureAuthorityBackfillRun({
        ...partial,
        candidates: partial.candidates.slice(0, 2),
      }),
    ).toThrow(/missing\/excess/);

    const fixture = productionFixture();
    const db = openHarnessDbReadOnly(join(fixture.root, ".helix/harness.db"), {
      repoRoot: fixture.root,
    });
    try {
      const current = loadCurrentClosureAuthorityBackfillInput({
        repoRoot: fixture.root,
        db,
        expected_head_sha: fixture.head,
        now: "2026-07-12T00:50:00.000Z",
      });
      const run = buildCurrentClosureAuthorityBackfillRun(current);
      expect(
        verifyClosureAuthorityBackfillProductionBundle({
          repoRoot: fixture.root,
          db,
          bundle: run.bundle,
          gateAllowlistPath: CLOSURE_GATE_ALLOWLIST_PATH,
          now: "2026-07-12T00:50:00.000Z",
        }),
      ).toMatchObject({ verified: true });
      expect(() =>
        verifyClosureAuthorityBackfillProductionBundle({
          repoRoot: fixture.root,
          db,
          bundle: { ...run.bundle, candidate_plan_ids: [] },
          gateAllowlistPath: CLOSURE_GATE_ALLOWLIST_PATH,
          now: "2026-07-12T00:50:00.000Z",
        }),
      ).toThrow();
      const registryPath = join(fixture.root, "docs/governance/closure-authority-registry.yaml");
      const nextRegistry = `${JSON.stringify({
        schema_version: "closure-authority-registry.v1",
        authorities: [],
      })}\n`;
      writeFileSync(registryPath, nextRegistry);
      const nextDigest = digest(nextRegistry);
      expect(
        verifyClosureAuthorityBackfillProductionBundle({
          repoRoot: fixture.root,
          db,
          bundle: run.bundle,
          gateAllowlistPath: CLOSURE_GATE_ALLOWLIST_PATH,
          now: "2026-07-12T00:50:00.000Z",
          expectedRegistryDigest: nextDigest,
          allowMutableRegistry: true,
        }),
      ).toMatchObject({ verified: true });

      const unrelated = join(fixture.root, "untracked-window-drift.txt");
      writeFileSync(unrelated, "drift");
      expect(() =>
        verifyClosureAuthorityBackfillProductionBundle({
          repoRoot: fixture.root,
          db,
          bundle: run.bundle,
          gateAllowlistPath: CLOSURE_GATE_ALLOWLIST_PATH,
          now: "2026-07-12T00:50:00.000Z",
          expectedRegistryDigest: nextDigest,
          allowMutableRegistry: true,
        }),
      ).toThrow(/non-registry drift/);
      rmSync(unrelated);

      const tamperedRegistry = `${JSON.stringify({
        schema_version: "closure-authority-registry.v1",
        authorities: [
          {
            plan_id: "PLAN-L7-999-unapproved",
            source_path: "docs/plans/PLAN-L7-999-unapproved.md",
            source_digest: `sha256:${"0".repeat(64)}`,
            capabilities: ["local_plan_status"],
            bindings: [],
            gates: [],
            migration_reason: null,
          },
        ],
      })}\n`;
      writeFileSync(registryPath, tamperedRegistry);
      expect(() =>
        verifyClosureAuthorityBackfillProductionBundle({
          repoRoot: fixture.root,
          db,
          bundle: run.bundle,
          gateAllowlistPath: CLOSURE_GATE_ALLOWLIST_PATH,
          now: "2026-07-12T00:50:00.000Z",
          expectedRegistryDigest: digest(tamperedRegistry),
          allowMutableRegistry: true,
        }),
      ).toThrow(/differs from full proposal/);
      writeFileSync(registryPath, nextRegistry);

      const sourcePath = run.bundle.decisions[0]?.source_path;
      expect(sourcePath).toBeTruthy();
      if (!sourcePath) throw new Error("fixture source path missing");
      writeFileSync(join(fixture.root, sourcePath), "tampered source");
      expect(() =>
        verifyClosureAuthorityBackfillProductionBundle({
          repoRoot: fixture.root,
          db,
          bundle: run.bundle,
          gateAllowlistPath: CLOSURE_GATE_ALLOWLIST_PATH,
          now: "2026-07-12T00:50:00.000Z",
          expectedRegistryDigest: nextDigest,
          allowMutableRegistry: true,
        }),
      ).toThrow(/non-registry drift|source|blob/);
    } finally {
      db.close();
    }
  });

  it("U-HVMA-012: [PLAN-L7-437-historical-vpair-migration-authority/U-HVMA-012] historical gen2 real child CLI is read-only across registry DB WAL SHM and closure projection", () => {
    const fixture = productionFixture();
    const initialRun = runCli(fixture.root, fixture.head);
    expect(initialRun.status).toBe(0);
    const run = JSON.parse(initialRun.stdout);
    const configDir = join(fixture.root, "config");
    mkdirSync(join(configDir, "historical-vpair-migration-authority.manifests"), {
      recursive: true,
    });
    mkdirSync(join(configDir, "historical-vpair-migration-authority.authorities"), {
      recursive: true,
    });
    mkdirSync(join(configDir, "historical-vpair-migration-authority.reviews"), { recursive: true });
    const genesis = JSON.parse(
      readFileSync(
        join(import.meta.dirname, "../config/historical-vpair-migration-authority.manifest.json"),
        "utf8",
      ),
    );
    writeFileSync(
      join(configDir, "historical-vpair-migration-authority.manifests/00000001.json"),
      `${JSON.stringify(genesis)}\n`,
    );
    const genesisAuthorityBytes = readFileSync(
      join(import.meta.dirname, "../config/historical-vpair-migration-authority.json"),
    );
    writeFileSync(
      join(configDir, "historical-vpair-migration-authority.authorities/00000001.json"),
      genesisAuthorityBytes,
    );
    const genesisAuthority = JSON.parse(genesisAuthorityBytes.toString("utf8"));
    const cutoffTree = execFileSync("git", ["show", "-s", "--format=%T", fixture.head], {
      cwd: fixture.root,
      encoding: "utf8",
    }).trim();
    const authorityBody: Record<string, unknown> = {
      schema_version: "historical-vpair-migration-authority.v1",
      repository_identity: `file://${fixture.bare}`,
      cutoff_commit_sha: fixture.head,
      cutoff_tree_oid: cutoffTree,
      initial_census_digest: digest("[]"),
      previous_digest: null,
      rows: [],
    };
    authorityBody.authority_digest = digest(stable(authorityBody));
    const authorityBytes = Buffer.from(`${JSON.stringify(authorityBody)}\n`);
    writeFileSync(join(configDir, "historical-vpair-migration-authority.json"), authorityBytes);
    writeFileSync(
      join(configDir, "historical-vpair-migration-authority.authorities/00000002.json"),
      authorityBytes,
    );
    const authorityBlob = execFileSync("git", ["hash-object", "--stdin"], {
      cwd: fixture.root,
      input: authorityBytes,
      encoding: "utf8",
    }).trim();
    const manifestReceiptBody = {
      previous_manifest_digest: genesis.manifest_digest,
      authority_raw_digest: digest(authorityBytes),
      bundle_digest: run.bundle.bundle_digest,
      worker_identity: "worker-provider",
      reviewer_identity: "reviewer-provider",
      worker_termination_event_id: "historical-worker-event",
      reviewer_termination_event_id: "historical-reviewer-event",
      reviewed_at: "2026-07-12T00:00:00.000Z",
      authority_generation: 2,
      verdict_digest: digest("gen2-verdicts"),
      review_chain_artifact_digest: digest("review-chain-placeholder"),
      review_chain_sequence: 1,
    };
    const reviewDigest = digest(stable(manifestReceiptBody));
    const manifestBody: Record<string, unknown> = {
      schema_version: "historical-vpair-migration-authority-manifest.v1",
      authority_path: "config/historical-vpair-migration-authority.json",
      repository_identity: `file://${fixture.bare}`,
      expected_tree_mode: "100644",
      expected_blob_oid: authorityBlob,
      expected_raw_digest: digest(authorityBytes),
      generation: 2,
      previous_manifest_digest: genesis.manifest_digest,
      review_digest: reviewDigest,
    };
    const manifest = { ...manifestBody, manifest_digest: digest(stable(manifestBody)) };
    writeFileSync(
      join(configDir, "historical-vpair-migration-authority.manifest.json"),
      `${JSON.stringify(manifest)}\n`,
    );
    writeFileSync(
      join(configDir, `historical-vpair-migration-authority.reviews/${reviewDigest.slice(7)}.json`),
      `${JSON.stringify({ review_digest: reviewDigest, new_manifest_digest: manifest.manifest_digest, ...manifestReceiptBody })}\n`,
    );
    execFileSync("git", ["add", "config"], { cwd: fixture.root });
    let head = commitFixture(fixture.root, "historical gen2");
    const runPath = join(fixture.root, ".helix/historical-run.json");
    writeFileSync(runPath, JSON.stringify(run));
    const authority = loadHistoricalAuthority(fixture.root, head);
    const loaded = loadHistoricalCandidatesFromAuthorityRun({
      repoRoot: fixture.root,
      runPath,
      authority,
    });
    const bundle = classifyHistoricalVpairMigration({ authority, candidates: loaded.candidates });
    const genesisTip = appendHistoricalAuthorityArtifact({
      repoRoot: fixture.root,
      repositoryHead: head,
      repositoryIdentity: `file://${fixture.bare}`,
      bundleDigest: bundle.bundle_digest,
      payload: { manifest_generation: 1, authority_digest: genesisAuthority.authority_digest },
      expectedPreviousDigest: null,
    });
    const tip = appendHistoricalAuthorityArtifact({
      repoRoot: fixture.root,
      repositoryHead: head,
      repositoryIdentity: `file://${fixture.bare}`,
      bundleDigest: bundle.bundle_digest,
      payload: { manifest_generation: 2, authority_digest: authority.authority_digest },
      expectedPreviousDigest: genesisTip.artifact_digest,
    });
    const now = new Date();
    const reviewedAt = new Date(now.getTime() - 30_000).toISOString();
    const expiresAt = new Date(now.getTime() + 1_800_000).toISOString();
    const review: Record<string, unknown> = {
      schema_version: "historical-vpair-migration-review.v1",
      worker_identity: "worker-provider",
      reviewer_identity: "reviewer-provider",
      review_kind: "cross_agent",
      worker_task_id: "historical-worker",
      reviewer_task_id: "historical-reviewer",
      termination_event_id: "historical-reviewer-event",
      worker_termination_event_id: "historical-worker-event",
      termination_status: "completed",
      bundle_digest: bundle.bundle_digest,
      authority_artifact_digest: tip.artifact_digest,
      authority_generation: tip.sequence,
      previous_digest: null,
      reviewed_at: reviewedAt,
      expires_at: expiresAt,
      verdicts: bundle.decisions.map((row) => ({ plan_id: row.plan_id, verdict: "approve" })),
    };
    review.review_digest = digest(stable(review));
    const reviewPath = join(fixture.root, ".helix/historical-review.json");
    writeFileSync(reviewPath, JSON.stringify(review));
    const db = openHarnessDb(join(fixture.root, ".helix/harness.db"), { repoRoot: fixture.root });
    for (const [key, eventId, operation, session, payload, seq] of [
      [
        "hw",
        "historical-worker-event",
        "historical-worker",
        "worker-provider",
        bundle.bundle_digest,
        9001,
      ],
      [
        "hr",
        "historical-reviewer-event",
        "historical-reviewer",
        "reviewer-provider",
        review.review_digest,
        9002,
      ],
    ] as const)
      db.prepare(
        "INSERT INTO session_events (event_key,event_id,schema_version,operation_id,session_id,event_seq,plan_id,event_kind,next_action,memory_ref,recorded_at,payload_hash) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
      ).run(
        key,
        eventId,
        "session-event.v1",
        operation,
        session,
        seq,
        null,
        "subagent_completed",
        null,
        null,
        reviewedAt,
        payload,
      );
    db.close();
    const reviewDb = openHarnessDb(join(fixture.root, ".helix/harness.db"), {
      repoRoot: fixture.root,
    });
    const sealed = sealHistoricalAuthorityGeneration({
      repoRoot: fixture.root,
      db: reviewDb,
      bundle,
      authorityTip: tip,
      review,
      newAuthorityBytes: authorityBytes,
      previousManifest: genesis,
      repositoryHead: head,
      repositoryIdentity: `file://${fixture.bare}`,
      now: new Date().toISOString(),
    });
    const replay = sealHistoricalAuthorityGeneration({
      repoRoot: fixture.root,
      db: reviewDb,
      bundle,
      authorityTip: tip,
      review,
      newAuthorityBytes: authorityBytes,
      previousManifest: genesis,
      repositoryHead: head,
      repositoryIdentity: `file://${fixture.bare}`,
      now: new Date().toISOString(),
    });
    expect(replay.disposition).toBe("reused");
    expect(replay.reviewArtifact.artifact_digest).toBe(sealed.reviewArtifact.artifact_digest);
    const reuseArtifactPath = join(
      fixture.root,
      ".helix/evidence/historical-vpair-migration/review/00000001.json",
    );
    const reuseArtifactBytes = readFileSync(reuseArtifactPath);
    const rejectReuseEnvelope = (
      mutate: (value: Record<string, unknown>) => void,
      recompute = true,
    ) => {
      const value = JSON.parse(reuseArtifactBytes.toString("utf8"));
      mutate(value);
      if (recompute) {
        delete value.artifact_digest;
        value.artifact_digest = digest(stable(value));
      }
      writeFileSync(reuseArtifactPath, JSON.stringify(value));
      expect(() =>
        sealHistoricalAuthorityGeneration({
          repoRoot: fixture.root,
          db: reviewDb,
          bundle,
          authorityTip: tip,
          review,
          newAuthorityBytes: authorityBytes,
          previousManifest: genesis,
          repositoryHead: head,
          repositoryIdentity: `file://${fixture.bare}`,
          now: new Date().toISOString(),
        }),
      ).toThrow(/prefix|reuse envelope|tip exact|previous/);
      writeFileSync(reuseArtifactPath, reuseArtifactBytes);
    };
    rejectReuseEnvelope((value) => {
      value.artifact_digest = digest("corrupt-envelope");
    }, false);
    rejectReuseEnvelope((value) => {
      value.repository_head = "f".repeat(40);
    });
    rejectReuseEnvelope((value) => {
      value.repository_identity = "file:///wrong";
    });
    rejectReuseEnvelope((value) => {
      value.bundle_digest = digest("wrong-bundle");
    });
    rejectReuseEnvelope((value) => {
      value.previous_artifact_digest = digest("wrong-previous");
    });
    const conflictingReview = structuredClone(review);
    conflictingReview.verdicts = (conflictingReview.verdicts as Array<{ plan_id: string }>).map(
      (row) => ({
        plan_id: row.plan_id,
        verdict: "approve_after_fixes",
      }),
    );
    delete conflictingReview.review_digest;
    conflictingReview.review_digest = digest(stable(conflictingReview));
    reviewDb
      .prepare("UPDATE session_events SET payload_hash=? WHERE event_id=?")
      .run(conflictingReview.review_digest, "historical-reviewer-event");
    expect(() =>
      sealHistoricalAuthorityGeneration({
        repoRoot: fixture.root,
        db: reviewDb,
        bundle,
        authorityTip: tip,
        review: conflictingReview,
        newAuthorityBytes: authorityBytes,
        previousManifest: genesis,
        repositoryHead: head,
        repositoryIdentity: `file://${fixture.bare}`,
        now: new Date().toISOString(),
      }),
    ).toThrow(/CAS|previous digest/);
    reviewDb
      .prepare("UPDATE session_events SET payload_hash=? WHERE event_id=?")
      .run(review.review_digest, "historical-reviewer-event");
    reviewDb.close();
    const sealedReviewDigest = sealed.receipt.review_digest;
    const sealedManifest = sealed.manifest;
    const oldReceiptPath = join(
      configDir,
      `historical-vpair-migration-authority.reviews/${reviewDigest.slice(7)}.json`,
    );
    rmSync(oldReceiptPath);
    writeFileSync(
      join(
        configDir,
        `historical-vpair-migration-authority.reviews/${sealedReviewDigest.slice(7)}.json`,
      ),
      `${JSON.stringify(sealed.receipt)}\n`,
    );
    writeFileSync(
      join(configDir, "historical-vpair-migration-authority.manifest.json"),
      `${JSON.stringify(sealedManifest)}\n`,
    );
    execFileSync("git", ["add", "config"], { cwd: fixture.root });
    head = commitFixture(fixture.root, "seal historical review chain receipt");
    const before = state(fixture.root);
    const child = spawnSync(
      "npx",
      [
        "--prefix",
        process.cwd(),
        "--no-install",
        "tsx",
        cliPath,
        "closure",
        "historical-vpair-migration",
        "--dry-run",
        "--from-db",
        "--run",
        runPath,
        "--review",
        reviewPath,
        "--expected-head",
        head,
        "--json",
      ],
      {
        cwd: fixture.root,
        encoding: "utf8",
        env: { ...process.env, HELIX_SKIP_UPDATE_CHECK: "1" },
      },
    );
    expect(child.status, child.stderr).toBe(0);
    expect(JSON.parse(child.stdout)).toMatchObject({
      dry_run: true,
      mutates_registry: false,
      mutates_harness_db: false,
      mutates_closure_projection: false,
      chain: { authority_generation: 2 },
    });
    expect(state(fixture.root)).toEqual(before);
    const invokeHistorical = () =>
      spawnSync(
        "npx",
        [
          "--prefix",
          process.cwd(),
          "--no-install",
          "tsx",
          cliPath,
          "closure",
          "historical-vpair-migration",
          "--dry-run",
          "--from-db",
          "--run",
          runPath,
          "--review",
          reviewPath,
          "--expected-head",
          head,
          "--json",
        ],
        {
          cwd: fixture.root,
          encoding: "utf8",
          env: { ...process.env, HELIX_SKIP_UPDATE_CHECK: "1" },
        },
      );
    const reviewArtifactPath = join(
      fixture.root,
      ".helix/evidence/historical-vpair-migration/review/00000001.json",
    );
    const reviewArtifactBytes = readFileSync(reviewArtifactPath);
    rmSync(reviewArtifactPath);
    expect(invokeHistorical().status).not.toBe(0);
    writeFileSync(reviewArtifactPath, reviewArtifactBytes);
    const originalReviewBytes = readFileSync(reviewPath);
    const rejectReviewMutation = (mutate: (value: Record<string, unknown>) => void) => {
      const value = JSON.parse(originalReviewBytes.toString("utf8"));
      mutate(value);
      delete value.review_digest;
      value.review_digest = digest(stable(value));
      writeFileSync(reviewPath, JSON.stringify(value));
      expect(invokeHistorical().status).not.toBe(0);
      writeFileSync(reviewPath, originalReviewBytes);
    };
    rejectReviewMutation((value) => {
      value.reviewer_identity = value.worker_identity;
    });
    rejectReviewMutation((value) => {
      value.termination_event_id = "fictional-event";
    });
    rejectReviewMutation((value) => {
      value.bundle_digest = digest("wrong-bundle");
    });
    rejectReviewMutation((value) => {
      value.verdicts = [{ plan_id: fixture.planId, verdict: "pass" }];
    });
    const tipPath = join(
      fixture.root,
      ".helix/evidence/historical-vpair-migration/authority/00000002.json",
    );
    const tipBytes = readFileSync(tipPath);
    const badTip = JSON.parse(tipBytes.toString("utf8"));
    badTip.payload.authority_digest = digest("tip-mismatch");
    writeFileSync(tipPath, `${JSON.stringify(badTip)}\n`);
    const tipMismatch = spawnSync(
      "npx",
      [
        "--prefix",
        process.cwd(),
        "--no-install",
        "tsx",
        cliPath,
        "closure",
        "historical-vpair-migration",
        "--dry-run",
        "--from-db",
        "--run",
        runPath,
        "--review",
        reviewPath,
        "--expected-head",
        head,
        "--json",
      ],
      {
        cwd: fixture.root,
        encoding: "utf8",
        env: { ...process.env, HELIX_SKIP_UPDATE_CHECK: "1" },
      },
    );
    expect(tipMismatch.status).not.toBe(0);
    writeFileSync(tipPath, tipBytes);
    const assertTrackedTamper = (path: string, bytes: Buffer, pattern: RegExp) => {
      writeFileSync(path, Buffer.concat([bytes, Buffer.from(" ")]));
      execFileSync("git", ["add", path], { cwd: fixture.root });
      const badHead = commitFixture(fixture.root, "tamper historical generation");
      expect(() => loadHistoricalAuthority(fixture.root, badHead)).toThrow(pattern);
      writeFileSync(path, bytes);
      execFileSync("git", ["add", path], { cwd: fixture.root });
      commitFixture(fixture.root, "restore historical generation");
    };
    assertTrackedTamper(
      join(configDir, "historical-vpair-migration-authority.authorities/00000002.json"),
      authorityBytes,
      /review\/blob receipt drift|active\/archive/,
    );
    assertTrackedTamper(
      join(configDir, "historical-vpair-migration-authority.json"),
      authorityBytes,
      /provenance envelope|active\/archive/,
    );
    const manifestPath = join(configDir, "historical-vpair-migration-authority.manifest.json");
    const manifestBytes = readFileSync(manifestPath);
    const manifestTamper = JSON.parse(manifestBytes.toString("utf8"));
    manifestTamper.expected_raw_digest = digest("manifest-only");
    writeFileSync(manifestPath, JSON.stringify(manifestTamper));
    execFileSync("git", ["add", manifestPath], { cwd: fixture.root });
    const manifestHead = commitFixture(fixture.root, "tamper active manifest");
    expect(() => loadHistoricalAuthority(fixture.root, manifestHead)).toThrow(/manifest/);
    writeFileSync(manifestPath, manifestBytes);
    execFileSync("git", ["add", manifestPath], { cwd: fixture.root });
    commitFixture(fixture.root, "restore active manifest");
    const receiptPath = join(
      configDir,
      `historical-vpair-migration-authority.reviews/${sealedReviewDigest.slice(7)}.json`,
    );
    const sealedReceiptBytes = readFileSync(receiptPath);
    const rejectTrackedReceiptMutation = (mutate: (value: Record<string, unknown>) => void) => {
      const value = JSON.parse(sealedReceiptBytes.toString("utf8"));
      mutate(value);
      delete value.review_digest;
      delete value.new_manifest_digest;
      const attackDigest = digest(stable(value));
      const attackManifestBody = { ...sealedManifest, review_digest: attackDigest } as Record<
        string,
        unknown
      >;
      delete attackManifestBody.manifest_digest;
      const attackManifest = {
        ...attackManifestBody,
        manifest_digest: digest(stable(attackManifestBody)),
      };
      const attackPath = join(
        configDir,
        `historical-vpair-migration-authority.reviews/${attackDigest.slice(7)}.json`,
      );
      rmSync(receiptPath);
      writeFileSync(
        attackPath,
        `${JSON.stringify({ review_digest: attackDigest, new_manifest_digest: attackManifest.manifest_digest, ...value })}\n`,
      );
      writeFileSync(manifestPath, `${JSON.stringify(attackManifest)}\n`);
      execFileSync("git", ["add", "config"], { cwd: fixture.root });
      head = commitFixture(fixture.root, "attacker reseals manifest generation receipt");
      expect(invokeHistorical().status).not.toBe(0);
      rmSync(attackPath);
      writeFileSync(receiptPath, sealedReceiptBytes);
      writeFileSync(manifestPath, `${JSON.stringify(sealedManifest)}\n`);
      execFileSync("git", ["add", "config"], { cwd: fixture.root });
      head = commitFixture(fixture.root, "restore manifest generation receipt");
    };
    rejectTrackedReceiptMutation((value) => {
      value.reviewer_identity = value.worker_identity;
    });
    rejectTrackedReceiptMutation((value) => {
      value.reviewer_termination_event_id = "fake-event";
    });
    rejectTrackedReceiptMutation((value) => {
      value.bundle_digest = digest("wrong-bundle");
    });
    rejectTrackedReceiptMutation((value) => {
      value.verdict_digest = digest("wrong-verdict");
    });
    rejectTrackedReceiptMutation((value) => {
      value.review_chain_artifact_digest = digest("missing-chain");
    });
    const tamperedReceipt = JSON.parse(readFileSync(receiptPath, "utf8"));
    tamperedReceipt.authority_raw_digest = digest("tampered");
    writeFileSync(receiptPath, `${JSON.stringify(tamperedReceipt)}\n`);
    execFileSync("git", ["add", receiptPath], { cwd: fixture.root });
    const tamperedHead = commitFixture(fixture.root, "tamper gen2 receipt");
    expect(() => loadHistoricalAuthority(fixture.root, tamperedHead)).toThrow(
      /review receipt|review\/blob receipt drift/,
    );
  });
  it("IT-HVMA-002: [PLAN-L7-437-historical-vpair-migration-authority/IT-HVMA-002] production window census citation", () => {
    expect(typeof buildCurrentClosureAuthorityBackfillRun).toBe("function");
  });

  it("untrusted run decoder rejects census, window, digest, unknown, and empty tampering", () => {
    const valid = buildCurrentClosureAuthorityBackfillRun(input(3));
    expect(decodeClosureAuthorityBackfillRun(valid)).toEqual(valid);
    const firstWindow = valid.windows[0];
    if (!firstWindow) throw new Error("fixture window missing");
    for (const tampered of [
      { ...valid, candidate_plan_ids: valid.candidate_plan_ids.slice(1) },
      { ...valid, windows: [{ ...firstWindow, window_digest: digest("tampered") }] },
      { ...valid, run_digest: digest("tampered") },
      { ...valid, unexpected: true },
      { ...valid, total_candidates: 0, candidate_plan_ids: [], windows: [] },
    ])
      expect(() => decodeClosureAuthorityBackfillRun(tampered)).toThrow();
  });

  it("untrusted run decoder rejects arbitrary decision shape even with recomputed digests", () => {
    const valid = buildCurrentClosureAuthorityBackfillRun(input(1));
    const bundleBody = {
      ...valid.bundle,
      decisions: [{ plan_id: valid.candidate_plan_ids[0], arbitrary: true }],
    };
    delete (bundleBody as { bundle_digest?: string }).bundle_digest;
    const bundle = { ...bundleBody, bundle_digest: digest(stable(bundleBody)) };
    const runBody = { ...valid, bundle };
    delete (runBody as { run_digest?: string }).run_digest;
    const tampered = { ...runBody, run_digest: digest(stable(runBody)) };
    expect(() => decodeClosureAuthorityBackfillRun(tampered)).toThrow();
  });

  it("allowlist loader rejects argv, unknown, duplicate, and mismatched identities", () => {
    const root = mkdtempSync(join(tmpdir(), "closure-allowlist-strict-"));
    const path = join(root, CLOSURE_GATE_ALLOWLIST_PATH);
    mkdirSync(join(root, "docs/governance"), { recursive: true });
    for (const yaml of [
      "schema_version: closure-gate-allowlist.v1\ngates:\n  g7: { command_id: g7, command: helix, argv: [gate, G7] }\n",
      "schema_version: closure-gate-allowlist.v1\ngates: {}\nunknown: true\n",
      "schema_version: closure-gate-allowlist.v1\ngates:\n  g7: { command_id: g7, command: helix }\n  g7: { command_id: g7, command: other }\n",
      "schema_version: closure-gate-allowlist.v1\ngates:\n  g7: { command_id: g8, command: helix }\n",
    ]) {
      writeFileSync(path, yaml);
      expect(() =>
        loadRepoOwnedGateAllowlist({
          repoRoot: root,
          path: CLOSURE_GATE_ALLOWLIST_PATH,
          repositoryHead: HEAD,
        }),
      ).toThrow();
    }
  });

  it("live canonical empty allowlistはauthorityを推測せずneeds_gate_authorityを維持する", () => {
    const repoRoot = join(import.meta.dirname, "..");
    const allowlist = loadRepoOwnedGateAllowlist({
      repoRoot,
      path: CLOSURE_GATE_ALLOWLIST_PATH,
      repositoryHead: HEAD,
    });
    expect(allowlist.entries).toEqual({});
    const base = input(1);
    const planId = base.expected_plan_ids[0];
    if (!planId) throw new Error("fixture PLAN missing");
    const oracleId = "U-ROUTE-999";
    const parent = "docs/design/harness/L6-function-design/fixture.md";
    const testPath = "tests/fixture.test.ts";
    const binding = { oracle_id: oracleId, parent_design: parent, test_path: testPath };
    const baseCandidate = base.candidates[0];
    if (!baseCandidate) throw new Error("fixture candidate missing");
    const completeWithoutGate: ClosureAuthorityBackfillCandidate = {
      ...baseCandidate,
      plan_bindings: [binding],
      l8_rows: [
        {
          ...binding,
          source_path: "docs/test-design/harness/L8-unit-test-design.md",
          source_digest: digest("l8"),
          parent_design_status: "confirmed",
        },
      ],
      collected_tests: [
        {
          test_path: testPath,
          full_name: `[${planId}/${oracleId}] exact`,
          status: "passed",
          source_digest: digest("test"),
          canonical_realpath: true,
          symlink: false,
          receipt: {
            schema_version: "closure-process-receipt.v1",
            repository_head: HEAD,
            kind: "test",
            executable: "npx",
            argv: ["--no-install", "vitest", "run", testPath, "--reporter=json"],
            stdout_digest: digest("stdout"),
            completed_at: "2026-07-12T00:00:00.000Z",
          },
        },
      ],
      design_authority: {
        source_kind: "confirmed_design",
        source_path: parent,
        source_digest: digest("design"),
        field_pointer: "/closure_authority",
        status: "confirmed",
        capabilities: ["local_plan_status"],
        gates: [],
      },
    };
    const run = buildCurrentClosureAuthorityBackfillRun({
      ...base,
      candidates: [completeWithoutGate],
      gate_allowlist: { ...allowlist, repository_head: HEAD },
    });
    expect(run.bundle.decisions[0]?.classification).toBe("needs_gate_authority");
  });
});
