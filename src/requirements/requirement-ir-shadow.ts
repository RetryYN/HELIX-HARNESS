import { createHash } from "node:crypto";

const SHA256 = /^sha256:[0-9a-f]{64}$/;
const REQUIREMENT_ID = /^HIL-(BR|FR|TR|NFR)-\d{2}$/;
const SYSTEM_CONTRACT_ID = /^HR-FR-HIL-\d{2}$/;
const ACCEPTANCE_ID = /^HAC-HIL-\d{2}[abc]$/;
const SYSTEM_TEST_ID = /^HAT-HIL-\d{2}$/;

export const correctedDownstreamOwnerExactSet = {
  "HIL-BR-32": "HR-FR-HIL-23",
  "HIL-BR-33": "HR-FR-HIL-24",
  "HIL-FR-64": "HR-FR-HIL-23",
  "HIL-FR-65": "HR-FR-HIL-23",
  "HIL-FR-66": "HR-FR-HIL-23",
  "HIL-FR-67": "HR-FR-HIL-23",
  "HIL-FR-68": "HR-FR-HIL-23",
  "HIL-FR-69": "HR-FR-HIL-23",
  "HIL-NFR-37": "HR-FR-HIL-23",
  "HIL-NFR-38": "HR-FR-HIL-23",
  "HIL-NFR-39": "HR-FR-HIL-23",
  "HIL-NFR-40": "HR-FR-HIL-23",
} as const;

export interface RequirementIrShadowInput {
  requirementSource: string;
  definitionLedger: string;
  systemContractSource: string;
  systemTestSource: string;
}

export interface RequirementShadowRecord {
  schema_version: "helix-requirement.v1";
  requirement_id: string;
  revision: number;
  kind: "business" | "functional" | "technical" | "non_functional";
  status: "specified";
  definition_status: "active-freeze-pending";
  evidence_origin: "legacy_markdown_migration";
  statement: { text: string; semantic_digest: string };
  source: { canonical_pointer: string; authority_id: string };
  assertion_id: string;
  primary_system_contract_id: string;
  acceptance_ids: string[];
  system_test_id: string;
  downstream_obligation: {
    obligation_id: string;
    owner_id: string;
    status: "pending_pair_descent";
    route_issue_ids: number[];
  };
  actor_ids: string[];
  task_ids: string[];
  surface_ids: string[];
  design_template_ids: string[];
  design_obligation_ids: string[];
  required_design_artifact_kinds: string[];
  pending_resolution: string[];
  semantic_digest: string;
}

export interface SystemContractShadowRecord {
  schema_version: "helix-system-contract.v1";
  system_contract_id: string;
  revision: 1;
  status: "specified";
  requirement_ids: string[];
  behavior: string;
  transition_contract: string;
  failure_and_evidence: string;
  acceptance_ids: string[];
  system_test_id: string;
  semantic_digest: string;
}

export interface AcceptanceShadowRecord {
  schema_version: "helix-acceptance-case.v1";
  acceptance_id: string;
  revision: 1;
  status: "specified";
  system_contract_id: string;
  polarity: "positive" | "negative" | "boundary";
  statement: string;
  system_test_id: string;
  semantic_digest: string;
}

export interface SystemTestShadowRecord {
  schema_version: "helix-system-test.v1";
  system_test_id: string;
  revision: 1;
  status: "designed_not_implemented";
  system_contract_id: string;
  acceptance_ids: string[];
  supporting_test_ids: string[];
  scenario: string;
  required_evidence: string;
  negative_boundary: string;
  semantic_digest: string;
}

export interface RequirementIrShadow {
  schema_version: "helix-requirement-ir-shadow.v1";
  authority: "shadow_noncanonical";
  source_authority: "legacy_markdown_current_until_cutover";
  requirements: RequirementShadowRecord[];
  system_contracts: SystemContractShadowRecord[];
  acceptance_cases: AcceptanceShadowRecord[];
  system_tests: SystemTestShadowRecord[];
  root_digest: string;
}

function splitTableRow(line: string): string[] | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith("|") || !trimmed.endsWith("|")) return null;
  return trimmed
    .slice(1, -1)
    .split("|")
    .map((cell) => cell.trim());
}

function tableRows(source: string): string[][] {
  return source
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map(splitTableRow)
    .filter((row): row is string[] => row !== null);
}

function unwrap(value: string): string {
  return value
    .trim()
    .replace(/^\*\*(.*)\*\*$/u, "$1")
    .replace(/^`(.*)`$/u, "$1");
}

function sha256Text(value: string): string {
  return `sha256:${createHash("sha256").update(value, "utf8").digest("hex")}`;
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nested]) => [key, canonicalize(nested)]),
    );
  }
  return value;
}

function semanticDigest(value: unknown): string {
  return sha256Text(JSON.stringify(canonicalize(value)));
}

function exactIds(value: string, pattern: RegExp): string[] {
  const global = new RegExp(
    pattern.source,
    pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`,
  );
  return [...value.matchAll(global)].map((match) => match[0]);
}

function requireExactCount<T>(name: string, values: T[], expected: number): void {
  if (values.length !== expected) {
    throw new Error(`${name} count mismatch: expected=${expected} actual=${values.length}`);
  }
}

function requireUnique(name: string, values: string[]): void {
  const duplicates = values.filter((value, index) => values.indexOf(value) !== index);
  if (duplicates.length > 0) {
    throw new Error(`${name} duplicates: ${[...new Set(duplicates)].join(",")}`);
  }
}

function requirementKind(requirementId: string): RequirementShadowRecord["kind"] {
  if (requirementId.startsWith("HIL-BR-")) return "business";
  if (requirementId.startsWith("HIL-FR-")) return "functional";
  if (requirementId.startsWith("HIL-TR-")) return "technical";
  return "non_functional";
}

function parseRequirementStatements(source: string): Map<string, string> {
  const statements = new Map<string, string>();
  for (const line of source.replace(/\r\n?/g, "\n").split("\n")) {
    const match = line.match(/^\| \*\*(HIL-(?:BR|FR|TR|NFR)-\d{2})\*\* \| (.*) \|$/u);
    if (!match) continue;
    const requirementId = match[1] ?? "";
    const statement = match[2] ?? "";
    if (!statement) throw new Error(`${requirementId} has an empty statement`);
    if (statements.has(requirementId)) throw new Error(`${requirementId} statement is duplicated`);
    statements.set(requirementId, statement);
  }
  requireExactCount("requirement statements", [...statements], 153);
  return statements;
}

interface LedgerRow {
  requirementId: string;
  revision: number;
  canonicalPointer: string;
  statementDigest: string;
  authorityId: string;
  assertionId: string;
  definitionStatus: string;
}

function parseDefinitionLedger(source: string): Map<string, LedgerRow> {
  const ledger = new Map<string, LedgerRow>();
  for (const row of tableRows(source)) {
    const requirementId = unwrap(row[0] ?? "");
    if (!REQUIREMENT_ID.test(requirementId) || row.length !== 9) continue;
    const revision = Number(row[1]);
    const statementDigest = unwrap(row[3] ?? "");
    const authorityId = unwrap(row[4] ?? "").replace(/^current:/u, "");
    if (!Number.isInteger(revision) || revision < 1) {
      throw new Error(`${requirementId} has an invalid revision`);
    }
    if (!SHA256.test(statementDigest)) {
      throw new Error(`${requirementId} has an invalid statement digest`);
    }
    if (ledger.has(requirementId)) {
      throw new Error(`${requirementId} definition ledger row is duplicated`);
    }
    ledger.set(requirementId, {
      requirementId,
      revision,
      canonicalPointer: unwrap(row[2] ?? ""),
      statementDigest,
      authorityId,
      assertionId: unwrap(row[5] ?? ""),
      definitionStatus: row[8] ?? "",
    });
  }
  requireExactCount("definition ledger", [...ledger], 153);
  return ledger;
}

function parseSystemContracts(source: string): SystemContractShadowRecord[] {
  const records = tableRows(source)
    .filter((row) => SYSTEM_CONTRACT_ID.test(row[0] ?? "") && row.length === 6)
    .map((row) => {
      const systemContractId = row[0] ?? "";
      const requirementIds = exactIds(row[1] ?? "", /HIL-(?:BR|FR|TR|NFR)-\d{2}/);
      const acceptanceIds = exactIds(row[5] ?? "", /HAC-HIL-\d{2}[abc]/);
      const core = {
        schema_version: "helix-system-contract.v1" as const,
        system_contract_id: systemContractId,
        revision: 1 as const,
        status: "specified" as const,
        requirement_ids: requirementIds,
        behavior: row[2] ?? "",
        transition_contract: row[3] ?? "",
        failure_and_evidence: row[4] ?? "",
        acceptance_ids: acceptanceIds,
        system_test_id: systemContractId.replace("HR-FR-", "HAT-"),
      };
      return { ...core, semantic_digest: semanticDigest(core) };
    });
  requireExactCount("system contracts", records, 24);
  requireUnique(
    "system contract IDs",
    records.map((record) => record.system_contract_id),
  );
  return records;
}

function parseAcceptanceCases(source: string): AcceptanceShadowRecord[] {
  const records: AcceptanceShadowRecord[] = [];
  for (const row of tableRows(source)) {
    if (!SYSTEM_CONTRACT_ID.test(row[0] ?? "") || row.length !== 4) continue;
    const systemContractId = row[0] ?? "";
    const systemTestId = systemContractId.replace("HR-FR-", "HAT-");
    for (const [index, cell] of row.slice(1).entries()) {
      const acceptanceId = exactIds(cell, /HAC-HIL-\d{2}[abc]/)[0];
      if (!acceptanceId || !ACCEPTANCE_ID.test(acceptanceId)) {
        throw new Error(`${systemContractId} acceptance row ${index + 1} has no exact ID`);
      }
      const statement = cell.replace(new RegExp(`^${acceptanceId}:\\s*`), "");
      const core = {
        schema_version: "helix-acceptance-case.v1" as const,
        acceptance_id: acceptanceId,
        revision: 1 as const,
        status: "specified" as const,
        system_contract_id: systemContractId,
        polarity: (["positive", "negative", "boundary"] as const)[index] ?? "boundary",
        statement,
        system_test_id: systemTestId,
      };
      records.push({ ...core, semantic_digest: semanticDigest(core) });
    }
  }
  requireExactCount("acceptance cases", records, 72);
  requireUnique(
    "acceptance IDs",
    records.map((record) => record.acceptance_id),
  );
  return records;
}

function parseSystemTests(source: string): SystemTestShadowRecord[] {
  const records = tableRows(source)
    .filter((row) => SYSTEM_TEST_ID.test(row[0] ?? "") && row.length === 6)
    .map((row) => {
      const systemTestId = row[0] ?? "";
      const systemContractId = exactIds(row[1] ?? "", /HR-FR-HIL-\d{2}/)[0] ?? "";
      const acceptanceIds = exactIds(row[1] ?? "", /HAC-HIL-\d{2}[abc]/);
      const supportingTestIds = exactIds(row[2] ?? "", /(?:HST|HOT)-HIL-\d{2,3}/);
      const core = {
        schema_version: "helix-system-test.v1" as const,
        system_test_id: systemTestId,
        revision: 1 as const,
        status: "designed_not_implemented" as const,
        system_contract_id: systemContractId,
        acceptance_ids: acceptanceIds,
        supporting_test_ids: supportingTestIds,
        scenario: row[3] ?? "",
        required_evidence: row[4] ?? "",
        negative_boundary: row[5] ?? "",
      };
      return { ...core, semantic_digest: semanticDigest(core) };
    });
  requireExactCount("system tests", records, 24);
  requireUnique(
    "system test IDs",
    records.map((record) => record.system_test_id),
  );
  return records;
}

function routeIssueIds(ownerId: string): number[] {
  return ownerId === "HR-FR-HIL-23" ? [225, 226, 227, 194] : [];
}

interface ShadowLinkageInput {
  systemContracts: SystemContractShadowRecord[];
  acceptanceCases: AcceptanceShadowRecord[];
  systemTests: SystemTestShadowRecord[];
}

function validateShadowLinkage(input: ShadowLinkageInput): void {
  const acceptanceByContract = new Map<string, string[]>();
  for (const acceptance of input.acceptanceCases) {
    const current = acceptanceByContract.get(acceptance.system_contract_id) ?? [];
    current.push(acceptance.acceptance_id);
    acceptanceByContract.set(acceptance.system_contract_id, current);
  }
  const systemTestById = new Map(
    input.systemTests.map((systemTest) => [systemTest.system_test_id, systemTest]),
  );

  for (const contract of input.systemContracts) {
    const acceptanceIds = acceptanceByContract.get(contract.system_contract_id) ?? [];
    if (JSON.stringify(acceptanceIds) !== JSON.stringify(contract.acceptance_ids)) {
      throw new Error(`${contract.system_contract_id} acceptance linkage mismatch`);
    }
    const systemTest = systemTestById.get(contract.system_test_id);
    if (
      !systemTest ||
      systemTest.system_contract_id !== contract.system_contract_id ||
      JSON.stringify(systemTest.acceptance_ids) !== JSON.stringify(contract.acceptance_ids)
    ) {
      throw new Error(`${contract.system_contract_id} system test linkage mismatch`);
    }
  }
}

export function compileRequirementIrShadow(input: RequirementIrShadowInput): RequirementIrShadow {
  const statements = parseRequirementStatements(input.requirementSource);
  const ledger = parseDefinitionLedger(input.definitionLedger);
  const systemContracts = parseSystemContracts(input.systemContractSource);
  const acceptanceCases = parseAcceptanceCases(input.systemContractSource);
  const systemTests = parseSystemTests(input.systemTestSource);
  validateShadowLinkage({ systemContracts, acceptanceCases, systemTests });

  const contractByRequirement = new Map<string, string>();
  for (const contract of systemContracts) {
    for (const requirementId of contract.requirement_ids) {
      if (contractByRequirement.has(requirementId)) {
        throw new Error(`${requirementId} has multiple primary system contracts`);
      }
      contractByRequirement.set(requirementId, contract.system_contract_id);
    }
  }
  requireExactCount("primary requirement owners", [...contractByRequirement], 153);

  const acceptanceByContract = new Map(
    systemContracts.map((contract) => [contract.system_contract_id, contract.acceptance_ids]),
  );
  const requirements = [...ledger.values()]
    .sort((left, right) => left.requirementId.localeCompare(right.requirementId))
    .map((ledgerRow): RequirementShadowRecord => {
      const statement = statements.get(ledgerRow.requirementId);
      const ownerId = contractByRequirement.get(ledgerRow.requirementId);
      if (!statement || !ownerId) throw new Error(`${ledgerRow.requirementId} is not fully owned`);
      const observedDigest = sha256Text(statement);
      if (observedDigest !== ledgerRow.statementDigest) {
        throw new Error(
          `${ledgerRow.requirementId} statement digest mismatch: ledger=${ledgerRow.statementDigest} observed=${observedDigest}`,
        );
      }
      if (!ledgerRow.definitionStatus.includes("active-freeze-pending")) {
        throw new Error(`${ledgerRow.requirementId} is not active-freeze-pending`);
      }
      const expectedCorrectedOwner =
        correctedDownstreamOwnerExactSet[
          ledgerRow.requirementId as keyof typeof correctedDownstreamOwnerExactSet
        ];
      if (expectedCorrectedOwner && ownerId !== expectedCorrectedOwner) {
        throw new Error(
          `${ledgerRow.requirementId} corrected owner mismatch: expected=${expectedCorrectedOwner} actual=${ownerId}`,
        );
      }
      const acceptanceIds = acceptanceByContract.get(ownerId) ?? [];
      const core = {
        schema_version: "helix-requirement.v1" as const,
        requirement_id: ledgerRow.requirementId,
        revision: ledgerRow.revision,
        kind: requirementKind(ledgerRow.requirementId),
        status: "specified" as const,
        definition_status: "active-freeze-pending" as const,
        evidence_origin: "legacy_markdown_migration" as const,
        statement: { text: statement, semantic_digest: observedDigest },
        source: {
          canonical_pointer: ledgerRow.canonicalPointer,
          authority_id: ledgerRow.authorityId,
        },
        assertion_id: ledgerRow.assertionId,
        primary_system_contract_id: ownerId,
        acceptance_ids: acceptanceIds,
        system_test_id: ownerId.replace("HR-FR-", "HAT-"),
        downstream_obligation: {
          obligation_id: `DOWNSTREAM-${ledgerRow.requirementId}`,
          owner_id: ownerId,
          status: "pending_pair_descent" as const,
          route_issue_ids: routeIssueIds(ownerId),
        },
        actor_ids: [],
        task_ids: [],
        surface_ids: [],
        design_template_ids: [],
        design_obligation_ids: [],
        required_design_artifact_kinds: [],
        pending_resolution: [
          "legacy migration has no fabricated question, answer, prototype, actor, task, or surface evidence",
          "design template selection remains pending until Issue #290 is activated after G1/G3 rebind",
        ],
      };
      return { ...core, semantic_digest: semanticDigest(core) };
    });

  const identitySets = [
    requirements.map((record) => record.requirement_id),
    systemContracts.map((record) => record.system_contract_id),
    acceptanceCases.map((record) => record.acceptance_id),
    systemTests.map((record) => record.system_test_id),
  ];
  for (const [index, identities] of identitySets.entries()) {
    requireUnique(`shadow identity set ${index}`, identities);
  }

  const root = {
    schema_version: "helix-requirement-ir-shadow.v1" as const,
    authority: "shadow_noncanonical" as const,
    source_authority: "legacy_markdown_current_until_cutover" as const,
    requirements,
    system_contracts: systemContracts,
    acceptance_cases: acceptanceCases,
    system_tests: systemTests,
  };
  return { ...root, root_digest: semanticDigest(root) };
}
