import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { isAbsolute, join, relative, resolve } from "node:path";
import type { CanonicalRequirementIr, CanonicalRequirementRecord } from "./requirement-authority";
import {
  type AcceptanceShadowRecord,
  type RequirementIrShadow,
  type RequirementShadowRecord,
  requirementIrRootDigest,
  requirementIrShadowRootDigest,
  type SystemContractShadowRecord,
  type SystemTestShadowRecord,
} from "./requirement-ir-shadow";

const SHADOW_GENERATED_HEADER = "<!-- GENERATED FROM requirements-ir shadow -->";
const SHADOW_DO_NOT_EDIT_HEADER =
  "<!-- DO NOT EDIT: current authority remains legacy Markdown until PR-5 cutover -->";
const CANONICAL_GENERATED_HEADER = "<!-- GENERATED FROM requirements-ir -->";
const CANONICAL_DO_NOT_EDIT_HEADER = "<!-- DO NOT EDIT: canonical authority is JSON -->";
const RECORD_MARKER = /<!-- HELIX:REQUIREMENT_IR_RECORD:([A-Za-z0-9_-]+) -->/g;
const ROOT_MARKER = /<!-- HELIX:REQUIREMENT_IR_ROOT:([A-Za-z0-9_-]+) -->/;
const DIGEST = /^sha256:[0-9a-f]{64}$/;

type ShardKind = "requirements" | "system_contracts" | "acceptance_cases" | "system_tests";

interface RequirementIrShadowManifest {
  schema_version: "helix-requirement-ir-shadow.v1" | "helix-requirement-ir.v1";
  authority: "shadow_noncanonical" | "canonical";
  source_authority: "legacy_markdown_current_until_cutover" | "json_stable_id_shards";
  partition: "stable_id_keyed_shards";
  shards: Array<{ kind: ShardKind; path: string; count: number; digest: string }>;
  root_digest: string;
}

type RequirementIrViewSource = RequirementIrShadow | CanonicalRequirementIr;

function sha256(value: string): string {
  return `sha256:${createHash("sha256").update(value, "utf8").digest("hex")}`;
}

function safeShardPath(repoRoot: string, path: string): string {
  if (isAbsolute(path)) throw new Error(`absolute shard path is forbidden: ${path}`);
  const root = resolve(repoRoot);
  const target = resolve(root, path);
  const rel = relative(root, target);
  if (rel.startsWith("..") || isAbsolute(rel)) {
    throw new Error(`shard path escapes repository: ${path}`);
  }
  return target;
}

function readKeyedShard<T>(
  repoRoot: string,
  entry: RequirementIrShadowManifest["shards"][number],
): Record<string, T> {
  const records = JSON.parse(readFileSync(safeShardPath(repoRoot, entry.path), "utf8")) as Record<
    string,
    T
  >;
  if (Object.keys(records).length !== entry.count) {
    throw new Error(
      `${entry.kind} count mismatch: manifest=${entry.count} actual=${Object.keys(records).length}`,
    );
  }
  const observedDigest = sha256(JSON.stringify(records));
  if (observedDigest !== entry.digest) {
    throw new Error(
      `${entry.kind} digest mismatch: manifest=${entry.digest} actual=${observedDigest}`,
    );
  }
  return records;
}

function requireIdentityMatch<T>(
  kind: ShardKind,
  records: Record<string, T>,
  identity: (record: T) => string,
): T[] {
  return Object.entries(records).map(([key, record]) => {
    if (identity(record) !== key) {
      throw new Error(`${kind} stable ID mismatch: key=${key} record=${identity(record)}`);
    }
    return record;
  });
}

function requireShard(
  byKind: ReadonlyMap<ShardKind, RequirementIrShadowManifest["shards"][number]>,
  kind: ShardKind,
): RequirementIrShadowManifest["shards"][number] {
  const entry = byKind.get(kind);
  if (!entry) throw new Error(`requirement IR shadow shard is missing: ${kind}`);
  return entry;
}

export function loadRequirementIrShadowFromShards(
  repoRoot: string,
  manifestPath = "generated/requirements-ir/manifest.json",
): RequirementIrShadow {
  const manifest = JSON.parse(
    readFileSync(safeShardPath(repoRoot, manifestPath), "utf8"),
  ) as RequirementIrShadowManifest;
  if (
    manifest.schema_version !== "helix-requirement-ir-shadow.v1" ||
    manifest.authority !== "shadow_noncanonical" ||
    manifest.source_authority !== "legacy_markdown_current_until_cutover" ||
    manifest.partition !== "stable_id_keyed_shards" ||
    !DIGEST.test(manifest.root_digest)
  ) {
    throw new Error("requirement IR shadow manifest authority is invalid");
  }
  const exactKinds: ShardKind[] = [
    "requirements",
    "system_contracts",
    "acceptance_cases",
    "system_tests",
  ];
  if (
    manifest.shards.length !== exactKinds.length ||
    exactKinds.some((kind) => manifest.shards.filter((entry) => entry.kind === kind).length !== 1)
  ) {
    throw new Error("requirement IR shadow manifest shard set is not exact");
  }
  const byKind = new Map(manifest.shards.map((entry) => [entry.kind, entry]));
  const requirements = requireIdentityMatch(
    "requirements",
    readKeyedShard<RequirementShadowRecord>(repoRoot, requireShard(byKind, "requirements")),
    (record) => record.requirement_id,
  );
  const systemContracts = requireIdentityMatch(
    "system_contracts",
    readKeyedShard<SystemContractShadowRecord>(repoRoot, requireShard(byKind, "system_contracts")),
    (record) => record.system_contract_id,
  );
  const acceptanceCases = requireIdentityMatch(
    "acceptance_cases",
    readKeyedShard<AcceptanceShadowRecord>(repoRoot, requireShard(byKind, "acceptance_cases")),
    (record) => record.acceptance_id,
  );
  const systemTests = requireIdentityMatch(
    "system_tests",
    readKeyedShard<SystemTestShadowRecord>(repoRoot, requireShard(byKind, "system_tests")),
    (record) => record.system_test_id,
  );
  const root = {
    schema_version: manifest.schema_version,
    authority: manifest.authority,
    source_authority: manifest.source_authority,
    requirements,
    system_contracts: systemContracts,
    acceptance_cases: acceptanceCases,
    system_tests: systemTests,
  };
  const observedRootDigest = requirementIrShadowRootDigest(root);
  if (observedRootDigest !== manifest.root_digest) {
    throw new Error(
      `requirement IR root digest mismatch: manifest=${manifest.root_digest} actual=${observedRootDigest}`,
    );
  }
  return { ...root, root_digest: observedRootDigest };
}

export function loadCanonicalRequirementIrFromShards(
  repoRoot: string,
  manifestPath = "requirements-ir/manifest.json",
): CanonicalRequirementIr {
  const manifest = JSON.parse(
    readFileSync(safeShardPath(repoRoot, manifestPath), "utf8"),
  ) as RequirementIrShadowManifest;
  if (
    manifest.schema_version !== "helix-requirement-ir.v1" ||
    manifest.authority !== "canonical" ||
    manifest.source_authority !== "json_stable_id_shards" ||
    manifest.partition !== "stable_id_keyed_shards" ||
    !DIGEST.test(manifest.root_digest)
  ) {
    throw new Error("canonical requirement IR manifest authority is invalid");
  }
  const exactKinds: ShardKind[] = [
    "requirements",
    "system_contracts",
    "acceptance_cases",
    "system_tests",
  ];
  if (
    manifest.shards.length !== exactKinds.length ||
    exactKinds.some((kind) => manifest.shards.filter((entry) => entry.kind === kind).length !== 1)
  ) {
    throw new Error("canonical requirement IR manifest shard set is not exact");
  }
  const byKind = new Map(manifest.shards.map((entry) => [entry.kind, entry]));
  const requirements = requireIdentityMatch(
    "requirements",
    readKeyedShard<CanonicalRequirementRecord>(repoRoot, requireShard(byKind, "requirements")),
    (record) => record.requirement_id,
  );
  const systemContracts = requireIdentityMatch(
    "system_contracts",
    readKeyedShard<SystemContractShadowRecord>(repoRoot, requireShard(byKind, "system_contracts")),
    (record) => record.system_contract_id,
  );
  const acceptanceCases = requireIdentityMatch(
    "acceptance_cases",
    readKeyedShard<AcceptanceShadowRecord>(repoRoot, requireShard(byKind, "acceptance_cases")),
    (record) => record.acceptance_id,
  );
  const systemTests = requireIdentityMatch(
    "system_tests",
    readKeyedShard<SystemTestShadowRecord>(repoRoot, requireShard(byKind, "system_tests")),
    (record) => record.system_test_id,
  );
  const root = {
    schema_version: manifest.schema_version,
    authority: manifest.authority,
    source_authority: manifest.source_authority,
    requirements,
    system_contracts: systemContracts,
    acceptance_cases: acceptanceCases,
    system_tests: systemTests,
  };
  const observedRootDigest = requirementIrRootDigest(root);
  if (observedRootDigest !== manifest.root_digest) {
    throw new Error(
      `canonical requirement IR root digest mismatch: manifest=${manifest.root_digest} actual=${observedRootDigest}`,
    );
  }
  return { ...root, root_digest: observedRootDigest };
}

function marker(record: unknown): string {
  return `<!-- HELIX:REQUIREMENT_IR_RECORD:${Buffer.from(JSON.stringify(record), "utf8").toString("base64url")} -->`;
}

function escapeCell(value: string): string {
  return value.replaceAll("\\", "\\\\").replaceAll("|", "\\|").replaceAll("\n", "<br>");
}

export function renderRequirementGeneratedView(shadow: RequirementIrViewSource): string {
  const canonical = shadow.authority === "canonical";
  const rootMarker = Buffer.from(
    JSON.stringify({
      schema_version: shadow.schema_version,
      authority: shadow.authority,
      source_authority: shadow.source_authority,
      root_digest: shadow.root_digest,
    }),
    "utf8",
  ).toString("base64url");
  const lines = [
    canonical ? CANONICAL_GENERATED_HEADER : SHADOW_GENERATED_HEADER,
    canonical ? CANONICAL_DO_NOT_EDIT_HEADER : SHADOW_DO_NOT_EDIT_HEADER,
    `<!-- HELIX:REQUIREMENT_IR_ROOT:${rootMarker} -->`,
    "",
    "# HELIX 要求・要件生成ビュー",
    "",
    `- authority: \`${shadow.authority}\``,
    `- source authority: \`${shadow.source_authority}\``,
    `- JSON root digest: \`${shadow.root_digest}\``,
    "",
    "## 要求・要件",
    "",
    "| ID | 種別 | 本文 | owner | 状態 | semantic digest |",
    "|---|---|---|---|---|---|",
  ];
  for (const record of shadow.requirements) {
    lines.push(
      `| ${record.requirement_id} | ${record.kind} | ${escapeCell(record.statement.text)} | ${record.primary_system_contract_id} | ${record.definition_status} | ${record.semantic_digest} |`,
      marker(record),
    );
  }
  lines.push(
    "",
    "## システム契約",
    "",
    "| ID | 要求・要件 | HAT | 状態 | semantic digest |",
    "|---|---|---|---|---|",
  );
  for (const record of shadow.system_contracts) {
    lines.push(
      `| ${record.system_contract_id} | ${record.requirement_ids.join(", ")} | ${record.system_test_id} | ${record.status} | ${record.semantic_digest} |`,
      marker(record),
    );
  }
  lines.push(
    "",
    "## 受入条件",
    "",
    "| ID | 契約 | 極性 | HAT | semantic digest |",
    "|---|---|---|---|---|",
  );
  for (const record of shadow.acceptance_cases) {
    lines.push(
      `| ${record.acceptance_id} | ${record.system_contract_id} | ${record.polarity} | ${record.system_test_id} | ${record.semantic_digest} |`,
      marker(record),
    );
  }
  lines.push(
    "",
    "## 総合テスト",
    "",
    "| ID | 契約 | HAC | 状態 | semantic digest |",
    "|---|---|---|---|---|",
  );
  for (const record of shadow.system_tests) {
    lines.push(
      `| ${record.system_test_id} | ${record.system_contract_id} | ${record.acceptance_ids.join(", ")} | ${record.status} | ${record.semantic_digest} |`,
      marker(record),
    );
  }
  return `${lines.join("\n")}\n`;
}

export function parseRequirementGeneratedView(markdown: string): RequirementIrViewSource {
  const canonicalHeader = `${CANONICAL_GENERATED_HEADER}\n${CANONICAL_DO_NOT_EDIT_HEADER}\n`;
  const shadowHeader = `${SHADOW_GENERATED_HEADER}\n${SHADOW_DO_NOT_EDIT_HEADER}\n`;
  if (!markdown.startsWith(canonicalHeader) && !markdown.startsWith(shadowHeader)) {
    throw new Error("generated requirement view authority header is missing");
  }
  const rootMatch = markdown.match(ROOT_MARKER);
  if (!rootMatch) throw new Error("generated requirement view root marker is missing");
  const rootAuthority = JSON.parse(
    Buffer.from(rootMatch[1] ?? "", "base64url").toString("utf8"),
  ) as {
    schema_version: string;
    authority: string;
    source_authority: string;
    root_digest: string;
  };
  const requirements: Array<RequirementShadowRecord | CanonicalRequirementRecord> = [];
  const systemContracts: SystemContractShadowRecord[] = [];
  const acceptanceCases: AcceptanceShadowRecord[] = [];
  const systemTests: SystemTestShadowRecord[] = [];
  for (const match of markdown.matchAll(RECORD_MARKER)) {
    const record = JSON.parse(Buffer.from(match[1] ?? "", "base64url").toString("utf8")) as {
      schema_version?: string;
    };
    if (record.schema_version === "helix-requirement.v1") {
      requirements.push(record as RequirementShadowRecord | CanonicalRequirementRecord);
    } else if (record.schema_version === "helix-system-contract.v1") {
      systemContracts.push(record as SystemContractShadowRecord);
    } else if (record.schema_version === "helix-acceptance-case.v1") {
      acceptanceCases.push(record as AcceptanceShadowRecord);
    } else if (record.schema_version === "helix-system-test.v1") {
      systemTests.push(record as SystemTestShadowRecord);
    } else {
      throw new Error(`unknown generated requirement record: ${String(record.schema_version)}`);
    }
  }
  if (
    requirements.length !== 153 ||
    systemContracts.length !== 24 ||
    acceptanceCases.length !== 72 ||
    systemTests.length !== 24
  ) {
    throw new Error(
      `generated requirement record count mismatch: ${requirements.length}/${systemContracts.length}/${acceptanceCases.length}/${systemTests.length}`,
    );
  }
  const root = {
    schema_version: rootAuthority.schema_version,
    authority: rootAuthority.authority,
    source_authority: rootAuthority.source_authority,
    requirements,
    system_contracts: systemContracts,
    acceptance_cases: acceptanceCases,
    system_tests: systemTests,
  };
  const observedRootDigest = requirementIrRootDigest(root);
  if (observedRootDigest !== rootAuthority.root_digest) {
    throw new Error(
      `generated requirement view root digest mismatch: marker=${rootAuthority.root_digest} actual=${observedRootDigest}`,
    );
  }
  if (
    rootAuthority.authority === "canonical" &&
    rootAuthority.schema_version === "helix-requirement-ir.v1" &&
    rootAuthority.source_authority === "json_stable_id_shards"
  ) {
    return {
      ...(root as Omit<CanonicalRequirementIr, "root_digest">),
      root_digest: observedRootDigest,
    };
  }
  if (
    rootAuthority.authority === "shadow_noncanonical" &&
    rootAuthority.schema_version === "helix-requirement-ir-shadow.v1" &&
    rootAuthority.source_authority === "legacy_markdown_current_until_cutover"
  ) {
    return {
      ...(root as Omit<RequirementIrShadow, "root_digest">),
      root_digest: observedRootDigest,
    };
  }
  throw new Error("generated requirement view root authority is invalid");
}

export function writeRequirementGeneratedViewInputPath(repoRoot: string): string {
  return join(repoRoot, "requirements-ir", "manifest.json");
}
