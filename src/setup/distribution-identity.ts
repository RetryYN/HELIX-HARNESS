// PLAN-L7-655-distribution-devos-runtime-identity (Issue #944)

export const HELIX_DISTRIBUTION_REPOSITORY = "RetryYN/HELIX-HARNESS-DevOS";
export const HELIX_DISTRIBUTION_REMOTE_URL = "https://github.com/RetryYN/HELIX-HARNESS-DevOS.git";
export const LEGACY_HELIX_DISTRIBUTION_REPOSITORY = "RetryYN/HELIX-HARNESS-OS";
export const LEGACY_HELIX_DISTRIBUTION_REMOTE_URL =
  "https://github.com/RetryYN/HELIX-HARNESS-OS.git";

export interface DistributionIdentityReceipt {
  schema_version: "helix-distribution-identity-receipt.v1";
  ok: boolean;
  input: string;
  repository: string | null;
  remote_url: string | null;
  source: "current" | "legacy_compatibility" | "explicit_external" | "invalid";
  converted_from: string | null;
  warnings: string[];
  failure: "distribution_repository_identity_invalid" | null;
}

const CURRENT_INPUTS = new Set([
  HELIX_DISTRIBUTION_REPOSITORY,
  HELIX_DISTRIBUTION_REMOTE_URL,
  `git@github.com:${HELIX_DISTRIBUTION_REPOSITORY}.git`,
  `git+${HELIX_DISTRIBUTION_REMOTE_URL}`,
]);
const LEGACY_INPUTS = new Set([
  LEGACY_HELIX_DISTRIBUTION_REPOSITORY,
  LEGACY_HELIX_DISTRIBUTION_REMOTE_URL,
  `git@github.com:${LEGACY_HELIX_DISTRIBUTION_REPOSITORY}.git`,
  `git+${LEGACY_HELIX_DISTRIBUTION_REMOTE_URL}`,
]);
const EXPLICIT_REPOSITORY = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const EXPLICIT_REMOTE = /^(?:https:\/\/|ssh:\/\/|git@)[^\s]+$/;

export function resolveDistributionIdentity(
  rawInput: string | null | undefined,
): DistributionIdentityReceipt {
  const input = rawInput?.trim() || HELIX_DISTRIBUTION_REPOSITORY;
  if (CURRENT_INPUTS.has(input)) {
    return {
      schema_version: "helix-distribution-identity-receipt.v1",
      ok: true,
      input,
      repository: HELIX_DISTRIBUTION_REPOSITORY,
      remote_url: HELIX_DISTRIBUTION_REMOTE_URL,
      source: "current",
      converted_from: null,
      warnings: [],
      failure: null,
    };
  }
  if (LEGACY_INPUTS.has(input)) {
    return {
      schema_version: "helix-distribution-identity-receipt.v1",
      ok: true,
      input,
      repository: HELIX_DISTRIBUTION_REPOSITORY,
      remote_url: HELIX_DISTRIBUTION_REMOTE_URL,
      source: "legacy_compatibility",
      converted_from: input,
      warnings: [`deprecated distribution identity converted to ${HELIX_DISTRIBUTION_REPOSITORY}`],
      failure: null,
    };
  }
  if (EXPLICIT_REPOSITORY.test(input)) {
    return {
      schema_version: "helix-distribution-identity-receipt.v1",
      ok: true,
      input,
      repository: input,
      remote_url: `https://github.com/${input}.git`,
      source: "explicit_external",
      converted_from: null,
      warnings: [],
      failure: null,
    };
  }
  if (EXPLICIT_REMOTE.test(input)) {
    return {
      schema_version: "helix-distribution-identity-receipt.v1",
      ok: true,
      input,
      repository: null,
      remote_url: input.replace(/^git\+/, ""),
      source: "explicit_external",
      converted_from: null,
      warnings: [],
      failure: null,
    };
  }
  return {
    schema_version: "helix-distribution-identity-receipt.v1",
    ok: false,
    input,
    repository: null,
    remote_url: null,
    source: "invalid",
    converted_from: null,
    warnings: [],
    failure: "distribution_repository_identity_invalid",
  };
}
