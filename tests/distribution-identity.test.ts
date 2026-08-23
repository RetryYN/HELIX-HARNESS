// PLAN-L7-655-distribution-devos-runtime-identity — U-DISTID-001..004
import { describe, expect, it } from "vitest";
import {
  HELIX_DISTRIBUTION_REMOTE_URL,
  HELIX_DISTRIBUTION_REPOSITORY,
  resolveDistributionIdentity,
} from "../src/setup/distribution-identity";

describe("distribution repository identity", () => {
  it("U-DISTID-001: current identityをcanonical receiptへ束縛する", () => {
    expect(resolveDistributionIdentity(HELIX_DISTRIBUTION_REPOSITORY)).toMatchObject({
      ok: true,
      repository: HELIX_DISTRIBUTION_REPOSITORY,
      remote_url: HELIX_DISTRIBUTION_REMOTE_URL,
      source: "current",
      converted_from: null,
      warnings: [],
    });
  });

  it("U-DISTID-002: old OS identityをwarning付きinput-only変換する", () => {
    const receipt = resolveDistributionIdentity("https://github.com/RetryYN/HELIX-HARNESS-OS.git");

    expect(receipt).toMatchObject({
      ok: true,
      repository: HELIX_DISTRIBUTION_REPOSITORY,
      remote_url: HELIX_DISTRIBUTION_REMOTE_URL,
      source: "legacy_compatibility",
      converted_from: "https://github.com/RetryYN/HELIX-HARNESS-OS.git",
    });
    expect(receipt.warnings).toHaveLength(1);
    expect(JSON.stringify(receipt)).not.toContain('"repository":"RetryYN/HELIX-HARNESS-OS"');
    expect(JSON.stringify(receipt)).not.toContain(
      '"remote_url":"https://github.com/RetryYN/HELIX-HARNESS-OS.git"',
    );
  });

  it("U-DISTID-003: explicit external repositoryは勝手にDevOSへ書き換えない", () => {
    expect(resolveDistributionIdentity("ExampleOrg/example-pack")).toMatchObject({
      ok: true,
      repository: "ExampleOrg/example-pack",
      remote_url: "https://github.com/ExampleOrg/example-pack.git",
      source: "explicit_external",
    });
  });

  it("U-DISTID-004: ambiguous inputは推測せずfail-closeする", () => {
    expect(resolveDistributionIdentity("HELIX-HARNESS-OS")).toMatchObject({
      ok: false,
      repository: null,
      remote_url: null,
      source: "invalid",
      failure: "distribution_repository_identity_invalid",
    });
  });
});
