#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { deepStrictEqual, strictEqual } from "node:assert";
import {
  closeSync,
  fchmodSync,
  fsyncSync,
  openSync,
  readFileSync,
  renameSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse, stringify } from "yaml";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, "..", "..");
const MANIFEST_REPO_PATH =
  "docs/test-design/helix/fixtures/layer-ledger-pair-gate-progress-s01.manifest";
const MANIFEST_PATH = resolve(REPO_ROOT, MANIFEST_REPO_PATH);
const HST_SOURCE_PATH =
  "docs/governance/infinity-loop-system-assertion-cases.md";

const TOP_LEVEL_KEYS = [
  "schema_version",
  "fixture_id",
  "fixture_revision",
  "digest_contract",
  "snapshot_binding",
  "slice_ids",
  "slice_count",
  "slice_set_digest",
  "artifact_inventory",
  "artifact_count",
  "artifact_path_content_set_digest",
  "canonical_unit_ids",
  "canonical_unit_count",
  "canonical_unit_set_digest",
  "canonical_integration_ids",
  "canonical_integration_count",
  "canonical_integration_set_digest",
  "canonical_hst_ids",
  "canonical_hst_count",
  "canonical_hst_set_digest",
  "canonical_quartet_count",
  "canonical_total_count",
  "canonical_combined_set_digest",
  "supporting_meta_oracle_receipt",
  "expected_terminal_receipt_id",
  "expected_terminal_receipt_digest",
  "expected_terminal_receipt_digest_algorithm",
  "expected_status",
  "mutations",
];

const EXPECTED = Object.freeze({
  artifactCount: 76,
  hstCount: 462,
  integrationCount: 376,
  mutationCount: 12,
  sliceCount: 19,
  unitCount: 491,
});

const EXPECTED_DIGEST_CONTRACT = Object.freeze({
  algorithm_id: "helix-llpg-s01-digest.v1",
  hash: "SHA-256",
  encoding: "UTF-8",
  bom: "forbidden",
  output_encoding: "lowercase_hex_with_sha256_prefix",
  aggregate_record_separator: "LF_0x0A",
  aggregate_trailing_lf: false,
  scalar_serialization: "raw_unquoted_unescaped_ascii",
  boolean_serialization: "lowercase_true_false",
  forbidden_scalar_bytes: [
    "TAB_0x09",
    "LF_0x0A",
    "CR_0x0D",
    "NUL_0x00",
    "NON_ASCII",
  ],
  nested_digest_serialization: "full_sha256_colon_lowercase_hex",
  unspecified_fields: "excluded",
  dependency_order: [
    "artifact_content_digest",
    "leaf_set_digests",
    "canonical_combined_set_digest",
    "design_snapshot_digest",
    "supporting_meta_oracle_receipt_digest",
    "expected_terminal_receipt_digest",
  ],
  preimages: {
    artifact_content_digest: {
      output_field: "artifact_inventory[*].content_digest",
      input_bytes: "exact_file_bytes_at_artifact_inventory[*].path",
      file_trailing_lf: "include_if_present",
      aggregate_separator: "none",
      excluded_fields: [
        "artifact_inventory[*].slice_id",
        "artifact_inventory[*].path",
      ],
    },
    slice_set_digest: {
      output_field: "slice_set_digest",
      ordered_fields: ["slice_ids[*]"],
      record_schema: "raw_slice_id",
      array_sort: "ascii_byte_ascending",
      duplicate_policy: "reject",
      separator: "LF_0x0A",
      trailing_lf: false,
      excluded_fields: ["slice_count", "all_unspecified_fields"],
    },
    artifact_path_content_set_digest: {
      output_field: "artifact_path_content_set_digest",
      ordered_fields: [
        "artifact_inventory[*].path",
        "artifact_inventory[*].content_digest",
      ],
      record_schema: "path_TAB_0x09_content_digest",
      record_sort: "ascii_byte_ascending_on_complete_record",
      duplicate_path_policy: "reject",
      separator: "LF_0x0A",
      trailing_lf: false,
      excluded_fields: [
        "artifact_inventory[*].slice_id",
        "artifact_count",
        "all_unspecified_fields",
      ],
    },
    canonical_unit_set_digest: {
      output_field: "canonical_unit_set_digest",
      ordered_fields: ["canonical_unit_ids[*]"],
      array_sort: "ascii_byte_ascending",
      duplicate_policy: "reject",
      separator: "LF_0x0A",
      trailing_lf: false,
      excluded_values: ["U-LLPG-S01"],
      excluded_fields: ["canonical_unit_count", "all_unspecified_fields"],
    },
    canonical_integration_set_digest: {
      output_field: "canonical_integration_set_digest",
      ordered_fields: ["canonical_integration_ids[*]"],
      array_sort: "ascii_byte_ascending",
      duplicate_policy: "reject",
      separator: "LF_0x0A",
      trailing_lf: false,
      excluded_values: ["IT-LLPG-S01"],
      excluded_fields: [
        "canonical_integration_count",
        "all_unspecified_fields",
      ],
    },
    canonical_hst_set_digest: {
      output_field: "canonical_hst_set_digest",
      ordered_fields: ["canonical_hst_ids[*]"],
      array_sort: "ascii_byte_ascending",
      duplicate_policy: "reject",
      separator: "LF_0x0A",
      trailing_lf: false,
      excluded_fields: ["canonical_hst_count", "all_unspecified_fields"],
    },
    canonical_combined_set_digest: {
      output_field: "canonical_combined_set_digest",
      ordered_fields: [
        "canonical_unit_set_digest",
        "canonical_integration_set_digest",
        "canonical_hst_set_digest",
      ],
      array_sort: "none_fixed_field_order",
      separator: "LF_0x0A",
      trailing_lf: false,
      excluded_fields: [
        "canonical_quartet_count",
        "canonical_total_count",
        "all_unspecified_fields",
      ],
    },
    design_snapshot_digest: {
      output_field: "snapshot_binding.design_snapshot_digest",
      ordered_fields: [
        "snapshot_binding.source_commit",
        "snapshot_binding.source_tree",
        "slice_set_digest",
        "artifact_path_content_set_digest",
        "canonical_unit_set_digest",
        "canonical_integration_set_digest",
        "canonical_hst_set_digest",
      ],
      array_sort: "none_fixed_field_order",
      separator: "LF_0x0A",
      trailing_lf: false,
      excluded_fields: [
        "fixture_id",
        "fixture_revision",
        "canonical_combined_set_digest",
        "digest_contract",
        "all_unspecified_fields",
      ],
    },
    supporting_meta_oracle_receipt_digest: {
      output_field: "supporting_meta_oracle_receipt.receipt_digest",
      ordered_fields: [
        "supporting_meta_oracle_receipt.receipt_id",
        "supporting_meta_oracle_receipt.snapshot_digest",
        "supporting_meta_oracle_receipt.oracle_ids[0]",
        "supporting_meta_oracle_receipt.oracle_ids[1]",
        "supporting_meta_oracle_receipt.status",
        "supporting_meta_oracle_receipt.canonical_denominator_included",
      ],
      oracle_id_array_sort: "none_exact_U_then_IT",
      separator: "LF_0x0A",
      trailing_lf: false,
      excluded_fields: [
        "expected_terminal_receipt_id",
        "digest_contract",
        "all_unspecified_fields",
      ],
    },
    expected_terminal_receipt_digest: {
      output_field: "expected_terminal_receipt_digest",
      ordered_fields: [
        "fixture_id",
        "snapshot_binding.design_snapshot_digest",
        "slice_set_digest",
        "artifact_path_content_set_digest",
        "canonical_unit_set_digest",
        "canonical_integration_set_digest",
        "canonical_hst_set_digest",
        "supporting_meta_oracle_receipt.receipt_digest",
      ],
      array_sort: "none_fixed_field_order",
      separator: "LF_0x0A",
      trailing_lf: false,
      excluded_fields: [
        "expected_terminal_receipt_id",
        "expected_status",
        "expected_terminal_receipt_digest_algorithm",
        "digest_contract",
        "all_unspecified_fields",
      ],
    },
  },
});

const EXPECTED_MUTATIONS = Object.freeze([
  ["authority_unauthorized", "HIL_LAYER_PROGRESS_DENOMINATOR_UNAUTHORIZED", 0],
  [
    "denominator_list_count_digest_mismatch",
    "HIL_LAYER_PROGRESS_DENOMINATOR_MISMATCH",
    0,
  ],
  [
    "stage_inclusion_inverted",
    "HIL_LAYER_PROGRESS_STAGE_INCLUSION_INVALID",
    0,
  ],
  ["stage_axis_mixed", "HIL_LAYER_PROGRESS_STAGE_ORDER_INVALID", 0],
  [
    "evidence_stale_or_source_swapped",
    "HIL_LAYER_PROGRESS_EVIDENCE_STALE",
    0,
  ],
  [
    "reviewer_identity_not_separated",
    "HIL_LAYER_PROGRESS_AUDITOR_NOT_INDEPENDENT",
    0,
  ],
  [
    "evidence_receipt_missing_or_swapped",
    "HIL_LAYER_PROGRESS_RECEIPT_MISMATCH",
    0,
  ],
  [
    "freeze_slice_or_snapshot_join_mismatch",
    "HIL_LAYER_PROGRESS_RECEIPT_MISMATCH",
    0,
  ],
  [
    "projection_rate_or_digest_mismatch",
    "HIL_LAYER_PROGRESS_PROJECTION_MISMATCH",
    0,
  ],
  [
    "supporting_oracle_included",
    "HIL_LAYER_PROGRESS_SUPPORTING_INCLUDED",
    0,
  ],
  [
    "store_revision_head_cas_loser",
    "HIL_LAYER_TRANSACTION_CAS_CONFLICT",
    0,
  ],
  [
    "append_fault_same_digest_reconcile",
    "none",
    1,
    "DPR-LLPG-S01-V1",
  ],
].map(
  ([mutation_id, expected_failure, expected_terminal_receipt_count, receipt]) => ({
    mutation_id,
    expected_failure,
    expected_terminal_receipt_count,
    ...(receipt ? { expected_terminal_receipt_id: receipt } : {}),
  }),
));

function usage() {
  return [
    "Usage:",
    "  node tests/tools/regenerate-layer-ledger-progress-fixture.mjs --commit <40-char-sha>",
    "  node tests/tools/regenerate-layer-ledger-progress-fixture.mjs --commit <40-char-sha> --check",
    "",
    "The commit must already contain the frozen 19-slice design. --check never writes.",
  ].join("\n");
}

function parseArgs(argv) {
  let commit = null;
  let check = false;
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--help" || argument === "-h") {
      process.stdout.write(`${usage()}\n`);
      process.exit(0);
    }
    if (argument === "--check") {
      check = true;
      continue;
    }
    if (argument === "--commit") {
      commit = argv[index + 1] ?? null;
      index += 1;
      continue;
    }
    throw new Error(`unknown argument: ${argument}`);
  }
  if (!commit) {
    throw new Error("--commit is required");
  }
  if (!/^[0-9a-f]{40}$/.test(commit)) {
    throw new Error("--commit must be a lowercase full 40-character SHA");
  }
  return { check, commit };
}

function gitText(args) {
  return execFileSync("git", args, {
    cwd: REPO_ROOT,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  }).trim();
}

function gitBytesAt(commit, path) {
  return execFileSync("git", ["show", `${commit}:${path}`], {
    cwd: REPO_ROOT,
    encoding: "buffer",
    maxBuffer: 32 * 1024 * 1024,
  });
}

function sha256(value) {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

function assertAsciiScalar(value, label) {
  if (typeof value !== "string" || !/^[\x20-\x7e]+$/.test(value)) {
    throw new Error(`${label} must be a non-empty printable ASCII scalar`);
  }
  if (/[\t\r\n\0]/.test(value)) {
    throw new Error(`${label} contains a forbidden separator byte`);
  }
}

function asciiSort(values, label) {
  for (const value of values) assertAsciiScalar(value, label);
  const sorted = [...values].sort((left, right) =>
    Buffer.compare(Buffer.from(left, "ascii"), Buffer.from(right, "ascii")),
  );
  if (new Set(sorted).size !== sorted.length) {
    throw new Error(`${label} contains duplicate values`);
  }
  return sorted;
}

function setDigest(values, label) {
  return sha256(asciiSort(values, label).join("\n"));
}

function artifactSetDigest(artifacts) {
  const paths = asciiSort(
    artifacts.map((artifact) => artifact.path),
    "artifact path",
  );
  strictEqual(paths.length, artifacts.length);
  const records = artifacts.map((artifact) => {
    assertAsciiScalar(artifact.path, "artifact path");
    assertAsciiScalar(artifact.content_digest, "artifact content digest");
    return `${artifact.path}\t${artifact.content_digest}`;
  });
  records.sort((left, right) => Buffer.compare(Buffer.from(left), Buffer.from(right)));
  return sha256(records.join("\n"));
}

function exactIds(content, pattern, label) {
  return asciiSort(
    [...new Set([...content.matchAll(pattern)].map((match) => match[0]))],
    label,
  );
}

function decodeUtf8(bytes, label) {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new Error(`${label} is not valid UTF-8`);
  }
}

function artifactKind(path) {
  if (path.includes("/L5-detail/")) return "l5_design";
  if (path.includes("/test-design/helix/L5-")) {
    return "l8_integration_test_design";
  }
  if (path.includes("/L6-function-design/")) return "l6_function_design";
  if (path.includes("/test-design/helix/L6-")) return "l7_unit_test_design";
  throw new Error(`artifact has an unknown quartet kind: ${path}`);
}

function assertTemplate(manifest) {
  deepStrictEqual(Object.keys(manifest), TOP_LEVEL_KEYS);
  strictEqual(manifest.schema_version, "helix-layer-ledger-progress-s01.v2");
  strictEqual(manifest.fixture_id, "llpg-progress-s01-v1");
  strictEqual(
    manifest.digest_contract?.algorithm_id,
    "helix-llpg-s01-digest.v1",
  );
  strictEqual(
    manifest.snapshot_binding?.digest_algorithm,
    manifest.digest_contract.algorithm_id,
  );
  strictEqual(
    manifest.expected_terminal_receipt_digest_algorithm,
    manifest.digest_contract.algorithm_id,
  );
  strictEqual(manifest.slice_ids?.length, EXPECTED.sliceCount);
  strictEqual(manifest.slice_count, EXPECTED.sliceCount);
  strictEqual(manifest.artifact_inventory?.length, EXPECTED.artifactCount);
  strictEqual(manifest.artifact_count, EXPECTED.artifactCount);
  strictEqual(manifest.mutations?.length, EXPECTED.mutationCount);
  if (!Number.isSafeInteger(manifest.fixture_revision) || manifest.fixture_revision < 1) {
    throw new Error("fixture_revision must be a positive safe integer");
  }
  deepStrictEqual(manifest.digest_contract, EXPECTED_DIGEST_CONTRACT);
  deepStrictEqual(manifest.mutations, EXPECTED_MUTATIONS);

  const sliceIds = asciiSort(manifest.slice_ids, "slice ID");
  const artifactPaths = asciiSort(
    manifest.artifact_inventory.map((artifact) => artifact.path),
    "artifact path",
  );
  strictEqual(sliceIds.length, EXPECTED.sliceCount);
  strictEqual(artifactPaths.length, EXPECTED.artifactCount);

  const artifactsPerSlice = new Map();
  for (const artifact of manifest.artifact_inventory) {
    if (!sliceIds.includes(artifact.slice_id)) {
      throw new Error(`artifact has an unknown slice: ${artifact.slice_id}`);
    }
    const kinds = artifactsPerSlice.get(artifact.slice_id) ?? [];
    kinds.push(artifactKind(artifact.path));
    artifactsPerSlice.set(artifact.slice_id, kinds);
  }
  for (const sliceId of sliceIds) {
    deepStrictEqual(
      asciiSort(artifactsPerSlice.get(sliceId) ?? [], `${sliceId} artifact kind`),
      [
        "l5_design",
        "l6_function_design",
        "l7_unit_test_design",
        "l8_integration_test_design",
      ],
      `${sliceId} must own one artifact of every quartet kind`,
    );
  }

  deepStrictEqual(manifest.supporting_meta_oracle_receipt.oracle_ids, [
    "U-LLPG-S01",
    "IT-LLPG-S01",
  ]);
  strictEqual(
    manifest.supporting_meta_oracle_receipt.canonical_denominator_included,
    false,
  );
  strictEqual(
    manifest.expected_terminal_receipt_id,
    "DPR-LLPG-S01-V1",
  );
}

function generateFixture(original, commit) {
  assertTemplate(original);

  strictEqual(gitText(["cat-file", "-t", commit]), "commit");
  strictEqual(gitText(["rev-parse", `${commit}^{commit}`]), commit);
  const tree = gitText(["rev-parse", `${commit}^{tree}`]);
  if (!/^[0-9a-f]{40}$/.test(tree)) {
    throw new Error("resolved tree is not a full 40-character SHA");
  }

  const artifactContents = new Map();
  const artifactInventory = original.artifact_inventory.map((artifact) => {
    const bytes = gitBytesAt(commit, artifact.path);
    artifactContents.set(artifact.path, bytes);
    return { ...artifact, content_digest: sha256(bytes) };
  });

  const unitIds = new Set();
  const integrationIds = new Set();
  for (const artifact of artifactInventory) {
    if (!artifact.path.includes("/test-design/")) continue;
    const content = decodeUtf8(
      artifactContents.get(artifact.path),
      `${commit}:${artifact.path}`,
    );
    if (artifact.path.includes("/L6-")) {
      for (const id of exactIds(
        content,
        /\bU-[A-Z0-9]+-[0-9]{3}\b/g,
        "unit oracle ID",
      )) {
        unitIds.add(id);
      }
    }
    if (artifact.path.includes("/L5-")) {
      for (const id of exactIds(
        content,
        /\bIT-[A-Z0-9]+-[0-9]{3}\b/g,
        "integration oracle ID",
      )) {
        integrationIds.add(id);
      }
    }
  }

  const canonicalUnitIds = asciiSort([...unitIds], "unit oracle ID");
  const canonicalIntegrationIds = asciiSort(
    [...integrationIds],
    "integration oracle ID",
  );
  const canonicalHstIds = exactIds(
    decodeUtf8(
      gitBytesAt(commit, HST_SOURCE_PATH),
      `${commit}:${HST_SOURCE_PATH}`,
    ),
    /\bHST-CASE-[0-9]{3}-[0-9]{2}\b/g,
    "HST case ID",
  );

  strictEqual(canonicalUnitIds.length, EXPECTED.unitCount);
  strictEqual(canonicalIntegrationIds.length, EXPECTED.integrationCount);
  strictEqual(canonicalHstIds.length, EXPECTED.hstCount);
  strictEqual(canonicalUnitIds.includes("U-LLPG-S01"), false);
  strictEqual(canonicalIntegrationIds.includes("IT-LLPG-S01"), false);

  const sliceSetDigest = setDigest(original.slice_ids, "slice ID");
  const artifactPathContentSetDigest = artifactSetDigest(artifactInventory);
  const canonicalUnitSetDigest = setDigest(
    canonicalUnitIds,
    "unit oracle ID",
  );
  const canonicalIntegrationSetDigest = setDigest(
    canonicalIntegrationIds,
    "integration oracle ID",
  );
  const canonicalHstSetDigest = setDigest(canonicalHstIds, "HST case ID");
  const canonicalCombinedSetDigest = sha256(
    [
      canonicalUnitSetDigest,
      canonicalIntegrationSetDigest,
      canonicalHstSetDigest,
    ].join("\n"),
  );
  const designSnapshotDigest = sha256(
    [
      commit,
      tree,
      sliceSetDigest,
      artifactPathContentSetDigest,
      canonicalUnitSetDigest,
      canonicalIntegrationSetDigest,
      canonicalHstSetDigest,
    ].join("\n"),
  );

  const supporting = original.supporting_meta_oracle_receipt;
  const supportingReceiptDigest = sha256(
    [
      supporting.receipt_id,
      designSnapshotDigest,
      supporting.oracle_ids[0],
      supporting.oracle_ids[1],
      supporting.status,
      String(supporting.canonical_denominator_included),
    ].join("\n"),
  );
  const expectedTerminalReceiptDigest = sha256(
    [
      original.fixture_id,
      designSnapshotDigest,
      sliceSetDigest,
      artifactPathContentSetDigest,
      canonicalUnitSetDigest,
      canonicalIntegrationSetDigest,
      canonicalHstSetDigest,
      supportingReceiptDigest,
    ].join("\n"),
  );

  const sourceChanged = original.snapshot_binding.source_commit !== commit;
  const next = {
    ...original,
    fixture_revision:
      original.fixture_revision + (sourceChanged ? 1 : 0),
    snapshot_binding: {
      ...original.snapshot_binding,
      source_commit: commit,
      source_tree: tree,
      design_snapshot_digest: designSnapshotDigest,
    },
    slice_set_digest: sliceSetDigest,
    artifact_inventory: artifactInventory,
    artifact_path_content_set_digest: artifactPathContentSetDigest,
    canonical_unit_ids: canonicalUnitIds,
    canonical_unit_count: canonicalUnitIds.length,
    canonical_unit_set_digest: canonicalUnitSetDigest,
    canonical_integration_ids: canonicalIntegrationIds,
    canonical_integration_count: canonicalIntegrationIds.length,
    canonical_integration_set_digest: canonicalIntegrationSetDigest,
    canonical_hst_ids: canonicalHstIds,
    canonical_hst_count: canonicalHstIds.length,
    canonical_hst_set_digest: canonicalHstSetDigest,
    canonical_quartet_count:
      canonicalUnitIds.length + canonicalIntegrationIds.length,
    canonical_total_count:
      canonicalUnitIds.length +
      canonicalIntegrationIds.length +
      canonicalHstIds.length,
    canonical_combined_set_digest: canonicalCombinedSetDigest,
    supporting_meta_oracle_receipt: {
      ...supporting,
      receipt_digest: supportingReceiptDigest,
      snapshot_digest: designSnapshotDigest,
    },
    expected_terminal_receipt_digest: expectedTerminalReceiptDigest,
  };

  assertGenerated(original, next, commit, tree);
  return next;
}

function assertGenerated(original, next, commit, tree) {
  assertTemplate(next);
  deepStrictEqual(Object.keys(next), Object.keys(original));
  deepStrictEqual(next.digest_contract, original.digest_contract);
  deepStrictEqual(next.mutations, original.mutations);
  deepStrictEqual(next.slice_ids, original.slice_ids);
  strictEqual(next.schema_version, original.schema_version);
  strictEqual(next.fixture_id, original.fixture_id);
  strictEqual(next.expected_terminal_receipt_id, original.expected_terminal_receipt_id);
  strictEqual(next.expected_status, original.expected_status);
  strictEqual(
    next.expected_terminal_receipt_digest_algorithm,
    original.expected_terminal_receipt_digest_algorithm,
  );
  strictEqual(
    next.snapshot_binding.digest_algorithm,
    original.snapshot_binding.digest_algorithm,
  );
  strictEqual(
    next.supporting_meta_oracle_receipt.receipt_id,
    original.supporting_meta_oracle_receipt.receipt_id,
  );
  deepStrictEqual(
    next.supporting_meta_oracle_receipt.oracle_ids,
    original.supporting_meta_oracle_receipt.oracle_ids,
  );
  strictEqual(
    next.supporting_meta_oracle_receipt.status,
    original.supporting_meta_oracle_receipt.status,
  );
  strictEqual(
    next.supporting_meta_oracle_receipt.canonical_denominator_included,
    original.supporting_meta_oracle_receipt.canonical_denominator_included,
  );
  deepStrictEqual(
    next.artifact_inventory.map(({ slice_id, path }) => ({ slice_id, path })),
    original.artifact_inventory.map(({ slice_id, path }) => ({ slice_id, path })),
  );
  strictEqual(next.snapshot_binding.source_commit, commit);
  strictEqual(next.snapshot_binding.source_tree, tree);
  strictEqual(next.canonical_unit_count, EXPECTED.unitCount);
  strictEqual(next.canonical_integration_count, EXPECTED.integrationCount);
  strictEqual(next.canonical_hst_count, EXPECTED.hstCount);
  strictEqual(
    next.canonical_quartet_count,
    EXPECTED.unitCount + EXPECTED.integrationCount,
  );
  strictEqual(
    next.canonical_total_count,
    EXPECTED.unitCount + EXPECTED.integrationCount + EXPECTED.hstCount,
  );

  strictEqual(
    next.slice_set_digest,
    setDigest(next.slice_ids, "slice ID"),
  );
  strictEqual(
    next.artifact_path_content_set_digest,
    artifactSetDigest(next.artifact_inventory),
  );
  strictEqual(
    next.canonical_unit_set_digest,
    setDigest(next.canonical_unit_ids, "unit oracle ID"),
  );
  strictEqual(
    next.canonical_integration_set_digest,
    setDigest(next.canonical_integration_ids, "integration oracle ID"),
  );
  strictEqual(
    next.canonical_hst_set_digest,
    setDigest(next.canonical_hst_ids, "HST case ID"),
  );
  strictEqual(
    next.canonical_combined_set_digest,
    sha256(
      [
        next.canonical_unit_set_digest,
        next.canonical_integration_set_digest,
        next.canonical_hst_set_digest,
      ].join("\n"),
    ),
  );

  const expectedDesignDigest = sha256(
    [
      commit,
      tree,
      next.slice_set_digest,
      next.artifact_path_content_set_digest,
      next.canonical_unit_set_digest,
      next.canonical_integration_set_digest,
      next.canonical_hst_set_digest,
    ].join("\n"),
  );
  strictEqual(next.snapshot_binding.design_snapshot_digest, expectedDesignDigest);
  strictEqual(
    next.supporting_meta_oracle_receipt.snapshot_digest,
    expectedDesignDigest,
  );
  const expectedSupportingDigest = sha256(
    [
      next.supporting_meta_oracle_receipt.receipt_id,
      expectedDesignDigest,
      next.supporting_meta_oracle_receipt.oracle_ids[0],
      next.supporting_meta_oracle_receipt.oracle_ids[1],
      next.supporting_meta_oracle_receipt.status,
      String(
        next.supporting_meta_oracle_receipt.canonical_denominator_included,
      ),
    ].join("\n"),
  );
  strictEqual(
    next.supporting_meta_oracle_receipt.receipt_digest,
    expectedSupportingDigest,
  );
  strictEqual(
    next.expected_terminal_receipt_digest,
    sha256(
      [
        next.fixture_id,
        expectedDesignDigest,
        next.slice_set_digest,
        next.artifact_path_content_set_digest,
        next.canonical_unit_set_digest,
        next.canonical_integration_set_digest,
        next.canonical_hst_set_digest,
        expectedSupportingDigest,
      ].join("\n"),
    ),
  );
}

function serializeManifest(manifest) {
  const yaml = stringify(manifest, {
    lineWidth: 0,
    sortMapEntries: false,
  });
  const output = `${yaml.replace(/\r\n/g, "\n").replace(/\n*$/, "")}\n`;
  if (output.charCodeAt(0) === 0xfeff || output.includes("\r")) {
    throw new Error("serialized YAML must be UTF-8 without BOM and use LF");
  }
  const roundTrip = parse(output);
  deepStrictEqual(roundTrip, manifest);
  deepStrictEqual(Object.keys(roundTrip), TOP_LEVEL_KEYS);
  return output;
}

function atomicWriteManifest(output) {
  const directory = dirname(MANIFEST_PATH);
  const temporaryPath = `${MANIFEST_PATH}.tmp-${process.pid}-${Date.now()}`;
  const mode = statSync(MANIFEST_PATH).mode & 0o777;
  let fileDescriptor = null;
  let directoryDescriptor = null;
  try {
    fileDescriptor = openSync(temporaryPath, "wx", mode);
    fchmodSync(fileDescriptor, mode);
    writeFileSync(fileDescriptor, output, "utf8");
    fsyncSync(fileDescriptor);
    closeSync(fileDescriptor);
    fileDescriptor = null;

    const persisted = readFileSync(temporaryPath, "utf8");
    deepStrictEqual(parse(persisted), parse(output));
    strictEqual(persisted, output);
    renameSync(temporaryPath, MANIFEST_PATH);

    try {
      directoryDescriptor = openSync(directory, "r");
      fsyncSync(directoryDescriptor);
      closeSync(directoryDescriptor);
      directoryDescriptor = null;
    } catch (error) {
      if (
        !["EACCES", "EINVAL", "EISDIR", "ENOTSUP", "EPERM"].includes(
          error?.code,
        )
      ) {
        throw error;
      }
    }
  } finally {
    if (fileDescriptor !== null) closeSync(fileDescriptor);
    if (directoryDescriptor !== null) closeSync(directoryDescriptor);
    try {
      unlinkSync(temporaryPath);
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
  }
}

function main() {
  const { check, commit } = parseArgs(process.argv.slice(2));
  const originalText = readFileSync(MANIFEST_PATH, "utf8");
  if (originalText.charCodeAt(0) === 0xfeff || originalText.includes("\r")) {
    throw new Error("source manifest must be UTF-8 without BOM and use LF");
  }
  const original = parse(originalText);
  const next = generateFixture(original, commit);
  const nextText = serializeManifest(next);

  if (check) {
    if (originalText !== nextText) {
      throw new Error(
        `${MANIFEST_PATH} is stale for commit ${commit}; run without --check`,
      );
    }
    process.stdout.write(
      `OK: ${MANIFEST_PATH} is current for ${commit}\n`,
    );
    return;
  }

  if (originalText === nextText) {
    process.stdout.write(`OK: ${MANIFEST_PATH} is already current\n`);
    return;
  }
  atomicWriteManifest(nextText);
  process.stdout.write(
    `Updated ${MANIFEST_PATH} for ${commit} (${next.canonical_unit_count}/${next.canonical_integration_count}/${next.canonical_hst_count})\n`,
  );
}

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`ERROR: ${message}\n${usage()}\n`);
  process.exitCode = 1;
}
