import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Command } from "commander";
import { defaultHarnessDbPath, openHarnessDb } from "../../state-db/index";
import { migrate } from "../../state-db/migration";
import { activatePo7Decision } from "../../state-db/po7-decision-activation";
import { commitPostPoDesignFreezeTransition } from "../../state-db/post-po-design-freeze-transition";
import { commitPostPoDesignFreezeTransitionV2 } from "../../state-db/post-po-design-freeze-transition-v2";
import { createHash } from "node:crypto";
import { HARNESS_DB_TABLE_BY_NAME } from "../../schema/harness-db";

export function registerAuthorityCommands(program: Command): void {
  const authority = program.command("authority").description("authority receipt operations");
  authority.command("po7-activate")
    .description("activate Universal A×6 and VMAUTH approval from current repo-owned GO custody")
    .requiredOption("--operation-id <id>")
    .requiredOption("--idempotency-key <key>")
    .option("--expected-epoch <number>", "expected current authority epoch", "0")
    .option("--expected-previous-event <sha256>")
    .option("--execute", "write the single-transaction activation to .helix/harness.db")
    .option("--receipt-out <path>", "write the returned receipt JSON (requires --execute)")
    .option("--json", "print JSON")
    .action((opts: { operationId: string; idempotencyKey: string; expectedEpoch: string; expectedPreviousEvent?: string; execute?: boolean; receiptOut?: string; json?: boolean }) => {
      const repoRoot = process.cwd(); const epoch = Number(opts.expectedEpoch);
      if (!Number.isInteger(epoch) || epoch < 0) throw new Error("--expected-epoch must be a non-negative integer");
      if (opts.receiptOut && !opts.execute) throw new Error("--receipt-out requires --execute");
      const db = openHarnessDb(opts.execute ? defaultHarnessDbPath(repoRoot) : ":memory:", { repoRoot });
      try {
        migrate(db);
        const receipt = activatePo7Decision(db, { repoRoot, operationId: opts.operationId, idempotencyKey: opts.idempotencyKey, expectedActivationEpoch: epoch, expectedPreviousEventDigest: opts.expectedPreviousEvent ?? null });
        const operationId = receipt.operationId;
        const evidence = {
          operation: db.prepare("SELECT * FROM po7_activation_operations WHERE operation_id=?").get(operationId),
          group_receipts: db.prepare("SELECT * FROM po7_group_option_receipts WHERE operation_id=? ORDER BY decision_group_id").all(operationId),
          question_receipts: db.prepare("SELECT * FROM po7_question_answer_receipts WHERE operation_id=? ORDER BY question_id").all(operationId),
          vmodel_event: db.prepare("SELECT * FROM po7_vmodel_authority_events WHERE operation_id=?").get(operationId),
          projection: db.prepare("SELECT * FROM po7_activation_projections WHERE operation_id=?").get(operationId),
          terminal: db.prepare("SELECT * FROM po7_activation_terminal_receipts WHERE operation_id=?").get(operationId),
        };
        const output = { schema_version: "helix.po7-activation-command-receipt.v1", executed: opts.execute === true, db_path: opts.execute ? ".helix/harness.db" : ":memory:", ...receipt, evidence };
        const rendered = `${JSON.stringify(output, null, 2)}\n`;
        if (opts.receiptOut) writeFileSync(resolve(repoRoot, opts.receiptOut), rendered, "utf8");
        process.stdout.write(opts.json ? rendered : `PO7 activation ${opts.execute ? "executed" : "dry-run"}: epoch=${receipt.authorityEpoch} event=${receipt.eventDigest}\n`);
      } finally { db.close(); }
    });

  authority.command("design-freeze-transition")
    .description("commit the sealed PO7 to Design Freeze and local L01 pending-pair transition")
    .requiredOption("--operation-id <id>")
    .requiredOption("--idempotency-key <key>")
    .requiredOption("--expected-po7-event <sha256>")
    .option("--expected-epoch <number>", "expected PO7 authority epoch", "1")
    .option("--execute", "write the nine-boundary transaction to .helix/harness.db")
    .option("--receipt-out <path>")
    .option("--json")
    .action((opts: { operationId: string; idempotencyKey: string; expectedPo7Event: string; expectedEpoch: string; execute?: boolean; receiptOut?: string; json?: boolean }) => {
      const repoRoot = process.cwd(); const epoch = Number(opts.expectedEpoch);
      if (!Number.isInteger(epoch) || epoch <= 0) throw new Error("--expected-epoch must be a positive integer");
      if (opts.receiptOut && !opts.execute) throw new Error("--receipt-out requires --execute");
      const db = openHarnessDb(opts.execute ? defaultHarnessDbPath(repoRoot) : ":memory:", { repoRoot });
      try {
        migrate(db);
        if (!opts.execute) activatePo7Decision(db, { repoRoot, operationId: "DRYRUN-PO7-SEED", idempotencyKey: "DRYRUN-PO7-SEED", expectedActivationEpoch: 0, expectedPreviousEventDigest: null });
        const po7Event = opts.execute ? opts.expectedPo7Event : String(db.prepare("SELECT event_digest FROM po7_vmodel_authority_events WHERE status='active'").get()?.event_digest);
        const receipt = commitPostPoDesignFreezeTransition(db, { repoRoot, operationId: opts.operationId, idempotencyKey: opts.idempotencyKey, expectedAuthorityEpoch: epoch, expectedPo7EventDigest: po7Event });
        const evidence = Object.fromEntries(["design_freeze_transition_operations","design_freeze_authority_link_events","design_freeze_receipts","design_freeze_projections","design_freeze_progress_projections","design_freeze_l01_candidates","design_freeze_l01_handoffs","design_freeze_transition_outbox","design_freeze_transition_terminal_receipts"].map((table) => [table, db.prepare(`SELECT * FROM ${table} WHERE operation_id=?`).get(receipt.operationId)]));
        const output = { schema_version: "helix.post-po-design-freeze-transition-command-receipt.v1", executed: opts.execute === true, db_path: opts.execute ? ".helix/harness.db" : ":memory:", ...receipt, evidence };
        const rendered = `${JSON.stringify(output, null, 2)}\n`; if (opts.receiptOut) writeFileSync(resolve(repoRoot, opts.receiptOut), rendered, "utf8");
        process.stdout.write(opts.json ? rendered : `Design Freeze transition ${opts.execute ? "executed" : "dry-run"}: freeze=${receipt.freezeReceiptDigest} candidate=${receipt.candidateDigest}\n`);
      } finally { db.close(); }
    });

  authority.command("design-freeze-transition-v2")
    .description("commit the hardened four-head/19-slice/76-artifact Design Freeze transition")
    .requiredOption("--operation-id <id>").requiredOption("--idempotency-key <key>")
    .requiredOption("--expected-po7-event <sha256>").option("--expected-epoch <number>", "expected PO7 epoch", "1")
    .option("--expected-authority-head <sha256>").option("--expected-freeze-head <sha256>").option("--expected-progress-head <sha256>").option("--expected-candidate-head <sha256>").option("--supersedes-receipt <sha256>")
    .requiredOption("--expires-at <iso8601>").requiredOption("--receipt-out <path>").requiredOption("--full-row-export-out <path>")
    .option("--execute").option("--json")
    .action((opts: { operationId: string; idempotencyKey: string; expectedPo7Event: string; expectedEpoch: string; expectedAuthorityHead?: string; expectedFreezeHead?: string; expectedProgressHead?: string; expectedCandidateHead?: string; supersedesReceipt?: string; expiresAt: string; receiptOut: string; fullRowExportOut: string; execute?: boolean; json?: boolean }) => {
      if (!opts.execute) throw new Error("v2 transition requires --execute after a clean pushed HEAD preflight");
      const repoRoot=process.cwd();const epoch=Number(opts.expectedEpoch);const zero=createHash("sha256").update("genesis").digest("hex");const db=openHarnessDb(defaultHarnessDbPath(repoRoot),{repoRoot});
      try { migrate(db); const receipt=commitPostPoDesignFreezeTransitionV2(db,{repoRoot,operationId:opts.operationId,idempotencyKey:opts.idempotencyKey,expectedPo7Epoch:epoch,expectedPo7EventDigest:opts.expectedPo7Event,expectedHeads:{authority:opts.expectedAuthorityHead??zero,freeze:opts.expectedFreezeHead??zero,progress:opts.expectedProgressHead??zero,candidate:opts.expectedCandidateHead??zero},expiresAt:opts.expiresAt,supersedesReceiptDigest:opts.supersedesReceipt??zero});
        const v2Tables=["design_freeze_v2_transition_operations","design_freeze_v2_authority_link_events","design_freeze_v2_receipts","design_freeze_v2_projections","design_freeze_v2_progress_projections","design_freeze_v2_l01_candidates","design_freeze_v2_l01_handoffs","design_freeze_v2_transition_outbox","design_freeze_v2_transition_terminal_receipts"];
        const po7Tables=["po7_activation_operations","po7_activation_projections","po7_activation_terminal_receipts","po7_vmodel_authority_events","po7_group_option_receipts","po7_question_answer_receipts"];
        const tables=Object.fromEntries([...v2Tables.map((table)=>[table,db.prepare(`SELECT * FROM ${table} WHERE operation_id=?`).all(receipt.operationId)]),...po7Tables.map((table)=>[table,db.prepare(`SELECT * FROM ${table}`).all()])]);
        const column_orders=Object.fromEntries(v2Tables.map((table)=>[table,HARNESS_DB_TABLE_BY_NAME.get(table)?.columns.map((column)=>column.name)??[]]));const ordered_write_set=v2Tables.slice(0,-1).map((table)=>{const object=(tables[table] as any[])[0];return {table,row:column_orders[table].map((column)=>object[column])};});const op=(tables[v2Tables[0]] as any[])[0];
        const fullExport={schema_version:"helix.post-po-design-freeze-transition-full-row-export.v2",operation_id:receipt.operationId,tables,column_orders,ordered_write_set,digest_preimages:{[`${v2Tables[0]}.full_preimage_digest`]:JSON.parse(op.full_preimage_json),[`${v2Tables[2]}.full_preimage_digest`]:JSON.parse(op.full_preimage_json)}};const exportRendered=`${JSON.stringify(fullExport,null,2)}\n`;writeFileSync(resolve(repoRoot,opts.fullRowExportOut),exportRendered,"utf8");const exportSha=createHash("sha256").update(exportRendered).digest("hex");
        const output={schema_version:"helix.post-po-design-freeze-transition-command-receipt.v2",executed:true,db_path:".helix/harness.db",...receipt,fullRowExportPath:opts.fullRowExportOut,fullRowExportSha256:exportSha};const rendered=`${JSON.stringify(output,null,2)}\n`;writeFileSync(resolve(repoRoot,opts.receiptOut),rendered,"utf8");process.stdout.write(opts.json?rendered:`Design Freeze v2 current candidate=${receipt.candidateDigest}\n`);
      } finally {db.close();}
    });
}
