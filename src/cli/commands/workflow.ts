import type { Command } from "commander";
import {
  buildWorkflowGuide,
  renderWorkflowGuideText,
  workflowModelIds,
} from "../../workflow/workflow-guide";

export function registerWorkflowCommands(program: Command): void {
  const workflow = program
    .command("workflow")
    .description("requirements-owned typed workflow surfaces");
  workflow
    .command("guide")
    .description("generate a bounded guide from a workflow_model identity")
    .requiredOption("--workflow <workflow_model_id>", "workflow_model identity")
    .option("--signal <signal>", "optional entry signal; must bind to the selected identity")
    .option("--style <development_style_id>", "optional development_style identity")
    .option("--case <case_driven_model_id>", "optional case_driven_model identity")
    .option("--subroute <subroute_id>", "optional subroute identity")
    .option("--drive <specialist_drive>", "optional specialist drive: be|fe|fullstack|db|agent")
    .option("--format <format>", "output format: text or json", "text")
    .action(
      (opts: {
        workflow: string;
        signal?: string;
        style?: string;
        case?: string;
        subroute?: string;
        drive?: string;
        format?: string;
      }) => {
        if (opts.format !== "text" && opts.format !== "json") {
          process.stderr.write("workflow guide: --format must be text or json\n");
          process.exitCode = 2;
          return;
        }
        const result = buildWorkflowGuide({
          workflow: opts.workflow,
          signal: opts.signal,
          development_style: opts.style,
          case_driven_model: opts.case,
          subroute: opts.subroute,
          specialist_drive: opts.drive,
          repo_root: process.cwd(),
        });
        if (opts.format === "json") {
          process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
        } else if (result.guide) {
          process.stdout.write(`${renderWorkflowGuideText(result.guide)}\n`);
        } else {
          for (const item of result.findings) {
            process.stderr.write(`[${item.severity}] ${item.code}: ${item.message}\n`);
          }
          process.stderr.write(
            `workflow guide: supported workflow_model=${workflowModelIds().join("|")}\n`,
          );
        }
        process.exitCode = result.exit_code;
      },
    );
}
