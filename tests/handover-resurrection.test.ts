import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { checkHandoverResurrection } from "../src/doctor";
import {
  analyzeHandoverResurrection,
  analyzeHandoverResurrectionShadowRepo,
  buildResurrectionBaseline,
  deriveResurrectionMode,
  evaluateResurrectionCheckpointState,
  loadResurrectionCheckpointState,
  type ResurrectionCheckpointState,
  type ResurrectionFile,
  resurrectionPolicyDigest,
} from "../src/lint/handover-resurrection";

const digest = (value: string): string =>
  `sha256:${createHash("sha256").update(value).digest("hex")}`;
const shadowState: ResurrectionCheckpointState = {
  completeCheckpoint: null,
  expectedOperationId: "retire-1",
  expectedIntentDigest: digest("intent"),
  expectedPreserveDigest: digest("preserve"),
  expectedArchiveDigest: digest("archive"),
};
const completeState: ResurrectionCheckpointState = {
  ...shadowState,
  completeCheckpoint: {
    operationId: "retire-1",
    intentDigest: digest("intent"),
    preserveDigest: digest("preserve"),
    archiveDigest: digest("archive"),
  },
};

function analyze(
  files: ResurrectionFile[],
  state = shadowState,
  baselineFiles: ResurrectionFile[] = [],
) {
  const seed = analyzeHandoverResurrection({
    files: baselineFiles,
    allowedArtifacts: [],
    baseline: buildResurrectionBaseline([]),
    checkpointState: shadowState,
  });
  return analyzeHandoverResurrection({
    files,
    allowedArtifacts: [],
    baseline: buildResurrectionBaseline(seed.findings),
    checkpointState: state,
  });
}

describe("PLAN-L7-416 Sprint 5 handover resurrection shadow detector", () => {
  it("U-HRET-012: real repo shadow baselineは既知findingのみでgreen", () => {
    const result = analyzeHandoverResurrectionShadowRepo(process.cwd());
    expect(result).toMatchObject({
      ok: true,
      mode: "pre_cutover_shadow",
      newFindings: [],
      preconditionErrors: [],
    });
    expect(result.knownFindings.length).toBeGreaterThan(0);
  });

  it("IT-CONT-03: doctorはshadow baseline外の旧surfaceをhard failする", () => {
    const tempRoot = mkdtempSync(join(tmpdir(), "helix-resurrection-doctor-"));
    const repoRoot = join(tempRoot, "repo");
    try {
      execFileSync("git", ["clone", "-q", "--shared", process.cwd(), repoRoot]);
      for (const name of [
        "handover-resurrection-authority.json",
        "handover-preserve-authority.json",
      ]) {
        writeFileSync(
          join(repoRoot, "config", name),
          readFileSync(join(process.cwd(), "config", name), "utf8"),
        );
      }
      writeFileSync(join(repoRoot, "src", "legacy.ts"), 'program.command("handover");\n');

      const result = checkHandoverResurrection(repoRoot);
      expect(result.ok).toBe(false);
      expect(result.messages.join("\n")).toContain("handover-resurrection");
      expect(result.messages.join("\n")).toContain("src/legacy.ts");

      const providerName = readdirSync(join(repoRoot, ".helix", "handover", "provider")).find(
        (name) => name !== "CURRENT.json",
      );
      if (!providerName) throw new Error("provider fixture missing");
      const providerPath = join(".helix", "handover", "provider", providerName);
      rmSync(join(repoRoot, providerPath));
      expect(checkHandoverResurrection(repoRoot).ok).toBe(false);
      writeFileSync(join(repoRoot, providerPath), readFileSync(join(process.cwd(), providerPath)));

      const forged = buildResurrectionBaseline([]);
      writeFileSync(
        join(repoRoot, "config", "handover-resurrection-baseline.json"),
        `${JSON.stringify(
          {
            schemaVersion: "handover-resurrection-baseline.v1",
            policyDigest: resurrectionPolicyDigest(),
            ...forged,
          },
          null,
          2,
        )}\n`,
      );
      expect(checkHandoverResurrection(repoRoot)).toEqual({
        ok: false,
        messages: ["handover-resurrection - violation: detector or baseline could not be read"],
      });
    } finally {
      rmSync(tempRoot, { recursive: true, force: true });
    }
  });
  it("U-HRET-012: command/module/schema/panel/path/writerを型別findingにする", () => {
    const files = [
      { path: "src/commands.ts", content: 'program.command("handover");' },
      {
        path: "src/feature.ts",
        content: 'import { runHandover } from "./handover"; runHandover();',
      },
      { path: "src/schema.ts", content: "export const HandoverSchema = {};" },
      { path: "src/ui.tsx", content: "export function HandoverPanel() { return null; }" },
      { path: "src/handover/index.ts", content: "export const legacy = true;" },
      {
        path: "src/writer.ts",
        content: 'writeFileSync(".helix/handover/CURRENT.json", "{}");',
      },
    ];
    const result = analyze(files);
    expect(result.ok).toBe(false);
    expect(new Set(result.findings.map((item) => item.category))).toEqual(
      new Set([
        "command",
        "module",
        "symbol",
        "schema",
        "panel",
        "path",
        "writer",
        "generated_surface",
      ]),
    );
  });

  it("U-HRET-012: alias/re-export/dynamic import/computed Commander routeを捕捉する", () => {
    const files = [
      { path: "src/a.ts", content: 'export { runHandover as resume } from "./handover";' },
      { path: "src/b.ts", content: 'const legacy = await import("./handover");' },
      { path: "src/c.ts", content: 'const route = "handover"; program["command"](route);' },
    ];
    const result = analyze(files);
    expect(result.ok).toBe(false);
    expect(result.findings.filter((item) => item.category === "module")).toHaveLength(2);
    expect(result.findings.some((item) => item.category === "command")).toBe(true);
  });

  it("U-HRET-011/012: TS generated token、handover subpath、join writerの迂回を捕捉する", () => {
    const result = analyze([
      {
        path: "src/setup/templates.ts",
        content: 'export const generated = "helix handover";',
      },
      { path: "src/lazy.ts", content: 'void import("../handover/index");' },
      {
        path: "src/writer.ts",
        content:
          'const target = join(".helix", "handover", "CURRENT.json"); writeFileSync(target, "{}");',
      },
    ]);
    expect(result.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ category: "generated_surface", path: "src/setup/templates.ts" }),
        expect.objectContaining({ category: "module", path: "src/lazy.ts" }),
        expect.objectContaining({ category: "writer", path: "src/writer.ts" }),
      ]),
    );
  });

  it("U-HRET-012: shadowは既知baselineをtelemetry、新規resurrectionだけをhard failする", () => {
    const known = [{ path: "src/handover/index.ts", content: "export const legacy = true;" }];
    const same = analyze(known, shadowState, known);
    expect(same).toMatchObject({ ok: true, mode: "pre_cutover_shadow" });
    expect(same.knownFindings).toHaveLength(1);
    expect(same.newFindings).toHaveLength(0);
    const added = analyze(
      [...known, { path: "src/new.ts", content: "export const HandoverPanel = 1;" }],
      shadowState,
      known,
    );
    expect(added.ok).toBe(false);
    expect(added.newFindings.length).toBeGreaterThanOrEqual(1);
    expect(
      analyzeHandoverResurrection({
        files: known,
        allowedArtifacts: [],
        baseline: { fingerprints: [], digest: digest("forged") },
        checkpointState: shadowState,
      }).preconditionErrors,
    ).toContain("baseline_digest_invalid");
  });

  it("U-HRET-012: modeはcomplete checkpointとpreserve/archive digestからのみ導出する", () => {
    expect(deriveResurrectionMode(shadowState).mode).toBe("pre_cutover_shadow");
    expect(deriveResurrectionMode(completeState).mode).toBe("post_complete_enforce");
    const checkpoint = completeState.completeCheckpoint;
    if (!checkpoint) throw new Error("complete checkpoint fixture missing");
    expect(
      deriveResurrectionMode({
        ...completeState,
        completeCheckpoint: { ...checkpoint, archiveDigest: digest("bad") },
      }),
    ).toMatchObject({ mode: "invalid_precondition", errors: ["archive_digest_mismatch"] });
  });

  it("U-HRET-012: production modeはPO pinなしのcomplete journalをfail-closeする", () => {
    const repoRoot = mkdtempSync(join(tmpdir(), "helix-resurrection-journal-"));
    try {
      const preserveDigest = digest("preserve-authority");
      expect(
        loadResurrectionCheckpointState(repoRoot, preserveDigest).completeCheckpoint,
      ).toBeNull();
      mkdirSync(join(repoRoot, ".helix", "audit"), { recursive: true });
      mkdirSync(join(repoRoot, "config"), { recursive: true });
      const phases = [
        "prerequisite",
        "shadow_read",
        "memory_primary",
        "legacy_write_disabled",
        "cleanup",
        "complete",
      ] as const;
      const entries = phases.map((phase, index) => {
        const prior = index === 0 ? null : phases[index - 1];
        return {
          runId: "run-1",
          operationId: "retire-1",
          intentDigest: digest("intent-authority"),
          phase,
          status: "completed",
          error: null,
          checkpoint: prior
            ? {
                phase: prior,
                artifactDigests: {
                  backup: digest("backup"),
                  inventory: digest("inventory"),
                  source: digest("source"),
                  target: digest("target"),
                },
              }
            : null,
          backupDigest: digest("backup"),
          inventoryDigest: digest("inventory"),
          sourceCount: 1,
          targetCount: 1,
          sourceDigest: digest("source"),
          targetDigest: digest("target"),
          occurredAt: `2026-07-11T00:0${index}:00Z`,
        };
      });
      const lines = entries.map((entry) => JSON.stringify(entry));
      writeFileSync(
        join(repoRoot, ".helix", "audit", "session-handover-retirement.jsonl"),
        `${lines.join("\n")}\n`,
      );
      const authority = {
        schemaVersion: "handover-resurrection-enforce-authority.v1" as const,
        operationId: "retire-1",
        intentDigest: digest("intent-authority"),
        preserveDigest,
        archiveDigest: digest("archive-authority"),
        journalEntryDigest: digest(lines.at(-1) ?? ""),
        approvalDecisionId: "handover-retirement-enforce:fixture",
        approvalStatus: "approved" as const,
      };
      const authorityText = `${JSON.stringify(authority)}\n`;
      writeFileSync(
        join(repoRoot, "config", "handover-retirement-enforce-authority.json"),
        authorityText,
      );
      expect(() => loadResurrectionCheckpointState(repoRoot, preserveDigest)).toThrow(
        "enforce authority is not code-pinned",
      );
      const journalText = `${lines.join("\n")}\n`;
      expect(
        evaluateResurrectionCheckpointState({
          journalText,
          expectedPreserveDigest: preserveDigest,
          authorityText,
          authorityPin: authority,
        }),
      ).toMatchObject({
        completeCheckpoint: {
          operationId: "retire-1",
          preserveDigest,
          archiveDigest: authority.archiveDigest,
        },
      });
      const postComplete = {
        ...entries.at(-1),
        status: "failed",
        error: "must not append after complete",
        occurredAt: "2026-07-11T00:06:00Z",
      };
      expect(() =>
        evaluateResurrectionCheckpointState({
          journalText: `${journalText}${JSON.stringify(postComplete)}\n`,
          expectedPreserveDigest: preserveDigest,
          authorityText,
          authorityPin: authority,
        }),
      ).toThrow("does not bind terminal checkpoint");
      const badLineAuthority = { ...authority, journalEntryDigest: digest("wrong-line") };
      expect(() =>
        evaluateResurrectionCheckpointState({
          journalText,
          expectedPreserveDigest: preserveDigest,
          authorityText: JSON.stringify(badLineAuthority),
          authorityPin: badLineAuthority,
        }),
      ).toThrow("does not bind terminal checkpoint");
      expect(() =>
        evaluateResurrectionCheckpointState({
          journalText,
          expectedPreserveDigest: digest("preserve-drift"),
          authorityText,
          authorityPin: authority,
        }),
      ).toThrow("does not bind terminal checkpoint");
    } finally {
      rmSync(repoRoot, { recursive: true, force: true });
    }
  });

  it("U-HRET-012: complete後はfinding 1件でもenforce failする", () => {
    const result = analyze(
      [{ path: "src/handover/index.ts", content: "export const legacy = true;" }],
      completeState,
      [{ path: "src/handover/index.ts", content: "export const legacy = true;" }],
    );
    expect(result).toMatchObject({ ok: false, mode: "post_complete_enforce" });
  });

  it("U-HRET-014: typed provider/operations/archiveだけをdigest付きallowlistにする", () => {
    const provider = '{"schema":"provider-handover.v1"}';
    const operations = "# operations";
    const archive = "# historical";
    const files = [
      { path: ".helix/handover/provider/a.json", content: provider },
      { path: "docs/design/harness/L14-operations/a.md", content: operations },
      { path: "docs/archive/handover/a.md", content: archive },
    ];
    const allowedArtifacts = [
      {
        path: files[0].path,
        kind: "provider_evidence" as const,
        digest: digest(provider),
        runtimeReadable: true,
        schemaValid: true,
        continuationJoined: false,
      },
      {
        path: files[1].path,
        kind: "operations_transition" as const,
        digest: digest(operations),
        runtimeReadable: true,
        schemaValid: true,
        continuationJoined: false,
      },
      {
        path: files[2].path,
        kind: "legacy_archive" as const,
        digest: digest(archive),
        runtimeReadable: false,
        schemaValid: true,
        continuationJoined: false,
      },
    ];
    const clean = analyzeHandoverResurrection({
      files,
      allowedArtifacts,
      baseline: buildResurrectionBaseline([]),
      checkpointState: completeState,
    });
    expect(clean.ok).toBe(true);
    expect(
      analyzeHandoverResurrection({
        files,
        allowedArtifacts: [
          ...allowedArtifacts.slice(0, 2),
          { ...allowedArtifacts[2], runtimeReadable: true },
        ],
        baseline: buildResurrectionBaseline([]),
        checkpointState: completeState,
      }).preconditionErrors,
    ).toContain(`allowlist_invalid:${files[2].path}`);
    expect(
      analyzeHandoverResurrection({
        files,
        allowedArtifacts: allowedArtifacts.map((item, index) =>
          index === 0 ? { ...item, digest: digest("spoof") } : item,
        ),
        baseline: buildResurrectionBaseline([]),
        checkpointState: completeState,
      }).preconditionErrors,
    ).toContain(`allowlist_digest_mismatch:${files[0].path}`);
    expect(
      analyzeHandoverResurrection({
        files: [{ path: "src/handover/index.ts", content: provider }],
        allowedArtifacts: [{ ...allowedArtifacts[0], path: "src/handover/index.ts" }],
        baseline: buildResurrectionBaseline([]),
        checkpointState: completeState,
      }).preconditionErrors,
    ).toContain("allowlist_invalid:src/handover/index.ts");
    expect(
      analyzeHandoverResurrection({
        files: [...files, { path: ".helix/handover/provider/extra.json", content: "{}" }],
        allowedArtifacts,
        baseline: buildResurrectionBaseline([]),
        checkpointState: completeState,
      }).findings.some((item) => item.category === "unclassified"),
    ).toBe(true);
    expect(
      analyzeHandoverResurrection({
        files: files.map((file, index) =>
          index === 1 ? { ...file, content: "helix handover" } : file,
        ),
        allowedArtifacts: allowedArtifacts.map((item, index) =>
          index === 1 ? { ...item, digest: digest("helix handover") } : item,
        ),
        baseline: buildResurrectionBaseline([]),
        checkpointState: completeState,
      }).findings.some((item) => item.category === "generated_surface"),
    ).toBe(true);
  });

  it("U-HRET-011: generated setup/task/CI/distribution surfaceの旧tokenを全て検出する", () => {
    const files = [
      { path: "docs/templates/AGENTS.md", content: "helix handover" },
      { path: ".vscode/tasks.json", content: "handover status" },
      { path: ".github/workflows/ci.yml", content: ".helix/handover/CURRENT.json" },
      { path: "dist/template.json", content: "HandoverPanel" },
    ];
    const result = analyze(files);
    expect(result.ok).toBe(false);
    expect(result.findings.filter((item) => item.category === "generated_surface")).toHaveLength(4);
  });
});
