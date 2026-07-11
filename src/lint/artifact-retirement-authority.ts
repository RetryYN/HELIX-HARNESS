import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { normalizePath } from "./shared";

const SHA256 = /^sha256:[a-f0-9]{64}$/;
const AUTHORITY_FILE = "config/artifact-retirement-authority.json";
const ENFORCE_FILE = "config/handover-retirement-enforce-authority.json";
const AUTHORITY_DIGEST = "sha256:ecfa5c92f001f0f0ef97068f4528511c02f0b829457e408db0263aa13b75881a";

interface RetirementArtifact {
  path: string;
  disposition: "retired_deleted";
}

interface ArtifactRetirementAuthority {
  schemaVersion: "artifact-retirement-authority.v1";
  operationId: string;
  intentDigest: string;
  approvalDecisionId: string;
  artifacts: RetirementArtifact[];
}

interface EnforceAuthorityBinding {
  operationId?: unknown;
  intentDigest?: unknown;
  approvalDecisionId?: unknown;
  approvalStatus?: unknown;
}

function digest(text: string): string {
  return `sha256:${createHash("sha256").update(text).digest("hex")}`;
}

/**
 * 完了済みの typed retirement authority により「意図して削除済み」と証明された artifact 集合を返す。
 * PLAN履歴の宣言を消さず、通常の missing artifact と承認済み退役を区別するための共通境界。
 * authority 不在・改ざん・binding 不一致は例外とし、呼出し側 doctor gate を fail-close させる。
 */
export function loadRetiredArtifactPaths(
  repoRoot: string,
  expectedAuthorityDigest: string = AUTHORITY_DIGEST,
): ReadonlySet<string> {
  const authorityPath = join(repoRoot, AUTHORITY_FILE);
  const enforcePath = join(repoRoot, ENFORCE_FILE);
  if (!existsSync(authorityPath) && !existsSync(enforcePath)) return new Set();
  if (!existsSync(authorityPath) || !existsSync(enforcePath)) {
    throw new Error("artifact retirement authority or enforce binding is missing");
  }
  const authorityText = readFileSync(authorityPath, "utf8");
  if (digest(authorityText) !== expectedAuthorityDigest) {
    throw new Error("artifact retirement authority digest mismatch");
  }
  const raw = JSON.parse(authorityText) as Partial<ArtifactRetirementAuthority>;
  const enforce = JSON.parse(readFileSync(enforcePath, "utf8")) as EnforceAuthorityBinding;
  if (
    raw.schemaVersion !== "artifact-retirement-authority.v1" ||
    typeof raw.operationId !== "string" ||
    typeof raw.intentDigest !== "string" ||
    !SHA256.test(raw.intentDigest) ||
    typeof raw.approvalDecisionId !== "string" ||
    !Array.isArray(raw.artifacts) ||
    enforce.approvalStatus !== "approved" ||
    enforce.operationId !== raw.operationId ||
    enforce.intentDigest !== raw.intentDigest ||
    enforce.approvalDecisionId !== raw.approvalDecisionId
  ) {
    throw new Error("artifact retirement authority is invalid or unbound");
  }
  const paths: string[] = [];
  for (const artifact of raw.artifacts) {
    if (
      !artifact ||
      typeof artifact.path !== "string" ||
      normalizePath(artifact.path) !== artifact.path ||
      artifact.path.startsWith("/") ||
      artifact.path.split("/").includes("..") ||
      artifact.disposition !== "retired_deleted"
    ) {
      throw new Error("artifact retirement authority contains an invalid artifact");
    }
    paths.push(artifact.path);
  }
  const sorted = [...paths].sort((a, b) => a.localeCompare(b));
  if (new Set(paths).size !== paths.length || JSON.stringify(paths) !== JSON.stringify(sorted)) {
    throw new Error("artifact retirement authority artifacts are not canonical");
  }
  return new Set(paths);
}
