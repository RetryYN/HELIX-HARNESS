import ts from "typescript";
import { loadRequirementsDocRegistry } from "./requirements-doc-registry";

export type ResurrectionCategory =
  | "command"
  | "module"
  | "symbol"
  | "schema"
  | "panel"
  | "path"
  | "writer"
  | "generated_surface"
  | "unclassified";

export interface ResurrectionPolicy {
  schemaVersion: "handover-resurrection-policy.v1";
  detectorPolicyVersion: string;
  forbidden: {
    commands: string[];
    modules: string[];
    symbols: string[];
    schemas: string[];
    panels: string[];
    paths: string[];
    writerSymbols: string[];
    generatedTokens: string[];
  };
}

export interface ResurrectionFile {
  path: string;
  content: string;
}

export interface TypedAllowedArtifact {
  path: string;
  kind: "provider_evidence" | "operations_transition" | "legacy_archive";
  digest: string;
  runtimeReadable: boolean;
  schemaValid: boolean;
  continuationJoined: boolean;
}

export interface ResurrectionFinding {
  code: string;
  category: ResurrectionCategory;
  path: string;
  symbol: string;
  evidence: string;
  fingerprint: string;
}

export interface ResurrectionBaseline {
  fingerprints: string[];
  digest: string;
}

export interface ResurrectionBaselineFile extends ResurrectionBaseline {
  schemaVersion: "handover-resurrection-baseline.v1";
  policyDigest: string;
}

export interface GeneratedResurrectionBaselineFile extends ResurrectionBaseline {
  schemaVersion: "handover-generated-resurrection-baseline.v1";
  policyDigest: string;
  projectionKinds: ["fresh_setup", "brownfield_setup", "command_contract", "clean_distribution"];
}

export interface GeneratedResurrectionAuthority {
  schemaVersion: "handover-generated-resurrection-authority.v1";
  baselinePath: "config/handover-generated-resurrection-baseline.json";
  sourceRevision: string;
  baselineBlobOid: string;
  baselineFileDigest: string;
  baselineDigest: string;
  decisionId: string;
}

export interface ResurrectionBaselineAuthority {
  schemaVersion: "handover-resurrection-authority.v1";
  baselinePath: "config/handover-resurrection-baseline.json";
  sourceRevision: string;
  baselineBlobOid: string;
  baselineFileDigest: string;
  baselineDigest: string;
  decisionId: string;
}

export interface ResurrectionPreserveAuthority {
  schemaVersion: "handover-preserve-authority.v1";
  sourceRevision: string;
  entries: Array<{
    path: string;
    kind: "provider_evidence" | "operations_transition";
    digest: string;
  }>;
}

export interface ResurrectionEnforceAuthority {
  schemaVersion: "handover-resurrection-enforce-authority.v1";
  operationId: string;
  intentDigest: string;
  preserveDigest: string;
  archiveDigest: string;
  journalEntryDigest: string;
  approvalDecisionId: string;
  approvalStatus: "approved";
}

export interface ResurrectionCheckpointState {
  completeCheckpoint: {
    operationId: string;
    intentDigest: string;
    preserveDigest: string;
    archiveDigest: string;
  } | null;
  expectedOperationId: string;
  expectedIntentDigest: string;
  expectedPreserveDigest: string;
  expectedArchiveDigest: string;
}

export type ResurrectionMode =
  | "pre_cutover_shadow"
  | "post_complete_enforce"
  | "invalid_precondition";

export interface ResurrectionAnalysis {
  ok: boolean;
  mode: ResurrectionMode;
  findings: ResurrectionFinding[];
  knownFindings: ResurrectionFinding[];
  newFindings: ResurrectionFinding[];
  preconditionErrors: string[];
  policyDigest: string;
}

export const HANDOVER_RESURRECTION_POLICY: ResurrectionPolicy = {
  schemaVersion: "handover-resurrection-policy.v1",
  detectorPolicyVersion: "1",
  forbidden: {
    commands: ["handover", "handover status"],
    modules: ["src/handover", "./handover", "../handover"],
    symbols: [
      "runHandover",
      "readHandover",
      "writeHandover",
      "generateHandover",
      "HandoverAggregate",
    ],
    schemas: ["HandoverSchema", "CURRENT.json"],
    panels: ["HandoverPanel"],
    paths: ["src/handover", ".helix/handover/CURRENT.json", "docs/handover"],
    writerSymbols: ["writeFile", "writeFileSync", "appendFile", "appendFileSync", "writeText"],
    generatedTokens: [
      "helix handover",
      "handover status",
      ".helix/handover/CURRENT.json",
      "HandoverPanel",
    ],
  },
};

const SHA256 = /^sha256:[a-f0-9]{64}$/;
const BASELINE_AUTHORITY_PIN: ResurrectionBaselineAuthority = {
  schemaVersion: "handover-resurrection-authority.v1",
  baselinePath: "config/handover-resurrection-baseline.json",
  sourceRevision: "69cc0f02ac1abe815eeb9f653ab2afa9a90df387",
  baselineBlobOid: "8874bc27f24f56331d2e71919a372d2998606865",
  baselineFileDigest: "sha256:89b51922804bf4fd376bc681637ec93a5644e39007db2f4af62ada6c46795a1a",
  baselineDigest: "sha256:799c0898015b6c6666182f50ab304887eba79d5716c3787061fa712d1e4b568e",
  decisionId: "PLAN-L7-416:shadow-baseline:scan-hardening-v1",
};
const PRESERVE_AUTHORITY_FILE_DIGEST =
  "sha256:dc460288ad0860ac02ec9b11f8265e58798d1f39e754524f7f5ec783e3900c22";
export const ENFORCE_AUTHORITY_PIN: ResurrectionEnforceAuthority = {
  schemaVersion: "handover-resurrection-enforce-authority.v1",
  operationId: "handover-retirement:2026-07-11-sprint3",
  intentDigest: "sha256:4923d6233832852b31bb5a5d93e38a4fa7c9d1ae47caf01d15969ef71ca7a3f3",
  preserveDigest: "sha256:aef799ee30a2dc7ddd05ca6331075bd3f00e042ef70fc3d91eaa84b98732f760",
  archiveDigest: "sha256:15f9452e5c3f7d3cbb931a86478460046faba048e25dd8f0c4ac2188b3b36d6c",
  journalEntryDigest: "sha256:6d98446ca84c88286d2eec59f0cdd82f5d837efbdd933185322a031554b3f3eb",
  approvalDecisionId:
    "handover-retirement-cutover:d8091478fce674dbac5c5c44953fde7abbea6631f134980c424ff5be9a5f9d39",
  approvalStatus: "approved",
};
const GENERATED_AUTHORITY_PIN: GeneratedResurrectionAuthority = {
  schemaVersion: "handover-generated-resurrection-authority.v1",
  baselinePath: "config/handover-generated-resurrection-baseline.json",
  sourceRevision: "ee156a5d9c93c691d942fb0c39f1005be5db8c2f",
  baselineBlobOid: "eff5c3ccf91983289fc26511b275750c21c638dc",
  baselineFileDigest: "sha256:83bb3c01481b5604e3b36478023ef060e0090a872a783294dd32b3b64ceab7ef",
  baselineDigest: "sha256:476779d67e3f7190c10dbe1dce5284fed3fee21de23cd94e22b32e7f3ff78b8e",
  decisionId: "PLAN-L7-416:generated-baseline:all-projections-v2",
};

/** Runtime capabilityを持たないlint境界用の決定的SHA-256。 */
function sha256(value: string): string {
  const bytes = new TextEncoder().encode(value);
  const bitLength = bytes.length * 8;
  const paddedLength = Math.ceil((bytes.length + 9) / 64) * 64;
  const padded = new Uint8Array(paddedLength);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(paddedLength - 8, Math.floor(bitLength / 0x1_0000_0000), false);
  view.setUint32(paddedLength - 4, bitLength >>> 0, false);
  const state = new Uint32Array([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ]);
  const constants = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ]);
  const words = new Uint32Array(64);
  const rotateRight = (word: number, amount: number): number =>
    (word >>> amount) | (word << (32 - amount));
  for (let offset = 0; offset < paddedLength; offset += 64) {
    for (let index = 0; index < 16; index += 1) {
      words[index] = view.getUint32(offset + index * 4, false);
    }
    for (let index = 16; index < 64; index += 1) {
      const word15 = words[index - 15] ?? 0;
      const word2 = words[index - 2] ?? 0;
      const sigma0 = rotateRight(word15, 7) ^ rotateRight(word15, 18) ^ (word15 >>> 3);
      const sigma1 = rotateRight(word2, 17) ^ rotateRight(word2, 19) ^ (word2 >>> 10);
      words[index] = ((words[index - 16] ?? 0) + sigma0 + (words[index - 7] ?? 0) + sigma1) >>> 0;
    }
    let [a, b, c, d, e, f, g, h] = state;
    for (let index = 0; index < 64; index += 1) {
      const bigSigma1 = rotateRight(e ?? 0, 6) ^ rotateRight(e ?? 0, 11) ^ rotateRight(e ?? 0, 25);
      const choose = ((e ?? 0) & (f ?? 0)) ^ (~(e ?? 0) & (g ?? 0));
      const temporary1 =
        ((h ?? 0) + bigSigma1 + choose + (constants[index] ?? 0) + (words[index] ?? 0)) >>> 0;
      const bigSigma0 = rotateRight(a ?? 0, 2) ^ rotateRight(a ?? 0, 13) ^ rotateRight(a ?? 0, 22);
      const majority = ((a ?? 0) & (b ?? 0)) ^ ((a ?? 0) & (c ?? 0)) ^ ((b ?? 0) & (c ?? 0));
      const temporary2 = (bigSigma0 + majority) >>> 0;
      h = g;
      g = f;
      f = e;
      e = ((d ?? 0) + temporary1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temporary1 + temporary2) >>> 0;
    }
    const next = [a, b, c, d, e, f, g, h];
    for (let index = 0; index < state.length; index += 1) {
      state[index] = ((state[index] ?? 0) + (next[index] ?? 0)) >>> 0;
    }
  }
  return `sha256:${[...state].map((word) => word.toString(16).padStart(8, "0")).join("")}`;
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value === "boolean" || typeof value === "string") {
    return JSON.stringify(value);
  }
  if (typeof value === "number" && Number.isFinite(value)) return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (typeof value !== "object") throw new Error("resurrection manifest is not JSON");
  return `{${Object.keys(value as Record<string, unknown>)
    .sort()
    .map(
      (key) => `${JSON.stringify(key)}:${canonicalJson((value as Record<string, unknown>)[key])}`,
    )
    .join(",")}}`;
}

function normalizedPath(path: string): string {
  const normalized = path.replace(/\\/g, "/");
  if (
    normalized.length === 0 ||
    normalized.startsWith("/") ||
    normalized.includes("\0") ||
    normalized.split("/").some((part) => part === "..")
  ) {
    throw new Error(`invalid resurrection path: ${path}`);
  }
  const result = normalized
    .split("/")
    .filter((part) => part.length > 0 && part !== ".")
    .join("/");
  return result || ".";
}

function finding(input: {
  category: ResurrectionCategory;
  path: string;
  symbol: string;
  evidence: string;
}): ResurrectionFinding {
  const { category, path, symbol, evidence } = input;
  const code = `handover_resurrection_${category}`;
  return {
    code,
    category,
    path,
    symbol,
    evidence,
    fingerprint: sha256(canonicalJson({ code, category, path, symbol, evidence })),
  };
}

export function buildResurrectionBaseline(
  findings: readonly ResurrectionFinding[],
): ResurrectionBaseline {
  const fingerprints = [...new Set(findings.map((item) => item.fingerprint))].sort();
  return { fingerprints, digest: sha256(canonicalJson(fingerprints)) };
}

export function parseResurrectionBaselineFile(text: string): ResurrectionBaselineFile {
  const raw = JSON.parse(text) as Partial<ResurrectionBaselineFile>;
  if (
    raw.schemaVersion !== "handover-resurrection-baseline.v1" ||
    raw.policyDigest !== resurrectionPolicyDigest() ||
    !Array.isArray(raw.fingerprints) ||
    raw.fingerprints.some((item) => typeof item !== "string" || !SHA256.test(item)) ||
    new Set(raw.fingerprints).size !== raw.fingerprints.length
  ) {
    throw new Error("invalid handover resurrection baseline");
  }
  const fingerprints = [...raw.fingerprints].sort();
  const digest = sha256(canonicalJson(fingerprints));
  if (raw.digest !== digest) throw new Error("handover resurrection baseline digest mismatch");
  return {
    schemaVersion: raw.schemaVersion,
    policyDigest: raw.policyDigest,
    fingerprints,
    digest,
  };
}

export function parseGeneratedResurrectionBaselineFile(
  text: string,
): GeneratedResurrectionBaselineFile {
  const raw = JSON.parse(text) as Partial<GeneratedResurrectionBaselineFile>;
  if (
    raw.schemaVersion !== "handover-generated-resurrection-baseline.v1" ||
    raw.policyDigest !== resurrectionPolicyDigest() ||
    canonicalJson(raw.projectionKinds) !==
      canonicalJson([
        "fresh_setup",
        "brownfield_setup",
        "command_contract",
        "clean_distribution",
      ]) ||
    !Array.isArray(raw.fingerprints) ||
    raw.fingerprints.some((item) => typeof item !== "string" || !SHA256.test(item)) ||
    new Set(raw.fingerprints).size !== raw.fingerprints.length
  ) {
    throw new Error("invalid generated resurrection baseline");
  }
  const fingerprints = [...raw.fingerprints].sort();
  const digest = sha256(canonicalJson(fingerprints));
  if (raw.digest !== digest) throw new Error("generated resurrection baseline digest mismatch");
  return { ...raw, fingerprints, digest } as GeneratedResurrectionBaselineFile;
}

export function parseGeneratedResurrectionAuthority(text: string): GeneratedResurrectionAuthority {
  const raw = JSON.parse(text) as Partial<GeneratedResurrectionAuthority>;
  if (
    raw.schemaVersion !== "handover-generated-resurrection-authority.v1" ||
    raw.baselinePath !== "config/handover-generated-resurrection-baseline.json" ||
    typeof raw.sourceRevision !== "string" ||
    !/^[a-f0-9]{40,64}$/.test(raw.sourceRevision) ||
    typeof raw.baselineBlobOid !== "string" ||
    !/^[a-f0-9]{40,64}$/.test(raw.baselineBlobOid) ||
    typeof raw.baselineFileDigest !== "string" ||
    !SHA256.test(raw.baselineFileDigest) ||
    typeof raw.baselineDigest !== "string" ||
    !SHA256.test(raw.baselineDigest) ||
    typeof raw.decisionId !== "string" ||
    !/^PLAN-L7-416:generated-baseline:[a-z0-9-]+$/.test(raw.decisionId) ||
    canonicalJson(raw) !== canonicalJson(GENERATED_AUTHORITY_PIN)
  ) {
    throw new Error("invalid generated resurrection authority");
  }
  return raw as GeneratedResurrectionAuthority;
}

export function parseResurrectionBaselineAuthority(text: string): ResurrectionBaselineAuthority {
  const raw = JSON.parse(text) as Partial<ResurrectionBaselineAuthority>;
  if (
    raw.schemaVersion !== "handover-resurrection-authority.v1" ||
    raw.baselinePath !== "config/handover-resurrection-baseline.json" ||
    typeof raw.sourceRevision !== "string" ||
    !/^[a-f0-9]{40,64}$/.test(raw.sourceRevision) ||
    typeof raw.baselineBlobOid !== "string" ||
    !/^[a-f0-9]{40,64}$/.test(raw.baselineBlobOid) ||
    typeof raw.baselineFileDigest !== "string" ||
    !SHA256.test(raw.baselineFileDigest) ||
    typeof raw.baselineDigest !== "string" ||
    !SHA256.test(raw.baselineDigest) ||
    typeof raw.decisionId !== "string" ||
    !/^PLAN-L7-416:shadow-baseline:[a-z0-9-]+$/.test(raw.decisionId)
  ) {
    throw new Error("invalid handover resurrection baseline authority");
  }
  if (canonicalJson(raw) !== canonicalJson(BASELINE_AUTHORITY_PIN)) {
    throw new Error("handover resurrection baseline authority is not code-pinned");
  }
  return raw as ResurrectionBaselineAuthority;
}

export function parsePreserveAuthority(text: string): ResurrectionPreserveAuthority {
  const raw = JSON.parse(text) as Partial<ResurrectionPreserveAuthority>;
  if (
    sha256(text) !== PRESERVE_AUTHORITY_FILE_DIGEST ||
    raw.schemaVersion !== "handover-preserve-authority.v1" ||
    raw.sourceRevision !== BASELINE_AUTHORITY_PIN.sourceRevision ||
    !Array.isArray(raw.entries) ||
    raw.entries.length === 0
  ) {
    throw new Error("invalid handover preserve authority");
  }
  const entries = raw.entries;
  for (const entry of entries) {
    if (
      !entry ||
      typeof entry.path !== "string" ||
      normalizedPath(entry.path) !== entry.path ||
      !["provider_evidence", "operations_transition"].includes(entry.kind) ||
      !SHA256.test(entry.digest)
    ) {
      throw new Error("invalid handover preserve authority entry");
    }
  }
  const sorted = [...entries].sort((a, b) => a.path.localeCompare(b.path));
  if (
    new Set(entries.map((entry) => entry.path)).size !== entries.length ||
    canonicalJson(entries) !== canonicalJson(sorted)
  ) {
    throw new Error("handover preserve authority entries are not canonical");
  }
  return raw as ResurrectionPreserveAuthority;
}

export function parseEnforceAuthority(
  text: string,
  authorityPin: ResurrectionEnforceAuthority | null,
): ResurrectionEnforceAuthority {
  const raw = JSON.parse(text) as Partial<ResurrectionEnforceAuthority>;
  if (
    raw.schemaVersion !== "handover-resurrection-enforce-authority.v1" ||
    typeof raw.operationId !== "string" ||
    !raw.operationId.trim() ||
    typeof raw.intentDigest !== "string" ||
    !SHA256.test(raw.intentDigest) ||
    typeof raw.preserveDigest !== "string" ||
    !SHA256.test(raw.preserveDigest) ||
    typeof raw.archiveDigest !== "string" ||
    !SHA256.test(raw.archiveDigest) ||
    typeof raw.journalEntryDigest !== "string" ||
    !SHA256.test(raw.journalEntryDigest) ||
    typeof raw.approvalDecisionId !== "string" ||
    !/^handover-retirement-cutover:[a-f0-9]{64}$/.test(raw.approvalDecisionId) ||
    raw.approvalStatus !== "approved"
  ) {
    throw new Error("invalid handover resurrection enforce authority");
  }
  if (authorityPin === null) {
    throw new Error("handover resurrection enforce authority is not code-pinned");
  }
  if (canonicalJson(raw) !== canonicalJson(authorityPin)) {
    throw new Error("handover resurrection enforce authority pin mismatch");
  }
  return raw as ResurrectionEnforceAuthority;
}

export function resurrectionMessages(result: ResurrectionAnalysis): string[] {
  const status = result.ok ? "OK" : "violation";
  return [
    `handover-resurrection - ${status}: mode=${result.mode} findings=${result.findings.length} known=${result.knownFindings.length} new=${result.newFindings.length} preconditions=${result.preconditionErrors.length}`,
    ...result.preconditionErrors.map(
      (error) => `handover-resurrection - violation: precondition=${error}`,
    ),
    ...result.newFindings
      .slice(0, 30)
      .map((item) => `handover-resurrection - violation: ${item.code}=${item.path}:${item.symbol}`),
  ];
}

export function resurrectionPolicyDigest(
  policy: ResurrectionPolicy = HANDOVER_RESURRECTION_POLICY,
): string {
  return sha256(canonicalJson(policy));
}

function validatePolicy(policy: ResurrectionPolicy): string[] {
  const errors: string[] = [];
  if (
    policy.schemaVersion !== "handover-resurrection-policy.v1" ||
    !policy.detectorPolicyVersion.trim()
  ) {
    errors.push("policy_version_invalid");
  }
  for (const [category, values] of Object.entries(policy.forbidden)) {
    if (
      !Array.isArray(values) ||
      values.length === 0 ||
      values.some((value) => typeof value !== "string" || value.trim().length === 0) ||
      new Set(values).size !== values.length
    ) {
      errors.push(`policy_category_invalid:${category}`);
    }
  }
  return errors;
}

export function deriveResurrectionMode(state: ResurrectionCheckpointState): {
  mode: ResurrectionMode;
  errors: string[];
} {
  if (!state.completeCheckpoint) return { mode: "pre_cutover_shadow", errors: [] };
  const checkpoint = state.completeCheckpoint;
  const errors: string[] = [];
  if (checkpoint.operationId !== state.expectedOperationId) errors.push("operation_mismatch");
  if (checkpoint.intentDigest !== state.expectedIntentDigest) errors.push("intent_mismatch");
  if (checkpoint.preserveDigest !== state.expectedPreserveDigest)
    errors.push("preserve_digest_mismatch");
  if (checkpoint.archiveDigest !== state.expectedArchiveDigest)
    errors.push("archive_digest_mismatch");
  return errors.length > 0
    ? { mode: "invalid_precondition", errors }
    : { mode: "post_complete_enforce", errors: [] };
}

function stringValue(node: ts.Node): string | null {
  return ts.isStringLiteralLike(node) ? node.text : null;
}

function staticString(node: ts.Expression, constants: ReadonlyMap<string, string>): string | null {
  if (ts.isStringLiteralLike(node)) return node.text;
  if (ts.isIdentifier(node)) return constants.get(node.text) ?? null;
  if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken) {
    const left = staticString(node.left, constants);
    const right = staticString(node.right, constants);
    return left === null || right === null ? null : `${left}${right}`;
  }
  if (ts.isTemplateExpression(node)) {
    let value = node.head.text;
    for (const span of node.templateSpans) {
      const expression = staticString(span.expression, constants);
      if (expression === null) return null;
      value += expression + span.literal.text;
    }
    return value;
  }
  if (ts.isCallExpression(node) && /^(?:join|resolve)$/.test(callName(node))) {
    const values = node.arguments.map((argument) => staticString(argument, constants));
    return values.some((value) => value === null) ? null : values.join("/").replace(/\/+/g, "/");
  }
  return null;
}

function callName(node: ts.CallExpression): string {
  const expression = node.expression;
  if (ts.isIdentifier(expression)) return expression.text;
  if (ts.isPropertyAccessExpression(expression)) return expression.name.text;
  return "";
}

type ResurrectionExemptionKind =
  | "retirement_governance"
  | "retirement_detector_literal"
  | "provider_pointer_fixture"
  | "migration_fixture";

interface RetirementMetaRole {
  path: string;
  role: "projection_source" | "approval_verifier" | "approval_negative_oracle";
  requiredMarkers: readonly string[];
  allowedFindings: readonly string[];
}

const RETIREMENT_META_ROLES: readonly RetirementMetaRole[] = [
  {
    path: "src/audit/handover-resurrection-source.ts",
    role: "projection_source",
    requiredMarkers: [
      "loadGeneratedResurrectionSourceFiles",
      "clean distribution resurrection projection is incomplete",
    ],
    allowedFindings: ["generated_surface:*", "path:*", "unclassified:*"],
  },
  {
    path: "src/lint/handover-cutover-approval.ts",
    role: "approval_verifier",
    requiredMarkers: [
      "HANDOVER_CUTOVER_APPROVAL_PIN",
      "RETIRED_ARTIFACTS",
      "loadAndVerifyHandoverCutoverApproval",
    ],
    allowedFindings: ["generated_surface:*", "path:*", "unclassified:*", "schema:CURRENT.json"],
  },
  {
    path: "tests/handover-cutover-approval.test.ts",
    role: "approval_negative_oracle",
    requiredMarkers: ["U-HRET-015", "analyzeHandoverResurrectionShadowRepo", "findings: []"],
    allowedFindings: ["generated_surface:*", "path:*", "unclassified:*"],
  },
] as const;

let retirementGovernanceFiles: Set<string> | null = null;
function getRetirementGovernanceFiles(): Set<string> {
  retirementGovernanceFiles ??= new Set([
    "docs/governance/handover-retirement-memory-audit-2026-07-11.md",
    "docs/governance/helix-harness-concept_v3.1.md",
    loadRequirementsDocRegistry().compatibility,
    "docs/governance/session-handover-atomic-cutover-packet.md",
    "docs/governance/session-handover-retirement-disposition.md",
  ]);
  return retirementGovernanceFiles;
}

const RETIREMENT_DETECTOR_FILES = new Set([
  "src/audit/handover-resurrection-source.ts",
  "src/lint/handover-cutover-approval.ts",
  "src/lint/handover-retirement.ts",
  "src/runtime/retirement-preserve.ts",
  "tests/handover-retirement-runtime.test.ts",
  "tests/handover-retirement.test.ts",
  "tests/handover-cutover-approval.test.ts",
  "tests/retirement-preserve.test.ts",
]);

function logicalResurrectionPath(path: string): string {
  return normalizedPath(path).replace(/^@projection\/[^/]+\//, "");
}

function matchesRetirementMetaRole(
  item: ResurrectionFinding,
  contentByPath: ReadonlyMap<string, string>,
): boolean {
  const path = logicalResurrectionPath(item.path);
  const role = RETIREMENT_META_ROLES.find((candidate) => candidate.path === path);
  if (!role) return false;
  const content = contentByPath.get(path);
  if (!content || role.requiredMarkers.some((marker) => !content.includes(marker))) return false;
  return role.allowedFindings.some((allowed) => {
    const [category, symbol] = allowed.split(":", 2);
    return category === item.category && (symbol === "*" || symbol === item.symbol);
  });
}

/**
 * 退役の証明そのものとlive surfaceを区別する型付き境界。
 * path全体を無条件に除外せず、証跡が必要とするfinding種別だけを落とす。
 * command/symbol/writerは常に残るため、証跡ファイルへ実装を紛れ込ませてもfailする。
 */
function typedResurrectionExemption(
  item: ResurrectionFinding,
  contentByPath: ReadonlyMap<string, string>,
): ResurrectionExemptionKind | null {
  const path = logicalResurrectionPath(item.path);
  if (getRetirementGovernanceFiles().has(path)) return "retirement_governance";
  if (matchesRetirementMetaRole(item, contentByPath)) return "retirement_detector_literal";
  if (
    RETIREMENT_DETECTOR_FILES.has(path) &&
    !RETIREMENT_META_ROLES.some((role) => role.path === path) &&
    (["generated_surface", "path", "unclassified"].includes(item.category) ||
      (path === "src/lint/handover-cutover-approval.ts" &&
        item.category === "schema" &&
        item.symbol === "CURRENT.json"))
  ) {
    return "retirement_detector_literal";
  }
  if (
    path === "tests/provider-handover.test.ts" &&
    item.category === "schema" &&
    item.symbol === "CURRENT.json"
  ) {
    return "provider_pointer_fixture";
  }
  if (
    ["tests/cli-surface.test.ts", "tests/doctor.test.ts", "tests/slow/doctor.test.ts"].includes(
      path,
    ) &&
    item.category === "schema" &&
    item.symbol === "CURRENT.json"
  ) {
    return "migration_fixture";
  }
  if (
    path === "src/lint/identifier-rename.ts" &&
    item.category === "generated_surface" &&
    item.symbol === "helix handover"
  ) {
    return "migration_fixture";
  }
  return null;
}

function isForbiddenHandoverModule(moduleName: string, policy: ResurrectionPolicy): boolean {
  if (moduleName.includes("provider-handover")) return false;
  if (policy.forbidden.modules.includes(moduleName)) return true;
  return /(?:^|\/)handover(?:\/index)?$/.test(moduleName);
}

function scanTypeScript(file: ResurrectionFile, policy: ResurrectionPolicy): ResurrectionFinding[] {
  const path = normalizedPath(file.path);
  if (path === "src/lint/handover-resurrection.ts") return [];
  const source = ts.createSourceFile(path, file.content, ts.ScriptTarget.Latest, true);
  const findings: ResurrectionFinding[] = [];
  const constants = new Map<string, string>();
  const collectConstants = (node: ts.Node): void => {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.initializer &&
      staticString(node.initializer, constants) !== null
    ) {
      constants.set(node.name.text, staticString(node.initializer, constants) ?? "");
    }
    ts.forEachChild(node, collectConstants);
  };
  collectConstants(source);
  const add = (category: ResurrectionCategory, symbol: string, evidence: string) =>
    findings.push(finding({ category, path, symbol, evidence }));
  const visit = (node: ts.Node): void => {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      const moduleName = node.moduleSpecifier ? stringValue(node.moduleSpecifier) : null;
      if (moduleName && isForbiddenHandoverModule(moduleName, policy)) {
        add("module", moduleName, node.getText(source));
      }
    }
    if (ts.isCallExpression(node)) {
      if (
        node.expression.kind === ts.SyntaxKind.ImportKeyword &&
        node.arguments.some((argument) => {
          const moduleName = staticString(argument, constants) ?? "";
          return isForbiddenHandoverModule(moduleName, policy);
        })
      ) {
        add("module", "dynamic import", node.getText(source));
      }
      const name = callName(node);
      const strings = node.arguments
        .map((argument) => staticString(argument, constants))
        .filter((value): value is string => value !== null);
      if (
        strings.some((value) => policy.forbidden.commands.includes(value)) &&
        /command|route|case|option/i.test(name || node.parent.getText(source).slice(0, 80))
      ) {
        add(
          "command",
          strings.find((value) => policy.forbidden.commands.includes(value)) ?? "",
          node.getText(source),
        );
      }
      if (
        policy.forbidden.writerSymbols.includes(name) &&
        strings.some((value) =>
          value.replace(/\\/g, "/").replace(/\/+/g, "/").includes("handover/CURRENT.json"),
        )
      ) {
        add("writer", name, node.getText(source));
      }
    }
    if (ts.isIdentifier(node)) {
      if (policy.forbidden.symbols.includes(node.text))
        add("symbol", node.text, node.getText(source));
      if (policy.forbidden.schemas.includes(node.text))
        add("schema", node.text, node.getText(source));
      if (policy.forbidden.panels.includes(node.text))
        add("panel", node.text, node.getText(source));
    }
    if (ts.isStringLiteralLike(node) && node.text === "CURRENT.json") {
      const ancestry = node.parent.parent?.getText(source) ?? node.parent.getText(source);
      if (/handover/i.test(ancestry)) add("schema", "CURRENT.json", ancestry);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return findings;
}

function scanGeneratedSurface(
  file: ResurrectionFile,
  policy: ResurrectionPolicy,
): ResurrectionFinding[] {
  const path = normalizedPath(file.path);
  const findings: ResurrectionFinding[] = [];
  for (const token of policy.forbidden.generatedTokens) {
    if (file.content.toLowerCase().includes(token.toLowerCase())) {
      findings.push(
        finding({ category: "generated_surface", path, symbol: token, evidence: token }),
      );
    }
  }
  return findings;
}

function scanPaths(
  files: readonly ResurrectionFile[],
  policy: ResurrectionPolicy,
): ResurrectionFinding[] {
  const findings: ResurrectionFinding[] = [];
  for (const file of files) {
    const path = normalizedPath(file.path);
    const logicalPath = path.replace(/^@projection\/[^/]+\//, "");
    const lowerPath = logicalPath.toLowerCase();
    const forbiddenPath = policy.forbidden.paths.some(
      (forbidden) =>
        lowerPath === forbidden.toLowerCase() ||
        lowerPath.startsWith(`${forbidden.toLowerCase()}/`),
    );
    if (forbiddenPath) {
      findings.push(finding({ category: "path", path, symbol: path, evidence: path }));
    } else if (/(?:^|\/)handover(?:\/|[-_.])/i.test(logicalPath)) {
      findings.push(finding({ category: "unclassified", path, symbol: path, evidence: path }));
    }
  }
  return findings;
}

function validateAllowedArtifacts(
  files: readonly ResurrectionFile[],
  allowed: readonly TypedAllowedArtifact[],
): string[] {
  const errors: string[] = [];
  const filesByPath = new Map(files.map((file) => [normalizedPath(file.path), file]));
  for (const artifact of allowed) {
    const path = normalizedPath(artifact.path);
    const pathMatchesKind =
      (artifact.kind === "provider_evidence" && path.startsWith(".helix/handover/provider/")) ||
      (artifact.kind === "operations_transition" &&
        (path.startsWith("docs/design/harness/L11-operations/") ||
          path.startsWith("docs/design/harness/L14-operations/"))) ||
      (artifact.kind === "legacy_archive" && path.startsWith("docs/archive/handover/"));
    if (
      !SHA256.test(artifact.digest) ||
      !pathMatchesKind ||
      (artifact.kind === "legacy_archive" && artifact.runtimeReadable) ||
      !artifact.schemaValid ||
      artifact.continuationJoined ||
      (artifact.kind !== "legacy_archive" &&
        !["provider_evidence", "operations_transition"].includes(artifact.kind))
    ) {
      errors.push(`allowlist_invalid:${path}`);
      continue;
    }
    const file = filesByPath.get(path);
    if (!file) {
      errors.push(`allowlist_missing:${path}`);
      continue;
    }
    if (sha256(file.content) !== artifact.digest) errors.push(`allowlist_digest_mismatch:${path}`);
  }
  return errors;
}

export function analyzeHandoverResurrection(input: {
  files: readonly ResurrectionFile[];
  allowedArtifacts: readonly TypedAllowedArtifact[];
  baseline: ResurrectionBaseline;
  checkpointState: ResurrectionCheckpointState;
  policy?: ResurrectionPolicy;
}): ResurrectionAnalysis {
  const policy = input.policy ?? HANDOVER_RESURRECTION_POLICY;
  const preconditionErrors: string[] = [...validatePolicy(policy)];
  const expectedBaselineDigest = sha256(canonicalJson([...input.baseline.fingerprints].sort()));
  if (input.baseline.digest !== expectedBaselineDigest)
    preconditionErrors.push("baseline_digest_invalid");
  preconditionErrors.push(...validateAllowedArtifacts(input.files, input.allowedArtifacts));
  const mode = deriveResurrectionMode(input.checkpointState);
  preconditionErrors.push(...mode.errors.map((error) => `checkpoint_${error}`));

  const allowedPaths = new Set(
    input.allowedArtifacts.map((artifact) => normalizedPath(artifact.path)),
  );
  const liveFiles = input.files.filter((file) => !allowedPaths.has(normalizedPath(file.path)));
  const allowedSemanticFindings = input.allowedArtifacts.flatMap((artifact) => {
    const file = input.files.find(
      (candidate) => normalizedPath(candidate.path) === normalizedPath(artifact.path),
    );
    if (!file) return [];
    return [
      ...scanGeneratedSurface(file, policy),
      ...(/\.[cm]?[jt]sx?$/.test(file.path) ? scanTypeScript(file, policy) : []),
    ];
  });
  const findings = [
    ...allowedSemanticFindings,
    ...scanPaths(liveFiles, policy),
    ...liveFiles.flatMap((file) => [
      ...scanGeneratedSurface(file, policy),
      ...(/\.[cm]?[jt]sx?$/.test(file.path) ? scanTypeScript(file, policy) : []),
    ]),
  ];
  const contentByPath = new Map(
    input.files.map((file) => [logicalResurrectionPath(file.path), file.content]),
  );
  const policyFindings = findings.filter(
    (item) => typedResurrectionExemption(item, contentByPath) === null,
  );
  const unique = [...new Map(policyFindings.map((item) => [item.fingerprint, item])).values()].sort(
    (a, b) => a.path.localeCompare(b.path) || a.code.localeCompare(b.code),
  );
  const baselineSet = new Set(input.baseline.fingerprints);
  const knownFindings = unique.filter((item) => baselineSet.has(item.fingerprint));
  const newFindings = unique.filter((item) => !baselineSet.has(item.fingerprint));
  const ok =
    preconditionErrors.length === 0 &&
    (mode.mode === "pre_cutover_shadow"
      ? newFindings.length === 0
      : mode.mode === "post_complete_enforce" && unique.length === 0);
  return {
    ok,
    mode: preconditionErrors.length > 0 ? "invalid_precondition" : mode.mode,
    findings: unique,
    knownFindings,
    newFindings,
    preconditionErrors,
    policyDigest: resurrectionPolicyDigest(policy),
  };
}
