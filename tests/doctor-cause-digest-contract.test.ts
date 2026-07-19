import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";
import { doctorFailure, doctorFailureMessage } from "../src/doctor/failure";
import { checkDocumentAgentMetadata } from "../src/doctor/index";
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
      count: 131,
      digest: "sha256:ba1a2a0ec3909b7456deb3651837d7ef79e9065b315a03ef1cec4a6f0a5b6095",
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
});
