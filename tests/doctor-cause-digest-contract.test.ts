import { readFileSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";
import { doctorFailure, doctorFailureMessage } from "../src/doctor/failure";
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

describe("PLAN-L7-449 doctor failure contract", () => {
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
      count: 127,
      digest: "sha256:9ad1dbe3da484413684c10e05b577a524f674b3d45adfa94c26b11136fa7f730",
    });
  });
});
