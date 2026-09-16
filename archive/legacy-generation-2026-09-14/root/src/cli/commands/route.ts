import { appendFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import type { Command } from "commander";
import {
  evaluateWorkflowExecutionRoute,
  type WorkflowExecutionRoutingReceipt,
} from "../../workflow/contracts";

function parseExactBoolean(value: string | undefined): boolean | null {
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
}

export function buildWorkflowExecutionApprovalAuditEvent(
  signal: string,
  receipt: WorkflowExecutionRoutingReceipt,
  occurredAt: string = new Date().toISOString(),
) {
  return {
    event: "workflow_execution_approval_required" as const,
    occurred_at: occurredAt,
    signal,
    ...receipt,
  };
}

function appendApprovalAudit(
  repoRoot: string,
  signal: string,
  receipt: WorkflowExecutionRoutingReceipt,
): void {
  const auditDir = join(repoRoot, ".helix", "audit");
  mkdirSync(auditDir, { recursive: true });
  appendFileSync(
    join(auditDir, "route-approval.jsonl"),
    `${JSON.stringify(buildWorkflowExecutionApprovalAuditEvent(signal, receipt))}\n`,
  );
}

export function registerRouteCommands(program: Command): void {
  const routeCommand = program.command("route").description("typed workflow execution routing");
  routeCommand
    .command("eval")
    .description("resolve a signal through requirements-owned classification and execution policy")
    .requiredOption("--signal <signal>", "observed signal")
    .option("--execution-form <form>", "exact execution form: standard or pair_cell")
    .option("--production-impact <boolean>", "exact boolean: true or false")
    .option("--destructive-data-operation <boolean>", "exact boolean: true or false")
    .option("--credential-access <boolean>", "exact boolean: true or false")
    .option("--backend-derived <boolean>", "exact boolean: true or false")
    .option("--format <format>", "output format: text or json", "text")
    .action(
      (opts: {
        signal: string;
        executionForm?: string;
        productionImpact?: string;
        destructiveDataOperation?: string;
        credentialAccess?: string;
        backendDerived?: string;
        format?: string;
      }) => {
        if (opts.executionForm !== "standard" && opts.executionForm !== "pair_cell") {
          process.stderr.write(
            "route eval: --execution-form must be explicit (standard|pair_cell)\n",
          );
          process.exitCode = 2;
          return;
        }
        const exactConditions = {
          production_impact: parseExactBoolean(opts.productionImpact),
          destructive_data_operation: parseExactBoolean(opts.destructiveDataOperation),
          credential_access: parseExactBoolean(opts.credentialAccess),
          backend_derived: parseExactBoolean(opts.backendDerived),
        };
        const invalid = Object.entries(exactConditions)
          .filter(([, value]) => value === null)
          .map(([key]) => key);
        if (invalid.length > 0) {
          process.stderr.write(
            `route eval: exact boolean required (true|false): ${invalid.join(",")}\n`,
          );
          process.exitCode = 2;
          return;
        }
        if (opts.format !== "text" && opts.format !== "json") {
          process.stderr.write("route eval: --format must be text or json\n");
          process.exitCode = 2;
          return;
        }

        const receipt = evaluateWorkflowExecutionRoute({
          signal: opts.signal,
          execution_form: opts.executionForm,
          production_impact: exactConditions.production_impact as boolean,
          destructive_data_operation: exactConditions.destructive_data_operation as boolean,
          credential_access: exactConditions.credential_access as boolean,
          backend_derived: exactConditions.backend_derived as boolean,
          repo_root: process.cwd(),
        });
        if (receipt.disposition === "approval_required") {
          appendApprovalAudit(process.cwd(), opts.signal, receipt);
        }
        if (opts.format === "json") {
          process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);
        } else {
          for (const [key, value] of Object.entries(receipt)) {
            process.stdout.write(`${key}=${value === null ? "null" : String(value)}\n`);
          }
        }
        process.exitCode = receipt.exit_code;
      },
    );
}
