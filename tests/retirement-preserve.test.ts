import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readProviderHandoverCurrent } from "../src/runtime/provider-handover";
import {
  archiveManifestDigest,
  assertContinuationSourceBoundary,
  buildArchiveManifest,
  buildPreserveManifest as buildPreserveManifestWithContext,
  canDeleteArchivedSources,
  collectOperationsTransitionPaths,
  collectPreserveManifest,
  collectRetirementPreserveInventory,
  evaluatePreserveIntegrity,
  evaluatePreservePhaseBinding,
  evaluatePreservePhaseExit,
  exportPreserveCollection,
  exportPreserveManifest,
  type PreserveArtifactInput,
  preserveQueryOutput,
  queryPreserveManifest,
  retirementPreserveInventoryDigest,
  validateOperationsTransitionMarkdown,
  validateProviderEvidenceJson,
  verifyProviderPointer,
} from "../src/runtime/retirement-preserve";

const digest = (char: string): string => `sha256:${char.repeat(64)}`;
const capturedAt = "2026-07-11T00:00:00Z";
const buildPreserveManifest = (inputs: readonly PreserveArtifactInput[]) =>
  buildPreserveManifestWithContext(inputs, {
    operationId: "preserve:PLAN-L7-416:sprint4",
    intentDigest: digest("9"),
    capturedAt,
    sourceRevision: "929975c5",
    retirementPhase: "shadow_read",
  });
const validProvider = JSON.stringify({
  schema_version: "provider-handover.v1",
  handover_kind: "mechanical",
  handover_id: "provider-1",
  from: "codex",
  to: "claude",
  active_plan: "PLAN-L7-416",
  budget: null,
  context: { summary: "audit", next_actions: [], files: [] },
  created_at: capturedAt,
});
const validOperations = `---
title: "Operations transition"
layer: L14
kind: design
status: confirmed
owner: Codex
retention_policy: operations-governance
retention_authority: operations-governance
retention_mode: indefinite
---
# Operations
`;
function probe(version: string, resultCount = 1) {
  return {
    ok: true,
    validatorOrCommand: "helix preserve probe",
    schemaOrQueryVersion: version,
    checkedAt: capturedAt,
    exitCode: 0,
    resultCount,
    outputDigest: digest("a"),
    evidencePath: ".helix/evidence/retirement/preserve-probe.json",
  };
}

function input(
  path: string,
  kind: PreserveArtifactInput["kind"],
  content: string,
): PreserveArtifactInput {
  return {
    path,
    kind,
    artifactId: `${kind}:${path}`,
    role:
      kind === "operations_transition"
        ? "operations_design"
        : path.endsWith("/CURRENT.json")
          ? "current_pointer"
          : "evidence",
    content,
    mode: 0o644,
    tracked: kind === "operations_transition",
    symlink: false,
    provenance: {
      sourceCommit: "929975c5",
      capturedAt,
      collector: "PLAN-L7-416-sprint4",
      originalPath: path,
      sourceKind: kind === "provider_evidence" ? "provider_runtime" : "authored_design",
      sourceId: path,
      owner: kind === "provider_evidence" ? "runtime-audit" : "operations-governance",
      revision: "929975c5",
      createdAt: capturedAt,
    },
    schemaValidation: probe(
      kind === "provider_evidence" ? "provider-handover.v1" : "operations-markdown.v1",
    ),
    query: { ...probe("preserve-query.v1"), outputDigest: digest("b") },
    export: { ...probe("preserve-export.v1"), outputDigest: digest("c") },
    retention: {
      policyId: kind === "provider_evidence" ? "provider-audit" : "operations-governance",
      authority: kind === "provider_evidence" ? "runtime-audit" : "operations-governance",
      mode: "indefinite",
      retainUntil: null,
      legalHold: false,
    },
  };
}

describe("PLAN-L7-416 Sprint 4 preserve/archive integrity", () => {
  it("U-HRET-008: real provider packageとL11/L14 operations artifactをtyped manifest化する", () => {
    const providerRoot = ".helix/handover/provider";
    const providerPaths = readdirSync(providerRoot)
      .filter((name) => name.endsWith(".json"))
      .map((name) => `${providerRoot}/${name}`)
      .sort();
    expect(providerPaths).toHaveLength(10);
    const inventory = collectRetirementPreserveInventory(process.cwd());
    expect(inventory.providerPaths).toEqual(expect.arrayContaining(providerPaths));
    expect(Array.isArray(inventory.operationsPaths)).toBe(true);
    expect(Array.isArray(inventory.archiveSourcePaths)).toBe(true);
    expect(inventory.operationsPaths).toHaveLength(4);
    expect(inventory.archiveSourcePaths).toEqual([]);
    const provider = readProviderHandoverCurrent({
      repoRoot: process.cwd(),
      readText: (path) => readFileSync(path, "utf8"),
    });
    expect(provider?.schema_version).toBe("provider-handover.v1");

    const operationsPaths = [
      "docs/design/harness/L11-uat/uat-evidence-boundary.md",
      "docs/design/harness/L14-operations/operations-feedback-boundary.md",
      "docs/design/helix/L11-uat/uat-evidence-boundary.md",
      "docs/design/helix/L14-operations/operations-feedback-boundary.md",
    ];
    expect(
      providerPaths.every((path) => validateProviderEvidenceJson(readFileSync(path, "utf8")).valid),
    ).toBe(true);
    expect(
      operationsPaths.every(
        (path) => validateOperationsTransitionMarkdown(readFileSync(path, "utf8")).valid,
      ),
    ).toBe(true);
    const manifest = collectPreserveManifest(
      process.cwd(),
      [
        ...providerPaths.map((path) => ({
          path,
          kind: "provider_evidence" as const,
          role: path.endsWith("/CURRENT.json")
            ? ("current_pointer" as const)
            : ("evidence" as const),
          retention: {
            policyId: "provider-audit",
            authority: "runtime-audit",
            mode: "indefinite" as const,
            retainUntil: null,
            legalHold: false,
          },
          owner: "runtime-audit",
        })),
        ...operationsPaths.map((path) => ({
          path,
          kind: "operations_transition" as const,
          role: "operations_design" as const,
          retention: {
            policyId: "operations-governance",
            authority: "operations-governance",
            mode: "indefinite" as const,
            retainUntil: null,
            legalHold: false,
          },
          owner: "operations-governance",
        })),
      ],
      {
        operationId: "preserve:real-repo",
        intentDigest: digest("8"),
        capturedAt,
        retirementPhase: "shadow_read",
      },
    );
    expect(manifest.countByKind).toEqual({
      provider_evidence: 10,
      operations_transition: 4,
    });
    expect(manifest.physicalCount).toBe(14);
    expect(manifest.logicalCount).toBe(13);
    expect(manifest.countByRole).toEqual({
      evidence: 9,
      current_pointer: 1,
      operations_design: 4,
    });
    const pointer = manifest.entries.find((entry) => entry.role === "current_pointer");
    expect(pointer).toBeDefined();
    expect(
      manifest.entries.filter(
        (entry) => entry.role === "evidence" && entry.originalDigest === pointer?.originalDigest,
      ),
    ).toHaveLength(1);
    const providerEntries = queryPreserveManifest(manifest, "provider_evidence");
    expect(verifyProviderPointer(providerEntries)).toEqual({ ok: true, reasons: [] });
    expect(queryPreserveManifest(manifest, "operations_transition")).toHaveLength(4);
    const exported = exportPreserveManifest(manifest);
    expect(exported.count).toBe(14);
    expect(exportPreserveManifest(manifest)).toEqual(exported);
    for (const kind of ["provider_evidence", "operations_transition"] as const) {
      const entries = queryPreserveManifest(manifest, kind);
      expect(
        entries.every(
          (entry) => entry.query.outputDigest === preserveQueryOutput(manifest, kind).digest,
        ),
      ).toBe(true);
      expect(
        entries.every(
          (entry) => entry.export.outputDigest === exportPreserveCollection(manifest, kind).digest,
        ),
      ).toBe(true);
    }
    expect(manifest.sourceRevision).toMatch(/^[a-f0-9]{40}$/);
    expect(
      manifest.entries
        .filter((entry) => entry.kind === "operations_transition")
        .every((entry) => entry.tracked),
    ).toBe(true);
    expect(manifest.entries.every((entry) => entry.symlink === false)).toBe(true);
    expect(manifest.entries.every((entry) => entry.originalDigest.startsWith("sha256:"))).toBe(
      true,
    );
  });

  it("U-HRET-008: operations inventoryはL11/L14 design rootの追加artifactを再帰検出する", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-operations-inventory-"));
    const path = "docs/design/product/L14-extra/extra.md";
    try {
      mkdirSync(join(root, path, ".."), { recursive: true });
      writeFileSync(join(root, path), validOperations.replace("layer: L14", "layer: L14"));
      expect(collectOperationsTransitionPaths(root)).toEqual([path]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("U-HRET-009: fresh cloneで削除済みdocs/handover directoryが無くても空archive inventoryを返す", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-retirement-fresh-clone-"));
    mkdirSync(join(root, ".helix", "handover", "provider"), { recursive: true });

    const inventory = collectRetirementPreserveInventory(root);

    expect(inventory.providerPaths).toEqual([]);
    expect(inventory.operationsPaths).toEqual([]);
    expect(inventory.archiveSourcePaths).toEqual([]);
    expect(inventory.digest).toMatch(/^sha256:[a-f0-9]{64}$/);
  });

  it("U-HRET-008: collectorはcanonical retentionとcaller/frontmatter driftを拒否する", () => {
    expect(() =>
      collectPreserveManifest(
        process.cwd(),
        [
          {
            path: ".helix/handover/provider/CURRENT.json",
            kind: "provider_evidence",
            role: "current_pointer",
            retention: {
              policyId: "wrong",
              authority: "wrong",
              mode: "indefinite",
              retainUntil: null,
              legalHold: false,
            },
            owner: "runtime-audit",
          },
        ],
        {
          operationId: "preserve:wrong-retention",
          intentDigest: digest("7"),
          capturedAt,
          retirementPhase: "shadow_read",
        },
      ),
    ).toThrow(/retention policy mismatch/);
  });

  it("U-HRET-008: before/afterでcount・digest・provenance・schema・query/export・retentionを一致させる", () => {
    const artifacts = [
      input(".helix/handover/provider/provider.json", "provider_evidence", validProvider),
      input(
        "docs/design/harness/L14-operations/operations-feedback-boundary.md",
        "operations_transition",
        validOperations,
      ),
    ];
    const before = buildPreserveManifest(artifacts);
    const after = buildPreserveManifest(artifacts);
    expect(evaluatePreserveIntegrity(before, after)).toEqual({
      ok: true,
      missing: [],
      extra: [],
      changed: [],
      invalidEvidence: [],
    });

    const changed = buildPreserveManifest([
      artifacts[0],
      {
        ...artifacts[1],
        content: validOperations.replace("# Operations", "# Changed"),
        query: { ...artifacts[1].query, ok: false, exitCode: 1 },
      },
    ]);
    expect(evaluatePreserveIntegrity(before, changed)).toMatchObject({
      ok: false,
      changed: [
        "operations_transition\0docs/design/harness/L14-operations/operations-feedback-boundary.md",
      ],
      invalidEvidence: [
        "operations_transition\0docs/design/harness/L14-operations/operations-feedback-boundary.md",
      ],
    });
  });

  it("U-HRET-008: 観測時刻・phaseをsemantic preserved digestから分離する", () => {
    const base = input(".helix/handover/provider/a.json", "provider_evidence", validProvider);
    const before = buildPreserveManifestWithContext([base], {
      operationId: "preserve:before",
      intentDigest: digest("1"),
      capturedAt: "2026-07-11T00:00:00Z",
      sourceRevision: "revision-a",
      retirementPhase: "shadow_read",
    });
    const after = buildPreserveManifestWithContext(
      [
        {
          ...base,
          provenance: {
            ...base.provenance,
            capturedAt: "2026-07-12T00:00:00Z",
            collector: "second-collector",
          },
          schemaValidation: {
            ...base.schemaValidation,
            checkedAt: "2026-07-12T00:00:00Z",
            outputDigest: digest("a"),
          },
          query: {
            ...base.query,
            checkedAt: "2026-07-12T00:00:00Z",
            outputDigest: digest("b"),
          },
          export: {
            ...base.export,
            checkedAt: "2026-07-12T00:00:00Z",
            outputDigest: digest("c"),
          },
        },
      ],
      {
        operationId: "preserve:after",
        intentDigest: digest("2"),
        capturedAt: "2026-07-12T00:00:00Z",
        sourceRevision: "revision-b",
        retirementPhase: "memory_primary",
      },
    );
    expect(before.manifestDigest).not.toBe(after.manifestDigest);
    expect(before.preservedDigest).toBe(after.preservedDigest);
    expect(evaluatePreserveIntegrity(before, after).ok).toBe(true);
  });

  it("U-HRET-008: provider/operations型をcontinuation sourceへjoinさせない", () => {
    expect(() =>
      assertContinuationSourceBoundary([
        "continuation_event",
        "provider_evidence",
        "bounded_memory",
      ]),
    ).toThrow(/cannot be continuation source/);
    expect(() =>
      assertContinuationSourceBoundary(["continuation_event", "bounded_memory", "feedback_event"]),
    ).not.toThrow();
  });

  it("U-HRET-008: malformed provenance/schema/digest/retentionとduplicateをfail-closeする", () => {
    const valid = input(".helix/handover/provider/a.json", "provider_evidence", validProvider);
    expect(() => buildPreserveManifest([valid, valid])).toThrow(/duplicate/);
    expect(() =>
      buildPreserveManifest([
        {
          ...valid,
          provenance: { ...valid.provenance, capturedAt: "not-a-time" },
        },
      ]),
    ).toThrow(/provenance/);
    expect(() =>
      buildPreserveManifest([
        {
          ...valid,
          schemaValidation: { ...valid.schemaValidation, outputDigest: "weak" },
        },
      ]),
    ).toThrow(/probe evidence/);
    expect(() =>
      buildPreserveManifest([
        {
          ...valid,
          retention: { ...valid.retention, retainUntil: "2020-01-01T00:00:00Z" },
        },
      ]),
    ).toThrow(/retention/);
  });

  it("U-HRET-008: provider unknown/missing field・invalid timestamp/provider pairを拒否する", () => {
    const parsed = JSON.parse(validProvider);
    expect(validateProviderEvidenceJson(JSON.stringify({ ...parsed, unknown: true })).valid).toBe(
      false,
    );
    const { active_plan: _, ...missing } = parsed;
    expect(validateProviderEvidenceJson(JSON.stringify(missing)).valid).toBe(false);
    const { handover_kind: _kind, ...futureMissingKind } = parsed;
    expect(validateProviderEvidenceJson(JSON.stringify(futureMissingKind)).errors).toContain(
      "kind_missing",
    );
    expect(
      validateProviderEvidenceJson(
        JSON.stringify({ ...parsed, created_at: "not-a-time", to: parsed.from }),
      ).errors,
    ).toEqual(expect.arrayContaining(["created_at_invalid", "provider_pair_invalid"]));
  });

  it("U-HRET-008: pointer二重count/target digest不一致とoperations旧surface参照を拒否する", () => {
    const provider = buildPreserveManifest([
      input(".helix/handover/provider/a.json", "provider_evidence", validProvider),
      input(".helix/handover/provider/CURRENT.json", "provider_evidence", validProvider),
    ]);
    expect(verifyProviderPointer(queryPreserveManifest(provider, "provider_evidence")).ok).toBe(
      true,
    );
    const badPointer = buildPreserveManifest([
      input(".helix/handover/provider/a.json", "provider_evidence", validProvider),
      input(
        ".helix/handover/provider/CURRENT.json",
        "provider_evidence",
        validProvider.replace("provider-1", "provider-other"),
      ),
    ]);
    expect(verifyProviderPointer(queryPreserveManifest(badPointer, "provider_evidence"))).toEqual({
      ok: false,
      reasons: ["provider_pointer_target_invalid"],
    });
    expect(
      validateOperationsTransitionMarkdown(
        validOperations.replace("# Operations", "helix handover reads CURRENT.json"),
      ),
    ).toMatchObject({ valid: false, errors: ["retired_session_surface_reference"] });
  });

  it("U-HRET-009: archive count/digest一致前のsource削除を拒否する", () => {
    const content = "# historical handover";
    const manifest = buildArchiveManifest([
      {
        sourcePath: "docs/handover/session-handover-old.md",
        archivePath: "docs/archive/handover/session-handover-old.md",
        logicalPath: "handover/session-handover-old.md",
        content,
        kind: "legacy_archive",
        mode: 0o644,
        tracked: false,
        symlink: false,
        archiveReason: "session prose retirement",
        archivedAt: capturedAt,
        operationId: "archive-session-old",
        restoreInstructions: "restore sourcePath from archivePath after digest verification",
      },
    ]);
    const exact = [
      {
        path: manifest[0].archivePath,
        digest: manifest[0].digest,
        byteCount: manifest[0].byteCount,
        mode: manifest[0].mode,
        tracked: manifest[0].tracked,
        symlink: false,
      },
    ];
    expect(canDeleteArchivedSources({ manifest, archived: exact }).ok).toBe(true);
    expect(canDeleteArchivedSources({ manifest, archived: [...exact, exact[0]] })).toMatchObject({
      ok: false,
      duplicate: [exact[0].path],
    });
    expect(
      canDeleteArchivedSources({
        manifest,
        archived: [{ ...exact[0], digest: digest("f") }],
      }),
    ).toMatchObject({ ok: false, changed: [manifest[0].archivePath] });
    expect(canDeleteArchivedSources({ manifest, archived: [] })).toMatchObject({
      ok: false,
      missing: [manifest[0].archivePath],
    });
  });

  it("U-HRET-009/U-HRET-013: post-cutover archive 15件を固定digest・byte count・modeで照合する", () => {
    const expected = [
      [
        "G1-readiness-report-2026-05-28.md",
        "0f866aec4102b224575db3e3e7283e1b23c177810f5888ee1d354548759208aa",
        16542,
        0o755,
      ],
      [
        "G3-readiness-report-2026-05-28.md",
        "5a71c7b88474a48fb1cc627dfdecece1d2629b6440c608ee9d94047c97bd2ef0",
        11294,
        0o755,
      ],
      [
        "SESSION-2026-05-22-handover.md",
        "a7533559c3f51876a4ade3ee0ad4ff432525eb58dfacdf45c44bc55aa8641ed5",
        11121,
        0o755,
      ],
      [
        "SESSION-2026-05-27-handover.md",
        "32e09c22bfcb53a5e7265f9ddfe15c901794ecb9165e30b2f03c195afa037655",
        7694,
        0o755,
      ],
      [
        "SESSION-2026-05-27b-handover.md",
        "b0fac90fba5aa821963b29e494a62ae02a71eeb46985f2103339b18eb80964f8",
        7496,
        0o755,
      ],
      [
        "SESSION-2026-05-27c-handover.md",
        "754a5636c8d9bc2e1807a10abdc833531b4a24237bdfeeb382e774a142fe06ea",
        7251,
        0o755,
      ],
      [
        "handover-mechanical-explicit.md",
        "41b1c5c4180f73d8528128fcc10ee92e69a651410ea9bc30e5b7433378a9717c",
        2326,
        0o755,
      ],
      [
        "phase3-workflow-automation-verification-2026-06-11.md",
        "ba79b59df5099e1f29a6981f82d8c1a473aa353191d1731303cccc58039851a6",
        8955,
        0o755,
      ],
      [
        "session-handover-2026-07-02.md",
        "528b2e3a30b317bd9ce981eb67a76d3e0f4ad7ba005fec254161313b68fd3a8f",
        26478,
        0o644,
      ],
      [
        "session-handover-2026-07-03.md",
        "6fba20e00711bb950be287637b0a6ac55a8bbdfecbbfbdfcfbee2ae14e4bc2ce",
        143251,
        0o644,
      ],
      [
        "session-handover-2026-07-04.md",
        "08425eeac7accee4483ee2ad22cf2e8ba75c9944ff5e6f7acbf78d844eb3931b",
        1958,
        0o644,
      ],
      [
        "session-handover-2026-07-05.md",
        "6148cdd63eecbdbab7118d694293c4a3098f93bd5251912c83c9172a11988467",
        30330,
        0o644,
      ],
      [
        "session-handover-2026-07-06.md",
        "b73d0faa8c406583332e5b8c38ddffff55fd2c95dfcae15d7ba636e280dc1fce",
        5221,
        0o644,
      ],
      [
        "session-handover-2026-07-08.md",
        "fd31150dc01105cafff2bfc85e68344f245d8394fc40dfb39c016ca7b3ef0ead",
        52648,
        0o644,
      ],
      [
        "session-handover-2026-07-10.md",
        "f129371ec1466f7631bfe804773e082fa3ca72d197e4f0d360e3116bfbf415d3",
        41121,
        0o644,
      ],
    ] as const;
    expect(existsSync("docs/handover") ? readdirSync("docs/handover") : []).toEqual([]);
    expect(readdirSync("docs/archive/handover").sort()).toEqual(
      expected.map(([name]) => name).sort(),
    );
    for (const [name, expectedDigest, expectedBytes, expectedMode] of expected) {
      const path = join("docs/archive/handover", name);
      const content = readFileSync(path);
      expect(content.byteLength, `${name}: byte count`).toBe(expectedBytes);
      expect(createHash("sha256").update(content).digest("hex"), `${name}: digest`).toBe(
        expectedDigest,
      );
      expect(statSync(path).mode & 0o777, `${name}: mode`).toBe(expectedMode);
    }
  });

  it("U-HRET-010: preserve/archive aggregate digestをjournal checkpointへ束縛する", () => {
    const preserve = buildPreserveManifest([
      input(".helix/handover/provider/a.json", "provider_evidence", validProvider),
    ]);
    const archive = buildArchiveManifest([
      {
        sourcePath: "docs/handover/session-handover-old.md",
        archivePath: "docs/archive/handover/session-handover-old.md",
        logicalPath: "handover/session-handover-old.md",
        content: "# historical",
        kind: "legacy_archive",
        mode: 0o644,
        tracked: false,
        symlink: false,
        archiveReason: "session prose retirement",
        archivedAt: capturedAt,
        operationId: "archive-old",
        restoreInstructions: "restore after digest verification",
      },
    ]);
    expect(
      evaluatePreservePhaseBinding({
        checkpoint: {
          preserveDigest: preserve.preservedDigest,
          archiveDigest: archiveManifestDigest(archive),
        },
        preserveManifest: preserve,
        archiveManifest: archive,
      }),
    ).toEqual({ ok: true, reasons: [] });
    expect(
      evaluatePreservePhaseBinding({
        checkpoint: { preserveDigest: digest("f"), archiveDigest: digest("e") },
        preserveManifest: preserve,
        archiveManifest: archive,
      }).ok,
    ).toBe(false);
  });

  it("U-HRET-008/009/010: phase exitはintegrity・pointer・archive・checkpoint・nonjoinのAND", () => {
    const preserveInputs = [
      input(".helix/handover/provider/a.json", "provider_evidence", validProvider),
      input(".helix/handover/provider/CURRENT.json", "provider_evidence", validProvider),
      input(
        "docs/design/harness/L14-operations/operations-feedback-boundary.md",
        "operations_transition",
        validOperations,
      ),
    ];
    for (const artifact of preserveInputs) {
      const count = artifact.kind === "provider_evidence" ? 2 : 1;
      artifact.query.resultCount = count;
      artifact.export.resultCount = count;
    }
    const operationId = "preserve:phase-exit";
    const intentDigest = digest("3");
    const before = buildPreserveManifestWithContext(preserveInputs, {
      operationId,
      intentDigest,
      capturedAt: "2026-07-11T00:00:00Z",
      sourceRevision: "revision-before",
      retirementPhase: "shadow_read",
    });
    const after = buildPreserveManifestWithContext(
      preserveInputs.map((artifact) => ({
        ...artifact,
        provenance: {
          ...artifact.provenance,
          capturedAt: "2026-07-12T00:00:00Z",
        },
        schemaValidation: {
          ...artifact.schemaValidation,
          checkedAt: "2026-07-12T00:00:00Z",
        },
        query: { ...artifact.query, checkedAt: "2026-07-12T00:00:00Z" },
        export: { ...artifact.export, checkedAt: "2026-07-12T00:00:00Z" },
      })),
      {
        operationId,
        intentDigest,
        capturedAt: "2026-07-12T00:00:00Z",
        sourceRevision: "revision-after",
        retirementPhase: "memory_primary",
      },
    );
    const archive = buildArchiveManifest([
      {
        sourcePath: "docs/handover/session-handover-old.md",
        archivePath: "docs/archive/handover/session-handover-old.md",
        logicalPath: "handover/session-handover-old.md",
        content: "# historical",
        kind: "legacy_archive",
        mode: 0o644,
        tracked: false,
        symlink: false,
        archiveReason: "session prose retirement",
        archivedAt: capturedAt,
        operationId: "archive-old",
        restoreInstructions: "restore after digest verification",
      },
    ]);
    const archived = archive.map((entry) => ({
      path: entry.archivePath,
      digest: entry.digest,
      byteCount: entry.byteCount,
      mode: entry.mode,
      tracked: entry.tracked,
      symlink: false,
    }));
    const inventoryBasis = {
      providerPaths: [".helix/handover/provider/CURRENT.json", ".helix/handover/provider/a.json"],
      operationsPaths: ["docs/design/harness/L14-operations/operations-feedback-boundary.md"],
      archiveSourcePaths: ["docs/handover/session-handover-old.md"],
    };
    const inventory = {
      ...inventoryBasis,
      digest: retirementPreserveInventoryDigest(inventoryBasis),
    };
    const checkpoint = {
      preserveDigest: after.preservedDigest,
      archiveDigest: archiveManifestDigest(archive),
      inventoryDigest: inventory.digest,
    };
    expect(
      evaluatePreservePhaseExit({
        before,
        after,
        archiveManifest: archive,
        archived,
        checkpoint,
        inventory,
        continuationSourceKinds: ["continuation_event", "bounded_memory"],
      }),
    ).toEqual({ ok: true, reasons: [] });
    expect(
      evaluatePreservePhaseExit({
        before,
        after,
        archiveManifest: archive,
        archived: [],
        checkpoint,
        inventory,
        continuationSourceKinds: ["provider_evidence"],
      }),
    ).toMatchObject({
      ok: false,
      reasons: expect.arrayContaining([
        "archive_reconcile_failed",
        "preserved_type_joined_to_continuation",
      ]),
    });
    const base = {
      before,
      after,
      archiveManifest: archive,
      archived,
      checkpoint,
      inventory,
      continuationSourceKinds: ["continuation_event"] as const,
    };
    const fenceCases = [
      {
        patch: { after: { ...after, operationId: "other" } },
        reason: "preserve_observation_fence_invalid",
      },
      {
        patch: { after: { ...after, intentDigest: digest("f") } },
        reason: "preserve_observation_fence_invalid",
      },
      {
        patch: { after: { ...after, retirementPhase: "cleanup" as const } },
        reason: "preserve_observation_fence_invalid",
      },
      {
        patch: { after: { ...after, capturedAt: "2026-07-10T00:00:00Z" } },
        reason: "preserve_observation_fence_invalid",
      },
      {
        patch: {
          inventory: {
            ...inventory,
            operationsPaths: [],
          },
        },
        reason: "preserve_inventory_incomplete",
      },
      {
        patch: { inventory: { ...inventory, digest: digest("0") } },
        reason: "preserve_inventory_digest_invalid",
      },
      {
        patch: { checkpoint: { ...checkpoint, inventoryDigest: digest("0") } },
        reason: "preserve_inventory_checkpoint_mismatch",
      },
    ];
    for (const fixture of fenceCases) {
      expect(evaluatePreservePhaseExit({ ...base, ...fixture.patch }).reasons).toContain(
        fixture.reason,
      );
    }
  });

  it("U-HRET-009: provider/operationsをarchiveへ誤分類せずpath traversal/重複を拒否する", () => {
    expect(() =>
      buildArchiveManifest([
        {
          sourcePath: "../provider.json",
          archivePath: "docs/archive/provider.json",
          logicalPath: "handover/provider.json",
          content: "{}",
          kind: "legacy_archive",
          mode: 0o644,
          tracked: false,
          symlink: false,
          archiveReason: "test",
          archivedAt: capturedAt,
          operationId: "archive-invalid",
          restoreInstructions: "restore",
        },
      ]),
    ).toThrow(/invalid archive/);
    expect(() =>
      buildArchiveManifest([
        {
          sourcePath: ".helix/handover/provider/a.json",
          archivePath: "docs/archive/handover/provider-a.json",
          logicalPath: "handover/provider-a.json",
          content: "{}",
          kind: "legacy_archive",
          mode: 0o644,
          tracked: true,
          symlink: false,
          archiveReason: "wrong classification",
          archivedAt: capturedAt,
          operationId: "archive-provider-wrong",
          restoreInstructions: "restore",
        },
      ]),
    ).toThrow(/invalid archive/);
    expect(() =>
      buildArchiveManifest([
        {
          sourcePath: ".helix/handover/provider/a.json",
          archivePath: ".helix/handover/provider/archive/a.json",
          logicalPath: "handover/provider-a.json",
          content: "{}",
          kind: "legacy_archive",
          mode: 0o644,
          tracked: false,
          symlink: false,
          archiveReason: "test",
          archivedAt: capturedAt,
          operationId: "archive-provider",
          restoreInstructions: "restore",
        },
      ]),
    ).toThrow(/invalid archive/);
  });
});
