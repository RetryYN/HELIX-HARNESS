import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { analyzeLayerPairGate, evaluateStaticGate, readCoverageSummary } from "../src/gate/static";
import type { PairDoc } from "../src/vmodel/lint";

const cliPath = join(process.cwd(), "src", "cli.ts");

function runCli(args: string[]) {
  if (process.platform === "win32") {
    const cmdExe = join(process.env.SystemRoot ?? "C:\\Windows", "System32", "cmd.exe");
    return spawnSync(cmdExe, ["/d", "/c", "npx", "--no-install", "tsx", cliPath, ...args], {
      cwd: process.cwd(),
      encoding: "utf8",
    });
  }
  return spawnSync("npx", ["--prefix", process.cwd(), "--no-install", "tsx", cliPath, ...args], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
}

const doc = (
  path: string,
  layer: string,
  pairArtifact: string | null,
  status = "confirmed",
): PairDoc => ({ path, layer, pairArtifact, status });

function expectDeterministicLayerPairSummary(gate: string, layer: string) {
  const first = evaluateStaticGate({ gate, repoRoot: process.cwd() });
  const second = evaluateStaticGate({ gate, repoRoot: process.cwd() });

  expect(second).toEqual(first);
  expect(first.applicable).toBe(true);

  const pairMessage = first.messages.find((message) =>
    message.startsWith(`${gate.toLowerCase()}-pair`),
  );
  const match = pairMessage?.match(
    new RegExp(
      `^${gate.toLowerCase()}-pair - (OK|violation) \\(L${layer} total=(\\d+), confirmed=(\\d+), placeholder=(\\d+), draft=(\\d+), orphans=(\\d+)\\)$`,
    ),
  );
  expect(match, pairMessage).not.toBeNull();
  if (!match) {
    throw new Error(`pair summary did not match: ${pairMessage ?? "missing"}`);
  }

  const [, outcome, total, confirmed, placeholder, draft, orphans] = match;
  const counts = {
    total: Number(total),
    confirmed: Number(confirmed),
    placeholder: Number(placeholder),
    draft: Number(draft),
    orphans: Number(orphans),
  };
  expect(counts.total).toBe(counts.confirmed + counts.placeholder + counts.draft);
  expect(counts.orphans).toBe(0);
  expect(outcome).toBe(counts.placeholder + counts.draft > 0 ? "violation" : "OK");

  return { result: first, counts };
}

describe("static gates", () => {
  it("wires G1 to deterministic pair + trace lint and fails closed while drafts exist", () => {
    const { result, counts } = expectDeterministicLayerPairSummary("G1", "1");
    expect(counts.draft).toBeGreaterThan(0);
    expect(result.passed).toBe(false);
    expect(result.messages.join("\n")).toContain("g1-pair");
    expect(result.messages.join("\n")).toContain("g1-trace");
  });

  it("wires G3 to deterministic pair + trace lint and fails closed while drafts exist", () => {
    const { result, counts } = expectDeterministicLayerPairSummary("G3", "3");
    expect(counts.draft).toBeGreaterThan(0);
    expect(result.passed).toBe(false);
    expect(result.messages.join("\n")).toContain("g3-pair");
    expect(result.messages.join("\n")).toContain("g3-trace");
  });

  it("wires G2 to a deterministic complete layer pair gate", () => {
    const { result, counts } = expectDeterministicLayerPairSummary("G2", "2");
    expect(counts.placeholder + counts.draft).toBe(0);
    expect(result.passed).toBe(true);
  });

  it("keeps G4 fail-closed while deterministic draft pair evidence exists", () => {
    const { result, counts } = expectDeterministicLayerPairSummary("G4", "4");
    expect(counts.draft).toBeGreaterThan(0);
    expect(result.passed).toBe(false);
  });

  it("keeps G5/G6 fail-closed while deterministic draft pair evidence exists", () => {
    for (const [gate, layer] of [
      ["G5", "5"],
      ["G6", "6"],
    ] as const) {
      const { result, counts } = expectDeterministicLayerPairSummary(gate, layer);
      expect(counts.draft).toBeGreaterThan(0);
      expect(result.passed).toBe(false);
    }
  });

  it("fails a layer pair gate when pair evidence is missing", () => {
    const result = analyzeLayerPairGate(
      [doc("docs/design/harness/L4-basic-design/function.md", "L4", null)],
      "G4",
      "L4",
    );
    expect(result.ok).toBe(false);
    expect(result.orphanPaths).toEqual(["docs/design/harness/L4-basic-design/function.md"]);
  });

  it("fails G2 when the wireframe mock self-pair is missing", () => {
    const result = analyzeLayerPairGate(
      [
        doc(
          "docs/design/harness/L2-screen/screen-list.md",
          "L2",
          "docs/design/harness/L2-screen/wireframe.md",
          "placeholder",
        ),
      ],
      "G2",
      "L2",
    );
    expect(result.ok).toBe(false);
    expect(result.mockMissing).toBe(true);
  });

  it("fails G7 closed when coverage evidence is missing", () => {
    const missing = join(tmpdir(), `missing-${Date.now()}-coverage-summary.json`);
    const result = evaluateStaticGate({
      gate: "G7",
      repoRoot: process.cwd(),
      coverageSummaryPath: missing,
    });
    expect(result.applicable).toBe(true);
    expect(result.passed).toBe(false);
    expect(result.messages.join("\n")).toContain("coverage summary not found");
  });

  it("fails unknown gates closed instead of passing an unregistered check", () => {
    const result = evaluateStaticGate({ gate: "G999", repoRoot: process.cwd() });

    expect(result.applicable).toBe(false);
    expect(result.passed).toBe(false);
    expect(result.messages.join("\n")).toContain("no deterministic check registered");
  });

  it("allows known review-only gates to rely on the review tier", () => {
    for (const gate of ["G0.5", "R4"]) {
      const result = evaluateStaticGate({ gate, repoRoot: process.cwd() });

      expect(result.applicable).toBe(false);
      expect(result.passed).toBe(true);
      expect(result.messages.join("\n")).toContain("review-tier gate");
    }
  });

  it("U-GATE-005: fails closed when a deterministic static check cannot run", () => {
    const result = evaluateStaticGate({
      gate: "G1",
      repoRoot: join(tmpdir(), "missing-gate-root"),
    });

    expect(result.applicable).toBe(true);
    expect(result.passed).toBe(false);
    expect(result.messages.join("\n")).toContain("g1-pair - violation");
    expect(result.messages.join("\n")).toContain("required docs could not be read");
  });

  it("U-GATE-006: reports invalid checklist YAML as a gate failure instead of crashing", () => {
    const dir = mkdtempSync(join(tmpdir(), "helix-checklist-"));
    const checklist = join(dir, "bad-review-checklist.yaml");
    writeFileSync(checklist, "items: [");

    const result = runCli([
      "gate",
      "G4",
      "--mode",
      "codex-only",
      "--checklist",
      checklist,
      "--json",
    ]);

    expect(result.status).toBe(1);
    expect(result.stdout).toContain("review checklist - violation");
    expect(result.stdout).toContain('"passed": false');
    expect(result.stderr).not.toContain("error: script");
  });

  it("rejects coverage below the G7 threshold", () => {
    const dir = mkdtempSync(join(tmpdir(), "helix-coverage-"));
    const summary = join(dir, "coverage-summary.json");
    writeFileSync(summary, JSON.stringify({ total: { lines: { pct: 79.99 } } }));
    const result = readCoverageSummary(summary, 80);
    expect(result.ok).toBe(false);
    expect(result.message).toContain("79.99% < 80%");
  });

  it("accepts coverage at the G7 threshold", () => {
    const dir = mkdtempSync(join(tmpdir(), "helix-coverage-"));
    const summary = join(dir, "coverage-summary.json");
    writeFileSync(summary, JSON.stringify({ total: { lines: { pct: 80 } } }));
    const result = readCoverageSummary(summary, 80);
    expect(result.ok).toBe(true);
    expect(result.message).toContain("80% >= 80%");
  });

  it("keeps gate command docs aligned with static gate implementation", () => {
    const functionDoc = readFileSync(
      join(process.cwd(), "docs", "design", "harness", "L4-basic-design", "function.md"),
      "utf8",
    );
    const gateRow = functionDoc.split(/\r?\n/).find((line) => line.includes("`helix gate <G-ID>`"));
    expect(gateRow).toContain("deterministic static gate");
    expect(gateRow).not.toContain("gate checks 全量は後続");
    expect(gateRow).not.toContain("部分実装");
  });

  it("U-CARRY-019: G7はcarry resultをANDしmessageへ出す (PLAN-L7-430-left-arm-carry-log)", () => {
    const source = readFileSync(join(process.cwd(), "src", "gate", "static.ts"), "utf8");
    expect(source).toContain(
      "const carry = analyzeLeftArmCarryLog(loadLeftArmCarryLogInput(repoRoot))",
    );
    expect(source).toContain("...leftArmCarryLogMessages(carry)");
    expect(source).toContain("impl.ok && oracle.ok && carry.ok && coverage.ok");
  });
});
