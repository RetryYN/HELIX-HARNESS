import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Command } from "commander";
import { parse as parseYaml } from "yaml";
import {
  decideDeliveryRoute,
  evaluateRouteCommand,
  type RouteApprovalPolicy,
  type RouteConfigViolation,
  type RouteEvalResult,
  type RouteSignalEntry,
  validateRouteConfigText,
} from "../../workflow/contracts";

export function registerRouteCommands(program: Command): void {
  function loadRouteApprovalPolicy(repoRoot: string): RouteApprovalPolicy | undefined {
    const policyPath = join(repoRoot, ".helix", "config", "approval-policy.yaml");
    if (!existsSync(policyPath)) return undefined;
    const parsed = parseYaml(readFileSync(policyPath, "utf8")) as Partial<RouteApprovalPolicy>;
    if (!Array.isArray(parsed.rules)) return undefined;
    return {
      rules: parsed.rules
        .filter(
          (rule) => rule && typeof rule.mode === "string" && Array.isArray(rule.required_approvers),
        )
        .map((rule) => ({
          mode: String(rule.mode),
          ...(typeof rule.condition === "string" ? { condition: rule.condition } : {}),
          required_approvers: rule.required_approvers.map(String),
        })),
      approvals: Array.isArray(parsed.approvals)
        ? parsed.approvals
            .filter(
              (approval) =>
                approval &&
                typeof approval.mode === "string" &&
                typeof approval.approver === "string" &&
                typeof approval.approved_at === "string",
            )
            .map((approval) => ({
              mode: String(approval.mode),
              ...(typeof approval.condition === "string" ? { condition: approval.condition } : {}),
              approver: String(approval.approver),
              approved_at: String(approval.approved_at),
              ...(typeof approval.subject === "string" ? { subject: approval.subject } : {}),
            }))
        : [],
    };
  }

  function appendRouteApprovalAudit(repoRoot: string, evaluated: RouteEvalResult): string {
    const auditDir = join(repoRoot, ".helix", "audit");
    mkdirSync(auditDir, { recursive: true });
    const auditPath = join(auditDir, "route-approval.jsonl");
    appendFileSync(
      auditPath,
      `${JSON.stringify({
        event: "route_approval_blocked",
        occurred_at: new Date().toISOString(),
        signal: evaluated.signal,
        mode: evaluated.mode,
        approval_status: evaluated.approval.status,
        required_approvers: evaluated.approval.required_approvers,
        missing_approvers: evaluated.approval.missing_approvers,
        recommended_command: evaluated.recommended_command,
      })}\n`,
    );
    return auditPath;
  }

  function loadRouteMap(
    repoRoot: string,
    explicitPath?: string,
  ): { routes?: RouteSignalEntry[]; violations: RouteConfigViolation[] } {
    const routeMapPath = explicitPath ?? join(repoRoot, ".helix", "config", "route-map.yaml");
    if (!existsSync(routeMapPath)) return { violations: [] };
    const text = readFileSync(routeMapPath, "utf8");
    const violations = validateRouteConfigText({ path: routeMapPath, text });
    const parsed = parseYaml(text) as {
      routes?: Partial<RouteSignalEntry>[];
    };
    if (!Array.isArray(parsed.routes)) return { violations };
    return {
      violations,
      routes: parsed.routes
        .filter(
          (route) =>
            route &&
            Array.isArray(route.tokens) &&
            typeof route.mode === "string" &&
            typeof route.command === "string",
        )
        .map((route) => ({
          tokens: route.tokens?.map(String) ?? [],
          mode: String(route.mode),
          command: String(route.command),
          preflight: route.preflight !== false,
          requiresApproval: route.requiresApproval === true,
        })),
    };
  }

  const routeCommand = program.command("route").description("signal routing");
  routeCommand
    .command("delivery")
    .description("bind the production delivery route to the L3 requirement approval")
    .requiredOption("--plan <id>", "L3 PLAN id")
    .requiredOption("--slice-after <layer>", "L3, L5, or none")
    .option("--l3-receipt <receipt>", "approved L3 requirement receipt")
    .option("--route-approval <receipt>", "user route approval receipt from the L3 freeze")
    .option("--discovery", "select isolated Discovery PoC")
    .option("--format <format>", "output format: text or json", "text")
    .action(
      (opts: {
        plan: string;
        sliceAfter: string;
        l3Receipt?: string;
        routeApproval?: string;
        discovery?: boolean;
        format?: string;
      }) => {
        if (!(["L3", "L5", "none"] as const).includes(opts.sliceAfter as "L3" | "L5" | "none")) {
          process.stderr.write("route delivery: --slice-after must be L3, L5, or none\n");
          process.exitCode = 1;
          return;
        }
        const evaluated = decideDeliveryRoute({
          plan_id: opts.plan,
          discovery: opts.discovery,
          slice_after_layer: opts.sliceAfter as "L3" | "L5" | "none",
          l3_requirement_receipt: opts.l3Receipt,
          user_route_approval_receipt: opts.routeApproval,
        });
        if (opts.format === "json") {
          process.stdout.write(`${JSON.stringify(evaluated, null, 2)}\n`);
        } else if (evaluated.ok) {
          process.stdout.write(
            `route=${evaluated.route}\ndecision_digest=${evaluated.route_decision_digest}\n`,
          );
        } else {
          process.stderr.write(
            `${evaluated.findings.map((finding) => `${finding.code}: ${finding.message}`).join("\n")}\n`,
          );
        }
        process.exitCode = evaluated.ok ? 0 : 1;
      },
    );
  routeCommand
    .command("eval")
    .description("evaluate a signal into a mode and RecommendedCommandV1")
    .requiredOption("--signal <signal>", "observed signal")
    .option("--env <env>", "runtime environment")
    .option("--drift-type <type>", "drift subtype")
    .option("--route-map <path>", "route-map YAML override")
    .option("--format <format>", "output format: text or json", "text")
    .action(
      (opts: {
        signal: string;
        env?: string;
        driftType?: string;
        routeMap?: string;
        format?: string;
      }) => {
        const repoRoot = process.cwd();
        const routeMap = loadRouteMap(repoRoot, opts.routeMap);
        const evaluated = evaluateRouteCommand({
          signal: opts.signal,
          env: opts.env,
          drift_type: opts.driftType,
          approval_policy: loadRouteApprovalPolicy(repoRoot),
          route_map: routeMap.routes,
          route_config_violations: routeMap.violations,
        });
        const auditPath =
          evaluated.exit_code === 1 ? appendRouteApprovalAudit(repoRoot, evaluated) : "";
        if (opts.format === "json") {
          process.stdout.write(
            `${JSON.stringify(auditPath ? { ...evaluated, audit_path: auditPath } : evaluated, null, 2)}\n`,
          );
        } else if (evaluated.recommended_command) {
          process.stdout.write(`mode=${evaluated.mode}\n`);
          process.stdout.write(`suggest_command=${evaluated.suggest_command}\n`);
          process.stdout.write(`command=${evaluated.recommended_command.command}\n`);
          if (auditPath) process.stderr.write(`human approval blocked; audit=${auditPath}\n`);
        } else {
          process.stderr.write(`${evaluated.suggest_command}\n`);
        }
        process.exitCode = evaluated.exit_code;
      },
    );
}
