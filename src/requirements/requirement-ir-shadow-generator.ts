import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { compileRequirementIrShadow } from "./requirement-ir-shadow";

const outputDirectory = process.argv[2] ?? "generated/requirements-ir";

const shadow = compileRequirementIrShadow({
  requirementSource: readFileSync(
    "docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md",
    "utf8",
  ),
  definitionLedger: readFileSync(
    "docs/governance/infinity-loop-requirement-definition-ledger.md",
    "utf8",
  ),
  systemContractSource: readFileSync(
    "docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md",
    "utf8",
  ),
  systemTestSource: readFileSync(
    "docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md",
    "utf8",
  ),
});

function digest(value: unknown): string {
  return `sha256:${createHash("sha256").update(JSON.stringify(value), "utf8").digest("hex")}`;
}

function keyed<T>(records: T[], identity: (record: T) => string): Record<string, T> {
  return Object.fromEntries(records.map((record) => [identity(record), record]));
}

const shards = {
  requirements: keyed(shadow.requirements, (record) => record.requirement_id),
  system_contracts: keyed(shadow.system_contracts, (record) => record.system_contract_id),
  acceptance_cases: keyed(shadow.acceptance_cases, (record) => record.acceptance_id),
  system_tests: keyed(shadow.system_tests, (record) => record.system_test_id),
};

mkdirSync(outputDirectory, { recursive: true });
const shardManifest = Object.entries(shards).map(([kind, records]) => {
  const path = `${outputDirectory}/${kind}.json`;
  writeFileSync(path, `${JSON.stringify(records, null, 2)}\n`, "utf8");
  return {
    kind,
    path,
    count: Object.keys(records).length,
    digest: digest(records),
  };
});
const manifest = {
  schema_version: shadow.schema_version,
  authority: shadow.authority,
  source_authority: shadow.source_authority,
  partition: "stable_id_keyed_shards",
  shards: shardManifest,
  root_digest: shadow.root_digest,
};
const manifestPath = `${outputDirectory}/manifest.json`;
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
process.stdout.write(
  `${JSON.stringify({
    output_directory: outputDirectory,
    manifest_path: manifestPath,
    authority: shadow.authority,
    requirements: shadow.requirements.length,
    system_contracts: shadow.system_contracts.length,
    acceptance_cases: shadow.acceptance_cases.length,
    system_tests: shadow.system_tests.length,
    root_digest: shadow.root_digest,
  })}\n`,
);
