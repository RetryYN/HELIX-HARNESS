import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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
  collectArchivedTargets,
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
    expect(inventory).toMatchObject({
      providerPaths: expect.arrayContaining(providerPaths),
      operationsPaths: expect.any(Array),
      archiveSourcePaths: expect.any(Array),
    });
    expect(inventory.operationsPaths).toHaveLength(4);
    expect(inventory.archiveSourcePaths).toHaveLength(7);
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
          },
          query: { ...base.query, checkedAt: "2026-07-12T00:00:00Z" },
          export: { ...base.export, checkedAt: "2026-07-12T00:00:00Z" },
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

  it("U-HRET-009: real legacy archive 7件をsource→target bijectionで照合する", () => {
    const sourcePaths = readdirSync("docs/handover")
      .filter((name) => /^session-handover-.*\.md$/.test(name))
      .map((name) => `docs/handover/${name}`)
      .sort();
    expect(sourcePaths).toHaveLength(7);
    const manifest = buildArchiveManifest(
      sourcePaths.map((sourcePath) => ({
        sourcePath,
        archivePath: sourcePath.replace("docs/handover/", "docs/archive/handover/"),
        logicalPath: sourcePath.slice("docs/".length),
        content: readFileSync(sourcePath),
        kind: "legacy_archive",
        mode: 0o644,
        tracked: false,
        symlink: false,
        archiveReason: "session prose retirement",
        archivedAt: capturedAt,
        operationId: `archive:${sourcePath}`,
        restoreInstructions: "restore sourcePath from archivePath after digest verification",
      })),
    );
    const targetRoot = mkdtempSync(join(tmpdir(), "helix-archive-target-"));
    try {
      for (const entry of manifest) {
        const target = join(targetRoot, entry.archivePath);
        mkdirSync(join(target, ".."), { recursive: true });
        writeFileSync(target, readFileSync(entry.sourcePath), { mode: entry.mode });
      }
      const archived = collectArchivedTargets(targetRoot, manifest);
      expect(archived).toHaveLength(7);
      expect(canDeleteArchivedSources({ manifest, archived }).ok).toBe(true);
      expect(
        canDeleteArchivedSources({
          manifest,
          archived: archived.map((entry, index) =>
            index === 0 ? { ...entry, tracked: true } : entry,
          ),
        }).ok,
      ).toBe(false);
    } finally {
      rmSync(targetRoot, { recursive: true, force: true });
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
