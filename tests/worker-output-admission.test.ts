import { describe, expect, it } from "vitest";
import { canonicalJson, sha256Digest } from "../src/runtime/digest";
import {
  admitWorkerOutput,
  formatWorkerOutputContract,
  isWorkerValidatedOutput,
  readValidatedWorkerPayload,
  WORKER_PROPOSAL_OUTPUT_SCHEMA_DIGEST,
} from "../src/runtime/worker-output-admission";

// PLAN-L7-501-worker-output-admission
describe("WCC-FR-05 worker output admission", () => {
  const descriptorDigest = sha256Digest("descriptor");
  const binding = {
    descriptor_digest: descriptorDigest,
    output_schema_digest: WORKER_PROPOSAL_OUTPUT_SCHEMA_DIGEST,
  };

  function output(summary = "validated proposal") {
    const payload = {
      proposal_only: true,
      schema_version: "helix-worker-proposal.v1",
      summary,
    };
    return canonicalJson({
      descriptor_digest: descriptorDigest,
      output_schema_digest: WORKER_PROPOSAL_OUTPUT_SCHEMA_DIGEST,
      payload,
      payload_digest: sha256Digest(canonicalJson(payload)),
      schema_version: "helix-worker-output-envelope.v1",
    });
  }

  it("U-WOA-001: known strict schemaとwrapper input contractを固定する", () => {
    expect(WORKER_PROPOSAL_OUTPUT_SCHEMA_DIGEST).toMatch(/^sha256:[a-f0-9]{64}$/u);
    expect(
      formatWorkerOutputContract(WORKER_PROPOSAL_OUTPUT_SCHEMA_DIGEST, `sha256:${"a".repeat(64)}`),
    ).toContain("helix-worker-output-contract.v1");
    expect(formatWorkerOutputContract(sha256Digest("unknown"), descriptorDigest)).toBe("");
  });

  it("U-WOA-002: canonical envelopeだけをsealed outputへ昇格する", () => {
    const result = admitWorkerOutput(Buffer.from(output()), binding);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(isWorkerValidatedOutput(result.output)).toBe(true);
    expect(readValidatedWorkerPayload(result.output)).toBe(
      canonicalJson({
        proposal_only: true,
        schema_version: "helix-worker-proposal.v1",
        summary: "validated proposal",
      }),
    );
    expect(isWorkerValidatedOutput({ ...result.output })).toBe(false);
    expect(
      readValidatedWorkerPayload({ ...result.output } as typeof result.output),
    ).toBeUndefined();
  });

  it("U-WOA-003: unknown key、literal/type/constraint違反をfail-closeする", () => {
    for (const mutate of [
      (value: Record<string, unknown>) => ({ ...value, unknown: true }),
      (value: Record<string, unknown>) => ({ ...value, schema_version: "wrong" }),
      (value: Record<string, unknown>) => ({ ...value, payload: [] }),
      (value: Record<string, unknown>) => ({
        ...value,
        payload: { proposal_only: false, schema_version: "helix-worker-proposal.v1", summary: "x" },
      }),
      (value: Record<string, unknown>) => ({
        ...value,
        payload: { proposal_only: true, schema_version: "helix-worker-proposal.v1", summary: "" },
      }),
    ]) {
      const changed = mutate(JSON.parse(output()) as Record<string, unknown>);
      expect(admitWorkerOutput(canonicalJson(changed), binding)).toEqual({
        ok: false,
        failure_code: "WORKER_OUTPUT_SCHEMA_INVALID",
      });
    }
  });

  it("U-WOA-004: digest driftとunknown schemaを拒否する", () => {
    const parsed = JSON.parse(output()) as Record<string, unknown>;
    expect(
      admitWorkerOutput(
        canonicalJson({ ...parsed, descriptor_digest: sha256Digest("foreign") }),
        binding,
      ),
    ).toEqual({ ok: false, failure_code: "WORKER_OUTPUT_DIGEST_MISMATCH" });
    expect(
      admitWorkerOutput(
        canonicalJson({ ...parsed, payload_digest: sha256Digest("forged") }),
        binding,
      ),
    ).toEqual({ ok: false, failure_code: "WORKER_OUTPUT_DIGEST_MISMATCH" });
    expect(
      admitWorkerOutput(output(), { ...binding, output_schema_digest: sha256Digest("unknown") }),
    ).toEqual({ ok: false, failure_code: "WORKER_OUTPUT_SCHEMA_UNRESOLVED" });
  });

  it("U-WOA-005: oversize、invalid UTF-8、非canonical JSONを拒否する", () => {
    expect(admitWorkerOutput(Buffer.alloc(1024 * 1024 + 1, 0x61), binding)).toEqual({
      ok: false,
      failure_code: "WORKER_OUTPUT_OVERSIZE",
    });
    expect(admitWorkerOutput(Buffer.from([0xc3, 0x28]), binding)).toEqual({
      ok: false,
      failure_code: "WORKER_OUTPUT_UTF8_INVALID",
    });
    expect(
      admitWorkerOutput(
        Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from(output())]),
        binding,
      ),
    ).toEqual({ ok: false, failure_code: "WORKER_OUTPUT_NONCANONICAL" });
    for (const raw of [
      `${output()}\n`,
      JSON.stringify(JSON.parse(output()), null, 2),
      '{"schema_version":"helix-worker-output-envelope.v1","schema_version":"helix-worker-output-envelope.v1"}',
      output().replace('"proposal_only":true', '"proposal_only":true '),
    ]) {
      expect(admitWorkerOutput(raw, binding)).toEqual({
        ok: false,
        failure_code: "WORKER_OUTPUT_NONCANONICAL",
      });
    }
  });

  it("U-WOA-006: lexical depthとnode countをboundedにする", () => {
    const tooDeep = `${"[".repeat(65)}null${"]".repeat(65)}`;
    expect(admitWorkerOutput(tooDeep, binding)).toEqual({
      ok: false,
      failure_code: "WORKER_OUTPUT_OVERSIZE",
    });
    const tooMany = `[${new Array(4_098).fill("null").join(",")}]`;
    expect(admitWorkerOutput(tooMany, binding)).toEqual({
      ok: false,
      failure_code: "WORKER_OUTPUT_OVERSIZE",
    });
  });
});
