import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  createSourceAtomizationScrumRequest,
  validateSourceAtomizationScrumJsonLines,
} from "../src/runtime/source-atomization-scrum-worker.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WORKER = join(ROOT, "workers/python/source_atomization_scrum_mode_v1/worker.py");
const PYTHON = process.env.HELIX_TEST_PYTHON ?? "python3";

function fixture() {
  return createSourceAtomizationScrumRequest({
    request_id: "request-001",
    source_id: "scrum-mode",
    markdown: [
      "# Scrum",
      "",
      "- S0 backlog",
      "1. S1 plan",
      "| phase | evidence |",
      "| --- | --- |",
      "| S4 | decision |",
    ].join("\n"),
  });
}

function runWorker(request: unknown) {
  const cwd = mkdtempSync(join(tmpdir(), "helix-python-worker-"));
  try {
    return spawnSync(PYTHON, [WORKER], {
      cwd,
      encoding: "utf8",
      input: `${JSON.stringify(request)}\n`,
      env: { PATH: process.env.PATH ?? "", PYTHONDONTWRITEBYTECODE: "1" },
    });
  } finally {
    rmSync(cwd, { force: true, recursive: true });
  }
}

describe("source_atomization.scrum_mode.v1 proposal worker", () => {
  it("emits deterministic strict JSONL that Node independently revalidates", () => {
    const request = fixture();
    const first = runWorker(request);
    const second = runWorker(request);

    expect(first.status).toBe(0);
    expect(first.stderr).toBe("");
    expect(second.stdout).toBe(first.stdout);
    const validated = validateSourceAtomizationScrumJsonLines(request, first.stdout);
    expect(validated.ok).toBe(true);
    if (validated.ok) {
      expect(validated.proposal.proposal_only).toBe(true);
      expect(validated.proposal.atoms.map((atom) => atom.kind)).toEqual([
        "heading",
        "list_item",
        "list_item",
        "table_row",
        "table_row",
      ]);
    }
  });

  it("rejects authority-bearing input before Python execution", () => {
    const request = { ...fixture(), db_path: "/tmp/harness.db" };
    expect(validateSourceAtomizationScrumJsonLines(request, "")).toEqual({
      ok: false,
      code: "HIL_PYTHON_AUTHORITY_BYPASS",
    });
    const result = runWorker(request);
    expect(result.status).toBe(2);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain("HIL_PYTHON_PLANE_BOUNDARY_INVALID");
  });

  it("rejects modified proposals and incomplete terminal framing", () => {
    const request = fixture();
    const result = runWorker(request);
    const lines = result.stdout.trimEnd().split("\n");
    const proposal = JSON.parse(lines[0]) as Record<string, unknown>;
    proposal.proposal_only = false;
    expect(
      validateSourceAtomizationScrumJsonLines(
        request,
        `${JSON.stringify(proposal)}\n${lines[1]}\n`,
      ),
    ).toEqual({ ok: false, code: "HIL_WORKER_RESULT_SCHEMA_INVALID" });
    expect(validateSourceAtomizationScrumJsonLines(request, `${lines[0]}\n`)).toEqual({
      ok: false,
      code: "HIL_IPC_FAIL_OPEN",
    });
    expect(
      validateSourceAtomizationScrumJsonLines(
        request,
        `${lines[0].replace("{", '{"proposal_only":true,')}\n${lines[1]}\n`,
      ),
    ).toEqual({ ok: false, code: "HIL_WORKER_JSON_INVALID" });
  });

  it("installs a Python audit hook that denies network and filesystem access by default", () => {
    const probe = [
      "import importlib.util, socket",
      `s=importlib.util.spec_from_file_location('worker', ${JSON.stringify(WORKER)})`,
      "m=importlib.util.module_from_spec(s); s.loader.exec_module(m)",
      "m.install_external_io_default_deny()",
      "socket.socket()",
    ].join("; ");
    expect(() =>
      execFileSync(PYTHON, ["-c", probe], {
        cwd: ROOT,
        encoding: "utf8",
        env: { PATH: process.env.PATH ?? "", PYTHONDONTWRITEBYTECODE: "1" },
        stdio: "pipe",
      }),
    ).toThrow(/network is disabled/);

    const fileProbe = [
      "import importlib.util",
      `s=importlib.util.spec_from_file_location('worker', ${JSON.stringify(WORKER)})`,
      "m=importlib.util.module_from_spec(s); s.loader.exec_module(m)",
      "m.install_external_io_default_deny()",
      "open('/tmp/forbidden', 'w')",
    ].join("; ");
    expect(() =>
      execFileSync(PYTHON, ["-c", fileProbe], {
        cwd: ROOT,
        encoding: "utf8",
        env: { PATH: process.env.PATH ?? "", PYTHONDONTWRITEBYTECODE: "1" },
        stdio: "pipe",
      }),
    ).toThrow(/filesystem and child processes are disabled/);
  });
});
