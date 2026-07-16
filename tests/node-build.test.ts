import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { collectNodeArtifactEvidence, runNodeBuildAdapter } from "../src/runtime/node-build";

function fixture() {
  const root = mkdtempSync(join(tmpdir(), "helix-node-build-"));
  mkdirSync(join(root, "tools"));
  mkdirSync(join(root, "src"));
  mkdirSync(join(root, "dist"));
  writeFileSync(join(root, "tools", "build.mjs"), "export {};\n");
  writeFileSync(join(root, "src", "cli.mjs"), "export {};\n");
  writeFileSync(
    join(root, "dist", "helix.mjs"),
    "#!/usr/bin/env node\nexport const main = true;\n",
  );
  return root;
}

function success(stdout = "ok\n") {
  return { pid: 1, output: [], stdout, stderr: "", status: 0, signal: null, error: undefined };
}

describe("node build adapter", () => {
  it("collects repo-relative build evidence via Node argv without shell", () => {
    const root = fixture();
    const spawn = vi.fn(() => success());
    const evidence = runNodeBuildAdapter(
      {
        repo_root: root,
        snapshot_digest: "a".repeat(64),
        build_module_path: "tools/build.mjs",
        build_args: ["--entry", "src/cli.mjs", "--output", "dist/helix.mjs"],
        entry_path: "src/cli.mjs",
        output_path: "dist/helix.mjs",
        node_executable: "/usr/bin/node",
      },
      { spawn: spawn as never },
    );

    expect(evidence.artifact_exists).toBe(true);
    expect(evidence.build_module_path).toBe("tools/build.mjs");
    expect(evidence.output_path).toBe("dist/helix.mjs");
    expect(JSON.stringify(evidence)).not.toContain(root);
    const secondRoot = fixture();
    const relocated = runNodeBuildAdapter(
      {
        repo_root: secondRoot,
        snapshot_digest: "a".repeat(64),
        build_module_path: "tools/build.mjs",
        build_args: ["--entry", "src/cli.mjs", "--output", "dist/helix.mjs"],
        entry_path: "src/cli.mjs",
        output_path: "dist/helix.mjs",
        node_executable: "/usr/bin/node",
      },
      { spawn: spawn as never },
    );
    expect(relocated.command.argv_digest).toBe(evidence.command.argv_digest);
    expect(relocated.evidence_digest).toBe(evidence.evidence_digest);
    expect(spawn).toHaveBeenCalledWith(
      "/usr/bin/node",
      expect.arrayContaining([join(root, "tools", "build.mjs")]),
      expect.objectContaining({ shell: false, cwd: root }),
    );
  });

  it("refuses Bun/non-Node execution and path escape before invoking a process", () => {
    const root = fixture();
    const spawn = vi.fn(() => success());
    expect(() =>
      runNodeBuildAdapter(
        {
          repo_root: root,
          snapshot_digest: "b".repeat(64),
          build_module_path: "tools/build.mjs",
          build_args: [],
          entry_path: "src/cli.mjs",
          output_path: "dist/helix.mjs",
          node_executable: "/usr/bin/bun",
        },
        { spawn: spawn as never },
      ),
    ).toThrow("non-Node");
    expect(() =>
      runNodeBuildAdapter({
        repo_root: root,
        snapshot_digest: "b".repeat(64),
        build_module_path: "../build.mjs",
        build_args: [],
        entry_path: "src/cli.mjs",
        output_path: "dist/helix.mjs",
      }),
    ).toThrow("escapes repo root");
    expect(spawn).not.toHaveBeenCalled();
  });

  it("collects ESM/bin/Bun-marker and source parity observations", () => {
    const root = fixture();
    const spawn = vi.fn(() => success("same\n"));
    const evidence = collectNodeArtifactEvidence(
      {
        repo_root: root,
        snapshot_digest: "c".repeat(64),
        artifact_path: "dist/helix.mjs",
        bin_target_path: "dist/helix.mjs",
        source_module_path: "src/cli.mjs",
        source_args: ["status", "--json"],
        node_executable: "/usr/bin/node",
      },
      { spawn: spawn as never },
    );

    expect(evidence).toMatchObject({
      shebang_valid: true,
      bin_mapping_valid: true,
      esm_artifact_observed: true,
      embedded_bun_marker_count: 0,
      source_parity: true,
    });
    expect(JSON.stringify(evidence)).not.toContain(root);
  });

  it("records parity failure and embedded Bun markers without granting validity", () => {
    const root = fixture();
    writeFileSync(
      join(root, "dist", "helix.mjs"),
      "#!/usr/bin/env node\nexport const runtime = Bun;\n",
    );
    const spawn = vi
      .fn()
      .mockReturnValueOnce(success("source\n"))
      .mockReturnValueOnce(success("artifact\n"));
    const evidence = collectNodeArtifactEvidence(
      {
        repo_root: root,
        snapshot_digest: "d".repeat(64),
        artifact_path: "dist/helix.mjs",
        bin_target_path: "src/cli.mjs",
        source_module_path: "src/cli.mjs",
        node_executable: "/usr/bin/node",
      },
      { spawn: spawn as never },
    );

    expect(evidence.bin_mapping_valid).toBe(false);
    expect(evidence.embedded_bun_marker_count).toBe(1);
    expect(evidence.source_parity).toBe(false);
  });
});
