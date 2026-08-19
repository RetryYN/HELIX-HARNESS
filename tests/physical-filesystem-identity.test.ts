import {
  linkSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  attestPhysicalFilesystemIdentity,
  evaluatePhysicalFilesystemTargetSafety,
  isPhysicalFilesystemIdentityBinding,
  revalidatePhysicalFilesystemIdentity,
} from "../src/runtime/physical-filesystem-identity";

// PLAN-L7-601-physical-filesystem-identity / PLAN-L3-62-security-capability-broker-authority / SEC-AC-CAP-002

const roots: string[] = [];

function repository(): string {
  const root = mkdtempSync(join(tmpdir(), "helix-physical-identity-"));
  roots.push(root);
  return root;
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe("physical filesystem identity", () => {
  it("U-PHYSID-001: exact literal fileを物理同一性へ束縛し、値非表示receiptを返す", () => {
    const root = repository();
    writeFileSync(join(root, "input.txt"), "bounded input");

    const result = attestPhysicalFilesystemIdentity({
      repo_root: root,
      lexical_targets: ["input.txt"],
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(isPhysicalFilesystemIdentityBinding(result.binding)).toBe(true);
    expect(result.receipt.status).toBe("allow_candidate");
    expect(result.receipt.target_count).toBe(1);
    expect(result.receipt.targets[0]?.lexical_target).toBe("input.txt");
    expect(result.receipt.targets[0]?.physical_relative_path).toBe("input.txt");
    expect(result.receipt.targets[0]?.stat.type).toBe("file");
    expect(JSON.stringify(result.receipt)).not.toContain(root);
    expect(readFileSync(join(root, "input.txt"), "utf8")).toBe("bounded input");
  });

  it("U-PHYSID-002: ancestor/final symlinkをrepo内literalとして通さない", () => {
    const root = repository();
    mkdirSync(join(root, "real"));
    writeFileSync(join(root, "real", "input.txt"), "bounded input");
    symlinkSync(join(root, "real", "input.txt"), join(root, "final-link.txt"));
    symlinkSync(join(root, "real"), join(root, "linked"));

    expect(
      attestPhysicalFilesystemIdentity({ repo_root: root, lexical_targets: ["final-link.txt"] }),
    ).toMatchObject({ ok: false, failure_code: "PHYSICAL_TARGET_SYMLINK_OR_JUNCTION" });
    expect(
      attestPhysicalFilesystemIdentity({ repo_root: root, lexical_targets: ["linked/input.txt"] }),
    ).toMatchObject({ ok: false, failure_code: "PHYSICAL_TARGET_SYMLINK_OR_JUNCTION" });
  });

  it("U-PHYSID-003: absolute、traversal、glob、重複、件数不一致をfail-closeする", () => {
    const root = repository();
    writeFileSync(join(root, "input.txt"), "bounded input");
    for (const lexicalTarget of [
      "../outside.txt",
      "/tmp/outside.txt",
      "input*.txt",
      "./input.txt",
    ]) {
      expect(
        attestPhysicalFilesystemIdentity({ repo_root: root, lexical_targets: [lexicalTarget] }),
      ).toMatchObject({ ok: false, failure_code: "PHYSICAL_TARGET_PATH_INVALID" });
    }
    expect(
      attestPhysicalFilesystemIdentity({
        repo_root: root,
        lexical_targets: ["input.txt", "input.txt"],
      }),
    ).toMatchObject({ ok: false, failure_code: "PHYSICAL_TARGET_DUPLICATE" });
    expect(
      attestPhysicalFilesystemIdentity({
        repo_root: root,
        lexical_targets: ["input.txt"],
        expected_target_count: 2,
      }),
    ).toMatchObject({ ok: false, failure_code: "PHYSICAL_TARGET_SET_UNRESOLVED" });
  });

  it("U-PHYSID-004: hardlinkの同一実体を曖昧なtargetとして拒否する", () => {
    const root = repository();
    writeFileSync(join(root, "input.txt"), "bounded input");
    linkSync(join(root, "input.txt"), join(root, "alias.txt"));

    expect(
      attestPhysicalFilesystemIdentity({ repo_root: root, lexical_targets: ["input.txt"] }),
    ).toMatchObject({ ok: false, failure_code: "PHYSICAL_TARGET_HARDLINK_AMBIGUOUS" });
  });

  it("U-PHYSID-005: 判定後のreplaceをidentity driftとして再実行前に拒否する", () => {
    const root = repository();
    writeFileSync(join(root, "input.txt"), "bounded input");
    const initial = attestPhysicalFilesystemIdentity({
      repo_root: root,
      lexical_targets: ["input.txt"],
    });
    expect(initial.ok).toBe(true);
    if (!initial.ok) return;

    writeFileSync(join(root, "replacement.txt"), "bounded input");
    rmSync(join(root, "input.txt"));
    renameSync(join(root, "replacement.txt"), join(root, "input.txt"));
    const revalidated = revalidatePhysicalFilesystemIdentity(
      { repo_root: root, lexical_targets: ["input.txt"] },
      initial.binding,
    );

    expect(revalidated).toMatchObject({
      ok: false,
      failure_code: "PHYSICAL_TARGET_IDENTITY_DRIFT",
    });
  });

  it("U-PHYSID-006: target set digestは入力順ではなくexact memberで決まる", () => {
    const root = repository();
    writeFileSync(join(root, "a.txt"), "a");
    writeFileSync(join(root, "b.txt"), "b");
    const left = attestPhysicalFilesystemIdentity({
      repo_root: root,
      lexical_targets: ["a.txt", "b.txt"],
    });
    const right = attestPhysicalFilesystemIdentity({
      repo_root: root,
      lexical_targets: ["b.txt", "a.txt"],
    });

    expect(left.ok).toBe(true);
    expect(right.ok).toBe(true);
    if (!left.ok || !right.ok) return;
    expect(left.binding.target_set_digest).toBe(right.binding.target_set_digest);
    expect(left.binding.identity_digest).toBe(right.binding.identity_digest);
  });

  it("U-PHYSID-007: repo外realpathをboundary escapeとして拒否する", () => {
    const root = repository();
    const outside = join(root, "..", "outside.txt");
    expect(
      evaluatePhysicalFilesystemTargetSafety({
        root,
        physical: outside,
        root_device: "1",
        observed_device: "1",
        mount_points: new Set(),
      }),
    ).toBe("PHYSICAL_TARGET_BOUNDARY_ESCAPE");
  });

  it("U-PHYSID-008: 非regular targetをfail-closeする", () => {
    const root = repository();
    expect(
      evaluatePhysicalFilesystemTargetSafety({
        root,
        physical: join(root, "fifo"),
        root_device: "1",
        mount_points: new Set(),
      }),
    ).toBe("PHYSICAL_TARGET_NOT_REGULAR");
  });

  it("U-PHYSID-009: mount/bind boundaryを注入値で拒否する", () => {
    const root = repository();
    const mounted = join(root, "mounted");
    expect(
      evaluatePhysicalFilesystemTargetSafety({
        root,
        physical: mounted,
        root_device: "1",
        observed_device: "1",
        mount_points: new Set([mounted]),
      }),
    ).toBe("PHYSICAL_TARGET_MOUNT_BOUNDARY");
  });

  it("U-PHYSID-010: device差異をmount boundaryとして拒否する", () => {
    const root = repository();
    expect(
      evaluatePhysicalFilesystemTargetSafety({
        root,
        physical: join(root, "device-file"),
        root_device: "1",
        observed_device: "2",
        mount_points: new Set(),
      }),
    ).toBe("PHYSICAL_TARGET_MOUNT_BOUNDARY");
  });
});
