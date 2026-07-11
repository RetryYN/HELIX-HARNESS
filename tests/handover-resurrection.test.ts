import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  analyzeHandoverResurrectionShadowRepo,
  evaluateResurrectionCheckpointState,
  loadGeneratedResurrectionSourceFiles as loadGeneratedResurrectionFiles,
  loadResurrectionCheckpointState,
} from "../src/audit/handover-resurrection-source";
import { checkHandoverResurrection } from "../src/doctor";
import {
  analyzeHandoverResurrection,
  buildResurrectionBaseline,
  deriveResurrectionMode,
  parseGeneratedResurrectionBaselineFile,
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
  it("U-HRET-012: real repoはterminal authorityによりenforce modeでfinding 0", () => {
    const result = analyzeHandoverResurrectionShadowRepo(process.cwd());
    expect(result).toMatchObject({
      ok: true,
      mode: "post_complete_enforce",
      newFindings: [],
      preconditionErrors: [],
    });
    expect(result.knownFindings).toEqual([]);
  });

  it("IT-CONT-03: doctorはshadow baseline外の旧surfaceをhard failする", () => {
    const tempRoot = mkdtempSync(join(tmpdir(), "helix-resurrection-doctor-"));
    const repoRoot = join(tempRoot, "repo");
    try {
      execFileSync("git", ["clone", "-q", "--shared", process.cwd(), repoRoot]);
      for (const name of [
        "handover-generated-resurrection-authority.json",
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

      rmSync(join(repoRoot, "package.json"));
      expect(() => loadGeneratedResurrectionFiles(repoRoot)).toThrow(
        "clean distribution plan is incomplete",
      );
      writeFileSync(
        join(repoRoot, "package.json"),
        readFileSync(join(process.cwd(), "package.json")),
      );

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

  it("U-HRET-012: production modeはcode pinと異なるcomplete authorityをfail-closeする", () => {
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
        approvalDecisionId: `handover-retirement-cutover:${"1".repeat(64)}`,
        approvalStatus: "approved" as const,
      };
      const authorityText = `${JSON.stringify(authority)}\n`;
      writeFileSync(
        join(repoRoot, "config", "handover-retirement-enforce-authority.json"),
        authorityText,
      );
      expect(() => loadResurrectionCheckpointState(repoRoot, preserveDigest)).toThrow(
        "enforce authority pin mismatch",
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

  it("U-HRET-014: 退役governance証跡だけを除外し、類似名とlive/generated再導入はfailする", () => {
    const evidence = analyze(
      [
        {
          path: "docs/governance/session-handover-retirement-disposition.md",
          content: "廃止対象: helix handover / CURRENT.json / HandoverPanel",
        },
        {
          path: "docs/governance/helix-harness-concept_v3.1.md",
          content: "禁止契約: helix handover / CURRENT.json",
        },
        {
          path: "docs/governance/helix-harness-requirements_v1.2.md",
          content: "必須廃止: helix handover / CURRENT.json",
        },
        {
          path: "src/lint/handover-retirement.ts",
          content: 'const retiredPattern = "helix handover";',
        },
      ],
      completeState,
    );
    expect(evidence).toMatchObject({ ok: true, findings: [] });

    const regressions = analyze(
      [
        {
          path: "docs/governance/session-handover-retirement-disposition-copy.md",
          content: "helix handover",
        },
        {
          path: "docs/governance/helix-harness-requirements_v1.2-copy.md",
          content: "helix handover",
        },
        { path: "src/cli.ts", content: 'program.command("handover");' },
        { path: "docs/templates/adapter/AGENTS.md", content: "helix handover" },
        {
          path: "src/lint/handover-retirement.ts",
          content: 'program.command("handover"); const retiredPattern = "helix handover";',
        },
      ],
      completeState,
    );
    expect(regressions.ok).toBe(false);
    expect(regressions.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: "docs/governance/session-handover-retirement-disposition-copy.md",
          category: "generated_surface",
        }),
        expect.objectContaining({ path: "src/cli.ts", category: "command" }),
        expect.objectContaining({
          path: "docs/templates/adapter/AGENTS.md",
          category: "generated_surface",
        }),
        expect.objectContaining({
          path: "src/lint/handover-retirement.ts",
          category: "command",
        }),
      ]),
    );
  });

  it("U-HRET-014: handover接頭辞の保護moduleは旧src/handover importと混同しない", () => {
    const result = analyze(
      [
        {
          path: "src/doctor.ts",
          content:
            'import { scan } from "./lint/handover-resurrection"; import { old } from "./handover";',
        },
      ],
      completeState,
    );
    expect(result.findings.filter((item) => item.category === "module")).toEqual([
      expect.objectContaining({ symbol: "./handover" }),
    ]);
  });

  it("U-HRET-015: retirement metaは役割markerとnegative finding型が一致する場合だけ除外する", () => {
    const evidence = analyze(
      [
        {
          path: "src/audit/handover-resurrection-source.ts",
          content:
            'export function loadGeneratedResurrectionSourceFiles() {}\nthrow new Error("clean distribution resurrection projection is incomplete");\nconst retired = "helix handover";',
        },
        {
          path: "src/lint/handover-cutover-approval.ts",
          content:
            'const HANDOVER_CUTOVER_APPROVAL_PIN = {}; const RETIRED_ARTIFACTS = [".helix/handover/CURRENT.json"]; export function loadAndVerifyHandoverCutoverApproval() {}',
        },
        {
          path: "tests/handover-cutover-approval.test.ts",
          content:
            'it("U-HRET-015", () => { analyzeHandoverResurrectionShadowRepo(); expect({ findings: [] }); }); const retired = "helix handover";',
        },
      ],
      completeState,
    );
    expect(evidence).toMatchObject({ ok: true, findings: [] });

    const regressions = analyze(
      [
        {
          path: "src/audit/handover-resurrection-source.ts",
          content: 'const retired = "helix handover";',
        },
        {
          path: "src/lint/handover-cutover-approval.ts",
          content:
            'const HANDOVER_CUTOVER_APPROVAL_PIN = {}; const RETIRED_ARTIFACTS = []; export function loadAndVerifyHandoverCutoverApproval() {}; program.command("handover");',
        },
        {
          path: "tests/handover-cutover-approval-copy.test.ts",
          content:
            'it("U-HRET-015", () => { analyzeHandoverResurrectionShadowRepo(); expect({ findings: [] }); }); const retired = "helix handover";',
        },
      ],
      completeState,
    );
    expect(regressions.ok).toBe(false);
    expect(regressions.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: "src/audit/handover-resurrection-source.ts",
          category: "generated_surface",
        }),
        expect.objectContaining({
          path: "src/lint/handover-cutover-approval.ts",
          category: "command",
        }),
        expect.objectContaining({
          path: "tests/handover-cutover-approval-copy.test.ts",
          category: "generated_surface",
        }),
      ]),
    );
  });

  it("U-HRET-015: pure lint analyzerへI/O・runtime・audit依存を再混入させない", () => {
    const source = readFileSync("src/lint/handover-resurrection.ts", "utf8");
    const imports = [...source.matchAll(/from\s+["']([^"']+)["']/g)].map((match) => match[1] ?? "");
    expect(imports).not.toEqual(
      expect.arrayContaining([
        "node:child_process",
        "node:fs",
        "../audit/handover-resurrection-source",
        "../runtime/continuation",
        "../runtime/retirement-preserve",
        "../setup",
      ]),
    );
  });

  it("U-HRET-011: fresh/command/distribution projectionの既知debtをseed baselineへ固定する", () => {
    const baseline = parseGeneratedResurrectionBaselineFile(
      readFileSync("config/handover-generated-resurrection-baseline.json", "utf8"),
    );
    const files = loadGeneratedResurrectionFiles(process.cwd());
    expect(files.every((file) => file.path.startsWith("@projection/"))).toBe(true);
    expect(files.some((file) => file.path.startsWith("@projection/brownfield/"))).toBe(true);
    const result = analyzeHandoverResurrection({
      files,
      allowedArtifacts: [],
      baseline,
      checkpointState: shadowState,
    });
    expect(result).toMatchObject({ ok: true, mode: "pre_cutover_shadow", newFindings: [] });
    expect(result.knownFindings).toEqual([]);
    const changed = files.map((file) =>
      file.path === "@projection/fresh/package.json"
        ? { ...file, content: `${file.content}\nHandoverPanel\n` }
        : file,
    );
    expect(
      analyzeHandoverResurrection({
        files: changed,
        allowedArtifacts: [],
        baseline,
        checkpointState: shadowState,
      }).newFindings,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: "@projection/fresh/package.json",
          category: "generated_surface",
        }),
      ]),
    );
  });
});
