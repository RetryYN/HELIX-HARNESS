import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildProviderInvocation } from "../src/runtime/adapter";
import { teamDefinitionSchema } from "../src/schema/team";
import { buildTeamRunPlan } from "../src/team/run";

function touchBinary(path: string): void {
  mkdirSync(join(path, ".."), { recursive: true });
  writeFileSync(path, "");
}

describe("PLAN-L7-318 model override injection hardening", () => {
  it("team schema は provider 風 model override の shell metacharacter を fail-close する", () => {
    for (const model of ["gpt-5.4 & calc", "gpt-$(touch x)", "codex-local|whoami"]) {
      expect(() =>
        teamDefinitionSchema.parse({
          name: "unsafe-team",
          members: [{ role: "se", engine: "codex-se", task: "implement", model }],
        }),
      ).toThrow();
    }
  });

  it("正当な explicit model は team plan から adapter argv まで到達する", () => {
    const team = teamDefinitionSchema.parse({
      name: "safe-team",
      members: [
        { role: "se", engine: "codex-se", task: "implement", model: "gpt-5.4" },
        { role: "tl", engine: "pmo-sonnet", task: "review" },
      ],
    });

    const plan = buildTeamRunPlan(team, "hybrid");

    expect(plan.ok).toBe(true);
    expect(plan.members[0].model_selection).toMatchObject({
      model: "gpt-5.4",
      model_source: "explicit",
    });
    expect(plan.members[0].adapter?.args).toContain("gpt-5.4");
  });

  it("schema を迂回した危険 argv も Windows .cmd shell wrapper が reject する", () => {
    const root = mkdtempSync(join(tmpdir(), "ut-model-override-shell-"));
    try {
      const explicit = join(root, "codex.cmd");
      touchBinary(explicit);

      expect(() =>
        buildProviderInvocation({
          provider: "codex",
          command: "codex",
          args: ["exec", "-m", "gpt-5.4 & calc", "-"],
          opts: {
            platform: "win32",
            env: { SystemRoot: "C:\\Windows", HELIX_CODEX_BIN: explicit },
          },
        }),
      ).toThrow(/unsafe characters/);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
