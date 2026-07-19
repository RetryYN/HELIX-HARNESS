import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { uniqueSorted } from "../shared/collection-utils";
import { loadChangedFiles } from "./change-impact";
import {
  expectedVerificationSourceLedgerBinding,
  VERIFICATION_SOURCE_LEDGER_CHECKED_AT,
} from "./right-arm-verification-strategy";
import { normalizePath } from "./shared";
import { PROFILE_RUNNERS, PROFILES, SIGNAL_TO_PROFILE } from "./verification-profile-catalog";
import { planExternalProfileActivation } from "./verification-profile-safety";
import {
  type McpInspectResult,
  type SaveVerificationEvidenceInput,
  VERIFICATION_EVIDENCE_SCHEMA_VERSION,
  type VerificationDrive,
  type VerificationEvidenceRecord,
  type VerificationEvidenceWrite,
  type VerificationGate,
  type VerificationGraphEdge,
  type VerificationProbeCheck,
  type VerificationProbeDeps,
  type VerificationProbeResult,
  type VerificationProfile,
  type VerificationProfileCatalogResult,
  type VerificationProfileGateFinding,
  type VerificationProfileGateResult,
  type VerificationProfileId,
  type VerificationProfileRunResult,
  type VerificationRecommendation,
  type VerificationRecommendationResult,
  type VerificationRightArmCoverage,
  type VerificationSignal,
} from "./verification-profile-types";

export type {
  ExternalProfileActivationInput,
  ExternalProfileActivationPlan,
  ExternalProfileActivationStep,
  GeneratedMcpConfigInput,
  GeneratedMcpConfigResult,
  McpInspectResult,
  SaveVerificationEvidenceInput,
  VerificationDrive,
  VerificationDriveG10Coverage,
  VerificationEvidenceRecord,
  VerificationEvidenceWrite,
  VerificationGate,
  VerificationGraphEdge,
  VerificationProbeCheck,
  VerificationProbeDeps,
  VerificationProbeResult,
  VerificationProfile,
  VerificationProfileCatalogResult,
  VerificationProfileFinding,
  VerificationProfileFindingCode,
  VerificationProfileGateFinding,
  VerificationProfileGateFindingCode,
  VerificationProfileGateResult,
  VerificationProfileId,
  VerificationProfileRunResult,
  VerificationProfileSafetyInput,
  VerificationProfileSafetyResult,
  VerificationRecommendation,
  VerificationRecommendationResult,
  VerificationRightArmCoverage,
  VerificationSignal,
} from "./verification-profile-types";
export { VERIFICATION_EVIDENCE_SCHEMA_VERSION } from "./verification-profile-types";

export function listVerificationProfiles(): VerificationProfile[] {
  return Object.values(PROFILES);
}

export function catalogVerificationProfiles(): VerificationProfileCatalogResult {
  return {
    profiles: listVerificationProfiles().sort((a, b) => a.id.localeCompare(b.id)),
    ok: true,
  };
}

export function getVerificationProfile(id: string): VerificationProfile | null {
  // `as` キャスト素通しでなく実在キーで境界チェック (将来の動的 id 経路への防御、A-128 F-4 / IMP-130(c))。
  if (!Object.hasOwn(PROFILES, id)) return null;
  return PROFILES[id as VerificationProfileId];
}

export {
  analyzeVerificationProfileSafety,
  planExternalProfileActivation,
  renderGeneratedMcpConfig,
} from "./verification-profile-safety";

function tokenizeCommand(command: string): string[] {
  return command
    .trim()
    .split(/\s+/)
    .filter((token) => token.length > 0);
}

function profileCommandHead(profile: VerificationProfile): string | null {
  return tokenizeCommand(profile.command)[0] ?? null;
}

function packageNames(repoRoot: string, readText: (path: string) => string | null): Set<string> {
  const raw = readText(join(repoRoot, "package.json"));
  if (!raw) return new Set();
  try {
    const parsed = JSON.parse(raw) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
      optionalDependencies?: Record<string, string>;
    };
    return new Set([
      ...Object.keys(parsed.dependencies ?? {}),
      ...Object.keys(parsed.devDependencies ?? {}),
      ...Object.keys(parsed.optionalDependencies ?? {}),
    ]);
  } catch {
    return new Set();
  }
}

// probe (`--version` 等) の即応確認上限。外部コマンド hang でプロセスが永久ブロックしないため (A-128 F-4 / IMP-130(b))。
const PROBE_TIMEOUT_MS = 10_000;
// runner は全回帰 (vitest/doctor) を含むため CI 相当の 10 分を上限にする (harness-check の感覚と整合)。
const RUN_TIMEOUT_MS = 600_000;

// 全 profile の authEnv 名の和集合。runner 実行時は既定で子プロセスへ渡さない。
// 現行 runner (node-unit/doctor/vitest-browser) はいずれも requiresAuth=false で auth env 不要。
// requiresAuth profile の runner を配線する際に profile 単位の pass-through を追加する (A-128 F-4 / IMP-130(a))。
const AUTH_ENV_NAMES = new Set(Object.values(PROFILES).flatMap((p) => p.authEnv));

function envWithoutAuthSecrets(env: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  const out: NodeJS.ProcessEnv = {};
  for (const [name, value] of Object.entries(env)) {
    if (!AUTH_ENV_NAMES.has(name)) out[name] = value;
  }
  return out;
}

export function nodeVerificationProbeDeps(repoRoot: string = process.cwd()): VerificationProbeDeps {
  return {
    repoRoot,
    env: process.env,
    now: () => new Date().toISOString(),
    commandOk: (command, args) => {
      const r = spawnSync(command, args, { stdio: "ignore", timeout: PROBE_TIMEOUT_MS });
      return r.status === 0;
    },
    runCommand: (command, args) => {
      const r = spawnSync(command, args, {
        stdio: "inherit",
        cwd: repoRoot,
        env: envWithoutAuthSecrets(process.env),
        timeout: RUN_TIMEOUT_MS,
      });
      return { status: r.status };
    },
    readText: (path) => (existsSync(path) ? readFileSync(path, "utf8") : null),
    writeText: (path, content) => {
      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(path, content);
    },
  };
}

function safeFileName(value: string): string {
  return value.replace(/[^A-Za-z0-9._-]/g, "-").replace(/-+/g, "-");
}

export function saveVerificationEvidence(
  input: SaveVerificationEvidenceInput,
  deps: VerificationProbeDeps = nodeVerificationProbeDeps(),
): VerificationEvidenceWrite {
  const record: VerificationEvidenceRecord = {
    schema_version: VERIFICATION_EVIDENCE_SCHEMA_VERSION,
    kind: input.kind,
    id: input.id,
    recorded_at: deps.now(),
    payload: input.payload,
  };
  const stamp = record.recorded_at.replace(/[^0-9]/g, "").slice(0, 14);
  const rel = join(
    ".helix",
    "evidence",
    "verification-profiles",
    `${stamp}-${input.kind}-${safeFileName(input.id)}.json`,
  );
  const path = join(deps.repoRoot, rel);
  deps.writeText(path, `${JSON.stringify(record, null, 2)}\n`);
  return { path: rel.replaceAll("\\", "/"), record };
}

export function probeVerificationProfile(
  id: string,
  deps: VerificationProbeDeps = nodeVerificationProbeDeps(),
): VerificationProbeResult | null {
  const profile = getVerificationProfile(id);
  if (!profile) return null;
  const packages = packageNames(deps.repoRoot, deps.readText);
  const checks: VerificationProbeCheck[] = [
    {
      name: "activation",
      ok: profile.defaultEnabled,
      message: profile.defaultEnabled
        ? "enabled by default"
        : "disabled by default; requires explicit allow-list before execution",
    },
  ];
  if (profile.executable) {
    checks.push({
      name: "executable",
      ok: deps.commandOk(profile.executable, ["--version"]),
      message: `${profile.executable} --version`,
    });
  }
  const launcher = profileCommandHead(profile);
  if (launcher && launcher !== profile.executable) {
    checks.push({
      name: "launcher",
      ok: deps.commandOk(launcher, ["--help"]),
      message: `${launcher} --help`,
    });
  }
  if (profile.packageName) {
    checks.push({
      name: "package",
      ok: packages.has(profile.packageName),
      message: packages.has(profile.packageName)
        ? `${profile.packageName} declared in package.json`
        : `${profile.packageName} is not declared; ${profile.installHint ?? "install required"}`,
    });
  }
  if (profile.requiresAuth) {
    const present = profile.authEnv.some((name) => Boolean(deps.env[name]));
    checks.push({
      name: "auth",
      ok: present,
      message: present
        ? `auth env present (${profile.authEnv.join(" or ")})`
        : `missing auth env (${profile.authEnv.join(" or ")})`,
    });
  }
  const ready = checks.filter((c) => c.name !== "activation").every((c) => c.ok);
  return { profile, ready, checks };
}

export function runVerificationProfile(
  id: string,
  opts: { dryRun?: boolean; allowExternal?: boolean } = {},
  deps: VerificationProbeDeps = nodeVerificationProbeDeps(),
): VerificationProfileRunResult | null {
  const probe = probeVerificationProfile(id, deps);
  if (!probe) return null;
  const profile = probe.profile;
  const runner = PROFILE_RUNNERS[profile.id];
  if (!profile.defaultEnabled && !opts.allowExternal) {
    return {
      profile,
      status: "refused",
      exitCode: null,
      command: profile.command,
      messages: ["profile is disabled by default; pass --allow-external after allow-list review"],
    };
  }
  if (!probe.ready) {
    return {
      profile,
      status: "failed",
      exitCode: null,
      command: profile.command,
      messages: probe.checks.filter((c) => !c.ok && c.name !== "activation").map((c) => c.message),
    };
  }
  if (!runner) {
    return {
      profile,
      status: "failed",
      exitCode: null,
      command: profile.command,
      messages: ["no concrete runner is wired for this profile yet"],
    };
  }
  const [command, args] = runner;
  const fullCommand = `${command} ${args.join(" ")}`;
  if (opts.dryRun) {
    return { profile, status: "dry-run", exitCode: null, command: fullCommand, messages: [] };
  }
  const r = deps.runCommand(command, [...args]);
  return {
    profile,
    status: r.status === 0 ? "passed" : "failed",
    exitCode: r.status,
    command: fullCommand,
    messages: [],
  };
}

export function inspectMcpProfile(
  id: string,
  opts: { method?: string; allowExternal?: boolean } = {},
  deps: VerificationProbeDeps = nodeVerificationProbeDeps(),
): McpInspectResult | null {
  const profileProbe = probeVerificationProfile(id, deps);
  if (!profileProbe) return null;
  const inspectorProbe = probeVerificationProfile("mcp-inspector-smoke", deps);
  if (!inspectorProbe) return null;
  const method = opts.method ?? "tools/list";
  const checks = [
    ...inspectorProbe.checks.map((check) => ({ ...check, name: `inspector:${check.name}` })),
    ...profileProbe.checks.map((check) => ({ ...check, name: `target:${check.name}` })),
  ];
  if (!opts.allowExternal) {
    return {
      profile: profileProbe.profile,
      inspectorProfile: inspectorProbe.profile,
      method,
      status: "refused",
      checks,
      messages: [
        "MCP inspection is disabled by default; pass --allow-external after allow-list review",
      ],
    };
  }
  const ready =
    inspectorProbe.ready &&
    profileProbe.ready &&
    inspectorProbe.profile.defaultEnabled === false &&
    profileProbe.profile.sourceType === "mcp";
  return {
    profile: profileProbe.profile,
    inspectorProfile: inspectorProbe.profile,
    method,
    status: ready ? "ready" : "not-ready",
    checks,
    messages: ready
      ? [
          "MCP Inspector smoke prerequisites are ready; concrete server invocation remains profile-specific",
        ]
      : checks
          .filter((check) => !check.ok && !check.name.endsWith(":activation"))
          .map((check) => check.message),
  };
}

const RIGHT_ARM_GATES: VerificationGate[] = ["G8", "G9", "G10", "G11", "G12", "G13", "G14"];

const L10_REQUIRED_ALWAYS_DRIVES: VerificationDrive[] = ["agent", "fe", "fullstack"];

const L10_UI_ONLY_DRIVES: VerificationDrive[] = ["be", "db"];

const G10_BROWSER_PROFILE_IDS: VerificationProfileId[] = [
  "playwright-mcp",
  "vitest-browser-playwright",
];

const ALL_VERIFICATION_DRIVES: VerificationDrive[] = [
  ...L10_UI_ONLY_DRIVES,
  ...L10_REQUIRED_ALWAYS_DRIVES,
].sort();

function gateCoverageSeed(): Record<VerificationGate, VerificationProfileId[]> {
  return RIGHT_ARM_GATES.reduce(
    (acc, gate) => {
      acc[gate] = [];
      return acc;
    },
    {} as Record<VerificationGate, VerificationProfileId[]>,
  );
}

function driveCoverageSeed(): Record<
  VerificationDrive,
  { l10Requirement: "always" | "ui_only"; g10Profiles: VerificationProfileId[] }
> {
  return ALL_VERIFICATION_DRIVES.reduce(
    (acc, drive) => {
      acc[drive] = {
        l10Requirement: L10_REQUIRED_ALWAYS_DRIVES.includes(drive) ? "always" : "ui_only",
        g10Profiles: [],
      };
      return acc;
    },
    {} as Record<
      VerificationDrive,
      { l10Requirement: "always" | "ui_only"; g10Profiles: VerificationProfileId[] }
    >,
  );
}

export function analyzeRightArmVerificationProfileCoverage(
  profiles: VerificationProfile[] = listVerificationProfiles(),
): {
  coverage: VerificationRightArmCoverage;
  findings: VerificationProfileGateFinding[];
  ok: boolean;
} {
  const findings: VerificationProfileGateFinding[] = [];
  const allowedGates = new Set(RIGHT_ARM_GATES);
  const gates = gateCoverageSeed();
  const drives = driveCoverageSeed();

  for (const profile of profiles) {
    findings.push(...profileSourceLedgerBindingFindings(profile));
    for (const gate of profile.recommendedGates ?? []) {
      if (!allowedGates.has(gate)) {
        findings.push({
          code: "invalid-right-arm-gate",
          profileId: profile.id,
          message: `${profile.id} declares unsupported right-arm gate ${gate}`,
        });
        continue;
      }
      gates[gate] = uniqueSorted([...gates[gate], profile.id]);
    }
    if (profile.recommendedGates?.includes("G10") && G10_BROWSER_PROFILE_IDS.includes(profile.id)) {
      for (const drive of profile.recommendedDrives ?? []) {
        if (!Object.hasOwn(drives, drive)) continue;
        drives[drive].g10Profiles = uniqueSorted([...drives[drive].g10Profiles, profile.id]);
      }
    }
  }

  for (const gate of RIGHT_ARM_GATES) {
    if (gates[gate].length === 0) {
      findings.push({
        code: "missing-right-arm-gate-profile",
        message: `${gate} has no verification profile metadata`,
      });
    }
  }

  for (const drive of L10_REQUIRED_ALWAYS_DRIVES) {
    if (drives[drive].g10Profiles.length === 0) {
      findings.push({
        code: "missing-drive-g10-profile",
        message: `${drive} requires L10 browser evidence, but no G10 browser verification profile is mapped`,
      });
    }
  }

  return {
    coverage: { gates, drives },
    findings: findings.sort((a, b) =>
      `${a.code}:${a.profileId ?? ""}`.localeCompare(`${b.code}:${b.profileId ?? ""}`),
    ),
    ok: findings.length === 0,
  };
}

function profileSourceLedgerBindingFindings(
  profile: VerificationProfile,
): VerificationProfileGateFinding[] {
  const findings: VerificationProfileGateFinding[] = [];
  const recommendedGates = profile.recommendedGates ?? [];
  if (recommendedGates.length === 0) return findings;

  if (!profile.sourceLedgerSources || profile.sourceLedgerSources.length === 0) {
    return [
      {
        code: "missing-source-ledger-binding",
        profileId: profile.id,
        message: `${profile.id} declares right-arm gates but no Verification source ledger binding`,
      },
    ];
  }

  if (profile.sourceLedgerCheckedAt !== VERIFICATION_SOURCE_LEDGER_CHECKED_AT) {
    findings.push({
      code: "stale-source-ledger-binding",
      profileId: profile.id,
      message: `${profile.id} source ledger binding checkedAt=${profile.sourceLedgerCheckedAt ?? "missing"} does not match Verification source ledger checkedAt=${VERIFICATION_SOURCE_LEDGER_CHECKED_AT}`,
    });
  }

  const coveredGateImpacts = new Set<VerificationGate>();
  for (const source of profile.sourceLedgerSources) {
    const binding = expectedVerificationSourceLedgerBinding(source);
    if (!binding) {
      findings.push({
        code: "unknown-source-ledger-binding",
        profileId: profile.id,
        message: `${profile.id} binds to unknown Verification source ledger row ${source}`,
      });
      continue;
    }
    for (const impact of binding.gateImpacts) {
      if (RIGHT_ARM_GATES.includes(impact as VerificationGate)) {
        coveredGateImpacts.add(impact as VerificationGate);
      }
    }
  }

  for (const gate of recommendedGates) {
    if (!coveredGateImpacts.has(gate)) {
      findings.push({
        code: "source-ledger-gate-mismatch",
        profileId: profile.id,
        message: `${profile.id} recommends ${gate} but its Verification source ledger bindings do not cover that gate`,
      });
    }
  }
  return findings;
}

function signalForPath(path: string): VerificationSignal[] {
  const p = normalizePath(path);
  const signals: VerificationSignal[] = [];
  if (/^src\/.+\.(ts|tsx)$/.test(p) || /^tests\/.+\.test\.ts$/.test(p)) {
    signals.push("source_change");
  }
  if (
    /^src\/web\//.test(p) ||
    /^src\/.+\.(tsx)$/.test(p) ||
    /^docs\/design\/harness\/.+(ui|frontend|browser|a11y|visual)/i.test(p)
  ) {
    signals.push("ui_flow");
  }
  if (
    /(^|\/)(db|database|migration|migrations|schema)(\/|\.|-)/i.test(p) ||
    /^docs\/design\/harness\/L5-detailed-design\/physical-data\.md$/.test(p)
  ) {
    signals.push("db_integration");
  }
  if (/(^|\/)(api|contract|openapi|external-api)(\/|\.|-)/i.test(p)) {
    signals.push("api_mock_gap");
  }
  if (/(^|\/)(mcp|plugin|plugins)(\/|\.|-)/i.test(p) || /\.vscode\/mcp\.json$/.test(p)) {
    signals.push("mcp_profile_changed");
  }
  if (/^\.github\//.test(p) || /^docs\/process\//.test(p)) {
    signals.push("external_issue", "workflow_policy");
  }
  if (/^docs\/(governance|design|adr|process)\//.test(p) || /^\.helix\/audit\//.test(p)) {
    signals.push("doc_backprop");
  }
  return uniqueSorted(signals);
}

export function recommendVerificationProfiles(
  changedFiles: string[],
): VerificationRecommendationResult {
  const normalized = uniqueSorted(changedFiles.map(normalizePath).filter(Boolean));
  const byProfile = new Map<VerificationProfileId, VerificationRecommendation>();
  const edges: VerificationGraphEdge[] = [];

  for (const changedFile of normalized) {
    const signals = signalForPath(changedFile);
    for (const signal of signals) {
      edges.push({ from: changedFile, to: signal, kind: "changed_file_to_signal" });
      for (const profileId of SIGNAL_TO_PROFILE[signal]) {
        edges.push({ from: signal, to: profileId, kind: "signal_to_profile" });
        const current =
          byProfile.get(profileId) ??
          ({
            profile: PROFILES[profileId],
            signals: [],
            reasons: [],
            changedFiles: [],
          } satisfies VerificationRecommendation);
        current.signals = uniqueSorted([...current.signals, signal]);
        current.changedFiles = uniqueSorted([...current.changedFiles, changedFile]);
        current.reasons = uniqueSorted([...current.reasons, `${changedFile} triggered ${signal}`]);
        byProfile.set(profileId, current);
      }
    }
  }

  const recommendations = [...byProfile.values()].sort((a, b) =>
    a.profile.id.localeCompare(b.profile.id),
  );
  const missingProfiles = recommendations
    .filter((r) => !r.profile.defaultEnabled)
    .map((r) => r.profile.id)
    .sort();
  return {
    changedFiles: normalized,
    recommendations,
    edges,
    missingProfiles,
    ok: true,
  };
}

export function loadVerificationRecommendation(
  repoRoot: string = process.cwd(),
): VerificationRecommendationResult {
  return recommendVerificationProfiles(loadChangedFiles(repoRoot));
}

function mermaidId(value: string): string {
  return value.replace(/[^A-Za-z0-9_]/g, "_");
}

function mermaidLabel(value: string): string {
  return value.replaceAll('"', "'");
}

export function verificationRecommendationMermaid(
  result: VerificationRecommendationResult,
): string {
  const lines = ["flowchart LR"];
  for (const edge of result.edges) {
    const from = mermaidId(edge.from);
    const to = mermaidId(edge.to);
    lines.push(`  ${from}["${mermaidLabel(edge.from)}"] --> ${to}["${mermaidLabel(edge.to)}"]`);
  }
  if (result.edges.length === 0) lines.push('  empty["no changed files / no profile signals"]');
  return lines.join("\n");
}

export function verificationRecommendationMessages(
  result: VerificationRecommendationResult,
): string[] {
  if (result.recommendations.length === 0) {
    return ["verification-profile - OK (no profile recommendation)"];
  }
  const enabled = result.recommendations.filter((r) => r.profile.defaultEnabled).length;
  const external = result.recommendations.length - enabled;
  return [
    `verification-profile - OK (${result.recommendations.length} profiles recommended, enabled=${enabled}, external_or_disabled=${external})`,
  ];
}

export function analyzeVerificationProfileGate(
  recommendation: VerificationRecommendationResult,
): VerificationProfileGateResult {
  const findings: VerificationProfileGateFinding[] = [];
  const defaultRecommendations = recommendation.recommendations.filter(
    (r) => r.profile.defaultEnabled,
  );
  const externalRecommendations = recommendation.recommendations.filter(
    (r) => !r.profile.defaultEnabled,
  );
  const activationPlan = planExternalProfileActivation({
    triggerSignals: uniqueSorted(recommendation.recommendations.flatMap((r) => r.signals)),
    recommendations: recommendation.recommendations,
    allowExternal: false,
  });
  const rightArm = analyzeRightArmVerificationProfileCoverage();

  for (const rec of recommendation.recommendations) {
    if (rec.signals.length === 0) {
      findings.push({
        code: "recommendation-without-signal",
        profileId: rec.profile.id,
        message: `${rec.profile.id} was recommended without a trigger signal`,
      });
    }
  }

  if (recommendation.recommendations.length > 0 && defaultRecommendations.length === 0) {
    findings.push({
      code: "missing-default-profile",
      message: "changed files produced recommendations but no default-enabled profile",
    });
  }

  for (const rec of defaultRecommendations) {
    if (!PROFILE_RUNNERS[rec.profile.id]) {
      findings.push({
        code: "unrunnable-default-profile",
        profileId: rec.profile.id,
        message: `${rec.profile.id} is default-enabled but has no concrete runner`,
      });
    }
  }

  for (const rec of externalRecommendations) {
    const actions = activationPlan.steps
      .filter((step) => step.profileId === rec.profile.id)
      .map((step) => step.action);
    if (!actions.includes("human-approval") || !actions.includes("refuse-run")) {
      findings.push({
        code: "external-without-activation-plan",
        profileId: rec.profile.id,
        message: `${rec.profile.id} is external/disabled but lacks approval and refusal routing`,
      });
    }
  }

  const defaultRunnableProfiles = defaultRecommendations
    .map((rec) => rec.profile.id)
    .filter((id) => PROFILE_RUNNERS[id])
    .sort();
  const externalProfiles = externalRecommendations.map((rec) => rec.profile.id).sort();
  findings.push(...rightArm.findings);

  return {
    recommendation,
    activationPlan,
    defaultRunnableProfiles,
    externalProfiles,
    rightArmCoverage: rightArm.coverage,
    findings: findings.sort((a, b) =>
      `${a.code}:${a.profileId ?? ""}`.localeCompare(`${b.code}:${b.profileId ?? ""}`),
    ),
    ok: recommendation.ok && findings.length === 0,
  };
}

export function verificationProfileGateMessages(result: VerificationProfileGateResult): string[] {
  if (result.ok) {
    return [
      `verification-profile - OK (${result.recommendation.recommendations.length} profiles recommended; default_runnable=${result.defaultRunnableProfiles.length}; external_gated=${result.externalProfiles.length})`,
      `verification-profile - OK (right_arm_gates=${Object.keys(result.rightArmCoverage.gates).length}; always_l10_drives=${L10_REQUIRED_ALWAYS_DRIVES.length})`,
    ];
  }
  return [
    "verification-profile - violation",
    ...result.findings.map(
      (finding) =>
        `${finding.code}${finding.profileId ? ` ${finding.profileId}` : ""}: ${finding.message}`,
    ),
  ];
}
