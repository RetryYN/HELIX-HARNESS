import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  materializeAuthorityEvidence,
  planAuthorityEvidencePaths,
  preflightAuthorityEvidence,
  writeAuthorityEvidence,
} from "../src/cli/commands/authority";
import { openHarnessDb } from "../src/state-db/index";
import { migrate } from "../src/state-db/migration";

// PLAN-L7-459-design-freeze-authority-transition

const roots: string[] = [];

function fixture(): string {
  const root = mkdtempSync(join(tmpdir(), "helix-authority-cli-"));
  roots.push(root);
  return root;
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe("authority CLI evidence boundary", () => {
  function pendingEvidence(root: string) {
    const db = openHarnessDb(":memory:", { repoRoot: root });
    migrate(db);
    const plan = planAuthorityEvidencePaths(root, {
      receiptOut: "design-freeze/receipt.json",
      fullRowExportOut: "design-freeze/full-row.json",
    });
    db.prepare("INSERT INTO design_freeze_v2_evidence_outbox VALUES (?,?,?,?,?,?,?,?,?,?)").run(
      "op-1",
      "a".repeat(64),
      plan.fullRowExport?.relativePath,
      '{"export":true}\n',
      "b".repeat(64),
      plan.receipt.relativePath,
      '{"receipt":true}\n',
      "c".repeat(64),
      "pending_materialization",
      "2026-07-17T00:00:00.000Z",
    );
    if (!plan.fullRowExport) throw new Error("test full export target missing");
    return { db, plan: { receipt: plan.receipt, fullRowExport: plan.fullRowExport } };
  }

  it("U-DFA-006: project-owned authority evidence rootだけをtransaction前に解決する", () => {
    const root = fixture();
    const plan = planAuthorityEvidencePaths(root, {
      receiptOut: "design-freeze/receipt.json",
      fullRowExportOut: "design-freeze/full-row.json",
    });

    expect(plan.receipt.relativePath).toBe(".helix/evidence/authority/design-freeze/receipt.json");
    expect(plan.fullRowExport?.relativePath).toBe(
      ".helix/evidence/authority/design-freeze/full-row.json",
    );
    expect(existsSync(join(root, ".helix"))).toBe(false);

    for (const path of [
      "/tmp/receipt.json",
      "../receipt.json",
      "design-freeze/../../receipt.json",
      "design-freeze\\receipt.json",
      "design-freeze/receipt\0.json",
      ".helix/evidence/authority/receipt.json",
    ]) {
      expect(() => planAuthorityEvidencePaths(root, { receiptOut: path })).toThrow(
        /authority_evidence_path_invalid/,
      );
    }
    expect(() =>
      planAuthorityEvidencePaths(root, {
        receiptOut: "design-freeze/same.json",
        fullRowExportOut: "design-freeze/same.json",
      }),
    ).toThrow(/authority_evidence_paths_conflict/);
    expect(existsSync(join(root, ".helix"))).toBe(false);
  });

  it("U-DFA-006: CLIは不正receipt pathをDB migrationより前に拒否する", () => {
    const root = fixture();
    const cli = resolve(process.cwd(), "src/cli.ts");
    const result = spawnSync(
      "bun",
      [
        "run",
        cli,
        "authority",
        "po7-activate",
        "--operation-id",
        "U-DFA-006",
        "--idempotency-key",
        "U-DFA-006",
        "--execute",
        "--receipt-out",
        "../outside.json",
      ],
      { cwd: root, encoding: "utf8" },
    );

    expect(result.status).not.toBe(0);
    expect(`${result.stdout}${result.stderr}`).toContain("authority_evidence_path_invalid");
    expect(existsSync(join(root, ".helix", "harness.db"))).toBe(false);
    expect(existsSync(join(root, "..", "outside.json"))).toBe(false);
  });

  it("U-DFA-006: symlink ancestorを拒否しproject外へdirectoryも作らない", () => {
    const root = fixture();
    const outside = fixture();
    symlinkSync(outside, join(root, ".helix"), "dir");

    expect(() =>
      planAuthorityEvidencePaths(root, { receiptOut: "design-freeze/receipt.json" }),
    ).toThrow(/authority_evidence_root_untrusted/);
    expect(existsSync(join(outside, "evidence"))).toBe(false);
  });

  it("U-DFA-006: evidenceはnew-file-onlyで同一bytes replayだけを許可する", () => {
    const root = fixture();
    mkdirSync(join(root, ".helix"));
    const target = planAuthorityEvidencePaths(root, {
      receiptOut: "design-freeze/receipt.json",
    }).receipt;

    const first = writeAuthorityEvidence(target, '{"ok":true}\n');
    const replay = writeAuthorityEvidence(target, '{"ok":true}\n');
    expect(first).toMatchObject({ digest: replay.digest, path: replay.path });
    expect(first.replayed).toBe(false);
    expect(replay.replayed).toBe(true);
    expect(readFileSync(target.absolutePath, "utf8")).toBe('{"ok":true}\n');
    expect(() => writeAuthorityEvidence(target, '{"ok":false}\n')).toThrow(
      /authority_evidence_conflict/,
    );

    const outside = join(fixture(), "forged.json");
    expect(() =>
      writeAuthorityEvidence(
        { absolutePath: outside, relativePath: "../forged.json", repoRoot: root },
        "forged\n",
      ),
    ).toThrow(/authority_evidence_target_untrusted/);
    expect(existsSync(outside)).toBe(false);
  });

  it("U-DFA-006: full export成功後のreceipt失敗をpending outboxからreconcileする", () => {
    const root = fixture();
    const { db, plan } = pendingEvidence(root);
    let writes = 0;
    expect(() =>
      materializeAuthorityEvidence(db, "op-1", plan, (target, content) => {
        writes += 1;
        if (writes === 2) throw Object.assign(new Error("ENOSPC receipt"), { code: "ENOSPC" });
        return writeAuthorityEvidence(target, content);
      }),
    ).toThrow(/ENOSPC/);
    expect(readFileSync(plan.fullRowExport.absolutePath, "utf8")).toBe('{"export":true}\n');
    expect(existsSync(plan.receipt.absolutePath)).toBe(false);
    expect(
      db
        .prepare("SELECT 1 FROM design_freeze_v2_evidence_terminal_receipts WHERE operation_id=?")
        .get("op-1"),
    ).toBeUndefined();

    expect(materializeAuthorityEvidence(db, "op-1", plan).replayed).toBe(false);
    expect(readFileSync(plan.receipt.absolutePath, "utf8")).toBe('{"receipt":true}\n');
    expect(
      db
        .prepare(
          "SELECT status FROM design_freeze_v2_evidence_terminal_receipts WHERE operation_id=?",
        )
        .get("op-1")?.status,
    ).toBe("materialized");
    db.close();
  });

  it("U-DFA-006: ENOSPC相当ではterminal receiptを発行しない", () => {
    const root = fixture();
    const { db, plan } = pendingEvidence(root);
    expect(() =>
      materializeAuthorityEvidence(db, "op-1", plan, () => {
        throw Object.assign(new Error("disk full"), { code: "ENOSPC" });
      }),
    ).toThrow(/disk full/);
    expect(existsSync(plan.fullRowExport.absolutePath)).toBe(false);
    expect(
      db.prepare("SELECT count(*) count FROM design_freeze_v2_evidence_terminal_receipts").get()
        ?.count,
    ).toBe(0);
    db.close();
  });

  it("U-DFA-006: unrelated existing evidenceをauthority DB commit前に拒否する", () => {
    const root = fixture();
    const { db, plan } = pendingEvidence(root);
    writeAuthorityEvidence(plan.receipt, "foreign\n");
    expect(() => preflightAuthorityEvidence(db, "new-idempotency-key", plan)).toThrow(
      /authority_evidence_conflict_precommit/,
    );
    expect(
      db.prepare("SELECT count(*) count FROM design_freeze_v2_transition_operations").get()?.count,
    ).toBe(0);
    db.close();
  });

  it("U-DFA-006: temp write途中失敗でcanonical partialを残さずtempをcleanupする", () => {
    const root = fixture();
    const target = planAuthorityEvidencePaths(root, {
      receiptOut: "design-freeze/receipt.json",
    }).receipt;
    expect(() =>
      writeAuthorityEvidence(target, "complete\n", {
        writeTemp: (fd) => {
          writeFileSync(fd, "part");
          throw Object.assign(new Error("injected short write"), { code: "ENOSPC" });
        },
      }),
    ).toThrow(/short write/);
    expect(existsSync(target.absolutePath)).toBe(false);
    expect(readdirSync(join(root, ".helix/evidence/authority/design-freeze"))).toEqual([]);
  });

  it("U-DFA-006: publish直前のparent symlink置換をidentity mismatchでfail-closeする", () => {
    const root = fixture();
    const outside = fixture();
    const target = planAuthorityEvidencePaths(root, {
      receiptOut: "design-freeze/receipt.json",
    }).receipt;
    const parent = dirname(target.absolutePath);
    const held = join(root, "held-authority-parent");
    expect(() =>
      writeAuthorityEvidence(target, "trusted\n", {
        beforePublish: () => {
          renameSync(parent, held);
          symlinkSync(outside, parent, "dir");
        },
      }),
    ).toThrow(/authority_evidence_ancestor_identity_mismatch/);
    expect(existsSync(join(outside, "receipt.json"))).toBe(false);
    expect(readdirSync(held).some((name) => name.includes(".tmp-"))).toBe(false);
    rmSync(parent);
    renameSync(held, parent);
  });

  it("U-DFA-006: assert後link直前raceでもdirfd capability外へpublishしない", () => {
    const root = fixture();
    const outside = fixture();
    const target = planAuthorityEvidencePaths(root, {
      receiptOut: "design-freeze/receipt.json",
    }).receipt;
    const parent = dirname(target.absolutePath);
    const held = join(root, "held-after-assert-parent");
    expect(() =>
      writeAuthorityEvidence(target, "inode-bound\n", {
        afterBindingCheckBeforePublish: () => {
          renameSync(parent, held);
          symlinkSync(outside, parent, "dir");
        },
      }),
    ).toThrow(/authority_evidence_ancestor_identity_mismatch/);
    expect(existsSync(join(outside, "receipt.json"))).toBe(false);
    expect(readFileSync(join(held, "receipt.json"), "utf8")).toBe("inode-bound\n");
    expect(readdirSync(held).some((name) => name.includes(".tmp-"))).toBe(false);
    rmSync(parent);
    renameSync(held, parent);
  });

  it("U-DFA-006: terminal済みevidence欠落をoutbox bytesから修復してからreplay成功する", () => {
    const root = fixture();
    const { db, plan } = pendingEvidence(root);
    materializeAuthorityEvidence(db, "op-1", plan);
    rmSync(plan.fullRowExport.absolutePath);
    rmSync(plan.receipt.absolutePath);

    const replay = materializeAuthorityEvidence(db, "op-1", plan);
    expect(replay.replayed).toBe(true);
    expect(readFileSync(plan.fullRowExport.absolutePath, "utf8")).toBe('{"export":true}\n');
    expect(readFileSync(plan.receipt.absolutePath, "utf8")).toBe('{"receipt":true}\n');
    db.close();
  });
});
