import { existsSync, mkdtempSync, readFileSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  createLintArtifactWritePort,
  type LintArtifactWriteBoundary,
} from "../src/runtime/lint-artifact-write-port";
import {
  contentDigest,
  type EffectSnapshot,
  effectPayloadDigest,
  type MaterializeIntent,
  materializeLintArtifact,
  paramsDigest,
} from "../src/runtime/lint-effect-executor";

// PLAN-L7-451-lint-effect-port-separation

const sha = (char: string) => `sha256:${char.repeat(64)}` as const;
const snapshot: EffectSnapshot = {
  head: "a".repeat(40),
  worktreeDigest: sha("b"),
  inputsDigest: sha("c"),
};

function intent(): MaterializeIntent {
  const params = { profile: "durability" } as const;
  const value: MaterializeIntent = {
    kind: "materialize",
    operationId: "artifact-write-1",
    capabilityId: "lint.materialize",
    actor: "helix",
    tool: "node-atomic-write",
    target: "evidence/result.json",
    params,
    snapshot,
    idempotencyKey: `artifact-${Math.random()}`,
    expiresAt: "2026-07-15T00:00:00.000Z",
    authorization: {
      issuer: "helix-policy",
      signature: "verified",
      capabilityId: "lint.materialize",
      actor: "helix",
      tool: "node-atomic-write",
      target: "evidence/result.json",
      paramsDigest: paramsDigest(params),
      effectPayloadDigest: sha("e"),
      revocationEpoch: 1,
      expiresAt: "2026-07-15T00:00:00.000Z",
    },
    path: "evidence/result.json",
    beforeDigest: contentDigest(""),
    content: "durable-content",
    contentDigest: contentDigest("durable-content"),
  };
  value.authorization = { ...value.authorization, effectPayloadDigest: effectPayloadDigest(value) };
  return value;
}

function context() {
  const claimed = new Set<string>();
  return {
    snapshotProvider: { observe: () => snapshot },
    trustedIssuers: new Set(["helix-policy"]),
    revocationEpoch: 1,
    idempotency: {
      claim: ({ key }: { key: string }) => {
        if (claimed.has(key)) return "duplicate" as const;
        claimed.add(key);
        return "claimed" as const;
      },
    },
    verifyAuthorization: () => true,
    now: () => "2026-07-14T00:00:00.000Z",
  };
}

describe("PLAN-L7-451 atomic lint artifact write port", () => {
  it("U-SBOUND-016: IT-SBOUND-008 durability境界停止はacceptedにせず、成功時だけ実targetをpublishする", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-lint-artifact-"));
    try {
      const successful = intent();
      const receipt = materializeLintArtifact(
        successful,
        createLintArtifactWritePort({ root }),
        context(),
      );
      expect(receipt).toMatchObject({ status: "accepted", durable: true });
      expect(readFileSync(join(root, successful.path), "utf8")).toBe(successful.content);

      const boundaries: LintArtifactWriteBoundary[] = [
        "after_temp_write",
        "after_temp_fsync",
        "after_rename",
        "after_directory_fsync",
        "after_verify",
      ];
      for (const boundary of boundaries) {
        const faultRoot = mkdtempSync(join(tmpdir(), "helix-lint-artifact-fault-"));
        try {
          const faultIntent = intent();
          const fault = materializeLintArtifact(
            faultIntent,
            createLintArtifactWritePort({
              root: faultRoot,
              hooks: {
                afterBoundary: (current) => {
                  if (current === boundary) throw new Error(`failpoint:${boundary}`);
                },
              },
            }),
            context(),
          );
          expect(fault).toMatchObject({ status: "uncertain", durable: false });
        } finally {
          rmSync(faultRoot, { recursive: true, force: true });
        }
      }
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("rejects a symlinked intermediate directory before publishing outside the evidence root", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-lint-artifact-root-"));
    const outside = mkdtempSync(join(tmpdir(), "helix-lint-artifact-outside-"));
    try {
      symlinkSync(outside, join(root, "evidence"));
      const receipt = materializeLintArtifact(
        intent(),
        createLintArtifactWritePort({ root }),
        context(),
      );
      expect(receipt).toMatchObject({ status: "uncertain", durable: false });
      expect(existsSync(join(outside, "result.json"))).toBe(false);
    } finally {
      rmSync(root, { recursive: true, force: true });
      rmSync(outside, { recursive: true, force: true });
    }
  });
});
