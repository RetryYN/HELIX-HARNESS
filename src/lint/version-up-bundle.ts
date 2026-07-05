import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";
import {
  buildVersionUpActivationRehearsalPacket,
  buildVersionUpSecurityChecklistPacket,
  type VersionUpActivationPacket,
} from "./version-up-readiness";

export interface VersionUpActivationReviewBundleFile {
  path:
    | "activation-packet.json"
    | "activation-rehearsal.json"
    | "security-checklist.json"
    | "version-dry-run-evidence.json"
    | "activation-review-manifest.json";
  mediaType: "application/json; charset=utf-8";
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
  const files = payloads.map(([path, payload]) => versionUpBundleFile(path, payload));
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
  return {
    path,
    mediaType: "application/json; charset=utf-8",
    bytes: Buffer.byteLength(content, "utf8"),
    sha256: `sha256:${createHash("sha256").update(content).digest("hex")}`,
    content,
  };
}
