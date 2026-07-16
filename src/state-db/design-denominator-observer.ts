import { execFileSync } from "node:child_process";
import { realpathSync } from "node:fs";
import { parseDocument } from "yaml";
import { z } from "zod";
import { canonicalJson, type Sha256Digest, sha256Digest } from "../shared/digest";
import { readVerifiedRepoFile } from "./closure-authority-backfill-loader";

export const DESIGN_DENOMINATOR_MANIFEST =
  "docs/test-design/helix/fixtures/layer-ledger-pair-gate-progress-s01.manifest" as const;

const SLICE_IDS = [
  "HDS-HIL-01",
  "HDS-HIL-02",
  "HDS-HIL-03",
  "HDS-HIL-04",
  "HDS-HIL-05",
  "HDS-HIL-06",
  "HDS-HIL-07",
  "HDS-HIL-08",
  "HDS-HIL-09A",
  "HDS-HIL-09B",
  "HDS-HIL-10",
  "HDS-HIL-11",
  "HDS-HIL-12",
  "HDS-HIL-13",
  "HDS-HIL-14",
  "HDS-HIL-15",
  "HDS-HIL-16",
  "HDS-HIL-17",
  "HDS-HIL-18",
] as const;

const digestSchema = z.string().regex(/^sha256:[0-9a-f]{64}$/);
const idSchema = z
  .string()
  .trim()
  .min(1)
  .regex(/^[A-Z0-9-]+$/);
const artifactSchema = z
  .object({
    slice_id: z.enum(SLICE_IDS),
    path: z.string().min(1),
    content_digest: digestSchema,
  })
  .strict();

const manifestSchema = z
  .object({
    schema_version: z.literal("helix-layer-ledger-progress-s01.v2"),
    fixture_id: z.literal("llpg-progress-s01-v1"),
    fixture_revision: z.number().int().positive(),
    digest_contract: z.record(z.string(), z.unknown()),
    snapshot_binding: z
      .object({
        source_commit: z.string().regex(/^[0-9a-f]{40}$/),
        source_tree: z.string().regex(/^[0-9a-f]{40}$/),
        design_snapshot_digest: digestSchema,
        digest_algorithm: z.literal("helix-llpg-s01-digest.v1"),
      })
      .strict(),
    slice_ids: z.array(z.enum(SLICE_IDS)),
    slice_count: z.literal(19),
    slice_set_digest: digestSchema,
    artifact_inventory: z.array(artifactSchema),
    artifact_count: z.literal(76),
    artifact_path_content_set_digest: digestSchema,
    canonical_unit_ids: z.array(idSchema),
    canonical_unit_count: z.literal(475),
    canonical_unit_set_digest: digestSchema,
    canonical_integration_ids: z.array(idSchema),
    canonical_integration_count: z.literal(360),
    canonical_integration_set_digest: digestSchema,
    canonical_hst_ids: z.array(idSchema),
    canonical_hst_count: z.literal(411),
    canonical_hst_set_digest: digestSchema,
    canonical_quartet_count: z.literal(835),
    canonical_total_count: z.literal(1246),
    canonical_combined_set_digest: digestSchema,
    supporting_meta_oracle_receipt: z.record(z.string(), z.unknown()),
    expected_terminal_receipt_id: z.string().min(1),
    expected_terminal_receipt_digest: digestSchema,
    expected_terminal_receipt_digest_algorithm: z.literal("helix-llpg-s01-digest.v1"),
    expected_status: z.literal("designed_not_implemented"),
    mutations: z.array(z.record(z.string(), z.unknown())),
  })
  .strict();

export interface CanonicalArtifactObservation {
  sliceId: (typeof SLICE_IDS)[number];
  path: string;
  declaredHistoricalDigest: Sha256Digest;
  currentContentDigest: Sha256Digest;
  matchesHistoricalDigest: boolean;
  headContentDigest: Sha256Digest | null;
  matchesHead: boolean;
}

export interface CanonicalDesignDenominatorObservation {
  manifestPath: string;
  manifestDigest: Sha256Digest;
  authorityModel: {
    schemaVersion: string;
    fixtureId: string;
    digestAlgorithm: string;
    digestContractDigest: Sha256Digest;
  };
  layerLedgerRevision: {
    fixtureRevision: number;
    declaredHistoricalSourceCommit: string;
    declaredHistoricalSourceTree: string;
    declaredHistoricalDesignSnapshotDigest: Sha256Digest;
  };
  sourceRepository: { headOid: string; treeOid: string };
  sliceIds: readonly string[];
  artifactObservations: readonly CanonicalArtifactObservation[];
  currentArtifactSetDigest: Sha256Digest;
  historicalArtifactSetDigest: Sha256Digest;
  historicalDigestMatchCount: number;
  historicalDigestMismatchCount: number;
  headDigestMatchCount: number;
  headDigestMismatchCount: number;
  observationDigest: Sha256Digest;
}

function git(root: string, revision: string): string {
  return execFileSync("git", ["-C", root, "rev-parse", revision], { encoding: "utf8" }).trim();
}

function exactUnique(values: readonly string[], label: string): void {
  if (new Set(values).size !== values.length) throw new Error(`${label} contains duplicate IDs`);
}

export function observeCanonicalDesignDenominator(input: {
  repoRoot: string;
  manifestPath?: string;
}): CanonicalDesignDenominatorObservation {
  const root = realpathSync(input.repoRoot);
  const manifestPath = input.manifestPath ?? DESIGN_DENOMINATOR_MANIFEST;
  const manifestSource = readVerifiedRepoFile(root, manifestPath);
  const document = parseDocument(manifestSource.bytes.toString("utf8"), { uniqueKeys: true });
  if (document.errors.length > 0)
    throw new Error(`invalid denominator YAML: ${document.errors[0]?.message}`);
  const manifest = manifestSchema.parse(document.toJS({ maxAliasCount: 0 }));

  if (canonicalJson(manifest.slice_ids) !== canonicalJson([...SLICE_IDS]))
    throw new Error("canonical slice ID set/order drift");
  exactUnique(manifest.slice_ids, "slice denominator");
  exactUnique(
    manifest.artifact_inventory.map((entry) => entry.path),
    "artifact path denominator",
  );
  for (const ids of [
    manifest.canonical_unit_ids,
    manifest.canonical_integration_ids,
    manifest.canonical_hst_ids,
  ])
    exactUnique(ids, "canonical assertion denominator");
  if (
    manifest.canonical_unit_ids.length !== manifest.canonical_unit_count ||
    manifest.canonical_integration_ids.length !== manifest.canonical_integration_count ||
    manifest.canonical_hst_ids.length !== manifest.canonical_hst_count
  )
    throw new Error("canonical assertion count drift");

  const perSlice = new Map<string, number>();
  const artifactObservations = manifest.artifact_inventory
    .map((entry) => {
      perSlice.set(entry.slice_id, (perSlice.get(entry.slice_id) ?? 0) + 1);
      const current = readVerifiedRepoFile(root, entry.path).digest;
      let headContentDigest: Sha256Digest | null = null;
      try {
        headContentDigest = sha256Digest(
          execFileSync("git", ["-C", root, "show", `HEAD:${entry.path}`]),
        );
      } catch {
        headContentDigest = null;
      }
      return {
        sliceId: entry.slice_id,
        path: entry.path,
        declaredHistoricalDigest: entry.content_digest as Sha256Digest,
        currentContentDigest: current,
        matchesHistoricalDigest: current === entry.content_digest,
        headContentDigest,
        matchesHead: current === headContentDigest,
      };
    })
    .sort((a, b) => a.path.localeCompare(b.path));
  if (artifactObservations.length !== 76 || SLICE_IDS.some((id) => perSlice.get(id) !== 4))
    throw new Error("canonical 19 slice / 76 artifact cardinality drift");

  const currentArtifactSetDigest = sha256Digest(
    canonicalJson(
      artifactObservations.map(({ sliceId, path, currentContentDigest }) => ({
        sliceId,
        path,
        currentContentDigest,
      })),
    ),
  );
  const authorityModel = {
    schemaVersion: manifest.schema_version,
    fixtureId: manifest.fixture_id,
    digestAlgorithm: manifest.snapshot_binding.digest_algorithm,
    digestContractDigest: sha256Digest(canonicalJson(manifest.digest_contract)),
  };
  const layerLedgerRevision = {
    fixtureRevision: manifest.fixture_revision,
    declaredHistoricalSourceCommit: manifest.snapshot_binding.source_commit,
    declaredHistoricalSourceTree: manifest.snapshot_binding.source_tree,
    declaredHistoricalDesignSnapshotDigest: manifest.snapshot_binding
      .design_snapshot_digest as Sha256Digest,
  };
  const sourceRepository = { headOid: git(root, "HEAD"), treeOid: git(root, "HEAD^{tree}") };
  const historicalDigestMatchCount = artifactObservations.filter(
    (entry) => entry.matchesHistoricalDigest,
  ).length;
  const headDigestMatchCount = artifactObservations.filter((entry) => entry.matchesHead).length;
  const resultWithoutDigest = {
    manifestPath,
    manifestDigest: manifestSource.digest,
    authorityModel,
    layerLedgerRevision,
    sourceRepository,
    sliceIds: [...SLICE_IDS],
    artifactObservations,
    currentArtifactSetDigest,
    historicalArtifactSetDigest: manifest.artifact_path_content_set_digest as Sha256Digest,
    historicalDigestMatchCount,
    historicalDigestMismatchCount: 76 - historicalDigestMatchCount,
    headDigestMatchCount,
    headDigestMismatchCount: 76 - headDigestMatchCount,
  };
  return {
    ...resultWithoutDigest,
    observationDigest: sha256Digest(canonicalJson(resultWithoutDigest)),
  };
}
