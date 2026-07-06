import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";
import {
  buildVersionUpActivationRehearsalPacket,
  buildVersionUpSecurityChecklistPacket,
  type VersionUpActivationPacket,
} from "./version-up-readiness";

const READ_ONLY_SHARE_PLAN_ID = "PLAN-L7-146-serverless-readonly-share";

export interface VersionUpActivationReviewBundleFile {
  path:
    | "activation-packet.json"
    | "activation-rehearsal.json"
    | "security-checklist.json"
    | "version-dry-run-evidence.json"
    | "readonly-share-index.html"
    | "readonly-share-manifest.json"
    | "activation-review-manifest.json";
  mediaType: "application/json; charset=utf-8" | "text/html; charset=utf-8";
  bytes: number;
  sha256: string;
  content: string;
}

export interface VersionUpActivationReviewBundle {
  schemaVersion: "version-up-activation-review-bundle.v1";
  planId: string;
  planOnly: true;
  mustNotApply: true;
  activationAllowed: false;
  applyCommandAvailable: false;
  writePolicy: "local-artifact-write";
  generatedAt: string;
  activationSnapshotId: string;
  files: VersionUpActivationReviewBundleFile[];
  blockedUntil: string[];
}

export function buildVersionUpActivationReviewBundle(
  packet: VersionUpActivationPacket,
): VersionUpActivationReviewBundle {
  const rehearsal = buildVersionUpActivationRehearsalPacket(packet);
  const securityChecklist = buildVersionUpSecurityChecklistPacket(packet);
  const payloads = [
    ["activation-packet.json", packet],
    ["activation-rehearsal.json", rehearsal],
    ["security-checklist.json", securityChecklist],
    ["version-dry-run-evidence.json", packet.versionDryRunEvidence],
  ] as const;
  const packetFiles = payloads.map(([path, payload]) => versionUpBundleFile(path, payload));
  const shareFiles =
    packet.planId === READ_ONLY_SHARE_PLAN_ID ? buildReadonlyShareBundleReviewFiles() : [];
  const files = [...packetFiles, ...shareFiles];
  const manifest = {
    schemaVersion: "version-up-activation-review-bundle.v1",
    planId: packet.planId,
    planOnly: true,
    mustNotApply: true,
    activationAllowed: false,
    applyCommandAvailable: false,
    writePolicy: "local-artifact-write",
    generatedAt: packet.generatedAt,
    activationSnapshotId: packet.activationSnapshot.snapshotId,
    activationSnapshotHeadSha: packet.activationSnapshot.headSha,
    activationReadinessSummary: packet.activationReadinessSummary,
    blockedReasons: packet.blockedReasons,
    blockedUntil: [
      ...rehearsal.blockedUntil,
      ...securityChecklist.blockedUntil,
      ...(shareFiles.length > 0
        ? [
            "readonly share bundle manifest must remain planOnly=true, mustNotDeploy=true, readOnly=true, noSecretOrPiiProjection=true, and noProdWrite=true",
          ]
        : []),
      "action_binding_approval_record must cite the current activationSnapshot.snapshotId before external activation",
      "this bundle is review material only and does not authorize Cloudflare/GitHub/secret/access-control changes",
    ],
    files: files.map(({ content: _content, ...file }) => file),
  };
  return {
    schemaVersion: "version-up-activation-review-bundle.v1",
    planId: packet.planId,
    planOnly: true,
    mustNotApply: true,
    activationAllowed: false,
    applyCommandAvailable: false,
    writePolicy: "local-artifact-write",
    generatedAt: packet.generatedAt,
    activationSnapshotId: packet.activationSnapshot.snapshotId,
    files: [...files, versionUpBundleFile("activation-review-manifest.json", manifest)],
    blockedUntil: manifest.blockedUntil,
  };
}

function versionUpBundleFile(
  path: VersionUpActivationReviewBundleFile["path"],
  payload: unknown,
): VersionUpActivationReviewBundleFile {
  const content = `${JSON.stringify(payload, null, 2)}\n`;
  return versionUpBundleRawFile(path, "application/json; charset=utf-8", content);
}

function versionUpBundleRawFile(
  path: VersionUpActivationReviewBundleFile["path"],
  mediaType: VersionUpActivationReviewBundleFile["mediaType"],
  content: string,
): VersionUpActivationReviewBundleFile {
  return {
    path,
    mediaType,
    bytes: Buffer.byteLength(content, "utf8"),
    sha256: `sha256:${createHash("sha256").update(content).digest("hex")}`,
    content,
  };
}

function buildReadonlyShareBundleReviewFiles(): VersionUpActivationReviewBundleFile[] {
  const html = [
    "<!doctype html>",
    '<html lang="ja">',
    "<head>",
    '  <meta charset="utf-8">',
    "  <title>HELIX read-only share review</title>",
    "</head>",
    "<body>",
    '  <main data-plan-only="true" data-read-only="true">',
    "    <h1>HELIX read-only share review</h1>",
    "  </main>",
    "</body>",
    "</html>",
    "",
  ].join("\n");
  const htmlSha256 = createHash("sha256").update(html).digest("hex");
  const manifest = {
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
    generatedAt: new Date().toISOString(),
    pollIntervalSec: 30,
    screenCount: 0,
    commonCount: 0,
    specificCount: 0,
    htmlSha256,
    activation: {
      cloudflareDeployApproved: false,
      githubWebhookApproved: false,
      secretBindingApproved: false,
      accessControlApproved: false,
    },
  };
  return [
    versionUpBundleRawFile("readonly-share-index.html", "text/html; charset=utf-8", html),
    versionUpBundleRawFile(
      "readonly-share-manifest.json",
      "application/json; charset=utf-8",
      `${JSON.stringify(manifest, null, 2)}\n`,
    ),
  ];
}
