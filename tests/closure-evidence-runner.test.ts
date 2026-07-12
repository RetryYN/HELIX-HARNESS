import { mkdirSync, mkdtempSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import {
  ClosureEvidenceRunner,
  type ClosureSpawn,
  closureCommandDedupeKey,
} from "../src/state-db/closure-evidence-runner";

// PLAN-L7-434-closure-evidence-materialization

const HEAD = "a".repeat(40);

function fixture(): { root: string; testPath: string } {
  const root = mkdtempSync(join(tmpdir(), "helix-closure-runner-"));
  mkdirSync(join(root, "tests"));
  const testPath = "tests/fixture.test.ts";
  writeFileSync(join(root, testPath), "// fixture\n");
  return { root, testPath };
}

function json(assertions: Array<{ fullName: string; title?: string; status: string }>): string {
  return JSON.stringify({
    success: true,
    testResults: [
      {
        name: "/repo/tests/fixture.test.ts",
        assertionResults: assertions.map((item) => ({
          ...item,
          title: item.title ?? item.fullName,
        })),
      },
    ],
  });
}

describe("closure evidence typed subprocess runner", () => {
  it("U-CMAT-004: single canonical test pathをtyped Vitest argvへ固定しshell入力を拒否する", () => {
    const { root, testPath } = fixture();
    const spawn = vi.fn<ClosureSpawn>(() => ({
      exitCode: 0,
      signal: null,
      stdout: json([{ fullName: "U-CMAT-004 canonical argv", status: "passed" }]),
      stderr: "",
      timedOut: false,
    }));
    const runner = new ClosureEvidenceRunner({
      repoRoot: root,
      repositoryHead: HEAD,
      gateAllowlist: {},
      spawn,
    });
    const result = runner.runTest({ testPath, oracleIds: ["U-CMAT-004"] });
    expect(result.receipt.argv).toEqual(["vitest", "run", testPath, "--reporter=json"]);
    expect(spawn).toHaveBeenCalledWith(
      expect.objectContaining({ executable: "bunx", argv: result.receipt.argv }),
    );
    for (const hostile of [
      "tests/../x.test.ts",
      "tests/x.test.ts;sh",
      "tests\\x.test.ts",
      "/tests/x.test.ts",
    ])
      expect(() => runner.runTest({ testPath: hostile, oracleIds: ["U-CMAT-004"] })).toThrow(
        /canonical/,
      );
  });

  it("U-CMAT-005: HEAD+argvでdedupeしoracleのcollect/execute/passをexactly-once証明する", () => {
    const { root, testPath } = fixture();
    const spawn = vi.fn<ClosureSpawn>(() => ({
      exitCode: 0,
      signal: null,
      stdout: json([
        { fullName: "suite U-CMAT-005 first", status: "passed" },
        { fullName: "suite U-CMAT-006 second", status: "passed" },
      ]),
      stderr: "note",
      timedOut: false,
    }));
    const runner = new ClosureEvidenceRunner({
      repoRoot: root,
      repositoryHead: HEAD,
      gateAllowlist: {},
      spawn,
    });
    expect(runner.runTest({ testPath, oracleIds: ["U-CMAT-005"] }).proofs[0]).toMatchObject({
      collected: true,
      executed: true,
      passed: true,
    });
    runner.runTest({ testPath, oracleIds: ["U-CMAT-006"] });
    expect(spawn).toHaveBeenCalledTimes(1);
    expect(closureCommandDedupeKey(HEAD, { executable: "bunx", argv: ["x"] })).not.toBe(
      closureCommandDedupeKey("b".repeat(40), { executable: "bunx", argv: ["x"] }),
    );
  });

  it("oracle proof: U-CMAT-005 missing、duplicate、未passを拒否する", () => {
    const { root, testPath } = fixture();
    for (const assertions of [
      [],
      [
        { fullName: "U-CMAT-005 a", status: "passed" },
        { fullName: "U-CMAT-005 b", status: "passed" },
      ],
      [{ fullName: "U-CMAT-005 a", status: "failed" }],
    ]) {
      const runner = new ClosureEvidenceRunner({
        repoRoot: root,
        repositoryHead: HEAD,
        gateAllowlist: {},
        spawn: () => ({
          exitCode: 0,
          signal: null,
          stdout: json(assertions),
          stderr: "",
          timedOut: false,
        }),
      });
      expect(() => runner.runTest({ testPath, oracleIds: ["U-CMAT-005"] })).toThrow(
        /exactly once|not executed/,
      );
    }
  });

  it("gate argv: U-CMAT-004 declared commandとallowlistからtyped argvを構成する", () => {
    const { root } = fixture();
    const spawn = vi.fn<ClosureSpawn>(() => ({
      exitCode: 0,
      signal: null,
      stdout: "green",
      stderr: "",
      timedOut: false,
    }));
    const runner = new ClosureEvidenceRunner({
      repoRoot: root,
      repositoryHead: HEAD,
      gateAllowlist: {
        G7: {
          command: "helix gate G7",
          executable: "bun",
          argv: ["run", "src/cli.ts", "gate", "G7"],
        },
      },
      spawn,
    });
    const receipt = runner.runGate({ gateId: "G7", declaredCommand: "helix gate G7" });
    expect(receipt.argv).toEqual(["run", "src/cli.ts", "gate", "G7"]);
    expect(runner.runGate({ gateId: "G7", declaredCommand: "helix gate G7" })).toBe(receipt);
    expect(spawn).toHaveBeenCalledTimes(1);
    expect(() =>
      runner.runGate({ gateId: "G7", declaredCommand: "helix gate G7; rm -rf /" }),
    ).toThrow(/not allowlisted/);
    expect(() =>
      runner.runGate({ gateId: "UNKNOWN", declaredCommand: "helix gate UNKNOWN" }),
    ).toThrow(/not allowlisted/);
  });

  it("U-CMAT-006: timeout、signal、非zero、output欠落をreceipt化しない", () => {
    const { root, testPath } = fixture();
    const failures = [
      { exitCode: null, signal: null, stdout: "", stderr: "", timedOut: true },
      { exitCode: null, signal: "SIGTERM" as const, stdout: "x", stderr: "", timedOut: false },
      { exitCode: 2, signal: null, stdout: "x", stderr: "", timedOut: false },
      { exitCode: 0, signal: null, stdout: "", stderr: "", timedOut: false },
    ];
    for (const failure of failures) {
      const runner = new ClosureEvidenceRunner({
        repoRoot: root,
        repositoryHead: HEAD,
        gateAllowlist: {},
        spawn: () => failure,
      });
      expect(() => runner.runTest({ testPath, oracleIds: ["U-CMAT-006"] })).toThrow();
    }
  });

  it("path guard: U-CMAT-004 symlink test pathを拒否する", () => {
    const { root } = fixture();
    writeFileSync(join(root, "target.test.ts"), "// target\n");
    symlinkSync(join(root, "target.test.ts"), join(root, "tests", "link.test.ts"));
    const runner = new ClosureEvidenceRunner({
      repoRoot: root,
      repositoryHead: HEAD,
      gateAllowlist: {},
    });
    expect(() =>
      runner.runTest({ testPath: "tests/link.test.ts", oracleIds: ["U-CMAT-004"] }),
    ).toThrow(/symlink/);
  });

  it("defaultSpawnは実Vitest JSONと実gate processからreceiptを生成する", () => {
    const { root, testPath } = fixture();
    writeFileSync(
      join(root, testPath),
      'import { expect, it } from "vitest";\nit("U-CMAT-004: real subprocess", () => expect(1).toBe(1));\n',
    );
    symlinkSync(join(process.cwd(), "node_modules"), join(root, "node_modules"), "dir");
    const runner = new ClosureEvidenceRunner({
      repoRoot: root,
      repositoryHead: HEAD,
      gateAllowlist: {
        smoke: { command: "bun --version", executable: "bun", argv: ["--version"] },
      },
      timeoutMs: 30_000,
    });
    expect(runner.runTest({ testPath, oracleIds: ["U-CMAT-004"] }).proofs).toHaveLength(1);
    const gate = runner.runGate({ gateId: "smoke", declaredCommand: "bun --version" });
    expect(gate.stdout.trim()).toMatch(/^\d+\.\d+/);
    expect(Date.parse(gate.completed_at)).not.toBeNaN();
  }, 60_000);
});
