import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { evaluateMachineSafetyGuard } from "../src/runtime/machine-safety-guard";
import { runMachineSafetyGuardHook } from "../src/runtime/machine-safety-guard-hook";

// PLAN-L7-553-machine-delete-secret-egress-guard / U-SAFETY-001
// PLAN-L7-553-machine-delete-secret-egress-guard / U-SAFETY-002
// PLAN-L7-553-machine-delete-secret-egress-guard / U-SAFETY-003
// PLAN-L7-553-machine-delete-secret-egress-guard / U-SAFETY-004

const repoRoot = "/work/repo";
const evaluate = (command: string) => evaluateMachineSafetyGuard({ command, repoRoot });

describe("machine-safety-guard", () => {
  it("U-SAFETY-001: repo内の静的な単一ファイル削除は許可する", () => {
    for (const command of ["rm docs/obsolete.md", "rm -f src/old.ts"]) {
      expect(evaluate(command).decision, command).toBe("pass");
    }
  });

  it("再帰・複数・動的・repo外のrmを拒否する", () => {
    for (const command of [
      "rm -rf build",
      // `-R` は `-r` と同義の再帰フラグ。大文字小文字を区別する判定だと素通りする回帰。
      "rm -R build",
      "rm -Rf build",
      "rm -fR build",
      "sudo rm -R build",
      "rm a.txt b.txt",
      "rm *.log",
      "rm $TARGET",
      "rm ../outside.txt",
      "rm /tmp/output.txt",
      "rm ~/notes.txt",
      "sudo rm -rf /home/user/data",
      "sudo -u root rm -rf /home/user/data",
      "sudo --user=root rm -rf /home/user/data",
      "timeout 5 rm -rf /home/user/data",
      "timeout --signal KILL 5 rm -rf /home/user/data",
      "nohup rm -rf /home/user/data",
      "nice -n 10 rm -rf /home/user/data",
      "ionice -c 3 rm -rf /home/user/data",
      "setsid rm -rf /home/user/data",
      "stdbuf -o0 rm -rf /home/user/data",
      "time -f %e rm -rf /home/user/data",
      "doas -u root rm -rf /home/user/data",
      "env TARGET=/tmp rm -rf $TARGET",
      "command -- rm -rf build",
      "env sudo rm -rf build",
      `bash -c "rm -rf /"`,
      `bash -lc "rm -rf /"`,
      `bash -i -c "rm -rf /"`,
      `bash --norc -c "rm -rf /"`,
      `bash --login -c "rm -rf /"`,
      `sh -euc "rm -rf /"`,
      `sh --posix -c "rm -rf /"`,
      `bash -c "$DELETE_COMMAND"`,
    ]) {
      expect(evaluate(command).decision, command).toBe("block");
    }
  });

  it("U-SAFETY-002: 機械処理による削除を拒否する", () => {
    for (const command of [
      `python -c "import shutil; shutil.rmtree('/')"`,
      `python script.py --expr "Path(target).unlink()"`,
      `node -e "require('fs').rmSync(target,{recursive:true})"`,
      `powershell -Command "Remove-Item -Recurse -Force $env:USERPROFILE"`,
      "find . -name '*.tmp' -delete",
      "find . -type f -exec rm {} +",
      "printf '%s\\n' a b | xargs rm",
    ]) {
      expect(evaluate(command).decision, command).toBe("block");
    }
  });

  it("U-SAFETY-003: 削除以外のhost破壊操作を拒否する", () => {
    for (const command of [
      "sudo mkfs.ext4 /dev/sda1",
      "dd if=/dev/zero of=/dev/sda bs=1M",
      "chmod -R 000 /home/user",
      "chown --recursive root:root .",
      "killall -9 node",
    ]) {
      expect(evaluate(command).decision, command).toBe("block");
    }
  });

  it("通常のread/build/test操作は許可する", () => {
    for (const command of [
      "git status --short",
      "npm test",
      "python scripts/check.py",
      "find docs -name '*.md' -print",
      "chmod 644 docs/file.md",
      "kill 1234",
      `echo "rm -rf /"`,
    ]) {
      expect(evaluate(command).decision, command).toBe("pass");
    }
  });

  it("U-SAFETY-004: interpreter script本文に削除APIがあれば実行前に拒否する", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-machine-script-"));
    try {
      writeFileSync(join(root, "cleanup.py"), "import shutil\nshutil.rmtree(target)\n");
      const outcome = runMachineSafetyGuardHook({
        repoRoot: root,
        rawInput: JSON.stringify({ tool_input: { command: "python cleanup.py" } }),
      });
      expect(outcome.decision).toBe("block");
      expect(outcome.operation).toContain("interpreter script");
      expect(
        runMachineSafetyGuardHook({
          repoRoot: root,
          rawInput: JSON.stringify({ tool_input: { command: "python ../outside.py" } }),
        }).decision,
      ).toBe("block");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
