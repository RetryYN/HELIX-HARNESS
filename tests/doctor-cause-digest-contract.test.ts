import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";
import { doctorFailure, doctorFailureMessage } from "../src/doctor/failure";
import { checkDocumentAgentMetadata, checkReviewEvidence } from "../src/doctor/index";
import { sha256Digest } from "../src/runtime/digest";

function anonymousCatchOwnerDigest(source: string): { count: number; digest: string } {
  const file = ts.createSourceFile("src/doctor/index.ts", source, ts.ScriptTarget.Latest, true);
  const owners: string[] = [];
  const owner = (node: ts.Node): string => {
    for (let current = node.parent; current; current = current.parent) {
      if (
        (ts.isFunctionDeclaration(current) ||
          ts.isMethodDeclaration(current) ||
          ts.isVariableDeclaration(current)) &&
        current.name
      ) {
        return current.name.getText(file);
      }
    }
    return "module";
  };
  const visit = (node: ts.Node): void => {
    if (ts.isCatchClause(node) && !node.variableDeclaration) owners.push(owner(node));
    ts.forEachChild(node, visit);
  };
  visit(file);
  const counts = [...new Set(owners)]
    .sort()
    .map((name) => [name, owners.filter((ownerName) => ownerName === name).length]);
  return { count: owners.length, digest: sha256Digest(JSON.stringify(counts)) };
}

describe("PLAN-L7-449 doctor failure contract (IT-DUR-001)", () => {
  it("U-DUR-003: emits only allowlisted identity, reason, and finite cause metadata", () => {
    const raw = "/home/alice/private token=secret SELECT password FROM users";
    const failure = doctorFailure("digest-inventory", "read_failed", new Error(raw));
    const message = doctorFailureMessage(failure);
    expect(message).toContain("reason=read_failed");
    expect(message).toContain("cause_kind=error");
    expect(message).toMatch(/cause_digest=sha256:[a-f0-9]{64}$/);
    expect(message).not.toContain(raw);
    expect(doctorFailure("../../unsafe", "check_failed", raw).checkId).toBe("invalid-check-id");
    expect(doctorFailureMessage(doctorFailure("../../secret", "check_failed", raw))).not.toContain(
      "../../secret",
    );
  });

  it("U-DUR-003: ratchets doctor raw-cause exposure and anonymous catches", () => {
    const source = readFileSync(join(process.cwd(), "src", "doctor", "index.ts"), "utf8");
    expect(source).not.toMatch(/String\((?:error|cause|err)\)/);
    expect(source).not.toMatch(/\$\{(?:error|cause|err)\}/);
    expect(source).not.toMatch(/(?:error|cause|err)\.(?:message|stack)/);
    expect(anonymousCatchOwnerDigest(source)).toEqual({
      count: 134,
      digest: "sha256:4dd4a8b657c9214fd3441ef95cd578093e710b95c6cdbfc230707ce20904727b",
    });
  });

  it("U-DUR-003: document metadata loader failureを有限causeへ変換してlocal pathを露出しない", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-doctor-private-root-"));
    try {
      const result = checkDocumentAgentMetadata(root);
      expect(result.ok).toBe(false);
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0]).toMatch(
        /^document-agent-metadata - violation: check failed cause_kind=error cause_digest=sha256:[a-f0-9]{64}$/,
      );
      expect(result.messages[0]).not.toContain(root);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  // PLAN-RECOVERY-1543-reviewer-session-model-history — U-RVIDENT-018
  it("U-RVIDENT-018: reviewer session model history の未知例外は cause-digest だけを surface し raw message を露出しない", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-doctor-history-root-"));
    try {
      mkdirSync(join(root, "docs", "plans"), { recursive: true });
      mkdirSync(join(root, "docs", "governance"), { recursive: true });
      const registry = join(root, "docs", "governance", "reviewer-session-model-history.json");
      // JSON.parse の SyntaxError（未知例外）→ typed reason ではなく cause-digest 境界へ。
      writeFileSync(registry, "{ not json /home/alice/private", "utf8");
      const unknown = checkReviewEvidence(root);
      expect(unknown.ok).toBe(false);
      const line = unknown.messages.find((m) =>
        m.includes("reviewer_session_model_history_invalid"),
      );
      expect(line).toMatch(
        /reviewer_session_model_history_invalid:unknown cause_kind=[a-z_]+ cause_digest=sha256:[a-f0-9]{64}/,
      );
      expect(line).not.toContain(root);
      expect(line).not.toContain("Unexpected token");
      expect(line).not.toContain("/home/alice");
      // 既知 schema 診断は有限な locator 付き reason をそのまま surface する。
      writeFileSync(registry, JSON.stringify({ schema_version: "bogus", sessions: [] }), "utf8");
      const known = checkReviewEvidence(root);
      expect(known.ok).toBe(false);
      expect(
        known.messages.some((m) =>
          m.includes("reviewer_session_model_history_invalid:schema_version"),
        ),
      ).toBe(true);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
