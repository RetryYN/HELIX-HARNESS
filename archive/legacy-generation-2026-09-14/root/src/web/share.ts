import { Buffer } from "node:buffer";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const READ_ONLY_SHARE_PLAN_ID = "PLAN-L7-146-serverless-readonly-share";

export interface ReadOnlyShareManifest {
  schema: "helix.readonly-share-bundle.v1";
  planId: typeof READ_ONLY_SHARE_PLAN_ID;
  provider: "cloudflare";
  planOnly: true;
  mustNotDeploy: true;
  readOnly: true;
  hmacRequired: true;
  accessControlRequired: true;
  noSecretOrPiiProjection: true;
  noProdWrite: true;
  generatedAt: string;
  pollIntervalSec: number;
  screenCount: number;
  commonCount: number;
  specificCount: number;
  htmlSha256: string;
  activation: {
    cloudflareDeployApproved: false;
    githubWebhookApproved: false;
    secretBindingApproved: false;
    accessControlApproved: false;
  };
}

export interface ReadOnlyShareBundleFile {
  path: "index.html" | "share-manifest.json";
  mediaType: "text/html; charset=utf-8" | "application/json; charset=utf-8";
  bytes: number;
  sha256: string;
  content: string;
}

export interface ReadOnlyShareBundle {
  manifest: ReadOnlyShareManifest;
  files: ReadOnlyShareBundleFile[];
}

export interface BuildReadOnlyShareBundleInput {
  html: string;
  generatedAt?: string;
  pollIntervalSec: number;
  screenCount: number;
  commonCount: number;
  specificCount: number;
  readOnly: boolean;
}

export interface WebhookSignatureVerificationInput {
  secret: string | Uint8Array;
  body: string | Uint8Array;
  signatureHeader: string | null | undefined;
}

export interface WebhookSignatureVerificationResult {
  ok: boolean;
  algorithm: "sha256";
  reason?:
    | "missing_secret"
    | "missing_signature"
    | "unsupported_algorithm"
    | "length_mismatch"
    | "digest_mismatch";
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function file(
  path: ReadOnlyShareBundleFile["path"],
  mediaType: ReadOnlyShareBundleFile["mediaType"],
  content: string,
): ReadOnlyShareBundleFile {
  return {
    path,
    mediaType,
    bytes: Buffer.byteLength(content, "utf8"),
    sha256: sha256(content),
    content,
  };
}

export function buildReadOnlyShareBundle(
  input: BuildReadOnlyShareBundleInput,
): ReadOnlyShareBundle {
  if (!input.readOnly) throw new Error("read-only share bundle requires readOnly=true");
  if (input.pollIntervalSec < 30) {
    throw new Error("read-only share bundle must keep polling at 30 seconds or slower");
  }

  const htmlSha256 = sha256(input.html);
  const manifest: ReadOnlyShareManifest = {
    schema: "helix.readonly-share-bundle.v1",
    planId: READ_ONLY_SHARE_PLAN_ID,
    provider: "cloudflare",
    planOnly: true,
    mustNotDeploy: true,
    readOnly: true,
    hmacRequired: true,
    accessControlRequired: true,
    noSecretOrPiiProjection: true,
    noProdWrite: true,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    pollIntervalSec: input.pollIntervalSec,
    screenCount: input.screenCount,
    commonCount: input.commonCount,
    specificCount: input.specificCount,
    htmlSha256,
    activation: {
      cloudflareDeployApproved: false,
      githubWebhookApproved: false,
      secretBindingApproved: false,
      accessControlApproved: false,
    },
  };
  const manifestContent = `${JSON.stringify(manifest, null, 2)}\n`;

  return {
    manifest,
    files: [
      file("index.html", "text/html; charset=utf-8", input.html),
      file("share-manifest.json", "application/json; charset=utf-8", manifestContent),
    ],
  };
}

export function verifyGithubWebhookSignature(
  input: WebhookSignatureVerificationInput,
): WebhookSignatureVerificationResult {
  if (typeof input.secret === "string" && input.secret.length === 0) {
    return { ok: false, algorithm: "sha256", reason: "missing_secret" };
  }
  if (input.secret instanceof Uint8Array && input.secret.byteLength === 0) {
    return { ok: false, algorithm: "sha256", reason: "missing_secret" };
  }
  const supplied = input.signatureHeader?.trim();
  if (!supplied) return { ok: false, algorithm: "sha256", reason: "missing_signature" };
  if (!supplied.startsWith("sha256=")) {
    return { ok: false, algorithm: "sha256", reason: "unsupported_algorithm" };
  }

  const expectedDigest = createHmac("sha256", input.secret).update(input.body).digest("hex");
  const expected = Buffer.from(`sha256=${expectedDigest}`, "utf8");
  const actual = Buffer.from(supplied, "utf8");
  if (actual.byteLength !== expected.byteLength) {
    return { ok: false, algorithm: "sha256", reason: "length_mismatch" };
  }
  if (!timingSafeEqual(actual, expected)) {
    return { ok: false, algorithm: "sha256", reason: "digest_mismatch" };
  }
  return { ok: true, algorithm: "sha256" };
}
