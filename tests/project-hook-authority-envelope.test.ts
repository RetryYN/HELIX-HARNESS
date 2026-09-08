import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { canonicalJson, sha256Digest } from "../src/runtime/digest";
import { projectHookAuthorityInputUnavailable } from "../src/runtime/project-hook-authority";
import {
  admitProjectHookAuthorityDispatch,
  buildProjectHookAuthorityConsumerWiring,
  consumeProjectHookAuthoritySurface,
} from "../src/runtime/project-hook-authority-consumer";
import {
  observeNodeProjectHookHost,
  observeNodeProjectHookHostFromTransport,
  PROJECT_HOOK_AUTHORITY_TRANSPORT_ENVELOPE_SCHEMA,
  type ProjectHookAuthorityHostObservation,
  type ProjectHookAuthorityTransportEnvelopeV1,
  projectHookAuthorityTransportEnvelopeSchema,
  projectStandaloneProjectHookAuthoritySurface,
  resolveProjectHookAuthorityFromTransport,
} from "../src/runtime/project-hook-authority-envelope";
import { projectProjectHookAuthoritySurfaces } from "../src/runtime/project-hook-authority-surface-projector";
import type { ProjectHookPhysicalAdapterDeps } from "../src/runtime/project-hook-physical-adapter";

// PLAN-L7-1614-project-hook-authority-consumer-wiring

const HEAD = "a".repeat(40);
const digest = (value: unknown) => sha256Digest(canonicalJson(value));
const rawDigest = (value: string): `sha256:${string}` =>
  `sha256:${createHash("sha256").update(value).digest("hex")}`;

const roots = {
  lane: {
    lexical_path: "/lane",
    canonical_realpath: "/physical/lane",
    repository_common_dir: "/physical/repo/.git",
    filesystem_identity: {
      platform: "linux" as const,
      device_id: "11",
      file_id: "22",
      evidence_kind: "stat" as const,
    },
  },
  authority: {
    lexical_path: "/authority",
    canonical_realpath: "/physical/authority",
    repository_common_dir: "/physical/repo/.git",
    filesystem_identity: {
      platform: "linux" as const,
      device_id: "11",
      file_id: "22",
      evidence_kind: "stat" as const,
    },
  },
} as const;

const sourceFor = (root: string) => ({
  hooks_config_digest: rawDigest(`${root}/.codex/hooks.json`),
  agent_guard_digest: rawDigest(`${root}/src/runtime/agent-guard.ts`),
  worker_policy_digest: rawDigest(`${root}/src/runtime/codex-native-worker-policy.ts`),
});

function physicalDeps(): ProjectHookPhysicalAdapterDeps {
  return {
    platform: "linux",
    realpath: (path) => (path === "/physical/repo/.git" ? path : `/physical${path}`),
    stat: (path) => ({ dev: 11, ino: path.includes("authority") ? 33 : 22 }),
    readFile: (path) => Buffer.from(path.replace("/physical/authority", "/physical/lane")),
    git: (_root, args) => {
      if (args.includes("--git-common-dir")) return "/physical/repo/.git";
      if (args.includes("for-each-ref")) return "refs/remotes/origin/main";
      return HEAD;
    },
  };
}

function host(): ProjectHookAuthorityHostObservation {
  return {
    execution_root: "/lane",
    loader_root: "/lane",
    session_project_root: "/lane",
    current_authority_root: "/authority",
    captured_at: "2026-09-07T00:00:00.000Z",
  };
}

function envelope(): ProjectHookAuthorityTransportEnvelopeV1 {
  const laneSource = sourceFor("/physical/lane");
  const authoritySource = laneSource;
  return {
    schema_version: PROJECT_HOOK_AUTHORITY_TRANSPORT_ENVELOPE_SCHEMA,
    envelope_id: "envelope-1614",
    issued_at: "2026-09-07T00:00:00.000Z",
    capture_locators: {
      loader_root: "/lane",
      session_project_root: "/lane",
      current_authority_root: "/authority",
    },
    expected: {
      execution_root: roots.lane,
      loader_root: roots.lane,
      session_project_root: roots.lane,
      current_authority_root: roots.authority,
      assignment_binding: {
        kind: "assignment",
        assignment_id: "assignment-1614",
        assignment_root_digest: digest(roots.lane),
        branch: "feature/1614-project-hook-authority-envelope",
        lease_id: "lease-1614",
        fence_token: "fence-1614",
      },
      candidate_base_head: HEAD,
      current_authority_head: HEAD,
      source_material: structuredClone(laneSource),
      current_authority_source_material: structuredClone(authoritySource),
      lifecycle_policy: {
        timeout_ms: 15_000,
        hard_ceiling_ms: 60_000,
        child_termination_grace_ms: 1_000,
        parent_terminal_required: true,
        notification_handoff: { kind: "disabled" },
      },
    },
  };
}

describe("project hook authority transport envelope", () => {
  it("U-CNWHOOKENV-001: Control Plane expectedとhost observedを別objectで受ける", () => {
    const parsed = projectHookAuthorityTransportEnvelopeSchema.safeParse(envelope());
    expect(parsed.success).toBe(true);
    expect(envelope()).not.toHaveProperty("observed");
    expect(envelope().expected).toHaveProperty("current_authority_head");
    expect(envelope().expected).toHaveProperty("current_authority_source_material");
  });

  it("U-CNWHOOKENV-002: 実execution/current authorityのHEADとsource bytesを独立観測する", () => {
    const reads: string[] = [];
    const deps = physicalDeps();
    const result = resolveProjectHookAuthorityFromTransport(envelope(), host(), {
      physical: {
        ...deps,
        readFile: (path) => {
          reads.push(path);
          return deps.readFile(path);
        },
      },
    });
    expect(result).toMatchObject({
      ok: true,
      receipt: {
        authority_root: "/physical/lane",
        repository_head: HEAD,
      },
    });
    expect(reads.filter((path) => path.includes("/physical/lane/")).length).toBe(3);
    expect(reads.filter((path) => path.includes("/physical/authority/")).length).toBe(3);
  });

  it("U-CNWHOOKENV-003: expected current authorityへ実測値をコピーせずHEAD差分を拒否する", () => {
    const bad = structuredClone(envelope());
    bad.expected.current_authority_head = "b".repeat(40);
    const result = resolveProjectHookAuthorityFromTransport(bad, host(), {
      physical: physicalDeps(),
    });
    expect(result).toMatchObject({
      ok: false,
      failure: {
        code: "project_hook_source_stale_or_foreign",
        json_pointer: "/current_authority_head",
      },
    });
  });

  it("U-CNWHOOKENV-003b: current authority source bytesの差分を独立に拒否する", () => {
    const bad = structuredClone(envelope());
    bad.expected.current_authority_source_material.agent_guard_digest = rawDigest("foreign-source");
    const result = resolveProjectHookAuthorityFromTransport(bad, host(), {
      physical: physicalDeps(),
    });
    expect(result).toMatchObject({
      ok: false,
      failure: {
        code: "project_hook_source_stale_or_foreign",
        json_pointer: "/current_authority_source_material",
      },
    });
  });

  it("U-CNWHOOKENV-003c: locatorが別git common dirを指す場合はexpected整合前に拒否する", () => {
    const badHost = { ...host(), current_authority_root: "/foreign-authority" };
    const deps = physicalDeps();
    const result = resolveProjectHookAuthorityFromTransport(envelope(), badHost, {
      physical: {
        ...deps,
        git: (root, args) => {
          if (args.includes("--git-common-dir")) {
            return root.includes("foreign-authority")
              ? "/physical/foreign-repo/.git"
              : "/physical/repo/.git";
          }
          if (args.includes("for-each-ref")) return "refs/remotes/origin/main";
          return HEAD;
        },
      },
    });
    expect(result).toMatchObject({
      ok: false,
      failure: {
        code: "project_hook_source_stale_or_foreign",
        json_pointer: "/current_authority_root/repository_common_dir",
      },
    });
  });

  it("U-CNWHOOKENV-003d: requestがcurrent authority HEADへ追随してもhost main anchor差分を拒否する", () => {
    const bad = structuredClone(envelope());
    bad.expected.current_authority_head = "b".repeat(40);
    const deps = physicalDeps();
    const result = resolveProjectHookAuthorityFromTransport(bad, host(), {
      physical: {
        ...deps,
        git: (root, args) => {
          if (args.includes("--git-common-dir")) return "/physical/repo/.git";
          if (args.includes("for-each-ref")) return "refs/remotes/upstream/trunk";
          if (args.includes("refs/remotes/upstream/trunk")) return HEAD;
          if (root.includes("authority")) return "b".repeat(40);
          return HEAD;
        },
      },
    });
    expect(result).toMatchObject({
      ok: false,
      failure: {
        code: "project_hook_source_stale_or_foreign",
        json_pointer: "/current_authority_anchor",
      },
    });
  });

  it("U-CNWHOOKENV-003e: remote default anchor欠落はinput unavailableへ閉じる", () => {
    const deps = physicalDeps();
    const result = resolveProjectHookAuthorityFromTransport(envelope(), host(), {
      physical: {
        ...deps,
        git: (root, args) => (args.includes("for-each-ref") ? "" : deps.git(root, args)),
      },
    });
    expect(result).toEqual(projectHookAuthorityInputUnavailable());
  });

  it("U-CNWHOOKENV-003f: 複数remote default anchorは推測せずinput unavailableへ閉じる", () => {
    const deps = physicalDeps();
    const result = resolveProjectHookAuthorityFromTransport(envelope(), host(), {
      physical: {
        ...deps,
        git: (root, args) =>
          args.includes("for-each-ref")
            ? "refs/remotes/origin/main\nrefs/remotes/upstream/trunk"
            : deps.git(root, args),
      },
    });
    expect(result).toEqual(projectHookAuthorityInputUnavailable());
  });

  it("U-CNWHOOKENV-004: observed root mismatchはcwd/env/default fileへfallbackせず拒否する", () => {
    const observed = { ...host(), execution_root: "/different-lane" };
    const git = vi.fn(physicalDeps().git);
    const result = resolveProjectHookAuthorityFromTransport(envelope(), observed, {
      physical: { ...physicalDeps(), git },
    });
    expect(result).toMatchObject({
      ok: false,
      failure: {
        code: "project_hook_source_stale_or_foreign",
        json_pointer: "/execution_root",
      },
    });
    expect(git).toHaveBeenCalled();
  });

  it("U-CNWHOOKENV-005: actual cwdは観測値に限定し、他rootを暗黙補完しない", () => {
    const observed = observeNodeProjectHookHost(
      {
        loader_root: "/loader",
        session_project_root: "/session",
        current_authority_root: "/authority",
        captured_at: "2026-09-07T00:00:00.000Z",
      },
      { cwd: () => "/observed-cwd" },
    );
    expect(observed).toEqual({
      execution_root: "/observed-cwd",
      loader_root: "/loader",
      session_project_root: "/session",
      current_authority_root: "/authority",
      captured_at: "2026-09-07T00:00:00.000Z",
    });
  });

  it("U-CNWHOOKENV-005b: loader/session/current authorityは個別locatorから観測する", () => {
    const candidate = envelope();
    candidate.capture_locators = {
      loader_root: "/loader",
      session_project_root: "/session",
      current_authority_root: "/authority",
    };
    const observed = observeNodeProjectHookHostFromTransport(
      candidate,
      { cwd: () => "/execution" },
      () => "2026-09-07T00:00:00.000Z",
    );
    expect(observed).toEqual({
      execution_root: "/execution",
      loader_root: "/loader",
      session_project_root: "/session",
      current_authority_root: "/authority",
      captured_at: "2026-09-07T00:00:00.000Z",
    });
  });

  it("U-CNWHOOKENV-006: standalone status/doctorはread-only unavailableでdispatchしない", () => {
    expect(projectStandaloneProjectHookAuthoritySurface()).toEqual({
      schema_version: "helix-project-hook-authority-standalone-projection.v1",
      execution_mode: "standalone",
      read_only: true,
      status: "unavailable",
      doctor: "unavailable",
      dispatch: "unavailable_no_dispatch",
      reason: "control_plane_transport_envelope_required",
      side_effects: {
        project_hook_authority_execution: 0,
        provider_dispatch: 0,
        git_write: 0,
        github_write: 0,
        coordination_session_start: "preserved",
      },
    });
  });

  it("U-CNWHOOKENV-007: invalid envelopeはschema failureへ閉じ、authority fallbackしない", () => {
    const result = resolveProjectHookAuthorityFromTransport(
      {
        ...envelope(),
        expected: {
          ...envelope().expected,
          current_authority_head: "not-a-head",
        },
      },
      host(),
      { physical: physicalDeps() },
    );
    expect(result).toMatchObject({
      ok: false,
      failure: {
        code: "schema_invalid",
        json_pointer: "/transport_envelope",
        side_effects: {
          hook_execution: 0,
          dispatch: 0,
          git_write: 0,
          db_write: 0,
          github_write: 0,
        },
      },
    });
  });

  it("U-CNHOOKWIRE-001: resolver/projectorは各1回、4 surfaceは同一bytesを読む", () => {
    let resolveCalls = 0;
    let projectCalls = 0;
    const wiring = buildProjectHookAuthorityConsumerWiring({
      raw_envelope: envelope(),
      host: host(),
      transport_deps: { physical: physicalDeps() },
      dependencies: {
        resolve: (...args) => {
          resolveCalls += 1;
          return resolveProjectHookAuthorityFromTransport(...args);
        },
        project: (resolution) => {
          projectCalls += 1;
          return projectProjectHookAuthoritySurfaces(resolution);
        },
      },
    });

    expect(resolveCalls).toBe(1);
    expect(projectCalls).toBe(1);
    expect(wiring.dispatch_allowed).toBe(true);
    expect(wiring.admitted_receipt).not.toBeNull();
    const bytes = [
      consumeProjectHookAuthoritySurface(wiring, "session_start"),
      consumeProjectHookAuthoritySurface(wiring, "doctor"),
      consumeProjectHookAuthoritySurface(wiring, "status"),
      consumeProjectHookAuthoritySurface(wiring, "dispatch"),
    ];
    expect(new Set(bytes).size).toBe(1);
    expect(admitProjectHookAuthorityDispatch(wiring)).toEqual({
      allowed: true,
      bytes: bytes[3],
      reason: "admitted_receipt",
    });
    expect(resolveCalls).toBe(1);
    expect(projectCalls).toBe(1);
  });

  it("U-CNHOOKWIRE-002: admitted receiptなしではdispatchせずfailure bytesだけを共有する", () => {
    let resolveCalls = 0;
    let projectCalls = 0;
    const bad = structuredClone(envelope());
    bad.expected.current_authority_head = "b".repeat(40);
    const wiring = buildProjectHookAuthorityConsumerWiring({
      raw_envelope: bad,
      host: host(),
      transport_deps: { physical: physicalDeps() },
      dependencies: {
        resolve: (...args) => {
          resolveCalls += 1;
          return resolveProjectHookAuthorityFromTransport(...args);
        },
        project: (resolution) => {
          projectCalls += 1;
          return projectProjectHookAuthoritySurfaces(resolution);
        },
      },
    });
    const dispatch = admitProjectHookAuthorityDispatch(wiring);
    expect(dispatch.allowed).toBe(false);
    expect(dispatch.reason).toBe("project_hook_authority_not_admitted");
    expect(wiring.admitted_receipt).toBeNull();
    expect(new Set(Object.values(wiring.projection.bytes_by_surface)).size).toBe(1);
    expect(dispatch.bytes).toBe(wiring.projection.bytes_by_surface.dispatch);
    expect(resolveCalls).toBe(1);
    expect(projectCalls).toBe(1);
  });

  // [PLAN-L7-1614-project-hook-authority-consumer-wiring/U-CNHOOKWIRE-007c]
  it("U-CNHOOKWIRE-007c: explicit admission helper remains wired to all native dispatch surfaces", () => {
    const cli = readFileSync(new URL("../src/cli.ts", import.meta.url), "utf8");
    const occurrences = cli.match(/admitExplicitProjectHookAuthority\(/gu) ?? [];
    // definition + loop + pair-agent + provider adapter + team
    expect(occurrences).toHaveLength(5);
  });

  it("U-CNHOOKWIRE-003: standaloneはread-only unavailableでdispatchを持たない", () => {
    const standalone = projectStandaloneProjectHookAuthoritySurface();
    expect(standalone.read_only).toBe(true);
    expect(standalone.status).toBe("unavailable");
    expect(standalone.doctor).toBe("unavailable");
    expect(standalone.dispatch).toBe("unavailable_no_dispatch");
    expect(standalone.side_effects).toEqual({
      project_hook_authority_execution: 0,
      provider_dispatch: 0,
      git_write: 0,
      github_write: 0,
      coordination_session_start: "preserved",
    });
  });

  it("U-CNHOOKWIRE-004: invalid transportはcwd/env/default fallbackを使わずlocatorを生成しない", () => {
    const cwd = vi.fn(() => "/unexpected-cwd");
    expect(
      observeNodeProjectHookHostFromTransport({ schema_version: "invalid" }, { cwd }),
    ).toBeNull();
    expect(cwd).not.toHaveBeenCalled();
  });

  it("U-CNHOOKWIRE-005: invalid transportは固定schema failureへ閉じる", () => {
    const result = resolveProjectHookAuthorityFromTransport({ schema_version: "invalid" }, host(), {
      physical: physicalDeps(),
    });
    expect(result).toMatchObject({
      ok: false,
      failure: {
        code: "schema_invalid",
        json_pointer: "/transport_envelope",
        side_effects: {
          hook_execution: 0,
          dispatch: 0,
          git_write: 0,
          db_write: 0,
          github_write: 0,
        },
      },
    });
  });

  it("U-CNHOOKWIRE-006: current authorityのHEAD差分はobserved値のコピーで相殺しない", () => {
    const bad = structuredClone(envelope());
    bad.expected.current_authority_head = "b".repeat(40);
    expect(
      resolveProjectHookAuthorityFromTransport(bad, host(), {
        physical: physicalDeps(),
      }),
    ).toMatchObject({
      ok: false,
      failure: {
        code: "project_hook_source_stale_or_foreign",
        json_pointer: "/current_authority_head",
      },
    });
  });

  it("U-CNHOOKWIRE-007: dispatch admissionはadmitted receiptの存在だけで判定しproviderを推測しない", () => {
    const bad = structuredClone(envelope());
    bad.expected.current_authority_source_material.agent_guard_digest = rawDigest("foreign");
    const wiring = buildProjectHookAuthorityConsumerWiring({
      raw_envelope: bad,
      host: host(),
      transport_deps: { physical: physicalDeps() },
    });
    expect(admitProjectHookAuthorityDispatch(wiring)).toMatchObject({
      allowed: false,
      reason: "project_hook_authority_not_admitted",
    });
    expect(wiring.admitted_receipt).toBeNull();
  });

  it("U-CNHOOKWIRE-008: CLI hostはcurrent authority locatorだけをtransportから受け、identityは後段で採取する", () => {
    const observed = observeNodeProjectHookHostFromTransport(
      envelope(),
      { cwd: () => "/lane" },
      () => "2026-09-07T00:00:01.000Z",
    );
    expect(observed).toEqual({
      execution_root: "/lane",
      loader_root: "/lane",
      session_project_root: "/lane",
      current_authority_root: "/authority",
      captured_at: "2026-09-07T00:00:01.000Z",
    });
  });
});
