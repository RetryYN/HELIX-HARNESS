import { normalizePath } from "../lint/shared";

type TestCaseEvidence = {
  oracle_id?: string;
  name: string;
  status: "passed" | "failed" | "skipped";
  duration_ms?: number;
  message?: string;
  artifact_path?: string;
};

export type ParsedGreenCommandEvidence = {
  plan_id?: string;
  recorded_at?: string;
  started_at?: string;
  completed_at?: string;
  cases: TestCaseEvidence[];
};

type ReporterKind = "vitest" | "playwright";

export function parseGreenCommandEvidence(path: string, content: string): ParsedGreenCommandEvidence | null {
  const format = reporterEvidenceFormat(path);
  if (!format) return null;
  if (format === "xml") {
    return { cases: parseJunitTestCases(content) };
  }

  const raw = JSON.parse(content) as Record<string, unknown>;
  const structuredCases = normalizeStructuredTestCases(raw.cases);
  const reporterCases =
    structuredCases.length > 0
      ? []
      : parseVitestJsonReporterTestCases(raw).concat(parsePlaywrightJsonReporterTestCases(raw));
  return {
    plan_id: asString(raw.plan_id) ?? undefined,
    recorded_at: asString(raw.recorded_at) ?? undefined,
    started_at: asString(raw.started_at) ?? undefined,
    completed_at: asString(raw.completed_at) ?? undefined,
    cases: structuredCases.concat(reporterCases),
  };
}

function reporterEvidenceFormat(path: string): "json" | "xml" | null {
  const lower = path.toLowerCase();
  if (lower.endsWith(".json")) return "json";
  if (lower.endsWith(".xml")) return "xml";
  return null;
}

function normalizeStructuredTestCases(value: unknown): TestCaseEvidence[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(isRecord)
    .map((item) => {
      const status = asString(item.status);
      if (status !== "passed" && status !== "failed" && status !== "skipped") return null;
      const testCase: TestCaseEvidence = {
        oracle_id: asString(item.oracle_id) ?? undefined,
        name: asString(item.name) ?? asString(item.test_name) ?? asString(item.oracle_id) ?? "unknown",
        status,
      };
      const durationMs = asFiniteNumber(item.duration_ms);
      if (durationMs !== null) testCase.duration_ms = durationMs;
      const message = asString(item.message);
      if (message) testCase.message = truncateMessage(message);
      const artifactPath = asString(item.artifact_path);
      if (artifactPath) testCase.artifact_path = normalizeReporterArtifactPath(artifactPath);
      return testCase;
    })
    .filter((item): item is TestCaseEvidence => item !== null);
}

function parseVitestJsonReporterTestCases(raw: Record<string, unknown>): TestCaseEvidence[] {
  if (!Array.isArray(raw.testResults)) return [];
  const cases: TestCaseEvidence[] = [];
  for (const suite of raw.testResults) {
    if (!isRecord(suite) || !Array.isArray(suite.assertionResults)) continue;
    const artifactPath = normalizeReporterArtifactPath(asString(suite.name));
    for (const assertion of suite.assertionResults) {
      if (!isRecord(assertion)) continue;
      const status = normalizeReporterStatus(asString(assertion.status), "vitest");
      if (!status) continue;
      const name = buildVitestReporterCaseName(assertion);
      const testCase: TestCaseEvidence = {
        oracle_id: explicitOracleId(assertion) ?? extractOracleMarker(name),
        name,
        status,
      };
      const durationMs = asFiniteNumber(assertion.duration);
      if (durationMs !== null) testCase.duration_ms = durationMs;
      const failureMessages = Array.isArray(assertion.failureMessages)
        ? assertion.failureMessages.map(asString).filter((item): item is string => item !== null)
        : [];
      if (failureMessages.length > 0) testCase.message = truncateMessage(failureMessages[0]);
      if (artifactPath) testCase.artifact_path = artifactPath;
      cases.push(testCase);
    }
  }
  return cases;
}

function parsePlaywrightJsonReporterTestCases(raw: Record<string, unknown>): TestCaseEvidence[] {
  if (!Array.isArray(raw.suites)) return [];
  return raw.suites.flatMap((suite) => parsePlaywrightSuite(suite, []));
}

function parsePlaywrightSuite(value: unknown, parentTitles: string[]): TestCaseEvidence[] {
  if (!isRecord(value)) return [];
  const title = asString(value.title);
  const file = normalizeReporterArtifactPath(asString(value.file));
  const titles = title ? parentTitles.concat(title) : parentTitles;
  const cases: TestCaseEvidence[] = [];
  if (Array.isArray(value.specs)) {
    for (const spec of value.specs) {
      cases.push(...parsePlaywrightSpec(spec, titles, file));
    }
  }
  if (Array.isArray(value.suites)) {
    for (const child of value.suites) {
      cases.push(...parsePlaywrightSuite(child, titles));
    }
  }
  return cases;
}

function parsePlaywrightSpec(value: unknown, parentTitles: string[], suiteFile?: string): TestCaseEvidence[] {
  if (!isRecord(value)) return [];
  const specTitle = asString(value.title);
  const artifactPath = normalizeReporterArtifactPath(asString(value.file)) ?? suiteFile;
  const titleParts = specTitle ? parentTitles.concat(specTitle) : parentTitles;
  const cases: TestCaseEvidence[] = [];
  if (!Array.isArray(value.tests)) return cases;
  for (const test of value.tests) {
    if (!isRecord(test) || !Array.isArray(test.results)) continue;
    const projectName = asString(test.projectName);
    const testTitle = projectName ? titleParts.concat(projectName).join(" > ") : titleParts.join(" > ");
    for (const result of test.results) {
      if (!isRecord(result)) continue;
      const status = normalizeReporterStatus(asString(result.status), "playwright");
      if (!status) continue;
      const testCase: TestCaseEvidence = {
        oracle_id: explicitOracleId(result) ?? explicitOracleId(test) ?? explicitOracleId(value) ?? extractOracleMarker(testTitle),
        name: testTitle || "unknown",
        status,
      };
      const durationMs = asFiniteNumber(result.duration);
      if (durationMs !== null) testCase.duration_ms = durationMs;
      const message = reporterErrorMessage(result.error);
      if (message) testCase.message = truncateMessage(message);
      if (artifactPath) testCase.artifact_path = artifactPath;
      cases.push(testCase);
    }
  }
  return cases;
}

function parseJunitTestCases(xml: string): TestCaseEvidence[] {
  if (xml.match(/<!DOCTYPE\b|<!ENTITY\b/i)) return [];
  const cases: TestCaseEvidence[] = [];
  const testcasePattern = /<testcase\b([^>]*)\/>|<testcase\b([^>]*)>([\s\S]*?)<\/testcase>/gi;
  for (const match of xml.matchAll(testcasePattern)) {
    const attrs = parseXmlAttributes(match[1] ?? match[2] ?? "");
    const body = match[3] ?? "";
    const rawName = attrs.get("name") ?? attrs.get("classname") ?? "unknown";
    const className = attrs.get("classname");
    const name = className && className !== rawName ? `${className} > ${rawName}` : rawName;
    const status = body.match(/<failure\b|<error\b/i) ? "failed" : body.match(/<skipped\b/i) ? "skipped" : "passed";
    const testCase: TestCaseEvidence = {
      oracle_id: attrs.get("oracle_id") ?? extractOracleMarker(name),
      name,
      status,
    };
    const timeSeconds = asFiniteNumber(attrs.get("time"));
    if (timeSeconds !== null) testCase.duration_ms = Math.round(timeSeconds * 1000);
    const message = junitFailureMessage(body);
    if (message) testCase.message = truncateMessage(message);
    const artifactPath = normalizeReporterArtifactPath(attrs.get("file") ?? pathLikeClassName(className));
    if (artifactPath) testCase.artifact_path = artifactPath;
    cases.push(testCase);
  }
  return cases;
}

function buildVitestReporterCaseName(assertion: Record<string, unknown>): string {
  const fullName = asString(assertion.fullName);
  if (fullName) return fullName.trim() || "unknown";
  const ancestors = Array.isArray(assertion.ancestorTitles)
    ? assertion.ancestorTitles.map(asString).filter((item): item is string => item !== null && item.trim().length > 0)
    : [];
  const title = asString(assertion.title);
  return ancestors.concat(title ?? []).join(" > ") || title || "unknown";
}

function normalizeReporterStatus(status: string | null, reporter: ReporterKind): TestCaseEvidence["status"] | null {
  if (status === "passed") return "passed";
  if (status === "failed") return "failed";
  if (status === "skipped") return "skipped";
  if (reporter === "vitest" && (status === "pending" || status === "todo")) return "skipped";
  if (reporter === "playwright" && (status === "timedOut" || status === "interrupted")) return "failed";
  return null;
}

function explicitOracleId(value: Record<string, unknown>): string | undefined {
  const direct =
    asString(value.oracle_id) ?? asString(value.oracleId) ?? asString(value.test_oracle_id) ?? asString(value.testOracleId);
  if (direct) return direct;
  for (const key of ["meta", "metadata"]) {
    const nested = value[key];
    if (isRecord(nested)) {
      const oracle = explicitOracleId(nested);
      if (oracle) return oracle;
    }
  }
  if (Array.isArray(value.annotations)) {
    for (const annotation of value.annotations) {
      if (!isRecord(annotation)) continue;
      const type = asString(annotation.type);
      if (type === "oracle" || type === "oracle_id" || type === "test_oracle_id") {
        const oracle = asString(annotation.description) ?? asString(annotation.value);
        if (oracle) return oracle;
      }
    }
  }
  return undefined;
}

function normalizeReporterArtifactPath(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  const normalized = normalizePath(path);
  if (normalized.startsWith("/") || normalized.includes("://")) return undefined;
  return normalized;
}

function pathLikeClassName(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return value.includes("/") || value.includes("\\") || value.match(/\.[cm]?[jt]sx?$/) ? value : undefined;
}

function extractOracleMarker(value: string): string | undefined {
  return value.match(/\bU-[A-Z0-9-]+\b/)?.[0];
}

function reporterErrorMessage(error: unknown): string | undefined {
  if (!isRecord(error)) return undefined;
  return asString(error.message) ?? asString(error.stack) ?? undefined;
}

function parseXmlAttributes(value: string): Map<string, string> {
  const attrs = new Map<string, string>();
  const attrPattern = /([A-Za-z_:][-A-Za-z0-9_:.]*)\s*=\s*("([^"]*)"|'([^']*)')/g;
  for (const match of value.matchAll(attrPattern)) {
    const key = match[1];
    const raw = match[3] ?? match[4] ?? "";
    if (key) attrs.set(key, decodeXmlEntities(raw));
  }
  return attrs;
}

function junitFailureMessage(body: string): string | undefined {
  const failure = body.match(/<(failure|error)\b([^>]*)>([\s\S]*?)<\/\1>/i);
  if (!failure) return undefined;
  const attrs = parseXmlAttributes(failure[2] ?? "");
  const message = attrs.get("message") ?? stripXmlTags(failure[3] ?? "");
  return message.trim() || undefined;
}

function stripXmlTags(value: string): string {
  return decodeXmlEntities(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " "));
}

function decodeXmlEntities(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&amp;/g, "&");
}

function truncateMessage(value: string): string {
  return value.slice(0, 500);
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function asFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
