import { canonicalJson, sha256Digest } from "../runtime/digest";

export type DesignTemplateFindingCode =
  | "schema_invalid"
  | "template_identity_duplicate"
  | "template_digest_mismatch"
  | "applicability_invalid"
  | "capacity_exceeded"
  | "generated_view_drift"
  | "trace_incomplete"
  | "pair_incomplete"
  | "measurement_incomplete"
  | "normative_owner_duplicate"
  | "shadow_atom_unmapped"
  | "shadow_semantic_drift"
  | "legacy_authority_promotion";

export interface Finding {
  code: DesignTemplateFindingCode;
  pointer: string;
  message: string;
}

export type ValidationResult<T> =
  | { ok: true; value: T; findings: [] }
  | { ok: false; findings: Finding[] };

export type PredicateNode =
  | { all: PredicateNode[] }
  | { any: PredicateNode[] }
  | { not: PredicateNode }
  | {
      comparison: {
        field: string;
        op: "eq" | "neq" | "in" | "contains" | "exists" | "gt" | "gte" | "lt" | "lte";
        value?: unknown;
      };
    };

function finding(code: DesignTemplateFindingCode, pointer: string, message: string): Finding {
  return { code, pointer, message };
}

function evaluateComparison(
  comparison: Extract<PredicateNode, { comparison: unknown }>["comparison"],
  facts: Readonly<Record<string, unknown>>,
): boolean | Finding {
  const present = Object.hasOwn(facts, comparison.field);
  if (comparison.op === "exists") return present === Boolean(comparison.value ?? true);
  if (!present) {
    return finding(
      "applicability_invalid",
      `/facts/${comparison.field}`,
      "required fact is missing",
    );
  }
  const actual = facts[comparison.field];
  const expected = comparison.value;
  switch (comparison.op) {
    case "eq":
      return actual === expected;
    case "neq":
      return actual !== expected;
    case "in":
      return Array.isArray(expected)
        ? expected.includes(actual)
        : finding("applicability_invalid", "/comparison/value", "in requires an array");
    case "contains":
      return Array.isArray(actual)
        ? actual.includes(expected)
        : typeof actual === "string" && typeof expected === "string"
          ? actual.includes(expected)
          : finding("applicability_invalid", "/comparison", "contains requires compatible values");
    case "gt":
    case "gte":
    case "lt":
    case "lte": {
      if (typeof actual !== "number" || typeof expected !== "number")
        return finding(
          "applicability_invalid",
          "/comparison",
          "ordered comparison requires numbers",
        );
      if (comparison.op === "gt") return actual > expected;
      if (comparison.op === "gte") return actual >= expected;
      if (comparison.op === "lt") return actual < expected;
      return actual <= expected;
    }
  }
}

export function evaluateTemplateApplicability(
  predicate: PredicateNode,
  facts: Readonly<Record<string, unknown>>,
  limits: { maxDepth: number; maxNodes: number } = { maxDepth: 16, maxNodes: 256 },
): { outcome: "applicable" | "not_applicable" | "evaluation_error"; findings: Finding[] } {
  let nodes = 0;
  const findings: Finding[] = [];
  if (templates.length > 4096)
    findings.push(finding("capacity_exceeded", "/templates", "registry capacity exceeded"));
  function walk(node: PredicateNode, depth: number, pointer: string): boolean {
    nodes += 1;
    if (nodes > limits.maxNodes || depth > limits.maxDepth) {
      findings.push(finding("capacity_exceeded", pointer, "predicate capacity exceeded"));
      return false;
    }
    const variants = ["all", "any", "not", "comparison"].filter((key) => Object.hasOwn(node, key));
    if (variants.length !== 1) {
      findings.push(
        finding("applicability_invalid", pointer, "predicate must contain exactly one variant"),
      );
      return false;
    }
    if ("all" in node) {
      if (node.all.length === 0) {
        findings.push(finding("applicability_invalid", pointer, "all must not be empty"));
        return false;
      }
      const values = node.all.map((child, index) =>
        walk(child, depth + 1, `${pointer}/all/${index}`),
      );
      return values.every(Boolean);
    }
    if ("any" in node) {
      if (node.any.length === 0) {
        findings.push(finding("applicability_invalid", pointer, "any must not be empty"));
        return false;
      }
      const values = node.any.map((child, index) =>
        walk(child, depth + 1, `${pointer}/any/${index}`),
      );
      return values.some(Boolean);
    }
    if ("not" in node) return !walk(node.not, depth + 1, `${pointer}/not`);
    const result = evaluateComparison(node.comparison, facts);
    if (typeof result === "boolean") return result;
    findings.push(result);
    return false;
  }
  const applicable = walk(predicate, 1, "");
  findings.sort((left, right) =>
    `${left.code}\0${left.pointer}\0${left.message}`.localeCompare(
      `${right.code}\0${right.pointer}\0${right.message}`,
    ),
  );
  if (findings.length > 0) return { outcome: "evaluation_error", findings };
  return { outcome: applicable ? "applicable" : "not_applicable", findings: [] };
}

const SHA256 = /^sha256:[0-9a-f]{64}$/;

const TEMPLATE_KEYS = new Set([
  "schema_version",
  "template_id",
  "template_version",
  "status",
  "title",
  "layer",
  "pair_layer",
  "artifact_kind",
  "responsibility_owner",
  "applicability",
  "required_inputs",
  "sections",
  "trace_contract",
  "verification",
  "measurement",
  "completion",
  "downstream_artifact_kinds",
  "semantic_digest",
  "supersedes",
]);
const REQUIRED_TEMPLATE_KEYS = [...TEMPLATE_KEYS].filter((key) => key !== "supersedes");
const PAIRS = new Set(["L1:L12", "L2:L11", "L3:L10", "L4:L9", "L5:L8", "L6:L7"]);
const STATUSES = new Set(["candidate", "verified", "approved", "canonical", "deprecated"]);

export type DesignTemplate = Record<string, unknown> & {
  schema_version: "helix-design-template.v1";
  template_id: string;
  template_version: number;
  status: string;
  semantic_digest: string;
};

export function designTemplateSemanticDigest(template: Record<string, unknown>): string {
  const { semantic_digest: _ignored, ...normative } = template;
  return sha256Digest(canonicalJson(normative));
}

function sortedFailure(findings: Finding[]): ValidationResult<never> {
  findings.sort((a, b) =>
    `${a.code}\0${a.pointer}\0${a.message}`.localeCompare(`${b.code}\0${b.pointer}\0${b.message}`),
  );
  return { ok: false, findings };
}

export function validateDesignTemplate(
  input: unknown,
  context: {
    schemaVersion: "helix-design-template.v1";
    currentPairs: ReadonlyArray<readonly [string, string]>;
    allowedFieldPaths: ReadonlySet<string>;
  },
): ValidationResult<DesignTemplate> {
  if (!input || typeof input !== "object" || Array.isArray(input))
    return sortedFailure([finding("schema_invalid", "", "template must be an object")]);
  const value = input as Record<string, unknown>;
  const findings: Finding[] = [];
  for (const key of REQUIRED_TEMPLATE_KEYS)
    if (!Object.hasOwn(value, key))
      findings.push(finding("schema_invalid", `/${key}`, "required field is missing"));
  for (const key of Object.keys(value))
    if (!TEMPLATE_KEYS.has(key))
      findings.push(finding("schema_invalid", `/${key}`, "unknown property"));
  if (value.schema_version !== context.schemaVersion)
    findings.push(finding("schema_invalid", "/schema_version", "unknown schema version"));
  if (typeof value.template_id !== "string" || !/^TPL-[A-Z0-9-]+$/.test(value.template_id))
    findings.push(finding("schema_invalid", "/template_id", "invalid template id"));
  if (!Number.isSafeInteger(value.template_version) || Number(value.template_version) < 1)
    findings.push(finding("schema_invalid", "/template_version", "invalid template version"));
  if (!STATUSES.has(String(value.status)))
    findings.push(finding("schema_invalid", "/status", "unknown lifecycle status"));
  const pair = `${String(value.layer)}:${String(value.pair_layer)}`;
  const admittedPairs = new Set(context.currentPairs.map(([a, b]) => `${a}:${b}`));
  if (!PAIRS.has(pair) || !admittedPairs.has(pair))
    findings.push(
      finding("pair_incomplete", "/pair_layer", "pair is outside current L1-L12 authority"),
    );
  const sections = Array.isArray(value.sections) ? value.sections : [];
  if (!Array.isArray(value.sections) || sections.length > 128)
    findings.push(
      finding(
        sections.length > 128 ? "capacity_exceeded" : "schema_invalid",
        "/sections",
        "invalid section set",
      ),
    );
  for (const [index, section] of sections.entries()) {
    const fields =
      section && typeof section === "object" ? (section as Record<string, unknown>).fields : null;
    if (!Array.isArray(fields) || fields.length > 256)
      findings.push(
        finding(
          Array.isArray(fields) && fields.length > 256 ? "capacity_exceeded" : "schema_invalid",
          `/sections/${index}/fields`,
          "invalid field set",
        ),
      );
  }
  const predicate = value.applicability as PredicateNode;
  const predicateFields: string[] = [];
  const collect = (node: PredicateNode): void => {
    if ("comparison" in node) predicateFields.push(node.comparison.field);
    else if ("all" in node) node.all.forEach(collect);
    else if ("any" in node) node.any.forEach(collect);
    else if ("not" in node) collect(node.not);
  };
  try {
    collect(predicate);
  } catch {
    findings.push(finding("applicability_invalid", "/applicability", "invalid predicate"));
  }
  for (const field of predicateFields)
    if (!context.allowedFieldPaths.has(field))
      findings.push(
        finding("applicability_invalid", "/applicability", `field is not allowlisted: ${field}`),
      );
  for (const [key, code] of [
    ["trace_contract", "trace_incomplete"],
    ["verification", "pair_incomplete"],
    ["measurement", "measurement_incomplete"],
    ["completion", "trace_incomplete"],
  ] as const) {
    const record = value[key];
    if (!record || typeof record !== "object" || Object.keys(record as object).length === 0)
      findings.push(finding(code, `/${key}`, "contract must not be empty"));
  }
  if (
    typeof value.semantic_digest !== "string" ||
    value.semantic_digest !== designTemplateSemanticDigest(value)
  )
    findings.push(
      finding("template_digest_mismatch", "/semantic_digest", "semantic digest mismatch"),
    );
  if (findings.length) return sortedFailure(findings);
  return { ok: true, value: value as DesignTemplate, findings: [] };
}

export function validateDesignTemplateRegistry(
  registry: unknown,
  templates: ReadonlyArray<DesignTemplate>,
): ValidationResult<Record<string, unknown>> {
  if (!registry || typeof registry !== "object")
    return sortedFailure([finding("schema_invalid", "", "registry must be an object")]);
  const entries = (registry as { templates?: unknown }).templates;
  if (!Array.isArray(entries))
    return sortedFailure([
      finding("schema_invalid", "/templates", "registry templates must be an array"),
    ]);
  const findings: Finding[] = [];
  const templateKeys = templates.map((t) => `${t.template_id}@${t.template_version}`);
  if (new Set(templateKeys).size !== templateKeys.length)
    findings.push(
      finding("template_identity_duplicate", "/templates", "duplicate template identity"),
    );
  const entryKeys = entries.map(
    (entry) =>
      `${String((entry as Record<string, unknown>).template_id)}@${String((entry as Record<string, unknown>).template_version)}`,
  );
  if (new Set(entryKeys).size !== entryKeys.length)
    findings.push(
      finding("template_identity_duplicate", "/templates", "duplicate registry identity"),
    );
  if ([...templateKeys].sort().join("\0") !== [...entryKeys].sort().join("\0"))
    findings.push(
      finding("template_digest_mismatch", "/templates", "registry/template exact set mismatch"),
    );
  for (const [index, entry] of entries.entries()) {
    const record = entry as Record<string, unknown>;
    const matched = templates.find(
      (item) =>
        item.template_id === record.template_id &&
        item.template_version === record.template_version,
    );
    if (!matched || record.semantic_digest !== matched.semantic_digest)
      findings.push(
        finding(
          "template_digest_mismatch",
          `/templates/${index}/semantic_digest`,
          "registry digest does not match template",
        ),
      );
  }
  const owners = templates
    .filter((t) => t.status === "canonical")
    .map((t) => `${String(t.layer)}:${String(t.pair_layer)}:${String(t.artifact_kind)}`);
  if (new Set(owners).size !== owners.length)
    findings.push(
      finding("normative_owner_duplicate", "/templates", "canonical normative owner is duplicated"),
    );
  for (const [index, template] of templates.entries())
    if (
      template.status === "deprecated" &&
      (!template.replacement ||
        !Array.isArray(template.consumers) ||
        !template.retention ||
        !template.removal_trigger)
    )
      findings.push(
        finding(
          "schema_invalid",
          `/templates/${index}`,
          "deprecated template lifecycle is incomplete",
        ),
      );
  if (findings.length) return sortedFailure(findings);
  return { ok: true, value: registry as Record<string, unknown>, findings: [] };
}

export function compileTemplateShadowReport(input: {
  source: Record<string, unknown>;
  candidate: DesignTemplate;
  mappings: ReadonlyArray<Record<string, unknown>>;
  designDecisions: ReadonlyArray<Record<string, unknown>>;
}): ValidationResult<Record<string, unknown>> {
  const findings: Finding[] = [];
  const authority = String(input.source.authority);
  const atoms = Array.isArray(input.source.atoms) ? input.source.atoms.map(String) : [];
  const sources = input.mappings.map((m) => String(m.source_pointer));
  const targets = input.mappings.map((m) => String(m.target_json_pointer));
  if (new Set(sources).size !== sources.length || atoms.some((atom) => !sources.includes(atom)))
    findings.push(
      finding("shadow_atom_unmapped", "/mappings", "source atoms must map exactly once"),
    );
  if (
    new Set(targets).size !== targets.length ||
    targets.some((target) => !target.startsWith("/") || target.includes(".."))
  )
    findings.push(
      finding("shadow_semantic_drift", "/mappings", "target pointers must be unique and valid"),
    );
  if (
    (authority === "compatibility" || authority === "historical") &&
    input.mappings.some((m) => m.promote_to_current === true)
  )
    findings.push(
      finding(
        "legacy_authority_promotion",
        "/mappings",
        "legacy source cannot become current default",
      ),
    );
  for (const mapping of input.mappings)
    if (
      mapping.disposition === "adapt" &&
      (!mapping.decision_id ||
        !input.designDecisions.some(
          (d) => d.decision_id === mapping.decision_id && d.independent_review === true,
        ))
    )
      findings.push(
        finding(
          "shadow_semantic_drift",
          "/mappings",
          "explained delta requires decision and independent review",
        ),
      );
  if (findings.length) return sortedFailure(findings);
  const value = {
    parity_status: input.mappings.some((m) => m.disposition === "adapt")
      ? "explained_delta"
      : "exact",
    mapping_count: input.mappings.length,
  };
  return { ok: true, value, findings: [] };
}

export function verifyGeneratedDesignView(input: {
  sourceSemanticDigest: string;
  embeddedSourceDigest: string;
  regeneratedLogicalDigest: string;
  checkedInLogicalDigest: string;
}): ValidationResult<{ current: true }> {
  const entries = Object.entries(input);
  if (
    entries.every(([, value]) => SHA256.test(value)) &&
    new Set(entries.map(([, value]) => value)).size === 1
  ) {
    return { ok: true, value: { current: true }, findings: [] };
  }
  return {
    ok: false,
    findings: [finding("generated_view_drift", "", "generated design view digest mismatch")],
  };
}
