import { createHash } from "node:crypto";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";

const PIN_PATH = ".helix/engine-pin.json";

export type LiteConsumerLifecycleFailure =
  | "pin_invalid"
  | "pin_not_direct_predecessor"
  | "consumer_path_unsafe"
  | "consumer_path_missing"
  | "consumer_bytes_changed";

export type LiteConsumerLifecycleResult =
  | {
      ok: true;
      schema_version: "helix-lite-consumer-lifecycle-receipt.v1";
      previous_pin: string;
      target_pin: string;
      rollback_pin: string;
      consumer_snapshot_digest: string;
      evidence_snapshot_digest: string;
      uninstall_preserved_evidence: true;
    }
  | { ok: false; failures: LiteConsumerLifecycleFailure[] };

function sha256(value: string | Buffer): string {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

function safeFile(root: string, path: string): string | null {
  if (path.startsWith("/") || path.includes("\\") || path.split("/").includes("..")) return null;
  const target = resolve(root, path);
  const rel = relative(root, target);
  if (!rel || rel === ".." || rel.startsWith(`..${sep}`) || !existsSync(target)) return null;
  const stat = lstatSync(target);
  return stat.isFile() && !stat.isSymbolicLink() && stat.nlink === 1 ? target : null;
}

function snapshot(root: string, paths: readonly string[]): string | null {
  const records: Array<{ path: string; digest: string }> = [];
  for (const path of [...new Set(paths)].sort()) {
    const target = safeFile(root, path);
    if (!target) return null;
    records.push({ path, digest: sha256(readFileSync(target)) });
  }
  return sha256(JSON.stringify(records));
}

function pinBytes(pin: string): string {
  return `${JSON.stringify({ schema_version: "helix-lite-engine-pin.v1", immutable_tag: pin }, null, 2)}\n`;
}

function atomicWrite(path: string, bytes: string): boolean {
  mkdirSync(dirname(path), { recursive: true });
  const temporary = `${path}.next-${process.pid}`;
  try {
    writeFileSync(temporary, bytes, { encoding: "utf8", mode: 0o600, flag: "wx" });
    renameSync(temporary, path);
    return true;
  } catch {
    if (existsSync(temporary)) {
      const stat = lstatSync(temporary);
      if (stat.isFile() && !stat.isSymbolicLink() && stat.nlink === 1) unlinkSync(temporary);
    }
    return false;
  }
}

export function rehearseLiteConsumerLifecycle(input: {
  consumer_root: string;
  previous_pin: string;
  target_pin: string;
  expected_previous_pin: string;
  consumer_owned_paths: readonly string[];
  evidence_paths: readonly string[];
}): LiteConsumerLifecycleResult {
  const tag = /^v\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;
  if (!tag.test(input.previous_pin) || !tag.test(input.target_pin)) {
    return { ok: false, failures: ["pin_invalid"] };
  }
  if (
    input.previous_pin !== input.expected_previous_pin ||
    input.previous_pin === input.target_pin
  ) {
    return { ok: false, failures: ["pin_not_direct_predecessor"] };
  }
  const root = resolve(input.consumer_root);
  const consumerBefore = snapshot(root, input.consumer_owned_paths);
  const evidenceBefore = snapshot(root, input.evidence_paths);
  if (!consumerBefore || !evidenceBefore) {
    return { ok: false, failures: ["consumer_path_missing"] };
  }
  const pinPath = join(root, PIN_PATH);
  if (existsSync(pinPath) && !safeFile(root, PIN_PATH)) {
    return { ok: false, failures: ["consumer_path_unsafe"] };
  }

  if (!atomicWrite(pinPath, pinBytes(input.target_pin))) {
    return { ok: false, failures: ["consumer_path_unsafe"] };
  }
  if (!atomicWrite(pinPath, pinBytes(input.previous_pin))) {
    return { ok: false, failures: ["consumer_path_unsafe"] };
  }
  unlinkSync(pinPath);
  if (!atomicWrite(pinPath, pinBytes(input.previous_pin))) {
    return { ok: false, failures: ["consumer_path_unsafe"] };
  }

  const consumerAfter = snapshot(root, input.consumer_owned_paths);
  const evidenceAfter = snapshot(root, input.evidence_paths);
  if (consumerAfter !== consumerBefore || evidenceAfter !== evidenceBefore) {
    return { ok: false, failures: ["consumer_bytes_changed"] };
  }
  return {
    ok: true,
    schema_version: "helix-lite-consumer-lifecycle-receipt.v1",
    previous_pin: input.previous_pin,
    target_pin: input.target_pin,
    rollback_pin: input.previous_pin,
    consumer_snapshot_digest: consumerBefore,
    evidence_snapshot_digest: evidenceBefore,
    uninstall_preserved_evidence: true,
  };
}
