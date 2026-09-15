import type { Command } from "commander";
import {
  auditIdentifierRenameBlastRadius,
  buildIdentifierRenameApprovalDraft,
  buildIdentifierRenameCutoverPlan,
  buildIdentifierRenameDistSmokeDryRun,
  buildIdentifierRenameEvidencePack,
  buildIdentifierRenameMonitoringDryRun,
  buildIdentifierRenameRehearsalPlan,
  buildIdentifierRenameStateBackupDryRun,
} from "../../lint/identifier-rename";
import { packetFreshnessLine, verificationSourceLines, writeRecordTemplates } from "../helpers";

export function registerRenameCommands(program: Command): void {
  const rename = program.command("rename").description("HELIX identifier rename audit surfaces");
  rename
    .command("audit")
    .description("measure helix/.helix/area=helix blast radius before PLAN-M-02 cutover")
    .option("--json", "JSON output")
    .action((opts: { json?: boolean }) => {
      const audit = auditIdentifierRenameBlastRadius(process.cwd());
      if (opts.json) {
        process.stdout.write(`${JSON.stringify(audit, null, 2)}\n`);
        return;
      }
      process.stdout.write(
        `rename audit: status=${audit.status} totalHits=${audit.totalHits} cutoverApproved=${audit.cutoverApproved} approvalRecordsConcrete=${audit.approvalRecordsConcrete}\n`,
      );
      for (const token of audit.tokens) {
        process.stdout.write(
          `  ${token}: hits=${audit.hitsByToken[token]} files=${audit.filesByToken[token]} pathHits=${audit.pathHitsByToken[token]} pathEntries=${audit.pathEntriesByToken[token]} contentHits=${audit.contentHitsByToken[token]} contentFiles=${audit.contentFilesByToken[token]}\n`,
        );
      }
      for (const category of audit.hitsByCategory) {
        process.stdout.write(
          `  category ${category.category}: hits=${category.hits} files=${category.files}\n`,
        );
      }
      const blockedPathRenameEntries = audit.pathRenameEntries.filter(
        (entry) => entry.disposition === "blocked_pending_cutover_approval",
      );
      const manualPathRenameEntries = audit.pathRenameEntries.filter(
        (entry) => entry.disposition === "manual_review_required",
      );
      process.stdout.write(
        `  path-renames: entries=${audit.pathRenameEntries.length} blocked=${blockedPathRenameEntries.length} manualReview=${manualPathRenameEntries.length}\n`,
      );
      for (const residual of audit.residualsByDisposition) {
        process.stdout.write(
          `  residual ${residual.disposition}: hits=${residual.hits} files=${residual.files}\n`,
        );
      }
      if (!audit.cutoverApproved) {
        process.stdout.write(
          `  required: ${audit.requiredRecords.join(", ")} before 旧 state path -> .helix apply\n`,
        );
      }
    });
  rename
    .command("rehearsal")
    .description("emit a no-write HELIX identifier rename rehearsal packet")
    .option("--no-write", "confirm this command must not mutate files or state")
    .option("--target <target>", "target CLI name", "helix")
    .option("--json", "JSON output")
    .action((opts: { write?: boolean; target?: string; json?: boolean }) => {
      if (opts.write !== false) {
        process.stderr.write("rename rehearsal requires --no-write\n");
        process.exitCode = 1;
        return;
      }
      if (opts.target !== "helix") {
        process.stderr.write("rename rehearsal currently supports --target helix only\n");
        process.exitCode = 1;
        return;
      }
      const packet = buildIdentifierRenameRehearsalPlan(process.cwd(), "helix");
      if (opts.json) {
        process.stdout.write(`${JSON.stringify(packet, null, 2)}\n`);
        return;
      }
      process.stdout.write(
        `rename rehearsal: target=${packet.target} planOnly=${packet.planOnly} mustNotApply=${packet.mustNotApply} writePolicy=${packet.writePolicy}\n`,
      );
      process.stdout.write(
        `  preview-categories=${packet.previewCategories.length} preview-commands=${packet.previewCommands.length}\n`,
      );
      for (const command of packet.previewCommands) {
        process.stdout.write(
          `  preview-command: ${command.phase} command=${command.command} writesRepo=${command.writesRepo} evidence=${command.evidencePath} description=${command.description}\n`,
        );
      }
      for (const blocker of packet.blockedUntil) {
        process.stdout.write(`  blocked-until: ${blocker}\n`);
      }
    });
  rename
    .command("state-backup")
    .description(
      "emit a no-write state backup and restore-drill packet for HELIX identifier rename",
    )
    .requiredOption("--dry-run", "confirm no state backup files are written")
    .option("--restore-drill", "include restore drill requirements")
    .option("--json", "JSON output")
    .action((opts: { dryRun?: boolean; restoreDrill?: boolean; json?: boolean }) => {
      if (!opts.dryRun) {
        process.stderr.write("rename state-backup requires --dry-run\n");
        process.exitCode = 1;
        return;
      }
      const packet = buildIdentifierRenameStateBackupDryRun(
        process.cwd(),
        Boolean(opts.restoreDrill),
      );
      if (opts.json) {
        process.stdout.write(`${JSON.stringify(packet, null, 2)}\n`);
        return;
      }
      process.stdout.write(
        `rename state-backup: planOnly=${packet.planOnly} mustNotApply=${packet.mustNotApply} writePolicy=${packet.writePolicy} restoreDrill=${packet.restoreDrillRequested}\n`,
      );
      process.stdout.write(
        `  manifest=${packet.manifest.length} restore-checks=${packet.restoreChecks.length}\n`,
      );
      for (const check of packet.restoreChecks) {
        process.stdout.write(
          `  restore-check: ${check.path} exists=${check.sourceExists} evidence=${check.restoreEvidencePath}\n`,
        );
      }
      for (const blocker of packet.blockedUntil) {
        process.stdout.write(`  blocked-until: ${blocker}\n`);
      }
    });
  rename
    .command("dist-smoke")
    .description("emit a no-write compiled binary smoke packet for HELIX identifier rename")
    .option("--no-write", "confirm this command must not mutate files or state")
    .option("--target <target>", "target CLI name", "helix")
    .option("--json", "JSON output")
    .action((opts: { write?: boolean; target?: string; json?: boolean }) => {
      if (opts.write !== false) {
        process.stderr.write("rename dist-smoke requires --no-write\n");
        process.exitCode = 1;
        return;
      }
      if (opts.target !== "helix") {
        process.stderr.write("rename dist-smoke currently supports --target helix only\n");
        process.exitCode = 1;
        return;
      }
      const packet = buildIdentifierRenameDistSmokeDryRun(process.cwd(), "helix");
      if (opts.json) {
        process.stdout.write(`${JSON.stringify(packet, null, 2)}\n`);
        return;
      }
      process.stdout.write(
        `rename dist-smoke: target=${packet.target} planOnly=${packet.planOnly} mustNotApply=${packet.mustNotApply} writePolicy=${packet.writePolicy}\n`,
      );
      process.stdout.write(
        `  current=${packet.currentBinary.path} exists=${packet.currentBinary.exists} renamed=${packet.renamedBinaryPreview.path} exists=${packet.renamedBinaryPreview.exists}\n`,
      );
      process.stdout.write(
        `  current-smoke: ${packet.currentBinary.smokeCommand}\n  renamed-after-approval: ${packet.renamedBinaryPreview.smokeCommandAfterApproval}\n`,
      );
      process.stdout.write(
        `  setup-after-approval: ${packet.postCutoverConsumerSetupPreview.commandAfterApproval}\n  setup-current-proxy: ${packet.postCutoverConsumerSetupPreview.currentNoWriteProxyCommand}\n`,
      );
      for (const blocker of packet.blockedUntil) {
        process.stdout.write(`  blocked-until: ${blocker}\n`);
      }
    });
  rename
    .command("monitoring")
    .description("emit a no-write post-cutover monitoring packet for HELIX identifier rename")
    .option("--no-write", "confirm this command must not mutate files or state")
    .option("--json", "JSON output")
    .action((opts: { write?: boolean; json?: boolean }) => {
      if (opts.write !== false) {
        process.stderr.write("rename monitoring requires --no-write\n");
        process.exitCode = 1;
        return;
      }
      const packet = buildIdentifierRenameMonitoringDryRun();
      if (opts.json) {
        process.stdout.write(`${JSON.stringify(packet, null, 2)}\n`);
        return;
      }
      process.stdout.write(
        `rename monitoring: planOnly=${packet.planOnly} mustNotApply=${packet.mustNotApply} writePolicy=${packet.writePolicy} probes=${packet.probes.length}\n`,
      );
      process.stdout.write(
        `  quiet-window: required=${packet.quietWindow.required} concurrency=${packet.quietWindow.concurrencyPolicy} approvalExpiresOnSignalChange=${packet.quietWindow.approvalExpiresOnSignalChange}\n`,
      );
      process.stdout.write(`  evidence: ${packet.requiredEvidencePath}\n`);
      for (const probe of packet.probes) {
        process.stdout.write(
          `  monitoring-probe: ${probe.phase} afterApproval=${probe.commandAfterApproval} proxy=${probe.currentNoWriteProxyCommand} rollbackTrigger=${probe.rollbackTrigger}\n`,
        );
      }
      for (const blocker of packet.blockedUntil) {
        process.stdout.write(`  blocked-until: ${blocker}\n`);
      }
    });
  rename
    .command("approval-draft")
    .description(
      "emit a non-authorizing PLAN-M-02 cutover approval record draft bound to current evidence",
    )
    .option("--json", "JSON output")
    .action((opts: { json?: boolean }) => {
      const packet = buildIdentifierRenameApprovalDraft(process.cwd());
      if (opts.json) {
        process.stdout.write(`${JSON.stringify(packet, null, 2)}\n`);
        return;
      }
      process.stdout.write(
        `rename approval-draft: recommendedOutcome=${packet.recommendedOutcome} approvalAllowed=${packet.approvalAllowed} applyAuthorized=${packet.applyAuthorized} evidence=${packet.currentSnapshot.evidenceArtifactsPresent}/${packet.currentSnapshot.evidenceArtifactsRequired} clean=${packet.currentSnapshot.worktreeClean}\n`,
      );
      process.stdout.write(packetFreshnessLine(packet));
      process.stdout.write(
        `  current-snapshot: ${packet.currentSnapshot.cutoverSnapshotId} head=${packet.currentSnapshot.repoHeadSha ?? "-"} dirtyPathCount=${packet.currentSnapshot.worktreeDirtyPathCount} evidenceDigest=${packet.currentSnapshot.evidenceDigest}\n`,
      );
      for (const record of packet.draftRecords) {
        process.stdout.write(
          `  approval-draft-record: ${record.recordName} pasteReady=${record.pasteReady} unsafeToTreatAsApproval=${record.unsafeToTreatAsApproval}\n`,
        );
        process.stdout.write(`    hint-ja: ${record.insertionHintJa}\n`);
        for (const line of record.yamlLines) {
          process.stdout.write(`    ${line}\n`);
        }
      }
      for (const blocker of packet.blockedUntil) {
        process.stdout.write(`  blocked-until: ${blocker}\n`);
      }
      for (const related of packet.relatedDecisionPackets) {
        process.stdout.write(
          `  related-packet: ${related.role} ${related.command} scoped=${related.scopedCommand ?? related.command} (${related.reason})\n`,
        );
      }
    });
  rename
    .command("evidence-pack")
    .description("generate or preview local evidence artifacts for PLAN-M-02 rename cutover review")
    .option("--dry-run", "preview generated evidence without writing files")
    .option("--write", "write safe local evidence artifacts under .helix/evidence/rename")
    .option("--json", "JSON output")
    .action((opts: { dryRun?: boolean; write?: boolean; json?: boolean }) => {
      if (Boolean(opts.dryRun) === Boolean(opts.write)) {
        process.stderr.write("rename evidence-pack requires exactly one of --dry-run or --write\n");
        process.exitCode = 1;
        return;
      }
      const packet = buildIdentifierRenameEvidencePack(process.cwd(), {
        write: Boolean(opts.write),
      });
      if (opts.json) {
        process.stdout.write(`${JSON.stringify(packet, null, 2)}\n`);
        return;
      }
      process.stdout.write(
        `rename evidence-pack: writePolicy=${packet.writePolicy} generated=${packet.generatedArtifacts.length} pending=${packet.pendingArtifacts.length} appliesCutover=${packet.appliesCutover} approvalStillRequired=${packet.approvalStillRequired}\n`,
      );
      for (const artifact of packet.generatedArtifacts) {
        process.stdout.write(
          `  generated-artifact: ${artifact.path} written=${artifact.written} schema=${artifact.schemaVersion} sha256=${artifact.contentSha256} bytes=${artifact.sizeBytes}\n`,
        );
      }
      for (const artifact of packet.pendingArtifacts) {
        process.stdout.write(
          `  pending-artifact: ${artifact.path} command=${artifact.requiredCommand} reason=${artifact.reason}\n`,
        );
      }
      for (const blocker of packet.blockedUntil) {
        process.stdout.write(`  blocked-until: ${blocker}\n`);
      }
    });
  rename
    .command("plan")
    .description("emit a non-destructive PLAN-M-02 cutover packet without applying rename")
    .option("--json", "JSON output")
    .action((opts: { json?: boolean }) => {
      const plan = buildIdentifierRenameCutoverPlan(process.cwd());
      if (opts.json) {
        process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
        return;
      }
      process.stdout.write(
        `rename plan: status=${plan.status} planOnly=${plan.planOnly} approvalMaterialReady=${plan.approvalMaterialReady} applyAuthorized=${plan.applyAuthorized} mustNotApply=${plan.mustNotApply}\n`,
      );
      process.stdout.write(packetFreshnessLine(plan));
      process.stdout.write(
        `  dry-run=${plan.dryRunPlan.length} rollback=${plan.rollbackPlan.length} monitoring=${plan.monitoringPlan.length}\n`,
      );
      process.stdout.write(
        `  source-ledger: label=${plan.sourceLedgerFreshness.ledgerLabel} checked=${plan.sourceLedgerFreshness.checkedDate ?? "-"} stale=${plan.sourceLedgerFreshness.stale ? "yes" : "no"} rows=${plan.sourceLedgerFreshness.rowCount} missing=${plan.sourceLedgerFreshness.missingRows.length} rowsDigest=${plan.sourceLedgerFreshness.rowsDigest}\n`,
      );
      process.stdout.write(
        `  cutover-checklist=${plan.cutoverCategoryChecklist.length} runbook=${plan.cutoverRunbook.length} verification-commands=${plan.verificationCommandMatrix.length}\n`,
      );
      writeRecordTemplates(plan.recordTemplates, "  ");
      process.stdout.write(verificationSourceLines(plan.verificationCommandMatrix));
      process.stdout.write(
        `  snapshot-review: current=${plan.snapshotReview.currentSnapshotId} recordedCutover=${plan.snapshotReview.recordedCutoverSnapshotId ?? "-"} recordedActionBinding=${plan.snapshotReview.recordedActionBindingSnapshotId ?? "-"} drift=${plan.snapshotReview.driftWarning ? "yes" : "no"}\n`,
      );
      process.stdout.write(
        `  cutover-snapshot-head: ${plan.cutoverSnapshot.repoHeadSha ?? "-"} digest=${plan.cutoverSnapshot.headDigest ?? "-"} sourceLedgerRowsDigest=${plan.cutoverSnapshot.sourceLedgerRowsDigest} blastRadiusDigest=${plan.cutoverSnapshot.blastRadiusDigest} approvalScopeDigest=${plan.cutoverSnapshot.approvalScopeDigest} evidenceDigest=${plan.cutoverSnapshot.evidenceDigest}\n`,
      );
      process.stdout.write(
        `  cutover-snapshot-worktree: readable=${plan.cutoverSnapshot.worktreeStatusReadable ? "yes" : "no"} clean=${plan.cutoverSnapshot.worktreeClean ? "yes" : "no"} dirtyPathCount=${plan.cutoverSnapshot.worktreeDirtyPathCount} statusDigest=${plan.cutoverSnapshot.worktreeStatusDigest ?? "-"}\n`,
      );
      process.stdout.write(
        `  cutover-snapshot-evidence: required=${plan.cutoverSnapshot.evidenceArtifactsRequired} present=${plan.cutoverSnapshot.evidenceArtifactsPresent} missing=${plan.cutoverSnapshot.missingEvidenceArtifacts.length} artifactsDigest=${plan.cutoverSnapshot.evidenceArtifactsDigest}\n`,
      );
      if (plan.blockedReasons.length > 0) {
        for (const reason of plan.blockedReasons) process.stdout.write(`  blocked: ${reason}\n`);
      }
      for (const related of plan.relatedDecisionPackets) {
        process.stdout.write(
          `  related-packet: ${related.role} ${related.command} scoped=${related.scopedCommand ?? related.command} (${related.reason})\n`,
        );
      }
    });
}
