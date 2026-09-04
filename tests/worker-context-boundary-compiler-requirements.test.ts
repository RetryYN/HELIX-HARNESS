import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const requirement = readFileSync(
  "docs/design/helix/L3-requirements/worker-context-boundary-compiler.md",
  "utf8",
);
const acceptance = readFileSync(
  "docs/test-design/helix/worker-context-boundary-compiler-acceptance.md",
  "utf8",
);

describe("worker context boundary compiler requirement authority", () => {
  it("derives execution paths from current capability authority instead of provider or CLI names", () => {
    expect(requirement).toContain("Runtime Capability Registry");
    expect(requirement).toContain("execution pathのexact setを本要件へ固定せず");
    expect(requirement).not.toContain(
      "codex、claude、loop、pair-agent、teamの全`--execute`経路",
    );
  });

  it("isolates retiring surfaces behind one-way compatibility adapters", () => {
    expect(requirement).toContain("current canonical execution pathへの一方向adapter");
    expect(requirement).toContain("独自packet compiler、独自authority、独自fallbackを持たせない");
    expect(acceptance).toContain("legacy surfaceの存続をContext Compiler要件が要求しない");
  });

  it("fails closed for unadmitted runtimes and owns the exact L10 oracle set", () => {
    expect(requirement).toContain("unknown／unadmitted runtime");
    expect(acceptance).toContain("provider invocation 0で拒否する");
    const ids = [...acceptance.matchAll(/\| `WCTX-AC-(\d{3})` \|/gu)].map((match) => match[1]);
    expect(ids).toEqual(Array.from({ length: 16 }, (_, index) => String(index + 1).padStart(3, "0")));
  });
});
