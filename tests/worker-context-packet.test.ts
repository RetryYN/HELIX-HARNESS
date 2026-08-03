import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import { sha256Digest } from "../src/runtime/digest";
import {
  attestWorkerContextAuthority,
  compileWorkerContextPacket,
  isWorkerContextPacketCapability,
  reattestWorkerContextAuthority,
  verifyWorkerContextEnvelope,
  type WorkerContextBoundary,
} from "../src/runtime/worker-context-packet";

// PLAN-L7-503-worker-context-authority

const AUTHORITY_PATHS = [
  "docs/governance/helix-harness-requirements_v1.3.md",
  "docs/governance/l12-canonical-vmodel-direction-directive_v0.1.md",
  "docs/design/helix/L3-requirements/worker-common-contract.md",
] as const;
const RULE_PATHS = ["AGENTS.md", "CLAUDE.md", "docs/skills/judgment-core.md"] as const;

function currentHead(): string {
  return execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
}

function authority(paths: readonly string[] = AUTHORITY_PATHS) {
  const result = attestWorkerContextAuthority({
    repo_root: process.cwd(),
    current_head: currentHead(),
    authority_paths: paths,
    rule_paths: RULE_PATHS,
  });
  if (!("kind" in result)) throw new Error(result.failure_code);
  return result;
}

function boundary(overrides: Partial<WorkerContextBoundary> = {}): WorkerContextBoundary {
  return {
    goal_id: "goal:feature-92",
    workflow_style: "v_model",
    case_model: "none",
    specialist_process: "none",
    behavior_contract_id: "WCC-FR-09",
    responsibility_owner: "worker-context-authority",
    allowed_paths: ["src/runtime/worker-context-packet.ts"],
    forbidden_paths: [".helix", "harness.db"],
    severity_policy_digest: sha256Digest("severity-policy"),
    required_output_schema: sha256Digest("worker-output-schema"),
    budget: { time_ms: 60_000, token_limit: 8_000 },
    ...overrides,
  };
}

function authorityRepo(): { root: string; head: string } {
  const root = mkdtempSync(join(tmpdir(), "helix-worker-context-"));
  for (const path of [...AUTHORITY_PATHS, ...RULE_PATHS]) {
    mkdirSync(join(root, dirname(path)), { recursive: true });
    writeFileSync(join(root, path), `${path}\n`);
  }
  execFileSync("git", ["init", "-q"], { cwd: root });
  execFileSync("git", ["config", "user.email", "fixture@example.invalid"], { cwd: root });
  execFileSync("git", ["config", "user.name", "Fixture"], { cwd: root });
  execFileSync("git", ["add", "."], { cwd: root });
  execFileSync("git", ["commit", "-qm", "fixture"], { cwd: root });
  return {
    root,
    head: execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim(),
  };
}

describe("WCC-FR-09 worker context packet", () => {
  it("U-WCP-001: current authorityとrule bytesをexact HEADへ束縛する", () => {
    const attested = authority();
    expect(attested.current_head).toBe(currentHead());
    expect(attested.authority_digest).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(attested.effective_rule_packet_digest).toMatch(/^sha256:[a-f0-9]{64}$/);
  });

  it("U-WCP-002: compatibility authorityとHEAD driftをfail-closeする", () => {
    expect(
      attestWorkerContextAuthority({
        repo_root: process.cwd(),
        current_head: "0".repeat(40),
        authority_paths: AUTHORITY_PATHS,
        rule_paths: RULE_PATHS,
      }),
    ).toEqual({ ok: false, failure_code: "WORKER_CONTEXT_HEAD_DRIFT" });
    expect(
      attestWorkerContextAuthority({
        repo_root: process.cwd(),
        current_head: currentHead(),
        authority_paths: ["docs/governance/helix-harness-requirements_v1.2.md"],
        rule_paths: RULE_PATHS,
      }),
    ).toEqual({ ok: false, failure_code: "WORKER_CONTEXT_COMPATIBILITY_AUTHORITY" });
  });

  it("U-WCP-003: packet exact schema・三軸・scope・有限budgetを検証する", () => {
    const valid = compileWorkerContextPacket({
      authority: authority(),
      boundary: boundary(),
      role: "se",
      task: "設計とテストを実装する",
      payload: "provider-neutral payload",
    });
    expect(valid.ok).toBe(true);
    if (!valid.ok) return;
    expect(Object.keys(valid.packet).sort()).toEqual([
      "allowed_paths",
      "authority_digest",
      "behavior_contract_id",
      "budget",
      "case_model",
      "current_head",
      "effective_rule_packet_digest",
      "forbidden_paths",
      "goal_id",
      "payload_digest",
      "required_output_schema",
      "responsibility_owner",
      "role_judgment_digest",
      "schema_version",
      "severity_policy_digest",
      "specialist_process",
      "task_lens_digest",
      "workflow_style",
    ]);
    expect(isWorkerContextPacketCapability(valid.capability)).toBe(true);
    expect(isWorkerContextPacketCapability({ ...valid.capability })).toBe(false);

    expect(
      compileWorkerContextPacket({
        authority: authority(),
        boundary: boundary({ allowed_paths: ["src"], forbidden_paths: ["src/runtime"] }),
        role: "se",
        task: "implement",
        payload: "payload",
      }),
    ).toEqual({ ok: false, failure_code: "WORKER_CONTEXT_SCOPE_INVALID" });
    expect(
      compileWorkerContextPacket({
        authority: authority(),
        boundary: boundary({ budget: { time_ms: 0, token_limit: 8_000 } }),
        role: "se",
        task: "implement",
        payload: "payload",
      }),
    ).toEqual({ ok: false, failure_code: "WORKER_CONTEXT_BUDGET_UNRESOLVED" });
  });

  it("U-WCP-004: actual payload・role・task・HEAD driftを到達可能なfailureで拒否する", () => {
    const compiled = compileWorkerContextPacket({
      authority: authority(),
      boundary: boundary(),
      role: "reviewer",
      task: "設計を検証する",
      payload: "payload-A",
    });
    expect(compiled.ok).toBe(true);
    if (!compiled.ok) return;
    expect(
      verifyWorkerContextEnvelope(compiled.capability, compiled.envelope, {
        current_head: currentHead(),
        role: "reviewer",
        task: "設計を検証する",
        required_output_schema: boundary().required_output_schema,
      }),
    ).toEqual({ ok: true, packet: compiled.packet });
    expect(
      verifyWorkerContextEnvelope(compiled.capability, `${compiled.envelope}x`, {
        current_head: currentHead(),
        role: "reviewer",
        task: "設計を検証する",
        required_output_schema: boundary().required_output_schema,
      }),
    ).toEqual({ ok: false, failure_code: "WORKER_CONTEXT_PAYLOAD_DIGEST_MISMATCH" });
    expect(
      verifyWorkerContextEnvelope(compiled.capability, compiled.envelope, {
        current_head: currentHead(),
        role: "se",
        task: "設計を検証する",
        required_output_schema: boundary().required_output_schema,
      }),
    ).toEqual({ ok: false, failure_code: "WORKER_CONTEXT_ROLE_JUDGMENT_MISMATCH" });
    expect(
      verifyWorkerContextEnvelope(compiled.capability, compiled.envelope, {
        current_head: currentHead(),
        role: "reviewer",
        task: "noop",
        required_output_schema: boundary().required_output_schema,
      }),
    ).toEqual({ ok: false, failure_code: "WORKER_CONTEXT_TASK_LENS_MISMATCH" });
  });

  it("U-WCP-005: plain copyとoutput schema driftを拒否する", () => {
    const compiled = compileWorkerContextPacket({
      authority: authority(),
      boundary: boundary(),
      role: "se",
      task: "implement",
      payload: "payload",
    });
    expect(compiled.ok).toBe(true);
    if (!compiled.ok) return;
    expect(
      verifyWorkerContextEnvelope({ ...compiled.capability }, compiled.envelope, {
        current_head: currentHead(),
        role: "se",
        task: "implement",
        required_output_schema: boundary().required_output_schema,
      }),
    ).toEqual({ ok: false, failure_code: "WORKER_CONTEXT_UNSEALED" });
    expect(
      verifyWorkerContextEnvelope(compiled.capability, compiled.envelope, {
        current_head: currentHead(),
        role: "se",
        task: "implement",
        required_output_schema: sha256Digest("other-output-schema"),
      }),
    ).toEqual({ ok: false, failure_code: "WORKER_CONTEXT_OUTPUT_SCHEMA_MISMATCH" });
  });

  it("U-WCP-006: canonical authority集合を解決できない場合は拒否する", () => {
    expect(
      attestWorkerContextAuthority({
        repo_root: process.cwd(),
        current_head: currentHead(),
        authority_paths: [],
        rule_paths: RULE_PATHS,
      }),
    ).toEqual({ ok: false, failure_code: "WORKER_CONTEXT_AUTHORITY_UNRESOLVED" });
  });

  it("U-WCP-007: effective rule集合を解決できない場合は拒否する", () => {
    expect(
      attestWorkerContextAuthority({
        repo_root: process.cwd(),
        current_head: currentHead(),
        authority_paths: AUTHORITY_PATHS,
        rule_paths: [],
      }),
    ).toEqual({ ok: false, failure_code: "WORKER_CONTEXT_RULE_PACKET_UNRESOLVED" });
  });

  it("U-WCP-008: digest schema不正をpacketへ昇格しない", () => {
    expect(
      compileWorkerContextPacket({
        authority: authority(),
        boundary: boundary({ severity_policy_digest: "invalid" as never }),
        role: "se",
        task: "implement",
        payload: "payload",
      }),
    ).toEqual({ ok: false, failure_code: "WORKER_CONTEXT_SCHEMA_INVALID" });
  });

  it("U-WCP-009: development styleとcase modelの語彙混同を拒否する", () => {
    expect(
      compileWorkerContextPacket({
        authority: authority(),
        boundary: boundary({ workflow_style: "poc" as never }),
        role: "se",
        task: "implement",
        payload: "payload",
      }),
    ).toEqual({ ok: false, failure_code: "WORKER_CONTEXT_AXES_INVALID" });
  });

  it("U-WCP-010: compile前後のauthority/rule dirty driftをHEAD blob照合で拒否する", () => {
    const fixture = authorityRepo();
    try {
      const request = {
        repo_root: fixture.root,
        current_head: fixture.head,
        authority_paths: AUTHORITY_PATHS,
        rule_paths: RULE_PATHS,
      } as const;
      const sealed = attestWorkerContextAuthority(request);
      expect("kind" in sealed).toBe(true);
      if (!("kind" in sealed)) return;
      const authorityPath = join(fixture.root, AUTHORITY_PATHS[0]);
      const authorityBytes = readFileSync(authorityPath);
      writeFileSync(authorityPath, Buffer.concat([authorityBytes, Buffer.from("dirty\n")]));
      expect(attestWorkerContextAuthority(request)).toEqual({
        ok: false,
        failure_code: "WORKER_CONTEXT_AUTHORITY_UNRESOLVED",
      });
      expect(reattestWorkerContextAuthority(sealed)).toEqual({
        ok: false,
        failure_code: "WORKER_CONTEXT_AUTHORITY_UNRESOLVED",
      });

      writeFileSync(authorityPath, authorityBytes);
      const rulePath = join(fixture.root, RULE_PATHS[0]);
      writeFileSync(rulePath, `${readFileSync(rulePath, "utf8")}dirty\n`);
      expect(reattestWorkerContextAuthority(sealed)).toEqual({
        ok: false,
        failure_code: "WORKER_CONTEXT_RULE_PACKET_UNRESOLVED",
      });
    } finally {
      rmSync(fixture.root, { recursive: true, force: true });
    }
  });
});
