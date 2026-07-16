import { describe, expect, it } from "vitest";
import {
  planNodeBuild,
  planNodeSourceExecution,
  validateNodeLock,
  validateNodeRuntime,
  verifyNodeArtifact,
} from "../src/runtime/node-runtime-cutover";

const D = "a".repeat(64);
describe("Node runtime cutover pure toolchain U-NCUT-006..010", () => {
  it("U-NCUT-006: Node floor/LTS/featuresを決定的に評価する", () => {
    const contract = {
      minimum_version: "24.15.0",
      maximum_exclusive_version: "25.0.0",
      required_features: ["node:sqlite", "esm"],
    };
    expect(
      validateNodeRuntime(
        {
          snapshot_digest: D,
          version: "v24.15.1",
          lts: true,
          available_features: ["esm", "node:sqlite"],
        },
        contract,
      ),
    ).toMatchObject({ compatible: true, failures: [] });
    expect(
      validateNodeRuntime(
        {
          snapshot_digest: D,
          version: "24.14.9",
          lts: true,
          available_features: ["esm"],
        },
        contract,
      ).failures[0]?.code,
    ).toBe("HIL_NODE_RUNTIME_UNSUPPORTED");
  });

  it("U-NCUT-007: canonical lock/frozen tree driftを拒否する", () => {
    const manifest = {
      snapshot_digest: D,
      manifest_digest: "m".repeat(64),
      canonical_lock_path: "package-lock.json",
    };
    const installed = {
      tree_digest: "t".repeat(64),
      lock_digest: "l".repeat(64),
      frozen_install: true,
    };
    expect(
      validateNodeLock(
        manifest,
        {
          path: "package-lock.json",
          digest: "l".repeat(64),
          manifest_digest: manifest.manifest_digest,
          canonical_lock_paths: ["package-lock.json"],
        },
        installed,
      ),
    ).toMatchObject({ compatible: true, canonical_lock_count: 1 });
    expect(validateNodeLock(manifest, null, installed).failures[0]?.code).toBe(
      "HIL_NODE_LOCK_MISSING",
    );
    expect(
      validateNodeLock(
        manifest,
        {
          path: "package-lock.json",
          digest: "x".repeat(64),
          manifest_digest: manifest.manifest_digest,
          canonical_lock_paths: ["package-lock.json", "npm-shrinkwrap.json"],
        },
        installed,
      ).failures[0]?.code,
    ).toBe("HIL_NODE_LOCK_DRIFT");
  });

  it("U-NCUT-008: source planは解決済みNode loaderかつwrite 0だけを許す", () => {
    const entry = { snapshot_digest: D, entry_path: "src/cli.ts" };
    const resolver = {
      resolver_id: "tsx",
      resolvable: true,
      module_graph_digest: D,
      unresolved_imports: [] as string[],
    };
    const result = planNodeSourceExecution(entry, resolver, {
      runner_id: "node24",
      loader_id: "tsx",
      command: "node --import tsx src/cli.ts",
      command_digest: "node --import tsx src/cli.ts",
    });
    expect(result).toMatchObject({
      ok: true,
      value: {
        bun_loader_count: 0,
        bun_command_count: 0,
        planned_write_count: 0,
      },
    });
    expect(
      planNodeSourceExecution(entry, resolver, {
        runner_id: "bun",
        loader_id: "bun:loader",
        command: "bun run src/cli.ts",
        command_digest: "bun run src/cli.ts",
      }),
    ).toMatchObject({
      ok: false,
      error: { code: "HIL_NODE_SOURCE_ENTRY_UNRESOLVABLE" },
    });
  });

  it("U-NCUT-009: ESM Node buildと許可externalだけを計画する", () => {
    const entry = { snapshot_digest: D, entry_path: "src/cli.ts" };
    const base = {
      snapshot_digest: D,
      output_path: "dist/helix",
      format: "esm",
      target: "node24",
      bin_name: "helix",
      external_ids: ["node:sqlite"],
      allowed_external_ids: ["node:sqlite"],
      native_external_ids: ["node:sqlite"],
      build_command: "esbuild src/cli.ts --bundle --platform=node",
    };
    expect(planNodeBuild(entry, base)).toMatchObject({
      ok: true,
      value: { format: "esm", bun_command_count: 0 },
    });
    expect(planNodeBuild(entry, { ...base, build_command: "bun build src/cli.ts" })).toMatchObject({
      ok: false,
      error: { code: "HIL_NODE_BUILD_ARTIFACT_INVALID" },
    });
  });

  it("U-NCUT-010: artifact tamper/shebang/bin/parity/Bun markerを一つでも拒否する", () => {
    const oracle = {
      source_oracle_digest: D,
      expected_artifact_digest: "b".repeat(64),
      expected_bin_name: "helix",
      expected_bin_path: "dist/helix",
      expected_source_parity_digest: "p".repeat(64),
      required_shebang: "#!/usr/bin/env node",
    };
    const artifact = {
      snapshot_digest: D,
      artifact_path: "dist/helix",
      artifact_digest: oracle.expected_artifact_digest,
      content: "#!/usr/bin/env node\nconsole.log('ok')",
      bin_name: "helix",
      declared_bin_path: "dist/helix",
      source_parity_digest: oracle.expected_source_parity_digest,
    };
    expect(verifyNodeArtifact(artifact, oracle)).toMatchObject({
      valid: true,
      embedded_bun_marker_count: 0,
      failures: [],
    });
    expect(
      verifyNodeArtifact({ ...artifact, content: "#!/usr/bin/env bun\nbun run x" }, oracle),
    ).toMatchObject({
      valid: false,
      failures: [{ code: "HIL_NODE_BUILD_ARTIFACT_INVALID" }],
    });
  });
});
