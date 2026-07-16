import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { DESIGN_DENOMINATOR_MANIFEST, observeCanonicalDesignDenominator } from "../src/state-db/design-denominator-observer";

const repoRoot = resolve(import.meta.dirname, "..");
// PLAN-L7-459-design-freeze-authority-transition
const temporaryRoots: string[] = [];
afterEach(() => { for (const root of temporaryRoots.splice(0)) rmSync(root, { recursive: true, force: true }); });

describe("canonical Design denominator observer", () => {
  it("U-DFA-001: 19 slice / 76 current artifactをsealed observationへ正規化する", () => {
    const observed = observeCanonicalDesignDenominator({ repoRoot });
    expect(observed.sliceIds).toHaveLength(19);
    expect(observed.artifactObservations).toHaveLength(76);
    expect(new Set(observed.artifactObservations.map((entry) => entry.path)).size).toBe(76);
    expect(observed.historicalDigestMatchCount + observed.historicalDigestMismatchCount).toBe(76);
    expect(observed.headDigestMatchCount + observed.headDigestMismatchCount).toBe(76);
    expect(observed.currentArtifactSetDigest).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(observed.observationDigest).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(observed.sourceRepository.headOid).toMatch(/^[0-9a-f]{40}$/);
    expect(observed.sourceRepository.treeOid).toMatch(/^[0-9a-f]{40}$/);
    expect(observed.layerLedgerRevision.fixtureRevision).toBe(3);
  });

  it("duplicate slice IDをstrict manifest errorとして拒否する", () => {
    const root = mkdtempSync(resolve(tmpdir(), "helix-denominator-")); temporaryRoots.push(root);
    const manifest = readFileSync(resolve(repoRoot, DESIGN_DENOMINATOR_MANIFEST), "utf8")
      .replace("  - HDS-HIL-02\n", "  - HDS-HIL-01\n");
    const target = resolve(root, DESIGN_DENOMINATOR_MANIFEST); mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, manifest);
    expect(() => observeCanonicalDesignDenominator({ repoRoot: root })).toThrow(/slice ID set|duplicate IDs/);
  });

  it("artifact path symlinkを拒否するreaderを共有する", () => {
    const root = mkdtempSync(resolve(tmpdir(), "helix-denominator-")); temporaryRoots.push(root);
    const manifestTarget = resolve(root, DESIGN_DENOMINATOR_MANIFEST); mkdirSync(dirname(manifestTarget), { recursive: true });
    symlinkSync(resolve(repoRoot, DESIGN_DENOMINATOR_MANIFEST), manifestTarget);
    expect(() => observeCanonicalDesignDenominator({ repoRoot: root })).toThrow(/symlink ancestry/);
  });
});
