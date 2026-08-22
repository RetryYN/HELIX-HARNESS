import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  distributionProfileDigest,
  loadDistributionProfileCatalog,
  validateDistributionProfileCatalog,
} from "../src/setup/distribution-profile";

const expectedAllowlist = [
  "canonical_vmodel_l1_l12",
  "work_authority_contracts",
  "typed_workflow_identity",
  "legacy_input_only_adapter",
  "quality_gates",
  "schema_only_state_projection",
  "consumer_setup_and_status",
  "completion_evidence",
  "independent_exact_head_review",
  "github_contract",
  "codex_claude_consumer_hooks",
];

const expectedExclusions = [
  "workflow_switching_routing_allocation",
  "resident_multi_runtime_lanes",
  "lane_supervisor",
  "grok_cursor_resident_lanes",
  "provider_automatic_fallback",
  "multi_head_resident_runtime",
  "unfinished_security_broker",
  "development_plan_corpus",
  "development_runtime_state",
  "development_evidence_and_credentials",
];

function catalogFixture(): Record<string, unknown> {
  return JSON.parse(readFileSync("config/distribution-profile-catalog.json", "utf8"));
}

function reseal(raw: Record<string, unknown>): Record<string, unknown> {
  const profiles = raw.profiles as Array<Record<string, unknown>>;
  const profile = profiles[0] as Parameters<typeof distributionProfileDigest>[0];
  profile.profile_digest = distributionProfileDigest(profile);
  return raw;
}

function writeCatalogRoot(
  catalog: Record<string, unknown>,
  refinementContracts?: Record<string, unknown>,
): string {
  const root = mkdtempSync(join(tmpdir(), "helix-distribution-profile-"));
  mkdirSync(join(root, "config"), { recursive: true });
  writeFileSync(
    join(root, "config", "distribution-profile-catalog.json"),
    JSON.stringify(catalog),
    "utf8",
  );
  if (refinementContracts) {
    mkdirSync(join(root, "requirements-ir"), { recursive: true });
    writeFileSync(
      join(root, "requirements-ir", "refinement_contracts.json"),
      JSON.stringify(refinementContracts),
      "utf8",
    );
  }
  return root;
}

describe("distribution Lite profile authority", () => {
  it("U-DISTLITE-001: PLAN-L7-642-distribution-lite-profile-manifest current consumer_core_v1 exact setをRequirement IRへ束縛する", () => {
    const result = loadDistributionProfileCatalog(process.cwd());
    expect(result).toMatchObject({ ok: true, failures: [] });
    const profile = result.catalog?.profiles[0];
    expect(profile).toMatchObject({
      profile_id: "consumer_core_v1",
      profile_version: "1.0.0",
      display_name: "HELIX-HARNESS-LITE",
      distribution_repository: "RetryYN/HELIX-HARNESS-DevOS",
      source_authority: {
        repository: "HELIX-HARNESS",
        refinement_contract_id: "DIST-LITE-FR-001",
      },
      promotion_policy: { mode: "versioned_receipt_only", manual_edit_allowed: false },
    });
    expect(profile?.capability_allowlist).toEqual(expectedAllowlist);
    expect(profile?.capability_exclusions).toEqual(expectedExclusions);
  });

  it("U-DISTLITE-002: PLAN-L7-642-distribution-lite-profile-manifest duplicateとallow／exclude overlapを個別に拒否する", () => {
    const duplicateProfiles = catalogFixture();
    const firstProfile = (duplicateProfiles.profiles as Array<Record<string, unknown>>)[0];
    duplicateProfiles.profiles = [firstProfile, structuredClone(firstProfile)];
    expect(validateDistributionProfileCatalog(duplicateProfiles)).toMatchObject({
      ok: false,
      failures: ["profile_duplicate"],
    });

    const duplicate = catalogFixture();
    const duplicateProfile = (duplicate.profiles as Array<Record<string, unknown>>)[0];
    duplicateProfile.capability_allowlist = [...expectedAllowlist, expectedAllowlist[0]];
    expect(validateDistributionProfileCatalog(reseal(duplicate))).toMatchObject({
      ok: false,
      failures: ["capability_duplicate"],
    });

    const overlap = catalogFixture();
    const overlapProfile = (overlap.profiles as Array<Record<string, unknown>>)[0];
    overlapProfile.capability_exclusions = [...expectedExclusions, expectedAllowlist[0]];
    expect(validateDistributionProfileCatalog(reseal(overlap))).toMatchObject({
      ok: false,
      failures: ["capability_overlap"],
    });

    const raw = catalogFixture();
    const profile = (raw.profiles as Array<Record<string, unknown>>)[0];
    profile.display_name = "HELIX-HARNESS-LITE-drift";
    expect(validateDistributionProfileCatalog(raw)).toMatchObject({
      ok: false,
      failures: ["profile_digest_mismatch"],
    });
  });

  it("U-DISTLITE-003: PLAN-L7-642-distribution-lite-profile-manifest Requirement IR refinementの欠落とdigest driftを個別に拒否する", () => {
    const catalog = catalogFixture();
    const missingRoot = writeCatalogRoot(catalog);
    try {
      expect(loadDistributionProfileCatalog(missingRoot)).toMatchObject({
        ok: false,
        failures: ["refinement_authority_missing"],
      });
    } finally {
      rmSync(missingRoot, { recursive: true, force: true });
    }

    const mismatchRoot = writeCatalogRoot(catalog, {
      "DIST-LITE-FR-001": { semantic_digest: `sha256:${"0".repeat(64)}` },
    });
    try {
      expect(loadDistributionProfileCatalog(mismatchRoot)).toMatchObject({
        ok: false,
        failures: ["refinement_authority_mismatch"],
      });
    } finally {
      rmSync(mismatchRoot, { recursive: true, force: true });
    }
  });
  // PLAN-L7-650-lite-catalog-parse-oracle / Issue #882 — U-DISTLITE-005
  it("U-DISTLITE-005: PLAN-L7-650-lite-catalog-parse-oracle catalog parse失敗の2経路をexact failure codeで固定する", () => {
    // 経路 1: schema parse 失敗 (validateDistributionProfileCatalog)。
    // 設計 ## 機能契約 が名指しする parse 失敗の fail-close 境界のうち、schema 側。
    for (const invalid of [
      null,
      "not-an-object",
      {},
      { profiles: "not-an-array" },
      { profiles: [{ profile_id: "consumer_core_v1" }] },
    ]) {
      expect(validateDistributionProfileCatalog(invalid), JSON.stringify(invalid)).toMatchObject({
        ok: false,
        failures: ["catalog_invalid"],
      });
    }

    // 正しい catalog は同じ入口を通っても catalog_invalid にならない (過検知の否定)。
    expect(validateDistributionProfileCatalog(catalogFixture()).failures).not.toContain(
      "catalog_invalid",
    );

    // 経路 2: file 読込／JSON parse 失敗 (loadDistributionProfileCatalog)。
    // catalog が存在しない repo root。
    const missingRoot = mkdtempSync(join(tmpdir(), "helix-distribution-profile-missing-"));
    try {
      expect(loadDistributionProfileCatalog(missingRoot)).toMatchObject({
        ok: false,
        failures: ["catalog_invalid"],
      });
    } finally {
      rmSync(missingRoot, { recursive: true, force: true });
    }

    // catalog は存在するが JSON として読めない repo root。
    const unparsableRoot = mkdtempSync(join(tmpdir(), "helix-distribution-profile-unparsable-"));
    try {
      mkdirSync(join(unparsableRoot, "config"), { recursive: true });
      writeFileSync(
        join(unparsableRoot, "config", "distribution-profile-catalog.json"),
        "{ this is not json",
        "utf8",
      );
      expect(loadDistributionProfileCatalog(unparsableRoot)).toMatchObject({
        ok: false,
        failures: ["catalog_invalid"],
      });
    } finally {
      rmSync(unparsableRoot, { recursive: true, force: true });
    }

    // JSON としては読めるが schema 不正な catalog も、load 経由で catalog_invalid になる。
    const schemaInvalidRoot = writeCatalogRoot({ profiles: [{ profile_id: 1 }] });
    try {
      expect(loadDistributionProfileCatalog(schemaInvalidRoot)).toMatchObject({
        ok: false,
        failures: ["catalog_invalid"],
      });
    } finally {
      rmSync(schemaInvalidRoot, { recursive: true, force: true });
    }
  });
});
