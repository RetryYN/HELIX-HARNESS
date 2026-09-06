import { readFileSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

const source = readFileSync(join(process.cwd(), "tests", "cli-surface.test.ts"), "utf8");

// 出現数ではなく、対象it呼出しの第3引数を検査する。別fixtureの追加は無関係。
function skillWrapperTimeouts(text: string): Array<[string, string | undefined]> {
  const file = ts.createSourceFile("cli-surface.test.ts", text, ts.ScriptTarget.Latest, true);
  const results: Array<[string, string | undefined]> = [];
  function visit(node: ts.Node): void {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === "it" &&
      node.arguments[0] &&
      ts.isStringLiteral(node.arguments[0]) &&
      /^U-CLI-SKILL-DEADLINE-00[12]:/.test(node.arguments[0].text)
    ) {
      results.push([node.arguments[0].text.split(":")[0], node.arguments[2]?.getText(file)]);
    }
    ts.forEachChild(node, visit);
  }
  visit(file);
  return results;
}

describe("CLI surface deadline budget contract", () => {
  it("U-CLI-SKILL-DEADLINE-003: test wrapper remains bounded above the child deadline", () => {
    const child = source.match(/const CLI_CHILD_TIMEOUT_MS = ([\d_]+);/);
    const margin = source.match(
      /const CLI_CHILD_TEST_WRAPPER_TIMEOUT_MS = CLI_CHILD_TIMEOUT_MS \+ ([\d_]+);/,
    );

    expect(child, "child deadline declaration must remain observable").not.toBeNull();
    expect(margin, "wrapper deadline must derive from child deadline").not.toBeNull();
    expect(Number(child?.[1].replaceAll("_", ""))).toBe(45_000);
    expect(Number(margin?.[1].replaceAll("_", ""))).toBeGreaterThan(0);
    expect(skillWrapperTimeouts(source)).toEqual([
      ["U-CLI-SKILL-DEADLINE-001", "CLI_CHILD_TEST_WRAPPER_TIMEOUT_MS"],
      ["U-CLI-SKILL-DEADLINE-002", "CLI_CHILD_TEST_WRAPPER_TIMEOUT_MS"],
    ]);
  });

  it.each([0, 1])("対象case %iのtimeout退行を無関係な定数参照で相殺しない", (index) => {
    let seen = 0;
    const mutated = source.replace(/ {4}CLI_CHILD_TEST_WRAPPER_TIMEOUT_MS,/g, (match) =>
      seen++ === index ? "    1," : match,
    );
    expect(mutated).not.toBe(source);
    const timeouts = skillWrapperTimeouts(`${mutated}\n// CLI_CHILD_TEST_WRAPPER_TIMEOUT_MS`);
    expect(timeouts[index][1]).toBe("1");
    expect(timeouts[1 - index][1]).toBe("CLI_CHILD_TEST_WRAPPER_TIMEOUT_MS");
  });
});
