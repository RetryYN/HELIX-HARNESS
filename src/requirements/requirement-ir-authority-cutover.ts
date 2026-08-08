import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { promoteRequirementIrToCanonical } from "./requirement-authority";
import { loadRequirementIrShadowFromShards } from "./requirement-generated-view";

function digest(value: unknown): string {
  return `sha256:${createHash("sha256").update(JSON.stringify(value), "utf8").digest("hex")}`;
}

function keyed<T>(records: T[], identity: (record: T) => string): Record<string, T> {
  return Object.fromEntries(records.map((record) => [identity(record), record]));
}

const repoRoot = process.cwd();
const outputDirectory = process.argv[2] ?? "requirements-ir";
const canonical = promoteRequirementIrToCanonical(
  loadRequirementIrShadowFromShards(repoRoot, "generated/requirements-ir/manifest.json"),
);
const shards = {
  requirements: keyed(canonical.requirements, (record) => record.requirement_id),
  system_contracts: keyed(canonical.system_contracts, (record) => record.system_contract_id),
  acceptance_cases: keyed(canonical.acceptance_cases, (record) => record.acceptance_id),
  system_tests: keyed(canonical.system_tests, (record) => record.system_test_id),
  refinement_contracts: keyed(
    canonical.refinement_contracts,
    (record) => record.refinement_contract_id,
  ),
};
mkdirSync(outputDirectory, { recursive: true });
const manifestShards = Object.entries(shards).map(([kind, records]) => {
  const path = `${outputDirectory}/${kind}.json`;
  writeFileSync(path, `${JSON.stringify(records, null, 2)}\n`, "utf8");
  return { kind, path, count: Object.keys(records).length, digest: digest(records) };
});
const manifest = {
  schema_version: canonical.schema_version,
  authority: canonical.authority,
  source_authority: canonical.source_authority,
  partition: "stable_id_keyed_shards",
  baseline_root_digest: canonical.baseline_root_digest,
  shards: manifestShards,
  root_digest: canonical.root_digest,
};
writeFileSync(`${outputDirectory}/manifest.json`, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
process.stdout.write(
  `${JSON.stringify({
    output_directory: outputDirectory,
    root_digest: canonical.root_digest,
    requirements: canonical.requirements.length,
    system_contracts: canonical.system_contracts.length,
    acceptance_cases: canonical.acceptance_cases.length,
    system_tests: canonical.system_tests.length,
    refinement_contracts: canonical.refinement_contracts.length,
  })}\n`,
);
